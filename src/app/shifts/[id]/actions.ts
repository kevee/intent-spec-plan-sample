'use server'

import { db } from '@/lib/db'
import { formatShiftStart } from '@/lib/format'
import { FULL_MESSAGE, getShift, spotsFilled } from '@/lib/shifts'
import { parseSignup, type SignupErrors } from '@/lib/validation'
import { Prisma } from '@/generated/prisma/client'

export type SignUpState =
  | { status: 'idle' }
  | {
      status: 'invalid'
      errors: SignupErrors
      values: { name: string; email: string }
    }
  | { status: 'full'; message: string }
  | { status: 'signed-up'; message: string }
  | { status: 'error'; message: string }

const stringValue = (formData: FormData, field: string) => {
  const value = formData.get(field)
  return typeof value === 'string' ? value : ''
}

// The unique index on Signup (shiftId, email) rejected the insert: this person
// already holds a spot. Anything else is a real error and must stay one.
const isAlreadySignedUp = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002'

// Validates the form, checks the shift still has room, and records the
// sign-up. Returns the state the form renders next.
//
// The order of the checks is deliberate. Full comes first, for everyone, so a
// full shift shows the same message whether or not you hold a spot. Then an
// existing sign-up gets the same confirmation a first sign-up gets, and the
// stored name is left alone. Nothing on any path says "you're already on the
// list", because that would tell anyone typing an address whether it's there.
export const signUp = async (
  shiftId: string,
  _previous: SignUpState,
  formData: FormData
): Promise<SignUpState> => {
  const shift = await getShift(shiftId)
  if (!shift) {
    return { status: 'error', message: 'This shift no longer exists.' }
  }

  const parsed = parseSignup(formData)
  if (!parsed.ok) {
    return {
      status: 'invalid',
      errors: parsed.errors,
      values: {
        name: stringValue(formData, 'name'),
        email: stringValue(formData, 'email')
      }
    }
  }

  if ((await spotsFilled(shift.id)) >= shift.capacity) {
    return { status: 'full', message: FULL_MESSAGE }
  }

  const confirmation: SignUpState = {
    status: 'signed-up',
    message: `You're signed up for ${shift.title} on ${formatShiftStart(shift.startsAt)}`
  }

  const existing = await db.signup.findUnique({
    where: { shiftId_email: { shiftId: shift.id, email: parsed.data.email } }
  })
  if (existing) return confirmation

  try {
    await db.signup.create({
      data: {
        shiftId: shift.id,
        name: parsed.data.name,
        email: parsed.data.email
      }
    })
  } catch (error) {
    // Two submissions from the same person can both pass the lookup above and
    // race to the insert. The database lets one through; the other lands here.
    if (!isAlreadySignedUp(error)) throw error
  }

  return confirmation
}
