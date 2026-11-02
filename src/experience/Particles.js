import * as THREE from "three";
import vertexShader from "../shaders/particles.vert.glsl?raw";
import fragmentShader from "../shaders/particles.frag.glsl?raw";

// A cloud of GPU-animated points arranged on a shell (a "fibonacci sphere").
// JavaScript only builds the points ONCE. All motion happens in the shaders.
export default class Particles {
  constructor({ count, pixelRatio }) {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const groups = new Float32Array(count); // 0 = knot, 1 = rings, 2 = dust
    // Extra target shapes for the knot particles. As you scroll they morph
    // knot -> orb -> wave field -> knot. Other groups keep B = C = position.
    const posB = new Float32Array(count * 3);
    const posC = new Float32Array(count * 3);
    const tiltC = new THREE.Euler(-0.75, 0.0, 0.12);

    // Instead of one uniform ball, we compose a FORM: a glowing torus-knot
    // ribbon (the hero shape), two tilted orbit rings, and a sparse dust halo.
    // Variety in density is what makes a 3D object read as designed, not random.
    const knotCount = Math.floor(count * 0.5);
    const ringCount = Math.floor(count * 0.15);
    const v = new THREE.Vector3();
    const e = new THREE.Euler();

    const randomUnit = (out) => {
      // Uniform random direction on a sphere.
      const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u);
      return out.set(r * Math.cos(a), u, r * Math.sin(a));
    };

    for (let i = 0; i < count; i++) {
      const o = new THREE.Vector3();
      const ob = new THREE.Vector3();
      const oc = new THREE.Vector3();
      let group, size;
      if (i < knotCount) {
        // (2,3) torus knot curve, then scatter points in a thin tube around it.
        group = 0;
        const t = Math.random() * Math.PI * 2;
        const r = Math.cos(3 * t) + 2;
        o.set(r * Math.cos(2 * t), r * Math.sin(2 * t), -Math.sin(3 * t)).multiplyScalar(0.95);
        // pow(random, 0.6) packs more points toward the tube's core = bright spine.
        o.add(randomUnit(v).multiplyScalar(0.3 * Math.pow(Math.random(), 0.6)));
        size = 0.6 + Math.random() * 0.9;
        // Shape B: a thin spherical shell (an "orb").
        ob.copy(randomUnit(v)).multiplyScalar(2.5 + (Math.random() - 0.5) * 0.18);
        // Shape C: a rolling wave surface, tilted toward the camera.
        const wx = (Math.random() - 0.5) * 12, wz = (Math.random() - 0.5) * 8;
        oc.set(wx, Math.sin(wx * 0.9) * Math.cos(wz * 0.9) * 0.75 + (Math.random() - 0.5) * 0.04, wz).applyEuler(tiltC);
      } else if (i < knotCount + ringCount) {
        // Two thin circles at different tilts, like orbits around the knot.
        group = 1;
        const a = Math.random() * Math.PI * 2;
        const big = i % 2 === 0;
        const R = big ? 3.9 : 3.2;
        o.set(Math.cos(a) * R, Math.sin(a) * R, 0);
        o.add(randomUnit(v).multiplyScalar(0.05 * Math.random()));
        e.set(big ? 1.15 : 0.35, big ? 0.3 : 1.2, big ? 0.2 : -0.6);
        o.applyEuler(e);
        size = 0.5 + Math.random() * 0.6;
      } else {
        // Sparse dust filling space; gives depth and parallax.
        group = 2;
        const radius = 3.5 + Math.pow(Math.random(), 0.7) * 7;
        o.copy(randomUnit(v)).multiplyScalar(radius);
        o.z *= 0.8;
        size = 0.4 + Math.random() * 0.7;
      }
      if (group !== 0) { ob.copy(o); oc.copy(o); }
      posB.set([ob.x, ob.y, ob.z], i * 3);
      posC.set([oc.x, oc.y, oc.z], i * 3);
      positions[i * 3] = o.x;
      positions[i * 3 + 1] = o.y;
      positions[i * 3 + 2] = o.z;
      seeds[i] = Math.random();
      sizes[i] = size;
      groups[i] = group;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    this.geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute("aGroup", new THREE.BufferAttribute(groups, 1));
    this.geometry.setAttribute("aPosB", new THREE.BufferAttribute(posB, 3));
    this.geometry.setAttribute("aPosC", new THREE.BufferAttribute(posC, 3));

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,                 // glowing dots shouldn't hide each other
      blending: THREE.AdditiveBlending,  // overlapping dots add up to bright glow
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector3(99, 99, 0) },
        uPointerStr: { value: 0 },
        uScroll: { value: 0 },
        uIntro: { value: 0 },
        uMorph: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uColorA: { value: new THREE.Color(0x55ddeb) },
        uColorB: { value: new THREE.Color(0x8a6bff) },
      },
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false; // vertex shader moves points; skip bounding-box culling
  }

  update(time, pointer, scroll, pixelRatio, intro = 1) {
    const u = this.material.uniforms;
    u.uTime.value = time;
    u.uPointer.value.copy(pointer.world);
    u.uPointerStr.value = pointer.strength;
    u.uScroll.value = scroll.smooth;
    u.uPixelRatio.value = pixelRatio;
    u.uIntro.value = intro;
    u.uMorph.value = scroll.morph;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
