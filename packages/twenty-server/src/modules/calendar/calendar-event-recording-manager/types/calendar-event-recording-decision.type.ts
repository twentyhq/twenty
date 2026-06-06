import { type CalendarEventRecordingDecisionReason } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision-reason.type';
import { type CalendarEventRecordingIntent } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-intent.type';

export type CalendarEventRecordingDecision = {
  eventIntent: CalendarEventRecordingIntent;
  reason: CalendarEventRecordingDecisionReason;
};
