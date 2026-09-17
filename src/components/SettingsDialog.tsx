import { useEffect, useState } from "react";
import { cancelSpeech } from "../audio/speech";
import {
  loadAudioPrefs,
  muteAll,
  saveAudioPrefs,
  type AudioPrefs,
} from "../audio/audioPrefs";
import { playUi } from "../audio/sounds";
import { QUESTION_TIME_MS } from "../game/elementSets";
import { applyUiPrefs, loadUiPrefs, saveUiPrefs, type UiPrefs } from "../game/uiPrefs";
import type { GameConfig } from "../game/types";

interface SettingsDialogProps {
  config: GameConfig;
  onChangeConfig: (config: GameConfig) => void;
  onClose: () => void;
}

export function SettingsDialog({ config, onChangeConfig, onClose }: SettingsDialogProps) {
  const [audio, setAudio] = useState<AudioPrefs>(() => loadAudioPrefs());
  const [ui, setUi] = useState<UiPrefs>(() => loadUiPrefs());

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const applyAudio = (next: AudioPrefs) => {
    saveAudioPrefs(next);
    setAudio(next);
    if (!next.speech) cancelSpeech();
  };

  const applyUi = (next: UiPrefs) => {
    saveUiPrefs(next);
    applyUiPrefs(next);
    setUi(next);
  };

  return (
    <div
      className="auth-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <button type="button" className="auth-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <h2 id="settings-title">Settings</h2>

        <p className="group-menu-lede">Sound</p>
        <label className="settings-row">
          <span>
            Voices
            <small>Speak the element name on Find by name</small>
          </span>
          <input
            type="checkbox"
            checked={audio.speech}
            onChange={(event) => applyAudio({ ...audio, speech: event.target.checked })}
          />
        </label>
        <label className="settings-row">
          <span>
            Sound effects
            <small>Clicks, correct, and miss sounds</small>
          </span>
          <input
            type="checkbox"
            checked={audio.sfx}
            onChange={(event) => applyAudio({ ...audio, sfx: event.target.checked })}
          />
        </label>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            playUi();
            applyAudio(muteAll());
          }}
        >
          Mute all
        </button>

        <p className="group-menu-lede">Play</p>
        <label className="settings-row">
          <span>
            Race the clock
            <small>Time each question ({QUESTION_TIME_MS / 1000}s). You can still change this when you start a round.</small>
          </span>
          <input
            type="checkbox"
            checked={config.timed}
            onChange={(event) => {
              playUi();
              onChangeConfig({ ...config, timed: event.target.checked });
            }}
          />
        </label>

        <p className="group-menu-lede">Display</p>
        <label className="settings-row">
          <span>
            Show fps
            <small>Tiny fps and ping readout in the corner</small>
          </span>
          <input
            type="checkbox"
            checked={ui.showPerfHud}
            onChange={(event) => {
              playUi();
              applyUi({ ...ui, showPerfHud: event.target.checked });
            }}
          />
        </label>
        <label className="settings-row">
          <span>
            Still icons
            <small>Stop the mode icons from floating</small>
          </span>
          <input
            type="checkbox"
            checked={ui.reduceMotion}
            onChange={(event) => {
              playUi();
              applyUi({ ...ui, reduceMotion: event.target.checked });
            }}
          />
        </label>
      </div>
    </div>
  );
}
