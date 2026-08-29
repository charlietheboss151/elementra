import { poolForSet, QUESTION_TIME_MS } from "./elementSets";
import { getMode, promptFor, revealFor } from "./modes";
import type {
  AnswerRecord,
  ClueKind,
  GameConfig,
  GameResult,
  GameStats,
  Question,
} from "./types";
import { MAX_GUESSES } from "./types";

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickPool(config: GameConfig) {
  return poolForSet(config.elementSet);
}

export function buildQuestions(config: GameConfig): Question[] {
  const mode = getMode(config.modeId);
  const pool = pickPool(config);
  if (pool.length === 0) {
    throw new Error("Element pool is empty for this group.");
  }

  const clues = mode.clueKinds(config.elementSet);
  const questions: Question[] = [];
  let remaining = shuffle(pool);

  for (let i = 0; i < config.questionCount; i += 1) {
    if (remaining.length === 0) {
      remaining = shuffle(pool);
    }
    const target = remaining.pop()!;
    const clueKind = clues[Math.floor(Math.random() * clues.length)] as ClueKind;
    questions.push({
      id: i + 1,
      target,
      clueKind,
      prompt: promptFor(target, clueKind),
      reveal: revealFor(clueKind),
    });
  }

  return questions;
}

export function emptyStats(config: GameConfig): GameStats {
  return {
    score: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
    elapsedMs: 0,
    remainingQuestionMs: config.timed ? QUESTION_TIME_MS : null,
  };
}

export function pointsForTry(tryNumber: 1 | 2 | 3): number {
  return 4 - tryNumber;
}

export function applyAnswer(
  stats: GameStats,
  correct: boolean,
  tryNumber: 1 | 2 | 3 | null,
): GameStats {
  const nextStreak = correct ? stats.streak + 1 : 0;
  const points = correct && tryNumber ? pointsForTry(tryNumber) : 0;
  return {
    ...stats,
    score: stats.score + points,
    correct: stats.correct + (correct ? 1 : 0),
    incorrect: stats.incorrect + (correct ? 0 : 1),
    streak: nextStreak,
    bestStreak: Math.max(stats.bestStreak, nextStreak),
  };
}

export function accuracyPercent(stats: Pick<GameStats, "correct" | "incorrect">): number {
  const total = stats.correct + stats.incorrect;
  if (total === 0) return 0;
  return Math.round((stats.correct / total) * 1000) / 10;
}

export function scoreFromStats(stats: Pick<GameStats, "score">): number {
  return stats.score;
}

export function isCorrectAnswer(
  question: Question,
  selectedAtomicNumber: number | null,
): boolean {
  return selectedAtomicNumber === question.target.atomicNumber;
}

export function remainingAfterCurrent(total: number, questionNumber: number): number {
  return Math.max(0, total - questionNumber);
}

export function guessesLeft(guessCount: number): number {
  return Math.max(0, MAX_GUESSES - guessCount);
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function summarizeResult(
  config: GameConfig,
  answers: AnswerRecord[],
  stats: GameStats,
): GameResult {
  return { config, answers, stats };
}
