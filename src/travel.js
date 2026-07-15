// travel.js — moving between towns: legality, distance (+1 upstream), arrival. pp64-69,155.
import { TOWNS, DISTANCES, ARRIVAL, JOURNEY_PROMPTS } from '../data-compendium.js';
import { season } from './rules.js';
import { travelRepairBlock } from './repairs.js';

const order = TOWNS.map((t) => t.key); // upstream (Thistle Down) -> downstream (Port Imes)

export function canTravel(character) {
  const { seasonIndex: si, day } = character.calendar;
  const repBlock = travelRepairBlock(character);
  if (repBlock) return { ok: false, reason: repBlock };
  if (si === 0 && day < 5) return { ok: false, reason: 'The River is still frozen — travel resumes on the 5th of Bloom.' };
  if (si === 2 && day >= 7 && day <= 17 && !character.shop.raftReinforced) return { ok: false, reason: 'Floodwaters block travel (days 7–17) without raft reinforcements.' };
  if (si === 4) {
    if (day > 9) return { ok: false, reason: 'The shop cannot be moved after the 9th of Brisk.' };
    if (!(character.shop.hasBulrushJacket && character.shop.hasIceSkates)) return { ok: false, reason: 'To travel the frozen River you need a bulrush jacket and ice skates.' };
  }
  return { ok: true };
}

export function travelDays(fromKey, toKey) {
  const i = order.indexOf(fromKey), j = order.indexOf(toKey);
  if (i < 0 || j < 0 || i === j) return 0;
  const lo = Math.min(i, j), hi = Math.max(i, j);
  let d = 0;
  for (let k = lo; k < hi; k++) { const leg = DISTANCES.find((x) => order.indexOf(x.from) === k); d += leg ? leg.days : 1; }
  return d + (j < i ? 1 : 0); // upstream adds a day
}

export const isUpstream = (fromKey, toKey) => order.indexOf(toKey) < order.indexOf(fromKey);

export function arrivalPrompt(seasonIndex, roll) {
  return ARRIVAL[season(seasonIndex).name.toLowerCase()][roll - 1];
}
export { JOURNEY_PROMPTS };
