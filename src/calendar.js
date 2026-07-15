// calendar.js — season/week/day model + lifecycle boundary logic (Phase 2).
import { season } from './rules.js';
import { META } from '../data.js';

export function weekNameFor(seasonIndex, day) {
  const wk = Math.min(3, Math.floor((day - 1) / 5));
  return season(seasonIndex).weeks[wk];
}

// Pure: given a calendar, return the next day's calendar + which boundaries were crossed.
export function nextCalendar(cal) {
  let { year, seasonIndex, day } = cal;
  const events = [];
  day += 1;
  if (day > META.seasonLength) {
    day = 1; seasonIndex += 1; events.push('season');
    if (seasonIndex > 4) { seasonIndex = 0; year += 1; events.push('year'); }
  }
  return { year, seasonIndex, day, weekName: weekNameFor(seasonIndex, day), events };
}

// Year rollover: capture this shop's 3 leftover marks into the save-level legacy pool
// (a new bookseller inherits them), record the year on the character, and seed an
// end-of-year reflection journal entry. CLAUDE.md §2.12/§2.15. Mutates save + ch.
export function onYearRollover(save, ch, newYear) {
  save.legacy = (ch.shop.leftovers || []).slice(0, 3);
  ch.legacy = ch.legacy || [];
  ch.legacy.push(`Completed Year ${newYear - 1}`);
  ch.journal = ch.journal || [];
  ch.journal.push({
    id: 'j' + Date.now(), year: newYear - 1, seasonIndex: 4, day: 20,
    title: `End of Year ${newYear - 1}`,
    body: 'A whole year on the River is behind you. What changed in you? What will you carry forward?\n\n',
    ts: Date.now(),
  });
}

// Human summary of what ending the day will do (for the confirm dialog).
export function endDaySummary(cal) {
  const nxt = nextCalendar(cal);
  const parts = [`Advance to ${season(nxt.seasonIndex).name} day ${nxt.day} (${nxt.weekName}).`];
  if (nxt.events.includes('season')) parts.push(`New season: ${season(nxt.seasonIndex).name} — its tables take over and the weather-event counter resets.`);
  if (nxt.events.includes('year')) parts.push(`A new year (Year ${nxt.year}) begins.`);
  return { next: nxt, lines: parts };
}
