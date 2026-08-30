import type { ScoreboardStore } from "./scoreboard";

export const AUTH_KEY = "elementra-accounts-v1";
export const SESSION_KEY = "elementra-session-v1";

export type AuthResult = { ok: true } | { ok: false; error: string };

interface Account {
  salt: string;
  hash: string;
}

type AccountBook = Record<string, Account>;

function normalizeName(raw: string): string {
  return raw.trim().toLowerCase();
}

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

function setSession(store: ScoreboardStore, username: string | null) {
  if (username) store.setItem(SESSION_KEY, JSON.stringify(username));
  else store.setItem(SESSION_KEY, "null");
}

export function logout(store: ScoreboardStore) {
  setSession(store, null);
}

export async function register(
  name: string,
  password: string,
  store: ScoreboardStore,
): Promise<AuthResult> {
  const username = normalizeName(name);
  if (username.length < 3 || username.length > 24 || !/^[a-z0-9_]+$/.test(username)) {
    return { ok: false, error: "Use 3–24 letters, numbers, or underscores." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  const book = loadBook(store);
  if (book[username]) {
    return { ok: false, error: "That name is already taken on this device." };
  }
  const salt = randomSalt();
  book[username] = { salt, hash: await hashSecret(password, salt) };
  store.setItem(AUTH_KEY, JSON.stringify(book));
  setSession(store, username);
  return { ok: true };
}

export async function login(
  name: string,
  password: string,
  store: ScoreboardStore,
): Promise<AuthResult> {
  const username = normalizeName(name);
  const account = loadBook(store)[username];
  if (!account) {
    return { ok: false, error: "No account with that name on this device." };
  }
  const hash = await hashSecret(password, account.salt);
  if (hash !== account.hash) {
    return { ok: false, error: "Wrong password." };
  }
  setSession(store, username);
  return { ok: true };
}
