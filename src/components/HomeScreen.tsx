import { DIFFICULTY_SETTINGS } from "../game/difficulty";
import { GAME_MODES } from "../game/modes";
import { DIFFICULTIES, QUESTION_COUNTS, type Difficulty, type GameConfig, type QuestionCount } from "../game/types";
import { CategoryLegend } from "./CategoryLegend";
import { PeriodicTable } from "./PeriodicTable";

function TimerNote({ timed, difficulty }: { timed: boolean; difficulty: Difficulty }) {
  const limitMs = DIFFICULTY_SETTINGS[difficulty].questionTimeMs;
  if (!timed) return null;
  if (limitMs == null) return " (untimed on Easy)";
  return ` (${limitMs / 1000}s each)`;
}

interface HomeScreenProps {
  config: GameConfig;
  onChange: (config: GameConfig) => void;
  onPlay: () => void;
}

export function HomeScreen({ config, onChange, onPlay }: HomeScreenProps) {
  const selectedMode = GAME_MODES.find((mode) => mode.id === config.modeId);

  return (
    <div className="screen home">
      <header className="hero">
        <p className="eyebrow">Periodic table quiz</p>
        <h1>Find it on the table.</h1>
        <p className="lede">
          A Seterra-style practice game: read a prompt, click the right element,
          and learn the table by repetition.
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
            <h3>Difficulty</h3>
            <div className="pills">
              {DIFFICULTIES.map((difficulty: Difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  className={config.difficulty === difficulty ? "is-selected" : ""}
                  onClick={() => onChange({ ...config, difficulty })}
                >
                  {DIFFICULTY_SETTINGS[difficulty].label}
                </button>
              ))}
            </div>
            <p className="hint-text">{DIFFICULTY_SETTINGS[config.difficulty].blurb}</p>
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
              <TimerNote timed={config.timed} difficulty={config.difficulty} />
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
          Every tile is clickable. During a round we hide the details that would
          give the question away.
        </p>
        <PeriodicTable
          reveal={{ atomicNumber: true, symbol: true, name: true }}
          feedback={null}
          hint={{ kind: null, period: null, category: null }}
          correctAtomicNumber={null}
          disabled
          onSelect={() => undefined}
        />
        <CategoryLegend />
      </section>
    </div>
  );
}
