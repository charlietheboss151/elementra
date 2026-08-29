export const CATEGORIES = [
  "alkali-metal",
  "alkaline-earth",
  "lanthanide",
  "actinide",
  "transition-metal",
  "post-transition-metal",
  "metalloid",
  "nonmetal",
  "halogen",
  "noble-gas",
  "unknown",
] as const;

export type ElementCategory = (typeof CATEGORIES)[number];

export type ElementBlock = "s" | "p" | "d" | "f";

export interface ChemicalElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  period: number;
  group: number | null;
  category: ElementCategory;
  block: ElementBlock;
  protons: number;
  electrons: number;
  common: boolean;
  gridRow: number;
  gridColumn: number;
}

type RawElement = [
  atomicNumber: number,
  symbol: string,
  name: string,
  period: number,
  group: number | null,
  category: ElementCategory,
  block: ElementBlock,
  common: boolean,
];

const RAW: RawElement[] = [
  [1, "H", "Hydrogen", 1, 1, "nonmetal", "s", true],
  [2, "He", "Helium", 1, 18, "noble-gas", "s", true],
  [3, "Li", "Lithium", 2, 1, "alkali-metal", "s", true],
  [4, "Be", "Beryllium", 2, 2, "alkaline-earth", "s", true],
  [5, "B", "Boron", 2, 13, "metalloid", "p", true],
  [6, "C", "Carbon", 2, 14, "nonmetal", "p", true],
  [7, "N", "Nitrogen", 2, 15, "nonmetal", "p", true],
  [8, "O", "Oxygen", 2, 16, "nonmetal", "p", true],
  [9, "F", "Fluorine", 2, 17, "halogen", "p", true],
  [10, "Ne", "Neon", 2, 18, "noble-gas", "p", true],
  [11, "Na", "Sodium", 3, 1, "alkali-metal", "s", true],
  [12, "Mg", "Magnesium", 3, 2, "alkaline-earth", "s", true],
  [13, "Al", "Aluminum", 3, 13, "post-transition-metal", "p", true],
  [14, "Si", "Silicon", 3, 14, "metalloid", "p", true],
  [15, "P", "Phosphorus", 3, 15, "nonmetal", "p", true],
  [16, "S", "Sulfur", 3, 16, "nonmetal", "p", true],
  [17, "Cl", "Chlorine", 3, 17, "halogen", "p", true],
  [18, "Ar", "Argon", 3, 18, "noble-gas", "p", true],
  [19, "K", "Potassium", 4, 1, "alkali-metal", "s", true],
  [20, "Ca", "Calcium", 4, 2, "alkaline-earth", "s", true],
  [21, "Sc", "Scandium", 4, 3, "transition-metal", "d", false],
  [22, "Ti", "Titanium", 4, 4, "transition-metal", "d", false],
  [23, "V", "Vanadium", 4, 5, "transition-metal", "d", false],
  [24, "Cr", "Chromium", 4, 6, "transition-metal", "d", false],
  [25, "Mn", "Manganese", 4, 7, "transition-metal", "d", false],
  [26, "Fe", "Iron", 4, 8, "transition-metal", "d", true],
  [27, "Co", "Cobalt", 4, 9, "transition-metal", "d", false],
  [28, "Ni", "Nickel", 4, 10, "transition-metal", "d", true],
  [29, "Cu", "Copper", 4, 11, "transition-metal", "d", true],
  [30, "Zn", "Zinc", 4, 12, "transition-metal", "d", true],
  [31, "Ga", "Gallium", 4, 13, "post-transition-metal", "p", false],
  [32, "Ge", "Germanium", 4, 14, "metalloid", "p", false],
  [33, "As", "Arsenic", 4, 15, "metalloid", "p", false],
  [34, "Se", "Selenium", 4, 16, "nonmetal", "p", false],
  [35, "Br", "Bromine", 4, 17, "halogen", "p", true],
  [36, "Kr", "Krypton", 4, 18, "noble-gas", "p", true],
  [37, "Rb", "Rubidium", 5, 1, "alkali-metal", "s", false],
  [38, "Sr", "Strontium", 5, 2, "alkaline-earth", "s", false],
  [39, "Y", "Yttrium", 5, 3, "transition-metal", "d", false],
  [40, "Zr", "Zirconium", 5, 4, "transition-metal", "d", false],
  [41, "Nb", "Niobium", 5, 5, "transition-metal", "d", false],
  [42, "Mo", "Molybdenum", 5, 6, "transition-metal", "d", false],
  [43, "Tc", "Technetium", 5, 7, "transition-metal", "d", false],
  [44, "Ru", "Ruthenium", 5, 8, "transition-metal", "d", false],
  [45, "Rh", "Rhodium", 5, 9, "transition-metal", "d", false],
  [46, "Pd", "Palladium", 5, 10, "transition-metal", "d", false],
  [47, "Ag", "Silver", 5, 11, "transition-metal", "d", true],
  [48, "Cd", "Cadmium", 5, 12, "transition-metal", "d", false],
  [49, "In", "Indium", 5, 13, "post-transition-metal", "p", false],
  [50, "Sn", "Tin", 5, 14, "post-transition-metal", "p", false],
  [51, "Sb", "Antimony", 5, 15, "metalloid", "p", false],
  [52, "Te", "Tellurium", 5, 16, "metalloid", "p", false],
  [53, "I", "Iodine", 5, 17, "halogen", "p", true],
  [54, "Xe", "Xenon", 5, 18, "noble-gas", "p", false],
  [55, "Cs", "Cesium", 6, 1, "alkali-metal", "s", false],
  [56, "Ba", "Barium", 6, 2, "alkaline-earth", "s", false],
  [57, "La", "Lanthanum", 6, null, "lanthanide", "f", false],
  [58, "Ce", "Cerium", 6, null, "lanthanide", "f", false],
  [59, "Pr", "Praseodymium", 6, null, "lanthanide", "f", false],
  [60, "Nd", "Neodymium", 6, null, "lanthanide", "f", false],
  [61, "Pm", "Promethium", 6, null, "lanthanide", "f", false],
  [62, "Sm", "Samarium", 6, null, "lanthanide", "f", false],
  [63, "Eu", "Europium", 6, null, "lanthanide", "f", false],
  [64, "Gd", "Gadolinium", 6, null, "lanthanide", "f", false],
  [65, "Tb", "Terbium", 6, null, "lanthanide", "f", false],
  [66, "Dy", "Dysprosium", 6, null, "lanthanide", "f", false],
  [67, "Ho", "Holmium", 6, null, "lanthanide", "f", false],
  [68, "Er", "Erbium", 6, null, "lanthanide", "f", false],
  [69, "Tm", "Thulium", 6, null, "lanthanide", "f", false],
  [70, "Yb", "Ytterbium", 6, null, "lanthanide", "f", false],
  [71, "Lu", "Lutetium", 6, null, "lanthanide", "f", false],
  [72, "Hf", "Hafnium", 6, 4, "transition-metal", "d", false],
  [73, "Ta", "Tantalum", 6, 5, "transition-metal", "d", false],
  [74, "W", "Tungsten", 6, 6, "transition-metal", "d", false],
  [75, "Re", "Rhenium", 6, 7, "transition-metal", "d", false],
  [76, "Os", "Osmium", 6, 8, "transition-metal", "d", false],
  [77, "Ir", "Iridium", 6, 9, "transition-metal", "d", false],
  [78, "Pt", "Platinum", 6, 10, "transition-metal", "d", false],
  [79, "Au", "Gold", 6, 11, "transition-metal", "d", true],
  [80, "Hg", "Mercury", 6, 12, "transition-metal", "d", true],
  [81, "Tl", "Thallium", 6, 13, "post-transition-metal", "p", false],
  [82, "Pb", "Lead", 6, 14, "post-transition-metal", "p", true],
  [83, "Bi", "Bismuth", 6, 15, "post-transition-metal", "p", false],
  [84, "Po", "Polonium", 6, 16, "post-transition-metal", "p", false],
  [85, "At", "Astatine", 6, 17, "halogen", "p", false],
  [86, "Rn", "Radon", 6, 18, "noble-gas", "p", false],
  [87, "Fr", "Francium", 7, 1, "alkali-metal", "s", false],
  [88, "Ra", "Radium", 7, 2, "alkaline-earth", "s", false],
  [89, "Ac", "Actinium", 7, null, "actinide", "f", false],
  [90, "Th", "Thorium", 7, null, "actinide", "f", false],
  [91, "Pa", "Protactinium", 7, null, "actinide", "f", false],
  [92, "U", "Uranium", 7, null, "actinide", "f", false],
  [93, "Np", "Neptunium", 7, null, "actinide", "f", false],
  [94, "Pu", "Plutonium", 7, null, "actinide", "f", false],
  [95, "Am", "Americium", 7, null, "actinide", "f", false],
  [96, "Cm", "Curium", 7, null, "actinide", "f", false],
  [97, "Bk", "Berkelium", 7, null, "actinide", "f", false],
  [98, "Cf", "Californium", 7, null, "actinide", "f", false],
  [99, "Es", "Einsteinium", 7, null, "actinide", "f", false],
  [100, "Fm", "Fermium", 7, null, "actinide", "f", false],
  [101, "Md", "Mendelevium", 7, null, "actinide", "f", false],
  [102, "No", "Nobelium", 7, null, "actinide", "f", false],
  [103, "Lr", "Lawrencium", 7, null, "actinide", "f", false],
  [104, "Rf", "Rutherfordium", 7, 4, "transition-metal", "d", false],
  [105, "Db", "Dubnium", 7, 5, "transition-metal", "d", false],
  [106, "Sg", "Seaborgium", 7, 6, "transition-metal", "d", false],
  [107, "Bh", "Bohrium", 7, 7, "transition-metal", "d", false],
  [108, "Hs", "Hassium", 7, 8, "transition-metal", "d", false],
  [109, "Mt", "Meitnerium", 7, 9, "unknown", "d", false],
  [110, "Ds", "Darmstadtium", 7, 10, "unknown", "d", false],
  [111, "Rg", "Roentgenium", 7, 11, "unknown", "d", false],
  [112, "Cn", "Copernicium", 7, 12, "transition-metal", "d", false],
  [113, "Nh", "Nihonium", 7, 13, "unknown", "p", false],
  [114, "Fl", "Flerovium", 7, 14, "unknown", "p", false],
  [115, "Mc", "Moscovium", 7, 15, "unknown", "p", false],
  [116, "Lv", "Livermorium", 7, 16, "unknown", "p", false],
  [117, "Ts", "Tennessine", 7, 17, "unknown", "p", false],
  [118, "Og", "Oganesson", 7, 18, "unknown", "p", false],
];

function gridFor(raw: RawElement): { gridRow: number; gridColumn: number } {
  const [atomicNumber, , , period, group, , block] = raw;
  if (block === "f") {
    if (atomicNumber <= 71) {
      return { gridRow: 9, gridColumn: atomicNumber - 54 };
    }
    return { gridRow: 10, gridColumn: atomicNumber - 86 };
  }
  if (group == null) {
    throw new Error(`Missing group for element ${atomicNumber}`);
  }
  return { gridRow: period, gridColumn: group };
}

export const ELEMENTS: ChemicalElement[] = RAW.map((raw) => {
  const [atomicNumber, symbol, name, period, group, category, block, common] = raw;
  const { gridRow, gridColumn } = gridFor(raw);
  return {
    atomicNumber,
    symbol,
    name,
    period,
    group,
    category,
    block,
    protons: atomicNumber,
    electrons: atomicNumber,
    common,
    gridRow,
    gridColumn,
  };
});

export const ELEMENTS_BY_NUMBER = new Map(
  ELEMENTS.map((element) => [element.atomicNumber, element]),
);

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  "alkali-metal": "Alkali metal",
  "alkaline-earth": "Alkaline earth",
  lanthanide: "Lanthanide",
  actinide: "Actinide",
  "transition-metal": "Transition metal",
  "post-transition-metal": "Post-transition",
  metalloid: "Metalloid",
  nonmetal: "Nonmetal",
  halogen: "Halogen",
  "noble-gas": "Noble gas",
  unknown: "Unknown",
};

if (ELEMENTS.length !== 118) {
  throw new Error(`Expected 118 elements, got ${ELEMENTS.length}`);
}
