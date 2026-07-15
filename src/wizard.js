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

// Each page: a title, a render fn, and a validity test. Logical small groups (one screen each).
const PAGES = [
  { label: 'Name', render: pageName, valid: (d) => d.name && d.species },
  { label: 'Birth', render: pageBirth, valid: (d) => d.age && d.moon && d.birthDay },
  { label: 'Your past', render: pagePast, valid: (d) => d.acquisition && d.formerLife && d.booksToYou },
  { label: 'Signature items', render: pageItems, valid: (d) => d.items.length === 3 },
  { label: 'Shop quirks', render: pageQuirks, valid: (d) => d.quirks.length === 2 },
  { label: 'What you bring', render: pageBrought, valid: (d) => d.broughtItems.length === 3 },
  { label: 'Left behind', render: pageLeftovers, valid: (d) => d.leftovers.length === 3 },
  { label: 'Floorplan & mooring', render: pageShopFinish, valid: (d) => d.mooredTown },
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

// ---- shared field builders ----
function chip(label, selected, onClick) {
  return el('button', { class: `chip chip-btn ${selected ? 'is-sel' : ''}`, 'aria-pressed': selected ? 'true' : 'false', text: label, onClick });
}
function singleField(title, options, key, hint) {
  const box = el('div', { class: 'field' }, [el('label', { text: title })]);
  const row = el('div', { class: 'pill-row' });
  for (const opt of options) {
    const val = typeof opt === 'string' ? opt : opt.value;
    const label = typeof opt === 'string' ? opt : opt.label;
    row.append(chip(label, draft[key] === val, () => { draft[key] = val; go('create'); }));
  }
  box.append(row);
  if (hint) box.append(el('div', { class: 'hint', text: hint }));
  return box;
}
function multiField(title, options, key, count) {
  const chosen = draft[key];
  const box = el('div', { class: 'field' }, [
    el('label', {}, [`${title} `, el('span', { class: `count ${chosen.length === count ? 'ok' : ''}`, text: `(${chosen.length}/${count})` })]),
  ]);
  const row = el('div', { class: 'pill-row' });
  for (const opt of options) {
    const sel = chosen.includes(opt);
    row.append(chip(opt, sel, () => {
      if (sel) draft[key] = chosen.filter((x) => x !== opt);
      else if (chosen.length < count) draft[key] = [...chosen, opt];
      else { showToast(`Choose exactly ${count}.`); return; }
      go('create');
    }));
  }
  box.append(row);
  return box;
}
function textField(title, key, { placeholder = '', suggestions = null, multiline = false, taClass = '' } = {}) {
  const box = el('div', { class: 'field' }, [el('label', { text: title })]);
  const input = multiline ? el('textarea', { placeholder, class: taClass }) : el('input', { type: 'text', placeholder });
  input.value = draft[key];
  input.addEventListener('input', () => { draft[key] = input.value; refreshNav(); });
  box.append(input);
  if (multiline) autoGrow(input);
  if (suggestions) {
    const row = el('div', { class: 'pill-row', style: 'margin-top:8px' });
    for (const s of suggestions) row.append(chip(s, draft[key] === s, () => { draft[key] = s; go('create'); }));
    box.append(row);
  }
  return box;
}

// ---- pages (logical small groups) ----
function pageName(root) {
  root.append(
    textField('Name', 'name', { placeholder: 'Choose or type your own', suggestions: CREATION.names }),
    textField('Species', 'species', { placeholder: 'Choose or type your own', suggestions: CREATION.species }),
  );
}
function pageBirth(root) {
  root.append(
    singleField('Age', CREATION.ages, 'age'),
    singleField('Birth moon', CREATION.moons.map((m) => ({ value: m.key, label: m.name })), 'moon'),
    numberField('Birthday (1–20)', 'birthDay'),
  );
}
function pagePast(root) {
  root.append(
    singleField('How did you come by the bookshop?', CREATION.acquisition.map((t) => ({ value: t, label: t })), 'acquisition'),
    singleField('Who were you before?', formerLifeAll.map((f) => ({ value: f.t, label: f.t })), 'formerLife'),
    singleField('What are books to you?', CREATION.booksToYou.map((t) => ({ value: t, label: t })), 'booksToYou'),
  );
}
function pageItems(root) {
  root.append(multiField('Choose three signature items', CREATION.items, 'items', 3));
}
function numberField(title, key) {
  const box = el('div', { class: 'field' }, [el('label', { text: title })]);
  const input = el('input', { type: 'number', min: '1', max: '20', inputmode: 'numeric' });
  input.value = draft[key];
  input.addEventListener('input', () => {
    let v = parseInt(input.value, 10);
    draft[key] = Number.isFinite(v) ? String(Math.max(1, Math.min(20, v))) : '';
    refreshNav();
  });
  box.append(input);
  return box;
}
function pageQuirks(root) {
  root.append(multiField('Choose two quirks', SHOP_SETUP.quirks, 'quirks', 2));
}
function pageBrought(root) {
  root.append(multiField('What do you bring to the shop? Choose three', SHOP_SETUP.broughtItems, 'broughtItems', 3));
}
function pageLeftovers(root) {
  if (draft._inherited) root.append(el('div', { class: 'hint', text: '🕯 Three leftover marks carried over from last year\'s shop — change them if you wish.' }));
  root.append(multiField('What did the previous owner leave? Choose three', SHOP_SETUP.leftovers, 'leftovers', 3));
}
function pageShopFinish(root) {
  root.append(textField('Floorplan notes (optional)', 'floorplan', { placeholder: 'Sketch the layout in words — where the counter, couch and shelves sit…', multiline: true, taClass: 'tall-md' }));
  root.append(singleField('Where is the shop moored to start?', TOWNS.map((t) => ({ value: t.key, label: t.name })), 'mooredTown', 'You begin here while the River thaws (travel resumes on the 5th of Bloom).'));
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
