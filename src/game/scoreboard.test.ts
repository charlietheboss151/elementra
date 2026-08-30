import { describe, expect, it } from "vitest";
import { ELEMENTS_BY_NUMBER } from "../data/elements";
import type { GameResult } from "./types";
import {
  SCOREBOARD_MAX,
  deltaVsPrevious,
  entriesForSetup,
  loadEntries,
  recordRound,
  type ScoreboardStore,
} from "./scoreboard";

function memoryStore(seed = ""): ScoreboardStore {
  let value = seed;
  return {
    getItem: () => value || null,
    setItem: (_key, next) => {
      value = next;
    },
  };
}

function memoryKv(): ScoreboardStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

function alkaliResult(accuracyScore: number, elapsedMs: number): GameResult {
  const lithium = ELEMENTS_BY_NUMBER.get(3);
  if (!lithium) throw new Error("missing lithium");
  return {
    config: { modeId: "find-element", elementSet: "alkali-metal", timed: false },
    answers: [
      {
        question: {
          id: 1,
          target: lithium,
          prompt: "Find Lithium",
          clueKind: "name",
          reveal: { atomicNumber: true, symbol: true, name: false },
        },
        guesses: [3],
        correct: true,
        timedOut: false,
        tryNumber: 1,
      },
    ],
    stats: {
      score: accuracyScore,
      correct: 1,
      incorrect: 0,
      streak: 1,
      bestStreak: 1,
      elapsedMs,
      remainingQuestionMs: null,
    },
  };
}

describe("scoreboard", () => {
  it("stores time and accuracy after each round, newest first", () => {
    const store = memoryStore();
    recordRound(alkaliResult(3, 40_000), store, 1000);
    recordRound(alkaliResult(2, 30_000), store, 2000);
    const rows = loadEntries(store);
    expect(rows).toHaveLength(2);
    expect(rows[0].elapsedMs).toBe(30_000);
    expect(rows[0].accuracy).toBe(66.7);
    expect(rows[1].accuracy).toBe(100);
  });

  it("caps history and compares to the previous same setup", () => {
    const store = memoryStore();
    for (let i = 0; i < SCOREBOARD_MAX + 3; i += 1) {
      recordRound(alkaliResult(3, 10_000 + i), store, i + 1);
    }
    const rows = loadEntries(store);
    expect(rows).toHaveLength(SCOREBOARD_MAX);
    const delta = deltaVsPrevious(rows, rows[0].id);
    expect(delta).not.toBeNull();
    expect(delta?.elapsedMs).toBe(1);
    expect(entriesForSetup(rows, rows[0]).length).toBe(SCOREBOARD_MAX);
  });

  it("keeps a logged-in player's board separate from a guest board", () => {
    const store = memoryKv();
    recordRound(alkaliResult(3, 10_000), store, 1, "charlie");
    recordRound(alkaliResult(2, 20_000), store, 2, null);
    expect(loadEntries(store, "charlie")).toHaveLength(1);
    expect(loadEntries(store, "charlie")[0].elapsedMs).toBe(10_000);
    expect(loadEntries(store, null)[0].elapsedMs).toBe(20_000);
  });

  it("keeps a quit mid-round as incomplete with accuracy, time, and score", () => {
    const store = memoryStore();
    const quit = alkaliResult(3, 45_000);
    quit.incomplete = true;
    recordRound(quit, store, 9);
    const row = loadEntries(store)[0];
    expect(row.incomplete).toBe(true);
    expect(row.accuracy).toBe(100);
    expect(row.elapsedMs).toBe(45_000);
    expect(row.score).toBe(3);
    expect(row.correct).toBe(1);
    expect(row.total).toBe(1);
  });
});
