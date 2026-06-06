import { type CalendarEventRecordingDecisionForEvent } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision-for-event.type';
import { type CalendarEventRecordingDecisionForMeeting } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision-for-meeting.type';

type CalendarEventRecordingDecisionForMeetingInput = Pick<
  CalendarEventRecordingDecisionForEvent,
  'calendarEventId' | 'realMeetingKey' | 'eventIntent'
>;

export const aggregateCalendarEventRecordingDecisionsByMeeting = (
  perEventRecordingDecisions: CalendarEventRecordingDecisionForMeetingInput[],
): CalendarEventRecordingDecisionForMeeting[] => {
  const meetingDecisionsByMeetingKey = new Map<
    string,
    CalendarEventRecordingDecisionForMeeting
  >();

  for (const {
    calendarEventId,
    realMeetingKey,
    eventIntent,
  } of perEventRecordingDecisions) {
    const meetingDecision = meetingDecisionsByMeetingKey.get(
      realMeetingKey,
    ) ?? {
      realMeetingKey,
      meetingRecordingIntent: 'CANCELED',
      calendarEventIds: [],
      activeCalendarEventIds: [],
    };

    meetingDecision.calendarEventIds.push(calendarEventId);

    if (eventIntent === 'ACTIVE') {
      meetingDecision.meetingRecordingIntent = 'ACTIVE';
      meetingDecision.activeCalendarEventIds.push(calendarEventId);
    }

    meetingDecisionsByMeetingKey.set(realMeetingKey, meetingDecision);
  }

  return [...meetingDecisionsByMeetingKey.values()];
};
