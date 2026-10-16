import { db } from '@/lib/db'
import {
  createShift,
  createSignup,
  emptyDatabase,
  formData
} from '@/lib/test-db'

import { signUp, type SignUpState } from './actions'

const idle: SignUpState = { status: 'idle' }

describe('signUp', () => {
  beforeEach(emptyDatabase)

  it('records the sign-up and confirms it with the shift time', async () => {
    const shift = await createShift({
      title: 'Riverside park clean-up',
      startsAt: new Date('2026-10-17T14:00:00Z'),
      endsAt: new Date('2026-10-17T17:00:00Z')
    })

    const state = await signUp(
      shift.id,
      idle,
      formData({ name: 'Alex Chen', email: 'alex.chen@example.org' })
    )

    expect(state).toEqual({
      status: 'signed-up',
      message:
        "You're signed up for Riverside park clean-up on Saturday, October 17 at 9:00 a.m."
    })
    expect(
      await db.signup.findMany({ where: { shiftId: shift.id } })
    ).toMatchObject([{ name: 'Alex Chen', email: 'alex.chen@example.org' }])
  })

  it('returns field errors and the typed values when the form is invalid', async () => {
    const shift = await createShift()

    const state = await signUp(
      shift.id,
      idle,
      formData({ name: '', email: 'alex' })
    )

    expect(state).toEqual({
      status: 'invalid',
      errors: {
        name: 'Enter your name.',
        email: 'Enter an email address like name@example.org.'
      },
      values: { name: '', email: 'alex' }
    })
    expect(await db.signup.count()).toBe(0)
  })

  it('refuses a full shift without storing anything', async () => {
    const shift = await createShift({ capacity: 1 })
    await createSignup(shift.id)

    const state = await signUp(
      shift.id,
      idle,
      formData({ name: 'Sam Okafor', email: 'sam.okafor@example.org' })
    )

    expect(state).toEqual({ status: 'full', message: 'This shift is full.' })
    expect(await db.signup.count()).toBe(1)
  })

  it('reports a shift that no longer exists', async () => {
    const state = await signUp(
      'nope',
      idle,
      formData({ name: 'Alex Chen', email: 'alex.chen@example.org' })
    )
    expect(state).toEqual({
      status: 'error',
      message: 'This shift no longer exists.'
    })
  })

  it('stores a second sign-up from the same person as a second spot', async () => {
    const shift = await createShift({ capacity: 10 })
    const form = formData({ name: 'Alex Chen', email: 'alex.chen@example.org' })

    await signUp(shift.id, idle, form)
    await signUp(shift.id, idle, form)

    expect(await db.signup.count({ where: { shiftId: shift.id } })).toBe(2)
  })
})
