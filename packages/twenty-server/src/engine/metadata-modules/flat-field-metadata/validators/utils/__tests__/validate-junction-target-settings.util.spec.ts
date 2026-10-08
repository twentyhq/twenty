import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateJunctionTargetSettings } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-junction-target-settings.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const JUNCTION_OBJECT_ID = 'junction-object-id';
const SOURCE_FIELD_ID = 'source-field-id';
const TARGET_FIELD_ID = 'target-field-id';

const createRelationField = ({
  universalIdentifier,
  type = FieldMetadataType.RELATION,
  relationType = RelationType.MANY_TO_ONE,
  morphId = null,
}: {
  universalIdentifier: string;
  type?: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
  relationType?: RelationType;
  morphId?: string | null;
}): UniversalFlatFieldMetadata =>
  ({
    universalIdentifier,
    objectMetadataUniversalIdentifier: JUNCTION_OBJECT_ID,
    type,
    morphId,
    universalSettings: { relationType },
  }) as UniversalFlatFieldMetadata;

const createJunctionField = ({
  sourceFieldUniversalIdentifier = SOURCE_FIELD_ID,
  targetFieldUniversalIdentifier = TARGET_FIELD_ID,
}: {
  sourceFieldUniversalIdentifier?: string;
  targetFieldUniversalIdentifier?: string;
} = {}): UniversalFlatFieldMetadata<FieldMetadataType.RELATION> =>
  ({
    universalIdentifier: 'junction-field-id',
    objectMetadataUniversalIdentifier: 'source-object-id',
    relationTargetObjectMetadataUniversalIdentifier: JUNCTION_OBJECT_ID,
    relationTargetFieldMetadataUniversalIdentifier:
      sourceFieldUniversalIdentifier,
    type: FieldMetadataType.RELATION,
    morphId: null,
    universalSettings: {
      relationType: RelationType.ONE_TO_MANY,
      junctionTargetFieldUniversalIdentifier: targetFieldUniversalIdentifier,
    },
  }) as UniversalFlatFieldMetadata<FieldMetadataType.RELATION>;

const createFieldMaps = (
  ...fields: UniversalFlatFieldMetadata[]
): UniversalFlatEntityMaps<UniversalFlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    fields.map((field) => [field.universalIdentifier, field]),
  ),
});

const errorMessages = (errors: FlatFieldMetadataValidationError[]) =>
  errors.map(({ message }) => message);

describe('validateJunctionTargetSettings', () => {
  it('accepts a many-to-one morph target', () => {
    const sourceField = createRelationField({
      universalIdentifier: SOURCE_FIELD_ID,
    });
    const targetField = createRelationField({
      universalIdentifier: TARGET_FIELD_ID,
      type: FieldMetadataType.MORPH_RELATION,
      morphId: 'target-morph-id',
    });

    expect(
      validateJunctionTargetSettings({
        universalFlatFieldMetadata: createJunctionField(),
        flatFieldMetadataMaps: createFieldMaps(sourceField, targetField),
      }),
    ).toEqual([]);
  });

  it('rejects a one-to-many morph target', () => {
    const targetField = createRelationField({
      universalIdentifier: TARGET_FIELD_ID,
      type: FieldMetadataType.MORPH_RELATION,
      relationType: RelationType.ONE_TO_MANY,
      morphId: 'target-morph-id',
    });

    expect(
      errorMessages(
        validateJunctionTargetSettings({
          universalFlatFieldMetadata: createJunctionField(),
          flatFieldMetadataMaps: createFieldMaps(targetField),
        }),
      ),
    ).toEqual([
      `Junction target field ${TARGET_FIELD_ID} is not a MANY_TO_ONE relation`,
    ]);
  });

  it('rejects the source field as the target', () => {
    const sourceField = createRelationField({
      universalIdentifier: SOURCE_FIELD_ID,
    });

    expect(
      errorMessages(
        validateJunctionTargetSettings({
          universalFlatFieldMetadata: createJunctionField({
            targetFieldUniversalIdentifier: SOURCE_FIELD_ID,
          }),
          flatFieldMetadataMaps: createFieldMaps(sourceField),
        }),
      ),
    ).toEqual(['Junction source and target fields must be different']);
  });

  it('rejects another member of the source morph group as the target', () => {
    const sourceField = createRelationField({
      universalIdentifier: SOURCE_FIELD_ID,
      type: FieldMetadataType.MORPH_RELATION,
      morphId: 'source-morph-id',
    });
    const targetField = createRelationField({
      universalIdentifier: TARGET_FIELD_ID,
      type: FieldMetadataType.MORPH_RELATION,
      morphId: 'source-morph-id',
    });

    expect(
      errorMessages(
        validateJunctionTargetSettings({
          universalFlatFieldMetadata: createJunctionField(),
          flatFieldMetadataMaps: createFieldMaps(sourceField, targetField),
        }),
      ),
    ).toEqual(['Junction source and target fields must be different']);
  });
});
