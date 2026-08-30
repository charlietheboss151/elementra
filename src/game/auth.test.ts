import { describe, expect, it } from "vitest";
import type { ScoreboardStore } from "./scoreboard";
import {
  AUTH_KEY,
  SESSION_KEY,
  currentUser,
  login,
  logout,
  register,
} from "./auth";
import { USERNAME_TAKEN, allowAllUsernameClaims, memoryUsernameClaims } from "./usernames";

function memoryKv(): ScoreboardStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe("auth", () => {
  const open = allowAllUsernameClaims();

  it("registers a user, logs them in, and keeps the session after a reload", async () => {
    const store = memoryKv();
    const made = await register("Charlie", "secret12", store, open);
    expect(made.ok).toBe(true);
    expect(currentUser(store)).toBe("charlie");

    logout(store);
    expect(currentUser(store)).toBeNull();

    const again = await login("charlie", "secret12", store);
    expect(again.ok).toBe(true);
    expect(currentUser(store)).toBe("charlie");

    const reloaded = memoryKv();
    reloaded.setItem(AUTH_KEY, store.getItem(AUTH_KEY) ?? "");
    reloaded.setItem(SESSION_KEY, store.getItem(SESSION_KEY) ?? "");
    expect(currentUser(reloaded)).toBe("charlie");
  });

  it("rejects a duplicate name, a wrong password, and a too-short password", async () => {
    const store = memoryKv();
    expect((await register("ab", "secret12", store, open)).ok).toBe(false);
    expect((await register("player", "no", store, open)).ok).toBe(false);
    expect((await register("player", "secret12", store, open)).ok).toBe(true);
    const duplicate = await register("Player", "otherpass", store, open);
    expect(duplicate.ok).toBe(false);
    if (!duplicate.ok) expect(duplicate.error).toBe(USERNAME_TAKEN);
    expect((await login("player", "wrong-pass", store)).ok).toBe(false);
    expect((await login("nobody", "secret12", store)).ok).toBe(false);
  });

  it("tells a second person the username is taken even on another device", async () => {
    const names = memoryUsernameClaims();
    const firstDevice = memoryKv();
    const secondDevice = memoryKv();
    expect((await register("henry", "secret12", firstDevice, names)).ok).toBe(true);
    const blocked = await register("Henry", "different", secondDevice, names);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error).toBe(USERNAME_TAKEN);
    expect(currentUser(secondDevice)).toBeNull();
  });
});
