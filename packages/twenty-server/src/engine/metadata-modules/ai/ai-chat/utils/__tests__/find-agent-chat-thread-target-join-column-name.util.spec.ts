import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { RelationOnDeleteAction, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_TARGET_FLAT_ENTITY_MAPS_MOCK } from 'src/engine/metadata-modules/ai/ai-chat/__mocks__/agent-chat-thread-target-flat-entity-maps.mock';
import { findAgentChatThreadTargetJoinColumnName } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-thread-target-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const PET_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000011';

const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
  AGENT_CHAT_THREAD_TARGET_FLAT_ENTITY_MAPS_MOCK;

const findStandardObject = (nameSingular: keyof typeof STANDARD_OBJECTS) => {
  const flatObjectMetadata =
    flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS[nameSingular].universalIdentifier
    ];

  if (!isDefined(flatObjectMetadata)) {
    throw new Error(`Missing standard object ${nameSingular}`);
  }

  return flatObjectMetadata;
};

const targetFlatObjectMetadata = findStandardObject('agentChatThreadTarget');

// Adds a field to agentChatThreadTarget the way a side effect would: the field
// itself, and its id on the object.
const withTargetField = (
  flatFieldMetadata: FlatFieldMetadata,
): {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
} => ({
  flatObjectMetadataMaps: {
    ...flatObjectMetadataMaps,
    byUniversalIdentifier: {
      ...flatObjectMetadataMaps.byUniversalIdentifier,
      [targetFlatObjectMetadata.universalIdentifier]: {
        ...targetFlatObjectMetadata,
        fieldIds: [...targetFlatObjectMetadata.fieldIds, flatFieldMetadata.id],
      },
    },
  },
  flatFieldMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: flatFieldMetadata,
    flatEntityMaps: flatFieldMetadataMaps,
  }),
});

const companyLegFlatFieldMetadata =
  flatFieldMetadataMaps.byUniversalIdentifier[
    STANDARD_OBJECTS.agentChatThreadTarget.fields.targetCompany
      .universalIdentifier
  ];

if (!isDefined(companyLegFlatFieldMetadata)) {
  throw new Error('Missing the targetCompany leg');
}

describe('findAgentChatThreadTargetJoinColumnName', () => {
  it.each([
    ['person', 'targetPersonId'],
    ['company', 'targetCompanyId'],
    ['opportunity', 'targetOpportunityId'],
  ] as const)(
    'reaches a %s through its standard leg',
    (nameSingular, joinColumnName) => {
      expect(
        findAgentChatThreadTargetJoinColumnName({
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          objectMetadataId: findStandardObject(nameSingular).id,
        }),
      ).toBe(joinColumnName);
    },
  );

  it('reaches a custom object through the leg its creation added', () => {
    expect(
      findAgentChatThreadTargetJoinColumnName({
        ...withTargetField({
          ...companyLegFlatFieldMetadata,
          id: '20202020-0000-4000-8000-000000000012',
          universalIdentifier: '20202020-0000-4000-8000-000000000013',
          name: 'targetPet',
          relationTargetObjectMetadataId: PET_OBJECT_METADATA_ID,
          settings: {
            relationType: RelationType.MANY_TO_ONE,
            onDelete: RelationOnDeleteAction.SET_NULL,
            joinColumnName: 'targetPetId',
          },
        }),
        objectMetadataId: PET_OBJECT_METADATA_ID,
      }),
    ).toBe('targetPetId');
  });

  // Like notes, chats only attach to person, company, opportunity and custom
  // objects.
  it('finds no leg for a standard object chats do not attach to', () => {
    expect(
      findAgentChatThreadTargetJoinColumnName({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectMetadataId: findStandardObject('task').id,
      }),
    ).toBeUndefined();
  });

  // Only the target's own morph attaches a chat to a record, not any other
  // morph relation the target may carry to the same object.
  it('ignores a relation to the object outside the target morph', () => {
    const taskObjectMetadataId = findStandardObject('task').id;

    expect(
      findAgentChatThreadTargetJoinColumnName({
        ...withTargetField({
          ...companyLegFlatFieldMetadata,
          id: '20202020-0000-4000-8000-000000000014',
          universalIdentifier: '20202020-0000-4000-8000-000000000015',
          name: 'followUpTask',
          morphId: '20202020-0000-4000-8000-000000000016',
          relationTargetObjectMetadataId: taskObjectMetadataId,
          settings: {
            relationType: RelationType.MANY_TO_ONE,
            onDelete: RelationOnDeleteAction.SET_NULL,
            joinColumnName: 'followUpTaskId',
          },
        }),
        objectMetadataId: taskObjectMetadataId,
      }),
    ).toBeUndefined();
  });

  // Its upgrade command provisions the target, so a workspace can briefly run
  // this code without it.
  it('finds no leg in a workspace without the chat target', () => {
    const { [targetFlatObjectMetadata.universalIdentifier]: _target, ...rest } =
      flatObjectMetadataMaps.byUniversalIdentifier;

    expect(
      findAgentChatThreadTargetJoinColumnName({
        flatObjectMetadataMaps: {
          ...flatObjectMetadataMaps,
          byUniversalIdentifier: rest,
        },
        flatFieldMetadataMaps,
        objectMetadataId: findStandardObject('company').id,
      }),
    ).toBeUndefined();
  });
});
