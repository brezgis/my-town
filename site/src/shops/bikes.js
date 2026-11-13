// Spoke & Sprocket  (south side, 22 ft wide by 22.7 deep; the last shop before the Overlook)
// "Repairs while you wait (a while)." The door is on the left; the window to its right has the tourer on a
// stage. The sales floor is the front half: an island of floor bikes, parts down the left wall, a fixed gear
// on hooks on the right. The back half is the workshop, open to the shop: a bike up in the stand mid-job,
// the bench with its pegboard (one outline empty), the truing stand, the parts washer, Horace the compressor.
// The counter stands between the two, and Pascal floats behind it, not hurrying.
import * as THREE from 'three';
import { tools, fixtures } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, poly, para, glow, ICON } from '../draw.js';
import { sweep, lathe } from '../kit/geom.js';

const TAU = Math.PI * 2;
const OAK = 'oak_light#a3825c', BENCH = 'fir#7d5b45', MUSTARD = 'painted_wood#d4a02a', BLACKP = 'painted_wood#2a2a26', PLY = 'oak_light#d9c08a';
const STEEL = 'c#c9ccd0/0.3/1', CHROME = 'c#d4d6d8/0.12/1', IRON = 'c#2b2724/0.45/1', RUBBER = 'c#17140f/0.8', BLK = 'c#17140f/0.45', LEATHER = 'c#8a5a2a/0.45', PORC = 'c#ebe6dc/0.18';
const REDP = 'c#c8202a/0.45', YEL = 'c#e8c73a/0.45', BLUE = 'c#2a63b8/0.45', WOODM = 'c#a8784a/0.8', CANVAS = 'c#4a6e38/0.8';
const INK = '#1d1b18', CREAM = '#f3ead2', RED = '#b8452e', MUST = '#d9a82e';

// ---- lettering -------------------------------------------------------------------------------------------
const NOTE = (txt, c = '#f6efd8', ink = '#2a1c13', o = {}) => (g, w, h) => {
  paper(g, w, h, c, o.seed ?? 3); const L = txt.split('\n'), px = o.px ?? Math.min(h * 0.82 / L.length, h * 0.5);
  L.forEach((s, i) => T(g, s, w / 2, h * 0.5 + (i - (L.length - 1) / 2) * px * 1.08, px, i && o.ink2 ? o.ink2 : ink, { f: o.f ?? F.caveat, w: 600, max: w * 0.93 }));
};
const BIKETAG = (name, kind, text, price, c = '#ead9ae') => (g, w, h) => {
  paper(g, w, h, c, 7); disc(g, w / 2, h * 0.05, w * 0.03, '#4a3a2a'); g.strokeStyle = '#8a6a3a'; g.lineWidth = 2; g.strokeRect(5, 5, w - 10, h - 10);
  T(g, name, w / 2, h * 0.15, h * 0.088, INK, { f: F.bebas, ls: 1, max: w * 0.88 });
  T(g, kind, w / 2, h * 0.235, h * 0.052, RED, { f: F.fraunces, it: 1, w: 600, max: w * 0.88 });
  line(g, [[w * 0.1, h * 0.283], [w * 0.9, h * 0.283]], INK, 1.5);
  para(g, text, w * 0.08, h * 0.305, h * 0.06, '#2a1c13', w * 0.84, { f: F.caveat, w: 600, lh: 1.04 });
  T(g, price, w / 2, h * 0.935, h * 0.062, RED, { f: F.caveat, w: 700, max: w * 0.9 });
};
const TAGS = {
  tourer: BIKETAG('THE LONG WAY ROUND', 'steel touring bike', 'Lugged steel, 700×35c, drop bars, mudguards, racks front and back. Carries everything you own to the far end of the island. Heavy. Honest. Will outlive you and be nice about it.', 'in the window · 640'),
  city: BIKETAG('THE MARKET DAY', 'step-through city bike', 'Three-speed hub, swept bars, basket, bell, a proper chainguard’s worth of good intentions. You sit up straight and see over hedges. Top speed: dignified.', '380 · bell included (it has to be)'),
  fixed: BIKETAG('THE ONE GEAR', 'fixed-gear', '46 × 17: seventy-three gear inches. No freewheel. When the wheel turns, your legs turn; that is the whole agreement. Front brake fitted, because Pascal likes you.', '420 · nothing to adjust'),
  cargo: BIKETAG('THE BIG ASK', 'long-john cargo bike', 'The box sits low, in front, where you can keep an eye on it. Carries 220 lb: two children, or a week of plums, or one very calm dog. Turning circle: yes, eventually.', '1,450 · plums not included'),
  balance: BIKETAG('THE FIRST ONE', 'child’s balance bike', '12-inch wheels, birch ply. No pedals, no chain, no stabilisers. Feet down, push, glide. It teaches the only hard part, which is the balancing. Ages 2 to 5.', '85 · knees not included'),
  fold: BIKETAG('THE POCKET', 'folding bike', '16-inch wheels, a hinge in the main tube. Folds in 15 seconds. (Pascal: 15 seconds. You, the first time: four minutes and a small cry.) Fits under a table at Slow Hand.', '510 · unfolds too'),
};
const TUBE = (size, valve, c) => (g, w, h) => { fill(g, w, h, c); rect(g, 0, 0, w * 0.07, h, INK); T(g, size, w * 0.53, h * 0.4, h * 0.56, INK, { f: F.bebas, max: w * 0.84 }); T(g, 'AIRLOOM INNER TUBE · ' + valve, w * 0.53, h * 0.8, h * 0.19, INK, { f: F.archivo, max: w * 0.84 }); };
const PATCH = (g, w, h) => { fill(g, w, h, '#4a6e38'); rrect(g, w * 0.08, h * 0.1, w * 0.84, h * 0.8, 4, null, CREAM, 2); T(g, 'PATCH KIT', w / 2, h * 0.34, h * 0.26, CREAM, { f: F.bebas, max: w * 0.76 }); T(g, '6 patches · glue', w / 2, h * 0.58, h * 0.15, CREAM, { f: F.archivo, max: w * 0.76 }); T(g, 'sandpaper · hope', w / 2, h * 0.76, h * 0.15, '#e8c73a', { f: F.archivo, max: w * 0.76 }); };
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
  T(g, 'you can do this. Pascal believes in you, slowly.', w / 2, h * 0.118, h * 0.03, RED, { f: F.caveat, w: 700 });
  STEPS.forEach((txt, i) => { const y0 = h * 0.142 + i * h * 0.099, cy = y0 + h * 0.046;
    if (i) line(g, [[w * 0.05, y0 - h * 0.004], [w * 0.95, y0 - h * 0.004]], 'rgba(29,27,24,.25)', 1);
    disc(g, w * 0.065, cy, h * 0.021, i === 3 ? RED : INK); T(g, String(i + 1), w * 0.065, cy + 1, h * 0.03, CREAM, { f: F.bebas });
    SKETCH[i](g, w * 0.185, cy, h * 0.082);
    para(g, txt, w * 0.275, y0 + h * 0.006, h * 0.0265, '#2a1c13', w * 0.68, { f: F.caveat, w: 600, lh: 1.06 }); });
  T(g, 'step 9: tell everyone you fixed it yourself.   (step 5 is the whole job. the waiting is the job.)', w / 2, h * 0.957, h * 0.022, RED, { f: F.caveat, w: 700, max: w * 0.9 });
};

// The repair tickets on the cork board
const TICKETS = [
  ['114', 'JUNIPER', 'squeak (the bike, not her)', 'ON THE STAND. found one squeak. checking it was the only one'],
  ['115', 'BAO', 'cargo trike. dumpling box rattles', 'rattle was a dumpling. dumpling returned'],
  ['116', 'OTIS', 'fixed gear. clean the chain. say nothing', 'cleaned. said nothing'],
  ['117', 'FOLIO', 'front basket: reinforce. (hardbacks)', 'waiting on: rivets, and a shorter reading list'],
  ['118', 'MOSS', 'fern growing out of the seat tube', 'customer says leave it. LEFT IT'],
  ['119', 'OLIVE', 'delivery bike. slow puncture. very slow', 'three weeks so far. waiting on: the puncture'],
  ['120', 'CRUMB', 'flour in the freehub. again', 'cleaned. explained. Crumb nodded'],
  ['121', 'EMBER', 'candle bracket for the handlebars', 'no. (fine. but a small one)'],
];
const CORK = (g, w, h) => {
  fill(g, w, h, '#b98d5a'); grain(g, w, h, 0.12, 8);
  rrect(g, w * 0.24, h * 0.022, w * 0.52, h * 0.115, 4, '#f6efd8'); T(g, 'REPAIRS  ·  PROMISED FOR TUESDAY', w / 2, h * 0.064, h * 0.05, INK, { f: F.bebas, ls: 2, max: w * 0.48 }); T(g, '(a tuesday)', w / 2, h * 0.112, h * 0.036, RED, { f: F.caveat, w: 700 });
  TICKETS.forEach(([no, who, job, st], i) => { const tw = w * 0.215, th = h * 0.39, x = w * (0.135 + (i % 4) * 0.243), y = h * (0.36 + Math.floor(i / 4) * 0.415);
    g.save(); g.translate(x, y); g.rotate(((i * 37) % 9 - 4) * 0.011);
    rrect(g, -tw / 2 + 3, -th / 2 + 4, tw, th, 3, 'rgba(0,0,0,.18)'); rrect(g, -tw / 2, -th / 2, tw, th, 3, i % 3 === 1 ? '#f3dcd2' : i % 3 === 2 ? '#e6ecd8' : '#f6efd8'); disc(g, 0, -th / 2 + 12, 6, '#c8402f');
    T(g, 'No. ' + no, -tw / 2 + 12, -th / 2 + 36, 17, '#5a5a56', { f: F.elite, a: 'left' });
    T(g, who, 0, -th / 2 + 68, 34, INK, { f: F.bebas, ls: 2 });
    const yy = para(g, job, -tw / 2 + 14, -th / 2 + 92, 23, '#2a1c13', tw - 28, { f: F.caveat, w: 600, lh: 1.05 });
    line(g, [[-tw / 2 + 14, yy + 6], [tw / 2 - 14, yy + 6]], '#9a9590', 1);
    para(g, st, -tw / 2 + 14, yy + 14, 20, RED, tw - 28, { f: F.caveat, w: 700, lh: 1.05 });
    g.restore(); });
};
const RATES = (g, w, h) => {
  board(g, w, h, INK, MUST, { inset: h * 0.04, lw: 3 }); T(g, 'WORKSHOP RATES', w / 2, h * 0.15, h * 0.13, MUST, { f: F.bebas, ls: 3 });
  [['puncture', '8'], ['true a wheel', '15'], ['the full service', '60'], ['…if you watch', '70'], ['…if you help', '90'], ['…if you already had a go yourself', 'sit down']].forEach(([a, p], i) => { const y = h * (0.31 + i * 0.1); T(g, a, w * 0.09, y, h * 0.085, CREAM, { f: F.caveat, w: 600, a: 'left' }); T(g, p, w * 0.91, y, h * 0.085, i > 2 ? '#e8a8a0' : CREAM, { f: F.caveat, w: 600, a: 'right' }); });
  T(g, 'advice: free, plentiful, unhurried', w / 2, h * 0.91, h * 0.06, '#9aa39d', { f: F.caveat, w: 600 });
};
const GEARS = (g, w, h) => {
  paper(g, w, h, '#efe6d2', 9); T(g, 'GEAR INCHES', w / 2, h * 0.09, h * 0.1, INK, { f: F.bebas, ls: 2 }); T(g, 'chainring ÷ sprocket × wheel (27 in)', w / 2, h * 0.185, h * 0.05, RED, { f: F.fraunces, it: 1, w: 600, max: w * 0.92 });
  const cogs = [15, 16, 17, 18], rings = [42, 44, 46, 48];
  cogs.forEach((c, j) => T(g, c + 't', w * (0.36 + j * 0.17), h * 0.3, h * 0.065, INK, { f: F.bebas }));
  rings.forEach((r, i) => { const y = h * (0.41 + i * 0.105); T(g, r + 't', w * 0.14, y, h * 0.065, INK, { f: F.bebas });
    cogs.forEach((c, j) => { const hit = r === 46 && c === 17, x = w * (0.36 + j * 0.17); if (hit) disc(g, x, y, h * 0.056, null, RED, 2.5); T(g, (r / c * 27).toFixed(0), x, y + 1, h * 0.058, hit ? RED : '#2a1c13', { f: F.elite }); }); });
  T(g, 'the one on the wall: 46 × 17 = 73', w / 2, h * 0.845, h * 0.06, RED, { f: F.caveat, w: 700, max: w * 0.92 });
  T(g, '= the penny-farthing you are pretending to ride', w / 2, h * 0.925, h * 0.046, '#2a1c13', { f: F.caveat, w: 600, max: w * 0.92 });
};
const MAP = (g, w, h) => {
  paper(g, w, h, '#efe6d2', 13); T(g, 'RIDES FROM HERE', w / 2, h * 0.07, h * 0.085, INK, { f: F.bebas, ls: 3 });
  const pts = [[0.05, 0.3], [0.18, 0.19], [0.5, 0.16], [0.82, 0.19], [0.95, 0.29], [0.9, 0.42], [0.6, 0.46], [0.3, 0.45], [0.1, 0.41]].map(([x, y]) => [x * w, y * h]);
  poly(g, pts, '#cdd8b6'); line(g, pts, '#4a6e38', 2.5, true);
  const sy = h * 0.31; line(g, [[w * 0.13, sy], [w * 0.88, sy]], '#f6efd8', 11); g.save(); g.setLineDash([6, 6]); line(g, [[w * 0.13, sy], [w * 0.88, sy]], '#9a9590', 1); g.restore();
  for (let i = 0; i < 7; i++) { rect(g, w * (0.2 + i * 0.095), sy - h * 0.065, w * 0.06, h * 0.035, '#b98d5a'); if (i !== 3) rect(g, w * (0.2 + i * 0.095), sy + h * 0.03, w * 0.06, h * 0.035, '#b98d5a'); }
  rect(g, w * 0.135, sy + h * 0.03, w * 0.05, h * 0.035, MUST); ICON.star(g, w * 0.16, sy + h * 0.047, h * 0.05, RED); T(g, 'you are here', w * 0.16, sy + h * 0.1, h * 0.04, RED, { f: F.caveat, w: 700 });
  T(g, 'the Overlook', w * 0.085, sy - h * 0.035, h * 0.034, '#2f4a2a', { f: F.caveat, w: 700, rot: -0.5 }); T(g, 'coffee', w * 0.71, sy - h * 0.085, h * 0.036, '#2a1c13', { f: F.caveat, w: 700 }); T(g, 'dumplings', w * 0.515, sy + h * 0.1, h * 0.036, '#2a1c13', { f: F.caveat, w: 700 });
  g.save(); g.setLineDash([9, 5]); line(g, [[w * 0.15, sy - 3], [w * 0.87, sy - 3]], RED, 2); line(g, [[w * 0.87, sy + 3], [w * 0.15, sy + 3]], '#2f5a6a', 2); g.restore();
  T(g, 'N', w * 0.93, h * 0.12, h * 0.045, INK, { f: F.bebas }); line(g, [[w * 0.93, h * 0.2], [w * 0.93, h * 0.145]], INK, 2); T(g, '(sky)', w * 0.5, h * 0.5, h * 0.034, '#7a8a9a', { f: F.caveat, w: 600 });
  const rides = [['1', 'THE CLASSIC', 'the street, end to end. flat.', '#b8452e'], ['2', 'THE CLASSIC, REVERSED', 'as above, facing the other way. feels longer.', '#2f5a6a'], ['3', 'THE COFFEE RUN', 'to Slow Hand, the long way round. one stop (long).', '#8a5a2a'], ['4', 'THE DUMPLING LOOP', 'to Bao’s cart and home. we measured twice.', '#4a6e38'], ['5', 'THE EPIC', 'number 1, but you tell people about it afterwards.', '#4a2240']];
  rides.forEach(([n, name, sub, col], i) => { const y = h * (0.575 + i * 0.074); disc(g, w * 0.07, y, h * 0.028, col); T(g, n, w * 0.07, y + 1, h * 0.04, '#f6efd8', { f: F.bebas }); T(g, name, w * 0.12, y - h * 0.014, h * 0.042, INK, { f: F.bebas, a: 'left', ls: 1 }); T(g, sub, w * 0.12, y + h * 0.021, h * 0.034, '#2a1c13', { f: F.caveat, w: 600, a: 'left', max: w * 0.66 }); T(g, '400 ft', w * 0.95, y, h * 0.048, col, { f: F.elite, a: 'right' }); });
  T(g, 'every ride is 400 ft. the island is 400 ft. there is no hidden mountain; we looked.', w / 2, h * 0.955, h * 0.034, RED, { f: F.caveat, w: 700, max: w * 0.94 });
};
const BACK5 = (g, w, h) => {
  paper(g, w, h, '#f6efd8', 5); disc(g, w / 2, h * 0.07, 5, '#c8402f');
  T(g, 'BACK IN', w / 2, h * 0.25, h * 0.2, INK, { f: F.bebas, ls: 3 }); T(g, '5 MINUTES', w / 2, h * 0.47, h * 0.24, INK, { f: F.bebas, ls: 3 });
  T(g, '(est. since tuesday)', w / 2, h * 0.65, h * 0.085, '#5a5a56', { f: F.caveat, w: 600 }); T(g, 'pump is by the rack, help yourself', w / 2, h * 0.75, h * 0.07, '#5a5a56', { f: F.caveat, w: 600 });
  T(g, '(I was.)', w * 0.66, h * 0.88, h * 0.16, RED, { f: F.caveat, w: 700, rot: -0.09 });
};
const QUOTE = (g, w, h) => { board(g, w, h, '#f1e9d6', INK, { inset: h * 0.07, lw: 2 }); T(g, '“Life is like riding a bicycle. To keep your balance you must keep moving.”', w / 2, h * 0.4, h * 0.3, INK, { f: F.yellowtail, max: w * 0.95 }); T(g, 'ALBERT EINSTEIN, IN A LETTER TO HIS SON EDUARD, 1930', w / 2, h * 0.76, h * 0.14, RED, { f: F.bebas, ls: 2 }); };
const OPEN = (g, w, h) => { fill(g, w, h, '#0b0a0c'); glow(g, '#ffb84a', h * 0.2, () => { T(g, 'yes, we are open', w / 2, h * 0.4, h * 0.46, '#ffe9b8', { f: F.pacifico, max: w * 0.92 }); T(g, '(no, really)', w / 2, h * 0.8, h * 0.2, '#ffcf8a', { f: F.caveat, w: 700 }); }); };
const ABOARD = (g, w, h) => { slate(g, w, h, '#1d1f1c'); chalk(g, 'SPOKE &', w / 2, h * 0.08, h * 0.085, '#e9c46a'); chalk(g, 'SPROCKET', w / 2, h * 0.165, h * 0.085, '#e9c46a'); ICON.bike(g, w / 2, h * 0.33, h * 0.26, '#f1efe6'); chalk(g, 'repairs while', w / 2, h * 0.5, h * 0.075); chalk(g, 'you wait', w / 2, h * 0.58, h * 0.075); chalk(g, '(a while)', w / 2, h * 0.655, h * 0.06, '#e8a8a0'); chalk(g, 'free air  ·  free advice', w / 2, h * 0.78, h * 0.058, '#9fc6b0'); chalk(g, 'the air is quicker', w / 2, h * 0.9, h * 0.055, '#9aa39d'); };

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
const PLAB = [[-3.25, 0.42, 'SPANNERS  8 – 17'], [-2.05, 0.36, 'PEDAL'], [-1.55, 0.46, 'WHIP'], [-1.0, 0.98, 'CONES'], [-0.2, 0.54, 'PERSUADER'], [0.55, 0.38, 'GENTLE PERSUADER'], [1.52, 0.86, 'DRIVERS'], [2.6, 1.02, 'HEX'], [3.62, 1.02, 'SAW (EMERGENCIES)'], [-3.72, -1.5, 'PLIERS · CUTTERS'], [-2.75, -1.36, 'LEVERS'], [-1.9, -1.14, 'SPOKE KEYS'], [-1.15, -1.42, 'THREE-WAY'], [-0.45, -1.2, 'TAPE'], [3.52, -1.5, 'FILE · BRUSH'], [0.0, -0.4, 'SOCKETS']];
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
  // The layout was drawn for a 22 by 22.7 ft room. The front and the left wall are fixed points; whatever belongs
  // to the right wall moves with lot.W (ax) and whatever belongs to the workshop at the back moves with lot.D (dy).
  const ax = W - 22, dy = D - 22.7;
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
    const w = o.w ?? 1.3, t = o.t ?? 1.73, z = o.z ?? 2.5;
    f.cyl(IRON, x, y, 0, 0.05, 0.32, 0.36, 12); f.cyl(IRON, x, y, 0.05, z + t - 0.1, 0.025, 0.025, 6);
    f.box('c#2b2724/0.8', x - w / 2 - 0.03, x + w / 2 + 0.03, y + 0.03, y + 0.06, z - 0.03, z + t + 0.03);
    kit.sign(f, x, y + 0.066, z + t / 2, w, t, draw, { cw: o.cw ?? 300, ch: o.ch ?? 400, rough: 0.9 });
  };
  const hang = (f, x, z, w, t, draw, o = {}) => { f.box(o.frame ?? 'c#17140f/0.45', x - w / 2 - 0.08, x + w / 2 + 0.08, 0.01, 0.06, z - t / 2 - 0.08, z + t / 2 + 0.08); kit.sign(f, x, 0.068, z, w, t, draw, { cw: o.cw ?? Math.round(w * 140), ch: o.ch ?? Math.round(t * 140), rough: 0.9 }); };

  // ---- the window: the tourer on a stage, the balance bike, wheels on cords ------------------------------------
  const SH = 1.7;
  R.box(MUSTARD, 8.6, 21.6 + ax, 0.3, 3.9, 0, SH - 0.1, G); R.box(OAK, 8.55, 21.65 + ax, 0.25, 3.95, SH - 0.1, SH, G); R.block(8.6, 21.6 + ax, 0, 3.9, 0, 3.4);
  bike(R, 14.6, 2.15, SH, 0, { colour: 'c#2f4a2a/0.45', bars: 'drop', tape: 'c#a8784a/0.8', gears: true, guards: STEEL, rack: true, panniers: CANVAS, frontRack: true, bag: CANVAS, lamp: true, stand: OAK, sH: 3.35, barH: 3.35, spokes: 14 });
  bike(R, 10.3, 2.3, SH, 0.22, { frame: 'beam', R: 0.5, wb: 1.9, sH: 1.45, barH: 1.95, colour: PLY, bars: 'flat', barW: 0.55, tape: REDP, ss: 0.55, tw: 0.075, spokes: 6, stand: OAK, saddle: 'c#c8202a/0.45', reach: 0.05, forkCol: PLY });
  { const sv = at(14.6, 0.95, SH, 'street');                    // cards that face the street
    X.card(sv, 0, 0, 0, 2.7, 1.0, NOTE('THE LONG WAY ROUND\nsteel touring bike. built to be loaded up,\nrained on, and handed down.', '#f6efd8', INK, { ink2: '#2a1c13' }), { cw: 460, ch: 170 });
    X.card(sv, 4.4, 0.2, 0, 1.6, 0.7, NOTE('THE FIRST ONE\nno pedals. no stabilisers. no fear.', '#f3dcd2', INK, { ink2: RED }), { cw: 300, ch: 130 });
    X.card(sv, -5.0, 0.1, 0, 1.9, 0.7, NOTE('wheels trued while you wait.\n(bring a book.)', '#f6efd8', '#2a1c13'), { cw: 330, ch: 120 }); }
  // the right end of the stage: tyres, a crate of tubes, a fern
  for (let i = 0; i < 4; i++) ring(R, RUBBER, 19.9 + ax, 2.5, SH + 0.075 + i * 0.145, 1.0 - (i % 2) * 0.03, 0.075, true);
  X.crate(R, 18.3 + ax, 3.0, SH, 1.2, 0.9, 0.6); for (let i = 0; i < 4; i++) kit.pack(R, 18.0 + ax + (i % 2) * 0.55, 3.0, SH + 0.06 + Math.floor(i / 2) * 0.3, 0.5, 0.7, 0.29, 'c#e8c73a/0.8', TUBE('700×35c', 'presta', '#e8c73a'), { cw: 120, ch: 60 });
  potted(R, 21.0 + ax, 0.9, SH, { r: 0.3, n: 16, len: 1.0 });
  // wheels on cords, and one on the wall
  for (const [a, d, hc, o] of [[18.4 + ax, 2.2, 7.9, { tyre: false, spokes: 16 }], [20.4 + ax, 1.3, 6.2, { spokes: 16 }], [11.4, 1.2, 8.6, { tyre: false, spokes: 16, ph: 0.1 }]]) { wheelAt(R, a, d, hc - 1.12, 1.12, 0, 0, o); R.cyl('c#17140f/0.8', a, d, hc + 1.1, 12, 0.008, 0.008, 4); }
  { const ww = at(W, 2.2, 0, 'left'); wheelAt(ww, 0, 0.2, 4.2, 1.12, 0, 0, { spokes: 16, tyre: false }); hcyl(ww, IRON, 'y', 0, 0.2, 6.3, 0.4, 0.03); }
  { const so = at(11.9, 0.62, 0, 'street');                     // the sign that settles it
    so.box('c#17140f/0.45', -2.15, 2.15, -0.06, 0, 8.0, 9.4); for (const x of [-1.8, 1.8]) so.cyl('c#17140f/0.8', x, -0.03, 9.4, 12, 0.01, 0.01, 4);
    kit.sign(so, 0, 0.006, 8.7, 4.2, 1.3, OPEN, { cw: 420, ch: 130, glow: 1.4 }); }
  for (const d of [1.25, 2.85]) tagPost(at(8.42, d, 0, 'left'), 0, 0, d < 2 ? TAGS.balance : TAGS.tourer);
  kit.pottedPlant(R, 1.3, 1.5, 0, 'snake', { size: 1.2 });

  // ---- the island of floor bikes --------------------------------------------------------------------------------
  bike(R, 13.0, 5.25, 0, Math.PI, { frame: 'cargo', R: 1.08, Rf: 0.83, wb: 7, cs: 1.4, stL: 1.9, headTop: 3.0, barH: 3.6, sH: 3.25, colour: YEL, bars: 'flat', barW: 0.9, guards: IRON, stand: OAK, spokes: 10, saddle: BLK });
  X.crate(R, 12.2, 5.25, 0.75, 1.0, 1.2, 0.55); for (let i = 0; i < 12; i++) K.fruit(R, 'plum', 11.9 + (i % 4) * 0.2, 4.9 + Math.floor(i / 4) * 0.34, 0.86 + (i % 2) * 0.07);
  potted(R, 11.1, 5.3, 0.75, { r: 0.3, n: 16, len: 0.9 });
  X.card(R, 12.2, 5.92, 1.32, 0.9, 0.3, NOTE('plums: Olive’s. box: ours.', '#f6efd8', '#2a1c13'), { cw: 220, ch: 74 });
  bike(R, 15.2, 8.2, 0, Math.PI, { frame: 'step', colour: 'c#9fb0d8/0.45', tyre: 'c#efe2bc/0.8', bars: 'swept', tape: 'c#a8784a/0.8', basket: true, bell: true, guards: 'c#9fb0d8/0.45', rack: true, lamp: true, stand: OAK, headTop: 3.1, barH: 3.75, sH: 3.2, stL: 1.85, reach: 0.12 });
  bike(R, 9.9, 8.2, 0, Math.PI, { frame: 'fold', R: 0.67, wb: 3.3, cs: 1.25, bbH: 0.85, stL: 1.25, sH: 3.15, barH: 3.3, colour: REDP, bars: 'flat', barW: 0.8, ring: 0.36, cog: 0.09, guards: IRON, spokes: 8, stand: OAK, reach: 0.1, saddle: BLK });
  R.block(7.6, 18.1, 4.2, 9.25, 0, 3.6);
  tagPost(at(15.2, 9.5, 0, 'back'), 0, 0, TAGS.city); tagPost(at(9.9, 9.5, 0, 'back'), 0, 0, TAGS.fold); tagPost(at(8.2, 5.6, 0, 'left'), 0, 0, TAGS.cargo);

  // ---- the left wall: tubes by size, lube, locks, bells, lights, tape, helmets; tyres above -----------------------
  const l = at(0, 8.3, 0, 'right');                             // +x runs toward the street
  X.shelving(l, -4.1, 4.1, [1.3, 2.7, 4.1, 5.5], { d: 1.05, mat: OAK, back: BLACKP });
  [['700×23c', 'presta', '#e8c73a'], ['700×28c', 'presta', '#e8c73a'], ['700×35c', 'presta', '#e8c73a'], ['27½×2.1', 'schrader', '#e0782a'], ['26×1.95', 'schrader', '#e0782a'], ['20×1.75', 'schrader', '#9fb0d8'], ['16×1⅜', 'schrader', '#9fb0d8'], ['12½×2¼', 'schrader', '#e88aa8']]
    .forEach(([sz, v, col], i) => { const x = 3.55 - i * 1.0; for (let k = 0; k < (i % 3 === 1 ? 3 : 2); k++) kit.pack(l, x + (k % 2) * 0.03, 0.6, 1.3 + k * 0.305, 0.85, 0.7, 0.3, `c${col}/0.8`, TUBE(sz, v, col), { cw: 170, ch: 60 }); });
  X.card(l, 0, 1.0, 1.3 - 0.33, 3.4, 0.24, NOTE('tubes: the size is on the side of your tyre. bring the tyre if unsure. bring the bike if very unsure.', '#f6efd8', '#2a1c13'), { cw: 640, ch: 46, tilt: 0.05 });
  { const z = 2.7;                                              // lube, patch kits, proofing, locks
    for (let i = 0; i < 6; i++) bottle(l, 3.75 - i * 0.3, 0.55, z, { r: 0.075, h: 0.52, col: i % 2 ? 'c#2a63b8/0.2' : 'c#5d8a3a/0.2', label: 'c#efe2bc/0.45', cap: 'c#17140f/0.45' });
    X.card(l, 3.0, 0.95, z, 1.7, 0.3, NOTE('chain lube: WET (blue) for rain,\nDRY (green) for optimists', '#f6efd8', '#2a1c13'), { cw: 330, ch: 60 });
    for (let i = 0; i < 5; i++) kit.pack(l, 1.5 - i * 0.44, 0.55 + (i % 2) * 0.05, z, 0.38, 0.1, 0.27, 'c#4a6e38/0.8', PATCH, { cw: 100, ch: 72 });
    for (let i = 0; i < 3; i++) l.cyl('c#c9952a/0.45', -1.25, 0.55, z + i * 0.078, z + i * 0.078 + 0.07, 0.15, 0.15, 16); kit.sign(l, -1.25, 0.55, z + 0.236, 0.27, 0.27, TIN, { flat: true, round: true, cw: 110, ch: 110 });
    l.cyl('c#c9952a/0.45', -1.65, 0.6, z, z + 0.07, 0.15, 0.15, 16); kit.sign(l, -1.65, 0.6, z + 0.072, 0.27, 0.27, TIN, { flat: true, round: true, cw: 110, ch: 110 });
    X.card(l, -1.45, 0.95, z, 1.0, 0.24, NOTE('for leather saddles. smells of sheds.', '#f6efd8', '#2a1c13'), { cw: 240, ch: 56 });
    for (let i = 0; i < 3; i++) { const x = -2.45 - i * 0.55; tube(l, 'c#17140f/0.45', [[x - 0.13, 0.55, z + 0.1], [x - 0.13, 0.55, z + 0.62], [x - 0.06, 0.55, z + 0.72], [x + 0.06, 0.55, z + 0.72], [x + 0.13, 0.55, z + 0.62], [x + 0.13, 0.55, z + 0.1]], 0.03, 6); hcyl(l, i === 1 ? 'c#e0782a/0.45' : YEL, 'x', x, 0.55, z + 0.08, 0.46, 0.075); }
    X.card(l, -3.0, 0.95, z, 1.4, 0.24, NOTE('D-locks. lock the frame, not just the wheel.', '#f6efd8', '#2a1c13'), { cw: 320, ch: 54 }); }
  { const z = 4.1;                                              // bells, lights, pedals, bar tape in colours
    for (let i = 0; i < 6; i++) { const x = 3.75 - i * 0.3, col = [BRASS, CHROME, REDP, BRASS, 'c#2f5a6a/0.45', YEL][i]; ves(l, col, x, 0.55, z, [[0, 0], [0.05, 0], [0.05, 0.03], [0.11, 0.04], [0.11, 0.08], [0.08, 0.14], [0, 0.16]], 12); l.box(IRON, x + 0.1, x + 0.16, 0.53, 0.57, z + 0.04, z + 0.07); }
    X.card(l, 3.0, 0.95, z, 1.3, 0.22, NOTE('bells: ding or dring. try them.', '#f6efd8', '#2a1c13'), { cw: 300, ch: 52 });
    for (let i = 0; i < 4; i++) { const x = 1.75 - i * 0.34; if (i % 2) { l.soft(REDP, x - 0.07, x + 0.07, 0.48, 0.6, z, z + 0.2, 0.03); } else { hcyl(l, CHROME, 'y', x, 0.55, z + 0.09, 0.2, 0.08); hcyl(l, PORC, 'y', x, 0.66, z + 0.09, 0.02, 0.07); } }
    for (let i = 0; i < 3; i++) { const x = 0.2 - i * 0.5; for (const dy of [0.35, 0.7]) { l.box('c#17140f/0.45', x - 0.16, x + 0.16, dy - 0.14, dy + 0.14, z + 0.02, z + 0.09); l.cyl(STEEL, x, dy, z, z + 0.1, 0.03, 0.03, 6); } }
    ['c#c8202a/0.8', 'c#e8c73a/0.8', 'c#2a63b8/0.8', 'c#a8784a/0.8', 'c#f4f1ea/0.8', 'c#e88aa8/0.8', 'c#4a6e38/0.8', 'c#17140f/0.8'].forEach((col, i) => { const x = -1.55 - i * 0.31; for (const k of [0, 1]) { hcyl(l, col, 'y', x, 0.5 + k * 0.13, z + 0.13, 0.11, 0.13, 0.13, 12); hcyl(l, 'c#efe2bc/0.8', 'y', x, 0.5 + k * 0.13, z + 0.13, 0.115, 0.05, 0.05, 8); } });
    X.card(l, -2.7, 0.95, z, 1.5, 0.22, NOTE('bar tape: the cheapest new bike there is', '#f6efd8', '#2a1c13'), { cw: 330, ch: 50 }); }
  ['c#c8202a/0.45', 'c#f4f1ea/0.45', 'c#e8c73a/0.45', 'c#2f5a6a/0.45', 'c#17140f/0.45', 'c#e88aa8/0.45'].forEach((col, i) => { const x = 3.4 - i * 1.3; ves(l, col, x, 0.55, 5.5, [[0.3, 0], [0.33, 0.06], [0.32, 0.2], [0.26, 0.34], [0.14, 0.43], [0, 0.46]], 14); l.box('c#17140f/0.8', x - 0.02, x + 0.02, 0.24, 0.86, 5.5 + 0.44, 5.5 + 0.47); });
  X.card(l, 0, 0.98, 5.5, 2.4, 0.24, NOTE('helmets. try one on. the mirror is the window.', '#f6efd8', '#2a1c13'), { cw: 480, ch: 50 });
  for (let i = 0; i < 4; i++) kit.pack(l, 3.3 - i * 1.15, 0.6, 0.02, 1.0, 0.8, 0.95, 'c#c9a77a/0.8', NOTE(['PEDALS\nflat, honest', 'MUDGUARDS\n(you will thank us)', 'LIGHTS\nbe seen', 'BASKETS\nfor baguettes'][i], '#c9a77a', INK, { f: F.bebas }), { cw: 150, ch: 140 });
  for (const x of [-2.2, -3.2]) { l.cyl(YEL, x, 0.55, 0.02, 1.0, 0.07, 0.07, 10); l.box(IRON, x - 0.25, x + 0.25, 0.4, 0.7, 0.02, 0.06); l.cyl(STEEL, x, 0.55, 1.0, 1.18, 0.015, 0.015, 5); hcyl(l, 'c#17140f/0.45', 'x', x, 0.55, 1.18, 0.5, 0.03); }
  // tyres on pegs, and what Einstein wrote to his son
  [[-3.05, 'c#17140f/0.8'], [-1.0, 'c#3a2214/0.8'], [1.05, 'c#17140f/0.8'], [3.1, 'c#efe2bc/0.8']].forEach(([x, col], i) => { for (const k of [0, 1]) ring(l, col, x, 0.14 + k * 0.15, 8.15, 1.02 - i * 0.02, 0.07); hcyl(l, IRON, 'y', x, 0.2, 9.08, 0.4, 0.03); });
  kit.sign(l, 0, 0.03, 7.02, 4.6, 0.3, NOTE('700×28 slick  ·  26×1.95 knobbly  ·  700×35 touring  ·  700×32 cream (for showing off)', '#e6e2d6', '#2a1c13'), { cw: 700, ch: 46, rough: 0.9 });
  hang(l, 0, 10.2, 7.8, 0.95, QUOTE, { cw: 860, ch: 105, frame: 'c#2b2724/0.8' });

  // ---- the right wall: the fixed gear on hooks, caps, panniers, the chart, the map ---------------------------------
  const rw = at(W, 9, 0, 'left');                               // +x runs toward the back of the shop
  { const fx = bike(rw, -0.5, 0.84, 5.5, Math.PI, { colour: 'c#f4f1ea/0.45', bars: 'bull', tape: REDP, rim: REDP, ring: 0.36, cog: 0.1, sH: 3.35, barH: 3.12, saddle: BLK, spokes: 12, tw: 0.045, reach: 0.34 });
    for (const u of [-0.25, 0.55]) { const [px, , pz] = fx.pt(u, 0, fx.st[1] - 0.14); hcyl(rw, IRON, 'y', px, 0.5, pz, 1.0, 0.035); rw.box(IRON, px - 0.035, px + 0.035, 0.96, 1.0, pz, pz + 0.16); rw.cyl(IRON, px, 0.03, pz - 0.12, pz + 0.12, 0.09, 0.09, 8); } }
  hang(rw, 2.55, 3.95, 1.3, 1.73, TAGS.fixed, { cw: 300, ch: 400, frame: 'c#2b2724/0.8' });
  hang(rw, 0.85, 3.95, 1.75, 1.65, GEARS, { cw: 300, ch: 283 });
  // caps on a shelf
  rw.box(OAK, -3.7, -0.5, 0.02, 0.75, 4.3, 4.38, G); for (const x of [-3.5, -0.7]) rw.box(IRON, x - 0.03, x + 0.03, 0.02, 0.7, 4.05, 4.3);
  [['c#f4f1ea/0.8', REDP], ['c#e8c73a/0.8', 'c#17140f/0.8'], ['c#2f5a6a/0.8', 'c#f4f1ea/0.8'], ['c#c8202a/0.8', 'c#f4f1ea/0.8'], ['c#17140f/0.8', YEL]].forEach(([col, st], i) => { const x = -3.3 + i * 0.6; ves(rw, col, x, 0.36, 4.38, [[0.26, 0], [0.26, 0.07], [0.2, 0.17], [0.08, 0.21], [0, 0.22]], 14); rw.cyl(st, x, 0.36, 4.385, 4.43, 0.265, 0.265, 14); kit.put(rw, col, bev(-0.17, 0.17, 0, 0.24, -0.012, 0.012, 0.01), { rx: 0.45, at: [x, 0.58, 4.44] }); });
  kit.sign(rw, -2.1, 0.03, 5.0, 2.4, 0.34, NOTE('CAPS · one size fits most heads · peak up for luck', '#e6e2d6', '#2a1c13'), { cw: 440, ch: 62, rough: 0.9 });
  // panniers on a rail underneath
  hcyl(rw, IRON, 'x', -2.1, 0.45, 3.35, 3.2, 0.03); for (const x of [-3.6, -0.6]) hcyl(rw, IRON, 'y', x, 0.24, 3.35, 0.46, 0.03);
  [[-3.1, CANVAS], [-2.1, 'c#a8784a/0.8'], [-1.1, 'c#26364f/0.8']].forEach(([x, col]) => { rw.soft(col, x - 0.42, x + 0.42, 0.12, 0.58, 2.05, 3.3, 0.06); rw.box('c#3a2214/0.8', x - 0.43, x + 0.43, 0.58, 0.6, 2.9, 3.0); for (const dx of [-0.2, 0.2]) { rw.box('c#3a2214/0.8', x + dx - 0.04, x + dx + 0.04, 0.58, 0.61, 2.45, 3.3); rw.box(BRASS, x + dx - 0.05, x + dx + 0.05, 0.6, 0.625, 2.6, 2.7); } });
  X.card(rw, -2.1, 0.7, 1.55, 2.2, 0.36, NOTE('panniers: waxed canvas. holds 2 loaves, 1 library\nbook, and the weather out.', '#f6efd8', '#2a1c13'), { cw: 440, ch: 72, tilt: 0.05 });
  rw.box(OAK, -3.6, -0.6, 0.02, 0.8, 1.45, 1.55, G); for (const x of [-3.5, -0.7]) rw.box(OAK, x - 0.05, x + 0.05, 0.05, 0.75, 0, 1.45, G); rw.block(-3.7, -0.5, 0, 0.85, 0, 4.6);
  X.stool(rw, 1.6, 1.15, 1.7, { label: 'sit (and think about gearing)' });
  hang(rw, 4.75, 6.45, 3.6, 3.0, MAP, { cw: 576, ch: 480, frame: 'fir#3a2c24' });
  // behind the counter: the old card, framed, and the clock
  { const x = 9.0 + dy; rw.box(MUSTARD, x - 1.0, x + 1.0, 0.01, 0.07, 4.75, 6.45); rw.box('c#f4f1ea/0.8', x - 0.9, x + 0.9, 0.07, 0.085, 4.85, 6.35); kit.sign(rw, x, 0.09, 5.6, 1.5, 1.2, BACK5, { cw: 300, ch: 240, rough: 0.9 }); rw.box('glass', x - 0.9, x + 0.9, 0.1, 0.106, 4.85, 6.35);
    kit.model('wall_clock', rw, x, 0.08, 8.3, 0, { hang: true }); }

  // ---- the counter, between the shop and the workshop ------------------------------------------------------------
  const c = at(16.5 + ax, 14 + dy, 0, 'street');                          // +y is the customers' side; +x runs toward the door
  const TOP = X.counter(c, -4, 4, -2.2, 0, 3.4, { front: MUSTARD, top: BENCH });
  kit.sign(c, 0.9, 0.012, 1.85, 3.6, 2.1, RATES, { cw: 540, ch: 315, rough: 0.9 });
  kit.sign(c, -2.6, 0.012, 1.85, 2.2, 1.5, (g, w, h) => { board(g, w, h, CREAM, INK, { inset: h * 0.06, lw: 2 }); ICON.bike(g, w / 2, h * 0.3, h * 0.42, INK); T(g, 'REPAIRS WHILE YOU WAIT', w / 2, h * 0.63, h * 0.13, INK, { f: F.bebas, ls: 1, max: w * 0.86 }); T(g, '(a while)', w / 2, h * 0.82, h * 0.15, RED, { f: F.caveat, w: 700 }); }, { cw: 300, ch: 205, rough: 0.9 });
  X.glassCase(c, -3.8, -0.8, -1.75, -0.3, TOP, 1.0);
  { const z = TOP + 0.03;                                        // in the case: a leather saddle and its tin, bells, lights, a lock, pedals, a patch kit
    const P = placer(c, -3.2, -1.2, z + 0.16, 0.5); saddleOn(P, 0, 0.1, LEATHER, 1); for (const s of [-1, 1]) P.tb(STEEL, [[-0.25, s * 0.07, 0.02], [0, s * 0.07, -0.06], [0.25, s * 0.05, 0.03]], 0.012, 4); c.box('c#2b2724/0.8', -3.45, -2.95, -1.4, -1.0, z, z + 0.1);
    c.cyl('c#c9952a/0.45', -3.25, -0.62, z, z + 0.07, 0.15, 0.15, 16); kit.sign(c, -3.25, -0.62, z + 0.072, 0.27, 0.27, TIN, { flat: true, round: true, cw: 110, ch: 110 });
    [BRASS, CHROME, REDP].forEach((col, i) => { const x = -2.6 + i * 0.3; ves(c, col, x, -0.75, z, [[0, 0], [0.05, 0], [0.05, 0.03], [0.11, 0.04], [0.11, 0.08], [0.08, 0.14], [0, 0.16]], 12); });
    hcyl(c, CHROME, 'y', -2.55, -1.3, z + 0.09, 0.2, 0.08); hcyl(c, PORC, 'y', -2.55, -1.19, z + 0.09, 0.02, 0.07); c.soft(REDP, -2.3, -2.16, -1.36, -1.24, z, z + 0.2, 0.03);
    tube(c, 'c#17140f/0.45', [[-1.75, -1.5, z + 0.04], [-1.75, -1.05, z + 0.04], [-1.68, -0.95, z + 0.04], [-1.56, -0.95, z + 0.04], [-1.49, -1.05, z + 0.04], [-1.49, -1.5, z + 0.04]], 0.03, 6); hcyl(c, YEL, 'x', -1.62, -1.5, z + 0.07, 0.44, 0.07);
    for (const [x, y] of [[-1.2, -0.75], [-0.98, -0.95]]) { c.box('c#17140f/0.45', x - 0.15, x + 0.15, y - 0.13, y + 0.13, z + 0.02, z + 0.09); c.cyl(STEEL, x, y, z, z + 0.1, 0.03, 0.03, 6); }
    c.box('c#4a6e38/0.45', -1.3, -0.95, -1.5, -1.26, z, z + 0.06); kit.sign(c, -1.125, -1.38, z + 0.062, 0.33, 0.22, PATCH, { flat: true, cw: 100, ch: 68 });
    [[-3.25, 'saddle 95'], [-2.4, 'bells 6'], [-1.62, 'lock 28'], [-1.1, 'pedals 22']].forEach(([x, t]) => X.card(c, x, -0.42, z, 0.5, 0.17, NOTE(t, '#f6efd8', '#2a1c13'), { cw: 130, ch: 44 })); }
  { // the till, the bell, the bowl of valve caps, the coffee fund, the radio
    const x = 0.5, y = -1.2, z = TOP;
    c.soft('c#2b2724/0.45', x - 0.6, x + 0.6, y - 0.55, y + 0.5, z, z + 0.45, 0.05); c.soft('c#2b2724/0.45', x - 0.55, x + 0.55, y - 0.55, y + 0.05, z + 0.45, z + 1.0, 0.07);
    for (let i = 0; i < 12; i++) c.cyl(i % 4 === 3 ? YEL : 'c#f4f1ea/0.45', x - 0.36 + (i % 4) * 0.24, y + 0.16 + Math.floor(i / 4) * 0.1, z + 0.45, z + 0.5, 0.055, 0.055, 8);
    kit.sign(c, x, y + 0.06, z + 0.76, 0.86, 0.34, (g, w, h) => { fill(g, w, h, INK); T(g, 'CASH · CARD · CAKE', w / 2, h / 2, h * 0.4, '#e9c46a', { f: F.bebas, ls: 1, max: w * 0.9 }); }, { cw: 200, ch: 80 });
    hcyl(c, CHROME, 'x', x - 0.68, y - 0.2, z + 0.7, 0.14, 0.03); ball(c, YEL, x - 0.78, y - 0.2, z + 0.64, 0.06, 8);
    // a bell to ring
    c.box(IRON, 1.42, 1.58, -0.56, -0.4, z, z + 0.05); ves(c, BRASS, 1.5, -0.48, z + 0.05, [[0, 0], [0.06, 0], [0.06, 0.03], [0.16, 0.04], [0.16, 0.1], [0.12, 0.17], [0, 0.2]], 16); c.box(IRON, 1.64, 1.74, -0.5, -0.46, z + 0.07, z + 0.1);
    uses.push({ xz: kit.world(c, 1.5, -0.48), y: c.h + z + 0.2, label: 'ring the bell', reach: 5.5, size: 0.5, act: ctx => { ctx.sound.note(91, 0, 1.6, 0.1); ctx.sound.note(96, 0.02, 1.4, 0.05); ctx.sound.note(91, 0.22, 1.8, 0.09); ctx.flash('Dring-dring. Somewhere behind the counter: "In a minute."'); } });
    // valve caps, free
    bowl(c, 2.35, -0.6, z, 0.3, 0.15, PORC); for (let i = 0; i < 22; i++) { const a = i * 2.4, r = 0.03 + (i % 5) * 0.035; c.cyl([BLK, REDP, YEL, BLUE, 'c#f4f1ea/0.45', 'c#5d8a3a/0.45'][i % 6], 2.35 + Math.cos(a) * r, -0.6 + Math.sin(a) * r, z + 0.04 + (i % 3) * 0.02, z + 0.09 + (i % 3) * 0.02, 0.022, 0.018, 6); }
    X.card(c, 2.35, -0.17, z, 1.2, 0.36, NOTE('valve caps: FREE. take one.\nthey do nothing, beautifully.', '#f6efd8', '#2a1c13', { ink2: RED }), { cw: 270, ch: 82 });
    jar(c, 3.4, -0.6, z, 0.17, 0.44, null, 0, null); for (let i = 0; i < 9; i++) c.cyl(i % 3 ? 'c#b08d4a/0.35/1' : STEEL, 3.4 + (i % 3 - 1) * 0.05, -0.6 + (i % 2) * 0.05, z + 0.02 + i * 0.014, z + 0.032 + i * 0.014, 0.05, 0.05, 8);
    X.card(c, 3.4, -0.17, z, 0.8, 0.4, NOTE('tips for the\ncoffee fund\n(Juniper’s)', '#f3dcd2', '#2a1c13'), { cw: 180, ch: 90 });
    // the workshop radio
    const rx = 3.2, ry = -1.55;
    c.soft('c#4a6e38/0.45', rx - 0.55, rx + 0.55, ry - 0.2, ry + 0.2, z, z + 0.62, 0.05); c.box('c#17140f/0.8', rx - 0.48, rx + 0.02, ry + 0.2, ry + 0.215, z + 0.08, z + 0.54); c.box('e#ffd9a0/2.2', rx + 0.1, rx + 0.46, ry + 0.2, ry + 0.215, z + 0.36, z + 0.5);
    for (const dx of [0.18, 0.38]) hcyl(c, 'c#efe2bc/0.45', 'y', rx + dx, ry + 0.23, z + 0.18, 0.05, 0.05);
    tube(c, STEEL, [[rx + 0.45, ry - 0.1, z + 0.62], [rx + 0.75, ry - 0.1, z + 1.45]], 0.012, 4); tube(c, 'c#17140f/0.45', [[rx - 0.4, ry, z + 0.62], [rx - 0.4, ry, z + 0.78], [rx + 0.3, ry, z + 0.78], [rx + 0.3, ry, z + 0.62]], 0.02, 5);
    const RADIO = ['"...and that was Moth Parliament. Next: forty unbroken minutes of a freewheel ticking."', '"The shipping forecast for the island: sky, in all directions. Light breeze. Visibility: all of it."', '"A listener writes: what is the correct tyre pressure? It is on the side of the tyre, dear. It always was."', 'The dial sticks at a station that is only warm crackle. Pascal seems to prefer it.'];
    let ri = 0; uses.push({ xz: kit.world(c, rx, ry), y: c.h + z + 0.4, label: 'turn the radio dial', reach: 5.5, size: 0.8, act: ctx => { ctx.sound.chirp([60 + ri * 3, 67 + ri * 2], 0.03); ctx.flash(RADIO[ri++ % RADIO.length]); } });
    kit.mug(c, -0.5, -1.7, z, 'c#e8c73a/0.3', true);
  }

  // ---- the workshop: bench, vice, tubs of bolts, pegboard, truing stand ---------------------------------------------
  const b = at(15.3 + ax, D, 0, 'street');                           // +y comes out from the back wall; +x toward the left wall
  b.box(BENCH, -6.3, 6.3, 0.02, 2.3, 2.9, 3.1, G); b.box(BENCH, -6.2, 6.2, 0.1, 2.1, 0.85, 0.95, G); b.box(BENCH, -6.3, 6.3, 0.02, 0.08, 3.1, 3.75, G);
  for (const x of [-6.15, -2.1, 2.1, 6.15]) for (const y of [0.2, 2.1]) b.box(BENCH, x - 0.13, x + 0.13, y - 0.13, y + 0.13, 0, 2.9, G);
  b.block(-6.3, 6.3, 0, 2.3, 0, 3.1);
  for (const [x, col] of [[-4.6, 'oak_light#b89466'], [-1.2, 'oak_light#b89466'], [3.9, 'oak_light#b89466']]) X.crate(b, x, 1.1, 0.95, 1.7, 1.5, 0.9, col);
  b.soft(REDP, 0.6, 2.6, 0.45, 1.6, 0.95, 1.8, 0.05); b.box(IRON, 1.3, 1.9, 1.6, 1.64, 1.5, 1.56); b.box(STEEL, 0.6, 2.6, 0.44, 1.61, 1.5, 1.53);
  for (let i = 0; i < 3; i++) ring(b, RUBBER, -4.6, 1.1, 1.1 + i * 0.13, 0.62, 0.06, true);
  { // the vice
    const x = 5.3; b.soft('c#26364f/0.45', x - 0.32, x + 0.32, 1.35, 2.15, 3.1, 3.28, 0.03); b.soft('c#26364f/0.45', x - 0.2, x + 0.2, 1.45, 1.95, 3.28, 3.75, 0.04); b.box('c#26364f/0.45', x - 0.27, x + 0.27, 1.95, 2.06, 3.5, 3.92); b.box('c#26364f/0.45', x - 0.27, x + 0.27, 2.2, 2.31, 3.5, 3.92);
    for (const y of [2.06, 2.18]) b.box(STEEL, x - 0.26, x + 0.26, y, y + 0.02, 3.72, 3.92);
    hcyl(b, STEEL, 'y', x, 2.2, 3.5, 0.75, 0.07); hcyl(b, STEEL, 'y', x, 2.62, 3.5, 0.12, 0.05); hcyl(b, STEEL, 'x', x + 0.1, 2.64, 3.5, 0.7, 0.02); for (const s of [-1, 1]) ball(b, STEEL, x + 0.1 + s * 0.35, 2.64, 3.465, 0.035, 6);
    hcyl(b, CHROME, 'x', x, 2.13, 4.05, 0.5, 0.04); }                                                 // a seatpost, held gently
  // tubs of bolts along the back of the bench
  ['M5', 'M6', 'M5 (probably)', 'nearly M6', 'washers', 'bearings ¼ in', 'mystery', 'DO NOT MIX (mixed)'].forEach((t, i) => { const x = 4.25 - i * 0.92, col = [YEL, BLUE, REDP][i % 3];
    b.box(col, x - 0.4, x + 0.4, 0.12, 0.82, 3.1, 3.42); b.box('c#9a9590/0.45/1', x - 0.35, x + 0.35, 0.17, 0.77, 3.42, 3.44);
    for (let k = 0; k < 5; k++) ball(b, STEEL, x - 0.25 + ((k * 7) % 5) * 0.12, 0.3 + ((k * 3) % 4) * 0.12, 3.43, 0.035, 6);
    kit.sign(b, x, 0.826, 3.26, 0.74, 0.22, NOTE(t, '#f6efd8', '#2a1c13', { f: F.elite, px: 15 }), { cw: 150, ch: 44, rough: 0.9 }); });
  { // on the bench: a hub in pieces, grease, the oil can, a rag, a mug
    const z = 3.1;
    bowl(b, -3.6, 1.35, z, 0.24, 0.09, 'c#c9ccd0/0.3/1', 14); for (let i = 0; i < 9; i++) ball(b, CHROME, -3.6 + Math.cos(i * 0.7) * 0.11, 1.35 + Math.sin(i * 0.7) * 0.11, z + 0.03, 0.028, 6);
    hcyl(b, STEEL, 'x', -3.55, 1.8, z + 0.07, 0.42, 0.07); hcyl(b, STEEL, 'x', -3.55, 1.8, z + 0.07, 0.72, 0.02); for (const dx of [-0.42, 0.34]) hcyl(b, STEEL, 'x', -3.55 + dx, 2.0, z + 0.04, 0.06, 0.04, 0.03);
    b.cyl('c#2f5a6a/0.45', -4.15, 0.55, z, z + 0.3, 0.2, 0.2, 14); b.cyl('c#d9b35a/0.45', -4.15, 0.55, z + 0.3, z + 0.31, 0.18, 0.18, 14);
    X.card(b, -3.75, 0.95, z, 1.25, 0.34, NOTE('grease: the answer.\n(the question varies.)', '#f6efd8', '#2a1c13', { ink2: RED }), { cw: 270, ch: 74 });
    jar(b, -3.2, 0.5, z, 0.15, 0.4, 'c#c9ccd0/0.3/1', 0.6);
    ves(b, 'c#c8202a/0.45', 2.3, 1.4, z, [[0, 0], [0.16, 0], [0.16, 0.2], [0.03, 0.36], [0.02, 0.42], [0, 0.42]], 12); tube(b, STEEL, [[2.3, 1.4, z + 0.4], [2.3, 1.55, z + 0.62], [2.3, 1.85, z + 0.7]], 0.012, 4);
    towel(b, 0.1, 0.8, 2.31, z + 0.03, 0.6, 'c#b8361f/0.8'); kit.mug(b, 3.2, 1.5, z, 'c#f4f1ea/0.3', true);
    for (const [x, y, L] of [[1.2, 1.6, 0.9], [0.9, 1.3, 0.7]]) { b.box(STEEL, x - L / 2, x + L / 2, y - 0.03, y + 0.03, z, z + 0.03); b.cyl(STEEL, x - L / 2, y, z, z + 0.035, 0.07, 0.07, 8); b.cyl(STEEL, x + L / 2, y, z, z + 0.035, 0.065, 0.065, 8); }
  }
  // the pegboard
  { const bx = 0.8, bz = 6.2;
    b.box(BENCH, bx - 4.5, bx + 4.5, 0.01, 0.055, bz - 2.3, bz + 2.3, G); kit.sign(b, bx, 0.06, bz, 8.8, 4.4, PEG, { cw: 960, ch: 480, rough: 0.95 });
    const put3 = (t, [k, a, b2, c2, d, m]) => { if (k === 'b') b.box(m ?? STEEL, bx - t.x - b2, bx - t.x - a, 0.075, 0.115, bz + t.z + c2, bz + t.z + d); else hcyl(b, d ?? STEEL, 'y', bx - t.x - a, 0.095, bz + t.z + b2, 0.05, c2, c2, 10); };
    for (const t of PEGT) for (const p of t.p) put3(t, p);
    b.box(IRON, bx - 2.87, bx - 0.25, 0.075, 0.12, bz - 0.78, bz - 0.72); SOCK.forEach((n, i) => { if (n !== 10) hcyl(b, CHROME, 'y', bx - sockX(i), 0.19, bz - 0.75, 0.16, sockR(i), sockR(i), 10); });
    kit.sign(b, bx, 0.03, 8.95, 7.6, 0.62, (g, w, h) => { fill(g, w, h, '#e6e2d6'); T(g, 'a place for everything', w * 0.3, h * 0.5, h * 0.72, INK, { f: F.yellowtail, max: w * 0.56 }); T(g, '(and the 10 mm somewhere else)', w * 0.79, h * 0.56, h * 0.5, RED, { f: F.caveat, w: 700, max: w * 0.4 }); }, { cw: 800, ch: 66, rough: 0.95 }); }
  { // the truing stand, with a wheel in it
    const x = -5.2, z = 3.1, Rw = 1.03, y = 1.25;
    b.soft('c#2a63b8/0.45', x - 0.4, x + 0.4, 0.7, 1.8, z, z + 0.12, 0.03);
    for (const s of [-1, 1]) { tube(b, 'c#2a63b8/0.45', [[x + s * 0.3, y, z + 0.1], [x + s * 0.24, y, z + 0.9], [x + s * 0.19, y, z + 0.33 + Rw]], 0.04, 6); hcyl(b, STEEL, 'x', x + s * 0.17, y, z + 0.33 + Rw, 0.08, 0.05); }
    wheelAt(b, x, y, z + 0.33, Rw, Math.PI / 2, 0, { tyre: false, spokes: 18 });
    b.box('c#2a63b8/0.45', x - 0.05, x + 0.05, y - 0.05, y + 0.05, z + 0.12, z + 0.26); for (const s of [-1, 1]) b.box(STEEL, x + s * 0.07 - 0.012, x + s * 0.07 + 0.012, y - 0.03, y + 0.03, z + 0.22, z + 0.44);
    X.card(b, x + 0.1, 2.08, z, 1.5, 0.42, NOTE('truing: a quarter turn. then look.\nthen another. it is a conversation.', '#f6efd8', '#2a1c13', { ink2: RED }), { cw: 330, ch: 92 });
    hcyl(b, REDP, 'z', x + 0.75, 1.5, z + 0.03, 0.06, 0.09); }                                          // the spoke key

  // ---- back left: the parts washer, Horace the compressor, and the poster ------------------------------------------
  const bl = at(4.4, D, 0, 'street');
  { // the parts washer
    const x0 = 1.2, x1 = 3.4, y0 = 0.3, y1 = 1.9;
    bl.box(REDP, x0, x1, y0, y1, 1.9, 1.98); for (const [a, b2, c2, d] of [[x0, x1, y0, y0 + 0.06], [x0, x1, y1 - 0.06, y1], [x0, x0 + 0.06, y0 + 0.06, y1 - 0.06], [x1 - 0.06, x1, y0 + 0.06, y1 - 0.06]]) bl.box(REDP, a, b2, c2, d, 1.98, 3.0);
    bl.box('c#17140f/0.2', x0 + 0.06, x1 - 0.06, y0 + 0.06, y1 - 0.06, 2.5, 2.52); bl.box(REDP, x0, x1, 0.09, 0.15, 3.0, 4.4);
    for (const x of [x0 + 0.1, x1 - 0.1]) for (const y of [y0 + 0.1, y1 - 0.1]) bl.box(IRON, x - 0.05, x + 0.05, y - 0.05, y + 0.05, 0, 1.9);
    bl.cyl('c#26364f/0.45', 2.3, 1.1, 0, 1.6, 0.55, 0.55, 16); tube(bl, STEEL, [[2.3, 0.45, 2.9], [2.3, 0.45, 3.5], [2.3, 0.75, 3.7], [2.3, 1.0, 3.6], [2.3, 1.05, 3.35]], 0.035, 6);
    bl.cyl(STEEL, 1.75, 1.2, 2.52, 2.55, 0.3, 0.3, 16); bl.box(WOODM, 2.7, 3.2, 1.3, 1.37, 2.53, 2.6); bl.box('c#efe2bc/0.8', 3.0, 3.2, 1.28, 1.39, 2.48, 2.53);
    kit.sign(bl, 2.3, y1 + 0.006, 2.5, 1.9, 0.72, (g, w, h) => { fill(g, w, h, '#c8202a'); T(g, 'PARTS WASHER', w / 2, h * 0.32, h * 0.34, CREAM, { f: F.bebas, ls: 2 }); T(g, 'not a sink. not soup. (we checked.)', w / 2, h * 0.72, h * 0.22, '#ffe2b0', { f: F.caveat, w: 700, max: w * 0.92 }); }, { cw: 300, ch: 114, rough: 0.7 });
    bl.block(x0, x1, 0, y1, 0, 3.0); }
  { // Horace
    const x = -1.9, y = 1.1;
    hcyl(bl, REDP, 'x', x, y, 1.1, 2.2, 0.55, 0.55, 16); for (const s of [-1, 1]) { const g = new THREE.SphereGeometry(0.55, 14, 8); g.scale(0.5, 1, 1); g.translate(x + s * 1.1, y, 1.1); K.put(bl, g, REDP); }
    for (const s of [-1, 1]) { hcyl(bl, 'c#17140f/0.8', 'y', x - 0.9, y + s * 0.5, 0.3, 0.14, 0.3, 0.3, 12); } bl.box(IRON, x + 0.8, x + 0.95, y - 0.4, y + 0.4, 0, 0.6);
    bl.box(IRON, x - 0.9, x + 0.9, y - 0.35, y + 0.35, 1.62, 1.7); bl.soft('c#2b2724/0.45', x - 0.85, x - 0.05, y - 0.3, y + 0.3, 1.7, 2.3, 0.08); hcyl(bl, 'c#5a5a56/0.45', 'x', x - 0.45, y, 2.0, 0.84, 0.25, 0.25, 12);
    bl.cyl('c#5a5a56/0.45', x + 0.5, y, 1.7, 2.45, 0.2, 0.18, 10); for (let i = 0; i < 4; i++) bl.cyl('c#5a5a56/0.45', x + 0.5, y, 1.95 + i * 0.12, 1.99 + i * 0.12, 0.27, 0.27, 12);
    bl.box('c#17140f/0.8', x - 0.2, x + 0.62, y + 0.3, y + 0.36, 1.75, 2.3); tube(bl, BRASS, [[x + 0.5, y, 2.45], [x + 0.5, y, 2.7], [x + 0.9, y, 2.7], [x + 0.9, y, 1.6]], 0.025, 5);
    bl.cyl(BRASS, x + 0.9, y, 2.7, 2.78, 0.03, 0.03, 6); hcyl(bl, 'c#f4f1ea/0.45', 'y', x + 0.9, y + 0.03, 2.95, 0.06, 0.17, 0.17, 14); hcyl(bl, IRON, 'y', x + 0.9, y, 2.95, 0.08, 0.19, 0.19, 14);
    kit.sign(bl, x, y + 0.556, 1.1, 1.5, 0.5, (g, w, h) => { fill(g, w, h, CREAM); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(3, 3, w - 6, h - 6); T(g, 'this is HORACE.', w / 2, h * 0.32, h * 0.32, INK, { f: F.caveat, w: 700 }); T(g, 'he is loud. he is sorry.', w / 2, h * 0.7, h * 0.26, RED, { f: F.caveat, w: 700, max: w * 0.9 }); }, { cw: 260, ch: 88, rough: 0.8 });
    for (let i = 0; i < 4; i++) ring(bl, 'c#e0782a/0.45', x, 0.1 + i * 0.065, 3.45, 0.5 - (i % 2) * 0.03, 0.033); hcyl(bl, IRON, 'y', x, 0.2, 3.93, 0.4, 0.035); tube(bl, 'c#e0782a/0.45', [[x + 0.5, 0.2, 3.45], [x + 0.75, 0.5, 2.6], [x + 0.9, 0.9, 1.9], [x + 0.9, y, 1.65]], 0.033, 5);
    bl.block(x - 1.4, x + 1.4, 0, y + 0.6, 0, 3.0); }
  hang(bl, 0, 7.6, 4.5, 5.9, PUNCTURE, { cw: 680, ch: 892, frame: 'c#2b2724/0.8' });
  wheelAt(R, 8.38, 21.3 + dy, 0, 1.12, Math.PI / 2, -0.08, { spokes: 12 });              // the wheel that is off the bike on the stand

  // ---- the repair stand, with a patient in it ------------------------------------------------------------------------
  R.box('c#2b2724/0.8', 2.9, 9.4, 16.5 + dy, 19.7 + dy, 0.004, 0.035);
  { const pb = bike(R, 6.2, 17.85 + dy, 1.9, 0, { colour: 'c#2f5a6a/0.45', bars: 'flat', barW: 0.9, noFront: true, chain: 'hang', gears: true, sH: 3.25, barH: 3.4, pitch: 0.05, tape: 'c#a8784a/0.8', rack: true });
    const [px, py, pz] = pb.pt((pb.st[0] + pb.sp[0]) / 2, 0, (pb.st[1] + pb.sp[1]) / 2), by = py + 0.95;
    R.soft(IRON, px - 0.9, px + 0.9, by - 0.6, by + 0.6, 0.035, 0.12, 0.03); R.cyl(REDP, px, by, 0.12, pz + 0.2, 0.1, 0.08, 10); R.cyl(IRON, px, by, pz + 0.2, pz + 0.26, 0.1, 0.1, 10);
    hcyl(R, STEEL, 'y', px, py + 0.5, pz, 0.9, 0.055); R.soft(REDP, px - 0.13, px + 0.13, py - 0.13, py + 0.14, pz - 0.15, pz + 0.15, 0.04); hcyl(R, IRON, 'x', px + 0.25, py + 0.2, pz, 0.36, 0.025);
    R.box(REDP, px - 0.6, px + 0.6, by - 0.4, by + 0.35, 3.2, 3.24); for (const [a, b2, c2, d] of [[px - 0.6, px + 0.6, by - 0.4, by - 0.37], [px - 0.6, px + 0.6, by + 0.32, by + 0.35], [px - 0.6, px - 0.57, by - 0.37, by + 0.32], [px + 0.57, px + 0.6, by - 0.37, by + 0.32]]) R.box(REDP, a, b2, c2, d, 3.24, 3.36);
    R.box(STEEL, px - 0.45, px + 0.3, by - 0.2, by - 0.14, 3.24, 3.27); R.cyl(STEEL, px - 0.45, by - 0.17, 3.24, 3.275, 0.07, 0.07, 8); bottle(R, px + 0.4, by + 0.1, 3.24, { r: 0.06, h: 0.4, col: 'c#2a63b8/0.2', cap: 'c#17140f/0.45' }); R.soft('c#b8361f/0.8', px - 0.4, px + 0.1, by + 0.02, by + 0.28, 3.24, 3.3, 0.02);
    R.block(px - 0.7, px + 0.7, by - 0.5, by + 0.6, 0, 5); R.block(3.5, 8.3, 17.5 + dy, 18.2 + dy, 0, 6);
    // the ticket tied to the bars, facing the door
    const [tx, ty, tz] = pb.pt(pb.bu, -0.5, pb.barH), tf = at(tx, ty - 0.08, 0, 'street');
    tf.cyl('c#efe2bc/0.8', 0, 0, tz - 0.42, tz, 0.006, 0.006, 3); kit.sign(tf, 0, 0.01, tz - 0.86, 0.72, 0.9, (g, w, h) => { paper(g, w, h, '#f6efd8', 5); disc(g, w / 2, h * 0.07, 5, '#4a3a2a'); T(g, 'No. 114', w / 2, h * 0.2, h * 0.1, '#5a5a56', { f: F.elite }); T(g, 'JUNIPER', w / 2, h * 0.37, h * 0.17, INK, { f: F.bebas, ls: 2 }); T(g, 'squeak', w / 2, h * 0.57, h * 0.15, '#2a1c13', { f: F.caveat, w: 700 }); T(g, '(the bike, not her)', w / 2, h * 0.71, h * 0.1, '#2a1c13', { f: F.caveat, w: 600, max: w * 0.9 }); T(g, 'DO NOT RUSH', w / 2, h * 0.89, h * 0.09, RED, { f: F.elite, max: w * 0.9 }); }, { cw: 170, ch: 212, rough: 0.9 });
  }

  // ---- the left wall of the workshop: the ticket board, the waiting chair, old tyres --------------------------------
  const lw = at(0, 16.4 + dy, 0, 'right');                           // +x runs toward the street
  lw.box('fir#3a2c24', -2.85, 2.85, 0.01, 0.06, 3.5, 7.5, G); kit.sign(lw, 0, 0.065, 5.5, 5.5, 3.8, CORK, { cw: 990, ch: 684, rough: 0.95 });
  kit.model('st_dining_chair_3', lw, 3.1, 1.15, 0, 0, { seat: 1.5 }); lw.block(2.4, 3.8, 0, 1.9, 0, 3);
  kit.sign(lw, 3.25, 0.03, 8.15, 1.9, 0.85, NOTE('THE WAITING CHAIR\nrecord: Olive, 3 weeks\n(slow puncture)', '#e6e2d6', INK, { ink2: RED }), { cw: 300, ch: 134, rough: 0.9 });
  for (let i = 0; i < 5; i++) ring(lw, RUBBER, -1.6 + (i % 2) * 0.06, 1.25, 0.075 + i * 0.145, 1.02 - (i % 3) * 0.03, 0.075, true);
  X.card(lw, -1.6, 1.3, 0.72, 1.4, 0.34, NOTE('old tyres: free to a good swing', '#f6efd8', '#2a1c13'), { cw: 300, ch: 72, tilt: 0.3 });

  // ---- lamps ---------------------------------------------------------------------------------------------------------
  const lampCol = 'c#c9952a/0.35';
  for (const a of [14.5, 18.6]) X.pendant(R, a + ax, 15.1 + dy, { kind: 'cone', drop: 4.7, colour: lampCol, power: 0.95 });
  X.pendant(R, 14.4 + ax, 20.9 + dy, { kind: 'cone', drop: 2.9, colour: lampCol, power: 1.0 });
  X.pendant(R, 6.3, 17.2 + dy, { kind: 'cone', drop: 3.9, colour: lampCol, power: 1.0 });
  X.pendant(R, 12.4, 6.9, { kind: 'cone', drop: 4.2, colour: lampCol, power: 0.95 });
  X.pendant(R, 15.2 + ax / 2, 2.2, { kind: 'cone', drop: 3.0, colour: lampCol, power: 1.0 });
  X.pendant(R, 3.0, 8.3, { kind: 'cone', drop: 3.8, colour: lampCol, power: 0.85 });

  // ---- on the pavement: two bikes for hire, the board, the free pump -----------------------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));            // x = a along the frontage, y = minus the feet out from the shopfront
  bike(o, 17.6 + ax, -2.95, 0, -2.18, { frame: 'step', colour: YEL, bars: 'swept', tape: 'c#17140f/0.8', basket: true, bell: true, guards: IRON, rack: true, kick: true, lean: -0.12, headTop: 3.1, barH: 3.75, sH: 3.2, stL: 1.85, reach: 0.12, saddle: BLK });
  bike(o, 20.1 + ax, -2.95, 0, -2.18, { colour: 'c#4a6e38/0.45', bars: 'flat', barW: 0.9, guards: IRON, kick: true, lean: -0.12, gears: true, sH: 3.3, barH: 3.5, saddle: BLK });
  o.block(15.8 + ax, 21.7 + ax, -5.3, -0.4, 0, 3.4);
  tagPost(K.wrap(lot.frOut(kit, 15.0 + ax, 1.0, 0, 'street')), 0, 0, (g, w, h) => { board(g, w, h, MUST, INK, { inset: h * 0.035, lw: 3 }); T(g, 'FOR HIRE', w / 2, h * 0.13, h * 0.14, INK, { f: F.bebas, ls: 3 }); ICON.bike(g, w / 2, h * 0.34, h * 0.3, INK); T(g, 'by the hour', w / 2, h * 0.54, h * 0.085, INK, { f: F.caveat, w: 700 }); T(g, 'by the day', w / 2, h * 0.64, h * 0.085, INK, { f: F.caveat, w: 700 }); T(g, 'or by the island (400 ft)', w / 2, h * 0.74, h * 0.075, RED, { f: F.caveat, w: 700, max: w * 0.9 }); T(g, 'bring it back before dark.', w / 2, h * 0.87, h * 0.06, INK, { f: F.caveat, w: 600, max: w * 0.9 }); T(g, '(you have ages.)', w / 2, h * 0.94, h * 0.055, INK, { f: F.caveat, w: 600 }); }, { w: 1.4, t: 1.9, z: 1.5, cw: 280, ch: 380 });
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.8, 5.7, 0, 'left')), 0, 0, ABOARD);
  { // the pump: free air, help yourself
    const pa = 1.5, po = 0.95, p = K.wrap(lot.frOut(kit, pa, po, 0, 'street'));
    p.soft(IRON, -0.45, 0.45, -0.3, 0.3, 0, 0.06, 0.02); p.cyl(MUSTARD, 0, 0, 0.06, 2.3, 0.13, 0.11, 12); p.cyl(IRON, 0, 0, 2.3, 2.36, 0.13, 0.13, 12);
    hcyl(p, IRON, 'y', 0, 0.16, 1.75, 0.1, 0.2, 0.2, 14); kit.sign(p, 0, 0.214, 1.75, 0.36, 0.36, (g, w, h) => { disc(g, w / 2, h / 2, w / 2, '#f6efd8'); for (let i = 0; i <= 8; i++) { const a = Math.PI * (0.8 + i * 0.175); line(g, [[w / 2 + Math.cos(a) * w * 0.34, h / 2 + Math.sin(a) * w * 0.34], [w / 2 + Math.cos(a) * w * 0.43, h / 2 + Math.sin(a) * w * 0.43]], INK, 2); } line(g, [[w / 2, h / 2], [w * 0.68, h * 0.3]], RED, 3); disc(g, w / 2, h / 2, 4, INK); T(g, 'psi', w / 2, h * 0.72, h * 0.14, INK, { f: F.elite }); }, { round: true, cw: 96, ch: 96 });
    tube(p, 'c#17140f/0.8', [[0.1, 0.05, 0.3], [0.35, 0.1, 0.25], [0.5, 0.1, 0.9], [0.42, 0.08, 1.7], [0.2, 0.05, 2.05]], 0.03, 6); p.box(IRON, 0.1, 0.24, 0.0, 0.1, 2.0, 2.1);
    p.cyl(IRON, -0.3, -0.05, 0.06, 3.4, 0.03, 0.03, 6); p.box('c#2b2724/0.8', -0.95, 0.35, -0.1, -0.06, 2.75, 3.7);
    kit.sign(p, -0.3, -0.055, 3.22, 1.2, 0.86, (g, w, h) => { board(g, w, h, MUST, INK, { inset: h * 0.05, lw: 3 }); T(g, 'FREE AIR', w / 2, h * 0.28, h * 0.32, INK, { f: F.bebas, ls: 3 }); T(g, 'help yourself', w / 2, h * 0.58, h * 0.19, INK, { f: F.caveat, w: 700 }); T(g, '(the air was always free. the pump is the kind part.)', w / 2, h * 0.82, h * 0.1, RED, { f: F.caveat, w: 700, max: w * 0.9 }); }, { cw: 300, ch: 215, rough: 0.9 });
    p.block(-0.45, 0.45, -0.35, 0.35, 0, 3.5);
    const xz = lot.worldOut(pa, po), xz2 = lot.worldOut(pa + 1, po), py = p.h;
    const LINES = ['Pssh. Pssh. Pssh. Your tyres are imaginary, and are now at exactly 60 psi.', 'You pump. The needle points at 60. The needle has always pointed at 60.', 'Fffft. That was the valve cap. It is in the grass now, with the 10 mm.', 'Three good strokes. Somewhere on the island, something is slightly firmer.', 'Pssh. Pssh. From inside: "To what it says on the tyre! Not to what feels brave!"'];
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
    home: lot.world(16.5 + ax, 17.8 + dy), faces: lot.world(16.5 + ax, 8), posts: [lot.world(10.6 + ax, 18.4 + dy), lot.world(19.6 + ax, 17.8 + dy), lot.world(16.5 + ax, 17.8 + dy)],
    lines: {
      greet: ['Afternoon. Or whenever it is. Come in. Nothing in here is urgent; I have checked.', 'Ah. A person. Mind the chain on the floor. Mind the floor, generally.', 'Welcome to Spoke & Sprocket. Repairs while you wait. I hope you like waiting. I find it underrated.'],
      idle: ['*turns a hub by hand, listens, turns it back*', 'A bearing wants to be neither tight nor loose. So do I.', '*wipes one hand on the rag, then the rag on the other hand*', 'The 10 mm will turn up. It always has not, so far.', '*spins the wheel in the truing stand, watches it for a full minute, moves one spoke a quarter turn*', 'Righty tighty, lefty loosey. Except the left pedal. Life is like that.', '*oils something that did not ask*'],
      bye: ['Go gently. Keep the rubber side down.', 'The pump is outside by the door. Help yourself. The air is on the house.', 'Come back when something squeaks. Something will.'],
      topics: [
        { q: 'Can you fix my bike?', a: 'Yes. When is another matter. They say you can have it fast or you can have it right. I have never once done it fast, so we will never know about the other one.', next: [
          { q: 'How long is "a while"?', a: 'Juniper’s squeak went up on the stand on Tuesday. I found it on Wednesday. I am now making sure it was the only one. You cannot rush a squeak. It hides.' }] },
        { q: 'Tell me about bearings.', a: 'A ball bearing is a small perfect thing that lets a large imperfect thing go round. Too tight, it grinds. Too loose, it wobbles. In between there is a place with no play and no drag, about the width of a held breath. I spend my days looking for it.', next: [
          { q: 'And when you find it?', a: 'I tighten the locknut, and that moves it. Every time. So I begin again, a little wiser, and aim to miss by exactly the right amount. That is also my advice about most things.' },
          { q: 'That sounds like philosophy.', a: 'My namesake wrote that all the unhappiness of men comes from one thing: not knowing how to stay quietly in a room. He had the room. I have the room and a truing stand. I believe I am ahead.' }] },
        { q: 'Which bike should I buy?', a: 'What is it for?', next: [
          { q: 'Getting about.', a: 'The Market Day. Step-through, three speeds, a basket. You sit up straight and see over hedges. Nobody on that bike has ever been in a hurry, and nobody on it has ever been late.' },
          { q: 'Going far.', a: 'The Long Way Round, in the window. Steel. It will carry all you own to the far end of the island, which is four hundred feet. So pack light, or do not. It makes no difference. That is the beauty of it.' },
          { q: 'Carrying things.', a: 'The Big Ask. The box goes in front, where you can keep an eye on it. Bao wants one for the dumplings. I said a trike is steadier for soup. We are in talks.' },
          { q: 'Suffering.', a: 'The fixed gear, on the wall. Forty-six teeth in front, seventeen behind: seventy-three inches. No coasting. The legs go round when the wheel goes round, and that is the entire agreement. Otis rides one. He says it is honest.' }] },
        { q: 'Where is the 10 mm socket?', a: 'If I knew that, I would have a socket and not an outline. Every workshop in the world is missing its 10 mm. I believe they all go to the same place. I have made my peace. I have also made a label.', next: [
          { q: 'Have you looked outside?', a: 'In the grass? Why would it be in the grass. ...No. Do not tell me. A mechanic needs something to look for. Leave it where it is happy.' }] },
        { q: 'The door said "back in 5 minutes".', a: 'And I was. Nobody specified which five. I have framed the card; it is on the wall behind me. I added a note, for the record.' },
        { q: 'Any good rides from here?', a: 'There is a map by the counter. Five routes, all of them four hundred feet, because that is how much island there is. I recommend number five. It is number one, but you tell people about it afterwards.', next: [
          { q: 'Is it hilly?', a: 'There is the kerb. Take it at an angle, and with respect.' }] },
        { q: 'May I use the pump?', a: 'Outside, by the door. It is free. Pump to what it says on the side of the tyre, not to what feels brave. And put the valve cap back on. There is a bowl of them here for when you do not.' },
      ],
    },
  });
}
