import { QUESTION_TIME_MS } from "../game/elementSets";
import { GAME_MODES } from "../game/modes";
import { MAX_GUESSES } from "../game/types";

interface HowToPlayDialogProps {
  onClose: () => void;
}

export function HowToPlayDialog({ onClose }: HowToPlayDialogProps) {
  return (
    <div
      className="auth-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="how-dialog" role="dialog" aria-modal="true" aria-labelledby="how-title">
        <button type="button" className="auth-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <h2 id="how-title">How to Play</h2>
        <p className="lede">
          Elementra is a periodic table quiz. Pick a mode, pick a group, then find or name every
          element in that group.
        </p>

        <p className="group-menu-lede">A round</p>
        <p className="how-copy">
          Tap a mode, then an element group, then Start. Each question gives you {MAX_GUESSES}{" "}
          guesses. A round is every element in the group you picked.
        </p>

        <p className="group-menu-lede">Modes</p>
        <ul className="how-modes">
          {GAME_MODES.map((mode) => (
            <li key={mode.id}>
              <strong>{mode.shortTitle}.</strong> {mode.description}
            </li>
          ))}
        </ul>
        <p className="how-copy">
          Atomic-number questions use a shuffled list so you cannot count across the table. Type a
          name or symbol in the search box to bring that element to the top.
        </p>

        <p className="group-menu-lede">Scoring</p>
        <p className="how-copy">
          A first try is 1 point. A 2nd or 3rd try scores less. Miss all three and that question is
          0.
        </p>

        <p className="group-menu-lede">Hints &amp; timer</p>
        <p className="how-copy">
          On large groups, Hint lights the period (row). On All or Common, a second tap lights the
          family. Race the clock to get {QUESTION_TIME_MS / 1000} seconds per question.
        </p>

        <p className="group-menu-lede">Progress</p>
        <p className="how-copy">
          Stats saves element ranks and the dates you played. Register or log in if you want that
          to follow you to another device. Periodic table is a full table you can browse anytime.
        </p>
      </div>
    </div>
  );
}
