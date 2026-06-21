# Project Memory

## Stable Decisions

- The active Dragon Fighter project lives in `dragon-fighter-prototype/dragon-fighter`.
- The deployed/static game currently runs from the repository root `index.html`.
- The root `index.html` is the single active Canvas game file and contains the active dragon config, combat modifier helpers, state, input, and renderer logic inline.
- Milestone 1 is a static Canvas-only battle screen; no real command handling or combat is implemented yet.
- All gameplay, timing, UI, render, logging, server, and build tunables are centralized in `src/config.js`.
- HTML stays minimal: it contains only the Canvas, basic page sizing CSS, and the module script.
- The initial state labels for both dragons are `Idle`.
- Command vocabulary for the prototype is exactly `Attack`, `Defence`, `Block`, and `Skill`.
- Milestone 1 now starts with a Canvas-only Dragon Select phase before the static arena.
- Dragon Select has exactly three selectable dragons in the single-file static version: Ember, Tide, and Moss.
- Milestone 2 uses one shared command path for keyboard and Canvas button inputs.
- Dragon role modifiers affect combat in helper logic: Attack Focus boosts Attack and shortens Defence, Defence Focus extends Defence and weakens Attack, Balanced keeps base Attack/Defence with a small Skill cooldown bonus.
- Milestone 3 phase flow is `dragon-select` -> `countdown` -> `active-match` -> `result`.
- Restart keeps the selected dragon and resets HP, timer, cooldowns, labels, latest feedback, AI timers, and result state.
- AI uses the same command path as the player, acts every 2 seconds during active match, prefers Attack when available, and may react defensively after player Skill.
- Dragon images are now manifest-driven local placeholder assets under `public/assets/dragons`.
- Dragon Mania Legends Wiki images are temporary private prototype placeholders only; they must be replaced before public release or deployment unless explicit permission/licensing is confirmed.
- Image loading is handled by an asset store with config-controlled logs, and Canvas shape dragons remain as fallback if a bitmap is missing or fails.
- Arena background art is loaded through the same manifest-driven asset store, with the generated Canvas arena kept as fallback.
- Player and enemy battle render data carry opposite facing flags; renderer applies flipping only for visuals.
