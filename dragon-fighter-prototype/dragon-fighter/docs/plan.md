# Voice Dragon Battle - Current Plan

## Done

- Replaced the previous playable page with the standalone `voice_command_battle.html` game flow.
- Cleaned the page text into readable English.
- Kept the source as a single-file Canvas game in `index.html`.
- Wired the game to current project assets instead of only drawn placeholder dragons.
- Added asset fallbacks so the battle still renders if an image fails.
- Preserved voice commands, button fallback, keyboard fallback, enemy auto attacks, cooldowns, timer, result flow, and restart.
- GitHub Pages build still emits `dist/index.html`.

## Current Playable Scope

The game is a one-screen voice-command dragon battle:

- Start by saying or pressing Attack, Defence, or Ultimate.
- Survive enemy auto attacks.
- Use Defence to reduce incoming damage.
- Use Ultimate for a high-damage attack.
- Win by reducing enemy HP to 0 or having higher HP when time expires.
- Restart with the Restart button or `R`.

## Validation Checklist

- Open `index.html` and confirm it shows the game Canvas, not a folder listing.
- Confirm the arena background loads from `public/assets/backgrounds/arena.png`.
- Confirm player and enemy dragon images load from `public/assets/dragons/`.
- Press Attack and confirm enemy HP drops by 12.
- Press Defence and confirm incoming enemy damage is reduced.
- Press Ultimate and confirm enemy HP drops by 35.
- Press commands during cooldown and confirm a cooldown message appears.
- Press `A`, `D`, `U`, and `R` and confirm they match the buttons.
- In a supported browser, start the microphone and say Attack, Defence, or Ultimate.
- Let the match end and confirm the result overlay appears.
- Run `npm run check` before committing.

## Next Steps

- Add tests for the standalone command parser and combat calculations.
- Decide whether to keep the single-file source or port it into the existing modular `src/` architecture.
- Replace temporary private prototype assets before sharing publicly.
- Tune mobile layout and microphone permission messaging after browser testing.
