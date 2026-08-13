import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateTextFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-text-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const OBJECT_UNIVERSAL_IDENTIFIER = 'object-universal-identifier';
const LABEL_FIELD_UNIVERSAL_IDENTIFIER = 'label-field-universal-identifier';
const SOURCE_FIELD_UNIVERSAL_IDENTIFIER = 'source-field-universal-identifier';

const createLabelField = (
  overrides: Partial<UniversalFlatFieldMetadata<FieldMetadataType.TEXT>> = {},
): UniversalFlatFieldMetadata<FieldMetadataType.TEXT> =>
  ({
    type: FieldMetadataType.TEXT,
    name: 'name',
    universalIdentifier: LABEL_FIELD_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    universalSettings: {
      labelIdentifierFormula: {
        template: '{0}',
        fieldReferences: [
          {
            fieldMetadataUniversalIdentifiers: [
              SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
            ],
          },
        ],
      },
    },
    ...overrides,
  }) as UniversalFlatFieldMetadata<FieldMetadataType.TEXT>;

const callValidator = ({
  labelField = createLabelField(),
  sourceField = {
    type: FieldMetadataType.SELECT,
    name: 'cohort',
    universalIdentifier: SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  },
  labelIdentifierFieldMetadataUniversalIdentifier = LABEL_FIELD_UNIVERSAL_IDENTIFIER,
}: {
  labelField?: UniversalFlatFieldMetadata<FieldMetadataType.TEXT>;
  sourceField?: Record<string, unknown>;
  labelIdentifierFieldMetadataUniversalIdentifier?: string;
} = {}) =>
  validateTextFlatFieldMetadata({
    flatEntityToValidate: labelField,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldMetadataMaps: {
        byUniversalIdentifier: {
          [LABEL_FIELD_UNIVERSAL_IDENTIFIER]: labelField,
          [SOURCE_FIELD_UNIVERSAL_IDENTIFIER]: sourceField,
        },
      },
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [OBJECT_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            labelIdentifierFieldMetadataUniversalIdentifier,
          },
        },
      },
    },
  } as unknown as Parameters<typeof validateTextFlatFieldMetadata>[0]);

const stripUserFriendlyMessage = (errors: FlatFieldMetadataValidationError[]) =>
  errors.map(({ userFriendlyMessage: _, ...rest }) => rest);

describe('validateTextFlatFieldMetadata', () => {
  it('accepts a valid record label formula', () => {
    expect(callValidator()).toEqual([]);
  });

  it('rejects formulas on text fields that are not the record label', () => {
    expect(
      stripUserFriendlyMessage(
        callValidator({
          labelIdentifierFieldMetadataUniversalIdentifier: 'another-field',
        }),
      ),
    ).toEqual([
      {
        code: 'INVALID_FIELD_INPUT',
        message:
          'Only the label identifier field can define a record label formula',
      },
    ]);
  });

  it('rejects one-to-many relation references', () => {
    expect(
      stripUserFriendlyMessage(
        callValidator({
          sourceField: {
            type: FieldMetadataType.RELATION,
            name: 'fellows',
            universalIdentifier: SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
            objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            relationTargetObjectMetadataUniversalIdentifier:
              'person-object-universal-identifier',
            universalSettings: {
              relationType: RelationType.ONE_TO_MANY,
            },
          },
        }),
      ),
    ).toEqual([
      {
        code: 'INVALID_FIELD_INPUT',
        message: 'Relation field fellows must be many-to-one',
      },
    ]);
  });
});
