import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { buildSystemRelationFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/object-metadata/utils/build-system-relation-flat-field-metadatas-for-object.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000001';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-24T00:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const findStandardObject = (nameSingular: keyof typeof STANDARD_OBJECTS) => {
  const flatObjectMetadata =
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS[nameSingular].universalIdentifier
    ];

  if (flatObjectMetadata === undefined) {
    throw new Error(`Missing standard object ${nameSingular}`);
  }

  return flatObjectMetadata;
};

const petFlatObjectMetadata = {
  ...findStandardObject('company'),
  universalIdentifier: 'b1b2b3b4-b5b6-4000-8000-000000000001',
  applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  nameSingular: 'pet',
  namePlural: 'pets',
};

const DEFAULT_TARGETS = {
  timelineActivity: findStandardObject('timelineActivity'),
  attachment: findStandardObject('attachment'),
  noteTarget: findStandardObject('noteTarget'),
  taskTarget: findStandardObject('taskTarget'),
};

describe('buildSystemRelationFlatFieldMetadatasForObject', () => {
  // The 2-38 backfill calls this with the four default targets only, so their
  // output must not change because a later target exists.
  it('mints exactly the default pairs when the chat target is not passed', () => {
    const bundles = buildSystemRelationFlatFieldMetadatasForObject({
      sourceFlatObjectMetadata: petFlatObjectMetadata,
      standardTargetFlatObjectMetadataByNameSingular: DEFAULT_TARGETS,
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(
      bundles.map(
        ({ reverseFlatFieldMetadata }) =>
          reverseFlatFieldMetadata.objectMetadataUniversalIdentifier,
      ),
    ).toEqual([
      STANDARD_OBJECTS.timelineActivity.universalIdentifier,
      STANDARD_OBJECTS.attachment.universalIdentifier,
      STANDARD_OBJECTS.noteTarget.universalIdentifier,
      STANDARD_OBJECTS.taskTarget.universalIdentifier,
    ]);
  });

  it('adds the chat pair when the chat target is passed', () => {
    const bundles = buildSystemRelationFlatFieldMetadatasForObject({
      sourceFlatObjectMetadata: petFlatObjectMetadata,
      standardTargetFlatObjectMetadataByNameSingular: {
        ...DEFAULT_TARGETS,
        agentChatThreadTarget: findStandardObject('agentChatThreadTarget'),
      },
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(
      bundles.map(
        ({ reverseFlatFieldMetadata }) =>
          reverseFlatFieldMetadata.objectMetadataUniversalIdentifier,
      ),
    ).toEqual([
      STANDARD_OBJECTS.timelineActivity.universalIdentifier,
      STANDARD_OBJECTS.attachment.universalIdentifier,
      STANDARD_OBJECTS.noteTarget.universalIdentifier,
      STANDARD_OBJECTS.taskTarget.universalIdentifier,
      STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
    ]);
  });

  // The 2-43 backfill passes the chat target alone to mint only its pair.
  it('mints the chat pair on the same morph as the standard legs', () => {
    const bundles = buildSystemRelationFlatFieldMetadatasForObject({
      sourceFlatObjectMetadata: petFlatObjectMetadata,
      standardTargetFlatObjectMetadataByNameSingular: {
        agentChatThreadTarget: findStandardObject('agentChatThreadTarget'),
      },
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(bundles).toHaveLength(1);

    const [chatBundle] = bundles;

    expect(chatBundle.forwardFlatFieldMetadata).toMatchObject({
      name: 'agentChatThreadTargets',
      type: FieldMetadataType.RELATION,
      icon: 'IconMessage',
      objectMetadataUniversalIdentifier:
        petFlatObjectMetadata.universalIdentifier,
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
    });
    expect(chatBundle.reverseFlatFieldMetadata).toMatchObject({
      name: 'targetPet',
      type: FieldMetadataType.MORPH_RELATION,
      morphId:
        STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId.morphId,
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
      relationTargetObjectMetadataUniversalIdentifier:
        petFlatObjectMetadata.universalIdentifier,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: 'targetPetId',
      },
    });
    expect(chatBundle.flatIndexMetadata.objectMetadataUniversalIdentifier).toBe(
      STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
    );
  });
});
