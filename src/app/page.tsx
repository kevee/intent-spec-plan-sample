import Link from 'next/link'

import { formatShiftTime } from '@/lib/format'
import { isFull, listUpcomingShifts } from '@/lib/shifts'

// The list changes whenever someone signs up, so render it on every request.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const shifts = await listUpcomingShifts()

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Upcoming shifts</h1>
      {shifts.length === 0 ? (
        <p>No upcoming shifts. Check back soon.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {shifts.map((shift) => (
            <li key={shift.id} className="rounded border border-zinc-300 p-4">
              <h2 className="text-xl font-semibold">
                <Link
                  href={`/shifts/${shift.id}`}
                  className="inline-block py-1 text-blue-800 underline outline-offset-2 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  {shift.title}
                </Link>
              </h2>
              <p>{formatShiftTime(shift.startsAt, shift.endsAt)}</p>
              <p>{shift.location}</p>
              <p>
                {shift.spotsFilled} of {shift.capacity} spots filled
                {isFull(shift) ? (
                  <>
                    {' '}
                    <strong>Full</strong>
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
