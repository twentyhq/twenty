// A real meeting occurrence whose source calendar event was deleted. The key + start let the job
// re-check the surviving calendar events for that occurrence and cancel scheduled recordings none
// of them want.
export type RemovedCalendarEventRecordingOccurrence = {
  calendarEventId: string;
  realMeetingKey: string;
  startsAt: string | null;
};
