import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIG } from '../src/config.js';
import { createDiagnostics } from '../src/core/diagnostics.js';
import { createInitialGameState } from '../src/core/gameState.js';
import { closeGuide, getOrderedScreens, moveScreen, openGuide, transitionTo } from '../src/core/stateMachine.js';
import { handleCanvasPointer } from '../src/ui/canvasButtonSystem.js';
import { createHitRegions, findHitRegion, pointInRect } from '../src/ui/hitRegions.js';

test('config loads required Milestone 1 sections', () => {
  assert.equal(CONFIG.meta.title, 'Dragon Contractor');
  assert.ok(CONFIG.app.canvasWidth > 0);
  assert.ok(CONFIG.app.canvasHeight > 0);
  assert.equal(CONFIG.contracts.maxEquippedSlots, CONFIG.layout.combatSlotRects.length);
  assert.equal(CONFIG.contracts.maxEquippedSlots, CONFIG.layout.loadoutSlotRects.length);
  assert.deepEqual(CONFIG.contracts.enabledContractTypes, ['Damage', 'Burst', 'Heal', 'Energy', 'Buff', 'Curse', 'Vitality']);
});

test('initial game state is serializable and starts on contract creation', () => {
  const state = createInitialGameState(CONFIG);
  assert.equal(state.activeScreen, CONFIG.states.contractCreation);
  assert.equal(state.player.hp, CONFIG.match.startingHp);
  assert.equal(state.enemy.energy, CONFIG.match.startingEnergy);
  assert.equal(state.equippedSlots.length, CONFIG.contracts.maxEquippedSlots);
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
  let state = createInitialGameState(CONFIG);
  for (const screen of screens.slice(1)) {
    state = moveScreen(state, CONFIG.process.failureStatus, CONFIG);
    assert.equal(state.activeScreen, screen);
  }
  state = moveScreen(state, CONFIG.process.failureStatus, CONFIG);
  assert.equal(state.activeScreen, screens[0]);
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
