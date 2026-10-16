'use server'

import { db } from '@/lib/db'
import { formatShiftStart } from '@/lib/format'
import { FULL_MESSAGE, getShift, spotsFilled } from '@/lib/shifts'
import { parseSignup, type SignupErrors } from '@/lib/validation'

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

// Validates the form, checks the shift still has room, and records the
// sign-up. Returns the state the form renders next.
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

  await db.signup.create({
    data: {
      shiftId: shift.id,
      name: parsed.data.name,
      email: parsed.data.email
    }
  })

  return {
    status: 'signed-up',
    message: `You're signed up for ${shift.title} on ${formatShiftStart(shift.startsAt)}`
  }
}
