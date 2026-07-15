// mail.js — letters → gifts via the post office (Phase 4). CLAUDE.md §2.13, §2.3.
// Send a letter to a heart-tracked customer from the current town's post office
// (kind/price/availability per season). A reply arrives in twice the mail time; if
// you have 2+ hearts with the recipient it includes a gift — a random item from a
// shop in the town you are in when it arrives (special event: Receiving parcels).
import { pick } from './core.js';
import { Store } from './store.js';
import { POST_OFFICES, TOWNS } from '../data-compendium.js';
import { seasonKey, customerByCard } from './rules.js';

export const KIND_LABEL = { snail: 'Snail mail', owl: 'Owl post', express: 'Express' };

const townByKey = (k) => TOWNS.find((t) => t.key === k);
const midDays = (range) => Math.round((range[0] + range[1]) / 2); // typical mail time

// Mail kinds offered at the current town this season (unavailable seasons filtered out).
export function availableKinds(character) {
  const office = POST_OFFICES[character.shop.mooredTown];
  if (!office) return [];
  const sk = seasonKey(character.calendar.seasonIndex);
  const out = [];
  for (const kind of ['snail', 'owl', 'express']) {
    const k = office[kind];
    if (!k) continue;
    if (k.unavailable && k.unavailable.includes(sk)) continue;
    const price = sk === 'brisk' && k.briskPrice != null ? k.briskPrice : k.price;
    out.push({ kind, days: k.days, mailTime: midDays(k.days), price });
  }
  return out;
}

// Customers you can write to (any with a filled heart), labelled.
export function letterRecipients(character) {
  const hearts = character.hearts || {};
  return Object.entries(hearts).filter(([, n]) => n > 0).map(([key, n]) => {
    const [suit, rank] = key.split('-');
    const cust = customerByCard(suit, rank);
    return { key, hearts: n, label: cust ? cust.text : key };
  });
}

// Send a letter. Returns {ok,msg}.
export function sendLetter(recipientKey, kind) {
  let res = { ok: false, msg: 'Could not send.' };
  Store.update((s) => {
    const ch = s.characters[s.activeCharacterId];
    const opt = availableKinds(ch).find((o) => o.kind === kind);
    if (!opt) { res = { ok: false, msg: 'That post is unavailable here this season.' }; return; }
    if (ch.resources.coins < opt.price) { res = { ok: false, msg: `Not enough coins (need ${opt.price}).` }; return; }
    ch.resources.coins -= opt.price;
    ch.mail.push({
      kind, recipientKey,
      sentSeason: ch.calendar.seasonIndex, sentDay: ch.calendar.day,
      countdown: opt.mailTime * 2, // reply arrives in twice the mail time
      price: opt.price,
    });
    res = { ok: true, msg: `${KIND_LABEL[kind]} sent — a reply is expected in ~${opt.mailTime * 2} days.` };
  });
  return res;
}

export const pendingMail = (character) => (character.mail || []).filter((m) => m.countdown > 0);

// Daily tick: advance replies. Mutates ch; returns log lines. Called per advanced day.
export function tickMail(ch, days = 1) {
  const out = [];
  const mail = ch.mail || [];
  for (let i = 0; i < days; i++) {
    for (const m of mail) {
      if (m.countdown <= 0) continue;
      m.countdown -= 1;
      if (m.countdown > 0) continue;
      // reply arrives now
      const heartCount = (ch.hearts && ch.hearts[m.recipientKey]) || 0;
      if (heartCount >= 2) {
        const town = townByKey(ch.shop.mooredTown);
        const items = town && town.shops ? town.shops.flatMap((sh) => sh.items) : [];
        const gift = items.length ? pick(items).name : 'a small keepsake';
        m.gift = gift;
        ch.supplies = ch.supplies || [];
        const found = ch.supplies.find((x) => x.name === gift);
        if (found) found.qty += 1; else ch.supplies.push({ name: gift, qty: 1 });
        out.push(`A reply arrived with a gift: ${gift}.`);
      } else {
        out.push('A reply to your letter arrived.');
      }
    }
  }
  return out;
}
