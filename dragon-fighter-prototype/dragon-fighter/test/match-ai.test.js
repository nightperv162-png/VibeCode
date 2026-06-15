import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { chooseAiAction, updateAi } from '../src/ai/aiController.js';
import { createInitialGameState, resetGameState } from '../src/core/gameState.js';
import { updateMatchState } from '../src/states/matchState.js';

function activeState() {
  const state = createInitialGameState(CONFIG);
  state.phase = CONFIG.match.activePhase;
  state.countdownRemaining = CONFIG.match.minHp;
  return state;
}

test('countdown transitions to active phase and displays fight banner', () => {
  const state = createInitialGameState(CONFIG);
  updateMatchState(state, CONFIG.match.countdownSeconds, () => CONFIG.match.minHp, null, CONFIG);
  assert.equal(state.phase, CONFIG.match.activePhase);
  assert.equal(state.fightBannerRemaining, CONFIG.match.fightBannerSeconds);
});

test('AI prefers attack when skill is unavailable', () => {
  const state = activeState();
  state.sides[CONFIG.match.aiId].cooldowns.skill = CONFIG.actions.skill.cooldownSeconds;
  const action = chooseAiAction(state, () => CONFIG.match.minHp, CONFIG);
  assert.equal(action, 'attack');
});

test('AI may block in response to player skill when block is available', () => {
  const state = activeState();
  state.sides[CONFIG.match.playerId].lastSuccessfulAction = 'skill';
  const action = chooseAiAction(state, () => CONFIG.match.minHp, CONFIG);
  assert.equal(action, 'block');
});

test('AI cannot act after defeat', () => {
  const state = activeState();
  state.sides[CONFIG.match.aiId].defeated = true;
  const action = chooseAiAction(state, () => CONFIG.match.minHp, CONFIG);
  assert.equal(action, null);
  const result = updateAi(state, CONFIG.ai.actionIntervalSeconds, () => CONFIG.match.minHp, null, CONFIG);
  assert.equal(result, null);
});

test('match timer ending chooses result phase', () => {
  const state = activeState();
  state.matchRemaining = CONFIG.match.minHp;
  state.sides[CONFIG.match.playerId].hp = CONFIG.match.startingHp;
  state.sides[CONFIG.match.aiId].hp = CONFIG.match.startingHp - CONFIG.actions.attack.damage;
  updateMatchState(state, CONFIG.match.minHp, () => CONFIG.match.minHp, null, CONFIG);
  assert.equal(state.phase, CONFIG.match.resultPhase);
  assert.equal(state.result, CONFIG.match.winLabel);
});

test('restart reset restores countdown, HP, cooldowns, labels, and result state', () => {
  const state = activeState();
  state.result = CONFIG.match.loseLabel;
  state.phase = CONFIG.match.resultPhase;
  state.sides[CONFIG.match.playerId].hp = CONFIG.match.minHp;
  state.sides[CONFIG.match.playerId].cooldowns.attack = CONFIG.actions.attack.cooldownSeconds;
  resetGameState(state, CONFIG);
  assert.equal(state.phase, CONFIG.match.countdownPhase);
  assert.equal(state.result, null);
  assert.equal(state.sides[CONFIG.match.playerId].hp, CONFIG.match.startingHp);
  assert.equal(state.sides[CONFIG.match.playerId].cooldowns.attack, CONFIG.match.minHp);
});
