import { resolveCalendarEventTimeZone } from 'src/modules/calendar/calendar-event-creation-manager/utils/resolve-calendar-event-time-zone.util';

describe('resolveCalendarEventTimeZone', () => {
  it('defaults to UTC when no time zone is provided', () => {
    expect(resolveCalendarEventTimeZone(undefined)).toBe('UTC');
  });

  it('defaults to UTC when the time zone is an empty string', () => {
    expect(resolveCalendarEventTimeZone('')).toBe('UTC');
  });

  it('keeps a provided time zone', () => {
    expect(resolveCalendarEventTimeZone('Europe/Paris')).toBe('Europe/Paris');
  });
});
