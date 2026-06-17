import { CONFIG } from '../config.js';
import { createHitRegions } from '../ui/hitRegions.js';

function setFont(ctx, size, config = CONFIG) {
  ctx.font = `${size}px ${config.visuals.uiFontFamily}`;
}

function rectCenter(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}

function drawRoundRect(ctx, rect, fill, stroke, config = CONFIG) {
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.width, rect.height, config.visuals.cornerRadius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = config.visuals.strokeThin;
    ctx.stroke();
  }
}

function drawText(ctx, text, x, y, size, color = CONFIG.visuals.colorTextPrimary, align = 'left') {
  setFont(ctx, size);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
}

function drawButton(ctx, rect, label, config = CONFIG) {
  drawRoundRect(ctx, rect, config.visuals.colorPanelRaised, config.visuals.colorPanelBorder, config);
  const center = rectCenter(rect);
  drawText(ctx, label, center.x, center.y - config.visuals.fontSizeSmall / 2, config.visuals.fontSizeSmall, config.visuals.colorTextPrimary, 'center');
}

function drawTopBar(ctx, state, config = CONFIG) {
  drawRoundRect(ctx, config.layout.topBarRect, config.visuals.colorPanelBackground, config.visuals.colorPanelBorder, config);
  drawText(ctx, config.text.title, config.layout.topBarRect.x + config.app.safeAreaPadding, config.layout.topBarRect.y + config.app.safeAreaPadding / 2, config.visuals.fontSizeLarge);
  drawText(ctx, state.activeScreen, config.layout.topBarRect.x + config.app.safeAreaPadding, config.layout.topBarRect.y + config.app.safeAreaPadding + config.visuals.fontSizeLarge, config.visuals.fontSizeSmall, config.visuals.colorTextSecondary);
  drawButton(ctx, config.layout.prevButtonRect, config.labels.previousButton, config);
  drawButton(ctx, config.layout.nextButtonRect, config.labels.nextButton, config);
  if (state.activeScreen === config.states.combat) drawButton(ctx, config.layout.pauseButtonRect, config.labels.pauseButton, config);
  drawButton(ctx, config.layout.guideButtonRect, config.labels.guideButton, config);
}

function drawCreation(ctx, config = CONFIG) {
  drawRoundRect(ctx, config.layout.leftPanelRect, config.visuals.colorPanelBackground, config.visuals.colorPanelBorder, config);
  drawText(ctx, 'Contract Creation', config.layout.leftPanelRect.x + config.app.safeAreaPadding, config.layout.leftPanelRect.y + config.app.safeAreaPadding, config.visuals.fontSizeLarge);
  drawRoundRect(ctx, config.layout.contractTypeSelectorRect, config.visuals.colorPanelRaised, config.visuals.colorAccent, config);
  drawText(ctx, `Type: ${config.contracts.enabledContractTypes.join(' / ')}`, config.layout.contractTypeSelectorRect.x + config.app.safeAreaPadding / 2, config.layout.contractTypeSelectorRect.y + config.app.safeAreaPadding / 2, config.visuals.fontSizeSmall);
  drawRoundRect(ctx, config.layout.drawingAreaRect, config.app.backgroundColor, config.visuals.colorAccentWarm, config);
  const drawCenter = rectCenter(config.layout.drawingAreaRect);
  drawText(ctx, config.labels.drawSigil, drawCenter.x, drawCenter.y - config.visuals.fontSizeMedium / 2, config.visuals.fontSizeMedium, config.visuals.colorTextSecondary, 'center');
  drawAnalysisReceipt(ctx, config);
}

function drawAnalysisReceipt(ctx, config = CONFIG) {
  drawRoundRect(ctx, config.layout.analysisPanelRect, config.visuals.colorPanelBackground, config.visuals.colorPanelBorder, config);
  const x = config.layout.analysisPanelRect.x + config.app.safeAreaPadding;
  let y = config.layout.analysisPanelRect.y + config.app.safeAreaPadding;
  drawText(ctx, 'CONTRACT ANALYSIS', x, y, config.visuals.fontSizeMedium, config.visuals.colorAccent);
  y += config.visuals.fontSizeLarge;
  ['Dragon - Trait - Power:', 'Ignivar - Fierce - Flame Bite', 'Contract Call: Ignivar', 'Effect: 12 Damage', 'Cost: 10 Energy', 'Cooldown: 1.5s', 'Why: Sigil preview placeholder.'].forEach((line) => {
    drawText(ctx, line, x, y, config.visuals.fontSizeMedium, line.includes(':') ? config.visuals.colorTextPrimary : config.visuals.colorTextSecondary);
    y += config.visuals.fontSizeLarge;
  });
  drawButton(ctx, { ...config.layout.analysisPanelRect, x, y: config.layout.analysisPanelRect.y + config.layout.analysisPanelRect.height - config.app.safeAreaPadding * 3, width: 156, height: 44 }, config.labels.saveContract, config);
  drawButton(ctx, { ...config.layout.analysisPanelRect, x: x + 184, y: config.layout.analysisPanelRect.y + config.layout.analysisPanelRect.height - config.app.safeAreaPadding * 3, width: 124, height: 44 }, config.labels.redraw, config);
}

function drawLoadout(ctx, config = CONFIG) {
  drawRoundRect(ctx, config.layout.libraryRect, config.visuals.colorPanelBackground, config.visuals.colorPanelBorder, config);
  drawText(ctx, 'Contract Library', config.layout.libraryRect.x + config.app.safeAreaPadding, config.layout.libraryRect.y + config.app.safeAreaPadding, config.visuals.fontSizeLarge);
  drawText(ctx, 'Saved contract placeholders', config.layout.libraryRect.x + config.app.safeAreaPadding, config.layout.libraryRect.y + config.app.safeAreaPadding * 3, config.visuals.fontSizeMedium, config.visuals.colorTextSecondary);
  config.layout.loadoutSlotRects.forEach((rect, index) => {
    drawRoundRect(ctx, rect, config.visuals.colorPanelBackground, config.visuals.colorPanelBorder, config);
    drawText(ctx, `Slot ${config.contracts.slotMarkerLabels[index]}`, rect.x + config.app.safeAreaPadding / 2, rect.y + config.app.safeAreaPadding / 2, config.visuals.fontSizeMedium);
    drawText(ctx, `Call: ${config.contracts.placeholderCallNames[index]}`, rect.x + config.app.safeAreaPadding / 2, rect.y + config.app.safeAreaPadding * 1.5, config.visuals.fontSizeSmall, config.visuals.colorTextSecondary);
    drawText(ctx, `Resonance: ${config.contracts.resonanceLabels[0]}`, rect.x + rect.width / 2, rect.y + config.app.safeAreaPadding * 1.5, config.visuals.fontSizeSmall, config.visuals.colorAccent, 'center');
  });
  drawButton(ctx, { x: config.layout.rightPanelRect.x, y: config.layout.rightPanelRect.y, width: config.layout.rightPanelRect.width, height: config.layout.guideButtonRect.height }, config.labels.startBattle, config);
}

function drawBar(ctx, rect, fill, missing, label, config = CONFIG) {
  drawRoundRect(ctx, rect, missing, config.visuals.colorPanelBorder, config);
  ctx.fillStyle = fill;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  drawText(ctx, label, rect.x, rect.y - config.visuals.fontSizeMedium, config.visuals.fontSizeSmall, config.visuals.colorTextSecondary);
}

function drawSigil(ctx, arena, config = CONFIG) {
  const center = rectCenter(arena);
  ctx.save();
  ctx.globalAlpha = config.visuals.sigilBaseOpacity;
  ctx.strokeStyle = config.visuals.colorAccentWarm;
  ctx.lineWidth = config.visuals.strokeThick;
  ctx.beginPath();
  ctx.moveTo(center.x - config.app.safeAreaPadding * 2, center.y);
  ctx.lineTo(center.x, center.y - config.app.safeAreaPadding * 2);
  ctx.lineTo(center.x + config.app.safeAreaPadding * 2, center.y);
  ctx.lineTo(center.x, center.y + config.app.safeAreaPadding * 2);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawScrollContractor(ctx, arena, config = CONFIG) {
  const baseX = arena.x + arena.width / 4;
  const baseY = arena.y + arena.height * 0.72;
  ctx.fillStyle = config.visuals.colorAccent;
  ctx.beginPath();
  ctx.arc(baseX, baseY - config.app.safeAreaPadding * 4, config.app.safeAreaPadding, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = config.visuals.colorPanelRaised;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY - config.app.safeAreaPadding * 3);
  ctx.lineTo(baseX - config.app.safeAreaPadding * 2, baseY + config.app.safeAreaPadding * 2);
  ctx.lineTo(baseX + config.app.safeAreaPadding * 2, baseY + config.app.safeAreaPadding * 2);
  ctx.closePath();
  ctx.fill();
  drawRoundRect(ctx, { x: baseX + config.app.safeAreaPadding, y: baseY - config.app.safeAreaPadding * 2, width: config.app.safeAreaPadding * 3, height: config.app.safeAreaPadding * 1.5 }, '#E6D7A8', config.visuals.colorAccentWarm, config);
}

function drawOpponent(ctx, arena, config = CONFIG) {
  const centerX = arena.x + arena.width * 0.75;
  const baseY = arena.y + arena.height * 0.7;
  ctx.fillStyle = config.visuals.colorAccentWarm;
  ctx.beginPath();
  ctx.arc(centerX, baseY - config.app.safeAreaPadding * 3, config.app.safeAreaPadding * 1.2, 0, Math.PI * 2);
  ctx.fill();
  drawRoundRect(ctx, { x: centerX - config.app.safeAreaPadding, y: baseY - config.app.safeAreaPadding * 2, width: config.app.safeAreaPadding * 2, height: config.app.safeAreaPadding * 4 }, config.visuals.colorPanelRaised, config.visuals.colorPanelBorder, config);
}

function drawCombat(ctx, state, config = CONFIG) {
  drawBar(ctx, config.layout.playerHpBarRect, config.visuals.colorHpBar, config.visuals.colorHpMissing, `Player HP ${state.player.hp}/${state.player.maxHp}`, config);
  drawBar(ctx, config.layout.playerEnergyBarRect, config.visuals.colorEnergyBar, config.visuals.colorEnergyMissing, `Energy ${state.player.energy}/${config.match.maxEnergy}`, config);
  drawBar(ctx, config.layout.enemyHpBarRect, config.visuals.colorHpBar, config.visuals.colorHpMissing, `Enemy HP ${state.enemy.hp}/${state.enemy.maxHp}`, config);
  drawBar(ctx, config.layout.enemyEnergyBarRect, config.visuals.colorEnergyBar, config.visuals.colorEnergyMissing, `Energy ${state.enemy.energy}/${config.match.maxEnergy}`, config);
  drawRoundRect(ctx, config.layout.timerRect, config.visuals.colorPanelBackground, config.visuals.colorAccent, config);
  drawText(ctx, config.text.timerPlaceholder, rectCenter(config.layout.timerRect).x, config.layout.timerRect.y + config.app.safeAreaPadding / 2, config.visuals.fontSizeLarge, config.visuals.colorTextPrimary, 'center');
  drawRoundRect(ctx, config.layout.arenaRect, config.visuals.colorPanelBackground, config.visuals.colorPanelBorder, config);
  drawSigil(ctx, config.layout.arenaRect, config);
  drawScrollContractor(ctx, config.layout.arenaRect, config);
  drawOpponent(ctx, config.layout.arenaRect, config);
  drawText(ctx, config.text.latestPlayerCall, config.layout.latestCallRect.x, config.layout.latestCallRect.y, config.visuals.fontSizeMedium, config.visuals.colorTextSecondary);
  drawText(ctx, config.text.latestAiAction, config.layout.latestAiRect.x, config.layout.latestAiRect.y, config.visuals.fontSizeMedium, config.visuals.colorTextSecondary);
  config.layout.combatSlotRects.forEach((rect, index) => {
    const slot = state.equippedSlots[index];
    drawRoundRect(ctx, rect, config.visuals.colorPanelBackground, config.visuals.colorCooldownReady, config);
    drawText(ctx, `[${slot.markerLabel}] ${slot.resolvedCallName}`, rect.x + config.app.safeAreaPadding / 2, rect.y + config.app.safeAreaPadding / 2, config.visuals.fontSizeMedium);
    drawText(ctx, `${slot.energyCost}`, rect.x + rect.width - config.app.safeAreaPadding, rect.y + config.app.safeAreaPadding / 2, config.visuals.fontSizeMedium, config.visuals.colorAccent, 'right');
    drawText(ctx, slot.stateLabel, rect.x + config.app.safeAreaPadding / 2, rect.y + config.app.safeAreaPadding * 1.5, config.visuals.fontSizeSmall, config.visuals.colorTextSecondary);
  });
}

function drawPause(ctx, config = CONFIG) {
  drawCombat(ctx, { player: { hp: config.match.startingHp, maxHp: config.match.baseMaxHp, energy: config.match.startingEnergy }, enemy: { hp: config.match.startingHp, maxHp: config.match.baseMaxHp, energy: config.match.startingEnergy }, equippedSlots: config.contracts.slotMarkerLabels.map((markerLabel, index) => ({ markerLabel, resolvedCallName: config.contracts.placeholderCallNames[index], energyCost: config.contracts.placeholderEnergyCosts[index], stateLabel: config.labels.readyState })) }, config);
  drawRoundRect(ctx, config.layout.resultOverlayRect, config.visuals.overlayBackgroundColor, config.visuals.colorAccent, config);
  drawText(ctx, 'Paused', rectCenter(config.layout.resultOverlayRect).x, config.layout.resultOverlayRect.y + config.app.safeAreaPadding * 3, config.visuals.fontSizeHuge, config.visuals.colorTextPrimary, 'center');
}

function drawResult(ctx, config = CONFIG) {
  drawRoundRect(ctx, config.layout.resultOverlayRect, config.visuals.colorPanelBackground, config.visuals.colorPanelBorder, config);
  drawText(ctx, config.text.resultTitle, rectCenter(config.layout.resultOverlayRect).x, config.layout.resultOverlayRect.y + config.app.safeAreaPadding * 3, config.visuals.fontSizeHuge, config.visuals.colorTextPrimary, 'center');
  drawText(ctx, 'Restart and return-to-loadout placeholders', rectCenter(config.layout.resultOverlayRect).x, config.layout.resultOverlayRect.y + config.app.safeAreaPadding * 6, config.visuals.fontSizeMedium, config.visuals.colorTextSecondary, 'center');
}

function drawGuide(ctx, state, config = CONFIG) {
  ctx.fillStyle = config.visuals.overlayBackgroundColor;
  ctx.fillRect(0, 0, config.app.canvasWidth, config.app.canvasHeight);
  drawRoundRect(ctx, config.layout.guideOverlayRect, config.visuals.colorPanelBackground, config.visuals.colorAccent, config);
  const lines = config.guides[state.guide.screen] || config.guides[state.activeScreen] || [];
  const x = config.layout.guideOverlayRect.x + config.app.safeAreaPadding;
  let y = config.layout.guideOverlayRect.y + config.app.safeAreaPadding;
  drawText(ctx, `${state.guide.screen} Guide`, x, y, config.visuals.fontSizeLarge, config.visuals.colorAccent);
  y += config.visuals.fontSizeHuge;
  lines.forEach((line) => {
    drawText(ctx, line, x, y, config.visuals.fontSizeMedium, config.visuals.colorTextPrimary);
    y += config.visuals.fontSizeLarge;
  });
  drawText(ctx, config.labels.closeGuide, rectCenter(config.layout.guideOverlayRect).x, config.layout.guideOverlayRect.y + config.layout.guideOverlayRect.height - config.app.safeAreaPadding * 2, config.visuals.fontSizeSmall, config.visuals.colorTextSecondary, 'center');
}

export function renderGame(ctx, state, config = CONFIG) {
  ctx.clearRect(0, 0, config.app.canvasWidth, config.app.canvasHeight);
  ctx.fillStyle = config.app.backgroundColor;
  ctx.fillRect(0, 0, config.app.canvasWidth, config.app.canvasHeight);
  drawTopBar(ctx, state, config);
  if (state.activeScreen === config.states.contractCreation) drawCreation(ctx, config);
  if (state.activeScreen === config.states.contractAnalysis) drawAnalysisReceipt(ctx, config);
  if (state.activeScreen === config.states.loadout) drawLoadout(ctx, config);
  if (state.activeScreen === config.states.combat) drawCombat(ctx, state, config);
  if (state.activeScreen === config.states.pause) drawPause(ctx, config);
  if (state.activeScreen === config.states.result) drawResult(ctx, config);
  if (state.isGuideOpen) drawGuide(ctx, state, config);
}

export function getRenderableHitRegions(state, config = CONFIG) {
  return createHitRegions(state, config);
}
