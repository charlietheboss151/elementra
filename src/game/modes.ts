import { CATEGORY_LABELS, type ChemicalElement } from "../data/elements";
import type { ClueKind, Difficulty, GameModeDefinition, TileReveal } from "./types";

function infoClueKinds(difficulty: Difficulty): ClueKind[] {
  if (difficulty === "easy") return ["protons", "electrons"];
  if (difficulty === "medium") return ["protons", "electrons", "atomic-number"];
  if (difficulty === "hard") return ["protons", "electrons", "category-protons"];
  return ["category-protons", "electrons", "protons"];
}

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
    description: "Find the element that matches the atomic number.",
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
    description: "Use protons, electrons, and other clues to identify the atom.",
    clueKinds: infoClueKinds,
  },
  {
    id: "mixed",
    title: "Mixed Practice",
    description: "A shuffle of names, numbers, symbols, and atom clues.",
    clueKinds: (difficulty) => ["name", "symbol", "atomic-number", ...infoClueKinds(difficulty)],
  },
];

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
    case "protons":
      return `This element has ${element.protons} protons.`;
    case "electrons":
      return `A neutral atom of this element has ${element.electrons} electrons.`;
    case "category-protons":
      return `This ${CATEGORY_LABELS[element.category].toLowerCase()} has ${element.protons} protons.`;
  }
}

export function revealFor(clue: ClueKind, difficulty: Difficulty): TileReveal {
  const empty: TileReveal = { atomicNumber: false, symbol: false, name: false };

  if (difficulty === "expert") {
    return empty;
  }

  if (difficulty === "hard") {
    if (clue === "name") return { atomicNumber: true, symbol: false, name: false };
    if (clue === "symbol") return { atomicNumber: true, symbol: false, name: false };
    if (clue === "atomic-number") return { atomicNumber: false, symbol: true, name: false };
    return empty;
  }

  if (difficulty === "medium") {
    if (clue === "name") return { atomicNumber: true, symbol: true, name: false };
    if (clue === "symbol") return { atomicNumber: true, symbol: false, name: true };
    if (clue === "atomic-number") return { atomicNumber: false, symbol: true, name: true };
    return { atomicNumber: false, symbol: true, name: false };
  }

  if (clue === "name") return { atomicNumber: true, symbol: true, name: false };
  if (clue === "symbol") return { atomicNumber: true, symbol: false, name: true };
  if (clue === "atomic-number") return { atomicNumber: false, symbol: true, name: true };
  return { atomicNumber: false, symbol: true, name: false };
}
