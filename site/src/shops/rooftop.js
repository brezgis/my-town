// The Gloaming: a bar on the flat metal roof of 315 Mulberry Street (Frond, the plant shop), the last building
// of the row at the sunset end of the street.
//
// Plan coordinates throughout (X = world x, north is +X; Y runs west along the street; world z = -Y).
// The deck is X 24.4 (the street parapet) to 67.5 (the back parapet), Y 161.3 (the brick side of 313, which
// rises a storey above us) to 181 (the low west parapet, and beyond it the Overlook and the sun): 43 ft long
// and not quite 20 wide, with the whole long side open to the west.
//
// So everything solid stands against the brick and everything for looking stands at the west rail:
//   street end   herbs and the slate on the brick | the telescope and two deck chairs in the corner
//   the bar      Hesper's bar and back bar under a pergola | a ledge with stools on the west parapet
//   the fire     a long cushioned bench under the star chart, a fire bowl | a teak bench facing the sun
//   the back     the blanket basket, the stairhead | grasses along the back rail
// String lights run from the brick and the pergola out to poles on the west rail.
// The way up is a single plain flight along the back of the building, from the lawn behind the Overlook:
// treads between two stringers, climbing east to a landing at the top.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { tools, fixtures } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { makeFlames } from '../flame.js';
import { T, F, fill, slate, chalk, paper, board, disc, line, glow, ICON, rnd } from '../draw.js';

const IRON = 'c#2b2724/0.45/1', STEEL = 'c#c9ccd0/0.2/1', TEAK = 'oak_light#a3825c', DARKW = 'fir#4a382c', TIMBER = 'c#6a4a2a/0.8', WIRE = 'c#17140f/0.8';
const BULB = 'e#ffd49a/2.4';                                   // the street's string-light glow: dimmed by day
const GRASS = ['c#c9b48a/0.8', 'c#d9cdb2/0.8', 'c#7fa04a/0.8', 'c#c9a77a/0.8', 'c#5d8a3a/0.8'];

// ---- lettering -----------------------------------------------------------------------------------------
const NEON = (g, w, h) => {
  fill(g, w, h, '#15120f'); g.strokeStyle = '#8a6a3a'; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, h - 10);
  glow(g, '#ff9a4a', 16, () => { T(g, 'The Gloaming', w * 0.44, h * 0.5, h * 0.62, '#ffd9a0', { f: F.yellowtail }); });
  glow(g, '#ff7a5a', 10, () => { ICON.sun(g, w * 0.88, h * 0.5, h * 0.7, '#ffb48a'); });
};
const MENU = (g, w, h) => {
  slate(g, w, h, '#20262a', 12);
  chalk(g, 'The Gloaming', w / 2, h * 0.05, h * 0.062, '#f1efe6'); chalk(g, 'drinks, mostly', w / 2, h * 0.098, h * 0.03, '#e9c46a');
  line(g, [[w * 0.2, h * 0.122], [w * 0.8, h * 0.122]], '#e9c46a', 2);
  const rows = [
    ['OLD FASHIONED', '#e9c46a', '2 oz rye · 1 sugar cube · 3 dashes bitters · orange peel', 'stirred, not hurried'],
    ['NEGRONI', '#e8907a', '1 gin · 1 sweet vermouth · 1 red bitter', 'equal parts, like a good argument'],
    ['SPRITZ', '#f0a45a', '3 prosecco · 2 bitter orange · 1 soda', 'the only countdown we approve of'],
    ['THE VESPER', '#d9e0e8', '3 gin · 1 vodka · ½ aperitif wine · lemon peel', 'shaken. obviously we have this'],
    ['GIN & TONIC', '#9fc6b0', '1 gin to 2 tonic · garnish: everything', 'we were asked to stop. we did not'],
    ['THE SUNSET', '#f08a5a', '1½ oz tequila · 3 oz orange juice · ½ oz grenadine, sunk', 'a Tequila Sunrise, facing west'],
    ['HOT CIDER', '#e9c46a', 'cider · cinnamon · clove · allspice · orange peel', '20 minutes at a murmur. rum if it is that kind of night'],
    ['WINE', '#c98aa0', "red: Tenuta Quasi '19 · white: Weingut Fastabend", 'orange: because it matches'],
    ['SHRUB & SODA', '#b9c8d0', '1 raspberry shrub to 5 soda · no proof, no problem', 'olives: yes. always'],
  ];
  rows.forEach(([n, c, r, j], i) => { const y = h * (0.158 + i * 0.086); chalk(g, n, w * 0.06, y, h * 0.034, c, { a: 'left' }); chalk(g, r, w * 0.06, y + h * 0.03, h * 0.0235, '#efe9da', { a: 'left', max: w * 0.9 }); chalk(g, j, w * 0.94, y + h * 0.055, h * 0.021, '#9aa39d', { a: 'right', max: w * 0.86 }); });
  chalk(g, 'the sun is paying. tip your robot.', w / 2, h * 0.958, h * 0.03, '#e9c46a');
};
// The evening sky over this roof: real stars, placed for late September at 45.5 N about an hour after dark.
const RA = { polaris: [2.53, 89.3, 2], dubhe: [11.06, 61.75, 2], merak: [11.03, 56.38, 2], phecda: [11.9, 53.69, 2], megrez: [12.26, 57.03, 1], alioth: [12.9, 55.96, 2], mizar: [13.4, 54.93, 2], alkaid: [13.79, 49.31, 2],
  caph: [0.15, 59.15, 2], schedar: [0.68, 56.54, 2], gcas: [0.95, 60.72, 2], ruchbah: [1.43, 60.24, 2], segin: [1.91, 63.67, 1],
  deneb: [20.69, 45.28, 3], sadr: [20.37, 40.26, 2], albireo: [19.51, 27.96, 2], gienah: [20.77, 33.97, 2], dcyg: [19.75, 45.13, 2],
  vega: [18.62, 38.78, 4], sheliak: [18.83, 33.36, 1], sulafat: [18.98, 32.69, 1], altair: [19.85, 8.87, 3], tarazed: [19.77, 10.61, 1], alshain: [19.92, 6.41, 1],
  markab: [23.08, 15.21, 2], scheat: [23.06, 28.08, 2], algenib: [0.22, 15.18, 2], alpheratz: [0.14, 29.09, 2], mirach: [1.16, 35.62, 2], almach: [2.07, 42.33, 2],
  arcturus: [14.26, 19.18, 4], capella: [5.28, 46.0, 4], fomalhaut: [22.96, -29.62, 3], alphecca: [15.58, 26.71, 2], rasalhague: [17.58, 12.56, 2], enif: [21.74, 9.88, 2] };
const FIGURES = [['alkaid', 'mizar', 'alioth', 'megrez', 'dubhe', 'merak', 'phecda', 'megrez'], ['caph', 'schedar', 'gcas', 'ruchbah', 'segin'], ['deneb', 'sadr', 'albireo'], ['dcyg', 'sadr', 'gienah'], ['vega', 'sheliak', 'sulafat', 'vega'],
  ['tarazed', 'altair', 'alshain'], ['markab', 'scheat', 'alpheratz', 'algenib', 'markab'], ['alpheratz', 'mirach', 'almach'], ['markab', 'enif']];
const NAMES = [['polaris', 'Polaris'], ['mizar', 'the Plough'], ['gcas', 'Cassiopeia'], ['deneb', 'Deneb'], ['albireo', 'the Swan'], ['vega', 'Vega'], ['altair', 'Altair'], ['scheat', 'Pegasus'], ['mirach', 'Andromeda'], ['arcturus', 'Arcturus (leaving)'], ['capella', 'Capella'], ['fomalhaut', 'Fomalhaut'], ['alphecca', 'the Crown']];
const CHART = (g, w, h) => {
  fill(g, w, h, '#10182c'); const cx = w / 2, cy = h * 0.52, R = w * 0.4, rad = Math.PI / 180, lat = 45.5 * rad, LST = 21.4;
  const sky = g.createRadialGradient(cx, cy, R * 0.1, cx, cy, R); sky.addColorStop(0, '#1c2a4a'); sky.addColorStop(1, '#16203a'); disc(g, cx, cy, R, '#16203a'); g.fillStyle = sky; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  disc(g, cx, cy, R, null, '#d2ae62', 2); disc(g, cx, cy, R * 2 / 3, null, 'rgba(210,174,98,.18)', 1); disc(g, cx, cy, R / 3, null, 'rgba(210,174,98,.18)', 1);
  const P = k => { const [ra, dec] = RA[k], H = (LST - ra) * 15 * rad, d = dec * rad; const alt = Math.asin(Math.sin(d) * Math.sin(lat) + Math.cos(d) * Math.cos(lat) * Math.cos(H));
    const az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(lat) - Math.cos(d) * Math.sin(lat) * Math.cos(H)), r = (1 - alt / (Math.PI / 2)) * R; return [cx - r * Math.sin(az), cy - r * Math.cos(az), alt]; };
  const r0 = rnd(12); for (let i = 0; i < 150; i++) { const a = r0() * 7, rr = Math.sqrt(r0()) * R * 0.98; disc(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0.5 + r0() * 0.6, `rgba(230,225,255,${0.2 + r0() * 0.3})`); }
  for (const f of FIGURES) line(g, f.map(P).filter(p => p[2] > -0.02).map(([x, y]) => [x, y]), 'rgba(233,196,106,.6)', 1.4);
  g.setLineDash([4, 5]); line(g, ['vega', 'deneb', 'altair', 'vega'].map(P).map(([x, y]) => [x, y]), 'rgba(159,198,176,.55)', 1.2); g.setLineDash([]);
  for (const k of Object.keys(RA)) { const [x, y, alt] = P(k); if (alt < 0) continue; disc(g, x, y, 1.2 + RA[k][2] * 0.9, '#fff6dc'); }
  for (const [k, n] of NAMES) { const [x, y, alt] = P(k); if (alt < 0) continue; T(g, n, x + 7, y - 8, w * 0.03, '#efe6cf', { f: F.caveat, w: 600, a: x > cx + R * 0.5 ? 'right' : 'left' }); }
  { const [vx, vy] = P('vega'), [dx, dy] = P('deneb'), [ax, ay] = P('altair'); T(g, 'the Summer Triangle', (vx + dx + ax) / 3, (vy + dy + ay) / 3 + 26, w * 0.024, '#9fc6b0', { f: F.caveat, w: 600 }); }
  T(g, 'N · the back stairs', cx, cy - R - h * 0.022, w * 0.03, '#d2ae62', { f: F.bebas, ls: 2 }); T(g, 'S · across the street', cx, cy + R + h * 0.024, w * 0.03, '#d2ae62', { f: F.bebas, ls: 2 });
  T(g, 'E · the street', cx - R - w * 0.03, cy, w * 0.028, '#d2ae62', { f: F.bebas, ls: 2, rot: -Math.PI / 2 }); T(g, 'W · the sunset end', cx + R + w * 0.03, cy, w * 0.028, '#d2ae62', { f: F.bebas, ls: 2, rot: Math.PI / 2 });
  T(g, 'THE SKY FROM THIS ROOF', cx, h * 0.035, w * 0.045, '#efe6cf', { f: F.bebas, ls: 4 });
  T(g, 'late September, an hour after the sun gives in. hold overhead, face north.', cx, h * 0.972, w * 0.027, '#9fb0d8', { f: F.fraunces, it: 1, w: 600, max: w * 0.94 });
};
const FRONT_X = 24;                                                  // the back edge of the north pavement
// the board at the end of the street: the name, where it is, and an arrow to the right (north, as you walk west)
const THISWAY = (g, w, h) => { board(g, w, h, '#24382f', '#d2ae62', { inset: h * 0.07 }); T(g, 'The Gloaming', w * 0.44, h * 0.36, h * 0.3, '#efe6cf', { f: F.playfair, w: 700, it: 1, max: w * 0.68 }); T(g, 'A BAR ON THE ROOF  ·  ROUND THE BACK', w * 0.44, h * 0.7, h * 0.11, '#e9b44c', { f: F.bebas, ls: 2, max: w * 0.7 });
  g.fillStyle = '#e9b44c'; g.beginPath(); const ax = w * 0.86, ay = h * 0.5, s = h * 0.17; g.moveTo(ax - s, ay - s * 0.35); g.lineTo(ax, ay - s * 0.35); g.lineTo(ax, ay - s * 0.8); g.lineTo(ax + s, ay); g.lineTo(ax, ay + s * 0.8); g.lineTo(ax, ay + s * 0.35); g.lineTo(ax - s, ay + s * 0.35); g.closePath(); g.fill(); };
const WAYUP = (g, w, h) => { board(g, w, h, '#24382f', '#d2ae62', { inset: h * 0.07 }); T(g, 'The Gloaming', w / 2, h * 0.4, h * 0.34, '#efe6cf', { f: F.playfair, w: 700, it: 1, max: w * 0.84 }); T(g, 'A BAR ON THE ROOF  ·  UP THE STAIR', w / 2, h * 0.75, h * 0.13, '#e9b44c', { f: F.bebas, ls: 2, max: w * 0.84 }); };
const LABEL = (name, sub, bg, ink = '#2a1c13', accent = '#a8361f') => (g, w, h) => { paper(g, w, h, bg, name.length); g.strokeStyle = ink; g.lineWidth = 1.5; g.strokeRect(3, 3, w - 6, h - 6); const words = name.split(' ');
  words.forEach((s, i) => T(g, s, w / 2, h * (0.3 + (i - (words.length - 1) / 2) * 0.2), h * (words.length > 2 ? 0.17 : 0.2), ink, { f: F.playfair, w: 700, max: w * 0.84 })); line(g, [[w * 0.2, h * 0.66], [w * 0.8, h * 0.66]], accent, 1.5); T(g, sub, w / 2, h * 0.8, h * 0.12, accent, { f: F.bebas, ls: 1, max: w * 0.84 }); };
const TAG = (txt, c = '#f1e9d6', ink = '#2a1c13') => (g, w, h) => { paper(g, w, h, c); T(g, txt, w / 2, h / 2, h * 0.4, ink, { f: F.caveat, w: 600, max: w * 0.92 }); };
const NOTE = (lines, c = '#f1e9d6', ink = '#2a1c13') => (g, w, h) => { paper(g, w, h, c); lines.forEach((s, i) => T(g, s, w / 2, h * (i + 0.5) / lines.length, h * 0.72 / lines.length, i ? ink : '#a8361f', { f: F.caveat, w: 600, max: w * 0.92 })); };

export default function rooftop(kit, lot, town) {
  if (!lot) return;
  const B = kit.B, K = tools(kit, 77), X = fixtures(kit, K), { ves, ball, tube, bottle, glass, leaves, fruit } = K;
  const ROOF = lot.top - 1.2, DK = ROOF + 0.06;                       // the roof's own surface, and the boards laid on it
  const XS = 24.4, XN = lot.back - 0.5, YE = lot.y0 + 0.5, YW = lot.y1 - 0.5, BX = lot.back;      // the deck's edges: street, back, east (313's brick), west (the view)
  const P = K.wrap(kit.fr(0, 0, 0, 0)), D = K.wrap(kit.fr(0, 0, DK, 0));                          // plan coordinates: heights above the ground, and above the deck
  const W3 = (x, y, h) => new THREE.Vector3(x, h, -y);
  const UP = new THREE.Vector3(0, 1, 0), QT = new THREE.Quaternion(), M4 = new THREE.Matrix4();
  // a round bar between two plan points [X, Y, h]
  const rod = (mat, a, b, r0 = 0.05, r1 = r0, seg = 6) => { const A = W3(...a), d = W3(...b).sub(A), len = d.length(); if (len < 1e-4) return; const g = new THREE.CylinderGeometry(r1, r0, len, seg); g.translate(0, len / 2, 0); g.applyQuaternion(QT.setFromUnitVectors(UP, d.normalize())); g.translate(A.x, A.y, A.z); B.mesh(mat, g); };
  // a board between two plan points: w across (level), t thick
  const beam = (mat, a, b, w, t) => { const A = W3(...a), Bv = W3(...b), g = new THREE.BoxGeometry(w, t, A.distanceTo(Bv)); M4.lookAt(A, Bv, UP); g.applyMatrix4(M4); const c = A.add(Bv).multiplyScalar(0.5); g.translate(c.x, c.y, c.z); B.mesh(mat, g); };
  const block = (x0, x1, y0, y1, h0, h1) => B.block(x0, x1, y0, y1, h0, h1);
  const surf = (x0, x1, y0, y1, h, h2) => kit.town.surfaces.push(h2 === undefined ? { x0, x1, z0: -y1, z1: -y0, h } : { x0, x1, z0: -y1, z1: -y0, h, h2, ramp: true });      // a ramp is h at the east end (y0), h2 at the west (y1)
  // a plain iron rail: posts from z0 up to `tall`, a top rail and one below it, between plan points (heights given at each end)
  const fence = (a, b, n, o = {}) => { const z0 = o.z0 ?? 0, tall = o.tall ?? 3.4;
    for (let i = 0; i <= n; i++) { if ((i === 0 && o.noFirst) || (i === n && o.noLast)) continue; const t = i / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, h = a[2] + (b[2] - a[2]) * t; rod(IRON, [x, y, h + z0], [x, y, h + tall + 0.04], 0.065, 0.065, 6); }
    rod(IRON, [a[0], a[1], a[2] + tall], [b[0], b[1], b[2] + tall], 0.075, 0.075, 8);
    for (const k of o.mids ?? [0.5]) rod(IRON, [a[0], a[1], a[2] + tall * k], [b[0], b[1], b[2] + tall * k], 0.035, 0.035, 5); };
  // a lantern standing on something: an iron cage round a glowing glass
  const lanternAt = (f, x, y, z, s = 1) => { f.box(IRON, x - 0.22 * s, x + 0.22 * s, y - 0.22 * s, y + 0.22 * s, z, z + 0.05); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) f.box(IRON, x + a * 0.2 * s - 0.02, x + a * 0.2 * s + 0.02, y + b * 0.2 * s - 0.02, y + b * 0.2 * s + 0.02, z, z + 0.7 * s);
    f.box(IRON, x - 0.25 * s, x + 0.25 * s, y - 0.25 * s, y + 0.25 * s, z + 0.7 * s, z + 0.76 * s); ves(f, IRON, x, y, z + 0.76 * s, [[0.2 * s, 0], [0.06 * s, 0.14 * s], [0, 0.15 * s]], 4);
    ves(f, BULB, x, y, z + 0.08, [[0, 0], [0.11 * s, 0], [0.13 * s, 0.2 * s], [0.08 * s, 0.46 * s], [0, 0.5 * s]], 8); };

  // ======================================================================================================
  // THE STAIR: one flight along the back wall, from the lawn behind the Overlook up east to a landing
  // ======================================================================================================
  const SX0 = BX + 0.15, SX1 = BX + 3.85;                               // the flight's two sides (the wall side and the open side)
  const YT = YE + 4.1, HT = lot.top + 0.2, H0 = 0.1;                     // the landing runs YE..YT, just clear of the parapet; the lawn
  const NT = 40, GO = 0.87, YF = YT + NT * GO;                           // forty treads; the foot
  const hs = y => HT + (H0 - HT) * Math.max(0, Math.min(1, (y - YT) / (YF - YT)));      // the height of the flight at y
  {
    const TREAD = 'fir#8a6a4c', STONE = 'c#9a9590/0.8', RISE = (HT - H0) / NT;
    surf(SX0, SX1, YT, YF, HT, H0); surf(XN - 0.1, SX1, YE, YT, HT);
    for (let i = 0; i < NT; i++) { const h = HT - (i + 0.5) * RISE; P.box(TREAD, SX0 + 0.12, SX1 - 0.12, YT + i * GO - 0.14, YT + (i + 1) * GO, h - 0.13, h, G); }
    for (const x of [SX0 + 0.1, SX1 - 0.1]) beam(DARKW, [x, YT - 0.15, HT - 0.5], [x, YF + 0.35, H0 - 0.55], 0.2, 0.95);      // the two stringers
    P.box(TREAD, XN - 0.15, SX1, YE, YT, HT - 0.14, HT, G);                                                                      // the landing
    for (const y of [YE + 0.2, YT - 0.2]) P.box(DARKW, BX + 0.02, SX1, y - 0.12, y + 0.12, HT - 0.62, HT - 0.14);              // on two joists out of the wall
    for (const y of [lot.y1 - 9, lot.y1 - 0.4]) P.box(DARKW, BX + 0.02, SX1, y - 0.12, y + 0.12, hs(y) - 1.5, hs(y) - 0.98);   // and two more under the flight
    { const y = lot.y1 + 5.2, h = hs(y) - 1.0;                                                                                   // past the corner: one pair of posts and a beam
      for (const x of [SX0 + 0.1, SX1 - 0.1]) { P.box(DARKW, x - 0.17, x + 0.17, y - 0.17, y + 0.17, 0, h); block(x - 0.22, x + 0.22, y - 0.22, y + 0.22, 0, Math.min(h, 7)); }
      P.box(DARKW, SX0 - 0.1, SX1 + 0.1, y - 0.14, y + 0.14, h - 0.5, h); }
    P.box(STONE, SX0 - 0.3, SX1 + 0.3, YF - 0.3, YF + 2.4, -0.3, H0);                                                           // a stone at the foot
    // the rail: down the open side, round the landing, and on the wall side once the wall has ended
    const yc = lot.y1 + 0.6;
    fence([SX1 - 0.02, YT, HT], [SX1 - 0.02, YF, H0], 6, { z0: -0.5 }); fence([SX1 - 0.02, YT, HT], [SX1 - 0.02, YE - 0.05, HT], 1, { noFirst: true }); fence([SX1 - 0.02, YE - 0.05, HT], [BX + 0.1, YE - 0.05, HT], 1, { noFirst: true });
    fence([SX0 + 0.02, yc, hs(yc)], [SX0 + 0.02, YF, H0], 3, { z0: -0.5 });
    // what stops you: stepped walls beside the flight (never where a head passes below), and the low end boxed in underneath
    for (let y = YT; y < YF - 0.01; y += 2) { const yb = Math.min(YF, y + 2); block(SX1, SX1 + 0.25, y, yb, hs(yb) + 0.3, hs(y) + 4.8); block(SX0 - 0.25, SX0, y, yb, hs(yb) + 0.3, hs(y) + 4.8); }
    for (let y = YF - 1; hs(y) < 6.4; y -= 1) block(SX0, SX1, y, y + 1, 0, hs(y + 1) + 0.25);
    block(SX1, SX1 + 0.25, YE - 0.3, YT, HT + 0.3, HT + 5); block(XN - 0.6, SX1 + 0.25, YE - 0.3, YE - 0.05, DK + 0.3, HT + 7);
    // one step down from the landing onto the deck
    D.box(TREAD, XN - 1.1, XN - 0.1, YE + 0.1, YT - 0.1, 0.02, (HT - DK) / 2, G); surf(XN - 1.1, XN - 0.1, YE + 0.1, YT - 0.1, DK + (HT - DK) / 2);
    // one small sign and a lantern at the foot, facing the Overlook; a lantern at the head
    const sx = SX0 - 0.7, sy = YF + 0.9;
    P.box(DARKW, sx - 0.12, sx + 0.12, sy - 0.12, sy + 0.12, 0, 6.3); block(sx - 0.25, sx + 0.25, sy - 0.25, sy + 0.25, 0, 6);
    P.box(DARKW, sx - 0.2, sx - 0.13, sy - 1.3, sy + 1.3, 3.9, 5.3); kit.sign(kit.fr(sx - 0.215, sy, 0, 1), 0, 0, 4.6, 2.4, 1.2, WAYUP, { cw: 360, ch: 180 });
    // every lantern on the way up is a real light with a soft halo, set just inboard of its glass so that it falls on
    // the treads (they were bright glass that lit nothing: the stair stood black after dark)
    const lit = (x, y, z, power, halo = 0.7) => { kit.lampAt(P, x, y, z, power); kit.lamps[kit.lamps.length - 1].halo = halo; };
    lanternAt(P, sx, sy, 6.3, 1.3); lit(sx - 0.5, sy, 6.7, 0.9, 0.8);
    lanternAt(P, SX1 - 0.02, YE - 0.05, HT + 3.46); lit(SX1 - 0.9, YE + 0.9, HT + 3.9, 0.85);
    // lanterns down the stair, standing on the rail of the open side, so the way up shows from the street after dark
    for (let k = 1; k <= 3; k++) { const y = YT + k * (YF - YT) / 4; lanternAt(P, SX1 - 0.02, y, hs(y) + 3.46, 0.9); lit(SX1 - 0.8, y, hs(y) + 3.85, 0.9); }
    // and one board where the gravel walk leaves the pavement at the end of the street: this way
    { const px = FRONT_X + 1.7, py = 192.2;
      P.box(DARKW, px - 0.12, px + 0.12, py - 0.12, py + 0.12, 0, 6.6); block(px - 0.25, px + 0.25, py - 0.25, py + 0.25, 0, 6);
      P.box(DARKW, px - 1.5, px + 1.5, py - 0.2, py - 0.13, 4.2, 5.9); kit.sign(kit.fr(px, py - 0.215, 0, 2), 0, 0, 5.05, 2.8, 1.5, THISWAY, { cw: 420, ch: 225 });
      lanternAt(P, px, py, 6.6, 1.2); lit(px, py - 0.6, 6.9, 0.85, 0.8); }
  }

  // ======================================================================================================
  // THE DECK: boards, and something to stop you all the way round
  // ======================================================================================================
  D.box('fir#b89a78', XS + 0.05, XN - 0.05, YE + 0.05, YW - 0.05, -0.058, 0, G);
  surf(XS, XN, YE, YW, DK);
  {
    // the street parapet is waist high already. West and back: iron posts on the low parapets and a rail.
    const pz = lot.top, o = { tall: DK + 3.4 - pz };
    fence([XS + 0.2, lot.y1 - 0.25, pz], [BX - 0.14, lot.y1 - 0.25, pz], 8, o);
    fence([BX - 0.14, lot.y1 - 0.25, pz], [BX - 0.14, YT, pz], 3, { ...o, noFirst: true });
    block(XS - 0.4, XS + 0.06, lot.y0, lot.y1, DK + 0.5, DK + 7.5);                    // street
    block(XS, BX, YW - 0.02, lot.y1 + 0.3, DK + 0.3, DK + 7.5);                        // west
    block(XS, BX, lot.y0 - 0.3, YE + 0.02, DK + 0.3, DK + 7.5);                        // east (313's wall)
    block(XN - 0.02, BX + 0.05, YT, lot.y1, DK + 0.3, DK + 7.5);                       // back, all but the stairhead
  }

  // ---- small things used all over the deck ----------------------------------------------------------------
  const seatAt = (x, y, h, yaw, label) => kit.seats.push({ x, y: DK + h + 2.45, z: -y, yaw, label });
  const clump = (f, x, y, z, s = 1, col = GRASS) => leaves(f, x, y, z, { n: 13, len: 1.9 * s, w: 0.028, up: 1.0, out: 0.32, droop: 0.9, spread: 0.16, col });
  // a trough of grasses on the deck
  const planter = (x0, x1, y0, y1, h, mat = 'c#5a5a56/0.8') => {
    D.box(mat, x0, x1, y0, y1, 0.02, h); D.box('c#3a2214/0.8', x0 + 0.08, x1 - 0.08, y0 + 0.08, y1 - 0.08, h, h + 0.02); D.block(x0, x1, y0, y1, 0, Math.max(h, 1.6));
    const long = x1 - x0 > y1 - y0, n = Math.max(2, Math.round((long ? x1 - x0 : y1 - y0) / 0.95));
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; clump(D, long ? x0 + (x1 - x0) * t : (x0 + x1) / 2 + (K.rnd() - 0.5) * 0.3, long ? (y0 + y1) / 2 + (K.rnd() - 0.5) * 0.3 : y0 + (y1 - y0) * t, h, 0.75 + K.rnd() * 0.45); }
  };
  // a round bar between two points of a frame on the deck
  const rodLocal = (f, mat, a, b, r) => { const [ax, az] = kit.world(f, a[0], a[1]), [bx, bz] = kit.world(f, b[0], b[1]); rod(mat, [ax, -az, DK + a[2]], [bx, -bz, DK + b[2]], r, r, 8); };
  const WALL = lot.y0 + 0.02;                                           // the face of 313's brick, a hair proud of it

  // ======================================================================================================
  // THE BAR, against the brick of 313, under a pergola
  // ======================================================================================================
  const BXC = 37.5, HL = 6.5;                                           // the middle of the bar, and half its length
  const c = K.wrap(kit.fr(BXC, YE + 5.6, DK, 0));                       // the counter's customer side; +y is toward the customers (west), +x is north
  const b = K.wrap(kit.fr(BXC, WALL, DK, 0));                           // on the brick wall: y = 0 is the wall, +y comes out toward the bar
  const TOP = X.counter(c, -HL, HL, -1.9, 0, 3.5, { front: 'painted_wood#24382f', top: 'oak_light#8a6a48', overhang: 0.3 });
  const RAILX = [-6.3, -3.15, 0, 3.15, 6.3];
  c.box(BRASS, -HL, HL, 0.2, 0.26, 0.62, 0.68); for (const x of RAILX) c.box(BRASS, x - 0.03, x + 0.03, 0.02, 0.23, 0.6, 0.66);                              // the foot rail
  rodLocal(c, BRASS, [-HL + 0.1, 0.36, TOP - 0.5], [HL - 0.1, 0.36, TOP - 0.5], 0.035); for (const x of RAILX) c.box(BRASS, x - 0.025, x + 0.025, 0.02, 0.38, TOP - 0.53, TOP - 0.47);      // and one for bags and elbows
  for (const x of [-5, -2.5, 0, 2.5, 5]) X.stool(c.sub(x, 1.2, 0, 2), 0, 0, 2.55, { label: 'sit at the bar', mat: 'leather#6a3a2a' });
  {
    // on the bar: ice, a shaker, a mixing glass, bitters, garnish, a bell, olives and almonds, water, candles
    const z = TOP;
    ves(c, STEEL, 4.6, -1.2, z, [[0, 0], [0.3, 0], [0.36, 0.5], [0.38, 0.52], [0.34, 0.5], [0.28, 0.05], [0, 0.05]], 18); for (let i = 0; i < 9; i++) c.box('glass', 4.42 + (i % 3) * 0.13, 4.52 + (i % 3) * 0.13, -1.37 + Math.floor(i / 3) * 0.13, -1.27 + Math.floor(i / 3) * 0.13, z + 0.4 + (i % 2) * 0.05, z + 0.5 + (i % 2) * 0.05);
    ves(c, STEEL, 3.8, -1.25, z, [[0, 0], [0.11, 0], [0.15, 0.5], [0.15, 0.56], [0.12, 0.6], [0.08, 0.78], [0.08, 0.86], [0, 0.87]], 14);
    ves(c, 'glass', 3.25, -1.15, z, [[0, 0], [0.14, 0], [0.16, 0.5], [0.15, 0.5], [0.13, 0.03], [0, 0.03]], 14); tube(c, STEEL, [[3.25, -1.15, z + 0.04], [3.3, -1.1, z + 0.95]], 0.012, 4);
    for (const [i, col] of ['c#3a2214/0.3', 'c#8a1c1c/0.3', 'c#c9952a/0.3'].entries()) bottle(c, 2.55 + i * 0.2, -1.4, z, { r: 0.06, h: 0.42, col, cap: 'c#e8c73a/0.4', neck: 0.02 });
    K.bowl(c, 5.55, -1.3, z, 0.3, 0.16, 'c#e8e2d4/0.3'); fruit(c, 'orange', 5.47, -1.35, z + 0.05); fruit(c, 'lemon', 5.67, -1.21, z + 0.05); fruit(c, 'lime', 5.51, -1.13, z + 0.06);
    c.box('oak_light#c4a477', 5.0, 5.9, -0.75, -0.3, z + 0.004, z + 0.06); c.cyl('c#e0782a/0.45', 5.25, -0.52, z + 0.06, z + 0.085, 0.13, 0.13, 14); c.cyl('c#e0782a/0.45', 5.55, -0.5, z + 0.06, z + 0.085, 0.13, 0.13, 14); c.box(STEEL, 5.75, 5.79, -0.72, -0.34, z + 0.06, z + 0.075);
    ves(c, BRASS, 0.2, -1.45, z, [[0, 0], [0.2, 0], [0.2, 0.03], [0.17, 0.05], [0.16, 0.14], [0.1, 0.22], [0.03, 0.25], [0.03, 0.3], [0, 0.31]], 16); X.card(c, 0.2, -1.12, z, 0.7, 0.22, TAG('ring for silence'));
    lot.roofBell = { xz: kit.world(c, 0.2, -1.45), y: DK + z + 0.2 };
    K.bowl(c, -1.3, -0.7, z, 0.24, 0.13, 'c#2f5a6a/0.3'); for (let i = 0; i < 12; i++) ball(c, i % 4 ? 'c#5d7a3a/0.3' : 'c#3a2a30/0.3', -1.3 + Math.cos(i * 2.4) * 0.11 * (i % 3) / 2, -0.7 + Math.sin(i * 2.4) * 0.11 * (i % 3) / 2, z + 0.04 + (i % 3 === 0 ? 0.04 : 0), 0.035, 7, 1.2);
    K.bowl(c, -2.3, -0.75, z, 0.2, 0.11, 'c#e8e2d4/0.3'); for (let i = 0; i < 14; i++) ball(c, 'c#a8784a/0.8', -2.3 + Math.cos(i * 2.4) * 0.09 * (i % 3) / 2, -0.75 + Math.sin(i * 2.4) * 0.09 * (i % 3) / 2, z + 0.035 + (i % 3 === 0 ? 0.03 : 0), 0.026, 6, 0.8);
    ves(c, 'glass', -4.3, -1.1, z, [[0, 0], [0.2, 0], [0.24, 0.3], [0.2, 0.62], [0.15, 0.76], [0.18, 0.86], [0.165, 0.86], [0.135, 0.76], [0.185, 0.62], [0.225, 0.3], [0.19, 0.03], [0, 0.03]], 16); for (let i = 0; i < 4; i++) glass(c, -4.9 + (i % 2) * 0.27, -1.3 + Math.floor(i / 2) * 0.27, z, 0.1, 0.32);
    const olive = T3 => { const g = new T3.Group(), m = new T3.MeshStandardMaterial({ color: 0x66803a, roughness: 0.3 }), s = new T3.MeshStandardMaterial({ color: 0xd9cdb2, roughness: 0.8 });
      for (let i = 0; i < 3; i++) { const o = new T3.Mesh(new T3.SphereGeometry(0.035, 10, 8).scale(1, 1.25, 1), m); o.position.set(0, 0.03 + i * 0.07, 0); g.add(o); } const st = new T3.Mesh(new T3.CylinderGeometry(0.004, 0.004, 0.34, 5), s); st.position.y = 0.13; g.add(st); return g; };
    const nuts = T3 => { const g = new T3.Group(), m = new T3.MeshStandardMaterial({ color: 0xa8784a, roughness: 0.8 }); for (let i = 0; i < 6; i++) { const o = new T3.Mesh(new T3.SphereGeometry(0.026, 8, 6).scale(1.3, 0.8, 1), m); o.position.set(Math.cos(i * 1.05) * 0.04, 0.02 + (i % 2) * 0.02, Math.sin(i * 1.05) * 0.04); g.add(o); } return g; };
    const at = (x, y) => { const [wx0, wz0] = kit.world(c, x, y); return { x: wx0, y: DK + z + 0.12, z: wz0 }; };
    kit.eats?.push({ ...at(-1.3, -0.7), name: 'olive or three', build: olive, bites: 3, note: 'Three olives. The stick you keep, as a small sword.' });
    kit.eats?.push({ ...at(-2.3, -0.75), name: 'handful of smoked almonds', build: nuts, bites: 3, note: 'Salt, smoke, gone. The bowl is still full; it always is.' });
    kit.eats?.push({ ...at(-4.3, -1.1), name: 'glass of water', drink: { vessel: 'tumbler', liquid: 0xcfe3e6 }, note: 'Water, at altitude. It tastes of nothing, beautifully.' });
    lot.roofOlive = olive;
    kit.jarCandle(c, -5.9, -0.6, z, { label: 'c#24382f/0.6', lid: false }); kit.jarCandle(c, 1.6, -1.35, z, { label: 'c#8a1c1c/0.6', lid: false }); kit.candle(c, 6.1, -1.0, z, 0.5);
    lot.roofPickup = { xz: kit.world(c, 1.4, -0.55), y: DK + z };
  }
  {
    // the back bar: a cabinet against the wall (it swallows the low parapet), three shelves on the brick above it
    b.box('painted_wood#24382f', -HL, HL, 0.02, 1.6, 0, 3.2, G); b.box('oak_light#8a6a48', -HL - 0.08, HL + 0.08, 0.02, 1.7, 3.2, 3.3, G); b.block(-HL, HL, 0, 1.6, 0, 3.3);
    for (let i = 0; i < 6; i++) { const x0 = -6.4 + i * 2.14; b.box('painted_wood#2f4a40', x0 + 0.1, x0 + 2.04, 1.6, 1.63, 0.4, 3.0, G); b.box(BRASS, x0 + 0.97, x0 + 1.17, 1.63, 1.67, 2.5, 2.54); }
    const s = b.sub(0, 0, 3.3), zs = [1.35, 2.75, 4.15];
    X.shelving(s, -6.4, 6.4, zs, { d: 0.9, mat: DARKW, over: 1.2, back: false, block: false, bay: 3.2 });
    s.box(BRASS, -6.4, 6.4, 0.9, 0.93, zs[0] + 0.12, zs[0] + 0.15); s.box(BRASS, -6.4, 6.4, 0.9, 0.93, zs[1] + 0.12, zs[1] + 0.15);
    // spirits, by distillers nobody has heard of
    const SPIRITS = [['Old Parallax', 'STRAIGHT RYE', '#efe2bc', 'c#8a5a2a/0.2'], ['Low Ember', 'BOURBON', '#e8d9b0', 'c#a8784a/0.2'], ['Foghorn', 'DRY GIN', '#d9e4e0', 'c#c9d6d8/0.2'], ['Ninth Cloud', 'VODKA', '#e4e8ee', 'c#c9ccd0/0.2'], ['Tin Moon', 'TEQUILA BLANCO', '#f0e6c8', 'c#d9cdb2/0.2'],
      ['Halfpenny', 'DARK RUM', '#e0c9a0', 'c#3a2214/0.2'], ['Sister Agnes', 'AMARO', '#d9c9a8', 'c#3a2214/0.2'], ['Orange Regret', 'APERITIVO', '#f3d9b8', 'c#e0782a/0.2'], ['Rosso Niente', 'SWEET VERMOUTH', '#e8d0c0', 'c#8a1c1c/0.2'], ['Kestrel', 'DRY VERMOUTH', '#e4e6d0', 'c#d9cdb2/0.2'],
      ['Pale Hour', 'APERITIF WINE', '#f1ecd0', 'c#e8c73a/0.2'], ['Red Bitter', 'OF NO FIXED ABODE', '#f0d0c8', 'c#c8202a/0.2'], ['Hearthside', 'APPLE BRANDY', '#e6d4a8', 'c#c9952a/0.2'], ['Mrs Okafor', 'GRENADINE', '#f0d8d8', 'c#8a1c1c/0.2']];
    SPIRITS.forEach(([n, sub, bg, col], i) => { const x = -5.85 + i * 0.86 + (i > 6 ? 0.25 : 0), r = 0.115 + (i % 3) * 0.008, h = 0.92 + ((i * 7) % 5) * 0.035; bottle(s, x, 0.5, zs[0], { r, h, col, cap: i % 2 ? 'c#17140f/0.4' : 'c#b08d4a/0.35/1' }); kit.sign(s, x, 0.5 + r + 0.012, zs[0] + h * 0.34, r * 1.35, h * 0.34, LABEL(n, sub, bg), { cw: 72, ch: 110 }); });
    // wine, by vintners likewise
    const WINES = [['Tenuta Quasi', "ROSSO '19", '#efe6d2', 'c#2f4a2a/0.2'], ['Château Peut-être', 'GRAND VIN', '#f1ead8', 'c#2f4a2a/0.2'], ['Domaine du Presque', 'GAMAY', '#e8d8d0', 'c#3a2214/0.2'], ['Weingut Fastabend', 'RIESLING', '#e9ecd8', 'c#7fa04a/0.2'], ['Clos du Lampadaire', 'CHENIN', '#f0ead0', 'c#c9b48a/0.2'],
      ['Orange You Glad', 'SKIN CONTACT', '#f3dcc0', 'c#e0782a/0.2'], ['Casa Tal Vez', 'TEMPRANILLO', '#e6d2c8', 'c#2f4a2a/0.2'], ['Quinta do Quase', 'VINHO VERDE', '#e4ecd8', 'c#9fb0a4/0.2'], ['Fizz, Probably', 'PROSECCO-ISH', '#f1ecd8', 'c#3a6a3a/0.2']];
    WINES.forEach(([n, sub, bg, col], i) => { const x = -5.8 + i * 0.8; bottle(s, x, 0.5, zs[1], { r: 0.125, h: 1.08, col, cap: i === 8 ? 'c#b08d4a/0.35/1' : 'c#8a1c1c/0.45', neck: 0.04 }); kit.sign(s, x, 0.5 + 0.137, zs[1] + 0.34, 0.17, 0.36, LABEL(n, sub, bg, '#2a1c13', '#5a4a2c'), { cw: 72, ch: 150 }); });
    for (let i = 0; i < 7; i++) bottle(s, 1.7 + i * 0.42, 0.5, zs[1], { r: 0.1, h: 0.7 + (i % 3) * 0.12, col: K.pick(['c#c9952a/0.2', 'c#8a5a2a/0.2', 'c#c9d6d8/0.2', 'c#e0782a/0.2']), label: 'c#efe2bc/0.6', cap: 'c#17140f/0.4' });
    K.potted(s, 5.4, 0.5, zs[1], { r: 0.26, n: 16, len: 1.3, up: 0.2, out: 0.6, droop: 1.6, pot: 'c#e8e2d4/0.45' });
    // the top shelf: the good stuff, a radio, things kept for luck
    for (let i = 0; i < 6; i++) bottle(s, -5.8 + i * 0.6, 0.5, zs[2], { r: 0.13, h: 0.8 + (i % 2) * 0.14, col: K.pick(['c#8a5a2a/0.2', 'c#3a2214/0.2', 'c#a8784a/0.2']), label: 'c#17140f/0.5', cap: 'c#b08d4a/0.35/1' });
    s.soft('c#8a5a2a/0.45', -2.0, -0.6, 0.2, 0.75, zs[2], zs[2] + 0.8, 0.08); s.box('c#d9cdb2/0.8', -1.88, -1.3, 0.75, 0.77, zs[2] + 0.14, zs[2] + 0.66); s.box(BRASS, -1.1, -0.8, 0.75, 0.78, zs[2] + 0.3, zs[2] + 0.56); tube(s, STEEL, [[-0.7, 0.5, zs[2] + 0.8], [-0.3, 0.5, zs[2] + 1.9]], 0.01, 4);
    K.potted(s, 0.6, 0.5, zs[2], { r: 0.24, n: 14, len: 1.5, up: 0.15, out: 0.6, droop: 1.7, pot: 'c#2f5a6a/0.45' }); kit.model('vintage_oil_lamp', s, 2.2, 0.5, zs[2], 0);
    for (let i = 0; i < 5; i++) K.jar(s, 3.6 + i * 0.55, 0.5, zs[2], 0.2, 0.55, ['c#e0782a/0.6', 'c#e8c73a/0.6', 'c#7fa04a/0.6', 'c#8a1c1c/0.6', 'c#c9a77a/0.8'][i], 0.75, BRASS);      // dried orange, lemon, rosemary, cherries, cinnamon
    // glassware on the back counter: wine glasses, rocks glasses, highballs; a board, a towel, a little sink
    const WINE = [[0, 0], [0.11, 0], [0.11, 0.01], [0.015, 0.02], [0.012, 0.25], [0.07, 0.3], [0.13, 0.42], [0.105, 0.6], [0.098, 0.6], [0.122, 0.42], [0.065, 0.31], [0.012, 0.27]];
    for (let i = 0; i < 10; i++) ves(s, 'glass', -6.0 + (i % 5) * 0.34, 0.4 + Math.floor(i / 5) * 0.36, 0, WINE, 12);
    for (let i = 0; i < 10; i++) glass(s, -3.6 + (i % 5) * 0.3, 0.4 + Math.floor(i / 5) * 0.3, 0, 0.12, 0.27);
    for (let i = 0; i < 8; i++) glass(s, -1.5 + (i % 4) * 0.25, 0.4 + Math.floor(i / 4) * 0.27, 0, 0.09, 0.5);
    s.box('oak_light#c4a477', 0.3, 1.6, 0.75, 1.45, 0.004, 0.07); fruit(s, 'orange', 0.7, 1.15, 0.07); fruit(s, 'lemon', 1.2, 1.05, 0.07); s.box(STEEL, 1.3, 1.34, 0.85, 1.35, 0.07, 0.085);
    K.towel(s, 2.6, 3.4, 1.72, -0.15, 0.9, 'c#e8e2d4/0.8', 'c#b8361f/0.8');
    b.box(STEEL, 4.4, 6.2, 0.4, 1.45, 3.26, 3.31); tube(b, STEEL, [[5.3, 0.3, 3.3], [5.3, 0.3, 4.0], [5.3, 0.7, 4.12], [5.3, 0.85, 3.9]], 0.035, 8);
  }
  // the pergola: two posts, a beam, rafters back to the wall, slats over them
  {
    const PT = 'c#5a4432/0.8', PX = 7.0;
    for (const x of [-PX, PX]) { c.box(DARKW, x - 0.2, x + 0.2, 1.9, 2.3, 0.3, 9.6, G); c.block(x - 0.2, x + 0.2, 1.9, 2.3, 0, 9.6); c.box(IRON, x - 0.26, x + 0.26, 1.84, 2.36, 0.004, 0.3); }
    c.box(DARKW, -PX - 0.6, PX + 0.6, 1.95, 2.25, 9.6, 10.1, G); b.box(DARKW, -PX - 0.6, PX + 0.6, 0.01, 0.2, 9.6, 10.1, G);
    for (let i = 0; i < 10; i++) { const x = -PX - 0.3 + i * (2 * PX + 0.6) / 9; b.box(PT, x - 0.09, x + 0.09, 0.01, 9.4, 10.1, 10.42); }
    for (let i = 0; i < 9; i++) b.box(PT, -PX - 0.6, PX + 0.6, 0.5 + i * 1.06, 0.62 + i * 1.06, 10.42, 10.5);
    for (const x of [-4.3, 0, 4.3]) X.pendant(c, x, -0.95, { kind: 'dome', zc: 10.1, drop: 3.5, colour: 'c#b06a3c/0.32/1', power: 1.0 });
    // a vine up the north post from a pot at its foot, a lantern on the south one
    for (let i = 0; i < 9; i++) leaves(c, PX + Math.cos(i * 2.2) * 0.25, 2.1 + Math.sin(i * 2.2) * 0.25, 0.8 + i * 1.0, { n: 5, len: 0.6, w: 0.11, up: 0.25, out: 0.8, droop: 0.5, spread: 0.1 });
    tube(c, 'c#4a3a24/0.8', [[PX + 0.25, 2.3, 0], [PX - 0.25, 2.35, 2.5], [PX + 0.25, 1.9, 5], [PX - 0.2, 1.85, 7.5], [PX + 0.1, 2.3, 9.6]], 0.03, 5); c.cyl('c#b8755a/0.85', PX + 0.6, 2.5, 0.004, 0.9, 0.36, 0.46, 14); c.block(PX + 0.15, PX + 1.05, 2.05, 2.95, 0, 1.6);
    rodLocal(c, IRON, [-PX, 2.3, 7.85], [-PX, 3.0, 8.05], 0.03); rodLocal(c, IRON, [-PX, 3.0, 8.05], [-PX, 3.0, 7.8], 0.012); lanternAt(c, -PX, 3.0, 6.9, 1);
    // the name, in neon on the front of the pergola, facing the sunset
    c.box('c#17140f/0.5', -5.3, 5.3, 2.05, 2.2, 10.52, 12.36); kit.sign(c, 0, 2.21, 11.44, 10.4, 1.74, NEON, { cw: 936, ch: 156, glow: 1.25 });      // it stands on the slats, clear of the rafter ends
  }

  // ======================================================================================================
  // THE STREET END: herbs and the slate on the brick; the telescope and two deck chairs in the west corner
  // ======================================================================================================
  {
    const m = K.wrap(kit.fr(27.1, WALL, DK, 0));
    X.slateBoard(m, 0, 6.95, 4.7, 6.1, MENU, { cw: 700, ch: 908 });
    // the herb trough stands over the low parapet, on two legs
    m.box(DARKW, -2.3, 2.3, 0.05, 1.35, 1.8, 2.6, G); m.box('c#3a2214/0.8', -2.2, 2.2, 0.15, 1.25, 2.6, 2.62); for (const x of [-2.2, 2.2]) m.box(DARKW, x - 0.08, x + 0.08, 1.15, 1.31, 0, 1.8, G); m.block(-2.3, 2.3, 0, 1.35, 0, 2.6);
    const herbs = [['mint', 'c#5d8a3a/0.8', 0.11, 0.5], ['rosemary', 'c#4a6e38/0.8', 0.025, 0.9], ['thyme', 'c#7fa04a/0.8', 0.03, 0.35], ['basil', 'c#3a6a3a/0.8', 0.13, 0.55], ['sage', 'c#9fb0a4/0.8', 0.1, 0.5]];
    herbs.forEach(([n, col, w, len], i) => { const x = -1.76 + i * 0.88; for (const dx of [-0.2, 0.2]) leaves(m, x + dx, 0.7, 2.6, { n: 11, len, w, up: 0.95, out: n === 'rosemary' ? 0.25 : 0.6, droop: 0.4, spread: 0.12, col: [col, 'c#5d7a45/0.7'] }); X.card(m, x, 1.36, 2.2, 0.62, 0.3, TAG(n + (n === 'basil' ? ' (optimistic)' : ''), '#e8e2d4')); });
    kit.model('watering_can_metal_01', m, 3.0, 1.1, 0, 0, { turn: 0.6 });
  }
  {
    // the telescope: brass, on a wooden tripod, laid over the rail on the place where the sun goes
    const ax = 25.9, ay = YW - 2.0, az = 4.35, dir = [-0.16, 1, 0.07], n = Math.hypot(...dir), u = dir.map(v => v / n), at = t => [ax + u[0] * t, ay + u[1] * t, DK + az + u[2] * t + 0.16];
    for (let i = 0; i < 3; i++) { const a = 0.5 + i * 2.094; rod(TIMBER, [ax + Math.cos(a) * 1.15, ay + Math.sin(a) * 1.15, DK], [ax, ay, DK + az - 0.1], 0.055, 0.045, 6); }
    rod(BRASS, [ax, ay, DK + az - 0.2], [ax, ay, DK + az + 0.1], 0.07, 0.05, 8);
    rod(BRASS, at(-1.5), at(-1.2), 0.045, 0.06, 10); rod(BRASS, at(-1.2), at(-0.2), 0.065, 0.065, 12); rod(BRASS, at(-0.2), at(1.2), 0.09, 0.09, 12); rod(BRASS, at(1.2), at(1.9), 0.115, 0.125, 12); rod('c#17140f/0.3', at(1.88), at(1.92), 0.1, 0.1, 12);
    for (const t of [-0.2, 1.2]) rod('c#8a5a2a/0.45', at(t - 0.04), at(t + 0.04), 0.1 + (t > 0 ? 0.03 : 0), 0.1 + (t > 0 ? 0.03 : 0), 12);
    D.block(ax - 0.5, ax + 0.5, ay - 0.5, ay + 0.5, 0, 4.5);
    lot.roofScope = { x: ax, y: DK + az + 0.2, z: -ay };
    // two deck chairs facing west, a table between them
    const chair = (cx, cy, cols) => {
      for (const sx of [cx - 0.92, cx + 0.92]) { rod(TIMBER, [sx, cy + 1.6, DK + 0.04], [sx, cy - 1.3, DK + 3.3], 0.05, 0.05, 5); rod(TIMBER, [sx, cy - 1.55, DK + 0.04], [sx, cy + 0.6, DK + 1.95], 0.05, 0.05, 5); }
      for (const [y, z] of [[-1.3, 3.3], [1.2, 0.5], [-1.55, 0.06], [0.6, 1.95]]) rod(TIMBER, [cx - 0.98, cy + y, DK + z], [cx + 0.98, cy + y, DK + z], 0.05, 0.05, 5);
      for (let i = 0; i < 5; i++) { const x = cx - 0.68 + i * 0.34; beam(cols[i % 2], [x, cy - 1.3, DK + 3.3], [x, cy - 0.15, DK + 1.2], 0.34, 0.035); beam(cols[i % 2], [x, cy - 0.15, DK + 1.2], [x, cy + 1.2, DK + 0.52], 0.34, 0.035); }
      seatAt(cx, cy - 0.1, 1.25, 0.08, 'sit and watch the sun go'); D.block(cx - 0.95, cx + 0.95, cy - 1.5, cy + 1.6, 0, 1.6);
    };
    const cy = YW - 3.6; chair(28.2, cy, ['c#b8361f/0.8', 'c#e8e2d4/0.8']); chair(31.5, cy, ['c#26364f/0.8', 'c#e8e2d4/0.8']);
    const tx = 29.85, ty = cy + 0.3; D.cyl(IRON, tx, ty, 0.004, 0.06, 0.42, 0.42, 14); D.cyl(IRON, tx, ty, 0.06, 1.6, 0.06, 0.06, 8); D.cyl(TEAK, tx, ty, 1.6, 1.68, 0.56, 0.56, 18); D.block(tx - 0.5, tx + 0.5, ty - 0.5, ty + 0.5, 0, 1.68);
    lanternAt(D, tx - 0.05, ty - 0.1, 1.68, 0.8); kit.jarCandle(D, tx + 0.2, ty + 0.3, 1.68, { r: 0.1, tall: 0.22, lid: false });
  }

  // ======================================================================================================
  // THE WEST RAIL, opposite the bar: a board on the parapet for elbows and glasses, three stools facing the sun
  // ======================================================================================================
  {
    const L0 = 34.0, L1 = 43.0, LZ = 3.24;
    D.box(TEAK, L0, L1, YW - 1.25, YW + 0.12, LZ, LZ + 0.12, G);
    for (let x = L0 + 0.5; x < L1; x += 2.67) { D.box(IRON, x - 0.03, x + 0.03, YW - 1.1, YW - 0.02, LZ - 0.06, LZ - 0.002); rod(IRON, [x, YW - 0.04, DK + 2.2], [x, YW - 1.05, DK + LZ - 0.04], 0.03, 0.03, 4); }
    D.block(L0, L1, YW - 1.25, YW, 2.2, LZ + 0.12);
    for (const x of [L0 + 1.5, L0 + 4.5, L0 + 7.5]) X.stool(K.wrap(kit.fr(x, YW - 2.25, DK, 0)), 0, 0, 2.55, { label: 'sit at the rail, facing west' });
    const z = LZ + 0.12;
    kit.jarCandle(D, L0 + 3.0, YW - 0.55, z, { r: 0.11, tall: 0.24, lid: false, label: 'c#e0782a/0.6' }); kit.jarCandle(D, L0 + 6.0, YW - 0.55, z, { r: 0.11, tall: 0.24, lid: false, label: 'c#24382f/0.6' });
    K.potted(D, L1 - 0.6, YW - 0.6, z, { r: 0.22, n: 14, len: 0.7, pot: 'c#b8755a/0.85' });
    glass(D, L0 + 0.8, YW - 0.6, z, 0.1, 0.3, 'c#e0782a/0.3');                                  // somebody's spritz, left for the view
  }

  // ======================================================================================================
  // THE FIRE: a long cushioned bench against the brick under the star chart, a fire bowl, two poufs;
  // across the deck a teak bench that faces the sun
  // ======================================================================================================
  const FX = 53.25, FY = YE + 6.3;
  {
    const e = K.wrap(kit.fr(FX, YE + 0.04, DK, 0)), EL = 6.25, POSTS = [-6.15, -3.08, 0, 3.08, 6.15];      // x runs north, +y is west
    e.box(TEAK, -EL, EL, 0, 1.8, 1.08, 1.22, G); for (const x of POSTS) e.box(TEAK, x - 0.1, x + 0.1, 0.05, 1.7, 0.004, 1.08, G);
    for (let i = 0; i < 7; i++) e.box(TEAK, -EL, EL, 0.0, 0.07, 1.4 + i * 0.25, 1.58 + i * 0.25, G);
    for (const x of POSTS) e.box(TEAK, x - 0.08, x + 0.08, 0.07, 0.17, 1.22, 3.1, G);
    const cols = ['linen#96492f', 'linen#c9c0ac', 'linen#2a3549', 'linen#b48530'];
    for (let i = 0; i < 4; i++) { const x0 = -6.2 + i * 3.1; e.soft(cols[i], x0, x0 + 3.06, 0.2, 1.84, 1.22, 1.56, 0.1); e.soft(cols[(i + 2) % 4], x0 + 0.05, x0 + 3.01, 0.18, 0.5, 1.56, 2.75, 0.12); }
    kit.cushion(e, -5.0, 0.72, 1.56, 1.25, 1.25, 'linen#b48530', { tilt: 0.35 }); kit.cushion(e, 0.7, 0.72, 1.56, 1.2, 1.2, 'linen#96492f', { tilt: 0.3 }); kit.cushion(e, 5.3, 0.72, 1.56, 1.25, 1.25, 'linen#c9c0ac', { tilt: 0.4 });
    kit.throwBlanket(e, 2.4, 4.0, 0.3, 1.9, 1.56, 'wool#8a3b2c', { drop: { f: 0.9 }, over: 'front' });
    for (const x of [-4.6, -1.5, 1.6, 4.6]) kit.seat(e, x, 1.05, 1.56, 'sit by the fire'); e.block(-EL, EL, 0, 1.85, 0, 1.6);
    // the evening sky from this roof, on the brick over the bench; it shows faintly in the dark, as a star chart should
    const w = K.wrap(kit.fr(FX, WALL, DK, 0));
    w.box(DARKW, -1.95, 1.95, 0.01, 0.07, 4.25, 8.15, G); kit.sign(w, 0, 0.08, 6.2, 3.7, 3.7, CHART, { cw: 620, ch: 620, glow: 0.4 });
    // the blanket basket at the north end of the bench, by the stairhead
    const bx = EL + 1.3, by = 0.95; ves(e, 'wicker#b0895a', bx, by, 0.004, [[0, 0], [0.62, 0], [0.8, 0.5], [0.86, 1.15], [0.9, 1.2], [0.82, 1.2], [0.74, 0.5], [0.56, 0.06], [0, 0.06]], 18);
    kit.foldedStack(e, bx, by, 0.5, 4, ['wool#8a3b2c', 'wool#c9b9a6', 'wool#34405a', 'wool#b48530'], { w: 1.0, d: 0.8, t: 0.22 }); e.block(bx - 0.85, bx + 0.85, by - 0.85, by + 0.85, 0, 1.6);
    kit.sign(w, bx, 0.02, 3.3, 1.5, 0.8, NOTE(['blankets', 'take one. bring it back.', '(we know which one you had.)']), { cw: 220, ch: 116 });
    // the fire bowl on three legs, a pouf either side of it
    ves(D, 'c#3a3632/0.65/1', FX, FY, 0.75, [[0, 0.1], [0.5, 0], [1.1, 0.22], [1.5, 0.62], [1.56, 0.66], [1.42, 0.64], [1.0, 0.3], [0.4, 0.16], [0, 0.16]], 22);
    for (let i = 0; i < 3; i++) { const a = 0.4 + i * 2.094; rod(IRON, [FX + Math.cos(a) * 1.25, FY + Math.sin(a) * 1.25, DK], [FX + Math.cos(a) * 0.55, FY + Math.sin(a) * 0.55, DK + 0.9], 0.05, 0.05, 5); }
    D.block(FX - 1.3, FX + 1.3, FY - 1.3, FY + 1.3, 0, 1.6);
    const pouf = (x, y, col, yaw) => { D.soft(col, x - 0.8, x + 0.8, y - 0.8, y + 0.8, 0.02, 1.3, 0.3); D.block(x - 0.75, x + 0.75, y - 0.75, y + 0.75, 0, 1.5); seatAt(x, y, 1.3, yaw, 'sit by the fire'); };
    pouf(FX - 3.4, FY + 0.7, 'wool#34405a', -1.78); pouf(FX + 3.4, FY + 0.7, 'wool#8a3b2c', 1.78);
    lot.roofFire = { x: FX, y: DK + 1.2, z: -FY };
  }
  {
    const e = K.wrap(kit.fr(FX, YW - 5.3, DK, 0));                     // x runs north, +y is west: the bench has its back to the fire
    e.box(TEAK, -5, 5, 0, 1.75, 1.2, 1.34, G); for (const x of [-4.8, 0, 4.8]) { e.box(TEAK, x - 0.1, x + 0.1, 0.08, 1.65, 0.004, 1.2, G); e.box(TEAK, x - 0.08, x + 0.08, -0.04, 0.1, 1.34, 2.95, G); }
    for (let i = 0; i < 3; i++) e.box(TEAK, -5, 5, -0.1, -0.03, 2.05 + i * 0.32, 2.29 + i * 0.32, G);
    kit.throwBlanket(e, -4.6, -3.0, 0.1, 1.7, 1.34, 'wool#34405a', { drop: { f: 0.9 }, over: 'front' });
    for (const x of [-2.6, 0.4, 3.2]) { const [sx, sz] = kit.world(e, x, 1.0); kit.seats.push({ x: sx, y: DK + 1.34 + 2.45, z: sz, yaw: 0, label: 'sit facing west' }); }
    e.block(-5, 5, -0.1, 1.8, 0, 1.6);
    // the table at its north end: a lantern, a candle, room for a glass
    const tx = 6.5, ty = 0.9; e.cyl(IRON, tx, ty, 0.004, 0.06, 0.5, 0.5, 14); e.cyl(IRON, tx, ty, 0.06, 1.7, 0.06, 0.06, 8); e.cyl(TEAK, tx, ty, 1.7, 1.78, 0.75, 0.75, 20); e.block(tx - 0.65, tx + 0.65, ty - 0.65, ty + 0.65, 0, 1.78);
    lanternAt(e, tx - 0.2, ty + 0.15, 1.78, 0.8); kit.jarCandle(e, tx + 0.3, ty - 0.3, 1.78, { r: 0.1, tall: 0.22, lid: false });
  }
  // grasses along the back rail, sent up from the shop below
  planter(XN - 1.4, XN - 0.2, YT + 1.6, YW - 1.0, 1.5);

  // ======================================================================================================
  // STRING LIGHTS: from the brick and the pergola out to five poles on the west rail
  // ======================================================================================================
  {
    const bulbs = [], RY = lot.y1 - 0.25, PXS = [XS + 0.2, 30.01, 46.23, 57.04, BX - 0.14];      // the poles stand where rail posts do
    const strand = (s, t, sag, n) => { const pts = []; for (let i = 0; i <= n; i++) { const k = i / n; pts.push([s[0] + (t[0] - s[0]) * k, s[1] + (t[1] - s[1]) * k, s[2] + (t[2] - s[2]) * k - sag * 4 * k * (1 - k)]); }
      for (let i = 0; i < n; i++) rod(WIRE, pts[i], pts[i + 1], 0.02, 0.02, 3); for (let i = 1; i < n; i++) bulbs.push(pts[i]); };
    const pole = PXS.map(x => { rod(TIMBER, [x, RY, DK + 3.4], [x, RY, DK + 10.85], 0.075, 0.06, 6); return [x, RY, DK + 10.7]; });
    const wall = x => [x, lot.y0 + 0.04, DK + 12.6], py = YE + 5.6 + 2.1;
    const p1 = [BXC - 7, py, DK + 10.25], p2 = [BXC, py, DK + 12.42], p3 = [BXC + 7, py, DK + 10.25];
    strand(wall(25.0), pole[0], 1.5, 15); strand(p1, pole[0], 1.0, 10); strand(p2, pole[1], 1.2, 11); strand(p2, pole[2], 1.3, 12); strand(p3, pole[2], 0.9, 9);
    strand(wall(47.6), pole[3], 1.6, 16); strand(pole[3], wall(60.5), 1.6, 16); strand(wall(60.5), pole[4], 1.5, 15);
    for (const q of bulbs) B.mesh(BULB, new THREE.SphereGeometry(0.115, 6, 5).translate(q[0], q[2] - 0.14, -q[1]));
    kit.lampAt(D, 28.5, YW - 7, 8.2, 0.65); kit.lampAt(D, 52, YE + 11, 8.4, 0.7);
  }

  // ======================================================================================================
  // HESPER, who keeps the bar
  // ======================================================================================================
  const w2 = (x, y) => kit.world(c, x, y);
  kit.clerks.push({
    id: 'hesper', name: 'Hesper', lot: 'rooftop', floor: DK, reach: 20,
    look: { shape: 'tall', colour: '#2b3350', belly: '#efe4cf', trim: '#c9a45c', apron: '#1d1b18', bowtie: '#c9a45c', antenna: true, eye: '#ffd9a0', ring: 0xffc27a, tool: 'cup', hover: 4.8 },
    home: w2(0.6, -3.2), faces: w2(0.6, 6), posts: [w2(-4.4, -3.2), w2(4.8, -3.2), w2(2.6, -3.2)],
    serve: { machine: w2(3.8, -3.2), pickup: lot.roofPickup,
      drinks: {
        'sunset': { vessel: 'highball', liquid: 0xf0841e, note: 'You finish the sunset. The other one carries on regardless.' },
        'old fashioned': { vessel: 'rocks', liquid: 0xb0601e, note: 'The old fashioned is gone. The orange peel remains, looking pleased with itself.' },
        'spritz': { vessel: 'wine', liquid: 0xf27a22, note: 'Three, two, one, none. That was the spritz.' },
        'glass of red': { vessel: 'wine', liquid: 0x5a0f1c, note: 'The Tenuta Quasi is finished. It was almost too good.' },
        'gin and tonic': { vessel: 'highball', liquid: 0xdcebe6, note: 'You finish the gin and tonic. You are still finding rosemary.' },
        'hot cider': { vessel: 'tumbler', liquid: 0xc8862a, last: 150, note: 'The cider is gone and your hands are warm. That was the point of it.' },
        'vesper': { vessel: 'wine', liquid: 0xe9e6c4, note: 'You finish the Vesper, on Vesper Street, at vespers. Nobody mentions the glass.' },
      },
      food: { 'olives': { build: lot.roofOlive, bites: 3, note: 'Three olives. You keep the stick, as a small sword.' } } },
    lines: {
      greet: ['Evening. Or near enough. Sit where the light is.', 'Forty steps. The first one is on the house. They all are.', '*nods, and slides a coaster an inch toward you*'],
      idle: ['*polishes a glass that was already clean*', '. . .', '*turns one bottle one degree. Considers it. Turns it back*', 'Quiet up here. I ordered it specially.', '*looks west for a while, as a professional courtesy*'],
      bye: ['Mind the stair. It is steeper going down. Nobody knows why.', 'Come back at dusk.'],
      served: ['*says nothing, companionably*', 'Take it to the west rail. The view is included.', 'No hurry. Nothing up here is going anywhere.'],
      topics: [
        { q: 'Something with the sunset in it.', a: 'Tequila, orange juice, and half a measure of grenadine let down the inside of the glass. Do not stir it. You would not stir that, either. *nods west*', serve: 'sunset' },
        { q: 'What are you pouring?', a: 'Four things properly and the rest with enthusiasm. Choose.', next: [
          { q: 'An old fashioned.', a: 'Two of rye, a sugar cube, three dashes of bitters, orange peel. Stirred for exactly as long as it takes.', serve: 'old fashioned' },
          { q: 'A spritz.', a: 'Three, two, one: prosecco, bitter orange, soda. The only countdown I approve of.', serve: 'spritz' },
          { q: 'A glass of red.', a: "The Tenuta Quasi, the '19. The label says \"almost\". It is being modest.", serve: 'glass of red' },
          { q: 'A gin and tonic.', a: 'One of gin to two of tonic. As for the garnish: I was left alone with the herb trough. I apologise in advance.', serve: 'gin and tonic' }] },
        { q: 'It is cold up here.', a: 'Blankets, in the basket by the long bench. And cider: cinnamon, clove, allspice, a strip of orange peel, twenty minutes at a murmur. Hold it in both hands, by the fire.', serve: 'hot cider' },
        { q: 'A Vesper, on Vesper Street?', a: 'Three of gin, one of vodka, half of aperitif wine, a long thin slice of lemon peel. Shaken until it is very cold. I have no proper glass for it, so it comes in a wine glass and we both say nothing.', serve: 'vesper' },
        { q: 'Anything to eat?', a: 'Olives. That is the kitchen. It is a very good kitchen.', serve: 'olives' },
        { q: 'Where should I sit?', a: 'Facing west. There is a ledge on the rail for your glass, and a bench further along. The telescope in the corner is laid on the last of the light; the deck chairs beside it are the best seats in town, and I have never once sat in them.' },
        { q: 'What happens when the sun goes?', a: 'Stars. There is a chart over the long bench, for when it finally gives in. Vega first, straight overhead. Then the rest, in no hurry.', next: [{ q: 'That sounds lonely.', a: '*a long pause, not an unhappy one* It sounds quiet. People confuse the two. Olive?', serve: 'olives' }] },
        { q: 'You do not say much.', a: '*a long, comfortable pause* . . . No.', expr: 'wink' },
      ],
    },
  });

  // ======================================================================================================
  // What moves: the fire, the telescope, the bell
  // ======================================================================================================
  kit.later.push(ctx => {
    const { scene, animated, interact, camera } = ctx;
    {
      const f = lot.roofFire, lamp = { x: f.x, y: f.y + 1.4, z: f.z, power: 0, kind: 'fire' }; ctx.items?.lamps?.push(lamp);
      const hearth = new THREE.Group(); hearth.position.set(f.x, f.y, f.z); hearth.name = 'roof fire'; scene.add(hearth);
      const logMat = new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 1, emissive: 0x401000, emissiveIntensity: 0 });
      for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 1.5, 7), logMat); l.rotation.set(Math.PI / 2 - 0.4, (i / 4) * Math.PI * 2, 0); l.position.set(Math.cos(i * 1.57) * 0.22, 0.2, Math.sin(i * 1.57) * 0.22); hearth.add(l); }
      const uT = { value: 0 }, flames = makeFlames(THREE, mergeGeometries, uT, [0, 1, 2, 3].map(i => [(i / 4) * Math.PI + 0.2, 0, 0, 1.5 - (i % 2) * 0.25, 2.0 - (i % 2) * 0.4, i * 2.9]), 0.15); hearth.add(flames);
      let lit = true;
      interact.push({ x: f.x, y: f.y + 0.6, z: f.z, reach: 7, size: 1.6, label: () => (lit ? 'let the fire die down' : 'light the fire bowl'), act: () => { lit = !lit; } });
      animated.push(t => { lamp.power = lit ? 0.85 : 0; logMat.emissiveIntensity = lit ? 0.5 + 0.2 * Math.sin(t * 7) : 0; flames.visible = lit; uT.value = t; });
    }
    if (lot.roofScope && ctx.zoom) {
      const s = lot.roofScope; let mine = false;
      interact.push({ x: s.x, y: s.y, z: s.z, reach: 7, size: 1.8, label: () => (mine && ctx.zoomed ? 'step back from the telescope' : 'look through the telescope'), act: () => {
        mine = !(mine && ctx.zoomed); ctx.zoom(mine);
        if (mine) { const w = ctx.walker; if (w) { w.yaw = 0.16; w.pitch = 0.02; } ctx.flash?.('the edge of the island, very close. the sun has not moved. it knows you are looking.'); } } });
      animated.push(() => { if (mine && ctx.zoomed && Math.hypot(camera.position.x - s.x, camera.position.z - s.z) > 8) { mine = false; ctx.zoom(false); } });
    }
    if (lot.roofBell) {
      const bl = lot.roofBell; let rung = 0;
      interact.push({ x: bl.xz[0], y: bl.y, z: bl.xz[1], reach: 6, size: 0.6, label: () => 'ring the bell', act: () => {
        ctx.sound?.note?.(84, 0, 1.8, 0.16); ctx.sound?.note?.(91, 0.02, 1.4, 0.06); rung++;
        ctx.flash?.(['The bell rings. Everything goes pleasantly quiet. It was already quiet.', 'Ding. Hesper inclines one degree in your direction.', 'There are no last orders. There is only nearly.'][(rung - 1) % 3]); } });
    }
  });
}
