import { isString } from '@sniptt/guards';
import type * as ical from 'node-ical';
import { isDefined } from 'twenty-shared/utils';

import { CALDAV_RESOURCE_CALENDAR_USER_TYPES } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/constants/caldav-resource-calendar-user-types.constant';

export const extractResourceHandlesFromEvent = (
  event: ical.VEvent,
): string[] => {
  if (!isDefined(event.attendee)) {
    return [];
  }

  const attendees = Array.isArray(event.attendee)
    ? event.attendee
    : [event.attendee];

  return attendees
    .filter(
      (attendee) =>
        !isString(attendee) &&
        CALDAV_RESOURCE_CALENDAR_USER_TYPES.includes(
          attendee.params?.CUTYPE?.toUpperCase() ?? '',
        ),
    )
    .map((attendee) =>
      (isString(attendee) ? attendee : attendee.val)
        .replace(/^mailto:/i, '')
        .toLowerCase(),
    );
};
