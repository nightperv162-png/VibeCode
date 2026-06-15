# Dragon Fighter — Prototype GDD

## Pitch

**Dragon Fighter** is a funny casual 1v1 dragon duel where the player battles an AI opponent by saying full command words out loud. The player does not control movement. They make combat decisions by speaking commands such as **Attack**, **Defence**, **Block**, and **Skill**. Each command triggers a dragon action with a cooldown. The match ends when either side's HP reaches zero or the timer expires.

This prototype tests whether short, complete spoken commands can create a fun, readable, and silly combat experience for casual mobile players.

## Design Pillars

### 1. Voice First, Not Voice Only
The main fantasy is commanding a dragon by voice. The game should clearly show what word was recognized and what action was triggered. Desktop and mobile fallback inputs are allowed so the prototype can still be tested when voice input is unavailable.

### 2. Funny and Immediate
Every successful command should produce a clear, exaggerated reaction: a dragon pose, projectile, shield effect, hit flash, state label, sound cue, or cooldown change. The game should feel playful rather than competitive or serious.

### 3. Combat Decisions Over Movement
The player does not steer, aim, dodge, or reposition manually. Both sides remain in the arena frame. The challenge comes from choosing the right command at the right time.

### 4. Small, Readable Battle System
Only a few actions are available. Cooldowns, HP changes, action labels, and match status must always be visible so a new player can understand what is happening without explanation.

## Core Mechanic

The player says a complete command word to trigger a dragon action.

Valid player commands for the prototype are:

- **Attack**
- **Defence**
- **Block**
- **Skill**

A command only succeeds if:

1. The full valid word is recognized.
2. The action is not on cooldown.
3. The player's dragon is not defeated.
4. The match is currently active.

When a command succeeds, the player's dragon performs the action immediately and the action's cooldown begins. When a command fails, the game displays the reason: **Unknown Command**, **Cooldown**, or **Defeated**.

## Core Loop

1. The match begins with a 3-second countdown.
2. The player watches the AI opponent and current cooldowns.
3. The player says a valid command word.
4. The player dragon performs the action if available.
5. The AI opponent chooses and performs actions on its own schedule.
6. HP, cooldowns, state labels, and latest recognized commands update.
7. The loop continues until one side reaches 0 HP or the timer expires.
8. The result screen shows Win, Lose, or Draw.

## Rules

### Match Rules

- Each match lasts **60 seconds**.
- Player 1 and Player 2 each start with **100 HP**.
- Player 1 is human-controlled.
- Player 2 is AI-controlled.
- HP cannot go below **0**.
- A side is defeated when its HP reaches **0**.
- If both sides reach 0 HP at the same time, the result is **Draw**.
- If the timer reaches 0 and both sides still have HP, the side with higher HP wins.
- If the timer reaches 0 and both sides have equal HP, the result is **Draw**.

### Action Rules

#### Attack
- Spoken command: **Attack**.
- Effect: deals **10 damage** to the opponent if not blocked.
- Cooldown: **2 seconds**.
- Display state label: **Attack**.

#### Defence
- Spoken command: **Defence**.
- Effect: reduces incoming damage by **50%** for **3 seconds**.
- Cooldown: **6 seconds**.
- Display state label: **Defence** while active.
- Defence can overlap with incoming attacks during its active duration.

#### Block
- Spoken command: **Block**.
- Effect: prevents all incoming damage for **1 second**.
- Cooldown: **5 seconds**.
- Display state label: **Block** while active.
- Block is stronger than Defence but lasts for a shorter time.

#### Skill
- Spoken command: **Skill**.
- Effect: deals **25 damage** to the opponent if not blocked.
- Cooldown: **10 seconds**.
- Display state label: **Skill**.
- Skill can be reduced by Defence.
- Skill can be fully prevented by Block.

### Damage Priority

- If the target is using Block when damage lands, the target takes **0 damage**.
- If the target is using Defence when damage lands, the target takes **half damage**.
- If the target is using neither Block nor Defence, the target takes full damage.
- Block takes priority over Defence if both are active.

### AI Rules

- The AI uses the same four actions as the player.
- The AI may only use actions that are not on cooldown.
- The AI attempts one action every **2 seconds** while active.
- The AI prefers Attack when Skill is unavailable.
- The AI may use Defence or Block when the player uses Skill.
- The AI cannot act after being defeated.

## Controls

### Mobile

- Primary input: microphone voice command.
- The player must say the full command word: **Attack**, **Defence**, **Block**, or **Skill**.
- The latest recognized command appears at the bottom left of the screen.
- A visible command reference appears at the bottom center.
- Optional fallback buttons may appear for testing: **Attack**, **Defence**, **Block**, **Skill**.

### Desktop

- Primary test input: keyboard or clickable buttons.
- Voice input may also be used if available.
- Suggested desktop keys:
  - **A** for Attack
  - **D** for Defence
  - **B** for Block
  - **S** for Skill
- Desktop controls must trigger the same actions and cooldowns as voice commands.

## UI Layout / Elements

### Top Left
Player 1 status panel containing:
- Player name
- Dragon element icon
- HP bar
- Cooldown indicators for Attack, Defence, Block, and Skill

### Top Right
Player 2 status panel containing:
- Player name
- Dragon element icon
- HP bar
- Cooldown indicators for Attack, Defence, Block, and Skill

### Top Center
- Match timer
- Countdown display before the match starts

### Center Arena
- Third-person camera view positioned slightly behind and to the right of Player 1.
- Player 1 appears in the foreground on the right side of the screen.
- Player 1's dragon stands in front of Player 1 and faces the opponent.
- Player 2 and Player 2's dragon stand on the opposite side of the arena.
- Both teams remain visible in the same frame throughout the match.

### Above Each Dragon
A current action or state label, using one of:
- Idle
- Attack
- Defence
- Block
- Skill
- Cooldown
- Defeated

### Bottom Left
- Latest recognized command from Player 1.
- Failed recognition feedback when relevant.

### Bottom Right
- Latest AI command or action from Player 2.

### Bottom Center
Shared command reference:
- Attack
- Defence
- Block
- Skill

### Full-Screen Overlay
Used for:
- 3-second countdown
- Pause screen
- Match result screen

## UX Flow

1. Player opens the prototype.
2. Player sees the main match screen and command reference.
3. A full-screen countdown displays **3**, **2**, **1**, **Fight!**.
4. The match begins.
5. Player speaks commands or uses fallback inputs.
6. The game confirms recognized commands and shows action results.
7. When the match ends, a result overlay appears.
8. The player can restart the match from the result screen.

## Win / Lose

- **Win:** Player 2 reaches 0 HP before Player 1.
- **Lose:** Player 1 reaches 0 HP before Player 2.
- **Draw:** Both sides reach 0 HP at the same time, or both sides have equal HP when the timer ends.
- **Timer Win:** If the timer ends and Player 1 has more HP than Player 2.
- **Timer Lose:** If the timer ends and Player 2 has more HP than Player 1.

## In-Scope (Vertical Slice)

- One playable arena.
- One player-controlled dragon.
- One AI-controlled opponent dragon.
- Four combat actions: Attack, Defence, Block, Skill.
- HP bars and defeat state.
- 60-second match timer.
- 3-second starting countdown.
- Cooldown indicators for all actions.
- Latest recognized command display.
- State labels above both dragons.
- Result overlay: Win, Lose, or Draw.
- Funny, exaggerated placeholder feedback for actions.
- Temporary dragon-themed visual assets for private prototype use only.

## Non-Goals

- No online multiplayer.
- No dragon collection system.
- No breeding, leveling, rarity, or progression systems.
- No manual movement control.
- No advanced combo system.
- No multiple arenas.
- No multiple playable characters.
- No monetization.
- No account system.
- No leaderboard.
- No public release using unlicensed Dragon Mania Legends assets.
