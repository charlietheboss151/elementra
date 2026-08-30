import brandLogo from "../assets/logo.jpg";
import { unlockSpeech } from "../audio/speech";
import { playUi, unlockAudio } from "../audio/sounds";

interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div className="screen title">
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
      <button
        type="button"
        className="play-button title-start"
        onClick={() => {
          unlockAudio();
          unlockSpeech();
          playUi();
          onStart();
        }}
      >
        Start
      </button>
    </div>
  );
}
