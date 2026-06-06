import { aggregateCalendarEventRecordingDecisionsByMeeting } from 'src/modules/calendar/calendar-event-recording-manager/utils/aggregate-calendar-event-recording-decisions-by-meeting.util';

const MEETING_KEY = 'link:meet.google.com/abc-defg-hij';

describe('aggregateCalendarEventRecordingDecisionsByMeeting', () => {
  it('should produce one ACTIVE meeting decision when two events for the same meeting both want recording', () => {
    const meetingDecisions = aggregateCalendarEventRecordingDecisionsByMeeting([
      {
        calendarEventId: 'event-a',
        realMeetingKey: MEETING_KEY,
        eventIntent: 'ACTIVE',
      },
      {
        calendarEventId: 'event-b',
        realMeetingKey: MEETING_KEY,
        eventIntent: 'ACTIVE',
      },
    ]);

    expect(meetingDecisions).toEqual([
      {
        realMeetingKey: MEETING_KEY,
        meetingRecordingIntent: 'ACTIVE',
        calendarEventIds: ['event-a', 'event-b'],
        activeCalendarEventIds: ['event-a', 'event-b'],
      },
    ]);
  });

  it('should keep one ACTIVE meeting decision when one event is ON and its duplicate is OFF', () => {
    const meetingDecisions = aggregateCalendarEventRecordingDecisionsByMeeting([
      {
        calendarEventId: 'event-a',
        realMeetingKey: MEETING_KEY,
        eventIntent: 'ACTIVE',
      },
      {
        calendarEventId: 'event-b',
        realMeetingKey: MEETING_KEY,
        eventIntent: 'CANCELED',
      },
    ]);

    expect(meetingDecisions).toHaveLength(1);
    expect(meetingDecisions[0].meetingRecordingIntent).toBe('ACTIVE');
    expect(meetingDecisions[0].activeCalendarEventIds).toEqual(['event-a']);
    expect(meetingDecisions[0].calendarEventIds).toEqual([
      'event-a',
      'event-b',
    ]);
  });

  it('should cancel the meeting decision when no event for the meeting wants recording', () => {
    const meetingDecisions = aggregateCalendarEventRecordingDecisionsByMeeting([
      {
        calendarEventId: 'event-a',
        realMeetingKey: MEETING_KEY,
        eventIntent: 'CANCELED',
      },
      {
        calendarEventId: 'event-b',
        realMeetingKey: MEETING_KEY,
        eventIntent: 'CANCELED',
      },
    ]);

    expect(meetingDecisions).toHaveLength(1);
    expect(meetingDecisions[0].meetingRecordingIntent).toBe('CANCELED');
    expect(meetingDecisions[0].activeCalendarEventIds).toEqual([]);
  });

  it('should aggregate separate meetings independently', () => {
    const meetingDecisions = aggregateCalendarEventRecordingDecisionsByMeeting([
      {
        calendarEventId: 'event-a',
        realMeetingKey: 'link:meeting-1',
        eventIntent: 'ACTIVE',
      },
      {
        calendarEventId: 'event-b',
        realMeetingKey: 'link:meeting-2',
        eventIntent: 'CANCELED',
      },
    ]);

    expect(meetingDecisions).toHaveLength(2);
    expect(
      meetingDecisions.find(
        (meetingDecision) =>
          meetingDecision.realMeetingKey === 'link:meeting-1',
      )?.meetingRecordingIntent,
    ).toBe('ACTIVE');
    expect(
      meetingDecisions.find(
        (meetingDecision) =>
          meetingDecision.realMeetingKey === 'link:meeting-2',
      )?.meetingRecordingIntent,
    ).toBe('CANCELED');
  });
});
