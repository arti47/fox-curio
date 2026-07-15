// fishing.js — the fishing card mini-game (p70). Draw to a royal (bite), then reel until
// two same-colour cards land adjacent: two red = caught, two black = slipped away.
import { drawCard, isRed, isRoyal } from './core.js';
import { season } from './rules.js';
import { FISH } from '../data-compendium.js';

export function runFishing(seasonIndex) {
  const cards = [];
  let hours = 0, guard = 0;
  // wait for a bite (royal). Each non-royal card = an hour passing.
  let bit = false;
  while (!bit && guard++ < 60) {
    const c = drawCard(); cards.push(c);
    if (isRoyal(c.rank)) bit = true; else hours++;
  }
  // reel in: stop when two same-colour cards are adjacent
  let result = null;
  while (!result && guard++ < 120) {
    const prev = cards[cards.length - 1];
    const c = drawCard(); cards.push(c);
    if (isRed(c.suit) === isRed(prev.suit)) result = isRed(c.suit) ? 'caught' : 'slipped';
  }
  const key = season(seasonIndex).name.toLowerCase();
  return { cards, hours, result: result || 'slipped', fishOptions: FISH.filter((f) => f.seasons.includes(key)) };
}
