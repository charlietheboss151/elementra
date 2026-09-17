import { describe, expect, it } from "vitest";
import { UI_PREFS_KEY, loadUiPrefs, saveUiPrefs } from "./uiPrefs";
import type { ScoreboardStore } from "./scoreboard";

function memoryStore(seed: Record<string, string> = {}): ScoreboardStore {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe("uiPrefs", () => {
  it("defaults to showing the fps meter and motion on", () => {
    expect(loadUiPrefs(memoryStore())).toEqual({ showPerfHud: true, reduceMotion: false });
  });

  it("round-trips display prefs", () => {
    const store = memoryStore();
    saveUiPrefs({ showPerfHud: false, reduceMotion: true }, store);
    expect(loadUiPrefs(store)).toEqual({ showPerfHud: false, reduceMotion: true });
    expect(store.getItem(UI_PREFS_KEY)).toContain("reduceMotion");
  });
});
