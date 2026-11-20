// The Museum of Small Wonders  (south side: no. 22 South Main Street, South Norwalk; 29 ft wide by 42.7 deep inside)
// Two galleries, kept by one robot. Everything in it is real: the objects are 3D scans of real things
// (Smithsonian Open Access, CC0; the whale from Poly Haven), the pictures real paintings in the public
// domain. Each object stands alone in its case with one label: what it is, where and when, where it is
// kept, and sometimes one line of Quill's.
//   The front gallery (to d = 26.4): a boarded dado and a picture rail; the desk with the visitors' book on
//   the right wall; DEEP TIME down the left wall (megalodon tooth, a trilobite to touch, an uncoiled
//   ammonite), MADE BY HAND down the right (a Greek cup, Thomas Commeraw's jug); Cher Ami straight ahead,
//   Lincoln's life mask and a stereoscope behind, then the one invented case, "Small Wonders of Vesper
//   Street"; a coco de mer and a colonoware pot against the partition, either side of the opening.
//   The picture gallery (behind a ten-foot cased opening): deep red walls, five oils in one row on the back
//   wall with Almond Blossom on the axis of the door, three works on paper on the left wall, one Cézanne on
//   the right, a brass light over each, a long bench on a rug, and the back door where the real one is.
//   (The building's one back window is taken to be boarded over for hanging wall.)
//   Windows: a whale and a guardian.
import { open as openGuestbook } from '../guestbook.js';
import { tools, fixtures } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { arch } from './arch.js';
import { T, F, fill, slate, chalk, paper, board, grain, line, para } from '../draw.js';

const GREEN = 'painted_wood#3a4a44', OAK = 'oak_light#a3825c', DARKW = 'fir#3a2c24', DESKTOP = 'fir#5a3d2c', IRON = 'c#2b2724/0.45/1', LINENC = 'c#e8e2d4/0.8', CREAMP = 'c#efe2bc/0.8', LEATHER = 'leather#6a3a2a';
const DADO = 'painted_wood#d3cdb8', WALLRED = 'plaster#7a3d36';
const INK = '#2a1c13', DEEP = '#2c3a36', CREAM = '#f1e6cf', GOLD = '#d9c9a0', OX = '#6e2a26', BLUE = '#2f5a6a', PAPER = '#f4eedd', GREY = '#5a5a56';

// ---- lettering ----------------------------------------------------------------------------------
// A museum label, 400 x 260: what it is, where and when, where it is kept, and at most one line of Quill's.
const LABEL = o => (g, w, h) => {
  paper(g, w, h, PAPER, o.title.length); const u = w / 400, m = 24 * u, W = w - 2 * m;
  g.strokeStyle = DEEP; g.lineWidth = 2 * u; g.strokeRect(6 * u, 6 * u, w - 12 * u, h - 12 * u);
  let y = para(g, o.title, m, 22 * u, 31 * u, '#1f2a27', W, { f: F.playfair, w: 700, lh: 1.08 });
  y = para(g, o.sub, m, y + 6 * u, 17 * u, OX, W, { f: F.fraunces, it: 1, w: 600, lh: 1.2 });
  line(g, [[m, y + 9 * u], [m + 70 * u, y + 9 * u]], '#c9952a', 2 * u);
  para(g, o.kept, m, y + 19 * u, 14.5 * u, GREY, W, { f: F.bebas, ls: 1, lh: 1.25 });
  if (o.note) T(g, o.note, m, h - 34 * u, 25 * u, BLUE, { f: F.caveat, w: 700, a: 'left', max: W });
};
// The card under a picture, 300 x 175.
const PLABEL = p => (g, w, h) => {
  paper(g, w, h, PAPER, p.file.length); const m = w * 0.07;
  T(g, p.artist, m, h * 0.18, h * 0.15, '#1f2a27', { f: F.playfair, w: 700, a: 'left', max: w * 0.86 });
  T(g, p.title, m, h * 0.38, h * 0.12, OX, { f: F.fraunces, it: 1, w: 600, a: 'left', max: w * 0.86 });
  T(g, p.date, m, h * 0.55, h * 0.1, INK, { f: F.fraunces, w: 600, a: 'left', max: w * 0.86 });
  T(g, p.coll, m, h * 0.7, h * 0.09, GREY, { f: F.bebas, a: 'left', ls: 1, max: w * 0.86 });
  if (p.note) T(g, p.note, m, h * 0.87, h * 0.135, BLUE, { f: F.caveat, w: 700, a: 'left', max: w * 0.86 });
};
// a plain small heading on the wall
const HEAD = s => (g, w, h) => { fill(g, w, h, DEEP); grain(g, w, h, 0.05, s.length); T(g, s, w / 2, h * 0.54, h * 0.5, CREAM, { f: F.bebas, ls: h * 0.12, max: w * 0.9 }); };
// the labels in the Vesper Street case: the same form in miniature
const VLABEL = (no, title, body) => (g, w, h) => {
  paper(g, w, h, PAPER, no.length + title.length); const m = w * 0.07;
  T(g, no, m, h * 0.13, h * 0.085, '#8a5a2a', { f: F.elite, a: 'left' });
  const y = para(g, title, m, h * 0.22, h * 0.13, '#1f2a27', w * 0.86, { f: F.playfair, w: 700, lh: 1.05 });
  para(g, body, m, y + h * 0.05, h * 0.085, INK, w * 0.86, { f: F.fraunces, w: 600, lh: 1.22 });
};

const SIGNS = {
  hours(g, w, h) {
    paper(g, w, h, PAPER, 9); g.strokeStyle = DEEP; g.lineWidth = 2; g.strokeRect(5, 5, w - 10, h - 10);
    T(g, 'OPEN EVENINGS', w / 2, h * 0.34, h * 0.2, DEEP, { f: F.bebas, ls: 3, max: w * 0.84 }); T(g, 'Admission free.', w / 2, h * 0.68, h * 0.17, OX, { f: F.fraunces, it: 1, w: 600, max: w * 0.84 });
  },
  book(g, w, h) {
    fill(g, w, h, '#f5efde'); grain(g, w, h, 0.04, 2); line(g, [[w / 2, 0], [w / 2, h]], '#cdbf9f', 3);
    for (let i = 0; i < 11; i++) line(g, [[w * 0.03, h * (0.2 + i * 0.075)], [w * 0.97, h * (0.2 + i * 0.075)]], '#d8cdb2', 1);
    T(g, 'VISITORS', w * 0.25, h * 0.09, h * 0.07, OX, { f: F.playfair, w: 700, ls: 3 });
    const L = [['Came for the whale. Stayed for the sock.', '— M.', '#26364f'], ['I TOUCHED THE TRILOBITE!!!', '— Ines, age 7', '#8a1c1c'], ['Is the pigeon all right?', '— worried, no. 9', '#2f5a6a']];
    const Rr = [['That 10 mm socket is MINE.', '— the bike shop', '#2b2724'], ['I sat with the strawberries for an hour.', '— no name. thank you.', '#8a5a2a']];
    [L, Rr].forEach((col, k) => col.forEach(([s, who, c], i) => { const x = w * (0.035 + k * 0.5), y = h * (0.235 + i * 0.225); T(g, s, x, y, h * 0.068, c, { f: F.caveat, w: 700, a: 'left', max: w * 0.44 }); T(g, who, x + w * 0.44, y + h * 0.072, h * 0.058, c, { f: F.caveat, w: 700, a: 'right', max: w * 0.4 }); }));
  },
  evening(g, w, h) {
    fill(g, w, h, '#b08d4a'); grain(g, w, h, 0.08, 3); g.strokeStyle = '#3a2c24'; g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8);
    T(g, 'THE EVENING', w / 2, h * 0.32, h * 0.26, '#2a1c13', { f: F.dm, ls: 3, max: w * 0.9 }); T(g, 'Artist unknown.  On permanent loan from the sky.', w / 2, h * 0.7, h * 0.15, '#2a1c13', { f: F.fraunces, it: 1, w: 600, max: w * 0.92 });
  },
};

// ---- the collection --------------------------------------------------------------------------------
// The identifications, places, dates and numbers are those of the holding museums' records (assets/models/CATALOG.md).
const NMNH = 'Smithsonian National Museum of Natural History, Washington', NMAAHC = 'Smithsonian National Museum of African American History and Culture, Washington';
const EX = {
  megalodon: { title: 'Megalodon tooth', sub: 'Carcharocles megalodon  ·  Miocene, 23 to 5 million years ago  ·  Coffee County, Georgia', kept: NMNH, note: 'As big as a hand. Hold yours up.' },
  trilobite: { title: 'Trilobite (please touch)', sub: 'Coltraneia oufatenensis  ·  Devonian, about 390 million years ago  ·  Morocco', kept: NMNH + '  ·  USNM PAL 794206', note: 'Along the ribs, please, not against.' },
  ammonite: { title: 'Uncoiled ammonite', sub: 'Exiteloceras jenneyi  ·  Late Cretaceous, about 75 million years ago  ·  Montana', kept: NMNH + '  ·  USNM PAL 430970', note: 'Nobody told it what shape to be.' },
  kylix: { title: 'Kylix (wine cup)', sub: 'Greece, about 800 BC  ·  painted earthenware', kept: 'Cooper Hewitt, Smithsonian Design Museum, New York  ·  1971-48-12' },
  commeraw: { title: 'Stoneware jug', sub: 'Thomas W. Commeraw, a free Black potter  ·  Corlears Hook, New York, about 1797 to 1819', kept: NMAAHC + '  ·  2011.61', note: 'He stamped his name on his pots.' },
  lincoln: { title: 'Abraham Lincoln, life mask', sub: 'Leonard Wells Volk  ·  Chicago, 1860  ·  this plaster cast 1917', kept: 'National Portrait Gallery, Smithsonian Institution, Washington  ·  NPG.71.24', note: 'No beard yet.' },
  cherami: { title: 'Cher Ami', sub: 'Homing pigeon, U.S. Army Signal Corps  ·  France, 1918', kept: 'Smithsonian National Museum of American History, Washington', note: '"Cher ami" means "dear friend".' },
  stereo: { title: 'Stereoscope', sub: 'A. Mattey  ·  Paris, between 1905 and 1920  ·  wood, glass and metal', kept: NMAAHC + '  ·  2017.111.16', note: 'Two flat pictures make one deep one.' },
  coco: { title: 'Coco de mer', sub: 'Lodoicea maldivica  ·  Praslin and Curieuse, Seychelles  ·  the largest seed of any plant', kept: NMNH + '  ·  US National Herbarium', note: 'It is a seed. Nobody believes me.' },
  colono: { title: 'Colonoware pot', sub: 'Maker unrecorded  ·  18th century  ·  Cooper River, South Carolina  ·  built by hand, without a wheel', kept: NMAAHC + '  ·  2017.108.1.1', note: 'The dots went in one at a time.' },
  monster: { title: 'Kneeling winged monster', sub: 'China, Northern Qi dynasty, 550 to 577  ·  limestone  ·  Xiangtangshan cave temples, Hebei', kept: 'National Museum of Asian Art, Smithsonian Institution, Washington  ·  F1916.345' },
  whale: { title: 'Whale', sub: 'Bronze  ·  sculptor not recorded', kept: 'Scanned by Poly Haven', note: 'It is small for a whale.' },
};
// the pictures. w = width of the image in feet, r = its width / height
const RIJKS = 'Rijksmuseum, Amsterdam', AIC = 'Art Institute of Chicago', ALB = 'Albertina, Vienna';
// the back wall, left to right: five oils in one row, Almond Blossom on the axis of the door
const ROW = [
  { file: 'fantin_latour_roses', w: 2.2, r: 843 / 703, artist: 'Henri Fantin-Latour', title: 'Roses in a Bowl', date: '1881', coll: AIC },
  { file: 'coorte_strawberries', w: 1.55, r: 809 / 1024, artist: 'Adriaen Coorte', title: 'Strawberries on a Stone Ledge', date: '1696', coll: RIJKS, note: 'Forgotten for two centuries.' },
  { file: 'milkmaid', w: 2.3, r: 913 / 1024, artist: 'Johannes Vermeer', title: 'The Milkmaid', date: 'about 1660', coll: RIJKS },
  { file: 'van_gogh_almond_blossom', w: 3.2, r: 1024 / 809, artist: 'Vincent van Gogh', title: 'Almond Blossom', date: '1890', coll: 'Van Gogh Museum, Amsterdam', note: 'Painted for his newborn nephew.', axis: 1 },
  { file: 'vermeer_little_street', w: 2.1, r: 827 / 1024, artist: 'Johannes Vermeer', title: 'The Little Street', date: 'about 1658', coll: RIJKS },
];
// the left wall, from the partition to the back: works on paper
const PAPERS = [
  { file: 'museum/durer_turf', w: 1.45, r: 856 / 1100, paper: 1, artist: 'Albrecht Dürer', title: 'The Great Piece of Turf', date: '1503, watercolour', coll: ALB, note: 'Weeds, by a master.' },
  { file: 'museum/durer_hare', w: 1.6, r: 996 / 1100, paper: 1, artist: 'Albrecht Dürer', title: 'Young Hare', date: '1502, watercolour', coll: ALB },
  { file: 'hiroshige_kameido_plum', w: 1.55, r: 704 / 1024, paper: 1, artist: 'Utagawa Hiroshige', title: 'Plum Garden at Kameido', date: '1857, woodblock print', coll: 'this impression: Chester Beatty, Dublin', note: 'Van Gogh copied it in oils.' },
];
// the right wall: one picture
// The street's own buildings, as they were measured: sheets of the Historic American Buildings Survey (public domain,
// Library of Congress). The north side's three sheets and the chapel's hang in one row on the right wall of the
// picture gallery; the south side's two on the back of the partition, left of the opening; the Cézanne has the
// pier on the other side to itself.
const HABS = 'Historic American Buildings Survey', LOC = 'Library of Congress, ';
const SHEETS = [
  [ { file: 'museum/habs_madison_plans', w: 2.3, r: 1024 / 803, paper: 1, artist: HABS, title: 'Mulberry Street Block, Madison, Indiana: plans', date: 'measured 1971, ink on film', coll: LOC + 'HABS IN-83, sheet 2', note: 'The north side of this street, from above.' },
    { file: 'museum/habs_madison_301', w: 2.3, r: 1024 / 803, paper: 1, artist: HABS, title: 'Nos. 301 to 307, east elevation', date: 'measured 1971, ink on film', coll: LOC + 'HABS IN-83, sheet 3' },
    { file: 'museum/habs_madison_309', w: 2.3, r: 1024 / 803, paper: 1, artist: HABS, title: 'Nos. 309 to 315, east elevation', date: 'measured 1971, ink on film', coll: LOC + 'HABS IN-83, sheet 4' } ],
  [ { file: 'museum/habs_norwalk_fronts', w: 2.5, r: 1024 / 681, paper: 1, artist: HABS, title: 'South Main Street, South Norwalk, Connecticut: fronts', date: 'measured 1977, ink on film', coll: LOC + 'HABS CT-349, sheet 5', note: 'No. 22 has the arches. You are in it.' },
    { file: 'museum/habs_norwalk_plan', w: 2.5, r: 1024 / 683, paper: 1, artist: HABS, title: 'Buildings 20 to 24, first floor plan', date: 'measured 1977, ink on film', coll: LOC + 'HABS CT-349, sheet 2' },
    { file: 'museum/habs_chapel', w: 2.3, r: 1024 / 683, paper: 1, artist: HABS, title: 'First Baptist Church, Madison, Indiana', date: 'measured 1978, ink on film', coll: LOC + 'HABS IN-127, sheet 3', note: 'Ours is two thirds the size.' } ],
];
const ALONE = { file: 'cezanne_basket_of_apples', w: 3.1, r: 1024 / 817, artist: 'Paul Cézanne', title: 'The Basket of Apples', date: 'about 1893', coll: AIC, note: 'The table does not line up. He knew.' };

export default function museum(kit, lot) {
  const K = tools(kit, 83), X = fixtures(kit, K), { ves, hcyl, ball, tube, jar } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                        // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D, MID = lot.doorA ?? W / 2;
  const A = arch(kit, lot, K), PD = 26.6, OA0 = MID - 5, OA1 = MID + 5;       // the partition, and the opening in it
  const use = [];                                            // things to do with E, wired up once the scene exists
  const spot = (f, x, y, z, label, act, reach = 5.5) => { const [wx, wz] = kit.world(f, x, y); use.push({ x: wx, y: f.h + z, z: wz, reach, label, act }); };
  // a drawn board leaning back by `tilt`, with a wooden back
  const lean = (f, x, y, z, w, tall, tilt, draw, cw, ch, back = DARKW) => {
    kit.put(f, back, kit.geom.bev(-w / 2 - 0.05, w / 2 + 0.05, -0.045, -0.008, -tall / 2 - 0.05, tall / 2 + 0.05, 0.008), { rx: tilt, at: [x, y, z] });
    kit.sign(f, x, y, z, w, tall, draw, { cw, ch, tilt, rough: 0.9 });
  };
  const LW = 1.6, LH = 1.04, LPX = [400, 260];              // every object label is this size
  // a painted plinth with a glass case on it; returns the height things stand on
  const plinthCase = (f, x0, x1, y0, y1, h, tall, glass = true) => {
    f.box('c#2b2724/0.8', x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.05, 0, 0.22); f.box(GREEN, x0, x1, y0, y1, 0.22, h - 0.07, G); f.box(DESKTOP, x0 - 0.05, x1 + 0.05, y0 - (y0 > 0.1 || y0 < 0 ? 0.05 : 0), y1 + 0.05, h - 0.07, h, G);
    f.block(x0, x1, Math.min(y0, 0), y1, 0, h + (glass ? tall : 0.3));
    if (glass) X.glassCase(f, x0 + 0.1, x1 - 0.1, y0 + 0.1, y1 - 0.1, h, tall, { base: LINENC }); else f.box(LINENC, x0 + 0.1, x1 - 0.1, y0 + 0.1, y1 - 0.1, h, h + 0.03);
    return h + 0.03;
  };
  const riser = (f, x, y, z, w, d, t) => { f.box(LINENC, x - w / 2, x + w / 2, y - d / 2, y + d / 2, z, z + t); return z + t; };

  // ---- the joinery: a partition with a wide cased opening, a dado and a picture rail in both rooms ----------------
  const P = A.partition(PD, { openings: [{ a0: OA0, a1: OA1, z0: 0, z1: 8.6 }] });
  const PF = { d: P.front, side: 'front' }, PB = { d: P.back, side: 'back' }, DA = 0.76 * (W + 1) - 0.5, DJ = 1.9;      // the back door's centre, and half its cased width
  {
    const wa = (w, s0, s1) => A.wainscot(w, s0, s1, { mat: DADO }), ra = (w, s0, s1) => A.rail(w, s0, s1, { mat: DADO });
    wa('left', 0.1, P.front - 0.004); wa('right', 0.1, 6.0); wa('right', 10.6, P.front - 0.004);          // (the desk stands against the right wall)
    wa(PF, 0.22, OA0 - 0.38); wa(PF, OA1 + 0.38, W - 0.22); wa(PB, 0.22, OA0 - 0.38); wa(PB, OA1 + 0.38, W - 0.22);
    wa('left', P.back + 0.004, D - 0.004); wa('right', P.back + 0.004, D - 0.004); wa('back', 0.22, DA - DJ - 0.02); wa('back', DA + DJ + 0.02, W - 0.22);
    for (const w of [PF, PB, 'back']) for (const [s0, s1] of [[0.076, 0.22], [W - 0.22, W - 0.076]]) A.on(w, DADO, s0, s1, 0.004, 0.075, 0.004, 3.2, G);      // the boards carried into the corners
    ra('left', 0.1, P.front - 0.004); ra('right', 0.1, P.front - 0.004); ra(PF, 0.08, W - 0.08);
    ra('left', P.back + 0.004, D - 0.004); ra('right', P.back + 0.004, D - 0.004); ra(PB, 0.08, W - 0.08); ra('back', 0.08, W - 0.08);
    // the picture gallery's colour: from the dado to the rail on all four walls
    const red = (w, s0, s1, z0 = 3.3) => A.on(w, WALLRED, s0, s1, 0.004, 0.02, z0, 9.36);
    red('left', P.back, D - 0.004); red('right', P.back, D - 0.004); red('back', 0.02, DA - 1.55); red('back', DA + 1.55, W - 0.02); red('back', DA - 1.55, DA + 1.55, 6.95);
    red(PB, 0.02, OA0 - 0.36); red(PB, OA1 + 0.36, W - 0.02); red(PB, OA0 - 0.36, OA1 + 0.36, 9.08);
    // the back door, where the real one is: town.js cuts the doorway (3.1 wide, 6.95 high) and hangs the door. Here, its casing and the light over it
    const y = D - 0.022, a0 = DA - 1.55, a1 = DA + 1.55;
    for (const s of [-1, 1]) R.box(A.TRIM, DA + s * (DJ - 0.175) - 0.175, DA + s * (DJ - 0.175) + 0.175, y - 0.1, y, 0.004, 8.3, G);
    R.box(A.TRIM, DA - DJ, DA + DJ, y - 0.1, y, 8.3, 8.66, G); R.box(A.TRIM, DA - DJ - 0.06, DA + DJ + 0.06, y - 0.13, y, 8.66, 8.76, G);
    R.box(A.TRIM, a0, a1, y - 0.08, y, 6.95, 7.14, G);
    R.box('c#1b2430/0.25', a0, a1, y - 0.04, y, 7.14, 8.3); R.box(A.TRIM, DA - 0.03, DA + 0.03, y - 0.07, y - 0.04, 7.14, 8.3, G);
  }

  // ---- a case against a wall, its label on the wall above; f is a frame on the wall, +y out into the room ----------
  function wallCase(f, e, model, o = {}) {
    const w = 2.2, y0 = 0.2, dep = 1.95, h = o.h ?? 3.45, tall = o.tall ?? 1.35, yc = (y0 + dep) / 2;      // it stands just clear of the dado's capping
    let z = plinthCase(f, -w / 2, w / 2, y0, dep, h, tall, o.glass !== false);
    if (o.rise) z = riser(f, 0, yc, z, o.rw ?? 0.8, o.rd ?? 0.6, o.rise);
    kit.model(model, f, 0, yc + (o.my ?? 0), z, 0);
    f.box(DARKW, -LW / 2 - 0.05, LW / 2 + 0.05, 0.004, 0.02, 5.65 - LH / 2 - 0.05, 5.65 + LH / 2 + 0.05); kit.sign(f, 0, 0.032, 5.65, LW, LH, LABEL(e), { cw: LPX[0], ch: LPX[1], rough: 0.9 });
    return { f, z, yc, h };
  }
  const onL = d => at(0.02, d, 0, 'right'), onR = d => at(W - 0.02, d, 0, 'left'), onP = a => at(a, P.front - 0.02, 0, 'street');
  const D1 = 8, D2 = 14, D3 = 20;                            // three stations down each side wall
  // down the left wall: deep time
  { const c = wallCase(onL(D1), EX.megalodon, 'si_megalodon_tooth', { rise: 0.32, rw: 0.7, rd: 0.5 }); for (const s of [-0.1, 0.1]) for (const k of [-0.085, 0.085]) c.f.cyl(BRASS, s, c.yc + k, c.z, c.z + 0.17, 0.008, 0.008, 5); }
  const tri = wallCase(onL(D2), EX.trilobite, 'si_trilobite', { glass: false, h: 3.32, rise: 0.1, rw: 1.3, rd: 0.75, my: 0.06 });
  spot(tri.f, 0, tri.yc, tri.h + 0.4, () => 'touch the trilobite', ctx => ctx.flash('Cool and ridged. It was an animal once.'));
  wallCase(onL(D3), EX.ammonite, 'si_ammonite_exiteloceras', { rise: 0.4, rw: 0.9, rd: 0.7 });
  // down the right wall, beyond the desk: made by hand
  wallCase(onR(D2), EX.kylix, 'si_kylix_greek_cup', { rise: 0.45, rw: 1.0, rd: 0.8 });
  wallCase(onR(D3), EX.commeraw, 'si_stoneware_jug_commeraw', { tall: 1.6, rise: 0.06, rw: 1.2, rd: 1.1 });
  for (const [f, s] of [[onL(D2), 'DEEP TIME'], [onR((D2 + D3) / 2), 'MADE BY HAND']]) kit.sign(f, 0, 0.02, 7.5, 2.2, 0.3, HEAD(s), { cw: 264, ch: 36 });
  // against the partition, one each side of the opening: the same two subjects, carried to the end of the room
  wallCase(onP(4.9), EX.coco, 'si_coco_de_mer_seed', { tall: 1.4, rise: 0.12, rw: 1.5, rd: 1.25 });
  wallCase(onP(W - 4.9), EX.colono, 'si_colonoware_pot', { rise: 0.1, rw: 1.2, rd: 1.1 });

  // ---- cases that stand in the room: label on a slope at the front, facing the door -------------------------
  function floorCase(a, d, e, model, o = {}) {
    const f = at(a, d, 0, 'street'), w = 1.9, dep = 1.8, h = 3.4, tall = 1.4;      // +y toward the door
    let z = plinthCase(f, -w / 2, w / 2, -dep / 2, dep / 2, h, tall);
    if (o.rise) z = riser(f, 0, 0, z, o.rw ?? 0.9, o.rd ?? 0.8, o.rise);
    kit.model(model, f, 0, 0, z, 0, { turn: o.turn ?? 0 });
    lean(f, 0, dep / 2 + 0.48, h - 0.41, LW, LH, 0.95, LABEL(e), ...LPX);
    for (const s of [-0.6, 0.6]) tube(f, BRASS, [[s, dep / 2, h - 0.42], [s, dep / 2 + 0.42, h - 0.5]], 0.02, 5);
    f.block(-0.85, 0.85, dep / 2, dep / 2 + 0.95, 0, h - 0.2);
  }
  floorCase(MID, 12, EX.cherami, 'si_cher_ami_pigeon', { rise: 0.35, rw: 1.2, rd: 0.8 });
  floorCase(MID - 6, 17, EX.lincoln, 'si_abraham_lincoln', { rise: 0.3, rw: 1.0, rd: 0.8 });
  floorCase(MID + 6, 17, EX.stereo, 'si_stereoscope', { rise: 0.5, rw: 1.0, rd: 0.9, turn: 0.5 });

  // ---- Small Wonders of Vesper Street: the one invented case, last before the pictures, catalogued with a straight face ------
  {
    const v = at(MID, 21.6, 0, 'street'), TOP = X.plinth(v, 0, 0, 4.2, 2.0, 3.0, { mat: OAK, shelf: 0.95 });       // +y toward the door, x toward smaller a
    X.glassCase(v, -2.0, 2.0, -0.9, 0.9, TOP, 0.82, { base: 'c#2f4a2a/0.8' });
    const z = TOP + 0.031, xs = i => 1.44 - i * 0.96, zc = z + 0.036;
    [['VS.0001', 'The Lost Sock', 'Wool, one (1). Its partner remains at large.'],
      ['VS.0002', 'A Very Good Stick', 'Sycamore, 61 cm. Donated by a dog, under protest.'],
      ['VS.0003', 'The 10 mm Socket', 'Still where somebody left it. Please do not move it.'],
      ['VS.0004', 'One Evening, Sealed', 'Collected on this street at 7.42. Unchanged.'],
    ].forEach((it, i) => { kit.sign(v, xs(i), 0.48, z + 0.004, 0.86, 0.62, VLABEL(...it), { flat: true, cw: 232, ch: 168, rough: 0.9 }); if (i !== 1) v.box('c#8a1c1c/0.8', xs(i) - 0.3, xs(i) + 0.3, -0.5, -0.02, z, z + 0.035); });
    // the sock
    tube(v, 'c#2f5a6a/0.8', [[xs(0) + 0.2, -0.36, zc + 0.07], [xs(0) - 0.06, -0.36, zc + 0.07], [xs(0) - 0.13, -0.33, zc + 0.07], [xs(0) - 0.15, -0.14, zc + 0.07]], 0.07, 8, true);
    for (const k of [0.16, 0.1]) hcyl(v, 'c#efe2bc/0.8', 'x', xs(0) + k, -0.36, zc + 0.07, 0.025, 0.074, 0.074, 8); ball(v, 'c#efe2bc/0.8', xs(0) - 0.15, -0.12, zc + 0.005, 0.066, 8);
    // the stick, too long for a cushion
    { const x = xs(1); tube(v, 'c#6a4a2a/0.8', [[x - 0.9, -0.5, z + 0.05], [x - 0.3, -0.42, z + 0.06], [x + 0.3, -0.5, z + 0.055], [x + 0.9, -0.42, z + 0.045]], t => 0.04 - 0.014 * t, 6, true); tube(v, 'c#6a4a2a/0.8', [[x + 0.3, -0.5, z + 0.055], [x + 0.5, -0.34, z + 0.07], [x + 0.62, -0.32, z + 0.07]], 0.014, 5, true); }
    // the socket
    v.cyl('c#d4d6d8/0.12/1', xs(2), -0.26, zc, zc + 0.085, 0.042, 0.038, 12); v.cyl('c#17140f/0.45', xs(2), -0.26, zc + 0.085, zc + 0.087, 0.026, 0.026, 6);
    // the jar of evening
    jar(v, xs(3), -0.26, zc, 0.1, 0.27, null, 0, BRASS); ball(v, 'e#ffd9a0/2.2', xs(3), -0.26, zc + 0.05, 0.055, 8);
    lean(v, 0, 1.5, 2.56, 2.2, LH, 0.95, (g, w, h) => {
      paper(g, w, h, PAPER, 5); g.strokeStyle = DEEP; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12);
      T(g, 'Small Wonders of Vesper Street', w * 0.05, h * 0.24, h * 0.15, '#1f2a27', { f: F.playfair, w: 700, a: 'left', max: w * 0.9 });
      T(g, 'Local collection  ·  acquired by gift and by finding', w * 0.05, h * 0.46, h * 0.085, OX, { f: F.fraunces, it: 1, w: 600, a: 'left', max: w * 0.9 });
      para(g, 'The only case in the museum whose labels are not strictly true.', w * 0.05, h * 0.62, h * 0.115, BLUE, w * 0.9, { f: F.caveat, w: 700 });
    }, 550, 260);
    for (const s of [-0.9, 0.9]) tube(v, BRASS, [[s, 1.0, 2.55], [s, 1.44, 2.47]], 0.02, 5);
    v.block(-1.15, 1.15, 1.0, 1.95, 0, 2.8);
    X.pendant(v, 0, 0, { kind: 'dome', drop: 4.6, colour: 'c#2f4a40/0.35', power: 1.0 });
  }

  // ---- the picture gallery: one row on the back wall, three on the left, one on the right, a bench to look from -------
  {
    const CZ = 6.3, outer = p => p.w + (p.paper ? 0.46 : 0.32);
    // hang p on wall frame f at x: the picture, a brass light over it, its card under it
    const hang = (f, p, x) => {
      const tall = p.w / p.r, top = CZ + tall / 2 + (p.paper ? 0.23 : 0.16), hw = Math.min(0.8, p.w * 0.3);
      kit.picture(f, p.file, x, CZ, p.w, tall, p.paper ? { frame: 'c#17140f/0.45', border: 0.08, mat: 0.15 } : { frame: 'c#b08d4a/0.35/1', border: 0.16 });
      kit.sign(f, x, 0.02, 4.2, 1.2, 0.7, PLABEL(p), { cw: 300, ch: 175, rough: 0.9 });
      f.box(BRASS, x - 0.09, x + 0.09, 0, 0.02, top + 0.16, top + 0.4); f.box(BRASS, x - 0.014, x + 0.014, 0.02, 0.4, top + 0.3, top + 0.328);
      f.box(BRASS, x - hw, x + hw, 0.34, 0.5, top + 0.25, top + 0.33); f.box('e#ffe2b4/1.7', x - hw + 0.03, x + hw - 0.03, 0.36, 0.48, top + 0.236, top + 0.25);
    };
    const b = at(W / 2, D - 0.024, 0, 'street');             // on the back wall, just proud of the colour: x runs toward smaller a
    const GAP = 1.0, k = ROW.findIndex(p => p.axis), ac = ROW.map(() => 0); ac[k] = MID;
    for (let i = k - 1; i >= 0; i--) ac[i] = ac[i + 1] - outer(ROW[i + 1]) / 2 - GAP - outer(ROW[i]) / 2;
    for (let i = k + 1; i < ROW.length; i++) ac[i] = ac[i - 1] + outer(ROW[i - 1]) / 2 + GAP + outer(ROW[i]) / 2;
    ROW.forEach((p, i) => hang(b, p, W / 2 - ac[i]));
    const DM = (P.back + D) / 2, l = at(0.024, DM, 0, 'right'), r = at(W - 0.024, DM, 0, 'left');
    PAPERS.forEach((p, i) => hang(l, p, (1 - i) * 4.0));     // x runs toward the street on the left wall
    // the measured drawings of the street's buildings, and the Cézanne
    { const [north, south] = SHEETS, row = [...north, south[2]], pitch = 2.76 + 0.95;                       // Mulberry Street's three and the chapel's, in a row on the right wall
      row.forEach((p, i) => hang(r, p, (i - (row.length - 1) / 2) * pitch));
      const pb = at(0, P.back + 0.024, 0, 'back'), a0 = 0.3, a1 = OA0 - 0.38;                               // South Main Street's two, on the pier left of the opening
      south.slice(0, 2).forEach((p, i) => hang(pb, p, a0 + (a1 - a0) * (i + 0.5) / 2));
      hang(pb, ALONE, (OA1 + 0.38 + W - 0.3) / 2); }                                                        // and the Cézanne alone on the other pier
    for (const x of [-W * 0.24, W * 0.24]) kit.lampAt(b, x, 2.2, 9.2, 0.6);
    // one long bench, on a rug, to sit and look from
    const L = 7, y = D - 7.4, h = lot.fr(kit, 0, 0).h;
    kit.rug(...(() => { const [X0, Y0] = lot.XY(MID - 5.5, y - 3.3), [X1, Y1] = lot.XY(MID + 5.5, y + 3.3); return [Math.min(X0, X1), Math.max(X0, X1), Math.min(Y0, Y1), Math.max(Y0, Y1)]; })(), h, 'mat');
    for (const s of [-1, 1]) { R.box(IRON, MID + s * (L / 2 - 0.4) - 0.05, MID + s * (L / 2 - 0.4) + 0.05, y - 0.7, y + 0.7, 0.05, 1.3); R.box(IRON, MID + s * (L / 2 - 0.4) - 0.07, MID + s * (L / 2 - 0.4) + 0.07, y - 0.74, y + 0.74, 0.04, 0.1); }
    R.box(OAK, MID - L / 2, MID + L / 2, y - 0.8, y + 0.8, 1.3, 1.44, G); R.soft(LEATHER, MID - L / 2 + 0.06, MID + L / 2 - 0.06, y - 0.74, y + 0.74, 1.44, 1.62, 0.06);
    R.block(MID - L / 2, MID + L / 2, y - 0.8, y + 0.8, 0, 1.62);
    for (const q of [-2.2, 0, 2.2]) kit.seat(R, MID + q, y, 1.62, 'sit and look at the pictures');
    for (const a of [MID - 9, MID, MID + 9]) X.pendant(R, a, 37, { kind: 'globe', drop: 3.0, power: 0.85 });
  }

  // ---- the desk, on the right wall: the visitors' book, a bell, a lamp ------------------------------------------
  const c = at(W - 0.02, 8.3, 0, 'left');               // x runs toward the back of the shop, +y out into the room
  {
    const TOP = X.counter(c, -2.2, 2.2, 0.06, 2.0, 3.1, { front: GREEN, top: DESKTOP });
    c.box('c#6e2a26/0.8', -0.92, 0.92, 0.72, 1.82, TOP + 0.002, TOP + 0.05); c.box(CREAMP, -0.88, 0.88, 0.76, 1.78, TOP + 0.05, TOP + 0.085);
    kit.sign(c, 0, 1.27, TOP + 0.089, 1.74, 1.0, SIGNS.book, { flat: true, cw: 480, ch: 276, rough: 0.9 });
    tube(c, 'c#17140f/0.45', [[1.1, 1.0, TOP + 0.02], [1.22, 1.7, TOP + 0.02]], 0.014, 5, true); tube(c, BRASS, [[1.22, 1.7, TOP + 0.02], [1.235, 1.78, TOP + 0.02]], 0.011, 5, true);
    spot(c, 0, 1.27, TOP + 0.2, () => 'open the visitors\' book', () => { openGuestbook(); });      // the same book as the mailbox at Anna's House (guestbook.js)
    ves(c, BRASS, -1.55, 1.2, TOP, [[0, 0], [0.17, 0], [0.17, 0.02], [0.14, 0.05], [0.12, 0.12], [0.06, 0.17], [0, 0.18]], 16); c.cyl('c#17140f/0.45', -1.55, 1.2, TOP + 0.17, TOP + 0.22, 0.02, 0.02, 6);
    kit.tableLamp(c, 1.7, 0.6, TOP, 'c#2f5a6a/0.4', { base: 'gourd' });
    c.box(DARKW, -0.7, 0.7, 0.004, 0.02, 5.2, 6.1); kit.sign(c, 0, 0.032, 5.65, 1.3, 0.8, SIGNS.hours, { cw: 208, ch: 128, rough: 0.9 });   // the one notice
    kit.pottedPlant(c, -3.1, 0.75, 0, 'fern', { size: 1.1 });
  }

  // ---- the windows: one piece each side, seen from the street, its label facing the glass ------------------------
  for (const [ac, e, right] of [[5.55, EX.whale, 0], [W - 5.55, EX.monster, 1]]) {
    const w = at(ac, 2.05, 0, 'street'), a0 = ac - 3.75, a1 = ac + 3.75;      // +y toward the glass, x toward smaller a
    R.box(GREEN, a0, a1, 0.45, 3.65, 0, 1.86, G); R.box(LINENC, a0, a1, 0.45, 3.65, 1.86, 1.9); R.block(a0, a1, 0, 3.65, 0, 2.6);
    const lx = right ? 2.7 : -2.7;
    lean(w, lx, 1.2, 2.5, LW, LH, 0.2, LABEL(e), ...LPX); tube(w, DARKW, [[lx, 1.14, 2.4], [lx, 0.75, 1.9]], 0.03, 5, true);
    if (!right) kit.model('bronze_whale_statue', w, 0.3, -0.05, 1.9, 1);
    else { w.box(DESKTOP, -1.15, 1.15, -1.0, 1.0, 1.9, 2.0, G); w.box(GREEN, -1.05, 1.05, -0.9, 0.9, 2.0, 2.9, G); kit.model('si_kneeling_winged_monster', w, 0, 0, 2.9, 0); }
    X.pendant(w, 0, 0.3, { kind: 'bulb', drop: 3.2, power: 1.0 });
  }

  // ---- lamps over the room -----------------------------------------------------------------------------------------
  X.pendant(R, MID, 11, { kind: 'dome', drop: 4.3, colour: 'c#2f4a40/0.35', power: 1.0 });
  for (const [a, d] of [[5, 16.2], [W - 5, 16.2]]) X.pendant(R, a, d, { kind: 'globe', drop: 3.6, power: 0.85 });

  // ---- out on the pavement --------------------------------------------------------------------------------------------
  {
    X.aBoard(K.wrap(lot.frOut(kit, MID + 4.3, 5.4, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h); chalk(g, 'MUSEUM', w / 2, h * 0.2, h * 0.12, '#e9c46a'); chalk(g, 'free.', w / 2, h * 0.46, h * 0.11); chalk(g, 'come in.', w / 2, h * 0.6, h * 0.11); chalk(g, 'it is small.', w / 2, h * 0.74, h * 0.11, '#9fc6b0'); });
    // an empty gilt frame on two posts, for looking at the evening through
    const o = K.wrap(lot.frOut(kit, 3.6, 6.9, 0, 'left')), GILT = 'c#b08d4a/0.35/1', b = 0.2;
    const prof = [[-0.012, 0.0], [-0.012, 0.05], [0.0, 0.062], [b * 0.18, 0.07], [b * 0.35, 0.075], [b * 0.5, 0.068], [b * 0.62, 0.072], [b * 0.8, 0.082], [b * 0.92, 0.078], [b, 0.065], [b, 0.0]];
    for (const q of [0, 2]) kit.put(o.sub(0, 0, 0, q), GILT, kit.geom.moulding(2.7, 1.9, prof), { at: [0, 0, 5.0] });
    for (const s of [-1.5, 1.5]) { o.cyl(IRON, s, 0, 0, 0.06, 0.22, 0.24, 10); o.cyl(IRON, s, 0, 0.06, 6.1, 0.04, 0.04, 8); o.block(s - 0.2, s + 0.2, -0.2, 0.2, 0, 6); }
    o.box(IRON, -1.0, 1.0, -0.02, 0.02, 3.5, 3.86);
    for (const q of [0, 2]) kit.sign(o.sub(0, 0, 0, q), 0, 0.032, 3.68, 1.9, 0.32, SIGNS.evening, { cw: 380, ch: 64, rough: 0.5 });
  }

  // ---- Quill ------------------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'quill', name: 'Quill', lot: 'museum', look: { shape: 'tall', colour: '#3a4a44', belly: '#efe4cf', trim: '#c9a45c', hat: 'none', bowtie: '#8a1c1c', specs: true, antenna: true, eye: '#ffe9c0', ring: 0xf0d8a0, tool: 'duster' },
    home: lot.world(W - 4.6, 8.3), faces: lot.world(MID, 3), posts: [lot.world(MID + 3.6, 8), lot.world(W - 5, 17), lot.world(MID + 3, D - 10.5), lot.world(W - 4.6, 8.3)],
    lines: {
      greet: ['Good evening. Admission is free.', 'Welcome. It is two rooms. Take your time.'],
      idle: ['*dusts the megalodon tooth, then the glass, then the label*', '*straightens a picture by one millimetre*', 'The pigeon and I have an understanding.', '*re-reads a label. nods*'],
      bye: ['Come back. Everything will be where you left it.', 'Look closely at something on the way home.'],
      topics: [
        { q: 'What should I look at first?', a: 'Cher Ami, straight ahead. A pigeon who carried a message in 1918 and was given a medal for it.' },
        { q: 'Is everything in here real?', a: 'Every object is a scan of a real one, and the pictures are real paintings. One case is not strictly true. You will know it.' },
        { q: 'Why "small" wonders?', a: 'We have one tooth of a megalodon. That is the right amount of megalodon for this room.' },
        { q: 'Which picture is your favourite?', a: 'I am not supposed to have one. It is the Milkmaid. The only thing moving is the milk.' },
        { q: 'May I really touch the trilobite?', a: 'Please do. It has lasted 390 million years. It can manage you.' },
      ],
    },
  });

  kit.later.push(ctx => { for (const u of use) ctx.interact.push({ x: u.x, y: u.y, z: u.z, reach: u.reach, label: u.label, act: () => { try { u.act(ctx); } catch { /* a passing note is not worth a crash */ } } }); });
}
