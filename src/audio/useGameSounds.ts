import { useEffect, useRef } from "react";
import type { Question } from "../game/types";
import type { QuestionResolution, WrongPick } from "../game/useGame";
import { cancelSpeech, speakElementName } from "./speech";
import { playCorrect, playFail, playTick, playWrong, unlockAudio } from "./sounds";

export function useGameSounds(
  timed: boolean,
  remainingQuestionMs: number | null,
  resolution: QuestionResolution | null,
  wrongPick: WrongPick | null,
  questionNumber: number,
  question: Question | undefined,
) {
  const lastTickSecond = useRef<number | null>(null);
  const lastWrongId = useRef(0);
  const lastResolution = useRef<QuestionResolution | null>(null);
  const lastSpoken = useRef("");

  useEffect(() => {
    lastTickSecond.current = null;
  }, [questionNumber]);

  useEffect(() => {
    return () => cancelSpeech();
  }, []);

  useEffect(() => {
    if (!question) return;
    const name = question.target.name;
    const key = resolution
      ? question.clueKind === "name"
        ? ""
        : `reveal-${question.id}`
      : question.clueKind === "name"
        ? `prompt-${question.id}`
        : "";
    if (!key || key === lastSpoken.current) return;
    lastSpoken.current = key;
    speakElementName(name);
  }, [question, resolution]);

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
