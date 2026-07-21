import { getSystemRelationFieldUniversalIdentifier } from 'twenty-shared/application';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { ObjectSystemRelationsOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-relations-on-create-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const SOURCE_OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000001';

const NAME_PLURAL_BY_STANDARD_OBJECT_NAME_SINGULAR: Record<string, string> = {
  timelineActivity: 'timelineActivities',
  attachment: 'attachments',
  noteTarget: 'noteTargets',
  taskTarget: 'taskTargets',
};

// The handler resolves the standard relation objects by their pinned standard
// universal identifiers, so the mocks must carry them.
const buildStandardTargetFlatObjectMetadatas = () =>
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map((nameSingular) =>
    getFlatObjectMetadataMock({
      universalIdentifier: STANDARD_OBJECTS[nameSingular].universalIdentifier,
      nameSingular,
      namePlural: NAME_PLURAL_BY_STANDARD_OBJECT_NAME_SINGULAR[nameSingular],
      labelSingular: nameSingular,
      labelPlural: NAME_PLURAL_BY_STANDARD_OBJECT_NAME_SINGULAR[nameSingular],
    }),
  );

const SOURCE_FLAT_OBJECT_METADATA = getFlatObjectMetadataMock({
  universalIdentifier: SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  nameSingular: 'rocket',
  namePlural: 'rockets',
  labelSingular: 'Rocket',
  labelPlural: 'Rockets',
});

const buildArgs = ({
  standardTargetFlatObjectMetadatas = buildStandardTargetFlatObjectMetadatas(),
  callerFieldMetadataToCreateByUniversalIdentifier = {},
  existingFieldMetadataByUniversalIdentifier = {},
}: {
  standardTargetFlatObjectMetadatas?: ReturnType<
    typeof buildStandardTargetFlatObjectMetadatas
  >;
  callerFieldMetadataToCreateByUniversalIdentifier?: Record<string, unknown>;
  existingFieldMetadataByUniversalIdentifier?: Record<string, unknown>;
}): BuildSideEffectsArgs<'objectMetadata'> => {
  const objectByUniversalIdentifier: Record<string, unknown> = {};

  for (const flatObjectMetadata of standardTargetFlatObjectMetadatas) {
    objectByUniversalIdentifier[flatObjectMetadata.universalIdentifier] =
      flatObjectMetadata;
  }

  return {
    flatEntity: SOURCE_FLAT_OBJECT_METADATA,
    allFlatEntityOperationRecordByMetadataName: {
      fieldMetadata: {
        flatEntityToCreate: callerFieldMetadataToCreateByUniversalIdentifier,
      },
    } as unknown as AllFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: {
        byUniversalIdentifier: objectByUniversalIdentifier,
      },
      flatFieldMetadataMaps: {
        byUniversalIdentifier: existingFieldMetadataByUniversalIdentifier,
      },
    },
    context: {},
  } as unknown as BuildSideEffectsArgs<'objectMetadata'>;
};

describe('ObjectSystemRelationsOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectSystemRelationsOnCreateSideEffectHandlerService as unknown as new () => ObjectSystemRelationsOnCreateSideEffectHandlerService)();

  const targets = buildStandardTargetFlatObjectMetadatas();

  const forwardUniversalIdentifierFor = (
    standardObjectUniversalIdentifier: string,
  ) =>
    getSystemRelationFieldUniversalIdentifier({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      objectUniversalIdentifier: SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetObjectUniversalIdentifier:
        standardObjectUniversalIdentifier,
    });

  const reverseUniversalIdentifierFor = (objectUniversalIdentifier: string) =>
    getSystemRelationFieldUniversalIdentifier({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      objectUniversalIdentifier,
      relationTargetObjectUniversalIdentifier:
        SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
    });

  it('should provision a forward + reverse (both name-free, isSystemSideEffect) field pair and its index for all four standard relation objects', () => {
    const result = handler.buildSideEffects(buildArgs({}));

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const fieldMetadataToCreate =
      result.operations.fieldMetadata?.flatEntityToCreate ?? {};
    const indexToCreate = result.operations.index?.flatEntityToCreate ?? {};

    expect(Object.keys(fieldMetadataToCreate)).toHaveLength(
      DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.length * 2,
    );
    expect(Object.keys(indexToCreate)).toHaveLength(
      DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.length,
    );

    for (const target of targets) {
      const forwardUniversalIdentifier = forwardUniversalIdentifierFor(
        target.universalIdentifier,
      );
      const reverseUniversalIdentifier = reverseUniversalIdentifierFor(
        target.universalIdentifier,
      );

      const forwardField = fieldMetadataToCreate[forwardUniversalIdentifier];
      const reverseField = fieldMetadataToCreate[reverseUniversalIdentifier];

      expect(forwardField).toBeDefined();
      expect(reverseField).toBeDefined();
      expect(forwardField?.isSystemSideEffect).toBe(true);
      expect(reverseField?.isSystemSideEffect).toBe(true);
      expect(
        reverseField?.relationTargetObjectMetadataUniversalIdentifier,
      ).toBe(SOURCE_OBJECT_UNIVERSAL_IDENTIFIER);
    }
  });

  // The handler always emits its bundles: a caller field colliding on
  // universal identifier is not skipped but hard-fails at the engine merge
  // (RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER collision).
  it('should emit all bundles even when a caller field collides on universal identifier', () => {
    const collidingTarget = targets[0];
    const collidingForwardUniversalIdentifier = forwardUniversalIdentifierFor(
      collidingTarget.universalIdentifier,
    );

    const result = handler.buildSideEffects(
      buildArgs({
        callerFieldMetadataToCreateByUniversalIdentifier: {
          [collidingForwardUniversalIdentifier]: {
            universalIdentifier: collidingForwardUniversalIdentifier,
          },
        },
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const fieldMetadataToCreate =
      result.operations.fieldMetadata?.flatEntityToCreate ?? {};
    const indexToCreate = result.operations.index?.flatEntityToCreate ?? {};

    expect(Object.keys(fieldMetadataToCreate)).toHaveLength(
      DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.length * 2,
    );
    expect(Object.keys(indexToCreate)).toHaveLength(
      DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.length,
    );
    expect(
      fieldMetadataToCreate[collidingForwardUniversalIdentifier],
    ).toBeDefined();
  });

  it('should fail with one error per missing standard relation object', () => {
    const [, , ...standardTargetFlatObjectMetadatasMissingFirstTwo] =
      buildStandardTargetFlatObjectMetadatas();

    const result = handler.buildSideEffects(
      buildArgs({
        standardTargetFlatObjectMetadatas:
          standardTargetFlatObjectMetadatasMissingFirstTwo,
      }),
    );

    expect(result.status).toBe('fail');

    if (result.status !== 'fail') {
      throw new Error('expected fail');
    }

    expect(result.errors).toHaveLength(2);
  });
});
