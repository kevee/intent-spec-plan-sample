// Runs in every test file before anything is imported, so the Prisma client
// opens the test database and never the development one.
process.env.DATABASE_URL = 'file:./prisma/test.db'
