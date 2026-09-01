import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const PORT = Number(process.env.ELEMENTRA_ACCOUNT_PORT || 8788);
const HOST = process.env.ELEMENTRA_ACCOUNT_HOST || "127.0.0.1";
const DATA_FILE = process.env.ELEMENTRA_ACCOUNT_FILE || join(homedir(), "elementra-accounts.json");
const NAMES_FILE = process.env.ELEMENTRA_USERNAMES_FILE || join(homedir(), "elementra-usernames.json");
const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const SCOREBOARD_MAX = 40;
const USERNAME_TAKEN = "That username is taken.";

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function emptyProgress() {
  return { scoreboard: [], elementStats: {}, setup: null };
}

function usernameLooksValid(username) {
  return username.length >= 3 && username.length <= 24 && /^[a-z0-9_]+$/.test(username);
}

function loadState() {
  try {
    if (!existsSync(DATA_FILE)) return { users: {}, tokens: {} };
    const parsed = JSON.parse(readFileSync(DATA_FILE, "utf8"));
    return {
      users: parsed?.users && typeof parsed.users === "object" ? parsed.users : {},
      tokens: parsed?.tokens && typeof parsed.tokens === "object" ? parsed.tokens : {},
    };
  } catch {
    return { users: {}, tokens: {} };
  }
}

function saveState(state) {
  writeFileSync(DATA_FILE, JSON.stringify(state));
}

function loadReserved() {
  try {
    if (!existsSync(NAMES_FILE)) return [];
    const parsed = JSON.parse(readFileSync(NAMES_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addReserved(username) {
  const names = loadReserved();
  if (!names.includes(username)) {
    names.push(username);
    writeFileSync(NAMES_FILE, JSON.stringify(names));
  }
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function passwordMatches(password, salt, hash) {
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function issueToken(state, username) {
  const now = Date.now();
  for (const [token, row] of Object.entries(state.tokens)) {
    if (!row || row.exp < now) delete state.tokens[token];
  }
  const owned = Object.entries(state.tokens).filter(([, row]) => row?.user === username);
  if (owned.length >= 20) delete state.tokens[owned[0][0]];
  const token = randomBytes(32).toString("hex");
  state.tokens[token] = { user: username, exp: now + TOKEN_TTL_MS };
  return token;
}

function mergeScoreboards(a, b) {
  const byId = new Map();
  for (const row of [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]) {
    if (row && typeof row.id === "string" && !byId.has(row.id)) byId.set(row.id, row);
  }
  return [...byId.values()]
    .sort((left, right) => Number(right.at || 0) - Number(left.at || 0))
    .slice(0, SCOREBOARD_MAX);
}

function mergeStats(a, b) {
  const left = a && typeof a === "object" ? a : {};
  const right = b && typeof b === "object" ? b : {};
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const out = {};
  for (const key of keys) {
    const x = left[key] || {};
    const y = right[key] || {};
    const row = {
      first: Math.max(Number(x.first) || 0, Number(y.first) || 0),
      second: Math.max(Number(x.second) || 0, Number(y.second) || 0),
      third: Math.max(Number(x.third) || 0, Number(y.third) || 0),
      miss: Math.max(Number(x.miss) || 0, Number(y.miss) || 0),
    };
    if (row.first || row.second || row.third || row.miss) out[key] = row;
  }
  return out;
}

function mergeProgress(incoming, stored) {
  const a = incoming && typeof incoming === "object" ? incoming : emptyProgress();
  const b = stored && typeof stored === "object" ? stored : emptyProgress();
  return {
    scoreboard: mergeScoreboards(a.scoreboard, b.scoreboard),
    elementStats: mergeStats(a.elementStats, b.elementStats),
    setup: a.setup ?? b.setup ?? null,
  };
}

function hasPassword(row) {
  return Boolean(row && typeof row.hash === "string" && row.hash && row.salt);
}

function handleAccount(action, data) {
  const username = typeof data.username === "string" ? data.username.trim().toLowerCase() : "";
  const password = typeof data.password === "string" ? data.password : "";
  const token = typeof data.token === "string" ? data.token : "";
  const progress = data.progress;
  const state = loadState();
  const reserved = loadReserved();

  if (action === "register") {
    if (!usernameLooksValid(username)) {
      return { status: 400, body: { ok: false, error: "Use 3–24 letters, numbers, or underscores.", code: "invalid" } };
    }
    if (password.length < 6 || password.length > 128) {
      return { status: 400, body: { ok: false, error: "Password must be at least 6 characters.", code: "invalid" } };
    }
    const row = state.users[username];
    if (hasPassword(row) || reserved.includes(username) || row) {
      return { status: 409, body: { ok: false, error: USERNAME_TAKEN, code: "taken" } };
    }
    const hashed = hashPassword(password);
    const storedProgress = mergeProgress(progress, emptyProgress());
    state.users[username] = { ...hashed, progress: storedProgress };
    const issued = issueToken(state, username);
    saveState(state);
    addReserved(username);
    return { status: 200, body: { ok: true, token: issued, progress: storedProgress } };
  }

  if (action === "login") {
    if (!usernameLooksValid(username) || !password) {
      return { status: 400, body: { ok: false, error: "No account with that name.", code: "missing" } };
    }
    const row = state.users[username];
    if (!hasPassword(row)) {
      if (row || reserved.includes(username)) {
        return {
          status: 409,
          body: {
            ok: false,
            error: "Log in on the device you registered first, then you can use other devices.",
            code: "unbound",
          },
        };
      }
      return { status: 404, body: { ok: false, error: "No account with that name.", code: "missing" } };
    }
    if (!passwordMatches(password, row.salt, row.hash)) {
      return { status: 401, body: { ok: false, error: "Wrong password.", code: "wrong" } };
    }
    const issued = issueToken(state, username);
    saveState(state);
    return { status: 200, body: { ok: true, token: issued, progress: row.progress || emptyProgress() } };
  }

  if (action === "bind") {
    if (!usernameLooksValid(username) || password.length < 6 || password.length > 128) {
      return { status: 400, body: { ok: false, error: "Use 3–24 letters, numbers, or underscores.", code: "invalid" } };
    }
    const row = state.users[username];
    if (hasPassword(row)) {
      return { status: 409, body: { ok: false, error: USERNAME_TAKEN, code: "taken" } };
    }
    if (!reserved.includes(username) && !row) {
      return { status: 404, body: { ok: false, error: "No account with that name.", code: "missing" } };
    }
    const hashed = hashPassword(password);
    const storedProgress = mergeProgress(progress, row?.progress);
    state.users[username] = { ...hashed, progress: storedProgress };
    const issued = issueToken(state, username);
    saveState(state);
    addReserved(username);
    return { status: 200, body: { ok: true, token: issued, progress: storedProgress } };
  }

  if (action === "sync") {
    const session = state.tokens[token];
    if (!session || session.exp < Date.now()) {
      return { status: 401, body: { ok: false, error: "Sign in again.", code: "auth" } };
    }
    const row = state.users[session.user];
    if (!hasPassword(row)) {
      return { status: 401, body: { ok: false, error: "Sign in again.", code: "auth" } };
    }
    row.progress = mergeProgress(progress, row.progress);
    session.exp = Date.now() + TOKEN_TTL_MS;
    saveState(state);
    return { status: 200, body: { ok: true, token, progress: row.progress } };
  }

  return { status: 400, body: { ok: false, error: "Unknown action.", code: "invalid" } };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 524288) {
        reject(new Error("too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const path = (req.url || "/").split("?")[0];
  const isAccount = path === "/api/account.php" || path === "/account.php";
  const isUsernames = path === "/api/usernames.php";
  if (!isAccount && !isUsernames) {
    json(res, 404, { ok: false, error: "Not found.", code: "invalid" });
    return;
  }
  if (req.method !== "POST") {
    json(res, 405, { ok: false, error: "Use POST.", code: "invalid" });
    return;
  }
  let data = {};
  try {
    data = JSON.parse(await readBody(req));
  } catch {
    json(res, 400, { ok: false, error: "Use JSON.", code: "invalid" });
    return;
  }
  if (isUsernames) {
    const username = typeof data.username === "string" ? data.username.trim().toLowerCase() : "";
    if (!usernameLooksValid(username)) {
      json(res, 400, { ok: false, error: "Use 3–24 letters, numbers, or underscores." });
      return;
    }
    const state = loadState();
    if (hasPassword(state.users[username]) || loadReserved().includes(username)) {
      json(res, 409, { ok: false, error: USERNAME_TAKEN });
      return;
    }
    addReserved(username);
    json(res, 200, { ok: true });
    return;
  }
  const action = typeof data.action === "string" ? data.action : "";
  const result = handleAccount(action, data);
  json(res, result.status, result.body);
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`elementra-account-server ${HOST}:${PORT} data=${DATA_FILE}\n`);
});
