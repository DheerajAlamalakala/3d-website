// WORK CARD — VERTEX SHADER
// The plane is a unit square scaled to the DOM card's pixel size (see Cards.js).
uniform float uVel;   // scroll speed, used to gently bend the card while scrolling
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 p = position;
  // Bend: the middle of the card lifts while scrolling fast, edges stay put.
  // (1 - x²) is 1 at the centre and 0 at the left/right edges.
  float x = uv.x * 2.0 - 1.0;
  p.y += (1.0 - x * x) * uVel * 0.0007;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
