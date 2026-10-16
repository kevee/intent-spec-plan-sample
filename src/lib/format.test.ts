import { formatShiftStart, formatShiftTime, TIME_ZONE } from '@/lib/format'

describe('format', () => {
  it('renders in a fixed time zone', () => {
    expect(TIME_ZONE).toBe('America/Chicago')
  })

  it('formats a shift as a date and a time range', () => {
    // 14:00 UTC is 9:00 a.m. in Chicago during daylight time.
    expect(
      formatShiftTime(
        new Date('2026-10-17T14:00:00Z'),
        new Date('2026-10-17T17:00:00Z')
      )
    ).toBe('Saturday, October 17, 9:00 a.m. to 12:00 p.m.')
  })

  it('formats a shift start for the confirmation', () => {
    expect(formatShiftStart(new Date('2026-10-17T14:00:00Z'))).toBe(
      'Saturday, October 17 at 9:00 a.m.'
    )
  })

  it('follows the zone through a daylight-saving change', () => {
    // 15:00 UTC is 9:00 a.m. in Chicago once standard time is back.
    expect(formatShiftStart(new Date('2026-11-14T15:00:00Z'))).toBe(
      'Saturday, November 14 at 9:00 a.m.'
    )
  })
})
