import {
  Event,
  NullableOption,
  ResponseType,
} from '@microsoft/microsoft-graph-types';

import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWithParticipants } from 'src/modules/calendar/common/types/calendar-event';

export const formatMicrosoftCalendarEvents = (
  events: Event[],
): CalendarEventWithParticipants[] => {
  return events.map(formatMicrosoftCalendarEvent);
};

const formatMicrosoftCalendarEvent = (
  event: Event,
): CalendarEventWithParticipants => {
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

  return {
    title: event.subject ?? '',
    isCanceled: !!event.isCancelled,
    isFullDay: !!event.isAllDay,
    startsAt: event.start?.dateTime ?? null,
    endsAt: event.end?.dateTime ?? null,
    externalId: event.id ?? '',
    externalCreatedAt: event.createdDateTime ?? null,
    externalUpdatedAt: event.lastModifiedDateTime ?? null,
    description: event.body?.content ?? '',
    location: event.location?.displayName ?? '',
    iCalUID: event.iCalUId ?? '',
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
};
