import { defaultStore, type ScoreboardStore } from "../game/scoreboard";

export const AUDIO_PREFS_KEY = "elementra-audio-v1";

export interface AudioPrefs {
  sfx: boolean;
  speech: boolean;
}

export const DEFAULT_AUDIO_PREFS: AudioPrefs = { sfx: true, speech: true };

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function parseAudioPrefs(raw: string | null): AudioPrefs {
  if (!raw) return { ...DEFAULT_AUDIO_PREFS };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...DEFAULT_AUDIO_PREFS };
    }
    const rec = parsed as Record<string, unknown>;
    return {
      sfx: asBool(rec.sfx, true),
      speech: asBool(rec.speech, true),
    };
  } catch {
    return { ...DEFAULT_AUDIO_PREFS };
  }
}

export function loadAudioPrefs(store: ScoreboardStore = defaultStore()): AudioPrefs {
  return parseAudioPrefs(store.getItem(AUDIO_PREFS_KEY));
}

export function saveAudioPrefs(prefs: AudioPrefs, store: ScoreboardStore = defaultStore()) {
  store.setItem(AUDIO_PREFS_KEY, JSON.stringify(prefs));
}

export function muteAll(): AudioPrefs {
  return { sfx: false, speech: false };
}

export function setSpeechEnabled(on: boolean, store: ScoreboardStore = defaultStore()): AudioPrefs {
  const next = { ...loadAudioPrefs(store), speech: on };
  saveAudioPrefs(next, store);
  return next;
}

export function setSfxEnabled(on: boolean, store: ScoreboardStore = defaultStore()): AudioPrefs {
  const next = { ...loadAudioPrefs(store), sfx: on };
  saveAudioPrefs(next, store);
  return next;
}

export function sfxEnabled(store: ScoreboardStore = defaultStore()): boolean {
  return loadAudioPrefs(store).sfx;
}

export function speechEnabled(store: ScoreboardStore = defaultStore()): boolean {
  return loadAudioPrefs(store).speech;
}
