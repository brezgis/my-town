// The street's two birds.
//
//   robin       on the Yard's notice board, by day: bobs, drops to the gravel for something, faces you;
//               stand still near it and it comes down to look at you. E: whistle to it.
//   barn owl    on a lamp pole at the back of the picture garden, at night: its head follows you
//
// (There were sparrows, a roost, a blackbird, swallows and bats along the street as well. Too many: an animal
// here belongs to one place and one hour, and none of them keeps to the main street.)
//
// Models: Poly Pizza, CC-BY 3.0 (see the credits). The robin's flight wings are built in code.

import * as THREE from 'three';
import { Flight, wingPair, splitHead, turnTo, wrapA, clamp, rng } from './kit.js';

export function birds(kit) {
  const { ctx, day, cam, scene, mesh, tag, free, groundAt, dist, add, feet, plant } = kit, r = rng(4242);

  // ---- Robin on the Yard's notice board ----------------------------------------------------------------------
  {
    // the board's green cap (places.js): x -26.2, plan Y 111.2 to 117.2, its top at CURB + 7.2
    const BX = -26.2, TOP = 7.7, perches = [[BX, TOP, -112.5], [BX, TOP, -115.9]], GRAVEL = 0.52;
    const inYard = (x, z) => x < -24.4 && x > -90 && z < -79 && z > -117.5;
    const level = (x, z) => (inYard(x, z) ? GRAVEL : groundAt(x, z));
    let o, fp, wings, fl, state = 'perch', then = 'perch', standY = TOP, until = 0, bobAt = -9, look = 0, pecks = 0, peckAt = 0, pi = 0, still = 0, lx = 0, lz = 0, visitT = 0, called = false, now = 0;
    const item = { x: BX, y: -500, z: -114.2, reach: 13, size: 1.4, label: () => 'whistle to the robin', act: () => {
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
      name: 'robin', x: BX, z: -114, load: 130, live: 95, when: () => day.light > 0.7,
      init: async () => {
        const body = await mesh('v_robin'); fp = feet(body.geometry); o = new THREE.Group(); o.add(body); wings = wingPair(0.72, 0.17, 0x6e5a42, 0x4a3a2a, [0, 0.2, 0]); o.add(wings);
        o.position.set(...perches[0]); o.rotation.y = Math.PI / 2; plant(o, fp, TOP); scene.add(o); fl = new Flight(o); lx = cam.x; lz = cam.z;
      },
      show: on => { o.visible = on; item.y = on ? o.position.y + 0.3 : -500; },
      think: t => {
        now = t; const p = o.position, d = dist(p.x, p.z);
        item.x = p.x; item.y = p.y + 0.3; item.z = p.z;                                  // the prompt is on the bird, wherever it has got to (not on the notices)
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
      name: 'owl', x: P[0], z: P[2], load: 150, live: 120, when: () => day.night > 0.7,
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
}
