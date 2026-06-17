import { CONFIG } from '../config.js';
import { closeGuide, moveScreen, openGuide, transitionTo } from '../core/stateMachine.js';
import { createHitRegions, findHitRegion } from './hitRegions.js';

export function resolveCanvasAction(state, action, config = CONFIG, logger) {
  if (!action) return state;
  if (action.action === 'openGuide') return openGuide(state, logger);
  if (action.action === 'closeGuide') return closeGuide(state, logger);
  if (action.action === 'previousScreen') return moveScreen(state, -config.process.failureStatus, config, logger);
  if (action.action === 'nextScreen') return moveScreen(state, config.process.failureStatus, config, logger);
  if (action.action === 'pause') return transitionTo(state, config.states.pause, config, logger);
  if (action.action === 'selectCombatSlot') {
    const slot = state.equippedSlots[action.slotIndex];
    logger?.input('combat slot selected', { slot: slot?.markerLabel });
    return { ...state, latestInput: slot?.resolvedCallName || null };
  }
  logger?.input('placeholder action', { action: action.action });
  return { ...state, latestInput: action.label };
}

export function handleCanvasPointer(state, point, config = CONFIG, logger) {
  const regions = createHitRegions(state, config);
  const hit = findHitRegion(point, regions);
  logger?.input('canvas pointer', { point, hit: hit?.id || null });
  return resolveCanvasAction(state, hit, config, logger);
}
