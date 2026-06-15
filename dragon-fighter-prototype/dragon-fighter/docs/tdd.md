# Dragon Fighter: Egg Spell Forge - Technical Design Document

## Purpose

This TDD guides implementation of the **Dragon Fighter: Egg Spell Forge** prototype from `gdd.md`. The prototype is a Canvas-only 1v1 dragon duel where the player prepares five dragon-egg spells, then casts those named spells as the main combat skills through voice or fallback buttons.

The goal is a small, testable vertical slice. Keep the code clear enough for junior developers to extend and for non-coders to tune values without searching through source files.

## Core Technical Principles

### Single Centralized Configuration

All mechanical, physical, visual, timing, input, UI, AI, and rules-based constants must live in one dedicated configuration module, recommended as `src/config.js`.

No other file may define gameplay numbers, pixel dimensions, colors, speeds, cooldowns, damage values, energy values, timer values, text labels, or AI intervals.

### Zero Magic Numbers

Game loop, combat, spell logic, AI, rendering, input, and UI files must read tunable values from config. Local numeric indexes or temporary loop counters are acceptable, but anything that changes gameplay, presentation, timing, physics, or balance belongs in config.

### Self-Documenting Config

Every config key must have a short natural-language comment explaining:

- What the value changes.
- How it affects gameplay or presentation.
- The recommended safe range for playtesting.

Example:

```js
// Damage dealt by a Light Attack spell before shields are applied. Recommended range: 8-16.
lightAttackSpellDamage: 12
```

### Canvas-Only Application

The HTML file is only a container for the Canvas and script loading. All UI elements, game characters, event feedback, buttons, overlays, HUD, drawing tools, and interactive regions must be created and rendered inside the Canvas.

Pointer, touch, keyboard, and microphone events may be attached from JavaScript, but no gameplay logic, visuals, or UI controls may live in HTML.

### Separation of Concerns

Each module should own one responsibility. Input does not change HP. Rendering does not decide rules. Combat does not draw UI. The game loop coordinates systems but does not contain match rules.

## Recommended Source Structure

```text
src/
  config.js
  main.js
  core/
    gameLoop.js
    gameState.js
    stateMachine.js
    logger.js
    random.js
  states/
    bootState.js
    preparationState.js
    countdownState.js
    matchState.js
    resultState.js
    pauseState.js
  spells/
    spellFactory.js
    patternAnalyzer.js
    spellRules.js
    spellLoadout.js
  combat/
    spellCommands.js
    casting.js
    cooldowns.js
    damageResolver.js
    matchRules.js
    effects.js
  ai/
    aiController.js
    aiLoadout.js
  input/
    voiceInput.js
    keyboardInput.js
    pointerInput.js
    inputMapper.js
  render/
    canvasRenderer.js
    preparationRenderer.js
    arenaRenderer.js
    dragonRenderer.js
    hudRenderer.js
    overlayRenderer.js
    effectsRenderer.js
  ui/
    canvasButtonSystem.js
    canvasTextInput.js
    layout.js
  assets/
    assetManifest.js
    assetLoader.js
test/
  *.test.js
```

Exact filenames may change, but the boundaries must remain clear.

## Runtime States

Use explicit states:

- **Boot:** initialize Canvas, config, assets, logging, and initial state.
- **Preparation:** create or generate five egg spells, assign names and types, preview cost/effect.
- **Countdown:** show `3`, `2`, `1`, `Fight!`; gameplay input is ignored or marked inactive.
- **Match:** process prepared spell skills, AI, cooldowns, energy, damage, timer, and win conditions.
- **Pause:** freeze timers, cooldowns, and AI if pause is included.
- **Result:** show Win, Lose, or Draw, remaining HP, remaining energy, most-used spell, and restart options.

Only the active state may process its own inputs.

## Data Model

Game state should be plain, serializable data where possible so tests can create and inspect it.

Minimum state:

- Current screen state.
- Countdown time and match time remaining.
- Player and AI HP.
- Player and AI energy.
- Player and AI five-spell loadouts.
- Spell cooldowns and active spell effects.
- Shields, slows, utility buffs, and temporary modifiers.
- Latest player spell feedback.
- Latest AI spell feedback.
- Result status and result reason.
- Most-used spell tracking.

## Input Architecture

All input systems emit normalized attempts into the same spell-casting pipeline.

Supported inputs:

- Voice: full prepared spell names.
- Keyboard: optional spell slot shortcuts.
- Pointer/touch: Canvas-rendered buttons, spell slots, drawing grid, and targeting gestures.

Input modules may detect raw events, but they must not apply damage, spend energy, start cooldowns, or choose results.

Voice recognition must accept only complete valid prepared spell names. Failed recognition spends no energy and starts the configured voice retry delay.

## Spell Preparation System

The preparation system owns egg pattern creation and spell definition.

Supported prototype modes:

- 9-Dot Grid Mode.
- Random Generation Mode for valid 9-dot patterns.
- Simple Free Draw Mode only if time allows.

Pattern analysis outputs:

- Connection count.
- Unique point count.
- Sharp angle count.
- Closed pattern flag.
- Crossed line count.
- Weight band: Light, Standard, Heavy, or Grand.
- Derived energy cost.
- Piercing rating.
- Secondary effect flag.
- Instability flag.

Spell data includes:

- Spell id.
- Spell name.
- Spell family.
- Spell type.
- Pattern data.
- Weight band.
- Energy cost.
- Cooldown remaining.
- Derived primary effect.
- Derived secondary effect.
- Misfire chance.

## Combat And Casting System

The combat layer owns spell validation, energy spending, cooldowns, active durations, effect creation, and failed-cast reasons.

A spell cast succeeds only when:

- The spell name or spell slot is valid.
- The actor is not defeated.
- The match is active.
- The actor has enough energy.
- The spell cooldown is ready.
- Voice lockout or retry delay is not active, when relevant.

Failure reasons must be clear and user-facing:

- Unknown Spell.
- Cooldown.
- Not Enough Energy.
- Voice Retry.
- Match Inactive.
- Defeated.

## Core Formulas And Rule Priority

### Energy

- Current energy increases during active match time only.
- Clamp energy between minimum and maximum energy.
- Button casting applies the button cooldown instead of the normal voice cooldown.

Formula:

```text
energy = clamp(currentEnergy + regenPerSecond * deltaSeconds, minEnergy, maxEnergy)
```

### Pattern Weight

```text
1-2 connections = Light
3-4 connections = Standard
5-6 connections = Heavy
7+ connections = Grand
```

### Spell Cost

```text
spellCost = baseCostForWeight + crossedLineCount * crossedLineEnergyPenalty
```

### Piercing

```text
0-1 sharp angles = 0% shield pierce
2-3 sharp angles = 25% shield pierce
4+ sharp angles = 50% shield pierce
```

### Damage Priority

When damage lands:

1. Spell shield absorbs damage, minus allowed piercing.
2. Remaining damage reduces HP.
3. HP is clamped at 0.

### Match Result

- Any side at 0 HP is defeated.
- If both reach 0 HP at the same time, higher remaining energy wins.
- If both reach 0 HP with equal energy, result is Draw.
- If timer reaches 0, higher HP wins.
- If timer reaches 0 with equal HP, higher energy wins.
- If timer reaches 0 with equal HP and equal energy, result is Draw.

## AI Architecture

The AI uses the same spell rules, energy rules, cooldown rules, and damage resolver as the player.

AI may own decision logic, but not separate combat rules.

AI behavior:

- Attempts an action at the configured interval while the match is active.
- Cannot act while defeated or outside Match state.
- Chooses only affordable ready spells.
- Prefers Attack spells when the opponent is vulnerable.
- May use Defense spells in response to heavy Attack spells.
- May use Support spells below the configured HP threshold.
- Uses injected or seeded randomness for testable decisions.

## Rendering Architecture

Renderers draw the whole game inside Canvas:

- Preparation screen.
- Egg drawing grid and generated patterns.
- Spell type selector, name field, pattern summary, and spell slots.
- Arena and camera framing.
- Player and AI silhouettes.
- Dragons and temporary spell effects.
- HP bars, energy cubes, cooldowns, state labels, latest feedback.
- Prepared spell buttons.
- Countdown, pause, and result overlays.

Renderers must not contain gameplay logic. They receive state and config, then draw.

## Canvas UI And Event Handling

Use a Canvas button/input system for clickable or touchable regions. The UI system owns:

- Hitboxes.
- Hover/pressed/disabled states.
- Button labels and icons.
- Spell slot regions.
- Drawing-grid point selection.
- Text-entry focus for spell names if implemented inside Canvas.

Event handlers translate pointer/touch positions into UI intents. UI intents then go through input mapping or state-specific handlers.

## Logging

Add essential logs that can be enabled or disabled from config. Logs should be readable by non-coders.

Required log points:

- App started.
- Assets loaded or failed.
- State changed.
- Pattern generated or analyzed.
- Spell created, renamed, or rejected.
- Raw voice phrase received.
- Input normalized or rejected.
- Cast failed and why.
- Spell executed.
- Energy spent or regenerated.
- Cooldown started or completed.
- Damage, shield, heal, slow, or utility effect applied.
- AI decision made.
- Match ended and result chosen.
- Restart performed.
- Tests, build, server, or deploy checks failed.

## Comments For Non-Coders

Add practical comments near important behavior that a designer may tune:

- Config sections.
- Spell weight and pattern rules.
- Damage priority.
- Energy regeneration and cooldowns.
- AI decision weights.
- Canvas UI layout regions.
- Voice spell-name mapping.
- Match result rules.

Avoid comments that simply restate obvious code.

## Testing Requirements

Write automated tests for all logic-based code. Tests must not depend on Canvas rendering, real microphone input, browser permissions, or real time.

Required test coverage:

- Spell name mapping and duplicate or similar-name rejection.
- Pattern connection counting and weight bands.
- Energy cost calculation, including crossed-line penalty.
- Sharp-angle piercing calculation.
- Closed-pattern bonus assignment.
- Unstable misfire outcome with seeded randomness.
- Voice retry delay and global voice lockout.
- Energy spend, shortage, regeneration, and clamping.
- Cooldown success and failure for spells.
- Attack spell damage.
- Defense spell shield absorption.
- Support spell healing and HP clamp.
- Control slow duration.
- Utility energy regeneration buff.
- HP clamping at 0.
- Simultaneous defeat energy tiebreaker and draw.
- Timer win, timer lose, timer energy tiebreaker, and timer draw.
- AI cannot use spells on cooldown.
- AI cannot act when defeated or outside Match state.
- Spells ignored outside active Match state.
- Restart resets match state.

Update tests for every new feature or design change. Run tests before reporting completion.

## Build, Diagnostics, And Commit Workflow

At the end of every development turn:

1. Run the test suite.
2. Run a local compile/build check.
3. Fix any failing tests or build errors before reporting success.
4. Verify the local dev server is running; start it if it is not running.
5. Note any sandbox or environment limitation that prevents running tests, build, or server locally.
6. If checks pass, create a Git commit with a clear conventional message, such as `feat: add spell casting loop`, `fix: correct shield priority`, `test: cover pattern analysis`, or `chore: centralize tuning config`.

Do not report the work as complete if the build is failing.

## Full Tunable Config List

The centralized config must include at least these sections. Each key must have its own comment in `src/config.js`.

### App And Canvas

- `canvasWidth`
- `canvasHeight`
- `targetFrameRate`
- `safeAreaPadding`
- `backgroundColor`
- `uiScale`
- `portraitArenaAspectRatio`

### State And Timing

- `countdownSeconds`
- `matchDurationSeconds`
- `pauseEnabled`
- `resultOverlayDelaySeconds`
- `restartInputDelaySeconds`

### Player And Match Stats

- `startingHp`
- `minHp`
- `startingEnergy`
- `minEnergy`
- `maxEnergy`
- `baseEnergyRegenPerSecond`
- `simultaneousDefeatUsesEnergyTiebreaker`
- `timerTieUsesEnergyTiebreaker`

### Spell Loadout

- `spellsPerLoadout`
- `defaultSpellFamilies`
- `defaultPlayerSpellNames`
- `defaultAiSpellNames`
- `spellTypes`
- `minimumSpellNameLength`
- `similarSpellNameThreshold`

### Pattern Analysis

- `gridPointCount`
- `gridRows`
- `gridColumns`
- `allowReverseDuplicateConnections`
- `lightConnectionRange`
- `standardConnectionRange`
- `heavyConnectionRange`
- `grandMinimumConnections`
- `uniquePointsForSecondaryEffect`
- `closedPatternBonusEnabled`
- `crossedLineEnergyPenalty`
- `unstableMisfireChance`
- `freeDrawEnabled`
- `mirrorDrawEnabled`
- `randomPatternMinConnections`
- `randomPatternMaxConnections`

### Spell Costs And Cooldowns

- `lightSpellEnergyCost`
- `standardSpellEnergyCost`
- `heavySpellEnergyCost`
- `grandSpellEnergyCost`
- `voiceSpellCooldownSeconds`
- `buttonSpellCooldownSeconds`
- `failedVoiceRetryDelaySeconds`
- `successfulVoiceGlobalLockoutSeconds`

### Spell Effects

- `attackSpellDamageByWeight`
- `defenseSpellShieldByWeight`
- `defenseSpellDurationSeconds`
- `supportSpellHealByWeight`
- `controlSpellSlowPercent`
- `controlSpellDurationByWeight`
- `utilityDashDistance`
- `utilityBonusEnergyRegenPerSecond`
- `utilityBonusDurationByWeight`
- `closedAttackBonusDamage`
- `closedDefenseBonusShield`
- `closedSupportBonusHeal`
- `closedControlBonusDuration`
- `closedUtilityBonusDuration`
- `secondarySupportEnergyDiscount`
- `misfireAttackDamageMultiplier`
- `misfireDefenseDurationSeconds`
- `misfireSupportHealMultiplier`
- `misfireControlDurationSeconds`
- `misfireUtilityCooldownPenaltySeconds`

### Shield And Damage Resolution

- `sharpAnglesNoPierceRange`
- `sharpAnglesLowPierceRange`
- `sharpAnglesHighPierceMinimum`
- `lowPiercePercent`
- `highPiercePercent`
- `damageRoundingMode`

### AI

- `aiActionIntervalSeconds`
- `aiSupportHpThreshold`
- `aiDefensiveReactionWindowSeconds`
- `aiAttackWeight`
- `aiAttackSpellWeight`
- `aiDefenseWeight`
- `aiSupportWeight`
- `aiControlWeight`
- `aiUtilityWeight`
- `aiRandomSeed`

### Input

- `enableVoiceInput`
- `enableKeyboardInput`
- `enablePointerButtons`
- `voiceConfidenceThreshold`
- `keyboardBindings`
- `spellSlotKeyboardBindings`
- `unknownCommandDisplaySeconds`
- `inactiveInputDisplaySeconds`
- `microphoneHoldToTalk`

### Arena Layout

- `arenaBounds`
- `cameraMode`
- `player1Position`
- `player1DragonPosition`
- `player2Position`
- `player2DragonPosition`
- `dragonScale`
- `trainerScale`
- `effectLayerDepths`
- `targetingPreviewStyle`

### Preparation UI Layout

- `eggDrawingRect`
- `gridPointRadius`
- `gridLineWidth`
- `spellTypeSelectorRect`
- `spellNameFieldRect`
- `patternSummaryRect`
- `effectPreviewRect`
- `spellSlotRects`
- `confirmLoadoutButtonRect`
- `randomPatternButtonRect`

### Match HUD Layout

- `playerPanelRect`
- `opponentPanelRect`
- `timerRect`
- `playerFeedbackRect`
- `aiFeedbackRect`
- `spellButtonRects`
- `microphoneButtonRect`
- `stateLabelOffsetY`
- `hpBarSize`
- `energyCubeSize`
- `cooldownIndicatorSize`

### Colors And Fonts

- `colorHpFull`
- `colorHpEmpty`
- `colorEnergy`
- `colorPanelBackground`
- `colorPanelBorder`
- `colorTextPrimary`
- `colorTextMuted`
- `colorTextWarning`
- `colorCooldownReady`
- `colorCooldownActive`
- `colorAttackEffect`
- `colorDefenseEffect`
- `colorSupportEffect`
- `colorControlEffect`
- `colorUtilityEffect`
- `overlayBackgroundColor`
- `uiFontFamily`
- `uiFontSizeSmall`
- `uiFontSizeMedium`
- `uiFontSizeLarge`

### Assets

- `assetManifest`
- `placeholderDragonAssetIds`
- `placeholderTrainerAssetIds`
- `effectAssetIds`
- `allowTemporaryPrivatePlaceholderAssets`

### Logging And Debug

- `enableDebugLogs`
- `enableCanvasDebugOverlay`
- `logInputEvents`
- `logSpellEvents`
- `logCombatEvents`
- `logAiEvents`
- `logStateTransitions`
- `logBuildDiagnostics`

## Acceptance Criteria

The prototype is technically acceptable when:

- All gameplay visuals and UI are rendered inside Canvas.
- HTML contains no gameplay UI, controls, or logic.
- All tunable constants live in the centralized config.
- Config keys are commented for non-coders.
- Game, spell, AI, input, UI, and render systems are decoupled.
- The player can create or generate five spells, name them, and enter combat.
- Voice, keyboard, and Canvas fallback controls feed the same normalized spell-casting path.
- Prepared spell skills follow the GDD rules.
- HP, energy, cooldowns, state labels, latest feedback, and result state are visible.
- The AI can complete a match using the same rules as the player.
- Automated tests cover all logic-based systems.
- Tests and build pass before success is reported.
- The local dev server is verified or the limitation is clearly reported.
- A conventional Git commit is made after passing checks.
