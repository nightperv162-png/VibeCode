import { ACTION_IDS, CONFIG } from '../config.js';

function cleanText(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

export function getActionByCommand(rawCommand, config = CONFIG) {
  const cleaned = cleanText(rawCommand);
  return ACTION_IDS.find((actionId) => cleanText(config.actions[actionId].command) === cleaned) ?? null;
}

export function getActionByKey(rawKey, config = CONFIG) {
  const key = String(rawKey).trim().toLowerCase();
  return ACTION_IDS.find((actionId) => config.actions[actionId].key === key) ?? null;
}

export function commandTextForAction(actionId, config = CONFIG) {
  return actionId && config.actions[actionId] ? config.actions[actionId].command : config.combat.unknownCommandReason;
}

export function formatCommandReference(config = CONFIG) {
  return ACTION_IDS.map((actionId) => config.actions[actionId].command).join(' · ');
}

export function truncateTranscript(text, config = CONFIG) {
  const value = String(text || '').trim();
  if (value.length <= config.input.maxTranscriptCharacters) return value;
  return `${value.slice(config.match.minHp, config.input.maxTranscriptCharacters)}…`;
}
