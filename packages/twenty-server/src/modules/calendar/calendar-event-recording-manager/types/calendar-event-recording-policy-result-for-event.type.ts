import { type CalendarEventRecordingPolicyResult } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-result.type';

export type CalendarEventRecordingPolicyResultForEvent =
  CalendarEventRecordingPolicyResult & {
    calendarEventId: string;
    recordingPreference: string;
    realMeetingKey: string;
  };
