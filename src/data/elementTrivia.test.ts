import { describe, expect, it } from "vitest";
import { ELEMENTS, ELEMENTS_BY_NUMBER } from "./elements";
import { ELEMENT_TRIVIA, triviaFor } from "./elementTrivia";

describe("elementTrivia", () => {
  it("covers every element with at least two unique facts", () => {
    expect(Object.keys(ELEMENT_TRIVIA)).toHaveLength(118);
    for (const element of ELEMENTS) {
      const facts = triviaFor(element.atomicNumber);
      expect(facts.length, element.name).toBeGreaterThanOrEqual(2);
      expect(new Set(facts).size, element.name).toBe(facts.length);
    }
  });

  it("avoids generic family blurbs for well-known elements", () => {
    const iron = ELEMENTS_BY_NUMBER.get(26)!;
    const facts = triviaFor(iron.atomicNumber);
    expect(facts.some((line) => /hemoglobin/i.test(line))).toBe(true);
    expect(facts.some((line) => line.startsWith("This element is"))).toBe(false);
  });
});
