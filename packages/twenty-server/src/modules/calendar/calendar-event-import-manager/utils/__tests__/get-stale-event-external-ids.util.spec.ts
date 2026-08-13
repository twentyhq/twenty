import { getStaleEventExternalIds } from 'src/modules/calendar/calendar-event-import-manager/utils/get-stale-event-external-ids.util';

describe('getStaleEventExternalIds', () => {
  it('should return the ids missing from a complete full sync', () => {
    expect(
      getStaleEventExternalIds({
        isFullSync: true,
        isPartial: false,
        existingEventExternalIds: ['event-kept', 'event-deleted-while-stale'],
        fetchedEventExternalIds: ['event-kept'],
      }),
    ).toEqual(['event-deleted-while-stale']);
  });

  it('should return nothing when a full sync still returns everything stored', () => {
    expect(
      getStaleEventExternalIds({
        isFullSync: true,
        isPartial: false,
        existingEventExternalIds: ['event-a', 'event-b'],
        fetchedEventExternalIds: ['event-b', 'event-a'],
      }),
    ).toEqual([]);
  });

  it('should return nothing on an incremental sync, where the provider reports its own deletions', () => {
    expect(
      getStaleEventExternalIds({
        isFullSync: false,
        isPartial: false,
        existingEventExternalIds: ['event-kept', 'event-not-in-this-delta'],
        fetchedEventExternalIds: ['event-kept'],
      }),
    ).toEqual([]);
  });

  it('should return nothing when the full sync result is only partial, so a failed sub-calendar is never mistaken for deletions', () => {
    expect(
      getStaleEventExternalIds({
        isFullSync: true,
        isPartial: true,
        existingEventExternalIds: [
          'event-kept',
          'event-on-the-calendar-that-failed-to-fetch',
        ],
        fetchedEventExternalIds: ['event-kept'],
      }),
    ).toEqual([]);
  });

  it('should treat a cancelled tombstone as fetched, so it is not counted twice', () => {
    expect(
      getStaleEventExternalIds({
        isFullSync: true,
        isPartial: false,
        existingEventExternalIds: ['event-cancelled', 'event-truly-stale'],
        fetchedEventExternalIds: ['event-cancelled'],
      }),
    ).toEqual(['event-truly-stale']);
  });
});
