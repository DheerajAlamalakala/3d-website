import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { makeArtwork } from "../utils/artwork.js";
import vertexShader from "../shaders/card.vert.glsl?raw";
import fragmentShader from "../shaders/card.frag.glsl?raw";

gsap.registerPlugin(ScrollTrigger);

// WebGL planes that sit exactly on top of the transparent DOM cards.
// DOM handles layout, accessibility and clicks; WebGL handles the pixels.
// Each frame we copy the DOM rectangle onto the plane (position + scale).
export default class Cards {
  constructor(scene) {
    this.onOpen = null;
    this.geometry = new THREE.PlaneGeometry(1, 1, 24, 1);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.items = Array.from(document.querySelectorAll(".work-card")).map((el, i) => {
      const texture = makeArtwork(i);
      const material = new THREE.ShaderMaterial({
        vertexShader, fragmentShader, transparent: true, depthTest: false, depthWrite: false,
        uniforms: {
          uTex: { value: texture }, uHover: { value: 0 }, uTime: { value: 0 },
          uReveal: { value: reduced ? 1 : 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uAspect: { value: 4 / 3 }, uVel: { value: 0 },
        },
      });
      const mesh = new THREE.Mesh(this.geometry, material);
      mesh.visible = false;
      scene.add(mesh);

      const item = { el, media: el.querySelector(".card-media"), texture, material, mesh, hover: 0 };

      el.addEventListener("pointerenter", () => (item.hover = 1));
      el.addEventListener("pointerleave", () => (item.hover = 0));
      el.addEventListener("pointermove", (e) => {
        const r = item.media.getBoundingClientRect();
        material.uniforms.uMouse.value.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      });
      const open = () => {
        const r = item.media.getBoundingClientRect();
        this.onOpen?.(i, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      };
      el.addEventListener("click", open);
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });

      // Reveal when scrolled into view: image wipes in, caption rises.
      if (!reduced) {
        const meta = el.querySelector(".card-meta");
        gsap.set(meta, { y: 24, opacity: 0 });
        ScrollTrigger.create({
          trigger: el, start: "top 88%", once: true,
          onEnter: () => {
            gsap.to(material.uniforms.uReveal, { value: 1, duration: 1.6, ease: "power3.inOut" });
            gsap.to(meta, { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: "power3.out" });
          },
        });
      }
      return item;
    });
    this.textures = this.items.map((it) => it.texture);
  }

  update(time, delta, velocity) {
    const vel = THREE.MathUtils.clamp(velocity, -60, 60);
    for (const it of this.items) {
      const r = it.media.getBoundingClientRect();
      const visible = r.width > 0 && r.bottom > -150 && r.top < innerHeight + 150;
      it.mesh.visible = visible;
      if (!visible) continue;
      // DOM coords (origin top-left, y down) -> scene coords (origin centre, y up)
      it.mesh.position.set(r.left + r.width / 2 - innerWidth / 2, -(r.top + r.height / 2 - innerHeight / 2), 0);
      it.mesh.scale.set(r.width, r.height, 1);
      const u = it.material.uniforms;
      u.uTime.value = time;
      u.uAspect.value = r.width / r.height;
      u.uVel.value = vel;
      u.uHover.value += (it.hover - u.uHover.value) * (1 - Math.exp(-6 * delta));
    }
  }

  dispose() {
    this.geometry.dispose();
    this.items.forEach((it) => { it.material.dispose(); it.texture.dispose(); });
  }
}
