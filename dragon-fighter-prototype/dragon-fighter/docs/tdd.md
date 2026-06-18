# Voice Dragon Battle - Technical Design

## Current Source

The playable source of truth is now `index.html`, adapted from `voice_command_battle.html`.
It is a standalone browser game that renders the battle in a Canvas, with a small HTML control bar for microphone and fallback buttons.

The older modular `src/` implementation still exists for tests and historical reference, but the current playable page is the standalone Canvas game in `index.html`.

## Implemented Gameplay

- 60 second match timer.
- Player and enemy both start with 100 HP.
- Commands: `Attack`, `Defence`, and `Ultimate`.
- Voice input uses the Web Speech API when available.
- Button fallback supports Attack, Defence, Ultimate, and Restart.
- Keyboard fallback supports `A`, `D`, `U`, and `R`.
- Any command starts the match when the game is on the ready overlay.
- Enemy attacks automatically on a random interval between 1.3 and 2.4 seconds.
- Result overlay appears for win, lose, draw, or HP comparison at timeout.

## Combat Rules

- Attack deals 12 damage to the enemy and has a 1 second cooldown.
- Defence lasts 3 seconds, has a 5 second cooldown, and reduces enemy damage to 35%.
- Ultimate deals 35 damage to the enemy and has a 9 second cooldown.
- Enemy attacks deal 10 damage before Defence reduction.
- HP is clamped between 0 and 100.
- Simultaneous defeat is a draw.
- If time expires, higher HP wins; equal HP draws.

## Assets

The standalone source uses the current project assets:

- Arena background: `public/assets/backgrounds/arena.png`
- Player dragon: `public/assets/dragons/fire-dragon-adult.png`
- Enemy dragon: `public/assets/dragons/moss-boss-dragon-enemy.png`

If any bitmap fails to load, the Canvas falls back to drawn dragon/arena shapes so the game remains playable.

## UI And Rendering

- The battle screen is drawn on a 1100 by 620 Canvas.
- HUD panels show player HP, enemy HP, timer, cooldowns, player state, enemy state, current message, latest heard phrase, and accepted command.
- A ready overlay is shown before the first command.
- A result overlay is shown after match end.
- Particle effects and screen shake communicate hits, Defence, and Ultimate.

## Input

Speech recognition accepts complete words after normalization:

- `attack`
- `defence`
- `defense`
- `ultimate`

Fallback controls call the same `useCommand` path as voice commands.

## Diagnostics

The game logs key events with the `[VoiceBattle]` prefix:

- asset load or failure
- reset
- command
- enemy attack
- match finish
- microphone start/end/error
- final speech phrase

## Build

`npm run build` copies the standalone `index.html`, `src/`, and `public/` into `dist/`.
The deployable game entry is `dist/index.html`.

## Follow-Up Technical Work

- Move the standalone logic into modules if long-term maintainability becomes more important than preserving the source file shape.
- Add automated tests for the standalone command parser and combat rules.
- Replace temporary private prototype dragon assets before public release.
