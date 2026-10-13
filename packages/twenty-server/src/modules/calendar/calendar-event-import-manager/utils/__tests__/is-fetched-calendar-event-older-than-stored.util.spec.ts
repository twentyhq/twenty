import { isFetchedCalendarEventOlderThanStored } from 'src/modules/calendar/calendar-event-import-manager/utils/is-fetched-calendar-event-older-than-stored.util';

describe('isFetchedCalendarEventOlderThanStored', () => {
  it('is true when the fetched copy was modified before the stored one', () => {
    expect(
      isFetchedCalendarEventOlderThanStored({
        fetchedExternalUpdatedAt: '2026-09-15T08:00:00.000Z',
        storedExternalUpdatedAt: '2026-09-20T08:00:00.000Z',
      }),
    ).toBe(true);
  });

  it('is false for a copy modified at the same time or later', () => {
    expect(
      isFetchedCalendarEventOlderThanStored({
        fetchedExternalUpdatedAt: '2026-09-20T08:00:00.000Z',
        storedExternalUpdatedAt: new Date('2026-09-20T08:00:00.000Z'),
      }),
    ).toBe(false);
  });

  it('is false when either modification time is missing or unreadable', () => {
    expect(
      isFetchedCalendarEventOlderThanStored({
        fetchedExternalUpdatedAt: '',
        storedExternalUpdatedAt: '2026-09-20T08:00:00.000Z',
      }),
    ).toBe(false);
    expect(
      isFetchedCalendarEventOlderThanStored({
        fetchedExternalUpdatedAt: 'not a date',
        storedExternalUpdatedAt: null,
      }),
    ).toBe(false);
  });
});
