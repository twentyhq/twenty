import { type DAVCalendar } from 'tsdav';

import { isEventCalendar } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-event-calendar.util';

const calendar = (
  components?: DAVCalendar['components'],
): Pick<DAVCalendar, 'components'> => ({ components });

describe('isEventCalendar', () => {
  it('accepts a calendar declaring VEVENT', () => {
    expect(isEventCalendar(calendar(['VEVENT', 'VTODO']))).toBe(true);
  });

  it('accepts a calendar that does not publish supported-calendar-component-set, which RFC 4791 defines as accepting every component type', () => {
    expect(isEventCalendar(calendar(undefined))).toBe(true);
  });

  it('accepts a calendar whose published component set came back empty', () => {
    expect(isEventCalendar(calendar([]))).toBe(true);
  });

  it('rejects a calendar restricted to components other than VEVENT', () => {
    expect(isEventCalendar(calendar(['VTODO', 'VJOURNAL']))).toBe(false);
  });
});
