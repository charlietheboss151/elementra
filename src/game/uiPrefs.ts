import { defaultStore, type ScoreboardStore } from "./scoreboard";

export const UI_PREFS_KEY = "elementra-ui-v1";

export interface UiPrefs {
  showPerfHud: boolean;
  reduceMotion: boolean;
}

export const DEFAULT_UI_PREFS: UiPrefs = { showPerfHud: true, reduceMotion: false };

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function parseUiPrefs(raw: string | null): UiPrefs {
  if (!raw) return { ...DEFAULT_UI_PREFS };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...DEFAULT_UI_PREFS };
    }
    const rec = parsed as Record<string, unknown>;
    return {
      showPerfHud: asBool(rec.showPerfHud, true),
      reduceMotion: asBool(rec.reduceMotion, false),
    };
  } catch {
    return { ...DEFAULT_UI_PREFS };
  }
}

export function loadUiPrefs(store: ScoreboardStore = defaultStore()): UiPrefs {
  return parseUiPrefs(store.getItem(UI_PREFS_KEY));
}

export function saveUiPrefs(prefs: UiPrefs, store: ScoreboardStore = defaultStore()) {
  store.setItem(UI_PREFS_KEY, JSON.stringify(prefs));
}

export function applyUiPrefs(prefs: UiPrefs) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("ui-still", prefs.reduceMotion);
}
