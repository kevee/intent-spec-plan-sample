# Plan: duplicate sign-ups (from spec.md 2026-10-16)
Story: #1
Branch: kevee/1-duplicate-signups
Author: Claude, approved by Kevin Miller.
Status: approved.

## Files that change
prisma/schema.prisma, prisma/migrations/<timestamp>_one_signup_per_person/migration.sql (new),
prisma/seed.ts, src/lib/validation.ts, src/lib/validation.test.ts, src/lib/shifts.ts,
src/lib/shifts.test.ts, src/app/shifts/[id]/actions.ts, src/app/shifts/[id]/actions.test.ts,
e2e/shifts.spec.ts, e2e/sign-up.spec.ts, docs/database.md, CLAUDE.md,
_plan/1-duplicate-signups/spec.md (the Operations concern's resolution, recorded by `/plan`)

`src/app/shifts/[id]/page.tsx` does not change: it renders `FULL_MESSAGE` from `src/lib/shifts.ts`, so the new wording lands there on its own.

## Order of work
1. **Normalize the email in `parseSignup`** (`src/lib/validation.ts`): trim, validate, then lowercase, so every write path gets `sam.okafor@example.org` whatever was typed. Replace the "keeps the email exactly as typed" test in `validation.test.ts` with cases for capitals, surrounding spaces, and both at once, and check that a malformed address still gets the same error.
2. **The migration, the schema and the seed together.** Add `@@unique([shiftId, email])` to `Signup` in `prisma/schema.prisma` (keep the existing `@@index([shiftId])`; we add, we don't drop). Generate the SQL with `pnpm exec prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script` into a new `prisma/migrations/<timestamp>_one_signup_per_person/migration.sql`, then hand-edit it above Prisma's `CREATE UNIQUE INDEX "Signup_shiftId_email_key"`: first `UPDATE "Signup" SET "email" = lower(trim("email"))`, then a `DELETE` that keeps the earliest row per `(shiftId, email)` using `ROW_NUMBER() OVER (PARTITION BY "shiftId", "email" ORDER BY "createdAt", "id")`. Rewrite the Riverside block of `prisma/seed.ts` as six people, one row each, with Sam Okafor's address lowercase, and fix the comment. In `src/lib/shifts.test.ts`, replace "counts every sign-up row as a filled spot" with a test that counts each person once and shows a second row for the same person is rejected by the database. Update the `spotsFilled` comment in `src/lib/shifts.ts`.
3. **The action's check order and the `P2002` catch** (`src/app/shifts/[id]/actions.ts`): after validation, check full first for everyone, then look up an existing sign-up by the compound key and return the normal confirmation if there is one, then insert. Catch `Prisma.PrismaClientKnownRequestError` from `@/generated/prisma/client` with `code === 'P2002'` and return the same confirmation; rethrow everything else. Change `FULL_MESSAGE` in `src/lib/shifts.ts` to "This shift is full. If you signed up earlier, your spot is still yours." In `actions.test.ts`, replace "stores a second sign-up as a second spot" with: resubmission returns an identical state and leaves one row; different capitals and a trailing space count as the same person; a different name keeps the first name; two concurrent `signUp` calls (`Promise.all`) leave one row and both return `signed-up`; on a full shift a holder and a non-holder get identical states. Update the full-shift test's expected message.
4. **End-to-end.** In `e2e/shifts.spec.ts`, Riverside reads "6 of 10 spots filled" on both pages and the Food bank page shows the new full message. In `e2e/sign-up.spec.ts`, add a resubmission test: sign up on Tree planting, capture the status text, go back, submit again with the address in different capitals and a trailing space and a different name, assert the status text is identical, focus moves to it, axe passes, and the list still says "1 of 12 spots filled".
5. **Docs, then the PR.** `docs/database.md`: a "Migrations that delete rows" section (back up the database file before `prisma migrate deploy`, keep the copy until the app is checked, how to restore), the unique constraint in "What's in it", version 1.1.0 with today's date. `CLAUDE.md`: the Server actions and Data bullets say the email is stored normalized and the unique index on `(shiftId, email)` is the guarantee, with a **Note:** that `P2002` on that index means "already signed up". No README, infrastructure or conformance change: nothing in setup, cost or any conformance row moves. Then the PR "Duplicate sign-ups", body from `.github/pull_request_template.md`, `Closes #1`.

## Risks
**Step 2 is the risky one.** The migration changes and deletes rows and has no undo, which is the Operations concern Priya Nair resolved: back up the file first, and the new `docs/database.md` section says so. Inside the migration the order matters: normalize before dedupe, or `Sam.Okafor@example.org` and `sam.okafor@example.org` survive as two rows and the index fails to create. The seed changes in the same step, or `pnpm db:reset` breaks on the duplicate rows it inserts today. The migration uses SQLite's `ROW_NUMBER()` window function (SQLite 3.25 or later); the before-database proof below is what shows the engine Prisma runs it with supports it.

**Deviation in step 2 (recorded during the build):** `pnpm db:migrate --create-only` is `prisma migrate dev`, which refuses to run from a non-interactive session, Claude Code included. `prisma migrate diff --from-migrations --to-schema --script` produces the same structural SQL, so the migration folder is created by hand with that output and then edited as planned. `docs/database.md` picks this up in step 5.

**Steps 2 and 3 share a commit.** With the index in place and no `P2002` handling, a resubmission is a thrown error, not a confirmation, so the two steps aren't shippable apart. Each still has its own proof.

**The `P2002` catch has to stay narrow.** It matches the error class and code only. A foreign-key failure or a locked database must still surface as an error, not as a cheerful confirmation. The tests for other errors are the existing "shift no longer exists" case plus the rethrow path.

**Privacy depends on the order of checks.** Full is checked before the existing sign-up for everyone, or a full shift becomes an oracle for who is on it. The full-shift test with a holder and a non-holder pins this.

**Proving the migration means switching to `main`**, which needs a clean tree. Run the before-database proof after step 2's commit, and don't regenerate the Prisma client on `main`: the branch's generated client inserts fine into a database that has no index yet.

## Proof
- `pnpm test -- src/lib/validation.test.ts` covers capitals, surrounding spaces, both at once, and a malformed address.
- `pnpm test -- src/lib/shifts.test.ts` counts each person once and shows a duplicate row is rejected.
- `pnpm test -- "src/app/shifts/[id]/actions.test.ts"` covers resubmission, case and whitespace, a changed name, concurrency, and the full shift for a holder and a non-holder.
- `pnpm db:reset` succeeds and seeds Riverside with 6 sign-ups.
- The migration against a database seeded from `main`, after step 2 is committed:

  ```bash
  git switch main && DATABASE_URL=file:./prisma/before.db pnpm db:reset
  git switch - && DATABASE_URL=file:./prisma/before.db pnpm exec prisma migrate deploy
  sqlite3 prisma/before.db "select count(*) from Signup join Shift on Shift.id = Signup.shiftId where Shift.title = 'Riverside park clean-up'"
  sqlite3 prisma/before.db "select count(*) from Signup where email != lower(trim(email))"
  sqlite3 prisma/before.db "select name, email, createdAt from Signup where email = 'sam.okafor@example.org'"
  rm -f prisma/before.db*
  ```

  The first count is 6, the second is 0, and the third query returns one row, Sam Okafor's earliest.
- `pnpm test:e2e` passes, axe included, with Riverside at "6 of 10", the resubmission showing identical page text, and the new full message. Every control the tests use is found by role and label; no new controls are added.
- `pnpm lint && pnpm typecheck` pass. `pnpm test` and `pnpm test:scripts` pass.
- `docs/database.md` has the "Migrations that delete rows" section and `CLAUDE.md` describes the normalized email and the unique index.
- The public-repo hygiene grep from the handoff brief (internal tool names, ticket prefixes, partner names) returns nothing across `.claude`, `CLAUDE.md`, `_plan` and `docs`.
- `pnpm check:plan` passes on the branch.
