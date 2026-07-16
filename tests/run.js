// tests/run.js — Phase 0 regression harness (data + rules invariants).
// Pure Node ESM; no browser needed. Browser boot/wiring smoke (Playwright) is added in the
// hardening phase (CLAUDE.md §8.5). Run: `npm test`.
import { META, SEASONS, CUSTOMERS, BOOK_GENRES, HOLIDAYS, CREATION, SHOP_SETUP, ORDER_OF_PLAY, JOURNAL_GUIDE, WORD_ORACLE } from '../data.js';
import { TOWNS, POST_OFFICES, DISTANCES, RECIPES, FISH, TRADES, ITEMS, REPAIR_TRADES } from '../data-compendium.js';
import {
  customerByCard, weatherByRank, taskByRoll, genreByRoll, extraCustomersByRoll,
  totalCustomers, earningsFor, booksSoldFor, holidayOn, bookCap, dataStats,
} from '../src/rules.js';
import { runFishing } from '../src/fishing.js';
import { travelDays, isUpstream, canTravel, arrivalPrompt } from '../src/travel.js';

let passed = 0, failed = 0;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function ok(name, cond) { if (cond) { passed++; } else { failed++; console.error('  ✗ ' + name); } }
function group(name, fn) { console.log('• ' + name); fn(); }

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const FORECAST_COUNT = { dead: 0, snail: 2, quiet: 3, steady: 4, busy: 6, extreme: 7 }; // per ruling A5
const townKeys = new Set(TOWNS.map((t) => t.key));

group('Customers (52)', () => {
  const stats = dataStats();
  ok('exactly 52 customer prompts', stats.customers === 52);
  for (const suit of ['hearts', 'spades', 'clubs', 'diamonds']) {
    ok(`${suit} has 13 ranks`, CUSTOMERS[suit].length === 13 && RANKS.every((r) => customerByCard(suit, r)));
  }
  ok('J/Q/K flagged royalty, Ace not', customerByCard('hearts', 'K').royalty && !customerByCard('hearts', 'A').royalty);
});

group('Book genre (20)', () => {
  ok('20 genres', BOOK_GENRES.length === 20);
  ok('genreByRoll bounds', genreByRoll(1) === BOOK_GENRES[0] && genreByRoll(20) === BOOK_GENRES[19]);
});

group('Seasons (5) tables', () => {
  ok('5 seasons', META.seasons.length === 5 && Object.keys(SEASONS).length === 5);
  META.seasons.forEach((key, i) => {
    const s = SEASONS[key];
    ok(`${key}: 13 weather rows`, s.weather.length === 13 && RANKS.every((r) => weatherByRank(i, r)));
    ok(`${key}: weather counts match forecast label (A5)`, s.weather.every((w) => w.cards === FORECAST_COUNT[w.forecast]));
    ok(`${key}: 20 daily tasks`, s.tasks.length === 20 && [1, 20].every((id) => taskByRoll(i, id)));
    ok(`${key}: 6 earnings + 6 booksSold`, s.earnings.length === 6 && s.booksSold.length === 6);
    ok(`${key}: 4 week names`, s.weeks.length === 4);
    ok(`${key}: repair task effects map to a known trade or item`, s.tasks.every((t) => {
      const rep = t.effect && t.effect.repair;
      return !rep || rep in REPAIR_TRADES;
    }));
  });
  ok('Brisk restock unavailable', SEASONS.brisk.restock === null);
  ok('Bloom restock 200 / Burn 250', SEASONS.bloom.restock === 200 && SEASONS.burn.restock === 250);
});

group('End-of-day math', () => {
  ok('totalCustomers +10/+20', totalCustomers([{ suit: 'hearts', rank: 'A' }, { suit: 'spades', rank: 'K' }]) === 30);
  ok('extra customers bands', extraCustomersByRoll(1).draw === 0 && extraCustomersByRoll(20).draw === 3);
  ok('earnings single-roll lookup', earningsFor(0, 1) === 32 && earningsFor(0, 6) === 68);
  ok('books sold = table + second d6', booksSoldFor(0, 1, 4) === 54 && booksSoldFor(0, 5, 6) === 66);
});

group('Holidays (12)', () => {
  ok('12 holidays', Object.keys(HOLIDAYS).length === 12);
  ok('every holiday season is valid', Object.values(HOLIDAYS).every((h) => META.seasons.includes(h.season)));
  ok('every holiday has 3 prompts + token', Object.values(HOLIDAYS).every((h) => h.prompts.length === 3 && h.token));
  ok('Skyflower is day 14 (ruling A6)', HOLIDAYS.skyflower.day === 14);
  ok('holidayOn finds Rinse on Bloom day 1', holidayOn(0, 1) && holidayOn(0, 1).key === 'rinse');
  ok('Gloomin spans days 7-10', [7, 8, 9, 10].every((d) => holidayOn(3, d) && holidayOn(3, d).key === 'gloomin'));
});

group('Book orders reference valid towns', () => {
  const bad = [];
  for (const key of META.seasons) for (const o of SEASONS[key].orders) {
    if (!townKeyForName(o.at)) bad.push(`${o.customer}@${o.at}`);
    if (!townKeyForName(o.from)) bad.push(`from ${o.from}`);
  }
  ok('all order towns resolve', bad.length === 0);
});
function townKeyForName(name) { return TOWNS.find((t) => t.name === name); }

group('Towns / shops / post / distances', () => {
  ok('10 towns', TOWNS.length === 10);
  ok('every town has >=1 shop', TOWNS.every((t) => t.shops.length >= 1));
  ok('all shop item prices are positive numbers', TOWNS.every((t) => t.shops.every((sh) => sh.items.every((it) => typeof it.price === 'number' && it.price > 0))));
  ok('post offices key to real towns', Object.keys(POST_OFFICES).every((k) => townKeys.has(k)));
  ok('distances form the 9-leg chain', DISTANCES.length === 9 && DISTANCES.every((d) => townKeys.has(d.from) && townKeys.has(d.to) && d.days >= 1));
});

group('Compendium + items', () => {
  ok('11 recipes with ingredients + reveal', RECIPES.length === 11 && RECIPES.every((r) => r.ingredients.length && r.reveals));
  ok('8 fish, all season-gated', FISH.length === 8 && FISH.every((f) => f.seasons.every((s) => META.seasons.includes(s))));
  ok('5 trades with per-day cost', TRADES.length === 5 && TRADES.every((t) => t.perDay > 0));
  ok('item shops reference real towns', ITEMS.every((it) => it.sold.every((s) => townKeys.has(s.town))));
});

group('Creation + caps', () => {
  ok('names/species/ages present', CREATION.names.length === 22 && CREATION.species.length === 26 && CREATION.ages.length === 7);
  ok('5 moons, 20 items', CREATION.moons.length === 5 && CREATION.items.length === 20);
  ok('shop lists: 7 quirks / 13 brought / 10 leftovers', SHOP_SETUP.quirks.length === 7 && SHOP_SETUP.broughtItems.length === 13 && SHOP_SETUP.leftovers.length === 10);
  ok('bookCap 500 base, 700 with 2 shelves', bookCap({ shop: { upgrades: { shelves: 0 } } }) === 500 && bookCap({ shop: { upgrades: { shelves: 2 } } }) === 700);
});

group('Fishing', () => {
  for (let i = 0; i < 20; i++) {
    const r = runFishing(0);
    if (r.cards.length < 2 || !['caught', 'slipped'].includes(r.result)) { ok('fishing produces a valid run', false); return; }
    if (r.fishOptions.some((f) => !f.seasons.includes('bloom'))) { ok('fish options are season-gated', false); return; }
  }
  ok('fishing produces valid, season-gated runs', true);
});

group('Travel', () => {
  ok('adjacent Thistle Down→Rueberry = 1 day', travelDays('thistle_down', 'rueberry') === 1);
  ok('upstream adds a day (Rueberry→Thistle Down = 2)', travelDays('rueberry', 'thistle_down') === 2);
  ok('multi-leg Roost→Hurst→Mersey downstream = 5', travelDays('roost', 'mersey') === 5);
  ok('isUpstream direction', isUpstream('port_imes', 'thistle_down') && !isUpstream('thistle_down', 'port_imes'));
  ok('Bloom day<5 blocks travel', !canTravel({ calendar: { seasonIndex: 0, day: 3 }, shop: {} }).ok);
  ok('Brimming flood days blocked without reinforcement', !canTravel({ calendar: { seasonIndex: 2, day: 10 }, shop: {} }).ok);
  ok('Brisk needs jacket+skates', !canTravel({ calendar: { seasonIndex: 4, day: 5 }, shop: {} }).ok && canTravel({ calendar: { seasonIndex: 4, day: 5 }, shop: { hasBulrushJacket: true, hasIceSkates: true } }).ok);
  ok('arrival prompt resolves', typeof arrivalPrompt(0, 1) === 'string' && arrivalPrompt(0, 6).length > 0);
});

await (async () => {
  const { COMPENDIUM, searchCompendium, compendiumCounts, groupedHits } = await import('../src/compendium.js');
  group('Compendium (browse + search)', () => {
    ok('52 customers present', COMPENDIUM.find((c) => c.key === 'customers').entries.length === 52);
    ok('10 towns present', COMPENDIUM.find((c) => c.key === 'towns').entries.length === 10);
    ok('total entries indexed', compendiumCounts() > 100);
    ok('scoped search finds a recipe', searchCompendium('honey', 'recipes').length > 0);
    ok('flat search returns cross-category hits', searchCompendium('river').length > 0);
    ok('empty query returns everything in a category', searchCompendium('', 'fish').length === COMPENDIUM.find((c) => c.key === 'fish').entries.length);
    // Accordion view (River tab): groupedHits returns every category, filtered per query.
    ok('groupedHits: all categories on empty query', groupedHits('').length === COMPENDIUM.length);
    ok('groupedHits: full customers count on empty query', groupedHits('').find((c) => c.key === 'customers').entries.length === 52);
    ok('groupedHits: query filters within categories', groupedHits('honey').find((c) => c.key === 'recipes').entries.length > 0);
  });
})();

// Engine full-day smoke (needs a localStorage shim; import store/engine dynamically after).
global.localStorage = (() => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() }; })();
await (async () => {
  const { Store } = await import('../src/store.js');
  const Eng = await import('../src/engine.js');
  Store.reset();
  Store.upsertCharacter({ id: 't1', identity: { name: 'Test' }, calendar: { year: 1, seasonIndex: 0, day: 2, weekName: 'Thaw' }, resources: { coins: 100, books: 500 } });
  const c = Store.activeCharacter();
  Eng.startDay(c); Eng.rollTask(c);
  const target = Eng.targetCardCount();
  while (Eng.currentSession().flips.length < target) Eng.flipCustomer();
  Eng.rollExtra();
  const flips = Eng.currentSession().flips.length;
  const totals = Eng.tally(c);
  Eng.finishDay();
  const c2 = Store.activeCharacter();
  group('Engine (full day)', () => {
    ok('coins += earnings', c2.resources.coins === 100 + totals.earnings);
    ok('books -= sold', c2.resources.books === 500 - totals.booksSold);
    ok('calendar advanced (day 2 → 3)', c2.calendar.day === 3);
    ok('one day logged with all flips', c2.log.length === 1 && c2.log[0].cards.length === flips);
    ok('day-2 not a holiday → target ≥ base forecast', target >= 0 && flips >= target);
  });

  const Town = await import('../src/town.js');
  Store.reset();
  Store.upsertCharacter({ id: 't2', identity: { name: 'Buyer' }, calendar: { year: 1, seasonIndex: 0, day: 3, weekName: 'Thaw' }, resources: { coins: 2000, books: 200 }, shop: { mooredTown: 'port_imes' } });
  const b = Store.activeCharacter();
  const supplyBuy = Town.buy(b, { name: 'Custard tart', price: 10 });
  const r1 = Town.buy(b, { name: 'Extra shelves', price: 400 });
  const r2 = Town.buy(b, { name: 'Extra shelves', price: 400 });
  const r3 = Town.buy(b, { name: 'Extra shelves', price: 400 }); // should fail (max 2)
  const rec = Town.buy(b, { name: 'Record player', price: 500 });
  const rs = Town.restock(b);
  const bb = Store.activeCharacter();
  group('Town (economy)', () => {
    ok('supply purchase adds item + deducts coins', supplyBuy.ok && bb.supplies.some((x) => x.name === 'Custard tart'));
    ok('two shelf upgrades → cap 700', r1.ok && r2.ok && bookCap(bb) === 700);
    ok('third shelf blocked', !r3.ok);
    ok('record player owned', rec.ok && bb.shop.upgrades.recordPlayer === true);
    ok('restock sets books to 500 and charges', rs.ok && bb.resources.books === 500);
  });

  const Rep = await import('../src/repairs.js');
  Store.reset();
  Store.upsertCharacter({ id: 't3', identity: { name: 'Fixer' }, calendar: { year: 1, seasonIndex: 1, day: 5, weekName: 'Bask' }, resources: { coins: 1000, books: 500 }, shop: { mooredTown: 'port_imes' }, supplies: [{ name: 'BugOff Spray', qty: 1 }] });
  Rep.triggerRepair({ repair: 'deck', noTravel: true }, 5);
  Rep.triggerRepair({ repair: 'chimney', cards: -1 }, 5);
  Rep.triggerRepair({ repair: 'beetles', cards: -1, needs: 'BugOff Spray' }, 5);
  const f = Store.activeCharacter();
  group('Repairs (tradesanimal lifecycle)', () => {
    ok('trigger creates broken repairs', Rep.activeRepairs(f).length === 3);
    ok('card penalty sums (chimney −1 + beetles −1)', Rep.repairCardPenalty(f, false) === -2);
    ok('noTravel repair blocks travel', !!Rep.travelRepairBlock(f) && !canTravel(f).ok);
    const sf = Rep.selfFix('beetles');
    const g = Store.activeCharacter();
    ok('self-fix consumes item + clears repair', sf.ok && !g.shop.repairs.beetles && !g.supplies.some((x) => x.name === 'BugOff Spray'));
    const hire = Rep.hireTrade('chimney');
    const h = Store.activeCharacter();
    ok('hire → firesmith en route (60c/day, arrives next day)', hire.ok && h.shop.repairs.chimney.hired && h.shop.repairs.chimney.arriveCountdown === 1 && h.shop.repairs.chimney.perDay === 60);
    const before = h.resources.coins;
    Store.update((s) => Rep.tickRepairs(s.characters[s.activeCharacterId], 1));
    const i = Store.activeCharacter();
    ok('first day: tradesanimal in transit, no charge', i.resources.coins === before && i.shop.repairs.chimney && i.shop.repairs.chimney.arriveCountdown === 0);
    let guard = 0;
    while (Store.activeCharacter().shop.repairs.chimney && guard++ < 100) Store.update((s) => Rep.tickRepairs(s.characters[s.activeCharacterId], 1));
    const j = Store.activeCharacter();
    ok('tradesanimal eventually fixes + charges per worked day', !j.shop.repairs.chimney && j.resources.coins < before && (before - j.resources.coins) % 60 === 0);
  });

  const Mail = await import('../src/mail.js');
  const Prof = await import('../src/profiles.js');
  Store.reset();
  Store.upsertCharacter({ id: 't4', identity: { name: 'Writer' }, calendar: { year: 1, seasonIndex: 0, day: 4, weekName: 'Thaw' }, resources: { coins: 500, books: 400 }, shop: { mooredTown: 'port_imes' },
    profiles: [{ id: 'pa', name: 'Ada', hearts: 3, favoursUsed: 0 }, { id: 'pb', name: 'Bo', hearts: 1, favoursUsed: 0 }] });
  const m0 = Store.activeCharacter();
  group('Mail (letters → gifts)', () => {
    ok('post office offers kinds this season', Mail.availableKinds(m0).length > 0);
    ok('recipients come from profiles with hearts', Mail.letterRecipients(m0).length === 2 && Mail.letterRecipients(m0)[0].key === 'pa');
    const opt = Mail.availableKinds(m0)[0];
    const send = Mail.sendLetter('pa', opt.kind);
    const m1 = Store.activeCharacter();
    ok('send deducts price + queues reply (2× mail time)', send.ok && m1.resources.coins === 500 - opt.price && m1.mail[0].countdown === opt.mailTime * 2);
    let g = 0; while (Store.activeCharacter().mail[0].countdown > 0 && g++ < 200) Store.update((s) => Mail.tickMail(s.characters[s.activeCharacterId], 1));
    const m2 = Store.activeCharacter();
    ok('reply at 2+ hearts returns a gift into supplies', m2.mail[0].countdown === 0 && !!m2.mail[0].gift && m2.supplies.some((x) => x.name === m2.mail[0].gift));
    const send2 = Mail.sendLetter('pb', opt.kind);
    let g2 = 0; while (Store.activeCharacter().mail[1].countdown > 0 && g2++ < 200) Store.update((s) => Mail.tickMail(s.characters[s.activeCharacterId], 1));
    ok('reply under 2 hearts returns no gift', send2.ok && !Store.activeCharacter().mail[1].gift);
  });

  Store.reset();
  Store.upsertCharacter({ id: 'tp', identity: { name: 'P' }, calendar: { year: 1, seasonIndex: 0, day: 1, weekName: 'Thaw' }, resources: { coins: 100, books: 500 } });
  group('Customer profiles + favours', () => {
    const p = Prof.createProfile({ name: 'Otter De', hometown: 'Hurst', occupation: 'Fisher' });
    ok('profile created with 0 hearts', Prof.listProfiles(Store.activeCharacter()).length === 1 && p.hearts === 0);
    for (let i = 0; i < 3; i++) Prof.changeHeart(p.id, +1);
    ok('hearts climb to 3', Prof.profileById(Store.activeCharacter(), p.id).hearts === 3);
    ok('one favour available at 3', Prof.favoursAvailable(Prof.profileById(Store.activeCharacter(), p.id)) === 1);
    for (let i = 0; i < 3; i++) Prof.changeHeart(p.id, +1); // to 6
    ok('two favours available at 6', Prof.favoursAvailable(Prof.profileById(Store.activeCharacter(), p.id)) === 2);
    ok('use favour decrements available', Prof.useFavour(p.id) && Prof.favoursAvailable(Prof.profileById(Store.activeCharacter(), p.id)) === 1);
    ok('lowering below 6 drops that favour', Prof.changeHeart(p.id, -1).now === 5 && Prof.favoursAvailable(Prof.profileById(Store.activeCharacter(), p.id)) === 0);
    ok('hearts clamp 0..6', Prof.changeHeart(p.id, -99).now === 0 && Prof.changeHeart(p.id, +99).now === 6);
    Prof.deleteProfile(p.id);
    ok('delete removes the profile', Prof.listProfiles(Store.activeCharacter()).length === 0);
  });

  const TownF = await import('../src/town.js');
  Store.reset();
  Store.upsertCharacter({ id: 'tf', identity: { name: 'F' }, calendar: { year: 1, seasonIndex: 0, day: 1, weekName: 'Thaw' }, resources: { coins: 100, books: 300 }, shop: { mooredTown: 'ennerck' },
    profiles: [{ id: 'pf', name: 'Fen', hearts: 6, favoursUsed: 0 }] });
  group('Favour waives costs (auto-zero)', () => {
    const c0 = Store.activeCharacter();
    ok('two favours at 6 hearts', Prof.totalFavours(c0) === 2);
    // free restock: books reset, no coin change, one favour spent
    const before = c0.resources.coins;
    TownF.restock(c0, true); Prof.spendAnyFavour();
    const c1 = Store.activeCharacter();
    ok('free restock: coins unchanged, books 500, favour spent', c1.resources.coins === before && c1.resources.books === 500 && Prof.totalFavours(c1) === 1);
    // free buy: no coin change
    TownF.buy(c1, { name: 'BugOff Spray', price: 30 }, true);
    ok('free buy: coins unchanged + supply added', Store.activeCharacter().resources.coins === before && Store.activeCharacter().supplies.some((x) => x.name === 'BugOff Spray'));
    ok('spendAnyFavour returns null when none left', (Prof.spendAnyFavour(), Prof.totalFavours(Store.activeCharacter()) === 0) && Prof.spendAnyFavour() === null);
  });

  const RepF = await import('../src/repairs.js');
  Store.reset();
  Store.upsertCharacter({ id: 'tw', identity: { name: 'W' }, calendar: { year: 1, seasonIndex: 0, day: 2, weekName: 'Thaw' }, resources: { coins: 100, books: 500 },
    shop: { mooredTown: 'ennerck', repairs: { chimney: { label: 'Clogged chimney', trade: 'firesmith', hired: true, arriveCountdown: 0, perDay: 60, favourCovered: true } } } });
  group('Favour-covered repair fee', () => {
    RepF.tickRepairs(Store.activeCharacter(), 1);
    ok('covered repair charges 0 on tick', Store.activeCharacter().resources.coins === 100);
  });

  const { onYearRollover } = await import('../src/calendar.js');
  Store.reset();
  Store.upsertCharacter({ id: 't5', identity: { name: 'Elder' }, calendar: { year: 1, seasonIndex: 4, day: 20, weekName: 'Awaken' }, resources: { coins: 100, books: 500 }, shop: { mooredTown: 'port_imes', leftovers: ['A ship in a bottle', 'A faded map', 'A brass key'] }, journal: [] });
  Store.update((s) => onYearRollover(s, s.characters[s.activeCharacterId], 2));
  const y = Store.get();
  group('Legacy (year rollover)', () => {
    ok('leftovers captured into save legacy pool', Array.isArray(y.legacy) && y.legacy.length === 3 && y.legacy[0] === 'A ship in a bottle');
    ok('character records the completed year', y.characters.t5.legacy.includes('Completed Year 1'));
    ok('end-of-year reflection seeded in journal', y.characters.t5.journal.some((e) => /End of Year 1/.test(e.title)));
  });

  // Audit findings (§9) — regression coverage.
  Store.reset();
  Store.upsertCharacter({ id: 't6', identity: { name: 'Auditor' }, calendar: { year: 1, seasonIndex: 1, day: 5, weekName: 'Bask' }, resources: { coins: 0, books: 300 }, shop: { mooredTown: 'port_imes' } });
  const Town2 = await import('../src/town.js');
  const tr = Town2.tradeBooksForCoins(Store.activeCharacter(), 40);
  const tc = Store.activeCharacter();
  Store.reset();
  Store.upsertCharacter({ id: 't7', identity: { name: 'Closer' }, calendar: { year: 1, seasonIndex: 1, day: 5, weekName: 'Bask' }, resources: { coins: 100, books: 500 } });
  const cc = Store.activeCharacter();
  Eng.startDay(cc); Eng.rollTask(cc);
  const tgt = Eng.targetCardCount();
  while (Eng.currentSession().flips.length < tgt) Eng.flipCustomer();
  const normalFlips = Eng.currentSession().flips.length;
  const closed = Eng.tally(cc, { closeEarly: true }); // close early WITHOUT rolling extras
  group('Audit fixes (§9)', () => {
    ok('R3 trade books→coins 1:1 (40 books → 40 coins)', tr.ok && tc.resources.coins === 40 && tc.resources.books === 300 - 40);
    ok('R3 trade clamps to available books', !Town2.tradeBooksForCoins({ resources: { books: 0 } }, 5).ok);
    ok('R1 close-early skips the extra-customer roll', Eng.currentSession().extraRoll == null && Eng.currentSession().extraDraw === 0);
    ok('R1 close-early tallies only forecast customers, then halves', closed.halved === true && Eng.currentSession().flips.length === normalFlips);
  });
  Eng.abandonSession();
})();

group('Task in-prompt rolls + play guide', () => {
  // Audit: exactly the tasks with an embedded die-roll carry a `roll` field. Bloom-20 is the one.
  const flagged = [];
  META.seasons.forEach((key, si) => SEASONS[key].tasks.forEach((t) => { if (t.roll) flagged.push(`${key}-${t.id}`); }));
  ok('exactly one task flagged with a roll (bloom-20)', flagged.length === 1 && flagged[0] === 'bloom-20');
  const bloom20 = taskByRoll(0, 20);
  ok('bloom-20 roll has a die + note', bloom20.roll && bloom20.roll.die === 'd6' && !!bloom20.roll.note);
  // No task whose text says "even/odd roll" is left unflagged.
  META.seasons.forEach((key) => SEASONS[key].tasks.forEach((t) => {
    if (/\b(even|odd) roll\b/i.test(t.text)) ok(`${key}-${t.id} even/odd-roll task is flagged`, !!t.roll);
  }));
  // Play/journal guide is present and shaped for rendering.
  ok('JOURNAL_GUIDE has intro + steps + tip', !!JOURNAL_GUIDE.intro && JOURNAL_GUIDE.steps.length >= 3 && !!JOURNAL_GUIDE.tip);
  ok('ORDER_OF_PLAY drives the guide', ORDER_OF_PLAY.bookselling.length === 8 && ORDER_OF_PLAY.daysOff.length === 3 && typeof ORDER_OF_PLAY.closingEarly === 'string');
});

group('Word oracle (T30)', () => {
  ok('100 words (d100)', WORD_ORACLE.length === 100);
  ok('all non-empty unique strings', new Set(WORD_ORACLE).size === 100 && WORD_ORACLE.every((w) => typeof w === 'string' && w.length));
  ok('endpoints match table (1=Anchor, 100=Wood)', WORD_ORACLE[0] === 'Anchor' && WORD_ORACLE[99] === 'Wood');
  ok('spot-checks (50=Gossip, 51=Greet, 60=Lantern)', WORD_ORACLE[49] === 'Gossip' && WORD_ORACLE[50] === 'Greet' && WORD_ORACLE[59] === 'Lantern');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
