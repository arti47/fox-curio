// wizard.js — character + shop creation wizard (Phase 1). One logical small group per page.
import { el, clearNode, uid, pick, autoGrow } from './core.js';
import { CREATION, SHOP_SETUP } from '../data.js';
import { TOWNS } from '../data-compendium.js';
import { Store } from './store.js';
import { showToast } from './ui.js';
import { go } from './router.js';

const formerLifeAll = [
  ...CREATION.formerLifeBookseller.map((t) => ({ t, group: 'Bookseller' })),
  ...CREATION.formerLifeOther.map((t) => ({ t, group: 'Other path' })),
];

let draft = null;
let step = 0;

function fresh() {
  return {
    name: '', species: '', age: '', acquisition: '', formerLife: '', booksToYou: '',
    moon: '', birthDay: '', items: [],
    quirks: [], broughtItems: [], leftovers: [], floorplan: '', mooredTown: '',
  };
}

// Each page: a title, a render fn, and a validity test. Dropdown-driven; 5 pages.
const PAGES = [
  { label: 'The bookseller', render: pageIdentity, valid: (d) => d.name && d.species && d.age && d.moon && d.birthDay },
  { label: 'Your past', render: pagePast, valid: (d) => d.acquisition && d.formerLife && d.booksToYou },
  { label: 'Signature items', render: pageItems, valid: (d) => d.items.length === 3 },
  { label: 'The shop', render: pageShop, valid: (d) => d.quirks.length === 2 && d.broughtItems.length === 3 && d.leftovers.length === 3 && d.mooredTown },
  { label: 'Review', render: stepReview, valid: () => true },
];

export function renderCreate(root) {
  if (!draft) {
    draft = fresh(); step = 0;
    const pool = Store.get().legacy;
    if (pool && pool.length === 3) { draft.leftovers = [...pool]; draft._inherited = true; }
  }
  const wrap = el('div', {});
  const pct = Math.round((step / (PAGES.length - 1)) * 100);
  root.append(
    el('div', { class: 'wizard-head' }, [
      el('h1', { text: 'Create your bookseller' }),
      el('p', { class: 'lede', text: `Step ${step + 1} of ${PAGES.length} — ${PAGES[step].label}` }),
      el('div', { class: 'wizard-progress', role: 'progressbar', 'aria-valuenow': String(pct), 'aria-valuemin': '0', 'aria-valuemax': '100' }, [
        el('span', { class: 'wizard-progress__fill', style: `width:${pct}%` }),
      ]),
      el('div', { class: 'pill-row', style: 'margin:12px 0 14px' }, [
        el('button', { class: 'btn btn--ghost btn--sm', text: '🎲 Surprise me', onClick: () => { surprise(); go('create'); } }),
      ]),
    ]),
    wrap,
  );
  PAGES[step].render(wrap);
  root.append(navBar());
}

// ---- shared field builders (dropdown-driven) ----
const optVal = (o) => (typeof o === 'string' ? o : o.value);
const optLabel = (o) => (typeof o === 'string' ? o : o.label);

// A single-choice <select>. Plain selects re-gate Next without a full re-render (no scroll jump).
function selectField(title, options, key, hint) {
  const box = el('div', { class: 'field wiz-card' }, [el('label', { text: title })]);
  const opts = [el('option', { value: '', text: '— choose —', selected: !draft[key] })];
  for (const o of options) opts.push(el('option', { value: optVal(o), text: optLabel(o), selected: optVal(o) === draft[key] }));
  const sel = el('select', { 'aria-label': title }, opts);
  sel.addEventListener('change', () => { draft[key] = sel.value; refreshNav(); });
  box.append(sel);
  if (hint) box.append(el('div', { class: 'hint', text: hint }));
  return box;
}

// A single-choice <select> with <optgroup>s. groups: [{ label, options:[{value,label}] }].
function selectGroupedField(title, groups, key, hint) {
  const box = el('div', { class: 'field wiz-card' }, [el('label', { text: title })]);
  const sel = el('select', { 'aria-label': title }, [el('option', { value: '', text: '— choose —', selected: !draft[key] })]);
  for (const g of groups) {
    const og = el('optgroup', { label: g.label });
    for (const o of g.options) og.append(el('option', { value: optVal(o), text: optLabel(o), selected: optVal(o) === draft[key] }));
    sel.append(og);
  }
  sel.addEventListener('change', () => { draft[key] = sel.value; refreshNav(); });
  box.append(sel);
  if (hint) box.append(el('div', { class: 'hint', text: hint }));
  return box;
}

// Suggestions-or-custom: a dropdown of suggestions plus a "Custom…" option revealing a text box.
function suggestField(title, key, suggestions) {
  const box = el('div', { class: 'field wiz-card' }, [el('label', { text: title })]);
  const isCustom = !!draft[key] && !suggestions.includes(draft[key]);
  const opts = [el('option', { value: '', text: '— choose —', selected: !draft[key] })];
  for (const s of suggestions) opts.push(el('option', { value: s, text: s, selected: draft[key] === s }));
  opts.push(el('option', { value: '__custom__', text: 'Custom…', selected: isCustom }));
  const sel = el('select', { 'aria-label': title }, opts);
  const text = el('input', { type: 'text', placeholder: `Your own ${title.toLowerCase()}`, style: 'margin-top:8px' });
  text.value = isCustom ? draft[key] : '';
  text.hidden = !isCustom;
  sel.addEventListener('change', () => {
    if (sel.value === '__custom__') { text.hidden = false; draft[key] = text.value || ''; text.focus(); }
    else { text.hidden = true; draft[key] = sel.value; }
    refreshNav();
  });
  text.addEventListener('input', () => { draft[key] = text.value; refreshNav(); });
  box.append(sel, text);
  return box;
}

// Pick-exactly-N via N dropdowns; each slot excludes values chosen in the other slots.
function multiSelectField(title, options, key, count, hint) {
  const chosen = draft[key];
  const box = el('div', { class: 'field wiz-card' }, [
    el('label', {}, [`${title} `, el('span', { class: `count ${chosen.length === count ? 'ok' : ''}`, text: `(${chosen.length}/${count})` })]),
  ]);
  for (let i = 0; i < count; i++) {
    const cur = chosen[i] || '';
    const others = new Set(chosen.filter((_, j) => j !== i));
    const opts = [el('option', { value: '', text: '— choose —', selected: cur === '' })];
    for (const o of options) {
      const v = optVal(o);
      if (others.has(v)) continue; // no duplicates across slots
      opts.push(el('option', { value: v, text: optLabel(o), selected: v === cur }));
    }
    const sel = el('select', { 'aria-label': `${title} ${i + 1}` }, opts);
    sel.addEventListener('change', () => { const arr = chosen.slice(); arr[i] = sel.value; draft[key] = arr.filter(Boolean); go('create'); });
    box.append(el('div', { class: 'field' }, [sel]));
  }
  if (hint) box.append(el('div', { class: 'hint', text: hint }));
  return box;
}

// ---- pages ----
function pageIdentity(root) {
  root.append(
    suggestField('Name', 'name', CREATION.names),
    suggestField('Species', 'species', CREATION.species),
    selectField('Age', CREATION.ages, 'age'),
    selectField('Birth moon', CREATION.moons.map((m) => ({ value: m.key, label: m.name })), 'moon'),
    selectField('Birthday', Array.from({ length: 20 }, (_, i) => String(i + 1)), 'birthDay'),
  );
}
function pagePast(root) {
  root.append(
    selectField('How did you come by the bookshop?', CREATION.acquisition, 'acquisition'),
    selectGroupedField('Who were you before?', [
      { label: 'Bookseller', options: CREATION.formerLifeBookseller },
      { label: 'Other path', options: CREATION.formerLifeOther },
    ], 'formerLife'),
    selectField('What are books to you?', CREATION.booksToYou, 'booksToYou'),
  );
}
function pageItems(root) {
  root.append(multiSelectField('Choose three signature items', CREATION.items, 'items', 3));
}
function pageShop(root) {
  root.append(
    multiSelectField('Choose two quirks', SHOP_SETUP.quirks, 'quirks', 2),
    multiSelectField('What do you bring to the shop? Choose three', SHOP_SETUP.broughtItems, 'broughtItems', 3),
  );
  if (draft._inherited) root.append(el('div', { class: 'hint', text: '🕯 Three leftover marks carried over from last year\'s shop — change them if you wish.' }));
  root.append(multiSelectField('What did the previous owner leave? Choose three', SHOP_SETUP.leftovers, 'leftovers', 3));
  const fp = el('div', { class: 'field wiz-card' }, [el('label', { text: 'Floorplan notes (optional)' })]);
  const ta = el('textarea', { class: 'tall-md', placeholder: 'Sketch the layout in words — where the counter, couch and shelves sit…' });
  ta.value = draft.floorplan;
  ta.addEventListener('input', () => { draft.floorplan = ta.value; });
  fp.append(autoGrow(ta));
  root.append(fp);
  root.append(selectField('Where is the shop moored to start?', TOWNS.map((t) => ({ value: t.key, label: t.name })), 'mooredTown', 'You begin here while the River thaws (travel resumes on the 5th of Bloom).'));
}
function stepReview(root) {
  const town = TOWNS.find((t) => t.key === draft.mooredTown);
  const moon = CREATION.moons.find((m) => m.key === draft.moon);
  const line = (k, v) => el('div', { class: 'row' }, [el('div', { class: 'row__text' }, [el('b', { text: k }), el('span', { text: v || '—' })])]);
  root.append(el('div', { class: 'card' }, [
    el('h2', { text: `${draft.name || 'Unnamed'}, ${draft.species || '—'}` }),
    line('Age', draft.age),
    line('Birth', moon ? `${moon.name}, day ${draft.birthDay}` : ''),
    line('Books are', draft.booksToYou),
    line('Came by the shop', draft.acquisition),
    line('Before', draft.formerLife),
    line('Signature items', draft.items.join(' · ')),
    line('Shop quirks', draft.quirks.join(' · ')),
    line('Brought', draft.broughtItems.join(' · ')),
    line('Left behind', draft.leftovers.join(' · ')),
    line('Moored at', town ? town.name : ''),
  ]));
  root.append(el('p', { class: 'small muted', text: 'You begin with 100 coins and 500 books, on the 1st of Bloom.' }));
}

// ---- validation + nav ----
function validStep() { return !!PAGES[step].valid(draft); }
function navBar() {
  const last = PAGES.length - 1;
  const bar = el('div', { class: 'wizard-nav' });
  if (step > 0) bar.append(el('button', { class: 'btn btn--ghost', text: 'Back', onClick: () => { step--; go('create'); } }));
  const next = el('button', { class: 'btn', id: 'wiz-next', text: step === last ? 'Create bookseller' : 'Next' });
  next.disabled = !validStep();
  next.addEventListener('click', () => {
    if (!validStep()) return;
    if (step < last) { step++; go('create'); }
    else finish();
  });
  bar.append(next);
  return bar;
}
function refreshNav() { const n = document.getElementById('wiz-next'); if (n) n.disabled = !validStep(); }

function surprise() {
  const inherited = draft && draft._inherited ? draft.leftovers : null; // keep carried-over marks
  draft = fresh();
  draft.name = pick(CREATION.names); draft.species = pick(CREATION.species); draft.age = pick(CREATION.ages);
  draft.acquisition = pick(CREATION.acquisition); draft.formerLife = pick(formerLifeAll).t; draft.booksToYou = pick(CREATION.booksToYou);
  draft.moon = pick(CREATION.moons).key; draft.birthDay = String(1 + Math.floor(Math.random() * 20));
  draft.items = pickN(CREATION.items, 3);
  draft.quirks = pickN(SHOP_SETUP.quirks, 2); draft.broughtItems = pickN(SHOP_SETUP.broughtItems, 3);
  draft.leftovers = inherited || pickN(SHOP_SETUP.leftovers, 3);
  if (inherited) draft._inherited = true;
  draft.mooredTown = pick(TOWNS).key;
}
function pickN(arr, n) { const a = arr.slice(); const out = []; while (out.length < n && a.length) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]); return out; }

function finish() {
  const character = {
    id: uid(),
    identity: {
      name: draft.name, species: draft.species, age: draft.age, acquisition: draft.acquisition,
      formerLife: draft.formerLife, booksToYou: draft.booksToYou, moon: draft.moon, birthDay: Number(draft.birthDay),
      items: draft.items,
    },
    shop: {
      quirks: draft.quirks, broughtItems: draft.broughtItems, leftovers: draft.leftovers,
      floorplan: draft.floorplan, mooredTown: draft.mooredTown,
      inventoryCap: 500, upgrades: { shelves: 0, recordPlayer: false }, repairs: {}, raftReinforced: false,
    },
    resources: { coins: 100, books: 500 },
    calendar: { year: 1, seasonIndex: 0, day: 1, weekName: 'Thaw' },
    legacy: draft._inherited ? ['Inherited 3 leftover marks from the previous shop'] : [],
  };
  Store.upsertCharacter(character);
  Store.update((s) => { s.legacy = []; }); // legacy pool consumed
  draft = null; step = 0;
  showToast('Welcome to the River.');
  go('home');
}
