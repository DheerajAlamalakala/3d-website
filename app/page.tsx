"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Activity, ArrowDown, ArrowRight, ArrowUpRight, Brain, Dna, Eye, HeartPulse, Menu, Microscope, Orbit, Scan, Shield, Sparkles, X, Zap } from "lucide-react";

const chapters = [
  { tag: "01 / THE HUMAN FRONTIER", title: "THE HUMAN\nBODY. REIMAGINED.", body: "A living universe of systems, signals and structures. Explore the extraordinary architecture beneath the surface." },
  { tag: "02 / THE NEURAL NETWORK", title: "EVERY SIGNAL\nTELLS A STORY.", body: "A vast communication network connects thought, movement and sensation in a continuous exchange of information." },
  { tag: "03 / THE LIVING ENGINE", title: "PRECISION IN\nEVERY HEARTBEAT.", body: "From circulation to respiration, discover the interconnected systems that sustain human life." },
  { tag: "04 / BEYOND THE VISIBLE", title: "LOOK CLOSER.\nUNDERSTAND MORE.", body: "A new perspective on anatomy, where science, visualisation and emerging technology meet." }
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
  const progressRef=useRef(0), xrRequest=useRef<(() => Promise<void>) | null>(null);
  const [chapterIndex,setChapterIndex]=useState(0), [progress,setProgress]=useState(0);
  const [xrAvailable,setXrAvailable]=useState(false), [xrActive,setXrActive]=useState(false), [xrStatus,setXrStatus]=useState("IMMERSIVE MODE / STANDBY");
  useEffect(()=>{
    const host=mount.current, section=sequence.current; if(!host||!section)return;
    let renderer:THREE.WebGLRenderer;
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"}); }
    catch { host.classList.add("no-webgl"); return; }
    renderer.xr.enabled=true;
    const scene=new THREE.Scene(); scene.background=new THREE.Color("#070711"); scene.fog=new THREE.FogExp2("#070711",0.018);
    const camera=new THREE.PerspectiveCamera(36,1,0.1,180); camera.position.set(0,2.5,13);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7)); renderer.setSize(host.clientWidth,host.clientHeight);
    renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.35;
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0x9ca8ff,0x17101f,2));
    const key=new THREE.DirectionalLight(0xe6e4ff,3.4); key.position.set(-5,10,8); key.castShadow=true; scene.add(key);
    const violet=new THREE.PointLight(0x835cff,95,26,2); violet.position.set(-4,2,1); scene.add(violet);
    const cyan=new THREE.PointLight(0x38d9df,80,24,2); cyan.position.set(4,1,-3); scene.add(cyan);
    const floor=new THREE.Mesh(new THREE.CircleGeometry(16,96),new THREE.MeshBasicMaterial({color:0x111326,transparent:true,opacity:.8}));
    floor.rotation.x=-Math.PI/2; floor.position.y=-3.45; scene.add(floor);
    const grid=new THREE.GridHelper(38,48,0x413b70,0x25243e); grid.position.y=-3.42; (grid.material as THREE.Material).transparent=true; (grid.material as THREE.Material).opacity=.28; scene.add(grid);

    const human=new THREE.Group(); human.position.set(1.65,0,0); scene.add(human);
    const shell=new THREE.MeshPhysicalMaterial({color:0x9b9bdc,metalness:.35,roughness:.28,transparent:true,opacity:.18,clearcoat:1,side:THREE.DoubleSide,depthWrite:false});
    const bone=new THREE.MeshStandardMaterial({color:0xd9d8ed,metalness:.32,roughness:.38,emissive:0x252342,emissiveIntensity:.25});
    const nerve=new THREE.MeshBasicMaterial({color:0xa78bfa});
    const vessel=new THREE.MeshBasicMaterial({color:0xff557d});
    const cyanMat=new THREE.MeshBasicMaterial({color:0x62e9e6});
    const brainMat=new THREE.MeshPhysicalMaterial({color:0xb59cff,metalness:.3,roughness:.2,emissive:0x4424a5,emissiveIntensity:.5});
    const heartMat=new THREE.MeshPhysicalMaterial({color:0xff466f,metalness:.18,roughness:.24,emissive:0x7a102f,emissiveIntensity:.5});
    // Translucent anatomical silhouette
    sphere(human,[0,0.05,0],[1.05,1.62,.48],shell,40);
    sphere(human,[0,1.92,0],[.52,.68,.48],shell,32);
    sphere(human,[-.0,2.68,0],[.48,.52,.43],shell,32);
    // Brain lobes
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2; sphere(human,[Math.cos(a)*.22,2.75+Math.sin(a)*.13,Math.sin(a)*.18],[.23,.2,.2],brainMat,18);}
    // Neck, spine and vertebrae
    human.add(limb(new THREE.Vector3(0,1.45,0),new THREE.Vector3(0,2.25,0),.17,bone));
    for(let i=0;i<19;i++) sphere(human,[0,1.38-i*.225,.02],[.14,.105,.14],bone,12);
    // Rib cage: paired curved arcs
    for(let i=0;i<7;i++){
      const y=1.22-i*.19, w=.62-i*.035, points=[];
      for(let j=0;j<=24;j++){const t=j/24*Math.PI; points.push(new THREE.Vector3(Math.cos(t)*w,y-Math.sin(t)*.25,.24+Math.sin(t)*.1));}
      const curve=new THREE.CatmullRomCurve3(points);
      human.add(new THREE.Mesh(new THREE.TubeGeometry(curve,32,.026,7,false),bone));
    }
    // Pelvis and limbs
    const pelvis=new THREE.Mesh(new THREE.TorusGeometry(.52,.12,12,48,Math.PI),bone); pelvis.position.set(0,-1.15,0); pelvis.rotation.z=Math.PI; human.add(pelvis);
    for(const side of [-1,1]){
      const shoulder=new THREE.Vector3(side*.94,1.48,0), elbow=new THREE.Vector3(side*1.3,.45,.02), wrist=new THREE.Vector3(side*1.42,-.45,.06), hip=new THREE.Vector3(side*.4,-1.2,0), knee=new THREE.Vector3(side*.48,-2.15,.02), ankle=new THREE.Vector3(side*.5,-3.05,0);
      sphere(human,[shoulder.x,shoulder.y,shoulder.z],[.22,.24,.23],bone);
      human.add(limb(shoulder,elbow,.13,bone)); sphere(human,[elbow.x,elbow.y,elbow.z],[.13,.14,.13],bone);
      human.add(limb(elbow,wrist,.095,bone)); sphere(human,[wrist.x,wrist.y,wrist.z],[.11,.2,.1],bone);
      human.add(limb(hip,knee,.19,bone)); sphere(human,[knee.x,knee.y,knee.z],[.16,.17,.16],bone);
      human.add(limb(knee,ankle,.12,bone)); sphere(human,[ankle.x,ankle.y,ankle.z],[.15,.13,.26],bone);
      // Peripheral nerve and arterial paths
      const nerveCurve=new THREE.CatmullRomCurve3([shoulder,new THREE.Vector3(side*1.1,1.0,.2),elbow,wrist]);
      human.add(new THREE.Mesh(new THREE.TubeGeometry(nerveCurve,36,.018,6,false),nerve));
      const legCurve=new THREE.CatmullRomCurve3([hip,new THREE.Vector3(side*.45,-1.7,.15),knee,ankle]);
      human.add(new THREE.Mesh(new THREE.TubeGeometry(legCurve,36,.018,6,false),cyanMat));
    }
    // Heart, lungs and great vessels
    sphere(human,[.18,.35,.34],[.25,.38,.2],heartMat,28);
    sphere(human,[-.36,.42,.24],[.28,.52,.15],new THREE.MeshPhysicalMaterial({color:0x8c70db,transparent:true,opacity:.48,roughness:.25}),24);
    sphere(human,[.48,.42,.24],[.28,.52,.15],new THREE.MeshPhysicalMaterial({color:0x8c70db,transparent:true,opacity:.48,roughness:.25}),24);
    const aorta=new THREE.CatmullRomCurve3([new THREE.Vector3(.2,.55,.43),new THREE.Vector3(.35,.9,.38),new THREE.Vector3(.12,1.08,.3),new THREE.Vector3(-.25,.9,.28)]);
    human.add(new THREE.Mesh(new THREE.TubeGeometry(aorta,40,.055,10,false),vessel));
    // Neural trunk
    const spineNerve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,2.4,.23),new THREE.Vector3(0,1.8,.22),new THREE.Vector3(0,.8,.25),new THREE.Vector3(0,-.5,.2),new THREE.Vector3(0,-1.4,.12)]);
    human.add(new THREE.Mesh(new THREE.TubeGeometry(spineNerve,70,.035,8,false),nerve));

    // Holographic orbital rings and scanning planes
    const haloGroup=new THREE.Group(); scene.add(haloGroup);
    for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(2.65+i*.42,.008,6,180),new THREE.MeshBasicMaterial({color:i%2?0x6c5bff:0x4fe6e4,transparent:true,opacity:.22-i*.03})); ring.rotation.x=Math.PI/2+(i*.17); ring.position.set(1.65,-.15-i*.3,0); haloGroup.add(ring);}
    const scanPlane=new THREE.Mesh(new THREE.PlaneGeometry(6.5,6.5),new THREE.MeshBasicMaterial({color:0x63e9e2,transparent:true,opacity:.055,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})); scanPlane.position.set(1.65,0,.2); scene.add(scanPlane);
    const count=window.innerWidth<700?450:1000, pos=new Float32Array(count*3), seeds=new Float32Array(count);
    for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,r=3+Math.random()*12;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=(Math.random()-.5)*10;pos[i*3+2]=Math.sin(a)*r;seeds[i]=Math.random()*6.28;}
    const pg=new THREE.BufferGeometry(); pg.setAttribute("position",new THREE.BufferAttribute(pos,3));
    const points=new THREE.Points(pg,new THREE.PointsMaterial({color:0x9a91ff,size:.035,transparent:true,opacity:.72,depthWrite:false})); scene.add(points);
    const path=new THREE.CatmullRomCurve3([new THREE.Vector3(0,2.5,13),new THREE.Vector3(3,1.5,9),new THREE.Vector3(-2,1,7),new THREE.Vector3(1,3,-7),new THREE.Vector3(0,2.5,13)]);
    let pointerX=0,pointerY=0,targetX=0,targetY=0,session:any=null;
    const clock=new THREE.Clock();
    const onScroll=()=>{const r=section.getBoundingClientRect(),d=Math.max(1,r.height-innerHeight),p=THREE.MathUtils.clamp(-r.top/d,0,1);progressRef.current=p;setProgress(p);setChapterIndex(Math.min(3,Math.floor(p*4)));};
    const onPointer=(e:PointerEvent)=>{targetX=(e.clientX/innerWidth-.5)*2;targetY=(e.clientY/innerHeight-.5)*2;};
    const resize=()=>{const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));};
    const xr=(navigator as Navigator & {xr?:any}).xr;
    if(xr?.isSessionSupported) xr.isSessionSupported("immersive-vr").then((ok:boolean)=>setXrAvailable(ok)).catch(()=>setXrAvailable(false));
    xrRequest.current=async()=>{
      if(!xr){setXrStatus("WEBXR IS NOT SUPPORTED HERE");return;}
      if(session){await session.end();return;}
      try{setXrStatus("INITIALISING IMMERSIVE SESSION");const next=await xr.requestSession("immersive-vr",{optionalFeatures:["local-floor","bounded-floor","hand-tracking"]});session=next;next.addEventListener("end",()=>{session=null;setXrActive(false);setXrStatus("IMMERSIVE MODE / STANDBY");},{once:true});camera.position.set(0,1.6,8);camera.lookAt(0,0,0);await renderer.xr.setSession(next);setXrActive(true);setXrStatus("IMMERSIVE SESSION ACTIVE");}catch(e){setXrStatus(e instanceof Error?e.message.toUpperCase():"SESSION COULD NOT START");}
    };
    window.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("resize",resize);window.addEventListener("pointermove",onPointer,{passive:true});onScroll();resize();
    renderer.setAnimationLoop(()=>{
      const t=clock.getElapsedTime(),p=progressRef.current;
      pointerX=THREE.MathUtils.lerp(pointerX,targetX,.035);pointerY=THREE.MathUtils.lerp(pointerY,targetY,.035);
      if(!renderer.xr.isPresenting){const cp=path.getPointAt(p);cp.x+=pointerX*.5;cp.y-=pointerY*.25;camera.position.lerp(cp,.035);camera.lookAt(pointerX*.2,.1-pointerY*.15,0);}
      human.position.y=Math.sin(t*.8)*.045;human.rotation.y=Math.sin(t*.18)*.12+p*.25;
      haloGroup.rotation.y=t*.045;haloGroup.rotation.z=Math.sin(t*.2)*.035;
      scanPlane.position.y=Math.sin(t*.32)*2.5;scanPlane.material.opacity=.025+(.04*(.5+.5*Math.sin(t*1.4)));
      const arr=pg.attributes.position.array as Float32Array;for(let i=0;i<count;i++)arr[i*3+1]=pos[i*3+1]+Math.sin(t*.3+seeds[i])*.22;pg.attributes.position.needsUpdate=true;points.rotation.y=t*.012;
      violet.intensity=80+Math.sin(t*.8)*15;cyan.intensity=68+Math.cos(t*.7)*12;
      renderer.render(scene,camera);
    });
    return()=>{renderer.setAnimationLoop(null);if(session)session.end().catch(()=>{});xrRequest.current=null;window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",resize);window.removeEventListener("pointermove",onPointer);scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});renderer.dispose();if(host.contains(renderer.domElement))host.removeChild(renderer.domElement);};
  },[]);
  const chapter=chapters[chapterIndex];
  return <section className="anatomy-sequence" id="top" ref={sequence}>
    <div className="anatomy-sticky">
      <div className="anatomy-canvas" ref={mount}/><div className="scene-vignette"/><div className="scene-grain"/>
      <div className="scene-meta"><span>ANATOMY / VISUAL RESEARCH 001</span><span>HUMAN SYSTEMS / INTERACTIVE ATLAS</span></div>
      <div className="hero-copy" key={chapterIndex}><p className="eyebrow"><i/>{chapter.tag}</p><h1>{chapter.title.split("\n").map((line,i)=><span key={line}>{line}{i===0&&<br/>}</span>)}</h1><p className="hero-description">{chapter.body}</p><a href="#atlas" className="hero-action">ENTER THE ATLAS <ArrowUpRight size={15}/></a></div>
      <div className="hero-side-note"><span>FIG. 001</span><i/> <span>ANATOMICAL SYSTEMS</span></div>
      <button className="xr-button" disabled={!xrAvailable&&!xrActive} onClick={()=>xrRequest.current?.()}><Orbit size={15}/>{xrActive?"EXIT IMMERSIVE":"ENTER IMMERSIVE"}</button><span className="xr-status">{xrStatus}</span>
      <div className="scene-bottom"><span>SCROLL TO EXPLORE</span><div className="progress-line"><i style={{transform:"scaleX("+progress+")"}}/></div><span>{String(Math.round(progress*100)).padStart(2,"0")}%</span><div className="chapter-dots">{chapters.map((c,i)=><span key={c.tag} className={i===chapterIndex?"active":""}>{c.tag.slice(0,2)}</span>)}</div><a href="#atlas" aria-label="Explore anatomy"><ArrowDown size={17}/></a></div>
    </div>
  </section>;
}

export default function Home(){
 const [menu,setMenu]=useState(false),[active,setActive]=useState(0);const item=systems[active];
 useEffect(()=>{const els=Array.from(document.querySelectorAll<HTMLElement>(".reveal"));const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target);}}),{threshold:.12});els.forEach(e=>io.observe(e));return()=>io.disconnect();},[]);
 const close=()=>setMenu(false);
 return <main className="site-shell">
  <nav className="nav"><a className="brand" href="#top" onClick={close}><span className="brand-symbol"><Activity size={19}/></span><span>VITAL<span className="brand-accent">/</span>FORM</span></a><div className="nav-links"><a href="#atlas">ATLAS</a><a href="#systems">SYSTEMS</a><a href="#future">FRONTIER</a></div><a className="nav-cta" href="#atlas">EXPLORE THE BODY <ArrowUpRight size={14}/></a><button className="menu-button" onClick={()=>setMenu(!menu)} aria-label="Toggle menu">{menu?<X/>:<Menu/>}</button>{menu&&<div className="mobile-menu"><a href="#atlas" onClick={close}>ATLAS ↗</a><a href="#systems" onClick={close}>SYSTEMS ↗</a><a href="#future" onClick={close}>FRONTIER ↗</a></div>}</nav>
  <AnatomyStage/>
  <section className="intro-section" id="atlas"><div className="section-kicker reveal"><span>01 / THE ANATOMICAL ATLAS</span><span>FORM FOLLOWS FUNCTION</span></div><div className="intro-grid"><div className="reveal"><p className="light-label">A NEW WAY TO SEE YOURSELF</p><h2>NOT JUST<br/>A BODY.<br/><em>A UNIVERSE.</em></h2></div><div className="intro-copy reveal"><span className="accent-rule"/><p>Every movement, every thought, every heartbeat is the result of extraordinary systems working together. VITAL/FORM is an immersive exploration of the human body — from its visible architecture to the invisible signals that bring it to life.</p><a href="#systems" className="text-link">EXPLORE THE SYSTEMS <ArrowRight size={15}/></a><div className="intro-index"><span>01</span><span>HUMAN BIOLOGY / DIGITAL EXPLORATION</span></div></div></div></section>
  <section className="systems-section" id="systems"><div className="systems-heading reveal"><div><p className="light-label">02 / INTERACTIVE SYSTEMS</p><h2>FOUR LAYERS.<br/><em>ONE LIFE.</em></h2></div><p>Choose a system to reveal its role in the living network. This is an educational visual concept, not a diagnostic tool.</p></div><div className="system-explorer"><div className="system-list">{systems.map((s,i)=><button key={s.id} className={i===active?"system-choice active":"system-choice"} onClick={()=>setActive(i)}><span>{s.n}</span><strong>{s.title}</strong><ArrowUpRight size={16}/></button>)}</div><article className="system-detail" key={item.id}><div className="detail-orbit"><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="orbit-ring ring-three"/><div className="detail-core" style={{color:item.color}}><item.icon size={42} strokeWidth={1.2}/></div><span className="orbit-node node-one"/><span className="orbit-node node-two"/></div><div className="detail-copy"><p className="light-label">{item.subtitle}</p><h3>{item.title}<span>.</span></h3><p>{item.text}</p><div className="detail-stat"><span>REFERENCE / {item.n}</span><strong>{item.stat}</strong></div></div></article></div></section>
  <section className="microscopic-section"><div className="micro-orb orb-a"/><div className="micro-orb orb-b"/><div className="micro-content reveal"><p className="light-label">03 / SCALE IS RELATIVE</p><h2>FROM THE<br/>ORGAN TO THE<br/><em>INFINITE SMALL.</em></h2><p>Zoom through the scales of human biology. The same principles of structure, signal and adaptation echo from whole-body systems down to the cellular frontier.</p><div className="scale-labels"><span>ORGANISM</span><i/><span>ORGAN</span><i/><span>CELL</span><i/><span>MOLECULE</span></div></div></section>
  <section className="future-section" id="future"><div className="future-top reveal"><span>04 / THE NEXT FRONTIER</span><span>SCIENCE × DESIGN × TECHNOLOGY</span></div><div className="future-main"><div className="future-title reveal"><p className="light-label">A NEW DIMENSION OF UNDERSTANDING</p><h2>THE FUTURE<br/>IS <em>HUMAN.</em></h2></div><div className="future-copy reveal"><Sparkles size={24}/><p>New tools are changing how we visualise, study and understand the body. VITAL/FORM brings anatomy into an interactive digital space — designed to spark curiosity and make complex systems feel tangible.</p><span>SEE THE SYSTEM. UNDERSTAND THE CONNECTION.</span></div></div><div className="future-bottom"><span>VITAL/FORM — AN INTERACTIVE ANATOMY CONCEPT</span><span>BUILT TO EXPLORE WHAT MAKES US, US.</span></div></section>
  <footer className="footer"><div className="footer-top"><span>VITAL/FORM</span><span>THE HUMAN BODY / REIMAGINED</span></div><div className="footer-main reveal"><p className="light-label">ENDLESSLY COMPLEX. BEAUTIFULLY CONNECTED.</p><h2>STAY<br/><em>CURIOUS.</em></h2><a href="#top">BACK TO THE SURFACE <ArrowUpRight size={16}/></a></div><div className="footer-bottom"><span>© 2026 VITAL/FORM — EDUCATIONAL VISUAL CONCEPT</span><span>NOT FOR MEDICAL DIAGNOSIS</span></div></footer>
 </main>;
}
