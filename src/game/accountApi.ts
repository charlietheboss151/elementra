import {
  emptyProgress,
  mergeProgress,
  sanitizeProgress,
  type AccountProgress,
} from "./accountProgress";
import { USERNAME_TAKEN } from "./usernames";

export const ACCOUNT_API_PATH = "/api/account.php";

export type AccountErrorCode =
  | "taken"
  | "unbound"
  | "missing"
  | "wrong"
  | "auth"
  | "invalid"
  | "network";

export type AccountResult =
  | { ok: true; token: string; progress: AccountProgress }
  | { ok: false; error: string; code: AccountErrorCode };

export interface AccountClient {
  register(username: string, password: string, progress: AccountProgress): Promise<AccountResult>;
  login(username: string, password: string): Promise<AccountResult>;
  bind(username: string, password: string, progress: AccountProgress): Promise<AccountResult>;
  sync(token: string, progress: AccountProgress): Promise<AccountResult>;
}

export interface MemoryAccountClient extends AccountClient {
  reserve(username: string): void;
}

const NETWORK_ERROR: AccountResult = {
  ok: false,
  error: "Couldn't reach the account server. Try again.",
  code: "network",
};

function cloneProgress(progress: AccountProgress): AccountProgress {
  return JSON.parse(JSON.stringify(progress)) as AccountProgress;
}

function asCode(value: unknown): AccountErrorCode | null {
  if (
    value === "taken" ||
    value === "unbound" ||
    value === "missing" ||
    value === "wrong" ||
    value === "auth" ||
    value === "invalid" ||
    value === "network"
  ) {
    return value;
  }
  return null;
}

export function parseAccountResponse(status: number, payload: unknown): AccountResult {
  if (payload && typeof payload === "object" && "ok" in payload) {
    const rec = payload as Record<string, unknown>;
    if (rec.ok === true && typeof rec.token === "string" && rec.token.length > 0) {
      return { ok: true, token: rec.token, progress: sanitizeProgress(rec.progress) };
    }
    if (rec.ok === false && typeof rec.error === "string" && rec.error.length > 0) {
      const code = asCode(rec.code) ?? (status === 409 ? "taken" : "invalid");
      return { ok: false, error: rec.error, code };
    }
  }
  if (status === 409) return { ok: false, error: USERNAME_TAKEN, code: "taken" };
  return NETWORK_ERROR;
}

async function postAccount(body: Record<string, unknown>): Promise<AccountResult> {
  let response: Response;
  try {
    response = await fetch(ACCOUNT_API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NETWORK_ERROR;
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    return NETWORK_ERROR;
  }
  return parseAccountResponse(response.status, payload);
}

export const serverAccountClient: AccountClient = {
  register: (username, password, progress) =>
    postAccount({ action: "register", username, password, progress }),
  login: (username, password) => postAccount({ action: "login", username, password }),
  bind: (username, password, progress) =>
    postAccount({ action: "bind", username, password, progress }),
  sync: (token, progress) => postAccount({ action: "sync", token, progress }),
};

export function offlineAccountClient(): AccountClient {
  const fail = async (): Promise<AccountResult> => NETWORK_ERROR;
  return { register: fail, login: fail, bind: fail, sync: fail };
}

export function memoryAccountClient(): MemoryAccountClient {
  const users = new Map<string, { password: string; progress: AccountProgress; bound: boolean }>();
  const tokens = new Map<string, string>();
  let n = 0;

  const issue = (username: string): string => {
    const token = `tok-${username}-${++n}`;
    tokens.set(token, username);
    return token;
  };

  const snapshot = (username: string): AccountProgress => {
    const row = users.get(username);
    return row ? cloneProgress(row.progress) : emptyProgress();
  };

  return {
    reserve(username: string) {
      if (!users.has(username)) {
        users.set(username, { password: "", progress: emptyProgress(), bound: false });
      }
    },
    async register(username, password, progress) {
      const existing = users.get(username);
      if (existing) return { ok: false, error: USERNAME_TAKEN, code: "taken" };
      users.set(username, { password, progress: cloneProgress(progress), bound: true });
      return { ok: true, token: issue(username), progress: snapshot(username) };
    },
    async login(username, password) {
      const row = users.get(username);
      if (!row) return { ok: false, error: "No account with that name.", code: "missing" };
      if (!row.bound) {
        return {
          ok: false,
          error: "Log in on the device you registered first, then you can use other devices.",
          code: "unbound",
        };
      }
      if (row.password !== password) return { ok: false, error: "Wrong password.", code: "wrong" };
      return { ok: true, token: issue(username), progress: snapshot(username) };
    },
    async bind(username, password, progress) {
      const row = users.get(username);
      if (row?.bound) return { ok: false, error: USERNAME_TAKEN, code: "taken" };
      const merged = row ? mergeProgress(progress, row.progress) : cloneProgress(progress);
      users.set(username, { password, progress: merged, bound: true });
      return { ok: true, token: issue(username), progress: cloneProgress(merged) };
    },
    async sync(token, progress) {
      const username = tokens.get(token);
      if (!username) return { ok: false, error: "Sign in again.", code: "auth" };
      const row = users.get(username);
      if (!row) return { ok: false, error: "Sign in again.", code: "auth" };
      row.progress = mergeProgress(progress, row.progress);
      return { ok: true, token, progress: cloneProgress(row.progress) };
    },
  };
}
