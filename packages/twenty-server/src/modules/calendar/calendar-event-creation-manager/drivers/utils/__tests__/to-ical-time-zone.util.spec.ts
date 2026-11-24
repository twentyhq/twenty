import { toICalTimeZone } from 'src/modules/calendar/calendar-event-creation-manager/drivers/utils/to-ical-time-zone.util';

describe('toICalTimeZone', () => {
  it('names a time zone alias after the VTIMEZONE block it gets', () => {
    const { timeZoneId, vTimezoneBlock } = toICalTimeZone('Asia/Calcutta');

    expect(timeZoneId).toBe('Asia/Kolkata');
    expect(vTimezoneBlock).toContain('TZID:Asia/Kolkata\r\n');
  });
});
