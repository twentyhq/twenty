import { calendar_v3 } from 'googleapis';
import { v4 } from 'uuid';

import { CalendarEventWithAttendees } from 'src/modules/calendar/types/calendar-event';
import { CalendarEventAttendeeResponseStatus } from 'src/modules/calendar/standard-objects/calendar-event-attendee.object-metadata';

export const formatGoogleCalendarEvent = (
  event: calendar_v3.Schema$Event,
): CalendarEventWithAttendees => {
  const id = v4();

  const formatResponseStatus = (status: string | null | undefined) => {
    switch (status) {
      case 'accepted':
        return CalendarEventAttendeeResponseStatus.ACCEPTED;
      case 'declined':
        return CalendarEventAttendeeResponseStatus.DECLINED;
      case 'tentative':
        return CalendarEventAttendeeResponseStatus.TENTATIVE;
      default:
        return CalendarEventAttendeeResponseStatus.NEEDS_ACTION;
    }
  };

  return {
    id,
    title: event.summary ?? '',
    isCanceled: event.status === 'cancelled',
    isFullDay: event.start?.dateTime == null,
    startsAt: event.start?.dateTime ?? event.start?.date ?? null,
    endsAt: event.end?.dateTime ?? event.end?.date ?? null,
    externalId: event.id ?? '',
    externalCreatedAt: event.created ?? null,
    externalUpdatedAt: event.updated ?? null,
    description: event.description ?? '',
    location: event.location ?? '',
    iCalUID: event.iCalUID ?? '',
    conferenceSolution:
      event.conferenceData?.conferenceSolution?.key?.type ?? '',
    conferenceLinkLabel: event.conferenceData?.entryPoints?.[0]?.uri ?? '',
    conferenceLinkUrl: event.conferenceData?.entryPoints?.[0]?.uri ?? '',
    recurringEventExternalId: event.recurringEventId ?? '',
    attendees:
      event.attendees?.map((attendee) => ({
        calendarEventId: id,
        iCalUID: event.iCalUID ?? '',
        handle: attendee.email ?? '',
        displayName: attendee.displayName ?? '',
        isOrganizer: attendee.organizer === true,
        responseStatus: formatResponseStatus(attendee.responseStatus),
      })) ?? [],
  };
};
