import * as THREE from "three";
import vertexShader from "../shaders/particles.vert.glsl?raw";
import fragmentShader from "../shaders/particles.frag.glsl?raw";

export default class Particles {
  constructor({ count, pixelRatio }) {
    const positions = new Float32Array(count * 3), seeds = new Float32Array(count), sizes = new Float32Array(count);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - i / (count - 1) * 2, ring = Math.sqrt(1 - y * y), theta = golden * i;
      const radius = 2.1 + (Math.random() - .5) * .9 + Math.pow(Math.random(), 6) * 2.5;
      positions.set([Math.cos(theta) * ring * radius, y * radius, Math.sin(theta) * ring * radius], i * 3);
      seeds[i] = Math.random(); sizes[i] = .5 + Math.random() * 1.2;
    }
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    this.geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    this.material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime:{value:0}, uPointer:{value:new THREE.Vector3(99,99,0)}, uPointerStr:{value:0}, uScroll:{value:0}, uPixelRatio:{value:pixelRatio}, uColorA:{value:new THREE.Color(0x55ddeb)}, uColorB:{value:new THREE.Color(0x8a6bff)} }
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
  }
  update(time, pointer, scroll, pixelRatio) {
    const u = this.material.uniforms;
    u.uTime.value = time; u.uPointer.value.copy(pointer.world); u.uPointerStr.value = pointer.strength;
    u.uScroll.value = scroll.smooth; u.uPixelRatio.value = pixelRatio;
  }
  dispose() { this.geometry.dispose(); this.material.dispose(); }
}