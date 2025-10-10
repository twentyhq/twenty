import { failingCreateInputByFieldMetadataType } from 'test/integration/graphql/suites/inputs-validation/create-validation/constants/failing-create-input-by-field-metadata-type.constant';
import { successfulCreateInputByFieldMetadataType } from 'test/integration/graphql/suites/inputs-validation/create-validation/constants/successful-create-input-by-field-metadata-type.constant';
import { testGqlFailingScenario } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/test-gql-failing-scenario.util';
import { testGqlSuccessfulScenario } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/test-gql-successful-scenario.util';
import { testRestFailingScenario } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/test-rest-failing-scenario.util';
import { testRestSuccessfulScenario } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/test-rest-successful-scenario.util';
import { destroyManyObjectsMetadata } from 'test/integration/graphql/suites/inputs-validation/utils/destroy-many-objects-metadata';
import { setupTestObjectsWithAllFieldTypes } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

const FIELD_METADATA_TYPE = FieldMetadataType.EMAILS;

const failingTestCases =
  failingCreateInputByFieldMetadataType[FIELD_METADATA_TYPE];
const successfulTestCases =
  successfulCreateInputByFieldMetadataType[FIELD_METADATA_TYPE];

describe(`Create input validation - ${FIELD_METADATA_TYPE}`, () => {
  let objectMetadataId: string;
  let objectMetadataSingularName: string;
  let objectMetadataPluralName: string;
  let targetObjectMetadataId: string;

  beforeAll(async () => {
    const setupTest = await setupTestObjectsWithAllFieldTypes();

    objectMetadataId = setupTest.objectMetadataId;
    objectMetadataSingularName = setupTest.objectMetadataSingularName;
    objectMetadataPluralName = setupTest.objectMetadataPluralName;
    targetObjectMetadataId = setupTest.targetObjectMetadataId;
  });

  afterAll(async () => {
    await destroyManyObjectsMetadata([
      objectMetadataId,
      targetObjectMetadataId,
    ]);
  });

  describe('Gql create input - failure', () => {
    it.each(
      failingTestCases.map((testCase) => ({
        ...testCase,
        stringifiedInput: JSON.stringify(testCase.input),
      })),
    )(
      `${FIELD_METADATA_TYPE} - should fail with : $stringifiedInput`,
      async ({ input, gqlErrorMessage: errorMessage }) => {
        await testGqlFailingScenario(
          objectMetadataSingularName,
          input,
          errorMessage,
        );
      },
    );
  });

  describe('Rest create input - failure', () => {
    it.each(
      failingTestCases.map((testCase) => ({
        ...testCase,
        stringifiedInput: JSON.stringify(testCase.input),
      })),
    )(
      `${FIELD_METADATA_TYPE} - should fail with : $stringifiedInput`,
      async ({ input, restErrorMessage: errorMessage }) => {
        await testRestFailingScenario(
          objectMetadataPluralName,
          input,
          errorMessage,
        );
      },
    );
  });

  describe('Gql create input - success', () => {
    it.each(
      successfulTestCases.map((testCase) => ({
        ...testCase,
        stringifiedInput: JSON.stringify(testCase.input),
      })),
    )(
      `${FIELD_METADATA_TYPE} - should succeed with : $stringifiedInput`,
      async ({ input, validateInput }) => {
        await testGqlSuccessfulScenario(
          objectMetadataSingularName,
          input,
          validateInput,
        );
      },
    );
  });

  describe('Rest create input - success', () => {
    it.each(
      successfulTestCases.map((testCase) => ({
        ...testCase,
        stringifiedInput: JSON.stringify(testCase.input),
      })),
    )(
      `${FIELD_METADATA_TYPE} - should succeed with : $stringifiedInput`,
      async ({ input, validateInput }) => {
        await testRestSuccessfulScenario(
          objectMetadataPluralName,
          objectMetadataSingularName,
          input,
          validateInput,
        );
      },
    );
  });
});
