import { describe, expect, it } from "vitest";
import { ELEMENTS } from "../data/elements";
import { poolForSet } from "./elementSets";

describe("poolForSet", () => {
  it("offers a beginner set of well-known common elements", () => {
    const common = poolForSet("common");
    expect(common.length).toBeGreaterThan(12);
    expect(common.length).toBeLessThan(ELEMENTS.length);
    expect(common.every((element) => element.common)).toBe(true);
    expect(common.map((element) => element.symbol)).toEqual(
      expect.arrayContaining(["H", "C", "O", "Fe", "Au"]),
    );
    expect(common.map((element) => element.symbol)).not.toContain("Og");
  });
});
