// Wick & Sundry  (313 Mulberry Street: north side, about 19 ft wide by 43 deep): candles · soap
// A long narrow chandler's, lit by lamps: like the inside of a nice drawer. From the door back:
// two small window displays; the testing table across the front half under two paper lanterns (ten
// jar candles to light, each with its name); boxed candles and matches on the right wall beside it;
// the drawer chest with one shelf of bottles on the left wall; the soap slab and basin on the right;
// the counter across the back, with Ember behind it and the one poster over the cupboard.
// Lightable candles: 10 jars on the table, 3 pillars in the left window, 1 pillar on the chest,
// 1 by the basin, 1 taper on the counter = 16. The quiet find is the drawer marked "open me".
import { tools, fixtures, snapMat } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, grain, disc, rect, para, ICON } from '../draw.js';

const WALNUT = 'fir#8a6548', DRAWER = 'fir#a37b58', NAVYP = 'painted_wood#3a4868';
const INK = '#26314a', CREAM = '#ece2c8', RUST = '#b8452e', PAPER = '#efe6cf';
const AMBER = 'c#8a5a2a/0.15', BLUE = 'c#2a63b8/0.15', CORK = 'c#b08a5a/0.8', ENAMEL = 'c#f4f1ea/0.2', TWINE = 'c#c9b48a/0.8';

// ---- things drawn ------------------------------------------------------------------------------------------
const TAG = (txt, c = PAPER, ink = INK) => (g, w, h) => { paper(g, w, h, c); T(g, txt, w / 2, h / 2, h * 0.42, ink, { f: F.caveat, w: 600, max: w * 0.92 }); };
const NAME = name => (g, w, h) => { paper(g, w, h, PAPER, name.length); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6); T(g, name, w / 2, h * 0.54, h * 0.46, INK, { f: F.fraunces, it: 1, w: 600, max: w * 0.9 }); };
const BOX = (name, c, ink = CREAM) => (g, w, h) => { fill(g, w, h, c); grain(g, w, h, 0.05); g.strokeStyle = ink; g.lineWidth = 2; g.strokeRect(5, 5, w - 10, h - 10); ICON.candle(g, w / 2, h * 0.3, h * 0.34, ink); T(g, name, w / 2, h * 0.62, h * 0.115, ink, { f: F.fraunces, it: 1, w: 600, max: w * 0.84 }); T(g, 'WICK & SUNDRY', w / 2, h * 0.84, h * 0.07, ink, { f: F.bebas, ls: 1, max: w * 0.84 }); };
const DRAWERLABEL = txt => (g, w, h) => { paper(g, w, h, '#e9dfc4', txt.length); g.strokeStyle = '#6a4a2a'; g.lineWidth = 2; g.strokeRect(2, 2, w - 4, h - 4); T(g, txt, w / 2, h * 0.54, h * 0.5, '#2a1c13', { f: F.elite, max: w * 0.9 }); };
const BOTTLELABEL = txt => (g, w, h) => { paper(g, w, h, PAPER, txt.length + 1); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6); const ls = txt.split('\n'); ls.forEach((s, i) => T(g, s, w / 2, h * (0.5 + (i - (ls.length - 1) / 2) * 0.3), h * 0.27, INK, { f: F.caveat, w: 600, max: w * 0.86 })); };
const MATCH = (name, icon, c, ink = CREAM) => (g, w, h) => { fill(g, w, h, c); grain(g, w, h, 0.07); g.strokeStyle = ink; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, h - 10); disc(g, w / 2, h * 0.5, h * 0.27, ink); ICON[icon](g, w / 2, h * 0.5, h * 0.4, c); T(g, name, w / 2, h * 0.14, h * 0.13, ink, { f: F.bebas, ls: 2, max: w * 0.84 }); };
const SOAPBAND = (name, ink = INK) => (g, w, h) => { paper(g, w, h, PAPER, name.length); rect(g, 0, 0, w, 4, ink); rect(g, 0, h - 4, w, 4, ink); const ls = name.split('\n'); ls.forEach((s, i) => T(g, s, w / 2, h * (0.5 + (i - (ls.length - 1) / 2) * 0.26), h * 0.22, ink, { f: F.fraunces, it: 1, w: 600, max: w * 0.9 })); };
const CARD = (...ls) => (g, w, h) => { paper(g, w, h, PAPER, 8); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(8, 8, w - 16, h - 16); ls.forEach((s, i) => T(g, s, w / 2, h * (0.5 + (i - (ls.length - 1) / 2) * 0.3), h * 0.2, INK, { f: F.fraunces, w: 600, max: w * 0.86 })); };
function BURN(g, w, h) {
  paper(g, w, h, '#e9dfc6', 12); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(12, 12, w - 24, h - 24);
  T(g, 'HOW TO BURN A CANDLE', w / 2, h * 0.14, h * 0.1, INK, { f: F.bebas, ls: 4, max: w * 0.8 });
  const rows = [['1', 'The first time, let the wax melt right to the edge.'], ['2', 'Trim the wick to a quarter of an inch.'], ['3', 'Keep it out of a draught.'], ['4', 'Never leave it alone. It gets ideas.']];
  rows.forEach(([n, s], i) => { const y = h * (0.3 + i * 0.165); disc(g, w * 0.09, y + h * 0.045, h * 0.045, INK); T(g, n, w * 0.09, y + h * 0.048, h * 0.06, CREAM, { f: F.fraunces, w: 600 }); para(g, s, w * 0.16, y, h * 0.058, '#2a1c13', w * 0.78, { f: F.fraunces, it: 1, lh: 1.15 }); });
}

const SCENTS = [
  ['Library Fire', 'c#d9cdb2/0.6'], ['Rain on Hot Pavement', 'c#c9ccd0/0.6'], ['Someone Else’s Laundry', 'c#f4f1ea/0.6'], ['Tomato Leaf', 'c#9fb0a4/0.6'], ['The Good Blanket', 'c#c9a77a/0.6'],
  ['Vesper Street, 6 p.m.', 'c#d9b35a/0.6'], ['Grandmother’s Handbag', 'c#e8907a/0.6'], ['Sunday, About Four', 'c#e8e2d4/0.6'], ['Pencil Case', 'c#e88aa8/0.6'], ['Bread Tomorrow', 'c#c9b48a/0.6'],
];
// top row first, left to right as you face the chest; the last two of the top row are the find
const DRAWERS = ['lavender', 'chamomile', 'rosehip', 'bay', 'do not open', 'open me',
  'cloves', 'orris root', 'calendula', 'thyme', 'rosemary', 'cedar',
  'beeswax', 'wicks, long', 'wicks, short', 'matches', 'sealing wax', 'corks',
  'string', 'twine', 'pins', 'buttons', 'labels', 'receipts'];

export default function apothecary(kit, lot) {
  const K = tools(kit, 47), X = fixtures(kit, K), { ves, hcyl, ball, tube, jar, bottle, bowl, leaves } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                         // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D, MID = W / 2;
  // where things stand down the room
  const dT = D * 0.27, dShelf = dT, dChest = D * 0.5, dSoap = D * 0.66, dCounter = D - 7.5;
  const pack = (f, x, y, z, w, d, tall, col, draw, o) => kit.pack(f, x, y, z, w, d, tall, snapMat(col), draw, o);
  const boxed = (f, x, z, i, y = 0.5) => { const s = SCENTS[i % SCENTS.length], c = ['#26314a', '#8a1c1c', '#2f4a2a'][i % 3]; pack(f, x, y, z, 0.5, 0.5, 0.62, `c${c}/0.8`, BOX(s[0], c), { cw: 104, ch: 128 }); };
  // a glass bottle with a hand-lettered label on its front
  const flask = (f, x, y, z, col, name, o = {}) => { const r = o.r ?? 0.15, h = o.h ?? 0.95; bottle(f, x, y, z, { r, h, col, neck: 0.05, cap: o.cap ?? CORK }); if (name) kit.sign(f, x, y + r + 0.006, z + h * 0.33, r * 1.5, h * 0.34, BOTTLELABEL(name), { cw: 96, ch: Math.round(96 * h * 0.34 / (r * 1.5)) }); };
  // a turned wooden stand
  const stand = (f, x, y, z, h, r = 0.28) => ves(f, WALNUT, x, y, z, [[0, 0], [r, 0], [r, 0.05], [r * 0.4, 0.12], [r * 0.3, h - 0.16], [r * 0.9, h - 0.06], [r, h - 0.04], [r, h], [0, h]], 16);
  // a stack of banded soap; its name lies on top
  const soap = (f, x, y, z0, n, col, name) => { for (let i = 0; i < n; i++) { const z = z0 + i * 0.135; f.soft(col, x - 0.23, x + 0.23, y - 0.14, y + 0.14, z, z + 0.13, 0.02); f.box('c#efe2bc/0.8', x - 0.15, x + 0.15, y - 0.143, y + 0.143, z + 0.002, z + 0.133); } if (name) kit.sign(f, x, y, z0 + n * 0.135 + 0.003, 0.3, 0.28, SOAPBAND(name), { flat: true, cw: 108, ch: 100 }); };

  // ---- the two windows: a low navy plinth each, a few things on it -------------------------------------------
  const win = ac => { const w = at(ac, 1.25, 0, 'street'); w.box(NAVYP, -2.7, 2.7, -1.0, 1.0, 0, 2.0); w.block(-2.7, 2.7, -1.0, 1.0, 0, 3); return w; };   // +y toward the street, +x toward smaller a
  { const w = win(3.2);                                           // left: three pillars to light, and the card
    for (const [x, y, h, tall, wax] of [[1.75, 0.2, 0.7, 0.8, 'c#efe6d2/0.6'], [0.8, -0.05, 1.35, 1.0, 'c#d9b35a/0.6'], [-0.15, 0.3, 0.4, 0.6, 'c#efe6d2/0.6']]) { stand(w, x, y, 2.0, h); kit.pillarCandle(w, x, y, 2.0 + h, tall, 0.17, wax); }
    w.box(WALNUT, -2.45, -0.95, 0.28, 0.52, 2.0, 2.07, G);
    kit.sign(w, -1.7, 0.4, 2.6, 1.4, 1.0, CARD('candles that smell', 'like somewhere.'), { cw: 300, ch: 214, tilt: 0.12, rough: 0.9 });
    kit.sign(w, -1.7, 0.39, 2.6, 1.4, 1.0, (g, cw, ch) => paper(g, cw, ch, PAPER, 8), { cw: 64, ch: 46, tilt: -0.12, turn: Math.PI, rough: 0.9 }); }
  { const w = win(W - 3.2);                                       // right: a lamp, two bottles, soap, lavender in a jar
    kit.tableLamp(w, -1.9, -0.2, 2.0, 'c#8a5a2a/0.4', { shade: 'pleat' });
    flask(w, -0.75, 0.1, 2.0, AMBER, 'rose\nwater', { h: 1.05 }); flask(w, -0.3, 0.35, 2.0, BLUE, 'bay rum', { h: 0.85 });
    soap(w, 0.75, 0.3, 2.0, 3, 'c#c9b48a/0.8'); soap(w, 1.3, 0.15, 2.0, 1, 'c#9fb0a4/0.8');
    jar(w, 2.1, -0.2, 2.0, 0.2, 0.55, null, 0, null); leaves(w, 2.1, -0.2, 2.05, { n: 14, len: 1.3, w: 0.016, up: 1, out: 0.22, droop: 0.1, spread: 0.08, col: ['c#8a5ab0/0.8', 'c#7fa04a/0.8'] }); }

  // ---- the testing table: ten jars to light, under two paper lanterns ----------------------------------------
  kit.rug(...(() => { const [X0, Y0] = lot.XY(MID - 4.6, dT - 3.2), [X1, Y1] = lot.XY(MID + 4.6, dT + 3.2); return [Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1)]; })(), lot.fr(kit, 0, 0).h, 'tabriz');
  const tF = at(MID, dT, 0, 'street'), tB = at(MID, dT, 0, 'back'), TT = 2.7;
  X.plinth(tF, 0, 0, 6.2, 3.4, TT, { mat: WALNUT });
  [tF, tB].forEach((f, side) => {
    for (let i = 0; i < 5; i++) {
      const [name, wax] = SCENTS[side * 5 + i], x = 2.44 - i * 1.22;
      kit.jarCandle(f, x, 1.12, TT, { r: 0.2, tall: 0.42, wax, label: 'c#efe2bc/0.8' });
      kit.sign(f, x, 1.54, TT + 0.004, 1.0, 0.27, NAME(name), { flat: true, cw: 252, ch: 68 });
    }
  });
  X.card(tF, 0, 0.1, TT, 1.7, 0.3, TAG('the testing table. light anything.'));
  // a dish of matches and the snuffer; the rest of the top is left bare
  K.plate(tF, -1.5, 0, TT, 0.22, 'c#b08d4a/0.35/1'); tF.box('c#8a1c1c/0.8', -1.67, -1.33, -0.11, 0.11, TT + 0.03, TT + 0.09);
  tube(tF, BRASS, [[1.3, -0.05, TT + 0.02], [1.75, 0.05, TT + 0.02]], 0.012, 5); ves(tF, BRASS, 1.3, -0.05, TT, [[0.07, 0], [0.05, 0.1], [0, 0.12]], 10);
  X.pendant(R, MID - 1.9, dT, { kind: 'paper', drop: 4.7, power: 0.8 }); X.pendant(R, MID + 1.9, dT, { kind: 'paper', drop: 4.7, power: 0.8 });

  // ---- right wall beside the table: one calm run of boxed candles, and the matches ---------------------------
  const S = at(W, dShelf, 0, 'left');                             // on the right wall: +x toward the back, +y into the room
  X.shelving(S, -3.0, 3.0, [1.2, 2.6, 4.0, 5.4], { d: 1.0, mat: WALNUT, back: NAVYP, bay: 3 });
  for (let i = 0; i < 5; i++) S.cyl(['c#efe6d2/0.6', 'c#d9b35a/0.6'][i % 2], -2.4 + i * 0.55, 0.5, 1.2, 1.85 + (i % 3) * 0.12, 0.2, 0.2, 14);       // plain pillars
  for (let i = 0; i < 8; i++) { boxed(S, -2.42 + i * 0.69, 2.6, i); boxed(S, -2.42 + i * 0.69, 5.4, i + 5); }
  [['NORTH STAR', 'star', '#26314a'], ['SUNRISE', 'sun', '#b8361f'], ['LAST CANDLE', 'candle', '#2f4a2a'], ['BAY LEAF', 'leaf', '#c9952a'], ['TEACUP', 'cup', '#4a2240']]
    .forEach(([n, ic, c], i) => pack(S, -2.4 + i * 0.62, 0.5, 4.0, 0.5, 0.14, 0.36, `c${c}/0.8`, MATCH(n, ic, c), { cw: 150, ch: 108 }));

  // ---- left wall: the drawer chest, one shelf of bottles ------------------------------------------------------
  const L = at(0, dChest, 0, 'right');                            // on the left wall: +x toward the street, +y into the room
  L.box('c#2b2724/0.8', -3.55, 3.55, 0.1, 1.6, 0, 0.3); L.box(WALNUT, -3.65, 3.65, 0.02, 1.7, 0.3, 3.5, G); L.box(WALNUT, -3.75, 3.75, 0.02, 1.82, 3.5, 3.6, G); L.block(-3.65, 3.65, 0, 1.7, 0, 3.6);
  { const cols = 6, rows = 4, dw = 7.2 / cols, dh = 3.1 / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x0 = -3.6 + c * dw + 0.04, x1 = x0 + dw - 0.08, xm = (x0 + x1) / 2, z0 = 0.36 + r * dh + 0.03, z1 = z0 + dh - 0.06, name = DRAWERS[(rows - 1 - r) * cols + (cols - 1 - c)];
      L.box(DRAWER, x0, x1, 1.7, 1.75, z0, z1, G); hcyl(L, BRASS, 'y', xm, 1.79, z0 + 0.19, 0.08, 0.045, 0.035, 8);
      L.box(BRASS, xm - 0.36, xm + 0.36, 1.75, 1.757, z1 - 0.37, z1 - 0.09);
      kit.sign(L, xm, 1.762, z1 - 0.23, 0.66, 0.22, DRAWERLABEL(name), { cw: 156, ch: 52 });
      if (name === 'open me') { const [wx, wz] = kit.world(L, xm, 1.8), wy = L.h + (z0 + z1) / 2;
        kit.later.push(ctx => ctx.interact.push({ x: wx, y: wy, z: wz, reach: 5, size: 0.7, label: () => 'open the drawer', act: () => { try { ctx.sound.note(79, 0, 0.5, 0.02); ctx.flash('One birthday candle. Somebody has been saving it.'); } catch { /* a drawer is not worth a crash */ } } })); }
    } }
  // on the chest: the lamp, the scales, a mortar, one pillar
  const CT = 3.6;
  kit.tableLamp(L, 2.9, 0.9, CT, 'c#8a5a2a/0.4', { base: 'gourd' });
  kit.model('st_brass_scales', L, 0.9, 0.8, CT, 0);
  bowl(L, -1.2, 1.0, CT, 0.3, 0.3, 'c#9a9590/0.8', 16); tube(L, 'c#9a9590/0.8', [[-1.2, 1.0, CT + 0.1], [-0.95, 0.9, CT + 0.55]], 0.045, 6, true);
  kit.pillarCandle(L, -2.9, 0.9, CT, 0.6, 0.16, 'c#d9b35a/0.6');
  // above it: one shelf of bottles
  L.box(NAVYP, -3.75, 3.75, 0.01, 0.05, 3.6, 7.4);
  { const z = 5.6; L.box(WALNUT, -3.6, 3.6, 0.05, 0.95, z - 0.08, z, G); for (const x of [-3.2, 0, 3.2]) tube(L, BRASS, [[x, 0.07, z - 0.5], [x, 0.8, z - 0.08]], 0.02, 5);
    ['rose water', 'witch hazel', 'bay rum', 'oil of\ncedar', 'arnica', 'orange\nblossom', 'vetiver', 'vinegar of\nfour thieves']
      .forEach((n, i) => flask(L, 3.1 - i * 0.72, 0.5, z, i % 3 === 2 ? BLUE : AMBER, n, { h: 0.85 + (i % 3) * 0.1, r: 0.15 + (i % 2) * 0.02 }));
    for (let i = 0; i < 2; i++) jar(L, -2.75 - i * 0.55, 0.5, z, 0.2, 0.6, ['c#c9b48a/0.8', 'c#8a5ab0/0.8'][i], 0.7, CORK); }

  // ---- right wall, further back: soap on the marble slab, the basin ------------------------------------------
  const Rt = at(W, dSoap, 0, 'left');
  const ST = X.plinth(Rt, 0, 1.07, 5.4, 2.0, 2.8, { mat: WALNUT, top: 'marble', shelf: 1.0 });
  [['c#c9b48a/0.8', 'oatmeal'], ['c#9fb0a4/0.8', 'sea\nfennel'], ['c#2b2724/0.8', 'coal tar'], ['c#e88aa8/0.8', 'rose'], ['c#e8c73a/0.8', 'lemon\n& sage'], ['c#8a5ab0/0.8', 'lavender']]
    .forEach(([c, n], i) => soap(Rt, 0.15 + (i % 3) * 0.8, 0.55 + Math.floor(i / 3) * 0.72, ST, 2 + ((i * 3) % 4), c, n));
  X.card(Rt, 0.95, 1.85, ST, 1.7, 0.32, TAG('soap by the bar · cut on thursdays'));
  { const x = -1.6, y = 1.05;                                      // the basin: enamel, navy rim, a jug, a towel, the card
    bowl(Rt, x, y, ST, 0.6, 0.32, ENAMEL, 24); ves(Rt, 'c#26364f/0.45', x, y, ST + 0.305, [[0.575, 0], [0.615, 0], [0.615, 0.03], [0.575, 0.03]], 24); Rt.cyl('c#9fb0d8/0.2', x, y, ST + 0.19, ST + 0.2, 0.5, 0.5, 20);
    kit.model('metal_jug', Rt, -0.6, 0.5, ST, 0, { scale: 0.62 });
    kit.foldedStack(Rt, 2.3, 1.0, ST, 2, ['c#e8e2d4/0.8', 'c#9fb0a4/0.8'], { w: 0.5, d: 0.7 });
    Rt.box(WALNUT, x - 0.7, x + 0.7, 0.12, 0.3, ST, ST + 0.06, G);
    kit.sign(Rt, x, 0.3, ST + 0.55, 1.3, 0.8, CARD('wash your hands.', 'tell Ember what you think.'), { cw: 300, ch: 184, tilt: 0.1, rough: 0.9 });
    kit.pillarCandle(Rt, -2.4, 1.55, ST, 0.5, 0.14); }
  kit.foldedStack(Rt, -1.2, 1.1, 1.0, 4, ['c#e8e2d4/0.8', 'c#26364f/0.8', 'c#e8e2d4/0.8', 'c#9fb0a4/0.8']);
  kit.model('wicker_basket_01', Rt, 1.2, 1.1, 1.0, 0, { scale: 0.9 });
  X.pendant(Rt, 0, 1.3, { kind: 'bulb', drop: 5.6, power: 0.6 });

  // ---- the counter, across the back ---------------------------------------------------------------------------
  const c = at(MID, dCounter, 0, 'street');                       // +x toward smaller a; +y is the customers' side
  const TOP = X.counter(c, -4.5, 4.5, -2.0, 0, 3.4, { front: NAVYP, top: WALNUT });
  { const x = -3.2, y = -1.05, z = TOP;                            // the brass till
    c.soft('c#b08d4a/0.35/1', x - 0.55, x + 0.55, y - 0.5, y + 0.45, z, z + 0.5, 0.05); c.soft('c#b08d4a/0.35/1', x - 0.5, x + 0.5, y - 0.5, y + 0.1, z + 0.5, z + 1.0, 0.08);
    for (let i = 0; i < 12; i++) c.cyl('c#efe9da/0.3', x - 0.36 + (i % 4) * 0.24, y + 0.2 + Math.floor(i / 4) * 0.08, z + 0.5 + (2 - Math.floor(i / 4)) * 0.05, z + 0.56 + (2 - Math.floor(i / 4)) * 0.05, 0.05, 0.05, 8);
    kit.sign(c, x, y + 0.11, z + 0.78, 0.7, 0.3, (g, w, h) => { fill(g, w, h, '#17140f'); T(g, 'THANK YOU', w / 2, h / 2, h * 0.5, '#e9c46a', { f: F.bebas, ls: 3, max: w * 0.9 }); }, { cw: 128, ch: 56 }); }
  { const x = -1.8, y = -0.55; c.cyl('c#2b2724/0.45', x, y, TOP, TOP + 0.04, 0.2, 0.2, 14); ves(c, BRASS, x, y, TOP + 0.04, [[0.17, 0], [0.16, 0.06], [0.1, 0.13], [0.03, 0.16], [0.03, 0.2], [0, 0.2]], 16); }   // the bell
  kit.candle(c, -0.8, -1.2, TOP, 0.75);
  // wrapping: a few sheets of tissue, the kraft roll on its cradle, twine, one parcel waiting
  ['c#f4f1ea/0.8', 'c#e88aa8/0.8', 'c#efe2bc/0.8'].forEach((col, i) => c.box(col, 0.2 + i * 0.03, 1.5 + i * 0.03, -1.5 + i * 0.04, -0.5 + i * 0.04, TOP + i * 0.012, TOP + i * 0.012 + 0.011));
  { const z = TOP + 0.3; for (const x of [1.95, 3.95]) c.box(WALNUT, x - 0.04, x + 0.04, -1.85, -1.35, TOP, z + 0.1, G); hcyl(c, 'c#c9a77a/0.8', 'x', 2.95, -1.6, z, 1.8, 0.22, 0.22, 14); hcyl(c, WALNUT, 'x', 2.95, -1.6, z, 2.1, 0.03, 0.03, 6); }
  ball(c, TWINE, 4.0, -0.5, TOP, 0.14, 10);
  c.box('c#c9a77a/0.8', 2.5, 3.3, -0.95, -0.35, TOP, TOP + 0.4); c.box('c#8a1c1c/0.8', 2.85, 2.95, -0.955, -0.345, TOP, TOP + 0.405);
  X.pendant(c, -2.4, -0.9, { kind: 'bulb', drop: 5.0, power: 0.7 });

  // behind the counter: a low cupboard with a lamp on it, and the one poster
  const b = at(MID, D, 0, 'street');
  b.box(WALNUT, -5.5, 5.5, 0.02, 1.25, 0, 3.2, G); b.box(WALNUT, -5.6, 5.6, 0.02, 1.35, 3.2, 3.3, G); b.block(-5.5, 5.5, 0, 1.3, 0, 3.3);
  for (let i = 0; i < 5; i++) { const x0 = -5.5 + i * 2.2; b.box(DRAWER, x0 + 0.1, x0 + 2.1, 1.25, 1.29, 0.35, 3.05, G); hcyl(b, BRASS, 'y', x0 + 1.85, 1.33, 1.9, 0.08, 0.04, 0.03, 8); }
  kit.tableLamp(b, 4.4, 0.7, 3.3, 'c#8a5a2a/0.4', { base: 'gourd', shade: 'empire' });
  for (let i = 0; i < 3; i++) jar(b, -4.6 + i * 0.8, 0.65, 3.3, 0.28, 0.8, ['c#e88aa8/0.8', 'c#f4f1ea/0.8', 'c#9fb0d8/0.8'][i], 0.7, 'c#b08d4a/0.35/1');
  kit.posy(b, -1.6, 0.7, 3.3);
  b.box(NAVYP, -5.6, 5.6, 0.01, 0.05, 3.3, 9.6);
  b.box('c#17140f/0.45', -2.25, 2.25, 0.05, 0.11, 5.6, 8.7); kit.sign(b, 0, 0.12, 7.15, 4.3, 2.9, BURN, { cw: 600, ch: 404 });

  // ---- out on the pavement: a bench under the right window, a lantern, the board ------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));              // x = a along the frontage, y = -feet out from the shopfront
  kit.model('painted_wooden_bench', o, W - 3.6, -1.25, 0, 2, { outdoor: true, collide: true, seat: 1.45 });
  kit.model('Lantern_01', o, 5.4, -0.9, 0, 0, { outdoor: true, scale: 1.3 }); kit.lampAt(o, 5.4, -0.9, 0.7, 0.35);
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.6, 5.2, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h, '#232a3c'); chalk(g, 'today it smells of', w / 2, h * 0.12, h * 0.075, '#e9c46a'); ICON.candle(g, w / 2, h * 0.34, h * 0.26, '#f1efe6', '#e9c46a'); chalk(g, 'RAIN ON', w / 2, h * 0.58, h * 0.1); chalk(g, 'HOT PAVEMENT', w / 2, h * 0.7, h * 0.1); chalk(g, 'come in & light something', w / 2, h * 0.88, h * 0.068, '#e8a8a0', { max: w * 0.9 }); });

  // ---- Ember, the chandler ------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'ember', name: 'Ember', lot: 'apothecary', look: { shape: 'round', colour: '#34405a', belly: '#efe4cf', trim: '#c9a45c', scarf: '#c8552e', hat: 'none', eye: '#ffd9a0', ring: 0xffc878, blush: true, tool: 'candle', hover: 4.7 },
    home: lot.world(MID, D - 3.4), faces: lot.world(MID, dT), posts: [lot.world(MID - 3, D - 3.4), lot.world(MID + 3, D - 3.4), lot.world(MID, D - 3.4)],
    lines: {
      greet: ['Hello. Come in slowly.', 'Welcome. Nothing is lit yet. That is what you are for.'],
      idle: ['*trims a wick*', 'Beeswax remembers the bees.', '*holds a candle up to the lamp, then puts it back*'],
      bye: ['Go gently.', 'Blow out what you lit. Or do not. I like the company.'],
      topics: [
        { q: 'Can I really light these?', a: 'Please. Walk up to a wick and press E. There are sixteen. I counted twice.' },
        { q: 'Which one is your favourite?', a: 'Vesper Street, 6 p.m. Warm brick, and the lamps coming on.' },
        { q: 'Tell me about the soap.', a: 'Cut on Thursdays. Try the basin and tell me how it smells. I have no nose.' },
        { q: 'What is in the drawers?', a: 'Lavender, wicks, string. One of them says “open me”. I would.' },
        { q: 'Could you wrap something?', a: 'Tissue, paper, twine. It takes four minutes and I enjoy all of them.' },
      ],
    },
  });
}
