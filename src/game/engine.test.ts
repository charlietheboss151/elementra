import { describe, expect, it } from "vitest";
import { ELEMENTS_BY_NUMBER } from "../data/elements";
import { poolForSet } from "./elementSets";
import {
  accuracyPercent,
  applyAnswer,
  buildQuestions,
  emptyStats,
  formatScore,
  isCorrectAnswer,
  pointsForTry,
  scoreFromStats,
} from "./engine";
import { getMode, usesListLayout } from "./modes";
import type { GameConfig } from "./types";

const base: Omit<GameConfig, "modeId"> = {
  elementSet: "all",
  timed: false,
};

describe("buildQuestions", () => {
  it("builds Find Element by Name prompts from the same element table", () => {
    const questions = buildQuestions({ ...base, modeId: "find-element" });
    expect(questions).toHaveLength(poolForSet("all").length);
    const ids = questions.map((question) => question.target.atomicNumber);
    expect(new Set(ids).size).toBe(ids.length);
    for (const question of questions) {
      expect(question.clueKind).toBe("name");
      expect(question.prompt).toBe(`Find ${question.target.name}`);
      expect(ELEMENTS_BY_NUMBER.get(question.target.atomicNumber)).toEqual(question.target);
      expect(isCorrectAnswer(question, question.target.atomicNumber)).toBe(true);
      expect(isCorrectAnswer(question, question.target.atomicNumber === 1 ? 8 : 1)).toBe(false);
    }
  });

  it("builds Find Element by Atomic Number prompts", () => {
    const questions = buildQuestions({ ...base, modeId: "atomic-number" });
    for (const question of questions) {
      expect(question.clueKind).toBe("atomic-number");
      expect(question.prompt).toBe(`Find element #${question.target.atomicNumber}`);
    }
  });

  it("builds Find Element by Symbol prompts", () => {
    const questions = buildQuestions({ ...base, modeId: "symbol" });
    for (const question of questions) {
      expect(question.clueKind).toBe("symbol");
      expect(question.prompt).toBe(`Find ${question.target.symbol}`);
    }
  });

  it("builds mixed prompts from the registered modes", () => {
    const kinds = getMode("mixed").clueKinds("all");
    expect(kinds).toEqual(expect.arrayContaining(["name", "symbol", "properties", "atomic-number"]));
    expect(kinds).not.toContain("type-name");
    expect(usesListLayout("mixed", "atomic-number")).toBe(true);
    expect(usesListLayout("mixed", "name")).toBe(false);
    const questions = buildQuestions({ ...base, modeId: "mixed" });
    expect(questions).toHaveLength(poolForSet("all").length);
    const allowed = new Set(kinds);
    for (const question of questions) {
      expect(allowed.has(question.clueKind)).toBe(true);
    }
  });

  it("asks you to type the element name from its symbol", () => {
    const questions = buildQuestions({ ...base, modeId: "type-name", elementSet: "alkali-metal" });
    expect(questions).toHaveLength(poolForSet("alkali-metal").length);
    for (const question of questions) {
      expect(question.clueKind).toBe("type-name");
      expect(question.prompt).toBe(`Type the name for ${question.target.symbol}`);
      expect(question.prompt).not.toContain(question.target.name);
      expect(question.reveal.name).toBe(false);
      expect(question.reveal.symbol).toBe(true);
    }
  });

  it("limits the pool to a periodic-table group", () => {
    const questions = buildQuestions({
      ...base,
      modeId: "find-element",
      elementSet: "noble-gas",
    });
    const noble = poolForSet("noble-gas");
    expect(questions).toHaveLength(noble.length);
    expect(new Set(questions.map((q) => q.target.atomicNumber)).size).toBe(noble.length);
    expect(questions.every((question) => noble.some((el) => el.atomicNumber === question.target.atomicNumber))).toBe(
      true,
    );
  });
});

describe("applyAnswer", () => {
  it("awards more points for earlier tries and resets the streak on a miss", () => {
    const start = emptyStats({ ...base, modeId: "find-element" });
    expect(pointsForTry(1)).toBe(3);
    const afterHit = applyAnswer(start, true, 1);
    expect(afterHit.correct).toBe(1);
    expect(afterHit.score).toBe(3);
    expect(afterHit.streak).toBe(1);
    const afterMiss = applyAnswer(afterHit, false, null);
    expect(afterMiss.incorrect).toBe(1);
    expect(afterMiss.streak).toBe(0);
    expect(afterMiss.bestStreak).toBe(1);
    expect(accuracyPercent(afterMiss)).toBe(50);
    const secondTry = applyAnswer(emptyStats({ ...base, modeId: "find-element" }), true, 2);
    expect(accuracyPercent(secondTry)).toBe(66.7);
    expect(scoreFromStats(afterHit)).toBe(1);
    expect(scoreFromStats({ score: 18 })).toBe(6);
    expect(formatScore(secondTry)).toBe("0.7");
  });
});
