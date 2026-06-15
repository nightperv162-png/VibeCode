import { CONFIG } from '../config.js';
import { updateAi } from '../ai/aiController.js';
import { updateActiveActionTimers, updateCooldowns } from '../combat/cooldowns.js';
import { endMatchIfNeeded } from '../combat/matchRules.js';

function updateEffects(state, deltaSeconds, config) {
  state.hitEffects.forEach((effect) => {
    effect.seconds = Math.max(config.match.minHp, effect.seconds - deltaSeconds);
  });
  state.hitEffects = state.hitEffects.filter((effect) => effect.seconds > config.match.minHp);

  state.projectileEffects.forEach((effect) => {
    effect.seconds = Math.max(config.match.minHp, effect.seconds - deltaSeconds);
  });
  state.projectileEffects = state.projectileEffects.filter((effect) => effect.seconds > config.match.minHp);

  state.shakeRemaining = Math.max(config.match.minHp, state.shakeRemaining - deltaSeconds);
}

function updateSides(state, deltaSeconds, config) {
  Object.values(state.sides).forEach((side) => {
    updateCooldowns(side, deltaSeconds, config);
    updateActiveActionTimers(side, deltaSeconds, config);
  });
}

export function updateMatchState(state, deltaSeconds, random, logger, config = CONFIG) {
  state.elapsedSeconds += deltaSeconds;
  updateSides(state, deltaSeconds, config);
  updateEffects(state, deltaSeconds, config);

  if (state.phase === config.match.countdownPhase) {
    state.countdownRemaining = Math.max(config.match.minHp, state.countdownRemaining - deltaSeconds);
    if (state.countdownRemaining <= config.match.minHp) {
      state.phase = config.match.activePhase;
      state.fightBannerRemaining = config.match.fightBannerSeconds;
      logger?.info('Countdown complete: Fight');
    }
    return;
  }

  if (state.phase !== config.match.activePhase) return;

  state.fightBannerRemaining = Math.max(config.match.minHp, state.fightBannerRemaining - deltaSeconds);
  state.matchRemaining = Math.max(config.match.minHp, state.matchRemaining - deltaSeconds);
  updateAi(state, deltaSeconds, random, logger, config);
  endMatchIfNeeded(state, logger, config);
}
