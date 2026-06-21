# Dragon Fighter - Current Plan

## Done

- Replaced the previous playable page with the standalone `voice_command_battle.html` game flow.
- Cleaned the page text into readable English.
- Kept the playable source as one Canvas-only HTML game file at repository-root `index.html`.
- Removed the old npm/module/test/build structure from the game folder.
- Wired the game to current project assets instead of only drawn placeholder dragons.
- Added asset fallbacks so the battle still renders if an image fails.
- Preserved voice commands, Canvas button fallback, keyboard fallback, enemy auto attacks, cooldowns, timer, result flow, and restart.
- GitHub Pages deploys the repository root directly.

## Current Playable Scope

The game is a one-screen voice-command dragon battle:

- Start by saying or pressing Attack, Defence, or Ultimate.
- Survive enemy auto attacks.
- Use Defence to reduce incoming damage.
- Use Ultimate for a high-damage attack.
- Win by reducing enemy HP to 0 or having higher HP when time expires.
- Restart with the Restart button or `R`.

## Validation Checklist

- Open `/index.html` and confirm it shows one Canvas game surface, not a folder listing.
- Confirm the arena background loads from `public/assets/backgrounds/arena.png`.
- Confirm player and enemy dragon images load from `public/assets/dragons/`.
- Confirm microphone, action, and restart buttons are drawn inside the Canvas.
- Press Attack and confirm enemy HP drops by 12.
- Press Defence and confirm incoming enemy damage is reduced.
- Press Ultimate and confirm enemy HP drops by 35.
- Press commands during cooldown and confirm a cooldown message appears.
- Press `A`, `D`, `U`, and `R` and confirm they match the buttons.
- In a supported browser, start the microphone and say Attack, Defence, or Ultimate.
- Let the match end and confirm the result overlay appears.
- Confirm GitHub Pages deploys `/index.html` directly.

## Next Steps

- Replace temporary private prototype assets before sharing publicly.
- Tune mobile layout and microphone permission messaging after browser testing.
