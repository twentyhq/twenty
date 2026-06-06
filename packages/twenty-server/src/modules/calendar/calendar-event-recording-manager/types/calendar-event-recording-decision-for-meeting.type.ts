import { type CalendarEventRecordingIntent } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-intent.type';

export type CalendarEventRecordingDecisionForMeeting = {
  realMeetingKey: string;
  meetingRecordingIntent: CalendarEventRecordingIntent;
  calendarEventIds: string[];
  activeCalendarEventIds: string[];
};
