import { aggregateRecordingIntentByMeeting } from 'src/modules/calendar/calendar-event-recording-manager/utils/aggregate-recording-intent-by-meeting.util';

const MEETING_KEY = 'link:meet.google.com/abc-defg-hij';

describe('aggregateRecordingIntentByMeeting', () => {
  it('should produce one ACTIVE aggregate when two events for the same meeting both want recording', () => {
    const aggregates = aggregateRecordingIntentByMeeting([
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

    expect(aggregates).toEqual([
      {
        realMeetingKey: MEETING_KEY,
        providerIntent: 'ACTIVE',
        calendarEventIds: ['event-a', 'event-b'],
        activeCalendarEventIds: ['event-a', 'event-b'],
      },
    ]);
  });

  it('should keep one ACTIVE aggregate when one event is ON and its duplicate is OFF', () => {
    const aggregates = aggregateRecordingIntentByMeeting([
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

    expect(aggregates).toHaveLength(1);
    expect(aggregates[0].providerIntent).toBe('ACTIVE');
    expect(aggregates[0].activeCalendarEventIds).toEqual(['event-a']);
    expect(aggregates[0].calendarEventIds).toEqual(['event-a', 'event-b']);
  });

  it('should cancel the aggregate when no event for the meeting wants recording', () => {
    const aggregates = aggregateRecordingIntentByMeeting([
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

    expect(aggregates).toHaveLength(1);
    expect(aggregates[0].providerIntent).toBe('CANCELED');
    expect(aggregates[0].activeCalendarEventIds).toEqual([]);
  });

  it('should aggregate separate meetings independently', () => {
    const aggregates = aggregateRecordingIntentByMeeting([
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

    expect(aggregates).toHaveLength(2);
    expect(
      aggregates.find(
        (aggregate) => aggregate.realMeetingKey === 'link:meeting-1',
      )?.providerIntent,
    ).toBe('ACTIVE');
    expect(
      aggregates.find(
        (aggregate) => aggregate.realMeetingKey === 'link:meeting-2',
      )?.providerIntent,
    ).toBe('CANCELED');
  });
});
