# Dragon Fighter — Prototype TDD

## Purpose

This Technical Design Document defines how to implement the **Dragon Fighter** prototype described in `gdd.md`. The goal is a small, maintainable vertical slice where all combat rules, timing, UI layout values, and playtest tuning values are centralized and easy to adjust.

This document is implementation guidance, not production architecture. Keep the prototype simple, testable, and easy for non-coders to modify.

## Required Engineering Principles

### Single Centralized Configuration

Use one dedicated configuration module, recommended as `src/config.js`, as the only place where mechanical, physical, visual, timing, and rules-based constants live.

The config must include every tunable value for:

- canvas size and safe areas
- colors and visual theme values
- match timer and countdown timing
- player and AI starting stats
- action damage, duration, and cooldowns
- AI decision timing and behavior weights
- camera framing and arena positions
- UI panel positions, sizes, labels, and spacing
- input command words and fallback key bindings
- debug and logging toggles

No game loop, physics, combat, input, AI, or rendering file may define its own gameplay constants.

### Zero Magic Numbers

Do not hardcode pixel dimensions, cooldowns, damage values, colors, animation timing, hit delays, text sizes, turn limits, or AI intervals inside implementation files. All such values must be read from `src/config.js`.

Small numeric values used only for local calculation indexes are acceptable, but anything that affects gameplay, UI, timing, visuals, or balance belongs in config.

### Self-Documenting Config

Every config key must have a natural-language comment explaining:

- what the value changes
- how it affects gameplay or presentation
- the recommended safe range for playtesting

Example comment style:

> `attackDamage`: Damage dealt by a basic Attack before Block or Defence is applied. Recommended range: 5–20.

### Separation of Concerns

Each source file should own one responsibility. Combat rules should not render UI. Input should not directly change HP. UI should not decide who wins. The main loop should coordinate systems, not contain game rules.

### Canvas-Only Game Surface

All UI elements, game characters, labels, overlays, buttons, event feedback, and visual controls must be created and rendered inside the Canvas.

The HTML page is only a container for the Canvas and script loading. It must not contain gameplay visuals, UI controls, command buttons, HUD markup, overlays, or game logic.

## Recommended Source Structure

Use a small modular structure similar to this:

```text
src/
  config.js
  main.js
  core/
    gameLoop.js
    gameState.js
    logger.js
  states/
    bootState.js
    countdownState.js
    matchState.js
    resultState.js
    pauseState.js
  combat/
    actions.js
    damageResolver.js
    cooldowns.js
    matchRules.js
  ai/
    aiController.js
  input/
    voiceInput.js
    keyboardInput.js
    pointerInput.js
    inputMapper.js
  render/
    canvasRenderer.js
    arenaRenderer.js
    dragonRenderer.js
    hudRenderer.js
    overlayRenderer.js
  ui/
    canvasButtonSystem.js
    layout.js
  assets/
    assetManifest.js
    assetLoader.js
  tests/
    combat.test.js
    cooldowns.test.js
    ai.test.js
    matchRules.test.js
    inputMapper.test.js
```

The exact names may change, but the responsibility split must remain clear.

## System Responsibilities

### Main Entry

Initializes the Canvas, loads config, starts logging, creates the initial game state, registers input systems, and starts the game loop.

It must not contain combat rules, cooldown math, rendering details, or AI decision logic.

### Game Loop

Owns frame timing and calls update/render in order. It should pass elapsed time into systems and avoid directly changing HP, cooldowns, or match results.

### Game State

Stores current match data:

- current screen state
- match timer
- countdown value
- player and AI HP
- active action states
- cooldown remaining values
- latest recognized commands
- result status

Game state should be serializable enough that tests can create and inspect it easily.

### State Machine

Use explicit states:

- Boot
- Countdown
- Match
- Pause
- Result

Only the active state should process gameplay input. For example, voice commands during Countdown or Result should be ignored or shown as inactive feedback.

### Input Layer

Input systems detect raw input and convert it into normalized command attempts.

Supported prototype inputs:

- microphone voice commands on mobile where available
- keyboard commands on desktop
- Canvas-rendered fallback buttons for testing

Input should emit normalized command names only: `Attack`, `Defence`, `Block`, or `Skill`. Input should not apply damage or cooldowns directly.

### Voice Input

Voice recognition must accept only complete valid command words. Partial words must not trigger actions.

The system must provide feedback for:

- recognized valid command
- unknown command
- unavailable microphone or permission failure
- command ignored because the match is not active

For debugging, voice input should log both the raw recognized phrase and the normalized command result.

### Combat Layer

Combat systems own all action execution, cooldown starts, active effect durations, damage resolution, and failed-action reasons.

A command succeeds only when:

- the command is valid
- the actor is not defeated
- the match is active
- the action cooldown is ready

A command fails with one clear reason:

- Unknown Command
- Cooldown
- Defeated
- Match Inactive

### Damage Resolver

Damage must always follow GDD priority:

1. Block prevents all incoming damage.
2. Defence reduces incoming damage.
3. Otherwise full damage is applied.

Block takes priority over Defence when both are active.

### Cooldown System

Cooldowns count down during active match time only. Cooldowns should pause when the game is paused or when the match has ended.

Each action has:

- cooldown duration
- active duration, where relevant
- current cooldown remaining
- current active time remaining

### AI Controller

The AI uses the same four actions as the player and follows the same cooldown rules.

The AI attempts one action at a configured interval while the match is active. The AI should prefer Attack when Skill is unavailable and may use Defence or Block in response to player Skill.

AI behavior must be deterministic enough for tests. Any randomness must be injectable or seeded in tests.

### Renderer

Rendering must draw the full game screen inside Canvas:

- arena
- camera-framed player and opponent sides
- player silhouettes
- dragons
- projectiles or action effects
- HP bars
- cooldown indicators
- state labels
- latest command text
- command reference
- Canvas fallback buttons
- countdown, pause, and result overlays

Renderers must read layout, colors, fonts, and dimensions from config or layout helpers, not local constants.

### UI and Canvas Buttons

All buttons must be Canvas-rendered interactive regions. Pointer or touch events may come from the Canvas element, but hit detection and button visuals belong to the Canvas UI system.

Fallback buttons must trigger the same normalized commands as voice and keyboard input.

### Asset Layer

Use a manifest-based asset loader. Asset references must be data-driven so placeholder dragons can be replaced without changing combat or rendering code.

Dragon Mania Legends wiki assets may be used only as temporary private prototype placeholders. They must not be treated as licensed assets for public release.

## Full Tunable Config List

The centralized config must include at least these sections and keys.

### App and Canvas

- `canvasWidth`: Width of the playable Canvas. Recommended range: 960–1920.
- `canvasHeight`: Height of the playable Canvas. Recommended range: 540–1080.
- `backgroundColor`: Main canvas background color. Use a readable dark or mid-tone value.
- `targetFrameRate`: Intended frame rate for timing and animation. Recommended range: 30–60.
- `safeAreaPadding`: Padding from screen edges for HUD elements. Recommended range: 8–48 pixels.

### Match Rules

- `matchDurationSeconds`: Length of a match. Prototype value: 60. Recommended range: 30–90.
- `countdownSeconds`: Pre-match countdown length. Prototype value: 3. Recommended range: 2–5.
- `startingHp`: Starting HP for both sides. Prototype value: 100. Recommended range: 50–200.
- `minHp`: Minimum HP clamp. Prototype value: 0.
- `drawOnSimultaneousDefeat`: Whether both sides defeated at once creates a draw. Prototype value: true.
- `timerTieIsDraw`: Whether equal HP at timer end creates a draw. Prototype value: true.

### Actions

- `attackCommandWord`: Full spoken word for Attack. Prototype value: `Attack`.
- `attackDamage`: Basic Attack damage before mitigation. Prototype value: 10. Recommended range: 5–20.
- `attackCooldownSeconds`: Cooldown after Attack. Prototype value: 2. Recommended range: 1–4.
- `attackStateDurationSeconds`: How long the Attack label/animation is shown. Recommended range: 0.3–1.2.

- `defenceCommandWord`: Full spoken word for Defence. Prototype value: `Defence`.
- `defenceDamageMultiplier`: Incoming damage multiplier while Defence is active. Prototype value: 0.5. Recommended range: 0.25–0.75.
- `defenceDurationSeconds`: Defence active time. Prototype value: 3. Recommended range: 2–5.
- `defenceCooldownSeconds`: Cooldown after Defence. Prototype value: 6. Recommended range: 4–10.

- `blockCommandWord`: Full spoken word for Block. Prototype value: `Block`.
- `blockDamageMultiplier`: Incoming damage multiplier while Block is active. Prototype value: 0.
- `blockDurationSeconds`: Block active time. Prototype value: 1. Recommended range: 0.5–2.
- `blockCooldownSeconds`: Cooldown after Block. Prototype value: 5. Recommended range: 3–8.

- `skillCommandWord`: Full spoken word for Skill. Prototype value: `Skill`.
- `skillDamage`: Skill damage before mitigation. Prototype value: 25. Recommended range: 15–40.
- `skillCooldownSeconds`: Cooldown after Skill. Prototype value: 10. Recommended range: 7–15.
- `skillStateDurationSeconds`: How long the Skill label/animation is shown. Recommended range: 0.8–2.

### AI

- `aiActionIntervalSeconds`: Time between AI action attempts. Prototype value: 2. Recommended range: 1.5–4.
- `aiSkillPreferenceHpThreshold`: Optional HP threshold where AI becomes more likely to use Skill. Recommended range: 20–80.
- `aiDefensiveReactionWindowSeconds`: Time after player Skill where AI may choose Defence or Block. Recommended range: 0.2–1.
- `aiAttackWeight`: Relative chance or priority for Attack when no special condition applies.
- `aiDefenceWeight`: Relative chance or priority for Defence.
- `aiBlockWeight`: Relative chance or priority for Block.
- `aiSkillWeight`: Relative chance or priority for Skill when available.

### Camera and Arena Layout

- `arenaBounds`: Logical arena rectangle used for layout. Recommended values should fit inside the Canvas safe area.
- `cameraMode`: Prototype value: behind-right Player 1 framing.
- `player1Position`: Screen-space anchor for Player 1 silhouette.
- `player1DragonPosition`: Screen-space anchor for Player 1 dragon.
- `player2Position`: Screen-space anchor for Player 2 silhouette.
- `player2DragonPosition`: Screen-space anchor for Player 2 dragon.
- `dragonScale`: Visual size multiplier for dragons. Recommended range: 0.5–2.
- `playerSilhouetteScale`: Visual size multiplier for trainer silhouettes. Recommended range: 0.5–1.5.

### HUD and UI Layout

- `player1PanelRect`: Position and size of Player 1 status panel.
- `player2PanelRect`: Position and size of Player 2 status panel.
- `timerRect`: Position and size of timer/countdown display.
- `commandReferenceRect`: Position and size of command reference area.
- `player1CommandRect`: Position and size of Player 1 latest command area.
- `player2CommandRect`: Position and size of Player 2 latest command area.
- `fallbackButtonRects`: Canvas button regions for Attack, Defence, Block, and Skill.
- `stateLabelOffsetY`: Vertical offset for labels above dragons.
- `hpBarWidth`: Width of HP bars. Recommended range: 120–360 pixels.
- `hpBarHeight`: Height of HP bars. Recommended range: 8–32 pixels.
- `cooldownIndicatorSize`: Size of cooldown indicators. Recommended range: 16–64 pixels.
- `uiFontFamily`: Font family used for Canvas text.
- `uiFontSizeSmall`: Small UI label size. Recommended range: 12–24.
- `uiFontSizeMedium`: Main UI label size. Recommended range: 18–36.
- `uiFontSizeLarge`: Overlay text size. Recommended range: 36–96.

### Colors and Feedback

- `colorHpFull`: HP bar filled color.
- `colorHpEmpty`: HP bar empty/background color.
- `colorCooldownReady`: Cooldown ready indicator color.
- `colorCooldownActive`: Cooldown unavailable indicator color.
- `colorPanelBackground`: HUD panel background color.
- `colorPanelBorder`: HUD panel border color.
- `colorTextPrimary`: Main readable text color.
- `colorTextWarning`: Warning or failed-command text color.
- `colorAttackEffect`: Attack feedback color.
- `colorDefenceEffect`: Defence feedback color.
- `colorBlockEffect`: Block feedback color.
- `colorSkillEffect`: Skill feedback color.
- `overlayBackgroundColor`: Full-screen overlay tint color.

### Input

- `validCommands`: List of complete command words accepted by the prototype.
- `keyboardBindings`: Desktop key bindings for Attack, Defence, Block, and Skill.
- `enableVoiceInput`: Toggle for microphone voice input.
- `enableKeyboardInput`: Toggle for desktop keyboard input.
- `enablePointerButtons`: Toggle for Canvas fallback buttons.
- `voiceConfidenceThreshold`: Minimum recognition confidence for accepting a spoken command. Recommended range: 0.5–0.95.
- `unknownCommandDisplaySeconds`: How long failed command feedback stays visible. Recommended range: 1–3.

### Logging and Debug

- `enableDebugLogs`: Toggle for console logs during development.
- `enableCanvasDebugOverlay`: Toggle for drawing debug hitboxes and layout guides.
- `logInputEvents`: Toggle for voice, keyboard, and pointer logs.
- `logCombatEvents`: Toggle for action, damage, cooldown, and defeat logs.
- `logAiEvents`: Toggle for AI decision logs.
- `logStateTransitions`: Toggle for screen state transition logs.

## Logging Requirements

Add log messages for essential debugging only. Logs should be clear enough that a non-coder can understand what happened.

Required log points:

- app started
- assets loaded or failed
- screen state changed
- match countdown started
- match started
- raw voice phrase received
- command normalized or rejected
- command failed and why
- action executed
- cooldown started or completed
- damage applied and final HP
- AI decision made
- match ended and result chosen
- tests or build checks failed during local validation

Logs must be controllable through config toggles.

## Comments for Non-Coders

Add practical comments near important behavior explaining what to modify and where to tune it. Comments should help a designer adjust values safely without reading the whole codebase.

Examples of areas that need comments:

- config sections
- action definitions
- AI decision rules
- damage priority
- cooldown handling
- Canvas UI button layout
- voice command mapping

Avoid noisy comments that restate obvious code.

## Testing Requirements

Write automated tests for all logic-based code. Tests must not depend on Canvas rendering, real microphone input, or real time passing.

Required coverage:

- valid command mapping
- unknown command rejection
- cooldown success and failure
- Attack damage
- Defence damage reduction
- Block damage prevention
- Block priority over Defence
- Skill damage
- HP clamping at 0
- simultaneous defeat draw
- timer win, timer lose, and timer draw
- AI cannot use actions on cooldown
- AI cannot act when defeated
- commands ignored outside active match state

Update tests for every new feature or design change. Run tests after every development turn.

## Build, Diagnostics, and Commit Workflow

At the end of every implementation request, the developer must:

1. Run the test suite.
2. Run a local compile/build check.
3. Fix any failing tests or build errors before reporting success.
4. Verify the local dev server is running.
5. Start the local dev server if it is not running.
6. Note any sandbox or environment limitation that prevents running the server, tests, or build locally.
7. If all checks pass, create a Git commit using a clear conventional commit message.

Commit examples:

- `feat: add voice command combat loop`
- `fix: correct block damage priority`
- `test: cover cooldown failure states`
- `chore: centralize prototype tuning config`

Do not report the work as complete if the build is failing. If the environment prevents validation, clearly say what could not be run and tell the user exactly what to run locally.

## Implementation Order Guidance

Build the prototype in layers:

1. Canvas shell, config, state machine, and static screen layout.
2. Combat command handling, cooldowns, damage, HP, and result rules.
3. AI opponent decisions and readable state labels.
4. Voice input plus keyboard and Canvas fallback inputs.
5. Polished feedback, logs, tests, and diagnostics.

Each layer should end in a playable or testable result.

## Acceptance Criteria

The prototype is technically acceptable when:

- all game visuals and UI are rendered inside Canvas
- the HTML contains no gameplay UI or logic
- all tunable constants live in the centralized config
- no gameplay, render, input, or AI file contains magic numbers
- the player can complete a 60-second match against AI
- Attack, Defence, Block, and Skill follow the GDD rules exactly
- cooldowns and state labels are visible and accurate
- voice, keyboard, and Canvas fallback inputs trigger the same command path
- failed commands show a clear reason
- tests cover all logic-based systems
- the build compiles with no errors
- the local dev server is verified or the limitation is clearly reported
- a conventional Git commit is made after passing checks
