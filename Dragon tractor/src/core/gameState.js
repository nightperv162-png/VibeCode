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
    contractCreation: {
      hasDrawing: false,
      analysisContract: config.contracts.sampleAnalysisContract
    },
    loadoutDetailsOverlay: null,
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
    contractLibrary: [config.contracts.sampleVitalityContract],
    equippedSlots: config.contracts.slotMarkerLabels.map((markerLabel, index) => ({
      slotId: markerLabel,
      markerLabel,
      contractId: index === config.contracts.maxEquippedSlots - config.process.failureStatus ? config.contracts.sampleVitalityContract.id : null,
      resolvedCallName: config.contracts.placeholderCallNames[index],
      energyCost: config.contracts.placeholderEnergyCosts[index],
      resonanceLabel: config.contracts.resonanceLabels[0],
      stateLabel: config.labels.readyState,
      detailsContract: index === config.contracts.maxEquippedSlots - config.process.failureStatus ? config.contracts.sampleVitalityContract : null
    })),
    guide: {
      screen: config.states.initialScreen
    }
  };
}
