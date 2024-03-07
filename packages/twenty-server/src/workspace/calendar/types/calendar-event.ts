import { CalendarEventAttendeeResponseStatus } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event-attendee.object-metadata';

export type CalendarEvent = {
  title: string;
  isCanceled: boolean;
  isFullDay: boolean;
  startsAt: string;
  endsAt?: string;
  externalCreatedAt: string;
  externalUpdatedAt: string;
  attendees: CalendarEventAttendee[];
};

export type CalendarEventAttendee = {
  id: string;
  handle: string;
  displayName: string;
  isOrganizer: boolean;
  responseStatus: CalendarEventAttendeeResponseStatus;
};
