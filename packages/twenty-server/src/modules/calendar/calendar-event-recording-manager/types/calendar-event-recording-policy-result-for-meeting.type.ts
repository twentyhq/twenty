export type CalendarEventRecordingPolicyResultForMeeting = {
  realMeetingKey: string;
  shouldRecord: boolean;
  calendarEventIds: string[];
  recordingCalendarEventIds: string[];
};
