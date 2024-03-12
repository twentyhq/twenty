import { CalendarEventAttendeeObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event-attendee.object-metadata';
import { CalendarEventObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

export type CalendarEvent = Omit<
  ObjectRecord<CalendarEventObjectMetadata>,
  | 'createdAt'
  | 'updatedAt'
  | 'calendarChannelEventAssociations'
  | 'calendarEventAttendees'
  | 'eventAttendees'
>;

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
