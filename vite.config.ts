import type { IncomingMessage } from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import type { Connect, Plugin, ViteDevServer } from "vite";
import { defineConfig } from "vite";
import { USERNAME_TAKEN, usernameLooksValid } from "./src/game/usernames.ts";

const rootDir = dirname(fileURLToPath(import.meta.url));

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
  if (path !== "/elementra" && path !== "/cosmica") return;
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

function usernameClaimPlugin(): Plugin {
  const taken = new Set<string>();

  const handle: Connect.NextHandleFunction = (req, res, next) => {
    const path = req.url?.split("?")[0];
    if (path !== "/api/usernames.php") {
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
        send(405, { ok: false, error: "Use POST." });
        return;
      }

      let username = "";
      try {
        const parsed: unknown = JSON.parse(await readBody(req as IncomingMessage));
        if (parsed && typeof parsed === "object" && "username" in parsed) {
          const value = (parsed as { username: unknown }).username;
          if (typeof value === "string") username = value.trim().toLowerCase();
        }
      } catch {
        send(400, { ok: false, error: "Use 3–24 letters, numbers, or underscores." });
        return;
      }

      if (!usernameLooksValid(username)) {
        send(400, { ok: false, error: "Use 3–24 letters, numbers, or underscores." });
        return;
      }

      if (taken.has(username)) {
        send(409, { ok: false, error: USERNAME_TAKEN });
        return;
      }

      taken.add(username);
      send(200, { ok: true });
    })().catch(() => {
      if (!res.headersSent) send(503, { ok: false, error: "Couldn't check that username. Try again." });
    });
  };

  const attach = (server: ViteDevServer | { middlewares: { use: (fn: Connect.NextHandleFunction) => void } }) => {
    server.middlewares.use(handle);
  };

  return {
    name: "elementra-usernames",
    configureServer(server) {
      attach(server);
    },
    configurePreviewServer(server) {
      attach(server);
    },
  };
}

export default defineConfig({
  // Apex hub at /, games at /elementra/ and /cosmica/. Bundled files go under
  // /assets; do not hard-code /logo.jpg.
  base: "/",
  appType: "mpa",
  plugins: [subdirectoryIndexPlugin(), react(), usernameClaimPlugin()],
  build: {
    rollupOptions: {
      input: {
        hub: resolve(rootDir, "index.html"),
        elementra: resolve(rootDir, "elementra/index.html"),
        cosmica: resolve(rootDir, "cosmica/index.html"),
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
