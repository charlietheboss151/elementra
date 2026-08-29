import type { ChemicalElement } from "../data/elements";
import type { ClueKind, GameModeDefinition, TileReveal } from "./types";

export const GAME_MODES: GameModeDefinition[] = [
  {
    id: "find-element",
    title: "Find Element by Name",
    description: "Read the name, then click that element on the table.",
    clueKinds: () => ["name"],
  },
  {
    id: "atomic-number",
    title: "Find Element by Atomic Number",
    description: "Find the matching element in a shuffled list — not the table, so you cannot count across.",
    clueKinds: () => ["atomic-number"],
  },
  {
    id: "symbol",
    title: "Find Element by Symbol",
    description: "Match a chemical symbol to its place on the table.",
    clueKinds: () => ["symbol"],
  },
  {
    id: "element-info",
    title: "Element Information",
    description: "Identify a neutral atom from its electron count on the table.",
    clueKinds: () => ["electrons"],
  },
  {
    id: "mixed",
    title: "Mixed Practice",
    description: "A shuffle of names, symbols, and electron-count clues on the table.",
    clueKinds: () => ["name", "symbol", "electrons"],
  },
];

export function usesListLayout(modeId: string): boolean {
  return modeId === "atomic-number";
}

export function getMode(modeId: string): GameModeDefinition {
  const mode = GAME_MODES.find((item) => item.id === modeId);
  if (!mode) {
    throw new Error(`Unknown game mode: ${modeId}`);
  }
  return mode;
}

export function promptFor(element: ChemicalElement, clue: ClueKind): string {
  switch (clue) {
    case "name":
      return `Find ${element.name}`;
    case "symbol":
      return `Find ${element.symbol}`;
    case "atomic-number":
      return `Find element #${element.atomicNumber}`;
    case "electrons":
      return `A neutral atom of this element has ${element.electrons} electrons.`;
  }
}

export function revealFor(clue: ClueKind): TileReveal {
  if (clue === "name") return { atomicNumber: true, symbol: true, name: false };
  if (clue === "symbol") return { atomicNumber: true, symbol: false, name: true };
  if (clue === "atomic-number") return { atomicNumber: false, symbol: true, name: true };
  return { atomicNumber: false, symbol: true, name: false };
}

export function formatAnswer(element: ChemicalElement): string {
  return `${element.name} (${element.symbol}) · atomic number ${element.atomicNumber}`;
}
