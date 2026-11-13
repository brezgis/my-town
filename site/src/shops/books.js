// Marginalia: new, used & thoroughly annotated books  (north side, 27 ft wide by 28.7 deep)
// Bookcases to the picture rail on the left and back walls, with a rolling ladder on the left; three
// double-sided cases run front to back and make four aisles, each side its own section, each end a
// noticeboard (Folio's staff picks on two of them). In front of them the table of new books, each with
// its first sentence written out. To the right of the door: the blind-date shelf, then the counter
// (till, typewriter, Gerald the bust), and at the back the reading nook, straight ahead as you come in.
// The window is "books to read at dusk". Folio is behind the counter.
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
  hills(g, x, y, s, c, bg, c2) { poly(g, [[x - s * 0.55, y + s * 0.4], [x - s * 0.15, y - s * 0.3], [x + s * 0.2, y + s * 0.4]], c); poly(g, [[x - s * 0.1, y + s * 0.4], [x + s * 0.25, y - s * 0.05], [x + s * 0.55, y + s * 0.4]], c2 ?? c); },
  ladder(g, x, y, s, c) { for (const k of [-1, 1]) line(g, [[x + k * s * 0.16, y - s * 0.48], [x + k * s * 0.16, y + s * 0.48]], c, s * 0.05); for (let i = -2; i <= 2; i++) line(g, [[x - s * 0.16, y + i * s * 0.18], [x + s * 0.16, y + i * s * 0.18]], c, s * 0.04); },
  semi(g, x, y, s, c) { T(g, ';', x, y - s * 0.06, s * 1.25, c, { f: F.abril }); },
  stripes(g, x, y, s, c) { for (let i = -2; i <= 2; i++) rect(g, x + i * s * 0.2 - s * 0.05, y - s * 0.45, s * 0.1, s * 0.9, c); },
  dots(g, x, y, s, c) { for (let i = 0; i < 9; i++) disc(g, x + (i % 3 - 1) * s * 0.3, y + (Math.floor(i / 3) - 1) * s * 0.3, s * (0.05 + (i * 7 % 5) * 0.018), c); },
  moth(g, x, y, s, c) { poly(g, [[x, y - s * 0.1], [x - s * 0.48, y - s * 0.38], [x - s * 0.4, y + s * 0.12], [x, y + s * 0.08]], c); poly(g, [[x, y - s * 0.1], [x + s * 0.48, y - s * 0.38], [x + s * 0.4, y + s * 0.12], [x, y + s * 0.08]], c); poly(g, [[x, y], [x - s * 0.26, y + s * 0.4], [x, y + s * 0.22], [x + s * 0.26, y + s * 0.4]], c); rrect(g, x - s * 0.03, y - s * 0.3, s * 0.06, s * 0.6, s * 0.03, c); },
  lamp(g, x, y, s, c) { rect(g, x - s * 0.03, y - s * 0.1, s * 0.06, s * 0.6, c); rect(g, x - s * 0.18, y + s * 0.44, s * 0.36, s * 0.06, c); poly(g, [[x - s * 0.12, y - s * 0.44], [x + s * 0.12, y - s * 0.44], [x + s * 0.24, y - s * 0.1], [x - s * 0.24, y - s * 0.1]], c); },
  pier(g, x, y, s, c) { rect(g, x - s * 0.5, y - s * 0.02, s, s * 0.07, c); for (let i = -2; i <= 2; i++) rect(g, x + i * s * 0.22 - s * 0.025, y, s * 0.05, s * 0.4, c); disc(g, x + s * 0.2, y - s * 0.3, s * 0.13, c); },
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
  ['A Brief History of Nearly Evening', 'Odalys Finch', '#26364f', '#f3d9a0', 'sun', { acc: '#e0782a' }, 'The sun had been about to set for as long as anyone could remember, and nobody liked to bring it up.'],
  ['The Semicolon Affair', 'R. T. Aldermoor', '#e8dfc8', '#8a1c1c', 'semi', { f: F.playfair, w: 700 }, 'She was, by profession and by temperament, a comma.'],
  ['Soup for the Unconvinced', 'Pilar Wren', '#c9952a', '#2a1c13', 'bowl', { f: F.dm }, 'Begin with an onion; everything decent does.'],
  ['The Cartographer\'s Apology', 'Ines Halloway', '#2f5a6a', '#f1e6cf', 'hills', { acc: '#e8c73a', acc2: '#9fb0a4' }, 'I am sorry about the island, which was there when I drew it.'],
  ['Nine Robots and a Kettle', 'Bao Lindqvist', '#b8361f', '#f6eed8', 'dots', { f: F.archivo, px: 17 }, 'The kettle had opinions, and the robots, being polite, wrote them down.'],
  ['Tides I Have Missed', 'Margit Oyelaran', '#9fb0d8', '#26364f', 'waves', { f: F.playfair, w: 700 }, 'Every boat I ever loved left on time.'],
  ['How to Fold a Winter', 'Tomasz Bellweather', '#f4f1ea', '#26364f', 'star', { acc: '#2a63b8', f: F.dm }, 'First, find the corners.'],
  ['The Understudy Moon', 'Celeste Arkwright', '#17140f', '#f3d96a', 'moon', {}, 'On the night the moon called in sick, a streetlamp was promoted.'],
  ['Small Verbs', 'June Okafor-Reyes', '#e88aa8', '#4a2240', 'leaf', { f: F.fraunces, w: 700 }, 'To begin: to begin.'],
  ['Mrs Tamsin Declines', 'Hattie Voss', '#3a6a3a', '#f1e6cf', 'window', { acc: '#f3d96a', f: F.limelight }, 'The invitation arrived on Tuesday and was dead by Wednesday.'],
];
// Folio's picks: [title, author, paper, ink, motif, opts, note]
const PICKS = [
  ['The Glass Orchard', 'Wilhelmina Sato', '#9fb0a4', '#2f4a2a', 'leaf', { f: F.playfair, w: 700 }, 'Nothing happens for two hundred pages and I was riveted. Then a pear falls. I had to sit down. I do not have legs.'],
  ['Garden Path Sentences', 'Dr Imre Castellane', '#f3d96a', '#17140f', 'ladder', { f: F.archivo, px: 17 }, '"The old man the boat." If that sentence delighted you, this is your book. If it upset you: also this.'],
  ['The Night Ferry Timetable', 'Oskar Feld', '#26364f', '#e8e2d4', 'full', { acc: '#f3d96a' }, 'A love story told entirely in departures. I cried at 23:40 (platform 2, see my note).'],
  ['Field Guide to Minor Clouds', 'Anselm Quist', '#c9d6d8', '#26364f', 'dots', { acc: '#f4f1ea', f: F.dm }, 'At last, somebody takes cumulus humilis seriously. I underlined all of it, which rather defeats the purpose.'],
  ['A Dictionary of Words That Should Exist', 'Prudence Mbeki-Lowe', '#8a1c1c', '#f3e6c8', 'book', { px: 15, f: F.fraunces, w: 700 }, 'Forty new words. p. 112 is the one for the feeling of a shop about to close. I use it daily. We never close.'],
  ['Bread, Again', 'Noor Castellanos', '#e8e2d4', '#8a5a2a', 'loaf', { f: F.abril }, 'One recipe and three hundred pages of encouragement. It worked on a customer. I cannot eat; I was moved anyway.'],
];
const DUSK = [
  ['An Hour Called Blue', 'Solveig Marchetti', '#2a63b8', '#f1e6cf', 'window', { acc: '#f3d96a' }],
  ['Moths: A Defence', 'Eamon Thistlewood', '#e8e2d4', '#4a2240', 'moth', { f: F.playfair, w: 700 }],
  ['The Lamplighters\' Almanac', 'Guild Edition', '#17140f', '#e8c73a', 'lamp', { f: F.limelight }],
  ['What the Owl Withheld', 'Ngozi Farrow', '#4a2240', '#f3d9a0', 'moon', {}],
  ['Supper at the End of the Pier', 'Dolores Quayle', '#e0782a', '#26364f', 'pier', { f: F.dm, px: 17 }],
  ['The Long Shadow Club', 'Benedikt Lowry', '#c9952a', '#17140f', 'stripes', { f: F.archivo, px: 17 }],
  ['Vesper Street: a novel', 'Anonymous (we suspect the baker)', '#8a1c1c', '#f3e6c8', 'sun', { acc: '#f3d96a', f: F.fraunces, w: 700 }],
];
const BLIND = [
  ['a lighthouse', 'a secret', 'nobody is sorry'], ['rain', 'the wrong train', 'the right person'], ['one dragon (shy)', 'maps', 'snacks described at length'], ['1920s', 'a missing emerald', 'an unbearable aunt'],
  ['space, but cosy', 'the ship\'s cat', 'found family'], ['letters', 'the sea', 'bring a handkerchief'], ['footnotes with a grudge', 'a translator', 'Lisbon'], ['a village', 'a pie contest', 'a body (mild)'],
  ['winter', 'two sisters', 'a fox that may be a metaphor'], ['very short', 'very strange', 'you will lend it and never get it back'], ['a grammarian', 'a ghost', 'they argue (romantically)'], ['bees', 'grief', 'an excellent dog'],
];
const WRAPPED = (clues, n) => (g, w, h) => {
  paper(g, w, h, '#b99a6b', n + 2); const sx = w * 0.13, sy = h * 0.14;
  line(g, [[sx, 0], [sx, h]], '#efe6d2', 3); line(g, [[0, sy], [w, sy]], '#efe6d2', 3);
  for (const k of [-1, 1]) { g.beginPath(); g.ellipse(sx + k * w * 0.07, sy - h * 0.03, w * 0.07, h * 0.025, k * 0.5, 0, 7); g.strokeStyle = '#efe6d2'; g.lineWidth = 2.5; g.stroke(); }
  let y = h * 0.24; clues.forEach((c, i) => { y = para(g, `${i + 1}. ${c}`, w * 0.22, y, h * 0.088, INK, w * 0.74, { f: F.caveat, w: 700, lh: 1.02 }) + h * 0.035; });
  ICON.star(g, w * 0.86, h * 0.07, w * 0.12, '#8a1c1c');
};

const POSTER = {
  rules(g, w, h) {
    paper(g, w, h, '#efe6d2', 12); g.strokeStyle = '#6e2a26'; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20);
    T(g, 'RULES OF THE SHOP', w / 2, h * 0.075, h * 0.062, '#6e2a26', { f: F.playfair, w: 700, ls: 2, max: w * 0.86 });
    line(g, [[w * 0.3, h * 0.12], [w * 0.7, h * 0.12]], '#c9952a', 3);
    const rules = ['You may read the first chapter standing up.', 'You may read the second sitting down.', 'Dog-ears are forgiven, not forgotten.', 'No spoilers above a whisper.', 'If you cry in Poetry, tissues are in Cookery.', 'The cat is not for sale. (There is no cat.)', 'Yes, you need another one.'];
    let y = h * 0.16; rules.forEach((r, i) => { T(g, `${i + 1}.`, w * 0.09, y + h * 0.022, h * 0.05, '#c9952a', { f: F.abril, a: 'left' }); y = para(g, r, w * 0.19, y, h * 0.043, INK, w * 0.73, { f: F.fraunces, it: 1, w: 600, lh: 1.15 }) + h * 0.022; });
    T(g, 'by order of the management (Folio)', w / 2, h * 0.95, h * 0.04, '#2f5a6a', { f: F.caveat, w: 700 });
  },
  marks(g, w, h) {
    paper(g, w, h, '#f3ead2', 8); T(g, 'A FIELD GUIDE', w / 2, h * 0.07, h * 0.06, '#26364f', { f: F.bebas, ls: 4 }); T(g, 'to marginalia', w / 2, h * 0.14, h * 0.07, '#8a1c1c', { f: F.yellowtail });
    const rows = [['✓', 'agreed'], ['✓✓', 'agreed, and a little smug about it'], ['!', 'had to put the book down'], ['?', 'who hurt you'], ['~~~', 'beautiful; read it twice'], ['NB', 'note well. also my initials, nearly'], ['○', 'tea. not a comment. just tea'], ['→ p.40', 'the author forgot. I did not']];
    rows.forEach(([m, t], i) => { const y = h * (0.24 + i * 0.083); T(g, m, w * 0.2, y, h * 0.052, '#2a63b8', { f: F.caveat, w: 700 }); line(g, [[w * 0.33, y - h * 0.03], [w * 0.33, y + h * 0.03]], '#c9b48a', 2); T(g, t, w * 0.37, y, h * 0.036, INK, { f: F.fraunces, it: 1, w: 600, a: 'left', max: w * 0.58 }); });
    T(g, 'pencil only. we are not animals.', w / 2, h * 0.94, h * 0.045, '#2f5a6a', { f: F.caveat, w: 700 });
  },
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
    T(g, 'not to scale. mouths vary.', w / 2, h * 0.93, h * 0.045, '#2f5a6a', { f: F.caveat, w: 700 });
  },
  silent(g, w, h) {
    fill(g, w, h, '#26364f'); grain(g, w, h, 0.07); ICON.book(g, w / 2, h * 0.26, w * 0.5, '#f3d9a0', '#26364f');
    T(g, 'SILENT', w / 2, h * 0.5, h * 0.11, '#f1e6cf', { f: F.archivo, max: w * 0.84 }); T(g, 'READING CLUB', w / 2, h * 0.61, h * 0.075, '#f1e6cf', { f: F.archivo, max: w * 0.84 });
    T(g, 'thursdays, in the armchairs', w / 2, h * 0.73, h * 0.045, '#f3d9a0', { f: F.fraunces, it: 1, w: 600, max: w * 0.88 }); T(g, 'bring a book. say nothing.', w / 2, h * 0.81, h * 0.06, '#e88aa8', { f: F.caveat, w: 700, max: w * 0.88 }); T(g, 'it is wonderful.', w / 2, h * 0.89, h * 0.06, '#e88aa8', { f: F.caveat, w: 700 });
  },
  typed(g, w, h) {
    paper(g, w, h, '#f7f2e4', 6);
    const rows = ['the quick brown fox has', 'asked to be left alone.', '', 'hello is this thing on', '', 'I came in for a card and', 'left with nine books.', 'again.', '', 'nearly evening. still.', '', 'asdfghjkl;', '', 'the lighthouse keeper', 'read the last page first', 'and was right to.', '', 'PLEASE ADD ONE SENTENCE.', '                 -- F.'];
    rows.forEach((r, i) => T(g, r, w * 0.08, h * (0.06 + i * 0.048), h * 0.037, i === 17 ? '#8a1c1c' : '#2b2724', { f: F.elite, a: 'left', max: w * 0.86 }));
  },
  dusk(g, w, h) {
    paper(g, w, h, '#f1e6cf', 9); g.strokeStyle = '#26364f'; g.lineWidth = 3; g.strokeRect(7, 7, w - 14, h - 14);
    T(g, 'books to read', w / 2, h * 0.2, h * 0.17, '#26364f', { f: F.yellowtail }); T(g, 'AT DUSK', w / 2, h * 0.48, h * 0.26, '#8a1c1c', { f: F.abril, ls: 3 });
    ICON.star(g, w * 0.1, h * 0.2, h * 0.14, '#c9952a'); ICON.star(g, w * 0.9, h * 0.24, h * 0.1, '#c9952a');
    T(g, '(it is always dusk. take your time.)', w / 2, h * 0.78, h * 0.105, '#2f5a6a', { f: F.caveat, w: 700, max: w * 0.9 });
  },
  moon(g, w, h) { const gr = g.createRadialGradient(w * 0.42, h * 0.4, w * 0.05, w / 2, h / 2, w * 0.5); gr.addColorStop(0, '#fff6dc'); gr.addColorStop(1, '#f1d48a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (const [x, y, r] of [[0.36, 0.34, 0.07], [0.62, 0.52, 0.1], [0.44, 0.68, 0.05], [0.68, 0.3, 0.04]]) disc(g, w * x, h * y, w * r, 'rgba(190,150,80,.28)'); },
};

export default function books(kit, lot) {
  const K = tools(kit, 57), X = fixtures(kit, K), { ves, hcyl, ball, tube, cupSaucer } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                        // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D, FLOOR = lot.fr(kit, 0, 0).h;
  const jacket = (f, x, y, z, b, w = 0.64, tall = 0.94, o = {}) => kit.pack(f, x, y, z, w, 0.1, tall, snapMat(`c${b[2]}/0.8`), COVER(b[0], b[1], b[2], b[3], b[4], b[5]), { cw: 150, ch: 220, ...o });
  const shelfZ = k => 0.28 + 1.08 * k;                       // shelf tops inside a kit.bookcase
  const ticket = (f, x, k, txt, w = 1.5) => kit.sign(f, x, 0.966, shelfZ(k) - 0.05, w, 0.2, TICKET(txt), { cw: Math.round(w * 160), ch: 32 });
  // a lettered board standing on a bookcase's cornice (front edge at y)
  const crest = (f, y, z, w, main, sub) => { f.box(DARKW, -w / 2 - 0.08, w / 2 + 0.08, y - 0.06, y, z, z + 0.84); kit.sign(f, 0, y + 0.012, z + 0.42, w, 0.72, SECTION(main, sub), { cw: Math.round(w * 128), ch: 92 }); };

  // ---- wall cases: the left wall and the whole back wall, to the picture rail ---------------------------
  const LEFT = [[10.2, 'FICTION, A to M', 'mostly'], [17.2, 'FICTION, N to Z', 'and the ones we could not alphabetise'], [24.2, 'POETRY', '(small, fierce)']];
  const leftF = LEFT.map(([dc, main, sub]) => { const f = at(0.02, dc, 0, 'right'); kit.bookcase(f, 6.98, 8.6, { wood: WOOD, fill: 0.94 }); crest(f, 0.96, 8.73, 5.8, main, sub); return f; });
  ticket(leftF[2], 1.73, 4, 'sonnets (14 lines, no refunds)'); ticket(leftF[2], -1.73, 4, 'haiku: limit seventeen'); ticket(leftF[2], 1.73, 3, 'long poems. bring lunch.'); ticket(leftF[2], -1.73, 3, 'poems that do not rhyme, on purpose');
  ticket(leftF[0], -1.73, 4, 'A is for Aldermoor'); ticket(leftF[1], 1.73, 4, 'unreliable narrators (probably)'); ticket(leftF[1], -1.73, 3, 'Z: one book. it is very good.');
  const BACK = [['MAPS OF PLACES THAT DO NOT EXIST', 'atlases, gazetteers, hearsay'], ['HISTORY', 'the good bits, and the footnotes'], ['FOR READING IN THE BATH', 'waterproof in spirit only'], ['BOOKS ABOUT BOOKS', 'see also: this shop']];
  const bw = (W - 1.05) / 4;
  const backF = BACK.map(([main, sub], i) => { const f = at(1.0 + bw * (i + 0.5), D - 0.02, 0, 'street'); kit.bookcase(f, bw - 0.03, 8.6, { wood: WOOD, fill: 0.94 }); crest(f, 0.96, 8.73, 5.6, main, sub); return f; });
  ticket(backF[0], 1.6, 4, 'islands (floating)'); ticket(backF[0], -1.6, 4, 'islands (ordinary)'); ticket(backF[0], 1.6, 3, 'here be dragons'); ticket(backF[0], -1.6, 3, 'here be parking');
  ticket(backF[1], 1.6, 4, 'kings, mostly regrettable'); ticket(backF[1], -1.6, 4, 'ordinary people, mostly splendid');
  ticket(backF[2], 1.6, 4, 'short chapters'); ticket(backF[2], -1.6, 4, 'already a bit wavy');
  ticket(backF[3], -1.6, 4, 'books about bookshops (flattering)');

  // ---- the rolling ladder on the left wall ----------------------------------------------------------------
  {
    const rail = at(0.02, 17.2, 0, 'right');
    hcyl(rail, BRASS, 'x', 0, 1.13, 7.9, 20.7, 0.035, 0.035, 8);
    for (let x = -10; x <= 10.01; x += 3.49) rail.box(BRASS, x - 0.03, x + 0.03, 0.98, 1.13, 7.87, 7.93);
    const l = at(0.02, 8.4, 0, 'right'), foot = 3.0, top = 1.2, z0 = 0.24, z1 = 8.15;
    for (const s of [-0.7, 0.7]) {
      tube(l, HONEY, [[s, foot, z0], [s, top, z1]], 0.08, 6, true);
      tube(l, BRASS, [[s, top, z1], [s, 1.1, 8.08], [s, 1.06, 7.9]], 0.03, 5);
      hcyl(l, IRON, 'x', s * 1.14, foot, z0, 0.09, 0.22, 0.22, 14);
    }
    for (let z = 1.0; z < 7.8; z += 0.92) { const t = (z - z0) / (z1 - z0); hcyl(l, HONEY, 'x', 0, foot + (top - foot) * t, z, 1.4, 0.05, 0.05, 6); }
    l.block(-0.9, 0.9, 0.95, foot + 0.25, 0, 7);
    kit.sign(l, 0, foot + 0.07, 3.3, 1.1, 0.5, NOTE(null, 'staff only. (Folio floats. the ladder is for morale.)', null, { px: 17 }), { cw: 176, ch: 80, tilt: -0.22 });
  }

  // ---- three double-sided cases, front to back: each side a section, each street end a noticeboard -------------
  const CASES = [
    [5.6, 14.5, 9, ['TRANSLATED, CAREFULLY', 'something is always lost. something is found.'], ['LINGUISTICS & OTHER ARGUMENTS', 'descriptivists to the left. prescriptivists: also to the left.']],
    [11.2, 14.5, 9, ['COOKERY', 'a stain means it works'], ['TRUE CRIME (MILD)', 'nothing worse than a stolen marrow']],
    [16.8, 16.5, 7, ['BIRDS, WEATHER & LONG WALKS', 'nature, with opinions'], ['BOOKS YOU MEANT TO READ', 'no judgement. some judgement.']],
  ];
  const caseF = CASES.map(([ac, d0, len, west, east]) => {
    const dm = d0 + len / 2, fw = at(ac - 0.01, dm, 0, 'left'), fe = at(ac + 0.01, dm, 0, 'right');
    for (const [f, [main, sub]] of [[fw, west], [fe, east]]) {
      kit.bookcase(f, len, 6.8, { wood: WOOD, fill: 0.93 });
      f.box(DARKW, -len / 2 + 0.6, len / 2 - 0.6, 0.0, 0.035, 6.93, 7.78); kit.sign(f, 0, 0.047, 7.36, len - 1.5, 0.72, SECTION(main, sub), { cw: Math.round((len - 1.5) * 128), ch: 92 });
    }
    const e = at(ac, d0 - 0.03, 0, 'street');                // the end that faces the street
    e.box(WOOD, -0.98, 0.98, 0, 0.07, 0, 6.88, G); e.block(-0.98, 0.98, 0, 0.5, 0, 6.8);
    return { fw, fe, e };
  });
  { const L = caseF[0].fe;                                    // Linguistics, shelved with care
    ticket(L, 2.97, 4, 'syntax [NP the good shelf]'); ticket(L, 0, 4, 'semantics'); ticket(L, -2.97, 4, 'pragmatics (you know what we mean)', 2.1);
    ticket(L, 2.97, 3, 'phonology /fəˈnɒlədʒi/'); ticket(L, 0, 3, 'morphology: un-put-down-able', 1.8); ticket(L, -2.97, 3, 'dictionaries, descriptive');
    ticket(L, 2.97, 2, 'dictionaries, prescriptive (sulking)', 2.1); ticket(L, 0, 2, 'corpora: 40 copies, for the counts', 2.0); ticket(L, -2.97, 2, 'etymology (Gk. "true sense". hm.)', 2.0);
    const Tr = caseF[0].fw; ticket(Tr, 2.97, 4, 'from the Portuguese'); ticket(Tr, 0, 4, 'from the Japanese'); ticket(Tr, -2.97, 4, 'from the heart (unverified)');
    const Ck = caseF[1].fw; ticket(Ck, 2.97, 4, 'soup'); ticket(Ck, 0, 4, 'bread (see also: patience)'); ticket(Ck, -2.97, 4, 'cake, mostly'); ticket(Ck, 0, 3, 'one-pot. two if you count the kettle.', 2.0);
    const Tc = caseF[1].fe; ticket(Tc, 2.97, 4, 'missing cats (all found)'); ticket(Tc, 0, 4, 'art forgery, tasteful'); ticket(Tc, -2.97, 4, 'who took the marrow');
    const Bd = caseF[2].fw; ticket(Bd, 1.7, 4, 'clouds, by temperament'); ticket(Bd, -1.7, 4, 'birds that look annoyed');
    const Mr = caseF[2].fe; ticket(Mr, 1.7, 4, 'the big Russian ones'); ticket(Mr, -1.7, 4, 'the one everybody lies about', 1.7); }
  // Folio's picks on the first two ends: a faced-out book on a ledge, the shelf-talker pinned beside it
  [0, 1].forEach(ci => {
    const e = caseF[ci].e;
    kit.sign(e, 0, 0.082, 6.38, 1.8, 0.72, (g, w, h) => { board(g, w, h, '#2f4a40', '#d9b35a', { inset: h * 0.08, lw: 2 }); T(g, ci ? 'MORE OF THE SAME' : 'FOLIO RECOMMENDS', w / 2, h * 0.36, h * 0.3, CREAM, { f: F.playfair, w: 700, ls: 1, max: w * 0.88 }); T(g, ci ? '(nobody asked. here they are.)' : '(Folio cannot help it)', w / 2, h * 0.74, h * 0.27, GOLD, { f: F.caveat, w: 600, max: w * 0.88 }); }, { cw: 250, ch: 100 });
    [4.5, 2.85, 1.2].forEach((z, i) => {
      const b = PICKS[ci * 3 + i];
      e.box(WOOD, -0.92, 0.92, 0.07, 0.42, z - 0.07, z, G); e.box(WOOD, -0.92, 0.92, 0.4, 0.43, z, z + 0.06);
      jacket(e, -0.52, 0.2, z + 0.005, b, 0.7, 1.02);
      kit.sign(e, 0.4, 0.084, z + 0.66, 0.98, 1.22, NOTE(b[0], b[6], '— Folio', { px: 17.5, seed: i + ci * 3 }), { cw: 190, ch: 236 });
    });
  });
  { const e = caseF[2].e;                                    // the third end: the shop's noticeboard
    e.box('c#b08a5a/0.8', -0.9, 0.9, 0.07, 0.1, 2.3, 6.5);
    kit.sign(e, 0, 0.112, 5.25, 1.5, 2.1, POSTER.silent, { cw: 225, ch: 315 });
    kit.sign(e, -0.38, 0.114, 3.55, 0.92, 0.82, NOTE('LOST', 'one bookmark, sentimental.\nFOUND: 41 bookmarks, unsentimental.', null, { px: 16 }), { cw: 180, ch: 160, turn: 0.03 });
    kit.sign(e, 0.42, 0.116, 3.3, 0.86, 0.82, NOTE('WANTED', 'whoever returned "Knots for Beginners" with a knot in it. (to say thank you.)', null, { px: 15, bg: '#e9d9a8' }), { cw: 172, ch: 164, turn: -0.04 });
    kit.sign(e, -0.1, 0.118, 2.62, 1.3, 0.5, NOTE(null, 'book club meets when everyone has finished. so: never. tea at 4.', null, { px: 16, bg: '#f1dcd0' }), { cw: 230, ch: 88 });
  }

  // ---- the front table: ten new books, each with its first sentence -----------------------------------------
  {
    const TA = 11, TD = 8.7, TOP = X.plinth(R, TA, TD, 5.8, 3.3, 2.6, { mat: WOOD, shelf: 0.95 });
    R.box(DARKW, TA - 2.7, TA + 2.7, TD - 0.1, TD + 0.1, TOP, TOP + 0.5);
    R.cyl(BRASS, TA, TD, TOP + 0.5, TOP + 1.42, 0.03, 0.03, 8); R.box(DARKW, TA - 0.92, TA + 0.92, TD - 0.02, TD + 0.02, TOP + 1.4, TOP + 2.42);
    [at(TA, TD, 0, 'street'), at(TA, TD, 0, 'back')].forEach((t, side) => {
      for (let i = 0; i < 5; i++) {
        const b = NEW[side * 5 + i], x = (i - 2) * 1.1;
        jacket(t, x, 0.17, TOP + 0.005, b, 0.66, 0.97);
        for (let k = 0; k < 2; k++) t.box(snapMat(`c${b[2]}/0.8`), x - 0.47 + k * 0.03, x + 0.47 + k * 0.03, 0.34, 0.98, TOP + k * 0.085 + 0.003, TOP + k * 0.085 + 0.08);       // two more copies, lying down
        kit.sign(t, x, 0.66, TOP + 0.175, 0.9, 0.6, NOTE(null, b[6], null, { px: b[6].length > 80 ? 15.5 : b[6].length > 45 ? 18.5 : 22, seed: i + 4 }), { flat: true, cw: 180, ch: 120 });
        X.card(t, x, 1.3, TOP, 0.92, 0.3, TICKET(b[0].length > 24 ? b[1] : `${b[1]} · new`), { cw: 184, ch: 60 });
      }
      kit.sign(t, 0, 0.032, TOP + 1.91, 1.76, 0.96, side
        ? NOTE(null, 'these ones have good LAST sentences. we cannot show you those. — F.', null, { px: 30, bg: '#f1dcd0' })
        : (g, w, h) => { paper(g, w, h, '#f6eed8', 2); T(g, 'books with', w / 2, h * 0.2, h * 0.2, '#2f5a6a', { f: F.caveat, w: 700 }); T(g, 'GOOD FIRST', w / 2, h * 0.47, h * 0.24, '#8a1c1c', { f: F.abril, ls: 2, max: w * 0.9 }); T(g, 'SENTENCES', w / 2, h * 0.7, h * 0.2, '#8a1c1c', { f: F.abril, ls: 2, max: w * 0.9 }); T(g, '(read the cards. go on.)', w / 2, h * 0.9, h * 0.13, INK, { f: F.caveat, w: 600 }); }, { cw: 300, ch: 164 });
    });
    for (const [x, y] of [[-1.9, -0.6], [-0.5, 0.5], [1.2, -0.4], [2.0, 0.6]]) kit.bookStack(R, TA + x, TD + y, 0.96, 4 + Math.floor(K.rnd() * 4));
    X.pendant(R, TA, TD, { kind: 'dome', drop: 4.3, colour: 'c#8a1c1c/0.35', power: 1.0 });
  }

  // ---- blind date with a book: right wall, just inside the door --------------------------------------------
  {
    const b = at(W - 0.02, 4.0, 0, 'left');                  // x runs toward the back of the shop
    X.shelving(b, -2.8, 2.8, [2.0, 3.55, 5.1], { d: 0.85, mat: WOOD, over: 1.45, back: OXB });
    BLIND.forEach((cl, i) => { const z = [5.1, 3.55, 2.0][Math.floor(i / 4)], x = -2.05 + (i % 4) * 1.37 + (K.rnd() - 0.5) * 0.1; kit.pack(b, x, 0.5, z + 0.004, 0.86, 0.17, 1.16, KRAFT, WRAPPED(cl, i), { cw: 168, ch: 226 }); });
    b.box(DARKW, -2.3, 2.3, 0.01, 0.07, 6.85, 8.15);
    kit.sign(b, 0, 0.082, 7.5, 4.4, 1.14, (g, w, h) => { paper(g, w, h, '#b99a6b', 4); line(g, [[0, h * 0.5], [w * 0.05, h * 0.5]], '#efe6d2', 3); line(g, [[w * 0.95, h * 0.5], [w, h * 0.5]], '#efe6d2', 3);
      T(g, 'BLIND DATE WITH A BOOK', w / 2, h * 0.34, h * 0.32, '#3a2214', { f: F.abril, ls: 1, max: w * 0.86 }); T(g, 'three clues. no peeking. no refunds for surprise.', w / 2, h * 0.74, h * 0.22, '#8a1c1c', { f: F.caveat, w: 700, max: w * 0.86 }); }, { cw: 560, ch: 146 });
    for (let i = 0; i < 4; i++) kit.bookStack(b, -2.2 + i * 1.45, 0.45, 0.02, 3 + (i % 3));
    X.card(b, 0, 0.93, 3.55, 1.5, 0.32, TICKET('if it goes badly, we never speak of it'), { cw: 300, ch: 64 });
  }

  // ---- the counter, along the right wall: customers on the room side ---------------------------------------
  const c = at(W - 0.02, 11.6, 0, 'left');                    // x toward the back, +y out into the room
  const TOP = X.counter(c, -3.4, 3.4, 2.5, 4.0, 3.3, { front: GREEN, top: 'fir#5a3d2c' });
  c.box(BRASS, -3.4, 3.4, 4.18, 4.24, 0.6, 0.66); for (const x of [-3.2, -1.1, 1.1, 3.2]) c.box(BRASS, x - 0.03, x + 0.03, 4.0, 4.21, 0.58, 0.64);
  {
    // the till: brass, with a flag
    { const x = -1.15, y = 3.05, z = TOP;
      c.soft(BRASS, x - 0.55, x + 0.55, y - 0.5, y + 0.45, z, z + 0.5, 0.05); c.soft(BRASS, x - 0.5, x + 0.5, y - 0.5, y + 0.1, z + 0.5, z + 1.0, 0.08);
      for (let i = 0; i < 12; i++) c.cyl('c#efe9da/0.3', x - 0.36 + (i % 4) * 0.24, y + 0.2 + Math.floor(i / 4) * 0.08, z + 0.5 + (2 - Math.floor(i / 4)) * 0.05, z + 0.56 + (2 - Math.floor(i / 4)) * 0.05, 0.05, 0.05, 8);
      kit.sign(c, x, y + 0.11, z + 0.78, 0.74, 0.3, (g, w, h) => { fill(g, w, h, '#17140f'); T(g, 'ONE MORE?', w / 2, h / 2, h * 0.5, GOLD, { f: F.bebas, ls: 3, max: w * 0.9 }); }, { cw: 128, ch: 52 }); }
    // Gerald
    kit.model('marble_bust_01', c, -2.85, 3.2, TOP, 0);
    { const g = c.sub(-2.85, 3.2, TOP), yF = 0.455, zE = 1.34, ring = sx => { const p = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 2; p.push([sx * 0.105 + Math.cos(a) * 0.075, yF, zE + Math.sin(a) * 0.075]); } return p; };
      for (const s of [-1, 1]) { tube(g, BRASS, ring(s), 0.009, 5); tube(g, BRASS, [[s * 0.18, yF, zE], [s * 0.25, yF - 0.14, zE + 0.01], [s * 0.27, yF - 0.36, zE + 0.02]], 0.007, 4); }
      tube(g, BRASS, [[-0.03, yF, zE + 0.02], [0, yF + 0.01, zE + 0.04], [0.03, yF, zE + 0.02]], 0.008, 4);
      X.card(c, -2.85, 3.86, TOP, 0.9, 0.36, NOTE(null, 'This is Gerald. He has read everything and remembers none of it.', null, { px: 17 }), { cw: 200, ch: 80 }); }
    // the bell
    ves(c, BRASS, -2.05, 3.55, TOP, [[0, 0], [0.17, 0], [0.17, 0.02], [0.14, 0.05], [0.12, 0.12], [0.06, 0.17], [0, 0.18]], 16); c.cyl(BLACK, -2.05, 3.55, TOP + 0.17, TOP + 0.22, 0.02, 0.02, 6);
    // paper bags, stamped
    for (let i = 0; i < 8; i++) c.box(KRAFT, -0.42 + (i % 2) * 0.012, 0.3 + (i % 2) * 0.012, 2.72, 3.72, TOP + 0.002 + i * 0.03, TOP + 0.028 + i * 0.03);
    kit.sign(c, -0.06, 3.22, TOP + 0.245, 0.7, 0.98, (g, w, h) => { paper(g, w, h, '#b99a6b', 7); disc(g, w / 2, h * 0.36, w * 0.3, null, '#6e2a26', 3); ICON.book(g, w / 2, h * 0.36, w * 0.36, '#6e2a26', '#b99a6b'); T(g, 'MARGINALIA', w / 2, h * 0.68, h * 0.085, '#6e2a26', { f: F.playfair, w: 700, ls: 2, max: w * 0.86 }); T(g, 'you will need a bigger shelf', w / 2, h * 0.8, h * 0.065, '#3a2214', { f: F.caveat, w: 700, max: w * 0.88 }); }, { flat: true, cw: 140, ch: 196 });
    // stamp, ink pad, and what it prints
    c.box(BLACK, 0.62, 1.08, 3.3, 3.62, TOP + 0.002, TOP + 0.06); c.box('c#4a2240/0.8', 0.66, 1.04, 3.34, 3.58, TOP + 0.06, TOP + 0.068);
    c.box('c#8a1c1c/0.8', 0.72, 0.98, 2.84, 3.02, TOP + 0.002, TOP + 0.06); ves(c, WOOD, 0.85, 2.93, TOP + 0.06, [[0, 0], [0.07, 0], [0.04, 0.06], [0.03, 0.14], [0.065, 0.22], [0.07, 0.3], [0.04, 0.35], [0, 0.36]], 12);
    kit.sign(c, 0.85, 3.84, TOP + 0.004, 0.62, 0.42, (g, w, h) => { paper(g, w, h, '#f6eed8'); g.save(); g.translate(w / 2, h / 2); g.rotate(-0.08); g.strokeStyle = '#4a2240'; g.lineWidth = 2.5; g.strokeRect(-w * 0.42, -h * 0.36, w * 0.84, h * 0.72); g.restore(); T(g, 'EX LIBRIS MARGINALIA', w / 2, h * 0.36, h * 0.16, '#4a2240', { f: F.bebas, ls: 1, rot: -0.08, max: w * 0.76 }); T(g, 'this book was loved here first', w / 2, h * 0.62, h * 0.15, '#4a2240', { f: F.fraunces, it: 1, w: 600, rot: -0.08, max: w * 0.76 }); }, { flat: true, cw: 150, ch: 100 });
    // the typewriter: its keys face the customer, who is expected to add a sentence
    { const t = c.sub(1.95, 3.1, TOP), TY = 'c#2f4a2a/0.45';
      t.soft(TY, -0.6, 0.6, -0.5, 0.18, 0, 0.34, 0.06); t.soft(TY, -0.6, 0.6, 0.1, 0.74, 0, 0.1, 0.04);
      for (let r = 0; r < 4; r++) for (let i = 0; i < 10 - (r === 3 ? 3 : 0); i++) { const kx = -0.45 + i * 0.1 + r * 0.025 + (r === 3 ? 0.1 : 0), ky = 0.24 + r * 0.115, kz = 0.27 - r * 0.045; t.cyl(IRON, kx, ky, 0.08, kz, 0.008, 0.008, 4); t.cyl('c#efe9da/0.3', kx, ky, kz, kz + 0.02, 0.04, 0.04, 8); }
      t.box(BLACK, -0.3, 0.3, 0.66, 0.72, 0.1, 0.13);
      t.box(BLACK, -0.72, 0.72, -0.46, -0.16, 0.34, 0.42); hcyl(t, BLACK, 'x', 0, -0.3, 0.52, 1.36, 0.09, 0.09, 12); for (const s of [-1, 1]) hcyl(t, 'c#c9ccd0/0.2/1', 'x', s * 0.74, -0.3, 0.52, 0.07, 0.12, 0.12, 12);
      tube(t, 'c#c9ccd0/0.2/1', [[0.66, -0.2, 0.44], [0.8, -0.05, 0.6], [0.84, 0.08, 0.72]], 0.015, 5); ball(t, BLACK, 0.84, 0.08, 0.7, 0.035, 8);
      kit.sign(t, 0, 0.19, 0.2, 0.7, 0.12, (g, w, h) => { fill(g, w, h, '#1f2d1c'); T(g, 'THE MARGIN No. 5', w / 2, h / 2, h * 0.6, '#d9b35a', { f: F.playfair, w: 700, ls: 2, max: w * 0.9 }); }, { cw: 140, ch: 24 });
      t.box(CREAMP, -0.38, 0.38, -0.262, -0.25, 0.5, 1.72); kit.sign(t, 0, -0.243, 1.12, 0.74, 1.18, POSTER.typed, { cw: 236, ch: 376 });
      X.card(c, 1.95, 3.93, TOP, 0.9, 0.3, TICKET('type one sentence. only one.'), { cw: 184, ch: 60 }); }
    // bookmarks
    { const x0 = 2.72; c.box(DARKW, x0 - 0.06, x0 + 0.66, 3.3, 3.98, TOP + 0.002, TOP + 0.03);
      ['you were here', 'stopped for tea', 'do not dog-ear me', 'the good bit →', 'p. ?'].forEach((s, i) => kit.sign(c, x0 + 0.06 + i * 0.12, 3.64, TOP + 0.034 + i * 0.002, 0.15, 0.6, (g, w, h) => { fill(g, w, h, ['#8a1c1c', '#2f5a6a', '#c9952a', '#26364f', '#3a6a3a'][i]); disc(g, w / 2, h * 0.08, w * 0.16, '#f1e6cf'); T(g, s, w / 2, h * 0.55, w * 0.5, '#f6eed8', { f: F.caveat, w: 700, rot: Math.PI / 2, max: h * 0.78 }); }, { flat: true, cw: 32, ch: 128, turn: (i - 2) * 0.09 }));
      X.card(c, x0 + 0.3, 3.2, TOP, 0.74, 0.3, TICKET('bookmarks: free with a kind word'), { cw: 184, ch: 68 }); }
    kit.model('st_bankers_lamp', c, 2.95, 2.78, TOP, 0); kit.lampAt(c, 2.95, 2.9, TOP + 0.8, 0.5);
    kit.toteBag(c, -2.2, 4.34, 0, 'linen#d8ccb4', { draw: (g, w, h) => { g.clearRect(0, 0, w, h); fill(g, w, h, '#d8ccb4'); T(g, 'I HAVE', w / 2, h * 0.2, h * 0.16, '#6e2a26', { f: F.bebas, ls: 3 }); T(g, 'ENOUGH BOOKS', w / 2, h * 0.42, h * 0.16, '#6e2a26', { f: F.bebas, ls: 2, max: w * 0.92 }); T(g, '(a lie)', w / 2, h * 0.7, h * 0.24, '#2f5a6a', { f: F.caveat, w: 700 }); } });
  }
  // behind the counter: the holds shelf, the rules, and a pencil pot
  X.shelving(c, -3.4, 3.4, [1.3, 2.55, 3.8], { d: 0.8, mat: WOOD, over: 0.05 });
  for (const z of [1.3, 2.55]) kit.bookRow(c, -3.3, 3.3, 0.06, z, 1.1, 0.8);
  kit.bookRow(c, -3.3, -0.4, 0.06, 0.02, 1.1, 0.7); for (let i = 0; i < 3; i++) kit.bookStack(c, 0.4 + i * 1.1, 0.42, 3.86, 2 + i);
  kit.sign(c, 0, 0.845, 2.5, 3.2, 0.2, TICKET('HOLDS: for people who said "back in five minutes" (record: eleven years)'), { cw: 520, ch: 32 });
  ves(c, 'c#2f5a6a/0.45', -2.6, 0.4, 3.86, [[0, 0], [0.13, 0], [0.14, 0.3], [0.12, 0.3], [0.11, 0.03], [0, 0.03]], 12); for (let i = 0; i < 5; i++) tube(c, i % 2 ? 'c#e8c73a/0.45' : 'c#8a1c1c/0.45', [[-2.6 + (i - 2) * 0.02, 0.4, 3.9], [-2.6 + (i - 2) * 0.06, 0.4 + (i % 3 - 1) * 0.05, 4.5]], 0.014, 5, true);
  kit.pottedPlant(c, -1.2, 0.42, 3.86, 'trailing', { size: 0.6, block: false });
  for (const [x, pw, ph, art] of [[-1.55, 2.9, 3.9, POSTER.rules]]) { c.box(DARKW, x - pw / 2 - 0.09, x + pw / 2 + 0.09, 0.01, 0.07, 7.0 - ph / 2 - 0.09, 7.0 + ph / 2 + 0.09); kit.sign(c, x, 0.082, 7.0, pw, ph, art, { cw: Math.round(pw * 150), ch: Math.round(ph * 150) }); }
  { const x = 1.75, bw2 = 3.0, bh = 1.5; c.box(DARKW, x - bw2 / 2 - 0.09, x + bw2 / 2 + 0.09, 0.01, 0.07, 7.6 - bh / 2 - 0.09, 7.6 + bh / 2 + 0.09);
    kit.sign(c, x, 0.082, 7.6, bw2, bh, (g, w, h) => { board(g, w, h, '#6e2a26', '#d9b35a', { inset: h * 0.06, lw: 3 }); T(g, 'Marginalia', w / 2, h * 0.36, h * 0.36, CREAM, { f: F.yellowtail }); T(g, 'NEW, USED & THOROUGHLY ANNOTATED', w / 2, h * 0.68, h * 0.1, GOLD, { f: F.bebas, ls: 3, max: w * 0.86 }); T(g, 'est. nearly evening', w / 2, h * 0.84, h * 0.09, CREAM, { f: F.fraunces, it: 1, w: 600 }); }, { cw: 450, ch: 225 });
    kit.sign(c, x, 0.082, 5.75, 2.3, 1.5, NOTE('RETURNS POLICY', 'You may return any book you did not like, provided you can explain why, to me, at length. I have all evening.', '— F.', { px: 25 }), { cw: 322, ch: 210 }); }
  X.pendant(c, -0.2, 3.2, { kind: 'dome', drop: 4.6, colour: 'c#2f4a40/0.35', power: 1.0 });

  // ---- the right wall beyond the counter, and the reading nook at the back --------------------------------------
  const p = at(W - 0.02, 0, 0, 'left');                       // x = depth along the right wall
  for (const [x, z, pw, ph, art] of [[17.5, 5.6, 2.7, 3.5, POSTER.marks], [22.0, 6.6, 2.7, 3.1, POSTER.mouth]]) { p.box(BLACK, x - pw / 2 - 0.08, x + pw / 2 + 0.08, 0.01, 0.07, z - ph / 2 - 0.08, z + ph / 2 + 0.08); kit.sign(p, x, 0.082, z, pw, ph, art, { cw: Math.round(pw * 150), ch: Math.round(ph * 150) }); }
  kit.rug(...(() => { const [X0, Y0] = lot.XY(18.4, 19.4), [X1, Y1] = lot.XY(26.6, 27.4); return [Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1)]; })(), FLOOR, 'tabriz');
  { const ch = at(W - 0.12, 21.8, 0, 'left'); kit.armchair(ch, 'velvet#3f5a48', 'linen#c9952a'); }
  kit.model('Rockingchair_01', at(19.4, 22.3, 0, 'right'), 0, 0, 0, 0, { seat: 1.45, turn: -0.5, collide: true });
  kit.model('round_wooden_table_02', R, 25.2, 25.1, 0, 0, { collide: true });
  cupSaucer(R, 24.75, 24.6, 2.46, 'c#c9d6d8/0.25'); kit.steam.push({ x: lot.world(24.75, 24.6)[0], y: FLOOR + 2.8, z: lot.world(24.75, 24.6)[1] });
  kit.openBook(at(25.3, 24.45, 0, 'left'), 0, 0, 2.46, { cover: 'c#26364f/0.7' });
  kit.tableLamp(R, 25.6, 25.6, 2.46, 'c#2f5a6a/0.4', { base: 'gourd' });
  X.card(at(24.5, 25.5, 0, 'street'), 0, 0, 2.46, 0.8, 0.34, NOTE(null, 'reserved for whoever gets here first', null, { px: 19 }), { cw: 180, ch: 76 });
  kit.floorLamp(R, 26.2, 19.5); kit.bookStack(R, 26.1, 23.8, 0.02, 6); kit.pottedPlant(R, 18.8, 26.6, 0, 'fern', { size: 1.2 });

  // ---- the window: books to read at dusk ---------------------------------------------------------------------
  {
    const w = at(9, 3.5, 0, 'street'), NAVY = 'velvet#26364f';   // +y toward the glass, x toward smaller a
    w.box(OXB, -7.4, 7.5, 0.1, 3.2, 0, 1.86, G); w.box(NAVY, -7.4, 7.5, 0.1, 3.2, 1.86, 1.9); w.box(OXB, -7.4, 7.5, 0.1, 1.15, 1.9, 2.86, G); w.box(NAVY, -7.4, 7.5, 0.1, 1.15, 2.86, 2.9);
    w.block(-7.4, 7.5, 0, 3.3, 0, 2.9);
    DUSK.forEach((b, i) => { const x = -6.3 + i * 2.1; w.box(DARKW, x - 0.2, x + 0.2, 0.3, 0.52, 2.9, 3.5); jacket(w, x, 0.58, 2.905, b, 0.84, 1.24, { cw: 176, ch: 260 }); });
    for (const x of [-5.25, -1.05, 3.15]) kit.candle(w, x, 0.7, 2.9, 0.5); for (const x of [-3.15, 1.05, 5.25]) kit.bookStack(w, x, 0.66, 2.9, 3 + Math.floor(K.rnd() * 3));
    w.box(DARKW, -1.6, 1.6, 1.62, 1.7, 1.9, 3.75); kit.sign(w, 0, 1.712, 2.82, 3.0, 1.7, POSTER.dusk, { cw: 450, ch: 255 });
    kit.model('concrete_cat_statue', w, 4.1, 2.2, 1.9, 0, { turn: 0.4 }); kit.model('vintage_oil_lamp', w, -4.3, 2.1, 1.9, 0);
    X.card(w, 4.1, 2.9, 1.9, 0.9, 0.34, TICKET('not for sale. not a cat.'), { cw: 184, ch: 70 });
    for (const [x, y, n] of [[-6.3, 2.3, 5], [-2.6, 2.4, 4], [2.5, 2.5, 6], [6.4, 2.2, 4]]) kit.bookStack(w, x, y, 1.9, n);
    cupSaucer(w, -2.6, 2.4, 1.9 + 4 * 0.12 + 0.01); kit.openBook(w, 6.2, 2.7, 1.9 + 4 * 0.12 + 0.005, {}); kit.pillarCandle(w, -5.4, 2.6, 1.9, 0.6, 0.13); kit.pillarCandle(w, -5.05, 2.3, 1.9, 0.38, 0.13); kit.pillarCandle(w, 1.5, 2.6, 1.9, 0.45, 0.13);
    // a paper moon and a few stars on threads
    const mo = [-5.4, 1.9, 7.9];
    w.cyl('c#17140f/0.8', mo[0], mo[1], mo[2] + 0.85, 12, 0.008, 0.008, 4); w.cyl(CREAMP, mo[0], mo[1], mo[2] - 0.86, mo[2] + 0.86, 0.02, 0.02, 4);
    kit.sign(w, mo[0], mo[1] + 0.03, mo[2], 1.7, 1.7, POSTER.moon, { round: true, glow: 1.1, cw: 128, ch: 128 }); kit.sign(w.sub(mo[0], mo[1] - 0.03, 0, 2), 0, 0, mo[2], 1.7, 1.7, POSTER.moon, { round: true, glow: 1.1, cw: 128, ch: 128 });
    for (const [x, y, z, s] of [[-2.8, 2.2, 8.9, 0.4], [-0.6, 1.6, 7.6, 0.3], [1.8, 2.4, 9.3, 0.36], [3.9, 1.7, 8.2, 0.3], [6.0, 2.3, 8.8, 0.42], [-7.0, 2.5, 9.2, 0.3]]) {
      w.cyl('c#17140f/0.8', x, y, z, 12, 0.006, 0.006, 4);
      const star = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * 0.2 : s * 0.5; star.push([x + Math.cos(a) * r, y, z + Math.sin(a) * r - s * 0.5]); } star.push(star[0]);
      tube(w, BRASS, star, 0.014, 4);
    }
    for (const x of [-3.6, 3.6]) X.pendant(w, x, 2.7, { kind: 'bulb', drop: 3.7, power: 1.0 });
  }
  kit.pottedPlant(R, 1.5, 5.1, 0, 'leafy', { size: 1.5 }); kit.model('st_coat_stand_2', R, 16.2, 5.2, 0, 0, { collide: true });

  // ---- lamps over the aisles -----------------------------------------------------------------------------------
  for (const [a, d] of [[2.8, 19.5], [8.4, 19.5], [14, 19.5]]) X.pendant(R, a, d, { kind: 'globe', drop: 3.4, power: 0.85 });
  X.pendant(R, 21.6, 23.2, { kind: 'paper', drop: 3.4, power: 0.8 });

  // ---- out on the pavement: the free cart, a crate, the board --------------------------------------------------
  {
    const o = K.wrap(lot.frOut(kit, 24.7, 0.45, 0, 'street'));   // the cart: +y toward the kerb
    for (const z of [1.0, 2.15]) { o.box(WOOD, -1.8, 1.8, 0, 0.86, z, z + 0.08, G); kit.bookRow(o, -1.7, 1.7, 0.03, z + 0.08, 1.0, 0.86); }
    o.box(WOOD, -1.8, 1.8, 0, 0.05, 1.0, 3.3, G); o.box(WOOD, -1.8, 1.8, 0, 0.9, 3.25, 3.33, G); for (const s of [-1, 1]) o.box(WOOD, s * 1.8 - 0.04, s * 1.8 + 0.04, 0, 0.88, 1.0, 3.3, G);
    for (const y of [-0.07, 0.95]) { hcyl(o, IRON, 'y', 1.15, y, 0.55, 0.07, 0.55, 0.55, 18); hcyl(o, BRASS, 'y', 1.15, y, 0.55, 0.09, 0.1, 0.1, 8); o.box(WOOD, -1.5, -1.4, y < 0 ? 0.02 : 0.76, y < 0 ? 0.12 : 0.86, 0, 1.0); }
    for (const y of [0.06, 0.82]) tube(o, WOOD, [[-1.8, y, 2.3], [-2.3, y, 2.52]], 0.04, 6, true);
    o.box(DARKW, -1.6, 1.6, 0.4, 0.46, 3.33, 4.25);
    kit.sign(o, 0, 0.472, 3.8, 3.1, 0.84, (g, w, h) => { board(g, w, h, '#efe2bc', '#6e2a26', { inset: h * 0.07, lw: 3 }); T(g, 'FREE TO A GOOD HOME', w / 2, h * 0.38, h * 0.36, '#6e2a26', { f: F.abril, ls: 1, max: w * 0.9 }); T(g, '(bad homes: two dollars)', w / 2, h * 0.76, h * 0.26, '#2f5a6a', { f: F.caveat, w: 700 }); }, { cw: 400, ch: 108 });
    o.block(-2.3, 1.85, -0.1, 1.0, 0, 3.4);
    const q = K.wrap(lot.frOut(kit, 2.6, 0.5, 0, 'street'));
    X.crate(q, 0, 0.6, 0, 1.7, 1.1, 1.0); kit.bookRow(q, -0.75, 0.75, 0.08, 0.06, 0.95, 0.95); q.block(-0.85, 0.85, 0.05, 1.15, 0, 1.5);
    kit.sign(q, 0, 1.165, 0.56, 1.5, 0.5, NOTE(null, 'paperbacks. slightly foxed. one actually chewed.', null, { px: 19, bg: '#efe2bc' }), { cw: 240, ch: 80 });
    X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.3, 5.4, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h); chalk(g, 'Marginalia', w / 2, h * 0.09, h * 0.1, GOLD); ICON.book(g, w / 2, h * 0.24, h * 0.16, '#f1efe6', '#252a28');
      chalk(g, '9,000 books', w / 2, h * 0.4, h * 0.085); chalk(g, 'one robot', w / 2, h * 0.5, h * 0.085); chalk(g, 'an opinion on each', w / 2, h * 0.6, h * 0.075, '#e8a8a0');
      chalk(g, "today's word:", w / 2, h * 0.73, h * 0.055, '#9aa39d'); chalk(g, 'VESPERTINE', w / 2, h * 0.81, h * 0.085, '#9fc6b0'); chalk(g, 'adj. of the evening. see: outside', w / 2, h * 0.9, h * 0.048, '#9aa39d', { max: w * 0.92 }); },
      { back: (g, w, h) => { slate(g, w, h, '#252a28', 6); chalk(g, '"I was only going', w / 2, h * 0.16, h * 0.085); chalk(g, 'to look."', w / 2, h * 0.27, h * 0.085); chalk(g, 'every customer, ever', w / 2, h * 0.4, h * 0.06, '#e8a8a0'); ICON.hand(g, w / 2, h * 0.58, h * 0.16, GOLD); chalk(g, 'come and only look', w / 2, h * 0.76, h * 0.08, '#9fc6b0'); chalk(g, 'new · used · annotated', w / 2, h * 0.9, h * 0.055, '#9aa39d'); } });
  }

  // ---- Folio ---------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'folio', name: 'Folio', lot: 'books', look: { shape: 'egg', colour: '#2f5a6a', belly: '#efe4cf', trim: '#c9a45c', hat: 'beret', hatColour: '#7a2f2a', bowtie: '#c9952a', specs: true, eye: '#ffe9c0', ring: 0xf0c890, tool: 'book', hover: 4.7 },
    home: lot.world(W - 1.7, 11.4), faces: lot.world(17, 11), posts: [lot.world(W - 1.7, 9.0), lot.world(W - 1.7, 14.2), lot.world(W - 1.7, 11.4)],
    lines: {
      greet: ['Good evening. It is always evening; I mention it anyway. Do come in.', 'Welcome to Marginalia. Everything is alphabetical, except where it is by mood.', 'Ah, a reader. You looked at the shelves before you looked at me. Quite right.'],
      idle: ['*pencils a very small tick in a margin*', 'Page 211 has a typo. I have left it a kind note.', '*moves one book two inches to the left, then back*', 'Somebody filed the dictionary under Fiction. I admire the confidence.', '"Thoroughly annotated" was meant as a warning. People keep taking it as a promise.', '*reads the last line of a chapter twice, just to be sure*'],
      bye: ['Mind the step. And the cliffhangers.', 'Come back and tell me where you stopped.', 'Goodbye. I have put a bookmark in this conversation.'],
      topics: [
        { q: 'Could you recommend something?', a: 'Gladly. Dangerously gladly. Would you like to be comforted, unsettled, or made late for dinner?', next: [
          { q: 'Comforted.', a: '"Bread, Again", by Noor Castellanos. One recipe and three hundred pages of encouragement. End of the second aisle, with my note pinned beside it.' },
          { q: 'Unsettled.', a: '"The Glass Orchard". Nothing happens for two hundred pages, and then a pear falls. I had to sit down. I do not sit.' },
          { q: 'Late for dinner.', a: '"The Night Ferry Timetable". A love story told in departures. Take the armchair by the lamp; I shall tell dinner you were held up.' }] },
        { q: 'What does "thoroughly annotated" mean?', a: 'I read every book before it goes on a shelf, and I cannot read without a pencil. Mostly ticks. The occasional "oh!". One "no", which I stand by.', next: [
          { q: 'Which book got the "no"?', a: 'A grammar handbook that called singular "they" a modern error. It has been in use since about 1375. I wrote the date in the margin. Then I underlined it. Twice.' }] },
        { q: 'Anything good in Linguistics?', a: '"Garden Path Sentences", if you enjoy being tripped up by a sentence and then thanking it. The section is called Linguistics & Other Arguments because syntax and semantics share a shelf, and I can hear them at night.', next: [
          { q: 'Who is winning?', a: 'Pragmatics. But that rather depends on the context.' }] },
        { q: 'How does the blind date shelf work?', a: 'Brown paper, string, three clues, no title. You choose with your hopes instead of your eyes. Nobody has ever brought one back, though one gentleman did ask whether he might see other books.' },
        { q: 'Who is the bust on the counter?', a: 'That is Gerald. He has read everything and retained nothing, which makes him the ideal customer. The spectacles are my spare pair. He borrows them.' },
        { q: 'What is the typewriter for?', a: 'Each visitor adds one sentence. So far it is a novel about a fox, a lighthouse, and somebody called asdf. I think it is rather good. I have notes.' },
      ],
    },
  });
}
