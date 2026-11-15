// Salt & Larder  (north side; 311 Mulberry Street, Madison, Indiana: narrow and deep, 19.75 ft by 42.7)
// An old provisions shop: white tile, dark timber, marble. The left wall is the Wall of Fish, twenty-seven
// feet of tins faced out like paperbacks, shelved to nine feet with a rolling ladder, one card per house in
// Olive's handwriting. Down the right: dry goods, then the long marble counter (cheese under glass, brass
// scales, a cream till, a sardine on toast to try) with the cheese slate, salami and wine on the wall behind.
// Two tables down the middle: bread; lemons and oil. At the back, behind a glazed screen, the tasting room:
// a table laid for the good oil, hams and garlic on a rail, the oil shelves, deliveries, the yard door.
// Outside: three crates of fruit, four buckets of flowers.
import { tools, fixtures, snapMat } from '../shopkit.js';
import { arch } from './arch.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, poly, para, ICON, TAU } from '../draw.js';

const DARK = 'oak_light#5e4332', IRON = 'c#2b2724/0.45/1', OAK = 'oak_light#a3825c', PALE = 'oak_light#c4a477', NAVY = 'painted_wood#26364f', CREAM = 'painted_wood#e6dcc6', RED = 'painted_wood#a8361f';
const PORC = 'c#ebe6dc/0.18', GALV = 'c#c9ccd0/0.45/1', KRAFT = 'c#c9a77a/0.8', CRUST = 'c#a8784a/0.8', CRUST2 = 'c#8a5a2a/0.8', INK = '#1d1b18', PAPER = '#f3ecd6';

// ---- little pictures for labels: (g, x, y, size, colour, background) -------------------------------------
const PIC = {
  fish: (g, x, y, s, c, bg) => ICON.fish(g, x, y, s, c, bg),
  shoal(g, x, y, s, c, bg) { for (const [dx, dy] of [[-0.2, -0.22], [0.16, 0], [-0.14, 0.22]]) ICON.fish(g, x + dx * s, y + dy * s, s * 0.52, c, bg); },
  shell(g, x, y, s, c, bg) {
    g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.moveTo(0, s * 0.42); for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; g.lineTo(Math.cos(a) * s * 0.48, s * 0.06 + Math.sin(a) * s * 0.5); } g.closePath(); g.fill();
    g.strokeStyle = bg; g.lineWidth = s * 0.035; for (let i = 1; i < 8; i++) { const a = Math.PI + i / 8 * Math.PI; g.beginPath(); g.moveTo(0, s * 0.42); g.lineTo(Math.cos(a) * s * 0.44, s * 0.06 + Math.sin(a) * s * 0.46); g.stroke(); } g.restore();
  },
  octo(g, x, y, s, c, bg) {
    g.save(); g.translate(x, y); g.strokeStyle = c; g.lineWidth = s * 0.07; g.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const k = (i - 2.5) / 2.5; g.beginPath(); g.moveTo(k * s * 0.14, 0); g.bezierCurveTo(k * s * 0.5, s * 0.1, k * s * 0.2, s * 0.34, k * s * 0.5, s * 0.44); g.stroke(); }
    g.fillStyle = c; g.beginPath(); g.ellipse(0, -s * 0.14, s * 0.26, s * 0.3, 0, 0, TAU); g.fill(); disc(g, -s * 0.09, -s * 0.1, s * 0.045, bg); disc(g, s * 0.09, -s * 0.1, s * 0.045, bg); g.restore();
  },
  moon(g, x, y, s, c, bg) { disc(g, x, y, s * 0.4, c); disc(g, x + s * 0.17, y - s * 0.1, s * 0.34, bg); for (const [dx, dy] of [[0.3, 0.26], [0.42, -0.02], [-0.5, -0.3]]) ICON.star(g, x + dx * s, y + dy * s, s * 0.16, c); },
  light(g, x, y, s, c, bg) {
    poly(g, [[x - s * 0.16, y + s * 0.46], [x + s * 0.16, y + s * 0.46], [x + s * 0.09, y - s * 0.16], [x - s * 0.09, y - s * 0.16]], c); rect(g, x - s * 0.14, y + s * 0.08, s * 0.28, s * 0.1, bg); rect(g, x - s * 0.11, y - s * 0.34, s * 0.22, s * 0.16, c);
    poly(g, [[x - s * 0.14, y - s * 0.34], [x + s * 0.14, y - s * 0.34], [x, y - s * 0.48]], c); for (const k of [-1, 1]) line(g, [[x + k * s * 0.18, y - s * 0.27], [x + k * s * 0.46, y - s * 0.36]], c, s * 0.04);
  },
  boat(g, x, y, s, c, bg) { poly(g, [[x - s * 0.44, y + s * 0.12], [x + s * 0.44, y + s * 0.12], [x + s * 0.28, y + s * 0.36], [x - s * 0.28, y + s * 0.36]], c); rect(g, x - s * 0.02, y - s * 0.44, s * 0.04, s * 0.56, c); poly(g, [[x + s * 0.05, y - s * 0.42], [x + s * 0.36, y + s * 0.04], [x + s * 0.05, y + s * 0.04]], c); poly(g, [[x - s * 0.05, y - s * 0.3], [x - s * 0.3, y + s * 0.04], [x - s * 0.05, y + s * 0.04]], c); },
  tache(g, x, y, s, c) { g.save(); g.translate(x, y); g.fillStyle = c; for (const k of [-1, 1]) { g.beginPath(); g.moveTo(0, -s * 0.04); g.bezierCurveTo(k * s * 0.2, -s * 0.26, k * s * 0.44, -s * 0.04, k * s * 0.5, -s * 0.24); g.bezierCurveTo(k * s * 0.5, s * 0.16, k * s * 0.16, s * 0.2, 0, s * 0.06); g.fill(); } g.restore(); },
  clam(g, x, y, s, c, bg) { g.save(); g.translate(x, y); g.rotate(-0.35); for (const dy of [-0.14, 0.14]) { rrect(g, -s * 0.48, dy * s - s * 0.09, s * 0.96, s * 0.18, s * 0.08, c); line(g, [[-s * 0.36, dy * s], [s * 0.36, dy * s]], bg, s * 0.025); } g.restore(); },
  squid(g, x, y, s, c, bg) {
    g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.moveTo(0, -s * 0.48); g.quadraticCurveTo(s * 0.26, -s * 0.1, s * 0.14, s * 0.1); g.lineTo(-s * 0.14, s * 0.1); g.quadraticCurveTo(-s * 0.26, -s * 0.1, 0, -s * 0.48); g.fill();
    poly(g, [[0, -s * 0.48], [s * 0.3, -s * 0.2], [-s * 0.3, -s * 0.2]], c); g.strokeStyle = c; g.lineWidth = s * 0.05; g.lineCap = 'round'; for (let i = 0; i < 5; i++) { const k = (i - 2) / 2; g.beginPath(); g.moveTo(k * s * 0.1, s * 0.1); g.quadraticCurveTo(k * s * 0.3, s * 0.3, k * s * 0.16, s * 0.46); g.stroke(); }
    disc(g, -s * 0.06, 0, s * 0.035, bg); disc(g, s * 0.06, 0, s * 0.035, bg); g.restore();
  },
  olive(g, x, y, s, c, bg) { line(g, [[x - s * 0.4, y + s * 0.3], [x + s * 0.4, y - s * 0.3]], c, s * 0.05); for (const [dx, dy, r] of [[-0.2, 0.0, 0.5], [0.05, -0.28, 0.5], [0.2, 0.1, -2.6], [-0.05, 0.36, -2.6]]) { g.save(); g.translate(x + dx * s, y + dy * s); g.rotate(r); g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, s * 0.2, s * 0.07, 0, 0, TAU); g.fill(); g.restore(); } disc(g, x + s * 0.3, y + s * 0.02, s * 0.11, c); disc(g, x + s * 0.33, y - s * 0.01, s * 0.03, bg); },
  sun: (g, x, y, s, c) => ICON.sun(g, x, y, s, c), star: (g, x, y, s, c) => ICON.star(g, x, y, s, c), leaf: (g, x, y, s, c, bg) => ICON.leaf(g, x, y, s, c, bg), loaf: (g, x, y, s, c, bg) => ICON.loaf(g, x, y, s, c, bg),
  hill(g, x, y, s, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x - s * 0.5, y + s * 0.3); g.quadraticCurveTo(x - s * 0.2, y - s * 0.4, x + s * 0.05, y + s * 0.1); g.quadraticCurveTo(x + s * 0.25, y - s * 0.2, x + s * 0.5, y + s * 0.3); g.fill(); disc(g, x + s * 0.3, y - s * 0.3, s * 0.09, c); },
};
const two = s => { const w = s.split(' '); if (w.length < 2) return [s]; let best = 1, bd = 1e9; for (let i = 1; i < w.length; i++) { const d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length); if (d < bd) { bd = d; best = i; } } return [w.slice(0, best).join(' '), w.slice(best).join(' ')]; };

// ---- the tins: fourteen houses, six ways of laying out a lid ----------------------------------------------
const FISH = [
  { n: 'SEREIA SONOLENTA', k: 'SARDINES IN OLIVE OIL', s: 'band', c: ['#1f3a6b', '#f3e6c8', '#e9b93a'], p: 'fish', f: F.abril, note: 'fat, silver, sleepy. on toast, too much butter', pr: '9' },
  { n: 'Bom Dia!', k: 'SARDINHAS · LEMON', s: 'sun', c: ['#f6d04a', '#1f4e8a', '#f9e48e'], p: 'fish', f: F.pacifico, note: 'breakfast sardines. yes, breakfast', pr: '8' },
  { n: 'CAPITÃO BIGODE', k: 'MACKEREL FILLETS', s: 'stripe', c: ['#c8402f', '#f3e6c8', '#1d1b18'], p: 'tache', f: F.bebas, note: 'firm, smoky, slightly bossy', pr: '10' },
  { n: 'Tía Concha', k: 'MUSSELS IN ESCABECHE', s: 'wave', c: ['#f08a2c', '#1d1b18', '#f6c56a'], p: 'shell', f: F.shrikhand, note: 'tangy. eat with crisps. trust me', pr: '12' },
  { n: 'FJORD & FENNEL', k: 'SMOKED TROUT', s: 'check', c: ['#24482f', '#f2b8b0', '#f3ecd6'], p: 'fish', f: F.limelight, note: 'tastes like a cabin holiday', pr: '13' },
  { n: 'OCHO BRAZOS', k: 'OCTOPUS · PAPRIKA OIL', s: 'diag', c: ['#5a2a6a', '#f6d7b8', '#e2583e'], p: 'octo', f: F.archivo, note: 'tender. eight arms, zero regrets', pr: '16' },
  { n: 'Nonna Acciuga', k: 'ANCHOVIES · SALT-PACKED', s: 'band', c: ['#a9d0e0', '#b3261e', '#f6f0dc'], p: 'shoal', f: F.playfair, note: 'melt two in butter. tell no one', pr: '11' },
  { n: 'THE MODEST COD', k: 'SMOKED COD LIVER', s: 'check', c: ['#f1e9d6', '#1d1b18', '#e9b93a'], ink: '#1d1b18', p: 'fish', f: F.elite, note: 'dislikes a fuss. is delicious', pr: '9' },
  { n: 'Luz do Farol', k: 'TUNA BELLY · VENTRESCA', s: 'sun', c: ['#127a78', '#f6d04a', '#0e6466'], p: 'light', f: F.yellowtail, note: 'the good tuna. the VERY good tuna', pr: '18' },
  { n: 'LE PETIT NAUFRAGE', k: 'SARDINES · PIMENT', s: 'wave', c: ['#f2a7b4', '#b3261e', '#f7c4cc'], p: 'boat', f: F.goudy, note: 'spicy. a small shipwreck, the nice kind', pr: '9' },
  { n: 'RAZOR & TIDE', k: 'RAZOR CLAMS IN BRINE', s: 'stripe', c: ['#8fa3ad', '#1f2f3a', '#ef7a3a'], p: 'clam', f: F.dm, note: 'sweet, briny, fancy at parties', pr: '17' },
  { n: 'SPRAT ATTACK', k: 'SMOKED SPRATS', s: 'diag', c: ['#1d1b18', '#f6d04a', '#c8402f'], p: 'shoal', f: F.bebas, note: 'tiny. smoky. gone in a minute', pr: '7' },
  { n: 'Lula Lá', k: 'SQUID IN ITS INK', s: 'band', c: ['#17140f', '#f3ecd6', '#e88aa8'], p: 'squid', f: F.shrikhand, note: 'dramatic. stains everything. worth it', pr: '12' },
  { n: 'COCKLES OF THE MOON', k: 'BERBERECHOS · AU NATUREL', s: 'wave', c: ['#26314a', '#e8e2d4', '#3a4a6e'], p: 'moon', f: F.fraunces, note: 'squeeze of lemon, cold beer, done', pr: '19' },
];
const TIN = b => (g, w, h) => {
  const [c0, c1, c2] = b.c, f = b.f, pic = PIC[b.p], nm = (y, px, col, max = w * 0.84, o = {}) => T(g, b.n, w / 2, y, px, col, { f, max, ...o }), kd = (y, col, max = w * 0.86) => T(g, b.k, w / 2, y, h * 0.1, col, { f: F.bebas, ls: 1, max });
  fill(g, w, h, c0);
  if (b.s === 'band') {
    rrect(g, 5, 5, w - 10, h - 10, 7, null, c2, 2.5); pic(g, w / 2, h * 0.29, h * 0.46, c1, c0); for (const k of [-1, 1]) ICON.star(g, w / 2 + k * w * 0.36, h * 0.29, h * 0.12, c2);
    rect(g, 0, h * 0.53, w, h * 0.27, c1); nm(h * 0.67, h * 0.19, c0); kd(h * 0.89, c2);
  } else if (b.s === 'sun') {
    g.save(); g.translate(w / 2, h * 0.46); g.fillStyle = c2; for (let i = 0; i < 28; i += 2) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, w, i / 28 * TAU, (i + 1) / 28 * TAU); g.closePath(); g.fill(); } g.restore();
    g.beginPath(); g.ellipse(w / 2, h * 0.47, w * 0.41, h * 0.25, 0, 0, TAU); g.fillStyle = c1; g.fill(); nm(h * 0.48, h * 0.24, c0, w * 0.7);
    pic(g, w / 2, h * 0.12, h * 0.2, c1, c0); rect(g, 0, h * 0.8, w, h * 0.2, c1); kd(h * 0.9, c0);
  } else if (b.s === 'stripe') {
    for (let i = 0; i < 12; i++) rect(g, (i + 0.35) * w / 12, 0, w / 40, h, c2); disc(g, h * 0.4, h * 0.4, h * 0.31, c1, c2, 3); pic(g, h * 0.4, h * 0.4, h * 0.44, c0, c1);
    rrect(g, w * 0.46, h * 0.1, w * 0.51, h * 0.6, 5, c1, c2, 2); two(b.n).forEach((s, i, a) => T(g, s, w * 0.715, h * (a.length > 1 ? 0.29 + i * 0.23 : 0.4), h * 0.2, c0, { f, max: w * 0.45 }));
    rect(g, 0, h * 0.78, w, h * 0.22, c2); kd(h * 0.89, c1);
  } else if (b.s === 'wave') {
    const r = h * 0.085; for (let j = 0; j < 4; j++) for (let i = -1; i < w / (r * 2) + 1; i++) disc(g, i * r * 2 + (j % 2) * r, h * 0.62 + j * r * 1.15 + r, r, c2, c1, 1.5);
    nm(h * 0.17, h * (b.n.length > 14 ? 0.15 : 0.22), c1, w * 0.9); pic(g, w / 2, h * 0.43, h * 0.34, c1, c0); rrect(g, w * 0.1, h * 0.76, w * 0.8, h * 0.17, 4, c1); kd(h * 0.85, c0, w * 0.74);
  } else if (b.s === 'check') {
    const s = h / 8, ink = b.ink ?? c0; for (let j = 0; j < 8; j++) for (let i = 0; i < Math.ceil(w / s); i++) if ((i + j) % 2) rect(g, i * s, j * s, s, s, c1);
    rrect(g, s + 2, s + 2, w - 2 * s - 4, h - 2 * s - 4, 4, c2, ink, 2); nm(h * 0.32, h * 0.17, ink, w - 2 * s - 18); pic(g, w / 2, h * 0.56, h * 0.28, ink, c2); kd(h * 0.78, ink, w - 2 * s - 18);
  } else {
    poly(g, [[w, 0], [w, h], [0, h]], c2); pic(g, w * 0.27, h * 0.33, h * 0.52, c1, c0); rrect(g, w * 0.26, h * 0.58, w * 0.7, h * 0.24, 4, c1); T(g, b.n, w * 0.61, h * 0.705, h * 0.19, c0, { f, max: w * 0.64 });
    T(g, b.k, w * 0.96, h * 0.91, h * 0.1, c0 === '#1d1b18' ? c1 : c0, { f: F.bebas, ls: 1, a: 'right', max: w * 0.7 }); ICON.star(g, w * 0.82, h * 0.2, h * 0.2, c1);
  }
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
};
// a shelf-talker: what it is, what it costs, what Olive thinks
const TALK = (head, note, c = PAPER) => (g, w, h) => { paper(g, w, h, c); T(g, head, w / 2, h * 0.27, h * 0.3, '#a8361f', { f: F.bebas, ls: 1, max: w * 0.92 }); T(g, note, w / 2, h * 0.68, h * 0.4, INK, { f: F.caveat, w: 600, max: w * 0.94 }); };
const TAG = (txt, c = PAPER, ink = INK) => (g, w, h) => { paper(g, w, h, c); T(g, txt, w / 2, h / 2, h * 0.44, ink, { f: F.caveat, w: 600, max: w * 0.92 }); };
const TAG2 = (a, b, c = PAPER, ink = INK) => (g, w, h) => { paper(g, w, h, c); T(g, a, w / 2, h * 0.32, h * 0.36, ink, { f: F.fraunces, w: 700, max: w * 0.92 }); T(g, b, w / 2, h * 0.72, h * 0.34, '#a8361f', { f: F.caveat, w: 600, max: w * 0.92 }); };
// a printed front for boxes, bags, tins and bottles
const PACK = (name, sub, c, ink = PAPER, o = {}) => (g, w, h) => {
  fill(g, w, h, c); grain(g, w, h, 0.05); if (o.edge !== false) rrect(g, w * 0.06, h * 0.04, w * 0.88, h * 0.92, 4, null, ink, 1.5);
  if (o.pic) PIC[o.pic](g, w / 2, h * 0.27, Math.min(w * 0.6, h * 0.34), o.acc ?? ink, c);
  const y0 = o.pic ? 0.52 : 0.4, ln = two(name), px = Math.min(h * 0.11, w * 0.2) * (o.big ?? 1); ln.forEach((s, i) => T(g, s, w / 2, h * y0 + i * px * 1.1, px, ink, { f: o.f ?? F.abril, max: w * 0.8 }));
  T(g, sub, w / 2, h * y0 + ln.length * px * 1.1 + px * 0.2, px * 0.6, o.acc ?? ink, { f: F.bebas, ls: 1, max: w * 0.8 }); if (o.foot) T(g, o.foot, w / 2, h * 0.9, px * 0.55, ink, { f: F.fraunces, it: 1, max: w * 0.8 });
};
const LABEL = (name, sub, c, ink, pic) => (g, w, h) => { fill(g, w, h, c); g.strokeStyle = ink; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6); if (pic) PIC[pic](g, w / 2, h * 0.27, w * 0.6, ink, c); two(name).forEach((s, i) => T(g, s, w / 2, h * (pic ? 0.55 : 0.3) + i * h * 0.13, h * 0.12, ink, { f: F.playfair, w: 700, max: w * 0.86 })); T(g, sub, w / 2, h * 0.88, h * 0.085, ink, { f: F.bebas, ls: 1, max: w * 0.86 }); };

const SLATE = (g, w, h) => {
  slate(g, w, h, '#232826', 9); chalk(g, "today's cheese", w * 0.5, h * 0.1, h * 0.13, '#f1efe6'); line(g, [[w * 0.3, h * 0.185], [w * 0.7, h * 0.185]], '#e9c46a', 3);
  [['Old Gregory', 'cheddar, 18 months', '9'], ['Fog Hat', 'goat, ash coat', '11'], ['Tomme de Tuesday', 'mountain cow, nutty', '8'], ['Blue Monday', 'creamy blue', '10'], ['The Little Stinker', 'washed rind (lid stays on)', '12'], ['Sheepish', 'ewe, hard, faint caramel', '10']]
    .forEach(([n, d, p], i) => { const y = h * (0.275 + i * 0.097); chalk(g, n, w * 0.05, y, h * 0.068, ['#e9c46a', '#e8a8a0', '#9fc6b0'][i % 3], { a: 'left' }); chalk(g, d, w * 0.37, y, h * 0.06, '#efe9da', { a: 'left', max: w * 0.5 }); chalk(g, p, w * 0.95, y, h * 0.068, '#efe9da', { a: 'right' }); });
  chalk(g, 'per quarter pound', w * 0.5, h * 0.93, h * 0.05, '#9aa39d', { max: w * 0.92 });
};
const DINNER = (g, w, h) => {
  paper(g, w, h, '#f1e7cf', 13); g.strokeStyle = '#1f3a6b'; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20);
  T(g, "WHAT'S FOR", w / 2, h * 0.065, h * 0.05, '#1f3a6b', { f: F.bebas, ls: 4 }); T(g, 'Dinner?', w / 2, h * 0.14, h * 0.095, '#b3261e', { f: F.shrikhand }); T(g, 'a decision tree, by Olive', w / 2, h * 0.205, h * 0.03, INK, { f: F.fraunces, it: 1 });
  const node = (x, y, s, c = '#1f3a6b', bw = 0.36) => { rrect(g, w * (x - bw / 2), h * (y - 0.032), w * bw, h * 0.064, 8, c); T(g, s, w * x, h * y, h * 0.028, PAPER, { f: F.dm, w: 600, max: w * bw * 0.9 }); };
  const arrow = (x0, y0, x1, y1, s) => { line(g, [[w * x0, h * y0], [w * x1, h * y1]], INK, 2.5); if (s) T(g, s, w * (x0 + x1) / 2 + 16, h * (y0 + y1) / 2, h * 0.03, '#b3261e', { f: F.caveat, w: 700 }); };
  arrow(0.5, 0.3, 0.27, 0.42, 'yes'); arrow(0.5, 0.3, 0.73, 0.42, 'no'); arrow(0.27, 0.45, 0.27, 0.57); arrow(0.73, 0.45, 0.73, 0.57, 'sure?'); arrow(0.27, 0.6, 0.5, 0.74); arrow(0.73, 0.6, 0.5, 0.74);
  node(0.5, 0.28, 'are you tired?'); node(0.27, 0.43, 'tin + toast'); node(0.73, 0.43, 'cook something'); node(0.27, 0.585, 'add a lemon'); node(0.73, 0.585, 'no you are tired');
  rrect(g, w * 0.14, h * 0.71, w * 0.72, h * 0.12, 10, '#b3261e'); T(g, 'TINNED FISH', w / 2, h * 0.757, h * 0.06, PAPER, { f: F.abril, max: w * 0.64 }); T(g, '(all roads lead here)', w / 2, h * 0.805, h * 0.028, PAPER, { f: F.fraunces, it: 1 });
  ICON.fish(g, w / 2, h * 0.895, h * 0.1, '#1f3a6b', '#f1e7cf'); T(g, 'company coming? open two tins.', w / 2, h * 0.957, h * 0.032, INK, { f: F.caveat, w: 700 });
};

export default function grocery(kit, lot) {
  const K = tools(kit, 47), X = fixtures(kit, K), A = arch(kit, lot, K), { ves, hcyl, ball, tube, jar, tin, plate, bowl, bottle, fruit } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0), W = lot.W, D = lot.D;
  const pack = (f, x, y, z, w, d, tall, col, draw, o) => kit.pack(f, x, y, z, w, d, tall, snapMat(col), draw, o);
  // a talker hung from the front edge of a shelf whose top is z and whose front is y
  const talk = (f, x, y, z, w, head, note, c) => kit.sign(f, x, y + 0.05, z - 0.27, w, w * 0.25, TALK(head, note, c), { cw: 224, ch: 56, rough: 0.9 });
  // a bottle with a real label on the front
  const lbottle = (f, x, y, z, o, draw) => { bottle(f, x, y, z, o); const r = o.r ?? 0.11, h = o.h ?? 0.95; kit.sign(f, x, y + r + 0.007, z + h * 0.33, r * 1.5, h * 0.34, draw, { cw: 72, ch: Math.round(72 * h * 0.34 / (r * 1.5)) }); };
  const tinLid = b => `c${b.c[0]}/0.45`;
  // one tin faced out, propped on a short stack of its brothers
  const faced = (f, x, y, z, b, n = 2, s = 1) => { for (let i = 0; i < n; i++) f.box(i % 2 ? 'c#b9b8b2/0.3/1' : tinLid(b), x - 0.3 * s, x + 0.3 * s, y - 0.5, y - 0.09, z + i * 0.1 * s, z + (i + 1) * 0.1 * s - 0.008); pack(f, x, y, z, 0.64 * s, 0.1, 0.43 * s, tinLid(b), TIN(b), { cw: 186, ch: 124 }); };
  // a stack of flat tins; the top lid is drawn where it can be seen from above
  const stack = (f, x, y, z, b, n, s = 1, lid = true) => { for (let i = 0; i < n; i++) f.box(i % 2 ? tinLid(b) : 'c#b9b8b2/0.3/1', x - 0.31 * s, x + 0.31 * s, y - 0.21 * s, y + 0.21 * s, z + i * 0.1, z + i * 0.1 + 0.092); if (lid) kit.sign(f, x, y, z + n * 0.1 - 0.004, 0.6 * s, 0.4 * s, TIN(b), { cw: 132, ch: 88, flat: true }); };

  // a demijohn in its wicker, a plain basket, a barrel
  const demi = (f, x, y, z) => { ves(f, 'c#2f4a2a/0.2', x, y, z, [[0, 0], [0.3, 0], [0.46, 0.25], [0.46, 0.6], [0.2, 0.95], [0.08, 1.05], [0.08, 1.25], [0, 1.25]], 18); ves(f, 'wicker', x, y, z, [[0.31, 0], [0.47, 0.25], [0.47, 0.5], [0.44, 0.5], [0.3, 0.02]], 18); };
  const basket = (f, x, y, z, r = 0.5, h = 0.7) => ves(f, 'wicker', x, y, z, [[0, 0], [r * 0.8, 0], [r, h], [r * 1.04, h], [r * 1.04, h + 0.05], [r * 0.92, h + 0.05], [r * 0.74, 0.07], [0, 0.07]], 16);
  const barrel = (f, x, y) => { ves(f, 'oak_light#8a6a48', x, y, 0.02, [[0, 0], [0.6, 0], [0.72, 0.5], [0.78, 1.3], [0.72, 2.1], [0.6, 2.6], [0.55, 2.6], [0.55, 2.52], [0, 2.52]], 20);
    for (const [z, r] of [[0.28, 0.7], [0.95, 0.775], [1.65, 0.775], [2.3, 0.695]]) f.cyl(IRON, x, y, z, z + 0.09, r, r, 20); f.block(x - 0.7, x + 0.7, y - 0.7, y + 0.7, 0, 2.6); };

  // ---- the plan (a across, d deep) ------------------------------------------------------------------------
  //   d 0 to 3.4     the window steps, either side of the door
  //   d 4.5 to 31.4  the shop: fish down the left wall; dry goods, then the counter, down the right; two tables
  //   d 32.2         the glazed screen, with a wide cased opening on the left
  //   d 32.4 to 42.7 the tasting room
  const BAY = 3.84, NB = 7, FH = BAY * NB / 2, FC = 4.45 + FH;   // the fish wall: seven bays of two houses each
  const CM = 21.5, CH = 7, CE = W - 7.45, OA = W - 3.15;         // the counter: its middle (d), half its length, its customer edge (a), Olive's aisle
  const TA = 6.65, T1 = 11, T2 = 21.4;                           // the tables: their line, the bread, the lemons and oil
  const PD = 32.2, ZT = 3.38;                                    // the screen; the height of the dado

  // ---- THE WALL OF FISH: twenty-seven feet of the left wall, to nine feet ---------------------------------
  const l = at(0, FC, 0, 'right');                             // +x toward the street, +y out into the shop
  const LZ = X.shelving(l, -FH, FH, [1.0, 2.25, 3.5, 4.75, 6.0, 7.35], { d: 1.1, mat: DARK, back: NAVY, over: 1.75, bay: BAY });
  LZ.slice(1, 5).forEach((z, r) => { for (let i = 0; i < 14; i++) { const b = FISH[(i + r * 3) % FISH.length], sx = -FH + 0.96 + i * 1.92;
    faced(l, sx, 0.84, z, b, 2 + (i + r) % 2, 1.3); stack(l, sx - 0.669, 0.62, z, b, 2 + (i * 7 + r * 3) % 3, 0.75, r < 2); stack(l, sx + 0.669, 0.62, z, b, 2 + (i * 5 + r) % 3, 0.75, r < 2);
    if (r === 2) talk(l, sx, 1.1, z, 1.5, `${b.k} · ${b.pr}`, b.note); } });       // one card per house, at eye level
  for (let k = 0; k < NB; k++) { const cx = -FH + BAY * (k + 0.5);
    // the bottom shelf: catering tins, salt cod, anchovies by the jar
    if (k % 3 === 0) for (let i = 0; i < 4; i++) { const b = FISH[(k + i * 3 + 1) % FISH.length]; tin(l, cx - 1.29 + i * 0.86, 0.6, 1.0, 0.33, 0.8, tinLid(b), `c${b.c[1]}/0.5`); }
    else if (k % 3 === 1) for (let i = 0; i < 3; i++) pack(l, cx - 1.05 + i * 1.05, 0.62, 1.0, 0.8, 0.5, 0.42 + (i % 2) * 0.1, 'c#d9cdb2/0.8', PACK('BACALHAU', 'SALT COD · SOAK 2 DAYS', '#e6dcc0', '#1f3a6b', { pic: 'fish', f: F.bebas }), { cw: 150, ch: 90 });
    else for (let i = 0; i < 5; i++) jar(l, cx - 1.24 + i * 0.62, 0.55, 1.0, 0.2, 0.62, K.pick(['c#8a5a2a/0.45', 'c#b8361f/0.45', 'c#6a4a2a/0.45']), 0.85, BRASS);
    // the top shelf, for the ladder: stock in baskets, a crate, the big tins
    const z = LZ[5];
    if (k % 3 === 0) for (const s of [-1, 1]) basket(l, cx + s * 0.9, 0.56, z, 0.5, 0.72);
    else if (k % 3 === 1) { X.crate(l, cx, 0.58, z, 2.6, 0.9, 0.85); l.box('c#6a4a2a/0.8', cx - 1.22, cx + 1.22, 0.19, 0.97, z + 0.06, z + 0.6); }
    else for (let i = 0; i < 3; i++) { const b = FISH[(k * 2 + i * 4) % FISH.length]; tin(l, cx - 1 + i, 0.58, z, 0.38, 0.95, tinLid(b), `c${b.c[1]}/0.5`); }
  }
  // the ladder, on its rail
  { const lx = -FH + BAY, RY = 1.36, RZ = 8.62;
    hcyl(l, IRON, 'x', 0, RY, RZ, 2 * FH, 0.035); for (let i = 0; i <= NB; i++) { const x = -FH + i * BAY; l.box(IRON, x - 0.03, x + 0.03, 1.06, RY, RZ - 0.03, RZ + 0.03); }
    for (const s of [-1, 1]) { tube(l, OAK, [[lx + s * 0.6, 3.0, 0.16], [lx + s * 0.6, 1.43, 8.87]], 0.065, 8, true); hcyl(l, IRON, 'x', lx + s * 0.6, 3.0, 0.15, 0.1, 0.13, 0.13, 12); hcyl(l, BRASS, 'x', lx + s * 0.6, RY, RZ, 0.14, 0.09, 0.09, 10); }
    for (let k = 1; k <= 8; k++) { const t = k / 9; hcyl(l, OAK, 'x', lx, 3.0 - 1.57 * t, 0.16 + 8.71 * t, 1.2, 0.04); }
    l.block(lx - 0.75, lx + 0.75, 1.1, 3.15, 0, 7); }
  // the name of the wall, sign-painted above it
  kit.sign(l, 0, 0.03, 10.15, 14.5, 1.3, (g, w, h) => { board(g, w, h, '#1f3a6b', '#e9b93a', { inset: h * 0.08 }); T(g, 'THE WALL OF FISH', w / 2, h * 0.5, h * 0.56, '#f3e6c8', { f: F.abril, ls: h * 0.05, shadow: '#b3261e' });
    ICON.fish(g, h * 0.9, h * 0.5, h * 0.6, '#e9b93a', '#1f3a6b'); g.save(); g.translate(w - h * 0.9, h * 0.5); g.scale(-1, 1); ICON.fish(g, 0, 0, h * 0.6, '#e9b93a', '#1f3a6b'); g.restore(); }, { cw: 1280, ch: 116 });

  // ---- the counter: down the right of the shop, customers on the left of it ----------------------------
  const c = at(CE, CM, 0, 'left');                             // +x toward the back; +y is the customers' side
  const TOP = X.counter(c, -CH, CH, -2.6, 0, 3.4, { front: DARK, top: 'marble' });
  // the cheese case (the slate behind says what is what)
  X.glassCase(c, -6.9, -1.5, -1.85, -0.25, TOP, 1.35, { shelf: 0.7 });
  { const z = TOP + 0.03, z2 = TOP + 0.7, Y = -1.0;
    c.cyl('c#d9b35a/0.8', -6.45, Y, z, z + 0.3, 0.42, 0.42, 24); c.cyl('c#e8c73a/0.8', -6.45, Y + 0.34, z + 0.3, z + 0.52, 0.3, 0.3, 3);
    c.cyl('c#9a9590/0.8', -5.4, Y, z, z + 0.2, 0.26, 0.24, 18); c.cyl('c#9a9590/0.8', -5.2, Y + 0.5, z, z + 0.2, 0.2, 0.19, 18); c.cyl('c#f4f1ea/0.8', -5.6, Y + 0.48, z, z + 0.19, 0.24, 0.24, 3);
    c.cyl('c#b08a5a/0.8', -4.35, Y - 0.05, z, z + 0.26, 0.4, 0.4, 24); c.cyl('c#b08a5a/0.8', -4.35, Y - 0.05, z + 0.26, z + 0.5, 0.38, 0.38, 24);
    c.cyl('c#c9d6d8/0.8', -3.3, Y, z, z + 0.34, 0.3, 0.3, 20); c.cyl('c#9fb0d8/0.8', -3.1, Y + 0.48, z, z + 0.3, 0.26, 0.26, 3);
    ves(c, 'glass', -2.3, Y, z, [[0.34, 0], [0.34, 0.3], [0.2, 0.5], [0.04, 0.54], [0, 0.54]], 18); c.cyl('c#e0782a/0.8', -2.3, Y, z, z + 0.16, 0.26, 0.26, 18);
    // the upper shelf: saucisson, a terrine, the sheep, coppa
    for (let i = 0; i < 4; i++) hcyl(c, i % 2 ? 'c#8a1c1c/0.8' : 'c#6a4a2a/0.8', 'x', -6.15 + (i % 2) * 0.12, Y - 0.2 + i * 0.2, z2 + 0.1, 0.95, 0.09, 0.09, 10);
    c.soft('c#b08a5a/0.8', -4.95, -4.05, Y - 0.25, Y + 0.25, z2, z2 + 0.28, 0.04); c.box('c#e8907a/0.8', -4.07, -4.04, Y - 0.2, Y + 0.2, z2 + 0.03, z2 + 0.25);
    c.cyl('c#c9a77a/0.8', -3.25, Y, z2, z2 + 0.3, 0.36, 0.36, 22);
    plate(c, -2.05, Y + 0.04, z2 - 0.045, 0.42); for (let i = 0; i < 6; i++) c.cyl(i % 2 ? 'c#8a1c1c/0.8' : 'c#b8361f/0.8', -2.25 + (i % 3) * 0.2, Y - 0.08 + Math.floor(i / 3) * 0.22, z2 + 0.012, z2 + 0.022, 0.1, 0.1, 12);
  }
  // the brass scales
  kit.model('st_brass_scales', c, -0.5, -1.1, TOP, 0, { scale: 1.25 });
  // the till: a real one, cream enamel gone grey at the corners (Poly Haven's CashRegister_01, CC0), at four-fifths
  // of its scanned size so it does not hide Olive; its keys and drawer toward her (-y), and against its back, for
  // the customer, a card
  { const x = 1.5, y = -1.2, z = TOP;
    kit.model('CashRegister_01', c, x, y, z, 2, { scale: 0.8 });
    X.card(c, x, y + 0.78, z, 0.8, 0.3, (g, w, h) => { fill(g, w, h, '#a8361f'); T(g, 'TA VERY MUCH', w / 2, h / 2, h * 0.46, '#f3ecd6', { f: F.bebas, ls: 2 }); }, { cw: 176, ch: 64 });
  }
  // brown paper on a roll; and the find: sardines on toast, on a board, one of them yours
  { const z = TOP, px = 3.9;
    for (const s of [-1, 1]) c.box('c#2b2724/0.45/1', px + s * 0.85 - 0.03, px + s * 0.85 + 0.03, -2.2, -1.9, z, z + 0.5); hcyl(c, 'c#2b2724/0.45/1', 'x', px, -2.05, z + 0.42, 1.76, 0.02); hcyl(c, KRAFT, 'x', px, -2.05, z + 0.42, 1.5, 0.22, 0.22, 18);
    c.box(KRAFT, px - 0.75, px + 0.75, -1.86, -1.3, z + 0.006, z + 0.014); c.box(KRAFT, px - 0.75, px + 0.75, -1.86, -1.84, z + 0.014, z + 0.36);
    // a parcel already wrapped, tied with string
    c.soft(KRAFT, 3.5, 4.3, -1.62, -1.38, z + 0.016, z + 0.3, 0.03); c.box('c#d9cdb2/0.8', 3.88, 3.92, -1.63, -1.37, z + 0.02, z + 0.305); c.box('c#d9cdb2/0.8', 3.49, 4.31, -1.52, -1.48, z + 0.02, z + 0.305);
    kit.model('wooden_cutting_board', c, px, -0.6, z, 0);
    for (const dx of [-0.42, 0.42]) { c.box('c#c9a060/0.9', px + dx - 0.15, px + dx + 0.15, -0.7, -0.5, z + 0.14, z + 0.18); hcyl(c, 'c#9aa4a8/0.35/0.3', 'x', px + dx, -0.6, z + 0.2, 0.24, 0.035, 0.035, 6); }
    X.card(c, px + 0.95, -0.45, z, 0.7, 0.36, (g, w, h) => { paper(g, w, h, PAPER); T(g, 'try me', w / 2, h * 0.5, h * 0.56, '#a8361f', { f: F.pacifico }); }, { cw: 180, ch: 92 });
    const [ex, ez] = kit.world(c, px, -0.6); kit.eats.push({ x: ex, y: c.h + z + 0.15, z: ez, name: 'sardine on toast', bites: 2, reach: 7, note: 'A sardine on toast. Olive was right.', build: T3 => { const g = new T3.Group(), toast = new T3.Mesh(new T3.BoxGeometry(0.3, 0.04, 0.2), new T3.MeshStandardMaterial({ color: 0xc9a060, roughness: 0.9 })), fish = new T3.Mesh(new T3.SphereGeometry(0.07, 8, 6), new T3.MeshStandardMaterial({ color: 0x9aa4a8, roughness: 0.35, metalness: 0.3 })); fish.scale.set(1.9, 0.35, 0.6); fish.position.y = 0.04; g.add(toast, fish); return g; } });
  }
  for (const x of [-5.3, -0.1, 5.1]) X.pendant(c, x, -1.0, { kind: 'dome', drop: 4.6, colour: 'c#b8361f/0.35', power: 1.0 });

  // ---- behind the counter, on the right wall: the cheese slate with salami under it, and the wine --------
  const b = at(W, CM, 0, 'left');
  b.box(DARK, -CH, CH, 0.02, 1.4, 0, 3.3, G); b.box('marble', -CH - 0.1, CH + 0.1, 0.02, 1.5, 3.3, 3.4); b.block(-CH, CH, 0, 1.5, 0, 3.4);
  X.shelving(b, 0.3, CH, [4.75, 6.15, 7.55], { d: 1.05, mat: DARK, over: 1.55, back: false, block: false, th: 0.08, bay: 3.35 });
  b.box(DARK, -CH - 0.33, 0.25, 0.01, 0.32, 9.1, 9.2, G);      // the cornice carries on over the slate
  { const WINE = [['Mardi', 'VIN DE SOIF', '#f3ecd6', '#b3261e', 'sun'], ['The Long Lunch', 'ROSÉ · DRY', '#f2b8b0', '#5a2a1c', 'boat'], ['Polvo Preto', 'TINTO · UNFILTERED', '#17140f', '#e9b93a', 'octo'], ['Fizz, Probably', 'PÉT-NAT', '#a9d0e0', '#1f3a6b', 'moon'], ['Nonno’s Red', 'MONTE-SOMETHING', '#b3261e', '#f3ecd6', 'hill']];
    const GLASSC = ['c#2f4a2a/0.2', 'c#2f4a2a/0.2', 'c#3a2214/0.2', 'c#e8907a/0.2', 'c#17140f/0.2'];
    [4.75, 6.15].forEach((z, r) => { for (let i = 0; i < 14; i++) { const k = (Math.floor(i / 3) + r * 2) % 5, w = WINE[k]; lbottle(b, (i < 7 ? 0.75 : 1.11) + i * 0.42, 0.55, z, { r: 0.125, h: 1.08, col: GLASSC[k], cap: k % 2 ? 'c#8a1c1c/0.45' : 'c#c9952a/0.45', neck: 0.04 }, LABEL(w[0], w[1], w[2], w[3], w[4])); } });
    for (const x of [1.3, 2.7, 4.6, 6.0]) demi(b, x, 0.55, 7.55);
  }
  X.slateBoard(b, -3.5, 6.6, 7.0, 3.7, SLATE, { cw: 880, ch: 465 });
  hcyl(b, BRASS, 'x', -3.6, 0.55, 5.0, 5.8, 0.03); for (const x of [-6.4, -0.8]) b.box(BRASS, x - 0.03, x + 0.03, 0.02, 0.57, 4.97, 5.03);
  for (let i = 0; i < 8; i++) { const x = -5.2 + i * 0.55 + (i % 2) * 0.05, len = 0.75 + (i * 37 % 5) * 0.09; b.cyl('c#d9cdb2/0.8', x, 0.55, 5.0 - 0.22, 5.0, 0.008, 0.008, 4); b.cyl(['c#8a1c1c/0.8', 'c#6a4a2a/0.8', 'c#b8361f/0.8', 'c#e8e2d4/0.8'][i % 4], x, 0.55, 4.78 - len, 4.78, 0.085 + (i % 3) * 0.015, 0.085 + (i % 3) * 0.015, 10); }
  // the red slicer, cornichons, a stack of paper
  { const z = 3.4; b.soft('c#c8202a/0.2', -6.9, -5.7, 0.3, 1.2, z, z + 0.42, 0.06); b.soft('c#c8202a/0.2', -6.8, -6.3, 0.35, 0.9, z + 0.42, z + 0.95, 0.06); hcyl(b, 'c#d4d6d8/0.12/1', 'x', -6.22, 0.7, z + 0.72, 0.04, 0.36, 0.36, 24); b.box('c#d4d6d8/0.12/1', -6.1, -5.72, 0.35, 1.15, z + 0.42, z + 0.47);
    for (let i = 0; i < 4; i++) jar(b, -4.6 + i * 0.48, 0.5, z, 0.18, 0.5, i % 2 ? 'c#5d8a3a/0.45' : 'c#7fa04a/0.45', 0.85, BRASS);
    for (let k = 0; k < 8; k++) b.box(KRAFT, -1.6, -0.7, 0.3, 1.1, z + k * 0.012, z + k * 0.012 + 0.01); }

  // ---- the right wall by the window: dry goods -----------------------------------------------------------
  const r = at(W, 9.1, 0, 'left');                             // +x toward the back of the shop
  X.shelving(r, -5, 5, [1.1, 2.5, 3.9, 5.3, 6.6, 7.9], { d: 1.15, mat: DARK, back: false, over: 1.2, bay: 5 });
  { // tea tins and big jars of pulses
    const TEA = [['Slow Afternoon', 'SMOKY BLACK', '#26314a', '#e9b93a', 'sun'], ['Aunt Bergamot', 'EARL GREY', '#9fb0d8', '#26314a', 'leaf'], ['Mint Condition', 'PEPPERMINT', '#4a6e38', '#f3ecd6', 'leaf']];
    for (let i = 0; i < 6; i++) { const t = TEA[Math.floor(i / 2)]; pack(r, -4.55 + i * 0.6, 0.6, 6.6, 0.48, 0.48, 0.62, `c${t[2]}/0.45`, PACK(t[0], t[1], t[2], t[3], { pic: t[4], f: F.playfair }), { cw: 104, ch: 134 }); }
    for (let i = 0; i < 6; i++) jar(r, 0.5 + i * 0.78, 0.6, 6.6, 0.3, 0.8, ['c#d9b35a/0.8', 'c#8a1c1c/0.8', 'c#5d8a3a/0.8', 'c#f4f1ea/0.8', 'c#3a2214/0.8', 'c#e0782a/0.8'][i], 0.55 + (i % 3) * 0.15, BRASS);
    // pasta, salt
    const PASTA = [['RIGATONI', '#1f4e8a'], ['BUCATINI', '#b3261e'], ['ORECCHIETTE', '#4a6e38'], ['PACCHERI', '#e0782a']];
    for (let i = 0; i < 8; i++) { const p = PASTA[Math.floor(i / 2)]; pack(r, -4.55 + i * 0.6, 0.62, 5.3, 0.54, 0.24, 1.0, 'c#d9b35a/0.8', (g, w, h) => { fill(g, w, h, '#e3c27a'); grain(g, w, h, 0.05); rect(g, 0, 0, w, h * 0.5, p[1]); T(g, 'PASTIFICIO', w / 2, h * 0.1, h * 0.07, PAPER, { f: F.bebas, ls: 2 }); T(g, 'Distratto', w / 2, h * 0.22, h * 0.12, PAPER, { f: F.yellowtail, max: w * 0.9 }); T(g, p[0], w / 2, h * 0.38, h * 0.085, PAPER, { f: F.abril, max: w * 0.88 }); for (const x of [0.2, 0.4, 0.6, 0.8]) for (let j = 0; j < 5; j++) rrect(g, w * x - 5, h * (0.55 + j * 0.085), 10, h * 0.06, 3, '#c9952a'); }, { cw: 104, ch: 192 }); }
    for (const jx of [0.9, 1.4]) { jar(r, jx, 0.6, 5.3, 0.2, 1.05, null, 0, BRASS); for (let k = 0; k < 7; k++) r.cyl('c#d9b35a/0.8', jx + Math.cos(k) * 0.09, 0.6 + Math.sin(k) * 0.09, 5.32, 6.2, 0.02, 0.02, 4); }
    for (let i = 0; i < 4; i++) pack(r, 2.7 + i * 0.62, 0.62, 5.3, 0.46, 0.34, 0.66, i % 2 ? 'c#26364f/0.8' : 'c#f4f1ea/0.8', PACK(i % 2 ? 'Grey Salt' : 'Flaky Salt', i % 2 ? 'DAMP · MINERAL' : 'SEA SALT', i % 2 ? '#26314a' : '#f3ecd6', i % 2 ? '#f3ecd6' : '#26314a', { f: F.abril }), { cw: 96, ch: 138 });
    // jam and honey, tinned tomatoes
    const JAM = ['c#4a2240/0.45', 'c#e0782a/0.45', 'c#c8202a/0.45', 'c#c9952a/0.45', 'c#e8c73a/0.45'];
    for (let i = 0; i < 10; i++) jar(r, -4.6 + i * 0.47, 0.62, 3.9, 0.19, 0.5, JAM[Math.floor(i / 2)], 0.9, BRASS);
    for (let i = 0; i < 8; i++) tin(r, 0.9 + i * 0.47, 0.62 - (i % 2) * 0.1, 3.9, 0.2, 0.52, 'c#c8202a/0.45', i % 3 ? 'c#f3d96a/0.45' : 'c#4a6e38/0.45');
    // biscuit tins, passata
    for (let i = 0; i < 4; i++) for (let k = 0; k < 3 - (i % 2); k++) tin(r, -4.3 + i * 0.72, 0.62, 2.5 + k * 0.27, 0.32, 0.26, ['c#26364f/0.45', 'c#e88aa8/0.45', 'c#d9b35a/0.45'][(i + k) % 3], 'c#f4f1ea/0.45');
    for (let i = 0; i < 5; i++) bottle(r, 1.2 + i * 0.45, 0.6, 2.5, { r: 0.16, h: 1.1, col: 'c#8a1c1c/0.2', cap: 'c#c9952a/0.45', label: 'c#efe2bc/0.8' });
    // flour sacks and a crate of onions below
    for (let i = 0; i < 3; i++) r.soft('linen#d8ccb4', -4.8 + i * 1.1, -3.85 + i * 1.1, 0.2, 0.9, 1.1, 2.0, 0.12);
    X.crate(r, 1.1, 0.62, 1.1, 1.6, 1.0, 0.7); r.box('c#6a4a2a/0.8', 0.35, 1.85, 0.16, 1.08, 1.16, 1.5); for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) fruit(r, (i + j) % 3 ? 'potato' : 'onion', 0.5 + i * 0.3, 0.33 + j * 0.29, 1.5);
    // out of reach: baskets and two demijohns
    for (const x of [-4.2, -2.9, -1.6]) basket(r, x, 0.58, 7.9, 0.52, 0.7); for (const x of [1.6, 3.2]) demi(r, x, 0.58, 7.9);
  }

  // ---- two tables down the middle ------------------------------------------------------------------------
  // bread, and nothing else
  const m = at(TA, T1, 0, 'street');                           // long the way the shop is long; +y toward the door
  const MT = X.plinth(m, 0, 0, 3.2, 6.4, 2.7, { mat: PALE, shelf: 0.85 });
  { const z = MT;
    // a tall basket of baguettes at the far end
    ves(m, 'wicker', 0.6, -2.5, z, [[0, 0], [0.34, 0], [0.42, 0.9], [0.44, 0.9], [0.44, 0.94], [0.38, 0.94], [0.3, 0.06], [0, 0.06]], 16);
    for (let i = 0; i < 6; i++) { const a = i * 1.05, dx = Math.cos(a) * 0.14, dy = Math.sin(a) * 0.14; tube(m, i % 2 ? CRUST : 'c#b08a5a/0.8', [[0.6 + dx * 0.5, -2.5 + dy * 0.5, z + 0.1], [0.6 + dx, -2.5 + dy, z + 1.0], [0.6 + dx * 2.2, -2.5 + dy * 2.2, z + 2.0 + (i % 3) * 0.12]], t => 0.035 + 0.075 * Math.sin(Math.PI * Math.min(0.96, 0.08 + t * 0.9)) ** 0.5, 8, true); }
    // a tray of round loaves
    m.box('wicker', -1.1, 1.1, -1.7, 0.3, z, z + 0.06); for (const [x0, x1, y0, y1] of [[-1.1, 1.1, -1.7, -1.64], [-1.1, 1.1, 0.24, 0.3], [-1.1, -1.04, -1.7, 0.3], [1.04, 1.1, -1.7, 0.3]]) m.box('wicker', x0, x1, y0, y1, z + 0.06, z + 0.3);
    for (const [x, y, rr, col] of [[-0.5, -1.15, 0.4, CRUST], [0.5, -1.1, 0.42, CRUST2], [-0.4, -0.3, 0.42, 'c#b08a5a/0.8'], [0.6, -0.25, 0.3, CRUST]]) { ball(m, col, x, y, z + 0.05, rr, 16, 0.62); for (const k of [-0.12, 0, 0.12]) m.box('c#e8e2d4/0.8', x - rr * 0.5, x + rr * 0.5, y + k - 0.012, y + k + 0.012, z + 0.05 + rr * 1.2, z + 0.05 + rr * 1.245 - Math.abs(k) * 0.12); }
    // buns on a board; the end nearest the door is left bare but for the one card
    kit.model('wooden_cutting_board', m, 0, 1.2, z, 0); kit.model('hamburger_buns', m, 0, 1.2, z + 0.13, 0);
    X.card(m, 0, 2.7, z, 1.4, 0.42, TAG2('country loaf · 7', 'still warm. it is always still warm.'), { cw: 280, ch: 84 });
    // under the table: a crate of apples
    X.crate(m, 0, -1.3, 0.85, 1.7, 1.2, 0.7); m.box('c#6a4a2a/0.8', -0.8, 0.8, -1.85, -0.75, 0.92, 1.2); for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) fruit(m, 'apple', -0.62 + i * 0.31, -1.75 + j * 0.3, 1.2);
  }
  // lemons, and the good oil
  const EST = [['Quinta da Lua Nova', 'EXTRA VIRGIN · DOURO', '#17140f', '#e9b93a', 'moon'], ['Frantoio Zia Pina', 'NOVELLO · UNFILTERED', '#e9dcae', '#3a5a2a', 'olive'], ['Hermanos Olvido', 'PICUAL · FIRST COLD PRESS', '#b3261e', '#f6d04a', 'sun'], ['The Other Hill', 'ONE GROVE', '#4a6e38', '#f3ecd6', 'hill']];
  const lab = e => LABEL(e[0], e[1], e[2], e[3], e[4]);
  const n = at(TA, T2, 0, 'street');
  { const z = X.plinth(n, 0, 0, 3.2, 6.0, 2.7, { mat: PALE, shelf: 0.85 });
    X.crate(n, 0, 1.85, z, 2.3, 1.5, 0.6); n.box('c#6a4a2a/0.8', -1.1, 1.1, 1.15, 2.55, z + 0.06, z + 0.36);
    for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) fruit(n, 'lemon', -0.93 + i * 0.31, 1.4 + j * 0.3, z + 0.36); for (let i = 0; i < 8; i++) fruit(n, 'lemon', -0.75 + (i % 4) * 0.5, 1.7 + Math.floor(i / 4) * 0.34, z + 0.53);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) { const e = EST[(i + j) % 4]; lbottle(n, -1.0 + i * 0.5, 0.2 - j * 0.45, z, { r: 0.13, h: 1.15, col: 'c#2f4a2a/0.2', cap: 'c#c9952a/0.45', neck: 0.04 }, lab(e)); }
    X.card(n, 0, 0.62, z, 1.5, 0.42, TAG2('Lua Nova · 28', 'peppery. makes you cough. correct'), { cw: 300, ch: 84 });
    for (let i = 0; i < 3; i++) { const e = EST[i + 1]; pack(n, -0.95 + i * 0.95, -2.2, z, 0.8, 0.5, 1.15, `c${e[2]}/0.45`, PACK(e[0], '3 LITRES', e[2], e[3], { pic: e[4], f: F.playfair }), { cw: 150, ch: 215 }); }
    X.crate(n, 0, 0.9, 0.85, 1.7, 1.2, 0.7); n.box('c#6a4a2a/0.8', -0.8, 0.8, 0.35, 1.45, 0.92, 1.2); for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) fruit(n, 'orange', -0.62 + i * 0.31, 0.45 + j * 0.3, 1.2);
  }
  // two barrels under the screen
  barrel(R, 10.3, 30.8); barrel(R, 12.2, 30.8);

  // ---- the glazed screen, and the dado -----------------------------------------------------------------
  const P = A.partition(PD, { mat: 'tile_subway', trim: DARK, openings: [{ a0: 4, a1: 8, z1: 8.2 }, { a0: 9.2, a1: 19, z0: 3.5, z1: 8.2, glass: true, bars: 5 }] });
  const DADO = { h: ZT, mat: DARK, style: 'panel' };
  A.wainscot({ d: P.front, side: 'front' }, 1.2, 3.62, DADO); A.wainscot({ d: P.front, side: 'front' }, 8.38, W - 0.21, DADO); A.wainscot('right', CM + CH + 0.25, P.front - 0.005, DADO);
  A.wainscot({ d: P.back, side: 'back' }, 0.21, 3.62, DADO); A.wainscot({ d: P.back, side: 'back' }, 8.38, W - 0.02, DADO);
  A.wainscot('left', P.back + 0.005, D - 0.01, DADO); A.wainscot('back', 0.21, 4.22, DADO); A.wainscot('back', 8.06, W - 0.02, DADO);

  // ---- THE TASTING ROOM ------------------------------------------------------------------------------------
  // the good oil on the right wall, with a ledge for dipping bread
  const o = at(W, 37.5, 0, 'left');
  X.shelving(o, -4.6, 4.6, [1.1, 2.9, 4.45, 5.95, 7.45], { d: 1.15, mat: DARK, back: false, over: 1.65, bay: 4.6 });
  {
    for (let i = 0; i < 11; i++) { const e = EST[Math.floor(i / 3) % 4]; lbottle(o, -4.2 + i * 0.8, 0.6, 5.95, { r: 0.13, h: 1.15, col: 'c#2f4a2a/0.2', cap: 'c#c9952a/0.45', neck: 0.04 }, lab(e)); }
    for (let i = 0; i < 5; i++) { const e = EST[(i + 2) % 4]; pack(o, -4.1 + i * 0.86, 0.62, 4.45, 0.6, 0.36, 0.9, `c${e[2]}/0.45`, PACK(e[0], e[1], e[2], e[3], { pic: e[4], f: F.playfair, foot: '500 ml' }), { cw: 126, ch: 190 }); o.cyl(BRASS, -4.1 + i * 0.86 - 0.18, 0.62, 5.35, 5.4, 0.05, 0.05, 8); }
    const VIN = [['Nonno Lento', 'BALSAMIC · 12 YEARS', '#3a2214', '#e9b93a', 'c#3a2214/0.2'], ['La Suegra', 'SHERRY VINEGAR', '#f6d04a', '#b3261e', 'c#8a5a2a/0.2']];
    for (let i = 0; i < 6; i++) { const v = VIN[Math.floor(i / 3)]; lbottle(o, 0.9 + i * 0.56, 0.6, 4.45, { r: 0.115, h: 0.9, col: v[4], cap: 'c#17140f/0.45' }, LABEL(v[0], v[1], v[2], v[3])); }
    // the tasting ledge: bread on a board, a saucer of oil, the bottle
    const z = 2.9; kit.model('wooden_cutting_board', o, -1.2, 0.62, z, 0); kit.model('st_bread_1', o, -1.5, 0.62, z + 0.13, 0, { turn: 0.5 }); for (let i = 0; i < 5; i++) o.box(i % 2 ? 'c#e8e2d4/0.8' : 'c#d9cdb2/0.8', -1.0 + i * 0.09, -0.93 + i * 0.09, 0.42, 0.82, z + 0.14, z + 0.2 + (i % 2) * 0.02);
    plate(o, 0.45, 0.66, z, 0.3); o.cyl('c#7fa04a/0.2', 0.45, 0.66, z + 0.032, z + 0.04, 0.2, 0.2, 18);
    bottle(o, 1.1, 0.5, z, { r: 0.11, h: 0.95, col: 'c#2f4a2a/0.2', label: 'c#efe2bc/0.8' });
    { const [ex, ez] = kit.world(o, -2.62, 0.6); kit.eats.push({ x: ex, y: o.h + z + 0.15, z: ez, name: 'bread dipped in the good oil', label: 'dip some bread in the good oil', bites: 2, reach: 7, note: 'Peppery, green, a little cough at the end.', build: T3 => { const m = new T3.Mesh(new T3.SphereGeometry(0.12, 8, 6), new T3.MeshStandardMaterial({ color: 0xd9b878, roughness: 0.95 })); m.scale.set(1.3, 0.7, 0.9); return m; } }); }
    X.card(o, -2.62, 1.0, z, 0.9, 0.36, (g, w, h) => { paper(g, w, h, PAPER); T(g, 'dip. go on.', w / 2, h * 0.5, h * 0.5, '#3a5a2a', { f: F.pacifico, max: w * 0.9 }); }, { cw: 230, ch: 92 });
    for (let i = 0; i < 4; i++) jar(o, 2.4 + i * 0.5, 0.55, z, 0.19, 0.55, i % 2 ? 'c#4a6e38/0.45' : 'c#4a2240/0.45', 0.85, BRASS);
    // big tins and a demijohn below
    for (let i = 0; i < 4; i++) { const e = EST[i]; pack(o, -3.9 + i * 1.0, 0.62, 1.1, 0.8, 0.5, 1.15, `c${e[2]}/0.45`, PACK(e[0], '3 LITRES', e[2], e[3], { pic: e[4], f: F.playfair }), { cw: 150, ch: 215 }); }
    for (const x of [1.2, 2.5]) demi(o, x, 0.6, 1.1);
    for (const x of [-3.4, -1.9]) basket(o, x, 0.58, 7.45, 0.52, 0.7); for (const x of [1.4, 2.9]) demi(o, x, 0.58, 7.45);
  }

  // the table, laid for tasting: bread, saucers of oil, butter under a cloche, the ham on its stand
  const tt = at(11.6, 37.4, 0, 'street');                      // +x toward smaller a, +y toward the screen
  { const [X0, Y0] = lot.XY(7.4, 34.3), [X1, Y1] = lot.XY(15.8, 40.5); kit.rug(Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1), R.h, 'kilim'); }
  { const z = X.plinth(tt, 0, 0, 6.0, 3.0, 2.5, { mat: DARK }), zr = z + 0.016;
    tt.box('linen#d8ccb4', -2.85, 2.85, -0.5, 0.5, z + 0.004, zr);
    for (const sx of [-1.5, 1.5]) for (const sy of [-1, 1]) { plate(tt, sx, sy * 1.02, z, 0.36); K.glass(tt, sx - 0.55, sy * 0.85, z, 0.1, 0.4); plate(tt, sx + 0.55, sy * 0.85, z, 0.17); tt.cyl('c#7fa04a/0.2', sx + 0.55, sy * 0.85, z + 0.022, z + 0.03, 0.11, 0.11, 14); X.stool(tt, sx, sy * 2.2, 1.6, { mat: DARK }); }
    plate(tt, -2.3, 0, zr, 0.42); tt.soft('c#f3d96a/0.8', -2.55, -2.05, -0.16, 0.16, zr + 0.05, zr + 0.25, 0.03); ves(tt, 'glass', -2.3, 0, zr + 0.05, [[0.38, 0], [0.38, 0.3], [0.24, 0.52], [0.05, 0.58], [0.05, 0.66], [0, 0.66]], 18);
    kit.candle(tt, -1.5, 0, zr); kit.candle(tt, 0.72, 0, zr);
    tt.box(OAK, -1.15, 0.0, -0.36, 0.36, zr, zr + 0.07, G); ball(tt, CRUST, -0.72, 0.02, zr + 0.07, 0.3, 14, 0.6); for (let i = 0; i < 4; i++) tt.box(i % 2 ? 'c#e8e2d4/0.8' : 'c#d9cdb2/0.8', -0.34 + i * 0.07, -0.29 + i * 0.07, -0.2, 0.2, zr + 0.07, zr + 0.3 + (i % 2) * 0.02);
    bottle(tt, 0.22, 0.1, zr, { r: 0.11, h: 0.95, col: 'c#2f4a2a/0.2', cap: 'c#c9952a/0.45', label: 'c#efe2bc/0.8' });
    // jamón on its stand
    tt.box('fir#3a2c24', 1.05, 2.75, -0.35, 0.35, zr, zr + 0.08); tt.box('fir#3a2c24', 2.55, 2.65, -0.1, 0.1, zr + 0.08, zr + 0.85); tube(tt, 'c#8a5a2a/0.45', [[1.15, 0, zr + 0.28], [1.65, 0, zr + 0.36], [2.2, 0, zr + 0.55], [2.6, 0, zr + 0.88]], t => 0.03 + 0.2 * Math.sin(Math.PI * Math.min(1, (1 - t) * 1.25)) ** 0.8, 10, true);
    X.pendant(tt, 0, 0, { kind: 'dome', drop: 4.9, colour: 'c#b8361f/0.35', power: 1.0 });
  }
  // hams and garlic on a rail behind the screen, where the shop can see them
  { const y = P.back + 0.75, RZ = 9.3; hcyl(R, IRON, 'x', 13.9, y, RZ, 9.0, 0.03); for (const a of [9.7, 18.1]) R.cyl(IRON, a, y, RZ, 11.98, 0.025, 0.025, 6);
    for (let i = 0; i < 8; i++) { const a = 10.2 + i * 1.06; R.cyl('c#c9a77a/0.8', a, y, RZ - 0.32, RZ, 0.012, 0.012, 4);
      if (i % 2 === 0) ves(R, i % 4 ? 'c#7a4a2a/0.55' : 'c#8a5a2a/0.55', a, y, RZ - 2.4, [[0, 0], [0.26, 0.06], [0.4, 0.45], [0.4, 0.9], [0.26, 1.45], [0.1, 1.9], [0.06, 2.1], [0, 2.1]], 14);
      else if (i === 3) for (let j = 0; j < 10; j++) ball(R, j % 3 ? 'c#b3261e/0.5' : 'c#8a1c1c/0.5', a + Math.cos(j * 2.4) * 0.07, y + Math.sin(j * 2.4) * 0.07, RZ - 0.45 - j * 0.14, 0.055, 6, 2.2);
      else for (let j = 0; j < 9; j++) ball(R, 'c#ece4d0/0.8', a + (j % 2 ? 0.08 : -0.08), y + (j % 3 - 1) * 0.04, RZ - 0.5 - j * 0.17, 0.12, 8, 0.9); } }
  // on the left wall: Olive's decision tree; deliveries in the corner by the yard door
  const pl = at(0, 36.6, 0, 'right'); pl.box('c#17140f/0.5', -1.68, 1.68, 0.01, 0.07, 4.02, 8.58); kit.sign(pl, 0, 0.08, 6.3, 3.2, 4.4, DINNER, { cw: 450, ch: 620 });
  { const q = at(0, 40.5, 0, 'right'); const BOX = s => (g, w, h) => { fill(g, w, h, '#c2a070'); grain(g, w, h, 0.08); T(g, s, w / 2, h * 0.5, h * 0.26, INK, { f: F.elite, max: w * 0.9 }); };
    ['SARDINES', 'MORE SARDINES', 'NOT SARDINES'].forEach((s, i) => pack(q, (i % 2) * 0.15, 1.1, 0.02 + i * 1.0, 1.9, 1.5, 0.98, KRAFT, BOX(s), { cw: 240, ch: 124 })); q.block(-1, 1.1, 0, 1.9, 0, 3.1); }
  // the back wall: the yard door (311's own, left of middle) and the scullery window
  { const k = at(W - (0.68 * (W + 1) - 0.5), D, 0, 'street');            // the door itself is real: town.js cuts the doorway (3.1 wide, 6.95 high) and hangs it; this is its casing
    for (const s of [-1, 1]) k.box(DARK, s > 0 ? 1.55 : -1.9, s > 0 ? 1.9 : -1.55, 0.004, 0.1, 0.004, 6.95, G); k.box(DARK, -1.9, 1.9, 0.004, 0.1, 6.95, 7.5, G);
    const v = at(14.0, D, 0, 'street');
    for (const s of [-1, 1]) v.box(DARK, s > 0 ? 1.5 : -1.78, s > 0 ? 1.78 : -1.5, 0.004, 0.1, 4.6, 8.6, G); v.box(DARK, -1.78, 1.78, 0.004, 0.1, 8.6, 8.88, G); v.box(DARK, -1.9, 1.9, 0.004, 0.32, 4.48, 4.6, G);
    v.box('c#6f828c/0.3', -1.5, 1.5, 0.006, 0.02, 4.6, 8.6); v.box(DARK, -1.5, 1.5, 0.02, 0.07, 6.56, 6.64, G); for (const x of [-0.5, 0.5]) v.box(DARK, x - 0.025, x + 0.025, 0.02, 0.06, 4.6, 8.6, G); v.box(DARK, -1.5, 1.5, 0.02, 0.06, 7.58, 7.63, G);
    hcyl(v, BRASS, 'x', 0, 0.16, 6.5, 3.1, 0.02); for (let i = 0; i < 10; i++) v.box('linen#e6dcc6', -1.48 + i * 0.297, -1.2 + i * 0.297, 0.1 + (i % 2) * 0.05, 0.14 + (i % 2) * 0.05, 4.66, 6.5);
  }

  // ---- the window displays (seen from the street: everything faces out) -----------------------------------
  const TW = 3;                                                // half the width of a window step
  const tiers = f => { f.box(CREAM, -TW, TW, 0.0, 1.1, 0, 3.5, G); f.box(CREAM, -TW, TW, 1.1, 2.1, 0, 2.9, G); f.box(CREAM, -TW, TW, 2.1, 3.02, 0, 2.3, G); for (const [y, z] of [[1.1, 3.5], [2.1, 2.9], [3.02, 2.3]]) f.box(RED, -TW - 0.02, TW + 0.02, y - 0.02, y + 0.02, z - 0.12, z + 0.012); f.block(-TW, TW, 0, 3.05, 0, 3.5); };
  // left of the door: the tins, a bowl of lemons
  const wl = at(TW + 0.5, 3.4, 0, 'street'); tiers(wl);
  { for (let i = 0; i < 5; i++) { faced(wl, -2.2 + i * 1.1, 0.75, 3.5, FISH[i], 3, 1.5); faced(wl, -2.2 + i * 1.1, 1.75, 2.9, FISH[i + 5], 2, 1.5); }
    for (let i = 0; i < 3; i++) lbottle(wl, -0.5 + i * 0.5, 2.55, 2.3, { r: 0.14, h: 1.3, col: 'c#2f4a2a/0.2', cap: 'c#c9952a/0.45', neck: 0.04 }, LABEL(['Lua Nova', 'Zia Pina', 'Other Hill'][i], 'EXTRA VIRGIN', ['#17140f', '#e9dcae', '#4a6e38'][i], ['#e9b93a', '#3a5a2a', '#f3ecd6'][i], ['moon', 'olive', 'hill'][i]));
    bowl(wl, 2.2, 2.55, 2.3, 0.45, 0.26, 'c#2f5a6a/0.45'); for (let i = 0; i < 7; i++) fruit(wl, 'lemon', 2.2 + Math.cos(i) * 0.2, 2.55 + Math.sin(i) * 0.2, 2.4 + (i % 2) * 0.1);
    kit.posy(wl, -2.3, 2.55, 2.3, ['c#f3d96a/0.8', 'c#e0782a/0.8', 'c#f4f1ea/0.8']);
  }
  // right of the door: bread, cheese, a few bottles, and the hours
  const wr = at(W - TW - 0.5, 3.4, 0, 'street'); tiers(wr);
  { const z = 3.5;
    ves(wr, 'wicker', 2.2, 0.55, z, [[0, 0], [0.36, 0], [0.45, 0.9], [0.47, 0.94], [0.4, 0.94], [0.32, 0.06], [0, 0.06]], 16); for (let i = 0; i < 6; i++) { const a = i * 1.05, dx = Math.cos(a) * 0.14, dy = Math.sin(a) * 0.14; tube(wr, i % 2 ? CRUST : 'c#b08a5a/0.8', [[2.2 + dx * 0.5, 0.55 + dy * 0.5, z + 0.1], [2.2 + dx, 0.55 + dy, z + 1.0], [2.2 + dx * 2.2, 0.55 + dy * 2.2, z + 2.0 + (i % 3) * 0.12]], t => 0.035 + 0.075 * Math.sin(Math.PI * Math.min(0.96, 0.08 + t * 0.9)) ** 0.5, 8, true); }
    wr.box('fir#3a2c24', -2.5, 0.7, 0.2, 0.3, z, z + 1.7); kit.sign(wr, -0.9, 0.31, z + 0.85, 3.0, 1.5, (g, w, h) => { slate(g, w, h); chalk(g, 'OPEN', w / 2, h * 0.25, h * 0.3, '#e9c46a'); chalk(g, 'from nearly evening', w / 2, h * 0.58, h * 0.16); chalk(g, 'until slightly later', w / 2, h * 0.8, h * 0.16); }, { cw: 400, ch: 200, rough: 0.95 });
    // cheese and loaves on the middle step
    wr.cyl('c#d9b35a/0.8', -2.1, 1.6, 2.9, 3.25, 0.46, 0.46, 24); wr.cyl('c#b08a5a/0.8', -2.1, 1.6, 3.25, 3.52, 0.36, 0.36, 22); wr.cyl('c#9a9590/0.8', -2.1, 1.6, 3.52, 3.72, 0.24, 0.22, 18); wr.cyl('c#e8c73a/0.8', -1.2, 1.75, 2.9, 3.2, 0.34, 0.34, 3);
    for (const [x, rr, col] of [[0.7, 0.44, CRUST2], [1.8, 0.4, CRUST]]) ball(wr, col, x, 1.6, 2.9, rr, 16, 0.62);
    // wine along the front
    const WN = [['Mardi', 'VIN DE SOIF', '#f3ecd6', '#b3261e', 'sun'], ['Polvo Preto', 'TINTO', '#17140f', '#e9b93a', 'octo'], ['Fizz, Probably', 'PÉT-NAT', '#a9d0e0', '#1f3a6b', 'moon']];
    for (let i = 0; i < 5; i++) lbottle(wr, -2.4 + i * 0.5, 2.55, 2.3, { r: 0.14, h: 1.25, col: i % 2 ? 'c#3a2214/0.2' : 'c#2f4a2a/0.2', cap: 'c#8a1c1c/0.45', neck: 0.04 }, LABEL(...WN[i % 3]));
    kit.posy(wr, 2.2, 2.55, 2.3, ['c#e88aa8/0.8', 'c#c8202a/0.8', 'c#f4f1ea/0.8']);
  }

  // ---- lamps: a line of globes over the tables, the red domes over the counter (and one over the tasting table)
  for (const d of [11, 16.2, 21.4, 26.6]) X.pendant(R, TA, d, { kind: 'globe', drop: 4.0, power: 0.85 });

  // ---- out on the pavement, under the awning ---------------------------------------------------------------
  // three crates of fruit on a bench, left of the door
  const ps = K.wrap(lot.frOut(kit, 3.6, 0.25, 0, 'street'));    // +y toward the kerb, +x toward smaller a
  { ps.box(OAK, -2.9, 2.9, 0.05, 1.55, 1.08, 1.2, G); for (const x of [-2.7, 2.7]) { ps.box(OAK, x - 0.07, x + 0.07, 0.1, 0.24, 0, 1.08, G); ps.box(OAK, x - 0.07, x + 0.07, 1.36, 1.5, 0, 1.08, G); } ps.block(-2.9, 2.9, 0, 1.6, 0, 2.6);
    ['lemon', 'orange', 'apple'].forEach((kind, i) => { const x = -1.9 + i * 1.9, y = 0.8, z = 1.2, s = 0.3;
      X.crate(ps, x, y, z, 1.7, 1.3, 0.72); ps.box('c#6a4a2a/0.8', x - 0.8, x + 0.8, y - 0.6, y + 0.6, z + 0.06, z + 0.5);
      for (let p = 0; p < 5; p++) for (let q = 0; q < 3; q++) fruit(ps, kind, x - 0.6 + p * s, y - 0.3 + q * s, z + 0.5); for (let p = 0; p < 4; p += 2) fruit(ps, kind, x - 0.3 + p * s, y + (p % 4 ? 0.14 : -0.14), z + 0.5 + s * 0.6); });
  }
  // the flowers: four buckets, the other side of the door
  const pf = K.wrap(lot.frOut(kit, W - 3.6, 0.25, 0, 'street'));
  { const bucket = (x, y, z, cols, tall = 1) => {
      ves(pf, GALV, x, y, z, [[0, 0], [0.3, 0], [0.42, 0.86], [0.44, 0.86], [0.44, 0.9], [0.39, 0.9], [0.28, 0.08], [0, 0.08]], 14);
      K.leaves(pf, x, y, z + 0.7, { n: 9, len: 1.1 * tall, w: 0.07, up: 1.0, out: 0.5, droop: 0.25, spread: 0.2 });
      for (let i = 0; i < 10; i++) { const a = i * 2.4, rr = 0.1 + (i % 5) * 0.085, hh = (1.25 + (i * 7 % 6) * 0.11) * tall, hx = x + Math.cos(a) * rr * 1.25, hy = y + Math.sin(a) * rr * 1.25, col = cols[i % cols.length];
        tube(pf, 'c#4a6e38/0.8', [[x + Math.cos(a) * rr * 0.3, y + Math.sin(a) * rr * 0.3, z + 0.2], [hx, hy, z + hh + 0.6]], 0.012, 4);
        if (tall > 1.2) for (let k = 0; k < 3; k++) ball(pf, col, hx, hy, z + hh + 0.3 + k * 0.15, 0.075 - k * 0.014, 6); else ball(pf, col, hx, hy, z + hh + 0.55, 0.11, 7, 0.75); } };
    pf.box(OAK, -2.6, 2.6, 0.05, 1.3, 0.9, 1.0, G); for (const x of [-2.4, 2.4]) pf.box(OAK, x - 0.07, x + 0.07, 0.1, 1.25, 0, 0.9, G); pf.block(-2.6, 2.6, 0, 2.6, 0, 2.6);
    const P = [['c#e88aa8/0.8', 'c#f4f1ea/0.8'], ['c#f3d96a/0.8', 'c#e0782a/0.8'], ['c#8a5ab0/0.8', 'c#9fb0d8/0.8'], ['c#c8202a/0.8', 'c#e8907a/0.8']];
    bucket(-1.4, 0.7, 1.0, P[2], 1.35); bucket(1.4, 0.7, 1.0, P[0], 1); bucket(-1.9, 2.0, 0.02, P[1], 1); bucket(0.3, 2.0, 0.02, P[3], 1.3);
    pf.cyl('c#c9a77a/0.8', 1.8, 2.0, 0, 1.3, 0.012, 0.012, 4); kit.sign(pf, 1.8, 2.02, 1.35, 1.05, 0.34, (g, w, h) => { slate(g, w, h); chalk(g, 'whatever is nice · 8', w / 2, h / 2, h * 0.5, '#f1efe6', { max: w * 0.92 }); }, { cw: 200, ch: 66, rough: 0.95 });
  }
  X.aBoard(K.wrap(lot.frOut(kit, W - 6.95, 2.3, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h); chalk(g, 'tonight', w / 2, h * 0.12, h * 0.09, '#e9c46a', { max: w * 0.9 }); ICON.fish(g, w / 2, h * 0.3, h * 0.2, '#f1efe6', '#252a28'); chalk(g, 'sardines on toast', w / 2, h * 0.5, h * 0.098, '#f1efe6', { max: w * 0.9 }); chalk(g, 'a lemon · good butter', w / 2, h * 0.65, h * 0.08, '#e8a8a0', { max: w * 0.9 }); chalk(g, 'a glass of the red', w / 2, h * 0.78, h * 0.08, '#9fc6b0', { max: w * 0.9 }); });

  // ---- Olive ---------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'olive', name: 'Olive', lot: 'grocery', look: { shape: 'round', colour: '#6f7f3f', belly: '#efe4cf', trim: '#c9a45c', hat: 'straw', hatColour: '#a8361f', apron: '#e9dfc8', eye: '#ffe2b0', ring: 0xf6d04a, blush: true, tool: 'fish', hover: 4.7 },
    home: lot.world(OA, CM), faces: lot.world(CE - 3, CM), posts: [lot.world(OA, CM - 4.5), lot.world(OA, CM + 4.5), lot.world(OA, CM)],
    lines: {
      greet: ['Evening, nearly. I have a tin for you.', 'Come in. Dinner is already decided.', 'Hello. Mind the lemons.'],
      idle: ['*turns one tin a quarter inch to face the door*', '*weighs a single olive. nods.*', 'Someone asked for tuna in spring water. I gave them a moment.'],
      bye: ['Butter the toast right to the edges.', 'Come back and tell me how the tin was.'],
      topics: [
        { q: 'What should I have for dinner?', a: 'Sardines on toast, half a lemon. There is one on the counter.', next: [
          { q: 'And if I want to cook?', a: 'Bucatini, two anchovies melted in oil. The sardines will wait.' }] },
        { q: 'Why so much tinned fish?', a: 'It is the only food that improves while you ignore it.', next: [
          { q: 'Which is the best one?', a: 'Luz do Farol, the tuna belly. Do not look at the price.' }] },
        { q: 'Tell me about the oil.', a: 'The Lua Nova makes you cough a little. That is the good part. There is bread on the ledge, in the back.' },
        { q: 'What goes with this cheese?', a: 'Old Gregory wants an apple and a quiet evening.' },
        { q: 'Is your name really Olive?', a: 'It was O-11V on the crate. The baker read it sideways.' },
      ],
    },
  });
}
