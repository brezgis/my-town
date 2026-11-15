// Chairs, stools and benches with real joinery: bentwood café chairs, Windsors, low-backed
// captain's (library) chairs, office chairs, turned stools and wall benches. They join the kit
// through wood.js, so a room calls them as K.chair, K.stool and K.wallBench.
//
// Everything is round where the real thing is round: legs are turned (a lathe profile along a
// leaning axis, so they can splay), bent wood is a tapered tube swept along a smooth path, seats
// are saddled or crowned. Each piece is a few hundred to about 1,500 triangles, all merged into
// the batches of its materials, so a room of twenty chairs adds no draw calls.
//
// A chair stands at (x, y) of its frame with its seat's middle there and its front toward +y,
// like diningChair. Beyond the quarter turn dq, `turn` (radians, counter-clockwise seen from
// above) or `deg` turns it to any angle, for chairs pulled up round a table; the seat that
// visitors and robots sit on turns with it.

import { lathe, loft, sweep, bev, softBox, extrude, merge, TAU } from './geom.js';
import { fab, woodOf, OAK, IRON, CHROME } from './mats.js';

// A smooth path through control points (centripetal enough for chair parts: uniform
// Catmull-Rom), n points per span.
function curve(pts, n = 4) {
  const out = [], P = i => pts[Math.max(0, Math.min(pts.length - 1, i))];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1, 2].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
const mirrorX = p => [-p[0], p[1], p[2]];

// A turned leg from a (bottom) to b (top), possibly leaning: rings stay level, which at a chair's
// splay is indistinguishable from true. prof: [t along, radius factor].
const TURNED = [[0, 0.72], [0.03, 0.8], [0.07, 0.74], [0.4, 0.95], [0.47, 1.12], [0.51, 1.12], [0.55, 0.86], [0.6, 0.8], [0.9, 0.98], [1, 0.98]];
const TAPER = [[0, 0.75], [1, 1]];
function turned(a, b, r, prof = TURNED, seg = 8) {
  return loft(prof.map(([t, k]) => ({ a: r * k, b: r * k, x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, z: a[2] + (b[2] - a[2]) * t })), { seg, sv: 1 });
}
// A rod along a path, tapering r0 -> r1 (or swelling in the middle with swell > 0).
const rod = (path, r0, r1 = r0, seg = 6, swell = 0) => sweep(path, t => r0 + (r1 - r0) * t + swell * Math.sin(t * Math.PI), { seg });
const at = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// A saddle seat (Windsor, captain's, stool): a rounded slab, superelliptic in plan, its top
// dished toward the back and its front edge rolled. a, b: half width and half depth; zt: top.
function saddle(a, b, zt, t = 0.13, o = {}) {
  const yc = o.yc ?? 0, e = o.e ?? 2.5, dish = o.dish ?? 0.035;
  const rows = [
    { a: 0, b: 0, z: zt - t }, { a: a * 0.94, b: b * 0.94, z: zt - t }, { a: a, b: b, z: zt - t * 0.55 },
    { a: a, b: b, z: zt - 0.025 }, { a: a * 0.95, b: b * 0.95, z: zt }, { a: a * 0.62, b: b * 0.6, z: zt - dish * 0.7 }, { a: 0, b: 0, z: zt - dish },
  ].map(r => ({ ...r, y: yc }));
  // the seat's back is a little higher than its front (a sitter slides back into it)
  return loft(rows, { seg: o.seg ?? 20, e, lift: (th, j) => (j >= 3 ? 0.02 * -Math.sin(th) * (j === 6 ? 0 : 1) : 0), flat: false });
}

export function makeChairs(K, parts) {
  const { put } = K;
  const { diningChair } = parts;

  // Place a part built in the chair's own coordinates, turned by the chair's extra yaw.
  const placer = (s, turn) => (m, g) => put(s, m, g, turn ? { rz: turn } : undefined);
  const rot = (x, y, turn) => [x * Math.cos(turn) - y * Math.sin(turn), x * Math.sin(turn) + y * Math.cos(turn)];
  // Register the seat (eye 2.45 above it, looking the way the chair faces) and the obstacle.
  function finish(s, turn, o, seatZ, half = 0.72, label = 'sit') {
    if (o.sit !== false) { const [sx, sy] = rot(0, 0.1, turn); K.seat(s, sx, sy, seatZ, o.label ?? label); if (turn) K.seats[K.seats.length - 1].yaw += turn; }
    if (o.block !== false) s.block(-half, half, -half, half, 0, Math.max(1.6, seatZ + 0.1));
  }
  // Four splayed turned legs under a seat, joined by an H-stretcher (Windsor, captain's).
  function legs(P, m, top, foot, z0, r, o = {}) {
    const L = [];
    for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const a = [sx * foot[0], sy > 0 ? foot[1] : -foot[2], 0], b = [sx * top[0], sy > 0 ? top[1] : -top[2], z0];
      L.push([a, b]);
      P(m, turned(a, b, r, o.prof ?? TURNED, o.seg ?? 8));
    }
    const zs = o.stretch ?? 0.55, k = zs / z0, p = L.map(([a, b]) => at(a, b, k));
    // side stretchers (front leg to back leg), swelling in the middle, and the cross stretcher between them
    for (const [i, j] of [[0, 2], [1, 3]]) P(m, rod([p[i], p[j]], r * 0.5, r * 0.5, 6, r * 0.25));
    P(m, rod([at(p[0], p[2], 0.5), at(p[1], p[3], 0.5)], r * 0.45, r * 0.45, 6, r * 0.25));
    return L;
  }

  // ---- the bentwood café chair (Thonet No. 14, 1859) -----------------------------------------
  // Six pieces of steamed beech: the back legs and the backrest are one bend, an inner loop in the
  // back, a round seat frame, two front legs and a ring between all four legs. The seat is cane.
  function bentwood(P, m, seatM, zt) {
    const R = 0.66, zr = zt - 0.07;
    const rim = []; for (let i = 0; i <= 22; i++) { const th = i / 22 * TAU; rim.push([Math.cos(th) * R, Math.sin(th) * R, zr]); }
    P(m, rod(rim, 0.055, 0.055, 6));
    P(seatM, lathe([[0, zr + 0.025], [R - 0.03, zr + 0.025], [R - 0.01, zr + 0.055], [R - 0.06, zr + 0.065], [0, zr + 0.045]], { seg: 24 }));
    // front legs: taper toward the foot, splayed
    for (const sx of [-1, 1]) P(m, turned([sx * 0.55, 0.58, 0], [sx * 0.45, 0.45, zr], 0.052, TAPER, 8));
    // back legs and backrest: one continuous bend from the left foot over the top to the right foot
    const side = [[0.5, -0.7, 0], [0.45, -0.56, 0.7], [0.42, -0.47, zr], [0.41, -0.53, zt + 0.42], [0.39, -0.6, zt + 0.85], [0.33, -0.66, zt + 1.13], [0.19, -0.7, zt + 1.27], [0, -0.71, zt + 1.3]];
    P(m, rod(curve([...side, ...side.slice(0, -1).reverse().map(mirrorX)], 3), 0.05, 0.05, 6));
    const inner = [[0.3, -0.56, zr + 0.03], [0.28, -0.58, zt + 0.38], [0.25, -0.63, zt + 0.72], [0.15, -0.66, zt + 0.85], [0, -0.67, zt + 0.88]];
    P(m, rod(curve([...inner, ...inner.slice(0, -1).reverse().map(mirrorX)], 3), 0.036, 0.036, 6));
    // the ring between the legs, at 0.6 ft, an ellipse touching each leg's inner face
    const ring = []; for (let i = 0; i <= 18; i++) { const th = i / 18 * TAU; ring.push([Math.cos(th) * 0.47, -0.05 + Math.sin(th) * 0.55, 0.62]); }
    P(m, rod(ring, 0.032, 0.032, 6));
  }

  // ---- the Windsor (bow back) -----------------------------------------------------------------
  // A saddle seat; four splayed turned legs in an H-stretcher; a steam-bent bow raked back, with
  // seven spindles through the seat into it.
  function windsor(P, m, seatM, zt, o) {
    const a = 0.72, b = 0.66;
    P(seatM, saddle(a, b, zt, 0.14));
    legs(P, m, [0.46, 0.4, 0.34], [0.6, 0.6, 0.56], zt - 0.12, 0.068);
    const hw = 0.6, H = o.backH ?? 1.75, by = -0.42, rake = 0.26, bow = [];
    for (let i = 0; i <= 16; i++) { const ph = i / 16 * Math.PI, sn = Math.sin(ph); bow.push([Math.cos(ph) * hw * (1 - 0.08 * sn), by - rake * sn, zt - 0.06 + H * sn]); }
    P(m, rod(bow, 0.05, 0.05, 7));
    for (let i = -3; i <= 3; i++) {
      const x = i * 0.15, sn = Math.sqrt(Math.max(0, 1 - (x / (hw * 0.95)) ** 2)), top = [x, by - rake * sn + 0.01, zt - 0.06 + H * sn - 0.03];
      P(m, rod([[x * 0.95, by + 0.05, zt - 0.03], top], 0.026, 0.02, 6, 0.006));
    }
  }

  // ---- the captain's chair (a low-backed library or smoker's bow chair) --------------------------
  // A saddle seat; a horizontal arm bow round the back and sides on turned arm posts and short
  // spindles; a thick crest rail across the back where the hands and shoulders rest.
  function captain(P, m, seatM, zt) {
    const a = 0.8, b = 0.7;
    P(seatM, saddle(a, b, zt, 0.15, { yc: -0.02 }));
    legs(P, m, [0.5, 0.42, 0.4], [0.64, 0.62, 0.6], zt - 0.13, 0.07);
    const za = zt + 0.95, A = 0.82, Bb = 0.66, yc = -0.04, pt = ph => [A * Math.cos(ph), yc - Bb * Math.sin(ph), za];
    const arm = []; for (let i = 0; i <= 22; i++) arm.push(pt(-0.38 + (Math.PI + 0.76) * i / 22));
    const flat = Array.from({ length: 8 }, (_, i) => [Math.cos(i / 8 * TAU), Math.sin(i / 8 * TAU) * 0.55]);
    P(m, sweep(arm, 0.075, { shape: flat, up: [0, 0, 1] }));
    // the crest: a thicker rail lying on the bow across the back, its ends faded into the bow
    const crest = []; for (let i = 0; i <= 14; i++) { const ph = Math.PI / 2 - 1.0 + 2.0 * i / 14, p = pt(ph); crest.push([p[0] * 0.995, p[1] * 0.995, za + 0.07]); }
    P(m, sweep(crest, t => 0.1 * (0.55 + 0.45 * Math.sin(t * Math.PI)), { shape: flat, up: [0, 0, 1] }));
    // spindles from the seat to the bow, and the arm posts at its ends
    for (let i = 0; i < 9; i++) {
      const ph = 0.32 + (Math.PI - 0.64) * i / 8, top = pt(ph), bot = [top[0] * 0.86, yc + (top[1] - yc) * 0.86, zt - 0.03];
      P(m, rod([bot, [top[0], top[1], za - 0.02]], 0.024, 0.02, 6, 0.005));
    }
    for (const ph of [-0.38, Math.PI + 0.38]) { const p = pt(ph); P(m, turned([p[0] * 0.92, p[1] - 0.04, zt - 0.05], [p[0], p[1], za], 0.045, [[0, 0.8], [0.3, 1.15], [0.38, 0.8], [0.8, 0.9], [1, 0.75]], 8)); }
  }

  // ---- the office chair: an upholstered seat and back on a swivelling column and a five-star base
  function office(P, m, seatM, zt, o) {
    const metal = o.metal ?? (o.base === 'chrome' ? CHROME : IRON);
    P(seatM, softBox(-0.72, 0.72, -0.66, 0.7, zt - 0.22, zt, 0.1, { crown: 0.04, welt: 0.006, n: [3, 3, 1] }));
    P(metal, bev(-0.42, 0.42, -0.4, 0.4, zt - 0.3, zt - 0.22, 0.02));
    P(metal, lathe([[0.11, 0.42], [0.11, zt - 0.6], [0.075, zt - 0.58], [0.075, zt - 0.3], [0.09, zt - 0.28]], { seg: 10 }));
    for (let i = 0; i < 5; i++) {
      const th = i / 5 * TAU + Math.PI / 2, c = Math.cos(th), sn = Math.sin(th);
      P(metal, sweep([[c * 0.1, sn * 0.1, 0.42], [c * 0.5, sn * 0.5, 0.33], [c * 0.92, sn * 0.92, 0.27]], 0.055, { seg: 6, shape: [[1, 0.6], [-1, 0.6], [-1, -0.6], [1, -0.6]].map(([u, v]) => [v, u]) }));
      P('c#1d1b19/0.5', lathe([[0, 0.02], [0.09, 0.03], [0.1, 0.1], [0.09, 0.17], [0, 0.18]], { seg: 8, x: c * 0.95, y: sn * 0.95 }));
      P(metal, lathe([[0.02, 0.17], [0.02, 0.27]], { seg: 6, x: c * 0.93, y: sn * 0.93 }));
    }
    // the back: a curved, upholstered panel on a bent spine from under the seat
    const spine = curve([[0, -0.2, zt - 0.27], [0, -0.7, zt - 0.2], [0, -0.82, zt + 0.25], [0, -0.82, zt + 0.5]], 3);
    P(metal, sweep(spine, 0.05, { seg: 4, shape: [[1.6, 0.6], [-1.6, 0.6], [-1.6, -0.6], [1.6, -0.6]], up: [1, 0, 0] }));
    const bh = o.backH ?? 1.0, g = softBox(-0.66, 0.66, -0.13, 0.07, 0, bh, 0.08, { crown: 0.03, n: [4, 2, 2] }), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); pos.setY(i, pos.getY(i) - 0.85 + 0.16 * (x / 0.66) ** 2); pos.setZ(i, pos.getZ(i) + zt + 0.35); }
    g.computeVertexNormals();
    P(seatM, g);
  }

  // K.chair(f, x, y, { kind, dq, turn | deg, wood, seat, seatH, sit, label, block, ...})
  //   kind: 'bentwood' (café), 'windsor', 'captain' (a low-backed library armchair), 'office',
  //   or 'ladder' / 'spindle' / 'splat' (diningChair: its drop-in cushion, or pad: false for a board seat). seatH: the seat's top
  //   (1.5 by default; office 1.55). seat: a wood or a fabric for the seat (bentwood: cane;
  //   Windsor and captain's: the chair's own wood; office: charcoal wool).
  function chair(f, x, y, o = {}) {
    const kind = o.kind ?? 'windsor';
    const turn = o.turn ?? (o.deg != null ? o.deg * Math.PI / 180 : 0);
    if (kind === 'ladder' || kind === 'spindle' || kind === 'splat') return diningChair(f, x, y, { ...o, back: kind, turn });
    const s = f.sub(x, y, 0, o.dq ?? 0), P = placer(s, turn), m = woodOf(o.wood ?? OAK);
    const zt = o.seatH ?? (kind === 'office' ? 1.55 : 1.5);
    if (kind === 'bentwood') { bentwood(P, m, o.seat ?? 'wicker#c4a06a', zt); finish(s, turn, o, zt, 0.68); }
    else if (kind === 'captain') { captain(P, m, o.seat ? woodOf(o.seat) : m, zt); finish(s, turn, o, zt, 0.8); }
    else if (kind === 'office') { office(P, m, fab(o.seat ?? 'c#3b3a38', 'wool'), zt, o); finish(s, turn, o, zt, 0.85); }
    else { windsor(P, m, o.seat ? woodOf(o.seat) : m, zt, o); finish(s, turn, o, zt, 0.75); }
  }

  // K.stool(f, x, y, { h, wood, seat, sit, label, block, back })  A turned stool: a round dished
  // seat on four splayed legs with a ring for the feet. h: the seat's top (2.05: a lab or counter
  // stool; 1.5: a low stool). back: true gives it a low bentwood back.
  function stool(f, x, y, o = {}) {
    const s = f.sub(x, y, 0, o.dq ?? 0), turn = o.turn ?? 0, P = placer(s, turn), m = woodOf(o.wood ?? OAK), h = o.h ?? 2.05, r = o.r ?? 0.6;
    P(o.seat ? woodOf(o.seat) : m, lathe([[0, h - 0.12], [r - 0.06, h - 0.12], [r, h - 0.08], [r, h - 0.03], [r - 0.04, h], [r * 0.6, h - 0.015], [0, h - 0.02]], { seg: 20 }));
    const top = r * 0.55, foot = r * 0.62 + h * 0.1, L = [];
    for (let i = 0; i < 4; i++) {
      const th = i / 4 * TAU + Math.PI / 4, c = Math.cos(th), sn = Math.sin(th), a = [c * foot, sn * foot, 0], b = [c * top, sn * top, h - 0.11];
      L.push([a, b]); P(m, turned(a, b, 0.065, h > 1.8 ? [[0, 0.72], [0.03, 0.8], [0.07, 0.74], [0.3, 0.85], [0.36, 1.1], [0.4, 0.82], [0.85, 0.95], [1, 0.95]] : TURNED, 8));
    }
    // the foot ring (high stools) or four stretchers (low ones)
    const zr = Math.min(0.7, h * 0.33), k = zr / (h - 0.11), rr = Math.hypot(...at(L[0][0], L[0][1], k).slice(0, 2));
    if (h > 1.8) { const ring = []; for (let i = 0; i <= 20; i++) { const th = i / 20 * TAU; ring.push([Math.cos(th) * rr, Math.sin(th) * rr, zr]); } P(m, rod(ring, 0.035, 0.035, 6)); }
    else for (let i = 0; i < 4; i++) P(m, rod([at(L[i][0], L[i][1], k), at(L[(i + 1) % 4][0], L[(i + 1) % 4][1], k)], 0.03, 0.03, 6, 0.012));
    if (o.back) {
      const side = [[r * 0.8, -r * 0.45, h - 0.08], [r * 0.82, -r * 0.6, h + 0.4], [r * 0.6, -r * 0.85, h + 0.75], [0, -r * 0.95, h + 0.85]];
      P(m, rod(curve([...side, ...side.slice(0, -1).reverse().map(mirrorX)], 4), 0.04, 0.04, 6));
    }
    if (o.sit !== false) { const [sx, sy] = rot(0, 0.05, turn); K.seat(s, sx, sy, h, o.label ?? 'sit on the stool'); if (turn) K.seats[K.seats.length - 1].yaw += turn; }
    if (o.block !== false) s.block(-r, r, -r, r, 0, Math.max(1.6, h));
  }

  // K.wallBench(f, w, { d, h, back, wood, cushion, sit, label, block, every })  A plank bench
  // against a wall: the frame lies on the wall at the bench's middle, its front toward +y. The
  // seat board's edges are rounded over; the ends are shaped boards with an arch cut from the
  // foot; a rail stiffens it under the front. back: true (default) gives a slatted back
  // leaning against the wall. cushion: a fabric for a long welted seat pad. Sittable every 2 ft.
  function wallBench(f, w, o = {}) {
    const m = woodOf(o.wood ?? OAK), d = o.d ?? 1.35, h = o.h ?? 1.5, y0 = o.y0 ?? 0.1, t = 0.11, a = w / 2;
    put(f, m, bev(-a, a, y0, d, h - t, h, 0.035, { grain: 'x' }));
    // shaped ends, a little in from the seat's ends: a board with an arch cut from its foot and a rounded top front
    const endOut = [[y0 + 0.02, 0], [y0 + 0.28, 0], [y0 + 0.36, 0.22], [y0 + (d - y0) / 2, 0.32], [d - 0.36 - 0.04, 0.22], [d - 0.28 - 0.04, 0], [d - 0.08, 0], [d - 0.05, h - t - 0.3], [d - 0.12, h - t], [y0 + 0.02, h - t]];
    for (const sx of [-1, 1]) {
      // (extrude lays the outline in x-z and pushes it along y: turned a quarter about z, the outline stands in y-z
      // and the push becomes the board's thickness along x)
      const x0 = sx * (a - 0.22) - 0.05;
      put(f, m, extrude(endOut, 0, 0.1, { bevel: 0.015 }), { rz: Math.PI / 2, at: [x0 + 0.1, 0, 0] });
    }
    put(f, m, bev(-a + 0.27, a - 0.27, d - 0.2, d - 0.12, h - t - 0.32, h - t - 0.005, 0.012, { grain: 'x' }));
    if (o.cushion) put(f, fab(o.cushion), softBox(-a + 0.06, a - 0.06, y0 + 0.12, d - 0.04, h + 0.002, h + 0.2, 0.06, { crown: 0.03, welt: 0.007, n: [Math.max(2, Math.round(w)), 2, 1], noBottom: true }));
    const top = h + (o.cushion ? 0.18 : 0);
    if (o.back !== false) {
      const zb0 = h + 0.35, zb1 = h + 1.45, ty = (z) => y0 + 0.02 + 0.12 * (z - h) / 1.45;
      for (const sx of [-1, 1]) put(f, m, bev(sx * (a - 0.22) - 0.05, sx * (a - 0.22) + 0.05, 0.02, 0.12, h - 0.02, zb1 + 0.05, 0.012, { grain: 'z' }));
      put(f, m, bev(-a + 0.1, a - 0.1, ty(zb1) - 0.05, ty(zb1) + 0.05, zb1 - 0.25, zb1 + 0.02, 0.03, { grain: 'x' }));
      put(f, m, bev(-a + 0.27, a - 0.27, ty(zb0) - 0.035, ty(zb0) + 0.035, zb0, zb0 + 0.16, 0.012, { grain: 'x' }));
      const n = Math.max(3, Math.round((w - 0.6) / 0.42));
      for (let i = 0; i < n; i++) { const x = -a + 0.3 + (w - 0.6) * (i + 0.5) / n; put(f, m, bev(x - 0.09, x + 0.09, ty(h + 0.9) - 0.02, ty(h + 0.9) + 0.02, zb0 + 0.15, zb1 - 0.24, 0.01, { grain: 'z' })); }
    }
    if (o.sit !== false) { const n = Math.max(1, Math.round(w / (o.every ?? 2))); for (let i = 0; i < n; i++) K.seat(f, -a + w * (i + 0.5) / n, (y0 + d) / 2 + 0.1, top, o.label ?? 'sit on the bench'); }
    if (o.block !== false) f.block(-a, a, 0, d, 0, 1.6);
  }

  return { chair, stool, wallBench };
}
