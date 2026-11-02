
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ArrowDown, ArrowUpRight, Menu, X, Waves } from "lucide-react";

const chapters = [
  {
    number: "01",
    label: "THE OPENING",
    title: "A new perspective\non the water.",
    body: "A new generation of intelligent marine systems begins with a different point of view."
  },
  {
    number: "02",
    label: "THE APPROACH",
    title: "Designed for\nwhat matters.",
    body: "A compact, capable platform built to move through demanding environments with purpose."
  },
  {
    number: "03",
    label: "THE DETAILS",
    title: "Every detail\nhas a purpose.",
    body: "Propulsion, sensing and control come together in one integrated marine platform."
  },
  {
    number: "04",
    label: "THE SYSTEM",
    title: "More than\na vessel.",
    body: "A modular architecture makes room for new payloads and new missions."
  },
  {
    number: "05",
    label: "THE FUTURE",
    title: "Ready for the\nnext horizon.",
    body: "Built to help people see further and understand our waterways."
  }
];

function ThreeExperience() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#071519");
    scene.fog = new THREE.FogExp2("#071519", 0.027);

    const camera = new THREE.PerspectiveCamera(
      38,
      window.innerWidth / window.innerHeight,
      0.1,
      180
    );

    camera.position.set(0, 7, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xb9e4e2, 0x14252a, 2));

    const light = new THREE.DirectionalLight(0xe9f7ee, 3.2);
    light.position.set(-7, 12, 8);
    scene.add(light);

    const rim = new THREE.PointLight(0x68d6ce, 85, 32);
    rim.position.set(7, 3, -6);
    scene.add(rim);

    const waterGeometry = new THREE.PlaneGeometry(160, 160, 100, 100);
    waterGeometry.rotateX(-Math.PI / 2);

    const waterMaterial = new THREE.MeshStandardMaterial({
      color: "#12363b",
      roughness: 0.32,
      metalness: 0.35
    });

    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = -1.35;
    scene.add(water);

    const positions = waterGeometry.attributes.position;
    const original = Float32Array.from(positions.array);

    const grid = new THREE.GridHelper(120, 70, 0x2a6666, 0x174247);
    grid.position.y = -1.31;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.18;
    scene.add(grid);

    // Create the autonomous boat.
    const boat = new THREE.Group();
    scene.add(boat);

    const hullMaterial = new THREE.MeshStandardMaterial({
      color: "#d9e1d9",
      metalness: 0.58,
      roughness: 0.28
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: "#14262a",
      metalness: 0.7,
      roughness: 0.25
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: "#c9e56f",
      metalness: 0.28,
      roughness: 0.3
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: "#3e8d91",
      metalness: 0.65,
      roughness: 0.12,
      transparent: true,
      opacity: 0.82
    });

    const orangeMaterial = new THREE.MeshStandardMaterial({
      color: "#e78b48"
    });

    function makeHull(side: number) {
      const shape = new THREE.Shape();

      shape.moveTo(-3.3, -0.72);
      shape.lineTo(2.9, -0.72);
      shape.lineTo(3.55, -0.38);
      shape.lineTo(3.1, 0.22);
      shape.lineTo(-2.85, 0.22);
      shape.lineTo(-3.45, -0.2);
      shape.closePath();

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.72,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.12,
        bevelThickness: 0.12
      });

      geometry.rotateY(Math.PI / 2);

      const mesh = new THREE.Mesh(geometry, hullMaterial);
      mesh.position.set(side * 1.05, -0.05, 0.36);
      boat.add(mesh);
    }

    makeHull(-1);
    makeHull(1);

    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.18, 1.8),
      darkMaterial
    );

    deck.position.set(0, 0.24, 0);
    boat.add(deck);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.95, 1.18),
      glassMaterial
    );

    cabin.position.set(-0.25, 0.78, 0);
    boat.add(cabin);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.14, 1.42),
      accentMaterial
    );

    roof.position.set(-0.25, 1.32, 0);
    boat.add(roof);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.05, 1.1, 10),
      darkMaterial
    );

    mast.position.set(-1.35, 1.65, 0);
    boat.add(mast);

    const sensor = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 20, 16),
      accentMaterial
    );

    sensor.position.set(-1.35, 2.22, 0);
    boat.add(sensor);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.13, 12, 40),
      orangeMaterial
    );

    ring.position.set(0.9, 0.6, 0.05);
    ring.rotation.x = Math.PI / 2;
    boat.add(ring);

    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.75, 1.35, 4),
      hullMaterial
    );

    nose.rotation.z = -Math.PI / 2;
    nose.rotation.y = Math.PI / 4;
    nose.position.set(3.1, 0.04, 0);
    boat.add(nose);

    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 5, 8),
        accentMaterial
      );

      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, 0.55, side * 0.83);
      boat.add(rail);

      const propeller = new THREE.Mesh(
        new THREE.TorusGeometry(0.38, 0.055, 10, 28),
        accentMaterial
      );

      propeller.position.set(-3.35, -0.15, side * 1.05);
      propeller.rotation.y = Math.PI / 2;
      boat.add(propeller);
    }

    // Floating technical points.
    const points = new THREE.Group();
    scene.add(points);

    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 4.8 + (i % 4) * 0.45;

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        accentMaterial
      );

      dot.position.set(
        Math.cos(angle) * radius,
        0.25 + (i % 5) * 0.32,
        Math.sin(angle) * radius
      );

      points.add(dot);
    }

    const clock = new THREE.Clock();
    let animationFrame = 0;
    let currentProgress = 0;

    const onScroll = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );

      currentProgress = THREE.MathUtils.clamp(
        window.scrollY / max,
        0,
        1
      );

      setProgress(currentProgress);
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    onScroll();

    function animate() {
      animationFrame = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const p = currentProgress;

      const smooth = (v: number) => v * v * (3 - 2 * v);

      const approach = smooth(
        THREE.MathUtils.clamp((p - 0.12) / 0.18, 0, 1)
      );

      const orbit = smooth(
        THREE.MathUtils.clamp((p - 0.28) / 0.22, 0, 1)
      );

      const detail = smooth(
        THREE.MathUtils.clamp((p - 0.5) / 0.2, 0, 1)
      );

      const pullback = smooth(
        THREE.MathUtils.clamp((p - 0.78) / 0.2, 0, 1)
      );

      boat.position.y = Math.sin(time * 1.1) * 0.055;
      boat.rotation.y = -0.22 + p * Math.PI * 1.15;
      boat.rotation.z = Math.sin(time * 0.55) * 0.012;

      boat.scale.setScalar(1 + approach * 0.12 - pullback * 0.12);

      // Exploded component animation.
      cabin.position.y = 0.78 + detail * 0.95;
      roof.position.y = 1.32 + detail * 1.35;
      mast.position.y = 1.65 + detail * 1.65;
      sensor.position.y = 2.22 + detail * 1.9;
      ring.position.y = 0.6 + detail * 0.42;

      const angle = -0.18 + orbit * Math.PI * 0.85;

      const radius =
        THREE.MathUtils.lerp(18, 11.2, approach) +
        detail * 1.5 -
        pullback * 3.5;

      const camX = Math.sin(angle) * radius;
      const camZ = Math.cos(angle) * radius;

      const camY =
        THREE.MathUtils.lerp(7.4, 4.4, approach) +
        Math.sin(p * Math.PI) * 1.4 -
        detail * 0.3 +
        pullback * 2.2;

      camera.position.lerp(
        new THREE.Vector3(camX, camY, camZ),
        0.045
      );

      camera.lookAt(0, 0.25 + detail * 0.4, 0);

      // Animate the ocean.
      for (let i = 0; i < positions.count; i++) {
        const x = original[i * 3];
        const z = original[i * 3 + 2];

        positions.setY(
          i,
          Math.sin(x * 0.11 + time * 0.7) * 0.1 +
          Math.cos(z * 0.14 + time * 0.55) * 0.075
        );
      }

      positions.needsUpdate = true;
      waterGeometry.computeVertexNormals();

      points.rotation.y = time * 0.025;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      renderer.dispose();
      waterGeometry.dispose();
      waterMaterial.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const active = Math.min(4, Math.floor(progress * 5));

  return (
    <>
      <div className="three-mount" ref={mountRef} />
      <div className="scene-vignette" />

      <div className="scene-topline">
        <span className="brand">
          <span className="brand-symbol"><Waves size={17}/></span>
          AQUAVANT<span className="lime">.</span>
        </span>

        <span className="top-tag">AUTONOMOUS MARINE SYSTEMS</span>
        <span className="top-index">FIELD NOTES / 2026</span>
      </div>

      <div className="scene-hud">
        <span>SCROLL TO EXPLORE</span>
        <div className="hud-track">
          <i style={{ transform: `scaleX(${progress})` }} />
        </div>
        <span>{String(Math.round(progress * 100)).padStart(2, "0")}%</span>
      </div>

      <div className="chapter-copy" key={active}>
        <div className="chapter-kicker">
          <span>{chapters[active].number}</span>
          <i />
          {chapters[active].label}
        </div>

        <h1>
          {chapters[active].title.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i === 0 && <br />}
            </span>
          ))}
        </h1>

        <p>{chapters[active].body}</p>

        {active === 0 && (
          <a className="scroll-cta" href="#story">
            Discover the platform <ArrowDown size={15}/>
          </a>
        )}
      </div>

      <div className="chapter-nav">
        {chapters.map((chapter, i) => (
          <a
            key={chapter.number}
            className={active === i ? "active" : ""}
            href={`#story`}
            aria-label={chapter.label}
          >
            <span>{chapter.number}</span>
          </a>
        ))}
      </div>
    </>
  );
}

export default function Home() {
  const [menu, setMenu] = useState(false);

  return (
    <main>
      <nav className="nav">
        <a href="#top" className="nav-brand">
          <span className="brand-symbol"><Waves size={17}/></span>
          AQUAVANT<span className="lime">.</span>
        </a>

        <div className="nav-right">
          <a href="#story">THE PLATFORM</a>
          <a href="#engineering">ENGINEERING</a>
          <a href="#contact">CONTACT <ArrowUpRight size={13}/></a>
        </div>

        <button
          className="mobile-menu"
          onClick={() => setMenu(!menu)}
          aria-label="Toggle menu"
        >
          {menu ? <X/> : <Menu/>}
        </button>

        {menu && (
          <div className="mobile-panel">
            <a onClick={() => setMenu(false)} href="#story">The platform</a>
            <a onClick={() => setMenu(false)} href="#engineering">Engineering</a>
            <a onClick={() => setMenu(false)} href="#contact">Contact</a>
          </div>
        )}
      </nav>

      <section className="experience" id="top">
        <ThreeExperience/>
      </section>

      <section className="story-section" id="story">
        <div className="story-image"/>

        <div className="story-copy">
          <span className="eyebrow">THE PLATFORM / 01</span>

          <h2>
            Small craft.<br/>
            <em>Big purpose.</em>
          </h2>

          <p>
            AQUAVANT is a fictional marine robotics concept exploring
            how autonomous systems can support safer, smarter
            operations on the water.
          </p>

          <span className="story-foot">
            BUILT FOR THE UNPREDICTABLE ↗
          </span>
        </div>
      </section>

      <section className="engineering" id="engineering">
        <div className="engineering-head">
          <span className="eyebrow">ENGINEERING / 02</span>

          <h2>
            One system.<br/>
            <em>Many possibilities.</em>
          </h2>
        </div>

        <div className="spec-grid">
          <article>
            <span>01 / PROPULSION</span>
            <h3>Precision movement</h3>
            <p>
              Twin propulsion units offer responsive maneuvering
              and a compact footprint.
            </p>
          </article>

          <article>
            <span>02 / PERCEPTION</span>
            <h3>Awareness by design</h3>
            <p>
              A modular sensor mast provides a foundation for
              navigation and situational awareness.
            </p>
          </article>

          <article>
            <span>03 / ARCHITECTURE</span>
            <h3>Mission adaptable</h3>
            <p>
              A configurable deck supports payloads and
              equipment for different use cases.
            </p>
          </article>
        </div>
      </section>

      <footer id="contact">
        <div>
          <span className="eyebrow">THE NEXT HORIZON</span>

          <h2>
            Let's move<br/>
            <em>forward.</em>
          </h2>
        </div>

        <a className="footer-contact" href="mailto:hello@aquavant.example">
          Start a conversation <ArrowUpRight size={17}/>
        </a>

        <div className="footer-bottom">
          <span>AQUAVANT © 2026 — CONCEPT PROJECT</span>
          <a href="#top">BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>
  );
        }
