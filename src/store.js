// store.js — local (localStorage) persistence + JSON export/import. Cloud sync is a
// later, optional stretch (see CLAUDE.md §3). Holds the whole save and notifies subscribers.
import { APP, uid } from './core.js';

const SAVE_VERSION = 1;

function blankSave() {
  return {
    version: SAVE_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    activeCharacterId: null,
    characters: {},   // id -> character
    legacy: [],       // 3 leftover marks carried from a completed year (CLAUDE.md §2.12/§2.15)
  };
}

// Back-fill defaults onto older saves so we never crash on old data (CLAUDE.md §5).
function normalize(save) {
  if (!save || typeof save !== 'object') return blankSave();
  const out = { ...blankSave(), ...save };
  out.legacy = Array.isArray(out.legacy) ? out.legacy : [];
  out.characters = out.characters && typeof out.characters === 'object' ? out.characters : {};
  for (const [id, c] of Object.entries(out.characters)) {
    out.characters[id] = normalizeCharacter(c, id);
  }
  if (out.activeCharacterId && !out.characters[out.activeCharacterId]) out.activeCharacterId = null;
  return out;
}

function normalizeCharacter(c, id) {
  return {
    id: c.id || id || uid(),
    identity: c.identity || {},
    shop: {
      quirks: [], broughtItems: [], leftovers: [], floorplan: '',
      inventoryCap: 500, upgrades: { shelves: 0, recordPlayer: false },
      repairs: {}, mooredTown: null, raftReinforced: false,
      hasBulrushJacket: false, hasIceSkates: false, ...(c.shop || {}),
    },
    resources: { coins: 100, books: 500, ...(c.resources || {}) },
    weatherEvent: c.weatherEvent || { season: null, count: 0 },
    hearts: c.hearts || {},              // deprecated suit-rank map (old saves); superseded by profiles
    profiles: c.profiles || [],          // player-created customer profiles + friendship hearts/favours
    calendar: { year: 1, seasonIndex: 0, day: 1, weekName: 'Thaw', ...(c.calendar || {}) },
    supplies: c.supplies || [],
    caught: c.caught || [],
    mail: c.mail || [],
    orders: c.orders || [],
    ordersDone: c.ordersDone || [],
    log: c.log || [],
    journal: c.journal || [],
    legacy: c.legacy || [],
  };
}

let state = load();
const subs = new Set();

function load() {
  try { return normalize(JSON.parse(localStorage.getItem(APP.storageKey))); }
  catch { return blankSave(); }
}
function persist() {
  state.updatedAt = Date.now();
  try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); }
  catch (e) { console.warn('Save failed', e); }
  subs.forEach((fn) => fn(state));
}

export const Store = {
  get() { return state; },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  activeCharacter() { return state.activeCharacterId ? state.characters[state.activeCharacterId] : null; },

  // Mutate the whole save via a callback, then persist + notify.
  update(mutator) { mutator(state); persist(); },

  upsertCharacter(character) {
    const c = normalizeCharacter(character, character.id);
    state.characters[c.id] = c;
    state.activeCharacterId = c.id;
    persist();
    return c;
  },

  setActive(id) { if (state.characters[id]) { state.activeCharacterId = id; persist(); } },

  // ---- JSON backup ----
  exportJSON() { return JSON.stringify(state, null, 2); },
  importJSON(text) {
    const parsed = JSON.parse(text);
    state = normalize(parsed);
    persist();
    return state;
  },
  reset() { state = blankSave(); persist(); },

  // ---- one-step undo for lifecycle boundaries ----
  markUndo(label) { undoStack = { label, snap: JSON.stringify(state) }; },
  canUndo() { return !!undoStack; },
  undoLabel() { return undoStack ? undoStack.label : null; },
  undo() { if (undoStack) { state = normalize(JSON.parse(undoStack.snap)); undoStack = null; persist(); } },
  clearUndo() { undoStack = null; },
};

let undoStack = null;
