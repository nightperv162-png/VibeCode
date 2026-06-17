import { CONFIG } from './config.js';
import { createGameLoop } from './core/gameLoop.js';
import { createInitialGameState } from './core/gameState.js';
import { createLogger } from './core/logger.js';
import { createDiagnostics } from './core/diagnostics.js';
import { handleCanvasPointer } from './ui/canvasButtonSystem.js';
import { renderGame } from './render/canvasRenderer.js';

const logger = createLogger(CONFIG);
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let state = createInitialGameState(CONFIG);

function fitCanvasToWindow() {
  canvas.width = CONFIG.app.canvasWidth;
  canvas.height = CONFIG.app.canvasHeight;
  document.body.style.margin = '0';
  document.body.style.background = CONFIG.app.pageBackgroundColor;
  document.body.style.display = 'grid';
  document.body.style.placeItems = 'center';
  document.body.style.minHeight = '100vh';
  const scale = Math.min(window.innerWidth / CONFIG.app.canvasWidth, window.innerHeight / CONFIG.app.canvasHeight);
  canvas.style.width = `${CONFIG.app.canvasWidth * scale}px`;
  canvas.style.height = `${CONFIG.app.canvasHeight * scale}px`;
}

function pointerToCanvas(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (CONFIG.app.canvasWidth / rect.width),
    y: (event.clientY - rect.top) * (CONFIG.app.canvasHeight / rect.height)
  };
}

canvas.addEventListener('pointerdown', (event) => {
  state = handleCanvasPointer(state, pointerToCanvas(event), CONFIG, logger);
});

window.addEventListener('resize', fitCanvasToWindow);
fitCanvasToWindow();
logger.diagnostics('app started', createDiagnostics(CONFIG));

const loop = createGameLoop({
  update() {},
  render() {
    renderGame(ctx, state, CONFIG);
  },
  config: CONFIG
});

loop.start();
