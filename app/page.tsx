"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowDownRight, ArrowUpRight, Menu, X } from "lucide-react";
import World from "./World";

const sections = ["WORK", "EXPERIMENTS", "STUDIO", "CONTACT"];

export default function Home() {
  const [active, setActive] = useState("HOME");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nodes = ["home", "work", "experiments", "studio", "contact"]
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id.toUpperCase());
    }, { rootMargin: "-38% 0px -48% 0px", threshold: [0, 0.15, 0.35, 0.6] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <main className="site-shell">
      <World />
      <div className="grain" />
      <header className="topbar">
        <a className="wordmark" href="#home" onClick={(e) => { e.preventDefault(); go("HOME"); }}>FORM<span>·</span>FIELD</a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {sections.map((section, index) => (
            <button key={section} className={active === section ? "selected" : ""} onClick={() => go(section)}>
              <small>0{index + 1}</small>{section}
            </button>
          ))}
        </nav>
        <button className="contact-nav" onClick={() => go("CONTACT")}>LET&apos;S TALK <ArrowUpRight size={15} /></button>
        <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
        {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">
          {["HOME", ...sections].map((section, index) => (
            <button key={section} onClick={() => go(section)}><span>0{index + 1}</span>{section}<ArrowUpRight size={15} /></button>
          ))}
        </nav>}
      </header>
      <div className="progress-track"><span style={{ transform: `scaleX(${(["HOME", ...sections].indexOf(active)) / 4})` }} /></div>

      <section className="panel hero" id="home">
        <div className="eyebrow"><span className="live-dot" /> INDEPENDENT CREATIVE TECHNOLOGY STUDIO <span>HYDERABAD / EVERYWHERE</span></div>
        <div className="hero-content">
          <p className="overline">A DIGITAL WORLD IN CONSTANT MOTION</p>
          <h1>MAKE<br /><em>WONDER</em><br />HAPPEN<span className="period">.</span></h1>
          <div className="hero-bottom">
            <p>We create immersive digital experiences where design, technology and imagination become one.</p>
            <button className="round-link" onClick={() => go("WORK")} aria-label="Explore selected work"><ArrowDown size={22} /></button>
          </div>
        </div>
        <div className="hero-index">01 <span>/ 05</span></div>
        <div className="hero-side">SCROLL TO MOVE THROUGH THE FIELD</div>
      </section>

      <section className="panel work" id="work">
        <div className="section-meta"><span>01 — SELECTED WORLDS</span><span>DESIGN / INTERACTION / REALTIME</span></div>
        <div className="work-heading"><p className="overline">NOT BUILT TO SIT STILL</p><h2>THE WEB<br />IS A <em>PLACE.</em></h2><p className="body-copy">We make digital spaces that invite people to look closer, move around and discover something unexpected.</p></div>
        <div className="work-index">
          <button onClick={() => go("EXPERIMENTS")}><span>01 / EXPERIENCE</span><strong>WORLDS<br />WITHOUT EDGES</strong><i>EXPLORE <ArrowUpRight size={16} /></i></button>
          <button onClick={() => go("EXPERIMENTS")}><span>02 / GENERATIVE</span><strong>MATTER<br />IN MOTION</strong><i>EXPLORE <ArrowUpRight size={16} /></i></button>
          <button onClick={() => go("EXPERIMENTS")}><span>03 / INTERACTION</span><strong>TOUCH THE<br />IMPOSSIBLE</strong><i>EXPLORE <ArrowUpRight size={16} /></i></button>
        </div>
        <div className="section-foot"><span>FORM FOLLOWS FEELING</span><span>01 / 04</span></div>
      </section>

      <section className="panel experiments" id="experiments">
        <div className="section-meta"><span>02 — THE PLAYGROUND</span><span>ALWAYS IN PROGRESS</span></div>
        <div className="experiment-content"><div><p className="overline">NO FIXED OUTCOME</p><h2>CURIOUS<br />BY <em>NATURE.</em></h2></div><div className="experiment-copy"><p>What if a website behaved like a material? What if light could flow, geometry could breathe and every movement left a trace?</p><p>We explore the space between code and sensation — building tools, systems and strange little worlds just to see what happens.</p><button className="text-link" onClick={() => go("STUDIO")}>INSIDE THE STUDIO <ArrowUpRight size={16} /></button></div></div>
        <div className="manifesto"><span>CODE IS A MATERIAL</span><span>PLAY IS A METHOD</span><span>WONDER IS THE POINT</span></div>
      </section>

      <section className="panel studio" id="studio">
        <div className="section-meta"><span>03 — THE STUDIO</span><span>DESIGN × TECHNOLOGY × MOTION</span></div>
        <p className="overline">SMALL TEAM. BIG CURIOSITY.</p>
        <h2>WE MAKE<br />THE DIGITAL<br /><em>FEEL ALIVE.</em></h2>
        <div className="studio-bottom"><p>FORM·FIELD is an independent creative technology studio exploring the space between design and engineering. We build immersive websites, interactive installations and generative experiences.</p><div className="capabilities"><span>01&nbsp; CREATIVE DEVELOPMENT</span><span>02&nbsp; REALTIME 3D & WEBGL</span><span>03&nbsp; INTERACTIVE STORYTELLING</span><span>04&nbsp; GENERATIVE SYSTEMS</span></div></div>
      </section>

      <section className="panel contact" id="contact">
        <div className="section-meta"><span>04 — YOUR MOVE</span><span>END OF TRANSMISSION / BEGINNING OF SOMETHING</span></div>
        <p className="overline">HAVE AN IDEA?</p>
        <h2>LET&apos;S MAKE<br /><em>IT MATTER.</em></h2>
        <p className="contact-copy">A strange idea. A difficult problem. A world that should exist. Tell us about it.</p>
        <a className="contact-button" href="mailto:hello@formfield.studio">START A CONVERSATION <ArrowUpRight size={17} /></a>
        <footer><a className="wordmark" href="#home" onClick={(e) => { e.preventDefault(); go("HOME"); }}>FORM<span>·</span>FIELD</a><span>INDEPENDENT DIGITAL STUDIO / 2026</span><button onClick={() => go("HOME")}>BACK TO THE TOP ↑</button></footer>
      </section>
      <div className="scroll-label"><span>{active}</span><span>SCROLL / EXPLORE</span></div>
    </main>
  );
}
