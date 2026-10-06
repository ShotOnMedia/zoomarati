# Zoomarati

A colourful browser-based endless runner inspired by the Zoomarati characters and brand.

## Current milestone

**v0.4 first playable build**

- Phaser 3 + Vite
- Responsive 1280×720 canvas
- Start screen with **Play for Fun** and reserved **Play for Prizes** paths
- Fun runs are explicitly local-only and cannot become prize submissions
- Keyboard/touch jumping, keyboard ducking and pause
- Ground collision and endless runner physics
- Multiple obstacle types
- Bottle collectibles
- Score, distance and bottle counters
- Progressive speed/difficulty
- Local Fun-mode best score
- Results/restart flow
- Prize mode intentionally disabled until authenticated, server-issued game sessions and score validation exist

## Competition architecture

Prize competition is an end goal, so gameplay is being built with it in mind from the start.

Planned official periods include daily, weekly, monthly and optionally yearly leaderboards. The backend will store immutable verified runs and derive competition rankings from them. Browser/local scores are never authoritative.

A future prize run will follow:

1. Player authenticates.
2. Server creates a signed/unique run session.
3. Client plays while collecting validation telemetry/checkpoints.
4. Client submits the completed run.
5. Server validates plausibility and anti-replay rules.
6. Accepted run becomes eligible for configured competition periods.
7. Potential winning runs can be reviewed before prizes are awarded.

A completed Fun run can never be converted into a Prize run.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The generated `dist/` directory is static and can be hosted directly or embedded into WordPress.

## Docker playtest

```bash
docker compose up -d --build
```

Open port **8080** on the host by default. To use another local port:

```bash
ZOOMARATI_PORT=8090 docker compose up -d --build
```

The container serves the production Vite build through nginx and includes a basic HTTP health check.

## Controls

- **Space / Up Arrow / tap lower game area** — jump
- **Down Arrow** — duck
- **P / pause icon** — pause/resume
- **Esc after a run** — main menu
- **Space / tap after a run** — restart

## Asset plan

Runtime-generated placeholder textures deliberately keep gameplay development independent of final brand artwork. Production assets will move under `public/assets/` and include animated runner sprites, parallax scenery, flavour collectibles, hazards, particles and UI.

## Roadmap

- **v0.2** — game foundation ✅
- **v0.3** — visual world, parallax and animation-ready runner ✅
- **v0.4** — combos, power-ups, gameplay variety and first playtest build ✅
- **v0.5** — accounts + API/database backend
- **v0.6** — verified run sessions + anti-cheat
- **v0.7** — daily/weekly/monthly/yearly leaderboards
- **v0.8** — competition/prize administration
- **v0.9** — testing and hardening
- **v1.0** — launch
