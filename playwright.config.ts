import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const DATABASE_URL = 'file:./prisma/e2e.db'

export default defineConfig({
  testDir: './e2e',
  // The tests share one seeded database, so they run one at a time, in order.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // A fresh, seeded database, then the production build.
    command: `pnpm db:reset && pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    env: { DATABASE_URL },
    reuseExistingServer: false,
    timeout: 240_000
  }
})
