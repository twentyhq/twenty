import ical from 'ical-generator';

import { toCalendarEventTemporalDateTime } from 'src/modules/calendar/calendar-event-creation-manager/utils/to-calendar-event-temporal-date-time.util';

describe('toCalendarEventTemporalDateTime', () => {
  it('lets ical-generator render a timed start as wall-clock time in the event time zone', () => {
    const calendar = ical();

    calendar.createEvent({
      start: toCalendarEventTemporalDateTime({
        isoDateTime: '2026-10-20T08:00:00Z',
        isFullDay: false,
        timeZone: 'Europe/Paris',
      }),
      timezone: 'Europe/Paris',
    });

    expect(calendar.toString()).toContain(
      'DTSTART;TZID=Europe/Paris:20261020T100000',
    );
  });
});
