import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

import { PrismaClient } from '@/generated/prisma/client'

// Relative file URLs resolve from the repo root, so this points at
// prisma/dev.db. Jest and Playwright set DATABASE_URL to their own files.
export const DATABASE_URL = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'

const createClient = () =>
  new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: DATABASE_URL }) })

// Next.js reloads modules in development, so keep one client on globalThis
// rather than opening a new SQLite connection on every change.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
