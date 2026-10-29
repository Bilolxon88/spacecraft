# Landing room camera journey

The hero mounts a dedicated React Three Fiber scene automatically. The graphics Phase 1 upgrade replaces its furniture recipes with a local licensed model registry following the same Scandinavian layout. Editor rendering, cameras, history and interaction code are unchanged. See SHOWCASE_GRAPHICS.md for materials, lighting and licences.

## Scroll and camera

`RoomJourney` measures native document scroll from the top of its section to the bottom of its sticky viewport. Motion's `useScroll` and a damped spring provide normalized progress; there is no wheel interception, pointer lock, nested scrolling or additional animation dependency.

The canvas stays pinned using CSS `position: sticky`. The desktop journey spans 380 viewport heights and the mobile journey spans 340. The initial overview sits beside the existing hero copy, then opens into the full viewport during the approach. Actual camera position, look target, field of view and initial off-axis framing are updated in the R3F render loop. CSS clipping is only the presentation frame around the live canvas; it does not simulate the camera movement.

`journeyPath.ts` contains absolute centripetal Catmull–Rom curves for camera position and look target. A smoothstep remaps progress at the route ends. The route descends from an elevated exterior view, aligns with a central doorway, enters at 1.65 m, skirts the coffee table and pans across the seating, wood flooring and plant. Sampling absolute progress makes reverse scrolling and large scroll jumps deterministic.

The facade is built from two piers and a header, leaving a real 1.6 × 2.35 m opening. Camera clearance is 0.23 m. The path test samples 2,001 positions against the actual wall/frame boxes and the existing furniture collision footprints. This validates the fixed presentation layout; the landing journey is not an arbitrary user-project path planner.

## Accessibility and performance

- Native wheel, touch, keyboard and anchor navigation remain available.
- A visible Skip room tour link advances directly to the next content section.
- Reduced motion uses a static exterior camera and removes the long pinned section. A media-query subscription responds to changes during the visit.
- WebGL/render failure removes the pin duration and shows the existing vector room fallback.
- The scene is lazy-loaded with cached glTF assets, owned instance materials, quality-dependent pixel/shadow limits and demand rendering. Scroll changes invalidate frames; the room stops rendering at rest.
- All styling is scoped under the landing journey. The editor does not import the journey module.

## Verification

`src/tests/journey.test.ts` checks the endpoints, eye height, continuous/reversible sampling, bounded progress and floor/wall/frame/furniture clearance.

`e2e/journey.spec.ts` checks the actual renderer camera at multiple scroll positions, reverse playback, pinning, section exit, mobile width and live reduced-motion changes. Frame metadata is read-only and is written from the actual R3F camera, rather than from a separate simulated animation. Browser screenshots capture the exterior, approach, entry, interior and final pan.

`e2e/landing-motion.spec.ts` covers existing navigation, themes, comparison controls, templates and reduced-motion navigation after replacing the old click-to-activate preview.

## Files changed for this enhancement

- `src/pages/Landing.tsx`: replaces the old preview with the pinned journey; retains existing hero copy and subsequent sections.
- `src/features/landing/RoomJourney.tsx`: scroll tracking, pin duration, responsive presentation, skip link, reduced-motion subscription and fallback.
- `src/features/landing/JourneyScene.tsx`: dedicated real 3D scene, physical doorway, actual camera control and demand rendering.
- `src/features/landing/journeyPath.ts`: reversible position/look-target curves and entrance dimensions.
- `src/features/landing/journey.css`: scoped showcase, pinning and responsive/reduced-motion layout.
- `src/tests/journey.test.ts`: route and clearance verification.
- `e2e/journey.spec.ts`: browser verification of camera movement, wheel scrolling, reverse playback, pinning and mobile/reduced-motion behavior.
- `e2e/landing-motion.spec.ts`: updates preview checks for the automatically loaded scene.
- `README.md`, `ARCHITECTURE.md`, `LANDING_JOURNEY.md`: documentation for the new landing behavior.

No dependency or editor source change is required.
