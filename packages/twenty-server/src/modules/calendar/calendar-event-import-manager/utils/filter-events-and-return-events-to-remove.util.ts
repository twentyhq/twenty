import { filterOutBlocklistedEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-out-blocklisted-events.util';
import { filterOutInternalEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-out-internal-events.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';
import { isWorkEmail } from 'src/utils/is-work-email';

export const filterEventsAndReturnEventsToRemove = (
  primaryHandle: string,
  handleAliases: string[],
  events: FetchedCalendarEvent[],
  blocklist: string[],
  excludePrivateEvents: boolean,
  isInternalMessagesImportEnabled: boolean,
): {
  filteredEvents: FetchedCalendarEvent[];
  eventsToRemove: FetchedCalendarEvent[];
} => {
  const filteredEvents = filterOutBlocklistedEvents(
    [primaryHandle, ...handleAliases],
    events,
    blocklist,
  );

  const { eventsToKeep, eventsToRemove } = filteredEvents.reduce(
    (
      acc: {
        eventsToKeep: FetchedCalendarEvent[];
        eventsToRemove: FetchedCalendarEvent[];
      },
      event,
    ) => {
      if (event.isCanceled || (excludePrivateEvents && event.isPrivate)) {
        acc.eventsToRemove.push(event);
      } else {
        acc.eventsToKeep.push(event);
      }

      return acc;
    },
    {
      eventsToKeep: [],
      eventsToRemove: [],
    },
  );

  const shouldFilterOutInternals =
    isWorkEmail(primaryHandle) && !isInternalMessagesImportEnabled;

  return {
    filteredEvents: shouldFilterOutInternals
      ? filterOutInternalEvents(primaryHandle, eventsToKeep)
      : eventsToKeep,
    eventsToRemove,
  };
};
