import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { attemptCommand } from '../src/combat/actions.js';
import { updateCombatTimers } from '../src/combat/cooldowns.js';
import { resolveIncomingDamage } from '../src/combat/damageResolver.js';
import { updateMatchFlow } from '../src/combat/matchRules.js';
import { confirmDragonSelection, createInitialGameState, selectDragon } from '../src/core/gameState.js';
import { mapCanvasCommand, mapKeyboardCommand, normalizeCommand } from '../src/input/inputMapper.js';

function createActiveState() {
  return updateMatchFlow(confirmDragonSelection(
    selectDragon(createInitialGameState(CONFIG), CONFIG, CONFIG.dragons.options[CONFIG.math.zero].id),
    CONFIG
  ), CONFIG, CONFIG.match.countdownSeconds);
}

test('command mapping accepts complete command words', () => {
  assert.equal(normalizeCommand(CONFIG, 'Attack'), 'Attack');
  assert.equal(normalizeCommand(CONFIG, 'defence'), 'Defence');
  assert.equal(normalizeCommand(CONFIG, 'Block'), 'Block');
  assert.equal(normalizeCommand(CONFIG, 'Skill'), 'Skill');
});

test('unknown command rejection updates failure feedback', () => {
  const state = attemptCommand(createActiveState(), CONFIG, 'player1', 'Spin');

  assert.equal(state.lastCommandResult.success, false);
  assert.equal(state.lastCommandResult.reason, CONFIG.labels.unknownCommandReason);
  assert.equal(state.latestPlayerCommand, CONFIG.labels.unknownCommandReason);
});

test('keyboard and Canvas mapping feed the same command path', () => {
  assert.equal(mapKeyboardCommand(CONFIG, 'a'), 'Attack');
  assert.equal(mapCanvasCommand(CONFIG, 'Attack'), mapKeyboardCommand(CONFIG, 'a'));
});

test('cooldown success and failure follow action availability', () => {
  const afterAttack = attemptCommand(createActiveState(), CONFIG, 'player1', 'Attack');
  const repeatAttack = attemptCommand(afterAttack, CONFIG, 'player1', 'Attack');
  const afterCooldown = updateCombatTimers(afterAttack, CONFIG, CONFIG.actions.attackCooldownSeconds);
  const secondAttack = attemptCommand(afterCooldown, CONFIG, 'player1', 'Attack');

  assert.equal(afterAttack.lastCommandResult.success, true);
  assert.equal(repeatAttack.lastCommandResult.reason, CONFIG.labels.cooldownReason);
  assert.equal(secondAttack.lastCommandResult.success, true);
});

test('Attack deals configured damage', () => {
  const state = attemptCommand(createActiveState(), CONFIG, 'player1', 'Attack');

  assert.equal(state.players.player2.hp, CONFIG.match.startingHp - CONFIG.actions.attackDamage);
});

test('Defence reduces incoming damage by configured multiplier', () => {
  const defended = attemptCommand(createActiveState(), CONFIG, 'player2', 'Defence');
  const state = attemptCommand(defended, CONFIG, 'player1', 'Attack');
  const expectedDamage = CONFIG.actions.attackDamage * CONFIG.actions.defenceDamageMultiplier;

  assert.equal(state.players.player2.hp, CONFIG.match.startingHp - expectedDamage);
});

test('Block prevents incoming damage', () => {
  const blocked = attemptCommand(createActiveState(), CONFIG, 'player2', 'Block');
  const state = attemptCommand(blocked, CONFIG, 'player1', 'Skill');

  assert.equal(state.players.player2.hp, CONFIG.match.startingHp);
});

test('Block has priority over Defence', () => {
  const target = {
    ...createActiveState().players.player2,
    activeEffects: {
      Attack: CONFIG.math.zero,
      Defence: CONFIG.actions.defenceDurationSeconds,
      Block: CONFIG.actions.blockDurationSeconds,
      Skill: CONFIG.math.zero
    }
  };

  assert.equal(resolveIncomingDamage(CONFIG, target, CONFIG.actions.skillDamage), CONFIG.math.zero);
});

test('Skill deals configured damage', () => {
  const state = attemptCommand(createActiveState(), CONFIG, 'player1', 'Skill');

  assert.equal(state.players.player2.hp, CONFIG.match.startingHp - CONFIG.actions.skillDamage);
});

test('HP clamps at zero', () => {
  const wounded = createActiveState();
  wounded.players.player2.hp = CONFIG.actions.skillDamage;
  const state = attemptCommand(wounded, CONFIG, 'player1', 'Skill');

  assert.equal(state.players.player2.hp, CONFIG.match.minHp);
  assert.equal(state.players.player2.stateLabel, CONFIG.labels.defeatedState);
});

test('defeated actor cannot act', () => {
  const defeated = createActiveState();
  defeated.players.player1.hp = CONFIG.match.minHp;
  const state = attemptCommand(defeated, CONFIG, 'player1', 'Attack');

  assert.equal(state.lastCommandResult.success, false);
  assert.equal(state.lastCommandResult.reason, CONFIG.labels.defeatedReason);
});

test('inactive match rejects valid commands', () => {
  const state = attemptCommand(createInitialGameState(CONFIG), CONFIG, 'player1', 'Attack');

  assert.equal(state.lastCommandResult.success, false);
  assert.equal(state.lastCommandResult.reason, CONFIG.labels.inactiveReason);
});

test('feedback updates for successful and failed commands', () => {
  const success = attemptCommand(createActiveState(), CONFIG, 'player1', 'Attack');
  const failure = attemptCommand(success, CONFIG, 'player1', 'Attack');

  assert.equal(success.latestPlayerCommand, 'Attack');
  assert.equal(success.players.player1.stateLabel, 'Attack');
  assert.equal(failure.latestPlayerCommand, CONFIG.labels.cooldownReason);
  assert.equal(failure.players.player1.stateLabel, CONFIG.labels.cooldownReason);
});
