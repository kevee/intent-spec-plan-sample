import { db } from '@/lib/db'

// Empties the test database between tests. Deleting shifts cascades to
// their sign-ups, but the explicit order keeps it obvious.
export const emptyDatabase = async () => {
  await db.signup.deleteMany()
  await db.shift.deleteMany()
}

const hour = 60 * 60 * 1000

type ShiftOverrides = {
  title?: string
  location?: string
  startsAt?: Date
  endsAt?: Date
  capacity?: number
}

export const createShift = (overrides: ShiftOverrides = {}) => {
  const startsAt = overrides.startsAt ?? new Date(Date.now() + 24 * hour)
  return db.shift.create({
    data: {
      title: 'Test shift',
      location: 'Test Hall',
      startsAt,
      endsAt: overrides.endsAt ?? new Date(startsAt.getTime() + 3 * hour),
      capacity: 2,
      ...overrides
    }
  })
}

export const createSignup = (
  shiftId: string,
  name = 'Alex Chen',
  email = 'alex.chen@example.org'
) => db.signup.create({ data: { shiftId, name, email } })

export const formData = (fields: Record<string, string>) => {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}
