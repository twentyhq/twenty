import { calendar_v3 as calendarV3 } from 'googleapis';
import { v4 } from 'uuid';

import { CalendarEventWithAttendees } from 'src/workspace/calendar/types/calendar-event';
import { CalendarEventAttendeeResponseStatus } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event-attendee.object-metadata';

export const formatGoogleCalendarEvent = (
  event: calendarV3.Schema$Event,
): CalendarEventWithAttendees => {
  const id = v4();

  return {
    id,
    title: event.summary || '',
    isCanceled: event.status === 'cancelled',
    isFullDay: !event.start?.dateTime,
    startsAt: event.start?.dateTime || event.start?.date || null,
    endsAt: event.end?.dateTime || event.end?.date || null,
    externalId: event.id || '',
    externalCreatedAt: event.created || null,
    externalUpdatedAt: event.updated || null,
    description: event.description || '',
    location: event.location || '',
    iCalUID: event.iCalUID || '',
    conferenceSolution:
      event.conferenceData?.conferenceSolution?.key?.type || '',
    conferenceUri: event.conferenceData?.entryPoints?.[0]?.uri || '',
    recurringEventExternalId: event.recurringEventId || '',
    attendees:
      event.attendees?.map((attendee) => ({
        calendarEventId: id,
        iCalUID: event.iCalUID || '',
        handle: attendee.email || '',
        displayName: attendee.displayName || '',
        isOrganizer: attendee.organizer?.toString() === 'true',
        responseStatus:
          attendee.responseStatus === 'accepted'
            ? CalendarEventAttendeeResponseStatus.ACCEPTED
            : attendee.responseStatus === 'declined'
              ? CalendarEventAttendeeResponseStatus.DECLINED
              : attendee.responseStatus === 'tentative'
                ? CalendarEventAttendeeResponseStatus.TENTATIVE
                : CalendarEventAttendeeResponseStatus.NEEDS_ACTION,
      })) || [],
  };
};
