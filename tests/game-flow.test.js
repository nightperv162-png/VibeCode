const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

function loadGame() {
  const html = fs.readFileSync("index.html", "utf8");
  const scriptSrc = html.match(/<script\s+src="([^"]+)"><\/script>/)?.[1];
  const source = scriptSrc
    ? fs.readFileSync(scriptSrc, "utf8")
    : html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const intervals = [];
  const keyHandlers = [];
  const context2d = new Proxy({}, {
    get(target, property) {
      if (property === "createLinearGradient") return () => ({ addColorStop() {} });
      if (property === "measureText") return (value) => ({ width: String(value).length * 8 });
      if (!(property in target)) target[property] = () => {};
      return target[property];
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    }
  });
  const canvas = {
    addEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1400, height: 620 }),
    getContext: () => context2d,
    style: {}
  };
  const window = {
    addEventListener(type, handler) {
      if (type === "keydown") keyHandlers.push(handler);
    }
  };
  class ImageStub {
    set src(value) { this.currentSrc = value; }
  }
  class SpeechRecognitionStub {
    start() {
      this.started = true;
      if (this.onstart) this.onstart();
    }
    stop() {
      this.started = false;
      if (this.onend) this.onend();
    }
  }
  const context = {
    clearInterval() {},
    clearTimeout() {},
    console,
    document: { getElementById: () => canvas },
    Image: ImageStub,
    Math,
    performance: { now: () => context.now },
    requestAnimationFrame() {},
    setInterval: (handler, ms) => {
      intervals.push({ handler, ms });
      return intervals.length;
    },
    setTimeout: () => 1,
    window,
    now: 0
  };
  window.SpeechRecognition = SpeechRecognitionStub;
  vm.runInNewContext(source, context);
  window.DragonFighter.__test = { context, intervals, keyHandlers };
  return window.DragonFighter;
}

function startBattle(app, dragonId = "ember") {
  app.completeTutorial();
  app.playNow();
  app.state.selectedDragonId = dragonId;
  app.confirmDragon();
}

function pressKey(app, key) {
  app.__test.keyHandlers[0]({ key });
}

test("game starts at Main Menu and tutorial can be opened before Play Now", () => {
  const app = loadGame();
  assert.equal(app.state.phase, app.CONFIG.flow.initialPhase);
  assert.equal(app.state.phase, "menu");
  assert.equal(app.CONFIG.flow.labels.playNow, "Play Now");

  app.openTutorial();
  assert.equal(app.state.phase, "tutorial");
  assert.equal(app.state.tutorialStep, 0);
  app.nextTutorialStep();
  assert.equal(app.state.tutorialStep, 1);
  app.previousTutorialStep();
  assert.equal(app.state.tutorialStep, 0);
  app.completeTutorial();
  assert.equal(app.state.phase, "menu");

  app.playNow();
  assert.equal(app.state.phase, "select");
});

test("tutorial buttons show Back after first step and Done instead of Next on final step", () => {
  const app = loadGame();
  app.openTutorial();
  app.draw();
  let ids = app.getButtons().map((button) => button.id);
  assert.ok(ids.includes("tutorialSkip"));
  assert.ok(ids.includes("tutorialNext"));
  assert.ok(!ids.includes("tutorialBack"));
  assert.ok(!ids.includes("tutorialDone"));

  app.nextTutorialStep();
  app.draw();
  ids = app.getButtons().map((button) => button.id);
  assert.ok(ids.includes("tutorialBack"));
  assert.ok(ids.includes("tutorialNext"));

  app.nextTutorialStep();
  app.nextTutorialStep();
  app.draw();
  ids = app.getButtons().map((button) => button.id);
  assert.ok(ids.includes("tutorialBack"));
  assert.ok(ids.includes("tutorialDone"));
  assert.ok(!ids.includes("tutorialSkip"));
  assert.ok(!ids.includes("tutorialNext"));
  const doneButton = app.getButtons().find((button) => button.id === "tutorialDone");
  assert.equal(doneButton.x, app.CONFIG.flow.tutorial.doneButton.x);
  assert.equal(doneButton.y, app.CONFIG.flow.tutorial.doneButton.y);
  assert.equal(doneButton.w, app.CONFIG.flow.tutorial.doneButton.w);
  assert.equal(doneButton.h, app.CONFIG.flow.tutorial.doneButton.h);
});

test("loss exposes only Retry Match and Back to Main Menu", () => {
  const app = loadGame();
  startBattle(app);
  app.finish("YOU LOSE");

  const actions = Array.from(app.core.getResultActions(app.CONFIG, app.state), (action) => [action.id, action.label]);
  assert.deepEqual(actions, [
    ["retryMatch", "Retry Match"],
    ["backToMainMenu", "Back to Main Menu"]
  ]);
});

test("win exposes only Continue and enters existing upgrade flow", () => {
  const app = loadGame();
  startBattle(app);
  app.finish("YOU WIN");

  const actions = Array.from(app.core.getResultActions(app.CONFIG, app.state), (action) => action.id);
  assert.deepEqual(actions, ["continueAfterWin"]);
  app.continueAfterWin();
  assert.equal(app.state.phase, "upgrade");
  assert.equal(app.state.stage, 1);
});

test("Retry Match restores the same dragon, stage, and upgrades", () => {
  const app = loadGame();
  startBattle(app, "tide");
  app.state.stage = 3;
  app.state.upgrades.power = 2;
  app.state.upgrades.guard = 1;
  app.finish("YOU LOSE BY HP");

  app.state.selectedDragonId = "moss";
  app.state.stage = 9;
  app.state.upgrades.power = 7;
  app.retryLastBattle();

  assert.equal(app.state.phase, "playing");
  assert.equal(app.state.selectedDragonId, "tide");
  assert.equal(app.state.stage, 3);
  assert.equal(app.state.upgrades.power, 2);
  assert.equal(app.state.upgrades.guard, 1);
  assert.equal(app.state.battleOutcome, null);
});

test("Back to Main Menu clears temporary run, buffs, and match state", () => {
  const app = loadGame();
  startBattle(app, "moss");
  app.state.stage = 4;
  app.state.victories = 3;
  app.state.upgrades.focus = 2;
  app.state.pendingAttacks.push({ command: "attack" });
  app.finish("YOU LOSE");
  app.backToMainMenu();

  assert.equal(app.state.phase, "menu");
  assert.equal(app.state.selectedDragonId, null);
  assert.equal(app.state.stage, 1);
  assert.equal(app.state.victories, 0);
  assert.equal(app.state.upgrades.focus, 0);
  assert.equal(app.state.battleOutcome, null);
  assert.equal(app.state.result, "");
  assert.equal(app.state.pendingAttacks.length, 0);
});

test("Ultimate starts on its normal full cooldown for new and retried battles", () => {
  const app = loadGame();
  startBattle(app, "moss");
  const initialCooldown = app.core.getCommandCooldown(app.CONFIG, app.state, "ultimate");
  assert.equal(app.CONFIG.combatStart.ultimateOnFullCooldown, true);
  assert.equal(app.state.cd.ultimate, initialCooldown);
  assert.ok(app.state.cd.ultimate > 0);

  app.finish("YOU LOSE");
  app.retryLastBattle();
  assert.equal(app.state.cd.ultimate, app.core.getCommandCooldown(app.CONFIG, app.state, "ultimate"));
});

test("voice recognition is English and uses the configured 0.5s interval", () => {
  const app = loadGame();
  const recognition = app.getRecognition();

  assert.equal(app.CONFIG.voice.language, "en-US");
  assert.equal(recognition.lang, "en-US");
  app.completeTutorial();
  app.playNow();
  app.state.selectedDragonId = "ember";
  app.confirmDragon();
  app.toggleMic();

  assert.equal(app.CONFIG.voice.scanIntervalSeconds, 0.5);
  assert.ok(app.__test.intervals.some((interval) => interval.ms === app.CONFIG.voice.scanIntervalMs));
  assert.equal(app.CONFIG.voice.scanIntervalMs, 500);
});

test("valid full-word voice casts immediately when ready and cooldown blocks casting", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.state.cd.attack = 0;

  const cast = app.processRecognizedCommand(app.commandFromSpeech("attack"), "attack:1", 1000);
  assert.equal(cast, true);
  assert.equal(app.state.accepted, "ATTACK");
  assert.ok(app.state.cd.attack > 0);
  const pendingAfterCast = app.state.pendingAttacks.length;

  const cooldownCast = app.processRecognizedCommand(app.commandFromSpeech("attack"), "attack:2", 2000);
  assert.equal(cooldownCast, false);
  assert.equal(app.state.pendingAttacks.length, pendingAfterCast);
  assert.match(app.state.message, /cooldown/i);
  assert.equal(app.commandFromSpeech("attack block"), null);
});

test("duplicate voice result does not cast twice", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.state.cd.attack = 0;

  assert.equal(app.processRecognizedCommand("attack", "attack:dup", 1000), true);
  const pendingAfterCast = app.state.pendingAttacks.length;
  app.state.cd.attack = 0;
  assert.equal(app.processRecognizedCommand("attack", "attack:dup", 1200), false);
  assert.equal(app.state.pendingAttacks.length, pendingAfterCast);
});

test("manual command buttons and combat keys are disabled while mic is active", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.draw();

  assert.equal(app.manualCombatInputDisabled(), true);
  const attackButton = app.getButtons().find((button) => button.id === "attack");
  assert.equal(attackButton.disabled, true);
  app.useCommand("attack", "canvas");
  assert.equal(app.state.accepted, "-");

  pressKey(app, "q");
  assert.equal(app.state.accepted, "-");

  app.state.cd.attack = 0;
  assert.equal(app.processRecognizedCommand("attack", "attack:voice", 1000), true);
  assert.equal(app.state.accepted, "ATTACK");
});

test("buttons and combat keys work again after mic is stopped", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.toggleMic();
  app.draw();

  assert.equal(app.manualCombatInputDisabled(), false);
  const attackButton = app.getButtons().find((button) => button.id === "attack");
  assert.equal(attackButton.disabled, false);
  app.state.cd.attack = 0;
  pressKey(app, "q");
  assert.equal(app.state.accepted, "ATTACK");
});

test("Q W E R trigger Attack Defence Block and Skill", () => {
  const app = loadGame();
  startBattle(app);

  pressKey(app, "q");
  assert.equal(app.state.accepted, "ATTACK");

  app.state.cd.defence = 0;
  pressKey(app, "w");
  assert.equal(app.state.accepted, "DEFENCE");

  app.state.cd.block = 0;
  pressKey(app, "e");
  assert.equal(app.state.accepted, "BLOCK");

  app.state.cd.ultimate = 0;
  pressKey(app, "r");
  assert.equal(app.state.accepted, "ULTIMATE");

  assert.equal(app.commandFromKey("q"), "attack");
  assert.equal(app.commandFromKey("w"), "defence");
  assert.equal(app.commandFromKey("e"), "block");
  assert.equal(app.commandFromKey("r"), "ultimate");
});

test("old combat keys no longer trigger skills", () => {
  const app = loadGame();
  startBattle(app);
  app.state.cd.attack = 0;
  app.state.cd.defence = 0;
  app.state.cd.block = 0;
  app.state.cd.ultimate = 0;

  ["a", "d", "b", "u"].forEach((key) => pressKey(app, key));

  assert.equal(app.state.accepted, "-");
  assert.equal(app.state.pendingAttacks.length, 0);
  assert.equal(app.state.defenceTimer, 0);
  assert.equal(app.state.blockTimer, 0);
  assert.equal(app.commandFromKey("a"), null);
  assert.equal(app.commandFromKey("d"), null);
  assert.equal(app.commandFromKey("b"), null);
  assert.equal(app.commandFromKey("u"), null);
});

test("Pause button replaces Restart in combat controls", () => {
  const app = loadGame();
  startBattle(app);
  app.draw();

  const ids = app.getButtons().map((button) => button.id);
  assert.ok(ids.includes("pauseMatch"));
  assert.ok(!ids.includes("restart"));
});

test("pause freezes timer, AI, cooldowns, effects, projectiles, and Frenzy", () => {
  const app = loadGame();
  startBattle(app);
  app.state.time = 40;
  app.state.enemyTimer = 1.2;
  app.state.cd.attack = 2;
  app.state.shake = 0.5;
  app.state.frenzyTimer = 3;
  app.state.particles.push({ x: 10, y: 10, vx: 20, vy: 20, life: 0.6, max: 0.8, size: 4, color: "#fff" });
  app.state.pendingAttacks.push({ elapsed: 0.2, castTime: 0.1, travelTime: 1, command: "attack" });

  app.pauseMatch();
  app.update(1);

  assert.equal(app.state.paused, true);
  assert.equal(app.state.time, 40);
  assert.equal(app.state.enemyTimer, 1.2);
  assert.equal(app.state.cd.attack, 2);
  assert.equal(app.state.shake, 0.5);
  assert.equal(app.state.frenzyTimer, 3);
  assert.equal(app.state.particles[0].life, 0.6);
  assert.equal(app.state.particles[0].x, 10);
  assert.equal(app.state.pendingAttacks[0].elapsed, 0.2);
});

test("voice and manual combat commands do nothing while paused", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.pauseMatch();
  app.draw();

  const attackButton = app.getButtons().find((button) => button.id === "attack");
  assert.equal(attackButton, undefined);
  assert.equal(app.manualCombatInputDisabled(), true);
  assert.equal(app.processRecognizedCommand("attack", "paused:attack", 1000), false);
  app.useCommand("attack", "canvas");
  pressKey(app, "q");

  assert.equal(app.state.accepted, "-");
  assert.equal(app.state.pendingAttacks.length, 0);
});

test("Resume continues the same match", () => {
  const app = loadGame();
  startBattle(app, "tide");
  app.state.stage = 2;
  app.state.time = 37;
  app.state.enemyHp = 42;
  app.pauseMatch();
  app.resumeMatch();
  app.update(1);

  assert.equal(app.state.paused, false);
  assert.equal(app.state.phase, "playing");
  assert.equal(app.state.selectedDragonId, "tide");
  assert.equal(app.state.stage, 2);
  assert.equal(app.state.enemyHp, 42);
  assert.ok(app.state.time < 37);
});

test("Pause Retry Match keeps setup but resets battle state", () => {
  const app = loadGame();
  startBattle(app, "moss");
  app.state.stage = 4;
  app.state.upgrades.power = 3;
  app.state.playerHp = 12;
  app.state.enemyHp = 9;
  app.state.time = 8;
  app.state.cd.attack = 2;
  app.state.pendingAttacks.push({ command: "attack" });
  app.state.frenzyTimer = 5;
  app.pauseMatch();
  app.retryPausedMatch();

  assert.equal(app.state.phase, "playing");
  assert.equal(app.state.paused, false);
  assert.equal(app.state.selectedDragonId, "moss");
  assert.equal(app.state.stage, 4);
  assert.equal(app.state.upgrades.power, 3);
  assert.equal(app.state.playerHp, app.core.getPlayerMaxHp(app.CONFIG, app.state));
  assert.equal(app.state.enemyHp, app.core.getEnemyStats(app.CONFIG, app.state).maxHp);
  assert.equal(app.state.time, app.CONFIG.matchTime);
  assert.equal(app.state.cd.ultimate, app.core.getCommandCooldown(app.CONFIG, app.state, "ultimate"));
  assert.equal(app.state.pendingAttacks.length, 0);
  assert.equal(app.state.accepted, "-");
  assert.equal(app.state.frenzyTimer, 0);
});

test("Pause Back to Main Menu resets progress and returns correctly", () => {
  const app = loadGame();
  startBattle(app, "ember");
  app.state.stage = 5;
  app.state.victories = 4;
  app.state.upgrades.guard = 2;
  app.pauseMatch();
  app.backToMainMenu();

  assert.equal(app.state.phase, "menu");
  assert.equal(app.state.paused, false);
  assert.equal(app.state.selectedDragonId, null);
  assert.equal(app.state.stage, 1);
  assert.equal(app.state.victories, 0);
  assert.equal(app.state.upgrades.guard, 0);
  assert.equal(app.state.pendingAttacks.length, 0);
});

test("Change Dragon asks for confirmation before leaving upgrade screen", () => {
  const app = loadGame();
  startBattle(app, "tide");
  app.state.upgrades.power = 2;
  app.finish("YOU WIN");
  app.continueAfterWin();
  app.draw();
  assert.equal(app.state.phase, "upgrade");
  assert.ok(app.getButtons().some((button) => button.id === "chooseDragonAgain"));

  app.requestChangeDragonConfirmation();
  app.draw();
  assert.equal(app.state.confirmChangeDragon, true);
  assert.equal(app.state.phase, "upgrade");
  let ids = app.getButtons().map((button) => button.id);
  assert.equal(ids.length, 2);
  assert.equal(ids[0], "cancelChangeDragon");
  assert.equal(ids[1], "confirmChangeDragon");

  app.cancelChangeDragonConfirmation();
  assert.equal(app.state.confirmChangeDragon, false);
  assert.equal(app.state.phase, "upgrade");
  assert.equal(app.state.selectedDragonId, "tide");
  assert.equal(app.state.upgrades.power, 2);

  app.requestChangeDragonConfirmation();
  app.confirmChangeDragon();
  assert.equal(app.state.phase, "select");
  assert.equal(app.state.confirmChangeDragon, false);
  assert.equal(app.state.selectedDragonId, null);
  assert.equal(app.state.upgrades.power, 0);
});
