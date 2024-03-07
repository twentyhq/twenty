import { calendar_v3 } from 'googleapis';

import { CalendarEvent } from 'src/workspace/calendar/types/calendar-event';

export const formatGoogleCalendarEvent = (
  event: calendar_v3.Schema$Event,
): CalendarEvent => {
  const calendarEvent: CalendarEvent = {
    title: event.summary || '',
    isCanceled: event.status === 'cancelled',
    isFullDay: !event.start?.dateTime,
    startsAt: event.start?.dateTime ? event.start.dateTime : event.start?.date 
    endsAt: event.end?.dateTime ? event.end.dateTime : event.end?.date || undefined,
    externalCreatedAt: event.created,
    externalUpdatedAt: event.updated,
    attendees:
      event.attendees?.map((attendee: calendar_v3.Schema$EventAttendee) => ({
        id: attendee.id,
        handle: attendee.email,
        displayName: attendee.displayName,
        isOrganizer: attendee.organizer,
        responseStatus: attendee.responseStatus,
      })) || [],
  };

  return calendarEvent;
};
