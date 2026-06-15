import { ACTION_IDS, CONFIG } from '../config.js';

function createCooldownMap() {
  return Object.fromEntries(ACTION_IDS.map((actionId) => [actionId, CONFIG.match.minHp]));
}

function createSide(id, name, element) {
  return {
    id,
    name,
    element,
    hp: CONFIG.match.startingHp,
    cooldowns: createCooldownMap(),
    activeDefenceSeconds: CONFIG.match.minHp,
    activeBlockSeconds: CONFIG.match.minHp,
    actionLabel: CONFIG.combat.idleLabel,
    actionLabelSeconds: CONFIG.match.minHp,
    failedLabelSeconds: CONFIG.match.minHp,
    latestCommand: id === CONFIG.match.aiId ? CONFIG.text.noAiCommand : CONFIG.text.noPlayerCommand,
    latestReason: '',
    lastSuccessfulAction: null,
    defeated: false
  };
}

export function createInitialGameState(config = CONFIG) {
  return {
    phase: config.match.countdownPhase,
    countdownRemaining: config.match.countdownSeconds,
    fightBannerRemaining: config.match.minHp,
    matchRemaining: config.match.durationSeconds,
    result: null,
    resultReason: '',
    elapsedSeconds: config.match.minHp,
    aiActionTimer: config.ai.actionIntervalSeconds,
    shakeRemaining: config.match.minHp,
    hitEffects: [],
    projectileEffects: [],
    uiButtons: [],
    voiceStatus: config.input.voiceReadyText,
    voiceListening: false,
    sides: {
      [config.match.playerId]: createSide(config.match.playerId, config.text.playerName, config.text.playerElement),
      [config.match.aiId]: createSide(config.match.aiId, config.text.aiName, config.text.aiElement)
    }
  };
}

export function resetGameState(state, config = CONFIG) {
  const fresh = createInitialGameState(config);
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, fresh);
  return state;
}

export function getSide(state, sideId) {
  return state.sides[sideId];
}

export function getOpponentId(sideId, config = CONFIG) {
  return sideId === config.match.playerId ? config.match.aiId : config.match.playerId;
}

export function getOpponent(state, sideId, config = CONFIG) {
  return getSide(state, getOpponentId(sideId, config));
}

export function clampHp(hp, config = CONFIG) {
  return Math.max(config.match.minHp, Math.min(config.match.startingHp, hp));
}

export function markDefeatedSides(state, config = CONFIG) {
  Object.values(state.sides).forEach((side) => {
    side.defeated = side.hp <= config.match.minHp;
    if (side.defeated) {
      side.actionLabel = config.combat.defeatedLabel;
      side.actionLabelSeconds = config.match.minHp;
      side.failedLabelSeconds = config.match.minHp;
    }
  });
}

export function getVisibleStateLabel(side, config = CONFIG) {
  if (side.defeated) return config.combat.defeatedLabel;
  if (side.failedLabelSeconds > config.match.minHp) return side.actionLabel;
  if (side.activeBlockSeconds > config.match.minHp) return config.actions.block.label;
  if (side.activeDefenceSeconds > config.match.minHp) return config.actions.defence.label;
  if (side.actionLabelSeconds > config.match.minHp) return side.actionLabel;
  return config.combat.idleLabel;
}
