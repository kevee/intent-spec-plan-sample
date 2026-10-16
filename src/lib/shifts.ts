import { db } from '@/lib/db'

export type ShiftSummary = {
  id: string
  title: string
  location: string
  startsAt: Date
  endsAt: Date
  capacity: number
  spotsFilled: number
}

const withCount = { _count: { select: { signups: true } } } as const

type ShiftRow = {
  id: string
  title: string
  location: string
  startsAt: Date
  endsAt: Date
  capacity: number
  _count: { signups: number }
}

const toSummary = ({ _count, ...shift }: ShiftRow): ShiftSummary => ({
  ...shift,
  spotsFilled: _count.signups
})

// Shifts that haven't ended yet, soonest first.
export const listUpcomingShifts = async (
  now: Date = new Date()
): Promise<ShiftSummary[]> => {
  const shifts = await db.shift.findMany({
    where: { endsAt: { gt: now } },
    orderBy: { startsAt: 'asc' },
    include: withCount
  })
  return shifts.map(toSummary)
}

export const getShift = async (id: string): Promise<ShiftSummary | null> => {
  const shift = await db.shift.findUnique({ where: { id }, include: withCount })
  return shift ? toSummary(shift) : null
}

// One row per person: the unique index on (shiftId, email) means a row is a
// person, so counting rows counts people. The capacity check in the sign-up
// action uses this.
export const spotsFilled = (shiftId: string) =>
  db.signup.count({ where: { shiftId } })

export const isFull = (shift: { capacity: number; spotsFilled: number }) =>
  shift.spotsFilled >= shift.capacity

// Shown in place of the form, and returned by the sign-up action when the
// shift fills while someone has the form open. Everyone sees the same words,
// whether or not they already hold a spot, so the page never reveals who is
// on the list.
export const FULL_MESSAGE =
  'This shift is full. If you signed up earlier, your spot is still yours.'
