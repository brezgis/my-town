// The street itself: the island it stands on, the road and pavements, trees, lamps, benches,
// string lights, and the places at either end and in between.
//
//   The Landing     the east end, where you arrive: the airship stop and the town's sign
//   Main Street     ten lots, five a side (town.js), the sun going down at the far end
//   Pickle Alley    between the cinema and the grocer: a mural, crates, a way through to a
//                   small garden nobody is supposed to know about
//   The Yard        the gap on the south side: a dumpling cart, picnic tables, a fire, an oak
//   The Overlook    the west end: benches at the rail, a telescope, the whole sky
//
// World coordinates (feet): x north(+)/south(-), y up, z = -Y, so the street runs toward -z.
// Helpers here take plan coordinates (X, Y) like town.js.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeKit, PAINT, GLOW } from './street/tools.js';
import { wind, rng } from './street/cards.js';
import { makeFlames } from './flame.js';
import { ROAD, FRONT, CURB, STREET, LOTS, SHOPTOP } from './town.js';
import { dressFronts, frontsLife } from './fronts.js';
import { buildPlaces, placesLife } from './places.js';
import { buildFlats, flatsLife } from './flats.js';
import { buildBacks, backsLife } from './backs.js';
import { placeCreatures, creaturesLife } from './creatures.js';
import { hideEggs, eggsLife } from './eggs.js';
import { chapelLife } from './chapel.js';

// ---- the island --------------------------------------------------------------------------------
// Long and narrow, like the street; a little wider in the middle for the Yard.
export const ISLAND = (() => {
  const x = 0, z = -62, N = 48, A = 128, Bz = 240, outline = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let r = (A * Bz) / Math.hypot(Bz * c, A * s);
    r *= 1 + 0.05 * Math.sin(a * 3 + 0.8) + 0.035 * Math.sin(a * 5 + 2.1);
    if (c < -0.5) r *= 1 + 0.12 * (-c - 0.5);                           // the south side bellies out behind the Yard
    outline.push(Math.round(r));
  }
  return { x, z, r: Math.max(...outline), outline };
})();
export function islandEdge(a) {
  const o = ISLAND.outline, N = o.length, f = ((((a / (Math.PI * 2)) % 1) + 1) % 1) * N, i = Math.floor(f), t = f - i;
  return o[i % N] * (1 - t) + o[(i + 1) % N] * t;
}

export const ALLEY = { y0: 112, y1: 120 }, YARD = { y0: 78, y1: 118, back: 66 }, OVERLOOK = { y0: 198, y1: 236 }, LANDING = { y0: -60, y1: -8 }, CHURCHYARD = { y1: -60 };

// What to call where you are standing, out of doors
export function placeName(x, z) {
  const Y = -z;
  if (Y > OVERLOOK.y0 - 2) return 'The Overlook';
  if (Y < CHURCHYARD.y1) return 'The Churchyard';
  if (Y < LANDING.y1) return 'The Landing';
  if (x > FRONT && Y > ALLEY.y0 && Y < ALLEY.y1) return x > 60 ? 'The Picture Garden' : 'Pickle Alley';
  if (x > FRONT + 10 && Y > 82 && Y < 113) return 'The Picture Garden';
  if (x < -FRONT && Y > YARD.y0 && Y < YARD.y1 && x > -FRONT - YARD.back) return 'The Yard';
  if (Math.abs(x) > FRONT + 20) return x > 0 ? 'Behind the north side' : 'Behind the south side';
  return 'Main Street';
}

// ---- trees ---------------------------------------------------------------------------------------
// Street trees stand in pits along the kerb; the rest grow where they like behind the buildings.
export const TREES = [];
const STREET_TREES = [];
{
  const kinds = ['maple', 'cherry', 'maple', 'birch', 'maple', 'cherry'];
  let i = 0;
  for (let Y = 7; Y < 190; Y += 31) {
    for (const s of [1, -1]) {
      const y = Y + (s > 0 ? 0 : 15);
      if (s < 0 && y > YARD.y0 + 4 && y < YARD.y1 - 4) continue;       // the Yard has its own oak
      if (s > 0 && y > ALLEY.y0 - 3 && y < ALLEY.y1 + 3) continue;
      if (s > 0 && y > 86 && y < 110) continue;                        // nothing in front of the picture house's marquee
      const kind = kinds[i++ % kinds.length], t = { kind, x: s * 14.6, z: -y, seed: 50 + i, height: kind === 'cherry' ? 19 : kind === 'birch' ? 27 : 26, y: CURB };
      STREET_TREES.push(t); TREES.push(t);
    }
  }
  const r = rng(808);
  // behind the buildings and round the rim
  const wild = [
    ['oak', 92, -30, 46], ['maple', 86, -76, 40], ['pine', 104, -112, 52], ['oak', 96, -150, 44], ['birch', 84, -176, 30], ['birch', 90, -182, 33], ['pine', 78, -206, 48],
    ['maple', 72, -18, 36], ['cherry', 66, 34, 20], ['pine', 88, 22, 50], ['oak', 60, -222, 40],
    ['oak', -104, -40, 48], ['pine', -112, -84, 54], ['maple', -118, -122, 42], ['oak', -100, -164, 46], ['birch', -86, -196, 30], ['birch', -92, -204, 32], ['pine', -74, -220, 48],
    ['maple', -78, -8, 38], ['cherry', -66, 36, 21], ['pine', -96, 26, 50], ['willow', -98, -128, 34],
    // round the churchyard
    ['oak', 48, 64, 44], ['maple', -46, 70, 40], ['birch', 40, 96, 28], ['birch', 45, 102, 30], ['pine', -44, 118, 48], ['copper', 42, 136, 42], ['cherry', -36, 92, 20], ['oak', -30, 160, 44], ['pine', 24, 166, 46], ['maple', 76, 70, 36], ['pine', -78, 78, 50],
    ['lilac', 66, -116, 12], ['magnolia', 74, -100, 16], ['apple', 80, -128, 15],
    ['jmaple', 34, -214, 13], ['copper', -38, -226, 40], ['maple', 50, -240, 36], ['pine', -44, -262, 44], ['birch', 40, -258, 28],
  ];
  for (const [kind, x, z, height] of wild) TREES.push({ kind, x: x + (r() - 0.5) * 3, z: z + (r() - 0.5) * 3, seed: Math.floor(r() * 900), height });
  TREES.push({ kind: 'oak', x: -52, z: -98, seed: 77, height: 46, trunk: 2.3, y: CURB });          // the Yard's oak
}

export function layStreet(B, items, town) {
  const K = makeKit(B, items, TREES);
  K.extras = items.extras; K.kit = items.kit; K.town = town; K.glowDots = []; K.life = [];
  const { r } = K;
  // plan-coordinate boxes: P(mat, X0, X1, Y0, Y1, h0, h1)
  const P = K.P2 = (mat, X0, X1, Y0, Y1, h0, h1, o) => K.box(mat, Math.min(X0, X1), Math.max(X0, X1), h0, h1, -Math.max(Y0, Y1), -Math.min(Y0, Y1), o);
  const IRON = PAINT.iron, STONE = 'concrete';

  // ======================================================================================
  // Road and pavements
  // ======================================================================================
  const R0 = -40, R1 = OVERLOOK.y0;
  P('asphalt', -ROAD, ROAD, R0, R1, -0.6, 0.07);
  for (const s of [-1, 1]) {
    P(STONE, s * ROAD, s * (ROAD + 0.7), R0, R1, -0.6, CURB);                                   // kerb
    // pavement, left open where the Yard and the alley have their own ground
    P('pavers', s * (ROAD + 0.7), s * FRONT, STREET.y0, OVERLOOK.y0, -0.6, CURB - 0.012);
    P(STONE, s * (ROAD + 0.7), s * FRONT, STREET.y0 - 0.7, STREET.y0, -0.6, CURB);
  }
  // crossings: zebra stripes, a little worn
  for (const Y of [-12, 98, 186]) for (let X = -ROAD + 1.2; X < ROAD - 1; X += 3) P('c#d9d4c6/0.9', X, X + 1.7, Y - 4, Y + 4, 0.07, 0.082);
  // a centre line of sorts, and the bicycle lane on the north side
  for (let Y = -4; Y < 182; Y += 9) if (Math.abs(Y - 98) > 8) P('c#cdb45a/0.9', -0.2, 0.2, Y, Y + 4.5, 0.07, 0.08);
  for (const [Y0, Y1] of [[-6, 92], [104, 180]]) P('c#d9d4c6/0.9', ROAD - 4.6, ROAD - 4.3, Y0, Y1, 0.07, 0.08);
  K.surface(-ROAD, ROAD, -R1, -R0, 0.07);

  // ======================================================================================
  // Street trees, each in a pit with an iron grate and something growing at its foot
  // ======================================================================================
  for (const t of STREET_TREES) {
    const X = t.x, Y = -t.z;
    P('c#3a2c22/1', X - 2.2, X + 2.2, Y - 2.2, Y + 2.2, CURB - 0.02, CURB + 0.03);
    for (const [a, b, c, d] of [[-2.4, 2.4, -2.4, -2.1], [-2.4, 2.4, 2.1, 2.4], [-2.4, -2.1, -2.1, 2.1], [2.1, 2.4, -2.1, 2.1]]) P(IRON, X + a, X + b, Y + c, Y + d, CURB - 0.02, CURB + 0.09);
    for (let i = 0; i < 5; i++) K.F.add(K.pick(['hosta', 'fern', 'marigold', 'catmint', 'herbs']), X + (r() - 0.5) * 3, t.z + (r() - 0.5) * 3, 0.7 + r() * 0.3, { y: CURB });
  }

  // ======================================================================================
  // Lamp posts: iron, a pair of globes, banners on some
  // ======================================================================================
  const lampPost = (X, Y, s) => {
    const z = -Y, y = CURB;
    K.lathe(IRON, X, y, z, [[0.01, 0], [0.5, 0], [0.5, 0.25], [0.36, 0.5], [0.3, 1.6], [0.2, 1.9], [0.17, 2.6], [0.13, 2.8], [0.12, 11.2], [0.2, 11.3], [0.2, 11.5], [0.1, 11.6], [0.1, 12.4], [0.01, 12.5]], 12);
    K.tube(IRON, [X, y + 11.4, z - 1.6], [X, y + 11.4, z + 1.6], 0.06, 6);
    for (const dz of [-1.6, 1.6]) {
      K.tube(IRON, [X, y + 11.4, z + dz], [X, y + 11.0, z + dz], 0.05, 6);
      K.lathe(IRON, X, y + 10.55, z + dz, [[0.01, 0.45], [0.2, 0.42], [0.24, 0.36], [0.24, 0.3]], 10);
      B.mesh('e#ffe2b4/1.7', new THREE.SphereGeometry(0.42, 14, 10).translate(X, y + 10.52, z + dz));
      K.glowDots.push([X, y + 10.52, z + dz, 3.4]);
    }
    items.lamps.push({ x: X - s * 0.6, y: y + 10.2, z, power: 1.25, kind: 'lamp', street: true });
    K.collide(X - 0.5, X + 0.5, z - 0.5, z + 0.5, 12);
  };
  K.lampPosts = [];
  for (let Y = 22; Y <= 190; Y += 42) for (const s of [1, -1]) { const y = Y + (s > 0 ? 0 : 21); if (y > 190) continue; lampPost(s * 13.1, y, s); K.lampPosts.push([s * 13.1, y]); }
  lampPost(-13.1, 1, -1); lampPost(13.1, -20, 1); lampPost(-13.1, -42, -1); lampPost(-13.1, 205, -1); lampPost(13.1, 205, 1);

  // ======================================================================================
  // String lights, looped back and forth across the street from the shopfront cornices
  // ======================================================================================
  const bulbs = [];
  const strand = (a, b, sag, n = 14) => {
    const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, p = A.clone().lerp(Bv, t); p.y -= sag * 4 * t * (1 - t); pts.push(p); }
    for (let i = 0; i < n; i++) K.tube(PAINT.wire, pts[i].toArray(), pts[i + 1].toArray(), 0.022, 3);
    for (let i = 1; i < n; i++) bulbs.push(pts[i]);
  };
  K.strand = strand;
  { let k = 0; for (let Y = -4; Y < 186; Y += 13) { const a = k % 2 ? -1 : 1; strand([a * (FRONT - 0.4), SHOPTOP + 0.9, -Y], [-a * (FRONT - 0.4), SHOPTOP + 0.9, -(Y + 13)], 3.6, 16); k++; } }

  // ======================================================================================
  // Benches, planters, bicycle racks, bins, a pillar box
  // ======================================================================================
  const planter = (X, Y, w = 3.2, plants = ['catmint', 'cosmos', 'lavender']) => {
    const z = -Y;
    K.box('c#4a4640/0.8', X - 0.9, X + 0.9, CURB, CURB + 1.5, z - w / 2, z + w / 2, { collide: true });
    K.box('c#3a2c22/1', X - 0.8, X + 0.8, CURB + 1.5, CURB + 1.52, z - w / 2 + 0.1, z + w / 2 - 0.1);
    for (let i = 0; i < Math.round(w * 2.2); i++) K.F.add(K.pick(plants), X + (r() - 0.5) * 1.3, z + (r() - 0.5) * (w - 0.5), 0.55 + r() * 0.3, { y: CURB + 1.45 });
  };
  const rack = (X, Y) => { for (const d of [0, 2.6]) { const z = -(Y + d); for (const dx of [-0.9, 0.9]) K.tube(IRON, [X + dx, CURB, z], [X + dx, CURB + 2.5, z], 0.07, 6); K.tube(IRON, [X - 0.9, CURB + 2.5, z], [X + 0.9, CURB + 2.5, z], 0.07, 6); } K.collide(X - 1, X + 1, -(Y + 2.8), -(Y - 0.2), 3); };
  const bin = (X, Y) => { K.lathe('c#2f3a34/0.6', X, CURB, -Y, [[0.01, 0], [0.75, 0], [0.85, 2.9], [0.92, 2.95], [0.92, 3.1], [0.6, 3.3], [0.01, 3.35]], 14); K.collide(X - 0.8, X + 0.8, -Y - 0.8, -Y + 0.8, 3.3); };
  // a bicycle, leaning: two wheels, a diamond frame, bars and a saddle. yaw turns it about the upright.
  const bike = K.bike = (X, Y, yaw = 0, colour = 'c#b8452e/0.4', y0 = CURB, o = {}) => {
    const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(X, y0, -Y), lean = new THREE.Matrix4().makeRotationX(o.lean ?? 0.12), parts = [];
    const add = (mat, g) => { g.applyMatrix4(lean); g.applyMatrix4(m); K.put(mat, g); };
    for (const wx0 of [-1.75, 1.75]) { add('c#1c1c1c/0.9', new THREE.TorusGeometry(1.08, 0.07, 6, 22).translate(wx0, 1.15, 0)); add('c#b9bcc0/0.3/1', new THREE.TorusGeometry(1.0, 0.025, 4, 22).translate(wx0, 1.15, 0)); }
    const bar = (a, b, rad = 0.045, mat = colour) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A), len = d.length(), g = new THREE.CylinderGeometry(rad, rad, len, 6); g.translate(0, len / 2, 0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())); g.translate(A.x, A.y, A.z); add(mat, g); };
    bar([-1.75, 1.15, 0], [-0.3, 1.2, 0]); bar([-0.3, 1.2, 0], [-0.75, 2.75, 0]); bar([-0.75, 2.75, 0], [-1.75, 1.15, 0], 0.035); bar([-0.3, 1.2, 0], [1.2, 2.6, 0]); bar([-0.75, 2.75, 0], [1.2, 2.75, 0]);
    bar([1.2, 2.2, 0], [1.75, 1.15, 0]); bar([1.2, 2.2, 0], [1.1, 3.25, 0]); bar([1.1, 3.25, -0.75], [1.1, 3.25, 0.75], 0.035, 'c#b9bcc0/0.3/1'); bar([-0.75, 2.75, 0], [-0.85, 3.15, 0], 0.035, 'c#b9bcc0/0.3/1');
    add('c#3a2a1c/0.7', new THREE.BoxGeometry(0.75, 0.12, 0.38).translate(-0.9, 3.2, 0));
    if (o.basket) { add('c#a8895a/0.9', new THREE.CylinderGeometry(0.55, 0.42, 0.7, 10, 1, true).translate(1.75, 2.85, 0)); add('c#a8895a/0.9', new THREE.CylinderGeometry(0.42, 0.42, 0.04, 10).translate(1.75, 2.5, 0)); }
    return parts;
  };
  // planters stand at the kerb, between the trees, so they never hide a shop window
  planter(14, 30.5); planter(14, 76, 3.2, ['fern', 'hosta', 'herbs']); planter(-14, 35, 3.2, ['lavender', 'catmint']); planter(-14, 136, 3.6, ['lavender', 'herbs', 'marigold']);
  planter(14, 142, 3, ['herbs', 'marigold', 'kale']); planter(14, 173, 4, ['fern', 'hosta', 'cosmos', 'grass']); planter(-14, 159); planter(-14, 66, 2.6, ['marigold', 'cosmos']);
  K.bench(13.4, -46, -Math.PI / 2, { y: CURB }); K.seat(13.4, CURB + 1.4, -46, Math.PI / 2, 'sit on the bench');
  K.bench(-13.4, -124, Math.PI / 2, { y: CURB }); K.seat(-13.4, CURB + 1.4, -124, -Math.PI / 2, 'sit on the bench');
  K.bench(13.4, -128, -Math.PI / 2, { y: CURB }); K.seat(13.4, CURB + 1.4, -128, Math.PI / 2, 'sit on the bench');
  K.bench(-13.4, -42, Math.PI / 2, { y: CURB }); K.seat(-13.4, CURB + 1.4, -42, -Math.PI / 2, 'sit on the bench');
  rack(13.3, 60); rack(-13.3, 176); rack(13.3, 160);
  bike(13.9, 60.4, Math.PI / 2, 'c#3f6a5a/0.4', CURB, { basket: true }); bike(13.9, 62.9, -Math.PI / 2 + 0.1, 'c#c9a02a/0.4'); bike(-13.9, 176.4, Math.PI / 2, 'c#34405a/0.4'); bike(13.9, 160.5, Math.PI / 2 - 0.08, 'c#b8452e/0.4', CURB, { basket: true });
  bin(13.2, 86); bin(-13.2, 60); bin(-13.2, 150); bin(13.2, 150);
  // pillar box, in the town's own green
  K.lathe('c#2f4a40/0.5', -13.3, CURB, 14, [[0.01, 0], [0.8, 0], [0.8, 0.3], [0.7, 0.4], [0.7, 4.2], [0.82, 4.3], [0.82, 4.5], [0.5, 4.9], [0.01, 5.0]], 16); K.box('c#17140f/0.5', -12.62, -12.58, CURB + 3.5, CURB + 3.65, 13.55, 14.45); K.collide(-14.1, -12.5, 13.2, 14.8, 5);

  dressFronts(K, town);
  buildPlaces(K, town);
  buildFlats(K, town); buildBacks(K, town); placeCreatures(K, town); hideEggs(K, town);

  // ======================================================================================
  // Built once materials exist, and the things that move
  // ======================================================================================
  const setup = ctx => {
    const { THREE: T3, scene, renderer, materials, animated, day } = ctx;
    K.G.build(scene, renderer, materials.grass);
    K.P.build(scene, mergeGeometries);
    K.F.build(scene);
    // String-light bulbs: one instanced mesh; they and the lamps' globes get a soft glow after dark.
    const glow = materials.make(GLOW);
    {
      const geo = new T3.SphereGeometry(0.12, 6, 5), inst = new T3.InstancedMesh(geo, glow, bulbs.length), m = new T3.Matrix4();
      bulbs.forEach((p, i) => inst.setMatrixAt(i, m.makeTranslation(p.x, p.y - 0.14, p.z)));
      inst.name = 'string lights'; inst.userData.cat = 'string lights'; inst.frustumCulled = false; scene.add(inst);
      for (const p of bulbs) K.glowDots.push([p.x, p.y - 0.14, p.z, 1.15]);
    }
    const dots = makeGlowDots(T3, K.glowDots); scene.add(dots.mesh);
    const on = () => 1 - T3.MathUtils.smoothstep(day.light, 0.42, 0.97);
    animated.push((t) => { wind.value = t; const k = on(); glow.emissiveIntensity = 0.12 + 2.3 * k; dots.set(k, t); });
    frontsLife(ctx, K);
    placesLife(ctx, K);
    for (const f of [flatsLife, backsLife, creaturesLife, eggsLife, chapelLife]) { try { f(ctx, K); } catch (e) { console.warn('street', f.name, e); } }
    for (const f of K.life) f(ctx);
  };

  return { setup, surfaces: K.surfaces, arrive: K.transit?.arrive };
}

// Soft glows round small lights (bulbs on a string, lamp globes, signs' lamps): camera-facing
// additive discs, one draw for the whole street.
function makeGlowDots(T3, list) {
  const N = list.length, geo = new T3.InstancedBufferGeometry().copy(new T3.PlaneGeometry(1, 1));
  const a = new Float32Array(N * 4); list.forEach((d, i) => a.set(d, i * 4));
  geo.setAttribute('aPos', new T3.InstancedBufferAttribute(a, 4)); geo.instanceCount = N;
  const uK = { value: 0 }, uT = { value: 0 };
  const mat = new T3.ShaderMaterial({
    uniforms: { uK, uT }, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, fog: false,
    vertexShader: `attribute vec4 aPos; uniform float uT; varying vec2 vUv; varying float vA;
void main() { vUv = uv * 2.0 - 1.0; vA = 1.0 + 0.06 * sin(uT * 2.3 + aPos.x * 1.7 + aPos.z * 2.9);
  vec4 mv = viewMatrix * vec4(aPos.xyz, 1.0); mv.xy += position.xy * aPos.w; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uK; varying vec2 vUv; varying float vA;
void main() { float r = dot(vUv, vUv); if (r > 1.0) discard; float g = 1.0 - r; g = g * g * g; gl_FragColor = vec4(vec3(1.0, 0.72, 0.4) * g * vA * uK, 1.0); }`,
  });
  const mesh = new T3.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 2; mesh.name = 'glow dots'; mesh.userData.cat = 'glow dots';
  return { mesh, set(k, t) { uK.value = 0.34 * k; uT.value = t; mesh.visible = k > 0.01; } };
}
