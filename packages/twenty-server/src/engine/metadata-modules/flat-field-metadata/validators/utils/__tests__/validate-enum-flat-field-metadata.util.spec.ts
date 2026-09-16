import {
  FieldMetadataType,
  type EnumFieldMetadataType,
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

const validateOptionColor = ({
  type,
  colorProperties,
  update,
}: {
  type: EnumFieldMetadataType;
  colorProperties: { color?: unknown };
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
          ...colorProperties,
        },
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
      { description: 'missing', colorProperties: {} },
      { description: 'null', colorProperties: { color: null } },
    ])('allows $description colors', ({ colorProperties }) => {
      expect(validateOptionColor({ type, colorProperties })).toEqual([]);
    });

    it('accepts a supported color', () => {
      expect(
        validateOptionColor({ type, colorProperties: { color: 'blue' } }),
      ).toEqual([]);
    });

    it.each([
      { description: 'empty', colorProperties: { color: '' } },
      { description: 'misspelled', colorProperties: { color: 'grey' } },
      { description: 'non-string', colorProperties: { color: 42 } },
    ])(
      'rejects $description colors and names the option',
      ({ colorProperties }) => {
        const errors = validateOptionColor({ type, colorProperties });

        expect(errors).toEqual([
          expect.objectContaining({
            code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
            message: expect.stringContaining(
              `Option "${OPTION_WITHOUT_COLOR.label}" color`,
            ),
            value: colorProperties.color,
          }),
        ]);
      },
    );

    it('rejects an option update that sets an unsupported color', () => {
      const optionWithUnsupportedColor = {
        ...OPTION_WITHOUT_COLOR,
        color: 'grey',
      };

      const errors = validateOptionColor({
        type,
        colorProperties: { color: 'grey' },
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
        validateOptionColor({
          type,
          colorProperties: { color: 'grey' },
          update: { label: 'Updated category' },
        }),
      ).toEqual([]);
    });
  });

  it('allows rating options without colors', () => {
    expect(
      validateOptionColor({
        type: FieldMetadataType.RATING,
        colorProperties: {},
      }),
    ).toEqual([]);
  });
});
