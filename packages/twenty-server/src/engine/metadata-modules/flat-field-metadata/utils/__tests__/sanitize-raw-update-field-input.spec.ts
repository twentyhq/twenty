import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
  type TagColor,
} from 'twenty-shared/types';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { sanitizeRawUpdateFieldInput } from 'src/engine/metadata-modules/flat-field-metadata/utils/sanitize-raw-update-field-input';

const FIELD_ID = 'a1b3c5d7-0000-4000-8000-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-aaaa-4aaa-8aaa-000000000001';

const sanitizeOptionsUpdate = ({
  type,
  options,
}: {
  type: FieldMetadataType;
  options: UpdateFieldInput['options'];
}) =>
  sanitizeRawUpdateFieldInput({
    existingFlatFieldMetadata: getFlatFieldMetadataMock({
      id: FIELD_ID,
      type,
      universalIdentifier: 'ab0e6d76-67d8-466f-918a-4b8a8d044131',
      objectMetadataId: '6450cd8f-c202-498f-8be4-65e1b1c93e32',
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    }),
    rawUpdateFieldInput: { id: FIELD_ID, options } as UpdateFieldInput,
    isSystemBuild: false,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  }).updatedEditableFieldProperties.options;

describe('sanitizeRawUpdateFieldInput', () => {
  it.each([FieldMetadataType.SELECT, FieldMetadataType.MULTI_SELECT])(
    'defaults missing %s option colors and trims provided ones',
    (type) => {
      expect(
        sanitizeOptionsUpdate({
          type,
          options: [
            {
              id: '2c73ce21-d19f-4b37-935e-48c351e2bb1b',
              label: 'Open',
              value: 'OPEN',
              position: 0,
            },
            {
              id: '5b0b1a8e-5b53-4c3e-9d6a-7c1f3d2a9e10',
              label: 'Closed',
              value: 'CLOSED',
              position: 1,
              color: '  blue  ' as TagColor,
            },
          ] as FieldMetadataComplexOption[],
        }),
      ).toEqual([
        {
          id: '2c73ce21-d19f-4b37-935e-48c351e2bb1b',
          label: 'Open',
          value: 'OPEN',
          position: 0,
          color: 'gray',
        },
        {
          id: '5b0b1a8e-5b53-4c3e-9d6a-7c1f3d2a9e10',
          label: 'Closed',
          value: 'CLOSED',
          position: 1,
          color: 'blue',
        },
      ]);
    },
  );

  it('leaves rating options without colors', () => {
    const ratingOptions = [
      {
        id: '2c73ce21-d19f-4b37-935e-48c351e2bb1b',
        label: '1',
        value: 'RATING_1',
        position: 0,
      },
    ];

    expect(
      sanitizeOptionsUpdate({
        type: FieldMetadataType.RATING,
        options: ratingOptions,
      }),
    ).toEqual(ratingOptions);
  });

  describe('option label translations', () => {
    const WEEK_OPTION_ID = '9a1c1f5e-0b7e-4c43-8f3a-1b8f0f0c0a01';
    const MONTH_OPTION_ID = '9a1c1f5e-0b7e-4c43-8f3a-1b8f0f0c0a02';
    const weekLabelProperty = `options.${WEEK_OPTION_ID}.label`;
    const monthLabelProperty = `options.${MONTH_OPTION_ID}.label`;
    const existingOptions = [
      {
        id: WEEK_OPTION_ID,
        label: 'Неделя',
        value: 'WEEK',
        position: 0,
        color: 'blue',
      },
      {
        id: MONTH_OPTION_ID,
        label: 'Месяц',
        value: 'MONTH',
        position: 1,
        color: 'green',
      },
    ] as FieldMetadataComplexOption[];

    const sanitizeTranslationsUpdate = ({
      type = FieldMetadataType.SELECT,
      rawUpdateFieldInput,
      overrides = null,
    }: {
      type?: FieldMetadataType;
      rawUpdateFieldInput: Partial<UpdateFieldInput>;
      overrides?: unknown;
    }) =>
      sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: getFlatFieldMetadataMock({
          id: FIELD_ID,
          type,
          options: existingOptions,
          overrides,
          universalIdentifier: 'ab0e6d76-67d8-466f-918a-4b8a8d044131',
          objectMetadataId: '6450cd8f-c202-498f-8be4-65e1b1c93e32',
          applicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        } as Parameters<typeof getFlatFieldMetadataMock>[0]),
        rawUpdateFieldInput: {
          id: FIELD_ID,
          ...rawUpdateFieldInput,
        } as UpdateFieldInput,
        isSystemBuild: false,
        workspaceCustomApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      });

    it('stores a translation of an existing option label', () => {
      expect(
        sanitizeTranslationsUpdate({
          rawUpdateFieldInput: {
            translations: [
              { locale: 'en', property: weekLabelProperty, value: 'Week' },
            ],
          },
        }).overrides,
      ).toEqual({
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          translations: { en: { [weekLabelProperty]: 'Week' } },
        },
      });
    });

    it('rejects a translation of an unknown option', () => {
      expect(() =>
        sanitizeTranslationsUpdate({
          rawUpdateFieldInput: {
            translations: [
              {
                locale: 'en',
                property: 'options.unknown-option-id.label',
                value: 'Week',
              },
            ],
          },
        }),
      ).toThrow('Cannot translate field metadata properties');
    });

    it('rejects option label translations on non-select fields', () => {
      expect(() =>
        sanitizeTranslationsUpdate({
          type: FieldMetadataType.RATING,
          rawUpdateFieldInput: {
            translations: [
              { locale: 'en', property: weekLabelProperty, value: 'Week' },
            ],
          },
        }),
      ).toThrow('Cannot translate field metadata properties');
    });

    it('drops translations of removed options', () => {
      expect(
        sanitizeTranslationsUpdate({
          rawUpdateFieldInput: { options: [existingOptions[0]] },
          overrides: {
            [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
              translations: {
                en: {
                  label: 'Budget period',
                  [weekLabelProperty]: 'Week',
                  [monthLabelProperty]: 'Month',
                },
                'fr-FR': { [monthLabelProperty]: 'Mois' },
              },
            },
          },
        }).overrides,
      ).toEqual({
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          translations: {
            en: { label: 'Budget period', [weekLabelProperty]: 'Week' },
          },
        },
      });
    });
  });
});
