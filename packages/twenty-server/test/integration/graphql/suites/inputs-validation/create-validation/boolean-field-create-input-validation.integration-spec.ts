import { successfulCreateInputByFieldMetadataType } from 'test/integration/graphql/suites/inputs-validation/create-validation/constants/successful-create-input-by-field-metadata-type.constant';
import { expectGqlCreateInputValidationSuccess } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/expect-gql-create-input-validation-success.util';
import { expectRestCreateInputValidationSuccess } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/expect-rest-create-input-validation-success.util';
import { destroyManyObjectsMetadata } from 'test/integration/graphql/suites/inputs-validation/utils/destroy-many-objects-metadata';
import { setupTestObjectsWithAllFieldTypes } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

const FIELD_METADATA_TYPE = FieldMetadataType.BOOLEAN;

const successfulTestCases =
  successfulCreateInputByFieldMetadataType[FIELD_METADATA_TYPE];

describe(`Create input validation - ${FIELD_METADATA_TYPE}`, () => {
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

  // describe('Gql create input - failure', () => {
  //   it.each(
  //     failingTestCases.map((testCase) => ({
  //       ...testCase,
  //       stringifiedInput: JSON.stringify(testCase.input),
  //     })),
  //   )(
  //     `${FIELD_METADATA_TYPE} - should fail with : $stringifiedInput`,
  //     async ({ input }) => {
  //       await expectGqlCreateInputValidationError(
  //         objectMetadataSingularName,
  //         input,
  //       );
  //     },
  //   );
  // });

  // describe('Rest create input - failure', () => {
  //   it.each(
  //     failingTestCases.map((testCase) => ({
  //       ...testCase,
  //       stringifiedInput: JSON.stringify(testCase.input),
  //     })),
  //   )(
  //     `${FIELD_METADATA_TYPE} - should fail with : $stringifiedInput`,
  //     async ({ input }) => {
  //       await expectRestCreateInputValidationError(
  //         objectMetadataPluralName,
  //         input,
  //       );
  //     },
  //   );
  // });

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
