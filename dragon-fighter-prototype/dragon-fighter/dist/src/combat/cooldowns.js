export function updateCombatTimers(state, config, deltaSeconds) {
  if (state.phase !== config.match.activeCombatPhase) {
    return state;
  }

  return {
    ...state,
    ai: {
      ...state.ai,
      defensiveReactionSeconds: Math.max(config.math.zero, state.ai.defensiveReactionSeconds - deltaSeconds)
    },
    players: Object.fromEntries(
      Object.entries(state.players).map(([sideId, side]) => [sideId, updateSideTimers(side, config, deltaSeconds)])
    )
  };
}

function updateSideTimers(side, config, deltaSeconds) {
  const cooldowns = Object.fromEntries(
    Object.entries(side.cooldowns).map(([command, remaining]) => [
      command,
      Math.max(config.math.zero, remaining - deltaSeconds)
    ])
  );
  const activeEffects = Object.fromEntries(
    Object.entries(side.activeEffects).map(([command, remaining]) => [
      command,
      Math.max(config.math.zero, remaining - deltaSeconds)
    ])
  );
  const stateLabelSeconds = Math.max(config.math.zero, side.stateLabelSeconds - deltaSeconds);
  const defensiveLabel = getDefensiveLabel(config, activeEffects);
  const stateLabel = side.hp <= config.match.minHp
    ? config.labels.defeatedState
    : defensiveLabel ?? (stateLabelSeconds > config.math.zero ? side.stateLabel : config.labels.idleState);

  return {
    ...side,
    cooldowns,
    activeEffects,
    stateLabelSeconds,
    stateLabel
  };
}

function getDefensiveLabel(config, activeEffects) {
  if (activeEffects[config.actions.blockCommandWord] > config.math.zero) {
    return config.actions.blockCommandWord;
  }

  if (activeEffects[config.actions.defenceCommandWord] > config.math.zero) {
    return config.actions.defenceCommandWord;
  }

  return null;
}
