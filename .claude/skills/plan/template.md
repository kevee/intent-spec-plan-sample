# Plan: <spec title> (from spec.md <YYYY-MM-DD>)
Story: #<issue number>
Branch: <handle>/<number>-<slug>
Author: Claude, approved by <engineer>.
Status: draft.

## Files that change
<Comma-separated real paths, `(new)` after new files. Tests and docs included.>

## Order of work
1. <Numbered steps, tests alongside the code they cover.>
2. <...>
3. Docs (README, CLAUDE.md, the docs in docs/ as applicable), then the PR.

## Risks
<What could go wrong, which step is the risky one, and any concern carried open from the spec.>

## Proof
<Concrete commands a reviewer can run: `pnpm test -- <path>`, `pnpm test:e2e <spec>`, `pnpm lint && pnpm typecheck`, `pnpm db:reset`, one-off checks for the risky step, the docs that change, `pnpm check:plan`.>
