# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
