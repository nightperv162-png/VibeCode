import { CONFIG } from '../config.js';
import { log } from '../core/logger.js';

/**
 * Validates whether a spell cast is allowed based on actor state, match state, and spell readiness.
 * Does not apply effects or consume resources; purely checks preconditions.
 *
 * @param {Object} actor - The casting actor (must have hp, energy, cooldowns, etc.).
 * @param {Object} spell - The spell object (must have name, type, cost, weight, etc.).
 * @param {Object} matchState - Current match state (phase, actor states, timers, etc.).
 * @param {Object} config - Configuration object (CONFIG).
 * @returns {Object} { success: boolean, reason: string }. Success reasons are not included;
 *                   only failures have a reason. On success, reason is null or undefined.
 */
export function validateSpellCast(actor, spell, matchState, config = CONFIG) {
  // Check actor exists and is not defeated
  if (!actor) {
    return { success: false, reason: 'actor_not_found' };
  }
  if (actor.defeated) {
    return { success: false, reason: 'actor_defeated' };
  }

  // Check match is in active phase
  if (matchState.phase !== config.states.active) {
    return { success: false, reason: 'match_inactive' };
  }

  // Check spell exists
  if (!spell) {
    return { success: false, reason: 'spell_not_found' };
  }

  // Check actor has enough energy
  const spellCost = spell.energyCost || 0;
  if (actor.energy < spellCost) {
    return { success: false, reason: 'not_enough_energy' };
  }

  // Check spell cooldown is ready (remaining cooldown <= 0)
  const spellCooldownRemaining = spell.cooldownRemaining || 0;
  if (spellCooldownRemaining > 0) {
    return { success: false, reason: 'cooldown_active' };
  }

  // All checks passed
  return { success: true };
}

/**
 * Applies a spell cast: deducts energy, starts cooldown, prepares effect data.
 * Does NOT apply the effect itself; that is the caller's responsibility.
 * Logs the cast attempt.
 *
 * @param {Object} actor - The casting actor.
 * @param {Object} spell - The spell object.
 * @param {Object} matchState - Current match state.
 * @param {number} cooldownMultiplier - Multiplier for cooldown (e.g., 1.0 for voice, 1.5 for button).
 * @param {Object} config - Configuration object (CONFIG).
 * @returns {Object} { success: boolean, reason: string, energySpent: number, cooldownSet: number }
 */
export function applyCast(actor, spell, matchState, cooldownMultiplier = 1.0, config = CONFIG) {
  // Validate first
  const validation = validateSpellCast(actor, spell, matchState, config);
  if (!validation.success) {
    log(`Cast failed: ${actor.id} tried ${spell.name || 'unknown'} - Reason: ${validation.reason}`, {
      category: 'combat'
    });
    return { success: false, reason: validation.reason };
  }

  // Deduct energy
  const energyCost = spell.energyCost || 0;
  const energyBefore = actor.energy;
  actor.energy = Math.max(config.match.minEnergy, actor.energy - energyCost);
  const energySpent = energyBefore - actor.energy;

  // Set cooldown
  const baseCooldown = spell.baseCooldown || 2; // Default 2 seconds if not specified
  const cooldownDuration = baseCooldown * cooldownMultiplier;
  spell.cooldownRemaining = cooldownDuration;

  log(`Cast success: ${actor.id} cast ${spell.name || 'spell'}`, {
    category: 'combat',
    actor: actor.id,
    spell: spell.name,
    energyBefore,
    energyAfter: actor.energy,
    energySpent,
    cooldownSet: cooldownDuration
  });

  return {
    success: true,
    energySpent,
    cooldownSet: cooldownDuration
  };
}
