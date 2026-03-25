import { type calendar_v3 as calendarV3 } from 'googleapis';

import { sanitizeCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/utils/sanitizeCalendarEvent';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const formatGoogleCalendarEvents = (
  events: calendarV3.Schema$Event[],
): FetchedCalendarEvent[] => {
  return events.map(formatGoogleCalendarEvent);
};

const formatGoogleCalendarEvent = (
  event: calendarV3.Schema$Event,
): FetchedCalendarEvent => {
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

  // Create the event object
  const calendarEvent: FetchedCalendarEvent = {
    title: event.summary ?? '',
    isCanceled: event.status === 'cancelled',
    isFullDay: event.start?.dateTime == null,
    startsAt: event.start?.dateTime ?? event.start?.date ?? '',
    endsAt: event.end?.dateTime ?? event.end?.date ?? '',
    id: event.id ?? '',
    externalCreatedAt: event.created ?? '',
    externalUpdatedAt: event.updated ?? '',
    description: event.description ?? '',
    location: event.location ?? '',
    iCalUid: event.iCalUID ?? '',
    conferenceSolution:
      event.conferenceData?.conferenceSolution?.key?.type ?? '',
    conferenceLinkLabel: event.conferenceData?.entryPoints?.[0]?.uri ?? '',
    conferenceLinkUrl: event.conferenceData?.entryPoints?.[0]?.uri ?? '',
    recurringEventExternalId: event.recurringEventId ?? '',
    participants:
      event.attendees?.map((attendee) => ({
        handle: attendee.email ?? '',
        displayName: attendee.displayName ?? '',
        isOrganizer: attendee.organizer === true,
        responseStatus: formatResponseStatus(attendee.responseStatus),
      })) ?? [],
    status: event.status ?? '',
  };

  const propertiesToSanitize: (keyof FetchedCalendarEvent)[] = [
    'title',
    'startsAt',
    'endsAt',
    'id',
    'externalCreatedAt',
    'externalUpdatedAt',
    'description',
    'location',
    'iCalUid',
    'conferenceSolution',
    'conferenceLinkLabel',
    'conferenceLinkUrl',
    'recurringEventExternalId',
    'status',
  ];

  return sanitizeCalendarEvent(calendarEvent, propertiesToSanitize);
};
