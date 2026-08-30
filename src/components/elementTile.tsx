import type { MouseEvent } from "react";
import type { ChemicalElement } from "../data/elements";
import type { HintState, ResolveKind, TileReveal } from "../game/types";
import type { QuestionResolution } from "../game/useGame";

export interface TileViewProps {
  reveal: TileReveal;
  hint: HintState;
  correctAtomicNumber: number | null;
  wrongGuesses: number[];
  resolution: QuestionResolution | null;
  answeredMarks: Record<number, ResolveKind>;
  playableNumbers: number[];
  disabled: boolean;
  onSelect: (atomicNumber: number) => void;
  hideFamilyColors?: boolean;
  explorer?: boolean;
}

export function tileClass(
  element: ChemicalElement,
  hint: HintState,
  correctAtomicNumber: number | null,
  wrongGuesses: number[],
  resolution: QuestionResolution | null,
  answeredMarks: Record<number, ResolveKind>,
  playable: boolean,
  hideFamilyColors = false,
): string {
  const classes = ["tile", hideFamilyColors ? "tile--plain" : `tile--${element.category}`];
  const solved = answeredMarks[element.atomicNumber];
  if (solved) {
    classes.push(`tile--${solved}`, "tile--solved");
  } else if (!playable) {
    classes.push("tile--dim");
  }
  if (hint.kind === "period" && hint.period === element.period) {
    classes.push("tile--hint");
  }
  if (hint.kind === "category" && hint.category === element.category) {
    classes.push("tile--hint-strong");
  }
  if (!solved && wrongGuesses.includes(element.atomicNumber)) {
    classes.push("tile--missed");
  }
  if (resolution && !solved) {
    if (resolution.kind === "fail" && element.atomicNumber === correctAtomicNumber) {
      classes.push("tile--fail");
    } else if (element.atomicNumber === resolution.selectedAtomicNumber && resolution.kind !== "fail") {
      classes.push(`tile--${resolution.kind}`);
    }
  }
  return classes.join(" ");
}

export function handleTileClick(
  event: MouseEvent,
  disabled: boolean,
  onSelect: (atomicNumber: number) => void,
) {
  if (disabled) return;
  const tile = (event.target as HTMLElement).closest("[data-atomic-number]");
  if (!(tile instanceof HTMLElement)) return;
  const atomicNumber = Number(tile.dataset.atomicNumber);
  if (Number.isInteger(atomicNumber)) {
    onSelect(atomicNumber);
  }
}

export function tileIsIdentified(
  atomicNumber: number,
  answeredMarks: Record<number, ResolveKind>,
  resolution: QuestionResolution | null,
  correctAtomicNumber: number | null,
): boolean {
  if (answeredMarks[atomicNumber]) return true;
  if (!resolution) return false;
  if (resolution.selectedAtomicNumber === atomicNumber) return true;
  return resolution.kind === "fail" && atomicNumber === correctAtomicNumber;
}

export function tileAriaLabel(
  element: ChemicalElement,
  reveal: TileReveal,
  identified = false,
): string {
  if (identified) {
    return `${element.name}, ${element.symbol}, atomic number ${element.atomicNumber}`;
  }
  const parts: string[] = [];
  if (reveal.name) parts.push(element.name);
  if (reveal.symbol) parts.push(element.symbol);
  if (reveal.atomicNumber) parts.push(`atomic number ${element.atomicNumber}`);
  if (parts.length === 0) return `period ${element.period}, group ${element.group}`;
  return parts.join(", ");
}

export function ElementTileButton({
  element,
  className,
  style,
  reveal,
  disabled,
  identified = false,
  explorerFacts,
}: {
  element: ChemicalElement;
  className: string;
  style?: { gridRow: number; gridColumn: number };
  reveal: TileReveal;
  disabled: boolean;
  identified?: boolean;
  explorerFacts?: string[];
}) {
  const explorer = explorerFacts != null;
  const tipId = explorer ? `tile-tip-${element.atomicNumber}` : undefined;

  return (
    <button
      type="button"
      className={`${className}${explorer ? " tile--explorer has-tip" : ""}`}
      style={style}
      data-atomic-number={element.atomicNumber}
      data-grid-row={style?.gridRow}
      disabled={explorer ? undefined : disabled}
      aria-disabled={explorer ? true : undefined}
      tabIndex={explorer ? 0 : undefined}
      aria-describedby={explorer ? tipId : undefined}
      aria-label={tileAriaLabel(element, reveal, identified)}
      onClick={explorer ? (event) => event.preventDefault() : undefined}
    >
      <span className="tile-number">{reveal.atomicNumber ? element.atomicNumber : "·"}</span>
      <span className="tile-symbol">{reveal.symbol ? element.symbol : "?"}</span>
      <span className="tile-name">{reveal.name ? element.name : "\u00a0"}</span>
      {explorer ? (
        <span id={tipId} role="tooltip" className="tile-tip">
          <strong className="tile-tip-title">
            {element.name} ({element.symbol})
          </strong>
          <span className="tile-tip-meta">Atomic number {element.atomicNumber}</span>
          <ul className="tile-tip-facts">
            {explorerFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </span>
      ) : null}
    </button>
  );
}
