// profiles.js — player-created customer profiles + friendship hearts + favours.
// Book model (Returning customers / Gaining hearts): a "customer profile" is a named
// character you *choose* to record (Name/Age/Hometown/Occupation/Observations/description);
// hearts (0–6) live on the profile, not on a card face. A heart is filled when they share
// something meaningful. Favour earned at 3 and at 6 hearts; letter-gift at 2+ (see mail.js).
import { uid } from './core.js';
import { Store } from './store.js';

export const listProfiles = (c) => (c && c.profiles) || [];
export const profileById = (c, id) => listProfiles(c).find((p) => p.id === id) || null;

const clampH = (n) => Math.max(0, Math.min(6, n | 0));

export function createProfile(fields = {}) {
  const p = {
    id: 'p' + uid(),
    name: fields.name || 'Unnamed friend',
    age: fields.age || '', hometown: fields.hometown || '', occupation: fields.occupation || '',
    observations: fields.observations || '', description: fields.description || '',
    hearts: clampH(fields.hearts || 0), favoursUsed: 0, ts: Date.now(),
  };
  Store.update((s) => { const ch = s.characters[s.activeCharacterId]; ch.profiles = ch.profiles || []; ch.profiles.push(p); });
  return p;
}

export function updateProfile(id, fields) {
  Store.update((s) => {
    const p = (s.characters[s.activeCharacterId].profiles || []).find((x) => x.id === id);
    if (!p) return;
    for (const k of ['name', 'age', 'hometown', 'occupation', 'observations', 'description']) {
      if (fields[k] != null) p[k] = fields[k];
    }
  });
}

export function deleteProfile(id) {
  Store.update((s) => { const ch = s.characters[s.activeCharacterId]; ch.profiles = (ch.profiles || []).filter((x) => x.id !== id); });
}

// Change a profile's hearts; returns { prev, now }.
export function changeHeart(id, delta) {
  let prev = 0, now = 0;
  Store.update((s) => {
    const p = (s.characters[s.activeCharacterId].profiles || []).find((x) => x.id === id);
    if (!p) return;
    prev = p.hearts || 0;
    now = clampH(prev + delta);
    p.hearts = now;
  });
  return { prev, now };
}

// Favours are earned at 3 and 6 hearts, minus those already used.
export const favoursAvailable = (p) => Math.max(0, (p.hearts >= 3 ? 1 : 0) + (p.hearts >= 6 ? 1 : 0) - (p.favoursUsed || 0));

export function useFavour(id) {
  let ok = false;
  Store.update((s) => {
    const p = (s.characters[s.activeCharacterId].profiles || []).find((x) => x.id === id);
    if (p && favoursAvailable(p) > 0) { p.favoursUsed = (p.favoursUsed || 0) + 1; ok = true; }
  });
  return ok;
}
