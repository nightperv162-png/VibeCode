import { CONFIG } from '../config.js';

export function createGameLoop({ update, render, config = CONFIG }) {
  let animationFrameId = null;
  let lastTime = 0;
  const secondsPerMillisecond = config.process.failureStatus / config.timing.millisecondsPerSecond;

  function frame(timestamp) {
    const deltaSeconds = lastTime ? (timestamp - lastTime) * secondsPerMillisecond : 0;
    lastTime = timestamp;
    update(deltaSeconds);
    render();
    animationFrameId = requestAnimationFrame(frame);
  }

  return {
    start() {
      if (!animationFrameId) animationFrameId = requestAnimationFrame(frame);
    },
    stop() {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      lastTime = 0;
    }
  };
}
