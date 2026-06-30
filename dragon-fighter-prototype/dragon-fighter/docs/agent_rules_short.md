# Agent Rules Short

Always:
- Read `docs/agent_state.md` first.
- Read only the last 30 lines of `docs/work_log.md` unless needed.
- Use the existing root `index.html` single-file Canvas architecture.
- Keep player-facing UI inside Canvas.
- Keep changes small and testable.
- Use centralized config for timing, balance, labels, and layout values.
- Avoid magic numbers outside config unless they are purely local drawing constants.
- Preserve current command vocabulary: Attack, Defense, Block, Ultimate.
- Preserve current input model: voice, Q/W/E/R keyboard, and Canvas buttons.
- Preserve voice flow: `Listen Command` starts listening; a valid command stops mic listening before execution.
- Preserve pre-match countdown behavior before match timer, cooldowns, and AI timer start.
- Do not redesign unrelated systems.
- Update docs after behavior, wording, or architecture changes.
- Update `docs/agent_state.md` after notable work.
- Append a short entry to `docs/work_log.md`.
- Run available tests/checks if code changed.
- Commit only after checks pass and the user asks for commit.
- Final report should be short.
