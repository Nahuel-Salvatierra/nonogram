---
name: implementing-ticket
description: General workflow to implement a development ticket in the Nonogram app, from reading the plan to a verified Conventional Commit. Use when implementing a ticket, feature, fix or roadmap task in this repository.
---

# Implementing a Ticket

Copy this checklist and track progress:

```
- [ ] 1. Read the ticket and the matching section of docs/PLAN.md
- [ ] 2. Identify affected layers (core / services / app / ui)
- [ ] 3. Check for a more specific skill (UI component, line technique, game action, migration, pack puzzle)
- [ ] 4. Implement following .cursor/rules
- [ ] 5. Write or update tests next to the changed code
- [ ] 6. Run pnpm check (typecheck + lint + test)
- [ ] 7. Review the diff against the rules checklist
- [ ] 8. Commit with a Conventional Commit in English
```

## Step details

**1. Plan first.** `docs/PLAN.md` defines behavior (rules, difficulty, hints, errors, timer, stats,
persistence). If the ticket contradicts the plan, stop and ask.

**2. Layers.** Put logic as low as possible: rules in `core`, platform access in `services`,
orchestration/side effects in `app`, rendering in `ui`.

**3. Specific skills.**

- New React component: `adding-ui-component`.
- New line technique or difficulty tier: `adding-line-technique`.
- New Collection puzzle: `adding-pack-puzzle`.
- New reducer action: `adding-game-action`.
- Persisted shape change: `migrating-persisted-data`.

**6. Verify.** `pnpm check` must be green. For UI work also run `pnpm dev` and try the flow
on a mobile viewport.

**7. Rules checklist.**

- English code, Spanish UI text only in `src/ui/strings/es.ts`.
- No `any`, `unknown`, `!`, `as` casts, `enum`, default exports, `console`.
- No new comments unless they state a constraint.
- Logic in hooks, components small, tokens instead of colors.
- No new dependency without justification.

**8. Commit format.** `type(scope): summary` with scopes `engine`, `game`, `stats`, `services`,
`app`, `ui`, `build`, `docs`. Example: `feat(game): add auto-cross for completed lines`.
