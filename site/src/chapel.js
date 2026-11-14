// The Chapel: the last building on the south side of Vesper Street, beside the Overlook.
//
// Its body is a real one: the First Baptist Church, 416 Vine Street, Madison, Indiana (1853-60), as measured
// for the Historic American Buildings Survey in the summer of 1978 (HABS IN-127, four sheets, drawn by Richard
// Berliner, Jon Lourie, Eric Swanson and Peter Whitehead under John P. White; https://www.loc.gov/item/in0025/;
// the sheets are in research/chapel/in0025). Brick, Greek Revival: Tuscan pilasters, a recessed panel with a segmental head in
// every bay, a plain brick entablature under a wooden dentil cornice, a low pediment, a pedimented hood on
// two consoles over the door, a lantern on each pilaster beside it, tall windows of coloured glass over
// short ones. The real church is 45'-2" by 75'-6"; this one is two thirds of it (eight inches to the foot),
// 30 ft by 50, every height and opening scaled the same.
//
// What is not the real building:
//   one room the whole height (the real one has a meeting hall below and the auditorium above)
//   the far end wall (the real one is hidden by a later addition): plain, with one window, the tallest
//   the bell-cote on the ridge, which is the one on the Second Presbyterian Church three streets away
//     (Edwin J. Peck, 1835; HABS IN-24-15, sheet 2, "Bell ordered in 1837"; research/chapel/in0161)
//   the glass. Each tall window is one round-headed light, and its picture is drawn for the whole of it. The
//     subjects are Anna's eight from the chapel in her garden and four in the same hand:
//       over the door         murmuration, Lorenz and McCulloch & Pitts either side
//       west wall, from door  Life (it moves), Turing, the strange loop, eigen-behaviour (the evening sun)
//       east wall, from door  Cajal's neuron, broken symmetry, Darwin's tree, the logistic map
//       the far end           ingressing minds, behind the stone table
//     The short windows under them are leaded too: pale quarries in the border of the window above, and one
//     small roundel each that answers it (a glider under Life, a seedling under Darwin's tree).
//
// Inside: a boarded dado, pews, the stone table with candles and a bowl of water, a lectern on the step with
// a book open at the last paragraph of the Origin of Species, one board of numbers, the bell rope, and Wren.
// Outside: the churchyard on the west (a gate from the Overlook, a path, a bench, one stone) and the
// green on the east (stepping stones and a bench).
//
// The glass is drawn in chapel/glass.js, a little at a time after start-up: the end window and ten of the
// tall ones on ONE sheet, the ten short windows on a second, and the Life window on
// a canvas of its own (it is redrawn every second while someone is looking at it). The sun lays every
// window's colours on the floor and walls (one mesh lining the room).
//
//   chapelShell(B, t)        walls, floor, roof; rooms, portals, colliders (from town.js)
//   furnishChapel(kit, town) what stands in it and round it; Wren (from shops/index.js)
//   chapelLife(ctx, K)       glass, roof, light, bell, vane, planting (from street.js, once the scene exists)

import * as THREE from 'three';
import { outdoorLit } from './lighting.js';
import { wind, CardSet, crossGeo, rosetteGeo, place, cellUV } from './street/cards.js';
import { KINDS } from './street/flora.js';
import { FLORA_CELLS } from './street/paint.js';
import { WINDOWS, TALL, makeLife, lowLight, poolCopy, w7Outline, W7_SHOULDER, FONT, rng, LOOP_EYE } from './chapel/glass.js';
import { T, F, fill, para, paper, line } from './draw.js';

// ---- where it stands -----------------------------------------------------------------------------------
// town.js CHAPEL_SITE.street: Y 160 to 198, building line X = -24. Everything below is laid out in the
// chapel's OWN feet: x across the nave, z from the front wall's outer face back along the nave, the door
// facing -z. On the street that is a quarter turn: the door faces north onto the pavement, the nave runs back
// south, local -x is the west flank (the Overlook, the sunset) and local +x the east flank (the green).
const SITE = { cx: -24.6, cz: -182 };                          // the middle of the front wall's outer face, in world x, z
const M = new THREE.Matrix4().makeRotationY(-Math.PI / 2).setPosition(SITE.cx, 0, SITE.cz);
const toW = (x, z) => [SITE.cx - z, SITE.cz + x];
const vecW = ([x, y, z]) => [-z, y, x];
const rectW = (x0, x1, z0, z1) => ({ x0: SITE.cx - Math.max(z0, z1), x1: SITE.cx - Math.min(z0, z1), z0: SITE.cz + Math.min(x0, x1), z1: SITE.cz + Math.max(x0, x1) });

// ---- the real building's measures (feet, off the HABS sheets), at two thirds ----------------------------
const SC = 2 / 3, PAVE = 0.5, R = ft => PAVE + ft * SC;      // a height on the drawings, above the pavement
const FLR = 1.0;                                             // the floor: one step up, as drawn
const OX = 45.17 * SC / 2, TH = 1.2, IX = OX - TH;           // half the width outside (45'-2"); the walls; inside
const OZ0 = 0, IZ0 = TH, OZ1 = 75.5 * SC, IZ1 = OZ1 - TH;    // the front to the far end wall (75'-6")
const GD = 0.6;                                              // the glass, this far in from the wall's outer face
const CEIL = R(34.5);                                        // the flat plaster ceiling
const BASE = 1.1, SPRING = R(30.8), CROWN = R(32);           // the stone base course (1'-5" on the drawings; here it also takes up the pavement's half foot); the panels' segmental heads
const PIL = { w: 3.05 * SC, out: 0.35, top: R(31.5) }, CAP = R(33);      // pilasters; the top of their capitals
const BAND = R(35.5), DENT = R(37.4), EAVEY = R(39), OVER = 1.35;        // the entablature: a fillet, the dentils, the cornice's top and its reach
const EAVE = OX + OVER, PITCH = 0.378;                       // the roof: 9'-4" of rise to the apex, 48'-4" above the pavement
const yO = d => EAVEY + (EAVE - d) * PITCH, RIDGE = yO(0);   // the roof's top, d feet from the middle line
const UP = { y: R(15.7), h: 14.3 * SC, w: 4.5 * SC }, LOW = { y: R(3.7), h: 7.7 * SC, w: 4.5 * SC };      // the two tiers of windows (sill, height, width of the frame)
const DOOR = { hw: 2.0, h: 10.7 * SC }, HOOD = { hw: 3.45, y: R(13), peak: R(15.25) };
const FX = 9.35, BAYS_Z = [15.3, 25.125, 34.925, 44.54];     // the front's side bays; the four window bays down each flank (the first bay is blind)
const GREAT = { w: 5.34, h: 10.68, y0: FLR + 6.6 };          // the end window (not the real building's)
const BC = { z: 3.4, hw: 1.8, foot: RIDGE + 0.5, top: RIDGE + 4.1, peak: RIDGE + 4.75 };      // the bell-cote
const DAIS = { z0: 39.5, y: FLR + 0.5 };
const TABLE = { x0: -3.4, x1: 3.4, z0: 42.8, z1: 45.2, y: DAIS.y + 3.3 };
const PEWS = { rows: [12, 16, 20, 24, 28, 32], x0: 2.4, x1: 9.6 };
// The churchyard, west of the nave, where the street's animals expect it (world x -35.5 to -84.5, z -197.5 to -223;
// the path's middle on z = -210): its wall, the gate's middle, its west side, its far end, the path's two ends
const YARD = { zw: 10.9, gx: -28, xW: -41, z1: 59.9, p0: 15.4, p1: 51.9 };

const BRICK = 'brick#a98572', PL = 'plaster#f1eadc', TRIM = 'c#efe6d2/0.7', STONE = 'c#d5cebf/0.85', DOORPAINT = 'c#58786e/0.6', SASH = 'c#2e3833/0.6', IRON = 'c#2a2926/0.45/0.7', DADO = 'c#b4bca9/0.8';

// ---- the four walls, each in its own terms: a along it, d in from its outer face -------------------------
const planeM = (dir, at) => { const a = new THREE.Vector3(...dir), up = new THREE.Vector3(0, 1, 0); return new THREE.Matrix4().makeBasis(a, up, a.clone().cross(up)).setPosition(...at); };
const WALL = {
  F: { box: (b, m, a0, a1, y0, y1, d0, d1, o) => b(m, a0, a1, y0, y1, d0, d1, o), M: (a, d) => planeM([1, 0, 0], [a, 0, d]), at: (a, y, d) => [a, y, d], n: [0, 0, -1], u: [1, 0, 0] },
  R: { box: (b, m, a0, a1, y0, y1, d0, d1, o) => b(m, a0, a1, y0, y1, OZ1 - d0, OZ1 - d1, o), M: (a, d) => planeM([-1, 0, 0], [a, 0, OZ1 - d]), at: (a, y, d) => [a, y, OZ1 - d], n: [0, 0, 1], u: [-1, 0, 0] },
  W: { box: (b, m, a0, a1, y0, y1, d0, d1, o) => b(m, -OX + d0, -OX + d1, y0, y1, a0, a1, o), M: (a, d) => planeM([0, 0, -1], [-OX + d, 0, a]), at: (a, y, d) => [-OX + d, y, a], n: [-1, 0, 0], u: [0, 0, -1] },
  E: { box: (b, m, a0, a1, y0, y1, d0, d1, o) => b(m, OX - d0, OX - d1, y0, y1, a0, a1, o), M: (a, d) => planeM([0, 0, 1], [OX - d, 0, a]), at: (a, y, d) => [OX - d, y, a], n: [1, 0, 0], u: [0, 0, 1] },
};
// What each elevation has: pilasters [from, to], recessed panels [middle, width], the windows' middles
const FLANK = { a0: OZ0, a1: OZ1, i0: IZ0, i1: IZ1, pil: [[-PIL.out, PIL.w], [9.385, 11.415], [19.185, 21.215], [29.035, 31.065], [38.785, 40.815], [OZ1 - PIL.w, OZ1 + PIL.out]],
  panels: [[5.7, 5.2], ...BAYS_Z.map(c => [c, 5.6])], up: BAYS_Z, low: BAYS_Z };
const SPEC = {
  F: { a0: -OX, a1: OX, i0: -IX, i1: IX, pil: [[-OX - PIL.out, -OX + PIL.w], [-5.685, -3.655], [3.655, 5.685], [OX - PIL.w, OX + PIL.out]], panels: [[-FX, 5.13], [0, 5.13], [FX, 5.13]], up: [-FX, 0, FX], low: [-FX, FX], door: true },
  R: { a0: -OX, a1: OX, i0: -IX, i1: IX, pil: [[-OX - PIL.out, -OX + PIL.w], [OX - PIL.w, OX + PIL.out]], panels: [], up: [], low: [], great: true },
  W: FLANK, E: FLANK,
};
const GHW = GREAT.w / 2 + 0.15;
// The openings through a wall, [a0, a1, y0, y1] (the window over the door is cut the door's width and made up at the sides)
const holes = k => {
  const s = SPEC[k], hw = UP.w / 2, out = [];
  for (const c of s.up) { const w = s.door && c === 0 ? DOOR.hw : hw; out.push([c - w, c + w, UP.y, UP.y + UP.h]); }
  for (const c of s.low) out.push([c - hw, c + hw, LOW.y, LOW.y + LOW.h]);
  if (s.door) out.push([-DOOR.hw, DOOR.hw, -1, FLR + DOOR.h]);
  if (s.great) out.push([-GHW, GHW, GREAT.y0 - 0.15, GREAT.y0 + GREAT.h + 0.15]);
  return out;
};
const fills = k => (SPEC[k].door ? [[-DOOR.hw, -UP.w / 2, UP.y, UP.y + UP.h], [UP.w / 2, DOOR.hw, UP.y, UP.y + UP.h]] : []);
const inner = k => [...pieces(SPEC[k].i0, SPEC[k].i1, FLR, CEIL, holes(k)), ...fills(k)];      // the plaster faces of a wall

// ---- the glass --------------------------------------------------------------------------------------------
// A tall window's glass is one light, the whole opening inside its frame, and its picture is drawn for that
// shape (round-headed: the arch and its dark spandrels are in the drawing, as are the saddle bars). n is the
// way out; u the way a picture runs, seen from inside.
const PW = UP.w - 0.34, GH = UP.h - 0.44, UPG = UP.y + 0.22, LOWH = LOW.h - 0.44;
const pane = (k, a, y, w, h, more = {}) => ({ c: WALL[k].at(a, y, GD), n: WALL[k].n, u: WALL[k].u, w, h, ...more });
const pic = (id, k, a) => ({ id, ...pane(k, a, UPG + GH / 2, PW, GH) });
const GLASS = [
  ...['life', 'turing', 'loop', 'eigen'].map((id, i) => pic(id, 'W', BAYS_Z[i])),
  ...['neuron', 'symmetry', 'tree', 'logistic'].map((id, i) => pic(id, 'E', BAYS_Z[i])),
  pic('lorenz', 'F', -FX), pic('calculus', 'F', FX), pic('murmuration', 'F', 0),
  { id: 'ingression', ...pane('R', 0, GREAT.y0 + GREAT.h / 2, GREAT.w, GREAT.h, { gable: true }) },
];
// The short windows, each under the tall one it answers
const LOWG = GLASS.filter(w => !w.gable && w.id !== 'murmuration').map(w => ({ ...w, c: [w.c[0], LOW.y + LOW.h / 2, w.c[2]], h: LOWH }));
const inWorld = g => ({ ...g, c: [SITE.cx - g.c[2], g.c[1], SITE.cz + g.c[0]], n: vecW(g.n), u: vecW(g.u) });
const GLASSW = GLASS.map(inWorld), LIGHTS = [...GLASSW, ...LOWG.map(inWorld)];      // the twelve pictures; every window that throws colour

export const CHAPEL = { floor: FLR, door: { x: SITE.cx, z: SITE.cz, yaw: -Math.PI / 2 }, inside: rectW(-IX, IX, IZ0, IZ1), footprint: rectW(-OX - 0.5, OX + 0.5, OZ0 - 1.25, OZ1 + 0.5),
  churchyard: rectW(-OX - 0.45, YARD.xW, YARD.zw, YARD.z1), gatePath: rectW(YARD.gx - 4, YARD.gx + 4, YARD.zw - 0.85, YARD.p0), yardPath: rectW(YARD.gx - 2, YARD.gx + 2, YARD.p0, YARD.p1), glass: GLASSW,
  source: 'First Baptist Church, 416 Vine Street, Madison, Indiana (HABS IN-127), at two thirds' };
// A builder that takes the chapel's own feet and sets the piece down on the street
function local(B) {
  return {
    wbox(mat, x0, x1, y0, y1, z0, z1, o = {}) {
      if (x0 > x1) [x0, x1] = [x1, x0]; if (y0 > y1) [y0, y1] = [y1, y0]; if (z0 > z1) [z0, z1] = [z1, z0];
      const sx = x1 - x0, sy = y1 - y0, sz = z1 - z0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
      const g = new THREE.BoxGeometry(sx, sy, sz).toNonIndexed(), p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i) + (o.rot ? 0 : cx), y = p.getY(i) + (o.rot ? 0 : cy), z = p.getZ(i) + (o.rot ? 0 : cz); let u, v, du, dv;
        if (Math.abs(n.getX(i)) > 0.5) { u = z; v = y; du = sz; dv = sy; } else if (Math.abs(n.getY(i)) > 0.5) { u = x; v = z; du = sx; dv = sz; } else { u = x; v = y; du = sx; dv = sy; }
        if (o.swap || (o.grain === 'long' && du > dv)) [u, v] = [v, u];
        uv.setXY(i, u, v);
      }
      if (o.rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...o.rot)));
      g.translate(cx, cy, cz); g.applyMatrix4(M); B.mesh(mat, g);
    },
    mesh(mat, g) { g.applyMatrix4(M); B.mesh(mat, g); },
    colliders: { push: (...cs) => { for (const c of cs) B.colliders.push({ ...rectW(c.x0, c.x1, c.z0, c.z1), y0: c.y0, y1: c.y1 }); } },
  };
}
const MINE = { candles: [], water: null, cam: null, asked: null };      // what furnishChapel leaves for chapelLife, and chapelLife for Wren

// ======================================================================================================
// The shell
// ======================================================================================================
export function chapelShell(B0, t) {
  const B = local(B0), CURB = t.CURB ?? PAVE, surf = (x0, x1, z0, z1, h) => t.surfaces.push({ ...rectW(x0, x1, z0, z1), h });
  const box = (mat, x0, x1, y0, y1, z0, z1, o) => B.wbox(mat, x0, x1, y0, y1, z0, z1, o);
  const solid = (x0, x1, z0, z1, y1, y0 = 0) => B.colliders.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), y0, y1 });
  const beam = (mat, a, b, w, h = w) => B.mesh(mat, beamGeo(a, b, w, h));
  const prism = (mat, pts, depth, m) => B.mesh(mat, new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([a, y]) => new THREE.Vector2(a, y))), { depth, bevelEnabled: false }).applyMatrix4(m));

  // ---- the way in, the floor -------------------------------------------------------------------------
  box('pavers', -OX - 0.5, OX + 0.5, -0.6, CURB - 0.012, -0.62, 0.3); surf(-OX - 0.5, OX + 0.5, -0.62, 0, CURB);      // the pavement, carried back to the wall
  box(STONE, -2.9, 2.9, 0, FLR, -1.25, 0); surf(-2.9, 2.9, -1.25, 0, FLR);                                          // the one step
  box(STONE, -DOOR.hw, DOOR.hw, 0, FLR, 0, IZ0); surf(-DOOR.hw, DOOR.hw, -0.1, IZ0 + 0.1, FLR);
  box('floor', -IX, IX, FLR - 0.3, FLR, IZ0, IZ1); surf(-IX, IX, IZ0, IZ1, FLR);
  box('floor', -IX, IX, FLR, DAIS.y, DAIS.z0, IZ1); surf(-IX, IX, DAIS.z0, IZ1, DAIS.y);

  // ---- the four walls ----------------------------------------------------------------------------------
  for (const k of ['F', 'R', 'W', 'E']) {
    const s = SPEC[k], W = WALL[k], wb = (m, ...r) => W.box(box, m, ...r), hs = holes(k), fl = fills(k), d0 = s.panels.length ? 0.25 : 0;
    for (const [a0, a1, y0, y1] of [...pieces(s.a0, s.a1, 0, CAP, hs), ...fl]) wb(BRICK, a0, a1, y0, y1, d0, GD);                       // brick
    for (const [a0, a1, y0, y1] of [...pieces(s.i0, s.i1, FLR - 0.2, CEIL, hs), ...fl]) wb(PL, a0, a1, y0, y1, GD, TH);                  // plaster within
    if (d0) {      // the wall's face, with a panel sunk in every bay under a segmental head
      for (const [a0, a1, y0, y1] of pieces(s.a0, s.a1, 0, CAP, s.panels.map(([c, w]) => [c - w / 2, c + w / 2, s.door && c === 0 ? -1 : BASE, CAP]))) wb(BRICK, a0, a1, y0, y1, 0, d0);
      for (const [c, w] of s.panels) {
        const pts = [[w / 2, CAP], [-w / 2, CAP]]; for (let i = 0; i <= 12; i++) { const q = i / 12 * 2 - 1; pts.push([q * w / 2, SPRING + (CROWN - SPRING) * (1 - q * q)]); }
        prism(BRICK, pts, d0, W.M(c, 0));
      }
    }
    for (const [a0, a1] of (s.door ? [[s.a0, -DOOR.hw - 0.6], [DOOR.hw + 0.6, s.a1]] : [[s.a0, s.a1]])) wb(STONE, a0, a1, 0, BASE, -0.1, 0.3);      // the stone base course
    for (const [p0, p1] of s.pil) {      // Tuscan pilasters: brick shafts, stone bases and capitals
      wb(STONE, p0 - 0.08, p1 + 0.08, 0, BASE, -PIL.out - 0.1, 0.02); wb(BRICK, p0, p1, BASE, PIL.top, -PIL.out, 0.02);
      wb(TRIM, p0 - 0.04, p1 + 0.04, PIL.top, PIL.top + 0.22, -PIL.out - 0.05, 0.02); wb(TRIM, p0 - 0.13, p1 + 0.13, PIL.top + 0.22, PIL.top + 0.6, -PIL.out - 0.15, 0.02); wb(TRIM, p0 - 0.27, p1 + 0.27, PIL.top + 0.6, CAP, -PIL.out - 0.27, 0.02);
    }
    // the entablature: brick, a fillet, then the wooden cornice on its dentils
    const e0 = s.a0 - 0.3, e1 = s.a1 + 0.3;
    wb(BRICK, e0, e1, CAP, DENT + 0.35, -0.3, GD); wb(TRIM, e0 - 0.15, e1 + 0.15, BAND - 0.14, BAND + 0.12, -0.45, 0);
    for (let a = e0 + 0.25; a < e1; a += 0.5) wb(TRIM, a - 0.12, a + 0.12, DENT, DENT + 0.35, -0.55, -0.3);
    wb(TRIM, e0 - 0.45, e1 + 0.45, DENT + 0.35, DENT + 0.55, -0.75, 0.3); wb(TRIM, e0 - 0.95, e1 + 0.95, DENT + 0.55, EAVEY - 0.18, -1.25, 0.3); wb(TRIM, e0 - 1.05, e1 + 1.05, EAVEY - 0.18, EAVEY, -OVER, 0.3);
    // the windows: a stone sill and cap, a painted frame (the tall ones are a single light now: no bars across)
    const win = (c, y0, h, bars) => {
      const hw = UP.w / 2, f = 0.17, r = 0.22;
      wb(STONE, c - hw - 0.25, c + hw + 0.25, y0 - 0.3, y0 + 0.012, d0 - 0.2, GD - 0.02); wb(STONE, c - hw - 0.45, c + hw + 0.45, y0 + h - 0.012, y0 + h + 0.42, d0 - 0.17, d0 + 0.1);      // (a hair proud of the opening's own faces, which they would otherwise share)
      wb(TRIM, c - hw - 0.15, c + hw + 0.15, y0 - 0.1, y0 + 0.01, GD, TH + 0.18);
      for (const sg of [-1, 1]) wb(SASH, c + sg * hw, c + sg * (hw - f), y0, y0 + h, GD - 0.16, GD + 0.16);
      wb(SASH, c - hw, c + hw, y0, y0 + r, GD - 0.16, GD + 0.16); wb(SASH, c - hw, c + hw, y0 + h - r, y0 + h, GD - 0.16, GD + 0.16);
      for (const y of bars) wb(SASH, c - hw + f, c + hw - f, y - 0.07, y + 0.07, GD - 0.1, GD + 0.1);
    };
    for (const c of s.up) win(c, UP.y, UP.h, []);
    for (const c of s.low) win(c, LOW.y, LOW.h, []);
    // the gable: brick behind the raking cornice
    if (k === 'F' || k === 'R') prism(BRICK, [[-OX - 0.3, EAVEY - 0.1], [OX + 0.3, EAVEY - 0.1], [OX + 0.3, yO(OX + 0.3) - 0.3], [0, RIDGE - 0.3], [-OX - 0.3, yO(OX + 0.3) - 0.3]], 0.5, W.M(0, 0.1));
  }
  for (const s of [-1, 1]) {
    for (const z of [OZ0 - OVER / 2 + 0.15, OZ1 + OVER / 2 - 0.15]) beam(TRIM, [s * EAVE, yO(EAVE) - 0.42, z], [0, RIDGE - 0.42, z], 0.75, OVER + 0.3);      // the raking cornice
    solid(s * IX, s * (OX + PIL.out), OZ0, OZ1, CEIL + 4);
    solid(s * DOOR.hw, s * OX, OZ0 - 0.3, IZ0, 40);
  }
  B.colliders.push({ x0: -DOOR.hw, x1: DOOR.hw, z0: OZ0, z1: IZ0, y0: FLR + DOOR.h, y1: 40 });
  solid(-OX, OX, IZ1, OZ1 + 0.3, 40);

  // ---- the doorway: a casing, a frieze (lettered in furnishChapel), the pedimented hood on two consoles,
  // both leaves folded back inside, a lantern on the pilaster each side -----------------------------------
  {
    const F_ = WALL.F, top = FLR + DOOR.h;
    for (const s of [-1, 1]) box(TRIM, s * (DOOR.hw - 0.04), s * (DOOR.hw + 0.6), 0, top + 0.5, -0.02, TH + 0.05);
    box(TRIM, -DOOR.hw - 0.6, DOOR.hw + 0.6, top - 0.04, top + 0.5, -0.02, TH + 0.05);
    box(TRIM, -DOOR.hw - 0.75, DOOR.hw + 0.75, top + 0.5, HOOD.y, -0.06, 0.3);
    box(TRIM, -HOOD.hw, HOOD.hw, HOOD.y, HOOD.y + 0.25, -1.25, 0.3);
    prism(TRIM, [[-HOOD.hw, HOOD.y + 0.25], [HOOD.hw, HOOD.y + 0.25], [0, HOOD.peak]], 1.2, F_.M(0, -1.2));
    for (const s of [-1, 1]) {
      box(TRIM, s * 2.64, s * 3.22, HOOD.y - 0.85, HOOD.y, -1.05, 0.02); box(TRIM, s * 2.7, s * 3.16, HOOD.y - 1.45, HOOD.y - 0.85, -0.55, 0.02);      // the console
      box(DOORPAINT, s * (DOOR.hw + 0.1), s * (DOOR.hw * 2 + 0.05), FLR + 0.05, top - 0.05, TH + 0.06, TH + 0.2);                                    // the leaf, back against the wall
      box(DOORPAINT, s * (DOOR.hw + 0.5), s * (DOOR.hw * 2 - 0.35), FLR + 0.9, top - 0.9, TH + 0.2, TH + 0.25);
      // the lantern: iron and amber glass (it glows from dusk; furnishChapel gives it a lamp)
      const lx = s * 4.67, ly = 5.3, lz = -PIL.out - 0.55;
      box(IRON, lx - 0.04, lx + 0.04, ly + 0.9, ly + 0.97, lz, -PIL.out); box(IRON, lx - 0.26, lx + 0.26, ly + 0.62, ly + 0.72, lz - 0.26, lz + 0.26); box(IRON, lx - 0.22, lx + 0.22, ly - 0.08, ly, lz - 0.22, lz + 0.22);
      box(IRON, lx - 0.05, lx + 0.05, ly + 0.72, ly + 0.95, lz - 0.05, lz + 0.05);
      for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(IRON, lx + dx * 0.19 - 0.025, lx + dx * 0.19 + 0.025, ly, ly + 0.62, lz + dz * 0.19 - 0.025, lz + dz * 0.19 + 0.025);
      box('e#ffd9a0/2.2', lx - 0.17, lx + 0.17, ly + 0.01, ly + 0.61, lz - 0.17, lz + 0.17);
    }
  }

  // ---- the end window: its head (two pieces, so that nothing is cut as a hole), its frame and sill ------
  {
    const yS = GREAT.y0 - 0.15 + (GREAT.h + 0.3) * W7_SHOULDER, yT = GREAT.y0 + GREAT.h + 0.15, W = WALL.R;
    for (const s of [-1, 1]) for (const [mat, d, th] of [[BRICK, 0, GD], [PL, GD, TH - GD]]) prism(mat, s < 0 ? [[-GHW, yS], [0, yT], [-GHW, yT]] : [[GHW, yS], [GHW, yT], [0, yT]], th, W.M(0, d));
    const head = (w, h, y0) => w7Outline(w, h).map(([u, v]) => [u - w / 2, y0 + h - v]);
    frameRing(B, SASH, head(GREAT.w + 0.4, GREAT.h + 0.4, GREAT.y0 - 0.2), head(GREAT.w - 0.24, GREAT.h - 0.24, GREAT.y0 + 0.12), new THREE.Matrix4().setPosition(0, 0, OZ1 - GD - 0.18), 0.36);
    box(STONE, -GHW - 0.3, GHW + 0.3, GREAT.y0 - 0.5, GREAT.y0 - 0.15, OZ1 - GD, OZ1 + 0.2); box(TRIM, -GHW - 0.2, GHW + 0.2, GREAT.y0 - 0.27, GREAT.y0 - 0.14, IZ1 - 0.2, OZ1 - GD);
  }

  // ---- the ceiling and its cornice; the roof's two chimneys; the bell-cote ------------------------------
  box(PL, -IX, IX, CEIL, CEIL + 0.3, IZ0, IZ1);
  for (const s of [-1, 1]) { box(PL, s * IX, s * (IX - 0.4), CEIL - 0.9, CEIL, IZ0, IZ1); box(PL, s * IX, s * (IX - 0.85), CEIL - 0.3, CEIL, IZ0, IZ1); }
  for (const [z, s] of [[IZ0, 1], [IZ1, -1]]) { box(PL, -IX, IX, CEIL - 0.9, CEIL, z, z + s * 0.4); box(PL, -IX, IX, CEIL - 0.3, CEIL, z, z + s * 0.85); }
  for (const s of [-1, 1]) { const x = s * 11.2, z = OZ1 - 3.4; box(BRICK, x - 0.85, x + 0.85, yO(12.05) - 0.5, R(46), z - 0.85, z + 0.85); box(BRICK, x - 0.97, x + 0.97, R(46), R(46.75), z - 0.97, z + 0.97); }
  {
    const { z, hw, foot, top } = BC;
    box(TRIM, -hw, hw, yO(hw) - 0.4, foot, z - hw, z + hw);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(TRIM, sx * (hw - 0.42), sx * hw, foot, top - 0.4, z + sz * (hw - 0.42), z + sz * hw);
    box(TRIM, -hw - 0.3, hw + 0.3, top - 0.4, top, z - hw - 0.3, z + hw + 0.3);
    prism(TRIM, [[-hw - 0.45, top], [hw + 0.45, top], [0, BC.peak]], hw * 2 + 0.9, new THREE.Matrix4().setPosition(0, 0, z - hw - 0.45));      // its low gabled cap
    box('timber', -hw, hw, top - 0.75, top - 0.4, z - 0.16, z + 0.16);                                                                       // the bell's beam
  }

  // ---- three coronas down the nave: plain iron hoops on long chains, eight candles on each. They burn low by day and
  // come up at dusk (their flames are one of the street's lamp glows, which do that by themselves); after dark it is
  // their light that shines out through the glass (chapelLife).
  for (const zc of [11, 23.5, 36]) {
    const HY = FLR + 12.2, RAD = 2.5, put = g => B.mesh(IRON, g), CAND = 'c#efe6d2/0.7';
    put(new THREE.TorusGeometry(RAD, 0.07, 6, 40).rotateX(Math.PI / 2).translate(0, HY, zc)); put(new THREE.TorusGeometry(RAD - 0.16, 0.03, 4, 40).rotateX(Math.PI / 2).translate(0, HY - 0.28, zc));
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, x = Math.cos(a) * RAD, z = zc + Math.sin(a) * RAD, top = new THREE.Vector3(0, HY + 5.2, zc), foot = new THREE.Vector3(x, HY, z), d = top.clone().sub(foot);
      const g = new THREE.CylinderGeometry(0.022, 0.022, d.length(), 4); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); g.translate((top.x + foot.x) / 2, (top.y + foot.y) / 2, (top.z + foot.z) / 2); put(g); }
    put(new THREE.CylinderGeometry(0.03, 0.03, CEIL - (HY + 5.2), 5).translate(0, (CEIL + HY + 5.2) / 2, zc)); put(new THREE.SphereGeometry(0.16, 8, 6).translate(0, HY + 5.2, zc)); put(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 12).translate(0, CEIL - 0.03, zc));
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, x = Math.cos(a) * RAD, z = zc + Math.sin(a) * RAD;
      put(new THREE.CylinderGeometry(0.14, 0.09, 0.07, 8).translate(x, HY + 0.1, z));
      B.mesh(CAND, new THREE.CylinderGeometry(0.055, 0.06, 0.62, 7).translate(x, HY + 0.44, z));
      B.mesh('e#ffd9a0/2.2', new THREE.SphereGeometry(0.06, 6, 5).scale(1, 2.1, 1).translate(x, HY + 0.9, z)); }
    const [wx_, wz_] = toW(0, zc); t.lamps.push({ x: wx_, y: HY - 0.6, z: wz_, power: 1.0, kind: 'lamp' });
  }

  // ---- a boarded dado round the room to the short windows' sills, with a cap and a skirting -----------------
  {
    const top = LOW.y - 0.12, th = 0.07, cap = 0.14, sk = 0.11, x0 = DOOR.hw * 2 + 0.1, run = (a0, a1, y, put) => { put(a0, a1, y, top - 0.09, 0, th); put(a0, a1, top - 0.09, top, 0, cap); put(a0, a1, y, y + 0.42, th, sk); };
    for (const s of [-1, 1]) {
      const side = (z0, z1, y0, y1, d0, d1) => box(DADO, s * (IX - d0), s * (IX - d1), y0, y1, z0, z1);
      side(IZ0, IZ1, FLR, top - 0.09, 0, th); side(IZ0, IZ1, top - 0.09, top, 0, cap); side(IZ0, DAIS.z0, FLR, FLR + 0.42, th, sk); side(DAIS.z0, IZ1, DAIS.y, DAIS.y + 0.42, th, sk);
      run(s * x0, s * IX, FLR, (a0, a1, y0, y1, d0, d1) => box(DADO, a0, a1 - s * (d1 === cap ? cap : d1 === sk ? sk : th), y0, y1, IZ0 + d0, IZ0 + d1));      // the front wall, clear of the door's leaves
    }
    run(-IX, IX, DAIS.y, (a0, a1, y0, y1, d0, d1) => { const e = d1 === cap ? cap : d1 === sk ? sk : th; box(DADO, a0 + e, a1 - e, y0, y1, IZ1 - d0, IZ1 - d1); });
  }

  // ---- the room, its light, its openings ---------------------------------------------------------------
  t.rooms.push({ name: 'The Chapel', ...rectW(-IX, IX, IZ0, IZ1), y0: FLR - 1, y1: CEIL + 0.2, lot: 'chapel' });
  { const r = rectW(-(OX - GD), OX - GD, OZ0 + GD, OZ1 - GD); t.boxes.push([r.x0, r.x1, r.z0, r.z1, FLR - 0.6, CEIL + 0.3]); }      // to the glass: reveals inside it are indoors, outside it out
  t.portals.push({ ...rectW(-DOOR.hw, DOOR.hw, OZ0, IZ0), y0: FLR, y1: FLR + DOOR.h, n: 'x', kind: 'door' });
  t.footprints.push(rectW(-OX - 0.5, OX + 0.5, OZ0 - 0.3, OZ1 + 0.5));
  for (const z of [10, 25, 40]) { const [x, zz] = toW(0, z); t.lamps.push({ x, y: CEIL - 5, z: zz, power: 1.0 }); }                  // daylight bounced round the nave
  return CHAPEL;
}

// ======================================================================================================
// What stands in it and round it
// ======================================================================================================
export function furnishChapel(kit, town) {
  const B = local(kit.B), n0 = kit.candles.length;
  const box = (mat, x0, x1, y0, y1, z0, z1, o) => B.wbox(mat, x0, x1, y0, y1, z0, z1, o);
  const solid = (x0, x1, z0, z1, y1, y0 = 0) => B.colliders.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), y0, y1 });
  const fw = (x, z, h = 0, q = 0) => { const [X, Z] = toW(x, z); return kit.fr(X, -Z, h, (q + 3) % 4); };      // a kit frame at one of the chapel's own points (q 0 faces the door end, 1 the west flank, 2 the table end, 3 the east flank)
  const sign = (x, z, h, q, w, tall, draw, o = {}) => kit.sign(fw(x, z, 0, q), 0, 0, h, w, tall, draw, o);
  const G = { grain: 'long' }, OAK = 'oak_light', OAKD = 'oak_light#9a8068';      // (the darker wood: pew ends, the lectern's post, the board)
  const t0 = (x0, x1, z0, z1, h) => town.surfaces.push({ ...rectW(x0, x1, z0, z1), h });

  // ---- pews, facing the table ----------------------------------------------------------------------------
  PEWS.rows.forEach((zr, k) => {
    for (const s of [-1, 1]) {
      const xa = s * PEWS.x0, xb = s * PEWS.x1, x0 = Math.min(xa, xb), x1 = Math.max(xa, xb);
      box(OAK, x0 + 0.1, x1 - 0.1, FLR + 1.36, FLR + 1.5, zr, zr + 1.5, G);                                // seat
      box(OAK, x0 + 0.1, x1 - 0.1, FLR + 0.3, FLR + 3.05, zr - 0.14, zr, G);                                // back
      box(OAK, x0 + 0.1, x1 - 0.1, FLR + 3.05, FLR + 3.17, zr - 0.2, zr + 0.06, G);                         // its cap
      for (const xe of [xa, xb]) box(OAKD, xe - 0.1, xe + 0.1, FLR, FLR + 3.1, zr - 0.24, zr + 1.62);
      solid(x0, x1, zr - 0.24, zr + 1.62, FLR + 3.1, FLR);
      kit.seat(fw(s * 4.4, zr + 0.8, FLR, 2), 0, 0, 1.5, 'sit for a while');
      if (k % 2 === 0) kit.seat(fw(s * 8.0, zr + 0.8, FLR, 2), 0, 0, 1.5, 'sit for a while');
    }
  });

  // ---- the stone table before the end window: candles, a bowl of water, Piaget's sentence in its edge ----
  {
    const { x0, x1, z0, z1, y } = TABLE;
    box(STONE, x0, x1, y - 0.7, y, z0, z1);
    for (const px of [x0 + 1.3, x1 - 1.3]) box('clinker', px - 0.7, px + 0.7, DAIS.y, y - 0.7, z0 + 0.3, z1 - 0.3);
    solid(x0, x1, z0, z1, y + 0.4, DAIS.y);
    const f = fw(0, (z0 + z1) / 2, y, 0);
    kit.pillarCandle(f, -2.8, 0.1, 0, 1.0, 0.17); kit.pillarCandle(f, -2.2, 0.5, 0, 0.62, 0.15); kit.pillarCandle(f, -1.75, -0.3, 0, 0.42, 0.14);
    kit.pillarCandle(f, 2.0, 0.3, 0, 0.8, 0.16); kit.pillarCandle(f, 2.7, -0.2, 0, 0.5, 0.15);
    f.lathe('c#5e6a6a/0.4', 0, 0.1, [[0.01, 0], [0.42, 0], [0.68, 0.08], [0.92, 0.26], [0.98, 0.36], [0.9, 0.36], [0.68, 0.16], [0.01, 0.1]], { seg: 28 });
    MINE.water = { x: 0, y: y + 0.3, z: (z0 + z1) / 2 - 0.1, r: 0.88 };
    sign(0, z0 - 0.012, y - 0.35, 0, x1 - x0 - 0.3, 0.62, (g, w, h) => {
      stone(g, w, h, 19); carve(g, 'Intelligence organises the world by organising itself.', w / 2, h * 0.52, h * 0.44, { italic: true, track: 0.03, ink: '#4a443c', shadow: 'rgba(40,30,20,.55)', light: 'rgba(255,255,250,.5)' });
      carve(g, 'JEAN PIAGET · 1937', w / 2, h * 0.9, h * 0.22, { track: 0.28, ink: '#5a5248', shadow: 'rgba(40,30,20,.45)', light: 'rgba(255,255,250,.45)' });
    }, { cw: 1040, ch: 99, rough: 0.9 });
  }

  // ---- the board on the end wall. The numbers are not hymns: each is the page a paper begins on (Anderson
  // 1972, Turing 1952, Lorenz 1963, May 1976, Gardner on Conway 1970, McCulloch & Pitts 1943). Wren knows.
  {
    const NUM = ['393', '37', '130', '459', '120', '115'], x = -8.6;
    box(OAKD, x - 1.3, x + 1.3, DAIS.y + 5.0, DAIS.y + 9.0, IZ1 - 0.14, IZ1 - 0.02);
    sign(x, IZ1 - 0.15, DAIS.y + 7.0, 0, 2.4, 3.8, (g, w, h) => {
      fill(g, w, h, '#3b2a1f'); const r = rng(5);
      for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(${i % 2 ? '20,12,8' : '96,70,50'},.22)`; g.lineWidth = 1 + (i % 3); g.beginPath(); const gx = r() * w; g.moveTo(gx, 0); g.bezierCurveTo(gx + 4, h * 0.3, gx - 4, h * 0.7, gx + 2, h); g.stroke(); }
      NUM.forEach((n, i) => { const y = h * (0.045 + i * 0.156); g.fillStyle = '#1c130d'; g.fillRect(w * 0.12, y + h * 0.132, w * 0.76, h * 0.012); const cw = w * 0.22, x0 = w / 2 - n.length * cw / 2; [...n].forEach((ch, k) => { g.fillStyle = '#efe7d2'; g.fillRect(x0 + k * cw + 2, y, cw - 4, h * 0.13); T(g, ch, x0 + (k + 0.5) * cw, y + h * 0.07, h * 0.11, '#1c1612', { f: F.dm }); }); });
    }, { cw: 300, ch: 476, rough: 0.8 });
  }

  // ---- the lectern, on the step: the last paragraph of the Origin of Species (first edition, 1859), its
  // first sentence and its last. The Darwin window's ribbon is cut from the end of it.
  {
    const x = 6.6, z = DAIS.z0 + 1.9, y = DAIS.y, t = 0.95, cy = y + 3.8, pk = (cy - y - 0.13) / 4.12, goudy = (g, s, gx, gy, px, col, o = {}) => T(g, s, gx, gy, px, col, { f: FONT, ...o });
    fw(x, z, y, 0).lathe(OAKD, 0, 0, [[0.01, 0], [0.9, 0], [0.9, 0.14], [0.3, 0.4], [0.16, 0.9], [0.2, 2.2], [0.14, 2.6], [0.22, 3.6], [0.34, 3.8], [0.3, 3.92], [0.13, 4.0], [0.12, 4.12], [0.01, 4.12]].map(([pr, pz]) => [pr, pz * pk]), { seg: 20 });      // (its tip is let into the desk's underside)
    box(OAK, x - 1.45, x + 1.45, cy - 1.0, cy + 1.0, z + 0.07 * Math.cos(t) - 0.045, z + 0.07 * Math.cos(t) + 0.045, { rot: [t, 0, 0] });      // the desk
    box(OAK, x - 1.45, x + 1.45, cy - 0.62, cy - 0.5, z - 0.92, z - 0.72);                                                                // the lip the book rests on
    solid(x - 1.3, x + 1.3, z - 0.9, z + 0.9, cy + 0.4, y);
    sign(x, z - 0.03, cy + 0.02, 0, 2.64, 1.76, (g, w, h) => {
      paper(g, w, h, '#efe6cf', 7); const gr = g.createLinearGradient(w * 0.44, 0, w * 0.56, 0); gr.addColorStop(0, 'rgba(60,40,20,0)'); gr.addColorStop(0.5, 'rgba(60,40,20,.32)'); gr.addColorStop(1, 'rgba(60,40,20,0)'); g.fillStyle = gr; g.fillRect(w * 0.44, 0, w * 0.12, h);
      const ink = '#2a1c13', m = w * 0.045, cw = w / 2 - m * 2.1;
      goudy(g, 'ON THE ORIGIN OF SPECIES', w * 0.25, h * 0.07, h * 0.034, '#7a4a2a', { ls: 2 }); goudy(g, 'CHAP. XIV.   CONCLUSION.', w * 0.75, h * 0.07, h * 0.034, '#7a4a2a', { ls: 2 });
      para(g, 'It is interesting to contemplate an entangled bank, clothed with many plants of many kinds, with birds singing on the bushes, with various insects flitting about, and with worms crawling through the damp earth, and to reflect that these elaborately constructed forms, so different from each other, and dependent on each other in so complex a manner, have all been produced by laws acting around us.', m, h * 0.15, h * 0.041, ink, cw, { f: FONT, lh: 1.34 });
      para(g, 'There is grandeur in this view of life, with its several powers, having been originally breathed into a few forms or into one; and that, whilst this planet has gone cycling on according to the fixed law of gravity, from so simple a beginning endless forms most beautiful and most wonderful have been, and are being, evolved.', w / 2 + m * 1.1, h * 0.15, h * 0.041, ink, cw, { f: FONT, lh: 1.34 });
      goudy(g, 'Charles Darwin, 1859.', w * 0.75, h * 0.895, h * 0.032, '#7a4a2a', { it: 1 }); goudy(g, 'The last paragraph: its first sentence and its last.', w * 0.75, h * 0.94, h * 0.032, '#7a4a2a', { it: 1, max: cw });
      goudy(g, '489', w * 0.25, h * 0.93, h * 0.036, '#7a4a2a'); line(g, [[w * 0.56, h * 0.855], [w * 0.94, h * 0.855]], 'rgba(122,74,42,.5)', 1);
    }, { cw: 792, ch: 528, tilt: t, rough: 0.85 });
  }

  // ---- the words over the door, and a lamp for each lantern ------------------------------------------------
  sign(0, OZ0 - 0.075, FLR + DOOR.h + 0.77, 0, 4.6, 0.4, (g, w, h) => {
    fill(g, w, h, '#ece3cf'); carve(g, 'MORE IS DIFFERENT', w / 2, h * 0.74, h * 0.56, { track: 0.24, ink: '#4a443c', shadow: 'rgba(40,30,20,.5)', light: 'rgba(255,255,250,.6)' });
  }, { cw: 690, ch: 60, rough: 0.8 });
  for (const s of [-1, 1]) { const [x, z] = toW(s * 4.67, OZ0 - 1.4); kit.lamps.push({ x, y: 5.8, z, power: 0.9, kind: 'lamp' }); }

  // ---- a bench (a along it, d from its front to its back; s is the way its back is turned) -----------------
  const bench = (x, z, s, label) => {
    const W = 6, T1 = 'c#b0966c/0.9', T2 = 'c#987c56/0.9', b = (mat, a0, a1, y0, y1, d0, d1) => box(mat, x + s * d0, x + s * d1, y0, y1, z + a0, z + a1);
    for (const sx of [-1, 1]) { b(T2, sx * W / 2 - 0.11, sx * W / 2 + 0.11, 0, 2.05, -0.84, -0.62); b(T2, sx * W / 2 - 0.11, sx * W / 2 + 0.11, 0, 2.95, 0.62, 0.84); b(T1, sx * W / 2 - 0.17, sx * W / 2 + 0.17, 2.05, 2.13, -1.0, 0.92); }
    for (let i = 0; i < 6; i++) b(T1, -W / 2 + 0.11, W / 2 - 0.11, 1.33, 1.4, 0.68 - i * 0.27 - 0.22, 0.68 - i * 0.27);
    b(T2, -W / 2 + 0.11, W / 2 - 0.11, 1.12, 1.33, -0.8, -0.66); b(T2, -W / 2 + 0.11, W / 2 - 0.11, 1.12, 1.33, 0.66, 0.8);
    b(T1, -W / 2 + 0.1, W / 2 - 0.1, 2.72, 2.98, 0.84, 0.96); b(T2, -W / 2 + 0.1, W / 2 - 0.1, 1.62, 1.78, 0.74, 0.84);
    for (let i = 0; i < 15; i++) { const c = -W / 2 + 0.3 + (i + 0.5) * (W - 0.6) / 15; b(T1, c - 0.11, c + 0.11, 1.74, 2.76, 0.82, 0.88); }
    solid(x - 1, x + 1, z - W / 2 - 0.2, z + W / 2 + 0.2, 2.9);
    for (const dz of [-1.3, 1.3]) kit.seat(fw(x, z + dz, 0, s > 0 ? 1 : 3), 0, 0, 1.4, label);
  };

  // ---- the churchyard, west of the nave: a low wall along the Overlook's paving with a gate in it, a path,
  // one bench facing the sunset, three stones ---------------------------------------------------------------
  {
    const { zw, gx, xW, p0, p1 } = YARD, WALLH = 3.1;
    for (const [a, b] of [[-OX - PIL.out, gx + 5.3], [gx - 5.3, xW]]) { box(BRICK, a, b, 0, WALLH, zw, zw + 1); box(TRIM, Math.max(a, b) + 0.1, Math.min(a, b) - 0.1, WALLH, WALLH + 0.22, zw - 0.1, zw + 1.1); solid(a, b, zw, zw + 1, WALLH + 0.3); }
    box(BRICK, xW, xW + 1, 0, WALLH, zw + 1, zw + 9); box(TRIM, xW - 0.1, xW + 1.1, WALLH, WALLH + 0.22, zw + 1, zw + 9.1); solid(xW, xW + 1, zw + 1, zw + 9, WALLH + 0.3);
    for (const [px, pz] of [[xW + 0.5, zw + 0.5], [xW + 0.5, zw + 9], [gx - 4.65, zw + 0.5], [gx + 4.65, zw + 0.5]]) { box(BRICK, px - 0.8, px + 0.8, 0, WALLH + 0.9, pz - 0.8, pz + 0.8); box(TRIM, px - 0.95, px + 0.95, WALLH + 0.9, WALLH + 1.15, pz - 0.95, pz + 0.95); solid(px - 0.8, px + 0.8, pz - 0.8, pz + 0.8, WALLH + 1); }
    box('flagstone', gx - 4, gx + 4, -0.5, 0.5, zw - 0.85, p0); t0(gx - 4, gx + 4, zw - 0.85, p0, 0.5);          // through the gate, at the paving's height
    box('flagstone', gx - 2, gx + 2, -0.3, 0.12, p0, p1); t0(gx - 2, gx + 2, p0, p1, 0.12);                     // and on down the yard
    for (const s of [-1, 1]) {      // the gate: two iron leaves, standing open
      const x = gx + s * 3.75;
      for (const y of [1.0, 3.9]) box(IRON, x - 0.04, x + 0.04, y, y + 0.1, zw + 1.3, zw + 5.0);
      for (let i = 0; i < 8; i++) box(IRON, x - 0.03, x + 0.03, 0.8, 4.3, zw + 1.33 + i * 0.52, zw + 1.39 + i * 0.52);
    }
    bench(-OX - 2.6, BAYS_Z[2], 1, 'sit and watch the sun go down');
    // the stones: three, down the west side of the path, each a line that took someone a lifetime. All three are
    // carved on their real graves: Boltzmann's in Vienna, Born's in Göttingen, Bernoulli's in the cloister at Basel
    // (who asked for the logarithmic spiral, and whose mason cut the wrong kind).
    const grave = (x, z, w, tall, seed, draw) => {
      box('c#9a948a/0.95', x - w / 2, x + w / 2, 0, tall, z - 0.32, z + 0.32); box('c#8a847a/0.95', x - w / 2 - 0.25, x + w / 2 + 0.25, 0, 0.35, z - 0.55, z + 0.55); box('c#9a948a/0.95', x - w / 2 + 0.3, x + w / 2 - 0.3, tall, tall + 0.22, z - 0.32, z + 0.32);
      solid(x - w / 2 - 0.25, x + w / 2 + 0.25, z - 0.55, z + 0.55, tall + 0.2);
      sign(x, z - 0.332, 0.45 + (tall - 0.55) / 2, 0, w - 0.2, tall - 0.7, (g, cw, ch) => { stone(g, cw, ch, seed, '#a8a297'); draw(g, cw, ch); }, { cw: Math.round((w - 0.2) * 104), ch: Math.round((tall - 0.7) * 104), rough: 0.95 });
    };
    const CUT = { ink: '#3c3832', shadow: 'rgba(30,24,18,.6)', light: 'rgba(255,255,250,.45)' }, NAME = { track: 0.2, ink: '#4a453d', shadow: 'rgba(30,24,18,.5)', light: 'rgba(255,255,250,.4)' };
    const gx0 = gx - 6.4;
    grave(gx0, p0 + 4, 3.0, 3.4, 3, (g, w, h) => { carve(g, 'S = k log W', w / 2, h * 0.42, h * 0.2, { italic: true, track: 0.05, ...CUT }); carve(g, 'LUDWIG BOLTZMANN · 1877', w / 2, h * 0.7, h * 0.075, NAME); });
    grave(gx0 - 0.3, p0 + 13.5, 3.3, 3.0, 7, (g, w, h) => { carve(g, 'pq − qp = h / 2πi', w / 2, h * 0.42, h * 0.19, { italic: true, track: 0.04, ...CUT }); carve(g, 'MAX BORN · 1925', w / 2, h * 0.72, h * 0.085, NAME); });
    grave(gx0 + 0.2, p0 + 23, 2.8, 3.8, 11, (g, w, h) => {
      for (const [dx, dy, col] of [[1.2, 1.2, CUT.light], [0, 0, CUT.ink]]) { g.strokeStyle = col; g.lineWidth = h * 0.012; g.beginPath(); for (let a = 0; a <= 15.2; a += 0.08) { const r = h * 0.012 * Math.exp(0.19 * a), x = w / 2 + dx + r * Math.cos(a), y = h * 0.34 + dy - r * Math.sin(a); if (a === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
      carve(g, 'EADEM MUTATA RESURGO', w / 2, h * 0.68, h * 0.062, { track: 0.16, ...CUT }); carve(g, 'JAKOB BERNOULLI · 1705', w / 2, h * 0.82, h * 0.05, NAME);
    });
  }

  // ---- the green, east of the nave: stepping stones from the pavement, a bench in the morning sun ----------
  for (let i = 0; i < 7; i++) { const x = OX + 5.4 + (i % 2) * 0.3, z = 1.0 + i * 3.1; box('flagstone', x - 1.1, x + 1.1, -0.3, 0.08, z - 0.85, z + 0.85); t0(x - 1.1, x + 1.1, z - 0.85, z + 0.85, 0.08); }
  bench(OX + 2.6, BAYS_Z[1], -1, 'sit in the sun');

  // ---- Wren, who keeps the candles --------------------------------------------------------------------------
  kit.clerks.push({
    id: 'wren', name: 'Wren', lot: 'chapel', floor: FLR, speed: 1.9, chirp: [62, 69],
    look: { shape: 'round', colour: '#8d7b68', belly: '#efe4cf', trim: '#b08d4a', eye: '#ffe2b0', ring: 0xffc878, antenna: true, hat: 'none', tool: 'candle', hover: 3.3 },
    home: toW(-6.6, 37), faces: toW(0, 24), posts: [toW(-2.2, 37.6), toW(6.4, 37.2), toW(-6.6, 37), toW(2.2, 37)],
    lines: WREN,
  });
  MINE.candles = kit.candles.slice(n0);
}

// ---- what Wren says: short, and about the window you are looking at ------------------------------------------
const WIN = {
  murmuration: ['Starlings at dusk. Each one watches its nearest few, and the flock turns as one.', "Nobody steers. That's the whole window."],
  symmetry: ['Compass needles. Hot at the top, pointing every which way. Cold below, all agreed.', 'Nothing in the physics prefers that direction. Any would have done.'],
  life: ["Conway's Life. Three neighbours and a cell is born. Two or three and it stays.", "It only runs while someone's looking. I didn't arrange that."],
  turing: ["A daisy, and an animal's coat. Turing's two chemicals, spreading at different speeds.", 'Lower down the spots run into stripes. Same rule.'],
  eigen: ["A tangle, smoothed again and again until it's a ball.", 'An object is what stays put when you keep doing the same thing to it.'],
  neuron: ['A nerve cell, the way Cajal drew them. Black on amber.', 'He called them the butterflies of the soul. Given my name, I stay out of it.'],
  ingression: ['Pure shapes at the top, coming down into a worm, a cell, a frog and a pair of gears.', 'I keep the gears dusted, just in case.'],
  loop: ["Twelve steps, every one of them up, and you're back where you began.", "Hofstadter thought an 'I' was something like that."],
  lorenz: ["Lorenz's weather. The line never crosses itself and never repeats.", 'He found it by typing a number back in with three decimals instead of six.'],
  logistic: ['One line of arithmetic, done over and over. It settles, then it splits, then it stops settling.', 'May wanted it taught to children.'],
  tree: ["Darwin's sketch, from a notebook of 1837. He wrote 'I think' above it, and then drew instead.", "The jewels are the twigs that came through. The ribbon is from the last sentence of his book, twenty-two years on. It's open on the lectern."],
  calculus: ['Nerve cells drawn as triangles, each one firing or not. McCulloch and Pitts, 1943.', 'Pitts was about twenty.'],
};
// The window the visitor is nearest, leaning toward the one being looked at
const _look = new THREE.Vector3();
function nearestWindow() {
  const cam = MINE.cam; if (!cam) return 'ingression';
  const f = cam.getWorldDirection(_look), p = cam.position; let best = 'ingression', score = Infinity;
  for (const w of GLASSW) {
    const dx = w.c[0] - p.x, dy = w.c[1] - p.y, dz = w.c[2] - p.z, d = Math.hypot(dx, dy, dz) || 1, sc = d * (1.5 - (dx * f.x + dy * f.y + dz * f.z) / d);
    if (sc < score) { score = sc; best = w.id; }
  }
  return best;
}
const WREN = {
  greet: ["I'm Wren. I keep the candles. Sit anywhere.", 'Ah. Come in.', "It's you. Good.", 'Hello again. Same candles.'],
  idle: [
    'The candle gets shorter every night and the flame stays the same size.',
    'When the sun is right, the windows lay their colours on the floor. I sweep round them.',
    '*looks up at the Life window until it moves, then looks away, satisfied*',
    'Evenings belong to the west wall.',
    "I dust the pew you're not sitting in. It seems only polite.",
  ],
  bye: ['Mind the step.', "Leave the door. It doesn't shut.", 'Go carefully.'],
  topics: [
    { q: 'Which window is this?', get a() { MINE.asked = nearestWindow(); return WIN[MINE.asked][0]; }, next: [{ q: 'Say more.', get a() { return WIN[MINE.asked ?? 'ingression'][1]; } }] },
    { q: 'Is this a church?', a: "It's built after one, in Madison, Indiana, at two thirds the size. Here it's a place to sit." },
    { q: 'Can I ring the bells?', a: 'There are four. The rope is by the door. Pull once and they ring every order four bells can be rung in, twenty-four, and stop where they began.' },
    { q: 'What are the numbers on the board?', a: 'Not hymns. Each is the page a paper begins on. 393 is Anderson: More Is Different.' },
    { q: 'Who are you?', a: 'Wren. I keep the candles. A man of my name built fifty-one churches after a fire. I keep one. It is enough.' },
  ],
};

// ======================================================================================================
// Built once the scene exists: the glass, its light, the roof, the bell, the vane, the planting
// ======================================================================================================
export function chapelLife(ctx, K) {
  const { animated, day, materials, camera } = ctx, outdoors = ctx.scene, scene = ctx.scene.parent ?? ctx.scene;      // the street's scene is the outdoors group: what must show from inside goes in the real one
  const Q = new URLSearchParams(location.search), smooth = THREE.MathUtils.smoothstep;
  const root = new THREE.Group(); root.applyMatrix4(M); root.name = 'chapel'; scene.add(root);      // what is laid out in the chapel's own feet hangs from this
  const sun = new THREE.Vector3(0, 1, 0), U = { uSunDir: { value: sun }, uSunCol: { value: new THREE.Color() }, uSky: { value: new THREE.Color() }, uOut: { value: new THREE.Color() }, uGlow: { value: 0 }, uIn: { value: 0 } };
  MINE.cam = camera;

  // ---- the glass: one sheet for the end window and ten tall ones, the Life window's own, and a second
  // sheet for the ten short windows ---------------------------------------------------------------------------
  const AW = 4096, AH = 2048, [TLW, TLH] = TALL, LW = 408, LH = 720, LOWW = LW * 5, LOWH2 = LH * 2;
  const CELL = { ingression: [0, 0, 1024, 2048, 2] }, LCELL = {};
  // ten tall lights beside the end window: eight upright in a row, two on their sides under them (a cell is [x, y, width, height, scale, on its side])
  GLASS.filter(w => !w.gable && w.id !== 'life').forEach((w, i) => { CELL[w.id] = i < 8 ? [1028 + i * (TLW + 8), 0, TLW, TLH, 1, 0] : [1028 + (i - 8) * (TLH + 8), TLH + 8, TLW, TLH, 1, 1]; });
  LOWG.forEach((w, i) => { LCELL[w.id] = [(i % 5) * LW, Math.floor(i / 5) * LH, LW, LH]; });
  const sheet = document.createElement('canvas'); sheet.width = AW; sheet.height = AH;
  const SOFT = { willReadFrequently: true };       // drawn in memory, not on the graphics card: nothing to read back when the sheet is sent up, and nothing to lose when the card is busy
  const sg = sheet.getContext('2d', SOFT); sg.fillStyle = '#2a2622'; sg.fillRect(0, 0, AW, AH);
  const lifeCanvas = document.createElement('canvas'); lifeCanvas.width = TLW; lifeCanvas.height = TLH;
  const lg = lifeCanvas.getContext('2d', SOFT); lg.fillStyle = '#2a2622'; lg.fillRect(0, 0, TLW, TLH);
  const lowSheet = document.createElement('canvas'); lowSheet.width = LOWW; lowSheet.height = LOWH2;
  const wg = lowSheet.getContext('2d', SOFT); wg.fillStyle = '#2a2622'; wg.fillRect(0, 0, LOWW, LOWH2);
  const mkTex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const sheetTex = mkTex(sheet), lifeTex = mkTex(lifeCanvas), lowTex = mkTex(lowSheet);
  const glassMat = tex => new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, ...U },
    vertexShader: `attribute vec3 aN; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
void main() { vUv = uv; vN = aN; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 uSunDir, uSunCol, uSky, uOut; uniform float uGlow, uIn; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
void main() {
  vec3 t = texture2D(map, vUv).rgb, N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float side = dot(V, N), facing = max(dot(uSunDir, N), 0.0);
  // from inside: the sky behind it, and the sun when the sun is on this side, most of all when you look toward it
  float toward = pow(max(dot(-V, uSunDir), 0.0), 8.0);
  vec3 lit = t * (uSky + uSunCol * facing * (0.35 + 0.9 * toward)) + t * uIn;
  // from outside: by day the picture dull but there, the sky's sheen in it, a glint where the sun is
  // reflected; after dark, the light within
  float fr = pow(1.0 - abs(side), 4.0);
  float glint = pow(max(dot(reflect(-uSunDir, N), V), 0.0), 90.0);
  vec3 dark = t * (uOut + uGlow) + uSky * (0.03 + 0.18 * fr) + uSunCol * glint * 0.5;
  gl_FragColor = vec4(side < 0.0 ? lit : dark, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,
    side: THREE.DoubleSide,
  });
  const paneGeo = (w, [cx, cy, cw, ch, , rot], tw, th) => {                    // drawn facing +z with u to the right, then set into its wall seen from inside
    let geo; const v2 = ([x, y]) => new THREE.Vector2(x, y);
    if (w.gable) geo = new THREE.ShapeGeometry(new THREE.Shape(w7Outline(w.w, w.h).map(([x, y]) => v2([x - w.w / 2, w.h / 2 - y]))));
    else geo = new THREE.PlaneGeometry(w.w, w.h);
    geo = geo.toNonIndexed();
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) { const a = p.getX(i) / w.w + 0.5, b = p.getY(i) / w.h + 0.5; if (rot) uv.setXY(i, (cx + (1 - b) * ch) / tw, 1 - (cy + (1 - a) * cw) / th); else uv.setXY(i, (cx + a * cw) / tw, 1 - (cy + (1 - b) * ch) / th); }
    geo.applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3(...w.u), new THREE.Vector3(0, 1, 0), new THREE.Vector3(...w.n).negate()).setPosition(...w.c));
    const n = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) n.set(w.n, i * 3);
    geo.setAttribute('aN', new THREE.BufferAttribute(n, 3)); geo.deleteAttribute('normal');
    return geo;
  };
  const addGlass = (geos, tex, name) => {
    const m = new THREE.Mesh(mergeAll(geos, ['position', 'uv', 'aN']), glassMat(tex)); m.name = name; m.castShadow = true; m.frustumCulled = false; m.userData.cat = 'chapel'; scene.add(m); return m;
  };
  addGlass(GLASSW.filter(w => w.id !== 'life').map(w => paneGeo(w, CELL[w.id], AW, AH)), sheetTex, 'chapel glass');
  const lifePane = addGlass(GLASSW.filter(w => w.id === 'life').map(w => paneGeo(w, [0, 0, TLW, TLH], TLW, TLH)), lifeTex, 'chapel glass life');
  addGlass(LOWG.map(inWorld).map(w => paneGeo(w, LCELL[w.id], LOWW, LOWH2)), lowTex, 'chapel glass low');

  // ---- the roof: shingles lit as outdoors (lighting.js) ----------------------------------------------------
  {
    const m = materials.roof.clone(); outdoorLit(m);
    const parts = [slab(-0.15, EAVE, yO, 0.4, OZ0 - OVER - 0.05, OZ1 + OVER + 0.05, -1), slab(-0.15, EAVE, yO, 0.4, OZ0 - OVER - 0.05, OZ1 + OVER + 0.05, 1)];
    { const g = feetBox(0.8, 0.3, OZ1 - OZ0 + OVER * 2 + 0.2); g.translate(0, RIDGE + 0.08, (OZ0 + OZ1) / 2); parts.push(g); }
    const roof = new THREE.Mesh(mergeAll(parts), m); roof.castShadow = roof.receiveShadow = true; roof.name = 'chapel roof'; roof.userData.cat = 'chapel'; root.add(roof);
  }
  // ---- water in the bowl
  if (MINE.water && materials.water) { const w = MINE.water, d = new THREE.Mesh(new THREE.CircleGeometry(w.r, 32).rotateX(-Math.PI / 2), materials.water); d.position.set(w.x, w.y, w.z); d.name = 'chapel water'; d.renderOrder = 2; root.add(d); }

  // ---- coloured light on the floor and walls ----------------------------------------------------------
  // One mesh lines the room. For each of its points the shader looks back along the sun's direction:
  // if that line passes through a picture, its colours (a small blurred copy, from a strip) are laid
  // there, as light on whatever colour the surface is.
  const NW = LIGHTS.length, SLOT = [32, 64];
  const pool = document.createElement('canvas'); pool.width = SLOT[0] * NW; pool.height = SLOT[1];
  { const a = pool.getContext('2d'); a.fillStyle = '#000'; a.fillRect(0, 0, pool.width, pool.height); }
  const poolTex = new THREE.CanvasTexture(pool); poolTex.colorSpace = THREE.SRGBColorSpace;
  const uW = { c: [], u: [], n: [], s: [], r: [] };
  LIGHTS.forEach((w, i) => {
    uW.c.push(new THREE.Vector3(...w.c)); uW.u.push(new THREE.Vector3(...w.u)); uW.n.push(new THREE.Vector3(...w.n)); uW.s.push(new THREE.Vector2(w.w / 2, w.h / 2));
    uW.r.push(new THREE.Vector4(i * SLOT[0] / pool.width, 0, SLOT[0] / pool.width, 1));
  });
  const uPool = { value: 0 };
  const liner = (() => {
    const quads = [], e = 0.014;
    const rectXZ = (x0, x1, z0, z1, y) => quads.push([[x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0]]);
    const rectZY = (x, z0, z1, y0, y1) => quads.push([[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]]);
    const rectXY = (z, x0, x1, y0, y1) => quads.push([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]);
    rectXZ(-IX, IX, IZ0, DAIS.z0, FLR + e); rectXZ(-IX, IX, DAIS.z0, IZ1, DAIS.y + e); rectXY(DAIS.z0 - e, -IX, IX, FLR, DAIS.y);
    for (const s of [-1, 1]) for (const [z0, z1, y0, y1] of inner(s < 0 ? 'W' : 'E')) rectZY(s * (IX - e), z0, z1, y0, y1);
    for (const [x0, x1, y0, y1] of inner('R')) rectXY(IZ1 - e, x0, x1, y0, y1);
    for (const [x0, x1, y0, y1] of inner('F')) rectXY(IZ0 + e, x0, x1, y0, y1);
    for (const zr of PEWS.rows) for (const s of [-1, 1]) rectXZ(Math.min(s * PEWS.x0, s * PEWS.x1) + 0.1, Math.max(s * PEWS.x0, s * PEWS.x1) - 0.1, zr, zr + 1.5, FLR + 1.5 + e);
    rectXZ(TABLE.x0, TABLE.x1, TABLE.z0, TABLE.z1, TABLE.y + e);
    const pos = [], idx = [];
    for (const q of quads) { const n = pos.length / 3; for (const p of q) pos.push(...p); idx.push(n, n + 1, n + 2, n, n + 2, n + 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uAtlas: { value: poolTex }, uSun: { value: sun }, uK: uPool, uWc: { value: uW.c }, uWu: { value: uW.u }, uWn: { value: uW.n }, uWs: { value: uW.s }, uWr: { value: uW.r } },
      defines: { NW },
      vertexShader: 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform sampler2D uAtlas; uniform vec3 uSun; uniform float uK; uniform vec3 uWc[NW]; uniform vec3 uWu[NW]; uniform vec3 uWn[NW]; uniform vec2 uWs[NW]; uniform vec4 uWr[NW]; varying vec3 vW;
void main() {
  vec3 acc = vec3(0.0);
  for (int i = 0; i < NW; i++) {
    float sn = dot(uSun, uWn[i]);
    if (sn < 0.03) continue;
    if (dot(vW - uWc[i], uWn[i]) > -1.2) continue;      // a window lights nothing on its own wall
    float t = dot(uWc[i] - vW, uWn[i]) / sn;
    if (t < 0.4) continue;
    vec3 h = vW + uSun * t - uWc[i];
    vec2 q = vec2(dot(h, uWu[i]) / uWs[i].x, h.y / uWs[i].y) * 0.5 + 0.5;
    if (q.x < 0.0 || q.y < 0.0 || q.x > 1.0 || q.y > 1.0) continue;
    vec3 c = texture2D(uAtlas, uWr[i].xy + q * uWr[i].zw).rgb;
    acc += c * c * smoothstep(0.03, 0.25, sn);
  }
  gl_FragColor = vec4(acc * uK, 1.0);
}`,
      transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.DstColorFactor, blendDst: THREE.OneFactor,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, toneMapped: false, side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(geo, mat); m.name = 'chapel window light'; m.renderOrder = 1; m.visible = false; m.userData.cat = 'chapel'; m.frustumCulled = false; root.add(m); return m;
  })();
  // ---- the hour ------------------------------------------------------------------------------------------
  let lastHour = null, ready = false;
  const skyCol = new THREE.Color();
  const setHour = () => {
    const L = day.light ?? 1, sd = day.sunDir ?? sun, el = sd.y;
    sun.copy(sd).normalize();
    const up = smooth(el, -0.02, 0.12);
    skyCol.setRGB(0.62, 0.7, 0.82).multiplyScalar(0.03 + 1.25 * L * L);       // the sky behind the glass: bright and cool by day, a deep blue at dusk, almost nothing at night
    U.uSky.value.copy(skyCol);
    U.uSunCol.value.setRGB(1.0, 0.93, 0.8).multiplyScalar(1.8 * up * (0.5 + 0.5 * smooth(el, 0.0, 0.3)));
    U.uOut.value.copy(skyCol).multiplyScalar(0.2); U.uOut.value.r += 0.012; U.uOut.value.g += 0.012; U.uOut.value.b += 0.014;
    uPool.value = 4.5 * up * smooth(el, -0.02, 0.1);       // (the street's own hour is the low evening sun, in at the west wall)
    liner.visible = uPool.value > 0.01 && ready;
  };

  // ---- drawing the glass a little at a time ----------------------------------------------------------------
  let job = null, life = null, lastStep = 0, seenAt = -1;
  const fonts = Promise.all([`20px ${FONT}`, `italic 20px ${FONT}`].map(f => document.fonts?.load?.(f) ?? Promise.resolve())).catch(() => {});
  function* run() {
    life = makeLife(lg, TLW, TLH); lifeTex.needsUpdate = true; yield;
    // one window: drawn on a canvas of its own, then set into its cell of a sheet
    const set = function* (to, [cx, cy, cw, ch, k = 1, rot], draw, after) {
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      const g = c.getContext('2d', SOFT); g.scale(k, k);
      const it = draw(g);
      while (!it.next().done) yield;
      after?.();
      if (rot) { to.save(); to.translate(cx, cy + cw); to.rotate(-Math.PI / 2); to.drawImage(c, 0, 0); to.restore(); } else to.drawImage(c, cx, cy);      // (on its side: the picture's top to the cell's left)
      c.width = c.height = 1;
    };
    let done = 0;
    for (const id of ['murmuration', 'ingression', ...GLASS.map(w => w.id).filter(id => id !== 'murmuration' && id !== 'ingression')]) {      // each picture, then the short window under it
      if (CELL[id]) {
        const [cx, cy, cw, ch] = CELL[id];
        yield* set(sg, CELL[id], WINDOWS[id][2], id !== 'loop' ? null : (() => { sg.fillStyle = '#dfe9f2'; sg.beginPath(); sg.arc(cx + LOOP_EYE.u * cw, cy + LOOP_EYE.v * ch, LOOP_EYE.r * cw, 0, Math.PI * 2); sg.fill(); }));      // (the clear roundel at the loop's heart)
        if (++done % 4 === 0) sheetTex.needsUpdate = true;
        yield;
      }
      if (LCELL[id]) { yield* set(wg, LCELL[id], g => lowLight(g, LW, LH, id, 500 + done)); lowTex.needsUpdate = true; yield; }
    }
    sheetTex.needsUpdate = true; yield;
    // the strip for the light on the floor
    const a = pool.getContext('2d'), cut = document.createElement('canvas');
    LIGHTS.forEach((w, i) => {
      let src = lifeCanvas;
      if (i >= GLASS.length || w.id !== 'life') { const [cx, cy, cw, ch, , rot] = i < GLASS.length ? CELL[w.id] : LCELL[w.id], q = cut.getContext('2d'), from = i < GLASS.length ? sheet : lowSheet; cut.width = cw; cut.height = ch; if (rot) { q.save(); q.translate(cw, 0); q.rotate(Math.PI / 2); q.drawImage(from, cx, cy, ch, cw, 0, 0, ch, cw); q.restore(); } else q.drawImage(from, cx, cy, cw, ch, 0, 0, cw, ch); src = cut; }
      a.drawImage(poolCopy(src, SLOT[0], SLOT[1]), i * SLOT[0], 0);
    });
    poolTex.needsUpdate = true; ready = true; lastHour = null;
  }
  Promise.resolve(fonts).then(() => { if (Q.has('chapelnow')) { const it = run(); while (!it.next().done); } else job = run(); });
  lifePane.onBeforeRender = () => { seenAt = performance.now(); };       // the Life window steps about once a second, only while it is being drawn

  const candles = MINE.candles;
  animated.push((t) => {
    if (job) { const t0 = performance.now(); while (performance.now() - t0 < 5) { if (job.next().done) { job = null; break; } } }
    if (day.hour !== lastHour) { lastHour = day.hour; setHour(); }
    let lit = 0; for (const c of candles) if (c.lit) lit++;
    const night = day.night ?? 0, f = lit / Math.max(1, candles.length);
    U.uGlow.value = (0.26 + 0.14 * Math.min(1, f * 2.5)) * smooth(night, 0.2, 0.8);      // after dark the coronas shine out through the glass, as the candles do in the chapel in Anna's garden; more when the table's candles are lit too
    U.uIn.value = (0.03 + 0.03 * f) * night;
    if (life && performance.now() - seenAt < 400 && t - lastStep > 0.9) { lastStep = t; life.step(); lifeTex.needsUpdate = true; }
  });
  if (Q.has('lifesteps')) { const n = Number(Q.get('lifesteps')); const wait = () => { if (life) { for (let i = 0; i < n; i++) life.step(); lifeTex.needsUpdate = true; } else setTimeout(wait, 200); }; wait(); }
  bell(ctx, root);
  weathervane(ctx, root);
  try { planting(outdoors); } catch (e) { console.warn('chapel planting', e); }
}

// ---- the bell ---------------------------------------------------------------------------------------------
// Bronze, hung in the cote on the ridge; its rope comes down through the ceiling just inside the door, with
// a striped sally to pull. One pull rings a whole touch (see bell()). The sound is a struck bell's own five
// partials (hum, prime, tierce, quint, nominal: an octave below, the note, a minor third, a fifth, an octave).
function bell(ctx, scene) {
  // Four bells hang in the cote, two and two on a pair of beams, treble to tenor. One pull of the rope and they ring
  // Plain Bob Minimus: rounds, then every one of the twenty-four orders four bells can be rung in, each exactly
  // once, and back into rounds: the oldest of the change-ringing methods, as English towers have rung it since the
  // 1600s. (Hunting: pairs swap, then the middle pair swaps; and at each lead end the last pair swaps instead.)
  const { animated, interact } = ctx, z = BC.z, yTop = BC.top - 0.75;
  const bronze = new THREE.MeshStandardMaterial({ color: 0x8a6a3a, metalness: 0.85, roughness: 0.42, side: THREE.DoubleSide }), dark = new THREE.MeshStandardMaterial({ color: 0x2a2926, metalness: 0.7, roughness: 0.5 });
  const prof = [[0.04, 0], [0.5, -0.06], [0.66, -0.3], [0.7, -0.9], [0.84, -1.5], [1.12, -1.95], [1.3, -2.15], [1.26, -2.2]].map(([r, y]) => new THREE.Vector2(r, y)).reverse();
  const bodyGeo = new THREE.LatheGeometry(prof, 20), clapGeo = mergeAll([new THREE.CylinderGeometry(0.035, 0.035, 1.7, 6).translate(0, -1.0, 0), new THREE.SphereGeometry(0.17, 10, 8).translate(0, -1.9, 0)].map(g => g.toNonIndexed()));
  // treble (1) to tenor (4): where each hangs, how big, and its note (a major tetrachord coming down: F E D C)
  const BELLS = [[-0.66, -0.6, 0.3, 77], [0.66, -0.6, 0.34, 76], [-0.66, 0.6, 0.38, 74], [0.66, 0.6, 0.44, 72]].map(([x, dz, sc, midi]) => {
    const g = new THREE.Group(); g.position.set(x, yTop, z + dz); g.scale.setScalar(sc); scene.add(g);
    const body = new THREE.Mesh(bodyGeo, bronze); body.castShadow = true; body.name = 'chapel bell'; body.userData.cat = 'chapel'; const clapper = new THREE.Mesh(clapGeo, dark); g.add(body, clapper);
    return { g, clapper, midi, at: -100 };
  });
  for (const dz of [-0.6, 0.6]) { const m = new THREE.Mesh(new THREE.BoxGeometry(BC.hw * 2 - 0.9, 0.3, 0.28), new THREE.MeshStandardMaterial({ color: 0x5a4636, roughness: 0.9 })); m.position.set(0, yTop + 0.17, z + dz); m.userData.cat = 'chapel'; scene.add(m); }
  const RX = 5.6, RZ = IZ0 + 1.15, y0 = FLR + 3.2;      // (clear of the cornice's lip)
  const tube = (a, b, r, n = 6) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A), g = new THREE.CylinderGeometry(r, r, d.length(), n); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); g.translate((A.x + Bv.x) / 2, (A.y + Bv.y) / 2, (A.z + Bv.z) / 2); return g.toNonIndexed(); };
  const tint = (g, f) => { const p = g.attributes.position, c = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) c.set(f(p.getX(i), p.getY(i), p.getZ(i)), i * 3); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return g; };
  const HEMP = () => [0.62, 0.52, 0.36], ropeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  const sallyGeo = new THREE.CylinderGeometry(0.13, 0.13, 2.6, 10, 26).translate(RX, FLR + 5.5, RZ).toNonIndexed();
  tint(sallyGeo, (x, y, zz) => { const k = Math.floor((y - FLR - 4.2) / 0.2 + Math.atan2(zz - RZ, x - RX) / 2.1 + 20) % 3; return k === 0 ? [0.6, 0.1, 0.09] : k === 1 ? [0.85, 0.8, 0.68] : [0.12, 0.2, 0.44]; });
  const rope = new THREE.Mesh(mergeAll([tint(tube([RX, y0, RZ], [RX, CEIL + 1.1, RZ], 0.045), HEMP), sallyGeo], ['position', 'normal', 'color']), ropeMat);
  rope.name = 'chapel bell rope'; rope.userData.cat = 'chapel'; scene.add(rope);

  // the touch: two rounds, then the 24 changes of Plain Bob Minimus (the last brings them round), as [bell, time]
  const BEAT = 0.27, strikes = [];
  { let row = [0, 1, 2, 3], t = 0, n = 0; const rows = [row, row];
    const swap = (r, pairs) => { const q = r.slice(); for (const [a, b] of pairs) [q[a], q[b]] = [q[b], q[a]]; return q; };
    for (let lead = 0; lead < 3; lead++) for (let k = 0; k < 8; k++) { row = swap(row, k % 2 === 0 ? [[0, 1], [2, 3]] : k === 7 ? [[2, 3]] : [[1, 2]]); rows.push(row); }
    for (const r of rows) { for (const b of r) { strikes.push([b, t]); t += BEAT; } if (++n % 2 === 0) t += BEAT; }      // a beat's pause after every second row, as ringers leave at the handstroke lead
  }
  const LEN = strikes.at(-1)[1] + 4;
  let rung = -1e9, now = 0, next = 0;
  // a struck bell's own partials: hum, prime, tierce, quint, nominal
  const strike = (midi, vol) => { try { const s = ctx.sound; if (!s?.note) return; s.note(midi - 24, 0, 3.4, 0.1 * vol); s.note(midi - 12, 0, 2.6, 0.2 * vol); s.note(midi - 9, 0, 1.7, 0.08 * vol); s.note(midi - 5, 0, 1.3, 0.05 * vol); s.note(midi, 0, 1.0, 0.11 * vol); } catch { /* no sound yet */ } };
  interact.push({ x: toW(RX, RZ)[0], y: FLR + 5.4, z: toW(RX, RZ)[1], reach: 6.5, size: 1.2, label: () => (now - rung < LEN ? 'listen' : 'ring the bells'), act: () => { if (now - rung < LEN) return; rung = now; next = 0; ctx.flash?.('Plain Bob Minimus: four bells, twenty-four orders, each rung once.'); } });
  const near = new THREE.Vector3(toW(0, z)[0], 30, toW(0, z)[1]);
  animated.push((t) => {
    now = t; const dt = t - rung;
    if (dt > LEN + 1) { if (rope.position.y) rope.position.y = 0; return; }
    while (next < strikes.length && strikes[next][1] <= dt) { const b = BELLS[strikes[next][0]]; b.at = t; strike(b.midi, ctx.camera.position.distanceToSquared(near) < 200 * 200 ? 1 : 0.4); next++; }
    for (const b of BELLS) { const u = t - b.at, a = u < 2.5 ? 0.34 * Math.exp(-u / 0.55) * Math.cos(u * 9) : 0; b.g.rotation.x = a; b.clapper.rotation.x = -a * 1.4; }
    rope.position.y = dt < LEN - 3.5 ? -0.55 * (0.5 - 0.5 * Math.cos(dt * Math.PI / (BEAT * 4.5))) : rope.position.y * 0.9;
  });
}

// ---- the weathervane (the house chapel's, on the bell-cote) ----------------------------------------------------
// Copper gone to verdigris, rubbed bright here and there: four plain arms with a ball at each end and no
// letters (every direction the same); the vane, a loose cloud of starlings cut from sheet, drawing
// together along the shaft to one bird at the point; above it all a Mobius band. It swings into the
// street's wind with a little lag and overshoot, and wanders when the gusts come.
function weathervane(ctx, scene) {
  const { animated, camera } = ctx;
  const top = BC.peak - 0.2, X = 0, Z = BC.z;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), rnd = rng(91);
  g.fillStyle = '#5f9c8c'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 260; i++) { const k = rnd(); g.fillStyle = k < 0.45 ? `rgba(120,184,164,${0.3 + rnd() * 0.4})` : k < 0.8 ? `rgba(58,104,98,${0.3 + rnd() * 0.4})` : `rgba(150,92,52,${0.4 + rnd() * 0.4})`; g.beginPath(); g.arc(rnd() * 128, rnd() * 128, 1 + rnd() * 6, 0, Math.PI * 2); g.fill(); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const verd = new THREE.MeshStandardMaterial({ map: tex, color: 0xffffff, metalness: 0.35, roughness: 0.62, side: THREE.DoubleSide });
  const bright = new THREE.MeshStandardMaterial({ color: 0xc8874e, metalness: 0.85, roughness: 0.32, side: THREE.DoubleSide });
  const cyl = (r, x0, y0, z0, x1, y1, z1, n = 8) => {
    const a = new THREE.Vector3(x0, y0, z0), b = new THREE.Vector3(x1, y1, z1), d = b.clone().sub(a), geo = new THREE.CylinderGeometry(r, r, d.length(), n, 1);
    geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); geo.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); return geo;
  };
  const ball = (r, x, y, z) => new THREE.SphereGeometry(r, 12, 8).translate(x, y, z);
  const H = 3.5, armsY = 1.45, vaneY = 2.45;
  const still = [cyl(0.3, 0, -0.5, 0, 0, 0.12, 0, 12), cyl(0.09, 0, 0.12, 0, 0, 0.3, 0, 10), cyl(0.032, 0, 0.3, 0, 0, H, 0), ball(0.07, 0, armsY, 0), ball(0.05, 0, vaneY - 0.12, 0), ball(0.05, 0, vaneY + 0.12, 0)];
  const wear = [];
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, ex = Math.cos(a) * 0.95, ez = Math.sin(a) * 0.95; still.push(cyl(0.017, 0, armsY, 0, ex, armsY, ez, 6)); wear.push(ball(0.075, ex, armsY, ez)); }
  {   // the Mobius band: one strip, one side (three half twists, so the twist shows), standing on the mast's tip
    const R = 0.27, w = 0.1, N = 120, pos = [], uv = [];
    const pt = (u, v) => { const r = R + v * Math.cos(1.5 * u); return [r * Math.cos(u), r * Math.sin(u), v * Math.sin(1.5 * u)]; };
    for (let i = 0; i < N; i++) {
      const u0 = i / N * Math.PI * 2, u1 = (i + 1) / N * Math.PI * 2, q = [pt(u0, -w), pt(u1, -w), pt(u1, w), pt(u0, w)];
      for (const k of [0, 1, 2, 0, 2, 3]) { pos.push(...q[k]); uv.push(k === 1 || k === 2 ? (i + 1) / N : i / N, k >= 2 ? 1 : 0); }
    }
    const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); m.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); m.computeVertexNormals();
    m.rotateY(Math.PI / 4); m.translate(0, H + R + 0.02, 0); still.push(m);
  }
  const foot = new THREE.Group(); foot.position.set(X, top, Z); foot.scale.setScalar(1.25); scene.add(foot);
  const add = (list, mat, name, parent) => { const mesh = new THREE.Mesh(mergeAll(list.map(q => (q.attributes.normal ? q : (q.computeVertexNormals(), q)))), mat); mesh.name = name; mesh.castShadow = true; mesh.userData.cat = 'chapel'; parent.add(mesh); return mesh; };
  add(still, verd, 'chapel weathervane', foot); add(wear, bright, 'chapel weathervane wear', foot);
  // a starling in flight as a silhouette: round head and short beak, long pointed wings curving back, a short square tail
  const BIRD = [[0.58, 0.0], [0.5, 0.025], [0.44, 0.06], [0.36, 0.075], [0.22, 0.08], [0.148, 0.198], [0.073, 0.323], [-0.005, 0.435], [-0.087, 0.524], [-0.172, 0.581], [-0.26, 0.6], [-0.211, 0.454], [-0.171, 0.32], [-0.146, 0.204], [-0.14, 0.1], [-0.22, 0.07], [-0.36, 0.06], [-0.46, 0.08], [-0.44, 0.0], [-0.46, -0.08], [-0.36, -0.06], [-0.22, -0.07], [-0.14, -0.1], [-0.146, -0.204], [-0.171, -0.32], [-0.211, -0.454], [-0.26, -0.6], [-0.172, -0.581], [-0.087, -0.524], [-0.005, -0.435], [0.073, -0.323], [0.148, -0.198], [0.22, -0.08], [0.36, -0.075], [0.44, -0.06], [0.5, -0.025]];
  const bird = (x, y, size, tilt, z) => {
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(BIRD.map(([a, b]) => new THREE.Vector2(a, b))), { depth: 0.05 / size, bevelEnabled: false });
    geo.translate(0, 0, -0.025 / size); geo.scale(size, size, size); geo.rotateZ(tilt); geo.translate(x, y, z); return geo;
  };
  const vr = rng(37), flock = [], wires = [], spots = [];
  for (let tries = 0; spots.length < 22 && tries < 3000; tries++) {
    const t = Math.sqrt(vr()), x = -0.45 - t * 1.6, half = 0.06 + 0.5 * Math.pow(t, 0.9) * (1 - 0.35 * t * t), y = (vr() * 2 - 1) * half, size = 0.27 + vr() * 0.08;
    if (spots.some(([px, py]) => Math.hypot(px - x, py - y) < 0.2)) continue;
    spots.push([x, y, size]);
  }
  spots.sort((a, b) => b[0] - a[0]);
  spots.forEach(([x, y, size], i) => {
    flock.push(bird(x, y, size, (vr() - 0.5) * 0.6 + y * 0.4, ((i % 7) - 3) * 0.014));
    const to = spots.slice(0, i).reduce((b, q) => (Math.hypot(q[0] - x, q[1] - y) < Math.hypot(b[0] - x, b[1] - y) ? q : b), [Math.min(-0.3, x + 0.3), 0]);
    wires.push(cyl(0.005, x, y, 0, to[0], to[1], 0, 4));
  });
  wires.push(cyl(0.012, -0.9, 0, 0, 0.6, 0, 0, 6), cyl(0.04, 0, -0.1, 0, 0, 0.1, 0, 10));
  const head = [bird(0.95, 0, 0.66, 0, 0).scale(1, 1, 1.5)];
  const vane = new THREE.Group(); vane.position.set(0, vaneY, 0); foot.add(vane);
  add([...flock, ...wires], verd, 'chapel weathervane vane', vane); add(head, bright, 'chapel weathervane bird', vane);
  let ang = 2.6, vel = 0, last = -1;
  const near = new THREE.Vector3(toW(X, Z)[0], top, toW(X, Z)[1]);
  const target = t => { const gust = THREE.MathUtils.smoothstep(Math.sin(t * 0.11), 0.55, 1.0); return 2.6 + 0.7 * Math.sin(t * 0.017) + 0.3 * Math.sin(t * 0.047 + 2) + gust * (0.35 * Math.sin(t * 0.83) + 0.2 * Math.sin(t * 1.9 + 1)); };
  ang = target(wind.value); vane.rotation.y = ang;
  const fixed = new URLSearchParams(location.search).get('vaneyaw');
  if (fixed !== null) { vane.rotation.y = Number(fixed); return; }
  animated.push(() => {
    const t = wind.value, dt = last < 0 ? 0 : Math.min(0.05, Math.max(0, t - last)); last = t;
    if (camera.position.distanceToSquared(near) > 420 * 420 || !dt) return;
    let d = target(t) - ang; d = Math.atan2(Math.sin(d), Math.cos(d));
    vel += (5 * d - 1.4 * vel) * dt; ang += vel * dt; vane.rotation.y = ang;
  });
}


// ---- planting --------------------------------------------------------------------------------------------
// The street's plants are painted on one sheet and drawn as instanced cards (street/flora.js), all laid
// out before this runs; the churchyard's few are added here as one more set on the same sheet and material.
function planting(outdoors) {
  let proto = null; outdoors.traverse(m => { if (!proto && m.isInstancedMesh && m.geometry?.attributes?.aCell && m.customDepthMaterial && m.castShadow) proto = m; });
  if (!proto) { console.log('chapel: no plants to take a leaf from', outdoors.children.length); return; }
  const set = new CardSet({ region: 400 }), r = rng(7401), m = new THREE.Matrix4(), c = new THREE.Color();
  const cells = {}; for (const [n, [cx, cy, cw, ch]] of Object.entries(FLORA_CELLS)) cells[n] = cellUV(2048, 2048, [cx * 256, cy * 256, cw * 256, ch * 256], 2);
  const add = (kind, x, z, s = 1, y = 0) => {
    const k = KINDS[kind]; if (!k || !cells[k[0]]) return;
    const w = k[2] * s * (0.85 + r() * 0.3), h = k[3] * s * (0.85 + r() * 0.3), tilt = k[1] === 'x' ? (r() - 0.5) * 0.12 : 0; c.setScalar(0.85 + r() * 0.25);
    const [X, Z] = toW(x, z); set.push(k[1] === 'r' ? 'r' : 'x', cells[k[0]], place(m, X, y, Z, w, h, w, r() * 6.28, tilt, tilt * 0.7), c);
  };
  const row = (kind, x0, z0, x1, z1, step, s = 1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / step)); for (let i = 0; i <= n; i++) add(kind, x0 + (x1 - x0) * i / n + (r() - 0.5) * step * 0.3, z0 + (z1 - z0) * i / n + (r() - 0.5) * step * 0.3, s * (0.85 + r() * 0.3)); };
  const drift = (kind, cx, cz, rx, rz, n, s = 1) => { for (let i = 0; i < n; i++) { const a = r() * 6.28, d = Math.sqrt((i + r()) / n); add(kind, cx + Math.cos(a) * rx * d, cz + Math.sin(a) * rz * d, s * (0.8 + r() * 0.35)); } };
  const { gx, zw, xW, p0, p1 } = YARD;
  for (const s of [-1, 1]) row('lavender', gx + s * 2.9, p0 + 1.2, gx + s * 2.9, p1 - 1, 2.4, 0.85);                             // along the yard's path
  row('rose', -OX - 2, zw + 2.3, gx + 6.6, zw + 2.3, 3.2, 0.95); row('rose', gx - 6.6, zw + 2.3, xW + 1.6, zw + 2.3, 3.2, 0.95);      // inside the wall
  drift('wildflowers', gx, p1 + 4.5, 9, 2.5, 14, 0.9);                                                                          // where the path gives out
  drift('fern', OX + 1.5, BAYS_Z[3], 0.8, 3, 5, 1.0);                                                                           // one clump on the green side
  const meshes = set.build(outdoors, { x: crossGeo(3), r: rosetteGeo(7, 0.62) }, { material: proto.material, depth: proto.customDepthMaterial });
  for (const mesh of meshes) { mesh.name = 'plants'; mesh.userData.cat = proto.userData.cat; }
}

// ---- small helpers ------------------------------------------------------------------------------------------
// A frame: the ring between two outlines (in a plane: a along the wall, y up), extruded `depth`, set by m
function frameRing(B, mat, outer, inner, m, depth = 0.24) {
  const sh = new THREE.Shape(outer.map(([a, y]) => new THREE.Vector2(a, y)));
  sh.holes.push(new THREE.Path(inner.map(([a, y]) => new THREE.Vector2(a, y))));
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4 });
  g.applyMatrix4(m); B.mesh(mat, g);
}
// The rectangles of a wall [a0..a1] x [y0..y1] left round its holes [[ha0, ha1, hy0, hy1], ...]; holes that
// stand one over another must share their two sides
function pieces(a0, a1, y0, y1, holes) {
  const cols = new Map();
  for (const h of holes) { const k = h[0] + ':' + h[1]; if (!cols.has(k)) cols.set(k, []); cols.get(k).push(h); }
  const out = []; let at = a0;
  for (const col of [...cols.values()].sort((p, q) => p[0][0] - q[0][0])) {
    const [h0, h1] = col[0]; if (h0 > at) out.push([at, h0, y0, y1]);
    let y = y0; for (const h of col.sort((p, q) => p[2] - q[2])) { out.push([h0, h1, y, h[2]]); y = h[3]; }
    out.push([h0, h1, y, y1]); at = h1;
  }
  if (a1 > at) out.push([at, a1, y0, y1]);
  return out.filter(([a, b, c, e]) => b - a > 0.01 && e - c > 0.01);
}
// A sloping slab on side s (-1 south, +1 north) from d0 to d1 feet off the middle line, its top (or with
// under, its underside) on the surface y(d), th thick, running z0..z1; texture in feet, courses along the ridge
function slab(d0, d1, y, th, z0, z1, s, under = false) {
  const cos = 1 / Math.hypot(1, PITCH), sin = PITCH * cos, run = d1 - d0, mid = (d0 + d1) / 2;
  const g = feetBox(z1 - z0, th, run / cos);
  const ex = new THREE.Vector3(0, 0, s < 0 ? 1 : -1), n = new THREE.Vector3(s * sin, cos, 0), dz = new THREE.Vector3(s * cos, -sin, 0);
  const at = new THREE.Vector3(s * mid, y(mid), (z0 + z1) / 2).addScaledVector(n, under ? th / 2 : -th / 2);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(ex, n, dz).setPosition(at));
  return g;
}
// Box geometry with texture coordinates in feet (as the Builder's), non-indexed
function feetBox(sx, sy, sz) {
  const g = new THREE.BoxGeometry(sx, sy, sz).toNonIndexed(), n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    const [su, sv] = ax > 0.5 ? [sz, sy] : ay > 0.5 ? [sx, sz] : [sx, sy];
    uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  }
  return g;
}
// A square timber between two points: w across (in the plane the timber leans in), h through
function beamGeo(a, b, w, h = w) {
  const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(Bv, A), len = d.length();
  const g = new THREE.BoxGeometry(w, len, h).toNonIndexed(); g.translate(0, len / 2, 0);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * len);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); g.translate(A.x, A.y, A.z);
  return g;
}
function mergeAll(list, keys = ['position', 'normal', 'uv']) {
  const out = new THREE.BufferGeometry(), arrays = keys.map(() => []);
  for (const g0 of list) { const g = g0.index ? g0.toNonIndexed() : g0; keys.forEach((k, i) => { const a = g.attributes[k]; if (a) for (let j = 0; j < a.array.length; j++) arrays[i].push(a.array[j]); }); }
  keys.forEach((k, i) => { if (arrays[i].length) out.setAttribute(k, new THREE.Float32BufferAttribute(arrays[i], k === 'uv' ? 2 : 3)); });
  return out;
}
// Pale stone, for cut lettering
function stone(g, w, h, seed = 19, col = '#cfc7b8') {
  const r = rng(seed); g.fillStyle = col; g.fillRect(0, 0, w, h);
  for (let i = 0; i < w * h / 320; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,250,240' : '90,80,70'},${0.05 + r() * 0.06})`; g.fillRect(r() * w, r() * h, 2 + r() * 4, 1 + r() * 2); }
}
// Letters cut into a surface: a shadow along the upper edge of each stroke, light along the lower, then the fill
function carve(g, text, x, y, size, o) {
  const draw = (dx, dy, style) => {
    g.fillStyle = style; let w = 0; const fs = s => `${o.italic ? 'italic ' : ''}${s}px ${FONT}`;
    g.font = fs(size); for (const ch of text) w += g.measureText(ch).width + size * o.track; w -= size * o.track;
    let cx = x - w / 2; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    for (const ch of text) { g.fillText(ch, cx + dx, y + dy); cx += g.measureText(ch).width + size * o.track; }
  };
  draw(0, -1.5, o.shadow); draw(0, 1.2, o.light); draw(0, 0, o.ink);
}
