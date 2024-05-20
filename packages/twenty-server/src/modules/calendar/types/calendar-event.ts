import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event.workspace-entity';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

export type CalendarEvent = Omit<
  ObjectRecord<CalendarEventWorkspaceEntity>,
  | 'createdAt'
  | 'updatedAt'
  | 'calendarChannelEventAssociations'
  | 'calendarEventParticipants'
  | 'conferenceLink'
> & {
  conferenceLinkLabel: string;
  conferenceLinkUrl: string;
};

export type CalendarEventParticipant = Omit<
  ObjectRecord<CalendarEventParticipantWorkspaceEntity>,
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
