// WORK CARD — FRAGMENT SHADER
// Hover effects: slow zoom, a ripple spreading from the mouse, RGB split.
uniform sampler2D uTex;
uniform float uHover;    // 0..1 eased hover amount
uniform float uTime;
uniform float uReveal;   // 0..1 scroll-in reveal
uniform vec2  uMouse;    // mouse in card UV space
uniform float uAspect;   // card width / height
varying vec2 vUv;

void main() {
  // 1. Zoom toward the centre as you hover.
  vec2 uv = (vUv - 0.5) * (1.0 - 0.07 * uHover) + 0.5;

  // 2. Ripple: a sine wave of distance from the mouse, fading out with distance.
  //    We nudge the texture coordinates along the direction away from the mouse.
  vec2 d = vUv - uMouse;
  d.x *= uAspect;                       // make distances circular, not stretched
  float dist = length(d);
  float wave = sin(dist * 38.0 - uTime * 4.5) * exp(-dist * 4.5) * uHover;
  uv += normalize(d + 1e-5) * wave * 0.014;

  // 3. Chromatic split: sample R and B at slightly different positions.
  float s = 0.0045 * uHover * (0.4 + exp(-dist * 3.0));
  vec3 col = vec3(
    texture2D(uTex, uv + vec2(s, 0.0)).r,
    texture2D(uTex, uv).g,
    texture2D(uTex, uv - vec2(s, 0.0)).b
  );
  col *= 0.88 + 0.22 * uHover;          // brighten a little on hover

  // 4. Reveal: soft wipe from the top down as the card scrolls into view.
  float a = 1.0 - uReveal * 1.3;
  float mask = smoothstep(a, a + 0.3, vUv.y);

  gl_FragColor = vec4(col, mask);
}
