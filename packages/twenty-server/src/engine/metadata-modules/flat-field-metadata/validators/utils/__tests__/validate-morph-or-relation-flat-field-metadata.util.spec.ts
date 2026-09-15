import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

const CUSTOM_OBJECT_ID = '11111111-1111-4111-8111-111111111111';
const OPPORTUNITY_OBJECT_ID = '20202020-9549-49dd-b2b2-883999db8938';
const FORWARD_FIELD_ID = '22222222-2222-4222-8222-222222222222';
const REVERSE_FIELD_ID = 'b642fa8b-5943-4022-ba07-300ea94fa78e';

const createObject = (
  universalIdentifier: string,
): UniversalFlatObjectMetadata =>
  ({
    universalIdentifier,
  }) as UniversalFlatObjectMetadata;

const createManyToOneField =
  (): UniversalFlatFieldMetadata<FieldMetadataType.RELATION> =>
    ({
      universalIdentifier: FORWARD_FIELD_ID,
      objectMetadataUniversalIdentifier: CUSTOM_OBJECT_ID,
      type: FieldMetadataType.RELATION,
      name: 'opportunity',
      relationTargetObjectMetadataUniversalIdentifier: OPPORTUNITY_OBJECT_ID,
      relationTargetFieldMetadataUniversalIdentifier: REVERSE_FIELD_ID,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: 'opportunityId',
      },
    }) as UniversalFlatFieldMetadata<FieldMetadataType.RELATION>;

const createReverseOneToManyField =
  (): UniversalFlatFieldMetadata<FieldMetadataType.RELATION> =>
    ({
      universalIdentifier: REVERSE_FIELD_ID,
      objectMetadataUniversalIdentifier: OPPORTUNITY_OBJECT_ID,
      type: FieldMetadataType.RELATION,
      name: 'customObjects',
      relationTargetObjectMetadataUniversalIdentifier: CUSTOM_OBJECT_ID,
      relationTargetFieldMetadataUniversalIdentifier: FORWARD_FIELD_ID,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    }) as UniversalFlatFieldMetadata<FieldMetadataType.RELATION>;

const baseArgs = {
  workspaceId: 'workspace-id',
  buildOptions: {
    isSystemBuild: false,
    applicationUniversalIdentifier: 'app-id',
  },
  additionalCacheDataMaps: {},
} as const;

describe('validateMorphOrRelationFlatFieldMetadata missing reverse (issue #25820)', () => {
  it('reports FIELD_METADATA_NOT_FOUND with the missing target identifier when the reverse field is not declared', () => {
    const errors = validateMorphOrRelationFlatFieldMetadata({
      flatEntityToValidate: createManyToOneField(),
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [CUSTOM_OBJECT_ID]: createObject(CUSTOM_OBJECT_ID),
            [OPPORTUNITY_OBJECT_ID]: createObject(OPPORTUNITY_OBJECT_ID),
          },
        },
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {},
        },
      },
      remainingFlatEntityMapsToValidate: {
        byUniversalIdentifier: {},
      },
      ...baseArgs,
    } as never);

    const missingTargetError = errors.find(
      (error) =>
        error.code === FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );

    expect(missingTargetError).toBeDefined();
    expect(missingTargetError?.value).toBe(REVERSE_FIELD_ID);
    expect(missingTargetError?.message).toContain(REVERSE_FIELD_ID);
    expect(missingTargetError?.message).toContain('bidirectional');
  });

  it('does not report FIELD_METADATA_NOT_FOUND when the reverse field is declared in the same manifest', () => {
    const errors = validateMorphOrRelationFlatFieldMetadata({
      flatEntityToValidate: createManyToOneField(),
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [CUSTOM_OBJECT_ID]: createObject(CUSTOM_OBJECT_ID),
            [OPPORTUNITY_OBJECT_ID]: createObject(OPPORTUNITY_OBJECT_ID),
          },
        },
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {},
        },
      },
      remainingFlatEntityMapsToValidate: {
        byUniversalIdentifier: {
          [REVERSE_FIELD_ID]: createReverseOneToManyField(),
        },
      },
      ...baseArgs,
    } as never);

    expect(
      errors.filter(
        (error) =>
          error.code === FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      ),
    ).toEqual([]);
  });
});
