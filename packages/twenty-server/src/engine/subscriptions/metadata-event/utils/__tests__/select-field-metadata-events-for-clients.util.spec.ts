import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { selectFieldMetadataEventsForClients } from 'src/engine/subscriptions/metadata-event/utils/select-field-metadata-events-for-clients.util';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

const MORPH_ID = 'morph-id';

const head = {
  id: 'head-id',
  type: FieldMetadataType.MORPH_RELATION,
  universalIdentifier: MORPH_ID,
  morphId: MORPH_ID,
} as FlatFieldMetadata;

const target = {
  ...head,
  id: 'target-id',
  universalIdentifier: 'target',
} as FlatFieldMetadata;

const text = {
  ...head,
  id: 'text-id',
  type: FieldMetadataType.TEXT,
  universalIdentifier: 'text',
  morphId: null,
} as FlatFieldMetadata;

const createdEvent = (record: FlatFieldMetadata) =>
  ({
    type: 'created',
    metadataName: 'fieldMetadata',
    recordId: record.id,
    properties: { after: record },
  }) as MetadataEvent;

const mapsWithHead = {
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: { [MORPH_ID]: head },
};

describe('selectFieldMetadataEventsForClients', () => {
  it.each([
    ['a non morph field', createdEvent(text), false, [createdEvent(text)]],
    ['a head while disabled', createdEvent(head), false, []],
    ['a head while enabled', createdEvent(head), true, [createdEvent(head)]],
    [
      'a target while disabled',
      createdEvent(target),
      false,
      [createdEvent(target)],
    ],
  ])('should select %s', (_, event, isMorphRelationHeadEnabled, expected) => {
    expect(
      selectFieldMetadataEventsForClients({
        events: [event],
        isMorphRelationHeadEnabled,
        flatFieldMetadataMaps: mapsWithHead,
      }),
    ).toEqual(expected);
  });

  it('should keep target events while the head is not backfilled', () => {
    expect(
      selectFieldMetadataEventsForClients({
        events: [createdEvent(target)],
        isMorphRelationHeadEnabled: true,
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      }),
    ).toEqual([createdEvent(target)]);
  });

  it('should replace target events with one update of their head while enabled', () => {
    expect(
      selectFieldMetadataEventsForClients({
        events: [
          createdEvent(target),
          createdEvent({ ...target, id: 'other' }),
        ],
        isMorphRelationHeadEnabled: true,
        flatFieldMetadataMaps: mapsWithHead,
      }),
    ).toEqual([
      {
        type: 'updated',
        metadataName: 'fieldMetadata',
        recordId: head.id,
        properties: { updatedFields: [], diff: {}, before: head, after: head },
      },
    ]);
  });

  it('should not add a head update when the head already has an event', () => {
    expect(
      selectFieldMetadataEventsForClients({
        events: [createdEvent(head), createdEvent(target)],
        isMorphRelationHeadEnabled: true,
        flatFieldMetadataMaps: mapsWithHead,
      }),
    ).toEqual([createdEvent(head)]);
  });
});
