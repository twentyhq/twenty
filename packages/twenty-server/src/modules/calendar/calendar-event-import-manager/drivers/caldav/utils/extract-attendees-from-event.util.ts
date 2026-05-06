import { isString } from '@sniptt/guards';
import type * as ical from 'node-ical';
import { isDefined } from 'twenty-shared/utils';

import { mapPartStatToResponseStatus } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/map-partstat-to-response-status.util';
import { type FetchedCalendarEventParticipant } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const extractAttendeesFromEvent = (
  event: ical.VEvent,
): FetchedCalendarEventParticipant[] => {
  if (!isDefined(event.attendee)) return [];

  const attendees = Array.isArray(event.attendee)
    ? event.attendee
    : [event.attendee];

  return attendees.map((attendee) => {
    const rawValue = isString(attendee) ? attendee : attendee.val;
    const params = isString(attendee) ? undefined : attendee.params;
    const handle = rawValue.replace(/^mailto:/i, '');
    const partStat = params?.PARTSTAT ?? 'NEEDS_ACTION';

    return {
      displayName: params?.CN || handle || 'Unknown',
      responseStatus: mapPartStatToResponseStatus(
        partStat as ical.AttendeePartStat,
      ),
      handle,
      isOrganizer: false,
    };
  });
};
