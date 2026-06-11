import { filterOutBlocklistedEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-out-blocklisted-events.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

// Category names are typed by users in settings while providers return their
// own casing, so matching has to be case-insensitive.
const normalizeCategory = (category: string) => category.trim().toLowerCase();

const eventMatchesSyncedCategories = (
  event: FetchedCalendarEvent,
  normalizedSyncedCategories: string[],
): boolean =>
  (event.categories ?? []).some((category) =>
    normalizedSyncedCategories.includes(normalizeCategory(category)),
  );

export const filterEventsAndReturnCancelledEvents = (
  calendarChannelHandles: string[],
  events: FetchedCalendarEvent[],
  blocklist: string[],
  syncedCategories: string[] = [],
): {
  filteredEvents: FetchedCalendarEvent[];
  cancelledEvents: FetchedCalendarEvent[];
} => {
  const filteredEvents = filterOutBlocklistedEvents(
    calendarChannelHandles,
    events,
    blocklist,
  );

  const normalizedSyncedCategories = syncedCategories
    .map(normalizeCategory)
    .filter((category) => category.length > 0);

  return filteredEvents.reduce(
    (
      acc: {
        filteredEvents: FetchedCalendarEvent[];
        cancelledEvents: FetchedCalendarEvent[];
      },
      event,
    ) => {
      // Events not matching the category allowlist go through the
      // cancellation path so previously imported copies get cleaned up when
      // an event loses its category or the allowlist changes.
      const isExcludedByCategoryFilter =
        normalizedSyncedCategories.length > 0 &&
        !eventMatchesSyncedCategories(event, normalizedSyncedCategories);

      if (event.isCanceled || isExcludedByCategoryFilter) {
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
