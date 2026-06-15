import { CONFIG } from '../config.js';

export function resolveIncomingDamage(baseDamage, target, config = CONFIG) {
  if (target.activeBlockSeconds > config.match.minHp) {
    return {
      finalDamage: baseDamage * config.combat.blockDamageMultiplier,
      preventedBy: config.actions.block.label
    };
  }

  if (target.activeDefenceSeconds > config.match.minHp) {
    return {
      finalDamage: baseDamage * config.combat.defenceDamageMultiplier,
      preventedBy: config.actions.defence.label
    };
  }

  return {
    finalDamage: baseDamage,
    preventedBy: null
  };
}

export function normalizeDamageAmount(amount, config = CONFIG) {
  if (config.combat.hpRoundingMode === 'round') return Math.round(amount);
  if (config.combat.hpRoundingMode === 'floor') return Math.floor(amount);
  if (config.combat.hpRoundingMode === 'ceil') return Math.ceil(amount);
  return amount;
}
