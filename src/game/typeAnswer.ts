import type { ChemicalElement } from "../data/elements";

function fold(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z]/g, "");
}

const ALIASES: Record<string, string[]> = {
  aluminum: ["aluminium"],
  sulfur: ["sulphur"],
  cesium: ["caesium"],
};

export function namesMatch(element: ChemicalElement, raw: string): boolean {
  const guess = fold(raw);
  if (!guess) return false;
  const official = fold(element.name);
  if (guess === official) return true;
  return (ALIASES[official] ?? []).includes(guess);
}
