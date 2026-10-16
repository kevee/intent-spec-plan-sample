# Adopt the workflow in your own repo

The three skills in this repo are written for Fairview Volunteers: they name its docs, its components, its test commands and its concern areas. Three things change when you move them to another project, and the rest transfers as is:

- **The story ID ---** here it's a GitHub issue number. Yours might be a tracker key like `PROJ-123`, or nothing at all.
- **The files each stage reads ---** here `CLAUDE.md`, `.claude/rules/`, three docs under `docs/`, the Prisma schema and CI. Yours are wherever your rules and runbooks live.
- **The concern areas and who decides them ---** here database schema, accessibility, infrastructure cost, security and privacy, and operations. Yours may add a design review, localization, or a legal check, and the deciders will have different titles.

The prompt below does that adaptation for you. Open Claude Code in the repo you want to adopt the workflow in, paste the whole prompt, and answer its questions. It reads your repo, proposes defaults, rewrites the skills, and shows you everything before it writes a file. It never commits or pushes.

**What you need:** Claude Code, a git repository, and either `gh` or `curl` so it can fetch the skills from here. If your issues live on GitHub, `gh auth status` should pass. The plan check is a Node script, so if your repo has no Node toolchain you'll need Node locally and in CI to use it.

**What it writes:** `.claude/skills/intent/`, `.claude/skills/spec/`, `.claude/skills/plan/`, `_plan/README.md`, and a "Planning artifacts" section in your `CLAUDE.md` (created if you don't have one). If you say yes to the gate, also `scripts/check-plan.mjs` with its tests, the command that runs it wherever your other checks live (`package.json`, a Makefile), a CI step, a section in your PR template, and a line in your README's setup or checks section. Nothing else.

**Note:** skills register when a session starts. After the prompt finishes, start a new Claude Code session before you run `/intent`.

## The prompt

````markdown
Set up this repo's planning workflow by adapting the intent → spec → plan skills from
https://github.com/kevee/intent-spec-plan-sample. Work in this order, and show me every file
before you write it. Don't commit, don't push, don't create anything on GitHub.

## 1. Fetch the originals

Download these files from `https://raw.githubusercontent.com/kevee/intent-spec-plan-sample/main/`
into a scratch folder outside this repo (use `curl -fsSL`, or `gh api repos/kevee/intent-spec-plan-sample/contents/<path>`):

- `.claude/skills/intent/SKILL.md` and `template.md`
- `.claude/skills/spec/SKILL.md` and `template.md`
- `.claude/skills/plan/SKILL.md` and `template.md`
- `_plan/README.md`
- `.github/pull_request_template.md`
- `scripts/check-plan.mjs` and `scripts/check-plan.test.mjs`
- `.github/workflows/ci.yml` (for the `check:plan` step: `fetch-depth: 0` on the checkout, and
  the step only on pull requests)
- `CLAUDE.md` (only its "Planning artifacts" section matters)

Read all of them before you change anything. The skills' structure, steps, gates and
"one story, one branch" rule stay exactly as they are. What changes is everything that is
specific to Fairview Volunteers: its story IDs, its files, its commands, its components, its
concern areas, and its example stories. Section 4 says where most of that lives; it is not an
exhaustive list, and the grep in section 5 is the test.

## 2. Read this repo

Look at what's here before asking me anything: `CLAUDE.md` or `AGENTS.md`, `README.md`,
`CONTRIBUTING.md`, `docs/` or wherever runbooks live, `.claude/rules/` if it exists, the scripts
in `package.json` (or the Makefile, `pyproject.toml`, `Taskfile`, whatever runs things here),
the CI config, the PR template, the schema or migrations folder if there is one, and
`git log --oneline -30` plus `git branch -a` for how branches and commits are named. Note
any tracker keys in commit messages or branch names (`PROJ-123`, `#42`).

Summarize what you found in a few lines, then ask the questions in section 3 with your findings
as the proposed defaults. Group them into four rounds, one per heading below, and lead each
round with what you'd pick so that "yes, all of that" is a valid answer. When what you found
contradicts an answer, say so once and take the answer.

## 3. Three things to decide, then the gate

**Story IDs and branches.** How is a story identified here?
- A GitHub issue number: folder `_plan/12-<slug>/`, branch `<handle>/12-<slug>`, `Story: #12`,
  PR body `Closes #12`. This is what the originals assume; keep their `gh issue view` lookup,
  their offer to create the issue, and the `gh api user` handle derivation.
- A tracker key like `PROJ-123`: folder `_plan/PROJ-123-<slug>/`, branch
  `<prefix>/PROJ-123-<slug>`, and a `Story: PROJ-123 (<link>)` line. Ask for the tracker's
  ticket URL pattern so the skills can build the link, and whether the tracker has a CLI for
  looking up a title; if not, the intent skill asks the user for the title and never offers to
  create a ticket. In the PR template, `Closes #<number>` becomes the `Story:` line.
- No tracker: folder `_plan/<slug>/`, branch `<prefix>/<slug>`, no `Story:` line, and the
  branch check only requires the prefix.
Also confirm the branch prefix: `<handle>/` (derived from `gh api user`, as the originals do),
or a fixed prefix like `feature/` (then drop the handle derivation entirely), whichever
`git branch -a` shows; with no branches to read it from, propose `<handle>/`. The branch check
requires a fixed prefix literally and accepts any handle otherwise. Confirm the folder name (`_plan/` or something else), and that approval
is a `Status: approved.` line set by the product owner on the story branch, not a merge.

**The files each stage reads.** For each file the originals read, what plays that role here,
or "nothing":
- `CLAUDE.md` (architecture and conventions). If there is none, say whether to create a small
  one holding the "Planning artifacts" section, or to put that section in `AGENTS.md`.
- `.claude/rules/code-style.md`, `accessibility.md`, `definition-of-done.md`
- `docs/database.md` (how schema changes happen), `docs/accessibility-conformance.md` (where the
  product stands), `docs/infrastructure.md` (what runs and what it costs)
- `prisma/schema.prisma` (what the data store holds)
- `scripts/check-plan.mjs` and `.github/workflows/ci.yml` (the gates a PR passes)
Then the commands the plan's **Proof** section uses in place of `pnpm test -- <path>`,
`pnpm test:e2e <spec>`, `pnpm lint && pnpm typecheck`, `pnpm db:reset` and `pnpm check:plan`,
and the shared components or patterns the spec's **Fit with the codebase** should name (the
originals name `TextField`, `FieldError`, `StatusMessage`, `Button` and a date formatter). If
this repo has none worth naming, the spec skill says "the nearest existing feature" instead.

**Concern areas and deciders.** The originals have five: Database schema, Accessibility,
Infrastructure cost, Security / privacy, Operations. For each: keep, rename, or drop it; who
decides it here (a role, not a name); and which doc the check reads, or "none, ask the user".
Where a check loses its doc, keep its standard: the accessibility check still names WCAG
criteria even when there is no conformance doc to point at. Then ask whether to add any area:
a design review against mockups, localization, legal or compliance, records retention, a
third-party integration you depend on. Each new area needs the three things above, a short
list of what to flag in the style of the originals' spec Step 5, and one line for the plan
skill's Step 3 on what a resolved concern in that area implies for the build.

Also ask whether designs come as Figma links. If not, replace the intent skill's Step 2 with
"ask for a link to the design, if any", and replace the Figma paragraph in the spec skill's
Step 3 with "read the design if you can, otherwise ask the user to describe it".

**The gate.** Ask whether to install `check:plan` and its CI step, and if so where the
command lives (a `package.json` script keeps the name `check:plan`; a Makefile target can't hold
a colon, so it becomes `check-plan`, and the script's messages follow). Say plainly that the
adoption change itself touches files the gate doesn't exempt (the script, the CI file, the PR
template, and the file that runs the checks, `package.json` or the Makefile), so the PR that
adds the workflow will fail its own gate unless the exempt list also covers them. Offer that:
adding `.github/`, `scripts/check-plan*` and that runner file to the exempt paths in
`needsNoStory`, so workflow and tooling changes never need a story.

## 4. Rewrite

Produce the adapted files. Keep each original's headings, step numbers and gates, and rewrite
the repo-specific content wherever it appears. Most of it is here:

- **Every skill ---** the `description` frontmatter where it mentions Figma or GitHub issues;
  the `allowed-tools` list (drop or swap the `gh` commands); the story ID shape, folder and
  branch pattern wherever they're spelled out; the example file in "The file format", rewritten
  for a plausible story in this repo, in the same shape, with a fictional author and no real
  people. When the repo is too small to supply real paths for an example, invent plausible
  ones that follow its layout.
- **`intent/SKILL.md` ---** Step 1's issue lookup and offer to create one; Step 2 (designs);
  the "usual suspects" under Affected users and systems and the categories under Constraints,
  which name volunteers, shifts and a sign-up form today; Step 6's handle and branch rules.
- **`spec/SKILL.md` ---** Step 2's list of files to read and the component names; Step 3's
  design paragraph and the test file patterns; Step 4's edge-case examples; Step 5's concern
  areas, each with what to flag, which doc it reads and who decides; the format example.
- **`plan/SKILL.md` ---** Step 3's list of files to read and what a resolved concern implies,
  including any new area; Step 4's **Proof** minimums with this repo's commands; the example
  plan; the PR rules under "When the build starts".
- **`spec/template.md` ---** the concern area list in the Concerns row.
- **`_plan/README.md` ---** the folder name, the ID shape, the branch pattern, the concern areas
  and the gate's name.
- **`CLAUDE.md` ---** add a "Planning artifacts" section modelled on the original's, naming
  this repo's folder, ID shape, branch pattern, the three skills and the gate. Don't rewrite
  anything else. If I said to create the file, it holds that section and a pointer to where
  the repo's conventions actually live.
- **`scripts/check-plan.mjs` and its tests ---** only if I said yes. Change `BRANCH_PATTERN`
  to the ID shape, the exempt paths in `needsNoStory` to this repo's planning and docs folders
  (plus the tooling paths if I said so), the messages to the new branch and folder shapes, and
  the test fixtures to match. Then add the command where this repo runs its checks, the CI steps
  modelled on the original's (checkout with `fetch-depth: 0`, Node available, the script's tests
  on every run, the gate only on pull requests), and one line in the README's setup or checks
  section saying what the command does and that it needs Node.
- **The PR template ---** only if I said yes. Add the "Planning" section from the original,
  with this repo's folder and ID shape, and the `Closes #` line or its tracker equivalent.

Before writing, show me a short summary per file of what changed and why, then the full
contents of each skill. Write only after I say so.

## 5. Check

After writing:

1. Grep the new and changed files for Fairview leftovers and fix every hit that isn't a word
   this repo genuinely uses (a `shift` key is fine; a volunteer shift is not):
   `grep -rniE 'fairview|volunteer|riverside|signup|sign-up|duplicate-signups|kevee|prisma|pnpm|textfield|fielderror|statusmessage|formatshift|playwright|axe' .claude/skills _plan/README.md CLAUDE.md README.md scripts/check-plan*.mjs .github/`
   plus the runner file you changed.
   Then read each skill top to bottom once, looking for a step that no longer makes sense here.
2. If you wrote `check-plan.mjs`, run its tests, then run the check once so I see it execute.
   It diffs committed changes against `main`, so on a fresh branch it reports no changed files,
   and on a branch with earlier commits it judges those; either is fine here.
3. Tell me to start a new Claude Code session so the skills register, and that `/intent`
   is the first thing to run.
````
