import { filterOutBlocklistedEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-out-blocklisted-events.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const filterEventsAndReturnCancelledEvents = (
  calendarChannelHandles: string[],
  events: FetchedCalendarEvent[],
  blocklist: string[],
): {
  filteredEvents: FetchedCalendarEvent[];
  cancelledEvents: FetchedCalendarEvent[];
} => {
  const filteredEvents = filterOutBlocklistedEvents(
    calendarChannelHandles,
    events,
    blocklist,
  );

  return filteredEvents.reduce(
    (
      acc: {
        filteredEvents: FetchedCalendarEvent[];
        cancelledEvents: FetchedCalendarEvent[];
      },
      event,
    ) => {
      if (event.isCanceled) {
        acc.cancelledEvents.push(event);
      } else {
        acc.filteredEvents.push(event);
      }

      return acc;
    },
    {
      filteredEvents: [],
      cancelledEvents: [],
    },
  );
};
