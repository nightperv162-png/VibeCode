# Dragon Fighter - Current Plan

## Completed

- Consolidated the playable game into repository-root `index.html` with no build system.
- Added Canvas Main Menu, optional Tutorial, Dragon Select, Battle, Result, Pause, Upgrade, and Change Dragon confirmation screens.
- Added Ember, Tide, and Moss with config-driven combat modifiers.
- Implemented shared voice, keyboard, and Canvas controls for Attack, Defence, Block, and Ultimate.
- Remapped combat keyboard shortcuts to Q/W/E/R and removed the old A/D/B/U combat mapping.
- Added Web Speech API support with `en-US`, one-word command recognition, duplicate suppression, cooldown feedback, and manual combat lockout while the mic is active.
- Implemented projectiles, damage resolution, cooldowns, Defence, Block, Ultimate, enemy attacks, timer results, pause freezing, and combat feedback.
- Added stage scaling, enemy rotation, four upgrade paths, and win-to-upgrade progression.
- Added Continue-only win navigation and Retry/Main Menu loss and draw navigation.
- Preserved dragon, stage, and upgrades on result retry; reset the complete run on Main Menu.
- Added paused Retry Match, Resume, and Back to Main Menu.
- Made Ultimate start on full cooldown for every battle and retry.
- Added relative local assets, Canvas fallbacks, GitHub Pages deployment, and 21 focused flow/input tests.

## Current Validation

- `node --test tests/game-flow.test.js`
- `git diff --check`
- Inline script syntax check with `node --check`
- Serve repository root and review `/index.html`
- Manually confirm Main Menu, Tutorial, Dragon Select, combat, Pause, win Continue, upgrade, loss Retry, Main Menu reset, and Change Dragon confirmation.
- Confirm Ultimate is unavailable at battle start and becomes ready when its cooldown reaches zero.

## Next Priorities

1. Replace temporary dragon images with licensed production-safe assets.
2. Add focused tests for damage priority, stage scaling, upgrade formulas, enemy stat formulas, and voice normalization edge cases.
3. Visually verify Tutorial, Pause, Dragon Select, and battle screens in target desktop and mobile browsers.
4. Verify microphone permission behavior and fallback messaging across target browsers.
5. Tune combat and progression values from playtest feedback without changing the single-file architecture.

## Not Planned

- Build tooling or a framework migration.
- Online multiplayer, accounts, monetization, persistent progression, movement, aiming, or multiple arenas.
