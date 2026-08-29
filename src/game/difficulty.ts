import type { Difficulty, DifficultySettings } from "./types";

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: {
    label: "Easy",
    blurb: "Common classroom elements, visible labels, and hints.",
    questionTimeMs: null,
    hints: true,
    pool: (elements) => elements.filter((element) => element.common),
  },
  medium: {
    label: "Medium",
    blurb: "Main-group and familiar metals through xenon.",
    questionTimeMs: 25_000,
    hints: true,
    pool: (elements) => elements.filter((element) => element.atomicNumber <= 54),
  },
  hard: {
    label: "Hard",
    blurb: "The full table through radon, with fewer labels.",
    questionTimeMs: 15_000,
    hints: false,
    pool: (elements) => elements.filter((element) => element.atomicNumber <= 86),
  },
  expert: {
    label: "Expert",
    blurb: "All 118 elements, blank tiles, and tight timing.",
    questionTimeMs: 10_000,
    hints: false,
    pool: (elements) => elements,
  },
};
