import { CONFIG } from '../config.js';
import { commandTextForAction, getActionByKey, truncateTranscript } from '../combat/actions.js';
import { attemptCommand } from '../combat/matchRules.js';
import { resetGameState } from '../core/gameState.js';

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

function getSpeechRecognitionConstructor(windowRef) {
  return windowRef.SpeechRecognition ?? windowRef.webkitSpeechRecognition ?? null;
}

export function createInputController({ canvas, state, logger, config = CONFIG, windowRef = window }) {
  const SpeechRecognition = getSpeechRecognitionConstructor(windowRef);
  let recognizer = null;

  function submitAction(actionId, source) {
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
    const button = findButtonAtPoint(state, point);
    if (!button) return;

    if (button.kind === 'action') {
      submitAction(button.actionId, 'canvas-button');
      return;
    }

    if (button.kind === 'voice') {
      startVoiceRecognition();
      return;
    }

    if (button.kind === 'restart') {
      restartMatch('canvas-button');
    }
  }

  function handleKeyboard(event) {
    const key = String(event.key).toLowerCase();
    const actionId = getActionByKey(key, config);
    if (actionId) {
      event.preventDefault();
      submitAction(actionId, 'keyboard');
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
    submitAction,
    startVoiceRecognition,
    restartMatch
  };
}
