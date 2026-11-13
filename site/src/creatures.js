// The street's animals: a small cast, each tied to one place and one time of day, so that meeting one is luck.
// None of them keeps to the main street, and no more than four kinds are about at any hour.
//
//                     by day            at dusk            at night
//   the Yard          robin (on the notice board)
//   the churchyard    tortoise (on the path; stays into the golden hour)
//   the meadow        two rabbits        a hare             fireflies
//   picture garden                       hedgehog           hedgehog, and a barn owl on a pole
//
// Every one is a member of one crew (creatures/kit.js, carried over from the garden of Anna's House): it loads
// its model only when the visitor is out of doors and near, at the right hour; thinks four times a second; moves
// only while she is near enough to see it; and is hidden otherwise. Nothing is allocated per frame.
//
//   creatures/birds.js    robin, barn owl
//   creatures/beasts.js   tortoise, rabbits, hare, hedgehog
//   creatures/swarms.js   fireflies
//
// ?creatures=0 leaves them all out (to measure what they cost); ?allcreatures loads and runs every one at once.
// No cats: Anna asked for none.

import { creatureKit } from './creatures/kit.js';
import { birds } from './creatures/birds.js';
import { beasts } from './creatures/beasts.js';
import { swarms } from './creatures/swarms.js';

export function placeCreatures(K, town) {}      // nothing is built ahead of time: every animal arrives when it is first near

export function creaturesLife(ctx, K) {
  if (new URLSearchParams(location.search).get('creatures') === '0') return;
  const kit = creatureKit(ctx, K);
  for (const f of [birds, beasts, swarms]) { try { f(kit); } catch (e) { console.warn('creatures', f.name, e); } }
}
