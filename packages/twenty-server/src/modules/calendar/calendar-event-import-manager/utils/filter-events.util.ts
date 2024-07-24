import { filterOutBlocklistedEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-out-blocklisted-events.util';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventWithParticipants } from 'src/modules/calendar/common/types/calendar-event';

export const filterEventsAndReturnCancelledEvents = (
  calendarChannel: Pick<CalendarChannelWorkspaceEntity, 'handle'>,
  events: CalendarEventWithParticipants[],
  blocklist: string[],
): {
  filteredEvents: CalendarEventWithParticipants[];
  cancelledEvents: CalendarEventWithParticipants[];
} => {
  const filteredEvents = filterOutBlocklistedEvents(
    calendarChannel.handle,
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
      if (event.status === 'cancelled') {
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
