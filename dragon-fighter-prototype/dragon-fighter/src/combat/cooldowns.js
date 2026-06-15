import { ACTION_IDS, CONFIG } from '../config.js';

export function isActionReady(side, actionId, config = CONFIG) {
  return (side.cooldowns[actionId] ?? config.match.minHp) <= config.match.minHp;
}

export function startCooldown(side, actionId, config = CONFIG) {
  side.cooldowns[actionId] = config.actions[actionId].cooldownSeconds;
}

export function updateCooldowns(side, deltaSeconds, config = CONFIG) {
  ACTION_IDS.forEach((actionId) => {
    side.cooldowns[actionId] = Math.max(config.match.minHp, side.cooldowns[actionId] - deltaSeconds);
  });
}

export function updateActiveActionTimers(side, deltaSeconds, config = CONFIG) {
  side.activeDefenceSeconds = Math.max(config.match.minHp, side.activeDefenceSeconds - deltaSeconds);
  side.activeBlockSeconds = Math.max(config.match.minHp, side.activeBlockSeconds - deltaSeconds);
  side.actionLabelSeconds = Math.max(config.match.minHp, side.actionLabelSeconds - deltaSeconds);
  side.failedLabelSeconds = Math.max(config.match.minHp, side.failedLabelSeconds - deltaSeconds);
}
