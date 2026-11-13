// Low Tide Records  (no. 24, the Rogers & Stevens Building: 29 ft wide and deep, the door left of centre)
// One deep room, as on the measured plan, with the balcony line across it at about three fifths of
// the way back. In front of the line it is a shop: two islands of bins right of the way in, a bank
// under one wall of faced-out sleeves on the right, the staff picks on a ledge on the left. Behind
// the line it is for listening: the listening station stands on the back wall straight ahead of the
// door (a turntable you can put a record on; it plays to the whole street), with a sofa, a chair
// and a rug in front of it, and the counter and Otis to the right. The left side of the room is
// left open from the door to the turntable.
import { tools, fixtures } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, poly, para, glow, ICON, rnd, TAU } from '../draw.js';

const INK = '#151517', CREAM = '#f0ebdc', ORANGE = '#e0723c', TEAL = '#3c8fa0', NAVY = '#26314a';
const WALNUT = 'oak_light#9a7350', OAK = 'oak_light#a3825c', EBONY = 'painted_wood#232224', IRON = 'c#2b2724/0.45/1', CHROME = 'c#d4d6d8/0.12/1', VINYL = 'c#17140f/0.2', CARD = 'c#c9a77a/0.8';
const SPINES = ['c8202a', '8a1c1c', 'b8361f', 'e8907a', 'e88aa8', 'e0782a', 'd9b35a', 'f3d96a', 'c9952a', '7fa04a', '4a6e38', '2f4a2a', '9fb0a4', '2a63b8', '2f5a6a', '26364f', '9fb0d8', 'c9d6d8', '4a2240', '8a5ab0', 'f4f1ea', 'e8e2d4', 'd9cdb2', '17140f', '2b2724', '5a5a56', 'efe2bc', 'c9b48a'].map(h => `c#${h}/0.8`);

// ---- the sleeves: twenty records that do not exist ------------------------------------------------------
const wave = (g, w, y, amp, ph, c, h) => { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += w / 32) g.lineTo(x, y + Math.sin(x / w * TAU * 2 + ph) * amp); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fillStyle = c; g.fill(); };
const COVERS = [
  /* 0 */ ['The Slow Hands', 'Thursday, Quietly', '#e0723c', (g, w, h) => { [[0.46, '#f3e6c8'], [0.36, NAVY], [0.26, '#f3e6c8'], [0.16, NAVY], [0.06, '#e0723c']].forEach(([r, c]) => disc(g, w * 0.66, h * 0.64, w * r, c)); T(g, 'THE SLOW', w * 0.06, h * 0.11, h * 0.115, NAVY, { f: F.archivo, a: 'left' }); T(g, 'HANDS', w * 0.06, h * 0.23, h * 0.115, NAVY, { f: F.archivo, a: 'left' }); T(g, 'thursday, quietly', w * 0.06, h * 0.93, h * 0.065, NAVY, { f: F.fraunces, it: 1, w: 600, a: 'left' }); }],
  /* 1 */ ['Moth Parliament', 'Porch Light', '#1c2440', (g, w, h) => { glow(g, '#f3d96a', w * 0.2, () => disc(g, w / 2, h * 0.5, w * 0.15, '#f8e9a0')); const r = rnd(11); for (let i = 0; i < 9; i++) { const a = r() * TAU, d = w * (0.24 + r() * 0.16), x = w / 2 + Math.cos(a) * d, y = h * 0.5 + Math.sin(a) * d, s = w * (0.03 + r() * 0.025); poly(g, [[x, y], [x - s, y - s * 0.8], [x - s * 0.7, y + s * 0.5]], '#e9e2cf'); poly(g, [[x, y], [x + s, y - s * 0.8], [x + s * 0.7, y + s * 0.5]], '#e9e2cf'); } T(g, 'MOTH PARLIAMENT', w / 2, h * 0.08, h * 0.085, '#e9e2cf', { f: F.bebas, ls: w * 0.012 }); T(g, 'porch light', w / 2, h * 0.92, h * 0.1, '#f3d96a', { f: F.caveat, w: 600 }); }],
  /* 2 */ ['Hollow Tide', 'Low Water Songs', '#e6d9bc', (g, w, h) => { disc(g, w * 0.7, h * 0.4, w * 0.15, ORANGE); ['#9cc3c0', '#6aa5aa', '#3c8fa0', '#2a6878', '#1d4a5a'].forEach((c, i) => wave(g, w, h * (0.46 + i * 0.1), h * 0.018, i * 1.7, c, h)); T(g, 'HOLLOW TIDE', w * 0.07, h * 0.14, h * 0.11, '#1d4a5a', { f: F.limelight, a: 'left' }); T(g, 'low water songs', w * 0.07, h * 0.26, h * 0.06, '#1d4a5a', { f: F.fraunces, it: 1, w: 600, a: 'left' }); }],
  /* 4 */ ['The Servo Five', 'Improvisations for Five Actuators', '#26364f', (g, w, h) => { rect(g, 0, 0, w * 0.3, h, '#e0782a'); T(g, 'THE SERVO FIVE', w * 0.15, h * 0.5, h * 0.105, '#26364f', { f: F.archivo, rot: -Math.PI / 2 }); ['#f0ebdc', '#9fb0d8', '#f0ebdc', '#e0782a', '#f0ebdc'].forEach((c, i) => { const x = w * (0.42 + (i % 2) * 0.22 + (i === 4 ? 0.11 : 0)), y = h * (0.2 + i * 0.13); disc(g, x, y, w * 0.07, c); if (i) line(g, [[w * (0.42 + ((i - 1) % 2) * 0.22), h * (0.2 + (i - 1) * 0.13)], [x, y]], '#f0ebdc', 2); }); T(g, 'improvisations for', w * 0.64, h * 0.86, h * 0.052, '#f0ebdc', { f: F.fraunces, it: 1, w: 600 }); T(g, 'five actuators', w * 0.64, h * 0.93, h * 0.052, '#f0ebdc', { f: F.fraunces, it: 1, w: 600 }); }],
  /* 5 */ ['Aunt Static', 'Dial Tone Lullabies', '#e88aa8', (g, w, h) => { for (let k = 0; k < 5; k++) { const pts = []; for (let i = 0; i <= 16; i++) pts.push([w * (0.06 + i * 0.055), h * (0.36 + k * 0.08) + (i % 2 ? -1 : 1) * h * 0.022 * (1 + Math.sin(i * 0.9 + k))]); line(g, pts, INK, w * 0.012); } T(g, 'Aunt Static', w / 2, h * 0.16, h * 0.15, INK, { f: F.shrikhand }); T(g, 'DIAL TONE LULLABIES', w / 2, h * 0.9, h * 0.07, '#fbe9ee', { f: F.bebas, ls: w * 0.012 }); }],
  /* 6 */ ['Gull Committee', 'Chips, Please', '#9fc4d8', (g, w, h) => { const r = rnd(5); for (let i = 0; i < 7; i++) { const x = w * (0.15 + r() * 0.7), y = h * (0.3 + r() * 0.32), s = w * (0.05 + r() * 0.05); line(g, [[x - s, y - s * 0.3], [x - s * 0.4, y - s * 0.55], [x, y], [x + s * 0.4, y - s * 0.55], [x + s, y - s * 0.3]], '#fdfbf4', w * 0.014); } rect(g, 0, h * 0.74, w, h * 0.26, '#f3d96a'); for (let i = 0; i < 9; i++) rect(g, w * (0.04 + i * 0.105), h * 0.74, w * 0.02, h * 0.26, '#e0a83a'); T(g, 'GULL COMMITTEE', w / 2, h * 0.13, h * 0.1, '#26364f', { f: F.abril, max: w * 0.9 }); T(g, 'chips, please', w / 2, h * 0.87, h * 0.1, '#8a1c1c', { f: F.caveat, w: 600 }); }],
  /* 7 */ ['Velvet Thermos', 'Warm Still', '#5a1f2a', (g, w, h) => { rrect(g, w * 0.36, h * 0.2, w * 0.28, h * 0.5, w * 0.06, '#d9a05a'); rrect(g, w * 0.4, h * 0.12, w * 0.2, h * 0.12, w * 0.03, '#efe2bc'); rect(g, w * 0.36, h * 0.4, w * 0.28, h * 0.07, '#5a1f2a'); T(g, 'Velvet Thermos', w / 2, h * 0.81, h * 0.105, '#efe2bc', { f: F.pacifico }); T(g, 'WARM STILL', w / 2, h * 0.93, h * 0.06, '#d9a05a', { f: F.bebas, ls: w * 0.02 }); }],
  /* 8 */ ['Night Bus Choir', 'Last Stop, Everybody Off', '#111318', (g, w, h) => { rrect(g, w * 0.1, h * 0.36, w * 0.8, h * 0.3, w * 0.04, '#2a3350'); for (let i = 0; i < 6; i++) glow(g, '#f3d96a', w * 0.04, () => rect(g, w * (0.14 + i * 0.125), h * 0.41, w * 0.09, h * 0.11, '#f6dc7a')); for (const x of [0.26, 0.74]) disc(g, w * x, h * 0.67, w * 0.055, '#0a0a0c', '#5a5a56', 3); line(g, [[0, h * 0.74], [w, h * 0.74]], '#5a5a56', 2); T(g, 'NIGHT BUS CHOIR', w / 2, h * 0.15, h * 0.12, '#f0ebdc', { f: F.bebas, ls: w * 0.012 }); T(g, 'last stop, everybody off', w / 2, h * 0.88, h * 0.085, '#f6dc7a', { f: F.caveat, w: 600 }); }],
  /* 9 */ ['Fern & the Understory', 'Photosynth', '#2f4a2a', (g, w, h) => { ICON.leaf(g, w * 0.3, h * 0.42, w * 0.42, '#7fa04a'); ICON.leaf(g, w * 0.55, h * 0.5, w * 0.5, '#a9c86a'); ICON.leaf(g, w * 0.76, h * 0.4, w * 0.36, '#5d8a3a'); T(g, 'Fern & the Understory', w / 2, h * 0.11, h * 0.1, '#efe2bc', { f: F.yellowtail, max: w * 0.92 }); T(g, 'PHOTOSYNTH', w / 2, h * 0.9, h * 0.1, '#a9c86a', { f: F.bebas, ls: w * 0.03 }); }],
  /* 10 */ ['Soft Geometry', 'Rounded Corners', '#e8e2d4', (g, w, h) => { disc(g, w * 0.3, h * 0.34, w * 0.17, '#c8402f'); rrect(g, w * 0.52, h * 0.2, w * 0.32, w * 0.32, w * 0.07, '#e8c73a'); g.lineJoin = 'round'; poly(g, [[w * 0.2, h * 0.76], [w * 0.5, h * 0.76], [w * 0.35, h * 0.52]], '#2a63b8'); line(g, [[w * 0.2, h * 0.76], [w * 0.5, h * 0.76], [w * 0.35, h * 0.52]], '#2a63b8', w * 0.04, true); T(g, 'soft geometry', w * 0.94, h * 0.72, h * 0.075, INK, { f: F.dm, a: 'right' }); T(g, 'rounded corners', w * 0.94, h * 0.81, h * 0.052, '#5a5a56', { f: F.fraunces, it: 1, w: 600, a: 'right' }); }],
  /* 11 */ ['DJ Lighthouse', 'Sweep', '#15161c', (g, w, h) => { g.globalAlpha = 0.85; poly(g, [[w * 0.3, h * 0.33], [w, h * 0.08], [w, h * 0.5]], '#f6e7a0'); g.globalAlpha = 1; for (let i = 0; i < 5; i++) poly(g, [[w * (0.22 + i * 0.008), h * (0.4 + i * 0.1)], [w * (0.38 - i * 0.008), h * (0.4 + i * 0.1)], [w * (0.388 - i * 0.008), h * (0.5 + i * 0.1)], [w * (0.212 + i * 0.008), h * (0.5 + i * 0.1)]], i % 2 ? '#f0ebdc' : '#c8402f'); rect(g, w * 0.24, h * 0.28, w * 0.12, h * 0.12, '#f6e7a0'); poly(g, [[w * 0.22, h * 0.28], [w * 0.38, h * 0.28], [w * 0.3, h * 0.2]], '#c8402f'); T(g, 'DJ LIGHTHOUSE', w * 0.95, h * 0.72, h * 0.085, '#f0ebdc', { f: F.archivo, a: 'right', max: w * 0.52 }); T(g, 'SWEEP', w * 0.95, h * 0.84, h * 0.12, '#f6e7a0', { f: F.bebas, a: 'right', ls: w * 0.03 }); }],
  /* 12 */ ['The Marigolds', 'Always Nearly Evening', '#f2a640', (g, w, h) => { ['#f6c25a', '#f2a640', '#ea8a3a', '#d96a3a', '#b84a3a'].forEach((c, i) => rect(g, 0, h * (0.2 + i * 0.1), w, h * 0.11, c)); disc(g, w / 2, h * 0.7, w * 0.26, '#fbe6a0'); rect(g, 0, h * 0.7, w, h * 0.3, '#3a2240'); for (let i = 0; i < 4; i++) rect(g, w * (0.3 + i * 0.02), h * (0.74 + i * 0.055), w * (0.4 - i * 0.04), h * 0.014, '#fbe6a0'); T(g, 'THE MARIGOLDS', w / 2, h * 0.1, h * 0.1, '#3a2240', { f: F.limelight, max: w * 0.92 }); T(g, 'always nearly evening', w / 2, h * 0.95, h * 0.058, '#fbe6a0', { f: F.fraunces, it: 1, w: 600 }); }],
  /* 13 */ ['Okay Comet', 'See You in 76 Years', '#141a33', (g, w, h) => { const r = rnd(8); for (let i = 0; i < 40; i++) disc(g, r() * w, r() * h, 0.6 + r() * 1.2, '#cfd6ee'); poly(g, [[w * 0.66, h * 0.36], [w * 0.1, h * 0.72], [w * 0.16, h * 0.56]], '#7fb6d8'); poly(g, [[w * 0.66, h * 0.36], [w * 0.2, h * 0.6], [w * 0.3, h * 0.5]], '#d8eef8'); disc(g, w * 0.68, h * 0.35, w * 0.07, '#fdfbf4'); T(g, 'OKAY COMET', w / 2, h * 0.12, h * 0.11, '#fdfbf4', { f: F.archivo, max: w * 0.9 }); T(g, 'see you in 76 years', w / 2, h * 0.9, h * 0.085, '#7fb6d8', { f: F.caveat, w: 600 }); }],
  /* 14 */ ['Paper Boats', 'Regatta in a Gutter', '#c8402f', (g, w, h) => { poly(g, [[w * 0.25, h * 0.56], [w * 0.75, h * 0.56], [w * 0.64, h * 0.7], [w * 0.36, h * 0.7]], '#fdfbf4'); poly(g, [[w * 0.5, h * 0.24], [w * 0.5, h * 0.54], [w * 0.3, h * 0.54]], '#fdfbf4'); poly(g, [[w * 0.52, h * 0.3], [w * 0.52, h * 0.54], [w * 0.68, h * 0.54]], '#f3d6cf'); for (let i = 0; i < 3; i++) line(g, Array.from({ length: 13 }, (_, k) => [w * (0.1 + k * 0.067), h * (0.76 + i * 0.045) + (k % 2 ? 1 : -1) * h * 0.008]), '#f3d6cf', 2); T(g, 'PAPER BOATS', w / 2, h * 0.12, h * 0.1, '#fdfbf4', { f: F.goudy, w: 600, ls: w * 0.01 }); T(g, 'regatta in a gutter', w / 2, h * 0.93, h * 0.06, '#fdfbf4', { f: F.fraunces, it: 1, w: 600 }); }],
  /* 15 */ ['Brass Weather', 'Sunny, with Trombones', '#e8c73a', (g, w, h) => { for (let i = 5; i > 0; i--) disc(g, 0, h, w * (0.14 * i), i % 2 ? '#8a1c1c' : '#e8c73a'); T(g, 'BRASS', w * 0.94, h * 0.13, h * 0.14, '#8a1c1c', { f: F.abril, a: 'right' }); T(g, 'WEATHER', w * 0.94, h * 0.28, h * 0.14, '#8a1c1c', { f: F.abril, a: 'right' }); T(g, 'sunny, with trombones', w * 0.94, h * 0.4, h * 0.052, INK, { f: F.fraunces, it: 1, w: 600, a: 'right' }); }],
  /* 16 */ ['Tall Order', 'Small Songs', '#f4f1ea', (g, w, h) => { disc(g, w * 0.5, h * 0.5, w * 0.012, INK); T(g, 'tall order · small songs', w / 2, h * 0.94, h * 0.04, INK, { f: F.elite }); }],
  /* 17 */ ['Rain Archive', 'Vol. 9: Tin Roof', '#7f909a', (g, w, h) => { const r = rnd(4); for (let i = 0; i < 90; i++) { const x = r() * w * 1.2, y = r() * h, l = h * (0.04 + r() * 0.06); line(g, [[x, y], [x - l * 0.35, y + l]], 'rgba(235,242,246,.75)', 1.5); } rect(g, w * 0.12, h * 0.62, w * 0.76, h * 0.26, '#f4f1ea'); T(g, 'RAIN ARCHIVE', w / 2, h * 0.7, h * 0.075, INK, { f: F.elite }); T(g, 'vol. 9: tin roof', w / 2, h * 0.8, h * 0.06, INK, { f: F.elite }); }],
];
const COVER = i => { const [, , bg, art] = COVERS[i % COVERS.length]; return (g, w, h) => { fill(g, w, h, bg); art(g, w, h); grain(g, w, h, 0.07, 7 + i); }; };

// ---- lettering ----------------------------------------------------------------------------------------------
const NOTE = (txt, c = '#f1e9d6', ink = '#2a1c13', o = {}) => (g, w, h) => { paper(g, w, h, c); const px = o.px ?? h * 0.16; g.font = `600 ${Math.round(px)}px ${F.caveat}`; const lines = []; let y0 = 0;
  for (const block of txt.split('\n')) { let ln = ''; for (const word of block.split(' ')) { const t = ln ? ln + ' ' + word : word; if (g.measureText(t).width > w * 0.88 && ln) { lines.push(ln); ln = word; } else ln = t; } lines.push(ln); }
  y0 = h / 2 - (lines.length - 1) * px * 0.52; lines.forEach((s, i) => T(g, s, w / 2, y0 + i * px * 1.04, px, ink, { f: F.caveat, w: 600, max: w * 0.92 })); };
const HEAD = (txt, style = 0) => (g, w, h) => { const [bg, ink, f] = [[CREAM, INK, F.bebas], [ORANGE, INK, F.archivo], [INK, CREAM, F.bebas], [TEAL, CREAM, F.archivo], ['#e9c46a', INK, F.bebas]][style % 5]; board(g, w, h, bg, ink, { inset: h * 0.1, lw: 2 }); T(g, txt, w / 2, h * 0.54, h * (f === F.bebas ? 0.6 : 0.44), ink, { f, ls: f === F.bebas ? h * 0.05 : 0, max: w * 0.92 }); };
const PICK = (i, txt, who = 'Otis', c = '#f6efd8') => (g, w, h) => { paper(g, w, h, c, 3 + i); const [b, t] = COVERS[i]; T(g, `${b.toUpperCase()} · ${t}`, w / 2, h * 0.1, h * 0.085, '#b8452e', { f: F.bebas, ls: 0.5, max: w * 0.92 }); line(g, [[w * 0.06, h * 0.17], [w * 0.94, h * 0.17]], '#b8452e', 1.5);
  para(g, txt, w * 0.06, h * 0.22, h * 0.175, '#2a1c13', w * 0.88, { f: F.caveat, w: 600, lh: 1.02 }); T(g, '— ' + who, w * 0.94, h * 0.92, h * 0.11, '#b8452e', { f: F.caveat, w: 600, a: 'right' }); };
const POSTERS = [
  (g, w, h) => { fill(g, w, h, '#e0723c'); grain(g, w, h, 0.08); [[0.4, '#f3e6c8'], [0.3, NAVY], [0.2, '#f3e6c8'], [0.1, NAVY]].forEach(([r, c]) => disc(g, w / 2, h * 0.36, w * r, c)); T(g, 'THE SLOW HANDS', w / 2, h * 0.7, h * 0.075, NAVY, { f: F.archivo, max: w * 0.9 }); T(g, 'every thursday, quietly', w / 2, h * 0.78, h * 0.042, NAVY, { f: F.fraunces, it: 1, w: 600 }); T(g, 'AT SLOW HAND COFFEE · ACROSS THE STREET', w / 2, h * 0.85, h * 0.036, '#f3e6c8', { f: F.bebas, ls: 1.5, max: w * 0.9 }); },
  (g, w, h) => { fill(g, w, h, '#1c2440'); grain(g, w, h, 0.08); glow(g, '#f3d96a', w * 0.25, () => disc(g, w / 2, h * 0.3, w * 0.17, '#f8e9a0')); const r = rnd(21); for (let i = 0; i < 14; i++) { const a = r() * TAU, d = w * (0.26 + r() * 0.2), x = w / 2 + Math.cos(a) * d, y = h * 0.3 + Math.sin(a) * d * 0.9, s = w * (0.025 + r() * 0.02); poly(g, [[x, y], [x - s, y - s * 0.8], [x - s * 0.7, y + s * 0.5]], '#e9e2cf'); poly(g, [[x, y], [x + s, y - s * 0.8], [x + s * 0.7, y + s * 0.5]], '#e9e2cf'); } T(g, 'MOTH', w / 2, h * 0.6, h * 0.12, '#e9e2cf', { f: F.bebas, ls: w * 0.04 }); T(g, 'PARLIAMENT', w / 2, h * 0.7, h * 0.085, '#e9e2cf', { f: F.bebas, ls: w * 0.02 }); T(g, 'with AUNT STATIC', w / 2, h * 0.79, h * 0.045, '#e88aa8', { f: F.archivo }); T(g, 'the lamp room · doors at dusk', w / 2, h * 0.87, h * 0.04, '#f8e9a0', { f: F.fraunces, it: 1, w: 600 }); T(g, '(so: now)', w / 2, h * 0.94, h * 0.05, '#f8e9a0', { f: F.caveat, w: 600 }); },
];
const STATION = (g, w, h) => { board(g, w, h, '#ece4d0', INK, { inset: h * 0.05, lw: 3 }); ICON.record(g, w * 0.13, h * 0.26, h * 0.34, INK, '#ece4d0'); disc(g, w * 0.13, h * 0.26, h * 0.045, ORANGE); T(g, 'LISTENING STATION', w * 0.59, h * 0.2, h * 0.2, INK, { f: F.bebas, ls: w * 0.006, max: w * 0.7 }); T(g, 'free, forever, for everybody', w * 0.59, h * 0.37, h * 0.085, '#b8452e', { f: F.fraunces, it: 1, w: 600 });
  ['1.  walk up to the turntable', '2.  put on another record', '3.  sit. stay for the whole side.'].forEach((s, i) => T(g, s, w * 0.1, h * (0.58 + i * 0.135), h * 0.105, INK, { f: F.caveat, w: 600, a: 'left', max: w * 0.82 })); };
const STICKER = (g, w, h) => { disc(g, w / 2, h / 2, w / 2, INK); disc(g, w / 2, h / 2, w * 0.44, null, CREAM, 2); T(g, 'LOW TIDE', w / 2, h * 0.4, h * 0.2, CREAM, { f: F.bebas, ls: 2 }); T(g, 'RECORDS', w / 2, h * 0.6, h * 0.14, ORANGE, { f: F.bebas, ls: 3 }); };
const TAPE = i => (g, w, h) => { const c = ['#e0723c', '#3c8fa0', '#e9c46a', '#e88aa8', '#26314a', '#7fa04a', '#f0ebdc', '#c8402f'][i % 8], ink = i % 8 === 4 ? CREAM : INK; fill(g, w, h, c); rect(g, 0, h * 0.62, w, h * 0.09, ink); T(g, ['MIX', 'RAIN', 'B-SIDES', 'DEMOS', 'LIVE', 'NAPS', 'HISS', 'LOUD'][i % 8], w / 2, h * 0.3, h * 0.2, ink, { f: F.bebas, max: w * 0.86 }); T(g, ['for the bus', 'vol. 3', 'only', 'bad ones', 'in a shed', 'side a', 'the best of', '(sorry)'][i % 8], w / 2, h * 0.85, h * 0.12, ink, { f: F.caveat, w: 600, max: w * 0.9 }); };
const ci = name => COVERS.findIndex(c => c[0] === name);
const PICKS = [
  ['Moth Parliament', 'Eleven songs about one lamp. I counted.'],
  ['Rain Archive', '42 minutes of rain on a tin roof. No drums. Perfect.'],
  ['The Servo Five', 'Robot jazz. The drummer is a washing machine, and the best of them.'],
  ['Tall Order', 'Nine songs, none over a minute. It respects your time.'],
  ['Velvet Thermos', '“It sounds like a scarf.”', 'Juniper', '#f3dcd2'],
];
const WALL = ['The Marigolds', 'Hollow Tide', 'Brass Weather', 'Night Bus Choir', 'Soft Geometry', 'Okay Comet', 'Gull Committee', 'The Slow Hands', 'DJ Lighthouse', 'Aunt Static', 'Paper Boats', 'Fern & the Understory'];

// The sections of the bins: [name on the header, how many columns]
const SECTIONS = {
  i1a: [['NEW ARRIVALS', 2], ['ROCK, MOSTLY', 3]],
  i1b: [['JAZZ', 2], ['ROBOT JAZZ', 3]],
  i2a: [['SOUL & FUNK', 2], ['SAD BUT DANCEABLE', 3]],
  i2b: [['FOLK', 2], ['FIELD RECORDINGS OF RAIN', 3]],
  wall: [['CLASSICAL', 4], ['SOUNDTRACKS TO FILMS THAT DO NOT EXIST', 4]],
};

export default function records(kit, lot) {
  const K = tools(kit, 45), X = fixtures(kit, K), { ves, hcyl, ball, tube, potted } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0), W = lot.W, D = lot.D, FLOOR = lot.fr(kit, 0, 0).h;
  const BAL = D * 0.62;                                         // the balcony line of the real room: shop in front of it, sitting and listening behind
  const SA = Math.min(Math.max(lot.doorA, 7.2), W - 14);        // the listening station stands on the door's axis
  const CA = W - 6.5;                                           // the counter, back right
  let seq = 0;                                                  // which cover comes next when one is wanted

  // A sleeve standing or hanging at (x, y, z = its centre), s square, facing the frame's front.
  const sleeve = (f, x, y, z, i, s = 1.25, o = {}) => { f.box(SPINES[(i * 5 + 3) % SPINES.length], x - s / 2, x + s / 2, y - 0.035, y, z - s / 2, z + s / 2); kit.sign(f, x, y + 0.005, z, s * 0.985, s * 0.985, COVER(i), { cw: o.px ?? 256, ch: o.px ?? 256, rough: 0.6 }); };
  // A run of LPs standing side by side, spines out (on a shelf): x0..x1, backs at y0, on z.
  const spines = (f, x0, x1, y0, z) => { for (let x = x0; x < x1 - 0.05;) { const t = 0.03 + K.rnd() * 0.035; f.box(K.pick(SPINES), x, x + t - 0.005, y0, y0 + 1.03, z + 0.005, z + 1.0 + K.rnd() * 0.04); x += t; } };
  // A row of LPs in a crate or bin, faces to the front: centred on x, from y0 forward to y1, standing on z.
  // The one at the front shows its cover.
  const row = (f, x, y0, y1, z, o = {}) => { let y = y0; const stop = y0 + (y1 - y0) * (o.fill ?? (0.72 + K.rnd() * 0.28));
    while (y < stop) { const t = 0.034 + K.rnd() * 0.03, j = (K.rnd() - 0.5) * 0.05; f.box(K.pick(SPINES), x - 0.515 + j, x + 0.515 + j, y, y + t - 0.006, z + 0.005, z + 1.01 + K.rnd() * 0.035); y += t; }
    kit.sign(f, x, y - 0.002, z + 0.52, 1.02, 1.02, COVER(o.cover ?? seq++), { cw: 128, ch: 128, rough: 0.6 }); };
  // A bank of bins: the browser stands on the +y side. From x0, back at y = 0, 1.5 deep. sections = SECTIONS.*
  const bank = (f, x0, sections, o = {}) => {
    const top = 2.3, dep = 1.5, P = 1.14, n = sections.reduce((a, s) => a + s[1], 0), x1 = x0 + n * P + 0.14, wood = WALNUT;
    f.box(wood, x0, x1, 0.02, dep, top - 0.12, top, G); f.box(wood, x0, x1, dep - 0.06, dep, top, top + 0.42, G); f.box(wood, x0, x1, 0.02, 0.07, 0.3, top + 1.78, G);
    for (const x of [x0, x1 - 0.07]) f.box(wood, x, x + 0.07, 0.02, dep, 0, top + 0.6, G);
    f.box(EBONY, x0 + 0.07, x1 - 0.07, 0.12, dep - 0.1, 0.42, 0.5, G);                                   // the shelf underneath, for overstock
    let x = x0 + 0.07;
    sections.forEach(([name, cols], si) => {
      const w = cols * P;
      kit.sign(f, x + w / 2, 0.075, top + 1.5, w - 0.16, 0.42, HEAD(name, (o.style ?? 0) + si * 2), { cw: Math.round((w - 0.16) * 120), ch: 50, rough: 0.85 });
      if (si) f.box(wood, x - 0.025, x + 0.025, 0.07, dep - 0.06, top, top + 0.75, G);
      for (let k = 0; k < cols; k++) row(f, x + (k + 0.5) * P, 0.12, dep - 0.1, top);
      x += w;
    });
    for (const bx of o.boxes ?? []) { f.box(CARD, bx - 0.6, bx + 0.6, 0.2, dep - 0.18, 0.5, 1.55); f.box('c#a8784a/0.8', bx - 0.6, bx + 0.6, 0.2, dep - 0.18, 1.55, 1.57); }
    f.block(x0, x1, 0, dep, 0, 3.5);
  };

  // ---- two islands of bins, right of the way in, with air between them -------------------------------------
  const IA = W - 11, L = 5 * 1.14 + 0.14, D1 = 10.5, D2 = D1 + 9;
  bank(at(IA, D1, 0, 'street'), -L / 2, SECTIONS.i1a, { style: 0, boxes: [1.6] });
  bank(at(IA, D1, 0, 'back'), -L / 2, SECTIONS.i1b, { style: 2 });
  bank(at(IA, D2, 0, 'street'), -L / 2, SECTIONS.i2a, { style: 0 });
  bank(at(IA, D2, 0, 'back'), -L / 2, SECTIONS.i2b, { style: 2, boxes: [-1.4] });

  // ---- the right wall: one bank, and over it the wall of sleeves -------------------------------------------
  const rw = at(W, (D1 + D2) / 2, 0, 'left');                   // +x runs toward the back of the shop
  bank(rw, -(8 * 1.14 + 0.14) / 2, SECTIONS.wall, { style: 0, boxes: [-2.4, 3.1] });
  for (const z of [4.66, 6.31]) rw.box(WALNUT, -4.8, 4.8, 0.02, 0.22, z - 0.06, z, G);
  WALL.forEach((name, i) => sleeve(rw, -3.95 + (i % 6) * 1.58, 0.1, i < 6 ? 6.98 : 5.33, ci(name), 1.3));

  // ---- staff picks: one ledge on the left wall (the quiet find) ----------------------------------------------
  const sp = at(0, D1 - 0.5, 0, 'right');                       // +x runs toward the street
  sp.box(WALNUT, -4.2, 4.2, 0.02, 0.24, 4.84, 4.9, G);
  kit.sign(sp, 0, 0.03, 6.95, 5.2, 0.56, (g, w, h) => { fill(g, w, h, '#232224'); T(g, 'STAFF PICKS', w * 0.04, h * 0.54, h * 0.8, ORANGE, { f: F.bebas, a: 'left', ls: w * 0.006 }); T(g, '(the staff is Otis)', w * 0.96, h * 0.56, h * 0.5, CREAM, { f: F.caveat, w: 600, a: 'right' }); }, { cw: 560, ch: 60, rough: 0.9 });
  PICKS.forEach(([name, txt, who, c], i) => { const x = 3.4 - i * 1.7, k = ci(name);
    sleeve(sp, x, 0.13, 5.54, k, 1.25, { px: 200 });
    kit.sign(sp, x, 0.03, 4.28, 1.5, 0.98, PICK(k, txt, who, c), { cw: 300, ch: 196, rough: 0.9 }); });

  // ---- the listening station: on the back wall, straight ahead of the door ---------------------------------
  const ls = at(SA, D, 0, 'street'), CT = 2.6;
  ls.box(WALNUT, -3.1, 3.1, 0.02, 1.75, CT - 0.09, CT, G); ls.box(WALNUT, -3.1, 3.1, 0.02, 1.7, 0.6, 0.68, G); ls.box(WALNUT, -3.1, 3.1, 0.02, 0.07, 0.68, CT - 0.09, G);
  for (const x of [-3.1, -1.05, 1.0, 3.04]) ls.box(WALNUT, x, x + 0.06, 0.02, 1.7, 0.6, CT - 0.09, G);
  for (const x of [-2.9, 2.9]) for (const y of [0.2, 1.5]) ls.box(EBONY, x - 0.07, x + 0.07, y - 0.07, y + 0.07, 0, 0.6);
  spines(ls, -3.0, -1.4, 0.3, 0.68); spines(ls, -0.95, 0.3, 0.3, 0.68);
  ls.block(-3.1, 3.1, 0, 1.75, 0, 3.4);
  { // the turntable
    const px = 0.12, py = 0.92;
    ls.soft(WALNUT, -0.85, 0.85, 0.28, 1.6, CT, CT + 0.17, 0.03); ls.box('c#2b2724/0.45', -0.8, 0.8, 0.33, 1.55, CT + 0.17, CT + 0.185);
    ls.cyl(CHROME, px, py, CT + 0.185, CT + 0.255, 0.53, 0.53, 32); ls.cyl(VINYL, px, py, CT + 0.255, CT + 0.268, 0.5, 0.5, 32); ls.cyl(CHROME, px, py, CT + 0.268, CT + 0.32, 0.012, 0.012, 6);
    ls.cyl(CHROME, -0.6, 0.55, CT + 0.185, CT + 0.36, 0.07, 0.06, 12); tube(ls, CHROME, [[-0.62, 0.36, CT + 0.37], [-0.6, 0.55, CT + 0.37], [-0.42, 1.0, CT + 0.34], [-0.3, 1.2, CT + 0.31]], 0.016, 6); ls.cyl(CHROME, -0.62, 0.4, CT + 0.33, CT + 0.41, 0.045, 0.045, 10);
    ls.box('c#17140f/0.45', -0.34, -0.25, 1.16, 1.3, CT + 0.275, CT + 0.32);
    for (const x of [0.52, 0.66]) ls.cyl(CHROME, x, 1.42, CT + 0.185, CT + 0.22, 0.04, 0.04, 10);
    ls.box('glass', -0.85, 0.85, 0.2, 0.25, CT + 0.17, CT + 1.4);                                      // the lid, up
    const [sx, sz] = kit.world(ls, px, py); kit.spots.push({ action: 'record', x: sx, y: ls.h + CT + 0.282, z: sz });
    // amplifier: brushed face, three knobs, a warm dial
    ls.soft(CHROME, 1.05, 2.05, 0.3, 1.45, CT, CT + 0.42, 0.02); ls.box('e#ffd9a0/2.2', 1.15, 1.6, 1.45, 1.46, CT + 0.24, CT + 0.34);
    for (const x of [1.72, 1.86, 1.98]) hcyl(ls, 'c#2b2724/0.45', 'y', x, 1.47, CT + 0.28, 0.05, 0.04);
    // speakers at the ends
    for (const x of [-2.62, 2.62]) { ls.soft(WALNUT, x - 0.42, x + 0.42, 0.3, 1.25, CT, CT + 1.5, 0.03); ls.box('c#2b2724/0.8', x - 0.36, x + 0.36, 1.25, 1.265, CT + 0.06, CT + 1.44); hcyl(ls, 'c#5a5a56/0.45', 'y', x, 1.275, CT + 0.5, 0.02, 0.27, 0.27, 20); hcyl(ls, 'c#17140f/0.45', 'y', x, 1.285, CT + 0.5, 0.02, 0.1, 0.1, 12); hcyl(ls, 'c#5a5a56/0.45', 'y', x, 1.275, CT + 1.12, 0.02, 0.12, 0.12, 14); }
    // a crate of things to put on next
    X.crate(ls, -1.55, 0.95, CT, 1.25, 1.15, 0.6, 'oak_light#b89466'); row(ls, -1.55, 0.45, 1.45, CT + 0.05, { fill: 0.7, cover: ci('Rain Archive') });
    // headphones on a brass hook, and the lead down to the amp
    const hx = 1.55, hz = 4.55;
    hcyl(ls, BRASS, 'y', hx, 0.2, hz + 0.34, 0.38, 0.025); ball(ls, BRASS, hx, 0.4, hz + 0.31, 0.045, 8);
    tube(ls, 'c#17140f/0.45', Array.from({ length: 9 }, (_, i) => { const a = i / 8 * Math.PI; return [hx + Math.cos(a) * 0.32, 0.3, hz + Math.sin(a) * 0.34]; }), 0.028, 6);
    for (const s of [-1, 1]) { hcyl(ls, 'c#17140f/0.45', 'x', hx + s * 0.32, 0.3, hz - 0.08, 0.14, 0.19, 0.19, 16); hcyl(ls, 'c#e0782a/0.45', 'x', hx + s * 0.4, 0.3, hz - 0.08, 0.03, 0.14, 0.14, 14); }
    tube(ls, 'c#17140f/0.45', [[hx - 0.32, 0.3, hz - 0.26], [hx - 0.36, 0.2, 3.9], [hx - 0.2, 0.12, 3.4], [hx - 0.1, 0.2, CT + 0.3]], 0.012, 5);
    ls.box(EBONY, -2.3, 2.3, 0.02, 0.07, 5.6, 7.6, G); kit.sign(ls, 0, 0.075, 6.6, 4.4, 1.8, STATION, { cw: 620, ch: 254, rough: 0.9 });
    X.stool(ls, 0.15, 3.0, 2.2, { label: 'sit and listen', mat: WALNUT });
    kit.mug(ls, 2.25, 1.55, CT, 'c#e0782a/0.3');
  }

  // ---- the corner to sit in: behind the balcony line, on the left, within earshot ---------------------------
  const SD = BAL + 6.5;
  kit.rug(...(() => { const [X0, Y0] = lot.XY(1, SD - 4.6), [X1, Y1] = lot.XY(SA + 3.4, SD + 4.6); return [Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1)]; })(), FLOOR, 'kilim');
  kit.sofa(at(0.12, SD, 0, 'right'), 6.4, 'linen#3f7480', ['linen#c9703f', 'linen#d9b35a', 'linen#c9c0ac']);
  kit.armchair(at(SA + 5.2, SD, 0, 'left'), 'leather#7a5236', 'linen#c9703f');
  { const t = at(5.4, SD, 0, 'right'); kit.table(t, 2.9, 1.7, 1.45, WALNUT); t.block(-1.45, 1.45, -0.85, 0.85, 0, 1.5);
    kit.magazines(t, -0.8, 0.1, 1.45, 3); kit.jarCandle(t, 0.9, 0.3, 1.45); }
  kit.floorLamp(at(1.3, SD + 4.5), 0, 0);
  kit.pottedPlant(R, 1.8, D - 1.8, 0, 'leafy', { size: 1.4 });
  { const lw = at(0, SD, 0, 'right');                           // two gig posters over the sofa
    const hang = (f, x, z, pw, ph, i) => { f.box('c#17140f/0.45', x - pw / 2 - 0.07, x + pw / 2 + 0.07, 0.01, 0.06, z - ph / 2 - 0.07, z + ph / 2 + 0.07); kit.sign(f, x, 0.07, z, pw, ph, POSTERS[i], { cw: Math.round(pw * 140), ch: Math.round(ph * 140), rough: 0.9 }); };
    hang(lw, 1.55, 7.0, 2.4, 3.4, 0); hang(lw, -1.55, 7.0, 2.4, 3.4, 1); }

  // ---- the counter, across the back on the right ------------------------------------------------------------
  const c = at(CA, D - 5.4, 0, 'street');                       // +y is the customers' side; +x runs toward smaller a
  const TOP = X.counter(c, -4.6, 4.6, -2.2, 0, 3.4, { front: EBONY, top: WALNUT });
  { // the till: orange enamel, round keys, a flag
    const x = 0.6, y = -1.15, z = TOP;
    c.soft('c#e0782a/0.45', x - 0.6, x + 0.6, y - 0.55, y + 0.5, z, z + 0.45, 0.05); c.soft('c#e0782a/0.45', x - 0.55, x + 0.55, y - 0.55, y + 0.05, z + 0.45, z + 1.0, 0.07);
    for (let i = 0; i < 12; i++) c.cyl('c#f4f1ea/0.45', x - 0.36 + (i % 4) * 0.24, y + 0.16 + Math.floor(i / 4) * 0.1, z + 0.45, z + 0.5, 0.055, 0.055, 8);
    c.box('c#17140f/0.45', x - 0.43, x + 0.43, y + 0.05, y + 0.062, z + 0.6, z + 0.92);
    hcyl(c, CHROME, 'x', x - 0.68, y - 0.2, z + 0.7, 0.14, 0.03); ball(c, 'c#17140f/0.45', x - 0.78, y - 0.2, z + 0.64, 0.06, 8);
    // a box of 45s and its ticket
    X.crate(c, -3.3, -1.2, z, 1.5, 0.9, 0.42, 'oak_light#b89466');
    for (let x2 = -3.95; x2 < -2.65;) { const t = 0.02 + K.rnd() * 0.02; c.box(K.pick(SPINES), x2, x2 + t - 0.004, -1.5, -0.9, z + 0.055, z + 0.64 + K.rnd() * 0.02); x2 += t; }
    X.card(c, -3.3, -0.5, z, 1.3, 0.42, NOTE('45s · three for a fiver', '#f6efd8', '#2a1c13', { px: 30 }), { cw: 280, ch: 90 });
    X.card(c, -0.9, -0.14, z, 1.9, 0.62, NOTE('Ask Otis what to listen to.\nDo not ask Otis what he thinks of your favourite band.', '#f6efd8', '#2a1c13', { px: 27 }), { cw: 400, ch: 130 });
    // the bell, a few stickers, his mug
    c.cyl(BRASS, 2.0, -0.5, z, z + 0.04, 0.2, 0.18, 16); ves(c, BRASS, 2.0, -0.5, z + 0.04, [[0.17, 0], [0.16, 0.08], [0.1, 0.15], [0, 0.17]], 16); ball(c, BRASS, 2.0, -0.5, z + 0.2, 0.03, 8);
    [[3.3, -0.6], [3.75, -0.95], [3.2, -1.2]].forEach(([x2, y2], k) => kit.sign(c, x2, y2, z + 0.006 + k * 0.002, 0.5, 0.5, STICKER, { flat: true, round: true, cw: 120, ch: 120, turn: k * 0.9 }));
    kit.mug(c, 1.6, -1.6, z, 'c#17140f/0.3', true);
    // painted on the front of the counter
    kit.sign(c, 0, 0.012, 1.95, 3.4, 1.5, (g, w, h) => { fill(g, w, h, '#232224'); ICON.record(g, w * 0.16, h / 2, h * 0.78, CREAM, '#232224'); disc(g, w * 0.16, h / 2, h * 0.1, ORANGE); T(g, 'WE BUY RECORDS', w * 0.62, h * 0.4, h * 0.3, CREAM, { f: F.bebas, ls: 2, max: w * 0.62 }); T(g, 'bring a box', w * 0.62, h * 0.7, h * 0.17, ORANGE, { f: F.caveat, w: 600 }); }, { cw: 420, ch: 186, rough: 0.9 });
  }
  // behind the counter: stock on plain shelves, a plant, the clock
  const b = at(CA, D, 0, 'street');
  X.shelving(b, -4.6, 4.6, [1.4, 2.8, 4.3], { d: 1.15, mat: WALNUT, over: 1.35 });
  spines(b, -4.45, -1.2, 0.07, 2.8); spines(b, 0.6, 4.4, 0.07, 2.8); spines(b, -4.4, 1.8, 0.07, 1.4); spines(b, -4.45, -2.6, 0.07, 4.3);
  potted(b, 3.2, 0.6, 4.3, { r: 0.24, n: 16, len: 1.3, up: 0.3, out: 0.6, droop: 1.3, pot: 'c#e0782a/0.45' });
  kit.model('wall_clock', b, 0, 0.08, 8.6, 0, { hang: true });

  // ---- tapes, on the right wall between the bins and the counter ---------------------------------------------
  const t = at(W, BAL + 4.5, 0, 'left');
  t.box(EBONY, -1.85, 1.85, 0.02, 0.06, 4.45, 7.3, G);
  [4.6, 5.25, 5.9].forEach((z, r) => { t.box(WALNUT, -1.85, 1.85, 0.06, 0.48, z - 0.06, z, G);
    let x = -1.78, n = 0; while (x < 1.7) { if (n % 12 === 5) { kit.pack(t, x + 0.13, 0.36, z, 0.24, 0.06, 0.36, K.pick(SPINES), TAPE(r * 3 + n), { cw: 64, ch: 96 }); x += 0.3; } else { t.box(K.pick(SPINES), x, x + 0.05, 0.1, 0.33, z + 0.004, z + 0.358); x += 0.057; } n++; if (K.rnd() < 0.05) x += 0.25; } });
  kit.sign(t, 0, 0.065, 6.85, 3.5, 0.66, (g, w, h) => { fill(g, w, h, '#232224'); T(g, 'TAPES · 4', w * 0.04, h * 0.55, h * 0.74, ORANGE, { f: F.bebas, a: 'left', ls: 2 }); T(g, 'they hiss because they love you', w * 0.97, h * 0.56, h * 0.4, CREAM, { f: F.caveat, w: 600, a: 'right', max: w * 0.56 }); }, { cw: 400, ch: 76, rough: 0.9 });

  // ---- the window: a stepped display, and a few records on cords ---------------------------------------------
  const v = at(W - 6.7, 4.4, 0, 'street');                      // +y runs toward the glass; +x toward the door
  v.box(EBONY, -6.5, 6.5, 0.02, 4.2, 0, 1.95, G); v.box(EBONY, -6.5, 6.5, 0.02, 1.6, 1.95, 3.05, G); v.block(-6.5, 6.5, 0, 4.25, 0, 3.2);
  const stand = (x, y, z, i, s = 1.25) => { v.box(WALNUT, x - 0.45, x + 0.45, y - 0.2, y + 0.16, z, z + 0.07, G); v.box(WALNUT, x - 0.45, x + 0.45, y + 0.1, y + 0.16, z + 0.07, z + 0.16, G); sleeve(v, x, y + 0.05, z + 0.08 + s / 2, i, s); };
  [[-4.7, 'Hollow Tide'], [0, 'The Marigolds'], [4.7, 'Moth Parliament']].forEach(([x, n]) => stand(x, 0.9, 3.05, ci(n), 1.4));
  stand(-3.4, 2.5, 1.95, ci('Night Bus Choir'), 1.25);
  { // a portable player in an open case, and a plant
    const x = 1.55, y = 2.75, z = 1.95;
    v.soft('c#e0782a/0.45', x - 0.8, x + 0.8, y - 0.6, y + 0.6, z, z + 0.4, 0.05); v.soft('c#e0782a/0.45', x - 0.8, x + 0.8, y - 0.72, y - 0.6, z + 0.1, z + 1.3, 0.04); v.box('c#efe2bc/0.8', x - 0.74, x + 0.74, y - 0.55, y + 0.55, z + 0.4, z + 0.415);
    v.cyl(CHROME, x - 0.12, y, z + 0.415, z + 0.45, 0.46, 0.46, 28); v.cyl(VINYL, x - 0.12, y, z + 0.45, z + 0.462, 0.44, 0.44, 28); v.cyl('c#3c8fa0/0.8', x - 0.12, y, z + 0.462, z + 0.466, 0.15, 0.15, 16);
    tube(v, CHROME, [[x + 0.6, y - 0.4, z + 0.5], [x + 0.5, y, z + 0.5], [x + 0.3, y + 0.22, z + 0.48]], 0.014, 5); v.cyl(CHROME, x + 0.6, y - 0.4, z + 0.415, z + 0.5, 0.05, 0.05, 8);
    hcyl(v, 'c#5a5a56/0.45', 'y', x, y - 0.59, z + 0.8, 0.02, 0.3, 0.3, 18);
    kit.pottedPlant(v, -5.8, 2.9, z, 'snake', { size: 0.9, block: false });
  }
  [[-5.6, 7.6, '#e0782a'], [-2.9, 8.9, '#3c8fa0'], [0, 7.9, '#e8c73a'], [2.8, 9.1, '#f4f1ea'], [5.5, 8.2, '#e88aa8']].forEach(([x, z, col], i) => { const y = 2.3 + (i % 3) * 0.5;
    v.cyl('c#17140f/0.8', x, y, z + 0.5, 12, 0.008, 0.008, 4); hcyl(v, VINYL, 'y', x, y, z, 0.02, 0.5, 0.5, 28); hcyl(v, `c${col}/0.8`, 'y', x, y, z, 0.03, 0.17, 0.17, 16); });

  // ---- lamps ------------------------------------------------------------------------------------------------
  for (const d of [D1, D2]) X.pendant(R, IA, d, { kind: 'dome', drop: 4.4, colour: 'c#17140f/0.45', power: 1.0 });
  for (const a of [CA - 2.6, CA + 2.6]) X.pendant(R, a, D - 4.3, { kind: 'cone', drop: 4.6, colour: 'c#e0782a/0.45', power: 0.9 });
  X.pendant(R, SA + 3.0, D - 2.6, { kind: 'globe', drop: 4.6, power: 1.0 });
  X.pendant(R, 2.6, D1 - 0.5, { kind: 'bulb', drop: 3.2, power: 0.8 });
  X.pendant(R, W - 2.7, (D1 + D2) / 2, { kind: 'bulb', drop: 3.0, power: 0.9 });

  // ---- on the pavement: one dollar crate, and the board -------------------------------------------------------
  const p = K.wrap(lot.frOut(kit, W - 2.8, 0.15, 0, 'street'));  // +y runs out toward the kerb
  p.box(EBONY, -0.95, 0.95, 0.05, 1.45, 0, 0.3, G); p.block(-0.95, 0.95, 0, 1.5, 0, 1.6);
  X.crate(p, 0, 0.75, 0.3, 1.4, 1.3, 0.7, 'oak_light#b89466'); row(p, 0, 0.2, 1.3, 0.35, { fill: 0.8 });
  kit.sign(p, 0, 1.43, 0.72, 1.3, 0.5, NOTE('$1 · all scratched, all loved', '#f6efd8', '#b8452e', { px: 36 }), { cw: 260, ch: 100, rough: 0.9 });
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.4, 5.4, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h, '#1b1b1e'); chalk(g, 'LOW TIDE', w / 2, h * 0.13, h * 0.12, '#f1efe6'); ICON.record(g, w / 2, h * 0.42, h * 0.3, '#f1efe6', '#1b1b1e'); disc(g, w / 2, h * 0.42, h * 0.04, ORANGE); chalk(g, 'come in and listen', w / 2, h * 0.72, h * 0.095, '#e9c46a'); chalk(g, 'it is free', w / 2, h * 0.85, h * 0.085, '#9aa39d'); });

  // ---- Otis --------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'otis', name: 'Otis', lot: 'records', look: { shape: 'squat', colour: '#3b4160', belly: '#efe4cf', trim: '#e0723c', hat: 'beanie', hatColour: '#1d1d1f', headphones: '#e0723c', specs: true, eye: '#ffe2b0', ring: 0xffb07a, tool: 'record', hover: 4.7 },
    home: lot.world(CA, D - 2.2), faces: lot.world(CA, D - 16), posts: [lot.world(CA - 3.4, D - 2.2), lot.world(CA + 3.4, D - 2.2), lot.world(CA, D - 2.2)],
    lines: {
      greet: ['Oh. A customer. No, stay.', 'Welcome to Low Tide. Touch everything. Put it back exactly.'],
      idle: ['*moves one record a millimetre, steps back, nods*', '*hums a bassline, denies it*', 'The needle is fine. I checked.'],
      bye: ['Come back. Bring opinions.', 'Listen to the whole album.'],
      topics: [
        { q: 'What should I listen to?', a: 'Whatever is on the turntable. Then side B.' },
        { q: 'How does the listening station work?', a: 'Back wall. Put a record on, sit down, hear the whole side.' },
        { q: 'Do you buy records?', a: 'Bring a box. I make one small noise, then a fair offer. The noise means nothing.' },
        { q: 'What do you think of The Slow Hands?', a: 'Too quiet.', next: [
          { q: 'So you do not go?', a: 'Every Thursday. I stand at the back.' }] },
        { q: 'Why "Low Tide"?', a: 'That is when the good stuff is left on the beach.' },
      ],
    },
  });
}
