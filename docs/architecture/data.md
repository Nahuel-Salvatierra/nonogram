# Data: stats, Collection record, storage and puzzle supply

## Stats (`src/core/stats/stats.ts`)

`Stats { global, bySize[sizeId][difficulty] }`, each a `KindStats`:
`started`, `completed`, `abandoned`, `totalTimeMs`, `bestTimeMs`, `perfectCompleted`.

- `gameStarted` → `started + 1`; `gameCompleted` → time, best time (only games without hints) and
  perfect (no mistakes and no hints); `gameAbandoned` → `abandoned + 1`.
- Helpers: `averageTimeMs`, `kindStats`, `isNewRecord(before, after, sizeId, difficulty)`,
  `sumStats`, `statsForSize`.
- There is no win streak: leaving a Collection puzzle never counts as abandoning it.

## Collection record (`src/core/stats/collection.ts`)

`CollectionRecord = Record<puzzleId, { status: 'inProgress' | 'completed', bestTimeMs, completedAt }>`.
`applyCollectionEvent` marks Collection puzzles in progress on start, completed (keeping the best
time) on completion, and removes in-progress entries on abandon. A completed puzzle never goes back.

## Storage (`src/services/storage`)

Versioned documents `{ schemaVersion, data }` validated with Zod (`document.ts`); a corrupt key is
dropped and defaults are used. Migrations per key live in `migrations.ts`: `stats` is at v2 (v1 → v2
adds empty `bySize['15x15']`); `meta` is at v2 (v1 → v2 adds a full daily hint budget); every other
key is still at v1.

| Key           | Schema              | Notes                                                          |
| ------------- | ------------------- | -------------------------------------------------------------- |
| `settings`    | `settingsSchema`    | merged over `DEFAULT_SETTINGS`                                 |
| `stats`       | `statsSchema`       |                                                                |
| `meta`        | `metaSchema`        | `installDate`, `appOpens`, `hintDay`, `freeHintsUsed`          |
| `collection`  | `collectionSchema`  | the Collection record                                          |
| `games`       | `savedGamesSchema`  | in-progress games, newest first, LRU of `MAX_SAVED_GAMES = 10` |
| `lastGameId`  | `lastGameIdSchema`  | feeds the "Continuar" card                                     |
| `quickBuffer` | `quickBufferSchema` | pre-generated quick puzzles and recent ids                     |

`gameCodec.ts` stores cells as a `u`/`f`/`x` string and the solution as `#`/`.`; it drops `clues`,
`activeStroke` and `focusedCell`, and re-derives clues on load (rejecting length mismatches).

`persistence.ts` (`createPersistence(storage)`) caches the games list in memory. `saveGame` upserts at
the front and sets `lastGameId`; `removeGame` also clears `lastGameId` when it matches.

## Collection packs (`content/packs` → `services/puzzles/packs.json`)

- Source: one `.txt` per pack (`01-tutorial.txt` ...). Skill: `adding-pack-puzzle`.
- `pnpm build:packs` (`scripts/build-packs.ts`) checks shape, size, uniqueness (`countSolutions`),
  deductive solvability and that the rated difficulty is allowed for the size. On failure it prints
  the undetermined cells as `?` plus suggested single or pair flips, and does not write the JSON.
- Puzzles are sorted by score inside each pack. Ids are `pack/slug` and must stay stable.
- `collection.ts` parses the JSON with Zod: `COLLECTION`, `findCollectionPuzzle`,
  `nextCollectionPuzzle` (next of the same size), `TUTORIAL_PACK_ID`.

## Quick puzzle supply (`services/puzzles`)

- `PuzzleGenerator.generate(sizeId, difficulty, seed)`: `workerGenerator` (web worker,
  `generator.worker.ts`) in the app, `inlineGenerator` in tests.
- `puzzleSupply.ts`: `take(sizeId, difficulty)` returns a buffered puzzle or one from the fallback
  pack (`quickPack.json`, 8 per kind), records it in `recentIds` (50) and refills in the background
  (`BUFFER_SIZE_PER_KIND = 1`). Buffered puzzles from an older `GENERATOR_VERSION` are discarded.
