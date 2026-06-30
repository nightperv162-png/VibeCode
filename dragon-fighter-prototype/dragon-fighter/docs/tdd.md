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
- combat values, cooldowns, timers, starting cooldown behavior, and `preMatchCountdownSeconds`
- Q/W/E/R combat key mapping
- voice language, scan interval, duplicate-result window, base timer multiplier, mic slow-time multiplier, and mic slow-time timeout values
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

`reset()` starts a battle in `playing` phase with `state.countdownTimer = cfg.preMatchCountdownSeconds`. During countdown, the arena renders and combat buttons dim, but match time, cooldowns, AI timer, Defense/Block timers, pending attacks, and projectile timing do not advance.

## Combat

- Voice, keyboard, and Canvas inputs all route through the same command path.
- `commandFromKey()` maps Q/W/E/R to Attack, Defense, Block, and Ultimate.
- `processVoiceTick()` consumes the latest queued transcript, normalizes it, extracts the first valid command word, and routes it through the same command path.
- Repeated valid words in one transcript, such as `attack attack`, trigger one command.
- Attack and Ultimate schedule pending projectile attacks; damage resolves after cast and travel timing.
- Block negates incoming damage. Defense applies the configured damage multiplier.
- Cooldowns and active timers update each frame and clamp at zero after countdown ends.
- Ultimate starts at its full command cooldown for every new or retried battle.
- Enemy behavior currently schedules Attack only, using stage-scaled random waits.
- Pause freezes match time, AI timer, cooldowns, particles/effects, pending projectiles, screen shake, Frenzy timer, and countdown state.

## Rendering And Assets

- One 1400 by 620 Canvas renders every screen and control.
- Drawing functions rebuild pointer hit regions for the currently rendered controls.
- General button text is larger and centered. Primary action buttons use the same dark green style.
- Combat command buttons display cooldown seconds directly and are dimmed while cooling down, during countdown, or while manual combat input is disabled.
- Dragon and arena images have Canvas fallbacks.
- PNG projectile assets are processed in memory to remove connected light backgrounds; SVG data URI fallbacks remain configured.
- Overlays handle countdown, tutorial, result, pause, and change-dragon confirmation without leaving the Canvas UI.

## Voice Input

The Web Speech API is optional. When available, each `Listen Command` activation creates a fresh recognition session using `en-US`, continuous interim results, queued final transcripts, `processVoiceTick()` parsing, duplicate suppression, and a configured 0.5 second scan cadence.

Manual combat controls are disabled while microphone input is active. Unsupported or denied microphone access leaves keyboard and Canvas controls usable.

The mic button uses player-facing labels:

- `Listen Command` when mic is off
- `Execute Command` while mic is active/requested

Mic slow-time starts in `recognition.onstart` when the mic is truly listening and the match is active. It affects match time, cooldowns, AI timer, Defense/Block timers, and projectile timing via scaled gameplay dt. Cosmetic particles continue using raw dt. Slow-time ends on valid command recognition before the command executes, on timeout, on manual stop, or on mic errors.

## Public Test Surface

`window.DragonFighter` exposes config, state, core helpers, flow functions, command mapping, input state, and rendering hooks for lightweight tests. It is a test/debug surface over the real single-file game, not a second implementation.

## Tests

Run:

```powershell
node --test tests/game-flow.test.js
```

The current 33 tests cover Main Menu and Tutorial flow, result routing, retry and Main Menu reset behavior, Ultimate starting cooldown, voice config and tick processing, fresh mic sessions, repeated speech, cooldown voice feedback, immediate mic slow-time, slow-time timeout/error cleanup, scaled match/cooldown/AI timers, pre-match countdown timing, mic/manual input lockout, Q/W/E/R mapping, old-key rejection, button cooldown labels, pause behavior, paused retry/reset, and Change Dragon confirmation.

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
