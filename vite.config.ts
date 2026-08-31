import type { IncomingMessage } from "node:http";
import react from "@vitejs/plugin-react";
import type { Connect, Plugin, ViteDevServer } from "vite";
import { defineConfig } from "vite";
import { USERNAME_TAKEN, usernameLooksValid } from "./src/game/usernames.ts";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
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
  // Apex domain (charlietheboss.com). Logo and other files are bundled into
  // /assets so they still load; do not hard-code /logo.jpg.
  base: "/",
  plugins: [react(), usernameClaimPlugin()],
  server: {
    // Listen on all interfaces so port-forwarded / tunnel URLs work in cloud dev.
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
});
