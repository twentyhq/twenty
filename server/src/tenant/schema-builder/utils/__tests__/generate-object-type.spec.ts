import {
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateObjectType } from 'src/tenant/schema-builder/utils/generate-object-type.util';

describe('generateObjectType', () => {
  test('should generate a GraphQLObjectType with correct name', () => {
    const columns = [];
    const name = 'testType';
    const objectType = generateObjectType(name, columns);
    expect(objectType).toBeInstanceOf(GraphQLObjectType);
    expect(objectType.name).toBe('TestType');
  });

  test('should include default fields', () => {
    const columns = [];
    const name = 'testType';
    const objectType = generateObjectType(name, columns);
    const fields = objectType.getFields();

    if (fields.id.type instanceof GraphQLNonNull) {
      expect(fields.id.type.ofType).toBe(GraphQLID);
    } else {
      fail('id.type is not an instance of GraphQLNonNull');
    }

    if (fields.createdAt.type instanceof GraphQLNonNull) {
      expect(fields.createdAt.type.ofType).toBe(GraphQLString);
    } else {
      fail('createdAt.type is not an instance of GraphQLNonNull');
    }

    if (fields.updatedAt.type instanceof GraphQLNonNull) {
      expect(fields.updatedAt.type.ofType).toBe(GraphQLString);
    } else {
      fail('updatedAt.type is not an instance of GraphQLNonNull');
    }
  });

  test('should generate fields based on provided columns', () => {
    const columns = [
      {
        displayName: 'firstName',
        type: 'text',
        isNullable: false,
      },
      {
        displayName: 'age',
        type: 'number',
        isNullable: true,
      },
    ] as FieldMetadata[];

    const name = 'testType';
    const objectType = generateObjectType(name, columns);
    const fields = objectType.getFields();

    if (fields.firstName.type instanceof GraphQLNonNull) {
      expect(fields.firstName.type.ofType).toBe(GraphQLString);
    } else {
      fail('firstName.type is not an instance of GraphQLNonNull');
    }

    expect(fields.age.type).toBe(GraphQLInt);
  });
});
