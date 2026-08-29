# Elementra: the periodic table game

Elementra is a fast-paced periodic table challenge inspired by geography games like Seterra. Test how well you know the elements by finding them on an interactive periodic table. Identify elements by their name, symbol, atomic number, or clues about their properties. Race against the clock, build streaks, improve your accuracy, and work your way from the easiest elements to the most challenging ones.

Can you master all 118 elements? 🧪⚛️

Local play: each question has three guesses. Score is 1 per first-try hit (less on later tries), so a perfect 6-element round is 6, not 18. A round includes every element in the group you pick (or the whole table). Atomic-number questions use a shuffled list instead of the table. Property Clues stacks facts such as family and room-temperature state until they point to one element. When a name question appears, the game speaks the element name using US classroom sounds (IPA on Microsoft voices, hyphenated phonetics otherwise), not a letter-by-letter reading of the spelling. Other modes speak the name after you answer so they do not give it away. Soft click, correct, and miss sounds play during a round; setup clicks (mode, group, timer) use a quieter tap. Race the clock ticks quietly in the last 10 seconds of each question.

## How to run it

Prerequisites:

- [Node.js](https://nodejs.org/) 20 or newer (the project is developed on the current LTS)

Install and start a local dev server:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). There are no env files or secrets.

## How it is built

Vite + React + TypeScript. Element facts live in one table (`src/data/elements.ts`). Game modes are registered in `src/game/modes.ts` so new modes can reuse the same data and scoring.

```bash
npm run dev      # local development server
npm run test     # game-logic unit tests
npm run build    # typecheck and write production files to dist/
npm run preview  # serve the dist/ build locally
npm run lint     # oxlint
```

`npm run build` writes production files to `dist/` with site-root URLs (`base: '/'`) for [charlietheboss.com](https://charlietheboss.com). The title art is bundled into `/assets` (not a raw `/logo.jpg`). Upload the contents of `dist/`, not the project source. Preserve `public_html/.well-known/` if you rsync onto the live docroot.

This project is licensed under the [GNU General Public License v3.0](LICENSE).
