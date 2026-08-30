import type { ElementSetId, HintKind } from "./types";

export function familyHintAvailable(setId: ElementSetId): boolean {
  return setId === "all" || setId === "common";
}

export function hintButtonText(kind: HintKind, setId: ElementSetId): string {
  if (kind === "category") return "Hint used";
  if (kind === "period") return familyHintAvailable(setId) ? "Hint again" : "Hint used";
  return "Hint";
}

export function hintTip(kind: HintKind, setId: ElementSetId): string {
  if (familyHintAvailable(setId)) {
    if (kind === "category") return "The chemical family is highlighted.";
    if (kind === "period") return "That period (row) is highlighted. Tap again for the family.";
    return "Highlights the element's period (row). A second tap highlights its family.";
  }
  if (kind === "period") return "That period (row) is highlighted.";
  return "Highlights the element's period (the row on the table).";
}

export function hintIsSpent(kind: HintKind, setId: ElementSetId): boolean {
  return hintButtonText(kind, setId) === "Hint used";
}
