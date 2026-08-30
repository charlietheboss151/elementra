import { describe, expect, it } from "vitest";
import { SETUP_KEY, loadSetup, saveSetup } from "./setupPrefs";
import type { ScoreboardStore } from "./scoreboard";

function memoryKv(seed: Record<string, string> = {}): ScoreboardStore {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe("setupPrefs", () => {
  it("remembers mode, group, and timer per account", () => {
    const store = memoryKv();
    const setup = { modeId: "symbol", elementSet: "common" as const, timed: true };
    saveSetup(setup, store, "charlie");
    expect(loadSetup(store, "charlie")).toEqual(setup);
    expect(loadSetup(store, null).modeId).toBe("find-element");
    expect(store.getItem(`${SETUP_KEY}:charlie`)).toContain("symbol");
  });

  it("falls back when the saved setup is unknown", () => {
    const store = memoryKv({
      [SETUP_KEY]: JSON.stringify({ modeId: "nope", elementSet: "common", timed: true }),
    });
    expect(loadSetup(store, null)).toEqual({
      modeId: "find-element",
      elementSet: "all",
      timed: false,
    });
  });
});
