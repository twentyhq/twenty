import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  resolveLinkedTimelineActivityHappensAt,
  resolveTimelineActivityHappensAt,
} from 'src/modules/timeline/utils/resolve-timeline-activity-happens-at.util';

const EVENT_TIME = new Date('2026-08-22T12:00:00.000Z');
const SOURCE_TIME = new Date('2024-03-15T09:30:00.000Z');

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

describe('resolveLinkedTimelineActivityHappensAt', () => {
  const event = {
    properties: { after: { updatedAt: EVENT_TIME.toISOString() } },
  } as ObjectRecordBaseEvent;

  const buildFlatFieldMetadataMaps = (
    fields: { universalIdentifier: string; name: string }[],
  ): FlatEntityMaps<FlatFieldMetadata> =>
    ({
      byUniversalIdentifier: Object.fromEntries(
        fields.map((field) => [field.universalIdentifier, field]),
      ),
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    }) as unknown as FlatEntityMaps<FlatFieldMetadata>;

  const messageFlatObjectMetadata = {
    universalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
  } as FlatObjectMetadata;

  const calendarEventFlatObjectMetadata = {
    universalIdentifier: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
  } as FlatObjectMetadata;

  const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
    {
      universalIdentifier:
        STANDARD_OBJECTS.message.fields.receivedAt.universalIdentifier,
      name: 'receivedAt',
    },
    {
      universalIdentifier:
        STANDARD_OBJECTS.calendarEvent.fields.startsAt.universalIdentifier,
      name: 'startsAt',
    },
  ]);

  it('anchors a linked message at its receivedAt instead of the sync time', () => {
    expect(
      resolveLinkedTimelineActivityHappensAt({
        event,
        ruleAction: 'linked',
        sourceFlatObjectMetadata: messageFlatObjectMetadata,
        sourceRecord: { receivedAt: SOURCE_TIME.toISOString() },
        flatFieldMetadataMaps,
      }),
    ).toEqual(SOURCE_TIME);
  });

  it('anchors a linked calendar event at its startsAt instead of the sync time', () => {
    expect(
      resolveLinkedTimelineActivityHappensAt({
        event,
        ruleAction: 'linked',
        sourceFlatObjectMetadata: calendarEventFlatObjectMetadata,
        sourceRecord: { startsAt: SOURCE_TIME.toISOString() },
        flatFieldMetadataMaps,
      }),
    ).toEqual(SOURCE_TIME);
  });

  it('keeps the event timestamp for rule actions other than linked', () => {
    expect(
      resolveLinkedTimelineActivityHappensAt({
        event,
        ruleAction: 'unlinked',
        sourceFlatObjectMetadata: messageFlatObjectMetadata,
        sourceRecord: { receivedAt: SOURCE_TIME.toISOString() },
        flatFieldMetadataMaps,
      }),
    ).toEqual(EVENT_TIME);
  });

  it('keeps the event timestamp for objects without a semantic timestamp', () => {
    expect(
      resolveLinkedTimelineActivityHappensAt({
        event,
        ruleAction: 'linked',
        sourceFlatObjectMetadata: {
          universalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
        } as FlatObjectMetadata,
        sourceRecord: { receivedAt: SOURCE_TIME.toISOString() },
        flatFieldMetadataMaps,
      }),
    ).toEqual(EVENT_TIME);
  });

  it('keeps the event timestamp when the source record read raced the write', () => {
    expect(
      resolveLinkedTimelineActivityHappensAt({
        event,
        ruleAction: 'linked',
        sourceFlatObjectMetadata: messageFlatObjectMetadata,
        sourceRecord: undefined,
        flatFieldMetadataMaps,
      }),
    ).toEqual(EVENT_TIME);
  });

  it('keeps the event timestamp when the semantic timestamp is null', () => {
    expect(
      resolveLinkedTimelineActivityHappensAt({
        event,
        ruleAction: 'linked',
        sourceFlatObjectMetadata: messageFlatObjectMetadata,
        sourceRecord: { receivedAt: null },
        flatFieldMetadataMaps,
      }),
    ).toEqual(EVENT_TIME);
  });
});
