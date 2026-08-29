import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DIFFICULTY_SETTINGS } from "./difficulty";
import {
  applyAnswer,
  buildQuestions,
  emptyStats,
  summarizeResult,
} from "./engine";
import type {
  AnswerRecord,
  GameConfig,
  GameResult,
  GameStats,
  HintState,
  Question,
} from "./types";

const FEEDBACK_MS = 850;

export type Feedback = {
  selectedAtomicNumber: number | null;
  correct: boolean;
  timedOut: boolean;
} | null;

export function useGame(config: GameConfig, onComplete: (result: GameResult) => void) {
  const questions = useMemo(() => buildQuestions(config), [config]);
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState<GameStats>(() => emptyStats(config));
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [hint, setHint] = useState<HintState>({
    kind: null,
    period: null,
    category: null,
  });
  const locked = useRef(false);
  const statsRef = useRef(stats);
  const answersRef = useRef(answers);
  const indexRef = useRef(index);
  const startedAt = useRef(0);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  const question: Question | undefined = questions[index];
  const settings = DIFFICULTY_SETTINGS[config.difficulty];

  const finishAnswer = useCallback(
    (selectedAtomicNumber: number | null, timedOut: boolean) => {
      if (locked.current) return;
      const current = questions[indexRef.current];
      if (!current) return;
      locked.current = true;

      const correct =
        !timedOut && selectedAtomicNumber === current.target.atomicNumber;
      const record: AnswerRecord = {
        question: current,
        selectedAtomicNumber,
        correct,
        timedOut,
      };
      const nextAnswers = [...answersRef.current, record];
      const nextStats = applyAnswer(statsRef.current, correct);
      answersRef.current = nextAnswers;
      statsRef.current = nextStats;
      setAnswers(nextAnswers);
      setStats(nextStats);
      setFeedback({ selectedAtomicNumber, correct, timedOut });
      setHint({ kind: null, period: null, category: null });

      window.setTimeout(() => {
        const nextIndex = indexRef.current + 1;
        if (nextIndex >= questions.length) {
          onComplete(summarizeResult(config, nextAnswers, nextStats));
          return;
        }
        locked.current = false;
        setIndex(nextIndex);
        setFeedback(null);
        setStats((prev) => ({
          ...prev,
          remainingQuestionMs: config.timed ? settings.questionTimeMs : null,
        }));
      }, FEEDBACK_MS);
    },
    [config, onComplete, questions, settings.questionTimeMs],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (locked.current) return;
      setStats((prev) => {
        const elapsedMs = performance.now() - startedAt.current;
        if (!config.timed || settings.questionTimeMs == null) {
          return { ...prev, elapsedMs };
        }
        const remaining = Math.max(0, (prev.remainingQuestionMs ?? 0) - 100);
        return { ...prev, elapsedMs, remainingQuestionMs: remaining };
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [config.timed, settings.questionTimeMs]);

  useEffect(() => {
    if (!config.timed || settings.questionTimeMs == null) return;
    if (feedback) return;
    if ((stats.remainingQuestionMs ?? 1) > 0) return;
    finishAnswer(null, true);
  }, [config.timed, feedback, finishAnswer, settings.questionTimeMs, stats.remainingQuestionMs]);

  const selectElement = useCallback(
    (atomicNumber: number) => {
      finishAnswer(atomicNumber, false);
    },
    [finishAnswer],
  );

  const useHint = useCallback(() => {
    if (!settings.hints || !question || locked.current) return;
    setHint((prev) => {
      if (prev.kind === "category") return prev;
      if (prev.kind === "period") {
        return {
          kind: "category",
          period: question.target.period,
          category: question.target.category,
        };
      }
      return {
        kind: "period",
        period: question.target.period,
        category: null,
      };
    });
  }, [question, settings.hints]);

  return {
    question,
    questionNumber: index + 1,
    totalQuestions: questions.length,
    stats,
    feedback,
    hint,
    hintsAllowed: settings.hints,
    selectElement,
    useHint,
  };
}
