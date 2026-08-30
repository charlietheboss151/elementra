import { useEffect, useState } from "react";
import { cancelSpeech } from "../audio/speech";
import {
  loadAudioPrefs,
  muteAll,
  saveAudioPrefs,
  type AudioPrefs,
} from "../audio/audioPrefs";
import { playUi } from "../audio/sounds";

interface SoundMenuProps {
  startOpen?: boolean;
}

export function SoundMenu({ startOpen = false }: SoundMenuProps) {
  const [open, setOpen] = useState(startOpen);
  const [prefs, setPrefs] = useState<AudioPrefs>(() => loadAudioPrefs());

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const apply = (next: AudioPrefs) => {
    saveAudioPrefs(next);
    setPrefs(next);
    if (!next.speech) cancelSpeech();
  };

  return (
    <div className="sound-menu">
      <button
        type="button"
        className="sound-menu-toggle"
        aria-label="Sound"
        aria-expanded={open}
        onClick={() => {
          playUi();
          setOpen((value) => !value);
        }}
      >
        Sound
      </button>
      {open ? (
        <div className="sound-menu-panel" role="dialog" aria-label="Sound">
          <label className="sound-menu-row">
            <span>Voices</span>
            <input
              type="checkbox"
              checked={prefs.speech}
              onChange={(event) => apply({ ...prefs, speech: event.target.checked })}
            />
          </label>
          <label className="sound-menu-row">
            <span>Sound effects</span>
            <input
              type="checkbox"
              checked={prefs.sfx}
              onChange={(event) => apply({ ...prefs, sfx: event.target.checked })}
            />
          </label>
          <button
            type="button"
            className="text-button sound-menu-mute"
            onClick={() => apply(muteAll())}
          >
            Mute all
          </button>
        </div>
      ) : null}
    </div>
  );
}
