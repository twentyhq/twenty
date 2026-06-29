import { type calendar_v3 as calendarV3 } from 'googleapis';
import { v4 as uuid } from 'uuid';

import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';

// Google represents all-day events with a date-only boundary, and timed events
// with an RFC 3339 dateTime paired with an IANA time zone.
const toGoogleEventDateTime = (
  isoDateTime: string,
  isFullDay: boolean,
  timeZone: string,
): calendarV3.Schema$EventDateTime =>
  isFullDay
    ? { date: isoDateTime.slice(0, 10) }
    : { dateTime: isoDateTime, timeZone };

export const toGoogleEventInput = (
  input: CalendarEventToCreate,
): calendarV3.Schema$Event => {
  const event: calendarV3.Schema$Event = {
    summary: input.title,
    description: input.description,
    location: input.location,
    start: toGoogleEventDateTime(
      input.startsAt,
      input.isFullDay,
      input.timeZone,
    ),
    end: toGoogleEventDateTime(input.endsAt, input.isFullDay, input.timeZone),
  };

  if (input.attendees.length > 0) {
    event.attendees = input.attendees.map((attendee) => ({
      email: attendee.email,
      displayName: attendee.displayName,
    }));
  }

  if (input.addConferencing) {
    event.conferenceData = {
      createRequest: {
        requestId: uuid(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  return event;
};
