---
name: intent
description: >
  Work with the user to write an intent file for a story — the first artifact in this repo's
  planning workflow (intent → spec → plan). Use this skill whenever the user wants to start a new
  piece of work, capture a problem statement, write up an idea, or says things like "intent",
  "write an intent", "start a story", "new story", "kick off #12", or "/intent". Takes an optional
  GitHub issue number, asks for Figma links to dev-ready nodes when there is a design, and puts
  the session on the story's branch, where the spec, plan and code will follow.
argument-hint: '[issue number, e.g. 12] (optional — the skill asks if omitted)'
allowed-tools: Read, Write, Glob, Grep, AskUserQuestion, Bash(git config*), Bash(git log*), Bash(git status*), Bash(git branch*), Bash(git switch*), Bash(git worktree list*), Bash(gh api user*), Bash(gh issue view*), Bash(ls*), Bash(mkdir*)
---

Help the user write an intent file: a short, version-controlled markdown document that captures
**what** they want, **why**, and **under which constraints**, in their own words. It is the
starting point of this repo's planning workflow, loosely based on the
[AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook): a product owner
approves the intent, then it feeds the spec, and the spec feeds the plan.

An intent is a problem statement, not a solution. Your job in this skill is to interview, push
back where the user has skipped the "why", draft, and then let the user correct every
misunderstanding before anything is written. The user is the author. You are the scribe.

## Where intents live

```
_plan/<number>-<slug>/intent.md
```

One folder per story. `spec.md` and `plan.md` land in the same folder in later stages.
`<number>` is the story's GitHub issue number and `<slug>` is the intent title in kebab-case, at
most five words (`_plan/12-shift-meeting-points/intent.md`).

## One story, one branch

A story's intent, spec, plan and code all live on one branch, usually in one worktree, and go out
in one PR. No stage gets a PR of its own: we don't open a PR for the intent, merge it, and then
start the spec. Approval is a status line, not a merge. A product owner reads the intent on the
branch and sets `Status: approved.`, and the spec gets written right next to it.

That's why this skill, the first stage to know the story number, is the one that puts the session
on the story's branch (Step 6). `/spec` and `/plan` expect to find you there.

## The file format

Use `template.md` next to this skill as the exact shape. Do not add, rename, or reorder sections.

```markdown
# Intent: shift meeting points
Story: #12
Design: none.
Author: J. Ortiz (volunteer coordinator).
Status: draft.

## Problem
Volunteers arrive at large sites like Riverside Park and can't find where the shift starts.
On the last three clean-ups, roughly a quarter of volunteers phoned a coordinator to ask.

## Proposed outcome
Volunteers know exactly where to go when they arrive, before they leave home.

## Affected users and systems
Volunteers, volunteer coordinators, the shift page, the database.

## Constraints
No maps service with a monthly cost. WCAG 2.2 AA for anything a volunteer sees.

## Open questions
Do coordinators know the meeting point when they create the shift?
```

- **Title ---** lowercase after `Intent:`, a noun phrase, no trailing period.
- **Story ---** `#` followed by the GitHub issue number.
- **Design ---** one Figma URL per line to a dev-ready node, or `Design: none.` when there is no
  design. Several designs means several `Design:` lines, one after another.
- **Author ---** the person's name with their role in parentheses, ending in a period.
- **Status ---** one of `draft`, `in review`, `approved`, ending in a period. New intents are
  always `draft`. Only a product owner moves it to `approved`, and that happens outside this skill.
- Each section is plain prose, two to four sentences. Bullets only where the content is a genuine
  list (affected systems, several open questions).

## Step 1: Get the story

If `$ARGUMENTS` contains a story number, use it. Otherwise ask for it before anything else. Accept:

- `12` or `#12`
- a GitHub issue URL (`https://github.com/<owner>/<repo>/issues/12`) — take the number from it

Reject anything else and ask again. When `gh` is available, run `gh issue view <number> --json
title,state` and repeat the issue's title back so the user can confirm it's the right one.

An issue that doesn't exist yet is fine. Tell the user, and offer to create it with `gh issue
create` once they've confirmed the title. Creating an issue is public, so only do it when they say
yes. Otherwise write the intent with the number they intend to use.

Then check whether `_plan/<number>-*/intent.md` already exists (`ls _plan/`). If it does, read it
and ask whether the user wants to revise that intent or start over. Revising keeps the same
folder; never silently create a second intent for one story.

Also look for the story's branch (`git branch --list '*/<number>-*'`). If one exists and you're
not on it, the story has already started somewhere else, and its intent is probably there rather
than here. Tell the user which branch, and use `git worktree list` to say whether another worktree
has it checked out. Ask whether to carry on there instead. Two copies of one story's intent on two
branches is exactly what the one-branch model exists to avoid.

## Step 2: Get the design links

Ask whether there are Figma designs for this work, and for the URL of each **dev-ready node**. A
dev-ready link is a node URL copied from Figma's Dev Mode, which looks like:

```
https://www.figma.com/design/<fileKey>/<FileName>?node-id=<id>&m=dev
```

For each URL the user gives:

- Check it is a `figma.com/design/...` or `figma.com/file/...` URL with a `node-id` query
  parameter. A link to a whole file with no `node-id` points at nothing in particular; ask for the
  specific frame or section.
- If `m=dev` is missing, keep the link but ask the user to confirm the node is marked **Ready for
  dev** in Figma. Don't silently add the parameter.
- If a Figma MCP server is connected, use its metadata tool to fetch the node's name and repeat it
  back so the user can confirm it is the right one. If none is connected, carry on without — the
  link is the artifact, the lookup is a courtesy.

Plenty of stories have no design, and that's fine. Write `Design: none.` and move on. Don't
invent a placeholder URL.

Keep the links in mind for the interview: a design is a strong statement of the proposed
outcome, and the frames it shows tell you which users and systems are affected.

## Step 3: Get the author

Default to the git user name (`git config user.name`). Ask the user to confirm it and give their
role in a few words — the role is what a reader a year from now uses to judge the perspective of
the intent ("volunteer coordinator" says something "J. Ortiz" alone does not). Format:
`Name (role).`

## Step 4: Interview

Work through the sections in order, one at a time, in plain chat. Use `AskUserQuestion` only for
choice-shaped questions (which systems are affected); narrative answers come back better when you
ask in prose and let the user type freely. Ask one or two questions at a time, not a wall of them.

### Problem

Ask what is happening today, who feels it, and how often or how much. Numbers are gold: "roughly
a quarter of volunteers" is worth more than "a lot". If the user doesn't have a number, a rough one
with "roughly" in front is still better than none, and a missing number can go in open questions.

Watch for a solution dressed up as a problem. "We need a map on the shift page" is not a problem. Ask
what the map would fix, and write *that* down. The feature itself can resurface in the proposed
outcome if it is genuinely the outcome, or in open questions if it is one option among several.

Push back once, politely, when the problem is vague. Do not push back three times. If the user
says "that's the problem as I understand it", take it.

### Proposed outcome

Ask what is true for the affected people once this is done. Outcomes, not implementation:
"volunteers know which shifts still need people" rather than "add a spots-left column to the
shift list". If the user can only describe it as implementation, write the outcome you can infer
and read it back to them for correction. When there is a design link, ask whether the design *is*
the outcome or one possible shape of it, and write the outcome in words either way — the file has
to make sense to someone who never opens Figma.

### Affected users and systems

Ask who is touched and which parts of the system. Offer the usual suspects as a multi-select so
nothing obvious is forgotten, and let the user add their own:

- **Users ---** volunteers, volunteer coordinators, the program lead.
- **Systems ---** the shift list, the shift page and its sign-up form, the server actions, the
  database, anything that sends email or text messages, a scheduled job, CI.

Write the answer as a short comma-separated sentence, like the example. Don't list every file the
change might brush; list the parts whose owners should read this intent.

### Constraints

Ask what must stay true, and what is off the table. Prompt with the categories that come up most
in this project if the user draws a blank:

- Privacy (no new personal data without the volunteer's agreement, no accounts or logins)
- Accessibility (WCAG 2.2 AA is the floor for every UI change)
- Budget (any new monthly cost needs the program lead's OK)
- Timing (an event date, the start of a season)
- Scope (must not change X, existing sign-ups must survive)

Constraints are flat statements, not explanations. Two or three is typical. Zero is suspicious;
ask once more before accepting it.

### Open questions

Anything the interview left unresolved goes here automatically: the missing number, the
"depends who you ask" answer, the feature the user mentioned that may or may not be the right one.
Then ask whether there is anything else they are unsure about. An intent with no open questions is
rare and usually means the problem is small or the author hasn't talked to the affected users yet;
say so gently if that is what you see, but do not invent questions.

## Step 5: Draft and correct

Assemble the draft in the exact format and show the whole thing in chat as a fenced markdown block.
Then ask the user to correct anything you got wrong. This step is the point of the skill: the
intent has to be in the author's words and reflect the author's understanding, not yours.

Loop on corrections until the user says it is right. Keep each revision whole (reshow the full
file), so they always see what will be written.

## Step 6: Get onto the story branch

Only after the user approves the draft. First build the slug from the title: lowercase,
kebab-case, at most five words.

The branch is `<handle>/<number>-<slug>`, so the branch, the `_plan/` folder and the PR all carry
the same issue number, and CI's `check:plan` can find the story's artifacts from the branch name.
Build it from:

- **handle ---** `gh api user --jq .login`. If `gh` isn't authenticated, derive it from the
  `git config user.email` noreply address (`12345+jortiz@users.noreply.github.com` → `jortiz`).
  Failing both, ask.
- **number ---** the issue number.
- **slug ---** the slug you built above.

Then look at where you are (`git status`, `git branch --show-current`,
`git log --oneline main..HEAD`):

- **Already on a `*/<number>-*` branch** --- stay there. Revising an intent lands here.
- **On `main`** --- create and switch to the new branch (`git switch -c <name>`).
- **On an auto-named `claude/...` branch with no commits ahead of `main`** --- a Claude Code
  session made it. Rename it (`git branch -m <name>`) so the story lands under its number.
- **On any other branch with commits** --- don't move it. Ask whether this story belongs here or
  on a fresh branch from `main`.

Never stash, never discard. If the working tree is dirty, say so and ask before switching.

## Step 7: Write the file

1. `mkdir -p _plan/<number>-<slug>` and write `intent.md` there, exactly as approved.
2. Tell the user the path, the branch, and what happens next: a product owner reviews the intent
   on this branch and sets `Status: approved.`, then `/spec` runs in this same worktree and writes
   the spec next to it. Nothing gets a PR until the code is ready.

Don't commit. The intent waits on the story branch for the spec, plan and code, and they all go
out together in the story's one PR.

## What a good intent looks like

Before you show the final draft, check it against this list and fix what fails:

- A reader outside the team can tell what is wrong today and for whom.
- The problem contains at least one number, or the missing number is an open question.
- The outcome describes the world after, not the work to get there.
- Nothing in the file names a specific component, field, or library unless it is a constraint.
- Every section is present, even if short. No section is longer than four sentences, unless it
  is a short bulleted list.
- The whole file fits on one screen.
