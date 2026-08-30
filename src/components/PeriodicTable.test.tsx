import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PeriodicTable } from "./PeriodicTable";

const hidden = { atomicNumber: false, symbol: false, name: false };

describe("PeriodicTable", () => {
  it("does not print atomic numbers when the clue hides them", () => {
    const html = renderToStaticMarkup(
      <PeriodicTable
        reveal={hidden}
        hint={{ kind: null, period: null, category: null }}
        correctAtomicNumber={null}
        wrongGuesses={[]}
        resolution={null}
        answeredMarks={{}}
        playableNumbers={[1]}
        disabled
        onSelect={() => undefined}
      />,
    );
    expect(html).toContain('tile-number">·<');
    expect(html).not.toContain('tile-number">1<');
  });

  it("renders hover fact cards in explorer mode", () => {
    const html = renderToStaticMarkup(
      <PeriodicTable
        explorer
        reveal={{ atomicNumber: true, symbol: true, name: true }}
        hint={{ kind: null, period: null, category: null }}
        correctAtomicNumber={null}
        wrongGuesses={[]}
        resolution={null}
        answeredMarks={{}}
        playableNumbers={[1, 2, 3]}
        disabled
        onSelect={() => undefined}
      />,
    );
    expect(html).toContain("periodic-table--explorer");
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("Hydrogen (H)");
    expect(html).toContain("tile-tip-facts");
  });
});
