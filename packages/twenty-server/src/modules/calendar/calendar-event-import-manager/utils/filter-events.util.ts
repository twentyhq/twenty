import { calendar_v3 as calendarV3 } from 'googleapis';

import { filterOutBlocklistedEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-out-blocklisted-events.util';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export const filterEvents = (
  calendarChannel: Pick<CalendarChannelWorkspaceEntity, 'handle'>,
  events: calendarV3.Schema$Event[],
  blocklist: string[],
) => {
  return filterOutBlocklistedEvents(
    calendarChannel.handle,
    events,
    blocklist,
  ).filter((event) => event.status !== 'cancelled');
};
