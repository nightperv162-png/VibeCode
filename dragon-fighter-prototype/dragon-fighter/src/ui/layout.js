import { ACTION_IDS, CONFIG } from '../config.js';

export function centeredX(width, config = CONFIG) {
  return (config.canvas.width - width) / config.match.sideCount;
}

export function getPreparationRects(config = CONFIG) {
  return {
    eggDrawing: {
      x: config.layout.eggDrawingX,
      y: config.layout.eggDrawingY,
      width: config.layout.eggDrawingWidth,
      height: config.layout.eggDrawingHeight
    },
    forgePanel: {
      x: config.layout.forgePanelX,
      y: config.layout.forgePanelY,
      width: config.layout.forgePanelWidth,
      height: config.layout.forgePanelHeight
    },
    spellSlots: {
      x: config.layout.spellSlotsX,
      y: config.layout.spellSlotsY,
      width: config.layout.spellSlotsWidth,
      height: config.layout.spellSlotsHeight
    },
    randomPatternButton: {
      x: config.layout.forgePanelX + config.layout.outerPadding,
      y: config.layout.forgePanelY + config.layout.forgePanelHeight - config.layout.prepButtonHeight - config.layout.outerPadding,
      width: config.layout.prepButtonWidth,
      height: config.layout.prepButtonHeight
    },
    confirmLoadoutButton: {
      x: config.layout.spellSlotsX + config.layout.outerPadding,
      y: config.layout.spellSlotsY + config.layout.spellSlotsHeight - config.layout.prepButtonHeight - config.layout.outerPadding,
      width: config.layout.prepButtonWidth,
      height: config.layout.prepButtonHeight
    },
    nameField: {
      x: config.layout.forgePanelX + config.layout.outerPadding,
      y: config.layout.forgePanelY + config.layout.statusPanelHeight + config.layout.outerPadding + config.fonts.normalSize,
      width: config.layout.forgePanelWidth - config.layout.outerPadding * config.match.sideCount,
      height: config.layout.spellNameFieldHeight
    },
    cycleNameButton: {
      x: config.layout.forgePanelX + config.layout.outerPadding,
      y: config.layout.forgePanelY + config.layout.statusPanelHeight + config.layout.outerPadding + config.fonts.normalSize + config.layout.spellNameFieldHeight + config.layout.cooldownChipGap,
      width: config.layout.saveSpellButtonWidth,
      height: config.layout.spellTypeButtonHeight
    },
    saveSpellButton: {
      x: config.layout.spellSlotsX + config.layout.outerPadding,
      y: config.layout.spellSlotsY + config.layout.spellSlotsHeight - config.layout.prepButtonHeight * config.match.sideCount - config.layout.outerPadding - config.layout.spellSlotGap,
      width: config.layout.saveSpellButtonWidth,
      height: config.layout.prepButtonHeight
    },
    clearPatternButton: {
      x: config.layout.forgePanelX + config.layout.outerPadding + config.layout.prepButtonWidth + config.layout.spellTypeButtonGap,
      y: config.layout.forgePanelY + config.layout.forgePanelHeight - config.layout.prepButtonHeight - config.layout.outerPadding,
      width: config.layout.saveSpellButtonWidth,
      height: config.layout.prepButtonHeight
    },
    randomSpellTypeButton: {
      x: config.layout.forgePanelX + config.layout.outerPadding,
      y: config.layout.forgePanelY + config.layout.forgePanelHeight - config.layout.prepButtonHeight * config.match.sideCount - config.layout.outerPadding - config.layout.spellSlotGap,
      width: config.layout.saveSpellButtonWidth,
      height: config.layout.prepButtonHeight
    },
    prepareAllSpellsButton: {
      x: config.layout.spellSlotsX + config.layout.outerPadding,
      y: config.layout.spellSlotsY + config.layout.spellSlotsHeight - config.layout.prepButtonHeight * config.match.sideCount - config.layout.outerPadding - config.layout.spellSlotGap * config.match.sideCount - config.layout.prepButtonHeight - config.layout.spellSlotGap,
      width: config.layout.prepButtonWidth,
      height: config.layout.prepButtonHeight
    }
  };
}

export function getEggGridPoints(config = CONFIG) {
  const rect = getPreparationRects(config).eggDrawing;
  const gridWidth = config.layout.eggGridGap * (config.patterns.columns - (config.match.sideCount - 1));
  const gridHeight = config.layout.eggGridGap * (config.patterns.rows - (config.match.sideCount - 1));
  const startX = rect.x + (rect.width - gridWidth) / config.match.sideCount;
  const startY = rect.y + config.layout.outerPadding * config.match.sideCount;
  const points = [];

  for (let row = config.match.minHp; row < config.patterns.rows; row += config.patterns.firstPointId) {
    for (let column = config.match.minHp; column < config.patterns.columns; column += config.patterns.firstPointId) {
      points.push({
        id: points.length + config.patterns.firstPointId,
        x: startX + column * config.layout.eggGridGap,
        y: startY + row * config.layout.eggGridGap,
        radius: config.layout.eggGridPointRadius
      });
    }
  }

  return points;
}

export function getSpellTypeButtonRects(config = CONFIG) {
  const rect = getPreparationRects(config).forgePanel;
  const startX = rect.x + config.layout.outerPadding;
  const startY = rect.y + config.layout.outerPadding + config.fonts.normalSize + config.layout.cooldownChipGap * config.match.sideCount;
  return config.spells.types.map((type, index) => ({
    id: `type-${type.toLowerCase()}`,
    kind: 'spell-type',
    label: type,
    spellType: type,
    rect: {
      x: startX + (index % config.layout.spellTypeButtonColumns) * (config.layout.spellTypeButtonWidth + config.layout.spellTypeButtonGap),
      y: startY + Math.floor(index / config.layout.spellTypeButtonColumns) * (config.layout.spellTypeButtonHeight + config.layout.spellTypeButtonGap),
      width: config.layout.spellTypeButtonWidth,
      height: config.layout.spellTypeButtonHeight
    }
  }));
}

export function getActionButtonRects(config = CONFIG) {
  const totalWidth = ACTION_IDS.length * config.layout.actionButtonWidth + (ACTION_IDS.length - (config.match.sideCount - 1)) * config.layout.actionButtonGap;
  const startX = centeredX(totalWidth, config);

  return ACTION_IDS.map((actionId, index) => ({
    id: `action-${actionId}`,
    kind: 'basic-action',
    label: config.actions[actionId].command,
    actionId,
    rect: {
      x: startX + index * (config.layout.actionButtonWidth + config.layout.actionButtonGap),
      y: config.layout.actionButtonY,
      width: config.layout.actionButtonWidth,
      height: config.layout.actionButtonHeight
    }
  }));
}

export function getSpellButtonRects(config = CONFIG) {
  const totalWidth = config.spells.perLoadout * config.layout.spellButtonWidth + (config.spells.perLoadout - (config.match.sideCount - 1)) * config.layout.spellButtonGap;
  const startX = centeredX(totalWidth, config);

  return config.spells.defaultPlayerNames.map((name, index) => ({
    id: `spell-${name.toLowerCase().replace(/\s+/g, '-')}`,
    kind: 'prepared-spell',
    label: name,
    spellIndex: index,
    rect: {
      x: startX + index * (config.layout.spellButtonWidth + config.layout.spellButtonGap),
      y: config.layout.spellButtonY,
      width: config.layout.spellButtonWidth,
      height: config.layout.spellButtonHeight
    }
  }));
}
