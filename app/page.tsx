"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Aperture,
  Compass,
  Crosshair,
  Menu,
  MoveUpRight,
  Radio,
  Waves,
  X
} from "lucide-react";

const chapters = [
  {
    eyebrow: "01 / THE NEW FRONTIER",
    title: "THE OCEAN IS\nOUR NEXT FRONTIER.",
    description: "A new generation of autonomous marine systems. Designed to read the water, understand the unknown and move with intent."
  },
  {
    eyebrow: "02 / AWARENESS IN EVERY DIRECTION",
    title: "SEE WHAT\nLIES BENEATH.",
    description: "Sensing, navigation and intelligence converge to turn complex environments into a clearer picture."
  },
  {
    eyebrow: "03 / ENGINEERED TO ADAPT",
    title: "BUILT TO\nMOVE DIFFERENTLY.",
    description: "A modular twin-hull platform concept shaped around stability, manoeuvrability and mission flexibility."
  },
  {
    eyebrow: "04 / THE HUMAN OUTCOME",
    title: "MORE AWARENESS.\nBETTER RESPONSE.",
    description: "Technology with a purpose: helping people make better decisions on the water and beyond the shoreline."
  }
];

const missions = [
  {
    id: "rescue",
    number: "01",
    label: "SEARCH & RESCUE",
    title: "Find the signal.\nClose the distance.",
    body: "An autonomous platform concept for faster situational awareness, search patterns and support in challenging marine conditions.",
    stat: "RAPID RESPONSE",
    detail: "SEARCH / LOCATE / SUPPORT"
  },
  {
    id: "survey",
    number: "02",
    label: "OCEAN SURVEY",
    title: "Read the water.\nReveal the unseen.",
    body: "A flexible sensing platform imagined for environmental observation, waterway mapping and persistent data collection.",
    stat: "WIDE-AREA AWARENESS",
    detail: "MAP / MEASURE / UNDERSTAND"
  },
  {
    id: "patrol",
    number: "03",
    label: "MARITIME AWARENESS",
    title: "Stay aware.\nStay ahead.",
    body: "Connected perception and adaptable payloads create a foundation for monitoring coastlines, waterways and sensitive zones.",
    stat: "CONTINUOUS OBSERVATION",
    detail: "OBSERVE / IDENTIFY / INFORM"
  }
];

function makePontoon(offsetX: number, material: THREE.Material) {
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const indices: number[] = [];
  const longitudinal = 42;
  const radial = 20;

  for (let i = 0; i <= longitudinal; i++) {
    const t = i / longitudinal;
    const z = -3.65 + t * 7.25;
    const fullness = Math.pow(Math.max(0.015, Math.sin(Math.PI * t)), 0.48);
    const width = 0.075 + 0.62 * fullness;
    const height = 0.12 + 0.22 * fullness;

    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      vertices.push(
        offsetX + Math.cos(a) * width,
        -0.16 + Math.sin(a) * height,
        z
      );
    }
  }

  for (let i = 0; i < longitudinal; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const hull = new THREE.Mesh(geometry, material);
  hull.castShadow = true;
  hull.receiveShadow = true;
  return hull;
}

function OceanStage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    const sequence = sequenceRef.current;
    if (!mount || !sequence) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });
    } catch {
      mount.classList.add("webgl-unavailable");
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#06131b");
    scene.fog = new THREE.FogExp2("#06131b", 0.012);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 260);
    camera.position.set(10, 7, 14);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const hemisphere = new THREE.HemisphereLight(0xb6e4ec, 0x101b24, 1.7);
    scene.add(hemisphere);

    const keyLight = new THREE.DirectionalLight(0xfff1d8, 4.1);
    keyLight.position.set(-9, 16, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x36d9d0, 115, 38, 2);
    rimLight.position.set(8, 4, -7);
    scene.add(rimLight);

    const horizonLight = new THREE.PointLight(0x2f91a5, 68, 70, 2);
    horizonLight.position.set(-18, 3, -32);
    scene.add(horizonLight);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.7, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0xffd9a3 })
    );
    sun.position.set(-24, 19, -66);
    scene.add(sun);

    const sunGlow = new THREE.Mesh(
      new THREE.SphereGeometry(4.4, 32, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffb86c,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        depthWrite: false
      })
    );
    sunGlow.position.copy(sun.position);
    scene.add(sunGlow);

    const waterGeometry = new THREE.PlaneGeometry(220, 220, 190, 190);
    waterGeometry.rotateX(-Math.PI / 2);

    const waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color("#04141e") },
        uMid: { value: new THREE.Color("#0c3b48") },
        uShallow: { value: new THREE.Color("#237c83") }
      },
      vertexShader: [
        "uniform float uTime;",
        "varying vec3 vWorldPosition;",
        "varying vec3 vNormal;",
        "varying float vWave;",
        "void main(){",
        "vec3 p=position;",
        "float a=sin(p.x*0.105+uTime*0.72)*0.19;",
        "float b=cos(p.z*0.12+uTime*0.58)*0.15;",
        "float c=sin((p.x+p.z)*0.072+uTime*0.42)*0.10;",
        "p.y+=a+b+c;",
        "float dx=0.020*cos(p.x*0.105+uTime*0.72)+0.0072*cos((p.x+p.z)*0.072+uTime*0.42);",
        "float dz=-0.018*cos(p.z*0.12+uTime*0.58)+0.0072*cos((p.x+p.z)*0.072+uTime*0.42);",
        "vNormal=normalize(vec3(-dx,1.0,-dz));",
        "vWave=a+b+c;",
        "vec4 world=modelMatrix*vec4(p,1.0);",
        "vWorldPosition=world.xyz;",
        "gl_Position=projectionMatrix*viewMatrix*world;",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform float uTime;",
        "uniform vec3 uDeep;",
        "uniform vec3 uMid;",
        "uniform vec3 uShallow;",
        "varying vec3 vWorldPosition;",
        "varying vec3 vNormal;",
        "varying float vWave;",
        "void main(){",
        "vec3 n=normalize(vNormal);",
        "vec3 viewDir=normalize(cameraPosition-vWorldPosition);",
        "float fresnel=pow(1.0-max(dot(n,viewDir),0.0),2.7);",
        "float bands=sin(vWorldPosition.x*0.26+vWorldPosition.z*0.17+uTime*1.35);",
        "float glint=smoothstep(0.72,0.98,bands+vWave*1.8)*0.48;",
        "float depth=clamp(0.42+vWave*0.55+fresnel*0.35,0.0,1.0);",
        "vec3 color=mix(uDeep,uMid,depth);",
        "color=mix(color,uShallow,glint*0.55+fresnel*0.32);",
        "color+=vec3(0.36,0.74,0.72)*glint*0.17;",
        "float distanceFade=smoothstep(105.0,12.0,length(vWorldPosition.xz));",
        "color=mix(vec3(0.025,0.065,0.085),color,distanceFade*0.9+0.1);",
        "gl_FragColor=vec4(color,1.0);",
        "}"
      ].join("\n"),
      side: THREE.DoubleSide
    });

    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = -0.78;
    water.receiveShadow = true;
    scene.add(water);

    const boat = new THREE.Group();
    boat.position.y = 0.37;
    scene.add(boat);

    const hullMaterial = new THREE.MeshPhysicalMaterial({
      color: "#e5e8e0",
      metalness: 0.48,
      roughness: 0.26,
      clearcoat: 0.82,
      clearcoatRoughness: 0.18
    });
    const lowerHullMaterial = new THREE.MeshStandardMaterial({
      color: "#20373d",
      metalness: 0.62,
      roughness: 0.3
    });
    const deckMaterial = new THREE.MeshStandardMaterial({
      color: "#172a30",
      metalness: 0.72,
      roughness: 0.31
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: "#c6f16f",
      metalness: 0.36,
      roughness: 0.26,
      emissive: "#4c6819",
      emissiveIntensity: 0.28
    });
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: "#347c88",
      metalness: 0.24,
      roughness: 0.09,
      transmission: 0.16,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1
    });
    const blackGlass = new THREE.MeshPhysicalMaterial({
      color: "#07151e",
      metalness: 0.52,
      roughness: 0.1,
      clearcoat: 1
    });

    boat.add(makePontoon(-1.34, hullMaterial));
    boat.add(makePontoon(1.34, hullMaterial));

    for (const side of [-1, 1]) {
      const lower = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.075, 5.25),
        lowerHullMaterial
      );
      lower.position.set(side * 1.34, -0.31, -0.05);
      boat.add(lower);

      const chine = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.035, 5.9),
        accentMaterial
      );
      chine.position.set(side * 1.79, -0.12, -0.1);
      boat.add(chine);

      const railCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 1.05, 0.65, -2.9),
        new THREE.Vector3(side * 1.6, 0.65, -1.9),
        new THREE.Vector3(side * 1.7, 0.65, 1.7),
        new THREE.Vector3(side * 1.25, 0.65, 3.0)
      ]);
      const rail = new THREE.Mesh(
        new THREE.TubeGeometry(railCurve, 44, 0.026, 7, false),
        accentMaterial
      );
      boat.add(rail);

      const thruster = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.66, 18),
        deckMaterial
      );
      shaft.rotation.x = Math.PI / 2;
      shaft.position.z = -3.36;
      thruster.add(shaft);

      const prop = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.045, 10, 28),
        accentMaterial
      );
      prop.position.z = -3.7;
      thruster.add(prop);

      for (let blade = 0; blade < 3; blade++) {
        const fin = new THREE.Mesh(
          new THREE.BoxGeometry(0.055, 0.32, 0.11),
          lowerHullMaterial
        );
        fin.position.z = -3.69;
        fin.rotation.z = (blade / 3) * Math.PI * 2;
        thruster.add(fin);
      }
      thruster.position.x = side * 1.34;
      boat.add(thruster);
    }

    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(3.72, 0.18, 5.35),
      deckMaterial
    );
    deck.position.set(0, 0.28, -0.05);
    deck.castShadow = true;
    boat.add(deck);

    const foreDeck = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 0.09, 1.22),
      hullMaterial
    );
    foreDeck.position.set(0, 0.42, 2.2);
    boat.add(foreDeck);

    const cabin = new THREE.Group();
    boat.add(cabin);

    const cabinBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.18, 2.25),
      lowerHullMaterial
    );
    cabinBase.position.y = 0.48;
    cabin.add(cabinBase);

    const cabinShell = new THREE.Mesh(
      new THREE.BoxGeometry(1.88, 1.06, 1.95),
      glassMaterial
    );
    cabinShell.position.set(0, 1.08, 0.14);
    cabin.add(cabinShell);

    const frontWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.53, 0.64),
      blackGlass
    );
    frontWindow.position.set(0, 1.18, 1.13);
    cabin.add(frontWindow);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(2.35, 0.18, 2.34),
      hullMaterial
    );
    roof.position.set(0, 1.67, 0.13);
    cabin.add(roof);

    const roofPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.025, 1.02),
      accentMaterial
    );
    roofPanel.position.set(0, 1.78, 0.13);
    cabin.add(roofPanel);

    const sensorMount = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.11, 0.92, 12),
      deckMaterial
    );
    sensorMount.position.set(0, 2.18, -0.42);
    cabin.add(sensorMount);

    const sensorHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 24, 18),
      accentMaterial
    );
    sensorHead.position.set(0, 2.69, -0.42);
    cabin.add(sensorHead);

    const sensorBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.29, 0.025, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0x9affef, transparent: true, opacity: 0.88 })
    );
    sensorBand.position.copy(sensorHead.position);
    sensorBand.rotation.x = Math.PI / 2;
    cabin.add(sensorBand);

    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.022, 1.04, 8),
      hullMaterial
    );
    antenna.position.set(0.7, 2.24, -0.25);
    cabin.add(antenna);

    const antennaTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xff8a57 })
    );
    antennaTip.position.set(0.7, 2.78, -0.25);
    cabin.add(antennaTip);

    const sensorBeam = new THREE.Mesh(
      new THREE.ConeGeometry(2.9, 4.2, 48, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x54e8d6,
        transparent: true,
        opacity: 0.045,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    sensorBeam.position.set(0, 0.56, -0.42);
    cabin.add(sensorBeam);

    const scanRings = new THREE.Group();
    scene.add(scanRings);
    const scanRingMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(4.1 + i * 1.8, 0.012, 6, 180),
        new THREE.MeshBasicMaterial({
          color: i === 0 ? 0x8cf8df : 0x35aab0,
          transparent: true,
          opacity: 0.28 - i * 0.045,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.69 + i * 0.004;
      scanRings.add(ring);
      scanRingMeshes.push(ring);
    }

    const wakeGroup = new THREE.Group();
    boat.add(wakeGroup);
    for (const side of [-1, 1]) {
      const wakeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 1.34, -0.3, -3.2),
        new THREE.Vector3(side * 1.45, -0.54, -4.8),
        new THREE.Vector3(side * 1.95, -0.68, -6.8),
        new THREE.Vector3(side * 2.6, -0.73, -9.4)
      ]);
      const wake = new THREE.Mesh(
        new THREE.TubeGeometry(wakeCurve, 60, 0.025, 6, false),
        new THREE.MeshBasicMaterial({
          color: 0x89e9df,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending
        })
      );
      wakeGroup.add(wake);
    }

    const particleCount = window.innerWidth < 700 ? 360 : 760;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSeeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 7 + Math.random() * 44;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = -0.4 + Math.random() * 15;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
      particleSeeds[i] = Math.random() * Math.PI * 2;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x92e7df,
      size: 0.055,
      transparent: true,
      opacity: 0.56,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const cameraPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(10, 7, 14),
      new THREE.Vector3(7.5, 4.7, 8.6),
      new THREE.Vector3(-10, 5.2, 7.4),
      new THREE.Vector3(-1.5, 10.5, -10),
      new THREE.Vector3(10, 7.2, 14)
    ]);

    let frame = 0;
    let time = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let currentChapter = -1;
    const clock = new THREE.Clock();

    const updateProgress = () => {
      const rect = sequence.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const next = THREE.MathUtils.clamp(-rect.top / distance, 0, 1);
      progressRef.current = next;
      setProgress(next);
      const chapter = Math.min(3, Math.floor(next * 4));
      if (chapter !== currentChapter) {
        currentChapter = chapter;
        setActiveChapter(chapter);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      targetPointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetPointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const onResize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    updateProgress();
    onResize();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      time = clock.getElapsedTime();
      const p = progressRef.current;

      pointerX = THREE.MathUtils.lerp(pointerX, targetPointerX, 0.035);
      pointerY = THREE.MathUtils.lerp(pointerY, targetPointerY, 0.035);

      const desiredCamera = cameraPath.getPointAt(p);
      desiredCamera.x += pointerX * 0.68;
      desiredCamera.y += -pointerY * 0.32;
      camera.position.lerp(desiredCamera, 0.035);

      const lookTarget = new THREE.Vector3(
        pointerX * 0.38,
        0.1 - pointerY * 0.18,
        -0.05
      );
      camera.lookAt(lookTarget);

      boat.position.y = 0.37 + Math.sin(time * 1.15) * 0.055;
      boat.rotation.y = -0.16 + Math.sin(time * 0.22) * 0.035 + p * 0.72;
      boat.rotation.z = Math.sin(time * 0.5) * 0.012;
      boat.rotation.x = Math.sin(time * 0.68) * 0.009;

      sensorBand.rotation.z = time * 0.82;
      sensorBeam.rotation.y = Math.sin(time * 0.24) * 0.18;
      scanRings.rotation.y = time * 0.018;
      scanRingMeshes.forEach((ring, i) => {
        const pulse = (time * 0.12 + i * 0.25) % 1;
        ring.scale.setScalar(0.76 + pulse * 0.34);
        (ring.material as THREE.MeshBasicMaterial).opacity = (1 - pulse) * 0.2;
      });

      const particleArray = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleArray[i * 3 + 1] =
          particlePositions[i * 3 + 1] +
          Math.sin(time * 0.45 + particleSeeds[i]) * 0.19;
      }
      particleGeometry.attributes.position.needsUpdate = true;
      particles.rotation.y = time * 0.009;

      waterMaterial.uniforms.uTime.value = time;
      rimLight.intensity = 95 + Math.sin(time * 1.2) * 17;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const chapter = chapters[activeChapter];

  return (
    <section className="sequence" id="top" ref={sequenceRef}>
      <div className="sequence-sticky">
        <div className="ocean-canvas" ref={mountRef} />
        <div className="ocean-shade" />
        <div className="ocean-grain" />

        <div className="sequence-topline">
          <span>FIELD STUDY / 001</span>
          <span>17° 23' N&nbsp;&nbsp; 78° 29' E</span>
        </div>

        <div className="hero-copy" key={activeChapter}>
          <div className="hero-eyebrow"><i /> {chapter.eyebrow}</div>
          <h1>{chapter.title.split("\n").map((line, index) => (
            <span key={line + index}>{line}{index === 0 && <br />}</span>
          ))}</h1>
          <p>{chapter.description}</p>
          {activeChapter === 0 && (
            <a className="hero-link" href="#platform">
              EXPLORE AQUAVANT <MoveUpRight size={15} />
            </a>
          )}
        </div>

        <div className="hero-spec">
          <span className="spec-label">AUTONOMOUS MARINE SYSTEMS</span>
          <span className="spec-divider" />
          <span>DESIGNED FOR THE UNKNOWN</span>
        </div>

        <div className="sequence-bottom">
          <div className="scroll-indicator">
            <span>SCROLL TO NAVIGATE</span>
            <div className="scroll-track"><i style={{ transform: "scaleX(" + progress + ")" }} /></div>
            <span>{String(Math.round(progress * 100)).padStart(2, "0")}</span>
          </div>
          <div className="sequence-chapters">
            {chapters.map((item, index) => (
              <span key={item.eyebrow} className={index === activeChapter ? "current" : ""}>
                {item.eyebrow.slice(0, 2)}
              </span>
            ))}
          </div>
          <a href="#platform" className="scroll-down" aria-label="Scroll to platform"><ArrowDown size={17} /></a>
        </div>

        <div className="hero-orb-label"><span /> LIVE SYSTEM / NOMINAL</div>
      </div>
    </section>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [missionIndex, setMissionIndex] = useState(0);
  const mission = missions[missionIndex];

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="site-shell">
      <nav className="site-nav">
        <a href="#top" className="wordmark" onClick={closeMenu}>
          <span className="wordmark-icon"><Waves size={17} strokeWidth={1.7} /></span>
          <span>AQUAVANT<span className="wordmark-dot">.</span></span>
        </a>
        <div className="nav-links">
          <a href="#platform">PLATFORM</a>
          <a href="#missions">MISSIONS</a>
          <a href="#systems">SYSTEMS</a>
        </div>
        <a className="nav-cta" href="#contact">START A CONVERSATION <ArrowUpRight size={14} /></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && (
          <div className="mobile-navigation">
            <a href="#platform" onClick={closeMenu}>PLATFORM <ArrowUpRight size={14} /></a>
            <a href="#missions" onClick={closeMenu}>MISSIONS <ArrowUpRight size={14} /></a>
            <a href="#systems" onClick={closeMenu}>SYSTEMS <ArrowUpRight size={14} /></a>
            <a href="#contact" onClick={closeMenu}>CONTACT <ArrowUpRight size={14} /></a>
          </div>
        )}
      </nav>

      <OceanStage />

      <section className="platform-section" id="platform">
        <div className="section-stamp reveal"><span>01 / THE PLATFORM</span><span>AQUAVANT — 2026</span></div>
        <div className="platform-headline reveal">
          <p className="micro-label">A DIFFERENT POINT OF VIEW</p>
          <h2>THE WATER<br />IS <em>ALWAYS</em><br />IN MOTION.</h2>
          <div className="platform-aside">
            <span className="aside-rule" />
            <p>AQUAVANT explores what happens when intelligent systems meet the open water. A marine platform concept built around perception, adaptability and purposeful response.</p>
            <a href="#systems" className="underlined-link">DISCOVER THE SYSTEM <ArrowUpRight size={15} /></a>
          </div>
        </div>
        <div className="platform-bottom reveal">
          <span>01 — 04 / A NEW MARINE PERSPECTIVE</span>
          <span>INTELLIGENCE IN MOTION <ArrowUpRight size={13} /></span>
        </div>
      </section>

      <section className="mission-section" id="missions">
        <div className="mission-head reveal">
          <div>
            <p className="micro-label">02 / BUILT AROUND THE MISSION</p>
            <h2>ONE PLATFORM.<br /><em>MANY POSSIBILITIES.</em></h2>
          </div>
          <p className="mission-intro">A modular architecture gives the platform room to adapt. Explore three possible directions for a more aware future on the water.</p>
        </div>

        <div className="mission-explorer">
          <div className="mission-visual">
            <div className="mission-grid" />
            <div className="mission-radar">
              <div className="radar-circle radar-circle-one" />
              <div className="radar-circle radar-circle-two" />
              <div className="radar-circle radar-circle-three" />
              <div className="radar-sweep" />
              <div className="radar-crosshair" />
              <div className="radar-dot dot-one" />
              <div className="radar-dot dot-two" />
              <div className="radar-dot dot-three" />
              <div className="radar-center"><Crosshair size={24} strokeWidth={1.2} /></div>
            </div>
            <div className="visual-coordinate coordinate-top">LAT 17°23' N / LONG 78°29' E</div>
            <div className="visual-coordinate coordinate-bottom">SENSOR ARRAY / ACTIVE</div>
            <div className="visual-index">{mission.number}<span> / 03</span></div>
          </div>

          <div className="mission-content">
            <div className="mission-tabs" role="tablist" aria-label="Explore mission concepts">
              {missions.map((item, index) => (
                <button
                  key={item.id}
                  className={index === missionIndex ? "mission-tab selected" : "mission-tab"}
                  onClick={() => setMissionIndex(index)}
                  role="tab"
                  aria-selected={index === missionIndex}
                >
                  <span>{item.number}</span>{item.label}<ArrowUpRight size={14} />
                </button>
              ))}
            </div>
            <div className="mission-detail" key={mission.id}>
              <p className="micro-label">{mission.stat}</p>
              <h3>{mission.title.split("\n").map((line, index) => (
                <span key={line + index}>{line}{index === 0 && <br />}</span>
              ))}</h3>
              <p className="mission-description">{mission.body}</p>
              <div className="mission-foot">
                <span>{mission.detail}</span>
                <span>CONCEPT / {mission.number}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="systems-section" id="systems">
        <div className="systems-top reveal">
          <p className="micro-label">03 / THE SYSTEMS BEHIND THE SURFACE</p>
          <span>THREE PILLARS / ONE INTELLIGENT PLATFORM</span>
        </div>
        <div className="systems-heading reveal">
          <h2>ENGINEERED<br />TO <em>UNDERSTAND.</em></h2>
          <p>More than a vessel. A connected system where every component contributes to a clearer understanding of the environment.</p>
        </div>
        <div className="system-cards">
          <article className="system-card reveal">
            <div className="system-card-top"><span>01 / PERCEPTION</span><Aperture size={19} /></div>
            <div className="system-art perception-art">
              <div className="perception-orbit orbit-a" /><div className="perception-orbit orbit-b" />
              <div className="perception-core"><Crosshair size={26} /></div>
              <i className="perception-beam" />
            </div>
            <h3>Awareness at the edge.</h3>
            <p>Sensor-led perception imagined to bring navigation, surroundings and operational data into one picture.</p>
            <span className="card-index">SENSE / INTERPRET / INFORM</span>
          </article>
          <article className="system-card reveal">
            <div className="system-card-top"><span>02 / ADAPTABILITY</span><Compass size={19} /></div>
            <div className="system-art adapt-art">
              <div className="adapt-frame"><i /><i /><i /><i /></div>
              <div className="adapt-core"><Waves size={30} /></div>
              <div className="adapt-orbit" />
            </div>
            <h3>Designed to evolve.</h3>
            <p>A modular deck and flexible architecture create room for new payloads, tools and mission requirements.</p>
            <span className="card-index">CONFIGURE / CONNECT / DEPLOY</span>
          </article>
          <article className="system-card reveal">
            <div className="system-card-top"><span>03 / AUTONOMY</span><Radio size={19} /></div>
            <div className="system-art autonomy-art">
              <div className="signal signal-a" /><div className="signal signal-b" /><div className="signal signal-c" />
              <div className="autonomy-core"><Radio size={25} /></div>
              <div className="signal-point point-a" /><div className="signal-point point-b" />
            </div>
            <h3>Decisions with context.</h3>
            <p>Connected intelligence provides a foundation for more informed movement and responsive operations.</p>
            <span className="card-index">CONNECT / ANALYSE / RESPOND</span>
          </article>
        </div>
      </section>

      <section className="manifesto-section">
        <div className="manifesto-background-mark">A</div>
        <div className="manifesto-inner">
          <p className="micro-label reveal">04 / OUR POINT OF VIEW</p>
          <h2 className="reveal">THE NEXT<br />WAVE ISN'T<br /><em>ABOUT SPEED.</em></h2>
          <div className="manifesto-bottom reveal">
            <p>IT'S ABOUT SEEING MORE.<br />UNDERSTANDING BETTER.<br />AND KNOWING WHEN TO ACT.</p>
            <span>— AQUAVANT / INTELLIGENCE IN MOTION</span>
          </div>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div className="footer-top reveal">
          <span>05 / THE NEXT HORIZON</span>
          <span>AN AUTONOMOUS MARINE SYSTEMS CONCEPT</span>
        </div>
        <div className="footer-main reveal">
          <p className="micro-label">THE WATER IS WAITING.</p>
          <h2>LET'S MAKE<br /><em>WHAT'S NEXT.</em></h2>
          <a href="mailto:hello@aquavant.example" className="footer-cta">START A CONVERSATION <ArrowUpRight size={18} /></a>
        </div>
        <div className="footer-bottom">
          <a href="#top" className="footer-wordmark">AQUAVANT<span>.</span></a>
          <span>© 2026 AQUAVANT — CONCEPT EXPERIENCE</span>
          <a href="#top">BACK TO SURFACE ↑</a>
        </div>
      </footer>
    </main>
  );
}
