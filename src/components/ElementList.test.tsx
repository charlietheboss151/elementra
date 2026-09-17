import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ELEMENTS_BY_NUMBER } from "../data/elements";
import { ElementList } from "./ElementList";

function el(n: number) {
  const found = ELEMENTS_BY_NUMBER.get(n);
  if (!found) throw new Error(`missing ${n}`);
  return found;
}

const board = {
  reveal: { atomicNumber: false, symbol: true, name: true },
  hint: { kind: null, period: null, category: null } as const,
  correctAtomicNumber: null,
  wrongGuesses: [] as number[],
  resolution: null,
  answeredMarks: {},
  playableNumbers: [1, 26, 79],
  disabled: true,
  onSelect: () => undefined,
};

describe("ElementList", () => {
  it("adds a name-or-symbol search on the shuffled list", () => {
    const html = renderToStaticMarkup(
      <ElementList elements={[el(1), el(26), el(79)]} searchable startQuery="fe" {...board} />,
    );
    expect(html).toContain('placeholder="Name or symbol"');
    expect(html.indexOf('data-atomic-number="26"')).toBeLessThan(html.indexOf('data-atomic-number="1"'));
  });
});
