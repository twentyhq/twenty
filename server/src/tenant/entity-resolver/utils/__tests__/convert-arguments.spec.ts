import {
  FieldMetadata,
  FieldMetadataTargetColumnMap,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { convertArguments } from 'src/tenant/entity-resolver/utils/convert-arguments.util';

describe('convertArguments', () => {
  let fields;

  beforeEach(() => {
    fields = [
      {
        displayName: 'firstName',
        targetColumnMap: {
          value: 'column_1randomFirstNameKey',
        } as FieldMetadataTargetColumnMap,
        type: 'text',
      },
      {
        displayName: 'age',
        targetColumnMap: {
          value: 'column_randomAgeKey',
        } as FieldMetadataTargetColumnMap,
        type: 'text',
      },
      {
        displayName: 'website',
        targetColumnMap: {
          link: 'column_randomLinkKey',
          text: 'column_randomTex7Key',
        } as FieldMetadataTargetColumnMap,
        type: 'url',
      },
    ] as FieldMetadata[];
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
});
