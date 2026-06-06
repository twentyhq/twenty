import { type CalendarEventRecordingDecision } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision.type';

export type CalendarEventRecordingDecisionForEvent =
  CalendarEventRecordingDecision & {
    calendarEventId: string;
    recordingPreference: string;
    realMeetingKey: string;
  };
