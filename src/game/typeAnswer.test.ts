import { describe, expect, it } from "vitest";
import { ELEMENTS_BY_NUMBER } from "../data/elements";
import { namesMatch } from "./typeAnswer";

describe("namesMatch", () => {
  it("accepts the real spelling, ignoring case and extra spaces", () => {
    const iron = ELEMENTS_BY_NUMBER.get(26)!;
    const aluminum = ELEMENTS_BY_NUMBER.get(13)!;
    const sulfur = ELEMENTS_BY_NUMBER.get(16)!;
    expect(namesMatch(iron, "Iron")).toBe(true);
    expect(namesMatch(iron, "  iron  ")).toBe(true);
    expect(namesMatch(iron, "Fe")).toBe(false);
    expect(namesMatch(iron, "Gold")).toBe(false);
    expect(namesMatch(aluminum, "Aluminium")).toBe(true);
    expect(namesMatch(sulfur, "sulphur")).toBe(true);
  });
});
