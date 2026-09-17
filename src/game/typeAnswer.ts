import type { ChemicalElement } from "../data/elements";

function fold(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z]/g, "");
}

const ALIASES: Record<string, string[]> = {
  aluminum: ["aluminium"],
  sulfur: ["sulphur"],
  cesium: ["caesium"],
};

export function nameKeys(element: ChemicalElement): string[] {
  const official = fold(element.name);
  return [official, ...(ALIASES[official] ?? [])];
}

export function namesMatch(element: ChemicalElement, raw: string): boolean {
  const guess = fold(raw);
  if (!guess) return false;
  return nameKeys(element).includes(guess);
}
