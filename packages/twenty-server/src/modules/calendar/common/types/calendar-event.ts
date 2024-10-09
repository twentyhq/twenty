import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

export type CalendarEvent = Omit<
  CalendarEventWorkspaceEntity,
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
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
  | 'deletedAt'
  | 'personId'
  | 'workspaceMemberId'
  | 'person'
  | 'workspaceMember'
  | 'calendarEvent'
  | 'calendarEventId'
>;

export type CalendarEventParticipantWithCalendarEventId =
  CalendarEventParticipant & {
    calendarEventId: string;
  };

export type CalendarEventWithParticipants = CalendarEvent & {
  externalId: string;
  recurringEventExternalId?: string;
  participants: CalendarEventParticipant[];
  status: string;
};

export type CalendarEventWithParticipantsAndCalendarEventId = CalendarEvent & {
  id: string;
  externalId: string;
  recurringEventExternalId?: string;
  participants: CalendarEventParticipantWithCalendarEventId[];
  status: string;
};
