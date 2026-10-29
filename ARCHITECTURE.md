# SpaceCraft architecture

## Single source of truth

The version-1 Zod project schema contains room geometry, furniture, transforms, finishes, units and metadata. Coordinates use meters: X is width, Y is elevation, Z is length. A furniture origin is at the center of its footprint on its supporting plane; its geometry extends upward from Y=0. No Three.js object is stored in Zustand or IndexedDB.

The Zustand editor store owns the working project and an 80-entry immutable snapshot history. Committed operations validate the next state. Undo and redo restore whole serializable project snapshots. Gizmos mutate the rendered group during a drag and commit once on release; inspector numbers commit on blur or Enter. This avoids per-frame history entries. A new command discards redo history.

## Rendering

React Three Fiber renders the room with a mix of licensed glTF/GLB furniture and the retained procedural catalog. Licensed models are fitted to the saved metre-based bounding dimensions; geometry/textures are shared, editable materials cloned. Object colours affect primary surfaces while accents remain authored. Local PBR floor maps, HDR lighting and renderer quality settings are retained from the preceding graphics work. The UI redesign changes no rendering engine, camera path or furniture assets.

Four physical wall meshes remain in the scene. Their opacity eases toward near-transparent when the camera is outside the corresponding wall. All walls fade in for walkthrough, and fade out for top view. Baseboards keep room boundaries understandable. Soft shadow maps and rendering resolution depend on the selected graphics quality.

Room and furniture state is identical in 2D, orbit and walkthrough. Top view uses an orthographic camera; it shows actual projected furniture, rather than a disconnected CAD representation. Grid, object selection and transforms continue to operate in the same scene.

The renderer is lazy-loaded for the editor and on-demand landing preview. The Three.js vendor chunk is substantial; that is an explicit bundle-size tradeoff of the required stack. Runtime scenes use simple original geometry rather than high-resolution downloaded assets. There is no fixed FPS guarantee or measured GTX 1650 Ti performance claim.

## Camera and collision

OrbitControls handles damped rotation, pan and zoom. Drei TransformControls temporarily disables the default orbit control during manipulation. Walkthrough uses browser pointer lock, an eye height of 1.65 m, acceleration toward 1.6 m/s (2.6 m/s with Shift), pitch limits and input cleanup on blur/unlock.

The walking body is a horizontal circle with radius 0.23 m. Circle-vs-oriented-rectangle tests transform the camera into each object's local footprint. Hidden, decorative and vertically clear objects are ignored. Each movement step is subdivided into at most 6 cm segments, and X/Z movement is resolved independently to slide along obstacles and prevent tunneling. The room is shrunk by the body radius. The camera does not use gravity, so it cannot fall through the floor. Entry scans for a valid free position; a filled room refuses walkthrough.

Collision intentionally uses conservative bounding footprints. It cannot pass under tables or between chair legs, step onto objects, or simulate rigid-body physics. Placement warns about overlapping bounding boxes instead of enforcing all pairwise furniture separation. Room boundaries are enforced for every committed transform, with rotated extents and proportional shrinking when necessary.

## Persistence

Dexie database `spacecraft-studio`, version 1, has `projects` and `preferences` tables. Preferences include theme, quality, units, grid, snap and tutorial completion. First use defaults to dark. Explicit saved dark/light preferences take precedence.

Autosave waits 650 ms after a committed revision and serializes writes through a promise queue. A save result updates the indicator only when it matches the current project/revision. Storage failures report **Save failed** and allow manual retry or JSON backup. Navigation back to the dashboard waits for a save; dirty page unloads request the browser's standard warning. Page visibility changes attempt an additional save. No browser API can guarantee completion after a process crash or forced termination.

## Import and export

JSON import accepts at most 5 MB and 250 objects, validates finite numbers, bounded dimensions, recognized catalog IDs, supported version, colors and unique object IDs, and rejects out-of-room objects. Imported data receives a new project ID. Rendering never evaluates imported code or loads imported asset URLs.

PNG export uses the actual WebGL canvas with a preserved drawing buffer. It includes the current room view and any visible selection handles; the HTML panels are excluded. JSON reconstructs the complete editable project. The plain-text summary records dimensions, transforms and finishes.

## Landing motion isolation

`Reveal`, `RevealHeading`, `Parallax` and `useLandingMotion` are reusable components/hooks under `features/landing`. Default markup is visible. The scroll observer triggers short animations only as content enters view; completion and teardown restore base styles. Parallax uses MotionValues and springs instead of React state updates on each scroll event. The pinned landing hero uses its own scene and absolute camera path, driven by native scroll progress. Its dedicated licensed model registry follows the original living template layout independently of the editor scene and camera. The scene has a physical doorway and a clearance-tested route. Live reduced-motion changes stop the journey and remove pinning. See LANDING_JOURNEY.md and SHOWCASE_GRAPHICS.md. Native scrolling remains intact; the root smooth-scroll class is removed on route teardown. Reduced-motion handling is enforced in JavaScript and CSS.

## Accessibility and testing boundaries

Dialogs use native `showModal`, focus trapping, Escape handling and focus restoration. Numeric inspector fields, hierarchy controls and menus expose labels. Keyboard users can perform the main editing operations without a 3D mouse selection. Canvas geometry itself is not a semantic screen-reader representation; the hierarchy and inspector provide the alternative.

Vitest tests pure geometry, history, schema and import behavior. React Testing Library tests controls and persistence using fake IndexedDB. Playwright tests actual routes, IndexedDB reload, pointer lock, downloads, import and WebGL pixel variation. Pixel variation demonstrates that a real frame rendered, not visual correctness of every model. Browser screenshots require human/agent inspection; collision unit tests do not constitute a physical-device performance benchmark.
