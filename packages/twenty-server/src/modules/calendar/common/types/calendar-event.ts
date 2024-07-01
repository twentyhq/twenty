import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

export type CalendarEvent = Omit<
  CalendarEventWorkspaceEntity,
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
  CalendarEventParticipantWorkspaceEntity,
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
