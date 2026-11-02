// PAGE TRANSITION — FRAGMENT SHADER (noise dissolve)
// A full-screen quad showing the clicked project's image. Where the "front"
// has passed, it is opaque; ahead of the front it is transparent. The front
// spreads outward from the clicked card, with fractal noise making it organic.
uniform sampler2D uTex;
uniform float uProgress;   // 0 = hidden, 1 = fully covering the screen
uniform float uTime;
uniform vec2  uRes;        // screen size in px
uniform vec2  uOrigin;     // where the dissolve starts (card centre) in UV
uniform float uTexAspect;  // artwork width / height
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
// fbm = layers of noise at doubling frequency: big blobs plus fine detail.
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main() {
  float screenAspect = uRes.x / uRes.y;

  // "Cover" fit: fill the screen with the artwork without stretching it.
  vec2 t = vUv - 0.5;
  if (screenAspect > uTexAspect) t.y *= uTexAspect / screenAspect;
  else t.x *= screenAspect / uTexAspect;
  t += 0.5;

  // Distance from the origin (aspect-corrected) mixed with noise = dissolve field.
  vec2 p = vUv - uOrigin;
  p.x *= screenAspect;
  float d = length(p) / length(vec2(screenAspect, 1.0));
  float n = fbm(vUv * vec2(screenAspect, 1.0) * 3.0 + uTime * 0.1);
  float field = d * 0.7 + n * 0.5;

  float front = uProgress * 1.35 - 0.05;
  float vis  = 1.0 - smoothstep(front - 0.12, front, field);
  float edge = smoothstep(front - 0.2, front - 0.1, field) * (1.0 - smoothstep(front - 0.1, front, field));

  vec3 img = texture2D(uTex, t).rgb * 0.55;      // darkened so text stays readable
  vec3 col = img + edge * vec3(0.33, 0.87, 0.92) * 0.9;  // cyan glow along the front
  gl_FragColor = vec4(col, vis);
}
