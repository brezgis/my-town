// The street's animals. Every one is a member of one crew (creatures/kit.js, carried over from the
// garden of Anna's House): it loads its model only when the visitor is out of doors and near, at the
// right hour; thinks four times a second; moves only while she is near enough to see it; and is
// hidden otherwise. Swarms are one instanced draw each; nothing is allocated per frame.
//
//   creatures/birds.js    sparrows (and their crumbs), the roost on the wire, blackbird, robin, owl, swallows, bats
//   creatures/beasts.js   squirrel, hedgehog, rabbits, hare, fox, tortoise, mouse
//   creatures/swarms.js   butterflies, moths, fireflies
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
