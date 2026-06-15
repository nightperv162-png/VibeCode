import { CONFIG } from '../config.js';

export function createLogger(config = CONFIG) {
  function write(level, message, details) {
    if (!config.logging.enabled) return;
    const prefix = `${config.logging.prefix} ${message}`;
    if (details === undefined) {
      console[level](prefix);
      return;
    }
    console[level](prefix, details);
  }

  return {
    info(message, details) {
      write('log', message, details);
    },
    warn(message, details) {
      write('warn', message, details);
    },
    frame(message, details) {
      if (config.logging.verboseFrames) write('log', message, details);
    }
  };
}
