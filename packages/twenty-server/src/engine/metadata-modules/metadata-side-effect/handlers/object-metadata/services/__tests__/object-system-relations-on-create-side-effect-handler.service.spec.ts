import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { ObjectSystemRelationsOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-relations-on-create-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-24T00:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const standardObjectsByUniversalIdentifier =
  allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier;

const petFlatObjectMetadata = {
  ...standardObjectsByUniversalIdentifier[
    STANDARD_OBJECTS.company.universalIdentifier
  ],
  universalIdentifier: 'b1b2b3b4-b5b6-4000-8000-000000000001',
  applicationUniversalIdentifier: 'a1a2a3a4-a5a6-4000-8000-000000000001',
  nameSingular: 'pet',
  namePlural: 'pets',
};

const withoutObject = (universalIdentifier: string) =>
  Object.fromEntries(
    Object.entries(standardObjectsByUniversalIdentifier).filter(
      ([key]) => key !== universalIdentifier,
    ),
  );

const buildArgs = (
  flatObjectMetadataByUniversalIdentifier: Record<string, unknown>,
) =>
  ({
    flatEntity: petFlatObjectMetadata,
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: {
        byUniversalIdentifier: flatObjectMetadataByUniversalIdentifier,
      },
    },
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

const handler =
  new (ObjectSystemRelationsOnCreateSideEffectHandlerService as unknown as new () => ObjectSystemRelationsOnCreateSideEffectHandlerService)();

const getReverseFieldObjectUniversalIdentifiers = (
  result: ReturnType<typeof handler.buildSideEffects>,
) => {
  if (result.status !== 'success') {
    throw new Error(`Expected success, got ${result.status}`);
  }

  return Object.values(
    result.operations.fieldMetadata?.flatEntityToCreate ?? {},
  )
    .filter((flatFieldMetadata) => flatFieldMetadata?.name === 'targetPet')
    .map(
      (flatFieldMetadata) =>
        flatFieldMetadata?.objectMetadataUniversalIdentifier,
    );
};

describe('ObjectSystemRelationsOnCreateSideEffectHandlerService', () => {
  it('gives a new object a chat leg when the workspace has the chat target', () => {
    const result = handler.buildSideEffects(
      buildArgs(standardObjectsByUniversalIdentifier),
    );

    expect(getReverseFieldObjectUniversalIdentifiers(result)).toContain(
      STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
    );
  });

  // Its upgrade command provisions the chat target and backfills objects
  // created before it ran, so creating an object meanwhile must still work.
  it('still creates the object when the chat target is not provisioned yet', () => {
    const result = handler.buildSideEffects(
      buildArgs(
        withoutObject(STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier),
      ),
    );

    expect(getReverseFieldObjectUniversalIdentifiers(result)).toEqual([
      STANDARD_OBJECTS.timelineActivity.universalIdentifier,
      STANDARD_OBJECTS.attachment.universalIdentifier,
      STANDARD_OBJECTS.noteTarget.universalIdentifier,
      STANDARD_OBJECTS.taskTarget.universalIdentifier,
    ]);
  });

  it('refuses to create the object when a default relation target is missing', () => {
    const result = handler.buildSideEffects(
      buildArgs(withoutObject(STANDARD_OBJECTS.noteTarget.universalIdentifier)),
    );

    expect(result.status).toBe('fail');
  });
});
