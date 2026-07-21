import { getFieldUniversalIdentifier } from 'twenty-shared/application';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { ObjectSystemFieldsOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-fields-on-create-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const SYSTEM_FIELD_NAMES = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'position',
] as const;

const NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
});

const SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'searchVector',
});

const buildArgs = ({
  labelIdentifierFieldMetadataUniversalIdentifier,
  allFlatEntityOperationRecordByMetadataName = {} as unknown as AllFlatEntityOperationRecordByMetadataName,
  relatedFlatEntityMaps = {},
}: {
  labelIdentifierFieldMetadataUniversalIdentifier: string;
  allFlatEntityOperationRecordByMetadataName?: AllFlatEntityOperationRecordByMetadataName;
  relatedFlatEntityMaps?: object;
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      labelIdentifierFieldMetadataUniversalIdentifier,
    },
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectSystemFieldsOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectSystemFieldsOnCreateSideEffectHandlerService as unknown as new () => ObjectSystemFieldsOnCreateSideEffectHandlerService)();

  it('should synthesize exactly the 7 reserved system fields and never the caller-provided name field nor the searchVector field', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const createdUniversalIdentifiers = Object.keys(
      result.operations.fieldMetadata?.flatEntityToCreate ?? {},
    );

    expect(createdUniversalIdentifiers).toHaveLength(7);
    expect(createdUniversalIdentifiers).not.toContain(
      NAME_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(createdUniversalIdentifiers).not.toContain(
      SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
    );

    for (const name of SYSTEM_FIELD_NAMES) {
      expect(createdUniversalIdentifiers).toContain(
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          name,
        }),
      );
    }
  });

  it('should still emit all system fields even when they already exist in the from-state (dedup delegated to the engine merge)', () => {
    const alreadyPresentByUniversalIdentifier: Record<string, unknown> = {};

    for (const name of SYSTEM_FIELD_NAMES) {
      const universalIdentifier = getFieldUniversalIdentifier({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        name,
      });

      alreadyPresentByUniversalIdentifier[universalIdentifier] = {
        universalIdentifier,
      };
    }

    const result = handler.buildSideEffects(
      buildArgs({
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
        relatedFlatEntityMaps: {
          flatFieldMetadataMaps: {
            byUniversalIdentifier: alreadyPresentByUniversalIdentifier,
          },
        },
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.keys(result.operations.fieldMetadata?.flatEntityToCreate ?? {}),
    ).toHaveLength(7);
  });
});
