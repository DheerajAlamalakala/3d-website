# VITAL/FORM — Immersive Human Anatomy

VITAL/FORM is a futuristic, interactive human-anatomy website concept. It replaces the former marine concept with a digital anatomy atlas built around a procedural Three.js human figure, holographic visual language, interactive system explorer and optional WebXR immersive mode.

> **Project status:** Educational visual prototype. The anatomy is stylised and procedural, not a clinically accurate anatomical model or a medical diagnostic tool.

## Experience

- Scroll-driven cinematic introduction with a live 3D anatomical figure.
- Procedural human silhouette, skeletal framework, rib cage, brain, heart, lungs and illustrative nerve/vessel paths.
- Animated holographic rings, scan plane, particles, atmospheric lighting and grid environment.
- Interactive atlas for nervous, cardiovascular, skeletal and cellular systems.
- Optional WebXR immersive VR session on supported devices and browsers.
- Responsive navigation and layouts, with reduced-motion CSS support.

## Stack

- Next.js 14 / React 18 / TypeScript
- Three.js WebGLRenderer and WebXR Device API
- Lucide React icons
- CSS animations and responsive styling

## Run locally

```bash
git clone https://github.com/DheerajAlamalakala/3d-website.git
cd 3d-website
npm install
npm run dev
```

Open http://localhost:3000.

For a production build:

```bash
npm run build
npm start
```

## WebXR

The site uses WebGL for its real-time 3D scene. The optional **Enter Immersive** control requests an `immersive-vr` WebXR session when the browser reports support. WebXR requires a compatible headset/browser and a secure context (HTTPS or localhost). Standard desktop and mobile browsing remains available without a headset.

## Project structure

```text
app/
  globals.css   # Visual system, responsive layout and motion
  layout.tsx    # Metadata and root layout
  page.tsx      # Anatomy scene, WebXR session and page experience
```

## Limitations and responsible use

- Anatomy is a stylised educational visualisation and does not represent a validated medical model.
- It must not be used for diagnosis, treatment, clinical training or medical decision-making.
- The cellular section is a conceptual scale narrative; it is not yet a molecular simulation.
- WebXR availability depends on the visitor's device, browser and secure context.
- Rendering quality and frame rate vary by hardware. Real-world testing and optimisation are still required.

## Deployment

Connect the repository to Vercel with the Next.js framework preset, project root `./`, and default build/output settings. Pushes to the connected branch trigger deployments.

## License

No license is specified. All rights remain with the respective copyright holder unless a license is added.
