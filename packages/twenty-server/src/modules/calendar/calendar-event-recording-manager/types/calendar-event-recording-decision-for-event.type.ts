import { type CalendarEventRecordingDecisionReason } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision-reason.type';
import { type CalendarEventRecordingIntent } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-intent.type';

// Per-event recording decision for a loaded calendar event, before it is aggregated by meeting.
export type CalendarEventRecordingDecisionForEvent = {
  calendarEventId: string;
  recordingPreference: string;
  realMeetingKey: string;
  eventIntent: CalendarEventRecordingIntent;
  reason: CalendarEventRecordingDecisionReason;
  startsAt: string | null;
};
