# Infraestructura compartida con el Sudoku

Estos archivos se copiaron de `W:\repos\personal\sudoku` y se van a extraer a paquetes de un monorepo
en la Fase 5 (`ui-kit`, `services`, `game-shell`). Hasta entonces, un arreglo en cualquiera de las dos
copias se replica en la otra.

- **Igual:** copia sin cambios de lógica; mantener idéntica.
- **Adaptado:** misma estructura, con tipos o contenido propios del juego.

## Tooling

| Archivo                                                    | Estado   | Notas                                         |
| ---------------------------------------------------------- | -------- | --------------------------------------------- |
| `vite.config.ts`                                           | Igual    |                                               |
| `eslint.config.js`                                         | Igual    | Límites de capas, sin `any`/`unknown`/`enum`. |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | Igual    |                                               |
| `.prettierrc.json`, `.husky/pre-commit`, `.gitignore`      | Igual    |                                               |
| `.prettierignore`                                          | Adaptado | Ignora los JSON de `src/services/puzzles`.    |
| `playwright.config.ts`                                     | Igual    | Pixel 7, puerto 4173.                         |
| `package.json`                                             | Adaptado | Scripts `build:packs`, `generate:quick-pack`. |
| `capacitor.config.ts`, `index.html`, `public/favicon.svg`  | Adaptado | `com.punky.nonogram`, color de marca teal.    |
| `src/vite-env.d.ts`                                        | Adaptado | `VITE_ADS_MODE`, `VITE_ADMOB_REWARDED_ID`.    |
| `src/test/setup.ts`                                        | Igual    |                                               |

## Core

| Archivo                   | Estado   | Notas                         |
| ------------------------- | -------- | ----------------------------- |
| `src/core/assertNever.ts` | Igual    |                               |
| `src/core/engine/rng.ts`  | Igual    | Con su test.                  |
| `src/core/settings.ts`    | Adaptado | Ajustes propios del Nonogram. |

## Services

| Archivo                                                                | Estado   | Notas                                    |
| ---------------------------------------------------------------------- | -------- | ---------------------------------------- |
| `storage/StorageAdapter.ts`, `memoryStorage.ts`, `capacitorStorage.ts` | Igual    |                                          |
| `storage/document.ts`                                                  | Igual    | Documentos versionados con Zod.          |
| `storage/schemas.ts`, `migrations.ts`, `persistence.ts`                | Adaptado | Claves y esquemas del Nonogram.          |
| `lifecycle/*`                                                          | Igual    |                                          |
| `platform/*`                                                           | Igual    |                                          |
| `ads/AdService.ts`                                                     | Adaptado | Mock y grabadora; `continueAfterLoss`.   |
| `ads/admobAdService.ts`                                                | Propio   | Solo Nonogram por ahora (rewarded).      |
| `analytics/AnalyticsService.ts`                                        | Igual    |                                          |
| `random.ts`                                                            | Igual    |                                          |
| `AppServices.ts`, `createServices.ts`, `createTestServices.ts`         | Adaptado | Suministro de puzzles propio.            |
| `puzzles/*` (worker, buffer, fallback)                                 | Adaptado | Mismo patrón; buffer por tamaño y nivel. |

## App

| Archivo                                                        | Estado   | Notas                                         |
| -------------------------------------------------------------- | -------- | --------------------------------------------- |
| `runtime/eventBus.ts`, `runtime/backStack.ts`                  | Igual    |                                               |
| `runtime/createAppRuntime.ts`, `gamePersistence.ts`            | Adaptado | Mismo patrón: debounce, segundo plano, atrás. |
| `runtime/analyticsEvents.ts`                                   | Adaptado | Parámetros de tamaño y modo.                  |
| `hooks/useBackButton.ts`, `useElapsedMs.ts`, `useThemeSync.ts` | Igual    |                                               |
| `AppRuntimeContext.tsx`, `appInfo.ts`                          | Adaptado | Stores propios.                               |

## UI

| Archivo                                                                                            | Estado   | Notas                                                                          |
| -------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `components/{Button,IconButton,Modal,ConfirmDialog,Toggle,SegmentedControl,StatTile,ScreenHeader}` | Igual    |                                                                                |
| `components/Icon`                                                                                  | Adaptado | Mismo componente, otro set de íconos.                                          |
| `screens/VictoryScreen/useVictory.ts`                                                              | Adaptado | Guarda el resultado al montar para que limpiar el store no redirija al inicio. |
| `lib/cn.ts`, `lib/formatTime.ts`                                                                   | Igual    |                                                                                |
| `hooks/useGoBack.ts`                                                                               | Igual    |                                                                                |
| `src/index.css`                                                                                    | Adaptado | Acento teal y tokens del tablero.                                              |
| `App.tsx`, `routes.ts`, `strings/es.ts`                                                            | Adaptado | Pantallas y textos del Nonogram.                                               |

## Tests y docs

| Archivo                                    | Estado   | Notas            |
| ------------------------------------------ | -------- | ---------------- |
| `src/test/renderApp.tsx`, `e2e/helpers.ts` | Adaptado |                  |
| `.cursor/rules/*`, `.cursor/skills/*`      | Adaptado | Ver `AGENTS.md`. |
| `docs/QA_CHECKLIST.md`                     | Adaptado |                  |
