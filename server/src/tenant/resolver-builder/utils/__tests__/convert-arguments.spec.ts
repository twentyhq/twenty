import { FieldMetadataTargetColumnMap } from 'src/tenant/schema-builder/interfaces/field-metadata-target-column-map.interface';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/database/typeorm/metadata/entities/field-metadata.entity';
import { convertArguments } from 'src/tenant/resolver-builder/utils/convert-arguments.util';

describe('convertArguments', () => {
  let fields;

  beforeEach(() => {
    fields = [
      {
        name: 'firstName',
        targetColumnMap: {
          value: 'column_1randomFirstNameKey',
        } as FieldMetadataTargetColumnMap,
        type: FieldMetadataType.TEXT,
      },
      {
        name: 'age',
        targetColumnMap: {
          value: 'column_randomAgeKey',
        } as FieldMetadataTargetColumnMap,
        type: FieldMetadataType.TEXT,
      },
      {
        name: 'website',
        targetColumnMap: {
          link: 'column_randomLinkKey',
          text: 'column_randomTex7Key',
        } as FieldMetadataTargetColumnMap,
        type: FieldMetadataType.URL,
      },
    ] as FieldMetadataEntity[];
  });

  test('should handle non-array arguments', () => {
    const args = { firstName: 'John', age: 30 };
    const expected = {
      column_1randomFirstNameKey: 'John',
      column_randomAgeKey: 30,
    };
    expect(convertArguments(args, fields)).toEqual(expected);
  });

  test('should handle array arguments', () => {
    const args = [{ firstName: 'John' }, { firstName: 'Jane' }];
    const expected = [
      { column_1randomFirstNameKey: 'John' },
      { column_1randomFirstNameKey: 'Jane' },
    ];
    expect(convertArguments(args, fields)).toEqual(expected);
  });

  test('should handle nested object arguments', () => {
    const args = { website: { link: 'https://www.google.fr', text: 'google' } };
    const expected = {
      column_randomLinkKey: 'https://www.google.fr',
      column_randomTex7Key: 'google',
    };
    expect(convertArguments(args, fields)).toEqual(expected);
  });

  test('should ignore fields not in the field metadata', () => {
    const args = { firstName: 'John', lastName: 'Doe' };
    const expected = { column_1randomFirstNameKey: 'John', lastName: 'Doe' };
    expect(convertArguments(args, fields)).toEqual(expected);
  });

  test('should handle deeper nested object arguments', () => {
    const args = {
      user: {
        details: {
          firstName: 'John',
          website: { link: 'https://www.example.com', text: 'example' },
        },
      },
    };
    const expected = {
      user: {
        details: {
          column_1randomFirstNameKey: 'John',
          column_randomLinkKey: 'https://www.example.com',
          column_randomTex7Key: 'example',
        },
      },
    };
    expect(convertArguments(args, fields)).toEqual(expected);
  });
});
