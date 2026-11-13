// The Gloaming: a bar on the flat metal roof of 315 Mulberry Street (Frond, the plant shop), the last building
// of the row at the sunset end of the street.
//
// Plan coordinates throughout (X = world x, north is +X; Y runs west along the street; world z = -Y).
// The deck is X 24.4 (the street parapet) to 67.5 (the back parapet), Y 161.3 (the brick side of 313, which
// rises a storey above us) to 181 (the low west parapet, and beyond it the Overlook and the sun).
//
// One idea: a seat facing west with a drink in your hand. So: a short bar against the brick with Hesper and
// seven bottles, a bench at the west rail, one string of lights, a lantern or two. One quiet find: the star
// chart on the wall by the stairhead. The way up is a single plain flight along the back of the building,
// from the lawn behind the Overlook: treads between two stringers, climbing east to a landing at the top.
import * as THREE from 'three';
import { tools, fixtures } from '../shopkit.js';
import { G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, board, disc, line, rnd } from '../draw.js';

const IRON = 'c#2b2724/0.45/1', STEEL = 'c#c9ccd0/0.2/1', TEAK = 'oak_light#a3825c', DARKW = 'fir#4a382c', TIMBER = 'c#6a4a2a/0.8', WIRE = 'c#17140f/0.8';
const BULB = 'e#ffd49a/2.4';                                   // the street's string-light glow: dimmed by day

// ---- lettering -----------------------------------------------------------------------------------------
// The slate: five drinks, with their real proportions.
const MENU = (g, w, h) => {
  slate(g, w, h, '#20262a', 12);
  chalk(g, 'The Gloaming', w / 2, h * 0.085, h * 0.095, '#f1efe6');
  line(g, [[w * 0.2, h * 0.15], [w * 0.8, h * 0.15]], '#e9c46a', 2);
  const rows = [
    ['THE SUNSET', '#f08a5a', '1½ oz tequila · 3 oz orange juice · ½ oz grenadine, sunk'],
    ['OLD FASHIONED', '#e9c46a', '2 oz rye · 1 sugar cube · 3 dashes bitters · orange peel'],
    ['SPRITZ', '#f0a45a', '3 prosecco · 2 bitter orange · 1 soda'],
    ['THE VESPER', '#d9e0e8', '3 gin · 1 vodka · ½ aperitif wine · lemon peel'],
    ['RED', '#c98aa0', "Tenuta Quasi '19, by the glass"],
  ];
  rows.forEach(([n, c, r], i) => { const y = h * (0.235 + i * 0.138); chalk(g, n, w * 0.08, y, h * 0.052, c, { a: 'left' }); chalk(g, r, w * 0.08, y + h * 0.052, h * 0.034, '#efe9da', { a: 'left', max: w * 0.86 }); });
  chalk(g, 'olives: yes.', w / 2, h * 0.935, h * 0.042, '#9aa39d');
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
const WAYUP = (g, w, h) => { board(g, w, h, '#24382f', '#d2ae62', { inset: h * 0.07 }); T(g, 'The Gloaming', w / 2, h * 0.4, h * 0.34, '#efe6cf', { f: F.playfair, w: 700, it: 1, max: w * 0.84 }); T(g, 'A BAR ON THE ROOF  ·  UP THE STAIR', w / 2, h * 0.75, h * 0.13, '#e9b44c', { f: F.bebas, ls: 2, max: w * 0.84 }); };
const LABEL = (name, sub, bg, ink = '#2a1c13', accent = '#a8361f') => (g, w, h) => { paper(g, w, h, bg, name.length); g.strokeStyle = ink; g.lineWidth = 1.5; g.strokeRect(3, 3, w - 6, h - 6); const words = name.split(' ');
  words.forEach((s, i) => T(g, s, w / 2, h * (0.3 + (i - (words.length - 1) / 2) * 0.2), h * (words.length > 2 ? 0.17 : 0.2), ink, { f: F.playfair, w: 700, max: w * 0.84 })); line(g, [[w * 0.2, h * 0.66], [w * 0.8, h * 0.66]], accent, 1.5); T(g, sub, w / 2, h * 0.8, h * 0.12, accent, { f: F.bebas, ls: 1, max: w * 0.84 }); };

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
    lanternAt(P, sx, sy, 6.3, 1.3); kit.lampAt(P, sx - 0.6, sy, 6.4, 0.8);
    lanternAt(P, SX1 - 0.02, YE - 0.05, HT + 3.46); kit.lampAt(P, SX1 - 1.2, YE + 1.4, HT + 4.2, 0.7);
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

  // ======================================================================================================
  // THE BAR, against the brick of 313
  // ======================================================================================================
  const BXC = 36, c = K.wrap(kit.fr(BXC, YE + 5.6, DK, 0));            // the counter's customer side; +y is toward the customers (west), +x is north
  const b = K.wrap(kit.fr(BXC, lot.y0 + 0.02, DK, 0));                 // on the brick wall: y = 0 is the wall, +y comes out toward the bar
  const TOP = X.counter(c, -4.5, 4.5, -1.9, 0, 3.5, { front: 'painted_wood#24382f', top: 'oak_light#8a6a48', overhang: 0.3 });
  for (const x of [-2.6, 0, 2.6]) X.stool(c.sub(x, 1.2, 0, 2), 0, 0, 2.55, { label: 'sit at the bar', mat: 'leather#6a3a2a' });
  {
    // on the bar: a shaker, a mixing glass, oranges and a lemon, olives, a candle, a lantern at the end
    const z = TOP;
    ves(c, STEEL, 2.9, -1.25, z, [[0, 0], [0.11, 0], [0.15, 0.5], [0.15, 0.56], [0.12, 0.6], [0.08, 0.78], [0.08, 0.86], [0, 0.87]], 14);
    ves(c, 'glass', 2.35, -1.15, z, [[0, 0], [0.14, 0], [0.16, 0.5], [0.15, 0.5], [0.13, 0.03], [0, 0.03]], 14); tube(c, STEEL, [[2.35, -1.15, z + 0.04], [2.4, -1.1, z + 0.95]], 0.012, 4);
    K.bowl(c, 3.7, -1.2, z, 0.3, 0.16, 'c#e8e2d4/0.3'); fruit(c, 'orange', 3.62, -1.25, z + 0.05); fruit(c, 'lemon', 3.82, -1.11, z + 0.05); fruit(c, 'orange', 3.66, -1.03, z + 0.06);
    K.bowl(c, -1.3, -0.7, z, 0.24, 0.13, 'c#2f5a6a/0.3'); for (let i = 0; i < 12; i++) ball(c, i % 4 ? 'c#5d7a3a/0.3' : 'c#3a2a30/0.3', -1.3 + Math.cos(i * 2.4) * 0.11 * (i % 3) / 2, -0.7 + Math.sin(i * 2.4) * 0.11 * (i % 3) / 2, z + 0.04 + (i % 3 === 0 ? 0.04 : 0), 0.035, 7, 1.2);
    const olive = T3 => { const g = new T3.Group(), m = new T3.MeshStandardMaterial({ color: 0x66803a, roughness: 0.3 }), s = new T3.MeshStandardMaterial({ color: 0xd9cdb2, roughness: 0.8 });
      for (let i = 0; i < 3; i++) { const o = new T3.Mesh(new T3.SphereGeometry(0.035, 10, 8).scale(1, 1.25, 1), m); o.position.set(0, 0.03 + i * 0.07, 0); g.add(o); } const st = new T3.Mesh(new T3.CylinderGeometry(0.004, 0.004, 0.34, 5), s); st.position.y = 0.13; g.add(st); return g; };
    { const [ox, oz] = kit.world(c, -1.3, -0.7); kit.eats?.push({ x: ox, y: DK + z + 0.12, z: oz, name: 'olive or three', build: olive, bites: 3, note: 'Three olives. The stick you keep, as a small sword.' }); }
    lot.roofOlive = olive;
    kit.jarCandle(c, 0.3, -1.3, z, { label: 'c#24382f/0.6', lid: false });
    lanternAt(c, -4.0, -0.95, z, 0.9); kit.candle(c, -3.55, -0.6, z, 0.45);
    lot.roofPickup = { xz: kit.world(c, 1.2, -0.55), y: DK + z };
  }
  {
    // the back bar: a low cabinet against the wall, one shelf of bottles over it, the slate beside them
    b.box('painted_wood#24382f', -4.5, 4.5, 0.02, 1.6, 0, 3.2, G); b.box('oak_light#8a6a48', -4.58, 4.58, 0.02, 1.7, 3.2, 3.3, G); b.block(-4.5, 4.5, 0, 1.6, 0, 3.3);
    const s = b.sub(0, 0, 3.3), zs = [1.5];
    X.shelving(s, -4.3, 1.0, zs, { d: 0.8, mat: DARKW, over: 1.3, back: false, block: false, bay: 6 });
    // seven bottles, by distillers nobody has heard of: what the five drinks need
    const SPIRITS = [['Old Parallax', 'STRAIGHT RYE', '#efe2bc', 'c#8a5a2a/0.2'], ['Foghorn', 'DRY GIN', '#d9e4e0', 'c#c9d6d8/0.2'], ['Ninth Cloud', 'VODKA', '#e4e8ee', 'c#c9ccd0/0.2'], ['Tin Moon', 'TEQUILA BLANCO', '#f0e6c8', 'c#d9cdb2/0.2'],
      ['Orange Regret', 'APERITIVO', '#f3d9b8', 'c#e0782a/0.2'], ['Pale Hour', 'APERITIF WINE', '#f1ecd0', 'c#e8c73a/0.2'], ['Tenuta Quasi', "ROSSO '19", '#efe6d2', 'c#2f4a2a/0.2']];
    SPIRITS.forEach(([n, sub, bg, col], i) => { const x = 0.45 - i * 0.72, r = 0.115 + (i % 3) * 0.008, h = i === 6 ? 1.08 : 0.92 + ((i * 7) % 5) * 0.035; bottle(s, x, 0.42, zs[0], { r, h, col, cap: i % 2 ? 'c#17140f/0.4' : 'c#b08d4a/0.35/1' }); kit.sign(s, x, 0.42 + r + 0.012, zs[0] + h * 0.34, r * 1.35, h * 0.34, LABEL(n, sub, bg), { cw: 72, ch: 110 }); });
    // glasses on the cabinet under them, and a towel
    const WINE = [[0, 0], [0.11, 0], [0.11, 0.01], [0.015, 0.02], [0.012, 0.25], [0.07, 0.3], [0.13, 0.42], [0.105, 0.6], [0.098, 0.6], [0.122, 0.42], [0.065, 0.31], [0.012, 0.27]];
    for (let i = 0; i < 5; i++) ves(s, 'glass', -3.8 + i * 0.36, 0.5, 0, WINE, 12);
    for (let i = 0; i < 6; i++) glass(s, -1.4 + (i % 3) * 0.3, 0.4 + Math.floor(i / 3) * 0.3, 0, 0.12, 0.27);
    for (let i = 0; i < 4; i++) glass(s, 0.1 + (i % 2) * 0.25, 0.4 + Math.floor(i / 2) * 0.27, 0, 0.09, 0.5);
    K.towel(s, 2.2, 3.0, 1.72, -0.15, 0.9, 'c#e8e2d4/0.8', 'c#b8361f/0.8');
    X.slateBoard(b, 2.9, 6.5, 3.0, 3.9, MENU, { cw: 420, ch: 546 });
  }
  // the one quiet find: the evening sky from this roof, on the brick by the stairhead
  {
    const w = K.wrap(kit.fr(55.5, lot.y0 + 0.02, DK, 0));
    w.box(DARKW, -1.95, 1.95, 0.01, 0.07, 3.75, 7.65, G); kit.sign(w, 0, 0.08, 5.7, 3.7, 3.7, CHART, { cw: 620, ch: 620, glow: 0.4 });      // it shows faintly in the dark, as a star chart should
  }

  // ======================================================================================================
  // THE WEST RAIL: a bench that faces the sun, a small table at its end
  // ======================================================================================================
  {
    const e = K.wrap(kit.fr(BXC, YW - 5.3, DK, 0));                    // x runs north, +y is west: the bench has its back to the bar
    e.box(TEAK, -5, 5, 0, 1.75, 1.2, 1.34, G); for (const x of [-4.8, 0, 4.8]) { e.box(TEAK, x - 0.1, x + 0.1, 0.08, 1.65, 0, 1.2, G); e.box(TEAK, x - 0.08, x + 0.08, -0.04, 0.1, 1.34, 2.95, G); }
    for (let i = 0; i < 3; i++) e.box(TEAK, -5, 5, -0.1, -0.03, 2.05 + i * 0.32, 2.29 + i * 0.32, G);
    kit.throwBlanket?.(e, -4.6, -3.0, 0.1, 1.7, 1.34, 'wool#8a3b2c', { drop: { f: 0.9 }, over: 'front' });
    for (const x of [-2.6, 0.4, 3.2]) { const [sx, sz] = kit.world(e, x, 1.0); kit.seats.push({ x: sx, y: DK + 1.34 + 2.45, z: sz, yaw: 0, label: 'sit facing west' }); }
    e.block(-5, 5, -0.1, 1.8, 0, 1.6);
    // the table: a lantern, a candle, room for a glass
    const tx = 6.5, ty = 0.9; e.cyl(IRON, tx, ty, 0, 0.06, 0.5, 0.5, 14); e.cyl(IRON, tx, ty, 0.06, 1.7, 0.06, 0.06, 8); e.cyl(TEAK, tx, ty, 1.7, 1.78, 0.75, 0.75, 20); e.block(tx - 0.65, tx + 0.65, ty - 0.65, ty + 0.65, 0, 1.78);
    lanternAt(e, tx - 0.2, ty + 0.15, 1.78, 0.8); kit.jarCandle(e, tx + 0.3, ty - 0.3, 1.78, { r: 0.1, tall: 0.22, lid: false });
    // one pot of grasses in the corner by the street, sent up from the shop below
    const px = XS + 1.3, py = YW - 1.3; D.cyl('c#b8755a/0.85', px, py, 0, 1.3, 0.62, 0.78, 16); D.cyl('c#3a2214/0.8', px, py, 1.3, 1.31, 0.7, 0.7, 12); D.block(px - 0.75, px + 0.75, py - 0.75, py + 0.75, 0, 1.6);
    for (const [dx, dy] of [[0, 0], [0.3, 0.15], [-0.25, 0.2], [0.05, -0.3]]) leaves(D, px + dx, py + dy, 1.3, { n: 13, len: 2.1, w: 0.028, up: 1.0, out: 0.32, droop: 0.9, spread: 0.16, col: ['c#c9b48a/0.8', 'c#d9cdb2/0.8', 'c#7fa04a/0.8'] });
  }

  // ======================================================================================================
  // ONE STRING OF LIGHTS: from the brick over the bar to a pole at the west rail and back to the brick
  // ======================================================================================================
  {
    const hi = DK + 11, a = [28.5, lot.y0 + 0.04, hi], p = [BXC + 8.6, lot.y1 - 0.25, DK + 10.4], z = [57.5, lot.y0 + 0.04, hi], bulbs = [];
    rod(TIMBER, [p[0], p[1], lot.top], [p[0], p[1], p[2] + 0.15], 0.075, 0.06, 6);
    const strand = (s, t, sag, n) => { const pts = []; for (let i = 0; i <= n; i++) { const k = i / n; pts.push([s[0] + (t[0] - s[0]) * k, s[1] + (t[1] - s[1]) * k, s[2] + (t[2] - s[2]) * k - sag * 4 * k * (1 - k)]); }
      for (let i = 0; i < n; i++) rod(WIRE, pts[i], pts[i + 1], 0.02, 0.02, 3); for (let i = 1; i < n; i++) bulbs.push(pts[i]); };
    strand(a, p, 1.5, 13); strand(p, z, 1.4, 12);
    for (const q of bulbs) B.mesh(BULB, new THREE.SphereGeometry(0.115, 6, 5).translate(q[0], q[2] - 0.14, -q[1]));
    kit.lampAt(D, 35, YE + 7, 8.6, 0.9); kit.lampAt(D, 52, YE + 6, 8.6, 0.8);
  }

  // ======================================================================================================
  // HESPER, who keeps the bar
  // ======================================================================================================
  const w2 = (x, y) => kit.world(c, x, y);
  kit.clerks.push({
    id: 'hesper', name: 'Hesper', lot: 'rooftop', floor: DK, reach: 20,
    look: { shape: 'tall', colour: '#2b3350', belly: '#efe4cf', trim: '#c9a45c', apron: '#1d1b18', bowtie: '#c9a45c', antenna: true, eye: '#ffd9a0', ring: 0xffc27a, tool: 'cup', hover: 4.8 },
    home: w2(0.4, -3.2), faces: w2(0.4, 6), posts: [w2(-3, -3.2), w2(3.2, -3.2)],
    serve: { machine: w2(2.6, -3.2), pickup: lot.roofPickup,
      drinks: {
        'sunset': { vessel: 'highball', liquid: 0xf0841e, note: 'You finish the sunset. The other one carries on regardless.' },
        'old fashioned': { vessel: 'rocks', liquid: 0xb0601e, note: 'The old fashioned is gone. The orange peel remains.' },
        'spritz': { vessel: 'wine', liquid: 0xf27a22, note: 'Three, two, one, none. That was the spritz.' },
        'glass of red': { vessel: 'wine', liquid: 0x5a0f1c, note: 'The Tenuta Quasi is finished. It was almost too good.' },
        'vesper': { vessel: 'wine', liquid: 0xe9e6c4, note: 'You finish the Vesper, on Vesper Street, at vespers.' },
      },
      food: { 'olives': { build: lot.roofOlive, bites: 3, note: 'Three olives. You keep the stick, as a small sword.' } } },
    lines: {
      greet: ['Evening. Or near enough.', 'Sit facing west. That is the whole idea.', '*nods, and slides a coaster an inch toward you*'],
      idle: ['*polishes a glass that was already clean*', '. . .', '*turns one bottle one degree. Turns it back*', '*looks west for a while, as a professional courtesy*', 'Quiet up here. I ordered it specially.'],
      bye: ['Mind the stair. It is steeper going down.', 'Come back at dusk.'],
      served: ['*says nothing, companionably*', 'Take it to the bench. The view is included.', 'No hurry.'],
      topics: [
        { q: 'Something with the sunset in it.', a: 'Tequila, orange juice, half a measure of grenadine let down the inside of the glass. Do not stir it. *nods west* You would not stir that, either.', serve: 'sunset' },
        { q: 'What are you pouring?', a: 'Five things. The slate has them. Choose.', next: [
          { q: 'An old fashioned.', a: 'Two of rye, a sugar cube, three dashes of bitters, orange peel. Stirred as long as it takes.', serve: 'old fashioned' },
          { q: 'A spritz.', a: 'Three, two, one: prosecco, bitter orange, soda.', serve: 'spritz' },
          { q: 'A Vesper, on Vesper Street?', a: 'Three of gin, one of vodka, half of aperitif wine, lemon peel. Shaken until it is very cold.', serve: 'vesper' },
          { q: 'A glass of red.', a: "The Tenuta Quasi, the '19. The label says \"almost\". It is being modest.", serve: 'glass of red' }] },
        { q: 'Anything to eat?', a: 'Olives. That is the kitchen.', serve: 'olives' },
        { q: 'What happens when the sun goes?', a: 'Stars. There is a chart on the wall by the stairhead. Vega first, straight overhead.' },
        { q: 'You do not say much.', a: '*a long, comfortable pause* . . . No.', expr: 'wink' },
      ],
    },
  });
}
