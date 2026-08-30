import { ELEMENTS } from "../data/elements";
import { previewFactsFor } from "../game/elementFacts";
import { ElementTileButton, handleTileClick, tileClass, tileIsIdentified, type TileViewProps } from "./elementTile";

export function PeriodicTable({
  reveal,
  hint,
  correctAtomicNumber,
  wrongGuesses,
  resolution,
  answeredMarks,
  playableNumbers,
  disabled,
  onSelect,
  hideFamilyColors = false,
  explorer = false,
}: TileViewProps) {
  const playable = new Set(playableNumbers);
  const interactive = !disabled || explorer;

  return (
    <div className={`table-wrap${explorer ? " table-wrap--explorer" : ""}`}>
      <div
        className={`periodic-table${explorer ? " periodic-table--explorer" : ""}`}
        role="group"
        aria-label={explorer ? "Periodic table reference. Hover or focus a tile for element facts." : "Periodic table"}
        onClick={(event) => handleTileClick(event, !interactive, onSelect)}
      >
        <div className="f-placeholder" style={{ gridRow: 6, gridColumn: 3 }}>
          57–71
        </div>
        <div className="f-placeholder" style={{ gridRow: 7, gridColumn: 3 }}>
          89–103
        </div>
        {ELEMENTS.map((element) => (
          <ElementTileButton
            key={element.atomicNumber}
            element={element}
            className={tileClass(
              element,
              hint,
              correctAtomicNumber,
              wrongGuesses,
              resolution,
              answeredMarks,
              playable.has(element.atomicNumber),
              hideFamilyColors,
            )}
            style={{ gridRow: element.gridRow, gridColumn: element.gridColumn }}
            reveal={reveal}
            identified={tileIsIdentified(
              element.atomicNumber,
              answeredMarks,
              resolution,
              correctAtomicNumber,
            )}
            explorerFacts={explorer ? previewFactsFor(element) : undefined}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
