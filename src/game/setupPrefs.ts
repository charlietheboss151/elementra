import { GAME_MODES } from "./modes";
import { defaultStore, type ScoreboardStore } from "./scoreboard";
import { ELEMENT_SET_IDS, type ElementSetId, type GameConfig } from "./types";

export const SETUP_KEY = "elementra-setup-v1";

export const DEFAULT_CONFIG: GameConfig = {
  modeId: "find-element",
  elementSet: "all",
  timed: false,
};

export function setupKey(user: string | null): string {
  return user ? `${SETUP_KEY}:${user}` : SETUP_KEY;
}

function isElementSet(value: unknown): value is ElementSetId {
  return typeof value === "string" && (ELEMENT_SET_IDS as readonly string[]).includes(value);
}

export function parseSetup(raw: string | null): GameConfig {
  if (!raw) return { ...DEFAULT_CONFIG };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...DEFAULT_CONFIG };
    }
    const rec = parsed as Record<string, unknown>;
    const modeId = typeof rec.modeId === "string" ? rec.modeId : "";
    if (!GAME_MODES.some((mode) => mode.id === modeId)) return { ...DEFAULT_CONFIG };
    if (!isElementSet(rec.elementSet)) return { ...DEFAULT_CONFIG };
    if (typeof rec.timed !== "boolean") return { ...DEFAULT_CONFIG };
    return { modeId, elementSet: rec.elementSet, timed: rec.timed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function loadSetup(
  store: ScoreboardStore = defaultStore(),
  user: string | null = null,
): GameConfig {
  return parseSetup(store.getItem(setupKey(user)));
}

export function saveSetup(
  config: GameConfig,
  store: ScoreboardStore = defaultStore(),
  user: string | null = null,
) {
  store.setItem(setupKey(user), JSON.stringify(config));
}
