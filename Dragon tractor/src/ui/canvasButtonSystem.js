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
  if (action.action === 'drawingPlaceholder') {
    logger?.input('drawing placeholder completed', { screen: state.activeScreen });
    return {
      ...state,
      contractCreation: { ...state.contractCreation, hasDrawing: true },
      loadoutDetailsOverlay: null
    };
  }
  if (action.action === 'redrawContract') {
    logger?.input('contract redraw placeholder', { screen: state.activeScreen });
    return {
      ...state,
      contractCreation: { ...state.contractCreation, hasDrawing: false },
      loadoutDetailsOverlay: null
    };
  }
  if (action.action === 'saveContract') {
    const contract = state.contractCreation.analysisContract;
    const library = state.contractLibrary.some((item) => item.id === contract.id)
      ? state.contractLibrary
      : [contract, ...state.contractLibrary];
    logger?.input('contract saved placeholder', { contractId: contract.id });
    return transitionTo({
      ...state,
      contractLibrary: library,
      equippedSlots: state.equippedSlots.map((slot, index) => index === config.numbers.firstSlotIndex ? {
        ...slot,
        contractId: contract.id,
        resolvedCallName: contract.callName,
        energyCost: Number.parseInt(contract.cost, config.numbers.decimalRadix),
        detailsContract: contract
      } : slot)
    }, config.states.loadout, config, logger);
  }
  if (action.action === 'showLoadoutDetails') {
    const contract = action.source === 'library'
      ? state.contractLibrary[action.itemIndex]
      : state.equippedSlots[action.slotIndex]?.detailsContract || state.contractLibrary[0];
    logger?.loadout('loadout details opened', { source: action.source, contractId: contract?.id || null });
    return {
      ...state,
      loadoutDetailsOverlay: contract ? {
        source: action.source,
        contract,
        currentCallName: action.source === 'slot' ? state.equippedSlots[action.slotIndex]?.resolvedCallName : contract.callName
      } : null
    };
  }
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

export function handleCanvasHover(state, point, config = CONFIG, logger) {
  if (state.activeScreen !== config.states.loadout || state.isGuideOpen) return state;
  const regions = createHitRegions(state, config);
  const hit = findHitRegion(point, regions);
  if (hit?.action === 'showLoadoutDetails') return resolveCanvasAction(state, hit, config, logger);
  if (state.loadoutDetailsOverlay) {
    logger?.loadout('loadout details closed', { reason: 'hover-away' });
    return { ...state, loadoutDetailsOverlay: null };
  }
  return state;
}
