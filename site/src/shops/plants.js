// Frond: plants & their paraphernalia  (north side: 315 Mulberry Street, narrow and deep, about 19.7 by 42.7)
// A conservatory with a till in it. Front to back (the street door is toward the left, and the plan is laid for that):
//   the window    a raised bed with the show-offs in it; Big Susan in the corner on the door's other side
//   the shop      green staging down both side walls under a trellis, with nursery stock in clay pots; one long
//                 table down the middle; a line of lamps and baskets from the beams; Kenneth at the table's far end
//   the back of the shop   the propagation wall on the left (the quiet find), Gerald and Robert on the right, and
//                 the counter with Moss across the right, in front of a glazed screen
//   the potting room   through the cased doorway, on the street door's own axis: sacks, the long tools, the stone
//                 sink, the bench under the back window, the back door, shelves of clay pots, Old Dickson, the olive
// Eight plants have name tags. That is all the reading there is, bar five other things: the window card,
// the propagation board and its one note, the house rules, the bag of soil.
import { tools, fixtures } from '../shopkit.js';
import { arch } from './arch.js';
import { BRASS, G } from '../kit.js';
import { tris } from '../kit/geom.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, para, poly, ICON } from '../draw.js';

const TAU = Math.PI * 2;
const OAK = 'oak_light#a3825c', PALE = 'oak_light#c9b08a', DARKW = 'fir#5a4334', SAGE = 'painted_wood#7d8f72', WHITEP = 'painted_wood#e9e4d6';
const IRON = 'c#2b2724/0.45/1', CLAY = 'c#b8755a/0.85', SOIL = 'c#3a2214/0.8', CORD = 'c#e8e2d4/0.8', ZINC = 'c#c9ccd0/0.3/1', KRAFT = 'c#c9a77a/0.8', GLOW = 'e#f08ae0/2.4', BLUSH = 'painted_wood#efc9e6';
const NAVY = 'c#26364f/0.45', TEAL = 'c#2f5a6a/0.45', MUSTARD = 'c#c9952a/0.45', CORAL = 'c#e8907a/0.45', WHITE = 'c#f4f1ea/0.45', CREAM = 'c#e8e2d4/0.45', COAL = 'c#2b2724/0.45', CELADON = 'c#9fb0a4/0.45', SKY = 'c#9fb0d8/0.45', PINK = 'c#e88aa8/0.45', RUST = 'c#b8361f/0.45', STONE = 'c#a9a49b/0.8';
const GLAZES = [NAVY, TEAL, MUSTARD, CORAL, WHITE, CREAM, COAL, CELADON, SKY, PINK, RUST, CLAY];
const GREENS = ['c#4a6e38/0.8', 'c#5d8a3a/0.8', 'c#3a6a3a/0.8'], DEEP = ['c#2f4a2a/0.45', 'c#3a6a3a/0.45', 'c#4a6e38/0.45'], LIME = ['c#7fa04a/0.8', 'c#5d8a3a/0.8'], GREY = ['c#9fb0a4/0.8'], PURPLE = ['c#4a2240/0.8', 'c#8a5ab0/0.8'];
const INK = '#2a2118', LEAFG = '#34553a', PAPER = '#f1e9d6';

// ---- things drawn by hand ---------------------------------------------------------------------------------
const TAG = (name, note, c = '#efe4c8') => (g, w, h) => {
  paper(g, w, h, c, 7); g.strokeStyle = 'rgba(70,50,25,.4)'; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6);
  T(g, name, w / 2, h * 0.2, h * 0.27, LEAFG, { f: F.caveat, w: 700, max: w * 0.9 });
  const px = note.length > 56 ? h * 0.135 : note.length > 36 ? h * 0.155 : h * 0.18;
  para(g, note, w / 2, h * 0.38, px, INK, w * 0.88, { f: F.caveat, w: 600, a: 'center', lh: 1.05 });
};
const CARD = (title, body, o = {}) => (g, w, h) => {
  paper(g, w, h, o.bg ?? PAPER, 5);
  if (o.edge !== false) { g.strokeStyle = o.tc ?? LEAFG; g.lineWidth = Math.max(2, h * 0.014); g.strokeRect(h * 0.045, h * 0.045, w - h * 0.09, h - h * 0.09); }
  T(g, title, w / 2, h * (o.ty ?? 0.24), h * (o.ts ?? 0.2), o.tc ?? LEAFG, { f: o.tf ?? F.shrikhand, max: w * 0.86, ls: o.ls });
  para(g, body, w / 2, h * (o.by ?? 0.42), h * (o.bs ?? 0.11), o.bc ?? INK, w * 0.84, { f: o.bf ?? F.caveat, w: 600, a: 'center', lh: o.lh ?? 1.12, it: o.it });
};
const BOARD = (title, sub, bg = '#34553a', ink = '#e6e0cf', o = {}) => (g, w, h) => {
  board(g, w, h, bg, ink, { inset: h * 0.08 });
  T(g, title, w / 2, h * (sub ? 0.38 : 0.52), h * (o.ts ?? 0.36), ink, { f: o.tf ?? F.bebas, ls: h * 0.03, max: w * 0.9 });
  if (sub) T(g, sub, w / 2, h * 0.74, h * (o.ss ?? 0.19), o.sc ?? ink, { f: o.sf ?? F.fraunces, it: 1, w: 600, max: w * 0.9 });
};
const MIX = (g, w, h) => {
  fill(g, w, h, '#c9a877'); grain(g, w, h, 0.09); rrect(g, w * 0.1, h * 0.14, w * 0.8, h * 0.56, 10, '#f1e9d6');
  T(g, 'OLD BRAMBLE’S', w / 2, h * 0.23, h * 0.07, '#5a3a1c', { f: F.bebas, ls: 3, max: w * 0.7 });
  T(g, 'Dirt,', w / 2, h * 0.37, h * 0.14, '#34553a', { f: F.shrikhand }); T(g, 'but nice', w / 2, h * 0.5, h * 0.1, '#34553a', { f: F.shrikhand, max: w * 0.7 });
  T(g, 'peat-free potting mix', w / 2, h * 0.62, h * 0.05, INK, { f: F.fraunces, it: 1, w: 600, max: w * 0.72 });
  T(g, '20 L', w / 2, h * 0.84, h * 0.09, '#5a3a1c', { f: F.bebas });
};
const RULES = (g, w, h) => {
  slate(g, w, h, '#24302a', 9); chalk(g, 'house rules', w / 2, h * 0.14, h * 0.15, '#e9c46a'); line(g, [[w * 0.3, h * 0.25], [w * 0.7, h * 0.25]], '#9fc6b0', 3);
  ['1.  most plants want less water than you think', '2.  most people want more', '3.  light is food. sit nearer the window', '4.  repot when cramped']
    .forEach((s, i) => chalk(g, s, w * 0.07, h * (0.4 + i * 0.15), h * 0.09, i % 2 ? '#9fc6b0' : '#f1efe6', { a: 'left', max: w * 0.88 }));
};

export default function plants(kit, lot) {
  const K = tools(kit, 77), X = fixtures(kit, K), { ves, hcyl, ball, tube, rnd, pick } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                        // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D;

  // ---- how a plant is grown here: leaves are folded blades gathered into one mesh per colour --------------
  const buckets = new Map();
  const bucket = (f, col) => { let b = buckets.get(f); if (!b) buckets.set(f, b = {}); return b[col] ?? (b[col] = []); };
  const SHAPE = { oval: [[0, 0], [0.35, 1], [0.72, 0.78], [1, 0]], heart: [[0, 0], [0.1, 0.85], [0.42, 1], [1, 0]], lance: [[0, 0.25], [0.4, 1], [1, 0]], round: [[0, 0], [0.18, 0.8], [0.55, 1], [0.86, 0.7], [1, 0]],
    paddle: [[0, 0.4], [0.3, 1], [0.78, 0.85], [1, 0]], strap: [[0, 0.9], [0.55, 1], [1, 0]], dot: [[0, 0], [0.5, 1], [1, 0]] };
  // One leaf from `base`, heading az round the plant, pitched up by `pitch`, L long and W half-wide.
  function leaf(f, col, base, az, pitch, L, W, o = {}) {
    const st = SHAPE[o.shape ?? 'oval'], fold = o.fold ?? 0.3, droop = o.droop ?? 0.4, out = bucket(f, col);
    const ca = Math.cos(az), sa = Math.sin(az), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const P = (u, s, lift) => { const up = lift - droop * u * u / L, al = u * cp - up * sp; return [base[0] + ca * al - sa * s, base[1] + sa * al + ca * s, base[2] + u * sp + up * cp]; };
    const rows = st.map(([t, w]) => { if (!w) { const p = P(t * L, 0, 0); return [p, p, p]; } return [P(t * L, -w * W, w * W * fold), P(t * L, 0, 0), P(t * L, w * W, w * W * fold)]; });
    const tri = (a, b, c) => { if (a !== b && b !== c && a !== c) out.push(a, b, c, a, c, b); };
    for (let j = 0; j < rows.length - 1; j++) for (let i = 0; i < 2; i++) { const a = rows[j][i], b = rows[j][i + 1], c = rows[j + 1][i + 1], d = rows[j + 1][i]; tri(a, b, c); tri(a, c, d); }
  }
  const flush = () => { for (const [f, b] of buckets) for (const [col, list] of Object.entries(b)) if (list.length) K.put(f, tris(list), col); buckets.clear(); };
  // leaves from one crown: upright in the middle (p0), flatter outside (p1)
  function rosette(f, x, y, z, o = {}) {
    const n = o.n ?? 10, L = o.L ?? 0.6, W = o.W ?? 0.1, cols = o.cols ?? GREENS, p0 = o.p0 ?? 1.2, p1 = o.p1 ?? 0.3, sp = o.sp ?? 0.03;
    for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0, az = i * 2.4 + rnd() * 0.4; leaf(f, pick(cols), [x + Math.cos(az) * sp, y + Math.sin(az) * sp, z], az, p0 + (p1 - p0) * t + (rnd() - 0.5) * 0.15, L * (0.75 + rnd() * 0.4) * (0.75 + 0.25 * t), W, o); }
  }
  // leaves held out on stalks; o.blooms = { n, col } adds flowers on stalks of their own
  function stemmed(f, x, y, z, o = {}) {
    const n = o.n ?? 8, H = o.H ?? 1.5, L = o.L ?? 0.6, W = o.W ?? 0.22, cols = o.cols ?? GREENS, lean = o.lean ?? 0.35, sr = o.sr ?? Math.max(0.008, H * 0.007);
    const stalk = (az, h, ln) => { const c = Math.cos(az), s = Math.sin(az), tip = [x + c * ln, y + s * ln, z + h]; tube(f, o.stem ?? 'c#5d8a3a/0.8', [[x + c * 0.02, y + s * 0.02, z], [x + c * ln * 0.3, y + s * ln * 0.3, z + h * 0.6], tip], sr, 3); return tip; };
    for (let i = 0; i < n; i++) { const az = i * 2.4 + rnd() * 0.5, h = H * (0.5 + rnd() * 0.55), tip = stalk(az, h, lean * (0.5 + rnd()) * h); leaf(f, pick(cols), tip, az + (rnd() - 0.5) * 0.5, (o.pitch ?? -0.35) + (rnd() - 0.5) * 0.3, L * (0.75 + rnd() * 0.4), W * (0.85 + rnd() * 0.3), o); }
    if (o.blooms) for (let i = 0; i < o.blooms.n; i++) { const az = i * 2.1 + 1 + rnd(), tip = stalk(az, H * (0.95 + rnd() * 0.25), lean * 0.4 * H); leaf(f, o.blooms.col, tip, az, 1.1, o.blooms.L ?? L * 0.5, o.blooms.W ?? W * 0.6, { shape: 'heart', fold: 0.5, droop: 0.1 }); }
  }
  // a trunk with leaves up it; o.bushy = crown radius scatters them, o.crown = rosette options for a tuft on top
  function tree(f, x, y, z, o = {}) {
    const H = o.H ?? 5, bare = o.bare ?? 0.4, n = o.n ?? 14, L = o.L ?? 0.8, W = o.W ?? 0.25, cols = o.cols ?? DEEP, tr = o.tr ?? 0.07, wob = o.wob ?? 0.18, ph = rnd() * 6, path = [];
    for (let k = 0; k <= 4; k++) { const t = k / 4; path.push([x + Math.sin(t * 3 + ph) * wob * t, y + Math.cos(t * 2.3 + ph) * wob * t, z + H * t]); }
    tube(f, o.bark ?? 'c#6a4a2a/0.8', path, t => tr * (1 - 0.55 * t), 5);
    const on = t => { const k = Math.min(3.999, t * 4), i = Math.floor(k), u = k - i; return path[i].map((v, m) => v + (path[i + 1][m] - v) * u); };
    for (let i = 0; i < n; i++) {
      const t = bare + (1 - bare) * (i / Math.max(1, n - 1)), az = i * 2.4 + rnd() * 0.4; let p = on(t);
      if (o.bushy) { const rr = o.bushy * (0.3 + rnd() * 0.7), el = (rnd() - 0.3) * 1.6; p = [p[0] + Math.cos(az) * rr * Math.cos(el), p[1] + Math.sin(az) * rr * Math.cos(el), on(1)[2] - o.bushy * 0.5 + rr * Math.sin(el)]; }
      leaf(f, pick(cols), p, az, (o.pitch ?? 0.35) + 0.7 * (i / n) + (rnd() - 0.5) * 0.3, L * (0.8 + rnd() * 0.35), W, o);
    }
    if (o.bushy) for (let i = 0; i < 5; i++) { const az = i * 1.26 + ph, e = on(1); tube(f, o.bark ?? 'c#6a4a2a/0.8', [on(0.7), [e[0] + Math.cos(az) * o.bushy * 0.7, e[1] + Math.sin(az) * o.bushy * 0.7, e[2] + (i % 2 ? 0.1 : -0.3) * o.bushy]], tr * 0.3, 3); }
    if (o.crown) rosette(f, ...on(1), o.crown);
    return on(1);
  }
  // arching fronds with leaflets down both sides
  function palm(f, x, y, z, o = {}) {
    const n = o.n ?? 6, L = o.L ?? 2, rise = o.rise ?? 1.2, m = o.m ?? 6, lf = o.lf ?? 0.5, lw = o.lw ?? 0.06, cols = o.cols ?? GREENS, dr = o.droop ?? 0.9;
    for (let i = 0; i < n; i++) {
      const az = i * 2.4 + rnd() * 0.5, ll = L * (0.7 + rnd() * 0.45), rs = rise * (0.7 + rnd() * 0.5), c = Math.cos(az), s = Math.sin(az), col = pick(cols);
      const pt = t => [x + c * ll * 0.8 * t, y + s * ll * 0.8 * t, z + ll * (rs * t - dr * t * t)];
      tube(f, o.rib ?? 'c#5d8a3a/0.8', [pt(0), pt(0.35), pt(0.7), pt(1)], 0.012, 3);
      for (let k = 1; k <= m; k++) { const t = 0.22 + 0.74 * k / m, p = pt(t), sl = Math.atan(rs - 2 * dr * t) * 0.5, q = lf * (1 - 0.55 * t * t); for (const sd of [-1, 1]) leaf(f, col, p, az + sd * (o.sweep ?? 1.05), sl - 0.1, q, lw, { shape: o.shape ?? 'lance', fold: 0.15, droop: 0.45 }); }
      leaf(f, col, pt(1), az, Math.atan(rs - 2 * dr) * 0.6, lf * 0.5, lw, { shape: 'lance', fold: 0.15, droop: 0.3 });
    }
  }
  // vines over the rim (radius r) and down
  function trail(f, x, y, z, o = {}) {
    const n = o.n ?? 6, len = o.len ?? 1.6, L = o.L ?? 0.2, W = o.W ?? 0.09, cols = o.cols ?? LIME, r = o.r ?? 0.3, step = o.step ?? 0.2;
    for (let i = 0; i < n; i++) {
      const az = i / n * TAU + rnd() * 0.6, ln = len * (0.45 + rnd() * 0.6), m = Math.max(2, Math.round(ln / step)), c = Math.cos(az), s = Math.sin(az), ph = rnd() * 6;
      const pts = [[x + c * r * 0.4, y + s * r * 0.4, z], [x + c * (r + 0.05), y + s * (r + 0.05), z + 0.04]];
      for (let k = 1; k <= m; k++) { const out = r + 0.07 + 0.05 * Math.sin(k * 1.3 + ph), sw = 0.05 * Math.sin(k * 0.9 + ph); pts.push([x + c * out - s * sw, y + s * out + c * sw, z - k * ln / m]); }
      tube(f, o.vine ?? 'c#5d8a3a/0.8', pts, 0.007, 3);
      for (let k = 1; k < pts.length; k++) leaf(f, pick(cols), pts[k], az + (k % 2 ? 1.2 : -1.2) + (rnd() - 0.5) * 0.6, -0.5 + rnd() * 0.3, L * (0.8 + rnd() * 0.4), W, { shape: o.shape ?? 'heart', droop: 0.2, fold: 0.25 });
    }
    if (o.top !== 0) rosette(f, x, y, z, { n: o.top ?? 6, L: L * 1.3, W: W * 1.2, cols, p0: 0.9, p1: 0.2, shape: o.shape ?? 'heart', sp: r * 0.4 });
  }
  function cactus(f, x, y, z, o = {}) {
    const H = o.H ?? 1, r = o.r ?? 0.14, col = o.col ?? 'c#4a6e38/0.8';
    ves(f, col, x, y, z, [[0, 0], [r * 0.85, 0], [r, H * 0.12], [r, H * 0.82], [r * 0.72, H * 0.96], [0, H]], o.seg ?? 8);
    for (const [az, h0, up] of o.arms ?? []) { const c = Math.cos(az), s = Math.sin(az); tube(f, col, [[x + c * r * 0.5, y + s * r * 0.5, z + h0], [x + c * r * 2.1, y + s * r * 2.1, z + h0 + r * 0.3], [x + c * r * 2.3, y + s * r * 2.3, z + h0 + up * 0.5], [x + c * r * 2.3, y + s * r * 2.3, z + h0 + up]], r * 0.62, 6, true); }
    if (o.flower) ball(f, o.flower, x, y, z + H - 0.03, r * 0.42, 6, 0.8);
  }
  // a pot standing on z; returns the height of the soil
  function pot(f, x, y, z, r, h, mat = CLAY, style = 'std', empty = false) {
    const lip = { std: 0.93, cyl: 0.9, bowl: 0.9, egg: 0.68, foot: 0.92, taper: 0.9 }[style] * r;
    const outer = { std: [[0, 0], [r * 0.7, 0], [r * 0.94, h * 0.84], [r * 1.07, h * 0.86], [r * 1.07, h]], cyl: [[0, 0], [r, 0], [r, h]], bowl: [[0, 0], [r * 0.45, 0], [r * 0.85, h * 0.45], [r, h]],
      egg: [[0, 0], [r * 0.55, 0], [r * 0.95, h * 0.3], [r, h * 0.6], [r * 0.78, h]], foot: [[0, 0], [r * 0.5, 0], [r * 0.5, h * 0.05], [r * 0.3, h * 0.13], [r * 0.62, h * 0.3], [r, h * 0.82], [r * 1.04, h]], taper: [[0, 0], [r * 0.6, 0], [r, h]] }[style];
    ves(f, mat, x, y, z, [...outer, ...(empty ? [[lip, h], [lip * 0.8, h * 0.25], [0, h * 0.2]] : [[lip, h], [lip, h * 0.9], [0, h * 0.9]])], r > 0.5 ? 18 : r > 0.3 ? 14 : 10);
    if (!empty) f.cyl(SOIL, x, y, z + h * 0.9, z + h * 0.925, lip * 0.98, lip * 0.98, 10);
    return z + h * 0.925;
  }
  // the house species: (frame, x, y, soil height, scale)
  const SP = {
    monstera: (f, x, y, z, s = 1) => stemmed(f, x, y, z, { n: 9, H: 2.2 * s, lean: 0.5, L: 1.0 * s, W: 0.4 * s, shape: 'heart', cols: DEEP, pitch: -0.45 }),
    alocasia: (f, x, y, z, s = 1) => stemmed(f, x, y, z, { n: 5, H: 1.9 * s, lean: 0.3, L: 0.95 * s, W: 0.3 * s, shape: 'heart', cols: ['c#2f4a2a/0.45'], pitch: -1.0, droop: 0.1 }),
    bop: (f, x, y, z, s = 1) => stemmed(f, x, y, z, { n: 7, H: 3.0 * s, lean: 0.2, L: 1.5 * s, W: 0.36 * s, shape: 'paddle', cols: GREENS, pitch: 0.95, droop: 0.5, sr: 0.03 * s }),
    pilea: (f, x, y, z, s = 1) => stemmed(f, x, y, z, { n: 13, H: 0.7 * s, lean: 0.55, L: 0.2 * s, W: 0.1 * s, shape: 'round', cols: LIME, pitch: 0.2, fold: 0.1 }),
    peace: (f, x, y, z, s = 1) => stemmed(f, x, y, z, { n: 11, H: 1.0 * s, lean: 0.45, L: 0.6 * s, W: 0.13 * s, shape: 'oval', cols: DEEP, pitch: 0.2, blooms: { n: 3, col: 'c#f4f1ea/0.45', L: 0.3 * s, W: 0.09 * s } }),
    anthurium: (f, x, y, z, s = 1) => stemmed(f, x, y, z, { n: 9, H: 0.9 * s, lean: 0.5, L: 0.45 * s, W: 0.17 * s, shape: 'heart', cols: DEEP, pitch: -0.2, blooms: { n: 4, col: 'c#c8202a/0.2', L: 0.26 * s, W: 0.11 * s } }),
    zz: (f, x, y, z, s = 1) => palm(f, x, y, z, { n: 6, L: 1.3 * s, rise: 1.7, droop: 0.5, m: 6, lf: 0.26 * s, lw: 0.07 * s, shape: 'oval', cols: ['c#2f4a2a/0.2', 'c#3a6a3a/0.2'], sweep: 0.9 }),
    parlour: (f, x, y, z, s = 1) => palm(f, x, y, z, { n: 7, L: 1.5 * s, rise: 1.5, droop: 0.9, m: 6, lf: 0.5 * s, lw: 0.05 * s }),
    calathea: (f, x, y, z, s = 1) => rosette(f, x, y, z, { n: 10, L: 0.7 * s, W: 0.2 * s, shape: 'oval', p0: 1.25, p1: 0.45, cols: ['c#4a6e38/0.8', 'c#7fa04a/0.8', 'c#4a2240/0.8'] }),
    spider: (f, x, y, z, s = 1) => rosette(f, x, y, z, { n: 18, L: 0.9 * s, W: 0.035 * s, shape: 'strap', p0: 1.3, p1: 0.5, droop: 1.2, cols: ['c#7fa04a/0.8', 'c#d9cdb2/0.8', 'c#5d8a3a/0.8'] }),
    nest: (f, x, y, z, s = 1) => rosette(f, x, y, z, { n: 12, L: 0.9 * s, W: 0.12 * s, shape: 'lance', p0: 1.3, p1: 0.7, droop: 0.3, cols: LIME }),
    agave: (f, x, y, z, s = 1) => rosette(f, x, y, z, { n: 13, L: 0.7 * s, W: 0.085 * s, shape: 'lance', p0: 1.35, p1: 0.25, droop: 0, fold: 0.55, cols: GREY }),
    aloe: (f, x, y, z, s = 1) => rosette(f, x, y, z, { n: 9, L: 0.6 * s, W: 0.055 * s, shape: 'lance', p0: 1.4, p1: 0.8, droop: -0.15, fold: 0.6, cols: GREENS }),
    echeveria: (f, x, y, z, s = 1, cols = GREY) => rosette(f, x, y, z, { n: 11, L: 0.17 * s, W: 0.06 * s, shape: 'oval', p0: 1.4, p1: 0.3, droop: -0.4, fold: 0.5, cols }),
    haworthia: (f, x, y, z, s = 1) => rosette(f, x, y, z, { n: 11, L: 0.22 * s, W: 0.035 * s, shape: 'lance', p0: 1.4, p1: 0.5, droop: -0.2, fold: 0.6, cols: ['c#2f4a2a/0.8', 'c#3a6a3a/0.8'] }),
    bromeliad: (f, x, y, z, s = 1) => { rosette(f, x, y, z, { n: 11, L: 0.7 * s, W: 0.07 * s, shape: 'strap', p0: 1.0, p1: 0.4, droop: 0.6, cols: GREENS }); rosette(f, x, y, z, { n: 5, L: 0.4 * s, W: 0.05 * s, shape: 'lance', p0: 1.45, p1: 1.0, droop: 0, cols: ['c#c8202a/0.45', 'c#e0782a/0.45'] }); },
    croton: (f, x, y, z, s = 1) => stemmed(f, x, y, z, { n: 13, H: 0.9 * s, lean: 0.4, L: 0.5 * s, W: 0.13 * s, shape: 'oval', cols: ['c#c8202a/0.45', 'c#e0782a/0.45', 'c#e8c73a/0.45', 'c#4a6e38/0.45', 'c#3a6a3a/0.45'], pitch: 0.4 }),
    oxalis: (f, x, y, z, s = 1) => stemmed(f, x, y, z, { n: 15, H: 0.5 * s, lean: 0.6, L: 0.16 * s, W: 0.1 * s, shape: 'heart', cols: PURPLE, pitch: 0, stem: 'c#8a5ab0/0.8' }),
    fittonia: (f, x, y, z, s = 1) => rosette(f, x, y, z, { n: 13, L: 0.2 * s, W: 0.09 * s, shape: 'round', p0: 0.9, p1: 0.1, cols: ['c#e88aa8/0.8', 'c#4a6e38/0.8', 'c#e8907a/0.8'], sp: 0.08 }),
    begonia: (f, x, y, z, s = 1) => stemmed(f, x, y, z, { n: 9, H: 0.8 * s, lean: 0.5, L: 0.5 * s, W: 0.15 * s, shape: 'lance', cols: ['c#2f4a2a/0.45', 'c#8a1c1c/0.45', 'c#3a6a3a/0.45'], pitch: -0.3, stem: 'c#8a1c1c/0.8' }),
    peperomia: (f, x, y, z, s = 1) => rosette(f, x, y, z, { n: 13, L: 0.24 * s, W: 0.12 * s, shape: 'round', p0: 1.1, p1: 0.35, cols: ['c#2f4a2a/0.2', 'c#3a6a3a/0.2'], sp: 0.05 }),
    violet: (f, x, y, z, s = 1) => { rosette(f, x, y, z, { n: 11, L: 0.2 * s, W: 0.1 * s, shape: 'round', p0: 0.7, p1: 0.1, cols: ['c#3a6a3a/0.8'], sp: 0.04 }); for (let i = 0; i < 5; i++) ball(f, 'c#8a5ab0/0.8', x + Math.cos(i * 1.3) * 0.05 * s, y + Math.sin(i * 1.3) * 0.05 * s, z + 0.1 * s, 0.035 * s, 6); },
    asparagus: (f, x, y, z, s = 1) => rosette(f, x, y, z, { n: 24, L: 0.8 * s, W: 0.018 * s, shape: 'lance', p0: 1.3, p1: 0.2, droop: 0.9, cols: LIME }),
    jade: (f, x, y, z, s = 1) => tree(f, x, y, z, { H: 0.8 * s, bare: 0.3, n: 16, L: 0.13 * s, W: 0.06 * s, shape: 'round', bushy: 0.32 * s, tr: 0.04 * s, wob: 0.05, cols: ['c#4a6e38/0.2', 'c#5d8a3a/0.2'] }),
    orchid: (f, x, y, z, s = 1, col = 'c#e88aa8/0.45') => { rosette(f, x, y, z, { n: 5, L: 0.5 * s, W: 0.09 * s, shape: 'strap', p0: 0.5, p1: 0.1, droop: 0.3, cols: ['c#3a6a3a/0.45'] });
      for (const a of [0.4, 2.9]) { const c = Math.cos(a), sn = Math.sin(a), q = t => [x + c * 0.5 * s * t * t, y + sn * 0.5 * s * t * t, z + 1.3 * s * t - 0.25 * s * t * t * t]; tube(f, 'c#5d8a3a/0.8', [q(0), q(0.4), q(0.75), q(1)], 0.008, 3);
        for (let k = 0; k < 4; k++) { const p = q(0.62 + k * 0.125); for (let j = 0; j < 3; j++) leaf(f, col, p, a + j * 2.09 + k, 0.3, 0.12 * s, 0.06 * s, { shape: 'round', fold: 0.2, droop: 0 }); } } },
    flytrap: (f, x, y, z, s = 1) => { stemmed(f, x, y, z, { n: 8, H: 0.3 * s, lean: 0.7, L: 0.11 * s, W: 0.06 * s, shape: 'round', cols: LIME, pitch: 0.9, fold: 0.9 }); },
    rubber: (f, x, y, z, s = 1) => { const top = tree(f, x, y, z, { H: 3.6 * s, bare: 0.18, n: 13, L: 0.75 * s, W: 0.2 * s, shape: 'oval', cols: ['c#2f4a2a/0.2', 'c#3a6a3a/0.2'], tr: 0.06 * s, droop: 0.25 }); leaf(f, 'c#b8361f/0.45', top, 0, 1.45, 0.5 * s, 0.03 * s, { shape: 'lance', droop: 0 }); },
    fiddle: (f, x, y, z, s = 1) => tree(f, x, y, z, { H: 5.6 * s, bare: 0.38, n: 18, L: 1.0 * s, W: 0.3 * s, shape: 'round', cols: DEEP, tr: 0.09 * s, droop: 0.3, pitch: 0.2 }),
    olive: (f, x, y, z, s = 1) => tree(f, x, y, z, { H: 3.8 * s, bare: 0.5, n: 90, L: 0.36 * s, W: 0.075 * s, shape: 'lance', cols: ['c#9fb0a4/0.8', 'c#4a6e38/0.8'], bushy: 1.2 * s, tr: 0.09 * s, droop: 0.1, pitch: -0.2, bark: 'c#9a9590/0.8' }),
    dracaena: (f, x, y, z, s = 1) => tree(f, x, y, z, { H: 4.2 * s, bare: 1, n: 0, tr: 0.07 * s, wob: 0.3, bark: 'c#b08a5a/0.8', crown: { n: 22, L: 1.3 * s, W: 0.045 * s, shape: 'strap', p0: 1.4, p1: -0.2, droop: 0.7, cols: ['c#4a6e38/0.45', 'c#8a1c1c/0.45', 'c#3a6a3a/0.45'] } }),
    ponytail: (f, x, y, z, s = 1) => { ves(f, 'c#b08a5a/0.8', x, y, z - 0.02, [[0, 0], [0.2 * s, 0], [0.25 * s, 0.12 * s], [0.2 * s, 0.3 * s], [0.08 * s, 0.6 * s], [0.055 * s, 1.5 * s], [0, 1.52 * s]], 10); rosette(f, x, y, z + 1.48 * s, { n: 38, L: 1.5 * s, W: 0.025 * s, shape: 'strap', p0: 1.3, p1: 0.1, droop: 1.3, cols: LIME }); },
    banana: (f, x, y, z, s = 1) => { ves(f, 'c#7fa04a/0.8', x, y, z, [[0, 0], [0.2 * s, 0], [0.13 * s, 2.2 * s], [0, 2.3 * s]], 8); rosette(f, x, y, z + 2.1 * s, { n: 9, L: 1.9 * s, W: 0.33 * s, shape: 'paddle', p0: 1.4, p1: 0.6, droop: 0.5, fold: 0.25, cols: ['c#5d8a3a/0.8', 'c#7fa04a/0.8', 'c#4a6e38/0.8'] }); },
    opuntia: (f, x, y, z, s = 1) => { const c = 'c#5d8a3a/0.8'; leaf(f, c, [x, y, z], 0.3, 1.5, 0.5 * s, 0.17 * s, { shape: 'round', fold: 0, droop: 0 }); leaf(f, c, [x + 0.03, y + 0.02, z + 0.42 * s], 0.3, 1.0, 0.34 * s, 0.13 * s, { shape: 'round', fold: 0, droop: 0 }); leaf(f, c, [x - 0.02, y, z + 0.4 * s], 3.4, 1.05, 0.3 * s, 0.12 * s, { shape: 'round', fold: 0, droop: 0 }); ball(f, 'c#e88aa8/0.8', x + 0.2 * s, y + 0.07 * s, z + 0.66 * s, 0.03 * s, 6); },
    column: (f, x, y, z, s = 1) => cactus(f, x, y, z, { H: 0.55 * s, r: 0.07 * s, arms: s > 1.5 ? [[1, 0.2 * s, 0.2 * s]] : [] }),
    barrel: (f, x, y, z, s = 1) => { ves(f, 'c#4a6e38/0.8', x, y, z - 0.01, [[0, 0], [0.08 * s, 0], [0.13 * s, 0.08 * s], [0.12 * s, 0.17 * s], [0.05 * s, 0.22 * s], [0, 0.22 * s]], 8); ball(f, pick(['c#e88aa8/0.8', 'c#f3d96a/0.8', 'c#e0782a/0.8']), x, y, z + 0.2 * s, 0.04 * s, 6, 0.7); },
    lithops: (f, x, y, z, s = 1) => { for (const [dx, dy] of [[-0.05, 0], [0.05, 0.02], [0, -0.07]]) ball(f, pick(['c#9a9590/0.8', 'c#9fb0a4/0.8', 'c#c9b48a/0.8']), x + dx * s, y + dy * s, z - 0.02, 0.045 * s, 6, 0.7); },
    pothos: (f, x, y, z, s = 1, r = 0.3) => trail(f, x, y, z, { n: 7, len: 1.9 * s, L: 0.24 * s, W: 0.1 * s, cols: ['c#7fa04a/0.8', 'c#5d8a3a/0.8', 'c#e8c73a/0.8'], r }),
    philo: (f, x, y, z, s = 1, r = 0.3) => trail(f, x, y, z, { n: 7, len: 2.2 * s, L: 0.3 * s, W: 0.12 * s, cols: DEEP, r, step: 0.26 }),
    hearts: (f, x, y, z, s = 1, r = 0.3) => trail(f, x, y, z, { n: 9, len: 2.4 * s, L: 0.08 * s, W: 0.045 * s, cols: ['c#9fb0a4/0.8', 'c#e88aa8/0.8'], r, step: 0.16, vine: 'c#8a5ab0/0.8', top: 4 }),
    burro: (f, x, y, z, s = 1, r = 0.3) => trail(f, x, y, z, { n: 7, len: 1.2 * s, L: 0.1 * s, W: 0.035 * s, shape: 'lance', cols: GREY, r, step: 0.09, top: 5 }),
    wandering: (f, x, y, z, s = 1, r = 0.3) => trail(f, x, y, z, { n: 8, len: 1.5 * s, L: 0.2 * s, W: 0.06 * s, shape: 'lance', cols: ['c#4a2240/0.45', 'c#8a5ab0/0.45', 'c#9fb0a4/0.45'], r, vine: 'c#8a5ab0/0.8' }),
    ivy: (f, x, y, z, s = 1, r = 0.3) => trail(f, x, y, z, { n: 8, len: 1.7 * s, L: 0.14 * s, W: 0.07 * s, cols: ['c#3a6a3a/0.8', 'c#d9cdb2/0.8', 'c#4a6e38/0.8'], r, step: 0.15 }),
    stick: (f, x, y, z, s = 1) => tube(f, 'c#6a4a2a/0.8', [[x, y, z], [x + 0.03, y, z + 0.5 * s], [x - 0.02, y + 0.02, z + 0.9 * s]], 0.015, 4),
    daisy: (f, x, y, z, s = 1, col = 'c#f3d96a/0.8') => { rosette(f, x, y, z, { n: 9, L: 0.3 * s, W: 0.07 * s, shape: 'oval', p0: 1.0, p1: 0.2, cols: GREENS }); for (let i = 0; i < 6; i++) { const a = i * 1.1 + rnd(), d = 0.14 * s * rnd(), h = (0.3 + rnd() * 0.25) * s; f.box('c#5d8a3a/0.8', x + Math.cos(a) * d - 0.006, x + Math.cos(a) * d + 0.006, y + Math.sin(a) * d - 0.006, y + Math.sin(a) * d + 0.006, z, z + h); ball(f, col, x + Math.cos(a) * d, y + Math.sin(a) * d, z + h - 0.02, 0.06 * s, 6, 0.6); } },
  };
  // a named plant in a pot: grow(frame, x, y, z, 'species', { r, h, pot, style, s })
  const grow = (f, x, y, z, kind, o = {}) => { const r = o.r ?? 0.26, sz = pot(f, x, y, z, r, o.h ?? r * 1.5, o.pot ?? CLAY, o.style ?? 'std'); SP[kind](f, x, y, sz, o.s ?? 1, o.x); return sz; };
  // a handwritten tag on a stake, facing the frame's front
  function tagF(f, x, y, z, name, note, o = {}) {
    const w = o.w ?? 0.8, t = w * 0.625, s = o.stick ?? 0.5;
    if (s) f.box(KRAFT, x - 0.025, x + 0.025, y - 0.022, y - 0.006, z - 0.05, z + s + t * 0.7);
    f.box('c#d9cdb2/0.8', x - w / 2, x + w / 2, y - 0.006, y + 0.002, z + s, z + s + t);
    kit.sign(f, x, y + 0.007, z + s + t / 2, w, t, TAG(name, note, o.c), { cw: 240, ch: 150 });
  }
  // the same in room coordinates. face: 'street' is read from the door side, 'back' from the back of the shop,
  // 'left' by someone standing to its left (smaller a), 'right' from its right
  const tag = (a, d, h, face, name, note, o) => tagF(at(a, d, h, face), 0, 0, 0, name, note, o);
  const sg = (a, d, h, face, w, t, draw, o) => kit.sign(at(a, d, 0, face), 0, 0, h, w, t, draw, o);
  // a basket hung from the ceiling, rim at z; returns the soil height
  function hang(f, x, y, z, o = {}) {
    const r = o.r ?? 0.42, h = o.h ?? 0.5;
    f.cyl('c#17140f/0.8', x, y, z + 1.5, 12, 0.012, 0.012, 4);
    for (let i = 0; i < 3; i++) tube(f, o.cord ?? 'c#17140f/0.8', [[x, y, z + 1.5], [x + Math.cos(i * 2.094) * r, y + Math.sin(i * 2.094) * r, z]], 0.009, 3);
    return pot(f, x, y, z - h, r, h, o.pot ?? CREAM, o.style ?? 'bowl');
  }
  // knotted cotton round a pot whose rim is at z, hung from zt
  function macrame(f, x, y, zt, z, r, h) {
    f.cyl(BRASS, x, y, zt - 0.1, zt, 0.07, 0.07, 8);
    for (let i = 0; i < 4; i++) { const c = Math.cos(i * 1.571 + 0.78), s = Math.sin(i * 1.571 + 0.78); tube(f, CORD, [[x, y, zt - 0.1], [x + c * r * 0.5, y + s * r * 0.5, z + (zt - z) * 0.35], [x + c * (r + 0.03), y + s * (r + 0.03), z - h * 0.2], [x + c * r * 0.75, y + s * r * 0.75, z - h * 0.95], [x, y, z - h - 0.12]], 0.014, 4); }
    ball(f, CORD, x, y, z - h - 0.2, 0.05, 6); ves(f, CORD, x, y, z - h - 0.75, [[0.07, 0], [0.05, 0.3], [0.025, 0.56], [0, 0.57]], 6);
  }
  // a stack of clay pots, one inside the next (only the bottom one is whole and only the top one has an inside)
  const stack = (f, x, y, z, n, r = 0.22) => { for (let k = 0; k < n; k++) ves(f, CLAY, x, y, z + k * r * 0.42,
    k === n - 1 ? [[0, 0], [r * 0.7, 0], [r * 0.94, r * 1.2], [r * 1.07, r * 1.24], [r * 1.07, r * 1.45], [r * 0.93, r * 1.45], [r * 0.7, r * 0.1], [0, r * 0.1]]
      : k ? [[r * 0.9, r * 0.98], [r * 0.94, r * 1.2], [r * 1.07, r * 1.24], [r * 1.07, r * 1.45], [r * 0.93, r * 1.45]] : [[0, 0], [r * 0.7, 0], [r * 0.94, r * 1.2], [r * 1.07, r * 1.24], [r * 1.07, r * 1.45], [r * 0.93, r * 1.45]], 10); };
  const mister = (f, x, y, z, m = BRASS) => { ves(f, m, x, y, z, [[0, 0], [0.12, 0], [0.15, 0.08], [0.15, 0.22], [0.06, 0.33], [0.045, 0.4], [0, 0.4]], 12); f.cyl(m, x, y, z + 0.4, z + 0.5, 0.025, 0.025, 6); ball(f, m, x, y, z + 0.49, 0.04, 6); tube(f, m, [[x, y, z + 0.36], [x + 0.14, y, z + 0.4], [x + 0.2, y, z + 0.4]], 0.012, 4); tube(f, m, [[x - 0.05, y, z + 0.36], [x - 0.2, y, z + 0.3], [x - 0.17, y, z + 0.12]], 0.012, 4); };
  const can = (f, x, y, z, s = 1, m = ZINC, az = 0) => { const c = Math.cos(az), sn = Math.sin(az); ves(f, m, x, y, z, [[0, 0], [0.3 * s, 0], [0.3 * s, 0.6 * s], [0.26 * s, 0.6 * s], [0.26 * s, 0.05], [0, 0.05]], 12); tube(f, m, [[x + c * 0.28 * s, y + sn * 0.28 * s, z + 0.12 * s], [x + c * 0.7 * s, y + sn * 0.7 * s, z + 0.62 * s], [x + c * 0.85 * s, y + sn * 0.85 * s, z + 0.72 * s]], 0.035 * s, 5); tube(f, m, [[x - c * 0.28 * s, y - sn * 0.28 * s, z + 0.52 * s], [x - c * 0.58 * s, y - sn * 0.58 * s, z + 0.45 * s], [x - c * 0.52 * s, y - sn * 0.52 * s, z + 0.12 * s], [x - c * 0.29 * s, y - sn * 0.29 * s, z + 0.1 * s]], 0.02 * s, 4); };

  // ---- the plan, from the plot ------------------------------------------------------------------------------
  const DOOR = lot.doorA;                                     // the door is toward the right; the window is left of it
  const M = DOOR > W / 2, sgn = M ? 1 : -1;                   // M: the door is toward the right, as first drawn; otherwise the plan is mirrored
  const mx = a => M ? a : W - a, fl = f => M ? f : ({ left: 'right', right: 'left' }[f] ?? f);
  const LW = d => at(0, d, 0, 'right'), RW = d => at(W, d, 0, 'left');   // frames on the side walls: +y comes out into the room; +x runs to the street on the left wall, to the back on the right
  const BX0 = M ? 0.5 : DOOR + 3.1, BX1 = M ? DOOR - 3.1 : W - 0.5;   // the window bed
  const TA = W / 2, T0 = 8.4, T1 = 18.8;                      // the long table: centre line, front end, back end
  const S0 = 6.2, S1 = 18.2;                                  // the staging down both walls
  const PW = 22.6;                                            // the propagation wall, on the left past the staging
  const PD = 29.2;                                            // the glazed partition (under a beam); the potting room is behind it
  const CA = W - 4.12, CD = 25.9;                             // the counter, across the right in front of the screen
  const SAGE2 = 'painted_wood#93a488', TRIMW = 'painted_wood#efe8d8', BRICKW = 'brick#ddd5c8', COPPER = 'c#b06a3c/0.32/1';

  // ---- the room itself: the partition, a boarded dado on it, a rail down the side walls -------------------------
  const A = arch(kit, lot, K);
  const P = A.partition(PD, { openings: [{ a0: 3.8, a1: 7.6, z1: 8.4 }, { a0: 8.6, a1: W - 0.77, z0: 3.4, z1: 8.4, glass: true, bars: 5 }] });
  A.wainscot({ d: P.front, side: 'front' }, 0.08, 3.34, { h: 3.2, mat: SAGE, style: 'panel' });
  A.wainscot({ d: P.front, side: 'front' }, 8.08, W - 0.08, { h: 3.2, mat: SAGE, style: 'panel' });
  for (const w of ['left', 'right']) A.rail(w, 0.3, P.front - 0.07, { z: 9.6 });

  // ---- the window: a raised bed, the show-offs in it ------------------------------------------------------
  {
    const x0 = BX0, x1 = BX1, y0 = 0.35, y1 = 4.3, top = 1.5, bx = t => x0 + (x1 - x0) * t, mid = bx(0.5);
    for (const [a, b, c, d] of [[x0, x1, y0, y0 + 0.14], [x0, x1, y1 - 0.14, y1], [x0, x0 + 0.14, y0 + 0.14, y1 - 0.14], [x1 - 0.14, x1, y0 + 0.14, y1 - 0.14]]) R.box(DARKW, a, b, c, d, 0, top, G);
    for (const x of [x0 - 0.03, bx(0.33), bx(0.67), x1 - 0.11]) R.box(DARKW, x, x + 0.14, y1, y1 + 0.05, 0, top, G);
    R.box('soilbed', x0 + 0.14, x1 - 0.14, y0 + 0.14, y1 - 0.14, 0.3, top - 0.1); R.block(x0, x1, y0, y1, 0, 3.4);
    const z = top - 0.1;
    kit.model('calathea_orbifolia_01', R, mid, 2.6, z - 0.03, 0, { scale: 0.9 });
    SP.bop(R, bx(0.2), 1.9, z, 1.2); SP.alocasia(R, bx(0.86), 1.7, z, 1.4); SP.dracaena(R, bx(0.36), 1.0, z, 0.95); SP.croton(R, bx(0.7), 1.1, z, 1.7);
    SP.nest(R, bx(0.07), 3.5, z, 0.9); SP.bromeliad(R, bx(0.93), 3.6, z, 0.9); SP.fittonia(R, bx(0.27), 3.7, z, 1.6); SP.fittonia(R, bx(0.72), 3.7, z, 1.6);
    for (const [t, y, r] of [[0.06, 1.1, 0.3], [0.55, 3.8, 0.24], [0.95, 1.0, 0.26]]) ball(R, 'c#5d8a3a/0.8', bx(t), y, z - r * 0.3, r, 8, 0.5);
    tag(bx(0.2), 0.75, z, 'street', 'Josephine', 'Bird of paradise. Has never flowered. Says she is saving it.', { stick: 0.75 });
    // the hand-lettered card, on two stakes, for the street
    for (const x of [mid - 0.8, mid + 0.8]) R.box(KRAFT, x - 0.03, x + 0.03, 0.74, 0.78, z - 0.1, z + 1.6);
    R.box('c#d9cdb2/0.8', mid - 1.0, mid + 1.0, 0.71, 0.74, z + 0.75, z + 2.05);
    sg(mid, 0.705, z + 1.4, 'street', 2.0, 1.3, CARD('frond', 'everything in this window is alive\nand knows it.', { ts: 0.3, ty: 0.3, by: 0.56, bs: 0.125 }), { cw: 400, ch: 260 });
    // two baskets in the window
    SP.pothos(R, bx(0.24), 2.6, hang(R, bx(0.24), 2.6, 7.6, { pot: CLAY, r: 0.5 }), 1.5, 0.5); SP.philo(R, bx(0.8), 2.3, hang(R, bx(0.8), 2.3, 7.4, { pot: TEAL, r: 0.5 }), 1.4, 0.5);
  }
  // Big Susan has the corner on the other side of the door
  { const a = mx(W - 1.9), d = 1.9; grow(R, a, d, 0, 'fiddle', { r: 0.85, h: 1.5, pot: NAVY, style: 'taper', s: 1.15 }); R.block(a - 0.85, a + 0.85, d - 0.85, d + 0.85, 0, 3);
    tag(a, d + 0.55, 1.38, 'back', 'Big Susan', 'Fiddle-leaf fig. Do not move her. We lost eleven leaves.', { stick: 0.6, w: 0.95 }); }

  { const a = 1.7, d = 4.7; grow(R, a, d, 0, 'nest', { r: 0.55, h: 0.6, pot: COAL, style: 'bowl', s: 1.5 }); R.block(a - 0.55, a + 0.55, d - 0.55, d + 0.55, 0, 2); }

  // ---- staging down both walls: three slatted steps of nursery stock, a trellis above, one climber each ------
  {
    const TIERS = [[3.4, 0.08, 0.8], [2.4, 0.84, 1.56], [1.4, 1.6, 2.32]], TRAIL = new Set(['pothos', 'philo', 'hearts', 'burro', 'wandering', 'ivy']);
    const staging = (c, x0, x1) => {
      const n = Math.max(2, Math.round((x1 - x0) / 4));
      for (const [z, y0, y1] of TIERS) {
        const w = (y1 - y0 - 0.08) / 3;
        for (let k = 0; k < 3; k++) c.box(SAGE, x0, x1, y0 + k * (w + 0.04), y0 + k * (w + 0.04) + w, z - 0.07, z, G);
        c.box(SAGE, x0 + 0.03, x1 - 0.03, y1 - 0.07, y1 - 0.02, z - 0.34, z - 0.075, G);
      }
      for (let i = 0; i <= n; i++) {
        const x = x0 + 0.1 + (x1 - x0 - 0.2) * i / n;
        for (const [z, ya, yb] of [[3.4, 0.1, 0.725], [2.4, 0.65, 1.485], [1.4, 1.41, 2.245]]) c.box(SAGE, x - 0.055, x + 0.055, ya, yb, z - 0.19, z - 0.075, G);
        for (const [y, z] of [[0.16, 3.4], [0.69, 3.4], [1.45, 2.4], [2.2, 1.4]]) c.box(SAGE, x - 0.04, x + 0.04, y - 0.04, y + 0.04, 0, z - 0.1, G);
      }
      c.block(x0, x1, 0, 2.32, 0, 4.2);
    };
    // rows: one list per step, top first: [species, how many, scale, pot radius]; set out from x = from toward x = to
    const stock = (c, from, to, rows) => rows.forEach((row, ti) => {
      const [z, y0, y1] = TIERS[ti], dir = Math.sign(to - from); let x = from;
      for (let gi = 0; (to - x) * dir > 0.6; gi++) {
        const [kind, n, sc, r] = row[gi % row.length];
        for (let i = 0; i < n && (to - x) * dir > r * 2; i++) { const px = x + dir * r, py = (y0 + y1) / 2 + (rnd() - 0.5) * 0.08, sz = pot(c, px, py, z, r, r * 1.5, CLAY); SP[kind](c, px, py, sz, sc * (0.9 + rnd() * 0.2), TRAIL.has(kind) ? r : undefined); x += dir * (r * 2 + 0.33); }
        x += dir * 0.42;
      }
    });
    const trellis = (c, x0, x1, z0, z1) => {
      const nx = Math.round((x1 - x0) / 1.1), nz = Math.round((z1 - z0) / 1.1);
      for (let i = 0; i <= nx; i++) { const x = x0 + (x1 - x0) * i / nx; c.box(SAGE2, x - 0.035, x + 0.035, 0.02, 0.05, z0, z1, G); }
      for (let j = 0; j <= nz; j++) { const z = z0 + (z1 - z0) * j / nz; c.box(SAGE2, x0 - 0.035, x1 + 0.035, 0.05, 0.08, z - 0.035, z + 0.035, G); }
    };
    // a climber from a pot at (x, y), soil at z: its stems go to the wall, up the trellis and along it (dir)
    const climber = (c, x, y, z, o = {}) => {
      const n = o.n ?? 7, dir = o.dir ?? 1, cols = o.cols ?? DEEP, m = 13;
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1), run = (o.run ?? 6) * (0.12 + 0.88 * u), top = (o.top ?? 9.0) - (o.fall ?? 2.4) * u * (0.6 + 0.4 * rnd()), ph = rnd() * 6, pts = [];
        for (let k = 0; k <= m; k++) { const t = k / m; pts.push([x + dir * run * Math.pow(t, 1.4) + 0.12 * Math.sin(t * 7 + ph) * t, y + (0.13 - y) * Math.min(1, t * 5), z + (top - z) * Math.pow(t, 0.75)]); }
        tube(c, 'c#4a6e38/0.8', pts, 0.012, 3);
        for (let k = 2; k <= m; k++) for (let q = 0; q < 2; q++) leaf(c, pick(cols), [pts[k][0] + (rnd() - 0.5) * 0.34, pts[k][1], pts[k][2] + (rnd() - 0.5) * 0.34], Math.PI / 2 + (rnd() - 0.5) * 2.6, -0.55 + rnd() * 0.5, (o.L ?? 0.34) * (0.8 + rnd() * 0.4), o.W ?? 0.15, { shape: 'heart', droop: 0.25, fold: 0.25 });
      }
    };
    const mid = (S0 + S1) / 2, h = (S1 - S0) / 2;
    // the left wall: the leafy side
    { const c = LW(mid); staging(c, -h, h); trellis(c, -h + 0.5, h - 0.5, 4.75, 9.15);
      stock(c, -h + 0.35, h - 1.5, [[['peace', 3, 1.0, 0.3], ['calathea', 3, 0.9, 0.3], ['nest', 2, 0.75, 0.3], ['anthurium', 3, 1.0, 0.28]],
        [['begonia', 4, 0.9, 0.22], ['pilea', 4, 1.0, 0.22], ['peperomia', 4, 1.0, 0.22], ['oxalis', 3, 1.0, 0.22]],
        [['fittonia', 5, 0.8, 0.17], ['violet', 3, 0.8, 0.16], ['haworthia', 4, 0.9, 0.15], ['fittonia', 4, 0.8, 0.17]]]);
      climber(c, h - 0.7, 0.44, pot(c, h - 0.7, 0.44, 3.4, 0.36, 0.56, CLAY), { dir: -1, run: 7.5 });
      stack(c, -h + 1.4, 1.1, 0.02, 6, 0.36); stack(c, -h + 2.3, 1.15, 0.02, 4, 0.36); can(c, 1.2, 1.0, 0.02, 1.1, ZINC, 1.2); stack(c, h - 2.2, 1.9, 0.02, 4, 0.28); }
    // the right wall: the dry side
    { const c = RW(mid); staging(c, -h, h); trellis(c, -h + 0.5, h - 0.5, 4.75, 9.15);
      stock(c, h - 0.35, -h + 1.5, [[['croton', 3, 1.1, 0.3], ['bromeliad', 3, 1.1, 0.28], ['aloe', 3, 1.5, 0.28], ['jade', 3, 1.3, 0.28]],
        [['agave', 4, 0.8, 0.22], ['echeveria', 4, 1.8, 0.2], ['aloe', 4, 0.85, 0.2], ['peperomia', 3, 1.1, 0.22]],
        [['barrel', 5, 1.0, 0.16], ['column', 5, 1.3, 0.14], ['lithops', 4, 1.0, 0.15], ['echeveria', 5, 0.9, 0.15]]]);
      climber(c, -h + 0.7, 0.44, pot(c, -h + 0.7, 0.44, 3.4, 0.36, 0.56, CLAY), { dir: 1, run: 7.5, cols: ['c#3a6a3a/0.8', 'c#4a6e38/0.8', 'c#5d8a3a/0.8'] });
      stack(c, h - 1.4, 1.1, 0.02, 6, 0.36); stack(c, h - 2.4, 1.15, 0.02, 3, 0.36); stack(c, -h + 2.6, 1.9, 0.02, 5, 0.28); }
  }

  // ---- the long table ------------------------------------------------------------------------------------------
  {
    const TOP = X.plinth(R, TA, (T0 + T1) / 2, 3.6, T1 - T0, 2.7, { mat: OAK, shelf: 0.9 });
    // Doug has the end that faces the door
    grow(R, TA, T0 + 1.2, TOP, 'ponytail', { r: 0.42, h: 0.5, pot: CLAY, style: 'bowl', s: 0.95 });
    tag(TA, T0 + 0.55, TOP, 'street', 'Doug', 'Ponytail palm. Stores water in his bottom.', { stick: 0, w: 0.8 });
    grow(R, TA - sgn * 0.9, T0 + 2.6, TOP, 'pilea', { r: 0.26, pot: WHITE, style: 'bowl', s: 1.2 });
    grow(R, TA + sgn * 0.85, T0 + 3.4, TOP, 'peace', { r: 0.32, pot: CREAM, s: 1.15 }); tag(TA + sgn * 1.33, T0 + 3.4, TOP, fl('right'), 'Hamlet', 'Peace lily. Faints when thirsty. He is acting. Water him anyway.', { stick: 0, w: 0.66 });
    // one tray of succulents
    { const x = TA - sgn * 0.75, y = T0 + 4.7, kinds = ['echeveria', 'column', 'haworthia', 'barrel', 'aloe', 'echeveria', 'lithops', 'opuntia'];
      R.soft(ZINC, x - 0.6, x + 0.6, y - 0.95, y + 0.95, TOP, TOP + 0.1, 0.03);
      kinds.forEach((k, i) => { const px = x - 0.27 + (i % 2) * 0.54, py = y - 0.66 + Math.floor(i / 2) * 0.44, r = 0.13 + (i % 3) * 0.015, sz = pot(R, px, py, TOP + 0.1, r, r * 1.5, [CLAY, WHITE, CLAY, CELADON, CLAY, CORAL, CLAY, MUSTARD][i], i % 3 === 1 ? 'cyl' : 'std');
        if (k === 'aloe') SP.aloe(R, px, py, sz, 0.42); else if (k === 'echeveria') SP.echeveria(R, px, py, sz, 0.9, i ? ['c#e8907a/0.8', 'c#9fb0a4/0.8'] : GREY); else SP[k](R, px, py, sz, k === 'column' ? 1.5 : 1); }); }
    grow(R, TA + sgn * 0.85, T0 + 6.2, TOP, 'orchid', { r: 0.24, h: 0.42, pot: WHITE, style: 'cyl', s: 1.1 });
    grow(R, TA - sgn * 0.85, T0 + 7.2, TOP, 'calathea', { r: 0.34, pot: TEAL, style: 'cyl', s: 1.1 });
    grow(R, TA + sgn * 0.8, T0 + 8.6, TOP, 'anthurium', { r: 0.3, pot: COAL, style: 'cyl', s: 1.1 });
    kit.pottedPlant(R, TA - sgn * 0.8, T0 + 9.4, TOP, 'fern', { size: 0.6, pot: CLAY, block: false });
    // (the far end of the table is left empty)
    // under it
    stack(R, TA - sgn * 0.9, T0 + 0.9, 0.9, 5, 0.3); stack(R, TA - sgn * 0.1, T0 + 1.2, 0.9, 3, 0.3); can(R, TA + sgn * 0.5, T0 + 4.0, 0.9, 1.2, ZINC, 1.0);
    for (let i = 0; i < 3; i++) pot(R, TA - sgn * 0.7 + i * 0.7, T0 + 7.0 + i * 1.1, 0.9, 0.36, 0.6, GLAZES[(i * 3 + 1) % GLAZES.length], ['egg', 'cyl', 'taper'][i], true);
  }

  // ---- lamps and baskets by turns, down the middle from the beams; four more baskets over the staging ---------
  for (const d of [5.8, 11, 16.2, 21.4]) X.pendant(R, TA, d, { kind: 'dome', drop: 4.3, colour: 'c#4a6e38/0.45', power: 0.95 });
  SP.pothos(R, TA, 8.4, hang(R, TA, 8.4, 8.5, { pot: CELADON }), 1.1, 0.42); SP.ivy(R, TA, 13.6, hang(R, TA, 13.6, 8.5, { pot: CORAL, r: 0.38 }), 1.1, 0.38); SP.hearts(R, TA, 18.8, hang(R, TA, 18.8, 8.5, { pot: WHITE, r: 0.38 }), 0.9, 0.38);
  SP.philo(R, 2.0, 8.4, hang(R, 2.0, 8.4, 8.9, { pot: MUSTARD }), 0.9, 0.42); SP.wandering(R, 2.0, 13.6, hang(R, 2.0, 13.6, 8.9, { pot: WHITE, r: 0.38 }), 1.1, 0.38);
  SP.ivy(R, W - 2.0, 8.4, hang(R, W - 2.0, 8.4, 8.9, { pot: TEAL, r: 0.38 }), 1.0, 0.38); SP.pothos(R, W - 2.0, 13.6, hang(R, W - 2.0, 13.6, 8.9, { pot: CREAM }), 1.0, 0.42);

  // ---- Kenneth, where the table ends -----------------------------------------------------------------------------
  { const a = TA, d = 21.3; grow(R, a, d, 0, 'parlour', { r: 0.7, h: 1.2, pot: 'wicker', style: 'cyl', s: 1.7 }); R.block(a - 0.7, a + 0.7, d - 0.7, d + 0.7, 0, 3); }

  // ---- on the right, between the staging and the counter: Gerald, Robert and a fern ----------------------------
  { const a = W - 2.2, d = 20.5, z = pot(R, a, d, 0, 0.85, 1.35, MUSTARD, 'egg'); R.cyl('c#6a4a2a/0.8', a, d, z, z + 4.2, 0.09, 0.08, 8);
    stemmed(R, a, d, z, { n: 9, H: 3.2, lean: 0.32, L: 1.45, W: 0.58, shape: 'heart', cols: DEEP, pitch: -0.45 }); stemmed(R, a, d, z + 2.2, { n: 5, H: 2.0, lean: 0.4, L: 1.2, W: 0.5, shape: 'heart', cols: DEEP, pitch: -0.5 });
    R.block(a - 0.85, a + 0.85, d - 0.85, d + 0.85, 0, 3); tag(a - 0.75, d - 0.6, 0, 'street', 'Gerald', 'Monstera. Thrives on neglect. Do not make eye contact.', { stick: 1.5, w: 1.0 }); }
  { const a = W - 1.5, d = 23.3; grow(R, a, d, 0, 'rubber', { r: 0.6, h: 1.1, pot: COAL, style: 'egg', s: 1.1 }); R.block(a - 0.6, a + 0.6, d - 0.6, d + 0.6, 0, 3); }
  kit.pottedPlant(R, W - 4.0, 22.2, 0, 'fern', { size: 1.25, pot: STONE });

  // ---- the propagation wall, on the left: cuttings in jars of water ---------------------------------------------
  {
    const p = LW(PW);
    p.box(PALE, -3.0, 3.0, 0.02, 0.09, 3.4, 8.0, G);
    [4.0, 5.2, 6.4].forEach((z, ri) => {
      p.box(OAK, -2.9, 2.9, 0.09, 0.52, z - 0.06, z, G); for (const x of [-2.6, 0, 2.6]) p.box(OAK, x - 0.03, x + 0.03, 0.09, 0.4, z - 0.16, z - 0.06, G);
      for (let j = 0; j < 7; j++) {
        const x = -2.4 + j * 0.8, y = 0.3, k = (j + ri * 2) % 4;
        if (ri === 1 && j === 4) { X.card(p, x, y, z, 0.6, 0.38, TAG('week 3', 'ROOTS. we screamed a little.'), { cw: 200, ch: 128 }); continue; }
        if ((j * 3 + ri * 5) % 7 === 0) continue;                // a gap on the shelf
        const [prof, wr, wh] = k === 0 ? [[[0, 0], [0.09, 0], [0.16, 0.1], [0.14, 0.24], [0.05, 0.32], [0.05, 0.44], [0.065, 0.45]], 0.12, 0.2] : k === 1 ? [[[0, 0], [0.045, 0.03], [0.05, 0.55], [0.06, 0.56]], 0.04, 0.4] : k === 2 ? [[[0, 0], [0.11, 0], [0.11, 0.3], [0.05, 0.38], [0.05, 0.48], [0.06, 0.49]], 0.095, 0.24] : [[[0, 0], [0.07, 0], [0.13, 0.16], [0.13, 0.3], [0.1, 0.36], [0.11, 0.37]], 0.1, 0.25];
        ves(p, 'glass', x, y, z, prof, 10); ves(p, 'c#c9d6d8/0.2', x, y, z + 0.02, [[0, 0], [wr * 0.8, 0], [wr, wh * 0.5], [wr * 0.9, wh], [0, wh]], 8);
        const top = prof[prof.length - 1][1], lean = (rnd() - 0.5) * 0.2, c = pick([LIME, DEEP, GREENS, PURPLE, ['c#7fa04a/0.8', 'c#e8c73a/0.8']]);
        tube(p, 'c#5d8a3a/0.8', [[x, y, z + 0.06], [x, y, z + top], [x + lean, y + 0.03, z + top + 0.28]], 0.008, 3);
        for (let q = 0; q < 2 + (j % 2); q++) leaf(p, pick(c), [x + lean * (0.6 + q * 0.2), y + 0.03, z + top + 0.14 + q * 0.08], q * 2.2 + j, 0.3 + q * 0.3, 0.2 + rnd() * 0.1, 0.08, { shape: k % 2 ? 'heart' : 'oval' });
        for (const dx of [-0.02, 0.025]) tube(p, 'c#f4f1ea/0.8', [[x, y, z + 0.12], [x + dx, y, z + 0.04]], 0.004, 3);
      }
    });
    kit.sign(p, 0, 0.1, 7.5, 4.2, 0.66, BOARD('THE PROPAGATION WALL', 'everyone here is a beginner. be nice.', '#e6e0cf', '#34553a'), { cw: 640, ch: 100 });
    // the bench below: the mother plant, and what the cuttings will move into
    p.box(OAK, -2.95, 2.95, 0.08, 1.65, 1.4, 1.5, G); for (const x of [-2.8, 0, 2.8]) for (const y of [0.2, 1.5]) p.box(OAK, x - 0.07, x + 0.07, y - 0.07, y + 0.07, 0, 1.4, G); p.box(OAK, -2.8, 2.8, 0.2, 1.45, 0.35, 0.42, G);
    p.block(-2.95, 2.95, 0, 1.65, 0, 3);
    grow(p, 1.7, 0.85, 1.5, 'spider', { r: 0.3, pot: CORAL, style: 'egg', h: 0.5, s: 1.0 }); mister(p, 0.4, 0.9, 1.5); for (let i = 0; i < 3; i++) pot(p, -2.2 + i * 0.6, 0.8, 1.5, 0.14, 0.22, CLAY, 'std', true);
    stack(p, -2.0, 0.8, 0.42, 5, 0.24); can(p, 0.6, 0.85, 0.42, 1, COPPER, 0.4);
  }
  // the corner past it: a tall cactus and an agave, under the house rules
  { const a = 1.5, d = 27.3, z = pot(R, a, d, 0, 0.55, 0.9, CLAY); cactus(R, a, d, z, { H: 4.4, r: 0.3, seg: 10, arms: [[1.2, 1.9, 1.5], [4.1, 2.5, 1.0]], flower: 'c#e88aa8/0.8' }); R.block(a - 0.6, a + 0.6, d - 0.6, d + 0.6, 0, 5);
    tag(a + 0.1, d - 0.5, z, 'street', 'Do Not Hug', 'Saguaro. We know you want to.', { stick: 0.5, w: 0.75 });
    grow(R, 2.9, 26.2, 0, 'agave', { r: 0.48, h: 0.62, pot: STONE, style: 'bowl', s: 1.5 }); R.block(2.45, 3.35, 25.75, 26.65, 0, 2);
    X.slateBoard(at(1.7, P.front, 0, 'street'), 0, 7.05, 2.8, 1.4, RULES, { cw: 700, ch: 350 }); }

  // ---- the counter, across the right in front of the glazed screen, with Moss behind it ---------------------
  {
    const c = at(CA, CD, 0, 'street');                         // +y the customers' side, +x toward the middle of the room
    const TOP = X.counter(c, -3.35, 3.35, -0.9, 0.9, 3.3, { front: SAGE, top: 'oak_light#b89466' });
    // the till
    { const x = 0.5, y = -0.3, z = TOP;
      X.till(c, x, y + 0.06, z, { body: 'c#2f5a6a/0.45' }); }      // keys toward Moss (-y); the flags face the customer
    // brown paper on its roll, twine, a mister, Audrey
    { const z = TOP; for (const x of [-2.75, -1.25]) c.box(DARKW, x - 0.04, x + 0.04, -0.7, -0.4, z, z + 0.75); hcyl(c, KRAFT, 'x', -2.0, -0.55, z + 0.55, 1.4, 0.24); hcyl(c, DARKW, 'x', -2.0, -0.55, z + 0.55, 1.6, 0.03);
      c.box(KRAFT, -2.68, -1.32, -0.32, -0.31, z + 0.02, z + 0.55); c.box(KRAFT, -2.68, -1.32, -0.32, 0.6, z + 0.004, z + 0.016);
      ves(c, 'c#c9b48a/0.8', -0.75, -0.5, z, [[0, 0], [0.2, 0], [0.2, 0.03], [0.14, 0.05], [0.07, 0.42], [0.03, 0.44], [0, 0.44]], 12); tube(c, 'c#c9b48a/0.8', [[-0.7, -0.5, z + 0.3], [-0.85, 0.0, z + 0.02], [-1.05, 0.4, z + 0.02], [-0.8, 0.6, z + 0.02]], 0.008, 3);
      mister(c, 2.85, -0.35, z);
      const sz = pot(c, 2.0, 0.4, z, 0.15, 0.2, WHITE, 'bowl'); SP.flytrap(c, 2.0, 0.4, sz, 1); tagF(c, 2.0, 0.62, z, 'Audrey', 'Venus flytrap. Do not feed. She is listening.', { stick: 0, w: 0.56 }); }
    for (const x of [-1.7, 1.7]) X.pendant(c, x, 0, { kind: 'cone', drop: 4.4, colour: BRASS, power: 0.9 });
  }

  // =================================================================================================================
  // THE POTTING ROOM, behind the screen: bare brick, and everything the shop is made from
  // =================================================================================================================
  R.box(BRICKW, 0.004, 0.03, P.back - 0.05, D - 0.004, 0.004, 11.99); R.box(BRICKW, W - 0.03, W - 0.004, P.back - 0.05, D - 0.004, 0.004, 11.99); 
  const BDA = W - (0.22 * (W + 1) - 0.5);                      // the back door's centre (backs.js); town.js cuts the doorway there, 3.1 wide and 6.95 high, and hangs the real door
  R.box(BRICKW, 0.03, BDA - 1.55, D - 0.03, D - 0.004, 0.004, 11.99); R.box(BRICKW, BDA + 1.55, W - 0.03, D - 0.03, D - 0.004, 0.004, 11.99); R.box(BRICKW, BDA - 1.55, BDA + 1.55, D - 0.03, D - 0.004, 6.95, 11.99);
  X.pendant(R, TA, 37.4, { kind: 'globe', drop: 3.6, power: 1.0 });

  // the back door's casing (the door is real: it leads to the yard and the Gloaming's stair) and a pair of boots beside it
  { const a0 = BDA - 1.55, a1 = BDA + 1.55;
    for (const a of [a0 - 0.3, a1]) R.box(TRIMW, a, a + 0.3, D - 0.16, D - 0.04, 0.004, 7.25, G); R.box(TRIMW, a0, a1, D - 0.16, D - 0.04, 6.95, 7.25, G);
    for (const a of [18.05, 18.5]) { ves(R, 'c#3f5a44/0.5', a, D - 0.5, 0.004, [[0, 0], [0.16, 0], [0.16, 0.12], [0.14, 0.3], [0.15, 1.15], [0.13, 1.15], [0.12, 0.3], [0, 0.28]], 10); R.soft('c#3f5a44/0.5', a - 0.14, a + 0.14, D - 0.95, D - 0.45, 0.004, 0.27, 0.09); } }

  // the stone sink, on the street door's own axis
  { const a0 = 2.4, a1 = 5.4, y0 = D - 1.8, y1 = D - 0.06, zb = 2.3, zt = 3.15;
    for (const a of [a0 + 0.2, a1 - 0.7]) R.box('brick', a, a + 0.5, y0 + 0.15, y1 - 0.1, 0.004, zb);
    R.box(STONE, a0, a1, y0, y1, zb, zb + 0.16); R.box(STONE, a0, a1, y0, y0 + 0.16, zb + 0.16, zt); R.box(STONE, a0, a1, y1 - 0.16, y1, zb + 0.16, zt);
    for (const a of [a0, a1 - 0.16]) R.box(STONE, a, a + 0.16, y0 + 0.16, y1 - 0.16, zb + 0.16, zt);
    R.box('c#5f7f86/0.12', a0 + 0.16, a1 - 0.16, y0 + 0.16, y1 - 0.16, zb + 0.16, zb + 0.5);
    tube(R, COPPER, [[3.9, D - 0.1, 11.9], [3.9, D - 0.1, 4.4]], 0.03, 6); tube(R, BRASS, [[3.9, D - 0.1, 4.4], [3.9, D - 0.62, 4.4], [3.9, D - 0.7, 4.3], [3.9, D - 0.7, 4.05]], 0.035, 6, true); R.box(BRASS, 3.78, 4.02, D - 0.5, D - 0.44, 4.44, 4.58);
    ves(R, ZINC, 3.9, D - 0.9, 0.004, [[0, 0], [0.42, 0], [0.55, 0.95], [0.58, 0.95], [0.58, 1.0], [0.5, 1.0], [0.4, 0.06], [0, 0.06]], 14);
    R.block(a0, a1, y0, D, 0, 3.4); }

  // the potting bench, under the back window
  {
    const b = at(9.84, D, 0, 'street'), top = 3.1;             // on the back wall: +x toward the sink, +y toward the street
    // the window: a six-over-six sash, limed over as greenhouse glass is
    b.box('c#9fb1b0/0.2', -1.5, 1.5, 0.035, 0.05, 3.85, 7.85);
    for (const x of [-1.8, 1.5]) b.box(TRIMW, x, x + 0.3, 0.035, 0.13, 3.85, 8.15, G); b.box(TRIMW, -1.5, 1.5, 0.035, 0.13, 7.85, 8.15, G); b.box(TRIMW, -1.92, 1.92, 0.035, 0.36, 3.73, 3.85, G);
    b.box(TRIMW, -1.5, 1.5, 0.05, 0.11, 5.78, 5.92, G); for (const x of [-0.5, 0.5]) b.box(TRIMW, x - 0.03, x + 0.03, 0.05, 0.09, 3.85, 7.85, G); for (const z of [4.82, 6.88]) b.box(TRIMW, -1.5, 1.5, 0.05, 0.075, z - 0.03, z + 0.03, G);
    // the bench
    for (const x of [-2.7, 2.7]) for (const y of [0.16, 2.1]) b.box(DARKW, x - 0.08, x + 0.08, y - 0.08, y + 0.08, 0, top - 0.1, G);
    b.box(OAK, -2.85, 2.85, 0.05, 2.25, top - 0.1, top, G); b.box(OAK, -2.7, 2.7, 0.12, 2.1, 0.82, 0.9, G); b.box(DARKW, -2.7, 2.7, 2.0, 2.08, top - 0.45, top - 0.1, G);
    b.block(-2.85, 2.85, 0, 2.25, 0, 4);
    kit.model('watering_can_metal_01', b, -2.15, 1.2, top, 0, { turn: 0.5 }); kit.model('trowel_01', b, -0.75, 1.55, top, 0, { turn: 1.1 }); kit.model('garden_gloves_01', b, 1.0, 1.7, top, 0, { turn: -0.4 });
    kit.pack(b, 2.1, 0.75, top, 1.15, 0.55, 1.7, 'c#c9a77a/0.8', MIX, { cw: 230, ch: 340 });
    ball(b, SOIL, 0.25, 1.05, top - 0.03, 0.42, 9, 0.28); for (let i = 0; i < 5; i++) ball(b, SOIL, -0.3 + rnd() * 1.2, 0.6 + rnd() * 1.0, top - 0.01, 0.03 + rnd() * 0.03, 5, 0.6);
    { const z = pot(b, 0.35, 0.7, top, 0.24, 0.36, CLAY); SP.pilea(b, 0.35, 0.7, z, 0.7); }
    for (let i = 0; i < 4; i++) pot(b, -1.9 + i * 0.36, 0.55, top, 0.14, 0.22, CLAY, 'std', i > 1);
    // hand tools on a rail beside the window
    b.box(OAK, -2.85, -2.0, 0.035, 0.1, 4.9, 5.02, G);
    for (let i = 0; i < 3; i++) { const x = -2.68 + i * 0.26; b.box(IRON, x - 0.012, x + 0.012, 0.1, 0.16, 4.9, 4.94); b.box('c#8a5a2a/0.8', x - 0.035, x + 0.035, 0.11, 0.17, 4.28, 4.9); b.box(ZINC, x - (i % 2 ? 0.07 : 0.02), x + (i % 2 ? 0.07 : 0.02), 0.125, 0.15, 3.86, 4.28); }
    kit.model('st_terracotta_jar_1', b, -1.9, 1.1, 0.9, 0, {}); stack(b, 1.9, 1.0, 0.9, 5, 0.32); stack(b, 1.1, 1.2, 0.9, 3, 0.32);
  }

  // the left wall: sacks of compost on a pallet by the doorway, then the long tools on their rail
  {
    for (const a of [0.42, 1.6, 2.78]) R.box(PALE, a, a + 0.26, 30.4, 33.9, 0.004, 0.2, G); for (let i = 0; i < 6; i++) R.box(PALE, 0.36, 3.1, 30.4 + i * 0.62, 30.8 + i * 0.62, 0.2, 0.27, G);
    const SACKS = [KRAFT, 'c#d6c6a2/0.8'];
    for (const [d0, n] of [[30.5, 4], [32.15, 3]]) for (let k = 0; k < n; k++) { const j = (rnd() - 0.5) * 0.16, j2 = (rnd() - 0.5) * 0.1; R.soft(SACKS[(k + n) % 2], 0.5 + j, 2.9 + j, d0 + j2, d0 + 1.5 + j2, 0.275 + k * 0.44, 0.275 + k * 0.44 + 0.45, 0.17); }
    R.block(0.36, 3.1, 30.4, 33.9, 0, 2.4);
    const t = LW(37.4), HANDLE = 'oak_light#b89466', STEEL = 'c#7a7e80/0.4/1';
    t.box(OAK, -2.5, 2.5, 0.035, 0.11, 6.72, 6.94, G);
    const shaft = (x, z0, z1) => t.cyl(HANDLE, x, 0.21, z0, z1, 0.045, 0.045, 6), peg = (x, z = 6.8) => t.box(IRON, x - 0.02, x + 0.02, 0.11, 0.34, z, z + 0.04);
    // a spade and a fork (hung by their handles), a rake and a hoe (by their heads), the hose
    for (const [x, fork] of [[-1.85, 0], [-0.95, 1]]) { peg(x); shaft(x, 3.45, 6.52); t.box(HANDLE, x - 0.2, x + 0.2, 0.17, 0.25, 6.46, 6.54, G); t.box(HANDLE, x - 0.2, x + 0.2, 0.17, 0.25, 6.86, 6.94, G); for (const sx of [-1, 1]) t.box(HANDLE, x + sx * 0.165 - 0.035, x + sx * 0.165 + 0.035, 0.175, 0.245, 6.54, 6.86, G);
      t.cyl(STEEL, x, 0.21, 3.3, 3.7, 0.06, 0.055, 6);
      if (fork) { t.box(STEEL, x - 0.3, x + 0.3, 0.18, 0.24, 3.24, 3.34); for (let k = 0; k < 4; k++) t.box(STEEL, x - 0.3 + k * 0.183, x - 0.25 + k * 0.183, 0.19, 0.23, 2.4, 3.24); } else t.box(STEEL, x - 0.3, x + 0.3, 0.195, 0.225, 2.35, 3.34); }
    { const x = -0.05; peg(x - 0.3, 6.5); peg(x + 0.3, 6.5); shaft(x, 1.5, 6.56); t.box(STEEL, x - 0.6, x + 0.6, 0.16, 0.26, 6.56, 6.64); for (let k = 0; k < 9; k++) t.box(STEEL, x - 0.58 + k * 0.142, x - 0.55 + k * 0.142, 0.26, 0.46, 6.57, 6.63); }
    { const x = 0.9; peg(x - 0.12, 6.5); peg(x + 0.12, 6.5); shaft(x, 1.8, 6.56); t.box(STEEL, x - 0.03, x + 0.03, 0.17, 0.5, 6.56, 6.61); t.box(STEEL, x - 0.24, x + 0.24, 0.47, 0.5, 6.2, 6.58); }
    { const x = 1.9, pts = []; peg(x, 6.6); for (let k = 0; k <= 40; k++) { const u = k / 40 * TAU * 2.5 + 1.57, rr = 0.66 + 0.035 * Math.sin(k * 0.9); pts.push([x + Math.cos(u) * rr, 0.2 + k * 0.004, 5.98 + Math.sin(u) * rr]); } pts.push([x + 0.1, 0.36, 4.9]); tube(t, 'c#4a6e38/0.55', pts, 0.045, 5, true); t.cyl(BRASS, x + 0.1, 0.36, 4.74, 4.92, 0.05, 0.035, 6); }
    // on the floor under them: two big pots and a zinc can
    pot(t, -1.3, 0.85, 0.004, 0.62, 1.05, CLAY, 'std', true); pot(t, 0.1, 0.75, 0.004, 0.5, 0.85, CLAY, 'std', true); can(t, 1.4, 0.8, 0.004, 1.15, ZINC, -0.6);
    t.block(-2.0, 2.0, 0, 1.5, 0, 2);
  }

  // the right wall: clay pots by the stack
  {
    const r = RW(34.6), zs = X.shelving(r, -3.9, 3.9, [1.5, 3.2, 4.9, 6.6], { d: 1.3, mat: OAK, over: 1.4, back: false });
    for (let i = 0; i < 3; i++) stack(r, -3.1 + i * 1.05, 0.68, zs[0], 4, 0.4); kit.model('st_terracotta_pot_3', r, 2.3, 0.68, zs[0], 0, {});
    for (let i = 0; i < 6; i++) stack(r, -3.3 + i * 0.78, 0.68, zs[1], 5 - (i % 3 === 2 ? 2 : 0), 0.3);
    for (let i = 0; i < 6; i++) stack(r, -0.6 + i * 0.6, 0.68, zs[2], 6 - (i % 2), 0.22);
    [[-3.1, 0.4, NAVY, 'egg'], [-1.9, 0.44, CREAM, 'foot'], [1.2, 0.38, CELADON, 'taper'], [2.5, 0.42, RUST, 'egg'], [3.3, 0.3, MUSTARD, 'cyl']].forEach(([x, rr, m, st]) => pot(r, x, 0.68, zs[3], rr, rr * 1.6, m, st, true));
    stack(r, -3.2, 0.68, 0.02, 3, 0.5); stack(r, 3.0, 0.68, 0.02, 4, 0.46);
  }

  // behind the glass, the olive; in the middle of the room, Old Dickson and his ferns
  { const a = 13.4, d = 31.7; grow(R, a, d, 0, 'olive', { r: 0.7, h: 1.2, pot: 'c#e8e2d4/0.8', style: 'taper', s: 1.05 }); R.block(a - 0.7, a + 0.7, d - 0.7, d + 0.7, 0, 3); }
  { const a = 9.6, d = 34.6, z = pot(R, a, d, 0, 0.8, 1.1, STONE, 'cyl');
    tube(R, 'c#3a2214/0.8', [[a, d, z], [a + 0.05, d - 0.05, z + 1.6], [a, d - 0.1, z + 3.2]], t => 0.24 - 0.06 * t, 7); palm(R, a, d - 0.1, z + 3.15, { n: 9, L: 2.5, rise: 0.9, droop: 0.75, m: 8, lf: 0.5, lw: 0.07, cols: GREENS });
    R.block(a - 0.8, a + 0.8, d - 0.8, d + 0.8, 0, 3);
    kit.pottedPlant(R, a + 1.7, d + 0.9, 0, 'fern', { size: 1.1, pot: STONE }); kit.pottedPlant(R, a - 1.45, d - 0.6, 0, 'fern', { size: 0.85, pot: CLAY });
    tag(a - 0.35, d - 0.55, z, 'street', 'Old Dickson', 'Tree fern. Older than the shop. Water the trunk, not the feet.', { stick: 0.5, w: 0.8 }); }

  // ---- out on the pavement: the barrow under the window, one bucket of flowers by the door -----------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));           // x = a along the frontage, y = -feet out from the shopfront
  {
    const cx = M ? 3.4 : W - 4.0, cy = -2.6;
    o.soft('c#3a6a3a/0.45', cx - 1.5, cx + 1.3, cy - 0.85, cy + 0.85, 1.15, 1.95, 0.08); o.box('soilbed', cx - 1.4, cx + 1.2, cy - 0.75, cy + 0.75, 1.9, 1.99);
    hcyl(o, 'c#2b2724/0.8', 'y', cx - 2.05, cy, 0.6, 0.22, 0.6, 0.6, 18); hcyl(o, 'c#b8361f/0.45', 'y', cx - 2.05, cy, 0.6, 0.26, 0.32, 0.32, 10);
    for (const s of [-1, 1]) { tube(o, PALE, [[cx - 2.05, cy + s * 0.2, 0.6], [cx - 1.3, cy + s * 0.6, 1.12], [cx + 1.3, cy + s * 0.78, 1.5], [cx + 3.0, cy + s * 0.82, 1.95]], 0.05, 5, true); o.box(IRON, cx + 0.85, cx + 0.93, cy + s * 0.7 - 0.04, cy + s * 0.7 + 0.04, 0, 1.4); }
    o.block(cx - 2.6, cx + 3.0, cy - 0.9, cy + 0.9, 0, 2.4);
    const ks = [['daisy', 'c#f3d96a/0.8'], ['spider'], ['daisy', 'c#f4f1ea/0.8'], ['croton'], ['daisy', 'c#e88aa8/0.8'], ['oxalis']];
    ks.forEach(([k, col], i) => { const x = cx - 0.95 + (i % 3) * 0.85, y = cy - 0.36 + Math.floor(i / 3) * 0.7, z = pot(o, x, y, 1.99, 0.24, 0.34, CLAY); SP[k](o, x, y, z, 0.9, col); });
  }
  {
    const x = DOOR - sgn * 4.3, y = -1.3, z = 0, cols = ['c#e58f7a/0.8', 'c#e88aa8/0.8', 'c#f2ead8/0.8'], c2 = 'c#e88aa8/0.8';
    ves(o, ZINC, x, y, z, [[0, 0], [0.42, 0], [0.56, 1.45], [0.59, 1.45], [0.59, 1.5], [0.52, 1.5], [0.4, 0.06], [0, 0.06]], 14); o.cyl('c#2f5a6a/0.2', x, y, z + 1.2, z + 1.22, 0.5, 0.5, 12);
    kit.posy(o, x, y, z + 1.0, cols); o.block(x - 0.6, x + 0.6, y - 0.6, y + 0.6, 0, 2.4);
    for (let k = 0; k < 9; k++) { const a = k * 0.7, r = 0.2 + (k % 3) * 0.09, hh = 1.9 + rnd() * 0.5, ex = x + Math.cos(a) * r * 1.5, ey = y + Math.sin(a) * r * 1.5; tube(o, 'c#5d8a3a/0.8', [[x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, z + 1.2], [ex, ey, z + hh]], 0.01, 3); ball(o, k % 3 ? c2 : cols[0], ex, ey, z + hh - 0.04, 0.075, 6, 0.75); if (k % 2) leaf(o, pick(GREENS), [(x + ex) / 2, (y + ey) / 2, z + 1.5], a + 1, 0.4, 0.3, 0.05, { shape: 'lance' }); }
  }

  flush();

  // ---- Moss -------------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'moss', name: 'Moss', lot: 'plants', look: { shape: 'round', colour: '#5f7d48', belly: '#e9e2c8', trim: '#b08d4a', hat: 'straw', hatColour: '#b8553a', apron: '#6a4a2a', eye: '#fff0c0', ring: 0xb8e08a, tool: 'can', blush: true, hover: 4.7 },
    home: lot.world(CA, 27.9), faces: lot.world(CA, 20), posts: [lot.world(12.6, 27.9), lot.world(18.2, 27.9), lot.world(CA, 27.9)],
    lines: {
      greet: ['Oh. A person. Hello.', 'Welcome to Frond. Walk slowly. The calatheas spook.'],
      idle: ['*to a fern* You are doing wonderfully.', '*mists something. mists it again, to be sure*', 'Gerald has a new leaf. I made a small fuss.'],
      bye: ['Go gently. Drink some water.', 'Come back and tell me how it is growing.'],
      topics: [
        { q: 'I kill every plant I touch.', a: 'You love them to death. Less water, more looking.' },
        { q: 'How often should I water?', a: 'When the soil is dry two knuckles down. Not on a schedule.' },
        { q: 'What grows in a dark room?', a: 'A fern, a snake plant, or a lamp. Start with the lamp.' },
        { q: 'Who is Gerald?', a: 'The monstera by the wall. He was here before the shop. We put the walls up round him.' },
        { q: 'Do you really talk to them?', a: 'All day. Only one of them has ever interrupted.', next: [
          { q: 'Which one?', a: 'Audrey, on the counter. I was talking about salad.' }] },
      ],
    },
  });
}
