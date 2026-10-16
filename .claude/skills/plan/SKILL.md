---
name: plan
description: >
  Start the build stage for a story: reads its approved spec, checks the engineer is on the
  story's branch, and drafts plan.md (files that change, order of work, risks, proof) in plan
  mode for the engineer to approve before any code is written. Third artifact in this repo's
  planning workflow (intent → spec → plan). Use whenever an engineer wants to start building a
  story, or says "plan", "start #12", "build the spec", "let's implement this", or "/plan".
argument-hint: '[issue number, e.g. 12] (optional — the skill lists the specs in _plan/ if omitted)'
allowed-tools: Read, Write, Glob, Grep, Agent, AskUserQuestion, EnterPlanMode, ExitPlanMode, Bash(git status*), Bash(git branch*), Bash(git switch*), Bash(git checkout*), Bash(git log*), Bash(git rev-parse*), Bash(git merge-base*), Bash(git config*), Bash(git worktree list*), Bash(gh api user*), Bash(ls*), Bash(mkdir*)
---

Get an engineer from an approved spec to an approved plan. This skill ends when `plan.md` is
written and approved. It does **not** write code: the engineer reads the plan, says "go", and the
build runs in the ordinary way with `plan.md` as the contract. Keeping those apart is the point —
the [playbook](https://claude.com/blog/the-ai-native-sdlc-playbook) has the engineer approve the
plan before the first line of code, and a skill that plans *and* builds makes that approval easy
to blur past.

## Where plans live

```
_plan/<number>-<slug>/plan.md
```

Same folder as the intent and spec, and the same branch. A story's intent, spec, plan and code
all live on one branch, usually in one worktree, and go out in one PR. The intent and spec were
approved by editing their status lines on this branch, not by merging anything, so this is
normally the worktree they were written in.

## The file format

Use `template.md` next to this skill. It is the playbook's four sections with a header.

```markdown
# Plan: shift meeting points (from spec.md 2026-10-22)
Story: #12
Branch: jortiz/12-shift-meeting-points
Author: Claude, approved by J. Ortiz.
Status: draft.

## Files that change
prisma/schema.prisma, prisma/migrations/<timestamp>_shift_meeting_point/migration.sql (new),
prisma/seed.ts, src/lib/shifts.ts, src/lib/shifts.test.ts, src/app/shifts/[id]/page.tsx,
e2e/shifts.spec.ts, docs/database.md

## Order of work
1. Optional `meetingPoint` column, migration and seed values, with `pnpm db:reset` as the check.
2. Return it from `getShift`, with its unit test.
3. Show it on the shift page under the location, with the e2e case and its axe scan.
4. Docs, then the PR.

## Risks
Step 1 is the risky one: the column must be optional, or every existing shift fails the migration.
Shifts created before this have no meeting point, so the page needs a sensible empty state.

## Proof
`pnpm test -- src/lib/shifts.test.ts` covers a shift with and without a meeting point.
`pnpm test:e2e e2e/shifts.spec.ts` passes, axe included. `pnpm db:reset` succeeds.
`pnpm lint && pnpm typecheck` pass. `pnpm check:plan` passes on the branch.
```

- **Title ---** the spec's title, then `(from spec.md <date you read it>)`.
- **Branch ---** the story branch the intent, spec and code share, as Step 2 confirms it.
- **Author ---** `Claude, approved by <engineer>.` from `git config user.name`.
- **Status ---** `draft` until the engineer approves it in plan mode, then `approved`. This is the
  one artifact the skill itself moves to `approved`, because the approval happens in the same
  session.
- **Files that change ---** a comma-separated list, `(new)` after new files. Tests and docs
  included. This is the section that proves you looked.
- **Order of work ---** numbered, each step shippable on its own where possible, tests in the
  same step as the code they cover. Docs and the PR are the last step, always.
- **Risks ---** what could go wrong and which step is the risky one. Repo gotchas from
  `CLAUDE.md` and `docs/database.md` belong here when they apply (a seed the schema change
  invalidates, a constraint existing rows break, dates formatted outside `formatShiftTime`).
- **Proof ---** concrete commands and checks that show the change works and the definition of
  done is met. The reviewer runs these; write them so they can.

## Step 1: Find the spec and check the gates

If `$ARGUMENTS` has a story number, look for `_plan/<number>-*/spec.md`. Otherwise list `_plan/`
and ask which story. Then read `intent.md` and `spec.md` in full.

Three gates, in order:

1. **No spec** — first check whether the story lives on another branch or worktree
   (`git branch --list '*/<number>-*'`, then `git worktree list`). If it does, tell the engineer
   to continue there and stop. If it doesn't, stop and point at `/spec`. A plan without a spec is
   guessing.
2. **Spec not `approved`** — tell the engineer and ask whether to proceed. Proceeding is their
   call, but the plan header must say `(from spec.md <date> — spec not yet approved)`, and CI's
   `check:plan` will fail the PR until the spec is approved.
3. **Open concerns** — read the spec's Concerns table. Any row whose Resolution is `Open` is
   listed back to the engineer with its area and decider. Ask whether each has been decided since
   (and record the answer in `spec.md` if so), or whether to proceed with it open. An open
   concern that stays open goes in the plan's **Risks** by name.

If `plan.md` already exists, read it and ask whether to revise it or start over. An existing
approved plan with commits on the branch is probably mid-build: say so and ask before touching it.

## Step 2: Check the branch

`/intent` normally put the session on the story branch (`<handle>/<number>-<slug>`) when it wrote
the intent, so this step is usually a check. Look at where you are (`git status`,
`git branch --show-current`, `git log --oneline main..HEAD`):

- **On the story's `*/<number>-*` branch** — carry on. Commits ahead of `main` that only touch
  `_plan/<number>-<slug>/` are this story's planning commits, not other work.
- **Anywhere else** — the intent was written on the wrong branch. Get onto the story branch now,
  before the plan is written, using the rules in Step 6 of `.claude/skills/intent/SKILL.md`
  (branch name, `main` vs. an empty `claude/...` branch vs. a branch with its own commits). The
  slug is the story folder's slug.

The story's own `_plan/<number>-<slug>/` folder being uncommitted is normal: that's the intent and
spec waiting to go in with the work, and they move with you when you switch or rename. Anything
else uncommitted, say so and ask before switching. Never stash, never discard.

## Step 3: Load the context the plan needs

Read, every time:

- `CLAUDE.md` — especially the section for whatever the spec touches, and the notes marked
  **Note:** near it; those are the mistakes previous sessions made.
- `.claude/rules/definition-of-done.md` — every item becomes a line in **Proof**.
- `.claude/rules/accessibility.md` and `.claude/rules/code-style.md`.
- The spec's **Fit with the codebase**, **Data** and **Concerns** sections. A resolved schema
  concern means a migration step, a seed check and a `docs/database.md` step. A resolved
  infrastructure concern means a `docs/infrastructure.md` step and the README's setup section for
  any new environment variable. A resolved accessibility concern means the
  `docs/accessibility-conformance.md` rows it named.

Then explore the code the spec names. Use the `Explore` agent for anything wider than a few
files. You need, for every surface the spec touches: the file, its test file (or the fact that
there isn't one), the Playwright spec that covers it, and the nearest existing feature to copy.

## Step 4: Draft the plan in plan mode

Enter plan mode (`EnterPlanMode`) and draft `plan.md` in the format above. Plan mode is the
right tool here because the engineer's approval *is* the gate, and it stops you from editing
anything while you plan.

Rules for the draft:

- **Files that change** lists real paths you found in Step 3, not guesses. If a test file doesn't
  exist for code you change, list it as `(new)`. If the build will record a concern's resolution
  in `spec.md`, list that too.
- **Order of work** puts tests with their code, not at the end. The last step is always docs
  (README, `CLAUDE.md`, the docs in `docs/` as applicable) and the PR.
- **Risks** names the risky step and any open concern carried from the spec.
- **Proof** has, at minimum: `pnpm test -- <path>` for every changed server action, `src/lib/`
  file or script; `pnpm test:e2e <spec>` when a page or flow changes, which runs the axe scan too;
  `pnpm lint && pnpm typecheck`; `pnpm db:reset` when the schema or seed changes; any one-off
  check a risky step needs (a migration run against a copy of the current data, say); the docs
  that change; and `pnpm check:plan` as the final item. Accessible names on every new control are
  implied by the Playwright line, but say it once.

Present it with `ExitPlanMode`. When the engineer asks for changes, revise and present again.
When they approve, continue.

## Step 5: Write the file

Write `_plan/<number>-<slug>/plan.md` with the approved plan and `Status: approved.` Then tell
the engineer:

- the path, and the branch they are on
- that the build starts when they say "go", in this session or a new one
- that `plan.md` is the contract: when the build has to deviate from it, update the file in the
  same commit rather than letting it drift

Do not start building, and do not commit from this skill. Whatever in the story folder isn't
committed yet — the plan, and often the intent and spec too — goes in with the first commit of
the work.

## When the build starts

For the session that builds (this one after "go", or a later one that reads this file):

- Work the steps in `plan.md` in order. Finish a step, run its proof, then move on.
- If a step turns out wrong, change `plan.md` first, then the code. Note the change in the
  **Risks** section so the reviewer sees it.
- The last step is the PR. Its title is the intent's title, its body follows
  `.github/pull_request_template.md` and starts with `Closes #<number>`, and it describes the
  outcome from the intent, not the plan's steps.
- The PR is the story's only one. It carries the whole `_plan/<number>-<slug>/` folder with the
  code, so the reviewer reads the intent, spec and plan alongside the diff. CI's `check:plan`
  fails it unless all three say `Status: approved.`
