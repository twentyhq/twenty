import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type FetchedCalendarEventParticipant } from 'src/modules/calendar/common/types/fetched-calendar-event';

export type CalendarEventParticipantSaveOperations = {
  participantsToInsert: (FetchedCalendarEventParticipant & {
    calendarEventId: string;
    id: string;
  })[];
  participantsToUpdate: {
    criteria: string;
    partialEntity: Partial<CalendarEventParticipantWorkspaceEntity>;
  }[];
  participantIdsToDelete: string[];
};
