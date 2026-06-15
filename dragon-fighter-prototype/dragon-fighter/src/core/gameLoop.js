import { CONFIG } from '../config.js';
import { updateMatchState } from '../states/matchState.js';
import { renderGame } from '../render/renderer.js';

export function createGameLoop({ state, canvas, context, random, logger, config = CONFIG }) {
  let lastTimestamp = null;
  let running = false;
  let frameRequest = null;

  function frame(timestamp) {
    if (!running) return;
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const deltaSeconds = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    updateMatchState(state, deltaSeconds, random, logger, config);
    renderGame(canvas, context, state, config);
    logger?.frame('Frame updated', { deltaSeconds, phase: state.phase });
    frameRequest = requestAnimationFrame(frame);
  }

  return {
    start() {
      if (running) return;
      running = true;
      frameRequest = requestAnimationFrame(frame);
      logger?.info('Game loop started');
    },
    stop() {
      running = false;
      if (frameRequest !== null) cancelAnimationFrame(frameRequest);
      frameRequest = null;
      logger?.info('Game loop stopped');
    }
  };
}
