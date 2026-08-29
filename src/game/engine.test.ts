import { describe, expect, it } from "vitest";
import { ELEMENTS_BY_NUMBER } from "../data/elements";
import {
  applyAnswer,
  buildQuestions,
  emptyStats,
  isCorrectAnswer,
} from "./engine";
import { getMode, promptFor } from "./modes";
import type { GameConfig } from "./types";

const base: Omit<GameConfig, "modeId"> = {
  difficulty: "easy",
  questionCount: 10,
  timed: false,
};

describe("buildQuestions", () => {
  it("builds Find Element by Name prompts from the same element table", () => {
    const questions = buildQuestions({ ...base, modeId: "find-element" });
    expect(questions).toHaveLength(10);
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

  it("builds Element Information clues about protons or electrons", () => {
    const questions = buildQuestions({ ...base, modeId: "element-info" });
    const kinds = new Set(questions.map((question) => question.clueKind));
    expect([...kinds].every((kind) => kind === "protons" || kind === "electrons")).toBe(true);
    for (const question of questions) {
      expect(promptFor(question.target, question.clueKind)).toBe(question.prompt);
      expect(question.target.protons).toBe(question.target.atomicNumber);
      expect(question.target.electrons).toBe(question.target.atomicNumber);
    }
  });

  it("builds mixed prompts from the registered modes", () => {
    const questions = buildQuestions({ ...base, modeId: "mixed" });
    expect(questions).toHaveLength(10);
    const allowed = new Set(getMode("mixed").clueKinds("easy"));
    for (const question of questions) {
      expect(allowed.has(question.clueKind)).toBe(true);
    }
  });
});

describe("applyAnswer", () => {
  it("scores hits and resets the streak on a miss", () => {
    const start = emptyStats({ ...base, modeId: "find-element" });
    const afterHit = applyAnswer(start, true);
    expect(afterHit.correct).toBe(1);
    expect(afterHit.streak).toBe(1);
    const afterMiss = applyAnswer(afterHit, false);
    expect(afterMiss.incorrect).toBe(1);
    expect(afterMiss.streak).toBe(0);
    expect(afterMiss.bestStreak).toBe(1);
  });
});
