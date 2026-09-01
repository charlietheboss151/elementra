import { describe, expect, it } from "vitest";
import type { ScoreboardStore } from "./scoreboard";
import {
  AUTH_KEY,
  SESSION_KEY,
  TOKEN_KEY,
  accountToken,
  currentUser,
  hashSecret,
  login,
  logout,
  register,
  syncAccount,
} from "./auth";
import { memoryAccountClient, offlineAccountClient } from "./accountApi";
import { USERNAME_TAKEN } from "./usernames";

function memoryKv(): ScoreboardStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

const sampleEntry = {
  id: "run-1",
  at: 1,
  modeId: "find-element",
  elementSet: "all" as const,
  timed: false,
  accuracy: 100,
  elapsedMs: 1000,
  correct: 1,
  total: 1,
  score: 3,
  incomplete: false,
};

describe("auth", () => {
  it("registers a user, logs them in, and keeps the session after a reload", async () => {
    const store = memoryKv();
    const server = memoryAccountClient();
    const made = await register("Charlie", "secret12", store, server);
    expect(made.ok).toBe(true);
    expect(currentUser(store)).toBe("charlie");
    expect(accountToken(store)).toBeTruthy();

    logout(store);
    expect(currentUser(store)).toBeNull();
    expect(accountToken(store)).toBeNull();

    const again = await login("charlie", "secret12", store, server);
    expect(again.ok).toBe(true);
    expect(currentUser(store)).toBe("charlie");

    const reloaded = memoryKv();
    reloaded.setItem(AUTH_KEY, store.getItem(AUTH_KEY) ?? "");
    reloaded.setItem(SESSION_KEY, store.getItem(SESSION_KEY) ?? "");
    reloaded.setItem(TOKEN_KEY, store.getItem(TOKEN_KEY) ?? "");
    expect(currentUser(reloaded)).toBe("charlie");
  });

  it("rejects a duplicate name, a wrong password, and a too-short password", async () => {
    const store = memoryKv();
    const server = memoryAccountClient();
    expect((await register("ab", "secret12", store, server)).ok).toBe(false);
    expect((await register("player", "no", store, server)).ok).toBe(false);
    expect((await register("player", "secret12", store, server)).ok).toBe(true);
    const duplicate = await register("Player", "otherpass", store, server);
    expect(duplicate.ok).toBe(false);
    if (!duplicate.ok) expect(duplicate.error).toBe(USERNAME_TAKEN);
    expect((await login("player", "wrong-pass", store, server)).ok).toBe(false);
    expect((await login("nobody", "secret12", store, server)).ok).toBe(false);
  });

  it("tells a second person the username is taken even on another device", async () => {
    const server = memoryAccountClient();
    const firstDevice = memoryKv();
    const secondDevice = memoryKv();
    expect((await register("henry", "secret12", firstDevice, server)).ok).toBe(true);
    const blocked = await register("Henry", "different", secondDevice, server);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error).toBe(USERNAME_TAKEN);
    expect(currentUser(secondDevice)).toBeNull();
  });

  it("logs in on a second device and brings the scoreboard", async () => {
    const server = memoryAccountClient();
    const deviceA = memoryKv();
    const deviceB = memoryKv();
    expect((await register("henry", "secret12", deviceA, server)).ok).toBe(true);
    deviceA.setItem("elementra-scoreboard-v1:henry", JSON.stringify([sampleEntry]));
    expect(await syncAccount(deviceA, server)).toBe(true);

    const signedIn = await login("Henry", "secret12", deviceB, server);
    expect(signedIn.ok).toBe(true);
    expect(currentUser(deviceB)).toBe("henry");
    expect(deviceB.getItem("elementra-scoreboard-v1:henry")).toContain("run-1");
  });

  it("does not create an account when the server is unreachable", async () => {
    const store = memoryKv();
    const result = await register("henry", "secret12", store, offlineAccountClient());
    expect(result.ok).toBe(false);
    expect(currentUser(store)).toBeNull();
  });

  it("still logs in from the local cache when the account server is offline", async () => {
    const store = memoryKv();
    expect((await register("henry", "secret12", store, memoryAccountClient())).ok).toBe(true);
    logout(store);
    const again = await login("henry", "secret12", store, offlineAccountClient());
    expect(again.ok).toBe(true);
    expect(currentUser(store)).toBe("henry");
  });

  it("uploads a previously local account so a second device can log in", async () => {
    const server = memoryAccountClient();
    const deviceA = memoryKv();
    const salt = "aa".repeat(16);
    deviceA.setItem(
      AUTH_KEY,
      JSON.stringify({ henry: { salt, hash: await hashSecret("secret12", salt) } }),
    );
    deviceA.setItem("elementra-scoreboard-v1:henry", JSON.stringify([sampleEntry]));

    expect((await login("henry", "secret12", deviceA, server)).ok).toBe(true);
    expect(accountToken(deviceA)).toBeTruthy();

    const deviceB = memoryKv();
    expect((await login("henry", "secret12", deviceB, server)).ok).toBe(true);
    expect(deviceB.getItem("elementra-scoreboard-v1:henry")).toContain("run-1");
  });
});
