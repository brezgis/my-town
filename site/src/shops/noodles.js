// Night Noodle  (south side; no. 23 South Main Street, South Norwalk, the 20 ft shopfront: about 19 ft wide by 43 deep)
// A noodle bar at night, in a long brick shop. The room is set out on its ceiling beams. In the window, a bench
// to wait on. Then the long room: down the right, the counter with six red stools and the open kitchen behind
// it (prep, the noodle boiler, the wok, the sink, a hood with the menu hung on it as wooden tablets); down the
// left, four booths under a dark boarded dado and a plate shelf, a low paper lantern over each table, a lantern
// over the counter opposite. At the end of the room the pot on its burner in the tiled corner, the slate that
// keeps count of how long it has been on, the day's greens in crates, and a noren in the doorway to the store:
// bowls to the ceiling, the miso tubs, flour, the back door and the back window behind its paper screen.
// Readable things, three in all: the tablets, the pot's slate, the board on the pavement. One picture:
// Hiroshige's Plum Park in Kameido (1857).
import * as THREE from 'three';
import { tools, fixtures } from '../shopkit.js';
import { arch } from './arch.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, disc, grain, rnd, ICON } from '../draw.js';

const OAK = 'oak_light#a3825c', DARK = 'fir#3a2c24', WAIN = 'painted_wood#5e4031', BLACK = 'painted_wood#2a2320', REDW = 'painted_wood#a8361f', INDIGO = 'linen#26364f';
const STEEL = 'c#c9ccd0/0.3/1', CHROME = 'c#d4d6d8/0.12/1', IRON = 'c#2b2724/0.45/1', PORC = 'c#ebe6dc/0.18', LACQ = 'c#17140f/0.2';
const NOOD = 'c#f3d96a/0.6', WHITE = 'c#f4f1ea/0.45', GREEN = 'c#5d8a3a/0.8', LEAFY = 'c#4a6e38/0.8', NORI = 'c#2f4a2a/0.8';
const INK = '#1d1b18', CREAM = '#f3e9d2', RED = '#b3261e';

// a wooden tablet, the kind hung in a row over a kitchen: the dish and its price, nothing else
const wood = (g, w, h, c = '#c79a5e', seed = 3) => { fill(g, w, h, c); const r = rnd(seed); for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? '70,40,10' : '255,230,180'},${0.05 + r() * 0.1})`; g.lineWidth = 1 + r() * 2; const x = r() * w; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + (r() - 0.5) * 14, h * 0.3, x + (r() - 0.5) * 14, h * 0.7, x + (r() - 0.5) * 8, h); g.stroke(); } };
const TABLET = (name, price, seed) => (g, w, h) => {
  wood(g, w, h, '#c79a5e', seed); g.strokeStyle = 'rgba(60,30,10,.55)'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4); disc(g, w / 2, h * 0.07, w * 0.035, '#3a2414');
  const ln = name.split('|'); ln.forEach((s, i) => T(g, s, w / 2, h * (ln.length > 1 ? 0.28 + i * 0.19 : 0.38), h * 0.16, INK, { f: F.shrikhand, max: w * 0.88 }));
  disc(g, w / 2, h * 0.78, h * 0.115, RED); T(g, price, w / 2, h * 0.785, h * 0.12, CREAM, { f: F.abril });
};
const MENU = [['Shoyu', '13'], ['Miso|& corn', '14'], ['Gyoza', '7'], ['Barley|tea', '2']];
// the slate on the back wall: it is redrawn as the street's clock moves
const POTCLOCK = hour => (g, w, h) => {
  slate(g, w, h, '#232826', 13); const el = ((hour - 5) % 24 + 24) % 24, hh = Math.floor(el), mm = Math.floor((el - hh) * 60);
  chalk(g, 'THE POT', w / 2, h * 0.15, h * 0.15, '#e9c46a'); chalk(g, 'on since five this morning', w / 2, h * 0.33, h * 0.085, '#f1efe6', { max: w * 0.92 });
  chalk(g, `${hh} h ${String(mm).padStart(2, '0')} min`, w / 2, h * 0.57, h * 0.22, '#e8a8a0', { max: w * 0.92 });
  chalk(g, 'it has never boiled', w / 2, h * 0.84, h * 0.085, '#9aa39d', { max: w * 0.92 });
};
const BOARD = (g, w, h) => {
  slate(g, w, h, '#1f1d1b', 23); ICON.bowl(g, w / 2, h * 0.16, h * 0.18, '#e8553f'); chalk(g, 'tonight', w / 2, h * 0.36, h * 0.09, '#e9c46a');
  ['shoyu ramen', 'miso & corn', 'gyoza, six'].forEach((s, i) => chalk(g, s, w / 2, h * (0.53 + i * 0.14), h * 0.09, '#f1efe6', { max: w * 0.9 }));
};
// one panel of the noren in the store's doorway; side: 1 or -1 puts half of the white ring on that edge
const NOREN = side => (g, w, h) => { fill(g, w, h, '#26364f'); grain(g, w, h, 0.08, 5); if (!side) return; g.strokeStyle = '#efe6d2'; g.lineWidth = w * 0.13; g.beginPath(); g.arc(side > 0 ? w * 1.02 : -w * 0.02, h * 0.5, w * 0.62, 0, Math.PI * 2); g.stroke(); };

// ---- what Kombu makes, to hold in the hand (THREE, y up, feet) -----------------------------------------------
function plateUp(T3, kind) {
  const g = new T3.Group(), mats = {}, M = (c, r = 0.6) => (mats[c + r] ??= new T3.MeshStandardMaterial({ color: c, roughness: r, side: T3.DoubleSide }));
  const add = (geo, c, x = 0, y = 0, z = 0, r) => { const m = new T3.Mesh(geo, M(c, r)); m.position.set(x, y, z); g.add(m); return m; };
  const turned = (prof, seg = 20) => new T3.LatheGeometry(prof.map(([r, y]) => new T3.Vector2(r, y)), seg);
  const scallion = (n, y, R) => { for (let i = 0; i < n; i++) { const a = i * 2.4, r = R * (0.3 + 0.7 * ((i * 37) % 10) / 10); add(new T3.CylinderGeometry(0.014, 0.014, 0.01, 6), 0x6f9a3e, Math.cos(a) * r, y, Math.sin(a) * r); } };
  if (kind === 'gyoza') {
    add(new T3.BoxGeometry(0.72, 0.03, 0.4), 0x2a2320, 0, 0.015, 0, 0.35);
    for (let i = 0; i < 6; i++) { const d = add(new T3.SphereGeometry(0.075, 9, 6), 0xf1e6cf, -0.25 + i * 0.085, 0.07, -0.04); d.scale.set(0.62, 0.62, 1.45); d.rotation.z = 0.5; const b = add(new T3.SphereGeometry(0.06, 7, 4), 0xb9772e, -0.235 + i * 0.085, 0.085, -0.04, 0.75); b.scale.set(0.5, 0.5, 1.35); b.rotation.z = 0.5; }
    add(turned([[0, 0], [0.06, 0], [0.085, 0.045], [0.075, 0.045], [0.05, 0.012], [0, 0.012]], 12), 0xebe6dc, 0.26, 0.03, 0.1, 0.25); add(new T3.CylinderGeometry(0.068, 0.068, 0.004, 12), 0x3a1c10, 0.26, 0.068, 0.1, 0.15);
    return g;
  }
  add(turned([[0, 0], [0.13, 0], [0.16, 0.03], [0.27, 0.12], [0.33, 0.24], [0.31, 0.24], [0.25, 0.13], [0.14, 0.05], [0, 0.05]], 22), 0x1d1b18, 0, 0, 0, 0.25);
  const y = 0.195, R = 0.285;
  add(new T3.CylinderGeometry(R, R, 0.01, 22), kind === 'miso' ? 0xc48a3a : 0x7a4a22, 0, y - 0.005, 0, 0.12);
  for (let i = 0; i < 4; i++) { const a = i * 1.9, n = add(new T3.TorusGeometry(0.075 + (i % 3) * 0.022, 0.015, 5, 14), 0xf0d98a, Math.cos(a) * 0.06 - 0.03, y + 0.004 + (i % 2) * 0.008, Math.sin(a) * 0.06); n.rotation.x = Math.PI / 2 + (i % 2 ? 0.12 : -0.1); n.rotation.z = a; }
  const egg = (x, z) => { const e = add(new T3.SphereGeometry(0.07, 10, 6, 0, 6.2832, 0, Math.PI / 2), 0xf6f1e4, x, y - 0.012, z, 0.4); e.scale.set(0.85, 0.55, 1.15); e.rotation.x = Math.PI; e.position.y = y + 0.03; add(new T3.CylinderGeometry(0.036, 0.036, 0.006, 10), 0xe8952a, x, y + 0.032, z, 0.35); };
  if (kind === 'shoyu') {
    egg(0.15, 0.08); for (const [x, z] of [[-0.02, -0.16], [0.1, -0.12]]) { const c = add(new T3.CylinderGeometry(0.085, 0.085, 0.018, 12), 0xb07a52, x, y + 0.012, z, 0.8); c.rotation.z = 0.12; }
    const n = add(new T3.BoxGeometry(0.2, 0.22, 0.006), 0x1f2a1c, -0.2, y + 0.07, 0.02, 0.8); n.rotation.y = Math.PI / 2 - 0.25; n.rotation.z = 0.2;
    add(new T3.CylinderGeometry(0.05, 0.05, 0.012, 12), 0xf6f1e4, -0.05, y + 0.014, 0.17, 0.5); const sw = add(new T3.TorusGeometry(0.022, 0.007, 4, 12), 0xe88aa8, -0.05, y + 0.021, 0.17); sw.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) { const m = add(new T3.BoxGeometry(0.1, 0.012, 0.026), 0xc9a15a, 0.13 + i * 0.012, y + 0.01 + i * 0.008, -0.02 + i * 0.03); m.rotation.y = 0.4; }
    scallion(8, y + 0.012, 0.1);
  } else {
    for (let i = 0; i < 16; i++) { const a = i * 2.4, r = 0.03 + (i % 4) * 0.022; add(new T3.SphereGeometry(0.017, 5, 4), 0xf0c93a, 0.1 + Math.cos(a) * r, y + 0.012 + (i % 3) * 0.006, 0.08 + Math.sin(a) * r, 0.45); }
    add(new T3.BoxGeometry(0.07, 0.03, 0.07), 0xf6e39a, -0.02, y + 0.03, -0.02, 0.35).rotation.y = 0.5;
    for (let i = 0; i < 7; i++) { const s = add(new T3.CylinderGeometry(0.008, 0.008, 0.13, 4), 0xf1ead6, -0.14 + (i % 3) * 0.02, y + 0.014 + i * 0.004, -0.1 + i * 0.012); s.rotation.z = Math.PI / 2; s.rotation.y = i * 0.5; }
    egg(-0.12, 0.14); scallion(10, y + 0.012, 0.22);
  }
  for (const dz of [-0.02, 0.02]) { const s = add(new T3.CylinderGeometry(0.008, 0.006, 0.78, 5), 0x3a2414, 0.02, 0.255, 0.2 + dz, 0.5); s.rotation.z = Math.PI / 2; s.rotation.y = dz * 2; }
  return g;
}

export default function noodles(kit, lot) {
  const K = tools(kit, 71), X = fixtures(kit, K), { ves, hcyl, ball, tube, jar, bowl } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0), W = lot.W, D = lot.D, FLH = lot.fr(kit, 0, 0).h;       // R: x = a, y = d, z = height
  const steam = (f, x, y, z) => { const [sx, sz] = kit.world(f, x, y); kit.steam.push({ x: sx, y: f.h + z, z: sz }); };
  const ring = (f, x, y, z, RR, r = 0.016, mat = NOOD) => K.put(f, new THREE.TorusGeometry(RR, r, 4, 12).translate(x, y, z), mat);
  const ladle = (f, x, y, z, len = 1.1) => { tube(f, STEEL, [[x, y - 0.05, z - 0.06], [x, y, z], [x, y + 0.02, z - 0.1], [x, y + 0.02, z - len]], 0.016, 5); ves(f, STEEL, x, y + 0.08, z - len - 0.1, [[0, 0], [0.09, 0.02], [0.14, 0.1], [0.15, 0.17], [0.135, 0.17], [0.12, 0.1], [0.08, 0.035], [0, 0.02]], 10); };
  const strainer = (f, x, y, z, len = 1.0) => { tube(f, 'c#8a5a2a/0.8', [[x, y - 0.05, z - 0.06], [x, y, z], [x, y + 0.02, z - 0.1], [x, y + 0.02, z - len]], 0.02, 5); ves(f, IRON, x, y + 0.02, z - len - 0.42, [[0.02, 0], [0.11, 0.06], [0.16, 0.36], [0.17, 0.42], [0.155, 0.42], [0.1, 0.07], [0.02, 0.02]], 10); };

  // ---- the plan, all from the lot ---------------------------------------------------------------------------------
  // Front to back: the waiting bench in the window; the long room (booths left, counter and kitchen right) set out
  // on the ceiling beams, which cross every 5.2 ft; the pot's corner and its slate; then the store behind a partition.
  const A = arch(kit, lot, K);
  const BAY = 5.2, B0 = 8.4;                                     // the beams are at 3.2 + 5.2 n: a booth division stands under each of five
  const CE = W - 7.6;                                            // the counter's customer edge (a); the stools and the walk in are left of it
  const C0 = B0 - 0.4, C1 = B0 + 4 * BAY + 0.4, M = (C0 + C1) / 2;   // the counter runs C0..C1 down the room; M is its middle
  const CD = 2.0, BD = 2.5;                                      // how deep the counter is, and the kitchen benches on the right wall
  const AISLE = -(CD + (7.6 - CD - BD) / 2);                     // Kombu's aisle, in the counter's frame
  const PX = M + 2.0;                                            // the wok range
  const DW0 = 4.9, DW1 = 8.5;                                    // the doorway to the store, straight ahead of the walk in
  const PART = A.partition(D - 7.3, { trim: WAIN, openings: [{ a0: DW0, a1: DW1, z1: 7.6 }] }), PF = PART.front, PB = PART.back;
  const WH = 5.0, SHELF = 5.38, CUSH = 'leather#6e2a22', TUB = 'c#b08a5c/0.8', CROCK = 'c#5a3a26/0.3';

  // ---- THE WALLS: a dark boarded dado, a plate shelf over the booths, a picture rail round the room ---------------
  A.wainscot('left', 0.3, PF - 0.01, { h: WH, mat: WAIN });
  A.wainscot('right', 0.3, C0 - 0.1, { h: WH, mat: WAIN });
  A.wainscot({ d: PF, side: 'front' }, 0.22, DW0 - 0.38, { h: WH, mat: WAIN }); A.wainscot({ d: PF, side: 'front' }, DW1 + 0.38, W - 0.07, { h: WH, mat: WAIN });
  A.rail('left', 0.3, PF - 0.01, { z: SHELF, deep: 0.36, mat: WAIN });
  A.rail('left', 0.3, PF - 0.01, { z: 9.7, mat: WAIN }); A.rail({ d: PF, side: 'front' }, 0.07, W - 0.07, { z: 9.7, mat: WAIN });
  A.rail('right', 0.3, M - 3.42, { z: 9.7, mat: WAIN }); A.rail('right', M + 3.92, PF - 0.01, { z: 9.7, mat: WAIN });
  // three plates over each division between booths, standing on the shelf
  [['c#2f4668/0.25', 1], ['c#8fa69a/0.25', 2], ['c#8a2a1c/0.25', 3]].forEach(([rim, i]) => { const dv = B0 + i * BAY;
    for (const [dd, r] of [[-1.05, 0.38], [0, 0.48], [1.05, 0.38]]) {      // the coloured rim is a ring round the white well, so nothing lies behind the well
      K.put(R, kit.geom.xf(kit.geom.lathe([[r * 0.66, 0], [r, 0], [r, 0.05], [r * 0.66, 0.05], [r * 0.66, 0]], { seg: 20 }), { ry: Math.PI / 2 }), rim, 0.165, dv + dd, SHELF + 0.004 + r);
      hcyl(R, PORC, 'x', 0.2, dv + dd, SHELF + 0.004 + r, 0.05, r * 0.66, r * 0.66, 20); } });

  // ---- THE BOOTHS: four, down the left wall; a table for two (four at a squeeze) and a low lantern in each ---------
  { const BW = 3.4, BH = 4.3;
    // One bench of a booth, its back to the division at dv, facing away from it (s: +1 toward the back of the room,
    // -1 toward the street). In its frame y runs out from the division's middle, x along the bench (mirrored with s).
    // A framed base on a recessed black plinth, a nosed seat board, a welted seat cushion, a padded back raked a
    // little, and at the aisle end a shaped end board as tall as the back, a coat hook on its outer face.
    const am = (0.24 + BW) / 2, A0 = 0.24, A1 = BW - 0.1;                    // the bench runs from the wall (A0) to its end board (A1..BW)
    const bench = (s, dv) => {
      const f = R.sub(am, dv, 0, s > 0 ? 0 : 2), lx = a => s * (a - am), X = (a0, a1) => [Math.min(lx(a0), lx(a1)), Math.max(lx(a0), lx(a1))];
      f.box('c#17140f/0.8', ...X(A0 + 0.06, A1 - 0.06), 0.12, 1.1, 0, 0.32);                                                    // the toe recess
      f.box(WAIN, ...X(A0, A1), 0.12, 1.2, 0.32, 1.18, G);                                                                   // the carcass, its face the panels
      f.bev(WAIN, ...X(A0, A1), 1.2, 1.26, 0.32, 0.48, 0.012, G); f.bev(WAIN, ...X(A0, A1), 1.2, 1.26, 1.02, 1.18, 0.012, G);    // rails
      for (const a of [A0, (A0 + A1) / 2 - 0.09, A1 - 0.18]) f.bev(WAIN, ...X(a, a + 0.18), 1.2, 1.26, 0.48, 1.02, 0.012, G);      // stiles
      f.bev(WAIN, ...X(A0, A1), 0.12, 1.34, 1.18, 1.27, 0.025, G);                                                            // the seat board, nosed
      f.cushion(CUSH, ...X(A0 + 0.04, A1 - 0.04), 0.34, 1.42, 1.27, 1.53, 0.07, { crown: 0.02, welt: 0.008, n: [3, 2, 1], noBottom: true });
      f.cushion(CUSH, ...X(A0 + 0.06, A1 - 0.06), 0.3, 0.52, 1.5, 3.72, 0.08, { lean: -0.07, crown: 0, welt: 0.008, n: [3, 1, 3] });     // the back, raked
      const end = [[0.12, 0], [1.46, 0], [1.46, 1.86], [1.41, 1.99], [1.3, 2.05], [0.88, 2.07], [0.64, 2.2], [0.5, 2.6], [0.44, 3.78], [0.39, 3.91], [0.27, 3.97], [0.12, 3.97]];
      kit.put(f, WAIN, kit.geom.extrude(end, 0, 0.1, { bevel: 0.015 }), { rz: Math.PI / 2, at: [X(A1, BW)[1], 0, 0] });
      tube(f, BRASS, [[lx(BW), 0.3, 3.5], [lx(BW + 0.14), 0.3, 3.52], [lx(BW + 0.21), 0.3, 3.61], [lx(BW + 0.2), 0.3, 3.7]], 0.017, 5);    // the coat hook, and its short lower prong
      tube(f, BRASS, [[lx(BW), 0.3, 3.44], [lx(BW + 0.09), 0.3, 3.39], [lx(BW + 0.13), 0.3, 3.31], [lx(BW + 0.13), 0.3, 3.26]], 0.013, 5);
      hcyl(f, BRASS, 'x', lx(BW + 0.012), 0.3, 3.47, 0.024, 0.05, 0.05, 10);
    };
    for (let i = 0; i <= 4; i++) { const dv = B0 + i * BAY;
      R.box(WAIN, 0.22, BW, dv - 0.1, dv + 0.1, 0, BH, G); R.box(WAIN, 0.22, BW + 0.06, dv - 0.15, dv + 0.15, BH, BH + 0.09, G);
      for (const s of [-1, 1]) { if ((s < 0 && i === 0) || (s > 0 && i === 4)) continue;
        bench(s, dv);
        const sf = s > 0 ? R.sub(0, dv + 0.8, 0, 0) : at(0, dv - 0.8, 0, 'street');
        for (const a of [1.15, 2.45]) kit.seat(sf, s > 0 ? a : -a, 0, 1.55, 'sit in the booth'); } }
    for (let i = 0; i < 4; i++) { const tc = B0 + (i + 0.5) * BAY;
      R.bev(OAK, 0.26, 3.1, tc - 1.0, tc + 1.0, 2.42, 2.54, 0.03, G);                // the top, its edges eased, well over its pedestal
      R.lathe(IRON, 1.68, tc, [[0, 0], [0.6, 0], [0.6, 0.03], [0.5, 0.08], [0.2, 0.15], [0.11, 0.24], [0.085, 0.34], [0.085, 2.16], [0.11, 2.24], [0.36, 2.33], [0.4, 2.36], [0.4, 2.42], [0, 2.42]], { seg: 16 });      // a cast pedestal on a round foot, a flange under the top
      R.cyl(LACQ, 0.62, tc - 0.28, 2.54, 2.94, 0.11, 0.13, 10); jar(R, 0.62, tc + 0.28, 2.54, 0.09, 0.2, 'c#b8361f/0.2', 0.7, 'c#17140f/0.45');
      X.pendant(R, 1.7, tc, { kind: 'paper', drop: 5.6, power: 0.45, halo: 0.6 }); kit.lamps[kit.lamps.length - 1].pilot = true; }      // (each lights its table: ../lighting.js lights every lamp of the room after dark; pilot: not under ?light=old)
    R.block(0, BW + 0.06, B0 - 0.15, B0 + 4 * BAY + 0.15, 0, BH); }

  // ---- THE COUNTER: down the room; stools to the left of it, the kitchen to the right ----------------------------
  const c = at(CE, 0, 0, 'left');                                // x = d (toward the back), +y = the customers' side
  const TOP = X.counter(c, C0, C1, -CD, 0, 3.4, { front: BLACK, top: OAK, overhang: 0.45, kick: 'c#17140f/0.8' });
  c.box(REDW, C0, C1, -0.02, 0.012, 3.12, 3.22);                                                      // a red line under the lip
  c.box(BRASS, C0 + 0.3, C1 - 0.3, 0.3, 0.36, 0.62, 0.68); for (let i = 0; i <= 4; i++) { const x = C0 + 0.5 + i * (C1 - C0 - 1) / 4; c.box(BRASS, x - 0.03, x + 0.03, 0, 0.33, 0.6, 0.66); }      // the foot rail
  for (let i = 0; i < 6; i++) X.stool(c.sub(M + (i - 2.5) * 2.6, 1.02, 0, 2), 0, 0, 2.35, { label: 'sit at the counter', mat: REDW });      // turned about: whoever sits faces the kitchen
  // the counter turns to the wall at each end; at the back, a flap by the wall is the way in
  // (each end panelled on the face the room sees, as the counter's front is; its top butts against the counter's top)
  for (const [d0, d1, a1, o] of [[C0, C0 + 1.8, W - 0.02, -1], [C1 - 1.8, C1, W - 2.7, 1]]) {
    const dF = o < 0 ? d0 : d1, dd = (p, q) => [Math.min(dF - o * p, dF - o * q), Math.max(dF - o * p, dF - o * q)];
    R.box('c#17140f/0.8', CE + CD, a1, ...(o < 0 ? [d0 + 0.12, d1 - 0.06] : [d0 + 0.06, d1 - 0.12]), 0, 0.3); R.box(BLACK, CE + CD, a1, ...(o < 0 ? [d0 + 0.06, d1] : [d0, d1 - 0.06]), 0.3, 3.3, G);
    const n = Math.max(1, Math.round((a1 - CE - CD) / 2.2)), w = (a1 - CE - CD) / n;
    for (let i = 0; i < n; i++) { const p = CE + CD + i * w + 0.18, q = CE + CD + (i + 1) * w - 0.18;
      R.box(BLACK, p, q, ...dd(0.02, 0.06), 0.55, 0.75, G); R.box(BLACK, p, q, ...dd(0.02, 0.06), 2.85, 3.05, G); R.box(BLACK, p, p + 0.2, ...dd(0.02, 0.06), 0.75, 2.85, G); R.box(BLACK, q - 0.2, q, ...dd(0.02, 0.06), 0.75, 2.85, G); }
    R.box(OAK, CE + CD + 0.04, a1, d0 - 0.08, d1 + 0.08, 3.3, 3.4, G); R.block(CE + CD, a1, d0, d1, 0, 3.4);
  }
  R.box(OAK, W - 2.69, W - 0.07, C1 - 1.5, C1 - 0.3, 3.3, 3.38, G); R.block(W - 2.7, W, C1 - 1.8, C1, 0, 3.4);
  // on the customers' side: chopsticks and chilli oil in two places, and the rest of the counter left clear
  for (const x of [M - 2.6, M + 2.6]) {
    c.cyl(LACQ, x - 0.2, -0.82, TOP, TOP + 0.42, 0.11, 0.13, 10); for (let i = 0; i < 7; i++) { const a = i * 0.9, dx = Math.cos(a) * 0.06, dy = Math.sin(a) * 0.06; tube(c, i % 3 ? 'c#b08a5a/0.8' : 'c#3a2214/0.8', [[x - 0.2 + dx * 0.4, -0.82 + dy * 0.4, TOP + 0.05], [x - 0.2 + dx * 1.5, -0.82 + dy * 1.5, TOP + 0.85]], 0.012, 4); }
    jar(c, x + 0.16, -0.86, TOP, 0.09, 0.2, 'c#b8361f/0.2', 0.7, 'c#17140f/0.45');
  }
  lot.pickup = { xz: kit.world(c, M, -0.55), y: FLH + TOP };       // where a finished bowl is set down
  // bowls stacked on Kombu's side, within reach of the boiler
  for (const [x, n, col] of [[M - 0.9, 6, LACQ], [M - 0.1, 4, PORC]]) for (let i = 0; i < n; i++) bowl(c, x, -1.5, TOP + i * 0.075, 0.33, 0.24, col, 14);
  // the till, at the street end
  { const x = C0 + 1.3, y = -1.1, z = TOP;
    X.till(c, x, y, z, { body: 'c#17140f/0.2', trim: 'c#b08d4a/0.35/1', ledge: 'c#8a1c1c/0.45', accent: 'c#b8361f/0.45', keys: ['c#e8e2d4/0.45', 'c#e8e2d4/0.45'] }); }      // keys toward the kitchen (-y)

  // ---- THE KITCHEN: along the right wall, between the counter's two ends; the tile runs on to the pot's corner ----
  const k = at(W, 0, 0, 'left');                                 // x = d, y = feet out from the right wall
  k.box('tile_subway', C0 + 1.8, PF - 0.02, 0.012, 0.075, 0, 7.4);
  const bench = (x0, x1, h = 3.0) => { k.box('c#9a9590/0.45/1', x0 + 0.03, x1 - 0.03, 0.06, BD - 0.08, 0.25, h - 0.08); k.box(CHROME, x0, x1, 0.055, BD, h - 0.08, h); for (const x of [x0 + 0.08, x1 - 0.08]) k.box(STEEL, x - 0.05, x + 0.05, BD - 0.2, BD - 0.1, 0, 0.25); };
  // prep: a board, scallions half cut
  { const x0 = M - 7.4, z = 3.0; bench(x0, x0 + 3.6);
    k.box(OAK, x0 + 1.1, x0 + 2.5, 1.1, 2.0, z, z + 0.07, G);
    for (let i = 0; i < 4; i++) { tube(k, i % 2 ? GREEN : LEAFY, [[x0 + 1.25, 1.3 + i * 0.07, z + 0.1], [x0 + 1.9, 1.35 + i * 0.07, z + 0.1]], 0.022, 5); tube(k, WHITE, [[x0 + 1.9, 1.35 + i * 0.07, z + 0.1], [x0 + 2.2, 1.37 + i * 0.07, z + 0.1]], 0.024, 5); }
    for (let i = 0; i < 12; i++) k.cyl(GREEN, x0 + 2.15 + (i % 4) * 0.06, 1.75 + Math.floor(i / 4) * 0.06, z + 0.07, z + 0.085, 0.022, 0.022, 5); }
  // the noodle boiler, six baskets
  const BX = M - 3.2;
  { const z = 3.0; bench(BX, BX + 2.8); k.box('c#9fb0a4/0.2', BX + 0.2, BX + 2.6, 0.3, 2.2, z, z + 0.012); k.box(STEEL, BX + 0.15, BX + 2.65, 0.07, 0.25, z, z + 0.5);
    for (let i = 0; i < 6; i++) { const x = BX + 0.62 + (i % 3) * 0.78, y = 0.75 + Math.floor(i / 3) * 0.95; ves(k, CHROME, x, y, z - 0.1, [[0.2, 0], [0.26, 0.32], [0.28, 0.34], [0.26, 0.36], [0.18, 0.02]], 10); if (i % 2 === 0) for (const rr of [0.1, 0.17]) ring(k, x, y, z + 0.08 + rr * 0.3, rr, 0.02); tube(k, 'c#8a5a2a/0.8', [[x, y + 0.26, z + 0.25], [x, y + 0.55, z + 0.5], [x, y + 0.9, z + 0.55]], 0.025, 5); }
    tube(k, CHROME, [[BX + 2.3, 0.16, z + 0.5], [BX + 2.3, 0.16, z + 1.1], [BX + 2.3, 0.5, z + 1.2], [BX + 2.3, 0.62, z + 1.0]], 0.035, 6);
    for (const [dx, y] of [[0.8, 1.0], [2.1, 0.9]]) steam(k, BX + dx, y, z + 0.5); }
  // the range: a wok, and the gyoza pan under its wooden lid
  { const x = PX, z = 2.9; k.box(IRON, x - 1.6, x + 1.6, 0.09, BD, 0, z); for (const dx of [-0.8, 0.8]) { k.cyl('c#17140f/0.8', x + dx, 1.3, z, z + 0.06, 0.5, 0.5, 14); k.cyl(BRASS, x + dx, BD + 0.02, 2.3, 2.5, 0.07, 0.07, 8); }
    ves(k, 'c#1f1c1a/0.4/1', x - 0.8, 1.3, z + 0.04, [[0, 0], [0.3, 0.03], [0.58, 0.18], [0.76, 0.42], [0.72, 0.42], [0.55, 0.2], [0.28, 0.07], [0, 0.05]], 18);
    tube(k, 'c#8a5a2a/0.8', [[x - 0.8, 2.02, z + 0.44], [x - 0.8, 2.75, z + 0.58]], 0.04, 6);
    k.cyl('c#1f1c1a/0.4/1', x + 0.8, 1.3, z + 0.06, z + 0.24, 0.62, 0.66, 18); k.cyl(OAK, x + 0.8, 1.3, z + 0.24, z + 0.3, 0.6, 0.6, 18); k.box(OAK, x + 0.5, x + 1.1, 1.24, 1.36, z + 0.3, z + 0.37, G);
    steam(k, x + 0.8, 1.3, z + 0.5); }
  // the sink, and a cloth on the rail
  { const x0 = M + 4.4; bench(x0, x0 + 2.6); k.box('c#5a5a56/0.45/1', x0 + 0.5, x0 + 2.1, 0.5, 2.0, 3.0, 3.012); tube(k, CHROME, [[x0 + 1.3, 0.25, 3.0], [x0 + 1.3, 0.25, 3.9], [x0 + 1.3, 0.7, 4.0], [x0 + 1.3, 0.85, 3.75]], 0.04, 6);
    K.towel(k, x0 + 0.4, x0 + 0.9, BD + 0.02, 2.9, 0.9, 'c#f4f1ea/0.8', 'c#b8361f/0.8'); }
  // the hood over the boiler and the range; the menu hangs along its face, and the ladles on the wall under it
  { const H0 = BX - 0.2, H1 = PX + 1.9, HD = BD + 0.5, HM = (H0 + H1) / 2;
    k.box(STEEL, H0, H1, 0.055, HD, 7.4, 9.45); k.box('c#9a9590/0.45/1', HM - 1.4, HM + 1.4, 0.3, 2.3, 9.45, lot.H - 0.02);
    const hf = at(W - HD, 0, 0, 'left');
    MENU.forEach(([n, p], i) => { const x = HM + ((MENU.length - 1) / 2 - i) * 1.7; hf.box('c#8a5a2a/0.8', x - 0.76, x + 0.76, 0.006, 0.035, 7.48, 9.36); kit.sign(hf, x, 0.04, 8.42, 1.5, 1.86, TABLET(n, p, 3 + i), { cw: 210, ch: 260 }); });
    tube(k, BRASS, [[BX + 0.2, 0.14, 6.5], [BX + 2.6, 0.14, 6.5]], 0.025, 5); for (const x of [BX + 0.2, BX + 2.6]) k.box(BRASS, x - 0.02, x + 0.02, 0.05, 0.16, 6.48, 6.64);
    ladle(k, BX + 0.6, 0.14, 6.5, 1.0); ladle(k, BX + 1.1, 0.14, 6.5, 1.15); strainer(k, BX + 1.7, 0.14, 6.5, 0.7); strainer(k, BX + 2.3, 0.14, 6.5, 0.8);
  }

  // ---- THE FRONT: an umbrella stand and a coat stand left of the door; right of it the waiting bench in the window --
  { const ua = lot.doorA > W / 2 ? W - 1.1 : 1.1, pa = lot.doorA > W / 2 ? 1.8 : W - 1.8;
    kit.umbrellaStand(R, ua, 1.1, {}); R.block(ua - 0.4, ua + 0.4, 0.7, 1.5, 0, 2.6);
    kit.model('st_coat_stand_2', R, 1.45, 6.6, 0, 0, {}); R.block(0.9, 2.0, 6.05, 7.15, 0, 5.7);
    kit.pottedPlant(R, pa, 1.9, 0, 'snake', { size: 2.2, pot: 'c#2a2320/0.6' }); R.block(pa - 0.7, pa + 0.7, 1.2, 2.6, 0, 3);
    const b0 = CE - 1.6, b1 = pa - 1.5;
    R.box(WAIN, b0, b1, 0.45, 1.8, 1.4, 1.52, G); R.box(WAIN, b0 + 0.3, b1 - 0.3, 1.05, 1.2, 0.5, 0.8, G);
    for (const a of [b0 + 0.3, b1 - 0.42]) R.box(WAIN, a, a + 0.12, 0.55, 1.7, 0, 1.4, G);
    R.block(b0, b1, 0.45, 1.8, 0, 1.52); for (const a of [b0 + 1.4, b1 - 1.4]) kit.seat(R, a, 1.15, 1.52, 'sit and wait'); }

  // ---- THE END OF THE ROOM: the pot in its corner, its slate over the crates, a bench by the store's doorway -------
  // THE POT, on its low burner, where Kombu passes it every time the flap is lifted
  { const x = PF - 1.78; k.box(IRON, x - 1.6, x + 1.6, 0.09, BD, 0, 1.95); k.box('c#17140f/0.8', x - 1.2, x + 1.2, BD, BD + 0.02, 0.5, 1.1); k.cyl('c#17140f/0.8', x, 1.3, 1.95, 2.02, 0.7, 0.7, 14); k.cyl(BRASS, x, BD + 0.02, 1.3, 1.5, 0.07, 0.07, 8);
    ves(k, STEEL, x, 1.3, 2.02, [[0, 0], [0.86, 0], [0.86, 2.0], [0.92, 2.0], [0.92, 2.06], [0.8, 2.06], [0.8, 0.1], [0, 0.1]], 24);
    for (const s of [-1, 1]) { k.box(STEEL, x + s * 0.86 - 0.04, x + s * 0.86 + 0.04, 1.12, 1.48, 3.7, 3.76); for (const y of [1.12, 1.44]) k.box(STEEL, x + s * 0.9 - 0.08, x + s * 0.9 + 0.08, y, y + 0.04, 3.7, 3.76); }
    k.cyl('c#d9cdb2/0.2', x, 1.3, 3.8, 3.84, 0.8, 0.8, 22); k.box(NORI, x - 0.5, x - 0.05, 0.95, 1.3, 3.84, 3.852);
    tube(k, STEEL, [[x - 0.2, 1.2, 3.84], [x - 0.75, 0.6, 4.94], [x - 0.8, 0.55, 5.09]], 0.022, 5);                      // the ladle, left in
    for (const [dx, dy] of [[-0.3, -0.2], [0.3, 0.1], [0, 0.35]]) steam(k, x + dx, 1.3 + dy, 4.25);
    tube(k, BRASS, [[x - 0.7, 0.14, 6.9], [x + 0.7, 0.14, 6.9]], 0.025, 5); for (const xx of [x - 0.7, x + 0.7]) k.box(BRASS, xx - 0.02, xx + 0.02, 0.05, 0.16, 6.88, 7.04);
    ladle(k, x - 0.3, 0.14, 6.9, 1.2); strainer(k, x + 0.3, 0.14, 6.9, 0.8);
    k.block(x - 1.6, x + 1.6, 0, BD, 0, 4.1);
    lot.pot = { xz: kit.world(k, x, 1.3), y: FLH + 4.0 }; }
  // the slate, on the partition beside the pot, and under it the day's greens in their crates
  const SA = 12.0;
  { const b = at(SA, PF, 0, 'street'); b.box(WAIN, -2.75, 2.75, 0.012, 0.07, 5.5, 8.8, G); lot.slate = { xz: lot.world(SA, PF - 0.085), y: FLH + 7.15, w: 5.26, h: 3.06 };
    const CAB = 'c#a9c27c/0.7', crate = (x, z) => X.crate(b, x, 1.0, z, 1.6, 1.3, 0.9, 'oak_light#b89466');
    for (const x of [-1.75, 0, 1.75]) crate(x, 0); for (const x of [-0.875, 0.875]) crate(x, 0.9);
    for (const x of [-1.75, 1.75]) for (let i = 0; i < 4; i++) ball(b, i % 2 ? CAB : 'c#8fb06a/0.7', x - 0.36 + (i % 2) * 0.72, 0.7 + Math.floor(i / 2) * 0.6, 0.36, 0.32, 10, 0.9);      // cabbages
    for (let i = 0; i < 5; i++) { hcyl(b, WHITE, 'x', 0.1, 0.55 + i * 0.22, 0.62 + (i % 2) * 0.12, 1.2, 0.1, 0.05, 8); ball(b, LEAFY, -0.62, 0.55 + i * 0.22, 0.56 + (i % 2) * 0.12, 0.13, 6); }                 // daikon
    for (let i = 0; i < 6; i++) { const x = -0.875 - 0.48 + (i % 3) * 0.48, y = 0.7 + Math.floor(i / 3) * 0.6; ball(b, WHITE, x, y, 1.3, 0.13, 8, 1.3); ball(b, i % 2 ? LEAFY : GREEN, x, y, 1.5, 0.25, 8, 0.85); }      // bok choy
    for (let i = 0; i < 12; i++) { const y = 0.62 + (i % 6) * 0.15, z = 1.52 + Math.floor(i / 6) * 0.1; tube(b, i % 2 ? GREEN : LEAFY, [[0.875 - 0.2, y, z], [0.875 + 0.66, y + 0.03, z + 0.04]], 0.03, 5); tube(b, WHITE, [[0.875 - 0.66, y, z], [0.875 - 0.2, y, z]], 0.032, 5); }      // scallions
    b.block(-2.6, 2.6, 0.2, 1.7, 0, 1.9); }
  // the bench by the doorway, under a row of hooks, and the one picture in the shop
  { const l = at(0, (B0 + 4 * BAY + 0.15 + PF) / 2, 0, 'right');                  // x toward the street, y out into the room
    for (let i = 0; i < 5; i++) tube(l, BRASS, [[-1.8 + i * 0.9, 0.08, 4.5], [-1.8 + i * 0.9, 0.32, 4.46], [-1.8 + i * 0.9, 0.36, 4.62]], 0.022, 5);
    l.box(WAIN, -2.2, 2.2, 0.22, 1.3, 1.42, 1.52, G); for (const x of [-2.1, 2.1]) l.box(WAIN, x - 0.05, x + 0.05, 1.1, 1.2, 0, 1.42, G); l.block(-2.2, 2.2, 0, 1.3, 0, 1.52);
    for (const x of [-1.0, 1.0]) kit.seat(l, x, 0.75, 1.52, 'sit on the bench');
    kit.picture(at((0.22 + DW0 - 0.38) / 2, PF, 0, 'street'), 'hiroshige_kameido_plum', 0, 7.35, 2.2, 3.2, { frame: 'c#17140f/0.45', border: 0.09, mat: 0.18 }); }
  // the noren in the doorway: four short indigo panels on a rod, a ring across the middle two
  { const z0 = 5.75, z1 = 7.54, mid = (DW0 + DW1) / 2, pw = (DW1 - DW0 - 0.16) / 4;
    hcyl(R, DARK, 'x', mid, PF - 0.16, 7.5, DW1 - DW0 + 0.6, 0.04, 0.04, 8); for (const a of [DW0 - 0.2, DW1 + 0.2]) R.box(IRON, a - 0.03, a + 0.03, PF - 0.21, PF - 0.065, 7.45, 7.55);
    for (let i = 0; i < 4; i++) { const a = mid + (i - 1.5) * (pw + 0.03); R.box(INDIGO, a - pw / 2, a + pw / 2, PF - 0.175, PF - 0.145, z0, z1);
      kit.sign(at(a, PF - 0.175, 0, 'street'), 0, 0.004, (z0 + z1) / 2, pw, z1 - z0, NOREN(i === 1 ? 1 : i === 2 ? -1 : 0), { cw: 86, ch: 178, rough: 0.95 }); } }

  // ---- THE STORE, behind the partition: bowls to the ceiling, the miso tubs, flour, the back window and door --------
  { const s = at(0.08, (PB + D) / 2, 0, 'right'), zs = [1.5, 3.1, 4.7, 6.3, 7.9];
    X.shelving(s, -3.0, 3.0, zs, { d: 1.25, mat: WAIN, back: false }); s.box(WAIN, -3.0, 3.0, 0.1, 0.16, 0, Math.max(...zs) + 1.3, G);      // (its own back, set clear of the shelves' back edges)
    zs.slice(0, 4).forEach((z, j) => { for (let i = 0; i < 8; i++) { const x = (i < 4 ? -2.58 : 0.42) + (i % 4) * 0.72, n = 4 + (i * 3 + j * 2) % 5; for (let m = 0; m < n; m++) bowl(s, x, 0.65, z + m * 0.075, 0.33, 0.24, [LACQ, PORC, 'c#8a2a1c/0.25', PORC][(j + (i < 4 ? 0 : 1)) % 4], 10); } });
    for (const x of [-2.2, -0.75, 0.75, 2.2]) { ves(s, CROCK, x, 0.66, 0, [[0, 0], [0.38, 0], [0.5, 0.3], [0.5, 0.8], [0.36, 1.0], [0.3, 1.0], [0, 1.0]], 16); s.cyl('c#3a2618/0.4', x, 0.66, 1.0, 1.05, 0.33, 0.33, 14); }
    for (const x of [-1.9, 0, 1.9]) ves(s, x ? 'c#2f4668/0.25' : CROCK, x, 0.62, 7.9, [[0, 0], [0.3, 0], [0.42, 0.25], [0.42, 0.6], [0.26, 0.82], [0.2, 0.82], [0.2, 0.9], [0, 0.9]], 16); }
  for (const x of [PB + 1.35, PB + 3.5]) { const r = z => 0.78 + 0.085 * z;                 // the miso tubs, hooped
    ves(k, TUB, x, 1.2, 0, [[0, 0], [r(0), 0], [r(2), 2.0], [r(2) - 0.06, 2.0], [r(2) - 0.07, 1.9], [0, 1.9]], 22);
    for (const z of [0.3, 1.45]) k.cyl('c#3a2c24/0.8', x, 1.2, z, z + 0.12, r(z) + 0.014, r(z + 0.12) + 0.014, 22);
    k.box('c#8a6a44/0.8', x - 0.6, x + 0.6, 1.14, 1.26, 1.9, 1.96, G); ball(k, 'c#8d8a84/0.9', x + 0.1, 1.2, 1.96, 0.3, 9, 0.6);      // a batten across the lid, and the stone that keeps it down
    k.block(x - 0.95, x + 0.95, 0.2, 2.2, 0, 2.0); }
  { const x0 = PB + 0.4, x1 = D - 3.0, z = 5.6;                                              // soy, in the big bottles, on a shelf over the tubs
    k.box(WAIN, x0, x1, 0.07, 0.75, z - 0.08, z, G); for (const x of [x0 + 0.4, (x0 + x1) / 2, x1 - 0.4]) k.box(WAIN, x - 0.04, x + 0.04, 0.07, 0.6, z - 0.5, z - 0.08, G);
    for (let i = 0; i < 7; i++) { const x = x0 + 0.5 + i * 0.52; if (i === 4) continue; k.cyl('c#1f1612/0.15', x, 0.42, z, z + 0.22, 0.17, 0.17, 12); k.cyl('c#1f1612/0.15', x, 0.42, z + 0.6, z + 0.78, 0.17, 0.17, 12); k.cyl('c#1f1612/0.15', x, 0.42, z + 0.78, z + 1.0, 0.17, 0.06, 12); k.cyl('c#1f1612/0.15', x, 0.42, z + 1.0, z + 1.22, 0.06, 0.06, 8); k.cyl('c#b8361f/0.5', x, 0.42, z + 1.22, z + 1.28, 0.07, 0.07, 8); k.cyl('c#efe6d0/0.8', x, 0.42, z + 0.22, z + 0.6, 0.174, 0.174, 12); } }
  { const SACK = 'linen#d6c6a4', a0 = W - 2.65, d0 = D - 2.15;                                // flour, in the corner past the door (clear of the way out)
    R.soft(SACK, a0, a0 + 2.4, d0, d0 + 1.6, 0.004, 0.56, 0.2); R.soft(SACK, a0 + 0.12, a0 + 2.5, d0 + 0.1, d0 + 1.7, 0.54, 1.1, 0.2); R.soft(SACK, a0 + 0.02, a0 + 2.36, d0 + 0.04, d0 + 1.62, 1.08, 1.62, 0.2);
    R.block(a0, a0 + 2.5, d0, d0 + 1.7, 0, 1.7); }
  // the noodle table under the back window: the board floured, the morning's noodles in nests, the pin
  { const ta = 0.26 * (W + 1) - 0.5 + 0.3, td = D - 1.3, z = 3.0; X.plinth(R, ta, td, 5.2, 2.0, z, { mat: WAIN, top: OAK, shelf: 0.9 });
    R.box('c#efe9dc/0.95', ta - 2.2, ta + 0.9, td - 0.8, td + 0.8, z, z + 0.012);
    for (let i = 0; i < 8; i++) { const x = ta - 1.85 + (i % 4) * 0.52, y = td - 0.3 + Math.floor(i / 4) * 0.56; for (const [rr, dz] of [[0.17, 0.03], [0.11, 0.055], [0.06, 0.075]]) ring(R, x, y, z + dz, rr, 0.026); }
    hcyl(R, OAK, 'x', ta - 0.6, td - 0.62, z + 0.085, 2.0, 0.07, 0.07, 10); bowl(R, ta + 1.7, td + 0.1, z, 0.45, 0.32, PORC, 16); R.cyl('c#efe9dc/0.95', ta + 1.7, td + 0.1, z + 0.2, z + 0.26, 0.36, 0.36, 14); }
  // the back door, where the real one is (town.js cuts the doorway, 3.1 wide and 6.95 high, and hangs the door: here, its casing), and the back window behind a paper screen
  { const b = at(0.74 * (W + 1) - 0.5, D, 0, 'street');
    for (const x of [-1.7, 1.7]) b.box(WAIN, x - 0.15, x + 0.15, 0.012, 0.11, 0, 6.95, G); b.box(WAIN, -1.95, 1.95, 0.012, 0.13, 6.95, 7.3, G); }
  { const w = at(0.26 * (W + 1) - 0.5, D, 0, 'street'), z0 = 4.6, z1 = 8.6;
    w.box(WAIN, -1.7, 1.7, 0.012, 0.055, z0 - 0.15, z1 + 0.15); w.box('c#efe6d0/0.9', -1.5, 1.5, 0.05, 0.075, z0, z1);
    for (const x of [-1.6, 1.6]) w.box(WAIN, x - 0.1, x + 0.1, 0.055, 0.11, z0 - 0.15, z1 + 0.15, G); for (const z of [z0 - 0.075, z1 + 0.075]) w.box(WAIN, -1.5, 1.5, 0.055, 0.11, z - 0.075, z + 0.075, G);
    for (const x of [-0.75, 0, 0.75]) w.box(WAIN, x - 0.03, x + 0.03, 0.075, 0.1, z0, z1, G); for (let i = 1; i < 5; i++) w.box(WAIN, -1.5, 1.5, 0.076, 0.096, z0 + i * 0.8 - 0.025, z0 + i * 0.8 + 0.025, G); }

  // ---- lanterns: over the counter and over each booth, bay by bay; one at the end of the room; bulbs front and store --
  for (let i = 0; i < 4; i++) X.pendant(R, CE - 0.6, B0 + (i + 0.5) * BAY, { kind: 'paper', drop: 3.5, power: 1.0 });
  X.pendant(R, 9.6, (C1 + PF) / 2 + 0.1, { kind: 'paper', drop: 3.5, power: 0.9 });
  X.pendant(R, W / 2, 5.5, { kind: 'bulb', drop: 4.2, power: 0.7 });
  X.pendant(R, W / 2, (PB + D) / 2 - 0.4, { kind: 'bulb', drop: 3.8, power: 0.7 });

  // ---- OUTSIDE: a plain indigo noren over the door, and the board ------------------------------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));           // x = a along the frontage, y = -feet out from the shopfront
  { const A = lot.doorA, z0 = 7.0, z1 = 8.72;
    hcyl(o, DARK, 'x', A, -0.225, z1 + 0.04, 3.9, 0.04, 0.04, 8); for (const s of [-1, 1]) o.box(IRON, A + s * 1.9 - 0.03, A + s * 1.9 + 0.03, -0.26, -0.02, z1, z1 + 0.08);
    for (let i = 0; i < 4; i++) { const a = A - 1.29 + i * 0.86; o.box(INDIGO, a - 0.41, a + 0.41, -0.24, -0.21, z0, z1); } }
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + (lot.doorA > W / 2 ? -4.4 : 4.4), 5.4, 0, 'left')), 0, 0, BOARD);

  // ---- things that move: the pot's slate, and the pot ------------------------------------------------------------------
  kit.later.push(ctx => {
    const T3 = ctx.THREE ?? THREE, { scene } = ctx;
    { const cv = document.createElement('canvas'); cv.width = 440; cv.height = 256; const tex = new T3.CanvasTexture(cv); tex.colorSpace = T3.SRGBColorSpace; tex.anisotropy = 4;
      const mesh = new T3.Mesh(new T3.PlaneGeometry(lot.slate.w, lot.slate.h), new T3.MeshStandardMaterial({ map: tex, roughness: 0.95, envMapIntensity: 0.15 }));
      mesh.position.set(lot.slate.xz[0], lot.slate.y, lot.slate.xz[1]); mesh.rotation.y = Math.PI / 2; scene.add(mesh);
      let last = -1; const draw = () => { const hr = ctx.day?.hour ?? 18, mn = Math.floor(hr * 60); if (mn === last) return; last = mn; POTCLOCK(hr)(cv.getContext('2d'), cv.width, cv.height); tex.needsUpdate = true; };
      draw(); ctx.animated?.push(draw); }
    { const said = ['The pot says nothing. It is concentrating.', '"Blup."', 'The pot heard you. Kombu nods, once.']; let n = 0;
      ctx.interact?.push({ x: lot.pot.xz[0], y: lot.pot.y, z: lot.pot.xz[1], reach: 9, size: 0.9, label: () => 'say hello to the pot', act: () => { ctx.flash?.(said[n++ % said.length]); ctx.sound?.note?.(38, 0, 0.25, 0.07); } }); }
  });

  // ---- Kombu ---------------------------------------------------------------------------------------------------------
  const behind = x => kit.world(c, x, AISLE);                    // the aisle between the counter and the benches
  kit.clerks.push({
    id: 'kombu', name: 'Kombu', lot: 'noodles', look: { shape: 'round', colour: '#2a2320', belly: '#f1ebdd', trim: '#c8402f', hat: 'beanie', hatColour: '#f1ebdd', apron: '#8a1c1c', eye: '#ffd9a0', ring: 0xffb07a, tool: 'ladle', hover: 5.0 },
    home: behind(M), faces: kit.world(c, M, 8), posts: [behind(M - 5.6), behind(M + 5.7), behind(M)],
    serve: { machine: behind(BX + 1.4), pickup: lot.pickup,
      food: {
        'shoyu ramen': { build: T3 => plateUp(T3, 'shoyu'), bites: 5, note: 'You finish the shoyu ramen, broth and all.' },
        'miso and corn ramen': { build: T3 => plateUp(T3, 'miso'), bites: 5, note: 'You finish the miso and corn. The butter was right.' },
        'gyoza': { build: T3 => plateUp(T3, 'gyoza'), bites: 6, note: 'Six gyoza, gone. Crisp one side, soft the other.' } },
      drinks: {
        'barley tea': { vessel: 'teacup', liquid: 0x9a6a2e, note: 'You finish the barley tea. Toasty.' } } },
    lines: {
      greet: ['Sit. Any stool. They are all the good one.', 'You came in. Good. The broth heard the door.'],
      idle: ['*lifts the lid, looks, puts it back*', '*to the pot* Nobody is rushing you.', '*straightens a bowl that was already straight*'],
      bye: ['Come back hungry.', 'Slurp louder next time.'],
      served: ['Eat it now. Noodles wait for no one.', 'Drink the broth. The broth is the point.'],
      topics: [
        { q: 'Shoyu ramen, please.', a: 'Shoyu. Fourteen hours in the pot, three minutes from you.', serve: 'shoyu ramen' },
        { q: 'What should I have?', a: 'Miso and corn. There is butter on top. The butter is not optional.', serve: 'miso and corn ramen' },
        { q: 'Six gyoza.', a: 'Six. Fried, then steamed under the lid.', serve: 'gyoza' },
        { q: 'Barley tea.', a: 'Roasted barley, nothing else. Refills are free.', serve: 'barley tea' },
        { q: 'Do you talk to the pot?', a: 'It has been here longer than you. It is polite to include it.' },
      ],
    },
  });
}
