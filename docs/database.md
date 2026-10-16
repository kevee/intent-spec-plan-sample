| | |
| --- | --- |
| **Runbook name** | Database and migrations |
| **Description** | How the SQLite database is laid out, how to change its schema safely, and what to do before a migration that deletes data. |
| **Resources** | `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`, [Prisma Migrate docs](https://www.prisma.io/docs/orm/prisma-migrate) |
| **Owner** | Priya Nair (eng lead) |
| **Version** | 1.0.0 |
| **Version date** | 2026-10-14 |

## What's in it

Two models. **`Shift`** is one volunteer shift: a title, a location, start and end times, and a capacity. **`Signup`** is one person holding a spot on a shift: a name, an email address, and the shift it belongs to. Deleting a shift deletes its sign-ups.

Development uses `prisma/dev.db`, unit tests `prisma/test.db`, and Playwright `prisma/e2e.db`. All three are git-ignored and rebuilt from migrations, so deleting one is always safe.

## Changing the schema

1. Edit `prisma/schema.prisma`.
2. Run `pnpm db:migrate --create-only` and give the migration a name that says what it does (`one_signup_per_person`, not `update`).
3. Read the generated SQL. Prisma writes the structural change; anything that has to happen to existing rows first (normalizing values, removing duplicates, filling a new required column) you add by hand, above Prisma's statements.
4. Run `pnpm db:migrate` to apply it, then `pnpm db:reset` to prove a fresh database migrates and seeds cleanly.
5. Update `prisma/seed.ts` in the same commit if the change makes any seed row invalid.

## Rules

- **Add, don't rename or drop, in the same release ---** a running app expects the old shape until the new code is live. Rename in two steps: add the new column and write to both, then remove the old one in a later story.
- **One migration per story ---** where you can. It keeps the story's PR readable and the rollback obvious.
- **A schema change is always a spec concern ---** decided by the eng lead before the build.

## When things go wrong

| Incident description | Monitored? | Steps for resolution |
| --- | --- | --- |
| A migration fails partway through | No | Prisma marks it failed. Fix the SQL, then follow Prisma's [failed migration steps](https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing). Don't hand-edit `_prisma_migrations`. |
| `pnpm db:reset` fails on the seed | Yes, CI | The seed inserts something the schema no longer allows. Update `prisma/seed.ts` to match. |
