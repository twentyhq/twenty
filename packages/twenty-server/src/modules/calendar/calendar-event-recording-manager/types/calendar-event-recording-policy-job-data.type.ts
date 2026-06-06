import { type RemovedCalendarEventRecordingOccurrence } from 'src/modules/calendar/calendar-event-recording-manager/types/removed-calendar-event-recording-occurrence.type';

export type CalendarEventRecordingPolicyJobData = {
  workspaceId: string;
  calendarEventIds: string[];
  removedOccurrences?: RemovedCalendarEventRecordingOccurrence[];
};
