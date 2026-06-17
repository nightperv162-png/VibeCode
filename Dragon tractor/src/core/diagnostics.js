import { CONFIG } from '../config.js';

export function createDiagnostics(config = CONFIG) {
  return {
    title: config.meta.title,
    version: config.meta.version,
    devServerUrl: config.diagnostics.localDevServerUrl,
    canvasSize: {
      width: config.app.canvasWidth,
      height: config.app.canvasHeight
    },
    enabledContractTypes: [...config.contracts.enabledContractTypes],
    screens: Object.values(config.states)
  };
}
