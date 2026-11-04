---
name: migrating-persisted-data
description: Changes the shape of persisted data (settings, currentGame, stats, puzzleBuffer, meta) safely by bumping schemaVersion, updating Zod schemas and adding a tested migration. Use when adding, renaming or removing persisted fields or storage keys.
---

# Migrating Persisted Data

```
- [ ] 1. Bump schemaVersion for the key
- [ ] 2. Update the Zod schema
- [ ] 3. Write the migration from the previous version
- [ ] 4. Add an old-data fixture and test
- [ ] 5. Verify corrupt data falls back to defaults
- [ ] 6. pnpm check
```

## Where things live

- Schemas and versions: `src/services/storage/schemas.ts`.
- Migrations: `src/services/storage/migrations.ts`, one function per step (`v1 -> v2`).
- Load/save: `src/services/storage/persistence.ts` (uses `StorageAdapter`).

## Rules

- Every document has `schemaVersion`. Loading runs migrations step by step up to the current version,
  then validates with Zod.
- Migrations operate on the previous version's schema output (parse old with the old schema first).
  Do not use `unknown` or casts; type the old shape with its own Zod schema.
- Never throw on load. If parsing or migration fails, discard only that key and return defaults.
- New optional fields can get a default in the schema instead of a version bump only when old data
  stays valid; otherwise bump.

## Test template

```ts
it('migrates settings v1 to v2 adding showTimer', async () => {
  const storage = createMemoryStorage({
    [STORAGE_KEYS.settings]: JSON.stringify({ schemaVersion: 1, data: SETTINGS_V1_FIXTURE }),
  })
  const settings = await createPersistence(storage).loadSettings()
  expect(settings.showTimer).toBe(true)
})
```
