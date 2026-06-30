# Dragon Fighter

An HTML5 Canvas dragon battle prototype.

The playable game lives at the repository root in `index.html`, with styles in `styles.css` and game logic in `game.js`. There is no build step and no generated deployment output. GitHub Pages should serve the repository root directly.

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
