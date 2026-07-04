import {
  type Event,
  type NullableOption,
  type ResponseType,
} from '@microsoft/microsoft-graph-types';

import { sanitizeCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/utils/sanitizeCalendarEvent';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const formatMicrosoftCalendarEvents = (
  events: Event[],
): FetchedCalendarEvent[] => {
  return events.map(formatMicrosoftCalendarEvent);
};

const formatMicrosoftCalendarEvent = (event: Event): FetchedCalendarEvent => {
  const formatResponseStatus = (
    status: NullableOption<ResponseType> | undefined,
  ) => {
    switch (status) {
      case 'accepted':
      case 'organizer':
        return CalendarEventParticipantResponseStatus.ACCEPTED;
      case 'declined':
        return CalendarEventParticipantResponseStatus.DECLINED;
      case 'tentativelyAccepted':
        return CalendarEventParticipantResponseStatus.TENTATIVE;
      default:
        return CalendarEventParticipantResponseStatus.NEEDS_ACTION;
    }
  };

  const calendarEvent: FetchedCalendarEvent = {
    title: event.subject ?? '',
    isCanceled: !!event.isCancelled,
    isFullDay: !!event.isAllDay,
    startsAt: event.start?.dateTime ?? '',
    endsAt: event.end?.dateTime ?? '',
    id: event.id ?? '',
    externalCreatedAt: event.createdDateTime ?? '',
    externalUpdatedAt: event.lastModifiedDateTime ?? '',
    description: event.body?.content ?? '',
    location: event.location?.displayName ?? '',
    iCalUid: event.iCalUId ?? '',
    conferenceSolution: event.onlineMeetingProvider ?? '',
    conferenceLinkLabel: event.onlineMeeting?.joinUrl ?? '',
    conferenceLinkUrl: event.onlineMeeting?.joinUrl ?? '',
    recurringEventExternalId: event.id ?? '',
    participants:
      event.attendees?.map((attendee) => ({
        handle: attendee.emailAddress?.address ?? '',
        displayName: attendee.emailAddress?.name ?? '',
        isOrganizer: attendee.status?.response === 'organizer',
        responseStatus: formatResponseStatus(attendee.status?.response),
      })) ?? [],
    status: '',
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
