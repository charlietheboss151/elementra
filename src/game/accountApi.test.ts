import { describe, expect, it } from "vitest";
import { USERNAME_TAKEN } from "./usernames";
import { parseAccountResponse } from "./accountApi";

describe("parseAccountResponse", () => {
  it("reads a successful login payload", () => {
    const result = parseAccountResponse(200, {
      ok: true,
      token: "abc",
      progress: { scoreboard: [], elementStats: {}, setup: null },
    });
    expect(result).toEqual({
      ok: true,
      token: "abc",
      progress: { scoreboard: [], elementStats: {}, setup: null },
    });
  });

  it("keeps the taken code from a 409", () => {
    expect(parseAccountResponse(409, { ok: false, error: USERNAME_TAKEN, code: "taken" })).toEqual({
      ok: false,
      error: USERNAME_TAKEN,
      code: "taken",
    });
  });

  it("treats a PHP download as unreachable", () => {
    expect(parseAccountResponse(200, null)).toEqual({
      ok: false,
      error: "Couldn't reach the account server. Try again.",
      code: "network",
    });
  });
});
