
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
        <a href="#top" className="nav-brand" aria-label="AQUAVANT home">
          <span className="brand-symbol"><Waves size={17}/></span>
          AQUAVANT<span className="lime">.</span>
        </a>
        <div className="nav-right">
          <a href="#platform">PLATFORM</a>
          <a href="#capabilities">CAPABILITIES</a>
          <a href="#manifesto">OUR THINKING</a>
          <a className="nav-contact" href="#contact">LET'S TALK <ArrowUpRight size={13}/></a>
        </div>
        <button className="mobile-menu" onClick={() => setMenu(!menu)} aria-label="Toggle menu">
          {menu ? <X/> : <Menu/>}
        </button>
        {menu && <div className="mobile-panel">
          <a onClick={() => setMenu(false)} href="#platform">Platform</a>
          <a onClick={() => setMenu(false)} href="#capabilities">Capabilities</a>
          <a onClick={() => setMenu(false)} href="#manifesto">Our thinking</a>
          <a onClick={() => setMenu(false)} href="#contact">Contact</a>
        </div>}
      </nav>

      <section className="experience" id="top">
        <ThreeExperience/>
        <div className="hero-bottomline">
          <span>ENGINEERED FOR THE UNEXPECTED</span>
          <span className="hero-coordinate">17° 23' N&nbsp;&nbsp; 78° 29' E</span>
        </div>
        <div className="hero-side-note">AUTONOMY / INTELLIGENCE / RESPONSE</div>
      </section>

      <section className="intro-band" id="platform">
        <div className="section-meta"><span>01 — THE PLATFORM</span><span>BUILT FOR WHAT'S NEXT</span></div>
        <div className="intro-grid">
          <h2>THE WATER<br/>DOESN'T <em>WAIT.</em></h2>
          <div className="intro-text">
            <p className="intro-lead">A new perspective on marine response.</p>
            <p>AQUAVANT is a next-generation autonomous marine platform concept. A study in purposeful design, intelligent systems and the possibilities of a more responsive relationship with our waterways.</p>
            <a className="text-link" href="#capabilities">EXPLORE THE SYSTEM <ArrowUpRight size={15}/></a>
          </div>
        </div>
        <div className="intro-index">A / 001</div>
      </section>

      <section className="visual-break">
        <div className="visual-break-image" />
        <div className="visual-break-overlay" />
        <div className="visual-break-copy">
          <span>BEYOND THE SHORELINE / 02</span>
          <h2>See further.<br/><em>Respond faster.</em></h2>
          <p>Designed around awareness, adaptability and the people who depend on the water.</p>
        </div>
        <div className="visual-break-mark">AV—02</div>
      </section>

      <section className="capabilities" id="capabilities">
        <div className="section-meta dark-meta"><span>02 — SYSTEM CAPABILITIES</span><span>ONE PLATFORM / MULTIPLE MISSIONS</span></div>
        <div className="capabilities-heading">
          <h2>INTELLIGENCE<br/>IN <em>MOTION.</em></h2>
          <p>Every element has a role. Every system works toward a clearer picture of the environment.</p>
        </div>
        <div className="capability-list">
          <article className="capability">
            <span className="cap-number">01</span>
            <div><span className="cap-label">PROPULSION</span><h3>Control in every direction.</h3><p>A twin-hull concept designed around stability, manoeuvrability and responsive movement.</p></div>
            <span className="cap-arrow"><ArrowUpRight size={20}/></span>
          </article>
          <article className="capability">
            <span className="cap-number">02</span>
            <div><span className="cap-label">PERCEPTION</span><h3>Awareness at the edge.</h3><p>A modular sensor architecture imagined to bring navigation and situational data together.</p></div>
            <span className="cap-arrow"><ArrowUpRight size={20}/></span>
          </article>
          <article className="capability">
            <span className="cap-number">03</span>
            <div><span className="cap-label">MODULARITY</span><h3>Ready for the mission.</h3><p>A flexible deck concept leaves room for payloads, equipment and evolving operational needs.</p></div>
            <span className="cap-arrow"><ArrowUpRight size={20}/></span>
          </article>
        </div>
      </section>

      <section className="manifesto" id="manifesto">
        <div className="manifesto-top"><span>03 — OUR THINKING</span><span>DESIGN WITH INTENT</span></div>
        <p>THE FUTURE OF THE WATER ISN'T JUST ABOUT GOING FURTHER.</p>
        <h2>IT'S ABOUT<br/><em>KNOWING WHY.</em></h2>
        <div className="manifesto-bottom"><span>CONSIDERED DESIGN. CONNECTED SYSTEMS. HUMAN PURPOSE.</span><span>— AQUAVANT</span></div>
      </section>

      <footer id="contact">
        <div className="footer-top">
          <span className="eyebrow">04 — THE NEXT HORIZON</span>
          <span className="footer-coordinate">AQUAVANT / EST. 2026</span>
        </div>
        <h2>MAKE WAVES.<br/><em>MAKE A DIFFERENCE.</em></h2>
        <div className="footer-action-row">
          <p>A concept for a more intelligent, responsive future on the water.</p>
          <a className="footer-contact" href="mailto:hello@aquavant.example">START A CONVERSATION <ArrowUpRight size={17}/></a>
        </div>
        <div className="footer-bottom">
          <a href="#top" className="footer-brand">AQUAVANT<span>.</span></a>
          <span>© 2026 AQUAVANT — CONCEPT EXPERIENCE</span>
          <a href="#top">BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>
  );
}
