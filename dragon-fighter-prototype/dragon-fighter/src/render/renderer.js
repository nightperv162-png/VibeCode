import { ACTION_IDS, CONFIG } from '../config.js';
import { formatCommandReference } from '../combat/actions.js';
import { getVisibleStateLabel } from '../core/gameState.js';

function font(size, weight, config) {
  return `${weight} ${size}px ${config.fonts.family}`;
}

function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke, lineWidth, config) {
  const safeRadius = Math.min(radius, width / config.match.sideCount, height / config.match.sideCount);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function centeredX(width, config) {
  return (config.canvas.width - width) / config.match.sideCount;
}

function panel(ctx, x, y, width, height, config) {
  drawRoundedRect(
    ctx,
    x,
    y,
    width,
    height,
    config.layout.cornerRadius,
    config.colors.panelFill,
    config.colors.panelStroke,
    config.layout.panelLineWidth,
    config
  );
}

function drawArena(ctx, config) {
  ctx.fillStyle = config.colors.background;
  ctx.fillRect(config.match.minHp, config.match.minHp, config.canvas.width, config.canvas.height);

  ctx.beginPath();
  ctx.moveTo(config.layout.arenaFarLeft, config.layout.horizonY);
  ctx.lineTo(config.layout.arenaFarRight, config.layout.horizonY);
  ctx.lineTo(config.layout.arenaNearRight, config.layout.floorBottomY);
  ctx.lineTo(config.layout.arenaNearLeft, config.layout.floorBottomY);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(config.match.minHp, config.layout.horizonY, config.match.minHp, config.layout.floorBottomY);
  gradient.addColorStop(config.match.minHp, config.colors.arenaFar);
  gradient.addColorStop(config.match.minHp + config.match.sideCount - config.match.sideCount + 1, config.colors.arenaNear);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.lineWidth = config.layout.panelLineWidth;
  ctx.strokeStyle = config.colors.arenaLine;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(config.layout.playerDragonX, config.layout.playerDragonY);
  ctx.lineTo(config.layout.aiDragonX, config.layout.aiDragonY);
  ctx.strokeStyle = config.colors.arenaLine;
  ctx.globalAlpha = config.combat.defenceDamageMultiplier;
  ctx.stroke();
  ctx.globalAlpha = config.match.sideCount - config.match.sideCount + 1;
}

function drawHpBar(ctx, x, y, width, hp, config) {
  ctx.fillStyle = config.colors.hpBack;
  ctx.fillRect(x, y, width, config.layout.hpBarHeight);
  const hpRatio = hp / config.match.startingHp;
  ctx.fillStyle = config.colors.hpFill;
  ctx.fillRect(x, y, width * hpRatio, config.layout.hpBarHeight);
  ctx.strokeStyle = config.colors.textPrimary;
  ctx.lineWidth = config.layout.panelLineWidth / config.match.sideCount;
  ctx.strokeRect(x, y, width, config.layout.hpBarHeight);
}

function drawCooldowns(ctx, x, y, side, config) {
  ACTION_IDS.forEach((actionId, index) => {
    const action = config.actions[actionId];
    const chipX = x + index * (config.layout.cooldownChipWidth + config.layout.cooldownChipGap);
    const ready = side.cooldowns[actionId] <= config.match.minHp;
    drawRoundedRect(
      ctx,
      chipX,
      y,
      config.layout.cooldownChipWidth,
      config.layout.cooldownChipHeight,
      config.layout.cornerRadius / config.match.sideCount,
      ready ? config.colors.cooldownReady : config.colors.cooldownBlocked,
      config.colors.panelStroke,
      config.layout.panelLineWidth / config.match.sideCount,
      config
    );
    ctx.fillStyle = config.colors.background;
    ctx.font = font(config.fonts.smallSize, config.fonts.boldWeight, config);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = ready ? action.command.slice(config.match.minHp, config.match.sideCount) : Math.ceil(side.cooldowns[actionId]).toString();
    ctx.fillText(label, chipX + config.layout.cooldownChipWidth / config.match.sideCount, y + config.layout.cooldownChipHeight / config.match.sideCount);
  });
}

function drawStatusPanel(ctx, side, x, y, alignRight, config) {
  panel(ctx, x, y, config.layout.statusPanelWidth, config.layout.statusPanelHeight, config);
  ctx.textAlign = alignRight ? 'right' : 'left';
  ctx.textBaseline = 'top';
  ctx.font = font(config.fonts.normalSize, config.fonts.boldWeight, config);
  ctx.fillStyle = config.colors.textPrimary;
  const textX = alignRight ? x + config.layout.statusPanelWidth - config.layout.outerPadding : x + config.layout.outerPadding;
  ctx.fillText(`${side.element} ${side.name}`, textX, y + config.layout.outerPadding / config.match.sideCount);

  const hpX = x + config.layout.outerPadding;
  const hpWidth = config.layout.statusPanelWidth - config.layout.outerPadding * config.match.sideCount;
  drawHpBar(ctx, hpX, y + config.layout.hpBarY, hpWidth, side.hp, config);

  ctx.font = font(config.fonts.smallSize, config.fonts.normalWeight, config);
  ctx.fillStyle = config.colors.textSecondary;
  ctx.textAlign = alignRight ? 'right' : 'left';
  ctx.fillText(`${side.hp}/${config.match.startingHp} HP`, textX, y + config.layout.hpBarY + config.layout.hpBarHeight + config.layout.cooldownChipGap);
  drawCooldowns(ctx, hpX, y + config.layout.statusPanelHeight - config.layout.outerPadding - config.layout.cooldownChipHeight, side, config);
}

function drawTimer(ctx, state, config) {
  const x = centeredX(config.layout.timerPanelWidth, config);
  const y = config.layout.outerPadding;
  panel(ctx, x, y, config.layout.timerPanelWidth, config.layout.timerPanelHeight, config);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = config.colors.textPrimary;
  ctx.font = font(config.fonts.largeSize, config.fonts.boldWeight, config);
  const timerValue = state.phase === config.match.countdownPhase ? config.match.durationSeconds : Math.ceil(state.matchRemaining);
  ctx.fillText(`${timerValue}s`, x + config.layout.timerPanelWidth / config.match.sideCount, y + config.layout.timerPanelHeight / config.match.sideCount);
}

function drawDragon(ctx, x, y, width, height, color, facingLeft, bob, config) {
  const bodyY = y + bob;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, bodyY, width / config.match.sideCount, height / config.match.sideCount, CONFIG.match.minHp, CONFIG.match.minHp, Math.PI * config.match.sideCount);
  ctx.fill();

  const direction = facingLeft ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(x - direction * width / config.match.sideCount, bodyY - height / config.match.sideCount);
  ctx.lineTo(x - direction * width, bodyY - height);
  ctx.lineTo(x - direction * width / config.match.sideCount, bodyY);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + direction * width / config.match.sideCount, bodyY - height / config.match.sideCount);
  ctx.lineTo(x + direction * width * config.combat.defenceDamageMultiplier, bodyY - height);
  ctx.lineTo(x + direction * width, bodyY - height / config.match.sideCount);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x - width / config.match.sideCount, bodyY);
  ctx.lineTo(x - width, bodyY + height / config.match.sideCount);
  ctx.lineTo(x - width / config.match.sideCount, bodyY + height / config.match.sideCount);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = config.colors.textPrimary;
  ctx.beginPath();
  ctx.arc(x + direction * width * config.combat.defenceDamageMultiplier, bodyY - height / config.match.sideCount, config.layout.iconRadius / config.match.sideCount, CONFIG.match.minHp, Math.PI * config.match.sideCount);
  ctx.fill();
}

function drawHuman(ctx, x, y, color, config) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - config.layout.humanHeight, config.layout.humanWidth / config.match.sideCount, CONFIG.match.minHp, Math.PI * config.match.sideCount);
  ctx.fill();
  drawRoundedRect(ctx, x - config.layout.humanWidth / config.match.sideCount, y - config.layout.humanHeight + config.layout.iconRadius, config.layout.humanWidth, config.layout.humanHeight, config.layout.cornerRadius, color, null, config.layout.panelLineWidth, config);
}

function drawAura(ctx, side, x, y, width, height, config) {
  if (side.activeDefenceSeconds > config.match.minHp) {
    ctx.fillStyle = config.colors.defenceAura;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, CONFIG.match.minHp, CONFIG.match.minHp, Math.PI * config.match.sideCount);
    ctx.fill();
  }

  if (side.activeBlockSeconds > config.match.minHp) {
    ctx.strokeStyle = config.colors.blockAura;
    ctx.lineWidth = config.layout.effectLineWidth;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, CONFIG.match.minHp, CONFIG.match.minHp, Math.PI * config.match.sideCount);
    ctx.stroke();
  }
}

function drawStateLabel(ctx, text, x, y, config) {
  ctx.font = font(config.fonts.normalSize, config.fonts.boldWeight, config);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const width = ctx.measureText(text).width + config.layout.outerPadding * config.match.sideCount;
  const height = config.layout.cooldownChipHeight + config.layout.outerPadding / config.match.sideCount;
  drawRoundedRect(ctx, x - width / config.match.sideCount, y - height / config.match.sideCount, width, height, config.layout.cornerRadius, config.colors.panelFill, config.colors.panelStroke, config.layout.panelLineWidth / config.match.sideCount, config);
  ctx.fillStyle = text === config.combat.cooldownLabel || text === config.combat.unknownCommandReason ? config.colors.warning : config.colors.textPrimary;
  ctx.fillText(text, x, y);
}

function drawActors(ctx, state, config) {
  const time = state.elapsedSeconds;
  const bob = Math.sin((time / config.animation.dragonBobSeconds) * Math.PI * config.match.sideCount) * config.animation.dragonBobPixels;
  const player = state.sides[config.match.playerId];
  const ai = state.sides[config.match.aiId];

  drawHuman(ctx, config.layout.aiHumanX, config.layout.aiHumanY, config.colors.aiBody, config);
  drawAura(ctx, ai, config.layout.aiDragonX, config.layout.aiDragonY + bob, config.layout.aiDragonWidth / config.match.sideCount, config.layout.aiDragonHeight, config);
  drawDragon(ctx, config.layout.aiDragonX, config.layout.aiDragonY, config.layout.aiDragonWidth, config.layout.aiDragonHeight, config.colors.aiDragon, false, bob, config);
  drawStateLabel(ctx, getVisibleStateLabel(ai, config), config.layout.aiDragonX, config.layout.aiDragonY - config.layout.stateLabelOffsetY, config);

  drawAura(ctx, player, config.layout.playerDragonX, config.layout.playerDragonY - bob, config.layout.playerDragonWidth / config.match.sideCount, config.layout.playerDragonHeight, config);
  drawDragon(ctx, config.layout.playerDragonX, config.layout.playerDragonY, config.layout.playerDragonWidth, config.layout.playerDragonHeight, config.colors.playerDragon, true, -bob, config);
  drawHuman(ctx, config.layout.playerHumanX, config.layout.playerHumanY, config.colors.playerBody, config);
  drawStateLabel(ctx, getVisibleStateLabel(player, config), config.layout.playerDragonX, config.layout.playerDragonY - config.layout.stateLabelOffsetY, config);
}

function drawProjectileEffects(ctx, state, config) {
  state.projectileEffects.forEach((effect) => {
    const startX = effect.actorId === config.match.playerId ? config.layout.playerDragonX : config.layout.aiDragonX;
    const startY = effect.actorId === config.match.playerId ? config.layout.playerDragonY : config.layout.aiDragonY;
    const endX = effect.targetId === config.match.playerId ? config.layout.playerDragonX : config.layout.aiDragonX;
    const endY = effect.targetId === config.match.playerId ? config.layout.playerDragonY : config.layout.aiDragonY;
    const progress = (config.animation.projectileSeconds - effect.seconds) / config.animation.projectileSeconds;
    const x = startX + (endX - startX) * progress;
    const y = startY + (endY - startY) * progress - config.layout.effectArcOffsetY;
    ctx.strokeStyle = effect.actionId === 'skill' ? config.colors.skillEffect : config.colors.attackEffect;
    ctx.lineWidth = config.layout.effectLineWidth;
    ctx.beginPath();
    ctx.arc(x, y, config.layout.iconRadius, CONFIG.match.minHp, Math.PI * config.match.sideCount);
    ctx.stroke();
  });
}

function drawHitEffects(ctx, state, config) {
  state.hitEffects.forEach((effect) => {
    const baseX = effect.sideId === config.match.playerId ? config.layout.playerDragonX : config.layout.aiDragonX;
    const baseY = effect.sideId === config.match.playerId ? config.layout.playerDragonY : config.layout.aiDragonY;
    const progress = (config.animation.hitTextSeconds - effect.seconds) / config.animation.hitTextSeconds;
    ctx.font = font(config.fonts.normalSize, config.fonts.boldWeight, config);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = effect.amount <= config.match.minHp ? config.colors.cooldownReady : config.colors.warning;
    const text = effect.preventedBy ? `${effect.preventedBy}: -${effect.amount}` : `-${effect.amount}`;
    ctx.fillText(text, baseX, baseY - config.layout.stateLabelOffsetY - progress * config.animation.hitTextRise);
  });
}

function drawLatestPanel(ctx, x, y, title, value, reason, config) {
  panel(ctx, x, y, config.layout.latestPanelWidth, config.layout.latestPanelHeight, config);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = font(config.fonts.smallSize, config.fonts.boldWeight, config);
  ctx.fillStyle = config.colors.textSecondary;
  ctx.fillText(title, x + config.layout.outerPadding, y + config.layout.outerPadding / config.match.sideCount);
  ctx.font = font(config.fonts.normalSize, config.fonts.boldWeight, config);
  ctx.fillStyle = reason && reason !== config.combat.successReason ? config.colors.warning : config.colors.textPrimary;
  ctx.fillText(value, x + config.layout.outerPadding, y + config.layout.outerPadding + config.layout.cooldownChipGap);
}

function registerButton(state, id, kind, label, rect, actionId) {
  state.uiButtons.push({ id, kind, label, rect, actionId });
}

function drawButton(ctx, state, id, kind, label, rect, actionId, config) {
  registerButton(state, id, kind, label, rect, actionId);
  drawRoundedRect(ctx, rect.x, rect.y, rect.width, rect.height, config.layout.cornerRadius, config.colors.buttonFill, config.colors.panelStroke, config.layout.panelLineWidth, config);
  ctx.fillStyle = config.colors.textPrimary;
  ctx.font = font(config.fonts.buttonSize, config.fonts.boldWeight, config);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.width / config.match.sideCount, rect.y + rect.height / config.match.sideCount);
}

function drawCommandHud(ctx, state, config) {
  const bottomY = config.canvas.height - config.layout.bottomMargin - config.layout.latestPanelHeight;
  drawLatestPanel(ctx, config.layout.outerPadding, bottomY, config.text.latestPlayerTitle, state.sides[config.match.playerId].latestCommand, state.sides[config.match.playerId].latestReason, config);
  drawLatestPanel(ctx, config.canvas.width - config.layout.outerPadding - config.layout.latestPanelWidth, bottomY, config.text.latestAiTitle, state.sides[config.match.aiId].latestCommand, state.sides[config.match.aiId].latestReason, config);

  const commandX = centeredX(config.layout.commandPanelWidth, config);
  panel(ctx, commandX, bottomY, config.layout.commandPanelWidth, config.layout.commandPanelHeight, config);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = font(config.fonts.smallSize, config.fonts.boldWeight, config);
  ctx.fillStyle = config.colors.textSecondary;
  ctx.fillText(config.text.commandReferenceTitle, commandX + config.layout.commandPanelWidth / config.match.sideCount, bottomY + config.layout.outerPadding / config.match.sideCount);
  ctx.font = font(config.fonts.normalSize, config.fonts.boldWeight, config);
  ctx.fillStyle = config.colors.textPrimary;
  ctx.fillText(formatCommandReference(config), commandX + config.layout.commandPanelWidth / config.match.sideCount, bottomY + config.layout.outerPadding + config.layout.cooldownChipGap);
  ctx.font = font(config.fonts.smallSize, config.fonts.normalWeight, config);
  ctx.fillStyle = config.colors.textSecondary;
  ctx.fillText(config.text.fallbackHint, commandX + config.layout.commandPanelWidth / config.match.sideCount, bottomY + config.layout.outerPadding + config.layout.cooldownChipGap + config.fonts.normalSize);
}

function drawActionButtons(ctx, state, config) {
  const totalWidth = ACTION_IDS.length * config.layout.actionButtonWidth + (ACTION_IDS.length - (config.match.sideCount - 1)) * config.layout.actionButtonGap;
  const startX = centeredX(totalWidth, config);
  ACTION_IDS.forEach((actionId, index) => {
    const x = startX + index * (config.layout.actionButtonWidth + config.layout.actionButtonGap);
    drawButton(ctx, state, `action-${actionId}`, 'action', config.actions[actionId].command, {
      x,
      y: config.layout.actionButtonY,
      width: config.layout.actionButtonWidth,
      height: config.layout.actionButtonHeight
    }, actionId, config);
  });

  const voiceX = startX + totalWidth + config.layout.actionButtonGap;
  drawButton(ctx, state, 'voice', 'voice', config.input.voiceButtonLabel, {
    x: voiceX,
    y: config.layout.actionButtonY,
    width: config.layout.voiceButtonWidth,
    height: config.layout.actionButtonHeight
  }, null, config);

  ctx.font = font(config.fonts.smallSize, config.fonts.normalWeight, config);
  ctx.fillStyle = config.colors.textSecondary;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(state.voiceStatus, config.canvas.width / config.match.sideCount, config.layout.actionButtonY - config.layout.cooldownChipHeight);
}

function drawOverlays(ctx, state, config) {
  if (state.phase === config.match.countdownPhase) {
    ctx.fillStyle = config.colors.overlayFill;
    ctx.fillRect(config.match.minHp, config.match.minHp, config.canvas.width, config.canvas.height);
    ctx.fillStyle = config.colors.textPrimary;
    ctx.font = font(config.fonts.overlaySize, config.fonts.boldWeight, config);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(state.countdownRemaining).toString(), config.canvas.width / config.match.sideCount, config.canvas.height / config.match.sideCount);
  }

  if (state.phase === config.match.activePhase && state.fightBannerRemaining > config.match.minHp) {
    ctx.fillStyle = config.colors.textPrimary;
    ctx.font = font(config.fonts.overlaySize, config.fonts.boldWeight, config);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Fight!', config.canvas.width / config.match.sideCount, config.canvas.height / config.match.sideCount);
  }

  if (state.phase === config.match.resultPhase) {
    ctx.fillStyle = config.colors.overlayFill;
    ctx.fillRect(config.match.minHp, config.match.minHp, config.canvas.width, config.canvas.height);
    ctx.fillStyle = config.colors.textPrimary;
    ctx.font = font(config.fonts.overlaySize, config.fonts.boldWeight, config);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.result, config.canvas.width / config.match.sideCount, config.canvas.height / config.match.sideCount - config.layout.statusPanelHeight / config.match.sideCount);
    ctx.font = font(config.fonts.normalSize, config.fonts.normalWeight, config);
    ctx.fillText(state.resultReason, config.canvas.width / config.match.sideCount, config.canvas.height / config.match.sideCount);
    ctx.fillText(config.match.restartHint, config.canvas.width / config.match.sideCount, config.canvas.height / config.match.sideCount + config.layout.statusPanelHeight / config.match.sideCount);

    drawButton(ctx, state, 'restart', 'restart', 'Restart Match', {
      x: centeredX(config.layout.restartButtonWidth, config),
      y: config.canvas.height / config.match.sideCount + config.layout.statusPanelHeight,
      width: config.layout.restartButtonWidth,
      height: config.layout.overlayButtonHeight
    }, null, config);
  }
}

function drawAssetWarning(ctx, config) {
  ctx.font = font(config.fonts.smallSize, config.fonts.normalWeight, config);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = config.colors.textSecondary;
  ctx.fillText(config.text.assetWarning, config.layout.outerPadding, config.layout.floorBottomY);
}

export function renderGame(canvas, ctx, state, config = CONFIG) {
  state.uiButtons = [];
  ctx.save();

  if (state.shakeRemaining > config.match.minHp) {
    const shakeRatio = state.shakeRemaining / config.animation.shakeSeconds;
    const offset = Math.sin(state.elapsedSeconds * config.match.durationSeconds) * config.animation.shakePixels * shakeRatio;
    ctx.translate(offset, -offset / config.match.sideCount);
  }

  drawArena(ctx, config);
  drawActors(ctx, state, config);
  drawProjectileEffects(ctx, state, config);
  drawHitEffects(ctx, state, config);
  drawStatusPanel(ctx, state.sides[config.match.playerId], config.layout.outerPadding, config.layout.outerPadding, false, config);
  drawStatusPanel(ctx, state.sides[config.match.aiId], config.canvas.width - config.layout.outerPadding - config.layout.statusPanelWidth, config.layout.outerPadding, true, config);
  drawTimer(ctx, state, config);
  drawCommandHud(ctx, state, config);
  drawActionButtons(ctx, state, config);
  drawAssetWarning(ctx, config);
  ctx.restore();

  drawOverlays(ctx, state, config);
}
