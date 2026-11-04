# Investigación: packs temáticos (anime, personajes, cultura japonesa)

Plan para conseguir referencias y producir packs de la Colección con temática. El formato de los
packs y su validación están en la skill `adding-pack-puzzle` y en `docs/PLAN.md` (sección 7).

## 1. Restricciones

### Técnica: tamaño del tablero

- **5x5:** solo íconos muy simples (una estrella, un corazón). No alcanza para un personaje.
- **10x10:** objetos y siluetas reconocibles (onigiri, katana, torii). Un personaje apenas se reconoce.
- **15x15** (ticket 41, con el zoom del ticket 42): tamaño mínimo real para caras y personajes.
- **Color** (ticket 73): es lo que más mejora el reconocimiento de personajes. Sin color, se depende
  de la silueta y de un rasgo icónico (peinado, sombrero, orejas, arma).

### Legal: derechos de autor y marcas

Los personajes de anime, sus nombres y logos tienen derechos de autor y en general marca registrada.
La app se publica en Play Store y va a tener anuncios (Fase 3), así que usar personajes reconocibles
sin licencia expone a reclamos de propiedad intelectual y a que Google baje la app.

| Categoría        | Qué incluye                                                                   | Uso                          |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| Seguro           | Temas originales, arquetipos, objetos, mitología de dominio público           | Libre                        |
| Seguro con aviso | Assets con licencia libre (CC0, CC BY)                                        | Respetando la atribución     |
| A evaluar        | Personajes o series con licencia                                              | Solo con permiso del titular |
| Prohibido        | Copiar puzzles de otros sitios, sprites extraídos de juegos, nombres de marca | Nunca                        |

Arquetipos seguros para temática anime y japonesa: ninja, samurái, mecha, chica mágica, kaiju,
yokai, kitsune, tanuki, maneki-neko, daruma, torii, onigiri, ramen, katana, kimono, sakura, monte
Fuji, koinobori, linterna de papel. Esto no es asesoramiento legal: antes de publicar un pack con
personajes reales hay que consultarlo.

## 2. Fuentes

### Assets con licencia libre para convertir

| Fuente                          | Licencia                               | Por qué sirve                                                 |
| ------------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| Kenney, "1-Bit Pack"            | CC0                                    | Tiles de 16x16 en blanco y negro: casi listos para nonogramas |
| OpenGameArt.org                 | CC0 / CC BY (revisar)                  | Sprites e íconos pequeños, filtrables por licencia            |
| game-icons.net                  | CC BY 3.0                              | Siluetas monocromas de objetos, armas y criaturas             |
| OpenMoji / Twemoji / Noto Emoji | CC BY-SA / CC BY / Apache 2.0          | Emojis de comida, objetos y cultura japonesa                  |
| Wikimedia Commons               | Dominio público (revisar cada archivo) | Kamon (escudos familiares), grabados ukiyo-e                  |

Los kamon japoneses son especialmente buenos: son siluetas monocromas, simétricas y muchos son de
dominio público.

### Bases de nonogramas (referencia, no para copiar)

| Fuente              | Uso                                                                       |
| ------------------- | ------------------------------------------------------------------------- |
| webpbn.com          | Cada puzzle indica su licencia; ver qué temas funcionan por tamaño        |
| `mikix/nonogram-db` | Repo de GitHub con puzzles libres en formato `.non`, útil para tests      |
| nonograms.org       | Catálogo enorme por tema (incluido anime). Los puzzles son de sus autores |
| griddlers.net       | Igual que el anterior; sirve para ver densidad y estilo                   |

### Pixel art pequeño (inspiración de siluetas)

- Patrones de hama beads o perler (kandipatterns.com, Pinterest): miles de diseños de 10 a 20 píxeles
  por lado, muchos de anime. Sirven para estudiar cómo se reduce un rasgo icónico, no para copiarlos.
- Patrones de punto cruz.
- Comunidades: r/PixelArt, Lospec (tutoriales de pixel art de baja resolución).

### Demanda y elección de temas

- API GraphQL de AniList o API de MyAnimeList: series y géneros más populares, para elegir arquetipos
  (por ejemplo, si el isekai o el shonen de batallas están en alza).
- Google Trends por país (la app está en español).
- Apps de nonogramas con packs temáticos publicados: confirman que el contenido temático vende y
  muestran cómo agrupar los packs.

### Rasgos visuales para dibujos propios

- Wikis de Fandom: peinados, accesorios y siluetas típicas de cada arquetipo.
- Regla: el dibujo final es original e "inspirado en" un arquetipo; nunca lleva el nombre de un
  personaje ni reproduce un diseño concreto.

## 3. Pipeline de producción

1. Elegir la imagen fuente (asset libre o boceto propio) y anotar su licencia.
2. Reducir a 10x10 o 15x15 y aplicar umbral a blanco y negro (script nuevo en `scripts/` o la app
   `image-to` para redimensionar).
3. Retocar a mano en `content/packs/<pack>.txt` (`#` lleno, `.` vacío).
4. Correr `pnpm build:packs`: valida solución única y resolución por deducción, y marca con `?` las
   celdas ambiguas. Cambiar una de esas celdas y repetir.
5. Revisar que la dificultad asignada encaje en el pack y que el dibujo se reconozca.
6. Registrar la atribución de los assets CC BY en un `CREDITS.md` y en la pantalla de Ajustes.

## 4. Pack piloto: "Japón"

- 10 puzzles de 10x10, temas seguros: onigiri, torii, katana, daruma, maneki-neko, kitsune, sakura,
  monte Fuji, linterna de papel, ramen.
- Criterios de aceptación:
  - Se reconoce sin leer el nombre (probarlo con 3 personas).
  - Solución única y resoluble por deducción (`pnpm build:packs` en verde).
  - Dificultad Fácil o Medio.
- Medición: cuando llegue Analytics real (ticket 57), comparar puzzles iniciados y completados del
  pack contra los packs genéricos.

## 5. Próximos pasos

1. Pack piloto "Japón" en 10x10 (hecho: `content/packs/06-japan.txt`, 8 Fácil y 2 Medio). Falta
   la prueba de reconocimiento con 3 personas.
2. Pack "Yokai y criaturas" en 15x15 (hecho: `content/packs/07-yokai.txt`, 6 puzzles: oni, tengu,
   karakasa, chōchin-obake, kappa y nekomata). Ampliarlo si el piloto funciona.
3. Evaluar los nonogramas a color (ticket 73) antes de cualquier pack de personajes.
4. Si aparece la opción de licenciar una serie, revisar el contrato antes de dibujar.
