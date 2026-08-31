import type { ChemicalElement } from "../data/elements";
import { ElementTileButton, handleTileClick, tileClass, tileIsIdentified, tileShowCheckmark, type TileViewProps } from "./elementTile";

interface ElementListProps extends TileViewProps {
  elements: ChemicalElement[];
}

export function ElementList({
  elements,
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
}: ElementListProps) {
  const playable = new Set(playableNumbers);

  return (
    <div className="table-wrap">
      <div
        className="element-list"
        role="group"
        aria-label="Shuffled element list"
        onClick={(event) => handleTileClick(event, disabled, onSelect)}
      >
        {elements.map((element) => (
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
            reveal={reveal}
            identified={tileIsIdentified(
              element.atomicNumber,
              answeredMarks,
              resolution,
              correctAtomicNumber,
            )}
            showCheckmark={tileShowCheckmark(element.atomicNumber, answeredMarks, resolution)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
