"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export default function World() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      host.dataset.fallback = "true";
      return;
    }

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = matchMedia("(max-width: 700px)").matches;
    const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.7);
    renderer.setPixelRatio(dpr);
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x05070a, 1);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.035);
    const camera = new THREE.PerspectiveCamera(34, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 0, mobile ? 10.8 : 8.6);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose());
    });

    const rig = new THREE.Group();
    scene.add(rig);
    const chrome = new THREE.MeshPhysicalMaterial({
      color: 0xd9e0e7, metalness: 1, roughness: 0.115, clearcoat: 1,
      clearcoatRoughness: 0.035, iridescence: 1, iridescenceIOR: 1.42,
      iridescenceThicknessRange: [250, 950], envMapIntensity: 2.8,
    });
    const obsidian = new THREE.MeshPhysicalMaterial({
      color: 0x202b35, metalness: 0.96, roughness: 0.18, clearcoat: 1,
      clearcoatRoughness: 0.04, envMapIntensity: 2.5,
    });
    const prism = new THREE.MeshPhysicalMaterial({
      color: 0x9cebf0, metalness: 0.88, roughness: 0.1, clearcoat: 1,
      iridescence: 1, iridescenceThicknessRange: [300, 1000], envMapIntensity: 3,
      emissive: 0x062b36, emissiveIntensity: 0.18,
    });

    const sculpture = new THREE.Group();
    rig.add(sculpture);
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.02, 0.22, 420, 36, 2, 5), chrome);
    knot.rotation.set(0.3, 0.2, -0.25);
    sculpture.add(knot);
    const inner = new THREE.Mesh(new THREE.TorusKnotGeometry(0.57, 0.095, 300, 24, 3, 7), obsidian);
    inner.rotation.set(1.05, 0.25, 0.6);
    sculpture.add(inner);
    const nucleus = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 4), prism);
    sculpture.add(nucleus);

    const hoops = [
      new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.018, 12, 320), chrome),
      new THREE.Mesh(new THREE.TorusGeometry(1.92, 0.012, 10, 320), prism),
      new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.012, 10, 280), obsidian),
    ];
    hoops[0].rotation.set(1.1, 0.3, 0.4);
    hoops[1].rotation.set(0.2, 1.2, 0.8);
    hoops[2].rotation.set(1.3, 0.8, 1.7);
    hoops.forEach((h) => sculpture.add(h));

    const createRibbon = (phase: number, material: THREE.Material, radius: number, thickness: number) => {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i < 520; i++) {
        const t = (i / 519) * Math.PI * 2;
        const r = radius + 0.38 * Math.sin(t * 3 + phase);
        points.push(new THREE.Vector3(
          Math.cos(t * 1.13 + phase) * r,
          Math.sin(t * 2 + phase) * 0.86,
          Math.sin(t * 1.13 + phase) * r,
        ));
      }
      return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 680, thickness, 10, false), material);
    };
    const ribbons = [
      createRibbon(0.2, prism, 1.42, 0.018),
      createRibbon(2.1, chrome, 1.55, 0.026),
      createRibbon(4.2, obsidian, 1.38, 0.04),
    ];
    ribbons.forEach((r) => sculpture.add(r));

    // A field of fine metallic dust, animated on the GPU.
    const particleCount = mobile ? 2200 : 7600;
    const positions = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const radius = 2.2 + Math.random() * 7.5;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 1;
      seeds[i] = Math.random() * Math.PI * 2;
      sizes[i] = 0.5 + Math.random() * 1.8;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPointer: { value: new THREE.Vector2() }, uScroll: { value: 0 } },
      vertexShader: `
        attribute float aSeed; attribute float aSize;
        uniform float uTime; uniform vec2 uPointer; uniform float uScroll;
        varying float vAlpha;
        void main(){
          vec3 p=position;
          float t=uTime*(0.025+aSeed*0.006)+aSeed;
          p.xz=mat2(cos(t),-sin(t),sin(t),cos(t))*p.xz;
          p.y+=sin(uTime*.22+aSeed*8.0)*.18;
          vec2 delta=p.xy-uPointer*vec2(3.0,2.6);
          float influence=exp(-dot(delta,delta)*.22);
          p.xy+=normalize(delta+vec2(.0001))*influence*.48;
          p+=normalize(p+vec3(.001))*sin(uScroll*6.283+aSeed)*.18;
          vec4 mv=modelViewMatrix*vec4(p,1.0);
          gl_Position=projectionMatrix*mv;
          gl_PointSize=clamp(aSize*(30.0/-mv.z),.7,7.0);
          vAlpha=(.12+influence*.48)*clamp((17.0+mv.z)/17.0,0.0,1.0);
        }`,
      fragmentShader: `
        varying float vAlpha;
        void main(){
          float d=length(gl_PointCoord-.5);
          float a=(1.0-smoothstep(.08,.5,d))*vAlpha;
          if(a<.01) discard;
          gl_FragColor=vec4(.63,.78,.83,a);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const lightA = new THREE.PointLight(0x8de5eb, 125, 16);
    lightA.position.set(-3, 2, 3);
    const lightB = new THREE.PointLight(0xb8a2ff, 155, 17);
    lightB.position.set(3, -1, 2);
    const lightC = new THREE.PointLight(0xffc8a5, 80, 12);
    lightC.position.set(0, 4, -3);
    scene.add(lightA, lightB, lightC, new THREE.AmbientLight(0x8b9ba8, 0.36));

    // Distant architectural light rails give the composition scale and depth.
    const railMaterial = new THREE.MeshBasicMaterial({ color: 0x9ccbd0, transparent: true, opacity: 0.23 });
    const rails = new THREE.Group();
    for (let i = 0; i < 22; i++) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 8 + Math.random() * 8, 5), railMaterial);
      const a = (i / 22) * Math.PI * 2;
      rail.position.set(Math.cos(a) * (4.5 + Math.random() * 2), (Math.random() - 0.5) * 2, -2 - Math.random() * 4);
      rail.rotation.z = (Math.random() - 0.5) * 0.16;
      rails.add(rail);
    }
    scene.add(rails);

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    let scrollTarget = 0;
    let scroll = 0;
    let time = 0;
    const clock = new THREE.Clock();
    const onPointer = (e: PointerEvent) => {
      pointerTarget.set((e.clientX / innerWidth - 0.5) * 2, (0.5 - e.clientY / innerHeight) * 2);
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      scrollTarget = scrollY / max;
    };
    const resize = () => {
      const w = host.clientWidth || innerWidth;
      const h = host.clientHeight || innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.7));
      renderer.setSize(w, h);
    };
    addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", resize);
    onScroll();

    let frame = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(host);
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!visible || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.04);
      time += dt;
      pointer.lerp(pointerTarget, 0.055);
      scroll += (scrollTarget - scroll) * 0.055;
      const chapter = scroll * 4;
      particleMaterial.uniforms.uTime.value = time;
      particleMaterial.uniforms.uPointer.value.copy(pointer);
      particleMaterial.uniforms.uScroll.value = scroll;
      sculpture.rotation.set(
        Math.sin(time * 0.15) * 0.08 + pointer.y * 0.09,
        time * 0.075 + pointer.x * 0.12 + scroll * 4.3,
        Math.sin(time * 0.12) * 0.05,
      );
      sculpture.scale.setScalar(1 + Math.sin(time * 0.45) * 0.012 + Math.sin(chapter * Math.PI) * 0.055);
      nucleus.rotation.set(time * 0.17, -time * 0.2, time * 0.1);
      hoops[0].rotation.z += dt * 0.035;
      hoops[1].rotation.x += dt * 0.025;
      hoops[2].rotation.y -= dt * 0.03;
      ribbons[0].rotation.y = time * 0.045;
      ribbons[1].rotation.x = -time * 0.04;
      ribbons[2].rotation.z = time * 0.025;
      rig.position.x = (mobile ? 0.45 : 1.25) - Math.sin(scroll * Math.PI) * (mobile ? 0.3 : 1.15);
      rig.position.y = Math.sin(scroll * Math.PI * 2) * 0.16;
      rig.scale.setScalar(mobile ? 0.68 : 0.92);
      camera.position.x += (pointer.x * 0.2 - camera.position.x) * 0.018;
      camera.position.y += (pointer.y * 0.15 - camera.position.y) * 0.018;
      camera.position.z = (mobile ? 10.8 : 8.6) - Math.sin(scroll * Math.PI) * 0.65;
      camera.lookAt(0, 0, 0);
      rails.rotation.y = time * 0.012;
      renderer.render(scene, camera);
    };
    if (reduced) renderer.render(scene, camera);
    else animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener("pointermove", onPointer);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", resize);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => m.dispose());
      });
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mount} className="world" aria-hidden="true" />;
}
