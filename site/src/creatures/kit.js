// The crew that keeps the street's animals (carried over from the garden of Anna's House, where
// it was written first). Every animal is a member of one crew: it loads its model only when the
// visitor is out of doors and within reach at the right hour, thinks four times a second, moves
// every frame only while she is near enough to see it, and is hidden (and costs nothing) otherwise.
// Nothing is allocated per frame.
//
// Unlike the garden, nothing here casts rays at the scene (the street's meshes are merged into very
// large ones, and a ray against them is slow): heights come from the lists the walker stands on,
// and "is this spot free" from the colliders and the building lots.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const FT = 3.28084, TAU = Math.PI * 2;
export const wrapA = a => ((a + Math.PI) % TAU + TAU) % TAU - Math.PI;
export const turnTo = (a, b, k) => { const d = wrapA(b - a); return Math.abs(d) <= k ? b : a + Math.sign(d) * k; };
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
export const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

export function creatureKit(ctx, K) {
  const { scene, animated, day } = ctx, cam = ctx.camera.position, loader = new GLTFLoader();
  const files = new Map(), meshes = new Map(), crew = [];
  const tag = m => { m.castShadow = false; m.receiveShadow = true; m.userData.creature = true; m.userData.cat = 'creatures'; m.name ||= 'creature'; return m; };
  // a prepared animal (glb, metres, facing +z, feet at y = 0), fetched once
  const glb = id => {
    if (!files.has(id)) files.set(id, new Promise((ok, bad) => loader.load(`assets/models/${id}/${id}.glb`, g => { g.scene.traverse(n => { if (n.isMesh) tag(n); }); ok(g); }, undefined, bad)));
    return files.get(id);
  };
  // one plain mesh (geometry in feet) from a single-mesh model; geometry and material shared per (id, scale, tint)
  const mesh = async (id, s = 1, tint = null) => {
    const key = id + '|' + s + '|' + tint;
    if (!meshes.has(key)) meshes.set(key, glb(id).then(g => {
      let src = null; g.scene.updateMatrixWorld(true); g.scene.traverse(n => { if (n.isMesh && !src) src = n; });
      const geo = src.geometry.clone().applyMatrix4(src.matrixWorld); geo.scale(FT * s, FT * s, FT * s); geo.computeBoundingSphere(); geo.computeBoundingBox();
      let mat = src.material; if (tint != null) { mat = mat.clone(); mat.color.multiply(new THREE.Color(tint)); }
      mat.envMapIntensity = 0.6;
      return { geo, mat };
    }));
    const { geo, mat } = await meshes.get(key);
    return tag(new THREE.Mesh(geo, mat));
  };

  // ---- where things are -------------------------------------------------------------------------
  const lots = K.town?.footprints ?? [], surfs = [...(K.town?.surfaces ?? []), ...(K.surfaces ?? [])].filter(s => !s.ramp && s.h < 3);
  const inLot = (x, z, pad = 1) => lots.some(f => x > f.x0 - pad && x < f.x1 + pad && z > f.z0 - pad && z < f.z1 + pad);
  // inside the footprint of something the visitor bumps into (a planter, a bench, a bin, a post)?
  const blocked = (x, z, pad = 0.3, below = 3) => ctx.colliders.some(c => !c.off && (c.y0 ?? 0) < below && x > c.x0 - pad && x < c.x1 + pad && z > c.z0 - pad && z < c.z1 + pad);
  const onIsland = (x, z, k = 0.84) => (x / 128) ** 2 + ((z + 62) / 240) ** 2 < k * k;
  const free = (x, z, pad = 0.4) => !inLot(x, z, pad + 0.6) && !blocked(x, z, pad) && onIsland(x, z);
  // is the straight way from a to b free (sampled every two feet)?
  const clear = (ax, az, bx, bz, pad = 0.4) => { const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 2)); for (let i = 0; i <= n; i++) if (!free(ax + (bx - ax) * i / n, az + (bz - az) * i / n, pad)) return false; return true; };
  // the height of the ground: the pavements and other laid surfaces (their pavers lie a hair under the
  // walker's own level), else the island's lawn
  const groundAt = (x, z) => { let h = -1; for (const s of surfs) if (x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1 && s.h > h) h = s.h; return h > 0.2 ? h - 0.012 : Math.max(h, 0.03); };
  const dist = (x, z) => Math.hypot(cam.x - x, cam.z - z);
  const dist3 = (x, y, z) => Math.hypot(cam.x - x, cam.y - y, cam.z - z);

  // ---- the crew -----------------------------------------------------------------------------------
  // A member: { name, x, z, load (ft), live (ft), when(), init() -> Promise, show(on), think(t, d), tick(t, dt) }
  const add = c => { Object.assign(c, { loaded: false, loading: false, on: false }); crew.push(c); return c; };
  let next = 0;
  const all = new URLSearchParams(location.search).has('allcreatures');      // tests: load and run everything, everywhere
  animated.push((t, dt) => {
    if (!all && (ctx.room || scene.visible === false)) return;                // indoors, or the street is out of sight: nothing runs
    dt = Math.min(dt, 0.1);
    if (t >= next || t < next - 1) {
      next = t + 0.25;
      for (let i = 0; i < crew.length; i++) {
        const c = crew[i], d = dist(c.x, c.z), want = c.when ? c.when() : true;
        if (!c.loaded && !c.loading && !c.failed && (all || (want && d < (c.load ?? 150)))) {
          c.loading = true;
          c.init().then(() => { c.loaded = true; c.loading = false; c.show?.(false); }).catch(e => { c.failed = true; c.loading = false; console.warn('creature', c.name, e?.message ?? e); });
        }
        const on = c.loaded && want && (all || d < (c.live ?? 110));
        if (on !== c.on) { c.on = on; c.show?.(on); }
        if (on) c.think?.(t, d);
      }
    }
    for (let i = 0; i < crew.length; i++) if (crew[i].on) crew[i].tick?.(t, dt);
  });

  // An animal's feet: the lower part of the middle of its body (a long tail hanging below a perch is not a foot).
  const central = (geo, i) => { if (!geo.boundingBox) geo.computeBoundingBox(); const b = geo.boundingBox, p = geo.attributes.position, cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2;
    return Math.abs(p.getX(i) - cx) < 0.4 * (b.max.x - b.min.x) && Math.abs(p.getZ(i) - cz) < 0.3 * (b.max.z - b.min.z); };
  const feet = geo => {
    const p = geo.attributes.position; let lo = Infinity, hi = -Infinity; for (let i = 0; i < p.count; i++) if (central(geo, i)) { lo = Math.min(lo, p.getY(i)); hi = Math.max(hi, p.getY(i)); }
    const pick = []; for (let i = 0; i < p.count; i++) if (central(geo, i) && p.getY(i) < lo + 0.3 * (hi - lo)) pick.push(i);
    const step = Math.max(1, Math.ceil(pick.length / 200)), out = [];
    for (let k = 0; k < pick.length; k++) { const i = pick[k]; if (k % step === 0 || p.getY(i) < lo + 0.015) out.push(p.getX(i), p.getY(i), p.getZ(i)); }
    return new Float32Array(out.slice(0, 900));
  };
  // Stand o on a surface at height y (plus lift, in a hop): whatever its pose, its lowest foot ends exactly at y.
  const plant = (o, pts, y, lift = 0) => {
    o.position.y = 0; o.updateMatrix(); const e = o.matrix.elements; let lo = Infinity;
    for (let i = 0; i < pts.length; i += 3) { const v = e[1] * pts[i] + e[5] * pts[i + 1] + e[9] * pts[i + 2]; if (v < lo) lo = v; }
    o.position.y = y + lift - lo;
  };
  const kit = { ctx, K, day, cam, scene, glb, mesh, tag, inLot, blocked, onIsland, free, clear, groundAt, dist, dist3, add, crew, feet, plant, all,
    hour: () => day.hour ?? 12 };
  if (typeof window !== 'undefined') { window.__creatures = crew; window.__creatureKit = kit; }      // for tests
  return kit;
}

// A walk along waypoints [[x, y, z], ...] at a speed, optionally in hops (stride, height): it
// moves its object every frame it is stepped and turns it to face the way it goes (+z forward).
export class Walk {
  constructor(o) { this.o = o; this.pts = []; this.i = 0; this.speed = 1; this.hop = 0; this.stride = 1; this.ph = 0; this.turn = 7; this.sx = 0; this.sy = 0; this.sz = 0; this.seg = 1; this.face = true; this.lift = 0; }
  go(pts, speed, hop = 0, stride = 1, turn = 7, base) { if (base != null) this.base = base; this.pts = pts; this.i = 0; this.speed = speed; this.hop = hop; this.stride = stride; this.turn = turn; this.begin(); return this; }
  stop() { this.pts = []; this.i = 0; this.lift = 0; }
  begin() {
    const o = this.o.position; this.sx = o.x; this.sy = this.base ?? o.y; this.sz = o.z; this.ph = 0;
    const p = this.pts[this.i]; if (!p) return;
    const d = Math.hypot(p[0] - o.x, p[2] - o.z); this.seg = d;
    this.st = this.hop ? d / Math.max(1, Math.round(d / this.stride)) : 1;
  }
  get busy() { return this.i < this.pts.length; }
  step(dt) {
    if (!this.busy) return false;
    const p = this.pts[this.i], o = this.o.position, dx = p[0] - o.x, dz = p[2] - o.z, d = Math.hypot(dx, dz);
    let fwd = 1;
    if (this.face && d > 0.02) { const want = Math.atan2(dx, dz); this.o.rotation.y = turnTo(this.o.rotation.y, want, this.turn * dt); fwd = Math.max(0.2, Math.cos(wrapA(want - this.o.rotation.y))); }
    const mv = Math.min(d, this.speed * dt * fwd);                                // it goes the way its head points: turning first, never crabwise
    if (d > 1e-5) { o.x += dx / d * mv; o.z += dz / d * mv; }
    const f = this.seg > 1e-4 ? 1 - Math.max(0, d - mv) / this.seg : 1;
    this.ph += mv / this.st;
    this.base = this.sy + (p[1] - this.sy) * f; this.lift = this.hop ? this.hop * Math.abs(Math.sin(Math.PI * this.ph)) : 0;
    o.y = this.base + this.lift;
    if (d - mv < 1e-4) { o.y = this.base = p[1]; this.lift = 0; this.sy = p[1]; this.i++; this.begin(); }
    return true;
  }
}

// A flight from where it is to (x, y, z) in a few seconds, rising over an arc; returns the progress 0..1.
export class Flight {
  constructor(o) { this.o = o; this.a = new THREE.Vector3(); this.b = new THREE.Vector3(); this.u = 1; this.T = 1; this.lift = 1; }
  go(x, y, z, T, lift = 1) { this.a.copy(this.o.position); this.b.set(x, y, z); this.u = 0; this.T = T; this.lift = lift; return this; }
  get busy() { return this.u < 1; }
  step(dt) {
    if (this.u >= 1) return 1;
    this.u = Math.min(1, this.u + dt / this.T);
    const k = ease(this.u), o = this.o, a = this.a, b = this.b;
    o.position.set(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k + this.lift * 4 * k * (1 - k), a.z + (b.z - a.z) * k);
    if (Math.hypot(b.x - a.x, b.z - a.z) > 0.3) o.rotation.y = turnTo(o.rotation.y, Math.atan2(b.x - a.x, b.z - a.z), dt * 9);
    o.rotation.x = this.u < 0.8 ? -0.12 * Math.sin(Math.PI * this.u / 0.8) * Math.sign(b.y - a.y || 1) : -0.35 * Math.sin(Math.PI * (this.u - 0.8) / 0.2);   // flared to land
    return this.u;
  }
}

// Two flat wings for a bird that otherwise has its wings folded: hidden when it sits, beating in flight.
export function wingPair(span, chord, color, tip, at = [0, 0, 0]) {
  const g = new THREE.BufferGeometry(), c0 = new THREE.Color(color), c1 = new THREE.Color(tip);
  const P = [0, 0, chord * 0.5, 0, 0, -chord * 0.5, span * 0.5, 0, -chord * 0.55, 0, 0, chord * 0.5, span * 0.5, 0, -chord * 0.55, span * 0.42, 0, chord * 0.05];
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute([...c0.toArray(), ...c0.toArray(), ...c1.toArray(), ...c0.toArray(), ...c1.toArray(), ...c1.toArray()], 3));
  g.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide });
  const grp = new THREE.Group(); grp.position.set(...at); grp.visible = false;
  const L = new THREE.Mesh(g, mat), R = new THREE.Mesh(g, mat); R.scale.x = -1;
  for (const w of [L, R]) { w.castShadow = false; w.userData.creature = true; w.userData.cat = 'creatures'; grp.add(w); }
  grp.userData.flap = a => { L.rotation.z = a; R.rotation.z = -a; };      // a > 0: both tips up
  return grp;
}

// A material whose wings beat: each vertex is turned about the body's long axis (z) by an angle
// that grows with its distance from it; the phase differs per instance.
export function flapping(base, uT, amp, speed, glide = 0) {
  const m = base.clone();
  m.onBeforeCompile = sh => {
    sh.uniforms.uFlapT = uT;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uFlapT;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
{
  float id = float(gl_InstanceID);
  float beat = sin(uFlapT * ${speed.toFixed(2)} + id * 2.3);
  float on = ${glide > 0 ? 'mix(1.0, 0.15, smoothstep(0.2, 0.6, sin(uFlapT * 0.45 + id * 1.7)))' : '1.0'};
  float a = ${amp.toFixed(3)} * beat * on * smoothstep(0.0, 0.06, abs(transformed.x));
  float x = transformed.x;
  transformed.x = x * cos(a);
  transformed.y += abs(x) * sin(a);
}`);
  };
  m.customProgramCacheKey = () => 'flap' + amp + speed + glide;
  return m;
}

// Split a mesh's geometry into a part picked out by test (a head) and the rest; the head's
// geometry is moved so that its pivot is at its origin.
export function splitHead(geo, test, pivot) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone(), names = Object.keys(g.attributes), n = g.attributes.position.count / 3;
  const parts = [{}, {}].map(() => Object.fromEntries(names.map(k => [k, []])));
  const P = g.attributes.position;
  for (let t = 0; t < n; t++) {
    const cx = (P.getX(t * 3) + P.getX(t * 3 + 1) + P.getX(t * 3 + 2)) / 3, cy = (P.getY(t * 3) + P.getY(t * 3 + 1) + P.getY(t * 3 + 2)) / 3, cz = (P.getZ(t * 3) + P.getZ(t * 3 + 1) + P.getZ(t * 3 + 2)) / 3;
    const dst = parts[test(cx, cy, cz) ? 1 : 0];
    for (const k of names) { const A = g.attributes[k]; for (let v = 0; v < 3; v++) for (let c = 0; c < A.itemSize; c++) dst[k].push(A.array[(t * 3 + v) * A.itemSize + c]); }
  }
  const out = parts.map(p => { const b = new THREE.BufferGeometry(); for (const k of names) { const A = g.attributes[k]; b.setAttribute(k, new THREE.BufferAttribute(new A.array.constructor(p[k]), A.itemSize, A.normalized)); } return b; });
  out[1].translate(-pivot[0], -pivot[1], -pivot[2]);
  for (const b of out) { b.computeBoundingSphere(); b.computeBoundingBox(); }
  return out;
}

export const vcMat = (o = {}) => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, flatShading: true, ...o });
export function coloured(geo, color) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
  const n = g.attributes.position.count, c = new Float32Array(n * 3), col = typeof color === 'function' ? null : new THREE.Color(color), tmp = new THREE.Color();
  for (let i = 0; i < n; i++) (col ?? tmp.set(color(g.attributes.position.getX(i), g.attributes.position.getY(i), g.attributes.position.getZ(i)))).toArray(c, i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return g;
}
export function tris(list, color) {           // [[x,y,z] x 3, ...] -> a coloured geometry
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(list.flat(2), 3));
  return coloured(g, color);
}
