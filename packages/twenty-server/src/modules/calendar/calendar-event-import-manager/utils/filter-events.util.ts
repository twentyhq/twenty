import { filterOutBlocklistedEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-out-blocklisted-events.util';
import { CalendarEventWithParticipants } from 'src/modules/calendar/common/types/calendar-event';

export const filterEventsAndReturnCancelledEvents = (
  calendarChannelHandles: string[],
  events: CalendarEventWithParticipants[],
  blocklist: string[],
): {
  filteredEvents: CalendarEventWithParticipants[];
  cancelledEvents: CalendarEventWithParticipants[];
} => {
  const filteredEvents = filterOutBlocklistedEvents(
    calendarChannelHandles,
    events,
    blocklist,
  );

  return filteredEvents.reduce(
    (
      acc: {
        filteredEvents: CalendarEventWithParticipants[];
        cancelledEvents: CalendarEventWithParticipants[];
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
