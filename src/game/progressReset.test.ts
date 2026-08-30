import { describe, expect, it } from "vitest";
import { AUTH_KEY, SESSION_KEY } from "./auth";
import { ELEMENT_STATS_KEY } from "./elementStats";
import {
  PROGRESS_RESET_FLAG,
  applyProgressResetOnce,
  clearAllProgress,
} from "./progressReset";
import { SCOREBOARD_KEY, type ScoreboardStore } from "./scoreboard";

function memoryKv(seed: Record<string, string> = {}): ScoreboardStore {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
    keys: () => [...data.keys()],
  };
}

describe("progressReset", () => {
  it("wipes every account's scores and ranks but keeps logins", () => {
    const store = memoryKv({
      [AUTH_KEY]: '{"charlie":{"salt":"aa","hash":"bb"}}',
      [SESSION_KEY]: '"charlie"',
      [SCOREBOARD_KEY]: "[]",
      [`${SCOREBOARD_KEY}:charlie`]: '[{"id":"old"}]',
      [ELEMENT_STATS_KEY]: "{}",
      [`${ELEMENT_STATS_KEY}:charlie`]: '{"3":{"first":9}}',
    });
    clearAllProgress(store);
    expect(store.getItem(AUTH_KEY)).toContain("charlie");
    expect(store.getItem(SESSION_KEY)).toBe('"charlie"');
    expect(store.getItem(SCOREBOARD_KEY)).toBeNull();
    expect(store.getItem(`${SCOREBOARD_KEY}:charlie`)).toBeNull();
    expect(store.getItem(ELEMENT_STATS_KEY)).toBeNull();
    expect(store.getItem(`${ELEMENT_STATS_KEY}:charlie`)).toBeNull();
  });

  it("only runs the wipe once", () => {
    const store = memoryKv({
      [SCOREBOARD_KEY]: "guest-scores",
    });
    expect(applyProgressResetOnce(store)).toBe(true);
    store.setItem(SCOREBOARD_KEY, "new-scores");
    expect(applyProgressResetOnce(store)).toBe(false);
    expect(store.getItem(SCOREBOARD_KEY)).toBe("new-scores");
    expect(store.getItem(PROGRESS_RESET_FLAG)).toBe("1");
  });
});
