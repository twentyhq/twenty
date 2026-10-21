import {
  FieldMetadataType,
  type EnumFieldMetadataType,
  type FieldMetadataDefaultOption,
} from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { validateEnumSelectFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-enum-flat-field-metadata.util';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';

const OPTION_WITHOUT_COLOR = {
  id: '2c73ce21-d19f-4b37-935e-48c351e2bb1b',
  label: 'Car Repairs and Servicing',
  value: 'CAR_REPAIRS_AND_SERVICING',
  position: 0,
};

const validateOption = ({
  type,
  optionProperties,
  update,
}: {
  type: EnumFieldMetadataType;
  optionProperties: { color?: unknown; description?: unknown };
  update?: FlatFieldMetadataTypeValidationArgs<EnumFieldMetadataType>['update'];
}) => {
  const flatFieldMetadata = getFlatFieldMetadataMock({
    type,
    universalIdentifier: 'ab0e6d76-67d8-466f-918a-4b8a8d044131',
    objectMetadataId: '6450cd8f-c202-498f-8be4-65e1b1c93e32',
  });

  return validateEnumSelectFlatFieldMetadata({
    update,
    flatEntityToValidate: {
      ...flatFieldMetadata,
      type,
      defaultValue: null,
      morphId: null,
      relationTargetFieldMetadataUniversalIdentifier: null,
      relationTargetObjectMetadataUniversalIdentifier: null,
      universalSettings: null,
      options: [
        {
          ...OPTION_WITHOUT_COLOR,
          ...optionProperties,
        } as FieldMetadataDefaultOption,
      ],
    },
    additionalCacheDataMaps: {
      featureFlagsMap:
        {} as WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'],
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps:
      createEmptyAllFlatEntityMaps(),
    remainingFlatEntityMapsToValidate: { byUniversalIdentifier: {} },
    workspaceId: flatFieldMetadata.workspaceId,
    buildOptions: {
      isSystemBuild: false,
      applicationUniversalIdentifier:
        flatFieldMetadata.applicationUniversalIdentifier,
    },
  });
};

describe('validateEnumSelectFlatFieldMetadata', () => {
  describe.each([
    FieldMetadataType.SELECT,
    FieldMetadataType.MULTI_SELECT,
  ] as const)('%s option colors', (type) => {
    it.each([
      { description: 'missing', optionProperties: {} },
      { description: 'null', optionProperties: { color: null } },
    ])('allows $description colors', ({ optionProperties }) => {
      expect(validateOption({ type, optionProperties })).toEqual([]);
    });

    it('accepts a supported color', () => {
      expect(
        validateOption({ type, optionProperties: { color: 'blue' } }),
      ).toEqual([]);
    });

    it.each([
      { description: 'empty', optionProperties: { color: '' } },
      { description: 'misspelled', optionProperties: { color: 'grey' } },
      { description: 'non-string', optionProperties: { color: 42 } },
    ])(
      'rejects $description colors and names the option',
      ({ optionProperties }) => {
        const errors = validateOption({ type, optionProperties });

        expect(errors).toEqual([
          expect.objectContaining({
            code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
            message: expect.stringContaining(
              `Option "${OPTION_WITHOUT_COLOR.label}" color`,
            ),
            value: optionProperties.color,
          }),
        ]);
      },
    );

    it('rejects an option update that sets an unsupported color', () => {
      const optionWithUnsupportedColor = {
        ...OPTION_WITHOUT_COLOR,
        color: 'grey',
      };

      const errors = validateOption({
        type,
        optionProperties: { color: 'grey' },
        update: { options: [optionWithUnsupportedColor] },
      });

      expect(errors).toEqual([
        expect.objectContaining({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          value: 'grey',
        }),
      ]);
    });

    it('allows unrelated updates to fields with an existing unsupported color', () => {
      expect(
        validateOption({
          type,
          optionProperties: { color: 'grey' },
          update: { label: 'Updated category' },
        }),
      ).toEqual([]);
    });
  });

  describe.each([
    FieldMetadataType.SELECT,
    FieldMetadataType.MULTI_SELECT,
  ] as const)('%s option descriptions', (type) => {
    it.each([
      { case: 'missing', optionProperties: { color: 'blue' } },
      {
        case: 'null',
        optionProperties: { color: 'blue', description: null },
      },
      {
        case: 'filled',
        optionProperties: {
          color: 'blue',
          description: 'Pricing sent, waiting for a signature',
        },
      },
    ])('allows $case descriptions', ({ optionProperties }) => {
      expect(validateOption({ type, optionProperties })).toEqual([]);
    });

    it.each([
      {
        case: 'non-string',
        optionProperties: { color: 'blue', description: 42 },
      },
      {
        case: 'too long',
        optionProperties: { color: 'blue', description: 'a'.repeat(256) },
      },
    ])('rejects $case descriptions', ({ optionProperties }) => {
      expect(validateOption({ type, optionProperties })).toEqual([
        expect.objectContaining({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          value: optionProperties.description,
        }),
      ]);
    });
  });

  it('allows rating options without colors', () => {
    expect(
      validateOption({
        type: FieldMetadataType.RATING,
        optionProperties: {},
      }),
    ).toEqual([]);
  });
});
