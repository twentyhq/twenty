import { calendar_v3 as calendarV3 } from 'googleapis';

import { isEmailBlocklisted } from 'src/modules/calendar-messaging-participant/utils/is-email-blocklisted.util';

export const filterOutBlocklistedEvents = (
  events: calendarV3.Schema$Event[],
  blocklist: string[],
) => {
  return events.filter((event) => {
    if (!event.attendees) {
      return true;
    }

    return event.attendees.every(
      (attendee) => !isEmailBlocklisted(attendee.email, blocklist),
    );
  });
};
