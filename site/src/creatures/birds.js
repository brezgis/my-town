// The street's birds (and the bats, who keep the same hours as the owl).
//
//   sparrows    on the pavement outside Tomorrow Bread, by day: hop and peck; all up to the string lights
//               if you come close, down again when you have gone. E by the paper bag: scatter crumbs, and
//               they come down to them, much bolder. At dusk they stay up on the wire.
//   the roost   nine more in a row on a string of lights further west, from late afternoon into the night:
//               they shuffle and look about; walk under them before dark and they move to the next string
//   blackbird   on the roof parapets by the coffee shop and the bakery: sings from the coping (most at
//               dusk), hops along it, flies across the street to the other roof
//   robin       on the Yard's notice board, by day: bobs, drops to the gravel for something, faces you;
//               stand still near it and it comes down to look at you. E: whistle to it.
//   barn owl    on a lamp pole at the back of the picture garden, at night: its head follows you
//   swallows    high over the street, late in the day and early in the morning
//   bats        round four of the street lamps, dusk into night
//
// Models: Poly Pizza, CC-BY 3.0 (see the credits). The swallows and the birds' flight wings are built in code.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { TAU, Walk, Flight, wingPair, flapping, splitHead, vcMat, tris, turnTo, wrapA, ease, clamp, rng } from './kit.js';

// a string of lights as street.js hangs it: n straight pieces under a parabola; u runs 0..n along it
const strand = (A, B, sag, n = 16) => {
  const P = (k, o) => { const t = k / n; o[0] = A[0] + (B[0] - A[0]) * t; o[1] = A[1] - sag * 4 * t * (1 - t); o[2] = A[2] + (B[2] - A[2]) * t; return o; }, a = [0, 0, 0], b = [0, 0, 0];
  const at = (u, o = [0, 0, 0]) => { const i = clamp(Math.floor(u), 0, n - 1), f = u - i; P(i, a); P(i + 1, b); o[0] = a[0] + (b[0] - a[0]) * f; o[1] = a[1] + (b[1] - a[1]) * f + 0.022; o[2] = a[2] + (b[2] - a[2]) * f; return o; };
  return { at, yaw: Math.atan2(B[0] - A[0], B[2] - A[2]) };
};

export function birds(kit) {
  const { ctx, K, day, cam, scene, mesh, tag, blocked, free, groundAt, dist, add, feet, plant, hour } = kit, r = rng(4242);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sv = new THREE.Vector3(), pv = new THREE.Vector3();
  const PAVE = 0.488, TOPW = 15.5, FX = 23.6;                 // the pavers' top; the string lights' ends (street.js: SHOPTOP + 0.9, FRONT - 0.4)

  // ---- sparrows: one instanced body and one instanced pair of wings per flock ----------------------------------
  const sparrows = async N => {
    const src = await mesh('v_sparrow', 1, 0x9c8873), fp = feet(src.geometry);      // (toned down: the model's buff is nearly cream in the street's light)
    const inst = tag(new THREE.InstancedMesh(src.geometry, src.material, N)); inst.frustumCulled = false; inst.name = 'sparrows';
    const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.09, 0, 0, -0.08, 0.36, 0, -0.1, 0, 0, 0.09, 0.36, 0, -0.1, 0.3, 0, 0.03], 3)); wg.computeVertexNormals(); wg.translate(0, 0.16, 0.02);
    const wingI = tag(new THREE.InstancedMesh(wg, new THREE.MeshStandardMaterial({ color: 0x8a6a48, roughness: 0.9, side: THREE.DoubleSide }), N * 2)); wingI.frustumCulled = false; wingI.name = 'sparrow wings';
    scene.add(inst, wingI);
    // b: { x, y, z, yaw, pitch, s, fly }: standing birds are planted by their feet at y, flying ones carried by their middle
    const draw = (i, b, t) => {
      e.set(b.pitch, b.yaw, 0, 'YXZ'); q.setFromEuler(e); pv.set(b.x, b.y, b.z); sv.setScalar(b.s); m4.compose(pv, q, sv);
      if (!b.fly) { const el = m4.elements; let lo = Infinity; for (let j = 0; j < fp.length; j += 3) { const v = el[1] * fp[j] + el[5] * fp[j + 1] + el[9] * fp[j + 2]; if (v < lo) lo = v; } el[13] = b.y - lo; }
      inst.setMatrixAt(i, m4);
      const beat = 0.2 + 1.0 * Math.sin(t * 28 + i);
      for (let side = 0; side < 2; side++) { e.set(b.pitch, b.yaw, side ? -beat : beat, 'YXZ'); q.setFromEuler(e); sv.set(side ? -1 : 1, 1, 1).multiplyScalar(b.fly ? b.s : 0); wingI.setMatrixAt(i * 2 + side, m4.compose(pv, q, sv)); }
    };
    // (the wings are only drawn while somebody is in the air)
    let shown = false, flew = false;
    const done = () => { inst.instanceMatrix.needsUpdate = true; wingI.visible = shown && flew; if (flew) wingI.instanceMatrix.needsUpdate = true; flew = false; };
    return { inst, wingI, draw: (i, b, t) => { if (b.fly) flew = true; draw(i, b, t); }, done, show: on => { shown = on; inst.visible = on; if (!on) wingI.visible = false; } };
  };
  const bird = () => ({ x: 0, y: 0, z: 0, yaw: 0, pitch: 0, s: 1, fly: false, mode: 'peck', t0: 0, T: 1, until: 0, ax: 0, ay: 0, az: 0, bx: 0, by: 0, bz: 0, then: 'peck', face: 0 });
  const flyTo = (b, x, y, z, t0, T, then) => { b.ax = b.x; b.ay = b.y; b.az = b.z; b.bx = x; b.by = y; b.bz = z; b.t0 = t0; b.T = T; b.mode = 'fly'; b.then = then; };
  // one frame of a flight; true when it has landed
  const flying = (b, t) => {
    const u = clamp((t - b.t0) / b.T, 0, 1), k = ease(u);
    if (u <= 0) return false;
    b.fly = true; b.x = b.ax + (b.bx - b.ax) * k; b.z = b.az + (b.bz - b.az) * k; b.y = b.ay + (b.by - b.ay) * k + 1.6 * Math.sin(Math.PI * u);
    b.yaw = Math.atan2(b.bx - b.ax, b.bz - b.az); b.pitch = -0.2;
    if (u >= 1) { b.fly = false; b.mode = b.then; b.pitch = 0; b.y = b.by; b.until = t + r(); return true; }
    return false;
  };

  // ---- The bakery's sparrows ---------------------------------------------------------------------
  {
    const N = 6, C = { x: -19.2, z: -66.5 }, A = { x0: -22.6, x1: -15.8, z0: -76.5, z1: -56.5 };       // the pavement in front of Tomorrow Bread
    const wire = strand([-FX, TOPW, -61], [FX, TOPW, -74], 3.6), W = [0, 0, 0];                         // the string of lights over it
    const inArea = (x, z) => x > A.x0 && x < A.x1 && z > A.z0 && z < A.z1 && !blocked(x, z, 0.35);
    const crumbs = { x: 0, z: 0, until: -1 };
    let F = null, state = 'down', calm = 0, now = 0, crumbMesh = null, bag = null; const B = [];
    const spot = (near) => {
      for (let k = 0; k < 40; k++) { const x = near ? near.x + (r() - 0.5) * 3 : A.x0 + r() * (A.x1 - A.x0), z = near ? near.z + (r() - 0.5) * 3 : A.z0 + r() * (A.z1 - A.z0); if (inArea(x, z)) return [x, z]; }
      return [-19, -70];
    };
    const feeding = () => now < crumbs.until;
    const member = add({
      name: 'sparrows', x: C.x, z: C.z, load: 150, live: 110, when: () => day.light > 0.3,
      init: async () => {
        F = await sparrows(N);
        for (let i = 0; i < N; i++) { const b = bird(), [x, z] = spot(); b.x = x; b.y = PAVE; b.z = z; b.yaw = r() * TAU; B.push(b); }
        // crumbs: a scatter of specks, one small mesh, shown where they were thrown
        const bits = []; for (let i = 0; i < 26; i++) { const a = r() * TAU, d = Math.sqrt(r()) * 1.5, g = new THREE.BoxGeometry(0.035, 0.02, 0.03); g.rotateY(r() * 3); g.translate(Math.cos(a) * d, 0.01, Math.sin(a) * d); bits.push(g); }
        crumbMesh = tag(new THREE.Mesh(mergeGeometries(bits), new THREE.MeshStandardMaterial({ color: 0xd9b98a, roughness: 1 }))); crumbMesh.visible = false; crumbMesh.name = 'crumbs'; scene.add(crumbMesh);
      },
      show: on => { F.show(on); if (!on) crumbMesh.visible = false; else crumbMesh.visible = feeding(); },
      think: t => {
        now = t; const roost = day.light < 0.62, fed = feeding(), R = fed ? 3.0 : 8;
        if (!fed && crumbMesh.visible) crumbMesh.visible = false;
        let near = false; for (const b of B) if (!b.fly && b.mode !== 'wire' && dist(b.x, b.z) < R) near = true;
        if (state === 'down' && (near || roost)) {                                             // all up to the string of lights
          state = 'up'; calm = 0;
          B.forEach((b, i) => { wire.at(2.5 + i, W); flyTo(b, W[0], W[1], W[2], t + r() * (near ? 0.3 : 5), 1.0 + r() * 0.5, 'wire'); b.face = wire.yaw + (i % 3 === 1 ? -1 : 1) * Math.PI / 2; });
          return;
        }
        if (state === 'up') {
          const off = Math.hypot(Math.max(0, Math.abs(cam.x - (A.x0 + A.x1) / 2) - (A.x1 - A.x0) / 2), Math.max(0, Math.abs(cam.z - (A.z0 + A.z1) / 2) - (A.z1 - A.z0) / 2));
          const quiet = fed ? dist(crumbs.x, crumbs.z) > 3.8 : off > 7;
          calm = quiet ? calm + 0.25 : 0;
          if (!roost && calm > (fed ? 1.5 : 7) && B.every(b => b.mode === 'wire')) { state = 'down'; B.forEach(b => { const [x, z] = spot(fed ? crumbs : null); flyTo(b, x, PAVE, z, t + r() * (fed ? 1.2 : 3), 1.2 + r() * 0.6, 'peck'); }); }
          else for (const b of B) if (b.mode === 'wire' && t > b.until) { b.until = t + 1 + r() * 3; b.yaw = b.face + (r() - 0.5) * 1.3; }
          return;
        }
        for (const b of B) {
          if (b.mode === 'fly' || t < b.until) continue;
          const k = r(), away = fed && Math.hypot(b.x - crumbs.x, b.z - crumbs.z) > 1.8;
          if (k < 0.4 && !away) { b.mode = 'peck'; b.until = t + 1 + r() * 2.5; }
          else if (k < 0.6 && !away) { b.mode = 'look'; b.until = t + 0.6 + r() * 1.5; b.yaw += (r() - 0.5) * 1.2; }
          else { const a = away ? Math.atan2(crumbs.x - b.x, crumbs.z - b.z) + (r() - 0.5) * 0.6 : b.yaw + (r() - 0.5) * 1.5, x = b.x + Math.sin(a) * 1.2, z = b.z + Math.cos(a) * 1.2;
            if (inArea(x, z)) { b.mode = 'hop'; b.ax = b.x; b.az = b.z; b.bx = x; b.bz = z; b.t0 = t; b.until = t + 0.6; } else b.yaw += 1.2; }
        }
      },
      tick: t => {
        for (let i = 0; i < N; i++) {
          const b = B[i];
          if (b.mode === 'fly') flying(b, t);
          else if (b.mode === 'hop') {                                                   // three little hops
            const u = clamp((t - b.t0) / 0.5, 0, 1); b.x = b.ax + (b.bx - b.ax) * u; b.z = b.az + (b.bz - b.az) * u; b.y = PAVE + 0.1 * Math.abs(Math.sin(Math.PI * u * 3)); b.yaw = Math.atan2(b.bx - b.ax, b.bz - b.az); b.pitch = 0;
            if (u >= 1) { b.mode = 'peck'; b.y = PAVE; b.until = t + 0.5 + r(); }
          } else if (b.mode === 'peck') { const u = (t * 2.6 + i * 0.7) % 1; b.pitch = u < 0.3 ? 0.7 * Math.sin(Math.PI * u / 0.3) : 0; }
          else b.pitch = b.mode === 'wire' ? 0.03 * Math.sin(t * 1.3 + i) : 0;
          F.draw(i, b, t);
        }
        F.done();
      },
      check: () => ({ state, all: B.map(b => ({ x: b.x, y: b.y, z: b.z, mode: b.mode })) }),
    });
    // the paper bag of crumbs somebody left by the planter, and what E does with it
    const bagAt = { x: -15.45, y: PAVE, z: -64.85 };
    add({
      name: 'crumb bag', x: bagAt.x, z: bagAt.z, load: 120, live: 90,
      init: async () => {
        // a kraft bag: the body, its top pinched in, and the top folded over
        const sack = new THREE.BoxGeometry(0.4, 0.66, 0.26, 1, 3, 1).translate(0, 0.33, 0), p = sack.attributes.position;
        for (let i = 0; i < p.count; i++) if (p.getY(i) > 0.6) p.setZ(i, p.getZ(i) * 0.3);
        const fold = new THREE.BoxGeometry(0.41, 0.12, 0.05).rotateX(0.5).translate(0, 0.63, 0.06);
        const body = mergeGeometries([sack.toNonIndexed(), fold.toNonIndexed()]); body.computeVertexNormals();
        bag = tag(new THREE.Mesh(body, new THREE.MeshStandardMaterial({ color: 0x94703f, roughness: 0.95 }))); bag.position.set(bagAt.x, bagAt.y, bagAt.z); bag.rotation.y = 0.5; bag.name = 'crumb bag'; scene.add(bag);
      },
      show: on => { bag.visible = on; },
    });
    ctx.interact.push({ x: bagAt.x, y: bagAt.y + 0.5, z: bagAt.z, reach: 9, size: 1.5, label: () => 'scatter a few crumbs', act: () => {
      if (!member.loaded || !member.on) { ctx.flash?.(day.light < 0.3 ? 'You scatter a few crumbs. No takers at this hour: the sparrows are asleep.' : 'You scatter a few crumbs.'); return; }
      // a little way in front of you, on the bakery's pavement
      const a = ctx.walker?.yaw ?? 0; let x = cam.x - Math.sin(a) * 5, z = cam.z - Math.cos(a) * 5;
      x = clamp(x, A.x0 + 1.2, A.x1 - 1.2); z = clamp(z, A.z0 + 1.5, A.z1 - 1.5);
      if (blocked(x, z, 0.6)) [x, z] = spot();
      crumbs.x = x; crumbs.z = z; crumbs.until = now + 50; crumbMesh.position.set(x, PAVE + 0.004, z); crumbMesh.rotation.y = r() * 6; crumbMesh.visible = true; calm = 0;
      ctx.flash?.(day.light < 0.62 ? 'You scatter a few crumbs. The sparrows look down from the wire. They have eaten.' : 'You scatter a few crumbs. Stand back a little and the sparrows will come.');
    } });
  }

  // ---- The roost: a row of sparrows on a string of lights, from late afternoon into the night -----------------------
  {
    const N = 9, wires = [strand([FX, TOPW, -126], [-FX, TOPW, -139], 3.6), strand([-FX, TOPW, -139], [FX, TOPW, -152], 3.6)], W = [0, 0, 0];
    let F = null, on = 0, calm = 9; const B = [];
    const slot = i => 3.5 + i;                                   // one bird between each pair of bulbs
    add({
      name: 'sparrow roost', x: 0, z: -136, load: 170, live: 130, when: () => day.light < 0.8 && (hour() >= 15 || hour() < 6.5),
      init: async () => {
        F = await sparrows(N);
        for (let i = 0; i < N; i++) { const b = bird(); wires[0].at(slot(i), W); b.x = W[0]; b.y = W[1]; b.z = W[2]; b.face = b.yaw = wires[0].yaw + (i % 4 === 2 ? -1 : 1) * Math.PI / 2; b.mode = 'wire'; B.push(b); }
      },
      show: v => F.show(v),
      think: t => {
        const asleep = day.light < 0.12; calm += 0.25;
        wires[on].at(8, W);
        if (!asleep && calm > 6 && Math.hypot(cam.x - W[0], cam.z - W[2]) < 9 && B.every(b => b.mode === 'wire')) {      // she walks under them: off to the next string
          on = 1 - on; calm = 0;
          B.forEach((b, i) => { wires[on].at(slot(i), W); flyTo(b, W[0], W[1], W[2], t + r() * 0.5, 1.3 + r() * 0.6, 'wire'); b.face = wires[on].yaw + (i % 4 === 2 ? -1 : 1) * Math.PI / 2; });
          return;
        }
        for (const b of B) if (b.mode === 'wire' && t > b.until) { b.until = t + (asleep ? 6 : 1.5) + r() * 4; b.yaw = b.face + (asleep ? 0 : (r() - 0.5) * 1.4); b.s = asleep ? 1.08 : 1; }
      },
      tick: t => {
        for (let i = 0; i < N; i++) { const b = B[i]; if (b.mode === 'fly') flying(b, t); else b.pitch = 0.03 * Math.sin(t * 1.1 + i * 1.7); F.draw(i, b, t); }
        F.done();
      },
      check: () => ({ on, all: B.map(b => ({ x: b.x, y: b.y, z: b.z, mode: b.mode })) }),
    });
  }

  // ---- Blackbird on the roof parapets: sings, hops along the coping, crosses the street -------------------------
  {
    // the coping of the front parapet (town.js: top + 1.6 + 0.22 over a one-storey flat; x from FRONT - 0.1 to FRONT + 0.55)
    const Y = 14.6 + 11.5 + 1.82, roofs = [{ x: 24.22, z0: -52.5, z1: -27.5, out: -Math.PI / 2 }, { x: -24.22, z0: -76, z1: -56, out: Math.PI / 2 }];      // coffee; the bakery
    let o, fp, wings, w, fl, at = 0, state = 'look', until = 0, act = 0, look = 0;
    add({
      name: 'blackbird', x: 0, z: -52, load: 230, live: 190, when: () => day.light > 0.12,
      init: async () => {
        const body = await mesh('v_blackbird'); fp = feet(body.geometry); o = new THREE.Group(); o.add(body); wings = wingPair(1.25, 0.3, 0x1c1a18, 0x0c0b0a, [0, 0.36, 0]); o.add(wings);
        o.position.set(roofs[0].x, Y, -40); o.rotation.y = roofs[0].out; plant(o, fp, Y); scene.add(o); w = new Walk(o); w.base = Y; fl = new Flight(o);
      },
      show: on => { o.visible = on; },
      think: t => {
        if (state === 'fly' || w.busy || t < until) return;
        const k = r(), R = roofs[at], evening = day.light < 0.8;
        if (k < (evening ? 0.5 : 0.25)) { state = 'sing'; act = t; until = t + 4 + r() * 5; look = (r() - 0.5) * 0.5; }
        else if (k < 0.62) { state = 'look'; until = t + 1.5 + r() * 2.5; look = (r() - 0.5) * 1.6; }
        else if (k < 0.9) { state = 'hop'; const z = clamp(o.position.z + (r() < 0.5 ? -1 : 1) * (1.5 + r() * 3.5), R.z0, R.z1); w.go([[R.x, Y, z]], 2.4, 0.12, 0.5, 12, Y); }
        else { at = 1 - at; const N2 = roofs[at]; state = 'fly'; fl.go(N2.x, Y, N2.z0 + r() * (N2.z1 - N2.z0), 3.4, 2.5); }
      },
      tick: (t, dt) => {
        if (state === 'fly') { const u = fl.step(dt); wings.visible = true; wings.userData.flap(u > 0.85 ? 0.9 : 0.3 + 0.9 * Math.sin(t * 20)); if (!fl.busy) { wings.visible = false; o.rotation.set(0, o.rotation.y, 0); state = 'look'; until = t + 2; w.base = Y; plant(o, fp, Y); } return; }
        if (w.step(dt)) { o.rotation.x = 0.06; plant(o, fp, Y, w.lift); return; }
        if (state === 'hop') state = 'look';
        o.rotation.y = turnTo(o.rotation.y, roofs[at].out + look, dt * 5);
        o.rotation.x = state === 'sing' ? -0.3 + 0.05 * Math.sin((t - act) * 11) * (Math.sin((t - act) * 1.9) > -0.3 ? 1 : 0) : 0;      // beak up, the throat going
        plant(o, fp, Y);
      },
      check: () => ({ x: o.position.x, y: o.position.y, z: o.position.z, state }),
    });
  }

  // ---- Robin on the Yard's notice board ----------------------------------------------------------------------
  {
    // the board's green cap (places.js): x -26.2, plan Y 111.2 to 117.2, its top at CURB + 7.2
    const BX = -26.2, TOP = 7.7, perches = [[BX, TOP, -112.5], [BX, TOP, -115.9]], GRAVEL = 0.52;
    const inYard = (x, z) => x < -24.4 && x > -90 && z < -79 && z > -117.5;
    const level = (x, z) => (inYard(x, z) ? GRAVEL : groundAt(x, z));
    let o, fp, wings, fl, state = 'perch', then = 'perch', standY = TOP, until = 0, bobAt = -9, look = 0, pecks = 0, peckAt = 0, pi = 0, still = 0, lx = 0, lz = 0, visitT = 0, called = false, now = 0;
    const item = { x: BX, y: -500, z: -114.2, reach: 24, size: 2.6, label: () => 'whistle to the robin', act: () => {
      ctx.sound?.chirp?.([67, 72, 71, 76], 0.05); called = true; bobAt = now + 0.5;
      ctx.flash?.('You whistle. The robin tilts its head, and answers.'); setTimeout(() => ctx.sound?.chirp?.([79, 84, 81, 88, 84], 0.04), 900);
    } };
    ctx.interact.push(item);
    const flyTo = (x, y, z, T, lift, next) => { fl.go(x, y, z, T, lift); then = next; state = 'fly'; standY = y; };
    const home = () => { pi = r() < 0.7 ? pi : 1 - pi; const p = perches[pi]; flyTo(p[0], p[1], p[2], 1.0, 0.8, 'perch'); };
    // a free spot on the ground about five feet from her, on the robin's side
    const beside = () => {
      const d = Math.hypot(BX - cam.x, perches[0][2] - cam.z) || 1;
      for (let k = 0; k < 8; k++) { const a = Math.atan2(BX - cam.x, perches[0][2] - cam.z) + (k ? (r() - 0.5) * 2.2 : 0), x = cam.x + Math.sin(a) * Math.min(5, d * 0.6), z = cam.z + Math.cos(a) * Math.min(5, d * 0.6); if (free(x, z, 0.5)) return [x, z]; }
      return null;
    };
    add({
      name: 'robin', x: BX, z: -114, load: 130, live: 95, when: () => day.light > 0.3,
      init: async () => {
        const body = await mesh('v_robin'); fp = feet(body.geometry); o = new THREE.Group(); o.add(body); wings = wingPair(0.72, 0.17, 0x6e5a42, 0x4a3a2a, [0, 0.2, 0]); o.add(wings);
        o.position.set(...perches[0]); o.rotation.y = Math.PI / 2; plant(o, fp, TOP); scene.add(o); fl = new Flight(o); lx = cam.x; lz = cam.z;
      },
      show: on => { o.visible = on; item.y = on ? TOP + 0.3 : -500; },
      think: t => {
        now = t; const p = o.position, d = dist(p.x, p.z);
        still = Math.hypot(cam.x - lx, cam.z - lz) < 0.2 ? still + 0.25 : 0; lx = cam.x; lz = cam.z;
        if (state === 'fly') return;
        if (state === 'visit') { if (d < 2.6 || d > 16 || t > visitT) home(); return; }
        if (state === 'forage') { if (d < 6) { home(); return; } if (pecks <= 0 && t > until) home(); return; }
        // on the board: she whistled, or has stood still close by for a while: down to have a look at her
        if ((called || still > 3.5) && d < 24 && d > 6) { const s = beside(); called = false; still = 0; if (s) { flyTo(s[0], level(s[0], s[1]), s[1], 1.3, 1.0, 'visit'); visitT = t + 22; return; } }
        if (t < until) return;
        if (r() < 0.14 && d > 12) {                                                      // down to the gravel for something
          for (let k = 0; k < 6; k++) { const x = -33.5 + r() * 5, z = -117 + r() * 7.5; if (free(x, z, 0.4)) { flyTo(x, GRAVEL, z, 0.9, 0.5, 'forage'); return; } }
        }
        if (r() < 0.5) bobAt = t; else look = (r() - 0.5) * 1.6;
        until = t + 1.5 + r() * 3;
      },
      tick: (t, dt) => {
        if (state === 'fly') {
          const u = fl.step(dt); wings.visible = true; wings.userData.flap(u > 0.8 ? 0.9 : 0.3 + 0.9 * Math.sin(t * 30));
          if (!fl.busy) { state = then; wings.visible = false; o.rotation.x = 0; if (state === 'forage') { pecks = 3 + Math.floor(r() * 3); peckAt = t; } until = t + 0.8; bobAt = t + 0.3; plant(o, fp, standY); }
          return;
        }
        if (state === 'forage') { const u = (t - peckAt) % 0.9; o.rotation.x = u < 0.25 ? 0.6 * Math.sin(Math.PI * u / 0.25) : 0; if (t - peckAt > 0.9) { pecks--; peckAt = t; } plant(o, fp, standY); return; }
        const toHer = Math.atan2(cam.x - o.position.x, cam.z - o.position.z), close = dist(o.position.x, o.position.z) < 14;
        o.rotation.y = turnTo(o.rotation.y, state === 'visit' || close ? toHer + (state === 'visit' ? 0.5 * Math.sin(Math.floor(t * 0.7) * 2.1) : 0) : Math.PI / 2 + look, dt * 6);
        const u = (state === 'visit' ? t % 2.3 : t - bobAt); o.rotation.x = u >= 0 && u < 0.3 ? -0.25 * Math.sin(Math.PI * u / 0.3) : 0;     // the robin's bob and tail flick
        plant(o, fp, standY);
      },
      check: () => ({ x: o.position.x, y: o.position.y, z: o.position.z, state }),
    });
  }

  // ---- Barn owl on a pole at the back of the picture garden, at night: its head follows you ----------------
  {
    const P = [70, 13.0, -110.8], yaw0 = Math.atan2(55 - P[0], -98 - P[2]);           // (places.js: the lawn's light poles are 13 ft); it faces the deck chairs
    let o, head, hy = 0, hp = 0, scanAt = 0, scan = 0;
    add({
      name: 'owl', x: P[0], z: P[2], load: 150, live: 120, when: () => day.night > 0.5,
      init: async () => {
        const src = await mesh('v_owl_barn'), g = src.geometry; g.computeBoundingBox(); const neck = g.boundingBox.max.y * 0.66;
        const [bodyG, headG] = splitHead(g, (x, y) => y > neck, [0, neck, -0.02]);
        const mat = src.material.clone(); mat.emissive = new THREE.Color(0x2a2620); mat.emissiveMap = mat.map; mat.emissiveIntensity = 0.5;      // pale in the dark, as a barn owl is
        o = new THREE.Group(); const body = tag(new THREE.Mesh(bodyG, mat)); head = tag(new THREE.Mesh(headG, mat)); head.position.set(0, neck, -0.02); o.add(body, head);
        o.position.set(P[0], P[1], P[2]); o.rotation.y = yaw0; plant(o, feet(bodyG), P[1]); o.name = 'owl'; scene.add(o);
      },
      show: on => { o.visible = on; },
      tick: (t, dt) => {
        const dx = cam.x - o.position.x, dz = cam.z - o.position.z, d = Math.hypot(dx, dz);
        let want = scan, pitch = 0.15;
        if (d < 60) { want = clamp(wrapA(Math.atan2(dx, dz) - yaw0), -2.2, 2.2); pitch = clamp(Math.atan2(o.position.y + 1 - cam.y, d), -0.3, 0.7); }
        else if (t > scanAt) { scanAt = t + 3 + r() * 4; scan = (r() - 0.5) * 2.4; }
        hy = turnTo(hy, want, dt * 2.6); hp += (pitch - hp) * Math.min(1, dt * 3);
        head.rotation.set(hp, hy, 0.08 * Math.sin(t * 0.4), 'YXZ');
      },
      check: () => ({ x: o.position.x, y: o.position.y, z: o.position.z }),
    });
  }

  // ---- Swallows over the street, late in the day and early --------------------------------------------------
  {
    // (above the street trees, 27 ft, and between the tall fronts, never over a roof)
    const N = 6, uT = { value: 0 }, cz = -92; let inst;
    const swX = (s, ph) => 15 * Math.sin(s * 1.3 + ph) + 6 * Math.sin(s * 2.9 + ph * 2), swZ = (s, ph) => cz + 88 * Math.cos(s * 0.5 + ph) + 14 * Math.cos(s * 1.7);
    add({
      name: 'swallows', x: 0, z: cz, load: 400, live: 400, when: () => day.light > 0.3 && (hour() >= 15 || hour() < 9),
      init: async () => {
        const top = 0x1c2440, belly = 0xe8e0cc, red = 0x8a2a1a;
        const body = tris([[[0, 0.03, 0.12], [-0.035, 0, 0.02], [0.035, 0, 0.02]], [[0, 0.03, 0.12], [0.035, 0, 0.02], [0, 0.02, -0.1]], [[0, 0.03, 0.12], [0, 0.02, -0.1], [-0.035, 0, 0.02]], [[-0.035, 0, 0.02], [0, 0.02, -0.1], [0.035, 0, 0.02]]], top);
        const under = tris([[[0, -0.025, 0.11], [0.035, 0, 0.02], [-0.035, 0, 0.02]], [[0, -0.025, 0.11], [-0.035, 0, 0.02], [0, -0.01, -0.1]], [[0, -0.025, 0.11], [0, -0.01, -0.1], [0.035, 0, 0.02]]], (x, y, z) => (z > 0.07 ? red : belly));
        const wingsG = tris([[[-0.03, 0.01, 0.07], [-0.03, 0.01, -0.03], [-0.5, 0.01, -0.12]], [[-0.03, 0.01, 0.07], [-0.5, 0.01, -0.12], [-0.27, 0.01, 0.06]], [[0.03, 0.01, 0.07], [0.5, 0.01, -0.12], [0.03, 0.01, -0.03]], [[0.03, 0.01, 0.07], [0.27, 0.01, 0.06], [0.5, 0.01, -0.12]]], top);
        const tail = tris([[[-0.01, 0.015, -0.09], [-0.1, 0.015, -0.36], [0.0, 0.015, -0.16]], [[0.01, 0.015, -0.09], [0.0, 0.015, -0.16], [0.1, 0.015, -0.36]]], top);
        const geo = mergeGeometries([body, under, wingsG, tail]); geo.scale(1.25, 1.25, 1.25);
        inst = tag(new THREE.InstancedMesh(geo, flapping(vcMat({ side: THREE.DoubleSide }), uT, 0.7, 13, 1), N)); inst.frustumCulled = false; inst.name = 'swallows'; scene.add(inst);
      },
      show: on => { inst.visible = on; },
      tick: t => {
        uT.value = t;
        for (let i = 0; i < N; i++) {
          const ph = i * 1.37, a = t * 0.3 + ph * 3;
          const x = swX(a, ph), z = swZ(a, ph), y = 35 + 6 * Math.sin(a * 1.1 + ph), x1 = swX(a + 0.02, ph), z1 = swZ(a + 0.02, ph), x2 = swX(a + 0.04, ph), z2 = swZ(a + 0.04, ph);
          const h0 = Math.atan2(x1 - x, z1 - z), h1 = Math.atan2(x2 - x1, z2 - z1);
          e.set(0.15 * Math.sin(a * 1.1 + ph), h0, clamp(wrapA(h1 - h0) * -12, -0.9, 0.9), 'YXZ'); q.setFromEuler(e); pv.set(x, y, z); sv.setScalar(1);
          inst.setMatrixAt(i, m4.compose(pv, q, sv));
        }
        inst.instanceMatrix.needsUpdate = true;
      },
    });
  }

  // ---- Bats round the street lamps, dusk into night ------------------------------------------------------------
  {
    // four lamps that stand clear of the street trees (street.js: posts at x 13.1, globes 11 ft up; the string lights pass at 13)
    const lamps = [[13.1, -106], [-13.1, -85], [13.1, -148], [-13.1, 42]], N = lamps.length, uT = { value: 0 };
    const batX = (L, i, s) => L[0] * 0.72 + 6.5 * (Math.sin(s) + 0.3 * Math.sin(s * 2.7 + i)), batZ = (L, i, s) => L[1] + 7.5 * (Math.sin(s * 2 + i) * 0.6 + 0.4 * Math.cos(s * 1.3));      // a lopsided figure of eight, mostly over the road
    let inst;
    add({
      name: 'bats', x: 0, z: -80, load: 400, live: 400, when: () => day.light < 0.66 && (hour() >= 15 || hour() < 7),
      init: async () => {
        const src = await mesh('v_bat', 1.0, 0x6a5240); inst = tag(new THREE.InstancedMesh(src.geometry, flapping(src.material, uT, 0.75, 19), N));
        inst.frustumCulled = false; inst.name = 'bats'; scene.add(inst);
      },
      show: on => { inst.visible = on; },
      tick: t => {
        uT.value = t;
        for (let i = 0; i < N; i++) {
          const L = lamps[i], a = t * 0.62 + i * 2.1, b = a + 0.05;
          const x = batX(L, i, a), z = batZ(L, i, a), y = 17.2 + 1.6 * Math.sin(a * 1.9) + 0.5 * Math.sin(a * 7.3), vx = batX(L, i, b) - x, vz = batZ(L, i, b) - z;
          e.set(0.1, Math.atan2(vx, vz), 0.3 * Math.sin(a * 2.2), 'YXZ'); q.setFromEuler(e); pv.set(x, y, z); sv.setScalar(1);
          inst.setMatrixAt(i, m4.compose(pv, q, sv));
        }
        inst.instanceMatrix.needsUpdate = true;
      },
    });
  }
}
