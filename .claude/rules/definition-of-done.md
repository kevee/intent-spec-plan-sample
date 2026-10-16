# Definition of done

Before calling any task complete, check each item. Skip one only when it genuinely doesn't apply, like tests for a docs-only change.

## 1. Tests are updated

- **Unit tests ---** when you change a server action, anything in `src/lib/`, or a script, update its tests or add them, and run that one file: `pnpm test -- <path>`.
- **End-to-end tests ---** when you change a page or a flow, update or add a Playwright spec and run it: `pnpm test:e2e <spec>`. New controls need accessible names, because the tests find them by role and label.
- **Both ---** a change to server logic and UI gets both.

## 2. Accessibility passes

- Every page test ends with an axe scan, and it reports zero violations.
- New UI follows `.claude/rules/accessibility.md`.
- When the change affects a criterion in `docs/accessibility-conformance.md`, update that row.

## 3. The plan held

- Every step in the story's `plan.md` is done, and its proof ran.
- Where the build deviated, `plan.md` says so, in the same commit as the deviation.

## 4. Docs are current

- `README.md` for setup, commands and anything a newcomer would trip on.
- `CLAUDE.md` for new patterns, commands or decisions Claude should know.
- `docs/database.md` for schema changes, `docs/infrastructure.md` for anything that runs or costs money, `docs/accessibility-conformance.md` for conformance changes.

## 5. CI is green

`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:scripts`, `pnpm test:e2e` and `pnpm check:plan` all pass locally before you push.
