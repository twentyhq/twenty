import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

export type CalendarEvent = Omit<
  CalendarEventWorkspaceEntity,
  | 'createdAt'
  | 'updatedAt'
  | 'calendarChannelEventAssociations'
  | 'calendarEventParticipants'
  | 'conferenceLink'
  | 'id'
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
  | 'calendarEventId'
> & {
  iCalUID: string;
};

export type CalendarEventParticipantWithCalendarEventId =
  CalendarEventParticipant & {
    calendarEventId: string;
  };

export type CalendarEventWithParticipants = CalendarEvent & {
  externalId: string;
  participants: CalendarEventParticipant[];
  status: string;
};

export type CalendarEventWithParticipantsAndCalendarEventId = CalendarEvent & {
  id: string;
  externalId: string;
  participants: CalendarEventParticipantWithCalendarEventId[];
  status: string;
};
