import { extractICalData } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-ical-data.util';

const VCALENDAR_PAYLOAD = 'BEGIN:VCALENDAR\r\nEND:VCALENDAR';

describe('extractICalData', () => {
  it('returns the string as-is when it already contains VCALENDAR', () => {
    expect(extractICalData(VCALENDAR_PAYLOAD)).toBe(VCALENDAR_PAYLOAD);
  });

  it('unwraps nested CDATA-style wrappers', () => {
    expect(extractICalData({ _cdata: VCALENDAR_PAYLOAD })).toBe(
      VCALENDAR_PAYLOAD,
    );
  });

  it('recurses through arbitrarily nested objects', () => {
    expect(
      extractICalData({
        outer: { inner: { deeper: VCALENDAR_PAYLOAD } },
      }),
    ).toBe(VCALENDAR_PAYLOAD);
  });

  it('returns null when no VCALENDAR block is found', () => {
    expect(extractICalData('not a calendar')).toBeNull();
    expect(extractICalData({ random: 'payload' })).toBeNull();
  });

  it.each([null, undefined, ''])('returns null for empty input %s', (value) => {
    expect(
      extractICalData(value as unknown as string | Record<string, unknown>),
    ).toBeNull();
  });
});
