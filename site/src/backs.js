// The backs of the buildings: what you find if you walk round behind the shops. These are the rear walls
// of 19th-century brick commercial rows (research/BRIEF.md), and they are plain: brick, a back door on a
// stone step, a few sash windows, a downpipe; here and there a stair, a lean-to, a stack. Each building
// may have ONE small lived-in thing, no two alike, and several have none. Behind the whole street there
// are two set pieces and no more: an allotment across the south lane and a bench across the north one.
//
// Everything is placed from the lot as town.js built it: u feet out from the street's centre line (the back
// wall's outer face is u = lot.back), v along the street (plan Y; t.at(f) is a fraction of the lot's width),
// h up to lot.top. Nothing here is at a fixed coordinate, so a back follows its building wherever it goes,
// and nothing is laid on a building's footprint or on the chapel's ground (see `free`).
// Plain colours only, so it all lands in the street's one painted mesh; the glass is flats.js's (see below).

import * as THREE from 'three';
import { T, F, paper } from './draw.js';

const IRON = 'c#2e2c2a/0.6', ZINCD = 'c#7d8286/0.6', WOOD = 'c#8a6a48/0.85', WOODD = 'c#5a4432/0.85', PINE = 'c#c2a878/0.9';
const CREAM = 'c#e8e0cc/0.75', STONE = 'c#a39c90/0.95', BRASS = 'c#b9954e/0.4', BRICK = 'brick#8a6a5c', DRAIN = 'c#3a3835/0.8';
const LAMP = 'e#ffe2b4/1.7';

const shade = (hex, k) => '#' + [1, 3, 5].map(i => Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k))).toString(16).padStart(2, '0')).join('');
const P = (hex, rough = 0.9) => `c${hex}/${rough}`;

// The windows' glass, frames and rooms are drawn by flats.js, in the same mesh as the fronts' upper windows: here only
// their place (K.backs.wins), the stone round them, and a letter for who is behind: d nobody in, b a blind,
// c curtains, k the kitchen. The sash pattern follows the block: six over six in Madison, two over two in Norwalk.
const FRAME = '#ddd4c0', ARCH = 'c#7a4c3e/0.9';
const FRAMES = { grocery: '#56685a', noodles: '#4a3a30' };          // two backs painted otherwise

export function buildBacks(K, town) {
  const kit = K.kit, L = town.lots, wins = [], knocks = [];
  K.backs = { wins, knocks };
  if (!K.steam) K.steam = [];

  // Is this piece of ground (plan X0..X1, Y0..Y1) clear of every building, and of the chapel and its churchyard?
  const keepOff = [...(town.footprints ?? []), town.chapel?.footprint, town.chapel?.churchyard].filter(Boolean);
  const free = (X0, X1, Y0, Y1, m = 1.5) => !keepOff.some(r => Math.min(X0, X1) < r.x1 + m && Math.max(X0, X1) > r.x0 - m && -Math.max(Y0, Y1) < r.z1 + m && -Math.min(Y0, Y1) > r.z0 - m);

  // ---- one lot's tools: (u, v, h) as above, so one description serves either side of the street -------------
  const tools = lot => {
    const s = lot.side, b = lot.back, Q = { out: s > 0 ? 3 : 1, in: s > 0 ? 1 : 3, e: 2, w: 0 }, YAW = { out: s * Math.PI / 2, in: -s * Math.PI / 2 };
    const W3 = p => [s * p[0], p[2], -p[1]];
    return {
      s, b, lot, top: lot.top, y0: lot.y0, y1: lot.y1, at: f => lot.y0 + f * (lot.y1 - lot.y0),
      box: (mat, u0, u1, v0, v1, h0, h1, o) => K.box(mat, Math.min(s * u0, s * u1), Math.max(s * u0, s * u1), Math.min(h0, h1), Math.max(h0, h1), -Math.max(v0, v1), -Math.min(v0, v1), o),
      cyl: (mat, u, v, h0, h1, r0, r1 = r0, seg = 6) => K.cyl(mat, s * u, h0, h1, -v, r0, r1, seg),
      tube: (mat, a, c, rad = 0.04, seg = 4) => K.tube(mat, W3(a), W3(c), rad, seg),
      beam: (mat, a, c, w, h) => K.beam(mat, W3(a), W3(c), w, h),
      hit: (u0, u1, v0, v1, h1 = 4, h0 = 0) => K.collide(s * u0, s * u1, -v0, -v1, h1, h0),
      surf: (u0, u1, v0, v1, h) => K.surface(Math.min(s * u0, s * u1), Math.max(s * u0, s * u1), -Math.max(v0, v1), -Math.min(v0, v1), h),
      sign: (u, v, h, face, w, tall, draw, o) => kit.sign(kit.fr(s * u, v, 0, Q[face]), 0, 0, h, w, tall, draw, o),
      plant: (kind, u, v, sc = 1, o) => K.F.add(kind, s * u, -v, sc, o),
      glow: (u, v, h, r = 0.16) => { K.B.mesh(LAMP, new THREE.SphereGeometry(r, 6, 4).translate(s * u, h, -v)); K.glowDots.push([s * u, h, -v, r * 8]); },
      bench: (u, v, face, label) => { K.bench(s * u, -v, YAW[face]); K.seat(s * u, 1.4, -v, YAW[face] + Math.PI, label); },
    };
  };

  // ---- the parts a back wall is made of -----------------------------------------------------------------
  // A sash window let into the brick. The opening is w by hh from h0 up; the glass lies on the wall's face and flats.js
  // draws what is behind it: four inches of brick reveal, the box frame and two sashes (the lower an inch further in), the
  // blind or curtains, and the room. Here, what stands proud of the wall: a stone sill, weathered and running past the
  // opening each side, and over it a stone lintel (Madison) or a flat arch of bricks set on end (Norwalk), its joints
  // the wall showing between them.
  function win(t, v, h0, w, hh, kind) {
    const b = t.b, north = t.s > 0, h1 = h0 + hh;
    t.box(STONE, b - 0.02, b + 0.3, v - w / 2 - 0.28, v + w / 2 + 0.28, h0 - 0.3, h0);
    t.box(STONE, b + 0.3, b + 0.34, v - w / 2 - 0.28, v + w / 2 + 0.28, h0 - 0.3, h0 - 0.12);              // its drip, a lip under the front edge
    if (north) t.box(STONE, b - 0.02, b + 0.07, v - w / 2 - 0.36, v + w / 2 + 0.36, h1, h1 + 0.72);
    else { const n = Math.round((w + 0.7) / 0.23), bw = (w + 0.7) / n; for (let i = 0; i < n; i++) t.box(ARCH, b - 0.02, b + 0.05, v - w / 2 - 0.35 + i * bw + 0.012, v - w / 2 - 0.35 + (i + 1) * bw - 0.012, h1 + 0.015, h1 + 0.7); }
    wins.push({ x: t.s * (b + 0.03), y: h0 + hh / 2, z: -v, w, h: hh, side: t.s, nx: t.s, lot: t.lot.id, kind, reach: h0 < 8, bars: north ? 6 : 2, reveal: 0.32, frame: FRAMES[t.lot.id] ?? FRAME });
  }
  // The upper floors: the same columns of windows on every floor. rows: one string per floor, a letter per column
  // (d dark, b a blind, c curtains, k the kitchen; a space leaves that window out).
  function upper(t, cols, rows, w = 3) {
    rows.forEach((row, f) => cols.forEach((c, i) => { if (row[i] && row[i] !== ' ') win(t, t.at(c), 17.8 + f * 11.5, w, f === rows.length - 1 && rows.length > 1 ? 5.6 : 6.2, row[i]); }));
  }

  // A back door: frame, a four-panelled leaf, a knob, a light over it; at the ground, a stone step you can stand on.
  function door(t, v, hex, o = {}) {
    const b = t.b, w = 3.1, h0 = o.h0 ?? 0.5, h1 = h0 + 7, M = P(hex, 0.6), M2 = P(shade(hex, 0.8), 0.6), hs = o.hinge ?? 1, fan = o.fan !== false;
    if (o.step !== false) { t.box(STONE, b, b + 2.6, v - w / 2 - 0.7, v + w / 2 + 0.7, 0, h0); t.surf(b, b + 2.6, v - w / 2 - 0.7, v + w / 2 + 0.7, h0); }
    if (o.h0 === undefined && t.lot.backDoorV !== undefined && Math.abs(t.lot.backDoorV - v) < 0.05) {
      // the shop's yard door is a real one (town.js cuts the opening and hangs the leaf): here only its frame
      for (const sg of [-1, 1]) t.box(CREAM, b, b + 0.16, v + sg * (w / 2), v + sg * (w / 2 + 0.26), h0, h1);
      t.box(CREAM, b, b + 0.16, v - w / 2 - 0.26, v + w / 2 + 0.26, h1, h1 + (fan ? 1.7 : 0.26));
    } else {
      t.box(CREAM, b, b + 0.16, v - w / 2 - 0.26, v + w / 2 + 0.26, h0, h1 + (fan ? 1.7 : 0.26));
      t.box(M, b + 0.16, b + 0.2, v - w / 2, v + w / 2, h0, h1);
      for (const [a0, a1] of [[-w / 2 + 0.3, -0.12], [0.12, w / 2 - 0.3]]) for (const [p0, p1] of [[h0 + 0.5, h0 + 2.9], [h0 + 3.3, h1 - 0.5]]) t.box(M2, b + 0.2, b + 0.23, v + a0, v + a1, p0, p1);
      t.box(BRASS, b + 0.2, b + 0.36, v + hs * (w / 2 - 0.42), v + hs * (w / 2 - 0.26), h0 + 3.15, h0 + 3.33);
    }
    if (fan) wins.push({ x: t.s * (b + 0.18), y: h1 + 0.8, z: -v, w, h: 1.2, side: t.s, nx: t.s, lot: t.lot.id, kind: 'f', bars: 3, reveal: 0 });      // a fanlight of three lights
    if (o.lamp) {                                                // a little enamel shade on a bracket
      const hl = h1 + (fan ? 2.6 : 1.3);
      t.box(IRON, b, b + 0.36, v - 0.05, v + 0.05, hl + 0.3, hl + 0.38); t.cyl(IRON, b + 0.32, v, hl + 0.1, hl + 0.3, 0.32, 0.1, 6); t.glow(b + 0.32, v, hl);
      K.lamp(t.s * (b + 2.2), hl - 0.6, -v, 0.5);
    }
  }

  // Rainwater: a hopper under the parapet, a downpipe on brackets, a drain at its foot.
  function pipe(t, v) {
    const b = t.b, top = t.top;
    t.cyl(IRON, b + 0.24, v, 0.2, top - 0.9, 0.15, 0.15, 6); t.box(IRON, b, b + 0.5, v - 0.35, v + 0.35, top - 0.9, top - 0.3);
    for (let h = 4; h < top - 3; h += 8) t.box(IRON, b, b + 0.4, v - 0.22, v + 0.22, h, h + 0.12);
    t.box(DRAIN, b + 0.05, b + 1.0, v - 0.4, v + 0.4, 0, 0.06);
  }

  // A wooden stair up the wall to a flat's door: foot at vA, the landing from vB to vC. Few members, and heavy.
  // (Not for climbing: it is somebody's front door.)
  function stair(t, vA, vB, vC) {
    const b = t.b, d = 3.3, H = 14.55, n = 19, run = (vB - vA) / n, rise = H / n, sg = Math.sign(run);
    for (let i = 0; i < n; i++) t.box(WOOD, b + 0.1, b + d, vA + run * i, vA + run * (i + 1) + sg * 0.1, rise * (i + 1) - 0.14, rise * (i + 1));
    for (const u of [b + 0.2, b + d - 0.1]) t.beam(WOODD, [u, vA, -0.45], [u, vB, H - 0.55], 0.16, 0.8);       // two strings
    t.beam(WOODD, [b + d - 0.1, vA, 3.2], [b + d - 0.1, vB, H + 3.2], 0.14, 0.22);                             // the handrail
    t.box(WOOD, b + 0.1, b + d, vB, vC, H - 0.16, H); t.box(WOODD, b + 0.05, b + d, vB, vC, H - 0.6, H - 0.16);   // the landing, on its joists
    for (const [v, h1] of [[vA, 3.5], [vB, H + 3.4], [vC - sg * 0.15, H + 3.4]]) { t.box(WOODD, b + d - 0.28, b + d, v - 0.14, v + 0.14, 0, h1); t.hit(b + d - 0.4, b + d + 0.1, v - 0.25, v + 0.25, Math.min(h1, 8)); }
    t.box(WOODD, b + d - 0.2, b + d - 0.06, vB, vC, H + 3.2, H + 3.4); t.box(WOODD, b + 0.1, b + d, vC - sg * 0.22, vC - sg * 0.08, H + 3.2, H + 3.4);
    t.hit(b, b + d + 0.1, vA, vA + run * 9, rise * 9 + 0.3);                                                    // you cannot walk through the low half
    return H;
  }

  // A boarded lean-to against the wall, with a plank door in its front and a tarred roof.
  function leanTo(t, v0, v1, out = 5, hex = '#6f6a5c') {
    const b = t.b, hw = 8.6, hf = 7.0, M = P(hex, 0.9), M2 = P(shade(hex, 0.78), 0.9), vm = (v0 + v1) / 2;
    t.box(M, b, b + out, v0, v1, 0, hf); t.box(M, b, b + out * 0.55, v0, v1, hf, hf + (hw - hf) * 0.5);        // the body, stepped up under the slope
    t.beam('c#3a3835/0.9', [b, vm, hw + 0.25], [b + out + 0.5, vm, hf - 0.1], 0.16, v1 - v0 + 0.7);
    t.box(M2, b + out, b + out + 0.05, vm - 1.5, vm + 1.5, 0.15, 6.4); t.box(IRON, b + out + 0.05, b + out + 0.12, vm + 1.05, vm + 1.2, 3.1, 3.5);
    t.hit(b, b + out + 0.1, v0 - 0.1, v1 + 0.1, hw);
  }

  // A brick stack up the back wall, from the oven to above the parapet, with two pots.
  function stack(t, v, w = 3) {
    const b = t.b, h1 = t.top + 5.5;
    t.box(BRICK, b, b + 1.5, v - w / 2, v + w / 2, -0.05, h1, { collide: true }); t.box(STONE, b - 0.12, b + 1.62, v - w / 2 - 0.12, v + w / 2 + 0.12, h1, h1 + 0.3);
    for (const dv of [-0.65, 0.65]) t.cyl('c#b8653f/0.92', b + 0.75, v + dv, h1 + 0.3, h1 + 1.7, 0.36, 0.3, 8);
  }

  // A zinc flue from a kitchen: out of the wall, up past the parapet, a hat on top, a thread of steam.
  function flue(t, v, h0) {
    const b = t.b, r = 0.34, u = b + r + 0.3, h1 = t.top + 3.6;
    t.tube(ZINCD, [b, v, h0], [u + r, v, h0], r, 8); t.cyl(ZINCD, u, v, h0 - r, h1, r, r, 8);
    for (let h = h0 + 6; h < t.top - 1; h += 9) t.box(IRON, b, u, v - r - 0.06, v + r + 0.06, h, h + 0.12);
    t.cyl(ZINCD, u, v, h1 + 0.25, h1 + 0.7, r * 1.5, 0.05, 8);
    K.steam.push([t.s * u, h1 + 0.8, -v]);
  }

  // A washing line between two posts, along the wall: [where 0..1, what, colour, second colour]
  function washing(t, u, v0, v1, items, h = 6.3) {
    for (const v of [v0, v1]) { t.box(WOODD, u - 0.13, u + 0.13, v - 0.13, v + 0.13, 0, h + 0.3); t.hit(u - 0.25, u + 0.25, v - 0.25, v + 0.25, h); }
    const N = 6, sag = 0.3, at = f => [u, v0 + (v1 - v0) * f, h - sag * 4 * f * (1 - f)];
    for (let i = 0; i < N; i++) t.tube('c#d8d2c2/0.8', at(i / N), at((i + 1) / N), 0.02, 3);
    for (const [f, kind, col, col2] of items) {
      const c = at(f), M = P(col, 0.95), M2 = P(col2 ?? shade(col, 0.8), 0.95), pc = (mat, a0, a1, h0, h1, th = 0.035) => t.box(mat, u - th, u + th, c[1] + a0, c[1] + a1, c[2] + h0, c[2] + h1);
      if (kind === 'apron') { pc(M, -0.75, 0.75, -2.7, -0.8); pc(M, -0.42, 0.42, -0.8, 0); pc(M2, -0.4, 0.4, -2.0, -1.45, 0.045); }
      else { pc(M, -0.55, 0.55, -1.5, 0); pc(M2, -0.55, 0.55, -1.3, -1.18, 0.045); }                              // a cloth
    }
  }

  // A box of herbs on brackets under a window
  function herbBox(t, v, h, w) {
    t.box('c#4a5a44/0.8', t.b + 0.04, t.b + 0.8, v - w / 2 - 0.15, v + w / 2 + 0.15, h - 0.98, h - 0.33);      // (under the sill, not touching it)
    for (let i = 0; i < 4; i++) t.plant('herbs', t.b + 0.42, v - w / 2 + 0.35 + i * (w - 0.7) / 3, 0.55, { y: h - 0.4 });
  }

  // The allotment shed: an apex shed of feather-edged boards on a brick plinth, its gable end and door to the lane.
  // u0..u1 deep (from the lane back), v0..v1 wide. Each board is a course standing a little proud of the one above it
  // (its thick edge down, as feather-edge is hung), so the lines read in any light; corner posts cover the ends. A felt
  // roof on a 35 degree pitch, overhanging at the eaves and the gables, finished with fascia and barge boards. The door is
  // ledged and braced, on two strap hinges, with a hasp and a padlock; beside it a window of four lights with a seed tray
  // on its sill. Round it: a gutter to a downpipe and a water butt, a fork and a spade against the side, a stack of pots,
  // and a trellis with runner beans going up it.
  function shed(t, u0, u1, v0, v1) {
    const GRN = '#6a8474', TRIMC = 'c#e3dccb/0.8', FELT = 'c#2c2d2e/0.95', STEEL = 'c#8d9296/0.5', TERRA = 'c#b8653f/0.92', HANDLE = 'c#9a7650/0.85';
    const vm = (v0 + v1) / 2, CO = 0.06, c0 = u0 + CO, c1 = u1 - CO, e0 = v0 + CO, e1 = v1 - CO;      // the core the boards are hung on
    const B0 = 0.35, CH = 0.42, NC = 14, hw = B0 + NC * CH, SL = 0.7, roofAt = v => hw + 0.08 + (Math.min(v, v1) - v0) * SL;      // the roof's underside over the side wall v0 (and its mirror)
    const pk = roofAt(vm), board = k => P(shade(GRN, 0.94 + 0.08 * ((k * 7) % 3) / 2), 0.88), lip = P(shade(GRN, 0.8), 0.88);
    // a slab on one face of the core: a along the face, d0..d1 out from it
    const slab = (face, a0, a1, h0, h1, d0, d1, mat) => {
      if (a1 - a0 < 0.02) return;
      if (face === 'F') t.box(mat, c0 - d1, c0 - d0, a0, a1, h0, h1); else if (face === 'B') t.box(mat, c1 + d0, c1 + d1, a0, a1, h0, h1);
      else if (face === 'L') t.box(mat, a0, a1, e0 - d1, e0 - d0, h0, h1); else t.box(mat, a0, a1, e1 + d0, e1 + d1, h0, h1);
    };
    const DOOR = [v0 + 0.75, v0 + 3.2, 0.42, 5.95], WIN = [v0 + 3.95, v0 + 6.0, 3.05, 5.0];      // v from, v to, h from, h to
    // the plinth, three courses of brick, and a slab of paving before the door
    t.box(BRICK, u0 - 0.3, u1 + 0.3, v0 - 0.3, v1 + 0.3, -0.05, B0);
    t.box('pavers', u0 - 1.7, u0 - 0.32, DOOR[0] - 0.4, DOOR[1] + 0.4, -0.05, 0.12); t.surf(u0 - 1.7, u0 - 0.3, DOOR[0] - 0.4, DOOR[1] + 0.4, 0.12);
    t.box(P(shade(GRN, 0.45), 0.9), c0, c1, e0, e1, B0, hw + 0.1);                                        // the core: dark, as the inside is, where a gap shows it
    // the boards, course by course, round the openings on the front
    const span = (a0, a1, h0, h1, holes) => { let segs = [[a0, a1]]; for (const [x0, x1, y0, y1] of holes) if (h1 > y0 && h0 < y1) segs = segs.flatMap(([p, q]) => [[p, Math.min(q, x0)], [Math.max(p, x1), q]].filter(([m, n]) => n - m > 0.02)); return segs; };
    for (let k = 0; k < NC; k++) {
      const h0 = B0 + k * CH, h1 = h0 + CH;
      for (const face of ['F', 'B', 'L', 'R']) {
        const along = face === 'F' || face === 'B' ? [v0 - 0.02, v1 + 0.02] : [u0 - 0.02, u1 + 0.02];
        for (const [a0, a1] of span(along[0], along[1], h0, h1, face === 'F' ? [[DOOR[0], DOOR[1], DOOR[2], DOOR[3]], [WIN[0], WIN[1], WIN[2], WIN[3]]] : [])) {
          slab(face, a0, a1, h0, h1, 0, 0.06, board(k)); slab(face, a0, a1, h0, h0 + 0.07, 0.06, 0.1, lip);
        }
      }
    }
    // the gables: the same courses, narrowing under the roof (the barge boards hide their stepped ends)
    for (let h0 = hw; h0 < pk - 0.1; h0 += CH) {
      const h1 = Math.min(h0 + CH, pk), half = Math.max(0, (vm - v0) - (Math.min(h0 + 0.26, h1) - hw - 0.08) / SL);      // (a course's top corners tuck up into the roof, its stepped foot behind the barge board)
      for (const face of ['F', 'B']) { slab(face, vm - half, vm + half, h0, h1, -CO, 0.06, board(Math.round(h0 / CH))); slab(face, vm - half, vm + half, h0, h0 + 0.07, 0.06, 0.1, lip); }
    }
    // corner posts
    for (const [uu, vv] of [[u0, v0], [u0, v1], [u1, v0], [u1, v1]]) t.box(P(shade(GRN, 0.86), 0.85), uu - 0.12, uu + 0.12, vv - 0.12, vv + 0.12, B0, hw);
    // the roof: two slabs of felted boarding, a felt roll along the ridge; fascias at the eaves, barge boards up the gables, a finial
    const ra = [hw + 0.08 - 0.5 * SL + 0.085, v0 - 0.5], uc = (u0 + u1) / 2, L = u1 - u0 + 0.8;
    for (const sg of [-1, 1]) {
      t.beam(FELT, [uc, vm + sg * (vm - ra[1]), ra[0]], [uc, vm, pk + 0.085], L, 0.14);
      t.box(TRIMC, u0 - 0.4, u1 + 0.4, vm + sg * (vm - v0 + 0.42), vm + sg * (vm - v0 + 0.5), ra[0] - 0.5, ra[0] - 0.02);
      for (const uu of [u0 - 0.33, u1 + 0.33]) t.beam(TRIMC, [uu, vm + sg * (vm - v0 + 0.5), hw + 0.08 - 0.5 * SL - 0.2], [uu, vm, pk - 0.2], 0.08, 0.48);
    }
    t.box(FELT, u0 - 0.42, u1 + 0.42, vm - 0.16, vm + 0.16, pk + 0.05, pk + 0.2);
    t.box(TRIMC, u0 - 0.43, u0 - 0.31, vm - 0.07, vm + 0.07, pk - 0.7, pk + 0.55);
    // the door: five boards, ledged and braced on the face, a frame round it
    const [d0, d1, dh0, dh1] = DOOR, DM = P(shade(GRN, 0.78), 0.85), nb = 5, bw = (d1 - d0 - 0.06) / nb;
    t.box(TRIMC, c0 - 0.16, c0 - 0.04, d0 - 0.24, d0, dh0 - 0.05, dh1); t.box(TRIMC, c0 - 0.16, c0 - 0.04, d1, d1 + 0.24, dh0 - 0.05, dh1); t.box(TRIMC, c0 - 0.16, c0 - 0.04, d0 - 0.24, d1 + 0.24, dh1, dh1 + 0.24);
    for (let i = 0; i < nb; i++) t.box(DM, c0 - 0.1, c0 - 0.02, d0 + 0.03 + i * bw + 0.012, d0 + 0.03 + (i + 1) * bw - 0.012, dh0, dh1 - 0.02);
    const LG = [dh0 + 0.55, (dh0 + dh1) / 2, dh1 - 0.6];
    for (const h of LG) t.box(DM, c0 - 0.16, c0 - 0.1, d0 + 0.12, d1 - 0.12, h - 0.2, h + 0.2);
    for (let i = 0; i < 2; i++) t.beam(DM, [c0 - 0.125, d0 + 0.32, LG[i] + 0.18], [c0 - 0.125, d1 - 0.32, LG[i + 1] - 0.18], 0.05, 0.34);      // braces: up from the hinge side
    for (const h of [LG[0], LG[2]]) {                                                                      // strap hinges, from the frame across the ledges
      t.box(IRON, c0 - 0.2, c0 - 0.16, d0 - 0.18, d0 + 1.45, h - 0.06, h + 0.06); t.box(IRON, c0 - 0.2, c0 - 0.16, d0 + 1.35, d0 + 1.52, h - 0.04, h + 0.04);
      t.box(IRON, c0 - 0.19, c0 - 0.16, d0 - 0.2, d0 - 0.06, h - 0.32, h + 0.32);
    }
    const hl = LG[1] + 0.55;                                                                               // a hasp and staple, and the padlock on it
    t.box(IRON, c0 - 0.2, c0 - 0.16, d1 - 0.6, d1 + 0.14, hl - 0.06, hl + 0.06); t.box(IRON, c0 - 0.16, c0 - 0.1, d1 - 0.62, d1 - 0.44, hl - 0.09, hl + 0.09);
    t.tube('c#9a9a96/0.4', [c0 - 0.3, d1 + 0.02, hl - 0.2], [c0 - 0.3, d1 + 0.02, hl + 0.06], 0.018, 5); t.tube('c#9a9a96/0.4', [c0 - 0.3, d1 + 0.14, hl - 0.2], [c0 - 0.3, d1 + 0.14, hl + 0.06], 0.018, 5);
    t.tube('c#9a9a96/0.4', [c0 - 0.3, d1 + 0.02, hl + 0.06], [c0 - 0.3, d1 + 0.14, hl + 0.06], 0.018, 5);
    t.box(BRASS, c0 - 0.35, c0 - 0.24, d1 - 0.03, d1 + 0.19, hl - 0.46, hl - 0.2);
    t.tube(IRON, [c0 - 0.1, d1 - 0.35, hl - 0.75], [c0 - 0.3, d1 - 0.35, hl - 0.68], 0.025, 4); t.tube(IRON, [c0 - 0.3, d1 - 0.35, hl - 0.68], [c0 - 0.3, d1 - 0.35, hl - 1.12], 0.025, 4); t.tube(IRON, [c0 - 0.3, d1 - 0.35, hl - 1.12], [c0 - 0.1, d1 - 0.35, hl - 1.2], 0.025, 4);      // a D handle
    // the window: a frame round it, a sill, four lights (flats.js draws the glass, the bars and the shed inside)
    const [w0, w1, wh0, wh1] = WIN;
    t.box(TRIMC, c0 - 0.16, c0 - 0.04, w0 - 0.2, w0, wh0, wh1); t.box(TRIMC, c0 - 0.16, c0 - 0.04, w1, w1 + 0.2, wh0, wh1); t.box(TRIMC, c0 - 0.16, c0 - 0.04, w0 - 0.2, w1 + 0.2, wh1, wh1 + 0.2);
    t.box(TRIMC, c0 - 0.42, c0 - 0.04, w0 - 0.3, w1 + 0.3, wh0 - 0.14, wh0);
    wins.push({ x: t.s * (c0 - 0.07), y: (wh0 + wh1) / 2, z: -(w0 + w1) / 2, w: w1 - w0, h: wh1 - wh0, side: t.s, nx: -t.s, lot: t.lot.id, kind: 'shed', bars: 4, reveal: 0.12, lined: true, frame: '#e3dccb' });
    t.box('c#3a2a1e/0.95', c0 - 0.38, c0 - 0.12, w0 + 0.15, w0 + 1.15, wh0, wh0 + 0.14);                 // a seed tray on the sill, coming up
    for (let i = 0; i < 10; i++) t.cyl('c#5f8a3e/0.9', c0 - 0.31 + (i % 2) * 0.12, w0 + 0.25 + Math.floor(i / 2) * 0.2, wh0 + 0.14, wh0 + 0.24 + (i % 3) * 0.02, 0.035, 0.05, 5);
    // a stack of pots by the door, and one turned over
    for (let i = 0; i < 5; i++) t.cyl(TERRA, u0 - 0.7, (DOOR[1] + WIN[0]) / 2, i * 0.14, i * 0.14 + 0.55, 0.22, 0.29, 10);
    t.cyl(TERRA, u0 - 1.3, DOOR[1] + 0.55, 0, 0.45, 0.26, 0.2, 10);
    // the gutter along the side v1, its downpipe, and a water butt (an old barrel on two bricks, iron hoops, a lid)
    const gh = ra[0] - 0.55, bu = u0 + 1.3, bv = v1 + 1.25;
    t.box('c#2e3032/0.6', u0 - 0.35, u1 + 0.35, v1 + 0.52, v1 + 0.8, gh - 0.2, gh); t.box('c#2e3032/0.6', u0 - 0.35, u1 + 0.35, v1 + 0.76, v1 + 0.8, gh, gh + 0.08);
    t.tube(IRON, [bu, v1 + 0.66, gh - 0.2], [bu, v1 + 0.66, 4.4], 0.11, 6); t.tube(IRON, [bu, v1 + 0.66, 4.4], [bu, bv - 0.25, 3.62], 0.11, 6);
    for (const dv of [-0.45, 0.45]) t.box(BRICK, bu - 0.4, bu + 0.4, bv + dv - 0.2, bv + dv + 0.2, -0.05, 0.3);
    K.lathe('c#7a5e40/0.9', t.s * bu, 0.3, -bv, [[0, 0], [0.74, 0], [0.86, 0.9], [0.9, 1.6], [0.86, 2.3], [0.76, 3.1], [0, 3.1]], 14);
    for (const h of [0.55, 2.75]) t.cyl(IRON, bu, bv, 0.3 + h - 0.06, 0.3 + h + 0.06, h < 1 ? 0.83 : 0.81, h < 1 ? 0.83 : 0.81, 14);
    t.cyl(WOODD, bu, bv, 3.4, 3.48, 0.8, 0.8, 14);
    t.hit(bu - 1, bu + 1, bv - 1, bv + 1, 3.6);
    // a fork and a spade against the side v0, and a trellis up the side v1 with beans on it
    const lean = (u, kind) => {
      const f = [u, v0 - 1.15, 0.05], tp = [u, v0 - 0.2, 4.35], dir = [0, (tp[1] - f[1]) / 4.4, (tp[2] - f[2]) / 4.4], at = k => [u, f[1] + dir[1] * k, f[2] + dir[2] * k];
      t.tube(HANDLE, at(kind === 'fork' ? 1.0 : 1.05), tp, 0.055, 6); t.box(HANDLE, u - 0.22, u + 0.22, tp[1] - 0.05, tp[1] + 0.05, tp[2] - 0.04, tp[2] + 0.06);
      if (kind === 'spade') t.beam(STEEL, at(0), at(1.05), 0.62, 0.04);
      else { for (const du of [-0.24, -0.08, 0.08, 0.24]) t.tube(STEEL, [u + du, f[1], f[2]], [u + du * 0.6, ...at(0.95).slice(1)], 0.025, 4); t.box(STEEL, u - 0.27, u + 0.27, at(0.95)[1] - 0.04, at(0.95)[1] + 0.04, at(0.95)[2] - 0.06, at(0.95)[2] + 0.06); }
    };
    lean(u0 + 1.0, 'fork'); lean(u0 + 1.75, 'spade');
    const T0 = u0 + 3.0, T1 = u1 - 0.8, TW = 'c#a8906a/0.9';
    for (let u = T0; u <= T1 + 0.01; u += (T1 - T0) / 6) t.box(TW, u - 0.04, u + 0.04, e1 + 0.12, e1 + 0.17, 0.6, 5.7);
    for (let h = 0.9; h < 5.7; h += 0.6) t.box(TW, T0 - 0.04, T1 + 0.04, e1 + 0.17, e1 + 0.22, h - 0.04, h + 0.04);
    // runner beans: three bines twining up it, leaves in threes, a few scarlet flowers
    for (const [k, ub] of [[0, T0 + 0.45], [1, T0 + 1.5], [2, T1 - 0.5]]) {
      let prev = [ub, e1 + 0.3, 0];
      for (let i = 1; i <= 12; i++) {
        const h = i * 0.44, cur = [ub + Math.sin(i * 1.9 + k) * 0.22, e1 + 0.27 + (i % 2) * 0.05, h];
        t.tube('c#4f7a34/0.9', prev, cur, 0.022, 4); prev = cur;
        for (const dl of [-1, 1]) K.sphere('c#4a7a32/0.9', t.s * (cur[0] + dl * 0.24), h - 0.08, -(cur[1] + 0.06), 0.2, 0.8, 0, 1.15, 0.3);
        if ((i + k) % 4 === 1 && i > 3) K.sphere('c#c8402f/0.9', t.s * cur[0], h + 0.1, -(cur[1] + 0.1), 0.06, 1, 0);
      }
    }
    t.hit(u0 - 0.4, u1 + 0.4, v0 - 0.4, v1 + 0.75, 9);
  }

  // ======================================================================================
  // THE BACKS, one building at a time. Each: door, ground-floor window, upper windows, downpipe; then at
  // most one structural extra (stair, lean-to, stack, flue) and at most one lived-in touch.
  // ======================================================================================
  const hexOf = lot => '#' + (lot.paint.split('#')[1] ?? '4a4640').slice(0, 6);
  const back = (id, fn) => { const lot = L[id]; if (lot) fn(tools(lot), lot.back, hexOf(lot)); };
  const C3 = [0.2, 0.5, 0.8], C3W = [0.17, 0.5, 0.83];

  // ---- north: the Mulberry Street Block --------------------------------------------------------------
  back('coffee', (t, b, hex) => {                               // 301. Touch: the day's aprons and cloths on a line.
    door(t, t.at(0.2), hex, { lamp: true }); win(t, t.at(0.42), 4.4, 3, 4, 'd'); upper(t, C3W, ['bdc', 'ddb']); pipe(t, t.at(0.04));
    washing(t, b + 4.4, t.at(0.56), t.at(0.95), [[0.18, 'apron', '#2f4a40', '#e9e0cc'], [0.42, 'cloth', '#e9e0cc', '#2f4a40'], [0.6, 'cloth', '#e9e0cc', '#b8452e'], [0.82, 'apron', '#2f4a40', '#e9e0cc']]);
  });
  back('yoga', (t, b, hex) => {                                 // 303. Nothing extra.
    door(t, t.at(0.72), hex, { hinge: -1 }); win(t, t.at(0.3), 4.4, 3, 4, 'c'); upper(t, C3, ['dbd', 'cdd']); pipe(t, t.at(0.05));
  });
  back('books', (t, b, hex) => {                                // 305. Touch: one kitchen window lit, pans on their hooks.
    door(t, t.at(0.26), hex); win(t, t.at(0.66), 4.4, 3, 4, 'd'); upper(t, C3, ['dkd', 'ddd']); pipe(t, t.at(0.05));
  });
  back('bikes', (t, b, hex) => {                                // 307. A lean-to workshop. Touch: a bicycle against it.
    door(t, t.at(0.2), hex, { lamp: true }); upper(t, C3, ['cdd', 'dbd']); pipe(t, t.at(0.04));
    leanTo(t, t.at(0.46), t.at(0.95), 5);
    K.bike?.(t.s * (b + 6.3), t.at(0.7), Math.PI / 2, 'c#3f6a5a/0.4', 0, { lean: -t.s * 0.2 }); t.hit(b + 5, b + 7.2, t.at(0.7) - 3, t.at(0.7) + 3, 3.3);
  });
  // (309, The Lantern: a false front; its back is the picture garden's screen, places.js)
  back('grocery', (t, b, hex) => {                              // 311. Touch: herbs in a box under the scullery window.
    door(t, t.at(0.68), '#5a6a58', { hinge: -1, lamp: true }); win(t, t.at(0.3), 4.6, 3, 4, 'b'); herbBox(t, t.at(0.3), 4.6, 3); upper(t, C3, ['ddb', 'dcd']); pipe(t, t.at(0.05));
  });
  back('apothecary', (t, b, hex) => {                           // 313. A wooden stair to the flat over the shop. Nothing extra.
    const H = stair(t, t.at(0.93), t.y0 + 5.4, t.y0 + 1.0), vd = t.y0 + 3.2;
    door(t, vd, hex, { fan: false }); door(t, vd, shade(hex, 1.5), { h0: H, step: false, hinge: -1 });
    upper(t, C3, [' db', 'dcd']); pipe(t, t.y0 + 0.4);      // (the pipe at the east end: the west end, by 315's stair landing, is kept clear)
  });
  back('plants', (t, b) => {                                    // 315. The Gloaming's stair climbs this wall (shops/rooftop.js): only a door and a window under it.
    door(t, t.at(0.22), '#4f6a55', { fan: false }); win(t, t.at(0.5), 4.4, 3, 4, 'd');
  });

  // ---- south: South Main Street, Block 43 ---------------------------------------------------------------
  back('records', (t, b, hex) => {                              // no. 24, four storeys. Nothing extra.
    door(t, t.at(0.22), '#2a2a2c'); win(t, t.at(0.6), 4.4, 3.4, 4, 'd'); upper(t, C3W, ['dbd', 'cdd', 'ddb'], 3.2); pipe(t, t.at(0.04));
  });
  back('museum', (t, b, hex) => {                               // no. 22. Nothing extra.
    door(t, t.at(0.76), hex, { hinge: -1, lamp: true }); win(t, t.at(0.3), 4.4, 3.4, 4, 'd'); upper(t, C3W, ['ddc', 'bdd'], 3.2); pipe(t, t.at(0.04));
  });
  back('bakery', (t, b, hex) => {                               // no. 23 (17 ft). The oven's stack. Touch: the one notice behind the street.
    const vd = t.at(0.24);
    door(t, vd, hex); upper(t, [0.22, 0.52], ['bd', 'dd'], 2.8); stack(t, t.at(0.78)); pipe(t, t.y1 - 0.55);
    t.sign(b + 0.03, vd + 2.9, 5.2, 'out', 1.7, 1.2, (g, w, h) => {
      paper(g, w, h, '#fbf4e6', 3);
      T(g, 'BAKER ASLEEP', w / 2, h * 0.24, h * 0.2, '#7a4a3c', { f: F.bebas, max: w * 0.86 });
      T(g, 'nine till three.', w / 2, h * 0.52, h * 0.19, '#2a1c13', { f: F.caveat, w: 600, max: w * 0.86 });
      T(g, 'knock only if you are flour.', w / 2, h * 0.78, h * 0.17, '#a8361f', { f: F.caveat, w: 600, max: w * 0.88 });
    }, { cw: 204, ch: 144 });
    // (it used to be a door to knock at; now it opens)
  });
  back('noodles', (t, b, hex) => {                              // no. 23 (20 ft). The kitchen's flue. Touch: its thread of steam.
    door(t, t.at(0.74), '#7a2f26', { hinge: -1, lamp: true }); win(t, t.at(0.26), 4.6, 3, 4, 'b'); upper(t, [0.2, 0.8], ['dc', 'bd']); pipe(t, t.at(0.04));
    flue(t, t.at(0.5), 10.5);
  });

  // ======================================================================================
  // THE LANES: trodden gravel behind each unbroken run of backs (a single building does not get one)
  // ======================================================================================
  const OUT = 10;
  const trees = K.trees ?? [];
  for (const s of [1, -1]) {
    const lots = Object.values(L).filter(l => l.side === s && l.enter).sort((a, c) => a.y0 - c.y0), runs = [];
    for (const l of lots) { const r = runs[runs.length - 1]; if (r && Math.abs(r[r.length - 1].y1 - l.y0) < 0.01 && Math.abs(r[0].back - l.back) < 0.01) r.push(l); else runs.push([l]); }
    for (const run of runs) {
      const b = run[0].back, v0 = run[0].y0, v1 = run[run.length - 1].y1; if (v1 - v0 < 30) continue;
      const pts = [[b + 3, v0 - 3], [b + OUT - 2, v0 + 1]];        // round the end wall and along
      for (let v = v0 + 7; v < v1 - 2; v += 9) {
        let u = b + OUT;                                         // step round any tree that stands in the way
        for (const tr of trees) if (Math.abs(-tr.z - v) < 6 && Math.abs(s * tr.x - u) < 4.5) u = Math.max(b + 6.5, s * tr.x - 4.5);
        pts.push([u, v]);
      }
      pts.push([b + OUT, v1 - 1]);
      if (!free(s * (b + 4), s * (b + OUT + 2), v0, v1, 0)) continue;
      K.G.ribbon('gravel', pts.map(([u, v]) => [s * u, -v]), 3.4, { wobble: 0.12 });
      for (let v = v0 + 4; v < v1 - 2; v += 11) K.F.add(K.pick(['grass', 'grass', 'grass', 'wildflowers']), s * (b + OUT + 2.6 + K.r() * 1.2), -(v + K.r() * 3), 0.6 + K.r() * 0.3);
    }
  }

  // ======================================================================================
  // THE TWO SET PIECES
  // ======================================================================================
  { // ---- 1. the allotment, across the south lane behind the museum: six rows, bean canes, a shed --------------
    const lot = L.museum;
    if (lot) {
      const t = tools(lot), b = t.b, u0 = b + OUT + 3.5, u1 = u0 + 13, v0 = t.y0 + 1.5, v1 = v0 + 15.5, sv0 = v1 + 3, sv1 = sv0 + 6.8, su0 = u0 + 3, su1 = su0 + 7.4;
      if (free(t.s * u0, t.s * u1, v0, sv1)) {
        K.G.rect('soil', Math.min(t.s * u0, t.s * u1), Math.max(t.s * u0, t.s * u1), -v1, -v0);
        for (const [a0, a1, c0, c1] of [[u0 - 0.2, u1 + 0.2, v0 - 0.25, v0], [u0 - 0.2, u1 + 0.2, v1, v1 + 0.25], [u0 - 0.2, u0, v0, v1], [u1, u1 + 0.2, v0, v1]]) t.box(PINE, a0, a1, c0, c1, 0, 0.5);
        const rows = [[1.4, ['lettuce', 'lettuceRed'], 1.2, 1.0], [3.5, ['kale', 'chard'], 1.6, 1.0], [5.6, ['leek', 'carrot'], 1.1, 1.0], [7.7, ['tomato'], 2.1, 0.85], [9.7, ['bean'], 1.9, 0.9], [11.7, ['squash', 'cabbage'], 2.4, 1.0]];
        for (const [du, kinds, step, sc] of rows) { let i = 0; for (let v = v0 + 1.2; v < v1 - 0.6; v += step) t.plant(kinds[i++ % kinds.length], u0 + du + (K.r() - 0.5) * 0.3, v + (K.r() - 0.5) * 0.2, sc * (0.85 + K.r() * 0.3)); }
        for (let v = v0 + 1.2; v < v1 - 0.6; v += 1.9) for (const du of [-0.5, 0.5]) t.tube('c#c9a56a/0.9', [u0 + 9.7 + du, v, 0], [u0 + 9.7, v, 6.8], 0.03, 3);
        t.tube('c#c9a56a/0.9', [u0 + 9.7, v0 + 1.2, 6.6], [u0 + 9.7, v1 - 1, 6.6], 0.03, 3);
        shed(t, su0, su1, sv0, sv1);
      }
    }
  }
  { // ---- 2. a bench across the north lane, under the tree behind the bicycle shop -----------------------------
    const lot = L.bikes;
    if (lot) {
      const t = tools(lot), b = t.b, vm = t.at(0.5);
      const tr = trees.filter(q => t.s * q.x > b + OUT + 5 && t.s * q.x < b + 30 && -q.z > t.y0 - 6 && -q.z < t.y1 + 6).sort((p, q) => Math.abs(-p.z - vm) - Math.abs(-q.z - vm))[0];
      const u = tr ? Math.max(b + OUT + 3.4, t.s * tr.x - 5.5) : b + OUT + 4, v = tr ? -tr.z : vm;
      if (free(t.s * (u - 2), t.s * (u + 2), v - 4, v + 4)) t.bench(u, v, 'in', 'sit behind the shops');
    }
  }
}

// ---- once the scene exists: the one door that can be knocked on (the windows are flats.js's) ----------
export function backsLife(ctx, K) {
  const B = K.backs; if (!B) return;
  for (const k of B.knocks) {
    let n = 0;
    ctx.interact?.push({ x: k.x, y: k.y, z: k.z, reach: 7, size: 1.6, label: () => k.label, act: () => {
      try { ctx.sound?.note?.(45, 0, 0.07, 0.25); ctx.sound?.note?.(45, 0.16, 0.07, 0.25); ctx.sound?.note?.(43, 0.32, 0.09, 0.3); } catch { /* no sound yet */ }
      ctx.flash?.(k.lines[n++ % k.lines.length]);
    } });
  }
}
