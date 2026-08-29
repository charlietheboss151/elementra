import { poolForSet, QUESTION_TIME_MS } from "../game/elementSets";
import { GAME_MODES, usesListLayout } from "../game/modes";
import {
  ELEMENT_SET_IDS,
  ELEMENT_SET_LABELS,
  elementSetBlurb,
  type ElementSetId,
  type GameConfig,
} from "../game/types";
import { CategoryLegend } from "./CategoryLegend";
import { ElementList } from "./ElementList";
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
  const pool = poolForSet(config.elementSet);
  const poolCount = pool.length;
  const previewList = [...pool].sort((a, b) => a.name.localeCompare(b.name));
  const listMode = usesListLayout(config.modeId);
  const boardProps = {
    hint: { kind: null, period: null, category: null } as const,
    correctAtomicNumber: null,
    wrongGuesses: [] as number[],
    resolution: null,
    answeredMarks: {},
    playableNumbers: pool.map((element) => element.atomicNumber),
    disabled: true,
    onSelect: () => undefined,
  };

  return (
    <div className="screen home">
      <header className="hero">
        <p className="eyebrow">Periodic table quiz</p>
        <h1>Find it on the table.</h1>
        <p className="lede">
          A Seterra-style practice game: read a prompt, click the right element,
          and learn the table by repetition. Three guesses per question. A round
          covers every element in the group you pick.
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
        <p className="hint-text">This round: {poolCount} question{poolCount === 1 ? "" : "s"}.</p>
        <label className="timer-toggle">
          <input
            type="checkbox"
            checked={config.timed}
            onChange={(event) => onChange({ ...config, timed: event.target.checked })}
          />
          Race the clock
          <TimerNote timed={config.timed} />
        </label>

        <button type="button" className="play-button" onClick={onPlay}>
          Start {selectedMode?.title}
        </button>
      </section>

      <section className="preview">
        <h2>{listMode ? "A shuffled list, not the table" : "The table is the answer sheet"}</h2>
        <p>
          {listMode
            ? "Atomic numbers are hidden and the order is mixed, so you have to know which element is which."
            : "Pick a chemical family — or the whole table — then click to answer. First try lights green, second yellow, third orange. Miss all three and the right element turns red. Finished tiles keep that color."}
        </p>
        {listMode ? (
          <ElementList
            elements={previewList}
            reveal={{ atomicNumber: false, symbol: true, name: true }}
            {...boardProps}
          />
        ) : (
          <PeriodicTable
            reveal={{ atomicNumber: true, symbol: true, name: true }}
            {...boardProps}
          />
        )}
        <CategoryLegend />
      </section>
    </div>
  );
}
