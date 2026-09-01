import {
  loadElementStats,
  normalizeCounts,
  saveElementStats,
  type ElementCounts,
  type ElementStatMap,
} from "./elementStats";
import {
  SCOREBOARD_MAX,
  boardKey,
  loadEntries,
  parseEntries,
  type ScoreboardEntry,
  type ScoreboardStore,
} from "./scoreboard";
import { saveSetup, setupFromUnknown, setupKey } from "./setupPrefs";
import type { GameConfig } from "./types";

export interface AccountProgress {
  scoreboard: ScoreboardEntry[];
  elementStats: ElementStatMap;
  setup: GameConfig | null;
}

export function emptyProgress(): AccountProgress {
  return { scoreboard: [], elementStats: {}, setup: null };
}

function emptyCounts(): ElementCounts {
  return { first: 0, second: 0, third: 0, miss: 0 };
}

export function parseElementStats(value: unknown): ElementStatMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const next: ElementStatMap = {};
  for (const [key, row] of Object.entries(value as Record<string, unknown>)) {
    const n = Number(key);
    if (!Number.isInteger(n)) continue;
    const counts = normalizeCounts(row);
    if (!counts) continue;
    next[n] = counts;
  }
  return next;
}

export function sanitizeProgress(value: unknown): AccountProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyProgress();
  }
  const rec = value as Record<string, unknown>;
  return {
    scoreboard: parseEntries(rec.scoreboard).slice(0, SCOREBOARD_MAX),
    elementStats: parseElementStats(rec.elementStats),
    setup: setupFromUnknown(rec.setup),
  };
}

export function mergeScoreboards(
  a: ScoreboardEntry[],
  b: ScoreboardEntry[],
): ScoreboardEntry[] {
  const byId = new Map<string, ScoreboardEntry>();
  for (const row of [...a, ...b]) {
    if (!byId.has(row.id)) byId.set(row.id, row);
  }
  return [...byId.values()].sort((left, right) => right.at - left.at).slice(0, SCOREBOARD_MAX);
}

export function mergeElementStats(a: ElementStatMap, b: ElementStatMap): ElementStatMap {
  const next: ElementStatMap = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)].map(Number));
  for (const n of keys) {
    if (!Number.isInteger(n)) continue;
    const left = a[n] ?? emptyCounts();
    const right = b[n] ?? emptyCounts();
    const row: ElementCounts = {
      first: Math.max(left.first, right.first),
      second: Math.max(left.second, right.second),
      third: Math.max(left.third, right.third),
      miss: Math.max(left.miss, right.miss),
    };
    if (row.first === 0 && row.second === 0 && row.third === 0 && row.miss === 0) continue;
    next[n] = row;
  }
  return next;
}

export function mergeProgress(local: AccountProgress, remote: AccountProgress): AccountProgress {
  return {
    scoreboard: mergeScoreboards(local.scoreboard, remote.scoreboard),
    elementStats: mergeElementStats(local.elementStats, remote.elementStats),
    setup: local.setup ?? remote.setup,
  };
}

export function readProgress(store: ScoreboardStore, user: string): AccountProgress {
  let setup: GameConfig | null = null;
  try {
    const rawSetup = store.getItem(setupKey(user));
    if (rawSetup) setup = setupFromUnknown(JSON.parse(rawSetup));
  } catch {
    setup = null;
  }
  return {
    scoreboard: loadEntries(store, user),
    elementStats: loadElementStats(store, user),
    setup,
  };
}

export function applyProgress(store: ScoreboardStore, user: string, progress: AccountProgress) {
  store.setItem(boardKey(user), JSON.stringify(progress.scoreboard.slice(0, SCOREBOARD_MAX)));
  saveElementStats(store, user, progress.elementStats);
  if (progress.setup) saveSetup(progress.setup, store, user);
}
