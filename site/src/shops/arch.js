// The joinery of an old shop room, shared so that the shops agree with one another: a boarded dado, a rail
// round the walls, a partition across the room with cased openings (most of these buildings had a back room
// behind the shop), a chimney breast. Plain carpenter's work; the shop files do the rest.
//
//   import { arch } from './arch.js';
//   const A = arch(kit, lot, K);                 // K = tools(kit, seed)
//
// Everything is in the room's own feet: a across (0 at the left wall as you face the shop from the street,
// lot.W at the right), d back from the shop window (0 to lot.D), h above the floor (ceiling at 12).
//
// A wall is named 'left', 'right' or 'back', or is one face of a partition: { d, side: 'front' | 'back' }
// (the plane at depth d; 'front' is the face you see coming in from the street). Along a wall, s runs
// with d on the side walls and with a on the back wall and on partitions.
//
//   A.wainscot(wall, s0, s1, { h: 3.3, mat, style: 'bead' | 'panel' | 'plain', cap })
//       a boarded dado from the floor to h, with a base and a capping rail. Break it round doors and
//       fitted furniture by calling it once per stretch of bare wall.
//   A.rail(wall, s0, s1, { z: 9.5, mat, deep: 0.06, tall: 0.14 })
//       a picture rail (or, with deep: 0.35, a plate shelf).
//   A.partition(d, { th: 0.42, mat, trim, openings: [{ a0, a1, z0: 0, z1: 7.8, glass: false, bars: 0 }] })
//       a wall across the whole room at depth d, the full height, with openings cut in it: a doorway
//       (z0 = 0), a hatch or an internal window (z0 > 0; glass: true glazes it, bars: n gives it n upright
//       glazing bars). Each opening gets a painted casing on both faces. It stops the walker where it is
//       solid. Returns { front: d - th / 2, back: d + th / 2 }: put things against those faces.
//   A.breast(wall, s, { w: 5, out: 1.3, mat, hearth: [w, h] })
//       a chimney breast centred at s, the full height; with hearth, a dark fire opening in it.
//   A.R   the room frame (x = a, y = d, z = h), wrapped for the shared palette.
import { G } from '../kit.js';

export function arch(kit, lot, K) {
  const R = K.wrap(lot.fr(kit, 0, 0, 0, 'back')), W = lot.W, D = lot.D, H = 12;
  const TRIM = 'c#f1ead8/0.55', PLASTER = lot.inside && !lot.inside.startsWith('tile') ? lot.inside : 'plaster#ece6da';
  // a board lying against a wall: s0..s1 along it, t0..t1 out from it, z0..z1 up
  const on = (wall, mat, s0, s1, t0, t1, z0, z1, o) => {
    if (s1 - s0 < 0.02 || z1 - z0 < 0.005) return;
    if (wall === 'left') R.box(mat, t0, t1, s0, s1, z0, z1, o);
    else if (wall === 'right') R.box(mat, W - t1, W - t0, s0, s1, z0, z1, o);
    else if (wall === 'back') R.box(mat, s0, s1, D - t1, D - t0, z0, z1, o);
    else if (wall.side === 'back') R.box(mat, s0, s1, wall.d + t0, wall.d + t1, z0, z1, o);
    else R.box(mat, s0, s1, wall.d - t1, wall.d - t0, z0, z1, o);
  };

  function wainscot(wall, s0, s1, o = {}) {
    const h = o.h ?? 3.3, mat = o.mat ?? TRIM, style = o.style ?? 'bead';
    on(wall, mat, s0, s1, 0.004, 0.075, 0.004, h - 0.1, G);                                   // the boards
    on(wall, mat, s0, s1, 0.075, 0.125, 0.004, 0.62, G);                                      // the base
    on(wall, o.cap ?? mat, s0, s1, 0.004, 0.2, h - 0.1, h, G); on(wall, mat, s0, s1, 0.075, 0.14, h - 0.24, h - 0.1, G);      // the capping rail and a bed mould under it
    if (style === 'bead') { const n = Math.max(1, Math.round((s1 - s0) / 0.46)), w = (s1 - s0) / n; for (let i = 1; i < n; i++) on(wall, mat, s0 + i * w - 0.022, s0 + i * w + 0.022, 0.075, 0.092, 0.62, h - 0.24, G); }
    else if (style === 'panel') {
      const n = Math.max(1, Math.round((s1 - s0) / 2.6)), w = (s1 - s0) / n;
      for (let i = 0; i <= n; i++) { const c = s0 + i * w, a = Math.max(s0, c - 0.16), b = Math.min(s1, c + 0.16); on(wall, mat, a, b, 0.075, 0.105, 0.62, h - 0.24, G); }
      on(wall, mat, s0, s1, 0.075, 0.105, 0.62, 0.86, G); on(wall, mat, s0, s1, 0.075, 0.105, h - 0.5, h - 0.24, G);
    }
    return h;
  }

  function rail(wall, s0, s1, o = {}) {
    const z = o.z ?? 9.5, deep = o.deep ?? 0.06, tall = o.tall ?? 0.14, mat = o.mat ?? TRIM;
    on(wall, mat, s0, s1, 0.004, deep, z - tall, z, G);
    if (deep > 0.2) on(wall, mat, s0, s1, 0.004, 0.09, z - tall - 0.22, z - tall, G);
    return z;
  }

  function partition(d, o = {}) {
    const th = o.th ?? 0.42, mat = o.mat ?? PLASTER, trim = o.trim ?? TRIM, y0 = d - th / 2, y1 = d + th / 2;
    const ops = (o.openings ?? []).map(p => ({ z0: 0, z1: 7.8, ...p }));
    const as = [...new Set([0, W, ...ops.flatMap(p => [p.a0, p.a1])])].sort((p, q) => p - q), zs = [...new Set([0, H, ...ops.flatMap(p => [p.z0, p.z1])])].sort((p, q) => p - q);
    for (let i = 0; i < as.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
      const am = (as[i] + as[i + 1]) / 2, zm = (zs[j] + zs[j + 1]) / 2;
      if (ops.some(p => am > p.a0 && am < p.a1 && zm > p.z0 && zm < p.z1)) continue;
      R.box(mat, as[i], as[i + 1], y0, y1, zs[j], zs[j + 1]);
    }
    // what stops you: every stretch that is not a doorway
    for (let i = 0; i < as.length - 1; i++) { const am = (as[i] + as[i + 1]) / 2; if (!ops.some(p => p.z0 < 0.01 && am > p.a0 && am < p.a1)) R.block(as[i], as[i + 1], y0, y1, 0, H); }
    for (const p of ops) {
      const c = p.casing ?? 0.36, door = p.z0 < 0.01;
      // the lining of the opening, then a casing on each face
      R.box(trim, p.a0 - 0.02, p.a0 + 0.06, y0 - 0.03, y1 + 0.03, p.z0, p.z1, G); R.box(trim, p.a1 - 0.06, p.a1 + 0.02, y0 - 0.03, y1 + 0.03, p.z0, p.z1, G);
      R.box(trim, p.a0 - 0.02, p.a1 + 0.02, y0 - 0.03, y1 + 0.03, p.z1 - 0.06, p.z1 + 0.02, G);
      if (!door) R.box(trim, p.a0 - 0.1, p.a1 + 0.1, y0 - 0.16, y1 + 0.16, p.z0 - 0.09, p.z0 + 0.02, G);         // a sill, standing proud
      for (const [ya, yb] of [[y0 - 0.05, y0 - 0.004], [y1 + 0.004, y1 + 0.05]]) {
        R.box(trim, p.a0 - c, p.a0 - 0.02, ya, yb, door ? 0.004 : p.z0 - 0.09, p.z1 + c, G); R.box(trim, p.a1 + 0.02, p.a1 + c, ya, yb, door ? 0.004 : p.z0 - 0.09, p.z1 + c, G);
        R.box(trim, p.a0 - c - 0.06, p.a1 + c + 0.06, ya - 0.012, yb + 0.012, p.z1 + c, p.z1 + c + 0.1, G); R.box(trim, p.a0 - 0.02, p.a1 + 0.02, ya, yb, p.z1 + 0.02, p.z1 + c, G);
      }
      if (p.glass) {
        R.box('glass', p.a0 + 0.06, p.a1 - 0.06, d - 0.012, d + 0.012, p.z0 + 0.02, p.z1 - 0.06);
        for (let k = 1; k <= (p.bars ?? 0); k++) { const a = p.a0 + (p.a1 - p.a0) * k / (p.bars + 1); R.box(trim, a - 0.03, a + 0.03, d - 0.04, d + 0.04, p.z0 + 0.02, p.z1 - 0.06, G); }
        if (door) R.block(p.a0, p.a1, y0, y1, 0, H);
      }
    }
    return { front: y0, back: y1 };
  }

  function breast(wall, s, o = {}) {
    const w = o.w ?? 5, out = o.out ?? 1.3, mat = o.mat ?? PLASTER;
    on(wall, mat, s - w / 2, s + w / 2, 0.004, out, 0, H - 0.02);
    if (o.hearth) { const [hw, hh] = o.hearth; on(wall, 'c#17140f/0.9', s - hw / 2, s + hw / 2, out - 0.5, out + 0.006, 0.02, hh); on(wall, 'c#5a5a56/0.8', s - hw / 2 - 0.5, s + hw / 2 + 0.5, out, out + 1.3, 0.004, 0.09); }
    if (wall === 'left') R.block(0, out, s - w / 2, s + w / 2, 0, H); else if (wall === 'right') R.block(W - out, W, s - w / 2, s + w / 2, 0, H); else if (wall === 'back') R.block(s - w / 2, s + w / 2, D - out, D, 0, H);
    return out;
  }

  return { R, W, D, H, TRIM, PLASTER, on, wainscot, rail, partition, breast };
}
