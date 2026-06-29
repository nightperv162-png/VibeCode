# Dragon Fighter - Current TDD

## Runtime Architecture

- The playable source of truth is repository-root `index.html`.
- HTML, CSS, configuration, state, input handling, combat, progression, update loop, voice integration, and Canvas rendering are inline in that file.
- There is no framework, package manifest, module source tree, build step, or generated deployment directory.
- GitHub Pages deploys the repository root. Runtime assets are referenced with relative paths under `dragon-fighter-prototype/dragon-fighter/public/`.

## Configuration

The inline `cfg` object owns:

- viewport size and Canvas layout geometry
- labels, menu/tutorial/result/pause/confirmation layout, and dragon-select layout
- combat values, cooldowns, timers, and starting cooldown behavior
- Q/W/E/R combat key mapping
- voice language, scan interval, and duplicate-result window
- dragon modifiers, enemy roster, progression formulas, and upgrade definitions
- asset paths, projectile profiles, and facing rules

## State And Flow

`createInitialState()` creates the in-memory run state. Main phases are:

- `menu`
- `tutorial`
- `select`
- `playing`
- `result`
- `upgrade`

Important flow functions include `playNow()`, `openTutorial()`, `completeTutorial()`, `confirmDragon()`, `pauseMatch()`, `resumeMatch()`, `retryPausedMatch()`, `finish()`, `continueAfterWin()`, `retryLastBattle()`, `backToMainMenu()`, `applyUpgrade()`, and `confirmChangeDragon()`.

Loss/draw retry restores the previous dragon, stage, and upgrades. Pause retry keeps the same setup but resets the active battle. Main Menu reset clears selection, upgrades, progression, voice queue, match effects, and battle outcome.

## Combat

- Voice, keyboard, and Canvas inputs all route through the same command path.
- `commandFromKey()` maps Q/W/E/R to Attack, Defence, Block, and Ultimate.
- `commandFromSpeech()` accepts one normalized command word for Attack, Defence/Defense, Block, Ultimate, or Skill.
- Attack and Ultimate schedule pending projectile attacks; damage resolves after cast and travel timing.
- Block negates incoming damage. Defence applies the configured damage multiplier.
- Cooldowns and active timers update each frame and clamp at zero.
- Ultimate starts at its full command cooldown for every new or retried battle.
- Enemy behavior currently schedules Attack only, using stage-scaled random waits.
- Pause freezes match time, AI timer, cooldowns, particles/effects, pending projectiles, screen shake, and Frenzy timer.

## Progression

Shared helper functions calculate Attack damage, Ultimate damage, Defence duration, maximum HP, Block cooldown, Attack/Ultimate cooldowns, enemy stats, and upgrade availability.

Enemy stats derive from stage index using configured HP, damage, wait-time, roster, cycle-name, and scale formulas. Upgrade ranks affect the same helper functions used by combat, rendering, and tests.

## Rendering And Assets

- One 1400 by 620 Canvas renders every screen and control.
- Drawing functions rebuild pointer hit regions for the currently rendered controls.
- Dragon and arena images have Canvas fallbacks.
- PNG projectile assets are processed in memory to remove connected light backgrounds; SVG data URI fallbacks remain configured.
- Overlays handle tutorial, result, pause, and change-dragon confirmation without leaving the Canvas UI.

## Voice Input

The Web Speech API is optional. When available, recognition uses `en-US`, continuous interim results, final-result processing, duplicate suppression, and a configured 0.5 second scan cadence.

Manual combat controls are disabled while microphone input is active. Unsupported or denied microphone access leaves keyboard and Canvas controls usable.

## Public Test Surface

`window.DragonFighter` exposes config, state, core helpers, flow functions, command mapping, input state, and rendering hooks for lightweight tests. It is a test/debug surface over the real single-file game, not a second implementation.

## Tests

Run:

```powershell
node --test tests/game-flow.test.js
```

The current 21 tests cover Main Menu and Tutorial flow, tutorial buttons, result routing, retry and Main Menu reset behavior, Ultimate starting cooldown, voice config and command handling, mic/manual input lockout, Q/W/E/R mapping, old-key rejection, pause behavior, paused retry/reset, and Change Dragon confirmation.

Inline JavaScript can also be syntax-checked by extracting the script from `index.html` and running `node --check`. There is no build command.

## Deployment

- Entry point: `/index.html`
- Deployment artifact: repository root
- Workflow: `.github/workflows/pages.yml`
- Required runtime: modern browser with Canvas
- Optional runtime feature: Web Speech API

## Known Constraints

- Gameplay progression is not persisted across reloads.
- Tutorial completion uses guarded localStorage only when available.
- Voice support and permission behavior vary by browser.
- Current prototype images require replacement before public distribution.
- Automated coverage is strongest around flow and input behavior; combat formulas, damage priority, stage scaling, and responsive/browser visual checks remain useful next coverage areas.
