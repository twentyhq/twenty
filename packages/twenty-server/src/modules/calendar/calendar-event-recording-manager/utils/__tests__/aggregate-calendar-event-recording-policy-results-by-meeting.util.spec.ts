import { aggregateCalendarEventRecordingPolicyResultsByMeeting } from 'src/modules/calendar/calendar-event-recording-manager/utils/aggregate-calendar-event-recording-policy-results-by-meeting.util';

const MEETING_KEY = 'link:meet.google.com/abc-defg-hij';

describe('aggregateCalendarEventRecordingPolicyResultsByMeeting', () => {
  it('should produce one recording meeting policy result when two events for the same meeting both want recording', () => {
    const meetingPolicyResults =
      aggregateCalendarEventRecordingPolicyResultsByMeeting([
        {
          calendarEventId: 'event-a',
          realMeetingKey: MEETING_KEY,
          shouldRecord: true,
        },
        {
          calendarEventId: 'event-b',
          realMeetingKey: MEETING_KEY,
          shouldRecord: true,
        },
      ]);

    expect(meetingPolicyResults).toEqual([
      {
        realMeetingKey: MEETING_KEY,
        shouldRecord: true,
        calendarEventIds: ['event-a', 'event-b'],
        recordingCalendarEventIds: ['event-a', 'event-b'],
      },
    ]);
  });

  it('should keep one recording meeting policy result when one event is ON and its duplicate is OFF', () => {
    const meetingPolicyResults =
      aggregateCalendarEventRecordingPolicyResultsByMeeting([
        {
          calendarEventId: 'event-a',
          realMeetingKey: MEETING_KEY,
          shouldRecord: true,
        },
        {
          calendarEventId: 'event-b',
          realMeetingKey: MEETING_KEY,
          shouldRecord: false,
        },
      ]);

    expect(meetingPolicyResults).toHaveLength(1);
    expect(meetingPolicyResults[0].shouldRecord).toBe(true);
    expect(meetingPolicyResults[0].recordingCalendarEventIds).toEqual([
      'event-a',
    ]);
    expect(meetingPolicyResults[0].calendarEventIds).toEqual([
      'event-a',
      'event-b',
    ]);
  });

  it('should mark the meeting policy result as not recording when no event for the meeting wants recording', () => {
    const meetingPolicyResults =
      aggregateCalendarEventRecordingPolicyResultsByMeeting([
        {
          calendarEventId: 'event-a',
          realMeetingKey: MEETING_KEY,
          shouldRecord: false,
        },
        {
          calendarEventId: 'event-b',
          realMeetingKey: MEETING_KEY,
          shouldRecord: false,
        },
      ]);

    expect(meetingPolicyResults).toHaveLength(1);
    expect(meetingPolicyResults[0].shouldRecord).toBe(false);
    expect(meetingPolicyResults[0].recordingCalendarEventIds).toEqual([]);
  });

  it('should aggregate separate meetings independently', () => {
    const meetingPolicyResults =
      aggregateCalendarEventRecordingPolicyResultsByMeeting([
        {
          calendarEventId: 'event-a',
          realMeetingKey: 'link:meeting-1',
          shouldRecord: true,
        },
        {
          calendarEventId: 'event-b',
          realMeetingKey: 'link:meeting-2',
          shouldRecord: false,
        },
      ]);

    expect(meetingPolicyResults).toHaveLength(2);
    expect(
      meetingPolicyResults.find(
        (meetingPolicyResult) =>
          meetingPolicyResult.realMeetingKey === 'link:meeting-1',
      )?.shouldRecord,
    ).toBe(true);
    expect(
      meetingPolicyResults.find(
        (meetingPolicyResult) =>
          meetingPolicyResult.realMeetingKey === 'link:meeting-2',
      )?.shouldRecord,
    ).toBe(false);
  });
});
