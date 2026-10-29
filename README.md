# SpaceCraft 1.0

A browser-based, single-room interior design studio built with React, TypeScript, Three.js and React Three Fiber. Projects stay on the current device; no backend, account, paid API or external model host is required.

## Run locally

Requires Node.js 22.12+ (Node 24 was used during development).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`. Keep using the same origin: IndexedDB projects are scoped to the browser profile and origin.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run preview
```

Playwright uses installed Google Chrome by default. To use its bundled Chromium instead, set `PLAYWRIGHT_CHANNEL=chromium` and install the matching Playwright browser with `npx playwright install chromium`. Browser automation needs permission to launch subprocesses and reach localhost.

## Studio workflow

1. Create a project with dimensions in meters; choose meter or centimeter display units.
2. Click a catalog piece to add it. Use the colored handles or the inspector to move, rotate, resize and customize it.
3. Switch to the Scene tab to select hidden pieces and manage visibility or locks.
4. Switch to 2D for an orthographic layout or select a camera preset.
5. Choose Walk through, then Start walking. Use WASD, mouse look and Shift. Escape exits.
6. Wait for **All changes saved**. If saving fails, export a JSON backup.
7. Export PNG, JSON or a text summary. Import JSON from the dashboard.

`G` / `R` / `S` selects move / rotate / scale. Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z redoes, Ctrl/Cmd+D duplicates, Ctrl/Cmd+S saves, Delete removes after confirmation. Inputs do not trigger editing shortcuts.

## Landing motion

The 1.0 landing page uses Motion for React for one-time reveals, staggered template cards, heading lines and subtle visual parallax. Native CSS smooth scrolling is scoped to the landing route. The landing hero now has an automatically loaded, pinned 3D camera journey: scrolling descends from the exterior overview, enters through a real doorway at eye level, and pans across the interior. Scrolling upward reverses the route. Reduced motion keeps a static overview without the long pinned section. See LANDING_JOURNEY.md for implementation and verification details. There is no scroll hijacking or Lenis dependency. Reduced-motion preferences disable movement and native smooth scrolling; reveal markup is visible by default.

## Project structure

- `src/types`: validated serializable project data.
- `src/db`: versioned Dexie storage.
- `src/features/editor`: scene, camera, collision, history, autosave and panels.
- `src/features/furniture`: editable catalog, licensed model integration and thumbnails.
- `src/features/templates`: six editable starting rooms.
- `src/features/export`: validated JSON import, PNG download and summary export.
- `src/features/landing`: reusable, scoped motion components and styles.
- `src/pages`, `src/components`: routed UI and shared accessible controls.
- `src/tests`, `e2e`: unit, component and real-browser verification.

See [ARCHITECTURE.md](ARCHITECTURE.md), [PREMIUM_UI_REDESIGN.md](PREMIUM_UI_REDESIGN.md) and [DEMO_GUIDE.md](DEMO_GUIDE.md) for design decisions, verification and limits.

## Data and assets

Export `.spacecraft.json` files before clearing browser data, changing browsers or moving devices. Private browsing may discard designs. Importing creates a new project rather than overwriting an existing one.

The editable catalog contains 38 entries. The existing model integration maps 15 entries to 13 licensed models; remaining entries retain studio geometry. The landing showcase uses six of the licensed models, PBR texture sets and HDR lighting. This UI phase preserves that renderer and asset work. See [SHOWCASE_GRAPHICS.md](SHOWCASE_GRAPHICS.md) and the visible 3D asset credits link for sources, licences and limitations. No third-party asset service is contacted at runtime. Lucide icons are provided by the installed ISC-licensed package; other dependency licences are retained in their packages.

## Hosting

`npm run build` creates `dist/`. Any static host can serve it; configure a fallback to `index.html` for React Router routes. This workspace has not been published to a remote service.
