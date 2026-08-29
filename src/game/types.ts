import { CATEGORIES, CATEGORY_LABELS } from "../data/elements";
import type { ChemicalElement, ElementCategory } from "../data/elements";

export const ELEMENT_SET_IDS = ["all", ...CATEGORIES] as const;
export type ElementSetId = (typeof ELEMENT_SET_IDS)[number];

export const MAX_GUESSES = 3;

export type ResolveKind = "try1" | "try2" | "try3" | "fail";

export type ClueKind = "name" | "symbol" | "atomic-number" | "electrons";

export interface TileReveal {
  atomicNumber: boolean;
  symbol: boolean;
  name: boolean;
}

export interface Question {
  id: number;
  target: ChemicalElement;
  prompt: string;
  clueKind: ClueKind;
  reveal: TileReveal;
}

export interface GameConfig {
  modeId: string;
  elementSet: ElementSetId;
  timed: boolean;
}

export interface AnswerRecord {
  question: Question;
  guesses: number[];
  correct: boolean;
  timedOut: boolean;
  tryNumber: 1 | 2 | 3 | null;
}

export interface GameStats {
  score: number;
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
  elapsedMs: number;
  remainingQuestionMs: number | null;
}

export interface GameResult {
  config: GameConfig;
  answers: AnswerRecord[];
  stats: GameStats;
}

export interface GameModeDefinition {
  id: string;
  title: string;
  description: string;
  clueKinds: (elementSet: ElementSetId) => ClueKind[];
}

export type HintKind = "period" | "category" | null;

export interface HintState {
  kind: HintKind;
  period: number | null;
  category: ElementCategory | null;
}

export const ELEMENT_SET_LABELS: Record<ElementSetId, string> = {
  all: "All elements",
  ...CATEGORY_LABELS,
};

export function elementSetBlurb(setId: ElementSetId, count: number): string {
  if (setId === "all") {
    return `Practice the whole table (${count} questions, one per element). Three guesses each.`;
  }
  return `Only the ${CATEGORY_LABELS[setId].toLowerCase()} group — ${count} element${count === 1 ? "" : "s"}, one question each.`;
}
