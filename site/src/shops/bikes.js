// Spoke & Sprocket  (307 Mulberry Street, Madison, Indiana: north side; 18.67 ft wide by 42.7 deep inside)
// A front shop and a back workshop, as these buildings had. The door is on the left (lot.doorA); the window to its
// right has the tourer on a stage. Showroom: the parts wall floor to eight feet on the left, four bicycles hung by
// their front wheels on the right, two more on a low stand between them, then the cargo bike under the puncture
// chart, across from the stove and the waiting chair. A partition at d 28.5: a doorway on the left and a wide hatch
// with the counter under it. Behind it the workshop: a patient in the repair stand, wheels on the joist, the bench
// across the back wall, and over the bench the pegboard, with a painted outline for every tool and one outline
// empty (the 10 mm). The back door is where the real one is.
import * as THREE from 'three';
import { tools, fixtures } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, poly, para, glow, ICON } from '../draw.js';
import { sweep, lathe } from '../kit/geom.js';
import { arch } from './arch.js';

const TAU = Math.PI * 2;
const OAK = 'oak_light#a3825c', BENCH = 'oak_light#8e6a4a', MUSTARD = 'painted_wood#d4a02a', BLACKP = 'painted_wood#2a2a26', PLY = 'oak_light#d9c08a', WAIN = 'painted_wood#3b4640';
const STEEL = 'c#c9ccd0/0.3/1', CHROME = 'c#d4d6d8/0.12/1', IRON = 'c#2b2724/0.45/1', RUBBER = 'c#17140f/0.8', BLK = 'c#17140f/0.45', LEATHER = 'c#8a5a2a/0.45', PORC = 'c#ebe6dc/0.18';
const REDP = 'c#c8202a/0.45', YEL = 'c#e8c73a/0.45', BLUE = 'c#2a63b8/0.45', WOODM = 'c#a8784a/0.8', CANVAS = 'c#4a6e38/0.8';
const INK = '#1d1b18', CREAM = '#f3ead2', RED = '#b8452e', MUST = '#d9a82e';

// ---- lettering -------------------------------------------------------------------------------------------
const NOTE = (txt, c = '#f6efd8', ink = '#2a1c13', o = {}) => (g, w, h) => {
  paper(g, w, h, c, o.seed ?? 3); const L = txt.split('\n'), px = o.px ?? Math.min(h * 0.82 / L.length, h * 0.5);
  L.forEach((s, i) => T(g, s, w / 2, h * 0.5 + (i - (L.length - 1) / 2) * px * 1.08, px, i && o.ink2 ? o.ink2 : ink, { f: o.f ?? F.caveat, w: 600, max: w * 0.93 }));
};
const BIKETAG = (name, kind, text, price, c = '#ead9ae') => (g, w, h) => {
  paper(g, w, h, c, 7); disc(g, w / 2, h * 0.055, w * 0.03, '#4a3a2a'); g.strokeStyle = '#8a6a3a'; g.lineWidth = 2; g.strokeRect(5, 5, w - 10, h - 10);
  T(g, name, w / 2, h * 0.185, h * 0.115, INK, { f: F.bebas, ls: 1, max: w * 0.88 });
  T(g, kind, w / 2, h * 0.295, h * 0.068, RED, { f: F.fraunces, it: 1, w: 600, max: w * 0.88 });
  line(g, [[w * 0.1, h * 0.355], [w * 0.9, h * 0.355]], INK, 1.5);
  para(g, text, w * 0.08, h * 0.385, h * 0.078, '#2a1c13', w * 0.84, { f: F.caveat, w: 600, lh: 1.04 });
  T(g, price, w / 2, h * 0.9, h * 0.095, RED, { f: F.caveat, w: 700, max: w * 0.9 });
};
const TAGS = {
  tourer: BIKETAG('THE LONG WAY ROUND', 'steel touring bike', 'Lugged steel, 700×35c tyres, drop bars, mudguards, racks front and back, a lamp. Heavy. It will outlive you.', '640'),
  city: BIKETAG('THE MARKET DAY', 'step-through city bike', 'Three-speed hub, swept bars, basket, bell, full mudguards. You sit up straight and see over hedges.', '380'),
  fixed: BIKETAG('THE ONE GEAR', 'fixed-gear', '46 × 17: seventy-three gear inches. No freewheel. When the wheel turns, your legs turn.', '420'),
  cargo: BIKETAG('THE BIG ASK', 'long-john cargo bike', 'The box sits low, in front, where you can keep an eye on it. Carries 220 lb. Turning circle: yes, eventually.', '1,450'),
};
const TUBE = (size, valve, c) => (g, w, h) => { fill(g, w, h, c); rect(g, 0, 0, w * 0.07, h, INK); T(g, size, w * 0.53, h * 0.4, h * 0.56, INK, { f: F.bebas, max: w * 0.84 }); T(g, 'AIRLOOM INNER TUBE · ' + valve, w * 0.53, h * 0.8, h * 0.19, INK, { f: F.archivo, max: w * 0.84 }); };
const TIN = (g, w, h) => { disc(g, w / 2, h / 2, w / 2, '#c9952a'); disc(g, w / 2, h / 2, w * 0.43, null, INK, 2); T(g, 'OLD BADGER', w / 2, h * 0.36, h * 0.15, INK, { f: F.bebas, ls: 1 }); T(g, 'saddle', w / 2, h * 0.53, h * 0.17, INK, { f: F.yellowtail }); T(g, 'PROOFING', w / 2, h * 0.7, h * 0.12, INK, { f: F.bebas, ls: 2 }); };

// How to fix a puncture: the steps are the real ones.
const STEPS = [
  'Wheel off (open the brake first). Let out whatever air is left in the tube.',
  'Hook two tyre levers under the edge of the tyre, a hand apart, and lever one side off the rim. Pull the tube out.',
  'Pump the tube up fat. Listen and feel for the hiss, or hold it under water and watch for bubbles. Mark the hole.',
  'IMPORTANT. Run your fingers slowly round the inside of the tyre and pull out whatever did it. Skip this, and see step 1.',
  'Sand around the hole, wider than the patch. Spread the glue thin. Now WAIT five minutes, until it goes dull and dry.',
  'Peel the foil off the patch and press it on hard, from the middle outwards. Leave the clear film on top.',
  'A puff of air in the tube. Valve in first, tuck the tube in, then thumb the tyre back on. No levers. Check nothing is pinched.',
  'Pump to the pressure printed on the side of the tyre. Wheel on, brake closed. Ride.',
];
const SKETCH = [
  (g, x, y, s) => { disc(g, x, y, s * 0.36, null, INK, 4); disc(g, x, y, s * 0.05, INK); for (let i = 0; i < 6; i++) line(g, [[x, y], [x + Math.cos(i * 1.05) * s * 0.34, y + Math.sin(i * 1.05) * s * 0.34]], INK, 1); line(g, [[x + s * 0.3, y + s * 0.2], [x + s * 0.5, y + s * 0.42], [x + s * 0.36, y + s * 0.42], [x + s * 0.5, y + s * 0.42], [x + s * 0.5, y + s * 0.28]], RED, 2.5); },
  (g, x, y, s) => { g.beginPath(); g.arc(x, y + s * 0.5, s * 0.75, -2.6, -0.54); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); g.beginPath(); g.arc(x, y + s * 0.5, s * 0.62, -2.6, -0.54); g.strokeStyle = '#9a9590'; g.lineWidth = 3; g.stroke(); for (const k of [-0.22, 0.22]) line(g, [[x + s * k, y - s * 0.22], [x + s * k * 1.5, y + s * 0.34]], '#2a63b8', 5); },
  (g, x, y, s) => { disc(g, x, y + s * 0.08, s * 0.3, null, INK, 7); rect(g, x - s * 0.5, y + s * 0.12, s, s * 0.36, 'rgba(90,150,190,.35)'); for (const [dx, dy, r] of [[0.2, -0.1, 0.035], [0.26, -0.24, 0.045], [0.18, -0.38, 0.03]]) disc(g, x + s * dx, y + s * dy, s * r, null, '#2a63b8', 1.5); line(g, [[x + s * 0.14, y - s * 0.02], [x + s * 0.26, y + s * 0.1]], RED, 2.5); line(g, [[x + s * 0.26, y - s * 0.02], [x + s * 0.14, y + s * 0.1]], RED, 2.5); },
  (g, x, y, s) => { g.beginPath(); g.arc(x, y + s * 0.62, s * 0.8, -2.5, -0.64); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); poly(g, [[x + s * 0.16, y - s * 0.3], [x + s * 0.26, y - s * 0.34], [x + s * 0.2, y - s * 0.02]], RED); ICON.hand(g, x - s * 0.12, y + s * 0.16, s * 0.5, '#8a6a4a'); },
  (g, x, y, s) => { rrect(g, x - s * 0.44, y - s * 0.16, s * 0.5, s * 0.42, 3, null, INK, 2); for (let i = 0; i < 6; i++) line(g, [[x - s * 0.4 + i * s * 0.08, y + s * 0.2], [x - s * 0.32 + i * s * 0.08, y - s * 0.1]], '#9a9590', 1.5); g.save(); g.translate(x + s * 0.28, y); g.rotate(0.5); rrect(g, -s * 0.09, -s * 0.3, s * 0.18, s * 0.5, 3, MUST, INK, 2); rect(g, -s * 0.03, -s * 0.4, s * 0.06, s * 0.1, INK); g.restore(); },
  (g, x, y, s) => { line(g, [[x - s * 0.48, y + s * 0.05], [x + s * 0.48, y + s * 0.05]], INK, 12); rrect(g, x - s * 0.22, y - s * 0.14, s * 0.44, s * 0.38, 7, '#e0782a'); rrect(g, x - s * 0.13, y - s * 0.05, s * 0.26, s * 0.2, 5, INK); for (const k of [-1, 1]) line(g, [[x + k * s * 0.28, y - s * 0.3], [x + k * s * 0.44, y - s * 0.3], [x + k * s * 0.38, y - s * 0.36]], RED, 2); },
  (g, x, y, s) => { g.beginPath(); g.arc(x, y - s * 0.55, s * 0.8, 0.64, 2.5); g.strokeStyle = '#9a9590'; g.lineWidth = 4; g.stroke(); g.beginPath(); g.arc(x, y - s * 0.55, s * 0.92, 0.9, 2.24); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); line(g, [[x, y + s * 0.2], [x, y + s * 0.02]], MUST, 5); line(g, [[x, y + s * 0.02], [x, y - s * 0.06]], INK, 2.5); },
  (g, x, y, s) => { rect(g, x - s * 0.06, y - s * 0.2, s * 0.12, s * 0.58, MUST); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x - s * 0.06, y - s * 0.2, s * 0.12, s * 0.58); line(g, [[x, y - s * 0.2], [x, y - s * 0.4]], INK, 3); line(g, [[x - s * 0.2, y - s * 0.4], [x + s * 0.2, y - s * 0.4]], INK, 5); line(g, [[x - s * 0.22, y + s * 0.38], [x + s * 0.22, y + s * 0.38]], INK, 4); disc(g, x + s * 0.3, y + s * 0.12, s * 0.13, '#f6efd8', INK, 2); line(g, [[x + s * 0.3, y + s * 0.12], [x + s * 0.37, y + s * 0.05]], RED, 2); },
];
const PUNCTURE = (g, w, h) => {
  paper(g, w, h, '#f1e6c8', 11); rect(g, 10, 10, w - 20, h * 0.082, MUST); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20);
  T(g, 'HOW TO FIX A PUNCTURE', w / 2, h * 0.056, h * 0.054, INK, { f: F.bebas, ls: 3 });
  STEPS.forEach((txt, i) => { const y0 = h * 0.118 + i * h * 0.106, cy = y0 + h * 0.05;
    if (i) line(g, [[w * 0.05, y0 - h * 0.004], [w * 0.95, y0 - h * 0.004]], 'rgba(29,27,24,.25)', 1);
    disc(g, w * 0.065, cy, h * 0.021, i === 3 ? RED : INK); T(g, String(i + 1), w * 0.065, cy + 1, h * 0.03, CREAM, { f: F.bebas });
    SKETCH[i](g, w * 0.185, cy, h * 0.082);
    para(g, txt, w * 0.275, y0 + h * 0.01, h * 0.0265, '#2a1c13', w * 0.68, { f: F.caveat, w: 600, lh: 1.06 }); });
};

// Three repair tickets on the cork board
const TICKETS = [
  ['114', 'JUNIPER', 'squeak', 'on the stand. found one squeak. checking it was the only one'],
  ['116', 'OTIS', 'fixed gear. clean the chain. say nothing', 'cleaned. said nothing'],
  ['118', 'MOSS', 'fern growing out of the seat tube', 'customer says leave it. left it'],
];
const CORK = (g, w, h) => {
  fill(g, w, h, '#b98d5a'); grain(g, w, h, 0.12, 8);
  rrect(g, w * 0.36, h * 0.035, w * 0.28, h * 0.12, 4, '#f6efd8'); T(g, 'REPAIRS', w / 2, h * 0.098, h * 0.085, INK, { f: F.bebas, ls: 3 });
  TICKETS.forEach(([no, who, job, st], i) => { const tw = w * 0.285, th = h * 0.68, x = w * (0.18 + i * 0.32), y = h * 0.58;
    g.save(); g.translate(x, y); g.rotate((i - 1) * 0.022 + 0.008);
    rrect(g, -tw / 2 + 3, -th / 2 + 4, tw, th, 3, 'rgba(0,0,0,.18)'); rrect(g, -tw / 2, -th / 2, tw, th, 3, i === 1 ? '#f3dcd2' : i === 2 ? '#e6ecd8' : '#f6efd8'); disc(g, 0, -th / 2 + 12, 6, '#c8402f');
    T(g, 'No. ' + no, -tw / 2 + 12, -th / 2 + 38, 18, '#5a5a56', { f: F.elite, a: 'left' });
    T(g, who, 0, -th / 2 + 78, 42, INK, { f: F.bebas, ls: 2 });
    const yy = para(g, job, -tw / 2 + 14, -th / 2 + 110, 30, '#2a1c13', tw - 28, { f: F.caveat, w: 600, lh: 1.05 });
    line(g, [[-tw / 2 + 14, yy + 8], [tw / 2 - 14, yy + 8]], '#9a9590', 1);
    para(g, st, -tw / 2 + 14, yy + 20, 28, RED, tw - 28, { f: F.caveat, w: 700, lh: 1.05 });
    g.restore(); });
};
const RATES = (g, w, h) => {
  board(g, w, h, INK, MUST, { inset: h * 0.04, lw: 3 }); T(g, 'WORKSHOP RATES', w / 2, h * 0.16, h * 0.14, MUST, { f: F.bebas, ls: 3 });
  [['puncture', '8'], ['true a wheel', '15'], ['the full service', '60'], ['…if you watch', '70'], ['…if you help', '90']].forEach(([a, p], i) => { const y = h * (0.36 + i * 0.125); T(g, a, w * 0.1, y, h * 0.1, CREAM, { f: F.caveat, w: 600, a: 'left' }); T(g, p, w * 0.9, y, h * 0.1, i > 2 ? '#e8a8a0' : CREAM, { f: F.caveat, w: 600, a: 'right' }); });
};
const BACK5 = (g, w, h) => {
  paper(g, w, h, '#f6efd8', 5); disc(g, w / 2, h * 0.07, 5, '#c8402f');
  T(g, 'BACK IN', w / 2, h * 0.3, h * 0.22, INK, { f: F.bebas, ls: 3 }); T(g, '5 MINUTES', w / 2, h * 0.55, h * 0.26, INK, { f: F.bebas, ls: 3 });
  T(g, '(I was.)', w * 0.64, h * 0.84, h * 0.17, RED, { f: F.caveat, w: 700, rot: -0.09 });
};

// ---- the pegboard: every tool has its painted outline; one outline has no tool ------------------------------
const spn = L => [['b', -0.03, 0.03, -L / 2, L / 2], ['c', 0, L / 2, 0.08], ['c', 0, -L / 2, 0.07]];
const drv = col => [['b', -0.055, 0.055, 0.05, 0.42, col], ['b', -0.016, 0.016, -0.42, 0.05]];
const hex = L => [['b', -0.014, 0.014, -L / 2, L / 2], ['b', -0.014, 0.13, L / 2 - 0.028, L / 2]];
const PEGT = [
  ...[1.35, 1.22, 1.1, 0.98, 0.86, 0.74].map((L, i) => ({ x: -4.0 + i * 0.3, z: 1.9 - L / 2, p: spn(L) })),
  { x: -2.05, z: 1.2, p: [['b', -0.035, 0.035, -0.3, 0.55], ['c', 0, 0.62, 0.12], ['b', -0.05, 0.05, -0.7, -0.3, BLK]] },                       // pedal wrench
  { x: -1.6, z: 1.25, p: [['b', -0.04, 0.04, -0.25, 0.55], ['b', 0.04, 0.34, 0.36, 0.42, BLK], ['b', -0.05, 0.05, -0.65, -0.25, BLK]] },       // chain whip
  { x: -1.15, z: 1.5, p: [['b', -0.05, 0.05, -0.36, 0.3], ['c', 0, 0.34, 0.085]] }, { x: -0.85, z: 1.5, p: [['b', -0.05, 0.05, -0.36, 0.3], ['c', 0, 0.34, 0.075]] },   // cone spanners
  { x: -0.2, z: 1.3, p: [['b', -0.04, 0.04, -0.6, 0.3, WOODM], ['b', -0.24, 0.24, 0.3, 0.48]] },                                                 // hammer
  { x: 0.55, z: 1.3, p: [['b', -0.04, 0.04, -0.6, 0.25, WOODM], ['b', -0.22, 0.22, 0.25, 0.55, BLK]] },                                         // mallet
  ...[REDP, YEL, BLUE].map((col, i) => ({ x: 1.25 + i * 0.27, z: 1.45, p: drv(col) })),
  ...[0.7, 0.6, 0.5, 0.4].map((L, i) => ({ x: 2.2 + i * 0.24, z: 1.9 - L / 2, p: hex(L) })),
  { x: 3.6, z: 1.45, p: [['b', -0.6, 0.6, 0.2, 0.25], ['b', -0.6, -0.56, -0.12, 0.2], ['b', 0.56, 0.6, -0.12, 0.2], ['b', -0.56, 0.56, -0.12, -0.1], ['b', 0.6, 0.74, -0.2, 0.25, REDP]] },   // hacksaw
  { x: -3.95, z: -0.9, p: [['b', -0.1, -0.045, -0.42, 0.05, REDP], ['b', 0.045, 0.1, -0.42, 0.05, REDP], ['b', -0.06, 0.06, 0.05, 0.32]] },      // pliers
  { x: -3.5, z: -0.9, p: [['b', -0.1, -0.045, -0.42, 0.05, BLUE], ['b', 0.045, 0.1, -0.42, 0.05, BLUE], ['b', -0.08, 0.08, 0.05, 0.22]] },       // cable cutters
  ...[0, 1, 2].map(i => ({ x: -2.95 + i * 0.2, z: -0.95, p: [['b', -0.04, 0.04, -0.22, 0.22, BLUE]] })),                                          // tyre levers
  { x: -2.05, z: -0.85, p: [['c', 0, 0, 0.09, REDP]] }, { x: -1.75, z: -0.85, p: [['c', 0, 0, 0.09, BLK]] },                                     // spoke keys
  { x: -1.15, z: -0.85, p: [['b', -0.03, 0.03, -0.38, 0.1], ['b', -0.27, 0.27, 0.1, 0.16]] },                                                   // three-way
  { x: -0.45, z: -0.85, p: [['b', -0.14, 0.14, -0.14, 0.14, YEL]] },                                                                             // tape measure
  { x: 3.3, z: -0.85, p: [['b', -0.035, 0.035, -0.1, 0.5], ['b', -0.05, 0.05, -0.42, -0.1, WOODM]] }, { x: 3.75, z: -0.85, p: [['b', -0.04, 0.04, -0.42, 0, WOODM], ['b', -0.07, 0.07, 0, 0.4, BLK]] },   // file, wire brush
];
const SOCK = [8, 9, 10, 11, 12, 13, 14], sockX = i => 0.45 + i * 0.37, sockR = i => 0.07 + i * 0.008;
const PLAB = [[-3.25, 0.42, 'SPANNERS  8 – 17'], [-2.05, 0.36, 'PEDAL'], [-1.55, 0.46, 'WHIP'], [-1.0, 0.98, 'CONES'], [-0.2, 0.54, 'HAMMER'], [0.55, 0.38, 'MALLET'], [1.52, 0.86, 'DRIVERS'], [2.6, 1.02, 'HEX'], [3.62, 1.02, 'SAW'], [-3.72, -1.5, 'PLIERS · CUTTERS'], [-2.75, -1.36, 'LEVERS'], [-1.9, -1.14, 'SPOKE KEYS'], [-1.15, -1.42, 'THREE-WAY'], [-0.45, -1.2, 'TAPE'], [3.52, -1.5, 'FILE · BRUSH'], [0.0, -0.4, 'SOCKETS']];
const PEG = (g, w, h) => {
  fill(g, w, h, '#b58a52'); grain(g, w, h, 0.06, 4);
  const s = w / 8.8, X = v => w / 2 + v * s, Y = v => h / 2 - v * s, PAINT = '#f6efd8', GHOST = '#96703f';
  g.fillStyle = 'rgba(40,26,12,.5)'; for (let i = 0; i < 35; i++) for (let j = 0; j < 17; j++) { g.beginPath(); g.arc(X(-4.25 + i * 0.25), Y(-2.0 + j * 0.25), 1.6, 0, 7); g.fill(); }
  const shape = (t, pad, col) => { for (const [k, a, b2, c2, d] of t.p) { if (k === 'b') rrect(g, X(t.x + a - pad), Y(t.z + d + pad), (b2 - a + 2 * pad) * s, (d - c2 + 2 * pad) * s, pad * s, col); else disc(g, X(t.x + a), Y(t.z + b2), (c2 + pad) * s, col); } };
  for (const t of PEGT) { shape(t, 0.05, PAINT); shape(t, 0.02, GHOST); }
  const rail = { x: 0, z: -0.75, p: [['b', 0.25, 2.87, -0.03, 0.03]] }; shape(rail, 0.05, PAINT); shape(rail, 0.02, GHOST);
  SOCK.forEach((n, i) => { disc(g, X(sockX(i)), Y(-0.75), (sockR(i) + 0.05) * s, PAINT); disc(g, X(sockX(i)), Y(-0.75), (sockR(i) + 0.02) * s, GHOST); T(g, String(n), X(sockX(i)), Y(-1.04), 16, n === 10 ? '#ffd9c8' : PAINT, { f: F.bebas }); });
  for (const [x, z, t] of PLAB) T(g, t, X(x), Y(z), 14, PAINT, { f: F.bebas, ls: 1 });
  line(g, [[X(1.19), Y(-1.38)], [X(1.19), Y(-1.17)]], RED, 2.5); poly(g, [[X(1.19), Y(-1.13)], [X(1.13), Y(-1.22)], [X(1.25), Y(-1.22)]], RED);
  g.save(); g.translate(X(1.5), Y(-1.68)); g.rotate(-0.035); rrect(g, -118, -29, 236, 58, 3, '#f6efd8'); disc(g, -106, -18, 4, '#c8402f'); T(g, '10 mm: STILL MISSING', 0, -11, 21, RED, { f: F.caveat, w: 700 }); T(g, 'reward: one bell, and my respect.  P.', 0, 13, 16, '#2a1c13', { f: F.caveat, w: 600 }); g.restore();
};

export default function bikes(kit, lot) {
  const K = tools(kit, 67), X = fixtures(kit, K), { ves, hcyl, ball, tube, potted, jar, bottle, bowl, towel } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0), W = lot.W, D = lot.D;
  const bev = (...a) => kit.geom.bev(...a);
  const uses = [];                                             // things to do with E, wired up once the scene exists

  // ---- how a bicycle is built here ---------------------------------------------------------------------------
  // A placer puts geometry made in a thing's own space (u forward, v to its left, w up) into a frame.
  const placer = (f, x, y, z, yaw = 0, lean = 0, pitch = 0) => {
    const M = new THREE.Matrix4().makeRotationZ(yaw).multiply(new THREE.Matrix4().makeRotationX(lean)).multiply(new THREE.Matrix4().makeRotationY(pitch)); M.setPosition(x, y, z);
    const add = (mat, g) => { g.applyMatrix4(M); K.put(f, g, mat); };
    const tb = (mat, path, r = 0.045, seg = 6) => add(mat, sweep(path.map(p => (p.length === 2 ? [p[0], 0, p[1]] : p)), r, { seg }));
    const pt = (u, v, w) => { const p = new THREE.Vector3(u, v, w).applyMatrix4(M); return [p.x, p.y, p.z]; };
    return { add, tb, pt };
  };
  const qb = (p0, p1, p2, n = 7) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, a = (1 - t) ** 2, b = 2 * t * (1 - t), c = t * t; return p0.map((_, k) => a * p0[k] + b * p1[k] + c * p2[k]); });
  const arc = (c, r, a0, a1, n = 9) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [c[0] + Math.cos(a) * r, 0, c[1] + Math.sin(a) * r]; });
  const torus = (R0, r, rs = 5, ts = 20) => new THREE.TorusGeometry(R0, r, rs, ts).rotateX(Math.PI / 2);
  // A wheel standing on w = 0 at u: tyre, rim, hub and a few spokes.
  const wheelOn = (P, u, Rw, o = {}) => {
    const tw = o.tw ?? 0.06, rr = Rw - tw * 2 - 0.015, n = o.spokes ?? 10;
    if (o.tyre !== false) P.add(o.tyre ?? RUBBER, torus(Rw - tw, tw).translate(u, 0, Rw));
    P.add(o.rim ?? STEEL, torus(rr, 0.03, 4).translate(u, 0, Rw));
    P.add(STEEL, new THREE.CylinderGeometry(0.045, 0.045, 0.3, 6).translate(u, 0, Rw));
    for (let i = 0; i < n; i++) { const a = i / n * TAU + (o.ph ?? 0.3), s = i % 2 ? 1 : -1; P.add(STEEL, sweep([[u, s * 0.11, Rw], [u + Math.cos(a) * rr, 0, Rw + Math.sin(a) * rr]], 0.007, { seg: 3 })); }
  };
  const wheelAt = (f, x, y, z, Rw, yaw = 0, lean = 0, o = {}) => wheelOn(placer(f, x, y, z, yaw, lean), 0, Rw, o);
  const ring = (f, mat, x, y, z, R0, r, flat = false) => { const g = flat ? new THREE.TorusGeometry(R0, r, 5, 20) : torus(R0, r); g.translate(x, y, z); K.put(f, g, mat); };
  const SADDLE = Array.from({ length: 8 }, (_, i) => [Math.cos(i / 8 * TAU) * 0.28, Math.sin(i / 8 * TAU)]);
  const saddleOn = (P, u, w, mat, s = 1) => P.add(mat, sweep([[u - 0.42 * s, 0, w - 0.01], [u - 0.1 * s, 0, w], [u + 0.45 * s, 0, w + 0.01]], t => (t < 0.35 ? 0.23 : 0.23 - (t - 0.35) / 0.65 * 0.16) * s, { seg: 8, caps: true, shape: SADDLE }));
  // frame: 'diamond' | 'step' (step-through) | 'fold' | 'beam' (a balance bike) | 'cargo' (a long-john)
  const bike = (f, x, y, z, yaw, o = {}) => {
    const P = placer(f, x, y, z, yaw, o.lean ?? 0, o.pitch ?? 0), { add, tb } = P;
    const C = o.colour ?? 'c#b8361f/0.45', tr = o.tube ?? 0.05, kind = o.frame ?? 'diamond';
    const Rw = o.R ?? 1.12, Rf = o.Rf ?? Rw, wb = o.wb ?? 3.45, rear = [-wb / 2, Rw], front = [wb / 2, Rf], sa = [-0.292, 0.956], ha = [-0.309, 0.951];
    const bb = [rear[0] + (o.cs ?? Rw + 0.32), o.bbH ?? 0.9], stL = o.stL ?? 2.0, st = kind === 'beam' ? [rear[0] + Rw + 0.1, (o.sH ?? 1.45) - 0.22] : [bb[0] + sa[0] * stL, bb[1] + sa[1] * stL];
    const sH = o.sH ?? 3.3, sk = (sH - 0.1 - bb[1]) / sa[1], sp = kind === 'beam' ? [st[0], sH - 0.1] : [bb[0] + sa[0] * sk, sH - 0.1];
    const fl = Rf + 0.22, crown = [front[0] - 0.14 + ha[0] * fl, Rf + ha[1] * fl];
    const hb = kind === 'cargo' ? [bb[0] + 1.75, 1.55] : [crown[0] + ha[0] * 0.08, crown[1] + ha[1] * 0.08];
    const barH = o.barH ?? 3.35, htW = o.headTop ?? (kind === 'fold' || kind === 'beam' ? barH - 0.1 : Math.max(hb[1] + 0.35, st[1] + 0.06)), hk = (htW - hb[1]) / ha[1], ht = [hb[0] + ha[0] * hk, htW];
    wheelOn(P, rear[0], Rw, { tyre: o.tyre, tw: o.tw, spokes: o.spokes, rim: o.rim });
    if (!o.noFront) wheelOn(P, front[0], Rf, { tyre: o.tyre, tw: o.tw, spokes: o.spokes, rim: o.rim, ph: 0.9 });
    // the frame
    if (kind === 'beam') {
      for (const s of [-1, 1]) tb(C, [[rear[0], s * 0.13, Rw], [st[0], s * 0.06, st[1]]], tr);
      tb(C, [st, [ht[0], ht[1] - 0.12]], tr * 1.3); tb(C, [[st[0] - 0.02, st[1]], sp], tr * 0.9);
    } else {
      tb(C, [bb, st], tr);
      for (const s of [-1, 1]) { tb(C, [[bb[0], s * 0.06, bb[1]], [rear[0], s * 0.17, Rw]], tr * 0.72); tb(C, [[st[0] - sa[0] * 0.1, s * 0.05, st[1] - 0.1], [rear[0], s * 0.17, Rw]], tr * 0.62); }
      if (kind === 'diamond' || kind === 'cargo') tb(C, [[st[0] - sa[0] * 0.08, st[1] - 0.08], [ht[0] - ha[0] * 0.08, ht[1] - 0.08]], tr);
      if (kind !== 'fold') tb(C, [[hb[0] + ha[0] * 0.06, hb[1] + 0.06], bb], tr * 1.08);
      if (kind === 'step') tb(C, qb([ht[0] - ha[0] * 0.1, 0, ht[1] - 0.1], [(ht[0] + bb[0]) / 2 - 0.15, 0, bb[1] + 0.8], [bb[0] + sa[0] * 0.85, 0, bb[1] + sa[1] * 0.85]), tr);
      if (kind === 'fold') { const a = [hb[0] + ha[0] * 0.2, hb[1] + 0.19], e = [bb[0] + sa[0] * 0.45, bb[1] + sa[1] * 0.45]; tb(C, [a, e], tr * 1.6, 8); add(STEEL, new THREE.BoxGeometry(0.14, 0.2, 0.24).translate((a[0] + e[0]) / 2, 0, (a[1] + e[1]) / 2)); }
      if (kind === 'cargo') {
        const u0 = hb[0] + 0.5, u1 = front[0] - Rf - 0.2, wd = 0.85, z0 = 0.68, z1 = 1.95, WD = o.boxCol ?? 'oak_light#b89466';
        tb(C, [hb, [hb[0] + 0.5, 0.62], [u1 + 0.1, 0.62], [crown[0] + ha[0] * 0.3, crown[1] + ha[1] * 0.3]], tr * 1.3, 7); tb(C, [crown, [crown[0] + ha[0] * 0.34, crown[1] + ha[1] * 0.34]], tr * 1.2);
        for (const [a, b, c, d, e, h2] of [[u0, u1, -wd, wd, z0, z0 + 0.06], [u0, u1, -wd, -wd + 0.06, z0 + 0.06, z1], [u0, u1, wd - 0.06, wd, z0 + 0.06, z1], [u0, u0 + 0.06, -wd + 0.06, wd - 0.06, z0 + 0.06, z1], [u1 - 0.06, u1, -wd + 0.06, wd - 0.06, z0 + 0.06, z1 - 0.3]]) add(WD, bev(a, b, c, d, e, h2, 0.012));
        tb(IRON, [[hb[0], -0.22, 0.8], [crown[0], -0.22, crown[1] - 0.25]], 0.02, 4);                  // the steering rod
      }
    }
    tb(C, [hb, ht], tr * 1.15);
    for (const s of [-1, 1]) tb(o.forkCol ?? C, qb([crown[0], s * 0.1, crown[1]], [front[0] - 0.14 + ha[0] * fl * 0.3, s * 0.18, Rf + ha[1] * fl * 0.3], [front[0], s * 0.17, Rf], 4), tr * 0.75);
    add(o.forkCol ?? C, new THREE.CylinderGeometry(tr, tr, 0.3, 6).translate(crown[0], 0, crown[1]));
    // saddle, stem and bars
    if (kind !== 'beam') tb(STEEL, [st, sp], 0.035);
    saddleOn(P, sp[0], sH - 0.04, o.saddle ?? LEATHER, o.ss ?? 1);
    const top = [ht[0] + ha[0] * ((barH - ht[1]) / ha[1]), barH], bu = top[0] + (o.reach ?? 0.3), bars = o.bars ?? 'flat', tape = o.tape ?? 'c#2b2724/0.8';
    tb(o.stemCol ?? STEEL, [ht, top, [bu, barH]], 0.04);
    if (bars === 'drop') { tb(STEEL, [[bu, -0.3, barH], [bu, 0.3, barH]], 0.04); for (const s of [-1, 1]) { tb(tape, [[bu, s * 0.28, barH], [bu, s * 0.6, barH], [bu + 0.14, s * 0.66, barH], [bu + 0.38, s * 0.66, barH - 0.04], [bu + 0.46, s * 0.66, barH - 0.22], [bu + 0.34, s * 0.66, barH - 0.42], [bu + 0.02, s * 0.66, barH - 0.45]], 0.046); tb('c#3a2214/0.45', [[bu + 0.36, s * 0.66, barH - 0.02], [bu + 0.52, s * 0.66, barH + 0.15]], 0.05, 5); } }
    else if (bars === 'swept') { for (const s of [-1, 1]) { tb(STEEL, [[bu, 0, barH], [bu + 0.07, s * 0.42, barH + 0.02], [bu - 0.12, s * 0.82, barH + 0.1], [bu - 0.35, s * 0.9, barH + 0.12]], 0.038); tb(tape, [[bu - 0.3, s * 0.9, barH + 0.12], [bu - 0.68, s * 0.9, barH + 0.12]], 0.055); } }
    else if (bars === 'bull') { for (const s of [-1, 1]) tb(tape, [[bu, 0, barH], [bu, s * 0.56, barH], [bu + 0.14, s * 0.66, barH + 0.02], [bu + 0.5, s * 0.66, barH + 0.13]], 0.044); }
    else { const hw = o.barW ?? 0.95; tb(STEEL, [[bu, -hw, barH], [bu, hw, barH]], 0.038); for (const s of [-1, 1]) tb(tape, [[bu, s * (hw - 0.36), barH], [bu, s * hw, barH]], 0.055); }
    if (o.bell) add(BRASS, new THREE.SphereGeometry(0.075, 8, 6).translate(bu, 0.3, barH + 0.07));
    // cranks, chainring, chain
    if (kind !== 'beam') {
      const cr = o.ring ?? 0.32, rc = o.cog ?? 0.13, dv = -0.17, ca = o.crankA ?? -0.6;
      add(C, new THREE.CylinderGeometry(0.075, 0.075, 0.36, 8).translate(bb[0], 0, bb[1]));
      add(STEEL, new THREE.CylinderGeometry(cr, cr, 0.025, 16).translate(bb[0], dv, bb[1])); add(STEEL, new THREE.CylinderGeometry(rc, rc, 0.03, 10).translate(rear[0], dv, Rw));
      for (const s of [-1, 1]) { const e = [bb[0] + Math.cos(ca) * 0.56 * s, bb[1] + Math.sin(ca) * 0.56 * s], v = s > 0 ? -0.25 : 0.25; tb(STEEL, [[bb[0], v, bb[1]], [e[0], v, e[1]]], 0.03, 5); add(IRON, new THREE.BoxGeometry(0.3, 0.3, 0.06).translate(e[0], v + Math.sign(v) * 0.2, e[1])); }
      if (o.chain === 'hang') { tb(IRON, qb([bb[0] + cr * 0.7, dv, bb[1] + cr * 0.7], [bb[0] + cr * 1.3, dv, bb[1] - 0.2], [bb[0] + 0.1, dv, bb[1] - 1.5], 6), 0.016, 4); tb(IRON, qb([bb[0] - cr, dv, bb[1]], [bb[0] - 0.5, dv, bb[1] - 1.5], [bb[0] + 0.02, dv, bb[1] - 1.5], 6), 0.016, 4); }
      else if (o.chain !== false) {
        tb(IRON, [[bb[0], dv, bb[1] + cr], [rear[0], dv, Rw + rc]], 0.014, 4);
        if (o.gears) { tb(IRON, [[rear[0], dv - 0.03, Rw], [rear[0] + 0.12, dv - 0.03, Rw - 0.46]], 0.022, 4); add(IRON, new THREE.CylinderGeometry(0.055, 0.055, 0.03, 8).translate(rear[0] + 0.12, dv, Rw - 0.46)); tb(IRON, [[bb[0], dv, bb[1] - cr], [rear[0] + 0.12, dv, Rw - 0.51]], 0.014, 4); tb(IRON, [[rear[0] + 0.14, dv, Rw - 0.4], [rear[0], dv, Rw - rc]], 0.014, 4); }
        else tb(IRON, [[bb[0], dv, bb[1] - cr], [rear[0], dv, Rw - rc]], 0.014, 4);
      }
    }
    if (o.guards) { const gs = [[0.13, -1], [0.13, 1], [-0.13, 1], [-0.13, -1]]; add(o.guards, sweep(arc(rear, Rw + 0.07, 5, 200), 0.1, { shape: gs })); if (!o.noFront) add(o.guards, sweep(arc(front, Rf + 0.07, 20, 195), 0.1, { shape: gs })); }
    if (o.rack) { const z0 = 2 * Rw + 0.14; add(IRON, new THREE.BoxGeometry(1.25, 0.42, 0.04).translate(rear[0] - 0.1, 0, z0)); for (const s of [-1, 1]) { tb(IRON, [[rear[0], s * 0.2, Rw], [rear[0] - 0.55, s * 0.2, z0]], 0.02, 4); tb(IRON, [[rear[0], s * 0.2, Rw], [rear[0] + 0.3, s * 0.2, z0]], 0.02, 4); }
      tb(IRON, [[rear[0] + 0.5, 0, z0], [st[0] + 0.04, 0, st[1] - 0.3]], 0.02, 4);
      if (o.panniers) for (const s of [-1, 1]) { add(o.panniers, bev(rear[0] - 0.62, rear[0] + 0.42, s > 0 ? 0.24 : -0.62, s > 0 ? 0.62 : -0.24, z0 - 1.18, z0 - 0.03, 0.05)); for (const du of [-0.35, 0.15]) add(WOODM, bev(rear[0] + du - 0.035, rear[0] + du + 0.035, s > 0 ? 0.62 : -0.635, s > 0 ? 0.635 : -0.62, z0 - 0.75, z0 - 0.03, 0.004)); } }
    if (o.frontRack) { const z0 = 2 * Rf + 0.14, u0 = front[0] + 0.1; add(IRON, new THREE.BoxGeometry(0.8, 0.5, 0.035).translate(u0, 0, z0)); for (const s of [-1, 1]) { tb(IRON, [[front[0], s * 0.2, Rf], [u0 + 0.3, s * 0.22, z0]], 0.018, 4); tb(IRON, [[u0 - 0.36, s * 0.2, z0], [crown[0], s * 0.1, crown[1]]], 0.018, 4); }
      if (o.bag) { add(o.bag, bev(u0 - 0.36, u0 + 0.36, -0.42, 0.42, z0 + 0.02, z0 + 0.6, 0.05)); add(WOODM, bev(u0 - 0.37, u0 + 0.37, -0.05, 0.05, z0 + 0.3, z0 + 0.615, 0.004)); } }
    if (o.basket) { const c = [bu + 0.66, barH - 0.5]; add('wicker', lathe([[0, 0], [0.42, 0], [0.56, 0.7], [0.52, 0.7], [0.39, 0.05], [0, 0.05]], { seg: 12 }).translate(c[0], 0, c[1])); tb(IRON, [[bu, 0, barH], [c[0] - 0.5, 0, c[1] + 0.55]], 0.02, 4); }
    if (o.lamp) { add(STEEL, new THREE.CylinderGeometry(0.09, 0.06, 0.16, 10).rotateZ(-Math.PI / 2).translate(crown[0] + 0.24, 0, crown[1] + 0.12)); add('e#fff4e0/3', new THREE.CylinderGeometry(0.075, 0.075, 0.02, 10).rotateZ(-Math.PI / 2).translate(crown[0] + 0.33, 0, crown[1] + 0.12)); }
    if (o.kick) tb(IRON, [[bb[0] - 0.3, 0.1, bb[1] - 0.08], [bb[0] - 0.5, 0.62, 0.07]], 0.025, 4);
    if (o.stand) { add(o.stand, bev(rear[0] - 0.75, rear[0] + 0.75, -0.55, 0.55, 0, 0.07, 0.01)); for (const s of [-1, 1]) add(o.stand, bev(rear[0] - 0.5, rear[0] + 0.5, s > 0 ? 0.09 : -0.17, s > 0 ? 0.17 : -0.09, 0.07, Math.min(0.62, Rw * 0.8), 0.01)); }
    return { ...P, sp, st, ht, bb, rear, front, bu, barH };
  };
  // A tag on a stand, facing the frame's front: bottom of the card at z.
  const tagPost = (f, x, y, draw, o = {}) => {
    const w = o.w ?? 1.3, t = o.t ?? 1.3, z = o.z ?? 2.6;
    f.cyl(IRON, x, y, 0, 0.05, 0.32, 0.36, 12); f.cyl(IRON, x, y, 0.05, z + t - 0.1, 0.025, 0.025, 6);
    f.box('c#2b2724/0.8', x - w / 2 - 0.03, x + w / 2 + 0.03, y + 0.03, y + 0.06, z - 0.03, z + t + 0.03);
    kit.sign(f, x, y + 0.066, z + t / 2, w, t, draw, { cw: o.cw ?? 300, ch: o.ch ?? 300, rough: 0.9 });
  };
  const hang = (f, x, z, w, t, draw, o = {}) => { f.box(o.frame ?? 'c#17140f/0.45', x - w / 2 - 0.08, x + w / 2 + 0.08, 0.01, 0.06, z - t / 2 - 0.08, z + t / 2 + 0.08); kit.sign(f, x, 0.068, z, w, t, draw, { cw: o.cw ?? Math.round(w * 140), ch: o.ch ?? Math.round(t * 140), rough: 0.9 }); };
  // ---- the room: a dado and a rail round the walls, and the partition between the shop and the workshop ----------
  // Front to back: the window (to d 4), the showroom (to 17), the stove and the counter (to 28.3), the workshop.
  const A = arch(kit, lot, K), PD = 28.5, DOOR0 = 2.2, DOOR1 = 6.2, HATCH0 = 9.0, HATCH1 = W - 1.07;
  const PT = A.partition(PD, { trim: WAIN, openings: [{ a0: DOOR0, a1: DOOR1 }, { a0: HATCH0, a1: HATCH1, z0: 3.55, z1: 7.8 }] });
  const SH0 = 6, SH1 = 17, BR = 21.5, BRW = 4.4;                // the parts shelving and the chimney breast, along the left wall
  for (const [s0, s1] of [[0.25, SH0 - 0.05], [SH1 + 0.05, BR - BRW / 2 - 0.02], [BR + BRW / 2 + 0.02, PT.front - 0.07], [PT.back + 0.02, D - 2.4]]) A.wainscot('left', s0, s1, { mat: WAIN });
  for (const [s0, s1] of [[0.25, 26.0], [PT.back + 0.02, D - 0.07]]) A.wainscot('right', s0, s1, { mat: WAIN });
  A.wainscot({ d: PT.front, side: 'front' }, 0.07, DOOR0 - 0.44, { mat: WAIN }); A.wainscot({ d: PT.front, side: 'front' }, DOOR1 + 0.46, HATCH0 - 0.6, { mat: WAIN });
  for (const [s0, s1] of [[0.1, BR - BRW / 2 - 0.02], [BR + BRW / 2 + 0.02, PT.front - 0.02], [PT.back + 0.02, D - 0.26]]) A.rail('left', s0, s1, { mat: WAIN });
  for (const [s0, s1] of [[0.1, PT.front - 0.02], [PT.back + 0.02, D - 0.26]]) A.rail('right', s0, s1, { mat: WAIN });
  A.rail({ d: PT.front, side: 'front' }, 0.08, W - 0.08, { mat: WAIN }); A.rail({ d: PT.back, side: 'back' }, 0.08, W - 0.08, { mat: WAIN }); A.rail('back', 0.08, W - 0.08, { mat: WAIN });

  // ---- the window (right of the door): the tourer on a stage ------------------------------------------------------
  const SH = 1.7, S0 = Math.max(8.3, lot.doorA + 3.4), S1 = W - 1.0;
  R.box(MUSTARD, S0, S1, 0.3, 3.9, 0, SH - 0.1, G); R.box(OAK, S0 - 0.05, S1 + 0.05, 0.25, 3.95, SH - 0.1, SH, G); R.block(S0, S1, 0, 3.9, 0, 3.4);
  bike(R, (S0 + S1) / 2 - 0.3, 2.1, SH, 0, { colour: 'c#2f4a2a/0.45', bars: 'drop', tape: 'c#a8784a/0.8', gears: true, guards: STEEL, rack: true, panniers: CANVAS, frontRack: true, bag: CANVAS, lamp: true, stand: OAK, sH: 3.35, barH: 3.35, spokes: 14 });
  potted(R, S1 - 0.8, 1.2, SH, { r: 0.3, n: 16, len: 1.0 });
  tagPost(at(S0 + 1.0, 4.3, 0, 'back'), 0, 0, TAGS.tourer);
  kit.pottedPlant(R, 1.2, 1.5, 0, 'snake', { size: 1.2 });

  // ---- the right wall: four bicycles hung by their front wheels, then the cargo bike on the floor ------------------
  { const hb = at(W, 6.3, 0, 'left'), Z0 = 4.8;                 // +x runs toward the back, +y out from the wall
    hb.box(OAK, -1.3, 8.2, 0.02, 0.1, 7.78, 8.12, G);
    [{ colour: 'c#f4f1ea/0.45', bars: 'bull', tape: REDP, rim: REDP, ring: 0.36, cog: 0.1, sH: 3.35, barH: 3.12, saddle: BLK, spokes: 12, tw: 0.045, reach: 0.34 },
      { colour: 'c#26364f/0.45', bars: 'drop', tape: 'c#a8784a/0.8', gears: true, sH: 3.35, barH: 3.25, spokes: 12, tw: 0.045 },
      { colour: 'c#8fa58a/0.45', bars: 'flat', barW: 0.85, tape: 'c#a8784a/0.8', tyre: 'c#efe2bc/0.8', guards: 'c#8fa58a/0.45', sH: 3.3, barH: 3.4, spokes: 12 },
      { colour: 'c#b8361f/0.45', bars: 'flat', barW: 0.85, gears: true, saddle: BLK, sH: 3.3, barH: 3.35, spokes: 12 }].forEach((o, i) => { const x = i * 2.3;
      bike(hb, x, 0.24, Z0, -Math.PI / 2, { ...o, pitch: -Math.PI / 2 });
      hcyl(hb, IRON, 'x', x, 0.24 + 1.12, Z0 + 2.64, 0.6, 0.03); tube(hb, IRON, [[x + 0.27, 0.08, 7.95], [x + 0.27, 0.24 + 1.12, Z0 + 2.64]], 0.035, 6); });
    hb.block(-1.0, 7.9, 0, 3.7, 0, 8);
    hang(hb, -1.8, 5.0, 1.3, 1.3, TAGS.fixed, { cw: 300, ch: 300, frame: 'c#2b2724/0.8' }); }
  bike(R, W - 2.2, 19.6, 0, -Math.PI / 2, { frame: 'cargo', R: 1.08, Rf: 0.83, wb: 7, cs: 1.4, stL: 1.9, headTop: 3.0, barH: 3.6, sH: 3.25, colour: YEL, bars: 'flat', barW: 0.9, guards: IRON, stand: OAK, spokes: 10, saddle: BLK });
  R.block(W - 3.3, W - 1.1, 15.0, 24.4, 0, 3.6);
  tagPost(at(W - 3.9, 19.0, 0, 'left'), 0, 0, TAGS.cargo);
  // the one chart, over the cargo bike: how to fix a puncture
  hang(at(W, 19.7, 0, 'left'), 0, 6.3, 4.2, 5.5, PUNCTURE, { cw: 680, ch: 892, frame: 'c#2b2724/0.8' });

  // ---- the middle of the floor: two bicycles side by side on a low stand, noses to the street ----------------------
  { const I0 = 6.6, I1 = 10.8, J0 = 7.4, J1 = 14.8, IH = 0.3;
    R.box(MUSTARD, I0 + 0.05, I1 - 0.05, J0 + 0.05, J1 - 0.05, 0, IH - 0.1, G); R.box(OAK, I0, I1, J0, J1, IH - 0.1, IH, G); R.block(I0, I1, J0, J1, 0, 3.6);
    bike(R, I0 + 1.05, 11.2, IH, -Math.PI / 2, { frame: 'step', colour: 'c#9fb0d8/0.45', tyre: 'c#efe2bc/0.8', bars: 'swept', tape: 'c#a8784a/0.8', basket: true, bell: true, guards: 'c#9fb0d8/0.45', rack: true, lamp: true, stand: OAK, headTop: 3.1, barH: 3.75, sH: 3.2, stL: 1.85, reach: 0.12 });
    bike(R, I1 - 1.05, 11.0, IH, -Math.PI / 2, { frame: 'fold', R: 0.67, wb: 3.3, cs: 1.25, bbH: 0.85, stL: 1.25, sH: 3.15, barH: 3.3, colour: REDP, bars: 'flat', barW: 0.8, ring: 0.36, cog: 0.09, guards: IRON, spokes: 8, stand: OAK, reach: 0.1, saddle: BLK });
    tagPost(at(I0 - 0.42, 8.3, 0, 'left'), 0, 0, TAGS.city); }

  // ---- the left wall: parts and accessories, floor to eight feet ----------------------------------------------------
  const rw = at(0, (SH0 + SH1) / 2, 0, 'right');                // +x runs toward the street, +y out from the wall
  X.shelving(rw, -5.5, 5.5, [1.3, 2.7, 4.1, 5.5, 6.9], { d: 1.05, mat: OAK, back: BLACKP });
  const BAY = [3.67, 0, -3.67];
  for (const c0 of BAY) for (const s of [-0.86, 0.86]) rw.soft('c#b89466/0.9', c0 + s - 0.7, c0 + s + 0.7, 0.12, 0.96, 0, 0.86 + (s > 0 ? 0.14 : 0), 0.03);          // cartons underneath
  [['700×23c', 'presta', '#e8c73a'], ['700×28c', 'presta', '#e8c73a'], ['700×35c', 'presta', '#e8c73a'], ['27½×2.1', 'schrader', '#e0782a'], ['26×1.95', 'schrader', '#e0782a'], ['24×1.75', 'schrader', '#e0782a'], ['20×1.75', 'schrader', '#9fb0d8'], ['16×1⅜', 'schrader', '#9fb0d8'], ['12½×2¼', 'schrader', '#9fb0d8']]
    .forEach(([sz, v, col], i) => { const x = BAY[Math.floor(i / 3)] + (1 - i % 3) * 1.08; for (let k = 0; k < (i % 2 ? 2 : 3); k++) kit.pack(rw, x, 0.6, 1.3 + k * 0.305, 0.85, 0.7, 0.3, `c${col}/0.8`, TUBE(sz, v, col), { cw: 170, ch: 60 }); });
  { const z = 2.7;                                              // chain lube and saddle proofing, D-locks, saddles
    for (let i = 0; i < 6; i++) bottle(rw, BAY[0] + 1.3 - i * 0.3, 0.55, z, { r: 0.075, h: 0.52, col: i % 2 ? 'c#2a63b8/0.2' : 'c#5d8a3a/0.2', label: 'c#efe2bc/0.45', cap: 'c#17140f/0.45' });
    for (let i = 0; i < 3; i++) rw.cyl('c#c9952a/0.45', BAY[0] - 1.1, 0.6, z + i * 0.078, z + i * 0.078 + 0.07, 0.15, 0.15, 16); kit.sign(rw, BAY[0] - 1.1, 0.6, z + 0.236, 0.27, 0.27, TIN, { flat: true, round: true, cw: 110, ch: 110 });
    for (let i = 0; i < 5; i++) { const x = BAY[1] + 1.2 - i * 0.6; tube(rw, 'c#17140f/0.45', [[x - 0.13, 0.55, z + 0.1], [x - 0.13, 0.55, z + 0.62], [x - 0.06, 0.55, z + 0.72], [x + 0.06, 0.55, z + 0.72], [x + 0.13, 0.55, z + 0.62], [x + 0.13, 0.55, z + 0.1]], 0.03, 6); hcyl(rw, i % 2 ? 'c#e0782a/0.45' : YEL, 'x', x, 0.55, z + 0.08, 0.46, 0.075); }
    [LEATHER, BLK, 'c#5a3418/0.45', LEATHER].forEach((m, i) => { const x = BAY[2] + 1.2 - i * 0.8; rw.cyl(STEEL, x, 0.5, z, z + 0.34, 0.035, 0.035, 6); saddleOn(placer(rw, x, 0.5, z + 0.4, Math.PI / 2), 0, 0, m, 0.95); }); }
  { const z = 4.1;                                              // bells, lamps, bar tape in colours
    for (let i = 0; i < 8; i++) { const x = BAY[0] + 1.3 - i * 0.36, col = [BRASS, CHROME, REDP, BRASS, 'c#2f5a6a/0.45', YEL, CHROME, BRASS][i]; ves(rw, col, x, 0.6, z, [[0, 0], [0.05, 0], [0.05, 0.03], [0.11, 0.04], [0.11, 0.08], [0.08, 0.14], [0, 0.16]], 12); rw.box(IRON, x + 0.1, x + 0.16, 0.58, 0.62, z + 0.04, z + 0.07); }
    for (let i = 0; i < 6; i++) { const x = BAY[1] + 1.2 - i * 0.48; if (i % 2) rw.soft(REDP, x - 0.07, x + 0.07, 0.48, 0.6, z, z + 0.2, 0.03); else { hcyl(rw, CHROME, 'y', x, 0.55, z + 0.09, 0.2, 0.08); hcyl(rw, PORC, 'y', x, 0.66, z + 0.09, 0.02, 0.07); } }
    ['c#c8202a/0.8', 'c#e8c73a/0.8', 'c#2a63b8/0.8', 'c#a8784a/0.8', 'c#f4f1ea/0.8', 'c#4a6e38/0.8', 'c#17140f/0.8', 'c#e0782a/0.8'].forEach((col, i) => { const x = BAY[2] + 1.2 - i * 0.34; for (const k of [0, 1]) { hcyl(rw, col, 'y', x, 0.5 + k * 0.13, z + 0.13, 0.11, 0.13, 0.13, 12); hcyl(rw, 'c#efe2bc/0.8', 'y', x, 0.5 + k * 0.13, z + 0.13, 0.115, 0.05, 0.05, 8); } }); }
  ['c#c8202a/0.45', 'c#f4f1ea/0.45', 'c#2f5a6a/0.45', 'c#17140f/0.45', 'c#e8c73a/0.45', 'c#f4f1ea/0.45', 'c#2f5a6a/0.45', 'c#c8202a/0.45', 'c#17140f/0.45'].forEach((col, i) => { const x = BAY[Math.floor(i / 3)] + (1 - i % 3) * 1.1, z = 5.5;      // helmets
    ves(rw, col, x, 0.55, z, [[0.3, 0], [0.33, 0.06], [0.32, 0.2], [0.26, 0.34], [0.14, 0.43], [0, 0.46]], 14); rw.box('c#17140f/0.8', x - 0.02, x + 0.02, 0.24, 0.86, z + 0.44, z + 0.47); });
  for (const c0 of BAY) for (const s of [-0.86, 0.86]) ves(rw, 'wicker', c0 + s, 0.56, 6.9, [[0, 0], [0.34, 0], [0.46, 0.62], [0.42, 0.62], [0.31, 0.05], [0, 0.05]], 14);          // baskets on the top shelf

  // ---- the stove, between the shelving and the workshop door: somewhere to wait -----------------------------------
  A.breast('left', BR, { w: BRW, out: 1.1, hearth: [2.4, 3.2] });
  { const sf = at(0, BR, 0, 'right');
    kit.model('st_wood_stove', sf, 0, 1.76, 0.09, 0, { scale: 1.1 }); sf.block(-0.75, 0.75, 1.1, 2.45, 0, 4);
    tube(sf, IRON, [[0, 1.5, 2.55], [0, 1.5, 5.2], [0, 1.38, 5.42], [0, 1.08, 5.46]], 0.16, 10); hcyl(sf, IRON, 'y', 0, 1.125, 5.46, 0.03, 0.27, 0.27, 14);
    kit.model('wall_clock', at(1.1, BR, 0, 'right'), 0, 0.08, 7.9, 0, { hang: true }); }
  { const x = 0.98, y = 18.15; X.crate(R, x, y, 0, 1.3, 1.5, 0.9); R.block(x - 0.65, x + 0.65, y - 0.75, y + 0.75, 0, 1.5);                    // split logs
    for (const [dx, z] of [[-0.36, 0.22], [0, 0.22], [0.36, 0.22], [-0.18, 0.52], [0.18, 0.52], [0, 0.82]]) hcyl(R, 'fir#9a7550', 'y', x + dx, y, z, 1.28, 0.165, 0.165, 9); }
  { const ch = at(0, 25.7, 0, 'right'); kit.model('st_dining_chair_3', ch, 0, 1.25, 0, 0, { seat: 1.5 }); ch.block(-0.7, 0.7, 0, 2.0, 0, 3); }          // the waiting chair
  kit.rug(...(() => { const [X0, Y0] = lot.XY(4.6, 16.6), [X1, Y1] = lot.XY(13.6, 25.4); return [Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1)]; })(), R.h, 'kilim');

  // ---- the counter, under the hatch in the partition: Pascal serves through it from the workshop ---------------------
  const CA = (HATCH0 - 0.6 + W - 0.02) / 2, CL = (W - 0.02 - (HATCH0 - 0.6)) / 2, CD = PT.front - 0.05 - 1.98;       // CD: the customers' edge
  const c = at(CA, CD, 0, 'street');                            // +y is the customers' side; +x runs toward the left wall
  const TOP = X.counter(c, -CL, CL, -1.98, 0, 3.44, { front: MUSTARD, top: BENCH });
  kit.sign(c, 1.2, 0.012, 1.85, 3.6, 2.1, RATES, { cw: 540, ch: 315, rough: 0.9 });
  X.glassCase(c, -4.6, -1.6, -1.6, -0.3, TOP, 1.0);
  { const z = TOP + 0.03;                                        // in the case: a leather saddle, its proofing, three bells
    const SP = placer(c, -3.9, -1.0, z + 0.16, 0.5); saddleOn(SP, 0, 0.1, LEATHER, 1); for (const s of [-1, 1]) SP.tb(STEEL, [[-0.25, s * 0.07, 0.02], [0, s * 0.07, -0.06], [0.25, s * 0.05, 0.03]], 0.012, 4); c.box('c#2b2724/0.8', -4.15, -3.65, -1.2, -0.8, z, z + 0.1);
    c.cyl('c#c9952a/0.45', -3.0, -0.7, z, z + 0.07, 0.15, 0.15, 16); kit.sign(c, -3.0, -0.7, z + 0.072, 0.27, 0.27, TIN, { flat: true, round: true, cw: 110, ch: 110 });
    [BRASS, CHROME, REDP].forEach((col, i) => { const x = -2.7 + i * 0.32; ves(c, col, x, -1.15, z, [[0, 0], [0.05, 0], [0.05, 0.03], [0.11, 0.04], [0.11, 0.08], [0.08, 0.14], [0, 0.16]], 12); }); }
  { // the till at the left end, the bell, the bowl of valve caps
    const x = 4.1, y = -1.2, z = TOP, bx = 0.2, vx = 2.4;
    c.soft('c#2b2724/0.45', x - 0.6, x + 0.6, y - 0.55, y + 0.5, z, z + 0.45, 0.05); c.soft('c#2b2724/0.45', x - 0.55, x + 0.55, y - 0.55, y + 0.05, z + 0.45, z + 1.0, 0.07);
    for (let i = 0; i < 12; i++) c.cyl(i % 4 === 3 ? YEL : 'c#f4f1ea/0.45', x - 0.36 + (i % 4) * 0.24, y + 0.16 + Math.floor(i / 4) * 0.1, z + 0.45, z + 0.5, 0.055, 0.055, 8);
    hcyl(c, CHROME, 'x', x - 0.68, y - 0.2, z + 0.7, 0.14, 0.03); ball(c, YEL, x - 0.78, y - 0.2, z + 0.64, 0.06, 8);
    c.box(IRON, bx - 0.08, bx + 0.08, -0.56, -0.4, z, z + 0.05); ves(c, BRASS, bx, -0.48, z + 0.05, [[0, 0], [0.06, 0], [0.06, 0.03], [0.16, 0.04], [0.16, 0.1], [0.12, 0.17], [0, 0.2]], 16); c.box(IRON, bx + 0.14, bx + 0.24, -0.5, -0.46, z + 0.07, z + 0.1);
    uses.push({ xz: kit.world(c, bx, -0.48), y: c.h + z + 0.2, label: 'ring the bell', reach: 5.5, size: 0.5, act: ctx => { ctx.sound.note(91, 0, 1.6, 0.1); ctx.sound.note(96, 0.02, 1.4, 0.05); ctx.sound.note(91, 0.22, 1.8, 0.09); ctx.flash('Dring-dring. From behind the hatch: "In a minute."'); } });
    bowl(c, vx, -0.75, z, 0.3, 0.15, PORC); for (let i = 0; i < 22; i++) { const a = i * 2.4, r = 0.03 + (i % 5) * 0.035; c.cyl([BLK, REDP, YEL, BLUE, 'c#f4f1ea/0.45', 'c#5d8a3a/0.45'][i % 6], vx + Math.cos(a) * r, -0.75 + Math.sin(a) * r, z + 0.04 + (i % 3) * 0.02, z + 0.09 + (i % 3) * 0.02, 0.022, 0.018, 6); }
    X.card(c, vx, -0.3, z, 1.1, 0.3, NOTE('valve caps. free.', '#f6efd8', '#2a1c13'), { cw: 250, ch: 68 });
    kit.mug(c, -0.9, -1.55, z, 'c#e8c73a/0.3', true);
  }
  // on the pier between the door and the hatch: the old card, framed
  { const bw = at((DOOR1 + HATCH0) / 2 + 0.02, PT.front, 0, 'street');
    bw.box(MUSTARD, -0.86, 0.86, 0.01, 0.07, 4.75, 6.25); bw.box('c#f4f1ea/0.8', -0.76, 0.76, 0.07, 0.085, 4.85, 6.15); kit.sign(bw, 0, 0.09, 5.5, 1.36, 1.08, BACK5, { cw: 300, ch: 240, rough: 0.9 }); bw.box('glass', -0.76, 0.76, 0.1, 0.106, 4.85, 6.15); }

  // under the hatch on the workshop side: Pascal's stock, to hand
  { const us = at(CA + 0.2, PT.back, 0, 'back');                // +y runs back into the workshop, +x toward the right wall
    X.shelving(us, -4.0, 4.0, [1.25, 2.45], { d: 0.95, mat: BENCH, back: false, over: 0.85 });
    for (const x of [-2.7, 0, 2.7]) X.crate(us, x, 0.52, 0, 1.7, 0.8, 0.85, 'oak_light#b89466');
    for (const x of [-3.2, -2.2, 2.2, 3.2]) for (let i = 0; i < 4; i++) ring(us, RUBBER, x, 0.5, 1.25 + 0.06 + i * 0.115, 0.36 - (i % 2) * 0.02, 0.06, true);          // tyres, coiled
    for (let i = 0; i < 4; i++) us.soft('c#b89466/0.9', -0.9 + i * 0.62 - 0.27, -0.9 + i * 0.62 + 0.27, 0.14, 0.82, 1.25, 1.25 + 0.5 + (i % 2) * 0.12, 0.02);
    for (let i = 0; i < 7; i++) us.soft(i % 3 ? 'c#e8c73a/0.8' : 'c#e0782a/0.8', -3.5 + i * 1.12, -3.5 + i * 1.12 + 0.8, 0.14, 0.8, 2.45, 2.75, 0.02); }

  // ---- the workshop: bench, vice, tubs of bolts, truing stand, and the pegboard ------------------------------------
  const b = at(6.4, D, 0, 'street');                            // +y comes out from the back wall; +x toward the left wall
  b.box(BENCH, -6.3, 6.3, 0.02, 2.3, 2.9, 3.1, G); b.box(BENCH, -6.2, 6.2, 0.1, 2.1, 0.85, 0.95, G); b.box(BENCH, -6.3, 6.3, 0.02, 0.08, 3.1, 3.75, G);
  for (const x of [-6.15, -2.1, 2.1, 6.15]) for (const y of [0.2, 2.1]) b.box(BENCH, x - 0.13, x + 0.13, y - 0.13, y + 0.13, 0, 2.9, G);
  b.block(-6.3, 6.3, 0, 2.3, 0, 3.1);
  for (const x of [-4.6, 3.9]) X.crate(b, x, 1.1, 0.95, 1.7, 1.5, 0.9, 'oak_light#b89466');
  b.soft(REDP, -1.0, 1.0, 0.45, 1.6, 0.95, 1.8, 0.05); b.box(IRON, -0.3, 0.3, 1.6, 1.64, 1.5, 1.56); b.box(STEEL, -1.0, 1.0, 0.44, 1.61, 1.5, 1.53);
  { // the vice
    const x = 5.3; b.soft('c#26364f/0.45', x - 0.32, x + 0.32, 1.35, 2.15, 3.1, 3.28, 0.03); b.soft('c#26364f/0.45', x - 0.2, x + 0.2, 1.45, 1.95, 3.28, 3.75, 0.04); b.box('c#26364f/0.45', x - 0.27, x + 0.27, 1.95, 2.06, 3.5, 3.92); b.box('c#26364f/0.45', x - 0.27, x + 0.27, 2.2, 2.31, 3.5, 3.92);
    for (const y of [2.06, 2.18]) b.box(STEEL, x - 0.26, x + 0.26, y, y + 0.02, 3.72, 3.92);
    hcyl(b, STEEL, 'y', x, 2.2, 3.5, 0.75, 0.07); hcyl(b, STEEL, 'y', x, 2.62, 3.5, 0.12, 0.05); hcyl(b, STEEL, 'x', x + 0.1, 2.64, 3.5, 0.7, 0.02); for (const s of [-1, 1]) ball(b, STEEL, x + 0.1 + s * 0.35, 2.64, 3.465, 0.035, 6); }
  // four tubs of bolts at the back of the bench
  for (let i = 0; i < 4; i++) { const x = 3.9 - i * 0.92, col = [YEL, BLUE, REDP][i % 3];
    b.box(col, x - 0.4, x + 0.4, 0.12, 0.82, 3.1, 3.42); b.box('c#9a9590/0.45/1', x - 0.35, x + 0.35, 0.17, 0.77, 3.42, 3.44);
    for (let k = 0; k < 5; k++) ball(b, STEEL, x - 0.25 + ((k * 7) % 5) * 0.12, 0.3 + ((k * 3) % 4) * 0.12, 3.43, 0.035, 6); }
  { // on the bench: a hub in pieces, grease, the oil can, a rag, a mug, two spanners
    const z = 3.1;
    bowl(b, -3.6, 1.35, z, 0.24, 0.09, 'c#c9ccd0/0.3/1', 14); for (let i = 0; i < 9; i++) ball(b, CHROME, -3.6 + Math.cos(i * 0.7) * 0.11, 1.35 + Math.sin(i * 0.7) * 0.11, z + 0.03, 0.028, 6);
    hcyl(b, STEEL, 'x', -3.55, 1.8, z + 0.07, 0.42, 0.07); hcyl(b, STEEL, 'x', -3.55, 1.8, z + 0.07, 0.72, 0.02);
    b.cyl('c#2f5a6a/0.45', -2.7, 0.55, z, z + 0.3, 0.2, 0.2, 14); b.cyl('c#d9b35a/0.45', -2.7, 0.55, z + 0.3, z + 0.31, 0.18, 0.18, 14);
    ves(b, 'c#c8202a/0.45', 2.3, 1.4, z, [[0, 0], [0.16, 0], [0.16, 0.2], [0.03, 0.36], [0.02, 0.42], [0, 0.42]], 12); tube(b, STEEL, [[2.3, 1.4, z + 0.4], [2.3, 1.55, z + 0.62], [2.3, 1.85, z + 0.7]], 0.012, 4);
    towel(b, 0.1, 0.8, 2.31, z + 0.03, 0.6, 'c#b8361f/0.8'); kit.mug(b, 3.2, 1.5, z, 'c#f4f1ea/0.3', true);
    for (const [x, y, L] of [[1.2, 1.6, 0.9], [0.9, 1.3, 0.7]]) { b.box(STEEL, x - L / 2, x + L / 2, y - 0.03, y + 0.03, z, z + 0.03); b.cyl(STEEL, x - L / 2, y, z, z + 0.035, 0.07, 0.07, 8); b.cyl(STEEL, x + L / 2, y, z, z + 0.035, 0.065, 0.065, 8); }
  }
  // the pegboard: the thing to walk up to
  { const bx = 0, bz = 6.2;
    b.box(BENCH, bx - 4.5, bx + 4.5, 0.01, 0.055, bz - 2.3, bz + 2.3, G); kit.sign(b, bx, 0.06, bz, 8.8, 4.4, PEG, { cw: 960, ch: 480, rough: 0.95 });
    const put3 = (t, [k, a, b2, c2, d, m]) => { if (k === 'b') b.box(m ?? STEEL, bx - t.x - b2, bx - t.x - a, 0.075, 0.115, bz + t.z + c2, bz + t.z + d); else hcyl(b, d ?? STEEL, 'y', bx - t.x - a, 0.095, bz + t.z + b2, 0.05, c2, c2, 10); };
    for (const t of PEGT) for (const p of t.p) put3(t, p);
    b.box(IRON, bx - 2.87, bx - 0.25, 0.075, 0.12, bz - 0.78, bz - 0.72); SOCK.forEach((n, i) => { if (n !== 10) hcyl(b, CHROME, 'y', bx - sockX(i), 0.19, bz - 0.75, 0.16, sockR(i), sockR(i), 10); }); }
  { // the truing stand, with a wheel in it
    const x = -5.2, z = 3.1, Rw = 1.03, y = 1.25;
    b.soft('c#2a63b8/0.45', x - 0.4, x + 0.4, 0.7, 1.8, z, z + 0.12, 0.03);
    for (const s of [-1, 1]) { tube(b, 'c#2a63b8/0.45', [[x + s * 0.3, y, z + 0.1], [x + s * 0.24, y, z + 0.9], [x + s * 0.19, y, z + 0.33 + Rw]], 0.04, 6); hcyl(b, STEEL, 'x', x + s * 0.17, y, z + 0.33 + Rw, 0.08, 0.05); }
    wheelAt(b, x, y, z + 0.33, Rw, Math.PI / 2, 0, { tyre: false, spokes: 18 });
    b.box('c#2a63b8/0.45', x - 0.05, x + 0.05, y - 0.05, y + 0.05, z + 0.12, z + 0.26); for (const s of [-1, 1]) b.box(STEEL, x + s * 0.07 - 0.012, x + s * 0.07 + 0.012, y - 0.03, y + 0.03, z + 0.22, z + 0.44); }

  // ---- the repair stand in the middle of the workshop, seen side-on through the hatch, with a patient in it ------------
  const SA = 13.9, SD = 33.6;
  R.box('c#2b2724/0.8', SA - 3.2, SA + 2.8, SD - 1.5, SD + 1.9, 0.004, 0.035);
  { const pb = bike(R, SA, SD, 1.9, 0, { colour: 'c#2f5a6a/0.45', bars: 'flat', barW: 0.9, noFront: true, chain: 'hang', gears: true, sH: 3.25, barH: 3.4, pitch: 0.05, tape: 'c#a8784a/0.8', rack: true });
    const [px, py, pz] = pb.pt((pb.st[0] + pb.sp[0]) / 2, 0, (pb.st[1] + pb.sp[1]) / 2), by = py + 0.95;       // the post stands behind the bike
    R.soft(IRON, px - 0.9, px + 0.9, by - 0.6, by + 0.6, 0.035, 0.12, 0.03); R.cyl(REDP, px, by, 0.12, pz + 0.2, 0.1, 0.08, 10); R.cyl(IRON, px, by, pz + 0.2, pz + 0.26, 0.1, 0.1, 10);
    hcyl(R, STEEL, 'y', px, py + 0.5, pz, 0.9, 0.055); R.soft(REDP, px - 0.13, px + 0.13, py - 0.13, py + 0.14, pz - 0.15, pz + 0.15, 0.04); hcyl(R, IRON, 'x', px + 0.25, py + 0.2, pz, 0.36, 0.025);
    // the tool tray on the post
    R.box(REDP, px - 0.6, px + 0.6, by - 0.4, by + 0.35, 3.2, 3.24); for (const [a, b2, c2, d] of [[px - 0.6, px + 0.6, by - 0.4, by - 0.37], [px - 0.6, px + 0.6, by + 0.32, by + 0.35], [px - 0.6, px - 0.57, by - 0.37, by + 0.32], [px + 0.57, px + 0.6, by - 0.37, by + 0.32]]) R.box(REDP, a, b2, c2, d, 3.24, 3.36);
    R.box(STEEL, px - 0.45, px + 0.3, by - 0.2, by - 0.14, 3.24, 3.27); R.cyl(STEEL, px - 0.45, by - 0.17, 3.24, 3.275, 0.07, 0.07, 8); bottle(R, px + 0.4, by + 0.1, 3.24, { r: 0.06, h: 0.4, col: 'c#2a63b8/0.2', cap: 'c#17140f/0.45' }); R.soft('c#b8361f/0.8', px - 0.4, px + 0.1, by + 0.02, by + 0.28, 3.24, 3.3, 0.02);
    R.block(px - 0.9, px + 0.9, by - 0.6, by + 0.6, 0, 5); R.block(SA - 2.9, SA + 2.2, SD - 0.5, SD + 0.5, 0, 6);
  }
  // wheels hung from the joist over the middle of the workshop, on both faces of it
  { const BD = 34.4, PZ = 11.55;
    for (let i = 0; i < 10; i++) { const a = 2.3 + i * 1.5, s = i % 2 ? 1 : -1, d = BD + s * 0.42;
      wheelAt(R, a, d, PZ - 0.955 - 1.12, 1.12, 0, 0, { tyre: i % 3 === 1 ? false : i === 6 ? 'c#efe2bc/0.8' : RUBBER, spokes: 12, ph: i * 0.4 }); hcyl(R, IRON, 'y', a, BD + s * 0.4, PZ, 0.3, 0.025); } }
  // the left wall of the workshop: three tickets on a cork board, the wheel that is off the patient, the compressor
  { const lw = at(0, 32.3, 0, 'right');
    lw.box('fir#3a2c24', -1.85, 1.85, 0.01, 0.06, 4.5, 7.1, G); kit.sign(lw, 0, 0.065, 5.8, 3.5, 2.4, CORK, { cw: 720, ch: 494, rough: 0.95 }); }
  wheelAt(R, 0.72, 34.9, 0, 1.12, Math.PI / 2, -0.12, { spokes: 12 });
  { const bl = at(0, 37.6, 0, 'right'), x = 0, y = 1.2;
    hcyl(bl, REDP, 'x', x, y, 1.1, 2.2, 0.55, 0.55, 16); for (const s of [-1, 1]) { const g = new THREE.SphereGeometry(0.55, 14, 8); g.scale(0.5, 1, 1); g.translate(x + s * 1.1, y, 1.1); K.put(bl, g, REDP); }
    for (const s of [-1, 1]) hcyl(bl, 'c#17140f/0.8', 'y', x - 0.9, y + s * 0.5, 0.3, 0.14, 0.3, 0.3, 12); bl.box(IRON, x + 0.8, x + 0.95, y - 0.4, y + 0.4, 0, 0.6);
    bl.box(IRON, x - 0.9, x + 0.9, y - 0.35, y + 0.35, 1.62, 1.7); bl.soft('c#2b2724/0.45', x - 0.85, x - 0.05, y - 0.3, y + 0.3, 1.7, 2.3, 0.08); hcyl(bl, 'c#5a5a56/0.45', 'x', x - 0.45, y, 2.0, 0.84, 0.25, 0.25, 12);
    bl.cyl('c#5a5a56/0.45', x + 0.5, y, 1.7, 2.45, 0.2, 0.18, 10); for (let i = 0; i < 4; i++) bl.cyl('c#5a5a56/0.45', x + 0.5, y, 1.95 + i * 0.12, 1.99 + i * 0.12, 0.27, 0.27, 12);
    tube(bl, BRASS, [[x + 0.5, y, 2.45], [x + 0.5, y, 2.7], [x + 0.9, y, 2.7], [x + 0.9, y, 1.6]], 0.025, 5);
    for (let i = 0; i < 4; i++) ring(bl, 'c#e0782a/0.45', x, 0.1 + i * 0.065, 4.6, 0.5 - (i % 2) * 0.03, 0.033); hcyl(bl, IRON, 'y', x, 0.2, 5.08, 0.4, 0.035); tube(bl, 'c#e0782a/0.45', [[x + 0.5, 0.25, 4.6], [x + 0.78, 0.5, 3.4], [x + 0.9, 0.9, 2.3], [x + 0.9, y, 1.65]], 0.033, 5);
    bl.block(x - 1.4, x + 1.4, 0, y + 0.6, 0, 3.0); }
  // the right wall of the workshop: tyres on pegs
  { const tw = at(W, 35.6, 0, 'left');
    [[-3.3, 'c#17140f/0.8'], [-1.1, 'c#3a2214/0.8'], [1.1, 'c#17140f/0.8'], [3.3, 'c#efe2bc/0.8']].forEach(([x, col], i) => { for (const k of [0, 1]) ring(tw, col, x, 0.14 + k * 0.15, 6.4, 1.02 - i * 0.02, 0.07); hcyl(tw, IRON, 'y', x, 0.2, 7.33, 0.4, 0.03); }); }
  // the back door, where the real one is (town.js cuts the doorway, 3.1 wide and 6.95 high, and hangs the door): its casing, and a light over it
  { const dc = W - (0.2 * (W + 1) - 0.5), w = 3.1;
    for (const s of [-1, 1]) R.box(WAIN, dc + s * (w / 2 + 0.15) - 0.15, dc + s * (w / 2 + 0.15) + 0.15, D - 0.07, D - 0.004, 0, 6.95, G);
    R.box(WAIN, dc - w / 2 - 0.3, dc + w / 2 + 0.3, D - 0.07, D - 0.004, 6.95, 8.95, G);
    R.box('c#7f8c99/0.15', dc - w / 2, dc + w / 2, D - 0.1, D - 0.07, 7.25, 8.65); for (const k of [-0.52, 0.52]) R.box(WAIN, dc + k - 0.03, dc + k + 0.03, D - 0.12, D - 0.1, 7.25, 8.65);
    A.wainscot('back', dc + w / 2 + 0.32, W - 0.07, { mat: WAIN }); A.wainscot('back', 12.74, dc - w / 2 - 0.32, { mat: WAIN }); }

  // ---- lamps: one in the window, two down the shop, one over the counter, three in the workshop -----------------------
  const lampCol = 'c#c9952a/0.35';
  X.pendant(R, (S0 + S1) / 2, 2.2, { kind: 'cone', drop: 3.0, colour: lampCol, power: 1.0 });
  X.pendant(R, 8.7, 11.0, { kind: 'cone', drop: 3.8, colour: lampCol, power: 0.95 });
  X.pendant(R, 9.1, 21.4, { kind: 'cone', drop: 3.8, colour: lampCol, power: 0.95 });
  X.pendant(R, CA, CD + 0.9, { kind: 'cone', drop: 4.4, colour: lampCol, power: 0.9 });
  X.pendant(R, SA - 0.6, 31.8, { kind: 'cone', drop: 3.6, colour: lampCol, power: 1.0 });
  for (const a of [3.4, 9.4]) X.pendant(R, a, D - 1.7, { kind: 'cone', drop: 2.6, colour: lampCol, power: 1.0 });
  // ---- on the pavement, by the door: the free pump (the fascia already says the rest) ------------------------------------------------------
  { // the pump: free air, help yourself
    const pa = Math.max(1.2, lot.doorA - 4.0), po = 0.95, p = K.wrap(lot.frOut(kit, pa, po, 0, 'street'));
    p.soft(IRON, -0.45, 0.45, -0.3, 0.3, 0, 0.06, 0.02); p.cyl(MUSTARD, 0, 0, 0.06, 2.3, 0.13, 0.11, 12); p.cyl(IRON, 0, 0, 2.3, 2.36, 0.13, 0.13, 12);
    hcyl(p, IRON, 'y', 0, 0.16, 1.75, 0.1, 0.2, 0.2, 14); kit.sign(p, 0, 0.214, 1.75, 0.36, 0.36, (g, w, h) => { disc(g, w / 2, h / 2, w / 2, '#f6efd8'); for (let i = 0; i <= 8; i++) { const a = Math.PI * (0.8 + i * 0.175); line(g, [[w / 2 + Math.cos(a) * w * 0.34, h / 2 + Math.sin(a) * w * 0.34], [w / 2 + Math.cos(a) * w * 0.43, h / 2 + Math.sin(a) * w * 0.43]], INK, 2); } line(g, [[w / 2, h / 2], [w * 0.68, h * 0.3]], RED, 3); disc(g, w / 2, h / 2, 4, INK); T(g, 'psi', w / 2, h * 0.72, h * 0.14, INK, { f: F.elite }); }, { round: true, cw: 96, ch: 96 });
    tube(p, 'c#17140f/0.8', [[0.1, 0.05, 0.3], [0.35, 0.1, 0.25], [0.5, 0.1, 0.9], [0.42, 0.08, 1.7], [0.2, 0.05, 2.05]], 0.03, 6); p.box(IRON, 0.1, 0.24, 0.0, 0.1, 2.0, 2.1);
    kit.sign(p, 0, 0.136, 1.2, 0.2, 0.5, (g, w, h) => { fill(g, w, h, CREAM); g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2); T(g, 'FREE AIR', 0, 2, w * 0.62, INK, { f: F.bebas, ls: 2 }); g.restore(); }, { cw: 56, ch: 140, rough: 0.8 });
    p.block(-0.45, 0.45, -0.35, 0.35, 0, 3.5);
    const xz = lot.worldOut(pa, po), xz2 = lot.worldOut(pa + 1, po), py = p.h;
    const LINES = ['Pssh. Pssh. Pssh. Your tyres are imaginary, and are now at exactly 60 psi.', 'You pump. The needle points at 60. The needle has always pointed at 60.', 'Three good strokes. Somewhere on the island, something is slightly firmer.'];
    let n = 0;
    kit.later.push(ctx => {
      const T3 = ctx.THREE; let mat = null; try { mat = ctx.materials?.make?.('c#2b2724/0.45/1'); } catch { mat = null; }
      mat = mat ?? new T3.MeshStandardMaterial({ color: 0x2b2724, roughness: 0.45, metalness: 0.7 });
      const grp = new T3.Group(), rod = new T3.Mesh(new T3.CylinderGeometry(0.03, 0.03, 1.5, 8), mat), bar = new T3.Mesh(new T3.CylinderGeometry(0.05, 0.05, 0.9, 8).rotateZ(Math.PI / 2), mat);
      rod.position.y = -0.75; grp.add(rod, bar); const rest = py + 2.8; grp.position.set(xz[0], rest, xz[1]); grp.rotation.y = Math.atan2(-(xz2[1] - xz[1]), xz2[0] - xz[0]); ctx.scene.add(grp);
      let ph = 9; ctx.animated.push((t, dt) => { if (ph > 2) return; ph += dt; grp.position.y = rest + (ph < 1.8 ? Math.abs(Math.sin(ph / 0.6 * Math.PI)) * 0.85 : 0); });
      ctx.interact.push({ x: xz[0], y: py + 2.6, z: xz[1], reach: 6.5, size: 1.2, label: () => 'use the free pump', act: () => { try { ph = 0; for (let i = 0; i < 3; i++) for (const m of [101, 104, 106, 109]) ctx.sound.note(m, 0.3 + i * 0.6, 0.22, 0.012); ctx.flash(LINES[n++ % LINES.length]); } catch { /* a pump is not worth a crash */ } } });
    });
  }
  kit.later.push(ctx => { for (const u of uses) ctx.interact.push({ x: u.xz[0], y: u.y, z: u.xz[1], reach: u.reach, size: u.size, label: () => u.label, act: () => { try { u.act(ctx); } catch { /* nor is a bell */ } } }); });

  // ---- Pascal ---------------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'pascal', name: 'Pascal', lot: 'bikes', look: { shape: 'round', colour: '#46524f', belly: '#efe4cf', trim: '#c9a45c', hat: 'cap', hatColour: '#d4a02a', apron: '#2a2a26', eye: '#ffe2b0', ring: 0xffd27a, tool: 'wrench', hover: 4.7 },
    home: lot.world(CA - 0.2, PD + 2.1), faces: lot.world(CA - 0.2, 14), posts: [lot.world(3.6, D - 3.7), lot.world(4.2, PD + 2.3), lot.world(CA - 0.2, PD + 2.1)],
    lines: {
      greet: ['Afternoon. Come in. Nothing in here is urgent; I have checked.', 'Ah. A person.', 'Repairs while you wait. I hope you like waiting.'],
      idle: ['*turns a hub by hand, listens, turns it back*', 'A bearing wants to be neither tight nor loose. So do I.', '*wipes one hand on the rag, then the rag on the other hand*', 'The 10 mm will turn up.', 'Righty tighty, lefty loosey. Except the left pedal.'],
      bye: ['Go gently. Rubber side down.', 'The pump is outside, by the door.', 'Come back when something squeaks.'],
      topics: [
        { q: 'Can you fix my bike?', a: 'Yes. When is another matter.', next: [
          { q: 'How long is "a while"?', a: 'Juniper’s squeak went up on the stand on Tuesday. You cannot rush a squeak. It hides.' }] },
        { q: 'Which bike should I buy?', a: 'What is it for?', next: [
          { q: 'Getting about.', a: 'The Market Day. Three speeds and a basket. Nobody on that bike has ever been in a hurry.' },
          { q: 'Going far.', a: 'The Long Way Round, in the window. The island is four hundred feet. Pack light.' },
          { q: 'Carrying things.', a: 'The Big Ask. The box goes in front, where you can keep an eye on it.' },
          { q: 'Suffering.', a: 'The fixed gear, on the wall. No coasting. Otis rides one. He says it is honest.' }] },
        { q: 'Where is the 10 mm socket?', a: 'If I knew that, I would have a socket and not an outline.', next: [
          { q: 'Have you looked outside?', a: 'Do not tell me. A mechanic needs something to look for.' }] },
        { q: 'The card says "back in 5 minutes".', a: 'And I was. Nobody specified which five.' },
        { q: 'May I use the pump?', a: 'Outside, by the door. It is free. Pump to what it says on the tyre, not to what feels brave.' },
      ],
    },
  });
}
