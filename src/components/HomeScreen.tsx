import brandLogo from "../assets/logo.jpg";
import { playUi, unlockAudio } from "../audio/sounds";
import { poolForSet, QUESTION_TIME_MS } from "../game/elementSets";
import { GAME_MODES, usesListLayout } from "../game/modes";
import {
  ELEMENT_SET_IDS,
  ELEMENT_SET_LABELS,
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
  const propertyMode = config.modeId === "properties";
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
        <h1 className="sr-only">Elementra</h1>
        <img
          className="brand-logo"
          src={brandLogo}
          alt="Elementra. Master the table. Beat the clock."
        />
        <p className="byline">
          <span className="byline-label">Designed &amp; built by</span>
          <span className="byline-name">Charlie Bishop</span>
        </p>
        <p className="lede">
          Elementra is a fast-paced periodic table challenge inspired by geography
          games like Seterra. Test how well you know the elements by finding them on
          an interactive periodic table. Identify elements by their name, symbol,
          atomic number, or clues about their properties. Race against the clock,
          build streaks, improve your accuracy, and work your way from the easiest
          elements to the most challenging ones.
        </p>
        <p className="lede">Can you master all 118 elements? 🧪⚛️</p>
      </header>

      <section className="setup-card">
        <h2>Play</h2>
        <div className="mode-grid">
          {GAME_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`mode-card ${config.modeId === mode.id ? "is-selected" : ""}`}
              onClick={() => {
                if (config.modeId === mode.id) return;
                playUi();
                onChange({ ...config, modeId: mode.id });
              }}
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
              onClick={() => {
                if (config.elementSet === setId) return;
                playUi();
                onChange({ ...config, elementSet: setId });
              }}
            >
              <span className={`legend-swatch ${setId === "all" ? "swatch-all" : `tile--${setId}`}`} />
              {ELEMENT_SET_LABELS[setId]}
            </button>
          ))}
        </div>
        <p className="hint-text">This round: {poolCount} question{poolCount === 1 ? "" : "s"}.</p>
        <label className="timer-toggle">
          <input
            type="checkbox"
            checked={config.timed}
            onChange={(event) => {
              playUi();
              onChange({ ...config, timed: event.target.checked });
            }}
          />
          Race the clock
          <TimerNote timed={config.timed} />
        </label>

        <button
          type="button"
          className="play-button"
          onClick={() => {
            unlockAudio();
            playUi();
            onPlay();
          }}
        >
          Start {selectedMode?.title}
        </button>
      </section>

      <section className="preview">
        <h2>
          {listMode
            ? "A shuffled list, not the table"
            : propertyMode
              ? "Clues, then the table"
              : "The table is the answer sheet"}
        </h2>
        <p>
          {listMode
            ? "Atomic numbers are hidden and the order is mixed, so you have to know which element is which."
            : propertyMode
              ? "Family, room-temperature state, period, and other facts stack until they point to one element. During play, names, symbols, and family colors stay hidden so the clues have to do the work."
              : "This is your map of the elements. Match the clue, click the tile, and watch the table light up as you go — green for a first-try strike, gold when you needed a second look, orange on a last-chance save. Miss all three and the real answer flares red, then every mark stays so you can see the round take shape."}
        </p>
        {listMode ? (
          <ElementList
            elements={previewList}
            reveal={{ atomicNumber: false, symbol: true, name: true }}
            {...boardProps}
          />
        ) : (
          <PeriodicTable
            reveal={
              propertyMode
                ? { atomicNumber: true, symbol: false, name: false }
                : { atomicNumber: true, symbol: true, name: true }
            }
            {...boardProps}
          />
        )}
        <CategoryLegend />
      </section>
    </div>
  );
}
