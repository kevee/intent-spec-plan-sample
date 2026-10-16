import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { StatusMessage } from '@/components/status-message'
import { formatShiftTime } from '@/lib/format'
import { FULL_MESSAGE, getShift, isFull } from '@/lib/shifts'

import { signUp } from './actions'
import { SignUpForm } from './sign-up-form'

type ShiftPageProps = {
  params: Promise<{ id: string }>
}

// Spots fill as people sign up, so render on every request.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params
}: ShiftPageProps): Promise<Metadata> {
  const { id } = await params
  const shift = await getShift(id)
  return { title: shift ? shift.title : 'Shift not found' }
}

export default async function ShiftPage({ params }: ShiftPageProps) {
  const { id } = await params
  const shift = await getShift(id)
  if (!shift) notFound()

  const signUpForShift = signUp.bind(null, shift.id)

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">{shift.title}</h1>
      <dl className="mb-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="font-medium">When</dt>
        <dd>{formatShiftTime(shift.startsAt, shift.endsAt)}</dd>
        <dt className="font-medium">Where</dt>
        <dd>{shift.location}</dd>
        <dt className="font-medium">Spots</dt>
        <dd>
          {shift.spotsFilled} of {shift.capacity} spots filled
        </dd>
      </dl>
      {isFull(shift) ? (
        <StatusMessage>{FULL_MESSAGE}</StatusMessage>
      ) : (
        <SignUpForm action={signUpForShift} />
      )}
    </>
  )
}
