# Dragon Fighter - Current GDD

## Pitch

Dragon Fighter is a short browser-based dragon dueling prototype. The player chooses a dragon, fights AI opponents with timed commands, and grows stronger by selecting one upgrade after each victory.

The main fantasy is voice-command combat, but the game also supports keyboard and Canvas button input so the prototype remains playable when speech recognition is unavailable.

## Design Pillars

- **Voice first, not voice only:** speech creates the fantasy; keyboard and Canvas controls provide reliable fallbacks.
- **Timing over movement:** combat decisions come from cooldowns, Defence, Block, and Ultimate timing rather than positioning.
- **One readable arena:** HP, cooldowns, accepted commands, states, projectiles, pause/result overlays, and feedback stay inside one Canvas.
- **Short progression runs:** a win leads to one upgrade and a harder stage; a loss or draw can be retried with the same setup.

## Current Flow

1. Main Menu starts the game and can open the Tutorial.
2. Tutorial explains dragon choice, commands, cooldowns, and combat rhythm; completion is saved in localStorage when available.
3. Play Now opens Dragon Select.
4. The player chooses Ember, Tide, or Moss and confirms.
5. Battle runs for up to 60 seconds against the current stage opponent.
6. Pause can freeze the match and offer Resume, Retry Match, or Back to Main Menu.
7. Result:
   - Win: Continue to the upgrade screen.
   - Loss or Draw: Retry Match with the same dragon, stage, and upgrades, or return to Main Menu.
8. Upgrade screen gives one upgrade choice after a win. Changing dragon requires confirmation and starts a fresh run.

## Dragons

- **Ember - Attack Focus:** 1.20x Attack damage, 0.85x Defence duration, normal Skill cooldown.
- **Tide - Defence Focus:** 0.90x Attack damage, 1.25x Defence duration, normal Skill cooldown.
- **Moss - Balanced:** normal Attack and Defence, 0.95x Skill cooldown.

## Combat Rules

- Player base HP: 100. Vitality upgrades increase maximum HP.
- Match time: 60 seconds.
- **Attack:** 12 base damage, 1 second base cooldown.
- **Defence:** reduces incoming damage by 50% for 3 seconds, 4 second cooldown.
- **Block:** prevents incoming damage for 1 second, 7 second base cooldown.
- **Ultimate / Skill:** 35 base damage, 9 second base cooldown.
- Ultimate starts on full cooldown at the beginning of each new or retried battle.
- Block takes priority over Defence when enemy damage lands.
- Attack and Ultimate use projectile timing: cast warning, travel, then damage resolution.
- The AI currently attacks automatically at stage-scaled random intervals.
- Reducing the enemy to 0 HP wins. Reaching 0 player HP loses. At timeout, higher HP wins; equal HP draws.

## Progression

- Each victory increments the run and unlocks one upgrade choice.
- **Power:** +10% Attack and Ultimate damage per rank.
- **Vitality:** +12 maximum HP per rank.
- **Guard:** +0.2 seconds Defence duration and -0.25 seconds Block cooldown per rank, with a cooldown floor.
- **Focus:** -5% Attack and Ultimate cooldowns per rank, with a configured multiplier floor.
- Later stages increase enemy HP and damage, shorten enemy attack waits, scale enemy size, and rotate enemy identities.

## Controls

- Voice: Attack, Defence/Defense, Block, Ultimate, or Skill. Voice accepts one full command word.
- Keyboard combat shortcuts: `Q` Attack, `W` Defence, `E` Block, `R` Ultimate/Skill.
- Keyboard navigation: `Enter` advances supported menu/tutorial/result steps, `Escape` exits tutorial or resumes pause, `P` pauses during battle, number keys choose upgrades.
- Canvas: microphone toggle, command buttons, menu buttons, tutorial navigation, pause, result, upgrade, and confirmation controls.
- Manual combat buttons and combat keys are disabled while microphone input is active; voice commands remain available.

## Presentation

- All player-facing UI is drawn inside a 1400 by 620 Canvas.
- Local arena, dragon, and projectile assets are used with Canvas fallbacks for missing images.
- Combat feedback includes projectiles, shield/guard effects, particles, screen shake, status labels, cooldown indicators, and accepted-command panels.

## Scope Boundaries

- No movement, aiming, online multiplayer, accounts, monetization, persistent run save, or multiple arenas.
- The current run exists in memory and resets on reload or Main Menu reset.
- Tutorial completion may persist locally, but gameplay progression does not.
- Current dragon images are temporary prototype assets and must be replaced with licensed production-safe assets before public release.
