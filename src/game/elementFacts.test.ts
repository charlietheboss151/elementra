import { describe, expect, it } from "vitest";
import { poolForSet } from "./elementSets";
import { selectFacts } from "./elementFacts";
import { buildQuestions } from "./engine";

describe("property clues", () => {
  it("uniquely identifies every element in the full table", () => {
    const pool = poolForSet("all");
    for (const target of pool) {
      const facts = selectFacts(target, pool);
      const matches = pool.filter((element) => facts.every((fact) => fact.match(element)));
      expect(matches.map((element) => element.atomicNumber), target.name).toEqual([target.atomicNumber]);
      expect(facts.length).toBeGreaterThan(0);
    }
  });

  it("still uniquely identifies elements inside a single family", () => {
    const pool = poolForSet("noble-gas");
    for (const target of pool) {
      const facts = selectFacts(target, pool);
      const matches = pool.filter((element) => facts.every((fact) => fact.match(element)));
      expect(matches).toHaveLength(1);
      expect(matches[0].atomicNumber).toBe(target.atomicNumber);
    }
  });

  it("builds Property Clues questions with stacked facts", () => {
    const questions = buildQuestions({ modeId: "properties", elementSet: "halogen", timed: false });
    expect(questions).toHaveLength(poolForSet("halogen").length);
    for (const question of questions) {
      expect(question.clueKind).toBe("properties");
      expect(question.prompt.includes("\n") || question.prompt.length > 20).toBe(true);
    }
  });
});
