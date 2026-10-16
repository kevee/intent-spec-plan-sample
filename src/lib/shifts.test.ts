import { getShift, isFull, listUpcomingShifts, spotsFilled } from '@/lib/shifts'
import { createShift, createSignup, emptyDatabase } from '@/lib/test-db'

const hour = 60 * 60 * 1000

describe('shifts', () => {
  beforeEach(emptyDatabase)

  it('lists shifts that have not ended yet, soonest first', async () => {
    const now = new Date()
    await createShift({
      title: 'Yesterday',
      startsAt: new Date(now.getTime() - 30 * hour),
      endsAt: new Date(now.getTime() - 27 * hour)
    })
    await createShift({
      title: 'Next week',
      startsAt: new Date(now.getTime() + 7 * 24 * hour)
    })
    await createShift({
      title: 'Tomorrow',
      startsAt: new Date(now.getTime() + 24 * hour)
    })

    const shifts = await listUpcomingShifts(now)
    expect(shifts.map((shift) => shift.title)).toEqual([
      'Tomorrow',
      'Next week'
    ])
  })

  it('counts each person once', async () => {
    const shift = await createShift({ capacity: 10 })
    await createSignup(shift.id, 'Alex Chen', 'alex.chen@example.org')
    await createSignup(shift.id, 'Sam Okafor', 'sam.okafor@example.org')

    expect(await spotsFilled(shift.id)).toBe(2)
    const [listed] = await listUpcomingShifts()
    expect(listed.spotsFilled).toBe(2)
    expect((await getShift(shift.id))?.spotsFilled).toBe(2)
  })

  it('rejects a second row for the same person on the same shift', async () => {
    const shift = await createShift({ capacity: 10 })
    await createSignup(shift.id, 'Alex Chen', 'alex.chen@example.org')

    await expect(
      createSignup(shift.id, 'Alex Chen', 'alex.chen@example.org')
    ).rejects.toMatchObject({ code: 'P2002' })
    expect(await spotsFilled(shift.id)).toBe(1)
  })

  it('lets the same person sign up for another shift', async () => {
    const first = await createShift()
    const second = await createShift()
    await createSignup(first.id)
    await createSignup(second.id)

    expect(await spotsFilled(first.id)).toBe(1)
    expect(await spotsFilled(second.id)).toBe(1)
  })

  it('returns null for an unknown shift', async () => {
    expect(await getShift('nope')).toBeNull()
  })

  it('knows when a shift is full', async () => {
    const shift = await createShift({ capacity: 1 })
    expect(isFull((await getShift(shift.id))!)).toBe(false)
    await createSignup(shift.id)
    expect(isFull((await getShift(shift.id))!)).toBe(true)
  })
})
