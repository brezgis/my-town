// Wick & Sundry  (313 Mulberry Street: north side, about 19 ft wide by 43 deep): candles · soap
// An old chandler's and apothecary, deep blue and dark wood, lit by lamps. From the door back:
//   the two window displays; then the front shop, both side walls lined with apothecary cabinets (drawers
//   below, shelves to nine feet above). They break in the middle of the room: on the left for the chimney
//   breast (the building's real chimney is on this wall), its hearth full of candles and the one poster over
//   the mantel; on the right for the marble washstand, the soap and the drying rail. Between them the
//   testing table on its rug, under a line of paper lanterns. Then the counter across, with Ember behind it,
//   and behind her a glazed screen into the pouring room: the dipping rack of tapers hung to cool, the
//   bench with the wax pot and moulds, stock on shelves, crates, the back door.
// Lightable candles: 10 jars on the table, 5 pillars in the hearth, 2 tapers on the mantel, 3 pillars in the
// left window, 1 on the chest, 1 by the basin, 1 taper on the counter, 1 on the bench = 24.
// The quiet find is the drawer marked "open me".
import { tools, fixtures, snapMat } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { arch } from './arch.js';
import { T, F, fill, slate, chalk, paper, grain, disc, rect, para, ICON } from '../draw.js';

const WALNUT = 'fir#8a6548', DRAWER = 'fir#a37b58', NAVYP = 'painted_wood#3a4868', NAVYW = 'plaster#3a4868', OAK = 'oak_light#b89466', KICK = 'c#2b2724/0.8';
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
  const A = arch(kit, lot, K);
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                         // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D, MID = W / 2;
  // where things stand down the room. The ceiling beams are at d = 3.2, 8.4, 13.6 ...: the table, the chimney
  // breast and the washstand share the one at 13.6, and the lanterns hang in the bays between.
  const dT = 13.6, dCounter = 24.8, dP = 31.0, RUN0 = 2.9, RUN1 = 24.6, BAY0 = dT - 2.7, BAY1 = dT + 2.7;
  const pack = (f, x, y, z, w, d, tall, col, draw, o) => kit.pack(f, x, y, z, w, d, tall, snapMat(col), draw, o);
  const boxed = (f, x, z, i, y = 0.5) => { const s = SCENTS[i % SCENTS.length], c = ['#26314a', '#8a1c1c', '#2f4a2a'][i % 3]; pack(f, x, y, z, 0.5, 0.5, 0.62, `c${c}/0.8`, BOX(s[0], c), { cw: 104, ch: 128 }); };
  // a glass bottle with a hand-lettered label on its front
  const flask = (f, x, y, z, col, name, o = {}) => { const r = o.r ?? 0.15, h = o.h ?? 0.95; bottle(f, x, y, z, { r, h, col, neck: 0.05, cap: o.cap ?? CORK }); if (name) kit.sign(f, x, y + r + 0.006, z + h * 0.33, r * 1.5, h * 0.34, BOTTLELABEL(name), { cw: 96, ch: Math.round(96 * h * 0.34 / (r * 1.5)) }); };
  // a turned wooden stand
  const stand = (f, x, y, z, h, r = 0.28) => ves(f, WALNUT, x, y, z, [[0, 0], [r, 0], [r, 0.05], [r * 0.4, 0.12], [r * 0.3, h - 0.16], [r * 0.9, h - 0.06], [r, h - 0.04], [r, h], [0, h]], 16);
  // a stack of banded soap; its name lies on top
  const soap = (f, x, y, z0, n, col, name) => { for (let i = 0; i < n; i++) { const z = z0 + i * 0.135; f.soft(col, x - 0.23, x + 0.23, y - 0.14, y + 0.14, z, z + 0.13, 0.02); f.box('c#efe2bc/0.8', x - 0.15, x + 0.15, y - 0.143, y + 0.143, z + 0.002, z + 0.133); } if (name) kit.sign(f, x, y, z0 + n * 0.135 + 0.003, 0.3, 0.28, SOAPBAND(name), { flat: true, cw: 108, ch: 100 }); };
  // a stoneware crock
  const crock = (f, x, y, z, r, h, col) => ves(f, col, x, y, z, [[0, 0], [r * 0.8, 0], [r, h * 0.16], [r, h * 0.78], [r * 0.74, h * 0.9], [r * 0.8, h], [r * 0.6, h], [0, h * 0.97]], 16);
  // a dried bunch hanging head-down from z
  function bunch(f, x, y, z, kind) {
    const lav = kind === 'lav', n = lav ? 10 : 6, len = lav ? 1.1 : 1.3, stem = lav ? 'c#7fa04a/0.8' : 'c#6a4a2a/0.8';
    for (let i = 0; i < n; i++) {
      const a = i * 2.4, rr = 0.05 + 0.2 * K.rnd(), L = len * (0.8 + 0.25 * K.rnd()), ex = x + Math.cos(a) * rr, ey = y + Math.sin(a) * rr * 0.7;
      tube(f, stem, [[x + Math.cos(a) * 0.02, y + Math.sin(a) * 0.02, z], [x + Math.cos(a) * rr * 0.35, y + Math.sin(a) * rr * 0.25, z - L * 0.5], [ex, ey, z - L]], 0.008, 4);
      if (lav) ball(f, 'c#8a5ab0/0.8', ex, ey, z - L - 0.2, 0.035, 6, 3.2);
      else for (let k = 0; k < 4; k++) ball(f, 'c#9fb0a4/0.8', ex + (k % 2 ? 0.07 : -0.07), ey, z - L * (0.4 + 0.16 * k), 0.075, 6, 0.3);
    }
    f.cyl(TWINE, x, y, z - 0.14, z - 0.05, 0.05, 0.05, 6); f.cyl(TWINE, x, y, z - 0.05, z + 0.13, 0.008, 0.008, 4);
  }

  // ---- the cabinets: a base of drawers 1.7 deep to 3.4, shelves 1.0 deep above it to 9.2, a cornice ------------
  // (all in a frame standing on a side wall: x along the wall, y out into the room)
  const BH = 3.4, BD = 1.7, UD = 1.0, UT = 9.2, SY = 0.52;
  const base = (f, x0, x1, o = {}) => { const h = o.h ?? BH, e0 = o.e0 ?? 0.04, e1 = o.e1 ?? 0.04;
    f.box(KICK, x0 + 0.06, x1 - 0.06, 0.1, BD - 0.1, 0, 0.3); f.box(WALNUT, x0, x1, 0.02, BD, 0.3, h - 0.1, G);
    f.box(o.top ?? WALNUT, x0 - e0, x1 + e1, 0.02, BD + 0.1, h - 0.1, h, G); f.block(x0, x1, 0, BD, 0, h); return h; };
  const drawers = (f, x0, x1, rows = 3, z0 = 0.36, z1 = BH - 0.14) => { const cols = Math.max(1, Math.round((x1 - x0) / 1.4)), dw = (x1 - x0) / cols, dh = (z1 - z0) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const a = x0 + c * dw + 0.05, b = a + dw - 0.1, xm = (a + b) / 2, p = z0 + r * dh + 0.035, q = p + dh - 0.07;
      f.box(DRAWER, a, b, BD, BD + 0.05, p, q, G); hcyl(f, BRASS, 'y', xm, BD + 0.09, (p + q) / 2 - 0.14, 0.08, 0.045, 0.035, 8); f.box(BRASS, xm - 0.2, xm + 0.2, BD + 0.05, BD + 0.057, q - 0.27, q - 0.13); } };
  const uppers = (f, x0, x1, zs = [5.0, 6.5, 8.0]) => { const n = Math.max(1, Math.round((x1 - x0) / 2.8));
    f.box(NAVYP, x0, x1, 0.01, 0.05, BH, UT, G);
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, a = i === 0 ? x : i === n ? x - 0.1 : x - 0.05; f.box(WALNUT, a, a + 0.1, 0.05, UD, BH, UT, G); }
    for (const z of zs) f.box(WALNUT, x0 + 0.1, x1 - 0.1, 0.05, UD - 0.02, z - 0.09, z, G);
    f.box(WALNUT, x0 - 0.06, x1 + 0.06, 0.02, UD + 0.08, UT, UT + 0.14, G); f.box(WALNUT, x0 - 0.12, x1 + 0.12, 0.02, UD + 0.16, UT + 0.14, UT + 0.24, G);
    return n; };
  // where things stand along a run of n bays: `per` to a bay, clear of the uprights
  const spots = (x0, x1, n, per, m = 0.32) => { const out = []; for (let i = 0; i < n; i++) { const a = x0 + (x1 - x0) * i / n + m, b = x0 + (x1 - x0) * (i + 1) / n - m; for (let k = 0; k < per; k++) out.push(per === 1 ? (a + b) / 2 : a + (b - a) * k / (per - 1)); } return out; };

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
  // the bit of wall beside each window, boarded in the blue
  for (const wall of ['left', 'right']) A.wainscot(wall, 0.3, RUN0 - 0.06, { h: BH, mat: NAVYP, style: 'plain' });

  // ---- the testing table: ten jars to light, lengthwise on its rug under the lanterns -------------------------
  kit.rug(...(() => { const [X0, Y0] = lot.XY(MID - 3.3, dT - 4.8), [X1, Y1] = lot.XY(MID + 3.3, dT + 4.8); return [Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1)]; })(), lot.fr(kit, 0, 0).h, 'tabriz');
  const tA = at(MID, dT, 0, 'left'), tB = at(MID, dT, 0, 'right'), TT = 2.7;      // tA: +x toward the back, +y toward the left wall
  X.plinth(tA, 0, 0, 7.0, 3.4, TT, { mat: WALNUT });
  [tA, tB].forEach((f, side) => {
    for (let i = 0; i < 5; i++) {
      const [name, wax] = SCENTS[side * 5 + i], x = 2.6 - i * 1.3;
      kit.jarCandle(f, x, 1.12, TT, { r: 0.2, tall: 0.42, wax, label: 'c#efe2bc/0.8' });
      kit.sign(f, x, 1.54, TT + 0.004, 1.0, 0.27, NAME(name), { flat: true, cw: 252, ch: 68 });
    }
  });
  X.card(at(MID, dT - 3.1, 0, 'street'), 0, 0, TT, 1.7, 0.3, TAG('the testing table. light anything.'));
  // down the middle: a dish of matches and the snuffer; the rest of the top is left bare
  K.plate(tA, -1.2, 0, TT, 0.22, 'c#b08d4a/0.35/1'); tA.box('c#8a1c1c/0.8', -1.37, -1.03, -0.11, 0.11, TT + 0.03, TT + 0.09);
  tube(tA, BRASS, [[0.9, -0.05, TT + 0.02], [1.35, 0.05, TT + 0.02]], 0.012, 5); ves(tA, BRASS, 0.9, -0.05, TT, [[0.07, 0], [0.05, 0.1], [0, 0.12]], 10);
  // the lanterns: one in each bay of the ceiling, down the middle of the shop
  for (const [d, drop] of [[5.8, 4.3], [11.0, 4.7], [16.2, 4.7], [21.4, 4.3]]) X.pendant(R, MID, d, { kind: 'paper', drop, power: 0.8 });

  // ---- left wall: cabinets, the chimney breast, cabinets -------------------------------------------------------
  // (frames on the left wall: +x toward the street, +y into the room)
  { const c0 = (RUN0 + BAY0) / 2, h = (BAY0 - RUN0) / 2, L = at(0, c0, 0, 'right');     // the apothecary: bottles and jars
    base(L, -h, h); drawers(L, -h, h); const n = uppers(L, -h, h);
    spots(-h, h, n, 2, 0.6).forEach((x, i) => crock(L, x, SY, 8.0, 0.33, 0.8, i % 3 === 1 ? 'c#6a4a2a/0.5' : 'c#d9cdb2/0.7'));
    spots(-h, h, n, 4).forEach((x, i) => bottle(L, x, SY, 6.5, { r: 0.15 + (i % 2) * 0.02, h: 0.9 + (i % 3) * 0.1, col: i % 4 === 3 ? BLUE : AMBER, neck: 0.05, cap: CORK }));
    spots(-h, h, n, 3, 0.45).forEach((x, i) => jar(L, x, SY, 5.0, 0.23, 0.62, ['c#c9b48a/0.8', 'c#8a5ab0/0.8', 'c#9fb0a4/0.8', 'c#e88aa8/0.8', 'c#e8c73a/0.8'][i % 5], 0.7, CORK));
    spots(-h, h, n, 2, 0.6).forEach(x => bottle(L, x, SY, BH, { r: 0.24, h: 1.25, col: AMBER, neck: 0.07, cap: CORK }));
    bowl(L, 0.4, 1.35, BH, 0.26, 0.26, 'c#9a9590/0.8', 16); tube(L, 'c#9a9590/0.8', [[0.4, 1.35, BH + 0.08], [0.62, 1.28, BH + 0.48]], 0.04, 6, true);     // a mortar
    kit.tableLamp(L, h - 0.8, 1.35, BH, 'c#8a5a2a/0.4', { base: 'gourd' }); }
  { const L = at(0, dT, 0, 'right'), O = A.breast('left', dT, { w: 5, out: 1.3, mat: NAVYW, hearth: [2.6, 2.9] }), y = O + 0.004;   // the chimney breast
    for (const s of [-1, 1]) L.box(WALNUT, s * 1.8, s * 1.32, y, y + 0.16, 0.092, 2.92, G);
    L.box(WALNUT, -1.8, 1.8, y, y + 0.16, 2.92, 4.3, G); L.box(WALNUT, -2.1, 2.1, y, y + 0.3, 4.3, 4.5, G); L.box(WALNUT, -2.46, 2.46, y, y + 0.65, 4.5, 4.64, G);
    // the hearth is full of candles
    for (const [x, yy, tall, r, wax] of [[-0.9, 1.72, 1.5, 0.2, 'c#efe6d2/0.6'], [-0.35, 2.1, 0.8, 0.17, 'c#d9b35a/0.6'], [0.22, 1.76, 1.1, 0.2, 'c#efe6d2/0.6'], [0.75, 2.15, 0.55, 0.16, 'c#efe6d2/0.6'], [0.95, 1.68, 0.9, 0.15, 'c#d9b35a/0.6']]) kit.pillarCandle(L, x, yy, 0.09, tall, r, wax);
    L.block(-1.8, 1.8, O, O + 1.3, 0, 1.6);
    // on the mantel two tapers; over it the one poster
    for (const s of [-1, 1]) kit.candle(L, s * 2.1, O + 0.36, 4.64, 0.7);
    L.box('c#17140f/0.45', -2.07, 2.07, y, y + 0.05, 5.82, 8.68); kit.sign(L, 0, y + 0.058, 7.25, 3.9, 2.63, BURN, { cw: 600, ch: 404 }); }
  { const c0 = (BAY1 + RUN1) / 2, h = (RUN1 - BAY1) / 2, L = at(0, c0, 0, 'right');     // the chandler's side: the drawer chest, candles by the row
    base(L, -h, h);
    { const cols = 6, rows = 4, dw = 2 * h / cols, dh = 2.9 / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x0 = -h + c * dw + 0.05, x1 = x0 + dw - 0.1, xm = (x0 + x1) / 2, z0 = 0.36 + r * dh + 0.03, z1 = z0 + dh - 0.06, name = DRAWERS[(rows - 1 - r) * cols + (cols - 1 - c)];
        L.box(DRAWER, x0, x1, BD, BD + 0.05, z0, z1, G); hcyl(L, BRASS, 'y', xm, BD + 0.09, z0 + 0.17, 0.08, 0.045, 0.035, 8);
        L.box(BRASS, xm - 0.36, xm + 0.36, BD + 0.05, BD + 0.057, z1 - 0.36, z1 - 0.08);
        kit.sign(L, xm, BD + 0.062, z1 - 0.22, 0.66, 0.22, DRAWERLABEL(name), { cw: 156, ch: 52 });
        if (name === 'open me') { const [wx, wz] = kit.world(L, xm, BD + 0.1), wy = L.h + (z0 + z1) / 2;
          kit.later.push(ctx => ctx.interact.push({ x: wx, y: wy, z: wz, reach: 5, size: 0.7, label: () => 'open the drawer', act: () => { try { ctx.sound.note(79, 0, 0.5, 0.02); ctx.flash('One birthday candle. Somebody has been saving it.'); } catch { /* a drawer is not worth a crash */ } } })); }
      } }
    const n = uppers(L, -h, h);
    spots(-h, h, n, 1).forEach(x => crock(L, x, SY, 8.0, 0.42, 0.85, 'c#d9cdb2/0.7'));
    spots(-h, h, n, 5).forEach((x, i) => L.cyl(['c#efe6d2/0.6', 'c#d9b35a/0.6', 'c#4a5a80/0.6'][Math.floor(i / 5) % 3], x, SY, 6.5, 6.5 + 0.9 - (i % 5 % 2) * 0.25, 0.15, 0.15, 14));
    spots(-h, h, n, 4).forEach((x, i) => L.cyl('c#efe6d2/0.6', x, SY, 5.0, 5.0 + 0.55 + (i % 4 % 3) * 0.2, 0.2, 0.2, 14));
    spots(-h, h, n, 3, 0.5).forEach((x, i) => { hcyl(L, i % 2 ? 'c#d9b35a/0.6' : 'c#efe6d2/0.6', 'y', x, 0.56, BH + 0.2, 0.9, 0.19, 0.19, 12); hcyl(L, TWINE, 'y', x, 0.8, BH + 0.2, 0.06, 0.196, 0.196, 12); });   // tapers by the bundle
    kit.model('st_brass_scales', L, 1.0, 1.36, BH, 0);
    kit.pillarCandle(L, h - 0.9, 1.36, BH, 0.6, 0.16, 'c#d9b35a/0.6');
    kit.tableLamp(L, -h + 0.8, 1.35, BH, 'c#8a5a2a/0.4', { base: 'gourd' }); }

  // ---- right wall: boxed candles, the washstand, soap and linen ------------------------------------------------
  // (frames on the right wall: +x toward the back, +y into the room)
  { const c0 = (RUN0 + BAY0) / 2, h = (BAY0 - RUN0) / 2, S = at(W, c0, 0, 'left');                 // boxed candles and matches
    base(S, -h, h, { e1: 0 }); drawers(S, -h, h); const n = uppers(S, -h, h);
    spots(-h, h, n, 3, 0.5).forEach((x, i) => boxed(S, x, 8.0, i + 2, SY));
    spots(-h, h, n, 4, 0.42).forEach((x, i) => boxed(S, x, 6.5, i, SY));
    const xs = spots(-h, h, n, 5, 0.4);
    xs.forEach((x, i) => { const b = Math.floor(i / 5); if (b === 1) { const [nm, ic, c] = [['NORTH STAR', 'star', '#26314a'], ['SUNRISE', 'sun', '#b8361f'], ['LAST CANDLE', 'candle', '#2f4a2a'], ['BAY LEAF', 'leaf', '#c9952a'], ['TEACUP', 'cup', '#4a2240']][i % 5]; pack(S, x, SY, 5.0, 0.5, 0.14, 0.36, `c${c}/0.8`, MATCH(nm, ic, c), { cw: 150, ch: 108 }); }
      else S.cyl(['c#efe6d2/0.6', 'c#d9b35a/0.6'][b / 2], x, SY, 5.0, 5.75 + (i % 2) * 0.2, 0.18, 0.18, 14); });
    spots(-h, h, n, 2, 0.6).forEach(x => kit.foldedStack(S, x, SY, BH, 3, ['c#e8e2d4/0.8', 'c#26364f/0.8', 'c#e8e2d4/0.8'], { w: 0.7, d: 0.7 })); }
  { const Rt = at(W, dT, 0, 'left'), h = 2.7, ST = base(Rt, -h, h, { h: 3.0, top: 'marble', e0: 0, e1: 0 });          // the washstand
    drawers(Rt, -h, h, 2, 0.36, 2.86);
    Rt.box(NAVYP, -h, h, 0.01, 0.05, ST, UT, G); Rt.box(WALNUT, -h + 0.14, h - 0.14, 0.02, 0.16, UT, UT + 0.24, G);
    [['c#c9b48a/0.8', 'oatmeal'], ['c#9fb0a4/0.8', 'sea\nfennel'], ['c#2b2724/0.8', 'coal tar'], ['c#e88aa8/0.8', 'rose'], ['c#e8c73a/0.8', 'lemon\n& sage'], ['c#8a5ab0/0.8', 'lavender']]
      .forEach(([c, n], i) => soap(Rt, 0.3 + (i % 3) * 0.8, 0.5 + Math.floor(i / 3) * 0.72, ST, 2 + ((i * 3) % 4), c, n));
    { const x = -1.5, y = 0.98;                                    // the basin: enamel, navy rim, a jug, a towel, the card
      bowl(Rt, x, y, ST, 0.6, 0.32, ENAMEL, 24); ves(Rt, 'c#26364f/0.45', x, y, ST + 0.305, [[0.575, 0], [0.615, 0], [0.615, 0.03], [0.575, 0.03]], 24); Rt.cyl('c#9fb0d8/0.2', x, y, ST + 0.19, ST + 0.2, 0.5, 0.5, 20);
      kit.model('metal_jug', Rt, -0.45, 0.5, ST, 0, { scale: 0.62 });
      kit.foldedStack(Rt, 2.35, 1.3, ST, 2, ['c#e8e2d4/0.8', 'c#9fb0a4/0.8'], { w: 0.5, d: 0.7 });
      Rt.box(WALNUT, x - 0.7, x + 0.7, 0.1, 0.28, ST, ST + 0.06, G);
      kit.sign(Rt, x, 0.28, ST + 0.55, 1.3, 0.8, CARD('wash your hands.', 'tell Ember what you think.'), { cw: 300, ch: 184, tilt: 0.1, rough: 0.9 });
      kit.pillarCandle(Rt, -2.35, 1.4, ST, 0.5, 0.14); }
    // above it: one shelf of bottles, and the drying rail
    { const z = 5.5; Rt.box(WALNUT, -2.5, 2.5, 0.05, 0.9, z - 0.08, z, G); for (const x of [-2.2, 0, 2.2]) tube(Rt, BRASS, [[x, 0.07, z - 0.5], [x, 0.78, z - 0.08]], 0.02, 5);
      ['rose water', 'witch hazel', 'bay rum', 'oil of\ncedar', 'arnica', 'orange\nblossom', 'vetiver', 'vinegar of\nfour thieves']
        .forEach((n, i) => flask(Rt, -2.1 + i * 0.6, 0.5, z, i % 3 === 2 ? BLUE : AMBER, n, { h: 0.85 + (i % 3) * 0.1, r: 0.15 + (i % 2) * 0.02 })); }
    tube(Rt, BRASS, [[-2.45, 0.85, 8.75], [2.45, 0.85, 8.75]], 0.028, 6, true); for (const x of [-2.25, 2.25]) tube(Rt, BRASS, [[x, 0.05, 8.95], [x, 0.85, 8.75]], 0.02, 5);
    for (let i = 0; i < 6; i++) bunch(Rt, -2.0 + i * 0.8, 0.85, 8.62, i % 3 === 1 ? 'euc' : 'lav'); }
  { const c0 = (BAY1 + RUN1) / 2, h = (RUN1 - BAY1) / 2, S = at(W, c0, 0, 'left');                 // soap, linen, bath things; the ladder
    base(S, -h, h, { e0: 0 }); drawers(S, -h, h); const n = uppers(S, -h, h), x0 = -h;
    spots(x0, h, n, 2, 0.6).forEach((x, i) => kit.foldedStack(S, x, SY, 8.0, 4, i % 2 ? ['c#e8e2d4/0.8', 'c#9fb0a4/0.8', 'c#e8e2d4/0.8', 'c#9fb0a4/0.8'] : ['c#e8e2d4/0.8', 'c#26364f/0.8', 'c#e8e2d4/0.8', 'c#26364f/0.8'], { w: 0.75, d: 0.7 }));
    spots(x0, h, n, 3, 0.5).forEach((x, i) => soap(S, x, SY, 6.5, 3 + (i % 3), ['c#c9b48a/0.8', 'c#9fb0a4/0.8', 'c#e88aa8/0.8', 'c#e8c73a/0.8', 'c#8a5ab0/0.8', 'c#2b2724/0.8'][i % 6]));
    spots(x0, h, n, 4).forEach((x, i) => bottle(S, x, SY, 5.0, { r: 0.16, h: 0.95 + (i % 2) * 0.12, col: i % 4 === 1 ? AMBER : BLUE, neck: 0.05, cap: CORK }));
    spots(x0, h, n, 2, 0.6).forEach((x, i) => jar(S, x, SY, BH, 0.27, 0.8, ['c#e88aa8/0.8', 'c#f4f1ea/0.8', 'c#9fb0d8/0.8'][i % 3], 0.7, 'c#b08d4a/0.35/1'));
    kit.tableLamp(S, h - 0.8, 1.35, BH, 'c#8a5a2a/0.4', { base: 'gourd' });
    // the rail and the ladder
    tube(S, BRASS, [[x0 + 0.1, 1.3, 8.72], [h - 0.1, 1.3, 8.72]], 0.03, 6, true); for (let i = 0; i <= n; i++) { const x = x0 + (h - x0) * i / n + (i === 0 ? 0.1 : i === n ? -0.1 : 0); tube(S, BRASS, [[x, UD - 0.02, 8.72], [x, 1.3, 8.72]], 0.02, 5); }
    { const lx = -0.9, foot = 3.3, P = t => [1.36 + (foot - 1.36) * (1 - t), 0.03 + 8.87 * t];
      for (const s of [-1, 1]) tube(S, WALNUT, [[lx + s * 0.62, foot, 0.03], [lx + s * 0.62, 1.36, 8.9]], 0.06, 6, true);
      for (let k = 1; k <= 8; k++) { const [y, z] = P(k / 9); tube(S, WALNUT, [[lx - 0.62, y, z], [lx + 0.62, y, z]], 0.038, 6); }
      S.block(lx - 0.7, lx + 0.7, BD, foot + 0.1, 0, 6.5); } }

  // ---- the walls between the cabinets and the screen: boarded in the blue, the cornice line carried round -----
  for (const wall of ['left', 'right']) { A.wainscot(wall, RUN1 + 0.08, dP - 0.23, { h: BH, mat: NAVYP, style: 'panel' }); A.rail(wall, RUN1 + 0.14, dP - 0.23, { z: UT + 0.24, tall: 0.24, deep: 0.1, mat: WALNUT }); }
  // a tall dried arrangement in a crock, by the way through
  { crock(R, W - 1.15, 28.7, 0, 0.55, 1.5, 'c#d9cdb2/0.7'); R.block(W - 1.7, W - 0.6, 28.15, 29.25, 0, 3);
    leaves(R, W - 1.15, 28.7, 1.3, { n: 30, len: 3.6, w: 0.018, up: 1, out: 0.3, droop: 0.12, spread: 0.3, col: ['c#c9b48a/0.8', 'c#b08a5a/0.8', 'c#8a5ab0/0.8', 'c#9fb0a4/0.8'] }); }

  // ---- the counter, across the shop in front of the screen ----------------------------------------------------
  const c = at(5.8, dCounter, 0, 'street');                       // +x toward smaller a; +y is the customers' side
  const TOP = X.counter(c, -5.5, 5.5, -2.0, 0, 3.4, { front: NAVYP, top: WALNUT });
  { const x = -3.2, y = -1.05, z = TOP;                            // the brass till
    c.soft('c#b08d4a/0.35/1', x - 0.55, x + 0.55, y - 0.5, y + 0.45, z, z + 0.5, 0.05); c.soft('c#b08d4a/0.35/1', x - 0.5, x + 0.5, y - 0.15, y + 0.45, z + 0.5, z + 1.0, 0.08);      // keys toward the staff side (-y); the customer gets the back and its THANK YOU
    for (let i = 0; i < 12; i++) c.cyl('c#efe9da/0.3', x - 0.36 + (i % 4) * 0.24, y - 0.25 - Math.floor(i / 4) * 0.08, z + 0.5 + (2 - Math.floor(i / 4)) * 0.05, z + 0.56 + (2 - Math.floor(i / 4)) * 0.05, 0.05, 0.05, 8);
    kit.sign(c, x, y + 0.46, z + 0.78, 0.7, 0.3, (g, w, h) => { fill(g, w, h, '#17140f'); T(g, 'THANK YOU', w / 2, h / 2, h * 0.5, '#e9c46a', { f: F.bebas, ls: 3, max: w * 0.9 }); }, { cw: 128, ch: 56 }); }
  { const x = -1.8, y = -0.55; c.cyl('c#2b2724/0.45', x, y, TOP, TOP + 0.04, 0.2, 0.2, 14); ves(c, BRASS, x, y, TOP + 0.04, [[0.17, 0], [0.16, 0.06], [0.1, 0.13], [0.03, 0.16], [0.03, 0.2], [0, 0.2]], 16); }   // the bell
  kit.candle(c, -0.8, -1.2, TOP, 0.75);
  // wrapping: a few sheets of tissue, the kraft roll on its cradle, twine, one parcel waiting
  ['c#f4f1ea/0.8', 'c#e88aa8/0.8', 'c#efe2bc/0.8'].forEach((col, i) => c.box(col, 0.2 + i * 0.03, 1.5 + i * 0.03, -1.5 + i * 0.04, -0.5 + i * 0.04, TOP + i * 0.012, TOP + i * 0.012 + 0.011));
  { const z = TOP + 0.3; for (const x of [1.95, 3.95]) c.box(WALNUT, x - 0.04, x + 0.04, -1.85, -1.35, TOP, z + 0.1, G); hcyl(c, 'c#c9a77a/0.8', 'x', 2.95, -1.6, z, 1.8, 0.22, 0.22, 14); hcyl(c, WALNUT, 'x', 2.95, -1.6, z, 2.1, 0.03, 0.03, 6); }
  ball(c, TWINE, 4.0, -0.5, TOP, 0.14, 10);
  c.box('c#c9a77a/0.8', 2.5, 3.3, -0.95, -0.35, TOP, TOP + 0.4); c.box('c#8a1c1c/0.8', 2.85, 2.95, -0.955, -0.345, TOP, TOP + 0.405);
  for (const x of [-2.5, 2.5]) X.pendant(c, x, -0.9, { kind: 'bulb', drop: 5.0, power: 0.7 });

  // ---- the screen: a blue wall across the room, a long window into the pouring room, the way through ---------
  const P = A.partition(dP, { mat: NAVYW, trim: WALNUT, openings: [{ a0: 1.6, a1: 11.6, z0: 3.5, z1: 8.4, glass: true, bars: 3 }, { a0: 13.3, a1: 17.3, z1: 8.0 }] });
  A.rail({ d: P.front, side: 'front' }, 0.12, W - 0.12, { z: UT + 0.24, tall: 0.24, deep: 0.1, mat: WALNUT });
  // under the window, behind the counter: a low cupboard with a lamp on it
  { const b = at(6.6, P.front - 0.02, 0, 'street');
    b.box(WALNUT, -5.4, 5.4, 0, 1.2, 0.02, 3.2, G); b.box(WALNUT, -5.46, 5.46, 0, 1.28, 3.2, 3.3, G); b.block(-5.4, 5.4, 0, 1.25, 0, 3.3);
    for (let i = 0; i < 5; i++) { const x0 = -5.4 + i * 2.16; b.box(DRAWER, x0 + 0.1, x0 + 2.06, 1.2, 1.24, 0.35, 3.05, G); hcyl(b, BRASS, 'y', x0 + 1.82, 1.28, 1.9, 0.08, 0.04, 0.03, 8); }
    kit.tableLamp(b, 4.4, 0.62, 3.3, 'c#8a5a2a/0.4', { base: 'gourd', shade: 'empire' });
    kit.posy(b, -4.5, 0.62, 3.3); }

  // ---- the pouring room ----------------------------------------------------------------------------------------
  // boarded to the dado in the plain cream of a back room, a peg rail by the door with an apron on it
  { const da = W - (3.2 - 0.5); A.wainscot('left', P.back + 0.02, D - 0.02); A.wainscot('right', P.back + 0.02, D - 0.02); A.wainscot('back', 0.22, da - 2.0); A.wainscot('back', da + 2.0, W - 0.22);
    A.rail('right', 36.6, 41.4, { z: 6.3, deep: 0.07, tall: 0.3 });
    const g = at(W, 39, 0, 'left'); for (const x of [-1.8, -0.6, 0.6, 1.8]) hcyl(g, WALNUT, 'y', x, 0.2, 6.15, 0.26, 0.035, 0.045, 8);
    g.box('linen#d9cdb2', -1.2, 0, 0.22, 0.26, 2.9, 5.5); g.box('linen#d9cdb2', -0.85, -0.35, 0.22, 0.26, 5.5, 6.1); g.box('linen#c9b48a', -0.95, -0.25, 0.26, 0.275, 3.5, 4.4); }
  // the back door, where the real one is (it goes out to the yard under the stair to the flat). The door itself is
  // real: town.js cuts the doorway (3.1 wide, 6.95 high) and hangs it. This is its casing.
  { const a = W - (3.2 - 0.5), y1 = D - 0.004;
    for (const s of [-1, 1]) R.box(WALNUT, a + s * 1.55, a + s * 1.9, D - 0.1, y1, 0.004, 6.95, G);
    R.box(WALNUT, a - 1.98, a + 1.98, D - 0.12, y1, 6.95, 7.42, G); }
  // the dipping rack, seen through the window: tapers hung by the pair to cool
  { const a0 = 3.4, a1 = 10.2, dc = 35.4, RZ = 6.46;
    for (const a of [a0, a1]) { R.box(OAK, a - 0.07, a + 0.07, dc - 0.07, dc + 0.07, 0.14, 6.9, G); R.box(OAK, a - 0.1, a + 0.1, dc - 0.7, dc + 0.7, 0.004, 0.14, G); R.box(OAK, a - 0.055, a + 0.055, dc - 0.62, dc + 0.62, 6.3, 6.42, G); }
    R.box(OAK, a0 - 0.07, a1 + 0.07, dc - 0.05, dc + 0.05, 6.9, 7.04, G); R.box(OAK, a0 + 0.07, a1 - 0.07, dc - 0.04, dc + 0.04, 0.6, 0.74, G);
    [[-0.48, 'c#efe6d2/0.6', 0.95, 0.045], [0, 'c#d9b35a/0.6', 0.95, 0.045], [0.48, 'c#f4f1ea/0.6', 0.8, 0.024]].forEach(([o, wax, len, r], j) => {
      hcyl(R, OAK, 'x', (a0 + a1) / 2, dc + o, RZ, a1 - a0 + 0.2, 0.035, 0.035, 8);
      for (let i = 0; i < 20; i++) { const a = a0 + 0.42 + i * 0.3 + (i % 2 ? -0.05 : 0.05); if (j === 2 && i > 13) continue; R.cyl(wax, a, dc + o, RZ - 0.17 - len, RZ - 0.17, r, r * 0.7, 8); R.cyl('c#efe9da/0.8', a, dc + o, RZ - 0.17, RZ + 0.03, 0.006, 0.006, 4); }
    });
    R.box('c#8f8a80/0.4/0.6', a0 + 0.3, a1 - 0.3, dc - 0.66, dc + 0.66, 0.004, 0.07); R.block(a0 - 0.1, a1 + 0.1, dc - 0.7, dc + 0.7, 0, 7); }
  // the bench along the back wall: the wax pot on its ring, moulds, jars set to cool
  { const B = at(6.2, D, 0, 'street'), BT = X.plinth(B, 0, 1.4, 10.4, 2.2, 3.0, { mat: OAK, shelf: 0.9, leg: 0.2 }), TIN = 'c#b9b4aa/0.3/1';
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) B.box('c#d9a84a/0.6', 4.3 - 0.45 + (k === 2 ? 0.2 : 0), 4.3 + 0.45 + (k === 2 ? 0.2 : 0), 1.1 + s * 0.42 - 0.38, 1.1 + s * 0.42 + 0.38, BT + k * 0.26 + 0.002, BT + k * 0.26 + 0.25);     // beeswax by the block
    B.box(OAK, 1.1, 3.2, 0.75, 1.45, BT, BT + 0.1, G); for (let i = 0; i < 6; i++) { ves(B, TIN, 1.35 + (i % 3) * 0.8, 0.92 + Math.floor(i / 3) * 0.36, BT + 0.1, [[0, 0], [0.1, 0], [0.13, 0.75], [0.11, 0.75], [0.085, 0.03], [0, 0.03]], 12); }   // moulds
    for (let i = 0; i < 4; i++) { const x = 0.2 - i * 0.5; jar(B, x, 1.2 + (i % 2) * 0.2, BT, 0.2, 0.42, ['c#d9cdb2/0.6', 'c#d9b35a/0.6'][i % 2], 0.75, null); }
    kit.candle(B, -1.9, 0.6, BT, 0.5);
    { const x = -3.0, y = 1.15; B.cyl('c#1d1b18/0.7', x, y, BT, BT + 0.14, 0.44, 0.44, 14);                            // the wax pot on its ring
      ves(B, 'c#b0683a/0.35/1', x, y, BT + 0.14, [[0, 0], [0.5, 0], [0.56, 0.1], [0.56, 0.78], [0.6, 0.8], [0.52, 0.8], [0.52, 0.12], [0, 0.1]], 20); B.cyl('c#e9d9a8/0.35', x, y, BT + 0.6, BT + 0.62, 0.52, 0.52, 20);
      tube(B, TIN, [[x - 0.2, y, BT + 0.66], [x - 0.75, y + 0.25, BT + 1.25]], 0.022, 5, true); }
    ves(B, TIN, -4.4, 1.15, BT, [[0, 0], [0.3, 0], [0.3, 1.5], [0.27, 1.5], [0.27, 0.03], [0, 0.03]], 16);                 // the dipping can
    for (const x of [-3.4, 0, 3.4]) X.crate(B, x, 1.4, 0.9, 1.7, 1.3, 0.85);
    // one shelf over it
    { const z = 5.6; B.box(OAK, -5.0, 5.0, 0.02, 0.85, z - 0.09, z, G); for (const x of [-4.4, 0, 4.4]) tube(B, 'c#1d1b18/0.7', [[x, 0.05, z - 0.55], [x, 0.75, z - 0.09]], 0.022, 5);
      ['c#4a5a80/0.6', 'c#d9b35a/0.6', 'c#b8452e/0.6', 'c#efe6d2/0.6', 'c#9fb0a4/0.6', 'c#8a5ab0/0.6', 'c#d9cdb2/0.6'].forEach((col, i) => jar(B, 3.9 - i * 0.75, 0.45, z, 0.26, 0.75, col, 0.6 + (i % 3) * 0.12, CORK));
      hcyl(B, TWINE, 'x', -2.5, 0.45, z + 0.2, 0.5, 0.2, 0.2, 14); hcyl(B, TWINE, 'x', -3.3, 0.45, z + 0.2, 0.5, 0.2, 0.2, 14); }       // wick by the spool
    X.stool(B, 1.2, 3.35, 2.2, { mat: WALNUT }); }
  // stock on the left wall, crates by the way in
  { const S = at(0, 34.4, 0, 'right'), zs = X.shelving(S, -2.8, 2.8, [1.2, 2.9, 4.6, 6.3], { d: 1.2, mat: OAK, back: false, bay: 2.8 });
    for (const [z, n] of [[zs[0], 3], [zs[1], 4], [zs[2], 4], [zs[3], 3]]) spots(-2.8, 2.8, 2, n, 0.5).forEach((x, i) => { const w = z === zs[0] ? 0.4 : 0.26, t = z === zs[0] ? 0.9 : 0.6 + ((i * 7 + n) % 3) * 0.2; S.box(z === zs[2] && i % 4 === 1 ? 'c#d9a84a/0.6' : 'c#c9a77a/0.8', x - w, x + w, 0.2, 1.05, z + 0.002, z + t); }); }
  { for (const [d, z] of [[32.9, 0.004], [32.9, 0.9], [34.8, 0.004]]) { X.crate(R, W - 0.95, d, z, 1.5, 1.7, 0.88); R.box('c#c9a77a/0.8', W - 1.55, W - 0.35, d - 0.7, d + 0.7, z + 0.06, z + 0.6); }
    R.block(W - 1.75, W, 32.0, 35.7, 0, 3); }
  X.pendant(R, 8.6, 38.2, { kind: 'dome', drop: 4.4, power: 1.0, colour: 'c#34405a/0.35' });

  // ---- out on the pavement: a bench under the right window, a lantern, the board ------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));              // x = a along the frontage, y = -feet out from the shopfront
  kit.model('painted_wooden_bench', o, W - 3.6, -1.25, 0, 2, { outdoor: true, collide: true, seat: 1.45 });
  kit.model('Lantern_01', o, 5.4, -0.9, 0, 0, { outdoor: true, scale: 1.3 }); kit.lampAt(o, 5.4, -0.9, 0.7, 0.35);
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.6, 5.2, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h, '#232a3c'); chalk(g, 'today it smells of', w / 2, h * 0.12, h * 0.075, '#e9c46a'); ICON.candle(g, w / 2, h * 0.34, h * 0.26, '#f1efe6', '#e9c46a'); chalk(g, 'RAIN ON', w / 2, h * 0.58, h * 0.1); chalk(g, 'HOT PAVEMENT', w / 2, h * 0.7, h * 0.1); chalk(g, 'come in & light something', w / 2, h * 0.88, h * 0.068, '#e8a8a0', { max: w * 0.9 }); });

  // ---- Ember, the chandler ------------------------------------------------------------------------------------
  const dE = dCounter + 3.35;
  kit.clerks.push({
    id: 'ember', name: 'Ember', lot: 'apothecary', look: { shape: 'round', colour: '#34405a', belly: '#efe4cf', trim: '#c9a45c', scarf: '#c8552e', hat: 'none', eye: '#ffd9a0', ring: 0xffc878, blush: true, tool: 'candle', hover: 4.7 },
    home: lot.world(5.8, dE), faces: lot.world(MID, dT), posts: [lot.world(3, dE), lot.world(9, dE), lot.world(7.5, 38.6), lot.world(12.4, 34)],
    lines: {
      greet: ['Hello. Come in slowly.', 'Welcome. Nothing is lit yet. That is what you are for.'],
      idle: ['*trims a wick*', 'Beeswax remembers the bees.', '*holds a candle up to the lamp, then puts it back*'],
      bye: ['Go gently.', 'Blow out what you lit. Or do not. I like the company.'],
      topics: [
        { q: 'Can I really light these?', a: 'Please. Walk up to a wick and press E. There are twenty-four. I counted twice.' },
        { q: 'Which one is your favourite?', a: 'Vesper Street, 6 p.m. Warm brick, and the lamps coming on.' },
        { q: 'What is through the window?', a: 'The pouring room. A taper is dipped thirty times. Those are on nineteen.' },
        { q: 'Tell me about the soap.', a: 'Cut on Thursdays. Try the basin and tell me how it smells. I have no nose.' },
        { q: 'What is in the drawers?', a: 'Lavender, wicks, string. One of them says “open me”. I would.' },
        { q: 'Could you wrap something?', a: 'Tissue, paper, twine. It takes four minutes and I enjoy all of them.' },
      ],
    },
  });
}
