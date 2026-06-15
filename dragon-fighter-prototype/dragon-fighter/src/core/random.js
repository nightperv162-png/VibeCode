import { CONFIG } from '../config.js';

export function createSeededRandom(seed = CONFIG.ai.defaultSeed) {
  let currentSeed = seed;
  const multiplier = 1664525;
  const increment = 1013904223;
  const modulus = 4294967296;

  return function nextRandom() {
    currentSeed = (multiplier * currentSeed + increment) % modulus;
    return currentSeed / modulus;
  };
}
