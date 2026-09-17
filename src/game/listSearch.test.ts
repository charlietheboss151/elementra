import { describe, expect, it } from "vitest";
import { ELEMENTS_BY_NUMBER } from "../data/elements";
import { rankElementsBySearch } from "./listSearch";

function el(n: number) {
  const found = ELEMENTS_BY_NUMBER.get(n);
  if (!found) throw new Error(`missing ${n}`);
  return found;
}

describe("rankElementsBySearch", () => {
  const pool = [el(1), el(26), el(79), el(11), el(16)];

  it("leaves the shuffled order alone when the box is empty", () => {
    expect(rankElementsBySearch(pool, "  ").map((item) => item.symbol)).toEqual([
      "H",
      "Fe",
      "Au",
      "Na",
      "S",
    ]);
  });

  it("puts a symbol match at the top", () => {
    expect(rankElementsBySearch(pool, "fe")[0]?.symbol).toBe("Fe");
    expect(rankElementsBySearch(pool, "AU")[0]?.symbol).toBe("Au");
  });

  it("puts a typed name at the top, including aluminium and sulphur", () => {
    expect(rankElementsBySearch(pool, "iron")[0]?.name).toBe("Iron");
    expect(rankElementsBySearch([el(13), ...pool], "aluminium")[0]?.name).toBe("Aluminum");
    expect(rankElementsBySearch(pool, "sulphur")[0]?.name).toBe("Sulfur");
  });
});
