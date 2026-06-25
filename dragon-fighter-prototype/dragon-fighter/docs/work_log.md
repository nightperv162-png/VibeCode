# Work Log

## 2026-06-18

### Inspected

- `docs/gdd.md`
- `docs/tdd.md`
- `docs/plan.md`
- top-level `README.md`
- Git history for the previous canvas foundation commit

### Changed

- `src/input/pointerInput.js`
- `src/input/keyboardInput.js`
- `src/input/inputMapper.js`
- `src/combat/actions.js`
- `src/combat/cooldowns.js`
- `src/combat/damageResolver.js`
- `src/combat/matchRules.js`
- `src/ai/aiController.js`
- `package.json`
- `index.html`
- `scripts/build.js`
- `scripts/dev-server.js`
- `src/config.js`
- `src/main.js`
- `src/core/gameState.js`
- `src/core/gameLoop.js`
- `src/core/logger.js`
- `src/assets/assetManifest.js`
- `src/assets/assetLoader.js`
- `src/ui/layout.js`
- `src/render/canvasRenderer.js`
- `public/assets/dragons/README.md`
- `public/assets/dragons/fire-dragon-adult.jpg`
- `public/assets/dragons/holy-paladin-dragon-adult.png`
- `public/assets/dragons/moss-boss-dragon-adult.png`
- `public/assets/dragons/moss-boss-dragon-enemy.png`
- `test/milestone1.test.js`
- `test/milestone2.test.js`
- `test/milestone3.test.js`
- `docs/project_memory.md`
- `docs/agent_state.md`
- `docs/work_log.md`

### Tested

- `npm.cmd test` passed: 39 tests, 39 pass.
- `npm.cmd run build` passed and generated `dist`, including `dist/public/assets/dragons`.
- Dev server check passed with HTTP 200 at `http://localhost:5173`.
- Local dragon asset URLs returned HTTP 200; a missing dragon image URL returned HTTP 404 for fallback coverage.
- Microsoft Edge headless screenshot confirmed the Dragon Select images render in Canvas.
- In-app Browser plugin verification was attempted for this asset pass but the `iab` browser surface was unavailable, so Microsoft Edge headless was used for the visual check.

### Arena Background Pass

- Inspected `docs/agent_state.md`, `docs/agent_rules_short.md`, last 30 lines of `docs/work_log.md`, asset loader, manifest, config, renderer, and Milestone 1 tests.
- Changed `src/assets/assetManifest.js`, `src/assets/assetLoader.js`, `src/config.js`, `src/main.js`, `src/render/canvasRenderer.js`, `test/milestone1.test.js`, `docs/project_memory.md`, `docs/agent_state.md`, and `docs/work_log.md`.
- Added `public/assets/backgrounds/arena.png` to the manifest-driven arena background path.
- `npm.cmd test` passed: 41 tests, 41 pass.
- `npm.cmd run build` passed and generated `dist`, including `dist/public/assets/backgrounds/arena.png`.
- Dev server check passed with HTTP 200 at `http://localhost:5173`; arena background asset returned HTTP 200.

## 2026-06-19

### Dragon Trait Pass

- Inspected `docs/agent_state.md`, `docs/agent_rules_short.md`, last 30 lines of `docs/work_log.md`, the root static `index.html`, git history, and the current tracked tree.
- Changed `index.html`, `src/gameCore.js`, `test/gameCore.test.js`, `scripts/build.js`, `scripts/serve.js`, `package.json`, `docs/project_memory.md`, `docs/agent_state.md`, and `docs/work_log.md`.
- Added centralized config for exactly three selectable dragons using existing local assets: Ember Attack Focus, Tide Defence Focus, and Moss Balanced.
- Displayed role, flavor, and modifiers on the Canvas-only Dragon Select screen.
- Applied selected dragon Attack, Defence, and Skill cooldown modifiers through helper logic used by combat commands.
- Updated battle rendering to draw the selected player dragon and use opposite player/enemy facing flags.
- `npm.cmd test` passed: 8 tests, 8 pass.
- `npm.cmd run build` passed and generated `dist`.
- Local static server check passed with HTTP 200 at `http://127.0.0.1:5174/index.html`; `src/gameCore.js` and a dragon asset also returned HTTP 200.
- Browser screenshot verification was blocked because the in-app Browser `iab` surface and local Edge/Chrome binaries were unavailable.

### Single File Cleanup

- Inlined the root `src/gameCore.js` config and helper logic back into `index.html`.
- Removed the extra root `src`, `test`, `scripts`, and `package.json` files so the active Canvas game is one single file.
- Updated memory docs to record that active game config, combat modifier helpers, state, input, and rendering logic now live inline in root `index.html`.

## 2026-06-22

### Main Menu And Result Navigation

- Inspected the available nested agent state/rules and recent work log; the requested `docs/agent_brief.md` was not present in the synced repository.
- Updated root `index.html` with a config-driven Main Menu, win/loss result actions, retry setup restoration, full run reset, and full starting Ultimate cooldown.
- Added `tests/game-flow.test.js` with six focused flow and cooldown tests.
- `node --test tests/game-flow.test.js` passed: 6 tests, 6 pass.
- Inline JavaScript syntax check and `git diff --check` passed.
- Static HTTP check returned 200 at `http://127.0.0.1:5174/index.html`.
- Headless Edge screenshots confirmed the Main Menu and the Canvas win/loss result overlays render without overlap.

## 2026-06-23

### Current Documentation Alignment

- Reviewed root `index.html`, `tests/game-flow.test.js`, Git history, and the existing GDD, TDD, and plan.
- Rewrote `docs/gdd.md`, `docs/tdd.md`, and `docs/plan.md` to match the implemented single-file game, current values, flow, progression, assets, tests, and remaining constraints.
- Removed stale countdown, one-screen, one-dragon, old combat-value, and no-test claims.
- `node --test tests/game-flow.test.js` passed: 6 tests, 6 pass.
- `git diff --check` passed.

## 2026-06-25

### Tutorial And Voice Input

- Read nested `docs/agent_state.md`, `docs/agent_rules_short.md`, and the last 30 lines of `docs/work_log.md`; root `docs/agent_brief.md` was not present.
- Updated root `index.html` with a Canvas tutorial, tutorial completion persistence, config-driven `en-US` speech recognition, 0.5s voice scan timing, strict one-word voice command handling, immediate voice casts, cooldown feedback, duplicate-result suppression, and mic-active manual combat input disabling.
- Expanded `tests/game-flow.test.js` from 6 to 11 tests covering tutorial flow, voice config, immediate/cooldown/duplicate voice behavior, mic-active button/key disabling, voice command continuity, and manual command restoration after mic stop.
- `node --test tests/game-flow.test.js` passed: 11 tests, 11 pass.
- `git diff --check` passed.
- Local static server check returned HTTP 200 at `http://127.0.0.1:5174/index.html`.
- Centered the tutorial Skip, Next, and Done buttons by moving their config positions to a centered row around the Canvas midpoint.
- `node --test tests/game-flow.test.js` passed: 11 tests, 11 pass.
- `git diff --check` passed.
- Changed the first screen back to Main Menu, added a Main Menu Tutorial button, and lowered the tutorial title/body text.
- Updated the tutorial flow test for Main Menu-first behavior.
- `node --test tests/game-flow.test.js` passed: 11 tests, 11 pass.
- `git diff --check` passed.

### Pause Menu

- Replaced the combat Restart button with a Pause button in root `index.html`.
- Added Canvas pause overlay actions for Resume, Retry Match, and Back to Main Menu.
- Added paused state handling to freeze match timer, AI, cooldowns, particles/effects, pending projectiles, render-time animations, and Frenzy timer state.
- Ignored voice and manual combat commands while paused while keeping pause menu navigation active.
- Expanded `tests/game-flow.test.js` to 17 tests covering pause button replacement, freeze behavior, command blocking, resume, retry reset, and Main Menu reset.
- `node --test tests/game-flow.test.js` passed: 17 tests, 17 pass.
- `git diff --check` passed.
- Local static server check returned HTTP 200 at `http://127.0.0.1:5174/index.html`.
