# Periodic Table Game

A Seterra-style quiz for students and anyone practicing the periodic table. You read a prompt and click the matching element—no typing answers into a box. Each question has three guesses. You can practice one chemical family or the whole table.

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

This project is licensed under the [GNU General Public License v3.0](LICENSE).
