import { accuracyPercent, formatDuration, scoreFromStats } from "../game/engine";
import { getMode } from "../game/modes";
import type { GameConfig } from "../game/types";
import { useGame } from "../game/useGame";
import type { GameResult } from "../game/types";
import { CategoryLegend } from "./CategoryLegend";
import { PeriodicTable } from "./PeriodicTable";

interface GameScreenProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function GameScreen({ config, onComplete, onQuit }: GameScreenProps) {
  const game = useGame(config, onComplete);
  if (!game.question) return null;

  const mode = getMode(config.modeId);
  const answered = game.stats.correct + game.stats.incorrect;
  const waiting = game.feedback != null;

  return (
    <div className="screen play">
      <div className="play-bar">
        <button type="button" className="text-button" onClick={onQuit}>
          Quit
        </button>
        <p className="mode-chip">
          {mode.title} · {config.difficulty}
        </p>
        <p className="progress">
          {game.questionNumber} / {game.totalQuestions}
        </p>
      </div>

      <div className={`prompt-card ${game.feedback?.correct ? "is-correct" : ""} ${game.feedback && !game.feedback.correct ? "is-wrong" : ""}`}>
        <p className="prompt-kicker">
          {game.feedback
            ? game.feedback.correct
              ? "Correct"
              : game.feedback.timedOut
                ? "Time’s up"
                : "Not quite"
            : "Click the element"}
        </p>
        <h1>{game.question.prompt}</h1>
        {game.feedback && !game.feedback.correct ? (
          <p className="reveal-line">
            Answer: {game.question.target.name} ({game.question.target.symbol}), #
            {game.question.target.atomicNumber}
          </p>
        ) : null}
      </div>

      <ul className="stats">
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
            <span>Question</span>
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
        feedback={game.feedback}
        hint={game.hint}
        correctAtomicNumber={game.question.target.atomicNumber}
        disabled={waiting}
        onSelect={game.selectElement}
      />
      <CategoryLegend />
    </div>
  );
}
