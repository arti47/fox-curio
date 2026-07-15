// engine.js — the bookselling day engine (Phase 3). Guided flow: weather (by card rank) →
// forecast → daily task → customer flips (+genre) → end-of-day tally → apply + advance.
import { el, drawCard, d6, d20, clamp, isRoyal, SUIT_SYMBOL } from './core.js';
import { Store } from './store.js';
import {
  season, weatherByRank, taskByRoll, genreByRoll, customerByCard, extraCustomersByRoll,
  totalCustomers, earningsFor, booksSoldFor, bookCap, holidayOn,
} from './rules.js';
import { TOWNS } from '../data-compendium.js';
import { nextCalendar, onYearRollover } from './calendar.js';
import { repairCardPenalty, triggerRepair, tickRepairs } from './repairs.js';
import { tickMail } from './mail.js';
import { showToast, actionToast } from './ui.js';
import { go } from './router.js';

const RAINY = /rain|storm|shower|drizzle|sleet|hail/i;

let session = null; // in-memory day session

export const hasSession = () => !!session;
export function abandonSession() { session = null; }

// ---- start ----
export function startDay(character) {
  const si = character.calendar.seasonIndex;
  const s = season(si);
  const c1 = drawCard(), c2 = drawCard();
  const w1 = weatherByRank(si, c1.rank);       // morning weather + forecast
  const durRow = weatherByRank(si, c2.rank);   // duration read from 2nd card's row
  const sess = {
    phase: 'weather', si, day: character.calendar.day,
    c1, c2, morning: w1, duration: durRow.duration, afternoon: null, c3: null,
    trigger: s.weatherEvent.trigger, eventFired: false,
    baseCards: w1.cards, extraTaskCards: 0, flips: [], task: null, taskRoll: null,
    extraRoll: null, extraDraw: 0, totals: null, closedEarly: false, holiday: holidayOn(si, character.calendar.day),
  };
  if (sess.duration !== 'all day' && w1.cards > 0) { sess.c3 = drawCard(); sess.afternoon = weatherByRank(si, sess.c3.rank); }
  // weather-event counter (matches this season's trigger word)
  const matched = w1.weather.toLowerCase().includes(sess.trigger.toLowerCase());
  const cur = character.weatherEvent && character.weatherEvent.season === si ? character.weatherEvent.count : 0;
  sess.counterBefore = cur;
  sess.counterAfter = matched ? (cur + 1 >= 3 ? 0 : cur + 1) : cur;
  sess.eventFired = matched && cur + 1 >= 3;
  session = sess;
  return sess;
}

// ---- customer flips ----
export function flipCustomer() {
  const card = drawCard();
  const customer = customerByCard(card.suit, card.rank);
  const genre = genreByRoll(d20());
  session.flips.push({ card, customer, genre });
  return session.flips[session.flips.length - 1];
}

export function rollTask(character) {
  session.taskRoll = d20();
  session.task = taskByRoll(session.si, session.taskRoll);
  const eff = session.task.effect || {};
  // A repair-triggering task persists a broken state; its card penalty then flows
  // through repairCardPenalty (below) every day until fixed, including today.
  if (eff.repair) triggerRepair(eff, session.day);
  let mod = 0;
  if (eff.bonusCardsToday) mod += eff.bonusCardsToday;
  if (!eff.repair && eff.cards) mod += eff.cards; // one-day, non-repair card delta
  if (character.shop.upgrades && character.shop.upgrades.recordPlayer) mod += 1; // Record player
  mod += arboreaMarketBonus(character);
  const rainy = RAINY.test(session.morning.weather);
  mod += repairCardPenalty(character, rainy); // standing repairs (incl. one just triggered)
  session.extraTaskCards = mod;
  session.phase = 'customers';
  return session.task;
}
function arboreaMarketBonus(character) {
  const town = TOWNS.find((t) => t.key === character.shop.mooredTown);
  const m = town && town.marketBonus;
  if (!m) return 0;
  return m.seasons.includes(season(session.si).name.toLowerCase()) && m.days.includes(session.day) ? m.bonusCards : 0;
}

export function targetCardCount() {
  if (session.holiday) return 1; // skipping a holiday to open = snail's pace (1), p34
  return Math.max(0, session.baseCards + session.extraTaskCards);
}

// ---- end of day ----
export function rollExtra() {
  session.extraRoll = d20();
  const row = extraCustomersByRoll(session.extraRoll);
  session.extraDraw = row.draw;
  for (let i = 0; i < row.draw; i++) flipCustomer();
  session.phase = 'closing';
}

export function tally(character, { closeEarly = false } = {}) {
  session.closedEarly = closeEarly;
  let customers = totalCustomers(session.flips.map((f) => f.card));
  let earnings = earningsFor(session.si, d6());
  let sold = booksSoldFor(session.si, d6(), d6());
  const halve = session.task && session.task.effect && session.task.effect.halve;
  if (halve || closeEarly) { customers = Math.round(customers / 2); earnings = Math.round(earnings / 2); sold = Math.round(sold / 2); }
  const cap = bookCap(character);
  const soldActual = Math.min(sold, character.resources.books);
  session.totals = { customers, earnings, booksSold: soldActual, halved: !!(halve || closeEarly) };
  session.phase = 'tally';
  return session.totals;
}

// ---- finish: apply + advance + log ----
export function finishDay() {
  const t = session.totals;
  const nxt = nextCalendar(session.__cal || Store.activeCharacter().calendar);
  Store.markUndo('day');
  let repairLog = [];
  Store.update((save) => {
    const ch = save.characters[save.activeCharacterId];
    const cap = bookCap(ch);
    ch.resources.coins += t.earnings;
    ch.resources.books = clamp(ch.resources.books - t.booksSold, 0, cap);
    repairLog = tickRepairs(ch, 1).concat(tickMail(ch, 1)); // repairs + mail replies
    const seasonChanged = nxt.seasonIndex !== ch.calendar.seasonIndex;
    ch.calendar = { year: nxt.year, seasonIndex: nxt.seasonIndex, day: nxt.day, weekName: nxt.weekName };
    if (nxt.events && nxt.events.includes('year')) onYearRollover(save, ch, nxt.year);
    ch.weatherEvent = seasonChanged ? { season: nxt.seasonIndex, count: 0 } : { season: session.si, count: session.counterAfter };
    ch.log.push({
      ts: Date.now(), day: session.day, seasonIndex: session.si,
      weather: session.morning.weather, forecast: session.morning.forecast,
      taskRoll: session.taskRoll, task: session.task ? session.task.text : null,
      cards: session.flips.map((f) => ({ suit: f.card.suit, rank: f.card.rank, genre: f.genre })),
      extraRoll: session.extraRoll, totals: t,
    });
    ch.log = ch.log.slice(-100);
  });
  if (repairLog.length) showToast(repairLog.join(' '));
  session = null;
}

export const currentSession = () => session;
export { SUIT_SYMBOL };
