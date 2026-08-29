import { accuracyPercent, formatDuration, scoreFromStats } from "../game/engine";
import { formatAnswer, getMode } from "../game/modes";
import { ELEMENT_SET_LABELS } from "../game/types";
import type { GameResult } from "../game/types";

interface ResultsScreenProps {
  result: GameResult;
  onReplay: () => void;
  onHome: () => void;
}

export function ResultsScreen({ result, onReplay, onHome }: ResultsScreenProps) {
  const mode = getMode(result.config.modeId);
  const missed = result.answers.filter((answer) => !answer.correct);
  const total = result.answers.length;
  const maxScore = total * 3;

  return (
    <div className="screen results">
      <p className="eyebrow">Round complete</p>
      <h1>
        {scoreFromStats(result.stats)} / {maxScore}
      </h1>
      <p className="lede">
        {mode.title} · {ELEMENT_SET_LABELS[result.config.elementSet]}
        {result.config.timed ? " · timed" : ""}
      </p>

      <ul className="stats results-stats">
        <li>
          <span>Correct</span>
          <strong>{result.stats.correct}</strong>
        </li>
        <li>
          <span>Incorrect</span>
          <strong>{result.stats.incorrect}</strong>
        </li>
        <li>
          <span>Accuracy</span>
          <strong>{accuracyPercent(result.stats)}%</strong>
        </li>
        <li>
          <span>Time</span>
          <strong>{formatDuration(result.stats.elapsedMs)}</strong>
        </li>
        <li>
          <span>Best streak</span>
          <strong>{result.stats.bestStreak}</strong>
        </li>
      </ul>

      {missed.length > 0 ? (
        <section className="missed">
          <h2>Review</h2>
          <ul>
            {missed.map((answer) => (
              <li key={answer.question.id}>
                <span>{answer.question.prompt}</span>
                <strong>{formatAnswer(answer.question.target)}</strong>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="perfect">Perfect round. The table is yours.</p>
      )}

      <div className="result-actions">
        <button type="button" className="play-button" onClick={onReplay}>
          Play again
        </button>
        <button type="button" className="text-button" onClick={onHome}>
          Home
        </button>
      </div>
    </div>
  );
}
