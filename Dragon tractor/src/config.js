export const CONFIG = {
  meta: {
    // Browser tab and diagnostic title. Keep short enough to fit mobile tab labels. Recommended length: 12-32 characters.
    title: 'Dragon Contractor',
    // Prototype version shown in diagnostics. Increment when milestone behavior changes. Recommended format: semver-like text.
    version: '0.1.0'
  },
  app: {
    // Internal canvas width before browser scaling. Larger values allow crisper layout but cost more fill work. Recommended range: 960-1600.
    canvasWidth: 1280,
    // Internal canvas height before browser scaling. Keep a landscape shape for the combat HUD. Recommended range: 640-900.
    canvasHeight: 720,
    // Target update cadence for future timed systems. Higher values feel smoother but use more CPU. Recommended range: 30-60.
    targetFrameRate: 60,
    // Padding used around screen-edge UI. Higher values protect content on small screens. Recommended range: 12-48.
    safeAreaPadding: 24,
    // Page background outside the scaled canvas. Use a neutral dark color to make the canvas feel framed. Recommended: dark neutral hex.
    pageBackgroundColor: '#111318',
    // Canvas background base. Adjust to change the whole prototype mood. Recommended: dark neutral or muted fantasy tone.
    backgroundColor: '#171923'
  },
  states: {
    // First screen shown after boot. Use ContractCreation until the full loop exists. Recommended: ContractCreation.
    initialScreen: 'ContractCreation',
    // Screen shown for the forging and drawing shell. Rename only with matching state-machine changes. Recommended: ContractCreation.
    contractCreation: 'ContractCreation',
    // Screen shown for battle-slot preparation. Rename only with matching navigation changes. Recommended: Loadout.
    loadout: 'Loadout',
    // Screen shown for static battle layout preview. Rename only with matching navigation changes. Recommended: Combat.
    combat: 'Combat',
    // Screen shown when the match would be paused. Rename only with matching navigation changes. Recommended: Pause.
    pause: 'Pause',
    // Screen shown for end-of-match layout. Rename only with matching navigation changes. Recommended: Result.
    result: 'Result'
  },
  text: {
    // Generic missing-file response for the local server. Keep plain for diagnostics. Recommended length: 5-30 characters.
    notFound: 'Not found',
    // Main product label drawn inside the canvas. Keep it concise for the top bar. Recommended length: 12-28 characters.
    title: 'Dragon Contractor',
    // Placeholder latest-player-call label in combat. Later milestones replace this dynamically. Recommended length: 12-40 characters.
    latestPlayerCall: 'Latest Call: Ignivar',
    // Placeholder latest-AI-action label in combat. Later milestones replace this dynamically. Recommended length: 12-40 characters.
    latestAiAction: 'AI Action: Waiting',
    // Timer placeholder for the combat HUD. Later milestones connect it to match time. Recommended format: M:SS.
    timerPlaceholder: '1:00',
    // Placeholder result title. Later milestones replace this with Win, Lose, or Draw. Recommended length: 4-20 characters.
    resultTitle: 'Result Pending'
  },
  http: {
    // HTTP success status for static files. Change only if server behavior changes. Recommended value: 200.
    okStatus: 200,
    // HTTP missing-file status for diagnostics. Change only for unusual routing needs. Recommended value: 404.
    notFoundStatus: 404,
    // HTTP server-error status for diagnostics. Change only for unusual routing needs. Recommended value: 500.
    errorStatus: 500,
    // Fallback MIME type for unknown static assets. Recommended value: application/octet-stream.
    binaryContentType: 'application/octet-stream'
  },
  process: {
    // Exit status used for successful script checks. Change only for platform integration. Recommended value: 0.
    successStatus: 0,
    // Exit status used when build scripts fail. Change only for platform integration. Recommended value: 1.
    failureStatus: 1
  },
  numbers: {
    // Decimal radix used when parsing display costs into numeric placeholder costs. Change only for unusual number formats. Recommended value: 10.
    decimalRadix: 10,
    // First loadout slot index used when a placeholder saved contract is equipped. Keep zero for array-first slot. Recommended value: 0.
    firstSlotIndex: 0
  },
  timing: {
    // Milliseconds in one second for frame delta conversion. Change only for unusual runtime timing. Recommended value: 1000.
    millisecondsPerSecond: 1000
  },
  labels: {
    // Ready state label shown on static contract cards. Keep one short word. Recommended length: 4-10 characters.
    readyState: 'Ready',
    // Previous screen button label. Keep compact for the top bar. Recommended length: 3-8 characters.
    previousButton: 'Prev',
    // Next screen button label. Keep compact for the top bar. Recommended length: 3-8 characters.
    nextButton: 'Next',
    // Guide button label. Keep compact for narrow screens. Recommended: Guide or ?.
    guideButton: 'Guide',
    // Pause button label. Keep compact for combat top bar. Recommended length: 4-8 characters.
    pauseButton: 'Pause',
    // Drawing placeholder label. Keep action-oriented. Recommended length: 8-24 characters.
    drawSigil: 'Draw Sigil',
    // Close guide helper label drawn inside overlay. Keep compact. Recommended length: 12-32 characters.
    closeGuide: 'Tap overlay to close',
    // Start battle placeholder label. Later milestones wire this to countdown. Recommended length: 10-24 characters.
    startBattle: 'Start Battle',
    // Save contract placeholder label. Later milestones wire this to library saving. Recommended length: 8-24 characters.
    saveContract: 'Save Contract',
    // Redraw placeholder label. Later milestones wire this to drawing reset. Recommended length: 5-16 characters.
    redraw: 'Redraw',
    // Reroll placeholder label for the Contract Call row. Recommended length: 5-16 characters.
    reroll: 'Reroll',
    // Contract details overlay title in Loadout. Recommended length: 12-28 characters.
    contractDetails: 'Contract Details',
    // Empty analysis panel label before drawing. Recommended length: 16-48 characters.
    drawFirst: 'Draw a sigil to reveal Contract Analysis.'
  },
  match: {
    // Planned match length in seconds. Higher values make rounds longer. Recommended range: 45-90.
    matchDurationSeconds: 60,
    // Planned countdown before combat starts. Higher values give more preparation time. Recommended range: 2-5.
    countdownSeconds: 3,
    // Starting HP for each side. Higher values make rounds last longer. Recommended range: 100-250.
    startingHp: 200,
    // Normal max HP before Vitality. Higher values reduce pressure. Recommended range: 100-250.
    baseMaxHp: 200,
    // Maximum temporary HP after Vitality. Higher values make Vitality safer. Recommended range: 240-350.
    temporaryMaxHpCap: 300,
    // Starting Energy for each side. Higher values enable more opening calls. Recommended range: 50-100.
    startingEnergy: 100,
    // Maximum Energy. Higher values allow longer chains. Recommended range: 75-150.
    maxEnergy: 100,
    // Lower HP clamp. Keep at zero so defeat is clear. Recommended value: 0.
    minHp: 0,
    // Lower Energy clamp. Keep at zero so costs remain readable. Recommended value: 0.
    minEnergy: 0,
    // Highest allowed single hit. Higher values make Burst more lethal. Recommended range: 30-50.
    maxSingleHitDamage: 40,
    // Shared cooldown placeholder for contract cards. Higher values slow chaining. Recommended range: 1-3.
    baseContractCooldownSeconds: 1.5
  },
  contracts: {
    // Contract types available in the shell selector. Add only types that later logic supports. Recommended count: 7.
    enabledContractTypes: ['Damage', 'Burst', 'Heal', 'Energy', 'Buff', 'Curse', 'Vitality'],
    // Number of battle slots drawn in loadout and combat. Higher values add complexity. Recommended range: 3-5.
    maxEquippedSlots: 4,
    // Slot labels shown in the compact HUD. Keep short and keyboard-friendly. Recommended: A-D.
    slotMarkerLabels: ['A', 'B', 'C', 'D'],
    // Placeholder Call Names for Milestone 1 combat layout. Replace with saved contracts later. Recommended count: match slots.
    placeholderCallNames: ['Ignivar', 'Voltaris', 'Mirava', 'Vorn'],
    // Placeholder Energy costs shown in compact HUD. Keep close to starter balance. Recommended range: 0-30.
    placeholderEnergyCosts: [10, 30, 25, 25],
    // Minimum text width for compact Call Names before cost. Higher values increase spacing. Recommended range: 8-14.
    compactCallNamePadLength: 10,
    // Resonance labels shown in duplicate-slot areas. Keep one word for compact UI. Recommended count: 4.
    resonanceLabels: ['Normal', 'Echo', 'Surge', 'Overload'],
    // Placeholder contract used before real forging exists. Keep values close to GDD examples. Recommended: one Damage contract.
    sampleAnalysisContract: {
      id: 'sample-ignivar-flame-bite',
      fullContractName: "Ignivar's Flame Bite",
      dragonTraitPower: 'Ignivar - Fierce - Flame Bite',
      contractType: 'Damage',
      callName: 'Ignivar',
      effect: '12 Damage',
      cost: '10 Energy',
      cooldown: '1.5s',
      why: 'Sharp + energetic drawing improved damage.',
      duration: '',
      grade: 'Strong',
      trait: 'Fierce',
      resonance: 'Normal'
    },
    // Placeholder Vitality contract for detail-overlay display checks. Player-facing effect must stay as Max HP only. Recommended effect format: +X Max HP.
    sampleVitalityContract: {
      id: 'sample-vorn-blood-crown',
      fullContractName: "Vorn's Blood Crown",
      dragonTraitPower: 'Vorn - Ancient - Blood Crown',
      contractType: 'Vitality',
      callName: 'Vorn',
      effect: '+50 Max HP',
      cost: '25 Energy',
      cooldown: '1.5s',
      why: 'Stable sealed drawing reinforced vitality.',
      duration: '7s',
      grade: 'Strong',
      trait: 'Ancient',
      resonance: 'Normal'
    }
  },
  layout: {
    // Top navigation band rectangle. Adjust height if title or buttons feel cramped. Recommended height: 56-88.
    topBarRect: { x: 24, y: 18, width: 1232, height: 64 },
    // Main left panel rectangle for creation/loadout content. Recommended width: 360-520.
    leftPanelRect: { x: 32, y: 104, width: 392, height: 560 },
    // Main right panel rectangle for analysis/details content. Recommended width: 420-560.
    rightPanelRect: { x: 808, y: 104, width: 440, height: 560 },
    // Central arena rectangle for visual previews and combat. Recommended width: 480-720.
    arenaRect: { x: 448, y: 112, width: 336, height: 360 },
    // Drawing surface rectangle inside the creation screen. Recommended square-ish area: 280-420.
    drawingAreaRect: { x: 72, y: 222, width: 312, height: 280 },
    // Contract type selector rectangle. Recommended height: 44-72.
    contractTypeSelectorRect: { x: 72, y: 142, width: 312, height: 56 },
    // Analysis panel rectangle for the receipt placeholder. Recommended height: 420-560.
    analysisPanelRect: { x: 832, y: 128, width: 368, height: 488 },
    // Contract library placeholder rectangle. Recommended width: 340-460.
    libraryRect: { x: 64, y: 152, width: 392, height: 420 },
    // Library item rectangles for selecting or hovering saved contracts. Keep within libraryRect. Recommended count: 2-6.
    libraryItemRects: [
      { x: 88, y: 232, width: 344, height: 72 },
      { x: 88, y: 320, width: 344, height: 72 }
    ],
    // Save Contract button inside the Contract Analysis receipt. Keep inside analysisPanelRect. Recommended width: 140-180.
    saveContractButtonRect: { x: 856, y: 548, width: 156, height: 44 },
    // Redraw button inside the Contract Analysis receipt. Keep inside analysisPanelRect. Recommended width: 100-140.
    redrawButtonRect: { x: 1040, y: 548, width: 124, height: 44 },
    // Reroll button beside the Contract Call. Keep small and near call name. Recommended width: 72-110.
    rerollButtonRect: { x: 1016, y: 280, width: 96, height: 36 },
    // Loadout detail overlay rectangle. Large enough for receipt fields without becoming permanent layout. Recommended width: 420-560.
    detailsOverlayRect: { x: 768, y: 126, width: 432, height: 468 },
    // Loadout slot rectangles. Keep count aligned to maxEquippedSlots. Recommended slot height: 76-100.
    loadoutSlotRects: [
      { x: 520, y: 152, width: 304, height: 84 },
      { x: 520, y: 254, width: 304, height: 84 },
      { x: 520, y: 356, width: 304, height: 84 },
      { x: 520, y: 458, width: 304, height: 84 }
    ],
    // Compact combat HUD slot rectangles. Keep stable so cooldown text cannot shift layout. Recommended slot width: 220-280.
    combatSlotRects: [
      { x: 72, y: 548, width: 250, height: 56 },
      { x: 356, y: 548, width: 250, height: 56 },
      { x: 640, y: 548, width: 250, height: 56 },
      { x: 924, y: 548, width: 250, height: 56 }
    ],
    // Player HP bar rectangle. Recommended width: 280-420.
    playerHpBarRect: { x: 56, y: 108, width: 348, height: 22 },
    // Player Energy bar rectangle. Recommended width: 280-420.
    playerEnergyBarRect: { x: 56, y: 142, width: 348, height: 16 },
    // Enemy HP bar rectangle. Recommended width: 280-420.
    enemyHpBarRect: { x: 876, y: 108, width: 348, height: 22 },
    // Enemy Energy bar rectangle. Recommended width: 280-420.
    enemyEnergyBarRect: { x: 876, y: 142, width: 348, height: 16 },
    // Timer badge rectangle in combat. Recommended width: 100-180.
    timerRect: { x: 565, y: 96, width: 150, height: 56 },
    // Latest player call text area. Recommended width: 300-500.
    latestCallRect: { x: 56, y: 496, width: 420, height: 32 },
    // Latest AI action text area. Recommended width: 300-500.
    latestAiRect: { x: 804, y: 496, width: 420, height: 32 },
    // Guide button rectangle. Keep near top-right and finger-friendly. Recommended size: 48-96.
    guideButtonRect: { x: 1148, y: 28, width: 84, height: 44 },
    // Pause button rectangle. Keep near guide but separate for combat. Recommended size: 48-96.
    pauseButtonRect: { x: 1052, y: 28, width: 84, height: 44 },
    // Previous-screen button rectangle. Used for milestone screen checks. Recommended size: 70-110.
    prevButtonRect: { x: 880, y: 28, width: 76, height: 44 },
    // Next-screen button rectangle. Used for milestone screen checks. Recommended size: 70-110.
    nextButtonRect: { x: 968, y: 28, width: 76, height: 44 },
    // Guide overlay rectangle. Large enough to read in under ten seconds. Recommended width: 640-920.
    guideOverlayRect: { x: 232, y: 132, width: 816, height: 456 },
    // Result overlay rectangle. Used for static result shell. Recommended width: 560-760.
    resultOverlayRect: { x: 320, y: 156, width: 640, height: 408 }
  },
  visuals: {
    // Primary font family for all Canvas UI. Use installed system fonts for portability. Recommended: sans-serif stack.
    uiFontFamily: 'Segoe UI, Arial, sans-serif',
    // Small text size for labels and metadata. Recommended range: 12-16.
    fontSizeSmall: 14,
    // Medium text size for buttons and body text. Recommended range: 16-22.
    fontSizeMedium: 18,
    // Large text size for panel headings. Recommended range: 24-36.
    fontSizeLarge: 30,
    // Extra-large text size for countdown/result/title moments. Recommended range: 40-64.
    fontSizeHuge: 46,
    // Rounded rectangle corner radius for Canvas cards. Keep at or below 8 per UI guidance. Recommended range: 4-8.
    cornerRadius: 8,
    // Thin stroke width for panel borders. Recommended range: 1-3.
    strokeThin: 2,
    // Thick stroke width for emphasized shapes. Recommended range: 3-6.
    strokeThick: 4,
    // Primary readable text color. Recommended: light neutral.
    colorTextPrimary: '#F3F4EA',
    // Secondary text color for metadata. Recommended: muted light neutral.
    colorTextSecondary: '#B8C0B0',
    // Warning text color for placeholder notices. Recommended: warm accent.
    colorTextWarning: '#F2C166',
    // Main panel fill color. Recommended: dark muted neutral.
    colorPanelBackground: '#23262D',
    // Secondary panel fill color. Recommended: slightly lighter dark neutral.
    colorPanelRaised: '#2E323B',
    // Panel border color. Recommended: muted cool gray.
    colorPanelBorder: '#68707A',
    // Primary accent color for calls and buttons. Recommended: saturated but not neon.
    colorAccent: '#5FB3A1',
    // Secondary accent color for sigils and selection. Recommended: contrasting warm accent.
    colorAccentWarm: '#D78B5F',
    // HP filled bar color. Recommended: red or rose.
    colorHpBar: '#C94F5D',
    // HP missing bar color. Recommended: dark red-gray.
    colorHpMissing: '#50333A',
    // Energy filled bar color. Recommended: teal or blue-green.
    colorEnergyBar: '#4EA6C8',
    // Energy missing bar color. Recommended: dark blue-gray.
    colorEnergyMissing: '#2E4650',
    // Cooldown ready color. Recommended: green family.
    colorCooldownReady: '#72C27A',
    // Cooldown inactive color. Recommended: muted orange.
    colorCooldownActive: '#D49A57',
    // Overlay background color with alpha. Recommended: semi-transparent black.
    overlayBackgroundColor: 'rgba(5, 7, 10, 0.78)',
    // Sigil low opacity used during prepare placeholder. Recommended range: 0.1-0.35.
    sigilBaseOpacity: 0.22,
    // Sigil flash opacity used at activation placeholder. Recommended range: 0.5-0.9.
    sigilFlashOpacity: 0.72
  },
  logging: {
    // Prefix added to all logs. Keep unique to this prototype. Recommended length: 4-24 characters.
    prefix: '[Dragon Contractor]',
    // Master switch for development logs. Disable for quieter playtests. Recommended: true during milestones.
    enableDebugLogs: true,
    // Logs state transitions when true. Useful for navigation tests. Recommended: true during Milestone 1.
    logStateTransitions: true,
    // Logs pointer and button events when true. Useful for hit-region testing. Recommended: true during Milestone 1.
    logInputEvents: true,
    // Logs renderer warnings when true. Useful for layout checks. Recommended: true during Milestone 1.
    logRendererWarnings: true,
    // Logs startup and build diagnostics when true. Recommended: true during milestone validation.
    logDiagnostics: true
  },
  diagnostics: {
    // Port used by the local static dev server. Change if the port is occupied. Recommended range: 3000-5999.
    devServerPort: 4173,
    // URL reported after starting the local server. Keep in sync with devServerPort. Recommended: localhost HTTP URL.
    localDevServerUrl: 'http://localhost:4173',
    // Folder created by the build script. Keep short and ignored if desired. Recommended: dist.
    buildOutputFolder: 'dist',
    // Marker file written when build succeeds. Useful for quick diagnostics. Recommended: BUILD_OK.txt.
    buildMarkerFile: 'BUILD_OK.txt',
    // Package script used for tests. Keep aligned with package.json. Recommended: npm test.
    testCommand: 'npm test',
    // Package script used for build checks. Keep aligned with package.json. Recommended: npm run build.
    buildCommand: 'npm run build',
    // Package script used for local serving. Keep aligned with package.json. Recommended: npm run dev.
    devServerCommand: 'npm run dev',
    // HTML tags forbidden outside the Canvas container. Add tags if accidental DOM UI appears. Recommended: common UI tags.
    forbiddenHtmlMarkers: ['<button', '<div', '<section', '<header', '<footer', '<nav', '<main']
  },
  guides: {
    // Contract Creation guide text. Keep readable in under ten seconds. Recommended: 3-5 short lines.
    ContractCreation: ['Choose a Contract Type.', 'Draw a sigil to reveal Contract Analysis.', 'Save moves the placeholder contract to Loadout.'],
    // Loadout guide text. Keep focused on slots and Call Names. Recommended: 3-5 short lines.
    Loadout: ['Select or hover a contract or slot for details.', 'Details are a temporary overlay, not a permanent analysis screen.', 'Different contracts need unique Call Names.'],
    // Combat guide text. Keep focused on visible shell controls. Recommended: 3-5 short lines.
    Combat: ['Use short Call Names or slot keys.', 'Watch HP, Energy, cooldown state, and latest calls.', 'Guide pauses combat in later milestones.'],
    // Pause guide text. Keep focused on pause behavior. Recommended: 2-4 short lines.
    Pause: ['The match is paused.', 'Resume or open Guide from the Canvas controls.'],
    // Result guide text. Keep focused on replay flow. Recommended: 2-4 short lines.
    Result: ['Review the match result.', 'Restart and return-to-loadout controls arrive with the full match loop.']
  }
};
