import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { buildLinkedTimelineActivityHappensAtSyncUpdates } from 'src/modules/timeline/utils/build-linked-timeline-activity-happens-at-sync-updates.util';

const CALENDAR_EVENT_ID = 'calendar-event-id';
const LINKED_TYPE_ID = 'calendar-event-linked-type-id';

const buildCalendarEventRule = (
  overrides: Partial<TimelineActivityRule> = {},
): TimelineActivityRule =>
  ({
    sourceFlatObjectMetadata: {
      universalIdentifier: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
      nameSingular: 'calendarEvent',
    },
    actions: ['linked'],
    timelineActivityType: {
      id: LINKED_TYPE_ID,
      applicationId: 'application-id',
      snapshot: {},
    },
    triggerFieldNames: null,
    happensAtFieldName: 'startsAt',
    targetShape: { kind: 'JUNCTION' },
    ...overrides,
  }) as TimelineActivityRule;

const buildStartsAtUpdatedEvent = (
  recordId = CALENDAR_EVENT_ID,
): ObjectRecordBaseEvent =>
  ({
    recordId,
    properties: {
      diff: {
        startsAt: {
          before: '2026-09-01T10:00:00.000Z',
          after: '2026-09-12T10:00:00.000Z',
        },
      },
    },
  }) as unknown as ObjectRecordBaseEvent;

const resolveTimelineActivityTypeToNothing = () => undefined;

describe('buildLinkedTimelineActivityHappensAtSyncUpdates', () => {
  it('collects the changed records when the semantic timestamp changes', () => {
    expect(
      buildLinkedTimelineActivityHappensAtSyncUpdates({
        rules: [buildCalendarEventRule()],
        events: [
          buildStartsAtUpdatedEvent(),
          buildStartsAtUpdatedEvent('other-calendar-event-id'),
        ],
        resolveTimelineActivityType: resolveTimelineActivityTypeToNothing,
      }),
    ).toEqual([
      {
        sourceObjectNameSingular: 'calendarEvent',
        happensAtFieldName: 'startsAt',
        timelineActivityTypeIds: [LINKED_TYPE_ID],
        linkedRecordIds: [CALENDAR_EVENT_ID, 'other-calendar-event-id'],
      },
    ]);
  });

  it('ignores updates not touching the semantic timestamp', () => {
    const titleOnlyEvent = {
      recordId: CALENDAR_EVENT_ID,
      properties: {
        diff: { title: { before: 'Old', after: 'New' } },
      },
    } as unknown as ObjectRecordBaseEvent;

    expect(
      buildLinkedTimelineActivityHappensAtSyncUpdates({
        rules: [buildCalendarEventRule()],
        events: [titleOnlyEvent],
        resolveTimelineActivityType: resolveTimelineActivityTypeToNothing,
      }),
    ).toEqual([]);
  });

  it('ignores rules without a semantic timestamp field', () => {
    expect(
      buildLinkedTimelineActivityHappensAtSyncUpdates({
        rules: [buildCalendarEventRule({ happensAtFieldName: null })],
        events: [buildStartsAtUpdatedEvent()],
        resolveTimelineActivityType: resolveTimelineActivityTypeToNothing,
      }),
    ).toEqual([]);
  });

  it('ignores self rules and rules without a linked action', () => {
    expect(
      buildLinkedTimelineActivityHappensAtSyncUpdates({
        rules: [
          buildCalendarEventRule({
            targetShape: {
              kind: 'SELF',
            } as TimelineActivityRule['targetShape'],
          }),
          buildCalendarEventRule({ actions: ['unlinked'] }),
        ],
        events: [buildStartsAtUpdatedEvent()],
        resolveTimelineActivityType: resolveTimelineActivityTypeToNothing,
      }),
    ).toEqual([]);
  });

  it('resolves the type through the resolver when the rule carries none', () => {
    expect(
      buildLinkedTimelineActivityHappensAtSyncUpdates({
        rules: [buildCalendarEventRule({ timelineActivityType: undefined })],
        events: [buildStartsAtUpdatedEvent()],
        resolveTimelineActivityType: () => ({
          id: 'resolved-type-id',
          applicationId: 'application-id',
          snapshot: {} as never,
        }),
      }),
    ).toEqual([
      {
        sourceObjectNameSingular: 'calendarEvent',
        happensAtFieldName: 'startsAt',
        timelineActivityTypeIds: ['resolved-type-id'],
        linkedRecordIds: [CALENDAR_EVENT_ID],
      },
    ]);
  });
});
