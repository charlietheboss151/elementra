import { useId, useMemo, useState } from "react";
import type { ChemicalElement } from "../data/elements";
import { rankElementsBySearch } from "../game/listSearch";
import { ElementTileButton, handleTileClick, tileClass, tileIsIdentified, tileShowCheckmark, type TileViewProps } from "./elementTile";

interface ElementListProps extends TileViewProps {
  elements: ChemicalElement[];
  searchable?: boolean;
  startQuery?: string;
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
  searchable = false,
  startQuery = "",
}: ElementListProps) {
  const playable = new Set(playableNumbers);
  const fieldId = useId();
  const [query, setQuery] = useState(startQuery);
  const ranked = useMemo(
    () => (searchable ? rankElementsBySearch(elements, query) : elements),
    [elements, query, searchable],
  );

  return (
    <div className="table-wrap">
      {searchable ? (
        <div className="list-search">
          <label htmlFor={fieldId}>Search</label>
          <input
            id={fieldId}
            type="search"
            value={query}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Name or symbol"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      ) : null}
      <div
        className="element-list"
        role="group"
        aria-label="Shuffled element list"
        onClick={(event) => handleTileClick(event, disabled, onSelect)}
      >
        {ranked.map((element) => (
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
