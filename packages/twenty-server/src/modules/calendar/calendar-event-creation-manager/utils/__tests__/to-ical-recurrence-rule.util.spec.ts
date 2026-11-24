import { type CalendarEventRecurrence } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence.type';
import { toICalRecurrenceRule } from 'src/modules/calendar/calendar-event-creation-manager/utils/to-ical-recurrence-rule.util';

const dailyRecurrenceUntilEndOfYear: CalendarEventRecurrence = {
  frequency: 'DAILY',
  interval: 1,
  daysOfWeek: [],
  firstOccurrenceDate: '2026-10-20',
  endDate: '2026-12-31',
};

describe('toICalRecurrenceRule', () => {
  it('ends a timed series at the last second of the end date in the event time zone, in UTC', () => {
    expect(
      toICalRecurrenceRule({
        recurrence: dailyRecurrenceUntilEndOfYear,
        isFullDay: false,
        timeZone: 'Europe/Paris',
      }),
    ).toBe('RRULE:FREQ=DAILY;INTERVAL=1;UNTIL=20261231T225959Z');
  });

  it('ends an all-day series on a date', () => {
    expect(
      toICalRecurrenceRule({
        recurrence: dailyRecurrenceUntilEndOfYear,
        isFullDay: true,
        timeZone: 'Europe/Paris',
      }),
    ).toBe('RRULE:FREQ=DAILY;INTERVAL=1;UNTIL=20261231');
  });
});
