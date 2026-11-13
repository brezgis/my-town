// Things hidden in the grass. Nobody is told about these: they are for people who leave the
// pavement. Behind the north row, behind the south row, the lawns by the Landing and the meadow
// past the Overlook. Most pay off something read elsewhere (the notice board in the Yard, the bike
// shop's tool board, Olive's sardines, the honesty box in Pickle Alley).
//
// Everything is built from the street kit's primitives in plain colours (one batched mesh); the
// lettering goes through the shared sign sheets. What answers back is set up in eggsLife().
//
// World feet: x north(+)/south(-), y up, z east(+)/west(-). A sign's yaw is the way it faces:
// 0 east (+z), PI west, PI/2 north (+x), -PI/2 south (-x).

import * as THREE from 'three';
import { PAINT } from './street/tools.js';
import { T, F, fill, grain, paper, slate, chalk, disc, rect, line, para, ICON, TAU } from './draw.js';

const WOOD = 'c#8a6a48/0.85', WOODD = 'c#5a4432/0.85', WHITE = 'c#f1efe8/0.6', CREAM = 'c#ece4d0/0.75', IRON = PAINT.iron, BRASS = PAINT.brass, STEEL = 'c#b9bcc0/0.3/1';
const RED = 'c#b8452e/0.7', GREEN = 'c#2f4a40/0.6', SOIL = 'c#4a3626/1', ROPE = PAINT.rope, STONEP = 'c#8f887c/0.95';
const G0 = 0.03;                                                  // the lawn's own height
const N = Math.PI / 2, S = -Math.PI / 2, EAST = 0, WEST = Math.PI;

// The island's edge (as street.js lays it out; repeated here so this file stands alone)
const OUT = (() => { const o = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * TAU, c = Math.cos(a), s = Math.sin(a); let r = (128 * 240) / Math.hypot(240 * c, 128 * s); r *= 1 + 0.05 * Math.sin(a * 3 + 0.8) + 0.035 * Math.sin(a * 5 + 2.1); if (c < -0.5) r *= 1 + 0.12 * (-c - 0.5); o.push(Math.round(r)); } return o; })();
const edgeAt = a => { const f = ((((a / TAU) % 1) + 1) % 1) * 48, i = Math.floor(f), t = f - i; return OUT[i % 48] * (1 - t) + OUT[(i + 1) % 48] * t; };
const fracAt = (x, z) => Math.hypot(x, z + 62) / edgeAt(Math.atan2(z + 62, x));
// x at which (x, z) is `frac` of the way out to the rim, on the north (side 1) or south (-1) side
const rimX = (z, side, frac) => { let lo = 0, hi = 170; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (fracAt(side * m, z) < frac) lo = m; else hi = m; } return side * lo; };

const WORDS = ['STAY', 'AS', 'LONG', 'AS', 'THE', 'LIGHT', 'DOES'];

export function hideEggs(K, town) {
  const E = K.eggs = { things: [], stones: [] };
  const r = K.r;
  const tree = (x, z) => K.trees.reduce((b, t) => (Math.hypot(t.x - x, t.z - z) < Math.hypot(b.x - x, b.z - z) ? t : b));
  // any geometry, turned (yaw, then tilt, then roll) and set down
  const put = (mat, g, x, y, z, ry = 0, rx = 0, rz = 0) => { if (ry || rx || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ'))); g.translate(x, y, z); K.put(mat, g); };
  // a drawn face in the world: centre (x, y, z), facing yaw; o: { cw, ch, flat, tilt, round }
  const face = (x, y, z, yaw, w, h, draw, o = {}) => K.extras.push({ draw, cw: o.cw ?? Math.round(w * 190), ch: o.ch ?? Math.round(h * 190), x, y, z, rotY: yaw, w, h, flat: !!o.flat, tilt: o.tilt, round: o.round, rough: o.rough });
  // a little card on a stake, leaning back so that it reads from standing height
  const card = (x, z, yaw, w, h, draw, o = {}) => {
    const y = o.y ?? 1.15, tilt = o.tilt ?? 0.42, sx = Math.sin(yaw), cz = Math.cos(yaw);
    put(o.board ?? WOOD, new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.05).translate(0, 0, -0.035), x, y, z, yaw, -tilt);
    if (o.stake !== false) K.tube(WOODD, [x - sx * 0.12, o.y0 ?? 0, z - cz * 0.12], [x - sx * 0.06, y, z - cz * 0.06], 0.04, 5);
    face(x, y, z, yaw, w, h, draw, { ...o, tilt });
  };
  // something to press E on that says a line (the next one each time)
  const say = (x, y, z, label, lines, o = {}) => E.things.push({ x, y, z, label, lines, ...o });
  // ticket lettering: a title, a few typed lines, a handwritten afterthought
  const ticket = (title, body, foot, o = {}) => (g, w, h) => {
    paper(g, w, h, o.bg ?? '#efe7d2', o.seed ?? 3);
    if (o.edge) { g.strokeStyle = o.edge; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, h - 10); }
    if (title) T(g, title, w / 2, h * 0.15, h * (o.ts ?? 0.13), o.tc ?? '#24382f', { f: o.tf ?? F.bebas, ls: o.ls ?? 1.5, max: w * 0.88, it: o.tit, w: o.tw });
    para(g, body, w * 0.08, h * (title ? 0.29 : 0.1), h * (o.bs ?? 0.082), o.ink ?? '#2a1c13', w * 0.84, { f: o.bf ?? F.elite, w: o.bw });
    if (foot) T(g, foot, w / 2, h * 0.9, h * (o.fs ?? 0.095), o.fc ?? '#a8361f', { f: F.caveat, w: 600, max: w * 0.9 });
  };
  const brassPlate = (lines, o = {}) => (g, w, h) => {
    fill(g, w, h, '#5a4a2c'); grain(g, w, h, 0.1); g.strokeStyle = '#d9b96a'; g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8);
    lines.forEach(([s, px, f], i) => T(g, s, w / 2, h * (o.y0 ?? 0.24) + i * h * (o.step ?? 0.2), h * px, '#e9cf8a', { f: f ?? F.fraunces, it: f ? 0 : 1, w: 600, ls: f ? 2 : undefined, max: w * 0.9 }));
  };
  const mushroom = (x, z, s, lean = 0) => {
    K.tube('c#e6d8b8/0.9', [x, G0, z], [x + lean * s, 0.42 * s, z + lean * 0.5 * s], 0.045 * s, 6);
    K.lathe('c#c9a273/0.9', x + lean * s, 0.36 * s, z + lean * 0.5 * s, [[0.04, 0.02], [0.3, 0], [0.3, 0.04], [0.2, 0.1], [0.09, 0.13], [0.05, 0.17], [0.01, 0.18]], 9, s);
  };

  // ======================================================================================
  // BEHIND THE NORTH ROW
  // ======================================================================================

  // ---- The weather station, by the Landing: unstaffed, and honest ----------------------------
  {
    const x = 52, z = 50;
    K.box(WHITE, x - 0.14, x + 0.14, 0, 4.45, z - 0.14, z + 0.14);
    K.box(WHITE, x - 0.78, x + 0.78, 4.45, 4.55, z - 0.78, z + 0.78);
    K.box('c#dcd7c8/0.7', x - 0.6, x + 0.6, 4.55, 5.95, z - 0.6, z + 0.6);
    for (let i = 0; i < 5; i++) K.box(WHITE, x - 0.7, x + 0.7, 4.68 + i * 0.26, 4.75 + i * 0.26, z - 0.7, z + 0.7);      // louvres
    K.box(WHITE, x - 0.9, x + 0.9, 5.98, 6.08, z - 0.9, z + 0.9, { rot: [0, 0, 0.1] });
    K.cyl(IRON, x, 6.0, 8.3, z, 0.04, 0.04, 6);
    for (let i = 0; i < 3; i++) { const a = 0.4 + (i / 3) * TAU, ex = x + Math.cos(a) * 0.75, ez = z + Math.sin(a) * 0.75; K.tube(IRON, [x, 7.9, z], [ex, 7.9, ez], 0.022, 4); K.sphere('c#b8452e/0.6', ex, 7.9, ez, 0.15, 1, 1); }
    K.tube(IRON, [x - 0.2, 8.3, z - 0.75], [x + 0.2, 8.3, z + 0.75], 0.025, 4); put(RED, new THREE.ConeGeometry(0.13, 0.36, 4).rotateX(-Math.PI / 2), x - 0.24, 8.3, z - 0.9, -0.26); K.box(RED, x + 0.17, x + 0.2, 8.14, 8.46, z + 0.5, z + 0.86, { rot: [0, -0.26, 0] });
    K.cyl(STEEL, x + 0.32, 3.0, 3.9, z + 0.3, 0.15, 0.17, 10);                                                             // the rain gauge (dry)
    K.box(WOOD, x - 0.2, x - 0.14, 1.7, 4.2, z - 1.1, z + 1.1);
    face(x - 0.215, 2.95, z, S, 2.1, 2.4, (g, w, h) => {
      paper(g, w, h, '#efe7d2'); rect(g, 0, 0, w, h * 0.15, '#34405a'); T(g, 'WEATHER', w / 2, h * 0.08, h * 0.1, '#efe7d2', { f: F.bebas, ls: 6 });
      T(g, 'VESPER STREET STATION  ·  UNSTAFFED', w / 2, h * 0.2, h * 0.04, '#34405a', { f: F.bebas, ls: 1.5, max: w * 0.9 });
      [['clouds', 'below us'], ['wind', 'from elsewhere'], ['rain', 'not at this height'], ['sun', 'about to set'], ['visibility', 'all of it'], ['outlook', 'golden']].forEach(([a, b], i) => {
        const y = h * (0.3 + i * 0.092); T(g, a, w * 0.09, y, h * 0.05, '#2a1c13', { f: F.elite, a: 'left' }); T(g, b, w * 0.91, y, h * 0.05, '#2a1c13', { f: F.elite, a: 'right' }); line(g, [[w * 0.09, y + h * 0.038], [w * 0.91, y + h * 0.038]], 'rgba(42,28,19,.25)', 1);
      });
      T(g, 'readings taken honestly,', w / 2, h * 0.87, h * 0.052, '#a8361f', { f: F.caveat, w: 600 }); T(g, 'whenever anyone remembers', w / 2, h * 0.93, h * 0.052, '#a8361f', { f: F.caveat, w: 600 });
    }, { cw: 300, ch: 344 });
    // the barometer, on the screen's door
    put(BRASS, new THREE.CylinderGeometry(0.34, 0.34, 0.05, 20).rotateZ(Math.PI / 2), x - 0.63, 5.25, z);
    face(x - 0.662, 5.25, z, S, 0.6, 0.6, (g, w, h) => {
      disc(g, w / 2, h / 2, w * 0.5, '#f1ead6'); disc(g, w / 2, h / 2, w * 0.46, null, '#2a1c13', 2);
      ['STORMY', 'RAIN', 'CHANGE', 'FAIR', 'GOLDEN'].forEach((s, i) => { const a = Math.PI * (1.08 + i * 0.21); T(g, s, w / 2 + Math.cos(a) * w * 0.31, h / 2 + Math.sin(a) * w * 0.31, w * 0.07, i === 4 ? '#a8361f' : '#2a1c13', { f: F.bebas, rot: a + Math.PI / 2 }); });
      const a = Math.PI * 1.92; line(g, [[w / 2, h / 2], [w / 2 + Math.cos(a) * w * 0.36, h / 2 + Math.sin(a) * w * 0.36]], '#2a1c13', 3); disc(g, w / 2, h / 2, w * 0.04, '#b08d4a');
      T(g, 'always', w / 2, h * 0.7, w * 0.09, '#2a1c13', { f: F.caveat, w: 600 });
    }, { cw: 128, ch: 128, round: true });
    K.collide(x - 0.8, x + 0.8, z - 0.8, z + 0.8, 6);
    say(x - 0.7, 5.25, z, 'tap the barometer', ['The needle trembles, then settles on GOLDEN. It is painted on GOLDEN.', 'Pressure: none at all. Nobody up here is in a hurry.', 'You tap again. Forecast: nearly evening, with a strong chance of nearly evening.'], { reach: 7, snd: 'tap' });
  }

  // ---- A chalk outline, where a cloud bumped the island ------------------------------------------
  {
    const cz = 40, cx = rimX(cz, 1, 0.92), k = 1.3, CH = 'c#f1efe6/0.9';
    const C = [[-2.6, -0.3, 1.6], [-0.6, 0.9, 2.0], [1.8, 0.5, 1.7], [3.2, -0.5, 1.3]];
    const seg = (a, b) => K.tube(CH, [cx + a[1] * k, 0.075, cz + a[0] * k], [cx + b[1] * k, 0.075, cz + b[0] * k], 0.055, 4);
    C.forEach(([a, b, rad], j) => { let prev = null; for (let i = 0; i <= 32; i++) { const t = (i / 32) * TAU, u = a + Math.cos(t) * rad, v = b + Math.sin(t) * rad, ok = v > -1.6 && !C.some((c, m) => m !== j && Math.hypot(u - c[0], v - c[1]) < c[2] - 0.02); if (ok && prev) seg(prev, [u, v]); prev = ok ? [u, v] : null; } });
    seg([-3.53, -1.6], [3.89, -1.6]);
    K.sphere('c#f4f2ec/1', cx + 0.6, 0.2, cz + 1.2, 0.34, 0.6, 1, 1.3, 1);                                                    // a bit it left behind
    put('c#e9b44c/0.8', new THREE.CylinderGeometry(0.3, 0.3, 0.5, 3).rotateX(Math.PI / 2).rotateZ(Math.PI / 2), cx - 3.4, 0.2, cz - 2.4, 0.5);      // evidence marker
    face(cx - 3.56, 0.24, cz - 2.31, S + 0.5, 0.26, 0.24, (g, w, h) => { fill(g, w, h, '#e9b44c'); T(g, '1', w / 2, h * 0.55, h * 0.8, '#17140f', { f: F.archivo }); }, { cw: 40, ch: 40, tilt: 0.52 });
    card(cx - 4.2, cz + 0.4, S, 1.5, 1.05, ticket('INCIDENT REPORT', 'At about dusk one (1) cloud, cumulus, medium, bumped the island at this spot. The cloud was unhurt. The island said sorry.', 'please do not feed the clouds', { tc: '#a8361f', bs: 0.074 }), { cw: 300, ch: 210 });
    say(cx, 0.3, cz, 'examine the scene', ['Soft, damp, smells faintly of rain that has not happened. Verdict: cloud.', 'No skid marks. It was not going fast. Clouds never are.'], { reach: 7.5, size: 2.5 });
  }

  // ---- A very small front door, round the far side of the oak --------------------------------------
  {
    const t = tree(92, -30), R = 2.1 * (t.height / 46), fx = t.x + R * 1.3, z = t.z;
    K.box('c#3d2f24/1', t.x + R * 0.7, fx - 0.03, 0, 2.05, z - 0.72, z + 0.72); put('c#3d2f24/1', new THREE.CylinderGeometry(0.72, 0.72, fx - 0.03 - (t.x + R * 0.7), 14).rotateZ(Math.PI / 2), (t.x + R * 0.7 + fx - 0.03) / 2, 2.05, z);      // the porch, grown out of the bark
    K.box(RED, fx - 0.1, fx, 0.06, 2.05, z - 0.56, z + 0.56); put(RED, new THREE.CylinderGeometry(0.56, 0.56, 0.1, 14).rotateZ(Math.PI / 2), fx - 0.05, 2.05, z);
    K.sphere(BRASS, fx + 0.03, 1.2, z - 0.38, 0.07, 1, 1); K.box(BRASS, fx, fx + 0.02, 0.78, 0.9, z - 0.24, z + 0.24); K.box('c#17140f/0.6', fx + 0.02, fx + 0.025, 0.82, 0.86, z - 0.2, z + 0.2);
    put(BRASS, new THREE.TorusGeometry(0.17, 0.03, 6, 16).rotateY(Math.PI / 2), fx + 0.01, 2.1, z);
    K.B.mesh('e#ffe2b4/1.7', new THREE.CylinderGeometry(0.15, 0.15, 0.03, 14).rotateZ(Math.PI / 2).translate(fx + 0.005, 2.1, z)); K.glowDots.push([fx + 0.1, 2.1, z, 1.1]);      // somebody is in
    K.box('c#a8956c/1', fx + 0.05, fx + 0.75, G0, 0.09, z - 0.5, z + 0.5);                                                    // the mat
    face(fx + 0.4, 0.095, z, N, 0.9, 0.6, (g, w, h) => { fill(g, w, h, '#a8956c'); grain(g, w, h, 0.2, 7); T(g, 'WIPE YOUR', w / 2, h * 0.34, h * 0.24, '#3a2c1c', { f: F.bebas, ls: 1 }); T(g, 'FEET (ALL OF THEM)', w / 2, h * 0.68, h * 0.2, '#3a2c1c', { f: F.bebas, ls: 1, max: w * 0.9 }); }, { cw: 130, ch: 86, flat: true });
    face(fx + 0.012, 1.5, z + 0.08, N, 0.62, 0.42, (g, w, h) => { paper(g, w, h, '#f6e9a8'); T(g, 'GONE TO CHOIR', w / 2, h * 0.24, h * 0.2, '#17140f', { f: F.caveat, w: 600 }); T(g, 'back after Tuesday', w / 2, h * 0.52, h * 0.17, '#2a1c13', { f: F.caveat, w: 600 }); T(g, 'parcels: under the mat', w / 2, h * 0.8, h * 0.14, '#a8361f', { f: F.caveat, w: 600 }); disc(g, w / 2, h * 0.07, 3, '#c8402f'); }, { cw: 170, ch: 116 });
    for (const [dx, dz, s] of [[1.6, 0.3, 0.42], [2.6, -0.5, 0.36], [3.3, -1.8, 0.4], [3.4, -3.3, 0.34], [2.7, -4.6, 0.38]]) K.cyl(STONEP, fx + dx, G0, 0.1, z + dz, s, s * 0.9, 7);      // stepping stones, leading round
    mushroom(fx + 0.5, z + 1.1, 0.8, 0.1); mushroom(fx + 0.2, z + 1.4, 0.55, -0.1);
    K.F.add('fern', fx + 0.3, z - 1.5, 0.5); K.F.add('fern', fx + 0.1, z + 1.9, 0.45);
    E.door = { x: fx + 0.5, y: 5.6, z };
    say(fx, 1.2, z, 'knock on the little door', ['Knock knock. A pause. A very small voice: "We are at choir."', 'Knock. "STILL at choir." (The voice is coming from inside.)', 'Knock. Silence, of the kind that is holding its breath.', 'Knock. The letterbox opens. An acorn is pushed out. That is all you are getting.'], { reach: 7, snd: 'knock' });
  }

  // ---- Vesper Links: one hole -----------------------------------------------------------------------
  {
    const x = 100, z = -58;
    put('c#2f6b45/1', new THREE.CylinderGeometry(1, 1, 0.05, 30).scale(2.3, 1, 4.6), x, 0.06, z);
    put('c#3f7d52/1', new THREE.CylinderGeometry(1, 1, 0.03, 30).scale(2.6, 1, 4.9), x, 0.045, z);
    const hx = x + 0.3, hz = z - 2.9;
    K.cyl('c#0b0a09/1', hx, 0.08, 0.092, hz, 0.19, 0.19, 12);
    K.cyl(CREAM, hx, 0.05, 3.3, hz, 0.025, 0.025, 5); K.box(RED, hx - 0.01, hx + 0.01, 2.8, 3.25, hz, hz + 0.66);
    for (const s of [1, -1]) face(hx + s * 0.015, 3.03, hz + 0.3, s > 0 ? N : S, 0.36, 0.36, (g, w, h) => { fill(g, w, h, '#b8452e'); T(g, '1', w / 2, h * 0.54, h * 0.8, '#f1ead6', { f: F.abril }); }, { cw: 48, ch: 48 });
    // a putter, left leaning on the sign
    K.tube(STEEL, [x - 2.9, 0.12, z + 4.3], [x - 3.1, 2.9, z + 4.72], 0.025, 5); K.box('c#17140f/0.6', x - 3.0, x - 2.72, 0.05, 0.2, z + 4.22, z + 4.36); K.tube('c#17140f/0.9', [x - 3.07, 2.45, z + 4.65], [x - 3.105, 2.95, z + 4.728], 0.04, 5);
    card(x - 3.3, z + 4.9, S + 0.5, 1.5, 1.1, (g, w, h) => {
      paper(g, w, h, '#e6ecd9'); g.strokeStyle = '#2f6b45'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
      T(g, 'Vesper Links', w / 2, h * 0.2, h * 0.2, '#2f6b45', { f: F.playfair, w: 700, it: 1 });
      T(g, 'HOLE 1 OF 1   ·   PAR: WHATEVER YOU GOT', w / 2, h * 0.4, h * 0.075, '#2a1c13', { f: F.bebas, ls: 1.5, max: w * 0.86 });
      para(g, 'Course record: one. Held jointly by everybody who has ever played.', w * 0.1, h * 0.52, h * 0.078, '#2a1c13', w * 0.8, { f: F.elite });
      T(g, 'replace your divots and your expectations', w / 2, h * 0.9, h * 0.08, '#a8361f', { f: F.caveat, w: 600, max: w * 0.88 });
    }, { y: 2.2, tilt: 0.25, cw: 290, ch: 212 });
    E.golf = { x, z: z + 3.1, hx, hz };
  }

  // ---- A message in a bottle, wedged at the rim -------------------------------------------------------
  {
    const z = -62, x = rimX(z, 1, 0.972), y = 0.2;
    K.rock(PAINT.stone, x + 0.5, 0.2, z + 0.9, 0.7, 0.5, 0.6); K.rock(PAINT.stoneDark, x + 0.3, 0.15, z - 0.9, 0.55, 0.4, 0.5);
    put('c#5f8f6a/0.25', new THREE.CylinderGeometry(0.17, 0.17, 0.62, 12).rotateZ(Math.PI / 2), x, y, z, 0.3, 0, 0.12);
    put('c#5f8f6a/0.25', new THREE.CylinderGeometry(0.07, 0.17, 0.2, 12).rotateZ(Math.PI / 2), x - 0.39, y - 0.047, z + 0.12, 0.3, 0, 0.12);
    put('c#5f8f6a/0.25', new THREE.CylinderGeometry(0.065, 0.065, 0.22, 10).rotateZ(Math.PI / 2), x - 0.58, y - 0.07, z + 0.18, 0.3, 0, 0.12);
    put('c#f1ead6/0.9', new THREE.CylinderGeometry(0.045, 0.045, 0.5, 8).rotateZ(Math.PI / 2), x - 0.86, y - 0.1, z + 0.265, 0.3, 0, 0.12);      // the letter, half out
    put(RED, new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8).rotateZ(Math.PI / 2), x - 0.9, y - 0.105, z + 0.277, 0.3, 0, 0.12);
    K.glowDots.push([x, y + 0.2, z, 0.7]);
    say(x - 0.5, 0.3, z + 0.1, 'read the message in the bottle', ['"To the ground: hello from up here. It is nearly evening. Please send sardines. Yours, V. Street."', '"P.S. If found, please throw back UP."', 'On the back, in pencil: "Reply received. They say it is raining. We said: where?"'], { reach: 8, size: 1.6 });
  }

  // ---- The bench nobody knows about: at the north rim, facing the backs (and the picture) -----------------
  {
    const z = -96, x = rimX(z, 1, 0.93);
    K.bench(x, z, S, { w: 5, mat: 'c#7d8a72/0.8' }); K.seat(x, 1.4, z, N, 'sit on the bench nobody knows about');
    face(x + 0.835, 2.86, z, S, 2.0, 0.3, brassPlate([['THE BENCH NOBODY KNOWS ABOUT', 0.3, F.bebas], ['please go on not knowing', 0.3]], { y0: 0.3, step: 0.42 }), { cw: 300, ch: 46, tilt: 0.14 });
    K.sphere('c#b8452e/0.9', x - 0.3, 1.52, z - 1.8, 0.5, 0.26, 1, 1, 1);                                                           // a cushion, left for you
    K.cyl('c#2f4a40/0.5', x - 0.2, 1.4, 2.15, z + 2.0, 0.13, 0.13, 10); K.cyl(STEEL, x - 0.2, 2.15, 2.3, z + 2.0, 0.1, 0.12, 10);      // and a flask
    for (let i = 0; i < 5; i++) K.F.add(K.pick(['cosmos', 'catmint', 'grass']), x + 2.2 + r() * 2, z - 4 + r() * 8, 0.7 + r() * 0.3);
  }

  // ---- One pickle, on a stone. Somebody paid. ------------------------------------------------------------
  {
    const x = 92, z = -120;
    K.rock(PAINT.stone, x, 0.36, z, 1.0, 0.75, 0.8, 0.3);
    K.cyl(WHITE, x - 0.05, 0.98, 1.01, z, 0.3, 0.24, 14); K.sphere('c#5d7a35/0.5', x - 0.05, 1.07, z, 0.075, 1, 1, 1, 3.4);
    K.cyl(BRASS, x - 0.12, 0.985, 1.0, z - 0.5, 0.07, 0.07, 10); K.cyl(BRASS, x + 0.02, 0.985, 1.0, z - 0.62, 0.055, 0.055, 10);
    card(x - 0.9, z + 1.2, S, 1.2, 0.85, ticket('PICKLE (1)', 'The honesty box is back in the alley. This pickle has been paid for. Twice, by the look of it.', 'be honest out here too', { tf: F.abril, tc: '#3f5f43', ts: 0.15, bs: 0.086 }), { cw: 240, ch: 170 });
    say(x - 0.05, 1.05, z, 'take the pickle', ['You reach for it. You think about the honesty box. You leave it, and a nice thought.', 'Still not yours. It is somebody\'s paid-for pickle, enjoying the view.'], { reach: 6.5 });
  }

  // ---- A sardine tin, planted up ---------------------------------------------------------------------
  {
    const x = 88, z = -138;
    K.cyl('c#4a3a2c/1', x, 0, 1.25, z, 1.05, 0.92, 11); K.cyl('c#b89a6c/0.95', x, 1.25, 1.27, z, 0.9, 0.9, 11); K.cyl('c#a8865a/0.95', x, 1.27, 1.275, z, 0.5, 0.5, 11);      // a stump
    K.box(STEEL, x - 0.3, x + 0.3, 1.28, 1.46, z - 0.45, z + 0.45); K.box(SOIL, x - 0.27, x + 0.27, 1.44, 1.47, z - 0.42, z + 0.42);
    put(STEEL, new THREE.CylinderGeometry(0.07, 0.07, 0.58, 8).rotateZ(Math.PI / 2), x, 1.53, z + 0.44); K.tube(STEEL, [x + 0.29, 1.53, z + 0.44], [x + 0.5, 1.53, z + 0.44], 0.015, 4); put(STEEL, new THREE.TorusGeometry(0.06, 0.015, 4, 10), x + 0.56, 1.53, z + 0.44);      // the lid, rolled back on its key
    K.F.add('herbs', x - 0.05, z - 0.18, 0.34, { y: 1.44 }); K.F.add('herbs', x + 0.08, z + 0.14, 0.3, { y: 1.44 }); K.F.add('strawberry', x - 0.1, z - 0.02, 0.4, { y: 1.44 });
    face(x - 0.305, 1.37, z, S, 0.86, 0.15, (g, w, h) => { fill(g, w, h, '#26364f'); T(g, 'SEREIA SONOLENTA  ·  SARDINES', w / 2, h * 0.54, h * 0.52, '#f0d48a', { f: F.bebas, ls: 1, max: w * 0.94 }); }, { cw: 200, ch: 34 });
    card(x - 1.5, z + 0.9, S, 1.05, 0.72, (g, w, h) => { paper(g, w, h, '#efe7d2'); T(g, 'thyme', w / 2, h * 0.2, h * 0.24, '#24382f', { f: F.caveat, w: 600 }); para(g, '(was: sardines. They were very good, and they would have wanted this.)', w * 0.09, h * 0.38, h * 0.105, '#2a1c13', w * 0.82, { f: F.caveat, w: 600 }); T(g, 'O.', w * 0.84, h * 0.88, h * 0.14, '#a8361f', { f: F.caveat, w: 600 }); }, { cw: 200, ch: 138 });
    mushroom(x + 0.9, z - 0.8, 0.7, 0.1);
  }

  // ---- A hammock, between the oak and a tree that is not there yet -----------------------------------------
  {
    const t = tree(96, -150), R = 2.1 * (t.height / 46), x = t.x, zA = t.z - R * 0.96, zB = t.z - 14.2, L = zA - zB, H = 5.1, SAG = 2.9;
    const yAt = u => H - SAG * 4 * u * (1 - u), zAt = u => zA - u * L, u0 = 0.2, u1 = 0.8, n = 10;
    put(ROPE, new THREE.TorusGeometry(R * 1.04, 0.05, 5, 18).rotateX(Math.PI / 2), t.x, H, t.z);
    K.cyl(WOODD, x, 0, 5.7, zB, 0.24, 0.2, 9); K.cyl(WOODD, x, 5.7, 5.78, zB, 0.26, 0.26, 9); K.collide(x - 0.3, x + 0.3, zB - 0.3, zB + 0.3, 5.7);
    for (const u of [u0, u1]) { K.tube(WOOD, [x - 1.3, yAt(u), zAt(u)], [x + 1.3, yAt(u), zAt(u)], 0.055, 6); for (const dx of [-1.2, -0.6, 0, 0.6, 1.2]) K.tube(ROPE, [x, H, u < 0.5 ? zA : zB + 0.2], [x + dx, yAt(u), zAt(u)], 0.02, 4); }
    for (let i = 0; i < n; i++) {
      const a = u0 + ((u1 - u0) * i) / n, b = u0 + ((u1 - u0) * (i + 1)) / n, dy = yAt(b) - yAt(a), dz = zAt(b) - zAt(a), len = Math.hypot(dy, dz), ang = Math.atan2(-dy, dz);
      for (const [x0, x1, col] of [[-1.25, -0.8, 'c#96492f/1'], [-0.8, -0.55, 'c#ddd6c4/1'], [-0.55, 0.55, 'c#ddd6c4/1'], [0.55, 0.8, 'c#ddd6c4/1'], [0.8, 1.25, 'c#96492f/1']])
        put(col, new THREE.BoxGeometry(x1 - x0, 0.05, len + 0.03), x + (x0 + x1) / 2, (yAt(a) + yAt(b)) / 2 - (Math.abs(x0) > 0.7 ? 0 : 0.0), (zAt(a) + zAt(b)) / 2, 0, ang);
    }
    K.sphere('c#34405a/1', x, yAt(0.3) + 0.2, zAt(0.3), 0.55, 0.36, 1, 1.5, 0.9);                                                // a pillow
    K.collide(x - 1.2, x + 1.2, zAt(u1), zAt(u0), 3.3, 1.7);
    K.seat(x, yAt(0.5) - 0.25, zAt(0.5), S, 'lie back in the hammock');
    face(x - 0.25, 4.3, zB, S, 1.0, 0.34, (g, w, h) => { paper(g, w, h, '#efe7d2'); T(g, 'TREE', w * 0.3, h * 0.52, h * 0.6, '#24382f', { f: F.bebas, ls: 2 }); T(g, '(temporary)', w * 0.7, h * 0.54, h * 0.4, '#a8361f', { f: F.caveat, w: 600 }); }, { cw: 190, ch: 64 });
    card(x - 2.6, zAt(0.5) + 0.4, S, 1.5, 1.15, (g, w, h) => {
      paper(g, w, h, '#efe7d2'); T(g, 'THE HAMMOCK', w / 2, h * 0.13, h * 0.12, '#24382f', { f: F.bebas, ls: 3 });
      [['oak end', 'a bowline'], ['post end', 'round turn & two half hitches'], ['spreaders', 'clove hitches, all ten']].forEach(([a, b], i) => { const y = h * (0.3 + i * 0.13); T(g, a, w * 0.08, y, h * 0.062, '#2a1c13', { f: F.elite, a: 'left' }); T(g, b, w * 0.92, y, h * 0.062, '#2a1c13', { f: F.elite, a: 'right', max: w * 0.56 }); line(g, [[w * 0.08, y + h * 0.05], [w * 0.92, y + h * 0.05]], 'rgba(42,28,19,.25)', 1); });
      para(g, 'Tied by Moss. Tested by Gerald, who is a monstera, so: in spirit.', w * 0.08, h * 0.66, h * 0.066, '#2a1c13', w * 0.84, { f: F.elite });
      T(g, 'getting out is your own affair', w / 2, h * 0.92, h * 0.085, '#a8361f', { f: F.caveat, w: 600 });
    }, { y: 1.5, tilt: 0.35, cw: 300, ch: 230 });
  }

  // ---- Survey stakes: Phase 2 --------------------------------------------------------------------------
  {
    const x0 = 81, x1 = 90, z0 = -197, z1 = -188, PINK = 'c#e8669a/0.8', cs = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
    cs.forEach(([x, z], i) => { K.box('c#d9c79f/1', x - 0.07, x + 0.07, 0, 2.3, z - 0.07, z + 0.07, { rot: [0.06 * (i % 2 ? 1 : -1), 0, 0.05] }); K.box(PINK, x - 0.08, x + 0.08, 1.95, 2.25, z - 0.08, z + 0.08); K.box(PINK, x + 0.08, x + 0.5, 1.7, 2.1, z - 0.01, z + 0.01, { rot: [0, 0.6 + i, 0.5] }); const [bx, bz] = cs[(i + 1) % 4]; K.tube(PINK, [x, 1.9, z], [(x + bx) / 2, 1.72, (z + bz) / 2], 0.014, 3); K.tube(PINK, [(x + bx) / 2, 1.72, (z + bz) / 2], [bx, 1.9, bz], 0.014, 3); });
    const bx = x0 - 1.6, bz = (z0 + z1) / 2;
    for (const dz of [-1.5, 1.5]) K.box('c#d9c79f/1', bx - 0.06, bx + 0.06, 0, 4.4, bz + dz - 0.08, bz + dz + 0.08);
    K.box(WHITE, bx - 0.12, bx - 0.06, 2.2, 4.4, bz - 1.75, bz + 1.75);
    face(bx - 0.13, 3.3, bz, S, 3.4, 2.1, (g, w, h) => {
      fill(g, w, h, '#f1ead6'); grain(g, w, h, 0.06); rect(g, 0, 0, w, h * 0.2, '#e8669a'); T(g, 'COMING NEVER', w / 2, h * 0.11, h * 0.14, '#fff6ea', { f: F.archivo, ls: 2 });
      T(g, 'Vesper Street, Phase 2', w / 2, h * 0.33, h * 0.13, '#24382f', { f: F.playfair, w: 700, it: 1 });
      T(g, '40 LUXURY EVENINGS  ·  A SECOND SUNSET  ·  PARKING FOR 1 AIRSHIP', w / 2, h * 0.48, h * 0.052, '#2a1c13', { f: F.bebas, ls: 1, max: w * 0.9 });
      para(g, 'The robots were consulted. They voted nine to none to leave the grass exactly as it is. Thank you for your interest.', w * 0.08, h * 0.57, h * 0.06, '#2a1c13', w * 0.84, { f: F.elite });
      T(g, 'the grass says thanks', w / 2, h * 0.92, h * 0.085, '#a8361f', { f: F.caveat, w: 600 });
    }, { cw: 420, ch: 260 });
    K.collide(bx - 0.2, bx + 0.1, bz - 1.75, bz + 1.75, 4.4);
    K.F.drift('wildflowers', (x0 + x1) / 2, (z0 + z1) / 2, 3.2, 3.2, 9, 0.8);
  }

  // ======================================================================================
  // THE MEADOW PAST THE OVERLOOK
  // ======================================================================================

  // ---- The telescope's lens cap, over the rail ---------------------------------------------------
  {
    const x = 29.5, z = -239.6;
    put('c#17140f/0.5', new THREE.CylinderGeometry(0.3, 0.3, 0.09, 18), x, 0.1, z, 0, 0.12, 0.1); K.tube(PAINT.wire, [x + 0.28, 0.1, z], [x + 0.9, 0.06, z + 0.5], 0.012, 3);
    face(x + 1.05, 0.075, z + 0.62, EAST - 0.4, 0.62, 0.36, (g, w, h) => { paper(g, w, h, '#efe7d2'); T(g, 'PROPERTY OF THE TELESCOPE', w / 2, h * 0.24, h * 0.17, '#24382f', { f: F.bebas, max: w * 0.9 }); T(g, 'if found, do not put back on.', w / 2, h * 0.54, h * 0.17, '#2a1c13', { f: F.caveat, w: 600, max: w * 0.9 }); T(g, 'the view is the whole point', w / 2, h * 0.8, h * 0.15, '#a8361f', { f: F.caveat, w: 600, max: w * 0.9 }); }, { cw: 190, ch: 110, flat: true });
    say(x, 0.15, z, 'pick up the lens cap', ['The telescope\'s lens cap. You put it back in the grass. Nobody wants the sun switched off.', 'Still a lens cap. Still better off here.'], { reach: 7.5, size: 1.3 });
  }

  // ---- A fairy ring (it chimes: eggsLife) ---------------------------------------------------------------
  {
    const x = 42, z = -272, R = 3.6;
    put('c#3f6a35/1', new THREE.RingGeometry(R - 0.55, R + 0.55, 40).rotateX(-Math.PI / 2), x, 0.065, z);                           // the darker grass a real ring leaves
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; mushroom(x + Math.cos(a) * R, z + Math.sin(a) * R, 1.25 + (i % 3) * 0.15, (i % 2 ? 0.08 : -0.06)); }
    for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU + 0.2, d = R + (r() - 0.5) * 0.7; mushroom(x + Math.cos(a) * d, z + Math.sin(a) * d, 0.5 + r() * 0.35, (r() - 0.5) * 0.3); }
    card(x - 5.6, z + 3.2, S + 0.9, 1.5, 1.05, ticket('FAIRY RING', 'Marasmius oreades, the fairy ring champignon. The ring widens by a hand or so every year. Walk all the way round: it likes that.', 'eight notes. mind the F sharp.', { bs: 0.074, tc: '#3f5f43' }), { cw: 300, ch: 210 });
    E.ring = { x, z, R };
  }

  // ---- Unit 0, under the copper beech, watching -----------------------------------------------------------
  {
    const t = tree(-38, -226), R = 1.9 * (t.height / 48), x = t.x, zb = t.z - R - 0.1, zf = zb - 1.1, RUST = 'c#8a4a2a/1', RUST2 = 'c#9c5d34/1', RUSTD = 'c#5e3320/1';
    K.box(RUSTD, x - 0.7, x + 0.7, 0.05, 0.6, zf - 0.1, zb); K.box(RUST, x - 0.78, x + 0.78, 0.6, 2.3, zf, zb, { rot: [0.06, 0, 0] });
    K.box('c#6f8f8a/0.9', x - 0.5, x + 0.5, 1.25, 2.0, zf - 0.03, zf + 0.02, { rot: [0.06, 0, 0] }); K.box(PAINT.moss, x - 0.8, x + 0.3, 2.3, 2.36, zf + 0.1, zb);
    for (const s of [-1, 1]) {
      put(RUST2, new THREE.CylinderGeometry(0.2, 0.22, 2.0, 9).rotateX(Math.PI / 2), x + s * 0.42, 0.3, zf - 1.0, s * 0.12);                // legs, stretched out
      K.box(RUSTD, x + s * 0.55 - 0.2, x + s * 0.55 + 0.2, 0.05, 0.75, zf - 2.25, zf - 1.95, { rot: [0, s * 0.12, 0] });
      K.tube(RUST2, [x + s * 0.92, 2.0, zf + 0.5], [x + s * 1.12, 0.3, zf - 0.25], 0.14, 7); K.sphere(RUSTD, x + s * 1.12, 0.26, zf - 0.3, 0.22, 0.8, 1); K.sphere(RUSTD, x + s * 0.92, 2.02, zf + 0.5, 0.2, 1, 1);
      put(RUSTD, new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8).rotateZ(Math.PI / 2), x + s * 0.64, 3.0, zf + 0.5);                         // ears
    }
    K.cyl(RUSTD, x, 2.3, 2.5, zf + 0.5, 0.2, 0.2, 8); K.sphere(RUST2, x, 3.02, zf + 0.5, 0.62, 0.92, 2);
    for (const s of [-1, 1]) put('c#17140f/0.4', new THREE.CylinderGeometry(0.13, 0.13, 0.05, 12).rotateX(Math.PI / 2), x + s * 0.24, 3.08, zf - 0.07, s * -0.38);
    K.B.mesh('e#ffe2b4/1.7', new THREE.SphereGeometry(0.055, 8, 6).translate(x + 0.235, 3.08, zf - 0.1)); K.glowDots.push([x + 0.235, 3.08, zf - 0.14, 0.8]);      // one eye, still on
    K.tube(RUSTD, [x + 0.2, 3.55, zf + 0.6], [x + 0.36, 4.2, zf + 0.6], 0.025, 4); K.tube(RUSTD, [x + 0.36, 4.2, zf + 0.6], [x + 0.72, 4.3, zf + 0.5], 0.025, 4); K.sphere(RUST, x + 0.74, 4.3, zf + 0.5, 0.08, 1, 1);
    put(PAINT.straw, new THREE.TorusGeometry(0.26, 0.09, 5, 12).rotateX(Math.PI / 2), x - 0.12, 3.62, zf + 0.55);                            // a nest, and in it
    for (const [dx, dz] of [[-0.2, 0.5], [-0.05, 0.63], [-0.1, 0.46]]) K.sphere('c#bcd6d8/0.5', x + dx, 3.66, zf + dz, 0.075, 1.25, 1);
    face(x, 1.62, zf - 0.035, WEST, 0.6, 0.3, (g, w, h) => { fill(g, w, h, '#c9b98a'); grain(g, w, h, 0.25, 4); T(g, 'UNIT 0', w / 2, h * 0.55, h * 0.6, '#3a2a1c', { f: F.bebas, ls: 3 }); }, { cw: 96, ch: 48, tilt: -0.06 });
    K.F.add('marigold', x - 0.15, zf - 0.7, 0.9, { y: 0.4 }); K.F.add('marigold', x + 0.5, zf - 1.3, 0.8, { y: 0.4 }); K.F.add('cosmos', x + 1.3, zf + 0.5, 0.75); K.F.add('wildflowers', x - 1.25, zf + 0.2, 0.7);
    K.F.add('catmint', x - 0.1, zf - 2.6, 0.7); K.F.add('fern', x - 0.9, zb - 0.1, 0.6); K.F.add('marigold', x + 0.55, zf + 0.6, 0.6, { y: 2.3 }); K.F.add('cosmos', x - 1.0, zf - 1.7, 0.6);
    K.collide(x - 0.8, x + 0.8, zf - 0.2, zb, 3);
    card(x + 2.3, zf - 1.3, WEST - 0.75, 1.5, 1.1, (g, w, h) => {
      fill(g, w, h, '#5a4a2c'); grain(g, w, h, 0.1); g.strokeStyle = '#d9b96a'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
      T(g, 'UNIT 0', w / 2, h * 0.17, h * 0.15, '#e9cf8a', { f: F.bebas, ls: 4 });
      para(g, 'The first robot on Vesper Street. Kept every shop at once, badly, and with great love. Retired to watch the sun set.', w * 0.1, h * 0.3, h * 0.082, '#e9cf8a', w * 0.8, { f: F.fraunces, it: 1, w: 600 });
      T(g, 'still watching', w / 2, h * 0.89, h * 0.085, '#e9cf8a', { f: F.fraunces, it: 1, w: 600 });
    }, { cw: 290, ch: 212, board: 'c#3d3222/0.8' });
    K.seat(x - 2.1, -0.6, zf - 0.2, 0, 'sit with Unit 0 for a while');
    say(x, 3.0, zf, 'say good evening to Unit 0', ['A fan turns, once. That is "good evening".', 'Somewhere inside, one very old program is still running: WAIT FOR SUNSET. It reports 99%.', 'The eye brightens a little. It has noticed you noticing the nest. It would like you to say nothing.'], { reach: 8, size: 1.6, snd: 'old' });
  }

  // ---- A picnic, left laid out ---------------------------------------------------------------------------
  {
    const x = -37, z = -247, y = 0.1;
    K.box('c#e9e0cc/1', x - 2.5, x + 2.5, 0.045, y, z - 2, z + 2);
    face(x, y + 0.012, z, N, 4, 5, (g, w, h) => { fill(g, w, h, '#efe6d2'); const n = 10, s = w / n; for (let i = 0; i < n; i += 2) { g.fillStyle = 'rgba(184,69,46,.5)'; g.fillRect(i * s, 0, s, h); } for (let j = 0; j < h / s; j += 2) { g.fillStyle = 'rgba(184,69,46,.5)'; g.fillRect(0, j * s, w, s); } grain(g, w, h, 0.08); }, { cw: 160, ch: 200, flat: true, rough: 1 });
    // the basket, lid up
    K.box('c#a8895a/0.9', x + 1.2, x + 2.2, y, y + 0.75, z + 0.6, z + 1.7); K.box('c#96784a/0.9', x + 1.15, x + 2.25, y + 0.75, y + 0.8, z + 1.66, z + 1.72); K.box('c#a8895a/0.9', x + 1.2, x + 2.2, y + 0.78, y + 1.8, z + 1.7, z + 1.76, { rot: [0.25, 0, 0] });
    put('c#96784a/0.9', new THREE.TorusGeometry(0.5, 0.035, 5, 14, Math.PI), x + 1.7, y + 0.75, z + 1.15, N);
    // plates, a steamer, a flask, a jar, a tin, a book face down
    for (const [dx, dz] of [[-0.9, -0.7], [0.5, -1.0]]) { K.cyl(WHITE, x + dx, y + 0.02, y + 0.06, z + dz, 0.42, 0.3, 16); }
    K.sphere('c#e9c46a/0.8', x - 0.9, y + 0.14, z - 0.7, 0.2, 0.5, 1, 1.5, 1);                                                    // half a bun
    for (let i = 0; i < 2; i++) { K.cyl('c#c9a56a/0.8', x - 0.2, y + 0.02 + i * 0.36, y + 0.35 + i * 0.36, z + 0.6, 0.5, 0.5, 14); K.cyl('c#8a6a3a/0.8', x - 0.2, y + 0.32 + i * 0.36, y + 0.38 + i * 0.36, z + 0.6, 0.52, 0.52, 14); }
    K.cyl('c#b98f4a/0.8', x - 1.4, y + 0.02, y + 0.08, z + 0.9, 0.52, 0.52, 14); for (const [dx, dz] of [[-1.5, 0.8], [-1.25, 0.95]]) K.sphere('c#f1ead6/0.7', x + dx, y + 0.19, z + dz, 0.15, 0.8, 1);      // the lid, with the last two on it
    K.cyl('c#2f4a40/0.5', x + 0.9, y + 0.02, y + 0.9, z - 0.1, 0.15, 0.15, 10); K.cyl(STEEL, x + 0.9, y + 0.9, y + 1.08, z - 0.1, 0.12, 0.14, 10);
    K.cyl('c#7a8f4a/0.3', x + 0.3, y + 0.02, y + 0.5, z + 0.1, 0.2, 0.2, 10); K.cyl(BRASS, x + 0.3, y + 0.5, y + 0.56, z + 0.1, 0.21, 0.21, 10);
    K.box(STEEL, x - 1.8, x - 1.2, y + 0.02, y + 0.14, z - 0.5, z - 0.1, { rot: [0, 0.3, 0] });
    K.box('c#34405a/0.8', x + 1.2, x + 1.75, y + 0.02, y + 0.1, z - 1.6, z - 0.8, { rot: [0, -0.3, 0] }); K.box('c#f1ead6/0.9', x + 1.22, x + 1.73, y + 0.0, y + 0.06, z - 1.58, z - 0.82, { rot: [0, -0.3, 0] });
    card(x - 0.2, z - 1.5, WEST, 1.3, 0.8, (g, w, h) => { paper(g, w, h, '#f6e9a8'); T(g, 'BACK SOON', w / 2, h * 0.2, h * 0.2, '#17140f', { f: F.archivo }); T(g, 'help yourself', w / 2, h * 0.46, h * 0.2, '#2a1c13', { f: F.caveat, w: 600 }); T(g, '(not the last dumpling.', w / 2, h * 0.68, h * 0.13, '#a8361f', { f: F.caveat, w: 600 }); T(g, 'you know which one it is.)', w / 2, h * 0.84, h * 0.13, '#a8361f', { f: F.caveat, w: 600 }); }, { y: 0.62, y0: y, tilt: 0.3, cw: 250, ch: 154, board: 'c#f1ead6/0.9', stake: false });
    say(x - 0.6, 0.5, z + 0.5, 'help yourself', ['A dumpling, still warm. Eighteen pleats. Bao has been here.', 'A pickle from the jar. You pay with a nice thought, out of habit.', 'One dumpling left. It looks at you. You know which one it is. You leave it.'], { reach: 8, size: 2.4 });
  }

  // ======================================================================================
  // BEHIND THE SOUTH ROW
  // ======================================================================================

  // ---- A kite, caught in the pine by the Landing ------------------------------------------------------
  {
    const t = tree(-96, 26), ph = Math.atan2(45 - t.z, -t.x), cx = Math.cos(ph), sz = Math.sin(ph), kx = t.x + cx * 10.5, ky = 21.5, kz = t.z + sz * 10.5, yaw = Math.PI / 2 - ph, rx = -0.35, rz = 0.55;
    put('c#c8402f/0.8', new THREE.CylinderGeometry(1, 1, 0.04, 4).rotateX(Math.PI / 2).scale(1.5, 2.1, 1), kx, ky, kz, yaw, rx, rz);
    put('c#e9b44c/0.8', new THREE.CylinderGeometry(1, 1, 0.045, 4).rotateX(Math.PI / 2).scale(0.75, 1.05, 1), kx, ky, kz, yaw, rx, rz);
    put(CREAM, new THREE.BoxGeometry(0.06, 4.2, 0.07), kx, ky, kz, yaw, rx, rz); put(CREAM, new THREE.BoxGeometry(3.0, 0.06, 0.07), kx, ky, kz, yaw, rx, rz);
    const eu = new THREE.Euler(rx, yaw, rz, 'YXZ'), tip = new THREE.Vector3(0, -2.1, 0).applyEuler(eu).add(new THREE.Vector3(kx, ky, kz));
    let p = tip.toArray();
    ['c#e9b44c/0.8', 'c#ece4d0/0.8', 'c#3f6a5a/0.8', 'c#e9b44c/0.8', 'c#ece4d0/0.8'].forEach((col, i) => { const q = [p[0] + cx * 0.25 + Math.sin(i * 2.1) * 0.35, p[1] - 1.35, p[2] + sz * 0.25 + Math.cos(i * 1.7) * 0.3]; K.tube(CREAM, p, q, 0.02, 3); put(col, new THREE.BoxGeometry(0.5, 0.2, 0.03), q[0], q[1], q[2], i * 1.1, 0, 0.5); p = q; });
    // the line, down to the reel in the grass
    const rxw = t.x + cx * 17.5 + sz * 2, rzw = t.z + sz * 17.5 - cx * 2; let a = [kx, ky, kz];
    for (let i = 1; i <= 7; i++) { const u = i / 7, b = [kx + (rxw - kx) * u, ky + (0.25 - ky) * (u * u * 0.45 + u * 0.55) - Math.sin(u * Math.PI) * 1.2, kz + (rzw - kz) * u]; K.tube(CREAM, a, b, 0.018, 3); a = b; }
    put(WOOD, new THREE.CylinderGeometry(0.14, 0.14, 0.7, 10).rotateZ(Math.PI / 2), rxw, 0.2, rzw, 0.5); for (const s of [-1, 1]) put(WOODD, new THREE.CylinderGeometry(0.24, 0.24, 0.05, 12).rotateZ(Math.PI / 2), rxw + s * 0.3 * Math.cos(0.5), 0.25, rzw - s * 0.3 * Math.sin(0.5), 0.5);
    say(rxw, 0.3, rzw, 'wind in the kite string', ['You pull. The pine pulls back. The pine has had more practice.', 'It is not coming down. Between ourselves, it has the best view on the island.', 'A label on the reel: "If found in a tree, it is the tree\'s now."'], { reach: 7.5, size: 1.4 });
  }

  // ---- The time capsule ------------------------------------------------------------------------------
  {
    const x = -54, z = 50;
    K.box(STONEP, x - 1.0, x + 1.0, 0, 0.42, z - 0.7, z + 0.7, { rot: [0.05, 0.3, 0.04] });
    face(x, 0.455, z, WEST + 0.3, 1.5, 0.95, brassPlate([['TIME CAPSULE', 0.16, F.bebas], ['sealed at nearly evening', 0.105], ['to be opened at evening', 0.105], ['contents: one perfectly good afternoon', 0.085]], { y0: 0.2, step: 0.2 }), { cw: 280, ch: 178, flat: true });
    for (let i = 0; i < 4; i++) K.F.add(K.pick(['catmint', 'marigold']), x + 1.5 * Math.cos(i * 1.9), z + 1.3 * Math.sin(i * 1.9) + 0.4, 0.6);
    say(x, 0.5, z, 'put your ear to the time capsule', ['Ticking. No: purring. Whatever is in there is having a lovely time.', 'A muffled voice: "Is it evening yet?" You say: nearly. "Right you are."'], { reach: 7, size: 1.6 });
  }

  // ---- The lost sock, up the maple behind the records ------------------------------------------------------
  {
    const t = tree(-78, -8), bx = t.x - 3.3, by = 8.4, bz = t.z - 0.5, SOCK = 'c#8f8f96/1';
    K.tube(PAINT.bark, [t.x, 7.4, t.z], [bx, by, bz], 0.15, 6); K.tube(PAINT.bark, [bx, by, bz], [bx - 0.9, by + 0.5, bz + 0.3], 0.07, 5);
    K.box(SOCK, bx + 0.42, bx + 0.72, by - 1.25, by + 0.2, bz - 0.07, bz + 0.07, { rot: [0, 0, 0.06] }); K.box(SOCK, bx + 0.44, bx + 0.74, by - 0.25, by + 0.2, bz + 0.05, bz + 0.19);
    K.box(SOCK, bx + 0.42, bx + 1.2, by - 1.52, by - 1.22, bz - 0.07, bz + 0.07, { rot: [0, 0, 0.06] });
    K.box('c#b8452e/1', bx + 0.4, bx + 0.74, by - 0.5, by - 0.38, bz - 0.08, bz + 0.08); K.box('c#ece4d0/1', bx + 1.08, bx + 1.24, by - 1.52, by - 1.2, bz - 0.08, bz + 0.08, { rot: [0, 0, 0.06] });
    say(bx + 0.6, by - 0.6, bz, 'reach for the sock', ['Grey. Left foot (probably). Too high to reach. It has gone up in the world.', 'Sentimental value: immense. Altitude: also immense. Otis ought to be told. Gently.', 'How does a sock get up a maple? The laundrette that does not exist is saying nothing.'], { reach: 13, size: 1.6 });
  }

  // ---- A well with an echo -----------------------------------------------------------------------------
  {
    const x = -102, z = -8;
    K.lathe(STONEP, x, 0, z, [[2.0, 0], [2.0, 2.3], [2.12, 2.3], [2.12, 2.5], [1.5, 2.5], [1.5, 0.3]], 16);
    K.cyl('c#0b0a09/1', x, 0.3, 0.42, z, 1.5, 1.5, 16);
    for (const s of [-1, 1]) { K.box(WOODD, x + s * 1.82 - 0.13, x + s * 1.82 + 0.13, 2.5, 6.5, z - 0.13, z + 0.13); K.box('c#7a3f30/0.9', x - 2.3, x + 2.3, 6.46, 6.58, z + s * 0.68 - 0.95, z + s * 0.68 + 0.95, { rot: [s * 0.6, 0, 0] }); }
    K.tube(WOODD, [x - 1.82, 5.2, z], [x + 2.2, 5.2, z], 0.15, 8); K.tube(IRON, [x + 2.2, 5.2, z], [x + 2.2, 4.7, z + 0.3], 0.035, 4); K.tube(IRON, [x + 2.2, 4.7, z + 0.3], [x + 2.6, 4.7, z + 0.3], 0.035, 4);
    put(ROPE, new THREE.CylinderGeometry(0.2, 0.2, 0.7, 10).rotateZ(Math.PI / 2), x - 0.2, 5.2, z); K.tube(ROPE, [x - 0.1, 5.05, z + 0.1], [x - 0.3, 3.35, z + 1.7], 0.03, 4);
    K.lathe(WOOD, x - 0.3, 2.5, z + 1.8, [[0.01, 0], [0.3, 0], [0.4, 0.7], [0.36, 0.7], [0.28, 0.06], [0.01, 0.06]], 12); put(IRON, new THREE.TorusGeometry(0.36, 0.02, 4, 12, Math.PI), x - 0.3, 3.2, z + 1.8, N);
    K.collide(x - 2.1, x + 2.1, z - 2.1, z + 2.1, 2.6);
    face(x + 1.98, 4.1, z, N, 0.24 * 5, 0.7, (g, w, h) => { fill(g, w, h, '#efe7d2'); grain(g, w, h, 0.06); T(g, 'WISHING WELL', w / 2, h * 0.26, h * 0.26, '#24382f', { f: F.bebas, ls: 2 }); T(g, 'goes all the way through', w / 2, h * 0.58, h * 0.2, '#2a1c13', { f: F.caveat, w: 600 }); T(g, 'wishes land in about a week', w / 2, h * 0.84, h * 0.17, '#a8361f', { f: F.caveat, w: 600, max: w * 0.9 }); }, { cw: 220, ch: 128 });
    K.box(WOOD, x + 1.95, x + 1.975, 3.72, 4.48, z - 0.63, z + 0.63);
    for (let i = 0; i < 6; i++) K.F.add(K.pick(['fern', 'catmint', 'grass']), x + Math.cos(i * 1.1 + 2) * 2.7, z + Math.sin(i * 1.1 + 2) * 2.7, 0.6);
    E.well = { x, y: 3.0, z };
  }

  // ---- X marks the spot ---------------------------------------------------------------------------------
  {
    const x = -113, z = -50;
    for (const s of [1, -1]) K.box('c#b8362a/0.9', x - 1.6, x + 1.6, 0.05, 0.085 + (s > 0 ? 0.01 : 0), z - 0.22, z + 0.22, { rot: [0, s * Math.PI / 4, 0] });
    K.tube(WOOD, [x + 2.3, 0.5, z + 1.2], [x + 2.75, 3.5, z + 1.45], 0.06, 6); K.tube(WOOD, [x + 2.75, 3.5, z + 1.15], [x + 2.75, 3.5, z + 1.75], 0.055, 5);
    K.box('c#6d6f72/0.5', x + 1.95, x + 2.55, -0.2, 0.75, z + 1.16, z + 1.2, { rot: [0, 0, -0.15] });
    K.sphere(SOIL, x + 3.0, 0.1, z - 0.6, 0.8, 0.4, 1, 1.2, 1); K.sphere(SOIL, x + 3.6, 0.05, z - 0.1, 0.4, 0.4, 1);
    face(x - 0.8, 0.07, z + 2.6, N + 0.4, 1.0, 0.8, (g, w, h) => {
      paper(g, w, h, '#e6d6a8', 8); g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = 2; g.beginPath(); g.ellipse(w * 0.5, h * 0.48, w * 0.36, h * 0.2, 0.1, 0, TAU); g.stroke();
      g.setLineDash([5, 5]); line(g, [[w * 0.2, h * 0.5], [w * 0.36, h * 0.4], [w * 0.5, h * 0.52], [w * 0.66, h * 0.44]], '#5a3c1e', 2); g.setLineDash([]);
      T(g, 'X', w * 0.7, h * 0.44, h * 0.2, '#b8362a', { f: F.caveat, w: 700 }); T(g, 'you are here', w * 0.68, h * 0.62, h * 0.09, '#5a3c1e', { f: F.caveat, w: 600 }); T(g, 'TREASURE (dig)', w / 2, h * 0.14, h * 0.12, '#5a3c1e', { f: F.elite }); T(g, 'N is where the coffee is', w / 2, h * 0.88, h * 0.09, '#5a3c1e', { f: F.caveat, w: 600 });
    }, { cw: 200, ch: 160, flat: true });
    say(x, 0.2, z, 'dig', ['You dig. A tin box. Inside: a map of this exact spot, marked with an X. Thorough.', 'You bury it again, a little better than you found it. Somebody is going to be thrilled.', 'You dig again. The tin now also contains a note: "we saw that."'], { reach: 7.5, size: 2, snd: 'dig' });
  }

  // ---- The signpost at the south rim ------------------------------------------------------------------
  {
    const z = -64, x = rimX(z, -1, 0.93);
    K.cyl(CREAM, x, 0, 8.6, z, 0.14, 0.12, 8); K.sphere(CREAM, x, 8.7, z, 0.2, 1, 1); K.collide(x - 0.3, x + 0.3, z - 0.3, z + 0.3, 8);
    const boardAt = (y, zc, w, h, draw, cw, ch) => { K.box(CREAM, x - 0.03, x + 0.05, y - h / 2, y + h / 2, zc - w / 2, zc + w / 2); face(x + 0.06, y, zc, N, w, h, draw, { cw, ch }); };
    boardAt(4.0, z + 0.55, 0.8, 4.4, (g, w, h) => { fill(g, w, h, '#ece4d0'); T(g, 'THE GROUND  ·  2 MILES', w / 2, h * 0.44, w * 0.5, '#24382f', { f: F.fraunces, w: 600, it: 1, rot: Math.PI / 2 }); T(g, '↓', w / 2, h * 0.93, w * 0.7, '#a8361f', { f: F.fraunces, w: 600 }); }, 76, 418);
    boardAt(7.6, z - 2.2, 4.2, 0.72, (g, w, h) => { fill(g, w, h, '#ece4d0'); T(g, 'the sunset (any minute)  →', w / 2, h * 0.54, h * 0.5, '#24382f', { f: F.fraunces, w: 600, it: 1, max: w * 0.94 }); }, 336, 58);
    boardAt(6.65, z + 2.2, 4.2, 0.72, (g, w, h) => { fill(g, w, h, '#ece4d0'); T(g, '←  the airship, eventually', w / 2, h * 0.54, h * 0.5, '#24382f', { f: F.fraunces, w: 600, it: 1, max: w * 0.94 }); }, 336, 58);
    boardAt(5.6, z - 0.75, 1.1, 0.72, (g, w, h) => { fill(g, w, h, '#ece4d0'); T(g, '↑ sky', w / 2, h * 0.54, h * 0.5, '#24382f', { f: F.fraunces, w: 600, it: 1 }); }, 88, 58);
    say(x, 4.0, z, 'look over the edge', ['Clouds, and under the clouds, more clouds. The sign says two miles. The sign has never been down to check.', 'Far below, a field the size of a postage stamp. Somebody down there is having an ordinary afternoon.'], { reach: 8, size: 1.5 });
  }

  // ---- FOUND: a very good stick ------------------------------------------------------------------------
  {
    const x = -106, z = -98, fork = zz => { K.tube(WOODD, [x, 0, zz], [x, 1.5, zz], 0.06, 5); K.tube(WOODD, [x, 1.5, zz], [x - 0.22, 1.9, zz], 0.045, 5); K.tube(WOODD, [x, 1.5, zz], [x + 0.22, 1.9, zz], 0.045, 5); };
    fork(z - 1.6); fork(z + 1.6);
    const ST = 'c#7a5a3c/1'; K.tube(ST, [x, 1.66, z - 2.4], [x, 1.68, z - 0.3], 0.075, 6); K.tube(ST, [x, 1.68, z - 0.3], [x + 0.05, 1.66, z + 1.3], 0.07, 6); K.tube(ST, [x + 0.05, 1.66, z + 1.3], [x - 0.05, 1.8, z + 2.6], 0.06, 6);
    K.sphere(ST, x, 1.69, z - 0.3, 0.1, 1, 1); K.tube(ST, [x, 1.68, z + 0.6], [x + 0.1, 2.05, z + 0.85], 0.03, 4);
    K.tube(ROPE, [x, 1.6, z - 0.9], [x + 0.06, 1.15, z - 0.9], 0.012, 3);
    face(x + 0.07, 0.98, z - 0.9, N, 0.42, 0.3, (g, w, h) => { paper(g, w, h, '#efe7d2'); T(g, 'exhibit A:', w / 2, h * 0.3, h * 0.26, '#2a1c13', { f: F.caveat, w: 600 }); T(g, 'stick (v. good)', w / 2, h * 0.66, h * 0.26, '#a8361f', { f: F.caveat, w: 600, max: w * 0.9 }); }, { cw: 110, ch: 78 });
    K.box('c#efe7d2/0.9', x + 0.04, x + 0.065, 0.82, 1.14, z - 1.12, z - 0.68);
    card(x + 1.3, z + 2.6, N - 0.3, 1.5, 1.05, ticket('FOUND', 'A very good stick. Claimants must describe the stick. Descriptions so far: "long", "brown", "mine". All refused.', 'good heft. one knot. slight bend.', { tf: F.archivo, tc: '#17140f', bs: 0.078 }), { cw: 290, ch: 204 });
    say(x, 1.7, z, 'describe the stick', ['"Stick-shaped?" Refused. The stick remains unclaimed. It seems to prefer it.', '"Good heft, one knot, bends a little to the left." Correct! But is it YOURS? You hesitate. Refused.', 'You do not want to own it anyway. You want it to be here. It is a very good stick.'], { reach: 7, size: 1.8 });
  }

  // ---- The cache under the willow -----------------------------------------------------------------------
  {
    const t = tree(-98, -128), x = t.x - 3.4, z = t.z + 0.8, BOX = 'c#4a5a3a/0.7';
    K.box(BOX, x - 0.6, x + 0.6, 0.03, 0.62, z - 0.35, z + 0.35, { rot: [0, 0.35, 0] }); K.box('c#3d4a30/0.7', x - 0.63, x + 0.63, 0.62, 0.7, z - 0.38, z + 0.38, { rot: [0, 0.35, 0] });
    put(STEEL, new THREE.BoxGeometry(0.1, 0.22, 0.04), x - 0.13, 0.52, z + 0.33, 0.35 - Math.PI / 2 + Math.PI / 2);
    face(x, 0.708, z, N + 0.35 - Math.PI / 2, 0.62, 1.1, (g, w, h) => { fill(g, w, h, '#3d4a30'); g.save(); g.translate(w / 2, h / 2); g.rotate(Math.PI / 2); T(g, 'VESPER CACHE', 0, -w * 0.2, w * 0.24, '#e9cf8a', { f: F.bebas, ls: 2 }); T(g, 'No. 1 (of 1)', 0, w * 0.04, w * 0.17, '#e9cf8a', { f: F.elite }); T(g, 'take a thought, leave a thought', 0, w * 0.27, w * 0.13, '#efe7d2', { f: F.caveat, w: 600 }); g.restore(); }, { cw: 110, ch: 196, flat: true });
    K.box('c#efe7d2/0.9', x - 1.25, x - 0.75, 0.04, 0.12, z + 0.3, z + 0.95, { rot: [0, -0.2, 0] }); K.box('c#34405a/0.8', x - 1.27, x - 0.73, 0.03, 0.07, z + 0.28, z + 0.97, { rot: [0, -0.2, 0] }); K.tube('c#e9b44c/0.6', [x - 1.1, 0.15, z + 0.45], [x - 0.85, 0.15, z + 0.9], 0.022, 5);
    K.F.add('fern', x + 0.9, z - 0.8, 0.6); K.F.add('fern', x - 0.4, z - 1.0, 0.5);
    E.cache = { x: x - 0.4, y: 0.5, z: z + 0.3 };
  }

  // ---- Eight stones that hum at dusk, and a star stone ------------------------------------------------------
  {
    const x = -113, z = -150, R = 4.6;
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + 0.2, sx = x + Math.cos(a) * R, sz = z + Math.sin(a) * R, h = 0.75 + (i * 37 % 5) * 0.09; K.rock(i % 3 ? PAINT.stoneDark : PAINT.stone, sx, h * 0.33, sz, 0.42, h, 0.36, a); K.glowDots.push([sx, h * 1.35 + 0.25, sz, 0.75]); }
    K.cyl(STONEP, x, 0, 0.3, z, 1.0, 1.1, 14);
    face(x, 0.312, z, N, 1.8, 1.8, (g, w, h) => {
      disc(g, w / 2, h / 2, w / 2, '#2a2f38'); grain(g, w, h, 0.1, 6);
      // The Plough, and the way from its pointers to Polaris (positions from right ascension and declination)
      const stars = [[11.06, 61.75, 'Dubhe'], [11.03, 56.38, 'Merak'], [11.9, 53.69, 'Phecda'], [12.26, 57.03, 'Megrez'], [12.9, 55.96, 'Alioth'], [13.4, 54.93, 'Mizar'], [13.79, 49.31, 'Alkaid']];
      const P = ([ra, dec]) => [w * (0.4 + (ra - 12.4) * 15 * Math.cos((dec * Math.PI) / 180) * 0.0122), h * (0.6 - (dec - 55) * 0.0122)];
      const pts = stars.map(P); line(g, [pts[0], pts[1], pts[2], pts[3], pts[0]], 'rgba(233,207,138,.5)', 1.5); line(g, [pts[3], pts[4], pts[5], pts[6]], 'rgba(233,207,138,.5)', 1.5);
      const pol = [w * 0.375, h * 0.2]; g.setLineDash([3, 5]); line(g, [pts[0], pol], 'rgba(233,207,138,.4)', 1.2); g.setLineDash([]);
      pts.forEach(([px, py], i) => { disc(g, px, py, 3.2, '#f6e9c0'); T(g, stars[i][2], px + (i < 2 ? -6 : 0), py + (i < 2 ? 0 : 11), 8.5, '#c9b98a', { f: F.fraunces, it: 1, a: i < 2 ? 'right' : 'center' }); });
      ICON.star(g, pol[0], pol[1], 13, '#f6e9c0'); T(g, 'Polaris', pol[0] + 10, pol[1], 9.5, '#e9cf8a', { f: F.fraunces, it: 1, a: 'left' });
      T(g, 'THE PLOUGH', w / 2, h * 0.86, 11, '#e9cf8a', { f: F.bebas, ls: 3 }); T(g, 'for when the sun does go', w / 2, h * 0.92, 9, '#c9b98a', { f: F.caveat, w: 600 });
    }, { cw: 220, ch: 220, flat: true, round: true });
    card(x + R + 1.6, z + 2.5, N - 0.4, 1.4, 0.95, ticket('THE HUMMING STONES', 'Eight of them. Nobody has ever counted nine. They hum at dusk, which up here is most of the time. Mostly D.', 'robot choir: tuesdays. these: always.', { bs: 0.08 }), { cw: 280, ch: 190 });
    E.circle = { x, z, R };
  }

  // ---- The 10 mm socket ----------------------------------------------------------------------------------
  {
    const x = -78, z = -182;
    put(STEEL, new THREE.CylinderGeometry(0.11, 0.11, 0.26, 6), x, 0.14, z, 0.4, 1.35, 0.2); put('c#17140f/0.6', new THREE.CylinderGeometry(0.065, 0.065, 0.265, 6), x, 0.14, z, 0.4, 1.35, 0.2);
    K.glowDots.push([x, 0.3, z, 0.6]);
    for (const [dx, dz] of [[1.6, 0.4], [-1.2, 1.3], [0.4, -1.7], [-1.6, -0.9]]) K.F.add('grass', x + dx, z + dz, 0.9);
    say(x, 0.15, z, 'pick up the 10 mm socket', ['The 10 mm! So this is where they go. You put it down again somewhere safe. (Here.)', 'If you took it back, the bike shop would have nothing left to look for. It stays.', 'It has rolled an inch since last time. They do that.'], { reach: 7, size: 1.3 });
  }

  // ======================================================================================
  // SEVEN PAINTED STONES, one word each
  // ======================================================================================
  {
    const COLS = ['#c8402f', '#e9b44c', '#3f6a5a', '#34405a', '#d59a8a', '#7a5a8a', '#3c8fa0'];
    const at = [[70, 40], [114, -44], [107, -128], [-112, 10], [-121, -108], [-84, -212], [44, -264]];
    at.forEach(([x, z], i) => {
      K.sphere(`c${COLS[i]}/0.6`, x, 0.12, z, 0.62, 0.42, 2, 1.25, 1);
      face(x, 0.12 + 0.62 * 0.42 - 0.012, z, x > 0 ? S : N, 0.7, 0.7, (g, w, h) => { disc(g, w / 2, h / 2, w / 2, '#f4eedc'); disc(g, w / 2, h / 2, w * 0.45, null, COLS[i], 3); T(g, WORDS[i], w / 2, h * 0.5, h * (WORDS[i].length > 4 ? 0.24 : 0.3), '#2a1c13', { f: F.abril, max: w * 0.8 }); T(g, `${i + 1} of 7`, w / 2, h * 0.78, h * 0.12, COLS[i], { f: F.caveat, w: 600 }); }, { cw: 120, ch: 120, flat: true, round: true });
      E.stones.push({ x, y: 0.4, z, i });
    });
  }
}

// ---- what answers back -----------------------------------------------------------------------------
export function eggsLife(ctx, K) {
  const E = K.eggs; if (!E) return;
  const { camera, day } = ctx, note = (...a) => ctx.sound?.note?.(...a), flash = t => ctx.flash?.(t);
  let store = { stones: [], log: 0 };
  try { store = { ...store, ...JSON.parse(localStorage.getItem('vesper.eggs') ?? '{}') }; } catch { /* private window */ }
  const save = () => { try { localStorage.setItem('vesper.eggs', JSON.stringify(store)); } catch { /* private window */ } };
  const SND = {
    tap: () => { note(96, 0, 0.12, 0.05); note(98, 0.09, 0.1, 0.03); },
    knock: () => { for (const w of [0, 0.16, 0.5]) note(43, w, 0.14, 0.2); ctx.sound?.chirp?.([79, 84], 0.03); },
    old: () => { note(41, 0, 2.6, 0.12); note(48, 0.5, 2.2, 0.08); },
    dig: () => { note(38, 0, 0.2, 0.16); note(36, 0.3, 0.2, 0.14); note(62, 0.75, 0.5, 0.05); },
  };
  for (const th of E.things) { let n = 0; ctx.interact.push({ x: th.x, y: th.y, z: th.z, reach: th.reach ?? 6.5, size: th.size, label: () => th.label, act: () => { SND[th.snd]?.(); flash(th.lines[n++ % th.lines.length]); } }); }

  // the well: a shout, and what comes back
  if (E.well) {
    let n = 0; const calls = ['HELLO! ... ello ... llo ... o. (And two miles down, a cow looks up.)', 'ECHO! ... "no need to shout" ... shout ... out.', 'You listen instead. Wind, and very faintly, somebody else\'s weather.'];
    ctx.interact.push({ x: E.well.x, y: E.well.y, z: E.well.z, reach: 8.5, size: 2.2, label: () => 'call down the well', act: () => { const k = n++ % calls.length; if (k < 2) for (let i = 0; i < 5; i++) note(67 - i * (k ? 3 : 2), i * 0.55, 0.9, 0.2 * Math.pow(0.5, i)); flash(calls[k]); } });
  }
  // the cache: sign the book
  if (E.cache) {
    const LOG = ['"TFTC. Took nothing, left a button."', '"Found it at dusk. Obviously."', '"Third visit. The willow knows me now."', '"Swapped a tin for a different tin. Wrong place? Felt right."'];
    ctx.interact.push({ x: E.cache.x, y: E.cache.y, z: E.cache.z, reach: 7.5, size: 1.8, label: () => 'sign the logbook', act: () => { store.log = (store.log ?? 0) + 1; save(); note(74, 0, 0.5, 0.06); flash(`The logbook. Last entry: ${LOG[(store.log - 1) % LOG.length]} You sign it too: visit no. ${store.log}.`); } });
  }

  // the painted stones: seven words; the tally is kept, and when it is complete a lantern is lit over the little door
  const found = new Set((store.stones ?? []).filter(i => i >= 0 && i < 7));
  let lantern = null;
  if (E.door && ctx.materials?.make) {
    const T3 = ctx.THREE; lantern = new T3.Mesh(new T3.SphereGeometry(0.3, 12, 9).scale(1, 1.25, 1), ctx.materials.make('e#ffb866/2.2'));
    lantern.position.set(E.door.x, E.door.y, E.door.z); lantern.name = 'egg lantern'; lantern.visible = found.size === 7; ctx.scene.add(lantern);
  }
  const sentence = () => WORDS.map((w, i) => (found.has(i) ? w : '_'.repeat(w.length))).join(' ');
  for (const s of E.stones) {
    ctx.interact.push({ x: s.x, y: s.y, z: s.z, reach: 7, size: 1.4, label: () => (found.has(s.i) ? `the painted stone: ${WORDS[s.i]}` : 'read the painted stone'), act: () => {
      const fresh = !found.has(s.i); found.add(s.i); if (fresh) { store.stones = [...found]; save(); }
      note(62 + [0, 2, 4, 5, 7, 9, 11][s.i], 0, 1.4, 0.1);
      if (found.size < 7) flash(`${fresh ? 'A painted stone' : 'This one again'}: "${WORDS[s.i]}". ${found.size} of 7.  ${sentence()}`);
      else { if (fresh) [62, 66, 69, 74, 78].forEach((m, k) => note(m, 0.3 + k * 0.16, 2.2, 0.07)); if (lantern) lantern.visible = true; flash(fresh ? 'All seven. "Stay as long as the light does." Somebody has lit a lantern over the little door in the oak.' : '"Stay as long as the light does." All seven found.'); }
    } });
  }

  // the golf ball
  let ball = null, putt = -1;
  if (E.golf) {
    const T3 = ctx.THREE, g = E.golf; ball = new T3.Mesh(new T3.SphereGeometry(0.075, 12, 9), new T3.MeshStandardMaterial({ color: 0xf4f2ec, roughness: 0.4 }));
    ball.position.set(g.x, 0.16, g.z); ball.castShadow = true; ball.name = 'egg golf ball'; ctx.scene.add(ball);
    let holes = 0; const LINES = ['Hole in one. Course record: one. You now hold it, jointly with everybody.', 'In again. The flag does a very small, dignified wave.', 'A third. Somewhere, Bao drops a dumpling in surprise.'];
    ctx.interact.push({ x: g.x, y: 0.2, z: g.z, reach: 8, size: 1.5, label: () => (putt < 0 ? 'putt' : 'watch it go'), act: () => { if (putt >= 0) return; putt = 0; note(84, 0, 0.1, 0.07); setTimeout(() => { note(52, 0, 0.25, 0.14); note(76, 0.12, 0.6, 0.05); flash(LINES[holes++ % LINES.length]); }, 1900); } });
  }

  // the fairy ring's scale, the stones' hum, the ball's roll: one tick, nothing made per frame
  const SCALE = [74, 76, 78, 79, 81, 83, 85, 86], HUM = [38, 45, 50, 45, 53, 50, 57, 45];
  let sector = -1, run = 0, humAt = 0, humN = 0, near = false;
  ctx.animated.push((t, dt) => {
    const cx = camera.position.x, cz = camera.position.z;
    if (E.ring) {
      const dx = cx - E.ring.x, dz = cz - E.ring.z;
      if (Math.abs(dx) < 9 && Math.abs(dz) < 9) {
        const d = Math.hypot(dx, dz);
        if (d > 1.6 && d < 7) {
          const i = Math.round(((Math.atan2(dz, dx) / TAU + 1) % 1) * 8) % 8;
          if (i !== sector) {
            const step = sector < 0 ? 0 : (i - sector + 8) % 8; run = step === 1 ? Math.max(1, run + 1) : step === 7 ? Math.min(-1, run - 1) : 0; sector = i; note(SCALE[i], 0, 1.6, 0.11);
            if (Math.abs(run) >= 8) { [86, 90, 93, 98].forEach((m, k) => note(m, 0.25 + k * 0.11, 1.8, 0.05)); flash(run > 0 ? 'Once round the ring. Somewhere very small, somebody applauds.' : 'Once round, widdershins. Bold. The mushrooms pretend not to mind.'); run = 0; }
          }
        } else if (d >= 7) { sector = -1; run = 0; }
      }
    }
    if (E.circle) {
      const dx = cx - E.circle.x, dz = cz - E.circle.z, inside = Math.abs(dx) < 16 && Math.abs(dz) < 16 && dx * dx + dz * dz < 196;
      if (inside) {
        const dusk = day.light < 0.85;
        if (!near) { near = true; humAt = t + 0.4; if (!dusk) flash('Eight stones, saying nothing. Come back when the light goes gold.'); }
        if (dusk && t > humAt) { humAt = t + 1.9; const k = humN++ % HUM.length; note(HUM[k], 0, 4.2, 0.085); if (k % 4 === 0) note(HUM[k] + 19, 0.3, 3.2, 0.018); if (humN === 3) flash('The stones are humming. D, mostly. One of them is flat and knows it.'); }
      } else if (near && dx * dx + dz * dz > 900) { near = false; humN = 0; }
    }
    if (ball && putt >= 0) {
      const g = E.golf; putt += dt;
      const u = Math.min(1, putt / 1.8), e = 1 - (1 - u) * (1 - u);
      ball.position.set(g.x + (g.hx - g.x) * e + Math.sin(e * Math.PI) * 0.35, u < 1 ? 0.16 : 0.02, g.z + (g.hz - g.z) * e);
      ball.rotation.x = -e * 40; ball.visible = putt < 1.95;
      if (putt > 6.5) { putt = -1; ball.visible = true; ball.position.set(g.x, 0.16, g.z); }
    }
  });
}
