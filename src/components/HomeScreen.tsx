import { useEffect, useState } from "react";
import { unlockSpeech } from "../audio/speech";
import { playUi, unlockAudio } from "../audio/sounds";
import { poolForSet, QUESTION_TIME_MS, setHasHints } from "../game/elementSets";
import { familyHintAvailable } from "../game/hintCopy";
import { MODE_LOGOS } from "../game/modeLogos";
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

const PREVIEW_LINE: Record<string, string> = {
  "find-element": "Click the named element on the table.",
  "atomic-number": "A shuffled list, so you cannot count across.",
  symbol: "Match the symbol on the table.",
  properties: "Clues first, then the table — names stay hidden.",
  "type-name": "See the symbol. Type the name.",
  mixed: "Names, symbols, numbers, and clues, shuffled.",
};

interface HomeScreenProps {
  config: GameConfig;
  user: string | null;
  onChange: (config: GameConfig) => void;
  onPlay: (config: GameConfig) => void;
  onBack: () => void;
  startPickingModeId?: string | null;
}

export function HomeScreen({
  config,
  user,
  onChange,
  onPlay,
  onBack,
  startPickingModeId = null,
}: HomeScreenProps) {
  const [pickingModeId, setPickingModeId] = useState<string | null>(startPickingModeId);
  const pickingMode = GAME_MODES.find((mode) => mode.id === pickingModeId) ?? null;
  const selectedMode = GAME_MODES.find((mode) => mode.id === config.modeId);
  const playModeId = pickingMode?.id ?? config.modeId;
  const pool = poolForSet(config.elementSet);
  const poolCount = pool.length;
  const previewList = [...pool].sort((a, b) => a.name.localeCompare(b.name));
  const listMode = usesListLayout(playModeId);
  const propertyMode = playModeId === "properties";
  const typeMode = usesTypeLayout(playModeId);
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

  const closeGroupMenu = () => {
    playUi();
    setPickingModeId(null);
  };

  useEffect(() => {
    if (!pickingModeId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGroupMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickingModeId]);

  const playWith = (next: GameConfig) => {
    unlockAudio();
    unlockSpeech();
    playUi();
    onPlay(next);
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
          <span className="brand-mark">Elementra</span>
        </h1>
        <p className="setup-kicker">Choose a mode</p>
      </header>

      <section className="mode-pick" aria-label="Play a mode">
        <div className="mode-bodies">
          {GAME_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`mode-body ${config.modeId === mode.id ? "is-selected" : ""}`}
              aria-label={mode.shortTitle}
              onClick={() => {
                playUi();
                const next = { ...config, modeId: mode.id };
                onChange(next);
                setPickingModeId(mode.id);
              }}
            >
              <img className="mode-body-art" src={MODE_LOGOS[mode.id]} alt="" width={280} height={210} />
              <span className="mode-body-label">{mode.shortTitle}</span>
            </button>
          ))}
        </div>
      </section>

      {pickingMode ? (
        <div
          className="auth-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeGroupMenu();
          }}
        >
          <div
            className="group-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-menu-title"
          >
            <button type="button" className="auth-close" aria-label="Close" onClick={closeGroupMenu}>
              ×
            </button>
            <h2 id="group-menu-title">{pickingMode.shortTitle}</h2>
            <p className="group-menu-lede">Element group</p>
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
                    onChange({ ...config, modeId: pickingMode.id, elementSet: setId });
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
            <p className="hint-text">
              {poolCount} question{poolCount === 1 ? "" : "s"}
              {setHasHints(config.elementSet) && !listMode && !typeMode && !propertyMode
                ? familyHintAvailable(config.elementSet)
                  ? " · Hint lights the period, then the family."
                  : " · Hint lights the period."
                : ""}
            </p>
            <label className="timer-toggle">
              <input
                type="checkbox"
                checked={config.timed}
                onChange={(event) => {
                  playUi();
                  onChange({
                    ...config,
                    modeId: pickingMode.id,
                    timed: event.target.checked,
                  });
                }}
              />
              Race the clock
              <TimerNote timed={config.timed} />
            </label>
            <button
              type="button"
              className="play-button"
              onClick={() => playWith({ ...config, modeId: pickingMode.id })}
            >
              Start
            </button>
          </div>
        </div>
      ) : null}

      <section className="preview">
        <h2>{selectedMode?.shortTitle ?? "The table"}</h2>
        <p>{PREVIEW_LINE[config.modeId] ?? "The table is the answer sheet."}</p>
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
    </div>
  );
}
