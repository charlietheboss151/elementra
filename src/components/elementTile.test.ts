import { describe, expect, it } from "vitest";
import { ELEMENTS_BY_NUMBER } from "../data/elements";
import { tileAriaLabel } from "./elementTile";

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
