import {
  FieldMetadata,
  FieldMetadataTargetColumnMap,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { getFieldAliases } from 'src/tenant/entity-resolver/utils/get-fields-aliases.util';

describe('getFieldAliases', () => {
  let fields: FieldMetadata[];

  beforeEach(() => {
    // Setup sample field metadata
    fields = [
      {
        nameSingular: 'singleValueField',
        namePlural: 'singleValueFields',
        targetColumnMap: {
          value: 'column_singleValue',
        } as FieldMetadataTargetColumnMap,
      },
      {
        nameSingular: 'multipleValuesField',
        namePlural: 'multipleValuesFields',
        targetColumnMap: {
          link: 'column_value1',
          text: 'column_value2',
        } as FieldMetadataTargetColumnMap,
      },
    ] as FieldMetadata[];
  });

  test('should return correct aliases for fields with a single value in targetColumnMap', () => {
    const aliases = getFieldAliases(fields);
    expect(aliases).toHaveProperty('singleValueField', 'column_singleValue');
  });

  test('should return correct aliases for fields with multiple values in targetColumnMap', () => {
    const aliases = getFieldAliases(fields);
    expect(aliases).toHaveProperty('column_value1', 'column_value1');
  });

  test('should handle empty fields array', () => {
    const aliases = getFieldAliases([]);
    expect(aliases).toEqual({});
  });

  test('should not create aliases for fields without targetColumnMap values', () => {
    const fieldsWithEmptyMap = [
      ...fields,
      {
        nameSingular: 'emptyField',
        namePlural: 'emptyFields',
        targetColumnMap: {} as FieldMetadataTargetColumnMap,
      },
    ] as FieldMetadata[];
    const aliases = getFieldAliases(fieldsWithEmptyMap);
    expect(aliases).not.toHaveProperty('emptyField');
  });
});
