// Fireflies: the one thing here that comes in numbers. One draw, moved entirely in the shader.
//
//   fireflies    over the meadow past the Overlook, at night: they come up as the stars do
//
// (There were butterflies on every planter and moths at every lamp as well. Cut.)

import * as THREE from 'three';
import { rng } from './kit.js';

export function swarms(kit) {
  const { ctx, day, scene, tag, inLot, onIsland, add } = kit, r = rng(9091);

  // ---- Fireflies ----------------------------------------------------------------------------------------------
  {
    const uT = { value: 0 }, uN = { value: 0 }, uPx = { value: 600 }; let pts = null;
    add({
      name: 'fireflies', x: 0, z: -262, load: 260, live: 260, when: () => day.night > 0.6,
      init: async () => {
        const pos = [], seed = [];
        const scatter = (n, x0, x1, z0, z1, ok = () => true) => { for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0); if (!onIsland(x, z, 1.02) || inLot(x, z, 3) || !ok(x, z)) continue; pos.push(x, 0.9 + r() * 3.6, z); seed.push(r(), r()); i++; } };
        scatter(60, -36, 36, -292, -240);                                                    // the meadow beyond the Overlook, and nowhere else
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
      tick: t => { uT.value = t; uN.value = THREE.MathUtils.smoothstep(day.night, 0.6, 0.92); },
    });
  }
}
