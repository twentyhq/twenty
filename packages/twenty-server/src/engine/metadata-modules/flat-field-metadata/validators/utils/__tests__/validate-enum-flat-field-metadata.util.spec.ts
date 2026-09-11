import {
  FieldMetadataType,
  type EnumFieldMetadataType,
} from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
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
  update?: Parameters<typeof validateEnumSelectFlatFieldMetadata>[0]['update'];
}) =>
  validateEnumSelectFlatFieldMetadata({
    update,
    flatEntityToValidate: {
      type,
      defaultValue: null,
      options: [
        {
          ...OPTION_WITHOUT_COLOR,
          ...colorProperties,
        },
      ],
    },
  } as Parameters<typeof validateEnumSelectFlatFieldMetadata>[0]);

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

    it('accepts a supported color', () => {
      expect(
        validateOptionColor({ type, colorProperties: { color: 'green' } }),
      ).toEqual([]);
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
