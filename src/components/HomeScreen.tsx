import { poolForSet, QUESTION_TIME_MS } from "../game/elementSets";
import { GAME_MODES } from "../game/modes";
import {
  ELEMENT_SET_IDS,
  ELEMENT_SET_LABELS,
  QUESTION_COUNTS,
  elementSetBlurb,
  type ElementSetId,
  type GameConfig,
  type QuestionCount,
} from "../game/types";
import { CategoryLegend } from "./CategoryLegend";
import { PeriodicTable } from "./PeriodicTable";

function TimerNote({ timed }: { timed: boolean }) {
  if (!timed) return null;
  return ` (${QUESTION_TIME_MS / 1000}s each)`;
}

interface HomeScreenProps {
  config: GameConfig;
  onChange: (config: GameConfig) => void;
  onPlay: () => void;
}

export function HomeScreen({ config, onChange, onPlay }: HomeScreenProps) {
  const selectedMode = GAME_MODES.find((mode) => mode.id === config.modeId);
  const poolCount = poolForSet(config.elementSet).length;

  return (
    <div className="screen home">
      <header className="hero">
        <p className="eyebrow">Periodic table quiz</p>
        <h1>Find it on the table.</h1>
        <p className="lede">
          A Seterra-style practice game: read a prompt, click the right element,
          and learn the table by repetition. Three guesses per question.
        </p>
      </header>

      <section className="setup-card">
        <h2>Play</h2>
        <div className="mode-grid">
          {GAME_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`mode-card ${config.modeId === mode.id ? "is-selected" : ""}`}
              onClick={() => onChange({ ...config, modeId: mode.id })}
            >
              <strong>{mode.title}</strong>
              <span>{mode.description}</span>
            </button>
          ))}
        </div>

        <div className="setup-row">
          <div>
            <h3>Element group</h3>
            <div className="pills">
              {ELEMENT_SET_IDS.map((setId: ElementSetId) => (
                <button
                  key={setId}
                  type="button"
                  className={`group-pill ${config.elementSet === setId ? "is-selected" : ""}`}
                  onClick={() => onChange({ ...config, elementSet: setId })}
                >
                  <span className={`legend-swatch ${setId === "all" ? "swatch-all" : `tile--${setId}`}`} />
                  {ELEMENT_SET_LABELS[setId]}
                </button>
              ))}
            </div>
            <p className="hint-text">{elementSetBlurb(config.elementSet, poolCount)}</p>
          </div>
          <div>
            <h3>Questions</h3>
            <div className="pills">
              {QUESTION_COUNTS.map((count: QuestionCount) => (
                <button
                  key={count}
                  type="button"
                  className={config.questionCount === count ? "is-selected" : ""}
                  onClick={() => onChange({ ...config, questionCount: count })}
                >
                  {count}
                </button>
              ))}
            </div>
            <label className="timer-toggle">
              <input
                type="checkbox"
                checked={config.timed}
                onChange={(event) => onChange({ ...config, timed: event.target.checked })}
              />
              Race the clock
              <TimerNote timed={config.timed} />
            </label>
          </div>
        </div>

        <button type="button" className="play-button" onClick={onPlay}>
          Start {selectedMode?.title}
        </button>
      </section>

      <section className="preview">
        <h2>The table is the answer sheet</h2>
        <p>
          Pick a chemical family — or the whole table — then click to answer.
          First try lights green, second yellow, third orange. Miss all three
          and the right element turns red.
        </p>
        <PeriodicTable
          reveal={{ atomicNumber: true, symbol: true, name: true }}
          hint={{ kind: null, period: null, category: null }}
          correctAtomicNumber={null}
          wrongGuesses={[]}
          resolution={null}
          playableNumbers={poolForSet(config.elementSet).map((element) => element.atomicNumber)}
          disabled
          onSelect={() => undefined}
        />
        <CategoryLegend />
      </section>
    </div>
  );
}
