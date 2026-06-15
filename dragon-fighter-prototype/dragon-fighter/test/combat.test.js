import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, ACTION_IDS } from '../src/config.js';
import { getActionByCommand, getActionByKey } from '../src/combat/actions.js';
import { attemptCommand, chooseResult } from '../src/combat/matchRules.js';
import { createInitialGameState } from '../src/core/gameState.js';

function activeState() {
  const state = createInitialGameState(CONFIG);
  state.phase = CONFIG.match.activePhase;
  return state;
}

test('config exposes all four prototype actions from the GDD', () => {
  assert.deepEqual(ACTION_IDS, ['attack', 'defence', 'block', 'skill']);
  assert.equal(CONFIG.actions.attack.damage, 10);
  assert.equal(CONFIG.actions.defence.activeSeconds, 3);
  assert.equal(CONFIG.actions.block.activeSeconds, 1);
  assert.equal(CONFIG.actions.skill.damage, 25);
});

test('full command words map to actions and incomplete/extra phrases fail', () => {
  assert.equal(getActionByCommand('Attack'), 'attack');
  assert.equal(getActionByCommand('Defence'), 'defence');
  assert.equal(getActionByCommand('Block'), 'block');
  assert.equal(getActionByCommand('Skill'), 'skill');
  assert.equal(getActionByCommand('Attack now'), null);
  assert.equal(getActionByCommand('Att'), null);
});

test('desktop fallback keys map to the same action ids', () => {
  assert.equal(getActionByKey('a'), 'attack');
  assert.equal(getActionByKey('d'), 'defence');
  assert.equal(getActionByKey('b'), 'block');
  assert.equal(getActionByKey('s'), 'skill');
  assert.equal(getActionByKey('x'), null);
});

test('attack damages the opponent and starts cooldown', () => {
  const state = activeState();
  const result = attemptCommand(state, CONFIG.match.playerId, 'Attack', 'test');
  assert.equal(result.ok, true);
  assert.equal(state.sides[CONFIG.match.aiId].hp, CONFIG.match.startingHp - CONFIG.actions.attack.damage);
  assert.equal(state.sides[CONFIG.match.playerId].cooldowns.attack, CONFIG.actions.attack.cooldownSeconds);
});

test('action fails clearly when used during cooldown', () => {
  const state = activeState();
  attemptCommand(state, CONFIG.match.playerId, 'Attack', 'test');
  const result = attemptCommand(state, CONFIG.match.playerId, 'Attack', 'test');
  assert.equal(result.ok, false);
  assert.equal(result.reason, CONFIG.combat.cooldownReason);
  assert.equal(state.sides[CONFIG.match.playerId].actionLabel, CONFIG.combat.cooldownLabel);
});

test('defence halves incoming damage for its active duration', () => {
  const state = activeState();
  attemptCommand(state, CONFIG.match.playerId, 'Defence', 'test');
  const result = attemptCommand(state, CONFIG.match.aiId, 'Attack', 'test');
  assert.equal(result.ok, true);
  assert.equal(state.sides[CONFIG.match.playerId].hp, CONFIG.match.startingHp - CONFIG.actions.attack.damage * CONFIG.combat.defenceDamageMultiplier);
});

test('block prevents all incoming damage and has priority over defence', () => {
  const state = activeState();
  state.sides[CONFIG.match.playerId].activeDefenceSeconds = CONFIG.actions.defence.activeSeconds;
  attemptCommand(state, CONFIG.match.playerId, 'Block', 'test');
  const result = attemptCommand(state, CONFIG.match.aiId, 'Skill', 'test');
  assert.equal(result.ok, true);
  assert.equal(state.sides[CONFIG.match.playerId].hp, CONFIG.match.startingHp);
});

test('skill deals configured special damage when not blocked', () => {
  const state = activeState();
  const result = attemptCommand(state, CONFIG.match.playerId, 'Skill', 'test');
  assert.equal(result.ok, true);
  assert.equal(state.sides[CONFIG.match.aiId].hp, CONFIG.match.startingHp - CONFIG.actions.skill.damage);
});

test('commands are ignored outside active match state', () => {
  const state = createInitialGameState(CONFIG);
  const result = attemptCommand(state, CONFIG.match.playerId, 'Attack', 'test');
  assert.equal(result.ok, false);
  assert.equal(result.reason, CONFIG.combat.inactiveReason);
  assert.equal(state.sides[CONFIG.match.aiId].hp, CONFIG.match.startingHp);
});

test('result rules handle win, lose, draw, and timer resolution', () => {
  const winState = activeState();
  winState.sides[CONFIG.match.aiId].hp = CONFIG.match.minHp;
  assert.equal(chooseResult(winState).label, CONFIG.match.winLabel);

  const loseState = activeState();
  loseState.sides[CONFIG.match.playerId].hp = CONFIG.match.minHp;
  assert.equal(chooseResult(loseState).label, CONFIG.match.loseLabel);

  const drawState = activeState();
  drawState.sides[CONFIG.match.playerId].hp = CONFIG.match.minHp;
  drawState.sides[CONFIG.match.aiId].hp = CONFIG.match.minHp;
  assert.equal(chooseResult(drawState).label, CONFIG.match.drawLabel);

  const timerWinState = activeState();
  timerWinState.matchRemaining = CONFIG.match.minHp;
  timerWinState.sides[CONFIG.match.playerId].hp = CONFIG.match.startingHp;
  timerWinState.sides[CONFIG.match.aiId].hp = CONFIG.match.startingHp - CONFIG.actions.attack.damage;
  assert.equal(chooseResult(timerWinState).label, CONFIG.match.winLabel);
});
