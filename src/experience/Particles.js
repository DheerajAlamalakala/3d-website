import * as THREE from "three";
import vertexShader from "../shaders/particles.vert.glsl?raw";
import fragmentShader from "../shaders/particles.frag.glsl?raw";

export default class Particles {
  constructor({ count, pixelRatio }) {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const groups = new Float32Array(count);
    const knotCount = Math.floor(count * 0.5);
    const ringCount = Math.floor(count * 0.15);
    const v = new THREE.Vector3();
    const e = new THREE.Euler();
    const randomUnit = (out) => {
      const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u);
      return out.set(r * Math.cos(a), u, r * Math.sin(a));
    };
    for (let i = 0; i < count; i++) {
      const o = new THREE.Vector3();
      let group, size;
      if (i < knotCount) {
        group = 0;
        const t = Math.random() * Math.PI * 2, r = Math.cos(3 * t) + 2;
        o.set(r * Math.cos(2 * t), r * Math.sin(2 * t), -Math.sin(3 * t)).multiplyScalar(0.95);
        o.add(randomUnit(v).multiplyScalar(0.3 * Math.pow(Math.random(), 0.6)));
        size = 0.6 + Math.random() * 0.9;
      } else if (i < knotCount + ringCount) {
        group = 1;
        const a = Math.random() * Math.PI * 2, big = i % 2 === 0, R = big ? 3.9 : 3.2;
        o.set(Math.cos(a) * R, Math.sin(a) * R, 0);
        o.add(randomUnit(v).multiplyScalar(0.05 * Math.random()));
        e.set(big ? 1.15 : 0.35, big ? 0.3 : 1.2, big ? 0.2 : -0.6);
        o.applyEuler(e);
        size = 0.5 + Math.random() * 0.6;
      } else {
        group = 2;
        const radius = 3.5 + Math.pow(Math.random(), 0.7) * 7;
        o.copy(randomUnit(v)).multiplyScalar(radius);
        o.z *= 0.8;
        size = 0.4 + Math.random() * 0.7;
      }
      positions.set([o.x, o.y, o.z], i * 3);
      seeds[i] = Math.random(); sizes[i] = size; groups[i] = group;
    }
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    this.geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute("aGroup", new THREE.BufferAttribute(groups, 1));
    this.material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uPointer: { value: new THREE.Vector3(99, 99, 0) },
        uPointerStr: { value: 0 }, uScroll: { value: 0 }, uPixelRatio: { value: pixelRatio },
        uColorA: { value: new THREE.Color(0x55ddeb) }, uColorB: { value: new THREE.Color(0x8a6bff) },
      },
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
  }

  update(time, pointer, scroll, pixelRatio) {
    const u = this.material.uniforms;
    u.uTime.value = time; u.uPointer.value.copy(pointer.world);
    u.uPointerStr.value = pointer.strength; u.uScroll.value = scroll.smooth;
    u.uPixelRatio.value = pixelRatio;
  }

  dispose() { this.geometry.dispose(); this.material.dispose(); }
}