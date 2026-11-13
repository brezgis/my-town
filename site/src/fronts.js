// Dressing the shopfronts: the painted name over each one, awnings, hanging signs, the lamps
// that light the names after dark, and the windows of the flats upstairs.

import * as THREE from 'three';
import { FRONT, SHOPTOP, CURB, FL, LOTS } from './town.js';
import { T, F, fill, grain, board, disc, rect, rrect, line, poly, glow, ICON, rnd, TAU } from './draw.js';
import { PAINT } from './street/tools.js';

// ---- the names over the doors ----------------------------------------------------------------------
// Each painter gets a canvas the shape of its fascia (about 13 : 1).
const NAMES = {
  yoga(g, w, h) {
    board(g, w, h, '#c98a6a', '#fbf1df', { inset: h * 0.09 });
    ICON.sun(g, h * 1.1, h * 0.52, h * 0.7, '#fbf1df'); ICON.sun(g, w - h * 1.1, h * 0.52, h * 0.7, '#fbf1df');
    T(g, 'low sun yoga', w / 2, h * 0.43, h * 0.5, '#fbf1df', { f: F.fraunces, w: 600, it: 1, ls: h * 0.04 });
    T(g, 'ALL LEVELS  ·  ALL JOINTS  ·  ALL WELCOME', w / 2, h * 0.84, h * 0.12, '#6a3a26', { f: F.bebas, ls: h * 0.04 });
  },
  museum(g, w, h) {
    board(g, w, h, '#2c3a36', '#d9c9a0', { inset: h * 0.09 });
    T(g, 'THE MUSEUM OF SMALL WONDERS', w / 2, h * 0.43, h * 0.4, '#e6d8b0', { f: F.dm, ls: h * 0.08, max: w * 0.82 });
    T(g, 'admission free  ·  wonder at your own pace', w / 2, h * 0.83, h * 0.15, '#d9c9a0', { f: F.fraunces, it: 1, w: 600 });
    ICON.star(g, h * 0.9, h * 0.5, h * 0.5, '#e6d8b0'); ICON.star(g, w - h * 0.9, h * 0.5, h * 0.5, '#e6d8b0');
  },
  coffee(g, w, h) {
    board(g, w, h, '#24382f', '#c9a45c', { inset: h * 0.09 });
    ICON.cup(g, h * 1.0, h * 0.5, h * 0.62, '#e9dfc6'); ICON.cup(g, w - h * 1.0, h * 0.5, h * 0.62, '#e9dfc6');
    T(g, 'Slow Hand Coffee', w / 2, h * 0.43, h * 0.56, '#efe6cf', { f: F.playfair, w: 700, it: 1, shadow: '#101a15' });
    T(g, 'ROASTED UPSTAIRS  ·  POURED DOWNSTAIRS', w / 2, h * 0.83, h * 0.13, '#c9a45c', { f: F.bebas, ls: h * 0.03 });
  },
  books(g, w, h) {
    board(g, w, h, '#5e1f1c', '#d2ae62', { inset: h * 0.09 });
    T(g, 'MARGINALIA', w / 2, h * 0.44, h * 0.52, '#e0bd6e', { f: F.dm, ls: h * 0.16, shadow: '#2a0c0a' });
    T(g, 'new, used & thoroughly annotated books', w / 2, h * 0.82, h * 0.15, '#e9d9b4', { f: F.fraunces, it: 1, w: 600 });
    ICON.book(g, h * 1.0, h * 0.5, h * 0.6, '#e0bd6e', '#5e1f1c'); ICON.book(g, w - h * 1.0, h * 0.5, h * 0.6, '#e0bd6e', '#5e1f1c');
  },
  cinema(g, w, h) {
    board(g, w, h, '#16212d', '#c9a45c', { inset: h * 0.09 });
    T(g, 'THE LANTERN', w / 2, h * 0.44, h * 0.5, '#f0d48a', { f: F.limelight, ls: h * 0.1, shadow: '#05080c' });
    T(g, 'ONE SCREEN  ·  FORTY-ONE SEATS  ·  REAL BUTTER', w / 2, h * 0.83, h * 0.13, '#c9a45c', { f: F.bebas, ls: h * 0.03 });
    for (const x of [h * 1.0, w - h * 1.0]) ICON.star(g, x, h * 0.5, h * 0.5, '#f0d48a');
  },
  grocery(g, w, h) {
    board(g, w, h, '#ebe2cc', '#1d1b18', { inset: h * 0.09 });
    T(g, 'SALT & LARDER', w / 2, h * 0.43, h * 0.56, '#1d1b18', { f: F.abril, ls: h * 0.06 });
    T(g, 'tinned fish  ·  good oil  ·  bread  ·  flowers  ·  provisions', w / 2, h * 0.83, h * 0.15, '#a8361f', { f: F.fraunces, it: 1, w: 600 });
    ICON.fish(g, h * 1.1, h * 0.5, h * 0.7, '#a8361f'); g.save(); g.translate(w - h * 1.1, h * 0.5); g.scale(-1, 1); ICON.fish(g, 0, 0, h * 0.7, '#a8361f'); g.restore();
  },
  plants(g, w, h) {
    board(g, w, h, '#e6e0cf', '#3f5f43', { inset: h * 0.09 });
    T(g, 'frond', w / 2, h * 0.42, h * 0.62, '#34553a', { f: F.shrikhand });
    T(g, 'PLANTS & THEIR PARAPHERNALIA', w / 2, h * 0.84, h * 0.13, '#5a7a55', { f: F.bebas, ls: h * 0.04 });
    for (const k of [-1, 1]) for (let i = 0; i < 3; i++) ICON.leaf(g, w / 2 + k * (w * 0.2 + i * h * 0.62), h * (0.5 + (i % 2) * 0.06), h * (0.6 - i * 0.08), ['#34553a', '#5a7a55', '#7f9a6a'][i]);
  },
  records(g, w, h) {
    board(g, w, h, '#151517', '#e8e2d2', { inset: h * 0.09 });
    T(g, 'LOW TIDE RECORDS', w / 2, h * 0.46, h * 0.6, '#f0ebdc', { f: F.bebas, ls: h * 0.09 });
    T(g, 'BUY  ·  SELL  ·  TRADE  ·  LISTEN FIRST', w / 2, h * 0.84, h * 0.12, '#e0723c', { f: F.archivo, ls: h * 0.03 });
    ICON.record(g, h * 1.0, h * 0.5, h * 0.72, '#f0ebdc', '#151517'); disc(g, h * 1.0, h * 0.5, h * 0.11, '#e0723c');
    ICON.record(g, w - h * 1.0, h * 0.5, h * 0.72, '#f0ebdc', '#151517'); disc(g, w - h * 1.0, h * 0.5, h * 0.11, '#3c8fa0');
  },
  bakery(g, w, h) {
    board(g, w, h, '#d9b3a4', '#fbf4e6', { inset: h * 0.09 });
    T(g, 'Tomorrow Bread', w / 2, h * 0.43, h * 0.5, '#fbf4e6', { f: F.pacifico, shadow: '#a87868' });
    T(g, 'BAKED BEFORE YOU ARE UP', w / 2, h * 0.84, h * 0.12, '#7a4a3c', { f: F.bebas, ls: h * 0.05 });
    ICON.loaf(g, h * 1.1, h * 0.5, h * 0.7, '#fbf4e6', '#c9988a'); ICON.loaf(g, w - h * 1.1, h * 0.5, h * 0.7, '#fbf4e6', '#c9988a');
  },
  apothecary(g, w, h) {
    board(g, w, h, '#26314a', '#d9c9a0', { inset: h * 0.09 });
    T(g, 'Wick & Sundry', w / 2, h * 0.43, h * 0.54, '#ece2c8', { f: F.fraunces, w: 600, shadow: '#0e1320' });
    T(g, 'CANDLES  ·  SOAP  ·  SMALL COMFORTS', w / 2, h * 0.84, h * 0.13, '#d9c9a0', { f: F.bebas, ls: h * 0.05 });
    ICON.candle(g, h * 1.0, h * 0.5, h * 0.66, '#ece2c8'); ICON.candle(g, w - h * 1.0, h * 0.5, h * 0.66, '#ece2c8');
  },
  noodles(g, w, h) {
    board(g, w, h, '#1c1614', '#c8402f', { inset: h * 0.09 });
    T(g, 'NIGHT NOODLE', w / 2, h * 0.45, h * 0.5, '#e8553f', { f: F.archivo, ls: h * 0.04 });
    T(g, 'open late-ish', w / 2, h * 0.84, h * 0.16, '#e9d9b4', { f: F.caveat, w: 600 });
    ICON.bowl(g, h * 0.95, h * 0.5, h * 0.66, '#e9d9b4'); ICON.bowl(g, w - h * 0.95, h * 0.5, h * 0.66, '#e9d9b4');
  },
  bikes(g, w, h) {
    board(g, w, h, '#d9a82e', '#1d1b18', { inset: h * 0.09 });
    T(g, 'SPOKE & SPROCKET', w / 2, h * 0.46, h * 0.58, '#1d1b18', { f: F.bebas, ls: h * 0.07 });
    T(g, 'REPAIRS WHILE YOU WAIT  (a while)', w / 2, h * 0.84, h * 0.12, '#3a2c10', { f: F.archivo, ls: h * 0.02 });
    ICON.bike(g, h * 1.1, h * 0.5, h * 0.9, '#1d1b18'); ICON.bike(g, w - h * 1.1, h * 0.5, h * 0.9, '#1d1b18');
  },
};
const BLADE = {
  yoga: ['sun', '#c98a6a', '#fbf1df'], museum: ['star', '#2c3a36', '#e6d8b0'],
  coffee: ['cup', '#24382f', '#efe6cf'], books: ['book', '#5e1f1c', '#e0bd6e'], grocery: ['fish', '#ebe2cc', '#a8361f'], plants: ['leaf', '#e6e0cf', '#34553a'], records: ['record', '#e0723c', '#151517'],
  bakery: ['loaf', '#fbf4e6', '#b5806e'], apothecary: ['candle', '#26314a', '#ece2c8'], noodles: ['bowl', '#c8402f', '#f3e6c8'], bikes: ['bike', '#1d1b18', '#d9a82e'],
};

export function dressFronts(K, town) {
  const kit = K.kit, r = K.r;
  for (const lot of LOTS) {
    const s = lot.side, { y0, y1 } = lot, mid = (y0 + y1) / 2;
    // -- awning: striped canvas on an iron frame ---------------------------------------------------
    if (lot.awning) {
      const [c1, c2] = lot.awning, a0 = y0 + 1.5, a1 = y1 - 1.5, out = 4.4, drop = 2.0, hTop = FL + 10.6, ang = Math.atan2(drop, out), len = Math.hypot(out, drop);
      const n = Math.round((a1 - a0) / 1.5), w = (a1 - a0) / n, uc = FRONT - 0.15 - out / 2, hc = hTop - drop / 2;
      for (let i = 0; i < n; i++) {
        const v0 = a0 + i * w, c = i % 2 ? c2 : c1;
        K.box(c, s * uc - len / 2, s * uc + len / 2, hc - 0.03, hc + 0.03, -(v0 + w), -v0, { rot: [0, 0, s * ang] });
        K.box(c, s * (FRONT - 0.15 - out) - 0.03, s * (FRONT - 0.15 - out) + 0.03, hTop - drop - 0.75, hTop - drop + 0.02, -(v0 + w), -v0);          // valance
      }
      for (const v of [a0, a1]) { K.tube(PAINT.iron, [s * (FRONT - 0.1), hTop - drop - 0.1, -v], [s * (FRONT - 0.15 - out), hTop - drop - 0.05, -v], 0.04, 5); K.tube(PAINT.iron, [s * (FRONT - 0.1), hTop - drop - 0.1, -v], [s * (FRONT - 0.1), hTop, -v], 0.04, 5); }
    }
    // -- lamps over the name: three goosenecks ----------------------------------------------------------
    for (let i = 0; i < 3; i++) {
      const v = y0 + (y1 - y0) * (i + 0.5) / 3, h = SHOPTOP + 1.0, u = FRONT;
      const pts = [[u, h], [u - 0.9, h + 0.5], [u - 1.7, h + 0.2], [u - 1.85, h - 0.5]];
      for (let k = 0; k < pts.length - 1; k++) K.tube('c#1d1b18/0.5', [s * pts[k][0], pts[k][1], -v], [s * pts[k + 1][0], pts[k + 1][1], -v], 0.045, 5);
      K.lathe('c#1d1b18/0.5', s * (u - 1.85), h - 0.98, -v, [[0.42, 0], [0.4, 0.04], [0.16, 0.34], [0.06, 0.5], [0.01, 0.5]], 12);
      K.B.mesh('e#ffe2b4/1.7', new THREE.SphereGeometry(0.13, 8, 6).translate(s * (u - 1.85), h - 0.9, -v));
      K.glowDots.push([s * (u - 1.85), h - 0.95, -v, 1.6]);
    }
    // -- a hanging sign at the end pier ---------------------------------------------------------------------
    const bl = BLADE[lot.id];
    if (bl) {
      const v = s > 0 ? y1 - 0.65 : y0 + 0.65, h = FL + 10.2, u0 = FRONT - 0.1, u1 = FRONT - 3.3, uc = FRONT - 1.9, R = 1.05;
      K.tube('c#1d1b18/0.5', [s * u0, h + 1.45, -v], [s * u1, h + 1.45, -v], 0.05, 5); K.tube('c#1d1b18/0.5', [s * u0, h + 0.5, -v], [s * (u0 - 1.2), h + 1.45, -v], 0.035, 5);
      for (const du of [-0.6, 0.6]) K.tube('c#1d1b18/0.5', [s * (uc + du), h + 1.45, -v], [s * (uc + du), h + 1.0, -v], 0.02, 4);
      K.put('c#1d1b18/0.5', new THREE.CylinderGeometry(R + 0.06, R + 0.06, 0.1, 28).rotateX(Math.PI / 2).translate(s * uc, h, -v));
      const draw = (g, w, hh) => { disc(g, w / 2, hh / 2, w * 0.5, bl[1]); disc(g, w / 2, hh / 2, w * 0.44, null, bl[2], w * 0.02); ICON[bl[0]](g, w / 2, hh / 2, w * 0.6, bl[2], bl[1]); grain(g, w, hh, 0.04); };
      for (const q of [0, 2]) { const f = kit.fr(s * uc, v + (q === 0 ? 0.06 : -0.06), 0, q); kit.sign(f, 0, 0, h, R * 2, R * 2, draw, { cw: 192, ch: 192, round: true }); }
    }
    // -- the number by the door ----------------------------------------------------------------------------
    {
      const num = String((s > 0 ? 1 : 2) + 2 * LOTS.filter(l => l.side === s).indexOf(lot) + 10 * (s > 0 ? 1 : 1));
      const v = lot.doorV + 2.5, f = kit.fr(s * (FRONT - 0.09), v, 0, s > 0 ? 1 : 3);
      kit.sign(f, 0, 0, FL + 6.2, 0.62, 0.5, (g, w, h) => { fill(g, w, h, '#1d1b18'); T(g, num, w / 2, h * 0.55, h * 0.7, '#d9b96a', { f: F.dm }); }, { cw: 96, ch: 80 });
    }
  }
  // -- ghost signs: old painted advertisements on the bare brick end walls --------------------------------
  const ghost = (X, Y, h, q, w, tall, base, draw) => kit.sign(kit.fr(X, Y, 0, q), 0, 0, h, w, tall, (g, cw, ch) => {
    fill(g, cw, ch, base); const rr = rnd(Math.round(X * 7 + Y));
    g.save(); g.globalAlpha = 0.82; draw(g, cw, ch); g.restore();
    // the brick showing through: courses, and paint worn away in patches
    g.strokeStyle = 'rgba(40,20,14,.22)'; g.lineWidth = 1.5; for (let y = 0; y < ch; y += ch / Math.round(tall * 4.4)) { g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke(); }
    for (let i = 0; i < 90; i++) { g.fillStyle = base; g.globalAlpha = 0.25 + rr() * 0.4; g.beginPath(); g.ellipse(rr() * cw, rr() * ch, 6 + rr() * 34, 3 + rr() * 12, rr() * 3, 0, TAU); g.fill(); } g.globalAlpha = 1; grain(g, cw, ch, 0.1, 31);
  }, { cw: Math.round(w * 44), ch: Math.round(tall * 44), rough: 1 });
  const L = town.lots;
  ghost(-(FRONT + 16), L.records.y0 - 0.06, 26, 2, 19, 11, '#7d5648', (g, w, h) => { rect(g, w * 0.03, h * 0.05, w * 0.94, h * 0.9, '#1c1a1c'); ICON.record(g, w * 0.5, h * 0.3, h * 0.42, '#e9dfc6', '#1c1a1c'); T(g, 'LOW TIDE', w / 2, h * 0.63, h * 0.2, '#e9dfc6', { f: F.bebas, ls: 6 }); T(g, 'RECORDS BOUGHT, SOLD & DEFENDED', w / 2, h * 0.83, h * 0.07, '#e0723c', { f: F.bebas, ls: 2 }); });
  ghost(FRONT + 16, L.coffee.y0 - 0.06, 24, 2, 20, 9, '#9a7464', (g, w, h) => { rect(g, w * 0.03, h * 0.06, w * 0.94, h * 0.88, '#2c4638'); T(g, 'Drink', w * 0.22, h * 0.3, h * 0.2, '#efe6cf', { f: F.pacifico }); T(g, 'SLOW HAND', w * 0.6, h * 0.34, h * 0.26, '#efe6cf', { f: F.abril }); T(g, 'COFFEE', w / 2, h * 0.64, h * 0.2, '#e9c46a', { f: F.abril, ls: 10 }); T(g, '"it will be ready when it is ready"', w / 2, h * 0.85, h * 0.075, '#efe6cf', { f: F.fraunces, it: 1, w: 600 }); });
  ghost(-(FRONT + 16), L.bakery.y1 + 0.06, 24, 0, 18, 9, '#b9a38e', (g, w, h) => { rect(g, w * 0.04, h * 0.07, w * 0.92, h * 0.86, '#f1e6d2'); T(g, 'BREAD', w / 2, h * 0.3, h * 0.26, '#a8554a', { f: F.abril, ls: 8 }); T(g, '· PIES · BUNS ·', w / 2, h * 0.54, h * 0.12, '#a8554a', { f: F.bebas, ls: 5 }); T(g, 'fresh tomorrow, like always', w / 2, h * 0.78, h * 0.12, '#5a3a30', { f: F.pacifico }); });
  ghost(FRONT + 16, L.plants.y1 + 0.06, 18, 0, 20, 9, '#84604f', (g, w, h) => { rect(g, w * 0.03, h * 0.04, w * 0.94, h * 0.92, '#e2dcc8'); for (let i = 0; i < 7; i++) ICON.leaf(g, w * (0.12 + i * 0.127), h * (0.2 + (i % 2) * 0.06), h * 0.2, ['#34553a', '#5a7a55', '#7f9a6a'][i % 3]); T(g, 'frond', w / 2, h * 0.58, h * 0.3, '#34553a', { f: F.shrikhand }); T(g, 'THE LAST SHOP BEFORE THE SUNSET', w / 2, h * 0.86, h * 0.065, '#5a7a55', { f: F.bebas, ls: 3 }); });
  K.fronts = { NAMES };
}

export function frontsLife(ctx, K) {
  const { scene, animated, day, renderer } = ctx, town = K.town;
  const on = () => 1 - THREE.MathUtils.smoothstep(day.light, 0.42, 0.97);
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  // ---- the names: one sheet, one mesh, lit by their lamps after dark -------------------------------------
  {
    const PPF = 84, lots = LOTS.filter(l => NAMES[l.id]), rows = lots.map(l => ({ l, w: Math.round((l.fascia.v1 - l.fascia.v0) * PPF), h: Math.round((l.fascia.h1 - l.fascia.h0) * PPF) }));
    const CW = Math.max(...rows.map(r => r.w)) + 8, CH = rows.reduce((a, r) => a + r.h + 8, 0);
    const c = document.createElement('canvas'); c.width = CW; c.height = CH; const g = c.getContext('2d');
    let y = 4; const geos = [];
    for (const { l, w, h } of rows) {
      g.save(); g.translate(4, y); g.beginPath(); g.rect(0, 0, w, h); g.clip(); NAMES[l.id](g, w, h); g.restore();
      const f = l.fascia, geo = new THREE.PlaneGeometry(f.v1 - f.v0, f.h1 - f.h0), uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (4 + uv.getX(i) * w) / CW, 1 - (y + (1 - uv.getY(i)) * h) / CH);
      geo.rotateY(l.side > 0 ? -Math.PI / 2 : Math.PI / 2); geo.translate(l.side * (f.u - 0.03), (f.h0 + f.h1) / 2, -(f.v0 + f.v1) / 2);
      geos.push(geo); y += h + 8;
    }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75, envMapIntensity: 0.3, emissive: 0xffe2b8, emissiveMap: tex, emissiveIntensity: 0 });
    const mesh = new THREE.Mesh(ctx.mergeGeometries ? ctx.mergeGeometries(geos) : merge(geos), mat); mesh.name = 'shop names'; mesh.userData.cat = 'shop names'; mesh.receiveShadow = true; scene.add(mesh);
    animated.push(() => { mat.emissiveIntensity = 0.5 * on(); });
  }
}

function merge(list) {
  // a small local merge (positions, normals, uvs; non-indexed)
  const parts = list.map(g => g.index ? g.toNonIndexed() : g), n = parts.reduce((a, g) => a + g.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
  for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return out;
}
