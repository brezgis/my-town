// The grounds: what joins the island up and keeps its lawns from looking unfinished.
//
//   Walks      the gravel lanes behind the buildings (backs.js) used to start and stop in the grass. They are
//              joined here into one walk each side: from the Landing round the end walls, past the picture
//              garden and the Yard, and out to the Overlook and the chapel green. One more goes east from the
//              Landing to a bench at the island's tip, beside the airship's way in.
//   Planting   beds against the two end walls at the Landing; long meadow either side of the Mooring Field
//              (the airship's way down the middle is left mown); something at the foot of the bigger trees;
//              a few clumps of shrubs out toward the rim; a handful of boulders.
//
// Restraint: big, calm masses a gardener would have planted, not ornaments. Nothing here can be read or used
// except one bench. Everything is ground texture, instanced plants and three rocks: no new draw calls.
//
// World feet: x north(+)/south(-), z east(+)/west(-); the street runs west toward -z.

import { PAINT } from './street/tools.js';
import { CURB } from './town.js';

export function layGrounds(K, town) {
  const r = K.r, G = K.G, F = K.F;
  const ch = town?.chapel, keepOff = [...(town?.footprints ?? []), ch?.footprint, ch?.churchyard, ch?.gatePath, ch?.yardPath].filter(Boolean);
  const clear = (x, z, m = 3) => !keepOff.some(q => x > q.x0 - m && x < q.x1 + m && z > q.z0 - m && z < q.z1 + m);
  const walk = (pts, w = 3.4) => G.ribbon('gravel', pts, w, { wobble: 0.12 });

  // ---- the walks ---------------------------------------------------------------------------------------
  walk([[24.6, 5], [42, 7.5], [60, 6], [71, -0.6], [76.5, -5.2]]);                    // the Landing, round the coffee house's end wall, to the north lane
  walk([[-24.6, 7], [-42, 9.5], [-60, 8.5], [-71, 2.2], [-76.5, -2.2]]);              // and round the record shop's to the south lane
  walk([[78, -86.5], [80.5, -100], [78.5, -111], [72, -116.6], [76.4, -121.2]]);      // past the back of the picture garden
  walk([[78, -179.5], [77, -192], [75.5, -203], [70, -206.2], [57, -205], [40, -200.5], [25.2, -193.5]]);      // the north lane round the foot of the Gloaming's stair, and on to the pavement at the end of the street (the way to the bar)
  walk([[-82, -118.5], [-80.5, -131], [-72, -141.5], [-50, -143.2], [-24.6, -142.4]]);   // the Yard, behind the noodle bar, back to the pavement by the green
  walk([[15, 58.2], [17, 80], [11.5, 110], [7, 138], [5, 157]], 3.2);                 // east from the Landing to the tip
  K.bench(5, 161.5, 0, { w: 5 }); K.seat(5, 1.4, 161.5, Math.PI, 'sit and watch for the airship');

  // ---- the stone border, all the way round ---------------------------------------------------------------
  // The pavements, the Landing's apron and the Overlook had their concrete edging only in places. Every edge of
  // the brick paving that meets grass, gravel or the road now has it, and so has the road's east end.
  {
    const P = K.P2, E = 0.7, edge = (X0, X1, Y0, Y1) => P('concrete', X0, X1, Y0, Y1, -0.6, CURB);
    edge(-11.7, 11.7, -40.7, -40);                                              // across the road's east end, where the apron begins
    for (const s of [1, -1]) {
      const first = s > 0 ? 3.8 : 1;                                            // where the first building on this side begins
      edge(s * 24, s * (24 + E), -58.7, first - 0.02);                          // the apron's and the pavement's outer edge, up to the first building
      edge(s * 24, s * (34 + E), 198 - E, 198);                                 // the Overlook's shoulders, either side of the pavements
    }
    edge(24, 24 + E, 181.52, 198 - E);                                          // north: from the last building to the Overlook
    edge(-24 - E, -24, 78.02, 117.98);                                          // south: across the mouth of the Yard
    edge(-24 - E, -24, 138.02, 166.9);                                            // and along the green, to the chapel
  }

  // ---- beds against the end walls at the Landing -------------------------------------------------------
  for (const s of [1, -1]) {
    const zw = s > 0 ? -3.8 : -1, z0 = zw + 0.6, z1 = zw + (s > 0 ? 6.6 : 6.2);
    G.poly('mulch', [[s * 27, z0], [s * 66.5, z0], [s * 66.5, z1 - 1], [s * 46, z1], [s * 27, z1 - 0.6]]);
    F.border([[s * 27.5, z1 - 0.4], [s * 66, z1 - 0.8]], z1 - z0 - 0.8, -s, { back: [['hydrangea', 0.95], ['shrub', 0.55]], mid: [['fern', 1], ['hosta', 1.2], ['coneflower', 0.9]], front: [['catmint', 0.9], ['lavender', 0.9], ['hosta', 1]], step: 5.5 });
  }

  // ---- the Mooring Field: meadow either side, the middle left mown for the airship -----------------------
  for (const [cx, cz, rx, rz, seed] of [[46, 104, 19, 40, 31], [-45, 112, 18, 42, 32]]) {
    G.blob('meadow', cx, cz, rx, rz, { wobble: 0.16, seed });
    F.drift('grass', cx, cz, rx * 0.86, rz * 0.9, 120, 1); F.drift('wildflowers', cx, cz, rx * 0.8, rz * 0.86, 70, 0.95);
    F.drift('cosmos', cx - Math.sign(cx) * 6, cz - 14, 7, 12, 22, 0.9); F.drift('coneflower', cx + Math.sign(cx) * 3, cz + 16, 8, 11, 20, 0.95); F.drift('spires', cx, cz + 2, 6, 14, 12, 0.9);
  }
  for (const [x, z] of [[19.5, 70], [13.5, 96], [9.5, 124], [4, 150]]) F.drift(K.pick(['lavender', 'catmint']), x, z, 1.6, 2.6, 6, 0.9);      // along the east walk, now and then

  // ---- at the foot of the bigger trees ---------------------------------------------------------------------
  const FOOT = { oak: ['fern', 'hosta'], maple: ['hosta', 'fern'], copper: ['fern'], cherry: ['catmint'], magnolia: ['hosta'], apple: ['wildflowers'], lilac: ['catmint'], willow: ['fern'], birch: ['grass'], jmaple: ['hosta'] };
  let k = 0;
  for (const t of K.trees ?? []) {
    if (t.y || !FOOT[t.kind] || !clear(t.x, t.z, 5) || (k++ % 3 === 2)) continue;       // not the street's; two in three
    const rad = t.kind === 'oak' || t.kind === 'copper' || t.kind === 'maple' ? 3.4 : 2.4;
    G.blob('mulch', t.x, t.z, rad, rad * 0.9, { wobble: 0.2, seed: Math.round(t.x * 7 + t.z) });
    for (let i = 0, n = Math.round(rad * 2.6); i < n; i++) { const a = (i / n) * 6.283 + r(), d = rad * (0.5 + 0.42 * r()); F.add(K.pick(FOOT[t.kind]), t.x + Math.cos(a) * d, t.z + Math.sin(a) * d, 0.7 + r() * 0.35); }
  }

  // ---- clumps of shrubs out toward the rim, where the lawn ran on with nothing in it -------------------------
  for (const [x, z, n] of [[101, -18, 5], [106, -92, 6], [99, -137, 5], [93, -202, 5], [-108, -62, 6], [-104, -150, 5], [-97, -226, 5], [-30, 132, 4], [30, 152, 4], [62, 54, 4], [-70, 58, 4]]) {
    if (!clear(x, z, 6)) continue;
    G.blob('mulch', x, z, 5.2, 3.8, { wobble: 0.22, seed: Math.round(x * 3 + z) });
    for (let i = 0; i < n; i++) F.add(i < 2 ? 'shrub' : K.pick(['hydrangea', 'rose', 'hydrangea']), x + (r() - 0.5) * 7, z + (r() - 0.5) * 4.6, i < 2 ? 0.6 + r() * 0.2 : 0.85 + r() * 0.3);
    F.drift(K.pick(['fern', 'catmint', 'hosta']), x, z, 5, 3.6, 7, 0.85);
  }

  // ---- three boulders, where a field would have them ----------------------------------------------------------
  for (const [x, z, s] of [[112, -40, 2.4], [-116, -108, 2.8], [-22, 150, 2.0]]) { K.rock?.(PAINT.stone, x, s * 0.28, z, s, s * 0.62, s * 0.8); K.collide(x - s * 0.7, x + s * 0.7, z - s * 0.6, z + s * 0.6, s); F.drift('grass', x + s * 0.8, z + s * 0.5, 1.6, 1.2, 4, 0.8); }
}
