import { successfulCreateInputByFieldMetadataType } from 'test/integration/graphql/suites/inputs-validation/create-validation/constants/successful-create-input-by-field-metadata-type.constant';
import { expectGqlCreateInputValidationSuccess } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/expect-gql-create-input-validation-success.util';
import { expectRestCreateInputValidationSuccess } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/expect-rest-create-input-validation-success.util';
import { destroyManyObjectsMetadata } from 'test/integration/graphql/suites/inputs-validation/utils/destroy-many-objects-metadata';
import { setupTestObjectsWithAllFieldTypes } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

const FIELD_METADATA_TYPE = FieldMetadataType.EMAILS;

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

  describe('Gql create input - success', () => {
    it.each(
      successfulTestCases.map((testCase) => ({
        ...testCase,
        stringifiedInput: JSON.stringify(testCase.input),
      })),
    )(
      `${FIELD_METADATA_TYPE} - should succeed with : $stringifiedInput`,
      async ({ input, validateInput }) => {
        await expectGqlCreateInputValidationSuccess(
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
        await expectRestCreateInputValidationSuccess(
          objectMetadataPluralName,
          objectMetadataSingularName,
          input,
          validateInput,
        );
      },
    );
  });
});
