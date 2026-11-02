import * as THREE from "three";
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  ChromaticAberrationEffect,
  VignetteEffect,
  NoiseEffect,
  BlendFunction,
} from "postprocessing";

// POST-PROCESSING = effects applied to the finished image, like Instagram filters
// for each frame. Flow: scene -> render to a hidden texture -> run it through a
// chain of full-screen shaders -> show the result on the canvas.
//
// Chain:  RenderPass -> Bloom -> (Chromatic aberration + Vignette + Film grain)
export default class Effects {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;

    // HalfFloat = 16-bit colour buffer. Needed so bright glow values can exceed
    // 1.0 and "bleed" in bloom instead of being clipped to white.
    this.composer = new EffectComposer(renderer, {
      frameBufferType: THREE.HalfFloatType,
      multisampling: 0, // MSAA is wasted on glowing points; skipping it saves GPU time
    });
    this.composer.addPass(new RenderPass(scene, camera));

    // BLOOM: finds bright pixels, blurs them at many scales, adds them back.
    // That's the soft halo around glowing things.
    this.bloom = new BloomEffect({
      intensity: 1.1,            // strength of the glow
      luminanceThreshold: 0.12,  // only pixels brighter than this glow
      luminanceSmoothing: 0.4,   // softens the cut-off
      mipmapBlur: true,          // multi-scale blur: smooth, cheap, cinematic
      radius: 0.75,              // how far the glow spreads
    });

    // CHROMATIC ABERRATION: splits R, G, B channels apart slightly, like a cheap
    // lens. radialModulation keeps the centre sharp and the edges fringed.
    this.chroma = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0.0006, 0.0006),
      radialModulation: true,
      modulationOffset: 0.25,
    });

    // VIGNETTE: darkens the corners so the eye is pulled to the centre.
    this.vignette = new VignetteEffect({ offset: 0.28, darkness: 0.75 });

    // FILM GRAIN: faint animated noise. It hides colour banding in dark
    // gradients and gives the image a tactile, filmic texture.
    this.grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true });
    this.grain.blendMode.opacity.value = 0.14;

    // Convolution effects (ones that sample neighbouring pixels) are best kept in
    // separate passes from each other, so bloom gets its own.
    this.composer.addPass(new EffectPass(camera, this.bloom));
    this.composer.addPass(new EffectPass(camera, this.chroma, this.vignette, this.grain));

    this.baseOffset = 0.0006;
  }

  // Scroll speed makes the colour fringing kick in: fast scroll = more aberration.
  // This tiny link between input and image is a big part of the "alive" feel.
  update(scroll) {
    const kick = Math.min(Math.abs(scroll.velocity) * 0.00012, 0.004);
    const target = this.baseOffset + kick;
    const o = this.chroma.offset;
    o.x += (target - o.x) * 0.1;
    o.y = o.x;
  }

  resize(width, height) {
    this.composer.setSize(width, height);
  }

  render(delta) {
    this.composer.render(delta);
  }

  dispose() {
    this.composer.dispose();
  }
}
