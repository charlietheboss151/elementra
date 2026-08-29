import { describe, expect, it } from "vitest";
import { ELEMENTS } from "../data/elements";
import { ELEMENT_PRONUNCIATIONS } from "./pronunciations";
import { spokenForm, spokenIpa } from "./speech";

describe("spokenForm", () => {
  it("has IPA and a hyphenated saying for every element", () => {
    expect(Object.keys(ELEMENT_PRONUNCIATIONS)).toHaveLength(ELEMENTS.length);
    for (const element of ELEMENTS) {
      const entry = ELEMENT_PRONUNCIATIONS[element.name];
      expect(entry, element.name).toBeDefined();
      expect(entry.ipa.length).toBeGreaterThan(0);
      expect(entry.say.length).toBeGreaterThan(0);
      expect(entry.say).not.toContain(" ");
      expect(spokenForm(element.name)).toBe(entry.say);
      expect(spokenIpa(element.name)).toBe(entry.ipa);
    }
  });

  it("uses sounds, not spelling, for names TTS commonly mangles", () => {
    expect(spokenForm("Lead")).toBe("led");
    expect(spokenForm("Iron")).toBe("eye-urn");
    expect(spokenForm("Yttrium")).toBe("it-tree-uhm");
    expect(spokenForm("Molybdenum")).toBe("muh-lib-duh-num");
    expect(spokenForm("Hydrogen")).toBe("hye-druh-jin");
    expect(spokenForm("Aluminum")).toBe("uh-loo-mih-num");
    expect(spokenIpa("Lead")).toBe("lɛd");
  });
});
