import { describe, expect, it } from "vitest";
import { ELEMENTS } from "../data/elements";
import { ELEMENT_PRONUNCIATIONS } from "./pronunciations";
import { spokenForm } from "./speech";

describe("spokenForm", () => {
  it("has a phonetic line for every element, not the spelled name", () => {
    expect(Object.keys(ELEMENT_PRONUNCIATIONS)).toHaveLength(ELEMENTS.length);
    for (const element of ELEMENTS) {
      const spoken = spokenForm(element.name);
      expect(ELEMENT_PRONUNCIATIONS[element.name], element.name).toBeDefined();
      expect(spoken.length).toBeGreaterThan(0);
      expect(spoken).not.toBe(element.name);
    }
  });

  it("uses classroom sounds for names TTS would otherwise misread", () => {
    expect(spokenForm("Lead")).toBe("led");
    expect(spokenForm("Iron")).toBe("eye urn");
    expect(spokenForm("Yttrium")).toBe("it tree um");
    expect(spokenForm("Molybdenum")).toBe("muh lib duh num");
    expect(spokenForm("Hydrogen")).toBe("high druh jen");
    expect(spokenForm("Aluminum")).toBe("uh loo mih num");
  });
});
