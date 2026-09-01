import { unlockSpeech } from "../audio/speech";
import { playUi, unlockAudio } from "../audio/sounds";
import { poolForSet, QUESTION_TIME_MS, setHasHints } from "../game/elementSets";
import { familyHintAvailable } from "../game/hintCopy";
import { GAME_MODES, usesListLayout, usesTypeLayout } from "../game/modes";
import {
  ELEMENT_SET_EXPLAINERS,
  ELEMENT_SET_IDS,
  ELEMENT_SET_LABELS,
  type ElementSetId,
  type GameConfig,
} from "../game/types";
import { CategoryLegend } from "./CategoryLegend";
import { ElementList } from "./ElementList";
import { ElementRanks } from "./ElementRanks";
import { PeriodicTable } from "./PeriodicTable";
import { Scoreboard } from "./Scoreboard";
import { defaultStore, loadEntries } from "../game/scoreboard";

function TimerNote({ timed }: { timed: boolean }) {
  if (!timed) return null;
  return ` (${QUESTION_TIME_MS / 1000}s each)`;
}

interface HomeScreenProps {
  config: GameConfig;
  user: string | null;
  onChange: (config: GameConfig) => void;
  onPlay: () => void;
  onBack: () => void;
}

export function HomeScreen({ config, user, onChange, onPlay, onBack }: HomeScreenProps) {
  const selectedMode = GAME_MODES.find((mode) => mode.id === config.modeId);
  const pool = poolForSet(config.elementSet);
  const poolCount = pool.length;
  const previewList = [...pool].sort((a, b) => a.name.localeCompare(b.name));
  const listMode = usesListLayout(config.modeId);
  const propertyMode = config.modeId === "properties";
  const typeMode = usesTypeLayout(config.modeId);
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
      <header className="setup-bar">
        <button
          type="button"
          className="text-button setup-back"
          onClick={() => {
            playUi();
            onBack();
          }}
        >
          Back
        </button>
        <h1>
          <span className="brand-mark">Elementra:</span>
          <span className="brand-sub">the periodic table guessing game</span>
        </h1>
        <p className="setup-kicker">Can you master all 118 elements? 🧪⚛️</p>
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
              className={`group-pill has-tip ${config.elementSet === setId ? "is-selected" : ""}`}
              aria-describedby={`set-tip-${setId}`}
              onClick={() => {
                if (config.elementSet === setId) return;
                playUi();
                onChange({ ...config, elementSet: setId });
              }}
            >
              <span
                className={`legend-swatch ${setId === "all" ? "swatch-all" : setId === "common" ? "swatch-common" : `tile--${setId}`}`}
              />
              {ELEMENT_SET_LABELS[setId]}
              <span id={`set-tip-${setId}`} role="tooltip" className="tip">
                {ELEMENT_SET_EXPLAINERS[setId]}
              </span>
            </button>
          ))}
        </div>
        <p className="group-explainer">{ELEMENT_SET_EXPLAINERS[config.elementSet]}</p>
        <p className="hint-text">This round: {poolCount} question{poolCount === 1 ? "" : "s"}.</p>
        {setHasHints(config.elementSet) && !listMode && !typeMode && !propertyMode ? (
          <p className="hint-text">
            {familyHintAvailable(config.elementSet)
              ? "In play, Hint lights the period row, then the family if you tap it again."
              : "In play, Hint lights the element's period (row) on the table."}
          </p>
        ) : null}
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
            unlockSpeech();
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
              : typeMode
                ? "Spell the name"
                : "The table is the answer sheet"}
        </h2>
        <p>
          {listMode
            ? "Atomic numbers are hidden and the order is mixed, so you have to know which element is which."
            : propertyMode
              ? "Family, room-temperature state, period, and other facts stack until they point to one element. During play, names, symbols, atomic numbers, and family colors stay hidden so the clues have to do the work."
              : typeMode
                ? "You see the symbol and atomic number. Type the English name. Aluminium and sulphur count. Three guesses, same score as clicking."
                : "This is your map of the elements. Match the clue, click the tile, and watch the table light up as you go — green for a first-try strike, gold when you needed a second look, orange on a last-chance save. Miss all three and the real answer flares red, then every mark stays so you can see the round take shape. Tap or hover any tile here for a quick fact card."}
        </p>
        {typeMode ? (
          <p className="type-answer-preview">Fe → Iron · Au → Gold · Na → Sodium</p>
        ) : listMode ? (
          <ElementList
            elements={previewList}
            reveal={{ atomicNumber: false, symbol: true, name: true }}
            {...boardProps}
          />
        ) : (
          <PeriodicTable
            explorer
            reveal={
              propertyMode
                ? { atomicNumber: false, symbol: false, name: false }
                : { atomicNumber: true, symbol: true, name: true }
            }
            {...boardProps}
          />
        )}
        {typeMode ? null : <CategoryLegend />}
      </section>

      <ElementRanks user={user} />

      <Scoreboard
        title={user ? `${user}'s scoreboard` : "Scoreboard"}
        entries={loadEntries(defaultStore(), user).slice(0, 12)}
        empty="Play a round and your time and accuracy will show up here so you can track improvement."
      />

      <footer className="about">
        <p className="lede">
          Elementra is a fast-paced periodic table challenge inspired by geography
          games like Seterra. Test how well you know the elements by finding them on
          an interactive periodic table. Identify elements by their name, symbol,
          atomic number, or clues about their properties. Race against the clock,
          build streaks, improve your accuracy, and work your way from the easiest
          elements to the most challenging ones.
        </p>
      </footer>
    </div>
  );
}
