import { describe, expect, it } from "vitest";
import { ELEMENTS_BY_NUMBER } from "../data/elements";
import { tileAriaLabel, tileShowCheckmark, tileShowsField } from "./elementTile";

const hydrogen = ELEMENTS_BY_NUMBER.get(1)!;

describe("tileAriaLabel", () => {
  it("does not speak hidden name, symbol, or number until the tile is identified", () => {
    expect(
      tileAriaLabel(hydrogen, { atomicNumber: true, symbol: true, name: false }),
    ).toBe("H, atomic number 1");
    expect(
      tileAriaLabel(hydrogen, { atomicNumber: true, symbol: false, name: true }),
    ).toBe("Hydrogen, atomic number 1");
    expect(
      tileAriaLabel(hydrogen, { atomicNumber: true, symbol: false, name: false }),
    ).toBe("atomic number 1");
    expect(
      tileAriaLabel(hydrogen, { atomicNumber: false, symbol: false, name: false }),
    ).toBe("period 1, group 1");
    expect(
      tileAriaLabel(hydrogen, { atomicNumber: false, symbol: true, name: true }),
    ).toBe("Hydrogen, H");
    expect(
      tileAriaLabel(hydrogen, { atomicNumber: true, symbol: true, name: false }, true),
    ).toBe("Hydrogen, H, atomic number 1");
  });
});

describe("tileShowsField", () => {
  it("reveals every field once the tile is identified", () => {
    const hidden = { atomicNumber: false, symbol: false, name: false };
    expect(tileShowsField(hidden, false, "name")).toBe(false);
    expect(tileShowsField(hidden, true, "name")).toBe(true);
    expect(tileShowsField(hidden, true, "symbol")).toBe(true);
    expect(tileShowsField(hidden, true, "atomicNumber")).toBe(true);
  });
});

describe("tileShowCheckmark", () => {
  it("shows a checkmark for solved hits but not failed questions", () => {
    expect(tileShowCheckmark(1, { 1: "try1" }, null)).toBe(true);
    expect(tileShowCheckmark(1, { 1: "fail" }, null)).toBe(false);
    expect(
      tileShowCheckmark(1, {}, { kind: "try2", selectedAtomicNumber: 1, timedOut: false }),
    ).toBe(true);
    expect(
      tileShowCheckmark(1, {}, { kind: "fail", selectedAtomicNumber: 2, timedOut: true }),
    ).toBe(false);
  });
});
