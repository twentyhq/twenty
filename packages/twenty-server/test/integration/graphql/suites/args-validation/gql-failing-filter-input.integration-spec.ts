import { failingFilterInputByFieldMetadataType } from 'test/integration/graphql/suites/args-validation/constants/failing-filter-input-by-field-metadata-type.constant';
import { destroyManyObjectsMetadata } from 'test/integration/graphql/suites/args-validation/utils/destroy-many-objects-metadata';
import { setupTestObjectsWithAllFieldTypes } from 'test/integration/graphql/suites/args-validation/utils/setup-test-objects-with-all-field-types.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';

describe('Gql core (workspace) api - args validation', () => {
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

  describe('Gql filterInput args - failure', () => {
    for (const [fieldType, testCases] of Object.entries(
      failingFilterInputByFieldMetadataType,
    )) {
      it.each(
        testCases.map((testCase) => ({
          ...testCase,
          stringifiedFilter: JSON.stringify(testCase.gqlFilterInput),
        })),
      )(
        `${fieldType} - should fail with filter : $stringifiedFilter`,
        async ({ gqlFilterInput: filter, gqlErrorMessage: errorMessage }) => {
          const graphqlOperation = findManyOperationFactory({
            objectMetadataSingularName: objectMetadataSingularName,
            objectMetadataPluralName: objectMetadataPluralName,
            gqlFields: 'id',
            filter,
          });

          const response =
            await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

          expect(response.body.errors).toBeDefined();
          expect(response.body.errors[0].message).toContain(errorMessage);
        },
      );
    }
  });
});
