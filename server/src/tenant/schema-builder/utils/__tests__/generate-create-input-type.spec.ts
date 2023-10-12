import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateCreateInputType } from 'src/tenant/schema-builder/utils/generate-create-input-type.util';

describe('generateCreateInputType', () => {
  test('should generate a GraphQLInputObjectType with correct name', () => {
    const columns = [];
    const name = 'testType';
    const inputType = generateCreateInputType(name, columns);
    expect(inputType).toBeInstanceOf(GraphQLInputObjectType);
    expect(inputType.name).toBe('TestTypeCreateInput');
  });

  test('should include default id field', () => {
    const columns = [];
    const name = 'testType';
    const inputType = generateCreateInputType(name, columns);
    const fields = inputType.getFields();
    expect(fields.id).toBeDefined();
    expect(fields.id.type).toBe(GraphQLID);
  });

  test('should generate fields with correct types and descriptions', () => {
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
    const inputType = generateCreateInputType(name, columns);
    const fields = inputType.getFields();

    if (fields.firstName.type instanceof GraphQLNonNull) {
      expect(fields.firstName.type.ofType).toBe(GraphQLString);
    } else {
      fail('firstName type is not an instance of GraphQLNonNull');
    }

    expect(fields.age.type).toBe(GraphQLInt);
  });
});
