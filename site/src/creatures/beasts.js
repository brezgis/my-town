// The street's four-footed animals. Each belongs to one place and one time of day.
//
//   tortoise   on the flagged path through the churchyard, by day and into the golden hour, very slowly:
//              head in if you come close
//   rabbits    two at the near edge of the meadow, just beyond the Overlook's rail, by day: graze, hop, sit up
//              and watch you; bolt into the long grass if you go down to them, and come back when it is quiet
//   hare       out past the last bench, at dusk: sits up, watches, lollops off
//   hedgehog   along the foot of the hedge at the back of the picture garden, from dusk: snuffles, roots about;
//              curls up if you come close
//
// (There were a squirrel, a fox and a mouse as well. Cut: fewer animals, so that meeting one is luck.)
//
// Models: Poly Pizza, CC-BY 3.0 (see the credits).

import * as THREE from 'three';
import { TAU, Walk, splitHead, turnTo, clamp, rng } from './kit.js';

export function beasts(kit) {
  const { K, day, cam, scene, mesh, tag, clear, blocked, onIsland, groundAt, dist, dist3, add, feet, plant } = kit, r = rng(31337);
  const LAWN = 0.03;

  // ---- The tortoise on the churchyard path, by day ---------------------------------------------------------------------
  {
    // It goes up the flagged path through the churchyard and down again, very slowly, in everybody's way. Where the path
    // is comes from the chapel as it was built this time (town.chapel.yardPath, or failing that the churchyard itself):
    // the long way of that rectangle is the way it walks, and its height is whatever the walker would stand on there.
    const R = K.town?.chapel?.yardPath ?? K.town?.chapel?.churchyard;
    if (R) {
      const alongX = R.x1 - R.x0 >= R.z1 - R.z0, S = 1.5;
      const A0 = (alongX ? R.x0 : R.z0) + 2, A1 = (alongX ? R.x1 : R.z1) - 2, C = alongX ? (R.z0 + R.z1) / 2 : (R.x0 + R.x1) / 2, HW = Math.max(0.2, Math.min(1.3, (alongX ? R.z1 - R.z0 : R.x1 - R.x0) / 2 - 0.7));
      const at = (a, c) => (alongX ? [a, c] : [c, a]), mid = at((A0 + A1) / 2, C);
      let o, head, fp, w, GY = 0.12, state = 'pause', until = 0, k = 1, shy = 0, headZ = 0, dir = 1;
      add({
        name: 'tortoise', x: mid[0], z: mid[1], load: 130, live: 90, when: () => day.light > 0.45 && A1 - A0 > 4,
        init: async () => {
          const src = await mesh('v_tortoise', S, 0xe0bc7c), g = src.geometry, bb = g.boundingBox, L = bb.max.z - bb.min.z;
          headZ = bb.max.z - L * 0.24;
          const [bodyG, headG] = splitHead(g, (x, y, z) => z > headZ && Math.abs(x) < 0.12 * S, [0, 0, headZ]);
          o = new THREE.Group(); const body = tag(new THREE.Mesh(bodyG, src.material)); head = tag(new THREE.Mesh(headG, src.material)); head.position.z = headZ; o.add(body, head);
          GY = groundAt(mid[0], mid[1]);
          const [x, z] = at(A0 + (A1 - A0) * 0.62, C + HW * 0.3);
          fp = feet(bodyG); o.position.set(x, GY, z); o.rotation.y = alongX ? 1.4 : 0.17; plant(o, fp, GY); o.name = 'tortoise'; scene.add(o); w = new Walk(o); w.base = GY;
        },
        show: on => { o.visible = on; },
        think: t => {
          if (dist3(o.position.x, o.position.y, o.position.z) < 6) shy = t + 5;
          if (t < shy || w.busy || t < until) return;
          if (r() < 0.7) {                                                             // on along the path, a few feet at a time
            const p = o.position, a0 = alongX ? p.x : p.z, c0 = alongX ? p.z : p.x; let a = a0 + dir * (1.5 + r() * 3.5); const c = clamp(c0 + (r() - 0.5) * 2, C - HW, C + HW);
            if (a < A0 || a > A1) { dir = -dir; a = clamp(a0 + dir * 2, A0, A1); }
            const [x, z] = at(a, c);
            if (blocked(x, z, 0.5) || blocked((x + p.x) / 2, (z + p.z) / 2, 0.5)) { dir = -dir; until = t + 4; return; }      // something has been left on the path: it turns back
            w.go([[x, GY, z]], 0.16, 0, 1, 0.5, GY); state = 'walk';
          } else { state = 'pause'; until = t + 4 + r() * 8; }
        },
        tick: (t, dt) => {
          const hide = t < shy; k = hide ? Math.max(0, k - dt * 2) : Math.min(1, k + dt * 0.25);
          head.position.z = headZ - (1 - k) * 0.22 * S; head.rotation.x = state === 'pause' ? 0.1 * Math.sin(t * 0.8) : 0;
          if (!hide && k > 0.95 && w.step(dt)) o.rotation.z = 0.025 * Math.sin(t * 2.4); else o.rotation.z *= 0.9;
          plant(o, fp, GY);
        },
        check: () => ({ x: o.position.x, y: o.position.y, z: o.position.z, state }),
      });
    }
  }

  // ---- Two rabbits on the lawn beyond the Overlook's rail, by day -------------------------------------------------
  {
    const fields = [{ x0: -30, x1: -13, hide: [-43, -252] }, { x0: 13, x1: 30, hide: [44, -254] }], Z0 = -246.5, Z1 = -241.8;      // (the rail is at z = -235.6: from there they are watched, not startled)
    for (let n = 0; n < 2; n++) {
      const F = fields[n], x0 = n ? 21 : -22, z0 = -243.5;
      let o, w, fp, state = 'graze', until = 0, gone = false, back = 0, face = r() * TAU, look = face;
      add({
        name: 'rabbit' + (n + 1), x: x0, z: z0, load: 150, live: 110, when: () => day.light > 0.7,
        init: async () => { o = await mesh('v_rabbit', 1.0, n ? 0xd0c0a8 : 0xffffff); fp = feet(o.geometry); o.position.set(x0, LAWN, z0); o.rotation.y = face; plant(o, fp, LAWN); scene.add(o); w = new Walk(o); w.base = LAWN; },
        show: on => { o.visible = on && !gone; },
        think: t => {
          const p = o.position, d = dist(p.x, p.z);
          if (gone) { back += 0.25; if (back > 35 && dist(x0, z0) > 24) { gone = false; o.visible = true; const x = F.x0 + r() * (F.x1 - F.x0); o.position.set(F.hide[0], LAWN, F.hide[1]); w.go([[x, LAWN, Z0 + r() * (Z1 - Z0)]], 3.2, 0.25, 1.1, 6, LAWN); state = 'hop'; } return; }
          if (d < 7.5 && state !== 'bolt') { w.go([[F.hide[0] + (r() - 0.5) * 4, LAWN, F.hide[1] + (r() - 0.5) * 6]], 9, 0.4, 2.6, 10, LAWN); state = 'bolt'; return; }
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

  // ---- The hare by the last bench, at dusk -------------------------------------------------------------------------
  // (places.js: the bench is at (0.5, -275), facing west. The hare keeps more than fourteen feet from it, so that somebody
  // sitting there can watch it; two of its places are out in front, between the bench and the sun.)
  {
    const spots = [[-12, -286], [14, -284], [-24, -270], [-20, -256]].filter(([x, z]) => onIsland(x, z, 1.02));
    let o, w, fp, at = 0, state = 'nibble', until = 0, look = 0, fled = 0;
    add({
      name: 'hare', x: -8, z: -274, load: 150, live: 110, when: () => day.light < 0.7 && day.light > 0.2 && spots.length > 1,
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
        else { const x = spots[at][0] + (r() - 0.5) * 5, z = spots[at][1] + (r() - 0.5) * 5; if (onIsland(x, z, 1.02) && dist(x, z) > 15) { w.go([[x, LAWN, z]], 1.8, 0.22, 0.9, 6, LAWN); state = 'hop'; } }
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

  // ---- Hedgehog in the picture garden, from dusk: along the foot of the hedge at the back of the lawn ------------
  // (places.js: the lawn runs from the screen at x 34 back to x 72, z -88.6 to -112; the hedge's shrubs stand at x 73 to 74.5,
  // and the light poles at (70, -89.6) and (70, -110.8).)
  {
    const box = { x0: 70.8, x1: 71.7, z0: -108.6, z1: -91.8 }, GY = 0.075;               // (the garden's lawn lies a little above the island's)
    let o, w, fp, state = 'root', until = 0, curl = 0, safe = 0;
    add({
      name: 'hedgehog', x: 71, z: -100, load: 130, live: 90, when: () => day.light < 0.7,
      init: async () => {
        o = await mesh('v_hedgehog', 1.15, 0xffffff); o.material.color.setRGB(1.7, 1.55, 1.35);       /* paler spines and face, to read at dusk */ fp = feet(o.geometry);
        o.position.set(71.2, GY, -101); o.rotation.y = Math.PI; plant(o, fp, GY); scene.add(o); w = new Walk(o); w.base = GY;
      },
      show: on => { o.visible = on; },
      think: t => {
        const d = dist(o.position.x, o.position.z);
        if (d < 5.5) { if (state !== 'curl') { state = 'curl'; w.stop(); } safe = 0; return; }
        if (state === 'curl') { safe = d > 8.5 ? safe + 0.25 : 0; if (safe >= 4) { state = 'root'; until = t + 3; } return; }
        if (w.busy || t < until) return;
        if (r() < 0.55) { const p = o.position, z = clamp(p.z + (r() < 0.5 ? -1 : 1) * (2 + r() * 6), box.z0, box.z1), x = box.x0 + r() * (box.x1 - box.x0); if (clear(p.x, p.z, x, z, 0.35)) { w.go([[x, GY, z]], 0.45, 0, 1, 1.2, GY); state = 'walk'; } }
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
}
