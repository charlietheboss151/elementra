import { describe, expect, it } from "vitest";
import { poolForSet } from "./elementSets";
import { previewFactsFor, selectFacts } from "./elementFacts";
import { buildQuestions } from "./engine";
import { ELEMENTS_BY_NUMBER } from "../data/elements";

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
      expect(question.reveal.atomicNumber).toBe(false);
      expect(question.reveal.symbol).toBe(false);
      expect(question.reveal.name).toBe(false);
      expect(question.prompt.includes("\n") || question.prompt.length > 20).toBe(true);
    }
  });

  it("builds short hover facts for the setup table", () => {
    const iron = ELEMENTS_BY_NUMBER.get(26)!;
    const facts = previewFactsFor(iron);
    expect(facts.length).toBeGreaterThanOrEqual(2);
    expect(facts.length).toBeLessThanOrEqual(3);
    expect(facts.some((line) => /hemoglobin/i.test(line))).toBe(true);
    expect(facts.some((line) => line.startsWith("This element is"))).toBe(false);
  });

  it("gives gold its own facts, not generic metal text", () => {
    const gold = ELEMENTS_BY_NUMBER.get(79)!;
    const facts = previewFactsFor(gold);
    expect(facts.some((line) => line.toLowerCase().includes("tarnish") || line.includes("troy"))).toBe(true);
  });
});
