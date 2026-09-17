import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HowToPlayDialog } from "./HowToPlayDialog";

describe("HowToPlayDialog", () => {
  it("explains modes, scoring, and hints", () => {
    const html = renderToStaticMarkup(<HowToPlayDialog onClose={() => undefined} />);
    expect(html).toContain("How to Play");
    expect(html).toContain("Find by name");
    expect(html).toContain("Atomic number");
    expect(html).toContain("A first try is 1 point");
    expect(html).toContain("Hint lights the period");
    expect(html).toContain("shuffled list");
  });
});
