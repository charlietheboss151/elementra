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
import { HowToPlayDialog } from "./HowToPlayDialog";
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

function HudIcon({ name }: { name: "home" | "settings" | "stats" | "table" | "help" }) {
  const common = {
    className: "hud-nav-ico",
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M3.8 11.2 12 4.2l8.2 7" />
        <path d="M6.2 10.5V20h11.6v-9.5" />
        <path d="M10 20v-6.2h4V20" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...common} strokeWidth={1.6}>
        <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.76 6.76 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.93 6.93 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  if (name === "stats") {
    return (
      <svg {...common}>
        <path d="M5 19V11.5M10.5 19V7M16 19V4.8M21 19H3" />
      </svg>
    );
  }

  if (name === "table") {
    return (
      <svg {...common}>
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="2.2" />
        <path d="M3.2 9.2h17.6M3.2 15h17.6M9.2 3.2v17.6M15 3.2v17.6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M9.3 9.2a2.8 2.8 0 1 1 2.7 3.5v1.2" />
      <circle cx="12" cy="17.15" r="1.05" fill="currentColor" stroke="none" />
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
  startHelpOpen?: boolean;
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
  startHelpOpen = false,
}: HomeScreenProps) {
  const [pickingModeId, setPickingModeId] = useState<string | null>(startPickingModeId);
  const [tableOpen, setTableOpen] = useState(startTableOpen);
  const [statsOpen, setStatsOpen] = useState(startStatsOpen);
  const [helpOpen, setHelpOpen] = useState(startHelpOpen);
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

  const closeHelp = () => {
    playUi();
    setHelpOpen(false);
  };

  const openTable = () => {
    playUi();
    setPickingModeId(null);
    setStatsOpen(false);
    setHelpOpen(false);
    setTableOpen(true);
  };

  const openStats = () => {
    playUi();
    setPickingModeId(null);
    setTableOpen(false);
    setHelpOpen(false);
    setStatsOpen(true);
  };

  const openHelp = () => {
    playUi();
    setPickingModeId(null);
    setTableOpen(false);
    setStatsOpen(false);
    setHelpOpen(true);
  };

  const openSettings = () => {
    playUi();
    setPickingModeId(null);
    setTableOpen(false);
    setStatsOpen(false);
    setHelpOpen(false);
    onOpenSettings();
  };

  useEffect(() => {
    if (!pickingModeId && !tableOpen && !statsOpen && !helpOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (pickingModeId) closeGroupMenu();
      else if (tableOpen) closeTable();
      else if (statsOpen) closeStats();
      else closeHelp();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickingModeId, tableOpen, statsOpen, helpOpen]);

  const playWith = (next: GameConfig) => {
    unlockAudio();
    unlockSpeech();
    playUi();
    onPlay(next);
  };

  return (
    <div className="screen home">
      <div className="hud-shell">
        <nav className="hud-nav" aria-label="Elementra">
          <p className="hud-brand">
            <AtomMark className="hud-atom" />
            <span className="brand-mark">Elementra</span>
          </p>
          <div className="hud-nav-links">
            <span className="hud-nav-btn is-current hud-nav-home">
              <HudIcon name="home" />
              Home
            </span>
            <button type="button" className="hud-nav-btn" onClick={openSettings}>
              <HudIcon name="settings" />
              Settings
            </button>
            <button type="button" className="hud-nav-btn" onClick={openStats}>
              <HudIcon name="stats" />
              Stats
            </button>
            <button type="button" className="hud-nav-btn" onClick={openTable}>
              <HudIcon name="table" />
              Periodic table
            </button>
            <button type="button" className="hud-nav-btn" onClick={openHelp}>
              <HudIcon name="help" />
              How to Play
            </button>
          </div>
          <svg className="hud-nav-circuit" viewBox="0 0 1200 20" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 16 H72 L92 4 H1200" fill="none" stroke="currentColor" strokeWidth="1.7" />
          </svg>
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
            <span className="hud-tagline-copy">
              <span>The periodic table</span>
              <span>guessing game</span>
            </span>
            <svg className="hud-tagline-trace" viewBox="0 0 72 56" aria-hidden="true">
              <path d="M0 14 H40 L58 28 H72" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 42 H40 L58 28" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
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
                <img className="mode-body-art" src={MODE_LOGOS[mode.id]} alt="" width={322} height={242} />
                <span className="mode-body-label">{mode.shortTitle}</span>
              </button>
            ))}
          </div>
        </section>

        <footer className="hud-footer">
          <div className="hud-footer-rule" aria-hidden="true">
            <span className="hud-footer-rule-line" />
            <AtomMark className="hud-atom hud-atom-footer" />
            <span className="hud-footer-rule-line" />
          </div>
          <p className="hud-footer-copy">Explore · Learn · Discover</p>
        </footer>
      </div>

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
      {helpOpen ? <HowToPlayDialog onClose={closeHelp} /> : null}
    </div>
  );
}
