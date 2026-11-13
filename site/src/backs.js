// The backs of the buildings: what you find if you walk round behind the shops. Every back wall
// gets a door, windows, pipes and a meter; every yard says what the shop in front of it is. A
// lane of trodden gravel runs along behind each side of the street, from the Landing's pavement
// round to the Yard, and from the far yards round to the Overlook.
//
// Everything is given per lot as (u, v, h): u feet out from the street's centre line (the back
// wall's outer face is u = lot.back), v along the street (plan Y), h up. So one description
// serves either side of the street. Plain colours only, so it all lands in the street's one
// painted mesh; the window panes are one drawn sheet (two materials: lit and dark).

import * as THREE from 'three';
import { T, F, fill, grain, paper, board, slate, disc, rect, rrect, line, poly, ICON, rnd, TAU } from './draw.js';

const IRON = 'c#2e2c2a/0.6', ZINC = 'c#a4a9aa/0.5', ZINCD = 'c#7d8286/0.6', WOOD = 'c#8a6a48/0.85', WOODD = 'c#5a4432/0.85', PINE = 'c#c2a878/0.9', PINED = 'c#a88e62/0.9';
const CREAM = 'c#e8e0cc/0.75', STONE = 'c#a39c90/0.95', SOLDIER = 'c#7a5648/0.95', TERRA = 'c#b8653f/0.92', JUTE = 'c#b59a6a/1', WHITE = 'c#eeeae0/0.9', RUBBER = 'c#1c1c1c/0.9', BRASS = 'c#b9954e/0.4', SOIL = 'c#3a2c22/1';
const LAMP = 'e#ffe2b4/1.7', LANT = 'e#ffb866/2.2';
const INK = '#2a1c13', RED = '#a8361f';
const POT = [[0.01, 0], [0.62, 0], [0.86, 1.0], [0.96, 1.04], [0.97, 1.2], [0.86, 1.2], [0.84, 1.1]];

const shade = (hex, k) => '#' + [1, 3, 5].map(i => Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k))).toString(16).padStart(2, '0')).join('');
const P = (hex, rough = 0.9) => `c${hex}/${rough}`;
// A notice: lines of text, or [text, colour, face, scale]. o: bg, slate, board + edge, ink, f, flip (upside down), pin
const note = (lines, o = {}) => (g, w, h) => {
  if (o.slate) slate(g, w, h); else if (o.board) board(g, w, h, o.board, o.edge, { inset: h * 0.06 }); else paper(g, w, h, o.bg ?? '#efe7d2', o.seed ?? 3);
  if (o.flip) { g.translate(w, h); g.rotate(Math.PI); }
  const n = lines.length, m = o.board ? 0.15 : 0.09, lh = h * (1 - 2 * m) / n;
  lines.forEach((ln, i) => {
    const [txt, col, f, k] = Array.isArray(ln) ? ln : [ln], face = f ?? o.f ?? F.caveat;
    T(g, txt, w / 2, h * m + lh * (i + 0.5), lh * 0.8 * (k ?? 1), col ?? o.ink ?? INK, { f: face, w: face === F.caveat || face === F.fraunces ? 600 : 'normal', max: w * 0.9 });
  });
  if (o.pin) disc(g, w / 2, Math.max(4, h * 0.05), Math.max(3, h * 0.03), o.pin);
};
const px = (w, tall, ppf = 100, max = 380) => { const k = Math.min(ppf, max / Math.max(w, tall)); return { cw: Math.max(48, Math.round(w * k)), ch: Math.max(32, Math.round(tall * k)) }; };

// ---- what is behind the glass: ten panes on one sheet (flats.js does the fronts the same way) ----------
const DARK = 7;
const PANES = [
  (g, w, h) => {                                                // 0: a blind half down
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffdf9f'); gr.addColorStop(1, '#c9853f'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    rect(g, 0, 0, w, h * 0.52, '#f2dfb4'); for (let y = 4; y < h * 0.52; y += 7) rect(g, 0, y, w, 1.5, 'rgba(120,80,30,.25)'); rect(g, 0, h * 0.52, w, 3, '#8a6a3a'); line(g, [[w * 0.5, h * 0.52], [w * 0.5, h * 0.62]], '#5a3a1c', 1.5); disc(g, w * 0.5, h * 0.63, 3, '#5a3a1c');
  },
  (g, w, h) => {                                                // 1: curtains drawn
    fill(g, w, h, '#f0c98a'); for (let x = 0; x < w; x += w / 7) { const gr = g.createLinearGradient(x, 0, x + w / 7, 0); gr.addColorStop(0, 'rgba(120,70,20,.3)'); gr.addColorStop(0.5, 'rgba(255,240,200,.2)'); gr.addColorStop(1, 'rgba(120,70,20,.3)'); g.fillStyle = gr; g.fillRect(x, 0, w / 7, h); }
  },
  (g, w, h) => {                                                // 2: frosted glass, bottles on the sill
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e9f0d8'); gr.addColorStop(1, '#b9c9a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (const [x, bw, bh] of [[0.14, 0.1, 0.3], [0.3, 0.14, 0.2], [0.5, 0.08, 0.36], [0.64, 0.12, 0.24], [0.84, 0.1, 0.16]]) { rrect(g, w * (x - bw / 2), h * (1 - bh), w * bw, h * bh, 4, 'rgba(70,90,80,.42)'); rect(g, w * (x - bw * 0.18), h * (1 - bh - 0.05), w * bw * 0.36, h * 0.06, 'rgba(70,90,80,.42)'); }
    grain(g, w, h, 0.12, 12);
  },
  (g, w, h) => {                                                // 3: a kitchen: pans on hooks, a plant
    const gr = g.createRadialGradient(w * 0.5, h * 0.3, 4, w / 2, h / 2, h * 0.8); gr.addColorStop(0, '#ffe6b0'); gr.addColorStop(1, '#c07d3d'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    rect(g, 0, h * 0.1, w, 2.5, '#3a2418'); [[0.2, 0.13], [0.48, 0.16], [0.78, 0.11]].forEach(([x, r]) => { line(g, [[w * x, h * 0.1], [w * x, h * 0.18]], '#3a2418', 2); disc(g, w * x, h * 0.18 + w * r, w * r, '#3a2418'); });
    rrect(g, w * 0.6, h * 0.86, w * 0.2, h * 0.14, 3, '#3a2418'); g.strokeStyle = '#1f2a18'; g.lineWidth = 2.5; g.lineCap = 'round'; for (const a of [-1.1, -0.5, 0.1, 0.6, 1.0]) { g.beginPath(); g.moveTo(w * 0.7, h * 0.86); g.quadraticCurveTo(w * 0.7 + Math.sin(a) * 10, h * 0.76, w * 0.7 + Math.sin(a) * 26, h * (0.74 + Math.abs(a) * 0.06)); g.stroke(); }
  },
  (g, w, h) => {                                                // 4: a robot having a quiet look out (no cats on this street)
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffdf9f'); gr.addColorStop(1, '#d08f48'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const c = '#241a14'; g.fillStyle = c; g.beginPath(); g.ellipse(w * 0.5, h * 0.8, w * 0.2, h * 0.17, 0, 0, TAU); g.fill(); rect(g, w * 0.49, h * 0.55, w * 0.02, h * 0.1, c); disc(g, w * 0.5, h * 0.54, w * 0.035, c);
    disc(g, w * 0.43, h * 0.76, w * 0.035, '#ffdf9f'); disc(g, w * 0.57, h * 0.76, w * 0.035, '#ffdf9f');

  },
  (g, w, h) => {                                                // 5: venetian blinds
    fill(g, w, h, '#f3cf8c'); for (let y = 0; y < h; y += 9) { rect(g, 0, y, w, 5.5, '#f8e6bc'); rect(g, 0, y + 5.5, w, 1.5, 'rgba(110,70,20,.4)'); } for (const x of [0.22, 0.78]) rect(g, w * x, 0, 1.5, h, 'rgba(110,70,20,.5)');
  },
  (g, w, h) => {                                                // 6: the light over a door
    const gr = g.createRadialGradient(w / 2, h, 2, w / 2, h, w * 0.7); gr.addColorStop(0, '#fff0c0'); gr.addColorStop(1, '#d99a4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  },
  (g, w, h) => {                                                // 7: nobody in: the sky in the glass
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2a3442'); gr.addColorStop(0.5, '#4a5360'); gr.addColorStop(1, '#1c222c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    poly(g, [[0, h * 0.5], [w * 0.5, 0], [w * 0.72, 0], [0, h * 0.72]], 'rgba(255,255,255,.07)'); rect(g, 0, 0, w, h * 0.22, 'rgba(230,220,200,.2)');
  },
  (g, w, h) => {                                                // 8: a robot at the sink
    const gr = g.createRadialGradient(w * 0.6, h * 0.25, 4, w / 2, h / 2, h * 0.8); gr.addColorStop(0, '#ffe9b8'); gr.addColorStop(1, '#bf7d3d'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const c = '#2a1c14'; rrect(g, w * 0.26, h * 0.56, w * 0.48, h * 0.5, 14, c); rrect(g, w * 0.3, h * 0.36, w * 0.4, h * 0.2, 12, c); rect(g, w * 0.49, h * 0.26, w * 0.025, h * 0.1, c); disc(g, w * 0.5, h * 0.25, w * 0.04, c);
    disc(g, w * 0.42, h * 0.45, w * 0.045, '#ffe9c0'); disc(g, w * 0.58, h * 0.45, w * 0.045, '#ffe9c0'); line(g, [[w * 0.74, h * 0.66], [w * 0.9, h * 0.58]], c, 6); disc(g, w * 0.9, h * 0.55, w * 0.07, null, c, 3);
  },
  (g, w, h) => {                                                // 9: a stock room: shelves of boxes
    fill(g, w, h, '#e0a862'); const r = rnd(41); for (let k = 0; k < 4; k++) { const y = h * (0.25 + k * 0.25); rect(g, 0, y, w, 3, '#3a2418'); for (let x = 3; x < w - 8;) { const bw = 10 + r() * 16, bh = h * (0.08 + r() * 0.13); if (r() < 0.8) rect(g, x, y - bh, bw, bh, r() < 0.5 ? 'rgba(58,36,24,.85)' : 'rgba(110,70,40,.75)'); x += bw + 3; } }
  },
];

export function buildBacks(K, town) {
  const kit = K.kit, L = town.lots, panes = [], knocks = [];
  K.backs = { panes, knocks };
  if (!K.steam) K.steam = [];

  // ---- one lot's tools --------------------------------------------------------------------------------
  // Every yard below is written out once, in feet along the street measured as if its lot began at `from`;
  // the lot's real y0 shifts it, so a shop's yard follows its lot wherever the lot is.
  const tools = (lot, from = lot.y0) => {
    const s = lot.side, b = lot.back, sh = lot.y0 - from, Q = { out: s > 0 ? 3 : 1, in: s > 0 ? 1 : 3, e: 2, w: 0 };
    const YAW = { out: s * Math.PI / 2, in: -s * Math.PI / 2, w: Math.PI, e: 0 };
    const W3 = p => [s * p[0], p[2], -(p[1] + sh)], Z = v => -(v + sh);
    const t = {
      s, b, lot, y0: from, y1: from + (lot.y1 - lot.y0), top: lot.top, X: u => s * u, Z,
      box: (mat, u0, u1, v0, v1, h0, h1, o) => K.box(mat, Math.min(s * u0, s * u1), Math.max(s * u0, s * u1), Math.min(h0, h1), Math.max(h0, h1), Math.min(Z(v0), Z(v1)), Math.max(Z(v0), Z(v1)), o),
      cyl: (mat, u, v, h0, h1, r0, r1 = r0, seg = 8) => K.cyl(mat, s * u, h0, h1, Z(v), r0, r1, seg),
      tube: (mat, a, c, rad = 0.04, seg = 5) => K.tube(mat, W3(a), W3(c), rad, seg),
      beam: (mat, a, c, w, h) => K.beam(mat, W3(a), W3(c), w, h),
      ball: (mat, u, v, h, rad, sy = 1, su = 1, sv = 1) => K.sphere(mat, s * u, h, Z(v), rad, sy, 1, su, sv),
      lathe: (mat, u, v, h, profile, seg = 12, sc = 1) => K.lathe(mat, s * u, h, Z(v), profile, seg, sc),
      rock: (mat, u, v, h, su, sy, sv, rot) => K.rock(mat, s * u, h, Z(v), su, sy, sv, rot, 1),
      torus: (mat, u, v, h, R, r, plane = 'wall', seg = 18) => { const g = new THREE.TorusGeometry(R, r, 5, seg); if (plane === 'wall') g.rotateY(Math.PI / 2); else if (plane === 'flat') g.rotateX(Math.PI / 2); g.translate(s * u, h, Z(v)); K.put(mat, g); },
      hit: (u0, u1, v0, v1, h1 = 4, h0 = 0) => K.collide(s * u0, s * u1, Z(v0), Z(v1), h1, h0),
      surf: (u0, u1, v0, v1, h) => K.surface(Math.min(s * u0, s * u1), Math.max(s * u0, s * u1), Math.min(Z(v0), Z(v1)), Math.max(Z(v0), Z(v1)), h),
      sign: (u, v, h, face, w, tall, draw, o) => kit.sign(kit.fr(s * u, v + sh, 0, Q[face]), 0, 0, h, w, tall, draw, o),
      plant: (kind, u, v, sc = 1, o) => K.F.add(kind, s * u, Z(v), sc, o),
      pot: (u, v, h, size, plants, o) => K.pot(s * u, h, Z(v), size, plants, o),
      glow: (u, v, h, r = 0.17, mat = LAMP) => { K.B.mesh(mat, new THREE.SphereGeometry(r, 8, 6).translate(s * u, h, Z(v))); K.glowDots.push([s * u, h, Z(v), r * 8]); },
      lamp: (u, v, h, power = 0.7) => K.lamp(s * u, h, Z(v), power),
      seat: (u, v, h, face, label) => K.seat(s * u, h, Z(v), YAW[face] + Math.PI, label),
      bench: (u, v, face, label = 'sit a while', o) => { K.bench(s * u, Z(v), YAW[face], o); K.seat(s * u, 1.4, Z(v), YAW[face] + Math.PI, label); },
      bike: (u, v, yaw, col, y0 = 0, o) => K.bike?.(s * u, v + sh, yaw, col, y0, o),
    };
    return t;
  };
  // the lots in street order; the number on a back door is the number on the front (fronts.js counts the same way)
  const ALL = Object.values(L), sideLots = s => ALL.filter(l => l.side === s && l.id !== 'cinema').sort((a, c) => a.y0 - c.y0);
  const numOf = lot => String((lot.side > 0 ? 1 : 2) + 2 * ALL.filter(l => l.side === lot.side).indexOf(lot) + 10);
  const nextTo = lot => ALL.find(l => l.side === lot.side && l !== lot && Math.abs(l.y0 - lot.y1) < 0.01 && l.id !== 'cinema');
  const yard = (id, from, fn) => { const lot = L[id]; if (lot) fn(tools(lot, from), lot.back); };

  // ---- the parts every back wall is made of -----------------------------------------------------------
  const pane = (t, v, h0, w, hh, kind, u = t.b + 0.05) => panes.push({ x: t.s * u, y: h0 + hh / 2, z: t.Z(v), w, h: hh, side: t.s, kind });

  // A sash window on the wall: stone sill, a soldier course over it, painted frame; the pane is drawn.
  function win(t, v, h0, w, hh, kind, o = {}) {
    const b = t.b, TR = o.trim ?? CREAM;
    t.box(STONE, b, b + 0.32, v - w / 2 - 0.3, v + w / 2 + 0.3, h0 - 0.28, h0);
    t.box(SOLDIER, b, b + 0.05, v - w / 2 - 0.3, v + w / 2 + 0.3, h0 + hh, h0 + hh + 0.5);
    for (const sg of [-1, 1]) t.box(TR, b, b + 0.14, v + sg * (w / 2 - 0.14), v + sg * w / 2, h0, h0 + hh);
    t.box(TR, b, b + 0.14, v - w / 2, v + w / 2, h0 + hh - 0.14, h0 + hh); t.box(TR, b, b + 0.14, v - w / 2, v + w / 2, h0, h0 + 0.14);
    t.box(TR, b, b + 0.12, v - w / 2, v + w / 2, h0 + hh / 2 - 0.06, h0 + hh / 2 + 0.06);
    if (o.mullion) t.box(TR, b, b + 0.1, v - 0.05, v + 0.05, h0, h0 + hh);
    pane(t, v, h0 + 0.1, w - 0.2, hh - 0.2, kind);
    if (o.bars) for (let a = -w / 2 + 0.45; a < w / 2 - 0.2; a += 0.5) t.tube(IRON, [b + 0.2, v + a, h0 - 0.05], [b + 0.2, v + a, h0 + hh + 0.05], 0.03, 4);
    if (o.box) {                                                 // a window box on brackets, and what grows in it
      t.box(o.boxCol ?? 'c#4a5a44/0.8', b + 0.04, b + 0.8, v - w / 2 - 0.15, v + w / 2 + 0.15, h0 - 0.95, h0 - 0.3);
      for (let i = 0; i < 5; i++) t.plant(o.box[i % o.box.length], b + 0.42, v - w / 2 + 0.3 + i * (w - 0.6) / 4, 0.55, { y: h0 - 0.4 });
    }
  }

  // A back door: frame, panelled leaf, knob, letter flap, a light over it, a step, a mat, a number.
  function door(t, v, hex, o = {}) {
    const b = t.b, w = 3.1, h0 = o.h0 ?? 0.5, h1 = h0 + 7, TR = o.trim ?? CREAM, M = P(hex, 0.6), M2 = P(shade(hex, 0.8), 0.6), hs = o.hinge ?? 1, fan = o.fan !== false;
    if (o.step !== false) { t.box(STONE, b, b + 2.6, v - w / 2 - 0.7, v + w / 2 + 0.7, 0, h0); t.surf(b, b + 2.6, v - w / 2 - 0.7, v + w / 2 + 0.7, h0); }
    for (const sg of [-1, 1]) t.box(TR, b, b + 0.16, v + sg * w / 2, v + sg * (w / 2 + 0.26), h0, h1 + 0.26);
    t.box(TR, b, b + 0.16, v - w / 2, v + w / 2, h1, h1 + 0.26);
    t.box(M, b, b + 0.07, v - w / 2, v + w / 2, h0, h1);
    for (const [a0, a1] of [[-w / 2 + 0.3, -0.12], [0.12, w / 2 - 0.3]]) for (const [p0, p1] of [[h0 + 0.5, h0 + 2.9], [h0 + 3.3, h1 - 0.5]]) t.box(M2, b + 0.07, b + 0.1, v + a0, v + a1, p0, p1);
    t.ball(BRASS, b + 0.2, v + hs * (w / 2 - 0.35), h0 + 3.25, 0.11);
    t.box(BRASS, b + 0.07, b + 0.115, v - 0.5, v + 0.5, h0 + 3.02, h0 + 3.2);
    if (fan) {
      const f0 = h1 + 0.26, f1 = f0 + 1.3;
      for (const sg of [-1, 1]) t.box(TR, b, b + 0.14, v + sg * w / 2, v + sg * (w / 2 + 0.26), f0, f1 + 0.14);
      t.box(TR, b, b + 0.14, v - w / 2, v + w / 2, f1, f1 + 0.14); t.box(TR, b, b + 0.12, v - 0.05, v + 0.05, f0, f1);
      pane(t, v, f0, w, f1 - f0, 6);
    }
    const hl = h1 + (fan ? 2.5 : 1.3);                           // the lamp: a little enamel shade on a bracket
    t.box(IRON, b, b + 0.36, v - 0.05, v + 0.05, hl + 0.3, hl + 0.38); t.cyl(IRON, b + 0.32, v, hl + 0.1, hl + 0.3, 0.32, 0.1, 8); t.glow(b + 0.32, v, hl, 0.16);
    if (o.mat) t.sign(b + 1.4, v, h0 + 0.03, 'out', 2.5, 1.5, o.mat, { flat: true, ...px(2.5, 1.5, 70), rough: 1 });
    { const num = o.num ?? numOf(t.lot); t.sign(b + 0.03, v - hs * (w / 2 + 0.85), h0 + 5.4, 'out', 0.8, 0.6, (g, cw, ch) => { fill(g, cw, ch, '#f1ebdd'); g.strokeStyle = '#1d2a4a'; g.lineWidth = 3; g.strokeRect(3, 3, cw - 6, ch - 6); T(g, num, cw / 2, ch * 0.55, ch * 0.6, '#1d2a4a', { f: F.dm, max: cw * 0.8 }); }, { cw: 96, ch: 72 }); }
    if (o.knock) knocks.push({ x: t.s * (b + 0.4), y: h0 + 4, z: t.Z(v), label: o.knock[0], lines: o.knock.slice(1) });
  }
  const doormat = (word, bg = '#8a6a44', ink = '#2a1c13') => (g, w, h) => { fill(g, w, h, bg); grain(g, w, h, 0.25, 17); g.strokeStyle = ink; g.lineWidth = 4; g.strokeRect(7, 7, w - 14, h - 14); T(g, word, w / 2, h * 0.54, h * 0.4, ink, { f: F.archivo, max: w * 0.8 }); };

  // Rainwater: a hopper under the parapet, a downpipe on brackets, a shoe over a drain; a gutter if asked.
  function pipe(t, v, o = {}) {
    const b = t.b, top = t.top, M = o.mat ?? IRON;
    t.cyl(M, b + 0.24, v, 0.5, top - 1.0, 0.15, 0.15, 7); t.box(M, b, b + 0.52, v - 0.38, v + 0.38, top - 1.0, top - 0.35);
    for (let h = 3; h < top - 2; h += 5.5) t.box(M, b, b + 0.42, v - 0.24, v + 0.24, h, h + 0.12);
    t.tube(M, [b + 0.24, v, 0.6], [b + 0.8, v, 0.22], 0.15, 6); t.box('c#3a3835/0.8', b + 0.55, b + 1.4, v - 0.42, v + 0.42, 0, 0.06);
    if (o.gutter !== false) t.box(M, b, b + 0.36, t.y0 + 0.3, t.y1 - 0.3, top - 0.62, top - 0.36);
    if (o.butt) {                                                // a water butt, on a stand, with a tap
      const u = b + 1.5, vb = v + o.butt * 1.6;
      t.lathe('c#3f5f43/0.7', u, vb, 0.6, [[0.01, 0], [1.0, 0], [1.15, 0.6], [1.15, 3.0], [1.0, 3.6], [0.9, 3.7], [0.01, 3.72]], 14); t.box(STONE, u - 0.9, u + 0.9, vb - 0.9, vb + 0.9, 0, 0.6);
      t.tube(M, [b + 0.24, v, 4.4], [u, vb, 4.3], 0.08, 5); t.box(BRASS, u + 1.1, u + 1.35, vb - 0.06, vb + 0.06, 1.2, 1.32); t.hit(u - 1.2, u + 1.2, vb - 1.2, vb + 1.2, 4.3);
    }
  }
  function meter(t, v, h = 3.4, words) {
    const b = t.b;
    t.box('c#8d9296/0.7', b, b + 0.5, v - 0.7, v + 0.7, h, h + 1.9); t.box('c#73787c/0.7', b + 0.5, b + 0.54, v - 0.62, v + 0.62, h + 0.08, h + 1.82);
    t.tube(IRON, [b + 0.1, v + 0.45, h + 1.9], [b + 0.1, v + 0.45, h + 8], 0.05, 5); t.tube(IRON, [b + 0.1, v - 0.4, 0], [b + 0.1, v - 0.4, h], 0.05, 5);
    t.sign(b + 0.56, v, h + 1.0, 'out', 1.0, 1.3, (g, w, hh) => {
      fill(g, w, hh, '#8d9296'); rrect(g, w * 0.14, hh * 0.08, w * 0.72, hh * 0.44, 5, '#e9e6da'); for (let i = 0; i < 5; i++) { rect(g, w * (0.19 + i * 0.128), hh * 0.2, w * 0.1, hh * 0.2, '#1d1b18'); T(g, '04719'[i], w * (0.24 + i * 0.128), hh * 0.31, hh * 0.15, '#e9e6da', { f: F.elite }); }
      T(g, 'kWh', w / 2, hh * 0.14, hh * 0.07, '#1d1b18', { f: F.sans }); T(g, words ?? 'ELECTRIC', w / 2, hh * 0.68, hh * 0.13, '#1d1b18', { f: F.bebas, ls: 1, max: w * 0.84 }); T(g, 'do not open', w / 2, hh * 0.86, hh * 0.12, '#7a1c12', { f: F.caveat, w: 600 });
    }, { cw: 100, ch: 130 });
  }
  function louvre(t, v, h, w = 1.6) { const b = t.b; t.box(ZINC, b, b + 0.12, v - w / 2, v + w / 2, h, h + w); for (let i = 0; i < 5; i++) { const z = h + 0.14 + i * (w - 0.3) / 5; t.box(ZINCD, b + 0.12, b + 0.2, v - w / 2 + 0.1, v + w / 2 - 0.1, z, z + 0.13); } }
  // A flue: out of the wall, up past the parapet, a hat on top; it steams unless told not to.
  function flue(t, v, h0, o = {}) {
    const b = t.b, r = o.r ?? 0.42, u = b + r + 0.3, h1 = t.top + (o.rise ?? 3.6), M = o.mat ?? ZINC;
    t.tube(M, [b, v, h0], [u, v, h0], r, 10); t.ball(M, u, v, h0, r * 1.03); t.cyl(M, u, v, h0, h1, r, r, 10);
    for (let h = h0 + 3; h < t.top - 0.5; h += 5) { t.cyl(ZINCD, u, v, h, h + 0.14, r + 0.04, r + 0.04, 10); t.box(IRON, b, u, v - 0.05, v + 0.05, h + 0.02, h + 0.12); }
    t.cyl(M, u, v, h1, h1 + 0.35, r * 0.6, r * 0.6, 8); t.cyl(ZINCD, u, v, h1 + 0.35, h1 + 0.8, r * 1.5, 0.05, 10);
    if (o.steam !== false) K.steam.push([t.s * u, h1 + 0.9, t.Z(v)]);
  }
  // Anything with rungs, lying in the plane that runs out from the wall
  function ladder(t, A, C, w = 1.3, M = IRON, rr = 0.045) {
    for (const sg of [-1, 1]) t.tube(M, [A[0], A[1] + sg * w / 2, A[2]], [C[0], C[1] + sg * w / 2, C[2]], rr, 5);
    const len = Math.hypot(C[0] - A[0], C[2] - A[2]), n = Math.floor(len);
    for (let i = 1; i <= n; i++) { const f = i / (n + 1), u = A[0] + (C[0] - A[0]) * f, h = A[2] + (C[2] - A[2]) * f; t.tube(M, [u, A[1] - w / 2, h], [u, A[1] + w / 2, h], rr * 0.75, 4); }
  }
  // An iron fire escape: a balcony at each upper floor, ladders between, and the last one drawn up out of reach.
  function fireEscape(t, v0, v1, floors) {
    const b = t.b, d = 3.4, M = IRON;
    for (let f = 0; f < floors; f++) {
      const hp = 14.3 + f * 11.5;
      t.box(M, b, b + d, v0, v0 + 0.12, hp - 0.25, hp); t.box(M, b, b + d, v1 - 0.12, v1, hp - 0.25, hp); t.box(M, b + d - 0.12, b + d, v0, v1, hp - 0.25, hp);
      for (let v = v0 + 0.3; v < v1 - 0.3; v += 0.5) t.box(M, b + 0.05, b + d - 0.1, v, v + 0.3, hp - 0.09, hp);
      for (const v of [v0 + 0.06, v1 - 0.06]) { t.tube(M, [b, v, hp - 3.2], [b + d - 0.2, v, hp - 0.2], 0.06, 4); for (const hh of [1.2, 2.3, 3.4]) t.tube(M, [b, v, hp + hh], [b + d - 0.06, v, hp + hh], 0.04, 4); }
      const n = Math.round((v1 - v0) / 3);
      for (let i = 0; i <= n; i++) { const v = v0 + 0.06 + (v1 - v0 - 0.12) * i / n; t.tube(M, [b + d - 0.06, v, hp], [b + d - 0.06, v, hp + 3.4], 0.05, 4); }
      for (const hh of [1.2, 2.3, 3.4]) t.tube(M, [b + d - 0.06, v0 + 0.06, hp + hh], [b + d - 0.06, v1 - 0.06, hp + hh], hh === 3.4 ? 0.06 : 0.035, 4);
      if (f < floors - 1) ladder(t, [b + 2.7, v1 - 1.2, hp], [b + 0.8, v1 - 1.2, hp + 11.4], 1.3, M);
    }
    ladder(t, [b + d + 0.12, v0 + 1.1, 8.2], [b + d + 0.12, v0 + 1.1, 17.6], 1.3, M);
  }
  // A wooden stair up the wall to a flat's door: foot at vA, the landing from vB to vC. Not for climbing.
  function stair(t, vA, vB, vC, o = {}) {
    const b = t.b, d = 3.3, H = 14.55, n = 19, run = (vB - vA) / n, rise = H / n, W = o.mat ?? WOOD, D = WOODD, sg = Math.sign(run);
    for (let i = 0; i < n; i++) {
      t.box(W, b + 0.1, b + d, vA + run * i, vA + run * (i + 1) + sg * 0.1, rise * (i + 1) - 0.12, rise * (i + 1));
      if (i % 2 === 0) t.box(W, b + d - 0.17, b + d - 0.08, vA + run * (i + 0.5) - 0.05, vA + run * (i + 0.5) + 0.05, rise * (i + 1), rise * (i + 1) + 3.0);
    }
    for (const u of [b + 0.17, b + d - 0.09]) t.beam(D, [u, vA, -0.45], [u, vB, H - 0.55], 0.14, 0.7);
    t.beam(D, [b + d - 0.12, vA, 3.3], [b + d - 0.12, vB, H + 3.3], 0.14, 0.2);
    t.box(D, b + d - 0.3, b + d, vA - 0.15, vA + 0.15, 0, 3.7);
    { const vm = (vA + vB) / 2; t.box(D, b + d - 0.3, b + d, vm - 0.15, vm + 0.15, 0, H / 2 - 0.4); t.hit(b + d - 0.4, b + d + 0.1, vm - 0.25, vm + 0.25, 8); }
    t.box(W, b + 0.1, b + d, vB, vC, H - 0.15, H); t.box(D, b + 0.1, b + d, vB, vC, H - 0.5, H - 0.15, undefined);
    for (const v of [vB, vC - sg * 0.3]) { t.box(D, b + d - 0.3, b + d, v, v + sg * 0.3, 0, H + 3.4); t.hit(b + d - 0.4, b + d + 0.1, v - 0.1, v + sg * 0.4, 16); }
    for (const hh of [1.7, 3.2]) { t.box(D, b + d - 0.2, b + d - 0.06, vB, vC, H + hh, H + hh + 0.16); t.box(D, b + 0.1, b + d, vC - sg * 0.2, vC - sg * 0.06, H + hh, H + hh + 0.16); }
    for (let v = vB + sg * 0.6; sg * (vC - v) > 0.5; v += sg * 0.5) t.box(W, b + d - 0.17, b + d - 0.08, v - 0.05, v + 0.05, H, H + 3.2);
    t.hit(b, b + d + 0.1, vA, vB - sg * 3.5, 16);
    return H;
  }
  function dish(t, v, h) {
    const b = t.b, s = t.s;
    t.tube(IRON, [b, v, h - 0.9], [b + 0.7, v, h - 0.9], 0.05); t.tube(IRON, [b + 0.7, v, h - 0.9], [b + 0.7, v, h + 0.1], 0.05);
    const g = new THREE.LatheGeometry([[0.02, 0], [0.5, 0.07], [0.9, 0.28], [0.92, 0.32], [0.88, 0.32], [0.5, 0.11], [0.02, 0.04]].map(([r, y]) => new THREE.Vector2(r, y)), 14);
    g.rotateZ(-s * 0.95); g.translate(s * (b + 0.8), h + 0.2, t.Z(v)); K.put(WHITE, g);
    t.tube(IRON, [b + 0.8, v, h + 0.2], [b + 0.8 + 0.85 * Math.sin(0.95), v, h + 0.2 + 0.85 * Math.cos(0.95)], 0.025, 4); t.ball(ZINCD, b + 0.8 + 0.85 * Math.sin(0.95), v, h + 0.2 + 0.85 * Math.cos(0.95), 0.1);
  }
  function aerial(t, v, du = 2) {
    const u = t.b - du, h = t.top + 0.4;
    t.tube(IRON, [u, v, h], [u, v, h + 7], 0.06, 5); t.tube(ZINC, [u, v - 1.8, h + 6.6], [u, v + 1.8, h + 6.6], 0.035, 4);
    for (let i = 0; i < 6; i++) { const vv = v - 1.6 + i * 0.64, w = 1.3 - i * 0.14; t.tube(ZINC, [u - w, vv, h + 6.6], [u + w, vv, h + 6.6], 0.022, 3); }
    t.tube(IRON, [u, v, h + 3], [u + 1.4, v, h], 0.025, 3);
  }
  // Leaves up a wall: a scatter of cards against the brick
  function creeper(t, v0, v1, h0, h1, n, kind = 'shrub', sc = 0.4, seed = 7) {
    const r = rnd(Math.round(seed + v0 * 13));
    for (let i = 0; i < n; i++) { const f = Math.pow(r(), 1.25), edge = 1 - 0.45 * f; t.plant(kind, t.b + 0.2 + r() * 0.15, (v0 + v1) / 2 + (r() - 0.5) * (v1 - v0) * edge, sc * (0.8 + 0.45 * r()), { y: h0 + (h1 - h0) * f, tint: 0.6 + 0.3 * r() }); }
  }
  function trellis(t, v0, v1, h0, h1, M = 'c#d9d2bf/0.8') {
    const b = t.b;
    for (let v = v0; v <= v1 + 0.01; v += (v1 - v0) / Math.round((v1 - v0) / 0.8)) t.box(M, b + 0.03, b + 0.09, v - 0.04, v + 0.04, h0, h1);
    for (let h = h0 + 0.5; h < h1; h += 0.95) t.box(M, b + 0.09, b + 0.13, v0 - 0.1, v1 + 0.1, h, h + 0.08);
  }
  // A wheelie bin; `face` is the way its front looks
  function bin(t, u, v, hex, words, face = 'out') {
    const M = P(hex, 0.6), M2 = P(shade(hex, 0.8), 0.6), w = 1.9, d = 2.1, h = 3.3;
    t.box(M, u - d / 2, u + d / 2, v - w / 2, v + w / 2, 0.25, h); t.box(M2, u - d / 2 - 0.1, u + d / 2 + 0.12, v - w / 2 - 0.08, v + w / 2 + 0.08, h, h + 0.16);
    for (const sg of [-1, 1]) t.box(RUBBER, u - d / 2 - 0.05, u - d / 2 + 0.6, v + sg * (w / 2 - 0.02), v + sg * (w / 2 + 0.14), 0, 0.62);
    t.tube(M2, [u - d / 2 - 0.2, v - w / 2 + 0.2, h - 0.05], [u - d / 2 - 0.2, v + w / 2 - 0.2, h - 0.05], 0.05, 4);
    if (words) { if (face === 'out') t.sign(u + d / 2 + 0.02, v, 2.0, 'out', 1.5, 1.3, words, px(1.5, 1.3, 90)); else t.sign(u, v + (face === 'w' ? 1 : -1) * (w / 2 + 0.02), 2.0, face, 1.6, 1.3, words, px(1.6, 1.3, 90)); }
    t.hit(u - d / 2 - 0.2, u + d / 2 + 0.1, v - w / 2 - 0.1, v + w / 2 + 0.1, 3.4);
  }
  const stencil = (lines, ink = '#f1ebdd') => (g, w, h) => { fill(g, w, h, '#161617'); const n = lines.length; lines.forEach((s, i) => T(g, s, w / 2, h * (i + 0.5) / n, h / n * 0.7, ink, { f: F.bebas, ls: 1, max: w * 0.92 })); };
  const label = (lines, bg, ink = '#f1ebdd') => (g, w, h) => { fill(g, w, h, bg); const n = lines.length; lines.forEach((s, i) => { const [txt, f, k] = Array.isArray(s) ? s : [s]; T(g, txt, w / 2, h * (0.08 + 0.84 * (i + 0.5) / n), h * 0.84 / n * 0.74 * (k ?? 1), ink, { f: f ?? F.bebas, w: f === F.caveat ? 600 : 'normal', max: w * 0.9 }); }); };
  // An open slatted crate (w along the wall, d out from it)
  function crate(t, u, v, h, w, d, hh, M = PINE) {
    t.box(M, u - d / 2, u + d / 2, v - w / 2, v + w / 2, h, h + 0.08);
    const n = Math.max(2, Math.round(hh / 0.45)), st = (hh - 0.1) / n;
    for (let k = 0; k < n; k++) { const z0 = h + 0.1 + k * st, z1 = z0 + st - 0.1; t.box(M, u - d / 2, u - d / 2 + 0.06, v - w / 2, v + w / 2, z0, z1); t.box(M, u + d / 2 - 0.06, u + d / 2, v - w / 2, v + w / 2, z0, z1); t.box(M, u - d / 2, u + d / 2, v - w / 2, v - w / 2 + 0.06, z0, z1); t.box(M, u - d / 2, u + d / 2, v + w / 2 - 0.06, v + w / 2, z0, z1); }
    for (const a of [-1, 1]) for (const c of [-1, 1]) t.box(M, u + a * (d / 2 - 0.1), u + a * (d / 2 - 0.02), v + c * (w / 2 - 0.1), v + c * (w / 2 - 0.02), h, h + hh);
  }
  function pallet(t, u, v, h, wv = 4, du = 3.3) {
    for (const k of [-1, 0, 1]) t.box(PINED, u - du / 2, u + du / 2, v + k * (wv / 2 - 0.15) - 0.15, v + k * (wv / 2 - 0.15) + 0.15, h, h + 0.33);
    for (let i = 0; i < 5; i++) { const uu = u - du / 2 + i * (du - 0.45) / 4; t.box(PINE, uu, uu + 0.45, v - wv / 2, v + wv / 2, h + 0.33, h + 0.42); }
    return h + 0.42;
  }
  const sack = (t, u, v, h, M = JUTE, su = 0.78, sv = 1.25) => t.ball(M, u, v, h + 0.4, 1, 0.42, su, sv);
  // A picket fence between two points (along the wall, or out from it)
  function fence(t, A, C, o = {}) {
    const alongU = Math.abs(C[0] - A[0]) > Math.abs(C[1] - A[1]), len = alongU ? C[0] - A[0] : C[1] - A[1], H = o.h ?? 3, M = o.mat ?? 'c#e6dfcd/0.8', n = Math.round(Math.abs(len) / 0.5), q = alongU ? A[1] : A[0];
    const bx = (p0, p1, th, h0, h1, m = M) => (alongU ? t.box(m, A[0] + p0, A[0] + p1, q - th, q + th, h0, h1) : t.box(m, q - th, q + th, A[1] + p0, A[1] + p1, h0, h1));
    for (const hh of [0.8, 2.2]) bx(0, len, 0.035, hh, hh + 0.22);
    for (let i = 0; i < n; i++) { const p = (i + 0.5) * len / n; bx(p - 0.14, p + 0.14, 0.07, 0.25, H - 0.12 * (i % 2)); }
    const m = Math.max(1, Math.round(Math.abs(len) / 6));
    for (let j = 0; j <= m; j++) { const p = len * j / m; bx(p - 0.16, p + 0.16, 0.16, 0, H + 0.3, o.post ?? M); }
    if (o.collide !== false) { if (alongU) t.hit(A[0], C[0], q - 0.2, q + 0.2, H); else t.hit(q - 0.2, q + 0.2, A[1], C[1], H); }
  }
  function hedge(t, u0, u1, v0, v1, h = 3.2) { K.G.box('boxwood', Math.min(t.s * u0, t.s * u1), Math.max(t.s * u0, t.s * u1), 0, h, Math.min(t.Z(v0), t.Z(v1)), Math.max(t.Z(v0), t.Z(v1)), { batter: 0.07, seg: 2 }); t.hit(u0, u1, v0, v1, h); }
  // What stands on the line between a yard and the next one along (nothing, if nothing of ours is next door):
  // it starts clear of whichever of the two back walls stands further out.
  function boundary(t, kind, o = {}) {
    const n = nextTo(t.lot); if (!n) return;
    const u0 = Math.max(t.b, n.back) + 0.2, v = t.y1;
    if (kind === 'hedge') hedge(t, u0 + 0.1, u0 + 7.4, v - 0.5, v + 0.5, 3.0);
    else if (kind === 'gate') { fence(t, [u0, v], [u0 + 3.4, v], o); fence(t, [u0 + 7.2, v], [u0 + 9, v], o); fence(t, [u0 + 7.05, v - 0.3], [u0 + 7.05, v - 3.7], o); }      // the gate, left open
    else fence(t, [u0, v], [u0 + 8, v], o);
  }
  // A washing line from A to C (along the wall or out from it), and what hangs on it: [where 0..1, what, colour, second colour]
  function washing(t, A, C, items, sag = 0.5) {
    const N = 10, at = f => [A[0] + (C[0] - A[0]) * f, A[1] + (C[1] - A[1]) * f, A[2] + (C[2] - A[2]) * f - sag * 4 * f * (1 - f)];
    for (let i = 0; i < N; i++) t.tube('c#d8d2c2/0.8', at(i / N), at((i + 1) / N), 0.02, 3);
    const alongU = Math.abs(C[0] - A[0]) > Math.abs(C[1] - A[1]);
    for (const [f, kind, col, col2] of items) {
      const c = at(f), M = P(col, 0.95), M2 = P(col2 ?? shade(col, 0.8), 0.95);
      const pc = (mat, a0, a1, h0, h1, th = 0.035, off = 0) => (alongU ? t.box(mat, c[0] + a0, c[0] + a1, c[1] + off - th, c[1] + off + th, c[2] + h0, c[2] + h1) : t.box(mat, c[0] + off - th, c[0] + off + th, c[1] + a0, c[1] + a1, c[2] + h0, c[2] + h1));
      const peg = a => pc('c#c9a56a/0.9', a - 0.04, a + 0.04, -0.1, 0.14, 0.06);
      if (kind === 'shirt') { pc(M, -0.75, 0.75, -2.0, 0); pc(M, -1.3, -0.75, -1.05, -0.02); pc(M, 0.75, 1.3, -1.05, -0.02); pc(M2, -0.22, 0.22, -0.4, 0.01, 0.045); peg(-0.6); peg(0.6); }
      else if (kind === 'tee') { pc(M, -0.75, 0.75, -1.9, 0); pc(M, -1.15, -0.75, -0.6, -0.02); pc(M, 0.75, 1.15, -0.6, -0.02); pc(M2, -0.42, 0.42, -1.25, -0.55, 0.045); peg(-0.6); peg(0.6); }
      else if (kind === 'trousers') { pc(M, -0.6, 0.6, -0.7, 0); pc(M, -0.6, -0.07, -2.9, -0.7); pc(M, 0.07, 0.6, -2.9, -0.7); peg(-0.45); peg(0.45); }
      else if (kind === 'sock') { pc(M, -0.14, 0.14, -0.9, 0); pc(M, -0.14, 0.42, -1.06, -0.8); pc(M2, -0.14, 0.14, -0.2, 0.0, 0.045); peg(0); }
      else if (kind === 'sheet') { pc(M, -2.2, 2.2, -3.6, 0); peg(-1.9); peg(0); peg(1.9); }
      else if (kind === 'towel') { pc(M, -0.8, 0.8, -2.4, 0); pc(M2, -0.8, 0.8, -2.15, -1.95, 0.045); pc(M2, -0.8, 0.8, -0.5, -0.3, 0.045); peg(-0.6); peg(0.6); }
      else if (kind === 'apron') { pc(M, -0.75, 0.75, -2.7, -0.8); pc(M, -0.42, 0.42, -0.8, 0); pc(M2, -0.4, 0.4, -2.0, -1.45, 0.045); peg(-0.3); peg(0.3); }
      else if (kind === 'mat') { pc(M, -1.0, 1.0, -3.1, 0.06, 0.03, 0.1); pc(M, -1.0, 1.0, -2.1, 0.06, 0.03, -0.1); pc(M2, -1.0, 1.0, 0.03, 0.1, 0.13); }
      else if (kind === 'gloves') { pc(M, -0.32, -0.06, -0.8, 0); pc(M, 0.06, 0.32, -0.8, 0); peg(-0.19); peg(0.19); }
      else if (kind === 'scarf') { pc(M, -0.26, 0.26, -3.3, 0); for (const z of [-3.0, -2.2, -1.4, -0.6]) pc(M2, -0.26, 0.26, z, z + 0.3, 0.045); peg(0); }
      else if (kind === 'bowtie') { pc(M, -0.42, -0.08, -0.46, -0.04); pc(M, 0.08, 0.42, -0.46, -0.04); pc(M2, -0.08, 0.08, -0.33, -0.17, 0.05); peg(0); }
      else { pc(M, -0.55, 0.55, -1.5, 0); pc(M2, -0.55, 0.55, -1.3, -1.18, 0.045); peg(-0.4); peg(0.4); }      // a cloth
    }
  }
  // A line post, and an iron arm off a wall for a line between two buildings
  const post = (t, u, v, h, M = WOODD) => { t.box(M, u - 0.13, u + 0.13, v - 0.13, v + 0.13, 0, h); t.box(M, u - 0.5, u + 0.5, v - 0.07, v + 0.07, h - 0.4, h - 0.26); t.hit(u - 0.25, u + 0.25, v - 0.25, v + 0.25, h); };
  const arm = (t, v, h, out) => { const b = t.b; t.tube(IRON, [b, v, h], [b + out, v, h], 0.05); t.tube(IRON, [b, v, h - Math.min(2.2, out * 0.6)], [b + out * 0.85, v, h], 0.04); t.torus(IRON, b + out, v, h - 0.2, 0.18, 0.035, 'cross', 8); };
  const potStack = (t, u, v, n, sc = 0.55, h = 0) => { for (let i = 0; i < n; i++) t.lathe(i % 3 === 1 ? 'c#a8745a/0.95' : TERRA, u, v, h + i * 0.3 * sc, POT, 12, sc); };
  // Upholstery left out of doors: an armchair or a sofa, facing away from the wall
  function settee(t, u, v, len, hex, label) {
    const M = P(hex, 0.95), M2 = P(shade(hex, 0.84), 0.95), M3 = P(shade(hex, 1.1), 0.95), hv = len / 2;
    t.box(M2, u - 1.3, u + 1.2, v - hv, v + hv, 0.25, 1.2); t.box(M, u - 1.3, u - 0.55, v - hv, v + hv, 1.2, 3.5);
    for (const sg of [-1, 1]) { t.box(M, u - 0.6, u + 1.2, v + sg * (hv - 0.5), v + sg * hv, 1.2, 2.3); for (const du of [-1.15, 1.05]) t.box(WOODD, u + du - 0.1, u + du + 0.1, v + sg * (hv - 0.3), v + sg * (hv - 0.1), 0, 0.25); }
    const n = Math.max(1, Math.round((len - 1) / 2.1)), cw = (len - 1) / n;
    for (let i = 0; i < n; i++) { const c = v - hv + 0.5 + cw * (i + 0.5); t.box(M3, u - 0.55, u + 1.25, c - cw / 2 + 0.03, c + cw / 2 - 0.03, 1.2, 1.66); t.box(M3, u - 0.6, u - 0.2, c - cw / 2 + 0.05, c + cw / 2 - 0.05, 1.66, 3.2); t.seat(u + 0.4, c, 1.66, 'out', label); }
    t.hit(u - 1.4, u + 1.3, v - hv - 0.1, v + hv + 0.1, 3.4);
  }
  const plantRow = (t, kinds, u, v0, v1, n, sc = 0.8, o) => { for (let i = 0; i < n; i++) t.plant(kinds[i % kinds.length], u + (K.r() - 0.5) * 0.5, v0 + (v1 - v0) * (i + 0.5) / n, sc * (0.85 + K.r() * 0.3), o); };

  // ======================================================================================
  // THE NORTH SIDE
  // ======================================================================================
  yard('yoga', -8, (t, b) => { // ----: rinsed mats on a line, shoes off at the door, a few stones raked round --------
    pipe(t, -7.3);
    door(t, 4, '#c98a6a', { hinge: -1, mat: doormat('EXHALE', '#b98a5a', '#4a2a1a'), knock: ['knock at the studio door', 'A very calm voice: "One moment. We are in pigeon."', 'Forty seconds of nothing at all. Then, far off, a gong.', '"The door is unlocked. The door was always unlocked." It is not unlocked.'] });
    t.sign(b + 0.03, 8.3, 5.4, 'out', 1.8, 1.25, note(['late for class?', 'come in quietly.', ['breathe out first.', RED]], { pin: '#c8402f' }), px(1.8, 1.25));
    win(t, -2.5, 17.8, 3.2, 6.2, 1); win(t, 7, 17.8, 3.2, 6.2, 4, { box: ['herbs', 'marigold'] }); win(t, 16.5, 17.8, 3.2, 6.2, 0); win(t, 14.6, 4.4, 3, 4, 2);
    meter(t, 19.6, 3.4, 'LOW SUN · CALM'); louvre(t, 22, 9.5);
    // the shoe rack
    for (const h of [0.25, 0.95]) t.box(PINE, b + 0.15, b + 1.15, -1.7, 1.3, h, h + 0.08); for (const v of [-1.68, 1.28]) t.box(PINE, b + 0.15, b + 1.15, v - 0.04, v + 0.04, 0, 1.55);
    [[-1.4, '#c98a6a', 1.03], [-0.5, '#34405a', 1.03], [0.45, '#7f9077', 1.03], [-0.9, '#d9b25a', 0.33], [0.2, '#8c3b2e', 0.33]].forEach(([v, c, h]) => { for (const dv of [0, 0.36]) t.box(P(c), b + 0.3, b + 1.05, v + dv, v + dv + 0.28, h, h + 0.17); });
    t.sign(b + 0.03, -0.2, 3.0, 'out', 1.7, 0.9, note(['shoes off', ['(robots: wheels wiped)', RED]]), px(1.7, 0.9));
    // a wind chime
    t.tube(IRON, [b, -5, 8.6], [b + 1.3, -5, 8.6], 0.04); t.cyl(PINE, b + 1.2, -5, 8.2, 8.26, 0.3, 0.3, 10);
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, len = 1.1 + (i * 37 % 5) * 0.16; t.cyl(ZINC, b + 1.2 + Math.cos(a) * 0.22, -5 + Math.sin(a) * 0.22, 8.1 - len, 8.1, 0.035, 0.035, 5); }
    // a climbing rose
    trellis(t, 9.8, 12.2, 0.4, 13); creeper(t, 9.6, 12.4, 0, 12, 24, 'rose', 0.62, 3); t.lamp(b + 2.4, 4, 8.6, 0.55);
    // the mats, rinsed and drying
    post(t, b + 6.4, 9.6, 6.6); post(t, b + 6.4, 22.2, 6.6);
    washing(t, [b + 6.4, 9.6, 6.3], [b + 6.4, 22.2, 6.3], [[0.12, 'mat', '#c98a6a'], [0.31, 'mat', '#7f9077'], [0.5, 'mat', '#d9b25a'], [0.69, 'mat', '#8a6a9a'], [0.88, 'mat', '#5a8a9a']], 0.25);
    t.sign(b + 6.55, 9.6, 4.6, 'out', 1.5, 1.0, note(['MATS: rinsed, drying.', 'no downward dog', ['until dry. (you know who.)', RED]], { bg: '#f3e6cf' }), px(1.5, 1.0));
    // three stones and a lantern in a round of gravel
    K.G.disc('gravel', t.X(b + 5.4), t.Z(-2.6), 3.1, { y: 0.06 });
    t.rock('c#8f8a80/0.95', b + 4.6, -3.3, 0.35, 1.0, 0.7, 0.8, 0.5); t.rock('c#7d786f/0.95', b + 6.2, -2.2, 0.25, 0.7, 0.5, 0.6, 1.9); t.rock('c#9a958b/0.95', b + 5.6, -4.3, 0.16, 0.45, 0.3, 0.4, 2.9);
    t.lathe(STONE, b + 4.2, -1.3, 0, [[0.01, 0], [0.5, 0], [0.5, 0.2], [0.2, 0.35], [0.18, 1.5], [0.45, 1.7], [0.45, 1.8]], 8); t.lathe(STONE, b + 4.2, -1.3, 2.35, [[0.7, 0], [0.5, 0.25], [0.12, 0.6], [0.01, 0.8]], 8); for (const [du, dv] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) t.box(STONE, b + 4.2 + du - 0.05, b + 4.2 + du + 0.05, -1.3 + dv - 0.05, -1.3 + dv + 0.05, 1.8, 2.35);
    t.glow(b + 4.2, -1.3, 2.08, 0.2, LANT); t.hit(b + 3.7, b + 4.7, -1.8, -0.8, 3);
    boundary(t, 'fence');
  });

  yard('coffee', 24, (t, b) => { // ----: sacks of green beans, the roaster's flue, a fire escape with a garden on it --
    pipe(t, 55.2);
    door(t, 30, '#2f4a40', { mat: doormat('SLOW DOWN', '#6a5a3c', '#1c2a22'), knock: ['knock at the coffee shop', 'Juniper, from somewhere inside: "It will be ready when it is ready!"', '"Deliveries go upstairs! Unless they are milk! Milk is a downstairs matter!"', 'The door stays shut. The smell comes out anyway.'] });
    t.sign(b + 0.03, 25.95, 5.3, 'out', 1.9, 1.5, note([['DELIVERIES', '#24382f', F.bebas], 'beans: upstairs', 'milk: downstairs', ['gossip: at the counter', RED]], { bg: '#efe6cf' }), px(1.9, 1.5));
    win(t, 27, 17.8, 3.2, 6.2, 5); win(t, 36, 17.8, 3.2, 6.2, 0); win(t, 43, 17.8, 3.2, 6.2, 8); win(t, 52.4, 17.8, 3, 6.2, DARK); win(t, 36.5, 4.4, 3.4, 4, 9, { bars: true });
    meter(t, 33.6, 3.4, 'SLOW HAND · ROASTER');
    fireEscape(t, 33.4, 45.6, 1);
    for (const [v, kinds] of [[34.6, [['herbs', 0.8]]], [38.2, [['marigold', 0.9]]], [44.4, [['tomato', 0.5]]]]) t.pot(b + 2.5, v, 14.3, 0.55, kinds, { collide: false });
    K.strand?.([t.X(b + 3.4), 17.9, t.Z(33.5)], [t.X(b + 3.4), 17.9, t.Z(45.5)], 0.5, 9);
    t.box(P('#7d8a72'), b + 0.5, b + 0.56, 40.2, 41.4, 14.3, 16.3); t.box(P('#7d8a72'), b + 0.5, b + 1.6, 40.2, 41.4, 15.3, 15.36);      // a folded chair
    // the roaster's flue
    flue(t, 48.6, 21, { r: 0.5, rise: 4.4 });
    t.sign(b + 0.03, 47.4, 5.6, 'out', 1.0, 1.2, label(['ROASTER', ['smells free', F.caveat], ['of charge', F.caveat]], '#24382f', '#efe6cf'), { cw: 100, ch: 120 });
    t.tube(ZINC, [b + 0.12, 48.6, 0.3], [b + 0.12, 48.6, 20.6], 0.07, 5); t.box(ZINCD, b, b + 0.5, 48.3, 48.9, 0.3, 1.1);
    // sacks of green beans on a pallet
    { const u = b + 2.2, v = 42, h = pallet(t, u, v, 0);
      for (const [du, dv, k] of [[-0.8, -1.0, 0], [0.8, -1.0, 0], [-0.8, 1.0, 0], [0.8, 1.0, 0], [0, -0.6, 1], [0, 0.9, 1], [0.1, 0.1, 2]]) t.ball(k % 2 ? 'c#a88e5c/1' : JUTE, u + du, v + dv, h + 0.42 + k * 0.72, 1, 0.42, 0.85, 1.05);
      t.sign(u + 0.1, 42.1, h + 0.42 + 2 * 0.72 + 0.43, 'out', 1.3, 1.0, (g, w, hh) => { fill(g, w, hh, '#b59a6a'); grain(g, w, hh, 0.2, 9); T(g, 'SLOW HAND', w / 2, hh * 0.2, hh * 0.2, '#2a1c13', { f: F.bebas, ls: 2 }); ICON.cup(g, w / 2, hh * 0.5, hh * 0.3, '#2a1c13'); T(g, 'GREEN BEANS · 60 kg', w / 2, hh * 0.76, hh * 0.13, '#2a1c13', { f: F.bebas }); T(g, 'NO HURRY', w / 2, hh * 0.91, hh * 0.11, '#7a1c12', { f: F.bebas, ls: 3 }); }, { flat: true, cw: 130, ch: 100, rough: 1 });
      sack(t, b + 5.0, 44.6, 0, JUTE, 0.9, 1.1); t.hit(b + 0.4, b + 4.1, 39.9, 44.2, 3.2); }
    // spent grounds, free to roses
    bin(t, b + 1.4, 51.6, '#4a3a2c', label(['SPENT GROUNDS', ['free for your roses', F.caveat], ['(Frond takes most)', F.caveat, 0.9]], '#4a3a2c', '#efe6cf'));
    crate(t, b + 1.0, 53.9, 0, 1.4, 1.4, 1.1, 'c#5a7a9a/0.7'); for (let i = 0; i < 6; i++) t.cyl(WHITE, b + 0.7 + (i % 3) * 0.3, 53.6 + Math.floor(i / 3) * 0.5, 0.1, 1.25, 0.13, 0.11, 6);
    boundary(t, 'hedge');
  });

  yard('books', 56, (t, b) => { // ----: crates of returns, a reading chair by the door, ivy to the roof ---------------------
    pipe(t, 57.2);
    door(t, 66, '#7a2f2a', { mat: doormat('CHAPTER ONE', '#6a4a3a', '#e9d9b4'), knock: ['knock at the bookshop', 'Folio, muffled: "One moment. I am at a good bit."', 'A page turns. Nobody comes. Another page turns.', '"If it is a return, the crate. If it is an apology, the letter box."'] });
    t.sign(b + 0.03, 62.4, 5.3, 'out', 2.0, 1.5, note([['RETURNS', '#5e1f1c', F.dm], 'leave them in the crate.', 'overdue apologies:', ['through the letter box.', RED]], { bg: '#e9dcc2' }), px(2.0, 1.5));
    for (const f of [0, 1]) { win(t, 60.5, 17.8 + f * 11.5, 3.2, 6.2, f ? 1 : 3); win(t, 70, 17.8 + f * 11.5, 3.2, 6.2, f ? DARK : 0, f ? {} : { box: ['fern', 'herbs'] }); win(t, 79.5, 17.8 + f * 11.5, 3.2, 6.2, f ? 4 : 5); }
    win(t, 77, 4.2, 3.4, 4.4, 9, { mullion: true });
    meter(t, 73.6, 3.4, 'MARGINALIA'); aerial(t, 68);
    creeper(t, 80.5, 83.8, 0, 34, 46, 'shrub', 0.42, 5); creeper(t, 72, 84, 30, 36.5, 22, 'shrub', 0.4, 9); for (let v = 73; v < 84; v += 1.7) t.plant('wisteria', b + 0.35, v, 0.9, { y: 37.4 });
    // returns
    crate(t, b + 1.2, 59.6, 0, 2.2, 1.7, 1.3); crate(t, b + 1.2, 59.5, 1.32, 2.2, 1.7, 1.3); crate(t, b + 3.2, 59.9, 0, 2.2, 1.7, 1.3);
    { const cols = ['#7a2f2a', '#34405a', '#d9b25a', '#3f5f43', '#e8dfc8', '#c98a6a', '#5a4a6a', '#1d1d1f']; let k = 0;
      for (const [u, h] of [[b + 1.2, 1.5], [b + 3.2, 0.18]]) for (let v = 58.75; v < 60.5; v += 0.19 + (k % 3) * 0.05) { const hh = 0.85 + (k * 7 % 5) * 0.08; t.box(P(cols[k++ % cols.length], 0.8), u - 0.5, u + 0.5, v, v + 0.16 + (k % 2) * 0.05, h, h + hh); } }
    t.sign(b + 4.07, 59.9, 0.72, 'out', 1.9, 0.9, label(['RETURNS', ['unsold · unloved · unbowed', F.fraunces, 0.8]], '#c2a878', '#5e1f1c'), px(1.9, 0.9));
    t.hit(b + 0.2, b + 4.2, 58.3, 61.1, 2.7);
    // the reading chair, a lantern over it, tea going cold
    settee(t, b + 2.0, 71.2, 3.2, '#4f6a55', 'sit and read a while');
    t.tube(IRON, [b, 73.4, 8.6], [b + 1.6, 73.4, 8.6], 0.045); t.tube(IRON, [b, 73.4, 7.4], [b + 1.3, 73.4, 8.6], 0.035); t.tube(IRON, [b + 1.5, 73.4, 8.6], [b + 1.5, 73.4, 8.0], 0.02, 3);
    t.box(IRON, b + 1.3, b + 1.7, 73.2, 73.6, 7.95, 8.0); t.box(IRON, b + 1.3, b + 1.7, 73.2, 73.6, 7.2, 7.25); t.glow(b + 1.5, 73.4, 7.6, 0.24, LANT); t.lamp(b + 2.2, 72.6, 7.2, 0.75);
    crate(t, b + 1.3, 74.3, 0, 1.5, 1.5, 1.5, PINED); t.box(PINED, b + 0.55, b + 2.05, 73.55, 75.05, 1.5, 1.56);
    [['#7a2f2a', 0.0], ['#d9b25a', 0.13], ['#34405a', 0.25]].forEach(([c, h], i) => t.box(P(c, 0.8), b + 0.75 + i * 0.05, b + 1.45 + i * 0.05, 73.7, 74.6 - i * 0.06, 1.57 + h, 1.57 + h + 0.12)); t.cyl(WHITE, b + 1.75, 74.75, 1.57, 1.87, 0.13, 0.15, 8);
    t.sign(b + 0.03, 69.9, 5.0, 'out', 1.6, 0.9, note(['reading chair.', ['please do read in it.', RED]], { pin: '#34405a' }), px(1.6, 0.9));
    // a ladder to the ivy, and paper for recycling
    ladder(t, [b + 3.3, 81.8, 0], [b + 0.3, 81.8, 13.5], 1.4, PINE, 0.06); t.hit(b + 0.2, b + 3.5, 80.9, 82.7, 5);
    bin(t, b + 1.4, 62.6, '#34507a', label(['PAPER ONLY', ['yes, even the', F.caveat], ['bad reviews', F.caveat]], '#34507a'));
  });

  yard('plants', 154, (t, b) => { // ----: cold frames, pots, a potting bench, the compost, a hedge with a gate --------------------
    pipe(t, 155.2, { butt: 1, gutter: true });
    door(t, 161.4, '#4f7a55', { hinge: -1, mat: doormat('WIPE YOUR ROOTS', '#7a6a44', '#24382f'), knock: ['knock at the plant shop', 'Moss: "Shh. The ferns have only just gone down."', '"Round the front, please. And compliment the monstera on your way in."', 'Something inside is being misted.'] });
    t.sign(b + 0.03, 165.2, 5.3, 'out', 1.9, 1.3, note(['the watering can', 'lives HERE.', ['(it does not.)', RED]], { bg: '#e6e0cf', pin: '#3f5f43' }), px(1.9, 1.3));
    t.tube(IRON, [b, 165.2, 3.9], [b + 0.5, 165.2, 3.9], 0.04);
    for (const f of [0, 1]) { win(t, 158.5, 17.8 + f * 11.5, 3.2, 6.2, f ? 0 : 3, f ? {} : { box: ['herbs', 'marigold', 'fern'] }); win(t, 168, 17.8 + f * 11.5, 3.2, 6.2, f ? 5 : 1, f ? { box: ['fern', 'catmint'] } : {}); win(t, 177.5, 17.8 + f * 11.5, 3.2, 6.2, f ? 4 : DARK); }
    win(t, 175.6, 4.2, 3.4, 4.4, 3, { mullion: true });
    meter(t, 179.8, 7.2, 'FROND · GROW LIGHTS');
    for (let v = 156; v < 182; v += 1.6) t.plant('wisteria', b + 0.35, v + K.r() * 0.6, 0.85 + K.r() * 0.3, { y: 37.4 - K.r() * 0.6 }); trellis(t, 171, 173.4, 0.4, 16); creeper(t, 170.8, 173.6, 0, 15, 28, 'rose', 0.62, 11);
    // the potting bench: pots, seed trays, a trowel left out
    { const v0 = 166.6, v1 = 170.4; t.box(PINE, b + 0.1, b + 2.2, v0, v1, 2.9, 3.05); t.box(PINED, b + 0.1, b + 2.2, v0 + 0.1, v1 - 0.1, 0.8, 0.9); for (const [u, v] of [[b + 0.2, v0 + 0.1], [b + 2.0, v0 + 0.1], [b + 0.2, v1 - 0.25], [b + 2.0, v1 - 0.25]]) t.box(PINED, u, u + 0.15, v, v + 0.15, 0, 2.9);
      t.box(PINED, b + 0.1, b + 0.2, v0, v1, 3.05, 4.6); t.box(PINE, b + 0.1, b + 0.9, v0, v1, 4.6, 4.68);
      potStack(t, b + 0.6, v0 + 0.5, 5, 0.42, 4.68); potStack(t, b + 0.55, v0 + 1.3, 3, 0.36, 4.68); t.pot(b + 0.55, v1 - 0.55, 4.68, 0.4, [['herbs', 0.7]], { collide: false });
      t.box('c#3a3835/0.8', b + 0.5, b + 1.9, v0 + 0.3, v0 + 1.5, 3.05, 3.2); for (let i = 0; i < 8; i++) t.plant('lettuce', b + 0.75 + (i % 4) * 0.3, v0 + 0.6 + Math.floor(i / 4) * 0.55, 0.45, { y: 3.18 });
      t.pot(b + 1.3, v1 - 0.6, 3.05, 0.5, [['fern', 0.6]], { collide: false }); t.pot(b + 1.5, v0 + 2.2, 3.05, 0.34, [], { collide: false }); t.box(ZINC, b + 1.6, b + 1.68, v0 + 2.6, v0 + 3.1, 3.06, 3.09); t.cyl(WOOD, b + 1.64, v0 + 3.25, 3.06, 3.12, 0.05, 0.05, 5);
      t.box(JUTE, b + 0.3, b + 1.9, v0 + 0.4, v0 + 1.6, 0.9, 1.9); t.box(JUTE, b + 0.3, b + 1.9, v0 + 2.0, v0 + 3.2, 0.9, 1.5);
      t.sign(b + 1.92, v0 + 1.0, 1.45, 'out', 1.0, 0.8, label(['COMPOST', ['the nice stuff', F.caveat]], '#b59a6a', '#24382f'), { cw: 100, ch: 80 });
      t.hit(b, b + 2.3, v0 - 0.1, v1 + 0.1, 4.8); t.glow(b + 0.5, 168.5, 7.9, 0.2, LANT); t.tube(IRON, [b, 168.5, 8.5], [b + 0.5, 168.5, 8.5], 0.04); t.tube(IRON, [b + 0.5, 168.5, 8.5], [b + 0.5, 168.5, 8.1], 0.02, 3); t.lamp(b + 1.6, 168.5, 7.4, 0.7); }
    // cold frames, their lids propped
    for (const [v, kinds] of [[159.8, ['lettuce', 'lettuceRed']], [164.4, ['strawberry', 'herbs']]]) {
      const u0 = b + 5.8, u1 = b + 8.4, w = 4;
      t.box(WHITE, u0, u0 + 0.12, v - w / 2, v + w / 2, 0, 1.7); t.box(WHITE, u1 - 0.12, u1, v - w / 2, v + w / 2, 0, 0.95); for (const sg of [-1, 1]) { t.box(WHITE, u0, u1, v + sg * (w / 2 - 0.12), v + sg * w / 2, 0, 0.95); t.beam(WHITE, [u0, v + sg * (w / 2 - 0.06), 1.72], [u1, v + sg * (w / 2 - 0.06), 0.98], 0.12, 0.12); }
      t.box(SOIL, u0 + 0.12, u1 - 0.12, v - w / 2 + 0.12, v + w / 2 - 0.12, 0.3, 0.42);
      for (let i = 0; i < 10; i++) t.plant(kinds[i % 2], u0 + 0.5 + (i % 2) * 1.1 + K.r() * 0.3, v - w / 2 + 0.5 + Math.floor(i / 2) * 0.75, 0.8, { y: 0.4 });
      t.beam('glass', [u0 + 0.05, v, 1.76], [u1, v, 1.02], 0.05, w - 0.3); t.beam(WHITE, [u0 + 0.05, v, 1.79], [u1, v, 1.05], 0.06, 0.1);
      t.hit(u0, u1, v - w / 2, v + w / 2, 1.8);
    }
    t.sign(b + 8.43, 159.8, 0.52, 'out', 1.3, 0.6, note(['lettuce: day 9', ['still lettuce', RED]], { bg: '#f1ebdd' }), px(1.3, 0.6)); t.sign(b + 8.43, 164.4, 0.52, 'out', 1.3, 0.6, note(['strawberries', ['COUNTED.', RED]], { bg: '#f1ebdd' }), px(1.3, 0.6));
    // pots, in stacks and in use
    potStack(t, b + 3.6, 156.0, 7, 0.7); potStack(t, b + 4.8, 156.3, 4, 0.5); potStack(t, b + 4.1, 157.3, 9, 0.45);
    for (const [u, v, sz, pl] of [[b + 1.0, 164.7, 0.9, [['hosta', 1.1]]], [b + 1.2, 172.3, 1.0, [['hydrangea', 0.6]]], [b + 4.6, 174.6, 1.1, [['sunflower', 0.6], ['marigold', 0.8, 0.4, 0.3]]], [b + 8.6, 173.6, 0.9, [['fern', 0.9]]]]) t.pot(u, v, 0, sz, pl);
    // the compost: a bay of old pallets, a fork left standing in it
    { const u = b + 2.4, v = 179.6; crate(t, u, v, 0, 4, 4, 3.0, PINED); t.ball('c#4a3626/1', u, v, 1.5, 1.9, 0.9, 0.95, 0.95); t.ball('c#5d6b3a/1', u + 0.4, v - 0.5, 2.9, 0.7, 0.4);
      t.tube(WOOD, [u - 0.6, v + 0.3, 2.6], [u - 0.9, v + 0.5, 6.2], 0.05); t.box(WOOD, t.b + 1.2, t.b + 1.8, v + 0.44, v + 0.56, 6.15, 6.25);
      t.sign(u + 2.03, v, 2.0, 'out', 2.4, 1.6, note([['COMPOST', '#34553a', F.shrikhand], 'yes: leaves, peels, regrets', ['no: glitter. (again.)', RED]], { bg: '#e6e0cf' }), px(2.4, 1.6));
      t.hit(u - 2.1, u + 2.1, v - 2.1, v + 2.1, 3.2); }
    // a wheelbarrow and a watering can
    { const u = b + 6.2, v = 176.6; t.box(P('#4f7a55', 0.6), u - 1.3, u + 1.3, v - 0.85, v + 0.85, 1.2, 1.9); t.box(SOIL, u - 1.2, u + 1.2, v - 0.75, v + 0.75, 1.9, 1.96); t.torus(RUBBER, u + 1.7, v, 0.62, 0.5, 0.13, 'cross', 12);
      for (const sg of [-1, 1]) { t.tube(WOOD, [u + 1.7, v + sg * 0.2, 0.62], [u - 2.6, v + sg * 0.8, 1.9], 0.055); t.tube(IRON, [u - 1.0, v + sg * 0.7, 1.2], [u - 1.1, v + sg * 0.7, 0], 0.045); }
      for (const [k, du, dv] of [['marigold', -0.6, -0.3], ['cosmos', 0.3, 0.2], ['herbs', 0.8, -0.3]]) t.plant(k, u + du, v + dv, 0.7, { y: 1.9 }); t.hit(u - 1.4, u + 2.2, v - 0.95, v + 0.95, 2.2);
      const cu = b + 3.6, cv = 164.0; t.cyl(ZINC, cu, cv, 0, 1.1, 0.5, 0.45, 10); t.tube(ZINC, [cu + 0.4, cv, 0.3], [cu + 1.3, cv, 1.25], 0.06, 5); t.cyl(ZINC, cu + 1.36, cv, 1.2, 1.36, 0.06, 0.16, 6); t.torus(ZINC, cu - 0.35, cv, 0.95, 0.42, 0.035, 'cross', 10); }
    // beans on canes, sunflowers along the lane, a hedge with the gate left open
    for (const v of [158.4, 161.0]) { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; t.tube('c#c9a56a/0.9', [b + 11.3 + Math.cos(a) * 0.8, v + Math.sin(a) * 0.7, 0], [b + 11.3, v, 7.4], 0.03, 3); t.plant('bean', b + 11.3 + Math.cos(a) * 0.55, v + Math.sin(a) * 0.45, 0.9); } }
    hedge(t, b + 9.6, b + 10.4, 155.2, 167.2, 3.0); hedge(t, b + 9.6, b + 10.4, 171.8, 181.4, 3.0);
    for (const v of [167.4, 171.6]) { t.box(WOODD, b + 9.8, b + 10.2, v - 0.18, v + 0.18, 0, 4.2); t.cyl(WOODD, b + 10, v, 4.2, 4.5, 0.26, 0.05, 6); t.hit(b + 9.7, b + 10.3, v - 0.25, v + 0.25, 4); }
    fence(t, [b + 6.6, 171.5], [b + 9.7, 171.5], { h: 3.2, mat: 'c#4f7a55/0.7' });
    t.sign(b + 8.1, 171.4, 2.0, 'e', 1.7, 1.1, label(['FROND', ['trade & the curious', F.caveat]], '#e6e0cf', '#34553a'), px(1.7, 1.1));
    for (let v = 173; v < 181; v += 2.1) t.plant('sunflower', b + 11.3, v, 0.95);
    fence(t, [b + 0.2, 154.35], [b + 9.4, 154.35], { mat: 'c#d9d2bf/0.8' });
    // the west wall, under the painted leaves: the overflow
    for (let u = 26.5; u < 50; u += 2.3) t.plant(['sunflower', 'spires', 'cosmos', 'rose', 'spires'][Math.round(u * 3) % 5], u, 183.0 + K.r() * 0.7, 0.85 + K.r() * 0.3); for (let u = 27; u < 50; u += 3.1) t.plant(['hosta', 'catmint', 'fern'][Math.round(u) % 3], u, 184.3, 0.9);
    potStack(t, 49.5, 183.3, 6, 0.6); potStack(t, 50.8, 183.6, 4, 0.45); t.pot(44, 185.4, 0, 1.1, [['hydrangea', 0.6]]); t.pot(31, 185.2, 0, 0.9, [['lavender', 0.9]]);
    t.sign(38, 182.03, 5.2, 'w', 3.6, 1.6, note([['FROND OVERFLOW', '#34553a', F.shrikhand], 'these ones are free', ['if you promise to talk to them', RED]], { bg: '#e6e0cf' }), px(3.6, 1.6, 90));
  });

  // ======================================================================================
  // THE SOUTH SIDE
  // ======================================================================================
  yard('museum', -8, (t, b) => { // ---- of Small Wonders: a crate the wrong way up, an exhibit out on loan ----------------
    pipe(t, 23.2);
    door(t, 5, '#3a4a44', { mat: doormat('EXHIBIT 0', '#5a5a48', '#e6d8b0'), knock: ['knock at the museum', '"We are closed for wonder. Also for stocktaking. Mostly wonder."', '"Is it small? Is it wonderful? Then leave it on the step, with a label."', 'A very small bell rings, somewhere very small.'] });
    t.sign(b + 0.03, 1.2, 5.3, 'out', 1.9, 1.4, note([['LOADING BAY', '#2c3a36', F.dm], '(for very small loads)', ['nothing over one wonder', RED]], { bg: '#ece6da' }), px(1.9, 1.4));
    win(t, -3.5, 17.8, 3.2, 6.2, 0); win(t, 6, 17.8, 3.2, 6.2, DARK); win(t, 15.5, 17.8, 3.2, 6.2, 1); win(t, -3.2, 4.4, 3.2, 4, 9, { bars: true });
    meter(t, 9.2, 3.4, 'MUSEUM · SMALL LIGHTS'); louvre(t, 20.6, 9.5);
    // FRAGILE. THIS WAY UP. (it is not)
    { const u = b + 3.3, v = 15, w = 4.2, hh = 4.2;
      t.box(PINE, u - w / 2, u + w / 2, v - w / 2, v + w / 2, 0, hh);
      for (const z of [0.25, hh - 0.25]) { t.box(PINED, u - w / 2 - 0.06, u + w / 2 + 0.06, v - w / 2 - 0.06, v + w / 2 + 0.06, z - 0.2, z + 0.2); } for (const a of [-1, 1]) for (const c of [-1, 1]) t.box(PINED, u + a * (w / 2 - 0.2), u + a * (w / 2 + 0.06), v + c * (w / 2 - 0.2), v + c * (w / 2 + 0.06), 0, hh);
      const fr = (g, cw, ch) => { fill(g, cw, ch, '#c2a878'); grain(g, cw, ch, 0.14, 4); g.translate(cw, ch); g.rotate(Math.PI); const R = '#9a2a1a';
        T(g, 'FRAGILE', cw / 2, ch * 0.22, ch * 0.24, R, { f: F.bebas, ls: 4 }); T(g, '(THIS WAY UP)', cw / 2, ch * 0.47, ch * 0.13, R, { f: F.bebas, ls: 2 });
        for (const x of [0.2, 0.8]) { line(g, [[cw * x, ch * 0.86], [cw * x, ch * 0.62]], R, 6); poly(g, [[cw * (x - 0.07), ch * 0.68], [cw * x, ch * 0.56], [cw * (x + 0.07), ch * 0.68]], R); }
        T(g, 'MUSEUM OF SMALL WONDERS', cw / 2, ch * 0.72, ch * 0.07, '#2a1c13', { f: F.elite, max: cw * 0.5 }); T(g, 'contents: 1 wonder (small)', cw / 2, ch * 0.84, ch * 0.065, '#2a1c13', { f: F.elite, max: cw * 0.5 }); };
      t.sign(u + w / 2 + 0.08, v, hh / 2, 'out', 3.3, 3.3, fr, { cw: 300, ch: 300, rough: 1 }); t.sign(u, v - w / 2 - 0.08, hh / 2, 'e', 3.3, 3.3, fr, { cw: 300, ch: 300, rough: 1 }); t.sign(u, v + w / 2 + 0.08, hh / 2, 'w', 3.3, 3.3, fr, { cw: 300, ch: 300, rough: 1 });
      t.box(PINE, u - 0.9, u + 0.9, v - 1.0, v + 0.6, hh, hh + 1.5); t.sign(u + 0.92, v - 0.2, hh + 0.75, 'out', 1.5, 1.2, label(['ALSO FRAGILE', ['(emotionally)', F.caveat]], '#c2a878', '#9a2a1a'), px(1.5, 1.2, 90));
      for (let i = 0; i < 5; i++) t.plant('grass', u + 2.2 + K.r() * 0.6, v - 2 + i * 0.9, 0.35, { tint: 1.25 });
      t.hit(u - w / 2 - 0.1, u + w / 2 + 0.1, v - w / 2 - 0.1, v + w / 2 + 0.1, 5.7); }
    // an empty plinth, and the exhibit, which has not gone far
    { const u = b + 6.6, v = 8.8; t.box(STONE, u - 0.8, u + 0.8, v - 0.8, v + 0.8, 0, 0.3); t.box(WHITE, u - 0.6, u + 0.6, v - 0.6, v + 0.6, 0.3, 3.3); t.box(STONE, u - 0.72, u + 0.72, v - 0.72, v + 0.72, 3.3, 3.5);
      t.sign(u + 0.62, v, 2.3, 'out', 1.0, 0.8, (g, w, h) => { fill(g, w, h, '#5a4a2c'); g.strokeStyle = '#d9b96a'; g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8); T(g, 'EXHIBIT 114', w / 2, h * 0.2, h * 0.14, '#e9cf8a', { f: F.bebas, ls: 2 }); T(g, 'A Perfectly Ordinary Pebble', w / 2, h * 0.44, h * 0.12, '#e9cf8a', { f: F.fraunces, w: 600, max: w * 0.86 }); T(g, 'on loan to the lawn.', w / 2, h * 0.66, h * 0.11, '#e9cf8a', { f: F.fraunces, w: 600, max: w * 0.86 }); T(g, 'back soon.', w / 2, h * 0.84, h * 0.11, '#e9cf8a', { f: F.fraunces, w: 600 }); }, { cw: 130, ch: 104 });
      t.rock('c#8f8a80/0.95', u + 1.9, v - 1.3, 0.1, 0.32, 0.2, 0.26, 0.7); t.hit(u - 0.8, u + 0.8, v - 0.8, v + 0.8, 3.5); }
    // the sundial
    { const u = b + 6.4, v = -2.6; t.lathe(STONE, u, v, 0, [[0.01, 0], [0.8, 0], [0.8, 0.25], [0.42, 0.5], [0.34, 2.6], [0.6, 2.85], [0.85, 2.95], [0.85, 3.1], [0.01, 3.1]], 10);
      t.sign(u, v, 3.12, 'out', 1.5, 1.5, (g, w, h) => { fill(g, w, h, '#8a7a4a'); disc(g, w / 2, h / 2, w * 0.47, '#b9a468', '#5a4a2c', 3); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(g, [[w / 2 + Math.cos(a) * w * 0.36, h / 2 + Math.sin(a) * w * 0.36], [w / 2 + Math.cos(a) * w * 0.44, h / 2 + Math.sin(a) * w * 0.44]], '#3a2c14', 2); } T(g, 'NEARLY', w / 2, h * 0.3, h * 0.1, '#3a2c14', { f: F.bebas, ls: 2 }); T(g, 'EVENING', w / 2, h * 0.72, h * 0.1, '#3a2c14', { f: F.bebas, ls: 2 }); }, { flat: true, cw: 120, ch: 120, round: true });
      t.beam('c#6d5a2c/0.6', [u - 0.35, v, 3.14], [u + 0.25, v, 3.7], 0.05, 0.05); t.beam('c#6d5a2c/0.6', [u + 0.25, v, 3.14], [u + 0.25, v, 3.7], 0.05, 0.05); t.hit(u - 0.8, u + 0.8, v - 0.8, v + 0.8, 3.2);
      t.sign(u + 0.87, v, 1.5, 'out', 0.9, 0.7, note([['reads: nearly evening.', '#e9cf8a'], ['always has.', '#e9cf8a']], { board: '#5a4a2c', edge: '#d9b96a', f: F.fraunces }), { cw: 120, ch: 92 }); }
    // white gloves, pegged out in pairs
    post(t, b + 8.6, 12.4, 5.8); post(t, b + 8.6, 21.8, 5.8);
    washing(t, [b + 8.6, 12.4, 5.5], [b + 8.6, 21.8, 5.5], [[0.14, 'gloves', '#f1efe8'], [0.3, 'gloves', '#f1efe8'], [0.46, 'gloves', '#f1efe8'], [0.62, 'gloves', '#e9e3d3'], [0.8, 'cloth', '#e8dfcc', '#3a4a44']], 0.2);
    t.sign(b + 8.75, 21.8, 4.2, 'out', 1.4, 0.8, note(['handling gloves.', ['handle with gloves.', RED]]), px(1.4, 0.8));
    boundary(t, 'gate');
  });

  yard('records', 24, (t, b) => { // ---- Records: amp cases, the sofa that did not fit, a lamp and a rug to go with it --------
    pipe(t, 24.9);
    door(t, 30.6, '#1d1d1f', { trim: 'c#d8c9a8/0.7', mat: doormat('FLIP SIDE', '#2a2a2c', '#e0723c'), knock: ['knock at the record shop', 'Nothing. Otis has headphones on.', 'Louder. Still nothing. There is a bass line in the door.', 'A pause between tracks: "...did somebody..." and then the next track.'] });
    t.sign(b + 0.03, 34.4, 5.4, 'out', 2.1, 1.5, note([['DELIVERIES:', '#151517', F.archivo, 0.8], 'knock loudly.', 'Otis has headphones on.', ['(louder than that)', RED]], { bg: '#e8e2d2', pin: '#e0723c' }), px(2.1, 1.5));
    for (const f of [0, 1]) { win(t, 28.5, 17.8 + f * 11.5, 3.2, 6.2, f ? 5 : 1, { trim: 'c#d8c9a8/0.7' }); win(t, 38.5, 17.8 + f * 11.5, 3.2, 6.2, f ? 0 : DARK, { trim: 'c#d8c9a8/0.7' }); win(t, 46.5, 17.8 + f * 11.5, 3.2, 6.2, f ? DARK : 4, { trim: 'c#d8c9a8/0.7' }); }
    win(t, 47.4, 4.6, 3.4, 4, 9, { bars: true, trim: 'c#d8c9a8/0.7' });
    meter(t, 26.9, 5.3, 'LOW TIDE · LOUD'); aerial(t, 34, 2.5); dish(t, 42.6, 38.6);
    creeper(t, 51.2, 53.8, 0, 22, 26, 'shrub', 0.4, 21);
    // flight cases
    { const cs = (u, v, h, w, d, hh, txt) => { t.box('c#1c1c1e/0.5', u - d / 2, u + d / 2, v - w / 2, v + w / 2, h, h + hh); for (const a of [-1, 1]) for (const c of [-1, 1]) t.box(ZINC, u + a * (d / 2 - 0.1), u + a * (d / 2 + 0.03), v + c * (w / 2 - 0.1), v + c * (w / 2 + 0.03), h, h + hh); for (const z of [h, h + hh - 0.1]) t.box(ZINC, u + d / 2, u + d / 2 + 0.03, v - w / 2, v + w / 2, z, z + 0.1); for (const c of [-0.5, 0.5]) t.box(ZINCD, u + d / 2, u + d / 2 + 0.05, v + c * w * 0.5 - 0.12, v + c * w * 0.5 + 0.12, h + hh * 0.5 - 0.16, h + hh * 0.5 + 0.16);
        if (txt) t.sign(u + d / 2 + 0.04, v, h + hh * 0.5, 'out', Math.min(2.2, w * 0.5), hh * 0.5, stencil(txt), px(Math.min(2.2, w * 0.5), hh * 0.5, 90)); };
      cs(b + 1.5, 38.4, 0, 4.4, 2.4, 2.4, ['LOW TIDE P.A.', 'HEAVY · LIFT WITH KNEES (IF FITTED)']); cs(b + 1.4, 38.0, 2.4, 3.4, 2.0, 1.8, ['THIS SIDE LOUD']); cs(b + 1.2, 42.3, 0, 2.4, 2.0, 3.2, ['FRAGILE-ISH']);
      t.hit(b + 0.2, b + 2.8, 36.1, 43.6, 4.2); }
    // the sofa, the lamp, the rug
    settee(t, b + 2.0, 47.6, 6.4, '#b0892e', 'sit on the sofa that did not fit');
    t.sign(b + 5.2, 47.6, 0.1, 'out', 5.6, 3.6, (g, w, h) => { fill(g, w, h, '#7a2f2a'); grain(g, w, h, 0.2, 8); g.strokeStyle = '#e0bd6e'; g.lineWidth = 5; g.strokeRect(10, 10, w - 20, h - 20); g.lineWidth = 2; g.strokeRect(20, 20, w - 40, h - 40); for (let i = 0; i < 5; i++) { ICON.record(g, w * (0.18 + i * 0.16), h / 2, h * 0.34, i % 2 ? '#e0bd6e' : '#24382f', '#7a2f2a'); } }, { flat: true, cw: 224, ch: 144, rough: 1 });
    { const u = b + 1.2, v = 52.0; t.cyl(IRON, u, v, 0, 0.12, 0.55, 0.5, 10); t.cyl(BRASS, u, v, 0.12, 5.2, 0.05, 0.05, 6); t.lathe(LAMP, u, v, 5.1, [[0.85, 0], [0.82, 0.1], [0.45, 1.25], [0.42, 1.25]], 12); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; t.cyl('c#c9a45c/0.8', u + Math.cos(a) * 0.85, v + Math.sin(a) * 0.85, 4.8, 5.1, 0.03, 0.03, 3); }
      K.glowDots.push([t.X(u), 5.6, t.Z(v), 4]); t.lamp(u + 1.2, v - 1.5, 5.4, 0.8); t.hit(u - 0.5, u + 0.5, v - 0.5, v + 0.5, 6); }
    t.sign(b + 0.03, 51.2, 6.9, 'out', 1.9, 1.3, note(['it did not fit', 'through the door.', ['it lives here now. sit.', RED]], { bg: '#f6e9a8', pin: '#151517' }), px(1.9, 1.3));
    // a crate of records, free to whoever
    crate(t, b + 6.2, 43.0, 0, 1.6, 1.6, 1.2, PINED); { const cols = ['#e0723c', '#3c8fa0', '#e8e2d2', '#151517', '#b0892e', '#7a2f2a', '#3f5f43']; for (let i = 0; i < 11; i++) t.box(P(cols[i % 7], 0.7), b + 5.52 + i * 0.12, b + 5.56 + i * 0.12, 42.3, 43.7, 0.1, 1.42 + (i % 3) * 0.04); }
    t.sign(b + 7.03, 43.0, 0.62, 'out', 1.4, 0.9, note([['FREE', '#151517', F.archivo], 'scratched but sincere'], { bg: '#e8e2d2' }), px(1.4, 0.9)); t.hit(b + 5.4, b + 7.0, 42.2, 43.8, 1.5);
    bin(t, b + 1.4, 27.2, '#2f3a34', label(['No. ' + numOf(t.lot), ['no hot ashes', F.caveat], ['no cold takes', F.caveat]], '#2f3a34'));
    boundary(t, 'fence', { mat: 'c#3a3a3e/0.7' });
  });

  yard('bakery', 54, (t, b) => { // ---- Bread: flour on pallets, the cooling rack, the oven's flue ---------------------------
    pipe(t, 77.2);
    door(t, 58.6, '#d8a796', { hinge: -1, mat: doormat('RISE', '#a8785a', '#fbf4e6'), knock: ['knock at the bakery', 'A floury voice: "It is tomorrow\'s. Come back yesterday."', '"Baker is asleep. Baker is always asleep at this hour. Baker gets up at three."', 'Something warm is going on behind this door, and you are not part of it.'] });
    t.sign(b + 0.03, 62.3, 5.4, 'out', 2.0, 1.5, note([['BAKER ASLEEP', '#7a4a3c', F.bebas], 'nine till three.', 'knock only if', ['you are flour.', RED]], { bg: '#fbf4e6', pin: '#d59a8a' }), px(2.0, 1.5));
    win(t, 57.2, 17.8, 3, 6.2, 1); win(t, 63.4, 17.8, 3, 6.2, 8); win(t, 69, 17.8, 3, 6.2, 0, { box: ['marigold', 'herbs'] }); meter(t, 55.2, 5.4, 'TOMORROW · OVENS');
    flue(t, 72.6, 9, { r: 0.5, rise: 4.2 }); t.lamp(b + 2.4, 58.6, 8.6, 0.55); louvre(t, 74.3, 3.2, 1.4);
    // flour
    { const u = b + 2.3, v = 65.2, h = pallet(t, u, v, 0), FL = 'c#efe9dc/1';
      for (let k = 0; k < 4; k++) for (const [du, dv] of k % 2 ? [[0, -1.05], [0, 1.05]] : [[-0.75, -1.0], [0.75, -1.0], [-0.75, 1.0], [0.75, 1.0]]) { if (k === 3 && dv > 0) continue; t.ball(k % 2 ? 'c#e6dfcf/1' : FL, u + du, v + dv, h + 0.36 + k * 0.6, 1, 0.36, k % 2 ? 1.3 : 0.72, 0.98); }
      t.sign(u, v - 1.05, h + 0.36 + 3 * 0.6 + 0.37, 'out', 1.5, 1.2, (g, w, hh) => { fill(g, w, hh, '#efe9dc'); grain(g, w, hh, 0.1, 6); rect(g, 0, hh * 0.08, w, hh * 0.2, '#d59a8a'); T(g, 'TOMORROW', w / 2, hh * 0.18, hh * 0.14, '#fbf4e6', { f: F.bebas, ls: 3 }); T(g, 'strong white', w / 2, hh * 0.46, hh * 0.2, '#7a4a3c', { f: F.pacifico }); T(g, '16 kg · this way to bread', w / 2, hh * 0.72, hh * 0.1, '#7a4a3c', { f: F.elite, max: w * 0.9 }); T(g, 'best before: tomorrow', w / 2, hh * 0.88, hh * 0.1, '#a8361f', { f: F.elite, max: w * 0.9 }); }, { flat: true, cw: 150, ch: 120, rough: 1 });
      t.hit(u - 1.8, u + 1.8, v - 2.1, v + 2.1, 3.2); t.ball('c#f4f0e6/1', u + 2.6, v + 0.6, 0.03, 0.9, 0.03, 1, 0.8); }
    // the cooling rack
    { const u0 = b + 0.9, u1 = b + 2.7, v0 = 68.0, v1 = 70.2; for (const u of [u0, u1]) for (const v of [v0, v1]) { t.tube(ZINC, [u, v, 0.25], [u, v, 6.2], 0.05, 5); t.ball(RUBBER, u, v, 0.14, 0.14); }
      for (const v of [v0, v1]) t.tube(ZINC, [u0, v, 6.2], [u1, v, 6.2], 0.05, 5);
      for (let k = 0; k < 6; k++) { const h = 1.0 + k * 0.95; t.box(ZINCD, u0, u1, v0, v1, h, h + 0.05);
        if (k > 0 && k < 5) for (let i = 0; i < 3; i++) { if (k === 4 && i === 1) continue; const round = (k + i) % 3 === 0; t.ball(['c#c98f4e/0.9', 'c#b87a3c/0.9', 'c#d9a868/0.9'][(k + i) % 3], (u0 + u1) / 2 + (i - 1) * 0.1 * (k % 2 ? 1 : -1), v0 + 0.4 + i * 0.7, h + 0.26, 0.3, 0.72, round ? 1 : 2.1, 1); } }
      t.sign(u1 + 0.06, 69.1, 6.6, 'out', 1.7, 0.7, note([['cooling. COOLING.', '#7a4a3c'], ['one is missing. we know.', RED]], { bg: '#fbf4e6' }), px(1.7, 0.7));
      t.hit(u0 - 0.1, u1 + 0.1, v0 - 0.1, v1 + 0.1, 6.3); }
    // bread trays, and the bin for crusts
    for (let k = 0; k < 5; k++) { t.box(P(k % 2 ? '#5a7a9a' : '#6a8aa8', 0.7), b + 5.0, b + 6.9, 70.4 + (k % 2) * 0.06, 72.9, 0.02 + k * 0.5, 0.44 + k * 0.5); }
    t.sign(b + 6.92, 71.65, 1.25, 'out', 1.7, 0.42, label(['RETURN TO TOMORROW BREAD (TODAY)'], '#5a7a9a'), { cw: 190, ch: 46 }); t.hit(b + 4.9, b + 7.0, 70.3, 73, 2.6);
    bin(t, b + 1.4, 55.3, '#7a5a3c', label(['CRUSTS', ['for the ducks', F.caveat], ['(we have no ducks)', F.caveat, 0.9]], '#7a5a3c'));
  });

  yard('apothecary', 118, (t, b) => { // ---- & Sundry: lavender drying, candles hanging by their wicks, a stair to the flat above -------
    pipe(t, 145.2);
    const H = stair(t, 144.2, 126.4, 120.6);
    door(t, 123.4, '#34405a', { fan: false, mat: doormat('WICK', '#4a4a5a', '#ece2c8'), knock: ['knock at the apothecary', 'Ember: "Coming! No. Not coming. I am at a delicate stage with a candle."', '"If it smells of lavender out there, that is on purpose."', 'A match is struck, somewhere inside. It sounds pleased with itself.'] });
    door(t, 123.4, '#8a9ab8', { h0: H, step: false, fan: false, num: numOf(t.lot) + 'A', hinge: -1, mat: doormat('HOME', '#6a5a4a', '#ece2c8') });
    t.pot(b + 2.7, 121.4, H, 0.6, [['lavender', 0.8]], { collide: false }); t.pot(b + 2.7, 125.6, H, 0.5, [['herbs', 0.7]], { collide: false });
    t.sign(b + 3.33, 126.25, 4.6, 'out', 1.6, 1.3, note([['FLAT ' + numOf(t.lot) + 'A: up', '#26314a'], ['CANDLES: down', '#26314a'], ['do not confuse.', RED]], { bg: '#e4dfd2' }), px(1.6, 1.3));
    win(t, 131.6, 17.8, 3.2, 6.2, 0, { box: ['lavender', 'herbs'] }); win(t, 140, 17.8, 3.2, 6.2, 5);
    meter(t, 127.5, 2.0, 'WICK & SUNDRY'); t.lamp(b + 2.2, 123.4, 7.8, 0.55);
    // drying racks: lavender, tied in bunches, heads down
    for (const [u, v0, v1] of [[b + 5.2, 128.2, 135.4], [b + 7.4, 129.4, 136.6]]) {
      for (const v of [v0, v1]) { for (const du of [-0.9, 0.9]) t.tube(PINED, [u + du, v, 0], [u, v, 6.3], 0.07, 4); t.tube(PINED, [u - 0.45, v, 3.1], [u + 0.45, v, 3.1], 0.05, 4); }
      for (const [du, h] of [[0, 6.2], [-0.42, 3.3], [0.42, 3.3]]) { t.tube(PINED, [u + du, v0, h], [u + du, v1, h], 0.05, 4);
        for (let v = v0 + 0.45; v < v1 - 0.3; v += 0.62) { const dv = (K.r() - 0.5) * 0.15, len = 1.5 + K.r() * 0.3; t.cyl('c#7a8a5a/1', u + du, v + dv, h - 0.75, h - 0.05, 0.04, 0.09, 5); t.cyl(K.r() < 0.5 ? 'c#7b62a8/1' : 'c#8d76b8/1', u + du, v + dv, h - len, h - 0.7, 0.07, 0.19, 6); } }
      t.hit(u - 1, u + 1, v0 - 0.1, v1 + 0.1, 6.4);
    }
    t.sign(b + 5.2, 128.12, 4.7, 'e', 1.7, 1.1, note([['LAVENDER', '#5a4a8a', F.fraunces], 'drying. do not sniff.', ['(sniff a little.)', RED]], { bg: '#e4dfd2' }), px(1.7, 1.1));
    // tapers, dipped and hung in pairs on the wall
    { const h = 9.4; t.box(WOODD, b + 0.02, b + 0.12, 135.3, 142.8, h + 0.2, h + 0.5); for (let v = 135.8; v < 142.6; v += 0.62) { t.tube(IRON, [b + 0.1, v, h + 0.3], [b + 0.5, v, h + 0.3], 0.025, 3); const c = ['c#ece2c8/0.6', 'c#34405a/0.6', 'c#d9b25a/0.6', 'c#c98a8a/0.6'][Math.round(v * 3) % 4]; for (const dv of [-0.12, 0.12]) { t.cyl(c, b + 0.45, v + dv, h - 1.4, h - 0.2, 0.06, 0.035, 5); t.tube('c#efe9dc/0.9', [b + 0.45, v + dv, h - 0.2], [b + 0.45, v, h + 0.3], 0.012, 3); } } }
    // a bed of lavender along the lane, and a tub of soap ends
    plantRow(t, ['lavender'], b + 10.0, 127, 145, 11, 1.0); plantRow(t, ['lavender', 'catmint'], b + 9.0, 127.6, 144.4, 9, 0.9);
    { const u = b + 5.2, v = 141.4; t.lathe(ZINC, u, v, 0, [[0.01, 0], [1.0, 0], [1.2, 1.5], [1.25, 1.5], [1.18, 1.42], [1.0, 0.12], [0.01, 0.12]], 14); const cols = ['c#e8dfcc/0.7', 'c#c9b8d8/0.7', 'c#d9c98a/0.7', 'c#b8c9b0/0.7', 'c#e6bfa6/0.7'];
      for (let i = 0; i < 14; i++) { const a = i * 2.4, rr = 0.2 + (i % 4) * 0.2; t.box(cols[i % 5], u + Math.cos(a) * rr - 0.2, u + Math.cos(a) * rr + 0.2, v + Math.sin(a) * rr - 0.13, v + Math.sin(a) * rr + 0.13, 1.0 + (i % 3) * 0.14, 1.16 + (i % 3) * 0.14, { rot: [0, a, 0] }); }
      t.sign(u + 1.3, v, 0.85, 'out', 1.4, 0.8, note([['SOAP ENDS', '#26314a', F.fraunces], ['still soap. take one.', RED]], { bg: '#e4dfd2' }), px(1.4, 0.8)); t.hit(u - 1.2, u + 1.2, v - 1.2, v + 1.2, 1.6); }
    boundary(t, 'fence', { mat: 'c#c9bfae/0.8' });
  });

  yard('noodles', 146, (t, b) => { // ---- Noodle: the extractor, crates of bottles, the stool for breaks, a fire escape with lanterns --
    const TR = 'c#c8402f/0.6';
    pipe(t, 146.9);
    door(t, 160.6, '#c8402f', { trim: 'c#2a2320/0.7', mat: doormat('SLURP', '#3a2a22', '#e8553f'), knock: ['knock at the noodle bar', '"We open when the sun goes down!" A pause. "So. Soon."', 'The sound of one counter being wiped, thoroughly, again.', '"Staff only! There is one staff! It is me!"'] });
    t.sign(b + 0.03, 164.3, 5.4, 'out', 1.9, 1.4, note([['STAFF ONLY', '#e8553f', F.archivo, 0.85], ['(there is one staff)', '#f1efe6'], ['broth is a secret', '#e9c46a']], { slate: true }), { ...px(1.9, 1.4), rough: 0.95 });
    for (const f of [0, 1]) { win(t, 150, 17.8 + f * 11.5, 3.2, 6.2, f ? 1 : 3, { trim: TR }); win(t, 154.6, 17.8 + f * 11.5, 2.4, 6.2, f ? DARK : 0, { trim: TR }); win(t, 164.2, 17.8 + f * 11.5, 3.2, 6.2, f ? 4 : 5, { trim: TR }); }
    win(t, 149.6, 4.6, 3.4, 4, 8, { trim: TR }); meter(t, 166.6, 7.4, 'NIGHT NOODLE');
    fireEscape(t, 147.6, 156.3, 2);
    for (const [v, f] of [[149, 0], [152.2, 0], [155.4, 0], [150.6, 1], [154, 1]]) { const h = 14.3 + f * 11.5 + 4.6 - (v * 7 % 3) * 0.2; t.tube(IRON, [b + 3.34, v, 14.3 + f * 11.5 + 3.4], [b + 3.9, v, h + 0.75], 0.02, 3); t.tube(IRON, [b + 3.9, v, h + 0.75], [b + 3.9, v, h + 0.4], 0.012, 3); t.glow(b + 3.9, v, h, 0.4, LANT); }
    t.pot(b + 2.4, 148.4, 14.3, 0.55, [['herbs', 0.9]], { collide: false }); t.pot(b + 2.4, 155.6, 14.3, 0.5, [['leek', 1.2]], { collide: false }); t.pot(b + 2.4, 149.0, 25.8, 0.55, [['chard', 1]], { collide: false });
    // the extractor: a fan box on the wall and a fat duct to the roof
    flue(t, 157.5, 10.5, { r: 0.56, rise: 4 }); t.box(ZINC, b, b + 1.5, 156.6, 158.4, 8.4, 10.3); t.box(ZINCD, b + 1.5, b + 1.56, 156.8, 158.2, 8.6, 10.1); t.torus(IRON, b + 1.58, 157.5, 9.35, 0.55, 0.05, 'wall', 12);
    t.tube(ZINC, [b + 0.3, 152.4, 6.6], [b + 0.9, 152.4, 6.6], 0.16, 6); t.cyl(ZINC, b + 0.9, 152.4, 6.6, 9.4, 0.16, 0.16, 6); K.steam.push([t.X(b + 0.9), 9.5, t.Z(152.4)]);
    // crates of bottles
    { const cols = ['c#c8402f/0.7', 'c#d9a82e/0.7', 'c#c8402f/0.7', 'c#3f6a5a/0.7']; let i = 0;
      for (const [u, v, n] of [[b + 1.0, 165.6, 4], [b + 2.6, 165.5, 3], [b + 1.1, 163.7, 2]]) { for (let k = 0; k < n; k++) crate(t, u, v + (k % 2) * 0.05, k * 1.0, 1.6, 1.3, 0.95, cols[i++ % 4]);
        for (let j = 0; j < 12; j++) t.cyl(['c#3a5a34/0.3', 'c#5a3a1c/0.3', 'c#3a5a34/0.3'][j % 3], u - 0.4 + (j % 3) * 0.4, v - 0.55 + Math.floor(j / 3) * 0.37, (n - 1) * 1.0 + 0.1, (n - 1) * 1.0 + 1.3, 0.13, 0.05, 6); }
      t.sign(b + 3.27, 165.5, 1.5, 'out', 1.4, 0.8, label(['EMPTIES', ['full of potential', F.caveat]], '#d9a82e', '#2a1c13'), px(1.4, 0.8)); t.hit(b + 0.2, b + 3.4, 162.8, 166.6, 4.4); }
    // the stool for breaks: an upturned crate, a bowl, a timer nobody believes
    { const u = b + 4.6, v = 152.6; t.cyl(WOOD, u, v, 1.5, 1.62, 0.62, 0.62, 12); for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.4; t.tube(WOODD, [u + Math.cos(a) * 0.5, v + Math.sin(a) * 0.5, 0], [u + Math.cos(a) * 0.3, v + Math.sin(a) * 0.3, 1.5], 0.06, 5); }
      t.seat(u, v, 1.62, 'out', 'take five on the break stool'); t.hit(u - 0.55, u + 0.55, v - 0.55, v + 0.55, 1.6);
      crate(t, u - 0.2, v + 2.0, 0, 1.6, 1.3, 1.1, 'c#d9a82e/0.7'); t.box('c#d9a82e/0.7', u - 0.85, u + 0.45, v + 1.2, v + 2.8, 1.1, 1.16);
      t.lathe('c#e9e2d2/0.5', u - 0.2, v + 1.8, 1.16, [[0.01, 0], [0.2, 0], [0.42, 0.3], [0.44, 0.32], [0.38, 0.3], [0.18, 0.05], [0.01, 0.05]], 12); for (const dv of [-0.04, 0.05]) t.tube('c#2a1c13/0.6', [u - 0.5, v + 1.6 + dv, 1.5], [u + 0.25, v + 2.05 + dv, 1.5], 0.015, 3);
      t.cyl('c#c8402f/0.5', u - 0.1, v + 2.5, 1.16, 1.42, 0.13, 0.13, 8); t.hit(u - 0.9, u + 0.5, v + 1.2, v + 2.8, 1.5);
      t.sign(b + 0.03, 155.9, 5.5, 'out', 1.7, 1.2, note([['BREAK STOOL', '#e9c46a'], ['five minutes.', '#f1efe6'], ['(it has been forty.)', '#e8a8a0']], { slate: true }), { ...px(1.7, 1.2), rough: 0.95 }); t.lamp(b + 3.4, 156.2, 8.2, 0.7); }
    bin(t, b + 6.4, 166.4, '#2f3a34', label(['GLASS', ['and regrets', F.caveat]], '#2f3a34'), 'e');
    dish(t, 166.4, 38.8);
    boundary(t, 'fence', { mat: 'c#2a2320/0.7' });
  });


  // ======================================================================================
  // BETWEEN AND BEHIND THE YARDS: washing lines, the lanes, the end walls, and what is across the lanes
  // ======================================================================================
  // Where an iron arm for a washing line can go on each back wall (clear of windows, flues and escapes), near its
  // east end and near its west, in the yard's own feet; and what that shop hangs out.
  const ARMS = {
    coffee: { from: 24, e: 24.9, w: 50.4, hang: [['apron', '#2f4a40', '#e9e0cc'], ['cloth', '#e9e0cc', '#2f4a40'], ['cloth', '#e9e0cc', '#b8452e']] },
    yoga: { from: -8, e: 2.2, w: 20.7, hang: [['towel', '#c98a6a', '#fbf1df'], ['towel', '#7f9077', '#fbf1df'], ['tee', '#e6dccb', '#c98a6a']] },
    books: { from: 56, e: 64.2, w: 74.8, hang: [['shirt', '#b98f7c'], ['scarf', '#7a2f2a', '#d9b25a'], ['sock', '#d9b25a', '#7a2f2a'], ['sock', '#34405a', '#e9e0cc']] },
    museum: { from: -8, e: 1.2, w: 19.6, hang: [['gloves', '#f1efe8'], ['gloves', '#f1efe8'], ['cloth', '#e8dfcc', '#3a4a44']] },
    records: { from: 24, e: 33.6, w: 49.6, hang: [['tee', '#151517', '#e0723c'], ['tee', '#151517', '#3c8fa0'], ['tee', '#1d1d1f', '#e8e2d2']] },
    bakery: { from: 54, e: 60.8, hang: [['apron', '#fbf4e6', '#d59a8a'], ['cloth', '#fbf4e6', '#d59a8a'], ['cloth', '#f3ecdd', '#d59a8a'], ['sock', '#d59a8a', '#fbf4e6']] },
  };
  for (const s of [1, -1]) {
    const lots = sideLots(s).filter(l => l.id !== 'grocery');      // (the grocer's back is the rooftop bar's stair and lawn: not ours)
    // ---- washing between neighbours: one line for every other pair ------------------------------------------
    const used = new Set();
    for (const A of lots) {
      const N = nextTo(A), a = ARMS[A.id], n = N && ARMS[N.id];
      if (!N || !a || !n || a.w === undefined || n.e === undefined || used.has(A.id) || used.has(N.id)) continue;
      used.add(A.id); used.add(N.id);
      const tA = tools(A, a.from), tN = tools(N, n.from), u = Math.max(A.back, N.back) + 2.6, vA = a.w, vN = n.e + (N.y0 - n.from) - (A.y0 - a.from);      // both ends in A's feet
      arm(tA, a.w, 16.9, u - A.back); arm(tN, n.e, 16.9, u - N.back);
      const items = [...a.hang, ...n.hang];
      washing(tA, [u, vA, 16.7], [u, vN, 16.7], items.map(([k, c1, c2], i) => [(i + 0.6) / (items.length + 0.2), k, c1, c2]), 0.65);
    }
    // ---- the lane: trodden gravel a dozen feet behind the walls, from one end of each run of yards to the other ----
    const runs = []; for (const l of lots) { const r = runs[runs.length - 1]; if (r && Math.abs(r[r.length - 1].y1 - l.y0) < 0.01) r.push(l); else runs.push([l]); }
    for (const run of runs) {
      const first = run[0], last = run[run.length - 1], pts = [], OUT = first.id === 'plants' ? 14.2 : 12.8;      // (the plant shop's yard is the deepest)
      const atStart = first.y0 < -4, more = town.footprints?.some(f => (s > 0 ? f.x0 > 20 : f.x1 < -20) && -f.z0 > last.y1 + 1 && -f.z0 < last.y1 + 40);      // something built beyond the last yard?
      if (atStart) pts.push([24.2, first.y0 - 5], [0.5 * (24 + first.back) + 3, first.y0 - 5.4], [first.back + 2.6, first.y0 - 4.2], [first.back + OUT - 1.8, first.y0 + 3], [first.back + OUT - 0.5, first.y0 + 14]);
      for (const l of run) { const w = l.y1 - l.y0; if (!(atStart && l === first)) pts.push([l.back + OUT, l.y0 + Math.min(7, w * 0.3)]); pts.push([l.back + OUT, l.y1 - Math.min(7, w * 0.3)]); }
      if (!more && last.y1 > 170 && last.y1 < 193) pts.push([last.back + 11, last.y1 - 1], [last.back + 4, last.y1 + 6.5], [40.5, 202.5], [34.8, 204.5]);      // round the last wall to the Overlook
      else pts.push([last.back + OUT, last.y1 - 3.2]);
      if (!atStart) pts.unshift([first.back + OUT, first.y0 + 1.2]);
      K.G.ribbon('gravel', pts.map(([u, v]) => [s * u, -v]), 3.6, { wobble: 0.14 });
      // tufts along its far edge
      for (const l of run) for (let v = l.y0 + 2; v < l.y1 - 1; v += 3.4) K.F.add(K.pick(['grass', 'grass', 'wildflowers', 'cosmos', 'catmint']), s * (l.back + OUT + 2.6 + K.r() * 1.2), -(v + K.r() * 2), 0.6 + K.r() * 0.35);
    }
    // ---- the end wall by the Landing, under its painted advertisement: low planting, and a bicycle or a bench ----
    const end = lots[0];
    if (end && end.y0 < -4) {
      const t = tools(end), v0 = end.y0, mid = 0.5 * (24 + end.back) + (s > 0 ? 1.5 : 0.5);
      for (let u = 27.5; u < end.back - 1.5; u += 4.5) if (Math.abs(u - mid) > 4.4) t.plant(Math.round(u) % 2 ? 'hydrangea' : 'fern', u + K.r(), v0 - 1.3 - K.r() * 0.6, 0.75 + K.r() * 0.25);
      for (let u = 29; u < end.back - 2; u += 5.2) if (Math.abs(u - mid) > 4.4) t.plant('hosta', u, v0 - 1.9, 1);
      if (s > 0) { t.bike(mid, v0 - 1.6, 0, 'c#c98a6a/0.4', 0, { lean: -0.16, basket: true }); t.hit(mid - 2, mid + 2.1, v0 - 2.3, v0, 3.3); }
      else t.bench(mid, v0 - 1.25, 'e', 'sit with your back to the bricks');
    }
  }

  { // ---- the allotment across the south lane: a vegetable patch, the shared shed, a bench ---------------------
    const t = tools({ side: -1, back: 71, y0: 28, y1: 52, top: 8 }), b = t.b;
    K.G.rect('soil', -84, -71.4, -46.4, -29.6);
    for (const [u0, u1, v0, v1] of [[71.2, 84.2, 29.4, 29.65], [71.2, 84.2, 46.35, 46.6], [71.2, 71.45, 29.4, 46.6], [83.95, 84.2, 29.4, 46.6]]) t.box(PINED, u0, u1, v0, v1, 0, 0.5);
    const rows = [[72.6, ['lettuce', 'lettuceRed'], 0.95, 1.0, 'LETTUCE (theoretical)'], [74.5, ['kale', 'chard'], 1.3, 1.0, 'KALE. again.'], [76.4, ['leek', 'carrot'], 0.8, 1.0, 'LEEKS / carrots (rumoured)'], [78.4, ['tomato'], 1.7, 0.85, 'TOMATOES: not yet. stop checking.'], [80.4, ['bean'], 1.5, 0.9, 'BEANS vs. gravity'], [82.6, ['squash', 'cabbage'], 2.0, 1.0, 'SQUASH (ambitious)']];
    for (const [u, kinds, step, sc, words] of rows) {
      for (let v = 30.6; v < 46; v += step) t.plant(kinds[Math.round(v / step) % kinds.length], u + (K.r() - 0.5) * 0.3, v + (K.r() - 0.5) * 0.2, sc * (0.85 + K.r() * 0.3));
      t.box(PINE, u - 0.03, u + 0.03, 29.1, 29.2, 0, 1.5); t.sign(u, 29.08, 1.25, 'e', 1.5, 0.6, note([[words, '#2a1c13']], { bg: '#efe7d2' }), { cw: 150, ch: 60 });
    }
    for (let v = 31; v < 46; v += 1.5) { t.tube('c#c9a56a/0.9', [78.4, v, 0], [78.4, v, 5.2], 0.03, 3); for (const du of [-0.5, 0.5]) t.tube('c#c9a56a/0.9', [80.4 + du, v, 0], [80.4, v, 6.8], 0.03, 3); } t.tube('c#c9a56a/0.9', [80.4, 31, 6.6], [80.4, 45.5, 6.6], 0.03, 3);
    for (const v of [31.5, 36, 40.5, 45]) t.plant('sunflower', 84.9, v, 1);
    // the scarebot, off duty
    { const u = 77.4, v = 38.2; t.box(WOODD, u - 0.1, u + 0.1, v - 0.1, v + 0.1, 0, 6.2); t.box(WOODD, u - 0.07, u + 0.07, v - 2.2, v + 2.2, 4.6, 4.8); t.box('c#8c3b2e/1', u - 0.3, u + 0.3, v - 1.0, v + 1.0, 2.9, 5.0); for (const sg of [-1, 1]) t.box('c#8c3b2e/1', u - 0.2, u + 0.2, v + sg * 1.0, v + sg * 2.0, 4.35, 5.0);
      t.cyl(ZINC, u, v, 5.2, 6.5, 0.55, 0.65, 12); t.tube(IRON, [u, v, 6.5], [u, v, 7.2], 0.025, 3); t.ball(P('#c8402f', 0.5), u, v, 7.25, 0.1); for (const sg of [-1, 1]) t.glow(u - 0.6, v + sg * 0.24, 5.95, 0.09, LANT);
      t.sign(u - 0.35, v, 3.7, 'in', 1.5, 0.9, note(['SCAREBOT', ['off duty. crows welcome.', RED]], { bg: '#efe7d2' }), px(1.5, 0.9)); t.hit(u - 0.3, u + 0.3, v - 0.3, v + 0.3, 6); }
    // the shed
    { const u0 = 75.2, u1 = 82.6, v0 = 48.6, v1 = 55.4, hw = 6.6, GRN = 'painted_wood#6a8474';
      t.box(GRN, u0, u1, v0, v1, 0.1, hw, { grain: 'long' }); t.box(STONE, u0 - 0.2, u1 + 0.2, v0 - 0.2, v1 + 0.2, 0, 0.1);
      const vm = (v0 + v1) / 2, pk = hw + 2.3; for (let k = 0; k < 4; k++) { const f = (k + 0.5) / 4; t.box(P('#6a8474', 0.8), u0 + 0.02, u1 - 0.02, v0 + (vm - v0) * f, v1 - (v1 - vm) * f, hw + (pk - hw) * k / 4, hw + (pk - hw) * (k + 1) / 4); }
      for (const sg of [-1, 1]) t.beam('c#4a4640/0.9', [(u0 + u1) / 2, vm + sg * (vm - v0 + 0.5), hw - 0.2], [(u0 + u1) / 2, vm, pk + 0.2], u1 - u0 + 0.8, 0.12);
      t.box(P('#4f6a5a', 0.7), u0 - 0.06, u0, vm - 2.9, vm - 0.3, 0.1, 6.0); t.box(CREAM, u0 - 0.1, u0 - 0.06, vm - 3.05, vm - 2.9, 0.1, 6.15); t.box(CREAM, u0 - 0.1, u0 - 0.06, vm - 0.3, vm - 0.15, 0.1, 6.15); t.box(CREAM, u0 - 0.1, u0 - 0.06, vm - 3.05, vm - 0.15, 6.0, 6.15); t.ball(BRASS, u0 - 0.14, vm - 0.6, 3.2, 0.09);
      for (const [a0, a1, c0, c1] of [[0.5, 0.64, 2.6, 5.4], [2.56, 2.7, 2.6, 5.4], [0.5, 2.7, 2.6, 2.74], [0.5, 2.7, 5.26, 5.4], [1.55, 1.65, 2.6, 5.4]]) t.box(CREAM, u0 - 0.1, u0 - 0.03, vm + a0, vm + a1, c0, c1);
      panes.push({ x: t.s * (u0 - 0.04), y: 4.0, z: -(vm + 1.6), w: 2.1, h: 2.6, side: 1, kind: 9 });
      t.sign(u0 - 0.08, vm - 1.6, 6.75, 'in', 2.9, 0.75, label(['THE SHED', ['(shared)', F.caveat, 0.8]], '#e8e0cc', '#24382f'), px(2.9, 0.75));
      t.sign(u0 - 0.08, vm - 1.6, 4.3, 'in', 1.7, 1.5, note(['TROWEL missing', 'since spring.', 'no questions asked.', ['(some questions asked.)', RED]], { pin: '#c8402f' }), px(1.7, 1.5));
      // a spade, a fork and a rake, leaning; a lantern by the door
      for (const [dv, tip] of [[4.25, 'c#8d9296/0.6'], [4.6, 'c#73787c/0.6']]) { t.tube(WOOD, [u0 - 1.0, vm + dv - 1.3, 0.5], [u0 - 0.1, vm + dv - 1.3, 5.6], 0.05); t.box(tip, u0 - 1.12, u0 - 0.98, vm + dv - 1.56, vm + dv - 1.04, 0, 0.6); }
      t.tube(IRON, [u0, vm + 1.6, 6.4], [u0 - 0.6, vm + 1.6, 6.4], 0.035); t.glow(u0 - 0.6, vm + 1.6, 6.08, 0.2, LANT);
      t.hit(u0 - 0.2, u1 + 0.2, v0 - 0.2, v1 + 0.2, 9); }
    // the bench, where the gardeners argue about the squash
    t.bench(73.6, 25.2, 'w', 'sit by the vegetables'); t.pot(77.8, 25.0, 0, 1.0, [['herbs', 1.0], ['marigold', 0.8, 0.4, 0.2]]);
  }
  { // ---- across the north lane: a bench under the trees, a log pile, a bird table -----------------------------
    const t = tools({ side: 1, back: 70, y0: 30, y1: 60, top: 8 });
    t.bench(70.6, 47.5, 'in', 'sit behind the shops');
    for (let k = 0; k < 4; k++) for (let i = 0; i < 5 - k; i++) { const g = new THREE.CylinderGeometry(0.42, 0.42, 3.4, 8); g.rotateX(Math.PI / 2); g.translate(71.2 + k * 0.42 + i * 0.86, 0.42 + k * 0.74, -55.2); K.put(i % 2 ? 'c#6a5240/1' : 'c#7a604a/1', g); const e = new THREE.CylinderGeometry(0.36, 0.36, 3.44, 8); e.rotateX(Math.PI / 2); e.translate(71.2 + k * 0.42 + i * 0.86, 0.42 + k * 0.74, -55.2); K.put('c#c9a878/1', e); }
    t.hit(70.6, 75.4, 53.4, 57, 3.2);
    t.sign(73.0, 53.46, 1.6, 'e', 1.8, 0.9, note(['LOGS for the Yard fire', ['take two. bring a story.', RED]]), px(1.8, 0.9));
    { const u = 70.2, v = 38; t.box(WOODD, u - 0.1, u + 0.1, v - 0.1, v + 0.1, 0, 4.8); t.box(PINE, u - 0.9, u + 0.9, v - 0.9, v + 0.9, 4.8, 4.9); for (const sg of [-1, 1]) t.beam(WOOD, [u, v + sg * 1.2, 5.7], [u, v, 6.5], 2.0, 0.08); for (const [du, dv] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) t.box(WOODD, u + du - 0.04, u + du + 0.04, v + dv - 0.04, v + dv + 0.04, 4.9, 5.8);
      t.sign(u - 0.12, v, 3.4, 'in', 1.2, 0.7, note(['crumbs: Tomorrow Bread', ['birds: pending', RED]]), px(1.2, 0.7)); t.hit(u - 0.3, u + 0.3, v - 0.3, v + 0.3, 5); }
  }
}

// ---- once the scene exists: the panes (lit after dark), and somebody to answer the doors -----------------
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
  // knock, and see who does not come
  for (const k of B.knocks) {
    let n = 0;
    ctx.interact?.push({ x: k.x, y: k.y, z: k.z, reach: 7, size: 1.6, label: () => k.label, act: () => {
      try { ctx.sound?.note?.(45, 0, 0.07, 0.25); ctx.sound?.note?.(45, 0.16, 0.07, 0.25); ctx.sound?.note?.(43, 0.32, 0.09, 0.3); } catch { /* no sound yet */ }
      ctx.flash?.(k.lines[n++ % k.lines.length]);
    } });
  }
}
