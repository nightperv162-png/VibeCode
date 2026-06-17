import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIG } from '../src/config.js';
import { createDiagnostics } from '../src/core/diagnostics.js';
import { createInitialGameState } from '../src/core/gameState.js';
import { closeGuide, getOrderedScreens, moveScreen, openGuide, transitionTo } from '../src/core/stateMachine.js';
import { getLoadoutDetailsLines, formatCompactSlotCard } from '../src/render/canvasRenderer.js';
import { handleCanvasHover, handleCanvasPointer } from '../src/ui/canvasButtonSystem.js';
import { createHitRegions, findHitRegion, pointInRect } from '../src/ui/hitRegions.js';

test('config loads required Milestone 1 sections', () => {
  assert.equal(CONFIG.meta.title, 'Dragon Contractor');
  assert.ok(CONFIG.app.canvasWidth > 0);
  assert.ok(CONFIG.app.canvasHeight > 0);
  assert.equal(CONFIG.contracts.maxEquippedSlots, CONFIG.layout.combatSlotRects.length);
  assert.equal(CONFIG.contracts.maxEquippedSlots, CONFIG.layout.loadoutSlotRects.length);
  assert.deepEqual(CONFIG.contracts.enabledContractTypes, ['Damage', 'Burst', 'Heal', 'Energy', 'Buff', 'Curse', 'Vitality']);
  assert.equal(Object.values(CONFIG.states).includes('ContractAnalysis'), false);
});

test('initial game state is serializable and starts on contract creation', () => {
  const state = createInitialGameState(CONFIG);
  assert.equal(state.activeScreen, CONFIG.states.contractCreation);
  assert.equal(state.player.hp, CONFIG.match.startingHp);
  assert.equal(state.enemy.energy, CONFIG.match.startingEnergy);
  assert.equal(state.equippedSlots.length, CONFIG.contracts.maxEquippedSlots);
  assert.equal(state.contractCreation.hasDrawing, false);
  assert.equal(state.loadoutDetailsOverlay, null);
  assert.doesNotThrow(() => JSON.stringify(state));
});

test('state machine transitions only to known screens', () => {
  const state = createInitialGameState(CONFIG);
  const loadout = transitionTo(state, CONFIG.states.loadout, CONFIG);
  assert.equal(loadout.activeScreen, CONFIG.states.loadout);
  assert.equal(loadout.previousScreen, CONFIG.states.contractCreation);
  const failed = transitionTo(loadout, 'MissingScreen', CONFIG);
  assert.equal(failed.activeScreen, CONFIG.states.loadout);
  assert.equal(failed.latestFailureReason, 'Unknown Screen');
});

test('screen cycling covers all milestone screens', () => {
  const screens = getOrderedScreens(CONFIG);
  assert.deepEqual(screens, [CONFIG.states.contractCreation, CONFIG.states.loadout, CONFIG.states.combat, CONFIG.states.pause, CONFIG.states.result]);
  let state = createInitialGameState(CONFIG);
  for (const screen of screens.slice(1)) {
    state = moveScreen(state, CONFIG.process.failureStatus, CONFIG);
    assert.equal(state.activeScreen, screen);
  }
  state = moveScreen(state, CONFIG.process.failureStatus, CONFIG);
  assert.equal(state.activeScreen, screens[0]);
});

test('drawing reveals Contract Analysis only inside Contract Creation', () => {
  const state = createInitialGameState(CONFIG);
  const drawPoint = {
    x: CONFIG.layout.drawingAreaRect.x + CONFIG.layout.drawingAreaRect.width / 2,
    y: CONFIG.layout.drawingAreaRect.y + CONFIG.layout.drawingAreaRect.height / 2
  };
  const afterDrawing = handleCanvasPointer(state, drawPoint, CONFIG);
  assert.equal(afterDrawing.activeScreen, CONFIG.states.contractCreation);
  assert.equal(afterDrawing.contractCreation.hasDrawing, true);
  const regions = createHitRegions(afterDrawing, CONFIG);
  assert.ok(regions.some((region) => region.id === 'saveContract'));
  assert.ok(regions.some((region) => region.id === 'redrawContract'));
});

test('saving drawn placeholder contract moves to Loadout without permanent analysis screen', () => {
  const drawn = {
    ...createInitialGameState(CONFIG),
    contractCreation: {
      hasDrawing: true,
      analysisContract: CONFIG.contracts.sampleAnalysisContract
    }
  };
  const savePoint = {
    x: CONFIG.layout.saveContractButtonRect.x + CONFIG.layout.saveContractButtonRect.width / 2,
    y: CONFIG.layout.saveContractButtonRect.y + CONFIG.layout.saveContractButtonRect.height / 2
  };
  const saved = handleCanvasPointer(drawn, savePoint, CONFIG);
  assert.equal(saved.activeScreen, CONFIG.states.loadout);
  assert.equal(saved.contractLibrary[0].id, CONFIG.contracts.sampleAnalysisContract.id);
  assert.equal(saved.loadoutDetailsOverlay, null);
});

test('Loadout details overlay opens from library or slot and closes on hover away', () => {
  const loadout = transitionTo(createInitialGameState(CONFIG), CONFIG.states.loadout, CONFIG);
  const libraryPoint = {
    x: CONFIG.layout.libraryItemRects[0].x + CONFIG.layout.libraryItemRects[0].width / 2,
    y: CONFIG.layout.libraryItemRects[0].y + CONFIG.layout.libraryItemRects[0].height / 2
  };
  const withDetails = handleCanvasHover(loadout, libraryPoint, CONFIG);
  assert.equal(withDetails.loadoutDetailsOverlay.contract.id, CONFIG.contracts.sampleVitalityContract.id);
  const awayPoint = {
    x: CONFIG.layout.topBarRect.x,
    y: CONFIG.layout.topBarRect.y
  };
  const closed = handleCanvasHover(withDetails, awayPoint, CONFIG);
  assert.equal(closed.loadoutDetailsOverlay, null);
});

test('Loadout details include required fields and Vitality is Max HP only', () => {
  const details = {
    contract: CONFIG.contracts.sampleVitalityContract,
    currentCallName: CONFIG.contracts.sampleVitalityContract.callName
  };
  const lines = getLoadoutDetailsLines(details);
  assert.ok(lines.includes("Vorn's Blood Crown"));
  assert.ok(lines.includes('Vitality Contract'));
  assert.ok(lines.includes('Effect: +50 Max HP'));
  assert.ok(lines.includes('Duration/rate: 7s'));
  assert.ok(lines.includes('Energy Cost: 25 Energy'));
  assert.ok(lines.includes('Cooldown: 1.5s'));
  assert.ok(lines.includes('Grade: Strong'));
  assert.ok(lines.includes('Trait: Ancient'));
  assert.ok(lines.includes('Resonance: Normal'));
  assert.ok(lines.includes('Current Call Name: Vorn'));
  assert.equal(lines.some((line) => line.includes('instant HP') || line.includes('temporary Max HP')), false);
});

test('compact combat cards contain only marker Call Name and Energy cost', () => {
  const state = createInitialGameState(CONFIG);
  assert.deepEqual(state.equippedSlots.map((slot) => formatCompactSlotCard(slot, CONFIG)), [
    '[A] Ignivar    10',
    '[B] Voltaris   30',
    '[C] Mirava     25',
    '[D] Vorn       25'
  ]);
});

test('guide overlay state opens and closes with combat pause behavior', () => {
  const combat = transitionTo(createInitialGameState(CONFIG), CONFIG.states.combat, CONFIG);
  const guided = openGuide(combat);
  assert.equal(guided.isGuideOpen, true);
  assert.equal(guided.isPaused, true);
  assert.equal(guided.guide.screen, CONFIG.states.combat);
  const closed = closeGuide(guided);
  assert.equal(closed.isGuideOpen, false);
  assert.equal(closed.isPaused, false);
});

test('hit regions include guide navigation and combat slots', () => {
  const state = transitionTo(createInitialGameState(CONFIG), CONFIG.states.combat, CONFIG);
  const regions = createHitRegions(state, CONFIG);
  assert.ok(regions.some((region) => region.id === 'guide'));
  assert.ok(regions.some((region) => region.id === 'pause'));
  assert.equal(regions.filter((region) => region.action === 'selectCombatSlot').length, CONFIG.contracts.maxEquippedSlots);
});

test('point mapping finds the expected Canvas hit region', () => {
  const state = createInitialGameState(CONFIG);
  const regions = createHitRegions(state, CONFIG);
  const point = {
    x: CONFIG.layout.guideButtonRect.x + CONFIG.layout.guideButtonRect.width / 2,
    y: CONFIG.layout.guideButtonRect.y + CONFIG.layout.guideButtonRect.height / 2
  };
  assert.equal(pointInRect(point, CONFIG.layout.guideButtonRect), true);
  assert.equal(findHitRegion(point, regions).id, 'guide');
});

test('canvas pointer opens and closes guide through hit regions', () => {
  const state = createInitialGameState(CONFIG);
  const guidePoint = {
    x: CONFIG.layout.guideButtonRect.x + CONFIG.layout.guideButtonRect.width / 2,
    y: CONFIG.layout.guideButtonRect.y + CONFIG.layout.guideButtonRect.height / 2
  };
  const guided = handleCanvasPointer(state, guidePoint, CONFIG);
  assert.equal(guided.isGuideOpen, true);
  const closePoint = {
    x: CONFIG.layout.guideOverlayRect.x + CONFIG.layout.guideOverlayRect.width / 2,
    y: CONFIG.layout.guideOverlayRect.y + CONFIG.layout.guideOverlayRect.height / 2
  };
  const closed = handleCanvasPointer(guided, closePoint, CONFIG);
  assert.equal(closed.isGuideOpen, false);
});

test('diagnostics exposes build and screen metadata', () => {
  const diagnostics = createDiagnostics(CONFIG);
  assert.equal(diagnostics.devServerUrl, CONFIG.diagnostics.localDevServerUrl);
  assert.equal(diagnostics.canvasSize.width, CONFIG.app.canvasWidth);
  assert.ok(diagnostics.screens.includes(CONFIG.states.result));
});
