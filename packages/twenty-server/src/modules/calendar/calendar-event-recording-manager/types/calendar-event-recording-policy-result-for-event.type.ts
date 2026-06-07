import { type CalendarEventRecordingPreference } from 'src/engine/core-modules/calendar/types/calendar-event-recording-preference.type';
import { type CalendarEventRecordingPolicyResult } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-result.type';

export type CalendarEventRecordingPolicyResultForEvent =
  CalendarEventRecordingPolicyResult & {
    calendarEventId: string;
    recordingPreference: CalendarEventRecordingPreference;
    realMeetingKey: string;
  };
