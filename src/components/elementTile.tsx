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
}

export function tileClass(
  element: ChemicalElement,
  hint: HintState,
  correctAtomicNumber: number | null,
  wrongGuesses: number[],
  resolution: QuestionResolution | null,
  answeredMarks: Record<number, ResolveKind>,
  playable: boolean,
): string {
  const classes = ["tile", `tile--${element.category}`];
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

export function ElementTileButton({
  element,
  className,
  style,
  reveal,
  disabled,
}: {
  element: ChemicalElement;
  className: string;
  style?: { gridRow: number; gridColumn: number };
  reveal: TileReveal;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      data-atomic-number={element.atomicNumber}
      disabled={disabled}
      aria-label={`${element.name}, ${element.symbol}, atomic number ${element.atomicNumber}`}
    >
      <span className="tile-number">{reveal.atomicNumber ? element.atomicNumber : "·"}</span>
      <span className="tile-symbol">{reveal.symbol ? element.symbol : "?"}</span>
      <span className="tile-name">{reveal.name ? element.name : "\u00a0"}</span>
    </button>
  );
}
