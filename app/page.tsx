"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Activity, ArrowDown, ArrowRight, ArrowUpRight, Brain, Dna, Eye, HeartPulse, Menu, Microscope, Orbit, Scan, Shield, Sparkles, X, Zap } from "lucide-react";

const chapters = [
  { tag: "01 / THE HUMAN FRONTIER", title: "THE HUMAN\nBODY, IN MOTION.", body: "A living architecture of systems, signals and structures. Move closer to the extraordinary design beneath the surface." },
  { tag: "02 / THE NEURAL NETWORK", title: "A NETWORK\nOF SIGNALS.", body: "Electrical impulses connect thought, movement and sensation in a continuous exchange across the body." },
  { tag: "03 / THE LIVING ENGINE", title: "LIFE, IN\nEVERY DETAIL.", body: "From circulation to respiration, discover the interconnected systems that sustain human life." },
  { tag: "04 / BEYOND THE VISIBLE", title: "LOOK CLOSER.\nGO DEEPER.", body: "An interactive exploration of anatomy, where science becomes something you can see, move through and understand." }
];

const systems = [
  { id:"neural", n:"01", title:"Nervous system", subtitle:"THE ELECTRICAL UNIVERSE", text:"The command and communication network. Explore the brain, spinal cord and branching peripheral nerves that coordinate the body.", stat:"86 BILLION / ESTIMATED NEURONS", icon:Brain, color:"#a78bfa" },
  { id:"cardio", n:"02", title:"Cardiovascular", subtitle:"THE CIRCULATORY ENGINE", text:"A continuous transport network. The heart drives blood through an intricate system of vessels, delivering oxygen and nutrients.", stat:"~100,000 KM / BLOOD VESSELS", icon:HeartPulse, color:"#ff668d" },
  { id:"skeletal", n:"03", title:"Skeletal system", subtitle:"THE STRUCTURAL FRAMEWORK", text:"The living framework that supports movement, protects organs and continually remodels itself.", stat:"206 / ADULT BONES", icon:Scan, color:"#72d9e8" },
  { id:"cellular", n:"04", title:"Cellular world", subtitle:"LIFE AT ANOTHER SCALE", text:"Zoom beyond organs into the microscopic structures, membranes and molecular processes that make life possible.", stat:"TRILLIONS / HUMAN CELLS", icon:Dna, color:"#c3f17b" }
];

function limb(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material) {
  const direction = new THREE.Vector3().subVectors(b,a);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.78,radius,direction.length(),16),material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
  mesh.castShadow = true;
  return mesh;
}
function sphere(scene: THREE.Group, position: [number,number,number], scale: [number,number,number], material: THREE.Material, detail=24) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1,detail,detail),material);
  mesh.position.set(...position); mesh.scale.set(...scale); mesh.castShadow=true; scene.add(mesh); return mesh;
}
function AnatomyStage() {
  const mount=useRef<HTMLDivElement>(null), sequence=useRef<HTMLElement>(null);
  const progressRef=useRef(0);
  const [chapterIndex,setChapterIndex]=useState(0), [progress,setProgress]=useState(0);
  const [soundEnabled,setSoundEnabled]=useState(false);
  const audioEngine=useRef<{ctx:AudioContext;master:GainNode;nodes:AudioNode[]}|null>(null);

  const toggleSound=()=>{
    if(!audioEngine.current){
      const AudioContextCtor=window.AudioContext || (window as Window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
      if(!AudioContextCtor) return;
      const ctx=new AudioContextCtor();
      const master=ctx.createGain();
      master.gain.setValueAtTime(0,ctx.currentTime);
      master.connect(ctx.destination);
      const nodes:AudioNode[]=[master];
      const addTone=(frequency:number,volume:number,detune=0)=>{
        const oscillator=ctx.createOscillator();
        const gain=ctx.createGain();
        oscillator.type="sine"; oscillator.frequency.value=frequency; oscillator.detune.value=detune;
        gain.gain.value=volume; oscillator.connect(gain); gain.connect(master); oscillator.start();
        nodes.push(oscillator,gain);
      };
      addTone(55,.075,-3); addTone(82.4,.032,4); addTone(110,.012,-2);
      const length=ctx.sampleRate*3;
      const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
      const data=buffer.getChannelData(0);
      for(let i=0;i<length;i++) data[i]=(Math.random()*2-1)*.5;
      const noise=ctx.createBufferSource(), filter=ctx.createBiquadFilter(), noiseGain=ctx.createGain();
      noise.buffer=buffer; noise.loop=true; filter.type="lowpass"; filter.frequency.value=260; filter.Q.value=.4;
      noiseGain.gain.value=.018; noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(master); noise.start();
      nodes.push(noise,filter,noiseGain);
      audioEngine.current={ctx,master,nodes};
      if(ctx.state==="suspended") void ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(.72,ctx.currentTime+2.2);
      setSoundEnabled(true);
    }else{
      const {ctx,master}=audioEngine.current;
      const next=!soundEnabled;
      if(ctx.state==="suspended" && next) void ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(next?.72:0,ctx.currentTime,.35);
      setSoundEnabled(next);
    }
  };

  useEffect(()=>{
    const host=mount.current, section=sequence.current; if(!host||!section)return;
    let renderer:THREE.WebGLRenderer;
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"}); }
    catch { host.classList.add("no-webgl"); return; }
    const scene=new THREE.Scene();
    scene.background=new THREE.Color("#020305");
    scene.fog=new THREE.FogExp2("#020305",.012);
    const camera=new THREE.PerspectiveCamera(42,1,.1,100);
    camera.position.set(0,0,10.8);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    renderer.setSize(host.clientWidth,host.clientHeight);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1;
    host.appendChild(renderer.domElement);

    // A slow, breathing torus of suspended dust — the hero visual.
    const field=new THREE.Group(); field.position.set(2.35,.05,0); scene.add(field);
    const mobile=window.innerWidth<700;
    const count=mobile?2600:7200;
    const positions=new Float32Array(count*3);
    const colors=new Float32Array(count*3);
    for(let i=0;i<count;i++){
      const around=Math.random()*Math.PI*2;
      const tube=Math.random()*Math.PI*2;
      const tubeRadius=Math.sqrt(Math.random())*(mobile?.57:.68);
      const major=1.78+(Math.random()-.5)*.18;
      const ripple=Math.sin(around*3+tube*1.7)*.10;
      const radius=major+tubeRadius*Math.cos(tube)+ripple;
      positions[i*3]=Math.cos(around)*radius;
      positions[i*3+1]=Math.sin(tube)*tubeRadius*.92+Math.sin(around*2)*.10;
      positions[i*3+2]=Math.sin(around)*radius;
      const tint=Math.random();
      colors[i*3]=.62+tint*.34;
      colors[i*3+1]=.72+tint*.26;
      colors[i*3+2]=.82+tint*.18;
    }
    const ringGeometry=new THREE.BufferGeometry();
    ringGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
    ringGeometry.setAttribute("color",new THREE.BufferAttribute(colors,3));
    const ringMaterial=new THREE.PointsMaterial({
      size:mobile?.023:.018, vertexColors:true, transparent:true, opacity:.82,
      depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true
    });
    const ringPoints=new THREE.Points(ringGeometry,ringMaterial); field.add(ringPoints);
    const glowMaterial=new THREE.PointsMaterial({
      size:mobile?.065:.052, color:0x8caedb, transparent:true, opacity:.10,
      depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true
    });
    field.add(new THREE.Points(ringGeometry,glowMaterial));

    // Smaller distant particles give the scene scale and depth.
    const dustCount=mobile?850:2100;
    const dustPositions=new Float32Array(dustCount*3);
    const dustSeeds=new Float32Array(dustCount);
    for(let i=0;i<dustCount;i++){
      dustPositions[i*3]=(Math.random()-.5)*17;
      dustPositions[i*3+1]=(Math.random()-.5)*9;
      dustPositions[i*3+2]=(Math.random()-.5)*13-2;
      dustSeeds[i]=Math.random()*Math.PI*2;
    }
    const dustGeometry=new THREE.BufferGeometry();
    dustGeometry.setAttribute("position",new THREE.BufferAttribute(dustPositions,3));
    const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({
      color:0xc4d4e9,size:mobile?.012:.01,transparent:true,opacity:.35,
      depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true
    }));
    scene.add(dust);

    // A few very fine filaments are only visible when they catch the light.
    const filaments=new THREE.Group(); field.add(filaments);
    for(let j=0;j<3;j++){
      const curvePoints:THREE.Vector3[]=[];
      for(let k=0;k<=180;k++){
        const a=k/180*Math.PI*2;
        const r=1.78+j*.16;
        curvePoints.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a*2+j)*(.19+j*.07),Math.sin(a)*r));
      }
      const curve=new THREE.CatmullRomCurve3(curvePoints);
      const line=new THREE.Mesh(
        new THREE.TubeGeometry(curve,240,.0025,3,false),
        new THREE.MeshBasicMaterial({color:j===1?0x8ed7df:0xa3b8d9,transparent:true,opacity:.12,depthWrite:false})
      );
      filaments.add(line);
    }

    let pointerX=0,pointerY=0,targetX=0,targetY=0;
    const clock=new THREE.Clock();
    const onScroll=()=>{
      const r=section.getBoundingClientRect(),d=Math.max(1,r.height-innerHeight);
      const p=THREE.MathUtils.clamp(-r.top/d,0,1);
      progressRef.current=p;setProgress(p);setChapterIndex(Math.min(3,Math.floor(p*4)));
    };
    const onPointer=(event:PointerEvent)=>{
      targetX=(event.clientX/innerWidth-.5)*2;
      targetY=(event.clientY/innerHeight-.5)*2;
    };
    const resize=()=>{
      const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;
      camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
    };
    window.addEventListener("scroll",onScroll,{passive:true});
    window.addEventListener("resize",resize);
    window.addEventListener("pointermove",onPointer,{passive:true});
    onScroll();resize();

    renderer.setAnimationLoop(()=>{
      const t=clock.getElapsedTime(),p=progressRef.current;
      pointerX=THREE.MathUtils.lerp(pointerX,targetX,.035);
      pointerY=THREE.MathUtils.lerp(pointerY,targetY,.035);
      field.rotation.y=t*.045+pointerX*.17+p*.12;
      field.rotation.x=Math.sin(t*.13)*.09+pointerY*.09;
      field.rotation.z=Math.sin(t*.17)*.025;
      field.position.y=.05+Math.sin(t*.38)*.08-pointerY*.11;
      dust.rotation.y=-t*.008+pointerX*.025;
      dust.rotation.x=Math.sin(t*.11)*.018;
      const dp=dustGeometry.attributes.position.array as Float32Array;
      for(let i=0;i<dustCount;i++){
        dp[i*3+1]=dustPositions[i*3+1]+Math.sin(t*.18+dustSeeds[i])*.13;
      }
      dustGeometry.attributes.position.needsUpdate=true;
      camera.position.x=THREE.MathUtils.lerp(camera.position.x,pointerX*.22,.025);
      camera.position.y=THREE.MathUtils.lerp(camera.position.y,-pointerY*.14,.025);
      camera.position.z=10.8-p*.45;
      camera.lookAt(.35,0,0);
      renderer.render(scene,camera);
    });
    return()=>{
      renderer.setAnimationLoop(null);
      window.removeEventListener("scroll",onScroll);
      window.removeEventListener("resize",resize);
      window.removeEventListener("pointermove",onPointer);
      scene.traverse(object=>{
        if(object instanceof THREE.Mesh||object instanceof THREE.Points){
          object.geometry.dispose();
          const materials=Array.isArray(object.material)?object.material:[object.material];
          materials.forEach(material=>material.dispose());
        }
      });
      renderer.dispose();
      if(host.contains(renderer.domElement))host.removeChild(renderer.domElement);
    };
  },[]);

  useEffect(()=>()=>{if(audioEngine.current){audioEngine.current.ctx.close().catch(()=>{});audioEngine.current=null;}},[]);
  const chapter=chapters[chapterIndex];
  return <section className="anatomy-sequence" id="top" ref={sequence}>
    <div className="anatomy-sticky">
      <div className="anatomy-canvas" ref={mount}/>
      <div className="scene-vignette"/>
      <div className="scene-grain"/>
      <div className="scene-meta"><span>VITAL/FORM — AN ANATOMICAL STUDY</span><span>FORM · SIGNAL · MOTION</span></div>
      <div className="hero-copy" key={chapterIndex}>
        <p className="eyebrow"><i/>{chapter.tag}</p>
        <h1>{chapter.title.split("\n").map((line,i)=><span key={line}>{line}{i===0&&<br/>}</span>)}</h1>
        <p className="hero-description">{chapter.body}</p>
        <a href="#atlas" className="hero-action">ENTER THE ATLAS <ArrowUpRight size={15}/></a>
      </div>
      <div className="hero-side-note"><span>FIG. 001</span><i/><span>PARTICLE STUDY / 01</span></div>
      <button className={"sound-toggle "+(soundEnabled?"sound-active":"")} onClick={toggleSound} aria-pressed={soundEnabled}>
        <span className="sound-bars"><i/><i/><i/><i/></span>{soundEnabled?"SOUND ON":"SOUND OFF"}
      </button>
      <div className="scene-bottom">
        <span>SCROLL TO EXPLORE</span>
        <div className="progress-line"><i style={{transform:"scaleX("+progress+")"}}/></div>
        <span>{String(Math.round(progress*100)).padStart(2,"0")}%</span>
        <div className="chapter-dots">{chapters.map((c,i)=><span key={c.tag} className={i===chapterIndex?"active":""}>{c.tag.slice(0,2)}</span>)}</div>
        <a href="#atlas" aria-label="Explore anatomy"><ArrowDown size={17}/></a>
      </div>
    </div>
  </section>;
}


function AnatomyModelExplorer() {
  const mount = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [visible, setVisible] = useState({ skeleton: true, muscles: true, organs: true });
  const [selected, setSelected] = useState("Select an anatomical structure");
  const [selectedLayer, setSelectedLayer] = useState("ALL SYSTEMS");
  const visibilityRef = useRef(visible);
  useEffect(() => { visibilityRef.current = visible; }, [visible]);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setLoadError("WebGL is unavailable in this browser.");
      return;
    }
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#090a14");
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    camera.position.set(2.3, 1.2, 3.2);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xbfc8ff, 0x171020, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(3, 5, 4); scene.add(key);
    const rim = new THREE.PointLight(0x8d6bff, 45, 8);
    rim.position.set(-2, 1.2, -1); scene.add(rim);
    const cyan = new THREE.PointLight(0x42dfe1, 24, 7);
    cyan.position.set(2, -0.4, 2); scene.add(cyan);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(1.9, 64), new THREE.MeshBasicMaterial({ color: 0x141629, transparent: true, opacity: .75 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.91; scene.add(floor);
    const grid = new THREE.GridHelper(4, 40, 0x6254a0, 0x29263f);
    grid.position.y = -0.9;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = .25;
    scene.add(grid);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .06;
    controls.minDistance = 1.5;
    controls.maxDistance = 7;
    controls.target.set(0, 0, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = .65;

    const loader = new GLTFLoader();
    const layers: Record<string, THREE.Group> = {};
    let disposed = false;
    const files = [
      { id: "skeleton", url: "/models/full-adult-skeleton-standing.glb", y: -0.875 },
      { id: "muscles", url: "/models/full-body-muscular-system-selected-deep-layer.glb", y: -0.875 },
      { id: "organs", url: "/models/torso-with-removable-organs.glb", y: 0.03 }
    ];
    const loadModels = async () => {
      try {
        await Promise.all(files.map(async (file) => {
          const gltf = await loader.loadAsync(file.url);
          if (disposed) {
            gltf.scene.traverse(o => {
              if (o instanceof THREE.Mesh) {
                o.geometry.dispose();
                const mats = Array.isArray(o.material) ? o.material : [o.material];
                mats.forEach(m => m.dispose());
              }
            });
            return;
          }
          const group = new THREE.Group();
          group.name = file.id;
          group.add(gltf.scene);
          group.position.y = file.y;
          gltf.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.castShadow = true;
              object.receiveShadow = true;
              object.userData.layer = file.id;
              object.userData.anatomyName = object.name || "Anatomical structure";
              if (file.id === "organs") {
                object.material = Array.isArray(object.material)
                  ? object.material.map(m => m.clone())
                  : object.material.clone();
              }
            }
          });
          layers[file.id] = group;
          scene.add(group);
        }));
        if (!disposed) setLoaded(true);
      } catch (error) {
        if (!disposed) setLoadError("Could not load one or more anatomy models. Check that the GLB files are in public/models/.");
      }
    };
    void loadModels();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onClick = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(Object.values(layers), true);
      const hit = hits.find(h => h.object.visible && h.object instanceof THREE.Mesh);
      if (hit) {
        const obj = hit.object;
        setSelected(obj.userData.anatomyName || obj.name || "Anatomical structure");
        setSelectedLayer(String(obj.userData.layer || "ANATOMY").toUpperCase());
      }
    };
    renderer.domElement.addEventListener("pointerdown", onClick);
    const resize = () => {
      const w = host.clientWidth || 1, h = host.clientHeight || 1;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", resize);
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const t = clock.getElapsedTime();
      Object.entries(layers).forEach(([id, group]) => {
        group.visible = visibilityRef.current[id as keyof typeof visibilityRef.current];
      });
      rim.intensity = 38 + Math.sin(t * .7) * 7;
      controls.update();
      renderer.render(scene, camera);
    });
    resize();
    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("pointerdown", onClick);
      window.removeEventListener("resize", resize);
      controls.dispose();
      scene.traverse(o => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach(m => m.dispose());
        }
      });
      renderer.dispose();
      if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
    };
  }, []);

  const toggle = (id: keyof typeof visible) => setVisible(v => ({ ...v, [id]: !v[id] }));
  const reset = () => {
    setVisible({ skeleton: true, muscles: true, organs: true });
    setSelected("Select an anatomical structure");
    setSelectedLayer("ALL SYSTEMS");
  };
  return <section className="model-lab" id="model-lab">
    <div className="model-lab-head">
      <div><p className="light-label">05 / THE ANATOMICAL LAB</p><h2>INSIDE THE<br/><em>HUMAN FORM.</em></h2></div>
      <p>Explore real, individually named 3D anatomical structures. Rotate the model, isolate layers and select structures to inspect them.</p>
    </div>
    <div className="model-lab-layout">
      <div className="model-stage-wrap">
        <div className="model-stage" ref={mount}>
          {!loaded && !loadError && <div className="model-loading"><span className="loading-pulse"/>LOADING ANATOMICAL MODELS</div>}
          {loadError && <div className="model-loading model-error">{loadError}</div>}
        </div>
        <div className="model-stage-footer"><span>3D MODEL / REAL-WORLD SCALE</span><span>DRAG TO ROTATE · SCROLL TO ZOOM</span></div>
      </div>
      <aside className="model-controls">
        <div className="model-control-top"><span>MODEL LAYERS</span><button onClick={reset}>RESET VIEW ↺</button></div>
        <p className="model-control-caption">TOGGLE ANATOMICAL SYSTEMS</p>
        {([
          ["skeleton", "Skeletal system", "238 anatomical meshes", "#d8d8ed"],
          ["muscles", "Muscular system", "147 anatomical meshes", "#e7a0a2"],
          ["organs", "Internal organs", "56 anatomical meshes", "#a78bfa"]
        ] as const).map(([id, title, detail, color]) => <button key={id} className={"layer-toggle "+(visible[id]?"layer-on":"")} onClick={()=>toggle(id)}>
          <span className="layer-dot" style={{background:color}}/><span className="layer-text"><strong>{title}</strong><small>{detail}</small></span><span className="layer-switch"><i/></span>
        </button>)}
        <div className="selection-card">
          <span className="selection-kicker">SELECTED STRUCTURE / {selectedLayer}</span>
          <strong>{selected}</strong>
          <p>Click an individual structure in the 3D model to inspect its anatomical name.</p>
        </div>
        <div className="model-stats"><span><strong>385</strong> SKELETAL + MUSCLE MESHES</span><span><strong>56</strong> ORGAN MESHES</span></div>
      </aside>
    </div>
    <p className="model-attribution">MODEL SOURCES: INNERSCENE · CC0 PUBLIC DOMAIN. EDUCATIONAL VISUALISATION ONLY — NOT FOR DIAGNOSIS.</p>
  </section>;
}

export default function Home(){
 const [menu,setMenu]=useState(false),[active,setActive]=useState(0);const item=systems[active];
 useEffect(()=>{const els=Array.from(document.querySelectorAll<HTMLElement>(".reveal"));const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target);}}),{threshold:.12});els.forEach(e=>io.observe(e));return()=>io.disconnect();},[]);
 const close=()=>setMenu(false);
 return <main className="site-shell">
  <nav className="nav"><a className="brand" href="#top" onClick={close}><span className="brand-symbol"><Activity size={19}/></span><span>VITAL<span className="brand-accent">/</span>FORM</span></a><div className="nav-links"><a href="#atlas">ATLAS</a><a href="#systems">SYSTEMS</a><a href="#model-lab">3D LAB</a><a href="#future">FRONTIER</a></div><a className="nav-cta" href="#atlas">EXPLORE THE BODY <ArrowUpRight size={14}/></a><button className="menu-button" onClick={()=>setMenu(!menu)} aria-label="Toggle menu">{menu?<X/>:<Menu/>}</button>{menu&&<div className="mobile-menu"><a href="#atlas" onClick={close}>ATLAS ↗</a><a href="#systems" onClick={close}>SYSTEMS ↗</a><a href="#model-lab" onClick={close}>3D LAB ↗</a><a href="#future" onClick={close}>FRONTIER ↗</a></div>}</nav>
  <AnatomyStage/>
  <section className="intro-section" id="atlas"><div className="section-kicker reveal"><span>01 / THE ANATOMICAL ATLAS</span><span>FORM FOLLOWS FUNCTION</span></div><div className="intro-grid"><div className="reveal"><p className="light-label">A NEW WAY TO SEE YOURSELF</p><h2>NOT JUST<br/>A BODY.<br/><em>A UNIVERSE.</em></h2></div><div className="intro-copy reveal"><span className="accent-rule"/><p>Every movement, every thought, every heartbeat is the result of extraordinary systems working together. VITAL/FORM is an immersive exploration of the human body — from its visible architecture to the invisible signals that bring it to life.</p><a href="#systems" className="text-link">EXPLORE THE SYSTEMS <ArrowRight size={15}/></a><div className="intro-index"><span>01</span><span>HUMAN BIOLOGY / DIGITAL EXPLORATION</span></div></div></div></section>
  <section className="systems-section" id="systems"><div className="systems-heading reveal"><div><p className="light-label">02 / INTERACTIVE SYSTEMS</p><h2>FOUR LAYERS.<br/><em>ONE LIFE.</em></h2></div><p>Choose a system to reveal its role in the living network. This is an educational visual concept, not a diagnostic tool.</p></div><div className="system-explorer"><div className="system-list">{systems.map((s,i)=><button key={s.id} className={i===active?"system-choice active":"system-choice"} onClick={()=>setActive(i)}><span>{s.n}</span><strong>{s.title}</strong><ArrowUpRight size={16}/></button>)}</div><article className="system-detail" key={item.id}><div className="detail-orbit"><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="orbit-ring ring-three"/><div className="detail-core" style={{color:item.color}}><item.icon size={42} strokeWidth={1.2}/></div><span className="orbit-node node-one"/><span className="orbit-node node-two"/></div><div className="detail-copy"><p className="light-label">{item.subtitle}</p><h3>{item.title}<span>.</span></h3><p>{item.text}</p><div className="detail-stat"><span>REFERENCE / {item.n}</span><strong>{item.stat}</strong></div></div></article></div></section>
  <AnatomyModelExplorer/>
  <section className="microscopic-section"><div className="micro-orb orb-a"/><div className="micro-orb orb-b"/><div className="micro-content reveal"><p className="light-label">03 / SCALE IS RELATIVE</p><h2>FROM THE<br/>ORGAN TO THE<br/><em>INFINITE SMALL.</em></h2><p>Zoom through the scales of human biology. The same principles of structure, signal and adaptation echo from whole-body systems down to the cellular frontier.</p><div className="scale-labels"><span>ORGANISM</span><i/><span>ORGAN</span><i/><span>CELL</span><i/><span>MOLECULE</span></div></div></section>
  <section className="future-section" id="future"><div className="future-top reveal"><span>04 / THE NEXT FRONTIER</span><span>SCIENCE × DESIGN × TECHNOLOGY</span></div><div className="future-main"><div className="future-title reveal"><p className="light-label">A NEW DIMENSION OF UNDERSTANDING</p><h2>THE FUTURE<br/>IS <em>HUMAN.</em></h2></div><div className="future-copy reveal"><Sparkles size={24}/><p>New tools are changing how we visualise, study and understand the body. VITAL/FORM brings anatomy into an interactive digital space — designed to spark curiosity and make complex systems feel tangible.</p><span>SEE THE SYSTEM. UNDERSTAND THE CONNECTION.</span></div></div><div className="future-bottom"><span>VITAL/FORM — AN INTERACTIVE ANATOMY CONCEPT</span><span>BUILT TO EXPLORE WHAT MAKES US, US.</span></div></section>
  <footer className="footer"><div className="footer-top"><span>VITAL/FORM</span><span>THE HUMAN BODY / REIMAGINED</span></div><div className="footer-main reveal"><p className="light-label">ENDLESSLY COMPLEX. BEAUTIFULLY CONNECTED.</p><h2>STAY<br/><em>CURIOUS.</em></h2><a href="#top">BACK TO THE SURFACE <ArrowUpRight size={16}/></a></div><div className="footer-bottom"><span>© 2026 VITAL/FORM — EDUCATIONAL VISUAL CONCEPT</span><span>NOT FOR MEDICAL DIAGNOSIS</span></div></footer>
 </main>;
}
