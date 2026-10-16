import { execSync } from 'node:child_process'

const TEST_DATABASE_URL = 'file:./prisma/test.db'

// Rebuild the test database from the migrations once per run. The suites
// create their own rows, so the seed is skipped.
const globalSetup = () => {
  process.env.DATABASE_URL = TEST_DATABASE_URL
  execSync('node scripts/reset-db.mjs --skip-seed', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL }
  })
}

export default globalSetup
