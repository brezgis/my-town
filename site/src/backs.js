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
// Plain colours only, so it all lands in the street's one painted mesh; the panes are one drawn sheet.

import * as THREE from 'three';
import { T, F, fill, paper, disc, rect, rrect, line, poly } from './draw.js';

const IRON = 'c#2e2c2a/0.6', ZINCD = 'c#7d8286/0.6', WOOD = 'c#8a6a48/0.85', WOODD = 'c#5a4432/0.85', PINE = 'c#c2a878/0.9';
const CREAM = 'c#e8e0cc/0.75', STONE = 'c#a39c90/0.95', BRASS = 'c#b9954e/0.4', BRICK = 'brick#8a6a5c', DRAIN = 'c#3a3835/0.8';
const LAMP = 'e#ffe2b4/1.7';

const shade = (hex, k) => '#' + [1, 3, 5].map(i => Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k))).toString(16).padStart(2, '0')).join('');
const P = (hex, rough = 0.9) => `c${hex}/${rough}`;

// ---- what is behind the glass: five panes on one sheet (flats.js does the fronts the same way) ----------
const DARK = 4, KIND = { b: 0, c: 1, k: 2, f: 3, d: DARK };
const PANES = [
  (g, w, h) => {                                                // b: a blind half down
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffdf9f'); gr.addColorStop(1, '#c9853f'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    rect(g, 0, 0, w, h * 0.52, '#f2dfb4'); for (let y = 4; y < h * 0.52; y += 7) rect(g, 0, y, w, 1.5, 'rgba(120,80,30,.25)'); rect(g, 0, h * 0.52, w, 3, '#8a6a3a'); line(g, [[w * 0.5, h * 0.52], [w * 0.5, h * 0.62]], '#5a3a1c', 1.5); disc(g, w * 0.5, h * 0.63, 3, '#5a3a1c');
  },
  (g, w, h) => {                                                // c: curtains drawn
    fill(g, w, h, '#f0c98a'); for (let x = 0; x < w; x += w / 7) { const gr = g.createLinearGradient(x, 0, x + w / 7, 0); gr.addColorStop(0, 'rgba(120,70,20,.3)'); gr.addColorStop(0.5, 'rgba(255,240,200,.2)'); gr.addColorStop(1, 'rgba(120,70,20,.3)'); g.fillStyle = gr; g.fillRect(x, 0, w / 7, h); }
  },
  (g, w, h) => {                                                // k: a kitchen: pans on hooks, a plant on the sill
    const gr = g.createRadialGradient(w * 0.5, h * 0.3, 4, w / 2, h / 2, h * 0.8); gr.addColorStop(0, '#ffe6b0'); gr.addColorStop(1, '#c07d3d'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    rect(g, 0, h * 0.1, w, 2.5, '#3a2418'); [[0.2, 0.13], [0.48, 0.16], [0.78, 0.11]].forEach(([x, r]) => { line(g, [[w * x, h * 0.1], [w * x, h * 0.18]], '#3a2418', 2); disc(g, w * x, h * 0.18 + w * r, w * r, '#3a2418'); });
    rrect(g, w * 0.6, h * 0.86, w * 0.2, h * 0.14, 3, '#3a2418'); g.strokeStyle = '#1f2a18'; g.lineWidth = 2.5; g.lineCap = 'round'; for (const a of [-1.1, -0.5, 0.1, 0.6, 1.0]) { g.beginPath(); g.moveTo(w * 0.7, h * 0.86); g.quadraticCurveTo(w * 0.7 + Math.sin(a) * 10, h * 0.76, w * 0.7 + Math.sin(a) * 26, h * (0.74 + Math.abs(a) * 0.06)); g.stroke(); }
  },
  (g, w, h) => {                                                // f: the light over a door
    const gr = g.createRadialGradient(w / 2, h, 2, w / 2, h, w * 0.7); gr.addColorStop(0, '#fff0c0'); gr.addColorStop(1, '#d99a4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  },
  (g, w, h) => {                                                // d: nobody in: the sky in the glass
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2a3442'); gr.addColorStop(0.5, '#4a5360'); gr.addColorStop(1, '#1c222c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    poly(g, [[0, h * 0.5], [w * 0.5, 0], [w * 0.72, 0], [0, h * 0.72]], 'rgba(255,255,255,.07)'); rect(g, 0, 0, w, h * 0.22, 'rgba(230,220,200,.2)');
  },
];

export function buildBacks(K, town) {
  const kit = K.kit, L = town.lots, panes = [], knocks = [];
  K.backs = { panes, knocks };
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
  const pane = (t, v, h0, w, hh, kind) => panes.push({ x: t.s * (t.b + 0.12), y: h0 + hh / 2, z: -v, w, h: hh, side: t.s, kind });

  // A sash window: a stone sill and lintel, the sash as one painted panel with the glass drawn on it.
  function win(t, v, h0, w, hh, kind) {
    const b = t.b;
    t.box(STONE, b, b + 0.3, v - w / 2 - 0.3, v + w / 2 + 0.3, h0 - 0.28, h0);
    t.box(STONE, b, b + 0.08, v - w / 2 - 0.2, v + w / 2 + 0.2, h0 + hh, h0 + hh + 0.5);
    t.box(CREAM, b, b + 0.1, v - w / 2, v + w / 2, h0, h0 + hh);
    t.box(CREAM, b + 0.1, b + 0.16, v - w / 2, v + w / 2, h0 + hh / 2 - 0.07, h0 + hh / 2 + 0.07);
    pane(t, v, h0 + 0.14, w - 0.28, hh - 0.28, KIND[kind] ?? DARK);
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
    if (fan) panes.push({ x: t.s * (b + 0.18), y: h1 + 0.8, z: -v, w, h: 1.2, side: t.s, kind: KIND.f });
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
    t.box(BRICK, b, b + 1.5, v - w / 2, v + w / 2, 0, h1, { collide: true }); t.box(STONE, b - 0.12, b + 1.62, v - w / 2 - 0.12, v + w / 2 + 0.12, h1, h1 + 0.3);
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
    t.box('c#4a5a44/0.8', t.b + 0.04, t.b + 0.8, v - w / 2 - 0.15, v + w / 2 + 0.15, h - 0.95, h - 0.3);
    for (let i = 0; i < 4; i++) t.plant('herbs', t.b + 0.42, v - w / 2 + 0.35 + i * (w - 0.7) / 3, 0.55, { y: h - 0.4 });
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
        // the shed: boarded, a felt roof, a door and a small window toward the lane, a spade left leaning
        const hw = 6.6, pk = hw + 2.3, vm = (sv0 + sv1) / 2, GRN = '#6a8474';
        t.box(P(GRN, 0.85), su0, su1, sv0, sv1, 0, hw); for (const [dv, dh] of [[2.6, 0.8], [1.7, 1.4], [0.8, 1.95]]) t.box(P(GRN, 0.85), su0 + 0.02, su1 - 0.02, vm - dv, vm + dv, hw, hw + dh);      // the gables, stepped up under the felt
        for (const sg of [-1, 1]) t.beam('c#4a4640/0.9', [(su0 + su1) / 2, vm + sg * (vm - sv0 + 0.5), hw - 0.2], [(su0 + su1) / 2, vm, pk + 0.1], su1 - su0 + 0.8, 0.14);
        t.box(P(shade(GRN, 0.72), 0.8), su0 - 0.06, su0, vm - 2.9, vm - 0.3, 0.1, 6.0); t.box(CREAM, su0 - 0.05, su0, vm + 0.5, vm + 2.7, 2.6, 5.4);
        panes.push({ x: t.s * (su0 - 0.07), y: 4.0, z: -(vm + 1.6), w: 1.9, h: 2.5, side: -t.s, kind: DARK });
        t.tube(WOOD, [su0 - 1.0, vm + 3.0, 0.5], [su0 - 0.1, vm + 3.0, 5.4], 0.05); t.box('c#8d9296/0.6', su0 - 1.12, su0 - 0.98, vm + 2.74, vm + 3.26, 0, 0.6);
        t.hit(su0 - 0.2, su1 + 0.2, sv0 - 0.2, sv1 + 0.2, 9);
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

// ---- once the scene exists: the panes (lit after dark), and the one door that can be knocked on ----------
export function backsLife(ctx, K) {
  const B = K.backs; if (!B) return;
  const { scene, animated, day } = ctx;
  const on = () => 1 - THREE.MathUtils.smoothstep(day.light, 0.42, 0.97);
  {
    const N = PANES.length, cw = 96, ch = 160, c = document.createElement('canvas'); c.width = N * cw; c.height = ch; const g = c.getContext('2d');
    PANES.forEach((draw, i) => { g.save(); g.translate(i * cw, 0); g.beginPath(); g.rect(0, 0, cw, ch); g.clip(); draw(g, cw, ch); g.restore(); });
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const lit = [], dark = [];
    for (const p of B.panes) {
      const geo = new THREE.PlaneGeometry(p.w, p.h).toNonIndexed(), uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setX(i, (p.kind + 0.03 + uv.getX(i) * 0.94) / N);
      geo.rotateY(p.side > 0 ? Math.PI / 2 : -Math.PI / 2); geo.translate(p.x, p.y, p.z);
      (p.kind === DARK ? dark : lit).push(geo);
    }
    const mk = (list, name, base) => {
      if (!list.length) return null;
      const n = list.reduce((a, q) => a + q.attributes.position.count, 0), pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
      for (const q of list) { pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); uv.set(q.attributes.uv.array, o * 2); o += q.attributes.position.count; }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0x3a3a36, roughness: 0.25, envMapIntensity: 1.1, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: base });
      const m = new THREE.Mesh(geo, mat); m.name = name; m.userData.cat = 'flats'; scene.add(m); return mat;
    };
    const mLit = mk(lit, 'backs lit', 0.12); mk(dark, 'backs dark', 0.2);
    if (mLit) animated.push(() => { mLit.emissiveIntensity = 0.12 + 1.1 * on(); });
  }
  for (const k of B.knocks) {
    let n = 0;
    ctx.interact?.push({ x: k.x, y: k.y, z: k.z, reach: 7, size: 1.6, label: () => k.label, act: () => {
      try { ctx.sound?.note?.(45, 0, 0.07, 0.25); ctx.sound?.note?.(45, 0.16, 0.07, 0.25); ctx.sound?.note?.(43, 0.32, 0.09, 0.3); } catch { /* no sound yet */ }
      ctx.flash?.(k.lines[n++ % k.lines.length]);
    } });
  }
}
