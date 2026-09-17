import { defaultStore, loadEntries } from "../game/scoreboard";
import { ElementRanks } from "./ElementRanks";
import { Scoreboard } from "./Scoreboard";

function formatPlayedOn(at: number): string {
  return new Date(at).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface StatsDialogProps {
  user: string | null;
  onClose: () => void;
}

export function StatsDialog({ user, onClose }: StatsDialogProps) {
  const entries = loadEntries(defaultStore(), user);
  const latest = entries[0];

  return (
    <div
      className="auth-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="stats-dialog" role="dialog" aria-modal="true" aria-labelledby="stats-title">
        <button type="button" className="auth-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <h2 id="stats-title">Stats</h2>
        <p className="group-menu-lede">{user ? `Saved as ${user}` : "On this device"}</p>
        <p className="lede">
          {entries.length === 0
            ? "Play a round and your ranks and dates will show up here."
            : `${entries.length} round${entries.length === 1 ? "" : "s"} saved${
                latest ? ` · last played ${formatPlayedOn(latest.at)}` : ""
              }.`}
          {user ? "" : " Log in from the title screen so this follows you to other devices."}
        </p>
        <ElementRanks user={user} startExpanded />
        <Scoreboard
          title="Rounds played"
          entries={entries}
          empty="Finish a round and the date, score, and mode will land here."
        />
      </div>
    </div>
  );
}
