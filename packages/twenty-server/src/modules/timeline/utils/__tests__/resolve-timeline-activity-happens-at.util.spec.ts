import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { resolveTimelineActivityHappensAt } from 'src/modules/timeline/utils/resolve-timeline-activity-happens-at.util';

const EVENT_TIME = new Date('2026-08-22T12:00:00.000Z');

describe('resolveTimelineActivityHappensAt', () => {
  it('uses the mutation timestamp from the record after the event', () => {
    const event = {
      properties: { after: { updatedAt: EVENT_TIME.toISOString() } },
    } as ObjectRecordBaseEvent;

    expect(resolveTimelineActivityHappensAt(event)).toEqual(EVENT_TIME);
  });

  it('uses the record before the event when no after record exists', () => {
    const event = {
      properties: { before: { updatedAt: EVENT_TIME } },
    } as ObjectRecordBaseEvent;

    expect(resolveTimelineActivityHappensAt(event)).toEqual(EVENT_TIME);
  });

  it('falls back to the processing time for legacy events without timestamps', () => {
    jest.useFakeTimers().setSystemTime(EVENT_TIME);

    const event = { properties: {} } as ObjectRecordBaseEvent;

    expect(resolveTimelineActivityHappensAt(event)).toEqual(EVENT_TIME);

    jest.useRealTimers();
  });
});
