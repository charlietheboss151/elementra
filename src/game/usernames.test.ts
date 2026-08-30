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
});
