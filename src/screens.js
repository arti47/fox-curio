// screens.js — top-level screen renderers + persistent resource header.
// Phase 0: Home + Settings are live; Create/Day/Journal/Library are gated placeholders
// (built in later phases per CLAUDE.md §7). Everything renders with zero console errors.
import { el, $, clearNode, APP, d6, d20, d100, autoGrow } from './core.js';
import { Store } from './store.js';
import { Settings, applyTheme, nextTheme } from './settings.js';
import { season, bookCap, holidayOn } from './rules.js';
import { META, SEASONS, HOLIDAYS, ORDER_OF_PLAY, JOURNAL_GUIDE, WORD_ORACLE } from '../data.js';
import { endDaySummary, nextCalendar, onYearRollover } from './calendar.js';
import * as Engine from './engine.js';
import { townByKey, restock, buy, ownedSummary, tradeBooksForCoins } from './town.js';
import { runFishing } from './fishing.js';
import { canTravel, travelDays, isUpstream, arrivalPrompt } from './travel.js';
import { activeRepairs, hasRepairs, selfFix, hireTrade, tickRepairs, ownsItem } from './repairs.js';
import { availableKinds, letterRecipients, sendLetter, pendingMail, tickMail, KIND_LABEL } from './mail.js';
import { listProfiles, createProfile, updateProfile, deleteProfile, changeHeart, favoursAvailable, useFavour } from './profiles.js';
import { RECIPES } from '../data-compendium.js';
import { groupedHits } from './compendium.js';
import { TOWNS, TRADES } from '../data-compendium.js';
import { showToast, confirmModal, promptModal, modal, actionToast } from './ui.js';
import { go } from './router.js';

// ---- persistent resource header (shown in-play) ----
export function renderResourceStrip() {
  const strip = $('#resource-strip');
  const c = Store.activeCharacter();
  if (!c) { strip.hidden = true; clearNode(strip); return; }
  strip.hidden = false;
  clearNode(strip);
  const s = season(c.calendar.seasonIndex);
  strip.append(
    res('coins', '🪙', c.resources.coins, 'coins'),
    res('books', '📚', `${c.resources.books}/${bookCap(c)}`, 'books'),
    res('date', '🗓', `${s.name} ${c.calendar.day} · Y${c.calendar.year}`, 'date'),
  );
}
function res(kind, icon, value, label) {
  return el('span', { class: `res res--${kind}`, title: label }, [
    el('span', { 'aria-hidden': 'true', text: icon }), el('b', { text: String(value) }),
  ]);
}

// ---- Home ----
export function renderHome(root) {
  const c = Store.activeCharacter();
  const hero = el('div', { class: 'card hero' }, [
    el('div', { class: 'eyebrow', text: 'A solo journalling game' }),
    el('h1', { text: "Fox Curio's Floating Bookshop" }),
    el('p', { class: 'sub', text: 'A Year Upon a River' }),
    el('p', { text: 'You are a bookseller on a floating raft, carrying words and stories to the animalfolk of the River. Draw cards, roll dice, tend the whims of customers, and keep your daybook through the seasons.' }),
  ]);

  const cta = el('div', { class: 'card' });
  if (c) {
    const s = season(c.calendar.seasonIndex);
    cta.append(
      el('h2', { text: `${c.identity.name || 'Your bookseller'}${c.identity.species ? ', ' + c.identity.species : ''}` }),
      el('p', { class: 'muted', text: `${s.name}, day ${c.calendar.day} — ${c.resources.coins} coins, ${c.resources.books} books.` }),
      el('div', { class: 'pill-row' }, [
        el('button', { class: 'btn', text: 'Open the shop', onClick: () => go('day') }),
        el('button', { class: 'btn btn--ghost', text: 'Journal', onClick: () => go('journal') }),
      ]),
    );
  } else {
    cta.append(
      el('h2', { text: 'Begin your year on the River' }),
      el('p', { class: 'muted', text: 'Create your bookseller and set up the shop. You start with 100 coins and 500 books, moored in a town of your choosing while the River thaws.' }),
      el('button', { class: 'btn btn--block', text: 'Create your bookseller', onClick: () => go('create') }),
    );
  }

  root.append(hero, cta);
  if (c) root.append(friendsCard(c), inventoryCard(c));
}
function stat(n, label) { return el('div', { class: 'stat' }, [el('b', { text: String(n) }), el('span', { text: label })]); }

// ---- Friends / customer profiles (book: named profiles, hearts, favours) ----
function heartToast(prev, now) {
  if (now === prev) return;
  if (now > prev) {
    if (now === 3 || now === 6) showToast(`${now} hearts — they grant you a favour!`);
    else if (now === 2) showToast('2 hearts — a mailed letter now returns a gift.');
  } else showToast(`Heart removed — now ${now}.`);
}
function friendsCard(c) {
  const profiles = listProfiles(c);
  const card = el('div', { class: 'card' }, [
    el('h2', { text: 'Friends' }),
    el('p', { class: 'small muted', text: 'Customers you have chosen to record. Fill a heart when they share something meaningful (a story, secret, fear) — not casual chat. 3 & 6 hearts grant a favour; 2+ lets a letter return a gift.' }),
  ]);
  if (!profiles.length) card.append(el('p', { class: 'muted small', text: 'No friends yet — record one from a customer during a selling day, or add one here.' }));
  for (const p of profiles) card.append(friendRow(c, p));
  card.append(el('button', { class: 'btn', style: 'margin-top:10px', text: '＋ New profile', onClick: () => profileEditor(null, { home: true }) }));
  return card;
}
function friendRow(c, p) {
  const meta = [p.hometown, p.occupation].filter(Boolean).join(' · ');
  const fav = favoursAvailable(p);
  const addBtn = el('button', { class: 'btn btn--ghost btn--sm', text: `♥ ${p.hearts}/6`, title: 'Add a heart', onClick: () => { const r = changeHeart(p.id, +1); heartToast(r.prev, r.now); go('home'); } });
  addBtn.disabled = p.hearts >= 6;
  const remBtn = el('button', { class: 'btn btn--ghost btn--sm', text: '−', 'aria-label': 'Remove a heart', onClick: () => { const r = changeHeart(p.id, -1); heartToast(r.prev, r.now); go('home'); } });
  remBtn.disabled = p.hearts <= 0;
  const rows = [el('div', { class: 'row' }, [
    el('div', { class: 'row__text' }, [
      el('b', { text: p.name }),
      el('span', { text: meta || '—' }),
      p.observations ? el('span', { class: 'small muted', text: p.observations }) : '',
    ]),
    el('div', { class: 'pill-row' }, [addBtn, remBtn]),
  ])];
  const actions = el('div', { class: 'pill-row', style: 'margin-top:6px' }, [
    el('button', { class: 'btn btn--ghost btn--sm', text: 'Edit', onClick: () => profileEditor(p, { home: true }) }),
    el('button', {
      class: 'btn btn--ghost btn--sm', text: 'Delete', onClick: async () => {
        if (await confirmModal(`Delete ${p.name}'s profile?`, { title: 'Delete profile', okLabel: 'Delete', danger: true })) { deleteProfile(p.id); go('home'); }
      },
    }),
  ]);
  if (fav > 0) actions.append(
    el('span', { class: 'pill', text: `${fav} favour${fav === 1 ? '' : 's'} available` }),
    el('button', {
      class: 'btn btn--ghost btn--sm', text: 'Use favour', onClick: () => {
        if (!useFavour(p.id)) return;
        Store.update((s) => { const ch = s.characters[s.activeCharacterId]; ch.journal.push({ id: 'j' + Date.now(), year: c.calendar.year, seasonIndex: c.calendar.seasonIndex, day: c.calendar.day, title: 'Favour', body: `Called in ${p.name}'s favour to waive a cost.\n`, ts: Date.now() }); });
        showToast('Favour called in — waive the cost.'); go('home');
      },
    }),
  );
  rows.push(actions);
  return el('div', { class: 'friend', style: 'padding-bottom:10px;border-bottom:1px solid var(--border);margin-bottom:10px' }, rows);
}
// New/edit a customer profile with the book's template fields.
function profileEditor(existing, opts = {}) {
  const src = existing || {};
  const mkField = (label, key, ta = false) => {
    const input = ta ? el('textarea', { class: 'tall-md' }) : el('input', { type: 'text' });
    input.value = src[key] || (!existing && key === 'observations' && opts.prefillObs ? opts.prefillObs : '');
    input.dataset.pkey = key;
    if (ta) autoGrow(input);
    return el('div', { class: 'field' }, [el('label', { class: 'small muted', text: label }), input]);
  };
  const form = el('div', {}, [
    mkField('Name', 'name'), mkField('Age', 'age'), mkField('Hometown', 'hometown'),
    mkField('Occupation', 'occupation'), mkField('Observations', 'observations', true),
    mkField('Drawing / description', 'description', true),
  ]);
  const read = () => { const o = {}; form.querySelectorAll('[data-pkey]').forEach((n) => { o[n.dataset.pkey] = n.value.trim(); }); return o; };
  modal({
    title: existing ? 'Edit profile' : 'New customer profile', content: form,
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      {
        label: existing ? 'Save' : 'Create', onClick: () => {
          const o = read();
          if (!o.name) { showToast('Give them a name.'); return true; } // keep modal open
          if (existing) updateProfile(existing.id, o);
          else { createProfile({ ...o, hearts: opts.initialHearts || 0 }); if (opts.initialHearts) heartToast(0, opts.initialHearts); }
          go(opts.home ? 'home' : 'day');
        },
      },
    ],
  });
}
// From a customer flip: add a heart to an existing friend, or record a new one.
function befriendFromFlip(f) {
  const c = Store.activeCharacter();
  const profiles = listProfiles(c);
  const content = el('div', {}, [
    el('p', { class: 'small muted', text: 'Add a heart to the friend this customer represents, or record a new one — only when they share something meaningful.' }),
  ]);
  let ref;
  if (profiles.length) {
    const list = el('div', {});
    for (const p of profiles) {
      list.append(el('div', { class: 'row' }, [
        el('div', { class: 'row__text' }, [el('b', { text: p.name }), el('span', { text: `♥ ${p.hearts}/6${p.hometown ? ' · ' + p.hometown : ''}` })]),
        el('button', {
          class: 'btn btn--ghost btn--sm', text: '＋♥', title: 'Add a heart', onClick: () => {
            const r = changeHeart(p.id, +1); heartToast(r.prev, r.now); ref.close(); go('day');
          },
        }),
      ]));
    }
    content.append(list);
  } else {
    content.append(el('p', { class: 'muted small', text: 'No friends recorded yet.' }));
  }
  ref = modal({
    title: 'Add to a friend', content,
    actions: [
      { label: 'New friend', onClick: () => profileEditor(null, { initialHearts: 1, prefillObs: `Looking for ${f.genre}. ${f.customer.text}` }) },
      { label: 'Close', variant: 'ghost' },
    ],
  });
}

// Inventory — everything the bookseller owns: gear/upgrades, supplies, caught fish,
// signature items. Surfaces `supplies` and `caught`, which were tracked but never shown.
function inventoryCard(c) {
  const row = (label, value) => el('div', { class: 'row' }, [el('div', { class: 'row__text' }, [
    el('b', { text: label }), el('span', { text: value || 'none yet' }),
  ])]);
  const supplies = (c.supplies || []).filter((x) => x.qty > 0)
    .map((x) => `${x.name}${x.qty > 1 ? ` ×${x.qty}` : ''}`).join(' · ');
  const caughtCounts = {};
  for (const f of (c.caught || [])) caughtCounts[f.name] = (caughtCounts[f.name] || 0) + 1;
  const caught = Object.entries(caughtCounts).map(([n, q]) => `${n}${q > 1 ? ` ×${q}` : ''}`).join(' · ');
  const items = (c.identity.items || []).join(' · ');
  return el('div', { class: 'card' }, [
    el('h2', { text: 'Inventory' }),
    el('p', { class: 'small muted', text: `${c.resources.coins} coins · ${c.resources.books}/${bookCap(c)} books` }),
    row('Gear & upgrades', ownedSummary(c).join(' · ')),
    row('Supplies', supplies),
    row('Caught fish', caught),
    row('Signature items', items),
    el('p', { class: 'small muted', style: 'margin-top:8px', text: 'Buy supplies and gear at the town where you are moored (Visit town from the day).' }),
  ]);
}

// ---- Gated placeholders for later phases ----
function placeholder(root, { icon, title, note, phase }) {
  root.append(el('div', { class: 'card' }, [
    el('div', { class: 'placeholder' }, [
      el('div', { class: 'big', 'aria-hidden': 'true', text: icon }),
      el('h2', { text: title }),
      el('p', { class: 'muted', text: note }),
      el('p', { class: 'small muted', text: `Arriving in build ${phase}.` }),
    ]),
  ]));
}
function compendiumEntryRow(cat, entry) {
  return el('div', { class: 'row' }, [el('div', { class: 'row__text' }, [
    el('b', {}, [entry.title, entry.subtitle ? el('span', { class: 'pill', style: 'margin-left:6px', text: entry.subtitle }) : '']),
    entry.body ? el('div', { class: 'small muted', text: entry.body }) : null,
    ...entry.lines.map((l) => el('div', { class: 'small muted', text: l })),
  ])]);
}
export function renderLibrary(root) {
  root.append(el('div', { class: 'card' }, [
    el('h1', { text: 'The River' }),
    el('p', { class: 'lede', text: 'A compendium of everyone and everything along the River — search, or tap a category to open it.' }),
  ]));
  const search = el('input', { type: 'text', placeholder: 'Search the compendium…', 'aria-label': 'Search the compendium' });
  const groups = el('div', {});
  const draw = () => {
    clearNode(groups);
    const q = search.value.trim();
    const cats = groupedHits(q);
    let total = 0;
    for (const cat of cats) {
      if (q && !cat.entries.length) continue; // hide empty categories while searching
      total += cat.entries.length;
      const body = el('div', { class: 'accordion__body' }, cat.entries.slice(0, 200).map((e) => compendiumEntryRow(cat.label, e)));
      const acc = el('details', { class: 'accordion', open: q ? true : false }, [ // collapsed by default; search auto-opens
        el('summary', {}, [el('span', { text: cat.label })]),
        body,
      ]);
      groups.append(acc);
    }
    if (q && !total) groups.append(el('p', { class: 'muted small', text: 'Nothing matches that search.' }));
  };
  search.addEventListener('input', draw);
  root.append(el('div', { class: 'card' }, [el('div', { class: 'field' }, [search]), groups]));
  draw();
}

function needCharacter(root, verb) {
  root.append(el('div', { class: 'card' }, [
    el('div', { class: 'placeholder' }, [
      el('div', { class: 'big', 'aria-hidden': 'true', text: '✒️' }),
      el('h2', { text: 'Create a bookseller first' }),
      el('p', { class: 'muted', text: `You need a character before you can ${verb}.` }),
      el('button', { class: 'btn', text: 'Create your bookseller', onClick: () => go('create') }),
    ]),
  ]));
}
const dateLabel = (cal) => `${season(cal.seasonIndex).name} ${cal.day} · Year ${cal.year}`;

// ---- Day (Phase 3: the bookselling engine) ----
const cardBadge = (card) => el('span', { class: `cardpip ${['hearts', 'diamonds'].includes(card.suit) ? 'is-red' : ''}`, text: `${card.rank}${Engine.SUIT_SYMBOL[card.suit]}` });

export function renderDay(root) {
  const c = Store.activeCharacter();
  if (!c) return needCharacter(root, 'open the shop');
  if (Engine.hasSession()) return renderSession(root, c);

  const cal = c.calendar;
  const s = season(cal.seasonIndex);
  const holiday = holidayOn(cal.seasonIndex, cal.day);
  root.append(
    el('div', { class: 'card' }, [
      el('h1', { text: dateLabel(cal) }),
      el('p', { class: 'lede', text: `${s.name} — ${cal.weekName}. ${s.blurb}` }),
      holiday ? el('div', { class: 'pill', text: `Holiday: ${holiday.name} — open at a snail's pace, or take the day off.` }) : el('p', { class: 'small muted', text: s.travelNote }),
      hasRepairs(c) ? el('p', { class: 'small muted', text: '🔧 Needs repair: ' + activeRepairs(c).map((r) => r.label).join(', ') + '. Manage in town.' }) : null,
    ]),
    el('div', { class: 'card' }, [
      el('h2', { text: 'A day on the River' }),
      el('div', { class: 'pill-row' }, [
        el('button', { class: 'btn', text: 'Open the shop', onClick: () => { Engine.startDay(c); go('day'); } }),
        holiday ? el('button', { class: 'btn', text: 'Join the festivities', onClick: () => joinHoliday(c, holiday) }) : null,
        el('button', { class: 'btn btn--ghost', text: 'Visit town', onClick: () => go('town') }),
        el('button', { class: 'btn btn--ghost', text: 'Travel', onClick: () => go('travel') }),
        el('button', { class: 'btn btn--ghost', text: 'Go fishing', onClick: () => go('fishing') }),
        el('button', { class: 'btn btn--ghost', text: 'Share a meal', onClick: () => shareMeal(c) }),
        el('button', { class: 'btn btn--ghost', text: 'Take the day off', onClick: () => dayOff(c) }),
        el('button', { class: 'btn btn--ghost', text: 'Journal', onClick: () => go('journal') }),
      ]),
    ]),
  );
  if (c.log && c.log.length) {
    const logCard = el('div', { class: 'card' }, [el('h2', { text: 'Recent days' })]);
    for (const e of [...c.log].slice(-5).reverse()) {
      logCard.append(el('div', { class: 'row' }, [el('div', { class: 'row__text' }, [
        el('b', { text: `${season(e.seasonIndex).name} ${e.day}` }),
        el('span', { text: `${e.weather} · ${e.totals.customers} customers · +${e.totals.earnings}c · −${e.totals.booksSold} books` }),
      ])]));
    }
    root.append(logCard);
  }
}

// Share a meal — pick a recipe; its shared-meal prompt can seed a journal entry. §2.13.
function shareMeal(c) {
  const list = el('div', {});
  const wrap = el('div', {}, [el('p', { class: 'small muted', text: 'Cook a dish to share with a friend. Each meal reveals something about them.' }), list]);
  const draw = (recipe) => {
    clearNode(list);
    const sel = el('select', {}, RECIPES.map((r) => el('option', { value: r.name, text: r.name, selected: recipe && r.name === recipe.name })));
    sel.addEventListener('change', () => draw(RECIPES.find((r) => r.name === sel.value)));
    list.append(el('div', { class: 'field' }, [sel]));
    if (recipe) list.append(
      el('p', { class: 'small' }, [el('b', { text: 'Ingredients: ' }), recipe.ingredients.join(', ') + '.']),
      el('p', {}, [el('b', { text: 'Reveals: ' }), recipe.reveals]),
    );
  };
  draw(RECIPES[0]);
  const getRecipe = () => RECIPES.find((r) => r.name === list.querySelector('select').value) || RECIPES[0];
  modal({
    title: 'Share a meal', content: wrap,
    actions: [
      { label: 'Close', variant: 'ghost' },
      { label: 'Write in journal', onClick: () => {
        const r = getRecipe();
        Store.update((save) => {
          const ch = save.characters[save.activeCharacterId];
          ch.journal.push({ id: 'j' + Date.now(), year: c.calendar.year, seasonIndex: c.calendar.seasonIndex, day: c.calendar.day, title: `Shared ${r.name}`, body: `${r.reveals}\n\n`, ts: Date.now() });
        });
        showToast('Added to your journal.'); go('journal');
      } },
    ],
  });
}
async function dayOff(c) {
  const nxt = { ...c.calendar };
  const { next, lines } = endDaySummary(c.calendar);
  if (!(await confirmModal('A day off — no customers, no earnings. ' + lines[0], { title: 'Take the day off', okLabel: 'Day off' }))) return;
  Store.markUndo('day');
  let repairLog = [];
  Store.update((save) => {
    const ch = save.characters[save.activeCharacterId];
    repairLog = tickRepairs(ch, 1).concat(tickMail(ch, 1));
    const seasonChanged = next.seasonIndex !== ch.calendar.seasonIndex;
    ch.calendar = { year: next.year, seasonIndex: next.seasonIndex, day: next.day, weekName: next.weekName };
    if (next.events && next.events.includes('year')) onYearRollover(save, ch, next.year);
    if (seasonChanged) ch.weatherEvent = { season: next.seasonIndex, count: 0 };
  });
  if (repairLog.length) showToast(repairLog.join(' '));
  actionToast(`Now ${dateLabel(next)}.`, 'Undo', () => { Store.undo(); go('day'); });
  go('day');
}

function renderSession(root, c) {
  const sess = Engine.currentSession();
  const live = el('div', { class: 'card', 'aria-live': 'polite' });

  // Weather block (always shown once drawn)
  const wx = el('div', { class: 'card' }, [
    el('h2', { text: `${season(sess.si).name} ${sess.day} — weather` }),
    el('p', {}, [cardBadge(sess.c1), ' ', el('b', { text: sess.morning.weather }), ` (${labelForecast(sess.morning.forecast)})`]),
    el('p', { class: 'small muted' }, [cardBadge(sess.c2), ` Duration: ${sess.duration}.`,
      sess.afternoon ? el('span', {}, [' Then ', cardBadge(sess.c3), ` ${sess.afternoon.weather}`]) : '']),
    sess.eventFired ? el('div', { class: 'pill', text: `⚡ ${season(sess.si).weatherEvent.text}` })
      : el('p', { class: 'small muted', text: `Weather-event counter (${sess.trigger}): ${sess.counterAfter}/3` }),
  ]);
  root.append(wx);

  if (sess.phase === 'weather') {
    root.append(el('div', { class: 'pill-row' }, [
      el('button', { class: 'btn', text: 'Roll the daily task', onClick: () => { Engine.rollTask(c); go('day'); } }),
      el('button', { class: 'btn btn--ghost', text: 'Abandon day', onClick: () => { Engine.abandonSession(); go('day'); } }),
    ]));
    return;
  }

  // Task + customers
  const taskCard = el('div', { class: 'card' }, [
    el('h2', { text: `Daily task (d20 → ${sess.taskRoll})` }),
    el('p', { text: sess.task.text }),
    sess.extraTaskCards ? el('p', { class: 'small muted', text: `Card modifier today: ${sess.extraTaskCards > 0 ? '+' : ''}${sess.extraTaskCards}` }) : null,
  ]);
  if (sess.task.roll) taskCard.append(taskRollWidget(c, sess.task)); // in-prompt roll (e.g. Bloom-20 merch)
  root.append(taskCard);

  const target = Engine.targetCardCount();
  const flipsCard = el('div', { class: 'card' }, [el('h2', { text: `Customers (${sess.flips.length}/${target})` })]);
  for (const f of sess.flips) flipsCard.append(flipRow(f));
  root.append(flipsCard);

  root.append(inspirationBox(c, sess)); // 3-word oracle + inline journal box

  if (sess.phase === 'customers') {
    if (sess.flips.length < target) {
      root.append(el('button', { class: 'btn btn--block', text: target === 0 ? 'No customers today — end of day' : 'Flip next customer', onClick: () => { if (target > 0) Engine.flipCustomer(); go('day'); } }));
    } else {
      // Closing early skips the extra-customer roll, then halves (ORDER_OF_PLAY.closingEarly).
      const forced = !!(sess.task && sess.task.effect && sess.task.effect.closeEarly);
      if (forced) root.append(el('p', { class: 'small muted', text: 'The weather makes you close up early — extra customers are skipped and the day is halved.' }));
      const bar = el('div', { class: 'pill-row' });
      if (!forced) bar.append(el('button', { class: 'btn', text: 'End of day — roll extra customers', onClick: () => { Engine.rollExtra(); go('day'); } }));
      bar.append(el('button', { class: forced ? 'btn' : 'btn btn--ghost', text: 'Close early (skip extras, halve)', onClick: () => { Engine.tally(c, { closeEarly: true }); go('day'); } }));
      root.append(bar);
    }
    return;
  }

  if (sess.phase === 'closing') {
    root.append(el('div', { class: 'card' }, [
      el('p', { text: `Extra customers (d20 → ${sess.extraRoll}): ${sess.extraDraw} extra card${sess.extraDraw === 1 ? '' : 's'}.` }),
    ]));
    root.append(el('button', { class: 'btn btn--block', text: 'Tally the day', onClick: () => { Engine.tally(c); go('day'); } }));
    return;
  }

  if (sess.phase === 'tally') {
    const t = sess.totals;
    root.append(el('div', { class: 'card' }, [
      el('h2', { text: 'End of day' }),
      el('div', { class: 'stat-grid' }, [
        stat(t.customers, 'customers'), stat('+' + t.earnings, 'coins'), stat('−' + t.booksSold, 'books'),
      ]),
      t.halved ? el('p', { class: 'small muted', text: 'Totals halved (clocks/close-early).' }) : null,
      el('p', { class: 'small muted', text: `New balance: ${c.resources.coins + t.earnings} coins, ${Math.max(0, c.resources.books - t.booksSold)} books.` }),
      el('div', { class: 'pill-row', style: 'margin-top:8px' }, [
        el('button', { class: 'btn', text: 'Finish day', onClick: () => finishDay(sess) }),
        el('button', { class: 'btn btn--ghost', text: 'Write entry first', onClick: () => go('journal') }),
      ]),
    ]));
  }
}

// A generic roll+journal helper for tasks whose text embeds a die roll (task.roll).
// The app rolls and shows the result; you read the prompt and journal what you decide.
function taskRollWidget(c, task) {
  const die = task.roll.die === 'd20' ? 'd20' : 'd6';
  const wrap = el('div', { class: 'task-roll', 'aria-live': 'polite' }, [
    el('p', { class: 'small', html: '<b>⚡ This task calls for a roll.</b>' }),
    task.roll.note ? el('p', { class: 'small muted', text: task.roll.note }) : null,
  ]);
  const result = el('p', { class: 'roll-result', hidden: true });
  let last = null;
  const journalBtn = el('button', { class: 'btn btn--ghost btn--sm', text: '✎ Note in journal', disabled: true });
  const rollBtn = el('button', {
    class: 'btn btn--ghost btn--sm', text: `🎲 Roll ${die}`, onClick: () => {
      last = die === 'd20' ? d20() : d6();
      result.hidden = false;
      result.textContent = `${die} → ${last} (${last % 2 === 0 ? 'even' : 'odd'}).`;
      journalBtn.disabled = false;
    },
  });
  journalBtn.addEventListener('click', () => {
    Store.update((save) => {
      const ch = save.characters[save.activeCharacterId];
      ch.journal.push({
        id: 'j' + Date.now(), year: c.calendar.year, seasonIndex: c.calendar.seasonIndex, day: c.calendar.day,
        title: 'Daily task', body: `${task.text}\n\nRolled ${die} → ${last} (${last % 2 === 0 ? 'even' : 'odd'}).\n`, ts: Date.now(),
      });
    });
    showToast('Added to your journal.');
  });
  wrap.append(el('div', { class: 'pill-row' }, [rollBtn, journalBtn]), result);
  return wrap;
}

// 3-word inspiration oracle (T30) + an inline "today's journal" box, shown during the
// selling session. The draft persists across the session's re-renders (module-scoped),
// keyed to the current day; cleared when the day is finished.
let inspDraft = { key: null, words: [], text: '' };
const rollWords = () => [d100(), d100(), d100()].map((n) => WORD_ORACLE[n - 1]);
function inspStateFor(sess) {
  const key = `${sess.si}-${sess.day}`;
  if (inspDraft.key !== key) inspDraft = { key, words: [], text: '' };
  if (!inspDraft.words.length) inspDraft.words = rollWords();
  return inspDraft;
}
function clearInspDraft() { inspDraft = { key: null, words: [], text: '' }; }

function inspirationBox(c, sess) {
  const st = inspStateFor(sess);
  const ta = el('textarea', { class: 'tall-md', placeholder: "Write today's journal — tap a word above to drop it in." });
  ta.value = st.text;
  autoGrow(ta);
  ta.addEventListener('input', () => { st.text = ta.value; });
  const insertWord = (w) => {
    const s = ta.selectionStart ?? ta.value.length, e = ta.selectionEnd ?? ta.value.length;
    const before = ta.value.slice(0, s), after = ta.value.slice(e);
    const chunk = (before && !/\s$/.test(before) ? ' ' : '') + w;
    ta.value = before + chunk + after;
    st.text = ta.value;
    const caret = (before + chunk).length;
    ta.focus(); ta.setSelectionRange(caret, caret);
    ta.dispatchEvent(new Event('input')); // re-grow
  };
  const words = el('div', { class: 'pill-row' }, st.words.map((w) => el('button', { class: 'btn btn--ghost btn--sm', text: w, title: 'Insert into journal', onClick: () => insertWord(w) })));
  const actions = el('div', { class: 'pill-row', style: 'margin-top:10px' }, [
    el('button', { class: 'btn btn--ghost btn--sm', text: '🎲 Reroll', onClick: () => { st.words = rollWords(); go('day'); } }),
    el('button', { class: 'btn btn--ghost btn--sm', text: 'Insert all', onClick: () => st.words.forEach(insertWord) }),
    el('button', {
      class: 'btn btn--sm', text: 'Save entry', onClick: () => {
        const body = st.text.trim();
        if (!body) { showToast('Write something first.'); return; }
        Store.update((save) => {
          const ch = save.characters[save.activeCharacterId];
          ch.journal.push({ id: 'j' + Date.now(), year: c.calendar.year, seasonIndex: c.calendar.seasonIndex, day: c.calendar.day, title: '', body, ts: Date.now() });
        });
        st.text = '';
        showToast('Entry saved.'); go('day');
      },
    }),
  ]);
  return el('div', { class: 'card' }, [
    el('h2', { text: '✨ Inspiration' }),
    el('p', { class: 'small muted', text: 'Three words to spark the day. Tap one to drop it into your journal, or reroll.' }),
    words,
    el('div', { class: 'field', style: 'margin-top:10px' }, [el('label', { class: 'small muted', text: "Today's journal" }), ta]),
    actions,
  ]);
}

function labelForecast(f) { return { dead: 'Dead', snail: "Snail's pace", quiet: 'Quiet', steady: 'Steady', busy: 'Busy', extreme: 'Extremely busy' }[f]; }
function flipRow(f) {
  const right = el('div', { class: 'pill-row' });
  if (f.customer.deepen) {
    right.append(el('button', {
      class: 'btn btn--ghost btn--sm', text: '＋ Friend', title: 'Record a friend / add a heart',
      onClick: () => befriendFromFlip(f),
    }));
  }
  return el('div', { class: 'row' }, [
    el('div', { class: 'row__text' }, [
      el('b', {}, [cardBadge(f.card), ['J', 'Q', 'K'].includes(f.card.rank) ? el('span', { class: 'pill', style: 'margin-left:6px', text: 'royalty' }) : '']),
      el('span', { text: `${f.customer.text} — looking for ${f.genre}.` }),
      f.customer.deepen ? el('span', { class: 'small muted', text: `If befriended: ${f.customer.deepen}` }) : '',
    ]),
    right,
  ]);
}

// ---- Town (Phase 4) ----
export function renderTown(root) {
  const c = Store.activeCharacter();
  if (!c) return needCharacter(root, 'visit town');
  const town = townByKey(c.shop.mooredTown) || TOWNS[0];
  const s = season(c.calendar.seasonIndex);

  root.append(el('div', { class: 'card' }, [
    el('h1', { text: town.name }),
    el('p', { class: 'lede', text: town.blurb }),
    el('p', { class: 'small muted', text: `Moored here · ${c.resources.coins} coins · ${c.resources.books}/${bookCap(c)} books` }),
    ownedSummary(c).length ? el('p', { class: 'small muted', text: 'Owned: ' + ownedSummary(c).join(' · ') }) : null,
    el('button', { class: 'btn btn--ghost btn--sm', text: '← Back to the day', onClick: () => go('day') }),
  ]));

  // Restock
  const rc = el('div', { class: 'card' }, [
    el('h2', { text: 'Restock' }),
    el('p', { class: 'small muted', text: s.restock == null ? 'Trade stops in Brisk — no restocking until Bloom.' : `Refill to 500 books for ${s.restock} coins (arrives next day).` }),
  ]);
  if (s.restock != null) rc.append(el('button', { class: 'btn', text: `Restock (${s.restock}c)`, onClick: () => { const r = restock(c); showToast(r.msg); go('town'); } }));
  root.append(rc);

  // Trade books for coins (1:1) — the fallback when coins run low. §2.3/§2.16.
  const tradeQty = el('input', { type: 'number', min: '1', max: String(c.resources.books), value: '10', 'aria-label': 'Books to trade', style: 'max-width:96px' });
  root.append(el('div', { class: 'card' }, [
    el('h2', { text: 'Trade books for coins' }),
    el('p', { class: 'small muted', text: '1 book = 1 coin. Useful when your purse runs empty.' }),
    el('div', { class: 'pill-row' }, [
      tradeQty,
      el('button', { class: 'btn btn--ghost', text: 'Trade', onClick: () => { const r = tradeBooksForCoins(c, Number(tradeQty.value)); showToast(r.msg); go('town'); } }),
    ]),
  ]));

  // Repairs — hire a tradesanimal at the post office, or fix with the needed item.
  if (hasRepairs(c)) root.append(repairsCard(c));

  // Post office — send letters to friends; a reply (and a gift, at 2+ hearts) returns.
  root.append(postOfficeCard(c));

  // Shops
  for (const shop of town.shops) {
    const card = el('div', { class: 'card' }, [el('h2', { text: shop.name })]);
    for (const item of shop.items) {
      card.append(el('div', { class: 'row' }, [
        el('div', { class: 'row__text' }, [el('b', { text: item.name }), el('span', { text: item.note || '' })]),
        el('button', { class: 'btn btn--ghost btn--sm', text: `${item.price}c`, onClick: () => { const r = buy(c, item); showToast(r.msg); go('town'); } }),
      ]));
    }
    root.append(card);
  }
  if (town.specialBooks && town.specialBooks.length) {
    root.append(el('div', { class: 'card' }, [
      el('h2', { text: 'Special books here' }),
      ...town.specialBooks.map((b) => el('div', { class: 'row' }, [el('div', { class: 'row__text' }, [el('b', { text: b.title }), el('span', { text: `${b.price} coins` })])])),
    ]));
  }

  // Book orders this season
  const orders = season(c.calendar.seasonIndex).orders;
  const oc = el('div', { class: 'card' }, [el('h2', { text: `Book orders — ${season(c.calendar.seasonIndex).name}` })]);
  for (const o of orders) {
    const id = `${c.calendar.seasonIndex}-${o.customer}-${o.book}`;
    const done = (c.ordersDone || []).includes(id);
    oc.append(el('div', { class: 'row' }, [
      el('div', { class: 'row__text' }, [el('b', { text: `${o.customer} (${o.at})` }), el('span', { text: `${o.book} — from ${o.from}` })]),
      done ? el('span', { class: 'pill', text: '✓ done' })
        : el('button', { class: 'btn btn--ghost btn--sm', text: `Fulfil +${o.reward}c`, onClick: () => fulfilOrder(id, o) }),
    ]));
  }
  root.append(oc);
}
function fulfilOrder(id, o) {
  Store.update((s) => { const ch = s.characters[s.activeCharacterId]; ch.ordersDone = ch.ordersDone || []; if (!ch.ordersDone.includes(id)) { ch.ordersDone.push(id); ch.resources.coins += o.reward; } });
  showToast(`Order fulfilled — +${o.reward} coins.`);
  go('town');
}
function repairPenaltyText(r) {
  const bits = [];
  if (r.cards) bits.push(`${r.cards} card/day`);
  if (r.cardsRainy) bits.push(`${r.cardsRainy} cards when rainy`);
  if (r.noTravel) bits.push('blocks travel');
  return bits.join(', ');
}
function repairsCard(c) {
  const card = el('div', { class: 'card' }, [
    el('h2', { text: 'Repairs' }),
    el('p', { class: 'small muted', text: 'Fix with the needed item, or hire a tradesanimal at the post office (arrives next day; each day, odd d6 = fixed, and the daily fee is charged).' }),
  ]);
  for (const r of activeRepairs(c)) {
    const status = r.hired ? (r.arriveCountdown > 0 ? 'tradesanimal on the way' : `${r.trade} at work (${r.perDay}c/day)`) : 'broken';
    const penalty = repairPenaltyText(r);
    const actions = el('div', { class: 'pill-row' });
    if (r.needs) {
      const owned = ownsItem(c, r.needs);
      const b = el('button', { class: 'btn btn--ghost btn--sm', text: `Use ${r.needs}`, title: owned ? '' : `Buy ${r.needs} first`, onClick: () => { const m = selfFix(r.key); showToast(m.text); go('town'); } });
      if (!owned) b.disabled = true;
      actions.append(b);
    }
    if (r.trade && !r.hired) {
      const t = TRADES.find((x) => x.key === r.trade);
      actions.append(el('button', { class: 'btn btn--ghost btn--sm', text: `Hire ${t.name} (${t.perDay}c/day)`, onClick: () => { const m = hireTrade(r.key); showToast(m.text); go('town'); } }));
    }
    card.append(el('div', { class: 'row' }, [
      el('div', { class: 'row__text' }, [el('b', { text: r.label }), el('span', { text: `${status}${penalty ? ' · ' + penalty : ''}` })]),
      actions,
    ]));
  }
  return card;
}

function postOfficeCard(c) {
  const kinds = availableKinds(c);
  const recipients = letterRecipients(c);
  const pending = pendingMail(c);
  const card = el('div', { class: 'card' }, [
    el('h2', { text: 'Post office' }),
    el('p', { class: 'small muted', text: 'Write to a friend you have met. A reply arrives in twice the mail time; at 2+ hearts they send a gift.' }),
  ]);
  if (!kinds.length) { card.append(el('p', { class: 'small muted', text: 'No post office here, or all post is closed this season.' })); }
  else if (!recipients.length) { card.append(el('p', { class: 'small muted', text: 'You have no friends to write to yet — fill a heart with a customer first.' })); }
  else {
    const rSel = el('select', {}, recipients.map((r) => el('option', { value: r.key, text: `${r.label} (♥${r.hearts})` })));
    const kSel = el('select', {}, kinds.map((k) => el('option', { value: k.kind, text: `${KIND_LABEL[k.kind]} — ${k.price}c, reply ~${k.mailTime * 2}d` })));
    card.append(
      el('div', { class: 'field' }, [el('label', { class: 'small muted', text: 'To' }), rSel]),
      el('div', { class: 'field' }, [el('label', { class: 'small muted', text: 'By' }), kSel]),
      el('button', { class: 'btn', text: 'Send letter', onClick: () => { const r = sendLetter(rSel.value, kSel.value); showToast(r.msg); go('town'); } }),
    );
  }
  if (pending.length) {
    card.append(el('h3', { class: 'small', text: 'Awaiting reply' }));
    for (const m of pending) {
      const who = recipients.find((r) => r.key === m.recipientKey);
      card.append(el('div', { class: 'row' }, [el('div', { class: 'row__text' }, [
        el('b', { text: KIND_LABEL[m.kind] }),
        el('span', { text: `to ${who ? who.label : m.recipientKey} — ${m.countdown} day${m.countdown === 1 ? '' : 's'} until a reply` }),
      ])]));
    }
  }
  return card;
}

// ---- Fishing (Phase 4) ----
export function renderFishing(root) {
  const c = Store.activeCharacter();
  if (!c) return needCharacter(root, 'go fishing');
  root.append(el('div', { class: 'card' }, [
    el('h1', { text: 'Fishing' }),
    el('p', { class: 'lede', text: 'Cast a line from the raft. Draw to a bite, then reel — two red cards land the fish, two black and it slips away.' }),
    el('div', { class: 'pill-row' }, [
      el('button', { class: 'btn', text: 'Cast your line', onClick: () => castLine(root, c) }),
      el('button', { class: 'btn btn--ghost', text: '← Back', onClick: () => go('day') }),
    ]),
  ]));
}
function castLine(root, c) {
  const res = runFishing(c.calendar.seasonIndex);
  const out = el('div', { class: 'card', 'aria-live': 'polite' }, [
    el('h2', { text: res.result === 'caught' ? 'You landed it!' : 'It slipped away…' }),
    el('p', {}, res.cards.map((card) => cardBadge(card))),
    el('p', { class: 'small muted', text: `${res.hours} hour${res.hours === 1 ? '' : 's'} waiting for a bite.` }),
  ]);
  if (res.result === 'caught') {
    out.append(el('p', { text: 'Choose your catch:' }));
    const row = el('div', { class: 'pill-row' });
    for (const fish of res.fishOptions) {
      row.append(el('button', { class: 'btn btn--ghost btn--sm', text: fish.name, onClick: () => keepFish(fish) }));
    }
    out.append(row);
    if (!res.fishOptions.length) out.append(el('p', { class: 'small muted', text: 'No fish bite in this season.' }));
  }
  root.append(out);
}
function keepFish(fish) {
  Store.update((s) => { const ch = s.characters[s.activeCharacterId]; ch.caught.push({ name: fish.name, ts: Date.now() }); });
  showToast(`Kept a ${fish.name}. ${fish.prompt}`);
  go('day');
}

// ---- Holidays (Phase 4) ----
function joinHoliday(c, h) {
  const body = el('div', {}, [
    el('p', { text: h.about }),
    el('p', { class: 'small muted', text: 'To take part: ' + h.participate }),
    el('p', { class: 'small', html: '<b>Something happens (choose one to journal):</b>' }),
    ...h.prompts.map((p, i) => el('p', { class: 'small', text: `${i + 1}. ${p}` })),
    el('p', { class: 'small muted', text: 'Token: ' + h.token }),
  ]);
  modal({ title: h.name, content: body, actions: [
    { label: 'Not today', variant: 'ghost' },
    { label: 'Celebrate (day off)', onClick: () => celebrate(c, h) },
  ] });
}
function celebrate(c, h) {
  const next = nextCalendar(c.calendar);
  Store.markUndo('day');
  Store.update((s) => {
    const ch = s.characters[s.activeCharacterId];
    if (h.tokenEffect && h.tokenEffect.coins) ch.resources.coins = Math.max(0, ch.resources.coins + h.tokenEffect.coins);
    tickRepairs(ch, 1); tickMail(ch, 1);
    const seasonChanged = next.seasonIndex !== ch.calendar.seasonIndex;
    ch.calendar = { year: next.year, seasonIndex: next.seasonIndex, day: next.day, weekName: next.weekName };
    if (next.events && next.events.includes('year')) onYearRollover(s, ch, next.year);
    if (seasonChanged) ch.weatherEvent = { season: next.seasonIndex, count: 0 };
  });
  actionToast(`Token: ${h.token}`, 'Undo', () => { Store.undo(); go('day'); });
  go('day');
}

// ---- Travel (Phase 4) ----
export function renderTravel(root) {
  const c = Store.activeCharacter();
  if (!c) return needCharacter(root, 'travel');
  const legal = canTravel(c);
  root.append(el('div', { class: 'card' }, [
    el('h1', { text: 'Travel the River' }),
    el('p', { class: 'lede', text: `Moored at ${townByKey(c.shop.mooredTown).name}. Choose a town to paddle to.` }),
    legal.ok ? null : el('div', { class: 'pill', text: '⛔ ' + legal.reason }),
    el('button', { class: 'btn btn--ghost btn--sm', text: '← Back to the day', onClick: () => go('day') }),
  ]));
  const list = el('div', { class: 'card' }, [el('h2', { text: 'Destinations' })]);
  for (const t of TOWNS) {
    if (t.key === c.shop.mooredTown) continue;
    const days = travelDays(c.shop.mooredTown, t.key);
    list.append(el('div', { class: 'row' }, [
      el('div', { class: 'row__text' }, [el('b', { text: t.name }), el('span', { text: `${t.course} course · ${days} day${days === 1 ? '' : 's'} ${isUpstream(c.shop.mooredTown, t.key) ? 'upstream' : 'downstream'}` })]),
      (() => { const b = el('button', { class: 'btn btn--ghost btn--sm', text: 'Go', onClick: () => doTravel(c, t.key, days) }); if (!legal.ok) b.disabled = true; return b; })(),
    ]));
  }
  root.append(list);
}
function doTravel(c, toKey, days) {
  Store.markUndo('travel');
  Store.update((s) => {
    const ch = s.characters[s.activeCharacterId];
    const startSeason = ch.calendar.seasonIndex;
    const startYear = ch.calendar.year;
    let cur = { ...ch.calendar };
    for (let i = 0; i < days; i++) { const n = nextCalendar(cur); cur = { year: n.year, seasonIndex: n.seasonIndex, day: n.day, weekName: n.weekName }; }
    tickRepairs(ch, days); tickMail(ch, days); // tradesanimals + mail advance each day
    ch.calendar = cur; ch.shop.mooredTown = toKey;
    if (cur.year > startYear) onYearRollover(s, ch, cur.year);
    if (cur.seasonIndex !== startSeason) ch.weatherEvent = { season: cur.seasonIndex, count: 0 };
  });
  const arr = arrivalPrompt(Store.activeCharacter().calendar.seasonIndex, d6());
  actionToast(`Arrived at ${townByKey(toKey).name} after ${days} day(s). ${arr}`, 'Undo', () => { Store.undo(); go('travel'); });
  go('town');
}
function finishDay(sess) {
  const from = dateLabel(Store.activeCharacter().calendar);
  Engine.finishDay();
  clearInspDraft(); // fresh inspiration next day
  actionToast('Day recorded.', 'Undo', () => { Store.undo(); go('day'); });
  go('day');
}

// ---- Journal (Phase 2) ----
export function renderJournal(root) {
  const c = Store.activeCharacter();
  if (!c) return needCharacter(root, 'keep a journal');
  const cal = c.calendar;

  root.append(el('h1', { text: 'Journal' }));

  // New entry for the current day
  const titleInput = el('input', { type: 'text', placeholder: 'Title (optional)' });
  const bodyInput = el('textarea', { class: 'tall', placeholder: `Write your entry for ${dateLabel(cal)}…` });
  autoGrow(bodyInput);
  const addCard = el('div', { class: 'card' }, [
    el('h2', { text: `New entry — ${dateLabel(cal)}` }),
    el('div', { class: 'field' }, [titleInput]),
    el('div', { class: 'field' }, [bodyInput]),
    el('button', { class: 'btn', text: 'Save entry', onClick: () => {
      const body = bodyInput.value.trim();
      if (!body && !titleInput.value.trim()) { showToast('Write something first.'); return; }
      Store.update((save) => {
        const ch = save.characters[save.activeCharacterId];
        ch.journal.push({ id: 'j' + Date.now(), year: cal.year, seasonIndex: cal.seasonIndex, day: cal.day, title: titleInput.value.trim(), body, ts: Date.now() });
      });
      showToast('Entry saved.'); go('journal');
    } }),
  ]);

  // Search + list
  const search = el('input', { type: 'text', placeholder: 'Search entries…' });
  const list = el('div', {});
  const draw = () => {
    clearNode(list);
    const q = search.value.trim().toLowerCase();
    const entries = [...c.journal].sort((a, b) => b.ts - a.ts)
      .filter((e) => !q || (e.title + ' ' + e.body).toLowerCase().includes(q));
    if (!entries.length) { list.append(el('p', { class: 'muted small', text: c.journal.length ? 'No matching entries.' : 'No entries yet — your story starts here.' })); return; }
    for (const e of entries) list.append(entryRow(e));
  };
  search.addEventListener('input', draw);

  root.append(addCard, el('div', { class: 'card' }, [
    el('h2', { text: `Entries (${c.journal.length})` }),
    el('div', { class: 'field' }, [search]), list,
  ]));
  draw();
}
function entryRow(e) {
  const when = `${SEASONS[META.seasons[e.seasonIndex]].name} ${e.day} · Y${e.year}`;
  const row = el('div', { class: 'row' }, [
    el('div', { class: 'row__text' }, [
      el('b', { text: e.title || when }),
      el('span', { text: (e.title ? when + ' — ' : '') + (e.body.length > 90 ? e.body.slice(0, 90) + '…' : e.body) }),
    ]),
    el('div', { class: 'pill-row' }, [
      el('button', { class: 'btn btn--ghost btn--sm', text: 'Edit', onClick: async () => {
        const v = await promptModal('Edit entry', { title: e.title || when, value: e.body, multiline: true, okLabel: 'Save' });
        if (v == null) return;
        Store.update((save) => { const ch = save.characters[save.activeCharacterId]; const t = ch.journal.find((x) => x.id === e.id); if (t) t.body = v; });
        go('journal');
      } }),
      el('button', { class: 'btn btn--ghost btn--sm', text: 'Delete', onClick: async () => {
        if (!(await confirmModal('Delete this entry?', { title: 'Delete', okLabel: 'Delete' }))) return;
        Store.update((save) => { const ch = save.characters[save.activeCharacterId]; ch.journal = ch.journal.filter((x) => x.id !== e.id); });
        go('journal');
      } }),
    ]),
  ]);
  return row;
}

// ---- Settings ----
export function renderSettings(root) {
  const themeMode = Settings.theme();
  const themeRow = el('div', { class: 'row' }, [
    el('div', { class: 'row__text' }, [el('b', { text: 'Theme' }), el('span', { text: 'Follows your system by default.' })]),
    themeButton(),
  ]);
  function themeButton() {
    const label = { system: 'System', light: 'Light', dark: 'Dark' }[Settings.theme()];
    return el('button', { class: 'btn btn--ghost btn--sm', text: label, onClick: (e) => {
      const mode = nextTheme(); Settings.setTheme(mode);
      e.target.textContent = { system: 'System', light: 'Light', dark: 'Dark' }[mode];
    } });
  }

  const backup = el('div', { class: 'card' }, [
    el('h2', { text: 'Backup' }),
    el('p', { class: 'small muted', text: 'Your game is saved on this device. Export a JSON copy, or import one to restore.' }),
    el('div', { class: 'pill-row', style: 'margin-top:8px' }, [
      el('button', { class: 'btn btn--ghost btn--sm', text: 'Export JSON', onClick: doExport }),
      el('button', { class: 'btn btn--ghost btn--sm', text: 'Import JSON', onClick: doImport }),
      el('button', { class: 'btn btn--ghost btn--sm', text: 'Reset game', onClick: doReset }),
    ]),
  ]);

  root.append(
    el('h1', { text: 'Settings & About' }),
    el('div', { class: 'card' }, [el('h2', { text: 'Appearance' }), themeRow]),
    guideCard(),
    backup,
    el('div', { class: 'card' }, [
      el('h2', { text: 'About' }),
      el('p', { class: 'small muted', text: `Fox Curio's Floating Bookshop — a solo journalling game by Ella Lim (Lost Ways Club, 2023). This is a personal play-aid, v${APP.version}.` }),
    ]),
  );
}

// How to play & journal — a collapsed guide built from JOURNAL_GUIDE + ORDER_OF_PLAY.
function guideCard() {
  const details = (summary, items, ordered = true) => {
    const list = el(ordered ? 'ol' : 'ul', { class: 'guide-list' }, items.map((t) => el('li', { text: t })));
    return el('details', { class: 'accordion' }, [el('summary', {}, [el('span', { text: summary })]), el('div', { class: 'accordion__body' }, [list])]);
  };
  return el('div', { class: 'card' }, [
    el('h2', { text: 'How to play & journal' }),
    el('p', { text: JOURNAL_GUIDE.intro }),
    el('ol', { class: 'guide-list' }, JOURNAL_GUIDE.steps.map((t) => el('li', { text: t }))),
    el('p', { class: 'small muted', text: JOURNAL_GUIDE.tip }),
    details('Bookselling — order of play', ORDER_OF_PLAY.bookselling),
    details('A day off — order of play', ORDER_OF_PLAY.daysOff),
    el('details', { class: 'accordion' }, [
      el('summary', {}, [el('span', { text: 'Closing early' })]),
      el('div', { class: 'accordion__body' }, [el('p', { class: 'small', text: ORDER_OF_PLAY.closingEarly })]),
    ]),
  ]);
}

function doExport() {
  const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: `fox-curio-save-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Save exported.');
}
function doImport() {
  const input = el('input', { type: 'file', accept: 'application/json', style: 'display:none' });
  input.addEventListener('change', () => {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { Store.importJSON(reader.result); showToast('Save imported.'); go('home'); }
      catch { showToast('Could not read that file.'); }
    };
    reader.readAsText(file);
  });
  document.body.append(input); input.click(); input.remove();
}
async function doReset() {
  if (await confirmModal('Erase this game and start over? Export a backup first if you want to keep it.', { title: 'Reset game', okLabel: 'Erase', danger: true })) {
    Store.reset(); showToast('Game reset.'); go('home');
  }
}
