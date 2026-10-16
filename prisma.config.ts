import { defineConfig } from 'prisma/config'

// One SQLite file per job: prisma/dev.db for development, prisma/test.db for
// Jest and prisma/e2e.db for Playwright. The scripts set DATABASE_URL; the
// default covers `pnpm dev`.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts'
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  }
})
