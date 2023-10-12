import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
} from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { mapColumnTypeToGraphQLType } from 'src/tenant/schema-builder/utils/map-column-type-to-graphql-type.util';

describe('mapColumnTypeToGraphQLType', () => {
  test('should map uuid to GraphQLID', () => {
    const column = new FieldMetadata();
    column.type = 'uuid';
    expect(mapColumnTypeToGraphQLType(column)).toBe(GraphQLID);
  });

  test('should map text, phone, email, and date to GraphQLString', () => {
    const types = ['text', 'phone', 'email', 'date'];
    types.forEach((type) => {
      const column = new FieldMetadata();
      column.type = type;
      expect(mapColumnTypeToGraphQLType(column)).toBe(GraphQLString);
    });
  });

  test('should map boolean to GraphQLBoolean', () => {
    const column = new FieldMetadata();
    column.type = 'boolean';
    expect(mapColumnTypeToGraphQLType(column)).toBe(GraphQLBoolean);
  });

  test('should map number to GraphQLInt', () => {
    const column = new FieldMetadata();
    column.type = 'number';
    expect(mapColumnTypeToGraphQLType(column)).toBe(GraphQLInt);
  });

  test('should create a GraphQLEnumType for enum fields', () => {
    const column = new FieldMetadata();
    column.type = 'enum';
    column.displayName = 'Status';
    column.enums = ['ACTIVE', 'INACTIVE'];
    const result = mapColumnTypeToGraphQLType(column);

    if (result instanceof GraphQLEnumType) {
      expect(result.name).toBe('StatusEnum');

      const values = result.getValues().map((value) => value.value);
      expect(values).toContain('ACTIVE');
      expect(values).toContain('INACTIVE');
    } else {
      fail('Result is not an instance of GraphQLEnumType');
    }
  });

  test('should map url to UrlObjectType or UrlInputType based on input flag', () => {
    const column = new FieldMetadata();
    column.type = 'url';
    expect(mapColumnTypeToGraphQLType(column, false).name).toBe('Url');
    expect(mapColumnTypeToGraphQLType(column, true).name).toBe('UrlInput');
  });

  test('should map money to MoneyObjectType or MoneyInputType based on input flag', () => {
    const column = new FieldMetadata();
    column.type = 'money';
    expect(mapColumnTypeToGraphQLType(column, false).name).toBe('Money');
    expect(mapColumnTypeToGraphQLType(column, true).name).toBe('MoneyInput');
  });

  test('should default to GraphQLString for unknown types', () => {
    const column = new FieldMetadata();
    column.type = 'unknown';
    expect(mapColumnTypeToGraphQLType(column)).toBe(GraphQLString);
  });
});
