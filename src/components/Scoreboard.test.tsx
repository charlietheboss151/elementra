import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Scoreboard } from "./Scoreboard";
import type { ScoreboardEntry } from "../game/scoreboard";

const incompleteRow: ScoreboardEntry = {
  id: "quit-1",
  at: Date.parse("2026-08-29T12:00:00Z"),
  modeId: "find-element",
  elementSet: "alkali-metal",
  timed: false,
  accuracy: 66.7,
  elapsedMs: 12_000,
  correct: 2,
  total: 3,
  score: 6,
  incomplete: true,
};

describe("Scoreboard", () => {
  it("labels a quit as Incomplete and still shows percent, time, and score", () => {
    const html = renderToStaticMarkup(
      <Scoreboard
        title="Scoreboard"
        entries={[incompleteRow]}
        empty="none"
      />,
    );
    expect(html).toContain("Incomplete");
    expect(html).toContain("<td>2</td>");
    expect(html).toContain("66.7%");
    expect(html).toContain("0:12");
  });
});
