import { clampHp, resolveIncomingDamage } from './damageResolver.js';
import { applyResultIfNeeded } from './matchRules.js';
import { normalizeCommand } from '../input/inputMapper.js';

export function getActionDefinition(config, command) {
  const actionDefinitions = {
    [config.actions.attackCommandWord]: {
      command: config.actions.attackCommandWord,
      damage: config.actions.attackDamage,
      cooldownSeconds: config.actions.attackCooldownSeconds,
      stateDurationSeconds: config.actions.attackStateDurationSeconds,
      activeDurationSeconds: config.math.zero
    },
    [config.actions.defenceCommandWord]: {
      command: config.actions.defenceCommandWord,
      damage: config.math.zero,
      cooldownSeconds: config.actions.defenceCooldownSeconds,
      stateDurationSeconds: config.actions.defenceDurationSeconds,
      activeDurationSeconds: config.actions.defenceDurationSeconds
    },
    [config.actions.blockCommandWord]: {
      command: config.actions.blockCommandWord,
      damage: config.math.zero,
      cooldownSeconds: config.actions.blockCooldownSeconds,
      stateDurationSeconds: config.actions.blockDurationSeconds,
      activeDurationSeconds: config.actions.blockDurationSeconds
    },
    [config.actions.skillCommandWord]: {
      command: config.actions.skillCommandWord,
      damage: config.actions.skillDamage,
      cooldownSeconds: config.actions.skillCooldownSeconds,
      stateDurationSeconds: config.actions.skillStateDurationSeconds,
      activeDurationSeconds: config.math.zero
    }
  };

  return actionDefinitions[command] ?? null;
}

export function attemptCommand(state, config, actorId, rawCommand) {
  const command = normalizeCommand(config, rawCommand);

  if (!command) {
    return applyFailure(state, config, actorId, config.labels.unknownCommandReason);
  }

  if (state.phase !== config.match.activeCombatPhase) {
    return applyFailure(state, config, actorId, config.labels.inactiveReason);
  }

  const actor = state.players[actorId];
  const targetId = actorId === 'player1' ? 'player2' : 'player1';
  const target = state.players[targetId];
  const action = getActionDefinition(config, command);

  if (actor.hp <= config.match.minHp) {
    return applyFailure(state, config, actorId, config.labels.defeatedReason, command);
  }

  if (actor.cooldowns[command] > config.math.zero) {
    return applyFailure(state, config, actorId, config.labels.cooldownReason, command);
  }

  const nextActor = {
    ...actor,
    cooldowns: {
      ...actor.cooldowns,
      [command]: action.cooldownSeconds
    },
    activeEffects: {
      ...actor.activeEffects,
      [command]: action.activeDurationSeconds
    },
    stateLabel: command,
    stateLabelSeconds: action.stateDurationSeconds
  };
  let nextTarget = target;

  if (action.damage > config.math.zero) {
    const resolvedDamage = resolveIncomingDamage(config, target, action.damage);
    const nextHp = clampHp(config, target.hp - resolvedDamage);
    nextTarget = {
      ...target,
      hp: nextHp,
      stateLabel: nextHp <= config.match.minHp ? config.labels.defeatedState : target.stateLabel
    };
  }

  const nextState = {
    ...state,
    players: {
      ...state.players,
      [actorId]: nextActor,
      [targetId]: nextTarget
    },
    ai: {
      ...state.ai,
      defensiveReactionSeconds: actorId === 'player1' && command === config.actions.skillCommandWord
        ? config.ai.defensiveReactionWindowSeconds
        : state.ai.defensiveReactionSeconds
    },
    latestPlayerCommand: actorId === 'player1' ? command : state.latestPlayerCommand,
    latestAiCommand: actorId === 'player2' ? command : state.latestAiCommand,
    lastCommandResult: {
      actorId,
      command,
      success: true,
      reason: config.labels.successReason
    }
  };

  return applyResultIfNeeded(nextState, config);
}

function applyFailure(state, config, actorId, reason, command = null) {
  return {
    ...state,
    latestPlayerCommand: actorId === 'player1' ? reason : state.latestPlayerCommand,
    latestAiCommand: actorId === 'player2' ? reason : state.latestAiCommand,
    players: {
      ...state.players,
      [actorId]: {
        ...state.players[actorId],
        stateLabel: reason,
        stateLabelSeconds: config.input.unknownCommandDisplaySeconds
      }
    },
    lastCommandResult: {
      actorId,
      command,
      success: false,
      reason
    }
  };
}
