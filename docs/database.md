| | |
| --- | --- |
| **Runbook name** | Database and migrations |
| **Description** | How the SQLite database is laid out, how to change its schema safely, and what to do before a migration that deletes data. |
| **Resources** | `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`, [Prisma Migrate docs](https://www.prisma.io/docs/orm/prisma-migrate) |
| **Owner** | Priya Nair (eng lead) |
| **Version** | 1.1.0 |
| **Version date** | 2026-10-16 |

## What's in it

Two models. **`Shift`** is one volunteer shift: a title, a location, start and end times, and a capacity. **`Signup`** is one person holding a spot on a shift: a name, an email address, and the shift it belongs to. Deleting a shift deletes its sign-ups.

A person holds at most one spot on a shift. The unique index on `Signup (shiftId, email)` is what guarantees it, and emails are stored normalized (trimmed, lowercase) so the index sees `Sam.Okafor@example.org` and `sam.okafor@example.org` as the same person. The sign-up action treats the index's `P2002` error as "already signed up".

Development uses `prisma/dev.db`, unit tests `prisma/test.db`, and Playwright `prisma/e2e.db`. All three are git-ignored and rebuilt from migrations, so deleting one is always safe.

## Changing the schema

1. Edit `prisma/schema.prisma`.
2. Run `pnpm db:migrate --create-only` and give the migration a name that says what it does (`one_signup_per_person`, not `update`).

   **Note:** `prisma migrate dev` refuses to run without an interactive terminal, so it fails from Claude Code and from CI. In that case generate the SQL yourself and put it in a new `prisma/migrations/<timestamp>_<name>/migration.sql`:

   ```bash
   pnpm exec prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script
   ```
3. Read the generated SQL. Prisma writes the structural change; anything that has to happen to existing rows first (normalizing values, removing duplicates, filling a new required column) you add by hand, above Prisma's statements.
4. Run `pnpm db:migrate` to apply it, then `pnpm db:reset` to prove a fresh database migrates and seeds cleanly.
5. Update `prisma/seed.ts` in the same commit if the change makes any seed row invalid.

## Rules

- **Add, don't rename or drop, in the same release ---** a running app expects the old shape until the new code is live. Rename in two steps: add the new column and write to both, then remove the old one in a later story.
- **One migration per story ---** where you can. It keeps the story's PR readable and the rollback obvious.
- **A schema change is always a spec concern ---** decided by the eng lead before the build.

## Migrations that delete rows

Some migrations change or remove data on their way to the new shape: normalizing a column, merging duplicates before a unique index, dropping rows a new rule no longer allows. Prisma records that the migration ran, but it keeps no copy of what the rows looked like before. There is no undo.

So before you deploy one of these, copy the database file:

```bash
cp prisma/dev.db prisma/dev.db.before-<migration-name>
```

Then run the migration, open the app, and check the result against what the migration was supposed to do. Keep the copy until you're satisfied. To go back, stop the app, copy the file back over the original, and fix the migration before trying again.

**Note:** this is how the one-sign-up-per-person migration shipped. Its SQL normalizes every email, deletes all but the earliest sign-up for each person on each shift, then creates the unique index, and the PR carried the before-and-after counts as proof. A migration that deletes rows is always an **Operations** concern in the spec, decided by the eng lead.

## When things go wrong

| Incident description | Monitored? | Steps for resolution |
| --- | --- | --- |
| A migration fails partway through | No | Prisma marks it failed. Fix the SQL, then follow Prisma's [failed migration steps](https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing). Don't hand-edit `_prisma_migrations`. |
| `pnpm db:reset` fails on the seed | Yes, CI | The seed inserts something the schema no longer allows. Update `prisma/seed.ts` to match. |
| A migration that deletes rows removed the wrong ones | No | Stop the app and copy the backup you took before the migration back over the database file. Fix the SQL, then redeploy. If there is no backup, the rows are gone; say so to the coordinators. |
