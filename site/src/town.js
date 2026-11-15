// The town: one main street on an island in the sky, running east to west so the sun
// goes down at the end of it. Ten lots, five a side. Six of them are shops you can walk
// into; the other four are closed for the evening with their windows lit.
//
// Units are feet. Plan coordinates: X is world x (north is +X), Y runs west along the street
// (world z = -Y), so walking toward +Y is walking into the sunset. The street's centre line is
// X = 0; kerbs at X = ±ROAD, shop fronts at X = ±FRONT.
//
// Each lot is described in its own coordinates so a shop file never needs to know which side
// of the street it is on:   a  along the frontage, left to right as you face the shop from the street
//                           d  depth into the shop from the inside of the front wall
//                           h  height above the shop floor
// lot.fr(kit, a, d, h, face) gives a kit frame there. face says which way the piece faces:
// 'back' (into the shop, for things on the front wall), 'street' (toward the street, for things on
// the back wall), 'right' (toward larger a, for things on the left wall), 'left'.

import { wx, wz } from './builder.js';
import { chapelShell } from './chapel.js';

export const ROAD = 11, FRONT = 24, CURB = 0.5;
export const FL = 0.55;                 // shop floors, a hair above the pavement
export const CEIL = FL + 12;            // every shop's ceiling
export const SHOPTOP = 14.6;            // top of the shopfront cornice, where the upper wall begins
export const F1 = FL, F2 = FL + 14;     // names the furnishing kit expects
export const STREET = { y0: -58, y1: 232, lotsFrom: -8, lotsTo: 191 };
// The chapel stands beyond the Landing, closing the east end of the street (chapel.js builds it here):
// centred on the street's line, its west door at y1, running back east to y0.
export const CHAPEL_SITE = { x: 0, y1: -74, y0: -150, halfW: 19,
  // where it is to stand instead: the last plot on the south side, beside the Overlook, its door on the street
  street: { side: -1, y0: 160, y1: 198, front: FRONT } };
const WALL = 0.8, SIDE = 0.5;

// Each building is a real one (research/BRIEF.md). The north side is the Mulberry Street Block, 301 to 315 Mulberry
// Street, Madison, Indiana, as measured for the Historic American Buildings Survey in 1971 (HABS IN-83): eight brick
// row buildings of the 1820s to 1840s, at their true widths and in their true order, with Pickle Alley let in between
// 309 and 311. The south side is three fronts of South Main Street, Block 43, South Norwalk, Connecticut (HABS CT-349,
// measured 1977): the cast-iron Rogers & Stevens Building of 1875 (no. 24), its arched brick neighbour (22), and two
// shopfronts of the long three-storey front beside them (23), either side of the Yard.
//
// src: the real building;  face: the upper wall;  paint: the shopfront;  trim: sills, lintels, cornice
// up: storeys over the shop;  bays: windows across;  head: 'arch' | 'hood' | 'lintel' (how the upper windows are finished)
// cornice: 'bracket' (pressed metal or wood, on brackets) | 'dentil' (corbelled brick);  roof: 'ridge' | 'flat'
// piers: 'stone' | 'iron' | 'brick' | 'coursed' | 'plaster' (what carries the shopfront);  dh: feet taller or lower than the rule
// inside: plaster tint;  floor: floor material;  bd: where the yard door is, as a fraction of the way along the back wall
const MADISON = 'Mulberry Street Block, Madison, Indiana (HABS IN-83)', NORWALK = 'South Main Street, Block 43, South Norwalk, Connecticut (HABS CT-349)';
export const LOTS = [
  // ---- north side: Mulberry Street, Madison, 301 to 315 ----------------------------------------------
  { id: 'coffee', bd: 0.2, name: 'Slow Hand Coffee', side: 1, y0: 3.8, y1: 27.8, depth: 44, door: 0.5, enter: true, src: '301 ' + MADISON, up: 2, bays: 4, head: 'arch', cornice: 'bracket', roof: 'ridge', piers: 'stone',
    face: 'brick#b98f7c', paint: 'painted_wood#2f4a40', trim: 'c#e6dcc6/0.7', inside: 'plaster#f0e8d6', floor: 'floor', awning: ['c#2f4a40/0.9', 'c#e9e0cc/0.9'] },
  { id: 'yoga', bd: 0.72, name: 'Low Sun Yoga', side: 1, y0: 27.8, y1: 48.05, depth: 44, door: 0.5, enter: true, src: '303 ' + MADISON, up: 2, bays: 3, head: 'hood', cornice: 'bracket', roof: 'ridge', piers: 'plaster',
    face: 'brick#c4a08c', paint: 'painted_wood#c98a6a', trim: 'c#f1ebdd/0.7', inside: 'plaster#f3ece0', floor: 'floor' },
  { id: 'books', bd: 0.26, name: 'Marginalia', side: 1, y0: 48.05, y1: 68.8, depth: 44, door: 0.26, enter: true, src: '305 ' + MADISON, up: 2, bays: 3, head: 'lintel', cornice: 'dentil', roof: 'ridge', piers: 'stone',
    face: 'brick#a87c68', paint: 'painted_wood#7a2f2a', trim: 'c#e3dccb/0.8', inside: 'plaster#e9dcc2', floor: 'floor' },
  { id: 'bikes', bd: 0.2, name: 'Spoke & Sprocket', side: 1, y0: 68.8, y1: 88.47, depth: 44, door: 0.74, enter: true, src: '307 ' + MADISON, up: 2, bays: 3, head: 'lintel', cornice: 'dentil', roof: 'ridge', piers: 'coursed',
    face: 'brick#b08672', paint: 'painted_wood#d4a02a', trim: 'c#d9d2c2/0.8', inside: 'plaster#e6e2d6', floor: 'floor' },
  { id: 'cinema', name: 'The Lantern', side: 1, y0: 88.47, y1: 112, depth: 10, show: 6, door: 0.5, enter: false, src: '309 ' + MADISON, up: 2, bays: 4, head: 'lintel', cornice: 'dentil', roof: 'flat', piers: 'iron',
    face: 'brick#9c7260', paint: 'painted_wood#1f2c3a', trim: 'c#c9a45c/0.4/1', inside: 'plaster#7a2f2f', floor: 'tile_hex' },
  // (112 to 120: Pickle Alley)
  { id: 'grocery', bd: 0.68, name: 'Salt & Larder', side: 1, y0: 120, y1: 140.75, depth: 44, door: 0.5, enter: true, src: '311 ' + MADISON, up: 2, dh: -1.6, bays: 3, head: 'lintel', cornice: 'bracket', roof: 'flat', piers: 'iron',
    face: 'brick#a8806c', paint: 'painted_wood#e8dfc8', trim: 'c#ddd5c4/0.7', inside: 'tile_subway', floor: 'tile_hex', awning: ['c#b8452e/0.9', 'c#efe6d2/0.9'] },
  { id: 'apothecary', bd: 0.1594, name: 'Wick & Sundry', side: 1, y0: 140.75, y1: 160.83, depth: 44, door: 0.5, enter: true, src: '313 ' + MADISON, up: 2, dh: 1.6, bays: 4, head: 'lintel', cornice: 'dentil', roof: 'ridge', piers: 'brick',
    face: 'brick#94685a', paint: 'painted_wood#34405a', trim: 'c#e3dccb/0.8', inside: 'plaster#e4dfd2', floor: 'floor' },
  { id: 'plants', bd: 0.22, name: 'Frond', side: 1, y0: 160.83, y1: 181.5, depth: 44, door: 0.72, enter: true, src: '315 ' + MADISON, up: 1, bays: 4, head: 'lintel', cornice: 'bracket', roof: 'flat', piers: 'iron',
    face: 'brick#b08a78', paint: 'painted_wood#d9d2bf', trim: 'c#efe7d6/0.7', inside: 'plaster#ece6d6', floor: 'pavers' },
  // ---- south side: South Main Street, South Norwalk, Block 43 ------------------------------------------
  { id: 'records', bd: 0.22, name: 'Low Tide Records', side: -1, y0: 1, y1: 31, depth: 44, door: 0.3, enter: true, src: 'no. 24, the Rogers & Stevens Building of 1875, ' + NORWALK, up: 3, bays: 4, head: 'arch', cornice: 'bracket', roof: 'flat', piers: 'iron',
    face: 'plaster#d6cdb9', paint: 'painted_wood#1d1d1f', trim: 'c#e9e2d0/0.6', inside: 'plaster#e6dccb', floor: 'floor' },
  { id: 'museum', bd: 0.76, name: 'The Museum of Small Wonders', side: -1, y0: 31, y1: 61, depth: 44, door: 0.5, enter: true, src: 'no. 22, ' + NORWALK, up: 2, bays: 3, head: 'arch', cornice: 'dentil', roof: 'flat', piers: 'brick',
    face: 'brick#a08474', paint: 'painted_wood#3a4a44', trim: 'c#e8dfcc/0.7', inside: 'plaster#ece6da', floor: 'floor' },
  { id: 'bakery', bd: 0.24, name: 'Tomorrow Bread', side: -1, y0: 61, y1: 78, depth: 44, door: 0.72, enter: true, src: 'no. 23 (the 17 ft shopfront), ' + NORWALK, up: 2, bays: 2, head: 'hood', cornice: 'bracket', roof: 'flat', piers: 'brick',
    face: 'brick#b4907e', paint: 'painted_wood#d8b7a6', trim: 'c#f1ebdd/0.7', inside: 'plaster#efe6d4', floor: 'tile_hex', awning: ['c#d59a8a/0.9', 'c#f3ecdd/0.9'] },
  // (78 to 118: the Yard, with the dumpling cart)
  { id: 'noodles', bd: 0.74, name: 'Night Noodle', side: -1, y0: 118, y1: 138, depth: 44, door: 0.28, enter: true, src: 'no. 23 (the 20 ft shopfront), ' + NORWALK, up: 2, bays: 3, head: 'hood', cornice: 'bracket', roof: 'flat', piers: 'brick',
    face: 'brick#7d5a50', paint: 'painted_wood#2a2320', trim: 'c#d9cdb8/0.7', inside: 'plaster#c9a070', floor: 'tile' },
  // (138 to 160: a green; 160 to 198: the chapel, its own building: chapel.js)
];

export function buildTown(B) {
  const surfaces = [], rooms = [], lamps = [], doors = [], windows = [], portals = [], boxes = [], upWindows = [], footprints = [];
  const G = { grain: 'long' };

  // ---- the ground you can stand on ----------------------------------------------------------
  // (the island's top is at 0; the pavements are a kerb higher)
  const pave = (X0, X1, Y0, Y1) => surfaces.push({ x0: wx(X0), x1: wx(X1), z0: wz(Y1), z1: wz(Y0), h: CURB });
  for (const s of [-1, 1]) pave(Math.min(s * ROAD, s * FRONT), Math.max(s * ROAD, s * FRONT), STREET.y0, STREET.y1);

  for (const lot of LOTS) {
    const s = lot.side, { y0, y1 } = lot, depth = lot.depth, back = FRONT + depth;
    const top = SHOPTOP + lot.up * 11.5 + (lot.dh ?? 0);              // the eaves (or the flat roof)
    // the building next door on this side at v (y0 or y1), if any, and whether it is the same height (and roof) as this one
    const topOf = o => SHOPTOP + o.up * 11.5 + (o.dh ?? 0), nbr = v => LOTS.find(o => o !== lot && o.side === s && (Math.abs(o.y1 - v) < 0.01 || Math.abs(o.y0 - v) < 0.01));
    const level = v => { const o = nbr(v); return !!o && Math.abs(topOf(o) - top) < 0.01; }, levelRidge = v => level(v) && nbr(v).roof === lot.roof && nbr(v).depth === lot.depth;
    const INT = lot.inside, EXT = lot.face, PAINT = lot.paint, TRIM = lot.trim;
    // Everything below is given as (u, v): u out from the centre line, v along the street.
    const L = (mat, u0, u1, v0, v1, h0, h1, o) => { if (Math.abs(u1 - u0) > 0.004 && Math.abs(v1 - v0) > 0.004 && h1 - h0 > 0.004) B.pbox(mat, s * u0, s * u1, v0, v1, h0, h1, o); };
    const C = { collide: true };
    footprints.push({ x0: Math.min(s * FRONT, s * back) - 0.1, x1: Math.max(s * FRONT, s * back) + 0.1, z0: wz(y1) - 0.1, z1: wz(y0) + 0.1 });

    // -- the box: side walls, back wall, floor, ceiling, roof ---------------------------------
    // inside faces, front and back (a closed shop is only its window: a few feet of display, then a wall)
    const ui = FRONT + WALL, ub = lot.enter ? back - SIDE : Math.min(back - SIDE, FRONT + WALL + (lot.show ?? 6));
    for (const [v, sg] of [[y0, 1], [y1, -1]]) {                       // side walls: brick outside, plaster within
      L(EXT.startsWith('brick') ? EXT : 'brick#8a6a5c', FRONT + WALL / 2, back - SIDE / 2, v, v + sg * SIDE / 2, 0, top, C);      // between the front wall and the back wall, sharing no face with either
      L(INT, ui, ub, v + sg * SIDE / 2, v + sg * SIDE, FL, CEIL);
      L('brick#8a6a5c', FRONT + WALL / 2, back - SIDE / 2, v + sg * SIDE / 2, v + sg * SIDE, CEIL, top);
    }
    // the back wall, with the yard door cut through it where the building has one (bd): 3.1 wide, 0.5 to 7.5
    const BW = 3.1, BH0 = 0.5, BH1 = 7.5, bv = lot.bd !== undefined && lot.enter ? y0 + lot.bd * (y1 - y0) : null;
    if (bv === null) { L('brick#8a6a5c', back - SIDE / 2, back, y0, y1, 0, top, C); L(INT, ub, lot.enter ? back - SIDE / 2 : ub + 0.3, y0 + SIDE, y1 - SIDE, FL, CEIL); }
    else {
      const v0 = bv - BW / 2, v1 = bv + BW / 2, c = s * (back - 0.3);
      for (const [va, vb, ha, hb] of [[y0, v0, 0, top], [v1, y1, 0, top], [v0, v1, BH1, top], [v0, v1, 0, BH0]]) L('brick#8a6a5c', back - SIDE / 2, back, va, vb, ha, hb);
      for (const [va, vb, ha, hb] of [[y0 + SIDE, v0, FL, CEIL], [v1, y1 - SIDE, FL, CEIL], [v0, v1, BH1, CEIL]]) L(INT, ub, back - SIDE / 2, va, vb, ha, hb);
      B.block(Math.min(s * ub, s * back), Math.max(s * ub, s * back), y0, v0, 0, top); B.block(Math.min(s * ub, s * back), Math.max(s * ub, s * back), v1, y1, 0, top); B.block(Math.min(s * ub, s * back), Math.max(s * ub, s * back), v0, v1, BH1, top);
      L('painted_wood#3a342e', ub - 0.02, back, v0, v0 + 0.07, BH0, BH1, G); L('painted_wood#3a342e', ub - 0.02, back, v1 - 0.07, v1, BH0, BH1, G); L('painted_wood#3a342e', ub - 0.02, back, v0 + 0.07, v1 - 0.07, BH1 - 0.07, BH1, G);      // the lining of the opening
      L('flagstone', ub - 0.02, back + 0.02, v0 + 0.07, v1 - 0.07, FL - 0.5, FL + 0.012);                          // the threshold stone
      surfaces.push({ x0: Math.min(s * ub, s * (back + 0.05)), x1: Math.max(s * ub, s * (back + 0.05)), z0: wz(v1), z1: wz(v0), h: FL });
      const stop = { x0: c - 0.12, x1: c + 0.12, z0: wz(v1 - 0.07), z1: wz(v0 + 0.07), y0: FL, y1: BH1 };
      B.colliders.push(stop);
      doors.push({ x: wx(c), z: wz(v0 + 0.09), closed: Math.PI / 2, open: Math.PI / 2 - s * 1.6, w: BW - 0.18, y0: FL + 0.03, y1: BH1 - 0.09, stop, cx: c, cz: (stop.z0 + stop.z1) / 2, exterior: true, lot: lot.id, back: true });      // it swings out into the yard
      portals.push({ x0: Math.min(s * ub, s * back), x1: Math.max(s * ub, s * back), y0: FL, y1: BH1, z0: wz(v1), z1: wz(v0), n: 'x', kind: 'door' });
      lot.backDoorV = bv;
    }
    L(lot.floor, ui - 0.3, ub, y0 + SIDE, y1 - SIDE, FL - 0.5, FL, lot.floor === 'floor' ? { swap: s > 0 } : undefined);
    L('ceil', ui, ub, y0 + SIDE, y1 - SIDE, CEIL, CEIL + 0.4);
    L('roof', FRONT + 0.4, back - 0.3, y0 + 0.3, y1 - 0.3, top - 1.6, top - 1.2);
    if (lot.roof === 'ridge') {
      // A ridge roof running with the street, as these Madison buildings have: one slope to the street and one to the
      // yard, between party walls that stand a little proud of it.
      const run = Math.min(15, depth / 2), rise = run * 0.62, ang = Math.atan2(rise, run), len = Math.hypot(run, rise);
      for (const [uc, sgn] of [[FRONT + run / 2, 1], [FRONT + run * 1.5, -1]]) {
        B.wbox('roof', s * uc - len / 2 - 0.3, s * uc + len / 2 + 0.3, top + rise / 2 - 0.12, top + rise / 2 + 0.12, wz(y1 - 0.5), wz(y0 + 0.5), { rot: [0, 0, s * sgn * ang] });
        // (the coping stands a hair proud of the party wall either side, as copings do: flush, its faces shared the planes of the
        // wall, the parapet and the next building's wall, and flickered against them; one slope's a hair more than the other's)
        // (where the next building is the same, the two copings meet face to face at the party line instead, as one)
        const pr = sgn > 0 ? 0.02 : 0.035, p0 = levelRidge(y0) ? 0 : pr, p1 = levelRidge(y1) ? 0 : pr;
        B.wbox('brick#8a6a5c', s * uc - len / 2 - 0.4, s * uc + len / 2 + 0.4, top + rise / 2 - 0.5, top + rise / 2 + 0.75, wz(y0 + 0.5 + pr), wz(y0 - p0), { rot: [0, 0, s * sgn * ang] });
        B.wbox('brick#8a6a5c', s * uc - len / 2 - 0.4, s * uc + len / 2 + 0.4, top + rise / 2 - 0.5, top + rise / 2 + 0.75, wz(y1 + p1), wz(y1 - 0.5 - pr), { rot: [0, 0, s * sgn * ang] });
      }
      for (const v of [y0, y1 - 0.5]) L('brick#8a6a5c', FRONT + WALL / 2, FRONT + 2 * run, v, v + 0.5, top, top + 0.3);
      // The gable: the party wall carried up to the copings, where the next building is lower or has another roof. (It stopped at the
      // eaves, so from the Landing or over a lower neighbour the gable was an open triangle onto the dark under the roof.) Kept a hair
      // inside the wall's planes, behind the parapet it rises from.
      for (const v of [y0, y1 - 0.5]) if (!levelRidge(v === y0 ? y0 : y1)) B.prism('brick#8a6a5c', [[s * FRONT, top], [s * (FRONT + run), top + rise], [s * (FRONT + 2 * run), top]], -(v + 0.48), -(v + 0.02));
      if (lot.id === 'apothecary') { L('brick#8a6a5c', FRONT + run - 1.2, FRONT + run + 1.2, y1 - 2.6, y1 - 0.2, top, top + rise + 3.4); L('c#3a342e/0.9', FRONT + run - 1.4, FRONT + run + 1.4, y1 - 2.8, y1, top + rise + 3.4, top + rise + 3.7); }
    }
    surfaces.push({ x0: Math.min(s * (FRONT - 0.2), s * ub), x1: Math.max(s * (FRONT - 0.2), s * ub), z0: wz(y1 - SIDE), z1: wz(y0 + SIDE), h: FL });
    // beams across the ceiling of the real shops, and a deep cornice
    if (lot.enter) {
      const BM = lot.beam ?? 'painted_wood#efe8d8';
      for (let u = ui + 3.2; u < ub - 1.5; u += 5.2) L(BM, u - 0.3, u + 0.3, y0 + SIDE, y1 - SIDE, CEIL - 0.7, CEIL + 0.01, { grain: 'long' });
      for (const [v, sg] of [[y0 + SIDE, 1], [y1 - SIDE, -1]]) L(BM, ui, ub, v, v + sg * 0.22, CEIL - 0.42, CEIL + 0.01, G);
      L(BM, ub - 0.22, ub, y0 + SIDE, y1 - SIDE, CEIL - 0.44, CEIL + 0.01, G);      // (a hair deeper than the side runs, whose undersides it met in the corners)
    }
    // skirting and a picture rail inside the real shops
    if (lot.enter && !INT.startsWith('tile')) for (const [v, sg] of [[y0 + SIDE, 1], [y1 - SIDE, -1]]) { L('painted_wood#efe8d8', ui, ub, v, v + sg * 0.06, FL, FL + 0.6, G); }

    // -- the shopfront ---------------------------------------------------------------------------
    // Brick piers at each end; between them a painted timber front: stall riser, plate glass,
    // a transom of small lights, the fascia with the name, a little cornice.
    const PIERM = { stone: 'c#b9b2a4/0.9', plaster: 'plaster#d9d0bd', coursed: 'flagstone', iron: PAINT, brick: EXT }[lot.piers ?? 'brick'];
    const PIER = lot.piers === 'iron' ? 0.8 : 1.2, a0 = y0 + PIER, a1 = y1 - PIER;                 // the timber front runs a0..a1
    const dw = 3.7, dc = a0 + (a1 - a0) * lot.door, d0 = Math.max(a0 + 0.2, Math.min(a1 - dw - 0.2, dc - dw / 2)), d1 = d0 + dw;
    const SILL = FL + 1.9, HEAD = FL + 9.1, TRAN = FL + 10.7, DOORH = FL + 7.9, FASC = SHOPTOP - 0.7;
    const uo = FRONT, um = FRONT + WALL / 2;
    for (const [va, vb] of [[y0, a0], [a1, y1]]) {                     // piers, the full height of the shopfront
      L(PIERM, uo, um, va, vb, 0, FASC + 0.48, C); L(INT, um, ui, va + (va === y0 ? SIDE : 0), vb - (vb === y1 ? SIDE : 0), FL, CEIL);
      if (lot.piers === 'stone' || lot.piers === 'plaster') { L(PIERM, uo - 0.14, uo, va, vb, FL + 10.2, FL + 10.9); L(PIERM, uo - 0.08, uo, va + 0.1, vb - 0.1, 0.9, FL + 10.2); }      // a capital and a shallow shaft
      L(TRIM, uo - 0.12, uo, va - (va === y0 ? 0 : 0.06), vb + (vb === y1 ? 0 : 0.06), 0, 0.9);                // plinth
    }
    // above the glass: transom rail, fascia, cornice (outside); a plain bulkhead inside
    L(PAINT, uo - 0.05, um, a0, a1, TRAN, FASC + 0.01, G); L(INT, um, ui, a0, a1, TRAN, CEIL);
    L(PAINT, uo - 0.22, uo - 0.05, a0 - 0.1, a1 + 0.1, TRAN + 0.1, TRAN + 0.3, G);
    L(PAINT, uo - 0.3, uo - 0.05, a0 - 0.2, a1 + 0.2, FASC - 0.25, FASC, G);
    // (the piers stop under the brick band, which they used to run up behind, face to face with it; the cornice stops a hair short of
    // the wall's back face, where it met the piers' backs; and the cornice returns only at the ends of a row: every shopfront's is at
    // the same height, and the two used to run into each other)
    L(TRIM, uo - 0.5, um - 0.02, y0 + 0.05, y1 - 0.05, FASC, FASC + 0.3); L(TRIM, uo - 0.7, um - 0.02, y0 - (nbr(y0) ? 0 : 0.05), y1 + (nbr(y1) ? 0 : 0.05), FASC + 0.3, FASC + 0.48); L(EXT, uo, um, y0, y1, FASC + 0.48, SHOPTOP + 0.4);
    B.block(Math.min(s * uo, s * ui), Math.max(s * uo, s * ui), a0, a1, TRAN, SHOPTOP);
    lot.fascia = { v0: a0 + 0.3, v1: a1 - 0.3, h0: TRAN + 0.42, h1: FASC - 0.32, u: uo - 0.07 };

    // bays: plate glass either side of the door, split by mullions about every five feet
    const bay = (va, vb) => {
      if (vb - va < 0.6) return;
      L(PAINT, uo - 0.06, um, va, vb, 0.02, SILL, G); L(INT, um, ui, va, vb, FL, SILL - 0.1);                    // stall riser
      L(PAINT, uo - 0.14, ui + 0.25, va - 0.05, vb + 0.05, SILL - 0.14, SILL, G);                                 // sill, and a display shelf's lip inside
      const n = Math.max(1, Math.round((vb - va) / 5.2)), w = (vb - va) / n;
      // raised panels on the riser
      for (let i = 0; i < n; i++) L(PAINT, uo - 0.1, uo - 0.06, va + i * w + 0.35, va + (i + 1) * w - 0.35, FL + 0.35, SILL - 0.5, G);
      for (let i = 0; i <= n; i++) { const v = va + i * w, t = i === 0 || i === n ? 0.16 : 0.09; L(PAINT, uo + 0.12, uo + 0.5, v - t, v + t, SILL, TRAN, G); }
      L(PAINT, uo + 0.1, uo + 0.52, va, vb, HEAD, HEAD + 0.24, G);                                                // transom bar (a hair proud of the mullions it crosses)
      if (lot.piers === 'iron') for (let i = 0; i <= n; i++) { const v = va + i * w; B.pcyl(PAINT, s * (uo - 0.16), v, 0.5, TRAN - 0.3, 0.2, 0.15, 10); L(PAINT, uo - 0.42, uo + 0.1, v - 0.3, v + 0.3, TRAN - 0.3, TRAN + 0.05); L(PAINT, uo - 0.4, uo + 0.08, v - 0.27, v + 0.27, 0.5, 0.95); }      // cast-iron columns, cap and base
      L('glass', uo + 0.3, uo + 0.33, va + 0.1, vb - 0.1, SILL - 0.02, HEAD + 0.02);      // (let into the sill and the bar: two-sided glass flickered on faces it shared with them)
      // the transom: small square lights
      const k = Math.max(2, Math.round((vb - va) / 1.5)), kw = (vb - va) / k;
      for (let i = 1; i < k; i++) L(PAINT, uo + 0.2, uo + 0.42, va + i * kw - 0.04, va + i * kw + 0.04, HEAD + 0.24, TRAN, G);
      L('glass', uo + 0.3, uo + 0.33, va + 0.1, vb - 0.1, HEAD + 0.22, TRAN + 0.02);
      B.block(Math.min(s * uo, s * ui), Math.max(s * uo, s * ui), va, vb, 0, TRAN);
      portals.push({ x0: Math.min(s * uo, s * ui), x1: Math.max(s * uo, s * ui), y0: SILL, y1: TRAN, z0: wz(vb), z1: wz(va), n: 'x', kind: 'win' });
      windows.push({ isX: false, c: s * uo, sg: s, u0: va, u1: vb, fl: FL, sill: SILL - FL, head: TRAN - FL, lot: lot.id });
    };
    bay(a0, d0); bay(d1, a1);
    // the door: jambs, a glazed leaf, a light over it
    L(PAINT, uo - 0.06, ui, d0, d0 + 0.22, FL, TRAN, G); L(PAINT, uo - 0.06, ui, d1 - 0.22, d1, FL, TRAN, G);      // (they ran 0.02 on into the bays, face to face with the risers)
    L(PAINT, uo - 0.06, ui, d0 + 0.22, d1 - 0.22, DOORH, DOORH + 0.3, G);
    L('glass', uo + 0.3, uo + 0.33, d0 + 0.2, d1 - 0.2, DOORH + 0.28, TRAN + 0.02);
    L('pavers', uo - 0.1, ui, d0 + 0.22, d1 - 0.22, FL - 0.5, FL + 0.016);                                       // the threshold
    B.block(Math.min(s * uo, s * ui), Math.max(s * uo, s * ui), d0, d0 + 0.22, 0, TRAN); B.block(Math.min(s * uo, s * ui), Math.max(s * uo, s * ui), d1 - 0.22, d1, 0, TRAN);
    B.block(Math.min(s * uo, s * ui), Math.max(s * uo, s * ui), d0, d1, DOORH, TRAN);
    {
      const c = s * (uo + 0.4), hingeV = d0 + 0.26, w = dw - 0.52;
      const stop = { x0: c - 0.12, x1: c + 0.12, z0: wz(d1 - 0.22), z1: wz(d0 + 0.22), y0: FL, y1: DOORH };
      B.colliders.push(stop);
      doors.push({ x: wx(c), z: wz(hingeV), closed: Math.PI / 2, open: Math.PI / 2 - s * 1.55, w, y0: FL + 0.03, y1: DOORH - 0.02, glassy: true, stop,
        cx: c, cz: (stop.z0 + stop.z1) / 2, fixed: !lot.enter, exterior: !lot.enter, lot: lot.id });
      if (lot.enter) portals.push({ x0: Math.min(s * uo, s * ui), x1: Math.max(s * uo, s * ui), y0: FL, y1: TRAN, z0: wz(d1), z1: wz(d0), n: 'x', kind: 'door' });
    }
    lot.doorV = (d0 + d1) / 2;

    // -- upstairs: flats over the shops, somebody home in most of them -------------------------------
    {
      const wallTo = top + (lot.roof === 'ridge' ? 0.55 : 1.6);        // parapet (a ridge roof comes down to the cornice)
      const wins = [];
      for (let f = 0; f < lot.up; f++) for (let i = 0; i < lot.bays; i++) {
        const w = Math.min(3.4, (y1 - y0) / lot.bays - 1.9), c = y0 + (y1 - y0) * (i + 0.5) / lot.bays, h0 = SHOPTOP + 3.2 + f * 11.5, h1 = h0 + (f === lot.up - 1 && lot.up > 1 ? 5.6 : 6.2);
        wins.push({ v0: c - w / 2, v1: c + w / 2, h0, h1 });
      }
      // the wall, pieced round the windows (rows are regular, so cut by rows and columns)
      const cols = [...new Set(wins.flatMap(w => [w.v0, w.v1]))].sort((p, q) => p - q), vs = [y0, ...cols, y1];
      const rowsH = [...new Set(wins.flatMap(w => [w.h0, w.h1]))].sort((p, q) => p - q), hs = [SHOPTOP + 0.4, ...rowsH, wallTo];
      for (let i = 0; i < vs.length - 1; i++) for (let j = 0; j < hs.length - 1; j++) {
        const hole = wins.some(w => Math.abs(w.v0 - vs[i]) < 0.01 && Math.abs(w.h0 - hs[j]) < 0.01);
        if (!hole) L(EXT, uo, um, vs[i], vs[i + 1], hs[j], hs[j + 1]);
      }
      for (const w of wins) {
        L(TRIM, uo - 0.16, uo + 0.3, w.v0 - 0.3, w.v1 + 0.3, w.h0 - 0.3, w.h0 + 0.014);                                  // sill
        if (lot.head === 'arch') {                                       // a round-arched hood, in three steps
          const m = (w.v0 + w.v1) / 2, hw = (w.v1 - w.v0) / 2;
          L(TRIM, uo - 0.14, uo + 0.3, w.v0 - 0.28, w.v1 + 0.28, w.h1 - 0.014, w.h1 + 0.34);
          L(TRIM, uo - 0.14, uo + 0.3, m - hw * 0.72, m + hw * 0.72, w.h1 + 0.34, w.h1 + 0.68); L(TRIM, uo - 0.18, uo + 0.3, m - hw * 0.3, m + hw * 0.3, w.h1 + 0.68, w.h1 + 0.92);
        } else if (lot.head === 'hood') {                                // a pressed-metal cap on little brackets
          L(TRIM, uo - 0.08, uo + 0.3, w.v0 - 0.2, w.v1 + 0.2, w.h1 - 0.014, w.h1 + 0.36); L(TRIM, uo - 0.3, uo + 0.3, w.v0 - 0.42, w.v1 + 0.42, w.h1 + 0.36, w.h1 + 0.56);
          for (const v of [w.v0 - 0.18, w.v1 + 0.18]) L(TRIM, uo - 0.24, uo, v - 0.1, v + 0.1, w.h1 - 0.35, w.h1 + 0.36);
        } else L(TRIM, uo - 0.08, uo + 0.3, w.v0 - 0.2, w.v1 + 0.2, w.h1 - 0.014, w.h1 + 0.5);                           // a plain stone lintel
        for (const v of [w.v0, w.v1]) L(TRIM, uo + 0.1, uo + 0.34, v - 0.1, v + 0.1, w.h0, w.h1);                // sash frame
        L(TRIM, uo + 0.14, uo + 0.3, w.v0, w.v1, (w.h0 + w.h1) / 2 - 0.07, (w.h0 + w.h1) / 2 + 0.07);            // meeting rail
        L(TRIM, uo + 0.14, uo + 0.3, w.v0, w.v1, w.h1 - 0.12, w.h1); L(TRIM, uo + 0.14, uo + 0.3, w.v0, w.v1, w.h0, w.h0 + 0.12);
        L('c#1a1614/0.9', um - 0.02, um + 0.08, w.v0 - 0.2, w.v1 + 0.2, w.h0 - 0.2, w.h1 + 0.2);                  // dark behind, should the pane fail (a hair in front of the roof slab, seen through some)
        upWindows.push({ x: s * (uo + 0.36), y: (w.h0 + w.h1) / 2, z: wz((w.v0 + w.v1) / 2), w: w.v1 - w.v0, h: w.h1 - w.h0, side: s, lot: lot.id });
      }
      // cornice and parapet coping
      // The cornice returns round an end only where the next building is not the same height: where the two are level, the two
      // cornices meet end to end (they used to run on a tenth of a foot into each other, sharing their top and under faces). It is
      // laid on the wall's face, not let into it: let in, its ends shared the end face of the wall at the end of the row.
      { const CT = lot.cornice === 'dentil' ? EXT : TRIM, k = lot.cornice === 'dentil' ? 0.55 : 1, r0 = level(y0) ? 0 : 1, r1 = level(y1) ? 0 : 1;
        L(CT, uo - 0.35 * k, uo, y0, y1, top - 0.2, top + 0.25); L(CT, uo - 0.75 * k, uo, y0 - 0.1 * r0, y1 + 0.1 * r1, top + 0.25, top + 0.6); L(CT, uo - 0.5 * k, uo, y0 - 0.05 * r0, y1 + 0.05 * r1, top + 0.6, top + 0.8); }
      if (lot.cornice === 'dentil') { for (let v = y0 + 0.35; v < y1 - 0.2; v += 0.72) L(EXT, uo - 0.26, uo, v - 0.17, v + 0.17, top - 0.42, top + 0.02); L(EXT, uo - 0.16, uo, y0, y1, top - 0.7, top - 0.42); }      // corbelled brick teeth
      else for (let v = y0 + 0.9; v < y1 - 0.5; v += 1.8) L(TRIM, uo - 0.6, uo, v - 0.22, v + 0.22, top - 0.35, top + 0.25);   // brackets under it
      L(TRIM, uo - 0.1, um + 0.15, y0, y1, wallTo, wallTo + 0.22);
      // behind the front: a lower parapet round the roof
      for (const v of [y0, y1 - SIDE]) L('brick#8a6a5c', FRONT + 0.4, back - SIDE, v, v + SIDE, top, top + 0.6);
      L('brick#8a6a5c', back - SIDE, back, y0, y1, top, top + 0.6);
      B.block(Math.min(s * uo, s * um), Math.max(s * uo, s * um), y0, y1, SHOPTOP, wallTo);
    }

    // -- the room, for captions, lighting and deciding what to draw ----------------------------------
    const x0 = Math.min(s * ui, s * ub), x1 = Math.max(s * ui, s * ub);
    rooms.push({ name: lot.name, x0, x1, z0: wz(y1 - SIDE), z1: wz(y0 + SIDE), y0: FL - 1, y1: CEIL + 0.05, lot: lot.id, shut: !lot.enter });
    boxes.push([Math.min(s * (FRONT + 0.34), s * (ub + 0.2)), Math.max(s * (FRONT + 0.34), s * (ub + 0.2)), wz(y1 - 0.3), wz(y0 + 0.3), FL - 0.6, CEIL + 0.3]);
    if (!lot.enter) B.block(x0, x1, y0, y1, 0, CEIL);                 // nobody walks into a window display
    // soft fills that stand in for daylight (and keep a shop from going flat at dusk)
    const nf = lot.enter ? 2 : 1;
    for (let i = 0; i < nf; i++) lamps.push({ x: s * (ui + (ub - ui) * (i + 0.5) / nf), y: CEIL - 0.6, z: wz((y0 + y1) / 2), power: lot.enter ? 1.0 : 0.5 });

    // -- the shop's own coordinates -------------------------------------------------------------------
    lot.W = y1 - y0 - 2 * SIDE; lot.D = ub - ui; lot.H = CEIL - FL; lot.top = top; lot.back = back;
    lot.doorA = s > 0 ? (y1 - SIDE) - lot.doorV : lot.doorV - (y0 + SIDE);
    lot.XY = (a, d) => [s * (ui + d), s > 0 ? (y1 - SIDE) - a : (y0 + SIDE) + a];
    const Q = s > 0 ? { street: 1, back: 3, right: 2, left: 0 } : { street: 3, back: 1, right: 0, left: 2 };
    lot.fr = (kit, a, d, h = 0, face = 'street') => { const [X, Y] = lot.XY(a, d); return kit.fr(X, Y, FL + h, Q[face]); };
    lot.world = (a, d) => { const [X, Y] = lot.XY(a, d); return [wx(X), wz(Y)]; };
    // the pavement in front, in the same terms: a along the frontage, out = feet out from the shopfront
    lot.frOut = (kit, a, out, h = 0, face = 'street') => { const [X, Y] = lot.XY(a, -WALL - out); return kit.fr(X, Y, CURB + h, Q[face]); };
    lot.worldOut = (a, out) => { const [X, Y] = lot.XY(a, -WALL - out); return [wx(X), wz(Y)]; };
  }

  const byId = Object.fromEntries(LOTS.map(l => [l.id, l]));
  // the chapel is its own building (chapel.js): it adds its room, openings and floor to the same lists
  const chapel = chapelShell(B, { site: CHAPEL_SITE, surfaces, rooms, lamps, doors, windows, portals, boxes, footprints, FL, CURB }) ?? null;
  // You arrive at the east end, looking down the street into the sunset.
  return { surfaces, rooms, lamps, doors, windows, portals, boxes, upWindows, footprints, lots: byId, floor: FL, ceil: CEIL, chapel,
    spawn: { x: 3, y: 0, z: wz(-26), yaw: 0 } };
}
