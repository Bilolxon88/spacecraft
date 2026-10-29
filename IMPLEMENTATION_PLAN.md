# SpaceCraft implementation plan

The starting workspace was empty. Build a browser-only application with original procedural furniture, no external models, no backend and no authentication.

1. Foundation: strict TypeScript, React/Vite, Tailwind, theme tokens, routes and reusable accessible controls.
2. Projects: Zod domain schema, Dexie storage, six editable templates, dashboard and validated creation.
3. Scene: actual R3F room, original furniture recipes, lighting, grid and cameras.
4. Editing: selection, transform gizmos, inspector, hierarchy, bounded history and boundary constraints.
5. Exploration: shared-state orthographic plan and pointer-lock walkthrough with swept, radius-aware collision.
6. Productivity: materials, debounced autosave, schema-validated import, real viewport PNG and project/summary exports.
7. Experience: responsive landing/dashboard, onboarding, preferences, motion, accessible dialogs and keyboard controls.
8. Verification: unit/component/E2E suites, typecheck/lint/build, rendered browser inspection, demo project and documentation.

Each phase will be recorded in FEATURES.md with verification and limitations. No cloud sync, CAD, multi-room or paid integration is in scope. The full editor targets desktop; touch devices get orbit and inspector editing.
