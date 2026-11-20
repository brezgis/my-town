// Tomorrow Bread  (south side; the 17 ft shopfront of no. 23 South Main Street: 16 ft wide inside, 42.7 deep)
// A front shop and a bakehouse behind it, as the building had. THE SHOP: the counter down the left with the
// pastry case, the till and the baguettes; behind it the bread wall, nine breads on three slanted racks, each
// with a label that says what is actually in it; down the right, under the slate, a long settle to eat a bun
// on. A boarded dado and a rail at the height of the bread wall's cornice run round the room. THE PARTITION:
// a wide hatch behind the counter with the loaves cooling on its sill, and beside it a cased doorway that
// lines up with the street door, so that from the pavement you look straight through to the oven. THE
// BAKEHOUSE (white tile to shoulder height): the long floured bench in the middle under two lamps (Doris the
// starter at its near end, her feeding log on the wall by her), open shelves and the proving cupboard down
// the left, the mixer, the flour and the rack trolley down the right, and across the back the yard door and
// the brick chimney breast with the deck oven set into it, its middle door down and the mouth glowing: that
// glow, seen from the door, is the picture. Crumb is behind the counter and fetches from the hatch.
import { tools, fixtures, snapMat } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { arch } from './arch.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, para, ICON } from '../draw.js';

const OAK = 'oak_light#a3825c', PALEW = 'oak_light#c4a477', BLUSH = 'painted_wood#d8b7a6', CREAM = 'painted_wood#efe6d4', DARKW = 'fir#3a2c24';
const STEEL = 'c#c9ccd0/0.45/1', IRON = 'c#2b2724/0.45/1', PORC = 'c#ebe6dc/0.18', ENAMEL = 'c#2b2724/0.45', LINEN = 'linen#e9dfc8', SACK = 'linen#d9c9a8';
const CR1 = 'c#a8784a/0.8', CR2 = 'c#8a5a2a/0.8', CR3 = 'c#6a4a2a/0.8', RYE = 'c#3a2214/0.8', PALE = 'c#c9a77a/0.8', BUN = 'c#b08a5a/0.45', GOLD = 'c#c9952a/0.45', FLOUR = 'c#e8e2d4/0.8', WHITE = 'c#f4f1ea/0.8', DOUGH = 'c#efe2bc/0.8';
const BRICK = 'brick#8f7a6e', TILEW = 'tile_subway', BEECH = 'oak_light#dcc8a2';       // the bench's top: pale beech, the colour of flour on wood
const GLOW = 'e#ff7a2a/1.1';                                    // the one new glow: the oven
const INK = '#2a1c13', RED = '#a8554a', PAPER = '#f6efdc', PINK = '#f3d9cf';

// ---- lettering ------------------------------------------------------------------------------------------
const TICKET = (name, price) => (g, w, h) => { paper(g, w, h, PAPER); T(g, name, w / 2, h * 0.34, h * 0.36, INK, { f: F.caveat, w: 700, max: w * 0.92 }); T(g, price, w / 2, h * 0.75, h * 0.3, RED, { f: F.fraunces, w: 700 }); };
const BREADTAG = (name, note, price) => (g, w, h) => {
  paper(g, w, h, PAPER, name.length); g.strokeStyle = RED; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6);
  T(g, name, w * 0.04, h * 0.3, h * 0.36, RED, { f: F.bebas, ls: 2, a: 'left', max: w * 0.76 }); T(g, price, w * 0.96, h * 0.3, h * 0.34, INK, { f: F.fraunces, w: 700, a: 'right' });
  T(g, note, w * 0.04, h * 0.72, h * 0.3, INK, { f: F.caveat, w: 600, a: 'left', max: w * 0.92 });
};
const rows = (g, w, h, list, y0, dy, px, cols = ['#e9c46a', '#efe9da']) => list.forEach(([a, b], i) => { chalk(g, a, w * 0.07, h * (y0 + i * dy), px, cols[0], { a: 'left' }); chalk(g, b, w * 0.27, h * (y0 + i * dy), px, cols[1], { a: 'left', max: w * 0.68 }); });
const TODAY = (g, w, h) => {
  slate(g, w, h, '#232826', 5); chalk(g, "today's bake", w / 2, h * 0.09, h * 0.1, '#f1efe6'); line(g, [[w * 0.2, h * 0.15], [w * 0.8, h * 0.15]], '#e8a8a0', 3);
  chalk(g, 'out of the oven at', w / 2, h * 0.2, h * 0.045, '#9aa39d');
  rows(g, w, h, [['5:10', 'baguettes, first deck'], ['5:40', 'country loaf · miche'], ['6:15', 'seeded tin · pain de mie'], ['6:30', 'croissants · milk buns'], ['7:00', 'the door'], ['9:30', 'focaccia (rosemary)'], ['11:00', 'baguettes again'], ['3:00', 'cardamom knots']], 0.29, 0.076, h * 0.056);
  chalk(g, 'the dark rye is for tomorrow: it needs the day', w / 2, h * 0.925, h * 0.046, '#9fc6b0', { max: w * 0.9 });
};
const FEEDLOG = (g, w, h) => {
  paper(g, w, h, '#fbf7ea', 31); for (let i = 0; i < 13; i++) line(g, [[w * 0.05, h * (0.2 + i * 0.058)], [w * 0.95, h * (0.2 + i * 0.058)]], '#b9cfe0', 1);
  T(g, 'DORIS · FEEDING LOG', w / 2, h * 0.055, h * 0.052, RED, { f: F.bebas, ls: 2 }); T(g, 'levain, 100% hydration · 80 white / 20 whole rye', w / 2, h * 0.115, h * 0.03, INK, { f: F.fraunces, it: 1, max: w * 0.9 });
  T(g, 'day   time    1 : flour : water    °C', w * 0.06, h * 0.172, h * 0.028, RED, { f: F.elite, a: 'left', max: w * 0.88 });
  [['Mon 14:00  1:5:5  26°', 'doubled by 18:20. smug'], ['Tue 14:00  1:5:5  25°', 'tripled. domed. a spoonful floats'], ['Wed 14:05  1:5:5  23°', 'slow. moved her nearer the oven'], ['Thu 14:00  1:5:5  27°', 'peaked early: yoghurt, green apple'], ['Fri 13:55  1:10:10  26°', 'big feed for the weekend bake'], ['Sat 14:00  1:5:5  26°', 'sang a little (it was the fridge)']]
    .forEach(([a, b], i) => { T(g, a, w * 0.06, h * (0.232 + i * 0.116), h * 0.034, INK, { f: F.elite, a: 'left', max: w * 0.88 }); T(g, b, w * 0.12, h * (0.288 + i * 0.116), h * 0.042, '#26364f', { f: F.caveat, w: 600, a: 'left', max: w * 0.82 }); });
  T(g, 'lid ON LOOSE. she breathes.', w / 2, h * 0.945, h * 0.046, RED, { f: F.caveat, w: 700, max: w * 0.9 });
};
const SACKLABEL = (kind, sub, c = '#8a3a2a') => (g, w, h) => {
  fill(g, w, h, '#dccdaa'); grain(g, w, h, 0.09, kind.length);
  const r = Math.min(h * 0.3, w * 0.16), cx = h > w ? w / 2 : r * 1.35, cy = h > w ? h * 0.24 : h / 2;
  disc(g, cx, cy, r, null, c, r * 0.12); disc(g, cx, cy, r * 0.2, c); for (let i = 0; i < 8; i++) line(g, [[cx + Math.cos(i * 0.785) * r * 0.2, cy + Math.sin(i * 0.785) * r * 0.2], [cx + Math.cos(i * 0.785) * r * 0.94, cy + Math.sin(i * 0.785) * r * 0.94]], c, r * 0.09);
  if (h > w) { T(g, 'HOLLOW WHEEL MILL', w / 2, h * 0.47, h * 0.058, c, { f: F.bebas, ls: 2, max: w * 0.88 }); T(g, kind, w / 2, h * 0.585, h * 0.095, INK, { f: F.abril, max: w * 0.88 }); T(g, sub, w / 2, h * 0.69, h * 0.045, INK, { f: F.elite, max: w * 0.88 }); T(g, 'stoneground · unbleached · 25 kg', w / 2, h * 0.79, h * 0.042, c, { f: F.fraunces, it: 1, max: w * 0.88 }); T(g, 'store cool & dry', w / 2, h * 0.89, h * 0.05, INK, { f: F.caveat, w: 600, max: w * 0.88 }); }
  else { const x = r * 2.7 + (w - r * 2.7) / 2, mx = (w - r * 2.9) * 0.94; T(g, 'HOLLOW WHEEL MILL · STONEGROUND', x, h * 0.2, h * 0.16, c, { f: F.bebas, ls: 2, max: mx }); T(g, kind, x, h * 0.5, h * 0.3, INK, { f: F.abril, max: mx }); T(g, sub + ' · 25 kg', x, h * 0.82, h * 0.14, INK, { f: F.elite, max: mx }); }
};
const WINCARD = (g, w, h) => {
  board(g, w, h, '#fbf4e6', RED, { inset: h * 0.05 }); T(g, 'Tomorrow', w / 2, h * 0.27, h * 0.27, RED, { f: F.pacifico, max: w * 0.84 }); T(g, 'BREAD', w / 2, h * 0.55, h * 0.21, INK, { f: F.abril, ls: h * 0.04 });
  line(g, [[w * 0.2, h * 0.7], [w * 0.8, h * 0.7]], RED, 2); T(g, 'baked before you are up', w / 2, h * 0.82, h * 0.095, INK, { f: F.fraunces, it: 1, w: 600, max: w * 0.84 });
};

// ---- things to eat, built for the hand (feet; y up) --------------------------------------------------------
const mat3 = (T3, c, r = 0.85) => new T3.MeshStandardMaterial({ color: c, roughness: r });
const blob = (T3, g, r, c, s, p, rough) => { const m = new T3.Mesh(new T3.SphereGeometry(r, 12, 8), mat3(T3, c, rough)); m.scale.set(...s); m.position.set(...p); g.add(m); return m; };
const slab = (T3, g, w, hh, d, c, p, rough) => { const m = new T3.Mesh(new T3.BoxGeometry(w, hh, d), mat3(T3, c, rough)); m.position.set(...p); g.add(m); return m; };
const EAT = {
  knot: T3 => { const g = new T3.Group(), m = new T3.Mesh(new T3.TorusKnotGeometry(0.085, 0.045, 40, 7, 2, 3), mat3(T3, 0xb07c48, 0.5)); m.rotation.x = Math.PI / 2; m.scale.set(1, 1, 0.75); m.position.y = 0.08; g.add(m); for (let i = 0; i < 7; i++) blob(T3, g, 0.014, 0xf6f1e6, [1, 1, 1], [Math.cos(i * 2.4) * 0.08, 0.14 + (i % 2) * 0.012, Math.sin(i * 2.4) * 0.08]); return g; },
  bun: T3 => { const g = new T3.Group(); blob(T3, g, 0.16, 0xb98a55, [1, 0.62, 1], [0, 0.09, 0], 0.5); return g; },
  canele: T3 => { const g = new T3.Group(), m = new T3.Mesh(new T3.CylinderGeometry(0.06, 0.085, 0.17, 10), mat3(T3, 0x3e2314, 0.35)); m.position.y = 0.085; g.add(m); return g; },
  cookie: T3 => { const g = new T3.Group(), m = new T3.Mesh(new T3.CylinderGeometry(0.12, 0.125, 0.035, 14), mat3(T3, 0xb98c5c)); m.position.y = 0.02; g.add(m); for (let i = 0; i < 6; i++) blob(T3, g, 0.02, 0x2e1a10, [1, 0.5, 1], [Math.cos(i * 1.9) * 0.07 * (i % 2 ? 1 : 0.5), 0.04, Math.sin(i * 1.9) * 0.07 * (i % 2 ? 1 : 0.5)]); return g; },
  slice: T3 => { const g = new T3.Group(); slab(T3, g, 0.42, 0.06, 0.34, 0xe6d3a8, [0, 0.03, 0]); slab(T3, g, 0.44, 0.058, 0.02, 0x8a5a2a, [0, 0.03, 0.17]); slab(T3, g, 0.44, 0.058, 0.02, 0x8a5a2a, [0, 0.03, -0.17]); slab(T3, g, 0.3, 0.012, 0.24, 0xf3dc8a, [0, 0.066, 0], 0.3); return g; },
};

export default function bakery(kit, lot) {
  const K = tools(kit, 53), X = fixtures(kit, K), { ves, hcyl, ball, tube, jar, plate, bowl, potted } = K, G3 = kit.geom;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0), W = lot.W, D = lot.D;                    // room coordinates: x = a, y = d, z = height
  const eats = (kit.eats ??= []);
  const eat = (f, x, y, z, name, o) => { const [ex, ez] = kit.world(f, x, y); eats.push({ x: ex, y: f.h + z, z: ez, name, reach: 7, ...o }); };

  // ---- turning bread: every loaf is a list of [geometry, material] built about its own bottom centre -------
  const L = (prof, sx = 1, sy = 1, seg = 12) => G3.lathe(prof, { seg, sx, sy });
  const dome = (r, h) => [[0, 0], [r * 0.72, 0], [r * 0.97, h * 0.25], [r, h * 0.45], [r * 0.88, h * 0.72], [r * 0.55, h * 0.93], [0, h]];
  const zt = (u, v, rx, ry, h) => h * (0.45 + 0.55 * Math.sqrt(Math.max(0, 1 - (u / rx) ** 2 - (v / ry) ** 2)));
  const cut = (pts, rx, ry, h, r = 0.016) => G3.sweep(pts.map(([u, v]) => [u, v, zt(u, v, rx, ry, h) - r * 0.3]), r, { seg: 5 });
  const ring = (rad, n = 12) => Array.from({ length: n + 1 }, (_, i) => [Math.cos(i / n * 6.2832) * rad, Math.sin(i / n * 6.2832) * rad]);
  const up = (g, z, x = 0, y = 0) => G3.xf(g, { at: [x, y, z] });
  const dots = (n, fn, r = 0.012, seg = 4) => G3.merge(Array.from({ length: n }, (_, i) => { const [x, y, z, s = 1] = fn(i); return up(L([[0, 0], [r * s, r * 0.5 * s], [0, r * 1.1 * s]], 1, 1, seg), z, x, y); }));
  const LOAF = {
    boule(r = 0.34, col = CR1, score = 'cross', ear = PALE) {
      const h = r * 0.84, k = r * 0.52, out = [[L(dome(r, h), 1, 1, 14), col]];
      const ls = score === 'cross' ? [[[-k, 0], [0, 0], [k, 0]], [[0, -k], [0, 0], [0, k]]] : score === 'square' ? [[[-k, -k], [0, -k], [k, -k]], [[k, -k], [k, 0], [k, k]], [[k, k], [0, k], [-k, k]], [[-k, k], [-k, 0], [-k, -k]]].map(s => s.map(([u, v]) => [u * 0.8, v * 0.8]))
        : score === 'rings' ? [ring(r * 0.3), ring(r * 0.55), ring(r * 0.76, 16)] : [[[-k, -k * 0.5], [-k * 0.3, -k * 0.05], [k * 0.3, k * 0.1], [k, k * 0.5]]];
      for (const s of ls) out.push([cut(s, r, r, h, score === 'rings' ? 0.011 : 0.017), ear]);
      return out;
    },
    batard(len = 0.44, w = 0.21, col = CR1, n = 1) {
      const h = w * 1.1, out = [[L(dome(w, h), len / w, 1, 14), col]];
      if (n === 1) out.push([cut([[-len * 0.62, -0.02], [-len * 0.2, 0.02], [len * 0.2, -0.02], [len * 0.62, 0.02]], len, w, h), PALE]);
      else for (let i = 0; i < n; i++) { const u = (i - (n - 1) / 2) * len * 1.3 / n; out.push([cut([[u - 0.07, -w * 0.45], [u, 0], [u + 0.07, w * 0.45]], len, w, h, 0.014), PALE]); }
      return out;
    },
    tin(col = CR1, top = CR2, seeds = false, len = 0.42) {
      const out = [[G3.softBox(-len, len, -0.19, 0.19, 0, 0.3, 0.04), col], [up(L(dome(0.2, 0.2), len / 0.2 * 1.02, 1.04, 12), 0.2), top]];
      if (seeds) { out.push([dots(22, i => [((i * 37) % 22 / 22 - 0.5) * len * 1.5, ((i * 13) % 7 / 7 - 0.5) * 0.24, 0.2 + zt(((i * 37) % 22 / 22 - 0.5) * len * 1.5, ((i * 13) % 7 / 7 - 0.5) * 0.24, len * 1.02, 0.208, 0.2) - 0.006, 1.2]), 'c#efe2bc/0.8']); out.push([dots(14, i => [((i * 29) % 14 / 14 - 0.5) * len * 1.4, ((i * 11) % 5 / 5 - 0.5) * 0.2, 0.2 + zt(((i * 29) % 14 / 14 - 0.5) * len * 1.4, ((i * 11) % 5 / 5 - 0.5) * 0.2, len * 1.02, 0.208, 0.2) - 0.006, 1.1]), 'c#17140f/0.8']); }
      return out;
    },
    mie() { return [[G3.softBox(-0.44, 0.44, -0.19, 0.19, 0, 0.38, 0.025), 'c#b08a5a/0.8'], [G3.softBox(-0.46, 0.46, -0.14, 0.14, 0.02, 0.36, 0.02), 'c#c9a77a/0.8']]; },
    focaccia() { return [[G3.softBox(-0.62, 0.62, -0.42, 0.42, 0, 0.13, 0.05), 'c#c9952a/0.8'], [dots(18, i => [(i % 6 - 2.5) * 0.19, (Math.floor(i / 6) - 1) * 0.24 + (i % 2) * 0.05, 0.125, 2.6], 0.012, 6), CR2], [G3.merge(Array.from({ length: 14 }, (_, i) => { const x = ((i * 31) % 14 / 14 - 0.5) * 1.05, y = ((i * 17) % 9 / 9 - 0.5) * 0.66, a = i * 1.3; return G3.sweep([[x, y, 0.137], [x + Math.cos(a) * 0.07, y + Math.sin(a) * 0.07, 0.14]], 0.008, { seg: 3 }); })), 'c#4a6e38/0.8'], [dots(16, i => [((i * 23) % 16 / 16 - 0.5) * 1.1, ((i * 7) % 11 / 11 - 0.5) * 0.7, 0.13, 0.6]), WHITE]]; },
    ciabatta() { return [[G3.softBox(-0.5, 0.5, -0.22, 0.22, 0, 0.17, 0.08), PALE], [G3.softBox(-0.4, 0.38, -0.15, 0.13, 0.1, 0.19, 0.05), FLOUR]]; },
    bun(r = 0.15, col = BUN) { return [[L(dome(r, r * 0.9), 1, 1, 10), col]]; },
    knot() { return [[G3.sweep(Array.from({ length: 13 }, (_, i) => { const a = i / 12 * 12.566, rr = 0.1 - 0.05 * i / 12; return [Math.cos(a) * rr, Math.sin(a) * rr, 0.05 + 0.075 * i / 12]; }), 0.047, { seg: 6, caps: true }), 'c#a8784a/0.45'], [dots(6, i => [Math.cos(i * 2.2) * 0.07, Math.sin(i * 2.2) * 0.07, 0.135 + (i % 2) * 0.02, 1.1]), WHITE]]; },
    canele() { return [[L([[0, 0], [0.07, 0], [0.085, 0.02], [0.075, 0.15], [0.06, 0.17], [0.03, 0.165], [0, 0.15]], 1, 1, 9), 'c#3a2214/0.45']]; },
    cookie() { return [[L([[0, 0], [0.105, 0], [0.115, 0.015], [0.1, 0.032], [0, 0.036]], 1, 1, 10), PALE], [dots(5, i => [Math.cos(i * 1.9) * 0.06, Math.sin(i * 1.9) * 0.06, 0.03, 1.6]), 'c#3a2214/0.8']]; },
  };
  // set a loaf down at (x, y, z) in a frame: turned by rz, then tipped by rx (for the slanted racks)
  const set = (f, list, x, y, z, rz = 0, rx = 0) => { for (const [g, m] of list) { if (rz) G3.xf(g, { rz }); if (rx) G3.xf(g, { rx }); K.put(f, g, m, x, y, z); } };
  const wood = (f, mat, g, t) => kit.put(f, snapMat(mat), g, t);
  const baguette = (f, x, y, z, dx, dy, len = 2.1, col = CR1) => tube(f, col, [[x, y, z], [x + dx * 0.25, y + dy * 0.25, z + len * 0.25], [x + dx * 0.5, y + dy * 0.5, z + len * 0.5], [x + dx * 0.75, y + dy * 0.75, z + len * 0.75], [x + dx, y + dy, z + len]], t => 0.04 + 0.062 * Math.sin(Math.PI * t) ** 0.5, 7, true);
  const basket = (f, x, y, z, r, h, sx = 1) => K.put(f, L([[0, 0], [r * 0.78, 0], [r, h], [r * 0.95, h], [r * 0.74, 0.05], [0, 0.05]], sx, 1, 16), 'wicker', x, y, z);

  // ---- the room: a partition two fifths of the way back, a dado and a rail in the shop, tile in the bakehouse ----
  const A = arch(kit, lot, K), PD = 19.8, HA0 = 1.3, HA1 = 8.2, HZ = 3.5, DA0 = 10.6, DA1 = 14.6;
  const P = A.partition(PD, { openings: [{ a0: HA0, a1: HA1, z0: HZ, z1: 7.8 }, { a0: DA0, a1: DA1, z0: 0, z1: 8.2 }] });
  const BW0 = D * 0.246 - 4.78, BW1 = D * 0.246 + 4.78, RZ = 9.12;   // the bread wall's ends on the left wall; its cornice height
  const WS = { mat: BLUSH, cap: A.TRIM };                      // the boarding is the counter's pink, capped in the trim's cream
  A.wainscot('right', 0.03, P.front - 0.02, WS); A.wainscot('left', 0.03, BW0 - 0.02, WS); A.wainscot('left', BW1 + 0.02, P.front - 0.02, WS);
  A.wainscot({ d: P.front, side: 'front' }, 0.22, DA0 - 0.44, WS); A.wainscot({ d: P.front, side: 'front' }, DA1 + 0.44, W - 0.22, WS);
  A.rail('right', 0.03, P.front - 0.02, { z: RZ, tall: 0.12 }); A.rail('left', 0.03, BW0 - 0.1, { z: RZ, tall: 0.12 }); A.rail('left', BW1 + 0.1, P.front - 0.02, { z: RZ, tall: 0.12 }); A.rail({ d: P.front, side: 'front' }, 0.08, W - 0.08, { z: RZ, tall: 0.12 });
  const OA = 12, BR = 2.9, DRA = 0.24 * (W + 1) - 0.5;                        // the oven's centre and the breast's depth; the yard door's centre (backs.js)
  { const TZ = 4.7, tile = (wall, s0, s1) => { A.on(wall, TILEW, s0, s1, 0.004, 0.085, 0.004, TZ); A.on(wall, 'c#3a3632/0.5', s0, s1, 0.004, 0.11, TZ, TZ + 0.07); };
    tile('left', P.back + 0.02, D - 0.02); tile('right', P.back + 0.02, D - BR - 0.02); tile('back', 0.1, DRA - 1.93); tile('back', DRA + 1.93, OA - 4.22); }

  // ---- the counter: down the left side of the front third, the queue on the door side ------------------------
  const CA = W * 0.44, CD = D * 0.246;                         // its customer face is at a = CA; its middle at d = CD
  const c = at(CA, CD, 0, 'right');                            // +x toward the street; +y the customers' side
  const TOP = X.counter(c, -5.5, 5.5, -2.4, 0, 3.4, { front: BLUSH, top: 'marble' });
  // the one case: six things to take and eat
  X.glassCase(c, 0.2, 5.3, -1.75, -0.25, TOP, 1.3);
  { const z = TOP + 0.03, xs = [4.85, 4.0, 3.15, 2.3, 1.45, 0.6];
    for (const x of xs) c.box('c#c9ccd0/0.45/1', x - 0.35, x + 0.35, -1.6, -0.5, z, z + 0.012);
    for (const [y, t] of [[-1.3, 0.3], [-0.98, 2.0], [-0.66, 4.1]]) kit.model('croissant', c, xs[0], y, z + 0.02, 0, { turn: t });
    for (let i = 0; i < 6; i++) set(c, LOAF.knot(), xs[1] - 0.17 + (i % 2) * 0.34, -1.38 + Math.floor(i / 2) * 0.36, z + 0.012, i * 1.1);
    for (let i = 0; i < 9; i++) set(c, LOAF.canele(), xs[2] - 0.22 + (i % 3) * 0.22, -1.36 + Math.floor(i / 3) * 0.3, z + 0.012);
    for (const [dx, y] of [[0.1, -1.25], [-0.13, -0.98], [0.1, -0.72]]) kit.model('st_jam_tart', c, xs[3] + dx, y, z + 0.014);
    for (let i = 0; i < 5; i++) set(c, LOAF.bun(0.14), xs[4] - 0.15 + (i % 2) * 0.3, -1.36 + Math.floor(i / 2) * 0.31, z + 0.012);
    for (let i = 0; i < 12; i++) set(c, LOAF.cookie(), xs[5] - 0.15 + (i % 2) * 0.3, -1.3 + Math.floor(i / 2 % 2) * 0.42, z + 0.012 + Math.floor(i / 4) * 0.037, i);
    [['croissant', '4'], ['cardamom knot', '4½'], ['canelé', '3'], ['jam tart', '3½'], ['milk bun', '2'], ['rye & salt cookie', '3']].forEach(([n, p], i) => X.card(c, xs[i], -0.37, z, 0.66, 0.3, TICKET(n, p), { cw: 150, ch: 68 }));
    eat(c, xs[0], -0.98, z + 0.1, 'croissant', { model: 'croissant', note: 'You finish the croissant. Eighty-one layers; you counted about six.' });
    eat(c, xs[1], -1.02, z + 0.1, 'cardamom knot', { build: EAT.knot, note: 'You finish the cardamom knot.' });
    eat(c, xs[2], -1.06, z + 0.1, 'canelé', { build: EAT.canele, bites: 2, note: 'You finish the canelé. Burnt sugar outside, custard inside, rum somewhere.' });
    eat(c, xs[3], -0.98, z + 0.1, 'jam tart', { model: 'st_jam_tart', note: 'You finish the jam tart. The jam was plum, from the Yard tree.' });
    eat(c, xs[4], -1.05, z + 0.12, 'milk bun', { build: EAT.bun, note: 'You finish the milk bun. Soft as a pillow.' });
    eat(c, xs[5], -1.1, z + 0.12, 'rye & salt cookie', { build: EAT.cookie, bites: 2, note: 'You finish the cookie. Rye, dark chocolate, a flake of salt.' });
  }
  // the till (pink enamel), and the baguettes at the bakehouse end
  { const x = -1.5, y = -1.3, z = TOP;
    X.till(c, x, y, z, { body: 'c#e8907a/0.45', ledge: 'c#f4f1ea/0.2', accent: 'c#8a1c1c/0.45' });
    basket(c, -4.5, -1.2, z, 0.5, 1.0); for (let i = 0; i < 9; i++) { const a = i * 0.7; baguette(c, -4.5 + Math.cos(a) * 0.14, -1.2 + Math.sin(a) * 0.14, z + 0.08, Math.cos(a) * 0.34, Math.sin(a) * 0.34, 2.0 + (i % 3) * 0.12, i % 3 ? CR1 : CR2); }
    X.card(c, -4.5, -0.42, z, 1.5, 0.42, BREADTAG('BAGUETTE', 'poolish overnight · 68% water · baked dark, as intended', '3'), { cw: 360, ch: 100 });
    lot.pickup = { xz: kit.world(c, -2.9, -0.6), y: c.h + TOP };
  }
  for (const x of [-2.6, 2.6]) X.pendant(c, x, -0.9, { kind: 'dome', drop: 4.6, colour: 'c#e8907a/0.45', power: 1.0 });

  // ---- the bread wall: on the left wall behind the counter, three slanted racks, every bread labelled ---------
  const b = at(0, CD, 0, 'right');
  const TH = -0.56, CS = Math.cos(TH), SN = Math.sin(TH), SHZ = [7.75, 6.4, 5.05], NC = 3, X0 = -4.7, X1 = 4.7;
  b.box(PALEW, X0, X1, 0.02, 0.06, 0, 9.0, G); for (let i = 0; i <= NC; i++) { const x = X0 + (X1 - X0) * i / NC; b.box(OAK, x - 0.05, x + 0.05, 0.04, 1.3, 0, 9.0, G); }
  b.box(OAK, X0 - 0.08, X1 + 0.08, 0.02, 1.36, 9.0, 9.12, G); b.box(CREAM, X0 + 0.05, X1 - 0.05, 0.06, 1.24, 0, 3.3, G); b.box(OAK, X0, X1, 0.06, 1.34, 3.3, 3.4, G); b.block(X0, X1, 0, 1.3, 0, 7);
  for (let i = 0; i < NC; i++) { const x = X0 + (i + 0.5) * (X1 - X0) / NC; for (const s of [-1, 1]) { b.box(CREAM, x + s * 0.74 - 0.66, x + s * 0.74 + 0.66, 1.24, 1.275, 0.4, 3.1, G); b.cyl(BRASS, x + s * 0.2, 1.3, 1.8, 1.86, 0.04, 0.04, 8); } }
  for (const zb of SHZ) { wood(b, OAK, G3.bev(X0 + 0.06, X1 - 0.06, 0, 1.15, -0.07, 0, 0.01), { rx: TH, at: [0, 0.1, zb] }); wood(b, OAK, G3.bev(X0 + 0.06, X1 - 0.06, 1.15, 1.19, -0.07, 0.13, 0.01), { rx: TH, at: [0, 0.1, zb] }); }
  kit.sign(b, 0, 0.03, 9.95, 9.0, 1.25, (g, w, h) => { board(g, w, h, '#fbf4e6', RED, { inset: h * 0.09 }); T(g, 'the bread wall', w / 2, h * 0.42, h * 0.5, RED, { f: F.pacifico }); T(g, 'FLOUR · WATER · SALT · TIME · AND DORIS', w / 2, h * 0.82, h * 0.14, INK, { f: F.bebas, ls: 4 }); for (const k of [-1, 1]) ICON.loaf(g, w / 2 + k * w * 0.36, h * 0.45, h * 0.5, '#b5806e', '#fbf4e6'); }, { cw: 900, ch: 125 });
  // each: name, note, price, how many, spacing, a maker, and how each one is turned on the shelf
  const BREADS = [
    ['MICHE', '2 kg wheel · high-extraction flour · sold by the quarter · best on day 3', '6 / qtr', 2, 1.25, () => LOAF.boule(0.54, CR3, 'rings', FLOUR), 0],
    ['COUNTRY LOAF', '78% water · 20% wholewheat · levain fed 4 h before the mix', '9', 3, 0.86, () => LOAF.boule(0.36, CR2, 'cross'), 0.5],
    ['WALNUT LEVAIN', 'toasted walnuts, 20% · the crumb goes purple: that is the walnuts', '10', 3, 0.84, () => LOAF.boule(0.33, CR3, 'square'), 0.4],
    ['OLIVE & LEMON', 'green and black olives, zest, thyme · 76% · do not toast, tear', '10', 3, 0.84, () => LOAF.batard(0.4, 0.22, CR2, 3), 1.5708],
    ['DARK RYE', '100% rye · seeds soaked overnight · wait a day before you slice it', '9', 3, 0.9, () => LOAF.tin(RYE, RYE, true, 0.36), 1.5708],
    ['SEEDED TIN', 'sunflower, flax, sesame, oats · scalded · toasts like a dream', '8', 3, 0.9, () => LOAF.tin(CR1, CR2, true, 0.4), 1.5708],
    ['CIABATTA', 'biga 16 hours · 82% water · no, we cannot slice it', '5', 3, 0.86, () => LOAF.ciabatta(), 1.5708],
    ['FOCACCIA', '80% · olive oil, rosemary, flaky salt · dimpled by hand', '5 / slab', 2, 1.4, () => LOAF.focaccia(), 0],
    ['PAIN DE MIE', 'milk, butter, a lidded tin · square, for sandwiches & soldiers', '7', 3, 0.9, () => LOAF.mie(), 1.5708],
  ];
  BREADS.forEach(([name, note, price, n, sp, make, rz], k) => {
    const zb = SHZ[Math.floor(k / NC)], xc = X1 - (k % NC + 0.5) * (X1 - X0) / NC;
    for (let i = 0; i < n; i++) set(b, make(), xc + (i - (n - 1) / 2) * sp, 0.1 + 0.58 * CS, zb + 0.58 * SN, rz + (i % 3 - 1) * 0.18, TH);
    kit.sign(b, xc, 0.1 + 1.2 * CS + 0.04, zb + 1.2 * SN, 2.7, 0.42, BREADTAG(name, note, price), { cw: 446, ch: 76, rough: 0.9 });
  });

  // ---- the oven, at the far end: three decks, the middle door down ---------------------------------------------
  const o = at(OA, D, 0, 'street');
  { const F0 = 2.3, F1 = 3.0;
    for (const [x, y] of [[-3.4, 0.25], [3.4, 0.25], [-3.4, 2.75], [3.4, 2.75]]) o.box(STEEL, x - 0.1, x + 0.1, y - 0.1, y + 0.1, 0, 1.5);
    o.box(STEEL, -3.5, 3.5, 0.15, 2.85, 0.5, 0.56); o.box(ENAMEL, -3.3, 3.3, 0.02, 2.6, 0.56, 1.5);     // it stands on a closed base
    o.box(ENAMEL, -3.6, 3.6, 0.02, F0, 1.5, 7.1); o.box(ENAMEL, -3.6, 3.6, F0, F1, 1.5, 3.58); o.box(ENAMEL, -3.6, 3.6, F0, F1, 4.9, 7.1); o.box(ENAMEL, 2.9, 3.6, F0, F1, 3.58, 4.9); o.box(ENAMEL, -3.6, -2.5, F0, F1, 3.58, 4.9);
    o.box('c#17140f/0.8', -2.5, 2.9, F0 + 0.02, F0 + 0.04, 3.6, 4.9);
    kit.sign(o, 0.2, F0 + 0.05, 4.25, 5.4, 1.3, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, '#fff0b0'); gr.addColorStop(0.16, '#ffb040'); gr.addColorStop(0.5, '#e8601c'); gr.addColorStop(1, '#5a1608'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) { const x = (i * 97 % 260) / 260 * w, r2 = h * (0.12 + (i * 31 % 10) / 40), rg = g.createRadialGradient(x, h, 0, x, h, r2 * 2.2); rg.addColorStop(0, 'rgba(255,236,170,.55)'); rg.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = rg; g.fillRect(x - r2 * 2.2, h - r2 * 2.2, r2 * 4.4, r2 * 2.2); }
      for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(40,10,4,.28)'; g.fillRect(i * w / 8 - 2, 0, 4, h * 0.55); } const ed = g.createLinearGradient(0, 0, w, 0); ed.addColorStop(0, 'rgba(20,6,2,.75)'); ed.addColorStop(0.08, 'rgba(20,6,2,0)'); ed.addColorStop(0.92, 'rgba(20,6,2,0)'); ed.addColorStop(1, 'rgba(20,6,2,.75)'); g.fillStyle = ed; g.fillRect(0, 0, w, h); }, { cw: 432, ch: 104, glow: 1.5 });                                          // the mouth
    o.box('c#9a9590/0.8', -2.5, 2.9, F0 + 0.05, F1 + 0.02, 3.58, 3.68);                               // the hearth stone
    for (let i = 0; i < 5; i++) set(o, [[L(dome(0.33, 0.3), 1, 1, 12), 'c#6a4a2a/0.8']], -1.9 + i * 1.0, 2.7, 3.68);
    o.box(STEEL, -2.5, 2.9, F1, F1 + 1.0, 3.5, 3.57); hcyl(o, STEEL, 'x', 0.2, F1 + 0.95, 3.42, 4.8, 0.035);    // the door, let down
    for (const [z0, z1] of [[1.8, 3.25], [5.25, 6.75]]) { const zm = (z0 + z1) / 2;      // each door framed round its sight glass, the glass set in
      o.box(STEEL, -2.5, -2.1, F1, F1 + 0.06, z0, z1); o.box(STEEL, 2.5, 2.9, F1, F1 + 0.06, z0, z1); o.box(STEEL, -2.1, 2.5, F1, F1 + 0.06, z0, zm - 0.2); o.box(STEEL, -2.1, 2.5, F1, F1 + 0.06, zm + 0.2, z1);
      o.box('c#17140f/0.45', -2.1, 2.5, F1 + 0.005, F1 + 0.04, zm - 0.2, zm + 0.2); o.box(GLOW, -2.0, 2.4, F1 + 0.04, F1 + 0.054, zm - 0.1, zm + 0.1); hcyl(o, STEEL, 'x', 0.2, F1 + 0.22, z1 - 0.22, 4.8, 0.035); for (const x of [-2.1, 2.5]) o.box(STEEL, x - 0.03, x + 0.03, F1 + 0.06, F1 + 0.22, z1 - 0.25, z1 - 0.19); }
    for (const z of [3.42, 5.08, 6.92]) o.box(STEEL, -3.62, 3.62, F1, F1 + 0.02, z - 0.04, z + 0.04);
    kit.sign(o, -3.05, F1 + 0.012, 4.25, 0.86, 1.2, (g, w, h) => { fill(g, w, h, '#d8d9d6'); for (const [y, t, v] of [[0.2, 'TOP', '250°'], [0.5, 'SOLE', '240°'], [0.8, 'STEAM', '8 s']]) { disc(g, w * 0.3, h * y, w * 0.2, '#1d1b18', '#8a8a86', 2); line(g, [[w * 0.3, h * y], [w * 0.3 + w * 0.14, h * y - w * 0.1]], '#f6efdc', 3); T(g, t, w * 0.74, h * (y - 0.045), h * 0.05, '#1d1b18', { f: F.bebas, ls: 1 }); T(g, v, w * 0.74, h * (y + 0.035), h * 0.075, '#b3261e', { f: F.elite }); } }, { cw: 110, ch: 154 });
    o.box(STEEL, -3.6, 3.6, 0.03, 3.7, 7.1, 7.22);                                                    // a short steel canopy over the doors
    // the chimney breast it is set into: a brick pier each side, brick above to the ceiling, an iron bar over the canopy
    o.box(BRICK, 3.62, 4.2, 0.004, BR, 0.004, 11.98); o.box(BRICK, -3.98, -3.62, 0.004, BR, -0.03, 11.98);      // (the right one stops short of the side wall and its skirting) o.box(BRICK, -3.62, 3.62, 0.004, BR, 7.24, 11.98);
    o.box(IRON, -3.9, 4.0, BR, BR + 0.05, 7.3, 7.62);
    o.block(-4.0, 4.2, 0, 4.0, 0, 7); kit.lampAt(o, 0.2, 4.3, 4.3, 0.75); kit.lamps[kit.lamps.length - 1].halo = 0.5;
    { const [sx, sz] = kit.world(o, 0.2, 3.3); kit.steam.push({ x: sx, y: o.h + 4.7, z: sz }); }
    // the peel, leaning in the corner beside it, and a clock that somebody actually looks at
    tube(o, PALEW, [[5.42, 1.0, 0.03], [5.42, 0.35, 5.2]], 0.045, 6, true); wood(o, PALEW, G3.bev(-0.5, 0.5, -0.025, 0.025, -0.1, 1.35, 0.02), { rx: 0.125, at: [5.42, 0.35, 5.2] });
    kit.model('wall_clock', o, 5.42, 0.08, 8.3, 0, { hang: true });
  }

  // ---- the right wall: the slate by the queue, then the bench, then the mixer ----------------------------------
  const r = at(W, 0, 0, 'left');                               // x = d (toward the back); +y out from the right wall
  X.slateBoard(r, CD, 6.45, 4.3, 4.7, TODAY, { cw: 560, ch: 610 });
  { // the settle under it: one long seat against the boarding, somewhere to eat the thing you just bought
    const x0 = CD - 3.6, x1 = CD + 3.6;
    r.box(BLUSH, x0 + 0.1, x1 - 0.1, 0.24, 1.5, 0.3, 1.38, G); r.box('c#2c2520/0.6', x0 + 0.16, x1 - 0.16, 0.3, 1.42, 0.004, 0.3);
    r.box(OAK, x0, x1, 0.22, 1.66, 1.38, 1.5, G); for (const x of [x0, x1]) r.box(OAK, x - 0.07, x + 0.07, 0.22, 1.66, 0.004, 2.35, G);
    kit.seatPads(r, 'linen#e2c9bb', x0 + 0.12, x1 - 0.12, 0.3, 1.62, 1.5, 1.63);      // loose crowned cushions (it was one rounded slab)
    for (const x of [CD - 2.3, CD, CD + 2.3]) kit.seat(r, x, 1.0, 1.66, 'sit');
    r.block(x0 - 0.07, x1 + 0.07, 0, 1.66, 0, 1.7);
  }
  { // the bench: a baker's bench down the middle of the bakehouse; Doris alone at the near end, the work further along.
    // A thick beech top with an eased edge, three inches over an oak frame (square legs, aprons, low stretchers), a
    // slatted shelf below with the flour tubs on it, and at the oven end a rail under the overhang with a cloth over it.
    const r = at(8.1, 0, 0, 'left');                            // (shadowing r: x = d as before; +y toward the left wall)
    const x0 = 23.6, x1 = x0 + 8.4, z = 3.0, u = v => x0 + v;
    { const bd = (m, a0, a1, b0, b1, c0, c1, e = 0.012, o) => wood(r, m, G3.bev(a0, a1, b0, b1, c0, c1, e, o));
      bd(BEECH, x0, x1, -0.2, 2.7, z - 0.25, z, 0.045, { grain: 'x' });                                              // the top
      for (const a of [x0 + 0.25, x1 - 0.55]) for (const b of [0, 2.2]) bd(OAK, a, a + 0.3, b, b + 0.3, 0, z - 0.24, 0.02, { grain: 'z' });     // legs
      for (const [b0, b1] of [[0.03, 0.11], [2.39, 2.47]]) bd(OAK, x0 + 0.54, x1 - 0.54, b0, b1, z - 0.66, z - 0.24, 0.012, { grain: 'x' });   // aprons, set in from the legs' faces
      for (const a of [x0 + 0.28, x1 - 0.36]) bd(OAK, a, a + 0.08, 0.29, 2.21, z - 0.66, z - 0.24, 0.012, { grain: 'y' });
      for (const [b0, b1] of [[0.06, 0.24], [2.26, 2.44]]) bd(OAK, x0 + 0.54, x1 - 0.54, b0, b1, 0.58, 0.8, 0.012, { grain: 'x' });           // stretchers
      for (const a of [x0 + 0.31, x1 - 0.49]) bd(OAK, a, a + 0.18, 0.29, 2.21, 0.58, 0.8, 0.012, { grain: 'y' });
      for (let i = 0; i < 17; i++) { const a = x0 + 0.6 + i * 0.43125; bd(OAK, a, a + 0.3, 0.1, 2.4, 0.79, 0.86, 0.012, { grain: 'y' }); }   // the slats, on the long stretchers
      const xr = x1 - 0.12, zr = 2.42;                                                                                // the cloth rail
      for (const b of [0.15, 2.35]) bd(OAK, x1 - 0.26, xr + 0.05, b - 0.045, b + 0.045, zr - 0.07, zr + 0.07, 0.012);
      hcyl(r, OAK, 'y', xr, 1.25, zr, 2.2, 0.035);
      r.soft(LINEN, xr - 0.065, xr + 0.065, 0.45, 1.55, zr - 0.02, zr + 0.06, 0.03); r.box(LINEN, xr - 0.06, xr - 0.045, 0.46, 1.54, zr - 0.95, zr - 0.005); r.box(LINEN, xr + 0.045, xr + 0.06, 0.46, 1.54, zr - 0.7, zr - 0.005);
    }
    r.block(x0, x1, -0.2, 2.7, 0, z);
    for (const [v, col] of [[2.9, WHITE], [4.5, WHITE], [6.1, 'c#c9a77a/0.8']]) { ves(r, 'c#f4f1ea/0.45', u(v), 1.25, 0.86, [[0, 0], [0.5, 0], [0.6, 1.2], [0.56, 1.2], [0.47, 0.05], [0, 0.05]], 16); ves(r, col, u(v), 1.25, 0.9, [[0, 0], [0.56, 0.9], [0.3, 1.0], [0, 1.04]], 12); }
    // flour on the wood (each drift a different depth, so none shares a plane), dough resting on a folded couche, one out and being shaped
    for (const [v, y, rr, t] of [[4.4, 1.3, 0.85, 0.02], [5.3, 1.5, 0.6, 0.035], [3.6, 1.0, 0.55, 0.035]]) ves(r, WHITE, u(v), y, z, [[0, 0], [rr, 0], [rr * 0.9, t], [0, t]], 14);
    for (let i = 0; i < 3; i++) K.put(r, L(dome(0.4, 0.34), 1, 1, 12), LINEN, u(3.4 + i * 0.86), 0.75, z + 0.06);
    r.box(LINEN, u(2.9), u(5.7), 0.3, 1.2, z + 0.015, z + 0.06);
    K.put(r, L(dome(0.36, 0.26), 1, 1, 12), DOUGH, u(4.6), 1.75, z + 0.02); r.box(STEEL, u(5.3), u(5.7), 1.6, 1.62, z, z + 0.3); r.soft(PALEW, u(5.3), u(5.7), 1.57, 1.65, z + 0.3, z + 0.38, 0.03);
    // bannetons: a stack, and one waiting; the scales
    for (let i = 0; i < 6; i++) basket(r, u(7.7), 0.75, z + i * 0.11, 0.36, 0.3); basket(r, u(7.6), 1.75, z, 0.36, 0.3); ves(r, WHITE, u(7.6), 1.75, z + 0.06, [[0, 0], [0.28, 0.02], [0.33, 0.22], [0.31, 0.22], [0.26, 0.04], [0, 0.03]], 14);
    r.soft(STEEL, u(6.2), u(6.9), 1.4, 1.95, z, z + 0.14, 0.03); r.cyl(STEEL, u(6.55), 1.67, z + 0.14, z + 0.2, 0.3, 0.3, 16);
    // Doris, and her feeding log on the wall above her
    { const dx = u(0.9), dy = 1.5, jz = z - 0.02;                // (her jar stands a hair into the top, not on its plane)
      jar(r, dx, dy, jz, 0.26, 0.66, null, 0, null); ves(r, 'c#efe2bc/0.8', dx, dy, jz + 0.035, [[0, 0], [0.248, 0], [0.248, 0.367], [0, 0.367]], 12);      // (her levain drawn here, its floor clear of the jar's)
      r.cyl(LINEN, dx, dy, jz + 0.64, jz + 0.7, 0.29, 0.27, 14); r.cyl('c#8a1c1c/0.8', dx, dy, jz + 0.6, jz + 0.63, 0.275, 0.275, 14); r.cyl('c#2a63b8/0.8', dx, dy, jz + 0.25, jz + 0.265, 0.265, 0.265, 14);
      kit.sign(at(8.1 - dy, dx, 0, 'street'), 0, 0.268, jz + 0.43, 0.36, 0.2, (g, w, h) => { paper(g, w, h, '#fbf7ea'); T(g, 'DORIS', w / 2, h * 0.36, h * 0.46, RED, { f: F.abril }); T(g, 'do not tap the jar', w / 2, h * 0.78, h * 0.28, INK, { f: F.caveat, w: 700, max: w * 0.92 }); }, { cw: 130, ch: 72 });
      const w = at((HA1 + DA0) / 2, P.back, 0, 'back');          // the pier of the partition between the hatch and the doorway
      w.box('c#6a4a2a/0.8', -0.68, 0.68, 0.02, 0.05, 4.45, 6.35); w.box(STEEL, -0.15, 0.15, 0.05, 0.09, 6.2, 6.33); kit.sign(w, 0, 0.06, 5.36, 1.26, 1.72, FEEDLOG, { cw: 360, ch: 490 }); }
    for (const v of [2.0, 6.8]) X.pendant(r, u(v), 1.25, { kind: 'dome', drop: 4.9, colour: 'c#e8e2d4/0.45', power: 0.95 });
  }
  { // the spiral mixer, between the bench and the oven
    const x = 22.7; r.soft('c#e8e2d4/0.45', x - 0.68, x + 0.68, 0.1, 2.0, 0, 0.5, 0.06); r.soft('c#e8e2d4/0.45', x - 0.5, x + 0.5, 0.1, 0.75, 0.5, 3.7, 0.08); r.soft('c#e8e2d4/0.45', x - 0.45, x + 0.45, 0.1, 1.7, 3.0, 3.7, 0.1);
    ves(r, STEEL, x, 1.3, 0.5, [[0, 0], [0.5, 0], [0.62, 0.12], [0.64, 1.0], [0.6, 1.0], [0.58, 0.16], [0, 0.1]], 22); ves(r, DOUGH, x, 1.3, 0.62, [[0, 0], [0.57, 0], [0.5, 0.4], [0.25, 0.52], [0, 0.5]], 14);
    tube(r, STEEL, [[x, 1.3, 3.0], [x, 1.3, 2.0], [x + 0.2, 1.35, 1.6], [x - 0.1, 1.2, 1.25], [x + 0.15, 1.3, 1.0]], 0.045, 6, true); r.cyl(STEEL, x, 1.3, 1.52, 1.56, 0.68, 0.68, 22);
    r.cyl('c#8a1c1c/0.45', x + 0.2, 0.78, 2.4, 2.52, 0.07, 0.07, 10); r.cyl('c#5d8a3a/0.45', x - 0.2, 0.78, 2.4, 2.52, 0.07, 0.07, 10);
    r.block(x - 0.7, x + 0.7, 0, 2.0, 0, 3.7);
  }

  // two long peels hung flat on the wall above the tile, head to tail
  for (const [z, x0, sg] of [[6.5, 24.4, 1], [7.5, 31.0, -1]]) { tube(r, PALEW, [[x0, 0.13, z], [x0 + sg * 5.2, 0.13, z]], 0.045, 6, true); r.soft(PALEW, Math.min(x0 + sg * 5.2, x0 + sg * 6.5), Math.max(x0 + sg * 5.2, x0 + sg * 6.5), 0.1, 0.16, z - 0.5, z + 0.5, 0.02);
    for (const k of [0.6, 4.4]) tube(r, IRON, [[x0 + sg * k, 0.004, z - 0.1], [x0 + sg * k, 0.2, z - 0.1], [x0 + sg * k, 0.24, z - 0.02]], 0.022, 5, true); }

  // ---- further down the right wall: sacks from the mill, the rack trolley by the oven ---------------------------
  { const s = at(W, 26.8, 0, 'left');
    [[-1.1, 1.2, 0, 'STRONG WHITE', 'T65 · protein 12.5%'], [-0.95, 1.35, 0.52, 'HIGH EXTRACTION', 'T85 · ash 0.85%'], [-1.15, 1.1, 1.04, 'WHOLE RYE', 'T170 · coarse']].forEach(([a, b2, z, kind, sub]) => { s.soft(SACK, a, b2, 0.1, 1.6, z, z + 0.52, 0.14); kit.sign(s, (a + b2) / 2, 1.61, z + 0.26, 1.7, 0.36, SACKLABEL(kind, sub), { cw: 330, ch: 70, rough: 0.95 }); });
    s.block(-1.15, 1.35, 0, 1.6, 0, 1.6);
  }
  { const t = at(W, 32.6, 0, 'left'), x0 = -0.85, x1 = 0.85, y0 = 0.2, y1 = 2.3;
    for (const x of [x0, x1]) for (const y of [y0, y1]) { t.box(STEEL, x - 0.04, x + 0.04, y - 0.04, y + 0.04, 0.25, 6.0); t.cyl(IRON, x, y, 0, 0.25, 0.12, 0.12, 8); }
    for (const z of [0.25, 6.0]) { t.box(STEEL, x0, x1, y0 - 0.04, y0 + 0.04, z, z + 0.07); t.box(STEEL, x0, x1, y1 - 0.04, y1 + 0.04, z, z + 0.07); t.box(STEEL, x0 - 0.04, x0 + 0.04, y0, y1, z, z + 0.07); t.box(STEEL, x1 - 0.04, x1 + 0.04, y0, y1, z, z + 0.07); }
    for (let k = 0; k < 9; k++) { const z = 0.75 + k * 0.58; t.box('c#9a9590/0.45/1', x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.05, z, z + 0.03);
      if (k % 4 === 3) continue;
      for (let i = 0; i < 6; i++) { const x = x0 + 0.42 + (i % 2) * 0.86, y = y0 + 0.4 + Math.floor(i / 2) * 0.64; set(t, k % 3 === 0 ? LOAF.bun(0.2) : k % 3 === 1 ? LOAF.boule(0.26, CR1, 'slash') : LOAF.batard(0.3, 0.17, CR2, 1), x, y, z + 0.03, i * 0.7); } }
    t.block(x0, x1, 0, y1, 0, 6);
  }

  // ---- the hatch: this morning's country loaves cooling on the sill, and the board the slices are cut on ----------
  { const z = HZ + 0.02;
    for (let i = 0; i < 4; i++) set(R, LOAF.boule(0.33, i % 2 ? CR2 : CR1, 'cross'), 4.5 + i * 0.95, PD, z, i * 0.9);
    R.soft(PALEW, 1.9, 3.3, PD - 0.3, PD + 0.3, z, z + 0.07, 0.02); set(R, LOAF.batard(0.36, 0.2, CR2, 1), 2.45, PD, z + 0.07, 0.2);
  }

  // ---- the left wall of the bakehouse: open shelves on the tile, then the proving cupboard ----------------------
  { const l = at(0.095, 26, 0, 'right'), [z1, z2, z3, z4] = X.shelving(l, -5, 5, [1.7, 3.5, 5.1, 6.7], { d: 1.25, mat: PALEW, back: false, bay: 3.34 });
    for (const x of [-3.33, 0, 3.33]) { l.soft('c#e8e2d4/0.45', x - 1.3, x + 1.3, 0.14, 1.12, 0.03, 1.2, 0.07); l.soft('c#d9d2c2/0.45', x - 1.34, x + 1.34, 0.1, 1.16, 1.2, 1.3, 0.04); }   // flour bins
    for (const [x, n] of [[3.6, 3], [2.3, 2]]) for (let i = 0; i < n; i++) K.bowl(l, x, 0.66, z1 + i * 0.13, 0.56 - i * 0.02, 0.5, STEEL, 20);                                    // mixing bowls
    for (let i = 0; i < 5; i++) l.box(i % 2 ? 'c#4a4640/0.5/1' : 'c#3a3632/0.5/1', -3.9 + (i % 2) * 0.03, -2.9 + (i % 2) * 0.03, 0.2, 1.05, z1 + i * 0.2 + 0.004, z1 + i * 0.2 + 0.19);  // loaf tins
    [['c#c9b98a/0.8', 0.8], ['c#7a5a3a/0.8', 0.6], ['c#e6dcc0/0.8', 0.75], ['c#3a3028/0.8', 0.5]].forEach(([c2, lv], i) => { jar(l, 0.95 - i * 0.66, 0.62, z2 - 0.02, 0.27, 0.8, c2, lv, null); l.cyl('c#c9ccd0/0.3/1', 0.95 - i * 0.66, 0.62, z2 + 0.76, z2 + 0.83, 0.243, 0.243, 14); });       // sunflower, flax, sesame, poppy
    for (let i = 0; i < 5; i++) basket(l, -3.5, 0.66, z2 + i * 0.11, 0.4, 0.32);
    for (let i = 0; i < 4; i++) l.soft(i % 2 ? LINEN : 'linen#d9c9a8', 2.5, 4.3, 0.2, 1.1, z3 + i * 0.13 + 0.004, z3 + i * 0.13 + 0.125, 0.04);                                   // couches, folded
    for (const [x, hh] of [[-0.9, 0.85], [-0.2, 0.7], [0.45, 0.55]]) { l.cyl('c#efe6d4/0.4', x, 0.66, z3, z3 + hh, 0.27, 0.27, 16); l.cyl('c#d8b7a6/0.4', x, 0.66, z3 + hh, z3 + hh + 0.05, 0.285, 0.285, 16); }
    for (const x of [-3.3, 3.3]) basket(l, x, 0.66, z4, 0.52, 0.62, 1.25);
  }
  { // the prover: a tall cream cupboard with glazed doors, trays of rounds rising inside it
    const l = at(0, 33.9, 0, 'right'), x0 = -1.5, x1 = 1.5, y1 = 2.0, zt = 7.0;
    l.box(CREAM, x0, x1, 0.1, y1, 0.02, 0.62, G); l.box(CREAM, x0, x1, 0.1, 0.16, 0.62, zt, G); l.box(CREAM, x0 - 0.05, x1 + 0.05, 0.1, y1 + 0.06, zt, zt + 0.12, G);
    for (const x of [x0, x1 - 0.08]) l.box(CREAM, x, x + 0.08, 0.16, y1, 0.62, zt, G);
    l.box('c#e9d2ac/0.9', x0 + 0.08, x1 - 0.08, 0.24, 0.25, 0.62, zt);                                            // a warm back
    for (let k = 0; k < 5; k++) { const z = 1.2 + k * 1.12; l.box('c#9a9590/0.45/1', x0 + 0.08, x1 - 0.08, 0.26, y1 - 0.12, z, z + 0.03); for (let i = 0; i < 6; i++) K.put(l, L(dome(0.3, 0.2 + k * 0.03), 1, 1, 10), DOUGH, -0.86 + (i % 3) * 0.86, 0.62 + Math.floor(i / 3) * 0.72, z + 0.03); }
    for (const [a, b2] of [[x0 + 0.08, -0.04], [0.04, x1 - 0.08]]) { l.box(CREAM, a, a + 0.14, y1 - 0.07, y1, 0.66, zt - 0.04, G); l.box(CREAM, b2 - 0.14, b2, y1 - 0.07, y1, 0.66, zt - 0.04, G); l.box(CREAM, a + 0.14, b2 - 0.14, y1 - 0.07, y1, 0.66, 0.9, G); l.box(CREAM, a + 0.14, b2 - 0.14, y1 - 0.07, y1, zt - 0.26, zt - 0.04, G); l.box('glass', a + 0.14, b2 - 0.14, y1 - 0.04, y1 - 0.03, 0.9, zt - 0.26); }
    for (const x of [-0.16, 0.16]) l.box(BRASS, x - 0.025, x + 0.025, y1, y1 + 0.07, 3.5, 4.1);
    l.block(x0, x1, 0, y1, 0, 7);
  }
  { // the back wall: the yard door (the one you can knock at from the lane; town.js cuts the doorway, 3.1 wide and 6.95 high, and
    // hangs the real door), its casing, two aprons on pegs beside it
    const a0 = DRA - 1.55, a1 = DRA + 1.55, y = D, T2 = A.TRIM;
    for (const [p, q] of [[a0 - 0.36, a0], [a1, a1 + 0.36]]) R.box(T2, p, q, y - 0.1, y - 0.004, 0.004, 7.5, G); R.box(T2, a0 - 0.42, a1 + 0.42, y - 0.12, y - 0.004, 7.5, 7.62, G); R.box(T2, a0, a1, y - 0.1, y - 0.004, 6.95, 7.5, G);
    R.box('c#6f5d48/0.95', a0 + 0.2, a1 - 0.2, y - 2.3, y - 0.5, 0.004, 0.035);                                   // the mat
    const l = at(0, 39.2, 0, 'right'); l.box(OAK, -1.5, 1.5, 0.004, 0.06, 5.9, 6.12, G);
    for (const x of [-1.1, 0, 1.1]) tube(l, BRASS, [[x, 0.05, 6.0], [x, 0.26, 6.05]], 0.03, 6, true);
    for (const [x, c2, zb] of [[1.1, 'linen#f4f1ea', 2.5], [0, 'linen#d8b7a6', 2.8]]) { l.soft(c2, x - 0.5, x + 0.5, 0.11, 0.2, zb, 5.2, 0.04); tube(l, c2, [[x - 0.3, 0.16, 5.2], [x - 0.1, 0.2, 5.9], [x, 0.22, 6.03], [x + 0.1, 0.2, 5.9], [x + 0.3, 0.16, 5.2]], 0.022, 5); }
  }
  X.pendant(R, OA, 36.9, { kind: 'dome', drop: 4.4, colour: 'c#e8e2d4/0.45', power: 0.9 });

  // ---- the window, left of the door: a tower of loaves, baguettes, a wheat sheaf, the card ----------------------
  { const z = 2.02, WX = lot.doorA - 3.05;                       // the display stops well short of the door
    R.box(BLUSH, 0.8, WX, 0.3, 2.9, 0, 1.96, G); R.box(LINEN, 0.74, WX + 0.06, 0.24, 2.96, 1.96, z); R.block(0.8, WX, 0.3, 2.9, 0, 3.2);
    ves(R, 'c#9fb0a4/0.45', 1.6, 1.7, z, [[0, 0], [0.36, 0], [0.42, 0.2], [0.4, 0.95], [0.34, 1.0], [0.3, 0.98], [0.34, 0.9], [0.34, 0.1], [0, 0.06]], 16); for (let i = 0; i < 7; i++) { const a = i * 0.9; baguette(R, 1.6 + Math.cos(a) * 0.1, 1.7 + Math.sin(a) * 0.1, z + 0.1, Math.cos(a) * 0.32, Math.sin(a) * 0.32, 2.2 + (i % 3) * 0.1, i % 2 ? CR1 : CR2); }
    let zz = z; [[0.56, CR3, 'rings', FLOUR, 0, 0], [0.44, CR2, 'cross', PALE, 0.06, -0.03], [0.36, CR1, 'square', PALE, -0.05, 0.04], [0.29, CR2, 'cross', PALE, 0.04, 0.02], [0.22, CR1, 'slash', PALE, -0.02, -0.02]].forEach(([rr, col, sc, ear, dx, dy], i) => { set(R, LOAF.boule(rr, col, sc, ear), 3.1 + dx, 1.45 + dy, zz, i * 0.8); zz += rr * 0.84 - 0.05; });
    { const sx = 4.55, sy = 1.9; for (let i = 0; i < 40; i++) { const a = i * 2.4, k = 0.25 + (i % 5) * 0.19, ca = Math.cos(a), sa = Math.sin(a), top = 2.2 + (i % 4) * 0.13;
        tube(R, 'c#d9b35a/0.8', [[sx + ca * 0.4 * k, sy + sa * 0.3 * k, z], [sx + ca * 0.07 * k, sy + sa * 0.07 * k, z + 1.0], [sx + ca * 0.3 * k, sy + sa * 0.26 * k, z + top - 0.42], [sx + ca * 0.52 * k, sy + sa * 0.42 * k, z + top - 0.2], [sx + ca * 0.62 * k, sy + sa * 0.5 * k, z + top]], t => t < 0.7 ? 0.011 : 0.011 + 0.034 * Math.sin(Math.PI * (t - 0.7) / 0.3), 5); }
      R.cyl('c#b8361f/0.8', sx, sy, z + 0.92, z + 1.08, 0.11, 0.11, 12); }
    { const ca = WX - 1.75; R.box(OAK, ca - 1.5, ca + 1.5, 1.9, 1.96, z, z + 2.0, G); kit.sign(at(ca, 1.9, 0, 'street'), 0, 0.012, z + 1.0, 2.9, 1.9, WINCARD, { cw: 520, ch: 340 }); }
    X.pendant(R, 3.6, 1.7, { kind: 'globe', drop: 3.3, power: 0.9, r: 0.3 });
  }

  // ---- out on the pavement: the bench under the window ------------------------------------------------------------
  kit.model('painted_wooden_bench', K.wrap(lot.frOut(kit, 0, 0, 0, 'back')), (lot.doorA - 3.05) * 0.36, -1.15, 0, 2, { outdoor: true, collide: true, seat: 1.45 });

  // ---- Crumb ------------------------------------------------------------------------------------------------------
  const SA = CA - 4.0;                                         // the staff aisle, between the counter and the bread wall
  kit.clerks.push({
    id: 'crumb', name: 'Crumb', lot: 'bakery', look: { shape: 'squat', colour: '#c79a6b', belly: '#f4ecdc', trim: '#e8b9a6', hat: 'toque', apron: '#f4f1ea', eye: '#ffe2b0', ring: 0xffc890, blush: true, tool: 'ladle', hover: 4.7 },
    home: lot.world(SA, CD), faces: lot.world(W - 4, CD - 3), posts: [lot.world(SA, CD - 4), lot.world(SA, PD - 1.4), lot.world(SA, CD)],
    serve: { machine: lot.world(SA, PD - 1.4), pickup: lot.pickup, food: {
      'cardamom knot': { build: EAT.knot, bites: 3, note: 'You finish the cardamom knot. Still warm.' },
      'slice of country loaf': { build: EAT.slice, bites: 3, note: 'You finish the slice. Butter to the very edges.' } } },
    lines: {
      greet: ['Morning. It has been morning for me since yesterday.', 'Come in. Mind the flour.'],
      idle: ['*pats a loaf on the bottom. listens. nods*', 'Up since before the birds.', '*wipes flour off the counter*', 'Doris is bubbling.'],
      bye: ['See you tomorrow. The bread will be up before you are.', 'Never the fridge.'],
      served: ['Eat it while it is warm.', 'Good? It is good.'],
      topics: [
        { q: 'You are open!', a: 'For years the note said “sold out, back at seven”. I baked at four and sold out by ten past. Now I bake more bread.' },
        { q: 'What is good today?', a: 'The country loaf, always. The rye if you are serious.', next: [
          { q: 'A slice of the country loaf, please.', a: 'With butter, to the very edges.', serve: 'slice of country loaf' },
          { q: 'A cardamom knot?', a: 'Those are saved for Juniper at the coffee shop. I can miscount by one.', serve: 'cardamom knot' }] },
        { q: 'Tell me about the starter.', a: 'Doris. Flour, water, and whatever was in the air the first evening. I feed her at two.', next: [
          { q: 'Why Doris?', a: 'She rises without being asked. “The culture” felt rude.' }] },
        { q: 'Do you ever sleep?', a: 'Twenty-five minutes, between the last fold and the shaping. I lean on the flour sacks.', next: [
          { q: 'And Bao, next door?', a: 'Bao gets my day-old loaves. I get the dumplings that came out a funny shape.' }] },
        { q: 'How do I bake bread at home?', a: 'Weigh everything. Keep the dough warm. Bake it darker than you dare.' },
      ],
    },
  });
}
