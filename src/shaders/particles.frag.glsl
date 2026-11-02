// ============================================================================
// PARTICLES — FRAGMENT SHADER
// ----------------------------------------------------------------------------
// Runs once per PIXEL covered by each point sprite. By default a point is a hard
// square; here we turn it into a soft glowing dot and colour it.
// ============================================================================

uniform vec3 uColorA;   // cool colour (cyan)
uniform vec3 uColorB;   // warm colour (violet)

varying float vAlpha;
varying float vMix;

void main() {
  // gl_PointCoord is (0,0) at the sprite's top-left and (1,1) at bottom-right.
  // Subtracting 0.5 puts the origin at the centre; length() = distance from it.
  float d = length(gl_PointCoord - 0.5);

  // Discard pixels outside the circle so we get a round dot, not a square.
  if (d > 0.5) discard;

  // Soft edge: 1.0 in the middle fading to 0.0 at the rim.
  float glow = 1.0 - smoothstep(0.0, 0.5, d);
  glow = pow(glow, 1.8);                    // sharpen the falloff into a bright core

  vec3 color = mix(uColorA, uColorB, vMix); // blend cyan→violet using the noise value

  // Additive blending (set in JS) means overlapping dots ADD brightness,
  // which is what makes dense areas glow.
  gl_FragColor = vec4(color, glow * vAlpha);
}
