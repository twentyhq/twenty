import { getFieldUniversalIdentifier } from 'twenty-shared/application';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { ObjectSystemFieldsOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-fields-on-create-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
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

  it('should synthesize the 8 system fields plus name when the label identifier is the derived name field', () => {
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

    expect(createdUniversalIdentifiers).toHaveLength(9);
    expect(createdUniversalIdentifiers).toContain(
      NAME_FIELD_UNIVERSAL_IDENTIFIER,
    );
  });

  it('should skip the name field when the object uses a different label identifier (junction / author-declared)', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        labelIdentifierFieldMetadataUniversalIdentifier:
          getFieldUniversalIdentifier({
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            name: 'id',
          }),
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const createdUniversalIdentifiers = Object.keys(
      result.operations.fieldMetadata?.flatEntityToCreate ?? {},
    );

    expect(createdUniversalIdentifiers).toHaveLength(8);
    expect(createdUniversalIdentifiers).not.toContain(
      NAME_FIELD_UNIVERSAL_IDENTIFIER,
    );
  });

  it('should noop when every system field already exists in the workspace from-state', () => {
    const idFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      name: 'id',
    });

    const alreadyPresentByUniversalIdentifier: Record<string, unknown> = {};

    for (const name of [
      'name',
      'id',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'createdBy',
      'updatedBy',
      'position',
      'searchVector',
    ]) {
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

    expect(result.status).toBe('noop');
    expect(
      idFieldUniversalIdentifier in alreadyPresentByUniversalIdentifier,
    ).toBe(true);
  });
});
