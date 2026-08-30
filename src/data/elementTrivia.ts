import { ELEMENTS } from "./elements";

/** Element-specific blurbs for the setup-screen hover cards — one set per atomic number. */
export const ELEMENT_TRIVIA: Record<number, readonly string[]> = {
  1: [
    "Stars fuse hydrogen into helium — it is the universe's main fuel.",
    "Lightest element; most atoms in the cosmos are hydrogen.",
    "Liquid hydrogen powers some rockets as a high-energy fuel.",
  ],
  2: [
    "Liquid helium cools MRI magnets to a few kelvin above absolute zero.",
    "Second-lightest element; first detected in the Sun's spectrum.",
    "Helium voice effect happens because sound travels faster in it.",
  ],
  3: [
    "Powers most phone and laptop rechargeable batteries.",
    "Lightest metal; soft enough to cut with a knife.",
    "Floats on water and fizzes as it reacts.",
  ],
  4: [
    "Mixed into copper to make tough, spark-free tools.",
    "Among the lightest metals used in aircraft and satellites.",
    "Emeralds are beryl with trace chromium — beryllium is the host mineral.",
  ],
  5: [
    "Borosilicate glass (Pyrex) resists thermal shock thanks to boron.",
    "Essential micronutrient for plant cell walls.",
    "Boron neutron capture can target certain brain tumors.",
  ],
  6: [
    "Diamond and graphite are both pure carbon — same atom, different structure.",
    "Backbone of every protein, fat, and DNA strand.",
    "Can form more distinct compounds than any other element.",
  ],
  7: [
    "About four-fifths of Earth's air is nitrogen gas.",
    "Fixed by bacteria and lightning into plant-usable forms.",
    "Liquid nitrogen boils at −196 °C and freezes flowers brittle.",
  ],
  8: [
    "Makes up most of Earth's crust by mass (mostly as oxides).",
    "Every breath depends on O₂; fires need it too.",
    "Ozone (O₃) in the stratosphere blocks harmful UV.",
  ],
  9: [
    "Most electronegative element — pulls electrons aggressively.",
    "Teflon and many toothpastes rely on fluorine chemistry.",
    "Reacts with almost everything; pure F₂ is treacherous to handle.",
  ],
  10: [
    "Classic orange-red glow in neon signs (even though signs use many gases).",
    "Noble gas with a full outer shell — very unreactive.",
    "Boils at −269 °C; used in cryogenics and diving gas mixes.",
  ],
  11: [
    "Table salt is sodium chloride — half of every shake.",
    "Sodium ions carry nerve impulses and move water in cells.",
    "Soft alkali metal that hisses and skitters on water.",
  ],
  12: [
    "Central atom in chlorophyll — without it, plants don't photosynthesize.",
    "Burns with a brilliant white flame; once used in flash photography.",
    "Alloyed with aluminum for lightweight car and laptop parts.",
  ],
  13: [
    "Most abundant metal in Earth's crust; once cost more than gold.",
    "Recycles indefinitely without losing strength.",
    "Aluminum oxide (sapphire) can scratch almost everything.",
  ],
  14: [
    "Sand is mostly silicon dioxide; chips are ultra-pure silicon.",
    "Silicon Valley is named for the semiconductor industry it built.",
    "Silicone oils and rubbers are silicon-oxygen polymers.",
  ],
  15: [
    "DNA and ATP both hinge on phosphate chemistry.",
    "White phosphorus glows faintly in air and ignites easily.",
    "Red phosphorus sits on matchbox strike strips.",
  ],
  16: [
    "Volcanoes and hot springs often vent hydrogen sulfide (that rotten-egg smell).",
    "Sulfuric acid production is one of the largest chemical industries.",
    "Yellow brimstone element; used in vulcanizing rubber.",
  ],
  17: [
    "Chlorine disinfects swimming pools and much of the world's tap water.",
    "PVC plastic and many solvents are chlorine-based.",
    "Greenish yellow gas; WWI used it as a poison gas.",
  ],
  18: [
    "Fills incandescent bulbs to slow the tungsten filament burning away.",
    "Most abundant noble gas in air — about 1% of every breath.",
    "Completely inert under normal conditions.",
  ],
  19: [
    "Bananas are famous for potassium, but potatoes often beat them gram for gram.",
    "Vital for heart rhythm and muscle contraction.",
    "Deep violet flame color in fireworks and flame tests.",
  ],
  20: [
    "Bones and teeth are built on calcium phosphate crystals.",
    "Limestone, chalk, and marble are calcium carbonate.",
    "Quicklime (CaO) helped build Roman concrete.",
  ],
  21: [
    "Named for Scandinavia; strengthens aluminum in bike frames.",
    "First transition metal in period 4.",
    "Scandium iodide lamps produce sun-like light for film.",
  ],
  22: [
    "Excellent strength-to-weight ratio — used in implants and jet parts.",
    "Named for the Titans of Greek myth.",
    "Titanium dioxide is the white in paint and sunscreen.",
  ],
  23: [
    "Small amounts harden steel for tools and springs.",
    "Vanadium redox batteries store grid-scale energy.",
    "Named after Vanadis, a Norse goddess.",
  ],
  24: [
    "Chrome plating keeps car bumpers and tools from rusting.",
    "Trace chromium makes ruby red in corundum crystals.",
    "Stainless steel owes its passivity partly to chromium.",
  ],
  25: [
    "Manganese steel stays tough for rail tracks and excavator teeth.",
    "Purple permanganate is a lab staple for oxidation.",
    "Mitochondria need manganese to handle oxygen safely.",
  ],
  26: [
    "Hemoglobin's iron lets blood ferry oxygen through your body.",
    "Earth's inner core is thought to be mostly iron (and nickel).",
    "Iron-56 has the highest nuclear binding energy per nucleon.",
  ],
  27: [
    "Vitamin B₁₂ holds a cobalt atom at its center.",
    "Blue cobalt glass colored ancient Egyptian pottery.",
    "Named for mischievous mine spirits — Kobolds.",
  ],
  28: [
    "Five-cent US coins are mostly copper-plated nickel.",
    "Stainless steel and superalloys lean on nickel for toughness.",
    "Meteorites often arrive as nickel-iron alloys.",
  ],
  29: [
    "Wiring in homes and motors relies on copper's conductivity.",
    "Statue of Liberty's green skin is oxidized copper.",
    "Antimicrobial copper surfaces kill many bacteria.",
  ],
  30: [
    "Galvanizing coats steel with zinc to stop rust.",
    "Essential for immune function and wound healing.",
    "US pennies were zinc-plated steel during WWII copper shortages.",
  ],
  31: [
    "Melts in your hand just above room temperature (~30 °C).",
    "Used in LEDs and some semiconductors.",
    "Mendeleev predicted it as eka-aluminum before it was found.",
  ],
  32: [
    "Mendeleev predicted germanium as eka-silicon.",
    "Critical for fiber optics and infrared optics.",
    "First transistor used germanium before silicon took over.",
  ],
  33: [
    "Infamous poison in history; also used in semiconductors.",
    "Arsenic compounds were once in medicines and pigments.",
    "Some wells still face natural arsenic contamination.",
  ],
  34: [
    "Old photocopiers used selenium drums to hold static charge.",
    "Essential trace nutrient; too much is toxic.",
    "Named for Selene, the Moon.",
  ],
  35: [
    "One of only two elements liquid at room temperature.",
    "Reddish brown and volatile; used in flame retardants.",
    "Added to table salt as potassium iodide's partner in some mixes.",
  ],
  36: [
    "Once defined the meter via the orange-red wavelength of krypton-86.",
    "Used in high-efficiency lighting and some lasers.",
    "Noble gas heavier than argon.",
  ],
  37: [
    "Atomic clocks use rubidium's hyperfine transitions.",
    "Extremely reactive — even more than potassium.",
    "Fireworks use rubidium salts for purple-red hues.",
  ],
  38: [
    "Strontium salts paint fireworks and flares red.",
    "Found in some sensitive-toothpaste formulas.",
    "Named for Strontian, a Scottish village.",
  ],
  39: [
    "YAG lasers (yttrium aluminum garnet) cut metal and treat eyes.",
    "Red phosphors in early color TVs used yttrium.",
    "Named for Ytterby, Sweden — same quarry as several elements.",
  ],
  40: [
    "Zircon gemstones are zirconium silicate crystals.",
    "Nuclear fuel rods clad in zirconium resist corrosion.",
    "Transparent to thermal neutrons — useful in reactors.",
  ],
  41: [
    "Superconducting MRI magnets often use niobium-titanium wire.",
    "Small additions toughen steel.",
    "Named for Niobe from Greek myth.",
  ],
  42: [
    "Enzymes that fix nitrogen often need molybdenum.",
    "Molybdenum disulfide is a dry lubricant like graphite.",
    "Very high melting point — used in high-temp furnaces.",
  ],
  43: [
    "First element made artificially — all isotopes are radioactive.",
    "Technetium-99m is a workhorse in medical imaging.",
    "Named for the Greek word for artificial.",
  ],
  44: [
    "Hardens platinum and palladium for jewelry and contacts.",
    "Catalyst in making acetic acid and ammonia.",
    "Named for Ruthenia (medieval name for Russia).",
  ],
  45: [
    "Catalytic converters lean heavily on rhodium.",
    "Rarer and pricier than gold or platinum.",
    "Named for rose-red rhodium compounds.",
  ],
  46: [
    "Can absorb huge volumes of hydrogen — like a metal sponge.",
    "Catalytic converters and jewelry use palladium.",
    "Named for the asteroid Pallas.",
  ],
  47: [
    "Best thermal and electrical conductor of all metals.",
    "Silver halides captured photographs for a century.",
    "Silver nanoparticles give antibacterial properties.",
  ],
  48: [
    "Nickel-cadmium batteries once dominated portable electronics.",
    "Cadmium yellow was a prized artist's pigment.",
    "Toxic heavy metal — restricted in many products.",
  ],
  49: [
    "Touchscreens use indium tin oxide as a transparent conductor.",
    "Soft metal that squeals when bent.",
    "Named for the indigo line in its spectrum.",
  ],
  50: [
    "Bronze is copper plus tin — the Bronze Age ran on it.",
    "Bending a tin bar can 'cry' as crystals rub.",
    "Low-toxicity solder often mixes tin with silver or copper.",
  ],
  51: [
    "Ancient Egyptians used antimony cosmetics.",
    "Expands when it freezes — like water.",
    "Used in some flame retardants and semiconductors.",
  ],
  52: [
    "Tellurium breath smells like garlic — a classic lab tell.",
    "Used in solar panels and thermoelectric devices.",
    "Named for Tellus, Earth.",
  ],
  53: [
    "Thyroid hormones need iodine; deficiency causes goiter.",
    "Iodized salt prevented deficiency across much of the world.",
    "Heated iodine crystals make purple vapor.",
  ],
  54: [
    "Xenon headlights and ion thrusters both use xenon.",
    "Once used as an anesthetic (xenon is pricey).",
    "Fills high-intensity arc lamps.",
  ],
  55: [
    "The SI second is defined using cesium-133 hyperfine transitions.",
    "Explodes on contact with water — classic alkali drama.",
    "Used in drilling fluids and atomic clocks.",
  ],
  56: [
    "Barium sulfate drinks help X-rays see the digestive tract.",
    "Green fireworks often use barium salts.",
    "Named for barys, Greek for heavy.",
  ],
  57: [
    "First lanthanide; camera lenses use lanthanum glass.",
    "Named for lanthanein — to lie hidden.",
    "Soft, silvery, oxidizes quickly in air.",
  ],
  58: [
    "Most abundant lanthanide in Earth's crust.",
    "Lighter flints use mischmetal rich in cerium.",
    "Cerium oxide polishes glass and phone screens.",
  ],
  59: [
    "Praseodymium gives glass a bright yellow-green.",
    "Mixed with neodymium in strong permanent magnets.",
    "Named for prasios didymos — green twin.",
  ],
  60: [
    "Neodymium magnets power hard drives, earbuds, and motors.",
    "Didymium glass filters yellow light for glassblowers.",
    "Named for neos didymos — new twin.",
  ],
  61: [
    "All isotopes radioactive; named for Prometheus.",
    "Once used in luminous paint (now banned).",
    "First isolated from uranium fission products.",
  ],
  62: [
    "Samarium-cobalt magnets work at high temperatures.",
    "Control rods absorb neutrons in nuclear reactors.",
    "Named for the mineral samarskite.",
  ],
  63: [
    "Red and blue phosphors in TVs and LEDs use europium.",
    "Named for the continent of Europe.",
    "Softest and most reactive lanthanide.",
  ],
  64: [
    "MRI contrast agents often use gadolinium compounds.",
    "Highest thermal neutron capture of any stable element.",
    "Named for Johan Gadolin.",
  ],
  65: [
    "Terbium phosphors make trichromatic lamp green.",
    "Named for Ytterby, Sweden.",
    "Magnetostrictive alloys buzz in actuators.",
  ],
  66: [
    "Dysprosium keeps neodymium magnets stable at high heat.",
    "Named for dysprosos — hard to get at.",
    "Used in data storage and lasers.",
  ],
  67: [
    "Holmium can make the strongest known magnetic fields.",
    "Named for Stockholm (Holmia in Latin).",
    "Used in medical and scientific magnets.",
  ],
  68: [
    "Erbium-doped fiber amplifiers boost internet signals.",
    "Pink erbium glass filters infrared.",
    "Named for Ytterby, Sweden.",
  ],
  69: [
    "Thulium lasers treat some skin and eye conditions.",
    "Named for Thule, a mythical northern land.",
    "One of the rarest stable lanthanides.",
  ],
  70: [
    "Ytterbium atomic clocks rival cesium precision.",
    "Improves grain structure in stainless steel.",
    "Named for Ytterby, Sweden.",
  ],
  71: [
    "Last lanthanide; PET scan detectors use lutetium compounds.",
    "Named for Lutetia — ancient Paris.",
    "Hardest and densest lanthanide.",
  ],
  72: [
    "Control rods in nuclear reactors often use hafnium.",
    "Nearly identical chemistry to zirconium — hard to separate.",
    "Named for Hafnia, Copenhagen's Latin name.",
  ],
  73: [
    "Surgical implants and jet engines rely on tantalum.",
    "Extremely corrosion resistant — even resists aqua regia.",
    "Named for Tantalus of Greek myth.",
  ],
  74: [
    "Highest melting point of all metals — 3422 °C.",
    "Old light bulb filaments were tungsten.",
    "Named wolfram in many languages.",
  ],
  75: [
    "Jet engine superalloys need rhenium to survive extreme heat.",
    "One of the rarest stable elements in Earth's crust.",
    "Named for the Rhine (Rhenus).",
  ],
  76: [
    "Densest naturally occurring element — twice as dense as lead.",
    "Osmium tetroxide smells sharp and is very toxic.",
    "Fountain pen tips were osmium-iridium alloys.",
  ],
  77: [
    "Iridium spike in rock marks the dinosaur-killing impact.",
    "Second-densest metal; resists almost all acids.",
    "Named for Iris, goddess of the rainbow.",
  ],
  78: [
    "Catalytic converters and fine jewelry use platinum.",
    "Cisplatin, a platinum drug, treats some cancers.",
    "Named for platina — little silver.",
  ],
  79: [
    "Gold doesn't tarnish — treasure from ancient tombs still shines.",
    "Measured in troy ounces; used in electronics connectors.",
    "One of the least reactive metals.",
  ],
  80: [
    "Only metal liquid at room temperature.",
    "Old thermometers and barometers used mercury.",
    "Methylmercury bioaccumulates — Minamata disaster showed the danger.",
  ],
  81: [
    "Thallium poisoning was a classic detective-story toxin.",
    "Thallium scans blood flow in the heart.",
    "Named for thallus — green shoot, from its spectral line.",
  ],
  82: [
    "Romans piped water through lead — we still find it in old cities.",
    "Shields X-rays and radiation in aprons and walls.",
    "Sweet-tasting lead acetate was once called sugar of lead.",
  ],
  83: [
    "Pepto-Bismol's active ingredient is bismuth subsalicylate.",
    "Low toxicity for a heavy metal — replaces lead in some uses.",
    "Expands on freezing like water.",
  ],
  84: [
    "Discovered by Marie Curie; named for her native Poland.",
    "Extremely radioactive — glows blue from Cherenkov radiation in water.",
    "Used in anti-static brushes (with shielding).",
  ],
  85: [
    "Rarest naturally occurring element on Earth at any moment.",
    "All isotopes radioactive; halogen with fleeting chemistry.",
    "Named for Greece (Astatos — unstable).",
  ],
  86: [
    "Radon gas from soil is a leading cause of lung cancer indoors.",
    "Heaviest stable noble gas.",
    "Invisible, odorless, and radioactive.",
  ],
  87: [
    "Most unstable alkali metal — exists only as fleeting traces.",
    "Named for France; found in uranium decay chains.",
    "Would explode violently if you could gather a visible piece.",
  ],
  88: [
    "Marie and Pierre Curie isolated radium from pitchblende.",
    "Once glowed on watch dials — and caused radiation illness.",
    "Named for radius — ray.",
  ],
  89: [
    "Actinium glows blue from its own radioactivity.",
    "Namesake of the actinide series.",
    "Extremely rare; decays quickly.",
  ],
  90: [
    "Thorium is more abundant than uranium in Earth's crust.",
    "Potential nuclear fuel; used in old gas mantles.",
    "Named for Thor, god of thunder.",
  ],
  91: [
    "Protactinium sits between thorium and uranium in decay chains.",
    "Extremely rare and radioactive.",
    "Named for protos actinium — parent of actinium.",
  ],
  92: [
    "Nuclear reactors and weapons rely on uranium isotopes.",
    "Dense metal; one fuel pellet holds enormous energy.",
    "Named for the planet Uranus.",
  ],
  93: [
    "First transuranic element — made in reactors.",
    "Named for Neptune.",
    "Decays to plutonium-238 in fuel cycles.",
  ],
  94: [
    "Voyager and Mars rovers use plutonium-238 for heat and power.",
    "First synthesized in 1940 at Berkeley.",
    "Extremely toxic if inhaled — lodges in lungs.",
  ],
  95: [
    "Ionization smoke detectors use a tiny americium-241 source.",
    "Named for the Americas.",
    "First produced in 1944 by Seaborg's team.",
  ],
  96: [
    "Curium glows faintly purple from radioactivity.",
    "Named for Marie and Pierre Curie.",
    "Made by bombarding plutonium with alpha particles.",
  ],
  97: [
    "Named for Berkeley, California, where it was discovered.",
    "All isotopes radioactive; made in cyclotrons.",
    "First identified in 1949.",
  ],
  98: [
    "Californium-252 is a portable neutron source for industry.",
    "Named for California and the university lab.",
    "One of the heaviest elements made in weighable amounts.",
  ],
  99: [
    "Einsteinium was first found in fallout from a hydrogen bomb test.",
    "Named for Albert Einstein.",
    "Too radioactive to study outside shielded labs.",
  ],
  100: [
    "Fermium honors Enrico Fermi, pioneer of nuclear reactors.",
    "Made by neutron bombardment in explosions or reactors.",
    "No stable isotopes exist.",
  ],
  101: [
    "Mendelevium nods to Dmitri Mendeleev, father of the periodic table.",
    "First made in 1955 at Berkeley.",
    "Only tiny amounts have ever existed.",
  ],
  102: [
    "Nobelium named for Alfred Nobel — dynamite and peace prizes.",
    "Chemistry done one atom at a time.",
    "Part of the actinide transfermium series.",
  ],
  103: [
    "Lawrencium closes the actinide row.",
    "Named for Ernest O. Lawrence, cyclotron inventor.",
    "Half-life of seconds — vanishes almost instantly.",
  ],
  104: [
    "Rutherfordium honors Ernest Rutherford, who probed the atom's nucleus.",
    "First transactinide confirmed.",
    "Chemistry shows group 4 behavior.",
  ],
  105: [
    "Dubnium named for Dubna, Russia — joint discovery credit.",
    "Superheavy element with fleeting half-lives.",
    "Homolog of tantalum in group 5.",
  ],
  106: [
    "Seaborgium is the only element named for a living person (at the time).",
    "Glenn Seaborg helped discover many actinides.",
    "Half-lives of seconds to minutes.",
  ],
  107: [
    "Bohrium honors Niels Bohr and his model of the atom.",
    "Named after a long Soviet-American naming dispute.",
    "Too unstable for macroscopic samples.",
  ],
  108: [
    "Hassium named for Hesse, home of the Darmstadt lab.",
    "Predicted to be a dense transition metal.",
    "Made by fusing lead and iron nuclei.",
  ],
  109: [
    "Meitnerium honors Lise Meitner, who explained nuclear fission.",
    "One of the heaviest elements made in labs.",
    "Exists only as individual atoms.",
  ],
  110: [
    "Darmstadtium named for the German city of its discovery.",
    "Superheavy; decays in milliseconds.",
    "Group 10 homolog — cousin of nickel and platinum.",
  ],
  111: [
    "Roentgenium honors Wilhelm Röntgen, discoverer of X-rays.",
    "Made by firing zinc at bismuth.",
    "Too short-lived for chemistry in bulk.",
  ],
  112: [
    "Copernicium honors Nicolaus Copernicus.",
    "May be volatile — perhaps a gas at room temperature.",
    "First made in 1996 in Darmstadt.",
  ],
  113: [
    "Nihonium is the first element discovered in Asia (Japan).",
    "Named for Nihon — Japan.",
    "One atom at a time; half-life of seconds.",
  ],
  114: [
    "Flerovium named for the Flerov Lab in Dubna.",
    "Superheavy; possibly a post-transition metal.",
    "First made in 1998.",
  ],
  115: [
    "Moscovium named for the Moscow region.",
    "Extremely radioactive; a few atoms at a time.",
    "Group 15 homolog in theory.",
  ],
  116: [
    "Livermorium honors Lawrence Livermore National Laboratory.",
    "Made by smashing calcium into curium.",
    "Vanishes in milliseconds.",
  ],
  117: [
    "Tennessine honors Tennessee and Oak Ridge National Lab.",
    "Heaviest halogen on the table.",
    "First synthesized in 2010.",
  ],
  118: [
    "Oganesson is the heaviest confirmed element — for now.",
    "Named for Yuri Oganessian, superheavy-element pioneer.",
    "Noble gas that may not stay inert under pressure.",
  ],
};

export function triviaFor(atomicNumber: number): readonly string[] {
  return ELEMENT_TRIVIA[atomicNumber] ?? [];
}

if (ELEMENTS.length !== Object.keys(ELEMENT_TRIVIA).length) {
  throw new Error("Every element needs hover trivia.");
}
