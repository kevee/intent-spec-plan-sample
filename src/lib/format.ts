// Every date in the app renders in this zone, whatever machine renders it,
// so the pages and the tests agree on what "9:00 a.m." means.
export const TIME_ZONE = 'America/Chicago'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  month: 'long',
  day: 'numeric'
})

const timeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit'
})

// "9:00 AM" reads better, and is read aloud better, as "9:00 a.m."
const formatTime = (date: Date) =>
  timeFormat
    .format(date)
    .replace(/ |\s/g, ' ')
    .replace('AM', 'a.m.')
    .replace('PM', 'p.m.')

export const formatShiftDate = (date: Date) => dateFormat.format(date)

// "Saturday, October 17, 9:00 a.m. to 12:00 p.m." for the shift list.
export const formatShiftTime = (startsAt: Date, endsAt: Date) =>
  `${formatShiftDate(startsAt)}, ${formatTime(startsAt)} to ${formatTime(endsAt)}`

// "Saturday, October 17 at 9:00 a.m." for the sign-up confirmation.
export const formatShiftStart = (startsAt: Date) =>
  `${formatShiftDate(startsAt)} at ${formatTime(startsAt)}`
