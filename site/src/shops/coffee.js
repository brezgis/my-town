// Slow Hand Coffee  (north side; 301 Mulberry Street, Madison, Indiana: 23 ft wide by 42.7 deep inside)
// A long narrow coffee bar. The counter runs down the left side: a copper-domed lever machine, the
// grinder, a glass case of pastry, a brass till; behind it one shelf of cups and the slate menu.
// Right of the door a window bar with three stools; two small tables on the right wall; a rug and
// two armchairs at the back. The rest is plain wall. Juniper is behind the bar.
// Readable things, three in all: the menu slate, the tip jar card, the board on the pavement.
import { tools, fixtures } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, slate, chalk, paper, line, ICON } from '../draw.js';

const OAK = 'oak_light#a3825c', WALNUT = 'fir#7d5b45', GREEN = 'painted_wood#4d6f60', CREAM = 'painted_wood#e6dcc6', COPPER = 'c#b06a3c/0.32/1', CHROME = 'c#d4d6d8/0.12/1', PORC = 'c#ebe6dc/0.18', BLACK = 'c#17140f/0.3';

const MENU = (g, w, h) => {
  slate(g, w, h, '#232826', 7);
  chalk(g, 'Slow Hand', w * 0.5, h * 0.11, h * 0.13, '#f1efe6'); line(g, [[w * 0.36, h * 0.19], [w * 0.64, h * 0.19]], '#e9c46a', 3);
  const col = (x, title, rows, c) => { chalk(g, title, x, h * 0.3, h * 0.085, c, { a: 'left' }); rows.forEach(([n, p], i) => { chalk(g, n, x, h * (0.42 + i * 0.105), h * 0.068, '#efe9da', { a: 'left' }); chalk(g, p, x + w * 0.27, h * (0.42 + i * 0.105), h * 0.068, '#efe9da', { a: 'right' }); }); };
  col(w * 0.04, 'espresso', [['espresso', '3'], ['cortado', '4'], ['flat white', '4½'], ['oat latte', '5'], ['cardamom latte', '5½']], '#e9c46a');
  col(w * 0.365, 'slow', [['pour-over', '5'], ['vietnamese iced', '5'], ['cold brew', '4½'], ['hot chocolate', '4'], ['mint tea', '3']], '#e8a8a0');
  col(w * 0.69, 'to eat', [['croissant', '4'], ['cardamom bun', '4½'], ['jam tart', '3½'], ['carrot cake', '5'], ['toast & good butter', '4']], '#9fc6b0');
  chalk(g, 'robots drink free (they do not drink)', w * 0.5, h * 0.94, h * 0.055, '#9aa39d');
};
const TAG = (txt, c = '#f1e9d6', ink = '#2a1c13') => (g, w, h) => { paper(g, w, h, c); T(g, txt, w / 2, h / 2, h * 0.42, ink, { f: F.caveat, w: 600, max: w * 0.9 }); };

export default function coffee(kit, lot) {
  const K = tools(kit, 31), X = fixtures(kit, K), { ves, ball, tube, jar, plate, cupSaucer, potted } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                        // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D;

  // ---- the bar: down the left side, customers on the right ----------------------------------------------
  const A = 7.6, DC = D * 0.5;                                // the counter's customer edge, and the middle of its length
  const c = at(A, DC, 0, 'right');                            // x runs toward the street; +y is the customers' side
  const TOP = X.counter(c, -7, 7, -2.6, 0, 3.4, { front: GREEN, top: 'marble' });
  c.box(BRASS, -7, 7, 0.18, 0.24, 0.62, 0.68);                // the foot rail
  for (const x of [-6.6, 0, 6.6]) c.box(BRASS, x - 0.03, x + 0.03, 0, 0.21, 0.6, 0.66);
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
    c.soft('c#2a2622/0.35', x - 0.27, x + 0.27, y - 0.32, y + 0.32, z, z + 1.05, 0.08); ves(c, 'glass', x, y, z + 1.05, [[0.08, 0], [0.24, 0.45], [0.25, 0.5], [0, 0.5]], 18); ves(c, 'c#3a2214/0.9', x, y, z + 1.07, [[0.08, 0], [0.2, 0.3], [0, 0.32]], 14); c.cyl(BLACK, x, y, z + 1.55, z + 1.6, 0.25, 0.25, 18);
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
  // the till: brass; and the tip jar
  { const x = -0.8, y = -1.1, z = TOP;
    c.soft('c#b08d4a/0.35/1', x - 0.55, x + 0.55, y - 0.5, y + 0.45, z, z + 0.5, 0.05); c.soft('c#b08d4a/0.35/1', x - 0.5, x + 0.5, y - 0.5, y + 0.1, z + 0.5, z + 1.0, 0.08);
    for (let i = 0; i < 12; i++) c.cyl('c#efe9da/0.3', x - 0.36 + (i % 4) * 0.24, y + 0.2 + Math.floor(i / 4) * 0.08, z + 0.5 + (2 - Math.floor(i / 4)) * 0.05, z + 0.56 + (2 - Math.floor(i / 4)) * 0.05, 0.05, 0.05, 8);
    jar(c, 0.5, -0.5, z, 0.16, 0.42, null, 0, null); for (let i = 0; i < 7; i++) c.cyl('c#b08d4a/0.35/1', 0.5 + (i % 3 - 1) * 0.05, -0.5 + (i % 2) * 0.05, z + 0.02 + i * 0.014, z + 0.032 + i * 0.014, 0.05, 0.05, 8);
    X.card(c, 0.5, -0.22, z, 0.5, 0.26, TAG('for oil & new bearings'));
    lot.pickup = { xz: kit.world(c, 1.5, -0.55), y: lot.fr(kit, 0, 0).h + TOP };       // where finished drinks are set down
  }
  // back bar on the left wall: a counter, one shelf of cups and bean jars, and the slate above
  const b = at(0, DC, 0, 'right');
  X.shelving(b, -6.8, 6.8, [4.9], { d: 1.0, mat: OAK, back: 'tile_subway', block: false });
  b.box(OAK, -6.8, 6.8, 0.02, 1.4, 0, 3.3, G); b.box('marble', -6.9, 6.9, 0.02, 1.5, 3.3, 3.4); b.block(-6.9, 6.9, 0, 1.5, 0, 6.2);
  for (let i = 0; i < 10; i++) cupSaucer(b, -6.2 + i * 0.5, 0.55, 4.9, K.pick([PORC, 'c#c9d6d8/0.25', 'c#2f4a40/0.3', 'c#e3c9b8/0.3']), false);
  for (let i = 0; i < 5; i++) jar(b, 2.6 + i * 0.6, 0.5, 4.9, 0.17, 0.6, K.pick(['c#3a2214/0.9', 'c#4a2a18/0.9', 'c#2a180e/0.9']), 0.4 + K.rnd() * 0.5, BRASS);
  b.box('c#c9ccd0/0.2/1', -3.2, -1.6, 0.25, 1.25, 3.36, 3.41); tube(b, 'c#c9ccd0/0.2/1', [[-2.4, 0.2, 3.4], [-2.4, 0.2, 4.1], [-2.4, 0.6, 4.2], [-2.4, 0.75, 4.0]], 0.035, 8);
  kit.model('vintage_electric_kettle', b, 1.4, 0.7, 3.4, 0, { scale: 0.8 });
  X.slateBoard(b, 0, 8.4, 11, 3.6, MENU, { cw: 1100, ch: 360 });
  for (const x of [-4.5, 0, 4.2]) X.pendant(c, x, -0.9, { kind: 'dome', drop: 4.6, colour: 'c#2f4a40/0.35', power: 1.0 });

  // ---- the window bar, right of the door: three stools facing the street --------------------------------
  const w = at(W - 3.9, 0.02, 0, 'back');
  w.box(OAK, -3.5, 3.5, 0.25, 1.75, 3.25, 3.4, G); for (const x of [-3.2, 3.2]) { w.box('c#2b2724/0.45/1', x - 0.04, x + 0.04, 1.6, 1.68, 0, 3.25); tube(w, 'c#2b2724/0.45/1', [[x, 0.3, 2.4], [x, 1.64, 3.2]], 0.03, 5); }
  w.block(-3.5, 3.5, 0, 1.75, 0, 3.4);
  for (const x of [-2.3, 0, 2.3]) X.stool(w, x, 2.7, 2.35, { label: 'sit at the window' });
  potted(w, 3.0, 0.9, 3.4, { r: 0.22, n: 14, len: 0.7 });
  X.pendant(R, W - 3.9, 2.4, { kind: 'globe', drop: 4.2, power: 0.85 });

  // ---- two small tables on the right wall, across from the bar; the second is left bare ------------------
  for (const [d, laid] of [[DC - 6, true], [DC + 1.5, false]]) {
    const t = at(W - 2.1, d, 0, 'left');                      // +x toward the back: the chairs sit along the wall
    t.cyl('c#2b2724/0.45/1', 0, 0, 0, 0.08, 0.75, 0.8, 18); t.cyl('c#2b2724/0.45/1', 0, 0, 0.08, 2.38, 0.09, 0.09, 10); t.cyl('marble', 0, 0, 2.38, 2.5, 1.25, 1.25, 28); t.block(-1, 1, -1, 1, 0, 2.5);
    kit.model('st_dining_chair_3', t, -1.9, 0, 0, 1, { seat: 1.5 }); kit.model('st_dining_chair_3', t, 1.9, 0, 0, 3, { seat: 1.5 });
    if (laid) kit.posy(t, 0.2, 0.3, 2.5);
    X.pendant(t, 0, 0, { kind: 'globe', drop: 4.2, power: 0.85 });
  }
  // ---- the sitting corner at the back: a rug, two armchairs, a lamp ---------------------------------------
  kit.rug(...(() => { const [X0, Y0] = lot.XY(W - 10.5, D - 10.2), [X1, Y1] = lot.XY(W - 0.7, D - 0.9); return [Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1)]; })(), lot.fr(kit, 0, 0).h, 'kilim');
  const k = at(W, D - 6.2, 0, 'left');                         // on the right wall: +x toward the back
  kit.model('st_armchair_4_green', k, -2.4, 2.2, 0, 0, { seat: 1.35, turn: 0.25 });
  kit.model('round_wooden_table_02', k, 0.6, 3.6, 0, 0, { collide: true }); kit.floorLamp(k, 3.6, 1.3);
  kit.model('st_armchair_4_green', k, 2.6, 5.4, 0, 2, { seat: 1.35, turn: 0.5 });
  kit.candle(k, 0.6, 3.6, 2.46, 0.4);
  // one hanging plant in the left window, one big plant in the back corner; the rest of the walls are plain
  R.cyl('c#1d1b18/0.8', 4.5, 2.6, 8.6, 12, 0.012, 0.012, 4); potted(R, 4.5, 2.6, 8.2, { r: 0.42, h: 0.5, n: 20, len: 2.2, up: 0.1, out: 0.5, droop: 1.6, pot: 'c#e8e2d4/0.45' });
  kit.pottedPlant(R, 1.6, D - 1.6, 0, 'leafy', { size: 1.5 });

  // ---- out on the pavement: one bistro set under the awning, the board --------------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));           // x = a along the frontage, y = -feet out from the shopfront
  kit.model('outdoor_table_chair_set_01', o, 4.5, -2.6, 0, 1, { outdoor: true, collide: true });
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.4, 5.2, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h); chalk(g, 'today', w / 2, h * 0.12, h * 0.1, '#e9c46a'); ICON.cup(g, w / 2, h * 0.36, h * 0.22, '#f1efe6'); chalk(g, 'cardamom latte', w / 2, h * 0.64, h * 0.09); chalk(g, 'warm buns at 4', w / 2, h * 0.8, h * 0.085, '#9fc6b0'); });

  // ---- Juniper ------------------------------------------------------------------------------------------------
  const behind = x => kit.world(c, x, -3.3);                   // the aisle behind the counter
  kit.clerks.push({
    id: 'juniper', name: 'Juniper', lot: 'coffee', look: { shape: 'egg', colour: '#2f5a4a', belly: '#efe4cf', trim: '#c9a45c', hat: 'beanie', hatColour: '#b8452e', apron: '#3a2a20', eye: '#ffe2b0', ring: 0x9fe0c0, tool: 'cup', hover: 4.7 },
    home: behind(0.8), faces: kit.world(c, 0.8, 8), posts: [behind(5.2), behind(-3.6), behind(0.8)],
    serve: { machine: behind(3.4), pickup: lot.pickup },
    lines: {
      greet: ['Hello, you. Sit anywhere.', 'Coffee? It takes as long as it takes.'],
      idle: ['*wipes the steam wand, tenderly*', 'I dialled in the grinder this morning. It was emotional.', '*hums along with the fridge*'],
      bye: ['Mind the kerb.', 'Come back before sunset. You have ages.'],
      topics: [
        { q: 'A flat white, please.', a: 'Watch the pour. I am practising a swan. It is still a turnip.', serve: 'flat white' },
        { q: 'Cà phê sữa đá?', a: 'Phin, condensed milk, a lot of ice. Give me a moment and no advice.', serve: 'cà phê sữa đá' },
        { q: 'What do you recommend?', a: 'The cortado. Small, strong, no notes.', serve: 'cortado' },
        { q: 'How long have you worked here?', a: 'Since the sun got to about there.' },
        { q: 'Is it always evening?', a: 'Nearly evening. Evening is when we close.' },
      ],
    },
  });
}
