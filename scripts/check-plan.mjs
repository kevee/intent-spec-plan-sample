// The one rule the workflow depends on: code doesn't merge without an
// approved intent, spec and plan.
//
// `checkPlan` is pure so it can be tested without git. The CLI at the bottom
// feeds it the branch and the files changed against the base branch.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const BRANCH_PATTERN = /^[^/]+\/(\d+)-[a-z0-9-]+$/

const ARTIFACTS = [
  { file: 'intent.md', approver: 'A product owner' },
  { file: 'spec.md', approver: 'A product owner' },
  { file: 'plan.md', approver: 'The engineer' }
]

// Planning, docs and skill changes don't need a story.
const needsNoStory = (file) =>
  file.startsWith('_plan/') ||
  file.startsWith('docs/') ||
  file.startsWith('.claude/') ||
  /^[^/]+\.md$/.test(file)

const statusOf = (content) => {
  const match = content.match(/^Status:\s*(.+?)\.?\s*$/m)
  return match ? match[1].trim() : null
}

/**
 * @param {object} input
 * @param {string[]} input.files   paths changed against the base branch
 * @param {string} input.branch    the branch under review
 * @param {(path: string) => string | null} input.readFile  file contents, or null when missing
 * @param {(path: string) => string[]} input.listDirs     folder names under a path, [] when missing
 * @returns {{ ok: boolean, notes: string[], failures: string[] }}
 */
export const checkPlan = ({ files, branch, readFile, listDirs }) => {
  const notes = []
  const failures = []

  if (files.length === 0) {
    notes.push('No files changed against the base branch.')
    return { ok: true, notes, failures }
  }

  if (files.every(needsNoStory)) {
    notes.push(
      'Only planning, docs, skill or root Markdown files changed. No story needed.'
    )
    return { ok: true, notes, failures }
  }

  if (branch.startsWith('dependabot/')) {
    notes.push(`\`${branch}\` is a Dependabot branch. No story needed.`)
    return { ok: true, notes, failures }
  }

  const match = branch.match(BRANCH_PATTERN)
  if (!match) {
    failures.push(
      `Code changes need a story branch named \`<handle>/<issue>-<slug>\`. This branch is \`${branch}\`.`
    )
    return { ok: false, notes, failures }
  }

  const number = match[1]
  const folders = listDirs('_plan').filter((name) =>
    name.startsWith(`${number}-`)
  )

  if (folders.length === 0) {
    failures.push(
      `No \`_plan/${number}-<slug>/\` folder for story #${number}. Run \`/intent ${number}\` to start it, then \`/spec\` and \`/plan\`.`
    )
    return { ok: false, notes, failures }
  }

  if (folders.length > 1) {
    failures.push(
      `Story #${number} has ${folders.length} folders in \`_plan/\` (${folders.map((f) => `\`${f}\``).join(', ')}). Keep one.`
    )
    return { ok: false, notes, failures }
  }

  const folder = `_plan/${folders[0]}`
  for (const { file, approver } of ARTIFACTS) {
    const path = `${folder}/${file}`
    const content = readFile(path)
    if (content === null) {
      failures.push(
        `\`${path}\` is missing. Write it with \`/${file.replace('.md', '')}\` on this branch.`
      )
      continue
    }
    const status = statusOf(content)
    if (status === null) {
      failures.push(
        `\`${path}\` has no \`Status:\` line. ${approver} sets \`Status: approved.\` on this branch.`
      )
    } else if (status !== 'approved') {
      failures.push(
        `\`${path}\` is \`${status}\`. ${approver} sets \`Status: approved.\` on this branch.`
      )
    }
  }

  if (failures.length === 0) {
    notes.push(`\`${folder}/\` has an approved intent, spec and plan.`)
  }
  return { ok: failures.length === 0, notes, failures }
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

const main = () => {
  const baseFlag = process.argv.indexOf('--base')
  const base =
    baseFlag !== -1
      ? process.argv[baseFlag + 1]
      : process.env.GITHUB_BASE_REF
        ? `origin/${process.env.GITHUB_BASE_REF}`
        : 'main'

  const files = git('diff', '--name-only', `${base}...HEAD`)
    .split('\n')
    .filter(Boolean)
  const branch = process.env.GITHUB_HEAD_REF || git('branch', '--show-current')

  const result = checkPlan({
    files,
    branch,
    readFile: (path) => (existsSync(path) ? readFileSync(path, 'utf8') : null),
    listDirs: (path) =>
      existsSync(path)
        ? readdirSync(path, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
        : []
  })

  for (const note of result.notes) console.log(`check:plan: ${note}`)
  for (const failure of result.failures) console.error(`check:plan: ${failure}`)
  if (!result.ok) {
    console.error(
      `check:plan: ${result.failures.length} problem${result.failures.length === 1 ? '' : 's'} on \`${branch}\` against \`${base}\`.`
    )
    process.exitCode = 1
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === join(process.argv[1])
) {
  main()
}
