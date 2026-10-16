import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { checkPlan } from './check-plan.mjs'

const approved = (title) => `# ${title}\nStory: #1\nStatus: approved.\n`

// A fake repo: a map of path → contents.
const repo = (files) => ({
  readFile: (path) => (path in files ? files[path] : null),
  listDirs: (path) => {
    const names = new Set()
    for (const file of Object.keys(files)) {
      if (file.startsWith(`${path}/`)) {
        names.add(file.slice(path.length + 1).split('/')[0])
      }
    }
    return [...names]
  }
})

const story1 = {
  '_plan/1-duplicate-signups/intent.md': approved('Intent: duplicate sign-ups'),
  '_plan/1-duplicate-signups/spec.md': approved('Spec: duplicate sign-ups'),
  '_plan/1-duplicate-signups/plan.md': approved('Plan: duplicate sign-ups')
}

const codeChange = ['src/lib/validation.ts', 'src/lib/validation.test.ts']

describe('checkPlan', () => {
  it('passes a docs-only change on any branch', () => {
    const result = checkPlan({
      files: [
        'docs/database.md',
        'README.md',
        '.claude/skills/spec/SKILL.md',
        '_plan/README.md'
      ],
      branch: 'kevee/tidy-docs',
      ...repo({})
    })
    assert.equal(result.ok, true)
    assert.deepEqual(result.failures, [])
    assert.match(result.notes[0], /No story needed/)
  })

  it('passes when nothing changed', () => {
    const result = checkPlan({ files: [], branch: 'main', ...repo({}) })
    assert.equal(result.ok, true)
  })

  it('fails a code change on a branch without a story number', () => {
    const result = checkPlan({
      files: codeChange,
      branch: 'kevee/fix-validation',
      ...repo(story1)
    })
    assert.equal(result.ok, false)
    assert.deepEqual(result.failures, [
      'Code changes need a story branch named `<handle>/<issue>-<slug>`. This branch is `kevee/fix-validation`.'
    ])
  })

  it('fails when the story has no folder in _plan/', () => {
    const result = checkPlan({
      files: codeChange,
      branch: 'kevee/2-missed-shifts',
      ...repo(story1)
    })
    assert.equal(result.ok, false)
    assert.match(
      result.failures[0],
      /No `_plan\/2-<slug>\/` folder for story #2/
    )
    assert.match(result.failures[0], /\/intent 2/)
  })

  it('fails a draft spec and names who approves it', () => {
    const result = checkPlan({
      files: codeChange,
      branch: 'kevee/1-duplicate-signups',
      ...repo({
        ...story1,
        '_plan/1-duplicate-signups/spec.md': '# Spec\nStatus: draft.\n'
      })
    })
    assert.equal(result.ok, false)
    assert.deepEqual(result.failures, [
      '`_plan/1-duplicate-signups/spec.md` is `draft`. A product owner sets `Status: approved.` on this branch.'
    ])
  })

  it('reports every problem, not only the first', () => {
    const result = checkPlan({
      files: codeChange,
      branch: 'kevee/1-duplicate-signups',
      ...repo({
        '_plan/1-duplicate-signups/intent.md': approved('Intent'),
        '_plan/1-duplicate-signups/spec.md': '# Spec\nStatus: in review.\n'
      })
    })
    assert.equal(result.ok, false)
    assert.equal(result.failures.length, 2)
    assert.match(result.failures[0], /spec\.md` is `in review`/)
    assert.match(result.failures[1], /plan\.md` is missing/)
    assert.match(result.failures[1], /`\/plan`/)
  })

  it('passes a dependabot branch with a note', () => {
    const result = checkPlan({
      files: ['package.json', 'pnpm-lock.yaml'],
      branch: 'dependabot/npm_and_yarn/next-16.4.3',
      ...repo({})
    })
    assert.equal(result.ok, true)
    assert.match(result.notes[0], /Dependabot/)
  })

  it('passes when the intent, spec and plan are all approved', () => {
    const result = checkPlan({
      files: [...codeChange, ...Object.keys(story1)],
      branch: 'kevee/1-duplicate-signups',
      ...repo(story1)
    })
    assert.equal(result.ok, true)
    assert.deepEqual(result.failures, [])
    assert.match(
      result.notes[0],
      /_plan\/1-duplicate-signups\/` has an approved/
    )
  })

  it('refuses two folders for one story', () => {
    const result = checkPlan({
      files: codeChange,
      branch: 'kevee/1-duplicate-signups',
      ...repo({
        ...story1,
        '_plan/1-dupes/intent.md': approved('Intent')
      })
    })
    assert.equal(result.ok, false)
    assert.match(result.failures[0], /2 folders/)
  })
})
