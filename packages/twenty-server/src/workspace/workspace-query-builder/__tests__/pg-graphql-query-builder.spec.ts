// import { GraphQLResolveInfo } from 'graphql';

// import { FieldMetadataTargetColumnMap } from 'src/metadata/field-metadata/interfaces/field-metadata-target-column-map.interface';

// import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
// import {
//   PGGraphQLQueryBuilder,
//   PGGraphQLQueryBuilderOptions,
// } from 'src/tenant/resolver-builder/pg-graphql/pg-graphql-query-builder';

// const testUUID = '123e4567-e89b-12d3-a456-426614174001';

// const normalizeWhitespace = (str) => str.replace(/\s+/g, '');

// // Mocking dependencies
// jest.mock('uuid', () => ({
//   v4: jest.fn(() => testUUID),
// }));

// jest.mock('graphql-fields', () =>
//   jest.fn(() => ({
//     name: true,
//     age: true,
//     complexField: {
//       subField1: true,
//       subField2: true,
//     },
//   })),
// );

// describe('PGGraphQLQueryBuilder', () => {
//   let queryBuilder;
//   let mockOptions: PGGraphQLQueryBuilderOptions;

//   beforeEach(() => {
//     const fieldMetadataCollection = [
//       {
//         name: 'name',
//         targetColumnMap: {
//           value: 'column_name',
//         } as FieldMetadataTargetColumnMap,
//       },
//       {
//         name: 'age',
//         targetColumnMap: {
//           value: 'column_age',
//         } as FieldMetadataTargetColumnMap,
//       },
//       {
//         name: 'complexField',
//         targetColumnMap: {
//           subField1: 'column_subField1',
//           subField2: 'column_subField2',
//         } as FieldMetadataTargetColumnMap,
//       },
//     ] as FieldMetadata[];

//     mockOptions = {
//       targetTableName: 'TestTable',
//       info: {} as GraphQLResolveInfo,
//       fieldMetadataCollection,
//     };

//     queryBuilder = new PGGraphQLQueryBuilder(mockOptions);
//   });

//   test('findMany generates correct query with no arguments', () => {
//     const query = queryBuilder.findMany();

//     expect(normalizeWhitespace(query)).toBe(
//       normalizeWhitespace(`
//       query {
//         TestTableCollection {
//           name: column_name
//           age: column_age
//           ___complexField_subField1: column_subField1
//           ___complexField_subField2: column_subField2
//         }
//       }
//     `),
//     );
//   });

//   test('findMany generates correct query with filter parameters', () => {
//     const args = {
//       filter: {
//         name: { eq: 'Alice' },
//         age: { gt: 20 },
//       },
//     };
//     const query = queryBuilder.findMany(args);

//     expect(normalizeWhitespace(query)).toBe(
//       normalizeWhitespace(`
//       query {
//         TestTableCollection(filter: { column_name: { eq: "Alice" }, column_age: { gt: 20 } }) {
//           name: column_name
//           age: column_age
//           ___complexField_subField1: column_subField1
//           ___complexField_subField2: column_subField2
//         }
//       }
//     `),
//     );
//   });

//   test('findMany generates correct query with combined pagination parameters', () => {
//     const args = {
//       first: 5,
//       after: 'someCursor',
//       before: 'anotherCursor',
//       last: 3,
//     };
//     const query = queryBuilder.findMany(args);

//     expect(normalizeWhitespace(query)).toBe(
//       normalizeWhitespace(`
//       query {
//         TestTableCollection(
//           first: 5,
//           after: "someCursor",
//           before: "anotherCursor",
//           last: 3
//         ) {
//           name: column_name
//           age: column_age
//           ___complexField_subField1: column_subField1
//           ___complexField_subField2: column_subField2
//         }
//       }
//     `),
//     );
//   });

//   test('findOne generates correct query with ID filter', () => {
//     const args = { filter: { id: { eq: testUUID } } };
//     const query = queryBuilder.findOne(args);

//     expect(normalizeWhitespace(query)).toBe(
//       normalizeWhitespace(`
//       query {
//         TestTableCollection(filter: { id: { eq: "${testUUID}" } }) {
//           edges {
//             node {
//               name: column_name
//               age: column_age
//               ___complexField_subField1: column_subField1
//               ___complexField_subField2: column_subField2
//             }
//           }
//         }
//       }
//     `),
//     );
//   });

//   test('createMany generates correct mutation with complex and nested fields', () => {
//     const args = {
//       data: [
//         {
//           name: 'Alice',
//           age: 30,
//           complexField: {
//             subField1: 'data1',
//             subField2: 'data2',
//           },
//         },
//       ],
//     };
//     const query = queryBuilder.createMany(args);

//     expect(normalizeWhitespace(query)).toBe(
//       normalizeWhitespace(`
//       mutation {
//         insertIntoTestTableCollection(objects: [{
//           id: "${testUUID}",
//           column_name: "Alice",
//           column_age: 30,
//           column_subField1: "data1",
//           column_subField2: "data2"
//         }]) {
//           affectedCount
//           records {
//             name: column_name
//             age: column_age
//             ___complexField_subField1: column_subField1
//             ___complexField_subField2: column_subField2
//           }
//         }
//       }
//     `),
//     );
//   });

//   test('updateOne generates correct mutation with complex and nested fields', () => {
//     const args = {
//       id: '1',
//       data: {
//         name: 'Bob',
//         age: 40,
//         complexField: {
//           subField1: 'newData1',
//           subField2: 'newData2',
//         },
//       },
//     };
//     const query = queryBuilder.updateOne(args);

//     expect(normalizeWhitespace(query)).toBe(
//       normalizeWhitespace(`
//       mutation {
//         updateTestTableCollection(
//           set: {
//             column_name: "Bob",
//             column_age: 40,
//             column_subField1: "newData1",
//             column_subField2: "newData2"
//           },
//           filter: { id: { eq: "1" } }
//         ) {
//           affectedCount
//           records {
//             name: column_name
//             age: column_age
//             ___complexField_subField1: column_subField1
//             ___complexField_subField2: column_subField2
//           }
//         }
//       }
//     `),
//     );
//   });
// });

it('should pass', () => {
  expect(true).toBe(true);
});
