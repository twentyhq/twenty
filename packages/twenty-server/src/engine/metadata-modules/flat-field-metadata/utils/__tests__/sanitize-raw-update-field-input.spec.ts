import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
  type TagColor,
} from 'twenty-shared/types';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { sanitizeRawUpdateFieldInput } from 'src/engine/metadata-modules/flat-field-metadata/utils/sanitize-raw-update-field-input';

const FIELD_ID = 'a1b3c5d7-0000-4000-8000-000000000001';

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
    }),
    rawUpdateFieldInput: { id: FIELD_ID, options } as UpdateFieldInput,
    isSystemBuild: false,
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
});
