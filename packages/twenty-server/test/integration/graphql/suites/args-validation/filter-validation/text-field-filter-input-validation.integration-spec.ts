import { failingFilterInputByFieldMetadataType } from 'test/integration/graphql/suites/args-validation/filter-validation/constants/failing-filter-input-by-field-metadata-type.constant';
import { successfulFilterInputByFieldMetadataType } from 'test/integration/graphql/suites/args-validation/filter-validation/constants/successful-filter-input-by-field-metadata-type.constant';
import { TEST_OBJECT_GQL_FIELDS } from 'test/integration/graphql/suites/args-validation/filter-validation/constants/test-object-gql-fields.constant';
import { destroyManyObjectsMetadata } from 'test/integration/graphql/suites/args-validation/utils/destroy-many-objects-metadata';
import { setupTestObjectsWithAllFieldTypes } from 'test/integration/graphql/suites/args-validation/utils/setup-test-objects-with-all-field-types.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const FIELD_METADATA_TYPE = FieldMetadataType.TEXT;
const failingTestCases =
  failingFilterInputByFieldMetadataType[FIELD_METADATA_TYPE];
const successfulTestCases =
  successfulFilterInputByFieldMetadataType[FIELD_METADATA_TYPE];

describe(`Filter args validation - ${FIELD_METADATA_TYPE}`, () => {
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

  describe('Gql filterInput - failure', () => {
    it.each(
      failingTestCases.map((testCase) => ({
        ...testCase,
        stringifiedFilter: JSON.stringify(testCase.gqlFilterInput),
      })),
    )(
      `${FIELD_METADATA_TYPE} field type - should fail with filter : $stringifiedFilter`,
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
  });

  describe('Rest filterInput - failure', () => {
    it.each(
      failingTestCases
        .filter((testCase) => isDefined(testCase.restFilterInput))
        .map((testCase) => ({
          ...testCase,
          stringifiedFilter: JSON.stringify(testCase.restFilterInput),
        })),
    )(
      `${FIELD_METADATA_TYPE} field type - should fail with filter : $stringifiedFilter`,
      async ({ restFilterInput: filter, restErrorMessage: errorMessage }) => {
        const response = await makeRestAPIRequest({
          method: 'get',
          path: `/${objectMetadataPluralName}`,
          queryParams: `filter=${filter}`,
        });

        expect(response.body.error).toBeDefined();
        expect(JSON.stringify(response.body.messages)).toContain(errorMessage);
      },
    );
  });

  describe('Gql filterInput - success', () => {
    it.each(
      successfulTestCases.map((testCase) => ({
        ...testCase,
        stringifiedFilter: JSON.stringify(testCase.gqlFilterInput),
      })),
    )(
      `${FIELD_METADATA_TYPE} field type - should succeed with filter : $stringifiedFilter`,
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
  });

  describe('Rest filterInput - success', () => {
    it.each(
      successfulTestCases
        .filter((testCase) => isDefined(testCase.restFilterInput))
        .map((testCase) => ({
          ...testCase,
          stringifiedFilter: JSON.stringify(testCase.restFilterInput),
        })),
    )(
      `${FIELD_METADATA_TYPE} field type - should succeed with filter : $stringifiedFilter`,
      async ({ restFilterInput, validateFilter }) => {
        const response = await makeRestAPIRequest({
          method: 'get',
          path: `/${objectMetadataPluralName}`,
          queryParams: `filter=${restFilterInput}`,
        });

        const records = response.body.data.testObjects;

        expect(response.body.errors).toBeUndefined();

        expect(records.length).toBeGreaterThan(0);

        expect(
          records.every((record: Record<string, any>) =>
            validateFilter?.(record),
          ),
        ).toBe(true);
      },
    );
  });
});
