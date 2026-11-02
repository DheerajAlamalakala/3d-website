import * as THREE from "three";
import gsap from "gsap";
import fragmentShader from "../shaders/transition.frag.glsl?raw";

const vertexShader = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

// Full-screen dissolve overlay that shows a project's artwork.
export default class Transition {
  constructor(scene) {
    this.material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, transparent: true, depthTest: false, depthWrite: false,
      uniforms: {
        uTex: { value: null }, uProgress: { value: 0 }, uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) }, uOrigin: { value: new THREE.Vector2(0.5, 0.5) },
        uTexAspect: { value: 4 / 3 },
      },
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material);
    this.mesh.renderOrder = 10;
    this.mesh.visible = false;
    scene.add(this.mesh);
  }

  resize(w, h) {
    this.mesh.scale.set(w, h, 1);
    this.material.uniforms.uRes.value.set(w, h);
  }

  update(time) {
    this.material.uniforms.uTime.value = time;
    this.mesh.visible = this.material.uniforms.uProgress.value > 0.001;
  }

  open(texture, originPx) {
    const u = this.material.uniforms;
    u.uTex.value = texture;
    u.uOrigin.value.set(originPx.x / innerWidth, 1 - originPx.y / innerHeight);
    return gsap.to(u.uProgress, { value: 1, duration: 1.4, ease: "power3.inOut" }).then();
  }

  close() {
    return gsap.to(this.material.uniforms.uProgress, { value: 0, duration: 1.1, ease: "power3.inOut" }).then();
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
