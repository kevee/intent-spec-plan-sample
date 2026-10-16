---
name: spec
description: >
  Turn an approved intent into a requirements and design spec — the second artifact in this
  repo's planning workflow (intent → spec → plan). Reads the story's intent.md, explores the
  codebase, checks the spec against this repo's rules and docs, and flags concerns (database
  schema changes, accessibility, new infrastructure cost, security and privacy, operations) for
  the user to resolve before engineering sees it. Use whenever the user wants to write a spec,
  design a feature from an intent, or says "spec", "write the spec", "spec out #12", or "/spec".
argument-hint: '[issue number, e.g. 12] (optional — the skill lists the intents in _plan/ if omitted)'
allowed-tools: Read, Write, Glob, Grep, AskUserQuestion, Agent, Bash(git config*), Bash(git log*), Bash(git branch*), Bash(git worktree list*), Bash(ls*), Bash(mkdir*)
---

Write `spec.md` for a story from its approved `intent.md`. The spec says **what we are going to
build and how it behaves**, in enough detail that a product owner can approve it and an engineer
can later turn it into `plan.md`. It is not the plan: no file lists, no order of work.

Per the [AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook), you draft
the spec, constrained by this repo's rules, with areas of concern flagged. A **product owner**
reviews and approves it, not an engineer. Every flagged concern should be resolved with whoever
owns that decision *before* engineering sees the spec, so the concerns step comes before the
draft and the user decides each one.

## Where specs live

```
_plan/<number>-<slug>/spec.md
```

Same folder as the intent. Never create a spec without an intent next to it.

The spec also lives on the same branch as the intent, usually in the same worktree. `/intent` put
the session on the story branch (`<handle>/<number>-<slug>`), and the plan and code follow on that
branch too, all in one PR. The intent never had a PR of its own, so "approved" means the status
line in the file, not a merge to `main`.

## The file format

Use `template.md` next to this skill. Keep the section order. Every section is present even
when short.

```markdown
# Spec: shift meeting points
Story: #12
Intent: intent.md (approved 2026-10-20)
Design: none.
Author: Claude, reviewed by J. Ortiz (volunteer coordinator).
Status: draft.

## Summary
Two or three sentences a product owner can read in ten seconds.

## Requirements
1. Numbered, testable statements. "Must" is a requirement, "should" is a preference.
2. One behaviour per line.

## Behaviour
How it works from the user's side, surface by surface. Plain language, present tense.
Reference the design by node where there is one.

## Fit with the codebase
Which existing patterns, components and conventions this uses, and which repo rules
apply. Technical, written for the engineer who will plan it.

## Data
What is stored, where, and what changes. "No new data." is a valid answer.

## Out of scope
What this story deliberately does not do.

## Concerns
| Concern | Area | Decided by | Resolution |
| --- | --- | --- | --- |
| New `Shift.meetingPoint` column | Database schema | Eng lead | Open |

## Acceptance criteria
- Checkable statements. These become the plan's proof.

## Open questions
Each question from the intent, marked **answered** (with the answer) or **carried forward**,
plus any new ones.
```

- **Intent ---** the file name and its status with the date you read it. If the intent is not
  `approved`, say so here (`intent.md (draft — not yet approved)`).
- **Design ---** carried from the intent as-is, one per line, or `none.`
- **Author ---** `Claude, reviewed by Name (role).` The reviewer is the person running the skill.
- **Status ---** `draft`, `in review`, `approved`. Always `draft` from this skill.
- **Concern areas ---** exactly one of `Database schema`, `Accessibility`, `Infrastructure cost`,
  `Security / privacy`, `Operations`.
- **Resolution ---** `Open`, or a one-line decision and who made it.

## Step 1: Find the intent

If `$ARGUMENTS` has a story number, look for `_plan/<number>-*/intent.md`. Otherwise list the
folders in `_plan/` and ask which one.

No intent here doesn't always mean no intent. Check for the story's branch first
(`git branch --list '*/<number>-*'`, then `git worktree list`): if it exists, the intent is
there, so tell the user which branch or worktree to continue in and stop. Only when there's no
branch either, stop and point the user at `/intent`; a spec without an intent is a plan with no
"why".

Then check `git branch --show-current`. If you found the intent but aren't on its story branch,
tell the user. The spec belongs next to the intent, and `/plan` will put the session on the right
branch before anything is committed.

Read the intent in full. If `Status:` is not `approved.`, tell the user and ask whether to go on.
Going on is fine for a draft spec, but the header must say the intent was unapproved.

If `spec.md` already exists in the folder, read it and ask whether to revise it or start over.
Revising keeps the Concerns table's resolutions unless the user says otherwise.

## Step 2: Read the rules before you design anything

The spec must respect how this repo works. Read these before drafting, every time — they
change:

- `CLAUDE.md` — architecture, the shared components (`TextField`, `FieldError`,
  `StatusMessage`, `Button`), date formatting through `formatShiftTime`, the convention that tests
  find controls by role and label, and the planning rules.
- `.claude/rules/code-style.md`, `.claude/rules/accessibility.md` and
  `.claude/rules/definition-of-done.md`.
- `docs/database.md`, `docs/accessibility-conformance.md` and `docs/infrastructure.md` — the
  three docs the concern checks in Step 5 measure against.
- `prisma/schema.prisma` — what the database holds today.
- `scripts/check-plan.mjs` and `.github/workflows/ci.yml` — the gates a PR has to pass.

You don't quote these back. You use them: when the behaviour calls for a text input, the spec
says `TextField`; when it announces an outcome, the spec says `StatusMessage`; when it adds a
column, the spec names the seed change it forces. The **Fit with the codebase** section is where
that lands.

## Step 3: Understand the design and the code

If the intent has Figma links and a Figma MCP server is connected, fetch each node's metadata and
a screenshot to see what was designed. Don't pull full design context for implementation — this
skill designs behaviour, not markup. If no server is connected, ask the user to describe the
design in a few sentences and carry on.

Then explore the parts of the codebase the intent names under **Affected users and systems**.
Use the `Explore` agent for anything wider than a couple of files. You are looking for:

- the existing surface this change lands on (page, server action, query, component)
- the pattern it should copy (the nearest similar feature)
- what already stores the data it needs, if anything
- tests that cover the surface today (`*.test.ts`, `e2e/*.spec.ts`)

Keep notes; they feed **Fit with the codebase** and the concern checks.

## Step 4: Interview for requirements

Ask the user, in plain chat, two or three questions at a time:

- What does the user do, step by step, and what do they see at each step?
- What happens on the edges: empty state, error, a full shift, a shift in the past, someone doing
  the same thing twice, two people doing it at once, a very long list?
- Which of the intent's open questions can they answer now?
- Anything that is explicitly *not* in this story?

Use `AskUserQuestion` for choice-shaped things (which surface, which of two behaviours).
Stop asking when you can write every requirement as a testable sentence.

## Step 5: Run the concern checks

This is the step the skill exists for. Work through each area below against your notes and
list every concern you find. Then show the list to the user **before drafting**, one concern at
a time, with what it means, who normally decides, and the options you see. The user resolves it,
defers it (`Open`), or tells you it isn't a concern. Record the outcome in the Concerns table
either way; a dismissed concern stays in the table with the reason, so the next reader doesn't
re-raise it.

### Database schema

Flag when the behaviour needs data the database doesn't hold today. Check
`prisma/schema.prisma` first: a new model, column, index, unique constraint or relation is a
schema change. So is changing a default or a column's meaning.

What it means here, from `docs/database.md`: a migration in `prisma/migrations`, generated with
`pnpm db:migrate --create-only` when existing rows need work first; add, don't rename or drop, in
the same release; and `prisma/seed.ts` updated in the same commit if the change makes any seed row
invalid. Look hard at the rows already there. A new constraint fails to apply while existing rows
break it, a new required column needs a value for every existing row, and a migration that
rewrites or deletes data has no undo. Each of those is worth its own line.

Decided by: the eng lead.

### Accessibility

Flag any UI the app doesn't already have an accessible pattern for. Read
`docs/accessibility-conformance.md` and find the rows the change touches. The hard ones, from
experience:

- drag and drop, reordering, resizing — 2.1.1, 2.5.7
- custom widgets with no native equivalent (date pickers, combo boxes, maps, charts,
  colour-coded calendars) — 1.3.1, 4.1.2, 1.4.1
- content that updates on its own (live counts, polling status) — 2.2.2, 4.1.3
- time limits or auto-dismissing messages — 2.2.1
- colour as the only signal (status dots, red and green) — 1.4.1, 1.4.11
- focus that has to move after an action, nested dialogs, overlays — 2.4.3, 2.4.11
- anything in an email or text message the app sends, which axe never sees

Name the criteria and the current conformance level in that row. A change that would move a row
from **Supports** to anything less is a red flag: say it plainly and offer the accessible
alternative (a native control, a list instead of a board, text alongside colour). A new pattern
that *keeps* every row at Supports is still worth a line, because it adds a row or a remark and
more test surface. Accessible names on new controls are routine and go in **Fit with the
codebase**, not the table.

Decided by: the product owner.

### Infrastructure cost

Flag anything that costs money every month or every message. Check `docs/infrastructure.md`
for what runs today and the budget it sits under:

- a new component (service, worker, scheduled job), which is its own instance and its own line
  on the bill, and a scheduled job runs whether or not it has work
- a bigger instance, or more than one of anything
- a paid service: an email or SMS provider, a maps API, monitoring. Use the provider's price at
  our volume, not its free tier
- storage that grows with use (uploads, exports, logs)
- a new secret or environment variable, which isn't a cost but is a deployment change, so name it

Put a rough order of magnitude where you can ("one more small instance, about $12 a month",
"roughly 600 emails a month"), not a precise figure you can't support.

Decided by: the program lead, who owns the budget.

### Security / privacy

- new personal data (a phone number, an address, anything about a volunteer we don't hold today)
  and the volunteer's agreement to give it
- anything that reveals who is signed up for what, including through a message that differs
  depending on whether someone is already on a list
- a link or endpoint that changes something without a login (an unsubscribe link, a cancel link),
  which has to be unguessable
- user input that ends up in a URL, an email or a text message

Decided by: the product owner, with the eng lead when it's a technical control.

### Operations

- a migration that deletes or rewrites data, and how we'd recover
- a scheduled job: what happens when it runs twice, runs late, or runs against development data
- a new external dependency, and what the app does when it's down
- a new runbook section in `docs/` that someone will need at 2 a.m.

Decided by: the eng lead.

## Step 6: Draft and correct

Write the full spec in the format above and show it in chat as one fenced block. Ask the user
to correct it. Loop, reshowing the whole file each time, until they say it is right.

Before showing it, check:

- Every requirement is testable and numbered. No "etc.", no "as appropriate".
- The Summary, Requirements and Behaviour sections read for a product owner; only
  **Fit with the codebase** and **Data** are technical.
- Every intent open question appears in **Open questions** as answered or carried forward.
- Every concern you raised in Step 5 is in the table, resolved or `Open`.
- Nothing in the spec contradicts the intent's **Constraints**. If the user has decided to
  relax one, the spec says so in **Out of scope** or **Concerns**, and the intent should be
  updated too — tell them.
- No plan has leaked in: no file paths as a list of work, no step order, no estimates.

## Step 7: Write the file

Only after approval: write `_plan/<number>-<slug>/spec.md` exactly as approved, then tell the
user the path and that a product owner sets `Status: approved.` on this branch before `/plan`
runs here.

Don't commit. A spec is a planning artifact: it waits on the story branch with the intent and
goes out with the code in the story's one PR.
