import { type CalendarEventRecordingDecisionReason } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision-reason.type';
import { type CalendarEventRecordingIntent } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-intent.type';

export type CalendarEventRecordingDecisionResult = {
  workspaceId: string;
  calendarEventId: string;
  found: boolean;
  recordingPreference: string | null;
  realMeetingKey: string | null;
  eventIntent: CalendarEventRecordingIntent | null;
  reason: CalendarEventRecordingDecisionReason | null;
};
