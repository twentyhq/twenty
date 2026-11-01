import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { filterMorphRelationDuplicateFieldMetadataEvents } from 'src/engine/subscriptions/metadata-event/utils/filter-morph-relation-duplicate-field-metadata-events.util';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

const MORPH_ID = 'morph-1';

const makeMorphField = ({
  id,
  universalIdentifier,
}: {
  id: string;
  universalIdentifier: string;
}) =>
  ({
    id,
    universalIdentifier,
    type: FieldMetadataType.MORPH_RELATION,
    morphId: MORPH_ID,
  }) as FlatFieldMetadata;

const head = makeMorphField({ id: 'head-id', universalIdentifier: MORPH_ID });
const target = makeMorphField({
  id: 'target-id',
  universalIdentifier: 'target-universal-identifier',
});
const textField = {
  id: 'text-id',
  universalIdentifier: 'text-universal-identifier',
  type: FieldMetadataType.TEXT,
} as FlatFieldMetadata;

const flatFieldMetadataMaps = {
  byUniversalIdentifier: { [MORPH_ID]: head },
} as unknown as FlatEntityMaps<FlatFieldMetadata>;

const createdEvent = (field: FlatFieldMetadata) =>
  ({
    type: 'created',
    metadataName: 'fieldMetadata',
    recordId: field.id,
    properties: { after: field },
  }) as MetadataEvent;

describe('filterMorphRelationDuplicateFieldMetadataEvents', () => {
  it('replaces target events with an updated event on their head', () => {
    const events = filterMorphRelationDuplicateFieldMetadataEvents({
      events: [createdEvent(target), createdEvent(textField)],
      flatFieldMetadataMaps,
    });

    expect(events.map(({ type, recordId }) => ({ type, recordId }))).toEqual([
      { type: 'created', recordId: 'text-id' },
      { type: 'updated', recordId: 'head-id' },
    ]);
  });

  it('keeps the head event as is when it is already part of the batch', () => {
    const events = filterMorphRelationDuplicateFieldMetadataEvents({
      events: [createdEvent(head), createdEvent(target)],
      flatFieldMetadataMaps,
    });

    expect(events.map(({ type, recordId }) => ({ type, recordId }))).toEqual([
      { type: 'created', recordId: 'head-id' },
    ]);
  });

  it('drops target events of a morph relation without a head', () => {
    expect(
      filterMorphRelationDuplicateFieldMetadataEvents({
        events: [createdEvent(target)],
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {},
        } as unknown as FlatEntityMaps<FlatFieldMetadata>,
      }),
    ).toEqual([]);
  });
});
