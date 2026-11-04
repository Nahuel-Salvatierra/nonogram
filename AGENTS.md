# AGENTS.md

Classic black-and-white Nonogram for Android. Puzzles are validated, solved, rated and generated
fully on-device (no backend). The product plan (in Spanish) lives in `docs/PLAN.md` and is the
source of truth for behavior.

Stack: React 19, TypeScript (strict), Vite, Tailwind CSS v4, Zustand, Zod, React Router, Capacitor (Android), Vitest, Playwright.

## Commands

- `pnpm dev`: start the web dev server.
- `pnpm test`: run unit and integration tests (Vitest).
- `pnpm test:e2e`: run Playwright E2E tests against a production build.
- `pnpm lint` / `pnpm lint:fix`: ESLint (layer boundaries, no `any`/`unknown`, no `console`, no default exports).
- `pnpm typecheck`: TypeScript project build.
- `pnpm check`: typecheck + lint + test. Must pass before a task is done.
- `pnpm build`: production web build.
- `pnpm build:packs`: validate `content/packs/*.txt` and write `src/services/puzzles/packs.json`.
- `pnpm generate:quick-pack`: regenerate the bundled fallback pack for quick play.
- `pnpm benchmark`: generator timing and rating distribution per size and difficulty.
- `pnpm cap:sync` / `pnpm android`: build, sync to Android, open Android Studio.
- `pnpm build:apk`: build, sync and assemble the debug APK in `android/app/build/outputs/apk/debug/`.

## Folder map

- `src/core/engine`: pure engine (grid, clues, line solvers, propagation, probing, search, validator, analyzer, generator).
- `src/core/game`: pure game reducer, strokes, hints, timer math, domain events.
- `src/core/stats`: pure statistics and Collection record reducers.
- `src/services`: platform adapters behind interfaces (storage, ads, analytics, lifecycle, puzzle supply).
- `src/app`: Zustand stores, event bus, side-effect subscribers, selectors, app-level hooks.
- `src/ui`: React screens, components, design tokens, Spanish UI strings.
- `src/main.tsx`: composition root that wires services into the app layer.
- `content/packs`: Collection puzzles as text. `scripts`: Node scripts (packs, quick pack, benchmark).
- `e2e`: Playwright specs.
- `docs`: product plan (`PLAN.md`), architecture maps (`architecture/`), copied infrastructure (`SHARED_INFRA.md`), next tickets (`ROADMAP_TICKETS.md`), manual QA and release (`QA_CHECKLIST.md`), themed packs research (`THEMED_PACKS.md`).
- UI only reaches core values through `src/app` (`catalog.ts`, `game/selectors.ts`, `stats/selectors.ts`, `hooks/`).

## Layer rules (enforced by ESLint)

`core` imports nothing else. `services` imports `core`. `app` imports `core` and `services`.
`ui` imports app and only types from `core`. Never import Capacitor outside `services`.

## Definition of done

1. Behavior matches `docs/PLAN.md` and the ticket.
2. Tests added or updated next to the changed code.
3. `pnpm check` is green.
4. Rules in `.cursor/rules/` respected.
5. Conventional Commit in English.

## Guides

- Architecture: start at `docs/architecture/README.md` and read only the doc for the area you touch
  (`engine`, `game`, `data`, `app`, `ui`, `testing`). Keep that doc updated when you change its area.
- Shared infrastructure copied from the Sudoku app: `docs/SHARED_INFRA.md`. Keep both copies in sync.
- Rules: `.cursor/rules/*.mdc` (always-on project rules plus file-scoped rules).
- Skills: `.cursor/skills/*/SKILL.md` (step-by-step workflows for recurring tasks).
