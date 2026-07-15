// repairs.js — shop repairs + tradesanimal lifecycle (Phase 4). CLAUDE.md §2.9.
// A repair is triggered by a daily task (data.js effect.repair). It persists on
// shop.repairs (keyed by flag) with its penalties until resolved either by using
// the needed item (self-fix) or hiring a tradesanimal via the post office:
// the tradesanimal arrives next day, then each worked day roll d6 — odd = fixed
// that day, even = keep going — deducting the trade's daily cost each worked day.
import { d6 } from './core.js';
import { Store } from './store.js';
import { REPAIR_TRADES, REPAIR_LABELS, TRADES } from '../data-compendium.js';

const tradeByKey = (k) => TRADES.find((t) => t.key === k);

// ---- reads ----
export function activeRepairs(character) {
  const reps = (character.shop && character.shop.repairs) || {};
  return Object.entries(reps).map(([key, r]) => ({ key, ...r }));
}
export const hasRepairs = (character) => activeRepairs(character).length > 0;

// Standing customer-card penalty from all active repairs. rainy adds cardsRainy.
export function repairCardPenalty(character, rainy = false) {
  let d = 0;
  for (const r of activeRepairs(character)) {
    if (r.cards) d += r.cards;
    if (rainy && r.cardsRainy) d += r.cardsRainy;
  }
  return d;
}

// Reason string if any active repair blocks travel, else null.
export function travelRepairBlock(character) {
  const r = activeRepairs(character).find((x) => x.noTravel);
  return r ? `${r.label} — repair it before travelling.` : null;
}

// ---- trigger (from a rolled daily task) ----
// effect: { repair:<flag>, cards?, cardsRainy?, noTravel?, needs? }
export function triggerRepair(effect, day) {
  const flag = effect.repair;
  Store.update((s) => {
    const ch = s.characters[s.activeCharacterId];
    ch.shop.repairs = ch.shop.repairs || {};
    if (ch.shop.repairs[flag]) return; // already broken; don't stack
    ch.shop.repairs[flag] = {
      label: REPAIR_LABELS[flag] || flag,
      cards: effect.cards || 0,
      cardsRainy: effect.cardsRainy || 0,
      noTravel: !!effect.noTravel,
      needs: effect.needs || null,
      trade: REPAIR_TRADES[flag] || null,
      triggeredDay: day,
      hired: false,
      arriveCountdown: 0,
    };
  });
}

// ---- resolve by using the needed item (self-fix) ----
export function ownsItem(character, name) {
  return !!(character.supplies || []).find((x) => x.name === name && x.qty > 0);
}
export function selfFix(flag) {
  let msg = null;
  Store.update((s) => {
    const ch = s.characters[s.activeCharacterId];
    const r = ch.shop.repairs && ch.shop.repairs[flag];
    if (!r || !r.needs) return;
    const item = (ch.supplies || []).find((x) => x.name === r.needs && x.qty > 0);
    if (!item) { msg = { ok: false, text: `You need ${r.needs} first.` }; return; }
    item.qty -= 1;
    if (item.qty <= 0) ch.supplies = ch.supplies.filter((x) => x !== item);
    msg = { ok: true, text: `${r.label} fixed with ${r.needs}.` };
    delete ch.shop.repairs[flag];
  });
  return msg || { ok: false, text: 'Nothing to fix.' };
}

// ---- hire a tradesanimal via the post office ----
export function hireTrade(flag) {
  let msg = null;
  Store.update((s) => {
    const ch = s.characters[s.activeCharacterId];
    const r = ch.shop.repairs && ch.shop.repairs[flag];
    if (!r) return;
    if (!r.trade) { msg = { ok: false, text: 'No tradesanimal can fix this — use the item instead.' }; return; }
    if (r.hired) { msg = { ok: false, text: 'A tradesanimal is already on the way.' }; return; }
    const t = tradeByKey(r.trade);
    r.hired = true;
    r.perDay = t ? t.perDay : 0;
    r.arriveCountdown = 1; // arrives next day, then works
    msg = { ok: true, text: `${t ? t.name : 'A tradesanimal'} hired — arrives next day (${r.perDay}c/day).` };
  });
  return msg || { ok: false, text: 'Nothing to hire.' };
}

// ---- daily tick: advance hired tradesanimals. Mutates ch; returns log lines. ----
// Called once per advanced day (End Day, day off, per travelled day).
export function tickRepairs(ch, days = 1) {
  const out = [];
  const reps = ch.shop.repairs || {};
  for (let i = 0; i < days; i++) {
    for (const [flag, r] of Object.entries(reps)) {
      if (!r.hired) continue;
      if (r.arriveCountdown > 0) { r.arriveCountdown -= 1; continue; } // travelling to you this day
      const cost = r.perDay || 0;
      ch.resources.coins = Math.max(0, ch.resources.coins - cost);
      const roll = d6();
      if (roll % 2 === 1) { out.push(`${r.label}: repaired (d6→${roll}).`); delete reps[flag]; }
      else out.push(`${r.label}: still under repair (d6→${roll}); paid ${cost}c.`);
    }
  }
  return out;
}
