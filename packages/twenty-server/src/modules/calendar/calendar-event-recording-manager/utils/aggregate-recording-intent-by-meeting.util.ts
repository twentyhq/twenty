import { type CalendarEventRecordingIntentForMeeting } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-intent-for-meeting.type';
import { type RealMeetingRecordingAggregate } from 'src/modules/calendar/calendar-event-recording-manager/types/real-meeting-recording-aggregate.type';

// Collapses many per-event intents into one decision per real meeting: a bot is requested when at
// least one calendar event for that meeting is ACTIVE, so duplicate calendar rows never produce
// duplicate bots. The provider-dispatch PR turns each aggregate into one idempotent bot upsert.
export const aggregateRecordingIntentByMeeting = (
  perEventIntents: CalendarEventRecordingIntentForMeeting[],
): RealMeetingRecordingAggregate[] => {
  const aggregatesByMeetingKey = new Map<
    string,
    RealMeetingRecordingAggregate
  >();

  for (const {
    calendarEventId,
    realMeetingKey,
    eventIntent,
  } of perEventIntents) {
    const aggregate = aggregatesByMeetingKey.get(realMeetingKey) ?? {
      realMeetingKey,
      providerIntent: 'CANCELED',
      calendarEventIds: [],
      activeCalendarEventIds: [],
    };

    aggregate.calendarEventIds.push(calendarEventId);

    if (eventIntent === 'ACTIVE') {
      aggregate.providerIntent = 'ACTIVE';
      aggregate.activeCalendarEventIds.push(calendarEventId);
    }

    aggregatesByMeetingKey.set(realMeetingKey, aggregate);
  }

  return [...aggregatesByMeetingKey.values()];
};
