// The robots who keep the shops. Each shop file describes its clerk (kit.clerks.push({...})):
//
//   id, name, lot          who, and whose shop
//   look                   { shape: 'egg'|'squat'|'round'|'tall', colour, belly, trim, eye, ring, hover,
//                            hat: 'beanie'|'beret'|'cap'|'toque'|'straw'|'bun'|'none', hatColour, apron, scarf, bowtie,
//                            specs: true, blush: true, headphones: colour, antenna: true,
//                            tool: 'cup'|'record'|'book'|'can'|'duster'|'ladle'|'wrench'|'candle'|'fish' }
//   home [x, z]            where they stand (world; lot.world(a, d) gives it); faces [x, z]: what they look at when alone
//   posts [[x, z], ...]    other spots they drift to and fuss at, in a straight line from home: keep the way clear
//   serve                  { machine: [x, z], pickup: { xz: [x, z], y } } if they make things to order; optional
//                          drinks: { name: { vessel, liquid, note, last } } and food: { name: { build: THREE => Object3D, bites, note } }.
//                          What they make is set on the counter and taken in the hand (hold.js): Q sips or bites.
//   lines                  greet[], idle[], bye[], topics[{ q, a, next: [topics], serve: 'drink name', then: ctx => {} }]
//
// E on a clerk opens a small card of things to say (clerks/talk.js). They greet you when you come in,
// mutter to themselves, turn to watch you, and go back to fussing with the stock when you ignore them.

import { makeBubbles } from './clerks/bubbles.js';
import { makeTalk } from './clerks/talk.js';
import { useThree, paint, solid, makeFace, xform as T, merge, mesh, sph, cyl, visor } from './clerks/models.js';
import { useThreeDrinks, buildDrink, setFill } from './clerks/drinks.js';

let THREE;
const TAU = Math.PI * 2;

// ---- bodies ------------------------------------------------------------------------------------------
const SHAPES = { egg: { R: 0.58, s: [1, 1.2, 0.95] }, squat: { R: 0.66, s: [1.16, 0.82, 1.04] }, round: { R: 0.56, s: [1, 1, 1] }, tall: { R: 0.5, s: [0.95, 1.42, 0.92] },
  bean: { R: 0.5, s: [0.88, 1.62, 0.84] }, bun: { R: 0.7, s: [1.22, 0.7, 1.12] }, pear: { R: 0.56, s: [1.08, 1.12, 1.0] }, pip: { R: 0.44, s: [1, 1.08, 1] }, barrel: { R: 0.6, s: [1.0, 1.05, 1.0] } };

// Who is who. Each robot's own look, laid over whatever its shop file asked for, so that no two on the
// street share a silhouette, a face or a way of carrying themselves. (Shop files may still set colours;
// the things that make a robot recognisable from across the street are decided here, in one place.)
//   shape, scale; pattern: 'stripes' | 'speckle' | 'split' | 'band' with colour2; top: what grows out of the head
//   ('sprout' | 'flame' | 'coil' | 'quill' | 'dish' | 'pleats' | 'prop' | 'halo' | 'bulb'); ears: 'cups' | 'bolts' | 'fins';
//   buttons; face: eyeW, eyeH, eyeR, gap, lashes, brows (tilt), moustache, freckles, monocle; rest: the expression at rest;
//   roam: false to stay put, or a radius in feet for those who work out of doors
const IDENT = {
  juniper: { shape: 'egg', hat: 'beanie', pom: true, eyeW: 38, eyeH: 48, gap: 44, blush: true, freckles: 'rgba(255,200,150,.7)', rest: 'happy' },
  otis: { shape: 'squat', scale: 1.06, pattern: 'band', colour2: '#e0723c', eyeW: 44, eyeH: 20, eyeR: 6, gap: 50, brows: -1, rest: 'sass', blush: false },
  olive: { shape: 'round', scale: 1.0, eyeW: 24, eyeH: 24, eyeR: 12, gap: 52, lashes: true, blush: true, ears: 'cups', rest: 'happy' },
  folio: { shape: 'bean', scale: 0.96, pattern: 'split', colour2: '#efe4cf', eyeW: 20, eyeH: 26, eyeR: 10, gap: 40, top: 'quill', rest: 'neutral' },
  moss: { shape: 'pear', hat: 'none', top: 'sprout', pattern: 'speckle', colour2: '#8fb05a', eyeW: 40, eyeH: 30, gap: 46, rest: 'sleepy', blush: true, apron: null },
  ember: { shape: 'pip', scale: 0.92, top: 'flame', eyeW: 22, eyeH: 54, eyeR: 11, gap: 34, eye: '#ffb060', rest: 'neutral' },
  bao: { shape: 'bun', hat: 'none', top: 'pleats', colour: '#f3ecdc', belly: '#f3ecdc', pattern: 'band', colour2: '#c8402f', eyeW: 30, eyeH: 30, eyeR: 15, gap: 58, blush: true, rest: 'happy', roam: false },
  gus: { shape: 'bean', scale: 1.08, buttons: '#c9a45c', moustache: '#ffe9c0', eyeW: 22, eyeH: 22, eyeR: 11, gap: 38, ears: 'bolts', rest: 'neutral', roam: 16 },
  crumb: { shape: 'barrel', pattern: 'speckle', colour2: '#f4ecdc', eyeW: 40, eyeH: 34, gap: 48, brows: 0.6, ears: 'fins', rest: 'sleepy' },
  hesper: { shape: 'round', scale: 1.04, colour: '#26314a', pattern: 'split', colour2: '#1a2030', bowtie: '#c9a45c', top: 'bulb', eyeW: 40, eyeH: 16, eyeR: 8, gap: 46, brows: -0.5, rest: 'sass', ears: null, roam: 9 },
  moth: { shape: 'pip', scale: 0.9, colour: '#d9d2c2', pattern: 'speckle', colour2: '#b9ae98', ears: 'fins', top: 'coil', eyeW: 44, eyeH: 44, eyeR: 22, gap: 50, eye: '#cfe3ff', rest: 'neutral' },
  sol: { shape: 'tall', top: 'halo', pattern: 'stripes', colour2: '#f0c98a', eyeW: 36, eyeH: 40, gap: 44, rest: 'happy', roam: false },
  quill: { shape: 'bean', scale: 1.12, top: 'coil', monocle: true, specs: true, eyeW: 26, eyeH: 34, gap: 42, buttons: '#c9a45c', brows: 0.4, rest: 'focus', antenna: false },
};
// Anyone not listed above still gets something of their own, chosen by name
const SPARE = [{ shape: 'pear', top: 'dish', ears: 'bolts', eyeW: 34, eyeH: 34, eyeR: 17 }, { shape: 'barrel', top: 'prop', pattern: 'stripes', eyeW: 46, eyeH: 24, eyeR: 8 }, { shape: 'pip', top: 'bulb', ears: 'cups', eyeW: 26, eyeH: 44 },
  { shape: 'bun', top: 'coil', pattern: 'split', eyeW: 30, eyeH: 30, eyeR: 15, moustache: '#ffe9c0' }, { shape: 'bean', top: 'sprout', pattern: 'speckle', eyeW: 22, eyeH: 30, lashes: true }, { shape: 'squat', top: 'flame', ears: 'fins', eyeW: 40, eyeH: 40, brows: -0.6 }];
const identity = (id = '') => IDENT[id] ?? SPARE[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % SPARE.length];
const TOOLS = {
  cup: () => [paint(T(cyl(0.11, 0.085, 0.2, 14), { p: [0, 0.12, 0.1] }), '#efe6d2'), paint(T(new THREE.TorusGeometry(0.06, 0.016, 5, 10, Math.PI), { p: [0.12, 0.12, 0.1], r: [0, 0, -Math.PI / 2] }), '#efe6d2'), paint(T(cyl(0.095, 0.095, 0.01, 12), { p: [0, 0.215, 0.1] }), '#4a2c1a')],
  record: () => [paint(T(cyl(0.42, 0.42, 0.012, 28), { p: [0, 0.2, 0.12], r: [Math.PI / 2 - 0.25, 0, 0] }), '#141416'), paint(T(cyl(0.14, 0.14, 0.016, 18), { p: [0, 0.2, 0.12], r: [Math.PI / 2 - 0.25, 0, 0] }), '#e0723c')],
  book: () => [paint(T(new THREE.BoxGeometry(0.34, 0.46, 0.07), { p: [0, 0.18, 0.1], r: [0.3, 0.2, 0] }), '#7a2f2a'), paint(T(new THREE.BoxGeometry(0.31, 0.43, 0.075), { p: [0.012, 0.18, 0.1], r: [0.3, 0.2, 0] }), '#efe6d2')],
  can: () => [paint(T(cyl(0.15, 0.17, 0.3, 14), { p: [0, -0.16, 0.12] }), '#9aa4a8'), paint(T(cyl(0.02, 0.032, 0.46, 8), { p: [0, -0.1, 0.4], r: [1.0, 0, 0] }), '#9aa4a8'), paint(T(new THREE.TorusGeometry(0.12, 0.018, 6, 12, Math.PI), { p: [0, 0.0, 0.08], r: [0, Math.PI / 2, 0] }), '#8a9498')],
  duster: () => [paint(T(cyl(0.018, 0.018, 0.5, 6), { p: [0, 0.2, 0.08] }), '#5b4630'), paint(T(sph(0.14, 10, 8), { p: [0, 0.52, 0.08], s: [1, 1.5, 1] }), '#e9c46a')],
  ladle: () => [paint(T(cyl(0.016, 0.016, 0.6, 6), { p: [0, 0.2, 0.08], r: [0.2, 0, 0] }), '#b9bcc0'), paint(T(new THREE.SphereGeometry(0.09, 10, 6, 0, TAU, Math.PI / 2, Math.PI / 2), { p: [0, -0.1, 0.02] }), '#b9bcc0')],
  wrench: () => [paint(T(new THREE.BoxGeometry(0.05, 0.5, 0.03), { p: [0, 0.2, 0.08] }), '#b9bcc0'), paint(T(new THREE.TorusGeometry(0.07, 0.025, 5, 10, Math.PI * 1.5), { p: [0, 0.48, 0.08], r: [0, 0, 0.8] }), '#b9bcc0')],
  candle: () => [paint(T(cyl(0.06, 0.06, 0.34, 10), { p: [0, 0.2, 0.08] }), '#efe6d2'), paint(T(cyl(0.12, 0.14, 0.04, 12), { p: [0, 0.02, 0.08] }), '#c9a45c'), paint(T(sph(0.035, 8, 6), { p: [0, 0.42, 0.08], s: [1, 1.8, 1] }), '#ffcf70')],
  fish: () => [paint(T(new THREE.BoxGeometry(0.34, 0.07, 0.22), { p: [0, 0.1, 0.12] }), '#c8402f'), paint(T(new THREE.BoxGeometry(0.3, 0.072, 0.18), { p: [0, 0.1, 0.12] }), '#e9c46a')],
};

function buildClerk(look) {
  const sh = SHAPES[look.shape ?? 'egg'], R = sh.R, S = sh.s, hover = look.hover ?? 3.4;
  const root = new THREE.Group(), bob = new THREE.Group(); root.add(bob); bob.position.y = hover; if (look.scale) bob.scale.setScalar(look.scale);
  const C = look.colour ?? '#8a3d6b', BELLY = look.belly ?? '#efe4cf', TRIM = look.trim ?? '#c9a45c', C2 = look.colour2 ?? BELLY, parts = [];
  const top = R * S[1];                                                    // crown of the body
  // the coat: plain, or striped, speckled, two-tone, or with one band round the middle
  const pat = look.pattern, coat = p => (pat === 'stripes' ? (Math.floor((p.y / top + 1) * 4.5) % 2 ? C2 : C)
    : pat === 'speckle' ? (Math.sin(p.x * 23 + p.y * 7) * Math.sin(p.z * 19 - p.y * 11) * Math.sin(p.y * 29 + p.x * 5) > 0.3 ? C2 : C)
    : pat === 'split' ? (p.y < -top * 0.12 ? C2 : C) : pat === 'band' ? (Math.abs(p.y - top * 0.42) < top * 0.09 ? C2 : C) : C);
  parts.push(paint(T(sph(R, 30, 22), { s: S }), p => (look.apron && p.z > R * S[2] * 0.25 && p.y < -top * 0.02 && Math.abs(p.x) < R * 0.62 ? look.apron : coat(p))));
  if (look.buttons) for (let i = 0; i < 4; i++) { const y = top * (0.3 - i * 0.22), rr = Math.sqrt(Math.max(0.05, 1 - (y / top) ** 2)); parts.push(paint(T(sph(0.035, 8, 6), { p: [0, y, R * S[2] * rr * 0.99] }), look.buttons)); }
  if (look.buttons) for (const sx of [-1, 1]) parts.push(paint(T(new THREE.BoxGeometry(0.26, 0.05, 0.2), { p: [sx * R * S[0] * 0.72, top * 0.62, 0], r: [0, 0, -sx * 0.6] }), look.buttons));      // epaulettes
  if (look.ears === 'cups') for (const sx of [-1, 1]) parts.push(paint(T(new THREE.TorusGeometry(0.15, 0.04, 6, 14), { p: [sx * (R * S[0] + 0.1), top * 0.1, 0], r: [0, 0, 0] }), TRIM));
  if (look.ears === 'bolts') for (const sx of [-1, 1]) parts.push(paint(T(cyl(0.11, 0.11, 0.1, 6), { p: [sx * (R * S[0] + 0.03), top * 0.12, 0], r: [0, 0, Math.PI / 2] }), TRIM), paint(T(cyl(0.05, 0.05, 0.2, 8), { p: [sx * (R * S[0] + 0.1), top * 0.12, 0], r: [0, 0, Math.PI / 2] }), '#5b4630'));
  if (look.ears === 'fins') for (const sx of [-1, 1]) parts.push(paint(T(new THREE.ConeGeometry(0.16, 0.36, 4), { p: [sx * (R * S[0] + 0.08), top * 0.2, -0.05], r: [0, 0, -sx * 1.1], s: [1, 1, 0.3] }), TRIM));
  // what grows out of the top of the head
  const tp = look.top, ty = top - 0.02;
  if (tp === 'sprout') { parts.push(paint(T(cyl(0.014, 0.02, 0.2, 6), { p: [0, ty + 0.1, 0] }), '#5b4630')); for (const [rz, ry, sc] of [[-0.75, 0.3, 1], [0.7, -0.5, 0.82], [0.1, 1.9, 0.62]]) parts.push(paint(T(sph(0.2, 12, 8), { p: [0, 0.2, 0], s: [0.5 * sc, 1.25 * sc, 0.12] }), '#7fae52').applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, ry, rz)).setPosition(0, ty + 0.16, 0))); }
  if (tp === 'flame') { parts.push(paint(T(cyl(0.02, 0.03, 0.12, 6), { p: [0, ty + 0.05, 0] }), '#3a2a20'), paint(T(sph(0.1, 10, 8), { p: [0, ty + 0.24, 0], s: [0.8, 1.7, 0.8] }), '#ffb347'), paint(T(sph(0.055, 8, 6), { p: [0, ty + 0.22, 0.01], s: [0.8, 1.6, 0.8] }), '#fff1b8')); }
  if (tp === 'coil') { for (let i = 0; i < 4; i++) parts.push(paint(T(new THREE.TorusGeometry(0.09 - i * 0.012, 0.016, 5, 14), { p: [0, ty + 0.05 + i * 0.07, 0], r: [Math.PI / 2 + 0.18, 0, 0] }), TRIM)); parts.push(paint(T(sph(0.05, 8, 6), { p: [0, ty + 0.36, 0] }), '#e0723c')); }
  if (tp === 'quill') { parts.push(paint(T(cyl(0.01, 0.014, 0.6, 5), { p: [0.2, ty + 0.14, -0.1], r: [0.2, 0, -0.75] }), '#efe4cf'), paint(T(sph(0.12, 10, 6), { p: [0.34, ty + 0.3, -0.13], r: [0.2, 0, -0.75], s: [0.45, 2.1, 0.12] }), '#f4eee2')); }
  if (tp === 'dish') { parts.push(paint(T(cyl(0.014, 0.02, 0.2, 6), { p: [0, ty + 0.1, 0] }), '#5b4630'), paint(T(new THREE.SphereGeometry(0.2, 14, 6, 0, TAU, 0, 1.0), { p: [0, ty + 0.36, 0.02], r: [Math.PI - 0.5, 0, 0] }), TRIM)); }
  if (tp === 'pleats') { for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; parts.push(paint(T(sph(0.07, 6, 5), { p: [Math.cos(a) * 0.2, ty + 0.03, Math.sin(a) * 0.2], r: [0, -a, 0], s: [1.5, 1.1, 0.5] }), BELLY)); } parts.push(paint(T(sph(0.13, 10, 8), { p: [0, ty + 0.1, 0], s: [1, 0.85, 1] }), BELLY)); }
  if (tp === 'prop') { parts.push(paint(T(cyl(0.02, 0.025, 0.16, 6), { p: [0, ty + 0.08, 0] }), '#5b4630')); for (const ry of [0, Math.PI / 2]) parts.push(paint(T(new THREE.BoxGeometry(0.62, 0.015, 0.09), { p: [0, ty + 0.17, 0], r: [0.12, ry, 0] }), TRIM)); }
  if (tp === 'halo') parts.push(paint(T(new THREE.TorusGeometry(R * 0.5, 0.025, 6, 28), { p: [0, ty + 0.28, 0], r: [Math.PI / 2 + 0.12, 0, 0] }), '#ffe0a0'));
  if (tp === 'bulb') { parts.push(paint(T(cyl(0.04, 0.05, 0.08, 8), { p: [0, ty + 0.04, 0] }), TRIM), paint(T(sph(0.11, 10, 8), { p: [0, ty + 0.18, 0] }), '#fff1b8')); }
  if (!look.apron) parts.push(paint(visor(R + 0.006, 0.62, 1.7, 2.6, S), BELLY));
  else { parts.push(paint(T(new THREE.TorusGeometry(R * S[0] * 0.99, 0.022, 6, 40), { p: [0, -top * 0.04, 0], r: [Math.PI / 2, 0, 0], s: [1, S[2] / S[0], 1] }), look.apron));      // apron string
    parts.push(paint(T(new THREE.BoxGeometry(R * 0.5, 0.2, 0.03), { p: [0, -top * 0.42, R * S[2] * 0.86], r: [0.42, 0, 0] }), TRIM)); }                                                       // its pocket
  parts.push(paint(T(new THREE.TorusGeometry(R * S[0] + 0.012, 0.03, 8, 44), { p: [0, top * 0.02, 0], r: [Math.PI / 2, 0, 0], s: [1, S[2] / S[0], 1] }), TRIM));
  parts.push(paint(T(new THREE.SphereGeometry(R * 0.5, 18, 8, 0, TAU, Math.PI / 2, Math.PI / 2), { p: [0, -top * 0.86, 0], s: [1, 0.6, 1] }), TRIM));
  if (look.bowtie) { for (const sx of [-1, 1]) parts.push(paint(T(new THREE.ConeGeometry(0.08, 0.16, 10), { p: [sx * 0.08, -top * 0.02, R * S[2] * 0.97], r: [0, 0, -sx * Math.PI / 2], s: [1, 1, 0.55] }), look.bowtie)); }
  if (look.scarf) { parts.push(paint(T(new THREE.TorusGeometry(R * S[0] * 0.8, 0.075, 8, 30), { p: [0, top * 0.5, 0], r: [Math.PI / 2, 0, 0], s: [1, S[2] / S[0], 0.8] }), look.scarf)); parts.push(paint(T(new THREE.BoxGeometry(0.14, 0.42, 0.05), { p: [R * 0.4, top * 0.28, R * S[2] * 0.72], r: [0.2, 0, -0.15] }), look.scarf)); }
  // hats
  const HC = look.hatColour ?? '#b8452e', hat = [];
  if (look.hat === 'beanie') { hat.push(paint(T(new THREE.SphereGeometry(R * 0.78, 20, 10, 0, TAU, 0, Math.PI / 2), { s: [1, 0.72, 1] }), HC), paint(T(new THREE.TorusGeometry(R * 0.76, 0.06, 8, 26), { r: [Math.PI / 2, 0, 0] }), HC), ...(look.pom === false ? [] : [paint(T(sph(0.085, 8, 6), { p: [0, R * 0.58, 0] }), BELLY)])); }
  else if (look.hat === 'beret') { hat.push(paint(T(sph(R * 0.72, 20, 10), { p: [0.06, 0.06, 0], s: [1.08, 0.3, 1.02], r: [0, 0, -0.18] }), HC), paint(T(cyl(0.015, 0.015, 0.08, 5), { p: [0.06, 0.26, 0] }), HC)); }
  else if (look.hat === 'cap') { hat.push(paint(T(new THREE.SphereGeometry(R * 0.72, 20, 10, 0, TAU, 0, Math.PI / 2), { s: [1, 0.62, 1] }), HC), paint(T(cyl(R * 0.5, R * 0.5, 0.025, 20, 1), { p: [0, 0.02, R * 0.52], s: [1, 1, 0.9] }), HC)); }
  else if (look.hat === 'toque') { hat.push(paint(T(cyl(R * 0.52, R * 0.48, 0.3, 20), { p: [0, 0.14, 0] }), '#f4f1ea'), paint(T(sph(R * 0.62, 18, 10), { p: [0, 0.42, 0], s: [1, 0.62, 1] }), '#f4f1ea')); }
  else if (look.hat === 'straw') { hat.push(paint(T(cyl(R * 1.25, R * 1.28, 0.03, 28), {}), '#d9b866'), paint(T(cyl(R * 0.5, R * 0.6, 0.24, 22), { p: [0, 0.13, 0] }), '#d4b25e'), paint(T(cyl(R * 0.61, R * 0.61, 0.06, 22), { p: [0, 0.05, 0] }), HC)); }
  else if (look.hat === 'bun') { hat.push(paint(T(sph(R * 0.3, 12, 10), { p: [0, 0.1, -0.05] }), HC), paint(T(cyl(0.012, 0.012, 0.5, 5), { p: [0, 0.14, -0.05], r: [0, 0, 1.2] }), TRIM)); }
  for (const g of hat) parts.push(T(T(g, { r: [look.hat === 'straw' ? 0.1 : -0.1, 0, look.hat === 'beret' ? 0 : -0.12] }), { p: [0, top * (look.hat === 'bun' ? 0.98 : 0.74), -0.02] }));
  if (look.antenna) { parts.push(paint(T(cyl(0.012, 0.016, 0.3, 6), { p: [0, top + 0.13, 0] }), '#5b4630'), paint(T(sph(0.05, 8, 6), { p: [0, top + 0.3, 0] }), TRIM)); }
  if (look.headphones) { parts.push(paint(T(new THREE.TorusGeometry(R * S[0] * 1.02, 0.035, 6, 24, Math.PI), { p: [0, top * 0.18, 0] }), '#1d1b18')); for (const sx of [-1, 1]) parts.push(paint(T(cyl(0.2, 0.2, 0.12, 16), { p: [sx * R * S[0] * 1.03, top * 0.16, 0], r: [0, 0, Math.PI / 2] }), look.headphones)); }
  const fs = { eye: look.eye ?? '#ffe2b0', gap: look.gap ?? 44, eyeW: look.eyeW ?? 36, eyeH: look.eyeH ?? 46, eyeR: look.eyeR, bg: look.faceBg ?? '#120c10', lashes: look.lashes, brows: look.brows, moustache: look.moustache, freckles: look.freckles, monocle: look.monocle };
  if (look.specs) fs.specs = 'rgba(255,240,210,.6)'; if (look.blush) fs.blush = 'rgba(255,120,150,.5)';
  const face = makeFace(fs); face.mesh = mesh(visor(R + 0.008, 0.82, 0.66, 1.4, S), face.mat);
  const body = mesh(merge(parts)); bob.add(body, face.mesh);
  const ring = new THREE.Mesh(T(new THREE.TorusGeometry(R * 0.5, 0.032, 8, 30), { r: [Math.PI / 2, 0, 0] }), new THREE.MeshBasicMaterial({ color: look.ring ?? 0x8fe3d1, toneMapped: false, transparent: true, opacity: 0.85 }));
  ring.position.y = -top - 0.24; bob.add(ring);
  const glove = paint(T(sph(0.12, 10, 7), { s: [1, 0.85, 1.15] }), look.glove ?? '#f4eee2');
  const hands = [[-(R * S[0] + 0.22), -top * 0.18, 0.16], [R * S[0] + 0.22, -top * 0.18, 0.16]].map((p, i) => {
    const h = new THREE.Group(); h.position.set(...p); h.userData.rest = p;
    h.add(mesh(i === 1 && TOOLS[look.tool] ? merge([glove.clone(), ...TOOLS[look.tool]()]) : glove.clone())); bob.add(h); return h;
  });
  root.traverse(o => { o.castShadow = false; o.receiveShadow = !!o.isMesh; });
  return { root, bob, body, face, ring, hands, top: hover + (top + (look.hat && look.hat !== 'none' || look.top ? 0.55 : 0.15)) * (look.scale ?? 1), hover, belly: hover - (top + 0.3) * (look.scale ?? 1) };
}

// ---- behaviour ---------------------------------------------------------------------------------------------
const pick = a => a[Math.floor(Math.random() * a.length)];
const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.42], [1, -1, 1.42], [-1, 1, 1.42], [-1, -1, 1.42]];
const turnTo = (cur, aim, k) => { let d = ((aim - cur + Math.PI * 3) % TAU) - Math.PI; return cur + d * Math.min(1, k); };

class Clerk {
  constructor(H, spec) {
    const id = identity(spec.id), look = { ...(spec.look ?? {}), ...id }; if (id.apron === null) delete look.apron;
    this.H = H; this.spec = { name: spec.name, ...spec, look }; this.name = spec.name; this.f = 0; this.rest = id.rest ?? 'neutral';
    this.roam = id.roam ?? spec.roam ?? true; this.path = null; this.grid = null; this.gridAt = -1e9;
    const b = this.body = buildClerk(look);
    [this.x, this.z] = spec.home; this.y = spec.floor ?? 0.55; this.yaw = 0; this.phase = Math.random() * 10;
    this.homeYaw = spec.faces ? Math.atan2(spec.faces[0] - this.x, spec.faces[1] - this.z) : 0; this.yaw = this.homeYaw;
    b.root.position.set(this.x, this.y, this.z); b.root.rotation.y = this.yaw; H.group.add(b.root);
    this.bubble = H.bubbles.make(spec.name);
    this.state = 'home'; this.until = H.now + 8 + Math.random() * 14; this.target = null; this.queue = []; this.expr = 'neutral'; this.exprUntil = 0;
    this.greeted = -1e9; this.wasIn = false; this.nextIdle = H.now + 20 + Math.random() * 30; this.drink = null;
    this.item = { x: this.x, y: this.y + b.hover, z: this.z, reach: 10, size: 1.7, label: () => (H.talk.robot === this ? 'say the next thing' : `talk to ${spec.name}`), act: () => H.talk.press(this) };
    H.ctx.interact.push(this.item);
  }
  say(text, expr = 'happy', secs) { if (!text) return; this.bubble.say(text, secs, this.H.now); this.expr = expr; this.exprUntil = this.H.now + 3.5; this.H.ctx.sound?.chirp?.(this.spec.chirp ?? [70 + (this.name.length % 5) * 2, 74 + (this.name.length % 4) * 2]); }
  line(kind) { const l = this.spec.lines?.[kind]; if (l?.length) this.say(pick(l), kind === 'idle' ? 'neutral' : 'happy'); }
  topics(list) {
    return list.slice(0, 4).map(t => ({ text: t.q, act: () => {
      this.say(Array.isArray(t.a) ? pick(t.a) : t.a, t.expr ?? (t.serve ? 'wink' : 'happy'), 6);
      if (t.serve && this.spec.serve) this.queue.push(t.serve);
      t.then?.(this.H.ctx, this);
      this.asked = (this.asked ?? 0) + 1;
      return t.next ? this.topics(t.next) : null;
    } }));
  }
  dialogue() {
    // Up to four things to say; a longer list turns over so the later ones get their turn
    const all = this.spec.lines?.topics ?? [], n = all.length, k = (this.asked ?? 0) % Math.max(1, n);
    const list = n <= 4 ? all : [...all.slice(0, 2), ...[0, 1].map(i => all[2 + ((k + i) % (n - 2))])];
    this.expr = 'happy'; this.exprUntil = this.H.now + 2;
    return this.topics(list);
  }
  // ---- getting about: a one-foot grid of the shop (or of the ground round an outdoor stall), made from the
  // same obstacles the visitor meets. A robot floats, so anything lower than its belly (a counter, a table,
  // a crate) it simply drifts over; shelves, walls and the visitor it goes round.
  area() {
    const r = this.H.ctx.house.rooms.find(r => r.lot === this.spec.lot), [hx, hz] = this.spec.home, R = typeof this.roam === 'number' ? this.roam : 10;
    return r ? { x0: r.x0 + 0.9, x1: r.x1 - 0.9, z0: r.z0 + 0.9, z1: r.z1 - 0.9 } : { x0: hx - R, x1: hx + R, z0: hz - R, z1: hz + R };
  }
  remap() {
    const A = this.area(), W = Math.max(1, Math.ceil(A.x1 - A.x0)), D = Math.max(1, Math.ceil(A.z1 - A.z0)), cells = new Uint8Array(W * D);
    const lo = this.y + this.body.belly, hi = this.y + this.body.top, pad = (this.spec.radius ?? 0.75) * (this.spec.look.scale ?? 1);
    for (const c of this.H.ctx.colliders) {
      if (c.off || c.y1 <= lo || c.y0 >= hi || c.x1 < A.x0 - 1 || c.x0 > A.x1 + 1 || c.z1 < A.z0 - 1 || c.z0 > A.z1 + 1) continue;
      const i0 = Math.max(0, Math.floor(c.x0 - pad - A.x0)), i1 = Math.min(W - 1, Math.floor(c.x1 + pad - A.x0)), j0 = Math.max(0, Math.floor(c.z0 - pad - A.z0)), j1 = Math.min(D - 1, Math.floor(c.z1 + pad - A.z0));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) cells[j * W + i] = 1;
    }
    this.grid = { A, W, D, cells }; this.gridAt = this.H.now;
  }
  cell(x, z) { const g = this.grid, i = Math.floor(x - g.A.x0), j = Math.floor(z - g.A.z0); return i < 0 || j < 0 || i >= g.W || j >= g.D ? -1 : j * g.W + i; }
  // the free cell nearest a point (the robot's own home may be inside the padding of its counter)
  nearFree(x, z) {
    const g = this.grid, c0 = this.cell(Math.max(g.A.x0, Math.min(g.A.x1 - 0.01, x)), Math.max(g.A.z0, Math.min(g.A.z1 - 0.01, z)));
    if (c0 >= 0 && !g.cells[c0]) return c0;
    let best = -1, bd = 1e9; for (let k = 0; k < g.cells.length; k++) if (!g.cells[k]) { const d = (k % g.W + 0.5 + g.A.x0 - x) ** 2 + (Math.floor(k / g.W) + 0.5 + g.A.z0 - z) ** 2; if (d < bd) { bd = d; best = k; } }
    return best;
  }
  route(tx, tz) {
    if (!this.grid || this.H.now - this.gridAt > 25) this.remap();
    const g = this.grid, s = this.nearFree(this.x, this.z), e = this.nearFree(tx, tz); if (s < 0 || e < 0) return null;
    const prev = new Int32Array(g.cells.length).fill(-1), dist = new Float32Array(g.cells.length).fill(1e9), open = [s]; dist[s] = 0; prev[s] = s;
    while (open.length) {                                                   // the grids are thirty feet square: plain Dijkstra is plenty
      let bi = 0; for (let k = 1; k < open.length; k++) if (dist[open[k]] < dist[open[bi]]) bi = k;
      const c = open.splice(bi, 1)[0]; if (c === e) break;
      const ci = c % g.W, cj = (c - ci) / g.W;
      for (const [di, dj, w] of NB) { const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= g.W || j >= g.D) continue; const n = j * g.W + i; if (g.cells[n] || (di && dj && (g.cells[cj * g.W + i] || g.cells[j * g.W + ci]))) continue; const d = dist[c] + w; if (d < dist[n]) { if (dist[n] > 1e8) open.push(n); dist[n] = d; prev[n] = c; } }
    }
    if (prev[e] < 0) return null;
    const pts = []; for (let c = e; c !== s; c = prev[c]) pts.push([c % g.W + 0.5 + g.A.x0, Math.floor(c / g.W) + 0.5 + g.A.z0]);
    pts.reverse(); if (e === this.cell(tx, tz)) pts.push([tx, tz]);
    return pts;
  }
  go(p, then) {
    const path = this.route(p[0], p[1]);
    this.path = path?.length ? path : [[p[0], p[1]]]; this.target = { x: this.path[0][0], z: this.path[0][1], then }; this.state = 'go';
  }
  // somewhere to drift to: one of the shop file's posts, or any clear spot in the shop not on top of the visitor
  somewhere() {
    const sp = this.spec, v = this.H.visitor;
    if (sp.posts?.length && Math.random() < 0.45) return pick(sp.posts);
    if (!this.grid || this.H.now - this.gridAt > 25) this.remap();
    const g = this.grid;
    for (let k = 0; k < 24; k++) { const c = Math.floor(Math.random() * g.cells.length); if (g.cells[c]) continue; const x = c % g.W + 0.5 + g.A.x0, z = Math.floor(c / g.W) + 0.5 + g.A.z0; if (Math.hypot(x - v.x, z - v.z) > 4.5 && Math.hypot(x - this.x, z - this.z) > 4) return [x, z]; }
    return sp.posts?.length ? pick(sp.posts) : null;
  }
  update(dt) {
    const H = this.H, now = H.now, v = H.visitor, b = this.body, sp = this.spec;
    const inShop = v.room?.lot === sp.lot || (sp.reach && !v.room && Math.abs(v.y - this.y) < 7 && Math.hypot(v.x - this.x, v.z - this.z) < sp.reach);
    const dv = Math.hypot(v.x - this.x, v.z - this.z);
    // coming and going
    if (inShop && !this.wasIn && now - this.greeted > 45) { this.greeted = now; setTimeout(() => this.line('greet'), 600); }
    if (!inShop && this.wasIn && now - this.greeted > 12 && Math.random() < 0.6) this.line('bye');
    this.wasIn = inShop;
    if (inShop && now > this.nextIdle && H.talk.robot !== this && !this.bubble.talking(now)) { this.line('idle'); this.nextIdle = now + 28 + Math.random() * 40; }
    // what to do next
    const talking = H.talk.robot === this;
    if (this.state === 'home') {
      if (this.queue.length && !talking) this.startDrink(this.queue.shift());
      else if (now > this.until && !talking && this.roam) { const p = this.somewhere(); if (p) { this.trips = (this.trips ?? 0) + 1; this.go(p, () => { this.state = 'fuss'; this.fussYaw = this.yaw; this.until = this.H.now + 3 + Math.random() * 5; }); } else this.until = now + 6; }
    } else if (this.state === 'fuss' && this.queue.length && !talking) this.startDrink(this.queue.shift());
    else if (this.state === 'fuss' && now > this.until) {                // on to the next thing, or back to their own place every third trip (sooner if someone has come in)
      const home = this.trips % 3 === 0 || (inShop && !this.wasHome), p = home ? sp.home : this.somewhere() ?? sp.home; this.wasHome = home; if (!home) this.trips++;
      this.go(p, home ? () => { this.state = 'home'; this.until = this.H.now + 8 + Math.random() * 14; } : () => { this.state = 'fuss'; this.fussYaw = this.yaw; this.until = this.H.now + 3 + Math.random() * 5; });
    }
    else if (this.state === 'make' && now > this.until) { this.go(sp.home, () => { this.state = 'home'; this.until = this.H.now + 12; this.finishDrink(); }); }
    // moving
    let aimYaw = this.homeYaw, moving = false;
    if (this.state === 'go' && this.target) {
      if (talking) aimYaw = Math.atan2(v.x - this.x, v.z - this.z);            // wait for the conversation
      else {
        const dx = this.target.x - this.x, dz = this.target.z - this.z, d = Math.hypot(dx, dz), step = (sp.speed ?? 2.6) * dt;
        const blocked = Math.hypot(v.x - this.target.x, v.z - this.target.z) < 2.2 && d < 3.2;                 // the visitor is standing where it was going: wait politely
        if (blocked) aimYaw = Math.atan2(v.x - this.x, v.z - this.z);
        else if (d <= step) { this.x = this.target.x; this.z = this.target.z; const t = this.target; this.path?.shift(); if (this.path?.length) { this.target = { x: this.path[0][0], z: this.path[0][1], then: t.then }; } else { this.target = null; this.path = null; this.state = 'home'; t.then?.(); } }
        else { this.x += dx / d * step; this.z += dz / d * step; aimYaw = Math.atan2(dx, dz); moving = true; }
      }
    } else if (this.state === 'fuss' || this.state === 'make') aimYaw = this.fussYaw ?? this.yaw;
    else if ((inShop && dv < 22) || talking) aimYaw = Math.atan2(v.x - this.x, v.z - this.z);
    this.yaw = turnTo(this.yaw, aimYaw, dt * (moving ? 6 : 3.2));
    // the body
    const t = now + this.phase, bobY = Math.sin(t * 1.7) * 0.07;
    b.root.position.set(this.x, this.y, this.z); b.root.rotation.y = this.yaw;
    b.bob.position.y = b.hover + bobY; b.bob.rotation.z = Math.sin(t * 0.9) * 0.03 + (moving ? 0.05 : 0); b.bob.rotation.x = moving ? 0.1 : Math.sin(t * 0.7) * 0.02;
    b.ring.scale.setScalar(1 + 0.08 * Math.sin(t * 5)); b.ring.material.opacity = 0.6 + 0.25 * Math.sin(t * 5);
    const busy = this.state === 'fuss' || this.state === 'make', speak = this.bubble.talking(now);
    b.hands.forEach((h, i) => { const r = h.userData.rest, s = i ? 1 : -1; h.position.set(r[0] + (busy ? -s * 0.12 : 0), r[1] + Math.sin(t * 2.1 + i * 2) * 0.03 + (busy ? 0.16 + 0.1 * Math.sin(t * 6 + i * 3) : speak && i === 0 ? 0.14 + 0.06 * Math.sin(t * 7) : 0), r[2] + (busy ? 0.26 : 0)); });
    const expr = now < this.exprUntil ? this.expr : busy ? 'focus' : inShop && dv < 9 && this.rest === 'neutral' ? 'happy' : this.rest;
    const look = Math.max(-1, Math.min(1, (((Math.atan2(v.x - this.x, v.z - this.z) - this.yaw + Math.PI * 3) % TAU) - Math.PI) * 1.2));
    b.face.draw(expr, inShop ? look : 0, ((t * 0.31) % 1) < 0.035);
    this.item.x = this.x; this.item.z = this.z; this.item.y = this.y + b.hover;
    H.tmp.set(this.x, this.y + b.top + 0.35, this.z); H.bubbles.place(this.bubble, H.tmp, now, b.root.visible);
  }
  // Drinks: off to the machine, a hiss and a wait, and the cup is set down on the counter for you
  startDrink(name) {
    const sv = this.spec.serve; this.making = name; if (this.H.debug) console.log('DRINK start', name);
    this.go(sv.machine, () => { this.state = 'make'; this.until = this.H.now + 4.2; this.fussYaw = this.yaw; this.H.ctx.sound?.chirp?.([55, 55, 58], 0.03); });
  }
  finishDrink() {
    const H = this.H, sv = this.spec.serve, name = this.making; if (H.debug) console.log('DRINK finish', name); if (!name) return; this.making = null;
    if (this.drink) { H.group.remove(this.drink.g); const i = H.ctx.interact.indexOf(this.drink.item); if (i >= 0) H.ctx.interact.splice(i, 1); this.drink = null; }
    // a dish (serve.food[name] = { build: THREE => Object3D, bites, note }) or a drink in one of drinks.js's vessels
    const dish = sv.food?.[name], spec = sv.drinks?.[name];
    const iced = /đá|cold|iced|spritz|tonic/.test(name), choc = /chocolate|cocoa/.test(name), tea = /tea/.test(name), short = /espresso|cortado/.test(name);
    const g = dish ? dish.build(THREE) : buildDrink({ id: name, vessel: spec?.vessel ?? (iced ? 'highball' : short ? 'demitasse' : tea ? 'teacup' : choc ? 'mug' : 'latte'), liquid: spec?.liquid ?? (iced ? 0x6a4226 : tea ? 0xb8a04a : choc ? 0x5a3020 : short ? 0x3b2416 : 0xc9a27a) });
    if (!dish) { g.scale.setScalar(1.25); setFill(g, 1, 0); }
    g.position.set(sv.pickup.xz[0], sv.pickup.y, sv.pickup.xz[1]); H.group.add(g);
    const d = { name, food: !!dish, bites: dish?.bites ?? 3, note: dish?.note ?? spec?.note, last: spec?.last };
    const item = { x: g.position.x, y: g.position.y + 0.2, z: g.position.z, reach: 7, size: 0.9, label: () => `take your ${name}`, act: () => {
      const i = H.ctx.interact.indexOf(item); if (i >= 0) H.ctx.interact.splice(i, 1); this.drink = null;
      if (H.ctx.hold) H.ctx.hold(d, g, { from: g.position.clone() }); else H.group.remove(g);
      setTimeout(() => this.say(pick(this.spec.lines?.served ?? ['Good, yes? I know.', 'Take your time with it.', 'Bring the empty back whenever. Or never. I like having something to do.']), 'wink'), 5000);
    } };
    H.ctx.interact.push(item); this.drink = { g, item, name };
    this.say(pick([`One ${name}. It is on the counter, and it is very good.`, `Your ${name}, on the counter. Careful, it has feelings.`, `${name[0].toUpperCase() + name.slice(1)}, up! Take your time with it.`]), 'happy', 6);
  }
}

export function hireClerks(ctx) {
  ({ THREE } = ctx); useThree(THREE); useThreeDrinks(THREE);
  const group = new THREE.Group(); group.name = 'clerks'; ctx.scene.add(group);
  const H = { debug: new URLSearchParams(location.search).has('keys'), ctx, now: 0, dt: 0, group, events: { choices: 0 }, visitor: { present: true, f: 0, x: 0, z: 0, room: null }, tmp: new THREE.Vector3(),
    toast: t => (window.houseUI ? window.houseUI.toast(t) : null) };
  H.bubbles = makeBubbles(THREE, ctx.camera); H.talk = makeTalk(H, false);
  // ?lineup stands everyone in a row across the road at the Landing, for looking at them side by side
  const lineup = new URLSearchParams(location.search).has('lineup'), all = ctx.items.clerks ?? [];
  if (lineup) all.forEach((sp, i) => { sp.home = [-((all.length - 1) / 2 - i) * 2.5, 6]; sp.faces = [sp.home[0], 40]; sp.floor = 0.07; sp.roam = false; sp.posts = []; sp.look = { ...sp.look, hover: 3.4 }; });
  const clerks = all.map(spec => new Clerk(H, spec)); if (lineup) for (const c of clerks) c.roam = false;
  ctx.clerks = Object.fromEntries(clerks.map(c => [c.spec.id, c]));
  ctx.animated.push((t, dt) => {
    H.now = t; H.dt = dt;
    const p = ctx.camera.position; H.visitor.x = p.x; H.visitor.z = p.z; H.visitor.y = ctx.walker?.pos.y ?? 0; H.visitor.room = ctx.room ?? null; H.visitor.present = ctx.mode === 'walk';
    for (const c of clerks) { try { c.update(dt); } catch (e) { if (!c.broken) { c.broken = true; console.error('clerk', c.name, e.stack ?? e); } } }
    H.talk.update(); H.bubbles.update(t);
  });
  return H;
}
