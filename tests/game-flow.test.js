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
  const pointerHandlers = [];
  const textCalls = [];
  const timeouts = [];
  let permissionState = "granted";
  let failGetUserMedia = false;
  let mediaRequestCount = 0;
  const context2d = new Proxy({}, {
    get(target, property) {
      if (property === "createLinearGradient") return () => ({ addColorStop() {} });
      if (property === "measureText") return (value) => ({ width: String(value).length * 8 });
      if (property === "fillText") {
        if (!(property in target)) {
          target[property] = (...args) => {
            textCalls.push(args.map((value) => String(value)));
          };
        }
        return target[property];
      }
      if (!(property in target)) target[property] = () => {};
      return target[property];
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    }
  });
  const canvas = {
    addEventListener(type, handler) {
      if (type === "pointerup") pointerHandlers.push(handler);
    },
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
  class AudioContextStub {
    constructor() {
      this.currentTime = 0;
      this.destination = {};
    }
    createOscillator() {
      return {
        type: "sine",
        frequency: {
          setValueAtTime() {},
          linearRampToValueAtTime() {}
        },
        connect() {},
        start() {},
        stop() {}
      };
    }
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          exponentialRampToValueAtTime() {}
        },
        connect() {}
      };
    }
  }
  const navigator = {
    permissions: {
      async query() {
        return { state: permissionState };
      }
    },
    mediaDevices: {
      async getUserMedia() {
        mediaRequestCount += 1;
        if (failGetUserMedia) throw new Error("blocked");
        permissionState = "granted";
        return {
          getTracks: () => [{ stop() {} }]
        };
      }
    }
  };
  const context = {
    Array,
    clearInterval() {},
    clearTimeout: (id) => {
      const timeout = timeouts.find((item) => item.id === id);
      if (timeout) timeout.cleared = true;
    },
    console,
    document: { getElementById: () => canvas },
    Image: ImageStub,
    Math,
    navigator,
    Object,
    performance: { now: () => context.now },
    requestAnimationFrame() {},
    setInterval: (handler, ms) => {
      intervals.push({ handler, ms });
      return intervals.length;
    },
    setTimeout: (handler, ms) => {
      const timeout = { id: timeouts.length + 1, handler, ms, cleared: false };
      timeouts.push(timeout);
      return timeout.id;
    },
    window,
    now: 0
  };
  window.SpeechRecognition = SpeechRecognitionStub;
  window.AudioContext = AudioContextStub;
  window.navigator = navigator;
  vm.runInNewContext(source, context);
  window.DragonFighter.state.micPermissionState = permissionState;
  window.DragonFighter.state.micPromptVisible = permissionState !== "granted";
  const app = window.DragonFighter;
  const originalProcessVoiceTick = app.processVoiceTick;
  app.processVoiceTick = (...args) => JSON.parse(JSON.stringify(originalProcessVoiceTick(...args)));
  const originalGetSfxState = app.getSfxState;
  app.getSfxState = () => ({ ...originalGetSfxState() });
  app.__test = {
    context,
    intervals,
    keyHandlers,
    pointerHandlers,
    textCalls,
    timeouts,
    setPermissionState: (value) => { permissionState = value; },
    setGetUserMediaFailure: (value) => { failGetUserMedia = value; },
    getMediaRequestCount: () => mediaRequestCount,
    runTimeouts: () => {
      timeouts.filter((timeout) => !timeout.cleared).forEach((timeout) => {
        timeout.cleared = true;
        timeout.handler();
      });
    }
  };
  return app;
}

function startBattle(app, dragonId = "ember") {
  app.completeTutorial();
  app.playNow();
  app.state.selectedDragonId = dragonId;
  app.confirmDragon();
  app.state.countdownTimer = 0;
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

  assert.equal(app.CONFIG.voice.language, "en-US");
  assert.equal(app.getRecognition(), null);
  app.completeTutorial();
  app.playNow();
  app.state.selectedDragonId = "ember";
  app.confirmDragon();
  app.toggleMic();

  const recognition = app.getRecognition();
  assert.equal(recognition.lang, "en-US");
  assert.equal(app.CONFIG.voice.scanIntervalSeconds, 0.5);
  assert.ok(app.__test.intervals.some((interval) => interval.ms === app.CONFIG.voice.scanIntervalMs));
  assert.equal(app.CONFIG.voice.scanIntervalMs, 500);
});

test("mic prompt appears on page open when permission is not yet granted", async () => {
  const app = loadGame();
  app.__test.setPermissionState("prompt");
  await app.checkMicPermissionOnStart();
  app.draw();

  assert.equal(app.getMicPermissionState(), "prompt");
  assert.ok(app.getButtons().some((button) => button.id === "enableMicrophone"));
  assert.ok(app.__test.textCalls.some((call) => call[0] === app.CONFIG.micPermissionPromptText));
});

test("mic prompt does not appear again when permission is already granted", async () => {
  const app = loadGame();
  app.__test.setPermissionState("granted");
  await app.checkMicPermissionOnStart();
  app.draw();

  assert.equal(app.getMicPermissionState(), "granted");
  assert.ok(!app.getButtons().some((button) => button.id === "enableMicrophone"));
});

test("denied microphone permission still allows fallback input", async () => {
  const app = loadGame();
  app.__test.setPermissionState("denied");
  await app.checkMicPermissionOnStart();
  startBattle(app);
  app.state.cd.attack = 0;

  pressKey(app, "q");

  assert.equal(app.getMicPermissionState(), "denied");
  assert.equal(app.state.accepted, "ATTACK");
  assert.ok(app.state.pendingAttacks.length > 0);
});

test("each mic activation uses a fresh recognition session for the next command", () => {
  const app = loadGame();
  startBattle(app);

  app.toggleMic();
  const firstRecognition = app.getRecognition();
  app.state.cd.attack = 0;
  assert.equal(app.processRecognizedCommand("attack", "session:attack", 1000), true);
  assert.equal(app.getRecognition(), null);

  app.toggleMic();
  const secondRecognition = app.getRecognition();
  app.state.cd.block = 0;
  assert.notEqual(secondRecognition, firstRecognition);
  assert.equal(app.processRecognizedCommand("block", "session:block", 2000), true);
  assert.equal(app.state.accepted, "BLOCK");
  assert.equal(app.getRecognition(), null);
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
  assert.equal(app.state.micListening, false);
  const pendingAfterCast = app.state.pendingAttacks.length;

  app.toggleMic();
  const cooldownCast = app.processRecognizedCommand(app.commandFromSpeech("attack"), "attack:2", 2000);
  assert.equal(cooldownCast, false);
  assert.equal(app.state.pendingAttacks.length, pendingAfterCast);
  assert.match(app.state.message, /cooldown/i);
  assert.equal(app.state.micListening, false);
  assert.equal(app.commandFromSpeech("attack block"), null);
});

test("battle waits for a 3 second countdown before match timers run", () => {
  const app = loadGame();
  app.completeTutorial();
  app.playNow();
  app.state.selectedDragonId = "ember";
  app.confirmDragon();

  app.state.time = 60;
  app.state.enemyTimer = 5;
  app.state.cd.attack = 1;

  assert.equal(app.state.countdownTimer, app.CONFIG.preMatchCountdownSeconds);

  app.update(1);
  assert.equal(app.state.countdownTimer, app.CONFIG.preMatchCountdownSeconds - 1);
  assert.equal(app.state.time, 60);
  assert.equal(app.state.enemyTimer, 5);
  assert.equal(app.state.cd.attack, 1);

  app.update(2.1);
  assert.equal(app.state.countdownTimer, 0);
  assert.equal(app.state.time, 60);
  assert.equal(app.state.enemyTimer, 5);
  assert.equal(app.state.cd.attack, 1);

  app.update(1);
  assert.equal(app.state.time, 59);
  assert.equal(app.state.enemyTimer, 4);
  assert.equal(app.state.cd.attack, 0);
});

test("slow-time starts immediately when mic begins listening", () => {
  const app = loadGame();
  startBattle(app);

  app.toggleMic();

  assert.equal(app.state.micListening, true);
  assert.equal(app.micSlowTimeActive(), true);
  assert.equal(app.gameplayMultiplier(), app.CONFIG.timerMultiplier * app.CONFIG.micSlowTimeMultiplier);
  assert.equal(app.state.voiceResult, "-");
});

test("slow-time does not wait for recognized speech and scales gameplay timers", () => {
  const app = loadGame();
  startBattle(app);
  app.state.time = 50;
  app.state.enemyTimer = 10;
  app.state.cd.attack = 2;
  app.state.defenceTimer = 1;
  app.toggleMic();

  app.update(1);

  assert.equal(app.state.time, 50 - app.CONFIG.micSlowTimeMultiplier);
  assert.equal(app.state.enemyTimer, 10 - app.CONFIG.micSlowTimeMultiplier);
  assert.equal(app.state.cd.attack, 2 - app.CONFIG.micSlowTimeMultiplier);
  assert.equal(app.state.defenceTimer, 1 - app.CONFIG.micSlowTimeMultiplier);
  assert.equal(app.state.micListening, true);
});

test("processVoiceTick processes valid transcript into one command", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.state.cd.attack = 0;

  app.queueVoiceTranscript("attack", "voice:attack");
  const result = app.processVoiceTick(1000);

  assert.equal(result.command, "attack");
  assert.equal(result.cast, true);
  assert.equal(app.state.accepted, "ATTACK");
  assert.equal(app.state.parsedCommand, "ATTACK");
  assert.equal(app.state.voiceResult, "Cast");
  assert.equal(app.state.micListening, false);
  assert.equal(app.gameplayMultiplier(), app.CONFIG.timerMultiplier);
});

test("voice phrase tries multiple commands in spoken order", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.state.cd.attack = 0;
  app.state.cd.ultimate = 0;

  app.queueVoiceTranscript("attack skill", "voice:multi");
  const result = app.processVoiceTick(1000);

  assert.deepEqual(result.commands, ["attack", "ultimate"]);
  assert.equal(result.cast, true);
  assert.equal(app.state.pendingAttacks.length, 2);
  assert.equal(app.state.pendingAttacks[0].command, "attack");
  assert.equal(app.state.pendingAttacks[1].command, "ultimate");
  assert.equal(app.state.accepted, "ULTIMATE");
});

test("voice phrase still tries next command when earlier command is on cooldown", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.state.cd.attack = 2;
  app.state.cd.ultimate = 0;

  app.queueVoiceTranscript("attack skill", "voice:skip");
  const result = app.processVoiceTick(1000);

  assert.deepEqual(result.commands, ["attack", "ultimate"]);
  assert.equal(result.cast, true);
  assert.equal(app.state.pendingAttacks.length, 1);
  assert.equal(app.state.pendingAttacks[0].command, "ultimate");
  assert.equal(app.state.accepted, "ULTIMATE");
});

test("repeated speech attack attack triggers Attack only once", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.state.cd.attack = 0;

  app.queueVoiceTranscript("attack attack", "voice:repeat");
  const result = app.processVoiceTick(1000);

  assert.equal(result.command, "attack");
  assert.equal(result.cast, true);
  assert.equal(app.state.accepted, "ATTACK");
  assert.equal(app.state.pendingAttacks.length, 1);
  assert.equal(app.state.voiceResult, "Cast");
  assert.equal(app.state.micListening, false);
});

test("voice attack uses the configured damage bonus while keyboard attack stays normal", () => {
  const voiceApp = loadGame();
  startBattle(voiceApp);
  voiceApp.toggleMic();
  voiceApp.state.cd.attack = 0;
  voiceApp.queueVoiceTranscript("attack", "voice:bonus");
  voiceApp.processVoiceTick(1000);

  const keyboardApp = loadGame();
  startBattle(keyboardApp);
  keyboardApp.state.cd.attack = 0;
  pressKey(keyboardApp, "q");

  assert.equal(voiceApp.state.pendingAttacks[0].damage, Math.round(keyboardApp.state.pendingAttacks[0].damage * voiceApp.CONFIG.voiceAttackDamageMultiplier));
});

test("voice defense lasts longer than keyboard defense", () => {
  const voiceApp = loadGame();
  startBattle(voiceApp);
  voiceApp.toggleMic();
  voiceApp.state.cd.defence = 0;
  voiceApp.queueVoiceTranscript("defence", "voice:defense-bonus");
  voiceApp.processVoiceTick(1000);

  const keyboardApp = loadGame();
  startBattle(keyboardApp);
  keyboardApp.state.cd.defence = 0;
  pressKey(keyboardApp, "w");

  assert.equal(voiceApp.state.defenceTimer, keyboardApp.state.defenceTimer * voiceApp.CONFIG.voiceDefenceDurationMultiplier);
});

test("successful attack plays command sfx", () => {
  const app = loadGame();
  startBattle(app);
  app.state.cd.attack = 0;

  assert.equal(app.useCommand("attack", "keyboard"), true);
  assert.deepEqual(app.getSfxState(), { isCommandSfxPlaying: true, currentCommandSfxName: "attack" });
});

test("cooldown failure does not play command sfx", () => {
  const app = loadGame();
  startBattle(app);
  app.state.cd.attack = 1.2;

  assert.equal(app.useCommand("attack", "keyboard"), false);
  assert.deepEqual(app.getSfxState(), { isCommandSfxPlaying: false, currentCommandSfxName: null });
});

test("command sfx skips overlap but gameplay still executes", () => {
  const app = loadGame();
  startBattle(app);
  app.state.cd.attack = 0;
  app.state.cd.ultimate = 0;

  assert.equal(app.useCommand("attack", "keyboard"), true);
  assert.equal(app.useCommand("ultimate", "keyboard"), true);
  assert.equal(app.state.pendingAttacks.length, 2);
  assert.deepEqual(app.getSfxState(), { isCommandSfxPlaying: true, currentCommandSfxName: "attack" });
});

test("command sfx lock releases after timeout so later command can play", () => {
  const app = loadGame();
  startBattle(app);
  app.state.cd.attack = 0;
  app.state.cd.ultimate = 0;

  assert.equal(app.useCommand("attack", "keyboard"), true);
  app.__test.runTimeouts();
  assert.deepEqual(app.getSfxState(), { isCommandSfxPlaying: false, currentCommandSfxName: null });

  assert.equal(app.useCommand("ultimate", "keyboard"), true);
  assert.deepEqual(app.getSfxState(), { isCommandSfxPlaying: true, currentCommandSfxName: "skill" });
});

test("mic listening text appears in canvas while listening and disappears after stop", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.__test.textCalls.length = 0;
  app.draw();
  assert.ok(app.__test.textCalls.some((call) => call[0] === app.CONFIG.micListeningText));

  app.toggleMic();
  app.__test.textCalls.length = 0;
  app.draw();
  assert.ok(!app.__test.textCalls.some((call) => call[0] === app.CONFIG.micListeningText));
});

test("processVoiceTick shows cooldown feedback for cooldown command", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.state.cd.attack = 1.8;

  app.queueVoiceTranscript("attack", "voice:cooldown");
  const result = app.processVoiceTick(1000);

  assert.equal(result.command, "attack");
  assert.equal(result.cast, false);
  assert.equal(app.state.parsedCommand, "ATTACK");
  assert.equal(app.state.voiceResult, "Cooldown");
  assert.match(app.state.message, /cooldown/i);
  assert.equal(app.state.micListening, false);
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
  assert.equal(app.manualCombatInputDisabled(), false);
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

test("voice command still works while mic disables manual controls", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();
  app.state.cd.defence = 0;

  pressKey(app, "w");
  assert.equal(app.state.accepted, "-");

  app.queueVoiceTranscript("defence", "voice:defence");
  const result = app.processVoiceTick(1000);

  assert.equal(result.command, "defence");
  assert.equal(result.cast, true);
  assert.equal(app.state.accepted, "DEFENSE");
  assert.ok(app.state.defenceTimer > 0);
});

test("Q W E R trigger Attack Defense Block and Ultimate", () => {
  const app = loadGame();
  startBattle(app);

  pressKey(app, "q");
  assert.equal(app.state.accepted, "ATTACK");

  app.state.cd.defence = 0;
  pressKey(app, "w");
  assert.equal(app.state.accepted, "DEFENSE");

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

test("old combat keys no longer trigger commands", () => {
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

test("AI timer is slower while mic listening is active", () => {
  const app = loadGame();
  startBattle(app);
  app.state.enemyTimer = 10;
  app.update(1);
  assert.equal(app.state.enemyTimer, 9);

  const assisted = loadGame();
  startBattle(assisted);
  assisted.toggleMic();
  assisted.state.enemyTimer = 10;
  assisted.update(1);

  assert.equal(assisted.state.enemyTimer, 10 - assisted.CONFIG.micSlowTimeMultiplier);
});

test("mic timeout turns off listening and restores normal speed", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();

  app.update(app.CONFIG.micSlowTimeMaxSeconds);

  assert.equal(app.state.micListening, false);
  assert.equal(app.micSlowTimeActive(), false);
  assert.equal(app.gameplayMultiplier(), app.CONFIG.timerMultiplier);
});

test("mic permission failure turns off listening and slow-time", () => {
  const app = loadGame();
  startBattle(app);
  app.toggleMic();

  app.getRecognition().onerror({ error: "not-allowed" });

  assert.equal(app.state.micListening, false);
  assert.equal(app.micSlowTimeActive(), false);
  assert.equal(app.gameplayMultiplier(), app.CONFIG.timerMultiplier);
});

test("combat buttons show cooldown state on the button", () => {
  const app = loadGame();
  startBattle(app);
  app.state.cd.attack = 2.4;
  app.draw();

  const attackButton = app.getButtons().find((button) => button.id === "attack");
  assert.equal(attackButton.disabled, true);
  assert.equal(attackButton.label, "Attack");
  assert.equal(attackButton.sublabel, "2.4s");
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
