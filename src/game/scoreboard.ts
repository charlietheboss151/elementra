import { accuracyPercent } from "./engine";
import type { ElementSetId, GameResult } from "./types";

export const SCOREBOARD_KEY = "elementra-scoreboard-v1";
export const SCOREBOARD_MAX = 40;

export interface ScoreboardEntry {
  id: string;
  at: number;
  modeId: string;
  elementSet: ElementSetId;
  timed: boolean;
  accuracy: number;
  elapsedMs: number;
  correct: number;
  total: number;
}

export interface ScoreboardStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function defaultStore(): ScoreboardStore {
  if (typeof localStorage === "undefined") {
    return {
      getItem: () => null,
      setItem: () => undefined,
    };
  }
  return localStorage;
}

export function entryFromResult(result: GameResult, at = Date.now()): ScoreboardEntry {
  return {
    id: `${at}-${Math.random().toString(36).slice(2, 8)}`,
    at,
    modeId: result.config.modeId,
    elementSet: result.config.elementSet,
    timed: result.config.timed,
    accuracy: accuracyPercent(result.stats),
    elapsedMs: result.stats.elapsedMs,
    correct: result.stats.correct,
    total: result.answers.length,
  };
}

export function sameSetup(
  a: Pick<ScoreboardEntry, "modeId" | "elementSet" | "timed">,
  b: Pick<ScoreboardEntry, "modeId" | "elementSet" | "timed">,
): boolean {
  return a.modeId === b.modeId && a.elementSet === b.elementSet && a.timed === b.timed;
}

function isEntry(value: unknown): value is ScoreboardEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as ScoreboardEntry;
  return (
    typeof row.id === "string" &&
    typeof row.at === "number" &&
    typeof row.modeId === "string" &&
    typeof row.elementSet === "string" &&
    typeof row.timed === "boolean" &&
    typeof row.accuracy === "number" &&
    typeof row.elapsedMs === "number" &&
    typeof row.correct === "number" &&
    typeof row.total === "number"
  );
}

export function loadEntries(store: ScoreboardStore = defaultStore()): ScoreboardEntry[] {
  try {
    const raw = store.getItem(SCOREBOARD_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry);
  } catch {
    return [];
  }
}

export function recordRound(
  result: GameResult,
  store: ScoreboardStore = defaultStore(),
  at = Date.now(),
): ScoreboardEntry {
  const entry = entryFromResult(result, at);
  const next = [entry, ...loadEntries(store)].slice(0, SCOREBOARD_MAX);
  store.setItem(SCOREBOARD_KEY, JSON.stringify(next));
  return entry;
}

export function entriesForSetup(
  entries: ScoreboardEntry[],
  setup: Pick<ScoreboardEntry, "modeId" | "elementSet" | "timed">,
): ScoreboardEntry[] {
  return entries.filter((row) => sameSetup(row, setup));
}

/** Compare this run to the previous run of the same mode, group, and timer. */
export function deltaVsPrevious(
  entries: ScoreboardEntry[],
  currentId: string,
): { accuracy: number; elapsedMs: number } | null {
  const current = entries.find((row) => row.id === currentId);
  if (!current) return null;
  const older = entries.find((row) => row.id !== currentId && sameSetup(row, current) && row.at < current.at);
  if (!older) return null;
  return {
    accuracy: Math.round((current.accuracy - older.accuracy) * 10) / 10,
    elapsedMs: current.elapsedMs - older.elapsedMs,
  };
}
