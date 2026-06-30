import { isString } from '@sniptt/guards';
import type * as ical from 'node-ical';
import { isDefined } from 'twenty-shared/utils';

import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type FetchedCalendarEventParticipant } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const extractOrganizerFromEvent = (
  event: ical.VEvent,
): FetchedCalendarEventParticipant | null => {
  const organizer = event.organizer;

  if (!isDefined(organizer)) return null;

  const rawValue = isString(organizer) ? organizer : organizer.val;
  const commonName = isString(organizer) ? undefined : organizer.params?.CN;
  const handle = rawValue.replace(/^mailto:/i, '');

  return {
    displayName: commonName || handle || 'Unknown',
    responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
    handle,
    isOrganizer: true,
  };
};
