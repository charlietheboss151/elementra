import { useEffect, useRef } from "react";
import { playCorrect, playFail, playTick, playWrong, unlockAudio } from "./sounds";
import type { QuestionResolution, WrongPick } from "../game/useGame";

export function useGameSounds(
  timed: boolean,
  remainingQuestionMs: number | null,
  resolution: QuestionResolution | null,
  wrongPick: WrongPick | null,
  questionNumber: number,
) {
  const lastTickSecond = useRef<number | null>(null);
  const lastWrongId = useRef(0);
  const lastResolution = useRef<QuestionResolution | null>(null);

  useEffect(() => {
    lastTickSecond.current = null;
  }, [questionNumber]);

  useEffect(() => {
    if (!resolution || resolution === lastResolution.current) return;
    lastResolution.current = resolution;
    unlockAudio();
    if (resolution.kind === "fail") playFail();
    else playCorrect();
  }, [resolution]);

  useEffect(() => {
    if (!wrongPick || resolution || wrongPick.id === lastWrongId.current) return;
    lastWrongId.current = wrongPick.id;
    unlockAudio();
    playWrong();
  }, [wrongPick, resolution]);

  useEffect(() => {
    if (!timed || resolution || remainingQuestionMs == null) return;
    if (remainingQuestionMs > 10_000 || remainingQuestionMs <= 0) return;
    const second = Math.ceil(remainingQuestionMs / 1000);
    if (second === lastTickSecond.current) return;
    lastTickSecond.current = second;
    playTick(second <= 3);
  }, [timed, remainingQuestionMs, resolution]);
}
