# Planning artifacts

Every story in this repo gets written down three times before it gets built: once as a problem, once as a design, and once as a plan of work. This folder is where those live, one folder per story:

```
_plan/
  1-duplicate-signups/
    intent.md    # what we want, why, and under which constraints
    spec.md      # what we're going to build and how it behaves, with concerns flagged
    plan.md      # how we're going to build it: files, order of work, risks, proof
```

The folder name is the story's GitHub issue number, then a short kebab-case slug of the intent's title. Each stage reads the artifact before it and writes its own, so a reviewer can follow a story from the first problem statement to the implementation in one place. The stages loosely follow the [AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook).

## One story, one branch

All of a story's work happens on one branch: the intent, the spec, the plan and the code. We don't open a PR for the intent, merge it, and then start the spec. Approving a stage means the product owner sets `Status: approved.` in the file on the story branch, and the next stage gets written right next to it.

The story goes out as one PR at the end, carrying this folder with the code. CI's `check:plan` job fails that PR unless all three files say `Status: approved.`

**Note:** that's why you won't find every story on `main`. A story in progress lives on its `<handle>/<number>-<slug>` branch until its PR merges.

## The stages

- **`/intent` ---** start a story with it. It interviews you, pushes back when a solution is dressed up as a problem, drafts the intent in your words, puts the session on the story branch, and writes `intent.md` once you've corrected it. The product owner reviews it there and sets `Status: approved.`
- **`/spec` ---** once the intent is approved. It reads the repo's rules and docs, explores the code the intent touches, interviews you for requirements, and raises concerns (database schema, accessibility, infrastructure cost, security and privacy, operations) for you to resolve before it drafts. The product owner approves the spec too.
- **`/plan` ---** an engineer runs it once the spec is approved. It checks the spec's concerns are resolved, confirms the branch, and drafts `plan.md` in plan mode. The engineer approves it, says "go", and the build follows the plan as its contract.
