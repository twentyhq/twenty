import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLString,
} from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateUpdateInputType } from 'src/tenant/schema-builder/utils/generate-update-input-type.util';

describe('generateUpdateInputType', () => {
  test('should generate a GraphQLInputObjectType with correct name', () => {
    const columns = [];
    const name = 'testType';
    const inputType = generateUpdateInputType(name, columns);
    expect(inputType).toBeInstanceOf(GraphQLInputObjectType);
    expect(inputType.name).toBe('TestTypeUpdateInput');
  });

  test('should include default id field', () => {
    const columns = [];
    const name = 'testType';
    const inputType = generateUpdateInputType(name, columns);
    const fields = inputType.getFields();
    expect(fields.id).toBeDefined();
    expect(fields.id.type).toBe(GraphQLID);
  });

  test('should generate fields with correct types and descriptions', () => {
    const columns = [
      {
        nameSingular: 'firstName',
        type: 'text',
        isNullable: true,
      },
      {
        nameSingular: 'age',
        type: 'number',
        isNullable: true,
      },
    ] as FieldMetadata[];

    const name = 'testType';
    const inputType = generateUpdateInputType(name, columns);
    const fields = inputType.getFields();

    expect(fields.firstName.type).toBe(GraphQLString);

    expect(fields.age.type).toBe(GraphQLInt);
  });
});
