import * as THREE from "three";
import {
  EffectComposer, RenderPass, EffectPass, BloomEffect,
  ChromaticAberrationEffect, VignetteEffect, NoiseEffect, BlendFunction,
} from "postprocessing";

export default class Effects {
  constructor(renderer, scene, camera) {
    this.composer = new EffectComposer(renderer, {
      frameBufferType: THREE.HalfFloatType,
      multisampling: 0,
    });
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloom = new BloomEffect({
      intensity: 1.1, luminanceThreshold: 0.12,
      luminanceSmoothing: 0.4, mipmapBlur: true, radius: 0.75,
    });
    this.chroma = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0.0006, 0.0006),
      radialModulation: true, modulationOffset: 0.25,
    });
    this.vignette = new VignetteEffect({ offset: 0.28, darkness: 0.75 });
    this.grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true });
    this.grain.blendMode.opacity.value = 0.14;
    this.composer.addPass(new EffectPass(camera, this.bloom));
    this.composer.addPass(new EffectPass(camera, this.chroma, this.vignette, this.grain));
    this.baseOffset = 0.0006;
  }

  update(scroll) {
    const kick = Math.min(Math.abs(scroll.velocity) * 0.00012, 0.004);
    const target = this.baseOffset + kick;
    const offset = this.chroma.offset;
    offset.x += (target - offset.x) * 0.1;
    offset.y = offset.x;
  }

  resize(width, height) { this.composer.setSize(width, height); }
  render(delta) { this.composer.render(delta); }
  dispose() { this.composer.dispose(); }
}