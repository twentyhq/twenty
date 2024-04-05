import { calendar_v3 } from 'googleapis';
import { v4 } from 'uuid';

import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';
import { CalendarEventWithParticipants } from 'src/modules/calendar/types/calendar-event';

export const formatGoogleCalendarEvent = (
  event: calendar_v3.Schema$Event,
): CalendarEventWithParticipants => {
  const id = v4();

  const formatResponseStatus = (status: string | null | undefined) => {
    switch (status) {
      case 'accepted':
        return CalendarEventParticipantResponseStatus.ACCEPTED;
      case 'declined':
        return CalendarEventParticipantResponseStatus.DECLINED;
      case 'tentative':
        return CalendarEventParticipantResponseStatus.TENTATIVE;
      default:
        return CalendarEventParticipantResponseStatus.NEEDS_ACTION;
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
    participants:
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
