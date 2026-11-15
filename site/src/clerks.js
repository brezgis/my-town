// The robots who keep the shops. Each shop file describes its clerk (kit.clerks.push({...})):
//
//   id, name, lot          who, and whose shop
//   look                   { shape: 'egg'|'squat'|'round'|'tall'|'cushion'|'caddy'|..., colour, belly, trim, eye, ring, hover,
//                            hat: 'beanie'|'beret'|'cap'|'toque'|'straw'|'bun'|'none', hatColour, apron, scarf, bowtie,
//                            specs: true, blush: true, headphones: colour, antenna: true,
//                            tool: 'cup'|'record'|'book'|'can'|'duster'|'ladle'|'wrench'|'candle'|'fish' }
//   home [x, z]            where they stand (world; lot.world(a, d) gives it); faces [x, z]: what they look at when alone
//   posts [[x, z], ...]    other spots they drift to and fuss at, in a straight line from home: keep the way clear
//   serve                  { machine: [x, z], pickup: { xz: [x, z], y } } if they make things to order; optional
//                          drinks: { name: { vessel, liquid, note, last } } and food: { name: { build: THREE => Object3D, bites, note } }.
//                          What they make is set on the counter and taken in the hand (hold.js): Q sips or bites.
//   lines                  greet[], idle[], bye[], topics[{ q, a, next: [topics], serve: 'drink name', then: ctx => {} }]
//   stations               optional [{ at: [x, z], faces: [x, z], act: 'swap', chance: 0.3 }]: a place in the shop with a
//                          job of its own (Otis's turntable), gone to now and then instead of a shelf
//
// E on a clerk opens a small card of things to say (clerks/talk.js). They greet you when you come in,
// mutter to themselves, turn to you as you come up (robokit/attend.js), and otherwise keep their shops: a
// string of small jobs about the front and back rooms fitted to the trade, a sit down now and then in a
// chair nobody is using (clerks/acts.js). Bodies are one smooth shell with everything worn laid on its
// surface, and a rounded-square face screen (robokit/shell.js); faces blink in each robot's own rhythm,
// glance about, look down at the work and talk (robokit/face.js). robokit/ is shared with Anna's House and the
// lab, the same files in all three: see robokit/README.md.
// ?clerks=0 leaves them out. ctx.clerkHost is the host (for the soak check in the notes).

import { makeBubbles } from './clerks/bubbles.js';
import { makeTalk } from './clerks/talk.js';
import { useThree, paint, xform as T, merge, mesh, sph, cyl } from './robokit/parts.js';
import { makeFace, makeFaceLife, talkMouth } from './robokit/face.js';
import { makeShell, roll } from './robokit/shell.js';
import { TRADES, tradeOf, SECS, pose } from './clerks/acts.js';
import { attendVisitor, engageVisitor } from './robokit/attend.js';
import { useThreeDrinks, buildDrink, setFill } from './clerks/drinks.js';

let THREE;
const TAU = Math.PI * 2;

// ---- bodies ------------------------------------------------------------------------------------------
// R the size, s the stretch across, up and front to back; n how square the shell is (2 round, 3 and more a
// cushion: a rounded square with soft corners, never a box)
const SHAPES = { egg: { R: 0.58, s: [1, 1.2, 0.95] }, squat: { R: 0.66, s: [1.16, 0.82, 1.04] }, round: { R: 0.56, s: [1, 1, 1] }, tall: { R: 0.5, s: [0.95, 1.42, 0.92] },
  bean: { R: 0.5, s: [0.88, 1.62, 0.84] }, bun: { R: 0.7, s: [1.22, 0.7, 1.12] }, pear: { R: 0.56, s: [1.08, 1.12, 1.0] }, pip: { R: 0.44, s: [1, 1.08, 1] }, barrel: { R: 0.6, s: [1.0, 1.05, 1.0] },
  cushion: { R: 0.58, s: [1.08, 0.96, 0.94], n: 3.4 }, caddy: { R: 0.52, s: [0.94, 1.36, 0.88], n: 3.0 } };

// Who is who. Each robot's own look, laid over whatever its shop file asked for, so that no two on the
// street share a silhouette, a face or a way of carrying themselves. (Shop files may still set colours;
// the things that make a robot recognisable from across the street are decided here, in one place.)
//   shape, scale; pattern: 'stripes' | 'speckle' | 'split' | 'band' with colour2; top: what grows out of the head
//   ('sprout' | 'flame' | 'coil' | 'quill' | 'dish' | 'pleats' | 'prop' | 'halo' | 'bulb'); ears: 'cups' | 'bolts' | 'fins';
//   buttons; face: eyeW, eyeH, eyeR, gap, lashes, brows (tilt), moustache, freckles, monocle; rest: the expression at rest;
//   badge: a name badge pinned on the chest (its colour); tray: carries one (the baker);
//   roam: false to stay put, or a radius in feet for those who work out of doors
const IDENT = {
  juniper: { shape: 'egg', hat: 'beanie', pom: true, badge: '#c9a45c', eyeW: 38, eyeH: 48, gap: 44, blush: true, freckles: 'rgba(255,200,150,.7)', rest: 'happy' },
  otis: { shape: 'squat', scale: 1.06, pattern: 'band', colour2: '#e0723c', eyeW: 44, eyeH: 20, eyeR: 6, gap: 50, brows: -1, rest: 'sass', blush: false },
  olive: { shape: 'round', scale: 1.0, badge: '#c9a45c', eyeW: 24, eyeH: 24, eyeR: 12, gap: 52, lashes: true, blush: true, ears: 'cups', rest: 'happy' },
  folio: { shape: 'bean', scale: 0.96, pattern: 'split', colour2: '#efe4cf', eyeW: 20, eyeH: 26, eyeR: 10, gap: 40, top: 'quill', rest: 'neutral' },
  moss: { shape: 'pear', hat: 'none', top: 'sprout', pattern: 'speckle', colour2: '#8fb05a', eyeW: 40, eyeH: 30, gap: 46, rest: 'sleepy', blush: true, apron: null },
  ember: { shape: 'pip', scale: 0.92, top: 'flame', eyeW: 22, eyeH: 54, eyeR: 11, gap: 34, eye: '#ffb060', rest: 'neutral' },
  bao: { shape: 'bun', hat: 'none', top: 'pleats', colour: '#f3ecdc', belly: '#f3ecdc', pattern: 'band', colour2: '#c8402f', eyeW: 30, eyeH: 30, eyeR: 15, gap: 58, blush: true, rest: 'happy', roam: false },
  kombu: { shape: 'cushion', eyeW: 34, eyeH: 22, eyeR: 11, gap: 46, brows: 0.3, rest: 'neutral' },
  pascal: { shape: 'caddy', ears: 'bolts', badge: '#c9a45c', eyeW: 28, eyeH: 36, eyeR: 6, gap: 40, brows: -0.3, rest: 'neutral' },
  gus: { shape: 'bean', scale: 1.08, buttons: '#c9a45c', moustache: '#ffe9c0', eyeW: 22, eyeH: 22, eyeR: 11, gap: 38, ears: 'bolts', rest: 'neutral', roam: 16 },
  crumb: { shape: 'barrel', badge: '#e8b9a6', tray: true, pattern: 'speckle', colour2: '#f4ecdc', eyeW: 40, eyeH: 34, gap: 48, brows: 0.6, ears: 'fins', rest: 'sleepy' },
  hesper: { shape: 'round', scale: 1.04, colour: '#26314a', pattern: 'split', colour2: '#1a2030', bowtie: '#c9a45c', top: 'bulb', eyeW: 40, eyeH: 16, eyeR: 8, gap: 46, brows: -0.5, rest: 'sass', ears: null, roam: 9 },
  wren: { shape: 'pip', scale: 0.9, colour: '#d9d2c2', pattern: 'speckle', colour2: '#b9ae98', ears: 'fins', top: 'coil', eyeW: 44, eyeH: 44, eyeR: 22, gap: 50, eye: '#cfe3ff', rest: 'neutral' },
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

// A clerk's body: one shell (robokit/shell.js) and everything laid on it. Five draw calls: the body (all of it
// merged), the face, two hands, the ring of light; and for the baker, a tray, shown only while carrying.
function buildClerk(look) {
  const sh = SHAPES[look.shape ?? 'egg'], R = sh.R, S = sh.s, hover = look.hover ?? 3.4, sc = look.scale ?? 1;
  const root = new THREE.Group(), bob = new THREE.Group(); root.add(bob); bob.position.y = hover; bob.scale.setScalar(sc);
  const C = look.colour ?? '#8a3d6b', BELLY = look.belly ?? '#efe4cf', TRIM = look.trim ?? '#c9a45c', C2 = look.colour2 ?? BELLY, parts = [];
  const SH = makeShell(R * S[0], R * S[1], R * S[2], sh.n ?? 2), top = SH.B, put = (g, c) => parts.push(paint(g, c));
  // the coat: plain, or striped, speckled, two-tone, or with one band round the middle
  const pat = look.pattern, coat = p => (pat === 'stripes' ? (Math.floor((p.y / top + 1) * 4.5) % 2 ? C2 : C)
    : pat === 'speckle' ? (Math.sin(p.x * 23 + p.y * 7) * Math.sin(p.z * 19 - p.y * 11) * Math.sin(p.y * 29 + p.x * 5) > 0.3 ? C2 : C)
    : pat === 'split' ? (p.y < -top * 0.12 ? C2 : C) : pat === 'band' ? (Math.abs(p.y - top * 0.42) < top * 0.09 ? C2 : C) : C);
  put(SH.body(28, 18), coat);                                                       // (smooth normals: no facets at this size, at half the triangles)
  // the face: a rounded-square screen, about twice as wide as it is tall, in a soft dark bezel
  const yc = top * 0.46, hh = top * 0.29, aw = Math.min(1.0, (2 * hh) / SH.front(yc));
  const scr = SH.screen(yc, hh, aw, { seg: 36, rings: 4 }); put(scr.bezel, '#221c1f');
  const under = yc - hh - 0.05;                                                    // the line just under the face
  if (look.buttons) for (let i = 0; i < 3; i++) { const y = under - 0.1 - i * top * 0.2; put(T(sph(0.035, 8, 6), { p: SH.at(y, 0, 0.012) }), look.buttons); }
  if (look.buttons) for (const sx of [-1, 1]) put(SH.plate(top * 0.56, sx * 1.35, 0.32, 0.055, 0.016, { m: 6, rings: 2, seg: 24 }), look.buttons);      // epaulettes
  // ears, pushed into the side at the height of the eyes
  const ear = SH.at(yc, Math.PI / 2), ex = ear[0];
  if (look.ears === 'cups') for (const sx of [-1, 1]) { put(T(cyl(0.14, 0.12, 0.1, 16), { p: [sx * (ex + 0.035), yc, 0], r: [0, 0, sx * Math.PI / 2] }), TRIM); put(T(new THREE.TorusGeometry(0.1, 0.03, 6, 16), { p: [sx * (ex + 0.085), yc, 0], r: [0, Math.PI / 2, 0] }), TRIM); }
  if (look.ears === 'bolts') for (const sx of [-1, 1]) { put(T(cyl(0.11, 0.11, 0.1, 6), { p: [sx * (ex + 0.025), yc, 0], r: [0, 0, Math.PI / 2] }), TRIM); put(T(cyl(0.05, 0.05, 0.2, 8), { p: [sx * (ex + 0.1), yc, 0], r: [0, 0, Math.PI / 2] }), '#5b4630'); }
  if (look.ears === 'fins') for (const sx of [-1, 1]) { const ax = [sx * Math.sin(1.1), Math.cos(1.1), 0], p0 = SH.at(yc + 0.04, Math.PI / 2 * sx); put(T(new THREE.ConeGeometry(0.16, 0.36, 4), { p: [p0[0] + ax[0] * 0.14, p0[1] + ax[1] * 0.14, -0.05], r: [0, 0, -sx * 1.1], s: [1, 1, 0.3] }), TRIM); }
  if (look.headphones) { put(SH.overTop(yc, 0.05, 0.032), '#1d1b18'); for (const sx of [-1, 1]) put(T(cyl(0.2, 0.2, 0.12, 18), { p: [sx * (ex + 0.04), yc, 0], r: [0, 0, Math.PI / 2] }), look.headphones); }
  // what grows out of the top of the head
  const tp = look.top, ty = top - 0.02;
  if (tp === 'sprout') { put(T(cyl(0.014, 0.02, 0.2, 6), { p: [0, ty + 0.1, 0] }), '#5b4630'); for (const [rz, ry, k] of [[-0.75, 0.3, 1], [0.7, -0.5, 0.82], [0.1, 1.9, 0.62]]) parts.push(paint(T(sph(0.2, 12, 8), { p: [0, 0.2, 0], s: [0.5 * k, 1.25 * k, 0.12] }), '#7fae52').applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, ry, rz)).setPosition(0, ty + 0.16, 0))); }
  if (tp === 'flame') { put(T(cyl(0.02, 0.03, 0.12, 6), { p: [0, ty + 0.05, 0] }), '#3a2a20'); put(T(sph(0.1, 10, 8), { p: [0, ty + 0.24, 0], s: [0.8, 1.7, 0.8] }), '#ffb347'); put(T(sph(0.055, 8, 6), { p: [0, ty + 0.22, 0.01], s: [0.8, 1.6, 0.8] }), '#fff1b8'); }
  if (tp === 'coil') { for (let i = 0; i < 4; i++) put(T(new THREE.TorusGeometry(0.09 - i * 0.012, 0.016, 5, 14), { p: [0, ty + 0.05 + i * 0.07, 0], r: [Math.PI / 2 + 0.18, 0, 0] }), TRIM); put(T(sph(0.05, 8, 6), { p: [0, ty + 0.36, 0] }), '#e0723c'); }
  if (tp === 'quill') { put(T(cyl(0.01, 0.014, 0.6, 5), { p: [0.2, ty + 0.14, -0.1], r: [0.2, 0, -0.75] }), '#efe4cf'); put(T(sph(0.12, 10, 6), { p: [0.34, ty + 0.3, -0.13], r: [0.2, 0, -0.75], s: [0.45, 2.1, 0.12] }), '#f4eee2'); }
  if (tp === 'dish') { put(T(cyl(0.014, 0.02, 0.2, 6), { p: [0, ty + 0.1, 0] }), '#5b4630'); put(T(new THREE.SphereGeometry(0.2, 14, 6, 0, TAU, 0, 1.0), { p: [0, ty + 0.36, 0.02], r: [Math.PI - 0.5, 0, 0] }), TRIM); }
  if (tp === 'pleats') { for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; put(T(sph(0.07, 6, 5), { p: [Math.cos(a) * 0.2, ty + 0.03, Math.sin(a) * 0.2], r: [0, -a, 0], s: [1.5, 1.1, 0.5] }), BELLY); } put(T(sph(0.13, 10, 8), { p: [0, ty + 0.1, 0], s: [1, 0.85, 1] }), BELLY); }
  if (tp === 'prop') { put(T(cyl(0.02, 0.025, 0.16, 6), { p: [0, ty + 0.08, 0] }), '#5b4630'); for (const ry of [0, Math.PI / 2]) put(T(new THREE.BoxGeometry(0.62, 0.015, 0.09), { p: [0, ty + 0.17, 0], r: [0.12, ry, 0] }), TRIM); }
  if (tp === 'halo') put(T(new THREE.TorusGeometry(R * 0.5, 0.025, 6, 28), { p: [0, ty + 0.28, 0], r: [Math.PI / 2 + 0.12, 0, 0] }), '#ffe0a0');
  if (tp === 'bulb') { put(T(cyl(0.04, 0.05, 0.08, 8), { p: [0, ty + 0.04, 0] }), TRIM); put(T(sph(0.11, 10, 8), { p: [0, ty + 0.18, 0] }), '#fff1b8'); }
  // the shirt front, or an apron: a patch of the shell itself, its edges laid down onto the body
  if (!look.apron) { put(SH.plate(-top * 0.47, 0, 0.62, top * 0.36, 0.006, { m: 2.6, rings: 4, seg: 32 }), BELLY); put(SH.band(-0.03, 0.04, v => 0.004 + 0.02 * roll(v), 40, 3), TRIM); }
  else { const ap = SH.apron(under - 0.04); for (const g of ap.cloth) put(g, look.apron); put(ap.pocket, TRIM); }      // skirt, bib (if there is room), strings; a pocket
  put(T(new THREE.SphereGeometry(Math.min(SH.A, SH.C) * 0.5, 18, 8, 0, TAU, Math.PI / 2, Math.PI / 2), { p: [0, -top * 0.82, 0], s: [1, 0.6, 1] }), TRIM);   // the cap underneath
  const bottom = -(top * 0.82 + Math.min(SH.A, SH.C) * 0.3);
  if (look.bowtie) { const z = SH.front(under) + 0.04; for (const sx of [-1, 1]) put(T(new THREE.ConeGeometry(0.08, 0.16, 10), { p: [sx * 0.08, under, z - 0.005], r: [0, 0, -sx * Math.PI / 2], s: [1, 1, 0.55] }), look.bowtie); put(T(sph(0.04, 8, 6), { p: [0, under, z + 0.01] }), look.bowtie); }
  // a scarf goes round under the face: a soft roll of the body's own surface, and a tail laid down the front
  if (look.scarf) for (const g of SH.scarf(under - 0.02, { cols: 40, rows: 6 })) put(g, look.scarf);
  // a name badge, pinned on the left of the chest: a brass plate and its card
  if (look.badge) { const [plate, card] = SH.badge(look.scarf || look.bowtie ? under - 0.2 : under - 0.1, 0.42); put(plate, look.badge); put(card, '#f4eee2'); }
  // hats, fitted to the head: the crown is the head's own surface grown outwards, so it sits all the way round
  const HC = look.hatColour ?? '#b8452e', ys = Math.max(yc + hh - 0.03, top * 0.66); let hatTop = top;
  if (look.hat === 'beanie') { put(SH.cap(ys, v => 0.05 + (v < 0.2 ? 0.035 * roll(v / 0.2) : 0)), HC); if (look.pom !== false) put(T(sph(0.085, 10, 8), { p: [0, top + 0.12, 0] }), BELLY); hatTop = top + 0.2; }
  else if (look.hat === 'beret') { const yb = ys + top * 0.08; put(SH.cap(yb, (v, az) => 0.022 + 0.08 * roll(Math.min(1, v * 1.25)) * (1 + 0.4 * Math.sin(az))), HC); put(T(cyl(0.015, 0.015, 0.08, 5), { p: [0.03, top + 0.12, 0] }), HC); hatTop = top + 0.16; }
  else if (look.hat === 'cap') { const yb = ys + 0.02; put(SH.cap(yb, 0.03), HC); put(SH.brim(yb, 0.3, { az0: -1.15, az1: 1.15, off: 0.03, droop: 0.03, widthFn: az => Math.pow(Math.cos(az * 1.2), 0.6), cols: 30 }), HC); put(T(sph(0.04, 8, 6), { p: [0, top + 0.04, 0] }), HC); hatTop = top + 0.08; }
  else if (look.hat === 'toque') { put(SH.band(ys, ys + 0.14, v => 0.03 + 0.012 * roll(v), 40, 4), '#f4f1ea'); const y1 = ys + 0.1, cx = SH.side(y1) * 0.8, cz = SH.front(y1) * 0.8, t1 = top + 0.3;      // (its foot inside the head, under the band)
    put(T(cyl(1.1, 1, t1 - y1, 22), { p: [0, (y1 + t1) / 2, 0], s: [cx, 1, cz] }), '#f4f1ea'); put(T(sph(1, 18, 10), { p: [0, t1, 0], s: [cx * 1.3, 0.26, cz * 1.3] }), '#f4f1ea'); hatTop = t1 + 0.25; }
  else if (look.hat === 'straw') { put(SH.cap(ys, 0.04), '#d4b25e'); put(SH.band(ys, ys + 0.09, v => 0.048 + 0.008 * roll(v), 40, 3), HC); put(SH.brim(ys, R * 0.62, { off: 0.04, droop: 0.07, th: 0.03 }), '#d9b866'); hatTop = top + 0.1; }
  else if (look.hat === 'bun') { put(T(sph(R * 0.3, 12, 10), { p: SH.polar(0.5, Math.PI, R * 0.14) }), HC); put(T(cyl(0.012, 0.012, 0.5, 5), { p: SH.polar(0.5, Math.PI, R * 0.2), r: [0, 0, 1.2] }), TRIM); hatTop = top + R * 0.3; }
  if (look.antenna) { put(T(cyl(0.012, 0.016, 0.3, 6), { p: [0, hatTop + 0.11, 0] }), '#5b4630'); put(T(sph(0.05, 8, 6), { p: [0, hatTop + 0.28, 0] }), TRIM); }
  const fs = { eye: look.eye ?? '#ffe2b0', gap: look.gap ?? 44, eyeW: look.eyeW ?? 36, eyeH: look.eyeH ?? 46, eyeR: look.eyeR, bg: look.faceBg ?? '#120c10', lashes: look.lashes, brows: look.brows, moustache: look.moustache, freckles: look.freckles, monocle: look.monocle };
  if (look.specs) fs.specs = 'rgba(255,240,210,.6)'; if (look.blush) fs.blush = 'rgba(255,120,150,.5)';
  const face = makeFace(fs); face.mesh = mesh(scr.face, face.mat);
  const body = mesh(merge(parts)); bob.add(body, face.mesh);
  const ring = new THREE.Mesh(T(new THREE.TorusGeometry(R * 0.5, 0.032, 6, 24), { r: [Math.PI / 2, 0, 0] }), new THREE.MeshBasicMaterial({ color: look.ring ?? 0x8fe3d1, toneMapped: false, transparent: true, opacity: 0.85 }));
  ring.position.y = -top - 0.24; bob.add(ring);
  const glove = paint(T(sph(0.12, 10, 7), { s: [1, 0.85, 1.15] }), look.glove ?? '#f4eee2'), hx = SH.side(-top * 0.18) + 0.22;
  const hands = [[-hx, -top * 0.18, 0.16], [hx, -top * 0.18, 0.16]].map((p, i) => {
    const h = new THREE.Group(); h.position.set(...p); h.userData.rest = p;
    h.add(mesh(i === 1 && TOOLS[look.tool] ? merge([glove.clone(), ...TOOLS[look.tool]()]) : glove.clone())); bob.add(h); return h;
  });
  // a baker's tray of loaves, carried in both hands to the window
  let tray = null;
  if (look.tray) { tray = new THREE.Group(); tray.visible = false; bob.add(tray);
    tray.add(mesh(merge([paint(T(new THREE.BoxGeometry(0.95, 0.03, 0.55), {}), '#3a3a3c'), paint(T(new THREE.BoxGeometry(0.97, 0.05, 0.03), { p: [0, 0.02, 0.27] }), '#3a3a3c'), paint(T(new THREE.BoxGeometry(0.97, 0.05, 0.03), { p: [0, 0.02, -0.27] }), '#3a3a3c'),
      ...[[-0.28, -0.1], [0.02, 0.12], [0.3, -0.08], [-0.05, -0.14], [0.26, 0.15]].map(([x, z], i) => paint(T(sph(0.11, 12, 8), { p: [x, 0.07, z], s: [1.3, 0.62, 0.85], r: [0, i, 0] }), p => (p.y > 0.1 ? '#b0702c' : '#d29a52')))]))); }
  root.traverse(o => { o.castShadow = false; o.receiveShadow = !!o.isMesh; });
  // measures for the hands' work (bob frame): in front, low (a counter), middle, high (a top shelf)
  const D = { x: hx, y: -top * 0.18, f: SH.front(-top * 0.3) + 0.12, lo: -top * 0.55, mid: -top * 0.05, hi: top * 0.9 };
  return { root, bob, body, face, ring, hands, tray, D, R, shell: SH, eye: yc * sc, top: hover + (Math.max(hatTop, top) + (look.top ? 0.45 : 0.15)) * sc, hover, bottom: bottom * sc, belly: hover - (top + 0.3) * sc };
}

// ---- behaviour ---------------------------------------------------------------------------------------------
// A clerk keeps its shop. It goes from one small job to the next (clerks/acts.js says which, for its trade):
// at its till, at its machine, at a shelf or a counter or a bin somewhere in the front or the back room, now
// and then a sit down in a chair nobody is using. When the visitor comes in it looks up; when she comes near
// the till, or near it, it leaves what it is doing and comes back to serve. It turns to her as she comes up
// (robokit/attend.js: the eyes first, then the head, then the body) and goes back to the job when she leaves.
// It never walks through her: it goes round her, waits for her, or steps aside.
const pick = a => a[Math.floor(Math.random() * a.length)];
const one = a => (Array.isArray(a) ? pick(a) : a);
const G = 0.5;                                                              // the walking grid, in feet
const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.42], [1, -1, 1.42], [-1, 1, 1.42], [-1, -1, 1.42]];
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
const turnTo = (cur, aim, k) => cur + wrapA(aim - cur) * Math.min(1, k);
const BERTH = 2.1;                                                          // how near the visitor a clerk will come, feet

// a small binary heap of grid cells by cost, for the way-finding
function heap() { const a = [], d = []; return { size: () => a.length, push(c, k) { a.push(c); d.push(k); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (d[p] <= d[i]) break; [a[p], a[i]] = [a[i], a[p]]; [d[p], d[i]] = [d[i], d[p]]; i = p; } },
  pop() { const top = a[0], la = a.pop(), ld = d.pop(); if (a.length) { a[0] = la; d[0] = ld; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < a.length && d[l] < d[m]) m = l; if (r < a.length && d[r] < d[m]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; [d[m], d[i]] = [d[i], d[m]]; i = m; } } return top; } }; }

class Clerk {
  constructor(H, spec) {
    const id = identity(spec.id), look = { ...(spec.look ?? {}), ...id }; if (id.apron === null) delete look.apron;
    this.H = H; this.spec = { name: spec.name, ...spec, look }; this.name = spec.name; this.f = 0; this.rest = id.rest ?? 'neutral';      // (f: its floor, as talk.js asks; without it the card shut as soon as it opened)
    this.roam = id.roam ?? spec.roam ?? true; this.path = null; this.grid = null; this.gridAt = -1e9;
    this.trade = tradeOf(spec.id);
    const b = this.body = buildClerk(look);
    [this.x, this.z] = spec.home; this.y = spec.floor ?? 0.55; this.phase = Math.random() * 10;
    this.homeYaw = spec.faces ? Math.atan2(spec.faces[0] - this.x, spec.faces[1] - this.z) : 0; this.yaw = this.homeYaw;
    b.root.position.set(this.x, this.y, this.z); b.root.rotation.y = this.yaw; H.group.add(b.root);
    this.bubble = H.bubbles.make(spec.name);
    this.state = 'work'; this.job = { act: one(this.trade.till), t: 0, secs: 10 + Math.random() * 10, yaw: this.homeYaw, place: 'till' };
    this.queue = []; this.expr = 'neutral'; this.exprUntil = 0; this.trips = 0;
    this.greeted = -1e9; this.wasIn = false; this.nextIdle = H.now + 20 + Math.random() * 30; this.drink = null;
    this.att = {}; this.eng = {}; this.engaged = false; this.replyUntil = 0; this.sitK = 0; this.seat = null; this.headYaw = 0; this.lean = 0; this.side = 0; this.rise = 0; this.pour = 0;
    this.life = makeFaceLife(spec.id ?? 'x', H.now);                              // its own way of blinking and glancing about
    this.item = { x: this.x, y: this.y + b.hover, z: this.z, reach: 10, size: 1.7, label: () => (H.talk.robot === this ? 'say the next thing' : `talk to ${spec.name}`), act: () => H.talk.press(this) };
    H.ctx.interact.push(this.item);
  }
  say(text, expr = 'happy', secs) { if (!text) return; this.bubble.say(text, secs, this.H.now); this.expr = expr; this.exprUntil = this.H.now + 3.5; this.H.ctx.sound?.chirp?.(this.spec.chirp ?? [70 + (this.name.length % 5) * 2, 74 + (this.name.length % 4) * 2]); }
  line(kind) { const l = this.spec.lines?.[kind]; if (l?.length) this.say(pick(l), kind === 'idle' ? 'neutral' : 'happy'); }
  topics(list) {
    return list.slice(0, 4).map(t => ({ text: t.q, act: () => {
      this.say(Array.isArray(t.a) ? pick(t.a) : t.a, t.expr ?? (t.serve ? 'wink' : 'happy'), 6); this.replyUntil = this.H.now + 6;      // (still talking to her while it answers)
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
    return this.topics(list);                                              // (sat down, it stays sat, and turns to her where it sits)
  }

  // ---- the shop as a grid: half-foot cells, made from the same obstacles the visitor meets. A robot goes round
  // everything a person would, low things too (it used to drift over counters), keeping a little further from
  // tall things than from low ones. Each cell remembers how tall what blocks it is, so that the places beside
  // things can be told apart: a counter or a bin (low work) or a shelf or a dresser (reaching up).
  area() {
    const r = this.H.ctx.house.rooms.find(r => r.lot === this.spec.lot), [hx, hz] = this.spec.home, R = typeof this.roam === 'number' ? this.roam : 10;
    return r ? { x0: r.x0 + 0.9, x1: r.x1 - 0.9, z0: r.z0 + 0.9, z1: r.z1 - 0.9 } : { x0: hx - R, x1: hx + R, z0: hz - R, z1: hz + R };
  }
  remap() {
    const A = this.area(), W = Math.max(1, Math.ceil((A.x1 - A.x0) / G)), D = Math.max(1, Math.ceil((A.z1 - A.z0) / G)), cells = new Uint8Array(W * D), tall = new Float32Array(W * D), solid = new Uint8Array(W * D);
    const belly = this.y + this.body.belly, lo = (this.spec.floor ?? this.y) + 0.45, hi = this.y + this.body.top, PAD = (this.spec.radius ?? 0.75) * (this.spec.look.scale ?? 1);
    for (const c of this.H.ctx.colliders) {
      if (c.off || c.y1 <= lo || c.y0 >= hi || c.x1 < A.x0 - 1 || c.x0 > A.x1 + 1 || c.z1 < A.z0 - 1 || c.z0 > A.z1 + 1) continue;
      const pad = c.y1 <= belly ? 0.45 : PAD, h = c.y1 - this.y;
      const i0 = Math.max(0, Math.floor((c.x0 - pad - A.x0) / G)), i1 = Math.min(W - 1, Math.floor((c.x1 + pad - A.x0) / G)), j0 = Math.max(0, Math.floor((c.z0 - pad - A.z0) / G)), j1 = Math.min(D - 1, Math.floor((c.z1 + pad - A.z0) / G));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { cells[j * W + i] = 1; tall[j * W + i] = Math.max(tall[j * W + i], h); }
      // and the cells the thing itself stands on, unpadded: a robot may start in the padding, never in these
      const k0 = Math.max(0, Math.floor((c.x0 - A.x0) / G)), k1 = Math.min(W - 1, Math.floor((c.x1 - A.x0) / G)), m0 = Math.max(0, Math.floor((c.z0 - A.z0) / G)), m1 = Math.min(D - 1, Math.floor((c.z1 - A.z0) / G));
      for (let j = m0; j <= m1; j++) for (let i = k0; i <= k1; i++) solid[j * W + i] = 1;
    }
    this.grid = { A, W, D, cells, tall, solid }; this.gridAt = this.H.now;
    // which cells it can get to from its till, and the places to work: free cells beside something, facing it
    const s = this.nearFree(...this.spec.home), seen = new Uint8Array(W * D), q = [s]; if (s >= 0) seen[s] = 1;
    while (q.length) { const c = q.pop(), ci = c % W, cj = (c - ci) / W; for (const [di, dj] of NB) { const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= W || j >= D) continue; const n = j * W + i; if (!seen[n] && !cells[n]) { seen[n] = 1; q.push(n); } } }
    this.grid.reach = seen;
    const spots = [], order = [...Array(W * D).keys()].sort(() => Math.random() - 0.5);
    for (const c of order) {
      if (!seen[c] || this.passage(c)) continue;
      const i = c % W, j = (c - i) / W, x = (i + 0.5) * G + A.x0, z = (j + 0.5) * G + A.z0;
      if (spots.some(p => Math.hypot(p.x - x, p.z - z) < 3)) continue;
      let best = null; for (const [di, dj] of NB.slice(0, 4)) for (let k = 1; k <= 3; k++) { const a = i + di * k, bb = j + dj * k; if (a < 0 || bb < 0 || a >= W || bb >= D) break; const n = bb * W + a; if (cells[n]) { if (!best || k < best.k) best = { k, yaw: Math.atan2(di, dj), h: tall[n] }; break; } }
      if (best && best.h > 1.6) spots.push({ x, z, yaw: best.yaw, kind: best.h > 5.2 ? 'tall' : 'low' });
      if (spots.length > 40) break;
    }
    this.spots = spots;
    // chairs and stools in the shop, and where to stand in front of each to sit down
    this.seats = (this.H.ctx.items.seats ?? []).filter(st => st.x > A.x0 && st.x < A.x1 && st.z > A.z0 && st.z < A.z1 && Math.abs(st.y - 2.45 - this.y) < 3).map(st => {
      const fx = -Math.sin(st.yaw), fz = -Math.cos(st.yaw);
      // How tall a back it has: the highest thing standing where it sits (a pew is one solid, back and all, to
      // 1.6 ft over its seat; a stool or a bench has none). On a tall-backed seat it sits forward on the front of
      // the seat and holds itself up, as a person would sit up in a pew, so that from behind its head shows over the back.
      const h = st.y - 2.45, back = Math.max(0, ...this.H.ctx.colliders.filter(k => !k.off && st.x > k.x0 && st.x < k.x1 && st.z > k.z0 && st.z < k.z1 && k.y1 > h).map(k => k.y1 - h));
      const fwd = back > 1.1 ? 0.3 : 0, sx = st.x + fx * fwd, sz = st.z + fz * fwd;
      // where to stand to sit down: in front of it; or, for a stool (no back) tucked in at a counter, behind it
      for (const side of back > 0.4 ? [1] : [1, -1]) {
        const c = this.nearFree(st.x + fx * 1.6 * side, st.z + fz * 1.6 * side), i = c % W, j = (c - i) / W, ax = (i + 0.5) * G + A.x0, az = (j + 0.5) * G + A.z0;
        if (c >= 0 && seen[c] && Math.hypot(ax - st.x, az - st.z) < 2.6) return { seat: st, sx, sz, ax, az, h, back: back > 1.1 ? back : 0, yaw: st.yaw + Math.PI };
      }
      return null;
    }).filter(Boolean);
  }
  fresh() { if (!this.grid || this.H.now - this.gridAt > 30) this.remap(); return this.grid; }
  cell(x, z) { const g = this.grid, i = Math.floor((x - g.A.x0) / G), j = Math.floor((z - g.A.z0) / G); return i < 0 || j < 0 || i >= g.W || j >= g.D ? -1 : j * g.W + i; }
  cxz(c) { const g = this.grid, i = c % g.W; return [(i + 0.5) * G + g.A.x0, ((c - i) / g.W + 0.5) * G + g.A.z0]; }
  // the free cell nearest a point that can be reached from it in a straight line without crossing anything
  // solid (the robot's own home may be inside the padding of its counter; the nearest free cell may be on the
  // far side of the counter, which is not the way to go)
  nearFree(x, z, reach) {
    const g = this.grid, c0 = this.cell(Math.max(g.A.x0, Math.min(g.A.x1 - 0.01, x)), Math.max(g.A.z0, Math.min(g.A.z1 - 0.01, z))), ok = k => !g.cells[k] && (!reach || reach[k]);
    if (c0 >= 0 && ok(c0)) return c0;
    const line = (bx, bz) => { const n = Math.ceil(Math.hypot(bx - x, bz - z) / 0.2); for (let q = 1; q <= n; q++) { const c = this.cell(x + (bx - x) * q / n, z + (bz - z) * q / n); if (c >= 0 && g.solid[c]) return false; } return true; };
    const cand = []; for (let k = 0; k < g.cells.length; k++) if (ok(k)) { const [cx, cz] = this.cxz(k); cand.push([(cx - x) ** 2 + (cz - z) ** 2, k, cx, cz]); }
    cand.sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < Math.min(cand.length, 400); i++) if (line(cand[i][2], cand[i][3])) return cand[i][1];
    return cand.length ? cand[0][1] : -1;
  }
  // near the visitor (on its floor): a cell it should not walk through
  nearV(x, z, r = BERTH) { const v = this.H.visitor; return v.present && Math.abs(v.y - this.y) < 4 && Math.hypot(x - v.x, z - v.z) < r; }
  route(tx, tz) {
    const g = this.fresh(), s = this.nearFree(this.x, this.z), e = this.nearFree(tx, tz, g.reach); if (s < 0 || e < 0) return null;
    const n = g.cells.length, prev = new Int32Array(n).fill(-1), dist = new Float32Array(n).fill(1e9), open = heap(); dist[s] = 0; prev[s] = s; open.push(s, 0);
    const vb = new Uint8Array(n); for (let k = 0; k < n; k++) { if (k === s) continue; const [x, z] = this.cxz(k); if (this.nearV(x, z)) vb[k] = 1; }
    if (vb[e]) return null;                                                  // she is standing where it was going
    while (open.size()) {
      const c = open.pop(); if (c === e) break;
      const ci = c % g.W, cj = (c - ci) / g.W;
      for (const [di, dj, w] of NB) { const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= g.W || j >= g.D) continue; const m = j * g.W + i; if (g.cells[m] || vb[m] || (di && dj && (g.cells[cj * g.W + i] || g.cells[j * g.W + ci]))) continue; const d = dist[c] + w; if (d < dist[m]) { dist[m] = d; prev[m] = c; open.push(m, d); } }
    }
    if (prev[e] < 0) return null;
    const pts = []; for (let c = e; c !== s; c = prev[c]) pts.push(this.cxz(c)); pts.push(this.cxz(s));
    pts.reverse(); if (e === this.cell(tx, tz)) pts.push([tx, tz]);
    // pull it straight: from where it stands, skip every point it can reach in a clear line
    const clear = (ax, az, bx, bz) => { const k = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.25); for (let q = 1; q < k; q++) { const x = ax + (bx - ax) * q / k, z = az + (bz - az) * q / k, c = this.cell(x, z); if (c < 0 || g.cells[c] || this.nearV(x, z)) return false; } return true; };
    const out = []; let ax = this.x, az = this.z, i = 0;
    while (i < pts.length) { let j = pts.length - 1; while (j > i && !clear(ax, az, pts[j][0], pts[j][1])) j--; out.push(pts[j]); [ax, az] = pts[j]; i = j + 1; }
    return out;
  }
  // off somewhere, and then(): false if there is no way there just now
  go(p, then, hurry = false) {
    const path = this.route(p[0], p[1]); this.hurry = hurry;
    if (!path) return false;
    this.path = path.length ? path : [[p[0], p[1]]]; this.target = { then, to: p }; this.state = 'go'; this.waited = 0; this.moved = { x: this.x, z: this.z, t: this.H.now };
    return true;
  }
  // Is this cell in a way through (a doorway, the gap between a counter and a wall, an aisle)? Shut in closely on
  // both sides one way or the other. Nobody should stand about there (manners, after the staff of Anna's House).
  passage(c) {
    const g = this.grid, i = c % g.W, j = (c - i) / g.W, shut = (di, dj) => { for (let k = 1; k <= 4; k++) { const a = i + di * k, b = j + dj * k; if (a < 0 || b < 0 || a >= g.W || b >= g.D || g.cells[b * g.W + a]) return true; } return false; };
    return (shut(1, 0) && shut(-1, 0)) || (shut(0, 1) && shut(0, -1));
  }
  // Out of the visitor's way: a free spot a few feet off, to one side of where she is heading, not in a passage.
  aside(v, hx, hz) {
    const g = this.fresh(); let best = null, bs = 1e9;
    for (let c = 0; c < g.cells.length; c += 1) {
      if (g.cells[c] || !g.reach[c]) continue;
      const [x, z] = this.cxz(c), dr = Math.hypot(x - this.x, z - this.z), dvv = Math.hypot(x - v.x, z - v.z);
      if (dr > 8 || dr < 1.5 || dvv < 4 || this.passage(c)) continue;
      const side = Math.abs((x - v.x) * hz - (z - v.z) * hx), sc = dr - 1.2 * Math.min(4, side);       // near, and well off her line
      if (sc < bs) { bs = sc; best = [x, z]; }
    }
    return best;
  }

  // ---- jobs ------------------------------------------------------------------------------------------------
  work(act, yaw, place, secs) { this.state = 'work'; this.job = { act, yaw, place, t: 0, secs: secs ?? (SECS[act] ?? 8) * (0.8 + Math.random() * 0.5) }; }
  goWork(p, act, yaw, place, secs) { return this.go(p, () => this.work(act, yaw ?? this.yaw, place, secs)); }
  goHome(hurry = false) { const sp = this.spec; this.job0 = null; return this.go(sp.home, () => this.work(one(this.trade.till), this.homeYaw, 'till', 8 + Math.random() * 12), hurry); }
  // what next: the till now and then, the machine, a place beside a shelf or a counter, a chair, the window
  next() {
    const sp = this.spec, tr = this.trade, v = this.H.visitor, g = this.fresh(), r = Math.random();
    if (this.queue.length) return this.startDrink(this.queue.shift());
    if (!this.roam || !tr.step || this.wantsTill()) { if (Math.hypot(this.x - sp.home[0], this.z - sp.home[1]) > 0.6 && this.goHome(this.wantsTill())) return; return this.work(one(tr.till), this.homeYaw, 'till'); }
    this.trips++;
    if (this.trips % 4 === 0 || r > tr.step) { if (this.goHome()) return; }
    if (tr.carry && sp.serve?.machine && r < 0.3 && this.carry()) return;
    if (tr.machine && sp.serve?.machine && r < 0.42) { if (this.goWork(sp.serve.machine, one(tr.machine), this.homeYaw, 'machine')) return; }
    for (const s of sp.stations ?? []) if (Math.random() < (s.chance ?? 0.3) && Math.hypot(s.at[0] - this.x, s.at[1] - this.z) > 1 && !this.nearV(s.at[0], s.at[1], 4)) { if (this.goWork(s.at, one(s.act), Math.atan2(s.faces[0] - s.at[0], s.faces[1] - s.at[1]), 'station')) return; }
    const vAway = !this.inShop || Math.hypot(v.x - this.x, v.z - this.z) > 18;
    if (tr.seat && this.seats?.length && vAway && r < 0.58) {
      const own = this.seats.filter(q => q.seat.staff), st = own.length && Math.random() < 0.7 ? pick(own) : pick(this.seats), taken = this.H.ctx.walker?.seated, vs = Math.hypot(v.x - st.seat.x, v.z - st.seat.z);
      if (!(taken && Math.hypot(taken.x - st.seat.x, taken.z - st.seat.z) < 1) && vs > 7 && this.go([st.ax, st.az], () => this.sit(st))) return;
    }
    const posts = (sp.posts ?? []).map(p => ({ x: p[0], z: p[1], yaw: null, kind: 'low' }));
    const all = [...(g === this.grid ? this.spots : []), ...posts].filter(p => Math.hypot(p.x - this.x, p.z - this.z) > 3 && !this.nearV(p.x, p.z, 5));
    for (let k = 0; k < 4 && all.length; k++) {
      const p = all.splice(Math.floor(Math.random() * all.length), 1)[0], act = one((p.kind === 'tall' ? tr.tall : tr.low) ?? tr.till);
      if (this.goWork([p.x, p.z], act, p.yaw ?? this.faceNear(p.x, p.z), p.kind)) return;
    }
    if (!this.goHome()) this.work('idle', this.yaw, 'here', 4);
  }
  // the way to face at a place: towards whatever is nearest it
  faceNear(x, z) {
    const g = this.grid, c = this.cell(x, z); if (c < 0) return this.yaw;
    const i = c % g.W, j = (c - i) / g.W; let best = null;
    for (const [di, dj] of NB) for (let k = 1; k <= 4; k++) { const a = i + di * k, b = j + dj * k; if (a < 0 || b < 0 || a >= g.W || b >= g.D) break; if (g.cells[b * g.W + a]) { if (!best || k < best.k) best = { k, yaw: Math.atan2(di, dj) }; break; } }
    return best ? best.yaw : this.yaw;
  }
  // the baker: to the oven, out with a tray, to the window, the loaves set out, back
  carry() {
    const sp = this.spec, lot = this.H.ctx.house.lots?.[sp.lot];
    const win = lot?.world ? lot.world(lot.W / 2 + (Math.random() - 0.5) * lot.W * 0.4, 3) : sp.home;
    const fresh = this.fresh(), c = this.nearFree(win[0], win[1], fresh.reach); if (c < 0) return this.goHome();
    const w = this.cxz(c);
    return this.goWork(sp.serve.machine, 'oven', this.homeYaw, 'machine', 4) && (this.job0 = () => {
      this.carrying = true; this.body.tray.visible = true;
      if (!this.go(w, () => this.work('tray', this.faceNear(w[0], w[1]), 'window', 4))) { this.carrying = false; this.body.tray.visible = false; this.goHome(); }
    });
  }
  sit(st) { this.state = 'sitting'; this.seat = st; this.sitT = 0; this.job = { act: this.trade.seat, t: 0, secs: (SECS[this.trade.seat] ?? 18) * (0.8 + Math.random() * 0.6), yaw: st.yaw, place: 'seat' }; }
  stand() { if (this.seat) { this.state = 'rising'; this.sitT = 0; } }
  wantsTill() {
    // the visitor is in the shop and near the till, or near the clerk: come and serve
    const v = this.H.visitor, sp = this.spec;
    // (and for a while after she comes in, wherever she is in the shop: a clerk at the back of a long shop comes up to meet her)
    return this.inShop && (Math.hypot(v.x - sp.home[0], v.z - sp.home[1]) < 11 || Math.hypot(v.x - this.x, v.z - this.z) < 8 || (this.H.now - (this.cameIn ?? -1e9) < 20 && Math.hypot(this.x - sp.home[0], this.z - sp.home[1]) > 8));
  }

  update(dt) {
    const H = this.H, now = H.now, v = H.visitor, b = this.body, sp = this.spec;
    const inShop = this.inShop = v.present && (v.room?.lot === sp.lot || (sp.reach && !v.room && Math.abs(v.y - this.y) < 7 && Math.hypot(v.x - this.x, v.z - this.z) < sp.reach));
    const dv = Math.hypot(v.x - this.x, v.z - this.z), talking = H.talk.robot === this;
    // Engaged with her (robokit/attend.js engageVisitor): while she talks to it and it answers, and when she comes up
    // to it, it stops where it is, turns to her and waits. No errand, no trip back to the till, no next job, until the
    // conversation is over and she has stepped away. The one thing it goes off for is an order she has given, once
    // the card is closed: it is making her drink.
    const eng = engageVisitor(this.eng, this, v, dt, { talking: talking || now < this.replyUntil, level: inShop && Math.abs(v.y - this.y) < 4 });
    // One exception: she is waiting at the till. A clerk on its way there to serve her does not stop a few feet short
    // because she has turned to watch it come (it gets to the till, then turns to her), and one she has come up to
    // near the till goes behind it to serve her. While the card is open it stays put wherever it is.
    const atTill = Math.hypot(v.x - sp.home[0], v.z - sp.home[1]) < 6, toTill = this.state === 'go' && this.target?.to === sp.home;
    const hold = this.engaged = eng.on && (talking || (!eng.give && !(this.making || this.queue.length) && !(toTill && atTill && now >= this.replyUntil)));      // (at a stride straight at it, she is passing: it gives way)
    // coming and going
    if (inShop && !this.wasIn && now - this.greeted > 45) { this.greeted = now; setTimeout(() => this.line('greet'), 600); }
    if (!inShop && this.wasIn && now - this.greeted > 12 && Math.random() < 0.6) this.line('bye');
    if (inShop && !this.wasIn && this.roam && this.state !== 'make') { this.recall = now + 0.3 + Math.random() * 0.4; this.cameIn = now; }      // finishes the stroke, then comes back
    this.wasIn = inShop;
    if (inShop && now > this.nextIdle && !talking && !this.bubble.talking(now)) { this.line('idle'); this.nextIdle = now + 28 + Math.random() * 40; }
    // she is coming to the till: leave the job (or the chair) and come back to serve
    if (this.roam && (!hold || (atTill && eng.why === 'near')) && !talking && !this.making && this.wantsTill() && now > (this.recall ?? 0) && !(this.state === 'work' && this.job.place === 'till')) {
      this.recall = now + 4;
      if (this.state === 'seated' || this.state === 'sitting') { this.called = true; this.stand(); }
      else if (this.state === 'work' || (this.state === 'go' && !this.carrying)) { this.carrying = false; if (b.tray) b.tray.visible = false; if (!this.goHome(true) && !hold) this.work(one(this.trade.till), this.homeYaw, 'here', 3); }      // (held, with no way through to the till: it keeps to what it was doing)
    }
    // manners: if the visitor is walking straight at it and is nearly on it, it glides out of the way
    { const sx = (v.x - (this.pvx ?? v.x)) / Math.max(dt, 1e-3), sz = (v.z - (this.pvz ?? v.z)) / Math.max(dt, 1e-3), s2 = Math.hypot(sx, sz); this.pvx = v.x; this.pvz = v.z;
      if (this.roam && !hold && !talking && dv < 3.4 && s2 > 1.5 && Math.abs(v.y - this.y) < 3 && this.state === 'work' && !this.queue.length && now > (this.mannersAt ?? 0)) {
        const hx = sx / s2, hz = sz / s2, toward = ((this.x - v.x) * hx + (this.z - v.z) * hz) / Math.max(dv, 0.01);
        if (toward > 0.8) { this.mannersAt = now + 3; const p = this.aside(v, hx, hz); if (p) this.go(p, () => this.work('idle', Math.atan2(v.x - p[0], v.z - p[1]), 'aside', 5)); }
      } }
    // the visitor: eyes, head, body (robokit/attend.js)
    const att = attendVisitor(this.att, { x: this.x, z: this.z, yaw: this.yaw }, v, dt, { reach: 10, talking, hold, keepWorking: this.state === 'seated' || this.state === 'sitting' || this.state === 'rising', busy: this.state === 'work' && this.job.place !== 'till', level: Math.abs(v.y - this.y) < 4 });
    // the job in hand, and what next
    let aimYaw = this.yaw, moving = false, act = 'idle', actT = now;
    if (this.state === 'work') {
      const j = this.job; act = j.act; actT = j.t; aimYaw = j.yaw;
      if (!hold && (att.yaw === null || (this.making && j.place === 'machine'))) j.t += dt;      // it pauses while it is turned to her (not over her drink)
      // an order, once it has said its piece and the card is closed: straight off to make it (not after the job in hand)
      if (this.queue.length && !this.making && !talking && now > this.replyUntil && !this.job0) this.next();
      else if (j.t > j.secs && !hold) {
        if (j.place === 'window' && this.carrying) { this.carrying = false; b.tray.visible = false; }
        if (this.job0) { const f = this.job0; this.job0 = null; f(); } else if (this.making && j.place === 'machine') { const done = () => { this.work(one(this.trade.till), this.homeYaw, 'till', 12); this.finishDrink(); }; if (!this.go(sp.home, done)) done(); }
        else this.next();
      }
    } else if (this.state === 'go') {
      act = this.carrying ? 'tray' : 'walk';
      if (hold) { aimYaw = Math.atan2(v.x - this.x, v.z - this.z); this.moved.t = now; }      // stopped where it was, turned to her (and not stuck)
      else {
        const [tx, tz] = this.path[0], dx = tx - this.x, dz = tz - this.z, d = Math.hypot(dx, dz), want = Math.atan2(dx, dz), off = Math.abs(wrapA(want - this.yaw));
        const left = this.hurry ? this.path.reduce((a, q, n) => a + Math.hypot(q[0] - (n ? this.path[n - 1][0] : this.x), q[1] - (n ? this.path[n - 1][1] : this.z)), 0) : 0;
        const step = (sp.speed ?? 2.4) * (this.hurry ? (left > 10 ? 2.3 : 1.8) : 1) * dt * Math.max(0, Math.cos(Math.min(off, Math.PI / 2))) * (off > 1.1 ? 0 : 1);   // turns before it sets off
        const nx = this.x + (d > 1e-6 ? dx / d : 0) * Math.min(step, d), nz = this.z + (d > 1e-6 ? dz / d : 0) * Math.min(step, d);
        aimYaw = want;
        if (this.nearV(nx, nz) && Math.hypot(nx - v.x, nz - v.z) < Math.hypot(this.x - v.x, this.z - v.z)) {
          // she is in the way: wait, then find a way round her, or give up and do something else
          this.waited += dt; aimYaw = Math.atan2(v.x - this.x, v.z - this.z);
          if (this.waited > 1.6) { const to = this.target.to, then = this.target.then; if (!this.go(to, then)) { this.carrying = false; if (b.tray) b.tray.visible = false; this.work('idle', aimYaw, 'here', 3); } else this.waited = -2; }
        } else if (d <= step + 1e-4) {
          this.x = tx; this.z = tz; this.path.shift();
          if (!this.path.length) { const t = this.target; this.path = null; this.target = null; this.state = 'arrived'; t.then?.(); if (this.state === 'arrived') this.work('idle', this.yaw, 'here', 2); }
        } else { this.x = nx; this.z = nz; moving = step > 0; }
        // stuck (it should never be): after a long while without getting anywhere, it thinks again
        if (Math.hypot(this.x - this.moved.x, this.z - this.moved.z) > 0.5) this.moved = { x: this.x, z: this.z, t: now };
        else if (now - this.moved.t > 9 && this.state === 'go') { this.stuck = (this.stuck ?? 0) + 1; this.carrying = false; if (b.tray) b.tray.visible = false; this.path = null; this.work('idle', this.yaw, 'here', 2); }
      }
    } else if (this.state === 'sitting' || this.state === 'rising') {
      const st = this.seat, k = Math.min(1, (this.sitT += dt) / (this.state === 'rising' && this.called ? 0.8 : 1.4)), e = k * k * (3 - 2 * k), up = this.state === 'rising';
      const f = up ? 1 - e : e; this.x = st.ax + (st.sx - st.ax) * f; this.z = st.az + (st.sz - st.az) * f; this.sitK = f; aimYaw = st.yaw; act = this.job.act;
      if (k >= 1) { if (up) { this.seat = null; this.sitK = 0; this.called = false; if (hold) this.work('idle', this.yaw, 'here', 3); else this.next(); } else this.state = 'seated'; }
    } else if (this.state === 'seated') {
      // (she comes up to it, or talks to it, and it stays sat, turned to her as far as it can turn sitting; it gets up for an order)
      const j = this.job; act = j.act; actT = j.t; aimYaw = j.yaw; if (!hold) j.t += dt;
      const taken = H.ctx.walker?.seated; if ((j.t > j.secs && !hold) || (taken && Math.hypot(taken.x - this.seat.seat.x, taken.z - this.seat.seat.z) < 1) || (!hold && this.queue.length)) this.stand();
    }
    // turning: to the visitor when attending (not while walking, sitting or making), else to the job
    if (att.yaw !== null && (this.state === 'work' || (hold && this.state === 'go')) && !(this.making && this.job.place === 'machine')) aimYaw = att.yaw;
    this.yaw = turnTo(this.yaw, aimYaw, dt * (moving ? 4.2 : att.yaw !== null ? att.rate : 3.0));
    // ---- the body: only drawn in detail when someone is near enough to see it
    const t = now + this.phase, seen = dv < 45 && Math.abs(v.y - this.y) < 14;
    b.root.position.set(this.x, this.y, this.z); b.root.rotation.y = this.yaw;
    const sitH = this.seat ? (this.seat.h - this.y) - b.bottom + 0.03 + (this.seat.back ? Math.max(0, Math.min(1.1, this.seat.back + 0.12 - (-b.bottom + b.eye))) : 0) : b.hover, by = b.hover + (sitH - b.hover) * this.sitK;
    b.ring.visible = this.sitK < 0.5;
    if (!seen) { b.bob.position.y = by; this.item.x = this.x; this.item.z = this.z; this.item.y = this.y + by; H.tmp.set(this.x, this.y + b.top - (b.hover - by) + 0.35, this.z); H.bubbles.place(this.bubble, H.tmp, now, b.root.visible); return; }
    const P = act === 'walk' || act === 'idle' ? null : pose(act, actT + this.phase * 0, b.D), k = Math.min(1, dt * 5), w = 1 - att.w * (this.state === 'work' && att.yaw !== null ? 0.7 : 0.25);
    this.lean += ((P ? P.lean * w : 0) + (moving ? 0.1 : 0) - this.lean) * k; this.side += ((P?.side ?? 0) - this.side) * k; this.rise += ((P ? P.rise : 0) - this.rise) * k; this.pour += ((P ? P.pour * w : 0) - this.pour) * k;
    this.headYaw += (att.head - this.headYaw) * Math.min(1, dt * 4);
    const calm = P?.calm || this.sitK > 0.5, bobY = Math.sin(t * (calm ? 0.9 : 1.7)) * (calm ? 0.03 : 0.07) * (1 - this.sitK);
    b.bob.position.y = by + bobY + this.rise; b.bob.rotation.set(this.lean + (P ? 0 : Math.sin(t * 0.7) * 0.02), this.headYaw, Math.sin(t * 0.9) * 0.03 * (1 - this.sitK) + this.side + (moving ? 0.03 : 0), 'YXZ');
    b.ring.scale.setScalar(1 + 0.08 * Math.sin(t * 5)); b.ring.material.opacity = 0.6 + 0.25 * Math.sin(t * 5);
    const speak = this.bubble.talking(now);
    b.hands.forEach((h, i) => {
      const r = h.userData.rest; let tx = r[0], ty = r[1] + Math.sin(t * 2.1 + i * 2) * 0.03, tz = r[2];
      if (P) { const q = i ? P.R : P.L; tx = r[0] + (q[0] - r[0]) * w; ty = r[1] + (q[1] - r[1]) * w; tz = r[2] + (q[2] - r[2]) * w; }
      else if (moving) { ty += Math.sin(t * 6 + i * Math.PI) * 0.04; tz += Math.sin(t * 6 + i * Math.PI) * 0.06; }
      if (speak && i === 0 && (!P || att.w > 0.5)) { ty = r[1] + 0.14 + 0.06 * Math.sin(t * 7); tz = r[2] + 0.12; }          // talking with its hands
      h.position.x += (tx - h.position.x) * k; h.position.y += (ty - h.position.y) * k; h.position.z += (tz - h.position.z) * k;
      if (i === 1) h.rotation.x = this.pour;
    });
    if (b.tray) { b.tray.visible = !!this.carrying || (this.state === 'work' && this.job.place === 'window'); if (b.tray.visible) b.tray.position.set((b.hands[0].position.x + b.hands[1].position.x) / 2, (b.hands[0].position.y + b.hands[1].position.y) / 2 + 0.06, (b.hands[0].position.z + b.hands[1].position.z) / 2 + 0.06); }
    // ---- the face: blinking in its own rhythm, glancing about, down at the work, to her, and talking
    const L = this.life.step(now, dt, { w: att.w, eye: att.eye, work: P ? (P.ly ?? 0) : null, moveLook: moving && att.w < 0.5 ? wrapA((this.path ? Math.atan2(this.path[0][0] - this.x, this.path[0][1] - this.z) : this.yaw) - this.yaw) * 1.5 : null });
    const close = ['tamp', 'trim', 'tinker', 'pleat', 'flip', 'oven'].includes(act), restful = ['read', 'listen', 'rest', 'breathe'].includes(act);
    const expr = now < this.exprUntil ? this.expr : att.w > 0.5 && inShop ? (this.rest === 'neutral' || this.rest === 'focus' || this.rest === 'sleepy' ? 'happy' : this.rest) : close ? 'focus' : restful ? (this.rest === 'sass' ? 'sass' : 'sleepy') : this.rest;
    b.face.draw(expr, L.lx, L.shut, { ly: L.ly, mouth: speak ? talkMouth(t) : 0 });
    this.item.x = this.x; this.item.z = this.z; this.item.y = this.y + by;
    H.tmp.set(this.x, this.y + b.top - (b.hover - by), this.z); H.tmp.y += 0.35; H.bubbles.place(this.bubble, H.tmp, now, b.root.visible);
  }
  // Drinks: off to the machine, a few strokes there (tamping, pulling, stirring), and the cup set down on the counter for you
  startDrink(name) {
    const sv = this.spec.serve; this.making = name; if (this.H.debug) console.log('DRINK start', name);
    if (this.seat) { this.seat = null; this.sitK = 0; }
    const ok = this.go(sv.machine, () => { this.work(one(this.trade.machine ?? this.trade.till), this.yaw, 'machine', 4.2); this.H.ctx.sound?.chirp?.([55, 55, 58], 0.03); });
    if (!ok) { this.work(one(this.trade.machine ?? this.trade.till), this.yaw, 'machine', 4.2); }
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
  ctx.clerks = Object.fromEntries(clerks.map(c => [c.spec.id, c])); ctx.clerkHost = H; H.clerks = clerks;
  ctx.animated.push((t, dt) => {
    H.now = t; H.dt = dt;
    const p = ctx.camera.position, V = H.visitor, d = ctx.camera.getWorldDirection(H.tmp);
    V.speed = dt > 0 ? Math.hypot(p.x - V.x, p.z - V.z) / dt : 0; V.x = p.x; V.z = p.z; V.fx = d.x; V.fz = d.z; V.y = ctx.walker?.pos.y ?? 0; V.room = ctx.room ?? null; V.present = ctx.mode === 'walk';
    for (const c of clerks) { try { c.update(dt); } catch (e) { if (!c.broken) { c.broken = true; console.error('clerk', c.name, e.stack ?? e); } } }
    H.talk.update(); H.bubbles.update(t);
  });
  return H;
}
