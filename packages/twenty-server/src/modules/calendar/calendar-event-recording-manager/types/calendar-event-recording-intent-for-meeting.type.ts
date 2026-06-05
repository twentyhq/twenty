import { type CalendarEventRecordingIntent } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-intent.type';

export type CalendarEventRecordingIntentForMeeting = {
  calendarEventId: string;
  realMeetingKey: string;
  eventIntent: CalendarEventRecordingIntent;
};
