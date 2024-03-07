import { CalendarEventAttendeeResponseStatus } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event-attendee.object-metadata';

export type CalendarEvent = {
  id: string;
  title: string;
  isCanceled: boolean;
  isFullDay: boolean;
  startsAt: Date;
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
