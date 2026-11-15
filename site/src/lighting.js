// Lighting: the indoor/outdoor split, the lamp pool, glows, and the eye's adaptation.
//
// The house is lit by a sun (or moon) with a static shadow map, an open-sky environment map
// and hemisphere light, a soft sky "fill", and a pool of four point lights shared out among
// the lamps nearest the visitor. Everything else here is cheap and mostly painted:
//
// - Indoors. Every MeshStandardMaterial gets a few lines of shader (patched in once, before
//   anything compiles) that ask whether the fragment lies inside the house's walls (five
//   boxes, compiled in as constants). Inside, the open-sky light is cut down to what windows
//   let in, the unshadowed sky fill is dropped (it shone through walls), and a soft warm
//   "room bounce" is added instead: strong by day, a low lamplit glow at night, so no room
//   is black even when none of its lamps are among the four. The sun and moon still come in
//   through the windows, with their shadows. The same glow makes the rooms show warm through
//   the windows when seen from the garden at night.
// - Glows. Lampshades, bulbs, lit fittings and lanterns are emissive; they are turned down by
//   day (unlit fabric and glass) and up from dusk. Window glass glows warm from outside after
//   dark, and soft additive cards lay the windows' light on the lawn and porch floors.
// - The pool (see pickLamps): by day the invisible daylight fills, from dusk the lamps, the
//   room you stand in first, then rooms you can see, with a little stickiness so lights do not
//   swap back and forth. Lamps make pools (inverse-square-ish falloff), fills are broad.
// - The hand lantern takes one of the four lights while it is lit.
// - Exposure: eyes adjust to indoors, porches and the garden, by day and night, quickly
//   toward darker (no blow-out on stepping outside), more slowly toward brighter.
// - A faint vignette (a CSS overlay, no GPU cost), a little stronger at night.
//
// Rooms that light themselves (roomLight; here lightShops, below). The four lights of the pool are
// too few for a room hung with twenty lamps, and the even 'room bounce' that kept every room legible also made
// every room the same flat amber after dark. In a room that asks for it, then, two things change while you
// stand in it: its own even light is lowered (each room says how far), and every lamp of the room near you that
// has no light from the pool lights it anyway, through a few lines of shader (diffuse only, no shadow, the same
// falloff as the pool's lamps, so that a lamp handed to the pool or back does not change). Pools of light read
// under the pendants and on the tables, and the room between them falls to a dim warm dusk; the eye opens a
// little to meet it (exposure), so nothing goes black. By day nothing changes: the windows light the room.
// - Daylight indoors takes the sky's colour at the hour (sky.js gives it): cool and pale at noon, gold in the
//   low sun, blue once the sun is down.
// - Window glass glows amber from outside after dark, wherever a lit room stands behind it.
// ?light=old shows all of this as it was, for comparing (and for timing one against the other).
//
// On Vesper Street (ported from the school's pilot, Cloud Spring Harbor, lighting.js) the same scheme does three
// more things, since the street after dark is most of what a visitor sees:
// - Every shop lights itself (lightShops, from main.js; the levels are in SHOP_NIGHT below). A shop is one box
//   of light from the windows to the back wall, and its partitions are passed to the shader as planes: a lamp in
//   the back room lights the front room only a little, through the opening, and the other way about.
// - Out of doors the street lamps that the pool has not lit are lit by the same lines of shader (the lamps
//   nearest the eye, after the room's own), so that every post along the street has its pool on the pavement,
//   not only the four nearest. They light only what is out of doors.
// - The string lights across the street lay a faint warm wash on the road and the pavements under them (one
//   term in the shader for the whole run of them: hundreds of small bulbs add up to a soft light from above).

import * as THREE from 'three';

const lerp = THREE.MathUtils.lerp, clamp = THREE.MathUtils.clamp, smooth = THREE.MathUtils.smoothstep;
const f = n => n.toFixed(3);
const wx = X => X, wz = Y => -Y;
const QS = new URLSearchParams(globalThis.location?.search ?? '');
export const LIGHT_OLD = QS.get('light') === 'old';
// The insides of the buildings, as boxes in world feet [x0, x1, z0, z1, y0, y1, floor, ceiling]
// (town.js and chapel.js give them: one for each shop and one for the chapel). The floor and ceiling of
// the box a surface lies in are what the corner shade is measured from; where they are left out,
// the two heights given to installHouseLight stand in.
let boxGLSL = '', overGLSL = '', FLOOR = 0.55, CEILING = 12.55;

const FEST_Y = 13.6;                // about where the string lights hang across the street (street.js: from the cornices at 15.5, sagging 3.6)
const FEST = Number(QS.get('fest') ?? 0.5);      // how bright their wash is after dark (?fest= to try another)
const SOFT = 24;                   // lamps lit by the shader beyond the pool's four: the room's own first, then the street's
// Shared uniform values. Plain objects (not THREE.Vector*) so that three's uniform cloning
// keeps a reference to them, and every material sees the same numbers.
export const HL = {
  amb: { x: 0, y: 0, z: 0 },       // warm room light added indoors (irradiance)
  k: { x: 1, y: 1, z: 1, w: 0 },   // indoors: sky diffuse scale, sky reflection scale, sky-fill cut, how far whites are held back by lamplight
  sh: { x: 0, y: 0, z: 0, w: 0 },  // indoors: corner shade on the room light, and on the lamps (set by shade.js)
  cav: new Float32Array(6 * 8),    // up to six open shelves near the eye, shaded inside: per shelf x0, z0, x1, z1 and y0, y1, open side, weight (shade.js)
  reg: new Float32Array(8),        // the room that lights itself, where the eye is: x0, z0, x1, z1 and y0, y1, on, 0 (roomLight)
  regAmb: { x: 0, y: 0, z: 0 },    // ...its own even light
  soft: new Float32Array(SOFT * 4),// ...and its lamps that the pool has not lit: x, y, z, strength (the live ones first)
  softCone: new Float32Array(SOFT),// ...for each, 1 if it is shaded (its light goes down in a cone), 0 if bare (a globe)
  softTint: { x: 1, y: 1, z: 1 },  // the lamps' colour (linear), as the pool's
  softN: { x: 0, y: 0 },           // ...how many of them are the room's (the first x), and where the street's end (y)
  split: new Float32Array(4),      // ...the room's partitions, as planes across the depth of the shop: x of each (two at most), how many, how much light passes
  fest: { x: 0, y: 0, z: 0, w: 0 },// the string lights' wash: half the width of the street they span, its two ends (z), and how strong
};

// ---- rooms that light themselves ----------------------------------------------------------
// roomLight({ name, x0, x1, z0, z1, y0, y1 }, { night: 0.4, splits: [x, ...] }): while the eye is in that room its
// even light after dark is night times the usual, and its lamps all light it (above). splits: partitions across the
// room, as world x (the depth of every shop on the street runs along x), through which a lamp gives only a little.
const REGIONS = [];
export function roomLight(room, o = {}) {
  if (LIGHT_OLD) return;
  // (let out half a foot into the walls: the room's own wall faces lie exactly on its edges, and there the test
  // came out one way or the other pixel by pixel, a speckle of bright and dim on the end walls after dark)
  const P = 0.5;
  REGIONS.push({ name: room.name, x0: room.x0 - P, x1: room.x1 + P, z0: room.z0 - P, z1: room.z1 + P, y0: room.y0 - P, y1: room.y1 + P, night: o.night ?? 1, splits: (o.splits ?? []).slice(0, 2), through: o.through ?? 0.2 });
}
// How far each shop's even light comes down after dark while you are in it, and where its partitions stand (feet
// from the inside of the shop front to the partition's middle, as the shop's file gives it to A.partition; a
// negative depth is measured from the back wall). The town's shops hold a dozen lamps each, brighter ones than the school's, so their even light can come
// down further (to a fifth or so) before anything goes muddy; lower where the room should be dim (the candle shop,
// the noodle bar), higher where it is a shop to see the things in.
const SHOP_NIGHT = {
  coffee: { night: 0.18, parts: [27.5] },        // three green enamel pendants over the bar, globes down the room, the snug's lamps and stove
  records: { night: 0.2, parts: [27.5] },
  museum: { night: 0.25, parts: [26.6] },         // cases to read by
  bakery: { night: 0.25, parts: [19.8] },
  grocery: { night: 0.25, parts: [32.2] },
  plants: { night: 0.2, parts: [29.2] },
  apothecary: { night: 0.12, parts: [31.0] },     // a candle shop: the dimmest on the street
  yoga: { night: 0.2, parts: [10.2, -7.1] },
  noodles: { night: 0.14, parts: [-7.3] },        // paper lanterns down the counter and over the booths: a noodle bar at night
  books: { night: 0.18, parts: [] },              // one long room
};
const CHAPEL_NIGHT = 0.22;                         // three coronas of candles, and the glass
// Called once the shops are furnished (main.js): every shop you can walk into, and the chapel.
export function lightShops(town) {
  if (LIGHT_OLD) return;
  for (const r of town.rooms ?? []) {
    const o = SHOP_NIGHT[r.lot];
    if (o && !r.shut) {
      const lot = town.lots?.[r.lot], s = lot?.side ?? 1;
      // the inside face of the shop front is at world x = s * (FRONT + 0.8); depth d runs outward from it by s
      const ui = s > 0 ? Math.min(r.x0, r.x1) : Math.max(r.x0, r.x1);
      roomLight({ ...r, y0: r.y0 + 0.5 }, { night: o.night, splits: o.parts.map(d => ui + s * (d < 0 ? (lot?.D ?? 42) + d : d)) });
    } else if (r.lot === 'chapel') roomLight({ ...r, y0: r.y0 + 0.5 }, { night: CHAPEL_NIGHT });
  }
}
const regionAt = p => REGIONS.find(r => p.x > r.x0 && p.x < r.x1 && p.z > r.z0 && p.z < r.z1 && p.y > r.y0 && p.y < r.y1) ?? null;
// what the eye has come to: the room it is lighting, and how far its even light has come down (1: not at all)
const ROOM = { r: null, k: 1, eff: 1, w: 0 };      // (w: how far its lamps are handed to the shader, 0..1)
export const LIGHT_STATE = { REGIONS, ROOM, get TUNE() { return TUNE; } };      // (for looking and tuning from the console)

let installed = false;
export function installHouseLight(boxes = [], floor = 0.55, ceil = 12.55) {
  if (installed) return; installed = true;
  FLOOR = floor; CEILING = ceil;
  // (a round end is given as { round: true, x, z, r, y0, y1, dx, dz, cos, floor, ceil }: within r of (x, z), and
  // within the angle whose cosine is cos of the direction (dx, dz): the school's building.js, roomArc; none on the street yet)
  boxGLSL = boxes.map(q => (q.round
    ? `  { vec2 q = p.xz - vec2(${f(q.x)}, ${f(q.z)}); float l = length(q); if (l < ${f(q.r)} && p.y > ${f(q.y0)} && p.y < ${f(q.y1)} && dot(q, vec2(${f(q.dx)}, ${f(q.dz)})) >= ${f(q.cos)} * l) { m = 1.0; hlFloor = ${f(q.floor ?? floor)}; hlCeil = ${f(q.ceil ?? ceil)}; } }`
    : (([x0, x1, z0, z1, y0, y1, fl = floor, cl = ceil]) => `  if (hlBox(p, vec3(${[x0, y0, z0].map(f)}), vec3(${[x1, y1, z1].map(f)})) > 0.5) { m = 1.0; hlFloor = ${f(fl)}; hlCeil = ${f(cl)}; }`)(q))).join('\n');
  // The plan of what is indoors, whatever the height: the boxes' rectangles (those that lie within another left
  // out). A room's finishes (indoorLit, below) are lit as indoors anywhere over these: the boxes are square and stop
  // under a sloping ceiling, and the plaster or boards between a box's top and the slates were lit as out of doors,
  // olive by day and black at night. Beyond the walls (an eave's soffit) the same materials are lit as outdoors.
  const rects = boxes.map(q => (q.round ? [q.x - q.r * 0.7, q.x + q.r * 0.7, q.z - q.r * 0.7, q.z + q.r * 0.7, q.y0] : [q[0], q[1], q[2], q[3], q[4]]));
  const within = (a, b2) => a !== b2 && a[0] >= b2[0] && a[1] <= b2[1] && a[2] >= b2[2] && a[3] <= b2[3] && a[4] >= b2[4];
  const plan = rects.filter((a, i) => !rects.some((b2, j) => within(a, b2) && !(within(b2, a) && j > i)));
  overGLSL = plan.map(([x0, x1, z0, z1, y0]) => `  if (p.x > ${f(x0)} && p.x < ${f(x1)} && p.z > ${f(z0)} && p.z < ${f(z1)} && p.y > ${f(y0)}) return 1.0;`).join('\n');
  const head = `
#define HOUSE_LIGHT
uniform vec3 uInAmb;
uniform vec4 uInK;
uniform vec4 uInSh;
uniform vec4 uInCav[12];
uniform vec4 uInReg[2];
uniform vec3 uInRegAmb, uInSoftTint;
uniform vec4 uInSoft[${SOFT}];
uniform vec4 uInSoftCone[${SOFT / 4}];
uniform vec2 uInSoftN;
uniform vec4 uInSplit, uInFest;
float hlInReg(vec3 p) {
  vec4 A = uInReg[0], B = uInReg[1];
  return (B.z > 0.5 && p.x > A.x && p.x < A.z && p.z > A.y && p.z < A.w && p.y > B.x && p.y < B.y) ? 1.0 : 0.0;
}
// The room's lamps that have no light of their own from the pool: as a point light of the pool's (a lamp's
// cutoff and decay, the light dropped below the shade), diffuse only. A shaded lamp (an enamel pendant, a
// table lamp) throws its light down in a broad cone: the wall beside it and the ceiling over it get only a
// little, from the glow of the shade, and the table under it the pool.
vec3 hlSoftLamps(vec3 p, vec3 n, int i0, int i1, bool room) {
  float s = 0.0;
  for (int i = 0; i < ${SOFT}; i++) {
    if (i < i0) continue;
    if (i >= i1) break;
    vec4 L = uInSoft[i];
    vec3 d = L.xyz - p; float l = max(length(d), 0.05);
    float w = clamp(1.0 - pow(l / ${f(SHAPE.lamp[0])}, 4.0), 0.0, 1.0);
    float cone = mix(1.0, 0.1 + 0.9 * smoothstep(0.25, 0.8, d.y / l), uInSoftCone[i >> 2][i & 3]);
    // a partition between the lamp and the spot: only what comes through the opening
    float sp = 1.0;
    if (room && uInSplit.z > 0.5 && (L.x - uInSplit.x) * (p.x - uInSplit.x) < 0.0) sp *= uInSplit.w;
    if (room && uInSplit.z > 1.5 && (L.x - uInSplit.y) * (p.x - uInSplit.y) < 0.0) sp *= uInSplit.w;
    s += L.w * sp * cone * w * w / max(pow(l, ${f(SHAPE.lamp[1])}), 0.01) * max(dot(n, d / l), 0.0);
  }
  return s * uInSoftTint;
}
// The string lights over the street: a soft light from above, strongest on the road under the middle of the
// strands, fading toward the shop fronts they are hung from and at the two ends of the run.
vec3 hlFestoon(vec3 p, vec3 n) {
  if (uInFest.w <= 0.0 || abs(p.x) > uInFest.x || p.z < uInFest.y || p.z > uInFest.z) return vec3(0.0);
  float edge = smoothstep(uInFest.x, uInFest.x - 4.0, abs(p.x)) * smoothstep(uInFest.y, uInFest.y + 8.0, p.z) * smoothstep(uInFest.z, uInFest.z - 8.0, p.z);
  float h = clamp(${f(FEST_Y)} - p.y, 1.0, 30.0);
  edge *= smoothstep(${f(FEST_Y + 0.5)}, ${f(FEST_Y - 1.5)}, p.y);      // nothing above the strings (the crowns of the trees had shone)
  return uInFest.w * edge * (0.25 + 0.75 * max(n.y, 0.0)) / (1.0 + h * h / 70.0) * vec3(1.0, 0.72, 0.42);
}
float hlFloor = ${f(FLOOR)}, hlCeil = ${f(CEILING)};      // of the room the fragment is in (set by houseInside)
float hlBox(vec3 p, vec3 a, vec3 b) { return (all(greaterThan(p, a)) && all(lessThan(p, b))) ? 1.0 : 0.0; }
float houseInside(vec3 p) {
  float m = 0.0;
${boxGLSL}
  return m;
}
float houseOver(vec3 p) {
${overGLSL}
  return 0.0;
}
// How open a spot indoors is, 1 in the open: less low on walls and on the sides of things (where
// they meet the floor), up under the ceiling, and on faces turned down (the undersides of things).
float houseShade(vec3 p, vec3 n, float inside) {
  if (inside < 0.5) return 1.0;
  float h = max(p.y - hlFloor, 0.0), c = max(hlCeil - p.y, 0.0);
  float side = 1.0 - abs(n.y);
  float a = 1.0 - side * (0.5 * exp(-1.8 * h) + 0.22 * exp(-3.0 * c));
  // inside an open shelf: darker toward the back (open side 0: +x, 1: -x, 2: +z, 3: -z)
  for (int i = 0; i < 6; i++) {
    vec4 A = uInCav[i * 2], B = uInCav[i * 2 + 1];
    if (B.w <= 0.0 || p.x < A.x || p.x > A.z || p.z < A.y || p.z > A.w || p.y < B.x || p.y > B.y) continue;
    float t = B.z < 0.5 ? (A.z - p.x) / (A.z - A.x) : B.z < 1.5 ? (p.x - A.x) / (A.z - A.x) : B.z < 2.5 ? (A.w - p.z) / (A.w - A.y) : (p.z - A.y) / (A.w - A.y);
    a *= 1.0 - B.w * 0.6 * smoothstep(0.05, 0.9, t);
  }
  return a * (1.0 + min(n.y, 0.0) * mix(0.55, 0.15, smoothstep(9.0, 11.5, h)));
}
`;
  const after = `
#ifdef HOUSE_LIGHT
  {
    float kd = mix(1.0, uInK.x, hlIn);
    float ao = mix(1.0, hlAO, uInSh.x);
    iblIrradiance *= kd * ao;
    vec3 hlA = uInAmb;
    vec3 hlN = inverseTransformDirection(normal, viewMatrix);
    if (hlIn > 0.5 && hlInReg(hlP) > 0.5) hlA = uInRegAmb + hlSoftLamps(hlP, hlN, 0, int(uInSoftN.x), true);
    irradiance = (irradiance * kd + hlIn * hlA) * ao;
    // out of doors: the street lamps the pool has not lit, and the string lights
    if (hlIn < 0.5) irradiance += hlSoftLamps(hlP, hlN, int(uInSoftN.x), int(uInSoftN.y), false) + hlFestoon(hlP, hlN);
    radiance *= mix(1.0, uInK.y, hlIn);
  }
#endif
`;
  for (const id of ['standard', 'physical']) {
    const S = THREE.ShaderLib[id];
    S.uniforms.uInAmb = { value: HL.amb };
    S.uniforms.uInK = { value: HL.k };
    S.uniforms.uInSh = { value: HL.sh };
    S.uniforms.uInCav = { value: HL.cav };
    S.uniforms.uInReg = { value: HL.reg };
    S.uniforms.uInRegAmb = { value: HL.regAmb };
    S.uniforms.uInSoft = { value: HL.soft };
    S.uniforms.uInSoftTint = { value: HL.softTint };
    S.uniforms.uInSoftCone = { value: HL.softCone };
    S.uniforms.uInSoftN = { value: HL.softN };
    S.uniforms.uInSplit = { value: HL.split };
    S.uniforms.uInFest = { value: HL.fest };
    S.fragmentShader = S.fragmentShader
      .replace('#include <common>', '#include <common>\n' + head)
      .replace('#include <lights_fragment_maps>', '#include <lights_fragment_maps>\n' + after);
  }
  // Where the fragment is, before any light is added (only where HOUSE_LIGHT is defined)
  let ch = THREE.ShaderChunk.lights_fragment_begin;
  ch = '#ifdef HOUSE_LIGHT\n\tvec3 hlP = cameraPosition + ( vec4( - vViewPosition, 0.0 ) * viewMatrix ).xyz;\n\tfloat hlIn = houseInside( hlP );\n\t#ifdef HOUSE_LIGHT_ALWAYS\n\thlIn = max( hlIn, houseOver( hlP ) );\n\t#endif\n\tfloat hlAO = houseShade( hlP, inverseTransformDirection( normal, viewMatrix ), hlIn );\n\tmaterial.diffuseColor /= 1.0 + uInK.w * hlIn * max( material.diffuseColor.r, max( material.diffuseColor.g, material.diffuseColor.b ) );\n#endif\n' + ch;
  // Indoors the sky fill (the second, unshadowed directional light) is dropped
  const dir = ch.indexOf('#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )');
  const re = ch.indexOf('RE_Direct( directLight', dir);
  // ...and a thing indoors that does not read the shadow map (a mesh without receiveShadow) gets no
  // sun or moon at all: unshadowed, they came straight through the roof, and pale things shone at night
  ch = ch.slice(0, re) + '#if defined( HOUSE_LIGHT ) && ( UNROLLED_LOOP_INDEX > 0 )\n\t\tdirectLight.color *= 1.0 - hlIn * uInK.z;\n\t\t#elif defined( HOUSE_LIGHT )\n\t\tif ( ! receiveShadow ) directLight.color *= 1.0 - hlIn;\n\t\t#endif\n\t\t' + ch.slice(re);
  // The lamps (the point lights, the first loop) are shaded in the corners too, a little
  ch = ch.replace('RE_Direct( directLight', '#ifdef HOUSE_LIGHT\n\t\tdirectLight.color *= mix( 1.0, hlAO, uInSh.y );\n\t\t#endif\n\t\tRE_Direct( directLight');
  THREE.ShaderChunk.lights_fragment_begin = ch;
}
// A material that should be lit as if outdoors wherever it is (window glass)
export function outdoorLit(m) {
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => { prev?.call(m, sh, r); sh.fragmentShader = sh.fragmentShader.replace('#define HOUSE_LIGHT', ''); };
  const key = m.customProgramCacheKey?.bind(m);
  m.customProgramCacheKey = () => (key ? key() : '') + '|out';
}
// A material that is a room's finish (plaster, a ceiling, the boards of an open roof): lit as indoors wherever it
// stands over the plan of a building's rooms, also above the boxes of light, which stop under a sloping ceiling.
export function indoorLit(m) {
  if (new URLSearchParams(globalThis.location?.search ?? '').get('indoorlit') === '0') return m;      // (?indoorlit=0: as it was, for comparing)
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => { prev?.call(m, sh, r); sh.fragmentShader = sh.fragmentShader.replace('#define HOUSE_LIGHT', '#define HOUSE_LIGHT\n#define HOUSE_LIGHT_ALWAYS'); };
  const key = m.customProgramCacheKey?.bind(m);
  m.customProgramCacheKey = () => (key ? key() : '') + '|in';
  m.userData.indoor = true;
  return m;
}

// ---- what the hour asks for ----------------------------------------------------------------
// lampOn: 0 by day, rising through the golden hour, 1 after dark.
export function lampOn(day) { return 1 - smooth(day.light, 0.42, 0.97); }

const NIGHT_AMB = Number(QS.get('amb') ?? 0.5);      // the rooms' own even light after dark (?amb= to try another)
const AMB_DAY = new THREE.Color(0.95, 0.86, 0.72), AMB_NIGHT = new THREE.Color(1.0, 0.74, 0.46), amb = new THREE.Color();
const ambDay = new THREE.Color(), ambNight = new THREE.Color(), tint = new THREE.Color(), HOUR = { L: 1, on: 0 };
// The colour of a room's daylight: mostly the warm bounce off its own floor and walls, but a third of it the
// colour of the sky in the windows at that hour, and in a low sun a little of the sun's own gold.
function daylightTint(day, out) {
  out.copy(AMB_DAY);
  if (LIGHT_OLD || !day.skyCol) return out;
  const sk = tint.copy(day.skyCol); sk.multiplyScalar(1 / Math.max(sk.r, sk.g, sk.b, 1e-3));
  out.lerp(sk, 0.35);
  if (day.sunCol && day.sunK > 0) { const su = sk.copy(day.sunCol); su.multiplyScalar(1 / Math.max(su.r, su.g, su.b, 1e-3)); out.lerp(su, 0.25 * day.sunK * (1 - day.low)); }
  return out;
}
export function setHourLight(day, materials) {
  const on = lampOn(day), L = day.light;
  // indoors: how much of the sky comes in, and the room's own light
  HL.k.x = lerp(0.12, 0.42, L);           // sky diffuse
  HL.k.y = lerp(0.1, 0.3, L);             // sky reflections
  HL.k.z = 1;                              // no sky fill through walls
  // By lamplight the eye is wide open (exposure, below) and anything white near a lamp burns out to
  // paper white beside mid-toned walls, as if lit from within. The palest surfaces are held back a
  // little after dark (white about a third, mid-tones hardly at all); by day nothing changes.
  HL.k.w = 0.7 * on;
  // (shops keep their lights on: after dark they are as bright inside as by day, only warmer)
  ambDay.copy(daylightTint(day, ambDay)).multiplyScalar(0.56); ambNight.copy(AMB_NIGHT).multiplyScalar(NIGHT_AMB);
  amb.copy(ambNight).lerp(ambDay, L);
  HL.amb.x = amb.r; HL.amb.y = amb.g; HL.amb.z = amb.b;
  HOUR.L = L; HOUR.on = on; setRoomAmb();
  // the string lights' wash on the street (FEST_Y): from the fronts' cornices on either side (x = +-24), the whole run
  if (!LIGHT_OLD) { HL.fest.x = 24.6; HL.fest.y = -192; HL.fest.z = 5; HL.fest.w = FEST * on; }
  // emissive glows: lamps and their shades
  for (const m of materials.glows ?? []) m.emissiveIntensity = m.userData.e0 * lerp(m.userData.day ?? 0.06, 1, on);
}

// A room lighting itself: its even light after dark is brought down by ROOM.k (by day it is as any room's)
function setRoomAmb() {
  amb.copy(ambNight).multiplyScalar(ROOM.k).lerp(ambDay, HOUR.L);
  HL.regAmb.x = amb.r; HL.regAmb.y = amb.g; HL.regAmb.z = amb.b;
  ROOM.eff = lerp(1, ROOM.k, HOUR.on);
}

// ---- glowing windows and their light on the ground, after dark ------------------------------
export function makeWindowGlow({ scene, materials, windows, rooms, groundY = 0.56 }) {
  const glass = materials.glass;
  outdoorLit(glass);
  // After dark the glass glows amber from outside (as the house's does), but only where a room stands behind it:
  // the shader looks four feet past the pane (the walls are up to two thick), along the line of sight, and asks
  // whether that is indoors (the boxes of light). An attic or a stair with no box behind its window stays dark glass. One material for every
  // pane on the island, so it is all lit rooms or none; the rooms' own lamps and light, seen through the glass,
  // do the rest. (The pane is nearly clear, and its light is tone-mapped before it is laid over the room behind,
  // so a glow on clear glass could never show more than a seventh of itself: where it glows the pane is made
  // a little less clear, as old glass with a lit room behind it looks from the dark.) Glass that is itself indoors
  // (a display case, a glazed partition) does not glow: seen from the street it is lit as the room is. Nor does a
  // pane seen edge-on: a shop window looked along from the pavement shows the street in it, not the room (it had
  // made every bay down the street a flat slab of amber).
  if (!LIGHT_OLD) {
    glass.emissive = new THREE.Color(0xffb15e); glass.emissiveIntensity = 0;
    const prev = glass.onBeforeCompile;
    glass.onBeforeCompile = (sh, r) => { prev?.call(glass, sh, r);
      sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n\t{ vec3 wp = cameraPosition + ( vec4( - vViewPosition, 0.0 ) * viewMatrix ).xyz; float g = houseInside( wp + normalize( wp - cameraPosition ) * 4.0 ) * ( 1.0 - houseInside( wp ) ); g *= smoothstep( 0.12, 0.5, abs( dot( normal, normalize( vViewPosition ) ) ) ); totalEmissiveRadiance *= g; diffuseColor.a = mix( diffuseColor.a, ${f(GLASS_A)}, g * clamp( emissive.r / ${f(GLASS_GLOW)}, 0.0, 1.0 ) ); }`); };
    const key = glass.customProgramCacheKey?.bind(glass);
    glass.customProgramCacheKey = () => (key ? key() : '') + '|lit';
  }
  // cards on the ground below the ground-floor windows (one draw)
  const tex = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 18, 2, 32, 26, 40); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); return t;
  })();
  const pos = [], uv = [], idx = [];
  const floorAt = () => groundY;
  for (const w of windows) {
    const out = -w.sg, len = 11, wide = (w.u1 - w.u0) + 3, mid = (w.u0 + w.u1) / 2;
    // plan: window wall is at c (on the axis across the wall); outward is -sg
    const P = (u, d) => (w.isX ? [wx(u), wz(w.c + out * d)] : [wx(w.c + out * d), wz(u)]);
    const [tx, tz] = P(mid, 2.5), y = floorAt(tx, tz);
    const n = pos.length / 3;
    for (const [u, d, a, b] of [[mid - wide / 2, 0.9, 0, 0], [mid + wide / 2, 0.9, 1, 0], [mid + wide / 2, len, 1, 1], [mid - wide / 2, len, 0, 1]]) { const [x, z] = P(u, d); pos.push(x, y, z); uv.push(a, 1 - b); }
    idx.push(n, n + 1, n + 2, n, n + 2, n + 3, n, n + 2, n + 1, n, n + 3, n + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  // (no slope factor in the offset: from the basement, where the eye is barely above grade, a slope-scaled offset
  // pulled these patches of window light on the ground through two feet of wall as a bright line at sill height)
  const spillMat = new THREE.MeshBasicMaterial({ map: tex, color: 0xffb466, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, polygonOffset: true, polygonOffsetFactor: 0, polygonOffsetUnits: -4 });
  const spill = new THREE.Mesh(geo, spillMat); spill.name = 'window light'; spill.userData.cat = 'window light'; spill.renderOrder = 1; spill.visible = false;
  scene.add(spill);
  return {
    // night: 0..1; outside: is the eye outdoors (glass glows only from outside)
    update(night, outside, glowsOn) {
      const k = Math.max(smooth(night, 0.25, 0.9), 0.6 * (Number(glowsOn) || 0));      // the windows begin to glow as the lamps come on at dusk
      spillMat.opacity = (LIGHT_OLD ? 0.3 : SPILL) * k; spill.visible = k > 0.01;
      if (!LIGHT_OLD) glass.emissiveIntensity = outside ? GLASS_GLOW * k : 0;
    },
  };
}

const SPILL = Number(QS.get('spill') ?? 0.45);      // the shop windows' light on the pavement (?spill=)
const GLASS_GLOW = Number(QS.get('glassglow') ?? 0.18), GLASS_A = Number(QS.get('glassa') ?? 0.14);      // (lower than the school's: a shop window is to be seen through: the glow of a lit room's pane, and how far it clouds the glass)

// ---- the lamp pool ------------------------------------------------------------------------
// lamps: { x, y, z, power, kind } (kind 'fill' | 'lamp' | 'candle' | 'fire'). Four point lights
// are shared out. Their falloff depends on the kind: lamps and candles make pools, fills and
// the fire spread wide.
const TINT = { fire: 0xff9a4a, candle: 0xffb060, corona: 0xffb468, lamp: 0xffcf96, fill: 0xffe6c8, lantern: 0xffc583 };      // (corona: a hoop of candles hung high, as in the chapel)
const SHAPE = { fill: [36, 1.0], lamp: [26, 1.9], candle: [12, 2.0], corona: [38, 1.5], fire: [26, 1.5], lantern: [32, 1.35] };
const LAMP = 13;
// The street's lamp posts: brighter than a room's lamp, as a street lamp is; their pools are what the pavement is
// lit by after dark (they had been no brighter than a table lamp, and the street was lit mostly by the moon).
const STREET_K = Number(QS.get('streetk') ?? 1.7);
// Where the light sits relative to the lamp's record: fills come down from near the ceiling (they
// left hot spots on it); lamps hang just below the shade's rim or the lantern's glass, since a light
// a few inches inside a shade lit the fabric chalk white whatever its glow.
const DROP = { fill: 1.8, lamp: 0.45 };
export function makeLampPool({ scene, lamps, vis, size, day, camera }) {
  const pool = Array.from({ length: size }, () => { const p = new THREE.PointLight(0xffdcb0, 0, 30, 1.7); scene.add(p); return { light: p, lamp: null, level: 0 }; });
  // how strong a lamp is at this hour
  const strength = l => {
    if (LIGHT_OLD && l.pilot) return 0;                 // (?light=old: the lamps added for the lighting pilot are not there)
    const on = lampOn(day);
    if (l.kind === 'fill') return l.power * 0.4 * smooth(day.light, 0.25, 0.9);
    if (l.kind === 'lamp') return l.power * on * 2.2 * (l.street && !LIGHT_OLD ? STREET_K : 1);
    if (l.kind === 'candle') return l.power * (0.6 + 1.6 * on);
    if (l.kind === 'corona') return l.power * (0.3 + 2.1 * on);      // candlelight: faint against the day, the room's light after dark
    if (l.kind === 'glow') return 0;                                 // a flame's halo only (makeHalos): it lights nothing by itself
    return l.power * (1 + day.night);                   // fire
  };
  const zoneOf = l => (l.zone ??= vis.roomAt(l.x, l.y, l.z)?.id ?? 'o:');
  // "seen" is remembered for a few seconds, so that turning your head on a landing does not
  // keep trading one lamp for another (which pulsed the whole view)
  let nowT = 0;
  const seen = l => { if (zoneOf(l) === 'o:' ? vis.state.out : vis.state.seen.has(l.zone)) l.seenAt = nowT; return nowT - (l.seenAt ?? -1e9) < 6; };
  const here = l => vis.state.here.includes(zoneOf(l));
  // Smaller is better: distance (height counts triple, floors apart), less for strong lamps,
  // much less for the room you are in, more for lamps behind walls, and a little stickiness.
  function score(l, eye, held) {
    const s = strength(l);
    if (s <= 0.01) return Infinity;
    const d = Math.hypot(l.x - eye.x, l.z - eye.z) + Math.abs(l.y - eye.y) * 3;
    const outside = vis.state.here.includes('out'), indoorLamp = zoneOf(l) !== 'o:';
    return d / (0.4 + s) * (here(l) ? 0.55 : seen(l) ? 1 : 2.2) * (held ? 0.62 : 1)
      * (l.kind === 'fire' ? 0.5 : 1)                    // a lit fire is always worth one of the four
      * (outside && indoorLamp ? 1.8 : 1)                // from the garden, rooms glow by themselves (lighting.js); light the garden
      * (!outside && !indoorLamp && !LIGHT_OLD ? 2.2 : 1); // and from indoors a street lamp beyond the glass lights little of the room
  }
  let lantern = null;                                    // { pos: Vector3 } when carried
  const tmp = new THREE.Vector3();
  function choose(eye, n, held = new Set()) {
    return lamps.filter(l => l.power > 0)
      .map(l => ({ l, d: score(l, eye, held.has(l)) })).filter(o => o.d < Infinity)
      .sort((a, b) => a.d - b.d).slice(0, n).map(o => o.l);
  }
  function update(eye, dt, t) {
    nowT = t;
    const n = size - (lantern ? 1 : 0);
    const near = choose(eye, n, new Set(pool.map(s => s.lamp).filter(Boolean)));
    const slots = lantern ? pool.slice(0, n) : pool;
    // Coming into a room, its lamps must not wait their turn: a lamp of the room you stand in that has no
    // light yet takes one from a lamp elsewhere at once if that lamp's room is out of sight, and in a
    // fifth of a second if not. (Each light used to fade out over a second and a half first, and the
    // room stood dark, with only its shades glowing, while the eye had already adjusted to indoors.)
    // The same change as in the house (my_house, lighting.js).
    const urgent = near.some(l => here(l) && !pool.some(o => o.lamp === l));
    const inSight = l => here(l) || (zoneOf(l) === 'o:' ? vis.state.out : vis.state.seen.has(l.zone));
    for (const s of slots) {
      if (s.lamp === 'lantern') { s.lamp = null; s.level = 0; }
      const wanted = s.lamp && near.includes(s.lamp), mine = s.lamp && here(s.lamp), hurry = urgent && s.lamp && !wanted && !mine;
      if (hurry && !inSight(s.lamp)) s.level = 0;
      s.level += ((wanted ? 1 : 0) - s.level) * Math.min(1, dt * (wanted ? (mine ? 10 : 5.5) : hurry ? 14 : 2.4));      // otherwise slow, so a change of lamp is a drift, not a blink
      if (!wanted && s.level < (hurry ? 0.06 : 0.02)) {
        const free = near.find(l => !pool.some(o => o.lamp === l));
        s.lamp = free ?? null; s.level = free ? s.level : 0;
        if (free) { s.light.position.set(free.x, free.y - (DROP[free.kind] ?? 0), free.z); s.light.color.set(TINT[free.kind]); [s.light.distance, s.light.decay] = SHAPE[free.kind]; }
      }
      const live = s.lamp && (s.lamp.kind === 'fire' || s.lamp.kind === 'candle' || s.lamp.kind === 'corona');
      const flicker = live ? 1 + 0.1 * Math.sin(t * 9.1 + s.lamp.x) + 0.07 * Math.sin(t * 23.7 + s.lamp.z) + 0.04 * Math.sin(t * 41.3) : 1;
      s.light.intensity = s.lamp ? LAMP * strength(s.lamp) * s.level * flicker * poolShare(s.lamp) : 0;
    }
    if (lantern) {
      const s = pool[size - 1];
      if (s.lamp !== 'lantern') { s.lamp = 'lantern'; s.level = 0; s.light.color.set(TINT.lantern); [s.light.distance, s.light.decay] = SHAPE.lantern; }
      s.level += (1 - s.level) * Math.min(1, dt * 4);
      camera.localToWorld(s.light.position.copy(lantern.at));
      const flick = 1 + 0.035 * Math.sin(t * 13.3) + 0.025 * Math.sin(t * 29.1);
      s.light.intensity = lantern.power * lerp(0.35, 1, day.night) * s.level * flick;
    } else if (pool[size - 1].lamp === 'lantern') { pool[size - 1].lamp = null; pool[size - 1].level = 0; pool[size - 1].light.intensity = 0; }
    if (!LIGHT_OLD) roomUpdate(eye, dt);
  }
  // A room that lights itself (roomLight, above). Coming in, its even light comes down over a second or two (and
  // the eye opens to meet it, makeExposure); going out, it goes back up before the room is let go, so that it is
  // never seen to jump from the doorway. Its lamps are lit in the shader as the even light goes, so that the room
  // holds about the same light throughout and only its shape changes.
  // A shaded lamp of such a room, while the room is lit this way, gives the pool's point light (which shines all
  // round, up the wall and onto the ceiling) only a third of its light, and the shader the rest, in its cone.
  const inRoom = (l, r) => l.x > r.x0 && l.x < r.x1 && l.z > r.z0 && l.z < r.z1 && l.y > r.y0 && l.y < r.y1;
  const CONE_POOL = 0.35;
  const poolShare = l => (l.cone && ROOM.r && inRoom(l, ROOM.r) ? lerp(1, CONE_POOL, ROOM.w) : 1);
  const softC = new THREE.Color(TINT.lamp);
  HL.softTint.x = softC.r; HL.softTint.y = softC.g; HL.softTint.z = softC.b;
  // the lamps that light the street: out of doors (no room's), lamps rather than fires or candles
  let outLamps = null;
  const ROOMLIT = { lamp: 1, corona: 1, candle: 1 };
  const ROOM_SOFT = 12, OUT_REACH = 120;      // the slots for the room's lamps (the rest are the street's), and how far the street's are lit
  function roomUpdate(eye, dt) {
    const lvl = new Map(pool.map(s => [s.lamp, s.level]));
    let i = 0;
    const inR = regionAt(eye);
    if (inR && inR !== ROOM.r && (!ROOM.r || ROOM.k > 0.98)) { ROOM.r = inR; ROOM.k = Math.max(ROOM.k, 0.98); }
    let r = ROOM.r;
    if (r) {
      const aim = inR === r ? r.night : 1;
      ROOM.k += (aim - ROOM.k) * Math.min(1, dt * 1.6);
      if (inR !== r && ROOM.k > 0.98) { ROOM.r = r = null; ROOM.k = 1; ROOM.w = 0; HL.reg[6] = 0; HL.split[2] = 0; setRoomAmb(); }
    } else { HL.reg[6] = 0; ROOM.w = 0; }
    if (r) {
      HL.reg.set([r.x0, r.z0, r.x1, r.z1, r.y0, r.y1, 1, 0]);
      HL.split.set([r.splits[0] ?? 0, r.splits[1] ?? 0, r.splits.length, r.through]);
      setRoomAmb();
      // the room's lamps near the eye, each lit by the shader as far as the pool has not lit it
      const w = ROOM.w = r.night < 1 ? clamp((1 - ROOM.k) / (1 - r.night), 0, 1) : 1;
      const mine = lamps.filter(l => ROOMLIT[l.kind] && l.power > 0 && inRoom(l, r))
        .map(l => ({ l, d: Math.hypot(l.x - eye.x, l.y - eye.y, l.z - eye.z), s: strength(l) * (1 - (lvl.get(l) ?? 0) * poolShare(l)) * w })).filter(o => o.s > 0.002)
        .sort((a, b) => a.d - b.d).slice(0, ROOM_SOFT);
      for (const { l, s } of mine) { HL.soft.set([l.x, l.y - (DROP[l.kind] ?? 0), l.z, LAMP * s], i * 4); HL.softCone[i] = l.cone ? 1 : 0; i++; }
    }
    HL.softN.x = i;
    // then the street's lamps near the eye that the pool has not lit, wherever the eye is (they are seen through
    // the shop windows too); lit only on what is out of doors
    outLamps ??= lamps.filter(l => l.kind === 'lamp' && zoneOf(l) === 'o:');
    // They have their own share of the slots (the room's count does not change it, so nothing on the street changes
    // as you go in at a door), the lamp posts before the rest, and each fades out toward the edge of the reach, so that
    // walking down the street the far pools come and go by degrees, not at a step.
    if (HOUR.on > 0.01) {
      const near = outLamps.filter(l => l.power > 0)
        .map(l => { const d = Math.hypot(l.x - eye.x, l.z - eye.z); return { l, d, s: strength(l) * (1 - (lvl.get(l) ?? 0)) * (1 - smooth(d, OUT_REACH * 0.7, OUT_REACH)) }; }).filter(o => o.s > 0.002)
        .sort((a, b) => (a.l.street ? 0 : 1) - (b.l.street ? 0 : 1) || a.d - b.d).slice(0, SOFT - ROOM_SOFT);
      for (const { l, s } of near) { HL.soft.set([l.x, l.y - DROP.lamp, l.z, LAMP * s], i * 4); HL.softCone[i] = l.cone ? 1 : 0; i++; }
    }
    HL.softN.y = i;
  }
  return {
    update, strength, pool, choose,
    describe: l => `${l.kind}${l.halo ? '*' : ''}@${(l.zone ?? zoneOf(l)).replace('r:', '')}:${strength(l).toFixed(2)}`,
    setLantern(on, o = {}) { lantern = on ? { at: new THREE.Vector3(...(o.at ?? [0.55, -0.42, -1.1])), power: o.power ?? 22 } : null; },
    get lanternOn() { return !!lantern; },
  };
}

// ---- eyes adjusting -----------------------------------------------------------------------
// Targets by where you are (in / half / out) and the hour; changes are made in log space, quick
// toward darker and almost as quick toward brighter, so stepping outside never whites out and a room is
// never left dark while the eye catches up.
// (the school's 0.17 brightened the shops more than their lowered light took away: they are lit mostly by their lamps.
// LIGHT_STATE.TUNE, to try another from the console)
const TUNE = { eyeOpen: Number(QS.get('eyeopen') ?? 0.08) };
export function makeExposure(Q) {
  const inDay = Number(Q.get('exp') ?? 1.6);
  const T = { in: [inDay, 2.0, 2.6], half: [1.35, 1.9, 2.45], out: [0.8, 1.35, 2.2] };     // day, dusk, night
  let cur = null;
  function target(where, day) {
    const [a, b, c] = T[where] ?? T.out, on = lampOn(day);
    // day -> dusk as the lamps come on; dusk -> night as the sky goes dark
    return day.night > 0.5 ? lerp(b, c, smooth(day.night, 0.5, 1)) : lerp(a, b, Math.min(1, on * 1.4));
  }
  return {
    update(renderer, where, day, dt, snap) {
      // in a room that has brought its own light down after dark, the eye opens a little to meet it: a sixth
      // of the way (in log terms), so the room reads darker than its neighbours but never black
      const aim = target(where, day) * (where === 'in' ? Math.pow(ROOM.eff, -TUNE.eyeOpen) : 1);
      if (cur === null || snap) cur = aim;
      else { const k = aim < cur ? 3.4 : 3.6;      // (it used to take two or three seconds to brighten on coming indoors: a room stood dark while it did)
        cur = Math.exp(Math.log(cur) + (Math.log(aim) - Math.log(cur)) * Math.min(1, dt * k)); }
      renderer.toneMappingExposure = cur;
    },
    target,
  };
}

// ---- vignette --------------------------------------------------------------------------------
export function makeVignette() {
  const v = document.createElement('div');
  v.setAttribute('aria-hidden', 'true');
  Object.assign(v.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '1', transition: 'opacity 1.5s', background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(12,8,4,.22) 82%, rgba(8,5,2,.42) 100%)' });
  const canvas = document.querySelector('canvas');
  (canvas?.parentNode ?? document.body).insertBefore(v, canvas?.nextSibling ?? null);
  return { set(night) { v.style.opacity = String(0.55 + 0.45 * night); } };
}

// ---- halos: the soft glow round a lit shade or a candle flame -------------------------------
// One instanced, camera-facing quad per lamp (a single draw), additive, faded in with the lamps.
// Lamps carry `halo` (a size in feet) where kit/light.js made a shade; candles get a small one
// while lit. Walls hide them as they hide anything else.
export function makeHalos({ scene, lamps, day }) {
  const list = () => lamps.filter(l => l.halo || l.kind === 'candle');
  let L = list();
  const N = Math.max(1, L.length + 16);
  const geo = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1));
  const aPos = new THREE.InstancedBufferAttribute(new Float32Array(N * 4), 4);            // xyz, size
  const aOn = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
  aPos.setUsage(THREE.DynamicDrawUsage); aOn.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aPos', aPos); geo.setAttribute('aOn', aOn); geo.instanceCount = 0;
  const uK = { value: 0 }, uT = { value: 0 };
  const mat = new THREE.ShaderMaterial({
    uniforms: { uK, uT }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `attribute vec4 aPos; attribute float aOn; uniform float uT; varying vec2 vUv; varying float vA;
void main() { vUv = uv * 2.0 - 1.0; vA = aOn * (1.0 + 0.05 * sin(uT * 9.0 + aPos.x * 3.0) * step(aPos.w, 1.2));
  vec4 mv = viewMatrix * vec4(aPos.xyz, 1.0); mv.xy += position.xy * aPos.w; mv.z += 0.3 * aPos.w; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uK; varying vec2 vUv; varying float vA;
void main() { float r = dot(vUv, vUv); if (r > 1.0) discard; float g = (1.0 - r); g = g * g * g; gl_FragColor = vec4(vec3(1.0, 0.64, 0.33) * g * vA * uK, 1.0); }`,
  });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 2; mesh.name = 'halos'; mesh.userData.cat = 'halos';
  scene.add(mesh);
  return {
    update(t) {
      if (L.length !== list().length) L = list();
      const on = lampOn(day);
      uK.value = 0.22 * on; uT.value = t;
      let n = 0;
      if (on > 0.01) for (const l of L) {
        if (n >= N) break;
        const candle = l.kind === 'candle';
        if (l.power <= 0) continue;
        aPos.setXYZW(n, l.x, l.y + (candle ? -0.12 : 0.05), l.z, candle ? 0.9 : (l.halo ?? 1) * 2.4); aOn.setX(n, candle ? 1.4 : 1); n++;
      }
      geo.instanceCount = n; mesh.visible = n > 0;
      aPos.needsUpdate = aOn.needsUpdate = true;
    },
  };
}
