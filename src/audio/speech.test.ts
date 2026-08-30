import { describe, expect, it } from "vitest";
import { ELEMENTS } from "../data/elements";
import { ELEMENT_PRONUNCIATIONS } from "./pronunciations";
import {
  spokenForm,
  spokenIpa,
  speechText,
  scoreEnglishVoice,
  pickEnglishVoiceFrom,
} from "./speech";

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

function fakeVoice(
  name: string,
  lang: string,
  extras: Partial<SpeechSynthesisVoice> = {},
): SpeechSynthesisVoice {
  return {
    name,
    lang,
    voiceURI: extras.voiceURI ?? name,
    localService: extras.localService ?? false,
    default: extras.default ?? false,
  };
}

describe("speechText", () => {
  it("says the real name so the voice can talk like English, not classroom hyphens", () => {
    expect(speechText("Hydrogen")).toBe("Hydrogen");
    expect(speechText("Molybdenum")).toBe("Molybdenum");
    expect(speechText("Lead")).toBe("led");
  });
});

describe("scoreEnglishVoice", () => {
  it("prefers Google or neural voices over old Microsoft desktop voices", () => {
    const google = fakeVoice("Google US English", "en-US");
    const zira = fakeVoice("Microsoft Zira Desktop", "en-US", { localService: true });
    const neural = fakeVoice("Microsoft Aria Online (Natural)", "en-US");
    expect(scoreEnglishVoice(google)).toBeGreaterThan(scoreEnglishVoice(zira));
    expect(scoreEnglishVoice(neural)).toBeGreaterThan(scoreEnglishVoice(zira));
  });
});

describe("pickEnglishVoiceFrom", () => {
  it("uses published human neural names, not Windows desktop SAPI", () => {
    const zira = fakeVoice("Microsoft Zira Desktop - English (United States)", "en-US", {
      localService: true,
      default: true,
    });
    const david = fakeVoice("Microsoft David Desktop - English (United States)", "en-US", {
      localService: true,
    });
    const google = fakeVoice("Google US English", "en-US");
    const jenny = fakeVoice(
      "Microsoft Jenny Online (Natural) - English (United States)",
      "en-US",
    );
    expect(pickEnglishVoiceFrom([zira, david, google])?.name).toBe("Google US English");
    expect(pickEnglishVoiceFrom([zira, google, jenny])?.name).toBe(
      "Microsoft Jenny Online (Natural) - English (United States)",
    );
    expect(pickEnglishVoiceFrom([david, zira])?.name).not.toBe(
      "Microsoft David Desktop - English (United States)",
    );
  });
});
