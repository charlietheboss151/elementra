import {
  type AccountClient,
  serverAccountClient,
} from "./accountApi";
import {
  applyProgress,
  emptyProgress,
  mergeProgress,
  readProgress,
} from "./accountProgress";
import type { ScoreboardStore } from "./scoreboard";
import {
  USERNAME_TAKEN,
  normalizeUsername,
  usernameLooksValid,
} from "./usernames";

export const AUTH_KEY = "elementra-accounts-v1";
export const SESSION_KEY = "elementra-session-v1";
export const TOKEN_KEY = "elementra-token-v1";

export type AuthResult = { ok: true } | { ok: false; error: string };

interface Account {
  salt: string;
  hash: string;
}

type AccountBook = Record<string, Account>;

function loadBook(store: ScoreboardStore): AccountBook {
  try {
    const raw = store.getItem(AUTH_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as AccountBook;
  } catch {
    return {};
  }
}

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashSecret(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function currentUser(store: ScoreboardStore): string | null {
  try {
    const raw = store.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "string" && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function accountToken(store: ScoreboardStore): string | null {
  try {
    const raw = store.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "string" && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function setSession(store: ScoreboardStore, username: string | null) {
  if (username) store.setItem(SESSION_KEY, JSON.stringify(username));
  else store.setItem(SESSION_KEY, "null");
}

function setToken(store: ScoreboardStore, token: string | null) {
  if (token) store.setItem(TOKEN_KEY, JSON.stringify(token));
  else store.setItem(TOKEN_KEY, "null");
}

async function cacheLocalAccount(store: ScoreboardStore, username: string, password: string) {
  const book = loadBook(store);
  const salt = randomSalt();
  book[username] = { salt, hash: await hashSecret(password, salt) };
  store.setItem(AUTH_KEY, JSON.stringify(book));
}

async function localPasswordMatches(
  store: ScoreboardStore,
  username: string,
  password: string,
): Promise<boolean> {
  const account = loadBook(store)[username];
  if (!account) return false;
  return (await hashSecret(password, account.salt)) === account.hash;
}

function finishLogin(
  store: ScoreboardStore,
  username: string,
  token: string,
  progress: ReturnType<typeof mergeProgress>,
) {
  setSession(store, username);
  setToken(store, token);
  applyProgress(store, username, progress);
}

export function logout(store: ScoreboardStore) {
  setSession(store, null);
  setToken(store, null);
}

export async function register(
  name: string,
  password: string,
  store: ScoreboardStore,
  client: AccountClient = serverAccountClient,
): Promise<AuthResult> {
  const username = normalizeUsername(name);
  if (!usernameLooksValid(username)) {
    return { ok: false, error: "Use 3–24 letters, numbers, or underscores." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  const book = loadBook(store);
  if (book[username]) {
    return { ok: false, error: USERNAME_TAKEN };
  }

  const remote = await client.register(username, password, emptyProgress());
  if (!remote.ok) return remote;

  await cacheLocalAccount(store, username, password);
  finishLogin(store, username, remote.token, mergeProgress(emptyProgress(), remote.progress));
  return { ok: true };
}

async function uploadLocalAccount(
  username: string,
  password: string,
  store: ScoreboardStore,
  client: AccountClient,
): Promise<AuthResult> {
  const progress = readProgress(store, username);
  const created = await client.register(username, password, progress);
  if (created.ok) {
    finishLogin(store, username, created.token, mergeProgress(progress, created.progress));
    return { ok: true };
  }
  if (created.code === "network") {
    setSession(store, username);
    return { ok: true };
  }
  if (created.code === "taken") {
    const bound = await client.bind(username, password, progress);
    if (bound.ok) {
      finishLogin(store, username, bound.token, mergeProgress(progress, bound.progress));
      return { ok: true };
    }
    if (bound.code === "network") {
      setSession(store, username);
      return { ok: true };
    }
    setSession(store, username);
    setToken(store, null);
    return { ok: true };
  }
  return created;
}

export async function login(
  name: string,
  password: string,
  store: ScoreboardStore,
  client: AccountClient = serverAccountClient,
): Promise<AuthResult> {
  const username = normalizeUsername(name);
  const localOk = await localPasswordMatches(store, username, password);
  const remote = await client.login(username, password);

  if (remote.ok) {
    await cacheLocalAccount(store, username, password);
    finishLogin(
      store,
      username,
      remote.token,
      mergeProgress(readProgress(store, username), remote.progress),
    );
    const pushed = await client.sync(remote.token, readProgress(store, username));
    if (pushed.ok) applyProgress(store, username, pushed.progress);
    return { ok: true };
  }

  if (remote.code === "wrong") {
    return { ok: false, error: "Wrong password." };
  }

  if (localOk) {
    if (remote.code === "network") {
      setSession(store, username);
      return { ok: true };
    }
    return uploadLocalAccount(username, password, store, client);
  }

  if (remote.code === "unbound") {
    return {
      ok: false,
      error: "Log in on the device you registered first, then you can use other devices.",
    };
  }

  if (remote.code === "missing") {
    return { ok: false, error: "No account with that name." };
  }

  return { ok: false, error: remote.error };
}

export async function syncAccount(
  store: ScoreboardStore,
  client: AccountClient = serverAccountClient,
): Promise<boolean> {
  const user = currentUser(store);
  const token = accountToken(store);
  if (!user || !token) return false;
  const remote = await client.sync(token, readProgress(store, user));
  if (!remote.ok) return false;
  applyProgress(store, user, remote.progress);
  return true;
}
