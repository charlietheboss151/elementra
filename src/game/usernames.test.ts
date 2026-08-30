import { afterEach, describe, expect, it, vi } from "vitest";
import { USERNAME_TAKEN, claimUsernameOnServer } from "./usernames";

describe("claimUsernameOnServer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns username taken when the server says the name is already claimed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: false, error: USERNAME_TAKEN }), { status: 409 })),
    );
    await expect(claimUsernameOnServer("henry")).resolves.toEqual({ ok: false, error: USERNAME_TAKEN });
  });

  it("lets register continue when the host serves the PHP file instead of running it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("<?php echo 'no';", {
            status: 200,
            headers: { "Content-Type": "application/octet-stream" },
          }),
      ),
    );
    await expect(claimUsernameOnServer("henry")).resolves.toEqual({ ok: true });
  });
});
