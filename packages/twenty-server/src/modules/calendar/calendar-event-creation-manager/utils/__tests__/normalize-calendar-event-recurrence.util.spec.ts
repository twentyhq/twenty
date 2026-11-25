import { normalizeCalendarEventRecurrence } from 'src/modules/calendar/calendar-event-creation-manager/utils/normalize-calendar-event-recurrence.util';

describe('normalizeCalendarEventRecurrence', () => {
  it('repeats a weekly series on its start day in the event time zone plus the requested days', () => {
    expect(
      normalizeCalendarEventRecurrence({
        recurrence: { frequency: 'WEEKLY', daysOfWeek: ['FRIDAY'] },
        startsAt: '2026-10-20T23:00:00Z',
        isFullDay: false,
        timeZone: 'Asia/Tokyo',
      }),
    ).toEqual({
      frequency: 'WEEKLY',
      interval: 1,
      daysOfWeek: ['WEDNESDAY', 'FRIDAY'],
      firstOccurrenceDate: '2026-10-21',
      endDate: undefined,
      endOccurrenceCount: undefined,
    });
  });

  it('rejects an end date before the first occurrence', () => {
    expect(
      normalizeCalendarEventRecurrence({
        recurrence: { frequency: 'DAILY', endDate: '2026-10-20' },
        startsAt: '2026-10-20T23:00:00Z',
        isFullDay: false,
        timeZone: 'Asia/Tokyo',
      }),
    ).toHaveProperty('error');
  });
});
