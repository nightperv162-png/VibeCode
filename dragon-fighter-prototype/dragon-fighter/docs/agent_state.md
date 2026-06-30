# Agent State

## Current Milestone

Post-Milestone 3 - single-file Canvas prototype polish and documentation alignment.

## Active Source

- Playable game: root `index.html`
- Tests: `tests/game-flow.test.js`
- Docs: `dragon-fighter-prototype/dragon-fighter/docs/`
- Static server URL used for checks: `http://127.0.0.1:5174/index.html`

## Current Implementation Summary

- Canvas screens: Main Menu, Tutorial, Dragon Select, Countdown, Battle, Pause, Result, Upgrade, and Change Dragon confirmation.
- Dragons: Ember, Tide, and Moss with config-driven modifiers.
- Commands: Attack, Defense, Block, and Ultimate.
- Keyboard combat shortcuts: Q/W/E/R.
- Voice input uses a fresh Web Speech API recognition session per `Listen Command`, with queued transcript processing, duplicate suppression, cooldown feedback, and concise Canvas voice debug.
- Mic control text is `Listen Command` when off and `Execute Command` while active/requested.
- A valid voice command stops mic listening, disables slow-time, then executes through the shared command path.
- Mic slow-time starts immediately when speech recognition begins listening during active battle.
- A 3 second pre-match countdown runs before match time, cooldowns, AI timer, Defense/Block timers, and projectile timing start.
- Combat command buttons show cooldown seconds, dim while unavailable, and are disabled during countdown or while mic input locks manual combat controls.
- Primary forward-action buttons use a dark green style and centered white text.
- Ultimate starts on full cooldown for every new or retried battle.

## Current Validation State

- `git diff --check` has passed on recent code edits.
- Local HTTP check has returned 200 at `http://127.0.0.1:5174/index.html`.
- Current test count is 33.
- Node test command is `node --test tests/game-flow.test.js`; in the current shell Node has recently been unavailable on PATH.

## Next Action

Visually review the updated Countdown, mic labels, primary button colors, and battle screen in a browser, then replace temporary dragon placeholders with licensed production-safe assets.

## Latest Documentation Work

- Refreshed README, GDD, TDD, plan, slide summary, project memory, agent state, and agent rules to match the current game.
- Updated old player-facing command wording to Defense/Ultimate.
- Documented `Listen Command` / `Execute Command`, the 3 second pre-match countdown, dark green primary buttons, mic slow-time behavior, fresh voice sessions, and the current validation surface.
