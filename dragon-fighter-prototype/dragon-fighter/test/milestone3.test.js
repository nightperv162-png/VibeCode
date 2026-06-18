import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { updateAi } from '../src/ai/aiController.js';
import { attemptCommand } from '../src/combat/actions.js';
import { updateCombatTimers } from '../src/combat/cooldowns.js';
import { applyResultIfNeeded, restartMatch, updateMatchFlow } from '../src/combat/matchRules.js';
import { confirmDragonSelection, createInitialGameState, selectDragon } from '../src/core/gameState.js';

function createCountdownState() {
  return confirmDragonSelection(
    selectDragon(createInitialGameState(CONFIG), CONFIG, CONFIG.dragons.options[CONFIG.math.zero].id),
    CONFIG
  );
}

function createActiveState() {
  return updateMatchFlow(createCountdownState(), CONFIG, CONFIG.match.countdownSeconds);
}

test('countdown blocks commands', () => {
  const state = attemptCommand(createCountdownState(), CONFIG, 'player1', 'Attack');

  assert.equal(state.lastCommandResult.success, false);
  assert.equal(state.lastCommandResult.reason, CONFIG.labels.inactiveReason);
});

test('match starts after countdown', () => {
  const state = updateMatchFlow(createCountdownState(), CONFIG, CONFIG.match.countdownSeconds);

  assert.equal(state.phase, CONFIG.match.activeCombatPhase);
  assert.equal(state.countdownSeconds, CONFIG.math.zero);
});

test('timer decreases only during active match', () => {
  const countdownState = updateMatchFlow(createCountdownState(), CONFIG, CONFIG.math.one);
  const activeState = updateMatchFlow(createActiveState(), CONFIG, CONFIG.math.one);

  assert.equal(countdownState.timerSeconds, CONFIG.match.durationSeconds);
  assert.equal(activeState.timerSeconds, CONFIG.match.durationSeconds - CONFIG.math.one);
});

test('timer win, loss, and draw follow HP totals', () => {
  const playerWin = createActiveState();
  playerWin.players.player1.hp = CONFIG.match.startingHp;
  playerWin.players.player2.hp = CONFIG.match.startingHp - CONFIG.actions.attackDamage;

  const playerLose = createActiveState();
  playerLose.players.player1.hp = CONFIG.match.startingHp - CONFIG.actions.attackDamage;
  playerLose.players.player2.hp = CONFIG.match.startingHp;

  const draw = createActiveState();

  assert.equal(updateMatchFlow(playerWin, CONFIG, CONFIG.match.durationSeconds).result, CONFIG.match.winLabel);
  assert.equal(updateMatchFlow(playerLose, CONFIG, CONFIG.match.durationSeconds).result, CONFIG.match.loseLabel);
  assert.equal(updateMatchFlow(draw, CONFIG, CONFIG.match.durationSeconds).result, CONFIG.match.drawLabel);
});

test('simultaneous defeat creates draw', () => {
  const state = createActiveState();
  state.players.player1.hp = CONFIG.match.minHp;
  state.players.player2.hp = CONFIG.match.minHp;

  assert.equal(applyResultIfNeeded(state, CONFIG).result, CONFIG.match.drawLabel);
});

test('result is shown on defeat', () => {
  const state = createActiveState();
  state.players.player2.hp = CONFIG.actions.skillDamage;
  const resultState = attemptCommand(state, CONFIG, 'player1', 'Skill');

  assert.equal(resultState.phase, CONFIG.match.resultPhase);
  assert.equal(resultState.result, CONFIG.match.winLabel);
});

test('AI acts at configured action interval', () => {
  const earlyState = updateAi(createActiveState(), CONFIG, CONFIG.ai.actionIntervalSeconds - CONFIG.math.one);
  const actionState = updateAi(createActiveState(), CONFIG, CONFIG.ai.actionIntervalSeconds);

  assert.equal(earlyState.latestAiCommand, CONFIG.labels.noAiCommand);
  assert.equal(actionState.latestAiCommand, CONFIG.actions.attackCommandWord);
});

test('AI respects cooldown legality', () => {
  const state = createActiveState();
  state.players.player2.cooldowns[CONFIG.actions.attackCommandWord] = CONFIG.actions.attackCooldownSeconds;
  const actionState = updateAi(state, CONFIG, CONFIG.ai.actionIntervalSeconds);

  assert.notEqual(actionState.latestAiCommand, CONFIG.actions.attackCommandWord);
});

test('AI cannot act when defeated', () => {
  const state = createActiveState();
  state.players.player2.hp = CONFIG.match.minHp;
  const actionState = updateAi(state, CONFIG, CONFIG.ai.actionIntervalSeconds);

  assert.equal(actionState.latestAiCommand, CONFIG.labels.noAiCommand);
});

test('AI cannot act outside active match', () => {
  const actionState = updateAi(createCountdownState(), CONFIG, CONFIG.ai.actionIntervalSeconds);

  assert.equal(actionState.latestAiCommand, CONFIG.labels.noAiCommand);
});

test('restart resets HP, timer, cooldowns, labels, feedback, and result', () => {
  const activeState = createActiveState();
  const damaged = attemptCommand(activeState, CONFIG, 'player1', 'Skill');
  const cooled = updateCombatTimers(damaged, CONFIG, CONFIG.math.one);
  const resultState = {
    ...cooled,
    phase: CONFIG.match.resultPhase,
    result: CONFIG.match.winLabel,
    latestPlayerCommand: CONFIG.actions.skillCommandWord
  };
  const restarted = restartMatch(resultState, CONFIG);

  assert.equal(restarted.phase, CONFIG.match.countdownPhase);
  assert.equal(restarted.players.player1.hp, CONFIG.match.startingHp);
  assert.equal(restarted.players.player2.hp, CONFIG.match.startingHp);
  assert.equal(restarted.timerSeconds, CONFIG.match.durationSeconds);
  assert.equal(restarted.countdownSeconds, CONFIG.match.countdownSeconds);
  assert.equal(restarted.players.player1.stateLabel, CONFIG.labels.idleState);
  assert.equal(restarted.players.player2.stateLabel, CONFIG.labels.idleState);
  assert.equal(restarted.players.player1.cooldowns[CONFIG.actions.skillCommandWord], CONFIG.math.zero);
  assert.equal(restarted.latestPlayerCommand, CONFIG.labels.noPlayerCommand);
  assert.equal(restarted.latestAiCommand, CONFIG.labels.noAiCommand);
  assert.equal(restarted.result, null);
});
