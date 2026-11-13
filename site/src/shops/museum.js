// The Museum of Small Wonders  (south side, east end; 31 ft wide by 30.7 deep)
// One room, kept by one devoted robot. Everything in it is real: the specimens are 3D scans of real
// objects (Smithsonian Open Access, CC0; two from Poly Haven), the pictures real paintings in the
// public domain, and the labels give the real facts. Left wall: DEEP TIME (megalodon tooth, a
// trilobite you may touch, an uncoiled ammonite, a sabre-tooth, a coco de mer). Right wall: the front
// desk (visitors' book, donations box, postcards), then MADE BY HAND (a Greek cup, a colonoware pot,
// Thomas Commeraw's jug). Down the middle: Cher Ami the pigeon, Lincoln's life mask, a stereoscope,
// and the one invented case, "Small Wonders of Vesper Street". The back wall is the picture wall,
// SMALL THINGS, LOOKED AT CLOSELY, with two benches. In the windows: a bronze whale and a stone
// guardian. Quill is the keeper.
import { tools, fixtures, snapMat } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, poly, para, ICON } from '../draw.js';

const GREEN = 'painted_wood#3a4a44', OAK = 'oak_light#a3825c', DARKW = 'fir#3a2c24', DESKTOP = 'fir#5a3d2c', IRON = 'c#2b2724/0.45/1', LINENC = 'c#e8e2d4/0.8', CREAMP = 'c#efe2bc/0.8', LEATHER = 'leather#6a3a2a';
const INK = '#2a1c13', DEEP = '#2c3a36', CREAM = '#f1e6cf', GOLD = '#d9c9a0', OX = '#6e2a26', BLUE = '#2f5a6a', PAPER = '#f4eedd';
const GLOW = 'e#ffe2b4/1.7';

// ---- little pictures of the exhibits (postcards, the floor plan, the boards): about (x, y), size s ----
const PIC = {
  tooth(g, x, y, s, c) { poly(g, [[x - s * 0.36, y - s * 0.44], [x - s * 0.12, y - s * 0.36], [x, y - s * 0.42], [x + s * 0.12, y - s * 0.36], [x + s * 0.36, y - s * 0.44], [x + s * 0.3, y - s * 0.12], [x, y + s * 0.48], [x - s * 0.3, y - s * 0.12]], c); },
  trilobite(g, x, y, s, c, bg = PAPER) {
    g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, s * 0.3, s * 0.46, 0, 0, 7); g.fill();
    g.strokeStyle = bg; g.lineWidth = s * 0.03; for (let i = -1; i <= 5; i++) { g.beginPath(); g.moveTo(-s * 0.3, -s * 0.12 + i * s * 0.09); g.quadraticCurveTo(0, -s * 0.18 + i * s * 0.09, s * 0.3, -s * 0.12 + i * s * 0.09); g.stroke(); }
    for (const k of [-1, 1]) { g.beginPath(); g.moveTo(k * s * 0.1, -s * 0.2); g.lineTo(k * s * 0.08, s * 0.44); g.stroke(); disc(g, k * s * 0.17, -s * 0.3, s * 0.05, bg); }
    g.restore();
  },
  ammonite(g, x, y, s, c) { const p = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 4.6, r = s * (0.05 + 0.4 * i / 60); p.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } line(g, p, c, s * 0.09); },
  pigeon(g, x, y, s, c, bg = PAPER) {
    g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.ellipse(0, s * 0.04, s * 0.34, s * 0.2, -0.25, 0, 7); g.fill();
    disc(g, s * 0.28, -s * 0.2, s * 0.12, c); poly(g, [[s * 0.38, -s * 0.22], [s * 0.5, -s * 0.17], [s * 0.38, -s * 0.14]], c); poly(g, [[-s * 0.26, s * 0.06], [-s * 0.5, s * 0.24], [-s * 0.46, s * 0.06]], c);
    disc(g, s * 0.3, -s * 0.22, s * 0.025, bg); line(g, [[s * 0.02, s * 0.2], [s * 0.02, s * 0.42], [s * 0.1, s * 0.42]], c, s * 0.035); g.restore();
  },
  whale(g, x, y, s, c, bg = PAPER) {
    g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.moveTo(-s * 0.46, s * 0.02); g.quadraticCurveTo(-s * 0.3, -s * 0.3, s * 0.1, -s * 0.2); g.quadraticCurveTo(s * 0.3, -s * 0.14, s * 0.36, -s * 0.02);
    g.lineTo(s * 0.5, -s * 0.2); g.lineTo(s * 0.46, s * 0.0); g.lineTo(s * 0.5, s * 0.16); g.lineTo(s * 0.34, s * 0.06); g.quadraticCurveTo(-s * 0.1, s * 0.3, -s * 0.46, s * 0.02); g.fill();
    disc(g, -s * 0.3, -s * 0.04, s * 0.022, bg); g.strokeStyle = c; g.lineWidth = s * 0.03; g.lineCap = 'round'; for (const k of [-1, 1]) { g.beginPath(); g.moveTo(-s * 0.2, -s * 0.26); g.quadraticCurveTo(-s * 0.2 + k * s * 0.02, -s * 0.4, -s * 0.2 + k * s * 0.1, -s * 0.42); g.stroke(); } g.restore();
  },
  jug(g, x, y, s, c) {
    g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.ellipse(0, s * 0.1, s * 0.3, s * 0.36, 0, 0, 7); g.fill(); g.fillRect(-s * 0.09, -s * 0.46, s * 0.18, s * 0.26); g.fillRect(-s * 0.13, -s * 0.48, s * 0.26, s * 0.06);
    g.strokeStyle = c; g.lineWidth = s * 0.06; g.beginPath(); g.arc(s * 0.16, -s * 0.2, s * 0.17, -1.4, 1.0); g.stroke(); g.restore();
  },
  kylix(g, x, y, s, c) {
    g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.moveTo(-s * 0.4, -s * 0.16); g.quadraticCurveTo(0, s * 0.2, s * 0.4, -s * 0.16); g.closePath(); g.fill(); g.fillRect(-s * 0.035, 0, s * 0.07, s * 0.26); g.fillRect(-s * 0.16, s * 0.24, s * 0.32, s * 0.05);
    g.strokeStyle = c; g.lineWidth = s * 0.045; for (const k of [-1, 1]) { g.beginPath(); g.ellipse(k * s * 0.42, -s * 0.12, s * 0.09, s * 0.05, k * 0.3, 0, 7); g.stroke(); } g.restore();
  },
  seed(g, x, y, s, c) { g.save(); g.translate(x, y); g.fillStyle = c; for (const k of [-1, 1]) { g.beginPath(); g.ellipse(k * s * 0.17, 0, s * 0.24, s * 0.4, k * 0.14, 0, 7); g.fill(); } g.restore(); },
  sabre(g, x, y, s, c) { g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.moveTo(-s * 0.3, -s * 0.44); g.lineTo(-s * 0.02, -s * 0.44); g.quadraticCurveTo(s * 0.3, -s * 0.1, s * 0.3, s * 0.46); g.quadraticCurveTo(-s * 0.02, s * 0.1, -s * 0.3, -s * 0.44); g.fill(); g.restore(); },
  mask(g, x, y, s, c, bg = PAPER) {
    g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, s * 0.3, s * 0.44, 0, 0, 7); g.fill(); g.strokeStyle = bg; g.lineWidth = s * 0.035; g.lineCap = 'round';
    for (const k of [-1, 1]) { g.beginPath(); g.moveTo(k * s * 0.06, -s * 0.1); g.lineTo(k * s * 0.2, -s * 0.1); g.stroke(); } g.beginPath(); g.moveTo(0, -s * 0.08); g.lineTo(-s * 0.03, s * 0.1); g.lineTo(s * 0.04, s * 0.1); g.moveTo(-s * 0.1, s * 0.24); g.lineTo(s * 0.1, s * 0.24); g.stroke(); g.restore();
  },
  stereo(g, x, y, s, c, bg = PAPER) { rrect(g, x - s * 0.42, y - s * 0.24, s * 0.84, s * 0.48, s * 0.05, c); for (const k of [-1, 1]) { disc(g, x + k * s * 0.2, y, s * 0.13, bg); disc(g, x + k * s * 0.2, y, s * 0.07, c); } },
  sock(g, x, y, s, c, bg = PAPER) { g.save(); g.translate(x, y); g.strokeStyle = c; g.lineWidth = s * 0.26; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-s * 0.1, -s * 0.36); g.lineTo(-s * 0.1, s * 0.2); g.lineTo(s * 0.22, s * 0.26); g.stroke(); g.strokeStyle = bg; g.lineWidth = s * 0.05; for (const k of [-0.3, -0.18]) { g.beginPath(); g.moveTo(-s * 0.24, s * k); g.lineTo(s * 0.04, s * k); g.stroke(); } g.restore(); },
  frame(g, x, y, s, c) { g.strokeStyle = c; g.lineWidth = s * 0.08; g.strokeRect(x - s * 0.34, y - s * 0.4, s * 0.68, s * 0.8); ICON.leaf(g, x, y, s * 0.46, c); },
  star: ICON.star,
};

// ---- lettering ----------------------------------------------------------------------------------
// A museum label, 494 x 370: what it is, how old and where from, the facts, where the real one lives, and Quill.
const LABEL = o => (g, w, h) => {
  paper(g, w, h, PAPER, o.seed ?? 4); const u = w / 494, m = 26 * u, W = w - 2 * m;
  g.strokeStyle = DEEP; g.lineWidth = 2 * u; g.strokeRect(6 * u, 6 * u, w - 12 * u, h - 12 * u);
  T(g, o.kind, m, 27 * u, 15 * u, '#5a5a56', { f: F.bebas, a: 'left', ls: 2 }); T(g, o.no, w - m, 28 * u, 13 * u, '#8a5a2a', { f: F.elite, a: 'right' });
  let y = para(g, o.title, m, 40 * u, 28 * u, '#1f2a27', W, { f: F.playfair, w: 700, lh: 1.08 });
  y = para(g, o.sub, m, y + 2 * u, 15 * u, OX, W, { f: F.fraunces, it: 1, w: 600, lh: 1.16 });
  line(g, [[m, y + 6 * u], [m + 90 * u, y + 6 * u]], '#c9952a', 2 * u);
  y = para(g, o.body, m, y + 15 * u, (o.px ?? 15.2) * u, INK, W, { f: F.fraunces, w: 600, lh: 1.23 });
  para(g, o.note, m, Math.max(y + 5 * u, h - (o.two ? 78 : 60) * u), 20 * u, BLUE, W, { f: F.caveat, w: 700, lh: 0.98 });
  T(g, o.src, m, h - 20 * u, 11.5 * u, '#5a5a56', { f: F.bebas, a: 'left', ls: 1, max: W });
};
// The card beside a picture, 312 x 176.
const PLABEL = p => (g, w, h) => {
  paper(g, w, h, PAPER, p.file.length); const m = w * 0.06;
  T(g, p.artist, m, h * 0.15, h * 0.125, '#1f2a27', { f: F.playfair, w: 700, a: 'left', max: w * 0.88 });
  T(g, p.title, m, h * 0.32, h * 0.1, OX, { f: F.fraunces, it: 1, w: 600, a: 'left', max: w * 0.88 });
  T(g, p.date, m, h * 0.46, h * 0.085, INK, { f: F.fraunces, w: 600, a: 'left', max: w * 0.88 });
  T(g, p.coll, m, h * 0.6, h * 0.075, '#5a5a56', { f: F.bebas, a: 'left', ls: 1, max: w * 0.88 });
  para(g, p.note, m, h * 0.69, h * 0.115, BLUE, w * 0.88, { f: F.caveat, w: 700, lh: 0.98 });
};
const SECTION = (num, main, sub) => (g, w, h) => {
  board(g, w, h, DEEP, GOLD, { inset: h * 0.09, lw: 2 });
  T(g, num, h * 0.75, h * 0.5, h * 0.5, GOLD, { f: F.playfair, w: 700, it: 1 });
  T(g, main, w / 2 + h * 0.3, h * 0.38, h * 0.36, CREAM, { f: F.dm, ls: h * 0.05, max: w - h * 2.2 }); T(g, sub, w / 2 + h * 0.3, h * 0.75, h * 0.22, GOLD, { f: F.fraunces, it: 1, w: 600, max: w - h * 2.2 });
};
const NOTE = (head, body, sign, o = {}) => (g, w, h) => {
  paper(g, w, h, o.bg ?? '#f6eed8', o.seed ?? 3); const px = o.px ?? h * 0.1; let y = h * 0.07;
  if (head) { y = para(g, head, w * 0.07, y, px * 1.05, o.hc ?? OX, w * 0.86, { f: o.hf ?? F.fraunces, w: 600, it: 1, lh: 1.1 }); y += px * 0.2; }
  para(g, body, w * 0.07, y, px, INK, w * 0.86, { f: F.caveat, w: 700, lh: 1.04 });
  if (sign) T(g, sign, w * 0.93, h * 0.9, px * 1.1, BLUE, { f: F.caveat, w: 700, a: 'right' });
};
const TICKET = (txt, bg = '#f3ead2') => (g, w, h) => { paper(g, w, h, bg); T(g, txt, w / 2, h * 0.52, h * 0.62, INK, { f: F.caveat, w: 700, max: w * 0.94 }); };
// the labels in the Vesper Street case: the same form, in miniature and in deadly earnest
const VLABEL = (no, title, sub, body) => (g, w, h) => {
  paper(g, w, h, PAPER, no.length + title.length); const m = w * 0.06;
  T(g, no, w - m, h * 0.09, h * 0.07, '#8a5a2a', { f: F.elite, a: 'right' });
  let y = para(g, title, m, h * 0.12, h * 0.09, '#1f2a27', w * 0.88, { f: F.playfair, w: 700, lh: 1.05 });
  y = para(g, sub, m, y + h * 0.008, h * 0.056, OX, w * 0.88, { f: F.fraunces, it: 1, w: 600, lh: 1.12 });
  para(g, body, m, y + h * 0.025, h * 0.057, INK, w * 0.88, { f: F.fraunces, w: 600, lh: 1.2 });
};

const SIGNS = {
  name(g, w, h) {
    board(g, w, h, DEEP, GOLD, { inset: h * 0.06, lw: 3 }); ICON.star(g, w * 0.09, h * 0.3, h * 0.2, GOLD); ICON.star(g, w * 0.91, h * 0.3, h * 0.2, GOLD);
    T(g, 'The Museum of', w / 2, h * 0.2, h * 0.17, GOLD, { f: F.fraunces, it: 1, w: 600 }); T(g, 'SMALL WONDERS', w / 2, h * 0.47, h * 0.27, CREAM, { f: F.dm, ls: 4, max: w * 0.74 });
    T(g, 'founded one evening  ·  open every evening since', w / 2, h * 0.72, h * 0.095, GOLD, { f: F.bebas, ls: 2, max: w * 0.86 }); T(g, 'Keeper: Quill.  Ask me anything. I will also tell you the rest.', w / 2, h * 0.87, h * 0.11, CREAM, { f: F.caveat, w: 700, max: w * 0.88 });
  },
  rules(g, w, h) {
    paper(g, w, h, '#efe6d2', 12); g.strokeStyle = DEEP; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20);
    T(g, 'HOUSE RULES', w / 2, h * 0.075, h * 0.062, DEEP, { f: F.playfair, w: 700, ls: 3, max: w * 0.86 }); line(g, [[w * 0.3, h * 0.12], [w * 0.7, h * 0.12]], '#c9952a', 3);
    const rules = ['Please DO touch the trilobite.', 'Please do NOT lick the exhibits. (You know who you are.)', 'Wonder quietly. Gasp freely.', 'Photographs welcome. No flash: the pigeon has been through enough.', 'Questions are encouraged. Answers may run long.', 'The whale is not small. This has been noted.', 'Everything here is real, except one case. You will know it.'];
    let y = h * 0.15; rules.forEach((r, i) => { T(g, `${i + 1}.`, w * 0.09, y + h * 0.02, h * 0.046, '#c9952a', { f: F.abril, a: 'left' }); y = para(g, r, w * 0.19, y, h * 0.0345, INK, w * 0.74, { f: F.fraunces, it: 1, w: 600, lh: 1.14 }) + h * 0.014; });
    T(g, 'by order of the keeper (Quill)', w / 2, h * 0.955, h * 0.04, BLUE, { f: F.caveat, w: 700 });
  },
  lick(g, w, h) {
    fill(g, w, h, '#f4f1ea'); grain(g, w, h, 0.05, 7); g.strokeStyle = '#8a1c1c'; g.lineWidth = h * 0.05; g.strokeRect(h * 0.07, h * 0.07, w - h * 0.14, h - h * 0.14);
    T(g, 'DO NOT LICK', w / 2, h * 0.36, h * 0.3, '#8a1c1c', { f: F.archivo, max: w * 0.84 }); T(g, 'THE EXHIBITS', w / 2, h * 0.64, h * 0.2, '#8a1c1c', { f: F.archivo, max: w * 0.84 });
    T(g, 'they have been tasted before. it never ends well.', w / 2, h * 0.84, h * 0.1, INK, { f: F.fraunces, it: 1, w: 600, max: w * 0.84 });
  },
  hours(g, w, h) {
    paper(g, w, h, PAPER, 9); T(g, 'OPENING HOURS', w / 2, h * 0.16, h * 0.14, DEEP, { f: F.bebas, ls: 4 });
    [['nearly evening', 'open'], ['evening', 'open'], ['later still', 'quieter'], ['mornings', 'dusting']].forEach(([a, b], i) => { const y = h * (0.36 + i * 0.14); T(g, a, w * 0.1, y, h * 0.11, INK, { f: F.fraunces, w: 600, a: 'left' }); T(g, b, w * 0.9, y, h * 0.11, OX, { f: F.fraunces, it: 1, w: 600, a: 'right' }); line(g, [[w * 0.1, y + h * 0.065], [w * 0.9, y + h * 0.065]], '#c9b48a', 1); });
    T(g, 'admission: free. it always was.', w / 2, h * 0.92, h * 0.11, BLUE, { f: F.caveat, w: 700 });
  },
  touch(g, w, h) {
    board(g, w, h, DEEP, GOLD, { inset: h * 0.08, lw: 2 }); T(g, 'PLEASE', w * 0.36, h * 0.24, h * 0.17, GOLD, { f: F.bebas, ls: 5 }); T(g, 'DO', w * 0.63, h * 0.24, h * 0.26, CREAM, { f: F.abril });
    T(g, 'TOUCH THE TRILOBITE', w / 2, h * 0.55, h * 0.2, CREAM, { f: F.dm, ls: 2, max: w * 0.86 }); T(g, 'gently. it is 390 million years old and has earned it.', w / 2, h * 0.82, h * 0.115, GOLD, { f: F.caveat, w: 700, max: w * 0.88 });
  },
  book(g, w, h) {
    fill(g, w, h, '#f5efde'); grain(g, w, h, 0.04, 2); line(g, [[w / 2, 0], [w / 2, h]], '#cdbf9f', 3);
    for (let i = 0; i < 11; i++) line(g, [[w * 0.03, h * (0.2 + i * 0.075)], [w * 0.97, h * (0.2 + i * 0.075)]], '#d8cdb2', 1);
    T(g, 'VISITORS', w * 0.25, h * 0.09, h * 0.07, OX, { f: F.playfair, w: 700, ls: 3 }); T(g, 'please write something small', w * 0.75, h * 0.09, h * 0.065, '#5a5a56', { f: F.fraunces, it: 1, w: 600, max: w * 0.44 });
    const L = [['Came for the whale. Stayed for the sock.', '— M.', '#26364f'], ['I TOUCHED THE TRILOBITE!!!', '— Ines, age 7', '#8a1c1c'], ['Very informative. Possibly too informative.', '— a friend', '#2b2724'], ['Is the pigeon all right?', '— worried, no. 9', '#2f5a6a'], ['(He is a hero. He is fine. — Q.)', '', '#6e2a26']];
    const Rr = [['Did not lick anything. Thought about it.', '— Juniper', '#2f4a2a'], ['p. 1: lovely. p. 2: see p. 1.', '— Folio', '#2f5a6a'], ['That 10 mm socket is MINE.', '— the bike shop', '#2b2724'], ['Small. Wonderful. As advertised.', '— passing through', '#4a2240'], ['I sat with the strawberries for an hour.', '— no name. thank you.', '#8a5a2a']];
    [L, Rr].forEach((col, k) => col.forEach(([s, who, c], i) => { const x = w * (0.035 + k * 0.5), y = h * (0.235 + i * 0.15); T(g, s, x, y, h * 0.068, c, { f: F.caveat, w: 700, a: 'left', max: w * 0.44 }); if (who) T(g, who, x + w * 0.44, y + h * 0.072, h * 0.058, c, { f: F.caveat, w: 700, a: 'right', max: w * 0.4 }); }));
  },
  plan(g, w, h) {
    paper(g, w, h, '#efe6d2', 6); g.strokeStyle = DEEP; g.lineWidth = 3; g.strokeRect(8, 8, w - 16, h - 16);
    T(g, 'FLOOR PLAN', w / 2, h * 0.055, h * 0.05, DEEP, { f: F.dm, ls: 4 }); T(g, '(it is one room. we drew it anyway.)', w / 2, h * 0.105, h * 0.032, BLUE, { f: F.caveat, w: 700 });
    const x0 = w * 0.1, y0 = h * 0.14, rw = w * 0.8, rh = h * 0.47, P = (a, d) => [x0 + rw * a / 31, y0 + rh * (1 - d / 30.7)];
    g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x0, y0, rw, rh); rect(g, P(13.6, 0)[0], y0 + rh - 3, rw * 3.8 / 31, 7, '#efe6d2');
    T(g, 'door', P(15.5, 0)[0], y0 + rh + h * 0.02, h * 0.026, INK, { f: F.fraunces, it: 1, w: 600 });
    line(g, [P(1.5, 30.2), P(29.5, 30.2)], OX, 5); for (const [a0, a1] of [[6.5, 12], [19, 24.5]]) line(g, [P(a0, 23.8), P(a1, 23.8)], '#8a5a2a', 5);
    rect(g, P(27.4, 12.2)[0], P(27.4, 12.2)[1], rw * 3.4 / 31, rh * 5.4 / 30.7, '#c9b48a');
    const N = [[1.2, 8.2, 1], [1.2, 12.4, 2], [1.2, 16.6, 3], [1.2, 20.8, 4], [1.2, 25, 5], [15.5, 10.2, 6], [8.6, 14.6, 7], [22.6, 15.2, 8], [15.5, 18.2, 9], [29.8, 15.6, 10], [29.8, 19.8, 11], [29.8, 24, 12], [15.5, 28.6, 13], [6.6, 2.4, 14], [24.3, 2.4, 15], [29, 9.5, 16]];
    for (const [a, d, n] of N) { const [x, y] = P(a, d); disc(g, x, y, h * 0.019, n === 9 ? OX : DEEP); T(g, String(n), x, y + 1, h * 0.022, CREAM, { f: F.archivo }); }
    const LG = ['megalodon tooth', 'trilobite (touch it)', 'uncoiled ammonite', 'sabre-tooth', 'coco de mer', 'Cher Ami, pigeon, hero', "Lincoln's life mask", 'stereoscope', 'small wonders of Vesper St', 'Greek wine cup', 'colonoware pot', "Commeraw's jug", 'the picture wall (sit down)', 'whale (not small)', 'guardian monster', 'desk, postcards, Quill'];
    LG.forEach((s, i) => { const x = w * (0.07 + (i % 2) * 0.46), y = h * (0.685 + Math.floor(i / 2) * 0.034); T(g, `${i + 1}`, x, y, h * 0.024, OX, { f: F.archivo, a: 'left' }); T(g, s, x + w * 0.055, y, h * 0.026, INK, { f: F.fraunces, w: 600, a: 'left', max: w * 0.38 }); });
    T(g, 'YOU ARE HERE', P(10.4, 5.4)[0], P(10.4, 5.4)[1], h * 0.022, '#8a1c1c', { f: F.bebas, ls: 1 }); T(g, 'suggested route: wander.', w / 2, h * 0.965, h * 0.034, BLUE, { f: F.caveat, w: 700 });
  },
  evening(g, w, h) {
    fill(g, w, h, '#b08d4a'); grain(g, w, h, 0.08, 3); g.strokeStyle = '#3a2c24'; g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8);
    T(g, 'THE EVENING', w / 2, h * 0.2, h * 0.2, '#2a1c13', { f: F.dm, ls: 3, max: w * 0.9 }); T(g, 'Artist unknown.  Light on atmosphere, c. always.', w / 2, h * 0.44, h * 0.115, '#2a1c13', { f: F.fraunces, it: 1, w: 600, max: w * 0.92 });
    T(g, 'On permanent loan from the sky.', w / 2, h * 0.62, h * 0.115, '#2a1c13', { f: F.fraunces, w: 600, max: w * 0.92 }); T(g, 'Stand here. Look through. Both sides are the front.', w / 2, h * 0.83, h * 0.12, '#3a2214', { f: F.caveat, w: 700, max: w * 0.92 });
  },
};
const BANNER = (top, big, small, pic) => (g, w, h) => {
  fill(g, w, h, '#2c3a36'); grain(g, w, h, 0.06, 5); g.strokeStyle = GOLD; g.lineWidth = 3; g.strokeRect(8, 8, w - 16, h - 16);
  T(g, top, w / 2, h * 0.09, w * 0.12, GOLD, { f: F.fraunces, it: 1, w: 600, max: w * 0.84 });
  big.forEach((s, i) => T(g, s, w / 2, h * (0.2 + i * 0.105), w * 0.2, CREAM, { f: F.dm, ls: 2, max: w * 0.8 }));
  PIC[pic](g, w / 2, h * 0.56, w * 0.5, GOLD, '#2c3a36');
  small.forEach((s, i) => T(g, s, w / 2, h * (0.75 + i * 0.065), w * 0.1, i === small.length - 1 ? GOLD : CREAM, { f: i === small.length - 1 ? F.caveat : F.bebas, w: 700, ls: i === small.length - 1 ? 0 : 2, max: w * 0.84 }));
};
const WBANNER = (a, b, c) => (g, w, h) => {
  fill(g, w, h, '#efe6d2'); grain(g, w, h, 0.05, 8); rect(g, 0, 0, w, h * 0.06, DEEP); rect(g, 0, h * 0.94, w, h * 0.06, DEEP);
  T(g, a, w / 2, h * 0.26, h * 0.15, OX, { f: F.fraunces, it: 1, w: 600, max: w * 0.9 }); T(g, b, w / 2, h * 0.52, h * 0.27, DEEP, { f: F.dm, ls: 3, max: w * 0.9 }); T(g, c, w / 2, h * 0.79, h * 0.14, BLUE, { f: F.caveat, w: 700, max: w * 0.9 });
};
const CARDS = [['tooth', 'megalodon', '#26364f', '#f1e6cf'], ['trilobite', 'I touched it', '#c9952a', '#2a1c13'], ['pigeon', 'cher ami', '#9fb0a4', '#2a1c13'], ['whale', 'not small', '#2f5a6a', '#f1e6cf'], ['ammonite', 'different shape', '#8a1c1c', '#f1e6cf'], ['seed', 'it is a seed', '#3a6a3a', '#f1e6cf'],
  ['kylix', 'hold it level', '#e8e2d4', '#6e2a26'], ['jug', 'commeraw', '#2a63b8', '#f4f1ea'], ['sabre', 'not a tiger', '#e0782a', '#2a1c13'], ['mask', 'spring, 1860', '#4a2240', '#f1e6cf'], ['sock', 'the lost sock', '#f3d96a', '#8a1c1c'], ['stereo', 'look twice', '#17140f', '#e8c73a']];
const POSTCARD = ([pic, cap, bg, ink]) => (g, w, h) => { fill(g, w, h, bg); grain(g, w, h, 0.07, cap.length); g.strokeStyle = ink; g.lineWidth = 2; g.strokeRect(5, 5, w - 10, h - 10); PIC[pic](g, w / 2, h * 0.4, w * 0.62, ink, bg); T(g, cap, w / 2, h * 0.8, h * 0.105, ink, { f: F.caveat, w: 700, max: w * 0.84 }); T(g, 'SMALL WONDERS', w / 2, h * 0.92, h * 0.055, ink, { f: F.bebas, ls: 2 }); };

// ---- the collection --------------------------------------------------------------------------------
const SI = ' · 3D scan: Smithsonian Open Access, CC0';
const EX = {
  megalodon: { kind: 'FOSSIL  ·  SHARK', no: 'NMNH Paleobiology', title: 'Megalodon tooth', sub: 'Carcharocles megalodon  ·  Miocene, between 23 and 5 million years old  ·  Hawthorn Formation, Coffee County, Georgia',
    body: 'One tooth from the largest shark that ever lived, about fifteen metres long. It grew them in rows and shed them all its life, thousands in all. A shark\'s skeleton is cartilage and rots away, so the teeth are nearly all that megalodon left behind. Collected by A. H. Staples.',
    note: 'It is as big as a hand. Hold yours up to the glass. Go on. — Q.', src: 'Smithsonian National Museum of Natural History' + SI },
  trilobite: { kind: 'FOSSIL  ·  TRILOBITE', no: 'USNM PAL 794206', title: 'Trilobite (please touch)', sub: 'Coltraneia oufatenensis  ·  Devonian, about 390 million years old  ·  Morocco',
    body: 'Look at the eyes: towers of lenses, and every lens a single crystal of calcite. It saw nearly all the way round without turning. Trilobites lasted some 270 million years, far longer than the dinosaurs managed. The genus was named in 1997 after John Coltrane, the saxophonist.',
    note: 'Stroke it along the ribs, please, not against. — Q.', src: 'Smithsonian National Museum of Natural History' + SI },
  ammonite: { kind: 'FOSSIL  ·  AMMONITE', no: 'USNM PAL 430970', title: 'Uncoiled ammonite', sub: 'Exiteloceras jenneyi  ·  Late Cretaceous, about 75 million years old  ·  Pierre Shale, Carter County, Montana',
    body: 'Most ammonites coiled up tight. This one grew its shell in an open loop, the turns never touching: a "heteromorph", Greek for "different shape". It lived in a warm sea that then covered the middle of North America. Collected in 1987 by H. Ehrle.',
    note: 'Nobody told it what an ammonite should look like. Good. — Q.', src: 'Smithsonian National Museum of Natural History' + SI },
  smilodon: { kind: 'FOSSIL  ·  CAT', no: 'USNM V 8570', title: 'Sabre-tooth', sub: 'Smilodon fatalis  ·  Pleistocene, the last Ice Age  ·  Palos Verdes Sand, California',
    body: 'A tooth of the sabre-toothed cat, which was not a tiger and was built more like a bear. The great canines grew about six millimetres a month, with edges serrated like a steak knife: strong front to back, fragile sideways. Catalogued alongside dire wolf and bison. Smilodon died out about 10,000 years ago.',
    note: 'The only cat on this street is concrete. I am content with that. — Q.', src: 'Smithsonian National Museum of Natural History' + SI, px: 14.6 },
  coco: { kind: 'SEED  ·  PALM', no: 'US National Herbarium', title: 'Coco de mer', sub: 'Lodoicea maldivica  ·  the islands of Praslin and Curieuse, Seychelles',
    body: 'The largest seed of any plant on Earth: fifteen to twenty kilograms, and six or seven years ripening on the tree. For centuries it was known only from empty husks washed up on far shores. Sailors decided it must grow on trees at the bottom of the sea; hence "coconut of the sea".',
    note: 'It is a seed. I tell every visitor. Nobody believes me. — Q.', src: 'Smithsonian National Museum of Natural History, Botany' + SI },
  kylix: { kind: 'POTTERY  ·  GREECE', no: 'Cooper Hewitt 1971-48-12', title: 'Kylix (wine cup)', sub: 'Greece  ·  about 800 BC  ·  painted earthenware',
    body: 'A cup for wine mixed with water, made about when the Iliad was still sung rather than read. Two handles and a wide, shallow bowl: it had to be held level, which grew harder as the evening went on. The museum that owns it lists its catalogue entry as "research in progress". After 2,800 years.',
    note: '"Research in progress": the most honest label in any museum. — Q.', src: 'Cooper Hewitt, Smithsonian Design Museum · gift of Ruth Vollmer' + SI, px: 14.6 },
  colono: { kind: 'POTTERY  ·  SOUTH CAROLINA', no: 'NMAAHC 2017.108.1.1', title: 'Colonoware pot', sub: 'Maker unrecorded  ·  18th century  ·  Cooper River, Charleston County, South Carolina',
    body: 'Built by hand without a wheel and fired in an open fire without a kiln. Colonoware was made by enslaved African Americans, and by Native Americans, for their own cooking and eating. A band of stippled dots runs round the neck. It was found broken and has been mended; the base is restored in painted plaster.',
    note: 'Somebody pressed in those dots one at a time. Look closely. — Q.', src: 'Smithsonian National Museum of African American History and Culture' + SI, px: 14.6 },
  commeraw: { kind: 'POTTERY  ·  NEW YORK', no: 'NMAAHC 2011.61', title: 'Stoneware jug', sub: 'Thomas W. Commeraw  ·  about 1797 to 1819  ·  Corlears Hook, New York City',
    body: 'Salt-glazed stoneware with swags of cobalt blue. Commeraw was a free Black potter who ran his own pottery on the East River shore of Manhattan for some twenty years, and stamped his pots with his name. For most of the two centuries since, collectors assumed he was white. The census had said otherwise all along.',
    note: 'He signed his work in capitals. Quite right too. — Q.', src: 'Smithsonian National Museum of African American History and Culture' + SI, px: 14.6 },
  lincoln: { kind: 'PLASTER  ·  LIFE MASK', no: 'NPG.71.24', title: 'Abraham Lincoln, from life', sub: 'Leonard Wells Volk  ·  Chicago, spring 1860  ·  this plaster cast made in 1917',
    body: 'Not a sculpture: a mould taken from the living face. Lincoln sat about an hour under wet plaster and called the business "anything but agreeable". He was fifty-one, a lawyer from Springfield, not yet nominated for President, and had not yet grown the beard.',
    note: 'No beard, and no idea what is coming. I find I lower my voice. — Q.', src: 'National Portrait Gallery, Smithsonian Institution' + SI },
  cherami: { kind: 'BIRD  ·  HERO', no: 'NMAH AF.30714', title: 'Cher Ami', sub: 'Homing pigeon, U.S. Army Signal Corps  ·  France, 1918',
    body: 'On 4 October 1918 a cut-off American battalion in the Argonne was being shelled by its own guns. Cher Ami is credited with carrying the message that stopped them, arriving shot through the breast with one leg hanging by a tendon. France awarded the Croix de Guerre. In 2021 a DNA test settled a century-old argument: Cher Ami was a cock.',
    note: '"Cher ami" means "dear friend". Yes. Exactly. — Q.', src: 'Smithsonian National Museum of American History' + SI, px: 14.6 },
  stereo: { kind: 'INSTRUMENT  ·  PARIS', no: 'NMAAHC 2017.111.16', title: 'Stereoscope', sub: 'A. Mattey  ·  Paris, between 1905 and 1920  ·  wood, glass and metal',
    body: 'A box for looking at two photographs at once. The pair is taken from two points as far apart as your eyes. Each lens shows one picture to one eye, and the brain, gently fooled, builds a single view with depth in it. Charles Wheatstone worked out the principle in 1838. It still works. It will always work.',
    note: 'Two flat things make one deep thing. I think about this a lot. — Q.', src: 'Smithsonian NMAAHC · gift of Alan Laird' + SI, px: 14.6 },
  monster: { kind: 'STONE  ·  GUARDIAN', no: 'Freer F1916.345', title: 'Kneeling winged monster', sub: 'China, Northern Qi dynasty, 550 to 577  ·  limestone  ·  from the Xiangtangshan cave temples, Hebei',
    body: 'One of a pair of guardians that knelt either side of a doorway in a Buddhist temple cut into a mountain. Part lion, part bird, part bad dream. The ugliness was the point: it was believed to turn evil away at the door. 88 centimetres tall.',
    note: 'It guards our door now. Nothing evil has come in. One wasp. — Q.', src: 'National Museum of Asian Art, Smithsonian · gift of Charles Lang Freer' + SI },
  whale: { kind: 'BRONZE  ·  WHALE', no: 'on long loan', title: 'Humpback whale', sub: 'Megaptera novaeangliae  ·  bronze, sculptor not recorded  ·  about 1.1 metres tall',
    body: 'The name means "big-winged New Englander": a humpback\'s flippers are a third as long as its body, the longest of any whale. The males sing songs that go on for twenty minutes and change a little every year, and all the males in one ocean sing the current version.',
    note: 'This whale is not small. I am aware. It is small for a whale. — Q.', src: 'Photoscanned by Poly Haven (polyhaven.com), CC0' },
};
// the picture wall, left to right; a column is one picture or two. w = width of the image in feet, r = its width / height
const AIC = 'Art Institute of Chicago', RIJKS = 'Rijksmuseum, Amsterdam';
const WALL = [
  [{ file: 'morris_willow_bough', w: 2.1, r: 792 / 1024, paper: 1, artist: 'William Morris', title: 'Willow Bough', date: 'wallpaper, designed 1887', coll: 'The Metropolitan Museum of Art, New York', note: 'Drawn from the willows on his own riverbank.' }],
  [{ file: 'redoute_rose', w: 1.35, r: 710 / 1024, paper: 1, artist: 'Pierre-Joseph Redouté', title: 'Rosa centifolia foliacea', date: 'from Les Roses, 1817 to 1824', coll: 'stipple engraving, finished by hand', note: 'Every dot is a dot. Thousands. Lean in.' },
    { file: 'coorte_strawberries', w: 1.55, r: 809 / 1024, artist: 'Adriaen Coorte', title: 'Strawberries on a Stone Ledge', date: '1696', coll: RIJKS, note: 'Forgotten for two centuries. The strawberries waited.' }],
  [{ file: 'van_gogh_almond_blossom', w: 3.5, r: 1024 / 809, artist: 'Vincent van Gogh', title: 'Almond Blossom', date: '1890', coll: 'Van Gogh Museum, Amsterdam', note: 'Painted for his newborn nephew, to hang over the bed.' }],
  [{ file: 'museum/durer_hare', w: 1.6, r: 996 / 1100, paper: 1, artist: 'Albrecht Dürer', title: 'Young Hare', date: '1502, watercolour', coll: 'Albertina, Vienna', note: 'Look in its eye. A window is reflected there.' },
    { file: 'museum/durer_turf', w: 1.45, r: 856 / 1100, paper: 1, artist: 'Albrecht Dürer', title: 'The Great Piece of Turf', date: '1503, watercolour', coll: 'Albertina, Vienna', note: 'Dandelion, plantain, meadow grass. Weeds, by a master.' }],
  [{ file: 'milkmaid', w: 2.6, r: 913 / 1024, artist: 'Johannes Vermeer', title: 'The Milkmaid', date: 'about 1660', coll: RIJKS, note: 'The only thing moving is the milk.' }],
  [{ file: 'vermeer_little_street', w: 2.3, r: 827 / 1024, artist: 'Johannes Vermeer', title: 'The Little Street', date: 'about 1658', coll: RIJKS, note: 'Probably Vlamingstraat, Delft. His aunt lived there.' }],
  [{ file: 'fantin_latour_roses', w: 2.3, r: 843 / 703, artist: 'Henri Fantin-Latour', title: 'Roses in a Bowl', date: '1881', coll: AIC, note: 'He painted roses the way others painted faces.' },
    { file: 'van_gogh_grapes_lemons', w: 2.3, r: 1024 / 848, artist: 'Vincent van Gogh', title: 'Grapes, Lemons, Pears, and Apples', date: '1887', coll: AIC, note: 'Even the tablecloth is in a hurry.' }],
  [{ file: 'cezanne_basket_of_apples', w: 3.1, r: 1024 / 817, artist: 'Paul Cézanne', title: 'The Basket of Apples', date: 'about 1893', coll: AIC, note: 'The table does not line up. He knew. Look again.' }],
  [{ file: 'hiroshige_kameido_plum', w: 1.7, r: 704 / 1024, paper: 1, artist: 'Utagawa Hiroshige', title: 'Plum Garden at Kameido', date: '1857, woodblock print', coll: 'this impression: Chester Beatty, Dublin', note: 'Van Gogh copied it in oils, thirty years on.' }],
];
const FACTS = ['A trilobite saw the world through lenses of solid crystal.', 'Sharks are older than trees.', 'There are more trees on Earth than stars in the Milky Way: about three trillion.', 'A day on Venus is longer than its year.', 'Wombat droppings are cubes.', 'The dot over an i is called a tittle.', 'An octopus has three hearts and blue blood.', 'A humpback\'s song can be heard twenty miles away.'];

export default function museum(kit, lot) {
  const K = tools(kit, 83), X = fixtures(kit, K), { ves, hcyl, ball, tube, jar } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                        // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D, FLOOR = lot.fr(kit, 0, 0).h;
  const use = [];                                            // things to do with E, wired up once the scene exists
  const spot = (f, x, y, z, label, act, reach = 5.5) => { const [wx, wz] = kit.world(f, x, y); use.push({ x: wx, y: f.h + z, z: wz, reach, label, act }); };
  // a drawn board leaning back by `tilt`, with a wooden back
  const lean = (f, x, y, z, w, tall, tilt, draw, cw, ch, back = DARKW) => {
    kit.put(f, back, kit.geom.bev(-w / 2 - 0.05, w / 2 + 0.05, -0.045, -0.008, -tall / 2 - 0.05, tall / 2 + 0.05, 0.008), { rx: tilt, at: [x, y, z] });
    kit.sign(f, x, y, z, w, tall, draw, { cw, ch, tilt, rough: 0.9 });
  };
  const label = (f, x, y, z, e, o = {}) => kit.sign(f, x, y, z, 1.9, 1.42, LABEL(e), { cw: 494, ch: 370, rough: 0.9, ...o });
  // a painted plinth with a glass case on it; returns the height things stand on
  const plinthCase = (f, x0, x1, y0, y1, h, tall, glass = true) => {
    f.box('c#2b2724/0.8', x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.05, 0, 0.22); f.box(GREEN, x0, x1, y0, y1, 0.22, h - 0.07, G); f.box(DESKTOP, x0 - 0.05, x1 + 0.05, y0 - (y0 > 0.1 || y0 < 0 ? 0.05 : 0), y1 + 0.05, h - 0.07, h, G);
    f.block(x0, x1, Math.min(y0, 0), y1, 0, h + (glass ? tall : 0.3));
    if (glass) X.glassCase(f, x0 + 0.1, x1 - 0.1, y0 + 0.1, y1 - 0.1, h, tall, { base: LINENC }); else f.box(LINENC, x0 + 0.1, x1 - 0.1, y0 + 0.1, y1 - 0.1, h, h + 0.03);
    return h + 0.03;
  };
  const riser = (f, x, y, z, w, d, t) => { f.box(LINENC, x - w / 2, x + w / 2, y - d / 2, y + d / 2, z, z + t); return z + t; };

  // ---- a case against a side wall, its label on the wall above ---------------------------------------------
  function wallCase(side, d, e, model, o = {}) {
    const f = side === 'L' ? at(0.02, d, 0, 'right') : at(W - 0.02, d, 0, 'left');       // y = 0 at the wall, +y out into the room
    const w = o.w ?? 2.2, dep = o.dep ?? 1.75, h = o.h ?? 3.45, tall = o.tall ?? 1.35;
    let z = plinthCase(f, -w / 2, w / 2, 0.02, dep, h, tall, o.glass !== false);
    if (o.rise) z = riser(f, 0, dep / 2 + 0.03, z, o.rw ?? 0.8, o.rd ?? 0.6, o.rise);
    kit.model(model, f, o.mx ?? 0, dep / 2 + 0.03 + (o.my ?? 0), z, o.dq ?? 0, { turn: o.turn ?? 0 });
    f.box(DARKW, -1.0, 1.0, 0.004, 0.02, 5.36, 6.9); label(f, 0, 0.032, 6.13, e);
    return { f, z, dep, h };
  }
  // DEEP TIME, down the left wall
  { const c = wallCase('L', 8.2, EX.megalodon, 'si_megalodon_tooth', { rise: 0.32, rw: 0.7, rd: 0.5 }); for (const s of [-0.1, 0.1]) for (const k of [-0.085, 0.085]) c.f.cyl(BRASS, s, c.dep / 2 + 0.03 + k, c.z, c.z + 0.17, 0.008, 0.008, 5); }
  const tri = wallCase('L', 12.4, EX.trilobite, 'si_trilobite', { glass: false, h: 3.3, rise: 0.1, rw: 1.3, rd: 0.75, my: 0.06 });
  tri.f.box(DARKW, -0.9, 0.9, tri.dep, tri.dep + 0.045, tri.h - 1.0, tri.h - 0.28); kit.sign(tri.f, 0, tri.dep + 0.057, tri.h - 0.64, 1.7, 0.62, SIGNS.touch, { cw: 360, ch: 132 });
  spot(tri.f, 0, tri.dep / 2, tri.h + 0.4, () => 'touch the trilobite (you are allowed)', ctx => ctx.flash(K.pick(['Cool, ridged, and 390 million years old. It did not mind.', 'You stroke the trilobite along the ribs. Quill nods, visibly moved.', 'Stone now, but it was an animal once, with crystal eyes. You touched it.'])));
  wallCase('L', 16.6, EX.ammonite, 'si_ammonite_exiteloceras', { rise: 0.4, rw: 0.9, rd: 0.7 });
  { const c = wallCase('L', 20.8, EX.smilodon, 'si_smilodon_sabre_tooth', { rise: 0.3, rw: 1.0, rd: 0.5 });       // two brass prongs hold the tooth upright
    for (const s of [-0.16, 0.16]) for (const k of [-0.06, 0.06]) c.f.cyl(BRASS, s, c.dep / 2 + 0.03 + k, c.z, c.z + 0.2, 0.008, 0.008, 5); }
  wallCase('L', 25.0, EX.coco, 'si_coco_de_mer_seed', { w: 2.4, tall: 1.4, rise: 0.12, rw: 1.5, rd: 1.25 });
  { const s = at(0.02, 16.6, 0, 'right'); s.box(DARKW, -3.6, 3.6, 0.004, 0.03, 8.5, 9.6); kit.sign(s, 0, 0.042, 9.05, 7.0, 0.94, SECTION('I', 'DEEP TIME', 'things that were alive a very long while ago'), { cw: 720, ch: 96 }); }
  // MADE BY HAND, down the right wall beyond the desk
  wallCase('R', 15.6, EX.kylix, 'si_kylix_greek_cup', { rise: 0.45, rw: 1.0, rd: 0.8 });
  wallCase('R', 19.8, EX.colono, 'si_colonoware_pot', { rise: 0.1, rw: 1.2, rd: 1.1 });
  wallCase('R', 24.0, EX.commeraw, 'si_stoneware_jug_commeraw', { tall: 1.6, rise: 0.06, rw: 1.2, rd: 1.1 });
  { const s = at(W - 0.02, 19.8, 0, 'left'); s.box(DARKW, -3.6, 3.6, 0.004, 0.03, 8.5, 9.6); kit.sign(s, 0, 0.042, 9.05, 7.0, 0.94, SECTION('II', 'MADE BY HAND', 'things somebody shaped, and somebody else kept'), { cw: 720, ch: 96 }); }

  // ---- cases that stand in the room: label on a slope at the front, facing the door -------------------------
  function floorCase(a, d, e, model, o = {}) {
    const f = at(a, d, 0, 'street'), w = o.w ?? 1.9, dep = o.dep ?? 1.8, h = o.h ?? 3.4, tall = o.tall ?? 1.4;      // +y toward the door
    let z = plinthCase(f, -w / 2, w / 2, -dep / 2, dep / 2, h, tall);
    if (o.rise) z = riser(f, 0, 0, z, o.rw ?? 0.9, o.rd ?? 0.8, o.rise);
    kit.model(model, f, 0, 0, z, o.dq ?? 0, { turn: o.turn ?? 0 });
    lean(f, 0, dep / 2 + 0.64, h - 0.52, 1.9, 1.42, 0.95, LABEL(e), 494, 370);
    for (const s of [-0.7, 0.7]) tube(f, BRASS, [[s, dep / 2, h - 0.5], [s, dep / 2 + 0.56, h - 0.62]], 0.02, 5);
    f.block(-0.95, 0.95, dep / 2, dep / 2 + 1.2, 0, h - 0.2);
    return { f, z };
  }
  floorCase(15.5, 10.2, EX.cherami, 'si_cher_ami_pigeon', { rise: 0.35, rw: 1.2, rd: 0.8 });
  floorCase(8.6, 14.6, EX.lincoln, 'si_abraham_lincoln', { rise: 0.3, rw: 1.0, rd: 0.8 });
  floorCase(22.6, 15.2, EX.stereo, 'si_stereoscope', { rise: 0.5, rw: 1.0, rd: 0.9, turn: 0.5 });

  // ---- Small Wonders of Vesper Street: the one invented case, catalogued with a straight face -----------------
  {
    const v = at(15.5, 18.2, 0, 'street'), TOP = X.plinth(v, 0, 0, 5.6, 2.3, 3.0, { mat: OAK, shelf: 0.95 });       // +y toward the door, x toward smaller a
    X.glassCase(v, -2.7, 2.7, -1.05, 1.05, TOP, 0.82, { base: 'c#2f4a2a/0.8' });
    const z = TOP + 0.031, ITEMS = [
      ['VS.0001', 'The Lost Sock', 'Wool blend, one (1). Found Tuesday.', 'Left foot, we believe. Its partner remains at large and is not thought dangerous. Do not approach with a matching sock.'],
      ['VS.0002', 'A Very Good Stick', 'Sycamore. 61 cm. Slight curve.', 'Excellent heft. Collected by a dog and donated under protest. See the back of the case: it would not fit on a cushion.'],
      ['VS.0003', 'The 10 mm Socket', 'Chrome vanadium steel.', 'The only 10 mm socket known to science that is still where somebody left it. Please do not move it. Please.'],
      ['VS.0004', 'Tin, First Tinned Fish Swap', 'Sardines in olive oil (empty).', 'Exchanged for one mackerel in tomato and a firm handshake. Everything on this street followed from this tin.'],
      ['VS.0005', 'Pencil Stub', 'Cedar and graphite. 2.1 cm.', 'Worn to this length in the margins of Marginalia. Donor: Folio, who would like it noted that it is still sharp.'],
      ['VS.0006', 'One Evening, Sealed', 'Glass jar, brass lid, light.', 'Collected on this street at 7.42. The contents have not changed. They do not appear to intend to.'],
    ];
    ITEMS.forEach((it, i) => { const x = 2.22 - i * 0.888; kit.sign(v, x, 0.5, z + 0.004, 0.84, 0.94, VLABEL(...it), { flat: true, cw: 232, ch: 260, rough: 0.9 }); if (i !== 1) v.box('c#8a1c1c/0.8', x - 0.3, x + 0.3, -0.5, -0.02, z, z + 0.035); });
    const zc = z + 0.036, xs = i => 2.22 - i * 0.888;
    // the sock
    tube(v, 'c#2f5a6a/0.8', [[xs(0) + 0.2, -0.36, zc + 0.07], [xs(0) - 0.06, -0.36, zc + 0.07], [xs(0) - 0.13, -0.33, zc + 0.07], [xs(0) - 0.15, -0.14, zc + 0.07]], 0.07, 8, true);
    for (const k of [0.16, 0.1]) hcyl(v, 'c#efe2bc/0.8', 'x', xs(0) + k, -0.36, zc + 0.07, 0.025, 0.074, 0.074, 8); ball(v, 'c#efe2bc/0.8', xs(0) - 0.15, -0.12, zc + 0.005, 0.066, 8);
    // the stick, along the back
    tube(v, 'c#6a4a2a/0.8', [[-1.0, -0.84, z + 0.05], [-0.4, -0.8, z + 0.06], [0.3, -0.86, z + 0.055], [1.0, -0.8, z + 0.045]], t => 0.04 - 0.014 * t, 6, true); tube(v, 'c#6a4a2a/0.8', [[0.3, -0.86, z + 0.055], [0.52, -0.72, z + 0.07], [0.66, -0.7, z + 0.07]], 0.014, 5, true);
    kit.sign(v, xs(1), -0.26, zc + 0.002, 0.5, 0.3, TICKET('← the stick  →'), { flat: true, cw: 120, ch: 72 });
    // the socket
    v.cyl('c#d4d6d8/0.12/1', xs(2), -0.26, zc, zc + 0.085, 0.042, 0.038, 12); v.cyl('c#17140f/0.45', xs(2), -0.26, zc + 0.085, zc + 0.087, 0.026, 0.026, 6);
    // the tin
    v.soft('c#c9ccd0/0.2/1', xs(3) - 0.21, xs(3) + 0.21, -0.4, -0.12, zc, zc + 0.075, 0.03);
    kit.sign(v, xs(3), -0.26, zc + 0.079, 0.36, 0.22, (g, w, h) => { fill(g, w, h, '#26364f'); ICON.fish(g, w * 0.5, h * 0.36, h * 0.6, '#e9c46a', '#26364f'); T(g, 'SARDINES', w / 2, h * 0.8, h * 0.24, '#f1e6cf', { f: F.bebas, ls: 2 }); }, { flat: true, cw: 108, ch: 66 });
    // the pencil stub
    hcyl(v, 'c#e8c73a/0.45', 'x', xs(4), -0.26, zc + 0.012, 0.055, 0.012, 0.012, 6); hcyl(v, 'c#c9a77a/0.8', 'x', xs(4) - 0.037, -0.26, zc + 0.012, 0.02, 0.012, 0.002, 6);
    // the jar of evening
    jar(v, xs(5), -0.26, zc, 0.1, 0.27, null, 0, BRASS); ball(v, 'e#ffd9a0/2.2', xs(5), -0.26, zc + 0.05, 0.055, 8);
    lean(v, 0, 1.77, 2.5, 2.9, 1.2, 0.95, (g, w, h) => {
      paper(g, w, h, PAPER, 5); g.strokeStyle = DEEP; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12);
      T(g, 'LOCAL COLLECTION', w * 0.04, h * 0.11, h * 0.065, '#5a5a56', { f: F.bebas, a: 'left', ls: 2 }); T(g, 'VS.0001 to VS.0006', w * 0.96, h * 0.11, h * 0.055, '#8a5a2a', { f: F.elite, a: 'right' });
      T(g, 'Small Wonders of Vesper Street', w * 0.04, h * 0.27, h * 0.13, '#1f2a27', { f: F.playfair, w: 700, a: 'left', max: w * 0.92 });
      const y = para(g, 'Objects of the kind everybody has seen and nobody has kept. Acquired by gift, by finding and, in one case, by waiting. This is the only case in the museum whose labels are not strictly true. They are, however, accurate.', w * 0.04, h * 0.38, h * 0.066, INK, w * 0.92, { f: F.fraunces, w: 600, lh: 1.22 });
      para(g, 'If you have lost a sock, it is not this one. I am sorry. I did check. — Q.', w * 0.04, y + h * 0.03, h * 0.085, BLUE, w * 0.92, { f: F.caveat, w: 700 });
    }, 640, 265);
    for (const s of [-1.1, 1.1]) tube(v, BRASS, [[s, 1.15, 2.5], [s, 1.7, 2.4]], 0.02, 5);
    v.block(-1.5, 1.5, 1.15, 2.3, 0, 2.8);
    X.pendant(v, 0, 0, { kind: 'dome', drop: 4.6, colour: 'c#2f4a40/0.35', power: 1.0 });
  }

  // ---- the picture wall: small things, looked at closely -----------------------------------------------------
  {
    const b = at(W / 2, D - 0.02, 0, 'street');              // on the back wall: x runs toward smaller a
    const outer = p => p.w + (p.paper ? 0.46 : 0.32), tallOf = p => p.w / p.r + (p.paper ? 0.46 : 0.32);
    const widths = WALL.map(col => Math.max(...col.map(outer))), gap = (W - 1.8 - widths.reduce((s, v) => s + v, 0)) / (WALL.length - 1);
    const hang = (p, a, zc) => kit.picture(b, p.file, W / 2 - a, zc, p.w, p.w / p.r, p.paper ? { frame: 'c#17140f/0.45', border: 0.08, mat: 0.15 } : { frame: 'c#b08d4a/0.35/1', border: 0.16 });
    const card = (p, a, zc) => { b.box(CREAMP, W / 2 - a - 0.77, W / 2 - a + 0.77, 0.004, 0.018, zc - 0.445, zc + 0.445); kit.sign(b, W / 2 - a, 0.03, zc, 1.5, 0.85, PLABEL(p), { cw: 336, ch: 190, rough: 0.9 }); };
    const lamp = (a, top, w) => { tube(b, BRASS, [[W / 2 - a, 0.02, top + 0.16], [W / 2 - a, 0.2, top + 0.4], [W / 2 - a, 0.5, top + 0.36]], 0.018, 5); hcyl(b, BRASS, 'x', W / 2 - a, 0.5, top + 0.36, w, 0.05, 0.05, 8); b.box(GLOW, W / 2 - a - w / 2 + 0.04, W / 2 - a + w / 2 - 0.04, 0.47, 0.53, top + 0.296, top + 0.312); };
    let a = 0.9;
    WALL.forEach((col, i) => {
      const ac = a + widths[i] / 2; a += widths[i] + gap;
      if (col.length === 1) { const p = col[0], t = tallOf(p); hang(p, ac, 6.5); card(p, ac, 4.2); lamp(ac, 6.5 + t / 2, Math.min(1.8, p.w * 0.6)); }
      else { const [p, q] = col, t = tallOf(p), u = tallOf(q), top = 9.5; hang(p, ac, top - t / 2); card(p, ac, top - t - 0.57); hang(q, ac, top - t - 1.14 - u / 2); card(q, ac, top - t - 1.14 - u - 0.57); lamp(ac, top, 1.1); }
    });
    b.box(DARKW, -6.1, 6.1, 0.004, 0.03, 10.02, 11.06); kit.sign(b, 0, 0.042, 10.54, 12.0, 0.94, SECTION('III', 'SMALL THINGS, LOOKED AT CLOSELY', 'twelve pictures by people who did'), { cw: 1100, ch: 86 });
    for (const x of [-7, 0, 7]) kit.lampAt(b, x, 2.2, 9.6, 0.6);
    // two benches to sit and look from
    for (const ac of [9.25, 21.75]) {
      const L = 5.5, y = 23.8;
      for (const s of [-1, 1]) { R.box(IRON, ac + s * (L / 2 - 0.3) - 0.05, ac + s * (L / 2 - 0.3) + 0.05, y - 0.7, y + 0.7, 0, 1.3); R.box(IRON, ac + s * (L / 2 - 0.3) - 0.07, ac + s * (L / 2 - 0.3) + 0.07, y - 0.74, y + 0.74, 0, 0.06); }
      R.box(OAK, ac - L / 2, ac + L / 2, y - 0.8, y + 0.8, 1.3, 1.44, G); R.soft(LEATHER, ac - L / 2 + 0.06, ac + L / 2 - 0.06, y - 0.74, y + 0.74, 1.44, 1.62, 0.06);
      for (const k of [-1.2, 1.2]) for (const j of [-0.3, 0.3]) R.cyl('c#3a2214/0.8', ac + k, y + j, 1.615, 1.63, 0.045, 0.045, 8);
      R.block(ac - L / 2, ac + L / 2, y - 0.8, y + 0.8, 0, 1.62);
      for (const k of [-1.5, 0, 1.5]) kit.seat(R, ac + k, y, 1.62, 'sit and look at the pictures');
    }
    kit.sign(R, 9.25, 23.3, 1.626, 1.5, 0.5, NOTE(null, 'sit as long as you like. the strawberries are in no hurry.', null, { px: 22 }), { flat: true, cw: 270, ch: 90 });
  }

  // ---- the front desk, on the right wall: visitors come to the room side ----------------------------------------
  const c = at(W - 0.02, 9.5, 0, 'left');                    // x runs toward the back of the shop, +y out into the room
  {
    const TOP = X.counter(c, -2.7, 2.7, 0.06, 2.3, 3.1, { front: GREEN, top: DESKTOP });
    // the visitors' book, open, with a pen
    c.box('c#6e2a26/0.8', -0.72, 1.12, 1.02, 2.22, TOP + 0.002, TOP + 0.05); c.box(CREAMP, -0.68, 1.08, 1.06, 2.18, TOP + 0.05, TOP + 0.085);
    kit.sign(c, 0.2, 1.62, TOP + 0.089, 1.74, 1.1, SIGNS.book, { flat: true, cw: 480, ch: 304, rough: 0.9 });
    tube(c, 'c#17140f/0.45', [[1.3, 1.3, TOP + 0.02], [1.42, 2.0, TOP + 0.02]], 0.014, 5, true); tube(c, BRASS, [[1.42, 2.0, TOP + 0.02], [1.435, 2.08, TOP + 0.02]], 0.011, 5, true);
    spot(c, 0.2, 1.62, TOP + 0.2, () => 'sign the visitors\' book', ctx => ctx.flash(K.pick(['You sign the book. Quill will read it four times this evening.', 'You write something small in the book. It feels right.', 'Signed. Under "comments" you put: more whale.'])));
    // the donations box: glass front, a brass slot, and a suggested donation
    { const x = -1.75, y = 1.3; c.box(OAK, x - 0.42, x + 0.42, y - 0.36, y + 0.36, TOP, TOP + 0.08, G); for (const s of [-1, 1]) c.box(OAK, x + s * 0.4 - 0.02, x + s * 0.4 + 0.02, y - 0.36, y + 0.36, TOP + 0.08, TOP + 0.74);
      c.box(OAK, x - 0.42, x + 0.42, y - 0.36, y - 0.32, TOP + 0.08, TOP + 0.74); c.box('glass', x - 0.38, x + 0.38, y + 0.34, y + 0.35, TOP + 0.08, TOP + 0.74); c.box(OAK, x - 0.44, x + 0.44, y - 0.38, y + 0.38, TOP + 0.74, TOP + 0.8, G); c.box('c#17140f/0.45', x - 0.2, x + 0.2, y - 0.03, y + 0.03, TOP + 0.8, TOP + 0.804);
      for (let i = 0; i < 9; i++) c.cyl(BRASS, x - 0.24 + (i % 4) * 0.15 + (i % 3) * 0.02, y - 0.1 + (i % 3) * 0.13, TOP + 0.082 + Math.floor(i / 5) * 0.014, TOP + 0.094 + Math.floor(i / 5) * 0.014, 0.05, 0.05, 8);
      kit.sign(c, x, y + 0.05, TOP + 0.1, 0.4, 0.26, TICKET('a fact!', '#f1dcd0'), { flat: true, cw: 96, ch: 62, turn: 0.3 });
      X.card(c, x, y + 0.72, TOP, 1.2, 0.52, NOTE('DONATIONS', 'suggested: one coin, or one interesting fact. facts preferred.', null, { px: 19 }), { cw: 264, ch: 114 });
      spot(c, x, y, TOP + 0.5, () => 'look in the donations box (facts)', ctx => ctx.flash('A donated fact: ' + K.pick(FACTS))); }
    // a brass bell, the floor plans to take away, a loan magnifier, the lamp
    ves(c, BRASS, -0.95, 0.6, TOP, [[0, 0], [0.17, 0], [0.17, 0.02], [0.14, 0.05], [0.12, 0.12], [0.06, 0.17], [0, 0.18]], 16); c.cyl('c#17140f/0.45', -0.95, 0.6, TOP + 0.17, TOP + 0.22, 0.02, 0.02, 6);
    for (let i = 0; i < 6; i++) c.box(CREAMP, 1.62 + (i % 2) * 0.012, 2.3 + (i % 2) * 0.012, 1.2, 2.1, TOP + 0.002 + i * 0.012, TOP + 0.012 + i * 0.012);
    kit.sign(c, 1.96, 1.65, TOP + 0.078, 0.66, 0.88, (g, w, h) => { paper(g, w, h, '#efe6d2', 6); T(g, 'FLOOR PLAN', w / 2, h * 0.12, h * 0.085, DEEP, { f: F.dm, ls: 1 }); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(w * 0.18, h * 0.24, w * 0.64, h * 0.44); disc(g, w / 2, h * 0.46, h * 0.03, OX); T(g, 'one room.', w / 2, h * 0.79, h * 0.09, BLUE, { f: F.caveat, w: 700 }); T(g, 'take one anyway.', w / 2, h * 0.9, h * 0.09, BLUE, { f: F.caveat, w: 700 }); }, { flat: true, cw: 132, ch: 176 });
    { const x = 0.2, y = 0.62, ring = []; for (let i = 0; i <= 16; i++) { const t = i / 16 * Math.PI * 2; ring.push([x + Math.cos(t) * 0.17, y + Math.sin(t) * 0.17, TOP + 0.03]); } tube(c, BRASS, ring, 0.018, 5); c.cyl('glass', x, y, TOP + 0.02, TOP + 0.035, 0.16, 0.16, 16); tube(c, 'c#17140f/0.45', [[x + 0.18, y, TOP + 0.03], [x + 0.6, y - 0.06, TOP + 0.03]], 0.028, 6, true);
      X.card(c, 0.25, 0.25, TOP, 1.1, 0.3, TICKET('loan magnifier. bring it back amazed.'), { cw: 250, ch: 68 }); }
    kit.tableLamp(c, 2.25, 0.6, TOP, 'c#2f5a6a/0.4', { base: 'gourd' });
    // on the wall behind: the name, the rules, the one thing not to do, the hours
    c.box(DARKW, -2.4, 2.4, 0.004, 0.05, 8.3, 9.9); kit.sign(c, 0, 0.062, 9.1, 4.6, 1.44, SIGNS.name, { cw: 640, ch: 200 });
    c.box(DARKW, -2.52, -0.28, 0.004, 0.05, 4.3, 7.9); kit.sign(c, -1.4, 0.062, 6.1, 2.1, 3.44, SIGNS.rules, { cw: 380, ch: 622 });
    c.box('c#8a1c1c/0.45', 0.1, 2.6, 0.004, 0.03, 6.5, 7.7); kit.sign(c, 1.35, 0.042, 7.1, 2.4, 1.1, SIGNS.lick, { cw: 380, ch: 174, rough: 0.35 });
    c.box(DARKW, 0.3, 2.4, 0.004, 0.03, 4.55, 6.15); kit.sign(c, 1.35, 0.042, 5.35, 2.0, 1.5, SIGNS.hours, { cw: 300, ch: 225 });
    X.pendant(c, 0, 1.4, { kind: 'dome', drop: 4.8, colour: 'c#2f4a40/0.35', power: 0.9 });
    kit.pottedPlant(c, -3.5, 0.75, 0, 'fern', { size: 1.1 });
  }
  // the postcard spinner, between the desk and the Greek cup
  {
    const sa = W - 2.1, sd = 13.35;
    R.cyl(IRON, sa, sd, 0, 0.08, 0.6, 0.62, 16); R.cyl(IRON, sa, sd, 0.08, 5.75, 0.045, 0.045, 8); ball(R, BRASS, sa, sd, 5.75, 0.08, 8); R.block(sa - 0.55, sa + 0.55, sd - 0.55, sd + 0.55, 0, 5.6);
    for (let q = 0; q < 4; q++) { const s = R.sub(sa, sd, 0, q); s.box(IRON, -0.3, 0.3, 0.3, 0.325, 2.1, 5.35); s.box(IRON, -0.02, 0.02, 0.04, 0.3, 3.7, 3.74);
      for (let k = 0; k < 3; k++) { const z = 2.62 + k * 1.06; s.box(IRON, -0.3, 0.3, 0.325, 0.37, z - 0.47, z - 0.44); kit.sign(s, 0, 0.34, z, 0.52, 0.78, POSTCARD(CARDS[q * 3 + k]), { cw: 100, ch: 150, tilt: 0.06 }); } }
    kit.sign(R.sub(sa, sd, 0, 2), 0, 0.33, 5.55, 0.58, 0.3, TICKET('postcards. take one. post it.'), { cw: 150, ch: 76 });
  }

  // ---- the floor plan, on a stand just inside the door ------------------------------------------------------------
  {
    const p = at(10.2, 5.9, 0, 'street');
    for (const s of [-0.9, 0.9]) { tube(p, DARKW, [[s, 0.5, 0], [s, -0.12, 6.0]], 0.05, 6, true); } tube(p, DARKW, [[0, -1.3, 0], [0, -0.14, 5.6]], 0.045, 6, true); p.box(DARKW, -1.2, 1.2, 0.2, 0.42, 2.48, 2.56);
    lean(p, 0, 0.19, 4.2, 2.2, 3.3, 0.105, SIGNS.plan, 440, 660);
    p.block(-1.2, 1.2, -1.3, 0.55, 0, 6);
  }

  // ---- the windows: one star each side, seen from the street --------------------------------------------------------
  for (const [ac, a0, a1, e, right] of [[6.6, 2.0, 11.3, EX.whale, 0], [24.4, 19.7, 29.0, EX.monster, 1]]) {
    const w = at(ac, 2.4, 0, 'street');                      // +y toward the glass, x toward smaller a
    R.box(GREEN, a0, a1, 0.45, 4.3, 0, 1.86, G); R.box(LINENC, a0, a1, 0.45, 4.3, 1.86, 1.9); R.block(a0, a1, 0, 4.3, 0, 2.6);
    const lx = right ? 3.2 : -3.3;
    lean(w, lx, 1.5, 2.72, 1.9, 1.42, 0.2, LABEL(e), 494, 370); tube(w, DARKW, [[lx, 1.44, 2.6], [lx, 0.9, 1.9]], 0.03, 5, true);
    if (!right) {
      kit.model('bronze_whale_statue', w, 0.4, -0.2, 1.9, 1);
      lean(w, 3.4, 1.55, 2.5, 1.5, 1.0, 0.22, NOTE(null, 'Yes, we know. The whale is not small. It asked to come in and nobody felt able to say no.', '— Q.', { px: 28 }), 300, 200);
      kit.sign(w.sub(0, -1.75, 0, 2), 0, 0, 2.2, 2.6, 0.5, TICKET('the whale faces the street. it prefers the view.'), { cw: 416, ch: 80, tilt: 0.3 });
    } else {
      w.box(DESKTOP, -1.15, 1.15, -1.0, 1.0, 1.9, 2.0, G); w.box(GREEN, -1.05, 1.05, -0.9, 0.9, 2.0, 2.9, G);
      kit.model('si_kneeling_winged_monster', w, 0, 0, 2.9, 0);
      lean(w, -3.3, 1.55, 2.5, 1.5, 1.0, 0.22, NOTE(null, 'Do not be alarmed. It is 1,450 years old and has never once got up.', '— Q.', { px: 30 }), 300, 200);
      kit.sign(w.sub(0, -1.75, 0, 2), 0, 0, 2.2, 2.6, 0.5, TICKET('guardian on duty. its label faces the street.'), { cw: 416, ch: 80, tilt: 0.3 });
      for (const [x, y, t] of [[2.2, 0.9, 0.7], [2.55, 0.5, 0.45], [-2.1, 0.8, 0.55]]) kit.pillarCandle(w, x, y, 1.9, t, 0.13);
    }
    // a cloth banner in the top of the window
    hcyl(w, BRASS, 'x', 0, 1.85, 9.2, 5.6, 0.035, 0.035, 8); for (const s of [-2.5, 2.5]) w.cyl('c#17140f/0.8', s, 1.85, 9.2, 12, 0.01, 0.01, 4); w.box(CREAMP, -2.6, 2.6, 1.84, 1.86, 7.05, 9.17);
    kit.sign(w, 0, 1.872, 8.11, 5.2, 2.1, right ? WBANNER('inside, this evening:', 'REAL THINGS', 'a pigeon. a tooth. twelve pictures. one sock.') : WBANNER('the museum of', 'SMALL WONDERS', 'free. come in. it is small.'), { cw: 520, ch: 210 });
    kit.sign(w.sub(0, 1.828, 0, 2), 0, 0, 8.11, 5.2, 2.1, WBANNER('thank you for coming.', 'LOOK CLOSELY', 'at everything. it is all like this.'), { cw: 520, ch: 210 });
    X.pendant(w, 0, 0.3, { kind: 'bulb', drop: 3.2, power: 1.0 });
  }

  // ---- lamps over the room ---------------------------------------------------------------------------------------------
  X.pendant(R, 15.5, 10.2, { kind: 'dome', drop: 4.3, colour: 'c#2f4a40/0.35', power: 1.0 });
  for (const [a, d] of [[6.2, 12.2], [5.4, 20.6], [24.8, 19.6]]) X.pendant(R, a, d, { kind: 'globe', drop: 3.6, power: 0.85 });

  // ---- out on the pavement ------------------------------------------------------------------------------------------------
  {
    X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.3, 5.4, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h); chalk(g, 'MUSEUM', w / 2, h * 0.1, h * 0.11, '#e9c46a'); PIC.tooth(g, w / 2, h * 0.3, h * 0.2, '#f1efe6');
      chalk(g, 'free.', w / 2, h * 0.5, h * 0.11); chalk(g, 'come in.', w / 2, h * 0.63, h * 0.11); chalk(g, 'it is small.', w / 2, h * 0.76, h * 0.11, '#9fc6b0'); chalk(g, '(that is the point)', w / 2, h * 0.91, h * 0.055, '#9aa39d'); },
      { back: (g, w, h) => { slate(g, w, h, '#252a28', 6); chalk(g, 'today:', w / 2, h * 0.09, h * 0.08, '#e9c46a'); chalk(g, '1 megalodon tooth', w / 2, h * 0.24, h * 0.075); chalk(g, '1 very brave pigeon', w / 2, h * 0.35, h * 0.075); chalk(g, '12 pictures', w / 2, h * 0.46, h * 0.075); chalk(g, '1 trilobite (touchable)', w / 2, h * 0.57, h * 0.075, '#e8a8a0', { max: w * 0.92 }); chalk(g, '0 dinosaurs', w / 2, h * 0.68, h * 0.075); chalk(g, '(sorry. they would not fit.)', w / 2, h * 0.79, h * 0.055, '#9aa39d', { max: w * 0.92 }); chalk(g, 'same as yesterday. still good.', w / 2, h * 0.92, h * 0.058, '#9fc6b0', { max: w * 0.92 }); } });
    // Exhibit Zero: an empty gilt frame on two posts, for looking at the evening through
    const o = K.wrap(lot.frOut(kit, 3.6, 6.9, 0, 'left')), GILT = 'c#b08d4a/0.35/1', b = 0.2;
    const prof = [[-0.012, 0.0], [-0.012, 0.05], [0.0, 0.062], [b * 0.18, 0.07], [b * 0.35, 0.075], [b * 0.5, 0.068], [b * 0.62, 0.072], [b * 0.8, 0.082], [b * 0.92, 0.078], [b, 0.065], [b, 0.0]];
    for (const q of [0, 2]) kit.put(o.sub(0, 0, 0, q), GILT, kit.geom.moulding(2.7, 1.9, prof), { at: [0, 0, 5.0] });
    for (const s of [-1.5, 1.5]) { o.cyl(IRON, s, 0, 0, 0.06, 0.22, 0.24, 10); o.cyl(IRON, s, 0, 0.06, 6.1, 0.04, 0.04, 8); ball(o, GILT, s, 0, 6.1, 0.07, 8); o.block(s - 0.2, s + 0.2, -0.2, 0.2, 0, 6); }
    o.box(IRON, -1.5, 1.5, -0.02, 0.02, 3.22, 3.78);
    for (const q of [0, 2]) kit.sign(o.sub(0, 0, 0, q), 0, 0.032, 3.5, 2.5, 0.5, SIGNS.evening, { cw: 500, ch: 100, rough: 0.5 });
    // two banners on brackets, either end of the front
    for (const [a, face, top, big, small, pic] of [[0.5, 'right', 'the museum of', ['SMALL', 'WONDERS'], ['REAL FOSSILS', 'REAL PICTURES', 'free. it is small.'], 'ammonite'], [W - 0.5, 'left', 'now showing', ['EVERY', 'THING'], ['WE HAVE', 'ALL OF IT', 'do come in.'], 'trilobite']]) {
      const f = K.wrap(lot.frOut(kit, a, 0, 0, face)), s = face === 'right' ? 1 : -1;       // frame x runs out from the wall on one side, in on the other
      hcyl(f, IRON, 'x', s * 1.3, 0, 10.75, 2.6, 0.04, 0.04, 6); ball(f, BRASS, s * 2.6, 0, 10.68, 0.07, 8); tube(f, IRON, [[s * 0.02, 0, 9.9], [s * 0.9, 0, 10.72]], 0.025, 5);
      f.box(snapMat('c#2b2724/0.8'), Math.min(s * 0.5, s * 2.4), Math.max(s * 0.5, s * 2.4), -0.012, 0.012, 6.7, 10.7);
      for (const q of [0, 2]) kit.sign(f.sub(s * 1.45, 0, 0, q), 0, 0.02, 8.7, 1.86, 3.96, BANNER(top, big, small, pic), { cw: 200, ch: 426 });
    }
  }

  // ---- Quill ----------------------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'quill', name: 'Quill', lot: 'museum', look: { shape: 'tall', colour: '#3a4a44', belly: '#efe4cf', trim: '#c9a45c', hat: 'none', bowtie: '#8a1c1c', specs: true, antenna: true, eye: '#ffe9c0', ring: 0xf0d8a0, tool: 'duster' },
    home: lot.world(24.4, 9.6), faces: lot.world(15.5, 3), posts: [lot.world(18.7, 10.3), lot.world(25.6, 20.6), lot.world(24.4, 9.6)],
    lines: {
      greet: ['Welcome to the Museum of Small Wonders. It is one room. I can talk for an hour about each wall.', 'Good evening! Admission is free. The facts are also free. I cannot stop them.', 'Ah, a visitor. Please: touch the trilobite, sit with the pictures, and do not lick anything.'],
      idle: ['*dusts the megalodon tooth with enormous care, then the glass, then the label*', 'Three hundred and ninety million years, and it still has both its eyes.', '*straightens a picture by one millimetre. steps back. one millimetre the other way*', 'The pigeon and I have an understanding. He does not move, and I admire him.', 'Somebody put a second sock in the donations box. I am treating it as a hoax.', '*re-reads own label. nods. it is a good label*', 'Calcite. The eyes were made of calcite. I am never going to get over it.'],
      bye: ['Come back soon. Everything will be exactly where you left it. That is the service we provide.', 'Goodbye! Look closely at something on the way home.', 'Mind the whale on your way out. It is not small.'],
      topics: [
        { q: 'What should I look at first?', a: 'Straight ahead: Cher Ami. A homing pigeon of the U.S. Army Signal Corps. In October 1918 he is credited with carrying the message that saved a trapped battalion in the Argonne, and arrived shot through the breast, with one leg hanging by a tendon. France gave him the Croix de Guerre.', next: [
          { q: 'And second?', a: 'The trilobite, on the left wall. Its eyes are towers of lenses, and each lens is a single crystal of calcite. It looked at a Devonian sea through stone. You may touch it. I insist, in fact.' },
          { q: 'And if I only have a minute?', a: 'Then the strawberries, on the back wall. Adriaen Coorte, 1696. A bowl of wild strawberries on a stone ledge and nothing else at all. He was forgotten for two hundred years. Sit down. Take the minute.' }] },
        { q: 'Is everything in here real?', a: 'Every specimen is a three-dimensional scan of a real object, most of them in the Smithsonian, which in 2020 released millions of its images and scans for anybody to use. The pictures are real paintings, long out of copyright. The labels are true. I checked them. Then I checked them again, for pleasure.', next: [
          { q: 'Everything?', a: 'There is one case in the middle of the room, of local finds. A sock. A stick. Its labels are not strictly true. They are, however, accurate. You will see what I mean.' }] },
        { q: 'Why "small" wonders?', a: 'A megalodon was fifteen metres long. We have one tooth. That is the correct amount of megalodon for a room this size. Most wonders are small, if you stand in the right place: a seed, a cup, a dot pressed into wet clay three hundred years ago by somebody whose name nobody wrote down.' },
        { q: 'Tell me about the pictures.', a: 'Twelve pictures by people who looked at one small thing for a very long time. Dürer painted a hare in 1502, and if you look in its eye there is a window reflected in it. A year later he painted a clump of weeds, dandelion and plantain, as carefully as anyone has painted a king.', next: [
          { q: 'Which is your favourite?', a: 'I am not supposed to have one. It is the Milkmaid. Vermeer, about 1660. Everything in it is perfectly still except one thin stream of milk, which has been pouring for three hundred and sixty years and has not yet filled the bowl.' }] },
        { q: 'Who made the blue and grey jug?', a: 'Thomas Commeraw. A free Black potter with his own pottery at Corlears Hook, on the Manhattan shore, from about 1797. He stamped his pots with his name. For two centuries collectors assumed he was white; then a researcher went and read the census. I think about that when I write a label. One checks.' },
        { q: 'May I really touch the trilobite?', a: 'Please do. It has lasted three hundred and ninety million years; it can manage you. The genus is called Coltraneia, after John Coltrane, the saxophonist. Named in 1997 by two palaeontologists who clearly had the record on. Along the ribs, if you would.' },
      ],
    },
  });

  kit.later.push(ctx => { for (const u of use) ctx.interact.push({ x: u.x, y: u.y, z: u.z, reach: u.reach, label: u.label, act: () => { try { u.act(ctx); } catch { /* a passing note is not worth a crash */ } } }); });
}
