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


## 3D anatomy assets

The interactive anatomy lab loads three GLB assets from `public/models/`:

- `full-adult-skeleton-standing.glb` — 238 separately named skeletal meshes.
- `full-body-muscular-system-selected-deep-layer.glb` — individually named muscle structures.
- `torso-with-removable-organs.glb` — 56 individually named torso and organ meshes.

The models are served locally by Next.js and loaded with Three.js `GLTFLoader`. The viewer supports orbit rotation, zoom, layer visibility and selecting named meshes.

### Install the supplied model pack

Extract `VITAL-FORM-model-assets.zip` at the repository root. It contains the three GLB files under `public/models/` and an asset licence note. Commit the resulting `public/models/` directory to GitHub.

The three Innerscene models are labelled CC0/public domain on their source pages. The supplied Z-Anatomy archive is not part of this model pack: its licence is CC BY-SA 4.0 and its own attribution notes identify some third-party assets with non-commercial restrictions. Check the licence of each extracted Z-Anatomy asset before publishing it.

Model asset pages:
- https://www.innerscene.com/tools/library/3d-parts/full-adult-skeleton-standing-ade55011
- https://www.innerscene.com/tools/library/3d-parts/full-body-muscular-system-selected-deep-layer-959a514b
- https://www.innerscene.com/tools/library/3d-parts/torso-with-removable-organs-1fe1b70a

These models are educational visualisations and are not clinically validated for diagnosis or treatment.
