// The street's four-footed animals.
//
//   squirrel   on the ring bench round the Yard's oak, by day: bounds along it, freezes, flicks its tail;
//              up the trunk if you come near, and peers round at you until you have gone
//   hedgehog   along the foot of the hedge in the picture garden, dusk and night: snuffles, roots about;
//              curls up if you come close
//   rabbits    two on the lawn just beyond the Overlook's rail, by day: graze, hop, sit up and watch you;
//              bolt into the long grass if you come down to them, and come back when it is quiet
//   hare       by the last bench at the edge, dusk and night: sits up, watches, lollops off
//   fox        along the back lawns (behind the Yard, or behind the grocer and Frond), at night: trots,
//              sniffs, sits, turns to look at you; slips away if approached
//   tortoise   crossing the churchyard, by day, very slowly: head in if you come close
//   mouse      among the pickle barrels in Pickle Alley, dusk and night: darts along the foot of the
//              grocer's wall, freezes, washes; behind the barrels if you come close
//
// Models: Poly Pizza, CC-BY 3.0; the fox is Quaternius, CC0 (see the credits).

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FT, TAU, Walk, splitHead, vcMat, turnTo, wrapA, clamp, clamp01, rng } from './kit.js';

export function beasts(kit) {
  const { day, cam, scene, mesh, glb, tag, free, clear, onIsland, groundAt, dist, dist3, add, feet, plant } = kit, r = rng(31337);
  const LAWN = 0.03, PAVE = 0.488;

  // ---- The squirrel on the oak's ring bench ----------------------------------------------------------------
  // (places.js: the bench is three rings of rails, twelve-sided, at 4.3, 5.0 and 5.7 ft from the oak at (-52, -98),
  // their tops 2.21 ft up. trees.js: the trunk is 2.3 ft thick at 1.4 ft and 1.66 at 11.5, leaning a little.)
  {
    const ox = -52, oz = -98, PL = 5.0, IN = 4.3, SEAT = 2.21, NG = 12, SA = TAU / NG;
    const tr = rng(77), lx0 = (tr() - 0.5) * 0.22, lz0 = (tr() - 0.5) * 0.22, ln = Math.hypot(lx0, 1, lz0), lean = [lx0 / ln, 1 / ln, lz0 / ln];      // the oak's lean, as trees.js draws it (seed 77)
    const bark = y => (2.3 - 0.644 * clamp01((y - 1.4) / (10.12 * lean[1]))) * 0.955, axX = y => ox + lean[0] / lean[1] * (y - 1.4), axZ = y => oz + lean[2] / lean[1] * (y - 1.4);
    const vx = (rr, k) => ox + Math.cos(k * SA) * rr, vz = (rr, k) => oz + Math.sin(k * SA) * rr, per = rr => NG * 2 * rr * Math.sin(SA / 2);
    const side = a => { const u = ((a % SA) + SA) % SA; return Math.cos(SA / 2) / Math.cos(u - SA / 2); };      // a rail's middle at angle a, as a share of its corner radius
    let o = null, fp = null, s = 0, aim = 0, state = 'sit', until = 0, flickAt = -9, safe = 0, lift = 0, ph = 0, h = 0, rad = PL, ang = 0;
    const X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3(), M = new THREE.Matrix4();
    const onRail = (rr, ss) => { const L = per(rr) / NG, u = ((ss % per(rr)) + per(rr)) % per(rr), k = Math.floor(u / L), f = u / L - k; o.position.x = vx(rr, k) + (vx(rr, k + 1) - vx(rr, k)) * f; o.position.z = vz(rr, k) + (vz(rr, k + 1) - vz(rr, k)) * f; return Math.atan2(vx(rr, k + 1) - vx(rr, k), vz(rr, k + 1) - vz(rr, k)); };
    const onBark = (y, down) => {                                                  // belly to the bark, nose up (or down)
      const cx = Math.cos(ang), cz = Math.sin(ang), rr = bark(y);
      o.position.set(axX(y) + cx * rr, y, axZ(y) + cz * rr);
      Y.set(cx, 0, cz); Z.set(0, down ? -1 : 1, 0); X.crossVectors(Y, Z); o.quaternion.setFromRotationMatrix(M.makeBasis(X, Y, Z));
    };
    add({
      name: 'squirrel', x: ox, z: oz, load: 140, live: 100, when: () => day.light > 0.3,
      init: async () => { o = await mesh('v_squirrel', 1.0, 0xd08a5a); fp = feet(o.geometry); s = per(PL) * 0.36; o.rotation.set(0, onRail(PL, s), 0); plant(o, fp, SEAT); scene.add(o); },
      show: on => { o.visible = on; },
      think: (t) => {
        const near = dist(o.position.x, o.position.z) < 12;
        if (near && (state === 'sit' || state === 'freeze' || state === 'run')) { state = 'in'; ang = Math.atan2(o.position.z - oz, o.position.x - ox); rad = Math.hypot(o.position.x - ox, o.position.z - oz); return; }
        if (state === 'up') { safe = near || dist(ox, oz) < 17 ? 0 : safe + 0.25; if (safe > 10) state = 'down'; return; }
        if ((state !== 'sit' && state !== 'freeze') || t < until) return;
        const k = r();
        if (k < 0.35) { state = 'run'; aim = s + (r() < 0.5 ? -1 : 1) * (2 + r() * 6); const L = per(PL) / NG, f = ((aim % L) + L) % L; if (f < 0.4) aim += 0.4 - f; else if (f > L - 0.4) aim -= f - (L - 0.4); }
        else if (k < 0.75) { state = 'sit'; until = t + 3 + r() * 5; }
        else { state = 'freeze'; until = t + 2 + r() * 3; }
        if (r() < 0.5) flickAt = t + r() * 1.5;
      },
      tick: (t, dt) => {
        if (state === 'run') {                                                     // a low bounding run along the rail
          const sp = 4.5 * dt, left = aim - s; s += Math.sign(left) * Math.min(Math.abs(left), sp); ph += sp / 0.55;
          const dir = onRail(PL, s) + (left < 0 ? Math.PI : 0);
          o.rotation.set(-0.12 * Math.sin(TAU * ph), turnTo(o.rotation.y, dir, dt * 14), 0);
          lift = 0.1 * Math.abs(Math.sin(Math.PI * ph)); plant(o, fp, SEAT, lift);
          if (Math.abs(aim - s) < 1e-3) { lift = 0; ph = 0; state = 'freeze'; until = t + 1.5 + r() * 2; o.rotation.x = 0; plant(o, fp, SEAT); }
          return;
        }
        if (state === 'in' || state === 'out') {                                   // bound across the rails, in to the trunk or back out
          const sp = 4 * dt, inward = state === 'in', rin = IN * side(ang), rpl = PL * side(ang); rad = inward ? Math.max(rin, rad - sp) : Math.min(rpl, rad + sp); ph += sp / 0.4;
          o.position.x = ox + Math.cos(ang) * rad; o.position.z = oz + Math.sin(ang) * rad;
          o.rotation.set(-0.12 * Math.sin(TAU * ph), turnTo(o.rotation.y, Math.atan2((inward ? -1 : 1) * Math.cos(ang), (inward ? -1 : 1) * Math.sin(ang)), dt * 14), 0);
          lift = 0.1 * Math.abs(Math.sin(Math.PI * ph)); plant(o, fp, SEAT, lift);
          if (inward && rad <= rin) { state = 'leap'; h = 0; lift = 0; }
          if (!inward && rad >= rpl) { lift = 0; ph = 0; const a = ((ang / SA) % NG + NG) % NG; s = a * per(PL) / NG; onRail(PL, s); state = 'freeze'; until = t + 2; o.rotation.x = 0; plant(o, fp, SEAT); }
          return;
        }
        if (state === 'leap' || state === 'drop') {                                // the jump between the inner rail and the bark
          h = Math.min(1, h + dt / 0.3); const u = state === 'leap' ? h : 1 - h, y1 = SEAT + 1.1, ca = Math.cos(ang), sa = Math.sin(ang);
          const r0 = IN * side(ang), y = SEAT + (y1 - SEAT) * u + 0.35 * Math.sin(Math.PI * h);
          const bx = axX(y1) + ca * bark(y1), bz = axZ(y1) + sa * bark(y1), sx = ox + ca * r0, sz = oz + sa * r0;
          o.position.set(sx + (bx - sx) * u, y, sz + (bz - sz) * u);
          Y.set(0, 1, 0).lerp(Z.set(ca, 0, sa), u); Y.normalize(); Z.set(-ca, 0, -sa).lerp(X.set(0, state === 'drop' ? -1 : 1, 0), u).normalize();
          X.crossVectors(Y, Z); Z.crossVectors(X, Y); o.quaternion.setFromRotationMatrix(M.makeBasis(X, Y, Z));           // turning from the rail to the bark in the air
          if (h >= 1) { if (state === 'leap') { state = 'climb'; h = y1; } else { state = 'out'; rad = r0; o.rotation.set(0, Math.atan2(ca, sa), 0); plant(o, fp, SEAT); } }
          return;
        }
        if (state === 'climb' || state === 'down') {                               // up the trunk in bounds; down head first
          ph += dt * 3.2; const go = Math.max(0, Math.sin(TAU * ph)) * 3.4 * dt;
          h += state === 'climb' ? go : -go;
          onBark(h, state === 'down');
          if (state === 'climb' && h >= 8.6) { state = 'up'; safe = 0; }
          if (state === 'down' && h <= SEAT + 1.1) { state = 'drop'; h = 0; }
          return;
        }
        if (state === 'up') {                                                      // clinging on the far side from her, peering round
          const hide = Math.atan2(oz - cam.z, ox - cam.x) + 1.25 * Math.sin(t * 0.35); ang = turnTo(ang, hide, dt * 1.2);
          onBark(h, false); o.rotateY(0.3 * Math.sin(t * 0.5)); return;
        }
        // sitting or frozen on the rail: a flick of the tail now and then; when frozen it watches her
        const f = t - flickAt; o.rotation.x = f > 0 && f < 0.3 ? -0.1 * Math.sin(Math.PI * f / 0.3) : 0;
        if (state === 'freeze' && dist(o.position.x, o.position.z) < 34) o.rotation.y = turnTo(o.rotation.y, Math.atan2(cam.x - o.position.x, cam.z - o.position.z), dt * 4);
        plant(o, fp, SEAT);
      },
      check: () => ({ x: o.position.x, y: o.position.y, z: o.position.z, state }),
    });
  }

  // ---- Hedgehog in the picture garden, after dark: along the foot of the hedge by the screen's side --------------
  {
    const box = { x0: 39, x1: 68, z0: -88.2, z1: -87.2 }, GY = 0.075;               // (the garden's lawn lies a little above the island's)
    let o, w, fp, state = 'root', until = 0, curl = 0, safe = 0;
    add({
      name: 'hedgehog', x: 54, z: -88, load: 130, live: 90, when: () => day.light < 0.66,
      init: async () => {
        o = await mesh('v_hedgehog', 1.15, 0xffffff); o.material.color.setRGB(1.7, 1.55, 1.35);       /* paler spines and face, to read at dusk */ fp = feet(o.geometry);
        o.position.set(57, GY, -87.7); o.rotation.y = -Math.PI / 2; plant(o, fp, GY); scene.add(o); w = new Walk(o); w.base = GY;
      },
      show: on => { o.visible = on; },
      think: t => {
        const d = dist(o.position.x, o.position.z);
        if (d < 5.5) { if (state !== 'curl') { state = 'curl'; w.stop(); } safe = 0; return; }
        if (state === 'curl') { safe = d > 8.5 ? safe + 0.25 : 0; if (safe >= 4) { state = 'root'; until = t + 3; } return; }
        if (w.busy || t < until) return;
        if (r() < 0.55) { const p = o.position, x = clamp(p.x + (r() < 0.5 ? -1 : 1) * (2 + r() * 6), box.x0, box.x1), z = box.z0 + r() * (box.z1 - box.z0); if (clear(p.x, p.z, x, z, 0.35)) { w.go([[x, GY, z]], 0.45, 0, 1, 1.2, GY); state = 'walk'; } }
        else { state = 'root'; until = t + 3 + r() * 6; }
      },
      tick: (t, dt) => {
        curl += ((state === 'curl' ? 1 : 0) - curl) * Math.min(1, dt * 3);
        let pitch = 0, roll = 0;
        if (state === 'walk') { if (w.step(dt)) { roll = 0.035 * Math.sin(t * 8); pitch = 0.02 * Math.sin(t * 16); } else state = 'root'; }
        else if (state === 'root') pitch = 0.07 + 0.03 * Math.sin(t * 13) * (Math.sin(t * 1.1) > 0 ? 1 : 0.2);        // nose down, snuffling
        o.rotation.x = pitch * (1 - curl) + curl * 0.2; o.rotation.z = roll; o.scale.set(1, 1 - 0.15 * curl, 1 - 0.1 * curl);
        plant(o, fp, GY);
      },
      check: () => ({ x: o.position.x, y: o.position.y, z: o.position.z, state }),
    });
  }

  // ---- Two rabbits on the lawn beyond the Overlook's rail, by day -------------------------------------------------
  {
    const fields = [{ x0: -30, x1: -13, hide: [-43, -252] }, { x0: 13, x1: 30, hide: [44, -254] }], Z0 = -243.6, Z1 = -238.9;
    for (let n = 0; n < 2; n++) {
      const F = fields[n], x0 = n ? 21 : -22, z0 = -241;
      let o, w, fp, state = 'graze', until = 0, gone = false, back = 0, face = r() * TAU, look = face;
      add({
        name: 'rabbit' + (n + 1), x: x0, z: z0, load: 150, live: 110, when: () => day.light > 0.2,
        init: async () => { o = await mesh('v_rabbit', 1.0, n ? 0xd0c0a8 : 0xffffff); fp = feet(o.geometry); o.position.set(x0, LAWN, z0); o.rotation.y = face; plant(o, fp, LAWN); scene.add(o); w = new Walk(o); w.base = LAWN; },
        show: on => { o.visible = on && !gone; },
        think: t => {
          const p = o.position, d = dist(p.x, p.z);
          if (gone) { back += 0.25; if (back > 35 && dist(x0, z0) > 24) { gone = false; o.visible = true; const x = F.x0 + r() * (F.x1 - F.x0); o.position.set(F.hide[0], LAWN, F.hide[1]); w.go([[x, LAWN, Z0 + r() * (Z1 - Z0)]], 3.2, 0.25, 1.1, 6, LAWN); state = 'hop'; } return; }
          if (d < 10 && state !== 'bolt') { w.go([[F.hide[0] + (r() - 0.5) * 4, LAWN, F.hide[1] + (r() - 0.5) * 6]], 9, 0.4, 2.6, 10, LAWN); state = 'bolt'; return; }
          if (state === 'bolt') { if (!w.busy) { gone = true; back = 0; o.visible = false; } return; }
          if (w.busy || t < until) return;
          const k = r();
          if (d < 24 && k < 0.6) { state = 'up'; until = t + 2 + r() * 2; }                                    // it has seen her
          else if (k < 0.5) { state = 'graze'; until = t + 3 + r() * 6; }
          else if (k < 0.7) { state = 'up'; until = t + 2 + r() * 2; look = face + (r() - 0.5) * 0.9; }
          else { const a = face + (r() - 0.5) * 1.6, x = clamp(p.x + Math.sin(a) * 2.5, F.x0, F.x1), z = clamp(p.z + Math.cos(a) * 2.5, Z0, Z1); w.go([[x, LAWN, z]], 1.8, 0.22, 0.85, 6, LAWN); state = 'hop'; }
        },
        tick: (t, dt) => {
          if (w.step(dt)) { o.rotation.x = -0.1 * Math.sin(Math.PI * w.ph); plant(o, fp, LAWN, w.lift); return; }
          if (state === 'hop') { state = 'graze'; face = look = o.rotation.y; }
          const want = state === 'up' && dist(o.position.x, o.position.z) < 45 ? Math.atan2(cam.x - o.position.x, cam.z - o.position.z) : look;
          const ny = turnTo(o.rotation.y, want, dt * 1.6), turning = Math.abs(ny - o.rotation.y) > 1e-4; o.rotation.y = ny;
          o.rotation.x += ((state === 'up' ? -0.32 : 0.14 + 0.04 * Math.max(0, Math.sin(t * 10 + n))) - o.rotation.x) * Math.min(1, dt * 5);
          plant(o, fp, LAWN, turning ? 0.03 * Math.abs(Math.sin(t * 14 + n)) : 0);
        },
        check: () => ({ x: o.position.x, y: o.position.y, z: o.position.z, state, hidden: gone }),
      });
    }
  }

  // ---- The hare by the last bench, at dusk and by night ---------------------------------------------------------
  {
    const spots = [[-11, -268], [9, -266], [-22, -262], [18, -260], [-6, -258]].filter(([x, z]) => onIsland(x, z));
    let o, w, fp, at = 0, state = 'nibble', until = 0, look = 0, fled = 0;
    add({
      name: 'hare', x: -4, z: -266, load: 150, live: 110, when: () => day.light < 0.8 && spots.length > 1,
      init: async () => { o = await mesh('v_hare', 0.8, 0xc9b8a0); fp = feet(o.geometry); o.position.set(spots[0][0], LAWN, spots[0][1]); o.rotation.y = look = 0.4; plant(o, fp, LAWN); scene.add(o); w = new Walk(o); w.base = LAWN; },
      show: on => { o.visible = on; },
      think: t => {
        const p = o.position, d = dist(p.x, p.z);
        if (w.busy) return;
        if (d < 14 && t > fled) {                                                    // too close: off, to the spot furthest from her
          let best = at, far = -1; spots.forEach(([x, z], i) => { const dd = dist(x, z); if (i !== at && dd > far) { far = dd; best = i; } });
          at = best; fled = t + 2; w.go([[spots[at][0], LAWN, spots[at][1]]], 8, 0.42, 2.4, 10, LAWN); state = 'run'; return;
        }
        if (state === 'run') { state = 'alert'; until = t + 6; return; }
        if (d < 34) { state = 'alert'; return; }
        if (t < until) return;
        const k = r();
        if (k < 0.5) { state = 'nibble'; until = t + 4 + r() * 7; }
        else if (k < 0.8) { state = 'up'; until = t + 2.5 + r() * 3; look = o.rotation.y + (r() - 0.5) * 1.2; }
        else { const x = spots[at][0] + (r() - 0.5) * 5, z = spots[at][1] + (r() - 0.5) * 5; if (onIsland(x, z)) { w.go([[x, LAWN, z]], 1.8, 0.22, 0.9, 6, LAWN); state = 'hop'; } }
      },
      tick: (t, dt) => {
        if (w.step(dt)) { o.rotation.x = -0.1 * Math.sin(Math.PI * w.ph); plant(o, fp, LAWN, w.lift); return; }
        if (state === 'hop') { state = 'nibble'; look = o.rotation.y; }
        if (state === 'alert' || state === 'run') look = Math.atan2(cam.x - o.position.x, cam.z - o.position.z);
        const ny = turnTo(o.rotation.y, look, dt * 1.6), turning = Math.abs(ny - o.rotation.y) > 1e-4; o.rotation.y = ny;
        const up = state === 'up' || state === 'alert' || state === 'run';
        o.rotation.x += ((up ? -0.3 : 0.12 + 0.04 * Math.max(0, Math.sin(t * 11))) - o.rotation.x) * Math.min(1, dt * 5);
        plant(o, fp, LAWN, turning ? 0.03 * Math.abs(Math.sin(t * 14)) : 0);
      },
      check: () => ({ x: o.position.x, y: o.position.y, z: o.position.z, state }),
    });
  }

  // ---- The fox on the back lawns, at night ---------------------------------------------------------------------
  {
    // two beats, well out from the backs of the buildings; each is walked in three-foot steps, and only its
    // longest stretch that is free of buildings and of everything the visitor bumps into is used
    const beats = [[[-100, -52], [-102, -70], [-103, -88], [-104, -102], [-104, -113]], [[64, -127], [66, -141], [70, -157], [72, -172], [68, -188], [59, -199], [49, -206]]];
    const runs = beats.map(P => {
      const pts = []; for (let i = 0; i < P.length - 1; i++) { const n = Math.ceil(Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]) / 3); for (let k = 0; k < n; k++) pts.push({ x: P[i][0] + (P[i + 1][0] - P[i][0]) * k / n, z: P[i][1] + (P[i + 1][1] - P[i][1]) * k / n }); }
      let best = [], cur = []; for (const p of pts) { if (free(p.x, p.z, 1.6)) { cur.push(p); if (cur.length > best.length) best = cur; } else cur = []; }
      return best;
    }).filter(run => run.length > 8);
    if (runs.length) {
      let o, mixer, acts = {}, cur = null, prev = null, run = runs[0], idx = Math.floor(run.length / 2), dir = 1, state = 'sit', until = 0, gone = false, back = 0, goal = idx, speed = 0, groundY = LAWN;
      const low = {}, USED = ['Idle', 'Idle2', 'IdleHeadLow', 'Eat', 'Walk', 'Run'], REST = ['Idle', 'Idle2', 'IdleHeadLow', 'Eat'];
      const lowOf = a => { const tab = low[a.getClip().name], f = (a.time / a.getClip().duration % 1) * 16, i = Math.floor(f); return tab ? tab[i] + (tab[Math.min(16, i + 1)] - tab[i]) * (f - i) : 0; };
      const paws = () => (!cur ? 0 : prev && prev.getEffectiveWeight() > 0.02 ? Math.min(lowOf(cur), lowOf(prev)) : lowOf(cur));      // while two clips blend, the lower
      const play = (n, ts = 1) => { const a = acts[n]; if (!a) return; a.timeScale = ts; if (cur === a) return; a.reset().fadeIn(0.35).play(); cur?.fadeOut(0.35); prev = cur; cur = a; };
      const member = add({
        name: 'fox', x: run[idx].x, z: run[idx].z, load: 190, live: 160, when: () => day.light < 0.45,
        init: async () => {
          const g = await glb('q_fox'); o = g.scene;
          // its five flat colours into one skinned mesh (vertex colours): one draw
          const parts = []; let skel = null, bindM = null, host = null;
          o.updateMatrixWorld(true);
          o.traverse(n => { if (n.isSkinnedMesh) { skel = n.skeleton; bindM = n.bindMatrix; host ??= n.parent; const geo = n.geometry.clone(), c = n.material.color, k = geo.attributes.position.count, col = new Float32Array(k * 3); for (let i = 0; i < k; i++) c.toArray(col, i * 3); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); for (const a of Object.keys(geo.attributes)) if (!['position', 'skinIndex', 'skinWeight', 'color'].includes(a)) geo.deleteAttribute(a); parts.push([n, geo]); } });
          if (parts.length > 1) {
            const sm = new THREE.SkinnedMesh(mergeGeometries(parts.map(p => p[1])), vcMat({ roughness: 0.9 })); sm.material.color.setRGB(1.5, 1.4, 1.3);      // a little paler, to read by lamplight
            sm.bind(skel, bindM); tag(sm); sm.name = 'fox'; sm.frustumCulled = false; host.add(sm);
            for (const [n] of parts) n.parent.remove(n);
          }
          o.scale.setScalar(FT); mixer = new THREE.AnimationMixer(o);
          for (const c of g.animations) if (USED.includes(c.name)) acts[c.name] = mixer.clipAction(c);
          // how low its feet reach through each clip (17 poses a clip), so the paws, not the body, meet the ground
          { let sm = null; o.traverse(n => { if (n.isSkinnedMesh) sm = n; }); const pos = sm.geometry.attributes.position, v = new THREE.Vector3();
            o.updateMatrixWorld(true);
            for (const [name, act] of Object.entries(acts)) {
              const tab = new Float32Array(17); act.reset().play();
              for (let k = 0; k <= 16; k++) { act.time = act.getClip().duration * k / 16; mixer.update(0); o.updateMatrixWorld(true); sm.skeleton.update(); let lo = Infinity; for (let i = 0; i < pos.count; i += 3) { sm.getVertexPosition(i, v); v.applyMatrix4(sm.matrixWorld); if (v.y < lo) lo = v.y; } tab[k] = lo; }
              act.stop(); low[name] = tab;
            } }
          const p = run[idx]; o.position.set(p.x, groundY, p.z); o.rotation.y = Math.atan2(run[idx + 1].x - p.x, run[idx + 1].z - p.z); scene.add(o); play('Idle');
        },
        show: on => { o.visible = on && !gone; },
        think: t => {
          const p = o.position, d = dist(p.x, p.z);
          if (gone) { back += 0.25; if (back > 50) { const r2 = runs[Math.floor(r() * runs.length)], j = Math.floor(r() * r2.length), q2 = r2[j]; if (dist(q2.x, q2.z) > 60 && dist(q2.x, q2.z) < 150) { run = r2; idx = goal = j; gone = false; o.visible = true; o.position.set(q2.x, groundY, q2.z); member.x = q2.x; member.z = q2.z; state = 'sit'; play('Idle'); until = t + 3; } else if (back > 90) { member.x = q2.x; member.z = q2.z; back = 50; } } return; }
          member.x = p.x; member.z = p.z;
          if (d < 22 && state !== 'flee') {                                         // off, away from her along its beat
            const ahead = run[clamp(idx + 6, 0, run.length - 1)], behind = run[clamp(idx - 6, 0, run.length - 1)];
            dir = dist(ahead.x, ahead.z) > dist(behind.x, behind.z) ? 1 : -1; goal = dir > 0 ? run.length - 1 : 0; state = 'flee'; speed = 11; play('Run', 1.1); return;
          }
          if (state === 'flee') return;
          if (state === 'trot' && idx === goal) { state = 'pause'; until = t + 3 + r() * 6; play(REST[Math.floor(r() * 4)]); }
          if (state === 'pause' && d < 45 && Math.abs(wrapA(Math.atan2(cam.x - p.x, cam.z - p.z) - o.rotation.y)) > 0.7) { state = 'turn'; play('Walk', 0.7); return; }      // it has seen her
          if (t < until || state === 'trot' || state === 'turn') return;
          if (r() < 0.6) { goal = clamp(idx + Math.round((r() - 0.5) * 2 * run.length), 0, run.length - 1); if (goal !== idx) { state = 'trot'; speed = 2.8; play('Walk', 1.0); } }
          else { state = 'pause'; until = t + 3 + r() * 5; play(REST[Math.floor(r() * 4)]); }
        },
        tick: (t, dt) => {
          mixer.update(dt);
          if (state === 'trot' || state === 'flee') {
            const tgt = run[idx + Math.sign(goal - idx)] ?? run[idx], p = o.position, dx = tgt.x - p.x, dz = tgt.z - p.z, dd = Math.hypot(dx, dz), mv = speed * dt;
            if (dd <= mv || idx === goal) { p.x = tgt.x; p.z = tgt.z; idx = run.indexOf(tgt); if (idx === goal && state === 'flee') { gone = true; back = 0; o.visible = false; state = 'sit'; } }
            else { p.x += dx / dd * mv; p.z += dz / dd * mv; o.rotation.y = turnTo(o.rotation.y, Math.atan2(dx, dz), dt * 6); }
          }
          if (state === 'turn') {                                            // turning round to look at her, stepping as it turns
            const want = Math.atan2(cam.x - o.position.x, cam.z - o.position.z); o.rotation.y = turnTo(o.rotation.y, want, dt * 1.6);
            if (Math.abs(wrapA(want - o.rotation.y)) < 0.05) { state = 'pause'; until = t + 3 + r() * 4; play('Idle'); }
          }
          o.position.y = groundY - paws();                                           // the lowest paw on the ground, whatever the stride
        },
        check: () => ({ x: o.position.x, y: o.position.y, z: o.position.z, state, hidden: gone, runs: runs.map(q => q.length) }),
      });
    }
  }

  // ---- The tortoise, crossing the churchyard, by day --------------------------------------------------------------
  {
    const X0 = -32, X1 = 32, Z0 = 62.2, Z1 = 68.5, S = 1.5;                           // the lawn between the Landing and the chapel's door
    let o, head, fp, w, state = 'pause', until = 0, k = 1, shy = 0, headZ = 0, gy = LAWN, dir = 1;
    add({
      name: 'tortoise', x: -6, z: 65, load: 130, live: 90, when: () => day.light > 0.45,
      init: async () => {
        const src = await mesh('v_tortoise', S), g = src.geometry, bb = g.boundingBox, L = bb.max.z - bb.min.z;
        headZ = bb.max.z - L * 0.24;
        const [bodyG, headG] = splitHead(g, (x, y, z) => z > headZ && Math.abs(x) < 0.12 * S, [0, 0, headZ]);
        o = new THREE.Group(); const body = tag(new THREE.Mesh(bodyG, src.material)); head = tag(new THREE.Mesh(headG, src.material)); head.position.z = headZ; o.add(body, head);
        let x = -6, z = 65; for (let i = 0; i < 20 && !free(x, z, 1); i++) { x = X0 + r() * (X1 - X0); z = Z0 + r() * (Z1 - Z0); }
        fp = feet(bodyG); gy = groundAt(x, z); o.position.set(x, gy, z); o.rotation.y = Math.PI / 2; plant(o, fp, gy); o.name = 'tortoise'; scene.add(o); w = new Walk(o); w.base = gy;
      },
      show: on => { o.visible = on; },
      think: t => {
        if (dist3(o.position.x, o.position.y, o.position.z) < 6) shy = t + 5;
        if (t < shy || w.busy || t < until) return;
        if (r() < 0.7) {                                                             // on across, a few feet at a time
          const p = o.position; let x = p.x + dir * (2 + r() * 4), z = clamp(p.z + (r() - 0.5) * 2.4, Z0, Z1);
          if (x < X0 || x > X1 || !clear(p.x, p.z, x, z, 0.8)) { dir = -dir; x = p.x + dir * 2; if (!clear(p.x, p.z, x, z, 0.8)) { until = t + 4; return; } }
          w.go([[x, groundAt(x, z), z]], 0.16, 0, 1, 0.5, gy); state = 'walk';
        } else { state = 'pause'; until = t + 4 + r() * 8; }
      },
      tick: (t, dt) => {
        const hide = t < shy; k = hide ? Math.max(0, k - dt * 2) : Math.min(1, k + dt * 0.25);
        head.position.z = headZ - (1 - k) * 0.22 * S; head.rotation.x = state === 'pause' ? 0.1 * Math.sin(t * 0.8) : 0;
        if (!hide && k > 0.95 && w.step(dt)) { gy = w.base; o.rotation.z = 0.025 * Math.sin(t * 2.4); } else o.rotation.z *= 0.9;
        plant(o, fp, gy);
      },
      check: () => ({ x: o.position.x, y: o.position.y, z: o.position.z, state }),
    });
  }

  // ---- The mouse among the pickle barrels, dusk and night ------------------------------------------------------------
  {
    // (places.js: the barrels stand against the grocer's wall, x 27 to 31.8; the wall's foot runs on east along z = -120)
    const spots = [[33.4, -119.5], [35.8, -119.45], [38.6, -119.5], [41.5, -119.4], [44.6, -119.5], [34.6, -118.5], [37.4, -118.3]].filter(([x, z]) => free(x, z, 0.25)), den = [32.05, -119.55];
    let o, w, fp, state = 'freeze', until = 0, gone = false, safe = 0, pitch = 0;
    const dart = () => { const s = spots[Math.floor(r() * spots.length)]; w.go([[s[0], PAVE, s[1]]], 3.6, 0.02, 0.2, 20, PAVE); state = 'dart'; };
    add({
      name: 'mouse', x: 38, z: -119, load: 110, live: 70, when: () => day.light < 0.7 && spots.length > 1,
      init: async () => { o = await mesh('v_mouse', 1.1); o.material.color.setRGB(1.5, 1.4, 1.3); fp = feet(o.geometry); o.position.set(spots[1][0], PAVE, spots[1][1]); o.rotation.y = Math.PI / 2; plant(o, fp, PAVE); scene.add(o); w = new Walk(o); w.base = PAVE; },
      show: on => { o.visible = on && !gone; },
      think: t => {
        const p = o.position, d = dist(p.x, p.z);
        if (gone) { safe = d > 12 ? safe + 0.25 : 0; if (safe > 5) { gone = false; o.visible = true; o.position.set(den[0], PAVE, den[1]); dart(); } return; }
        if (d < 7.5 && state !== 'flee') { w.go([[den[0], PAVE, den[1]]], 5.5, 0.02, 0.2, 25, PAVE); state = 'flee'; return; }      // behind the barrels
        if (state === 'flee') { if (!w.busy) { gone = true; safe = 0; o.visible = false; } return; }
        if (w.busy || t < until) return;
        const k = r();
        if (k < 0.45) dart();
        else if (k < 0.75) { state = 'freeze'; until = t + 1 + r() * 3; }
        else { state = 'wash'; until = t + 2 + r() * 2; }
      },
      tick: (t, dt) => {
        if (w.step(dt)) { pitch = 0; o.rotation.x = 0; plant(o, fp, PAVE, w.lift); return; }
        pitch += ((state === 'wash' ? -0.5 : 0) - pitch) * Math.min(1, dt * 6);                  // sits up to wash, smoothly
        o.rotation.x = pitch + (state === 'wash' ? 0.04 * Math.sin(t * 18) : 0);
        plant(o, fp, PAVE);
      },
      check: () => ({ x: o.position.x, y: o.position.y, z: o.position.z, state, hidden: gone }),
    });
  }
}
