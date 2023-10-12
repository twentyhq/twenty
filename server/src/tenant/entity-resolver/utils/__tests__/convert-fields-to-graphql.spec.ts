import {
  FieldMetadata,
  FieldMetadataTargetColumnMap,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { convertFieldsToGraphQL } from 'src/tenant/entity-resolver/utils/convert-fields-to-graphql.util';

const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();

describe('convertFieldsToGraphQL', () => {
  let fields;

  beforeEach(() => {
    fields = [
      {
        displayName: 'simpleField',
        targetColumnMap: {
          value: 'column_RANDOMSTRING1',
        } as FieldMetadataTargetColumnMap,
      },
      {
        displayName: 'complexField',
        targetColumnMap: {
          link: 'column_RANDOMSTRING2',
          text: 'column_RANDOMSTRING3',
        } as FieldMetadataTargetColumnMap,
      },
    ] as FieldMetadata[];
  });

  test('should handle simple fields correctly', () => {
    const select = { simpleField: true };
    const result = convertFieldsToGraphQL(select, fields);
    const expected = 'simpleField: column_RANDOMSTRING1\n';
    expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expected));
  });

  test('should handle complex fields with multiple values correctly', () => {
    const select = { complexField: true };
    const result = convertFieldsToGraphQL(select, fields);
    const expected = `
      ___complexField_link: column_RANDOMSTRING2
      ___complexField_text: column_RANDOMSTRING3
    `;
    expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expected));
  });

  test('should handle fields not in the field metadata correctly', () => {
    const select = { unknownField: true };
    const result = convertFieldsToGraphQL(select, fields);
    const expected = 'unknownField\n';
    expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expected));
  });

  test('should handle nested object fields correctly', () => {
    const select = { parentField: { childField: true } };
    const result = convertFieldsToGraphQL(select, fields);
    const expected = 'parentField {\nchildField\n}\n';
    expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expected));
  });

  test('should handle nested selections with multiple levels correctly', () => {
    const select = {
      level1: {
        level2: {
          simpleField: true,
        },
      },
    };
    const result = convertFieldsToGraphQL(select, fields);
    const expected =
      'level1 {\nlevel2 {\nsimpleField: column_RANDOMSTRING1\n}\n}\n';
    expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expected));
  });

  test('should handle empty targetColumnMap gracefully', () => {
    const emptyField = {
      displayName: 'emptyField',
      targetColumnMap: {},
    } as FieldMetadata;

    fields.push(emptyField);

    const select = { emptyField: true };
    const result = convertFieldsToGraphQL(select, fields);
    const expected = 'emptyField\n';
    expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expected));
  });

  test('should use formatted targetColumnMap values with unique random parts', () => {
    const select = { simpleField: true, complexField: true };
    const result = convertFieldsToGraphQL(select, fields);
    const expected = `
      simpleField: column_RANDOMSTRING1
      ___complexField_link: column_RANDOMSTRING2
      ___complexField_text: column_RANDOMSTRING3
    `;
    expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expected));
  });
});
