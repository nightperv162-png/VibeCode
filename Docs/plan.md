# Dragon Fighter — Prototype Build Plan

## Reasoning for the Milestone Split

This prototype should be built around the risk of the core mechanic: a funny voice-command dragon duel. The first milestone creates the static battle stage, Canvas-only HUD, centralized configuration, and clean module boundaries so the game can run and look like the intended behind-right arena view before interaction is added. The second milestone proves the actual hook: a command attempt travels through input, validation, cooldowns, combat resolution, state labels, HP changes, and visible feedback. The third milestone wraps that proven mechanic into a complete shareable match with countdown, timer, AI pacing, win/lose/draw, diagnostics, tests, and deployment.

The final milestone is not a generic polish pass. It exists because this game's mechanic only becomes testable for casual players when a full 60-second match can start, play, end, restart, and be shared through a browser link.

---

## Milestone 1 — Canvas Arena Foundation and Config-Driven HUD

### Scope

Create the static playable foundation. The prototype should launch in the browser, render everything inside the Canvas, and show the full behind-right Player 1 arena layout described in the GDD. No real combat commands are live yet. The goal is to verify that the scene framing, HUD placement, command reference, character/dragon placeholders, state labels, and module boundaries are correct before adding gameplay logic.

This milestone must establish the TDD conventions from the beginning: one centralized config file, zero magic numbers in gameplay/render files, Canvas-only UI, separated source files, basic logging, and initial tests for config loading and state setup.

### End-User Test Checklist

- Open the prototype in the browser and see a single Canvas-based game screen.
- Confirm the HTML page contains no visible gameplay UI outside the Canvas.
- Confirm Player 1 status appears at the top left and Player 2 status appears at the top right.
- Confirm the match timer/countdown area appears at the top center.
- Confirm the arena shows Player 1 in the foreground on the right side, Player 1's dragon in front, and the AI opponent and dragon across the arena.
- Confirm both dragons have visible state labels above them, starting at `Idle`.
- Confirm the bottom left shows the latest Player 1 command area, the bottom right shows the latest AI command area, and the bottom center shows the command reference: `Attack`, `Defence`, `Block`, `Skill`.
- Resize or reload the browser and confirm the screen still looks coherent.
- Confirm the local test/build checks pass before accepting the milestone.

### Prompt for Local AI Coding Agent

```text
Implement Milestone 1 for Dragon Fighter using gdd.md and tdd.md as the source of truth.

Scope: create the Canvas-only static arena foundation and config-driven HUD. The game should launch and render the behind-right Player 1 battle view with both players, both dragons, top HUD panels, timer/countdown area, state labels, latest command areas, command reference, and placeholder Canvas fallback button regions if appropriate. Do not implement real combat yet.

Follow all TDD conventions strictly:
- Use one centralized config file for every tunable value.
- Use zero magic numbers in render, loop, input, or game-state files.
- Add natural-language comments for every config key with recommended ranges.
- Keep source files separated by responsibility.
- Render all visuals and UI inside Canvas only; HTML is only a container.
- Add essential debug logs controlled by config.
- Add tests for config loading, initial game state, state labels, and static layout data where logic is involved.

Before reporting done, run the end-user test checklist from plan.md for Milestone 1. Also run the automated tests, run the build/compile check, verify the local dev server is running or start it, and make a Git commit with a clear conventional commit message only after checks pass. If any check cannot run in the environment, say exactly what is blocked and what I should run locally.
```

---

## Milestone 2 — Command-to-Combat Loop

### Scope

Implement the core mechanic end-to-end: command input becomes a validated combat action, starts cooldown, changes dragon state, applies or prevents damage, updates HP, and displays feedback. This milestone proves the game's main idea even if the match wrapper is still minimal.

Use keyboard and Canvas fallback buttons first so the mechanic is reliable and testable. Voice input can be added here if the environment supports it, but it must feed into the same normalized command path as desktop and Canvas inputs. The player should be able to press or say `Attack`, `Defence`, `Block`, and `Skill` and immediately understand what happened.

### End-User Test Checklist

- Start the prototype and trigger `Attack`; confirm the player dragon changes state and the AI HP decreases by 10 unless protected.
- Trigger `Defence`; confirm the player dragon shows `Defence` and incoming damage is reduced by half for 3 seconds.
- Trigger `Block`; confirm the player dragon shows `Block` and incoming damage is fully prevented for 1 second.
- Trigger `Skill`; confirm the player dragon shows `Skill` and the AI HP decreases by 25 unless protected.
- Try to repeat each action during cooldown and confirm the action does not fire and the UI shows `Cooldown` or a clear cooldown failure reason.
- Confirm cooldown indicators visibly count down or change state for all four actions.
- Confirm latest Player 1 command text updates when an input is recognized.
- Confirm invalid or unavailable commands show a clear failure reason and do not change HP.
- Confirm keyboard input and Canvas fallback buttons trigger the exact same combat behavior.
- If voice input is available, say the complete command words and confirm only full valid words trigger actions.
- Confirm all logic tests and build checks pass before accepting the milestone.

### Prompt for Local AI Coding Agent

```text
Implement Milestone 2 for Dragon Fighter using gdd.md, tdd.md, and plan.md as the source of truth.

Scope: build the command-to-combat loop end-to-end. Input attempts from keyboard and Canvas buttons must normalize into the same command path. Voice input may be included if available, but must also use the same normalized path. Implement action validation, cooldowns, active Defence and Block durations, damage priority, HP updates, state labels, latest command feedback, and clear failed-command reasons.

Required action rules:
- Attack deals 10 damage and has a 2-second cooldown.
- Defence reduces incoming damage by 50% for 3 seconds and has a 6-second cooldown.
- Block prevents all incoming damage for 1 second and has a 5-second cooldown.
- Skill deals 25 damage and has a 10-second cooldown.
- Block has priority over Defence.
- Commands fail clearly when unknown, on cooldown, defeated, or match inactive.

Follow all TDD conventions strictly:
- Keep all numbers, colors, text labels, timing, and layout values in the centralized config.
- Do not add magic numbers to game loop, render, combat, input, or AI files.
- Keep combat, cooldowns, input mapping, rendering, and state transitions decoupled.
- Render every UI element inside Canvas only.
- Add essential logs for input, command normalization, action execution, cooldowns, damage, and failed commands.
- Add or update tests for command mapping, cooldown success/failure, damage resolver, Block priority, Defence reduction, Skill damage, HP clamping, and ignored commands outside active match.

Before reporting done, run the end-user test checklist from plan.md for Milestone 2. Also run the automated tests, run the build/compile check, verify the local dev server is running or start it, and make a Git commit with a clear conventional commit message only after checks pass. If any check cannot run in the environment, say exactly what is blocked and what I should run locally.
```

---

## Milestone 3 — Complete AI Match, Result Flow, and Shareable Build

### Scope

Wrap the core mechanic into a complete playable vertical slice. Add the 3-second countdown, 60-second match timer, AI action scheduling, win/lose/draw resolution, result overlay, restart flow, health/timer end conditions, and GitHub Pages deployment. The player should be able to play a full funny dragon duel from start to finish and share it with someone else.

The AI must use the same action rules as the player, attempt an action every 2 seconds while the match is active, prefer Attack when Skill is unavailable, and optionally react defensively when the player uses Skill. All match rules must be testable and all final diagnostics from the TDD must be followed before reporting completion.

### End-User Test Checklist

- Open the deployed or local browser build and see the match screen.
- Confirm the match begins with a visible `3`, `2`, `1`, `Fight!` countdown.
- Confirm player commands are ignored or clearly marked inactive during countdown.
- Play a full match against the AI for up to 60 seconds.
- Confirm the AI uses visible actions and follows cooldowns.
- Confirm the AI cannot act after being defeated.
- Confirm the match ends immediately when either side reaches 0 HP.
- Confirm the result overlay shows `Win`, `Lose`, or `Draw` according to the GDD rules.
- Let the timer reach 0 and confirm higher HP wins, equal HP draws.
- Confirm the restart option resets HP, cooldowns, labels, timer, latest command text, and result state.
- Confirm the local dev server runs before final handoff, or note the exact environment limitation.
- Confirm the project builds cleanly, tests pass, and the GitHub Pages deployment is available or deployment instructions are clearly reported.

### Prompt for Local AI Coding Agent

```text
Implement Milestone 3 for Dragon Fighter using gdd.md, tdd.md, and plan.md as the source of truth.

Scope: complete the playable vertical slice. Add the 3-second countdown, 60-second match timer, active match state, pause/result overlays if already supported, AI action scheduling, full win/lose/draw rules, restart flow, final diagnostics, and GitHub Pages deployment setup. The player must be able to play a complete 1v1 dragon duel against AI from countdown to result screen.

Required match and AI rules:
- Each match lasts 60 seconds.
- Both sides start with 100 HP and HP cannot go below 0.
- Defeat occurs at 0 HP.
- Simultaneous defeat is Draw.
- If time expires, higher HP wins; equal HP is Draw.
- AI uses the same four actions and cooldown rules as the player.
- AI attempts one action every 2 seconds while active.
- AI prefers Attack when Skill is unavailable.
- AI may use Defence or Block in response to player Skill.
- AI cannot act after defeat or outside active match state.

Follow all TDD conventions strictly:
- Keep all gameplay, timing, AI, layout, color, and deployment-related tunables in the centralized config where applicable.
- Maintain zero magic numbers.
- Keep AI, match rules, result flow, rendering, input, and diagnostics decoupled.
- Render all UI, overlays, buttons, labels, characters, and feedback inside Canvas only.
- Add essential logs for countdown, state transitions, AI decisions, match timer, result selection, restart, tests/build diagnostics, and deploy steps.
- Add or update tests for AI cooldown legality, defeated AI behavior, countdown/match/result state behavior, timer win/loss/draw, simultaneous defeat, restart reset, and commands ignored outside active match.

Before reporting done, run the end-user test checklist from plan.md for Milestone 3. Also run the automated tests, run the build/compile check, verify the local dev server is running or start it, and make a Git commit with a clear conventional commit message only after checks pass. If deploying is blocked by the environment, explain exactly what is blocked and what I should run locally to deploy to GitHub Pages.
```
