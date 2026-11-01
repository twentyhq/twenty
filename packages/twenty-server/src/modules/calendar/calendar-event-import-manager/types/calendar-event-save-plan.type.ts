import { type CalendarEventChannelRole } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-channel-role.type';
import { type CalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-save-operations.type';
import { type FetchedParticipantWithCalendarEventId } from 'src/modules/calendar/common/types/fetched-participant-with-calendar-event-id.type';

export type CalendarEventSavePlan = {
  saveOperations: CalendarEventSaveOperations;
  existingCalendarEventIds: string[];
  channelRoleByCalendarEventId: Map<string, CalendarEventChannelRole>;
  participantsOfNewEvents: FetchedParticipantWithCalendarEventId[];
  participantsOfExistingEvents: FetchedParticipantWithCalendarEventId[];
  participantsOfLinkedEvents: FetchedParticipantWithCalendarEventId[];
};
