import { ELEMENTS, type ChemicalElement } from "../data/elements";
import type { QuestionResolution } from "../game/useGame";
import type { HintState, TileReveal } from "../game/types";

interface PeriodicTableProps {
  reveal: TileReveal;
  hint: HintState;
  correctAtomicNumber: number | null;
  wrongGuesses: number[];
  resolution: QuestionResolution | null;
  playableNumbers: number[];
  disabled: boolean;
  onSelect: (atomicNumber: number) => void;
}

function tileClass(
  element: ChemicalElement,
  hint: HintState,
  correctAtomicNumber: number | null,
  wrongGuesses: number[],
  resolution: QuestionResolution | null,
  playable: boolean,
): string {
  const classes = ["tile", `tile--${element.category}`];
  if (!playable) classes.push("tile--dim");
  if (hint.kind === "period" && hint.period === element.period) {
    classes.push("tile--hint");
  }
  if (hint.kind === "category" && hint.category === element.category) {
    classes.push("tile--hint-strong");
  }
  if (wrongGuesses.includes(element.atomicNumber) && resolution?.kind !== "fail") {
    classes.push("tile--missed");
  }
  if (resolution) {
    if (resolution.kind === "fail" && element.atomicNumber === correctAtomicNumber) {
      classes.push("tile--fail");
    } else if (element.atomicNumber === resolution.selectedAtomicNumber && resolution.kind !== "fail") {
      classes.push(`tile--${resolution.kind}`);
    } else if (wrongGuesses.includes(element.atomicNumber)) {
      classes.push("tile--missed");
    }
  }
  return classes.join(" ");
}

export function PeriodicTable({
  reveal,
  hint,
  correctAtomicNumber,
  wrongGuesses,
  resolution,
  playableNumbers,
  disabled,
  onSelect,
}: PeriodicTableProps) {
  const playable = new Set(playableNumbers);

  return (
    <div className="table-wrap">
      <div
        className="periodic-table"
        role="group"
        aria-label="Periodic table"
        onClick={(event) => {
          if (disabled) return;
          const tile = (event.target as HTMLElement).closest("[data-atomic-number]");
          if (!(tile instanceof HTMLElement)) return;
          const atomicNumber = Number(tile.dataset.atomicNumber);
          if (Number.isInteger(atomicNumber)) {
            onSelect(atomicNumber);
          }
        }}
      >
        <div className="f-placeholder" style={{ gridRow: 6, gridColumn: 3 }}>
          57–71
        </div>
        <div className="f-placeholder" style={{ gridRow: 7, gridColumn: 3 }}>
          89–103
        </div>
        {ELEMENTS.map((element) => (
          <button
            key={element.atomicNumber}
            type="button"
            className={tileClass(
              element,
              hint,
              correctAtomicNumber,
              wrongGuesses,
              resolution,
              playable.has(element.atomicNumber),
            )}
            style={{ gridRow: element.gridRow, gridColumn: element.gridColumn }}
            data-atomic-number={element.atomicNumber}
            disabled={disabled}
            aria-label={`${element.name}, ${element.symbol}, atomic number ${element.atomicNumber}`}
          >
            <span className="tile-number">
              {reveal.atomicNumber ? element.atomicNumber : "·"}
            </span>
            <span className="tile-symbol">{reveal.symbol ? element.symbol : "?"}</span>
            <span className="tile-name">{reveal.name ? element.name : "\u00a0"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
