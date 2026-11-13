// Marginalia: new, used & thoroughly annotated books  (north side; 305 Mulberry Street, Madison, Indiana:
// a narrow, deep brick shop-house, about 19.75 ft wide inside by 42.7 deep)
// A long plain bookshop. Wall cases to the picture rail down both long walls; one low double-sided case
// down the middle; the table of new books in front of it; the counter on the door side near the front.
// The door looks straight down the main aisle to an armchair and a lamp at the very back. One quiet find:
// the blind-date shelf, past the counter. Everything is laid out from lot.W, lot.D and lot.doorA.
import { tools, fixtures, snapMat } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, poly, para, ICON } from '../draw.js';

const WOOD = 'oak_light#8f6a48', HONEY = 'oak_light#c4a477', DARKW = 'fir#3a2c24', GREEN = 'painted_wood#2f4a40', OXB = 'painted_wood#7a2f2a', BLACK = 'c#17140f/0.3', KRAFT = 'c#b08a5a/0.8', CREAMP = 'c#efe2bc/0.8', IRON = 'c#2b2724/0.45/1';
const INK = '#2a1c13', CREAM = '#f1e6cf', GOLD = '#e9c46a';

// ---- lettering -------------------------------------------------------------------------------------
const SECTION = (main, sub, bg = '#6e2a26') => (g, w, h) => {
  board(g, w, h, bg, '#d9b35a', { inset: h * 0.08, lw: 2 });
  T(g, main, w / 2, sub ? h * 0.37 : h * 0.5, h * 0.4, CREAM, { f: F.playfair, w: 700, ls: 2, max: w * 0.9 });
  if (sub) T(g, sub, w / 2, h * 0.76, h * 0.28, GOLD, { f: F.caveat, w: 600, max: w * 0.88 });
};
const TICKET = txt => (g, w, h) => { paper(g, w, h, '#f3ead2'); T(g, txt, w / 2, h * 0.52, h * 0.72, INK, { f: F.caveat, w: 600, max: w * 0.94 }); };
// a handwritten card: optional heading, a paragraph, optional signature
const NOTE = (head, body, sign, o = {}) => (g, w, h) => {
  paper(g, w, h, o.bg ?? '#f6eed8', o.seed ?? 3); const px = o.px ?? h * 0.085;
  let y = h * 0.06;
  if (head) { y = para(g, head, w * 0.07, y, px * 1.05, o.hc ?? '#8a1c1c', w * 0.86, { f: o.hf ?? F.fraunces, w: 700, it: 1, lh: 1.1 }); y += px * 0.25; }
  para(g, body, w * 0.07, y, px, INK, w * 0.86, { f: F.caveat, w: 600, lh: 1.08 });
  if (sign) T(g, sign, w * 0.93, h * 0.93, px * 1.15, '#2f5a6a', { f: F.caveat, w: 700, a: 'right' });
};

// ---- jackets -----------------------------------------------------------------------------------------
const MOTIF = {
  moon(g, x, y, s, c, bg) { disc(g, x, y, s * 0.42, c); disc(g, x + s * 0.17, y - s * 0.09, s * 0.36, bg); },
  full(g, x, y, s, c) { disc(g, x, y, s * 0.4, c); },
  window(g, x, y, s, c, bg) { rrect(g, x - s * 0.3, y - s * 0.42, s * 0.6, s * 0.84, s * 0.3, c); line(g, [[x, y - s * 0.42], [x, y + s * 0.42]], bg, s * 0.05); line(g, [[x - s * 0.3, y], [x + s * 0.3, y]], bg, s * 0.05); },
  waves(g, x, y, s, c) { for (let k = -1; k <= 1; k++) { const pts = []; for (let i = 0; i <= 24; i++) pts.push([x - s * 0.5 + i * s / 24, y + k * s * 0.24 + Math.sin(i * 0.8 + k) * s * 0.07]); line(g, pts, c, s * 0.06); } },
  ladder(g, x, y, s, c) { for (const k of [-1, 1]) line(g, [[x + k * s * 0.16, y - s * 0.48], [x + k * s * 0.16, y + s * 0.48]], c, s * 0.05); for (let i = -2; i <= 2; i++) line(g, [[x - s * 0.16, y + i * s * 0.18], [x + s * 0.16, y + i * s * 0.18]], c, s * 0.04); },
  semi(g, x, y, s, c) { T(g, ';', x, y - s * 0.06, s * 1.25, c, { f: F.abril }); },
  dots(g, x, y, s, c) { for (let i = 0; i < 9; i++) disc(g, x + (i % 3 - 1) * s * 0.3, y + (Math.floor(i / 3) - 1) * s * 0.3, s * (0.05 + (i * 7 % 5) * 0.018), c); },
  moth(g, x, y, s, c) { poly(g, [[x, y - s * 0.1], [x - s * 0.48, y - s * 0.38], [x - s * 0.4, y + s * 0.12], [x, y + s * 0.08]], c); poly(g, [[x, y - s * 0.1], [x + s * 0.48, y - s * 0.38], [x + s * 0.4, y + s * 0.12], [x, y + s * 0.08]], c); poly(g, [[x, y], [x - s * 0.26, y + s * 0.4], [x, y + s * 0.22], [x + s * 0.26, y + s * 0.4]], c); rrect(g, x - s * 0.03, y - s * 0.3, s * 0.06, s * 0.6, s * 0.03, c); },
  lamp(g, x, y, s, c) { rect(g, x - s * 0.03, y - s * 0.1, s * 0.06, s * 0.6, c); rect(g, x - s * 0.18, y + s * 0.44, s * 0.36, s * 0.06, c); poly(g, [[x - s * 0.12, y - s * 0.44], [x + s * 0.12, y - s * 0.44], [x + s * 0.24, y - s * 0.1], [x - s * 0.24, y - s * 0.1]], c); },
};
// A book jacket: a field of colour, one strong shape, the title and the author. o: { f title face, low: title under the shape }
const COVER = (title, author, bg, ink, motif, o = {}) => (g, w, h) => {
  fill(g, w, h, bg); grain(g, w, h, 0.07, title.length);
  const acc = o.acc ?? ink, my = o.top ? h * 0.7 : h * 0.34, s = w * (o.s ?? 0.62);
  if (MOTIF[motif]) MOTIF[motif](g, w / 2, my, s, acc, bg, o.acc2); else if (ICON[motif]) ICON[motif](g, w / 2, my, s, acc, bg);
  const px = o.px ?? h * 0.085, y0 = o.top ? h * 0.1 : h * 0.6;
  para(g, title, w / 2, y0, px, ink, w * 0.84, { f: o.f ?? F.abril, a: 'center', lh: 1.06, w: o.w ?? 'normal' });
  T(g, author.toUpperCase(), w / 2, o.top ? h * 0.46 : h * 0.93, h * 0.04, ink, { f: F.archivo, ls: 1, max: w * 0.86 });
  if (o.band) { rect(g, 0, h * 0.5, w, h * 0.012, ink); }
};
// the new books on the front table: [title, author, paper, ink, motif, opts, first sentence]
const NEW = [
  ['The Semicolon Affair', 'R. T. Aldermoor', '#e8dfc8', '#8a1c1c', 'semi', { f: F.playfair, w: 700 }, 'She was, by profession and by temperament, a comma.'],
  ['Soup for the Unconvinced', 'Pilar Wren', '#c9952a', '#2a1c13', 'bowl', { f: F.dm }, 'Begin with an onion; everything decent does.'],
  ['Tides I Have Missed', 'Margit Oyelaran', '#9fb0d8', '#26364f', 'waves', { f: F.playfair, w: 700 }, 'Every boat I ever loved left on time.'],
];
// Folio's three picks: [title, author, paper, ink, motif, opts, note]
const PICKS = [
  ['The Glass Orchard', 'Wilhelmina Sato', '#9fb0a4', '#2f4a2a', 'leaf', { f: F.playfair, w: 700 }, 'Two hundred quiet pages, then a pear falls. Worth the wait.'],
  ['Garden Path Sentences', 'Dr Imre Castellane', '#f3d96a', '#17140f', 'ladder', { f: F.archivo, px: 17 }, '"The old man the boat." If that pleased you, this one.'],
  ['Field Guide to Minor Clouds', 'Anselm Quist', '#c9d6d8', '#26364f', 'dots', { acc: '#f4f1ea', f: F.dm }, 'Small clouds, taken seriously at last.'],
];
const DUSK = [
  ['An Hour Called Blue', 'Solveig Marchetti', '#2a63b8', '#f1e6cf', 'window', { acc: '#f3d96a' }],
  ['Moths: A Defence', 'Eamon Thistlewood', '#e8e2d4', '#4a2240', 'moth', { f: F.playfair, w: 700 }],
  ['The Lamplighters\' Almanac', 'Guild Edition', '#17140f', '#e8c73a', 'lamp', { f: F.limelight }],
  ['What the Owl Withheld', 'Ngozi Farrow', '#4a2240', '#f3d9a0', 'moon', {}],
];
const BLIND = [
  ['a lighthouse', 'a secret', 'nobody is sorry'], ['rain', 'the wrong train', 'the right person'], ['1920s', 'a missing emerald', 'an aunt'], ['space, but cosy', 'the ship\'s cat', 'found family'],
  ['letters', 'the sea', 'bring a handkerchief'], ['a village', 'a pie contest', 'a body'], ['winter', 'two sisters', 'a fox'], ['bees', 'grief', 'an excellent dog'],
];
const WRAPPED = (clues, n) => (g, w, h) => {
  paper(g, w, h, '#b99a6b', n + 2); const sx = w * 0.13, sy = h * 0.14;
  line(g, [[sx, 0], [sx, h]], '#efe6d2', 3); line(g, [[0, sy], [w, sy]], '#efe6d2', 3);
  let y = h * 0.26; clues.forEach((c, i) => { y = para(g, `${i + 1}. ${c}`, w * 0.22, y, h * 0.088, INK, w * 0.74, { f: F.caveat, w: 700, lh: 1.02 }) + h * 0.035; });
};

const POSTER = {
  // the one chart in the shop: the cardinal vowels, with the schwa marked
  mouth(g, w, h) {
    paper(g, w, h, '#efe6d2', 5); T(g, 'A MAP OF THE MOUTH', w / 2, h * 0.08, h * 0.06, '#26364f', { f: F.playfair, w: 700, ls: 2, max: w * 0.88 }); T(g, 'vowels of the known world', w / 2, h * 0.145, h * 0.042, '#8a1c1c', { f: F.fraunces, it: 1, w: 600 });
    const P = { tl: [0.16, 0.3], tr: [0.84, 0.3], br: [0.84, 0.8], bl: [0.46, 0.8] }, at = (a, b, t) => [w * (a[0] + (b[0] - a[0]) * t), h * (a[1] + (b[1] - a[1]) * t)];
    line(g, [P.tl, P.tr, P.br, P.bl].map(([x, y]) => [w * x, h * y]), '#26364f', 3, true);
    for (const t of [1 / 3, 2 / 3]) line(g, [at(P.tl, P.bl, t), at(P.tr, P.br, t)], '#9a9590', 1.5);
    line(g, [at(P.tl, P.tr, 0.5), at(P.bl, P.br, 0.5)], '#9a9590', 1.5);
    const V = [['i', at(P.tl, P.bl, 0)], ['e', at(P.tl, P.bl, 1 / 3)], ['ɛ', at(P.tl, P.bl, 2 / 3)], ['a', at(P.tl, P.bl, 1)], ['u', at(P.tr, P.br, 0)], ['o', at(P.tr, P.br, 1 / 3)], ['ɔ', at(P.tr, P.br, 2 / 3)], ['ɑ', at(P.tr, P.br, 1)]];
    for (const [s, [x, y]] of V) { disc(g, x, y, h * 0.036, '#efe6d2', '#26364f', 2); T(g, s, x, y, h * 0.05, '#26364f', { f: 'Georgia, "DejaVu Serif", serif', w: 'bold' }); }
    const [sx, sy] = [w * 0.58, h * 0.55]; disc(g, sx, sy, h * 0.04, '#8a1c1c'); T(g, 'ə', sx, sy - h * 0.004, h * 0.055, '#f6eed8', { f: 'Georgia, "DejaVu Serif", serif', w: 'bold' });
    T(g, 'you are here', w * 0.64, h * 0.715, h * 0.05, '#8a1c1c', { f: F.caveat, w: 700 }); line(g, [[sx + w * 0.01, sy + h * 0.05], [w * 0.62, h * 0.685]], '#8a1c1c', 2);
    T(g, 'FRONT', w * 0.2, h * 0.235, h * 0.03, '#5a5a56', { f: F.bebas, ls: 2 }); T(g, 'BACK', w * 0.84, h * 0.235, h * 0.03, '#5a5a56', { f: F.bebas, ls: 2 }); T(g, 'CLOSE', w * 0.07, h * 0.3, h * 0.026, '#5a5a56', { f: F.bebas, ls: 1 }); T(g, 'OPEN', w * 0.34, h * 0.8, h * 0.026, '#5a5a56', { f: F.bebas, ls: 1 });
  },
  typed(g, w, h) {
    paper(g, w, h, '#f7f2e4', 6);
    const rows = ['the lighthouse keeper', 'read the last page first', 'and was right to.', '', '', 'PLEASE ADD ONE SENTENCE.', '                 -- F.'];
    rows.forEach((r, i) => T(g, r, w * 0.08, h * (0.1 + i * 0.075), h * 0.05, i === 5 ? '#8a1c1c' : '#2b2724', { f: F.elite, a: 'left', max: w * 0.86 }));
  },
  dusk(g, w, h) {
    paper(g, w, h, '#f1e6cf', 9); g.strokeStyle = '#26364f'; g.lineWidth = 3; g.strokeRect(7, 7, w - 14, h - 14);
    T(g, 'books to read', w / 2, h * 0.3, h * 0.24, '#26364f', { f: F.yellowtail }); T(g, 'AT DUSK', w / 2, h * 0.68, h * 0.34, '#8a1c1c', { f: F.abril, ls: 3 });
  },
  moon(g, w, h) { const gr = g.createRadialGradient(w * 0.42, h * 0.4, w * 0.05, w / 2, h / 2, w * 0.5); gr.addColorStop(0, '#fff6dc'); gr.addColorStop(1, '#f1d48a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (const [x, y, r] of [[0.36, 0.34, 0.07], [0.62, 0.52, 0.1], [0.44, 0.68, 0.05], [0.68, 0.3, 0.04]]) disc(g, w * x, h * y, w * r, 'rgba(190,150,80,.28)'); },
};

export default function books(kit, lot) {
  const K = tools(kit, 57), X = fixtures(kit, K), { ves, hcyl, ball, tube } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                        // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D, FLOOR = lot.fr(kit, 0, 0).h;
  const CD = 0.97;                                           // how far a wall case stands out
  const AIS = lot.doorA;                                     // the main aisle runs straight back from the door
  const SP = Math.min(W / 2, 2 * AIS - (W - CD) - 0.96);     // centre line of the middle case and the front table
  const jacket = (f, x, y, z, b, w = 0.64, tall = 0.94, o = {}) => kit.pack(f, x, y, z, w, 0.1, tall, snapMat(`c${b[2]}/0.8`), COVER(b[0], b[1], b[2], b[3], b[4], b[5]), { cw: 150, ch: 220, ...o });
  const shelfZ = k => 0.28 + 1.08 * k;                       // shelf tops inside a kit.bookcase
  const ticket = (f, x, k, txt, w = 1.5) => kit.sign(f, x, 0.966, shelfZ(k) - 0.05, w, 0.2, TICKET(txt), { cw: Math.round(w * 160), ch: 32 });
  // a lettered board standing on a bookcase's cornice (front edge at y)
  const crest = (f, y, z, w, main, sub) => { f.box(DARKW, -w / 2 - 0.08, w / 2 + 0.08, y - 0.06, y, z, z + 0.84); kit.sign(f, 0, y + 0.012, z + 0.42, w, 0.72, SECTION(main, sub), { cw: Math.round(w * 128), ch: 92 }); };

  // ---- wall cases down both long walls, to the picture rail; four of them carry a board -----------------------
  const L0 = 7.4, L1 = D - 1.1, lw = (L1 - L0) / 5;           // the left wall: five cases from behind the window to the back
  const leftF = [0, 1, 2, 3, 4].map(i => { const f = at(0.02, L0 + lw * (i + 0.5), 0, 'right'); kit.bookcase(f, lw - 0.03, 8.6, { wood: WOOD, fill: 0.94 }); return f; });
  crest(leftF[0], 0.96, 8.73, 5.6, 'FICTION'); crest(leftF[3], 0.96, 8.73, 5.6, 'POETRY');
  ticket(leftF[0], 0, 4, 'A to M', 1.0); ticket(leftF[1], 0, 4, 'N to Z', 1.0);
  const R0 = 18.6, R1 = D - 6.1, rw = (R1 - R0) / 3;         // the right wall: three cases between the blind dates and the chair
  const rightF = [0, 1, 2].map(i => { const f = at(W - 0.02, R0 + rw * (i + 0.5), 0, 'left'); kit.bookcase(f, rw - 0.03, 8.6, { wood: WOOD, fill: 0.94 }); return f; });
  crest(rightF[0], 0.96, 8.73, 5.6, 'LINGUISTICS & OTHER ARGUMENTS', 'descriptivists to the left. prescriptivists: also to the left.');
  { const L = rightF[0], x = rw / 4 - 0.02;
    ticket(L, -x, 4, 'syntax', 1.0); ticket(L, x, 4, 'semantics & pragmatics', 1.6); ticket(L, -x, 3, 'phonology /fəˈnɒlədʒi/', 1.6); ticket(L, x, 3, 'morphology: un-put-down-able', 1.8); }
  const BW = SP + 0.96 - 1.1, backF = at(1.1 + BW / 2, D - 0.02, 0, 'street');   // one case on the back wall; the rest of that wall is left plain
  kit.bookcase(backF, BW - 0.03, 8.6, { wood: WOOD, fill: 0.94 }); crest(backF, 0.96, 8.73, 5.6, 'HISTORY');

  // ---- the rolling ladder on the left wall ----------------------------------------------------------------
  {
    const rail = at(0.02, (L0 + L1) / 2, 0, 'right'), half = (L1 - L0) / 2;
    hcyl(rail, BRASS, 'x', 0, 1.13, 7.9, half * 2 - 0.2, 0.035, 0.035, 8);
    for (let i = 0; i <= 5; i++) { const x = -half + 0.1 + i * (half * 2 - 0.2) / 5; rail.box(BRASS, x - 0.03, x + 0.03, 0.98, 1.13, 7.87, 7.93); }
    const l = at(0.02, L0 + lw * 3.5, 0, 'right'), foot = 3.0, top = 1.2, z0 = 0.24, z1 = 8.15;
    for (const s of [-0.7, 0.7]) {
      tube(l, HONEY, [[s, foot, z0], [s, top, z1]], 0.08, 6, true);
      tube(l, BRASS, [[s, top, z1], [s, 1.1, 8.08], [s, 1.06, 7.9]], 0.03, 5);
      hcyl(l, IRON, 'x', s * 1.14, foot, z0, 0.09, 0.22, 0.22, 12);
    }
    for (let z = 1.0; z < 7.8; z += 0.92) { const t = (z - z0) / (z1 - z0); hcyl(l, HONEY, 'x', 0, foot + (top - foot) * t, z, 1.4, 0.05, 0.05, 6); }
    l.block(-0.9, 0.9, 0.95, foot + 0.25, 0, 7);
  }

  // ---- the middle of the shop: one low double-sided case; Folio's three picks stand on top ---------------------
  {
    const d0 = 18, len = Math.min(13, D - 12.5 - d0), dm = d0 + len / 2, LOW = 3.5;
    const fw = at(SP - 0.01, dm, 0, 'left'), fe = at(SP + 0.01, dm, 0, 'right');
    for (const f of [fw, fe]) kit.bookcase(f, len, LOW, { wood: WOOD, fill: 0.93 });
    PICKS.forEach((b, i) => { const x = (1 - i) * (len / 2 - 2.2);
      jacket(fe, x + 0.5, 0.42, LOW + 0.125, b, 0.7, 1.02);
      X.card(fe, x - 0.45, 0.5, LOW + 0.12, 0.98, 0.6, NOTE(null, b[6], '— F.', { px: 20, seed: i }), { cw: 236, ch: 144 }); });
    kit.bookStack(fw, -len / 2 + 1.2, 0.5, LOW + 0.125, 4); kit.bookStack(fw, len / 2 - 2.0, 0.5, LOW + 0.125, 3);
  }

  // ---- the front table: three new books, each with its first sentence -----------------------------------------
  {
    const TA = SP, TD = 10, TOP = X.plinth(R, TA, TD, 5.0, 3.0, 2.6, { mat: WOOD, shelf: 0.95 });
    const t = at(TA, TD, 0, 'street');                       // +y toward the street
    NEW.forEach((b, i) => { const x = (i - 1) * 1.4;
      jacket(t, x, 0.12, TOP + 0.005, b, 0.66, 0.97);
      for (let k = 0; k < 2; k++) t.box(snapMat(`c${b[2]}/0.8`), x - 0.47 + k * 0.03, x + 0.47 + k * 0.03, 0.34, 0.98, TOP + k * 0.085 + 0.003, TOP + k * 0.085 + 0.08);       // two more copies, lying down
      kit.sign(t, x, 0.66, TOP + 0.175, 0.9, 0.6, NOTE(null, b[6], null, { px: b[6].length > 45 ? 23 : 27, seed: i + 4 }), { flat: true, cw: 180, ch: 120 }); });
    t.cyl(BRASS, 0, -0.55, TOP, TOP + 1.12, 0.03, 0.03, 8); t.box(DARKW, -0.82, 0.82, -0.57, -0.53, TOP + 1.1, TOP + 1.94);
    kit.sign(t, 0, -0.518, TOP + 1.52, 1.56, 0.76, (g, w, h) => { paper(g, w, h, '#f6eed8', 2); T(g, 'books with', w / 2, h * 0.2, h * 0.22, '#2f5a6a', { f: F.caveat, w: 700 }); T(g, 'GOOD FIRST', w / 2, h * 0.5, h * 0.27, '#8a1c1c', { f: F.abril, ls: 2, max: w * 0.9 }); T(g, 'SENTENCES', w / 2, h * 0.8, h * 0.23, '#8a1c1c', { f: F.abril, ls: 2, max: w * 0.9 }); }, { cw: 270, ch: 132 });
    for (const [x, n] of [[-1.5, 5], [0.9, 4]]) kit.bookStack(t, x, -1.0, TOP, n);          // the far end of the table is left empty
    X.pendant(R, TA, TD, { kind: 'dome', drop: 4.3, colour: 'c#8a1c1c/0.35', power: 1.0 });
  }

  // ---- the counter, on the door side near the front: customers on the room side --------------------------------
  const c = at(W - 0.02, 9.6, 0, 'left');                     // x toward the back, +y out into the room
  const TOP = X.counter(c, -3.0, 3.0, 2.2, 3.6, 3.3, { front: GREEN, top: 'fir#5a3d2c' });
  {
    // the till: brass
    { const x = -1.7, y = 2.9, z = TOP;
      c.soft(BRASS, x - 0.55, x + 0.55, y - 0.5, y + 0.45, z, z + 0.5, 0.05); c.soft(BRASS, x - 0.5, x + 0.5, y - 0.5, y + 0.1, z + 0.5, z + 1.0, 0.08);
      for (let i = 0; i < 12; i++) c.cyl('c#efe9da/0.3', x - 0.36 + (i % 4) * 0.24, y + 0.2 + Math.floor(i / 4) * 0.08, z + 0.5 + (2 - Math.floor(i / 4)) * 0.05, z + 0.56 + (2 - Math.floor(i / 4)) * 0.05, 0.05, 0.05, 6); }
    // the bell
    ves(c, BRASS, -0.5, 3.2, TOP, [[0, 0], [0.17, 0], [0.17, 0.02], [0.14, 0.05], [0.12, 0.12], [0.06, 0.17], [0, 0.18]], 12); c.cyl(BLACK, -0.5, 3.2, TOP + 0.17, TOP + 0.22, 0.02, 0.02, 6);
    // the typewriter: its keys face the customer, who is expected to add a sentence
    { const t = c.sub(1.1, 2.75, TOP), TY = 'c#2f4a2a/0.45';
      t.soft(TY, -0.6, 0.6, -0.5, 0.18, 0, 0.34, 0.06); t.soft(TY, -0.6, 0.6, 0.1, 0.74, 0, 0.1, 0.04);
      for (let r = 0; r < 4; r++) for (let i = 0; i < 10 - (r === 3 ? 3 : 0); i++) { const kx = -0.45 + i * 0.1 + r * 0.025 + (r === 3 ? 0.1 : 0), ky = 0.24 + r * 0.115, kz = 0.27 - r * 0.045; t.cyl('c#efe9da/0.3', kx, ky, kz - 0.06, kz + 0.02, 0.04, 0.04, 6); }
      t.box(BLACK, -0.72, 0.72, -0.46, -0.16, 0.34, 0.42); hcyl(t, BLACK, 'x', 0, -0.3, 0.52, 1.36, 0.09, 0.09, 10);
      t.box(CREAMP, -0.38, 0.38, -0.262, -0.25, 0.5, 1.72); kit.sign(t, 0, -0.243, 1.12, 0.74, 1.18, POSTER.typed, { cw: 236, ch: 376 }); }
    kit.model('st_bankers_lamp', c, 2.5, 2.7, TOP, 0); kit.lampAt(c, 2.5, 2.8, TOP + 0.8, 0.5);
  }
  // behind the counter: the holds shelf
  X.shelving(c, -3.0, 3.0, [1.3, 2.55, 3.8], { d: 0.8, mat: WOOD, over: 0.05 });
  for (const z of [1.3, 2.55]) kit.bookRow(c, -2.9, 2.9, 0.06, z, 1.1, 0.7);
  kit.bookStack(c, 1.6, 0.42, 3.86, 3);
  X.pendant(c, 0, 2.9, { kind: 'dome', drop: 4.6, colour: 'c#2f4a40/0.35', power: 1.0 });

  // ---- the quiet find: blind date with a book, on the right wall past the counter ------------------------------
  {
    const b = at(W - 0.02, 15.9, 0, 'left');                 // x runs toward the back of the shop
    X.shelving(b, -2.3, 2.3, [2.4, 3.95], { d: 0.85, mat: WOOD, over: 1.45, back: OXB });
    BLIND.forEach((cl, i) => { const z = [3.95, 2.4][Math.floor(i / 4)], x = -1.65 + (i % 4) * 1.1 + (K.rnd() - 0.5) * 0.08; kit.pack(b, x, 0.5, z + 0.004, 0.86, 0.17, 1.16, KRAFT, WRAPPED(cl, i), { cw: 168, ch: 226 }); });
    kit.sign(b, 0, 0.022, 6.25, 3.3, 0.86, (g, w, h) => { paper(g, w, h, '#b99a6b', 4);
      T(g, 'BLIND DATE WITH A BOOK', w / 2, h * 0.36, h * 0.32, '#3a2214', { f: F.abril, ls: 1, max: w * 0.88 }); T(g, 'three clues. no title.', w / 2, h * 0.76, h * 0.24, '#8a1c1c', { f: F.caveat, w: 700, max: w * 0.86 }); }, { cw: 420, ch: 110 });
  }

  // ---- the far end: a chair and a lamp, to sit and look back down the shop --------------------------------------
  {
    const p = at(AIS, D - 0.02, 0, 'street'), pw = 2.7, ph = 3.1, z = 6.5;
    p.box(BLACK, -pw / 2 - 0.08, pw / 2 + 0.08, 0.01, 0.07, z - ph / 2 - 0.08, z + ph / 2 + 0.08); kit.sign(p, 0, 0.082, z, pw, ph, POSTER.mouth, { cw: Math.round(pw * 150), ch: Math.round(ph * 150) });
    kit.rug(...(() => { const [X0, Y0] = lot.XY(AIS - 3.9, D - 7.0), [X1, Y1] = lot.XY(Math.min(W - 1.2, AIS + 3.9), D - 0.5); return [Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1)]; })(), FLOOR, 'tabriz');
    kit.armchair(at(AIS, D - 0.3, 0, 'street'), 'velvet#3f5a48', 'linen#c9952a');
    kit.floorLamp(R, Math.min(W - 1.5, AIS + 2.9), D - 1.5);
    kit.model('round_wooden_table_02', R, AIS - 3.0, D - 1.8, 0, 0, { collide: true });
    kit.openBook(at(AIS - 3.0, D - 1.9, 0, 'street'), 0, 0, 2.46, { cover: 'c#26364f/0.7' });
  }

  // ---- the window: books to read at dusk, under a paper moon ---------------------------------------------------
  {
    const wa0 = 0.6, wa1 = AIS - 3.9, w = at((wa0 + wa1) / 2, 2.5, 0, 'street'), hw = (wa1 - wa0) / 2, NAVY = 'velvet#26364f';   // +y toward the glass, x toward smaller a
    w.box(OXB, -hw, hw, 0, 2.4, 0, 1.86, G); w.box(NAVY, -hw, hw, 0, 2.4, 1.86, 1.9);
    w.block(-hw, hw, -0.05, 2.5, 0, 1.9);
    DUSK.forEach((b, i) => { const x = (i - 1.5) * (hw * 0.52) ; w.box(DARKW, x - 0.2, x + 0.2, 1.1, 1.32, 1.9, 2.5); jacket(w, x, 1.38, 1.905, b, 0.84, 1.24, { cw: 176, ch: 260 }); });
    w.box(DARKW, -1.0, 1.0, 1.82, 1.88, 1.9, 2.92); kit.sign(w, 0, 1.892, 2.41, 1.9, 0.96, POSTER.dusk, { cw: 300, ch: 152 });
    kit.bookStack(w, -hw + 0.9, 1.6, 1.9, 5); kit.pillarCandle(w, hw - 0.8, 1.7, 1.9, 0.6, 0.13); kit.pillarCandle(w, hw - 1.15, 1.45, 1.9, 0.38, 0.13);
    const mo = [hw - 1.6, 1.3, 7.7];                          // the paper moon, on a thread
    w.cyl('c#17140f/0.8', mo[0], mo[1], mo[2] + 0.85, 12, 0.008, 0.008, 4);
    kit.sign(w, mo[0], mo[1] + 0.03, mo[2], 1.7, 1.7, POSTER.moon, { round: true, glow: 1.1, cw: 128, ch: 128 }); kit.sign(w.sub(mo[0], mo[1] - 0.03, 0, 2), 0, 0, mo[2], 1.7, 1.7, POSTER.moon, { round: true, glow: 1.1, cw: 128, ch: 128 });
    X.pendant(w, 0, 1.4, { kind: 'bulb', drop: 3.7, power: 1.0 });
  }
  kit.pottedPlant(R, 1.5, 5.0, 0, 'leafy', { size: 1.5 });

  // ---- lamps down the aisles ------------------------------------------------------------------------------------
  for (const d of [0.5, 0.72]) X.pendant(R, AIS, D * d, { kind: 'globe', drop: 3.4, power: 0.85 });
  X.pendant(R, (CD + SP - 0.96) / 2, D * 0.61, { kind: 'globe', drop: 3.4, power: 0.85 });

  // ---- out on the pavement: the free cart and the board ---------------------------------------------------------
  {
    const o = K.wrap(lot.frOut(kit, 3.7, 0.45, 0, 'street'));   // the cart: +y toward the kerb
    for (const z of [1.0, 2.15]) { o.box(WOOD, -1.8, 1.8, 0, 0.86, z, z + 0.08, G); kit.bookRow(o, -1.7, 1.7, 0.03, z + 0.08, 1.0, 0.86); }
    o.box(WOOD, -1.8, 1.8, 0, 0.05, 1.0, 3.3, G); o.box(WOOD, -1.8, 1.8, 0, 0.9, 3.25, 3.33, G); for (const s of [-1, 1]) o.box(WOOD, s * 1.8 - 0.04, s * 1.8 + 0.04, 0, 0.88, 1.0, 3.3, G);
    for (const y of [-0.07, 0.95]) { hcyl(o, IRON, 'y', 1.15, y, 0.55, 0.07, 0.55, 0.55, 16); o.box(WOOD, -1.5, -1.4, y < 0 ? 0.02 : 0.76, y < 0 ? 0.12 : 0.86, 0, 1.0); }
    for (const y of [0.06, 0.82]) tube(o, WOOD, [[-1.8, y, 2.3], [-2.3, y, 2.52]], 0.04, 6, true);
    o.box(DARKW, -1.38, 1.38, 0.4, 0.46, 3.33, 3.93);
    kit.sign(o, 0, 0.472, 3.63, 2.6, 0.5, (g, w, h) => { board(g, w, h, '#efe2bc', '#6e2a26', { inset: h * 0.1, lw: 3 }); T(g, 'FREE TO A GOOD HOME', w / 2, h * 0.52, h * 0.5, '#6e2a26', { f: F.abril, ls: 1, max: w * 0.9 }); }, { cw: 330, ch: 64 });
    o.block(-2.3, 1.85, -0.1, 1.0, 0, 3.4);
    X.aBoard(K.wrap(lot.frOut(kit, AIS - 4.6, 5.4, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h); chalk(g, 'Marginalia', w / 2, h * 0.12, h * 0.1, GOLD); ICON.book(g, w / 2, h * 0.3, h * 0.16, '#f1efe6', '#252a28');
      chalk(g, 'new · used · annotated', w / 2, h * 0.5, h * 0.06, '#9aa39d', { max: w * 0.92 });
      chalk(g, "today's word:", w / 2, h * 0.68, h * 0.055, '#9aa39d'); chalk(g, 'VESPERTINE', w / 2, h * 0.77, h * 0.085, '#9fc6b0'); chalk(g, 'adj. of the evening', w / 2, h * 0.87, h * 0.05, '#9aa39d', { max: w * 0.92 }); });
  }

  // ---- Folio ---------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'folio', name: 'Folio', lot: 'books', look: { shape: 'egg', colour: '#2f5a6a', belly: '#efe4cf', trim: '#c9a45c', hat: 'beret', hatColour: '#7a2f2a', bowtie: '#c9952a', specs: true, eye: '#ffe9c0', ring: 0xf0c890, tool: 'book', hover: 4.7 },
    home: lot.world(W - 1.5, 9.6), faces: lot.world(W - 7, 9.6), posts: [lot.world(W - 1.5, 7.6), lot.world(W - 1.5, 11.6), lot.world(W - 1.5, 9.6)],
    lines: {
      greet: ['Good evening. Do come in.', 'Welcome to Marginalia. Alphabetical, mostly.'],
      idle: ['*pencils a very small tick in a margin*', '*moves one book two inches to the left, then back*', 'Page 211 has a typo. I have left it a kind note.'],
      bye: ['Come back and tell me where you stopped.', 'Mind the cliffhangers.'],
      topics: [
        { q: 'Could you recommend something?', a: 'Gladly. Comforted, or unsettled?', next: [
          { q: 'Comforted.', a: '"Bread, Again". One recipe and three hundred pages of encouragement.' },
          { q: 'Unsettled.', a: '"The Night Ferry Timetable". A love story told in departures.' }] },
        { q: 'What does "thoroughly annotated" mean?', a: 'I read every book before I shelve it, and I cannot read without a pencil.', next: [
          { q: 'Any strong notes?', a: 'One handbook called singular "they" a modern error. It dates from about 1375. I wrote the date in the margin.' }] },
        { q: 'Anything good in Linguistics?', a: 'First tall case on the right. Syntax and semantics share a shelf; I can hear them at night.' },
        { q: 'How does the blind date shelf work?', a: 'Brown paper, three clues, no title. Nobody has brought one back.' },
        { q: 'What is the typewriter for?', a: 'Each visitor adds one sentence. It is becoming a novel.' },
      ],
    },
  });
}
