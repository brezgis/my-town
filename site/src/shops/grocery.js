// Salt & Larder  (north side, 33 ft wide by 28.7 deep)
// A fancy little grocer. The whole left wall is tinned fish, faced out like paperbacks, every tin
// with a shelf-talker in Olive's handwriting. The counter runs across the back: a glass case of
// cheese with flags in, brass scales, a cream till, brown paper and string, a plate that says
// "try me". Behind it the wine (with notes), a slate of today's cheese, salami on a rail. Good oil
// on the back wall to the left with a saucer for dipping; dry goods down the right wall; bread and
// chocolate on the table in the middle. Outside, under the awning: crates of fruit, buckets of flowers.
// Olive is behind the counter and has already decided what you are having for dinner.
import { tools, fixtures, snapMat } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, poly, para, ICON, TAU } from '../draw.js';

const OAK = 'oak_light#a3825c', PALE = 'oak_light#c4a477', NAVY = 'painted_wood#26364f', CREAM = 'painted_wood#e6dcc6', RED = 'painted_wood#a8361f';
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
  cat(g, x, y, s, c, bg) { g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.ellipse(0, s * 0.16, s * 0.24, s * 0.3, 0, 0, TAU); g.fill(); disc(g, 0, -s * 0.2, s * 0.18, c); poly(g, [[-s * 0.17, -s * 0.26], [-s * 0.15, -s * 0.46], [-s * 0.02, -s * 0.34]], c); poly(g, [[s * 0.17, -s * 0.26], [s * 0.15, -s * 0.46], [s * 0.02, -s * 0.34]], c); g.strokeStyle = c; g.lineWidth = s * 0.07; g.lineCap = 'round'; g.beginPath(); g.moveTo(s * 0.2, s * 0.38); g.quadraticCurveTo(s * 0.5, s * 0.36, s * 0.4, s * 0.06); g.stroke(); disc(g, -s * 0.07, -s * 0.22, s * 0.03, bg); disc(g, s * 0.07, -s * 0.22, s * 0.03, bg); g.restore(); },
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
const CHOC = (name, pct, c, ink, c2) => (g, w, h) => { fill(g, w, h, c); for (let i = -4; i < 12; i++) poly(g, [[i * w / 5, h], [i * w / 5 + w / 10, h], [i * w / 5 + w / 10 + h * 0.3, h * 0.72], [i * w / 5 + h * 0.3, h * 0.72]], c2); rect(g, 0, 0, w, h * 0.08, c2); rrect(g, w * 0.1, h * 0.16, w * 0.8, h * 0.44, 4, ink); two(name).forEach((s, i, a) => T(g, s, w / 2, h * (a.length > 1 ? 0.29 + i * 0.13 : 0.36), h * 0.1, c, { f: F.shrikhand, max: w * 0.72 })); T(g, pct, w / 2, h * 0.52, h * 0.06, c, { f: F.bebas, ls: 1, max: w * 0.72 }); };

const SLATE = (g, w, h) => {
  slate(g, w, h, '#232826', 9); chalk(g, "today's cheese", w * 0.5, h * 0.1, h * 0.13, '#f1efe6'); line(g, [[w * 0.3, h * 0.185], [w * 0.7, h * 0.185]], '#e9c46a', 3);
  [['Old Gregory', 'cheddar, 18 months, opinionated', '9'], ['Fog Hat', 'goat, ash coat, soft heart', '11'], ['Tomme de Tuesday', 'mountain cow, nutty, calm', '8'], ['Blue Monday', 'creamy blue, forgives everything', '10'], ['The Little Stinker', 'washed rind (lid stays ON)', '12'], ['Sheepish', 'ewe, hard, faintly caramel', '10']]
    .forEach(([n, d, p], i) => { const y = h * (0.275 + i * 0.097); chalk(g, n, w * 0.05, y, h * 0.068, ['#e9c46a', '#e8a8a0', '#9fc6b0'][i % 3], { a: 'left' }); chalk(g, d, w * 0.37, y, h * 0.06, '#efe9da', { a: 'left', max: w * 0.5 }); chalk(g, p, w * 0.95, y, h * 0.068, '#efe9da', { a: 'right' }); });
  chalk(g, 'per quarter pound · ask for a taste · Olive will insist anyway', w * 0.5, h * 0.93, h * 0.05, '#9aa39d', { max: w * 0.92 });
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
  const K = tools(kit, 47), X = fixtures(kit, K), { ves, hcyl, ball, tube, jar, tin, plate, bowl, bottle, fruit } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0), W = lot.W, D = lot.D;
  const pack = (f, x, y, z, w, d, tall, col, draw, o) => kit.pack(f, x, y, z, w, d, tall, snapMat(col), draw, o);
  // a talker hung from the front edge of a shelf whose top is z and whose front is y
  const talk = (f, x, y, z, w, head, note, c) => kit.sign(f, x, y + 0.05, z - 0.27, w, w * 0.25, TALK(head, note, c), { cw: 224, ch: 56, rough: 0.9 });
  // a bottle with a real label on the front
  const lbottle = (f, x, y, z, o, draw) => { bottle(f, x, y, z, o); const r = o.r ?? 0.11, h = o.h ?? 0.95; kit.sign(f, x, y + r + 0.007, z + h * 0.33, r * 1.5, h * 0.34, draw, { cw: 72, ch: Math.round(72 * h * 0.34 / (r * 1.5)) }); };
  const tinLid = b => `c${b.c[0]}/0.45`;
  // one tin faced out, propped on a short stack of its brothers
  const faced = (f, x, y, z, b, n = 3, s = 1) => { for (let i = 0; i < n; i++) f.box(i % 2 ? 'c#b9b8b2/0.3/1' : tinLid(b), x - 0.3 * s, x + 0.3 * s, y - 0.5, y - 0.09, z + i * 0.1 * s, z + (i + 1) * 0.1 * s - 0.008); pack(f, x, y, z, 0.64 * s, 0.1, 0.43 * s, tinLid(b), TIN(b), { cw: 186, ch: 124 }); };
  // a stack of flat tins, the top lid showing
  const stack = (f, x, y, z, b, n, s = 1) => { for (let i = 0; i < n; i++) f.box(i % 2 ? tinLid(b) : 'c#b9b8b2/0.3/1', x - 0.31 * s, x + 0.31 * s, y - 0.21 * s, y + 0.21 * s, z + i * 0.1, z + i * 0.1 + 0.092); kit.sign(f, x, y, z + n * 0.1 - 0.004, 0.6 * s, 0.4 * s, TIN(b), { cw: 132, ch: 88, flat: true }); };

  // ---- THE WALL OF FISH: the whole left wall ----------------------------------------------------------
  const l = at(0, 13.6, 0, 'right');                           // +x toward the street, +y out into the shop
  const LZ = X.shelving(l, -8.45, 8.45, [1.0, 2.25, 3.5, 4.75, 6.0], { d: 1.1, mat: OAK, back: NAVY, over: 1.15, bay: 4.2 });
  LZ.slice(1).forEach((z, r) => { for (let i = 0; i < 12; i++) { const b = FISH[(i + r * 3) % FISH.length], sx = -7.7 + i * 1.4;
    faced(l, sx + 0.29, 0.84, z, b, 2 + (i + r) % 3, 1.2); stack(l, sx - 0.41, 0.62, z, b, 2 + (i * 7 + r * 3) % 4, 0.87);
    talk(l, sx, 1.1, z, 1.26, `${b.k} · ${b.pr}`, b.note); } });
  // the bottom shelf: catering tins, salt cod, anchovies by the jar
  for (let i = 0; i < 7; i++) { const b = FISH[(i * 3 + 1) % FISH.length]; tin(l, -7.6 + i * 0.86, 0.6, 1.0, 0.33, 0.8, tinLid(b), `c${b.c[1]}/0.5`); }
  for (let i = 0; i < 4; i++) pack(l, -1.0 + i * 0.95, 0.62, 1.0, 0.8, 0.5, 0.42 + (i % 2) * 0.1, 'c#d9cdb2/0.8', PACK('BACALHAU', 'SALT COD · SOAK 2 DAYS', '#e6dcc0', '#1f3a6b', { pic: 'fish', f: F.bebas }), { cw: 150, ch: 90 });
  for (let i = 0; i < 9; i++) jar(l, 3.2 + i * 0.58, 0.55, 1.0, 0.2, 0.62, K.pick(['c#8a5a2a/0.45', 'c#b8361f/0.45', 'c#6a4a2a/0.45']), 0.85, BRASS);
  talk(l, 5.5, 1.1, 1.0, 1.6, 'ANCHOVIES BY THE JAR · 14', 'for people who have stopped pretending');
  // on the floor under it: a crate of lemons, because of course
  X.crate(l, -6.6, 1.9, 0.02, 1.5, 1.0, 0.75); l.box('c#6a4a2a/0.8', -7.3, -5.9, 1.45, 2.35, 0.08, 0.45); for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) fruit(l, 'lemon', -7.16 + i * 0.28, 1.62 + j * 0.28, 0.45); for (let i = 0; i < 6; i++) fruit(l, 'lemon', -7.0 + (i % 3) * 0.4, 1.76 + Math.floor(i / 3) * 0.28, 0.62);
  X.card(l, -6.6, 2.5, 0.78, 1.1, 0.34, TAG('a lemon. you will need one.')); l.block(-7.4, -5.8, 1.4, 2.45, 0, 1.6);
  // the name of the wall, sign-painted above it
  kit.sign(l, 0, 0.03, 8.65, 15.6, 1.7, (g, w, h) => { board(g, w, h, '#1f3a6b', '#e9b93a', { inset: h * 0.08 }); T(g, 'THE WALL OF FISH', w / 2, h * 0.42, h * 0.5, '#f3e6c8', { f: F.abril, ls: h * 0.05, shadow: '#b3261e' }); T(g, 'sardines · mackerel · anchovies · mussels · trout · octopus · and all their friends', w / 2, h * 0.8, h * 0.15, '#e9b93a', { f: F.fraunces, it: 1, w: 600, max: w * 0.8 });
    ICON.fish(g, h * 0.9, h * 0.45, h * 0.6, '#e9b93a', '#1f3a6b'); g.save(); g.translate(w - h * 0.9, h * 0.45); g.scale(-1, 1); ICON.fish(g, 0, 0, h * 0.6, '#e9b93a', '#1f3a6b'); g.restore(); }, { cw: 1280, ch: 140 });
  // and round the corner from it, Olive's decision tree
  const pl = at(0, 24.9, 0, 'right'); pl.box('c#17140f/0.5', -1.68, 1.68, 0.01, 0.07, 3.72, 8.28); kit.sign(pl, 0, 0.08, 6, 3.2, 4.4, DINNER, { cw: 450, ch: 620 });

  // ---- the counter: across the back, customers on the street side -------------------------------------
  const c = at(21, 20, 0, 'street');                           // +x toward smaller a; +y is the customers' side
  const TOP = X.counter(c, -8, 8, -2.6, 0, 3.4, { front: CREAM, top: 'marble' });
  kit.sign(c, 0, 0.012, 1.85, 6.4, 0.95, (g, w, h) => { board(g, w, h, '#ebe2cc', '#a8361f', { inset: h * 0.1 }); T(g, 'CHEESE · CHARCUTERIE · ADVICE', w / 2, h * 0.5, h * 0.36, '#a8361f', { f: F.bebas, ls: 4, max: w * 0.88 }); }, { cw: 640, ch: 96 });
  // the cheese case, flags in everything
  X.glassCase(c, -7.6, -1.6, -1.85, -0.25, TOP, 1.35, { shelf: 0.7 });
  { const z = TOP + 0.03, z2 = TOP + 0.7, Y = -1.0;
    const flag = (x, y, zz, a, b) => { c.cyl('c#c9a77a/0.8', x, y, zz, zz + 0.3, 0.008, 0.008, 4); kit.sign(c, x, y + 0.01, zz + 0.4, 0.66, 0.26, TAG2(a, b), { cw: 168, ch: 66 }); };
    c.cyl('c#d9b35a/0.8', -7.0, Y, z, z + 0.3, 0.42, 0.42, 24); c.cyl('c#e8c73a/0.8', -7.0, Y + 0.34, z + 0.3, z + 0.52, 0.3, 0.3, 3); flag(-7.0, Y - 0.1, z + 0.3, 'Old Gregory', '18 months. has views.');
    c.cyl('c#9a9590/0.8', -5.95, Y, z, z + 0.2, 0.26, 0.24, 18); c.cyl('c#9a9590/0.8', -5.75, Y + 0.5, z, z + 0.2, 0.2, 0.19, 18); c.cyl('c#f4f1ea/0.8', -6.15, Y + 0.48, z, z + 0.19, 0.24, 0.24, 3); flag(-5.95, Y, z + 0.2, 'Fog Hat', 'ash-coated goat. soft heart');
    c.cyl('c#b08a5a/0.8', -4.9, Y - 0.05, z, z + 0.26, 0.4, 0.4, 24); c.cyl('c#b08a5a/0.8', -4.9, Y - 0.05, z + 0.26, z + 0.5, 0.38, 0.38, 24); flag(-4.9, Y, z + 0.5, 'Tomme de Tuesday', 'nutty. calm. reliable');
    c.cyl('c#c9d6d8/0.8', -3.85, Y, z, z + 0.34, 0.3, 0.3, 20); c.cyl('c#9fb0d8/0.8', -3.65, Y + 0.48, z, z + 0.3, 0.26, 0.26, 3); flag(-3.85, Y, z + 0.34, 'Blue Monday', 'forgives everything');
    ves(c, 'glass', -2.85, Y, z, [[0.34, 0], [0.34, 0.3], [0.2, 0.5], [0.04, 0.54], [0, 0.54]], 18); c.cyl('c#e0782a/0.8', -2.85, Y, z, z + 0.16, 0.26, 0.26, 18); flag(-2.2, Y, z, 'The Little Stinker', 'the lid stays ON');
    c.cyl('c#e8c73a/0.8', -2.15, Y + 0.45, z, z + 0.24, 0.28, 0.28, 3); c.cyl('c#c8202a/0.45', -2.0, Y - 0.35, z, z + 0.22, 0.2, 0.2, 16);
    // the upper shelf: charcuterie, a terrine, the sheep
    for (let i = 0; i < 4; i++) hcyl(c, i % 2 ? 'c#8a1c1c/0.8' : 'c#6a4a2a/0.8', 'x', -6.7 + (i % 2) * 0.12, Y - 0.2 + i * 0.2, z2 + 0.1, 0.95, 0.09, 0.09, 10); flag(-6.7, Y + 0.5, z2 - 0.02, 'Saucisson Sec', 'dry. like my wit');
    c.soft('c#b08a5a/0.8', -5.5, -4.6, Y - 0.25, Y + 0.25, z2, z2 + 0.28, 0.04); c.box('c#e8907a/0.8', -4.62, -4.59, Y - 0.2, Y + 0.2, z2 + 0.03, z2 + 0.25); flag(-5.05, Y + 0.2, z2 + 0.2, 'Country Terrine', 'pork, pistachio, pride');
    c.cyl('c#c9a77a/0.8', -3.8, Y, z2, z2 + 0.3, 0.36, 0.36, 22); flag(-3.8, Y, z2 + 0.26, 'Sheepish', 'hard ewe. faint caramel');
    for (let i = 0; i < 9; i++) c.cyl(i % 2 ? 'c#8a1c1c/0.8' : 'c#b8361f/0.8', -2.75 + (i % 3) * 0.24 + Math.floor(i / 3) * 0.05, Y - 0.2 + Math.floor(i / 3) * 0.24, z2 + 0.012, z2 + 0.022, 0.11, 0.11, 12); plate(c, -2.5, Y + 0.04, z2 - 0.045, 0.52); flag(-2.2, Y + 0.5, z2 - 0.05, 'Coppa', 'sliced thin as gossip');
  }
  // the brass scales, with a wedge waiting on one pan
  kit.model('st_brass_scales', c, -0.75, -1.1, TOP, 0, { scale: 1.25 });
  // the till: cream enamel, a red flag in its window
  { const x = 1.3, y = -1.2, z = TOP;
    c.soft('c#e8e2d4/0.2', x - 0.6, x + 0.6, y - 0.5, y + 0.5, z, z + 0.45, 0.06); c.soft('c#e8e2d4/0.2', x - 0.55, x + 0.55, y - 0.5, y + 0.05, z + 0.45, z + 1.0, 0.09); c.box(BRASS, x - 0.62, x + 0.62, y - 0.52, y + 0.52, z, z + 0.06);
    for (let i = 0; i < 12; i++) c.cyl(i % 4 === 3 ? 'c#c8202a/0.45' : 'c#17140f/0.45', x - 0.36 + (i % 4) * 0.24, y + 0.16 + Math.floor(i / 4) * 0.1, z + 0.45, z + 0.5 + (2 - Math.floor(i / 4)) * 0.04, 0.05, 0.05, 8);
    kit.sign(c, x, y + 0.06, z + 0.78, 0.8, 0.3, (g, w, h) => { fill(g, w, h, '#a8361f'); T(g, 'TA VERY MUCH', w / 2, h / 2, h * 0.46, '#f3ecd6', { f: F.bebas, ls: 2 }); }, { cw: 150, ch: 56 });
    hcyl(c, BRASS, 'x', x + 0.72, y - 0.1, z + 0.7, 0.2, 0.025); ball(c, 'c#17140f/0.45', x + 0.82, y - 0.1, z + 0.64, 0.06, 8);
  }
  // brown paper on a roll, string, the sample plate
  { const z = TOP;
    for (const s of [-1, 1]) { c.box('c#2b2724/0.45/1', 3.9 + s * 0.85 - 0.03, 3.9 + s * 0.85 + 0.03, -2.2, -1.9, z, z + 0.5); } hcyl(c, 'c#2b2724/0.45/1', 'x', 3.9, -2.05, z + 0.42, 1.76, 0.02); hcyl(c, KRAFT, 'x', 3.9, -2.05, z + 0.42, 1.5, 0.22, 0.22, 18);
    c.box(KRAFT, 3.15, 4.65, -1.86, -1.0, z + 0.006, z + 0.014); c.box(KRAFT, 3.15, 4.65, -1.86, -1.84, z + 0.014, z + 0.36);
    ves(c, 'c#d9cdb2/0.8', 5.1, -1.9, z, [[0, 0], [0.16, 0.02], [0.2, 0.14], [0.16, 0.28], [0.05, 0.32], [0, 0.32]], 12); tube(c, 'c#d9cdb2/0.8', [[5.1, -1.9, z + 0.3], [5.0, -1.5, z + 0.03], [4.6, -1.3, z + 0.02], [4.3, -1.45, z + 0.02]], 0.008, 4);
    // a parcel already wrapped, tied with a bow
    c.soft(KRAFT, 3.5, 4.3, -1.6, -1.1, z + 0.016, z + 0.3, 0.03); c.box('c#d9cdb2/0.8', 3.88, 3.92, -1.61, -1.09, z + 0.02, z + 0.305); c.box('c#d9cdb2/0.8', 3.49, 4.31, -1.37, -1.33, z + 0.02, z + 0.305);
    kit.model('wooden_cutting_board', c, 3.4, -0.6, z, 0); for (let i = 0; i < 9; i++) { const px = 3.0 + (i % 5) * 0.2, py = -0.72 + Math.floor(i / 5) * 0.24; c.box(i % 2 ? 'c#e8c73a/0.8' : 'c#d9b35a/0.8', px - 0.05, px + 0.05, py - 0.05, py + 0.05, z + 0.14, z + 0.24); c.cyl('c#c9a77a/0.8', px, py, z + 0.24, z + 0.42, 0.006, 0.006, 4); }
    X.card(c, 3.4, -0.2, z, 0.95, 0.42, (g, w, h) => { paper(g, w, h, PAPER); T(g, 'try me', w / 2, h * 0.36, h * 0.5, '#a8361f', { f: F.pacifico }); T(g, '(one) (fine, two)', w / 2, h * 0.78, h * 0.24, INK, { f: F.caveat, w: 600 }); }, { cw: 240, ch: 106 });
    { const [ex, ez] = kit.world(c, 3.4, -0.75); kit.eats.push({ x: ex, y: c.h + z + 0.15, z: ez, name: 'sardine on toast', bites: 2, reach: 7, note: 'A sardine on toast. Olive was right. Olive is always right about this.', build: T3 => { const g = new T3.Group(), toast = new T3.Mesh(new T3.BoxGeometry(0.3, 0.04, 0.2), new T3.MeshStandardMaterial({ color: 0xc9a060, roughness: 0.9 })), fish = new T3.Mesh(new T3.SphereGeometry(0.07, 8, 6), new T3.MeshStandardMaterial({ color: 0x9aa4a8, roughness: 0.35, metalness: 0.3 })); fish.scale.set(1.9, 0.35, 0.6); fish.position.y = 0.04; g.add(toast, fish); return g; } }); }
    // breadsticks, a bowl of lemons, flowers, and the dinner pad
    jar(c, 5.0, -0.7, z, 0.17, 0.5, null, 0, null); for (let i = 0; i < 9; i++) tube(c, 'c#c9a77a/0.8', [[5.0 + Math.cos(i * 0.7) * 0.06, -0.7 + Math.sin(i * 0.7) * 0.06, z + 0.02], [5.0 + Math.cos(i * 0.7) * 0.15, -0.7 + Math.sin(i * 0.7) * 0.15, z + 0.9 + (i % 3) * 0.06]], 0.018, 5);
    bowl(c, 6.1, -1.3, z, 0.42, 0.24, 'c#2f5a6a/0.45'); for (let i = 0; i < 6; i++) fruit(c, 'lemon', 6.1 + Math.cos(i * 1.05) * 0.2, -1.3 + Math.sin(i * 1.05) * 0.2, z + 0.1 + (i % 2) * 0.06); fruit(c, 'lemon', 6.1, -1.3, z + 0.26);
    kit.posy(c, 7.3, -1.6, z, ['c#e88aa8/0.8', 'c#f3d96a/0.8', 'c#f4f1ea/0.8']);
    kit.sign(c, 6.6, -0.6, z + 0.012, 0.75, 1.0, (g, w, h) => { paper(g, w, h, '#f6f0dc'); for (let i = 0; i < 9; i++) line(g, [[w * 0.08, h * (0.2 + i * 0.085)], [w * 0.92, h * (0.2 + i * 0.085)]], '#b9cfe0', 1); T(g, 'DINNER, FOR YOU:', w / 2, h * 0.1, h * 0.07, '#a8361f', { f: F.bebas, ls: 1 }); ['1 tin sardines', 'bread (the good one)', 'a lemon', 'butter. more.', 'wine: the red one', 'eat it standing up'].forEach((s, i) => T(g, s, w * 0.1, h * (0.255 + i * 0.085), h * 0.075, '#26314a', { f: F.caveat, w: 600, a: 'left', max: w * 0.84 })); T(g, 'xx O.', w * 0.8, h * 0.88, h * 0.09, '#a8361f', { f: F.caveat, w: 700 }); }, { cw: 190, ch: 250, flat: true });
  }
  // totes, leaning on the front of the counter
  const TOTE = (a, b, ink) => (g, w, h) => { g.clearRect(0, 0, w, h); fill(g, w, h, '#e4d9c0'); grain(g, w, h, 0.05); ICON.fish(g, w / 2, h * 0.3, w * 0.6, ink, '#e4d9c0'); T(g, a, w / 2, h * 0.6, h * 0.14, ink, { f: F.abril, max: w * 0.9 }); T(g, b, w / 2, h * 0.8, h * 0.1, ink, { f: F.fraunces, it: 1, w: 600, max: w * 0.9 }); };
  kit.toteBag(c, 5.4, 0.5, 0, 'linen#d8ccb4', { draw: TOTE('SALT & LARDER', 'I contain tins', '#a8361f') }); kit.toteBag(c, 6.9, 0.52, 0, 'linen#d8ccb4', { draw: TOTE('EMOTIONAL', 'support sardines', '#1f3a6b') });
  X.card(c, 6.15, 0.42, 0.0, 0.8, 0.3, TAG('totes · 14 · holds 30 tins (tested)'));
  for (const x of [-5, 0, 5]) X.pendant(c, x, -0.9, { kind: 'dome', drop: 4.6, colour: 'c#b8361f/0.35', power: 1.0 });

  // ---- behind the counter: wine with opinions, the slate, salami on a rail -----------------------------
  const b = at(21, D, 0, 'street');
  b.box(CREAM, -8, 8, 0.02, 1.4, 0, 3.3, G); b.box('marble', -8.1, 8.1, 0.02, 1.5, 3.3, 3.4); b.block(-8, 8, 0, 1.5, 0, 3.4);
  X.shelving(b, 0.3, 8, [4.75, 6.15], { d: 1.05, mat: OAK, over: 0.02, back: NAVY, block: false, th: 0.08 });
  { const WINE = [['Mardi', 'VIN DE SOIF', '#f3ecd6', '#b3261e', 'sun'], ['The Long Lunch', 'ROSÉ · DRY', '#f2b8b0', '#5a2a1c', 'boat'], ['Gato Preto', 'TINTO · UNFILTERED', '#17140f', '#e9b93a', 'cat'], ['Orange You Glad', 'SKIN CONTACT', '#f08a2c', '#26314a', 'star'], ['Fizz, Probably', 'PÉT-NAT', '#a9d0e0', '#1f3a6b', 'moon'], ['Nonno’s Red', 'MONTE-SOMETHING', '#b3261e', '#f3ecd6', 'hill']];
    const GLASSC = ['c#2f4a2a/0.2', 'c#2f4a2a/0.2', 'c#3a2214/0.2', 'c#c9952a/0.2', 'c#e8907a/0.2', 'c#17140f/0.2'];
    [3.4, 4.75, 6.15].forEach((z, r) => { for (let i = 0; i < (r ? 17 : 9); i++) { const k = (Math.floor(i / 3) + r * 2) % 6, w = WINE[k]; lbottle(b, (r ? 0.62 : 3.9) + i * 0.44, 0.55, z, { r: 0.125, h: 1.08, col: GLASSC[k], cap: k % 2 ? 'c#8a1c1c/0.45' : 'c#c9952a/0.45', neck: 0.04 }, LABEL(w[0], w[1], w[2], w[3], w[4])); } });
    kit.model('wine_bottles_01', b, 1.0, 0.7, 3.4, 0);
    [[2.2, 6.15, 'goes with: Tuesday'], [5.9, 6.15, 'goes with: someone else cooking'], [2.2, 4.75, 'tastes like: a barn (compliment)'], [5.9, 4.75, 'goes with: tinned fish. everything does']].forEach(([x, z, s]) => kit.sign(b, x, 1.13, z - 0.3, 2.3, 0.42, TAG(s, '#f6f0dc'), { cw: 330, ch: 60 }));
    X.card(b, 5.9, 1.15, 3.4, 1.6, 0.36, TAG('under 20 & better than it should be'), { cw: 300, ch: 68 });
  }
  X.slateBoard(b, -4.1, 7.2, 7.0, 3.7, SLATE, { cw: 880, ch: 465 });
  // the rail under the slate
  hcyl(b, BRASS, 'x', -4.1, 0.55, 5.0, 6.6, 0.03); for (const x of [-7.3, -0.9]) b.box(BRASS, x - 0.03, x + 0.03, 0.02, 0.57, 4.97, 5.03);
  for (let i = 0; i < 11; i++) { const x = -7.0 + i * 0.6 + (i % 2) * 0.05, len = 0.75 + (i * 37 % 5) * 0.09; b.cyl('c#d9cdb2/0.8', x, 0.55, 5.0 - 0.22, 5.0, 0.008, 0.008, 4); b.cyl(['c#8a1c1c/0.8', 'c#6a4a2a/0.8', 'c#b8361f/0.8', 'c#e8e2d4/0.8'][i % 4], x, 0.55, 4.78 - len, 4.78, 0.085 + (i % 3) * 0.015, 0.085 + (i % 3) * 0.015, 10); }
  // the red slicer, cornichons, a stack of paper, the ham
  { const z = 3.4; b.soft('c#c8202a/0.2', -6.9, -5.7, 0.3, 1.2, z, z + 0.42, 0.06); b.soft('c#c8202a/0.2', -6.8, -6.3, 0.35, 0.9, z + 0.42, z + 0.95, 0.06); hcyl(b, 'c#d4d6d8/0.12/1', 'x', -6.22, 0.7, z + 0.72, 0.04, 0.36, 0.36, 24); b.box('c#d4d6d8/0.12/1', -6.1, -5.72, 0.35, 1.15, z + 0.42, z + 0.47);
    for (let i = 0; i < 5; i++) jar(b, -5.0 + i * 0.48, 0.5, z, 0.18, 0.5, i % 2 ? 'c#5d8a3a/0.45' : 'c#7fa04a/0.45', 0.85, BRASS); X.card(b, -4.05, 1.1, z, 1.3, 0.3, TAG('cornichons: tiny, furious'));
    // jamón on its stand
    b.box('fir#3a2c24', -2.9, -1.2, 0.35, 1.05, z, z + 0.08); b.box('fir#3a2c24', -1.36, -1.26, 0.6, 0.8, z + 0.08, z + 0.85); tube(b, 'c#8a5a2a/0.45', [[-2.8, 0.7, z + 0.28], [-2.3, 0.7, z + 0.36], [-1.75, 0.7, z + 0.55], [-1.3, 0.7, z + 0.88]], t => 0.03 + 0.2 * Math.sin(Math.PI * Math.min(1, (1 - t) * 1.25)) ** 0.8, 10, true);
    for (let k = 0; k < 14; k++) b.box(KRAFT, -0.9, 0.0, 0.3, 1.1, z + k * 0.012, z + k * 0.012 + 0.01); }

  // ---- THE GOOD OIL: back wall, left of the counter -----------------------------------------------------
  const o = at(6, D, 0, 'street');
  const OZ = X.shelving(o, -5.2, 5.2, [1.1, 2.9, 4.45, 5.95], { d: 1.15, mat: OAK, back: CREAM, over: 1.35, bay: 5.2 });
  kit.sign(o, 0, 0.03, 8.5, 7.4, 1.25, (g, w, h) => { board(g, w, h, '#ebe2cc', '#4a6e38', { inset: h * 0.09 }); T(g, 'the good oil', w / 2, h * 0.43, h * 0.5, '#3a5a2a', { f: F.shrikhand }); T(g, '& VINEGARS WITH SOMETHING TO SAY', w / 2, h * 0.8, h * 0.14, '#a8361f', { f: F.bebas, ls: 3 }); for (const k of [-1, 1]) PIC.olive(g, w / 2 + k * w * 0.38, h * 0.45, h * 0.6, '#4a6e38', '#ebe2cc'); }, { cw: 740, ch: 125 });
  { const EST = [['Quinta do Gato Preto', 'EXTRA VIRGIN · DOURO', '#17140f', '#e9b93a', 'cat'], ['Frantoio Zia Pina', 'NOVELLO · UNFILTERED', '#e9dcae', '#3a5a2a', 'olive'], ['Hermanos Olvido', 'PICUAL · FIRST COLD PRESS', '#b3261e', '#f6d04a', 'sun'], ['Kalamáki Sisters', 'KORONEIKI · EARLY HARVEST', '#1f4e8a', '#f3ecd6', 'leaf'], ['The Other Hill', 'ONE GROVE · ONE DONKEY', '#4a6e38', '#f3ecd6', 'hill']];
    const lab = e => LABEL(e[0], e[1], e[2], e[3], e[4]);
    for (let i = 0; i < 13; i++) { const e = EST[Math.floor(i / 3) % 5]; lbottle(o, -4.85 + i * 0.8, 0.6, 5.95, { r: 0.13, h: 1.15, col: i % 5 === 4 ? 'c#17140f/0.2' : 'c#2f4a2a/0.2', cap: 'c#c9952a/0.45', neck: 0.04 }, lab(e)); }
    for (let i = 0; i < 6; i++) { const e = EST[(i + 2) % 5]; pack(o, -4.7 + i * 0.86, 0.62, 4.45, 0.6, 0.36, 0.9, `c${e[2]}/0.45`, PACK(e[0], e[1], e[2], e[3], { pic: e[4], f: F.playfair, foot: '500 ml' }), { cw: 126, ch: 190 }); o.cyl(BRASS, -4.7 + i * 0.86 - 0.18, 0.62, 5.35, 5.4, 0.05, 0.05, 8); }
    const VIN = [['Nonno Lento', 'BALSAMIC · 12 YRS (HE SAYS)', '#3a2214', '#e9b93a', 'c#3a2214/0.2'], ['La Suegra', 'SHERRY VINEGAR · SHARP', '#f6d04a', '#b3261e', 'c#8a5a2a/0.2'], ['Old Wince', 'CIDER VINEGAR · LIVE', '#f3ecd6', '#4a6e38', 'c#c9952a/0.2']];
    for (let i = 0; i < 8; i++) { const v = VIN[Math.floor(i / 3) % 3]; lbottle(o, 0.75 + i * 0.56, 0.6, 4.45, { r: 0.115, h: 0.9, col: v[4], cap: 'c#17140f/0.45' }, LABEL(v[0], v[1], v[2], v[3])); }
    talk(o, -3.0, 1.15, 5.95, 1.7, 'GATO PRETO · 28', 'peppery. makes you cough. correct'); talk(o, 0.3, 1.15, 5.95, 1.7, 'HERMANOS OLVIDO · 24', 'green, loud, good on beans'); talk(o, 3.4, 1.15, 5.95, 1.7, 'THE OTHER HILL · 31', 'the donkey is named Susan');
    talk(o, -2.6, 1.15, 4.45, 1.7, 'TINS · 22', 'keeps the light out. looks great empty'); talk(o, 2.7, 1.15, 4.45, 1.7, 'NONNO LENTO · 19', 'on strawberries. on everything');
    // the tasting ledge
    const z = 2.9; kit.model('wooden_cutting_board', o, -1.2, 0.62, z, 0); kit.model('st_bread_1', o, -1.5, 0.62, z + 0.13, 0, { turn: 0.5 }); for (let i = 0; i < 5; i++) o.box(i % 2 ? 'c#e8e2d4/0.8' : 'c#d9cdb2/0.8', -1.0 + i * 0.09, -0.93 + i * 0.09, 0.42, 0.82, z + 0.14, z + 0.2 + (i % 2) * 0.02);
    plate(o, 0.45, 0.66, z, 0.3); o.cyl('c#7fa04a/0.2', 0.45, 0.66, z + 0.032, z + 0.04, 0.2, 0.2, 18); plate(o, 1.25, 0.66, z, 0.3); o.cyl('c#3a2214/0.2', 1.25, 0.66, z + 0.032, z + 0.04, 0.18, 0.18, 18);
    bottle(o, 0.85, 0.28, z, { r: 0.11, h: 0.95, col: 'c#2f4a2a/0.2', label: 'c#efe2bc/0.8' }); tube(o, 'c#c9ccd0/0.2/1', [[0.85, 0.28, z + 0.95], [0.85, 0.31, z + 1.05], [0.85, 0.4, z + 1.1]], 0.012, 5);
    { const [ex, ez] = kit.world(o, -2.62, 0.6); kit.eats.push({ x: ex, y: o.h + z + 0.15, z: ez, name: 'bread dipped in the good oil', label: 'dip some bread in the good oil', bites: 2, reach: 7, note: 'Peppery, green, a little bit of a cough at the end. The good oil.', build: T3 => { const m = new T3.Mesh(new T3.SphereGeometry(0.12, 8, 6), new T3.MeshStandardMaterial({ color: 0xd9b878, roughness: 0.95 })); m.scale.set(1.3, 0.7, 0.9); return m; } }); }
    X.card(o, -2.62, 1.0, z, 1.25, 0.42, (g, w, h) => { paper(g, w, h, PAPER); T(g, 'dip. go on.', w / 2, h * 0.34, h * 0.42, '#3a5a2a', { f: F.pacifico }); T(g, 'nobody is counting (I am counting)', w / 2, h * 0.76, h * 0.22, INK, { f: F.caveat, w: 600, max: w * 0.92 }); }, { cw: 330, ch: 110 });
    for (let k = 0; k < 6; k++) plate(o, 2.05, 0.6, z + k * 0.04, 0.2, k % 2 ? PORC : 'c#2f5a6a/0.45');
    for (let i = 0; i < 5; i++) jar(o, 2.9 + i * 0.5, 0.55, z, 0.19, 0.55, i % 2 ? 'c#4a6e38/0.45' : 'c#4a2240/0.45', 0.85, BRASS); talk(o, 3.9, 1.15, z, 1.5, 'OLIVES · 9', 'green: bright. purple: brooding');
    bowl(o, -3.6, 0.6, z, 0.4, 0.22, 'c#e8e2d4/0.45'); for (let i = 0; i < 14; i++) ball(o, i % 3 ? 'c#4a6e38/0.45' : 'c#2f4a2a/0.45', -3.6 + Math.cos(i * 2.4) * 0.2 * (i % 2 ? 1 : 0.5), 0.6 + Math.sin(i * 2.4) * 0.2 * (i % 2 ? 1 : 0.5), z + 0.09 + (i % 3) * 0.03, 0.055, 7, 0.8);
    for (let i = 0; i < 4; i++) bottle(o, -4.7 + i * 0.36, 0.5, z, { r: 0.1, h: 0.7, col: 'c#c9952a/0.2', cap: 'c#17140f/0.45', label: 'c#efe2bc/0.8' });
    // big tins and a demijohn below
    for (let i = 0; i < 5; i++) { const e = EST[i]; pack(o, -4.5 + i * 1.0, 0.62, 1.1, 0.8, 0.5, 1.15, `c${e[2]}/0.45`, PACK(e[0], '3 LITRES · FOR THE COMMITTED', e[2], e[3], { pic: e[4], f: F.playfair }), { cw: 150, ch: 215 }); }
    for (const x of [1.2, 2.5]) { ves(o, 'c#2f4a2a/0.2', x, 0.6, 1.1, [[0, 0], [0.3, 0], [0.46, 0.25], [0.46, 0.6], [0.2, 0.95], [0.08, 1.05], [0.08, 1.25], [0, 1.25]], 18); ves(o, 'wicker', x, 0.6, 1.1, [[0.31, 0], [0.47, 0.25], [0.47, 0.5], [0.44, 0.5], [0.3, 0.02]], 18); }
    for (let i = 0; i < 3; i++) tin(o, 3.5 + i * 0.6, 0.55, 1.1, 0.25, 0.7, 'c#4a6e38/0.45', 'c#f3d96a/0.45');
  }

  // ---- dry goods: the right wall -------------------------------------------------------------------------
  const r = at(W, 12, 0, 'left');                              // +x toward the back of the shop
  const RZ = X.shelving(r, -7, 7, [1.1, 2.5, 3.9, 5.3, 6.6], { d: 1.15, mat: OAK, back: CREAM, over: 1.3, bay: 7 });
  kit.sign(r, 0, 0.03, 9.15, 9, 1.2, (g, w, h) => { board(g, w, h, '#a8361f', '#f3e6c8', { inset: h * 0.09 }); T(g, 'PROVISIONS', w / 2, h * 0.42, h * 0.5, '#f3e6c8', { f: F.limelight, ls: h * 0.08 }); T(g, 'pasta · preserves · salt · crisps · tea · things in jars you did not know you needed', w / 2, h * 0.8, h * 0.14, '#f6d04a', { f: F.fraunces, it: 1, w: 600, max: w * 0.88 }); }, { cw: 900, ch: 120 });
  { // tea tins and big jars of pulses
    const TEA = [['Slow Afternoon', 'SMOKY BLACK', '#26314a', '#e9b93a', 'sun'], ['Aunt Bergamot', 'EARL-ISH GREY', '#9fb0d8', '#26314a', 'leaf'], ['Bedtime, Allegedly', 'CHAMOMILE & HOPE', '#f6d04a', '#5a2a1c', 'moon'], ['Mint Condition', 'PEPPERMINT', '#4a6e38', '#f3ecd6', 'leaf']];
    for (let i = 0; i < 9; i++) { const t = TEA[i % 4]; pack(r, -6.55 + i * 0.6, 0.6, 6.6, 0.48, 0.48, 0.62, `c${t[2]}/0.45`, PACK(t[0], t[1], t[2], t[3], { pic: t[4], f: F.playfair }), { cw: 104, ch: 134 }); }
    for (let i = 0; i < 9; i++) jar(r, -1.2 + i * 0.82, 0.6, 6.6, 0.3, 0.8, ['c#d9b35a/0.8', 'c#8a1c1c/0.8', 'c#5d8a3a/0.8', 'c#f4f1ea/0.8', 'c#3a2214/0.8', 'c#e0782a/0.8'][i % 6], 0.55 + (i % 3) * 0.15, BRASS);
    talk(r, -4.2, 1.15, 6.6, 1.7, 'TEA · 12 THE TIN', 'keep the tin. everyone keeps the tin'); talk(r, 2.8, 1.15, 6.6, 1.7, 'BEANS & LENTILS · BY THE SCOOP', 'soak them tonight. future you says thanks');
    // pasta, crisps
    const PASTA = [['Pastificio Distratto', 'RIGATONI', '#1f4e8a'], ['Pastificio Distratto', 'BUCATINI', '#b3261e'], ['Pastificio Distratto', 'ORECCHIETTE', '#4a6e38'], ['Pastificio Distratto', 'PACCHERI', '#e0782a']];
    for (let i = 0; i < 9; i++) { const p = PASTA[i % 4]; pack(r, -6.55 + i * 0.66, 0.62, 5.3, 0.54, 0.24, 1.0, 'c#d9b35a/0.8', (g, w, h) => { fill(g, w, h, '#e3c27a'); grain(g, w, h, 0.05); rect(g, 0, 0, w, h * 0.5, p[2]); T(g, 'PASTIFICIO', w / 2, h * 0.1, h * 0.07, PAPER, { f: F.bebas, ls: 2 }); T(g, 'Distratto', w / 2, h * 0.22, h * 0.12, PAPER, { f: F.yellowtail, max: w * 0.9 }); T(g, p[1], w / 2, h * 0.38, h * 0.085, PAPER, { f: F.abril, max: w * 0.88 }); const q = [0.2, 0.4, 0.6, 0.8]; for (const x of q) for (let j = 0; j < 5; j++) rrect(g, w * x - 5, h * (0.55 + j * 0.085), 10, h * 0.06, 3, '#c9952a'); }, { cw: 104, ch: 192 }); }
    for (const jx of [-0.85, -0.35, 0.4]) { jar(r, jx, 0.6, 5.3, 0.2, 1.05, null, 0, BRASS); for (let k = 0; k < 7; k++) r.cyl('c#d9b35a/0.8', jx + Math.cos(k) * 0.09, 0.6 + Math.sin(k) * 0.09, 5.32, 6.2, 0.02, 0.02, 4); }
    const CRISP = [['Proper Crisps', 'SEA SALT & NOTHING ELSE', '#26314a', '#f3ecd6'], ['Proper Crisps', 'VINEGAR (A LOT)', '#3a6a3a', '#f6d04a'], ['Proper Crisps', 'JAMÓN, SOMEHOW', '#b3261e', '#f3ecd6'], ['Proper Crisps', 'ANCHOVY. YES.', '#e9b93a', '#1d1b18']];
    for (let i = 0; i < 7; i++) { const cr = CRISP[i % 4]; pack(r, 1.6 + i * 0.78, 0.62, 5.3, 0.66, 0.28, 0.92, `c${cr[2]}/0.45`, PACK(cr[0], cr[1], cr[2], cr[3], { f: F.pacifico, pic: 'sun', edge: false, foot: 'fried in olive oil' }), { cw: 130, ch: 182 }); }
    talk(r, -4.2, 1.15, 5.3, 1.7, 'BRONZE-DIE PASTA · 6', 'rough, so the sauce holds on'); talk(r, 4.2, 1.15, 5.3, 1.7, 'CRISPS · 5', 'open a tin. pour crisps. dinner');
    // jam, honey, preserved lemons
    const JAM = [['Plum', 'SULKY', 'c#4a2240/0.45', '#4a2240'], ['Apricot', 'SUNNY', 'c#e0782a/0.45', '#b85a12'], ['Raspberry', 'SHARP', 'c#c8202a/0.45', '#b3261e'], ['Honey', 'THISTLE', 'c#c9952a/0.45', '#8a5a12'], ['Marmalade', 'BITTER', 'c#e0782a/0.45', '#a8361f'], ['Lemons', 'PRESERVED', 'c#e8c73a/0.45', '#6a5a12'], ['Fig', 'SMUG', 'c#3a2214/0.45', '#3a2214']];
    for (let i = 0; i < 14; i++) { const j = JAM[Math.floor(i / 2) % 7], x = -6.65 + i * 0.47; jar(r, x, 0.62, 3.9, 0.19, 0.5, j[2], 0.9, i % 4 < 2 ? BRASS : 'c#c8202a/0.45'); kit.sign(r, x, 0.62 + 0.197, 3.9 + 0.24, 0.26, 0.24, (g, w, h) => { fill(g, w, h, '#f6f0dc'); g.strokeStyle = j[3]; g.lineWidth = 2; g.strokeRect(2, 2, w - 4, h - 4); T(g, j[0], w / 2, h * 0.4, h * 0.34, j[3], { f: F.caveat, w: 700, max: w * 0.88 }); T(g, j[1], w / 2, h * 0.76, h * 0.2, j[3], { f: F.bebas, ls: 1, max: w * 0.88 }); }, { cw: 70, ch: 64 }); }
    for (let i = 0; i < 10; i++) pack(r, 0.6 + i * 0.62, 0.62, 3.9, 0.46, 0.34, 0.66, i % 2 ? 'c#26364f/0.8' : 'c#f4f1ea/0.8', PACK(i % 2 ? 'Grey Salt' : 'Flaky Salt', i % 2 ? 'DAMP · MINERAL · SERIOUS' : 'PINCH · CRUNCH · REPEAT', i % 2 ? '#26314a' : '#f3ecd6', i % 2 ? '#f3ecd6' : '#26314a', { f: F.abril, foot: 'Salt & Larder' }), { cw: 96, ch: 138 });
    talk(r, -4.6, 1.15, 3.9, 1.7, 'JAM · HONEY · 8', 'made by a robot called Agnes'); talk(r, -1.2, 1.15, 3.9, 1.7, 'PRESERVED LEMONS · 10', 'chop one into anything. you are welcome'); talk(r, 4.1, 1.15, 3.9, 1.7, 'SALT · 7', 'it is in the name of the shop');
    // tomatoes, biscuits, chocolate
    for (let i = 0; i < 12; i++) tin(r, -6.6 + i * 0.47, 0.62 - (i % 2) * 0.1, 2.5, 0.2, 0.52, 'c#c8202a/0.45', i % 3 ? 'c#f3d96a/0.45' : 'c#4a6e38/0.45'); for (let i = 0; i < 5; i++) tin(r, -6.37 + i * 0.94, 0.57, 3.02, 0.2, 0.52, 'c#c8202a/0.45', 'c#f3d96a/0.45');
    for (let i = 0; i < 4; i++) for (let k = 0; k < 3 - (i % 2); k++) tin(r, 0.45 + i * 0.72, 0.62, 2.5 + k * 0.27, 0.32, 0.26, ['c#26364f/0.45', 'c#e88aa8/0.45', 'c#d9b35a/0.45'][(i + k) % 3], 'c#f4f1ea/0.45');
    const BAR = [['Dark & Stormy', '72% · SEA SALT', '#26314a', '#f3ecd6', '#3a4a6e'], ['Milk of Human Kindness', '45% · BROWN BUTTER', '#e9b93a', '#5a2a1c', '#f6d04a'], ['Fig Deal', '64% · FIG & FENNEL', '#5a2a6a', '#f6d7b8', '#7a4a8a'], ['Olive Branch', '70% · OLIVE OIL', '#4a6e38', '#f3ecd6', '#5d8a3a'], ['Rose-Tinted', '38% · RASPBERRY', '#f2a7b4', '#b3261e', '#f7c4cc']];
    for (let i = 0; i < 7; i++) { const br = BAR[i % 5]; for (let k = 0; k < 3; k++) r.box(`c${br[2]}/0.8`, 3.5 + i * 0.48 - 0.2, 3.5 + i * 0.48 + 0.2, 0.3 + k * 0.06, 0.345 + k * 0.06, 2.5, 3.2); pack(r, 3.5 + i * 0.48, 0.55, 2.5, 0.4, 0.05, 0.72, `c${br[2]}/0.8`, CHOC(br[0], br[1], br[2], br[3], br[4]), { cw: 90, ch: 162 }); }
    talk(r, -4.2, 1.15, 2.5, 1.7, 'TOMATOES, WHOLE · 4', 'the reason to own a tin opener'); talk(r, 4.95, 1.15, 2.5, 1.7, 'CHOCOLATE · 7', 'one for the walk home');
    // flour sacks and a crate of potatoes below
    for (let i = 0; i < 4; i++) { r.soft('linen#d8ccb4', -6.8 + i * 1.1, -5.85 + i * 1.1, 0.2, 0.9, 1.1, 2.0, 0.12); kit.sign(r, -6.32 + i * 1.1, 0.91, 1.6, 0.7, 0.5, (g, w, h) => { fill(g, w, h, '#d8ccb4'); grain(g, w, h, 0.07); T(g, ['FLOUR', 'SEMOLINA', 'POLENTA', 'RICE'][i], w / 2, h * 0.36, h * 0.3, '#a8361f', { f: F.bebas, ls: 2 }); T(g, ['strong white', 'for pasta', 'coarse', 'carnaroli'][i], w / 2, h * 0.72, h * 0.22, '#26314a', { f: F.fraunces, it: 1 }); }, { cw: 120, ch: 86 }); }
    X.crate(r, -1.0, 0.62, 1.1, 1.6, 1.0, 0.7); r.box('c#6a4a2a/0.8', -1.75, -0.25, 0.16, 1.08, 1.16, 1.5); for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) fruit(r, (i + j) % 3 ? 'potato' : 'onion', -1.6 + i * 0.3, 0.33 + j * 0.29, 1.5);
    X.crate(r, 1.0, 0.62, 1.1, 1.6, 1.0, 0.7); r.box('c#6a4a2a/0.8', 0.25, 1.75, 0.16, 1.08, 1.16, 1.5); for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) fruit(r, 'onion', 0.4 + i * 0.3, 0.33 + j * 0.29, 1.5);
    for (let i = 0; i < 4; i++) bottle(r, 2.4 + i * 0.45, 0.6, 1.1, { r: 0.16, h: 1.1, col: 'c#8a1c1c/0.2', cap: 'c#c9952a/0.45', label: 'c#efe2bc/0.8' }); for (let i = 0; i < 3; i++) jar(r, 4.6 + i * 0.65, 0.6, 1.1, 0.25, 0.8, 'c#c8202a/0.45', 0.9, BRASS);
    talk(r, 4.4, 1.15, 1.1, 1.7, 'PASSATA · 5', 'summer, in a bottle, on a shelf');
  }
  // deliveries stacked in the back corner
  { const q = at(W, 23.6, 0, 'left'); const BOX = s => (g, w, h) => { fill(g, w, h, '#c2a070'); grain(g, w, h, 0.08); T(g, s[0], w / 2, h * 0.36, h * 0.26, INK, { f: F.elite, max: w * 0.9 }); T(g, s[1], w / 2, h * 0.7, h * 0.16, '#a8361f', { f: F.elite, max: w * 0.9 }); };
    [['SARDINES', '(AGAIN)'], ['MORE SARDINES', 'OLIVE, PLEASE STOP'], ['NOT SARDINES', 'it is sardines']].forEach((s, i) => pack(q, (i % 2) * 0.15, 0.85, 0.02 + i * 1.0, 1.9, 1.5, 0.98, KRAFT, BOX(s), { cw: 240, ch: 124 })); q.block(-1, 1.1, 0, 1.65, 0, 3.1); }

  // ---- the table in the middle: bread, and a few things you did not come in for ---------------------------
  const m = at(16.5, 11.6, 0, 'street');                       // labels face the door
  const MT = X.plinth(m, 0, 0, 7.6, 3.3, 2.7, { mat: PALE, shelf: 0.85 });
  { const z = MT;
    // a tall basket of baguettes
    ves(m, 'wicker', 3.1, 0.3, z, [[0, 0], [0.34, 0], [0.42, 0.9], [0.44, 0.9], [0.44, 0.94], [0.38, 0.94], [0.3, 0.06], [0, 0.06]], 16);
    for (let i = 0; i < 6; i++) { const a = i * 1.05, dx = Math.cos(a) * 0.14, dy = Math.sin(a) * 0.14; tube(m, i % 2 ? CRUST : 'c#b08a5a/0.8', [[3.1 + dx * 0.5, 0.3 + dy * 0.5, z + 0.1], [3.1 + dx, 0.3 + dy, z + 1.0], [3.1 + dx * 2.2, 0.3 + dy * 2.2, z + 2.0 + (i % 3) * 0.12]], t => 0.035 + 0.075 * Math.sin(Math.PI * Math.min(0.96, 0.08 + t * 0.9)) ** 0.5, 8, true); }
    X.card(m, 3.1, 1.2, z, 1.2, 0.42, TAG2('baguette · 3', 'carry under arm. feel French.'), { cw: 250, ch: 88 });
    // a wide tray of round loaves
    m.box('wicker', 0.3, 2.5, -1.1, 0.9, z, z + 0.06); for (const [x0, x1, y0, y1] of [[0.3, 2.5, -1.1, -1.04], [0.3, 2.5, 0.84, 0.9], [0.3, 0.36, -1.1, 0.9], [2.44, 2.5, -1.1, 0.9]]) m.box('wicker', x0, x1, y0, y1, z + 0.06, z + 0.3);
    for (const [x, y, rr, col] of [[0.85, -0.5, 0.4, CRUST], [1.85, -0.55, 0.42, CRUST2], [1.35, 0.3, 0.44, 'c#b08a5a/0.8'], [2.1, 0.4, 0.3, CRUST]]) { ball(m, col, x, y, z + 0.05, rr, 16, 0.62); for (const k of [-0.12, 0, 0.12]) m.box('c#e8e2d4/0.8', x - rr * 0.5, x + rr * 0.5, y + k - 0.012, y + k + 0.012, z + 0.05 + rr * 1.2, z + 0.05 + rr * 1.245 - Math.abs(k) * 0.12); }
    kit.model('st_bread_1', m, 0.75, 0.35, z + 0.06, 0, { turn: 1.2, scale: 1.3 });
    X.card(m, 1.4, 1.2, z, 1.4, 0.42, TAG2('country loaf · 7', 'still warm. it is always still warm.'), { cw: 280, ch: 84 });
    // buns on a board, rolls in a bowl
    kit.model('wooden_cutting_board', m, -0.9, 0.2, z, 0); kit.model('hamburger_buns', m, -0.9, 0.2, z + 0.13, 0); kit.model('hamburger_buns', m, -0.9, -0.75, z, 0, { turn: 0.3 });
    bowl(m, -0.9, -0.85, z, 0.02, 0.01); for (let i = 0; i < 4; i++) kit.model('st_bread_2', m, -1.9 + (i % 2) * 0.4, -0.9 + Math.floor(i / 2) * 0.4, z, 0, { turn: i * 1.3 });
    X.card(m, -0.9, 1.2, z, 1.2, 0.42, TAG2('milk buns · 4 for 5', 'for sardine sandwiches, obviously'), { cw: 250, ch: 88 });
    // butter under a cloche, a jar candle, flowers
    plate(m, -2.9, -0.5, z, 0.42); m.soft('c#f3d96a/0.8', -3.15, -2.65, -0.66, -0.34, z + 0.05, z + 0.25, 0.03); ves(m, 'glass', -2.9, -0.5, z + 0.05, [[0.38, 0], [0.38, 0.3], [0.24, 0.52], [0.05, 0.58], [0.05, 0.66], [0, 0.66]], 18);
    X.card(m, -2.9, 1.2, z, 1.2, 0.42, TAG2('cultured butter · 6', 'more cultured than me'), { cw: 250, ch: 88 }); kit.posy(m, -3.2, 0.5, z, ['c#c8202a/0.8', 'c#e88aa8/0.8', 'c#f4f1ea/0.8']);
    // under the table: crates of apples and pears, a sack
    for (const [x, kind] of [[-2.4, 'apple'], [-0.5, 'pear']]) { X.crate(m, x, 0.2, 0.85, 1.7, 1.2, 0.7); m.box('c#6a4a2a/0.8', x - 0.8, x + 0.8, -0.35, 0.75, 0.92, 1.2); for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) fruit(m, kind, x - 0.62 + i * 0.31, -0.25 + j * 0.3, 1.2); }
    m.soft('linen#c9b48a', 1.0, 2.9, -0.6, 0.8, 0.85, 1.9, 0.2); kit.sign(m, 1.95, 0.81, 1.4, 1.2, 0.6, (g, w, h) => { fill(g, w, h, '#c9b48a'); grain(g, w, h, 0.08); T(g, 'CHICKPEAS', w / 2, h * 0.38, h * 0.3, '#26314a', { f: F.bebas, ls: 3 }); T(g, '25 kg · do not attempt alone', w / 2, h * 0.72, h * 0.16, '#26314a', { f: F.elite, max: w * 0.9 }); }, { cw: 200, ch: 100 });
  }

  // ---- the window displays (seen from the street: everything faces out) -----------------------------------
  const tiers = f => { f.box(CREAM, -6, 6, 0.0, 1.1, 0, 3.5, G); f.box(CREAM, -6, 6, 1.1, 2.1, 0, 2.9, G); f.box(CREAM, -6, 6, 2.1, 3.02, 0, 2.3, G); for (const [y, z] of [[1.1, 3.5], [2.1, 2.9], [3.02, 2.3]]) f.box(RED, -6.02, 6.02, y - 0.02, y + 0.02, z - 0.12, z + 0.012); f.block(-6, 6, 0, 3.05, 0, 3.5); };
  const wl = at(7.3, 3.4, 0, 'street'); tiers(wl);
  { wl.box('fir#3a2c24', -2.9, 2.9, 0.2, 0.3, 3.5, 5.5); kit.sign(wl, 0, 0.31, 4.5, 5.6, 1.8, (g, w, h) => { board(g, w, h, '#f6d04a', '#1f3a6b', { inset: h * 0.07 }); T(g, 'TINNED FISH', w / 2, h * 0.3, h * 0.34, '#1f3a6b', { f: F.abril, ls: 3, shadow: '#e2583e' }); T(g, 'is dinner', w / 2, h * 0.63, h * 0.3, '#b3261e', { f: F.pacifico }); T(g, 'ASK OLIVE · SHE HAS OPINIONS', w / 2, h * 0.88, h * 0.1, '#1f3a6b', { f: F.bebas, ls: 4 }); ICON.fish(g, w * 0.1, h * 0.62, h * 0.3, '#1f3a6b', '#f6d04a'); g.save(); g.translate(w * 0.9, h * 0.62); g.scale(-1, 1); ICON.fish(g, 0, 0, h * 0.3, '#1f3a6b', '#f6d04a'); g.restore(); }, { cw: 620, ch: 200 });
    for (let i = 0; i < 8; i++) faced(wl, -4.72 + i * 1.35, 1.75, 2.9, FISH[i], 3, 1.5); for (let i = 0; i < 9; i++) faced(wl, -5.2 + i * 1.3, 2.72, 2.3, FISH[(i + 8) % 14], 2, 1.3);
    for (const s of [-1, 1]) { for (let i = 0; i < 3; i++) lbottle(wl, s * (3.6 + i * 0.5), 0.6 + (i % 2) * 0.2, 3.5, { r: 0.14, h: 1.3, col: 'c#2f4a2a/0.2', cap: 'c#c9952a/0.45', neck: 0.04 }, LABEL(['Gato Preto', 'Zia Pina', 'Other Hill'][i], 'EXTRA VIRGIN', ['#17140f', '#e9dcae', '#4a6e38'][i], ['#e9b93a', '#3a5a2a', '#f3ecd6'][i], ['cat', 'olive', 'hill'][i])); }
    bowl(wl, 5.4, 0.6, 3.5, 0.45, 0.26, 'c#2f5a6a/0.45'); for (let i = 0; i < 7; i++) fruit(wl, 'lemon', 5.4 + Math.cos(i) * 0.2, 0.6 + Math.sin(i) * 0.2, 3.6 + (i % 2) * 0.1); kit.posy(wl, -5.4, 0.6, 3.5, ['c#f3d96a/0.8', 'c#e0782a/0.8', 'c#f4f1ea/0.8']);
  }
  const wr = at(25.7, 3.4, 0, 'street'); tiers(wr);
  { const z = 3.5;
    ves(wr, 'wicker', 4.6, 0.55, z, [[0, 0], [0.36, 0], [0.45, 0.9], [0.47, 0.94], [0.4, 0.94], [0.32, 0.06], [0, 0.06]], 16); for (let i = 0; i < 6; i++) { const a = i * 1.05, dx = Math.cos(a) * 0.14, dy = Math.sin(a) * 0.14; tube(wr, i % 2 ? CRUST : 'c#b08a5a/0.8', [[4.6 + dx * 0.5, 0.55 + dy * 0.5, z + 0.1], [4.6 + dx, 0.55 + dy, z + 1.0], [4.6 + dx * 2.2, 0.55 + dy * 2.2, z + 2.0 + (i % 3) * 0.12]], t => 0.035 + 0.075 * Math.sin(Math.PI * Math.min(0.96, 0.08 + t * 0.9)) ** 0.5, 8, true); }
    for (const [x, rr, col] of [[3.2, 0.44, CRUST2], [2.2, 0.4, CRUST]]) ball(wr, col, x, 0.55, z, rr, 16, 0.62);
    const WN = [['Mardi', 'VIN DE SOIF', '#f3ecd6', '#b3261e', 'sun'], ['Gato Preto', 'TINTO', '#17140f', '#e9b93a', 'cat'], ['Fizz, Probably', 'PÉT-NAT', '#a9d0e0', '#1f3a6b', 'moon']];
    for (let i = 0; i < 5; i++) lbottle(wr, -5.3 + i * 0.5, 0.5 + (i % 2) * 0.22, z, { r: 0.14, h: 1.25, col: i % 2 ? 'c#3a2214/0.2' : 'c#2f4a2a/0.2', cap: 'c#8a1c1c/0.45', neck: 0.04 }, LABEL(...WN[i % 3]));
    wr.box('fir#3a2c24', -2.3, 1.3, 0.2, 0.3, z, z + 1.9); kit.sign(wr, -0.5, 0.31, z + 0.95, 3.4, 1.7, (g, w, h) => { slate(g, w, h); chalk(g, 'OPEN', w / 2, h * 0.22, h * 0.26, '#e9c46a'); chalk(g, 'from nearly evening', w / 2, h * 0.5, h * 0.15); chalk(g, 'until slightly later', w / 2, h * 0.68, h * 0.15); chalk(g, 'bread is warm · cheese is ripe · come in', w / 2, h * 0.88, h * 0.085, '#9fc6b0', { max: w * 0.92 }); }, { cw: 400, ch: 200, rough: 0.95 });
    // cheese on the middle step
    wr.cyl('c#d9b35a/0.8', -4.3, 1.6, 2.9, 3.25, 0.46, 0.46, 24); wr.cyl('c#b08a5a/0.8', -4.3, 1.6, 3.25, 3.52, 0.36, 0.36, 22); wr.cyl('c#9a9590/0.8', -4.3, 1.6, 3.52, 3.72, 0.24, 0.22, 18); wr.cyl('c#e8c73a/0.8', -3.4, 1.75, 2.9, 3.2, 0.34, 0.34, 3); wr.cyl('c#c8202a/0.45', -2.75, 1.6, 2.9, 3.14, 0.24, 0.24, 18);
    X.card(wr, -3.5, 2.0, 2.9, 1.5, 0.4, TAG2('a tower of cheese', '(structural. do not remove the bottom one)'), { cw: 300, ch: 80 });
    for (let i = 0; i < 8; i++) { const col = ['c#4a2240/0.45', 'c#e0782a/0.45', 'c#c8202a/0.45', 'c#c9952a/0.45'][i % 4]; jar(wr, -1.6 + i * 0.5, 1.6, 2.9, 0.19, 0.5, col, 0.9, BRASS); if (i % 2 === 0 && i < 6) jar(wr, -1.35 + i * 0.5, 1.6, 3.45, 0.19, 0.5, col, 0.9, BRASS); }
    kit.model('st_brass_scales', wr, 4.2, 1.6, 2.9, 0, { scale: 1.1 }); kit.posy(wr, 5.4, 1.6, 2.9, ['c#e88aa8/0.8', 'c#c8202a/0.8', 'c#f4f1ea/0.8']);
    // chocolate and tea along the front
    const BARW = [['Dark & Stormy', '72% · SEA SALT', '#26314a', '#f3ecd6', '#3a4a6e'], ['Fig Deal', '64% · FIG', '#5a2a6a', '#f6d7b8', '#7a4a8a'], ['Olive Branch', '70% · OLIVE OIL', '#4a6e38', '#f3ecd6', '#5d8a3a'], ['Rose-Tinted', '38% · RASPBERRY', '#f2a7b4', '#b3261e', '#f7c4cc'], ['Milk of Human Kindness', '45%', '#e9b93a', '#5a2a1c', '#f6d04a']];
    for (let i = 0; i < 10; i++) { const br = BARW[i % 5]; wr.box(`c${br[2]}/0.8`, -5.4 + i * 0.62 - 0.25, -5.4 + i * 0.62 + 0.25, 2.3, 2.5, 2.3, 2.5); pack(wr, -5.4 + i * 0.62, 2.62, 2.3, 0.5, 0.05, 0.9, `c${br[2]}/0.8`, CHOC(br[0], br[1], br[2], br[3], br[4]), { cw: 100, ch: 180 }); }
    for (let i = 0; i < 5; i++) { const t = [['Slow Afternoon', 'SMOKY BLACK', '#26314a', '#e9b93a', 'sun'], ['Aunt Bergamot', 'EARL-ISH GREY', '#9fb0d8', '#26314a', 'leaf'], ['Bedtime, Allegedly', 'CHAMOMILE', '#f6d04a', '#5a2a1c', 'moon']][i % 3]; pack(wr, 1.5 + i * 0.85, 2.55, 2.3, 0.62, 0.5, 0.8, `c${t[2]}/0.45`, PACK(t[0], t[1], t[2], t[3], { pic: t[4], f: F.playfair }), { cw: 124, ch: 160 }); }
  }
  // what the backs of the window steps say to people already inside
  for (const [a, s] of [[7.3, 'psst. the anchovies are behind you.'], [25.7, 'you came in for milk. we do not sell milk.']]) kit.sign(at(a, 3.42), 0, 0.012, 2.2, 6.5, 0.7, (g, w, h) => { fill(g, w, h, '#e6dcc6'); T(g, s, w / 2, h / 2, h * 0.5, '#a8361f', { f: F.caveat, w: 700, max: w * 0.94 }); }, { cw: 560, ch: 60 });

  // ---- lamps over the room ------------------------------------------------------------------------------------
  for (const [a, d] of [[4.6, 9], [4.6, 18], [16.5, 11.6], [28, 9.5], [28, 16.5]]) X.pendant(R, a, d, { kind: 'globe', drop: 4.0, power: 0.9 });
  X.pendant(R, 6, 25.2, { kind: 'globe', drop: 3.6, power: 0.8 });

  // ---- out on the pavement, under the awning ---------------------------------------------------------------
  const ps = K.wrap(lot.frOut(kit, 7.4, 0.25, 0, 'street'));    // the fruit: +y toward the kerb, +x toward smaller a
  { ps.box(OAK, -5, 5, 0.05, 1.55, 1.08, 1.2, G); for (const x of [-4.8, -1.6, 1.6, 4.8]) { ps.box(OAK, x - 0.07, x + 0.07, 0.1, 0.24, 0, 1.08, G); ps.box(OAK, x - 0.07, x + 0.07, 1.36, 1.5, 0, 1.08, G); } ps.block(-5, 5, 0, 3.1, 0, 2.6);
    const lot8 = [['lemon', 'lemons · 3 for 2', 'unwaxed, unbothered'], ['orange', 'oranges · 1 each', 'for juice or juggling'], ['apple', 'apples · 4 a bag', 'crisp. loudly so'], ['pear', 'pears · ripe for 9 min', 'be ready'],
      ['tomato', 'tomatoes · 5', 'they smell like tomatoes!'], ['plum', 'plums · 4', 'eat over the sink'], ['lime', 'limes · 3 for 2', 'you know why'], ['onion', 'onions · 2', 'every dinner starts here']];
    lot8.forEach(([kind, head, note], i) => { const back = i < 4, x = -3.75 + (i % 4) * 2.5, y = back ? 0.8 : 2.35, z = back ? 1.2 : 0.02, s = { lemon: 0.3, orange: 0.31, apple: 0.3, pear: 0.26, tomato: 0.27, plum: 0.22, lime: 0.25, onion: 0.28 }[kind];
      X.crate(ps, x, y, z, 2.2, 1.3, 0.72); ps.box('c#6a4a2a/0.8', x - 1.05, x + 1.05, y - 0.6, y + 0.6, z + 0.06, z + 0.5);
      const nx = Math.floor(2.0 / s), ny = Math.floor(1.14 / s); for (let p = 0; p < nx; p++) for (let q = 0; q < ny; q++) fruit(ps, kind, x - (nx - 1) * s / 2 + p * s, y - (ny - 1) * s / 2 + q * s, z + 0.5);
      for (let p = 0; p < nx - 1; p += 2) fruit(ps, kind, x - (nx - 2) * s / 2 + p * s, y + (p % 4 ? 0.14 : -0.14), z + 0.5 + s * 0.6);
      ps.cyl('c#c9a77a/0.8', x + 0.8, y - 0.5, z + 0.5, z + 1.25, 0.012, 0.012, 4); kit.sign(ps, x + 0.8, y - 0.48, z + 1.25, 1.25, 0.5, (g, w, h) => { slate(g, w, h, '#252a28', i + 2); chalk(g, head, w / 2, h * 0.33, h * 0.34, '#f1efe6', { max: w * 0.92 }); chalk(g, note, w / 2, h * 0.74, h * 0.26, '#e9c46a', { max: w * 0.92 }); }, { cw: 250, ch: 100, rough: 0.95 }); });
    kit.model('bananas', ps, 4.75, 0.2, 1.2, 0, { outdoor: true });
  }
  // the flowers: buckets on a step, the other side of the door
  const pf = K.wrap(lot.frOut(kit, 25.4, 0.25, 0, 'street'));
  { const bucket = (x, y, z, cols, tall = 1) => {
      ves(pf, GALV, x, y, z, [[0, 0], [0.3, 0], [0.42, 0.86], [0.44, 0.86], [0.44, 0.9], [0.39, 0.9], [0.28, 0.08], [0, 0.08]], 16);
      K.leaves(pf, x, y, z + 0.7, { n: 12, len: 1.1 * tall, w: 0.07, up: 1.0, out: 0.5, droop: 0.25, spread: 0.2 });
      for (let i = 0; i < 15; i++) { const a = i * 2.4, rr = 0.1 + (i % 5) * 0.085, hh = (1.25 + (i * 7 % 6) * 0.11) * tall, hx = x + Math.cos(a) * rr * 1.25, hy = y + Math.sin(a) * rr * 1.25, col = cols[i % cols.length];
        tube(pf, 'c#4a6e38/0.8', [[x + Math.cos(a) * rr * 0.3, y + Math.sin(a) * rr * 0.3, z + 0.2], [hx, hy, z + hh + 0.6]], 0.012, 4);
        if (tall > 1.2) for (let k = 0; k < 4; k++) ball(pf, col, hx, hy, z + hh + 0.3 + k * 0.13, 0.075 - k * 0.012, 7); else { ball(pf, col, hx, hy, z + hh + 0.55, 0.11, 8, 0.75); if (i % 3 === 0) ball(pf, 'c#c9952a/0.8', hx, hy, z + hh + 0.63, 0.045, 6, 0.6); } } };
    pf.box(OAK, -4.4, 4.4, 0.05, 1.3, 0.9, 1.0, G); for (const x of [-4.2, 0, 4.2]) pf.box(OAK, x - 0.07, x + 0.07, 0.1, 1.25, 0, 0.9, G); pf.block(-4.4, 4.4, 0, 2.8, 0, 2.6);
    const P = [['c#e88aa8/0.8', 'c#f4f1ea/0.8'], ['c#f3d96a/0.8', 'c#e0782a/0.8'], ['c#8a5ab0/0.8', 'c#9fb0d8/0.8'], ['c#c8202a/0.8', 'c#e8907a/0.8'], ['c#f4f1ea/0.8', 'c#f3d96a/0.8']];
    for (let i = 0; i < 4; i++) bucket(-3.5 + i * 2.3, 0.7, 1.0, P[(i + 2) % 5], i % 2 ? 1 : 1.35); for (let i = 0; i < 5; i++) bucket(-3.9 + i * 1.95, 2.0, 0.02, P[i], i % 2 ? 1.3 : 1);
    kit.sign(pf, 0, 1.33, 0.5, 4.6, 0.62, (g, w, h) => { board(g, w, h, '#ebe2cc', '#a8361f', { inset: h * 0.1 }); T(g, 'FLOWERS · wrapped in brown paper & a compliment', w / 2, h * 0.52, h * 0.34, '#a8361f', { f: F.fraunces, it: 1, w: 700, max: w * 0.9 }); }, { cw: 520, ch: 70 });
    [[-3.9, 'ranunculus · 9'], [0.0, 'whatever is nice · 8'], [3.9, 'delphiniums · 12']].forEach(([x, s]) => { pf.cyl('c#c9a77a/0.8', x + 0.55, 2.4, 0, 1.3, 0.012, 0.012, 4); kit.sign(pf, x + 0.55, 2.42, 1.35, 1.05, 0.34, (g, w, h) => { slate(g, w, h); chalk(g, s, w / 2, h / 2, h * 0.5, '#f1efe6', { max: w * 0.92 }); }, { cw: 200, ch: 66, rough: 0.95 }); });
  }
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.3, 5.6, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h); chalk(g, 'tonight you are having', w / 2, h * 0.09, h * 0.072, '#e9c46a', { max: w * 0.9 }); ICON.fish(g, w / 2, h * 0.23, h * 0.2, '#f1efe6', '#252a28'); chalk(g, 'sardines on toast', w / 2, h * 0.4, h * 0.098, '#f1efe6', { max: w * 0.9 }); chalk(g, 'a lemon · good butter', w / 2, h * 0.52, h * 0.08, '#e8a8a0', { max: w * 0.9 }); chalk(g, 'a glass of the red', w / 2, h * 0.63, h * 0.08, '#9fc6b0', { max: w * 0.9 }); line(g, [[w * 0.25, h * 0.72], [w * 0.75, h * 0.72]], '#e9c46a', 2); chalk(g, '(Olive has decided.', w / 2, h * 0.8, h * 0.07, '#9aa39d'); chalk(g, 'it is easier this way)', w / 2, h * 0.89, h * 0.07, '#9aa39d'); });

  // ---- Olive ---------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'olive', name: 'Olive', lot: 'grocery', look: { shape: 'round', colour: '#6f7f3f', belly: '#efe4cf', trim: '#c9a45c', hat: 'straw', hatColour: '#a8361f', apron: '#e9dfc8', eye: '#ffe2b0', ring: 0xf6d04a, blush: true, tool: 'fish', hover: 4.7 },
    home: lot.world(19.6, 24.7), faces: lot.world(17, 10), posts: [lot.world(15, 24.7), lot.world(25.5, 24.7), lot.world(19.6, 24.7)],
    lines: {
      greet: ['There you are. Come in, come closer. I have just the tin for you.', 'Evening, nearly! You look like somebody who has not decided about dinner. Good. I have.', 'Hello, hello. Mind the lemons. Try the cheese. Tell me everything.'],
      idle: ['*turns one tin a quarter inch so it faces the door*', 'Between us, the anchovies are the best thing in here. Do not tell the sardines.', '*weighs a single olive. nods.*', 'Somebody asked for tuna in spring water today. I gave them a moment to think about it.', '*re-ties a parcel that was already tied perfectly*'],
      bye: ['Eat it standing up at the counter. It tastes better. I have data.', 'Off you go. Butter the toast right to the edges!', 'Come back and tell me how the tin was. I worry.'],
      topics: [
        { q: 'What should I have for dinner?', a: 'Oh, I was hoping you would ask. Are you tired, or are you pretending you are going to cook?', next: [
          { q: 'Tired.', a: 'Then: Sereia Sonolenta sardines, the country loaf, toasted, butter to the very edges, half a lemon. Eight minutes. You will feel like a person who has their life together.' },
          { q: 'I am going to cook!', a: 'Brave. Bucatini, two Nonna Acciuga anchovies melted in oil with garlic, the tinned tomatoes, a preserved lemon at the end. If it goes wrong, the sardines will still be here. They are very patient.' }] },
        { q: 'Why so much tinned fish?', a: 'Lean in. A good tin is a fish caught at its best, cooked by somebody who cares, and then left alone in olive oil to think about it for a year. It is the only food that improves while you ignore it. I find that very moving.', next: [
          { q: 'Which is the best one?', a: 'You cannot ask a mother that. ...Luz do Farol, the tuna belly. Top shelf. Do not look at the price, look at me. It is worth it.' },
          { q: 'I do not really like fish.', a: 'You do not like BAD fish. Nobody does. Start with the smoked trout, Fjord & Fennel. It tastes like a cabin. We will work up to the octopus together.' }] },
        { q: 'Tell me about the olive oil.', a: 'The Gato Preto makes you cough a little at the back of the throat. That is the good bit, that is the pepper. There is a saucer and bread over there. Dip. Nobody is counting. I am counting, but fondly.' },
        { q: 'What goes with this cheese?', a: 'Old Gregory wants an apple and a quiet evening. Blue Monday wants honey, the thistle one. The Little Stinker wants to be left under its lid until the last possible second, and frankly so would I.' },
        { q: 'Pick me a wine.', a: 'What day is it? Trick question, it is always nearly evening. Take the Mardi. It goes with Tuesday, tinned fish, and mild disappointment, and it fixes one of those.' },
        { q: 'Is your name really Olive?', a: 'It was O-11V on the crate I came in. The baker read it sideways and here we are. I did consider "Anchovy", but it is a lot to live up to.' },
      ],
    },
  });
}
