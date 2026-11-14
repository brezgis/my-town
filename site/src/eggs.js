// Things hidden in the grass. Nobody is told about these: they are for people who leave the
// pavement. There are seven, a long way apart, one to a corner of the island:
//
//   a kite in the pine, north of the Landing          the 10 mm socket, behind Frond (the bike shop is looking for it)
//   a sock up the maple behind the records            a swing on the copper beech by the churchyard wall
//   (the notice board in the Yard is asking)          a fairy ring in the meadow past the Overlook
//   a very good stick, behind the Yard (likewise)     a message in a bottle, at the north rim
//
// The rule for each: one object, one thing to do with it, one line. Nothing here explains itself on a card.
//
// Everything is built from the street kit's primitives in plain colours (one batched mesh); the two
// bits of lettering go through the shared sign sheets. What answers back is set up in eggsLife().
//
// World feet: x north(+)/south(-), y up, z east(+)/west(-). A sign's yaw is the way it faces:
// 0 east (+z), PI west, PI/2 north (+x), -PI/2 south (-x).

import * as THREE from 'three';
import { PAINT } from './street/tools.js';
import { T, F, fill, grain, paper, TAU } from './draw.js';

const WOOD = 'c#8a6a48/0.85', WOODD = 'c#5a4432/0.85', CREAM = 'c#ece4d0/0.75', STEEL = 'c#b9bcc0/0.3/1';
const RED = 'c#b8452e/0.7', ROPE = PAINT.rope;
const G0 = 0.03;                                                  // the lawn's own height
const N = Math.PI / 2, WEST = Math.PI;

// The island's edge (as street.js lays it out; repeated here so this file stands alone)
const OUT = (() => { const o = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * TAU, c = Math.cos(a), s = Math.sin(a); let r = (128 * 240) / Math.hypot(240 * c, 128 * s); r *= 1 + 0.05 * Math.sin(a * 3 + 0.8) + 0.035 * Math.sin(a * 5 + 2.1); if (c < -0.5) r *= 1 + 0.12 * (-c - 0.5); o.push(Math.round(r)); } return o; })();
const edgeAt = a => { const f = ((((a / TAU) % 1) + 1) % 1) * 48, i = Math.floor(f), t = f - i; return OUT[i % 48] * (1 - t) + OUT[(i + 1) % 48] * t; };
const fracAt = (x, z) => Math.hypot(x, z + 62) / edgeAt(Math.atan2(z + 62, x));
// x at which (x, z) is `frac` of the way out to the rim, on the north (side 1) or south (-1) side
const rimX = (z, side, frac) => { let lo = 0, hi = 170; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (fracAt(side * m, z) < frac) lo = m; else hi = m; } return side * lo; };

export function hideEggs(K, town) {
  const E = K.eggs = { things: [] };
  const tree = (x, z) => K.trees.reduce((b, t) => (Math.hypot(t.x - x, t.z - z) < Math.hypot(b.x - x, b.z - z) ? t : b));
  // Where a single-stemmed tree's trunk really is at height y (trees.js leans each one by its seed)
  const SP = { oak: [2.1, 0.22, 46], maple: [1.5, 0.3, 44], copper: [1.9, 0.2, 48] };
  const trunkAt = (t, y) => {
    const [tr, bole, H] = SP[t.kind] ?? SP.oak; let s = (t.seed ?? Math.round(t.x * 13 + t.z * 7)) >>> 0; const rr = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const lx = (rr() - 0.5) * 0.22, lz = (rr() - 0.5) * 0.22, n = Math.hypot(lx, 1, lz), k = Math.max(0, y - 0.9), len = t.height * bole;
    return { x: t.x + lx * k, z: t.z + lz * k, r: (tr * t.height / H) * (1 - 0.28 * Math.min(1, (k * n) / len)) };
  };
  // any geometry, turned (yaw, then tilt, then roll) and set down
  const put = (mat, g, x, y, z, ry = 0, rx = 0, rz = 0) => { if (ry || rx || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ'))); g.translate(x, y, z); K.put(mat, g); };
  // a drawn face in the world: centre (x, y, z), facing yaw
  const face = (x, y, z, yaw, w, h, draw, o = {}) => K.extras.push({ draw, cw: o.cw ?? Math.round(w * 190), ch: o.ch ?? Math.round(h * 190), x, y, z, rotY: yaw, w, h, flat: !!o.flat, tilt: o.tilt, round: o.round, rough: o.rough });
  // something to press E on, that says its one line
  const say = (x, y, z, label, line, o = {}) => E.things.push({ x, y, z, label, line, ...o });
  const mushroom = (x, z, s, lean = 0) => {
    K.tube('c#e6d8b8/0.9', [x, G0, z], [x + lean * s, 0.42 * s, z + lean * 0.5 * s], 0.045 * s, 6);
    K.lathe('c#c9a273/0.9', x + lean * s, 0.36 * s, z + lean * 0.5 * s, [[0.04, 0.02], [0.3, 0], [0.3, 0.04], [0.2, 0.1], [0.09, 0.13], [0.05, 0.17], [0.01, 0.18]], 9, s);
  };
  // Buildings, and the chapel with its yard and paths (read from the town as it was built this time, never assumed)
  const ch = town?.chapel, keepOff = [...(town?.footprints ?? []), ch?.footprint, ch?.churchyard, ch?.gatePath, ch?.yardPath].filter(Boolean);
  const clearOf = (x0, x1, z0, z1, m = 1.5) => !keepOff.some(q => x0 < q.x1 + m && x1 > q.x0 - m && z0 < q.z1 + m && z1 > q.z0 - m);

  // ---- 1. A kite, caught in the pine north of the Landing; its reel lies in the grass ---------------------
  {
    const t = tree(88, 22), ph = Math.atan2(10 - t.z, 60 - t.x), cx = Math.cos(ph), sz = Math.sin(ph), kx = t.x + cx * 10.5, ky = 21.5, kz = t.z + sz * 10.5, yaw = Math.PI / 2 - ph, rx = -0.35, rz = 0.55;
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
    say(rxw, 0.3, rzw, 'wind in the kite string', 'You pull. The pine pulls back. The pine has had more practice.', { reach: 7.5, size: 1.4 });
  }

  // ---- 2. The lost sock, up the maple behind the records (the Yard's notice board is asking after it) ------
  {
    const t = tree(-78, -8), c = trunkAt(t, 7.4), bx = c.x - 0.5, by = 8.4, bz = c.z - 3.6, zs = bz + 0.7, ys = by - 0.1, SOCK = 'c#8f8f96/1';
    K.tube(PAINT.bark, [c.x, 7.4, c.z], [bx, by, bz], 0.15, 6); K.tube(PAINT.bark, [bx, by, bz], [bx + 0.3, by + 0.5, bz - 0.9], 0.07, 5);
    K.box(SOCK, bx - 0.07, bx + 0.07, ys - 1.3, ys + 0.22, zs - 0.16, zs + 0.16); K.box(SOCK, bx - 0.07, bx + 0.21, ys + 0.16, ys + 0.24, zs - 0.16, zs + 0.16); K.box(SOCK, bx + 0.13, bx + 0.21, ys - 0.25, ys + 0.2, zs - 0.16, zs + 0.16);      // hung over the branch by its cuff
    K.box(SOCK, bx - 0.07, bx + 0.07, ys - 1.6, ys - 1.28, zs - 0.75, zs + 0.16);
    K.box('c#b8452e/1', bx - 0.085, bx + 0.085, ys - 0.3, ys - 0.18, zs - 0.175, zs + 0.175); K.box('c#ece4d0/1', bx - 0.08, bx + 0.08, ys - 1.61, ys - 1.27, zs - 0.78, zs - 0.6); K.box('c#ece4d0/1', bx - 0.08, bx + 0.08, ys - 1.61, ys - 1.4, zs + 0.02, zs + 0.175);
    say(bx, ys - 0.7, zs, 'reach for the sock', 'Grey. Left foot, probably. Too high to reach: it has gone up in the world.', { reach: 13, size: 1.6 });
  }

  // ---- 3. FOUND: a very good stick, kept on two forked sticks behind the Yard (the notice board again) ------
  {
    const x = -106, z = -98, fork = zz => { K.tube(WOODD, [x, 0, zz], [x, 1.5, zz], 0.06, 5); K.tube(WOODD, [x, 1.5, zz], [x - 0.22, 1.9, zz], 0.045, 5); K.tube(WOODD, [x, 1.5, zz], [x + 0.22, 1.9, zz], 0.045, 5); };
    fork(z - 1.6); fork(z + 1.6);
    const ST = 'c#7a5a3c/1'; K.tube(ST, [x, 1.66, z - 2.4], [x, 1.68, z - 0.3], 0.075, 6); K.tube(ST, [x, 1.68, z - 0.3], [x + 0.05, 1.66, z + 1.3], 0.07, 6); K.tube(ST, [x + 0.05, 1.66, z + 1.3], [x - 0.05, 1.8, z + 2.6], 0.06, 6);
    K.sphere(ST, x, 1.69, z - 0.3, 0.1, 1, 1); K.tube(ST, [x, 1.68, z + 0.6], [x + 0.1, 2.05, z + 0.85], 0.03, 4);
    K.tube(ROPE, [x, 1.6, z - 0.9], [x + 0.06, 1.15, z - 0.9], 0.012, 3);                                                          // a luggage label on a string
    face(x + 0.07, 0.98, z - 0.9, N, 0.42, 0.3, (g, w, h) => { paper(g, w, h, '#efe7d2'); T(g, 'found', w / 2, h * 0.52, h * 0.42, '#a8361f', { f: F.caveat, w: 600 }); }, { cw: 110, ch: 78 });
    K.box('c#efe7d2/0.9', x + 0.04, x + 0.065, 0.82, 1.14, z - 1.12, z - 0.68);
    say(x, 1.7, z, 'describe the stick', '"Long. Brown. Mine." Refused. It is a very good stick, and it is staying.', { reach: 7, size: 1.8 });
  }

  // ---- 4. A message in a bottle, wedged between two stones at the north rim ---------------------------------
  {
    const z = -62, x = rimX(z, 1, 0.972), y = 0.2;
    K.rock(PAINT.stone, x + 0.5, 0.2, z + 0.9, 0.7, 0.5, 0.6); K.rock(PAINT.stoneDark, x + 0.3, 0.15, z - 0.9, 0.55, 0.4, 0.5);
    put('c#5f8f6a/0.25', new THREE.CylinderGeometry(0.17, 0.17, 0.62, 12).rotateZ(Math.PI / 2), x, y, z, 0.3, 0, 0.12);
    put('c#5f8f6a/0.25', new THREE.CylinderGeometry(0.07, 0.17, 0.2, 12).rotateZ(Math.PI / 2), x - 0.39, y - 0.047, z + 0.12, 0.3, 0, 0.12);
    put('c#5f8f6a/0.25', new THREE.CylinderGeometry(0.065, 0.065, 0.22, 10).rotateZ(Math.PI / 2), x - 0.58, y - 0.07, z + 0.18, 0.3, 0, 0.12);
    put('c#f1ead6/0.9', new THREE.CylinderGeometry(0.045, 0.045, 0.5, 8).rotateZ(Math.PI / 2), x - 0.86, y - 0.1, z + 0.265, 0.3, 0, 0.12);      // the letter, half out
    put(RED, new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8).rotateZ(Math.PI / 2), x - 0.9, y - 0.105, z + 0.277, 0.3, 0, 0.12);
    K.glowDots.push([x, y + 0.2, z, 0.7]);
    say(x - 0.5, 0.3, z + 0.1, 'read the message in the bottle', '"To the ground: hello from up here. It is nearly evening. Yours, V. Street."', { reach: 8, size: 1.6 });
  }

  // ---- 5. The 10 mm socket, in the grass behind Frond (Spoke & Sprocket's tool board has its outline) --------
  {
    const x = 86, z = -163;
    put(STEEL, new THREE.CylinderGeometry(0.11, 0.11, 0.26, 6), x, 0.14, z, 0.4, 1.35, 0.2); put('c#17140f/0.6', new THREE.CylinderGeometry(0.065, 0.065, 0.265, 6), x, 0.14, z, 0.4, 1.35, 0.2);
    K.glowDots.push([x, 0.3, z, 0.6]);
    say(x, 0.15, z, 'pick up the 10 mm socket', 'The 10 mm. So this is where they go. You put it back where it was.', { reach: 7, size: 1.3 });
  }

  // ---- 6. A swing on the copper beech by the churchyard wall, facing the sunset --------------------------------
  // (Unit 0, the first robot, used to sit slumped against this tree with a nest on its head. Anna: "a bit morbid".
  // If the chapel's yard ever reaches this tree, the swing hangs from the pine in the meadow instead.)
  {
    const spot = [[-38, -226], [-44, -262]].map(([tx, tz]) => { const t = tree(tx, tz), R = 1.9 * (t.height / 48); return { t, x: t.x + 0.4, z: t.z - R - 4.2 }; }).find(s => clearOf(s.x - 2, s.x + 2, s.z - 3, s.z + 3));
    if (spot) {
      const { t, x, z } = spot, TOP = 15.5, SEAT = 1.7, BARK = 'c#4a3a30/1';
      K.tube(BARK, [t.x, TOP - 1.2, t.z], [x, TOP, z - 1.5], 0.42, 7);                                   // the limb it hangs from, out over the grass
      for (const s of [-1, 1]) { K.tube(ROPE, [x + s * 0.95, TOP, z], [x + s * 0.95, SEAT, z], 0.035, 5); K.tube(ROPE, [x + s * 0.95, TOP + 0.5, z - 0.05], [x + s * 0.95, TOP - 0.5, z + 0.05], 0.06, 5); }
      K.box(WOOD, x - 1.15, x + 1.15, SEAT - 0.06, SEAT + 0.06, z - 0.42, z + 0.42);
      K.G.blob('soil', x, z, 1.5, 0.9, { y: 0.05, wobble: 0.3, seed: 6 });                                // worn bare by feet
      K.seat(x, SEAT, z, 0, 'sit on the swing');
    }
  }

  // ---- 7. A fairy ring in the meadow past the Overlook. Walk round it and it plays a scale. --------------------
  {
    const x = 38, z = -270, R = 3.6;
    put('c#4c7430/1', new THREE.RingGeometry(R - 0.42, R + 0.42, 40).rotateX(-Math.PI / 2), x, 0.065, z);                           // the darker grass a real ring leaves
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; mushroom(x + Math.cos(a) * R, z + Math.sin(a) * R, 1.25 + (i % 3) * 0.15, (i % 2 ? 0.08 : -0.06)); }
    for (let i = 0; i < 6; i++) { const a = ((i + 0.5) / 6) * TAU + 0.2, d = R + (K.r() - 0.5) * 0.6; mushroom(x + Math.cos(a) * d, z + Math.sin(a) * d, 0.5 + K.r() * 0.35, (K.r() - 0.5) * 0.3); }
    E.ring = { x, z, R };
  }
}

// ---- what answers back -----------------------------------------------------------------------------
export function eggsLife(ctx, K) {
  const E = K.eggs; if (!E) return;
  const { camera } = ctx, note = (...a) => ctx.sound?.note?.(...a), flash = t => ctx.flash?.(t);
  const SND = { old: () => { note(41, 0, 2.6, 0.12); note(48, 0.5, 2.2, 0.08); } };
  for (const th of E.things) ctx.interact.push({ x: th.x, y: th.y, z: th.z, reach: th.reach ?? 6.5, size: th.size, label: () => th.label, act: () => { SND[th.snd]?.(); flash(th.line); } });

  // the fairy ring: a note for each eighth of the way round; once all the way round, in either direction, and it says so
  if (E.ring) {
    const SCALE = [74, 76, 78, 79, 81, 83, 85, 86];
    let sector = -1, run = 0;
    ctx.animated.push(() => {
      const dx = camera.position.x - E.ring.x, dz = camera.position.z - E.ring.z;
      if (Math.abs(dx) > 9 || Math.abs(dz) > 9) return;
      const d = Math.hypot(dx, dz);
      if (d >= 7) { sector = -1; run = 0; return; }
      if (d <= 1.6) return;
      const i = Math.round(((Math.atan2(dz, dx) / TAU + 1) % 1) * 8) % 8;
      if (i === sector) return;
      const step = sector < 0 ? 0 : (i - sector + 8) % 8; run = step === 1 ? Math.max(1, run + 1) : step === 7 ? Math.min(-1, run - 1) : 0; sector = i; note(SCALE[i], 0, 1.6, 0.11);
      if (Math.abs(run) >= 8) { [86, 90, 93, 98].forEach((m, k) => note(m, 0.25 + k * 0.11, 1.8, 0.05)); flash('Once round the ring. Somewhere very small, somebody applauds.'); run = 0; }
    });
  }
}
