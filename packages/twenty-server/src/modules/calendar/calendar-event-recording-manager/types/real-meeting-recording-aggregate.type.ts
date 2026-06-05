import { type CalendarEventRecordingIntent } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-intent.type';

export type RealMeetingRecordingAggregate = {
  realMeetingKey: string;
  providerIntent: CalendarEventRecordingIntent;
  calendarEventIds: string[];
  activeCalendarEventIds: string[];
};
