import { ELEMENTS } from "../data/elements";
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
}: TileViewProps) {
  const playable = new Set(playableNumbers);

  return (
    <div className="table-wrap">
      <div
        className="periodic-table"
        role="group"
        aria-label="Periodic table"
        onClick={(event) => handleTileClick(event, disabled, onSelect)}
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
            reveal={{ ...reveal, atomicNumber: true }}
            identified={tileIsIdentified(
              element.atomicNumber,
              answeredMarks,
              resolution,
              correctAtomicNumber,
            )}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
