# Elementra: the periodic table guessing game

Elementra is a fast-paced periodic table challenge inspired by geography games like Seterra. Test how well you know the elements by finding them on an interactive periodic table. Identify elements by their name, symbol, atomic number, or clues about their properties. Race against the clock, build streaks, improve your accuracy, and work your way from the easiest elements to the most challenging ones.

Can you master all 118 elements? 🧪⚛️

The first screen is the logo, a Designed & built by Charlie Bishop line, and Play. Optional register/log in is a dimmed popup you can close with X or by clicking outside (accounts stay in this browser). Play opens setup (mode, element group, timer, table preview, element ranks — first-try hits rank above 2nd or 3rd tries — and scoreboard) with the 118-elements line at the top. Hover or focus an element group (or the color legend) for a short explainer; the selected group also has a blurb under the pills. Back returns to the title screen. The longer game description sits under the scoreboard. Local play: each question has three guesses. Score is 1 per first-try hit (less on later tries), so a perfect 6-element round is 6, not 18. A round includes every element in the group you pick (or the whole table). After each round, a scoreboard keeps that run’s time and accuracy in this browser so you can compare later attempts. Loading 0.11.3 once clears every saved scoreboard and element-rank history (guest and every account) while leaving logins in place. A faint FPS and ping reading stays in the top-right. Atomic-number questions use a shuffled list instead of the table. Property Clues stacks facts such as family and room-temperature state until they point to one element. When a name question appears, the game speaks the element name in everyday US English at a conversational pace (Lead is said as “led”). It picks the most human voice the browser actually offers: Microsoft Jenny/Aria/Emma Online (Natural) in Edge, Google US English or Google UK English Female in Chrome, or Samantha on Apple, and waits for that list so it does not fall back to Windows David/Zira. Other modes speak the name after you answer so they do not give it away. A Sound menu in the top-left can mute voices, turn off sound effects, or mute all (saved in this browser). Soft click, correct, and miss sounds play during a round; setup clicks (mode, group, timer) use a quieter tap. Race the clock ticks quietly in the last 10 seconds of each question.

## How to run it

Prerequisites:

- [Node.js](https://nodejs.org/) 20 or newer (the project is developed on the current LTS)

Install and start a local dev server:

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:5173** (http, not https). The dev server is pinned to that address and port so it does not jump to 5174 or listen only on IPv6. There are no env files or secrets.

## How it is built

Vite + React + TypeScript. Element facts live in one table (`src/data/elements.ts`). Game modes are registered in `src/game/modes.ts` so new modes can reuse the same data and scoring.

```bash
npm run dev      # http://127.0.0.1:5173 (fails if that port is already taken)
npm run test     # game-logic unit tests
npm run build    # typecheck and write production files to dist/
npm run preview  # serve the dist/ build locally
npm run lint     # oxlint
```

`npm run build` writes production files to `dist/` with site-root URLs (`base: '/'`) for [charlietheboss.com](https://charlietheboss.com). The title art is bundled into `/assets` (not a raw `/logo.jpg`). Upload the contents of `dist/`, not the project source. Preserve `public_html/.well-known/` if you rsync onto the live docroot.

This project is licensed under the [GNU General Public License v3.0](LICENSE).
