import { ELEMENTS_BY_NUMBER } from "../data/elements";
import type { ScoreboardStore } from "./scoreboard";
import type { GameResult } from "./types";

export type KvStore = ScoreboardStore;

export const ELEMENT_STATS_KEY = "elementra-elements-v1";

export interface ElementCounts {
  first: number;
  second: number;
  third: number;
  miss: number;
}

export type ElementStatMap = Record<number, ElementCounts>;

export interface RankedElement {
  atomicNumber: number;
  name: string;
  symbol: string;
  first: number;
  second: number;
  third: number;
  miss: number;
}

export type RankOrder = "best" | "worst";

function emptyCounts(): ElementCounts {
  return { first: 0, second: 0, third: 0, miss: 0 };
}

function isEmpty(counts: ElementCounts): boolean {
  return counts.first === 0 && counts.second === 0 && counts.third === 0 && counts.miss === 0;
}

export function normalizeCounts(value: unknown): ElementCounts | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.first === "number") {
    return {
      first: row.first,
      second: typeof row.second === "number" ? row.second : 0,
      third: typeof row.third === "number" ? row.third : 0,
      miss: typeof row.miss === "number" ? row.miss : 0,
    };
  }
  if (typeof row.correct === "number" && typeof row.incorrect === "number") {
    return { first: row.correct, second: 0, third: 0, miss: row.incorrect };
  }
  return null;
}

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
      if (!Number.isInteger(n)) continue;
      const counts = normalizeCounts(value);
      if (!counts) continue;
      next[n] = counts;
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
    const row = next[n] ?? emptyCounts();
    if (!answer.correct) row.miss += 1;
    else if (answer.tryNumber === 2) row.second += 1;
    else if (answer.tryNumber === 3) row.third += 1;
    else row.first += 1;
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
    if (!element || isEmpty(counts)) continue;
    rows.push({
      atomicNumber,
      name: element.name,
      symbol: element.symbol,
      ...counts,
    });
  }
  rows.sort((a, b) => {
    if (order === "best") {
      if (b.first !== a.first) return b.first - a.first;
      if (b.second !== a.second) return b.second - a.second;
      if (b.third !== a.third) return b.third - a.third;
      return a.miss - b.miss;
    }
    if (b.miss !== a.miss) return b.miss - a.miss;
    if (b.third !== a.third) return b.third - a.third;
    if (b.second !== a.second) return b.second - a.second;
    return a.first - b.first;
  });
  return rows;
}
