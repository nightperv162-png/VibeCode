# Dragon Fighter - Slide Summary

## 1. Project Overview

**Dragon Fighter** is a short Canvas-based dragon dueling prototype. The player chooses a dragon, fights AI opponents in timed battles, and progresses through stronger stages by selecting upgrades after each win.

The game is designed around fast command decisions rather than movement. Players can issue commands by voice, keyboard, or on-screen Canvas buttons.

## 2. Core Game Idea

- Genre: 2D dragon dueling / command combat prototype
- Platform: Web browser
- Main technology: HTML5 Canvas and JavaScript
- Match length: 60 seconds after a 3 second pre-match countdown
- Player goal: defeat the enemy dragon before time runs out
- Progression goal: win battles, choose upgrades, and survive harder stages

## 3. Design Pillars

- **Voice first, not voice only:** voice commands support the main fantasy, while keyboard and Canvas buttons keep the game reliable.
- **Decision-based combat:** the player focuses on timing Attack, Defense, Block, and Ultimate instead of moving around.
- **Readable feedback:** HP, cooldowns, commands, projectiles, states, countdown, and results are visible in one arena view.
- **Short progression loop:** each victory gives one upgrade and leads to a stronger opponent.

## 4. Player Flow

1. Start at the Main Menu.
2. Open Tutorial if needed.
3. Press Play Now.
4. Choose one dragon: Ember, Tide, or Moss.
5. Watch the 3 second countdown.
6. Fight an AI opponent in the arena.
7. On victory, continue to the upgrade screen.
8. Pick one upgrade and advance to the next stage.
9. On loss or draw, retry the match or return to the Main Menu.

## 5. Dragon Choices

| Dragon | Role | Gameplay Style |
| --- | --- | --- |
| Ember | Attack Focus | Higher Attack damage, shorter Defense duration |
| Tide | Defense Focus | Longer Defense duration, lower Attack damage |
| Moss | Balanced | Normal Attack and Defense, slightly faster Ultimate cooldown |

## 6. Combat Commands

| Command | Effect |
| --- | --- |
| Attack | Deals standard damage with a short cooldown |
| Defense | Reduces incoming damage for a limited time |
| Block | Prevents all incoming damage for a short window |
| Ultimate | Deals high damage with a longer cooldown |

Ultimate starts on full cooldown at the beginning of every battle, so players cannot open with a heavy burst.

## 7. Input Methods

- **Voice:** press `Listen Command`, say Attack, Defense, Block, or Ultimate, then the game stops listening and executes the command.
- **Keyboard:** Q = Attack, W = Defense, E = Block, R = Ultimate.
- **Canvas buttons:** tap/click the command buttons inside the game screen.

All input methods use the same combat logic, cooldown rules, and game phase checks.

## 8. Battle Rules

- Player base HP: 100
- Match duration: 60 seconds after countdown
- Attack base damage: 12
- Ultimate base damage: 35
- Defense reduces incoming damage by 50%
- Block fully prevents damage and has priority over Defense
- The AI attacks automatically at stage-scaled intervals
- Mic listening slows gameplay time during active battle
- If time expires, the dragon with higher HP wins
- Equal HP at timeout creates a draw

## 9. Progression System

After each win, the player chooses one upgrade:

| Upgrade | Effect |
| --- | --- |
| Power | Increases Attack and Ultimate damage |
| Vitality | Increases maximum HP |
| Guard | Extends Defense and reduces Block cooldown |
| Focus | Reduces Attack and Ultimate cooldowns |

Later stages increase enemy HP, enemy damage, and enemy attack pressure. Enemy identities rotate through a configured roster.

## 10. Current Features Implemented

- Single-file playable prototype in the root `index.html`
- Canvas Main Menu, Tutorial, Dragon Select, Countdown, Battle, Result, Pause, and Upgrade screens
- Three dragon options with different modifiers
- Voice recognition support through the Web Speech API
- Keyboard and Canvas fallback controls
- Cooldowns, projectiles, damage timing, Defense, Block, and Ultimate logic
- Stage scaling, enemy rotation, and four upgrade paths
- Retry, Main Menu reset, and Change Dragon confirmation flows
- Dark green primary buttons and larger centered button text
- Local arena, dragon, and projectile assets with Canvas fallbacks
- Automated Node tests for major flow and input behavior

## 11. Technical Architecture

- Runtime: browser-based HTML, CSS, and JavaScript
- Rendering: one 1400 x 620 Canvas
- Active source of truth: repository-root `index.html`
- Assets: local files under `dragon-fighter-prototype/dragon-fighter/public/assets/`
- Deployment target: GitHub Pages from the repository root
- No framework, package build, account system, backend, or online multiplayer

## 12. Testing And Validation

The project has 32 lightweight automated tests for:

- Main Menu and Tutorial flow
- Dragon selection and game state transitions
- Countdown behavior before match timers start
- Win, loss, retry, and reset behavior
- Ultimate starting cooldown
- Voice command processing and duplicate suppression
- Manual input lockout while microphone input is active
- Pause menu behavior
- Change Dragon confirmation

Current test command:

```powershell
node --test tests/game-flow.test.js
```

## 13. Scope Boundaries

The prototype intentionally does not include movement, aiming, online multiplayer, accounts, persistent saves, monetization, multiple arenas, build tooling, or framework migration.

## 14. Known Constraints

- Voice support depends on browser Web Speech API availability and microphone permission behavior.
- Game progress exists only in memory and resets on reload or Main Menu reset.
- Current dragon images are temporary prototype assets and should be replaced with licensed production-safe assets before public release.
- Automated tests cover core flows, but more combat and progression tests are still useful.

## 15. Suggested Slide Structure

1. Title: Dragon Fighter
2. Concept: fast dragon duels using voice commands
3. Core Loop: choose dragon, countdown, fight, win, upgrade, repeat
4. Dragon Selection: Ember, Tide, Moss
5. Combat Commands: Attack, Defense, Block, Ultimate
6. Input System: voice, keyboard, Canvas buttons
7. Voice Flow: Listen Command -> speak -> Execute Command
8. Progression: upgrades and stage scaling
9. Technical Build: single-file Canvas prototype
10. Next Steps: licensed assets, more tests, browser playtesting, balance tuning

## 16. Next Priorities

- Replace temporary dragon images with licensed production-safe assets.
- Add focused tests for damage priority, upgrade formulas, stage scaling, and voice normalization.
- Verify microphone behavior on target desktop and mobile browsers.
- Tune combat values from playtest feedback.
- Visually review tutorial, countdown, and pause screens across screen sizes.
