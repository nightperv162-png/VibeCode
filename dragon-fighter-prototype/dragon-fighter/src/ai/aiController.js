import { CONFIG } from '../config.js';
import { commandTextForAction } from '../combat/actions.js';
import { isActionReady } from '../combat/cooldowns.js';
import { attemptCommand } from '../combat/matchRules.js';

export function chooseAiAction(state, random = Math.random, config = CONFIG) {
  const ai = state.sides[config.match.aiId];
  const player = state.sides[config.match.playerId];

  if (state.phase !== config.match.activePhase || ai.defeated) return null;

  const blockReady = isActionReady(ai, 'block', config);
  const defenceReady = isActionReady(ai, 'defence', config);
  const attackReady = isActionReady(ai, 'attack', config);
  const skillReady = isActionReady(ai, 'skill', config);

  if (player.lastSuccessfulAction === 'skill') {
    if (blockReady && random() < config.ai.blockChanceAgainstSkill) return 'block';
    if (defenceReady) return 'defence';
    if (blockReady) return 'block';
  }

  if (skillReady && random() < config.ai.skillChanceWhenReady) return 'skill';
  if (attackReady) return 'attack';
  if (defenceReady && random() < config.ai.defenceChance) return 'defence';
  if (blockReady) return 'block';
  if (defenceReady) return 'defence';
  return null;
}

export function updateAi(state, deltaSeconds, random, logger, config = CONFIG) {
  if (state.phase !== config.match.activePhase) return null;
  const ai = state.sides[config.match.aiId];
  if (ai.defeated) return null;

  state.aiActionTimer -= deltaSeconds;
  if (state.aiActionTimer > config.match.minHp) return null;

  state.aiActionTimer = config.ai.actionIntervalSeconds;
  const actionId = chooseAiAction(state, random, config);
  if (!actionId) {
    ai.latestCommand = config.ai.waitingLabel;
    logger?.info('AI skipped action because no action was available');
    return null;
  }

  const command = commandTextForAction(actionId, config);
  logger?.info('AI selected action', { actionId, command });
  return attemptCommand(state, config.match.aiId, command, 'ai', logger, config);
}
