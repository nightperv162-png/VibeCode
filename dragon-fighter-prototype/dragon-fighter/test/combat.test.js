import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, ACTION_IDS } from '../src/config.js';
import { getActionByCommand, getActionByKey } from '../src/combat/actions.js';
import { attemptCommand, chooseResult } from '../src/combat/matchRules.js';
import { createInitialGameState, regenEnergy, updateActorEffects } from '../src/core/gameState.js';
import { validateSpellCast, applyCast } from '../src/combat/casting.js';
import { applyDamage, applyShield, applyHeal, applySlow, updateEffectDurations } from '../src/combat/damageResolver.js';
import { isSpellReady, startSpellCooldown, updateSpellCooldowns } from '../src/combat/cooldowns.js';

function activeState() {
  const state = createInitialGameState(CONFIG);
  state.phase = CONFIG.match.activePhase;
  return state;
}

// ============ Legacy action tests ============

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

// ============ Spell combat tests (Milestone 1) ============

test('energy regenerates each frame and clamps to max', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  
  // Drain energy to minimum
  actor.energy = CONFIG.match.minEnergy;
  
  // Regen for 1 second
  regenEnergy(actor, 1.0, CONFIG);
  const regenAmount = CONFIG.match.energyRegenPerSecond;
  assert.equal(actor.energy, CONFIG.match.minEnergy + regenAmount);
  
  // Regen until maxed
  actor.energy = CONFIG.match.maxEnergy - 0.5;
  regenEnergy(actor, 1.0, CONFIG);
  assert.equal(actor.energy, CONFIG.match.maxEnergy);
});

test('energy regen works with zero delta (no crash)', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  const energyBefore = actor.energy;
  regenEnergy(actor, 0, CONFIG);
  assert.equal(actor.energy, energyBefore);
});

test('spell cooldown ready check works', () => {
  const spell = { cooldownRemaining: 0 };
  assert.equal(isSpellReady(spell, CONFIG), true);
  
  spell.cooldownRemaining = 0.5;
  assert.equal(isSpellReady(spell, CONFIG), false);
});

test('spell cooldown starts and respects multiplier', () => {
  const spell = {};
  
  // Voice cast: 1.0x multiplier
  startSpellCooldown(spell, 2, CONFIG.spellCasting.voiceCooldownMultiplier, CONFIG);
  assert.equal(spell.cooldownRemaining, 2.0);
  
  // Button cast: 1.5x multiplier
  startSpellCooldown(spell, 2, CONFIG.spellCasting.buttonCooldownMultiplier, CONFIG);
  assert.equal(spell.cooldownRemaining, 3.0);
});

test('spell cooldowns tick down each frame', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  
  // Set up a spell with cooldown
  actor.spellLoadout[0].cooldownRemaining = 2;
  
  // Tick down 0.5 seconds
  updateSpellCooldowns(actor, 0.5, CONFIG);
  assert.equal(actor.spellLoadout[0].cooldownRemaining, 1.5);
  
  // Tick down past zero (should clamp)
  updateSpellCooldowns(actor, 2, CONFIG);
  assert.equal(actor.spellLoadout[0].cooldownRemaining, CONFIG.match.minHp);
});

test('damage with no shield applies full damage to HP', () => {
  const target = { hp: CONFIG.match.startingHp, shield: 0 };
  const result = applyDamage(target, 10, 0, CONFIG);
  
  assert.equal(result.damageApplied, 10);
  assert.equal(result.shieldAbsorbed, 0);
  assert.equal(target.hp, CONFIG.match.startingHp - 10);
});

test('shield blocks damage completely', () => {
  const target = { hp: CONFIG.match.startingHp, shield: 20 };
  const result = applyDamage(target, 10, 0, CONFIG);
  
  assert.equal(result.damageApplied, 0);
  assert.equal(result.shieldAbsorbed, 10);
  assert.equal(target.shield, 10);
  assert.equal(target.hp, CONFIG.match.startingHp);
});

test('piercing bypasses shield partially', () => {
  const target = { hp: CONFIG.match.startingHp, shield: 20 };
  // 50% piercing
  const result = applyDamage(target, 10, 0.5, CONFIG);
  
  assert.equal(result.damageApplied, 5);
  assert.equal(result.shieldAbsorbed, 5);
  assert.equal(target.shield, 15);
  assert.equal(target.hp, CONFIG.match.startingHp - 5);
});

test('shield breaks when overwhelmed', () => {
  const target = { hp: CONFIG.match.startingHp, shield: 5 };
  const result = applyDamage(target, 10, 0, CONFIG);
  
  assert.equal(result.damageApplied, 5);
  assert.equal(result.shieldAbsorbed, 5);
  assert.equal(target.shield, 0);
  assert.equal(target.hp, CONFIG.match.startingHp - 5);
});

test('HP is clamped at minimum', () => {
  const target = { hp: 5, shield: 0 };
  applyDamage(target, 100, 0, CONFIG);
  
  assert.equal(target.hp, CONFIG.match.minHp);
});

test('shield is applied and expires', () => {
  const actor = { shield: 0, shieldExpiryTime: 0 };
  const result = applyShield(actor, 25, CONFIG);
  
  assert.equal(result.shieldAdded, 25);
  assert.equal(actor.shield, 25);
  assert.ok(actor.shieldExpiryTime > 0);
});

test('healing restores HP and clamps at max', () => {
  const actor = { hp: 50 };
  const result = applyHeal(actor, 30, CONFIG);
  
  assert.equal(result.healApplied, 30);
  assert.equal(actor.hp, 80);
  
  // Heal beyond max
  const result2 = applyHeal(actor, 100, CONFIG);
  assert.equal(result2.healApplied, CONFIG.match.startingHp - 80);
  assert.equal(actor.hp, CONFIG.match.startingHp);
});

test('slow duration is applied', () => {
  const target = { slowActive: 0 };
  const result = applySlow(target, 3, CONFIG);
  
  assert.equal(result.slowDuration, 3);
  assert.equal(target.slowActive, 3);
});

test('effect durations tick down and expire', () => {
  const actor = {
    shieldExpiryTime: 2,
    shield: 25,
    slowActive: 3,
    utilityBonusActive: 4
  };
  
  updateEffectDurations(actor, 1, CONFIG);
  
  assert.equal(actor.shieldExpiryTime, 1);
  assert.equal(actor.slowActive, 2);
  assert.equal(actor.utilityBonusActive, 3);
  
  // Tick more
  updateEffectDurations(actor, 3, CONFIG);
  
  // All should be at or below 0
  assert.equal(actor.shieldExpiryTime, 0);
  assert.equal(actor.slowActive, 0);
  assert.equal(actor.utilityBonusActive, 0);
  assert.equal(actor.shield, 0); // Shield cleared when expiry hits 0
});

test('spell cast validation checks actor, match phase, energy, cooldown', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  const spell = { energyCost: 10, cooldownRemaining: 0 };
  
  // Valid cast
  let result = validateSpellCast(actor, spell, state, CONFIG);
  assert.equal(result.success, true);
  
  // Not enough energy
  actor.energy = 5;
  result = validateSpellCast(actor, spell, state, CONFIG);
  assert.equal(result.success, false);
  assert.equal(result.reason, 'not_enough_energy');
  
  // Cooldown active
  actor.energy = 20;
  spell.cooldownRemaining = 1;
  result = validateSpellCast(actor, spell, state, CONFIG);
  assert.equal(result.success, false);
  assert.equal(result.reason, 'cooldown_active');
  
  // Match inactive
  state.phase = CONFIG.states.preparation;
  spell.cooldownRemaining = 0;
  result = validateSpellCast(actor, spell, state, CONFIG);
  assert.equal(result.success, false);
  assert.equal(result.reason, 'match_inactive');
});

test('spell cast applies effect and deducts resources', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  const spell = { name: 'Test Spell', energyCost: 8, baseCooldown: 2, cooldownRemaining: 0 };
  
  const energyBefore = actor.energy;
  const result = applyCast(actor, spell, state, 1.0, CONFIG);
  
  assert.equal(result.success, true);
  assert.equal(result.energySpent, 8);
  assert.equal(actor.energy, energyBefore - 8);
  assert.equal(spell.cooldownRemaining, 2);
});

test('spell cast with button multiplier increases cooldown', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  const spell = { name: 'Test Spell', energyCost: 5, baseCooldown: 2, cooldownRemaining: 0 };
  
  applyCast(actor, spell, state, CONFIG.spellCasting.buttonCooldownMultiplier, CONFIG);
  
  // 2 * 1.5 = 3
  assert.equal(spell.cooldownRemaining, 3);
});
