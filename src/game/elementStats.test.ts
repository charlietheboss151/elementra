import { describe, expect, it } from "vitest";
import { ELEMENTS_BY_NUMBER } from "../data/elements";
import type { AnswerRecord, GameResult } from "./types";
import {
  applyRoundToStats,
  loadElementStats,
  rankElements,
  type ElementStatMap,
  type KvStore,
} from "./elementStats";

function memoryKv(): KvStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

function answer(
  atomicNumber: number,
  correct: boolean,
  tryNumber: 1 | 2 | 3 | null = correct ? 1 : null,
): AnswerRecord {
  const target = ELEMENTS_BY_NUMBER.get(atomicNumber);
  if (!target) throw new Error(`missing ${atomicNumber}`);
  return {
    question: {
      id: atomicNumber,
      target,
      prompt: `Find ${target.name}`,
      clueKind: "name",
      reveal: { atomicNumber: true, symbol: true, name: false },
    },
    guesses: correct ? [atomicNumber] : [1],
    correct,
    timedOut: false,
    tryNumber,
  };
}

function result(answers: AnswerRecord[]): GameResult {
  return {
    config: { modeId: "find-element", elementSet: "all", timed: false },
    answers,
    stats: {
      score: 0,
      correct: answers.filter((row) => row.correct).length,
      incorrect: answers.filter((row) => !row.correct).length,
      streak: 0,
      bestStreak: 0,
      elapsedMs: 1000,
      remainingQuestionMs: null,
    },
  };
}

describe("elementStats", () => {
  it("counts rights and wrongs per element and ranks best first or worst first", () => {
    const stats: ElementStatMap = {};
    applyRoundToStats(stats, result([answer(3, true), answer(11, false), answer(3, true), answer(19, false)]));
    expect(stats[3]).toEqual({ first: 2, second: 0, third: 0, miss: 0 });
    expect(stats[11]).toEqual({ first: 0, second: 0, third: 0, miss: 1 });
    expect(stats[19]).toEqual({ first: 0, second: 0, third: 0, miss: 1 });

    const best = rankElements(stats, "best");
    expect(best[0].name).toBe("Lithium");
    expect(best[0].first).toBe(2);

    const worst = rankElements(stats, "worst");
    expect(worst[0].miss).toBeGreaterThanOrEqual(worst[worst.length - 1].miss);
    expect(worst.map((row) => row.name)).toContain("Sodium");
  });

  it("ranks a second-try hit below first-try hits", () => {
    const stats: ElementStatMap = {};
    applyRoundToStats(
      stats,
      result([answer(3, true, 1), answer(11, true, 2), answer(19, true, 1), answer(37, true, 3)]),
    );
    const names = rankElements(stats, "best").map((row) => row.name);
    expect(names[names.length - 1]).toBe("Rubidium");
    expect(names.indexOf("Sodium")).toBeGreaterThan(names.indexOf("Lithium"));
    expect(names.indexOf("Sodium")).toBeGreaterThan(names.indexOf("Potassium"));
  });

  it("saves stats for an account and leaves guest stats separate", () => {
    const store = memoryKv();
    applyRoundToStats({}, result([answer(3, true)]), store, "charlie");
    applyRoundToStats({}, result([answer(11, false)]), store, null);
    expect(loadElementStats(store, "charlie")[3]?.first).toBe(1);
    expect(loadElementStats(store, null)[11]?.miss).toBe(1);
    expect(loadElementStats(store, "charlie")[11]).toBeUndefined();
  });
});
