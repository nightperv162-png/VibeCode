import { CONFIG } from '../config.js';

export function pointInRect(point, rect) {
  return point.x >= rect.x
    && point.x <= rect.x + rect.width
    && point.y >= rect.y
    && point.y <= rect.y + rect.height;
}

export function createHitRegions(state, config = CONFIG) {
  const regions = [
    { id: 'guide', action: 'openGuide', rect: config.layout.guideButtonRect, label: config.labels.guideButton },
    { id: 'previousScreen', action: 'previousScreen', rect: config.layout.prevButtonRect, label: config.labels.previousButton },
    { id: 'nextScreen', action: 'nextScreen', rect: config.layout.nextButtonRect, label: config.labels.nextButton }
  ];

  if (state.activeScreen === config.states.combat) {
    regions.push({ id: 'pause', action: 'pause', rect: config.layout.pauseButtonRect, label: config.labels.pauseButton });
    config.layout.combatSlotRects.forEach((rect, index) => {
      regions.push({
        id: `combatSlot-${index}`,
        action: 'selectCombatSlot',
        rect,
        slotIndex: index,
        label: config.contracts.slotMarkerLabels[index]
      });
    });
  }

  if (state.activeScreen === config.states.contractCreation) {
    regions.push({ id: 'drawingArea', action: 'drawingPlaceholder', rect: config.layout.drawingAreaRect, label: config.labels.drawSigil });
    if (state.contractCreation.hasDrawing) {
      regions.push({ id: 'saveContract', action: 'saveContract', rect: config.layout.saveContractButtonRect, label: config.labels.saveContract });
      regions.push({ id: 'redrawContract', action: 'redrawContract', rect: config.layout.redrawButtonRect, label: config.labels.redraw });
      regions.push({ id: 'rerollCallName', action: 'rerollPlaceholder', rect: config.layout.rerollButtonRect, label: config.labels.reroll });
    }
  }

  if (state.activeScreen === config.states.loadout) {
    config.layout.libraryItemRects.forEach((rect, index) => {
      regions.push({
        id: `libraryItem-${index}`,
        action: 'showLoadoutDetails',
        rect,
        source: 'library',
        itemIndex: index,
        label: config.labels.contractDetails
      });
    });
    config.layout.loadoutSlotRects.forEach((rect, index) => {
      regions.push({
        id: `loadoutSlot-${index}`,
        action: 'showLoadoutDetails',
        rect,
        source: 'slot',
        slotIndex: index,
        label: config.labels.contractDetails
      });
    });
  }

  if (state.isGuideOpen) {
    regions.push({ id: 'closeGuide', action: 'closeGuide', rect: config.layout.guideOverlayRect, label: 'Close Guide' });
  }

  return regions;
}

export function findHitRegion(point, regions) {
  return [...regions].reverse().find((region) => pointInRect(point, region.rect)) || null;
}
