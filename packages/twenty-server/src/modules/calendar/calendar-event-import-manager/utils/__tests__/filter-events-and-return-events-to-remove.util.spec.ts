import { filterEventsAndReturnEventsToRemove } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-events-and-return-events-to-remove.util';
import { buildFetchedCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/utils/__tests__/build-fetched-calendar-event.test-util';

describe('filterEventsAndReturnEventsToRemove', () => {
  it('should keep regular events and route cancelled and private events to removal', () => {
    const regularEvent = buildFetchedCalendarEvent({ id: 'regular' });
    const cancelledEvent = buildFetchedCalendarEvent({
      id: 'cancelled',
      isCanceled: true,
    });
    const privateEvent = buildFetchedCalendarEvent({
      id: 'private',
      isPrivate: true,
    });

    const { filteredEvents, eventsToRemove } =
      filterEventsAndReturnEventsToRemove(
        ['me@example.com'],
        [regularEvent, cancelledEvent, privateEvent],
        [],
      );

    expect(filteredEvents).toEqual([regularEvent]);
    expect(eventsToRemove).toEqual([cancelledEvent, privateEvent]);
  });

  it('should drop events with a blocklisted participant', () => {
    const { filteredEvents, eventsToRemove } =
      filterEventsAndReturnEventsToRemove(
        ['me@example.com'],
        [buildFetchedCalendarEvent()],
        ['john@example.com'],
      );

    expect(filteredEvents).toEqual([]);
    expect(eventsToRemove).toEqual([]);
  });
});
