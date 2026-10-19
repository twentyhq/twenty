import { filterOutBlocklistedEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-out-blocklisted-events.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';

export const filterEventsAndReturnEventsToRemove = (
  calendarChannelHandles: string[],
  events: FetchedCalendarEvent[],
  blocklist: string[],
  excludePrivateEvents: boolean,
): {
  filteredEvents: FetchedCalendarEvent[];
  eventsToRemove: FetchedCalendarEvent[];
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
        eventsToRemove: FetchedCalendarEvent[];
      },
      event,
    ) => {
      if (event.isCanceled || (excludePrivateEvents && event.isPrivate)) {
        acc.eventsToRemove.push(event);
      } else {
        acc.filteredEvents.push(event);
      }

      return acc;
    },
    {
      filteredEvents: [],
      eventsToRemove: [],
    },
  );
};
