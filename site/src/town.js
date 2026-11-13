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
  street: { side: -1, y0: 168, y1: 198, front: FRONT } };
const WALL = 0.8, SIDE = 0.5;

// face: the upper wall;  paint: the timber shopfront;  trim: sills, cornice, piers' caps
// inside: plaster tint;  floor: floor material;  up: upper storeys (1 or 2);  bays: windows upstairs
export const LOTS = [
  // ---- north side (odd numbers, as it should be) ------------------------------------------------
  { id: 'coffee', name: 'Slow Hand Coffee', side: 1, y0: -8, y1: 24, depth: 30, door: 0.5, enter: true, up: 1, bays: 4,
    face: 'brick#b98f7c', paint: 'painted_wood#2f4a40', trim: 'c#e6dcc6/0.7', inside: 'plaster#f0e8d6', floor: 'floor', awning: ['c#2f4a40/0.9', 'c#e9e0cc/0.9'] },
  { id: 'yoga', name: 'Low Sun Yoga', side: 1, y0: 24, y1: 56, depth: 30, door: 0.5, enter: true, up: 1, bays: 4,
    face: 'plaster#e6dccb', paint: 'painted_wood#c98a6a', trim: 'c#f1ebdd/0.7', inside: 'plaster#f3ece0', floor: 'floor' },
  { id: 'books', name: 'Marginalia', side: 1, y0: 56, y1: 84, depth: 30, door: 0.24, enter: true, up: 2, bays: 3,
    face: 'plaster#d9c9a8', paint: 'painted_wood#7a2f2a', trim: 'c#efe7d6/0.7', inside: 'plaster#e9dcc2', floor: 'floor' },
  { id: 'cinema', name: 'The Lantern', side: 1, y0: 84, y1: 112, depth: 10, show: 6, door: 0.5, enter: false, up: 1, bays: 0,
    face: 'plaster#e6d9c0', paint: 'painted_wood#1f2c3a', trim: 'c#c9a45c/0.4/1', inside: 'plaster#7a2f2f', floor: 'tile_hex' },
  // (112 to 120: Pickle Alley)
  { id: 'grocery', name: 'Salt & Larder', side: 1, y0: 120, y1: 154, depth: 30, door: 0.5, enter: true, up: 1, bays: 4,
    face: 'brick#a8806c', paint: 'painted_wood#e8dfc8', trim: 'c#2a2a26/0.6', inside: 'tile_subway', floor: 'tile_hex', awning: ['c#b8452e/0.9', 'c#efe6d2/0.9'] },
  { id: 'plants', name: 'Frond', side: 1, y0: 154, y1: 182, depth: 28, door: 0.72, enter: true, up: 2, bays: 3,
    face: 'brick#8f6a5c', paint: 'painted_wood#d9d2bf', trim: 'c#efe7d6/0.7', inside: 'plaster#ece6d6', floor: 'pavers' },
  // ---- south side ----------------------------------------------------------------------------------
  { id: 'records', name: 'Low Tide Records', side: -1, y0: -8, y1: 22, depth: 28, door: 0.3, enter: true, up: 2, bays: 3,
    face: 'brick#96705f', paint: 'painted_wood#1d1d1f', trim: 'c#d8c9a8/0.7', inside: 'plaster#e6dccb', floor: 'floor' },
  { id: 'museum', name: 'The Museum of Small Wonders', side: -1, y0: 22, y1: 54, depth: 32, door: 0.5, enter: true, up: 1, bays: 4,
    face: 'brick#a08474', paint: 'painted_wood#3a4a44', trim: 'c#e8dfcc/0.7', inside: 'plaster#ece6da', floor: 'floor' },
  { id: 'bakery', name: 'Tomorrow Bread', side: -1, y0: 54, y1: 78, depth: 26, door: 0.74, enter: true, up: 1, bays: 3,
    face: 'plaster#e9d6c2', paint: 'painted_wood#d8b7a6', trim: 'c#f1ebdd/0.7', inside: 'plaster#efe6d4', floor: 'tile_hex', awning: ['c#d59a8a/0.9', 'c#f3ecdd/0.9'] },
  // (78 to 118: the Yard, with the dumpling cart)
  { id: 'apothecary', name: 'Wick & Sundry', side: -1, y0: 118, y1: 146, depth: 28, door: 0.5, enter: true, up: 1, bays: 3,
    face: 'shake#c9bfae', paint: 'painted_wood#34405a', trim: 'c#e8dfcc/0.7', inside: 'plaster#e4dfd2', floor: 'floor' },
  { id: 'noodles', name: 'Night Noodle', side: -1, y0: 146, y1: 168, depth: 26, door: 0.26, enter: true, up: 2, bays: 2,
    face: 'brick#7d5a50', paint: 'painted_wood#2a2320', trim: 'c#c8402f/0.6', inside: 'plaster#c9a070', floor: 'tile' },
  // (168 to 198: the chapel, its own building: chapel.js)
  // Spoke & Sprocket, the bicycle shop, is set aside for now (shops/bikes.js is still there):
  // { id: 'bikes', name: 'Spoke & Sprocket', side: -1, y0: 168, y1: 191, depth: 24, door: 0.2, enter: true, up: 1, bays: 3,
  // face: 'plaster#c8d2c4', paint: 'painted_wood#d4a02a', trim: 'c#2a2a26/0.6', inside: 'plaster#e6e2d6', floor: 'floor' },
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
    const top = SHOPTOP + lot.up * 11.5;                              // the roof
    const INT = lot.inside, EXT = lot.face, PAINT = lot.paint, TRIM = lot.trim;
    // Everything below is given as (u, v): u out from the centre line, v along the street.
    const L = (mat, u0, u1, v0, v1, h0, h1, o) => { if (Math.abs(u1 - u0) > 0.004 && Math.abs(v1 - v0) > 0.004 && h1 - h0 > 0.004) B.pbox(mat, s * u0, s * u1, v0, v1, h0, h1, o); };
    const C = { collide: true };
    footprints.push({ x0: Math.min(s * FRONT, s * back) - 0.1, x1: Math.max(s * FRONT, s * back) + 0.1, z0: wz(y1) - 0.1, z1: wz(y0) + 0.1 });

    // -- the box: side walls, back wall, floor, ceiling, roof ---------------------------------
    // inside faces, front and back (a closed shop is only its window: a few feet of display, then a wall)
    const ui = FRONT + WALL, ub = lot.enter ? back - SIDE : Math.min(back - SIDE, FRONT + WALL + (lot.show ?? 6));
    for (const [v, sg] of [[y0, 1], [y1, -1]]) {                       // side walls: brick outside, plaster within
      L(EXT.startsWith('brick') ? EXT : 'brick#8a6a5c', FRONT, back, v, v + sg * SIDE / 2, 0, top, C);
      L(INT, ui, ub, v + sg * SIDE / 2, v + sg * SIDE, FL, CEIL);
      L('brick#8a6a5c', FRONT + 0.1, back, v + sg * SIDE / 2, v + sg * SIDE, CEIL, top);
    }
    L('brick#8a6a5c', back - SIDE / 2, back, y0, y1, 0, top, C);
    L(INT, ub, lot.enter ? back - SIDE / 2 : ub + 0.3, y0 + SIDE, y1 - SIDE, FL, CEIL);
    L(lot.floor, ui - 0.3, ub, y0 + SIDE, y1 - SIDE, FL - 0.5, FL, lot.floor === 'floor' ? { swap: s > 0 } : undefined);
    L('ceil', ui, ub, y0 + SIDE, y1 - SIDE, CEIL, CEIL + 0.4);
    L('roof', FRONT + 0.4, back - 0.3, y0 + 0.3, y1 - 0.3, top - 1.6, top - 1.2);
    surfaces.push({ x0: Math.min(s * (FRONT - 0.2), s * ub), x1: Math.max(s * (FRONT - 0.2), s * ub), z0: wz(y1 - SIDE), z1: wz(y0 + SIDE), h: FL });
    // beams across the ceiling of the real shops, and a deep cornice
    if (lot.enter) {
      const BM = lot.beam ?? 'painted_wood#efe8d8';
      for (let u = ui + 3.2; u < ub - 1.5; u += 5.2) L(BM, u - 0.3, u + 0.3, y0 + SIDE, y1 - SIDE, CEIL - 0.7, CEIL + 0.01, { grain: 'long' });
      for (const [v, sg] of [[y0 + SIDE, 1], [y1 - SIDE, -1]]) L(BM, ui, ub, v, v + sg * 0.22, CEIL - 0.42, CEIL + 0.01, G);
      L(BM, ub - 0.22, ub, y0 + SIDE, y1 - SIDE, CEIL - 0.42, CEIL + 0.01, G);
    }
    // skirting and a picture rail inside the real shops
    if (lot.enter && !INT.startsWith('tile')) for (const [v, sg] of [[y0 + SIDE, 1], [y1 - SIDE, -1]]) { L('painted_wood#efe8d8', ui, ub, v, v + sg * 0.06, FL, FL + 0.6, G); }

    // -- the shopfront ---------------------------------------------------------------------------
    // Brick piers at each end; between them a painted timber front: stall riser, plate glass,
    // a transom of small lights, the fascia with the name, a little cornice.
    const PIER = 1.3, a0 = y0 + PIER, a1 = y1 - PIER;                 // the timber front runs a0..a1
    const dw = 3.7, dc = a0 + (a1 - a0) * lot.door, d0 = Math.max(a0 + 0.2, Math.min(a1 - dw - 0.2, dc - dw / 2)), d1 = d0 + dw;
    const SILL = FL + 1.9, HEAD = FL + 9.1, TRAN = FL + 10.7, DOORH = FL + 7.9, FASC = SHOPTOP - 0.7;
    const uo = FRONT, um = FRONT + WALL / 2;
    for (const [va, vb] of [[y0, a0], [a1, y1]]) {                     // piers, the full height of the shopfront
      L(EXT, uo, um, va, vb, 0, SHOPTOP, C); L(INT, um, ui, va + (va === y0 ? SIDE : 0), vb - (vb === y1 ? SIDE : 0), FL, CEIL);
      L(TRIM, uo - 0.12, uo, va - (va === y0 ? 0 : 0.06), vb + (vb === y1 ? 0 : 0.06), 0, 0.9);                // plinth
    }
    // above the glass: transom rail, fascia, cornice (outside); a plain bulkhead inside
    L(PAINT, uo - 0.05, um, a0, a1, TRAN, FASC + 0.01, G); L(INT, um, ui, a0, a1, TRAN, CEIL);
    L(PAINT, uo - 0.22, uo - 0.05, a0 - 0.1, a1 + 0.1, TRAN + 0.1, TRAN + 0.3, G);
    L(PAINT, uo - 0.3, uo - 0.05, a0 - 0.2, a1 + 0.2, FASC - 0.25, FASC, G);
    L(TRIM, uo - 0.5, um, y0 + 0.05, y1 - 0.05, FASC, FASC + 0.3); L(TRIM, uo - 0.7, um, y0 - 0.05, y1 + 0.05, FASC + 0.3, FASC + 0.48); L(EXT, uo, um, y0, y1, FASC + 0.48, SHOPTOP + 0.4);
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
      L(PAINT, uo + 0.12, uo + 0.5, va, vb, HEAD, HEAD + 0.24, G);                                                // transom bar
      L('glass', uo + 0.3, uo + 0.33, va + 0.1, vb - 0.1, SILL, HEAD);
      // the transom: small square lights
      const k = Math.max(2, Math.round((vb - va) / 1.5)), kw = (vb - va) / k;
      for (let i = 1; i < k; i++) L(PAINT, uo + 0.2, uo + 0.42, va + i * kw - 0.04, va + i * kw + 0.04, HEAD + 0.24, TRAN, G);
      L('glass', uo + 0.3, uo + 0.33, va + 0.1, vb - 0.1, HEAD + 0.24, TRAN);
      B.block(Math.min(s * uo, s * ui), Math.max(s * uo, s * ui), va, vb, 0, TRAN);
      portals.push({ x0: Math.min(s * uo, s * ui), x1: Math.max(s * uo, s * ui), y0: SILL, y1: TRAN, z0: wz(vb), z1: wz(va), n: 'x', kind: 'win' });
      windows.push({ isX: false, c: s * uo, sg: s, u0: va, u1: vb, fl: FL, sill: SILL - FL, head: TRAN - FL, lot: lot.id });
    };
    bay(a0, d0); bay(d1, a1);
    // the door: jambs, a glazed leaf, a light over it
    L(PAINT, uo - 0.06, ui, d0 - 0.02, d0 + 0.22, FL, TRAN, G); L(PAINT, uo - 0.06, ui, d1 - 0.22, d1 + 0.02, FL, TRAN, G);
    L(PAINT, uo - 0.06, ui, d0 + 0.22, d1 - 0.22, DOORH, DOORH + 0.3, G);
    L('glass', uo + 0.3, uo + 0.33, d0 + 0.22, d1 - 0.22, DOORH + 0.3, TRAN);
    L('pavers', uo - 0.1, ui, d0 + 0.22, d1 - 0.22, FL - 0.5, FL + 0.004);                                       // the threshold
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
      const wallTo = top + 1.6;                                        // parapet
      const wins = [];
      for (let f = 0; f < lot.up; f++) for (let i = 0; i < lot.bays; i++) {
        const w = 3.4, c = y0 + (y1 - y0) * (i + 0.5) / lot.bays, h0 = SHOPTOP + 3.2 + f * 11.5, h1 = h0 + 6.2;
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
        L(TRIM, uo - 0.16, uo + 0.3, w.v0 - 0.3, w.v1 + 0.3, w.h0 - 0.3, w.h0);                                  // sill
        L(TRIM, uo - 0.08, uo + 0.3, w.v0 - 0.2, w.v1 + 0.2, w.h1, w.h1 + 0.5);                                  // lintel
        for (const v of [w.v0, w.v1]) L(TRIM, uo + 0.1, uo + 0.34, v - 0.1, v + 0.1, w.h0, w.h1);                // sash frame
        L(TRIM, uo + 0.14, uo + 0.3, w.v0, w.v1, (w.h0 + w.h1) / 2 - 0.07, (w.h0 + w.h1) / 2 + 0.07);            // meeting rail
        L(TRIM, uo + 0.14, uo + 0.3, w.v0, w.v1, w.h1 - 0.12, w.h1); L(TRIM, uo + 0.14, uo + 0.3, w.v0, w.v1, w.h0, w.h0 + 0.12);
        L('c#1a1614/0.9', um, um + 0.1, w.v0 - 0.2, w.v1 + 0.2, w.h0 - 0.2, w.h1 + 0.2);                          // dark behind, should the pane fail
        upWindows.push({ x: s * (uo + 0.36), y: (w.h0 + w.h1) / 2, z: wz((w.v0 + w.v1) / 2), w: w.v1 - w.v0, h: w.h1 - w.h0, side: s, lot: lot.id });
      }
      // cornice and parapet coping
      L(TRIM, uo - 0.35, um, y0, y1, top - 0.2, top + 0.25); L(TRIM, uo - 0.75, um, y0 - 0.1, y1 + 0.1, top + 0.25, top + 0.6); L(TRIM, uo - 0.5, um, y0 - 0.05, y1 + 0.05, top + 0.6, top + 0.8);
      for (let v = y0 + 0.9; v < y1 - 0.5; v += 1.8) L(TRIM, uo - 0.6, uo, v - 0.22, v + 0.22, top - 0.35, top + 0.25);   // brackets under it
      L(TRIM, uo - 0.1, um + 0.15, y0, y1, wallTo, wallTo + 0.22);
      // behind the front: a lower parapet round the roof
      for (const v of [y0, y1 - SIDE]) L('brick#8a6a5c', FRONT + 0.4, back, v, v + SIDE, top, top + 0.6);
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
