import { ACTION_IDS, CONFIG } from '../config.js';
import { analyzePattern } from '../spells/patternAnalyzer.js';
import { createEmptySpellSlot } from '../spells/spellLoadout.js';
import { formatPatternSummary, getSpellEffectPreview } from '../spells/spellRules.js';

function createCooldownMap() {
  return Object.fromEntries(ACTION_IDS.map((actionId) => [actionId, CONFIG.match.minHp]));
}

function createSpellLoadout(names, config) {
  return names.map((name, index) => {
    const spell = createEmptySpellSlot(index, config);
    // Initialize spell combat properties
    spell.cooldownRemaining = 0; // Ready from start
    spell.baseCooldown = 2; // Default 2 second cooldown
    return spell;
  });
}

function createSide(id, name, element, spellNames, config) {
  return {
    id,
    name,
    element,
    hp: CONFIG.match.startingHp,
    energy: config.match.startingEnergy,
    maxEnergy: config.match.maxEnergy,
    spellLoadout: createSpellLoadout(spellNames, config),
    cooldowns: createCooldownMap(),
    activeDefenceSeconds: CONFIG.match.minHp,
    activeBlockSeconds: CONFIG.match.minHp,
    actionLabel: CONFIG.combat.idleLabel,
    actionLabelSeconds: CONFIG.match.minHp,
    failedLabelSeconds: CONFIG.match.minHp,
    latestCommand: id === CONFIG.match.aiId ? CONFIG.text.noAiCommand : CONFIG.text.noPlayerCommand,
    latestReason: '',
    lastSuccessfulAction: null,
    defeated: false,
    // Spell combat properties
    shield: 0,
    shieldExpiryTime: 0,
    slowActive: 0,
    utilityBonusActive: 0,
    latestFeedback: '',
    latestFeedbackTime: 0
  };
}

export function createInitialGameState(config = CONFIG) {
  const initialPattern = [];
  const initialAnalysis = analyzePattern(initialPattern, config);
  return {
    phase: config.states.preparation,
    previousPhase: null,
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
    preparation: {
      selectedSpellType: config.spells.types[config.match.minHp],
      draftSpellName: config.spells.defaultPlayerNames[config.match.minHp],
      draftPatternPoints: initialPattern,
      draftAnalysis: initialAnalysis,
      patternSummary: formatPatternSummary(initialAnalysis, config),
      effectPreview: getSpellEffectPreview(config.spells.types[config.match.minHp], initialAnalysis, config),
      feedback: config.text.prepReadyFeedback,
      nameCycleIndex: config.match.minHp,
      selectedSlotIndex: config.match.minHp,
      nameFieldFocused: false,
      loadoutConfirmed: false
    },
    sides: {
      [config.match.playerId]: createSide(config.match.playerId, config.text.playerName, config.text.playerElement, config.spells.defaultPlayerNames, config),
      [config.match.aiId]: createSide(config.match.aiId, config.text.aiName, config.text.aiElement, config.spells.defaultAiNames, config)
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

/**
 * Regenerates energy for an actor each frame.
 * Accounts for utility bonus if active.
 * @param {Object} actor - The actor to regen energy for.
 * @param {number} deltaSeconds - Time elapsed since last update.
 * @param {Object} config - Configuration object.
 */
export function regenEnergy(actor, deltaSeconds, config = CONFIG) {
  if (!actor || !config.match) {
    return;
  }

  // Base regen rate
  let regenPerSecond = config.match.energyRegenPerSecond;

  // Add bonus regen if utility is active
  if (actor.utilityBonusActive && actor.utilityBonusActive > 0) {
    regenPerSecond += 2; // Bonus energy per second (configurable in future)
  }

  // Apply regen
  const regenAmount = regenPerSecond * deltaSeconds;
  actor.energy = Math.min(
    config.match.maxEnergy,
    actor.energy + regenAmount
  );
}

/**
 * Updates all active effect durations for an actor.
 * @param {Object} actor - The actor to update.
 * @param {number} deltaSeconds - Time elapsed.
 * @param {Object} config - Configuration object.
 */
export function updateActorEffects(actor, deltaSeconds, config = CONFIG) {
  if (!actor) {
    return;
  }

  // Update shield expiry
  if (actor.shieldExpiryTime && typeof actor.shieldExpiryTime === 'number') {
    actor.shieldExpiryTime = Math.max(0, actor.shieldExpiryTime - deltaSeconds);
    if (actor.shieldExpiryTime <= 0) {
      actor.shield = 0;
    }
  }

  // Update slow effect
  if (actor.slowActive && typeof actor.slowActive === 'number') {
    actor.slowActive = Math.max(0, actor.slowActive - deltaSeconds);
  }

  // Update utility bonus regen
  if (actor.utilityBonusActive && typeof actor.utilityBonusActive === 'number') {
    actor.utilityBonusActive = Math.max(0, actor.utilityBonusActive - deltaSeconds);
  }

  // Update latest feedback timer
  if (actor.latestFeedbackTime && typeof actor.latestFeedbackTime === 'number') {
    actor.latestFeedbackTime = Math.max(0, actor.latestFeedbackTime - deltaSeconds);
  }
}

export function getVisibleStateLabel(side, config = CONFIG) {
  if (side.defeated) return config.combat.defeatedLabel;
  if (side.failedLabelSeconds > config.match.minHp) return side.actionLabel;
  if (side.activeBlockSeconds > config.match.minHp) return config.actions.block.label;
  if (side.activeDefenceSeconds > config.match.minHp) return config.actions.defence.label;
  if (side.actionLabelSeconds > config.match.minHp) return side.actionLabel;
  return config.combat.idleLabel;
}
