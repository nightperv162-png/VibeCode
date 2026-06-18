import { attemptCommand } from '../combat/actions.js';
import { restartMatch } from '../combat/matchRules.js';
import { mapKeyboardCommand } from './inputMapper.js';

export function registerKeyboardInput({ config, state, logger }) {
  window.addEventListener(config.input.keyboardCommandEvent, (event) => {
    if (!config.input.enableKeyboardInput) {
      return;
    }

    if (state.phase === config.match.resultPhase && event.key.toLowerCase() === config.input.restartKey) {
      Object.assign(state, restartMatch(state, config));
      logger.log('inputEvents', 'keyboard restart', { phase: state.phase });
      return;
    }

    const command = mapKeyboardCommand(config, event.key);
    Object.assign(state, attemptCommand(state, config, 'player1', command));
    logger.log('inputEvents', 'keyboard command attempted', state.lastCommandResult);
  });
}
