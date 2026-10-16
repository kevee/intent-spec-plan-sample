// Rebuilds the SQLite database that DATABASE_URL names: deletes the file,
// applies every migration, then seeds it. `pnpm db:reset` runs this.
//
// Why not `prisma migrate reset`? In Prisma 7 it no longer seeds, and it
// refuses to run from an AI coding agent's session without a consent
// variable. This repo expects Claude Code to reset the database, so the
// reset is a plain script that does the same three steps.
import { execSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'

const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'

if (!url.startsWith('file:')) {
  console.error(`DATABASE_URL must be a file: URL for a reset. Got ${url}`)
  process.exit(1)
}

const file = path.resolve(url.slice('file:'.length))
for (const suffix of ['', '-journal', '-wal', '-shm']) {
  rmSync(file + suffix, { force: true })
}

const run = (command) =>
  execSync(command, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url }
  })

run('pnpm exec prisma migrate deploy')
if (!process.argv.includes('--skip-seed')) {
  run('pnpm exec prisma db seed')
}
