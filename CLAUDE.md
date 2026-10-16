# CLAUDE.md

This file gives Claude Code the context it needs to work in this repository.

## Project overview

**Fairview Volunteers** is a sign-up sheet for volunteer shifts in Fairview County, a fictional county. Volunteers browse upcoming shifts and sign up with a name and an email address. There are no accounts.

The app is small on purpose. The repo exists to teach a planning workflow: every story goes through an **intent**, a **spec** and a **plan** before any code is written, each written with a Claude Code skill (`/intent`, `/spec`, `/plan`). The app gives those skills something real to read and check against. See "Planning artifacts" below.

## Commands

```bash
pnpm install          # also runs prisma generate
pnpm db:reset         # recreate the dev database and seed it
pnpm dev              # http://localhost:3000

pnpm lint
pnpm typecheck
pnpm test             # Jest, runs in band against its own SQLite file
pnpm test -- src/lib/validation.test.ts   # one file
pnpm test:e2e         # Playwright, with an axe scan on every page
pnpm test:e2e e2e/sign-up.spec.ts         # one spec
pnpm test:scripts     # node --test for scripts/
pnpm check:plan       # the CI check that a story's planning artifacts are approved

pnpm db:migrate       # prisma migrate dev; add --create-only to hand-edit the SQL first
pnpm db:seed
```

Requires Node 22 (`.nvmrc`) and pnpm (pinned in `packageManager`; run `corepack enable` once). Never run `npm install`.

`DATABASE_URL` defaults to `file:./prisma/dev.db`, so there is no `.env` to create. Jest and Playwright set it to their own files.

## Architecture

- **Next.js App Router ---** `src/app/page.tsx` lists upcoming shifts; `src/app/shifts/[id]/page.tsx` shows one shift and its sign-up form.
- **Server actions ---** `signUp` in `src/app/shifts/[id]/actions.ts` validates with `parseSignup` (`src/lib/validation.ts`), which also normalizes the email (trimmed, lowercase). Then it checks, in this order: the shift is full (everyone gets the same `FULL_MESSAGE`), the person already holds a spot (they get the same confirmation a first sign-up gets), and only then does it insert. The form (`sign-up-form.tsx`) uses `useActionState`.

  **Note:** nothing the action returns may say "already signed up". That would tell anyone typing an address whether it's on a list. The order of checks above is what keeps a full shift from becoming the same oracle.
- **Data ---** Prisma on SQLite. `prisma/schema.prisma` has two models, `Shift` and `Signup`. A person holds at most one spot per shift: the unique index on `Signup (shiftId, email)` guarantees it, and the action treats Prisma's `P2002` on that index as "already signed up" (and rethrows anything else). Queries live in `src/lib/shifts.ts`; the client singleton is `src/lib/db.ts`. The generated client lands in `src/generated/prisma/` (git-ignored, rebuilt by `prisma generate` on install) and is imported from `@/generated/prisma/client`.
- **Time ---** every date renders in `TIME_ZONE` (`src/lib/format.ts`) through `formatShiftTime` (a date and time range, for the shift list and page) or `formatShiftStart` (a date and start time, for the confirmation). Don't format dates anywhere else, or tests start depending on the machine's time zone.

### Shared components

Use these rather than hand-rolling the pattern again. Each one carries an accessibility decision.

- **`TextField` ---** a label, an input and its `FieldError`, wired with `aria-describedby` and `aria-invalid`. Every text input in the app is one.
- **`FieldError` ---** an inline error with `role="alert"`.
- **`StatusMessage` ---** a `role="status"` region for outcomes the user needs to hear, like a confirmation.
- **`Button` ---** the one button style. At least 44 by 44 CSS pixels.

## Planning artifacts (`_plan/`)

Every story starts with an intent, loosely following the [AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook): intent → spec → plan, each stage reading the artifact before it. They live in one folder per story:

```
_plan/<number>-<slug>/intent.md    # written by /intent
_plan/<number>-<slug>/spec.md      # written by /spec
_plan/<number>-<slug>/plan.md      # written by /plan
```

`<number>` is the story's GitHub issue number and `<slug>` is the intent title in kebab-case.

**One story, one branch.** The intent, spec, plan and code all happen on one `<handle>/<number>-<slug>` branch and go out in **one** PR. No stage gets a PR of its own. Approving a stage means the product owner sets `Status: approved.` in the file on the story branch, not a merge to `main`. So when a skill can't find a story's intent or spec in the current checkout, check `git branch --list '*/<number>-*'` and `git worktree list` before concluding it doesn't exist.

- **`/intent` ---** interviews the author section by section, pushes back on solutions dressed up as problems, shows the full draft for correction, then puts the session on the story branch and writes the file. New intents are `draft`.
- **`/spec` ---** reads the approved intent, this file, `.claude/rules/*` and the docs in `docs/`, explores the code, interviews for requirements, and runs concern checks **before** drafting: database schema, accessibility, infrastructure cost, security and privacy, operations. Every concern goes in the spec's Concerns table with who decides and the resolution. Dismissed concerns stay in the table with the reason.
- **`/plan` ---** refuses without a spec, lists any Concerns row still `Open`, checks the branch, and drafts `plan.md` in plan mode for the engineer to approve. It stops there. The build starts on "go", treats `plan.md` as the contract (update the file before deviating), and ends with the PR.

None of the three skills commits. Whatever is uncommitted in the story folder goes in with the first commit of the work.

**PRs.** The PR body starts with `Closes #<number>` and links the three planning files. CI runs `pnpm check:plan`, which fails a PR that changes code unless its branch names a story and that story's intent, spec and plan all say `Status: approved.`. Changes only under `_plan/`, `docs/`, `.claude/`, or to root Markdown files don't need a story.

## Database

Migrations follow `docs/database.md`. The short version: add, don't rename or drop in the same release, and generate with `pnpm db:migrate --create-only` when the SQL needs hand edits. A schema change is always a concern in the spec.

**Note:** `pnpm db:migrate --create-only` is `prisma migrate dev`, which refuses to run from a non-interactive session like this one. Generate the SQL with `pnpm exec prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script` and put it in a new `prisma/migrations/<timestamp>_<name>/migration.sql` yourself. A migration that changes or deletes rows follows "Migrations that delete rows" in `docs/database.md`: back the file up first.

**Note:** `pnpm db:reset` runs `scripts/reset-db.mjs` (delete the file, `prisma migrate deploy`, `prisma db seed`), not `prisma migrate reset`. In Prisma 7, `migrate reset` no longer seeds, and it refuses to run from an AI coding agent's session without a consent variable. The script does the same job for any `file:` `DATABASE_URL`, so use it for `before`/`after` copies of the database too.

## Accessibility

We target WCAG 2.2 Level AA. `.claude/rules/accessibility.md` is the checklist for writing UI, and `docs/accessibility-conformance.md` records where the app stands, criterion by criterion. A change that would move a row there from **Supports** to anything less is a spec concern, decided by the product owner.

Tests find elements by role and label, never by test id. Every interactive element needs an accessible name, and a test that can't find a control by its name is telling you something.

## Infrastructure

`docs/infrastructure.md` lists what runs today and what it costs. Anything that adds a recurring cost (a new service, a scheduled job, an email or SMS provider, a bigger instance) is a spec concern, decided by the program lead before the build.

## Definition of done and code style

See `.claude/rules/definition-of-done.md` and `.claude/rules/code-style.md`.
