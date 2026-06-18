import { attemptCommand } from '../combat/actions.js';

export function updateAi(state, config, deltaSeconds) {
  if (state.phase !== config.match.activeCombatPhase || state.players.player2.hp <= config.match.minHp) {
    return state;
  }

  const actionTimerSeconds = state.ai.actionTimerSeconds - deltaSeconds;

  if (actionTimerSeconds > config.math.zero) {
    return {
      ...state,
      ai: {
        ...state.ai,
        actionTimerSeconds
      }
    };
  }

  const command = chooseAiCommand(state, config);
  const nextState = attemptCommand(state, config, 'player2', command);

  return {
    ...nextState,
    ai: {
      ...nextState.ai,
      actionTimerSeconds: config.ai.actionIntervalSeconds
    }
  };
}

export function chooseAiCommand(state, config) {
  const aiSide = state.players.player2;

  if (state.ai.defensiveReactionSeconds > config.math.zero) {
    const blockReady = aiSide.cooldowns[config.actions.blockCommandWord] <= config.math.zero;
    if (blockReady) {
      return config.actions.blockCommandWord;
    }

    const defenceReady = aiSide.cooldowns[config.actions.defenceCommandWord] <= config.math.zero;
    if (defenceReady) {
      return config.actions.defenceCommandWord;
    }
  }

  const skillReady = aiSide.cooldowns[config.actions.skillCommandWord] <= config.math.zero;
  if (skillReady && state.players.player1.hp <= config.ai.skillPreferenceHpThreshold) {
    return config.actions.skillCommandWord;
  }

  const attackReady = aiSide.cooldowns[config.actions.attackCommandWord] <= config.math.zero;
  if (attackReady) {
    return config.actions.attackCommandWord;
  }

  if (skillReady) {
    return config.actions.skillCommandWord;
  }

  return config.input.validCommands.find((command) => aiSide.cooldowns[command] <= config.math.zero)
    ?? config.actions.attackCommandWord;
}
