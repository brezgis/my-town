// Slow Hand Coffee  (north side, 31 ft wide by 28.7 deep)
// The bar runs across the back, facing the door: a copper-domed lever machine, the grinder, a
// glass case of pastry, a brass till. Behind it, shelves of cups and a slate menu the width of
// the wall. To the right a window bar for watching the street, two small tables, and a corner
// with armchairs and a rug. To the left, by the window, the beans and brewing things for sale.
// Juniper is behind the bar.
import { tools, fixtures } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, para, ICON, rnd } from '../draw.js';

const OAK = 'oak_light#a3825c', WALNUT = 'fir#7d5b45', GREEN = 'painted_wood#4d6f60', CREAM = 'painted_wood#e6dcc6', COPPER = 'c#b06a3c/0.32/1', CHROME = 'c#d4d6d8/0.12/1', PORC = 'c#ebe6dc/0.18', BLACK = 'c#17140f/0.3';

const MENU = (g, w, h) => {
  slate(g, w, h, '#232826', 7);
  chalk(g, 'Slow Hand', w * 0.5, h * 0.11, h * 0.13, '#f1efe6'); line(g, [[w * 0.36, h * 0.19], [w * 0.64, h * 0.19]], '#e9c46a', 3);
  const col = (x, title, rows, c) => { chalk(g, title, x, h * 0.3, h * 0.085, c, { a: 'left' }); rows.forEach(([n, p], i) => { chalk(g, n, x, h * (0.42 + i * 0.105), h * 0.068, '#efe9da', { a: 'left' }); chalk(g, p, x + w * 0.27, h * (0.42 + i * 0.105), h * 0.068, '#efe9da', { a: 'right' }); }); };
  col(w * 0.04, 'espresso', [['espresso', '3'], ['cortado', '4'], ['flat white', '4½'], ['oat latte', '5'], ['cardamom latte', '5½']], '#e9c46a');
  col(w * 0.365, 'slow', [['pour-over', '5'], ['cà phê sữa đá', '5'], ['cold brew', '4½'], ['hot chocolate', '4'], ['mint tea', '3']], '#e8a8a0');
  col(w * 0.69, 'to eat', [['croissant', '4'], ['cardamom bun', '4½'], ['jam tart', '3½'], ['carrot cake', '5'], ['toast & good butter', '4']], '#9fc6b0');
  chalk(g, 'robots drink free (they do not drink)', w * 0.5, h * 0.94, h * 0.055, '#9aa39d');
};
const BAG = (name, sub, c, ink = '#f1e9d6') => (g, w, h) => { fill(g, w, h, c); grain(g, w, h, 0.06); rrect(g, w * 0.1, h * 0.26, w * 0.8, h * 0.5, 6, ink); ICON.sun(g, w / 2, h * 0.4, w * 0.3, c); T(g, name, w / 2, h * 0.57, h * 0.085, c, { f: F.dm, max: w * 0.72 }); T(g, sub, w / 2, h * 0.68, h * 0.045, c, { f: F.bebas, ls: 1, max: w * 0.72 }); T(g, 'SLOW HAND', w / 2, h * 0.13, h * 0.06, ink, { f: F.bebas, ls: 2 }); T(g, '12 oz · whole bean', w / 2, h * 0.88, h * 0.045, ink, { f: F.fraunces, it: 1 }); };
const TAG = (txt, c = '#f1e9d6', ink = '#2a1c13') => (g, w, h) => { paper(g, w, h, c); T(g, txt, w / 2, h / 2, h * 0.42, ink, { f: F.caveat, w: 600, max: w * 0.9 }); };
const POSTER = {
  gig(g, w, h) { fill(g, w, h, '#e0723c'); grain(g, w, h, 0.08); disc(g, w / 2, h * 0.4, w * 0.36, '#f3e6c8'); disc(g, w / 2, h * 0.4, w * 0.24, '#26314a'); disc(g, w / 2, h * 0.4, w * 0.1, '#e0723c');
    T(g, 'THE SLOW HANDS', w / 2, h * 0.76, h * 0.085, '#26314a', { f: F.archivo, max: w * 0.88 }); T(g, 'play quietly · every thursday · here', w / 2, h * 0.85, h * 0.042, '#26314a', { f: F.fraunces, it: 1, w: 600, max: w * 0.88 }); T(g, 'bring a cushion', w / 2, h * 0.92, h * 0.05, '#f3e6c8', { f: F.caveat, w: 600 }); },
  origin(g, w, h) { paper(g, w, h, '#efe6d2', 11); T(g, 'HOW A FLAT WHITE HAPPENS', w / 2, h * 0.08, h * 0.05, '#24382f', { f: F.bebas, ls: 2 });
    const steps = ['grind', 'tamp', 'pull', 'steam', 'pour', 'hand over'], r = rnd(3);
    steps.forEach((s, i) => { const x = w * (0.2 + (i % 2) * 0.6), y = h * (0.24 + Math.floor(i / 2) * 0.26); disc(g, x, y, w * 0.13, null, '#24382f', 3); ICON.cup(g, x, y, w * 0.16, i === 5 ? '#b8452e' : '#24382f'); T(g, `${i + 1}. ${s}`, x, y + w * 0.2, h * 0.04, '#24382f', { f: F.fraunces, it: 1, w: 600 }); if (i < 5) line(g, i % 2 ? [[x - w * 0.16, y + w * 0.1], [w * 0.36, y + h * 0.2]] : [[x + w * 0.16, y], [x + w * 0.42, y]], '#b8452e', 2); });
    T(g, '(step 7: sit down)', w / 2, h * 0.95, h * 0.04, '#b8452e', { f: F.caveat, w: 600 }); },
  wifi(g, w, h) { paper(g, w, h, '#f1e9d6'); g.strokeStyle = '#24382f'; g.lineWidth = 3; g.strokeRect(8, 8, w - 16, h - 16); T(g, 'the wifi is called', w / 2, h * 0.2, h * 0.11, '#24382f', { f: F.fraunces, it: 1, w: 600 }); T(g, 'TalkToEachOther', w / 2, h * 0.42, h * 0.15, '#b8452e', { f: F.elite, max: w * 0.86 }); T(g, 'password:', w / 2, h * 0.64, h * 0.1, '#24382f', { f: F.fraunces, it: 1, w: 600 }); T(g, 'oatmilk4ever', w / 2, h * 0.82, h * 0.14, '#24382f', { f: F.elite, max: w * 0.86 }); },
};

export default function coffee(kit, lot) {
  const K = tools(kit, 31), X = fixtures(kit, K), { ves, hcyl, ball, tube, jar, tin, plate, glass, cupSaucer, potted, bottle } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                        // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D;

  // ---- the bar: across the back, customers on the street side ---------------------------------------
  const c = at(10, 19.2, 0, 'street');                        // x runs toward smaller a; +y is the customers' side
  const TOP = X.counter(c, -7.5, 7, -2.6, 0, 3.4, { front: GREEN, top: 'marble' });
  c.box(BRASS, -7.5, 7, 0.18, 0.24, 0.62, 0.68);              // the foot rail
  for (const x of [-6.8, -2.5, 2, 6.4]) c.box(BRASS, x - 0.03, x + 0.03, 0, 0.21, 0.6, 0.66);
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
    for (let i = 0; i < 5; i++) ves(e, PORC, -0.85 + i * 0.42, 0.42, 0.42, [[0, 0], [0.07, 0], [0.12, 0.08], [0.13, 0.2], [0.12, 0.2], [0.1, 0.06], [0, 0.04]], 12);
    const [sx, sz] = kit.world(e, 0.78, -0.38); kit.steam.push({ x: sx, y: lot.fr(kit, 0, 0).h + TOP + 0.5, z: sz });
    lot.machine = kit.world(e, 0, -1.6);
  }
  // grinder, knock box, milk jugs
  { const x = 5.4, y = -1.3, z = TOP;
    c.soft('c#2a2622/0.35', x - 0.27, x + 0.27, y - 0.32, y + 0.32, z, z + 1.05, 0.08); ves(c, 'glass', x, y, z + 1.05, [[0.08, 0], [0.24, 0.45], [0.25, 0.5], [0, 0.5]], 18); ves(c, 'c#3a2214/0.9', x, y, z + 1.07, [[0.08, 0], [0.2, 0.3], [0, 0.32]], 14); c.cyl(BLACK, x, y, z + 1.55, z + 1.6, 0.25, 0.25, 18);
    for (const [dx, s] of [[-0.8, 1], [-0.5, 0.8]]) ves(c, 'c#c9ccd0/0.2/1', 1.6 + dx, -2.0, z, [[0, 0], [0.13 * s, 0], [0.14 * s, 0.25 * s], [0.12 * s, 0.4 * s], [0, 0.4 * s]], 14); }
  // the pastry case, with tickets
  X.glassCase(c, -6.9, -2.7, -1.5, -0.25, TOP, 1.25, { shelf: 0.62 });
  { const z = TOP + 0.03, z2 = TOP + 0.62;
    for (let i = 0; i < 4; i++) { plate(c, -6.3 + i * 0.95, -0.9, z, 0.36); }
    for (const [x, t] of [[-6.4, 0.3], [-6.2, 1.9], [-6.25, 4.0]]) kit.model('croissant', c, x, -0.9, z + 0.05, 0, { turn: t });
    for (const [x, y] of [[-5.45, -1.0], [-5.25, -0.8], [-5.35, -0.7]]) kit.model('st_pastry_1', c, x, y, z + 0.05, 0, { turn: x * 3 });
    for (const [x, y] of [[-4.5, -0.95], [-4.3, -0.8], [-4.42, -0.7]]) kit.model('st_jam_tart', c, x, y, z + 0.05);
    kit.model('carrot_cake', c, -3.45, -0.9, z + 0.05);
    kit.model('strawberry_chocolate_cake', c, -5.9, -0.9, z2 + 0.01); kit.model('st_cake_stand', c, -3.6, -0.95, z2, 0, { scale: 0.75 });
    for (let i = 0; i < 5; i++) kit.model('st_jam_tart', c, -4.95 + (i % 3) * 0.36, -1.05 + Math.floor(i / 3) * 0.36, z2 + 0.01);
    { const eat = (x, y, zz, name, model, note) => { const [wx_, wz_] = kit.world(c, x, y); kit.eats.push({ x: wx_, y: c.h + zz + 0.1, z: wz_, name, model, note, reach: 7 }); };
      eat(-6.3, -0.9, z, 'croissant', 'croissant', 'You finish the croissant. There are flakes everywhere, as is right.'); eat(-5.35, -0.85, z, 'hand pie', 'st_pastry_1', 'You finish the hand pie. Still warm in the middle.'); eat(-4.4, -0.85, z, 'jam tart', 'st_jam_tart', 'You finish the jam tart. Raspberry, and proud of it.'); }
    ['croissant 4', 'hand pie 4½', 'jam tart 3½', 'carrot cake 5'].forEach((t, i) => X.card(c, -6.3 + i * 0.95, -0.36, z, 0.5, 0.2, TAG(t)));
  }
  // the till: brass, with a little flag that says NO SALE
  { const x = -0.8, y = -1.1, z = TOP;
    c.soft('c#b08d4a/0.35/1', x - 0.55, x + 0.55, y - 0.5, y + 0.45, z, z + 0.5, 0.05); c.soft('c#b08d4a/0.35/1', x - 0.5, x + 0.5, y - 0.5, y + 0.1, z + 0.5, z + 1.0, 0.08);
    for (let i = 0; i < 12; i++) c.cyl('c#efe9da/0.3', x - 0.36 + (i % 4) * 0.24, y + 0.2 + Math.floor(i / 4) * 0.08, z + 0.5 + (2 - Math.floor(i / 4)) * 0.05, z + 0.56 + (2 - Math.floor(i / 4)) * 0.05, 0.05, 0.05, 8);
    kit.sign(c, x, y + 0.11, z + 0.78, 0.7, 0.3, (g, w, h) => { fill(g, w, h, '#17140f'); T(g, 'NO SALE', w / 2, h / 2, h * 0.5, '#e9c46a', { f: F.bebas, ls: 3 }); }, { cw: 128, ch: 56 });
    // tip jar
    jar(c, 0.5, -0.5, z, 0.16, 0.42, null, 0, null); for (let i = 0; i < 7; i++) c.cyl('c#b08d4a/0.35/1', 0.5 + (i % 3 - 1) * 0.05, -0.5 + (i % 2) * 0.05, z + 0.02 + i * 0.014, z + 0.032 + i * 0.014, 0.05, 0.05, 8);
    X.card(c, 0.5, -0.22, z, 0.5, 0.26, TAG('for oil & new bearings'));
    lot.pickup = { xz: kit.world(c, 1.5, -0.55), y: lot.fr(kit, 0, 0).h + TOP };       // where finished drinks are set down
  }
  // back bar: shelves of cups, jars of beans, syrups; the slate above
  const b = at(10, D, 0, 'street');
  X.shelving(b, -7.3, 7, [3.3, 4.7, 6.1], { d: 1.05, mat: OAK, over: 0.02, back: 'tile_subway' });
  b.box(OAK, -7.3, 7, 0.02, 1.4, 0, 3.3, G); b.box('marble', -7.4, 7.1, 0.02, 1.5, 3.3, 3.4);
  for (let i = 0; i < 16; i++) cupSaucer(b, -6.9 + i * 0.44, 0.55, 4.7, K.pick([PORC, 'c#c9d6d8/0.25', 'c#2f4a40/0.3', 'c#e3c9b8/0.3']), false);
  for (let i = 0; i < 9; i++) jar(b, -6.8 + i * 0.5, 0.5, 6.1, 0.17, 0.6, K.pick(['c#3a2214/0.9', 'c#4a2a18/0.9', 'c#2a180e/0.9']), 0.4 + K.rnd() * 0.5, BRASS);
  for (let i = 0; i < 7; i++) bottle(b, -1.6 + i * 0.36, 0.5, 6.1, { r: 0.1, h: 0.85, col: K.pick(['c#8a5a2a/0.2', 'c#c9952a/0.2', 'c#8a1c1c/0.2', 'c#f4f1ea/0.2']), label: 'c#efe2bc/0.6', cap: 'c#17140f/0.4' });
  for (let k = 0; k < 10; k++) plate(b, 2.2, 0.55, 6.1 + k * 0.035, 0.34, k % 3 ? PORC : 'c#2f4a40/0.3');
  for (let i = 0; i < 8; i++) glass(b, 3.3 + i * 0.36, 0.5, 6.1, 0.1, 0.36);
  for (let i = 0; i < 6; i++) ves(b, K.pick(['c#e0782a/0.45', 'c#2f4a40/0.45', 'c#e8e2d4/0.45', 'c#26364f/0.45']), -6.7 + i * 0.5, 0.55, 3.4, [[0, 0], [0.13, 0], [0.15, 0.1], [0.15, 0.32], [0.14, 0.33], [0.12, 0.08], [0, 0.05]], 14);
  // a sink and the kettle on the back counter
  b.box('c#c9ccd0/0.2/1', -3.2, -1.6, 0.25, 1.25, 3.36, 3.41); tube(b, 'c#c9ccd0/0.2/1', [[-2.4, 0.2, 3.4], [-2.4, 0.2, 4.1], [-2.4, 0.6, 4.2], [-2.4, 0.75, 4.0]], 0.035, 8);
  kit.model('vintage_electric_kettle', b, 1.4, 0.7, 3.4, 0, { scale: 0.8 });
  X.slateBoard(b, -0.15, 9.35, 13.2, 4.3, MENU, { cw: 1320, ch: 430 });
  for (const x of [-4.5, 0, 4.2]) X.pendant(c, x, -0.9, { kind: 'dome', drop: 4.6, colour: 'c#2f4a40/0.35', power: 1.0 });

  // ---- beans and brewing things for sale, by the left window ----------------------------------------
  const l = at(0, 6.2, 0, 'right');                            // on the left wall: +x toward the street
  X.shelving(l, -3.6, 4.2, [1.3, 2.7, 4.1, 5.5], { d: 1.1, mat: OAK, back: CREAM });
  const bags = [['Morning Person', 'ETHIOPIA · WASHED', '#b8452e'], ['Night Owl', 'DECAF · SWISS WATER', '#26314a'], ['Slow Hand No. 3', 'HOUSE ESPRESSO', '#24382f'], ['Fog Lifter', 'GUATEMALA · HONEY', '#c9952a'], ['Phin Blend', 'ROBUSTA · DARK', '#5a2a1c']];
  for (const [zi, z] of [2.7, 4.1].entries()) for (let i = 0; i < 8; i++) { const bg = bags[(i + zi * 2) % bags.length]; kit.pack(l, -3.2 + i * 0.95, 0.55, z, 0.62, 0.34, 0.95, `c${bg[2]}/0.8`, BAG(bg[0], bg[1], bg[2]), { cw: 124, ch: 190 }); }
  for (let i = 0; i < 6; i++) { const x = -3.1 + i * 1.3; ves(l, 'glass', x, 0.55, 5.5, [[0, 0], [0.2, 0], [0.24, 0.2], [0.1, 0.42], [0.1, 0.5], [0.22, 0.75], [0.21, 0.76], [0.085, 0.5], [0.085, 0.42], [0.22, 0.2], [0, 0.03]], 16); l.box(WALNUT, x - 0.12, x + 0.12, 0.43, 0.67, 5.9, 5.98); }       // pour-over carafes with wooden collars
  for (let i = 0; i < 9; i++) kit.mug(l, -3.2 + i * 0.85, 0.5, 1.3, K.pick(['c#2f4a40/0.3', 'c#e8e2d4/0.3', 'c#b8452e/0.3', 'c#c9952a/0.3']));
  for (let i = 0; i < 5; i++) tin(l, -3.0 + i * 0.6, 0.5, 0.0 + 0.02, 0.2, 0.55, K.pick(['c#2f4a40/0.4', 'c#c8202a/0.4', 'c#d9b35a/0.4']), 'c#efe2bc/0.5');
  X.card(l, 0.5, 1.0, 2.7, 0.9, 0.3, TAG('beans roasted upstairs on tuesdays'));

  // ---- the window bar: stools facing the street ------------------------------------------------------------
  const w = at(24, 0.02, 0, 'back');
  w.box(OAK, -5.6, 5.6, 0.25, 1.75, 3.25, 3.4, G); for (const x of [-5.3, -1.8, 1.8, 5.3]) { w.box('c#2b2724/0.45/1', x - 0.04, x + 0.04, 1.6, 1.68, 0, 3.25); tube(w, 'c#2b2724/0.45/1', [[x, 0.3, 2.4], [x, 1.64, 3.2]], 0.03, 5); }
  w.block(-5.6, 5.6, 0, 1.75, 0, 3.4);
  for (const x of [-4.2, -1.4, 1.4, 4.2]) X.stool(w, x, 2.7, 2.35, { label: 'sit at the window' });
  cupSaucer(w, -1.3, 1.0, 3.4); kit.openBook(w, -2.3, 1.0, 3.4, {}); potted(w, 4.9, 0.9, 3.4, { r: 0.22, n: 14, len: 0.7 }); kit.steam.push({ x: kit.world(w, -1.3, 1.0)[0], y: w.h + 3.75, z: kit.world(w, -1.3, 1.0)[1] });

  // ---- tables --------------------------------------------------------------------------------------------
  for (const [a, d] of [[20.5, 8.2], [26.5, 11.2]]) {
    const t = at(a, d);
    t.cyl('c#2b2724/0.45/1', 0, 0, 0, 0.08, 0.75, 0.8, 18); t.cyl('c#2b2724/0.45/1', 0, 0, 0.08, 2.38, 0.09, 0.09, 10); t.cyl('marble', 0, 0, 2.38, 2.5, 1.25, 1.25, 28); t.block(-1, 1, -1, 1, 0, 2.5);
    kit.model('st_dining_chair_3', t, -1.9, 0, 0, 1, { seat: 1.5 }); kit.model('st_dining_chair_3', t, 1.9, 0, 0, 3, { seat: 1.5 });
    kit.posy(t, 0.2, 0.3, 2.5); cupSaucer(t, -0.6, -0.1, 2.5);
  }
  // ---- the corner with the armchairs ------------------------------------------------------------------------
  kit.rug(...(() => { const [X0, Y0] = lot.XY(19, 17), [X1, Y1] = lot.XY(30, 27.5); return [Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1)]; })(), lot.fr(kit, 0, 0).h, 'kilim');
  const k = at(W, 22.5, 0, 'left');                            // on the right wall: +x toward the back
  kit.model('st_armchair_4_green', k, -2.4, 2.2, 0, 0, { seat: 1.35, turn: 0.25 }); kit.model('mid_century_lounge_chair', at(21.8, 25.6, 0, 'street'), 0, 0, 0, 0, { seat: 1.3, turn: -0.5, collide: true });
  kit.model('round_wooden_table_02', k, 0.6, 3.6, 0, 0, { collide: true }); kit.floorLamp(k, 3.6, 1.3);
  kit.model('st_armchair_4_green', k, 2.6, 5.4, 0, 2, { seat: 1.35, turn: 0.5 });
  { const t = at(0, 0); const [ta, td] = [W - 3.6, 23.1]; cupSaucer(t, ta, td, 2.46); kit.magazines(t, ta - 0.3, td + 0.5, 2.46, 3); kit.candle(t, ta + 0.5, td - 0.4, 2.46, 0.4); }
  // a shelf of board games and paperbacks on the back wall, right of the bar
  const g2 = at(W - 5.4, D, 0, 'street');
  X.shelving(g2, -4.2, 4.2, [1.2, 2.5, 3.8, 5.1], { d: 1.0, mat: OAK });
  for (const z of [2.5, 3.8, 5.1]) kit.bookRow(g2, -4.1, 4.1, 0.06, z, 1.2, 0.72);
  { const games = [['CARCASSONNE-ISH', '#3f6a5a'], ['SCRABBLE (no Q)', '#8a1c1c'], ['GO', '#17140f'], ['CHESS', '#c9952a'], ['1000 PIECES · A FOG', '#9fb0d8'], ['SETTLERS', '#b8452e']];
    games.forEach(([n, col], i) => { const x = -3.4 + (i % 3) * 2.6, z = 1.2 + Math.floor(i / 3) * 0.26; g2.box(`c${col}/0.6`, x - 1.0, x + 1.0, 0.1, 0.95, z, z + 0.24); kit.sign(g2, x, 0.96, z + 0.12, 1.9, 0.2, (g, w, h) => { fill(g, w, h, col); T(g, n, w / 2, h / 2, h * 0.6, '#f1e9d6', { f: F.bebas, ls: 2, max: w * 0.9 }); }, { cw: 256, ch: 28 }); }); }
  // posters on the right wall, and the wifi
  const p = at(W, 9.5, 0, 'left');
  for (const [x, z, pw, ph, art] of [[-3, 6.4, 3, 4.2, POSTER.gig], [1.2, 6.6, 2.6, 3.6, POSTER.origin]]) { p.box('c#17140f/0.5', x - pw / 2 - 0.08, x + pw / 2 + 0.08, 0.01, 0.07, z - ph / 2 - 0.08, z + ph / 2 + 0.08); kit.sign(p, x, 0.08, z, pw, ph, art, { cw: Math.round(pw * 150), ch: Math.round(ph * 150) }); }
  kit.sign(c, 5.5, 0.03, 1.95, 1.1, 0.9, POSTER.wifi, { cw: 220, ch: 180 });
  // hanging plants and lamps over the room
  for (const [a, d] of [[21, 8.2], [26.5, 11.2], [24, 2.6], [5, 5]]) X.pendant(R, a, d, { kind: 'globe', drop: 4.2, power: 0.85 });
  for (const [a, d, n] of [[14.5, 3.2, 22], [30, 4, 18], [2.2, 14, 20]]) { R.cyl('c#1d1b18/0.8', a, d, 8.6, 12, 0.012, 0.012, 4); potted(R, a, d, 8.2, { r: 0.42, h: 0.5, n, len: 2.2, up: 0.1, out: 0.5, droop: 1.6, pot: 'c#e8e2d4/0.45' }); }
  kit.pottedPlant(R, 1.4, 17.5, 0, 'leafy', { size: 1.5 }); kit.pottedPlant(R, 17.4, 1.2, 0, 'snake', { size: 1.1 });

  // ---- out on the pavement: two bistro sets under the awning, the board ------------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));           // x = a along the frontage, y = -feet out from the shopfront
  kit.model('outdoor_table_chair_set_01', o, 5.5, -2.6, 0, 1, { outdoor: true, collide: true }); kit.model('outdoor_table_chair_set_01', o, 25, -2.6, 0, 1, { outdoor: true, collide: true });
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.4, 5.2, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h); chalk(g, 'today', w / 2, h * 0.1, h * 0.1, '#e9c46a'); ICON.cup(g, w / 2, h * 0.3, h * 0.2, '#f1efe6'); chalk(g, 'cardamom latte', w / 2, h * 0.52, h * 0.085); chalk(g, 'cà phê sữa đá', w / 2, h * 0.64, h * 0.085, '#e8a8a0'); chalk(g, 'warm buns at 4', w / 2, h * 0.76, h * 0.085, '#9fc6b0'); chalk(g, 'come in, it is nice', w / 2, h * 0.91, h * 0.06, '#9aa39d'); });

  // ---- Juniper ------------------------------------------------------------------------------------------------
  const post = (a, d, yaw) => { const [x, z] = lot.world(a, d); return { x, z, yaw }; };
  kit.clerks.push({
    id: 'juniper', name: 'Juniper', lot: 'coffee', look: { shape: 'egg', colour: '#2f5a4a', belly: '#efe4cf', trim: '#c9a45c', hat: 'beanie', hatColour: '#b8452e', apron: '#3a2a20', eye: '#ffe2b0', ring: 0x9fe0c0, tool: 'cup', hover: 4.7 },
    home: lot.world(9.2, 22.2), faces: lot.world(9.2, 10), posts: [lot.world(4.6, 22.2), lot.world(13.5, 22.3), lot.world(9.2, 22.2)],
    serve: { machine: lot.world(6.6, 22.3), pickup: lot.pickup },
    lines: {
      greet: ['Hello, you. Sit anywhere that is not on fire.', 'Evening! The sun is doing its thing again. Coffee?', 'Come in, come in. The buns are warm and so am I. Thermally.'],
      idle: ['*wipes the steam wand with great tenderness*', 'I dialled in the grinder this morning. It was emotional.', 'Somebody left a book here in March. I have read it nine times.', '*hums along with the fridge*'],
      bye: ['Come back before the sun sets. You have ages.', 'Mind the kerb!'],
      topics: [
        { q: 'A flat white, please.', a: 'One flat white. Watch the pour. I have been practising a swan; it still looks like a turnip.', serve: 'flat white' },
        { q: 'Cà phê sữa đá?', a: 'The good stuff. Phin, condensed milk, a great deal of ice. Give me a moment and no advice.', serve: 'cà phê sữa đá' },
        { q: 'What do you recommend?', a: 'The cardamom latte, if you like being hugged. The cortado if you would rather be told the truth.', next: [
          { q: 'Hug me.', a: 'One cardamom latte. It is basically a scarf.', serve: 'cardamom latte' }, { q: 'The truth, then.', a: 'A cortado. Small, strong, no notes.', serve: 'cortado' }] },
        { q: 'How long have you worked here?', a: 'Since the sun got to about there. So: always, and also about an hour.' },
        { q: 'Is it always evening?', a: 'It is always nearly evening. Completely different. Evening is when we close, and we never have.' },
      ],
    },
  });
}
