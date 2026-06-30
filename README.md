# Dragon Fighter

An HTML5 Canvas dragon battle prototype.

The playable game lives at the repository root in `index.html`, with styles in `styles.css` and game logic in `game.js`. There is no build step and no generated deployment output. GitHub Pages should serve the repository root directly.

## Current Game

- Main Menu, Tutorial, Dragon Select, Battle, Pause, Result, Upgrade, and Change Dragon confirmation screens.
- Three dragons: Ember, Tide, and Moss.
- Commands: Attack, Defense, Block, and Ultimate.
- Inputs: voice, Q/W/E/R keyboard shortcuts, and Canvas buttons.
- Voice flow: press `Listen Command`, speak one command, then the game stops listening and executes that command. Each activation starts a fresh speech-recognition session.
- Battles include a 3 second pre-match countdown before the match timer, cooldowns, and AI timer start.
- Mic listening slows gameplay time during battle until a command, timeout, manual stop, or mic error.

## Run Locally

Open `index.html` directly in a browser.

For a local static server, run one of these from the repository root:

```bash
python -m http.server 5174
```

or:

```bash
npx serve .
```

Then open:

```text
http://localhost:5174/
```

## Tests

```powershell
node --test tests/game-flow.test.js
```

The current test suite covers menu/tutorial flow, dragon selection, retry/reset, pause, countdown, command input, voice processing, mic slow-time, cooldown display, and change-dragon confirmation.

## Deploy With GitHub Pages

This project includes `.github/workflows/pages.yml`, which deploys the repository root on pushes to `main`.

In GitHub:

1. Go to the repository settings.
2. Open **Pages**.
3. Set the source to **GitHub Actions**.
4. Push to `main`.

Because `index.html` is already at the project root, do not deploy a build folder. The Pages artifact should use the repository root.

## Live Demo

Live demo URL: `https://<your-github-username>.github.io/<your-repository-name>/`
