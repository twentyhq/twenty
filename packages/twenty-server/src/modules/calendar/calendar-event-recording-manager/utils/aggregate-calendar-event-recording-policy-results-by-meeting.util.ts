import { type CalendarEventRecordingPolicyResultForEvent } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-result-for-event.type';
import { type CalendarEventRecordingPolicyResultForMeeting } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-result-for-meeting.type';

type CalendarEventRecordingPolicyResultForMeetingInput = Pick<
  CalendarEventRecordingPolicyResultForEvent,
  'calendarEventId' | 'realMeetingKey' | 'shouldRecord'
>;

export const aggregateCalendarEventRecordingPolicyResultsByMeeting = (
  perEventRecordingPolicyResults: CalendarEventRecordingPolicyResultForMeetingInput[],
): CalendarEventRecordingPolicyResultForMeeting[] => {
  const meetingPolicyResultsByMeetingKey = new Map<
    string,
    CalendarEventRecordingPolicyResultForMeeting
  >();

  for (const {
    calendarEventId,
    realMeetingKey,
    shouldRecord,
  } of perEventRecordingPolicyResults) {
    const meetingPolicyResult = meetingPolicyResultsByMeetingKey.get(
      realMeetingKey,
    ) ?? {
      realMeetingKey,
      shouldRecord: false,
      calendarEventIds: [],
      recordingCalendarEventIds: [],
    };

    meetingPolicyResult.calendarEventIds.push(calendarEventId);

    if (shouldRecord) {
      meetingPolicyResult.shouldRecord = true;
      meetingPolicyResult.recordingCalendarEventIds.push(calendarEventId);
    }

    meetingPolicyResultsByMeetingKey.set(realMeetingKey, meetingPolicyResult);
  }

  return [...meetingPolicyResultsByMeetingKey.values()];
};
