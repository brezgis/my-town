// Frond: plants & their paraphernalia  (north side, 27 ft wide by 26.7 deep)
// A jungle with a till in it. The window is a raised bed of calatheas with the show-offs behind it;
// inside, a long table down the middle, a round tiered stand facing the door, and round the walls
// (clockwise from the door): the succulent steps, the seed rack, Gerald, the propagation wall, the
// potting bench, the shady end, the plant hospital, pots for sale, the nursery under its pink
// lights, and the counter with Moss behind it. Every plant worth knowing has a name tag.
import { tools, fixtures } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { tris } from '../kit/geom.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, para, poly, ICON } from '../draw.js';

const TAU = Math.PI * 2;
const OAK = 'oak_light#a3825c', PALE = 'oak_light#c9b08a', DARKW = 'fir#5a4334', SAGE = 'painted_wood#7d8f72', WHITEP = 'painted_wood#e9e4d6';
const IRON = 'c#2b2724/0.45/1', CLAY = 'c#b8755a/0.85', SOIL = 'c#3a2214/0.8', CORD = 'c#e8e2d4/0.8', ZINC = 'c#c9ccd0/0.3/1', KRAFT = 'c#c9a77a/0.8', GLOW = 'e#f08ae0/2.4', BLUSH = 'painted_wood#efc9e6';
const NAVY = 'c#26364f/0.45', TEAL = 'c#2f5a6a/0.45', MUSTARD = 'c#c9952a/0.45', CORAL = 'c#e8907a/0.45', WHITE = 'c#f4f1ea/0.45', CREAM = 'c#e8e2d4/0.45', COAL = 'c#2b2724/0.45', CELADON = 'c#9fb0a4/0.45', SKY = 'c#9fb0d8/0.45', PINK = 'c#e88aa8/0.45', RUST = 'c#b8361f/0.45', STONE = 'c#9a9590/0.8';
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
const HOSPITAL = (g, w, h) => {
  board(g, w, h, '#f1ede2', '#34553a', { inset: h * 0.06 });
  rect(g, h * 0.3, h * 0.2, h * 0.2, h * 0.6, '#3f7a4a'); rect(g, h * 0.1, h * 0.4, h * 0.6, h * 0.2, '#3f7a4a');
  T(g, 'PLANT HOSPITAL', w * 0.6, h * 0.3, h * 0.3, '#34553a', { f: F.bebas, ls: h * 0.03, max: w * 0.7 });
  T(g, 'do not buy · convalescing', w * 0.6, h * 0.58, h * 0.2, '#b8361f', { f: F.caveat, w: 700, max: w * 0.7 });
  T(g, 'visiting hours: always · no grapes, they get ideas', w * 0.6, h * 0.82, h * 0.105, INK, { f: F.fraunces, it: 1, w: 600, max: w * 0.7 });
};
const CHART = (who, what, rx) => (g, w, h) => {
  paper(g, w, h, '#f6f1e4', 2); rect(g, w * 0.3, 0, w * 0.4, h * 0.07, '#8a8478');
  for (let i = 0; i < 9; i++) line(g, [[w * 0.08, h * (0.2 + i * 0.09)], [w * 0.92, h * (0.2 + i * 0.09)]], 'rgba(60,90,140,.25)', 1);
  T(g, 'PATIENT', w * 0.08, h * 0.13, h * 0.055, '#8a8478', { f: F.bebas, a: 'left', ls: 1 }); T(g, who, w * 0.08, h * 0.24, h * 0.105, '#26364f', { f: F.caveat, w: 700, a: 'left', max: w * 0.84 });
  T(g, 'COMPLAINT', w * 0.08, h * 0.38, h * 0.055, '#8a8478', { f: F.bebas, a: 'left', ls: 1 }); para(g, what, w * 0.08, h * 0.42, h * 0.09, '#26364f', w * 0.84, { f: F.caveat, w: 600, lh: 1.0 });
  T(g, 'Rx', w * 0.08, h * 0.71, h * 0.08, '#b8361f', { f: F.playfair, a: 'left', w: 700, it: 1 }); para(g, rx, w * 0.08, h * 0.76, h * 0.09, '#b8361f', w * 0.84, { f: F.caveat, w: 700, lh: 1.0 });
};
const PKT = (name, quip, col, kind) => (g, w, h) => {
  fill(g, w, h, '#f1e9d6'); grain(g, w, h, 0.05); rect(g, 0, 0, w, h * 0.15, col); T(g, 'PERPETUAL DUSK', w / 2, h * 0.08, h * 0.075, '#f1e9d6', { f: F.bebas, ls: 1, max: w * 0.9 });
  const cx = w / 2, cy = h * 0.42, s = w * 0.3;
  if (kind === 'round') { disc(g, cx, cy, s, col); disc(g, cx - s * 0.3, cy - s * 0.3, s * 0.22, 'rgba(255,255,255,.35)'); ICON.leaf(g, cx + s * 0.2, cy - s * 1.05, s * 0.8, '#4a6e38'); }
  else if (kind === 'flower') { for (let i = 0; i < 7; i++) disc(g, cx + Math.cos(i / 7 * TAU) * s * 0.62, cy + Math.sin(i / 7 * TAU) * s * 0.62, s * 0.42, col); disc(g, cx, cy, s * 0.34, '#3a2a1c'); }
  else if (kind === 'root') { poly(g, [[cx - s * 0.5, cy - s * 0.6], [cx + s * 0.5, cy - s * 0.6], [cx, cy + s * 1.15]], col); for (const k of [-0.5, 0, 0.5]) line(g, [[cx, cy - s * 0.6], [cx + k * s, cy - s * 1.3]], '#4a6e38', 3); }
  else { for (const [dx, r] of [[-0.5, -0.5], [0.5, 0.5], [0, 0]]) { g.save(); g.translate(cx + dx * s, cy); g.rotate(r + 0.5); ICON.leaf(g, 0, 0, s * 1.9, col); g.restore(); } }
  T(g, name, w / 2, h * 0.73, h * 0.115, INK, { f: F.caveat, w: 700, max: w * 0.92 }); T(g, quip, w / 2, h * 0.85, h * 0.07, col, { f: F.fraunces, it: 1, w: 600, max: w * 0.92 });
  T(g, 'SEED CO.', w / 2, h * 0.95, h * 0.05, '#8a8478', { f: F.bebas, ls: 2 });
};
const SEEDS = [['Tomato', '“Slow Blush”', '#b8361f', 'round'], ['Basil', '“Loud”', '#4a6e38', 'leaf'], ['Carrot', '“Short & Sweet”', '#e0782a', 'root'], ['Sunflower', '“Tall Order”', '#c9952a', 'flower'],
  ['Sweet Pea', '“Clingy”', '#c05a8a', 'flower'], ['Radish', '“Impatience”', '#c8202a', 'root'], ['Lettuce', '“Bolt”', '#7fa04a', 'leaf'], ['Poppy', '“Oops, Everywhere”', '#d9482a', 'flower'],
  ['Pumpkin', '“Regret (Giant)”', '#e0782a', 'round'], ['Nasturtium', '“Edible, Allegedly”', '#e8a02a', 'flower'], ['Moonflower', '“Night Shift”', '#5a5a8a', 'flower'], ['Mystery Mix', '“Good Luck”', '#2f5a6a', 'leaf'],
  ['Beetroot', '“Stains”', '#7a1c3a', 'round'], ['Mint', '“You Will Regret This”', '#3a8a5a', 'leaf'], ['Parsnip', '“Pale & Interesting”', '#b8a878', 'root'], ['Cosmos', '“Late Bloomer”', '#b05a9a', 'flower']];
const MIX = (g, w, h) => {
  fill(g, w, h, '#c9a877'); grain(g, w, h, 0.09); rrect(g, w * 0.1, h * 0.12, w * 0.8, h * 0.62, 10, '#f1e9d6');
  T(g, 'OLD BRAMBLE’S', w / 2, h * 0.2, h * 0.07, '#5a3a1c', { f: F.bebas, ls: 3, max: w * 0.7 });
  T(g, 'Dirt,', w / 2, h * 0.33, h * 0.14, '#34553a', { f: F.shrikhand }); T(g, 'but nice', w / 2, h * 0.46, h * 0.1, '#34553a', { f: F.shrikhand, max: w * 0.7 });
  T(g, 'peat-free potting mix', w / 2, h * 0.57, h * 0.05, INK, { f: F.fraunces, it: 1, w: 600, max: w * 0.72 }); T(g, '· with bits in ·', w / 2, h * 0.66, h * 0.065, '#b8361f', { f: F.caveat, w: 700 });
  T(g, '20 L', w * 0.24, h * 0.85, h * 0.09, '#5a3a1c', { f: F.bebas }); para(g, 'contains: forest floor, grit, patience', w * 0.42, h * 0.81, h * 0.038, '#5a3a1c', w * 0.5, { f: F.fraunces, it: 1, w: 600 });
};
const RULES = (g, w, h) => {
  slate(g, w, h, '#24302a', 9); chalk(g, 'house rules', w / 2, h * 0.11, h * 0.14, '#e9c46a'); line(g, [[w * 0.3, h * 0.2], [w * 0.7, h * 0.2]], '#9fc6b0', 3);
  ['1.  most plants want less water than you think', '2.  most people want more', '3.  light is food. sit nearer the window', '4.  one yellow leaf is not a verdict', '5.  repot when cramped. applies generally', '6.  talk to them. they are not busy']
    .forEach((s, i) => chalk(g, s, w * 0.07, h * (0.3 + i * 0.105), h * 0.078, i % 2 ? '#9fc6b0' : '#f1efe6', { a: 'left', max: w * 0.88 }));
  chalk(g, '(rule 7 is a secret. the ferns know.)', w / 2, h * 0.945, h * 0.055, '#9aa39d');
};
const LIGHTS = (g, w, h) => {
  paper(g, w, h, '#efe6d2', 11); T(g, 'WHERE DOES IT GO?', w / 2, h * 0.07, h * 0.058, LEAFG, { f: F.bebas, ls: 2, max: w * 0.88 });
  [['bright', 'by the window. cacti, figs, show-offs.', '#e9a23a', 1], ['medium', 'across the room. most things, most people.', '#c9952a', 0.62], ['low', 'the hallway. ferns, snake plants, teenagers.', '#7a8a6a', 0.3]].forEach(([n, s, c, k], i) => {
    const y = h * (0.24 + i * 0.22); disc(g, w * 0.2, y, w * 0.1 * (0.5 + k * 0.5), c); for (let r = 0; r < 10; r++) { const a = r / 10 * TAU; line(g, [[w * 0.2 + Math.cos(a) * w * 0.13, y + Math.sin(a) * w * 0.13], [w * 0.2 + Math.cos(a) * w * (0.13 + 0.05 * k), y + Math.sin(a) * w * (0.13 + 0.05 * k)]], c, 3); }
    T(g, n, w * 0.4, y - h * 0.035, h * 0.062, LEAFG, { f: F.shrikhand, a: 'left' }); para(g, s, w * 0.4, y + h * 0.005, h * 0.036, INK, w * 0.54, { f: F.caveat, w: 600, lh: 1.0 });
  });
  line(g, [[w * 0.1, h * 0.82], [w * 0.9, h * 0.82]], LEAFG, 2); T(g, 'no light at all:', w / 2, h * 0.87, h * 0.045, '#b8361f', { f: F.fraunces, it: 1, w: 600 }); T(g, 'a nice painting of a plant', w / 2, h * 0.93, h * 0.05, INK, { f: F.caveat, w: 700 });
};
const CARE = (what, how, c) => (g, w, h) => {
  fill(g, w, h, c); grain(g, w, h, 0.05); rrect(g, w * 0.07, h * 0.05, w * 0.86, h * 0.9, 5, null, '#f1e9d6', 2);
  T(g, 'HOW NOT TO KILL', w / 2, h * 0.16, h * 0.075, '#f1e9d6', { f: F.bebas, ls: 1, max: w * 0.76 }); ICON.leaf(g, w / 2, h * 0.36, h * 0.24, '#f1e9d6');
  T(g, what, w / 2, h * 0.59, h * 0.12, '#f1e9d6', { f: F.caveat, w: 700, max: w * 0.78 }); para(g, how, w / 2, h * 0.69, h * 0.075, '#f1e9d6', w * 0.74, { f: F.fraunces, it: 1, w: 600, a: 'center', lh: 1.05 });
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
    ves(f, mat, x, y, z, [...outer, ...(empty ? [[lip, h], [lip * 0.8, h * 0.25], [0, h * 0.2]] : [[lip, h], [lip, h * 0.9], [0, h * 0.9]])], r > 0.5 ? 18 : r > 0.2 ? 14 : 10);
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
    olive: (f, x, y, z, s = 1) => tree(f, x, y, z, { H: 3.8 * s, bare: 0.5, n: 60, L: 0.3 * s, W: 0.045 * s, shape: 'lance', cols: ['c#9fb0a4/0.8', 'c#4a6e38/0.8'], bushy: 1.2 * s, tr: 0.09 * s, droop: 0.1, pitch: -0.2, bark: 'c#9a9590/0.8' }),
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
  const stack = (f, x, y, z, n, r = 0.22) => { for (let k = 0; k < n; k++) ves(f, CLAY, x, y, z + k * r * 0.42, [[0, 0], [r * 0.7, 0], [r * 0.94, r * 1.2], [r * 1.07, r * 1.24], [r * 1.07, r * 1.45], [r * 0.93, r * 1.45], [r * 0.7, r * 0.1], [0, r * 0.1]], 12); };
  const mister = (f, x, y, z, m = BRASS) => { ves(f, m, x, y, z, [[0, 0], [0.12, 0], [0.15, 0.08], [0.15, 0.22], [0.06, 0.33], [0.045, 0.4], [0, 0.4]], 12); f.cyl(m, x, y, z + 0.4, z + 0.5, 0.025, 0.025, 6); ball(f, m, x, y, z + 0.49, 0.04, 6); tube(f, m, [[x, y, z + 0.36], [x + 0.14, y, z + 0.4], [x + 0.2, y, z + 0.4]], 0.012, 4); tube(f, m, [[x - 0.05, y, z + 0.36], [x - 0.2, y, z + 0.3], [x - 0.17, y, z + 0.12]], 0.012, 4); };
  const can = (f, x, y, z, s = 1, m = ZINC, az = 0) => { const c = Math.cos(az), sn = Math.sin(az); ves(f, m, x, y, z, [[0, 0], [0.3 * s, 0], [0.3 * s, 0.6 * s], [0.26 * s, 0.6 * s], [0.26 * s, 0.05], [0, 0.05]], 12); tube(f, m, [[x + c * 0.28 * s, y + sn * 0.28 * s, z + 0.12 * s], [x + c * 0.7 * s, y + sn * 0.7 * s, z + 0.62 * s], [x + c * 0.85 * s, y + sn * 0.85 * s, z + 0.72 * s]], 0.035 * s, 5); tube(f, m, [[x - c * 0.28 * s, y - sn * 0.28 * s, z + 0.52 * s], [x - c * 0.58 * s, y - sn * 0.58 * s, z + 0.45 * s], [x - c * 0.52 * s, y - sn * 0.52 * s, z + 0.12 * s], [x - c * 0.29 * s, y - sn * 0.29 * s, z + 0.1 * s]], 0.02 * s, 4); };

  // ---- the window: a raised bed of calatheas, the show-offs behind and beside it --------------------------
  {
    const x0 = 12.6, x1 = 21.4, y0 = 0.35, y1 = 4.6, top = 1.5;
    for (const [a, b, c, d] of [[x0, x1, y0, y0 + 0.14], [x0, x1, y1 - 0.14, y1], [x0, x0 + 0.14, y0 + 0.14, y1 - 0.14], [x1 - 0.14, x1, y0 + 0.14, y1 - 0.14]]) R.box(DARKW, a, b, c, d, 0, top, G);
    for (const x of [x0 - 0.03, 15.5, 18.5, x1 - 0.11]) R.box(DARKW, x, x + 0.14, y1, y1 + 0.05, 0, top, G);
    R.box('soilbed', x0 + 0.14, x1 - 0.14, y0 + 0.14, y1 - 0.14, 0.3, top - 0.1); R.block(x0, x1, y0, y1, 0, 3.4);
    const z = top - 0.1;
    kit.model('calathea_orbifolia_01', R, 17, 2.6, z - 0.03, 0, {});
    SP.bop(R, 14.0, 1.3, z, 1.3); SP.alocasia(R, 20.3, 1.3, z, 1.5); SP.dracaena(R, 15.5, 0.95, z, 0.95); SP.croton(R, 19.1, 1.0, z, 1.8); SP.anthurium(R, 15.3, 2.0, z, 1.6); SP.monstera(R, 12.95, 2.3, z, 0.9); SP.nest(R, 13.4, 3.7, z, 0.9); SP.bromeliad(R, 20.6, 3.8, z, 0.9); SP.calathea(R, 16.1, 3.9, z, 1.0); SP.calathea(R, 18.4, 1.0, z, 1.1);
    SP.fittonia(R, 14.6, 3.5, z, 1.6); SP.fittonia(R, 17.3, 3.9, z, 1.5); SP.fittonia(R, 19.4, 3.3, z, 1.6); SP.peperomia(R, 15.4, 3.0, z, 1.4); SP.begonia(R, 18.9, 2.4, z, 1.2); SP.asparagus(R, 17.0, 2.3, z, 0.9); SP.nest(R, 21.0, 2.5, z, 0.7); SP.oxalis(R, 16.3, 1.4, z, 1.5); SP.peace(R, 17.9, 3.0, z, 0.9);
    for (const [x, y, r] of [[13.2, 1.2, 0.3], [15.9, 2.4, 0.24], [19.9, 4.1, 0.26], [18.2, 4.0, 0.2], [14.3, 4.2, 0.22]]) ball(R, 'c#5d8a3a/0.8', x, y, z - r * 0.3, r, 8, 0.5);
    tag(14.0, 0.75, z, 'street', 'Josephine', 'Bird of paradise. Has never flowered. Says she is “saving it”.', { stick: 0.75 });
    tag(20.3, 0.75, z, 'street', 'Vlad', 'Alocasia. Dramatic. Drops a leaf whenever you make plans.', { stick: 0.75 });
    tag(13.5, 4.2, z, 'back', 'Nestor', 'Bird’s-nest fern. Loves a steamy bathroom. Who doesn’t.');
    tag(20.5, 4.3, z, 'back', 'Rita', 'Bromeliad. Water her in the middle, like a tiny bird bath.');
    // the hand-lettered card, on two stakes, one side for the street and one for you
    for (const x of [16.2, 17.8]) R.box(KRAFT, x - 0.03, x + 0.03, 0.74, 0.78, z - 0.1, z + 1.6);
    R.box('c#d9cdb2/0.8', 16.0, 18.0, 0.71, 0.74, z + 0.75, z + 2.05);
    sg(17, 0.705, z + 1.4, 'street', 2.0, 1.3, CARD('frond', 'everything in this window is alive\nand knows it. please admire accordingly.', { ts: 0.3, ty: 0.27, by: 0.5, bs: 0.115 }), { cw: 400, ch: 260 });
    sg(17, 0.745, z + 1.4, 'back', 2.0, 1.3, CARD('psst', 'you are now behind the window.\nstand very still and somebody\nwill try to buy you.', { ts: 0.24, ty: 0.22, by: 0.4, bs: 0.115 }), { cw: 400, ch: 260 });
    sg(17, y1 + 0.03, 0.82, 'back', 2.8, 0.75, BOARD('THE WINDOW BED', 'calathea orbifolia & friends · they fold up at night to pray. we do not ask to whom.', '#34553a', '#e6e0cf', { ss: 0.13 }), { cw: 560, ch: 150 });
    // baskets in the window
    SP.pothos(R, 13.4, 1.9, hang(R, 13.4, 1.9, 7.6, { pot: CLAY, r: 0.5 }), 1.5, 0.5); SP.hearts(R, 16.9, 1.5, hang(R, 16.9, 1.5, 8.6, { pot: WHITE, r: 0.4 }), 1.5, 0.4); SP.philo(R, 20.6, 2.0, hang(R, 20.6, 2.0, 7.4, { pot: TEAL, r: 0.5 }), 1.4, 0.5); SP.wandering(R, 23.6, 1.3, hang(R, 23.6, 1.3, 8.4, { pot: MUSTARD, r: 0.4 }), 1.3, 0.4);
  }
  // the right-hand corner of the window: Big Susan, the arrowhead on its plinth, a rubber tree, a snake plant
  grow(R, 24.8, 1.9, 0, 'fiddle', { r: 0.85, h: 1.5, pot: NAVY, style: 'taper', s: 1.15 }); R.block(23.95, 25.65, 1.05, 2.75, 0, 3);
  tag(24.8, 2.45, 1.38, 'back', 'Big Susan', 'Fiddle-leaf fig. Do NOT move her. She was moved once, in spring. We lost eleven leaves.', { stick: 0.6, w: 0.95 });
  X.plinth(R, 22.5, 1.35, 1.5, 1.5, 1.75, { mat: PALE }); kit.model('potted_plant_02', R, 22.5, 1.35, 1.75, 0, {});
  tag(22.5, 2.05, 1.75, 'back', 'The Arrowheads', 'A family. They point at things. It’s rude but we love them.', { stick: 0.12, w: 0.7 });
  grow(R, 22.6, 4.3, 0, 'rubber', { r: 0.6, h: 1.1, pot: COAL, style: 'egg', s: 1.1 }); R.block(22.0, 23.2, 3.7, 4.9, 0, 3);
  tag(22.6, 4.72, 1.0, 'back', 'Robert', 'Rubber tree. Polish his leaves and he’ll put up with anything.', { stick: 0.45 });
  kit.pottedPlant(R, 25.9, 4.4, 0, 'snake', { size: 1.5, pot: MUSTARD });
  tag(25.9, 5.02, 0, 'back', 'Gerald Jr.', 'Thrives on neglect. Takes after his father.', { stick: 1.3, w: 0.7 });

  // ---- left of the door: the succulent steps -----------------------------------------------------------------
  {
    const x0 = 0.4, x1 = 3.9, steps = [[0.3, 0.95, 2.9], [0.95, 1.6, 2.2], [1.6, 2.25, 1.5]];
    for (const [y0, y1, h] of steps) { R.box(PALE, x0, x1, y0, y1 + 0.03, h - 0.09, h, G); for (const x of [x0, x1 - 0.09]) R.box(PALE, x, x + 0.09, y0, y1, 0, h - 0.09, G); R.box(PALE, x0 + 0.09, x1 - 0.09, y1 - 0.06, y1, 0.3, h - 0.09, G); }
    R.block(x0, x1, 0.3, 2.25, 0, 3.7);
    const kinds = ['echeveria', 'column', 'barrel', 'haworthia', 'opuntia', 'lithops', 'aloe', 'jade', 'echeveria', 'barrel', 'burro', 'column', 'haworthia', 'echeveria', 'agave', 'barrel', 'opuntia', 'lithops', 'echeveria', 'column', 'aloe'];
    steps.forEach(([y0, y1, h], si) => { for (let j = 0; j < 7; j++) { const k = kinds[si * 7 + j], x = 0.72 + j * 0.475, y = (y0 + y1) / 2 + (rnd() - 0.5) * 0.12, r = 0.12 + rnd() * 0.05;
      const sz = pot(R, x, y, h, r, r * 1.5, pick([CLAY, CLAY, WHITE, CELADON, CORAL, MUSTARD, COAL]), pick(['std', 'std', 'cyl', 'bowl']));
      if (k === 'burro') SP.burro(R, x, y, sz, 0.5, r); else if (k === 'aloe' || k === 'agave') SP[k](R, x, y, sz, 0.42); else if (k === 'jade') SP.jade(R, x, y, sz, 0.5); else if (k === 'echeveria') SP.echeveria(R, x, y, sz, 0.9, pick([GREY, ['c#e8907a/0.8', 'c#9fb0a4/0.8'], ['c#8a5ab0/0.8', 'c#9fb0a4/0.8'], LIME])); else SP[k](R, x, y, sz, k === 'column' ? 0.9 + rnd() * 0.9 : 1); } });
    tag(1.2, 2.2, 1.5, 'back', 'Spike', 'Do not pet. He means well. He is a cactus.', { stick: 0.0, w: 0.62 });
    tag(2.9, 2.2, 1.5, 'back', 'the living stones', 'Lithops. They are not ignoring you, they are stones.', { stick: 0.0, w: 0.62 });
    tag(2.05, 1.56, 2.2, 'back', 'Small, stoic, 4 each', 'Water monthly. Compliment weekly.', { stick: 0.0, w: 0.62, c: '#e6d9a8' });
    sg(2.15, 0.28, 3.75, 'street', 2.2, 0.62, BOARD('SUCCULENTS & THE SPIKY', 'for people who travel', '#b8553a', '#f1e9d6'), { cw: 440, ch: 124 });
    for (const x of [1.2, 3.1]) R.box(KRAFT, x - 0.025, x + 0.025, 0.3, 0.33, 2.9, 3.5); R.box('c#d9cdb2/0.8', 1.05, 3.25, 0.285, 0.3, 3.44, 4.06);
  }
  // ---- the left wall: seeds, Gerald, the propagation wall, the potting bench -------------------------------
  {
    const s = at(0, 4.3, 0, 'right');                          // on the left wall: +x toward the street, +y into the room
    s.box(SAGE, -1.7, 1.7, 0.02, 0.1, 2.3, 7.0, G); s.box(SAGE, -1.76, 1.76, 0.02, 0.16, 7.0, 7.1, G);
    [2.7, 3.62, 4.54, 5.46].forEach((z, ri) => { s.box(PALE, -1.64, 1.64, 0.1, 0.36, z - 0.05, z, G); s.box(PALE, -1.64, 1.64, 0.33, 0.36, z, z + 0.07, G);
      for (let j = 0; j < 8; j++) { const p = SEEDS[(ri * 8 + j) % SEEDS.length]; kit.pack(s, -1.4 + j * 0.4, 0.2 + (j % 2) * 0.03, z, 0.33, 0.03, 0.5, 'c#e8e2d4/0.8', PKT(...p), { cw: 100, ch: 150 }); } });
    kit.sign(s, 0, 0.11, 6.52, 3.2, 0.72, (g, w, h) => { board(g, w, h, '#26364f', '#e9c46a', { inset: h * 0.08 }); T(g, 'Perpetual Dusk Seed Co.', w / 2, h * 0.4, h * 0.36, '#e9c46a', { f: F.yellowtail, max: w * 0.9 }); T(g, 'SOW ANY TIME · IT IS ALWAYS ABOUT SIX O’CLOCK', w / 2, h * 0.76, h * 0.14, '#f1e9d6', { f: F.bebas, ls: 2, max: w * 0.88 }); }, { cw: 640, ch: 144 });
    X.crate(s, 0, 0.8, 0, 2.4, 1.2, 1.2); s.box(KRAFT, -1.1, 1.1, 0.3, 1.3, 0.05, 0.8);
    for (let i = 0; i < 12; i++) K.fruit(s, 'onion', -0.9 + (i % 6) * 0.36, 0.55 + Math.floor(i / 6) * 0.42 + (i % 2) * 0.06, 0.8, 0.9);
    tagF(s, 0, 1.43, 0.6, 'bulbs, 1 each', 'Plant pointy end up. This is also good general advice.', { stick: 0, w: 0.9 });
    s.block(-1.7, 1.7, 0, 1.45, 0, 7);
  }
  // Gerald
  { const z = pot(R, 1.75, 7.25, 0, 0.85, 1.35, MUSTARD, 'egg'); R.cyl('c#6a4a2a/0.8', 1.75, 7.25, z, z + 4.2, 0.09, 0.08, 8); SP.monstera(R, 1.75, 7.25, z, 1.45); stemmed(R, 1.75, 7.25, z + 2.2, { n: 5, H: 2.0, lean: 0.5, L: 1.2, W: 0.5, shape: 'heart', cols: DEEP, pitch: -0.5 });
    R.block(0.9, 2.6, 6.4, 8.1, 0, 3); tag(2.2, 7.25, z, 'right', 'Gerald', 'Monstera. Thrives on neglect. Do not make eye contact.', { stick: 0.7, w: 1.0 }); }
  {
    const p = at(0, 11.4, 0, 'right');
    p.box(PALE, -3.3, 3.3, 0.02, 0.09, 3.3, 8.75, G);
    const notes = [['week 1', 'nothing yet. nothing is also fine.'], ['week 3', 'ROOTS. we screamed a little.'], ['please', 'do not tap the glass. they are concentrating.'], ['free', 'one cutting with every kind word to a plant.']];
    [3.75, 4.9, 6.05, 7.2].forEach((z, ri) => {
      p.box(OAK, -3.2, 3.2, 0.09, 0.52, z - 0.06, z, G); for (const x of [-2.9, 0, 2.9]) p.box(OAK, x - 0.03, x + 0.03, 0.09, 0.4, z - 0.16, z - 0.06, G);
      for (let j = 0; j < 10; j++) {
        const x = -2.85 + j * 0.633, y = 0.3, k = (j + ri * 2) % 4;
        if (j === (ri * 3 + 2) % 10) { X.card(p, x, y, z, 0.56, 0.36, TAG(...notes[ri]), { cw: 200, ch: 128 }); continue; }
        const [prof, wr, wh] = k === 0 ? [[[0, 0], [0.09, 0], [0.16, 0.1], [0.14, 0.24], [0.05, 0.32], [0.05, 0.44], [0.065, 0.45]], 0.12, 0.2] : k === 1 ? [[[0, 0], [0.045, 0.03], [0.05, 0.55], [0.06, 0.56]], 0.04, 0.4] : k === 2 ? [[[0, 0], [0.11, 0], [0.11, 0.3], [0.05, 0.38], [0.05, 0.48], [0.06, 0.49]], 0.095, 0.24] : [[[0, 0], [0.07, 0], [0.13, 0.16], [0.13, 0.3], [0.1, 0.36], [0.11, 0.37]], 0.1, 0.25];
        ves(p, 'glass', x, y, z, prof, 10); ves(p, 'c#c9d6d8/0.2', x, y, z + 0.02, [[0, 0], [wr * 0.8, 0], [wr, wh * 0.5], [wr * 0.9, wh], [0, wh]], 8);
        const top = prof[prof.length - 1][1], lean = (rnd() - 0.5) * 0.2, c = pick([LIME, DEEP, GREENS, PURPLE, ['c#7fa04a/0.8', 'c#e8c73a/0.8']]);
        tube(p, 'c#5d8a3a/0.8', [[x, y, z + 0.06], [x, y, z + top], [x + lean, y + 0.03, z + top + 0.28]], 0.008, 3);
        for (let q = 0; q < 2 + (j % 2); q++) leaf(p, pick(c), [x + lean * (0.6 + q * 0.2), y + 0.03, z + top + 0.14 + q * 0.08], q * 2.2 + j, 0.3 + q * 0.3, 0.2 + rnd() * 0.1, 0.08, { shape: k % 2 ? 'heart' : 'oval' });
        for (const dx of [-0.02, 0.025]) tube(p, 'c#f4f1ea/0.8', [[x, y, z + 0.12], [x + dx, y, z + 0.04]], 0.004, 3);
      }
    });
    kit.sign(p, 0, 0.1, 8.25, 4.6, 0.72, BOARD('THE PROPAGATION WALL', 'everyone here is a beginner. be nice.', '#e6e0cf', '#34553a'), { cw: 700, ch: 110 });
    // the bench below, with the mid-sized characters
    p.box(OAK, -3.25, 3.25, 0.04, 1.65, 1.4, 1.5, G); for (const x of [-3.1, 0, 3.1]) for (const y of [0.16, 1.5]) p.box(OAK, x - 0.07, x + 0.07, y - 0.07, y + 0.07, 0, 1.4, G); p.box(OAK, -3.1, 3.1, 0.2, 1.45, 0.35, 0.42, G);
    p.block(-3.25, 3.25, 0, 1.65, 0, 3);
    let z = grow(p, -2.5, 0.85, 1.5, 'calathea', { r: 0.34, pot: TEAL, style: 'cyl', s: 1.1 }); tagF(p, -2.5, 1.12, z, 'Mavis', 'Prayer plant. Folds her leaves at dusk. So: constantly.', { stick: 0.12, w: 0.66 });
    z = grow(p, -1.25, 0.85, 1.5, 'pilea', { r: 0.26, pot: WHITE, style: 'bowl', s: 1.2 }); tagF(p, -1.25, 1.08, z, 'Pancake', 'Makes babies. Give them to friends. Lose friends.', { stick: 0.1, w: 0.66 });
    z = grow(p, 0, 0.85, 1.5, 'spider', { r: 0.3, pot: CORAL, style: 'egg', h: 0.5, s: 1.0 }); tagF(p, 0, 1.08, z, 'Deborah', 'Spider plant. Unkillable. We are not daring you.', { stick: 0.12, w: 0.66 });
    z = grow(p, 1.25, 0.85, 1.5, 'peace', { r: 0.32, pot: CREAM, s: 1.15 }); tagF(p, 1.25, 1.12, z, 'Hamlet', 'Peace lily. Faints when thirsty. It’s acting. Water him anyway.', { stick: 0.12, w: 0.66 });
    z = grow(p, 2.5, 0.85, 1.5, 'zz', { r: 0.34, pot: COAL, style: 'cyl', s: 1.0 }); tagF(p, 2.5, 1.12, z, 'The Intern', 'ZZ plant. Has never been watered. Has never complained.', { stick: 0.12, w: 0.66 });
    stack(p, -2.2, 0.8, 0.42, 5, 0.24); stack(p, -1.5, 0.9, 0.42, 3, 0.3); can(p, 0.3, 0.85, 0.42, 1, 'c#b06a3c/0.32/1', 0.4); for (let i = 0; i < 3; i++) pot(p, 1.6 + i * 0.62, 0.85, 0.42, 0.25, 0.5, pick(GLAZES), 'cyl', true);
  }
  grow(R, 1.15, 15.25, 0, 'dracaena', { r: 0.5, h: 0.9, pot: STONE, style: 'cyl', s: 1.1 }); R.block(0.65, 1.65, 14.75, 15.75, 0, 3);
  tag(1.65, 15.25, 0.84, 'right', 'Stilts', 'Dragon tree. All leg. Likes it dim, like a jazz club.', { stick: 0.5, w: 0.7 });
  {
    const b = at(0, 18.8, 0, 'right'), top = 3.1;               // the potting bench
    for (const x of [-2.7, 2.7]) for (const y of [0.14, 2.1]) b.box(DARKW, x - 0.08, x + 0.08, y - 0.08, y + 0.08, 0, top - 0.1, G);
    b.box(OAK, -2.85, 2.85, 0.03, 2.25, top - 0.1, top, G); b.box(OAK, -2.7, 2.7, 0.1, 2.1, 0.82, 0.9, G); b.box(DARKW, -2.7, 2.7, 2.0, 2.08, top - 0.45, top - 0.1, G);
    b.box(OAK, -2.85, 2.85, 0.02, 0.1, top, 6.0, G); b.box(OAK, -2.85, 2.85, 0.1, 0.95, 5.1, 5.18, G); for (const x of [-2.85, 2.77]) b.box(OAK, x, x + 0.08, 0.1, 0.95, top, 6.0, G);
    b.block(-2.85, 2.85, 0, 2.25, 0, 6);
    kit.model('watering_can_metal_01', b, -2.15, 1.2, top, 0, { turn: 0.5 }); kit.model('trowel_01', b, -0.75, 1.55, top, 0, { turn: 1.1 }); kit.model('garden_gloves_01', b, 1.0, 1.7, top, 0, { turn: -0.4 }); kit.model('seeding_tray_01', b, -1.3, 0.6, top, 0, {});
    kit.pack(b, 2.1, 0.65, top, 1.15, 0.55, 1.7, 'c#c9a77a/0.8', MIX, { cw: 230, ch: 340 });
    ball(b, SOIL, 0.25, 1.05, top - 0.03, 0.42, 9, 0.28); for (let i = 0; i < 7; i++) ball(b, SOIL, -0.3 + rnd() * 1.2, 0.6 + rnd() * 1.0, top - 0.01, 0.03 + rnd() * 0.03, 5, 0.6);
    { const z = pot(b, 0.3, 0.55, top, 0.24, 0.36, CLAY); SP.pilea(b, 0.3, 0.55, z, 0.7); }
    mister(b, -0.2, 1.75, top); ball(b, KRAFT, 1.35, 1.0, top, 0.13, 8); tube(b, KRAFT, [[1.35, 1.0, top + 0.2], [1.5, 1.3, top + 0.02], [1.2, 1.6, top + 0.01]], 0.008, 3);
    stack(b, -2.3, 0.5, 5.18, 6, 0.2); stack(b, -1.8, 0.5, 5.18, 4, 0.24); stack(b, -1.2, 0.5, 5.18, 3, 0.16); kit.model('planter_pot_clay', b, 2.2, 0.5, 5.18, 0, {}); SP.ivy(b, 1.2, 0.5, pot(b, 1.2, 0.5, 5.18, 0.24, 0.34, CELADON, 'bowl'), 0.9, 0.24);
    for (let i = 0; i < 4; i++) { const x = -0.5 + i * 0.3; b.box(IRON, x - 0.012, x + 0.012, 0.1, 0.16, 4.92, 4.95); b.box('c#8a5a2a/0.8', x - 0.035, x + 0.035, 0.12, 0.17, 4.3, 4.92); b.box('c#c9ccd0/0.3/1', x - (i % 2 ? 0.07 : 0.02), x + (i % 2 ? 0.07 : 0.02), 0.13, 0.15, 3.85, 4.3); }
    kit.sign(b, 0, 0.11, 5.6, 3.4, 0.62, BOARD('THE POTTING BENCH', 'repotting while you wait · emotional support included', '#5a4334', '#f1e9d6', { ss: 0.17 }), { cw: 620, ch: 112 });
    kit.sign(b, -1.9, 0.11, 4.15, 1.2, 0.85, CARD('a note on dirt', 'it is not “dirty”.\nit is where everything\ncomes from. wipe your feet\nanyway.', { tf: F.caveat, ts: 0.2, ty: 0.17, by: 0.3, bs: 0.125, edge: false, bg: '#efe4c8' }), { cw: 220, ch: 156 });
    kit.model('st_terracotta_jar_1', b, -1.9, 1.1, 0.9, 0, {}); kit.pack(b, -0.3, 1.0, 0.9, 1.0, 0.6, 1.35, 'c#9a9590/0.8', CARD('GRIT', 'for drainage\n& for character', { bg: '#b9b4a8', tf: F.bebas, ts: 0.26, ty: 0.3, by: 0.5, bs: 0.1, tc: '#2a2118' }), { cw: 150, ch: 200 });
    kit.pack(b, 0.95, 1.0, 0.9, 1.0, 0.6, 1.2, 'c#8a5a2a/0.8', CARD('BARK', '(worse than\nits bite)', { bg: '#a87850', tf: F.bebas, ts: 0.26, ty: 0.3, by: 0.5, bs: 0.11, tc: '#f1e9d6', bc: '#f1e9d6' }), { cw: 150, ch: 180 }); stack(b, 2.1, 1.0, 0.9, 5, 0.32);
  }
  // ---- the shady end: ferns in a brick bed, a tree fern, a staghorn on the wall -----------------------------
  {
    const x0 = 0.3, x1 = 5.5, y0 = 22.5, y1 = D - 0.25, top = 1.0;
    for (const [a, b, c, d] of [[x0, x1, y0, y0 + 0.3], [x0, x1, y1 - 0.3, y1], [x0, x0 + 0.3, y0 + 0.3, y1 - 0.3], [x1 - 0.3, x1, y0 + 0.3, y1 - 0.3]]) R.box('brick', a, b, c, d, 0, top);
    R.box(STONE, x0 - 0.04, x1 + 0.04, y0 - 0.04, y0 + 0.34, top, top + 0.08); R.box(STONE, x1 - 0.34, x1 + 0.04, y0 + 0.34, y1, top, top + 0.08);
    R.box('soilbed', x0 + 0.3, x1 - 0.3, y0 + 0.3, y1 - 0.3, 0.3, top - 0.08); R.block(x0, x1, y0, y1, 0, 2.6);
    const z = top - 0.08;
    kit.model('fern_02', R, 2.2, 24.2, z - 0.05, 0, { scale: 0.8 });
    tube(R, 'c#3a2214/0.8', [[1.2, 25.5, z], [1.25, 25.45, z + 1.6], [1.15, 25.4, z + 3.4]], t => 0.24 - 0.06 * t, 7); palm(R, 1.15, 25.4, z + 3.35, { n: 9, L: 3.0, rise: 0.9, droop: 0.75, m: 9, lf: 0.55, lw: 0.07, cols: GREENS });
    SP.nest(R, 4.5, 23.4, z, 1.0); kit.pottedPlant(R, 4.4, 25.5, z, 'fern', { size: 1.25, pot: STONE, block: false }); kit.pottedPlant(R, 1.2, 23.3, z, 'fern', { size: 0.9, pot: CLAY, block: false }); SP.asparagus(R, 3.0, 25.7, z, 1.1);
    for (const [x, y, r] of [[2.4, 23.1, 0.3], [3.4, 23.3, 0.22], [3.7, 24.6, 0.26]]) ball(R, 'c#5d8a3a/0.8', x, y, z - r * 0.25, r, 8, 0.5);          // cushions of moss
    tag(4.6, 22.75, z, 'street', 'Fern (the fern)', 'Boston fern. Wants mist, shade and to be told she’s doing well.', { stick: 0.3, w: 0.8 });
    tag(2.3, 22.75, z, 'street', 'moss, 3 a cushion', 'Soft. Asks for nothing. Be more moss.', { stick: 0.3, w: 0.7, c: '#e6d9a8' });
    tag(5.25, 25.3, z, 'right', 'Old Dickson', 'Tree fern. Older than the shop. Water the trunk, not the feet.', { stick: 0.5, w: 0.8 });
    X.slateBoard(at(2.9, D, 0, 'street'), 0, 7.6, 3.6, 1.2, (g, w, h) => { slate(g, w, h, '#24302a'); chalk(g, 'the shady end', w / 2, h * 0.36, h * 0.38, '#9fc6b0'); chalk(g, 'ferns, mosses & other introverts', w / 2, h * 0.76, h * 0.2, '#f1efe6', { max: w * 0.9 }); }, { cw: 430, ch: 144 });
    const s = at(0, 23.9, 6.0, 'right');                       // the staghorn, mounted on a board
    s.box(DARKW, -0.6, 0.6, 0.02, 0.1, -0.8, 0.8, G); ball(s, 'c#5d8a3a/0.8', 0, 0.02, -0.3, 0.32, 8, 1);
    for (let i = 0; i < 9; i++) leaf(s, pick(['c#7fa04a/0.8', 'c#9fb0a4/0.8', 'c#5d8a3a/0.8']), [(rnd() - 0.5) * 0.2, 0.3, 0], 1.57 + (i - 4) * 0.28, -0.7 + (i % 3) * 0.55, 1.1 + rnd() * 0.5, 0.13, { shape: 'paddle', droop: 0.5, fold: 0.3 });
    kit.sign(s, 0, 0.11, -1.1, 1.1, 0.5, TAG('Stag', 'Mounted, not stuffed. Very much alive.'), { cw: 240, ch: 110 });
  }
  // ---- the back wall: the plant hospital, pots for sale, the nursery ----------------------------------------
  {
    const h = at(9.4, D, 0, 'street');                         // +x toward smaller a, +y toward the street
    X.shelving(h, -3, 3, [1.5, 3.1, 4.7], { d: 1.2, mat: WHITEP, over: 1.6 });
    kit.sign(h, 0, 0.04, 7.3, 4.6, 1.2, HOSPITAL, { cw: 690, ch: 180 }); h.box('c#3a6a3a/0.8', -2.38, 2.38, 0.01, 0.035, 6.66, 7.94);
    // top ward
    { let z = pot(h, 2.2, 0.6, 4.7, 0.22, 0.34, WHITE, 'cyl'); tube(h, 'c#5d8a3a/0.8', [[2.2, 0.6, z], [2.22, 0.62, z + 0.5]], 0.01, 3); leaf(h, 'c#4a6e38/0.8', [2.22, 0.62, z + 0.5], 1.2, 0.3, 0.4, 0.14, { shape: 'heart' }); tagF(h, 2.2, 0.95, 4.7, 'Leonard', 'One leaf. It’s a good leaf.', { stick: 0, w: 0.6 });
      z = pot(h, 0.75, 0.6, 4.7, 0.26, 0.4, CELADON); stemmed(h, 0.75, 0.6, z, { n: 7, H: 0.5, lean: 1.4, L: 0.5, W: 0.11, cols: ['c#7fa04a/0.8', 'c#c9952a/0.8', 'c#d9b35a/0.8'], pitch: -1.1, droop: 0.7 }); tagF(h, 0.75, 0.98, 4.7, 'Ophelia', 'Overwatered. We don’t talk about it.', { stick: 0, w: 0.6 });
      z = pot(h, -0.7, 0.6, 4.7, 0.2, 0.3, CLAY); cactus(h, -0.7, 0.6, z, { H: 0.8, r: 0.1, arms: [[0.5, 0.3, 0.25]] }); h.cyl('c#f4f1ea/0.8', -0.7, 0.6, z + 0.36, z + 0.5, 0.108, 0.108, 8); tagF(h, -0.7, 0.92, 4.7, 'Spike Sr.', 'Fell off a windowsill. Very brave about it.', { stick: 0, w: 0.6 });
      // the drip
      z = grow(h, -2.2, 0.6, 4.7, 'spider', { r: 0.24, pot: SKY, s: 0.55 }); h.cyl(ZINC, -1.75, 0.45, 4.7, 6.1, 0.014, 0.014, 5); h.cyl(ZINC, -1.75, 0.45, 4.7, 4.73, 0.15, 0.15, 8); h.box(ZINC, -1.95, -1.75, 0.44, 0.46, 6.08, 6.1);
      ves(h, 'glass', -1.95, 0.45, 5.7, [[0, 0], [0.07, 0.03], [0.08, 0.3], [0.02, 0.36], [0, 0.36]], 8); ves(h, 'c#9fb0d8/0.2', -1.95, 0.45, 5.72, [[0, 0], [0.06, 0.02], [0.065, 0.2], [0, 0.2]], 8); tube(h, 'c#f4f1ea/0.45', [[-1.95, 0.45, 5.7], [-2.0, 0.5, 5.3], [-2.2, 0.6, z + 0.02]], 0.005, 3);
      kit.sign(h, -1.5, 0.07, 5.3, 0.55, 0.75, CHART('Fern (the other one)', 'overloved', 'to be left alone, 2 wks'), { cw: 132, ch: 180 }); }
    // middle ward
    { let z = pot(h, 2.2, 0.6, 3.1, 0.24, 0.36, CLAY); SP.stick(h, 2.2, 0.6, z, 1); tagF(h, 2.2, 0.97, 3.1, '???', 'Probably alive. Scratch test pending.', { stick: 0, w: 0.6 });
      z = pot(h, 0.8, 0.6, 3.1, 0.28, 0.4, TEAL, 'cyl'); rosette(h, 0.8, 0.6, z, { n: 7, L: 0.55, W: 0.16, shape: 'oval', p0: 1.0, p1: 0.2, droop: 0.8, cols: ['c#c9952a/0.8', 'c#a8784a/0.8', 'c#7fa04a/0.8'] }); tagF(h, 0.8, 1.0, 3.1, 'Crispin', 'Crispy. Wants a humidifier and an apology.', { stick: 0, w: 0.6 });
      z = pot(h, -0.6, 0.6, 3.1, 0.18, 0.28, WHITE, 'bowl'); tube(h, 'c#9fb0a4/0.8', [[-0.6, 0.6, z], [-0.5, 0.62, z + 0.5], [-0.3, 0.7, z + 0.85]], 0.02, 4); SP.echeveria(h, -0.3, 0.7, z + 0.84, 0.8); tagF(h, -0.6, 0.92, 3.1, 'Stretch', 'Reached for the light. Relatable.', { stick: 0, w: 0.6 });
      kit.sign(h, -2.2, 0.62, 3.1 + 0.36, 0.72, 0.72, (g, w, hh) => { paper(g, w, hh, '#f6e6dc'); T(g, 'get well', w / 2, hh * 0.22, hh * 0.2, '#b8361f', { f: F.pacifico }); T(g, 'soon', w / 2, hh * 0.42, hh * 0.2, '#b8361f', { f: F.pacifico }); ICON.leaf(g, w / 2, hh * 0.66, hh * 0.24, '#4a6e38'); T(g, 'love, the ferns x', w / 2, hh * 0.88, hh * 0.1, INK, { f: F.caveat, w: 700 }); }, { cw: 150, ch: 150, tilt: 0.15 });
      h.box('c#e8907a/0.8', -2.56, -1.84, 0.59, 0.612, 3.1, 3.82); }
    // ground floor
    { let z = pot(h, 1.9, 0.62, 1.5, 0.36, 0.55, STONE, 'cyl'); h.cyl('c#6a4a2a/0.8', 1.9, 0.62, z, z + 0.5, 0.09, 0.08, 7); stemmed(h, 1.9, 0.62, z + 0.5, { n: 2, H: 0.3, L: 0.2, W: 0.08, cols: LIME, pitch: 0.5 }); tagF(h, 1.9, 1.05, 1.5, 'Lazarus', 'Pruned to a stump in March. Look at him now. LOOK.', { stick: 0, w: 0.66 });
      kit.pack(h, 0.5, 0.6, 1.5, 0.7, 0.4, 0.5, 'c#f4f1ea/0.45', (g, w, hh) => { fill(g, w, hh, '#f4f1ea'); rect(g, w * 0.42, hh * 0.2, w * 0.16, hh * 0.6, '#3f7a4a'); rect(g, w * 0.26, hh * 0.38, w * 0.48, hh * 0.24, '#3f7a4a'); }, { cw: 96, ch: 70 });
      mister(h, -0.4, 0.6, 1.5); for (let i = 0; i < 3; i++) K.bottle(h, -1.2 - i * 0.32, 0.6, 1.5, { r: 0.09, h: 0.6, col: pick(['c#8a5a2a/0.2', 'c#2f5a6a/0.2']), label: 'c#efe2bc/0.8', cap: 'c#17140f/0.45' });
      kit.sign(h, -2.4, 0.07, 2.2, 0.55, 0.75, CHART('Crispin', 'brown edges, attitude', 'mist + firm boundaries'), { cw: 132, ch: 180 }); grow(h, -2.3, 0.6, 0.02, 'peace', { r: 0.34, pot: CLAY, s: 0.8 }); stack(h, 0.6, 0.6, 0.02, 4, 0.3); pot(h, 1.9, 0.6, 0.02, 0.4, 0.7, COAL, 'egg', true); can(h, -0.8, 0.6, 0.02, 1.0, ZINC, 1.2); }
  }
  {
    const c = at(16.8, D, 0, 'street');                        // pots for sale
    const zs = X.shelving(c, -3.7, 3.7, [1.3, 2.9, 4.4, 5.9], { d: 1.15, mat: OAK, over: 1.5 }), styles = ['std', 'cyl', 'bowl', 'egg', 'foot', 'taper'];
    zs.forEach((z, zi) => { if (zi === 0) return; for (let j = 0; j < 8; j++) { const r = 0.2 + ((j * 7 + zi * 3) % 5) * 0.035, st = styles[(j + zi * 2) % 6]; pot(c, -3.25 + j * 0.93, 0.58 + (j % 2) * 0.06, z, r, r * (st === 'bowl' ? 1.1 : st === 'foot' ? 2 : 1.6), GLAZES[(j * 5 + zi * 3) % GLAZES.length], st, true); } });
    for (const [x, r, m, st] of [[-3.0, 0.42, NAVY, 'egg'], [-0.7, 0.46, CREAM, 'foot'], [0.6, 0.4, RUST, 'taper'], [3.0, 0.44, CELADON, 'cyl']]) pot(c, x, 0.6, 1.3, r, r * 1.7, m, st, true);
    kit.model('st_terracotta_pot_3', c, -1.9, 0.6, 1.3, 0, {}); stack(c, 1.9, 0.6, 1.3, 5, 0.34); for (let i = 0; i < 4; i++) { stack(c, -3.0 + i * 1.9, 0.6, 0.02, 3 + (i % 2) * 2, 0.36); }
    X.card(c, -3.25, 1.05, 4.4, 0.8, 0.42, TAG('pots, 6 to 40', 'For when it outgrows the last one. It will.'), { cw: 240, ch: 126 });
    X.card(c, 0.45, 1.05, 2.9, 0.8, 0.42, TAG('seconds, half price', 'A bit wonky. So are we all.'), { cw: 240, ch: 126 });
    X.card(c, 2.4, 1.05, 5.9, 0.8, 0.42, TAG('drainage holes: yes', 'We will not sell you a pot without one. Don’t ask.'), { cw: 240, ch: 126 });
    kit.sign(c, 0, 0.07, 6.9, 4.4, 0.6, BOARD('POTS', 'hand-thrown, mostly on purpose', '#e6e0cf', '#34553a', { ts: 0.5, ss: 0.2 }), { cw: 560, ch: 80 });
    // on top, two that have let themselves go
    SP.pothos(c, -3.25, 0.6, pot(c, -3.25, 0.6, 7.5, 0.34, 0.45, WHITE, 'bowl'), 1.3, 0.34); SP.philo(c, 3.25, 0.6, pot(c, 3.25, 0.6, 7.5, 0.36, 0.5, MUSTARD, 'cyl'), 1.1, 0.36);
    X.card(c, -2.3, 0.75, 7.5, 0.8, 0.5, TAG('Rapunzel', 'Golden pothos. Trim her and she comes back with friends.'), { cw: 240, ch: 150 });
  }
  {
    const n = at(23.9, D, 0, 'street'), tops = [1.6, 3.4, 5.2];  // the nursery: a wire rack under grow lights
    n.box(BLUSH, -2.7, 2.7, 0.02, 0.07, 0, 7.2, G);
    for (const x of [-2.66, 2.66]) for (const y of [0.14, 1.5]) n.box(IRON, x - 0.035, x + 0.035, y - 0.035, y + 0.035, 0, 7.0);
    for (const z of [...tops, 7.0]) { n.box(IRON, -2.7, 2.7, 0.1, 1.54, z - 0.035, z); }
    for (const z of [3.4, 5.2, 7.0]) { n.box('c#f4f1ea/0.45', -2.5, 2.5, 0.3, 1.3, z - 0.1, z - 0.036); n.box(GLOW, -2.6, 2.6, 0.075, 0.09, z - 0.5, z - 0.12); for (const y of [0.52, 1.08]) n.box(GLOW, -2.4, 2.4, y - 0.05, y + 0.05, z - 0.13, z - 0.1); }
    n.block(-2.7, 2.7, 0, 1.55, 0, 7);
    const tray = (x, z, kind) => { n.soft('c#2b2724/0.8', x - 0.8, x + 0.8, 0.3, 1.3, z, z + 0.2, 0.03); n.box(SOIL, x - 0.75, x + 0.75, 0.35, 1.25, z + 0.19, z + 0.215);
      for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const px = x - 0.6 + i * 0.3, py = 0.5 + j * 0.3, a = rnd() * 3, hh = kind === 'tall' ? 0.3 + rnd() * 0.3 : 0.07 + rnd() * 0.08; if (kind === 'few' && rnd() < 0.6) continue;
        n.box('c#7fa04a/0.8', px - 0.006, px + 0.006, py - 0.006, py + 0.006, z + 0.2, z + 0.2 + hh); for (const s of [0, Math.PI]) leaf(n, pick(LIME), [px, py, z + 0.2 + hh], a + s, 0.4, kind === 'tall' ? 0.16 : 0.08, kind === 'tall' ? 0.05 : 0.035, { shape: 'dot' }); if (kind === 'tall') for (const s of [1.5, 4.6]) leaf(n, pick(LIME), [px, py, z + 0.2 + hh * 0.6], a + s, 0.3, 0.13, 0.045, { shape: 'dot' }); } };
    tray(-1.6, 5.2, 'small'); tray(0.3, 5.2, 'few'); tray(-1.5, 3.4, 'tall'); tray(1.5, 3.4, 'small'); tray(1.6, 1.6, 'tall');
    kit.model('seeding_tray_01', n, 1.9, 0.8, 5.2, 0, { scale: 1.3 });
    for (let i = 0; i < 6; i++) { const z = pot(n, -0.4 + (i % 3) * 0.42, 0.55 + Math.floor(i / 3) * 0.5, 3.4, 0.14, 0.24, CLAY); SP.aloe(n, -0.4 + (i % 3) * 0.42, 0.55 + Math.floor(i / 3) * 0.5, z, 0.3 + rnd() * 0.15); }
    for (let i = 0; i < 4; i++) { const x = -2.2 + i * 0.75; SP[['pilea', 'begonia', 'croton', 'peperomia'][i]](n, x, 0.8, pot(n, x, 0.8, 1.6, 0.22, 0.32, CLAY), 0.6); }
    tagF(n, -1.6, 1.36, 5.2, 'basil, day 9', 'Ambitious.', { stick: 0.0, w: 0.5 }); tagF(n, 0.3, 1.36, 5.2, 'unknown', 'We lost the packet. Exciting!', { stick: 0.0, w: 0.5 });
    tagF(n, -1.5, 1.36, 3.4, 'tomatoes', '“Slow Blush”. Leggy. Teenagers.', { stick: 0.0, w: 0.5 }); tagF(n, 1.5, 1.36, 3.4, 'sweet peas', 'Day 4. One has a plan.', { stick: 0.0, w: 0.5 }); tagF(n, -0.9, 1.4, 1.6, 'starter plants, 5', 'Small now. That’s the fun bit.', { stick: 0.0, w: 0.6, c: '#e6d9a8' });
    kit.sign(n, 0, 0.08, 7.75, 4.4, 0.8, BOARD('THE NURSERY', 'shh. they think it is noon in june.', '#4a2240', '#f3c4e8'), { cw: 600, ch: 110 });
    grow(n, -1.6, 0.8, 0.02, 'nest', { r: 0.4, pot: CREAM, style: 'bowl', s: 0.8 }); stack(n, 0, 0.8, 0.02, 4, 0.3); can(n, 1.4, 0.8, 0.02, 1.1, 'c#b06a3c/0.32/1', 2);
  }
  // ---- the right wall: macramé, then the counter ------------------------------------------------------------
  {
    const m = at(W, 8.0, 0, 'left');                           // on the right wall: +x toward the back, +y into the room
    hcyl(m, BRASS, 'x', 0, 0.95, 8.5, 5.0, 0.03); for (const x of [-2.3, 2.3]) { m.box(BRASS, x - 0.02, x + 0.02, 0.02, 0.97, 8.48, 8.52); m.box(BRASS, x - 0.02, x + 0.02, 0.02, 0.06, 8.1, 8.52); }
    const hs = [[-1.8, 5.9, 'hearts', WHITE, 'egg'], [-0.6, 5.1, 'pothos', TEAL, 'bowl'], [0.6, 6.2, 'burro', CORAL, 'std'], [1.8, 5.4, 'wandering', CREAM, 'cyl']];
    for (const [x, z, k, pm, st] of hs) { const r = 0.34, h = 0.48; macrame(m, x, 0.95, 8.47, z, r, h); SP[k](m, x, 0.95, pot(m, x, 0.95, z - h, r, h, pm, st), 1, st === 'egg' ? r * 0.75 : r); }
    kit.sign(m, 0, 0.03, 3.9, 2.3, 1.15, CARD('macramé hangers, 14', 'knotted by Moss during the quiet hour.\n(it is all the quiet hour.)\nplant & pot not included. hope is.', { tf: F.pacifico, ts: 0.17, ty: 0.2, by: 0.38, bs: 0.105 }), { cw: 460, ch: 230 });
    grow(m, -1.5, 1.0, 0, 'alocasia', { r: 0.55, h: 0.9, pot: 'wicker', style: 'cyl', s: 1.2 }); m.block(-2.05, -0.95, 0.45, 1.55, 0, 3);
    tagF(m, -1.5, 1.38, 0.82, 'Nefertiti', 'Elephant ear. Regal. Sulks if you turn the heating on.', { stick: 0.3, w: 0.7 });
    grow(m, 1.2, 1.0, 0, 'parlour', { r: 0.5, h: 0.85, pot: CELADON, style: 'egg', s: 1.25 }); m.block(0.7, 1.7, 0.5, 1.5, 0, 3);
    tagF(m, 1.2, 1.3, 0.78, 'Colonel', 'Parlour palm. Victorian. Has seen things. Low light is fine.', { stick: 0.4, w: 0.7 });
  }
  {
    const c = at(22.5, 14.5, 0, 'left');                       // the counter: +x toward the back, +y the customers' side
    const TOP = X.counter(c, -3, 3, -1.1, 0.9, 3.3, { front: SAGE, top: 'oak_light#b89466' });
    kit.sign(c, 0, 0.9, 1.95, 3.6, 1.0, CARD('pay here', 'or just stand near a plant for a bit. also fine.', { ts: 0.34, ty: 0.34, by: 0.62, bs: 0.14, bg: '#e6e0cf' }), { cw: 540, ch: 150 });
    // the till
    { const x = 0.5, y = -0.35, z = TOP;
      c.soft('c#2f5a6a/0.45', x - 0.55, x + 0.55, y - 0.5, y + 0.45, z, z + 0.45, 0.05); c.soft('c#2f5a6a/0.45', x - 0.5, x + 0.5, y - 0.5, y + 0.05, z + 0.45, z + 0.95, 0.08); c.box(BRASS, x - 0.56, x + 0.56, y - 0.51, y + 0.46, z + 0.02, z + 0.06);
      for (let i = 0; i < 12; i++) c.cyl('c#efe9da/0.3', x - 0.36 + (i % 4) * 0.24, y + 0.15 + Math.floor(i / 4) * 0.08, z + 0.45 + (2 - Math.floor(i / 4)) * 0.05, z + 0.51 + (2 - Math.floor(i / 4)) * 0.05, 0.05, 0.05, 8);
      kit.sign(c, x, y + 0.06, z + 0.74, 0.8, 0.3, (g, w, h) => { fill(g, w, h, '#17140f'); T(g, 'GROW', w / 2, h / 2, h * 0.6, '#9fe0a0', { f: F.bebas, ls: 4 }); }, { cw: 128, ch: 48 }); }
    // brown paper on its roll, twine, labels, Audrey
    { const z = TOP; for (const x of [-2.75, -1.25]) c.box(DARKW, x - 0.04, x + 0.04, -0.75, -0.45, z, z + 0.75); hcyl(c, KRAFT, 'x', -2.0, -0.6, z + 0.55, 1.4, 0.24); hcyl(c, DARKW, 'x', -2.0, -0.6, z + 0.55, 1.6, 0.03);
      c.box(KRAFT, -2.68, -1.32, -0.37, -0.36, z + 0.02, z + 0.55); c.box(KRAFT, -2.68, -1.32, -0.37, 0.55, z + 0.004, z + 0.016);
      ves(c, 'c#c9b48a/0.8', -0.75, -0.6, z, [[0, 0], [0.2, 0], [0.2, 0.03], [0.14, 0.05], [0.07, 0.42], [0.03, 0.44], [0, 0.44]], 12); tube(c, 'c#c9b48a/0.8', [[-0.7, -0.6, z + 0.3], [-0.85, -0.1, z + 0.02], [-1.05, 0.3, z + 0.02], [-0.8, 0.5, z + 0.02]], 0.008, 3);
      K.jar(c, -0.35, 0.35, z, 0.12, 0.3, null, 0, null); for (let i = 0; i < 6; i++) c.box(KRAFT, -0.4 + i * 0.02, -0.385 + i * 0.02, 0.33 + (i % 2) * 0.03, 0.34 + (i % 2) * 0.03, z + 0.02, z + 0.42 + (i % 3) * 0.04);
      const sz = pot(c, 1.45, 0.45, z, 0.15, 0.2, WHITE, 'bowl'); SP.flytrap(c, 1.45, 0.45, sz, 1); tagF(c, 1.45, 0.66, z, 'Audrey', 'Venus flytrap. Do not feed. She is listening.', { stick: 0, w: 0.56 }); }
    // the care-card rack
    { const x = 2.3, z = TOP, cards = [['a fern', 'mist. then mist again.', '#34553a'], ['a succulent', 'walk away. further.', '#b8553a'], ['a fiddle-leaf', 'never move it. ever.', '#26364f'], ['an orchid', 'ice cubes & blind faith', '#8a4a7a'], ['a monstera', 'you can’t. we tried.', '#2f5a6a'], ['your confidence', 'start with a pothos', '#c9952a']];
      c.box(PALE, x - 0.62, x + 0.62, -0.25, 0.4, z, z + 0.05, G); c.box(PALE, x - 0.62, x + 0.62, -0.25, -0.2, z, z + 1.25, G); c.box(PALE, x - 0.62, x + 0.62, -0.2, 0.08, z + 0.05, z + 0.6, G);
      cards.forEach(([w, h, col], i) => { const r = Math.floor(i / 3), cx = x - 0.4 + (i % 3) * 0.4, cy = r ? -0.14 : 0.16, cz = z + (r ? 0.6 : 0.05); c.box('c#e8e2d4/0.8', cx - 0.17, cx + 0.17, cy - 0.04, cy, cz, cz + 0.5); kit.sign(c, cx, cy + 0.005, cz + 0.26, 0.35, 0.5, CARE(w, h, col), { cw: 112, ch: 160 }); });
      X.card(c, x, 0.62, z, 0.9, 0.24, TAG('care cards, free', 'take one. read it. this is the hard part.'), { cw: 260, ch: 70 }); }
    X.pendant(c, 0, -0.1, { kind: 'cone', drop: 4.4, colour: BRASS, power: 1.0 });
    // behind the counter
    const b = at(W, 14.5, 0, 'left');
    X.shelving(b, -2.9, 2.9, [3.2, 4.6, 6.0], { d: 1.0, mat: OAK, over: 1.35, back: SAGE });
    for (let i = 0; i < 3; i++) mister(b, -2.5 + i * 0.5, 0.5, 3.2, i === 1 ? 'c#b06a3c/0.32/1' : BRASS); can(b, -0.5, 0.5, 3.2, 0.8, 'c#b06a3c/0.32/1', 0.3); can(b, 0.9, 0.5, 3.2, 0.65, ZINC, 0.3);
    for (let i = 0; i < 4; i++) ball(b, pick([KRAFT, 'c#5d8a3a/0.8', 'c#b8361f/0.8', CORD]), 1.75 + i * 0.3, 0.5, 3.2, 0.13, 8); X.card(b, 2.2, 0.85, 3.2, 0.7, 0.3, TAG('twine', 'for tying up loose ends'), { cw: 220, ch: 94 });
    for (let i = 0; i < 7; i++) K.bottle(b, -2.6 + i * 0.36, 0.5, 4.6, { r: 0.1, h: 0.75, col: pick(['c#3a6a3a/0.2', 'c#8a5a2a/0.2', 'c#26364f/0.2']), label: 'c#efe2bc/0.8', cap: 'c#17140f/0.45' });
    X.card(b, -1.5, 0.85, 4.6, 0.9, 0.3, TAG('plant food', 'a snack, not a personality'), { cw: 260, ch: 88 });
    for (let i = 0; i < 3; i++) kit.pack(b, 0.5 + i * 0.75, 0.5, 4.6, 0.6, 0.4, 0.8, 'c#26364f/0.8', (g, w, h) => { fill(g, w, h, '#26364f'); T(g, 'LEAF', w / 2, h * 0.25, h * 0.2, '#e9c46a', { f: F.limelight }); T(g, 'SHINE', w / 2, h * 0.47, h * 0.2, '#e9c46a', { f: F.limelight }); T(g, '(don’t)', w / 2, h * 0.75, h * 0.17, '#f1e9d6', { f: F.caveat, w: 700 }); }, { cw: 96, ch: 128 });
    kit.bookRow(b, -2.8, -0.4, 0.06, 6.0, 1.2, 0.72); SP.ivy(b, 0.6, 0.5, pot(b, 0.6, 0.5, 6.0, 0.26, 0.36, CORAL), 0.9, 0.26); grow(b, 1.6, 0.5, 6.0, 'peperomia', { r: 0.22, pot: WHITE, style: 'cyl' }); grow(b, 2.4, 0.5, 6.0, 'aloe', { r: 0.2, pot: MUSTARD, s: 0.8 });
    X.slateBoard(b, 0, 9.35, 5.4, 2.9, RULES, { cw: 760, ch: 408 });
    // further along the wall, the light guide
    const p = at(W, 20.6, 0, 'left'); p.box('c#17140f/0.5', -1.38, 1.38, 0.01, 0.07, 4.0, 7.76); kit.sign(p, 0, 0.08, 5.88, 2.6, 3.6, LIGHTS, { cw: 390, ch: 540 });
  }
  // a tall cactus guards the staff end of the counter, an olive the other
  { const z = pot(R, 22.4, 10.2, 0, 0.55, 0.9, CLAY); cactus(R, 22.4, 10.2, z, { H: 4.6, r: 0.3, seg: 10, arms: [[0.4, 1.9, 1.5], [3.3, 2.5, 1.0]], flower: 'c#e88aa8/0.8' }); R.block(21.8, 23.0, 9.6, 10.8, 0, 5);
    tag(22.4, 9.72, z, 'street', 'Do Not Hug', 'Saguaro. We know. We know you want to.', { stick: 0.5, w: 0.75 }); }
  grow(R, 21.2, 19.5, 0, 'olive', { r: 0.7, h: 1.2, pot: 'c#e8e2d4/0.8', style: 'taper', s: 1.1 }); R.block(20.5, 21.9, 18.8, 20.2, 0, 3);
  tag(21.2, 18.92, 1.1, 'street', 'Olivia', 'Olive. Homesick for somewhere hot. Put her by your sunniest window and say “ciao”.', { stick: 0.4, w: 0.9 });
  grow(R, 11.4, 20.6, 0, 'banana', { r: 0.8, h: 1.2, pot: TEAL, style: 'egg', s: 1.1 }); R.block(10.6, 12.2, 19.8, 21.4, 0, 3);
  tag(11.4, 20.0, 1.1, 'street', 'Big Top', 'Banana. A new leaf every week. No bananas. Don’t bring it up.', { stick: 0.4, w: 0.9 });
  grow(R, 6.5, 19.2, 0, 'parlour', { r: 0.7, h: 1.2, pot: 'wicker', style: 'cyl', s: 2.3 }); R.block(5.8, 7.2, 18.5, 19.9, 0, 3);
  tag(6.5, 18.55, 1.1, 'street', 'Kenneth', 'Kentia palm. Elegant, slow, forgiving. Basically a butler.', { stick: 0.5, w: 0.85 });

  // ---- the long table ------------------------------------------------------------------------------------------
  {
    const TOP = X.plinth(R, 14.5, 12.9, 4, 9, 2.7, { mat: OAK, shelf: 0.9 }), RZ = TOP + 0.55;
    R.box(PALE, 13.85, 15.15, 9.3, 16.5, TOP, RZ, G);
    sg(14.5, 8.36, 2.48, 'street', 3.2, 0.36, BOARD('THE LONG TABLE', null, '#34553a', '#e6e0cf', { ts: 0.6 }), { cw: 420, ch: 48 });
    X.card(at(14.5, 8.75, TOP, 'street'), 0, 0, 0, 1.5, 0.62, CARD('everything on this table', 'wants to go home with you.\nonly some of them should.', { tf: F.caveat, ts: 0.22, ty: 0.2, by: 0.4, bs: 0.19, edge: false, bg: '#efe4c8' }), { cw: 330, ch: 136 });
    // the riser: five characters
    let z = grow(R, 14.5, 9.9, RZ, 'orchid', { r: 0.24, h: 0.42, pot: WHITE, style: 'cyl', s: 1.1 }); tag(14.5, 9.6, RZ, 'street', 'Contessa', 'Orchid. Blooms once, then makes you wait. Worth it. Probably.', { stick: 0, w: 0.7 });
    z = grow(R, 14.5, 11.4, RZ, 'bromeliad', { r: 0.3, pot: COAL, style: 'bowl', s: 0.95 });
    z = grow(R, 14.5, 12.9, RZ, 'agave', { r: 0.38, h: 0.5, pot: CLAY, style: 'bowl', s: 1.25 });
    z = grow(R, 14.5, 14.4, RZ, 'croton', { r: 0.32, pot: NAVY, style: 'egg', s: 1.2 });
    z = grow(R, 14.5, 15.9, RZ, 'parlour', { r: 0.32, pot: CREAM, style: 'taper', s: 0.9 }); tag(14.5, 16.42, RZ, 'back', 'Disco', 'Croton (behind you). Wears everything at once. Wants sun and an audience.', { stick: 0, w: 0.7 });
    // down the left side (read from the left) and the right side (read from the right)
    const L = [['begonia', 'Dotty', 'Begonia. Spotty. Gossips with the calatheas.', TEAL, 'cyl'], ['pilea'], ['fern'], ['oxalis', 'Purple, on purpose', 'Oxalis. Shuts at night like a tiny umbrella shop.', WHITE, 'bowl'], ['snake'], ['fittonia', 'Fitz', 'Nerve plant. Collapses for attention. Recovers in an hour. Exhausting.', CORAL, 'bowl'], ['model'], ['pothos', 'Rapunzel’s cousin', 'Pothos. Cannot be killed. Believe us.', MUSTARD, 'std']];
    const Rr = [['peperomia', 'Pip', 'Peperomia. Small, round, pleased with herself.', CELADON, 'egg'], ['haworthia'], ['anthurium', 'Valentina', 'Anthurium. Those aren’t flowers, they’re leaves showing off.', COAL, 'cyl'], ['jade', 'Moneybags', 'Jade plant. Said to bring wealth. Has brought 0. Still lovely.', CLAY, 'std'], ['leafy'], ['asparagus', 'Fluff', 'Asparagus fern. Not asparagus. Not a fern. Mind your business.', WHITE, 'cyl'], ['violet'], ['claypot']];
    const row = (list, a, face) => list.forEach(([k, name, note, pm, st], i) => {
      const d = 8.95 + i * 1.13, ta = a + (face === 'left' ? -0.38 : 0.38); let sz = TOP;
      if (k === 'fern' || k === 'snake' || k === 'leafy') kit.pottedPlant(R, a, d, TOP, k, { size: k === 'snake' ? 0.62 : 0.6, pot: pick([CLAY, CREAM, SKY]), block: false });
      else if (k === 'model') { kit.model('potted_plant_04', R, a, d, TOP, 0, {}); tag(ta, d, TOP, face, 'Aloe there', 'Aloe. Break in case of sunburn.', { stick: 0, w: 0.62 }); }
      else if (k === 'claypot') { kit.model('planter_pot_clay', R, a, d, TOP, 0, {}); SP.daisy(R, a, d, TOP + 0.55, 1, 'c#f4f1ea/0.8'); }
      else if (k === 'pothos') sz = SP.pothos(R, a, d, pot(R, a, d, TOP, 0.26, 0.4, pm, st), 0.9, 0.26);
      else sz = grow(R, a, d, TOP, k, { r: k === 'haworthia' || k === 'violet' ? 0.2 : 0.26, pot: pm ?? pick(GLAZES), style: st ?? 'std', s: k === 'haworthia' ? 1.3 : 1 });
      if (name) tag(ta, d, TOP, face, name, note, { stick: 0, w: 0.62 });
    });
    row(L, 13.2, 'left'); row(Rr, 15.8, 'right');
    // under the table
    for (let i = 0; i < 4; i++) stack(R, 13.4 + (i % 2) * 0.8, 9.2 + Math.floor(i / 2) * 0.8, 0.9, 4 + i, 0.3); can(R, 14.8, 11.6, 0.9, 1.2, ZINC, 1.0); can(R, 13.6, 12.6, 0.9, 1.0, 'c#b06a3c/0.32/1', 2.0);
    for (let i = 0; i < 5; i++) pot(R, 13.5 + (i % 2) * 1.5, 13.8 + i * 0.62, 0.9, 0.36, 0.6, GLAZES[(i * 3 + 1) % GLAZES.length], ['egg', 'cyl', 'taper', 'foot', 'bowl'][i], true);
    // above it: lamps and baskets by turns
    SP.wandering(R, 14.5, 9.3, hang(R, 14.5, 9.3, 8.4, { pot: COAL }), 1.2, 0.42); SP.ivy(R, 14.5, 12.95, hang(R, 14.5, 12.95, 8.9, { pot: CORAL, r: 0.38 }), 1.2, 0.38); SP.pothos(R, 14.5, 16.6, hang(R, 14.5, 16.6, 8.2, { pot: CELADON }), 1.3, 0.42);
    for (const d of [11.1, 14.8]) X.pendant(R, 14.5, d, { kind: 'dome', drop: 4.3, colour: 'c#4a6e38/0.45', power: 1.0 });
  }
  // ---- the round stand facing the door: three tiers and Doug -------------------------------------------------
  {
    const cx = 7.3, cy = 12.2;
    R.cyl(SAGE, cx, cy, 0, 1.0, 1.7, 1.7, 28); R.cyl(SAGE, cx, cy, 1.0, 2.0, 1.1, 1.1, 24); R.cyl(SAGE, cx, cy, 2.0, 3.0, 0.52, 0.52, 20); R.cyl(PALE, cx, cy, 1.0, 1.03, 1.74, 1.74, 28); R.cyl(PALE, cx, cy, 2.0, 2.03, 1.14, 1.14, 24); R.cyl(PALE, cx, cy, 3.0, 3.03, 0.56, 0.56, 20);
    R.block(cx - 1.6, cx + 1.6, cy - 1.6, cy + 1.6, 0, 3.4);
    grow(R, cx, cy, 3.03, 'ponytail', { r: 0.42, h: 0.5, pot: CLAY, style: 'bowl', s: 1.2 });
    const low = ['peperomia', 'croton', 'pilea', 'anthurium', 'calathea', 'oxalis', 'begonia', 'peace', 'spider'], mid = ['echeveria', 'fittonia', 'violet', 'haworthia', 'jade', 'daisy'];
    low.forEach((k, i) => { const a = i / low.length * TAU - 1.57, x = cx + Math.cos(a) * 1.4, y = cy + Math.sin(a) * 1.4; grow(R, x, y, 1.03, k, { r: 0.24, pot: GLAZES[(i * 5 + 2) % GLAZES.length], style: ['std', 'cyl', 'egg', 'bowl'][i % 4], s: k === 'calathea' || k === 'spider' ? 0.7 : 0.85 }); });
    mid.forEach((k, i) => { const a = i / mid.length * TAU - 1.57, x = cx + Math.cos(a) * 0.82, y = cy + Math.sin(a) * 0.82; grow(R, x, y, 2.03, k, { r: 0.2, pot: GLAZES[(i * 3 + 4) % GLAZES.length], style: ['bowl', 'std', 'cyl'][i % 3], s: k === 'jade' ? 0.7 : 1 }); });
    tag(cx, cy - 0.56, 3.03, 'street', 'Doug', 'Ponytail palm. Stores water in his bottom. Water when you remember. He will remind you.', { stick: 0, w: 0.8 });
    tag(cx, cy - 1.14, 2.03, 'street', 'little ones, 6', 'Starter friends. Low stakes. High reward.', { stick: 0, w: 0.62, c: '#e6d9a8' });
    tag(cx + 0.75, cy - 1.62, 1.03, 'street', 'Trudy', 'Croton. Will drop every leaf if you look at the thermostat.', { stick: 0, w: 0.62 });
    tag(cx - 0.75, cy - 1.62, 1.03, 'street', 'new in', 'Fresh off the barge. Still a bit seasick. Be gentle.', { stick: 0, w: 0.62, c: '#e6d9a8' });
  }
  // ---- more from the beams: baskets, a kokedama, and the rest of the lamps ------------------------------------
  SP.philo(R, 4.6, 9.3, hang(R, 4.6, 9.3, 8.6, { pot: MUSTARD }), 1.1, 0.42); SP.burro(R, 9.8, 17.2, hang(R, 9.8, 17.2, 8.8, { pot: SKY, r: 0.36 }), 1.3, 0.36); SP.hearts(R, 19.2, 8.2, hang(R, 19.2, 8.2, 8.7, { pot: PINK, r: 0.36 }), 1.1, 0.36);
  SP.pothos(R, 18.6, 21.3, hang(R, 18.6, 21.3, 8.5, { pot: NAVY }), 1.2, 0.42); SP.wandering(R, 4.2, 21.0, hang(R, 4.2, 21.0, 8.9, { pot: WHITE, r: 0.38 }), 1.1, 0.38);
  for (const [a, d, z] of [[10.3, 6.3, 7.2], [19.0, 14.6, 7.6]]) { R.cyl(KRAFT, a, d, z + 0.6, 12, 0.01, 0.01, 4); ball(R, 'c#4a6e38/0.8', a, d, z, 0.34, 10); SP.nest(R, a, d, z + 0.62, 0.7); trail(R, a, d, z + 0.5, { n: 4, len: 0.9, L: 0.14, W: 0.06, r: 0.3, top: 0 }); }
  { const f = at(10.3, 6.3, 6.5, 'street'); f.box(KRAFT, -0.004, 0.004, -0.004, 0.004, 0.34, 0.75); kit.sign(f, 0, 0.006, 0.17, 0.62, 0.36, TAG('kokedama', 'a plant in a moss jumper'), { cw: 220, ch: 128 }); f.box('c#d9cdb2/0.8', -0.31, 0.31, -0.006, 0.002, -0.01, 0.35); }
  X.pendant(R, 5.2, 5.6, { kind: 'paper', drop: 3.4, power: 0.9 }); X.pendant(R, 9.4, 22.6, { kind: 'globe', drop: 3.6, power: 0.9 }); X.pendant(R, 17.0, 22.6, { kind: 'globe', drop: 3.6, power: 0.9 }); X.pendant(R, 2.9, 18.8, { kind: 'bulb', drop: 4.2, power: 0.8 });

  // ---- out on the pavement --------------------------------------------------------------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));           // x = a along the frontage, y = -feet out from the shopfront
  const tagO = (a, out, h, name, note, op) => tagF(K.wrap(lot.frOut(kit, a, out, h, 'street')), 0, 0, 0, name, note, op);
  // two lollipop bays by the door
  for (const a of [4.9, 10.9]) { const z = pot(o, a, -0.95, 0, 0.6, 1.1, COAL, 'taper'); o.cyl('c#6a4a2a/0.8', a, -0.95, z, z + 2.4, 0.06, 0.05, 6); ball(o, 'c#3a6a3a/0.8', a, -0.95, z + 2.2, 0.85, 12);
    for (let i = 0; i < 26; i++) { const az = i * 2.4, el = -0.6 + (i / 26) * 2.0; leaf(o, pick(GREENS), [a + Math.cos(az) * Math.cos(el) * 0.8, -0.95 + Math.sin(az) * Math.cos(el) * 0.8, z + 3.05 + Math.sin(el) * 0.8], az, el * 0.6, 0.3, 0.09, { shape: 'oval' }); } o.block(a - 0.55, a + 0.55, -1.5, -0.4, 0, 3); }
  // the sale barrow
  {
    const cx = 17, cy = -2.6;
    o.soft('c#3a6a3a/0.45', cx - 1.5, cx + 1.3, cy - 0.85, cy + 0.85, 1.15, 1.95, 0.08); o.box('soilbed', cx - 1.4, cx + 1.2, cy - 0.75, cy + 0.75, 1.9, 1.99);
    hcyl(o, 'c#2b2724/0.8', 'y', cx - 2.05, cy, 0.6, 0.22, 0.6, 0.6, 18); hcyl(o, 'c#b8361f/0.45', 'y', cx - 2.05, cy, 0.6, 0.26, 0.32, 0.32, 10);
    for (const s of [-1, 1]) { tube(o, PALE, [[cx - 2.05, cy + s * 0.2, 0.6], [cx - 1.3, cy + s * 0.6, 1.12], [cx + 1.3, cy + s * 0.78, 1.5], [cx + 3.0, cy + s * 0.82, 1.95]], 0.05, 5, true); o.box(IRON, cx + 0.85, cx + 0.93, cy + s * 0.7 - 0.04, cy + s * 0.7 + 0.04, 0, 1.4); }
    o.block(cx - 2.6, cx + 3.0, cy - 0.9, cy + 0.9, 0, 2.4);
    const ks = [['daisy', 'c#f3d96a/0.8'], ['daisy', 'c#e88aa8/0.8'], ['spider'], ['daisy', 'c#f4f1ea/0.8'], ['croton'], ['daisy', 'c#e0782a/0.8'], ['oxalis'], ['daisy', 'c#8a5ab0/0.8']];
    ks.forEach(([k, col], i) => { const x = cx - 1.05 + (i % 4) * 0.66, y = cy - 0.36 + Math.floor(i / 4) * 0.7, z = pot(o, x, y, 1.99, 0.24, 0.34, CLAY); SP[k](o, x, y, z, 0.9, col); });
    o.box(KRAFT, cx + 0.95, cx + 1.01, cy - 0.74, cy - 0.7, 1.9, 3.4); o.box('c#d9cdb2/0.8', cx + 0.2, cx + 1.8, cy - 0.78, cy - 0.74, 2.5, 3.5);
    kit.sign(K.wrap(lot.frOut(kit, cx + 1.0, -cy + 0.785, 0, 'street')), 0, 0, 3.0, 1.6, 1.0, CARD('the sale barrow', 'slightly wonky. half price.\nfull personality.', { ts: 0.2, ty: 0.24, by: 0.44, bs: 0.15 }), { cw: 320, ch: 200 });
  }
  // buckets of cut flowers on a plank
  {
    for (const x of [21.9, 25.0]) X.crate(o, x, -1.3, 0, 1.3, 1.5, 0.9); o.box(OAK, 21.0, 25.9, -2.1, -0.5, 0.9, 1.0, G); o.block(21.0, 25.9, -2.1, -0.5, 0, 2.4);
    const sets = [[['c#e7c64a/0.8', 'c#f2ead8/0.8'], 'c#f3d96a/0.8'], [['c#e58f7a/0.8', 'c#e88aa8/0.8', 'c#f2ead8/0.8'], 'c#e88aa8/0.8'], [['c#8a5ab0/0.8', 'c#9fb0d8/0.8', 'c#f2ead8/0.8'], 'c#8a5ab0/0.8']];
    sets.forEach(([cols, c2], i) => { const x = 21.8 + i * 1.65, y = -1.3, z = 1.0;
      ves(o, ZINC, x, y, z, [[0, 0], [0.38, 0], [0.5, 1.05], [0.53, 1.05], [0.53, 1.09], [0.46, 1.09], [0.36, 0.06], [0, 0.06]], 14); o.cyl('c#2f5a6a/0.2', x, y, z + 0.8, z + 0.82, 0.44, 0.44, 12);
      kit.posy(o, x, y, z + 0.62, cols);
      for (let k = 0; k < 9; k++) { const a = k * 0.7 + i, r = 0.2 + (k % 3) * 0.09, hh = 1.45 + rnd() * 0.5, ex = x + Math.cos(a) * r * 1.5, ey = y + Math.sin(a) * r * 1.5; tube(o, 'c#5d8a3a/0.8', [[x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, z + 0.8], [ex, ey, z + hh]], 0.01, 3); ball(o, k % 3 ? c2 : cols[0], ex, ey, z + hh - 0.04, 0.075, 6, 0.75); if (k % 2) leaf(o, pick(GREENS), [(x + ex) / 2, (y + ey) / 2, z + 1.1], a + 1, 0.4, 0.3, 0.05, { shape: 'lance' }); } });
    o.box('c#d9cdb2/0.8', 22.75, 24.15, -2.14, -2.11, 0.2, 0.9);
    kit.sign(K.wrap(lot.frOut(kit, 23.45, 2.145, 0, 'street')), 0, 0, 0.55, 1.4, 0.7, CARD('cut flowers, 6 a bunch', 'they were consulted. they said fine.', { tf: F.caveat, ts: 0.26, ty: 0.28, by: 0.52, bs: 0.17 }), { cw: 300, ch: 150 });
  }
  // a bench of hardy things on the left, and the board
  {
    o.box(OAK, 0.6, 4.0, -1.9, -0.5, 1.3, 1.42, G); for (const x of [0.8, 3.8]) o.box(DARKW, x - 0.08, x + 0.08, -1.8, -0.6, 0, 1.3, G); o.box(OAK, 0.8, 3.8, -1.75, -1.0, 0.5, 0.58, G); o.block(0.6, 4.0, -1.9, -0.5, 0, 2.6);
    kit.pottedPlant(o, 1.2, -1.2, 1.42, 'fern', { size: 0.9, pot: CLAY, block: false }); grow(o, 2.3, -1.2, 1.42, 'agave', { r: 0.36, h: 0.5, pot: STONE, style: 'bowl', s: 1.1 }); kit.pottedPlant(o, 3.4, -1.2, 1.42, 'leafy', { size: 0.9, pot: NAVY, block: false });
    stack(o, 1.3, -1.35, 0.58, 4, 0.3); can(o, 2.9, -1.35, 0.58, 1.1, ZINC, 2.6);
    tagO(2.3, 1.72, 1.42, 'outdoor types', 'Tough. Will survive the weather and your holiday.', { stick: 0.0, w: 0.75 });
  }
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA - 4.9, 5.6, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h, '#24302a'); chalk(g, 'frond', w / 2, h * 0.1, h * 0.13, '#9fc6b0'); ICON.leaf(g, w / 2, h * 0.27, h * 0.16, '#9fc6b0');
    chalk(g, 'today:', w / 2, h * 0.42, h * 0.07, '#e9c46a'); chalk(g, 'free advice (plants)', w / 2, h * 0.53, h * 0.075, '#f1efe6', { max: w * 0.9 }); chalk(g, 'unsolicited advice (life)', w / 2, h * 0.63, h * 0.075, '#f1efe6', { max: w * 0.9 }); chalk(g, 'your fern forgives you', w / 2, h * 0.76, h * 0.08, '#e8a8a0', { max: w * 0.9 }); chalk(g, 'come in. leave with a friend.', w / 2, h * 0.91, h * 0.058, '#9aa39d', { max: w * 0.9 }); });

  flush();

  // ---- Moss -------------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'moss', name: 'Moss', lot: 'plants', look: { shape: 'round', colour: '#5f7d48', belly: '#e9e2c8', trim: '#b08d4a', hat: 'straw', hatColour: '#b8553a', apron: '#6a4a2a', eye: '#fff0c0', ring: 0xb8e08a, tool: 'can', blush: true, hover: 4.7 },
    home: lot.world(24.8, 14.5), faces: lot.world(14.5, 14.5), posts: [lot.world(24.8, 12.3), lot.world(24.8, 21.2), lot.world(24.8, 14.5)],
    lines: {
      greet: ['Oh. A person. Hello. Mind the ferns, they are shy.', 'Welcome to Frond. Everything in here is alive, including, technically, me.', 'Come in. Walk slowly. The calatheas spook.'],
      idle: ['*to a fern* No, no. You are doing wonderfully.', '*mists something. mists it again, to be sure*', 'Gerald has a new leaf. I am not going to make a fuss. ...I made a small fuss.', '*hums at the seedlings. the seedlings do not hum back. yet*', 'It is always nearly evening, so everyone gets bright, indirect light. Lucky.', 'You grew a whole centimetre. Do not let it go to your head. You do not have one.'],
      bye: ['Go gently. Drink some water. That one is for you, not the plant.', 'Come back and tell me how it is growing. Or how you are. Same question.'],
      topics: [
        { q: 'I kill every plant I touch.', a: 'No. You love them to death, which is different. Most things want less water and more looking-at.', next: [
          { q: 'So what should I start with?', a: 'A snake plant. It thrives on being forgotten, like a good grudge. Or a pothos, who faints when thirsty and forgives you by teatime.' },
          { q: 'And if it dies anyway?', a: 'Then it was a plant, and you were kind to it for a while. Compost is not failure. Compost is a career change.' }] },
        { q: 'How often should I water?', a: 'When the soil is dry two knuckles down. Not on a schedule. Nobody thrives on being loved every Tuesday at nine whether they need it or not.' },
        { q: 'One of my leaves went yellow.', a: 'One yellow leaf is not an emergency. It is a plant letting go of something it no longer needs. I find that quite advanced, personally.', next: [
          { q: 'And if they ALL go yellow?', a: 'Then stop watering, move it to the light, and bring it to the Plant Hospital at the back. Visiting hours are always. No grapes.' }] },
        { q: 'Who is Gerald?', a: 'The monstera by the seed rack. He was here before the shop. Possibly before the street. We put the walls up round him. Do not make eye contact; he takes it as an offer to be repotted.' },
        { q: 'Do you really talk to them?', a: 'All day. They are very good listeners, and only one of them has ever interrupted.', next: [
          { q: '...Which one?', a: 'Audrey, the flytrap on the counter. Snapped shut mid-sentence. I had it coming. I was talking about salad.' }] },
        { q: 'What is the pink light for?', a: 'The seedlings. It tells them it is noon in June. A small lie, but they are babies and it is always nearly evening here. Everyone deserves one good noon.' },
        { q: 'What grows in a dark room?', a: 'A fern, a snake plant, or a lamp. Honestly, start with the lamp. Everything needs something to grow toward. You as well.' },
      ],
    },
  });
}
