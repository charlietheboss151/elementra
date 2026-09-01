import { createHash, randomBytes } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import type { Connect, Plugin, ViteDevServer } from "vite";
import { defineConfig } from "vite";
import { USERNAME_TAKEN, usernameLooksValid } from "./src/game/usernames.ts";

const rootDir = dirname(fileURLToPath(import.meta.url));
const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const ACCOUNT_API_PATH = "/api/account.php";

interface DevProgress {
  scoreboard: unknown[];
  elementStats: Record<string, unknown>;
  setup: unknown;
}

function asProgress(value: unknown): DevProgress {
  const rec = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    scoreboard: Array.isArray(rec.scoreboard) ? rec.scoreboard : [],
    elementStats:
      rec.elementStats && typeof rec.elementStats === "object" && !Array.isArray(rec.elementStats)
        ? (rec.elementStats as Record<string, unknown>)
        : {},
    setup: rec.setup ?? null,
  };
}

function emptyProgress(): DevProgress {
  return { scoreboard: [], elementStats: {}, setup: null };
}

function mergeProgress(incoming: DevProgress, stored: DevProgress): DevProgress {
  const byId = new Map<string, unknown>();
  for (const row of [...incoming.scoreboard, ...stored.scoreboard]) {
    if (row && typeof row === "object" && "id" in row && typeof (row as { id: unknown }).id === "string") {
      const id = (row as { id: string }).id;
      if (!byId.has(id)) byId.set(id, row);
    }
  }
  return {
    scoreboard: [...byId.values()],
    elementStats: { ...stored.elementStats, ...incoming.elementStats },
    setup: incoming.setup ?? stored.setup,
  };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function rewriteGamePaths(req: IncomingMessage) {
  if (!req.url) return;
  const [path, query] = req.url.split("?");
  if (path !== "/elementra") return;
  req.url = `${path}/${query ? `?${query}` : ""}`;
}

function subdirectoryIndexPlugin(): Plugin {
  const attach = (server: ViteDevServer | { middlewares: { use: (fn: Connect.NextHandleFunction) => void } }) => {
    server.middlewares.use((req, _res, next) => {
      rewriteGamePaths(req as IncomingMessage);
      next();
    });
  };

  return {
    name: "subdirectory-index",
    configureServer(server) {
      attach(server);
    },
    configurePreviewServer(server) {
      attach(server);
    },
  };
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function elementraAccountPlugin(): Plugin {
  const users = new Map<string, { hash: string; progress: DevProgress }>();
  const tokens = new Map<string, { user: string; exp: number }>();
  const reserved = new Set<string>();

  const issue = (username: string): string => {
    const token = randomBytes(32).toString("hex");
    tokens.set(token, { user: username, exp: Date.now() + TOKEN_TTL_MS });
    return token;
  };

  const handle: Connect.NextHandleFunction = (req, res, next) => {
    const path = req.url?.split("?")[0];
    const isUsernames = path === "/api/usernames.php";
    const isAccount = path === ACCOUNT_API_PATH;
    if (!isUsernames && !isAccount) {
      next();
      return;
    }

    const send = (status: number, body: object) => {
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(body));
    };

    void (async () => {
      if (req.method !== "POST") {
        send(405, { ok: false, error: "Use POST.", code: "invalid" });
        return;
      }

      let parsed: unknown = null;
      try {
        parsed = JSON.parse(await readBody(req as IncomingMessage));
      } catch {
        send(400, { ok: false, error: "Use JSON.", code: "invalid" });
        return;
      }
      const rec = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};

      if (isUsernames) {
        let username = "";
        if (typeof rec.username === "string") username = rec.username.trim().toLowerCase();
        if (!usernameLooksValid(username)) {
          send(400, { ok: false, error: "Use 3–24 letters, numbers, or underscores." });
          return;
        }
        if (reserved.has(username) || users.has(username)) {
          send(409, { ok: false, error: USERNAME_TAKEN });
          return;
        }
        reserved.add(username);
        send(200, { ok: true });
        return;
      }

      const action = typeof rec.action === "string" ? rec.action : "";
      const username = typeof rec.username === "string" ? rec.username.trim().toLowerCase() : "";
      const password = typeof rec.password === "string" ? rec.password : "";
      const token = typeof rec.token === "string" ? rec.token : "";
      const progress = asProgress(rec.progress);

      if (action === "register") {
        if (!usernameLooksValid(username)) {
          send(400, { ok: false, error: "Use 3–24 letters, numbers, or underscores.", code: "invalid" });
          return;
        }
        if (password.length < 6 || password.length > 128) {
          send(400, { ok: false, error: "Password must be at least 6 characters.", code: "invalid" });
          return;
        }
        if (users.has(username) || reserved.has(username)) {
          send(409, { ok: false, error: USERNAME_TAKEN, code: "taken" });
          return;
        }
        users.set(username, { hash: hashPassword(password), progress });
        reserved.add(username);
        send(200, { ok: true, token: issue(username), progress });
        return;
      }

      if (action === "login") {
        const row = users.get(username);
        if (!row) {
          if (reserved.has(username)) {
            send(409, {
              ok: false,
              error: "Log in on the device you registered first, then you can use other devices.",
              code: "unbound",
            });
            return;
          }
          send(404, { ok: false, error: "No account with that name.", code: "missing" });
          return;
        }
        if (row.hash !== hashPassword(password)) {
          send(401, { ok: false, error: "Wrong password.", code: "wrong" });
          return;
        }
        send(200, { ok: true, token: issue(username), progress: row.progress });
        return;
      }

      if (action === "bind") {
        if (!usernameLooksValid(username) || password.length < 6 || password.length > 128) {
          send(400, { ok: false, error: "Use 3–24 letters, numbers, or underscores.", code: "invalid" });
          return;
        }
        if (users.has(username)) {
          send(409, { ok: false, error: USERNAME_TAKEN, code: "taken" });
          return;
        }
        if (!reserved.has(username)) {
          send(404, { ok: false, error: "No account with that name.", code: "missing" });
          return;
        }
        const merged = mergeProgress(progress, emptyProgress());
        users.set(username, { hash: hashPassword(password), progress: merged });
        send(200, { ok: true, token: issue(username), progress: merged });
        return;
      }

      if (action === "sync") {
        const session = tokens.get(token);
        if (!session || session.exp < Date.now()) {
          send(401, { ok: false, error: "Sign in again.", code: "auth" });
          return;
        }
        const row = users.get(session.user);
        if (!row) {
          send(401, { ok: false, error: "Sign in again.", code: "auth" });
          return;
        }
        row.progress = mergeProgress(progress, row.progress);
        session.exp = Date.now() + TOKEN_TTL_MS;
        send(200, { ok: true, token, progress: row.progress });
        return;
      }

      send(400, { ok: false, error: "Unknown action.", code: "invalid" });
    })().catch(() => {
      if (!res.headersSent) send(503, { ok: false, error: "Couldn't reach the account server. Try again.", code: "network" });
    });
  };

  const attach = (server: ViteDevServer | { middlewares: { use: (fn: Connect.NextHandleFunction) => void } }) => {
    server.middlewares.use(handle);
  };

  return {
    name: "elementra-accounts",
    configureServer(server) {
      attach(server);
    },
    configurePreviewServer(server) {
      attach(server);
    },
  };
}

export default defineConfig({
  // Apex hub at / and Elementra at /elementra/. Cosmica deploys from its own repo.
  base: "/",
  appType: "mpa",
  plugins: [subdirectoryIndexPlugin(), react(), elementraAccountPlugin()],
  build: {
    rollupOptions: {
      input: {
        hub: resolve(rootDir, "index.html"),
        elementra: resolve(rootDir, "elementra/index.html"),
      },
    },
  },
  server: {
    // Listen on all interfaces so port-forwarded / tunnel URLs work in cloud dev.
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
});
