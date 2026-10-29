# SpaceCraft graduation demo — 8 minutes

## Before presenting

- Run `npm ci`, `npm run build`, and the verification commands in README.
- Start `npm run dev` (or `npm run preview` after a build) and keep that terminal open.
- Use desktop Chrome with hardware acceleration enabled. Try Balanced graphics first.
- Keep the same browser and origin to retain IndexedDB projects.
- Download or retain `public/demo/graduation-room.spacecraft.json` as an importable backup.
- Rehearse pointer lock once. Escape returns control immediately. Close other GPU-heavy applications.
- Use Preferences to replay onboarding if desired; dismiss it before the timed demo.

## Timed walkthrough

**0:00–0:50 — The idea.** “SpaceCraft turns a room idea into an editable, explorable 3D layout without an account or backend.” Show the landing page, subtle scroll effects, and Explore in 3D. Explain that the preview is a real interactive scene.

**0:50–1:40 — Create the room.** Open the workspace, create “My graduation room”, choose Empty Room, width 4 m, length 5 m, height 2.8 m. Open the studio.

**1:40–3:10 — Arrange.** Add Luna queen bed, Studio writing desk, Task office chair and Linea wardrobe. Use library search. Select a piece and drag a colored move handle. Use R to rotate and enter a precise position in the inspector. Show the Scene tab and lock the bed.

**3:10–4:00 — Set the mood.** In Room, change wall color and floor from oak to walnut. Select a furniture piece and change its color/material. Change daylight to warm evening, then return to daylight for clarity.

**4:00–4:40 — Plan.** Switch to 2D plan. Move a piece and switch to 3D studio to demonstrate shared state. Undo and redo. Reset the camera if needed.

**4:40–5:40 — Walk.** Choose Walk through, then Start walking. Use WASD and mouse look. Walk toward a wall, then the bed to demonstrate collision. Show that the camera remains at human height. Press Escape to exit. Explain that collision uses conservative furniture footprints, so users cannot walk through table legs.

**5:40–6:40 — Keep the work.** Switch theme. Wait for All changes saved. Reload and select the same object from Scene. Export a PNG and an editable JSON file. Go back to the dashboard, import the JSON, and open the restored copy.

**6:40–8:00 — Engineering.** Explain the serializable Zustand state, bounded history, versioned Dexie persistence, Zod import validation, shared R3F scene, subdivided circle-vs-oriented-rectangle collision and scoped reduced-motion-aware landing animations. Mention tests and the measured results in FEATURES.md; do not promise unmeasured performance.

## Recovery plan

- If creating/arranging takes too long, import the backup JSON from the dashboard.
- If WebGL is unavailable, show the dashboard and accessible inspector, JSON round trip and screenshots. State plainly that live WebGL could not be demonstrated on that device.
- If autosave fails, export JSON immediately. Do not clear browser data.
- If pointer lock is refused, click Start walking again after the browser cooldown; use the visible Exit walkthrough button to recover.
- If a piece is hidden or locked, use Scene to restore visibility/unlock it.

This is a presenter guide and backup project, not a prerecorded video or a performance guarantee.
