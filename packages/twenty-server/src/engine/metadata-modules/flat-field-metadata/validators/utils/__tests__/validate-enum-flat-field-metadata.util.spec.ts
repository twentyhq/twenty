import { TAG_COLORS } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type EnumFieldMetadataType,
} from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { validateEnumSelectFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-enum-flat-field-metadata.util';

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
      featureFlagsMap: {
        IS_APP_CLAIMING_ENABLED: false,
        IS_UNIQUE_INDEXES_ENABLED: false,
        IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED: false,
        IS_JSON_FILTER_ENABLED: false,
        IS_EMAIL_GROUP_ENABLED: false,
        IS_JUNCTION_RELATIONS_ENABLED: false,
        IS_REST_METADATA_API_NEW_FORMAT_DIRECT: false,
        IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED: false,
        IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED: false,
        IS_API_RATE_LIMIT_V2_ENABLED: false,
        IS_MESSAGE_CALENDAR_TARGET_READ_ENABLED: false,
        IS_QUOTA_ENGINE_CREDIT_BOUND_ENABLED: false,
        IS_RECORD_CREATION_FORM_ENABLED: false,
        IS_RECORD_SHARING_ENABLED: false,
        IS_WEBHOOK_RATE_LIMIT_ENABLED: false,
      },
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
      { description: 'empty', colorProperties: { color: '' } },
      {
        description: 'unsupported',
        colorProperties: { color: 'unsupported-color' },
      },
      { description: 'non-string', colorProperties: { color: 42 } },
    ])('rejects $description colors', ({ colorProperties }) => {
      const errors = validateOptionColor({ type, colorProperties });

      expect(errors).toEqual([
        expect.objectContaining({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: expect.stringContaining('color'),
        }),
      ]);
    });

    it('accepts every supported color', () => {
      const errors = TAG_COLORS.flatMap((color) =>
        validateOptionColor({ type, colorProperties: { color } }),
      );

      expect(errors).toEqual([]);
    });

    it('rejects an option update that removes its color', () => {
      const errors = validateOptionColor({
        type,
        colorProperties: {},
        update: { options: [OPTION_WITHOUT_COLOR] },
      });

      expect(errors).toEqual([
        expect.objectContaining({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: 'Option color is required',
        }),
      ]);
    });

    it('allows unrelated updates to fields with existing missing colors', () => {
      expect(
        validateOptionColor({
          type,
          colorProperties: {},
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
