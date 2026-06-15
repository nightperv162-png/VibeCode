# Dragon Fighter: Egg Spell Forge - Build Plan

## Milestone Strategy

The game's core mechanic is **prepared spell casting** — each of five spells has an energy cost, cooldown, and combat effect (damage, shield, heal, control, utility). Victory comes from choosing spells well, not aiming or steering. This means the build milestones should isolate and prove the spell system in stages.

**Milestone 1 (Combat Foundation)** builds all the stateless, testable pieces: spell validation, energy spending and regen, cooldown tracking, damage/shield resolution, and the state machine. Nothing is live yet, but all formulas, rules, and code boundaries are in place and proven by tests.

**Milestone 2 (Player Spell Combat)** makes the core mechanic live and playable: the player casts prepared spells via voice recognition (full spell name) or Canvas spell buttons (keyboard shortcut or pointer click). Each cast validates, spends energy, starts cooldown, applies effect (damage/shield/heal/slow/utility), and updates the screen. The AI is a dummy that does not cast back — this milestone proves the spell casting fantasy works.

**Milestone 3 (AI & Match Completion)** adds the opposing dragon: AI makes spell decisions using the same rules, casts with energy and cooldown, and takes/deals damage. The full match loop runs: countdown → active combat → result determination → restart flow. The game is complete and shareable.

---

## Milestone 1: Combat Foundation

### Scope

Set up the spell casting pipeline, energy system, cooldown system, damage/shield/heal resolver, and state machine. All formulas are centralized in config, all logic is testable via Node tests without Canvas or real time, and combat code is fully separated from render code. The match preview screen exists and displays the current match state (HP, energy, cooldowns, latest feedback), but cast inputs are not yet wired to combat effects.

### End-User Test Checklist

- [ ] App loads and opens to the preparation screen (existing).
- [ ] After confirming a loadout, the match preview displays both dragons, HP bars, energy bars, cooldown chips for all five spell slots, a timer, and placeholder latest-feedback labels.
- [ ] HP, energy, cooldowns, and feedback labels update when the developer runs the test suite or manual sim (not from user input yet).
- [ ] Run `npm test` and verify all new tests pass: spell cost calc, pattern weight → cost, energy regen and clamp, cooldown ready/not-ready, damage → HP with clamp, shield + piercing, heal with clamp.
- [ ] The browser console shows structured logs at state boot, state transition, and test simulation steps (per tdd.md logging requirements).
- [ ] The build completes without errors or missing config keys. Dev server runs and the page does not show asset warnings or hardcoded pixel/color values in the source.

### AI Coding Agent Prompt

```
You are implementing Milestone 1: Combat Foundation for Dragon Fighter: Egg Spell Forge.

Read tdd.md and gdd.md first. Your goal is to build the stateless, testable spell casting foundation with no live input wiring yet.

Required work:
1. **Spell Casting Pipeline Structure**: Create src/combat/casting.js with a spell-casting validation function that checks actor exists, match is active, spell exists in loadout, actor has enough energy, and spell cooldown is ready. Return success or named failure reason (e.g., "not enough energy", "cooldown active"). Do not apply effects yet.

2. **Energy System**: In src/combat/... (or a new module), implement energy regen per frame (config.match.energyRegenPerSecond * deltaSeconds) and clamp to [minEnergy, maxEnergy]. Write Node tests.

3. **Cooldown System**: Create or extend src/combat/cooldowns.js. Implement cooldown start (set remaining = cooldownSeconds), tick down per frame (remaining -= deltaSeconds), and ready check (remaining <= 0). Write Node tests for tick behavior and ready state.

4. **Damage/Shield/Heal Resolver**: In src/combat/damageResolver.js, implement damage priority: incoming → shield with piercing → HP → clamp. Implement heal clamp at maxHp. Write Node tests for all cases (no shield, shield blocks, pierce bypasses, simultaneous shield+damage, heal to cap).

5. **Match State Machine**: In src/core/stateMachine.js (if it does not exist), or extend src/states/matchState.js, add guards and transitions for countdown → active → result. The state must track current phase, time remaining, both actors' HP/energy/cooldowns, latest feedback per side, and match result (none, win, lose, draw).

6. **Config Additions**: In src/config.js, add all missing spell combat keys from tdd.md Tunable Config Inventory: casting cooldowns (voice and button), energy system, cooldown defaults, damage/shield/pierce thresholds, and all spell effect values (attack damage, shield, heal, slow, utility durations by weight). Every key must have a comment with purpose and recommended range. No magic numbers in code.

7. **Layout**: Update src/ui/layout.js to return hitboxes and layout regions for the match preview screen (HP bars, energy bars, cooldown chips, latest feedback zones, spell buttons). Do not hardcode pixels; pull all dimensions from config.

8. **Renderer Updates**: Update src/render/renderer.js to draw the current match state: both dragons, both HP bars (value and max), both energy bars, cooldown chips (ready = green/bright, cooldown = gray/dim), latest feedback labels, a timer, and a "Preparing..." state label. Render must not decide outcomes; it only reads state and config and draws.

9. **State Setup**: Update src/core/gameState.js to create a match state with both actors initialized to startingHp and startingEnergy, all five spells with cooldown = 0 (ready), and feedback = empty. Implement a reset function for restart flow.

10. **Logging**: Add config-gated console logs at: state initialization, state transition, spell cost calc (success path only), energy regen tick (sample every 30 frames to avoid spam), cooldown ready check, damage/shield resolution, HP change, and result determination. Follow tdd.md format.

11. **Tests**: Write Node tests in test/combat.test.js and test/spell-prep.test.js covering:
    - Energy: regen math, clamp to min/max, zero delta.
    - Cooldown: tick down, ready state, multiple spells.
    - Damage: shield blocks, pierce bypasses shield, heal with cap, HP clamp at min.
    - Spell cost: weight → base cost, crossed lines → penalty, total.
    - Pattern weight → spell weight band.
    - State machine transitions (countdown → active, active → result).
    - Config shape (no undefined keys, all combat keys present and commented).

12. **Build and Diagnostics**: Run `npm test`, verify all tests pass. Run `npm run build`. Start the dev server. Load the page, confirm the match preview displays without errors, check console for structured logs. Commit with message: `feat: combat foundation with energy, cooldown, and damage resolver`.

IMPORTANT: Run this checklist BEFORE reporting done:
- [ ] Tests pass: `npm test`
- [ ] Build passes: `npm run build`
- [ ] Dev server is running
- [ ] Match preview screen displays state without cast input
- [ ] Console logs show structured diagnostics
- [ ] All config keys are present and commented
```

---

## Milestone 2: Player Spell Combat

### Scope

Wire prepared spell casting to combat effects. The player casts spells via voice recognition (full spell name) or Canvas spell buttons (keyboard shortcut or pointer click). Each cast validates, spends energy, starts cooldown, applies effect (damage/shield/heal/slow/utility), and updates the screen. The AI is a stationary dummy — it takes damage and loses shields but does not cast back. Dragons display hit effects, dragons bob and shake on damage, latest feedback shows the cast result, and cooldowns visually tick down. The match timer counts down and ends when a side reaches 0 HP or time expires. This is the first fully playable milestone.

### End-User Test Checklist

- [ ] After confirming a loadout, clicking a spell button in the match preview casts that spell (if it is ready and has enough energy).
- [ ] Successful spell cast: damage/shield/heal effect applies to the target, HP or shield updates, cooldown chip grays out and counts down, player energy drops by spell cost, latest feedback shows the spell name and effect (e.g., "Inferno Blast hit for 15 damage").
- [ ] Failed spell cast: button click or voice phrase is rejected (e.g., "not enough energy"), no effect applies, cooldown does not start, energy does not drop, latest feedback shows the reason in red/warning color, and the cast is logged as a failure.
- [ ] Energy regenerates visibly every frame. Energy bar fills slowly during no-cast periods. Energy is clamped at max.
- [ ] Cooldown chips update every frame: "Ready" label or bright green when cooldown ≤ 0, gray with countdown timer when cooldown > 0.
- [ ] When the player casts an Attack spell, the AI's HP decreases. When the player casts a Defense spell, a shield appears on the player's dragon and absorbs incoming damage. When the player casts Support, the player's HP increases (clamped at max). Control and Utility spells change AI behavior or apply timers (visible in latest feedback).
- [ ] Dragons display hit feedback: shake on damage, bob on heal, glow/flash on shield gain.
- [ ] Match timer counts down from config.match.durationSeconds. When timer reaches 0, the match ends and shows a result (Win if AI HP ≤ 0, Draw if both HP ≤ 0 or time expires with both alive).
- [ ] Voice casting: say the full spell name (e.g., "Inferno Blast"). If recognized and valid, the spell casts. If not recognized or invalid (e.g., spell is on cooldown), latest feedback shows the reason. Microphone status label updates (Listening / Ready / Error).
- [ ] Spell button casting with keyboard: pressing a configured key (e.g., 1–5) casts the corresponding spell slot.
- [ ] Run `npm test` and verify all player casting tests pass: cast validation for voice/button, energy cost deduction, cooldown start, effect application, energy clamp, cooldown clamp, game-end conditions.
- [ ] Browser console shows a structured log for every cast attempt (success or failure with reason).
- [ ] The build completes. Dev server runs. The page does not show broken images, missing fonts, hardcoded colors, or validation errors. GitHub Pages build succeeds if run locally.

### AI Coding Agent Prompt

```
You are implementing Milestone 2: Player Spell Combat for Dragon Fighter: Egg Spell Forge.

Read tdd.md and gdd.md. Your goal is to make the player's prepared spells cast and affect the match, with the AI as a stationary dummy.

Required work:

1. **Input Mapping for Spells**: Update src/input/inputController.js to emit spell-cast intents instead of legacy action commands. For voice: emit { type: 'voice-spell', spellName: '...' }. For button clicks: map to spell slot index and emit { type: 'button-spell', slotIndex: 0 }. For keyboard: map keys 1–5 to slots and emit { type: 'keyboard-spell', slotIndex: 0 }. Do not apply any effects in the input module.

2. **Spell Casting Pipeline (Active)**: Create or extend src/combat/casting.js. Implement a function castSpell(actor, spell, matchState, config) that:
   - Validates: actor exists, match is active, spell exists, actor has energy, cooldown ready, not voice-locked.
   - Deducts energy cost.
   - Starts cooldown (set remaining = spell-specific cooldown duration from config).
   - Calls the effect resolver (see #3).
   - Returns { success, feedbackMessage } for logging and display.
   - On failure, returns { success: false, reason: 'not enough energy' } (or other reason).

3. **Effect Application**: Create or extend src/combat/damageResolver.js to apply spell effects:
   - Attack: deal damage to target HP, respecting shield + piercing (reuse existing shield logic).
   - Defense: add shield value to actor, visible until pierced or timeout (add shield-duration config key).
   - Support: heal actor HP, clamped at maxHp.
   - Control: apply slow flag to target (e.g., targets' next spell cooldown is 1.5x). Store slow duration in match state.
   - Utility: apply bonus energy regen to actor (e.g., +2 energy per second) for duration seconds. Store in match state.
   - All effects read cost and duration from config spell effect tables (spellEffects.attackDamageByWeight, etc.).
   - Return { damage, shield, heal, slowDuration, utilityDuration, feedbackMessage }.

4. **Match State Tracking**: Extend src/core/gameState.js to store:
   - Each actor's current shield value and shield expiry time.
   - Each actor's active slow duration and slow expiry time.
   - Each actor's active utility (bonus regen) duration and expiry time.
   - Latest feedback per side (spell name, effect, timestamp).
   - Match timer and phase (countdown, active, result).

5. **Spell Cost Config for Voice vs. Button**: In src/config.js, add:
   - `spellCasting.voiceCooldownMultiplier` (e.g., 1.0x normal cooldown for voice).
   - `spellCasting.buttonCooldownMultiplier` (e.g., 1.5x normal cooldown for button, to encourage voice).
   - `spellCasting.voiceRetryDelaySeconds` (e.g., 0.5 seconds before retry on failed voice).
   - `spellCasting.voiceGlobalLockoutSeconds` (e.g., 0.1 seconds after success before next voice cast).

6. **Match Loop Integration**: Update src/core/gameLoop.js to:
   - Each frame: tick energy regen, tick cooldowns, tick slow durations, tick utility durations, tick shield expiry.
   - Check for cast input from inputController.
   - Call castSpell() and apply effects.
   - Check match end condition: any actor HP ≤ minHp, or timer ≤ 0.
   - Update match state with latest feedback and results.

7. **Renderer Enhancements**: Update src/render/renderer.js to:
   - Draw player and AI dragons with shields visible (glow/aura around dragon when active).
   - Draw slow effect indicator on AI dragon (e.g., "Slowed" label or visual frost).
   - Draw utility effect indicator on player dragon (e.g., "Bonus Regen" label or glow).
   - Animate dragons on hit: shake (duration from config.animation.shakeSeconds, pixel amount from config.animation.shakePixels).
   - Animate dragons on heal: bob up/down (duration from config.animation.dragonBobSeconds, pixel amount from config.animation.dragonBobPixels).
   - Draw cooldown chip text: "Ready" when cooldown ≤ 0, otherwise "Cooldown: X.Xs".
   - Draw latest feedback in large text, color-coded: green for player success, red for player failure, gray for AI.
   - Animate feedback text rising and fading (duration from config.animation.hitTextSeconds, rise pixels from config.animation.hitTextRise).

8. **Voice Casting**: Update src/input/inputController.js voice handler to:
   - Capture the full transcribed spell name from speech recognition.
   - Emit { type: 'voice-spell', spellName: '...' }.
   - On success, show "Listening..." → "Ready" status.
   - On failure, show "Not ready" or "Spell not found" status.
   - Implement voice retry delay and global lockout as per config.

9. **AI as Dummy**: The AI does nothing. It only takes damage, loses shields, loses HP, and is defeated when HP ≤ 0. AI does not cast spells in this milestone.

10. **Result State**: When match ends (HP ≤ 0 or timer ≤ 0):
    - Determine result: Win (player HP > 0 and AI HP ≤ 0), Lose (player HP ≤ 0 and AI HP > 0), Draw (both ≤ 0 or timer expired with both alive).
    - Display result overlay with label and "Restart" button (keyboard: R, button: click).
    - Implement restart: return to preparation state, reset gameState, reset input timers.

11. **Logging**: Add logs for:
    - Cast attempt: { actor, spell, reason if failed, energy before/after, cooldown before/after }.
    - Effect applied: { type, target, value (damage/shield/heal), actor remaining HP/shield/energy }.
    - Shield expiry and effect expiry.
    - Match result and HP/energy final state.

12. **Tests**: Write tests in test/combat.test.js and test/match-ai.test.js covering:
    - Player cast success (spell exists, energy spent, cooldown set, effect applied).
    - Player cast failure (not enough energy, cooldown active, unknown spell, voice retry delay).
    - Energy regen tick and clamp.
    - Shield gain, shield expiry, pierce bypass.
    - Slow application and slow expiry (next spell cooldown extended).
    - Utility (bonus regen) gain and expiry.
    - HP clamp at minHp, defeat detection.
    - Match end conditions (HP ≤ 0, timer ≤ 0, tiebreaker).
    - Result determination (Win, Lose, Draw).

13. **Build and Diagnostics**: Run `npm test`, verify all tests pass. Run `npm run build`. Start dev server. Load the page in browser, confirm loadout confirms to match preview. Cast a spell: click button or say spell name. Verify effect applies, HP/energy/cooldown update, feedback displays, dragon animates. Verify timer counts down. Verify result screen on defeat. Check console for structured logs. Commit with message: `feat: player spell casting with effects and match loop`.

IMPORTANT: Run this checklist BEFORE reporting done:
- [ ] Tests pass: `npm test`
- [ ] Build passes: `npm run build`
- [ ] Dev server is running
- [ ] Player can cast spells via button click, keyboard key, or voice
- [ ] Effects apply: damage, shield, heal, slow, utility
- [ ] HP, energy, cooldowns update live
- [ ] Dragons animate on hit/heal
- [ ] Match timer counts down and ends
- [ ] Result screen displays on defeat
- [ ] Console shows structured logs for all casts
- [ ] All config keys are present and commented
```

---

## Milestone 3: AI Combat & Full Match Completion

### Scope

Implement AI spell decisions using the same spell, energy, cooldown, and damage rules as the player. The AI casts spells at intervals, choosing based on weighted type preferences (e.g., favor healing when low HP, favor defense when player is attacking, favor attack otherwise). Both dragons are now active combatants. The match countdown transitions to active after config.match.countdownSeconds. The result screen shows Win/Lose/Draw and waits for a restart button or key. Restart returns to the preparation state and allows the player to edit the loadout or re-randomize. The game is complete and can be built and deployed to GitHub Pages.

### End-User Test Checklist

- [ ] After confirming a loadout, the match preview shows a countdown overlay (e.g., "3... 2... 1... Fight!") and a timer. Both dragons are visible and inactive during countdown.
- [ ] When countdown ends, the match becomes active. Both dragons are now fighting. Player can cast spells; AI casts spells automatically.
- [ ] AI casts are logged and displayed: AI latest feedback shows spell name and effect (e.g., "Frostbolt slowed you for 5 seconds").
- [ ] AI respects energy: does not cast when energy is insufficient. AI casts less frequently when energy is low.
- [ ] AI respects cooldown: does not cast a spell that is on cooldown. Visible cooldown chip update on AI spell slots.
- [ ] AI casting priority (configurable): when AI HP is below 30%, favor Defense spells. When player HP is high and AI HP is mid-range, favor Attack spells. When AI has energy surplus, consider Utility spells. When combat is neutral, cycle through spell types.
- [ ] Both dragons take damage, lose shields, lose HP, and are defeated when HP ≤ 0.
- [ ] When one side is defeated (HP ≤ 0), the match ends immediately. Timer stops. Result screen displays.
- [ ] Result screen shows: "You Win!" if player HP > 0 and AI HP ≤ 0. "You Lose!" if player HP ≤ 0 and AI HP > 0. "Draw!" if both ≤ 0 or timer expired with both alive.
- [ ] Result screen has a "Restart" button (label from config) and keyboard shortcut (R).
- [ ] Clicking "Restart" or pressing R returns to the preparation state. Player can edit the loadout or randomize a new one and re-confirm.
- [ ] Run `npm test` and verify all AI and match tests pass: AI spell selection, AI energy management, AI cooldown tracking, defeat detection, tiebreaker rules, restart state reset.
- [ ] Browser console shows structured logs for AI decisions (spell chosen, reason, energy before/after, cooldown set), match result, and restart.
- [ ] `npm run build` produces a dist/ folder. Running `npm run pages` (or equivalent) builds and copies to docs/ for GitHub Pages deployment. The built page loads and plays without errors.
- [ ] The page is responsive and works on desktop and tablet (500px–1200px canvas width).

### AI Coding Agent Prompt

```
You are implementing Milestone 3: AI Combat & Full Match Completion for Dragon Fighter: Egg Spell Forge.

Read tdd.md and gdd.md. Your goal is to add AI spell casting, complete the match state machine, implement result determination, and finalize the game loop.

Required work:

1. **AI Spell Decision Making**: Create src/ai/aiController.js. Implement a function chooseSpell(aiActor, matchState, config) that:
   - Returns the index of a spell in the AI's prepared loadout.
   - Uses weighted spell-type preferences based on match state:
     * If AI HP < config.ai.lowHpThreshold (e.g., 25% max), weight Defense spells 3x, Support spells 2x.
     * If player HP > config.ai.highPlayerHpThreshold (e.g., 70% max), weight Attack spells 2x.
     * If AI energy > maxEnergy * 0.8, weight Utility spells 1.5x.
     * Otherwise, cycle through spell types equally.
   - Filter out spells that are on cooldown or do not have enough energy.
   - Randomize among valid spells using seeded random (for replay/testing).
   - Return the chosen index or null if no valid spell.
   - Log the decision: { chosen_spell, reason, ai_hp, player_hp, ai_energy, cooldown_state }.

2. **AI Casting Loop**: Update src/core/gameLoop.js to:
   - Tick a per-actor AI decision timer (config.ai.spellIntervalSeconds).
   - Each interval, call aiController.chooseSpell() and then castSpell(ai, spell, ...).
   - Apply the same energy, cooldown, and effect rules as player casting.
   - Update AI latest feedback with spell name and effect.

3. **Match Countdown State**: Extend src/states/matchState.js to:
   - Start in "countdown" phase when match state is entered.
   - Tick down countdownTimer by deltaSeconds.
   - When countdownTimer ≤ 0, transition to "active" phase.
   - During countdown, render a countdown overlay (e.g., "3... 2... 1... Fight!") and mute all cast input.
   - Add countdown overlay to renderer and layout.

4. **Result Determination**: In src/combat/matchRules.js (or extend damageResolver.js), implement:
   - Check defeat conditions every frame after active phase starts.
   - Defeat = any actor HP ≤ config.match.minHp.
   - If both reach minHp simultaneously, use tiebreaker: compare energy (higher energy wins), then it's a draw.
   - If timer ≤ 0 and both alive, it's a draw.
   - If timer ≤ 0 and one is defeated, use HP to determine winner.
   - Return result = { outcome: 'win' | 'lose' | 'draw', playerHp, aiHp, playerEnergy, aiEnergy, matchDurationSeconds }.

5. **Result Screen State**: Create or extend src/states/resultState.js to:
   - Display result overlay: large title ("You Win!", "You Lose!", "Draw!"), both actors' final HP, a "Restart" button.
   - Implement restart input handler: listen for R key or button click.
   - On restart, call gameState.reset(), transition to preparation state, clear all feedback and timers.

6. **AI Config Additions**: In src/config.js, add:
   - `ai.spellIntervalSeconds` (e.g., 2.0, time between AI decisions).
   - `ai.lowHpThreshold` (e.g., 0.25, fraction of max HP).
   - `ai.highPlayerHpThreshold` (e.g., 0.70, fraction of max HP).
   - `ai.defensePriorityWeight` (e.g., 3.0, multiplier when AI is low HP).
   - `ai.supportPriorityWeight` (e.g., 2.0).
   - `ai.attackPriorityWeight` (e.g., 2.0, multiplier when player HP is high).
   - `ai.utilityPriorityWeight` (e.g., 1.5).
   - `ai.defaultSeed` (e.g., 12345, for reproducible AI).
   - `ai.defaultNames` (AI dragon name for display).

7. **Layout and Renderer**: Update src/ui/layout.js and src/render/renderer.js to:
   - Add countdown overlay layout (centered message, large timer font).
   - Add result overlay layout (centered title, both actors' final state, button).
   - Draw countdown message and timer during countdown phase.
   - Draw result message and button during result phase.
   - Draw AI spell buttons / cooldown chips (visible, read-only).
   - Draw AI spell slot labels (AI's fifth prepared spell, AI's fourth prepared spell, etc.).

8. **State Machine**: Ensure src/core/stateMachine.js supports transitions:
   - preparation → match-preview (on loadout confirm).
   - match-preview → countdown (on match start or via auto-transition if no user input delay).
   - countdown → active (when countdownTimer expires).
   - active → result (when defeat or timer expires).
   - result → preparation (on restart input).

9. **Full Config Completion**: Verify src/config.js has:
   - All spell cost and effect values (attack damage, shield, heal, slow, utility by weight).
   - All match timing values (duration, countdown, result delay).
   - All AI decision thresholds and weights.
   - All layout and render values (no hardcoded pixels, colors, fonts in code).
   - All text strings (player name, AI name, button labels, feedback templates).

10. **Logging**: Add logs for:
    - Countdown phase and timer.
    - Active phase start and AI decision intervals.
    - Each AI spell choice: { spell_name, reason, ai_energy, cooldown_state }.
    - Defeat detection: { actor, hp_remaining, reason }.
    - Result determination: { outcome, player_hp, ai_hp, tiebreaker_if_applied }.
    - Restart and state reset.

11. **Tests**: Write comprehensive tests in test/match-ai.test.js covering:
    - AI spell selection: low HP prefers Defense, high player HP prefers Attack, valid only if energy and cooldown allow.
    - AI casting: energy spent, cooldown set, effect applied same as player.
    - Countdown logic: timer ticks down, transitions to active at ≤ 0.
    - Defeat detection: HP ≤ minHp ends match.
    - Result determination: all tiebreaker cases (simultaneous defeat, timer expiry, single defeat).
    - Restart reset: state clears, returns to preparation.
    - Full match simulation: countdown → active → both sides cast → result.

12. **Build and GitHub Pages**: Add to package.json or scripts/:
    - `build` script: compiles src/ to dist/ with all config constants.
    - `pages` script: copies dist/ to docs/ for GitHub Pages (or builds directly to docs/).
    - Verify `npm run build` produces no errors.
    - Verify `npm run pages` builds for deployment.
    - Test dist/index.html and docs/index.html locally in browser: confirm gameplay works, logs are clean, no errors.

13. **Final Checks**:
    - Canvas is responsive: works at 500px and 1200px width without layout breaks.
    - All buttons and regions are clickable and logged.
    - Microphone is optional: fallback to keyboard/button input is always available.
    - No external dependencies on images, fonts, or network assets (self-contained Canvas only).
    - All config keys are present and commented.
    - Console logs are structured and follow tdd.md format.

14. **Commit**: `feat: AI casting, match countdown, result determination, and restart flow`

IMPORTANT: Run this checklist BEFORE reporting done:
- [ ] Tests pass: `npm test`
- [ ] Build passes: `npm run build`
- [ ] Dev server is running
- [ ] Full match plays end-to-end: countdown → active → result
- [ ] AI casts spells and makes decisions
- [ ] Both dragons take damage and can be defeated
- [ ] Result screen displays correctly
- [ ] Restart returns to preparation
- [ ] Console shows structured logs for all AI decisions, defeats, results
- [ ] `npm run pages` builds for GitHub Pages
- [ ] Page is responsive and works at multiple canvas sizes
- [ ] All config keys are present and commented
```

---

## Reasoning Summary

**Why this split?**

The core design is **prepared spell casting**. Each spell costs energy, goes on cooldown, and has an effect. The game's fun comes from choosing spells well in real-time combat.

**Milestone 1 (Foundation)** decouples all the rules and formulas from rendering and real time. Energy ticks, cooldowns track, damage resolves, and shields block — all testable in Node without Canvas or input. The match preview exists, but input is not yet wired. This milestone proves the game's math is sound and the code boundaries are clean.

**Milestone 2 (Player Combat)** wires player input to live casting. Voice and buttons now trigger spells; effects apply instantly; dragons animate; cooldowns visually tick; the first match ends when a side loses all HP. The AI is a dummy, so there is no competing decision-making — the milestone focuses purely on proving that spell casting is satisfying and readable. This is the first moment you can *play* the game.

**Milestone 3 (AI & Finish)** adds the opposing dragon. AI makes spell choices using weighted priorities (defend when low, attack when safe, heal when surplus). Both sides cast, both can be defeated. The match loops: countdown → active combat → result. Restart flows back to preparation. The game is complete, testable, and shareable on GitHub Pages.

Each milestone:
- Builds on the previous one without rework.
- Ends in a testable, playable state (M1 = math proven; M2 = single-sided combat works; M3 = full game).
- Is driven by the game's actual mechanics, not a generic template.
- Includes clear end-user checks so you know when it is done.
