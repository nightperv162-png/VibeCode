# Dragon Fighter - Current GDD

## Pitch

Dragon Fighter is a short browser-based dragon dueling prototype. The player chooses a dragon, fights AI opponents with timed commands, and grows stronger by selecting one upgrade after each victory.

The main fantasy is voice-command combat, with keyboard and Canvas buttons as reliable fallbacks.

## Design Pillars

- **Voice first, not voice only:** voice commands create the fantasy, while keyboard and Canvas controls keep the game playable.
- **Timing over movement:** combat decisions come from cooldowns, Defense, Block, and Ultimate timing rather than positioning.
- **One readable arena:** HP, cooldowns, accepted commands, states, projectiles, pause/result overlays, and feedback stay inside one Canvas.
- **Short progression runs:** each win leads to one upgrade and a harder stage.

## Current Flow

1. Main Menu starts the game and can open the Tutorial.
2. Tutorial explains dragon choice, commands, cooldowns, and combat rhythm.
3. Play Now opens Dragon Select.
4. The player chooses Ember, Tide, or Moss and confirms.
5. A 3 second countdown appears before the match timer, AI timer, and cooldowns begin.
6. Battle runs for up to 60 seconds against the current stage opponent.
7. Pause can freeze the match and offer Resume, Retry Match, or Back to Main Menu.
8. Win continues to the upgrade screen. Loss or draw can retry the same setup or return to Main Menu.
9. Changing dragon from the upgrade screen requires confirmation and starts a fresh run.

## Dragons

- **Ember - Attack Focus:** higher Attack damage, shorter Defense duration, normal Ultimate timing.
- **Tide - Defense Focus:** lower Attack damage, longer Defense duration, normal Ultimate timing.
- **Moss - Balanced:** normal Attack and Defense, slightly faster Ultimate cooldown.

## Combat Rules

- Player base HP: 100. Vitality upgrades increase maximum HP.
- Match time: 60 seconds, starting after the pre-match countdown.
- **Attack:** 12 base damage, 1 second base cooldown.
- **Defense:** reduces incoming damage by 50% for 3 seconds, 4 second cooldown.
- **Block:** prevents incoming damage for 1 second, 7 second base cooldown.
- **Ultimate:** 35 base damage, 9 second base cooldown.
- Ultimate starts on full cooldown at the beginning of each new or retried battle.
- Block takes priority over Defense when enemy damage lands.
- Attack and Ultimate use projectile timing: cast warning, travel, then damage resolution.
- The AI attacks automatically at stage-scaled random intervals.
- Reducing the enemy to 0 HP wins. Reaching 0 player HP loses. At timeout, higher HP wins; equal HP draws.

## Controls

- Voice: say Attack, Defense, Block, or Ultimate. The hidden alias `skill` still maps to Ultimate for recognition tolerance.
- Keyboard combat shortcuts: `Q` Attack, `W` Defense, `E` Block, `R` Ultimate.
- Canvas combat buttons mirror the same commands and show cooldown seconds directly.
- The mic button reads `Listen Command` when off and `Execute Command` while listening/requested.
- A valid voice command stops mic listening, ends slow-time, then executes the command.
- Manual combat buttons and combat keys are disabled while microphone input is active.

## Voice And Time

- Mic listening starts slow-time immediately during active battle.
- Gameplay timers use scaled time while mic slow-time is active: match timer, cooldowns, AI action timer, Defense/Block timers, action timing, and combat effects.
- Cosmetic particles and UI fades use raw time.
- Slow-time does not affect gameplay during menu/select/result screens or the pre-match countdown.
- Mic listening ends on a valid command, timeout, manual stop, pause/menu navigation, permission failure, or mic error.

## Progression

- Each victory increments the run and unlocks one upgrade choice.
- **Power:** increases Attack and Ultimate damage.
- **Vitality:** increases maximum HP.
- **Guard:** extends Defense and reduces Block cooldown.
- **Focus:** reduces Attack and Ultimate cooldowns.
- Later stages increase enemy HP and damage, shorten enemy attack waits, scale enemy size, and rotate enemy identities.

## Presentation

- All player-facing UI is drawn inside a 1400 by 620 Canvas.
- Primary green buttons are used for forward actions such as Play Now, Next, Confirm Dragon, and Listen Command.
- Combat feedback includes projectiles, shield/guard effects, particles, screen shake, status labels, button cooldown labels, accepted-command panels, and concise voice debug text.
- Local arena, dragon, and projectile assets are used with Canvas fallbacks for missing images.

## Scope Boundaries

- No movement, aiming, online multiplayer, accounts, monetization, persistent run save, or multiple arenas.
- The current run exists in memory and resets on reload or Main Menu reset.
- Tutorial completion may persist locally, but gameplay progression does not.
- Current dragon images are temporary prototype assets and must be replaced with licensed production-safe assets before public release.
