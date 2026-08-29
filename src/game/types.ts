import type { ChemicalElement, ElementCategory } from "../data/elements";

export const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const QUESTION_COUNTS = [10, 20, 50] as const;
export type QuestionCount = (typeof QUESTION_COUNTS)[number];

export type ClueKind =
  | "name"
  | "symbol"
  | "atomic-number"
  | "protons"
  | "electrons"
  | "category-protons";

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
  difficulty: Difficulty;
  questionCount: QuestionCount;
  timed: boolean;
}

export interface AnswerRecord {
  question: Question;
  selectedAtomicNumber: number | null;
  correct: boolean;
  timedOut: boolean;
}

export interface GameStats {
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

export interface DifficultySettings {
  label: string;
  blurb: string;
  questionTimeMs: number | null;
  hints: boolean;
  pool: (elements: ChemicalElement[]) => ChemicalElement[];
}

export interface GameModeDefinition {
  id: string;
  title: string;
  description: string;
  clueKinds: (difficulty: Difficulty) => ClueKind[];
}

export type HintKind = "period" | "category" | null;

export interface HintState {
  kind: HintKind;
  period: number | null;
  category: ElementCategory | null;
}
