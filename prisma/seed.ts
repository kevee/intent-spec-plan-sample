import { db } from '../src/lib/db'
import { TIME_ZONE } from '../src/lib/format'

// Shift dates are relative to today, so the demo never goes stale.

// Wall-clock parts of a date in TIME_ZONE.
const partsIn = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23'
  }).formatToParts(date)
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second')
  }
}

// The instant that is `hour:minute` in TIME_ZONE, `daysOut` days from today.
const at = (daysOut: number, hour: number, minute = 0) => {
  const today = partsIn(new Date())
  const wallClock = Date.UTC(
    today.year,
    today.month - 1,
    today.day + daysOut,
    hour,
    minute
  )
  // Find the zone's offset at roughly that moment and correct for it. A
  // second pass handles a daylight-saving change on the day itself.
  let guess = new Date(wallClock)
  for (let i = 0; i < 2; i++) {
    const p = partsIn(guess)
    const seen = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      p.hour,
      p.minute,
      p.second
    )
    guess = new Date(guess.getTime() + (wallClock - seen))
  }
  return guess
}

const minutesAgo = (base: Date, minutes: number) =>
  new Date(base.getTime() - minutes * 60_000)

const main = async () => {
  await db.signup.deleteMany()
  await db.shift.deleteMany()

  const now = new Date()
  const lastWeek = minutesAgo(now, 7 * 24 * 60)

  const riverside = await db.shift.create({
    data: {
      title: 'Riverside park clean-up',
      location: 'Riverside Park',
      startsAt: at(3, 9),
      endsAt: at(3, 12),
      capacity: 10
    }
  })

  // Eight rows from six people. Jordan Lee signed up twice four minutes
  // apart, and Sam Okafor signed up twice with different capitals a day
  // apart. Both pairs count as two spots today.
  await db.signup.createMany({
    data: [
      {
        name: 'Alex Chen',
        email: 'alex.chen@example.org',
        createdAt: lastWeek
      },
      {
        name: 'Jordan Lee',
        email: 'jordan.lee@example.org',
        createdAt: minutesAgo(now, 6 * 24 * 60 + 30)
      },
      {
        name: 'Jordan Lee',
        email: 'jordan.lee@example.org',
        createdAt: minutesAgo(now, 6 * 24 * 60 + 26)
      },
      {
        name: 'Sam Okafor',
        email: 'Sam.Okafor@example.org',
        createdAt: minutesAgo(now, 5 * 24 * 60)
      },
      {
        name: 'Maria Gomez',
        email: 'maria.gomez@example.org',
        createdAt: minutesAgo(now, 4 * 24 * 60 + 120)
      },
      {
        name: 'Sam Okafor',
        email: 'sam.okafor@example.org',
        createdAt: minutesAgo(now, 4 * 24 * 60)
      },
      {
        name: 'Tasha Williams',
        email: 'tasha.williams@example.org',
        createdAt: minutesAgo(now, 2 * 24 * 60)
      },
      {
        name: 'Omar Haddad',
        email: 'omar.haddad@example.org',
        createdAt: minutesAgo(now, 24 * 60)
      }
    ].map((signup) => ({ ...signup, shiftId: riverside.id }))
  })

  const foodBank = await db.shift.create({
    data: {
      title: 'Food bank sorting',
      location: 'Fairview Food Bank',
      startsAt: at(5, 13),
      endsAt: at(5, 16),
      capacity: 4
    }
  })

  await db.signup.createMany({
    data: [
      { name: 'Lee Park', email: 'lee.park@example.org' },
      { name: 'Nina Patel', email: 'nina.patel@example.org' },
      { name: 'Chris Johnson', email: 'chris.johnson@example.org' },
      { name: 'Fatima Ali', email: 'fatima.ali@example.org' }
    ].map((signup, i) => ({
      ...signup,
      shiftId: foodBank.id,
      createdAt: minutesAgo(now, (8 - i) * 24 * 60)
    }))
  })

  const library = await db.shift.create({
    data: {
      title: 'Library book sale setup',
      location: 'Main Library',
      startsAt: at(9, 10),
      endsAt: at(9, 14),
      capacity: 6
    }
  })

  await db.signup.createMany({
    data: [
      { name: 'Ben Carter', email: 'ben.carter@example.org' },
      { name: 'Lucy Nguyen', email: 'lucy.nguyen@example.org' }
    ].map((signup, i) => ({
      ...signup,
      shiftId: library.id,
      createdAt: minutesAgo(now, (3 - i) * 24 * 60)
    }))
  })

  const seniorCenter = await db.shift.create({
    data: {
      title: 'Senior center lunch service',
      location: 'Oak Street Senior Center',
      startsAt: at(12, 11),
      endsAt: at(12, 13, 30),
      capacity: 5
    }
  })

  await db.signup.create({
    data: {
      shiftId: seniorCenter.id,
      name: 'Grace Kim',
      email: 'grace.kim@example.org',
      createdAt: minutesAgo(now, 2 * 24 * 60)
    }
  })

  await db.shift.create({
    data: {
      title: 'Tree planting',
      location: 'Hillcrest Trail',
      startsAt: at(20, 8),
      endsAt: at(20, 11),
      capacity: 12
    }
  })

  const shifts = await db.shift.count()
  const signups = await db.signup.count()
  console.log(`Seeded ${shifts} shifts and ${signups} sign-ups.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
