// Tomorrow Bread  (south side, 23 ft wide by 24.7 deep): "baked before you are up"
// Open at last. The counter runs across the back left with two glass cases (pastry; cakes), the
// till and a basket of baguettes; behind it the bread wall, four slanted racks of loaves, every
// bread with a handwritten label that says what is actually in it. To the right the shop opens
// straight through to the bakehouse: the deck oven on the back wall with its middle door down and
// the mouth glowing, the peel, the long bench down the right wall (dough under cloths, bannetons,
// Doris the starter and her feeding log, the proofing slate), the mixer, the rack trolley, flour
// sacks from Hollow Wheel Mill. Out front: today's and tomorrow's bake on slates, yesterday's
// loaves at half price, a table to try the bread at, the cookie jar at child height, a shelf by
// the window to eat a bun at with the recipe pinned up beside it. Crumb is behind the counter and
// has been up since before the birds.
import { tools, fixtures, snapMat } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, board, grain, disc, rect, rrect, line, para, ICON } from '../draw.js';

const OAK = 'oak_light#a3825c', PALEW = 'oak_light#c4a477', BLUSH = 'painted_wood#d8b7a6', CREAM = 'painted_wood#efe6d4', DARKW = 'fir#3a2c24';
const STEEL = 'c#c9ccd0/0.45/1', IRON = 'c#2b2724/0.45/1', PORC = 'c#ebe6dc/0.18', ENAMEL = 'c#2b2724/0.45', LINEN = 'linen#e9dfc8', SACK = 'linen#d9c9a8';
const CR1 = 'c#a8784a/0.8', CR2 = 'c#8a5a2a/0.8', CR3 = 'c#6a4a2a/0.8', RYE = 'c#3a2214/0.8', PALE = 'c#c9a77a/0.8', BUN = 'c#b08a5a/0.45', GOLD = 'c#c9952a/0.45', FLOUR = 'c#e8e2d4/0.8', WHITE = 'c#f4f1ea/0.8', DOUGH = 'c#efe2bc/0.8';
const GLOW = 'e#ff7a2a/1.1';                                    // the one new glow: the oven
const INK = '#2a1c13', RED = '#a8554a', PAPER = '#f6efdc', PINK = '#f3d9cf';

// ---- lettering ------------------------------------------------------------------------------------------
const TAG = (txt, c = PAPER, ink = INK) => (g, w, h) => { paper(g, w, h, c); T(g, txt, w / 2, h / 2, h * 0.44, ink, { f: F.caveat, w: 600, max: w * 0.92 }); };
const TICKET = (name, price) => (g, w, h) => { paper(g, w, h, PAPER); T(g, name, w / 2, h * 0.34, h * 0.36, INK, { f: F.caveat, w: 700, max: w * 0.92 }); T(g, price, w / 2, h * 0.75, h * 0.3, RED, { f: F.fraunces, w: 700 }); };
const BREADTAG = (name, note, price) => (g, w, h) => {
  paper(g, w, h, PAPER, name.length); g.strokeStyle = RED; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6);
  T(g, name, w * 0.04, h * 0.3, h * 0.36, RED, { f: F.bebas, ls: 2, a: 'left', max: w * 0.76 }); T(g, price, w * 0.96, h * 0.3, h * 0.34, INK, { f: F.fraunces, w: 700, a: 'right' });
  T(g, note, w * 0.04, h * 0.72, h * 0.3, INK, { f: F.caveat, w: 600, a: 'left', max: w * 0.92 });
};
const rows = (g, w, h, list, y0, dy, px, cols = ['#e9c46a', '#efe9da']) => list.forEach(([a, b], i) => { chalk(g, a, w * 0.07, h * (y0 + i * dy), px, cols[0], { a: 'left' }); chalk(g, b, w * 0.27, h * (y0 + i * dy), px, cols[1], { a: 'left', max: w * 0.68 }); });
const TODAY = (g, w, h) => {
  slate(g, w, h, '#232826', 5); chalk(g, "today's bake", w / 2, h * 0.08, h * 0.1, '#f1efe6'); line(g, [[w * 0.2, h * 0.14], [w * 0.8, h * 0.14]], '#e8a8a0', 3);
  chalk(g, 'out of the oven at', w / 2, h * 0.185, h * 0.045, '#9aa39d');
  rows(g, w, h, [['5:10', 'baguettes, first deck'], ['5:40', 'country loaf · bâtards'], ['6:15', 'seeded tin · pain de mie'], ['6:30', 'croissants · morning buns'], ['7:00', 'the door. unlocked. really'], ['9:30', 'focaccia (rosemary)'], ['11:00', 'baguettes again'], ['3:00', 'cardamom knots*']], 0.265, 0.076, h * 0.056);
  chalk(g, '* most of these are Juniper’s. ask nicely', w / 2, h * 0.875, h * 0.043, '#9fc6b0', { max: w * 0.9 });
  chalk(g, 'no longer “sold out, back at seven”', w / 2, h * 0.945, h * 0.043, '#e8a8a0', { max: w * 0.9 });
};
const TOMORROW = (g, w, h) => {
  slate(g, w, h, '#232826', 8); chalk(g, "tomorrow's bake", w / 2, h * 0.08, h * 0.1, '#f1efe6'); line(g, [[w * 0.14, h * 0.14], [w * 0.86, h * 0.14]], '#e9c46a', 3);
  chalk(g, 'mixed tonight, shaped by midnight', w / 2, h * 0.185, h * 0.045, '#9aa39d');
  [['miche', '2 kg wheels, by the quarter'], ['walnut levain', 'the purple one'], ['olive & lemon', 'thyme from the Yard'], ['dark rye', 'baked today, sold tomorrow: it needs the day'], ['brioche', 'the dough is in the cold now'], ['spelt & honey', 'gentle']].forEach(([a, b], i) => { chalk(g, a, w * 0.07, h * (0.27 + i * 0.094), h * 0.062, '#e9c46a', { a: 'left' }); chalk(g, b, w * 0.1, h * (0.315 + i * 0.094), h * 0.042, '#efe9da', { a: 'left', max: w * 0.84 }); });
  chalk(g, 'put your name down by sundown,', w / 2, h * 0.875, h * 0.046, '#9fc6b0', { max: w * 0.9 }); chalk(g, 'collect before you are up', w / 2, h * 0.94, h * 0.046, '#9fc6b0', { max: w * 0.9 });
};
const PROOF = (g, w, h) => {
  slate(g, w, h, '#20252a', 12); chalk(g, 'the night shift', w / 2, h * 0.075, h * 0.095, '#f1efe6'); chalk(g, 'country dough · 40 kg flour · dough temp 26°C', w / 2, h * 0.15, h * 0.048, '#9aa39d', { max: w * 0.92 });
  rows(g, w, h, [['14:00', 'feed Doris 1 : 5 : 5'], ['18:30', 'autolyse: flour + water, 45 min'], ['19:15', 'mix in levain, then salt'], ['19:45', 'bulk. fold at :15 and :45, four times'], ['23:00', 'divide 950 g · bench rest 25 min'], ['23:30', 'shape → baskets → cold room 4°C'], ['04:00', 'oven on. decks 250°C. coffee'], ['05:00', 'load from cold. steam. 20 + 22 min']], 0.245, 0.083, h * 0.052, ['#e8a8a0', '#efe9da']);
  chalk(g, 'if in doubt: it needs longer', w / 2, h * 0.935, h * 0.052, '#e9c46a');
};
const RECIPE = (g, w, h) => {
  paper(g, w, h, '#f4ecd8', 21); g.strokeStyle = RED; g.lineWidth = 3; g.strokeRect(12, 12, w - 24, h - 24);
  T(g, 'A PLAIN', w / 2, h * 0.045, h * 0.03, RED, { f: F.bebas, ls: 6 }); T(g, 'Country Loaf', w / 2, h * 0.093, h * 0.062, INK, { f: F.pacifico }); T(g, 'one loaf of about 850 g · start the morning before', w / 2, h * 0.14, h * 0.02, INK, { f: F.fraunces, it: 1 });
  line(g, [[w * 0.1, h * 0.162], [w * 0.9, h * 0.162]], RED, 2);
  [['450 g', 'white bread flour'], ['50 g', 'wholewheat flour'], ['375 g', 'water at 30°C / 86°F  (75%)'], ['100 g', 'ripe levain  (20%)'], ['10 g', 'salt  (2%)']].forEach(([a, b], i) => { T(g, a, w * 0.27, h * (0.19 + i * 0.03), h * 0.024, RED, { f: F.elite, a: 'right' }); T(g, b, w * 0.31, h * (0.19 + i * 0.03), h * 0.024, INK, { f: F.elite, a: 'left', max: w * 0.6 }); });
  line(g, [[w * 0.1, h * 0.335], [w * 0.9, h * 0.335]], RED, 2);
  let y = h * 0.348; const px = h * 0.0182;
  ['Levain: in the morning stir 20 g starter into 50 g flour and 50 g water. It is ready when it has doubled and a spoonful floats: 4 to 6 hours.',
    'Mix the flours with 350 g of the water until no dry flour is left. Cover. Rest 45 minutes.',
    'Add the levain, the salt and the last 25 g of water. Squeeze it through with a wet hand until it is one dough again.',
    'Bulk: 4 hours somewhere warm (26°C / 78°F). Stretch and fold every 30 minutes for the first 2 hours, then leave it alone. It should grow by half, and wobble.',
    'Tip out. Shape a loose round, rest 20 minutes, shape it tight. Seam side up into a well floured basket.',
    'Fridge, covered, overnight: 8 to 14 hours.',
    'Heat a lidded cast-iron pot in the oven at 250°C / 480°F for 45 minutes. Turn the cold loaf in, score it, lid on: 20 minutes. Lid off, down to 230°C / 450°F: 20 to 25 minutes more. Bake it darker than you dare.',
    'Cool on a rack for an hour before cutting. This is the hard step.'].forEach((s, i) => { T(g, String(i + 1), w * 0.115, y + px * 0.62, px * 1.5, RED, { f: F.abril }); y = para(g, s, w * 0.16, y, px, INK, w * 0.74, { f: F.fraunces, lh: 1.28 }) + px * 0.42; });
  T(g, 'pale means not done. it is only shy.   C.', w / 2, h * 0.963, h * 0.026, RED, { f: F.caveat, w: 700, max: w * 0.84 });
};
const FEEDLOG = (g, w, h) => {
  paper(g, w, h, '#fbf7ea', 31); for (let i = 0; i < 13; i++) line(g, [[w * 0.05, h * (0.2 + i * 0.058)], [w * 0.95, h * (0.2 + i * 0.058)]], '#b9cfe0', 1);
  T(g, 'DORIS · FEEDING LOG', w / 2, h * 0.055, h * 0.052, RED, { f: F.bebas, ls: 2 }); T(g, 'levain, 100% hydration · 80 white / 20 whole rye', w / 2, h * 0.115, h * 0.03, INK, { f: F.fraunces, it: 1, max: w * 0.9 });
  T(g, 'day   time    1 : flour : water    °C', w * 0.06, h * 0.172, h * 0.028, RED, { f: F.elite, a: 'left', max: w * 0.88 });
  [['Mon 14:00  1:5:5  26°', 'doubled by 18:20. smug'], ['Tue 14:00  1:5:5  25°', 'tripled. domed. a spoonful floats'], ['Wed 14:05  1:5:5  23°', 'slow. moved her nearer the oven'], ['Thu 14:00  1:5:5  27°', 'peaked early: yoghurt, green apple'], ['Fri 13:55  1:10:10  26°', 'big feed for the weekend bake'], ['Sat 14:00  1:5:5  26°', 'sang a little (it was the fridge)']]
    .forEach(([a, b], i) => { T(g, a, w * 0.06, h * (0.232 + i * 0.116), h * 0.034, INK, { f: F.elite, a: 'left', max: w * 0.88 }); T(g, b, w * 0.12, h * (0.288 + i * 0.116), h * 0.042, '#26364f', { f: F.caveat, w: 600, a: 'left', max: w * 0.82 }); });
  T(g, 'lid ON LOOSE. she breathes.', w / 2, h * 0.945, h * 0.046, RED, { f: F.caveat, w: 700, max: w * 0.9 });
};
const SACKLABEL = (kind, sub, c = '#8a3a2a') => (g, w, h) => {
  fill(g, w, h, '#dccdaa'); grain(g, w, h, 0.09, kind.length);
  const r = Math.min(h * 0.3, w * 0.16), cx = h > w ? w / 2 : r * 1.35, cy = h > w ? h * 0.24 : h / 2;
  disc(g, cx, cy, r, null, c, r * 0.12); disc(g, cx, cy, r * 0.2, c); for (let i = 0; i < 8; i++) line(g, [[cx + Math.cos(i * 0.785) * r * 0.2, cy + Math.sin(i * 0.785) * r * 0.2], [cx + Math.cos(i * 0.785) * r * 0.94, cy + Math.sin(i * 0.785) * r * 0.94]], c, r * 0.09);
  if (h > w) { T(g, 'HOLLOW WHEEL MILL', w / 2, h * 0.47, h * 0.058, c, { f: F.bebas, ls: 2, max: w * 0.88 }); T(g, kind, w / 2, h * 0.585, h * 0.095, INK, { f: F.abril, max: w * 0.88 }); T(g, sub, w / 2, h * 0.69, h * 0.045, INK, { f: F.elite, max: w * 0.88 }); T(g, 'stoneground · unbleached · 25 kg', w / 2, h * 0.79, h * 0.042, c, { f: F.fraunces, it: 1, max: w * 0.88 }); T(g, 'store cool & dry. keep the cat off', w / 2, h * 0.89, h * 0.05, INK, { f: F.caveat, w: 600, max: w * 0.88 }); }
  else { const x = r * 2.7 + (w - r * 2.7) / 2, mx = (w - r * 2.9) * 0.94; T(g, 'HOLLOW WHEEL MILL · STONEGROUND', x, h * 0.2, h * 0.16, c, { f: F.bebas, ls: 2, max: mx }); T(g, kind, x, h * 0.5, h * 0.3, INK, { f: F.abril, max: mx }); T(g, sub + ' · 25 kg', x, h * 0.82, h * 0.14, INK, { f: F.elite, max: mx }); }
};
const FLOURBAG = (kind, sub, c) => (g, w, h) => { paper(g, w, h, '#efe6d0', 7); rect(g, 0, 0, w, h * 0.1, c); rect(g, 0, h * 0.9, w, h * 0.1, c); const r = w * 0.2; disc(g, w / 2, h * 0.28, r, null, c, 3); for (let i = 0; i < 8; i++) line(g, [[w / 2, h * 0.28], [w / 2 + Math.cos(i * 0.785) * r, h * 0.28 + Math.sin(i * 0.785) * r]], c, 2); T(g, 'HOLLOW WHEEL', w / 2, h * 0.5, h * 0.07, c, { f: F.bebas, ls: 1, max: w * 0.86 }); T(g, kind, w / 2, h * 0.62, h * 0.1, INK, { f: F.abril, max: w * 0.86 }); T(g, sub, w / 2, h * 0.74, h * 0.052, INK, { f: F.elite, max: w * 0.86 }); T(g, '2 kg', w / 2, h * 0.83, h * 0.05, c, { f: F.fraunces, it: 1 }); };
const CLUB = (g, w, h) => {
  fill(g, w, h, '#f3d9cf'); grain(g, w, h, 0.05); g.strokeStyle = RED; g.lineWidth = 4; g.strokeRect(9, 9, w - 18, h - 18);
  T(g, 'the', w / 2, h * 0.075, h * 0.05, INK, { f: F.fraunces, it: 1 }); T(g, 'BREAD CLUB', w / 2, h * 0.16, h * 0.105, RED, { f: F.abril, max: w * 0.84 });
  T(g, 'a loaf a week, your name on the bag', w / 2, h * 0.25, h * 0.036, INK, { f: F.fraunces, it: 1, w: 600, max: w * 0.84 });
  for (let i = 0; i < 10; i++) { const x = w * (0.18 + (i % 5) * 0.16), y = h * (0.38 + Math.floor(i / 5) * 0.14); disc(g, x, y, w * 0.062, i < 7 ? '#fbf4e6' : null, RED, 2); if (i < 7) ICON.loaf(g, x, y, w * 0.1, '#b5806e', '#fbf4e6'); }
  T(g, 'ten stamps: a loaf on us', w / 2, h * 0.64, h * 0.05, INK, { f: F.caveat, w: 700, max: w * 0.84 }); T(g, 'it will keep till you are up', w / 2, h * 0.71, h * 0.045, INK, { f: F.caveat, w: 600, max: w * 0.84 });
  T(g, 'RULES', w / 2, h * 0.79, h * 0.034, RED, { f: F.bebas, ls: 3 }); T(g, '1. there is no rule 1    2. toast it on day two', w / 2, h * 0.845, h * 0.03, INK, { f: F.elite, max: w * 0.84 }); T(g, '3. never the fridge', w / 2, h * 0.895, h * 0.03, INK, { f: F.elite, max: w * 0.84 });
};
const WINCARD = (g, w, h) => {
  board(g, w, h, '#fbf4e6', RED, { inset: h * 0.05 }); T(g, 'Tomorrow', w / 2, h * 0.24, h * 0.25, RED, { f: F.pacifico, max: w * 0.84 }); T(g, 'BREAD', w / 2, h * 0.5, h * 0.2, INK, { f: F.abril, ls: h * 0.04 });
  line(g, [[w * 0.2, h * 0.635], [w * 0.8, h * 0.635]], RED, 2); T(g, 'baked before you are up', w / 2, h * 0.72, h * 0.085, INK, { f: F.fraunces, it: 1, w: 600, max: w * 0.84 }); T(g, 'and now: open when you are', w / 2, h * 0.86, h * 0.1, RED, { f: F.caveat, w: 700, max: w * 0.84 });
};
const INSIDE = (g, w, h) => { paper(g, w, h, PINK); T(g, 'you are inside.', w / 2, h * 0.3, h * 0.2, INK, { f: F.caveat, w: 700, max: w * 0.9 }); T(g, 'for years nobody got this far', w / 2, h * 0.58, h * 0.14, INK, { f: F.caveat, w: 600, max: w * 0.9 }); T(g, 'well done', w / 2, h * 0.82, h * 0.16, RED, { f: F.pacifico }); };
const ABOARD = (g, w, h) => {
  slate(g, w, h); chalk(g, 'OPEN', w / 2, h * 0.1, h * 0.14, '#f1efe6'); chalk(g, '(actually open)', w / 2, h * 0.2, h * 0.06, '#e8a8a0'); ICON.loaf(g, w / 2, h * 0.34, h * 0.2, '#e9c46a', '#252a28');
  chalk(g, 'country loaf, still warm', w / 2, h * 0.5, h * 0.075); chalk(g, 'cardamom knots at 3', w / 2, h * 0.6, h * 0.075, '#9fc6b0'); chalk(g, "yesterday's loaves ½ price", w / 2, h * 0.7, h * 0.07, '#e9c46a', { max: w * 0.9 });
  chalk(g, 'follow your nose', w / 2, h * 0.88, h * 0.075, '#e8a8a0');
};
const YEST = (g, w, h) => { paper(g, w, h, '#e9d9b8', 4); T(g, "YESTERDAY'S LOAVES", w / 2, h * 0.2, h * 0.22, RED, { f: F.bebas, ls: 2, max: w * 0.92 }); T(g, 'half price, twice the character', w / 2, h * 0.5, h * 0.22, INK, { f: F.caveat, w: 700, max: w * 0.92 }); T(g, 'toast · croutons · pappa al pomodoro · pain perdu', w / 2, h * 0.8, h * 0.13, INK, { f: F.fraunces, it: 1, max: w * 0.92 }); };

// ---- things to eat, built for the hand (feet; y up) --------------------------------------------------------
const mat3 = (T3, c, r = 0.85) => new T3.MeshStandardMaterial({ color: c, roughness: r });
const blob = (T3, g, r, c, s, p, rough) => { const m = new T3.Mesh(new T3.SphereGeometry(r, 12, 8), mat3(T3, c, rough)); m.scale.set(...s); m.position.set(...p); g.add(m); return m; };
const slab = (T3, g, w, hh, d, c, p, rough) => { const m = new T3.Mesh(new T3.BoxGeometry(w, hh, d), mat3(T3, c, rough)); m.position.set(...p); g.add(m); return m; };
const EAT = {
  knot: T3 => { const g = new T3.Group(), m = new T3.Mesh(new T3.TorusKnotGeometry(0.085, 0.045, 40, 7, 2, 3), mat3(T3, 0xb07c48, 0.5)); m.rotation.x = Math.PI / 2; m.scale.set(1, 1, 0.75); m.position.y = 0.08; g.add(m); for (let i = 0; i < 7; i++) blob(T3, g, 0.014, 0xf6f1e6, [1, 1, 1], [Math.cos(i * 2.4) * 0.08, 0.14 + (i % 2) * 0.012, Math.sin(i * 2.4) * 0.08]); return g; },
  bun: T3 => { const g = new T3.Group(); blob(T3, g, 0.16, 0xb98a55, [1, 0.62, 1], [0, 0.09, 0], 0.5); return g; },
  canele: T3 => { const g = new T3.Group(), m = new T3.Mesh(new T3.CylinderGeometry(0.06, 0.085, 0.17, 10), mat3(T3, 0x3e2314, 0.35)); m.position.y = 0.085; g.add(m); return g; },
  cookie: T3 => { const g = new T3.Group(), m = new T3.Mesh(new T3.CylinderGeometry(0.12, 0.125, 0.035, 14), mat3(T3, 0xb98c5c)); m.position.y = 0.02; g.add(m); for (let i = 0; i < 6; i++) blob(T3, g, 0.02, 0x2e1a10, [1, 0.5, 1], [Math.cos(i * 1.9) * 0.07 * (i % 2 ? 1 : 0.5), 0.04, Math.sin(i * 1.9) * 0.07 * (i % 2 ? 1 : 0.5)]); return g; },
  cake: T3 => { const g = new T3.Group(); for (let i = 0; i < 3; i++) { slab(T3, g, 0.2, 0.075, 0.42, 0xb9793a, [0, 0.04 + i * 0.1, 0]); slab(T3, g, 0.2, 0.026, 0.42, 0xf6efe2, [0, 0.09 + i * 0.1, 0], 0.5); } blob(T3, g, 0.03, 0xe0782a, [1, 0.7, 1.6], [0, 0.32, 0.08]); return g; },
  slice: T3 => { const g = new T3.Group(); slab(T3, g, 0.42, 0.06, 0.34, 0xe6d3a8, [0, 0.03, 0]); slab(T3, g, 0.44, 0.058, 0.02, 0x8a5a2a, [0, 0.03, 0.17]); slab(T3, g, 0.44, 0.058, 0.02, 0x8a5a2a, [0, 0.03, -0.17]); slab(T3, g, 0.3, 0.012, 0.24, 0xf3dc8a, [0, 0.066, 0], 0.3); return g; },
  heel: T3 => { const g = new T3.Group(); blob(T3, g, 0.2, 0x8a5a2a, [1, 0.8, 0.55], [0, 0.15, 0]); slab(T3, g, 0.3, 0.24, 0.02, 0xe6d3a8, [0, 0.15, 0.1]); return g; },
};

export default function bakery(kit, lot) {
  const K = tools(kit, 53), X = fixtures(kit, K), { ves, hcyl, ball, tube, jar, plate, bowl, potted } = K, G3 = kit.geom;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0), W = lot.W, D = lot.D;                    // room coordinates: x = a, y = d, z = height
  const eats = (kit.eats ??= []);
  const eat = (f, x, y, z, name, o) => { const [ex, ez] = kit.world(f, x, y); eats.push({ x: ex, y: f.h + z, z: ez, name, reach: 7, ...o }); };

  // ---- turning bread: every loaf is a list of [geometry, material] built about its own bottom centre -------
  const L = (prof, sx = 1, sy = 1, seg = 12) => G3.lathe(prof, { seg, sx, sy });
  const dome = (r, h) => [[0, 0], [r * 0.72, 0], [r * 0.97, h * 0.25], [r, h * 0.45], [r * 0.88, h * 0.72], [r * 0.55, h * 0.93], [0, h]];
  const zt = (u, v, rx, ry, h) => h * (0.45 + 0.55 * Math.sqrt(Math.max(0, 1 - (u / rx) ** 2 - (v / ry) ** 2)));
  const cut = (pts, rx, ry, h, r = 0.016) => G3.sweep(pts.map(([u, v]) => [u, v, zt(u, v, rx, ry, h) - r * 0.3]), r, { seg: 5 });
  const ring = (rad, n = 12) => Array.from({ length: n + 1 }, (_, i) => [Math.cos(i / n * 6.2832) * rad, Math.sin(i / n * 6.2832) * rad]);
  const up = (g, z, x = 0, y = 0) => G3.xf(g, { at: [x, y, z] });
  const dots = (n, fn, r = 0.012, seg = 4) => G3.merge(Array.from({ length: n }, (_, i) => { const [x, y, z, s = 1] = fn(i); return up(L([[0, 0], [r * s, r * 0.5 * s], [0, r * 1.1 * s]], 1, 1, seg), z, x, y); }));
  const LOAF = {
    boule(r = 0.34, col = CR1, score = 'cross', ear = PALE) {
      const h = r * 0.84, k = r * 0.52, out = [[L(dome(r, h), 1, 1, 14), col]];
      const ls = score === 'cross' ? [[[-k, 0], [0, 0], [k, 0]], [[0, -k], [0, 0], [0, k]]] : score === 'square' ? [[[-k, -k], [0, -k], [k, -k]], [[k, -k], [k, 0], [k, k]], [[k, k], [0, k], [-k, k]], [[-k, k], [-k, 0], [-k, -k]]].map(s => s.map(([u, v]) => [u * 0.8, v * 0.8]))
        : score === 'rings' ? [ring(r * 0.3), ring(r * 0.55), ring(r * 0.76, 16)] : [[[-k, -k * 0.5], [-k * 0.3, -k * 0.05], [k * 0.3, k * 0.1], [k, k * 0.5]]];
      for (const s of ls) out.push([cut(s, r, r, h, score === 'rings' ? 0.011 : 0.017), ear]);
      return out;
    },
    batard(len = 0.44, w = 0.21, col = CR1, n = 1) {
      const h = w * 1.1, out = [[L(dome(w, h), len / w, 1, 14), col]];
      if (n === 1) out.push([cut([[-len * 0.62, -0.02], [-len * 0.2, 0.02], [len * 0.2, -0.02], [len * 0.62, 0.02]], len, w, h), PALE]);
      else for (let i = 0; i < n; i++) { const u = (i - (n - 1) / 2) * len * 1.3 / n; out.push([cut([[u - 0.07, -w * 0.45], [u, 0], [u + 0.07, w * 0.45]], len, w, h, 0.014), PALE]); }
      return out;
    },
    tin(col = CR1, top = CR2, seeds = false, len = 0.42) {
      const out = [[G3.softBox(-len, len, -0.19, 0.19, 0, 0.3, 0.04), col], [up(L(dome(0.2, 0.2), len / 0.2 * 1.02, 1.04, 12), 0.2), top]];
      if (seeds) { out.push([dots(22, i => [((i * 37) % 22 / 22 - 0.5) * len * 1.5, ((i * 13) % 7 / 7 - 0.5) * 0.24, 0.2 + zt(((i * 37) % 22 / 22 - 0.5) * len * 1.5, ((i * 13) % 7 / 7 - 0.5) * 0.24, len * 1.02, 0.208, 0.2) - 0.006, 1.2]), 'c#efe2bc/0.8']); out.push([dots(14, i => [((i * 29) % 14 / 14 - 0.5) * len * 1.4, ((i * 11) % 5 / 5 - 0.5) * 0.2, 0.2 + zt(((i * 29) % 14 / 14 - 0.5) * len * 1.4, ((i * 11) % 5 / 5 - 0.5) * 0.2, len * 1.02, 0.208, 0.2) - 0.006, 1.1]), 'c#17140f/0.8']); }
      return out;
    },
    mie() { return [[G3.softBox(-0.44, 0.44, -0.19, 0.19, 0, 0.38, 0.025), 'c#b08a5a/0.8'], [G3.softBox(-0.445, 0.445, -0.14, 0.14, 0.02, 0.36, 0.02), 'c#c9a77a/0.8']]; },
    focaccia() { return [[G3.softBox(-0.62, 0.62, -0.42, 0.42, 0, 0.13, 0.05), 'c#c9952a/0.8'], [dots(18, i => [(i % 6 - 2.5) * 0.19, (Math.floor(i / 6) - 1) * 0.24 + (i % 2) * 0.05, 0.125, 2.6], 0.012, 6), CR2], [G3.merge(Array.from({ length: 14 }, (_, i) => { const x = ((i * 31) % 14 / 14 - 0.5) * 1.05, y = ((i * 17) % 9 / 9 - 0.5) * 0.66, a = i * 1.3; return G3.sweep([[x, y, 0.137], [x + Math.cos(a) * 0.07, y + Math.sin(a) * 0.07, 0.14]], 0.008, { seg: 3 }); })), 'c#4a6e38/0.8'], [dots(16, i => [((i * 23) % 16 / 16 - 0.5) * 1.1, ((i * 7) % 11 / 11 - 0.5) * 0.7, 0.13, 0.6]), WHITE]]; },
    ciabatta() { return [[G3.softBox(-0.5, 0.5, -0.22, 0.22, 0, 0.17, 0.08), PALE], [G3.softBox(-0.4, 0.38, -0.15, 0.13, 0.1, 0.178, 0.05), FLOUR]]; },
    bagel(seed = 'c#efe2bc/0.8') { return [[G3.sweep(ring(0.115, 10).map(([u, v]) => [u, v, 0.06]), 0.062, { seg: 7 }), 'c#a8784a/0.45'], [dots(14, i => [Math.cos(i * 0.45) * (0.1 + (i % 3) * 0.015), Math.sin(i * 0.45) * (0.1 + (i % 3) * 0.015), 0.116, 0.9]), seed]]; },
    bun(r = 0.15, col = BUN) { return [[L(dome(r, r * 0.9), 1, 1, 10), col]]; },
    brioche() { return [[L([[0, 0], [0.09, 0], [0.19, 0.14], [0.17, 0.2], [0, 0.22]], 1, 1, 10), GOLD], [up(L(dome(0.095, 0.13), 1, 1, 10), 0.17), 'c#a8784a/0.45']]; },
    knot() { return [[G3.sweep(Array.from({ length: 13 }, (_, i) => { const a = i / 12 * 12.566, rr = 0.1 - 0.05 * i / 12; return [Math.cos(a) * rr, Math.sin(a) * rr, 0.05 + 0.075 * i / 12]; }), 0.047, { seg: 6, caps: true }), 'c#a8784a/0.45'], [dots(6, i => [Math.cos(i * 2.2) * 0.07, Math.sin(i * 2.2) * 0.07, 0.135 + (i % 2) * 0.02, 1.1]), WHITE]]; },
    swirl() { return [[L([[0, 0], [0.14, 0], [0.155, 0.03], [0.15, 0.085], [0, 0.085]], 1, 1, 12), BUN], [G3.sweep(Array.from({ length: 15 }, (_, i) => { const a = i / 14 * 12.566, rr = 0.02 + 0.105 * i / 14; return [Math.cos(a) * rr, Math.sin(a) * rr, 0.085]; }), 0.016, { seg: 4 }), CR3], [up(L([[0, 0], [0.07, 0], [0.05, 0.012], [0, 0.014]], 1.2, 0.8, 8), 0.09), WHITE]]; },
    canele() { return [[L([[0, 0], [0.07, 0], [0.085, 0.02], [0.075, 0.15], [0.06, 0.17], [0.03, 0.165], [0, 0.15]], 1, 1, 9), 'c#3a2214/0.45']]; },
    cookie() { return [[L([[0, 0], [0.105, 0], [0.115, 0.015], [0.1, 0.032], [0, 0.036]], 1, 1, 10), PALE], [dots(5, i => [Math.cos(i * 1.9) * 0.06, Math.sin(i * 1.9) * 0.06, 0.03, 1.6]), 'c#3a2214/0.8']]; },
    financier() { return [[G3.softBox(-0.14, 0.14, -0.07, 0.07, 0, 0.075, 0.02), GOLD]]; },
  };
  // set a loaf down at (x, y, z) in a frame: turned by rz, then tipped by rx (for the slanted racks)
  const set = (f, list, x, y, z, rz = 0, rx = 0) => { for (const [g, m] of list) { if (rz) G3.xf(g, { rz }); if (rx) G3.xf(g, { rx }); K.put(f, g, m, x, y, z); } };
  const wood = (f, mat, g, t) => kit.put(f, snapMat(mat), g, t);
  const baguette = (f, x, y, z, dx, dy, len = 2.1, col = CR1) => tube(f, col, [[x, y, z], [x + dx * 0.25, y + dy * 0.25, z + len * 0.25], [x + dx * 0.5, y + dy * 0.5, z + len * 0.5], [x + dx * 0.75, y + dy * 0.75, z + len * 0.75], [x + dx, y + dy, z + len]], t => 0.04 + 0.062 * Math.sin(Math.PI * t) ** 0.5, 7, true);
  const basket = (f, x, y, z, r, h, sx = 1) => K.put(f, L([[0, 0], [r * 0.78, 0], [r, h], [r * 0.95, h], [r * 0.74, 0.05], [0, 0.05]], sx, 1, 16), 'wicker', x, y, z);
  const stand = (f, x, y, z, r, hs) => ves(f, PORC, x, y, z, [[0, 0], [r * 0.5, 0], [r * 0.55, 0.03], [0.06, 0.08], [0.05, hs - 0.06], [r, hs - 0.025], [r, hs], [0, hs]], 18);
  const cloche = (f, x, y, z, r, h) => { ves(f, 'glass', x, y, z, [[r, 0], [r, h * 0.5], [r * 0.9, h * 0.78], [r * 0.6, h * 0.95], [0.03, h], [0, h]], 18); ball(f, BRASS, x, y, z + h, 0.045, 8); };
  const layerCake = (f, x, y, z, r, n, sponge, cream, top) => { for (let i = 0; i < n; i++) { f.cyl(sponge, x, y, z + i * 0.15, z + i * 0.15 + 0.115, r, r, 20); f.cyl(cream, x, y, z + i * 0.15 + 0.115, z + i * 0.15 + 0.15, r + 0.008, r + 0.008, 20); } const zz = z + n * 0.15; f.cyl(top, x, y, zz, zz + 0.03, r + 0.01, r - 0.02, 20); return zz + 0.03; };

  // ---- the counter: across the back left, customers on the street side -------------------------------------
  const c = at(7.2, 17, 0, 'street');                          // +x toward smaller a (the left wall); +y the customers' side
  const TOP = X.counter(c, -6.6, 6.6, -2.4, 0, 3.4, { front: BLUSH, top: 'marble' });
  kit.sign(c, 0.4, 0.012, 1.85, 6.6, 0.95, (g, w, h) => { board(g, w, h, '#fbf4e6', RED, { inset: h * 0.1 }); T(g, 'BREAD · BUNS · PIES · NO EXCUSES', w / 2, h * 0.5, h * 0.36, RED, { f: F.bebas, ls: 4, max: w * 0.88 }); }, { cw: 660, ch: 96 });
  // case one: pastry, on two levels
  X.glassCase(c, 2.0, 6.3, -1.75, -0.25, TOP, 1.3, { shelf: 0.64 });
  { const z = TOP + 0.03, z2 = TOP + 0.64, tray = (x, zz, w = 0.7) => c.box('c#c9ccd0/0.45/1', x - w / 2, x + w / 2, -1.6, -0.5, zz, zz + 0.012);
    for (const x of [5.85, 5.0, 4.15, 3.3, 2.45]) tray(x, z);
    for (const [y, t] of [[-1.3, 0.3], [-0.98, 2.0], [-0.66, 4.1]]) kit.model('croissant', c, 5.85, y, z + 0.02, 0, { turn: t });
    for (let i = 0; i < 6; i++) set(c, LOAF.knot(), 4.83 + (i % 2) * 0.34, -1.38 + Math.floor(i / 2) * 0.36, z + 0.012, i * 1.1);
    for (let i = 0; i < 4; i++) set(c, LOAF.swirl(), 3.97 + (i % 2) * 0.36, -1.28 + Math.floor(i / 2) * 0.46, z + 0.012, i * 0.8);
    for (let i = 0; i < 9; i++) set(c, LOAF.canele(), 3.08 + (i % 3) * 0.22, -1.36 + Math.floor(i / 3) * 0.3, z + 0.012);
    for (let i = 0; i < 12; i++) set(c, LOAF.cookie(), 2.3 + (i % 2) * 0.3, -1.3 + Math.floor(i / 2 % 2) * 0.42, z + 0.012 + Math.floor(i / 4) * 0.037, i);
    [['croissant', '4'], ['cardamom knot', '4½'], ['cinnamon swirl', '4'], ['canelé', '3'], ['rye & salt cookie', '3']].forEach(([n, p], i) => X.card(c, 5.85 - i * 0.85, -0.37, z, 0.66, 0.3, TICKET(n, p), { cw: 150, ch: 68 }));
    for (const [x, y] of [[5.95, -1.2], [5.6, -1.0], [5.9, -0.75]]) kit.model('st_jam_tart', c, x, y, z2 + 0.005);
    for (const [x, t] of [[4.95, 0.2], [4.6, -0.3]]) kit.model('st_pastry_1', c, x, -1.05, z2 + 0.005, 0, { turn: t });
    for (let i = 0; i < 5; i++) set(c, LOAF.bun(0.14), 3.5 + (i % 3) * 0.3 + Math.floor(i / 3) * 0.15, -1.25 + Math.floor(i / 3) * 0.3, z2 + 0.003);
    for (let i = 0; i < 8; i++) set(c, LOAF.financier(), 2.42 + (i % 2) * 0.33, -1.42 + Math.floor(i / 2) * 0.22, z2 + 0.003);
    [['jam tart', '3½'], ['hand pie', '4½'], ['milk bun', '2'], ['financier', '2½']].forEach(([n, p], i) => X.card(c, 5.78 - i * 1.07 + (i > 1 ? 0.2 : 0), -0.42, z2, 0.6, 0.27, TICKET(n, p), { cw: 140, ch: 62 }));
    eat(c, 5.85, -0.98, z + 0.1, 'croissant', { model: 'croissant', note: 'You finish the croissant. Eighty-one layers; you counted about six before it was gone.' });
    eat(c, 5.0, -1.02, z + 0.1, 'cardamom knot', { build: EAT.knot, note: 'You finish the cardamom knot. Somewhere up the street Juniper feels a disturbance.' });
    eat(c, 3.3, -1.06, z + 0.1, 'canelé', { build: EAT.canele, bites: 2, note: 'You finish the canelé. Burnt sugar outside, custard inside, rum somewhere.' });
    eat(c, 5.8, -1.0, z2 + 0.1, 'jam tart', { model: 'st_jam_tart', note: 'You finish the jam tart. The jam was plum, from the Yard tree.' });
  }
  // case two: cakes
  X.glassCase(c, -2.7, 1.6, -1.75, -0.25, TOP, 1.6);
  { const z = TOP + 0.03, flag = (x, y, zz, txt) => { c.cyl('c#c9a77a/0.8', x, y, zz, zz + 0.36, 0.008, 0.008, 4); kit.sign(c, x, y + 0.012, zz + 0.44, 0.62, 0.26, (g, w, h) => { paper(g, w, h, PINK); T(g, 'SPOKEN FOR', w / 2, h * 0.3, h * 0.3, RED, { f: F.bebas, ls: 1 }); T(g, txt, w / 2, h * 0.7, h * 0.36, INK, { f: F.caveat, w: 700, max: w * 0.9 }); }, { cw: 150, ch: 62 }); };
    stand(c, 1.0, -1.0, z, 0.46, 0.3); kit.model('carrot_cake', c, 1.0, -1.0, z + 0.3);
    stand(c, -0.05, -1.05, z, 0.44, 0.42); { const t = layerCake(c, -0.05, -1.05, z + 0.42, 0.33, 4, 'c#c9a77a/0.8', WHITE, WHITE); for (let i = 0; i < 9; i++) ball(c, 'c#c8202a/0.45', -0.05 + Math.cos(i * 0.7) * 0.25, -1.05 + Math.sin(i * 0.7) * 0.25, t, 0.045, 7); flag(-0.05, -1.05, t, 'Otis'); }
    stand(c, -1.05, -1.0, z, 0.44, 0.3); { const t = layerCake(c, -1.05, -1.0, z + 0.3, 0.33, 4, 'c#3a2214/0.8', 'c#e8907a/0.8', 'c#3a2214/0.45'); for (let i = 0; i < 7; i++) ball(c, WHITE, -1.05 + Math.cos(i * 0.9) * 0.24, -1.0 + Math.sin(i * 0.9) * 0.24, t, 0.04, 7, 1.4); flag(-1.05, -1.0, t, 'also Otis'); }
    stand(c, -2.1, -1.0, z, 0.46, 0.24); kit.model('strawberry_chocolate_cake', c, -2.1, -1.0, z + 0.24);
    [[1.0, 'carrot cake', 'slice 5'], [-0.05, 'lemon & elderflower', 'ask Otis'], [-1.05, 'chocolate & sour cherry', 'ask Otis'], [-2.1, 'strawberry chocolate', 'slice 5½']].forEach(([x, n, p]) => X.card(c, x, -0.4, z, 0.84, 0.32, TICKET(n, p), { cw: 190, ch: 72 }));
    eat(c, 0.62, -0.75, z + 0.1, 'slice of carrot cake', { build: EAT.cake, bites: 4, note: 'You finish the carrot cake. The frosting had a little orange in it. You had suspected.' });
    c.cyl(PORC, 0.62, -0.7, z, z + 0.02, 0.24, 0.24, 14); for (let i = 0; i < 3; i++) { c.box('c#b08a5a/0.8', 0.53, 0.71, -0.88, -0.52, z + 0.022 + i * 0.1, z + 0.095 + i * 0.1); c.box(WHITE, 0.53, 0.71, -0.88, -0.52, z + 0.095 + i * 0.1, z + 0.122 + i * 0.1); }
  }
  // the till (pink enamel), the bread-club cards, the baguettes
  { const x = -3.75, y = -1.3, z = TOP;
    c.soft('c#e8907a/0.45', x - 0.58, x + 0.58, y - 0.5, y + 0.5, z, z + 0.45, 0.06); c.soft('c#e8907a/0.45', x - 0.53, x + 0.53, y - 0.5, y + 0.05, z + 0.45, z + 1.0, 0.09); c.box(BRASS, x - 0.6, x + 0.6, y - 0.52, y + 0.52, z, z + 0.05);
    for (let i = 0; i < 12; i++) c.cyl(i % 4 === 3 ? 'c#8a1c1c/0.45' : 'c#f4f1ea/0.45', x - 0.36 + (i % 4) * 0.24, y + 0.16 + Math.floor(i / 4) * 0.1, z + 0.45, z + 0.5 + (2 - Math.floor(i / 4)) * 0.04, 0.05, 0.05, 8);
    kit.sign(c, x, y + 0.06, z + 0.78, 0.8, 0.3, (g, w, h) => { fill(g, w, h, '#fbf4e6'); T(g, 'DOUGH, PLEASE', w / 2, h / 2, h * 0.46, RED, { f: F.bebas, ls: 2 }); }, { cw: 150, ch: 56 });
    for (let k = 0; k < 12; k++) c.box(k % 2 ? 'c#e8907a/0.8' : 'c#f4f1ea/0.8', -3.2, -2.86, -0.75, -0.25, z + k * 0.008, z + k * 0.008 + 0.007);
    kit.sign(c, -3.03, -0.5, z + 0.1, 0.33, 0.48, (g, w, h) => { fill(g, w, h, '#f3d9cf'); T(g, 'BREAD', w / 2, h * 0.2, h * 0.16, RED, { f: F.abril }); T(g, 'CLUB', w / 2, h * 0.38, h * 0.16, RED, { f: F.abril }); for (let i = 0; i < 10; i++) disc(g, w * (0.18 + (i % 5) * 0.16), h * (0.6 + Math.floor(i / 5) * 0.16), w * 0.055, i < 3 ? '#b5806e' : null, RED, 1.5); }, { cw: 80, ch: 116, flat: true });
    X.card(c, -3.03, -0.14, z, 0.9, 0.36, TAG('bread club: take a card, 10 stamps = a loaf'), { cw: 230, ch: 92 });
    basket(c, -5.6, -1.2, z, 0.5, 1.0); for (let i = 0; i < 9; i++) { const a = i * 0.7; baguette(c, -5.6 + Math.cos(a) * 0.14, -1.2 + Math.sin(a) * 0.14, z + 0.08, Math.cos(a) * 0.34, Math.sin(a) * 0.34, 2.0 + (i % 3) * 0.12, i % 3 ? CR1 : CR2); }
    X.card(c, -5.6, -0.42, z, 1.5, 0.42, BREADTAG('BAGUETTE', 'poolish overnight · 68% water · baked dark, as intended', '3'), { cw: 360, ch: 100 });
    lot.pickup = { xz: kit.world(c, -4.55, -0.6), y: c.h + TOP };
  }
  for (const x of [-4.4, 0, 4.4]) X.pendant(c, x, -0.9, { kind: 'dome', drop: 4.6, colour: 'c#e8907a/0.45', power: 1.0 });
  // the cookie jar, at the right height for the right people
  kit.model('st_stool_8_pine', c, -5.3, 0.95, 0, 0, { collide: true });
  jar(c, -5.3, 0.95, 2.0, 0.3, 0.6, null, 0, 'c#8a1c1c/0.45'); ball(c, 'c#8a1c1c/0.45', -5.3, 0.95, 2.65, 0.06, 8);
  for (let i = 0; i < 10; i++) set(c, LOAF.cookie(), -5.3 + Math.cos(i * 2.1) * 0.1, 0.95 + Math.sin(i * 2.1) * 0.1, 2.02 + i * 0.037, i);
  kit.sign(c, -5.3, 1.5, 1.2, 1.0, 0.82, (g, w, h) => { paper(g, w, h, PINK); T(g, 'COOKIE JAR', w / 2, h * 0.17, h * 0.2, RED, { f: F.abril, max: w * 0.9 }); T(g, 'for persons under four feet', w / 2, h * 0.42, h * 0.13, INK, { f: F.caveat, w: 700, max: w * 0.9 }); T(g, '(and robots under four feet)', w / 2, h * 0.6, h * 0.11, INK, { f: F.caveat, w: 600, max: w * 0.9 }); T(g, 'one each. we trust you. mostly', w / 2, h * 0.83, h * 0.12, RED, { f: F.caveat, w: 700, max: w * 0.9 }); }, { cw: 240, ch: 196 });
  eat(c, -5.3, 0.95, 2.72, 'cookie from the jar', { build: EAT.cookie, bites: 2, note: 'You finish the cookie. Rye, dark chocolate, a flake of salt. You are over four feet. Nobody says anything.' });

  // ---- the bread wall: four slanted racks, every bread labelled --------------------------------------------
  const b = at(7.2, D, 0, 'street');
  const TH = -0.56, CS = Math.cos(TH), SN = Math.sin(TH), SHZ = [7.35, 6.0, 4.65, 3.3], X0 = -6.1, X1 = 6.1;
  b.box(PALEW, X0, X1, 0.01, 0.06, 0, 9.0, G); for (let i = 0; i <= 4; i++) { const x = X0 + (X1 - X0) * i / 4; b.box(OAK, x - 0.05, x + 0.05, 0.01, 1.3, 0, 9.0, G); }
  b.box(OAK, X0 - 0.08, X1 + 0.08, 0.01, 1.36, 9.0, 9.12, G); b.box(CREAM, X0 + 0.05, X1 - 0.05, 0.06, 1.24, 0, 2.3, G); b.box(OAK, X0, X1, 0.06, 1.34, 2.3, 2.4, G); b.block(X0, X1, 0, 1.3, 0, 7);
  for (let i = 0; i < 4; i++) { const x = X0 + (i + 0.5) * (X1 - X0) / 4; for (const s of [-1, 1]) { b.box(CREAM, x + s * 0.72 - 0.62, x + s * 0.72 + 0.62, 1.24, 1.275, 0.4, 2.1, G); b.cyl(BRASS, x + s * 0.2, 1.3, 1.3, 1.36, 0.04, 0.04, 8); } }
  for (const zb of SHZ) { wood(b, OAK, G3.bev(X0 + 0.06, X1 - 0.06, 0, 1.15, -0.07, 0, 0.01), { rx: TH, at: [0, 0.1, zb] }); wood(b, OAK, G3.bev(X0 + 0.06, X1 - 0.06, 1.15, 1.19, -0.07, 0.13, 0.01), { rx: TH, at: [0, 0.1, zb] }); }
  kit.sign(b, 0, 0.03, 9.95, 9.4, 1.3, (g, w, h) => { board(g, w, h, '#fbf4e6', RED, { inset: h * 0.09 }); T(g, 'the bread wall', w / 2, h * 0.42, h * 0.5, RED, { f: F.pacifico }); T(g, 'FLOUR · WATER · SALT · TIME · AND DORIS', w / 2, h * 0.82, h * 0.14, INK, { f: F.bebas, ls: 4 }); for (const k of [-1, 1]) ICON.loaf(g, w / 2 + k * w * 0.36, h * 0.45, h * 0.5, '#b5806e', '#fbf4e6'); }, { cw: 940, ch: 130 });
  // each: name, note, price, how many, spacing, a maker, and how each one is turned on the shelf
  const BREADS = [
    ['MICHE', '2 kg wheel · high-extraction flour · sold by the quarter · best on day 3', '6 / qtr', 2, 1.25, () => LOAF.boule(0.54, CR3, 'rings', FLOUR), 0],
    ['WALNUT LEVAIN', 'toasted walnuts, 20% · the crumb goes purple: that is the walnuts', '10', 3, 0.84, () => LOAF.boule(0.33, CR3, 'square'), 0.4],
    ['OLIVE & LEMON', 'green and black olives, zest, thyme · 76% · do not toast, tear', '10', 3, 0.84, () => LOAF.batard(0.4, 0.22, CR2, 3), 1.5708],
    ['SPELT & HONEY', 'wholegrain spelt 40% · a spoon of honey · gentle, nutty', '9', 3, 0.84, () => LOAF.boule(0.31, CR1, 'slash'), 0.7],
    ['COUNTRY LOAF', '78% water · 20% wholewheat · levain fed 4 h before the mix', '9', 3, 0.86, () => LOAF.boule(0.36, CR2, 'cross'), 0.5],
    ['BÂTARD', 'the country dough, shaped long · one score, one ear · 78%', '8', 4, 0.64, () => LOAF.batard(0.42, 0.2, CR1, 1), 1.5708],
    ['DARK RYE', '100% rye · seeds soaked overnight · wait a day before you slice it', '9', 3, 0.9, () => LOAF.tin(RYE, RYE, true, 0.36), 1.5708],
    ['SEEDED TIN', 'sunflower, flax, sesame, oats · scalded · toasts like a dream', '8', 3, 0.9, () => LOAF.tin(CR1, CR2, true, 0.4), 1.5708],
    ['CIABATTA', 'biga 16 hours · 82% water · no, we cannot slice it', '5', 3, 0.86, () => LOAF.ciabatta(), 1.5708],
    ['FOCACCIA', '80% · olive oil, rosemary, flaky salt · dimpled by hand', '5 / slab', 2, 1.4, () => LOAF.focaccia(), 0],
    ['SESAME SEMOLINA', 'half durum semolina · sesame crust · golden inside', '9', 3, 0.84, () => LOAF.batard(0.4, 0.22, 'c#c9952a/0.8', 4), 1.5708],
    ['PAIN DE MIE', 'milk, butter, a lidded tin · square, for sandwiches & soldiers', '7', 3, 0.9, () => LOAF.mie(), 1.5708],
    ['BRIOCHE À TÊTE', 'butter at 50% of the flour (yes) · eggs · proofed slow and cold', '4', 8, 0.48, () => LOAF.brioche(), 0],
    ['BAGELS', 'boiled in malted water, then baked · chewy on purpose', '2½', 10, 0.4, () => LOAF.bagel(), 0],
    ['MILK BUNS', 'tangzhong · soft as a pillow · Bao fills them, ask next door', '2', 10, 0.4, () => LOAF.bun(0.16), 0],
    ['MORNING ROLLS', 'the country dough, small · crackly · gone by nine', '1½', 10, 0.4, () => LOAF.boule(0.17, CR1, 'slash'), 0.9],
  ];
  BREADS.forEach(([name, note, price, n, sp, make, rz], k) => {
    const zb = SHZ[Math.floor(k / 4)], xc = X1 - (k % 4 + 0.5) * (X1 - X0) / 4, two = n > 5, per = two ? n / 2 : n;
    for (let i = 0; i < n; i++) { const row = two ? Math.floor(i / per) : 0, s = two ? 0.3 + row * 0.5 : 0.58, x = xc + (i % per - (per - 1) / 2) * sp + (row ? sp * 0.3 : 0); set(b, make(), x, 0.1 + s * CS, zb + s * SN, rz + (i % 3 - 1) * 0.18, TH); }
    kit.sign(b, xc, 0.1 + 1.2 * CS + 0.04, zb + 1.2 * SN + 0.0, 2.7, 0.42, BREADTAG(name, note, price), { cw: 446, ch: 76, rough: 0.9 });
  });

  // ---- the oven: three decks, the middle door down ---------------------------------------------------------
  const o = at(19, D, 0, 'street');
  { const F0 = 2.3, F1 = 3.0;
    for (const [x, y] of [[-3.4, 0.25], [3.4, 0.25], [-3.4, 2.75], [3.4, 2.75]]) o.box(STEEL, x - 0.1, x + 0.1, y - 0.1, y + 0.1, 0, 1.5);
    o.box(STEEL, -3.5, 3.5, 0.15, 2.85, 0.5, 0.56); for (let i = 0; i < 5; i++) basket(o, -2.6 + i * 1.3, 1.5, 0.56, 0.42, 0.3);
    o.box(ENAMEL, -3.6, 3.6, 0.02, F0, 1.5, 7.1); o.box(ENAMEL, -3.6, 3.6, F0, F1, 1.5, 3.58); o.box(ENAMEL, -3.6, 3.6, F0, F1, 4.9, 7.1); o.box(ENAMEL, 2.9, 3.6, F0, F1, 3.58, 4.9); o.box(ENAMEL, -3.6, -2.5, F0, F1, 3.58, 4.9);
    o.box('c#17140f/0.8', -2.5, 2.9, F0 + 0.02, F0 + 0.04, 3.6, 4.9);
    kit.sign(o, 0.2, F0 + 0.05, 4.25, 5.4, 1.3, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, '#fff0b0'); gr.addColorStop(0.16, '#ffb040'); gr.addColorStop(0.5, '#e8601c'); gr.addColorStop(1, '#5a1608'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) { const x = (i * 97 % 260) / 260 * w, r2 = h * (0.12 + (i * 31 % 10) / 40), rg = g.createRadialGradient(x, h, 0, x, h, r2 * 2.2); rg.addColorStop(0, 'rgba(255,236,170,.55)'); rg.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = rg; g.fillRect(x - r2 * 2.2, h - r2 * 2.2, r2 * 4.4, r2 * 2.2); }
      for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(40,10,4,.28)'; g.fillRect(i * w / 8 - 2, 0, 4, h * 0.55); } const ed = g.createLinearGradient(0, 0, w, 0); ed.addColorStop(0, 'rgba(20,6,2,.75)'); ed.addColorStop(0.08, 'rgba(20,6,2,0)'); ed.addColorStop(0.92, 'rgba(20,6,2,0)'); ed.addColorStop(1, 'rgba(20,6,2,.75)'); g.fillStyle = ed; g.fillRect(0, 0, w, h); }, { cw: 432, ch: 104, glow: 1.5 });                                          // the mouth
    o.box('c#9a9590/0.8', -2.5, 2.9, F0 + 0.05, F1 + 0.02, 3.58, 3.68);                               // the hearth stone
    for (let i = 0; i < 5; i++) set(o, [[L(dome(0.33, 0.3), 1, 1, 12), 'c#6a4a2a/0.8']], -1.9 + i * 1.0, 2.7, 3.68);
    o.box(STEEL, -2.5, 2.9, F1, F1 + 1.0, 3.5, 3.57); hcyl(o, STEEL, 'x', 0.2, F1 + 0.95, 3.42, 4.8, 0.035);    // the door, let down
    for (const [z0, z1] of [[1.8, 3.25], [5.25, 6.75]]) { o.box(STEEL, -2.5, 2.9, F1, F1 + 0.06, z0, z1); o.box('c#17140f/0.45', -2.1, 2.5, F1 + 0.06, F1 + 0.07, (z0 + z1) / 2 - 0.2, (z0 + z1) / 2 + 0.2); o.box(GLOW, -2.0, 2.4, F1 + 0.07, F1 + 0.082, (z0 + z1) / 2 - 0.1, (z0 + z1) / 2 + 0.1); hcyl(o, STEEL, 'x', 0.2, F1 + 0.22, z1 - 0.22, 4.8, 0.035); for (const x of [-2.1, 2.5]) o.box(STEEL, x - 0.03, x + 0.03, F1 + 0.06, F1 + 0.22, z1 - 0.25, z1 - 0.19); }
    for (const z of [3.42, 5.08, 6.92]) o.box(STEEL, -3.62, 3.62, F1, F1 + 0.02, z - 0.04, z + 0.04);
    kit.sign(o, -3.05, F1 + 0.012, 4.25, 0.86, 1.2, (g, w, h) => { fill(g, w, h, '#d8d9d6'); for (const [y, t, v] of [[0.2, 'TOP', '250°'], [0.5, 'SOLE', '240°'], [0.8, 'STEAM', '8 s']]) { disc(g, w * 0.3, h * y, w * 0.2, '#1d1b18', '#8a8a86', 2); line(g, [[w * 0.3, h * y], [w * 0.3 + w * 0.14, h * y - w * 0.1]], '#f6efdc', 3); T(g, t, w * 0.74, h * (y - 0.045), h * 0.05, '#1d1b18', { f: F.bebas, ls: 1 }); T(g, v, w * 0.74, h * (y + 0.035), h * 0.075, '#b3261e', { f: F.elite }); } }, { cw: 110, ch: 154 });
    kit.sign(o, 0.2, F1 + 0.03, 7.0 - 0.02, 2.6, 0.17, (g, w, h) => { fill(g, w, h, '#b08d4a'); T(g, 'VESTA No. 3 · THREE DECK · STONE SOLE', w / 2, h / 2, h * 0.62, '#2a1c13', { f: F.bebas, ls: 3, max: w * 0.94 }); }, { cw: 380, ch: 26 });
    o.box(STEEL, -3.75, 3.75, 0.02, 3.7, 7.1, 7.22); kit.put(o, snapMat(STEEL), G3.xf(G3.lathe([[2.6, 0], [0.5, 1.1], [0.5, 1.15], [0, 1.15]], { seg: 4 }), { rz: Math.PI / 4 }), { s: [2.04, 1, 1], at: [0, 1.9, 7.22] }); o.cyl(STEEL, 0, 1.9, 8.3, 11.95, 0.42, 0.42, 14);
    o.block(-3.6, 3.6, 0, 4.0, 0, 7); kit.lampAt(o, 0.2, 4.3, 4.3, 0.75); kit.lamps[kit.lamps.length - 1].halo = 0.5;
    { const [sx, sz] = kit.world(o, 0.2, 3.3); kit.steam.push({ x: sx, y: o.h + 4.7, z: sz }); }
    // the peel, leaning in the gap between the racks and the oven
    tube(o, PALEW, [[4.75, 0.95, 0.03], [4.75, 0.3, 5.2]], 0.045, 6, true); wood(o, PALEW, G3.bev(-0.5, 0.5, -0.025, 0.025, -0.1, 1.35, 0.02), { rx: 0.125, at: [4.75, 0.3, 5.2] });
    // a clock that somebody actually looks at
    kit.model('wall_clock', o, 4.75, 0.08, 8.6, 0, { hang: true });
  }

  // ---- the right wall, back to front: mixer, the bench, the trolley, flour, club, the recipe ---------------
  const r = at(W, 0, 0, 'left');                               // x = d (toward the back); +y out from the right wall
  { // the spiral mixer
    const x = 19.8; r.soft('c#e8e2d4/0.45', x - 0.68, x + 0.68, 0.1, 2.0, 0, 0.5, 0.06); r.soft('c#e8e2d4/0.45', x - 0.5, x + 0.5, 0.1, 0.75, 0.5, 3.7, 0.08); r.soft('c#e8e2d4/0.45', x - 0.45, x + 0.45, 0.1, 1.7, 3.0, 3.7, 0.1);
    ves(r, STEEL, x, 1.3, 0.5, [[0, 0], [0.5, 0], [0.62, 0.12], [0.64, 1.0], [0.6, 1.0], [0.58, 0.16], [0, 0.1]], 22); ves(r, DOUGH, x, 1.3, 0.62, [[0, 0], [0.57, 0], [0.5, 0.4], [0.25, 0.52], [0, 0.5]], 14);
    tube(r, STEEL, [[x, 1.3, 3.0], [x, 1.3, 2.0], [x + 0.2, 1.35, 1.6], [x - 0.1, 1.2, 1.25], [x + 0.15, 1.3, 1.0]], 0.045, 6, true); r.cyl(STEEL, x, 1.3, 1.52, 1.56, 0.68, 0.68, 22);
    r.cyl('c#8a1c1c/0.45', x + 0.2, 0.78, 2.4, 2.52, 0.07, 0.07, 10); r.cyl('c#5d8a3a/0.45', x - 0.2, 0.78, 2.4, 2.52, 0.07, 0.07, 10);
    kit.sign(r, x, 1.712, 3.36, 0.8, 0.34, (g, w, h) => { fill(g, w, h, '#e8e2d4'); T(g, 'BIG BERTHA', w / 2, h * 0.38, h * 0.4, RED, { f: F.abril, max: w * 0.9 }); T(g, '40 kg · 2 speeds · 1 mood', w / 2, h * 0.78, h * 0.2, INK, { f: F.elite, max: w * 0.9 }); }, { cw: 190, ch: 80 });
    r.block(x - 0.7, x + 0.7, 0, 2.0, 0, 3.7);
  }
  { // the bench
    const x0 = 13, x1 = 18.6, z = 3.0;
    r.box(PALEW, x0, x1, 0.05, 2.45, z - 0.2, z, G); for (const x of [x0 + 0.15, x1 - 0.15]) for (const y of [0.2, 2.3]) r.box(STEEL, x - 0.07, x + 0.07, y - 0.07, y + 0.07, 0, z - 0.2);
    r.box(STEEL, x0 + 0.1, x1 - 0.1, 0.15, 2.35, 0.8, 0.86); r.block(x0, x1, 0, 2.45, 0, z);
    for (const [x, col] of [[14.0, WHITE], [15.4, WHITE], [16.8, 'c#c9a77a/0.8']]) { ves(r, 'c#f4f1ea/0.45', x, 1.25, 0.86, [[0, 0], [0.5, 0], [0.6, 1.2], [0.56, 1.2], [0.47, 0.05], [0, 0.05]], 16); ves(r, col, x, 1.25, 0.9, [[0, 0], [0.56, 0.9], [0.3, 1.0], [0, 1.04]], 12); }
    kit.sign(r, 14.0, 1.87, 1.5, 0.7, 0.3, TAG('T65 white'), { cw: 150, ch: 64 }); kit.sign(r, 15.4, 1.87, 1.5, 0.7, 0.3, TAG('T85'), { cw: 150, ch: 64 }); kit.sign(r, 16.8, 1.87, 1.5, 0.7, 0.3, TAG('whole rye'), { cw: 150, ch: 64 });
    // flour on the wood, dough resting under cloths, one out and being shaped
    for (const [x, y, rr, t] of [[15.9, 1.3, 0.85, 0.004], [16.7, 1.5, 0.6, 0.006], [15.2, 1.0, 0.55, 0.008], [17.2, 0.9, 0.4, 0.005]]) ves(r, WHITE, x, y, z, [[0, 0], [rr, 0], [rr * 0.9, t], [0, t]], 14);
    for (let i = 0; i < 3; i++) K.put(r, L(dome(0.4, 0.34), 1, 1, 12), LINEN, 15.0 + i * 0.86, 0.75, z);
    r.box(LINEN, 14.5, 17.3, 0.3, 1.2, z + 0.006, z + 0.016);
    K.put(r, L(dome(0.36, 0.26), 1, 1, 12), DOUGH, 16.1, 1.75, z + 0.008); r.box(STEEL, 16.75, 17.15, 1.5, 1.52, z, z + 0.3); r.soft(PALEW, 16.75, 17.15, 1.47, 1.55, z + 0.3, z + 0.38, 0.03);
    hcyl(r, PALEW, 'x', 17.3, 2.05, z + 0.09, 1.3, 0.09, 0.09, 10); for (const s of [-1, 1]) hcyl(r, PALEW, 'x', 17.3 + s * 0.8, 2.05, z + 0.09, 0.32, 0.04, 0.04, 8);
    // bannetons: a stack, and two waiting
    for (let i = 0; i < 6; i++) basket(r, 18.1, 0.75, z + i * 0.11, 0.36, 0.3); for (const [x, y] of [[18.0, 1.7], [14.2, 0.6]]) { basket(r, x, y, z, 0.36, 0.3); ves(r, WHITE, x, y, z + 0.06, [[0, 0], [0.28, 0.02], [0.33, 0.22], [0.31, 0.22], [0.26, 0.04], [0, 0.03]], 14); }
    // the scales, a bowl of flour and its scoop
    r.soft(STEEL, 14.6, 15.3, 1.75, 2.3, z, z + 0.14, 0.03); r.cyl(STEEL, 14.95, 2.02, z + 0.14, z + 0.2, 0.3, 0.3, 16); kit.sign(r, 14.95, 2.305, z + 0.07, 0.3, 0.09, (g, w, h) => { fill(g, w, h, '#1d2a1d'); T(g, '950 g', w / 2, h / 2, h * 0.8, '#9fe0a0', { f: F.elite }); }, { cw: 64, ch: 20 });
    // Doris
    jar(r, 13.55, 1.6, z, 0.26, 0.66, 'c#efe2bc/0.8', 0.66, null); r.cyl(LINEN, 13.55, 1.6, z + 0.64, z + 0.7, 0.29, 0.27, 14); r.cyl('c#8a1c1c/0.8', 13.55, 1.6, z + 0.6, z + 0.63, 0.275, 0.275, 14); r.cyl('c#2a63b8/0.8', 13.55, 1.6, z + 0.25, z + 0.265, 0.265, 0.265, 14);
    kit.sign(r, 13.55, 1.6 + 0.268, z + 0.43, 0.36, 0.2, (g, w, h) => { paper(g, w, h, '#fbf7ea'); T(g, 'DORIS', w / 2, h * 0.36, h * 0.46, RED, { f: F.abril }); T(g, 'do not tap the jar', w / 2, h * 0.78, h * 0.28, INK, { f: F.caveat, w: 700, max: w * 0.92 }); }, { cw: 130, ch: 72 });
    X.card(r, 13.55, 2.2, z, 1.0, 0.36, TAG('fed at 2. band = where she started'), { cw: 250, ch: 90 });
    r.box('c#6a4a2a/0.8', 13.22, 14.58, 0.02, 0.05, 4.45, 6.35); r.box(STEEL, 13.75, 14.05, 0.05, 0.09, 6.2, 6.33); kit.sign(r, 13.9, 0.06, 5.36, 1.26, 1.72, FEEDLOG, { cw: 360, ch: 490 });
    X.slateBoard(r, 16.65, 6.6, 3.9, 3.5, PROOF, { cw: 600, ch: 540 });
    X.pendant(r, 15.9, 1.5, { kind: 'dome', drop: 4.9, colour: 'c#e8e2d4/0.45', power: 0.95 });
  }
  { // the rack trolley, loaded
    const x0 = 10.5, x1 = 12.2, y0 = 0.2, y1 = 2.3;
    for (const x of [x0, x1]) for (const y of [y0, y1]) { r.box(STEEL, x - 0.04, x + 0.04, y - 0.04, y + 0.04, 0.25, 6.0); r.cyl(IRON, x, y, 0, 0.25, 0.12, 0.12, 8); }
    for (const z of [0.25, 6.0]) { r.box(STEEL, x0, x1, y0 - 0.04, y0 + 0.04, z, z + 0.07); r.box(STEEL, x0, x1, y1 - 0.04, y1 + 0.04, z, z + 0.07); r.box(STEEL, x0 - 0.04, x0 + 0.04, y0, y1, z, z + 0.07); r.box(STEEL, x1 - 0.04, x1 + 0.04, y0, y1, z, z + 0.07); }
    for (let k = 0; k < 9; k++) { const z = 0.75 + k * 0.58; r.box('c#9a9590/0.45/1', x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.05, z, z + 0.03);
      if (k % 4 === 3) continue;
      for (let i = 0; i < 6; i++) { const x = x0 + 0.42 + (i % 2) * 0.86, y = y0 + 0.4 + Math.floor(i / 2) * 0.64; set(r, k % 3 === 0 ? LOAF.bun(0.2) : k % 3 === 1 ? LOAF.boule(0.26, CR1, 'slash') : LOAF.batard(0.3, 0.17, CR2, 1), x, y, z + 0.03, i * 0.7); } }
    r.block(x0, x1, 0, y1, 0, 6);
  }
  { // sacks from the mill
    const S = [['STRONG WHITE', 'T65 · protein 12.5%'], ['HIGH EXTRACTION', 'T85 · ash 0.85%'], ['WHOLE RYE', 'T170 · coarse'], ['DURUM SEMOLINA', 'fine · rimacinata']];
    [[7.0, 9.3, 0, 0], [7.15, 9.45, 0.52, 1], [6.95, 9.2, 1.04, 2]].forEach(([a, b2, z, k]) => { r.soft(SACK, a, b2, 0.1, 1.6, z, z + 0.52, 0.14); kit.sign(r, (a + b2) / 2, 1.61, z + 0.26, 1.7, 0.36, SACKLABEL(...S[k]), { cw: 330, ch: 70, rough: 0.95 }); });
    kit.sign(r, 8.1, 0.85, 1.565, 1.9, 1.1, SACKLABEL(...S[2]), { cw: 330, ch: 190, flat: true, rough: 0.95 });
    r.soft(SACK, 9.55, 10.3, 0.12, 1.0, 0, 2.1, 0.16); kit.sign(r, 9.925, 1.01, 1.05, 0.62, 1.2, SACKLABEL(...S[3]), { cw: 170, ch: 330, rough: 0.95 });
    r.soft(SACK, 5.9, 6.75, 0.12, 0.95, 0, 2.0, 0.16); kit.sign(r, 6.325, 0.96, 1.0, 0.68, 1.2, SACKLABEL(...S[0]), { cw: 170, ch: 300, rough: 0.95 });
    r.block(5.9, 10.3, 0, 1.6, 0, 2);
    r.box(DARKW, 6.8, 9.4, 0.01, 0.07, 4.85, 8.35); kit.sign(r, 8.1, 0.08, 6.6, 2.4, 3.3, CLUB, { cw: 360, ch: 495 });
  }
  r.box(DARKW, 1.82, 5.18, 0.01, 0.07, 3.82, 8.78); kit.sign(r, 3.5, 0.08, 6.3, 3.2, 4.8, RECIPE, { cw: 640, ch: 960 });
  for (const x of [2.2, 4.8]) r.cyl('c#8a1c1c/0.45', x, 0.09, 8.55, 8.6, 0.05, 0.05, 8);

  // ---- a shelf by the window to eat a bun at -----------------------------------------------------------------
  const fw = at(20.9, 0.02, 0, 'back');
  fw.box(OAK, -1.75, 1.75, 0.2, 1.35, 3.45, 3.58, G); for (const x of [-1.5, 1.5]) { fw.box(IRON, x - 0.03, x + 0.03, 0.2, 0.26, 2.4, 3.45); tube(fw, IRON, [[x, 0.24, 2.45], [x, 1.2, 3.42]], 0.03, 5); } fw.block(-1.75, 1.75, 0, 1.35, 0, 3.6);
  plate(fw, -0.5, 0.8, 3.58, 0.3); set(fw, LOAF.bun(0.16), -0.5, 0.8, 3.61); plate(fw, 0.75, 0.75, 3.58, 0.3); set(fw, LOAF.knot(), 0.75, 0.75, 3.61);
  kit.posy(fw, 1.4, 0.7, 3.58, ['c#e88aa8/0.8', 'c#f4f1ea/0.8', 'c#f3d96a/0.8']);
  kit.sign(fw, -1.25, 0.9, 3.592, 0.7, 0.5, (g, w, h) => { paper(g, w, h, PINK); T(g, 'stand here.', w / 2, h * 0.24, h * 0.24, INK, { f: F.caveat, w: 700 }); T(g, 'eat bun.', w / 2, h * 0.52, h * 0.24, INK, { f: F.caveat, w: 700 }); T(g, 'watch street.', w / 2, h * 0.8, h * 0.24, RED, { f: F.caveat, w: 700 }); }, { cw: 150, ch: 108, flat: true });
  eat(fw, -0.5, 0.8, 3.72, 'milk bun', { build: EAT.bun, note: 'You finish the bun at the window. Somebody walks past and looks jealous.' });

  // ---- the left wall: today and tomorrow on slates, yesterday in a basket ------------------------------------
  const l = at(0, 10, 0, 'right');                             // +x toward the street; +y out from the left wall
  X.slateBoard(l, 2.6, 7.0, 4.3, 4.7, TODAY, { cw: 560, ch: 610 }); X.slateBoard(l, -2.5, 7.0, 4.3, 4.7, TOMORROW, { cw: 560, ch: 610 });
  l.box(OAK, -5.5, 5.0, 0.02, 1.55, 2.26, 2.4, G); for (const x of [-5.3, -0.25, 4.8]) { l.box(OAK, x - 0.07, x + 0.07, 0.05, 0.19, 0, 2.26, G); l.box(OAK, x - 0.07, x + 0.07, 1.35, 1.49, 0, 2.26, G); } l.box(OAK, -5.4, 4.9, 0.08, 1.45, 0.75, 0.83, G); l.block(-5.5, 5.0, 0, 1.55, 0, 2.4);
  { const z = 2.4;
    basket(l, 3.3, 0.8, z, 0.62, 0.5, 1.4); set(l, LOAF.boule(0.33, CR3, 'cross'), 2.9, 0.72, z + 0.28, 0.4, 0.2); set(l, LOAF.boule(0.3, CR2, 'square'), 3.75, 0.9, z + 0.3, 1.0, -0.2); set(l, LOAF.batard(0.4, 0.2, CR3, 1), 3.3, 0.6, z + 0.52, 0.5); kit.model('st_bread_1', l, 3.45, 1.02, z + 0.56, 0, { turn: 0.8 }); kit.model('st_bread_2', l, 2.75, 1.05, z + 0.52, 0, { turn: 2 });
    kit.sign(l, 3.3, 1.56, 1.88, 1.9, 0.62, YEST, { cw: 380, ch: 124, rough: 0.9 });
    eat(l, 2.75, 1.05, z + 0.6, "heel of yesterday's loaf", { build: EAT.heel, note: "You finish the heel of yesterday's loaf. Chewier, sourer, better. Twice the character was an underestimate." });
    // the flour, to take home; jam; bannetons
    [['STRONG WHITE', 'T65', '#8a3a2a'], ['HIGH EXTRACTION', 'T85', '#26364f'], ['WHOLE RYE', 'T170', '#4a6e38'], ['STRONG WHITE', 'T65', '#8a3a2a']].forEach(([k2, s, col], i) => kit.pack(l, 1.55 - i * 0.62, 0.7, z, 0.54, 0.34, 0.86, snapMat('c#e8e2d4/0.8'), FLOURBAG(k2, s, col), { cw: 110, ch: 176 }));
    X.card(l, 0.6, 1.25, z, 1.4, 0.34, TAG('the flour we bake with · 2 kg · 9'), { cw: 330, ch: 80 });
    for (let i = 0; i < 6; i++) jar(l, -1.3 - i * 0.42, 0.6 + (i % 2) * 0.3, z, 0.15, 0.4, ['c#8a1c1c/0.45', 'c#4a2240/0.45', 'c#e0782a/0.45'][i % 3], 0.85, BRASS);
    X.card(l, -2.3, 1.3, z, 1.5, 0.34, TAG('jam: plum · blackcurrant · bitter orange · 7'), { cw: 350, ch: 80 });
    for (let i = 0; i < 4; i++) basket(l, -4.4, 0.8, z + i * 0.11, 0.36, 0.3); basket(l, -4.95, 0.5, z, 0.3, 0.26, 1.5);
    X.card(l, -4.55, 1.3, z, 1.1, 0.34, TAG('bannetons · cane · 22'), { cw: 260, ch: 80 });
    // below: paper sacks of rolls for the cafes, a crate of bread boards
    X.crate(l, 2.6, 0.78, 0.83, 1.7, 1.15, 0.8); for (let i = 0; i < 8; i++) set(l, LOAF.boule(0.2, CR1, 'slash'), 2.05 + (i % 4) * 0.36, 0.55 + Math.floor(i / 4) * 0.42, 1.25, i);
    X.crate(l, -2.6, 0.78, 0.83, 1.7, 1.15, 0.8); for (let i = 0; i < 4; i++) l.box(i % 2 ? OAK : PALEW, -3.3 + i * 0.36, -3.24 + i * 0.36, 0.3, 1.25, 0.9, 1.9 + (i % 3) * 0.12, G);
  }

  // ---- the tasting table in the middle -----------------------------------------------------------------------
  { const t = R, cx = 7.2, cy = 10.3, z = X.plinth(t, cx, cy, 4.6, 2.6, 2.75, { mat: OAK, shelf: 1.0 });
    kit.model('wooden_cutting_board', t, cx - 0.9, cy - 0.1, z, 0); set(t, LOAF.boule(0.36, CR2, 'cross'), cx - 1.25, cy - 0.1, z + 0.13, 0.3);
    for (let i = 0; i < 4; i++) t.box(i % 2 ? 'c#e8e2d4/0.8' : 'c#efe2bc/0.8', cx - 0.72 + i * 0.1, cx - 0.65 + i * 0.1, cy - 0.38, cy + 0.2, z + 0.14, z + 0.5 - i * 0.02);
    t.box(STEEL, cx - 0.28, cx - 0.24, cy - 0.3, cy + 0.35, z + 0.14, z + 0.16); t.box(DARKW, cx - 0.3, cx - 0.22, cy + 0.35, cy + 0.7, z + 0.13, z + 0.18);
    plate(t, cx + 0.25, cy - 0.35, z, 0.26); t.soft('c#f3d96a/0.45', cx + 0.12, cx + 0.38, cy - 0.44, cy - 0.26, z + 0.03, z + 0.13, 0.02);
    X.card(R.sub(cx - 0.3, cy - 1.05, 0, 2), 0, 0, z, 1.9, 0.5, (g, w, h) => { paper(g, w, h, PAPER); T(g, 'try the bread.', w / 2, h * 0.28, h * 0.36, RED, { f: F.pacifico }); T(g, 'the butter is salted. the knife is blunt, for everyone’s sake', w / 2, h * 0.74, h * 0.2, INK, { f: F.caveat, w: 600, max: w * 0.94 }); }, { cw: 400, ch: 106 });
    eat(t, cx - 0.55, cy - 0.1, z + 0.5, 'slice of country loaf with butter', { build: EAT.slice, note: 'You finish the bread and butter. Sour, sweet, salt. It is absurd that this is three ingredients.' });
    bowl(t, cx + 1.45, cy + 0.2, z, 0.62, 0.3, 'c#e8907a/0.45'); kit.model('hamburger_buns', t, cx + 1.45, cy + 0.2, z + 0.14, 0, { turn: 0.5 }); for (let i = 0; i < 5; i++) set(t, LOAF.bun(0.16), cx + 1.45 + Math.cos(i * 1.3) * 0.3, cy + 0.2 + Math.sin(i * 1.3) * 0.3, z + 0.1 + (i % 2) * 0.05);
    kit.posy(t, cx + 0.5, cy + 0.75, z, ['c#f3d96a/0.8', 'c#f4f1ea/0.8', 'c#e88aa8/0.8']);
    for (let i = 0; i < 3; i++) jar(t, cx - 1.9 + i * 0.36, cy + 0.8, z, 0.14, 0.36, ['c#c9952a/0.45', 'c#8a1c1c/0.45', 'c#c9952a/0.45'][i], 0.85, BRASS);
    X.crate(t, cx - 1.1, cy, 1.0, 1.7, 1.3, 0.75); for (let i = 0; i < 6; i++) baguette(t, cx - 1.6 + i * 0.2, cy - 0.3 + (i % 2) * 0.3, 1.1, 0.7 - i * 0.05, 0.1, 1.5, i % 2 ? CR1 : CR2);
    X.crate(t, cx + 1.1, cy, 1.0, 1.7, 1.3, 0.75); for (let i = 0; i < 6; i++) set(t, LOAF.boule(0.27, i % 2 ? CR1 : CR2, i % 2 ? 'cross' : 'square'), cx + 0.62 + (i % 3) * 0.48, cy - 0.3 + Math.floor(i / 3) * 0.55, 1.4, i);
    X.pendant(R, cx, cy, { kind: 'globe', drop: 4.2, power: 0.9 });
    { const [sx, sz] = kit.world(t, cx - 1.25, cy - 0.1); kit.steam.push({ x: sx, y: t.h + z + 0.5, z: sz }); }
  }

  // ---- the window: a tower of loaves, a wheat sheaf, cakes under glass ----------------------------------------
  { const z = 2.02; R.box(BLUSH, 1, 13, 0.3, 3.3, 0, 1.96, G); R.box(LINEN, 0.94, 13.06, 0.24, 3.36, 1.96, z); R.block(1, 13, 0.3, 3.3, 0, 3.2);
    // the tower
    let zz = z; [[0.56, CR3, 'rings', FLOUR, 0, 0], [0.44, CR2, 'cross', PALE, 0.06, -0.03], [0.36, CR1, 'square', PALE, -0.05, 0.04], [0.29, CR2, 'cross', PALE, 0.04, 0.02], [0.22, CR1, 'slash', PALE, -0.02, -0.02]].forEach(([rr, col, sc, ear, dx, dy], i) => { set(R, LOAF.boule(rr, col, sc, ear), 2.7 + dx, 1.7 + dy, zz, i * 0.8); zz += rr * 0.84 - 0.05; });
    set(R, LOAF.bun(0.14, BUN), 2.7, 1.7, zz); R.cyl('c#c9a77a/0.8', 2.7, 1.7, zz + 0.1, zz + 0.62, 0.01, 0.01, 4);
    kit.sign(at(2.7, 1.69, 0, 'street'), 0.2, 0, zz + 0.52, 0.52, 0.2, TAG('do not pull from the bottom', PINK), { cw: 170, ch: 64 });
    for (const [a, d, rz] of [[1.75, 1.0, 0.5], [3.7, 0.95, -0.4], [3.8, 2.3, 0.2]]) set(R, LOAF.batard(0.44, 0.21, CR1, 1), a, d, z, rz);
    ves(R, 'c#9fb0a4/0.45', 4.75, 1.3, z, [[0, 0], [0.36, 0], [0.42, 0.2], [0.4, 0.95], [0.34, 1.0], [0.3, 0.98], [0.34, 0.9], [0.34, 0.1], [0, 0.06]], 16); for (let i = 0; i < 7; i++) { const a = i * 0.9; baguette(R, 4.75 + Math.cos(a) * 0.1, 1.3 + Math.sin(a) * 0.1, z + 0.1, Math.cos(a) * 0.32, Math.sin(a) * 0.32, 2.2 + (i % 3) * 0.1, i % 2 ? CR1 : CR2); }
    // the wheat sheaf
    { const sx = 5.95, sy = 2.45; for (let i = 0; i < 40; i++) { const a = i * 2.4, k = 0.25 + (i % 5) * 0.19, ca = Math.cos(a), sa = Math.sin(a), top = 2.2 + (i % 4) * 0.13;
        tube(R, 'c#d9b35a/0.8', [[sx + ca * 0.4 * k, sy + sa * 0.3 * k, z], [sx + ca * 0.07 * k, sy + sa * 0.07 * k, z + 1.0], [sx + ca * 0.3 * k, sy + sa * 0.26 * k, z + top - 0.42], [sx + ca * 0.52 * k, sy + sa * 0.42 * k, z + top - 0.2], [sx + ca * 0.62 * k, sy + sa * 0.5 * k, z + top]], t => t < 0.7 ? 0.011 : 0.011 + 0.034 * Math.sin(Math.PI * (t - 0.7) / 0.3), 5); }
      R.cyl('c#b8361f/0.8', sx, sy, z + 0.92, z + 1.08, 0.11, 0.11, 12); }
    // the card, on its riser
    R.box(BLUSH, 6.9, 10.0, 2.2, 3.2, z, z + 0.55, G); R.box(OAK, 6.95, 9.95, 2.68, 2.74, z + 0.55, z + 2.55, G);
    kit.sign(at(8.45, 2.68, 0, 'street'), 0, 0.012, z + 1.55, 2.9, 1.9, WINCARD, { cw: 520, ch: 340 });
    kit.sign(at(8.45, 2.74, 0, 'back'), 0, 0.012, z + 1.55, 2.4, 1.3, INSIDE, { cw: 330, ch: 180 });
    kit.model('wooden_cutting_board', R, 8.4, 1.2, z, 0); kit.model('st_bread_1', R, 8.0, 1.2, z + 0.13, 0, { turn: 1.2 }); kit.model('st_bread_2', R, 8.75, 1.15, z + 0.13, 0, { turn: 0.4 }); kit.model('croissant', R, 7.2, 0.95, z, 0, { turn: 0.6 }); kit.model('croissant', R, 9.6, 0.95, z, 0, { turn: 2.4 });
    for (let i = 0; i < 6; i++) set(R, LOAF.canele(), 7.05 + (i % 3) * 0.2 + (i > 2 ? 0.1 : 0), 1.75, z + 0.55 + (i > 2 ? 0.17 : 0)); for (let i = 0; i < 5; i++) set(R, LOAF.knot(), 8.0 + i * 0.36, 2.35, z + 0.55, i);
    // cakes under glass
    stand(R, 10.9, 1.5, z, 0.52, 0.5); { const t = layerCake(R, 10.9, 1.5, z + 0.5, 0.36, 4, 'c#c9a77a/0.8', WHITE, 'c#e8907a/0.8'); for (let i = 0; i < 8; i++) ball(R, 'c#c8202a/0.45', 10.9 + Math.cos(i * 0.785) * 0.26, 1.5 + Math.sin(i * 0.785) * 0.26, t, 0.05, 7); } cloche(R, 10.9, 1.5, z + 0.5, 0.48, 1.0);
    stand(R, 12.1, 2.3, z, 0.5, 1.0); R.cyl('c#f3d96a/0.45', 12.1, 2.3, z + 1.0, z + 1.14, 0.36, 0.34, 20); ves(R, PALE, 12.1, 2.3, z + 1.0, [[0.36, 0], [0.4, 0.17], [0.37, 0.17], [0.35, 0.02]], 20); for (let i = 0; i < 10; i++) ball(R, WHITE, 12.1 + Math.cos(i * 0.63) * 0.27, 2.3 + Math.sin(i * 0.63) * 0.27, z + 1.13, 0.05, 6, 1.5); cloche(R, 12.1, 2.3, z + 1.0, 0.46, 0.6);
    kit.model('st_cake_stand', R, 12.15, 1.0, z, 0, { scale: 0.9 });
    kit.sign(at(11.5, 0.75, 0, 'street'), 0, 0, z + 0.2, 1.0, 0.36, TAG('cakes to order · two days’ notice, or luck', PINK), { cw: 280, ch: 100, tilt: 0.18 });
    for (const [a, n] of [[1.6, 16], [12.6, 14]]) potted(R, a, 2.85, z, { r: 0.24, n, len: 0.8, pot: 'c#e8e2d4/0.45' });
    for (const a of [3.4, 9.6]) X.pendant(R, a, 1.9, { kind: 'globe', drop: 3.3, power: 0.9, r: 0.3 });
  }

  // ---- out on the pavement: a bench, a crate of bread boards, the board ---------------------------------------
  const out = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));         // x = a along the frontage, y = -feet out from the shopfront
  kit.model('painted_wooden_bench', out, 10.9, -1.15, 0, 2, { outdoor: true, collide: true, seat: 1.45 });
  X.crate(out, 2.4, -1.0, 0.02, 1.7, 1.15, 0.9); for (let i = 0; i < 6; i++) out.box(i % 2 ? OAK : PALEW, 1.75 + i * 0.25, 1.81 + i * 0.25, -1.45, -0.55, 0.1, 1.5 + (i * 7 % 4) * 0.13, G); out.block(1.55, 3.25, -1.6, -0.4, 0, 1.8);
  kit.sign(out.sub(2.4, -1.6, 0, 2), 0, 0.02, 0.5, 1.4, 0.5, TAG('bread boards · offcuts of the old bench · 18'), { cw: 330, ch: 118 });
  X.aBoard(K.wrap(lot.frOut(kit, lot.doorA + 4.3, 5.2, 0, 'left')), 0, 0, ABOARD);

  // ---- Crumb ------------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'crumb', name: 'Crumb', lot: 'bakery', look: { shape: 'squat', colour: '#c79a6b', belly: '#f4ecdc', trim: '#e8b9a6', hat: 'toque', apron: '#f4f1ea', eye: '#ffe2b0', ring: 0xffc890, blush: true, tool: 'ladle', hover: 4.7 },
    home: lot.world(7.2, 21.3), faces: lot.world(12, 8), posts: [lot.world(2.6, 21.3), lot.world(11.8, 21.3), lot.world(14.6, 20.8), lot.world(7.2, 21.3)],
    serve: { machine: lot.world(14.6, 20.8), pickup: lot.pickup, food: {
      'cardamom knot': { build: EAT.knot, bites: 3, note: 'You finish the cardamom knot. Still warm. Juniper must never know.' },
      'slice of country loaf': { build: EAT.slice, bites: 3, note: 'You finish the slice. Butter to the very edges, as promised.' } } },
    lines: {
      greet: ['Morning! It is morning, isn’t it? It has been morning for me since yesterday.', 'Come in, come in! We are OPEN. I keep saying it out loud. Open!', 'Hello! Mind the flour. It is on everything. It is on me. I think it may BE me.'],
      idle: ['*pats a loaf on the bottom. listens. nods*', 'Up since before the birds. I woke the birds, actually. They were cross.', '*dusts the counter with flour, then wipes the flour off*', 'Doris is bubbling. Doris is the starter. Please do not tap her jar.', 'Four hours of sleep is plenty if you spread it over a week.', '*counts the cardamom knots. counts them again. hides two*'],
      bye: ['See you tomorrow! The bread will be up before you are.', 'Cut side down on the board. Never the fridge!', 'Go well. Toast it on day two and think of me.'],
      served: ['Good? It is good. I was there when it happened.', 'Eat it while it is warm. I will look away, people chew better unobserved.'],
      topics: [
        { q: 'You are open!', a: 'I KNOW. For years the note said “sold out, back at seven”. It was true, too: I baked at four, sold out by ten past, and slept standing up. Then somebody said “bread should be open”, and I thought: I could bake MORE bread. Nobody had ever suggested it.', next: [
          { q: 'Back at seven... which seven?', a: 'That was never settled. People came at both. I admired their optimism from behind the blind.' }] },
        { q: 'What is good today?', a: 'The country loaf, always: seventy-eight percent water, a day and a half from flour to crust. The rye if you are serious. A cardamom knot if you are not.', next: [
          { q: 'A slice of the country loaf, please.', a: 'With butter, to the very edges. One moment, the knife and I need to have a word.', serve: 'slice of country loaf' },
          { q: 'A cardamom knot?', a: 'Ah. Those are saved for Juniper at the coffee shop. All of them. ...I can miscount by one. Wait there, look innocent.', serve: 'cardamom knot' }] },
        { q: 'Tell me about the starter.', a: 'Doris. Flour, water, and whatever was in the air the first evening. I feed her at two: one part Doris, five flour, five water. By six she has doubled, and she sulks if somebody leaves the door open.', next: [
          { q: 'Why Doris?', a: 'She is older than I am and she rises without being asked. It felt rude to keep calling her “the culture”.' }] },
        { q: 'Could I have one of the tall cakes?', a: 'Carrot or strawberry, by the slice, gladly. The last two tall ones are spoken for: Otis from the record shop put his name on both. He says one is for a friend. He has said that before.' },
        { q: 'Do you ever sleep?', a: 'Between the last fold and the shaping there are twenty-five minutes when nothing needs me. I lean on the flour sacks. Then Bao bangs on the Yard wall when the first dumplings go on, and that is my alarm clock.', next: [
          { q: 'You and Bao are friends?', a: 'Bao gets my day-old loaves for crumbs and my milk buns for filling. I get the dumplings that came out a funny shape. Neither of us has paid for lunch in years.' }] },
        { q: 'How do I bake bread at home?', a: 'The whole recipe is pinned up by the window, weights and all; copy it down. The short version: weigh everything, keep the dough warm, and bake it darker than you dare. If it is pale it is not done, it is only shy.' },
      ],
    },
  });
}
