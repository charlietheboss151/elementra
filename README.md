# Charlie Bishop’s games: Elementra and Cosmica

This repo is the [charlietheboss.com](https://charlietheboss.com) site. The home page is a landing with two games:

- **[Elementra](https://charlietheboss.com/elementra/)** — a fast-paced periodic table challenge inspired by geography games like Seterra. Find elements by name, symbol, atomic number, property clues, or by typing the name from the symbol.
- **[Cosmica](https://charlietheboss.com/cosmica/)** — a space guessing game (coming soon).

Play on a computer or a phone.

<img src="docs/title.png" alt="Elementra title screen" width="720">

## Play (Elementra)

- **Modes** — find by name, symbol, or atomic number; Property Clues; Type the name; or Mixed Practice.
- **Groups** — Common elements for a short beginner round, a chemical family, or the whole table.
- **Scoring** — three guesses each. A first try is 1 point; later tries score less. A round is every element in the group you picked.
- **Hint** — on large groups, lights the period row; on All or Common, a second tap lights the family.
- **Progress** — scoreboard and element ranks stay in this browser. Ranks show the top 3 until you tap Show more. Register or log in is optional (a popup you can close). Usernames are unique; scores still stay on the device that registered.
- **Sound** — the top-right menu mutes voices, effects, or both. Name questions are spoken so you hear the name.

Atomic-number questions use a shuffled list so you cannot count across the table. Mixed Practice can ask those too, plus names, symbols, and property clues.

<img src="docs/setup.png" alt="Setup: pick a mode and element group, then start" width="720">

## How to run it

Prerequisites:

- [Node.js](https://nodejs.org/) 20 or newer (the project is developed on the current LTS)

Install and start a local dev server:

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:5173** (http, not https):

- `/` — site landing
- `/elementra/` — Elementra
- `/cosmica/` — Cosmica (coming soon)

The dev server uses port 5173 and accepts forwarded URLs from cloud IDEs. There are no env files or secrets.

## How it is built

Vite + React + TypeScript, as a multi-page site. The hub and Cosmica pages are static HTML. Elementra is the React app under `elementra/`. Element facts live in one table (`src/data/elements.ts`). Game modes are registered in `src/game/modes.ts` so new modes can reuse the same data and scoring.

```bash
npm run dev      # http://127.0.0.1:5173 (port 5173; fails if already taken)
npm run test     # game-logic unit tests
npm run build    # typecheck and write production files to dist/
npm run preview  # serve the dist/ build locally
npm run lint     # oxlint
```

`npm run build` writes production files to `dist/` with site-root URLs (`base: '/'`) for [charlietheboss.com](https://charlietheboss.com): `dist/index.html` is the hub, `dist/elementra/` is the game, `dist/cosmica/` is Cosmica. The title art is bundled into `/assets` (not a raw `/logo.jpg`). Upload the contents of `dist/`, not the project source. Preserve `public_html/.well-known/` if you rsync onto the live docroot. Username claims use `api/usernames.php` when the host runs PHP; names are stored in `elementra-usernames.json` next to `public_html`. If PHP is not enabled, two people on different devices can still pick the same name (this browser still blocks a duplicate).

## Deploy (charlietheboss.com)

Production lives on `charlie@192.64.87.248` in `~/src/elementra`, with the site root at `~/public_html/`.

### One-time SSH setup

```bash
./scripts/setup-deploy-ssh.sh
```

That creates `~/.ssh/elementra_ed25519` and adds a `Host elementra` block to `~/.ssh/config` (see `deploy/ssh-config.example`). Copy the printed public key into `~/.ssh/authorized_keys` on the server — the script prints a one-liner you can run from any machine that already has access.

First connect (accept the host key once):

```bash
ssh elementra 'echo ok'
```

### Deploy a release

From a clean `main` that you want live:

```bash
./scripts/deploy.sh
```

The script pulls `main` on the server, runs `npm ci && npm run build`, and rsyncs `dist/` to `~/public_html/` (keeping `.well-known`). After deploy: [charlietheboss.com](https://charlietheboss.com), [Elementra](https://charlietheboss.com/elementra/), [Cosmica](https://charlietheboss.com/cosmica/). Override paths with `ELEMENTRA_SSH_HOST`, `ELEMENTRA_REMOTE_SRC`, or `ELEMENTRA_REMOTE_WEB` if needed.

This project is licensed under the [GNU General Public License v3.0](LICENSE).
