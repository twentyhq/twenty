import { type CalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-save-operations.type';
import { type FetchedParticipantWithCalendarEventId } from 'src/modules/calendar/common/types/fetched-participant-with-calendar-event-id.type';

export type CalendarEventSavePlan = {
  saveOperations: CalendarEventSaveOperations;
  participantsOfNewEvents: FetchedParticipantWithCalendarEventId[];
  participantsOfExistingEvents: FetchedParticipantWithCalendarEventId[];
};
