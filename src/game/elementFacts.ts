import type { ChemicalElement, ElementCategory } from "../data/elements";

const GASES = new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86]);
const LIQUIDS = new Set([35, 80]);
const DIATOMIC = new Set([1, 7, 8, 9, 17, 35, 53]);

const FAMILY: Record<ElementCategory, string> = {
  "alkali-metal": "an alkali metal",
  "alkaline-earth": "an alkaline earth metal",
  lanthanide: "a lanthanide",
  actinide: "an actinide",
  "transition-metal": "a transition metal",
  "post-transition-metal": "a post-transition metal",
  metalloid: "a metalloid",
  nonmetal: "a nonmetal",
  halogen: "a halogen",
  "noble-gas": "a noble gas",
  unknown: "an element whose chemical family is still uncertain",
};

export interface Fact {
  id: string;
  text: string;
  match: (element: ChemicalElement) => boolean;
  flavor?: boolean;
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function roomPhase(atomicNumber: number): "gas" | "liquid" | "solid" | "unknown" {
  if (atomicNumber >= 104) return "unknown";
  if (GASES.has(atomicNumber)) return "gas";
  if (LIQUIDS.has(atomicNumber)) return "liquid";
  return "solid";
}

export function isSynthetic(atomicNumber: number): boolean {
  return atomicNumber === 43 || atomicNumber === 61 || atomicNumber >= 93;
}

export function isRadioactive(atomicNumber: number): boolean {
  return atomicNumber === 43 || atomicNumber === 61 || atomicNumber >= 84;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function factsFor(element: ChemicalElement): Fact[] {
  const phase = roomPhase(element.atomicNumber);
  const facts: Fact[] = [
    {
      id: "family",
      text: `This element is ${FAMILY[element.category]}.`,
      match: (item) => item.category === element.category,
      flavor: true,
    },
  ];

  if (phase === "gas") {
    facts.push({
      id: "phase",
      text: "It is a gas at room temperature.",
      match: (item) => roomPhase(item.atomicNumber) === "gas",
      flavor: true,
    });
  } else if (phase === "liquid") {
    facts.push({
      id: "phase",
      text: "It is a liquid at room temperature.",
      match: (item) => roomPhase(item.atomicNumber) === "liquid",
      flavor: true,
    });
  } else if (phase === "solid") {
    facts.push({
      id: "phase",
      text: "It is a solid at room temperature.",
      match: (item) => roomPhase(item.atomicNumber) === "solid",
      flavor: true,
    });
  }

  if (DIATOMIC.has(element.atomicNumber)) {
    facts.push({
      id: "diatomic",
      text: "It commonly exists as diatomic molecules.",
      match: (item) => DIATOMIC.has(item.atomicNumber),
      flavor: true,
    });
  }

  if (isSynthetic(element.atomicNumber)) {
    facts.push({
      id: "synthetic",
      text: "It is a synthetic element — not found in nature in useful amounts.",
      match: (item) => isSynthetic(item.atomicNumber),
      flavor: true,
    });
  } else {
    facts.push({
      id: "natural",
      text: "It occurs in nature.",
      match: (item) => !isSynthetic(item.atomicNumber),
      flavor: true,
    });
  }

  if (isRadioactive(element.atomicNumber)) {
    facts.push({
      id: "radioactive",
      text: "All of its isotopes are radioactive.",
      match: (item) => isRadioactive(item.atomicNumber),
      flavor: true,
    });
  }

  facts.push({
    id: "period",
    text: `It is in period ${element.period}.`,
    match: (item) => item.period === element.period,
  });

  if (element.group != null) {
    facts.push({
      id: "group",
      text: `It is in group ${element.group}.`,
      match: (item) => item.group === element.group,
    });
  }

  facts.push({
    id: "block",
    text: `It is a ${element.block}-block element.`,
    match: (item) => item.block === element.block,
  });

  if (element.category === "lanthanide") {
    const n = element.atomicNumber - 56;
    facts.push({
      id: "series",
      text: `It is the ${ordinal(n)} lanthanide.`,
      match: (item) => item.category === "lanthanide" && item.atomicNumber - 56 === n,
    });
  }

  if (element.category === "actinide") {
    const n = element.atomicNumber - 88;
    facts.push({
      id: "series",
      text: `It is the ${ordinal(n)} actinide.`,
      match: (item) => item.category === "actinide" && item.atomicNumber - 88 === n,
    });
  }

  return facts;
}

export function selectFacts(target: ChemicalElement, pool: ChemicalElement[]): Fact[] {
  const all = factsFor(target);
  const flavor = shuffle(all.filter((fact) => fact.flavor));
  const structural = all.filter((fact) => !fact.flavor);
  const ordered = [...flavor, ...structural];
  let remaining = pool;
  const selected: Fact[] = [];

  for (const fact of ordered) {
    if (remaining.length === 1 && selected.length >= 2) break;
    const next = remaining.filter(fact.match);
    if (!next.some((item) => item.atomicNumber === target.atomicNumber)) continue;
    const reduces = next.length < remaining.length;
    if (reduces || (fact.flavor && selected.length < 2)) {
      selected.push(fact);
      remaining = next;
    }
  }

  if (remaining.length > 1) {
    const sorted = [...remaining].sort((a, b) => a.atomicNumber - b.atomicNumber);
    const lightest = sorted[0];
    const heaviest = sorted[sorted.length - 1];
    if (target.atomicNumber === lightest.atomicNumber) {
      selected.push({
        id: "extreme",
        text: "It is the lightest element that matches these facts.",
        match: (item) => item.atomicNumber === lightest.atomicNumber,
      });
    } else if (target.atomicNumber === heaviest.atomicNumber) {
      selected.push({
        id: "extreme",
        text: "It is the heaviest element that matches these facts.",
        match: (item) => item.atomicNumber === heaviest.atomicNumber,
      });
    } else {
      selected.push({
        id: "z",
        text: `Its atomic number is ${target.atomicNumber}.`,
        match: (item) => item.atomicNumber === target.atomicNumber,
      });
    }
  }

  if (selected.length === 0) {
    selected.push({
      id: "z",
      text: `Its atomic number is ${target.atomicNumber}.`,
      match: (item) => item.atomicNumber === target.atomicNumber,
    });
  }

  return selected;
}

export function propertyPrompt(target: ChemicalElement, pool: ChemicalElement[]): string {
  return selectFacts(target, pool)
    .map((fact) => fact.text)
    .join("\n");
}
