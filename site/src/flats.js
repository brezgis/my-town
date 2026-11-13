// The flats over the shops: what you can see of each room from the street. town.upWindows lists every
// upstairs window ({ x, y, z (world centre of the pane), w, h, side (+1 north, -1 south), lot }).
// flatsLife(ctx, K) is called once the scene exists.

import * as THREE from 'three';
import { T, F, fill, grain, disc, rect, rrect, line, poly, glow, ICON, rnd, TAU } from './draw.js';

// ---- flats upstairs: what you can see of a room from the street -----------------------------------------
const FLATS = [
  (g, w, h) => {                                                // curtains half drawn, a pendant shade
    fill(g, w, h, '#e9b06a'); const gr = g.createRadialGradient(w / 2, h * 0.2, 4, w / 2, h * 0.3, h * 0.8); gr.addColorStop(0, '#ffe2a8'); gr.addColorStop(1, '#b8743a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    poly(g, [[w * 0.42, h * 0.02], [w * 0.58, h * 0.02], [w * 0.66, h * 0.2], [w * 0.34, h * 0.2]], '#fff2cf'); rect(g, w * 0.49, 0, w * 0.02, h * 0.04, '#5a3a1c');
    for (const k of [0, 1]) { g.fillStyle = '#8a4a34'; g.beginPath(); g.moveTo(k ? w : 0, 0); g.lineTo(k ? w * 0.72 : w * 0.28, 0); g.quadraticCurveTo(k ? w * 0.78 : w * 0.22, h * 0.6, k ? w * 0.9 : w * 0.1, h); g.lineTo(k ? w : 0, h); g.fill(); }
  },
  (g, w, h) => {                                                // a drawn linen curtain, glowing
    fill(g, w, h, '#f0c98a'); for (let x = 0; x < w; x += w / 9) { const gr = g.createLinearGradient(x, 0, x + w / 9, 0); gr.addColorStop(0, 'rgba(120,70,20,.28)'); gr.addColorStop(0.5, 'rgba(255,240,200,.2)'); gr.addColorStop(1, 'rgba(120,70,20,.28)'); g.fillStyle = gr; g.fillRect(x, 0, w / 9, h); }
  },
  (g, w, h) => {                                                // plants along the sill
    fill(g, w, h, '#eab676'); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffdf9f'); gr.addColorStop(1, '#c9853f'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rnd(5); g.strokeStyle = '#1f2a18'; g.fillStyle = '#1f2a18'; g.lineCap = 'round';
    for (const x of [0.2, 0.5, 0.8]) { rrect(g, w * x - w * 0.07, h * 0.86, w * 0.14, h * 0.14, 3, '#3a2418'); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 1.8, L = h * (0.14 + r() * 0.22); g.lineWidth = 2; g.beginPath(); g.moveTo(w * x, h * 0.86); g.quadraticCurveTo(w * x + Math.cos(a) * L * 0.4, h * 0.86 + Math.sin(a) * L * 0.9, w * x + Math.cos(a) * L, h * 0.86 + Math.sin(a) * L); g.stroke(); g.beginPath(); g.ellipse(w * x + Math.cos(a) * L, h * 0.86 + Math.sin(a) * L, w * 0.045, w * 0.025, a, 0, TAU); g.fill(); } }
  },
  (g, w, h) => {                                                // a robot watering the window box
    fill(g, w, h, '#eebc7c'); const gr = g.createRadialGradient(w * 0.7, h * 0.3, 4, w / 2, h / 2, h * 0.8); gr.addColorStop(0, '#ffe6b0'); gr.addColorStop(1, '#bf7d3d'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const c = '#2a1c14'; g.fillStyle = c; g.beginPath(); g.ellipse(w * 0.4, h * 0.56, w * 0.2, h * 0.16, 0, 0, TAU); g.fill(); rect(g, w * 0.39, h * 0.34, w * 0.02, h * 0.07, c); disc(g, w * 0.4, h * 0.33, w * 0.03, c);
    line(g, [[w * 0.58, h * 0.56], [w * 0.7, h * 0.62]], c, 4); rrect(g, w * 0.68, h * 0.58, w * 0.12, h * 0.07, 2, c); line(g, [[w * 0.8, h * 0.6], [w * 0.9, h * 0.66]], c, 3);
    for (const x of [0.72, 0.84, 0.94]) { line(g, [[w * x, h], [w * x, h * 0.82]], '#1f2a18', 2); disc(g, w * x, h * 0.8, w * 0.035, '#1f2a18'); }
  },
  (g, w, h) => {                                                // fairy lights and a paper star
    fill(g, w, h, '#c98a55'); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e9b06a'); gr.addColorStop(1, '#8a5630'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    glow(g, '#fff0b0', 8, () => { for (let i = 0; i <= 9; i++) { const x = w * (0.05 + i * 0.1), y = h * (0.08 + 0.05 * Math.sin(i * 1.3)); disc(g, x, y, 3, '#fff6c8'); } ICON.star(g, w * 0.5, h * 0.42, w * 0.34, '#ffe9a8'); });
  },
  (g, w, h) => {                                                // somebody's television
    fill(g, w, h, '#33465e'); const gr = g.createRadialGradient(w * 0.4, h * 0.8, 4, w / 2, h * 0.7, h * 0.9); gr.addColorStop(0, '#a8c8e8'); gr.addColorStop(1, '#1c2838'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    rect(g, 0, 0, w, h * 0.3, 'rgba(10,14,22,.5)'); for (let y = h * 0.04; y < h * 0.3; y += h * 0.035) rect(g, 0, y, w, 1.5, 'rgba(160,190,220,.25)');
  },
  (g, w, h) => {                                                // grow lights: someone is serious about their pothos
    fill(g, w, h, '#a8408f'); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f08ad8'); gr.addColorStop(1, '#5a2a78'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rnd(8); g.fillStyle = '#1a1020'; g.strokeStyle = '#1a1020';
    for (let i = 0; i < 9; i++) { const x = w * (0.1 + r() * 0.8), y0 = h * 0.05, L = h * (0.3 + r() * 0.5); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + L); g.stroke(); for (let y = y0 + 10; y < y0 + L; y += 12) { g.beginPath(); g.ellipse(x + (r() - 0.5) * 12, y, 6, 3.5, r() * 3, 0, TAU); g.fill(); } }
  },
  (g, w, h) => {                                                // books to the ceiling
    fill(g, w, h, '#d99a56'); const r = rnd(12);
    for (let y = 0; y < h * 0.8; y += h * 0.2) { rect(g, 0, y + h * 0.18, w, h * 0.02, '#4a2c18'); for (let x = 2; x < w - 2;) { const bw = 5 + r() * 8; rect(g, x, y + h * (0.03 + r() * 0.04), bw, h * 0.15, ['#8a3a2a', '#35506a', '#c9a45c', '#4a6a4a', '#e9dcc0', '#5a3a50'][Math.floor(r() * 6)]); x += bw + 1; } }
    rect(g, 0, 0, w, h, 'rgba(255,190,100,.22)');
  },
  (g, w, h) => {                                                // nobody home
    fill(g, w, h, '#0e1418'); const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(120,140,170,.16)'); gr.addColorStop(0.5, 'rgba(120,140,170,.02)'); gr.addColorStop(1, 'rgba(120,140,170,.1)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    rect(g, 0, 0, w, h * 0.34, 'rgba(210,205,190,.2)');
  },
];

export function buildFlats(K, town) {}

export function flatsLife(ctx, K) {
  const { scene, animated, day, renderer } = ctx, town = K.town;
  const on = () => 1 - THREE.MathUtils.smoothstep(day.light, 0.42, 0.97);
  // ---- the flats: one sheet of rooms, one mesh ----------------------------------------------------------------
  {
    const N = FLATS.length, cw = 128, ch = 224, c = document.createElement('canvas'); c.width = N * cw; c.height = ch; const g = c.getContext('2d');
    FLATS.forEach((draw, i) => { g.save(); g.translate(i * cw, 0); g.beginPath(); g.rect(0, 0, cw, ch); g.clip(); draw(g, cw, ch); g.restore(); });
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const r = rnd(2026), lit = [], dark = [];
    for (const w of town.upWindows) {
      const k = r() < 0.2 ? N - 1 : Math.floor(r() * (N - 1));
      const geo = new THREE.PlaneGeometry(w.w, w.h), uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setX(i, (k + 0.02 + uv.getX(i) * 0.96) / N);
      geo.rotateY(w.side > 0 ? -Math.PI / 2 : Math.PI / 2); geo.translate(w.x, w.y, w.z);
      (k === N - 1 ? dark : lit).push(geo);
    }
    const mk = (list, name, base) => {
      if (!list.length) return null;
      const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0x30302e, roughness: 0.25, envMapIntensity: 1.2, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: base });
      const m = new THREE.Mesh(merge(list), mat); m.name = name; m.userData.cat = 'flats'; scene.add(m); return mat;
    };
    const mLit = mk(lit, 'flats lit', 0), mDark = mk(dark, 'flats dark', 0.25);
    animated.push(() => { if (mLit) mLit.emissiveIntensity = 0.12 + 1.15 * on(); });
  }
}

function merge(list) {
  const parts = list.map(g => g.index ? g.toNonIndexed() : g), n = parts.reduce((a, g) => a + g.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
  for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return out;
}
