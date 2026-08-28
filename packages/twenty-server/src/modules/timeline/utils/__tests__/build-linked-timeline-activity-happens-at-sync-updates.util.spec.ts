import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { buildLinkedTimelineActivityHappensAtSyncUpdates } from 'src/modules/timeline/utils/build-linked-timeline-activity-happens-at-sync-updates.util';

const NEW_STARTS_AT = '2026-09-12T10:00:00.000Z';
const CALENDAR_EVENT_ID = 'calendar-event-id';
const LINKED_TYPE_ID = 'calendar-event-linked-type-id';

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    [STANDARD_OBJECTS.calendarEvent.fields.startsAt.universalIdentifier]: {
      universalIdentifier:
        STANDARD_OBJECTS.calendarEvent.fields.startsAt.universalIdentifier,
      name: 'startsAt',
    },
  },
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
} as unknown as FlatEntityMaps<FlatFieldMetadata>;

const buildCalendarEventRule = (
  overrides: Partial<TimelineActivityRule> = {},
): TimelineActivityRule =>
  ({
    sourceFlatObjectMetadata: {
      universalIdentifier: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
    },
    actions: ['linked'],
    timelineActivityType: {
      id: LINKED_TYPE_ID,
      applicationId: 'application-id',
      snapshot: {},
    },
    targetShape: { kind: 'JUNCTION' },
    triggerFieldNames: null,
    ...overrides,
  }) as TimelineActivityRule;

const buildStartsAtUpdatedEvent = (
  startsAt: string | null,
): ObjectRecordBaseEvent =>
  ({
    recordId: CALENDAR_EVENT_ID,
    properties: {
      diff: {
        startsAt: { before: '2026-09-01T10:00:00.000Z', after: startsAt },
      },
      after: { id: CALENDAR_EVENT_ID, startsAt },
    },
  }) as unknown as ObjectRecordBaseEvent;

const resolveTimelineActivityTypeToNothing = () => undefined;

describe('buildLinkedTimelineActivityHappensAtSyncUpdates', () => {
  it('moves linked activities when the semantic timestamp changes', () => {
    expect(
      buildLinkedTimelineActivityHappensAtSyncUpdates({
        rules: [buildCalendarEventRule()],
        events: [buildStartsAtUpdatedEvent(NEW_STARTS_AT)],
        flatFieldMetadataMaps,
        resolveTimelineActivityType: resolveTimelineActivityTypeToNothing,
      }),
    ).toEqual([
      {
        linkedRecordId: CALENDAR_EVENT_ID,
        timelineActivityTypeIds: [LINKED_TYPE_ID],
        happensAt: new Date(NEW_STARTS_AT),
      },
    ]);
  });

  it('ignores updates not touching the semantic timestamp', () => {
    const titleOnlyEvent = {
      recordId: CALENDAR_EVENT_ID,
      properties: {
        diff: { title: { before: 'Old', after: 'New' } },
        after: { id: CALENDAR_EVENT_ID, startsAt: NEW_STARTS_AT },
      },
    } as unknown as ObjectRecordBaseEvent;

    expect(
      buildLinkedTimelineActivityHappensAtSyncUpdates({
        rules: [buildCalendarEventRule()],
        events: [titleOnlyEvent],
        flatFieldMetadataMaps,
        resolveTimelineActivityType: resolveTimelineActivityTypeToNothing,
      }),
    ).toEqual([]);
  });

  it('keeps the previous happensAt when the timestamp is cleared', () => {
    expect(
      buildLinkedTimelineActivityHappensAtSyncUpdates({
        rules: [buildCalendarEventRule()],
        events: [buildStartsAtUpdatedEvent(null)],
        flatFieldMetadataMaps,
        resolveTimelineActivityType: resolveTimelineActivityTypeToNothing,
      }),
    ).toEqual([]);
  });

  it('ignores source objects without a semantic timestamp', () => {
    expect(
      buildLinkedTimelineActivityHappensAtSyncUpdates({
        rules: [
          buildCalendarEventRule({
            sourceFlatObjectMetadata: {
              universalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
            } as TimelineActivityRule['sourceFlatObjectMetadata'],
          }),
        ],
        events: [buildStartsAtUpdatedEvent(NEW_STARTS_AT)],
        flatFieldMetadataMaps,
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
        events: [buildStartsAtUpdatedEvent(NEW_STARTS_AT)],
        flatFieldMetadataMaps,
        resolveTimelineActivityType: resolveTimelineActivityTypeToNothing,
      }),
    ).toEqual([]);
  });

  it('resolves the type through the resolver when the rule carries none', () => {
    expect(
      buildLinkedTimelineActivityHappensAtSyncUpdates({
        rules: [buildCalendarEventRule({ timelineActivityType: undefined })],
        events: [buildStartsAtUpdatedEvent(NEW_STARTS_AT)],
        flatFieldMetadataMaps,
        resolveTimelineActivityType: () => ({
          id: 'resolved-type-id',
          applicationId: 'application-id',
          snapshot: {} as never,
        }),
      }),
    ).toEqual([
      {
        linkedRecordId: CALENDAR_EVENT_ID,
        timelineActivityTypeIds: ['resolved-type-id'],
        happensAt: new Date(NEW_STARTS_AT),
      },
    ]);
  });
});
