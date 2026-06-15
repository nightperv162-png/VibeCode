import { CONFIG } from '../config.js';
import { commandTextForAction, getActionByKey, truncateTranscript } from '../combat/actions.js';
import { attemptCommand } from '../combat/matchRules.js';
import { resetGameState } from '../core/gameState.js';
import { showMatchPreview, showPreparation } from '../core/stateMachine.js';
import { addPatternPoint, clearDraftPattern, confirmLoadout, cycleDraftName, editDraftName, randomizeDraftPattern, saveDraftSpell, selectSpellType, randomizeSpellType, prepareAllSpells } from '../states/preparationState.js';
import { getEggGridPoints, getPreparationRects } from '../ui/layout.js';

function mapPointerToCanvas(event, canvas, config) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.changedTouches?.[config.match.minHp]?.clientX;
  const clientY = event.clientY ?? event.changedTouches?.[config.match.minHp]?.clientY;
  return {
    x: ((clientX - rect.left) / rect.width) * config.canvas.width,
    y: ((clientY - rect.top) / rect.height) * config.canvas.height
  };
}

function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function findButtonAtPoint(state, point) {
  return state.uiButtons.find((button) => pointInRect(point, button.rect)) ?? null;
}

function findGridPointAtPoint(point, config) {
  return getEggGridPoints(config).find((gridPoint) => {
    const dx = point.x - gridPoint.x;
    const dy = point.y - gridPoint.y;
    return Math.hypot(dx, dy) <= gridPoint.radius * config.match.sideCount;
  }) ?? null;
}

function getSpeechRecognitionConstructor(windowRef) {
  return windowRef.SpeechRecognition ?? windowRef.webkitSpeechRecognition ?? null;
}

export function createInputController({ canvas, state, logger, random = Math.random, config = CONFIG, windowRef = window }) {
  const SpeechRecognition = getSpeechRecognitionConstructor(windowRef);
  let recognizer = null;

  function submitBasicAction(actionId, source) {
    const command = commandTextForAction(actionId, config);
    return attemptCommand(state, config.match.playerId, command, source, logger, config);
  }

  function restartMatch(source) {
    resetGameState(state, config);
    logger?.info('Match restarted', { source });
  }

  function startVoiceRecognition() {
    if (!config.input.voiceEnabled || !SpeechRecognition) {
      state.voiceStatus = config.input.voiceUnavailableText;
      logger?.warn('Voice recognition unavailable');
      return;
    }

    if (!recognizer) {
      recognizer = new SpeechRecognition();
      recognizer.lang = config.input.speechLanguage;
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.onstart = () => {
        state.voiceListening = true;
        state.voiceStatus = config.input.voiceListeningText;
        logger?.info('Voice recognition started');
      };
      recognizer.onend = () => {
        state.voiceListening = false;
        if (state.voiceStatus === config.input.voiceListeningText) state.voiceStatus = config.input.voiceReadyText;
        logger?.info('Voice recognition ended');
      };
      recognizer.onerror = (event) => {
        state.voiceListening = false;
        state.voiceStatus = `${config.input.voiceUnavailableText}: ${event.error}`;
        logger?.warn('Voice recognition error', event.error);
      };
      recognizer.onresult = (event) => {
        const transcript = event.results?.[config.match.minHp]?.[config.match.minHp]?.transcript ?? '';
        const clipped = truncateTranscript(transcript, config);
        state.voiceStatus = `Heard: ${clipped}`;
        attemptCommand(state, config.match.playerId, transcript, 'voice', logger, config);
      };
    }

    try {
      recognizer.start();
    } catch (error) {
      state.voiceStatus = config.input.voiceUnavailableText;
      logger?.warn('Voice recognition could not start', error.message);
    }
  }

  function handleCanvasPointer(event) {
    event.preventDefault();
    const point = mapPointerToCanvas(event, canvas, config);
    const prepRects = getPreparationRects(config);
    if (state.phase === config.states.preparation) {
      state.preparation.nameFieldFocused = pointInRect(point, prepRects.nameField);
      const gridPoint = findGridPointAtPoint(point, config);
      if (gridPoint) {
        addPatternPoint(state, gridPoint.id, logger, config);
        return;
      }
    }

    const button = findButtonAtPoint(state, point);
    if (!button) return;

    if (button.kind === 'spell-type') {
      selectSpellType(state, button.spellType, logger, config);
      return;
    }

    if (button.kind === 'random-spell-type') {
      randomizeSpellType(state, random, logger, config);
      return;
    }

    if (button.kind === 'random-pattern') {
      randomizeDraftPattern(state, random, logger, config);
      return;
    }

    if (button.kind === 'clear-pattern') {
      clearDraftPattern(state, logger, config);
      return;
    }

    if (button.kind === 'cycle-name') {
      cycleDraftName(state, logger, config);
      return;
    }

    if (button.kind === 'save-spell') {
      saveDraftSpell(state, logger, config);
      return;
    }

    if (button.kind === 'prepare-all-spells') {
      prepareAllSpells(state, logger, config);
      return;
    }

    if (button.kind === 'basic-action') {
      submitBasicAction(button.actionId, 'canvas-button');
      return;
    }

    if (button.kind === 'voice') {
      startVoiceRecognition();
      return;
    }

    if (button.kind === 'restart') {
      restartMatch('canvas-button');
      return;
    }

    if (button.kind === 'preview-match') {
      confirmLoadout(state, logger, config);
      return;
    }

    if (button.kind === 'back-to-forge') {
      showPreparation(state, logger, config);
    }
  }

  function handleKeyboard(event) {
    if (state.phase === config.states.preparation && editDraftName(state, event.key, logger, config)) {
      event.preventDefault();
      return;
    }

    const key = String(event.key).toLowerCase();
    const actionId = getActionByKey(key, config);
    if (actionId) {
      event.preventDefault();
      submitBasicAction(actionId, 'keyboard');
      return;
    }

    if (key === config.input.restartKey) {
      event.preventDefault();
      restartMatch('keyboard');
      return;
    }

    if (key === config.input.voiceKey) {
      event.preventDefault();
      startVoiceRecognition();
      return;
    }
  }

  return {
    attach() {
      canvas.addEventListener('pointerdown', handleCanvasPointer);
      canvas.addEventListener('touchstart', handleCanvasPointer, { passive: false });
      windowRef.addEventListener('keydown', handleKeyboard);
      state.voiceStatus = SpeechRecognition ? config.input.voiceReadyText : config.input.voiceUnavailableText;
      logger?.info('Input handlers attached');
    },
    detach() {
      canvas.removeEventListener('pointerdown', handleCanvasPointer);
      canvas.removeEventListener('touchstart', handleCanvasPointer);
      windowRef.removeEventListener('keydown', handleKeyboard);
      logger?.info('Input handlers detached');
    },
    submitBasicAction,
    startVoiceRecognition,
    restartMatch
  };
}
