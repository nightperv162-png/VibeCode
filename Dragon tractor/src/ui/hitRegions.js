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
  }

  if (state.isGuideOpen) {
    regions.push({ id: 'closeGuide', action: 'closeGuide', rect: config.layout.guideOverlayRect, label: 'Close Guide' });
  }

  return regions;
}

export function findHitRegion(point, regions) {
  return [...regions].reverse().find((region) => pointInRect(point, region.rect)) || null;
}
