import { CONFIG } from '../config.js';

export function createInitialGameState(config = CONFIG) {
  return {
    activeScreen: config.states.initialScreen,
    previousScreen: null,
    isGuideOpen: false,
    isPaused: false,
    selectedContractType: config.contracts.enabledContractTypes[0],
    latestInput: null,
    latestFailureReason: null,
    match: {
      timerSeconds: config.match.matchDurationSeconds,
      countdownSeconds: config.match.countdownSeconds,
      result: null
    },
    player: {
      hp: config.match.startingHp,
      maxHp: config.match.baseMaxHp,
      energy: config.match.startingEnergy
    },
    enemy: {
      hp: config.match.startingHp,
      maxHp: config.match.baseMaxHp,
      energy: config.match.startingEnergy
    },
    contractLibrary: [],
    equippedSlots: config.contracts.slotMarkerLabels.map((markerLabel, index) => ({
      slotId: markerLabel,
      markerLabel,
      contractId: null,
      resolvedCallName: config.contracts.placeholderCallNames[index],
      energyCost: config.contracts.placeholderEnergyCosts[index],
      resonanceLabel: config.contracts.resonanceLabels[0],
      stateLabel: config.labels.readyState
    })),
    guide: {
      screen: config.states.initialScreen
    }
  };
}
