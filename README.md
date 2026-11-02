# AQUAVANT — 3D Marine Technology Experience

AQUAVANT is a cinematic, scroll-driven website concept for an autonomous marine rescue and response vessel. Built with Next.js, React, TypeScript, and Three.js, the experience combines a procedural 3D vessel, an animated ocean surface, and scroll-linked camera and component animations to present the concept as an interactive product story.

> **Project status:** Visual concept / frontend prototype. The vessel is procedurally modelled in Three.js and is not an engineering-accurate or production-ready vessel design.

## Overview

AQUAVANT presents a marine technology concept through a full-page visual narrative. As visitors scroll, the 3D scene changes perspective and the vessel moves through different presentation states. The page also introduces the concept's engineering and rescue-oriented features through supporting content sections.

## Features

- **Procedural 3D vessel:** A marine craft assembled from Three.js geometries and materials.
- **Scroll-driven presentation:** Scroll progress controls the scene's camera movement and vessel presentation.
- **Animated water:** A continuously updated ocean surface adds motion to the scene.
- **Exploded-view animation:** Selected vessel components move apart to create a component-focused view.
- **Cinematic scene:** Lighting, fog, and scene composition create a focused marine-product presentation.
- **Storytelling sections:** Chapter-style headings, engineering content, and a closing section guide visitors through the concept.
- **Responsive interface:** Layout styling adapts the experience to different screen sizes.
- **Iconography:** Lucide React icons support interface and content elements.

## Technology stack

| Technology | Purpose |
| --- | --- |
| Next.js 14 | React framework and application structure |
| React 18 | UI and component rendering |
| TypeScript | Type-safe application code |
| Three.js | 3D scene, vessel geometry, materials, and animation |
| Lucide React | Interface icons |
| CSS | Layout, typography, visual styling, and responsive presentation |

## Project structure

```text
3d-website/
├── app/
│   ├── globals.css   # Global styles and responsive presentation
│   ├── layout.tsx    # Root application layout and metadata
│   └── page.tsx      # Main AQUAVANT experience and Three.js scene
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

## Getting started

### Prerequisites

- Node.js compatible with Next.js 14
- npm

### 1. Clone the repository

```bash
git clone https://github.com/DheerajAlamalakala/3d-website.git
cd 3d-website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the local development server |
| `npm run build` | Creates an optimized production build |
| `npm start` | Starts the production server after a successful build |

To test a production build locally:

```bash
npm run build
npm start
```

## How the 3D experience works

The main experience is implemented in `app/page.tsx`.

### Scene setup

Three.js creates the scene, camera, renderer, lighting, fog, water surface, and procedural vessel. The vessel is composed of individual meshes rather than loaded from an external CAD or 3D model file.

### Scroll-linked animation

The page tracks scroll progress and uses it to update the camera and vessel presentation. The camera moves around and toward the craft as the visitor progresses through the story. Vessel rotation and scale also change with the presentation.

### Animated ocean

The water surface is built from geometry whose vertices are updated over time using wave functions, creating a simple animated ocean effect.

### Exploded view

Selected parts of the vessel—such as the cabin, roof, mast, sensor, and rescue ring—can move away from their assembled positions during the exploded-view portion of the scroll experience.

## Customisation

Useful starting points when adapting the project:

- **Page content and scene behaviour:** `app/page.tsx`
- **Global styling and responsive rules:** `app/globals.css`
- **Root layout and metadata:** `app/layout.tsx`
- **Dependencies and scripts:** `package.json`

When changing the 3D scene, keep the animation lifecycle in mind. Any renderer, geometry, material, or event listener created by a React effect should be cleaned up when the component unmounts to avoid unnecessary resource usage.

## Deployment

The project can be deployed to [Vercel](https://vercel.com/) using its native Next.js support.

1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project**.
3. Import `DheerajAlamalakala/3d-website`.
4. Keep the framework preset as **Next.js** and the project root as `./`.
5. Use the default install and build settings.
6. Deploy.

Vercel will build the Next.js application and provide a deployment URL. Subsequent pushes to the connected branch can trigger new deployments.

## Current limitations

- The vessel is a stylised procedural concept, not a dimensionally accurate marine vehicle.
- The ocean and vessel visuals are illustrative and do not represent a validated physical simulation.
- The project is a frontend experience; it does not currently provide vessel control, navigation, telemetry, or rescue-operation functionality.
- The contact details and other example content should be replaced with verified project information before public or commercial use.
- Performance will vary with device capabilities because the page renders a real-time 3D scene.

## Possible future improvements

- Replace or supplement procedural geometry with a detailed, optimised 3D asset.
- Add reduced-motion handling and further accessibility refinements.
- Profile and optimise rendering for lower-powered mobile devices.
- Add real product specifications, validated imagery, and verified contact information.
- Introduce genuine product data or backend integrations if the concept evolves beyond a visual prototype.

## License

No license is currently specified for this repository. Unless a license is added, the source code remains subject to the default copyright rules; do not assume it is open for reuse or redistribution.
