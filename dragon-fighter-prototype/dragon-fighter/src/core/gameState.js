export function createInitialGameState(config) {
  const cooldowns = Object.fromEntries(
    config.input.validCommands.map((command) => [command, config.math.zero])
  );
  const defaultPlayerDragon = config.dragons.options[config.math.zero];

  return {
    phase: config.match.initialPhase,
    dragonSelect: {
      selectedDragonId: null,
      feedback: config.labels.dragonSelectReadyFeedback
    },
    timerSeconds: config.match.durationSeconds,
    countdownSeconds: config.match.countdownSeconds,
    latestPlayerCommand: config.labels.noPlayerCommand,
    latestAiCommand: config.labels.noAiCommand,
    lastCommandResult: null,
    result: null,
    ai: {
      actionTimerSeconds: config.ai.initialActionTimerSeconds,
      defensiveReactionSeconds: config.math.zero
    },
    players: {
      player1: createSideState({
        id: 'player1',
        name: config.labels.player1Name,
        element: config.labels.player1Element,
        dragon: defaultPlayerDragon,
        hp: config.match.startingHp,
        stateLabel: config.labels.idleState,
        cooldowns,
        zero: config.math.zero
      }),
      player2: createSideState({
        id: 'player2',
        name: config.labels.player2Name,
        element: config.labels.player2Element,
        dragon: config.dragons.enemyDefault,
        hp: config.match.startingHp,
        stateLabel: config.labels.idleState,
        cooldowns,
        zero: config.math.zero
      })
    }
  };
}

export function selectDragon(state, config, dragonId) {
  const selectedDragon = getDragonById(config, dragonId);

  if (!selectedDragon) {
    return {
      ...state,
      dragonSelect: {
        ...state.dragonSelect,
        feedback: config.labels.dragonSelectBlockedFeedback
      }
    };
  }

  return {
    ...state,
    dragonSelect: {
      selectedDragonId: selectedDragon.id,
      feedback: selectedDragon.name
    }
  };
}

export function confirmDragonSelection(state, config) {
  const selectedDragon = getDragonById(config, state.dragonSelect.selectedDragonId);

  if (!selectedDragon) {
    return {
      ...state,
      dragonSelect: {
        ...state.dragonSelect,
        feedback: config.labels.dragonSelectBlockedFeedback
      }
    };
  }

  return {
    ...state,
    phase: config.match.countdownPhase,
    countdownSeconds: config.match.countdownSeconds,
    timerSeconds: config.match.durationSeconds,
    result: null,
    latestPlayerCommand: config.labels.noPlayerCommand,
    latestAiCommand: config.labels.noAiCommand,
    lastCommandResult: null,
    ai: {
      actionTimerSeconds: config.ai.initialActionTimerSeconds,
      defensiveReactionSeconds: config.math.zero
    },
    players: {
      ...state.players,
      player1: {
        ...state.players.player1,
        dragon: selectedDragon
      }
    },
    dragonSelect: {
      ...state.dragonSelect,
      feedback: selectedDragon.name
    }
  };
}

export function getDragonById(config, dragonId) {
  return config.dragons.options.find((dragon) => dragon.id === dragonId) ?? null;
}

function createSideState({ id, name, element, dragon, hp, stateLabel, cooldowns, zero }) {
  const activeEffects = Object.fromEntries(
    Object.keys(cooldowns).map((command) => [command, zero])
  );

  return {
    id,
    name,
    element,
    dragon,
    hp,
    stateLabel,
    stateLabelSeconds: zero,
    activeEffects,
    cooldowns: { ...cooldowns }
  };
}
