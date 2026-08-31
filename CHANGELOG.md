# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.20.1] - 2026-08-31

### Changed

- Cosmica uses its official circular logo on the hub card and coming-soon page.

## [0.20.0] - 2026-08-31

### Added

- Site landing at charlietheboss.com with cards for Elementra and Cosmica.
- Cosmica coming-soon page at `/cosmica/`.
- Deploy SSH helper (`scripts/setup-deploy-ssh.sh`), `Host elementra` config example, and `scripts/deploy.sh` for charlietheboss.com.
- On the setup screen, hover or focus any tile in the preview table to pop it forward and read element-specific trivia.

### Changed

- Elementra now lives at `/elementra/` instead of the site root.
- Correct tiles show the full name, symbol, and number, a checkmark, and a stronger pop so it is easier to see what is left at the end of a round.

## [0.18.1] - 2026-08-29

### Fixed

- Register still works if the live server downloads the username script instead of running it. Same-device duplicates still say the name is taken.

## [0.18.0] - 2026-08-29

### Added

- Element ranks starts with the top 3. Show more opens the rest; Show less folds it back.
- Registering a name that someone else already used says “That username is taken.”

## [0.17.1] - 2026-08-29

### Fixed

- Phones and small tablets: the periodic table fits the screen (names hide so tiles stay readable), and setup/play controls wrap instead of running off the edge. Desktop layout is unchanged.

### Changed

- The npm package name is `elementra`, matching the game (it was still `periodic-table-game`).
- README splits play from how to run and build it, and includes title and setup screenshots.

## [0.17.0] - 2026-08-29

### Changed

- Mixed Practice also asks atomic numbers. Those questions use the shuffled list (not the table) so you cannot count across.

## [0.16.1] - 2026-08-29

### Changed

- Hint says what it does: lights the period row, and on All / Common a second tap lights the family. Setup notes when Hint will appear.

## [0.16.0] - 2026-08-29

### Added

- Type the name mode: see the symbol and atomic number, spell the English name. Three guesses, same scoring as click modes. Aluminium/sulfur British spellings count.

## [0.15.1] - 2026-08-29

### Changed

- Property Clues hides atomic numbers on tiles (as well as names and symbols) so you cannot count your way to the answer.

## [0.15.0] - 2026-08-29

### Added

- Last mode, element group, and timer are remembered in this browser (guest and each account separately) so setup does not reset after a reload.

## [0.14.0] - 2026-08-29

### Added

- Common elements group for beginners: a shorter round of well-known names (hydrogen, carbon, oxygen, iron, gold, and the rest already marked common in the table).

## [0.13.2] - 2026-08-29

### Fixed

- Screen readers no longer hear hidden element names, symbols, or numbers on tiles during a question. Full identity is spoken after that tile is identified.

## [0.13.1] - 2026-08-29

### Changed

- Sound menu sits fixed in the top-right so it no longer covers Back and does not scroll with the page.

## [0.13.0] - 2026-08-29

### Changed

- Quit mid-round still saves element ranks and a scoreboard row marked Incomplete, with that run’s score, accuracy, and time so far.

## [0.12.0] - 2026-08-29

### Added

- Sound menu (top-left) to mute spoken names, turn off click/correct/miss/timer sounds, or mute all. Choice stays in this browser.

## [0.11.4] - 2026-08-29

### Changed

- Element names use the most human browser voices first (Edge Jenny/Aria/Emma neural, then Chrome Google US/UK English, then Apple Samantha) and wait until that list loads, so Windows no longer defaults to robotic David/Zira.

## [0.11.3] - 2026-08-29

### Changed

- One-time wipe of every saved scoreboard and element-rank history (all accounts and guest) so ranking starts clean. Logins stay.

## [0.11.2] - 2026-08-29

### Changed

- Element ranks count a 2nd or 3rd try below a first-try hit, so a late save sits under elements you got on the first click.

## [0.11.1] - 2026-08-29

### Changed

- Register and log in open as a dimmed popup with an X (and click-outside to close). The title button is Play.

## [0.11.0] - 2026-08-29

### Added

- Optional register and log in on the title screen. Accounts and scores stay on this device. Signed-in play saves the scoreboard and a ranking of elements you get right or wrong most, sortable best-first or worst-first.

## [0.10.0] - 2026-08-29

### Added

- Hover and keyboard-focus explainers for each element group on the setup pills and the table legend, plus a short blurb under the selected group so the same copy is readable without hover.

## [0.9.7] - 2026-08-29

### Changed

- Element names are spoken as normal English at a conversational pace, preferring a Google or neural voice over old desktop voices.

## [0.9.6] - 2026-08-29

### Added

- Back on setup returns to the logo and Start screen.

## [0.9.5] - 2026-08-29

### Changed

- Setup title: colorful bold Elementra: on one line with a smaller gray subtitle.

## [0.9.4] - 2026-08-29

### Changed

- Setup and the browser tab title say Elementra: the periodic table guessing game.

## [0.9.3] - 2026-08-29

### Changed

- Title screen credit sits under the logo. Setup opens with the 118-elements line; the longer description stays under the scoreboard.

## [0.9.2] - 2026-08-29

### Changed

- Setup puts Play first. The credit and game pitch sit in a footer under the scoreboard instead of a large block at the top.

## [0.9.1] - 2026-08-29

### Fixed

- Local `npm run dev` listens on `http://127.0.0.1:5173` (IPv4, that port only) so the usual localhost URL is not a dead IPv6-only 5174 instance.

## [0.9.0] - 2026-08-29

### Added

- Title screen with the Elementra logo and a Start button. Start opens the mode, group, and table setup.

## [0.8.1] - 2026-08-29

### Added

- Tiny FPS and ping readout in the top-right corner (latency to this site). It is dim and does not block clicks.

## [0.8.0] - 2026-08-29

### Added

- Scoreboard of each finished round’s accuracy and time (saved in the browser) so you can see improvement. After a round it compares to your last run of the same mode and group.

## [0.7.2] - 2026-08-29

### Changed

- Element speech uses US IPA on Microsoft voices, and hyphenated classroom sounds (not spaced-out spelling) on Chrome, so names like Lead, Yttrium, and Molybdenum are said as they are pronounced.

## [0.7.1] - 2026-08-29

### Changed

- Spoken names use US classroom pronunciations for all 118 elements (for example Lead as “led”, Yttrium as “it-tree-um”), not a letter-by-letter reading of the spelling.

## [0.7.0] - 2026-08-29

### Added

- Spoken element names: name questions are read aloud when they appear. Symbol, number, and property questions say the name after you answer so they do not spoil it.

## [0.6.6] - 2026-08-29

### Fixed

- Score was still 3× the question count (18/6 for alkali metals). It now shows 1 per first-try hit, out of the number of elements in the round. Accuracy still weights later tries lower.

## [0.6.5] - 2026-08-29

### Fixed

- Round-complete headline showed score out of 3× the question count (18/18 for 6 elements). It now shows elements found (6/6); points stay in a labeled Score row.

## [0.6.4] - 2026-08-28

### Changed

- Production builds use site-root asset URLs (`base: '/'`) for the charlietheboss.com apex deploy. The title art is still bundled under `/assets`, so it is not requested as `/logo.jpg`.

## [0.6.3] - 2026-08-28

### Fixed

- Title art and tab icon now load on hosted sites, not only on localhost. They were requested from the domain root (`/logo.jpg`), which 404s when the game is served from a subpath.

## [0.6.2] - 2026-08-28

### Fixed

- Home page white screen: restore the tile click sound export that the last UI-tap change accidentally removed.

## [0.6.1] - 2026-08-28

### Added

- A quieter tap when switching modes, element groups, Race the clock, and other setup buttons.

## [0.6.0] - 2026-08-28

### Added

- Quiet click, correct, and miss sounds during play, plus a soft tick in the last 10 seconds of Race the clock (a little more present in the last 3 seconds).

## [0.5.2] - 2026-08-28

### Removed

- Redundant “practice the whole table / three guesses” line under Element group. The round still shows the question count.

## [0.5.1] - 2026-08-28

### Added

- Elementra title art on the home page and as the site icon.

## [0.5.0] - 2026-08-28

### Added

- Property Clues mode: stacked facts (family, room-temperature state, period, group, and similar) that uniquely identify one element. Mixed Practice can include those clues too. Family colors, names, and symbols are hidden during a clue question so the facts have to do the work.

## [0.4.0] - 2026-08-28

### Removed

- Element Information mode (electron-count clues). Mixed Practice is names and symbols only.

### Changed

- Home, README, and page description no longer mention property clues.

## [0.3.4] - 2026-08-28

### Added

- Home page credit: designed and built by Charlie Bishop.

## [0.3.3] - 2026-08-28

### Changed

- Home-page copy under the table preview is a short invitation instead of a dry recap of the scoring colors.

## [0.3.2] - 2026-08-28

### Changed

- Periodic-table tiles always show the atomic number, in a larger weight so 1–118 are easy to read.
- Element-family colors are more distinct (red alkali metals, orange alkaline earths, gold transition metals, green post-transition, teal metalloids, cyan nonmetals, blue halogens, purple noble gases, pink lanthanides, brown actinides).

## [0.3.1] - 2026-08-28

### Changed

- The game is now branded **Elementra: the periodic table game**, with a matching home-page and README description.

## [0.3.0] - 2026-08-28

### Added

- Atomic-number mode uses a shuffled list instead of the periodic table, so counting across the grid does not give the answer away.

### Changed

- Accuracy uses points earned (first try 100%, second ~67%, third ~33%, miss 0%) instead of treating any success within three guesses as a perfect question.
- Element Information and Mixed no longer ask proton or atomic-number clues, which were the same as atomic number.

## [0.2.2] - 2026-08-28

### Added

- A short popup naming the element you clicked when the guess is wrong, then it fades away.

## [0.2.1] - 2026-08-28

### Changed

- A round asks every element in the selected group instead of a 10/20/50 question picker.
- Answered tiles keep their green / yellow / orange / red mark for the rest of the round.

## [0.2.0] - 2026-08-28

### Added

- Three guesses per question, with green / yellow / orange tiles for 1st / 2nd / 3rd-try hits and a red reveal of the correct element after a miss.
- Element-group selection (the same families as the table) plus an All elements set, available in every game mode.

### Removed

- Easy / Medium / Hard / Expert difficulty tiers.

## [0.1.1] - 2026-08-28

### Fixed

- Question sets stay fixed for a round, tile clicks always score against the current prompt, and quitting mid-feedback no longer jumps to results.
- Play again starts a new question set without a page refresh.

### Added

- Remaining-question count during a round, and unit tests for every game mode.

## [0.1.0] - 2026-08-28

### Added

- Click-the-table quiz with find-by-name, atomic number, symbol, element information, and mixed modes.
- Easy through expert difficulties, 10/20/50 question rounds, optional per-question timer, hints, and a results review.
- Centralized data for all 118 elements and a standard-layout interactive periodic table.
