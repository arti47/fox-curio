// rules.js — pure lookups over the data libraries. No UI, no state.
import {
  META, SEASONS, CUSTOMERS, BOOK_GENRES, EXTRA_CUSTOMERS, CUSTOMER_WEIGHT, HOLIDAYS, CREATION,
} from '../data.js';
import { TOWNS, RECIPES, FISH, TRADES } from '../data-compendium.js';
import { isRoyal } from './core.js';

export const seasonKey = (i) => META.seasons[((i % 5) + 5) % 5];
export const season = (i) => SEASONS[seasonKey(i)];

// Customer prompt by drawn card.
export function customerByCard(suit, rank) {
  return (CUSTOMERS[suit] || []).find((c) => c.rank === rank) || null;
}

// Book genre by d20 (1-20).
export const genreByRoll = (n) => BOOK_GENRES[Math.max(1, Math.min(20, n)) - 1];

// Weather row by card rank for a season index.
export function weatherByRank(seasonIndex, rank) {
  return season(seasonIndex).weather.find((w) => w.rank === rank) || null;
}

// Daily task by d20 for a season index.
export function taskByRoll(seasonIndex, n) {
  return season(seasonIndex).tasks.find((t) => t.id === n) || null;
}

// Extra customers by d20.
export function extraCustomersByRoll(n) {
  return EXTRA_CUSTOMERS.find((r) => n >= r.min && n <= r.max) || EXTRA_CUSTOMERS[0];
}

// End-of-day tally from the flipped customer cards (+10 normal, +20 royalty). p39.
export function totalCustomers(cards) {
  return cards.reduce((sum, c) => sum + (isRoyal(c.rank) ? CUSTOMER_WEIGHT.royalty : CUSTOMER_WEIGHT.normal), 0);
}

// Earnings: single d6 -> season table. Books sold: d6 -> table, then + a second d6 (p40/83).
export const earningsFor = (seasonIndex, roll) => season(seasonIndex).earnings[roll - 1];
export const booksSoldFor = (seasonIndex, roll, secondRoll) => season(seasonIndex).booksSold[roll - 1] + secondRoll;

// Holidays landing on a given season/day.
export function holidayOn(seasonIndex, day) {
  const key = seasonKey(seasonIndex);
  const entry = Object.entries(HOLIDAYS).find(([, h]) => h.season === key && (h.days ? h.days.includes(day) : h.day === day));
  return entry ? { key: entry[0], ...entry[1] } : null;
}

// Effective book capacity given shelf upgrades.
export function bookCap(character) {
  const shelves = character?.shop?.upgrades?.shelves || 0;
  return Math.min(META.maxBookCap, META.baseBookCap + shelves * 100);
}

// Data integrity summary — used by the Home self-check to prove the library loaded.
export function dataStats() {
  const customerCount = Object.values(CUSTOMERS).reduce((n, arr) => n + arr.length, 0);
  return {
    customers: customerCount,
    genres: BOOK_GENRES.length,
    seasons: META.seasons.length,
    holidays: Object.keys(HOLIDAYS).length,
    towns: TOWNS.length,
    recipes: RECIPES.length,
    fish: FISH.length,
    trades: TRADES.length,
    creationNames: CREATION.names.length,
  };
}
