import { CONFIG } from '../config.js';
import { showMatchPreview } from '../core/stateMachine.js';
import { addPointToPattern, analyzePattern, generateRandomPattern } from '../spells/patternAnalyzer.js';
import { createSpell, normalizeSpellName } from '../spells/spellFactory.js';
import { nextOpenSlotIndex, validateLoadout, validateSpellName } from '../spells/spellLoadout.js';
import { formatPatternSummary, getSpellEffectPreview } from '../spells/spellRules.js';
import { createSeededRandom } from '../core/random.js';

export function refreshPreparationPreview(state, logger, config = CONFIG) {
  const analysis = analyzePattern(state.preparation.draftPatternPoints, config);
  state.preparation.draftAnalysis = analysis;
  state.preparation.patternSummary = formatPatternSummary(analysis, config);
  state.preparation.effectPreview = getSpellEffectPreview(state.preparation.selectedSpellType, analysis, config);
  logger?.info('Pattern analyzed', analysis);
  return analysis;
}

export function addPatternPoint(state, pointId, logger, config = CONFIG) {
  const nextPoints = addPointToPattern(state.preparation.draftPatternPoints, pointId, config);
  state.preparation.draftPatternPoints = nextPoints;
  logger?.info('Pattern point added', { pointId, points: nextPoints });
  return refreshPreparationPreview(state, logger, config);
}

export function clearDraftPattern(state, logger, config = CONFIG) {
  state.preparation.draftPatternPoints = [];
  state.preparation.feedback = config.text.prepReadyFeedback;
  logger?.info('Pattern cleared');
  return refreshPreparationPreview(state, logger, config);
}

export function randomizeDraftPattern(state, random, logger, config = CONFIG) {
  state.preparation.draftPatternPoints = generateRandomPattern(random, config);
  state.preparation.feedback = config.text.prepReadyFeedback;
  logger?.info('Pattern generated', { points: state.preparation.draftPatternPoints });
  return refreshPreparationPreview(state, logger, config);
}

export function selectSpellType(state, spellType, logger, config = CONFIG) {
  if (!config.spells.types.includes(spellType)) return false;
  state.preparation.selectedSpellType = spellType;
  logger?.info('Spell type selected', { spellType });
  refreshPreparationPreview(state, logger, config);
  return true;
}

export function cycleDraftName(state, logger, config = CONFIG) {
  state.preparation.nameCycleIndex = (state.preparation.nameCycleIndex + config.patterns.firstPointId) % config.spells.nameCycle.length;
  state.preparation.draftSpellName = config.spells.nameCycle[state.preparation.nameCycleIndex];
  state.preparation.feedback = config.text.prepReadyFeedback;
  logger?.info('Spell name cycled', { name: state.preparation.draftSpellName });
  return state.preparation.draftSpellName;
}

export function setDraftName(state, name, logger, config = CONFIG) {
  state.preparation.draftSpellName = normalizeSpellName(name);
  state.preparation.feedback = config.text.prepReadyFeedback;
  logger?.info('Spell renamed', { name: state.preparation.draftSpellName });
}

export function editDraftName(state, key, logger, config = CONFIG) {
  if (!state.preparation.nameFieldFocused) return false;
  if (key === 'Backspace') {
    setDraftName(state, state.preparation.draftSpellName.slice(config.match.minHp, -config.patterns.firstPointId), logger, config);
    return true;
  }
  if (key === ' ') {
    setDraftName(state, `${state.preparation.draftSpellName} `, logger, config);
    return true;
  }
  if (/^[a-z]$/i.test(key)) {
    setDraftName(state, `${state.preparation.draftSpellName}${key}`, logger, config);
    return true;
  }
  return false;
}

export function saveDraftSpell(state, logger, config = CONFIG) {
  const analysis = refreshPreparationPreview(state, logger, config);
  if (analysis.connectionCount < config.patterns.lightMinConnections) {
    state.preparation.feedback = config.text.patternRejectedFeedback;
    logger?.warn('Spell rejected', { reason: state.preparation.feedback });
    return { ok: false, reason: state.preparation.feedback };
  }

  const validation = validateSpellName(state.preparation.draftSpellName, state.sides[config.match.playerId].spellLoadout, config);
  if (!validation.ok) {
    state.preparation.feedback = validation.reason;
    logger?.warn('Spell rejected', { reason: validation.reason });
    return validation;
  }

  const slotIndex = nextOpenSlotIndex(state.sides[config.match.playerId].spellLoadout);
  if (slotIndex === null) {
    state.preparation.feedback = config.text.loadoutReadyFeedback;
    return { ok: false, reason: state.preparation.feedback };
  }

  const spell = createSpell({
    name: state.preparation.draftSpellName,
    type: state.preparation.selectedSpellType,
    patternPoints: state.preparation.draftPatternPoints
  }, config);
  spell.filled = true;
  state.sides[config.match.playerId].spellLoadout[slotIndex] = spell;
  state.preparation.selectedSlotIndex = Math.min(slotIndex + config.patterns.firstPointId, config.spells.perLoadout - config.patterns.firstPointId);
  state.preparation.feedback = `${config.text.spellSavedFeedback} ${spell.name}`;
  logger?.info('Spell saved', { slotIndex, spell });
  return { ok: true, reason: config.combat.successReason, spell, slotIndex };
}

export function confirmLoadout(state, logger, config = CONFIG) {
  const validation = validateLoadout(state.sides[config.match.playerId].spellLoadout, config);
  state.preparation.feedback = validation.reason;
  if (!validation.ok) {
    logger?.warn('Loadout confirmation blocked', validation);
    return validation;
  }

  state.preparation.loadoutConfirmed = true;
  logger?.info('Loadout confirmed');
  showMatchPreview(state, logger, config);
  return validation;
}

/**
 * Selects a random spell type from the available types.
 * @param {Object} state - Game state
 * @param {Function} random - Random number generator (0 to 1)
 * @param {Function} logger - Logger instance
 * @param {Object} config - Configuration
 * @returns {string} The selected spell type
 */
export function randomizeSpellType(state, random, logger, config = CONFIG) {
  const randomIndex = Math.floor(random() * config.spells.types.length);
  const spellType = config.spells.types[randomIndex];
  selectSpellType(state, spellType, logger, config);
  logger?.info('Random spell type selected', { spellType, index: randomIndex });
  return spellType;
}

/**
 * Auto-generates and saves all 5 spells with random patterns, types, and names.
 * Used for rapid testing—equivalent to 5x (randomize pattern + random type + cycle name + save).
 * @param {Object} state - Game state
 * @param {Function} logger - Logger instance
 * @param {Object} config - Configuration
 * @returns {Object} { ok: boolean, count: number }
 */
export function prepareAllSpells(state, logger, config = CONFIG) {
  const random = createSeededRandom(config.ai.defaultSeed);
  const loadout = state.sides[config.match.playerId].spellLoadout;
  let savedCount = 0;

  for (let i = 0; i < config.spells.perLoadout; i++) {
    // Reset draft for each spell
    state.preparation.draftPatternPoints = [];

    // Randomize pattern
    randomizeDraftPattern(state, random, logger, config);

    // Pick random spell type
    randomizeSpellType(state, random, logger, config);

    // Cycle name to next one
    cycleDraftName(state, logger, config);

    // Save the spell
    const result = saveDraftSpell(state, logger, config);
    if (result.ok) {
      savedCount++;
      logger?.info(`Auto-spell ${i + 1}/${config.spells.perLoadout} saved`, result.spell);
    } else {
      logger?.warn(`Auto-spell ${i + 1} failed`, { reason: result.reason });
    }
  }

  state.preparation.feedback = `All 5 spells prepared and ready!`;
  logger?.info('Prepare all spells complete', { savedCount });
  return { ok: savedCount === config.spells.perLoadout, count: savedCount };
}
