import {
  accuracyPercent,
  formatDuration,
  guessesLeft,
  remainingAfterCurrent,
  scoreFromStats,
} from "../game/engine";
import { ELEMENT_SET_LABELS } from "../game/types";
import { formatAnswer, getMode } from "../game/modes";
import type { GameConfig, GameResult } from "../game/types";
import { MAX_GUESSES } from "../game/types";
import { useGame } from "../game/useGame";
import { CategoryLegend } from "./CategoryLegend";
import { PeriodicTable } from "./PeriodicTable";
import { WrongPickToast } from "./WrongPickToast";

interface GameScreenProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

function kicker(resolution: ReturnType<typeof useGame>["resolution"], timedOut: boolean) {
  if (!resolution) return "Click the element — 3 guesses";
  if (resolution.kind === "try1") return "First try";
  if (resolution.kind === "try2") return "Second try";
  if (resolution.kind === "try3") return "Third try";
  return timedOut ? "Time’s up" : "Out of guesses";
}

export function GameScreen({ config, onComplete, onQuit }: GameScreenProps) {
  const game = useGame(config, onComplete);
  if (!game.question) return null;

  const mode = getMode(config.modeId);
  const answered = game.stats.correct + game.stats.incorrect;
  const waiting = game.resolution != null;
  const left = game.resolution ? 0 : guessesLeft(game.wrongGuesses.length);
  const usedPips = game.resolution
    ? game.resolution.kind === "fail"
      ? MAX_GUESSES
      : game.wrongGuesses.length + 1
    : game.wrongGuesses.length;
  const cardTone =
    game.resolution?.kind === "try1"
      ? "is-try1"
      : game.resolution?.kind === "try2"
        ? "is-try2"
        : game.resolution?.kind === "try3"
          ? "is-try3"
          : game.resolution?.kind === "fail"
            ? "is-fail"
            : "";

  return (
    <div className="screen play">
      <WrongPickToast pick={game.wrongPick} />
      <div className="play-bar">
        <button type="button" className="text-button" onClick={onQuit}>
          Quit
        </button>
        <p className="mode-chip">
          {mode.title} · {ELEMENT_SET_LABELS[config.elementSet]}
        </p>
        <p className="progress">
          {game.questionNumber} / {game.totalQuestions}
        </p>
      </div>

      <div className={`prompt-card ${cardTone}`}>
        <p className="prompt-kicker">{kicker(game.resolution, game.resolution?.timedOut ?? false)}</p>
        <h1>{game.question.prompt}</h1>
        <div className="guess-pips" aria-label={`${left} guesses left`}>
          {Array.from({ length: MAX_GUESSES }, (_, i) => (
            <span
              key={i}
              className={`guess-pip ${i < usedPips ? "is-used" : ""} ${game.resolution?.kind === "fail" ? "is-fail" : ""}`}
            />
          ))}
        </div>
        {game.resolution ? (
          <p className={`answer-banner ${game.resolution.kind === "fail" ? "answer-banner--fail" : "answer-banner--ok"}`}>
            {game.resolution.kind === "fail" ? "The correct element is" : "That’s"}
            <strong> {formatAnswer(game.question.target)}</strong>
          </p>
        ) : (
          <p className="guess-count">{left} guess{left === 1 ? "" : "es"} left</p>
        )}
      </div>

      <ul className="stats">
        <li>
          <span>Question</span>
          <strong>
            {game.questionNumber}/{game.totalQuestions}
          </strong>
        </li>
        <li>
          <span>Left</span>
          <strong>{remainingAfterCurrent(game.totalQuestions, game.questionNumber)}</strong>
        </li>
        <li>
          <span>Score</span>
          <strong>{scoreFromStats(game.stats)}</strong>
        </li>
        <li>
          <span>Correct</span>
          <strong>{game.stats.correct}</strong>
        </li>
        <li>
          <span>Incorrect</span>
          <strong>{game.stats.incorrect}</strong>
        </li>
        <li>
          <span>Accuracy</span>
          <strong>{answered ? `${accuracyPercent(game.stats)}%` : "—"}</strong>
        </li>
        <li>
          <span>Time</span>
          <strong>{formatDuration(game.stats.elapsedMs)}</strong>
        </li>
        <li>
          <span>Streak</span>
          <strong>{game.stats.streak}</strong>
        </li>
        {config.timed && game.stats.remainingQuestionMs != null ? (
          <li>
            <span>This Q</span>
            <strong>{Math.ceil(game.stats.remainingQuestionMs / 1000)}s</strong>
          </li>
        ) : null}
      </ul>

      {game.hintsAllowed ? (
        <button type="button" className="hint-button" onClick={game.useHint} disabled={waiting}>
          Hint
        </button>
      ) : null}

      <PeriodicTable
        reveal={game.question.reveal}
        hint={game.hint}
        correctAtomicNumber={game.question.target.atomicNumber}
        wrongGuesses={game.wrongGuesses}
        resolution={game.resolution}
        answeredMarks={game.answeredMarks}
        playableNumbers={game.playableNumbers}
        disabled={waiting}
        onSelect={game.selectElement}
      />
      <CategoryLegend />
    </div>
  );
}
