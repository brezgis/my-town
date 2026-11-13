// Wick & Sundry  (south side, 27 ft wide by 26.7 deep): candles · soap · small comforts
// Lit by lamps, not by the ceiling: like the inside of a nice drawer. In the middle, under three
// low paper lanterns, the testing table: twelve jar candles to light, each with its card. On the
// left wall the apothecary: a 28-drawer chest, amber and blue bottles, dried bunches on a rail, and
// further back the scent bar. On the right wall boxed candles, then soap on a marble slab with a
// basin to try it in. Across the back the counter and wrapping station, where Ember floats.
// Lightable candles: 12 jars + 3 tapers on the table, 6 pillars in the windows, 2 tapers + 1 jar on
// the counter, 1 taper + 1 pillar on the chest, 1 jar on the scent bar, 1 pillar by the basin = 28.
import { tools, fixtures, snapMat } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, grain, disc, rect, rrect, line, para, ICON } from '../draw.js';

const WALNUT = 'fir#8a6548', DRAWER = 'fir#a37b58', NAVYP = 'painted_wood#3a4868', CREAMP = 'painted_wood#e6dcc6';
const INK = '#26314a', CREAM = '#ece2c8', RUST = '#b8452e', PAPER = '#efe6cf';
const AMBER = 'c#8a5a2a/0.15', BLUE = 'c#2a63b8/0.15', CORK = 'c#b08a5a/0.8', ENAMEL = 'c#f4f1ea/0.2', TWINE = 'c#c9b48a/0.8';

// ---- things drawn ------------------------------------------------------------------------------------------
const TAG = (txt, c = PAPER, ink = INK) => (g, w, h) => { paper(g, w, h, c); T(g, txt, w / 2, h / 2, h * 0.42, ink, { f: F.caveat, w: 600, max: w * 0.92 }); };
const TAG2 = (a, b, c = PAPER) => (g, w, h) => { paper(g, w, h, c); T(g, a, w / 2, h * 0.32, h * 0.34, INK, { f: F.caveat, w: 600, max: w * 0.92 }); T(g, b, w / 2, h * 0.72, h * 0.28, RUST, { f: F.caveat, w: 600, max: w * 0.92 }); };
const JARLABEL = name => (g, w, h) => { paper(g, w, h, PAPER); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6); T(g, 'W & S', w / 2, h * 0.24, h * 0.2, RUST, { f: F.bebas, ls: 2 }); T(g, name, w / 2, h * 0.62, h * 0.27, INK, { f: F.fraunces, it: 1, w: 600, max: w * 0.86 }); };
const SCENT = (no, name, notes) => (g, w, h) => {
  paper(g, w, h, PAPER, no + 2); rect(g, 0, 0, w, h * 0.06, INK); rect(g, 0, h * 0.94, w, h * 0.06, INK);
  T(g, `No. ${no}`, w * 0.05, h * 0.17, h * 0.1, RUST, { f: F.bebas, ls: 2, a: 'left' }); T(g, 'light me', w * 0.95, h * 0.17, h * 0.11, RUST, { f: F.caveat, w: 600, a: 'right' });
  T(g, name, w / 2, h * 0.36, h * 0.17, INK, { f: F.fraunces, w: 600, max: w * 0.92 });
  para(g, notes, w / 2, h * 0.5, h * 0.115, '#4a3a2a', w * 0.9, { f: F.caveat, w: 600, a: 'center', lh: 1.08 });
};
const BOX = (name, c, ink = CREAM) => (g, w, h) => { fill(g, w, h, c); grain(g, w, h, 0.05); g.strokeStyle = ink; g.lineWidth = 2; g.strokeRect(5, 5, w - 10, h - 10); ICON.candle(g, w / 2, h * 0.3, h * 0.34, ink); T(g, name, w / 2, h * 0.62, h * 0.115, ink, { f: F.fraunces, it: 1, w: 600, max: w * 0.84 }); T(g, 'WICK & SUNDRY', w / 2, h * 0.84, h * 0.07, ink, { f: F.bebas, ls: 1, max: w * 0.84 }); };
const DRAWERLABEL = txt => (g, w, h) => { paper(g, w, h, '#e9dfc4', txt.length); g.strokeStyle = '#6a4a2a'; g.lineWidth = 2; g.strokeRect(2, 2, w - 4, h - 4); T(g, txt, w / 2, h * 0.54, h * 0.5, '#2a1c13', { f: F.elite, max: w * 0.9 }); };
const BOTTLELABEL = txt => (g, w, h) => { paper(g, w, h, PAPER, txt.length + 1); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6); const ls = txt.split('\n'); ls.forEach((s, i) => T(g, s, w / 2, h * (0.5 + (i - (ls.length - 1) / 2) * 0.3), h * 0.27, INK, { f: F.caveat, w: 600, max: w * 0.86 })); };
const MATCH = (name, icon, c, ink = CREAM) => (g, w, h) => { fill(g, w, h, c); grain(g, w, h, 0.07); g.strokeStyle = ink; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, h - 10); disc(g, w / 2, h * 0.42, h * 0.27, ink); ICON[icon](g, w / 2, h * 0.42, h * 0.4, c); T(g, name, w / 2, h * 0.14, h * 0.13, ink, { f: F.bebas, ls: 2, max: w * 0.84 }); T(g, 'SAFETY MATCHES · 40 · STRIKE KINDLY', w / 2, h * 0.86, h * 0.075, ink, { f: F.bebas, ls: 1, max: w * 0.86 }); };
const SOAPBAND = (name, ink = INK) => (g, w, h) => { paper(g, w, h, PAPER, name.length); rect(g, 0, 0, w, 4, ink); rect(g, 0, h - 4, w, 4, ink); const ls = name.split('\n'); ls.forEach((s, i) => T(g, s, w / 2, h * (0.5 + (i - (ls.length - 1) / 2) * 0.26), h * 0.22, ink, { f: F.fraunces, it: 1, w: 600, max: w * 0.9 })); };
const INCENSE = (name, c) => (g, w, h) => { fill(g, w, h, c); grain(g, w, h, 0.06); rrect(g, w * 0.12, h * 0.1, w * 0.76, h * 0.8, 4, null, CREAM, 2); T(g, name, w / 2, h / 2, w * 0.3, CREAM, { f: F.bebas, ls: 2, rot: -Math.PI / 2 }); };
const POSTER = {
  burn(g, w, h) {
    paper(g, w, h, '#e9dfc6', 12); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(12, 12, w - 24, h - 24);
    T(g, 'HOW TO BURN A CANDLE', w / 2, h * 0.12, h * 0.1, INK, { f: F.bebas, ls: 4, max: w * 0.88 }); T(g, '(properly)', w / 2, h * 0.215, h * 0.07, RUST, { f: F.caveat, w: 600 });
    const rows = [['1', 'The first burn: let the wax melt right to the edge. It remembers.'], ['2', 'Trim the wick. Short as a week-old haircut.'], ['3', 'Never leave it alone. It gets ideas.'], ['4', 'Blow gently and make a small wish. They are cheap.']];
    rows.forEach(([n, s], i) => { const y = h * (0.3 + i * 0.165); disc(g, w * 0.09, y + h * 0.045, h * 0.045, INK); T(g, n, w * 0.09, y + h * 0.048, h * 0.06, CREAM, { f: F.fraunces, w: 600 }); para(g, s, w * 0.16, y, h * 0.058, '#2a1c13', w * 0.78, { f: F.fraunces, it: 1, lh: 1.15 }); });
    ICON.candle(g, w * 0.9, h * 0.13, h * 0.16, INK, RUST);
  },
  scentbar(g, w, h) {
    slate(g, w, h, '#232a3c', 6); chalk(g, 'the scent bar', w / 2, h * 0.16, h * 0.19, '#f1efe6'); line(g, [[w * 0.26, h * 0.29], [w * 0.74, h * 0.29]], '#e9c46a', 3);
    ['1. dab the paper strip.  2. wave it about like a tiny flag.', '3. sniff.  4. sniff the coffee beans (on loan from Juniper).', '5. repeat until you smell like a committee.'].forEach((s, i) => chalk(g, s, w / 2, h * (0.44 + i * 0.15), h * 0.085, i === 2 ? '#e8a8a0' : '#efe9da', { max: w * 0.92 }));
    chalk(g, 'no. 9 is discontinued. we do not discuss no. 9.', w / 2, h * 0.9, h * 0.07, '#9aa39d', { max: w * 0.9 });
  },
  soap(g, w, h) { paper(g, w, h, '#e9dfc6', 5); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(9, 9, w - 18, h - 18); T(g, 'S O A P', w / 2, h * 0.25, h * 0.24, INK, { f: F.limelight }); T(g, 'it is just soap.', w / 2, h * 0.55, h * 0.13, '#2a1c13', { f: F.fraunces, it: 1, w: 600 }); T(g, '(it is not just soap.)', w / 2, h * 0.78, h * 0.14, RUST, { f: F.caveat, w: 600 }); },
  shop(g, w, h) { fill(g, w, h, INK); grain(g, w, h, 0.05); g.strokeStyle = '#d9c9a0'; g.lineWidth = 3; g.strokeRect(8, 8, w - 16, h - 16); T(g, 'Wick & Sundry', w / 2, h * 0.4, h * 0.44, CREAM, { f: F.fraunces, w: 600, shadow: '#0e1320' }); T(g, 'CHANDLERS TO NOBODY IN PARTICULAR  ·  EST. NEARLY EVENING', w / 2, h * 0.8, h * 0.13, '#d9c9a0', { f: F.bebas, ls: 3, max: w * 0.9 }); },
  wrap(g, w, h) { fill(g, w, h, INK); grain(g, w, h, 0.05); g.strokeStyle = '#d9c9a0'; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12); T(g, 'WE WRAP EVERYTHING', w / 2, h * 0.36, h * 0.3, CREAM, { f: F.bebas, ls: 5, max: w * 0.9 }); T(g, 'even if it is for you. especially if it is for you.', w / 2, h * 0.72, h * 0.2, '#e9c46a', { f: F.caveat, w: 600, max: w * 0.9 }); },
};

const SCENTS = [
  ['Library Fire', 'old paper, a cedar shelf, one careless pipe. no books were harmed.', 'c#d9cdb2/0.6'],
  ['Rain on Hot Pavement', 'petrichor, warm tar, the dash to somebody’s doorway.', 'c#c9ccd0/0.6'],
  ['Someone Else’s Laundry', 'clean cotton, a stranger’s fabric softener, mild envy.', 'c#f4f1ea/0.6'],
  ['Tomato Leaf', 'green stems, greenhouse glass, dirt under exactly one fingernail.', 'c#9fb0a4/0.6'],
  ['The Good Blanket', 'wool, cocoa, a sofa with a dip in it. do not operate machinery.', 'c#c9a77a/0.6'],
  ['Overdue Books', 'vanilla, dust, eleven years of guilt. the fine is forgiven.', 'c#efe2bc/0.6'],
  ['Vesper Street, 6 p.m.', 'coffee from over the road, warm brick, the lamps coming on.', 'c#d9b35a/0.6'],
  ['Grandmother’s Handbag', 'violet pastilles, good leather, one loose mint of unknown age.', 'c#e8907a/0.6'],
  ['Sunday, About Four', 'toast, a radio in another room, absolutely nothing due.', 'c#e8e2d4/0.6'],
  ['Pencil Case', 'cedar shavings, graphite, a pink eraser you were told not to chew.', 'c#e88aa8/0.6'],
  ['Campfire, Far Shore', 'woodsmoke from across the lake, and somebody else’s guitar.', 'c#9a9590/0.6'],
  ['Bread Tomorrow', 'yeast, a warm crust, patience. for the bakery that is never open.', 'c#c9b48a/0.6'],
];
const DRAWERS = ['lavender', 'chamomile', 'rosehip', 'bay', 'cloves', 'orris root', 'beeswax',
  'wicks, long', 'wicks, short', 'wicks, odd', 'matches', 'string', 'string, too short', 'buttons',
  'sealing wax', 'calendula', 'thyme', 'more thyme', 'no thyme', 'corks', 'pins',
  'juniper (not her)', 'spare moons', 'sighs', 'yesterday', 'receipts', 'do not open', 'open me'];

export default function apothecary(kit, lot) {
  const K = tools(kit, 47), X = fixtures(kit, K), { ves, hcyl, ball, tube, jar, bottle, bowl, tin, glass, leaves } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                         // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D;
  const pack = (f, x, y, z, w, d, tall, col, draw, o) => kit.pack(f, x, y, z, w, d, tall, snapMat(col), draw, o);
  const boxed = (f, x, z, i, y = 0.5) => { const s = SCENTS[i % SCENTS.length], c = ['#26314a', '#8a1c1c', '#2f4a2a', '#c9952a', '#4a2240', '#2f5a6a'][i % 6]; pack(f, x, y, z, 0.5, 0.5, 0.62, `c${c}/0.8`, BOX(s[0], c), { cw: 104, ch: 128 }); };
  // a glass bottle with a hand-lettered label on its front
  const flask = (f, x, y, z, col, name, o = {}) => { const r = o.r ?? 0.15, h = o.h ?? 0.95; bottle(f, x, y, z, { r, h, col, neck: 0.05, cap: o.cap ?? CORK }); if (name) kit.sign(f, x, y + r + 0.006, z + h * 0.33, r * 1.5, h * 0.34, BOTTLELABEL(name), { cw: 96, ch: Math.round(96 * h * 0.34 / (r * 1.5)) }); };
  // a turned wooden stand
  const stand = (f, x, y, z, h, r = 0.28) => ves(f, WALNUT, x, y, z, [[0, 0], [r, 0], [r, 0.05], [r * 0.4, 0.12], [r * 0.3, h - 0.16], [r * 0.9, h - 0.06], [r, h - 0.04], [r, h], [0, h]], 16);
  // a dried bunch hanging head-down from z
  function bunch(f, x, y, z, kind) {
    const lav = kind === 'lav', n = lav ? 12 : 7, len = lav ? 1.25 : 1.5, stem = lav ? 'c#7fa04a/0.8' : 'c#6a4a2a/0.8';
    for (let i = 0; i < n; i++) {
      const a = i * 2.4, rr = 0.05 + 0.2 * K.rnd(), L = len * (0.8 + 0.25 * K.rnd()), ex = x + Math.cos(a) * rr, ey = y + Math.sin(a) * rr * 0.7;
      tube(f, stem, [[x + Math.cos(a) * 0.02, y + Math.sin(a) * 0.02, z], [x + Math.cos(a) * rr * 0.35, y + Math.sin(a) * rr * 0.25, z - L * 0.5], [ex, ey, z - L]], 0.008, 4);
      if (lav) ball(f, 'c#8a5ab0/0.8', ex, ey, z - L - 0.2, 0.035, 6, 3.2);
      else for (let k = 0; k < 5; k++) ball(f, 'c#9fb0a4/0.8', ex + (k % 2 ? 0.07 : -0.07), ey, z - L * (0.4 + 0.14 * k), 0.075, 6, 0.3);
    }
    f.cyl(TWINE, x, y, z - 0.14, z - 0.05, 0.05, 0.05, 6); f.cyl(TWINE, x, y, z - 0.05, z + 0.13, 0.008, 0.008, 4);
  }

  // ---- the window displays: pillar candles on stands, bottles, a card, a lamp --------------------------------
  function windowDisplay(ac, s, cardFront, cardBack) {            // s = +1: the outer end is toward smaller a
    const w = at(ac, 1.4, 0, 'street');                             // +y toward the street, +x toward smaller a
    w.box(NAVYP, -4.5, 4.5, -1.2, 1.2, 0, 2.0); w.block(-4.5, 4.5, -1.2, 1.2, 0, 3);
    w.box(WALNUT, -4.5, 4.5, -1.2, -0.35, 2.0, 2.5, G);              // a step along the back
    for (const [x, y, h, tall, wax] of [[-0.95, 0.3, 0.7, 0.8, 'c#efe6d2/0.6'], [0, 0.05, 1.35, 1.0, 'c#d9b35a/0.6'], [0.95, 0.4, 0.4, 0.6, 'c#efe6d2/0.6']]) { stand(w, x, y, 2.0, h); kit.pillarCandle(w, x, y, 2.0 + h, tall, 0.17, wax); }
    // bottles catching the light, on the step at the outer end
    const names = s > 0 ? ['rose\nwater', 'witch\nhazel', 'bay rum', 'oil of\ncedar', 'smoke'] : ['orange\nblossom', 'vetiver', 'sea,\nbottled', 'second\nwind', 'nap\n(conc.)'];
    names.forEach((n, i) => flask(w, s * (1.75 + i * 0.42), -0.75, 2.5, i % 2 ? BLUE : AMBER, n, { h: 0.8 + (i % 3) * 0.14 }));
    kit.tableLamp(w, s * 3.95, -0.75, 2.5, s > 0 ? 'c#26364f/0.4' : 'c#8a5a2a/0.4', { shade: 'pleat' });
    // boxed stock stacked in front of them
    for (let i = 0; i < 3; i++) boxed(w, s * (2.3 + i * 0.62), 2.0, i + (s > 0 ? 0 : 3), 0.35); boxed(w, s * 2.62, 2.62, s > 0 ? 6 : 8, 0.35);
    // dried things in jars on the step toward the door, and the hand-lettered card in front of them
    for (let i = 0; i < 3; i++) { const x = -s * (1.9 + i * 0.75); jar(w, x, -0.78, 2.5, 0.2, 0.55, null, 0, null); leaves(w, x, -0.78, 2.55, { n: 14, len: 1.3, w: 0.016, up: 1, out: 0.22, droop: 0.1, spread: 0.08, col: i === 1 ? ['c#8a5ab0/0.8', 'c#7fa04a/0.8'] : ['c#c9b48a/0.8', 'c#b08a5a/0.8', 'c#d9cdb2/0.8'] }); }
    const cx = -s * 2.85;
    w.box(WALNUT, cx - 0.9, cx + 0.9, 0.38, 0.62, 2.0, 2.07, G);
    kit.sign(w, cx, 0.5, 2.68, 1.7, 1.2, cardFront, { cw: 340, ch: 240, tilt: 0.12, rough: 0.9 });
    kit.sign(w, cx, 0.49, 2.68, 1.7, 1.2, cardBack, { cw: 340, ch: 240, tilt: -0.12, turn: Math.PI, rough: 0.9 });
    for (const [x, y] of [[-s * 4.1, 0.55], [-s * 1.45, 0.75]]) { K.plate(w, x, y, 2.0, 0.3, 'c#b08d4a/0.35/1'); for (let k = 0; k < 3; k++) ball(w, ['c#efe6d2/0.6', 'c#e8907a/0.6', 'c#9fb0d8/0.6'][k], x + Math.cos(k * 2.1) * 0.12, y + Math.sin(k * 2.1) * 0.12, 2.04, 0.1, 10); }   // bath bombs on a brass dish
  }
  const CARD = (a, b, c, small) => (g, w, h) => { paper(g, w, h, PAPER, 8); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(8, 8, w - 16, h - 16); T(g, a, w / 2, h * 0.24, h * 0.2, INK, { f: F.fraunces, w: 600, max: w * 0.88 }); T(g, b, w / 2, h * 0.5, h * 0.2, INK, { f: F.fraunces, w: 600, max: w * 0.88 }); T(g, c, w / 2, h * 0.74, h * 0.13, RUST, { f: F.caveat, w: 600, max: w * 0.88 }); if (small) T(g, small, w / 2, h * 0.89, h * 0.075, '#4a3a2a', { f: F.bebas, ls: 2, max: w * 0.86 }); };
  windowDisplay(5.05, 1, CARD('candles that smell', 'like somewhere.', 'come in & light one. go on.', 'YES, REALLY. PRESS E.'), CARD('you are behind', 'the window now.', 'wave at the street.'));
  windowDisplay(W - 5.05, -1, CARD('soap that smells', 'like something.', 'basin inside. hands welcome.', 'SMALL COMFORTS, REASONABLY PRICED'), CARD('this is the back', 'of the card.', 'the front is better.'));

  // ---- the testing table: twelve jars to light, under the paper lanterns -------------------------------------
  kit.rug(...(() => { const [X0, Y0] = lot.XY(8.2, 8.6), [X1, Y1] = lot.XY(18.8, 15.4); return [Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1)]; })(), lot.fr(kit, 0, 0).h, 'tabriz');
  const tF = at(13.5, 12, 0, 'street'), tB = at(13.5, 12, 0, 'back'), TT = 2.7;
  X.plinth(tF, 0, 0, 7.6, 3.7, TT, { mat: WALNUT, shelf: 0.95 });
  tF.box(WALNUT, -3.3, 3.3, -0.28, 0.28, TT, TT + 0.32, G);                                    // the spine down the middle
  [tF, tB].forEach((f, side) => {
    for (let i = 0; i < 6; i++) {
      const n = side * 6 + i, [name, notes, wax] = SCENTS[n], x = 3.0 - i * 1.22;
      kit.jarCandle(f, x, 1.3, TT, { r: 0.2, tall: 0.42, wax, label: 'c#efe2bc/0.8' });
      kit.sign(f, x, 1.3 + 0.207, TT + 0.42 * 0.42, 0.25, 0.16, JARLABEL(name), { cw: 128, ch: 82 });
      for (const dx of [-0.3, 0.3]) f.cyl(BRASS, x + 0.1 + dx, 0.6, TT, TT + 0.56, 0.012, 0.012, 5);          // the card stands behind its jar on two pins
      X.card(f, x + 0.1, 0.62, TT + 0.5, 1.04, 0.64, SCENT(n + 1, name, notes), { cw: 312, ch: 192, tilt: 0.14 });
    }
    // the sign on the spine, same both sides
    kit.sign(f, 0, 0.285, TT + 0.16, 3.6, 0.26, (g, w, h) => { fill(g, w, h, INK); T(g, 'THE TESTING TABLE  ·  LIGHT ANYTHING  ·  BLOW IT OUT IF YOU MUST', w / 2, h * 0.54, h * 0.5, CREAM, { f: F.bebas, ls: 3, max: w * 0.95 }); }, { cw: 540, ch: 40 });
  });
  for (const x of [-2.5, 0, 2.5]) kit.candle(tF, x, 0, TT + 0.32, x ? 0.6 : 0.85);
  // along the spine: matchboxes, a snuffer, wick trimmings in a dish
  for (const [x, i] of [[-1.3, 0], [1.2, 3]]) for (let k = 0; k < 3; k++) tF.box(['c#8a1c1c/0.8', 'c#26364f/0.8', 'c#c9952a/0.8'][(k + i) % 3], x - 0.17 + k * 0.02, x + 0.17 + k * 0.02, -0.11, 0.11, TT + 0.32 + k * 0.062, TT + 0.38 + k * 0.062);
  K.plate(tF, -0.7, 0, TT + 0.32, 0.17, 'c#b08d4a/0.35/1'); tube(tF, BRASS, [[0.5, -0.05, TT + 0.34], [0.95, 0.05, TT + 0.34]], 0.012, 5); ves(tF, BRASS, 0.5, -0.05, TT + 0.32, [[0.07, 0], [0.05, 0.1], [0, 0.12]], 10);
  // under the table: crates of stock
  for (const x of [-2.2, 0, 2.2]) { X.crate(tF, x, 0, 0.95, 1.7, 2.4, 0.7, 'oak_light#b89466'); for (let i = 0; i < 3; i++) for (const y of [-0.6, 0.6]) tF.cyl(['c#efe6d2/0.6', 'c#d9b35a/0.6', 'c#26364f/0.6'][(i + (y > 0)) % 3], x - 0.5 + i * 0.5, y, 1.0, 1.72, 0.17, 0.17, 12); }
  X.pendant(R, 11.0, 12, { kind: 'paper', drop: 4.7, power: 0.8 }); X.pendant(R, 16.0, 12, { kind: 'paper', drop: 4.7, power: 0.8 }); X.pendant(R, 13.5, 12, { kind: 'bulb', drop: 5.4, power: 0.55 });

  // ---- the apothecary wall (left): the chest, bottles, the drying rail ----------------------------------------
  const L = at(0, 12.5, 0, 'right');                            // on the left wall: +x toward the street, +y into the room
  L.box('c#2b2724/0.8', -4.15, 4.15, 0.1, 1.6, 0, 0.3); L.box(WALNUT, -4.25, 4.25, 0.02, 1.7, 0.3, 3.5, G); L.box(WALNUT, -4.35, 4.35, 0.02, 1.82, 3.5, 3.6, G); L.block(-4.25, 4.25, 0, 1.7, 0, 3.6);
  { const cols = 7, rows = 4, dw = 8.4 / cols, dh = 3.1 / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x0 = -4.2 + c * dw + 0.04, x1 = x0 + dw - 0.08, xm = (x0 + x1) / 2, z0 = 0.36 + r * dh + 0.03, z1 = z0 + dh - 0.06;
      L.box(DRAWER, x0, x1, 1.7, 1.75, z0, z1, G); hcyl(L, BRASS, 'y', xm, 1.79, z0 + 0.19, 0.08, 0.045, 0.035, 8);
      L.box(BRASS, xm - 0.36, xm + 0.36, 1.75, 1.757, z1 - 0.37, z1 - 0.09);
      kit.sign(L, xm, 1.762, z1 - 0.23, 0.66, 0.22, DRAWERLABEL(DRAWERS[(rows - 1 - r) * cols + (cols - 1 - c)]), { cw: 156, ch: 52 });
    } }
  // on the chest: the lamp, scales, a mortar, jars of bath salts and petals, a taper, a pillar
  const CT = 3.6;
  kit.tableLamp(L, 3.5, 0.9, CT, 'c#8a5a2a/0.4', { base: 'gourd' });
  kit.model('st_brass_scales', L, 1.9, 0.8, CT, 0);
  bowl(L, 0.6, 1.1, CT, 0.3, 0.3, 'c#9a9590/0.8', 16); tube(L, 'c#9a9590/0.8', [[0.6, 1.1, CT + 0.1], [0.85, 1.0, CT + 0.55]], 0.045, 6, true);
  [['c#e88aa8/0.8', 'rose\nsalts'], ['c#9fb0d8/0.8', 'sea\nsalts'], ['c#8a5ab0/0.8', 'lavender\nbuds'], ['c#e8c73a/0.8', 'calendula'], ['c#f4f1ea/0.8', 'epsom,\nplain']].forEach(([c, n], i) => { const x = -0.5 - i * 0.62; jar(L, x, 0.6, CT, 0.22, 0.7, c, 0.5 + (i % 3) * 0.15, CORK); kit.sign(L, x, 0.826, CT + 0.3, 0.3, 0.26, BOTTLELABEL(n), { cw: 96, ch: 84 }); });
  kit.candle(L, -0.2, 1.35, CT, 0.7); kit.pillarCandle(L, -3.7, 0.9, CT, 0.6, 0.16, 'c#d9b35a/0.6');
  X.card(L, -2.0, 1.45, CT, 1.3, 0.36, TAG('bath salts by the scoop. the scoop is honest.'));
  // above it: a navy panel, two shelves of bottles
  L.box(NAVYP, -4.4, 4.4, 0.01, 0.05, 3.6, 10.5);
  for (const z of [5.4, 6.75]) { L.box(WALNUT, -4.3, 4.3, 0.05, 0.95, z - 0.08, z, G); for (const x of [-4, -1.35, 1.35, 4]) tube(L, BRASS, [[x, 0.07, z - 0.5], [x, 0.8, z - 0.08]], 0.02, 5); }
  ['tincture of\ntuesday', 'rose water', 'witch hazel', 'bay rum', 'patience\n3%', 'oil of\ncedar', 'smoke', 'orange\nblossom', 'arnica', 'vinegar of\nfour thieves', 'vetiver', 'second\nwind']
    .forEach((n, i) => flask(L, 3.9 - i * 0.7, 0.5, 5.4, AMBER, n, { h: 0.85 + (i % 3) * 0.1, r: 0.15 + (i % 2) * 0.02 }));
  ['sea,\nbottled', 'blue\n(just blue)', 'nap\n(conc.)', 'sleep', 'more\nsleep', 'eau de\nshelf', 'thunder', 'the\nother one', 'poison\n(no)', 'tonic'].forEach((n, i) => flask(L, 3.9 - i * 0.62, 0.5, 6.75, BLUE, n, { h: 0.8 + (i % 2) * 0.14, r: 0.14 }));
  for (let i = 0; i < 3; i++) jar(L, -2.7 - i * 0.6, 0.5, 6.75, 0.2, 0.6, ['c#c9b48a/0.8', 'c#8a5ab0/0.8', 'c#e8907a/0.8'][i], 0.7, CORK);
  // the drying rail
  tube(L, BRASS, [[-4.3, 1.25, 9.9], [4.3, 1.25, 9.9]], 0.03, 6, true); for (const x of [-4.1, 4.1]) tube(L, BRASS, [[x, 0.05, 10.15], [x, 1.25, 9.9]], 0.022, 5);
  for (let i = 0; i < 10; i++) bunch(L, -3.8 + i * 0.84, 1.25, 9.77, i % 3 === 1 ? 'euc' : 'lav');
  kit.sign(L, 0, 0.06, 8.05, 3.4, 0.42, (g, w, h) => { fill(g, w, h, '#2c3650'); T(g, 'for what ails you (mildly)', w / 2, h * 0.52, h * 0.7, '#e9c46a', { f: F.caveat, w: 600, max: w * 0.94 }); }, { cw: 420, ch: 52 });

  // left wall by the window: matches, incense, linen spray
  X.shelving(L, 5.1, 9.0, [1.2, 2.5, 3.8, 5.1, 6.4], { d: 1.0, mat: WALNUT, back: NAVYP, bay: 5 });
  [['NORTH STAR', 'star', '#26314a'], ['SUNRISE', 'sun', '#b8361f'], ['LAST CANDLE', 'candle', '#2f4a2a'], ['BAY LEAF', 'leaf', '#c9952a'], ['THE HERRING', 'fish', '#2f5a6a'], ['TEACUP', 'cup', '#4a2240']]
    .forEach(([n, ic, c], i) => { const x = 8.55 - i * 0.6; pack(L, x, 0.45, 3.8, 0.5, 0.14, 0.36, `c${c}/0.8`, MATCH(n, ic, c), { cw: 150, ch: 108 }); pack(L, x, 0.25, 3.8, 0.5, 0.14, 0.36, `c${c}/0.8`, MATCH(n, ic, c), { cw: 150, ch: 108 }); if (i % 2) pack(L, x - 0.03, 0.62, 3.8, 0.5, 0.14, 0.36, `c${c}/0.8`, MATCH(n, ic, c), { cw: 150, ch: 108 }); });
  X.card(L, 7.05, 0.95, 3.8, 1.7, 0.3, TAG('matches, for people who also own a lighter'));
  [['SANDALWOOD', '#8a1c1c'], ['CEDAR', '#2f4a2a'], ['RAIN', '#2f5a6a'], ['PALO SANTO-ISH', '#c9952a'], ['FIG', '#4a2240'], ['MOSS', '#4a6e38'], ['SMOKE', '#2b2724'], ['ATTIC', '#8a5a2a'], ['TEMPLE', '#b8361f']]
    .forEach(([n, c], i) => pack(L, 8.6 - i * 0.34, 0.5, 5.1, 0.24, 0.24, 0.95, `c${c}/0.8`, INCENSE(n, c), { cw: 48, ch: 190 }));
  { const x = 5.75; L.soft('c#2b2724/0.45', x - 0.4, x + 0.4, 0.4, 0.62, 5.1, 5.14, 0.02); tube(L, 'c#6a4a2a/0.8', [[x + 0.3, 0.51, 5.14], [x - 0.35, 0.51, 5.75]], 0.006, 4); const [sx, sz] = kit.world(L, x - 0.35, 0.51); kit.steam.push({ x: sx, y: L.h + 5.8, z: sz }); }   // one stick, burning
  ['linen spray:\nline-dried', 'linen spray:\nhotel', 'pillow mist', 'linen spray:\nsea air', 'room spray:\nnew book', 'ironing\nwater'].forEach((n, i) => flask(L, 8.5 - i * 0.62, 0.5, 6.4, i % 2 ? 'c#c9d6d8/0.15' : BLUE, n, { h: 0.9, r: 0.14, cap: 'c#2b2724/0.45' }));
  for (let i = 0; i < 6; i++) tin(L, 8.5 - i * 0.6, 0.5, 2.5, 0.22, 0.5, ['c#26364f/0.45', 'c#d9b35a/0.45', 'c#8a1c1c/0.45'][i % 3], 'c#efe2bc/0.8');
  X.card(L, 7.0, 0.95, 2.5, 1.5, 0.28, TAG('bath soak. you, but poached.'));
  X.crate(L, 6.1, 0.55, 1.2, 1.5, 0.8, 0.6); for (let i = 0; i < 5; i++) L.cyl(['c#efe6d2/0.6', 'c#d9b35a/0.6'][i % 2], 5.6 + i * 0.25, 0.55, 1.25, 2.1, 0.035, 0.03, 6);     // dinner candles, by the pair
  for (let i = 0; i < 3; i++) boxed(L, 7.5 + i * 0.56, 1.2, i + 4);
  for (let i = 0; i < 5; i++) boxed(L, 5.6 + i * 0.7, 0.02, i + 7);

  // ---- the scent bar (left wall, toward the back) -------------------------------------------------------------
  const SB = X.plinth(L, -9, 0.97, 7.6, 1.7, 3.2, { mat: WALNUT, top: 'marble', shelf: 1.2 });
  L.box(BRASS, -10.7, -7.3, 0.5, 1.2, SB, SB + 0.025);
  [['no. 1', 'fig, a wall', '#c9952a'], ['no. 2', 'smoke', '#5a5a56'], ['no. 3', 'rain', '#9fb0d8'], ['no. 4', 'bread', '#c9a77a'], ['no. 5', 'taken', '#e8c73a'], ['no. 6', 'moss', '#5d8a3a'], ['no. 7', 'a peach', '#e8907a'], ['no. 8', 'tuesday', '#8a5ab0']]
    .forEach(([n, s, c], i) => { const x = -7.55 - i * 0.42; kit.perfume(L, x, 0.85, SB + 0.025, { juice: snapMat(`c${c}/0.15`), turn: 0, h: 0.3 }); X.card(L, x, 1.42, SB, 0.38, 0.26, TAG2(n, s), { cw: 100, ch: 68 }); });
  glass(L, -6.7, 0.9, SB, 0.13, 0.4); for (let i = 0; i < 7; i++) tube(L, 'c#f4f1ea/0.8', [[-6.7, 0.9, SB + 0.05], [-6.7 + (i - 3) * 0.045, 0.9 + ((i * 7) % 5 - 2) * 0.03, SB + 0.85]], 0.014, 4, true);   // testing strips
  jar(L, -6.1, 0.75, SB, 0.2, 0.45, 'c#3a2214/0.8', 0.75, CORK); X.card(L, -6.25, 1.4, SB, 0.9, 0.3, TAG2('beans: reset your nose', 'do not eat the reset'), { cw: 220, ch: 74 });
  kit.tableLamp(L, -12.2, 0.85, SB, 'c#26364f/0.4', { base: 'column', shade: 'drum' });
  kit.jarCandle(L, -11.3, 0.8, SB, { r: 0.18, tall: 0.38, wax: 'c#d9b35a/0.6', label: 'c#efe2bc/0.8' }); kit.sign(L, -11.3, 0.987, SB + 0.16, 0.23, 0.15, JARLABEL('Scent Bar, Lit'), { cw: 128, ch: 82 });
  // hand cream in a little tray
  L.box(WALNUT, -5.95, -5.35, 0.45, 1.5, SB, SB + 0.05, G); for (let i = 0; i < 4; i++) kit.lotionTube(L, -5.85, 0.6 + i * 0.25, SB + 0.05, { turn: 0, len: 0.42, colour: snapMat(['c#e8e2d4/0.45', 'c#9fb0a4/0.45', 'c#e8907a/0.45', 'c#c9d6d8/0.45'][i]), cap: 'c#26364f/0.45' });
  L.box('c#17140f/0.45', -11.25, -6.75, 0.01, 0.07, 5.0, 7.7); kit.sign(L, -9, 0.08, 6.35, 4.3, 2.5, POSTER.scentbar, { cw: 600, ch: 350, rough: 0.95 });
  // under it: towels and gift boxes
  kit.foldedStack(L, -6.6, 0.95, 1.2, 4, ['c#e8e2d4/0.8', 'c#9fb0a4/0.8', 'c#26364f/0.8', 'c#e8e2d4/0.8']); kit.foldedStack(L, -8.0, 0.95, 1.2, 3, ['c#c9b48a/0.8', 'c#e8e2d4/0.8', 'c#e8907a/0.8']);
  for (let i = 0; i < 5; i++) boxed(L, -9.4 - i * 0.6, 1.2, i + 2, 0.95);

  // ---- right wall by the window: the boxed candles ------------------------------------------------------------
  const Rt = at(W, 12, 0, 'left');                               // on the right wall: +x toward the back, +y into the room
  X.shelving(Rt, -8.4, -1.0, [1.2, 2.6, 4.0, 5.9], { d: 1.0, mat: WALNUT, back: NAVYP, bay: 3.7 });
  for (const [x0, o] of [[-8.4, 0], [-4.7, 5]]) {
    for (let i = 0; i < 5; i++) boxed(Rt, x0 + 0.55 + i * 0.66, 2.6, i + o);
    for (let i = 0; i < 5; i++) if (!(x0 > -5 && i > 1 && i < 4)) boxed(Rt, x0 + 0.55 + i * 0.66, 4.0, i + o + 3);
    for (let i = 0; i < 5; i++) boxed(Rt, x0 + 0.55 + i * 0.66, 5.9, i + o + 7);
    for (let i = 0; i < 3; i++) { const c = ['#26314a', '#8a1c1c', '#2f4a2a'][(i + o) % 3]; pack(Rt, x0 + 0.85 + i * 1.05, 0.5, 1.2, 0.9, 0.7, 0.8, `c${c}/0.8`, (g, w, h) => { fill(g, w, h, c); grain(g, w, h, 0.05); rect(g, w * 0.44, 0, w * 0.12, h, '#d9c9a0'); rect(g, 0, h * 0.42, w, h * 0.12, '#d9c9a0'); rrect(g, w * 0.2, h * 0.3, w * 0.6, h * 0.36, 5, PAPER); T(g, 'three small', w / 2, h * 0.42, h * 0.11, INK, { f: F.fraunces, it: 1, w: 600 }); T(g, 'comforts', w / 2, h * 0.55, h * 0.11, INK, { f: F.fraunces, it: 1, w: 600 }); }, { cw: 140, ch: 124 }); }
    for (let i = 0; i < 3; i++) Rt.cyl(['c#efe6d2/0.6', 'c#d9b35a/0.6', 'c#8a1c1c/0.6'][i], x0 + 0.5 + i * 0.5, 0.5, 0.02, 0.75 + i * 0.12, 0.2, 0.2, 14);     // big plain pillars on the floor shelf
  }
  kit.tableLamp(Rt, -2.75, 0.55, 4.0, 'c#b08a5a/0.4', { base: 'jar' });
  X.card(Rt, -6.5, 0.98, 2.6, 1.7, 0.3, TAG('every candle on the table, boxed and behaving'));
  X.card(Rt, -6.5, 0.98, 4.0, 1.5, 0.3, TAG('burn time: about one good novel'));

  // ---- soap on the marble slab, the basin --------------------------------------------------------------------
  const ST = X.plinth(Rt, 4.2, 1.12, 6.6, 2.1, 2.8, { mat: WALNUT, top: 'marble', shelf: 1.0 });
  const soap = (x, y, n, col, name) => { for (let i = 0; i < n; i++) { const z = ST + i * 0.135; Rt.soft(col, x - 0.23, x + 0.23, y - 0.14, y + 0.14, z, z + 0.13, 0.02); Rt.box('c#efe2bc/0.8', x - 0.15, x + 0.15, y - 0.143, y + 0.143, z + 0.002, z + 0.133); } kit.sign(Rt, x, y, ST + n * 0.135 + 0.003, 0.3, 0.28, SOAPBAND(name), { flat: true, cw: 108, ch: 100 }); };
  const SOAPS = [['c#c9b48a/0.8', 'oatmeal &\nhonest work'], ['c#9fb0a4/0.8', 'sea\nfennel'], ['c#2b2724/0.8', 'coal tar\n(nostalgia)'], ['c#e88aa8/0.8', 'rose, not\ntoo much'], ['c#e8c73a/0.8', 'lemon\n& sage'], ['c#f4f1ea/0.8', 'goat milk,\nwilling goat'], ['c#8a5ab0/0.8', 'lavender\n(obviously)'], ['c#4a6e38/0.8', 'pine tar\n& resolve']];
  SOAPS.forEach(([c, n], i) => { const x = 3.3 + (i % 4) * 0.8, y = 0.55 + Math.floor(i / 4) * 0.72; soap(x, y, 2 + ((i * 3) % 4), c, n); });
  soap(6.45, 1.55, 1, 'c#e8907a/0.8', 'grapefruit,\nloudly'); soap(6.9, 0.7, 5, 'c#d9cdb2/0.8', 'plain.\nfor the brave');
  X.card(Rt, 4.5, 1.9, ST, 1.9, 0.34, TAG('soap by the bar · cut on thursdays · 6 each'));
  // the basin: enamel, navy rim, a jug, a towel, the card
  { const x = 1.75, y = 1.05;
    bowl(Rt, x, y, ST, 0.6, 0.32, ENAMEL, 24); ves(Rt, 'c#26364f/0.45', x, y, ST + 0.305, [[0.575, 0], [0.615, 0], [0.615, 0.03], [0.575, 0.03]], 24); Rt.cyl('c#9fb0d8/0.2', x, y, ST + 0.19, ST + 0.2, 0.5, 0.5, 20);
    kit.model('metal_jug', Rt, 2.75, 0.5, ST, 0, { scale: 0.62 });
    kit.pumpBottle(Rt, 0.95, 0.5, ST, { h: 0.6 }); kit.soapDish(Rt, 2.55, 1.55, ST, { soap: snapMat('c#9fb0a4/0.8') });
    kit.foldedStack(Rt, 1.35, 1.85, ST, 2, ['c#e8e2d4/0.8', 'c#9fb0a4/0.8'], { w: 0.7, d: 0.5 });
    kit.sign(Rt, 1.75, 0.3, ST + 0.62, 1.5, 0.95, (g, w, h) => { paper(g, w, h, PAPER, 4); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(7, 7, w - 14, h - 14); T(g, 'wash your hands.', w / 2, h * 0.27, h * 0.2, INK, { f: F.fraunces, w: 600, max: w * 0.88 }); T(g, 'tell us what you think.', w / 2, h * 0.52, h * 0.2, INK, { f: F.fraunces, w: 600, max: w * 0.88 }); T(g, '(Ember has no nose. Ember is curious.)', w / 2, h * 0.78, h * 0.125, RUST, { f: F.caveat, w: 600, max: w * 0.88 }); }, { cw: 330, ch: 210, tilt: 0.1, rough: 0.9 });
    Rt.box(WALNUT, 1.0, 2.5, 0.12, 0.3, ST, ST + 0.06, G);
    kit.pillarCandle(Rt, 0.75, 1.3, ST, 0.5, 0.14);
  }
  // under the slab and on the wall above
  kit.foldedStack(Rt, 2.2, 1.1, 1.0, 5, ['c#e8e2d4/0.8', 'c#26364f/0.8', 'c#e8e2d4/0.8', 'c#9fb0a4/0.8', 'c#e8e2d4/0.8']); kit.foldedStack(Rt, 3.6, 1.1, 1.0, 3, ['c#c9b48a/0.8', 'c#e8e2d4/0.8', 'c#e8907a/0.8']);
  kit.model('wicker_basket_01', Rt, 5.6, 1.1, 1.0, 0, { scale: 0.9 });
  for (const z of [5.3, 6.6]) { Rt.box(WALNUT, 1.0, 7.4, 0.02, 0.9, z - 0.08, z, G); for (const x of [1.4, 4.2, 7.0]) tube(Rt, BRASS, [[x, 0.04, z - 0.5], [x, 0.75, z - 0.08]], 0.02, 5); }
  for (let i = 0; i < 7; i++) kit.pumpBottle(Rt, 1.5 + i * 0.55, 0.45, 5.3, { h: 0.55 + (i % 2) * 0.1, colour: snapMat(i % 3 ? 'c#8a5a2a/0.15' : 'c#f4f1ea/0.2'), turn: 1.2 });
  for (let i = 0; i < 4; i++) ves(Rt, 'c#c9b48a/0.8', 5.6 + i * 0.5, 0.45, 5.3, [[0, 0], [0.16, 0], [0.19, 0.05], [0.16, 0.12], [0.03, 0.14], [0.025, 0.7], [0, 0.7]], 10);         // bath brushes, standing on their heads
  [['c#e88aa8/0.8', 'bath\nmilk'], ['c#9fb0d8/0.8', 'bath\ncrystals'], ['c#f4f1ea/0.8', 'bath\n(just bath)'], ['c#8a5ab0/0.8', 'violet\nfizz']].forEach(([c, n], i) => { const x = 1.5 + i * 0.75; jar(Rt, x, 0.45, 6.6, 0.24, 0.7, c, 0.75, CORK); kit.sign(Rt, x, 0.696, 6.9, 0.32, 0.26, BOTTLELABEL(n), { cw: 96, ch: 80 }); });
  for (let i = 0; i < 4; i++) flask(Rt, 4.8 + i * 0.62, 0.45, 6.6, i % 2 ? AMBER : BLUE, ['bubbles', 'body oil', 'foot\nthing', 'elbow\ngrease'][i], { h: 0.9 });
  Rt.box('c#17140f/0.45', 2.65, 5.75, 0.01, 0.06, 8.05, 9.75); kit.sign(Rt, 4.2, 0.07, 8.9, 2.9, 1.5, POSTER.soap, { cw: 380, ch: 196 });
  X.pendant(Rt, 4.2, 1.3, { kind: 'bulb', drop: 5.6, power: 0.6 });

  // ---- the counter and the wrapping station (back, right of centre) -------------------------------------------
  const c = at(19.5, 20.6, 0, 'street');                         // +x toward smaller a; +y is the customers' side
  const TOP = X.counter(c, -5.5, 5.5, -2.0, 0, 3.4, { front: NAVYP, top: WALNUT });
  kit.sign(c, 0, 0.005, 2.0, 4.6, 0.95, POSTER.wrap, { cw: 600, ch: 124 });
  // the brass till
  { const x = -3.6, y = -1.05, z = TOP;
    c.soft('c#b08d4a/0.35/1', x - 0.55, x + 0.55, y - 0.5, y + 0.45, z, z + 0.5, 0.05); c.soft('c#b08d4a/0.35/1', x - 0.5, x + 0.5, y - 0.5, y + 0.1, z + 0.5, z + 1.0, 0.08);
    for (let i = 0; i < 12; i++) c.cyl('c#efe9da/0.3', x - 0.36 + (i % 4) * 0.24, y + 0.2 + Math.floor(i / 4) * 0.08, z + 0.5 + (2 - Math.floor(i / 4)) * 0.05, z + 0.56 + (2 - Math.floor(i / 4)) * 0.05, 0.05, 0.05, 8);
    kit.sign(c, x, y + 0.11, z + 0.78, 0.7, 0.3, (g, w, h) => { fill(g, w, h, '#17140f'); T(g, 'THANK YOU', w / 2, h / 2, h * 0.5, '#e9c46a', { f: F.bebas, ls: 3, max: w * 0.9 }); }, { cw: 128, ch: 56 }); }
  // the bell
  { const x = -2.2, y = -0.55; c.cyl('c#2b2724/0.45', x, y, TOP, TOP + 0.04, 0.2, 0.2, 14); ves(c, BRASS, x, y, TOP + 0.04, [[0.17, 0], [0.16, 0.06], [0.1, 0.13], [0.03, 0.16], [0.03, 0.2], [0, 0.2]], 16); X.card(c, x - 0.1, -0.2, TOP, 1.0, 0.3, TAG2('ring for Ember', '(Ember is right here)'), { cw: 240, ch: 72 }); }
  kit.candle(c, -1.2, -1.2, TOP, 0.75); kit.candle(c, -0.85, -1.45, TOP, 0.5);
  kit.jarCandle(c, -4.85, -0.6, TOP, { r: 0.2, tall: 0.42, wax: 'c#d9b35a/0.6', label: 'c#efe2bc/0.8' }); kit.sign(c, -4.85, -0.393, TOP + 0.18, 0.25, 0.16, JARLABEL('Shop, Closed (never)'), { cw: 128, ch: 82 });
  // wrapping: tissue, a kraft roll on a cradle, ribbon on spools, twine, parcels waiting
  ['c#f4f1ea/0.8', 'c#e88aa8/0.8', 'c#efe2bc/0.8', 'c#9fb0d8/0.8', 'c#f4f1ea/0.8'].forEach((col, i) => c.box(col, 0.2 + i * 0.03, 1.5 + i * 0.03, -1.5 + i * 0.04, -0.5 + i * 0.04, TOP + i * 0.012, TOP + i * 0.012 + 0.011));
  { const z = TOP + 0.3; for (const x of [1.95, 3.95]) c.box(WALNUT, x - 0.04, x + 0.04, -1.85, -1.35, TOP, z + 0.1, G); hcyl(c, 'c#c9a77a/0.8', 'x', 2.95, -1.6, z, 1.8, 0.22, 0.22, 14); hcyl(c, WALNUT, 'x', 2.95, -1.6, z, 2.1, 0.03, 0.03, 6); c.box('c#c9a77a/0.8', 2.1, 3.8, -1.4, -0.45, TOP + 0.002, TOP + 0.01); }
  { const z = TOP + 0.85; for (const x of [2.1, 3.9]) c.box(BRASS, x - 0.02, x + 0.02, -0.92, -0.88, TOP, z + 0.05); hcyl(c, BRASS, 'x', 3.0, -0.9, z, 1.9, 0.02, 0.02, 6);
    ['c#8a1c1c/0.8', 'c#d9b35a/0.8', 'c#26364f/0.8', 'c#e88aa8/0.8', 'c#4a6e38/0.8'].forEach((col, i) => { const x = 2.35 + i * 0.33; hcyl(c, col, 'x', x, -0.9, z, 0.16, 0.19, 0.19, 14); for (const s of [-1, 1]) hcyl(c, CORK, 'x', x + s * 0.09, -0.9, z, 0.015, 0.23, 0.23, 14); c.box(col, x - 0.06, x + 0.06, -0.712, -0.706, z - 0.5 - (i % 3) * 0.1, z); }); }
  ball(c, TWINE, 4.35, -0.5, TOP, 0.14, 10);
  pack(c, 0.9, -0.95, TOP + 0.07, 0.8, 0.6, 0.4, 'c#c9a77a/0.8', (g, w, h) => { fill(g, w, h, '#c9a77a'); grain(g, w, h, 0.07); rect(g, w * 0.44, 0, w * 0.12, h, '#8a1c1c'); rect(g, 0, h * 0.42, w, h * 0.14, '#8a1c1c'); rrect(g, w * 0.58, h * 0.6, w * 0.36, h * 0.3, 3, PAPER); T(g, 'for: you', w * 0.76, h * 0.75, h * 0.13, INK, { f: F.caveat, w: 600 }); }, { cw: 160, ch: 80 });
  kit.tableLamp(c, 4.9, -1.2, TOP, 'c#26364f/0.4', { base: 'jar' });
  X.pendant(c, -2.4, -0.9, { kind: 'bulb', drop: 5.0, power: 0.6 }); X.pendant(c, 2.2, -0.9, { kind: 'bulb', drop: 5.0, power: 0.6 });

  // behind the counter: cupboard and shelves of stock
  const b = at(19.5, D, 0, 'street');
  X.shelving(b, -5.5, 5.5, [4.6, 5.9, 7.2], { d: 0.95, mat: WALNUT, back: NAVYP, bay: 3.7 });
  b.box(WALNUT, -5.5, 5.5, 0.02, 1.25, 0, 3.2, G); b.box(WALNUT, -5.6, 5.6, 0.02, 1.35, 3.2, 3.3, G); b.block(-5.5, 5.5, 0, 1.3, 0, 3.3);
  for (let i = 0; i < 5; i++) { const x0 = -5.5 + i * 2.2; b.box(DRAWER, x0 + 0.1, x0 + 2.1, 1.25, 1.29, 0.35, 3.05, G); hcyl(b, BRASS, 'y', x0 + 1.85, 1.33, 1.9, 0.08, 0.04, 0.03, 8); }
  for (const [x0, o] of [[-5.5, 0], [-1.83, 4], [1.83, 8]]) { for (let i = 0; i < 5; i++) boxed(b, x0 + 0.55 + i * 0.64, 4.6, i + o, 0.45); for (let i = 0; i < 5; i++) boxed(b, x0 + 0.55 + i * 0.64, 5.9, i + o + 5, 0.45); }
  for (let i = 0; i < 15; i++) { const x = -5.1 + i * 0.72; if (i % 5 === 4) jar(b, x, 0.45, 7.2, 0.22, 0.65, ['c#c9b48a/0.8', 'c#e88aa8/0.8', 'c#9fb0d8/0.8'][(i / 5) | 0], 0.7, CORK); else bottle(b, x, 0.45, 7.2, { r: 0.14, h: 0.85 + (i % 3) * 0.1, col: i % 2 ? AMBER : BLUE, neck: 0.05, cap: CORK, label: 'c#efe2bc/0.8' }); }
  kit.tableLamp(b, 4.6, 0.7, 3.3, 'c#8a5a2a/0.4', { base: 'gourd', shade: 'empire' });
  { const z = 3.3; for (let i = 0; i < 4; i++) boxed(b, -4.9 + i * 0.6, z, i + 1, 0.6); for (let i = 0; i < 3; i++) boxed(b, -4.6 + i * 0.6, z + 0.62, i + 6, 0.6);
    for (let i = 0; i < 3; i++) jar(b, -0.6 + i * 0.8, 0.65, z, 0.28, 0.8, ['c#e88aa8/0.8', 'c#f4f1ea/0.8', 'c#9fb0d8/0.8'][i], 0.7, 'c#b08d4a/0.35/1');
    kit.posy(b, 2.4, 0.7, z); }
  b.box('c#b08d4a/0.35/1', -3.75, 3.75, 0.01, 0.07, 9.0, 10.5); kit.sign(b, 0, 0.08, 9.75, 7.3, 1.3, POSTER.shop, { cw: 900, ch: 160 });

  // ---- back wall, left: bath things, and how to burn a candle -------------------------------------------------
  const b2 = at(7.6, D, 0, 'street');
  X.shelving(b2, -4.3, 4.3, [1.2, 2.6, 4.0, 5.4], { d: 1.0, mat: WALNUT, back: NAVYP, bay: 4.3 });
  for (let i = 0; i < 5; i++) kit.foldedStack(b2, -3.6 + i * 1.75, 0.5, 1.2, 3 + (i % 2), [['c#e8e2d4/0.8', 'c#9fb0a4/0.8'], ['c#26364f/0.8', 'c#e8e2d4/0.8'], ['c#e8907a/0.8', 'c#c9b48a/0.8']][i % 3].concat(['c#e8e2d4/0.8', 'c#c9b48a/0.8']));
  for (let i = 0; i < 11; i++) kit.pumpBottle(b2, -3.8 + i * 0.75 + (i > 5 ? 0.1 : 0), 0.5, 2.6, { h: 0.6, colour: snapMat(i % 2 ? 'c#8a5a2a/0.15' : 'c#2a63b8/0.15') });
  X.card(b2, 0, 0.98, 2.6, 1.9, 0.3, TAG('hand wash · amber: fig · blue: sea, allegedly'));
  ['hand cream:\ngardener', 'hand cream:\ntypist', 'hand cream:\npianist', 'hand cream:\nrobot (oil)'].forEach((n, i) => { const x = -3.5 + i * 0.95; pack(b2, x, 0.5, 4.0, 0.7, 0.3, 0.42, 'c#e8e2d4/0.8', BOTTLELABEL(n), { cw: 140, ch: 84 }); kit.lotionTube(b2, x - 0.2, 0.5, 4.42, { turn: 0, len: 0.42, cap: 'c#26364f/0.45' }); });
  for (let i = 0; i < 5; i++) { const x = 0.9 + i * 0.7; jar(b2, x, 0.5, 4.0, 0.24, 0.75, ['c#e88aa8/0.8', 'c#9fb0d8/0.8', 'c#f4f1ea/0.8', 'c#8a5ab0/0.8', 'c#e8c73a/0.8'][i], 0.7, CORK); }
  X.card(b2, 2.3, 0.98, 4.0, 1.7, 0.3, TAG('bath salts · a bath is a soup of you'));
  for (let i = 0; i < 5; i++) boxed(b2, -3.7 + i * 0.66, 5.4, i + 2);
  for (let i = 0; i < 6; i++) flask(b2, 0.6 + i * 0.62, 0.5, 5.4, i % 2 ? 'c#c9d6d8/0.15' : AMBER, ['bubble\nbath', 'bath oil', 'after\nbath', 'before\nbath', 'instead\nof bath', 'shower\n(traitor)'][i], { h: 0.92, r: 0.15 });
  b2.box('c#17140f/0.45', -2.35, 2.35, 0.01, 0.07, 7.0, 10.3); kit.sign(b2, 0, 0.08, 8.65, 4.5, 3.1, POSTER.burn, { cw: 620, ch: 428 });
  // a dried arrangement in the back corner, and a stool to perch on by the scent bar
  { const f = at(2.4, 16.2); X.stool(f, 0, 0, 2.2, { mat: WALNUT, label: 'perch and sniff' }); }

  // ---- out on the pavement: a bench, lanterns, the board -------------------------------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));              // x = a along the frontage, y = -feet out from the shopfront
  // (the street's own planter stands in front of the left window, so the bench goes under the right one)
  kit.model('painted_wooden_bench', o, 24.3, -1.25, 0, 2, { outdoor: true, collide: true, seat: 1.45 });
  kit.model('Lantern_01', o, 21.7, -0.9, 0, 0, { outdoor: true, scale: 1.3 }); kit.lampAt(o, 21.7, -0.9, 0.7, 0.35);
  { const x = 1.9, y = -1.25;                                        // a stand with the big lantern, left of the planter
    o.box(NAVYP, x - 0.6, x + 0.6, y - 0.6, y + 0.6, 0, 1.5); o.box(WALNUT, x - 0.68, x + 0.68, y - 0.68, y + 0.68, 1.5, 1.58, G); o.block(x - 0.68, x + 0.68, y - 0.68, y + 0.68, 0, 2);
    kit.model('wooden_lantern_01', o, x, y, 1.62, 0, { outdoor: true }); kit.lampAt(o, x, y, 2.5, 0.45); }
  { const x = 19.0, y = -1.0;                                        // a crate of lavender by the bench
    X.crate(o, x, y, 0, 1.5, 1.1, 0.8); for (let i = 0; i < 3; i++) K.potted(o, x - 0.45 + i * 0.45, y, 0.06, { r: 0.2, h: 0.5, n: 16, len: 1.0, w: 0.02, up: 1, out: 0.3, droop: 0.2, col: ['c#7fa04a/0.8', 'c#8a5ab0/0.8', 'c#9fb0a4/0.8'] }); o.block(x - 0.75, x + 0.75, y - 0.55, y + 0.55, 0, 2);
    X.card(o, x, y - 0.62, 0.3, 1.2, 0.36, TAG('lavender. take a sniff, leave the bees.')); }
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.6, 5.2, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h, '#232a3c'); chalk(g, 'today it smells of', w / 2, h * 0.1, h * 0.075, '#e9c46a'); ICON.candle(g, w / 2, h * 0.3, h * 0.24, '#f1efe6', '#e9c46a'); chalk(g, 'RAIN ON', w / 2, h * 0.52, h * 0.1); chalk(g, 'HOT PAVEMENT', w / 2, h * 0.63, h * 0.1); chalk(g, 'come in & light something', w / 2, h * 0.79, h * 0.068, '#e8a8a0', { max: w * 0.9 }); chalk(g, '(we mean it. there are 28.)', w / 2, h * 0.91, h * 0.055, '#9aa39d', { max: w * 0.9 }); });

  // ---- Ember, the chandler ------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'ember', name: 'Ember', lot: 'apothecary', look: { shape: 'round', colour: '#34405a', belly: '#efe4cf', trim: '#c9a45c', scarf: '#c8552e', hat: 'none', eye: '#ffd9a0', ring: 0xffc878, blush: true, tool: 'candle', hover: 4.7 },
    home: lot.world(19.5, 24.05), faces: lot.world(17, 12), posts: [lot.world(15.4, 24.05), lot.world(23.4, 24.05), lot.world(19.5, 24.05)],
    lines: {
      greet: ['Oh, hello. Come in slowly. Everything in here is better slowly.', 'Welcome. Nothing is lit yet. That is what you are for.', 'Good nearly-evening. Light something, would you? I am not allowed to have all the fun.'],
      idle: ['*trims a wick by the width of one regret*', 'This one smells of a drawer nobody has opened since spring.', '*holds a candle up to the lamp, nods, puts it back exactly where it was*', 'Beeswax remembers the bees. I find that a comfort.', '*adjusts scarf by one degree*'],
      bye: ['Go gently. Blow out what you lit. Or do not; I like the company.', 'Mind the step. You smell wonderful, incidentally. Like a committee.'],
      topics: [
        { q: 'Can I really light these?', a: 'Please. Walk up to any wick and press E. The table has twelve, the windows six, and there are ten more hiding about the shop. I counted. Twice, slowly.', next: [
          { q: 'What if I light all of them?', a: 'Then the shop will smell of a library on fire in the rain beside a laundry, and I shall be very proud of you.' }] },
        { q: 'What does “Library Fire” smell like?', a: 'Page 212 of a hardback left on a radiator. Cedar shelf. One pipe, smoked by a man who was told not to. And a faint top note of the librarian deciding to let it go.', next: [
          { q: 'And “Rain on Hot Pavement”?', a: 'The first ninety seconds only. After that it is just wet. We stopped the candle at eighty-nine.' },
          { q: 'And “Someone Else’s Laundry”?', a: 'A warm vent on a cold street. Their softener, not yours. You will never find out which one. That is the whole scent.' }] },
        { q: 'Which one is your favourite?', a: 'Vesper Street, 6 p.m. Juniper’s coffee from over the road, warm brick, the lamps clearing their throats. It is always nearly six here, so it never goes out of date.' },
        { q: 'Tell me about the soap.', a: 'Cut on Thursdays, wrapped by me, banded by hand. There is a basin on the right. Wash, sniff, report back. I have no nose, you see. I work entirely from testimony.', next: [
          { q: 'You have no nose?', a: 'None. I describe scent the way a lighthouse describes ships. From a distance, with great confidence, and mostly at night.' }] },
        { q: 'What is in the drawers?', a: 'Lavender, wicks, string, string that is too short, and one drawer of yesterday. Please do not open “do not open”. Please do open “open me”. It gets lonely.' },
        { q: 'Could you wrap something?', a: 'Tissue, then paper, then ribbon, then a second ribbon to apologise for the first. It takes me four minutes and I enjoy all of them.' },
      ],
    },
  });
}
