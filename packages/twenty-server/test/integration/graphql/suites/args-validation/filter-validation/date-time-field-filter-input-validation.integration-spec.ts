// import { failingFilterInputByFieldMetadataType } from 'test/integration/graphql/suites/args-validation/filter-validation/constants/failing-filter-input-by-field-metadata-type.constant';
// import { successfulFilterInputByFieldMetadataType } from 'test/integration/graphql/suites/args-validation/filter-validation/constants/successful-filter-input-by-field-metadata-type.constant';
// import { testGqlFailingScenario } from 'test/integration/graphql/suites/args-validation/filter-validation/utils/test-gql-failing-scenario.util';
// import { testGqlSuccessfulScenario } from 'test/integration/graphql/suites/args-validation/filter-validation/utils/test-gql-successful-scenario.util';
// import { testRestFailingScenario } from 'test/integration/graphql/suites/args-validation/filter-validation/utils/test-rest-failing-scenario.util';
// import { testRestSuccessfulScenario } from 'test/integration/graphql/suites/args-validation/filter-validation/utils/test-rest-successful-scenario.util';
// import { destroyManyObjectsMetadata } from 'test/integration/graphql/suites/args-validation/utils/destroy-many-objects-metadata';
// import { setupTestObjectsWithAllFieldTypes } from 'test/integration/graphql/suites/args-validation/utils/setup-test-objects-with-all-field-types.util';
// import { FieldMetadataType } from 'twenty-shared/types';

// const FIELD_METADATA_TYPE = FieldMetadataType.DATE_TIME;
// const failingTestCases =
//   failingFilterInputByFieldMetadataType[FIELD_METADATA_TYPE];
// const successfulTestCases =
//   successfulFilterInputByFieldMetadataType[FIELD_METADATA_TYPE];

// describe(`Filter args validation - ${FIELD_METADATA_TYPE}`, () => {
//   let objectMetadataId: string;
//   let objectMetadataSingularName: string;
//   let objectMetadataPluralName: string;
//   let targetObjectMetadataId: string;

//   beforeAll(async () => {
//     const setupTest = await setupTestObjectsWithAllFieldTypes();

//     objectMetadataId = setupTest.objectMetadataId;
//     objectMetadataSingularName = setupTest.objectMetadataSingularName;
//     objectMetadataPluralName = setupTest.objectMetadataPluralName;
//     targetObjectMetadataId = setupTest.targetObjectMetadataId;
//   });

//   afterAll(async () => {
//     await destroyManyObjectsMetadata([
//       objectMetadataId,
//       targetObjectMetadataId,
//     ]);
//   });

//   describe('Gql filterInput - failure', () => {
//     it.each(
//       failingTestCases.map((testCase) => ({
//         ...testCase,
//         stringifiedFilter: JSON.stringify(testCase.gqlFilterInput),
//       })),
//     )(
//       `${FIELD_METADATA_TYPE} field type - should fail with filter : $stringifiedFilter`,
//       async ({ gqlFilterInput: filter, gqlErrorMessage: errorMessage }) => {
//         await testGqlFailingScenario(
//           objectMetadataSingularName,
//           objectMetadataPluralName,
//           filter,
//           errorMessage,
//         );
//       },
//     );
//   });

//   // TODO : Refacto-common - Uncomment this
//   describe('Rest filterInput - failure', () => {
//     it.each(
//       failingTestCases.map((testCase) => ({
//         ...testCase,
//         stringifiedFilter: JSON.stringify(testCase.restFilterInput),
//       })),
//     )(
//       `${FIELD_METADATA_TYPE} field type - should fail with filter : $stringifiedFilter`,
//       async ({ restFilterInput: filter, restErrorMessage: errorMessage }) => {
//         await testRestFailingScenario(
//           objectMetadataPluralName,
//           filter,
//           errorMessage,
//         );
//       },
//     );
//   });

//   describe('Gql filterInput - success', () => {
//     it.each(
//       successfulTestCases.map((testCase) => ({
//         ...testCase,
//         stringifiedFilter: JSON.stringify(testCase.gqlFilterInput),
//       })),
//     )(
//       `${FIELD_METADATA_TYPE} field type - should succeed with filter : $stringifiedFilter`,
//       async ({ gqlFilterInput: filter, validateFilter }) => {
//         await testGqlSuccessfulScenario(
//           objectMetadataSingularName,
//           objectMetadataPluralName,
//           filter,
//           validateFilter,
//         );
//       },
//     );
//   });

//   describe('Rest filterInput - success', () => {
//     it.each(
//       successfulTestCases.map((testCase) => ({
//         ...testCase,
//         stringifiedFilter: JSON.stringify(testCase.restFilterInput),
//       })),
//     )(
//       `${FIELD_METADATA_TYPE} field type - should succeed with filter : $stringifiedFilter`,
//       async ({ restFilterInput, validateFilter }) => {
//         await testRestSuccessfulScenario(
//           objectMetadataPluralName,
//           restFilterInput,
//           validateFilter,
//         );
//       },
//     );
//   });
// });
