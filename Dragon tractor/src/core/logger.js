import { CONFIG } from '../config.js';

export function createLogger(config = CONFIG) {
  function canLog(flagName) {
    return config.logging.enableDebugLogs && config.logging[flagName];
  }

  return {
    diagnostics(message, details) {
      if (canLog('logDiagnostics')) console.log(config.logging.prefix, message, details || '');
    },
    state(message, details) {
      if (canLog('logStateTransitions')) console.log(config.logging.prefix, message, details || '');
    },
    input(message, details) {
      if (canLog('logInputEvents')) console.log(config.logging.prefix, message, details || '');
    },
    loadout(message, details) {
      if (canLog('logInputEvents')) console.log(config.logging.prefix, message, details || '');
    },
    renderer(message, details) {
      if (canLog('logRendererWarnings')) console.warn(config.logging.prefix, message, details || '');
    }
  };
}
