import { successfulFilterInputByFieldMetadataType } from 'test/integration/graphql/suites/args-validation/constants/successful-filter-input-by-field-metadata-type.constant';
import { destroyManyObjectsMetadata } from 'test/integration/graphql/suites/args-validation/utils/destroy-many-objects-metadata';
import { setupTestObjectsWithAllFieldTypes } from 'test/integration/graphql/suites/args-validation/utils/setup-test-objects-with-all-field-types.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

describe('Rest core (workspace) api - args validation', () => {
  let objectMetadataId: string;
  let objectMetadataPluralName: string;
  let targetObjectMetadataId: string;

  beforeAll(async () => {
    const setupTest = await setupTestObjectsWithAllFieldTypes();

    objectMetadataId = setupTest.objectMetadataId;
    objectMetadataPluralName = setupTest.objectMetadataPluralName;
    targetObjectMetadataId = setupTest.targetObjectMetadataId;
  });

  afterAll(async () => {
    await destroyManyObjectsMetadata([
      objectMetadataId,
      targetObjectMetadataId,
    ]);
  });
  describe('Rest filterInput - success', () => {
    for (const [fieldType, testCases] of Object.entries(
      successfulFilterInputByFieldMetadataType,
    )) {
      it.each(
        testCases.map((testCase) => ({
          ...testCase,
          stringifiedFilter: JSON.stringify(testCase.restFilterInput),
        })),
      )(
        `${fieldType} - should work with filter : $stringifiedFilter`,
        async ({ restFilterInput }) => {
          const path = `/${objectMetadataPluralName}?filter=${restFilterInput}`;
          const response = await makeRestAPIRequest({
            method: 'get',
            path,
          });

          expect(response.body.errors).toBeUndefined();
        },
      );
    }
  });

  //TODO - Add filter validation to rest api

  //   describe('Rest filterInput - failure', () => {
  //     for (const [fieldType, testCases] of Object.entries(
  //       failingFilterInputByFieldMetadataType,
  //     )) {
  //       it.each(
  //         testCases
  //           .filter((testCase) => isDefined(testCase.restFilterInput))
  //           .map((testCase) => ({
  //             ...testCase,
  //             stringifiedFilter: JSON.stringify(testCase.restFilterInput),
  //           })),
  //       )(
  //         `${fieldType} - should work with filter : $stringifiedFilter`,
  //         async ({ restFilterInput: filter, restErrorMessage: errorMessage }) => {
  //           const path = `/${objectMetadataPluralName}?filter=${filter}`;
  //           const response = await makeRestAPIRequest({
  //             method: 'get',
  //             path,
  //           });

  //           expect(response.body.errors).toBeUndefined();
  //         },
  //       );
  //     }
  //   });
});
