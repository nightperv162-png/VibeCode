# Project Memory

## Stable Decisions

- The active playable Dragon Fighter source is the repository-root `index.html`.
- The nested `dragon-fighter-prototype/dragon-fighter` folder now mainly holds docs and runtime assets.
- The game is intentionally single-file HTML/CSS/JavaScript with Canvas rendering and no build step.
- All player-facing UI stays inside Canvas.
- Deployment serves the repository root through GitHub Pages.
- Runtime assets are loaded from `dragon-fighter-prototype/dragon-fighter/public/assets/` with Canvas fallbacks.
- Current image assets are temporary prototype placeholders and must be replaced with licensed production-safe assets before public release.

## Current Game Shape

- Main phases: `menu`, `tutorial`, `select`, `playing`, `result`, and `upgrade`.
- Player flow: Main Menu -> optional Tutorial -> Dragon Select -> 3 second Countdown -> Battle -> Result -> Upgrade or Retry.
- Dragons: Ember, Tide, and Moss.
- Commands: Attack, Defense, Block, and Ultimate.
- Keyboard combat shortcuts: Q/W/E/R.
- Voice command words: Attack, Defense, Block, and Ultimate. The hidden recognition alias `skill` still maps to Ultimate.
- Mic UI labels are `Listen Command` and `Execute Command`.
- Voice command handling uses a fresh recognition session for each mic activation, then stops mic listening before executing the recognized command.
- While mic is listening during active battle, gameplay timers use `micSlowTimeMultiplier`.
- The countdown does not advance match timer, AI timer, cooldowns, or combat timers.
- Primary forward-action buttons use a dark green style with white text.

## Validation Memory

- The active automated suite is `tests/game-flow.test.js`.
- Current test count: 33.
- Main checks: `node --test tests/game-flow.test.js`, `git diff --check`, local static server check for `/index.html`.
- In this shell, Node has recently been unavailable on PATH, so test execution may be blocked even though the test file is current.
