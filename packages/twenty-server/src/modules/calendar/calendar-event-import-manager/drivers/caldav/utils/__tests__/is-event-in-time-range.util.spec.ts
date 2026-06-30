import { isEventInTimeRange } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-event-in-time-range.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

const event = (startsAt: string, endsAt: string) =>
  ({ startsAt, endsAt }) as unknown as FetchedCalendarEvent;

const WINDOW_START = new Date('2026-01-01');
const WINDOW_END = new Date('2026-12-31');

describe('isEventInTimeRange', () => {
  it('returns false when the event lacks start or end', () => {
    expect(isEventInTimeRange(event('', ''), WINDOW_START, WINDOW_END)).toBe(
      false,
    );
  });

  it('includes events fully inside the window', () => {
    expect(
      isEventInTimeRange(
        event('2026-06-01T10:00:00Z', '2026-06-01T11:00:00Z'),
        WINDOW_START,
        WINDOW_END,
      ),
    ).toBe(true);
  });

  it('excludes events entirely before the window', () => {
    expect(
      isEventInTimeRange(
        event('2025-06-01T10:00:00Z', '2025-06-01T11:00:00Z'),
        WINDOW_START,
        WINDOW_END,
      ),
    ).toBe(false);
  });

  it('excludes events entirely after the window', () => {
    expect(
      isEventInTimeRange(
        event('2027-06-01T10:00:00Z', '2027-06-01T11:00:00Z'),
        WINDOW_START,
        WINDOW_END,
      ),
    ).toBe(false);
  });

  it('includes events that straddle the start boundary', () => {
    expect(
      isEventInTimeRange(
        event('2025-12-31T22:00:00Z', '2026-01-01T02:00:00Z'),
        WINDOW_START,
        WINDOW_END,
      ),
    ).toBe(true);
  });

  it('includes events that straddle the end boundary', () => {
    expect(
      isEventInTimeRange(
        event('2026-12-30T22:00:00Z', '2027-01-01T02:00:00Z'),
        WINDOW_START,
        WINDOW_END,
      ),
    ).toBe(true);
  });
});
