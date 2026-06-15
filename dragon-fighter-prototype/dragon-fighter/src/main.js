import { CONFIG } from './config.js';
import { createGameLoop } from './core/gameLoop.js';
import { createInitialGameState } from './core/gameState.js';
import { createLogger } from './core/logger.js';
import { createSeededRandom } from './core/random.js';
import { createInputController } from './input/inputController.js';
import { renderGame } from './render/renderer.js';

function preparePage(config) {
  document.title = config.meta.title;
  document.documentElement.style.margin = config.match.minHp.toString();
  document.body.style.margin = config.match.minHp.toString();
  document.body.style.overflow = 'hidden';
  document.body.style.background = config.canvas.pageBackground;
}

function prepareCanvas(canvas, config) {
  canvas.width = config.canvas.width;
  canvas.height = config.canvas.height;
  canvas.style.width = config.canvas.cssWidth;
  canvas.style.height = config.canvas.cssHeight;
  canvas.style.display = 'block';
  canvas.style.touchAction = 'none';
}

function boot() {
  preparePage(CONFIG);
  const canvas = document.getElementById(CONFIG.canvas.elementId);
  const context = canvas.getContext('2d');
  const logger = createLogger(CONFIG);
  const state = createInitialGameState(CONFIG);
  const random = createSeededRandom(CONFIG.ai.defaultSeed);

  prepareCanvas(canvas, CONFIG);
  renderGame(canvas, context, state, CONFIG);

  const input = createInputController({ canvas, state, logger, config: CONFIG, windowRef: window });
  input.attach();

  const loop = createGameLoop({ state, canvas, context, random, logger, config: CONFIG });
  loop.start();

  window.dragonFighterDebug = { state, input, loop, config: CONFIG };
  logger.info('Dragon Fighter booted', { version: CONFIG.meta.version });
}

boot();
