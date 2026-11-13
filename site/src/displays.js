// The one front that is shut: you cannot go in, but their windows are lit and
// dressed, and each has left a note on the door.
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
