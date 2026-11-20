// Slow Hand Coffee  (north side; 301 Mulberry Street, Madison, Indiana: 23 ft wide by 42.7 deep inside)
// The front shop and the back room of an 1830s brick row building, fitted out as a coffee house.
//   The shop (d 0 to 27): the bar down the left side under three green enamel lamps: the copper lever
//   machine, the grinder, the pastry case, a brass till; behind it one shelf of cups and the slate menu.
//   Down the right wall a green boarded dado, a leather banquette with three marble tables and three
//   still lifes above them. In the windows: a table for two and the shelf of beans (left), the window
//   bar (right).
//   The snug (d 27.7 to 42.7), through a wide cased opening: a chimney breast on the left wall with the
//   wood stove and, over it, the shop's clock, which has one hand; a sofa and two armchairs on a rug; a
//   wall of books with its ladder on the right; the back window and the yard door.
// Readable things, four in all: the menu slate, the tip jar card, the bags of beans, the board on the
// pavement. The one thing to walk up to: the clock over the stove (it keeps the real hour).
import { tools, fixtures } from '../shopkit.js';
import { arch } from './arch.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, grain, rrect, disc, line, ICON } from '../draw.js';

const OAK = 'oak_light#a3825c', WALNUT = 'fir#7d5b45', GREEN = 'painted_wood#4d6f60', CREAM = 'painted_wood#e6dcc6', COPPER = 'c#b06a3c/0.32/1', CHROME = 'c#d4d6d8/0.12/1', PORC = 'c#ebe6dc/0.18', BLACK = 'c#17140f/0.3';
const TRIM = 'painted_wood#efe8d8', IRON = 'c#2b2724/0.45/1', HIDE = 'leather#d2a070', BLIND = 'linen#efe6d2', STONE = 'c#5a5a56/0.8';

const MENU = (g, w, h) => {
  slate(g, w, h, '#232826', 7);
  chalk(g, 'Slow Hand', w * 0.5, h * 0.11, h * 0.13, '#f1efe6'); line(g, [[w * 0.36, h * 0.19], [w * 0.64, h * 0.19]], '#e9c46a', 3);
  const col = (x, title, rows, c) => { chalk(g, title, x, h * 0.3, h * 0.085, c, { a: 'left' }); rows.forEach(([n, p], i) => { chalk(g, n, x, h * (0.42 + i * 0.105), h * 0.068, '#efe9da', { a: 'left' }); chalk(g, p, x + w * 0.27, h * (0.42 + i * 0.105), h * 0.068, '#efe9da', { a: 'right' }); }); };
  col(w * 0.04, 'espresso', [['espresso', '3'], ['cortado', '4'], ['flat white', '4½'], ['oat latte', '5'], ['cardamom latte', '5½']], '#e9c46a');
  col(w * 0.365, 'slow', [['pour-over', '5'], ['cà phê sữa đá', '5'], ['cold brew', '4½'], ['hot chocolate', '4'], ['mint tea', '3']], '#e8a8a0');
  col(w * 0.69, 'to eat', [['croissant', '4'], ['cardamom bun', '4½'], ['jam tart', '3½'], ['carrot cake', '5'], ['toast & good butter', '4']], '#9fc6b0');
  chalk(g, 'robots drink free (they do not drink)', w * 0.5, h * 0.94, h * 0.055, '#9aa39d');
};
const TAG = (txt, c = '#f1e9d6', ink = '#2a1c13') => (g, w, h) => { paper(g, w, h, c); T(g, txt, w / 2, h / 2, h * 0.42, ink, { f: F.caveat, w: 600, max: w * 0.9 }); };
const BAG = (name, sub, c, ink = '#f1e9d6') => (g, w, h) => { fill(g, w, h, c); grain(g, w, h, 0.06); rrect(g, w * 0.1, h * 0.26, w * 0.8, h * 0.5, 6, ink); ICON.sun(g, w / 2, h * 0.4, w * 0.3, c); T(g, name, w / 2, h * 0.57, h * 0.085, c, { f: F.dm, max: w * 0.72 }); T(g, sub, w / 2, h * 0.68, h * 0.045, c, { f: F.bebas, ls: 1, max: w * 0.72 }); T(g, 'SLOW HAND', w / 2, h * 0.13, h * 0.06, ink, { f: F.bebas, ls: 2 }); T(g, '12 oz · whole bean', w / 2, h * 0.88, h * 0.045, ink, { f: F.fraunces, it: 1 }); };
// The dial of a one-handed clock, as clocks were before the minute hand: the hours, and between them the quarters.
const DIAL = (g, w, h) => {
  const c = w / 2, r = w / 2;
  disc(g, c, c, r, '#efe6d2'); disc(g, c, c, r * 0.97, null, '#2a221c', w * 0.012); disc(g, c, c, r * 0.7, null, '#2a221c', w * 0.006);
  for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, hr = i % 4 === 0, half = i % 2 === 0, r0 = r * (hr ? 0.6 : half ? 0.64 : 0.67), p = k => [c + Math.sin(a) * r * k, c - Math.cos(a) * r * k]; line(g, [p(r0 / r), p(0.7)], '#2a221c', w * (hr ? 0.012 : 0.006)); }
  for (let n = 1; n <= 12; n++) { const a = n / 12 * Math.PI * 2; T(g, String(n), c + Math.sin(a) * r * 0.83, c - Math.cos(a) * r * 0.83, w * 0.105, '#2a221c', { f: F.playfair, w: 600 }); }
  disc(g, c, c, r * 0.06, '#2a221c');
};

export default function coffee(kit, lot) {
  const K = tools(kit, 31), X = fixtures(kit, K), A = arch(kit, lot, K), { ves, hcyl, ball, tube, jar, plate, cupSaucer, potted } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                        // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D, FLOOR = lot.fr(kit, 0, 0).h;
  const rugAt = (a0, a1, d0, d1, style) => { const [X0, Y0] = lot.XY(a0, d0), [X1, Y1] = lot.XY(a1, d1); kit.rug(Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1), FLOOR, style); };

  // ---- the room: a partition two thirds back, with a wide cased opening into the snug -----------------------
  const DADO = 4.4, PD = 27.5;
  const P = A.partition(PD, { openings: [{ a0: 7.5, a1: 19.5, z1: 8.6 }] });      // P.front 27.29, P.back 27.71
  const dado = (wall, s0, s1) => A.wainscot(wall, s0, s1, { h: DADO, mat: GREEN });
  dado('right', 0.02, P.front - 0.01); dado({ d: P.front, side: 'front' }, 19.87, W - 0.21);
  A.rail('right', 0.02, P.front - 0.01);

  // ---- the bar: down the left side, customers on the right ----------------------------------------------
  const CA = 8, DC = 16.2;                                    // the counter's customer edge, and the middle of its length (d 8.2 to 24.2)
  const c = at(CA, DC, 0, 'right');                           // x runs toward the street; +y is the customers' side
  const TOP = X.counter(c, -8, 8, -2.6, 0, 3.4, { front: GREEN, top: 'marble' });
  c.box(BRASS, -8, 8, 0.18, 0.24, 0.62, 0.68);                // the foot rail
  for (const x of [-7.6, -2.5, 2.5, 7.6]) c.box(BRASS, x - 0.03, x + 0.03, 0, 0.21, 0.6, 0.66);
  // the lever machine, its working side to Juniper
  {
    const e = c.sub(3.4, -1.25, TOP);
    e.soft(CHROME, -1.15, 1.15, -0.7, 0.62, 0, 0.42, 0.06); e.box(BRASS, -1.16, 1.16, -0.71, 0.63, 0.36, 0.4);
    ves(e, COPPER, 0, 0.05, 0.4, [[0, 0], [0.52, 0], [0.52, 1.1], [0.49, 1.18], [0.44, 1.18], [0.44, 1.23], [0.4, 1.46], [0.25, 1.66], [0.1, 1.74], [0, 1.76]], 28);
    for (const z of [0.62, 1.2]) e.cyl(BRASS, 0, 0.05, z, z + 0.06, 0.535, 0.535, 28);
    ball(e, BRASS, 0, 0.05, 2.14, 0.07, 10); ball(e, BRASS, 0, 0.05, 2.24, 0.1, 10, 1.3);
    for (const s of [-1, 1]) tube(e, BRASS, [[0, 0.05, 2.36], [s * 0.16, 0.03, 2.46], [s * 0.3, 0.0, 2.66]], t => 0.05 * (1 - t) + 0.012, 6);
    for (const s of [-1, 1]) {
      const x = s * 0.78, y = -0.38;
      e.cyl(CHROME, x, y, 0.95, 1.35, 0.17, 0.2, 18); e.cyl(CHROME, x, y, 1.35, 1.72, 0.1, 0.1, 14);
      tube(e, CHROME, [[x, y, 1.7], [x, y - 0.14, 1.95], [x, y - 0.36, 2.34], [x, y - 0.5, 2.52]], 0.03, 8); ball(e, BLACK, x, y - 0.5, 2.46, 0.09, 12);
      e.cyl(CHROME, x, y, 0.8, 0.95, 0.15, 0.16, 16); tube(e, WALNUT, [[x, y - 0.14, 0.87], [x, y - 0.5, 0.86], [x, y - 0.74, 0.84]], 0.04, 8);
      ves(e, PORC, x, y, 0.16, [[0, 0], [0.06, 0], [0.09, 0.06], [0.09, 0.18], [0.085, 0.18], [0, 0.05]], 14);
    }
    tube(e, CHROME, [[0.5, 0.0, 1.3], [0.92, -0.2, 1.25], [1.08, -0.45, 1.1], [1.08, -0.5, 0.55]], 0.025, 6);
    for (let i = 0; i < 3; i++) ves(e, PORC, -0.42 + i * 0.42, 0.42, 0.42, [[0, 0], [0.07, 0], [0.12, 0.08], [0.13, 0.2], [0.12, 0.2], [0.1, 0.06], [0, 0.04]], 12);
    const [sx, sz] = kit.world(e, 0.78, -0.38); kit.steam.push({ x: sx, y: lot.fr(kit, 0, 0).h + TOP + 0.5, z: sz });
    lot.machine = kit.world(e, 0, -1.6);
  }
  // grinder and one milk jug
  { const x = 5.4, y = -1.3, z = TOP;
    c.soft('c#2a2622/0.35', x - 0.27, x + 0.27, y - 0.32, y + 0.32, z, z + 1.05, 0.08); ves(c, 'glass', x, y, z + 1.03, [[0.08, 0], [0.24, 0.45], [0.25, 0.5], [0, 0.5]], 18); ves(c, 'c#3a2214/0.9', x, y, z + 1.07, [[0.08, 0], [0.2, 0.3], [0, 0.32]], 14); c.cyl(BLACK, x, y, z + 1.55, z + 1.6, 0.25, 0.25, 18);
    for (const [dx, s] of [[-0.8, 1]]) ves(c, 'c#c9ccd0/0.2/1', 1.6 + dx, -2.0, z, [[0, 0], [0.13 * s, 0], [0.14 * s, 0.25 * s], [0.12 * s, 0.4 * s], [0, 0.4 * s]], 14); }
  // the pastry case
  X.glassCase(c, -6.9, -2.7, -1.5, -0.25, TOP, 1.0);
  { const z = TOP + 0.03;
    for (let i = 0; i < 4; i++) { plate(c, -6.3 + i * 0.95, -0.9, z, 0.36); }
    for (const [x, t] of [[-6.4, 0.3], [-6.2, 1.9]]) kit.model('croissant', c, x, -0.9, z + 0.05, 0, { turn: t });
    for (const [x, y] of [[-5.45, -1.0], [-5.25, -0.8]]) kit.model('st_pastry_1', c, x, y, z + 0.05, 0, { turn: x * 3 });
    for (const [x, y] of [[-4.5, -0.95], [-4.3, -0.8]]) kit.model('st_jam_tart', c, x, y, z + 0.05);
    kit.model('carrot_cake', c, -3.45, -0.9, z + 0.05);
    { const eat = (x, y, zz, name, model, note) => { const [wx_, wz_] = kit.world(c, x, y); kit.eats.push({ x: wx_, y: c.h + zz + 0.1, z: wz_, name, model, note, reach: 7 }); };
      eat(-6.3, -0.9, z, 'croissant', 'croissant', 'You finish the croissant. There are flakes everywhere, as is right.'); eat(-5.35, -0.85, z, 'hand pie', 'st_pastry_1', 'You finish the hand pie. Still warm in the middle.'); eat(-4.4, -0.85, z, 'jam tart', 'st_jam_tart', 'You finish the jam tart. Raspberry, and proud of it.'); }
  }
  // a tall stool tucked in behind the bar, where the counter is clear: Juniper's own, for a sit between customers
  X.stool(c, -4.7, -3.05, 2.5, { mat: 'oak_light#9a8068', label: 'perch behind the bar' }); kit.seats[kit.seats.length - 1].staff = true;
  // the till: brass; and the tip jar
  { const x = -0.8, y = -1.1, z = TOP;
    X.till(c, x, y, z);
    jar(c, 0.5, -0.5, z - 0.02, 0.16, 0.42, null, 0, null); for (let i = 0; i < 7; i++) c.cyl('c#b08d4a/0.35/1', 0.5 + (i % 3 - 1) * 0.05, -0.5 + (i % 2) * 0.05, z + 0.02 + i * 0.014, z + 0.032 + i * 0.014, 0.05, 0.05, 8);
    X.card(c, 0.5, -0.22, z, 0.5, 0.26, TAG('for oil & new bearings'));
    lot.pickup = { xz: kit.world(c, 1.5, -0.55), y: lot.fr(kit, 0, 0).h + TOP };       // where finished drinks are set down
  }
  kit.posy(c, 7.1, -1.2, TOP);
  // back bar on the left wall: a counter, one shelf of cups and bean jars, and the slate above
  const b = at(0, DC, 0, 'right');
  X.shelving(b, -7.8, 7.8, [4.9], { d: 1.0, mat: OAK, back: 'tile_subway', block: false });
  b.box(OAK, -7.8, 7.8, 0.035, 1.4, 0, 3.3, G); b.box('marble', -7.9, 7.9, 0.035, 1.5, 3.3, 3.4); b.block(-7.9, 7.9, 0, 1.5, 0, 6.2);
  for (let i = 0; i < 12; i++) cupSaucer(b, -7.2 + i * 0.5, 0.55, 4.9, K.pick([PORC, 'c#c9d6d8/0.25', 'c#2f4a40/0.3', 'c#e3c9b8/0.3']), false);
  for (let i = 0; i < 6; i++) jar(b, 3.4 + i * 0.6, 0.5, 4.88, 0.17, 0.6, K.pick(['c#3a2214/0.9', 'c#4a2a18/0.9', 'c#2a180e/0.9']), 0.4 + K.rnd() * 0.5, BRASS);
  b.box('c#c9ccd0/0.2/1', -3.2, -1.6, 0.25, 1.25, 3.405, 3.45); tube(b, 'c#c9ccd0/0.2/1', [[-2.4, 0.2, 3.4], [-2.4, 0.2, 4.1], [-2.4, 0.6, 4.2], [-2.4, 0.75, 4.0]], 0.035, 8);
  kit.model('vintage_electric_kettle', b, 1.4, 0.7, 3.38, 0, { scale: 0.8 });
  X.slateBoard(b, 0, 8.4, 11, 3.6, MENU, { cw: 1100, ch: 360 });
  for (const x of [5.3, 0, -5.2]) X.pendant(c, x, -0.9, { kind: 'dome', drop: 4.6, colour: 'c#2f4a40/0.35', power: 1.0 });      // between the beams

  // ---- the banquette down the right wall: three marble tables, a chair to each, a globe over each ----------
  const q = at(W, DC, 0, 'left');                             // on the right wall: +x toward the back, +y out into the room
  { const x0 = -9.6, x1 = 8.4;                                // d 6.6 to 24.6
    q.box('c#2c2520/0.6', x0 + 0.1, x1 - 0.1, 0.3, 1.6, 0.004, 0.3); q.box(OAK, x0, x1, 0.22, 1.72, 0.3, 1.22, G);
    q.soft(HIDE, x0 + 0.02, x1 - 0.02, 0.24, 1.86, 1.22, 1.58, 0.07);
    for (let i = 0; i < 3; i++) { const u0 = x0 + 0.04 + i * (x1 - x0 - 0.08) / 3, u1 = u0 + (x1 - x0 - 0.08) / 3; q.soft(HIDE, u0 + 0.03, u1 - 0.03, 0.22, 0.62, 1.62, 3.55, 0.1); }
    for (const x of [x0 - 0.12, x1]) q.box(OAK, x, x + 0.12, 0.21, 1.9, 0.02, 3.75, G);
    q.block(x0 - 0.12, x1 + 0.12, 0, 1.9, 0, 3.6);
    for (const x of [-7.9, -5.3, -2.65, 0, 2.6, 5.2, 7.2]) kit.seat(q, x, 1.15, 1.58, 'sit on the banquette');
    [[-5.3, true], [0, false], [5.2, true]].forEach(([x, laid]) => {
      q.cyl(IRON, x, 3.1, 0.004, 0.08, 0.7, 0.75, 18); q.cyl(IRON, x, 3.1, 0.08, 2.38, 0.09, 0.09, 10); q.cyl('marble', x, 3.1, 2.38, 2.5, 1.05, 1.05, 28); q.block(x - 0.85, x + 0.85, 2.25, 3.95, 0, 2.5);
      kit.model('st_dining_chair_3', q, x, 5.0, 0, 2, { seat: 1.5 });
      if (laid) kit.posy(q, x + 0.25, 2.9, 2.5);
      X.pendant(q, x, 3.1, { kind: 'globe', drop: 4.3, power: 0.85 });
    });
    // three still lifes over it, one to a table
    const frame = { frame: 'fir#4a382c', border: 0.17 };
    kit.picture(q, 'cezanne_basket_of_apples', -5.3, 7.05, 3.0, 2.4, frame); kit.picture(q, 'coorte_strawberries', 0, 7.05, 1.9, 2.4, frame); kit.picture(q, 'van_gogh_grapes_lemons', 5.2, 7.05, 2.9, 2.4, frame);
  }

  // ---- the right window: the window bar, three stools facing the street ---------------------------------
  const w = at(W - 3.9, 0.02, 0, 'back');
  w.box(OAK, -3.5, 3.5, 0.25, 1.75, 3.25, 3.4, G); for (const x of [-3.2, 3.2]) { w.box(IRON, x - 0.04, x + 0.04, 1.6, 1.68, 0, 3.25); tube(w, IRON, [[x, 0.3, 2.4], [x, 1.64, 3.2]], 0.03, 5); }
  w.block(-3.5, 3.5, 0, 1.75, 0, 3.4);
  for (const x of [-2.3, 0, 2.3]) X.stool(w, x, 2.7, 2.35, { label: 'sit at the window' });
  potted(w, 3.0, 0.9, 3.4, { r: 0.22, n: 14, len: 0.7 }); kit.openBook(w, -1.2, 1.0, 3.4, {}); cupSaucer(w, -0.2, 1.05, 3.4);
  X.pendant(R, W - 3.9, 1.5, { kind: 'globe', drop: 4.3, power: 0.8 });

  // ---- the left window: a table for two under a hanging plant, and the beans for sale on the wall ----------
  { const t = at(5.0, 3.5);
    t.cyl(IRON, 0, 0, 0.004, 0.08, 0.75, 0.8, 18); t.cyl(IRON, 0, 0, 0.08, 2.38, 0.09, 0.09, 10); t.cyl('marble', 0, 0, 2.38, 2.5, 1.25, 1.25, 28); t.block(-1, 1, -1, 1, 0, 2.5);
    kit.model('st_dining_chair_3', t, -1.9, 0, 0, 3, { seat: 1.5 }); kit.model('st_dining_chair_3', t, 1.9, 0, 0, 1, { seat: 1.5 });      // each facing the table
    kit.candle(t, 0.1, 0.2, 2.5, 0.4);
    R.cyl('c#1d1b18/0.8', 5.0, 1.5, 8.6, 12, 0.012, 0.012, 4); potted(R, 5.0, 1.5, 8.2, { r: 0.42, h: 0.5, n: 20, len: 2.2, up: 0.1, out: 0.5, droop: 1.6, pot: 'c#e8e2d4/0.45' }); }
  { const l = at(0, 3.7, 0, 'right');                          // on the left wall: +x toward the street
    X.shelving(l, -2.7, 2.7, [1.3, 2.7, 4.1, 5.5], { d: 1.1, mat: OAK, back: CREAM });
    const bags = [['Morning Person', 'ETHIOPIA · WASHED', '#b8452e'], ['Night Owl', 'DECAF · SWISS WATER', '#26314a'], ['Slow Hand No. 3', 'HOUSE ESPRESSO', '#24382f'], ['Fog Lifter', 'GUATEMALA · HONEY', '#c9952a'], ['Phin Blend', 'ROBUSTA · DARK', '#5a2a1c']];
    for (const [zi, z] of [2.7, 4.1].entries()) for (let i = 0; i < 5; i++) { const bg = bags[(i + zi * 2) % bags.length]; kit.pack(l, -2.1 + i * 1.05, 0.55, z, 0.62, 0.34, 0.95, `c${bg[2]}/0.8`, BAG(bg[0], bg[1], bg[2]), { cw: 124, ch: 190 }); }
    for (let i = 0; i < 3; i++) { const x = -1.6 + i * 1.6; ves(l, 'glass', x, 0.55, 5.48, [[0, 0], [0.2, 0], [0.24, 0.2], [0.1, 0.42], [0.1, 0.5], [0.22, 0.75], [0.21, 0.76], [0.085, 0.5], [0.085, 0.42], [0.22, 0.2], [0, 0.03]], 16); l.box(WALNUT, x - 0.12, x + 0.12, 0.43, 0.67, 5.9, 5.98); }       // pour-over carafes with wooden collars
    for (let i = 0; i < 6; i++) kit.mug(l, -2.1 + i * 0.84, 0.5, 1.3, ['c#2f4a40/0.3', 'c#e8e2d4/0.3'][i % 2]); }

  // two big plants stand either side of the opening
  kit.pottedPlant(R, 6.4, 25.9, 0, 'leafy', { size: 1.5 }); kit.pottedPlant(R, 21.3, 26.0, 0, 'leafy', { size: 1.5 });

  // ================= the snug =====================================================================================
  const SV = 35;                                               // the stove's depth: the middle of the back room
  dado({ d: P.back, side: 'back' }, 0.02, 7.13); dado({ d: P.back, side: 'back' }, 19.87, 21.98);
  A.breast('left', SV, { w: 5.2, out: 1.3 });
  dado('left', P.back + 0.21, SV - 2.62); dado('left', SV + 2.62, D - 0.02);
  dado('back', 0.21, 16.77); dado('back', 20.63, 21.98);
  A.rail('left', P.back + 0.01, SV - 2.62); A.rail('left', SV + 2.62, D - 0.02); A.rail('back', 0.07, W - 0.02);

  // the stove on its hearth stone, the flue into the breast, and over it the clock with one hand
  const sv = at(1.304, SV, 0, 'right');                        // on the face of the breast: +y out into the room
  R.box(STONE, 1.31, 4.0, SV - 2.2, SV + 2.2, 0.004, 0.13);
  kit.model('st_wood_stove', sv, 0, 1.05, 0.13, 0, { scale: 1.3, collide: true });
  tube(sv, 'c#262320/0.75', [[0.48, 1.08, 2.9], [0.48, 1.08, 5.5], [0.48, 0.75, 5.9], [0.48, -0.1, 5.95]], 0.25, 12);
  kit.lampAt(sv, 0, 2.6, 1.3, 0.6);                            // the fire's own light
  { const CZ = 8.5, CR = 1.45;
    hcyl(sv, BRASS, 'y', 0, 0.05, CZ, 0.09, CR + 0.09, CR + 0.09, 40); kit.sign(sv, 0, 0.1, CZ, CR * 2, CR * 2, DIAL, { cw: 420, ch: 420, round: true });
    const [hx, hz] = kit.world(sv, 0, 0.125), raw = lot.fr(kit, 1.304, SV, 0, 'right');
    kit.later.push(ctx => {
      const { THREE } = ctx, grp = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0x1c1814, roughness: 0.5, metalness: 0.4 });
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.085, 1.34, 0.02).translate(0, 0.42, 0), m), tip = new THREE.Mesh(new THREE.CylinderGeometry(0.0, 0.13, 0.26, 4, 1).scale(1, 1, 0.12).translate(0, 1.16, 0), m);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 16).rotateX(Math.PI / 2), m), turn = new THREE.Group();
      turn.add(hand, tip); grp.add(turn, hub); grp.position.set(hx, FLOOR + CZ, hz); grp.rotation.y = kit.yawOf(raw.dir); ctx.scene.add(grp);
      const set = () => { turn.rotation.z = -((ctx.day.hour ?? 18) % 12) / 12 * Math.PI * 2; }; set(); ctx.animated.push(set);
      const [fx, fz] = kit.world(sv, 0, 1.9);
      ctx.interact.push({ x: fx, y: FLOOR + 2.2, z: fz, reach: 6, size: 1.2, label: () => 'warm your hands', act: () => { try { ctx.flash('You hold your hands out to the stove. It ticks as it heats.'); } catch { /* a stove is not worth a crash */ } } });
    });
  }
  // the log pile in the far alcove, and a big plant in the corner
  { const lg = at(0, SV + 4.3, 0, 'right'), cols = ['fir#9a7a58', 'fir#7d6248', 'fir#b08e68'];
    for (const x of [-1.32, 1.32]) { lg.box(IRON, x - 0.04, x + 0.04, 0.25, 0.33, 0.004, 2.75); lg.box(IRON, x - 0.04, x + 0.04, 1.4, 1.48, 0.004, 2.75); lg.box(IRON, x - 0.04, x + 0.04, 0.25, 1.48, 0.1, 0.18); }
    for (let k = 0; k < 6; k++) for (let i = 0; i < (k % 2 ? 5 : 6); i++) { const r = 0.19 + K.rnd() * 0.035; hcyl(lg, cols[(i + k * 2) % 3], 'y', -1.05 + i * 0.42 + (k % 2 ? 0.21 : 0) + (K.rnd() - 0.5) * 0.03, 0.9 + (K.rnd() - 0.5) * 0.12, 0.42 + k * 0.385, 1.45, r, r, 10); }
    lg.block(-1.4, 1.4, 0, 1.7, 0, 2.8);
    kit.pottedPlant(R, 1.15, D - 0.95, 0, 'leafy', { size: 1.2 }); }

  // the seats: a sofa facing the stove, an armchair at each end, a low table between, all on one rug
  rugAt(4.25, 15.0, P.back + 1.2, D - 1.1, 'tabriz');
  kit.sofa(at(15.2, SV, 0, 'left'), 7, 'linen#96492f', ['linen#6c7a60', 'linen#e3d8c0'], { throw: false });
  kit.armchair(at(3.6, P.back + 0.7, 0, 'back'), 'linen#a39678', 'linen#6c7a60'); kit.armchair(at(3.6, D - 0.75, 0, 'street'), 'linen#a39678', 'linen#96492f');
  { const t = at(9.3, SV, 0, 'left');                          // +x toward the back
    kit.table(t, 4.0, 1.9, 1.45, WALNUT, 0.16, { shelf: true });
    kit.candle(t, 0.2, 0.1, 1.45, 0.4); kit.magazines(t, -1.2, 0.1, 1.45, 3); cupSaucer(t, 1.4, 0.4, 1.45); }
  { const t = at(15.94, SV, 0, 'left');                        // a narrow table against the back of the sofa
    kit.table(t, 6, 1.2, 2.62, OAK, 0.14);
    kit.tableLamp(t, -2.1, 0, 2.62, 'c#2f4a40/0.35'); kit.bookStack(t, 1.9, 0, 2.62, 4); potted(t, 0.2, 0, 2.62, { r: 0.2, n: 12, len: 0.6 }); }
  kit.floorLamp(R, 1.1, P.back + 1.0);

  // the wall of books on the right, with its ladder
  for (const d of [31.45, 38.35]) kit.bookcase(at(W, d, 0, 'left'), 6.8, 8.6, { fill: 0.88 });
  { const bl = at(W, 39.0, 0, 'left');                         // y = 0.95 is the face of the bookcases
    bl.box(BRASS, -10.9, 2.6, 1.08, 1.12, 7.72, 7.76);
    for (const x of [-9.5, -4, 1.5]) bl.box(BRASS, x - 0.02, x + 0.02, 0.99, 1.1, 7.7, 7.78);
    for (const x of [-0.62, 0.62]) { tube(bl, OAK, [[x, 2.75, 0.02], [x, 1.2, 7.95]], 0.065, 8, true); }
    for (let i = 1; i <= 7; i++) { const k = i / 8.2; tube(bl, OAK, [[-0.62, 2.75 - 1.55 * k, 7.93 * k], [0.62, 2.75 - 1.55 * k, 7.93 * k]], 0.045, 6); }
    bl.block(-0.7, 0.7, 0.95, 2.8, 0, 7); }

  // the back wall: the yard door (a real one: town.js cuts the doorway and hangs the door) and the back window with its blind down
  { const y0 = D - 0.06, y1 = D - 0.004, trim = (a0, a1, z0, z1, out = 0) => R.box(TRIM, a0, a1, y0 - out, y1, z0, z1, G);
    // the casing of the yard door: the opening is 3.1 wide and 6.95 high, with a blind light over it
    { const DA = W - (0.2 * (W + 1) - 0.5), a0 = DA - 1.55, a1 = DA + 1.55;
      trim(a0 - 0.36, a0, 0.004, 8.4); trim(a1, a1 + 0.36, 0.004, 8.4); trim(a0 - 0.42, a1 + 0.42, 8.4, 8.78, 0.012); trim(a0, a1, 6.95, 7.38);
      R.box(BLIND, a0 + 0.02, a1 - 0.02, D - 0.034, D - 0.01, 7.39, 8.39); }
    // the window: 3 by 4, two lights over two
    trim(11.56, 11.92, 4.52, 8.4); trim(14.88, 15.24, 4.52, 8.4); trim(11.5, 15.3, 8.4, 8.78, 0.012); R.box(TRIM, 11.46, 15.34, D - 0.5, y1, 4.42, 4.52, G);
    R.box(BLIND, 11.92, 14.88, D - 0.034, D - 0.01, 4.52, 8.4);
    R.box(TRIM, 13.37, 13.43, D - 0.052, D - 0.028, 4.52, 8.4, G); R.box(TRIM, 11.92, 14.88, D - 0.056, D - 0.03, 6.42, 6.5, G);
    potted(R, 12.5, D - 0.27, 4.52, { r: 0.2, n: 12, len: 0.6 }); potted(R, 14.2, D - 0.27, 4.52, { r: 0.17, n: 10, len: 0.45 });
    kit.picture(at(5.8, D, 0, 'street'), 'vermeer_little_street', 0, 7.0, 2.3, 2.85, { frame: 'fir#4a382c', border: 0.17 }); }
  X.pendant(R, 9.3, 31.8, { kind: 'globe', drop: 3.9, power: 0.8 }); X.pendant(R, 9.3, 37.0, { kind: 'globe', drop: 3.9, power: 0.8 });

  // ---- out on the pavement: one bistro set under the awning, the board --------------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));           // x = a along the frontage, y = -feet out from the shopfront
  kit.model('outdoor_table_chair_set_01', o, 4.5, -2.6, 0, 1, { outdoor: true, collide: true });
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.4, 5.2, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h); chalk(g, 'today', w / 2, h * 0.12, h * 0.1, '#e9c46a'); ICON.cup(g, w / 2, h * 0.36, h * 0.22, '#f1efe6'); chalk(g, 'cardamom latte', w / 2, h * 0.64, h * 0.09); chalk(g, 'warm buns at 4', w / 2, h * 0.8, h * 0.085, '#9fc6b0'); });

  // ---- Juniper ------------------------------------------------------------------------------------------------
  const behind = x => kit.world(c, x, -3.3);                   // the aisle behind the counter
  kit.clerks.push({
    id: 'juniper', name: 'Juniper', lot: 'coffee', look: { shape: 'egg', colour: '#2f5a4a', belly: '#efe4cf', trim: '#c9a45c', hat: 'beanie', hatColour: '#b8452e', apron: '#3a2a20', eye: '#ffe2b0', ring: 0x9fe0c0, tool: 'cup', hover: 4.7 },
    home: behind(0.8), faces: kit.world(c, 0.8, 8), posts: [behind(5.2), behind(-6.2), behind(0.8), behind(-3.2)],
    serve: { machine: behind(3.4), pickup: lot.pickup },
    lines: {
      greet: ['Hello, you. Sit anywhere.', 'Coffee? It takes as long as it takes.'],
      idle: ['*wipes the steam wand, tenderly*', 'I dialled in the grinder this morning. It was emotional.', 'Somebody left a book here in March. I have read it nine times.'],
      bye: ['Mind the kerb.', 'Come back before sunset. You have ages.'],
      topics: [
        { q: 'A flat white, please.', a: 'Watch the pour. I am practising a swan. It is still a turnip.', serve: 'flat white' },
        { q: 'Cà phê sữa đá?', a: 'Phin, condensed milk, a lot of ice. Give me a moment and no advice.', serve: 'cà phê sữa đá' },
        { q: 'What do you recommend?', a: 'The cortado. Small, strong, no notes.', serve: 'cortado' },
        { q: 'Your clock has one hand.', a: 'The hours. The other one only hurried people.' },
        { q: 'Is it always evening?', a: 'Nearly evening. Evening is when we close.' },
      ],
    },
  });
}
