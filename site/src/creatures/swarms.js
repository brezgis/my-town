// The small things that come in numbers: each kind is one draw.
//
//   butterflies  on the planters, the tree pits, the Landing's flowers and the meadow beyond the Overlook,
//                by day: from flower to flower, settling with their wings closed, opening them to the sun
//   moths        round the globes of the street lamps, once the lamps are lit (moved entirely in the shader)
//   fireflies    over the meadow, the churchyard and the wild corners of the back lawns, at night (likewise)

import * as THREE from 'three';
import { TAU, turnTo, ease, rng } from './kit.js';

const FLOWERS = new Set(['cosmos', 'lavender', 'catmint', 'coneflower', 'wildflowers', 'rose', 'marigold', 'spires', 'hydrangea', 'sunflower']);

export function swarms(kit) {
  const { ctx, K, day, cam, scene, tag, inLot, onIsland, add } = kit, r = rng(9091);

  // ---- Butterflies --------------------------------------------------------------------------------
  {
    // homes: [x, z, reach, how many]. Only those with flowers in reach are kept.
    const homes = [[14, -30.5, 3, 1], [-14, -35, 3, 1], [-14, -66, 3, 1], [-14, -136, 3, 1], [14, -142, 3, 1], [-14, -159, 3, 1], [14, -173, 3.5, 1], [-31.5, -200.5, 4, 1], [31.5, -200.5, 4, 1],
      [-16, -254, 15, 3], [17, -256, 15, 3], [0, -246, 12, 2], [-27, 27, 7, 2], [78, -98, 12, 2], [84, -70, 12, 1], [70, -196, 10, 1], [-66, -206, 10, 1], [30, 20, 9, 1], [-34, 20, 9, 1], [-92, -98, 8, 1]];
    const TINTS = [0xe8862a, 0xf4f2ea, 0x7aa6e8, 0xf0d84a];      // small tortoiseshell, cabbage white, common blue, brimstone
    const flies = [];
    let inst = null;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
    add({
      name: 'butterflies', x: 0, z: -110, load: 900, live: 900, when: () => day.light > 0.5,
      init: async () => {
        const flowers = (K.F?.list ?? []).filter(f => FLOWERS.has(f.kind));
        for (const [hx, hz, reach, n] of homes) {
          const list = flowers.filter(f => Math.hypot(f.x - hx, f.z - hz) < reach).slice(0, 40).map(f => [f.x, f.y + Math.max(0.6, f.h * 0.92), f.z]);
          if (list.length < 2) continue;
          for (let k = 0; k < n; k++) { const a = list[Math.floor(r() * list.length)]; flies.push({ hx, hz, list, on: false, ax: a[0], ay: a[1], az: a[2], bx: a[0], by: a[1], bz: a[2], t0: -r() * 8, rest: 2 + r() * 6, fly: 2, size: 0.27 + r() * 0.1, head: r() * TAU, ph: r() * 9 }); }
        }
        // one wing, painted pale (each butterfly tints it): hinged on the body's long axis at x = 0, the forewing toward -z
        const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
        g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(4, 64); g.bezierCurveTo(20, 0, 110, -10, 120, 30); g.bezierCurveTo(124, 60, 90, 66, 60, 64); g.bezierCurveTo(100, 80, 104, 120, 70, 124); g.bezierCurveTo(40, 126, 14, 90, 4, 64); g.fill();
        g.strokeStyle = '#2a2420'; g.lineWidth = 7; g.stroke(); g.lineWidth = 1.5; g.strokeStyle = 'rgba(40,34,30,.55)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(6, 64); g.lineTo(40 + k * 18, 10 + k * 22); g.stroke(); }
        g.fillStyle = 'rgba(30,26,24,.8)'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(88 + k * 9, 24 + k * 9, 4, 0, 7); g.fill(); }
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
        const wing = new THREE.PlaneGeometry(1, 1); wing.rotateX(-Math.PI / 2); wing.translate(0.5, 0, 0);
        const N = Math.max(1, flies.length);
        inst = tag(new THREE.InstancedMesh(wing, new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.7 }), N * 3)); inst.frustumCulled = false; inst.name = 'butterflies';
        const col = new THREE.Color(), dark = new THREE.Color(0x1c1612);
        for (let i = 0; i < N; i++) { col.set(TINTS[Math.floor(r() * TINTS.length)]); inst.setColorAt(i * 3, col); inst.setColorAt(i * 3 + 1, col); inst.setColorAt(i * 3 + 2, dark); for (let k = 0; k < 3; k++) inst.setMatrixAt(i * 3 + k, zero); }
        inst.count = flies.length * 3; scene.add(inst);
      },
      show: on => { inst.visible = on; },
      think: () => { for (const f of flies) f.near = Math.hypot(cam.x - f.hx, cam.z - f.hz) < 130; },
      tick: (t) => {
        let dirty = false;
        for (let i = 0; i < flies.length; i++) {
          const f = flies[i];
          if (!f.near) { if (f.on) { f.on = false; for (let k = 0; k < 3; k++) inst.setMatrixAt(i * 3 + k, zero); dirty = true; } continue; }
          f.on = true; dirty = true;
          let u = t - f.t0, x, y, z, flap;
          if (u > f.rest + f.fly || u < 0) {                           // landed, rested: off to another flower nearby
            f.t0 = t; u = 0; f.ax = f.bx; f.ay = f.by; f.az = f.bz;
            const n = f.list[Math.floor(r() * f.list.length)];
            f.bx = n[0]; f.by = n[1]; f.bz = n[2]; f.fly = 1.5 + Math.hypot(f.bx - f.ax, f.bz - f.az) / 2.2; f.rest = 2 + r() * 7;
          }
          if (u < f.rest) { x = f.ax; y = f.ay; z = f.az; const bask = Math.max(0, Math.sin(u * 0.9 + f.ph)); flap = 1.45 - 1.15 * bask * bask; }      // resting: wings held up, opened now and then to bask
          else {
            const k = (u - f.rest) / f.fly, sk = ease(k), wob = Math.sin(k * Math.PI);
            x = f.ax + (f.bx - f.ax) * sk + Math.sin(t * 3.1 + i) * 0.5 * wob; z = f.az + (f.bz - f.az) * sk + Math.cos(t * 2.7 + i) * 0.5 * wob;
            y = f.ay + (f.by - f.ay) * sk + wob * (1.2 + 0.4 * Math.sin(i)) + 0.18 * Math.sin(t * 7 + i);
            f.head = turnTo(f.head, Math.atan2(-(f.bx - f.ax), -(f.bz - f.az)), 0.08);      // its front (-z) toward where it goes
            flap = 0.15 + 1.25 * Math.abs(Math.sin(t * 14 + i));
          }
          p.set(x, y, z);
          for (let side = 0; side < 2; side++) { e.set(0, f.head, side ? -flap : flap, 'YXZ'); q.setFromEuler(e); s.set(side ? -f.size : f.size, 1, f.size); inst.setMatrixAt(i * 3 + side, m4.compose(p, q, s)); }
          e.set(0, f.head, 0, 'YXZ'); q.setFromEuler(e); s.set(f.size * 0.16, 1, f.size * 0.8); m4.compose(p, q, s);      // the body: the same card, dark and narrow, along the hinge
          m4.elements[12] -= m4.elements[0] * 0.5; m4.elements[14] -= m4.elements[2] * 0.5; inst.setMatrixAt(i * 3 + 2, m4);
        }
        if (dirty) inst.instanceMatrix.needsUpdate = true;
      },
      check: () => ({ n: flies.length, on: flies.filter(f => f.on).length }),
    });
  }

  // ---- Moths at the street lamps ------------------------------------------------------------------------
  {
    // (street.js: every post carries two globes, 1.6 ft either side of it along the street, 11.02 ft up)
    const posts = [...(K.lampPosts ?? []), [-13.1, 1], [13.1, -20], [-13.1, -42], [-13.1, 205], [13.1, 205]], PER = 3;
    const uT = { value: 0 }, uK = { value: 0 }; let moths = null;
    add({
      name: 'moths', x: 0, z: -90, load: 900, live: 900, when: () => day.light < 0.62 && posts.length > 0,
      init: async () => {
        const base = new THREE.BufferGeometry();
        base.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.45, 0, 0, -0.4, 1, 0, -0.55, 0, 0, 0.45, 1, 0, -0.55, 0.9, 0, 0.5, 0, 0, 0.45, -1, 0, -0.55, 0, 0, -0.4, 0, 0, 0.45, -0.9, 0, 0.5, -1, 0, -0.55], 3));
        const geo = new THREE.InstancedBufferGeometry(); geo.setAttribute('position', base.attributes.position);
        const a = new Float32Array(posts.length * 2 * PER * 4); let n = 0;
        for (const [X, Y] of posts) for (const dz of [-1.6, 1.6]) for (let k = 0; k < PER; k++) { a.set([X, 11.02, -Y + dz, r()], n * 4); n++; }
        geo.setAttribute('aLamp', new THREE.InstancedBufferAttribute(a, 4)); geo.instanceCount = n;
        moths = tag(new THREE.Mesh(geo, new THREE.ShaderMaterial({
          uniforms: { uT, uK }, side: THREE.DoubleSide,
          vertexShader: `attribute vec4 aLamp; uniform float uT; varying float vS;
void main() {
  float ph = aLamp.w, t = uT * (1.3 + fract(ph * 3.7)) * (fract(ph * 7.3) > 0.5 ? 1.0 : -1.0) + ph * 6.2832;
  float rad = 0.95 + 0.4 * sin(t * 0.37 + ph * 5.0) + 0.2 * sin(t * 1.9);
  vec3 c = aLamp.xyz + vec3(cos(t) * rad, 0.4 * sin(t * 1.3 + ph * 9.0) + 0.15 * sin(t * 3.1), sin(t) * rad);
  float flap = 0.2 + 1.0 * sin(uT * 41.0 + ph * 20.0);
  vec3 p = position; p.y = abs(p.x) * sin(flap); p.x *= cos(flap);
  float h = -t + (fract(ph * 7.3) > 0.5 ? 0.0 : 3.1416), ch = cos(h), sh = sin(h);
  p = vec3(p.x * ch + p.z * sh, p.y, -p.x * sh + p.z * ch) * (0.1 + 0.05 * fract(ph * 11.0));
  vS = 0.75 + 0.25 * abs(sin(flap));
  gl_Position = projectionMatrix * viewMatrix * vec4(c + p, 1.0);
}`,
          fragmentShader: `uniform float uK; varying float vS;
void main() { gl_FragColor = vec4(vec3(0.86, 0.8, 0.68) * vS * (0.12 + 0.88 * uK), 1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
        }))); moths.frustumCulled = false; moths.name = 'moths'; scene.add(moths);
      },
      show: on => { moths.visible = on; },
      tick: t => { uT.value = t; uK.value = 1 - THREE.MathUtils.smoothstep(day.light, 0.42, 0.97); },
    });
  }

  // ---- Fireflies ----------------------------------------------------------------------------------------------
  {
    const uT = { value: 0 }, uN = { value: 0 }, uPx = { value: 600 }; let pts = null;
    add({
      name: 'fireflies', x: 0, z: -60, load: 900, live: 900, when: () => day.night > 0.25,
      init: async () => {
        const pos = [], seed = [];
        const scatter = (n, x0, x1, z0, z1, ok = () => true) => { for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0); if (!onIsland(x, z, 0.97) || inLot(x, z, 3) || !ok(x, z)) continue; pos.push(x, 0.9 + r() * 3.6, z); seed.push(r(), r()); i++; } };
        scatter(60, -36, 36, -288, -240);                                                    // the meadow beyond the Overlook
        scatter(40, -84, -37, -223, -198);                                                   // the churchyard, beside the chapel
        scatter(30, -48, 48, 61, 152);                                                       // the mooring field
        scatter(12, 76, 96, -84, -58); scatter(12, -102, -82, -166, -136); scatter(10, 60, 80, -206, -186); scatter(8, 74, 84, -112, -86);      // the wild corners, and behind the picture garden's hedge
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 2));
        pts = tag(new THREE.Points(geo, new THREE.ShaderMaterial({
          uniforms: { uT, uN, uPx }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
          vertexShader: `attribute vec2 aSeed; uniform float uT, uN, uPx; varying float vB;
void main() {
  float ph = aSeed.x * 20.0, sp = 0.2 + aSeed.y * 0.3;
  vec3 p = position + vec3(sin(uT * sp + ph) * 2.5, sin(uT * sp * 1.7 + ph) * 0.6, cos(uT * sp * 0.8 + ph) * 2.5);
  vB = pow(max(0.0, sin(uT * 1.3 + ph * 3.0)), 6.0) * uN;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_PointSize = clamp(uPx * 0.5 / max(1.0, -mv.z), 1.5, 40.0) * step(0.004, vB);
  gl_Position = projectionMatrix * mv;
}`,
          fragmentShader: `varying float vB;
void main() { vec2 d = gl_PointCoord * 2.0 - 1.0; float g = max(0.0, 1.0 - dot(d, d)); gl_FragColor = vec4(vec3(1.0, 0.95, 0.35) * vB * g * g * 1.6, 1.0); }`,
        }))); pts.frustumCulled = false; pts.name = 'fireflies'; pts.renderOrder = 3; scene.add(pts);
      },
      show: on => { pts.visible = on; },
      think: () => { uPx.value = ctx.renderer.domElement.height / (2 * Math.tan((ctx.camera.fov ?? 60) * Math.PI / 360)); },
      tick: t => { uT.value = t; uN.value = THREE.MathUtils.smoothstep(day.night, 0.25, 0.7); },
    });
  }
}
