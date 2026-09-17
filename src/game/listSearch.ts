import type { ChemicalElement } from "../data/elements";
import { nameKeys } from "./typeAnswer";

function fold(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z]/g, "");
}

function matchScore(element: ChemicalElement, query: string): number {
  const symbol = fold(element.symbol);
  if (symbol === query) return 100;
  if (symbol.startsWith(query)) return 80;

  const names = nameKeys(element);
  if (names.includes(query)) return 70;
  if (names.some((name) => name.startsWith(query))) return 50;
  if (query.length >= 2 && names.some((name) => name.includes(query))) return 30;
  return 0;
}

/** Keep the shuffled order, but float symbol/name matches to the front. */
export function rankElementsBySearch(
  elements: ChemicalElement[],
  query: string,
): ChemicalElement[] {
  const needle = fold(query);
  if (!needle) return elements;
  return elements
    .map((element, index) => ({ element, index, score: matchScore(element, needle) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((row) => row.element);
}
