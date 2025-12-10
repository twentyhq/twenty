import { failingFilterInputByFieldMetadataType } from 'test/integration/graphql/suites/inputs-validation/filter-validation/constants/failing-filter-input-by-field-metadata-type.constant';
import { successfulFilterInputByFieldMetadataType } from 'test/integration/graphql/suites/inputs-validation/filter-validation/constants/successful-filter-input-by-field-metadata-type.constant';
import { testGqlFailingScenario } from 'test/integration/graphql/suites/inputs-validation/filter-validation/utils/test-gql-failing-scenario.util';
import { testGqlSuccessfulScenario } from 'test/integration/graphql/suites/inputs-validation/filter-validation/utils/test-gql-successful-scenario.util';
import { testRestFailingScenario } from 'test/integration/graphql/suites/inputs-validation/filter-validation/utils/test-rest-failing-scenario.util';
import { testRestSuccessfulScenario } from 'test/integration/graphql/suites/inputs-validation/filter-validation/utils/test-rest-successful-scenario.util';
import { destroyManyObjectsMetadata } from 'test/integration/graphql/suites/inputs-validation/utils/destroy-many-objects-metadata';
import { setupTestObjectsWithAllFieldTypes } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

const FIELD_METADATA_TYPE = FieldMetadataType.UUID;
const failingTestCases =
  failingFilterInputByFieldMetadataType[FIELD_METADATA_TYPE];
const successfulTestCases =
  successfulFilterInputByFieldMetadataType[FIELD_METADATA_TYPE];

describe(`Filter input validation - ${FIELD_METADATA_TYPE}`, () => {
  let objectMetadataId: string;
  let objectMetadataSingularName: string;
  let objectMetadataPluralName: string;
  let targetObjectMetadata1Id: string;
  let targetObjectMetadata2Id: string;

  beforeAll(async () => {
    const setupTest = await setupTestObjectsWithAllFieldTypes();

    objectMetadataId = setupTest.objectMetadataId;
    objectMetadataSingularName = setupTest.objectMetadataSingularName;
    objectMetadataPluralName = setupTest.objectMetadataPluralName;
    targetObjectMetadata1Id = setupTest.targetObjectMetadata1Id;
    targetObjectMetadata2Id = setupTest.targetObjectMetadata2Id;
  });

  afterAll(async () => {
    await destroyManyObjectsMetadata([
      objectMetadataId,
      targetObjectMetadata1Id,
      targetObjectMetadata2Id,
    ]);
  });

  describe('Gql filter input - failure', () => {
    it.each(
      failingTestCases.map((testCase) => ({
        ...testCase,
        stringifiedFilter: JSON.stringify(testCase.gqlFilterInput),
      })),
    )(
      `${FIELD_METADATA_TYPE} field type - should fail with filter : $stringifiedFilter`,
      async ({ gqlFilterInput: filter, gqlErrorMessage: errorMessage }) => {
        await testGqlFailingScenario(
          objectMetadataSingularName,
          objectMetadataPluralName,
          filter,
          errorMessage,
        );
      },
    );
  });

  // TODO : Refacto-common - Uncomment this
  describe('Rest filter input - failure', () => {
    it.each(
      failingTestCases.map((testCase) => ({
        ...testCase,
        stringifiedFilter: JSON.stringify(testCase.restFilterInput),
      })),
    )(
      `${FIELD_METADATA_TYPE} field type - should fail with filter : $stringifiedFilter`,
      async ({ restFilterInput: filter, restErrorMessage: errorMessage }) => {
        await testRestFailingScenario(
          objectMetadataPluralName,
          filter,
          errorMessage,
        );
      },
    );
  });

  describe('Gql filter input - success', () => {
    it.each(
      successfulTestCases.map((testCase) => ({
        ...testCase,
        stringifiedFilter: JSON.stringify(testCase.gqlFilterInput),
      })),
    )(
      `${FIELD_METADATA_TYPE} field type - should succeed with filter : $stringifiedFilter`,
      async ({ gqlFilterInput: filter, validateFilter }) => {
        await testGqlSuccessfulScenario(
          objectMetadataSingularName,
          objectMetadataPluralName,
          filter,
          validateFilter,
        );
      },
    );
  });

  describe('Rest filter input - success', () => {
    it.each(
      successfulTestCases.map((testCase) => ({
        ...testCase,
        stringifiedFilter: JSON.stringify(testCase.restFilterInput),
      })),
    )(
      `${FIELD_METADATA_TYPE} field type - should succeed with filter : $stringifiedFilter`,
      async ({ restFilterInput, validateFilter }) => {
        await testRestSuccessfulScenario(
          objectMetadataPluralName,
          restFilterInput,
          validateFilter,
        );
      },
    );
  });
});
