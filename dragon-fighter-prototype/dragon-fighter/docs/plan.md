# Dragon Fighter: Egg Spell Forge - Build Plan

## Reasoning for the Milestone Split

This game has two linked mechanics, so the build plan should not jump straight from "static arena" to "full match." The player first creates five dragon-egg spells, and then those named spells become the main combat verbs. That means the plan needs a playable preparation layer before the combat layer can be proven.

Milestone 1 builds the technical and visual shell: Canvas-only app, centralized config, state machine, preparation screen layout, arena layout, HUD placeholders, and clean module boundaries. It should run and look like the game, but the important interactions are not live yet.

Milestone 2 proves the spellcraft half of the design. The player can create or generate five egg patterns, assign spell types and names, see cost/effect previews, and confirm a loadout. This ends in a testable preparation flow, which is meaningful because spell identity is one of the game's design pillars.

Milestone 3 proves the core fun loop: a named spell skill travels through input, validation, cooldowns, energy, damage/effects, state labels, and visible feedback. This is the milestone where the game becomes playable as a duel prototype, even before the full match wrapper is complete.

Milestone 4 wraps the proven systems into a complete shareable match: countdown, timer, AI loadout and decisions, win/lose/draw, restart, diagnostics, tests, commit workflow, and GitHub Pages deployment. This is not a polish pass; it delivers the first end-to-end playable vertical slice.

---

## Milestone 1 - Canvas Shell, States, And Static Game Layout

### Scope

Create the static foundation for the prototype. The app should launch in the browser with a Canvas-only game surface, centralized config, explicit runtime states, logging hooks, and separate modules for state, input, UI, rendering, spells, combat, and AI. The preparation screen and match screen should both be visually laid out with placeholders: 9-dot egg drawing area, spell slots, type/name controls, arena, dragons, HP/energy HUD, spell cooldown placeholders, latest feedback, spell reference, and overlay regions. No real spell creation or combat resolution is required yet.

### End-User Test Checklist

- Open the prototype and confirm all visible game UI is inside a single Canvas.
- Confirm there is a preparation screen with an egg drawing area, 9-dot grid placeholder, spell type area, spell name area, pattern summary, effect preview, five spell slots, random pattern button, and confirm loadout button.
- Confirm there is a match screen layout with both dragons, both player panels, HP bars, energy cubes, timer area, state labels, latest feedback areas, prepared spell buttons, and microphone state.
- Confirm switching or previewing screens does not show broken layout or missing Canvas regions.
- Confirm the HTML contains no gameplay controls, HUD, overlays, or game logic.
- Confirm the layout still reads clearly after reload and common browser resizing.
- Confirm the app has no visible runtime errors.
- Run the automated tests and build check before accepting the milestone.

### Prompt for Local AI Coding Agent

```text
Implement Milestone 1 for Dragon Fighter: Egg Spell Forge using dist/docs/gdd.md, dist/docs/tdd.md, and dist/docs/plan.md as the source of truth.

Scope: build the Canvas-only technical shell and static layout. Create or update the source structure around config, main entry, game loop, state machine, game state, logging, input shells, spell shells, combat shells, AI shell, Canvas UI, and renderers. Render placeholder Preparation and Match screens inside Canvas: egg drawing area, 9-dot grid, random pattern button, spell type/name areas, pattern summary, effect preview, five spell slots, confirm button, arena, dragons, HP/energy HUD, spell cooldown placeholders, latest feedback, prepared spell buttons, spell reference, microphone state, and overlay regions.

Follow the TDD strictly:
- Put every tunable value in the single centralized config file.
- Add natural-language comments to every config key with recommended ranges.
- Do not hardcode pixel dimensions, colors, labels, timing, or balance values outside config.
- Keep modules decoupled by responsibility.
- Keep HTML as a pure Canvas/script container.
- Add useful logs controlled by config.
- Add tests for config shape, initial game state, state transitions, and layout data where logic is involved.

Before reporting done, run the Milestone 1 end-user test checklist from plan.md. Also run the automated tests, run the build/compile check, verify the local dev server is running or start it, and create a Git commit with a clear conventional commit message only after checks pass. If anything cannot run in the environment, report the exact limitation and what I should run locally.
```

---

## Milestone 2 - Egg Spell Forge And Loadout Confirmation

### Scope

Implement the preparation mechanic end-to-end. The player should be able to connect points on the 9-dot egg grid, randomly generate valid patterns, select a spell type, enter or cycle a unique spell name, see pattern-derived weight/cost/effect previews, fill five spell slots, reject duplicate or too-similar names, and confirm a loadout into match setup. This milestone should be testable without combat because it proves the custom spell identity layer.

### End-User Test Checklist

- Open the preparation screen and draw a pattern by connecting 9-dot grid points.
- Confirm the pattern visually appears on the egg.
- Confirm random generation creates a valid pattern that can be accepted or replaced.
- Confirm the pattern summary updates with weight band, energy cost, piercing, secondary effect, closed bonus, and unstable/misfire warning when applicable.
- Select each spell type and confirm the effect preview changes for Attack, Defense, Support, Control, and Utility.
- Name a spell and save it into one of the five spell slots.
- Try duplicate or too-similar spell names and confirm the game asks for a different name.
- Fill all five spell slots and confirm the loadout can be accepted.
- Confirm the accepted loadout appears in match setup or the match HUD spell buttons.
- Run the automated tests and build check before accepting the milestone.

### Prompt for Local AI Coding Agent

```text
Implement Milestone 2 for Dragon Fighter: Egg Spell Forge using dist/docs/gdd.md, dist/docs/tdd.md, and dist/docs/plan.md as the source of truth.

Scope: build the egg spell preparation flow. The player must be able to draw a 9-dot pattern, generate a random valid pattern, choose a spell type, provide or cycle a unique spell name, preview the spell's derived weight, energy cost, piercing, secondary effect, closed bonus, instability, and type-specific effect, save spells into five slots, reject duplicate or too-similar names, and confirm the five-spell loadout for combat.

Follow the TDD strictly:
- Keep all pattern thresholds, spell costs, type effects, name rules, UI positions, labels, and colors in the centralized config.
- Do not put gameplay or UI constants in render, input, or spell modules.
- Keep pattern analysis, spell creation, loadout validation, Canvas UI, and rendering separate.
- Render every control and feedback element inside Canvas.
- Add logs for pattern creation, random generation, pattern analysis, spell save/reject, and loadout confirmation.
- Add tests for connection counting, weight bands, cost calculation, sharp-angle piercing, closed pattern bonus, crossed-line penalty, unstable flag, spell type preview data, duplicate names, similar names, and five-slot loadout confirmation.

Before reporting done, run the Milestone 2 end-user test checklist from plan.md. Also run the automated tests, run the build/compile check, verify the local dev server is running or start it, and create a Git commit with a clear conventional commit message only after checks pass. If anything cannot run in the environment, report the exact limitation and what I should run locally.
```

---

## Milestone 3 - Named Casting And Combat Feedback Loop

### Scope

Implement the playable core duel mechanic. A confirmed spell loadout should become five combat skill buttons and valid spoken spell names. Prepared spells should go through one normalized input pipeline, validate match state, spend energy, start cooldowns, create effects, apply damage/heal/shield/slow/utility logic, update HP/energy, and show immediate dragon feedback. This milestone proves the main idea: custom egg spells become readable real-time dragon skills.

### End-User Test Checklist

- Start from a confirmed five-spell loadout and enter the match screen.
- Cast each prepared spell with its Canvas spell button and confirm energy, cooldown, feedback text, state labels, and effect visuals update.
- If voice input is available, say a full prepared spell name and confirm only complete valid names cast spells.
- Cast an Attack spell and confirm opponent HP decreases according to spell weight, bonuses, shield, and piercing rules.
- Cast a Defense spell and confirm a shield appears and absorbs damage.
- Cast a Support spell and confirm HP restores without exceeding max HP.
- Cast a Control spell and confirm the opponent slow state is shown.
- Cast a Utility spell and confirm the dash or energy regeneration feedback appears.
- Try casting without enough energy and confirm no effect fires and the reason is visible.
- Try casting during cooldown or voice lockout and confirm the reason is visible.
- Confirm cooldowns and energy regenerate during active match time only.
- Run the automated tests and build check before accepting the milestone.

### Prompt for Local AI Coding Agent

```text
Implement Milestone 3 for Dragon Fighter: Egg Spell Forge using dist/docs/gdd.md, dist/docs/tdd.md, and dist/docs/plan.md as the source of truth.

Scope: build the named casting and combat feedback loop. Confirmed loadouts must appear as five spell buttons in the Match screen. Keyboard, Canvas buttons, and voice where available must normalize into one casting pipeline for prepared spell names. Implement validation, energy spending, cooldowns, voice retry/global lockout, spell active effects, damage priority, HP changes, healing, shields, slows, utility energy regeneration, state labels, latest feedback, and visible effect cues.

Required mechanics:
- Spell types: Attack, Defense, Support, Control, Utility.
- Energy starts at 20, caps at 30, and regenerates at 1 per second during active match time.
- Voice spell casts use the normal 4-second cooldown.
- Button spell casts use the 7-second cooldown.
- Failed voice recognition costs no energy and starts the 1-second retry delay.
- Successful voice casts start the 0.7-second global voice lockout.
- Damage priority is spell shield with piercing, then HP.

Follow the TDD strictly:
- Keep all costs, cooldowns, durations, damage, shield, heal, slow, utility, text, color, and layout values in config.
- Keep input mapping, casting, cooldowns, damage resolution, effects, rendering, and state updates decoupled.
- Render every UI element and feedback cue inside Canvas.
- Add logs for input normalization, cast success/failure, energy changes, cooldowns, effect application, damage resolution, and HP changes.
- Add tests for spell name mapping, energy spend/shortage/regen/clamp, cooldowns, voice retry/lockout, all five spell types, shield and piercing, misfire behavior with seeded randomness, and HP clamping.

Before reporting done, run the Milestone 3 end-user test checklist from plan.md. Also run the automated tests, run the build/compile check, verify the local dev server is running or start it, and create a Git commit with a clear conventional commit message only after checks pass. If anything cannot run in the environment, report the exact limitation and what I should run locally.
```

---

## Milestone 4 - Full AI Match, Result Flow, And Shareable Deploy

### Scope

Wrap the spell-forging and casting systems into a complete vertical slice. Add the 3-second countdown, 60-second timer, AI five-spell loadout, AI action scheduling, AI defensive/support choices, win/lose/draw rules, result overlay, restart and return-to-preparation flow, diagnostics, and GitHub Pages deployment setup. The end result should be a complete best-of-1 duel that another person can open, play, finish, and replay.

### End-User Test Checklist

- Create or generate five spells, confirm the loadout, and see the countdown `3`, `2`, `1`, `Fight!`.
- Confirm combat inputs are ignored or clearly marked inactive during countdown.
- Play a full match against the AI using prepared spells.
- Confirm the AI uses its own five-spell loadout and visible prepared spells.
- Confirm the AI follows energy and cooldown rules and cannot act after defeat.
- Confirm the match ends immediately when either side reaches 0 HP.
- Confirm simultaneous defeat uses remaining energy as the tiebreaker and draws when energy is equal.
- Let the timer reach 0 and confirm higher HP wins, equal HP uses energy, and equal HP plus equal energy draws.
- Confirm the result overlay shows Win, Lose, or Draw, remaining HP, remaining energy, result reason, and most-used spell.
- Restart the match and confirm HP, energy, cooldowns, effects, labels, timer, AI state, and latest feedback reset.
- Return to preparation and confirm a new loadout can be made.
- Open the GitHub Pages build or local production build and confirm it is playable.
- Run the automated tests and build check before accepting the milestone.

### Prompt for Local AI Coding Agent

```text
Implement Milestone 4 for Dragon Fighter: Egg Spell Forge using dist/docs/gdd.md, dist/docs/tdd.md, and dist/docs/plan.md as the source of truth.

Scope: complete the playable vertical slice and shareable build. Add the countdown, 60-second timer, active match rules, AI five-spell loadout, AI decision scheduling, AI support/defense reactions, full result rules, result overlay, restart flow, return-to-preparation flow, production build checks, and GitHub Pages deployment setup or instructions. The player must be able to forge spells, fight a complete 1v1 AI duel, see a result, and replay.

Required match and AI rules:
- Each match lasts 60 seconds after a 3-second countdown.
- Both sides start with 100 HP, 20 energy, and a 30 energy cap.
- HP cannot go below 0.
- AI uses the same spell, energy, cooldown, and damage rules as the player.
- AI attempts an action every 2 seconds while active.
- AI chooses only affordable ready spells.
- AI may defend against heavy Attack spells and may use Support below the configured HP threshold.
- Simultaneous defeat uses remaining energy as tiebreaker, then Draw.
- Timer end uses HP as tiebreaker, then energy, then Draw.

Follow the TDD strictly:
- Keep all timer, AI, result, restart, deployment, layout, text, and logging values in config where applicable.
- Maintain zero magic numbers and Canvas-only UI.
- Keep AI, match rules, result flow, rendering, input, and diagnostics decoupled.
- Add logs for countdown, match start/end, AI decisions, timer expiry, result selection, restart, return to preparation, build checks, server checks, and deployment.
- Add tests for countdown state, spells ignored outside Match, AI legal choices, AI defeated behavior, timer results, simultaneous defeat tiebreakers, restart reset, return-to-preparation reset, and result overlay data.

Before reporting done, run the Milestone 4 end-user test checklist from plan.md. Also run the automated tests, run the build/compile check, verify the local dev server is running or start it, and create a Git commit with a clear conventional commit message only after checks pass. If GitHub Pages deployment is blocked by the environment, report the exact limitation and the command I should run locally.
```
