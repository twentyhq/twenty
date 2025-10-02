import { successfulFilterInputByFieldMetadataType } from 'test/integration/graphql/suites/args-validation/constants/successful-filter-input-by-field-metadata-type.constant';
import { TEST_OBJECT_GQL_FIELDS } from 'test/integration/graphql/suites/args-validation/constants/test-object-gql-fields.constant';
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
  describe('Gql filterInput args - success', () => {
    for (const [fieldType, testCases] of Object.entries(
      successfulFilterInputByFieldMetadataType,
    )) {
      it.each(
        testCases.map((testCase) => ({
          ...testCase,
          stringifiedFilter: JSON.stringify(testCase.gqlFilterInput),
        })),
      )(
        `${fieldType} - should succeed with filter : $stringifiedFilter`,
        async ({ gqlFilterInput: filter, validateFilter }) => {
          const graphqlOperation = findManyOperationFactory({
            objectMetadataSingularName: objectMetadataSingularName,
            objectMetadataPluralName: objectMetadataPluralName,
            gqlFields: TEST_OBJECT_GQL_FIELDS,
            filter,
          });

          const response =
            await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

          const records: Record<string, any>[] =
            response.body.data.testObjects.edges.map((edge: any) => edge.node);

          expect(response.body.errors).toBeUndefined();

          expect(records.length).toBeGreaterThan(0);
          expect(
            records.every((record: Record<string, any>) =>
              validateFilter?.(record),
            ),
          ).toBe(true);
        },
      );
    }
  });
});
