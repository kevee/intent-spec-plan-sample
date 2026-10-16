# Spec: duplicate sign-ups
Story: #1
Intent: intent.md (approved 2026-10-16)
Design: none.
Author: Claude, reviewed by Dana Reyes (volunteer coordinator).
Status: approved.

## Summary
A person can hold only one spot on a shift. Signing up again for a shift you're already on shows the same confirmation as the first time and changes nothing. The duplicates already in the list are merged when this ships, so spot counts match real people.

## Requirements
1. A person must hold at most one sign-up per shift.
2. Two email addresses must count as the same person when they match after trimming surrounding spaces and ignoring letter case.
3. Submitting the form for a shift the person is already on must show exactly the confirmation a first sign-up shows, and must not store a second sign-up.
4. A resubmission must not change the stored name, even if the person typed it differently.
5. The page must never reveal whether an email address is already signed up for a shift, on any path, including when the shift is full.
6. When a shift is full, everyone who submits the form must see the same message, "This shift is full. If you signed up earlier, your spot is still yours.", whether or not they already hold a spot.
7. Two submissions from the same person that arrive at the same moment must leave one sign-up.
8. Spot counts on the shift list and the shift page must count each person once.
9. When this ships, existing duplicates must be merged: for each person on each shift, the earliest sign-up is kept with its name, and the later ones are removed.
10. Email addresses must be stored in normalized form (trimmed, lowercase) from now on, including the ones already in the list.

## Behaviour
**Signing up.** A volunteer opens a shift, types a name and an email address, and selects **Sign up**. "You're signed up for Riverside park clean-up on Saturday, October 17 at 9:00 a.m." replaces the form, and screen readers announce it.

**Signing up again.** When the same volunteer comes back and submits the form with the same email, in any mix of capitals, they see the identical confirmation. Nothing on the page tells them, or anyone else typing their address, that they were already on the list. Their spot and the name they first gave stay as they were.

**A full shift.** The shift page shows "This shift is full. If you signed up earlier, your spot is still yours." in place of the form. When the shift fills while someone has the form open, submitting it shows that same message to everyone, including people who already hold a spot.

**The shift list.** Once its duplicates are merged, the Riverside clean-up reads "6 of 10 spots filled". Nothing else about the list changes.

**Validation.** Errors for a missing name or a malformed email work as they do today.

## Fit with the codebase
- **Normalization ---** `parseSignup` in `src/lib/validation.ts` validates the email exactly as typed today and returns it untouched. It changes to trim the address, validate it, then lowercase it, so every write path gets the normalized value. `validation.test.ts` covers case and whitespace.
- **The database is the guarantee ---** a unique index on `Signup (shiftId, email)` is what makes requirement 7 hold. The `signUp` action in `src/app/shifts/[id]/actions.ts` treats Prisma's unique-constraint error (`P2002`) on that index as "already signed up". The error class comes from the generated client in `src/generated/prisma/` (imported from `@/generated/prisma/client`). Any other database error still surfaces as an error.
- **Order of checks ---** full first, for everyone (requirement 6), then an existing sign-up, then the insert. Checking "already signed up" before "full" would let anyone test an address against a full shift.
- **Messages ---** the existing `StatusMessage` (`role="status"`) carries both the confirmation and the full message, so there's no new pattern. The confirmation sentence already comes from `formatShiftStart` in `src/lib/format.ts`. The full message is the `FULL_MESSAGE` constant in `src/lib/shifts.ts`, read by the shift page and the action, so the new wording changes in one place.
- **Counts ---** `spotsFilled` in `src/lib/shifts.ts` counts rows. Once duplicates can't exist it's correct as it is.
- **Seed ---** `prisma/seed.ts` inserts duplicates today. Once the index exists it can't, so it changes to insert the six real people, and `pnpm db:reset` (`scripts/reset-db.mjs`: delete the file, `prisma migrate deploy`, `prisma db seed`) then shows "6 of 10".
- **Tests ---** `actions.test.ts` gains resubmission, case, concurrency and full-shift cases. `e2e/sign-up.spec.ts` gains a resubmission that compares page text and runs axe. Tests find controls by role and label, per `CLAUDE.md`.
- **Rules ---** `docs/database.md` governs the migration: hand-edited SQL above Prisma's statements, and the seed updated in the same commit. It has nothing yet on migrations that delete rows, which is the open Operations concern below.

## Data
`Signup.email` holds the normalized address, and a new unique index covers `Signup (shiftId, email)`. One migration does three things in order: trims and lowercases every stored email, deletes all but the earliest sign-up for each `(shiftId, email)`, then creates the index. The index can't be created while duplicates exist, so the order matters. No new tables or columns.

## Out of scope
- Accounts, logins, or any way to look up "my shifts".
- Cancelling a sign-up.
- Spotting the same person behind two different email addresses.
- Stopping someone from signing up for two shifts that overlap in time.
- Two different people taking the last spot at the same moment. That race exists today and this story doesn't change it.

## Concerns
| Concern | Area | Decided by | Resolution |
| --- | --- | --- | --- |
| New unique index on `Signup (shiftId, email)`, created by a migration that normalizes emails and removes duplicates first | Database schema | Eng lead | Approved: one migration, normalize then dedupe then index (Priya Nair, eng lead). |
| Merging keeps the earliest row, so a name corrected on a later row is lost | Database schema | Product owner | Accepted: every duplicate checked by hand carried the same name (Marcus Bell, program lead). |
| "You're already signed up" would confirm to anyone that an email is on a shift's list | Security / privacy | Product owner | Resolved: identical confirmation either way, and an identical full-shift message for everyone (Marcus Bell, program lead). |
| Confirmation and full-shift messages on resubmission | Accessibility | Product owner | Dismissed: reuses `StatusMessage`, no new pattern, and no row in `docs/accessibility-conformance.md` changes. |
| New monthly cost | Infrastructure cost | Program lead | Dismissed: no new service, instance or storage. |
| The migration deletes rows and has no undo | Operations | Eng lead | Resolved: back up the database file before running the migration, and add a "Migrations that delete rows" section to `docs/database.md` saying so (Priya Nair, eng lead). |

## Acceptance criteria
- Submitting the form twice with the same email, the second time in different capitals with a trailing space, leaves one sign-up and shows identical page text both times.
- A resubmission with a different name leaves the first name in place.
- Two concurrent `signUp` calls for the same person and shift leave one sign-up.
- On a full shift, a person who holds a spot and a person who doesn't see identical page text.
- A database seeded from `main` before this change reads "6 of 10 spots filled" for Riverside after the migration, and every stored email is lowercase.
- `pnpm db:reset` on the story branch succeeds and shows "6 of 10".
- axe reports zero violations on the shift page after a resubmission and on the full message.

## Open questions
- Do "Sam.Okafor@example.org" and "sam.okafor@example.org" count as the same person? **Answered:** yes, matched ignoring case and surrounding spaces (Dana Reyes).
- What happens to the duplicates already in the list? **Answered:** merged when this ships, earliest kept (Marcus Bell).
- Should we catch the same person behind two different email addresses? **Carried forward:** out of scope here. Revisit if coordinators are still cleaning lists by hand.
