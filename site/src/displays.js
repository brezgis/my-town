// The three shops that are shut: you cannot go in, but their windows are lit and
// dressed, and each has left a note on the door.
//   Night Noodle        opens when the sun goes down (any minute now)
//   Spoke & Sprocket    bicycles; back in five minutes
//   The Lantern         the picture house: a marquee, posters, and the way round the back
// Each window is a shallow room (lot.D deep); lot.fr works as in the open shops.

import * as THREE from 'three';
import { tools, fixtures } from './shopkit.js';
import { FRONT, CURB, FL, SHOPTOP } from './town.js';
import { T, F, fill, grain, paper, board, slate, chalk, disc, rect, rrect, line, poly, para, glow, ICON, rnd, TAU } from './draw.js';

// A note taped inside the door glass
const doorNote = (kit, lot, draw, w = 1.5, h = 1.9) => kit.sign(lot.fr(kit, lot.doorA, -0.48, 0, 'back').sub(0, 0, 0, 2), 0, 0, 4.9, w, h, draw, { cw: Math.round(w * 150), ch: Math.round(h * 150) });

export function dressWindows(Ks, town) {
  const kit = Ks.kit;

  // ======================================================================================
  // NIGHT NOODLE
  // ======================================================================================
  {
    const lot = town.lots.noodles, K = tools(kit, 72), X = fixtures(kit, K), at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face)), R = at(0, 0), W = lot.W, D = lot.D;
    // the bar seen through the window: a counter along the back with stools, bowls set out, steam, bottles
    const b = at(W / 2 + 2.6, D - 0.02, 0, 'street');
    X.counter(b, -7, 7, 0.9, 2.6, 3.5, { front: 'fir#3a2c24', top: 'oak_light#a3825c', panels: false });
    for (let i = 0; i < 5; i++) { const x = -5.6 + i * 2.8; X.stool(b, x, 3.9, 2.4, { mat: 'c#c8402f/0.6', label: 'sit' }); K.bowl(b, x, 2.0, 3.5, 0.42, 0.3, K.pick(['c#26364f/0.3', 'c#e8e2d4/0.3', 'c#17140f/0.3'])); K.hcyl(b, 'c#17140f/0.6', 'y', x + 0.5, 2.0, 3.53, 0.8, 0.015); K.hcyl(b, 'c#17140f/0.6', 'y', x + 0.56, 2.0, 3.53, 0.8, 0.015); }
    X.shelving(b, -7, 7, [5.2, 6.6], { d: 0.8, mat: 'fir#3a2c24', back: false, over: 0.02, block: false });
    for (let i = 0; i < 12; i++) K.bottle(b, -6.5 + i * 0.6, 0.45, 5.2, { r: 0.11, h: 0.9, col: K.pick(['c#3a2214/0.2', 'c#2f4a2a/0.2', 'c#8a1c1c/0.2', 'c#c9952a/0.2']), label: 'c#efe2bc/0.6' });
    for (let i = 0; i < 9; i++) K.bowl(b, -3 + i * 0.75, 0.45, 6.6, 0.3, 0.22, 'c#e8e2d4/0.3', 12);
    for (let i = 0; i < 4; i++) K.ves(b, 'c#c9a56a/0.8', 4.4, 0.45, 6.6 + i * 0.3, [[0, 0], [0.42, 0], [0.42, 0.28], [0, 0.28]], 14);
    kit.steam.push(...[-2.8, 0, 2.8].map(x => { const [wx, wz] = kit.world(b, x, 2.0); return { x: wx, y: FL + 3.9, z: wz }; }));
    // the menu, lit, over the bar
    kit.sign(b, 0, 0.05, 9.2, 12.5, 2.2, (g, w, h) => { fill(g, w, h, '#1c1614'); const items = [['shoyu', '9'], ['miso & corn', '10'], ['the spicy one', '10'], ['cold sesame', '9'], ['dumplings ×6', '6'], ['an egg', '1½']]; items.forEach(([n, p], i) => { const x = w * (0.04 + i * 0.162); rrect(g, x, h * 0.1, w * 0.145, h * 0.8, 6, '#f3e6c8'); T(g, n, x + w * 0.0725, h * 0.4, h * 0.19, '#1c1614', { f: F.archivo, max: w * 0.13 }); T(g, p, x + w * 0.0725, h * 0.7, h * 0.24, '#c8402f', { f: F.dm }); }); }, { cw: 1000, ch: 176, glow: 0.8 });
    // paper lanterns inside, and a noren across the door
    for (const a of [3.5, 9, 14.5, 19]) X.pendant(R, a, 2.4 + (a % 2), { kind: 'paper', drop: 3.4, power: 0.6 });
    { const f = lot.fr(kit, lot.doorA, -0.36, 0, 'back'); for (let i = 0; i < 4; i++) { const x = -1.35 + i * 0.9; f.box('linen#34405a', x - 0.42, x + 0.42, 0, 0.02, 5.0, 7.5); } f.cyl('c#8a6a48/0.8', 0, 0.01, 7.5, 7.56, 0.03, 0.03, 6);
      kit.sign(f.sub(0, 0, 0, 2), 0, 0.03, 6.3, 3.2, 1.6, (g, w, h) => { g.clearRect(0, 0, w, h); fill(g, w, h, '#2b3650'); ICON.bowl(g, w / 2, h * 0.5, h * 0.8, '#f3e6c8'); }, { cw: 256, ch: 128 }); }
    doorNote(kit, lot, (g, w, h) => { paper(g, w, h, '#f3e6c8'); T(g, 'OPENS', w / 2, h * 0.16, h * 0.13, '#c8402f', { f: F.archivo }); T(g, 'when the sun goes down', w / 2, h * 0.32, h * 0.085, '#1c1614', { f: F.fraunces, it: 1, w: 600, max: w * 0.84 }); T(g, 'any minute now', w / 2, h * 0.5, h * 0.12, '#1c1614', { f: F.caveat, w: 600 }); T(g, 'any minute', w / 2, h * 0.63, h * 0.1, '#5a4a40', { f: F.caveat, w: 600 }); T(g, 'any', w / 2, h * 0.74, h * 0.08, '#8a7a70', { f: F.caveat, w: 600 }); ICON.bowl(g, w / 2, h * 0.88, h * 0.12, '#c8402f'); }, 1.4, 1.8);
    // outside: red lanterns under the cornice, a bench for the queue that will form
    const s = lot.side;
    for (const v of [lot.y0 + 3, lot.y0 + 8, lot.y1 - 8, lot.y1 - 3]) { const x = s * (FRONT - 1.3), h = FL + 9.0; Ks.tube('c#1d1b18/0.5', [s * (FRONT - 0.1), h + 1.3, -v], [x, h + 1.3, -v], 0.03, 4); Ks.tube('c#1d1b18/0.5', [x, h + 1.3, -v], [x, h + 0.6, -v], 0.015, 4); Ks.B.mesh('e#ff7a5a/1.6', new THREE.SphereGeometry(0.5, 12, 10).scale(1, 1.2, 1).translate(x, h, -v)); Ks.put('c#1d1b18/0.5', new THREE.CylinderGeometry(0.2, 0.2, 0.1, 10).translate(x, h + 0.62, -v)); Ks.glowDots.push([x, h, -v, 2.6]); }
    Ks.bench(s * (FRONT - 1.6), -(lot.y1 - 6), s > 0 ? -Math.PI / 2 : Math.PI / 2, { y: CURB, w: 5, mat: 'c#5a4432/0.85' }); Ks.seat(s * (FRONT - 1.6), CURB + 1.4, -(lot.y1 - 6), s > 0 ? Math.PI / 2 : -Math.PI / 2, 'sit and wait for noodles');
  }

  // ======================================================================================
  // SPOKE & SPROCKET
  // ======================================================================================
  {
    const lot = town.lots.bikes, K = tools(kit, 73), X = fixtures(kit, K), at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face)), R = at(0, 0), W = lot.W, D = lot.D;
    // two bicycles on a low stage in the window, wheels on the wall, a workbench
    R.box('oak_light#b89466', 8, W - 0.6, 0.5, 5.2, 0, 0.9);
    const [x1, y1] = lot.XY(12.2, 2.6), [x2, y2] = lot.XY(17.6, 3.4);
    Ks.bike(x1, y1, 0.12, 'c#3f6a5a/0.4', FL + 0.9, { lean: 0.02, basket: true }); Ks.bike(x2, y2, -0.1, 'c#c8402f/0.4', FL + 0.9, { lean: 0.02 });
    const b = at(W / 2, D - 0.02, 0, 'street');
    for (const [x, z] of [[-8, 7.6], [-5.2, 7.9], [5.4, 7.7], [8.2, 7.9]]) { kit.put(b, 'c#1c1c1c/0.9', new THREE.TorusGeometry(1.08, 0.07, 6, 24).rotateX(Math.PI / 2), { at: [x, 0.25, z] }); kit.put(b, 'c#b9bcc0/0.3/1', new THREE.TorusGeometry(1.0, 0.025, 4, 24).rotateX(Math.PI / 2), { at: [x, 0.25, z] }); b.cyl('c#b9bcc0/0.3/1', x, 0.12, z - 0.0, z + 0.02, 0.06, 0.06, 6); }
    kit.sign(b, 0, 0.05, 6.4, 7.6, 3.6, (g, w, h) => { fill(g, w, h, '#c9b48a'); grain(g, w, h, 0.07); for (let x = 20; x < w; x += 24) for (let y = 20; y < h; y += 24) disc(g, x, y, 2, 'rgba(60,40,20,.45)');
      const tool = (x, y, len, a, c) => { g.save(); g.translate(x, y); g.rotate(a); rrect(g, -6, 0, 12, len, 5, c); g.restore(); }; const r = rnd(9);
      for (let i = 0; i < 11; i++) { const x = w * (0.08 + i * 0.082); tool(x, h * 0.16, h * (0.3 + r() * 0.3), (r() - 0.5) * 0.1, ['#3a3a3e', '#c8402f', '#d9a82e', '#3f6a5a'][i % 4]); disc(g, x, h * 0.16, 9, null, '#3a3a3e', 4); }
      T(g, 'everything has a place', w / 2, h * 0.84, h * 0.09, '#3a2c10', { f: F.caveat, w: 600 }); T(g, '(the 10 mm is not in it)', w / 2, h * 0.93, h * 0.07, '#a8361f', { f: F.caveat, w: 600 }); }, { cw: 608, ch: 288 });
    X.counter(b, -3.4, 3.4, 0.4, 2.2, 3.3, { front: 'painted_wood#d4a02a', top: 'oak_light#8a6a48', panels: false });
    K.ves(b, 'c#c8402f/0.4', -2.4, 1.3, 3.3, [[0, 0], [0.3, 0], [0.3, 0.5], [0, 0.5]], 12); for (let i = 0; i < 5; i++) K.tube(b, 'c#b9bcc0/0.3/1', [[-2.4 + (i - 2) * 0.08, 1.3, 3.5], [-2.4 + (i - 2) * 0.16, 1.3, 4.3]], 0.02, 4);
    kit.put(b, 'c#b9bcc0/0.3/1', new THREE.TorusGeometry(0.32, 0.05, 6, 16), { at: [1.4, 1.3, 3.36] }); for (let i = 0; i < 3; i++) K.ves(b, 'c#17140f/0.4', 2.4, 1.0 + i * 0.3, 3.3, [[0, 0], [0.1, 0], [0.1, 0.34], [0.04, 0.4], [0, 0.4]], 8);
    // bells and saddles and a ball of inner tubes on a shelf by the door
    { const l = at(0, 3.2, 0, 'right'); X.shelving(l, -2.6, 2.6, [2.4, 3.8, 5.2], { d: 0.9, mat: 'oak_light#b89466' });
      for (let i = 0; i < 6; i++) { K.ball(l, K.pick(['c#b08d4a/0.3/1', 'c#c9ccd0/0.2/1', 'c#c8402f/0.3', 'c#3f6a5a/0.3']), -2.1 + i * 0.84, 0.5, 5.2, 0.17, 10, 0.75); }
      for (let i = 0; i < 4; i++) l.soft(K.pick(['c#5a3a24/0.6', 'c#17140f/0.6', 'c#8a5a2a/0.6']), -2.2 + i * 1.3, -1.6 + i * 1.3, 0.2, 0.8, 3.8, 4.02, 0.08);
      for (let i = 0; i < 5; i++) kit.put(l, 'c#17140f/0.9', new THREE.TorusGeometry(0.34, 0.06, 5, 14).rotateX(Math.PI / 2), { at: [-1.8 + i * 0.9, 0.5, 2.48] }); }
    doorNote(kit, lot, (g, w, h) => { paper(g, w, h, '#f6e9a8'); T(g, 'BACK IN', w / 2, h * 0.18, h * 0.13, '#1d1b18', { f: F.bebas, ls: 3 }); T(g, '5', w / 2, h * 0.42, h * 0.34, '#c8402f', { f: F.abril }); T(g, 'MINUTES', w / 2, h * 0.64, h * 0.13, '#1d1b18', { f: F.bebas, ls: 3 }); T(g, '(est. since tuesday)', w / 2, h * 0.8, h * 0.075, '#3a2c10', { f: F.caveat, w: 600 }); T(g, 'pump is by the rack, help yourself', w / 2, h * 0.92, h * 0.058, '#3a2c10', { f: F.caveat, w: 600, max: w * 0.88 }); }, 1.4, 1.8);
    for (const a of [6, 13, 19]) X.pendant(R, a, 3, { kind: 'cone', drop: 3.2, colour: 'c#d4a02a/0.35', power: 0.7 });
  }

  // ======================================================================================
  // THE LANTERN: the picture house
  // ======================================================================================
  {
    const lot = town.lots.cinema, K = tools(kit, 74), X = fixtures(kit, K), at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face)), R = at(0, 0), W = lot.W, D = lot.D, s = lot.side;
    // the marquee: a canopy over the pavement, bulbs all round and under it, letters on three sides
    const v0 = lot.y0 + 3.5, v1 = lot.y1 - 3.5, out = 7.2, h0 = FL + 11.0, h1 = h0 + 2.9, NAVY = 'c#16212d/0.5', GOLD = 'c#c9a45c/0.4/1';
    const B2 = (mat, u0, u1, va, vb, ha, hb) => Ks.box(mat, Math.min(s * u0, s * u1), Math.max(s * u0, s * u1), ha, hb, -Math.max(va, vb), -Math.min(va, vb));
    B2(NAVY, FRONT - out, FRONT - 0.1, v0, v1, h0, h1); B2(GOLD, FRONT - out - 0.12, FRONT - 0.1, v0 - 0.12, v1 + 0.12, h1, h1 + 0.2); B2(GOLD, FRONT - out - 0.12, FRONT - 0.1, v0 - 0.12, v1 + 0.12, h0 - 0.2, h0);
    for (const v of [v0 + 1, v1 - 1]) Ks.tube('c#1d1b18/0.5', [s * (FRONT - 0.1), h1 + 3.4, -v], [s * (FRONT - out + 0.6), h1 + 0.2, -v], 0.05, 5);
    const bulbs = [];
    for (let v = v0 + 0.5; v < v1; v += 1.15) { bulbs.push([s * (FRONT - out - 0.14), h1 - 0.12, -v], [s * (FRONT - out - 0.14), h0 + 0.12, -v]); for (const u of [FRONT - out + 1.3, FRONT - out + 3.6, FRONT - 1.4]) bulbs.push([s * u, h0 - 0.26, -v]); }
    for (let u = FRONT - out + 0.6; u < FRONT - 0.3; u += 1.15) for (const v of [v0 - 0.14, v1 + 0.14]) bulbs.push([s * u, h1 - 0.12, -v], [s * u, h0 + 0.12, -v]);
    Ks.marquee = bulbs; bulbs.forEach((p, i) => { if (i % 3 === 0) Ks.glowDots.push([p[0], p[1], p[2], 0.9]); });
    const LETTERS = (lines, sub) => (g, w, h) => { fill(g, w, h, '#f4eedc'); for (let i = 1; i < 4; i++) rect(g, 0, h * i / 4 - 1, w, 2, 'rgba(0,0,0,.12)'); lines.forEach((t, i) => T(g, t, w / 2, h * (0.2 + i * 0.25) + 2, h * 0.2, '#16181c', { f: F.bebas, ls: h * 0.02, max: w * 0.94 })); if (sub) T(g, sub, w / 2, h * 0.9, h * 0.13, '#a8361f', { f: F.bebas, ls: 2, max: w * 0.94 }); };
    kit.sign(kit.fr(s * (FRONT - out - 0.03), (v0 + v1) / 2, 0, s > 0 ? 1 : 3), 0, 0, (h0 + h1) / 2, v1 - v0 - 1.6, h1 - h0 - 0.6, LETTERS(['TONIGHT & EVERY NIGHT', 'THE LONGEST SUNSET', 'DIR. THE SUN  ·  4 HRS  ·  NO INTERVAL'], 'ALSO SHOWING: ROBOTS IN LOVE (A DOCUMENTARY)'), { cw: 920, ch: 220, glow: 0.75 });
    for (const [v, q] of [[v0 - 0.03, 2], [v1 + 0.03, 0]]) kit.sign(kit.fr(s * (FRONT - out / 2 - 0.1), v, 0, q), 0, 0, (h0 + h1) / 2, out - 1.4, h1 - h0 - 0.6, LETTERS(['NOW', 'SHOWING', 'ROUND THE BACK']), { cw: 300, ch: 220, glow: 0.75 });
    Ks.lamp(s * (FRONT - out / 2), h0 - 0.8, -(v0 + v1) / 2, 1.3);
    // the lobby through the glass: a ticket desk, velvet rope, poster cases
    const b = at(W / 2, D - 0.02, 0, 'street');
    const POSTERS = [
      (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#26314a'); gr.addColorStop(0.6, '#c9705a'); gr.addColorStop(1, '#f0b060'); g.fillStyle = gr; g.fillRect(0, 0, w, h); disc(g, w / 2, h * 0.62, w * 0.24, '#fbe6a0'); rect(g, 0, h * 0.62, w, h * 0.38, '#1c1830'); T(g, 'THE', w / 2, h * 0.1, h * 0.06, '#fbf0d0', { f: F.limelight }); T(g, 'LONGEST', w / 2, h * 0.2, h * 0.1, '#fbf0d0', { f: F.limelight, max: w * 0.9 }); T(g, 'SUNSET', w / 2, h * 0.31, h * 0.1, '#fbf0d0', { f: F.limelight, max: w * 0.9 }); T(g, '"I sat through all of it" — Otis', w / 2, h * 0.76, h * 0.036, '#fbe6a0', { f: F.fraunces, it: 1, w: 600, max: w * 0.9 }); T(g, 'a picture by THE SUN', w / 2, h * 0.9, h * 0.045, '#fbe6a0', { f: F.bebas, ls: 2 }); },
      (g, w, h) => { fill(g, w, h, '#c8402f'); grain(g, w, h, 0.08); for (const [x, c] of [[0.36, '#f3e6c8'], [0.64, '#26314a']]) { g.fillStyle = c; g.beginPath(); g.ellipse(w * x, h * 0.48, w * 0.18, h * 0.16, 0, 0, TAU); g.fill(); rect(g, w * x - 4, h * 0.26, 8, h * 0.07, c); disc(g, w * x, h * 0.25, 9, c); } g.fillStyle = '#f6c0c0'; g.beginPath(); g.moveTo(w / 2, h * 0.34); g.bezierCurveTo(w * 0.42, h * 0.26, w * 0.44, h * 0.2, w / 2, h * 0.26); g.bezierCurveTo(w * 0.56, h * 0.2, w * 0.58, h * 0.26, w / 2, h * 0.34); g.fill();
        T(g, 'ROBOTS', w / 2, h * 0.76, h * 0.11, '#f3e6c8', { f: F.archivo, max: w * 0.9 }); T(g, 'in love', w / 2, h * 0.87, h * 0.1, '#f3e6c8', { f: F.pacifico }); T(g, 'a documentary', w / 2, h * 0.955, h * 0.04, '#26314a', { f: F.bebas, ls: 3 }); },
      (g, w, h) => { fill(g, w, h, '#efe6d2'); grain(g, w, h, 0.06); T(g, 'COMING', w / 2, h * 0.12, h * 0.08, '#16212d', { f: F.bebas, ls: 4 }); T(g, 'SOON-ISH', w / 2, h * 0.21, h * 0.08, '#16212d', { f: F.bebas, ls: 4 }); ICON.fish(g, w / 2, h * 0.46, w * 0.7, '#3c8fa0'); T(g, 'The Sardine', w / 2, h * 0.7, h * 0.09, '#a8361f', { f: F.playfair, w: 700, it: 1, max: w * 0.9 }); T(g, 'Who Knew Too Much', w / 2, h * 0.8, h * 0.07, '#a8361f', { f: F.playfair, w: 700, it: 1, max: w * 0.9 }); T(g, 'a thriller, in oil', w / 2, h * 0.92, h * 0.05, '#16212d', { f: F.fraunces, it: 1, w: 600 }); },
    ];
    POSTERS.forEach((art, i) => { const x = [8.6, -8.6, -5.0][i]; b.box('c#c9a45c/0.4/1', x - 1.45, x + 1.45, 0.02, 0.1, 3.3, 7.9); kit.sign(b, x, 0.11, 5.6, 2.7, 4.4, art, { cw: 300, ch: 490, glow: 0.55 }); });
    // the ticket desk, with a brass grille and a sign
    X.counter(b, -2.6, 2.6, 0.5, 2.3, 3.6, { front: 'painted_wood#7a2f2f', top: 'marble' });
    b.box('c#c9a45c/0.4/1', -2.6, 2.6, 1.3, 1.36, 3.6, 3.66); for (let x = -2.5; x <= 2.5; x += 0.5) b.cyl('c#c9a45c/0.4/1', x, 1.33, 3.6, 6.2, 0.025, 0.025, 5); b.box('c#c9a45c/0.4/1', -2.6, 2.6, 1.3, 1.36, 6.2, 6.3);
    kit.sign(b, 0, 2.31, 2.2, 3.6, 1.5, (g, w, h) => { fill(g, w, h, '#16212d'); g.strokeStyle = '#c9a45c'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12); T(g, 'TICKETS', w / 2, h * 0.3, h * 0.3, '#f0d48a', { f: F.limelight }); T(g, 'free. sit anywhere. shh.', w / 2, h * 0.7, h * 0.18, '#f0d48a', { f: F.fraunces, it: 1, w: 600 }); }, { cw: 360, ch: 150 });
    for (const x of [-5.6, 5.6]) { b.cyl('c#c9a45c/0.4/1', x, 3.4, 0, 0.1, 0.4, 0.45, 12); b.cyl('c#c9a45c/0.4/1', x, 3.4, 0.1, 3.2, 0.06, 0.06, 8); K.ball(b, 'c#c9a45c/0.4/1', x, 3.4, 3.2, 0.12, 8); }
    K.tube(b, 'velvet#7a2f2f', [[-5.6, 3.4, 3.1], [-2.8, 3.4, 2.5], [0, 3.4, 2.3], [2.8, 3.4, 2.5], [5.6, 3.4, 3.1]], 0.07, 6);
    doorNote(kit, lot, (g, w, h) => { paper(g, w, h, '#f4eedc'); g.strokeStyle = '#16212d'; g.lineWidth = 4; g.strokeRect(8, 8, w - 16, h - 16); T(g, 'THE PICTURE', w / 2, h * 0.16, h * 0.1, '#16212d', { f: F.limelight, max: w * 0.84 }); T(g, 'IS OUTSIDE', w / 2, h * 0.29, h * 0.1, '#16212d', { f: F.limelight, max: w * 0.84 }); para(g, 'This is only the front of the Lantern. The screen, the seats and the popcorn are in the garden behind: go down Pickle Alley, just here, and round.', w * 0.12, h * 0.42, h * 0.058, '#2a1c13', w * 0.76, { f: F.fraunces, it: 1, w: 600 }); ICON.hand(g, w / 2, h * 0.88, h * 0.13, '#a8361f'); }, 1.6, 2.0);
    for (const a of [5, W / 2, W - 5]) X.pendant(R, a, 3.2, { kind: 'globe', drop: 2.6, power: 0.7, r: 0.4 });
  }
}

// The marquee's bulbs chase; called once the scene exists (street.js)
export function windowsLife(ctx, Ks) {
  if (!Ks.marquee?.length) return;
  const T3 = ctx.THREE, list = Ks.marquee, geo = new T3.SphereGeometry(0.13, 6, 5), mat = new T3.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const inst = new T3.InstancedMesh(geo, mat, list.length), m = new T3.Matrix4(), c = new T3.Color();
  list.forEach((p, i) => { inst.setMatrixAt(i, m.makeTranslation(p[0], p[1], p[2])); inst.setColorAt(i, c.setRGB(1, 0.8, 0.5)); });
  inst.name = 'marquee'; inst.frustumCulled = false; ctx.scene.add(inst);
  let acc = 0;
  ctx.animated.push((t, dt) => { if ((acc += dt) < 0.12) return; acc = 0; const k = 0.55 + 0.45 * (1 - T3.MathUtils.smoothstep(ctx.day.light, 0.42, 0.97)), ph = Math.floor(t * 4);
    for (let i = 0; i < list.length; i++) { const on = (i + ph) % 3 !== 0; inst.setColorAt(i, c.setRGB(1, 0.8, 0.5).multiplyScalar((on ? 1.6 : 0.5) * k)); } inst.instanceColor.needsUpdate = true; });
}
