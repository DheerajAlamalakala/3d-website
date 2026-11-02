import * as THREE from "three";

// Procedural artwork so the cards work with zero image files.
// Swap makeArtwork() for a TextureLoader later to use real project images.
const THEMES = [
  { bg: "#050a14", a: "#55ddeb", b: "#8a6bff" },
  { bg: "#120805", a: "#ff9a3c", b: "#ff3c5a" },
  { bg: "#07071a", a: "#2f6bff", b: "#ff4fd8" },
  { bg: "#041210", a: "#5dffb0", b: "#2fd1ff" },
];

// Small seeded random generator: same index = same artwork every load.
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};

export function makeArtwork(index) {
  const w = 1024, h = 768;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  const r = rng(index * 977 + 13);
  const th = THEMES[index % THEMES.length];

  ctx.fillStyle = th.bg; ctx.fillRect(0, 0, w, h);

  // Soft glow blobs (additive so overlaps brighten, like the 3D scene).
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 4; i++) {
    const x = r() * w, y = r() * h, rad = 200 + r() * 340;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, rgba(i % 2 ? th.a : th.b, 0.5));
    g.addColorStop(1, rgba(th.bg, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  // Concentric arc fragments around a focal point.
  const cx = w * (0.35 + r() * 0.3), cy = h * (0.35 + r() * 0.3);
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 46; i++) {
    const rad = 30 + i * 11 + r() * 8, s = r() * Math.PI * 2, len = 0.4 + r() * 2.6;
    ctx.strokeStyle = rgba(i % 3 ? th.a : th.b, 0.12 + r() * 0.4);
    ctx.beginPath(); ctx.arc(cx, cy, rad, s, s + len); ctx.stroke();
  }

  // Fine dust.
  for (let i = 0; i < 700; i++) {
    ctx.fillStyle = rgba(r() > 0.5 ? th.a : "#ffffff", r() * 0.6);
    ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
  }

  // Vignette.
  ctx.globalCompositeOperation = "source-over";
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.9);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.65)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}
