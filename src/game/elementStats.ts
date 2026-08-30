import { ELEMENTS_BY_NUMBER } from "../data/elements";
import type { ScoreboardStore } from "./scoreboard";
import type { GameResult } from "./types";

export type KvStore = ScoreboardStore;

export const ELEMENT_STATS_KEY = "elementra-elements-v1";

export interface ElementCounts {
  correct: number;
  incorrect: number;
}

export type ElementStatMap = Record<number, ElementCounts>;

export interface RankedElement {
  atomicNumber: number;
  name: string;
  symbol: string;
  correct: number;
  incorrect: number;
}

export type RankOrder = "best" | "worst";

export function statsKey(user: string | null): string {
  return user ? `${ELEMENT_STATS_KEY}:${user}` : ELEMENT_STATS_KEY;
}

export function loadElementStats(store: KvStore, user: string | null): ElementStatMap {
  try {
    const raw = store.getItem(statsKey(user));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const next: ElementStatMap = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const n = Number(key);
      if (!Number.isInteger(n) || !value || typeof value !== "object") continue;
      const row = value as ElementCounts;
      if (typeof row.correct !== "number" || typeof row.incorrect !== "number") continue;
      next[n] = { correct: row.correct, incorrect: row.incorrect };
    }
    return next;
  } catch {
    return {};
  }
}

export function saveElementStats(store: KvStore, user: string | null, stats: ElementStatMap) {
  store.setItem(statsKey(user), JSON.stringify(stats));
}

export function applyRoundToStats(
  stats: ElementStatMap,
  result: GameResult,
  store?: KvStore,
  user: string | null = null,
): ElementStatMap {
  const next = store ? loadElementStats(store, user) : stats;
  for (const answer of result.answers) {
    const n = answer.question.target.atomicNumber;
    const row = next[n] ?? { correct: 0, incorrect: 0 };
    if (answer.correct) row.correct += 1;
    else row.incorrect += 1;
    next[n] = row;
  }
  if (store) saveElementStats(store, user, next);
  return next;
}

export function rankElements(stats: ElementStatMap, order: RankOrder): RankedElement[] {
  const rows: RankedElement[] = [];
  for (const [key, counts] of Object.entries(stats)) {
    const atomicNumber = Number(key);
    const element = ELEMENTS_BY_NUMBER.get(atomicNumber);
    if (!element) continue;
    if (counts.correct === 0 && counts.incorrect === 0) continue;
    rows.push({
      atomicNumber,
      name: element.name,
      symbol: element.symbol,
      correct: counts.correct,
      incorrect: counts.incorrect,
    });
  }
  rows.sort((a, b) => {
    if (order === "best") {
      if (b.correct !== a.correct) return b.correct - a.correct;
      return a.incorrect - b.incorrect;
    }
    if (b.incorrect !== a.incorrect) return b.incorrect - a.incorrect;
    return a.correct - b.correct;
  });
  return rows;
}
