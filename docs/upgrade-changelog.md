# SizeSure Atelier — upgrade changelog

## Implemented
- Retained existing React routes, CRUD, comparison and policy-unapproved behavior.
- Corrected API default to same-origin `/api/v1` through configurable Vite proxy (8081 by default).
- Added 12-second request timeout, invalid JSON detection, typed API errors, and abort cleanup.
- Added a responsive keyboard-accessible mobile menu, Escape dismissal, and skip-to-content link.
- Added editorial typography, tokenized motion and palette, pointer-driven decorative hero tilt, subtle orbit animation, elevated cards, tactile buttons, and entrance reveals.
- Added touch and reduced-motion fallbacks. No heavy 3D runtime or fabricated sizing verdicts.
- Default backend port now 8081 to match working local environment; configurable with PORT.

## Guardrails
- This is still a local-only single-user academic prototype. Do not publicly deploy without authentication, access controls and security review.
- No rule policy has been approved. `RULES_UNAPPROVED` is intentional.
- Database schema unchanged; no destructive migrations.
- Browser screenshots, complete database integration, and professor rubric approval remain NOT VERIFIED until run on target Windows machine.

## QA smoke test
1. Run MySQL on 3307; run `mvn test` and `mvn spring-boot:run` in backend.
2. Run `npm install`, `npm run typecheck`, `npm run build`, `npm run dev` in frontend.
3. Open the local URL printed by Vite (5173, or next free port).
4. Use DevTools Network to confirm GET `/api/v1/profiles` and `/api/v1/charts` succeed via the Vite proxy.
5. Create and edit a profile, add a seller chart with multiple sizes, compare, refresh, and verify persisted data.
6. Confirm recommendation remains RULES_UNAPPROVED and no suggested size is shown.
7. Test 320/375/768/1440px, keyboard-only navigation, Escape menu, and reduced-motion.

## Validation performed in packaging environment
- Frontend TypeScript `npm run typecheck`: **PASS** after correcting an existing ES target compatibility issue and adding Vite ambient typings.
- Frontend Vite bundle: **NOT VERIFIED**. The container's npm installation lacked Rollup's platform-specific optional binary (`@rollup/rollup-linux-x64-gnu`), so build could not complete here. Run a clean `npm install` and `npm run build` on Windows.
- Backend Maven tests: **NOT VERIFIED** because Maven is unavailable in packaging environment.
- Real browser / database end-to-end flows: **NOT VERIFIED**; run smoke tests on the user's Windows machine.
