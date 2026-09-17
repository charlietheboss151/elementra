import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../game/elementStats", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../game/elementStats")>();
  return {
    ...actual,
    loadElementStats: () => ({
      79: { first: 4, second: 1, third: 0, miss: 0 },
    }),
  };
});

const { StatsDialog } = await import("./StatsDialog");

describe("StatsDialog", () => {
  it("shows element ranks and a rounds history", () => {
    const html = renderToStaticMarkup(<StatsDialog user="charlie" onClose={() => undefined} />);
    expect(html).toContain("Stats");
    expect(html).toContain("Saved as charlie");
    expect(html).toContain("Element ranks");
    expect(html).toContain("Rounds played");
    expect(html).toContain("Gold (Au)");
  });
});
