import { describe, expect, it } from "vitest";
import { spokenForm } from "./speech";

describe("spokenForm", () => {
  it("keeps ordinary names and respells ones TTS often gets wrong", () => {
    expect(spokenForm("Hydrogen")).toBe("Hydrogen");
    expect(spokenForm("Lead")).toBe("led");
    expect(spokenForm("Iron")).toBe("eye urn");
    expect(spokenForm("Yttrium")).toBe("it tree um");
  });
});
