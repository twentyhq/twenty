import { isNonEmptyString } from '@sniptt/guards';

import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';
import { filterOutInternals } from 'src/modules/messaging/message-import-manager/utils/filter-out-internals.util';

export const filterOutInternalEvents = (
  primaryHandle: string,
  events: FetchedCalendarEvent[],
): FetchedCalendarEvent[] =>
  filterOutInternals(
    primaryHandle,
    events.map((event) => ({
      event,
      participants: [
        ...event.participants,
        {
          handle: isNonEmptyString(event.organizerHandle)
            ? event.organizerHandle
            : null,
        },
      ],
    })),
  ).map(({ event }) => event);
