import { ELEMENTS, type ChemicalElement } from "../data/elements";
import type { ElementSetId } from "./types";

export const QUESTION_TIME_MS = 20_000;

export function poolForSet(setId: ElementSetId): ChemicalElement[] {
  if (setId === "all") return ELEMENTS;
  if (setId === "common") return ELEMENTS.filter((element) => element.common);
  return ELEMENTS.filter((element) => element.category === setId);
}

export function setHasHints(setId: ElementSetId): boolean {
  return setId === "all" || poolForSet(setId).length > 12;
}
