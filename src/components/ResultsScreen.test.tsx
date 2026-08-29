import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ELEMENTS_BY_NUMBER } from "../data/elements";
import type { GameResult } from "../game/types";
import { ResultsScreen } from "./ResultsScreen";

function perfectAlkaliRound(): GameResult {
  const numbers = [3, 11, 19, 37, 55, 87];
  return {
    config: { modeId: "find-element", elementSet: "alkali-metal", timed: false },
    answers: numbers.map((atomicNumber, i) => {
      const target = ELEMENTS_BY_NUMBER.get(atomicNumber);
      if (!target) throw new Error(`missing element ${atomicNumber}`);
      return {
        question: {
          id: i + 1,
          target,
          prompt: `Find ${target.name}`,
          clueKind: "name" as const,
          reveal: { atomicNumber: true, symbol: true, name: false },
        },
        guesses: [atomicNumber],
        correct: true,
        timedOut: false,
        tryNumber: 1 as const,
      };
    }),
    stats: {
      score: 18,
      correct: 6,
      incorrect: 0,
      streak: 6,
      bestStreak: 6,
      elapsedMs: 1000,
      remainingQuestionMs: null,
    },
  };
}

describe("ResultsScreen", () => {
  it("shows 6/6 found and 6/6 score for a perfect six-element group", () => {
    const html = renderToStaticMarkup(
      <ResultsScreen result={perfectAlkaliRound()} onReplay={() => undefined} onHome={() => undefined} />,
    );
    expect(html).toContain("<h1>6 / 6</h1>");
    expect(html).not.toContain("18 / 18");
    expect(html).toContain(">6 / 6</strong>");
  });
});
