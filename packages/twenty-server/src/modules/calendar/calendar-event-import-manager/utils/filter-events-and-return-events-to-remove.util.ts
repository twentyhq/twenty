import { filterOutBlocklistedEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-out-blocklisted-events.util';
import { filterOutInternalEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-out-internal-events.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';
import { isWorkEmail } from 'src/utils/is-work-email';

export const filterEventsAndReturnEventsToRemove = ({
  primaryHandle,
  handleAliases,
  events,
  blocklist,
  excludePrivateEvents,
  isInternalImportEnabled,
}: {
  primaryHandle: string;
  handleAliases: string[];
  events: FetchedCalendarEvent[];
  blocklist: string[];
  excludePrivateEvents: boolean;
  isInternalImportEnabled: boolean;
}): {
  filteredEvents: FetchedCalendarEvent[];
  eventsToRemove: FetchedCalendarEvent[];
} => {
  const eventsWithoutBlocklisted = filterOutBlocklistedEvents(
    [primaryHandle, ...handleAliases],
    events,
    blocklist,
  );

  const shouldFilterOutInternals =
    isWorkEmail(primaryHandle) && !isInternalImportEnabled;

  const eventsWithExternalParticipants = new Set(
    shouldFilterOutInternals
      ? filterOutInternalEvents({
          primaryHandle,
          events: eventsWithoutBlocklisted,
        })
      : eventsWithoutBlocklisted,
  );

  const { eventsToKeep, eventsToRemove } = eventsWithoutBlocklisted.reduce(
    (
      acc: {
        eventsToKeep: FetchedCalendarEvent[];
        eventsToRemove: FetchedCalendarEvent[];
      },
      event,
    ) => {
      if (
        event.isCanceled ||
        (excludePrivateEvents && event.isPrivate) ||
        !eventsWithExternalParticipants.has(event)
      ) {
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

  return {
    filteredEvents: eventsToKeep,
    eventsToRemove,
  };
};
