import { playUi } from "../audio/sounds";
import { accuracyPercent, formatDuration, formatScore } from "../game/engine";
import { formatAnswer, getMode } from "../game/modes";
import {
  defaultStore,
  deltaVsPrevious,
  entriesForSetup,
  loadEntries,
} from "../game/scoreboard";
import { ELEMENT_SET_LABELS } from "../game/types";
import type { GameResult } from "../game/types";
import { ElementRanks } from "./ElementRanks";
import { Scoreboard } from "./Scoreboard";

interface ResultsScreenProps {
  result: GameResult;
  entryId: string;
  user: string | null;
  onReplay: () => void;
  onHome: () => void;
}

export function ResultsScreen({ result, entryId, user, onReplay, onHome }: ResultsScreenProps) {
  const mode = getMode(result.config.modeId);
  const missed = result.answers.filter((answer) => !answer.correct);
  const total = result.answers.length;
  const history = loadEntries(defaultStore(), user);
  const setupRows = entriesForSetup(history, result.config).slice(0, 12);
  const compare = deltaVsPrevious(history, entryId);

  return (
    <div className="screen results">
      <p className="eyebrow">Round complete</p>
      <h1>
        {result.stats.correct} / {total}
      </h1>
      <p className="lede">
        {mode.title} · {ELEMENT_SET_LABELS[result.config.elementSet]}
        {result.config.timed ? " · timed" : ""}
      </p>

      <ul className="stats results-stats">
        <li>
          <span>Score</span>
          <strong>
            {formatScore(result.stats)} / {total}
          </strong>
        </li>
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

      <ElementRanks user={user} />

      <Scoreboard
        title="Scoreboard"
        entries={setupRows}
        highlightId={entryId}
        compare={compare}
        empty="Finish a round to start this board."
      />

      <div className="result-actions">
        <button
          type="button"
          className="play-button"
          onClick={() => {
            playUi();
            onReplay();
          }}
        >
          Play again
        </button>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            playUi();
            onHome();
          }}
        >
          Home
        </button>
      </div>
    </div>
  );
}
