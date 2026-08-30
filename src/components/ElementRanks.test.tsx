import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { rankRowsToShow } from "./ElementRanks";

vi.mock("../game/elementStats", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../game/elementStats")>();
  return {
    ...actual,
    loadElementStats: () => ({
      1: { first: 5, second: 0, third: 0, miss: 0 },
      8: { first: 4, second: 0, third: 0, miss: 0 },
      6: { first: 3, second: 0, third: 0, miss: 0 },
      26: { first: 2, second: 0, third: 0, miss: 0 },
    }),
  };
});

const { ElementRanks } = await import("./ElementRanks");

describe("rankRowsToShow", () => {
  it("keeps the first three until you expand", () => {
    const rows = [1, 2, 3, 4, 5];
    expect(rankRowsToShow(rows, false)).toEqual([1, 2, 3]);
    expect(rankRowsToShow(rows, true)).toEqual(rows);
    expect(rankRowsToShow([1, 2], false)).toEqual([1, 2]);
  });
});

describe("ElementRanks", () => {
  it("shows the top three and a Show more control when there are more rows", () => {
    const html = renderToStaticMarkup(<ElementRanks user="charlie" />);
    expect(html).toContain("Hydrogen");
    expect(html).toContain("Oxygen");
    expect(html).toContain("Carbon");
    expect(html).not.toContain("Iron");
    expect(html).toContain("Show more");
  });
});
