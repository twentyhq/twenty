import { CalendarEventAttendeeObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-attendee.object-metadata';
import { CalendarEventObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event.object-metadata';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

export type CalendarEvent = Omit<
  ObjectRecord<CalendarEventObjectMetadata>,
  | 'createdAt'
  | 'updatedAt'
  | 'calendarChannelEventAssociations'
  | 'calendarEventAttendees'
  | 'eventAttendees'
  | 'conferenceLink'
> & {
  conferenceLinkLabel: string;
  conferenceLinkUrl: string;
};

export type CalendarEventAttendee = Omit<
  ObjectRecord<CalendarEventAttendeeObjectMetadata>,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'personId'
  | 'workspaceMemberId'
  | 'person'
  | 'workspaceMember'
  | 'calendarEvent'
> & {
  iCalUID: string;
};

export type CalendarEventWithAttendees = CalendarEvent & {
  externalId: string;
  attendees: CalendarEventAttendee[];
};

export type CalendarEventAttendeeWithId = CalendarEventAttendee & {
  id: string;
};
