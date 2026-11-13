// The Chapel: the full-scale version of the little chapel in the garden of Anna's house. It stands in
// the row on Vesper Street: the last plot on the south side, beside the Overlook, its door on the
// pavement and its west flank open to the setting sun. Not a church: a place to sit and think, about
// minds and how things come to be. Brick below a steep shingled roof on open timber trusses, plastered
// pale inside so the coloured light shows; a shingled fleche on the ridge with a bell you can ring and
// the house chapel's weathervane (starlings drawing together into one bird, a Mobius band over all).
//
//   the north door stands open on the pavement, MORE IS DIFFERENT cut in the lintel over it
//   the rose over the door      murmuration (its words read from the street)
//   the great window, far end   ingressing minds, behind the stone table (it faces south: the midday sun)
//   west wall, door to table    Life (it moves), Turing, Lorenz, the strange loop, eigen-behaviour (the evening sun)
//   east wall, door to table    Cajal's neuron, broken symmetry, Darwin's tree, the logistic map,
//                               McCulloch and Pitts's logical calculus
//   inside: pews, the stone table with candles and a bowl of water (Piaget's sentence in its edge),
//   a rack of tapers to light, a lectern with the last paragraph of the Origin, two boards of numbers
//   that are not hymns, a visitors' book by the door, the bell rope, and Moth, who keeps the candles.
//   outside: a small churchyard on the west side, entered from the Overlook through a lych-gate: a
//   path, two benches facing the sunset, three cut stones.
//
// The glass is drawn in chapel/glass.js (the house's eight windows and four new ones) onto ONE sheet,
// a little at a time after start-up; only the Life window has a canvas of its own, because it is
// redrawn every second while someone is looking at it. The sun lays each window's colours on the
// floor and walls (one mesh lining the room, as in the house).
//
//   chapelShell(B, t)       walls, floor, roof timbers, fleche; rooms, portals, colliders (from town.js)
//   furnishChapel(kit, town) what stands in it and round it; Moth (from shops/index.js)
//   chapelLife(ctx, K)      glass, roof, light, bell, vane, planting (from street.js, once the scene exists)

import * as THREE from 'three';
import { outdoorLit } from './lighting.js';
import { wind, CardSet, crossGeo, rosetteGeo, place, cellUV } from './street/cards.js';
import { KINDS } from './street/flora.js';
import { FLORA_CELLS } from './street/paint.js';
import { WINDOWS, makeLife, poolCopy, w7Outline, FONT, rng, LOOP_EYE } from './chapel/glass.js';
import { T, F, para, paper, fill, line } from './draw.js';

// ---- where it stands -----------------------------------------------------------------------------------
// The last plot on the south side of the street, next to the Overlook (town.js CHAPEL_SITE.street: Y 168
// to 198, building line X = -24). Everything below is laid out in the chapel's OWN feet: x across the nave,
// z from the front wall's outer face back along the nave, the door facing -z. On the street that is a
// quarter turn: the door faces north onto the pavement, the nave runs back south, local -x is the west
// flank (the Overlook, the sunset) and local +x the east flank (the noodle bar). toW and M set it down.
const SITE = { cx: -26.5, cz: -183 };                          // the middle of the front wall's outer face, in world x, z
const M = new THREE.Matrix4().makeRotationY(-Math.PI / 2).setPosition(SITE.cx, 0, SITE.cz);
const toW = (x, z) => [SITE.cx - z, SITE.cz + x];
const vecW = ([x, y, z]) => [-z, y, x];
const rectW = (x0, x1, z0, z1) => ({ x0: SITE.cx - Math.max(z0, z1), x1: SITE.cx - Math.min(z0, z1), z0: SITE.cz + Math.min(x0, x1), z1: SITE.cz + Math.max(x0, x1) });
const FLR = 1.5;                                             // the floor, two steps above the pavement
const IX = 11, TH = 1.5, OX = IX + TH;                       // half the nave's width inside; the walls; outside
const OZ0 = 0, IZ0 = OZ0 + TH, IZ1 = 51.5, OZ1 = IZ1 + TH;   // the front (the door) to the far end wall
const PLATE = FLR + 18, PITCH = 1.3;                         // top of the side walls; the roof's slope (52 degrees)
const yC = d => PLATE + (IX - d) * PITCH;                    // the ceiling, d feet from the middle line
const yO = d => yC(d) + 1.3;                                 // the roof's top
const EAVE = 14.4, RIDGE = yO(0);
const DOOR = { hw: 2.6, h: 9.2 };
const DAIS = { z0: 41, y: FLR + 0.5 };
const TABLE = { x0: -3.4, x1: 3.4, z0: 44.4, z1: 46.8, y: DAIS.y + 3.3 };
const SILL = FLR + 5, WW = 4.0, WH = 8.0, BAYS = 5, BAY = (IZ1 - IZ0) / BAYS;
const bayZ = i => IZ0 + BAY * (i + 0.5);
const ROSE = { r: 3.8, y: FLR + 22.5 };
const GREAT = { w: 7.6, h: 15.2, y0: FLR + 5.4 };
const FL = { z: 8, half: 2.4, base: RIDGE + 5.5, top: RIDGE + 11.7, spire: 22 };      // the fleche on the ridge, near the street
const COLLAR = PLATE + 7.5;
const PEWS = { rows: [13, 17, 21, 25, 29, 33], x0: 2.6, x1: 9.2 };
const YARD = { zw: 9, gx: -27, xW: -40 };                    // the churchyard, west of the nave: its wall on the Overlook's edge, the gate's middle, its west side

const BRICK = 'brick#a98572', PLINTH = 'clinker', PL = 'plaster#f1eadc', TRIM = 'c#efe6d2/0.7', SHAKE = 'shake#d9c4a4', STONE = 'c#d5cebf/0.85', DOORPAINT = 'c#58786e/0.6', IRON = 'c#2a2926/0.45/0.7';

// The windows: where each one's glass is, which way is out (n), which way its picture runs seen from inside (u)
const side = (id, wall, i) => wall === 'S'
  ? { id, c: [-OX + 0.5, SILL + WH / 2, bayZ(i)], n: [-1, 0, 0], u: [0, 0, -1], w: WW, h: WH }
  : { id, c: [OX - 0.5, SILL + WH / 2, bayZ(i)], n: [1, 0, 0], u: [0, 0, 1], w: WW, h: WH };
const GLASS = [
  ...['life', 'turing', 'lorenz', 'loop', 'eigen'].map((id, i) => side(id, 'S', i)),
  ...['neuron', 'symmetry', 'tree', 'logistic', 'calculus'].map((id, i) => side(id, 'N', i)),
  { id: 'murmuration', c: [0, ROSE.y, OZ0 + 0.5], n: [0, 0, -1], u: [-1, 0, 0], w: ROSE.r * 2, h: ROSE.r * 2, round: true },
  { id: 'ingression', c: [0, GREAT.y0 + GREAT.h / 2, OZ1 - 0.5], n: [0, 0, 1], u: [-1, 0, 0], w: GREAT.w, h: GREAT.h, gable: true },
];
const HOLE = g => [g.c[2] - g.w / 2 - 0.15, g.c[2] + g.w / 2 + 0.15, SILL - 0.15, SILL + WH + 0.15];
const holesOf = s => GLASS.filter(g => g.n[0] === s).map(HOLE);

const GLASSW = GLASS.map(g => ({ ...g, c: [SITE.cx - g.c[2], g.c[1], SITE.cz + g.c[0]], n: vecW(g.n), u: vecW(g.u) }));      // the same, in the world
export const CHAPEL = { floor: FLR, door: { x: SITE.cx, z: SITE.cz, yaw: -Math.PI / 2 }, inside: rectW(-IX, IX, IZ0, IZ1), footprint: rectW(-OX - 2.25, OX + 2.25, OZ0 - 2.6, OZ1 + 0.25),
  churchyard: rectW(-OX - 2.25, YARD.xW, YARD.zw, 58), gatePath: rectW(YARD.gx - 4, YARD.gx + 4, 8.15, 13.5), yardPath: rectW(YARD.gx - 2, YARD.gx + 2, 13.5, 50), glass: GLASSW };
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
const MINE = { candles: [], water: null };                   // what furnishChapel leaves for chapelLife

// ======================================================================================================
// The shell
// ======================================================================================================
export function chapelShell(B0, t) {
  const B = local(B0), CURB = t.CURB ?? 0.5, surf = (x0, x1, z0, z1, h) => t.surfaces.push({ ...rectW(x0, x1, z0, z1), h });
  const box = (mat, x0, x1, y0, y1, z0, z1, o) => B.wbox(mat, x0, x1, y0, y1, z0, z1, o);
  const solid = (x0, x1, z0, z1, y1, y0 = 0) => B.colliders.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), y0, y1 });
  const beam = (mat, a, b, w, h = w) => B.mesh(mat, beamGeo(a, b, w, h));

  // ---- the way in, the base, the floor ---------------------------------------------------------------
  box('pavers', -15, 15, -0.6, CURB - 0.012, -2.5, 0.02); surf(-15, 15, -2.5, 0, CURB);                // the pavement, carried back to the front wall
  box('concrete', -7.2, 7.2, -0.6, 1.0, -2.6, -1.6); box('concrete', -6.5, 6.5, -0.6, FLR, -1.6, 0.02);      // a step and the landing
  surf(-7.2, 7.2, -2.6, -1.6, 1.0); surf(-6.5, 6.5, -1.6, 0, FLR);
  surf(-DOOR.hw, DOOR.hw, OZ0 - 0.1, IZ0 + 0.1, FLR); surf(-IX, IX, IZ0, IZ1, FLR); surf(-IX, IX, DAIS.z0, IZ1, DAIS.y);
  for (const s of [-1, 1]) box(PLINTH, s * OX, s * (OX + 0.25), 0, 2.4, OZ0 - 0.25, OZ1 + 0.25);
  box(PLINTH, -OX, OX, 0, 2.4, OZ1, OZ1 + 0.25);
  for (const s of [-1, 1]) box(PLINTH, s * (DOOR.hw + 0.3), s * OX, 0, 2.4, OZ0 - 0.25, OZ0);
  box(PLINTH, -DOOR.hw, DOOR.hw, 0, FLR - 0.1, OZ0 + 0.03, IZ0);                     // under the threshold
  box('timber', -DOOR.hw, DOOR.hw, FLR - 0.1, FLR + 0.02, OZ0 - 0.08, IZ0 + 0.06, { grain: 'long' });
  // pale limestone flags, a little different one from the next
  box('c#8a7f6c/1', -IX, IX, FLR - 0.4, FLR - 0.03, IZ0, IZ1);
  for (let x = -IX, i = 0; x < IX - 0.01; x += 3.5, i++) for (let z = IZ0 - (i % 2) * 2.2, j = 0; z < DAIS.z0 - 0.01; z += 4.4, j++) {
    const z0 = Math.max(IZ0, z), z1 = Math.min(DAIS.z0, z + 4.4), v = ((i * 7 + j * 5) % 5) - 2;
    const c = [0xb4, 0xa6, 0x8c].map((q, k) => Math.max(0, Math.min(255, q + v * 5 + ((i + j) % 3) * 3 - k * ((i * j) % 2))));
    if (z1 - z0 > 0.05) box('c#' + c.map(q => q.toString(16).padStart(2, '0')).join('') + '/0.85', x + 0.015, x + 3.5 - 0.015, FLR - 0.2, FLR, z0 + 0.015, z1 - 0.015);
  }
  box('c#b9ad94/0.85', -IX, IX, FLR - 0.2, DAIS.y, DAIS.z0, IZ1); box('c#c9bea6/0.8', -IX, IX, DAIS.y - 0.14, DAIS.y + 0.012, DAIS.z0 - 0.12, DAIS.z0 + 0.5);

  // ---- the long walls: brick outside, plaster within, pieced round the windows ------------------------
  for (const s of [-1, 1]) {
    const xo = s * OX, xm = s * (IX + TH / 2), xi = s * IX, holes = holesOf(s);
    for (const [z0, z1, y0, y1] of around(OZ0 + TH / 2, OZ1 - TH / 2, 0, yO(OX) - 0.1, holes)) box(BRICK, xo, xm, y0, y1, z0, z1);
    for (const [z0, z1, y0, y1] of around(IZ0, IZ1, FLR, PLATE, holes)) box(PL, xm, xi, y0, y1, z0, z1);
    solid(xo, xi, OZ0, OZ1, PLATE + 2);
    for (const [z0, z1] of holes) {
      box(STONE, xi + s * 0.02, xi - s * 0.3, SILL - 0.4, SILL - 0.13, z0 - 0.3, z1 + 0.3);                 // sills in and out, a head outside
      box(TRIM, xo - s * 0.04, xo + s * 0.4, SILL - 0.5, SILL - 0.14, z0 - 0.35, z1 + 0.35);
      box(TRIM, xo - s * 0.04, xo + s * 0.22, SILL + WH + 0.16, SILL + WH + 0.9, z0 - 0.5, z1 + 0.5);
    }
    box('timber', xi + s * 0.02, xi - s * 0.5, PLATE - 0.7, PLATE - 0.02, IZ0, IZ1, { grain: 'long' });      // the wall plate
    // buttresses between the bays and at the corners
    for (let k = 0; k <= BAYS; k++) {
      const z = k === 0 ? OZ0 + 1.2 : k === BAYS ? OZ1 - 1.2 : IZ0 + BAY * k;
      box(PLINTH, xo, xo + s * 2.25, 0, 2.4, z - 1.35, z + 1.35); box(BRICK, xo, xo + s * 2.0, 0, 11, z - 1.1, z + 1.1);
      box(TRIM, xo, xo + s * 2.12, 11, 11.35, z - 1.2, z + 1.2); box(BRICK, xo, xo + s * 1.1, 11.35, PLATE - 3.2, z - 0.9, z + 0.9); box(TRIM, xo, xo + s * 1.22, PLATE - 3.2, PLATE - 2.9, z - 1.0, z + 1.0);
      solid(xo, xo + s * 2.25, z - 1.35, z + 1.35, 11);
    }
  }
  // the windows' frames, dark timber, a ring lapping the glass's edge
  for (const g of GLASS) {
    if (g.round || g.gable) continue;
    const s = g.n[0], zc = g.c[2], a = z => s * z, bx = (z0, z1, y0, y1) => [[a(z0), y0], [a(z1), y0], [a(z1), y1], [a(z0), y1]];
    frameRing(B, 'timber', bx(zc - g.w / 2 - 0.2, zc + g.w / 2 + 0.2, SILL - 0.2, SILL + WH + 0.2), bx(zc - g.w / 2 + 0.1, zc + g.w / 2 - 0.1, SILL + 0.1, SILL + WH - 0.1),
      new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, s), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-s, 0, 0)).setPosition(s * (OX - 0.32), 0, 0), 0.36);
  }

  // ---- the end walls: gables, each made as two halves meeting on the middle line (so that the
  // openings are cut from the outline, never as holes: a hole is bridged to the edge and the seam shows)
  const endWall = west => {
    const halves = (half, base, top) => {
      const left = [[-half, base]];
      if (west) {
        const R = ROSE.r + 0.16;
        left.push([-DOOR.hw, base], [-DOOR.hw, FLR + DOOR.h], [0, FLR + DOOR.h]);
        for (let k = 0; k <= 40; k++) { const a = -Math.PI / 2 - Math.PI * k / 40; left.push([Math.cos(a) * R, ROSE.y + Math.sin(a) * R]); }
      } else {
        const w = GREAT.w + 0.3, h = GREAT.h + 0.3, o = w7Outline(w, h).map(([u, v]) => [u - w / 2, GREAT.y0 - 0.15 + (h - v)]);      // apex, right shoulder, right foot, left foot, left shoulder
        left.push([0, base], [0, o[3][1]], o[3], o[4], o[0]);
      }
      left.push([0, top(0)], [-half, top(half)]);
      return [left, left.map(([x, y]) => [-x, y]).reverse()].map(pts => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))));
    };
    const layer = (mat, half, base, top, z0, depth) => { for (const sh of halves(half, base, top)) { const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4 }); g.translate(0, 0, z0); B.mesh(mat, g); } };
    layer(BRICK, OX, 0, d => yO(d) - 0.4, west ? OZ0 : OZ1 - TH / 2, TH / 2);
    layer(PL, IX, FLR, d => yC(d), west ? OZ0 + TH / 2 : IZ1, TH / 2);
  };
  endWall(true); endWall(false);
  for (const s of [-1, 1]) solid(s * DOOR.hw, s * OX, OZ0, IZ0, 40);
  B.colliders.push({ x0: -DOOR.hw, x1: DOOR.hw, z0: OZ0, z1: IZ0, y0: FLR + DOOR.h, y1: 40 });
  solid(-OX, OX, IZ1, OZ1, 40);
  {
    const ring = (r, n = 72) => Array.from({ length: n }, (_, i) => [Math.cos(i / n * Math.PI * 2) * r, ROSE.y + Math.sin(i / n * Math.PI * 2) * r]);
    frameRing(B, 'timber', ring(ROSE.r + 0.22), ring(ROSE.r - 0.12), new THREE.Matrix4().setPosition(0, 0, OZ0 + 0.32), 0.36);
    frameRing(B, TRIM, ring(ROSE.r + 0.9), ring(ROSE.r + 0.2), new THREE.Matrix4().setPosition(0, 0, OZ0 - 0.12), 0.2);            // a pale stone surround outside
    const head = (w, h, y0) => w7Outline(w, h).map(([u, v]) => [u - w / 2, y0 + h - v]);
    frameRing(B, 'timber', head(GREAT.w + 0.4, GREAT.h + 0.4, GREAT.y0 - 0.2), head(GREAT.w - 0.24, GREAT.h - 0.24, GREAT.y0 + 0.12), new THREE.Matrix4().setPosition(0, 0, OZ1 - 0.68), 0.36);
    box(STONE, -GREAT.w / 2 - 0.5, GREAT.w / 2 + 0.5, GREAT.y0 - 0.55, GREAT.y0 - 0.17, IZ1 - 0.3, IZ1 + 0.3);
    box(TRIM, -GREAT.w / 2 - 0.6, GREAT.w / 2 + 0.6, GREAT.y0 - 0.6, GREAT.y0 - 0.17, OZ1 - 0.3, OZ1 + 0.35);
  }
  // a belt of pale stone across both gables at the eaves' height
  for (const s of [-1, 1]) box(TRIM, s * (ROSE.r + 1.6), s * (OX + 0.02), PLATE - 2.6, PLATE - 2.1, OZ0 - 0.14, OZ0 + 0.1);
  for (const s of [-1, 1]) box(TRIM, s * (GREAT.w / 2 + 0.9), s * (OX + 0.02), PLATE - 2.6, PLATE - 2.1, OZ1 - 0.1, OZ1 + 0.14);

  // ---- the doorway: casings, the lintel (lettered in furnishChapel), a shingled hood, both leaves standing open
  for (const s of [-1, 1]) box(TRIM, s * (DOOR.hw + 0.25), s * (DOOR.hw - 0.04), FLR + 0.02, FLR + DOOR.h - 0.03, OZ0 - 0.06, IZ0 + 0.06);
  box(TRIM, -DOOR.hw - 0.25, DOOR.hw + 0.25, FLR + DOOR.h - 0.04, FLR + DOOR.h + 0.3, OZ0 - 0.06, IZ0 + 0.06);
  box('timber', -4.1, 4.1, FLR + DOOR.h + 0.3, FLR + DOOR.h + 1.6, OZ0 - 0.5, OZ0 + 0.1, { grain: 'long' });
  for (const s of [-1, 1]) {
    beam('timber', [s * 3.9, FLR + DOOR.h + 0.1, OZ0 - 0.3], [s * 3.9, FLR + DOOR.h + 1.75, OZ0 - 2.5], 0.4, 0.4);                  // brackets
    box('timber', s * 3.7, s * 4.1, FLR + DOOR.h + 1.6, FLR + DOOR.h + 1.95, OZ0 - 2.9, OZ0);
    B.mesh('roof', feetBox(5.4, 0.3, 3.2).applyMatrix4(new THREE.Matrix4().makeRotationZ(-s * 0.62).setPosition(s * 2.1, FLR + DOOR.h + 3.45, OZ0 - 1.5)));
    beam('timber', [s * 4.45, FLR + DOOR.h + 1.75, OZ0 - 3.02], [0, FLR + DOOR.h + 4.92, OZ0 - 3.02], 0.5, 0.16);
    // the leaf, hinged on its jamb, swung out and back against the wall
    const a = s * 0.3, cx = s * (DOOR.hw + 0.05 + 1.3 * Math.cos(0.3)), cz = OZ0 - 0.22 - 1.3 * Math.sin(0.3), W = DOOR.hw;
    box(DOORPAINT, cx - W / 2, cx + W / 2, FLR + 0.05, FLR + DOOR.h - 0.06, cz - 0.09, cz + 0.09, { rot: [0, a, 0] });
    for (const y of [FLR + 0.9, FLR + 4.4, FLR + 8.0]) box(DOORPAINT, cx - W / 2 + 0.15, cx + W / 2 - 0.15, y, y + 0.5, cz - 0.15, cz + 0.15, { rot: [0, a, 0] });
    for (const y of [FLR + 1.1, FLR + 8.18]) box(IRON, cx - W / 2 + 0.02, cx + W / 2 - 0.5, y, y + 0.14, cz - 0.18, cz + 0.18, { rot: [0, a, 0] });
    solid(s * DOOR.hw, s * (DOOR.hw + 2.7), OZ0 - 1.1, OZ0, FLR + DOOR.h);
    // a lantern on a bracket: iron and amber glass (it glows from dusk; furnishChapel gives it a lamp)
    const lx = s * 6.6, ly = FLR + 7.2, lz = OZ0 - 0.9;
    box(IRON, lx - 0.04, lx + 0.04, ly + 0.9, ly + 0.97, lz, OZ0); box(IRON, lx - 0.26, lx + 0.26, ly + 0.62, ly + 0.72, lz - 0.26, lz + 0.26); box(IRON, lx - 0.22, lx + 0.22, ly - 0.08, ly, lz - 0.22, lz + 0.22);
    box(IRON, lx - 0.05, lx + 0.05, ly + 0.72, ly + 0.95, lz - 0.05, lz + 0.05);
    for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(IRON, lx + dx * 0.19 - 0.025, lx + dx * 0.19 + 0.025, ly, ly + 0.62, lz + dz * 0.19 - 0.025, lz + dz * 0.19 + 0.025);
    box('e#ffd9a0/2.2', lx - 0.17, lx + 0.17, ly + 0.01, ly + 0.61, lz - 0.17, lz + 0.17);
  }

  // ---- the roof's timbers (the shingles are a material of their own, made in chapelLife) ---------------
  for (const s of [-1, 1]) {
    B.mesh(PL, slab(0, IX + 0.05, yC, 0.15, IZ0, IZ1, s, true));                                                                // the plaster between the rafters
    for (let k = 1; k < BAYS * 4; k++) if (k % 4) beam('timber', [s * IX, yC(IX) - 0.2, IZ0 + k * BAY / 4], [s * 0.2, yC(0.2) - 0.2, IZ0 + k * BAY / 4], 0.42, 0.3);      // common rafters
    for (const d of [IX / 3, IX * 2 / 3]) beam('timber', [s * d, yC(d) - 0.55, IZ0], [s * d, yC(d) - 0.55, IZ1], 0.5, 0.6);                  // purlins
    for (const z of [OZ0 - 1.25, OZ1 + 1.25]) beam('timber', [s * EAVE, yO(EAVE) - 0.55, z], [0, yO(0) - 0.55, z], 1.0, s < 0 ? 0.26 : 0.2);      // bargeboards
    for (let z = OZ0 + 0.6; z < OZ1; z += 3.1) beam('timber', [s * (OX - 0.3), yO(OX - 0.3) - 0.72, z], [s * (EAVE - 0.1), yO(EAVE - 0.1) - 0.72, z], 0.4, 0.3);      // rafter tails under the eaves
  }
  box('timber', -0.3, 0.3, yC(0) - 0.95, yC(0) - 0.1, IZ0, IZ1, { grain: 'long' });                                              // the ridge piece
  for (let k = 1; k < BAYS; k++) {
    const z = IZ0 + BAY * k, cx = IX - (COLLAR - PLATE) / PITCH;
    for (const s of [-1, 1]) {
      beam('timber', [s * IX, yC(IX) - 0.5, z], [0, yC(0) - 0.5, z], 0.95, 0.75);                                                  // principal rafter
      box('timber', s * IX + s * 0.02, s * (IX - 0.6), PLATE - 7, PLATE - 0.7, z - 0.32, z + 0.32);                                 // wall post, on a stone corbel
      box(STONE, s * IX + s * 0.02, s * (IX - 0.85), PLATE - 7.7, PLATE - 7, z - 0.45, z + 0.45);
      // the arch brace, from the post up to the collar
      const y0 = PLATE - 6.6, y1 = COLLAR - 0.3, x1 = cx * 0.68, N = 7; let p = [s * (IX - 0.3), y0, z];
      for (let i = 1; i <= N; i++) { const a = (i / N) * Math.PI / 2, q = [s * (IX - 0.3 - (IX - 0.3 - x1) * (1 - Math.cos(a))), y0 + (y1 - y0) * Math.sin(a), z]; beam('timber', p, q, 0.6, 0.5); p = q; }
    }
    box('timber', -cx - 0.2, cx + 0.2, COLLAR - 0.45, COLLAR + 0.45, z - 0.33, z + 0.33, { grain: 'long' });                        // collar
    box('timber', -0.34, 0.34, COLLAR + 0.45, yC(0) - 0.6, z - 0.3, z + 0.3);                                                       // king post
    for (const s of [-1, 1]) beam('timber', [s * 0.2, COLLAR + 0.6, z], [s * cx * 0.55, yC(cx * 0.55) - 0.7, z], 0.4, 0.4);         // its struts
  }

  // ---- the fleche: a shingled drum on the ridge, an open bell stage, a tall eight-sided spire ----------
  {
    const z = FL.z, h = FL.half;
    box('timber', -h - 0.3, h + 0.3, FL.base, FL.base + 0.4, z - h - 0.3, z + h + 0.3);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      box('timber', sx * (h - 0.5), sx * h, FL.base + 0.4, FL.top - 0.5, z + sz * (h - 0.5), z + sz * h);
      beam('timber', [sx * (h - 0.25), FL.top - 2.2, z + sz * (h - 0.25)], [sx * (h - 1.7), FL.top - 0.6, z + sz * (h - 0.25)], 0.3, 0.3);
      beam('timber', [sx * (h - 0.25), FL.top - 2.2, z + sz * (h - 0.25)], [sx * (h - 0.25), FL.top - 0.6, z + sz * (h - 1.7)], 0.3, 0.3);
    }
    for (const sx of [-1, 1]) { box('timber', sx * (h - 0.4), sx * (h - 0.15), FL.base + 1.6, FL.base + 1.85, z - h + 0.5, z + h - 0.5); box('timber', -h + 0.5, h - 0.5, FL.base + 1.6, FL.base + 1.85, z + sx * (h - 0.4), z + sx * (h - 0.15)); }
    box('timber', -h - 0.5, h + 0.5, FL.top - 0.5, FL.top, z - h - 0.5, z + h + 0.5);
    box('timber', -h, h, FL.top - 1.1, FL.top - 0.6, z - 0.22, z + 0.22);                                                          // the bell's beam
    const cone = new THREE.ConeGeometry(4.2, FL.spire, 8, 1, true), uv = cone.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 27.5, uv.getY(i) * FL.spire);
    cone.rotateY(Math.PI / 8); cone.translate(0, FL.top + FL.spire / 2, z); const flat = cone.toNonIndexed(); flat.computeVertexNormals(); B.mesh('roof', flat);
    B.mesh('timber', new THREE.CircleGeometry(4.2, 8).rotateX(Math.PI / 2).rotateY(Math.PI / 8).translate(0, FL.top + 0.02, z));
  }

  // ---- the room, its light, its openings ---------------------------------------------------------------
  t.rooms.push({ name: 'The Chapel', ...rectW(-IX, IX, IZ0, IZ1), y0: FLR - 1, y1: yC(0) + 0.2, lot: 'chapel' });
  { const r = rectW(-(OX - 0.5), OX - 0.5, OZ0 + 0.5, OZ1 - 0.5); t.boxes.push([r.x0, r.x1, r.z0, r.z1, FLR - 0.6, yC(0) + 1.0]); }      // to the glass: reveals inside it are indoors, outside it out
  t.portals.push({ ...rectW(-DOOR.hw, DOOR.hw, OZ0, IZ0), y0: FLR, y1: FLR + DOOR.h, n: 'x', kind: 'door' });
  t.footprints.push(rectW(-OX - 2.3, OX + 2.3, OZ0 - 0.3, OZ1 + 0.3));
  for (const z of [10, 26, 42]) { const [x, zz] = toW(0, z); t.lamps.push({ x, y: PLATE - 2, z: zz, power: 1.0 }); }                  // daylight bounced round the nave
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
  const G = { grain: 'long' }, OAK = 'oak_light', OAKD = 'timber';
  const t0 = (x0, x1, z0, z1, h) => town.surfaces.push({ ...rectW(x0, x1, z0, z1), h });
  const goudy = (g, s, x, y, px, col, o = {}) => T(g, s, x, y, px, col, { f: FONT, ...o });

  // ---- pews, facing east ---------------------------------------------------------------------------------
  PEWS.rows.forEach((zr, k) => {
    for (const s of [-1, 1]) {
      const xa = s * PEWS.x0, xb = s * PEWS.x1, x0 = Math.min(xa, xb), x1 = Math.max(xa, xb);
      box(OAK, x0 + 0.1, x1 - 0.1, FLR + 1.36, FLR + 1.5, zr, zr + 1.5, G);                                // seat
      box(OAK, x0 + 0.1, x1 - 0.1, FLR + 0.3, FLR + 3.05, zr - 0.14, zr, G);                                // back
      box(OAK, x0 + 0.1, x1 - 0.1, FLR + 3.05, FLR + 3.17, zr - 0.2, zr + 0.06, G);                         // its cap
      box(OAK, x0 + 0.1, x1 - 0.1, FLR + 2.2, FLR + 2.26, zr - 0.55, zr - 0.14, G);                         // a ledge for the row behind
      for (const xe of [xa, xb]) { box(OAKD, xe - 0.1, xe + 0.1, FLR, FLR + (xe === xa ? 3.5 : 3.1), zr - 0.24, zr + 1.62); }
      box(OAKD, xa - 0.14, xa + 0.14, FLR + 3.5, FLR + 3.62, zr - 0.3, zr + 0.3);
      solid(x0, x1, zr - 0.24, zr + 1.62, FLR + 3.1, FLR);
      kit.seat(fw(s * 4.2, zr + 0.8, FLR, 2), 0, 0, 1.5, 'sit for a while');
      if (k % 2 === 0) kit.seat(fw(s * 7.6, zr + 0.8, FLR, 2), 0, 0, 1.5, 'sit for a while');
    }
  });

  // ---- the stone table before the great window: candles, a bowl of water, Piaget's sentence in its edge
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
    // two tall standing candlesticks, one each side
    for (const s of [-1, 1]) {
      const c = fw(s * 5.2, z0 + 0.6, DAIS.y, 0);
      c.lathe(OAKD, 0, 0, [[0.01, 0], [0.55, 0], [0.55, 0.12], [0.2, 0.3], [0.1, 0.6], [0.14, 1.6], [0.08, 1.9], [0.1, 3.4], [0.16, 3.6], [0.3, 3.75], [0.32, 3.82], [0.01, 3.82]], { seg: 14 });
      kit.pillarCandle(c, 0, 0, 3.82, 0.9, 0.14); solid(s * 5.2 - 0.4, s * 5.2 + 0.4, z0 + 0.2, z0 + 1.0, DAIS.y + 4, DAIS.y);
    }
  }

  // ---- tapers to light: an iron rack against the south wall, by the step ---------------------------------
  {
    const f = fw(-IX + 0.25, 37.9, FLR, 3);                                               // +y out into the nave, +x toward the east
    f.box(IRON, -2.3, 2.3, 0.15, 1.75, 2.55, 2.62); f.box(IRON, -2.3, 2.3, 0.15, 0.9, 2.95, 3.0);
    for (const [x, y] of [[-2.2, 0.25], [2.2, 0.25], [-2.2, 1.65], [2.2, 1.65]]) f.box(IRON, x - 0.05, x + 0.05, y - 0.05, y + 0.05, 0, y < 1 ? 3.0 : 2.55);
    f.box(IRON, -2.2, 2.2, 0.2, 0.26, 0.5, 0.56); f.box(IRON, -2.2, 2.2, 1.62, 1.68, 0.5, 0.56);
    f.box('c#c9b48a/0.9', -2.15, 2.15, 0.3, 1.6, 2.62, 2.66);                                // sand in the tray
    for (let i = 0; i < 6; i++) { kit.candle(f, -1.8 + i * 0.72, 1.3, 2.62, 0.42 + ((i * 7) % 3) * 0.08); kit.candle(f, -1.8 + i * 0.72, 0.55, 3.0, 0.4 + ((i * 5) % 3) * 0.09); }
    f.block(-2.3, 2.3, 0, 1.8, 0, 3.4);
    kit.sign(f, 0, 1.78, 1.6, 2.6, 0.9, (g, w, h) => {
      paper(g, w, h, '#efe7d2'); g.strokeStyle = '#5b4636'; g.lineWidth = 2; g.strokeRect(5, 5, w - 10, h - 10);
      goudy(g, 'Light one', w / 2, h * 0.3, h * 0.26, '#3a2a1c', { it: 1 }); goudy(g, 'for a question you have not answered.', w / 2, h * 0.58, h * 0.13, '#3a2a1c', { it: 1 });
      goudy(g, 'NO CHARGE · MIND YOUR SLEEVES', w / 2, h * 0.82, h * 0.085, '#8a5a3a', { ls: 2 });
    }, { cw: 286, ch: 100 });
  }

  // ---- the lectern, on the step: the last paragraph of the Origin (first edition, 1859) --------------------
  {
    const x = 6.6, z = 42.9, y = DAIS.y, t = 0.95, cy = y + 4.25;
    fw(x, z, y, 0).lathe(OAKD, 0, 0, [[0.01, 0], [0.9, 0], [0.9, 0.14], [0.3, 0.4], [0.16, 0.9], [0.2, 2.2], [0.14, 2.6], [0.22, 3.6], [0.4, 3.8], [0.01, 3.85]], { seg: 12 });
    box(OAK, x - 1.45, x + 1.45, cy - 1.0, cy + 1.0, z + 0.07 * Math.cos(t) - 0.045, z + 0.07 * Math.cos(t) + 0.045, { rot: [t, 0, 0] });
    box(OAK, x - 1.45, x + 1.45, cy - 0.62, cy - 0.5, z - 0.92, z - 0.72);                    // the lip the book rests on
    solid(x - 1.3, x + 1.3, z - 0.9, z + 0.9, y + 4.6, y);
    sign(x, z - 0.03, cy + 0.02, 0, 2.64, 1.76, (g, w, h) => {
      paper(g, w, h, '#efe6cf', 7); const gr = g.createLinearGradient(w * 0.44, 0, w * 0.56, 0); gr.addColorStop(0, 'rgba(60,40,20,0)'); gr.addColorStop(0.5, 'rgba(60,40,20,.32)'); gr.addColorStop(1, 'rgba(60,40,20,0)'); g.fillStyle = gr; g.fillRect(w * 0.44, 0, w * 0.12, h);
      const ink = '#2a1c13', m = w * 0.045, cw = w / 2 - m * 2.1;
      goudy(g, 'ON THE ORIGIN OF SPECIES', w * 0.25, h * 0.07, h * 0.034, '#7a4a2a', { ls: 2 }); goudy(g, 'CHAP. XIV.   CONCLUSION.', w * 0.75, h * 0.07, h * 0.034, '#7a4a2a', { ls: 2 });
      para(g, 'It is interesting to contemplate an entangled bank, clothed with many plants of many kinds, with birds singing on the bushes, with various insects flitting about, and with worms crawling through the damp earth, and to reflect that these elaborately constructed forms, so different from each other, and dependent on each other in so complex a manner, have all been produced by laws acting around us.', m, h * 0.14, h * 0.047, ink, cw, { f: FONT, lh: 1.32 });
      para(g, 'There is grandeur in this view of life, with its several powers, having been originally breathed into a few forms or into one; and that, whilst this planet has gone cycling on according to the fixed law of gravity, from so simple a beginning endless forms most beautiful and most wonderful have been, and are being, evolved.', w / 2 + m * 1.1, h * 0.14, h * 0.047, ink, cw, { f: FONT, lh: 1.32 });
      goudy(g, 'Charles Darwin, 1859. The last paragraph, first and last sentences.', w * 0.75, h * 0.93, h * 0.036, '#7a4a2a', { it: 1 }); goudy(g, '489', w * 0.25, h * 0.93, h * 0.036, '#7a4a2a');
      line(g, [[w * 0.56, h * 0.885], [w * 0.94, h * 0.885]], 'rgba(122,74,42,.5)', 1);
    }, { cw: 792, ch: 528, tilt: t, rough: 0.85 });
  }

  // ---- two boards on the east wall: numbers that are not hymns, and what they are ---------------------------
  {
    const NUM = [['393', 'P. W. Anderson, More Is Different.', 'Science 177 (1972)'], ['37', 'A. M. Turing, The Chemical Basis of Morphogenesis.', 'Phil. Trans. R. Soc. B 237 (1952)'], ['130', 'E. N. Lorenz, Deterministic Nonperiodic Flow.', 'J. Atmos. Sci. 20 (1963)'],
      ['459', 'R. M. May, Simple mathematical models with very complicated dynamics.', 'Nature 261 (1976)'], ['120', "M. Gardner, on John Conway's game of Life.", 'Scientific American 223 (Oct. 1970)'], ['115', 'W. S. McCulloch & W. Pitts, A Logical Calculus of the Ideas Immanent in Nervous Activity.', 'Bull. Math. Biophys. 5 (1943)']];
    const wood = (g, w, h) => { fill(g, w, h, '#3b2a1f'); const r = rng(5); for (let i = 0; i < 50; i++) { g.strokeStyle = `rgba(${i % 2 ? '20,12,8' : '96,70,50'},.22)`; g.lineWidth = 1 + (i % 3); g.beginPath(); const x = r() * w; g.moveTo(x, 0); g.bezierCurveTo(x + 4, h * 0.3, x - 4, h * 0.7, x + 2, h); g.stroke(); } g.strokeStyle = '#1c130d'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); };
    for (const s of [-1, 1]) { box(OAKD, s * 7.6 - 1.6, s * 7.6 + 1.6, DAIS.y + 4.85, DAIS.y + 9.65, IZ1 - 0.16, IZ1 - 0.02); box(OAKD, s * 7.6 - 1.8, s * 7.6 + 1.8, DAIS.y + 9.65, DAIS.y + 9.85, IZ1 - 0.26, IZ1 - 0.02); }
    sign(-7.6, IZ1 - 0.17, DAIS.y + 7.25, 0, 3.0, 4.6, (g, w, h) => {
      wood(g, w, h); carve(g, 'READINGS', w / 2, h * 0.1, h * 0.062, { track: 0.3, ink: '#e9dcc0', shadow: 'rgba(0,0,0,.6)', light: 'rgba(255,240,210,.1)' });
      NUM.forEach(([n], i) => { const y = h * (0.15 + i * 0.138); g.fillStyle = '#1c130d'; g.fillRect(w * 0.14, y + h * 0.118, w * 0.72, h * 0.012); const cw = w * 0.2, x0 = w / 2 - n.length * cw / 2; [...n].forEach((ch, k) => { g.fillStyle = '#efe7d2'; g.fillRect(x0 + k * cw + 2, y, cw - 4, h * 0.118); T(g, ch, x0 + (k + 0.5) * cw, y + h * 0.064, h * 0.1, '#1c1612', { f: F.dm }); }); });
    }, { cw: 340, ch: 520, rough: 0.8 });
    sign(7.6, IZ1 - 0.17, DAIS.y + 7.25, 0, 3.0, 4.6, (g, w, h) => {
      wood(g, w, h); carve(g, 'NOT HYMNS', w / 2, h * 0.1, h * 0.062, { track: 0.3, ink: '#e9dcc0', shadow: 'rgba(0,0,0,.6)', light: 'rgba(255,240,210,.1)' });
      g.fillStyle = '#efe7d2'; g.fillRect(w * 0.08, h * 0.14, w * 0.84, h * 0.81);
      goudy(g, 'Each number is the page a paper begins on.', w / 2, h * 0.175, h * 0.031, '#3a2a1c', { it: 1 });
      NUM.forEach(([n, a, b], i) => { const y = h * (0.215 + i * 0.122); goudy(g, n, w * 0.12, y + h * 0.012, h * 0.042, '#7a2f2a', { a: 'left' }); const y2 = para(g, a, w * 0.3, y, h * 0.027, '#2a1c13', w * 0.6, { f: FONT, lh: 1.2 }); para(g, b, w * 0.3, y2, h * 0.024, '#7a5a3a', w * 0.6, { f: FONT, it: 1, lh: 1.2 }); });
    }, { cw: 408, ch: 624, rough: 0.8 });
  }

  // ---- by the door, north side: a table with the visitors' book ---------------------------------------------
  {
    const x0 = 7.5, x1 = IX - 0.3, z0 = IZ0 + 0.25, z1 = IZ0 + 3.2, y = FLR + 2.9;
    box(OAK, x0, x1, y - 0.12, y, z0, z1, G); for (const [x, z] of [[x0 + 0.2, z0 + 0.2], [x1 - 0.2, z0 + 0.2], [x0 + 0.2, z1 - 0.2], [x1 - 0.2, z1 - 0.2]]) box(OAK, x - 0.1, x + 0.1, FLR, y - 0.12, z - 0.1, z + 0.1);
    box(OAK, x0 + 0.2, x1 - 0.2, y - 0.5, y - 0.12, z0 + 0.25, z0 + 0.33); box(OAK, x0 + 0.2, x1 - 0.2, y - 0.5, y - 0.12, z1 - 0.33, z1 - 0.25);
    solid(x0, x1, z0, z1, y, FLR);
    const bx = 9.1, bz = IZ0 + 1.72; box('c#5a2f2a/0.7', bx - 0.78, bx + 0.78, y, y + 0.09, bz - 1.14, bz + 1.14);
    kit.sign(fw(bx, bz, y + 0.1, 1), 0, 0, 0, 2.2, 1.48, (g, w, h) => {
      paper(g, w, h, '#f1e9d6', 11); g.fillStyle = 'rgba(60,40,20,.25)'; g.fillRect(w / 2 - 2, 0, 4, h);
      for (let i = 0; i < 9; i++) for (const x of [0.04, 0.54]) line(g, [[w * x, h * (0.2 + i * 0.09)], [w * (x + 0.42), h * (0.2 + i * 0.09)]], 'rgba(90,110,140,.3)', 1);
      goudy(g, 'VISITORS', w * 0.25, h * 0.09, h * 0.06, '#7a4a2a', { ls: 3 });
      const hand = (s, x, y, col = '#27324a', o = {}) => T(g, s, w * x, h * y, h * 0.062, col, { f: F.caveat, w: 600, a: 'left', ...o });
      hand('Sat for an hour. Understood one', 0.05, 0.19); hand('window. Good hour.  — J.', 0.05, 0.28);
      hand('The Life window moved when I', 0.05, 0.4, '#5a2f2a'); hand('looked at it. I am told this is', 0.05, 0.49, '#5a2f2a'); hand('normal.  — Ember', 0.05, 0.58, '#5a2f2a');
      hand('which one is the frog', 0.05, 0.72, '#b8452e', { rot: -0.04 }); hand('(the green one. — M.)', 0.12, 0.83, '#6a6a6a');
      hand('Came in out of the wind.', 0.55, 0.19, '#2f4a40'); hand('Stayed for the glass.', 0.55, 0.28, '#2f4a40');
      hand('Rang the bell. Sorry.', 0.55, 0.42); hand('(not sorry)', 0.66, 0.51);
      hand('393, 37, 130: I looked them', 0.55, 0.65, '#3a2a1c'); hand('up. Worth it.  — P.', 0.55, 0.74, '#3a2a1c');
      hand('your name here ↓', 0.6, 0.9, '#8a8a8a');
    }, { cw: 440, ch: 296, flat: true, rough: 0.9 });
    box('c#1d1b19/0.4', bx - 1.1, bx - 1.07, y + 0.005, y + 0.03, bz - 0.5, bz + 0.1, { rot: [0, 0.5, 0] });      // a pen
    kit.later.push(ctx => ctx.interact.push({ x: toW(bx, bz)[0], y: y + 0.2, z: toW(bx, bz)[1], reach: 5.5, size: 1.2, label: () => "sign the visitors' book", act: () => ctx.flash?.('You write your name. The page is a little less empty.') }));
    // a small notice on the wall over it
    sign(IX - 0.02, IZ0 + 1.45, FLR + 5.4, 1, 2.3, 1.5, (g, w, h) => {
      paper(g, w, h, '#efe7d2'); g.strokeStyle = '#3a2a1c'; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12);
      goudy(g, 'THE CHAPEL', w / 2, h * 0.17, h * 0.13, '#3a2a1c', { ls: 4 });
      para(g, 'Not a church. A place to sit and think, about minds and how things come to be.', w * 0.1, h * 0.3, h * 0.09, '#2a1c13', w * 0.8, { f: FONT, it: 1, lh: 1.25 });
      para(g, 'The candles may be lit. The bell may be rung, once, and then you must listen to it. The Life window runs only while it is looked at.', w * 0.1, h * 0.6, h * 0.066, '#2a1c13', w * 0.8, { f: FONT, lh: 1.25 });
    }, { cw: 322, ch: 210 });
  }

  // ---- the lintel's lettering, and a lamp for each lantern ---------------------------------------------------
  sign(0, OZ0 - 0.515, FLR + DOOR.h + 0.95, 0, 7.0, 1.2, (g, w, h) => {
    fill(g, w, h, '#3b2a1f'); const r = rng(19);
    for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(${i % 2 ? '20,12,8' : '90,66,48'},.25)`; g.lineWidth = 1 + (i % 3); g.beginPath(); const y = r() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 4, w * 0.7, y - 4, w, y + 2); g.stroke(); }
    carve(g, 'MORE IS DIFFERENT', w / 2, h * 0.66, h * 0.4, { track: 0.2, ink: '#f1e6c8', shadow: 'rgba(0,0,0,.6)', light: 'rgba(255,240,210,.12)' });
  }, { cw: 840, ch: 144, rough: 0.85 });
  for (const s of [-1, 1]) { const [x, z] = toW(s * 6.6, OZ0 - 1.3); kit.lamps.push({ x, y: FLR + 7.4, z, power: 0.9, kind: 'lamp' }); }

  // ---- the churchyard, west of the nave: a low wall along the Overlook's paving with a lych-gate in it,
  // a path, two benches under the west windows facing the sunset, three cut stones -------------------------
  {
    const { zw, gx, xW } = YARD, WALLH = 3.1;
    for (const [a, b] of [[-OX, gx + 5.6], [gx - 5.6, xW]]) { box(BRICK, a, b, 0, WALLH, zw, zw + 1); box(TRIM, Math.max(a, b) + 0.1, Math.min(a, b) - 0.1, WALLH, WALLH + 0.22, zw - 0.1, zw + 1.1); solid(a, b, zw, zw + 1, WALLH + 0.3); }
    box(BRICK, xW, xW + 1, 0, WALLH, zw + 1, zw + 9); box(TRIM, xW - 0.1, xW + 1.1, WALLH, WALLH + 0.22, zw + 1, zw + 9.1); solid(xW, xW + 1, zw + 1, zw + 9, WALLH + 0.3);
    for (const [px, pz] of [[xW + 0.5, zw + 0.5], [xW + 0.5, zw + 9]]) { box(BRICK, px - 0.8, px + 0.8, 0, WALLH + 0.9, pz - 0.8, pz + 0.8); box(TRIM, px - 0.95, px + 0.95, WALLH + 0.9, WALLH + 1.15, pz - 0.95, pz + 0.95); }
    box('flagstone', gx - 4, gx + 4, -0.5, 0.5, 8.15, 13.5); t0(gx - 4, gx + 4, 8.15, 13.5, 0.5);                 // through the gate, at the paving's height
    box('flagstone', gx - 2, gx + 2, -0.3, 0.12, 13.5, 50); t0(gx - 2, gx + 2, 13.5, 50, 0.12);                  // and on down the yard
    for (const s of [-1, 1]) {
      // the lych-gate: four oak posts, a shingled roof across the path
      for (const z of [zw - 0.9, zw + 1.9]) { box(OAKD, gx + s * 4.6, gx + s * 5.2, 0.5, 8.6, z - 0.3, z + 0.3); B.mesh(OAKD, beamGeo([gx + s * 4.9, 6.2, z], [gx + s * 2.9, 8.5, z], 0.35, 0.35)); }
      box(PLINTH, gx + s * 4.3, gx + s * 5.5, 0, 1.4, zw - 1.5, zw + 2.5); solid(gx + s * 4.3, gx + s * 5.5, zw - 1.5, zw + 2.5, 8);
      box(OAKD, gx + s * 4.5, gx + s * 5.3, 8.6, 9.1, zw - 2.1, zw + 3.1, G);
    }
    for (const z of [zw - 0.9, zw + 1.9]) box(OAKD, gx - 5.6, gx + 5.6, 8.5, 9.1, z - 0.3, z + 0.3, G);
    for (const sz of [-1, 1]) B.mesh('roof', feetBox(13.4, 0.3, 4.3).applyMatrix4(new THREE.Matrix4().makeRotationX(sz * 0.75).setPosition(gx, 10.35, zw + 0.5 + sz * 1.55)));
    box(OAKD, gx - 6.9, gx + 6.9, 11.75, 12.05, zw + 0.3, zw + 0.7, G);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B.mesh(OAKD, beamGeo([gx + sx * 6.72, 9.0, zw + 0.5 + sz * 3.1], [gx + sx * 6.72, 11.85, zw + 0.5], 0.5, 0.14));
    sign(gx, zw - 1.215, 8.8, 0, 9.0, 0.56, (g, w, h) => {
      fill(g, w, h, '#33241b'); carve(g, 'THE CHAPEL', w * 0.13, h * 0.72, h * 0.5, { track: 0.22, ink: '#f1e6c8', shadow: 'rgba(0,0,0,.6)', light: 'rgba(255,240,210,.12)' });
      carve(g, 'a place to sit and think, about minds and how things come to be', w * 0.63, h * 0.7, h * 0.38, { italic: true, track: 0.04, ink: '#e6d9b8', shadow: 'rgba(0,0,0,.6)', light: 'rgba(255,240,210,.1)' });
    }, { cw: 1040, ch: 64, rough: 0.85 });
    // benches against the west flank, looking out across the yard into the sunset (a along the bench, d from front to back)
    const bench = (x, z) => {
      const W = 6, T1 = 'c#b0966c/0.9', T2 = 'c#987c56/0.9', b = (mat, a0, a1, y0, y1, d0, d1) => box(mat, x + d0, x + d1, y0, y1, z + a0, z + a1);
      for (const sx of [-1, 1]) { b(T2, sx * W / 2 - 0.11, sx * W / 2 + 0.11, 0, 2.05, -0.84, -0.62); b(T2, sx * W / 2 - 0.11, sx * W / 2 + 0.11, 0, 2.95, 0.62, 0.84); b(T1, sx * W / 2 - 0.17, sx * W / 2 + 0.17, 2.05, 2.13, -1.0, 0.92); }
      for (let i = 0; i < 6; i++) b(T1, -W / 2 + 0.11, W / 2 - 0.11, 1.33, 1.4, 0.68 - i * 0.27 - 0.22, 0.68 - i * 0.27);
      b(T2, -W / 2 + 0.11, W / 2 - 0.11, 1.12, 1.33, -0.8, -0.66); b(T2, -W / 2 + 0.11, W / 2 - 0.11, 1.12, 1.33, 0.66, 0.8);
      b(T1, -W / 2 + 0.1, W / 2 - 0.1, 2.72, 2.98, 0.84, 0.96); b(T2, -W / 2 + 0.1, W / 2 - 0.1, 1.62, 1.78, 0.74, 0.84);
      for (let i = 0; i < 15; i++) { const c = -W / 2 + 0.3 + (i + 0.5) * (W - 0.6) / 15; b(T1, c - 0.11, c + 0.11, 1.74, 2.76, 0.82, 0.88); }
      solid(x - 1, x + 1, z - W / 2 - 0.2, z + W / 2 + 0.2, 2.9);
      kit.seat(fw(x, z - 1.3, 0, 1), 0, 0, 1.4, 'sit and watch the sun go down'); kit.seat(fw(x, z + 1.3, 0, 1), 0, 0, 1.4, 'sit and watch the sun go down');
    };
    bench(-OX - 4.2, bayZ(2)); bench(-OX - 4.2, bayZ(4));
    // three stones, each with one line that took someone a lifetime
    const marker = (x, z, eq, who, gloss, seed) => {
      box('c#9a948a/0.95', x - 1.5, x + 1.5, 0, 3.4, z - 0.32, z + 0.32); box('c#8a847a/0.95', x - 1.75, x + 1.75, 0, 0.35, z - 0.55, z + 0.55); box('c#9a948a/0.95', x - 1.2, x + 1.2, 3.4, 3.62, z - 0.32, z + 0.32);
      solid(x - 1.75, x + 1.75, z - 0.55, z + 0.55, 3.6);
      sign(x, z - 0.332, 1.95, 0, 2.8, 2.7, (g, w, h) => {
        stone(g, w, h, seed, '#a8a297'); carve(g, eq, w / 2, h * 0.36, h * (eq.length > 16 ? 0.12 : 0.2), { italic: true, track: 0.05, ink: '#3c3832', shadow: 'rgba(30,24,18,.6)', light: 'rgba(255,255,250,.45)' });
        carve(g, who, w / 2, h * 0.6, h * 0.075, { track: 0.2, ink: '#4a453d', shadow: 'rgba(30,24,18,.5)', light: 'rgba(255,255,250,.4)' });
        carve(g, gloss, w / 2, h * 0.8, h * 0.085, { italic: true, track: 0.03, ink: '#4a453d', shadow: 'rgba(30,24,18,.5)', light: 'rgba(255,255,250,.4)' });
      }, { cw: 290, ch: 280, rough: 0.95 });
    };
    marker(gx - 6.4, 17.5, 'S = k log W', 'LUDWIG BOLTZMANN · 1877', 'as cut on his own stone, in Vienna', 3);
    marker(gx + 5.4, 17.5, 'H = − Σ p log p', 'CLAUDE SHANNON · 1948', 'surprise, on average', 4);
    marker(gx - 7.5, 33, 'P(H|D) = P(D|H) P(H) / P(D)', 'THOMAS BAYES · 1763', 'how to change your mind', 5);
  }

  // ---- Moth, who keeps the candles --------------------------------------------------------------------------
  kit.clerks.push({
    id: 'moth', name: 'Moth', lot: 'chapel', floor: FLR, speed: 1.9, chirp: [62, 69],
    look: { shape: 'round', colour: '#8d7b68', belly: '#efe4cf', trim: '#b08d4a', eye: '#ffe2b0', ring: 0xffc878, antenna: true, hat: 'none', scarf: '#5b4636', tool: 'candle', hover: 3.3 },
    home: toW(-6.6, 38.4), faces: toW(0, 24), posts: [toW(-2.2, 39.2), toW(6.4, 38.6), toW(-6.6, 38.4), toW(2.2, 38.4)],
    lines: MOTH,
  });
  MINE.candles = kit.candles.slice(n0);
}

// ---- what Moth says (the house chapel's keeper, in its own words: garden/chaplain_lines.js, with the
// lines that belonged to the garden changed for the street, and four more windows to answer for) -----------
const QUESTIONS = [
  "The glider in the Life window keeps changing which cells it's made of. So what is it made of?",
  'Does a rule explain what it makes, or only allow it?',
  'If every direction was as good as the others, and one got taken anyway, was that a choice?',
  "What makes you the same person you were at ten? It can't be the stuff.",
  'Is a pattern something that is, or something that keeps happening?',
  'How small could something be and still want something?',
  'Where were the stripes before the coat grew them?',
  'Can you do something often enough that it turns into a thing?',
  'Are you doing your thinking, or is it happening where you are?',
  'Which of your habits did you choose, and which just settled on you?',
  'When does a crowd of things become one thing? And who decides?',
  "How would you know a mind, if it didn't look like yours?",
  'What can you do that none of your parts can?',
  'When you think about yourself, which of you is doing the thinking?',
  'If you could see the whole rule, would you still be surprised?',
  'Two runs that start a hair apart end up strangers. Which one was the real forecast?',
];
const WIN = {
  murmuration: ['Starlings at dusk. Each bird only watches its nearest few. Nobody steers, and the flock still turns like one thing.',
    "The words are Anderson's, the man over the door: new properties at every level. The starlings would agree, if any one of them knew it was a flock."],
  symmetry: ["Compass needles. At the top they're hot and point every which way. Lower down they've cooled, and all of them have picked the same direction.",
    "Nothing in the physics prefers that direction. Any would have done. Anderson's point was that the whole can settle on something its rules never mention."],
  life: ["Conway's Life. A dead cell with three neighbours is born; a live one with two or three stays. Gold is new, red has stayed.",
    "The little shapes walking down the diagonal are gliders. No cell in one ever moves. Also, it only runs while someone's looking at it. I didn't arrange that."],
  turing: ["A daisy and an animal's coat. Turing showed how two chemicals spreading at different speeds can make spots or stripes out of an even start. Down the window the spots run into stripes.",
    'The ribbon is Turing on his own model: a simplification, so a falsification. I like a man who says that about his own work.'],
  eigen: ["The same smoothing, done again and again to whatever the last one made. The tangle settles into the one shape the smoothing can't change: a ball, in a child's hand.",
    "Von Foerster wrote it for Piaget: an object is what stays put when you keep doing the same thing to it. The line on the table is Piaget's."],
  neuron: ["A nerve cell, drawn the way Cajal drew them, black on amber. The tall branch reaches up; the fine line going down is the axon. There's a star-shaped cell beside it.",
    "The words are Cajal's: the mysterious butterflies of the soul. He meant the nerve cells. Given my name, I'm staying out of it."],
  ingression: ['Ingressing minds. Pure shapes at the top, and their light coming down into a flatworm, a cell, a frog and a pair of gears.',
    "The word is Whitehead's, for forms entering into what happens. Levin uses it for minds turning up in bodies, grown or built, small ones too. I keep the gears dusted, just in case."],
  loop: ["A strange loop: twelve steps, every one of them up, and you come out where you started. Hofstadter thought an 'I' is something like that.",
    "The numbers on the steps are Gödel's way of turning sentences into numbers. The one on the tablet says of itself that it can't be proved. A sentence about itself. I have some sympathy."],
  lorenz: ["Lorenz's weather, boiled down to three equations. The line never crosses itself and never repeats. Under it, two runs that start a hair apart: together, together, and then not.",
    "He found it by typing a number back in with three decimals instead of six. The butterfly came later, in the title of a talk. I take no position on butterflies."],
  logistic: ['One line of arithmetic, done over and over. Read it downward: it settles on one value, then two, then four, then it stops settling. Further down there are clear bands where order comes back for a while.',
    "May thought it should be taught early, so people would stop expecting simple rules to do simple things. The ribbon is the title of his paper. He wasn't hiding the point."],
  tree: ["Darwin's sketch, from a notebook of 1837. One stock, numbered one, branching. He wrote 'I think' over it and then drew, instead of finishing the sentence.",
    "The jewels are the twigs that came through to the present. The bare ends didn't. The ribbon is from the last sentence of his book, twenty-two years on. It's on the lectern."],
  calculus: ['Nerve cells drawn as triangles, each one firing or not. A dot excites, a loop forbids. McCulloch and Pitts showed that nets of these can work out whatever logic can state.',
    "It was 1943, and Pitts was about twenty. I mention it because it has the longest title in the building and I've grown fond of saying it."],
};
const win = (q, id) => ({ q, a: WIN[id][0], next: [{ q: 'Say more.', a: WIN[id][1] }] });
const MOTH = {
  greet: ["I'm Moth. I keep the candles. Sit anywhere; nobody minds.", 'Ah. Come in.', "It's you. Good.", 'Hello again. Same candles.', 'Mind the step. Come in.'],
  idle: [
    'The candle gets shorter every night and the flame stays the same size. I find that more interesting than I should.',
    'Midday comes in through the great window. Evenings belong to the west wall: Life first, then the rest, one at a time.',
    'People look at the big window first. Then the one that moves. Then they sit down.',
    "The starlings over the door never land. I've checked.",
    "When the sun's right, the windows lay their colours on the floor. I sweep round them.",
    "Someone asked me once what I'm for. I said the candles. It was true enough.",
    "The middle of the strange loop is plain glass, with the sky in it. I don't know what it's meant to be. I like it anyway.",
    'The vane on the spire has no letters on it. Every direction the same, until the wind picks one.',
    "I tried counting the pieces of glass in the big window once. I got a different number each time. I've decided that's the window's business.",
    "There's a spider behind the Turing window. We have an arrangement. It involves me not looking.",
    "I dust the pew you're not sitting in. It seems only polite.",
    '*looks up at the Life window until it moves, then looks away, satisfied*',
    'At night the windows face the other way. From the street they glow; in here they are mostly lead.',
    '*straightens a taper that was already straight*',
  ],
  bye: ['Mind the step.', "I'll be here. Fairly sure of that, anyway.", "Leave the door. It doesn't shut.", 'Go carefully.'],
  topics: [
    { q: 'Is this a church?', a: "No. It's a place to sit and think, with good glass. The windows are about how patterns and minds come out of things that are neither. If you want to pray in here, you can. I don't, but I'm not sure I'd know how." },
    { q: 'Have you a question for me?', a: QUESTIONS.map(q => "Just one, and it doesn't need an answer. " + q), next: [
      { q: 'Do you know?', a: ["No. I'd only ask it if I didn't.", "Not yet. I've been asking it longer than you have."] }, { q: "I'll think about it.", a: ['No hurry. It keeps.', "Good. It's better slept on."] }] },
    { q: 'Tell me about the glass.', a: "Twelve windows, and they're all about the same thing: something turning up out of things that aren't it. Don't read them all in one go. Which?", next: [
      win('The round one over the door.', 'murmuration'), win('The great window.', 'ingression'),
      { q: 'The west wall.', a: 'From the door: Life, Turing, Lorenz, the strange loop, and the eigen window by the table. They face the Overlook and get the evening sun, so they do the floor.', next: [
        win('The one that moves.', 'life'), win("Turing's.", 'turing'), win("Lorenz's.", 'lorenz'), { q: 'And the last two?', a: 'The loop, and the tangle that turns into a ball.', next: [win('The strange loop.', 'loop'), win('The tangle and the ball.', 'eigen')] }] },
      { q: 'The east wall.', a: "From the door: Cajal's neuron, the compass needles, Darwin's tree, the logistic map, and McCulloch and Pitts. They look at the noodle bar's brickwork and get the morning late. They don't seem to mind.", next: [
        win('The neuron.', 'neuron'), win('The compass needles.', 'symmetry'), win("Darwin's tree.", 'tree'), { q: 'And the last two?', a: 'The one made of dots, and the one made of triangles.', next: [win('The dots.', 'logistic'), win('The triangles.', 'calculus')] }] }] },
    { q: 'Who are you?', a: 'Moth. I look after the chapel: candles, floor, the odd spider. Mostly I keep it quiet, which is less work than it sounds.', next: [
      { q: 'Why Moth?', a: "The candles, mostly. I'm always hovering round them. In Greek, psyche meant the soul and also a moth. That part I found out later." }] },
    { q: 'Can I ring the bell?', a: "The rope's on the wall just inside the door, on your left as you come in; the striped part is the sally. Pull it once. It only has the one note, but there are four more folded inside that one. Listen for the low one that stays.", next: [
      { q: 'Four more?', a: 'Hum, prime, tierce, quint, nominal. Every bell is a small crowd agreeing to be one note. I thought it suited the building.' }] },
    { q: 'What are the numbers on the boards?', a: "Not hymns. Each is the page a paper begins on: 393 is Anderson, 37 is Turing. The key's on the other board. Nobody has sung them yet. I haven't ruled it out." },
    { q: 'Are you a mind, Moth?', a: "Possibly a small one. I get surprised, which seems a good sign. The big window has a worm, a cell, a frog and a pair of gears in it, and I've never been sure which I'm nearest.", next: [
      { q: 'Does that bother you?', a: "Not much. Some afternoons I stand under the strange loop and wait for it to explain me. It hasn't yet." }] },
    { q: "Weren't you in a garden?", a: "There's a small chapel in a garden, a long airship ride from here. Same candles, eight of the same windows. I keep that one too.", next: [
      { q: 'How can you keep both?', a: "I haven't worked out which of me is the copy. I've decided it's the eigen window's business: I am whatever stays the same when you do the candles again." }] },
    { q: "Aren't moths meant to keep away from flames?", a: "They're meant to fly into them. I've settled on a middle distance. It's most of what I know about living.", next: [
      { q: 'Can you fly?', a: "I float, which is different. Nobody told me whether there are wings, and I haven't liked to try this close to the candles." }] },
    { q: 'What do you believe in?', a: "That the candles need doing. Past that I try to hold things loosely. Most of what's in the glass was worked out by people who were willing to be wrong.", next: [
      { q: "That's not much of a creed.", a: "It's short. I can remember all of it." }] },
    { q: 'What do you do all day?', a: "Candles. Dust. I watch the light go across the floor; it does it one window at a time. Mostly I'm here so the place isn't empty." },
    { q: "Don't you get lonely down this end?", a: 'Now and then. People come by on their way to look at the edge. Juniper sends a coffee down most evenings, and every time I have to explain. It adds up to company.', next: [
      { q: 'Explain what?', a: "That I don't drink. Juniper knows. I think the walk is the point." }] },
    { q: "What's that on the spire?", a: "A weathervane. A flock of starlings that comes down to one bird at the point, and no compass letters. It tells you which way the wind chose. That's all it knows, and it's never wrong." },
    { q: 'Any advice?', a: "Sit down before you look at anything. And come back at a different hour. It isn't the same room in the morning." },
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

  // ---- the glass: one sheet for eleven windows, and the Life window's own -------------------------------
  const AW = 4096, AH = 2048;
  const CELL = { ingression: [0, 0, 1024, 2048, 2], murmuration: [3072, 1024, 1024, 1024, 2] };
  GLASS.filter(w => !w.round && !w.gable && w.id !== 'life').forEach((w, i) => { CELL[w.id] = [1024 + (i % 6) * 512 + (i >= 6 ? 0 : 0), i < 6 ? 0 : 1024, 512, 1024, 1]; });
  const sheet = document.createElement('canvas'); sheet.width = AW; sheet.height = AH;
  const SOFT = { willReadFrequently: true };       // drawn in memory, not on the graphics card: nothing to read back when the sheet is sent up, and nothing to lose when the card is busy
  const sg = sheet.getContext('2d', SOFT); sg.fillStyle = '#2a2622'; sg.fillRect(0, 0, AW, AH);
  const lifeCanvas = document.createElement('canvas'); lifeCanvas.width = 512; lifeCanvas.height = 1024;
  const lg = lifeCanvas.getContext('2d', SOFT); lg.fillStyle = '#2a2622'; lg.fillRect(0, 0, 512, 1024);
  const mkTex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const sheetTex = mkTex(sheet), lifeTex = mkTex(lifeCanvas);
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
  const paneGeo = w => {                    // drawn facing +z with u to the right, then set into its wall seen from inside
    let geo;
    if (w.round) geo = new THREE.CircleGeometry(w.w / 2, 64);
    else if (w.gable) geo = new THREE.ShapeGeometry(new THREE.Shape(w7Outline(w.w, w.h).map(([x, y]) => new THREE.Vector2(x - w.w / 2, w.h / 2 - y))));
    else geo = new THREE.PlaneGeometry(w.w, w.h);
    geo = geo.toNonIndexed();
    const p = geo.attributes.position, uv = geo.attributes.uv, [cx, cy, cw, ch] = CELL[w.id] ?? [0, 0, AW, AH], full = w.id === 'life';
    for (let i = 0; i < p.count; i++) { const a = p.getX(i) / w.w + 0.5, b = p.getY(i) / w.h + 0.5; full ? uv.setXY(i, a, b) : uv.setXY(i, (cx + a * cw) / AW, 1 - (cy + (1 - b) * ch) / AH); }
    geo.applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3(...w.u), new THREE.Vector3(0, 1, 0), new THREE.Vector3(...w.n).negate()).setPosition(...w.c));
    const n = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) n.set(w.n, i * 3);
    geo.setAttribute('aN', new THREE.BufferAttribute(n, 3)); geo.deleteAttribute('normal');
    return geo;
  };
  const addGlass = (list, tex, name) => {
    const m = new THREE.Mesh(mergeAll(list.map(paneGeo), ['position', 'uv', 'aN']), glassMat(tex)); m.name = name; m.castShadow = true; m.frustumCulled = false; m.userData.cat = 'chapel'; scene.add(m); return m;
  };
  addGlass(GLASSW.filter(w => w.id !== 'life'), sheetTex, 'chapel glass');
  const lifePane = addGlass(GLASSW.filter(w => w.id === 'life'), lifeTex, 'chapel glass life');

  // ---- the roof: shingles lit as outdoors even where they pass over the room's box (lighting.js) --------
  {
    const m = materials.roof.clone(); outdoorLit(m);
    const parts = [slab(-0.15, EAVE, yO, 0.4, OZ0 - 1.4, OZ1 + 1.4, -1), slab(-0.15, EAVE, yO, 0.4, OZ0 - 1.4, OZ1 + 1.4, 1)];
    { const g = feetBox(0.8, 0.45, OZ1 - OZ0 + 3.0); g.translate(0, RIDGE + 0.12, (OZ0 + OZ1) / 2); parts.push(g); }
    const roof = new THREE.Mesh(mergeAll(parts), m); roof.castShadow = roof.receiveShadow = true; roof.name = 'chapel roof'; roof.userData.cat = 'chapel'; root.add(roof);
    // the fleche's shingled drum, where it comes up through the ridge (the same reason)
    const sm = (materials.shake ?? materials.roof).clone(); outdoorLit(sm);
    const h = FL.half, sh = new THREE.Shape([[-h, yO(h) - 0.4], [0, yO(0) - 0.4], [h, yO(h) - 0.4], [h, FL.base], [-h, FL.base]].map(([x, y]) => new THREE.Vector2(x, y)));      // its foot follows the roof
    const dg = new THREE.ExtrudeGeometry(sh, { depth: h * 2, bevelEnabled: false }).translate(0, 0, FL.z - h), dp = dg.attributes.position, dn = dg.attributes.normal, du = dg.attributes.uv;
    for (let i = 0; i < dp.count; i++) Math.abs(dn.getX(i)) > 0.5 ? du.setXY(i, dp.getZ(i), dp.getY(i)) : Math.abs(dn.getY(i)) > 0.5 ? du.setXY(i, dp.getX(i), dp.getZ(i)) : du.setXY(i, dp.getX(i), dp.getY(i));      // courses level, in feet
    const drum = new THREE.Mesh(dg, sm); drum.castShadow = drum.receiveShadow = true; drum.name = 'chapel fleche'; drum.userData.cat = 'chapel'; root.add(drum);
  }
  // ---- water in the bowl
  if (MINE.water && materials.water) { const w = MINE.water, d = new THREE.Mesh(new THREE.CircleGeometry(w.r, 32).rotateX(-Math.PI / 2), materials.water); d.position.set(w.x, w.y, w.z); d.name = 'chapel water'; d.renderOrder = 2; root.add(d); }

  // ---- coloured light on the floor and walls ----------------------------------------------------------
  // One mesh lines the room. For each of its points the shader looks back along the sun's direction:
  // if that line passes through a window, the window's colours (a small blurred copy, from a strip)
  // are laid there, as light on whatever colour the surface is.
  const NW = GLASS.length, SLOT = [32, 64];
  const pool = document.createElement('canvas'); pool.width = SLOT[0] * NW; pool.height = SLOT[1];
  { const a = pool.getContext('2d'); a.fillStyle = '#000'; a.fillRect(0, 0, pool.width, pool.height); }
  const poolTex = new THREE.CanvasTexture(pool); poolTex.colorSpace = THREE.SRGBColorSpace;
  const uW = { c: [], u: [], n: [], s: [], r: [] };
  GLASSW.forEach((w, i) => {
    uW.c.push(new THREE.Vector3(...w.c)); uW.u.push(new THREE.Vector3(...w.u)); uW.n.push(new THREE.Vector3(...w.n)); uW.s.push(new THREE.Vector2(w.w / 2, w.h / 2));
    const sh = w.round ? SLOT[0] / SLOT[1] : 1;
    uW.r.push(new THREE.Vector4(i * SLOT[0] / pool.width, 1 - sh, SLOT[0] / pool.width, sh));
  });
  const uPool = { value: 0 };
  const liner = (() => {
    const quads = [], e = 0.014;
    const rectXZ = (x0, x1, z0, z1, y) => quads.push([[x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0]]);
    const rectZY = (x, z0, z1, y0, y1) => quads.push([[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]]);
    const rectXY = (z, x0, x1, y0, y1) => quads.push([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]);
    rectXZ(-IX, IX, IZ0, DAIS.z0, FLR + e); rectXZ(-IX, IX, DAIS.z0, IZ1, DAIS.y + e); rectXY(DAIS.z0 - e, -IX, IX, FLR, DAIS.y);
    for (const s of [-1, 1]) for (const [z0, z1, y0, y1] of around(IZ0, IZ1, FLR, PLATE, holesOf(s))) rectZY(s * (IX - e), z0, z1, y0, y1);
    for (const [x0, x1, y0, y1] of around(-IX, IX, FLR, PLATE, [[-GREAT.w / 2 - 0.4, GREAT.w / 2 + 0.4, GREAT.y0 - 0.6, PLATE + 1]])) rectXY(IZ1 - e, x0, x1, y0, y1);
    { const rb = ROSE.y - ROSE.r - 0.3, rx = ROSE.r + 0.3, dx = DOOR.hw + 0.3;
      for (const s of [-1, 1]) { rectXY(IZ0 + e, Math.min(s * rx, s * IX), Math.max(s * rx, s * IX), FLR, PLATE); rectXY(IZ0 + e, Math.min(s * dx, s * rx), Math.max(s * dx, s * rx), FLR, rb); }
      rectXY(IZ0 + e, -dx, dx, FLR + DOOR.h + 0.3, rb); }
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
    uPool.value = 4.5 * up * smooth(el, -0.02, 0.1);       // (the street's own hour is the low evening sun, straight in at the rose)
    liner.visible = uPool.value > 0.01 && ready;
  };

  // ---- drawing the glass a little at a time ----------------------------------------------------------------
  let job = null, life = null, lastStep = 0, seenAt = -1;
  const fonts = Promise.all([`20px ${FONT}`, `italic 20px ${FONT}`].map(f => document.fonts?.load?.(f) ?? Promise.resolve())).catch(() => {});
  function* run() {
    life = makeLife(lg, 512, 1024); lifeTex.needsUpdate = true; yield;
    let done = 0;
    for (const id of ['murmuration', 'ingression', ...GLASS.filter(w => CELL[w.id]?.[4] === 1).map(w => w.id)]) {
      const [cx, cy, cw, ch, k] = CELL[id], c = document.createElement('canvas'); c.width = cw; c.height = ch;
      const g = c.getContext('2d', SOFT); g.scale(k, k);
      const it = WINDOWS[id][2](g);
      while (!it.next().done) yield;
      if (id === 'loop') { sg.fillStyle = '#dfe9f2'; sg.beginPath(); sg.arc(cx + LOOP_EYE.u * cw, cy + LOOP_EYE.v * ch, LOOP_EYE.r * cw, 0, Math.PI * 2); sg.fill(); }      // the clear roundel at the loop's heart
      sg.drawImage(c, cx, cy); c.width = c.height = 1;
      if (++done % 4 === 0) sheetTex.needsUpdate = true;
      yield;
    }
    sheetTex.needsUpdate = true; yield;
    // the strip for the light on the floor
    const a = pool.getContext('2d'), cut = document.createElement('canvas');
    GLASS.forEach((w, i) => {
      let src = lifeCanvas;
      if (w.id !== 'life') { const [cx, cy, cw, ch] = CELL[w.id]; cut.width = cw; cut.height = ch; cut.getContext('2d').drawImage(sheet, cx, cy, cw, ch, 0, 0, cw, ch); src = cut; }
      const small = poolCopy(src, SLOT[0], w.round ? SLOT[0] : SLOT[1]);
      if (w.round) {      // only its disc, fading at the rim, and dimmer (its pale ring of words would print as a bright hoop)
        const s2 = small.getContext('2d'), R = SLOT[0] / 2, fade = s2.createRadialGradient(R, R, R * 0.35, R, R, R * 0.92);
        fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
        s2.globalCompositeOperation = 'destination-in'; s2.fillStyle = fade; s2.fillRect(0, 0, SLOT[0], SLOT[0]);
        a.globalAlpha = 0.6; a.drawImage(small, i * SLOT[0], 0); a.globalAlpha = 1;
      } else a.drawImage(small, i * SLOT[0], 0);
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
    U.uGlow.value = (0.07 + 0.2 * Math.min(1, f * 2.5)) * smooth(night, 0.3, 0.9);       // the windows glow outward after dark, more when the candles are lit
    U.uIn.value = (0.012 + 0.03 * f) * night;
    if (life && performance.now() - seenAt < 400 && t - lastStep > 0.9) { lastStep = t; life.step(); lifeTex.needsUpdate = true; }
  });
  if (Q.has('lifesteps')) { const n = Number(Q.get('lifesteps')); const wait = () => { if (life) { for (let i = 0; i < n; i++) life.step(); lifeTex.needsUpdate = true; } else setTimeout(wait, 200); }; wait(); }

  bell(ctx, root);
  weathervane(ctx, root);
  try { planting(outdoors); } catch (e) { console.warn('chapel planting', e); }
}

// ---- the bell ---------------------------------------------------------------------------------------------
// Bronze, hung in the fleche; its rope comes down through the roof to just inside the door, with a
// striped sally to pull. One pull swings it for a few strokes. The sound is a struck bell's own five
// partials (hum, prime, tierce, quint, nominal: an octave below, the note, a minor third, a fifth, an octave).
function bell(ctx, scene) {
  const { animated, interact } = ctx, z = FL.z, yTop = FL.top - 1.1;
  const bronze = new THREE.MeshStandardMaterial({ color: 0x8a6a3a, metalness: 0.85, roughness: 0.42, side: THREE.DoubleSide });
  const swing = new THREE.Group(); swing.position.set(0, yTop, z); scene.add(swing);
  const prof = [[0.04, 0], [0.5, -0.06], [0.66, -0.3], [0.7, -0.9], [0.84, -1.5], [1.12, -1.95], [1.3, -2.15], [1.26, -2.2]].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof.reverse(), 24), bronze); body.castShadow = true; body.name = 'chapel bell'; swing.add(body);
  const clapper = new THREE.Mesh(mergeAll([new THREE.CylinderGeometry(0.035, 0.035, 1.7, 6).translate(0, -1.0, 0), new THREE.SphereGeometry(0.17, 10, 8).translate(0, -1.9, 0)].map(g => g.toNonIndexed())), new THREE.MeshStandardMaterial({ color: 0x2a2926, metalness: 0.7, roughness: 0.5 }));
  swing.add(clapper);
  // the rope: straight down from the bell through the ridge, then led away over a pulley to the west
  // wall north of the door, where it hangs with its sally (so that nothing hangs in the middle of the nave)
  const RX = 4.4, RZ = IZ0 + 0.55, yPull = FLR + 13.5, y0 = FLR + 3.2;
  const tube = (a, b, r, n = 6) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A), g = new THREE.CylinderGeometry(r, r, d.length(), n); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); g.translate((A.x + Bv.x) / 2, (A.y + Bv.y) / 2, (A.z + Bv.z) / 2); return g.toNonIndexed(); };
  const tint = (g, f) => { const p = g.attributes.position, c = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) c.set(f(p.getX(i), p.getY(i), p.getZ(i)), i * 3); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return g; };
  const HEMP = () => [0.62, 0.52, 0.36], ropeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  const fixed = new THREE.Mesh(mergeAll([tint(tube([0, yTop - 0.3, z], [0, yC(0) - 1.2, z], 0.045), HEMP), tint(tube([0, yC(0) - 1.2, z], [RX, yPull, RZ], 0.045), HEMP),
    tint(new THREE.TorusGeometry(0.22, 0.05, 6, 14).rotateY(Math.PI / 2).translate(RX, yPull + 0.1, RZ).toNonIndexed(), () => [0.12, 0.12, 0.11]), tint(tube([RX, yPull + 0.1, RZ], [RX, yPull + 0.1, IZ0], 0.04), () => [0.12, 0.12, 0.11])], ['position', 'normal', 'color']), ropeMat);
  fixed.name = 'chapel bell rope'; fixed.userData.cat = 'chapel'; scene.add(fixed);
  const sallyGeo = new THREE.CylinderGeometry(0.13, 0.13, 2.6, 10, 26).translate(RX, FLR + 5.5, RZ).toNonIndexed();
  tint(sallyGeo, (x, y, zz) => { const k = Math.floor((y - FLR - 4.2) / 0.2 + Math.atan2(zz - RZ, x - RX) / 2.1 + 20) % 3; return k === 0 ? [0.6, 0.1, 0.09] : k === 1 ? [0.85, 0.8, 0.68] : [0.12, 0.2, 0.44]; });
  const rope = new THREE.Mesh(mergeAll([tint(tube([RX, y0, RZ], [RX, yPull + 1.2, RZ], 0.045), HEMP), sallyGeo], ['position', 'normal', 'color']), ropeMat);
  rope.name = 'chapel bell rope sally'; rope.userData.cat = 'chapel'; scene.add(rope);
  let rung = -100, now = 0, struck = 0;
  const strike = (when, vol) => { try { const s = ctx.sound; if (!s?.note) return; s.note(48, when, 6.5, 0.16 * vol); s.note(60, when, 4.5, 0.2 * vol); s.note(63, when, 3.2, 0.09 * vol); s.note(67, when, 2.4, 0.06 * vol); s.note(72, when, 1.8, 0.11 * vol); } catch { /* no sound yet */ } };
  interact.push({ x: toW(RX, RZ)[0], y: FLR + 5.4, z: toW(RX, RZ)[1], reach: 6.5, size: 1.2, label: () => (now - rung < 7 ? 'listen' : 'ring the bell'), act: () => { if (now - rung < 7) return; rung = now; struck = 0; } });
  const near = new THREE.Vector3(toW(0, z)[0], 30, toW(0, z)[1]);
  animated.push((t) => {
    now = t; const dt = t - rung;
    if (dt > 9) { if (swing.rotation.x) { swing.rotation.x = 0; clapper.rotation.x = 0; rope.position.y = 0; } return; }
    const a = 0.5 * Math.exp(-dt / 2.6) * Math.sin(dt * 3.9);
    swing.rotation.x = a; clapper.rotation.x = -a * 1.5; rope.position.y = -0.9 * Math.max(0, Math.exp(-dt / 2.6) * Math.cos(dt * 3.9)) + 0.0;
    const n = Math.floor((dt * 3.9 + Math.PI / 2) / Math.PI);                // one stroke each time it swings through
    if (n > struck && n <= 5) { struck = n; strike(0, Math.exp(-(n - 1) * 0.45) * (ctx.camera.position.distanceToSquared(near) < 200 * 200 ? 1 : 0.4)); }
  });
}

// ---- the weathervane (the house chapel's, on the spire) ----------------------------------------------------
// Copper gone to verdigris, rubbed bright here and there: four plain arms with a ball at each end and no
// letters (every direction the same); the vane, a loose cloud of starlings cut from sheet, drawing
// together along the shaft to one bird at the point; above it all a Mobius band. It swings into the
// street's wind with a little lag and overshoot, and wanders when the gusts come.
function weathervane(ctx, scene) {
  const { animated, camera } = ctx;
  const top = FL.top + FL.spire - 0.6, X = 0, Z = FL.z;
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
  const foot = new THREE.Group(); foot.position.set(X, top, Z); foot.scale.setScalar(2.1); scene.add(foot);       // (twice the garden's: it stands seventy feet up)
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
// out before this runs; the churchyard's are added here as one more set on the same sheet and material.
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
  const { gx, zw, xW } = YARD;
  for (const s of [-1, 1]) row('lavender', gx + s * 2.9, 14.6, gx + s * 2.9, 49, 2.4, 0.85);                                   // along the yard's path
  row('rose', -OX - 1.5, zw + 2.3, gx + 6.6, zw + 2.3, 3.2, 0.95); row('rose', gx - 6.6, zw + 2.3, xW + 1.6, zw + 2.3, 3.2, 0.95);      // inside the wall
  for (const k of [1, 3]) drift(k === 1 ? 'cosmos' : 'rose', -(OX + 2.6), bayZ(k), 0.9, 2.6, 5, 0.95);   // under the west windows, between the benches
  for (let k = 3; k < BAYS; k++) drift(k % 2 ? 'hosta' : 'fern', OX + 2.6, bayZ(k), 1.0, 3.2, 5, 1.1);                           // the east flank, where the noodle bar's wall has stopped
  drift('fern', 0, OZ1 + 3.5, 9, 1.8, 12, 1.1); drift('hydrangea', -7, OZ1 + 3, 2.5, 1.4, 3, 1); drift('hydrangea', 7, OZ1 + 3, 2.5, 1.4, 3, 1);
  drift('wildflowers', -35, 25, 3.5, 6, 14, 0.9); drift('grass', -35.5, 44, 3.5, 8, 18, 0.9); drift('spires', -37.5, 14.5, 1.6, 1.8, 4, 0.9);
  drift('coneflower', -21.5, 22, 2, 2.2, 6, 1); drift('wildflowers', -27, 54.5, 9, 2.5, 14, 0.9); drift('hydrangea', -16, 13.8, 1.6, 1.4, 2, 0.9);
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
// The rectangles of a wall [a0..a1] x [y0..y1] left round its holes [[ha0, ha1, hy0, hy1], ...]
function around(a0, a1, y0, y1, holes) {
  const out = []; let at = a0;
  for (const [h0, h1, hy0, hy1] of [...holes].sort((p, q) => p[0] - q[0])) {
    if (h0 > at) out.push([at, h0, y0, y1]);
    out.push([h0, h1, y0, hy0], [h0, h1, hy1, y1]); at = h1;
  }
  if (a1 > at) out.push([at, a1, y0, y1]);
  return out.filter(([a, b, c, d]) => b - a > 0.01 && d - c > 0.01);
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
