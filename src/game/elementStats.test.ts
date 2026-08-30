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

function answer(atomicNumber: number, correct: boolean): AnswerRecord {
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
    tryNumber: correct ? 1 : null,
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
    expect(stats[3]).toEqual({ correct: 2, incorrect: 0 });
    expect(stats[11]).toEqual({ correct: 0, incorrect: 1 });
    expect(stats[19]).toEqual({ correct: 0, incorrect: 1 });

    const best = rankElements(stats, "best");
    expect(best[0].name).toBe("Lithium");
    expect(best[0].correct).toBe(2);

    const worst = rankElements(stats, "worst");
    expect(worst[0].incorrect).toBeGreaterThanOrEqual(worst[worst.length - 1].incorrect);
    expect(worst.map((row) => row.name)).toContain("Sodium");
  });

  it("saves stats for an account and leaves guest stats separate", () => {
    const store = memoryKv();
    applyRoundToStats({}, result([answer(3, true)]), store, "charlie");
    applyRoundToStats({}, result([answer(11, false)]), store, null);
    expect(loadElementStats(store, "charlie")[3]?.correct).toBe(1);
    expect(loadElementStats(store, null)[11]?.incorrect).toBe(1);
    expect(loadElementStats(store, "charlie")[11]).toBeUndefined();
  });
});
