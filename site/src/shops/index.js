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
export function furnish(B, town = {}) {
  const kit = makeKit(B);
  kit.house = town; kit.town = town; kit.spots = []; kit.clerks = []; kit.eats = []; kit.later = [];      // later: functions (ctx) run once the scene exists
  for (const [id, shop] of Object.entries(SHOPS)) { const lot = town.lots[id]; if (lot) shop(kit, lot, town); }
  rooftop(kit, town.lots.grocery, town);      // the bar on the grocer's roof
  furnishChapel(kit, town);
  const { lamps, seats, candles, models, extras, books, steam } = kit;
  return { kit, lamps, seats, candles, models, extras, books, steam, hinged: kit.hinged, spots: kit.spots, clerks: kit.clerks, eats: kit.eats, later: kit.later };
}
