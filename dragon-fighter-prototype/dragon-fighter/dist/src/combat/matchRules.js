import { createInitialGameState, selectDragon, confirmDragonSelection } from '../core/gameState.js';

export function updateMatchFlow(state, config, deltaSeconds) {
  if (state.phase === config.match.countdownPhase) {
    return updateCountdown(state, config, deltaSeconds);
  }

  if (state.phase === config.match.activeCombatPhase) {
    return updateActiveTimer(state, config, deltaSeconds);
  }

  return state;
}

export function applyResultIfNeeded(state, config) {
  const result = determineResult(state, config, state.timerSeconds <= config.math.zero);

  if (!result) {
    return state;
  }

  return {
    ...state,
    phase: config.match.resultPhase,
    result
  };
}

export function determineResult(state, config, timerExpired = false) {
  const playerHp = state.players.player1.hp;
  const aiHp = state.players.player2.hp;
  const playerDefeated = playerHp <= config.match.minHp;
  const aiDefeated = aiHp <= config.match.minHp;

  if (playerDefeated && aiDefeated) {
    return config.match.drawOnSimultaneousDefeat ? config.match.drawLabel : config.match.loseLabel;
  }

  if (aiDefeated) {
    return config.match.winLabel;
  }

  if (playerDefeated) {
    return config.match.loseLabel;
  }

  if (!timerExpired) {
    return null;
  }

  if (playerHp === aiHp && config.match.timerTieIsDraw) {
    return config.match.drawLabel;
  }

  return playerHp > aiHp ? config.match.winLabel : config.match.loseLabel;
}

export function restartMatch(state, config) {
  const selectedDragonId = state.dragonSelect.selectedDragonId ?? config.dragons.options[config.math.zero].id;
  const freshState = selectDragon(createInitialGameState(config), config, selectedDragonId);

  return confirmDragonSelection(freshState, config);
}

function updateCountdown(state, config, deltaSeconds) {
  const countdownSeconds = Math.max(config.math.zero, state.countdownSeconds - deltaSeconds);

  if (countdownSeconds > config.math.zero) {
    return {
      ...state,
      countdownSeconds
    };
  }

  return {
    ...state,
    phase: config.match.activeCombatPhase,
    countdownSeconds: config.math.zero,
    timerSeconds: config.match.durationSeconds,
    ai: {
      ...state.ai,
      actionTimerSeconds: config.ai.initialActionTimerSeconds
    }
  };
}

function updateActiveTimer(state, config, deltaSeconds) {
  const timerSeconds = Math.max(config.math.zero, state.timerSeconds - deltaSeconds);
  return applyResultIfNeeded({
    ...state,
    timerSeconds
  }, config);
}
