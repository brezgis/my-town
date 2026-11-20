// Fitting out the shops. Each shop is one file here: a function (kit, lot, town) called once at
// start-up, which adds everything through the kit (see README.md in this folder).
import { makeKit } from '../kit.js';
import coffee from './coffee.js';
import records from './records.js';
import grocery from './grocery.js';
import books from './books.js';
import plants from './plants.js';
import apothecary from './apothecary.js';
import bakery from './bakery.js';
import yoga from './yoga.js';
import museum from './museum.js';
import rooftop from './rooftop.js';
import noodles from './noodles.js';
import bikes from './bikes.js';
import { furnishChapel } from '../chapel.js';

const SHOPS = { coffee, records, grocery, books, plants, apothecary, bakery, yoga, museum, noodles, bikes };
export function furnish(B, town = {}) { const items = furnishStart(B, town); for (const _ of furnishSteps(items.kit, town)); return items; }
// The same in two parts, for when the shops are fitted out after the street is on the screen (main.js): the kit and
// its lists first (the lists are the kit's own, so what a shop adds later is in them), then a shop at a time.
export function furnishStart(B, town = {}) {
  const kit = makeKit(B);
  kit.house = town; kit.town = town; kit.spots = []; kit.clerks = []; kit.eats = []; kit.later = [];      // later: functions (ctx) run once the scene exists
  const { lamps, seats, candles, models, extras, books, steam } = kit;
  return { kit, lamps, seats, candles, models, extras, books, steam, hinged: kit.hinged, spots: kit.spots, clerks: kit.clerks, eats: kit.eats, later: kit.later };
}
export function* furnishSteps(kit, town = {}) {
  const T = (globalThis.__furnishMs ??= {});      // (how long each took: start-up timings)
  // Each shop's run of chance (kit.rnd) starts from a number of its own. The kit's random numbers are one stream, so
  // anything added to one shop used to shift what chance had decided in every shop after it (which books lean, where
  // a plant stands). These are the numbers the shops started from when they were last looked over: nothing has moved.
  // Never change one, or that shop's small details reshuffle; a new shop takes a number from its name.
  const START = { coffee: 20261110, records: 1916439319, grocery: 1916439319, books: 1189395887, plants: 2104141183, apothecary: 1869148495, bakery: 1671790012,
    yoga: 1671790012, museum: 1671790012, noodles: 1671790012, bikes: 1671790012, rooftop: 1671790012, chapel: 1671790012 };
  const fresh = id => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 20261110) || 1;
  const step = (id, f) => { const t0 = performance.now(); kit.reseed(START[id] ?? fresh(id)); f(); T[id] = Math.round(performance.now() - t0); };
  for (const [id, shop] of Object.entries(SHOPS)) { const lot = town.lots[id]; if (lot) { step(id, () => shop(kit, lot, town)); yield id; } }
  step('rooftop', () => rooftop(kit, town.lots.plants, town)); yield 'rooftop';      // the bar on Frond's flat roof (315 Mulberry Street really has one)
  step('chapel', () => furnishChapel(kit, town)); yield 'chapel';
}
