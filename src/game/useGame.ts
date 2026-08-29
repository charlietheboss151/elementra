import { useCallback, useEffect, useRef, useState } from "react";
import { poolForSet, QUESTION_TIME_MS, setHasHints } from "./elementSets";
import {
  applyAnswer,
  buildQuestions,
  emptyStats,
  isCorrectAnswer,
  markForAnswer,
  shuffle,
  summarizeResult,
} from "./engine";
import { MAX_GUESSES, type AnswerRecord, type GameConfig, type GameResult, type GameStats, type HintState, type Question, type ResolveKind } from "./types";

const SUCCESS_MS = 1100;
const FAIL_MS = 2200;
const WRONG_PICK_MS = 1000;

export type { ResolveKind } from "./types";

export type QuestionResolution = {
  kind: ResolveKind;
  selectedAtomicNumber: number | null;
  timedOut: boolean;
};

export type WrongPick = {
  id: number;
  atomicNumber: number;
};

export function useGame(config: GameConfig, onComplete: (result: GameResult) => void) {
  const [questions] = useState(() => buildQuestions(config));
  const [listElements] = useState(() => shuffle(poolForSet(config.elementSet)));
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState<GameStats>(() => emptyStats(config));
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<number[]>([]);
  const [wrongPick, setWrongPick] = useState<WrongPick | null>(null);
  const [resolution, setResolution] = useState<QuestionResolution | null>(null);
  const [hint, setHint] = useState<HintState>({
    kind: null,
    period: null,
    category: null,
  });
  const locked = useRef(false);
  const statsRef = useRef(stats);
  const answersRef = useRef(answers);
  const indexRef = useRef(index);
  const wrongRef = useRef(wrongGuesses);
  const startedAt = useRef(0);
  const feedbackTimer = useRef<number>(0);
  const wrongPickTimer = useRef<number>(0);
  const wrongPickId = useRef(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
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
    wrongRef.current = wrongGuesses;
  }, [wrongGuesses]);
  useEffect(() => {
    startedAt.current = performance.now();
    return () => {
      window.clearTimeout(feedbackTimer.current);
      window.clearTimeout(wrongPickTimer.current);
    };
  }, []);

  const question: Question | undefined = questions[index];
  const hintsAllowed = setHasHints(config.elementSet);
  const playableNumbers = poolForSet(config.elementSet).map((element) => element.atomicNumber);

  const settle = useCallback(
    (record: AnswerRecord, kind: ResolveKind, selectedAtomicNumber: number | null, timedOut: boolean) => {
      locked.current = true;
      const nextAnswers = [...answersRef.current, record];
      const nextStats = applyAnswer(statsRef.current, record.correct, record.tryNumber);
      answersRef.current = nextAnswers;
      statsRef.current = nextStats;
      setAnswers(nextAnswers);
      setStats(nextStats);
      setResolution({ kind, selectedAtomicNumber, timedOut });
      setHint({ kind: null, period: null, category: null });

      window.clearTimeout(feedbackTimer.current);
      feedbackTimer.current = window.setTimeout(() => {
        const nextIndex = indexRef.current + 1;
        if (nextIndex >= questions.length) {
          onCompleteRef.current(summarizeResult(config, nextAnswers, nextStats));
          return;
        }
        locked.current = false;
        wrongRef.current = [];
        setWrongGuesses([]);
        setWrongPick(null);
        setResolution(null);
        setIndex(nextIndex);
        setStats((prev) => ({
          ...prev,
          remainingQuestionMs: config.timed ? QUESTION_TIME_MS : null,
        }));
      }, kind === "fail" ? FAIL_MS : SUCCESS_MS);
    },
    [config, questions],
  );

  const selectElement = useCallback(
    (atomicNumber: number) => {
      if (locked.current) return;
      const current = questions[indexRef.current];
      if (!current) return;
      if (!playableNumbers.includes(atomicNumber)) return;
      if (wrongRef.current.includes(atomicNumber)) return;
      if (answersRef.current.some((answer) => answer.question.target.atomicNumber === atomicNumber)) {
        return;
      }

      if (isCorrectAnswer(current, atomicNumber)) {
        const tryNumber = (wrongRef.current.length + 1) as 1 | 2 | 3;
        const kind: ResolveKind = tryNumber === 1 ? "try1" : tryNumber === 2 ? "try2" : "try3";
        settle(
          {
            question: current,
            guesses: [...wrongRef.current, atomicNumber],
            correct: true,
            timedOut: false,
            tryNumber,
          },
          kind,
          atomicNumber,
          false,
        );
        return;
      }

      const nextWrong = [...wrongRef.current, atomicNumber];
      wrongRef.current = nextWrong;
      setWrongGuesses(nextWrong);
      wrongPickId.current += 1;
      setWrongPick({ id: wrongPickId.current, atomicNumber });
      window.clearTimeout(wrongPickTimer.current);
      wrongPickTimer.current = window.setTimeout(() => {
        setWrongPick(null);
      }, WRONG_PICK_MS);

      if (nextWrong.length >= MAX_GUESSES) {
        settle(
          {
            question: current,
            guesses: nextWrong,
            correct: false,
            timedOut: false,
            tryNumber: null,
          },
          "fail",
          atomicNumber,
          false,
        );
      }
    },
    [playableNumbers, questions, settle],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (locked.current) return;
      setStats((prev) => {
        const elapsedMs = performance.now() - startedAt.current;
        if (!config.timed) return { ...prev, elapsedMs };
        const remaining = Math.max(0, (prev.remainingQuestionMs ?? 0) - 100);
        return { ...prev, elapsedMs, remainingQuestionMs: remaining };
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [config.timed]);

  useEffect(() => {
    if (!config.timed) return;
    if (resolution) return;
    if ((stats.remainingQuestionMs ?? 1) > 0) return;
    const current = questions[index];
    if (!current || locked.current) return;
    settle(
      {
        question: current,
        guesses: wrongRef.current,
        correct: false,
        timedOut: true,
        tryNumber: null,
      },
      "fail",
      null,
      true,
    );
  }, [config.timed, index, questions, resolution, settle, stats.remainingQuestionMs]);

  const useHint = useCallback(() => {
    if (!hintsAllowed || !question || locked.current) return;
    setHint((prev) => {
      if (config.elementSet !== "all") {
        return {
          kind: "period",
          period: question.target.period,
          category: null,
        };
      }
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
  }, [config.elementSet, hintsAllowed, question]);

  const answeredMarks: Record<number, ResolveKind> = {};
  for (const answer of answers) {
    if (resolution && question && answer.question.id === question.id) continue;
    answeredMarks[answer.question.target.atomicNumber] = markForAnswer(answer);
  }

  return {
    question,
    questionNumber: index + 1,
    totalQuestions: questions.length,
    stats,
    wrongGuesses,
    wrongPick,
    resolution,
    answeredMarks,
    hint,
    hintsAllowed,
    playableNumbers,
    listElements,
    selectElement,
    useHint,
  };
}
