// Dragon Fighter centralized configuration.
// All gameplay, timing, layout, visual, input, AI, logging, and diagnostic tunables live here.
// Non-coders should be able to adjust this file for playtesting without editing source logic.

export const CONFIG = {
  meta: {
    // Human-readable prototype title shown in logs and the browser title. Recommended: short text under 40 characters.
    title: 'Dragon Fighter Prototype',
    // Current prototype version shown in diagnostics. Recommended: semantic version-like text.
    version: '1.0.0'
  },

  diagnostics: {
    // Local development server port used by the dev script. Recommended range: 3000–9999.
    devServerPort: 5173,
    // Build output folder used by the build script. Recommended: a short folder name such as dist.
    buildOutputFolder: 'dist',
    // GitHub Pages branch name suggested for manual deploys. Recommended: gh-pages or main/docs.
    pagesBranch: 'gh-pages'
  },

  logging: {
    // Enables important gameplay logs for debugging input, combat, AI, and match state. Recommended: true during prototype development, false for demos.
    enabled: true,
    // Prefix added to every log message so game logs are easy to find in the browser console. Recommended: short text.
    prefix: '[Dragon Fighter]',
    // Enables more frequent frame/state logs. Recommended: false unless debugging timing problems.
    verboseFrames: false
  },

  states: {
    // Preparation state name used before combat so the player can review the egg spell forge. Recommended: preparation.
    preparation: 'preparation',
    // Match preview state name used for the static battle HUD layout. Recommended: match-preview.
    matchPreview: 'match-preview',
    // Countdown state name used once a real match wrapper is active. Recommended: countdown.
    countdown: 'countdown',
    // Active match state name used when combat rules are live. Recommended: active.
    active: 'active',
    // Result state name used after win, lose, or draw. Recommended: result.
    result: 'result'
  },

  canvas: {
    // Internal design width for all Canvas drawing. Recommended range: 960–1920.
    width: 1280,
    // Internal design height for all Canvas drawing. Recommended range: 540–1080.
    height: 720,
    // Canvas element id used by the HTML container. Recommended: keep as game.
    elementId: 'game',
    // CSS width applied to the Canvas so it fills the browser. Recommended: 100vw.
    cssWidth: '100vw',
    // CSS height applied to the Canvas so it fills the browser. Recommended: 100vh.
    cssHeight: '100vh',
    // Background color applied to the HTML body only behind the Canvas. Recommended: dark neutral color.
    pageBackground: '#08111f'
  },

  colors: {
    // Main sky/arena background color. Recommended: dark fantasy color for readability.
    background: '#10233f',
    // Far arena floor color. Recommended: muted ground color.
    arenaFar: '#294768',
    // Near arena floor color. Recommended: slightly brighter than arenaFar.
    arenaNear: '#40658f',
    // Arena boundary and line color. Recommended: readable low-saturation color.
    arenaLine: '#8fb8d9',
    // Primary panel fill color. Recommended: dark translucent color.
    panelFill: 'rgba(7, 17, 34, 0.84)',
    // Primary panel border color. Recommended: bright enough against panelFill.
    panelStroke: '#bad7ff',
    // Main text color. Recommended: near-white.
    textPrimary: '#f5fbff',
    // Secondary text color. Recommended: light blue/gray.
    textSecondary: '#b8cce6',
    // HP bar remaining health color. Recommended: saturated green.
    hpFill: '#49d17d',
    // HP bar missing health color. Recommended: dark red/brown.
    hpBack: '#5b1f2a',
    // Cooldown ready indicator color. Recommended: green or blue.
    cooldownReady: '#71e0ff',
    // Cooldown unavailable indicator color. Recommended: amber/orange.
    cooldownBlocked: '#ffb24d',
    // Player dragon body color. Recommended: distinct from AI dragon.
    playerDragon: '#67d0ff',
    // AI dragon body color. Recommended: distinct from player dragon.
    aiDragon: '#ff806d',
    // Player character silhouette color. Recommended: neutral light color.
    playerBody: '#d8e6ff',
    // AI character silhouette color. Recommended: neutral warm color.
    aiBody: '#ffd5c7',
    // Attack projectile color. Recommended: warm color.
    attackEffect: '#ffd166',
    // Skill projectile color. Recommended: dramatic bright color.
    skillEffect: '#ff5fd2',
    // Defence aura color. Recommended: cool shield color.
    defenceAura: 'rgba(78, 194, 255, 0.38)',
    // Block aura color. Recommended: bright shield color.
    blockAura: 'rgba(255, 255, 255, 0.50)',
    // Failed command feedback color. Recommended: red/orange.
    warning: '#ff6b6b',
    // Canvas fallback button fill color. Recommended: dark translucent color.
    buttonFill: 'rgba(12, 28, 54, 0.92)',
    // Canvas fallback button pressed/hover highlight color. Recommended: lighter than buttonFill.
    buttonHighlight: 'rgba(54, 112, 174, 0.96)',
    // Full-screen overlay color. Recommended: translucent black.
    overlayFill: 'rgba(3, 8, 15, 0.78)'
  },

  fonts: {
    // Font family used for all Canvas text. Recommended: system-safe sans-serif stack.
    family: 'Arial, Helvetica, sans-serif',
    // Large overlay text size in pixels. Recommended range: 48–96.
    overlaySize: 72,
    // Large HUD text size in pixels. Recommended range: 24–42.
    largeSize: 34,
    // Normal HUD text size in pixels. Recommended range: 16–28.
    normalSize: 22,
    // Small HUD text size in pixels. Recommended range: 12–20.
    smallSize: 16,
    // Button label text size in pixels. Recommended range: 16–26.
    buttonSize: 20,
    // Font weight for important labels. Recommended: bold or 700.
    boldWeight: '700',
    // Font weight for regular labels. Recommended: normal or 400.
    normalWeight: '400'
  },

  match: {
    // Total active match duration after countdown, in seconds. Recommended range: 30–90.
    durationSeconds: 60,
    // Starting countdown duration, in seconds. Recommended range: 2–5.
    countdownSeconds: 3,
    // Time the Fight banner remains visible when active play starts, in seconds. Recommended range: 0.25–1.5.
    fightBannerSeconds: 0.8,
    // Starting HP for each side. Recommended range: 50–200.
    startingHp: 100,
    // Starting energy cubes for each side. Recommended range: 10-30.
    startingEnergy: 20,
    // Lowest allowed energy value. Recommended: 0.
    minEnergy: 0,
    // Highest allowed energy cubes for each side. Recommended range: 20-50.
    maxEnergy: 30,
    // Energy regenerated each second during active combat. Recommended range: 0.5-3.
    energyRegenPerSecond: 1,
    // Lowest allowed HP value. Recommended: 0.
    minHp: 0,
    // Number of players in the prototype. Recommended: 2 for this vertical slice.
    sideCount: 2,
    // Player side id. Recommended: p1.
    playerId: 'p1',
    // AI side id. Recommended: p2.
    aiId: 'p2',
    // Match phase name before active combat. Recommended: countdown.
    countdownPhase: 'countdown',
    // Match phase name for active combat. Recommended: active.
    activePhase: 'active',
    // Match phase name after result is chosen. Recommended: result.
    resultPhase: 'result',
    // Result shown when Player 1 wins. Recommended: Win.
    winLabel: 'Win',
    // Result shown when Player 1 loses. Recommended: Lose.
    loseLabel: 'Lose',
    // Result shown when neither side wins. Recommended: Draw.
    drawLabel: 'Draw',
    // Restart instruction shown on result overlay. Recommended: short text.
    restartHint: 'Press R or tap Restart to play again'
  },

  actions: {
    attack: {
      // Spoken command required to trigger a basic attack. Recommended: one common complete word.
      command: 'Attack',
      // Display label shown above the dragon during the action. Recommended: match command.
      label: 'Attack',
      // Keyboard key used as desktop fallback. Recommended: single letter.
      key: 'a',
      // Base damage dealt before Block or Defence is applied. Recommended range: 5–20.
      damage: 10,
      // Cooldown after the action succeeds, in seconds. Recommended range: 1–4.
      cooldownSeconds: 2,
      // How long the action label/effect remains visible, in seconds. Recommended range: 0.2–1.2.
      displaySeconds: 0.55,
      // Action type used by combat systems. Recommended: damage for direct attacks.
      type: 'damage'
    },
    defence: {
      // Spoken command required to trigger damage reduction. Recommended: keep this exact spelling for the prototype.
      command: 'Defence',
      // Display label shown while the defence buff is active. Recommended: match command.
      label: 'Defence',
      // Keyboard key used as desktop fallback. Recommended: single letter.
      key: 'd',
      // Base damage for this action. Recommended: 0 because it is a defensive action.
      damage: 0,
      // Cooldown after the action succeeds, in seconds. Recommended range: 4–8.
      cooldownSeconds: 6,
      // Active duration for damage reduction, in seconds. Recommended range: 2–4.
      activeSeconds: 3,
      // Action type used by combat systems. Recommended: defence.
      type: 'defence'
    },
    block: {
      // Spoken command required to fully prevent incoming damage. Recommended: one common complete word.
      command: 'Block',
      // Display label shown while the block buff is active. Recommended: match command.
      label: 'Block',
      // Keyboard key used as desktop fallback. Recommended: single letter.
      key: 'b',
      // Base damage for this action. Recommended: 0 because it is a defensive action.
      damage: 0,
      // Cooldown after the action succeeds, in seconds. Recommended range: 3–7.
      cooldownSeconds: 5,
      // Active duration for full damage prevention, in seconds. Recommended range: 0.5–1.5.
      activeSeconds: 1,
      // Action type used by combat systems. Recommended: block.
      type: 'block'
    },
    skill: {
      // Spoken command required to trigger the special skill. Recommended: one common complete word.
      command: 'Skill',
      // Display label shown above the dragon during the special skill. Recommended: match command.
      label: 'Skill',
      // Keyboard key used as desktop fallback. Recommended: single letter.
      key: 's',
      // Base damage dealt before Block or Defence is applied. Recommended range: 15–40.
      damage: 25,
      // Cooldown after the action succeeds, in seconds. Recommended range: 8–15.
      cooldownSeconds: 10,
      // How long the action label/effect remains visible, in seconds. Recommended range: 0.4–1.5.
      displaySeconds: 0.9,
      // Action type used by combat systems. Recommended: damage for direct special attacks.
      type: 'damage'
    }
  },

  combat: {
    // Damage multiplier applied when the target has Defence active. Recommended range: 0.25–0.75.
    defenceDamageMultiplier: 0.5,
    // Damage multiplier applied when the target has Block active. Recommended: 0.
    blockDamageMultiplier: 0,
    // HP rounding behavior after damage. Recommended: round for clean player-facing numbers.
    hpRoundingMode: 'round',
    // Short duration for failed command labels such as Cooldown or Unknown Command, in seconds. Recommended range: 0.4–1.2.
    failedFeedbackSeconds: 0.8,
    // State label shown when a dragon is doing nothing. Recommended: Idle.
    idleLabel: 'Idle',
    // State label shown when an action is on cooldown and a player tried to use it. Recommended: Cooldown.
    cooldownLabel: 'Cooldown',
    // State label shown after HP reaches zero. Recommended: Defeated.
    defeatedLabel: 'Defeated',
    // Failure reason shown for commands that are not a valid full word. Recommended: Unknown Command.
    unknownCommandReason: 'Unknown Command',
    // Failure reason shown when an action is still cooling down. Recommended: Cooldown.
    cooldownReason: 'Cooldown',
    // Failure reason shown when the actor is already defeated. Recommended: Defeated.
    defeatedReason: 'Defeated',
    // Failure reason shown when commands are attempted outside active match. Recommended: Match Inactive.
    inactiveReason: 'Match Inactive',
    // Success reason text shown internally for successful commands. Recommended: Success.
    successReason: 'Success'
  },

  ai: {
    // How often the AI attempts one action while the match is active, in seconds. Recommended range: 1.5–3.
    actionIntervalSeconds: 2,
    // Chance the AI uses Skill when it is available and no reactive defence is needed. Recommended range: 0–1.
    skillChanceWhenReady: 0.35,
    // Chance the AI chooses Block instead of Defence when reacting to player Skill. Recommended range: 0–1.
    blockChanceAgainstSkill: 0.55,
    // Chance the AI chooses Defence during a normal action when it needs a non-attack choice. Recommended range: 0–1.
    defenceChance: 0.2,
    // Random seed used by deterministic tests and optional debug runs. Recommended: any positive integer.
    defaultSeed: 42,
    // AI command shown when no action has happened yet. Recommended: Waiting.
    waitingLabel: 'Waiting'
  },

  spells: {
    // Number of prepared egg spells each side brings into combat. Recommended: exactly 5 for this prototype.
    perLoadout: 5,
    // Spell family names used for Vietnamese-myth placeholder identity. Recommended: five short unique words.
    defaultFamilies: ['Long', 'Son', 'Thuy', 'Giong', 'Truc'],
    // Default player spell names shown in the static Milestone 1 shell. Recommended: unique two-word names.
    defaultPlayerNames: ['Long Fire', 'Son Guard', 'Thuy Heal', 'Giong Snare', 'Truc Dash'],
    // Default AI spell names shown in the static Milestone 1 shell. Recommended: unique two-word names.
    defaultAiNames: ['Long Spark', 'Son Wall', 'Thuy Mend', 'Giong Net', 'Truc Step'],
    // Spell type labels used in the forge selector and spell buttons. Recommended: the five GDD types.
    types: ['Attack', 'Defense', 'Support', 'Control', 'Utility'],
    // Minimum accepted spell name length before saving a spell. Recommended range: 3-12 characters.
    minimumNameLength: 3,
    // Similarity ratio where two names are considered too close. Recommended range: 0.65-0.9.
    similarNameThreshold: 0.72,
    // Candidate player spell names cycled by the Canvas name button. Recommended: more than five unique names.
    nameCycle: ['Long Fire', 'Son Guard', 'Thuy Heal', 'Giong Snare', 'Truc Dash', 'Lua Fang', 'Da Shield', 'Mua Bloom'],
    // Placeholder text for empty or not-yet-editable spell slots. Recommended: short status text.
    placeholderStatus: 'Ready to forge',
    // Static summary text for the Milestone 1 pattern panel before real analysis exists. Recommended: short text.
    patternSummaryPlaceholder: 'Pattern summary placeholder',
    // Static effect preview text before spell rules are implemented. Recommended: short text.
    effectPreviewPlaceholder: 'Effect preview placeholder'
  },

  patterns: {
    // Number of points available in the 9-dot grid. Recommended: 9.
    pointCount: 9,
    // Lowest valid point id in the grid. Recommended: 1.
    firstPointId: 1,
    // Number of rows in the 9-dot spell grid. Recommended: 3.
    rows: 3,
    // Number of columns in the 9-dot spell grid. Recommended: 3.
    columns: 3,
    // Whether the reverse of an existing connection is allowed. Recommended: false for readable patterns.
    allowReverseDuplicateConnections: false,
    // Light spell minimum connection count. Recommended: 1.
    lightMinConnections: 1,
    // Light spell maximum connection count. Recommended: 2.
    lightMaxConnections: 2,
    // Standard spell minimum connection count. Recommended: 3.
    standardMinConnections: 3,
    // Standard spell maximum connection count. Recommended: 4.
    standardMaxConnections: 4,
    // Heavy spell minimum connection count. Recommended: 5.
    heavyMinConnections: 5,
    // Heavy spell maximum connection count. Recommended: 6.
    heavyMaxConnections: 6,
    // Grand spell minimum connection count. Recommended: 7.
    grandMinConnections: 7,
    // Unique points required to add a secondary effect. Recommended: 5.
    uniquePointsForSecondaryEffect: 5,
    // Extra energy cost added for each crossed line. Recommended range: 1-4.
    crossedLineEnergyPenalty: 2,
    // Chance an unstable crossed-line spell misfires during casting. Recommended range: 0.1-0.4.
    unstableMisfireChance: 0.25,
    // Minimum generated random pattern connections. Recommended range: 2-4.
    randomMinConnections: 3,
    // Maximum generated random pattern connections. Recommended range: 4-8.
    randomMaxConnections: 6,
    // Maximum attempts to find a new random connection before scanning for a fallback. Recommended range: 9-40.
    randomPointAttemptLimit: 18,
    // Sharp angle count that still has no shield piercing. Recommended: 1.
    noPierceMaxSharpAngles: 1,
    // Sharp angle count where low piercing starts. Recommended: 2.
    lowPierceMinSharpAngles: 2,
    // Sharp angle count where low piercing ends. Recommended: 3.
    lowPierceMaxSharpAngles: 3,
    // Sharp angle count where high piercing starts. Recommended: 4.
    highPierceMinSharpAngles: 4,
    // Low shield piercing percent. Recommended: 0.25.
    lowPiercePercent: 0.25,
    // High shield piercing percent. Recommended: 0.5.
    highPiercePercent: 0.5,
    // Dot-product angle threshold used to count a corner as sharp. Recommended range: -0.2 to 0.4.
    sharpAngleDotThreshold: 0.35,
    // Multiplier used to format decimal rates as percentages. Recommended: 100.
    percentMultiplier: 100,
    // Weight label for 1-2 connection spells. Recommended: Light.
    lightLabel: 'Light',
    // Weight label for 3-4 connection spells. Recommended: Standard.
    standardLabel: 'Standard',
    // Weight label for 5-6 connection spells. Recommended: Heavy.
    heavyLabel: 'Heavy',
    // Weight label for 7+ connection spells. Recommended: Grand.
    grandLabel: 'Grand',
    // Weight label for patterns without enough connections. Recommended: Unformed.
    unformedLabel: 'Unformed'
  },

  spellCosts: {
    // Energy cost for Light spells before crossed-line penalties. Recommended: 4.
    Light: 4,
    // Energy cost for Standard spells before crossed-line penalties. Recommended: 6.
    Standard: 6,
    // Energy cost for Heavy spells before crossed-line penalties. Recommended: 8.
    Heavy: 8,
    // Energy cost for Grand spells before crossed-line penalties. Recommended: 10.
    Grand: 10,
    // Energy cost shown before a valid pattern exists. Recommended: 0.
    Unformed: 0
  },

  spellEffects: {
    // Attack spell damage by weight before combat mitigation. Recommended: 12, 18, 24, 30.
    attackDamageByWeight: { Light: 12, Standard: 18, Heavy: 24, Grand: 30, Unformed: 0 },
    // Defense spell shield amount by weight. Recommended: 16, 24, 32, 40.
    defenseShieldByWeight: { Light: 16, Standard: 24, Heavy: 32, Grand: 40, Unformed: 0 },
    // Support spell healing by weight. Recommended: 8, 12, 16, 20.
    supportHealByWeight: { Light: 8, Standard: 12, Heavy: 16, Grand: 20, Unformed: 0 },
    // Control spell slow duration by weight in seconds. Recommended: 1.5-3.
    controlSlowSecondsByWeight: { Light: 1.5, Standard: 2, Heavy: 2.5, Grand: 3, Unformed: 0 },
    // Utility spell bonus regeneration duration by weight in seconds. Recommended: 2-5.
    utilityBonusSecondsByWeight: { Light: 2, Standard: 3, Heavy: 4, Grand: 5, Unformed: 0 },
    // Closed Attack pattern bonus damage. Recommended: 3.
    closedAttackBonusDamage: 3,
    // Closed Defense pattern bonus shield. Recommended: 4.
    closedDefenseBonusShield: 4,
    // Closed Support pattern bonus healing. Recommended: 3.
    closedSupportBonusHeal: 3,
    // Closed Control pattern bonus duration in seconds. Recommended: 0.5.
    closedControlBonusSeconds: 0.5,
    // Closed Utility pattern bonus duration in seconds. Recommended: 1.
    closedUtilityBonusSeconds: 1
  },

  spellCasting: {
    // Cooldown multiplier for voice-cast spells. Recommended: 1.0 (same as base).
    voiceCooldownMultiplier: 1.0,
    // Cooldown multiplier for button/keyboard-cast spells. Recommended: 1.5 (longer to encourage voice).
    buttonCooldownMultiplier: 1.5,
    // Delay before a failed voice cast can be retried, in seconds. Recommended range: 0.3-1.0.
    voiceRetryDelaySeconds: 0.5,
    // Global lockout after a successful voice cast before next voice input is accepted, in seconds. Recommended range: 0.05-0.3.
    voiceGlobalLockoutSeconds: 0.1
  },

  shieldAndDamage: {
    // Duration that a shield buff remains active before expiring, in seconds. Recommended range: 3-8.
    shieldDurationSeconds: 5,
    // Damage multiplier when target has no shield or block. Recommended: 1.0.
    fullDamageMultiplier: 1.0,
    // Rounding mode for damage calculations. Recommended: round.
    damageRoundingMode: 'round',
    // Rounding mode for HP changes. Recommended: round.
    hpRoundingMode: 'round'
  },

  input: {
    // Enables browser speech recognition when supported. Recommended: true for voice prototype testing.
    voiceEnabled: true,
    // Speech recognition language. Recommended: en-US for the locked English command words.
    speechLanguage: 'en-US',
    // Text shown when voice recognition is unavailable in the current browser. Recommended: short message.
    voiceUnavailableText: 'Voice unavailable: use keys or Canvas buttons',
    // Text shown while the mic is listening. Recommended: short message.
    voiceListeningText: 'Listening... say Attack, Defence, Block, or Skill',
    // Text shown before voice listening starts. Recommended: short message.
    voiceReadyText: 'Tap Voice to speak a command',
    // Canvas voice button label. Recommended: Voice.
    voiceButtonLabel: 'Voice',
    // Restart key for desktop. Recommended: r.
    restartKey: 'r',
    // Keyboard key used to toggle voice listening. Recommended: v.
    voiceKey: 'v',
    // Maximum transcript length shown in the HUD. Recommended range: 20–60 characters.
    maxTranscriptCharacters: 36,
    // Message shown for invalid keyboard input in debug feedback. Recommended: short text.
    invalidKeyText: 'No command mapped to key'
  },

  layout: {
    // Padding around outer HUD elements in pixels. Recommended range: 12–32.
    outerPadding: 20,
    // Status panel width in pixels. Recommended range: 260–380.
    statusPanelWidth: 330,
    // Status panel height in pixels. Recommended range: 100–160.
    statusPanelHeight: 132,
    // Corner radius for Canvas panels and buttons in pixels. Recommended range: 6–20.
    cornerRadius: 14,
    // Border line width for panels in pixels. Recommended range: 1–4.
    panelLineWidth: 2,
    // HP bar height in pixels. Recommended range: 12–28.
    hpBarHeight: 18,
    // HP bar vertical offset inside status panels in pixels. Recommended range: 36–72.
    hpBarY: 48,
    // Width of each cooldown chip in pixels. Recommended range: 46–76.
    cooldownChipWidth: 63,
    // Height of each cooldown chip in pixels. Recommended range: 18–34.
    cooldownChipHeight: 24,
    // Spacing between cooldown chips in pixels. Recommended range: 4–12.
    cooldownChipGap: 7,
    // Top-center timer panel width in pixels. Recommended range: 180–320.
    timerPanelWidth: 240,
    // Top-center timer panel height in pixels. Recommended range: 58–96.
    timerPanelHeight: 74,
    // Bottom command panel width in pixels. Recommended range: 420–760.
    commandPanelWidth: 610,
    // Bottom command panel height in pixels. Recommended range: 66–120.
    commandPanelHeight: 88,
    // Width for latest command panels in pixels. Recommended range: 280–420.
    latestPanelWidth: 360,
    // Height for latest command panels in pixels. Recommended range: 58–96.
    latestPanelHeight: 82,
    // Preparation screen main drawing area x position in design pixels. Recommended range: 40-180.
    eggDrawingX: 70,
    // Preparation screen main drawing area y position in design pixels. Recommended range: 120-220.
    eggDrawingY: 150,
    // Preparation screen main drawing area width in pixels. Recommended range: 320-520.
    eggDrawingWidth: 430,
    // Preparation screen main drawing area height in pixels. Recommended range: 320-500.
    eggDrawingHeight: 410,
    // 9-dot grid spacing inside the egg drawing panel in pixels. Recommended range: 70-120.
    eggGridGap: 96,
    // Number of rows in the 9-dot egg grid. Recommended: 3.
    eggGridRows: 3,
    // Number of columns in the 9-dot egg grid. Recommended: 3.
    eggGridColumns: 3,
    // 9-dot grid point radius in pixels. Recommended range: 6-18.
    eggGridPointRadius: 10,
    // Preparation control panel x position in design pixels. Recommended range: 520-760.
    forgePanelX: 545,
    // Preparation control panel y position in design pixels. Recommended range: 120-220.
    forgePanelY: 150,
    // Preparation control panel width in pixels. Recommended range: 300-460.
    forgePanelWidth: 355,
    // Preparation control panel height in pixels. Recommended range: 320-500.
    forgePanelHeight: 410,
    // Spell slot panel x position in design pixels. Recommended range: 900-1040.
    spellSlotsX: 940,
    // Spell slot panel y position in design pixels. Recommended range: 120-220.
    spellSlotsY: 150,
    // Spell slot panel width in pixels. Recommended range: 260-360.
    spellSlotsWidth: 290,
    // Spell slot panel height in pixels. Recommended range: 320-500.
    spellSlotsHeight: 410,
    // Single spell slot height in pixels. Recommended range: 42-72.
    spellSlotHeight: 58,
    // Gap between spell slot rows in pixels. Recommended range: 6-16.
    spellSlotGap: 10,
    // Width for preparation action buttons in pixels. Recommended range: 160-260.
    prepButtonWidth: 210,
    // Height for preparation action buttons in pixels. Recommended range: 42-64.
    prepButtonHeight: 52,
    // Spell type button width in pixels. Recommended range: 88-128.
    spellTypeButtonWidth: 98,
    // Spell type button height in pixels. Recommended range: 34-52.
    spellTypeButtonHeight: 40,
    // Gap between spell type buttons in pixels. Recommended range: 6-14.
    spellTypeButtonGap: 8,
    // Number of spell type buttons per row. Recommended range: 2-4.
    spellTypeButtonColumns: 3,
    // Name field height in pixels. Recommended range: 38-58.
    spellNameFieldHeight: 46,
    // Save spell button width in pixels. Recommended range: 140-220.
    saveSpellButtonWidth: 160,
    // Bottom margin for command HUD in pixels. Recommended range: 16–40.
    bottomMargin: 20,
    // Vertical placement for the arena horizon in pixels. Recommended range: 240–420.
    horizonY: 292,
    // Vertical placement for near floor edge in pixels. Recommended range: 580–720.
    floorBottomY: 690,
    // Player 1 human x position in design pixels. Recommended range: 720–1040.
    playerHumanX: 820,
    // Player 1 human y position in design pixels. Recommended range: 480–640.
    playerHumanY: 590,
    // Player 1 dragon x position in design pixels. Recommended range: 580–850.
    playerDragonX: 675,
    // Player 1 dragon y position in design pixels. Recommended range: 410–570.
    playerDragonY: 495,
    // AI human x position in design pixels. Recommended range: 440–660.
    aiHumanX: 580,
    // AI human y position in design pixels. Recommended range: 260–390.
    aiHumanY: 345,
    // AI dragon x position in design pixels. Recommended range: 500–720.
    aiDragonX: 655,
    // AI dragon y position in design pixels. Recommended range: 205–340.
    aiDragonY: 275,
    // Width of the player dragon placeholder in pixels. Recommended range: 100–190.
    playerDragonWidth: 170,
    // Height of the player dragon placeholder in pixels. Recommended range: 70–140.
    playerDragonHeight: 105,
    // Width of the AI dragon placeholder in pixels. Recommended range: 70–150.
    aiDragonWidth: 120,
    // Height of the AI dragon placeholder in pixels. Recommended range: 50–110.
    aiDragonHeight: 78,
    // Human silhouette width in pixels. Recommended range: 28–70.
    humanWidth: 48,
    // Human silhouette height in pixels. Recommended range: 70–130.
    humanHeight: 95,
    // State label offset above dragons in pixels. Recommended range: 40–90.
    stateLabelOffsetY: 68,
    // Canvas fallback action button width in pixels. Recommended range: 110–170.
    actionButtonWidth: 132,
    // Canvas fallback action button height in pixels. Recommended range: 38–64.
    actionButtonHeight: 48,
    // Gap between Canvas fallback buttons in pixels. Recommended range: 8–20.
    actionButtonGap: 12,
    // Y position of Canvas fallback buttons in design pixels. Recommended range: 610–690.
    actionButtonY: 628,
    // Width of the Voice button in pixels. Recommended range: 90–160.
    voiceButtonWidth: 122,
    // Width of each match spell button in pixels. Recommended range: 120-190.
    spellButtonWidth: 150,
    // Height of each match spell button in pixels. Recommended range: 42-68.
    spellButtonHeight: 56,
    // Gap between match spell buttons in pixels. Recommended range: 8-18.
    spellButtonGap: 12,
    // Y position of match spell buttons in design pixels. Recommended range: 540-620.
    spellButtonY: 560,
    // Width of the Restart button in pixels. Recommended range: 130–220.
    restartButtonWidth: 174,
    // Height of overlay buttons in pixels. Recommended range: 42–72.
    overlayButtonHeight: 56,
    // Radius used for character heads and decorative circular icons in pixels. Recommended range: 8–28.
    iconRadius: 18,
    // Left edge of the arena trapezoid near floor in pixels. Recommended range: 80–240.
    arenaNearLeft: 90,
    // Right edge of the arena trapezoid near floor in pixels. Recommended range: 1040–1220.
    arenaNearRight: 1190,
    // Left edge of the arena trapezoid horizon in pixels. Recommended range: 320–500.
    arenaFarLeft: 420,
    // Right edge of the arena trapezoid horizon in pixels. Recommended range: 760–960.
    arenaFarRight: 860,
    // Y offset for attack effect arcs in pixels. Recommended range: 12–60.
    effectArcOffsetY: 35,
    // Width of attack/skill effect strokes in pixels. Recommended range: 4–16.
    effectLineWidth: 8
  },

  animation: {
    // Duration for floating hit text, in seconds. Recommended range: 0.4–1.4.
    hitTextSeconds: 0.9,
    // Vertical travel for floating hit text in pixels. Recommended range: 20–80.
    hitTextRise: 48,
    // Duration for attack projectile arc effects, in seconds. Recommended range: 0.25–1.0.
    projectileSeconds: 0.5,
    // Screen shake duration after a hit, in seconds. Recommended range: 0–0.5.
    shakeSeconds: 0.18,
    // Maximum screen shake offset in pixels. Recommended range: 0–12.
    shakePixels: 5,
    // Dragon bob animation height in pixels. Recommended range: 0–10.
    dragonBobPixels: 5,
    // Dragon bob cycle duration in seconds. Recommended range: 1–3.
    dragonBobSeconds: 1.6
  },

  text: {
    // Player 1 display name. Recommended: short text.
    playerName: 'Player 1',
    // Player 2 display name. Recommended: short text.
    aiName: 'AI Rival',
    // Player 1 dragon element shown in the HUD. Recommended: one emoji or short word.
    playerElement: '🔥',
    // Player 2 dragon element shown in the HUD. Recommended: one emoji or short word.
    aiElement: '🌊',
    // Command reference heading. Recommended: short text.
    commandReferenceTitle: 'Say full command words',
    // Preparation screen heading. Recommended: short text.
    preparationTitle: 'Egg Spell Forge',
    // Preparation screen subtitle. Recommended: short text.
    preparationSubtitle: 'Static forge layout preview',
    // Egg drawing panel heading. Recommended: short text.
    eggDrawingTitle: '9-Dot Egg Pattern',
    // Spell type selector heading. Recommended: short text.
    spellTypeTitle: 'Spell Type',
    // Spell name field heading. Recommended: short text.
    spellNameTitle: 'Spell Name',
    // Pattern summary heading. Recommended: short text.
    patternSummaryTitle: 'Pattern Summary',
    // Effect preview heading. Recommended: short text.
    effectPreviewTitle: 'Effect Preview',
    // Spell slot panel heading. Recommended: short text.
    spellSlotsTitle: 'Five Prepared Spells',
    // Random pattern button label. Recommended: short command text.
    randomPatternLabel: 'Random Pattern',
    // Confirm loadout button label. Recommended: short command text.
    confirmLoadoutLabel: 'Preview Match',
    // Save spell button label. Recommended: short command text.
    saveSpellLabel: 'Save Spell',
    // Cycle spell name button label. Recommended: short command text.
    cycleNameLabel: 'Cycle Name',
    // Clear pattern button label. Recommended: short command text.
    clearPatternLabel: 'Clear Pattern',
    // Preparation feedback shown before any save attempt. Recommended: short sentence.
    prepReadyFeedback: 'Draw a pattern, choose a type, name it, then save five spells.',
    // Feedback shown after a spell is saved. Recommended: short sentence.
    spellSavedFeedback: 'Spell saved.',
    // Feedback shown when a spell name is duplicate or too similar. Recommended: short sentence.
    spellNameRejectedFeedback: 'Use a unique, less similar spell name.',
    // Feedback shown when the pattern has too few connections. Recommended: short sentence.
    patternRejectedFeedback: 'Connect at least one line before saving.',
    // Feedback shown when all five slots are ready. Recommended: short sentence.
    loadoutReadyFeedback: 'Five-spell loadout ready.',
    // Feedback shown when loadout confirmation is blocked. Recommended: short sentence.
    loadoutBlockedFeedback: 'Fill all five spell slots first.',
    // Match preview back button label. Recommended: short command text.
    backToForgeLabel: 'Back To Forge',
    // Match screen static heading. Recommended: short text.
    matchPreviewTitle: 'Match Layout Preview',
    // Energy label text used in HUD panels. Recommended: short text.
    energyLabel: 'Energy',
    // Microphone status label used in match HUD. Recommended: short text.
    microphoneStateLabel: 'Mic',
    // Latest player command heading. Recommended: short text.
    latestPlayerTitle: 'P1 Heard',
    // Latest AI command heading. Recommended: short text.
    latestAiTitle: 'AI Action',
    // Initial player command text before any input. Recommended: short text.
    noPlayerCommand: 'None yet',
    // Initial AI command text before any AI action. Recommended: short text.
    noAiCommand: 'Waiting',
    // Microcopy shown above fallback controls. Recommended: short text.
    fallbackHint: 'Keys: A Attack · D Defence · B Block · S Skill · V Voice',
    // Private asset warning shown in the lower-left corner. Recommended: short reminder.
    assetWarning: 'Private prototype: replace any unlicensed dragon assets before sharing publicly.'
  }
};

export const ACTION_IDS = Object.freeze(Object.keys(CONFIG.actions));
