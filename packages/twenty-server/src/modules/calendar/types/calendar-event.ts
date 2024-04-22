import { CalendarEventParticipantObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';
import { CalendarEventObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event.object-metadata';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

export type CalendarEvent = Omit<
  ObjectRecord<CalendarEventObjectMetadata>,
  | 'createdAt'
  | 'updatedAt'
  | 'calendarChannelEventAssociations'
  | 'calendarEventParticipants'
  | 'eventParticipants'
  | 'conferenceLink'
> & {
  conferenceLinkLabel: string;
  conferenceLinkUrl: string;
};

export type CalendarEventParticipant = Omit<
  ObjectRecord<CalendarEventParticipantObjectMetadata>,
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

export type CalendarEventWithParticipants = CalendarEvent & {
  externalId: string;
  participants: CalendarEventParticipant[];
};

export type CalendarEventParticipantWithId = CalendarEventParticipant & {
  id: string;
};
