# Tickets de las Fases 2–5

Continúa la numeración de la Fase 1 (tickets 1–39, cerrada). Cada ticket se implementa con la skill
`implementing-ticket` y termina con `pnpm check` en verde. Las capas siguen `AGENTS.md`.

## Fase 2: Polish

| #   | Ticket                                            | Capas                   |
| --- | ------------------------------------------------- | ----------------------- |
| 40  | Botón Rehacer en la Toolbar                       | app, ui                 |
| 41  | Tamaño 15x15: perfiles, generador y packs (hecho) | core, services, content |
| 42  | Zoom y desplazamiento con pistas fijas (hecho)    | ui                      |
| 43  | Atenuar pistas número por número                  | core, app, ui           |
| 44  | Cuarto estado opcional ("tal vez")                | core, app, ui           |
| 45  | Vibración (Haptics) por celda pintada, con ajuste | services, app           |
| 46  | Sonido opcional                                   | services, app           |
| 47  | Animaciones: línea completa y victoria            | app, ui                 |
| 48  | Historial de las últimas partidas                 | core, services, ui      |
| 49  | Accesibilidad: teclado/D-pad y auditoría TalkBack | ui                      |
| 50  | Ícono adaptativo y splash definitivos             | android                 |

- **40. Rehacer.** El reducer ya soporta `redo` (bloqueado durante un trazo). Agregar `redo` a
  `useGameActions` y un `ToolButton` deshabilitado si `redoStack` está vacío. Test RTL: deshacer y
  rehacer un trazo completo restauran todas sus celdas.
- **41. 15x15 (hecho).** `'15x15'` en `SIZE_IDS`, `SIZE_OF` y `DIFFICULTIES_BY_SIZE` (las 4
  dificultades). Benchmark en PC (40 muestras): Fácil a Difícil < 100 ms; Experto 860 ms de promedio
  y hasta 8 s. `PROFILES` sin cambios: Experto se genera en el worker con buffer y pack de respaldo,
  así que nunca bloquea. `GENERATOR_VERSION` sigue en 1 porque la salida de 5x5 y 10x10 no cambió.
  Migración de `stats` a v2, pack de respaldo regenerado y pack "Yokai y criaturas" (6 puzzles).
  `boardLayout` baja el mínimo de celda a 14 px (15x15 entra a unos 17 px en 360 dp).
- **42. Zoom (hecho).** Contenedor con `transform` (pellizcar para zoom, dos dedos para desplazar) que no
  interfiere con el arrastre de un dedo. Las pistas de fila y columna quedan fijas en los bordes y
  se desplazan en un solo eje.
- **43. Pista por número.** `core/engine/clueProgress.ts`: con `leftmostStarts` y `rightmostStarts`
  sobre la línea actual, un número está cumplido si su bloque quedó fijado y relleno. Selector
  `ClueView.doneNumbers` y estilo por número en `ClueLine`. Tests con líneas parciales.
- **44. Cuarto estado.** `CellState` suma `'maybe'` (un punto) que el solver trata como `unknown`.
  Ajuste `maybeTool` (default OFF) que agrega una tercera herramienta. Migración del códec de celdas
  (`m`) y de `gameState` v2. Tests del reducer: un trazo `maybe` no cuenta errores.
- **45. Vibración.** `HapticsService` (`@capacitor/haptics`) con noop en web. Un suscriptor del bus
  vibra al pintar (evento nuevo `cellsPainted` con la cantidad), en `mistakeMade` y en
  `gameCompleted`. Ajuste `haptics` (default ON). Limitar a una vibración cada 40 ms en trazos.
- **46. Sonido.** `SoundService` con 3 efectos cortos precargados (Web Audio). Ajuste `sound`
  (default OFF). Mismo patrón de suscriptor que 45.
- **47. Animaciones.** Evento `lineCompleted { line }` emitido por `endStroke`; la línea recibe un
  flag efímero para una onda de 200 ms. Confeti sobrio en Victoria. Todo bajo `motion-safe:`.
- **48. Historial.** Documento persistido `history` (máx. 50 entradas: puzzle, modo, tamaño,
  dificultad, tiempo, errores, pistas, resultado y fecha) alimentado desde `gameCompleted` y
  `gameAbandoned`. Pestaña en Estadísticas.
- **49. Accesibilidad.** Flechas mueven un cursor por el tablero (roving tabindex); Espacio rellena,
  X marca y Shift+flechas pinta en línea. Revisar contraste AA de los tokens en ambos temas y que
  TalkBack anuncie el cambio de estado de la celda.
- **50. Ícono y splash.** Generar recursos con `@capacitor/assets` desde un SVG maestro.

## Fase 3: Monetización

| #   | Ticket                                       | Capas             |
| --- | -------------------------------------------- | ----------------- |
| 51  | `AdPolicy` pura con tests                    | core              |
| 52  | `AdMobAdService` (aplazado)                  | services          |
| 53  | Consentimiento UMP/GDPR                      | services, ui      |
| 54  | Banner en Home, Colección y Estadísticas     | app, ui           |
| 55  | Interstitial post-Victoria                   | app               |
| 56  | Rewarded: pista extra y seguir (aplazado)    | core, app, ui     |
| 57  | Analytics real conectado al bus              | services          |
| 58  | Compra "Quitar anuncios" (opcional)          | services, app, ui |
| 59  | Política de privacidad y ficha de Play Store | docs              |

- **51. AdPolicy.** `core/ads/adPolicy.ts`: `canShowInterstitial(meta, now)` con las reglas del plan
  (nunca durante una partida, cada 3 completadas, 3 min entre interstitials, nada en los primeros
  2 días o 3 partidas, respeta `adsRemoved`). Extender `Meta` con `completedSinceAd`,
  `lastInterstitialAt` y `adsRemoved` (migración de meta v3; la v2 agregó el cupo diario de pistas).
- **52. AdMob.** Fuera de la primera publicación: no hay SDK ni unidades. Al retomarlo, agregar
  `@capacitor-community/admob`, el App ID y `VITE_ADMOB_REWARDED_ID`. Las fallas nunca bloquean el
  flujo. Faltan banner e interstitial.
- **53. UMP.** Formulario de consentimiento al primer arranque y entrada "Privacidad" en Ajustes.
  Sin consentimiento, solo anuncios no personalizados (hoy AdMob pide siempre `npa`).
- **54. Banner.** Espacio reservado de alto fijo para evitar saltos de layout. Nunca en Juego.
- **55. Interstitial.** `runtime.afterVictory` consulta `AdPolicy`; se dispara al tocar "Siguiente
  puzzle", "Colección" o "Inicio" en Victoria, no al entrar (el revelado se ve completo).
- **56. Rewarded.** Aplazado. Hoy, sin pistas gratis el diálogo solo avisa que vuelven mañana, y
  "Perdiste" solo ofrece reintentar. El reducer sigue aceptando `hint { isRewarded: true }` y
  `continue` para cuando vuelvan los anuncios.
- **57. Analytics.** Implementación Firebase (o similar) de `AnalyticsService`; mapear los eventos de
  `toAnalyticsEvent` más `rewarded_*`, `interstitial_shown` y `session_length`.
- **58. Quitar anuncios.** Compra no consumible; activa `adsRemoved` y oculta banner e interstitial.
  El rewarded sigue disponible como opción voluntaria.
- **59. Publicación.** Política de privacidad, declaración de anuncios y data safety en Play Console.

## Fase 4: Retención

| #   | Ticket                                   | Capas          |
| --- | ---------------------------------------- | -------------- |
| 60  | Decisión: diario generado vs pack anual  | docs           |
| 61  | Nonograma diario determinístico          | core, services |
| 62  | Pantalla y calendario del diario         | app, ui        |
| 63  | Racha diaria y estadísticas del diario   | core, ui       |
| 64  | Galería de imágenes completadas          | app, ui        |
| 65  | Logros sobrios                           | core, app, ui  |
| 66  | Tamaño 20x20                             | core, ui       |
| 67  | Notificación local del diario (opcional) | services       |

- **60.** Comparar el generador con límite de intentos (semilla `daily-v1-YYYY-MM-DD`) contra un pack
  anual indexado por día. Documentar la decisión.
- **61.** `GameMode` agrega `'daily'` con id `daily-<fecha>-v<GENERATOR_VERSION>`. Tamaño y dificultad
  rotan por día de la semana. Test de determinismo con fechas fijas: si cambia el motor, el test
  obliga a crear `daily-v2`.
- **62.** Tarjeta "Diario" en Home y calendario mensual con los días completados. Un diario por fecha;
  usa el LRU de `games` como cualquier otro puzzle.
- **63.** `Stats.daily` (completados, racha de días seguidos y mejor racha). Migración de stats v2.
- **64.** Galería con las miniaturas de la Colección completada (y los diarios), agrupadas por pack.
  Reutiliza `PixelArt` y `buildPackViews`.
- **65.** `core/achievements`: reglas puras sobre stats, colección y eventos (primer 10x10, 10
  perfectos, pack completo, 7 días de diario). Toast discreto al desbloquear.
- **66.** `'20x20'` con zoom obligatorio (ticket 42). Medir `propagate` y `probe`; si el generador no
  cumple el objetivo, el tamaño solo usa packs. Subir `GENERATOR_VERSION`.
- **67.** `@capacitor/local-notifications`, opt-in desde Ajustes, una notificación diaria.

## Fase 5: Escalabilidad

| #   | Ticket                               | Capas    |
| --- | ------------------------------------ | -------- |
| 68  | Monorepo con pnpm workspaces         | repo     |
| 69  | Paquete `ui-kit`                     | ui       |
| 70  | Paquete `services`                   | services |
| 71  | Paquete `game-shell`                 | app, ui  |
| 72  | Contrato de motor genérico por juego | core     |
| 73  | Nonogramas a color                   | core, ui |
| 74  | Tamaños rectangulares                | core, ui |

- **68.** Mover Sudoku y Nonogram a `apps/sudoku` y `apps/nonogram`; configurar workspaces, TS project
  references y ESLint compartido. Los límites de capas pasan a ser límites entre paquetes. Usar
  `docs/SHARED_INFRA.md` como inventario de lo que se extrae.
- **69.** Extraer Button, IconButton, Modal, ConfirmDialog, Toggle, SegmentedControl, StatTile,
  `cn`, `formatTime` y los tokens comunes de `index.css`; cada app conserva sus tokens propios.
- **70.** Extraer persistencia (StorageAdapter, documentos versionados), ads, analytics, lifecycle y
  platform con sus noops.
- **71.** Extraer runtime (bus, backStack, guardado con debounce, ciclo de vida), Ajustes,
  Estadísticas y Victoria parametrizables por juego.
- **72.** Interfaz `GameEngine<State, Action, Event>` que implementan los reducers de Sudoku y
  Nonogram; el shell solo conoce esa interfaz.
- **73.** Pistas con color por número y celdas con color; el solver de línea pasa a manejar bloques
  de distinto color sin espacio obligatorio entre ellos. Paleta como token por pack.
- **74.** `Size` ya es `{ rows, cols }`: habilitar `SizeId` rectangulares (por ejemplo `10x15`),
  revisar `boardLayout`, `PixelArt` y el generador (simetrías solo horizontales o verticales).
