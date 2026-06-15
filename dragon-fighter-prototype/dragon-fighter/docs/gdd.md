# Dragon Fighter: Egg Spell Forge - Combined Prototype GDD

## Pitch

**Dragon Fighter: Egg Spell Forge** is a funny casual 1v1 dragon duel where the player prepares a small set of custom dragon-egg spells, then casts those spells as the main combat skills with full spoken spell names or fallback buttons. The game combines immediate voice-command combat with light spellcraft: each prepared egg spell has a type, name, energy cost, cooldown, and temporary dragon effect.

The prototype tests whether short spoken spell names, readable cooldowns, and custom egg-spell loadouts can create a playful, fast, and understandable dragon battle for casual mobile players.

## Design Pillars

### 1. Voice First, Not Voice Only
The main fantasy is commanding a dragon out loud. The game should clearly show what word or spell name was recognized and what action triggered. Desktop and mobile fallback inputs are allowed so the prototype can still be tested when voice input is unavailable.

### 2. Spellcraft Creates Identity
Before combat, the player builds a small loadout of dragon-egg spells. Pattern complexity, spell type, and spell name give each player a sense of ownership without adding a full collection or progression system.

### 3. Funny and Immediate
Every successful cast should create a clear, exaggerated reaction: a dragon pose, egg crack, projectile, shield burst, hit flash, state label, sound cue, cooldown change, or silly visual flourish. The game should feel playful rather than serious.

### 4. Combat Decisions Over Movement
The player does not need advanced movement, aiming, or positioning skill. The prototype may allow simple tap, swipe, click, or lane dodge inputs, but the core challenge is choosing the right prepared spell skill at the right time.

### 5. Small, Readable Battle System
Only a few prepared spell skills are available. HP, energy, cooldowns, state labels, recognized spell names, and match status must always be visible so a new player can understand what is happening without explanation.

## Core Mechanic

During preparation, the player creates or receives five dragon-egg spells. Each spell has:

- A visual egg pattern.
- A spell type: **Attack**, **Defense**, **Support**, **Control**, or **Utility**.
- A unique spoken spell name.
- An energy cost based on pattern complexity.
- A cooldown.
- A temporary dragon effect in combat.

During combat, the player casts a prepared spell by saying its full spell name or pressing its spell button. Voice casting is fastest and uses the normal cooldown. Button casting is reliable but applies a longer cooldown.

When cast, the egg cracks open and summons a temporary dragon effect based on its type and pattern quality.

## Prototype Command Set

The prototype supports one combat voice layer: prepared spell names. The player brings exactly five named egg spells into combat. Example names:

- **Long Fire**
- **Son Guard**
- **Thuy Heal**
- **Giong Snare**
- **Truc Dash**

A spell skill succeeds only if:

1. The full valid spell name is recognized.
2. The spell is not on cooldown.
3. The player has enough energy if casting a spell.
4. The player's dragon is not defeated.
5. The match is currently active.

When a spell skill fails, the game displays the reason: **Unknown Spell**, **Cooldown**, **Not Enough Energy**, **Voice Retry**, or **Defeated**.

## Core Loop

1. Create, choose, or randomly generate five dragon-egg spell patterns.
2. Assign each spell a type and spoken name.
3. Confirm the loadout.
4. Enter a 1v1 match after a 3-second countdown.
5. Regenerate energy over time.
6. Cast prepared spell skills by voice or fallback button.
7. Watch HP, energy, cooldowns, active effects, and recognized spell names update.
8. The AI opponent chooses spell skills on its own schedule.
9. The loop continues until one side reaches 0 HP or the timer expires.
10. The result screen shows Win, Lose, or Draw, plus remaining HP, remaining energy, and most-used spell.

## Match Rules

- Each match is one best-of-1 round.
- Each match lasts **60 seconds**.
- Player 1 and Player 2 each start with **100 HP**.
- Player 1 is human-controlled.
- Player 2 is AI-controlled.
- Each player starts with **20 energy cubes**.
- Each player's default maximum energy is **30 cubes**.
- Energy regenerates at **1 cube per second**.
- HP cannot go below **0**.
- A side is defeated when its HP reaches **0**.
- If both sides reach 0 HP at the same time, the side with more remaining energy wins.
- If both sides reach 0 HP at the same time and have equal energy, the result is **Draw**.
- If the timer reaches 0 and both sides still have HP, the side with higher HP wins.
- If the timer reaches 0 and both sides have equal HP, the side with more energy wins.
- If the timer reaches 0 and both sides have equal HP and energy, the result is **Draw**.

## Spell Rules

- Each player brings exactly **five prepared spells** into combat.
- A player may not cast a spell unless they have enough energy.
- Every spell has a normal cooldown of **4 seconds**.
- Voice casting spends the spell's energy cost and applies the normal cooldown.
- Button casting spends the spell's energy cost and applies a **7 second cooldown**.
- Failed voice recognition spends no energy and applies a **1 second voice retry delay**.
- After any successful voice cast, the player has a **0.7 second global voice lockout** before another voice spell can trigger.
- A spell name must be unique within that player's five-spell loadout.
- If two spell names sound too similar, the player must rename one before combat starts.
- Prepared spells are the only combat skills in the combat phase.

## Spell Pattern Rules

The prototype supports 9-Dot Grid Mode as the primary spell creation mode.

- Players connect numbered points from 1 to 9.
- A connection may not be drawn twice in opposite directions.
- Random Generation Mode can create a valid pattern that the player may accept or modify.
- Simple Free Draw Mode may be included as a prototype option using the same impact bands.
- Free Draw mirror mode may duplicate strokes symmetrically while drawing.

Pattern complexity determines spell weight:

- **Light:** 1-2 drawn connections, costs 4 energy, low impact.
- **Standard:** 3-4 drawn connections, costs 6 energy, medium impact.
- **Heavy:** 5-6 drawn connections, costs 8 energy, high impact.
- **Grand:** 7 or more drawn connections, costs 10 energy, very high impact.

Additional pattern modifiers:

- A spell with 0-1 sharp angles has no piercing.
- A spell with 2-3 sharp angles pierces 25% of active shield value.
- A spell with 4 or more sharp angles pierces 50% of active shield value.
- A spell that uses 5 or more unique points gains one secondary effect.
- A closed pattern gives the spell one small type-specific bonus.
- Each crossed line adds 2 energy cost.
- A spell with at least one crossed line is unstable.
- An unstable spell has a 25% chance to misfire when cast.

## Spell Type Rules

### Attack Spell

- Light: deals **12 HP damage**.
- Standard: deals **18 HP damage**.
- Heavy: deals **24 HP damage**.
- Grand: deals **30 HP damage**.
- Secondary effect: projectile slightly homes toward the opponent.
- Closed bonus: **+3 damage**.
- Misfire: deals half damage.

### Defense Spell

- Light: creates a 4 second shield that blocks **16 damage**.
- Standard: creates a 4 second shield that blocks **24 damage**.
- Heavy: creates a 4 second shield that blocks **32 damage**.
- Grand: creates a 4 second shield that blocks **40 damage**.
- Secondary effect: shield also blocks the next Control spell.
- Closed bonus: **+4 shield value**.
- Misfire: shield lasts **2 seconds**.

### Support Spell

- Light: restores **8 HP**.
- Standard: restores **12 HP**.
- Heavy: restores **16 HP**.
- Grand: restores **20 HP**.
- Secondary effect: the next spell costs 1 less energy.
- Closed bonus: **+3 HP restored**.
- Misfire: restores half HP.

### Control Spell

- Light: slows the opponent by 30% for **1.5 seconds**.
- Standard: slows the opponent by 30% for **2 seconds**.
- Heavy: slows the opponent by 30% for **2.5 seconds**.
- Grand: slows the opponent by 30% for **3 seconds**.
- Secondary effect: slow interrupts the opponent's current aim preview.
- Closed bonus: **+0.5 seconds duration**.
- Misfire: slow lasts **1 second**.

### Utility Spell

- Light: dashes a short distance and increases energy regeneration by 1 extra cube per second for **2 seconds**.
- Standard: same effect for **3 seconds**.
- Heavy: same effect for **4 seconds**.
- Grand: same effect for **5 seconds**.
- Secondary effect: dash clears active slow effects from the player.
- Closed bonus: **+1 second energy regeneration duration**.
- Misfire: adds **2 seconds** to its cooldown.

## Damage And Shield Priority

- If the target has an active spell shield, damage reduces the shield first.
- Piercing spell damage bypasses part of active shield value based on sharp-angle rating.
- If the target has no active shield, remaining damage reduces HP.

## AI Rules

- The AI uses the same prepared spell skill system as the player.
- The AI starts with a prepared five-spell loadout.
- The AI may only use spells that are not on cooldown.
- The AI may only cast spells it can afford.
- The AI attempts one spell skill every **2 seconds** while active.
- The AI prefers Attack spells when the player is vulnerable.
- The AI may use Defense spells when the player casts a heavy Attack spell.
- The AI may use Support spells when below 50 HP.
- The AI cannot act after being defeated.

## Controls

### Mobile

- Draw spell patterns with touch.
- Tap a spell button to button-cast it.
- Hold the microphone button to enable voice casting.
- Say the full prepared spell name.
- Swipe or tap in the arena to aim or place a spell if the spell requires targeting.
- Optional simple lane dodge may use left or right drag.

### Desktop

- Draw spell patterns with mouse.
- Click a spell button to button-cast it.
- Hold the microphone key or microphone button to enable voice casting.
- Say the full prepared spell name.
- Click or drag in the arena to aim or place a spell if the spell requires targeting.

## UI Layout / Elements

### Preparation Screen

- Egg drawing area.
- 9-dot grid.
- Random pattern button.
- Spell type selector.
- Spell name field.
- Pattern rating summary.
- Energy cost preview.
- Effect preview.
- Five spell slots.
- Confirm loadout button.

### Match HUD

Top left player status panel:

- Player name.
- Dragon element or spell family icon.
- HP bar.
- Energy cubes.
- Cooldown indicators for prepared spells.

Top right opponent status panel:

- Opponent name.
- Dragon element or spell family icon.
- HP bar.
- Energy cubes.
- Cooldown indicators for visible AI spells.

Top center:

- Match timer.
- Countdown display before the match starts.

Center arena:

- Third-person camera view positioned slightly behind and to the right of Player 1.
- Player 1 and dragon appear in the foreground on the right side of the screen.
- Player 2 and dragon stand on the opposite side of the arena.
- Active dragon effects, projectiles, shields, traps, and spell targeting previews remain readable.
- Both teams remain visible in the same frame throughout the match.

Above each dragon:

- Current action or state label: **Idle**, **Casting**, **Attack Spell**, **Defense Spell**, **Support Spell**, **Control Spell**, **Utility Spell**, **Shielded**, **Slowed**, **Cooldown**, or **Defeated**.

Bottom left:

- Latest recognized spell name.
- Failed recognition feedback when relevant.

Bottom right:

- Latest AI spell.

Bottom center:

- Five spell buttons showing spell name, type icon, energy cost, and cooldown state.
- Microphone state.

Full-screen overlay:

- 3-second countdown.
- Pause screen.
- Match result screen.

## UX Flow

1. Player enters the Preparation Phase.
2. Player creates, chooses, or randomly generates five spell eggs.
3. Player assigns each spell a type and spoken name.
4. Player confirms the loadout.
5. Combat starts after a full-screen countdown: **3**, **2**, **1**, **Fight!**
6. Player speaks spell names or uses fallback spell buttons.
7. The game confirms recognized speech and shows cast results, cooldowns, energy shortage, or failed recognition.
8. The AI opponent uses prepared spells.
9. When the match ends, a result overlay appears.
10. The player can restart the match or return to preparation.

## Win / Lose

- **Win:** Player 2 reaches 0 HP before Player 1.
- **Lose:** Player 1 reaches 0 HP before Player 2.
- **Draw:** Both sides reach 0 HP at the same time with equal remaining energy, or both sides have equal HP and energy when the timer ends.
- **Timer Win:** If the timer ends and Player 1 has more HP than Player 2, or equal HP and more energy.
- **Timer Lose:** If the timer ends and Player 2 has more HP than Player 1, or equal HP and more energy.

## In-Scope Vertical Slice

- One best-of-1 duel.
- One portrait arena.
- One player-controlled dragon.
- One AI-controlled opponent dragon.
- Five prepared spells per player.
- 9-Dot Grid Mode.
- Random Generation Mode for 9-dot patterns.
- Simple Free Draw Mode if time allows.
- Five spell types: Attack, Defense, Support, Control, Utility.
- Voice casting and button casting.
- Energy cube system.
- HP bars and defeat state.
- 60-second match timer.
- 3-second starting countdown.
- Cooldown indicators.
- Latest recognized spell display.
- State labels above both dragons.
- Result overlay: Win, Lose, or Draw.
- Funny, exaggerated placeholder feedback for actions and spells.
- Basic Vietnamese myth spell families: Long, Son, Thuy, Giong, and Truc.
- Temporary dragon-themed visual assets for private prototype use only.

## Non-Goals

- No online multiplayer.
- No ranked matchmaking.
- No full dragon breeding or collection system.
- No leveling, rarity, progression, economy, or unlock systems.
- No advanced manual movement system.
- No advanced combo system.
- No full free-draw recognition beyond a simple prototype version.
- No cosmetic customization.
- No story campaign.
- No multiple arenas.
- No more than one round per match.
- No monetization.
- No account system.
- No leaderboard.
- No public release using unlicensed Dragon Mania Legends assets.
