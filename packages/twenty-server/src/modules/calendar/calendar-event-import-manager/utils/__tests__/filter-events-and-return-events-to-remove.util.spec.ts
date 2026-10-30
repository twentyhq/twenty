import { filterEventsAndReturnEventsToRemove } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-events-and-return-events-to-remove.util';
import { buildFetchedCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/utils/__tests__/build-fetched-calendar-event.test-util';

describe('filterEventsAndReturnEventsToRemove', () => {
  const regularEvent = buildFetchedCalendarEvent({ id: 'regular' });
  const cancelledEvent = buildFetchedCalendarEvent({
    id: 'cancelled',
    isCanceled: true,
  });
  const privateEvent = buildFetchedCalendarEvent({
    id: 'private',
    isPrivate: true,
  });

  it('should keep private events and route cancelled events to removal when private events are not excluded', () => {
    const { filteredEvents, eventsToRemove } =
      filterEventsAndReturnEventsToRemove(
        ['me@example.com'],
        [regularEvent, cancelledEvent, privateEvent],
        [],
        false,
      );

    expect(filteredEvents).toEqual([regularEvent, privateEvent]);
    expect(eventsToRemove).toEqual([cancelledEvent]);
  });

  it('should route cancelled and private events to removal when private events are excluded', () => {
    const { filteredEvents, eventsToRemove } =
      filterEventsAndReturnEventsToRemove(
        ['me@example.com'],
        [regularEvent, cancelledEvent, privateEvent],
        [],
        true,
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
        false,
      );

    expect(filteredEvents).toEqual([]);
    expect(eventsToRemove).toEqual([]);
  });
});
