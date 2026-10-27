import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { computeEventOccurrenceRealtimeScopes } from 'src/engine/metadata-modules/event-metadata/utils/compute-event-occurrence-realtime-scopes.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER =
  '7d2f1b3a-4c5e-4f6a-8b7c-9d0e1f2a3b4c';
const CONVERSATION_OBJECT_ID = '11111111-2222-4333-8444-555555555555';
const RECORD_ID = '0f5c2c1e-4b7a-4f3e-9d2a-6c8b1e0a7d34';

const FLAT_EVENT_METADATA: Pick<
  FlatEventMetadata,
  'properties' | 'capabilities'
> = {
  properties: [
    {
      name: 'conversationId',
      type: 'RECORD_REFERENCE',
      objectUniversalIdentifier: CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
    },
    { name: 'text', type: 'TEXT' },
  ],
  capabilities: {
    realtime: {
      scopes: [
        { kind: 'record', property: 'conversationId' },
        { kind: 'visitor' },
      ],
    },
  },
};

const buildFlatObjectMetadataMaps = () => {
  const flatObjectMetadataMaps = createEmptyFlatEntityMaps();

  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: getFlatObjectMetadataMock({
      id: CONVERSATION_OBJECT_ID,
      universalIdentifier: CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
      nameSingular: 'conversation',
    }),
    flatEntityMapsToMutate: flatObjectMetadataMaps,
  });

  return flatObjectMetadataMaps;
};

describe('computeEventOccurrenceRealtimeScopes', () => {
  it('should derive the record and visitor scopes from the occurrence', () => {
    expect(
      computeEventOccurrenceRealtimeScopes({
        flatEventMetadata: FLAT_EVENT_METADATA,
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps(),
        properties: { conversationId: RECORD_ID, text: 'Hello' },
        anonymousId: 'visitor-1',
      }),
    ).toEqual([
      {
        kind: 'record',
        objectMetadataId: CONVERSATION_OBJECT_ID,
        recordId: RECORD_ID,
      },
      { kind: 'visitor', anonymousId: 'visitor-1' },
    ]);
  });

  it('should skip scopes the occurrence carries no value for', () => {
    expect(
      computeEventOccurrenceRealtimeScopes({
        flatEventMetadata: FLAT_EVENT_METADATA,
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps(),
        properties: { text: 'Hello' },
        anonymousId: null,
      }),
    ).toEqual([]);
  });

  it('should skip a record scope whose object no longer exists', () => {
    expect(
      computeEventOccurrenceRealtimeScopes({
        flatEventMetadata: FLAT_EVENT_METADATA,
        flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
        properties: { conversationId: RECORD_ID },
        anonymousId: null,
      }),
    ).toEqual([]);
  });
});
