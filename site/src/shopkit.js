// Small goods for the shops: turned vessels, jars, bottles, tins, fruit, potted plants, cups,
// plates, a run of counter. Carried over from the kitchen of the house this town grew out of.
//   const K = tools(kit, seed); const fr = (...a) => K.wrap(kit.fr(...a));
// Every helper takes a frame first (x along, y out toward the front, z up). Plain colours are
// snapped to a small palette so the shops stay a handful of draw calls.
import * as THREE from 'three';
import { BRASS, G } from './kit.js';
import { wx, wz } from './builder.js';
import { lathe, sweep, rng } from './kit/geom.js';

const TAU = Math.PI * 2;
export const SAGEP = 'painted_wood#87937a', HONEY = 'oak_light#c4a477', OAKW = 'oak_light#a3825c', WALNUT = 'fir#7d5b45';
export const PORC = 'c#ebe6dc/0.18', NICKEL = 'c#c6c2ba/0.22/1', CHROME = 'c#d4d6d8/0.12/1', COPPER = 'c#b06a3c/0.32/1';
export const CLAY = 'c#b8755a/0.85', CREAMF = 'c#eee4cc/0.32', GLASSY = 'glass', TILE = 'tile_subway';
export const LEAF = ['c#4f6b3c/0.7', 'c#5d7a45/0.7', 'c#46613a/0.75', 'c#6b8550/0.7'];

// ---- Fewer materials, fewer draw calls -------------------------------------------------------
// Every distinct material name is a draw call, so plain colours are snapped to a small palette
// (and three roughnesses); metals to brass, copper, steel, chrome or iron.
const PAL = ['f4f1ea', 'e8e2d4', 'd9cdb2', 'c9b48a', 'c9ccd0', '9a9590', '5a5a56', '2b2724', '17140f', 'b08a5a', '8a5a2a', '6a4a2a', '3a2214', 'a8784a', 'c9a77a',
  'c8202a', '8a1c1c', 'b8361f', 'e8907a', 'e88aa8', 'e0782a', 'd9b35a', 'f3d96a', 'e8c73a', 'c9952a', '7fa04a', '5d8a3a', '4a6e38', '2f4a2a', '3a6a3a', '9fb0a4',
  '2a63b8', '2f5a6a', '26364f', '9fb0d8', 'c9d6d8', '4a2240', '8a5ab0', 'b9b8b2', 'efe2bc'].map(h => [h, parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]);
const METALS = ['b08d4a', 'b06a3c', 'c9ccd0', 'd4d6d8', '2b2724', 'a8aca8'].map(h => [h, parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]);
const SNAP = new Map();
export function snapMat(m) {
  if (typeof m !== 'string' || !m.startsWith('c#')) return m;
  if (SNAP.has(m)) return SNAP.get(m);
  const q = /^c#([0-9a-f]{6})(?:\/([\d.]+))?(?:\/([\d.]+))?$/i.exec(m); if (!q) return m;
  const v = parseInt(q[1], 16), r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255, metal = Number(q[3] ?? 0) > 0.5, rough = Number(q[2] ?? 0.85);
  let best = null, bd = 1e9; for (const [h, R, G2, B2] of metal ? METALS : PAL) { const d = 2 * (r - R) ** 2 + 4 * (g - G2) ** 2 + 3 * (b - B2) ** 2; if (d < bd) { bd = d; best = h; } }
  const out = `c#${best}/${rough < 0.28 ? 0.2 : rough < 0.6 ? 0.45 : 0.8}${metal ? '/1' : ''}`;
  SNAP.set(m, out); return out;
}

// ---- Helpers shared by the kitchen, the coffee bar and the porch ------------------------------
export function tools(kit, seed = 1) {
  const { B } = kit;
  const rnd = rng(seed, 7.3), pick = a => a[Math.floor(rnd() * a.length)];
  const M4 = new THREE.Matrix4();
  // Place a geometry built in a frame's own space (x along, y out from the wall, z up).
  function put(f, g, mat, x = 0, y = 0, z = 0) {
    const [X0, Y0] = f.map(x, y), [X1, Y1] = f.map(x + 1, y), [X2, Y2] = f.map(x, y + 1);
    M4.set(X1 - X0, X2 - X0, 0, wx(X0), 0, 0, 1, f.h + z, -(Y1 - Y0), -(Y2 - Y0), 0, wz(Y0), 0, 0, 0, 1);
    g.applyMatrix4(M4); B.mesh(snapMat(mat), g);
  }
  // A turned shape: profile [[r, z], ...] from the bottom centre up and round.
  const ves = (f, mat, x, y, z, prof, seg = 18) => put(f, lathe(prof, { seg }), mat, x, y, z);
  // A lying cylinder: ax 'x' along the frame, 'y' out from the wall, 'z' upright.
  function hcyl(f, mat, ax, x, y, z, len, r0, r1 = r0, seg = 12, open = false) {
    const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1, open);
    if (ax === 'x') g.rotateZ(-Math.PI / 2); else if (ax === 'z') g.rotateX(Math.PI / 2);
    g.translate(x, y, z); put(f, g, mat);
  }
  // A ball (squashed by sz), sitting on z.
  function ball(f, mat, x, y, z, r, seg = 10, sz = 1) {
    const g = new THREE.SphereGeometry(r, seg, Math.max(4, Math.round(seg * 0.6)));
    g.rotateX(Math.PI / 2); g.scale(1, 1, sz); g.translate(x, y, z + r * sz); put(f, g, mat);
  }
  const tube = (f, mat, path, r, seg = 6, caps = false) => put(f, sweep(path, r, { seg, caps }), mat);
  // Fruit, turned: apple, orange, lemon (lying), pear, tomato.
  function fruit(f, kind, x, y, z, s = 1) {
    const r = { apple: 0.13, orange: 0.14, lemon: 0.11, pear: 0.11, tomato: 0.11, lime: 0.09, plum: 0.09, onion: 0.12, potato: 0.12 }[kind] * s;
    const col = { apple: pick(['c#a8231c/0.45', 'c#b8361f/0.45', 'c#8f1d18/0.45', 'c#c9a33a/0.5']), orange: 'c#e0851f/0.6', lemon: 'c#e8c73a/0.55', pear: pick(['c#b9b24a/0.55', 'c#a88f3a/0.6']),
      tomato: 'c#c0321e/0.35', lime: 'c#6f9a2e/0.5', plum: 'c#4a2240/0.4', onion: 'c#b87d3a/0.7', potato: 'c#a88a5a/0.95' }[kind];
    if (kind === 'pear') { ves(f, col, x, y, z, [[0, 0], [r * 0.7, r * 0.1], [r, r * 0.7], [r * 0.85, r * 1.3], [r * 0.45, r * 1.8], [r * 0.3, r * 2.15], [0, r * 2.25]], 12); tube(f, 'c#4a3a24/0.8', [[x, y, z + r * 2.2], [x + 0.02, y, z + r * 2.55]], 0.012, 4); return; }
    if (kind === 'lemon' || kind === 'lime') { const g = new THREE.SphereGeometry(r, 12, 8); g.scale(1.35, 1, 1); g.rotateZ(rnd() * 3); g.translate(x, y, z + r * 0.95); put(f, g, col); return; }
    if (kind === 'potato') { const g = new THREE.SphereGeometry(r, 9, 6); g.scale(1.3, 0.95, 0.75); g.rotateZ(rnd() * 3); g.translate(x, y, z + r * 0.72); put(f, g, col); return; }
    const sq = kind === 'tomato' || kind === 'onion' ? 0.82 : kind === 'apple' ? 0.92 : 0.95;
    ves(f, col, x, y, z, [[0, r * 0.12], [r * 0.6, 0], [r * 0.95, r * 0.45 * sq], [r, r * sq], [r * 0.9, r * 1.55 * sq], [r * 0.45, r * 1.88 * sq], [0, r * 1.75 * sq]], 12);
    if (kind === 'apple' || kind === 'pear') tube(f, 'c#4a3a24/0.8', [[x, y, z + r * 1.7], [x + 0.015, y, z + r * 2.05]], 0.01, 4);
    if (kind === 'onion') tube(f, 'c#c9a46a/0.8', [[x, y, z + r * 1.6], [x, y, z + r * 2.1]], 0.02, 4);
  }
  // A bunch of grapes, hanging down from z.
  function grapes(f, x, y, z, col = 'c#4a2a48/0.35') {
    for (let i = 0; i < 16; i++) { const k = i / 16, rr = 0.11 * (1 - k * 0.6); ball(f, col, x + Math.cos(i * 2.4) * rr, y + Math.sin(i * 2.4) * rr, z + k * 0.3, 0.04, 7); }
  }
  // A leafy plant in a pot. leaves: count, len, w width, up, out, droop; pot colour / size.
  const LSH = Array.from({ length: 6 }, (_, i) => [0.16 * Math.cos(i / 6 * TAU), Math.sin(i / 6 * TAU)]);
  function leaves(f, x, y, z, o = {}) {
    const n = o.n ?? 12, len = o.len ?? 0.5, w = o.w ?? 0.06, col = o.col ?? LEAF, sp = o.spread ?? 0.06;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rnd() * 0.8, L = len * (0.65 + rnd() * 0.55), up = (o.up ?? 0.85) * (0.75 + rnd() * 0.4), out = (o.out ?? 0.55) * (0.6 + rnd() * 0.7), droop = o.droop ?? 0.5;
      const bx = x + Math.cos(a) * sp * rnd(), by = y + Math.sin(a) * sp * rnd(), pts = [];
      for (let k = 0; k <= 5; k++) { const t = k / 5; pts.push([bx + Math.cos(a) * out * L * t, by + Math.sin(a) * out * L * t, z + L * (up * t - droop * out * t * t)]); }
      put(f, sweep(pts, t => w * Math.pow(Math.sin(Math.PI * Math.min(0.97, 0.06 + t * 0.94)), 0.75) + 0.003, { shape: LSH, seg: 6 }), pick(col));
    }
  }
  function potted(f, x, y, z, o = {}) {
    const r = o.r ?? 0.2, h = o.h ?? r * 1.4, pot = o.pot ?? CLAY;
    ves(f, pot, x, y, z, [[0, 0], [r * 0.72, 0], [r * 0.95, h * 0.9], [r * 1.08, h * 0.92], [r * 1.08, h], [r * 0.93, h], [r * 0.9, h * 0.86], [0, h * 0.86]], o.seg ?? 16);
    ves(f, 'c#3b2a1f/1', x, y, z + h * 0.84, [[0, 0], [r * 0.9, 0], [r * 0.85, 0.02], [0, 0.03]], 12);
    leaves(f, x, y, z + h * 0.84, { spread: r * 0.5, ...o });
  }
  // A clear glass vessel holding something (fill colour, fill level 0..1).
  function jar(f, x, y, z, r, h, fill, lvl = 0.8, lid = 'c#c9ccd0/0.3/1') {
    ves(f, GLASSY, x, y, z, [[0, 0], [r, 0], [r, h * 0.92], [r * 0.85, h], [0, h]], 14);
    if (fill) ves(f, fill, x, y, z + 0.01, [[0, 0], [r - 0.012, 0], [r - 0.012, h * lvl * 0.9], [0, h * lvl * 0.9]], 12);
    if (lid) f.cyl(lid, x, y, z + h, z + h + 0.05, r * 0.9, r * 0.9, 14);
  }
  function bottle(f, x, y, z, o = {}) {
    const r = o.r ?? 0.11, h = o.h ?? 0.95, col = o.col ?? 'c#2c4a2a/0.15', neck = o.neck ?? 0.035;
    ves(f, col, x, y, z, [[0, 0], [r, 0], [r, h * 0.62], [r * 0.6, h * 0.74], [neck, h * 0.82], [neck, h], [0, h]], 14);
    if (o.cap) f.cyl(o.cap, x, y, z + h - 0.08, z + h + 0.005, neck + 0.008, neck + 0.008, 10);
    if (o.label) f.cyl(o.label, x, y, z + h * 0.18, z + h * 0.5, r + 0.004, r + 0.004, 14);
  }
  // A tin can with a label band.
  function tin(f, x, y, z, r, h, label, band) {
    f.cyl('c#b9b8b2/0.3/1', x, y, z, z + h, r, r, 14); f.cyl(label, x, y, z + 0.02, z + h - 0.02, r + 0.004, r + 0.004, 14);
    if (band) f.cyl(band, x, y, z + h * 0.35, z + h * 0.6, r + 0.007, r + 0.007, 14);
  }
  const plate = (f, x, y, z, r = 0.38, col = PORC) => ves(f, col, x, y, z, [[0, 0], [r * 0.6, 0], [r * 0.65, 0.015], [r, 0.05], [r, 0.06], [r * 0.6, 0.03], [0, 0.03]], 20);
  const bowl = (f, x, y, z, r, h, col = PORC, seg = 20) => ves(f, col, x, y, z, [[0, 0], [r * 0.5, 0], [r * 0.85, h * 0.45], [r, h], [r * 0.93, h], [r * 0.8, h * 0.5], [r * 0.45, h * 0.12], [0, h * 0.12]], seg);
  const glass = (f, x, y, z, r = 0.11, h = 0.42, fill) => { ves(f, GLASSY, x, y, z, [[0, 0], [r * 0.85, 0], [r, h], [r * 0.93, h], [r * 0.78, 0.04], [0, 0.04]], 14); if (fill) ves(f, fill, x, y, z + 0.04, [[0, 0], [r * 0.8, 0], [r * 0.9, h * 0.6], [0, h * 0.6]], 12); };
  const cupSaucer = (f, x, y, z, col = PORC, coffee = true) => {
    ves(f, col, x, y, z, [[0, 0], [0.16, 0], [0.19, 0.03], [0.18, 0.035], [0, 0.02]], 16);
    ves(f, col, x, y, z + 0.02, [[0, 0], [0.07, 0], [0.12, 0.08], [0.13, 0.2], [0.12, 0.2], [0.1, 0.06], [0, 0.04]], 14);
    if (coffee) f.cyl('c#3b2416/0.2', x, y, z + 0.17, z + 0.175, 0.115, 0.115, 12);
    tube(f, col, [[x + 0.12, y, z + 0.17], [x + 0.2, y, z + 0.15], [x + 0.19, y, z + 0.08], [x + 0.12, y, z + 0.07]], 0.014, 5);
  };
  // A cloth hanging over a bar at height z, front at y, x0..x1, hanging length len.
  function towel(f, x0, x1, y, z, len, col, stripe) {
    f.soft(col, x0, x1, y - 0.07, y + 0.012, z - 0.06, z + 0.03, 0.015);
    f.box(col, x0, x1, y + 0.005, y + 0.025, z - len, z - 0.02); f.box(col, x0 + 0.01, x1 - 0.01, y - 0.08, y - 0.06, z - len * 0.7, z - 0.02);
    if (stripe) for (const k of [0.25, 0.32]) f.box(stripe, x0 - 0.002, x1 + 0.002, y + 0.024, y + 0.028, z - len * k - 0.02, z - len * k);
  }
  // ---- A run of base cabinets: Shaker doors and drawers, toe kick, stone top, optional sink ----
  function front(f, a, b, z0, z1, y, paint, s = 0.17) {
    f.box(paint, a, b, y, y + 0.035, z0, z1);
    f.box(paint, a, a + s, y + 0.035, y + 0.07, z0, z1); f.box(paint, b - s, b, y + 0.035, y + 0.07, z0, z1);
    f.box(paint, a + s, b - s, y + 0.035, y + 0.07, z0, z0 + s); f.box(paint, a + s, b - s, y + 0.035, y + 0.07, z1 - s, z1);
  }
  function run(f, x0, x1, o = {}) {
    const d = o.d ?? 2, paint = o.paint ?? SAGEP, top = o.top ?? 'marble', sink = o.sink, fy = d - 0.07;
    f.box('c#2c2520/0.6', x0 + 0.02, x1 - 0.02, 0.05, d - 0.25, 0, 0.33);
    const cut = sink ? [[x0, sink[0], 2.88], [sink[0], sink[1], 2.1], [sink[1], x1, 2.88]] : [[x0, x1, 2.88]];
    for (const [a, b, zt] of cut) f.box(paint, a, b, 0.02, fy, 0.33, zt);
    const bays = [];
    const fillB = (a, b) => { const n = Math.max(1, Math.round((b - a) / 1.6)), w = (b - a) / n; for (let i = 0; i < n; i++) bays.push([a + i * w, a + (i + 1) * w, (bays.length % 3 === 1) ? 'drawers' : 'door']); };
    if (sink) { fillB(x0, sink[0]); bays.push([sink[0], sink[1], 'sink']); fillB(sink[1], x1); } else fillB(x0, x1);
    for (const [a0, b0, kind] of bays) {
      const a = a0 + 0.025, b = b0 - 0.025, m = (a + b) / 2;
      if (kind === 'drawers') {
        for (const [z0, z1] of [[0.42, 1.25], [1.32, 2.08], [2.15, 2.8]]) { front(f, a, b, z0, z1, fy, paint, 0.11); f.box(BRASS, m - 0.22, m + 0.22, fy + 0.07, fy + 0.11, (z0 + z1) / 2 + 0.08, (z0 + z1) / 2 + 0.12); f.box(BRASS, m - 0.24, m - 0.2, fy + 0.07, fy + 0.11, (z0 + z1) / 2 + 0.0, (z0 + z1) / 2 + 0.12); f.box(BRASS, m + 0.2, m + 0.24, fy + 0.07, fy + 0.11, (z0 + z1) / 2 + 0.0, (z0 + z1) / 2 + 0.12); }
      } else if (kind === 'sink') {
        const h = (b - a) / 2;
        for (const [p, q] of [[a, a + h - 0.01], [a + h + 0.01, b]]) { front(f, p, q, 0.42, 2.02, fy, paint); hcyl(f, BRASS, 'y', p === a ? q - 0.18 : p + 0.18, fy + 0.11, 1.7, 0.07, 0.035, 0.045, 10); }
      } else {
        front(f, a, b, 2.15, 2.8, fy, paint, 0.11); f.box(BRASS, m - 0.22, m + 0.22, fy + 0.07, fy + 0.11, 2.52, 2.56); f.box(BRASS, m - 0.24, m - 0.2, fy + 0.07, fy + 0.11, 2.44, 2.56); f.box(BRASS, m + 0.2, m + 0.24, fy + 0.07, fy + 0.11, 2.44, 2.56);
        front(f, a, b, 0.42, 2.08, fy, paint); hcyl(f, BRASS, 'y', b - 0.2, fy + 0.11, 1.78, 0.07, 0.035, 0.045, 10);
      }
    }
    const tops = sink ? [[x0 - 0.02, sink[0], -0.0, d + 0.08], [sink[1], x1 + 0.02, 0, d + 0.08], [sink[0], sink[1], 0, 0.45]] : [[x0 - 0.02, x1 + 0.02, 0, d + 0.08]];
    for (const [a, b, y0, y1] of tops) f.box(top, a, b, y0 + 0.005, y1, 2.9, 3.02, G);
    if (sink) {
      const [s0, s1] = sink, m = (s0 + s1) / 2;
      f.soft(PORC, s0, s1, d - 0.1, d + 0.03, 2.1, 3.0, 0.035);                                   // apron front
      f.box(PORC, s0, s1, 0.45, 0.53, 2.1, 3.0); f.box(PORC, s0, s0 + 0.08, 0.45, d - 0.08, 2.1, 3.0); f.box(PORC, s1 - 0.08, s1, 0.45, d - 0.08, 2.1, 3.0);
      f.box(PORC, s0 + 0.08, s1 - 0.08, 0.53, d - 0.08, 2.1, 2.2);                               // nine inches deep
      f.cyl('c#9a9590/0.3/1', m, 1.25, 2.2, 2.21, 0.1, 0.1, 14); f.cyl('c#3a3632/0.5', m, 1.25, 2.205, 2.215, 0.05, 0.05, 10);
      // Bridge faucet in unlacquered brass
      for (const s of [-0.38, 0.38]) { f.cyl(BRASS, m + s, 0.3, 3.02, 3.36, 0.045, 0.04, 12); f.box(BRASS, m + s - 0.14, m + s + 0.14, 0.27, 0.33, 3.4, 3.44); f.cyl('c#efe9dc/0.3', m + s, 0.3, 3.36, 3.42, 0.03, 0.03, 8); }
      hcyl(f, BRASS, 'x', m, 0.3, 3.3, 0.76, 0.035);
      tube(f, BRASS, [[m, 0.3, 3.28], [m, 0.3, 3.85], [m, 0.36, 4.1], [m, 0.55, 4.18], [m, 0.75, 4.05], [m, 0.82, 3.8], [m, 0.82, 3.62]], 0.035, 10);
      f.cyl(BRASS, m + 0.55, 0.3, 3.02, 3.35, 0.03, 0.025, 8);                                  // side spray
    }
    f.block(x0, x1, 0, d, 0, 3);
  }

  const wrap = f => { const g = Object.create(f); g.box = (m, ...a) => f.box(snapMat(m), ...a); g.soft = (m, ...a) => f.soft(snapMat(m), ...a); g.cyl = (m, ...a) => f.cyl(snapMat(m), ...a); g.sub = (...a) => wrap(f.sub(...a)); return g; };
  return { wrap, run, front, rnd, pick, put, ves, hcyl, ball, tube, fruit, grapes, leaves, potted, jar, bottle, tin, plate, bowl, glass, cupSaucer, towel };
}

// Text on a drawn surface.
export function T(g, s, x, y, px, col, o = {}) {
  g.font = `${o.it ? 'italic ' : ''}${o.w ?? 'bold'} ${Math.round(px)}px ${o.f ?? 'Georgia, serif'}`;
  g.textAlign = o.a ?? 'center'; g.textBaseline = 'middle';
  if (o.stroke) { g.lineJoin = 'round'; g.lineWidth = o.lw ?? px * 0.12; g.strokeStyle = o.stroke; g.strokeText(s, x, y, o.max); }
  g.fillStyle = col; g.fillText(s, x, y, o.max);
}

// ---- Shop fittings ------------------------------------------------------------------------------------
// const X = fixtures(kit, K) where K = tools(kit, seed). Every fitting takes a frame first; a frame on a
// wall has y = 0 at the wall and +y coming out into the room.
export function fixtures(kit, K) {
  const { ves, tube, hcyl, ball } = K;
  const WOOD = 'oak_light#a3825c', DARKW = 'fir#3a2c24', IRONM = 'c#2b2724/0.45/1';
  // Open shelving against a wall: uprights, a back, and shelves at the heights zs (their tops).
  // Returns the shelf-top heights, for putting things on. o: { d depth, mat, back (material or false), th }
  function shelving(f, x0, x1, zs = [1.2, 2.6, 4.0, 5.4], o = {}) {
    const d = o.d ?? 1.0, mat = o.mat ?? WOOD, th = o.th ?? 0.09, top = Math.max(...zs) + (o.over ?? 1.3), n = Math.max(1, Math.round((x1 - x0) / (o.bay ?? 3.4)));
    if (o.back !== false) f.box(o.back ?? mat, x0, x1, 0.01, 0.078, 0, top, G);      // (proud of the shell's 0.06 skirting)
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; f.box(mat, x - 0.045, x + 0.045, 0.01, d, 0, top, G); }
    for (const z of zs) f.box(mat, x0, x1, 0.02, d + 0.03, z - th, z, G);
    f.box(mat, x0 - 0.05, x1 + 0.05, 0.01, d + 0.05, top, top + 0.1, G);
    if (o.block !== false) f.block(x0, x1, 0, d, 0, Math.min(top, 7));
    return zs;
  }
  // A freestanding table or display plinth, centred on (x, y): top at h. Returns h.
  function plinth(f, x, y, w, d, h = 2.6, o = {}) {
    const mat = o.mat ?? WOOD, leg = o.leg ?? 0.14;
    if (o.solid) f.box(mat, x - w / 2, x + w / 2, y - d / 2, y + d / 2, 0, h - 0.08, G);
    else { for (const sx of [-1, 1]) for (const sy of [-1, 1]) f.box(mat, x + sx * (w / 2 - leg) - leg / 2, x + sx * (w / 2 - leg) + leg / 2, y + sy * (d / 2 - leg) - leg / 2, y + sy * (d / 2 - leg) + leg / 2, 0, h - 0.08, G);
      f.box(mat, x - w / 2 + leg, x + w / 2 - leg, y - d / 2 + leg, y + d / 2 - leg, h - 0.42, h - 0.08, G);
      if (o.shelf) f.box(mat, x - w / 2 + leg, x + w / 2 - leg, y - d / 2 + leg, y + d / 2 - leg, o.shelf - 0.07, o.shelf, G); }
    f.box(o.top ?? mat, x - w / 2 - 0.06, x + w / 2 + 0.06, y - d / 2 - 0.06, y + d / 2 + 0.06, h - 0.08, h, G);
    if (o.block !== false) f.block(x - w / 2, x + w / 2, y - d / 2, y + d / 2, 0, Math.max(h, 1.6));
    return h;
  }
  // A shop counter running x0..x1 with its customer side at y = y1 (front) and staff side at y0. Top at h.
  // o: { top, front, kick, panels: true, overhang }
  function counter(f, x0, x1, y0, y1, h = 3.4, o = {}) {
    const front = o.front ?? WOOD, top = o.top ?? 'marble';
    f.box(o.kick ?? 'c#2c2520/0.6', x0 + 0.06, x1 - 0.06, y0 + 0.06, y1 - 0.12, 0, 0.3);
    f.box(front, x0, x1, y0, y1 - 0.06, 0.3, h - 0.1, G);
    if (o.panels !== false) { const n = Math.max(1, Math.round((x1 - x0) / 2.2)), w = (x1 - x0) / n; for (let i = 0; i < n; i++) { const a = x0 + i * w + 0.18, b = x0 + (i + 1) * w - 0.18;
      f.box(front, a, b, y1 - 0.06, y1 - 0.02, 0.55, 0.75, G); f.box(front, a, b, y1 - 0.06, y1 - 0.02, h - 0.55, h - 0.35, G); f.box(front, a, a + 0.2, y1 - 0.06, y1 - 0.02, 0.75, h - 0.55, G); f.box(front, b - 0.2, b, y1 - 0.06, y1 - 0.02, 0.75, h - 0.55, G); } }
    f.box(top, x0 - 0.08, x1 + 0.08, y0 - 0.04, y1 + (o.overhang ?? 0.22), h - 0.1, h, G);
    f.block(x0, x1, y0, y1, 0, h);
    return h;
  }
  // A glass display case on a counter top: x0..x1, y0..y1, from z up by tall. Things go inside on z + 0.03.
  function glassCase(f, x0, x1, y0, y1, z, tall = 1.1, o = {}) {
    const m = o.frame ?? BRASS;
    f.box(o.base ?? 'c#efe9da/0.5', x0, x1, y0, y1, z, z + 0.03);
    for (const [a, b] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) f.box(m, a - 0.015, a + 0.015, b - 0.015, b + 0.015, z, z + tall);
    for (const b of [y0, y1]) f.box(m, x0, x1, b - 0.015, b + 0.015, z + tall - 0.03, z + tall);
    for (const a of [x0, x1]) f.box(m, a - 0.015, a + 0.015, y0, y1, z + tall - 0.03, z + tall);
    f.box('glass', x0, x1, y1 - 0.008, y1, z + 0.03, z + tall - 0.03); f.box('glass', x0, x1, y0, y1, z + tall - 0.012, z + tall - 0.004);
    f.box('glass', x0, x0 + 0.008, y0, y1, z + 0.03, z + tall - 0.03); f.box('glass', x1 - 0.008, x1, y0, y1, z + 0.03, z + tall - 0.03);
    if (o.shelf) f.box('glass', x0 + 0.02, x1 - 0.02, y0 + 0.02, y1 - 0.05, z + o.shelf - 0.012, z + o.shelf);
  }
  // A lamp hung from the ceiling (12 ft above the floor unless zc says) at (x, y), its light `drop` below.
  // kind: 'dome' enamel shade, 'globe' opal glass, 'cone' spun metal, 'bulb' a bare filament bulb, 'paper' a paper lantern
  function pendant(f, x, y, o = {}) {
    const zc = o.zc ?? 12, drop = o.drop ?? 4, z = zc - drop, kind = o.kind ?? 'dome', col = o.colour ?? 'c#2f4a40/0.35';
    f.cyl(IRONM, x, y, zc - 0.06, zc, 0.16, 0.16, 10); f.cyl(o.cord ?? 'c#1d1b18/0.8', x, y, z + 0.3, zc - 0.06, 0.018, 0.018, 5);
    if (kind === 'dome') { ves(f, col, x, y, z, [[0.62, 0], [0.6, 0.05], [0.34, 0.34], [0.12, 0.48], [0.07, 0.62], [0, 0.62]], 20); ves(f, 'e#ffe2b4/1.7', x, y, z + 0.02, [[0.56, 0], [0.32, 0.3], [0.1, 0.44], [0, 0.44]].reverse(), 16); ball(f, 'e#fff4e0/3', x, y, z + 0.05, 0.11, 8); }
    else if (kind === 'cone') { ves(f, col, x, y, z, [[0.5, 0], [0.48, 0.03], [0.09, 0.7], [0.06, 0.82], [0, 0.82]], 18); ball(f, 'e#fff4e0/3', x, y, z + 0.04, 0.1, 8); }
    else if (kind === 'globe') { f.cyl(BRASS, x, y, z + 0.52, z + 0.64, 0.12, 0.08, 10); ball(f, 'e#fbf3e4/1.4', x, y, z - 0.08, o.r ?? 0.34, 14); }
    else if (kind === 'paper') { ves(f, 'shade', x, y, z - 0.5, [[0.08, 0], [0.3, 0.06], [0.48, 0.24], [0.56, 0.5], [0.56, 0.7], [0.48, 0.96], [0.3, 1.14], [0.08, 1.2]], 28); for (const k of [0.24, 0.5, 0.7, 0.96]) f.cyl('c#cdbb98/0.8', x, y, z - 0.5 + k - 0.006, z - 0.5 + k + 0.006, k === 0.5 || k === 0.7 ? 0.565 : 0.485, k === 0.5 || k === 0.7 ? 0.565 : 0.485, 28); }
    else { f.cyl(BRASS, x, y, z + 0.18, z + 0.34, 0.07, 0.07, 8); ves(f, 'e#ffd9a0/2.2', x, y, z - 0.12, [[0.01, 0], [0.12, 0.06], [0.16, 0.16], [0.1, 0.27], [0.06, 0.3], [0, 0.3]], 10); }
    if (o.light !== false) { kit.lampAt(f, x, y, z - 0.1, o.power ?? 0.9); kit.lamps[kit.lamps.length - 1].halo = o.halo ?? 0.8; kit.lamps[kit.lamps.length - 1].cone = kind === 'dome' || kind === 'cone' ? 1 : 0; }      // (cone: a shade that throws its light down, lighting.js)
  }
  // A stool at (x, y) you can sit on, seat at h.
  function stool(f, x, y, h = 2.4, o = {}) {
    const mat = o.mat ?? WOOD;
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; tube(f, o.leg ?? IRONM, [[x + Math.cos(a) * 0.42, y + Math.sin(a) * 0.42, 0], [x + Math.cos(a) * 0.26, y + Math.sin(a) * 0.26, h - 0.08]], 0.035, 5); }
    f.cyl(o.leg ?? IRONM, x, y, h * 0.36, h * 0.36 + 0.04, 0.36, 0.36, 14); f.cyl(mat, x, y, h - 0.1, h, 0.5, 0.52, 18);
    kit.seat(f, x, y, h, o.label ?? 'sit'); f.block(x - 0.45, x + 0.45, y - 0.45, y + 0.45, 0, 1.5);
  }
  // A wooden crate (open top), bottom at z: slatted sides.
  function crate(f, x, y, z, w = 1.5, d = 1.1, h = 0.8, mat = 'oak_light#b89466') {
    f.box(mat, x - w / 2, x + w / 2, y - d / 2, y + d / 2, z, z + 0.05, G);
    for (const k of [0.12, 0.5, 0.86]) { const zz = z + h * k; f.box(mat, x - w / 2, x + w / 2, y - d / 2, y - d / 2 + 0.04, zz - 0.09, zz + 0.09, G); f.box(mat, x - w / 2, x + w / 2, y + d / 2 - 0.04, y + d / 2, zz - 0.09, zz + 0.09, G); f.box(mat, x - w / 2, x - w / 2 + 0.04, y - d / 2, y + d / 2, zz - 0.09, zz + 0.09, G); f.box(mat, x + w / 2 - 0.04, x + w / 2, y - d / 2, y + d / 2, zz - 0.09, zz + 0.09, G); }
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) f.box(mat, x + a * (w / 2 - 0.06) - 0.04, x + a * (w / 2 - 0.06) + 0.04, y + b * (d / 2 - 0.06) - 0.04, y + b * (d / 2 - 0.06) + 0.04, z, z + h, G);
  }
  // A slate on the wall (centre x, z; w by tall) with a wooden frame; draw(g, w, h) chalks it.
  function slateBoard(f, x, z, w, tall, draw, o = {}) {
    f.box(o.frame ?? DARKW, x - w / 2 - 0.1, x + w / 2 + 0.1, 0.01, 0.09, z - tall / 2 - 0.1, z + tall / 2 + 0.1, G);
    kit.sign(f, x, 0.1, z, w, tall, draw, { cw: o.cw ?? Math.round(w * 110), ch: o.ch ?? Math.round(tall * 110), rough: 0.95 });
  }
  // An A-board on the pavement at (x, y): two faces, the same chalked message on both.
  function aBoard(f, x, y, draw, o = {}) {
    const w = o.w ?? 2, h = o.h ?? 3.4, lean = 0.2, d = Math.sin(lean) * h, hh = Math.cos(lean) * h, px = Math.round(w * 120), py = Math.round(h * 0.84 * 120);
    for (const s of [-1, 1]) kit.put(f, o.frame ?? DARKW, kit.geom.bev(-w / 2 - 0.07, w / 2 + 0.07, -0.035, 0.035, 0, h, 0.01), { rx: s * lean, at: [x, y + s * d, 0] });
    kit.sign(f.sub(x, y + d * 0.5 + 0.05, 0, 0), 0, 0, hh * 0.52, w, h * 0.84, draw, { cw: px, ch: py, rough: 0.95, tilt: lean });
    kit.sign(f.sub(x, y - d * 0.5 - 0.05, 0, 2), 0, 0, hh * 0.52, w, h * 0.84, o.back ?? draw, { cw: px, ch: py, rough: 0.95, tilt: lean });
    f.block(x - w / 2, x + w / 2, y - d, y + d, 0, 3);
  }
  // A small price ticket or shelf card standing at (x, y, z), w by tall, leaning back a little.
  const card = (f, x, y, z, w, tall, draw, o = {}) => kit.sign(f, x, y, z + tall / 2, w, tall, draw, { cw: o.cw ?? Math.max(64, Math.round(w * 260)), ch: o.ch ?? Math.max(48, Math.round(tall * 260)), tilt: o.tilt ?? 0.18, rough: 0.9 });
  // A cash register on a counter top at (x, y, z): the old National kind, after the nickel-plated one at the
  // Museum of the Biecz Land (KW/3434; 51 cm high, 38 wide, 47 deep). From the bottom: a dark wooden plinth, the
  // cash drawer, a marble change plate in front of the keyboard, the case (a stepped keyboard rising to a rounded
  // hood), the reading box on top with the amount flags in its window, a cresting over it, and the crank on one
  // side. Its keys face -y (the clerk); the customer at +y sees the back and the flags in the window.
  // Built from the shared palette, so a till adds about 3,400 triangles and at most one draw call (a colour or the
  // marble that the shop had not used yet); the window on the customer's side is a picture. o: { body, trim, keys: [a, b], accent, ledge, base, crank (+1 right, -1
  // left), knob, back(g, w, h) for the customer's window, s (scale) }. A painted till takes body = its enamel.
  function till(f, x, y, z, o = {}) {
    const s = o.s ?? 1, body = o.body ?? 'c#b08d4a/0.45/1', trim = o.trim ?? BRASS, ground = o.ground ?? 'c#3a2214/0.8';
    const ledge = o.ledge ?? 'marble', base = o.base ?? ground, keyA = o.keys?.[0] ?? 'c#f4f1ea/0.45', keyB = o.keys?.[1] ?? 'c#17140f/0.45', side = o.crank ?? 1;
    const W = 1.15, hw = W / 2, sm = snapMat;
    const bx = (m, x0, x1, y0, y1, z0, z1) => f.box(sm(m), x + x0 * s, x + x1 * s, y + y0 * s, y + y1 * s, z + z0 * s, z + z1 * s);
    const sf = (m, x0, x1, y0, y1, z0, z1, r) => f.soft(sm(m), x + x0 * s, x + x1 * s, y + y0 * s, y + y1 * s, z + z0 * s, z + z1 * s, r * s);
    const cy = (m, cx, cy_, z0, z1, r, seg) => f.cyl(sm(m), x + cx * s, y + cy_ * s, z + z0 * s, z + z1 * s, r * s, r * s, seg);
    const hc = (m, ax, cx, cy_, cz, len, r0, r1, seg) => hcyl(f, m, ax, x + cx * s, y + cy_ * s, z + cz * s, len * s, r0 * s, r1 * s, seg);
    const tb = (m, pts, r, seg = 5) => tube(f, m, pts.map(([a, b, c]) => [x + a * s, y + b * s, z + c * s]), r * s, seg);
    // a shape drawn in the frame's (y, z) plane and pushed across x from x0 to x1
    const across = (m, pts, x0, x1, curve) => {
      const sh = new THREE.Shape(); sh.moveTo(...pts[0]);
      for (const p of pts.slice(1)) p.length === 4 ? sh.quadraticCurveTo(...p) : sh.lineTo(...p);
      const g = new THREE.ExtrudeGeometry(sh, { depth: x1 - x0, bevelEnabled: false, curveSegments: curve ?? 6 });
      g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, x0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1)); g.scale(s, s, s); K.put(f, g, m, x, y, z);
    };
    // the plinth and the cash drawer, its front panelled, with a pull
    bx(base, -hw - 0.03, hw + 0.03, -0.68, 0.68, 0, 0.06);
    sf(body, -hw, hw, -0.65, 0.65, 0.06, 0.38, 0.02);
    bx(ground, -hw + 0.07, hw - 0.07, -0.67, -0.65, 0.1, 0.34); bx(body, -hw + 0.1, hw - 0.1, -0.69, -0.668, 0.13, 0.31);
    hc(trim, 'x', 0, -0.73, 0.22, 0.26, 0.016, 0.016, 6); for (const k of [-1, 1]) hc(trim, 'y', k * 0.13, -0.71, 0.22, 0.05, 0.018, 0.018, 6);
    for (const k of [-1, 1]) hc(trim, 'y', k * 0.36, -0.698, 0.22, 0.016, 0.035, 0.035, 10);      // the drawer's two rosettes
    // the marble change plate, and the case behind it: keyboard, hood, flat back
    bx(ledge, -hw + 0.02, hw - 0.02, -0.66, -0.29, 0.38, 0.42);
    const KB0 = [-0.28, 0.5], KB1 = [0.14, 0.98];
    across(body, [[-0.28, 0.38], [-0.28, KB0[1]], KB1, [0.2, 1.1, 0.3, 1.1], [0.64, 1.1], [0.64, 0.38]], -hw + 0.04, hw - 0.04);
    // the back, toward the customer: a raised panel in a moulded frame, and a rosette, as cast
    bx(trim, -0.42, 0.42, 0.63, 0.66, 0.5, 1.0); bx(body, -0.36, 0.36, 0.655, 0.68, 0.55, 0.95); hc(trim, 'y', 0, 0.69, 0.75, 0.02, 0.09, 0.09, 12);
    // the cast sides: a dark ground with a medallion and two scrolls on it, and a bead round the hood
    for (const k of [-1, 1]) {
      const sx = k * (hw - 0.04), ox = sx + k * 0.02, o2 = sx + k * 0.03;
      across(ground, [[-0.18, 0.46], [0.08, 0.88], [0.54, 0.98], [0.54, 0.46]], k > 0 ? sx - 0.01 : sx - 0.02, k > 0 ? sx + 0.02 : sx + 0.01);
      hc(trim, 'x', o2, 0.36, 0.7, 0.02, 0.12, 0.12, 14); hc(body, 'x', o2 + k * 0.02, 0.36, 0.7, 0.02, 0.08, 0.08, 12);
      for (const [cy0, cz0, d] of k === side ? [] : [[0.06, 0.62, 1]]) {
        const pts = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * 4.2, r = 0.11 * (1 - i / 13); pts.push([ox, cy0 + d * Math.sin(a) * r, cz0 + Math.cos(a) * r - 0.04]); } tb(trim, pts, 0.012, 4);
      }
      { const bx_ = sx + k * 0.012; tb(trim, [[bx_, -0.28, 0.5], [bx_, 0.14, 0.98], [bx_, 0.24, 1.08], [bx_, 0.62, 1.1]], 0.015, 5); }
    }
    // the keys: four rows up the slope, six columns across, a brass rim round each round top
    const cols = 6, rows = 4;
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const t = (r + 0.55) / rows, ky = KB0[0] + (KB1[0] - KB0[0]) * t - 0.03, kz = KB0[1] + (KB1[1] - KB0[1]) * t, kx = (c - (cols - 1) / 2) * 0.16;
      cy(trim, kx, ky, kz - 0.03, kz + 0.06, 0.013, 4); cy(trim, kx, ky, kz + 0.05, kz + 0.065, 0.042, 8);
      cy(o.accent && c === cols - 1 && r === 0 ? o.accent : c % 3 === 2 ? keyB : keyA, kx, ky, kz + 0.065, kz + 0.085, 0.046, 8);
    }
    bx(trim, -hw + 0.06, hw - 0.06, -0.32, -0.27, 0.42, 0.5);                      // the strip along the foot of the keyboard
    // the reading box: the flags in their window toward the clerk, a picture of them toward the customer
    sf(body, -hw + 0.08, hw - 0.08, 0.24, 0.62, 1.1, 1.44, 0.03);
    bx(trim, -hw + 0.05, hw - 0.05, 0.16, 0.65, 1.44, 1.48);
    bx(ground, -0.38, 0.38, 0.215, 0.25, 1.17, 1.38);
    [[-0.22, keyA], [0, keyA], [0.2, o.accent ?? 'c#c8202a/0.45']].forEach(([fx, m]) => bx(m, fx - 0.075, fx + 0.075, 0.195, 0.215, 1.2, 1.34));
    kit.sign(f, x, y + 0.626 * s, z + 1.27 * s, 0.76 * s, 0.24 * s, o.back ?? tillFlags, { cw: o.cw ?? 176, ch: o.ch ?? 56 });
    // the cresting: an arched plate over the box
    { const sh = new THREE.Shape(), a = 0.42, h = 0.2;
      sh.moveTo(-a, 0); sh.lineTo(-a, 0.06); sh.quadraticCurveTo(-a + 0.04, 0.14, -a * 0.55, 0.12); sh.quadraticCurveTo(0, h + 0.06, a * 0.55, 0.12); sh.quadraticCurveTo(a - 0.04, 0.14, a, 0.06); sh.lineTo(a, 0);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false, curveSegments: 5 });
      g.applyMatrix4(new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, -1, 0.43, 0, 1, 0, 1.48, 0, 0, 0, 1)); g.scale(s, s, s); K.put(f, g, trim, x, y, z); }
    // the crank, on its side
    { const cx = side * (hw - 0.02);
      hc(trim, 'x', cx + side * 0.03, 0.08, 0.64, 0.06, 0.06, 0.045, 10);
      tb(trim, [[cx + side * 0.06, 0.08, 0.64], [cx + side * 0.08, -0.02, 0.56], [cx + side * 0.08, -0.1, 0.5]], 0.02, 5);
      hc(o.knob ?? 'c#3a2214/0.45', 'x', cx + side * 0.16, -0.1, 0.5, 0.16, 0.03, 0.038, 8); }
    (kit.tills ??= []).push({ at: kit.world(f, x, y), toward: kit.world(f, x, y + 1), y: f.h + z, fh: f.h });      // for the test views (tools)
  }
  // The customer's side of the reading box: three flags, the amount just rung up.
  function tillFlags(g, w, h) {
    g.fillStyle = '#17140f'; g.fillRect(0, 0, w, h);
    ['$1', '2', '5'].forEach((t, i) => { const cx = w * (0.27 + i * 0.23); g.fillStyle = i === 0 ? '#efe2bc' : '#f4f1ea'; g.fillRect(cx - w * 0.09, h * 0.14, w * 0.18, h * 0.72); T(g, t, cx, h * 0.52, h * 0.5, '#17140f'); });
  }
  return { shelving, plinth, counter, glassCase, pendant, stool, crate, slateBoard, aBoard, card, till, WOOD, DARKW, IRONM };
}
