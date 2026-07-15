// compendium.js — searchable reference over the data libraries (Phase 5). Pure; no UI.
// Normalizes every browsable record into { title, subtitle, body, lines[] } and groups
// them into categories, with a flat search across all text.
import { SUIT_SYMBOL } from './core.js';
import { CUSTOMERS, BOOK_GENRES } from '../data.js';
import {
  TOWNS, RECIPES, FISH, ANIMALS, PLANTS, TRADES, OCCUPATIONS, ASTROLOGY, ITEMS, POST_OFFICES,
} from '../data-compendium.js';

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function customerEntries() {
  const out = [];
  for (const suit of ['hearts', 'spades', 'clubs', 'diamonds']) {
    for (const c of (CUSTOMERS[suit] || [])) {
      out.push({
        title: `${SUIT_SYMBOL[suit]} ${c.rank}`,
        subtitle: suit[0].toUpperCase() + suit.slice(1),
        body: c.text,
        lines: c.deepen ? [`If befriended: ${c.deepen}`] : [],
      });
    }
  }
  return out.sort((a, b) => 0); // keep suit/rank order as built
}

function townEntries() {
  return TOWNS.map((t) => {
    const lines = [];
    if (t.notable) lines.push(`Notable: ${t.notable.join(', ')}.`);
    if (t.seasonal) lines.push(t.seasonal);
    if (t.characters) lines.push('People: ' + t.characters.map((p) => `${p.name} (${p.species}, ${p.pronouns})`).join('; ') + '.');
    if (t.shops) lines.push('Shops: ' + t.shops.map((sh) => sh.name).join(', ') + '.');
    if (t.specialBooks) lines.push('Special books: ' + t.specialBooks.map((b) => `${b.title} (${b.price}c)`).join('; ') + '.');
    const po = POST_OFFICES[t.key];
    if (po) lines.push('Post office: ' + Object.keys(po).map((k) => k).join(', ') + '.');
    return { title: t.name, subtitle: `${t.course} course`, body: t.blurb, lines };
  });
}

const simple = (arr, sub) => arr.map((x) => ({ title: x.name, subtitle: sub, body: x.text || x.prompt || '', lines: [] }));

function recipeEntries() {
  return RECIPES.map((r) => ({ title: r.name, subtitle: 'Recipe', body: r.reveals, lines: [`Ingredients: ${r.ingredients.join(', ')}.`] }));
}
function fishEntries() {
  return FISH.map((f) => ({ title: f.name, subtitle: `Fish · ${f.seasons.join('/')}`, body: f.prompt, lines: [] }));
}
function tradeEntries() {
  return TRADES.map((t) => ({ title: t.name, subtitle: `${t.perDay}c/day`, body: t.fixes, lines: [] }));
}
function itemEntries() {
  return ITEMS.map((i) => ({ title: i.name, subtitle: 'Item', body: i.note || '', lines: i.sold ? ['Sold at: ' + i.sold.map((s) => `${s.town} (${s.price}c)`).join(', ') + '.'] : [] }));
}

export const COMPENDIUM = [
  { key: 'customers', label: 'Customers', entries: customerEntries() },
  { key: 'towns', label: 'Towns', entries: townEntries() },
  { key: 'recipes', label: 'Recipes', entries: recipeEntries() },
  { key: 'fish', label: 'Fish', entries: fishEntries() },
  { key: 'animals', label: 'Animals', entries: simple(ANIMALS, 'Animal') },
  { key: 'plants', label: 'Plants', entries: simple(PLANTS, 'Plant') },
  { key: 'trades', label: 'Trades', entries: tradeEntries() },
  { key: 'occupations', label: 'Occupations', entries: simple(OCCUPATIONS, 'Occupation') },
  { key: 'moons', label: 'Moons', entries: ASTROLOGY.map((m) => ({ title: m.name, subtitle: 'Moon', body: m.text, lines: [] })) },
  { key: 'genres', label: 'Book genres', entries: BOOK_GENRES.map((g, i) => ({ title: g, subtitle: `d20 → ${i + 1}`, body: '', lines: [] })) },
  { key: 'items', label: 'Items', entries: itemEntries() },
];

const hay = (e) => `${e.title} ${e.subtitle} ${e.body} ${e.lines.join(' ')}`.toLowerCase();

// Flat search across all categories (optionally scoped). Returns [{cat, entry}].
export function searchCompendium(query, catKey = 'all') {
  const q = query.trim().toLowerCase();
  const cats = catKey === 'all' ? COMPENDIUM : COMPENDIUM.filter((c) => c.key === catKey);
  const out = [];
  for (const cat of cats) for (const entry of cat.entries) {
    if (!q || hay(entry).includes(q)) out.push({ cat: cat.label, entry });
  }
  return out;
}

export const compendiumCounts = () => COMPENDIUM.reduce((n, c) => n + c.entries.length, 0);

// Per-category hits for the accordion view. Returns every category with its filtered entries.
export function groupedHits(query = '') {
  const q = query.trim().toLowerCase();
  return COMPENDIUM.map((cat) => ({
    key: cat.key, label: cat.label,
    entries: q ? cat.entries.filter((e) => hay(e).includes(q)) : cat.entries,
  }));
}
