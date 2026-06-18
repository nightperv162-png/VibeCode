import { createLayout } from '../ui/layout.js';

export function createCanvasRenderer(config) {
  const layoutData = createLayout(config);

  function render(context, state) {
    drawBackground(context);
    if (state.phase === config.match.initialPhase) {
      drawDragonSelect(context, state);
      return;
    }

    drawArena(context);
    drawTeams(context, state);
    drawHud(context, state);
    drawOverlay(context, state);
  }

  function drawBackground(context) {
    context.fillStyle = config.colors.backgroundColor;
    context.fillRect(config.math.zero, config.math.zero, config.canvas.width, config.canvas.height);
  }

  function drawArena(context) {
    const arena = layoutData.arenaBounds;
    context.fillStyle = config.colors.arenaFar;
    context.fillRect(config.math.zero, arena.horizonY, config.canvas.width, arena.floorBottomY - arena.horizonY);

    const gradient = context.createLinearGradient(config.math.zero, arena.horizonY, config.math.zero, arena.floorBottomY);
    gradient.addColorStop(config.math.zero, config.colors.arenaFar);
    gradient.addColorStop(config.math.one, config.colors.arenaNear);
    context.fillStyle = gradient;

    context.beginPath();
    context.moveTo(arena.farLeft, arena.horizonY);
    context.lineTo(arena.farRight, arena.horizonY);
    context.lineTo(arena.nearRight, arena.floorBottomY);
    context.lineTo(arena.nearLeft, arena.floorBottomY);
    context.closePath();
    context.fill();

    context.strokeStyle = config.colors.arenaLine;
    context.lineWidth = config.layout.panelLineWidth;
    context.stroke();
    drawArenaLine(context, arena.farLeft, arena.horizonY, arena.nearLeft, arena.floorBottomY);
    drawArenaLine(context, arena.farRight, arena.horizonY, arena.nearRight, arena.floorBottomY);
  }

  function drawTeams(context, state) {
    drawTrainer(context, layoutData.player2Position, config.colors.player2Trainer, config.math.half);
    drawDragon(context, layoutData.player2DragonPosition, config.layout.player2DragonWidth, config.layout.player2DragonHeight, state.players.player2.dragon.color, config.math.half);
    drawStateLabel(context, layoutData.player2DragonPosition, state.players.player2.stateLabel);

    drawTrainer(context, layoutData.player1Position, config.colors.player1Trainer, config.math.one);
    drawDragon(context, layoutData.player1DragonPosition, config.layout.player1DragonWidth, config.layout.player1DragonHeight, state.players.player1.dragon.color, config.math.one);
    drawStateLabel(context, layoutData.player1DragonPosition, state.players.player1.stateLabel);
  }

  function drawHud(context, state) {
    drawStatusPanel(context, layoutData.player1PanelRect, state.players.player1);
    drawStatusPanel(context, layoutData.player2PanelRect, state.players.player2);
    drawTimerPanel(context, state);
    drawCommandPanel(context, layoutData.player1CommandRect, config.labels.playerCommandTitle, state.latestPlayerCommand);
    drawCommandPanel(context, layoutData.player2CommandRect, config.labels.aiCommandTitle, state.latestAiCommand);
    drawCommandReference(context);
    drawCombatButtons(context, state);
  }

  function drawStatusPanel(context, rect, side) {
    drawPanel(context, rect, config.colors.colorPanelBackground);
    drawText(context, `${side.name}  ${side.element}`, rect.x + config.layout.panelTextInset, rect.y + config.layout.panelTitleY, config.fonts.uiFontSizeMedium, config.fonts.boldWeight, config.colors.colorTextPrimary, 'left');
    drawHpBar(context, rect, side.hp);
    drawCooldownIndicators(context, rect, side.cooldowns);
  }

  function drawHpBar(context, rect, hp) {
    const x = rect.x + config.layout.panelTextInset;
    const y = rect.y + config.layout.hpBarY;
    const ratio = hp / config.match.startingHp;

    context.fillStyle = config.colors.colorHpEmpty;
    context.fillRect(x, y, config.layout.hpBarWidth, config.layout.hpBarHeight);
    context.fillStyle = config.colors.colorHpFull;
    context.fillRect(x, y, config.layout.hpBarWidth * ratio, config.layout.hpBarHeight);
    context.strokeStyle = config.colors.colorPanelBorder;
    context.strokeRect(x, y, config.layout.hpBarWidth, config.layout.hpBarHeight);
    drawText(context, `${config.labels.hpLabel} ${hp}/${config.match.startingHp}`, x + config.layout.hpBarWidth + config.layout.panelTextInset, y + config.layout.hpBarHeight, config.fonts.uiFontSizeSmall, config.fonts.normalWeight, config.colors.colorTextSecondary, 'left');
  }

  function drawCooldownIndicators(context, rect, cooldowns) {
    config.input.validCommands.forEach((command, index) => {
      const x = rect.x + config.layout.panelTextInset + index * (config.layout.cooldownIndicatorSize + config.layout.cooldownIndicatorGap);
      const y = rect.y + config.layout.cooldownRowY;
      context.fillStyle = cooldowns[command] === config.math.zero ? config.colors.colorCooldownReady : config.colors.colorCooldownActive;
      context.beginPath();
      context.arc(x + config.layout.cooldownIndicatorSize * config.math.half, y, config.layout.cooldownIndicatorSize * config.math.half, config.math.zero, Math.PI * config.math.two);
      context.fill();
      drawText(context, command.slice(config.math.zero, config.math.firstContentIndex), x + config.layout.cooldownIndicatorSize * config.math.half, y + config.layout.cooldownIndicatorSize, config.fonts.uiFontSizeSmall, config.fonts.boldWeight, config.colors.colorTextPrimary, 'center');
      drawText(context, formatCooldown(cooldowns[command]), x + config.layout.cooldownIndicatorSize * config.math.half, y + config.layout.cooldownIndicatorSize + config.layout.cooldownIndicatorSize, config.fonts.uiFontSizeSmall, config.fonts.normalWeight, config.colors.colorTextSecondary, 'center');
    });
  }

  function drawTimerPanel(context, state) {
    const rect = layoutData.timerRect;
    drawPanel(context, rect, config.colors.colorPanelBackground);
    drawText(context, config.labels.timerTitle, rect.x + rect.width * config.math.half, rect.y + config.layout.panelTitleY, config.fonts.uiFontSizeSmall, config.fonts.boldWeight, config.colors.colorTextSecondary, 'center');
    drawText(context, formatTimerText(state), rect.x + rect.width * config.math.half, rect.y + config.layout.commandTextY, config.fonts.uiFontSizeMedium, config.fonts.boldWeight, config.colors.colorTextPrimary, 'center');
  }

  function drawCommandPanel(context, rect, title, value) {
    drawPanel(context, rect, config.colors.colorPanelBackground);
    drawText(context, title, rect.x + config.layout.panelTextInset, rect.y + config.layout.panelTitleY, config.fonts.uiFontSizeSmall, config.fonts.boldWeight, config.colors.colorTextSecondary, 'left');
    drawText(context, value, rect.x + config.layout.panelTextInset, rect.y + config.layout.commandTextY, config.fonts.uiFontSizeMedium, config.fonts.boldWeight, config.colors.colorTextPrimary, 'left');
  }

  function drawCommandReference(context) {
    const rect = layoutData.commandReferenceRect;
    drawPanel(context, rect, config.colors.commandReferenceBackground);
    drawText(context, config.labels.commandReferenceTitle, rect.x + rect.width * config.math.half, rect.y + config.layout.panelTitleY, config.fonts.uiFontSizeSmall, config.fonts.boldWeight, config.colors.colorTextSecondary, 'center');
    config.input.validCommands.forEach((command, index) => {
      const firstItemX = rect.x + rect.width * config.math.half - config.layout.commandReferenceItemSpacing * config.math.two * config.math.half;
      const x = firstItemX + index * config.layout.commandReferenceItemSpacing;
      drawText(context, command, x, rect.y + config.layout.commandTextY, config.fonts.uiFontSizeMedium, config.fonts.boldWeight, config.colors.colorTextPrimary, 'center');
    });
  }

  function drawCombatButtons(context, state) {
    if (!config.input.enablePointerButtons) {
      return;
    }

    layoutData.combatButtonRects.forEach((rect) => {
      const remaining = state.players.player1.cooldowns[rect.command];
      const fill = remaining > config.math.zero ? config.colors.combatButtonBlockedFill : config.colors.combatButtonFill;
      drawPanel(context, rect, fill, config.colors.combatButtonBorder);
      drawText(context, rect.command, rect.x + rect.width * config.math.half, rect.y + config.layout.panelTitleY, config.fonts.uiFontSizeSmall, config.fonts.boldWeight, config.colors.colorTextPrimary, 'center');
      drawText(context, formatCooldown(remaining), rect.x + rect.width * config.math.half, rect.y + config.layout.commandTextY, config.fonts.uiFontSizeSmall, config.fonts.normalWeight, config.colors.colorTextSecondary, 'center');
    });
  }

  function drawDragonSelect(context, state) {
    drawText(context, config.labels.dragonSelectTitle, config.canvas.width * config.math.half, config.layout.dragonSelectTitleY, config.fonts.uiFontSizeLarge, config.fonts.boldWeight, config.colors.colorTextPrimary, 'center');
    drawText(context, config.labels.dragonSelectSubtitle, config.canvas.width * config.math.half, config.layout.dragonSelectSubtitleY, config.fonts.uiFontSizeMedium, config.fonts.normalWeight, config.colors.colorTextSecondary, 'center');

    config.dragons.options.forEach((dragon, index) => {
      drawDragonOptionCard(context, dragon, layoutData.dragonSelect.optionRects[index], state.dragonSelect.selectedDragonId === dragon.id);
    });

    drawText(context, state.dragonSelect.feedback, config.canvas.width * config.math.half, config.layout.dragonSelectFeedbackY, config.fonts.uiFontSizeMedium, config.fonts.boldWeight, state.dragonSelect.selectedDragonId ? config.colors.colorTextSecondary : config.colors.colorTextWarning, 'center');
    drawConfirmButton(context, state);
  }

  function drawOverlay(context, state) {
    if (state.phase === config.match.countdownPhase) {
      drawTint(context);
      const label = state.countdownSeconds > config.math.zero
        ? Math.ceil(state.countdownSeconds).toString()
        : config.labels.fightLabel;
      drawText(context, label, config.canvas.width * config.math.half, config.layout.countdownOverlayY, config.fonts.uiFontSizeLarge, config.fonts.boldWeight, config.colors.colorTextPrimary, 'center');
      return;
    }

    if (state.phase === config.match.resultPhase) {
      drawTint(context);
      drawText(context, `${config.labels.resultTitle}: ${state.result}`, config.canvas.width * config.math.half, config.layout.resultTitleY, config.fonts.uiFontSizeLarge, config.fonts.boldWeight, config.colors.colorTextPrimary, 'center');
      drawText(context, config.labels.restartHint, config.canvas.width * config.math.half, config.layout.resultBodyY, config.fonts.uiFontSizeMedium, config.fonts.normalWeight, config.colors.colorTextSecondary, 'center');
      drawRestartButton(context);
    }
  }

  function drawRestartButton(context) {
    const rect = layoutData.restartButtonRect;
    drawPanel(context, rect, config.colors.restartButtonFill, config.colors.colorPanelBorder);
    drawText(context, config.labels.restartLabel, rect.x + rect.width * config.math.half, rect.y + config.layout.commandTextY, config.fonts.uiFontSizeMedium, config.fonts.boldWeight, config.colors.colorTextPrimary, 'center');
  }

  function drawTint(context) {
    context.fillStyle = config.colors.overlayBackgroundColor;
    context.fillRect(config.math.zero, config.math.zero, config.canvas.width, config.canvas.height);
  }

  function drawDragonOptionCard(context, dragon, rect, isSelected) {
    drawPanel(context, rect, config.colors.dragonSelectCardFill, isSelected ? config.colors.dragonSelectSelectedBorder : config.colors.dragonSelectCardBorder);
    drawDragon(
      context,
      {
        x: rect.x + rect.width * config.math.half,
        y: rect.y + config.layout.dragonSelectVisualY
      },
      config.layout.dragonSelectDragonWidth,
      config.layout.dragonSelectDragonHeight,
      dragon.color,
      config.math.one
    );
    drawText(context, dragon.name, rect.x + rect.width * config.math.half, rect.y + config.layout.dragonSelectNameY, config.fonts.uiFontSizeMedium, config.fonts.boldWeight, config.colors.colorTextPrimary, 'center');
    drawText(context, dragon.roleLabel, rect.x + rect.width * config.math.half, rect.y + config.layout.dragonSelectRoleY, config.fonts.uiFontSizeSmall, config.fonts.boldWeight, config.colors.colorTextSecondary, 'center');
    drawText(context, dragon.flavorText, rect.x + rect.width * config.math.half, rect.y + config.layout.dragonSelectFlavorY, config.fonts.uiFontSizeSmall, config.fonts.normalWeight, config.colors.colorTextPrimary, 'center');
    drawText(context, config.labels.futureBonusLabel, rect.x + rect.width * config.math.half, rect.y + config.layout.dragonSelectFutureY, config.fonts.uiFontSizeSmall, config.fonts.normalWeight, config.colors.colorTextSecondary, 'center');
  }

  function drawConfirmButton(context, state) {
    const rect = layoutData.dragonSelect.confirmButtonRect;
    const fill = state.dragonSelect.selectedDragonId ? config.colors.dragonSelectConfirmFill : config.colors.dragonSelectConfirmBlockedFill;
    drawPanel(context, rect, fill, config.colors.colorPanelBorder);
    drawText(context, config.labels.dragonSelectConfirm, rect.x + rect.width * config.math.half, rect.y + config.layout.commandTextY, config.fonts.uiFontSizeMedium, config.fonts.boldWeight, config.colors.colorTextPrimary, 'center');
  }

  function drawTrainer(context, position, color, scale) {
    drawShadow(context, position.x, position.y, config.layout.trainerWidth * scale);
    context.fillStyle = color;
    context.beginPath();
    context.arc(position.x, position.y - config.layout.trainerHeight * scale, config.layout.headRadius * scale, config.math.zero, Math.PI * config.math.two);
    context.fill();
    context.fillRect(position.x - config.layout.trainerWidth * scale * config.math.half, position.y - config.layout.trainerHeight * scale + config.layout.headRadius * scale, config.layout.trainerWidth * scale, config.layout.trainerHeight * scale - config.layout.headRadius * scale);
  }

  function drawDragon(context, position, width, height, color, scale) {
    drawShadow(context, position.x, position.y + height * config.math.half, width);
    context.fillStyle = color;
    context.beginPath();
    context.ellipse(position.x, position.y, width * config.math.half, height * config.math.half, config.math.zero, config.math.zero, Math.PI * config.math.two);
    context.fill();
    context.beginPath();
    context.arc(position.x + width * config.layout.dragonFeatureScale * scale, position.y - height * config.layout.dragonFeatureScale, config.layout.dragonHeadRadius * scale, config.math.zero, Math.PI * config.math.two);
    context.fill();
    context.fillStyle = config.colors.colorTextPrimary;
    context.beginPath();
    context.arc(position.x + width * config.layout.dragonFeatureScale * scale, position.y - height * config.layout.dragonFeatureScale, config.layout.dragonEyeRadius * scale, config.math.zero, Math.PI * config.math.two);
    context.fill();
  }

  function drawStateLabel(context, position, label) {
    drawText(context, label, position.x, position.y - config.layout.stateLabelOffsetY, config.fonts.uiFontSizeMedium, config.fonts.boldWeight, config.colors.colorTextPrimary, 'center');
  }

  function drawShadow(context, x, y, width) {
    context.save();
    context.globalAlpha = config.layout.shadowAlpha;
    context.fillStyle = config.colors.overlayBackgroundColor;
    context.beginPath();
    context.ellipse(x, y, width * config.math.half, config.layout.shadowHeight, config.math.zero, config.math.zero, Math.PI * config.math.two);
    context.fill();
    context.restore();
  }

  function drawArenaLine(context, startX, startY, endX, endY) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
  }

  function drawPanel(context, rect, fillStyle, strokeStyle = config.colors.colorPanelBorder) {
    context.fillStyle = fillStyle;
    context.strokeStyle = strokeStyle;
    context.lineWidth = config.layout.panelLineWidth;
    context.beginPath();
    context.roundRect(rect.x, rect.y, rect.width, rect.height, config.layout.panelRadius);
    context.fill();
    context.stroke();
  }

  function drawText(context, text, x, y, size, weight, color, align) {
    context.fillStyle = color;
    context.font = `${weight} ${size}px ${config.fonts.uiFontFamily}`;
    context.textAlign = align;
    context.textBaseline = 'alphabetic';
    context.fillText(text, x, y);
  }

  function formatCooldown(remaining) {
    return remaining > config.math.zero
      ? remaining.toFixed(config.layout.cooldownDisplayDecimals)
      : config.labels.cooldownReadyLabel;
  }

  function formatTimerText(state) {
    if (state.phase === config.match.countdownPhase) {
      return Math.ceil(state.countdownSeconds).toString();
    }

    return Math.ceil(state.timerSeconds).toString();
  }

  return { render, layoutData };
}
