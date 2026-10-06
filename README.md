# Zoomarati

A colourful browser-based endless runner inspired by the Zoomarati characters and brand.

## Current milestone

**v0.1 playable prototype**

- Phaser 3 + Vite
- Responsive 1280×720 game canvas
- Keyboard and touch jump controls
- Endless obstacle spawning
- Collectibles and scoring
- Progressive speed increase
- Local best score
- Placeholder vector-style runtime artwork so development is not blocked on final brand assets

## Run locally

```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

## Production build

```bash
npm run build
```

The generated `dist/` directory is a static site and can be hosted directly or embedded into the Zoomarati WordPress site.

## Controls

- **Space / Up Arrow** — jump
- **Tap** — jump
- After game over: **Space / tap** — restart

## Asset plan

The current prototype deliberately uses generated placeholder textures. Once approved artwork is available, replace these with proper sprite sheets and branded environment assets under `public/assets/`.

Suggested production sprites:

- runner-idle
- runner-run (6–8 frames)
- runner-jump
- runner-duck
- runner-hit
- runner-celebrate

Suggested world assets:

- parallax sky
- township / general dealer storefronts
- bottle collectibles by flavour
- fruit collectibles
- crates / puddles / ice / signs as obstacles
- particles and impact FX

## Next

1. Add real demo character art.
2. Add parallax scrolling backgrounds.
3. Add duck / slide mechanic.
4. Add flavour combos and power-ups.
5. Add start / character-select screen.
6. Add sound and music.
7. Add optional online leaderboard.
