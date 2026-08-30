import { formatDuration, formatScore } from "../game/engine";
import { getMode } from "../game/modes";
import { ELEMENT_SET_LABELS } from "../game/types";
import type { ScoreboardEntry } from "../game/scoreboard";

function formatWhen(at: number): string {
  return new Date(at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDelta(delta: { accuracy: number; elapsedMs: number } | null): string | null {
  if (!delta) return null;
  const acc =
    delta.accuracy === 0 ? "same %" : `${delta.accuracy > 0 ? "+" : ""}${delta.accuracy}%`;
  const faster = delta.elapsedMs < 0;
  const slower = delta.elapsedMs > 0;
  const time =
    delta.elapsedMs === 0
      ? "same time"
      : `${faster ? "−" : slower ? "+" : ""}${formatDuration(Math.abs(delta.elapsedMs))}`;
  return `${acc} · ${time} vs last time`;
}

interface ScoreboardProps {
  title: string;
  entries: ScoreboardEntry[];
  highlightId?: string;
  empty: string;
  compare?: { accuracy: number; elapsedMs: number } | null;
}

export function Scoreboard({ title, entries, highlightId, empty, compare }: ScoreboardProps) {
  return (
    <section className="scoreboard">
      <h2>{title}</h2>
      {compare ? <p className="scoreboard-delta">{formatDelta(compare)}</p> : null}
      {entries.length === 0 ? (
        <p className="lede">{empty}</p>
      ) : (
        <div className="scoreboard-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Time</th>
                <th>Round</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row) => {
                const mode = getMode(row.modeId);
                return (
                  <tr key={row.id} className={row.id === highlightId ? "is-current" : ""}>
                    <td>{formatWhen(row.at)}</td>
                    <td>{formatScore({ score: row.score })}</td>
                    <td>{row.accuracy}%</td>
                    <td>{formatDuration(row.elapsedMs)}</td>
                    <td>
                      {mode.title.replace("Find Element by ", "")} · {ELEMENT_SET_LABELS[row.elementSet]}
                      {row.timed ? " · timed" : ""}
                      {row.incomplete ? " · Incomplete" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
