// ============================================================================
// PARTICLES — VERTEX SHADER
// -------------------------------------------------------------------------
// Runs once per particle, every frame, on the GPU. Its job: take the particle's
// resting position (the "attribute position") and return where it is on screen.
// Because 120,000 of these run in parallel, we can afford noise + mouse physics.
// ============================================================================

// UNIFORMS = values that are the same for every particle, set from JavaScript.
uniform float uTime;        // seconds since start
uniform vec3  uPointer;     // mouse position in WORLD space (eased in JS)
uniform float uPointerStr;  // 0..1, how strongly the mouse is pushing
uniform float uScroll;      // 0..1 page scroll progress (Lenis)
uniform float uPixelRatio;  // so points stay the same visual size on retina
uniform float uMorph;       // 0..3: which shape we're at (0 knot, 1 orb, 2 field, 3 knot)
uniform float uIntro;       // 0..1 intro progress: 0 = scattered far away, 1 = formed

// ATTRIBUTES = values that differ per particle, stored in the geometry.
attribute float aSeed;      // random 0..1, gives each particle its own personality
attribute float aSize;      // base size multiplier
attribute float aGroup;     // 0 = knot, 1 = rings, 2 = dust
attribute vec3  aPosB;      // morph target 1 (orb)
attribute vec3  aPosC;      // morph target 2 (wave field)

// VARYINGS = values handed to the fragment shader (interpolated per pixel).
varying float vAlpha;
varying float vMix;

// ---------------------------------------------------------------------------
// 3D simplex noise (Ashima Arts / Ian McEwan, MIT license).
// Returns a smooth random value in -1..1 for any 3D coordinate. Nearby inputs
// give nearby outputs, so moving through it over time = organic, flowing motion.
// --------------------------------------------------------------------------
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.zxx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
           i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xxz;
  vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Morph progress for one segment. Each particle starts slightly later than its
// neighbours (based on aSeed), so the shape change ripples through the cloud
// instead of happening everywhere at once.
float seg(float k, float seed) {
  float e = seed * 0.35;
  return smoothstep(0.0, 1.0, clamp((k - e) / 0.65, 0.0, 1.0));
}

void main() {
  vec3 pos = position;                       // the particle's resting spot on the shape

  // ---- MORPH between target shapes as the page scrolls ---------------------
  pos = mix(pos, aPosB, seg(uMorph, aSeed));          // knot  -> orb
  pos = mix(pos, aPosC, seg(uMorph - 1.0, aSeed));    // orb   -> wave field
  pos = mix(pos, position, seg(uMorph - 2.0, aSeed)); // field -> knot

  // ---- 0. INTRO: particles fly in from far away and assemble into the form ---
  // Each particle starts its journey slightly later (aSeed * 0.4) so they arrive
  // in a wave instead of all at once. Ease-out cubic = fast start, soft landing.
  float introP = clamp(uIntro * 1.4 - aSeed * 0.4, 0.0, 1.0);
  introP = 1.0 - pow(1.0 - introP, 3.0);
  pos *= mix(6.0 + aSeed * 6.0, 1.0, introP);   // scattered radius -> final radius

  // ---- 1. FLOW: push each particle along a noise field -----------------------
  // We sample noise at (position * frequency + time). Three samples with
  // different offsets give us a 3D direction, so particles swirl instead of
  // just wobbling up and down. aSeed makes each particle drift a bit differently.
  float t = uTime * 0.15;
  vec3 flow = vec3(
    snoise(pos * 0.55 + vec3(0.0, t, aSeed)),
    snoise(pos * 0.55 + vec3(t, 31.7, aSeed)),
    snoise(pos * 0.55 + vec3(17.3, 5.1, t))
  );
  // Knot and rings wander only a little so the FORM stays readable;
  // dust drifts freely. mix() blends between two values by a 0..1 factor.
  float isDust = step(1.5, aGroup);
  float amp = mix(0.08 + 0.1 * aSeed, 0.7 + 0.5 * aSeed, isDust);
  pos += flow * amp;

  // ---- 2. SLOW ROTATION of the whole cloud -----------------------------------
  float a = uTime * mix(0.12, 0.03, isDust);   // knot spins faster than the dust halo
  pos.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * pos.xz;

  // ---- 3. SCROLL: as you scroll, the shape blooms outward and twists ---------
  // smoothstep gives a gentle ease so the effect doesn't start/stop abruptly.
  float s = smoothstep(0.0, 1.0, uScroll);
  pos *= 1.0 + s * (0.5 + aSeed) * mix(0.08, 0.9, isDust); // dust drifts outward; the main form barely scales
  float twist = s * 0.6;
  pos.xy = mat2(cos(twist), -sin(twist), sin(twist), cos(twist)) * pos.xy;

  // ---- 4. MOUSE REPULSION ----------------------------------------------------
  // Vector from the mouse to this particle; closer = stronger push.
  // exp(-d²) is a smooth bell-curve falloff: 1 at the mouse, ~0 far away.
  vec3 away = pos - uPointer;
  float d2 = dot(away, away);
  float influence = exp(-d2 * 0.9) * uPointerStr;
  pos += normalize(away + 0.0001) * influence * 1.1;

  // ---- 5. PROJECT to the screen ---------------------------------------------
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);   // into camera space
  gl_Position = projectionMatrix * mv;          // into clip space

  // Point size shrinks with distance (perspective). -mv.z is distance to camera.
  gl_PointSize = aSize * uPixelRatio * (38.0 / -mv.z) * (1.0 + influence * 1.5);

  // Hand colour/alpha info to the fragment shader.
  vMix   = clamp(0.5 + 0.5 * flow.x + influence, 0.0, 1.0);
  vAlpha = (0.35 + 0.65 * aSeed) * (0.55 + influence) * introP;
}
