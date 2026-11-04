# QA manual y release Android (tickets 37–38)

## Antes de probar

- `pnpm check` en verde (typecheck, lint, unit e integración).
- `pnpm test:e2e` en verde (Playwright, viewport Pixel 7).
- `pnpm build:packs` sin errores si se tocaron los packs de `content/packs/`.
- `pnpm cap:sync` copia el build web a `android/`.

## Requisitos de build

- **JDK 21** (Capacitor 8 / Android Gradle Plugin lo requieren). Con JDK 11 Gradle falla con
  "Android Gradle plugin requires Java 17 to run". Opciones:
  - Instalar Temurin 21 y apuntar `JAVA_HOME` a esa carpeta.
  - O declarar `org.gradle.java.home=<ruta al JDK 21>` en `~/.gradle/gradle.properties`
    (no en `android/gradle.properties`, para no commitear rutas locales).
- Android SDK con platform 36 y build-tools actualizados (Android Studio → SDK Manager). Si no
  está `ANDROID_HOME`, declarar `sdk.dir=<ruta al SDK>` en `android/local.properties` (ignorado).

## Builds

- Debug: `pnpm build:apk` (build web + sync + `assembleDebug`) →
  `android/app/build/outputs/apk/debug/app-debug.apk`.
- Release firmado (AAB para Play Store):
  1. Crear keystore una sola vez:
     `keytool -genkey -v -keystore nonogram-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias nonogram`
  2. Guardarla fuera del repo y declarar en `~/.gradle/gradle.properties`:
     `NONOGRAM_STORE_FILE`, `NONOGRAM_STORE_PASSWORD`, `NONOGRAM_KEY_ALIAS`, `NONOGRAM_KEY_PASSWORD`.
  3. Agregar `signingConfigs.release` en `android/app/build.gradle` leyendo esas propiedades.
  4. Subir `versionCode` y `versionName` (alinear con `package.json`).
  5. `cd android && ./gradlew bundleRelease` → `android/app/build/outputs/bundle/release/`.

## Dispositivos

Probar en 2–3 dispositivos reales: uno de gama baja (Android 10–11, 2–3 GB RAM, pantalla de
360 dp de ancho) y uno de gama media reciente (Android 14+). Marcar cada ítem por dispositivo.

### Arranque

- [ ] El splash se oculta solo cuando la app está lista (sin pantalla blanca).
- [ ] La status bar sigue el tema (iconos claros en oscuro, oscuros en claro).
- [ ] El contenido respeta notch y barra de gestos (safe areas arriba y abajo).
- [ ] Orientación bloqueada en vertical.

### Tablero y arrastre

- [ ] 10x10 en 360 dp: celdas de 24 dp o más, pistas legibles (11 sp o más), nada se corta.
- [ ] Tocar una celda la rellena o la marca según la herramienta; tocar una celda ya en ese
      estado la vacía.
- [ ] Arrastrar pinta en línea recta: el eje se bloquea tras la zona muerta (6 dp) y un desvío
      diagonal no pinta fuera de la fila o columna.
- [ ] Arrastrar rápido no saltea celdas; salir del tablero sigue pintando hasta el borde.
- [ ] El contador de celdas aparece durante el trazo y desaparece al soltar.
- [ ] Arrastrar sobre el tablero no hace scroll ni pull-to-refresh.
- [ ] La fila, la columna y sus pistas se resaltan; las pistas completas se atenúan.
- [ ] Líneas guía más gruesas cada 5 celdas.

### Partida

- [ ] Colección: los puzzles aparecen como "?" hasta resolverlos y después con miniatura y
      mejor tiempo; el progreso por pack se actualiza.
- [ ] Los primeros 3 puzzles del tutorial muestran su consejo y se puede cerrar.
- [ ] Partida rápida en 5x5 (Fácil, Medio) y 10x10 (las 4); Experto arranca en menos de 2 s
      (buffer o pack de respaldo).
- [ ] Deshacer revierte el trazo completo en un paso; no deshace pistas ni errores corregidos.
- [ ] Pista: primero señala errores sin gastar; luego deduce una línea o revela una celda.
- [ ] Pistas gratis: 3 por día entre todos los puzzles (el contador sigue al cambiar de puzzle o
      reabrir la app y vuelve a 3 al día siguiente). Sin gratis, "Sin pistas gratis" ofrece "Ver
      anuncio"; la pista llega solo al terminar el anuncio.
- [ ] Perdiste: "Ver anuncio y seguir" conserva tablero y tiempo con errores en 2/3; "Reintentar"
      empieza de cero sin devolver pistas.
- [ ] Build sin `VITE_ADS_MODE`: aparece "Anuncio de prueba". Build con `VITE_ADS_MODE=admob` en
      Android: anuncio de prueba de Google; cerrarlo antes de tiempo no da la recompensa.
- [ ] Validación automática ON: un relleno incorrecto se convierte en X roja con trama y el
      contador de errores sube una vez por celda.
- [ ] Tachado automático: al completar una línea se marcan sus celdas vacías.
- [ ] Victoria: revelado del dibujo, nombre (Colección), tiempo, errores, pistas e insignia de
      récord; "Siguiente puzzle" abre el siguiente del mismo tamaño.

### Ciclo de vida

- [ ] Botón atrás: en Juego pausa y vuelve (a la Colección o a Home); en Home cierra la app; en
      modales los cierra; en Ajustes, Estadísticas y Cómo jugar vuelve a la pantalla anterior.
- [ ] Salir de un puzzle de la Colección y abrir otro conserva el progreso de ambos.
- [ ] Pasar a segundo plano pausa el timer; al volver la partida está en Pausa.
- [ ] Matar la app desde recientes y reabrir: "Continuar" restaura celdas, cruces, tiempo,
      errores e historial.
- [ ] Reiniciar mantiene tiempo, errores y pistas usadas.
- [ ] Abandonar (y dejar una partida rápida para empezar otra) cuenta en estadísticas.

### Ajustes y accesibilidad

- [ ] Tema Sistema / Claro / Oscuro cambia al instante y persiste.
- [ ] Cada ajuste (validación, atenuar pistas, tachado automático, resaltado, temporizador) se
      refleja en el juego.
- [ ] Restablecer estadísticas pide confirmación y deja todo en cero.
- [ ] Tamaño de fuente del sistema al máximo: nada se corta ni se superpone.
- [ ] TalkBack lee cada celda ("Fila 3, columna 5, rellena") y cada pista ("Fila 3: 2 1").
- [ ] Los errores se distinguen sin depender del color (X más trama).
- [ ] "Quitar animaciones" del sistema desactiva las animaciones, incluido el revelado.

### Rendimiento

- [ ] Arrastrar en 10x10 responde sin demora perceptible en gama baja.
- [ ] Generar en segundo plano (worker) no congela la UI.
- [ ] Sin consumo de batería anómalo tras 15 minutos de juego.
