# _archive

Files here are kept for reference but are **not imported** anywhere in the live app.

## Hero files (Phase 1 archival)

The following hero components were part of the original HOSSAM/AURA build.
They have been disconnected from `Home.tsx` as part of the H STORE rebrand (Phase 1).
A new branded hero will be built in Phase 2.

Original files remain at their source paths in `src/hero/`:

- `StreetHero.tsx` — 3D WebGL street scene entry point (imports HeroScene)
- `HeroScene.tsx` — passes StreetScene to @react-three/fiber Canvas
- `HeroOverlay.tsx` — DOM overlay (brand name, CTAs)
- `StreetScene.tsx` — WebGL street with pharmacy beat and "HOSSAM" neon sign
- `StaticStreetHero.tsx` — CSS/SVG fallback with Arabic "حُسَام" wordmark and fake Cairo branches
- `ScrollHero.tsx` — 3D scroll-driven hero (was never imported in Home.tsx)
- `useStreetStore.ts` — scroll state store (Zustand)
- `AvatarMesh.tsx` — character mesh
- `types.ts` — BEATS array (includes pharmacy beat at z=-47)

None of these files are imported in the current build. They are valid TypeScript
and will not cause compilation errors. Do not delete until Phase 2 hero is live
and signed off.
