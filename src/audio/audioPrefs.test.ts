import { describe, expect, it } from "vitest";
import {
  AUDIO_PREFS_KEY,
  loadAudioPrefs,
  muteAll,
  saveAudioPrefs,
  setSpeechEnabled,
  sfxEnabled,
  speechEnabled,
} from "./audioPrefs";
import type { ScoreboardStore } from "../game/scoreboard";

function memoryStore(seed: Record<string, string> = {}): ScoreboardStore {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe("audioPrefs", () => {
  it("defaults to voices and effects on", () => {
    const store = memoryStore();
    expect(loadAudioPrefs(store)).toEqual({ sfx: true, speech: true });
    expect(sfxEnabled(store)).toBe(true);
    expect(speechEnabled(store)).toBe(true);
  });

  it("can mute just voices or everything", () => {
    const store = memoryStore();
    setSpeechEnabled(false, store);
    expect(speechEnabled(store)).toBe(false);
    expect(sfxEnabled(store)).toBe(true);
    saveAudioPrefs(muteAll(), store);
    expect(sfxEnabled(store)).toBe(false);
    expect(speechEnabled(store)).toBe(false);
    expect(store.getItem(AUDIO_PREFS_KEY)).toContain("false");
  });
});
