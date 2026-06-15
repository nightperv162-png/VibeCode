# Dragon Fighter: Egg Spell Forge - GDD

## Current Vision

Dragon Fighter: Egg Spell Forge is a Canvas-only casual 1v1 dragon duel prototype. The player prepares five custom dragon-egg spells, then uses those prepared spells as the main combat skills.

The current design direction is spell-first combat. The older basic action layer (`Attack`, `Defence`, `Block`, `Skill` as separate commands) is no longer part of the target design and should be phased out of combat implementation.

## Design Pillars

- Voice first, not voice only: spoken spell names are the fantasy, with keyboard and Canvas fallback controls for testing.
- Spellcraft creates identity: each spell has a pattern, type, name, energy cost, and combat effect.
- Funny and immediate: casting should produce readable dragon feedback, effects, labels, cooldowns, and HP/energy changes.
- Combat decisions over movement: the player wins by choosing spells well, not by steering or aiming precisely.
- Small readable system: five prepared spells, clear HP, energy, cooldowns, feedback, and result state.

## What Is Built Now

- Canvas-only app shell.
- Preparation screen with 9-dot egg pattern drawing.
- Random valid pattern generation.
- Spell type selection: Attack, Defense, Support, Control, Utility.
- Spell name editing and cycling.
- Pattern summary with weight, energy cost, piercing, secondary effect, closed bonus, and instability.
- Type-specific effect preview.
- Five spell slots with duplicate and too-similar name rejection.
- Loadout confirmation into a match preview.
- Match preview with dragons, player panels, HP/energy display, state labels, latest feedback, spell buttons, and microphone status.

## Current Limitations

- Confirming a loadout currently opens a match preview, not a playable spell-combat match.
- Prepared spell buttons do not yet cast combat effects.
- Voice recognition still routes through older command handling and needs to be converted to spell-name casting.
- The code still contains a legacy basic-action combat scaffold used by older tests and preview controls. This is implementation debt, not current design.
- AI spell casting, result flow, restart flow, and full match timing are not complete.

## Spell Preparation Rules

Each player brings exactly five prepared spells into combat. A spell has:

- Spell name.
- Spell family/name identity.
- Spell type: Attack, Defense, Support, Control, Utility.
- 9-dot pattern.
- Weight band.
- Energy cost.
- Effect preview.
- Cooldown data for the future combat phase.

Pattern complexity influences spell weight, energy cost, piercing, secondary effects, closed-pattern bonuses, and future misfire risk. Exact formulas and thresholds live in `tdd.md`.

## Spell Type Effects

- Attack: damage by weight, with closed-pattern bonus damage.
- Defense: shield value by weight, with closed-pattern bonus shield.
- Support: healing by weight, with closed-pattern bonus healing.
- Control: slow duration by weight, with closed-pattern bonus duration.
- Utility: energy-regen utility duration by weight, with closed-pattern bonus duration.

## Target Combat Rules

- Combat should be controlled by prepared spells only.
- Voice casting uses full prepared spell names.
- Button casting uses the Canvas spell buttons.
- Spells require enough energy, must be off cooldown, and only work during active match state.
- Voice casts use normal spell cooldown.
- Button casts use longer cooldown.
- Failed voice recognition costs no energy and applies retry delay.
- Damage priority is spell shield with piercing, then HP.
- Exact combat values, formulas, config keys, and implementation rules live in `tdd.md`.

## Target Match Flow

1. Player creates or randomizes five spells.
2. Player confirms the loadout.
3. Match starts after countdown.
4. Player and AI cast prepared spells.
5. HP, energy, cooldowns, effects, labels, and feedback update.
6. Match ends when a side reaches 0 HP or time expires.
7. Result shows Win, Lose, or Draw.

## Non-Goals

- No online multiplayer.
- No progression, rarity, collection, economy, or accounts.
- No public release using unlicensed dragon assets.
- No advanced movement, advanced combos, leaderboard, monetization, or story campaign.
