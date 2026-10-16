-- One sign-up per person per shift (story #1).
--
-- This migration changes and deletes rows, so back up the database file
-- before deploying it. See "Migrations that delete rows" in docs/database.md.
--
-- The order matters: normalize first, so that two addresses that differ only
-- in capitals or surrounding spaces become exact duplicates; then remove the
-- duplicates, keeping the earliest row for each person on each shift; then
-- add the index, which SQLite refuses to create while duplicates exist.

-- Normalize every stored address.
UPDATE "Signup" SET "email" = lower(trim("email"));

-- Keep the earliest sign-up per (shiftId, email). Ties on createdAt break on
-- id so the result is deterministic.
DELETE FROM "Signup" WHERE "id" IN (
    SELECT "id" FROM (
        SELECT "id",
               ROW_NUMBER() OVER (
                   PARTITION BY "shiftId", "email"
                   ORDER BY "createdAt", "id"
               ) AS "rowNumber"
        FROM "Signup"
    )
    WHERE "rowNumber" > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "Signup_shiftId_email_key" ON "Signup"("shiftId", "email");
