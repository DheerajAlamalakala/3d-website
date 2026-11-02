# FORM·FIELD — immersive WebGL site (Vite + vanilla JS + Three.js)

    npm install
    npm run dev      # local preview
    npm run build    # static files in dist/ (deploy anywhere)

Where to tweak things
- Colours:        src/experience/Particles.js  (uColorA / uColorB)
- Glow & grain:   src/experience/Effects.js
- Particle shapes src/experience/Particles.js  (knot / orb / wave field)
- Projects:       src/data/projects.js         (titles, copy, tags)
- Card artwork:   src/utils/artwork.js         (swap for real images with TextureLoader)
- Intro timing:   src/experience/Preloader.js
- Page text:      index.html
