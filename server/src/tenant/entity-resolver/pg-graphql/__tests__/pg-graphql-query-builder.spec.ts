import { GraphQLResolveInfo } from 'graphql';

import {
  FieldMetadata,
  FieldMetadataTargetColumnMap,
} from 'src/metadata/field-metadata/field-metadata.entity';
import {
  PGGraphQLQueryBuilder,
  PGGraphQLQueryBuilderOptions,
} from 'src/tenant/entity-resolver/pg-graphql/pg-graphql-query-builder.util';

const testUUID = '123e4567-e89b-12d3-a456-426614174001';

const normalizeWhitespace = (str) => str.replace(/\s+/g, '');

// Mocking dependencies
jest.mock('uuid', () => ({
  v4: jest.fn(() => testUUID),
}));

jest.mock('graphql-fields', () =>
  jest.fn(() => ({
    name: true,
    age: true,
    complexField: {
      subField1: true,
      subField2: true,
    },
  })),
);

describe('PGGraphQLQueryBuilder', () => {
  let queryBuilder;
  let mockOptions: PGGraphQLQueryBuilderOptions;

  beforeEach(() => {
    const fields = [
      {
        displayName: 'name',
        targetColumnMap: {
          value: 'column_name',
        } as FieldMetadataTargetColumnMap,
      },
      {
        displayName: 'age',
        targetColumnMap: {
          value: 'column_age',
        } as FieldMetadataTargetColumnMap,
      },
      {
        displayName: 'complexField',
        targetColumnMap: {
          subField1: 'column_subField1',
          subField2: 'column_subField2',
        } as FieldMetadataTargetColumnMap,
      },
    ] as FieldMetadata[];

    mockOptions = {
      tableName: 'TestTable',
      info: {} as GraphQLResolveInfo,
      fields,
    };

    queryBuilder = new PGGraphQLQueryBuilder(mockOptions);
  });

  test('findMany generates correct query with complex and nested fields', () => {
    const query = queryBuilder.findMany();
    expect(normalizeWhitespace(query)).toBe(
      normalizeWhitespace(`
      query {
        TestTableCollection {
          name: column_name
          age: column_age
          ___complexField_subField1: column_subField1
          ___complexField_subField2: column_subField2
        }
      }
    `),
    );
  });

  test('findOne generates correct query with complex and nested fields', () => {
    const args = { id: '1' };
    const query = queryBuilder.findOne(args);
    expect(normalizeWhitespace(query)).toBe(
      normalizeWhitespace(`
      query {
        TestTableCollection(filter: { id: { eq: "1" } }) {
          name: column_name
          age: column_age
          ___complexField_subField1: column_subField1
          ___complexField_subField2: column_subField2
        }
      }
    `),
    );
  });

  test('createMany generates correct mutation with complex and nested fields', () => {
    const args = {
      data: [
        {
          name: 'Alice',
          age: 30,
          complexField: {
            subField1: 'data1',
            subField2: 'data2',
          },
        },
      ],
    };
    const query = queryBuilder.createMany(args);
    expect(normalizeWhitespace(query)).toBe(
      normalizeWhitespace(`
      mutation {
        insertIntoTestTableCollection(objects: [{
          id: "${testUUID}",
          column_name: "Alice",
          column_age: 30,
          column_subField1: "data1",
          column_subField2: "data2"
        }]) {
          affectedCount
          records {
            name: column_name
            age: column_age
            ___complexField_subField1: column_subField1
            ___complexField_subField2: column_subField2
          }
        }
      }
    `),
    );
  });

  test('updateOne generates correct mutation with complex and nested fields', () => {
    const args = {
      id: '1',
      data: {
        name: 'Bob',
        age: 40,
        complexField: {
          subField1: 'newData1',
          subField2: 'newData2',
        },
      },
    };
    const query = queryBuilder.updateOne(args);
    expect(normalizeWhitespace(query)).toBe(
      normalizeWhitespace(`
      mutation {
        updateTestTableCollection(
          set: {
            column_name: "Bob",
            column_age: 40,
            column_subField1: "newData1",
            column_subField2: "newData2"
          },
          filter: { id: { eq: "1" } }
        ) {
          affectedCount
          records {
            name: column_name
            age: column_age
            ___complexField_subField1: column_subField1
            ___complexField_subField2: column_subField2
          }
        }
      }
    `),
    );
  });
});
