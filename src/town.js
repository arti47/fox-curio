// town.js — visiting the moored town: shops, restock, upgrades, travel-enabling gear.
import { TOWNS, ITEMS } from '../data-compendium.js';
import { season, bookCap } from './rules.js';
import { Store } from './store.js';

export const townByKey = (k) => TOWNS.find((t) => t.key === k);
const mechFor = (name) => ITEMS.find((i) => i.name === name);

// Restock the shop for this season. Returns {ok,msg}.
export function restock(character, free = false) {
  const cost = season(character.calendar.seasonIndex).restock;
  if (cost == null) return { ok: false, msg: 'Trade stops in Brisk — no restocking until Bloom.' };
  if (!free && character.resources.coins < cost) return { ok: false, msg: `Not enough coins (need ${cost}).` };
  Store.update((s) => { const ch = s.characters[s.activeCharacterId]; if (!free) ch.resources.coins -= cost; ch.resources.books = 500; });
  return { ok: true, msg: free ? 'Restocked with a favour — arrives on the next trade boat.' : `Restocked for ${cost} coins — new stock arrives on the next trade boat.` };
}

// Buy a shop item. Mechanical items apply their effect; everything else is a supply.
export function buy(character, item, free = false) {
  if (!free && character.resources.coins < item.price) return { ok: false, msg: `Not enough coins (need ${item.price}).` };
  const mech = mechFor(item.name);
  // guard against duplicate one-off upgrades
  if (mech) {
    const up = character.shop.upgrades || {};
    if (mech.effect === 'bookCapPlus100' && (up.shelves || 0) >= 2) return { ok: false, msg: 'Already at maximum shelves (700).' };
    if (mech.effect === 'plusOneCardDaily' && up.recordPlayer) return { ok: false, msg: 'You already have a record player.' };
    if (mech.effect === 'enablesBrimmingTravel' && character.shop.raftReinforced) return { ok: false, msg: 'Raft already reinforced.' };
    if (mech.effect === 'enablesBriskTravel' && item.name.includes('jacket') && character.shop.hasBulrushJacket) return { ok: false, msg: 'You already own a bulrush jacket.' };
    if (mech.effect === 'enablesBriskTravel' && item.name.includes('skates') && character.shop.hasIceSkates) return { ok: false, msg: 'You already own ice skates.' };
  }
  Store.update((s) => {
    const ch = s.characters[s.activeCharacterId];
    if (!free) ch.resources.coins -= item.price;
    if (!mech) { addSupply(ch, item.name); return; }
    ch.shop.upgrades = ch.shop.upgrades || { shelves: 0, recordPlayer: false };
    switch (mech.effect) {
      case 'bookCapPlus100': ch.shop.upgrades.shelves = (ch.shop.upgrades.shelves || 0) + 1; ch.shop.inventoryCap = bookCap(ch); break;
      case 'plusOneCardDaily': ch.shop.upgrades.recordPlayer = true; break;
      case 'enablesBrimmingTravel': ch.shop.raftReinforced = true; break;
      case 'enablesBriskTravel': if (item.name.includes('jacket')) ch.shop.hasBulrushJacket = true; else ch.shop.hasIceSkates = true; break;
      default: addSupply(ch, item.name); // repair tools & consumables are supplies too
    }
  });
  return { ok: true, msg: `Bought ${item.name}.` };
}

// Trade books for coins at 1 book = 1 coin (CLAUDE.md §2.3/§2.16 — the fallback when broke).
export function tradeBooksForCoins(character, n) {
  const qty = Math.max(0, Math.min(Math.floor(n) || 0, character.resources.books));
  if (qty <= 0) return { ok: false, msg: 'No books to trade.' };
  Store.update((s) => { const ch = s.characters[s.activeCharacterId]; ch.resources.books -= qty; ch.resources.coins += qty; });
  return { ok: true, msg: `Traded ${qty} book${qty === 1 ? '' : 's'} for ${qty} coin${qty === 1 ? '' : 's'}.` };
}

function addSupply(ch, name) {
  const found = ch.supplies.find((x) => x.name === name);
  if (found) found.qty += 1; else ch.supplies.push({ name, qty: 1 });
}

// A short list of what the shop currently owns (for display).
export function ownedSummary(character) {
  const up = character.shop.upgrades || {};
  const bits = [];
  if (up.shelves) bits.push(`Extra shelves ×${up.shelves} (cap ${bookCap(character)})`);
  if (up.recordPlayer) bits.push('Record player');
  if (character.shop.hasBulrushJacket) bits.push('Bulrush jacket');
  if (character.shop.hasIceSkates) bits.push('Ice skates');
  if (character.shop.raftReinforced) bits.push('Raft reinforced');
  return bits;
}
