# Agent State

## Current Milestone

Post-Milestone 3 - Current documentation alignment.

## Completed This Turn

- Added a Canvas-only Dragon Select phase before the static arena.
- Added exactly three config-driven dragon options: Ember, Tide, and Volt.
- Added pointer selection and confirm flow with blocked-confirm feedback.
- Updated static arena state so the selected dragon becomes Player 1's arena dragon.
- Added tests for config dragon options, selection, blocked confirm, successful transition, selected dragon data, idle labels, and layout data.
- Verified tests/build pass.
- Verified the dev server responds at `http://localhost:5173`.
- Browser verification is blocked by sandbox ACL errors when loading the in-app Browser plugin client.
- Added command mapping for Attack, Defence, Block, and Skill.
- Added keyboard input and Canvas combat buttons using one shared command path.
- Added command validation, cooldowns, active Defence and Block durations, damage resolution, HP updates/clamping, state labels, and latest command feedback.
- Added tests for command mapping, shared input mapping, cooldowns, damage rules, damage priority, HP clamp, defeated/inactive rejection, and feedback.
- Added 3-second countdown, active match timer, result rules, result overlay, restart flow, and AI action scheduling.
- Added tests for countdown blocking, match start, active-only timer decrease, timer win/loss/draw, simultaneous defeat draw, defeat result, AI interval/legal action behavior, AI defeated/inactive behavior, and restart reset.
- Verified tests/build pass and dev server responds at `http://localhost:5173`.
- In-app Browser plugin verification remains blocked by sandbox ACL errors while loading the browser client.
- Added manifest-driven temporary Dragon Mania Legends Wiki placeholder dragon images for private prototype use.
- Connected Ember, Tide, Volt, and the rival dragon to local image asset keys.
- Added config-driven image load/error states and asset logs.
- Updated Canvas rendering to draw loaded dragon images and keep shape fallback for missing/failed images.
- Added local attribution notes and public-release replacement warning.
- Added tests for selected dragon asset manifest coverage, option asset references, arena rendering state asset key, and fallback behavior.
- Verified the dev server and local image asset URLs respond at `http://localhost:5173`.
- Confirmed the Dragon Select images render with a Microsoft Edge headless browser screenshot.
- Confirmed missing-image fallback coverage through unit tests and a local `404` probe for a missing dragon asset URL.
- Added `public/assets/backgrounds/arena.png` as the manifest-driven arena background.
- Reused the asset store for background image loading and kept the generated Canvas arena as fallback.
- Added tests for arena background manifest presence and fallback behavior.
- Verified tests/build pass and the dev server serves the arena background asset.
- Current active game source is the root `index.html`; all active Canvas game config, state, combat helpers, and rendering logic are inline in that single file.
- Extended the Canvas-only Dragon Select to exactly three asset-backed dragons: Ember, Tide, and Moss.
- Added centralized role/modifier config for Attack Focus, Defence Focus, and Balanced.
- Routed player Attack damage, Defence duration, and Skill cooldown through combat helper logic.
- Battle rendering uses selected dragon asset data and opposite player/enemy facing flags.
- Removed the extra root `src`, `test`, `scripts`, and `package.json` files so the active Canvas game is one single file.
- Verified the inline single-file game contains the Dragon Select, all three modifier configs, combat modifier usage, selected dragon rendering, and opposite facing flags.
- Local HTTP check was previously run at `http://127.0.0.1:5174/index.html`; in-app Browser and local Edge/Chrome binaries were unavailable for screenshot verification.
- Added a config-driven Canvas Main Menu with Play Now leading to Dragon Select.
- Added a Canvas result phase: losses/draws offer Retry Match and Back to Main Menu; wins offer only Continue before the existing upgrade flow.
- Retry restores the previous dragon, stage, and upgrades; Main Menu resets run progress, upgrades, selection, and match state.
- Ultimate now starts every new or retried battle on its normal full cooldown.
- Added focused Node tests for menu/result navigation, retry preservation, Main Menu reset, and Ultimate initialization.
- Verified 6 tests pass, inline JavaScript syntax is valid, the static page returns HTTP 200, and Main Menu/win/loss Canvas screens render correctly in headless Edge.
- Reviewed the current root `index.html`, flow tests, and Git history against `gdd.md`, `tdd.md`, and `plan.md`.
- Replaced stale one-screen/countdown/one-dragon documentation with concise descriptions of the implemented menu, three-dragon selection, four-command combat, progression, result routing, single-file architecture, and test surface.
- Re-ran the six flow tests successfully after the documentation update.
- Added a Canvas-only tutorial phase before Main Menu with Next, Skip, and Done controls.
- Added guarded tutorial completion persistence using localStorage when available.
- Updated voice recognition to use config-driven `en-US`, a 0.5s scan interval, strict one-word command validation, immediate final-result processing, cooldown feedback, and duplicate-result prevention.
- Disabled manual combat command buttons and A/D/B/U shortcuts while the mic is active; voice commands, mic, navigation, and restart remain usable.
- Expanded `tests/game-flow.test.js` to cover tutorial flow, voice config, immediate voice casting, cooldown rejection, duplicate voice suppression, mic/manual lockout, and manual controls re-enabling.
- Verified 11 Node tests pass and `git diff --check` passes.
- Centered the Canvas tutorial Skip, Next, and Done button row within the tutorial panel.
- Re-ran 11 Node tests and `git diff --check` successfully after the layout tweak.
- Set Main Menu as the first screen again, added a Main Menu Tutorial button, and lowered the tutorial header/body text.
- Updated the flow test to expect Main Menu first with tutorial opened from the menu; 11 Node tests still pass.
- Replaced the combat Restart button with a Pause button and Canvas pause menu.
- Added pause state/config, Resume, paused Retry Match, and Back to Main Menu handling.
- Pause now freezes match timer, AI, cooldowns, effects, pending projectiles, render-time animations, and Frenzy timer state.
- Voice/manual combat commands are ignored while paused; pause menu navigation remains active.
- Expanded tests to 17 cases covering pause controls, freeze behavior, command blocking, resume, retry, and Main Menu reset.
- Verified `node --test tests/game-flow.test.js`, `git diff --check`, and `http://127.0.0.1:5174/index.html` HTTP 200.
- Reassigned combat keyboard shortcuts to Q/W/E/R for Attack, Defence, Block, and Skill/Ultimate.
- Updated tutorial, HUD, and microphone fallback/error text to show Q/W/E/R.
- Removed old A/D/B/U combat key behavior and expanded tests to 19 cases covering new keys, old key rejection, mic lockout, and pause lockout.
- Verified `node --test tests/game-flow.test.js` and `git diff --check` pass.
- Removed the extra explanatory text line from the Canvas tutorial.
- Added a Back button on tutorial steps 2/4, 3/4, and 4/4.
- Removed Next from tutorial step 4/4.
- Expanded tutorial tests; 20 Node tests now pass.
- Updated tutorial step 4/4 to remove Skip, keep Back, and use a green Done button.
- Moved dragon names above their images on the Choose Your Dragon cards.
- Lowered dragon role, description, and stats text on Choose Your Dragon cards to avoid image overlap.
- Added a Canvas confirmation warning for Change Dragon on the upgrade screen; No stays on the current screen and Yes proceeds to dragon select.
- Expanded tests to 21 cases covering the Change Dragon confirmation flow.

## Next Action

Review the pause menu and tutorial screens visually in a browser, then replace temporary dragon placeholders with licensed production-safe assets.
