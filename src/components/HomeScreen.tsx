import { useEffect, useState } from "react";
import { unlockSpeech } from "../audio/speech";
import { playUi, unlockAudio } from "../audio/sounds";
import { ELEMENTS } from "../data/elements";
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
import { PeriodicTable } from "./PeriodicTable";
import { StatsDialog } from "./StatsDialog";

function TimerNote({ timed }: { timed: boolean }) {
  if (!timed) return null;
  return ` (${QUESTION_TIME_MS / 1000}s each)`;
}

function AtomMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <ellipse cx="16" cy="16" rx="12" ry="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <ellipse
        cx="16"
        cy="16"
        rx="12"
        ry="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        transform="rotate(60 16 16)"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="12"
        ry="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        transform="rotate(-60 16 16)"
      />
      <circle cx="16" cy="16" r="2.2" fill="currentColor" />
    </svg>
  );
}

interface HomeScreenProps {
  config: GameConfig;
  user: string | null;
  onChange: (config: GameConfig) => void;
  onPlay: (config: GameConfig) => void;
  onBack: () => void;
  onOpenSettings: () => void;
  startPickingModeId?: string | null;
  startTableOpen?: boolean;
  startStatsOpen?: boolean;
}

export function HomeScreen({
  config,
  user,
  onChange,
  onPlay,
  onBack,
  onOpenSettings,
  startPickingModeId = null,
  startTableOpen = false,
  startStatsOpen = false,
}: HomeScreenProps) {
  const [pickingModeId, setPickingModeId] = useState<string | null>(startPickingModeId);
  const [tableOpen, setTableOpen] = useState(startTableOpen);
  const [statsOpen, setStatsOpen] = useState(startStatsOpen);
  const pickingMode = GAME_MODES.find((mode) => mode.id === pickingModeId) ?? null;
  const playModeId = pickingMode?.id ?? config.modeId;
  const pool = poolForSet(config.elementSet);
  const poolCount = pool.length;
  const listMode = usesListLayout(playModeId);
  const propertyMode = playModeId === "properties";
  const typeMode = usesTypeLayout(playModeId);

  const closeGroupMenu = () => {
    playUi();
    setPickingModeId(null);
  };

  const closeTable = () => {
    playUi();
    setTableOpen(false);
  };

  const closeStats = () => {
    playUi();
    setStatsOpen(false);
  };

  const openTable = () => {
    playUi();
    setPickingModeId(null);
    setStatsOpen(false);
    setTableOpen(true);
  };

  const openStats = () => {
    playUi();
    setPickingModeId(null);
    setTableOpen(false);
    setStatsOpen(true);
  };

  const openSettings = () => {
    playUi();
    setPickingModeId(null);
    setTableOpen(false);
    setStatsOpen(false);
    onOpenSettings();
  };

  useEffect(() => {
    if (!pickingModeId && !tableOpen && !statsOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (pickingModeId) closeGroupMenu();
      else if (tableOpen) closeTable();
      else closeStats();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickingModeId, tableOpen, statsOpen]);

  const playWith = (next: GameConfig) => {
    unlockAudio();
    unlockSpeech();
    playUi();
    onPlay(next);
  };

  const comingSoon = () => {
    playUi();
  };

  return (
    <div className="screen home">
      <nav className="hud-nav" aria-label="Elementra">
        <p className="hud-brand">
          <AtomMark className="hud-atom" />
          <span className="brand-mark">Elementra</span>
        </p>
        <div className="hud-nav-links">
          <span className="hud-nav-btn is-current">
            <span className="hud-nav-ico" aria-hidden="true">
              ⌂
            </span>
            Home
          </span>
          <button type="button" className="hud-nav-btn" onClick={openSettings}>
            <span className="hud-nav-ico" aria-hidden="true">
              ⚙
            </span>
            Settings
          </button>
          <button type="button" className="hud-nav-btn" onClick={openStats}>
            <span className="hud-nav-ico" aria-hidden="true">
              ▤
            </span>
            Stats
          </button>
          <button type="button" className="hud-nav-btn" onClick={openTable}>
            <span className="hud-nav-ico" aria-hidden="true">
              ▦
            </span>
            Periodic table
          </button>
          <button type="button" className="hud-nav-btn" onClick={comingSoon}>
            <span className="hud-nav-ico" aria-hidden="true">
              ?
            </span>
            How to Play
          </button>
        </div>
      </nav>

      <header className="setup-bar hud-hero">
        <div className="hud-hero-copy">
          <button
            type="button"
            className="text-button setup-back"
            onClick={() => {
              playUi();
              onBack();
            }}
          >
            ← Back
          </button>
          <h1>
            <span className="brand-mark">Elementra</span>
          </h1>
          <p className="setup-kicker">Choose a mode</p>
        </div>
        <p className="hud-tagline">
          <span>The periodic table guessing game</span>
          <AtomMark className="hud-atom hud-atom-lg" />
        </p>
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

      <p className="hud-footer">Explore · Learn · Discover</p>

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

      {tableOpen ? (
        <div
          className="auth-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeTable();
          }}
        >
          <div
            className="table-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="table-dialog-title"
          >
            <button type="button" className="auth-close" aria-label="Close" onClick={closeTable}>
              ×
            </button>
            <h2 id="table-dialog-title">Periodic table</h2>
            <p className="group-menu-lede">All 118 elements</p>
            <PeriodicTable
              explorer
              reveal={{ atomicNumber: true, symbol: true, name: true }}
              hint={{ kind: null, period: null, category: null }}
              correctAtomicNumber={null}
              wrongGuesses={[]}
              resolution={null}
              answeredMarks={{}}
              playableNumbers={ELEMENTS.map((element) => element.atomicNumber)}
              disabled
              onSelect={() => undefined}
            />
            <CategoryLegend />
          </div>
        </div>
      ) : null}

      {statsOpen ? <StatsDialog user={user} onClose={closeStats} /> : null}
    </div>
  );
}
