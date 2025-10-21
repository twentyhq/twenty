import { failingCreateInputByFieldMetadataType } from 'test/integration/graphql/suites/inputs-validation/create-validation/constants/failing-create-input-by-field-metadata-type.constant';
import { expectGqlCreateInputValidationError } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/expect-gql-create-input-validation-error.util';
import { expectRestCreateInputValidationError } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/expect-rest-create-input-validation-error.util';
import { destroyManyObjectsMetadata } from 'test/integration/graphql/suites/inputs-validation/utils/destroy-many-objects-metadata';
import { setupTestObjectsWithAllFieldTypes } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

const FIELD_METADATA_TYPE = FieldMetadataType.RICH_TEXT;

const failingTestCases =
  failingCreateInputByFieldMetadataType[FIELD_METADATA_TYPE];

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
      async ({ input }) => {
        await expectGqlCreateInputValidationError(
          objectMetadataSingularName,
          input,
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
      async ({ input }) => {
        await expectRestCreateInputValidationError(
          objectMetadataPluralName,
          input,
        );
      },
    );
  });
});
