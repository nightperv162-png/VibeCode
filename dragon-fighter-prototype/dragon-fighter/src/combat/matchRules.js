import { CONFIG } from '../config.js';
import { clampHp, getOpponent, getSide, markDefeatedSides } from '../core/gameState.js';
import { getActionByCommand } from './actions.js';
import { isActionReady, startCooldown } from './cooldowns.js';
import { normalizeDamageAmount, resolveIncomingDamage } from './damageResolver.js';

function addHitEffect(state, targetSideId, amount, preventedBy, config) {
  state.hitEffects.push({
    sideId: targetSideId,
    amount,
    preventedBy,
    seconds: config.animation.hitTextSeconds
  });
}

function addProjectileEffect(state, actorId, targetId, actionId, config) {
  state.projectileEffects.push({
    actorId,
    targetId,
    actionId,
    seconds: config.animation.projectileSeconds
  });
}

export function attemptCommand(state, actorId, rawCommand, source, logger, config = CONFIG) {
  const actor = getSide(state, actorId);
  const actionId = getActionByCommand(rawCommand, config);
  const shownCommand = actionId ? config.actions[actionId].command : String(rawCommand || config.combat.unknownCommandReason);
  actor.latestCommand = shownCommand;

  logger?.info('Input received', { actorId, source, rawCommand, normalizedAction: actionId });

  if (!actionId) {
    return failCommand(actor, config.combat.unknownCommandReason, logger, { actorId, rawCommand });
  }

  if (state.phase !== config.match.activePhase) {
    return failCommand(actor, config.combat.inactiveReason, logger, { actorId, actionId });
  }

  if (actor.defeated) {
    return failCommand(actor, config.combat.defeatedReason, logger, { actorId, actionId });
  }

  if (!isActionReady(actor, actionId, config)) {
    return failCommand(actor, config.combat.cooldownReason, logger, { actorId, actionId, remaining: actor.cooldowns[actionId] });
  }

  return executeAction(state, actorId, actionId, logger, config);
}

export function failCommand(actor, reason, logger, details, config = CONFIG) {
  actor.latestReason = reason;
  actor.actionLabel = reason === config.combat.cooldownReason ? config.combat.cooldownLabel : reason;
  actor.failedLabelSeconds = config.combat.failedFeedbackSeconds;
  logger?.warn('Command failed', { reason, ...details });
  return { ok: false, reason };
}

export function executeAction(state, actorId, actionId, logger, config = CONFIG) {
  const actor = getSide(state, actorId);
  const target = getOpponent(state, actorId, config);
  const action = config.actions[actionId];

  startCooldown(actor, actionId, config);
  actor.actionLabel = action.label;
  actor.actionLabelSeconds = action.displaySeconds ?? action.activeSeconds ?? config.combat.failedFeedbackSeconds;
  actor.failedLabelSeconds = config.match.minHp;
  actor.latestReason = config.combat.successReason;
  actor.lastSuccessfulAction = actionId;

  if (action.type === config.actions.defence.type) {
    actor.activeDefenceSeconds = action.activeSeconds;
  }

  if (action.type === config.actions.block.type) {
    actor.activeBlockSeconds = action.activeSeconds;
  }

  let damageReport = null;
  if (action.type === config.actions.attack.type && action.damage > config.match.minHp) {
    const resolved = resolveIncomingDamage(action.damage, target, config);
    const finalDamage = normalizeDamageAmount(resolved.finalDamage, config);
    target.hp = clampHp(target.hp - finalDamage, config);
    damageReport = { baseDamage: action.damage, finalDamage, preventedBy: resolved.preventedBy };
    addHitEffect(state, target.id, finalDamage, resolved.preventedBy, config);
    addProjectileEffect(state, actorId, target.id, actionId, config);
    if (finalDamage > config.match.minHp) state.shakeRemaining = config.animation.shakeSeconds;
  }

  markDefeatedSides(state, config);
  logger?.info('Action executed', { actorId, actionId, targetId: target.id, damageReport, hp: target.hp });
  return { ok: true, reason: config.combat.successReason, actionId, damageReport };
}

export function chooseResult(state, config = CONFIG) {
  const player = state.sides[config.match.playerId];
  const ai = state.sides[config.match.aiId];

  if (player.hp <= config.match.minHp && ai.hp <= config.match.minHp) {
    return { label: config.match.drawLabel, reason: 'Both sides were defeated.' };
  }

  if (ai.hp <= config.match.minHp) {
    return { label: config.match.winLabel, reason: 'The AI dragon was defeated.' };
  }

  if (player.hp <= config.match.minHp) {
    return { label: config.match.loseLabel, reason: 'Player 1 dragon was defeated.' };
  }

  if (state.matchRemaining <= config.match.minHp) {
    if (player.hp === ai.hp) return { label: config.match.drawLabel, reason: 'Time expired with equal HP.' };
    if (player.hp > ai.hp) return { label: config.match.winLabel, reason: 'Time expired and Player 1 had more HP.' };
    return { label: config.match.loseLabel, reason: 'Time expired and the AI had more HP.' };
  }

  return null;
}

export function endMatchIfNeeded(state, logger, config = CONFIG) {
  markDefeatedSides(state, config);
  const result = chooseResult(state, config);
  if (!result) return false;
  state.phase = config.match.resultPhase;
  state.result = result.label;
  state.resultReason = result.reason;
  logger?.info('Match ended', result);
  return true;
}
