import { useState } from "react";
import { playUi } from "../audio/sounds";
import { loadElementStats, rankElements, type RankOrder } from "../game/elementStats";
import { defaultStore } from "../game/scoreboard";

interface ElementRanksProps {
  user: string | null;
}

export function ElementRanks({ user }: ElementRanksProps) {
  const [order, setOrder] = useState<RankOrder>("best");
  const rows = rankElements(loadElementStats(defaultStore(), user), order);

  return (
    <section className="scoreboard element-ranks">
      <div className="rank-head">
        <h2>Element ranks</h2>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            playUi();
            setOrder(order === "best" ? "worst" : "best");
          }}
        >
          {order === "best" ? "Best first" : "Worst first"}
        </button>
      </div>
      <p className="lede">
        Best is the element you hit on the first try most. A 2nd or 3rd try ranks lower.
        Worst is the one you miss the most.
        {user ? "" : " Log in from the title screen to keep this with your account."}
      </p>
      {rows.length === 0 ? (
        <p className="lede">Play a round and the elements you answer will show up here.</p>
      ) : (
        <div className="scoreboard-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Element</th>
                <th>1st</th>
                <th>2nd</th>
                <th>3rd</th>
                <th>Miss</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.atomicNumber}>
                  <td>{i + 1}</td>
                  <td>
                    {row.name} ({row.symbol})
                  </td>
                  <td>{row.first}</td>
                  <td>{row.second}</td>
                  <td>{row.third}</td>
                  <td>{row.miss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
