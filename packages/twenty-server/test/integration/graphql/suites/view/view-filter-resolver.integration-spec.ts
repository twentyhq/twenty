import gql from 'graphql-tag';
import { TEST_FIELD_METADATA_1_ID } from 'test/integration/constants/test-view-ids.constants';
import { createViewFilterOperationFactory } from 'test/integration/graphql/utils/create-view-filter-operation-factory.util';
import { deleteViewFilterOperationFactory } from 'test/integration/graphql/utils/delete-view-filter-operation-factory.util';
import { findViewFiltersOperationFactory } from 'test/integration/graphql/utils/find-view-filters-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createViewFilterData } from 'test/integration/graphql/utils/view-data-factory.util';
import {
  assertSuccessfulResponse,
  assertViewFilterStructure,
  cleanupViewRecords,
  createTestView,
} from 'test/integration/graphql/utils/view-test-utils';

describe('View Filter Resolver', () => {
  let testViewId: string;

  beforeAll(async () => {
    await cleanupViewRecords();

    const view = await createTestView({
      name: 'Test View for Filters',
    });

    testViewId = view.id;
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  afterEach(async () => {
    // Only clean up filters, keep the view
    const operation = findViewFiltersOperationFactory({ viewId: testViewId });
    const viewFilters = await makeGraphqlAPIRequest(operation);

    if (viewFilters.body.data.getCoreViewFilters.length > 0) {
      await Promise.all(
        viewFilters.body.data.getCoreViewFilters.map((filter: any) => {
          const deleteOperation = deleteViewFilterOperationFactory({
            viewFilterId: filter.id,
          });

          return makeGraphqlAPIRequest(deleteOperation);
        }),
      );
    }
  });

  describe('getCoreViewFilters', () => {
    it('should return empty array when no view filters exist', async () => {
      const operation = findViewFiltersOperationFactory({ viewId: testViewId });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFilters).toEqual([]);
    });

    it('should return view filters for a specific view', async () => {
      const filterData = createViewFilterData(testViewId, {
        operand: 'Contains',
        value: 'test',
        displayValue: 'contains test',
      });
      const createOperation = createViewFilterOperationFactory({
        data: filterData,
      });

      await makeGraphqlAPIRequest(createOperation);

      const getOperation = findViewFiltersOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFilters).toHaveLength(1);
      assertViewFilterStructure(response.body.data.getCoreViewFilters[0], {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        operand: 'Contains',
        value: 'test',
        displayValue: 'contains test',
        viewId: testViewId,
      });
    });
  });

  describe('createCoreViewFilter', () => {
    it('should create a new view filter with string value', async () => {
      const filterData = createViewFilterData(testViewId, {
        operand: 'Equals',
        value: 'test value',
        displayValue: 'equals test value',
      });

      const operation = createViewFilterOperationFactory({ data: filterData });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewFilterStructure(response.body.data.createCoreViewFilter, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        operand: 'Equals',
        value: 'test value',
        displayValue: 'equals test value',
        viewId: testViewId,
      });
    });

    it('should create a view filter with numeric value', async () => {
      const filterData = createViewFilterData(testViewId, {
        operand: 'GreaterThan',
        value: '100',
        displayValue: 'greater than 100',
      });

      const operation = createViewFilterOperationFactory({ data: filterData });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewFilterStructure(response.body.data.createCoreViewFilter, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        operand: 'GreaterThan',
        value: '100',
        displayValue: 'greater than 100',
        viewId: testViewId,
      });
    });

    it('should create a view filter with boolean value', async () => {
      const graphqlOperation = {
        query: gql`
          mutation CreateCoreViewFilter($input: CreateViewFilterInput!) {
            createCoreViewFilter(input: $input) {
              id
              fieldMetadataId
              operand
              value
              displayValue
              viewId
            }
          }
        `,
        variables: {
          input: {
            viewId: testViewId,
            fieldMetadataId: TEST_FIELD_METADATA_1_ID,
            operand: 'Is',
            value: 'true',
            displayValue: 'is true',
          },
        },
      };

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createCoreViewFilter).toMatchObject({
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        operand: 'Is',
        value: 'true',
        displayValue: 'is true',
        viewId: testViewId,
      });
    });
  });

  describe('updateCoreViewFilter', () => {
    it('should update an existing view filter', async () => {
      const createGraphqlOperation = {
        query: gql`
          mutation CreateCoreViewFilter($input: CreateViewFilterInput!) {
            createCoreViewFilter(input: $input) {
              id
              operand
              value
              displayValue
            }
          }
        `,
        variables: {
          input: {
            viewId: testViewId,
            fieldMetadataId: TEST_FIELD_METADATA_1_ID,
            operand: 'Contains',
            value: 'original',
            displayValue: 'contains original',
          },
        },
      };

      const createResponse = await makeGraphqlAPIRequest(
        createGraphqlOperation,
      );

      const viewFilterId = createResponse.body.data.createCoreViewFilter.id;

      const updateGraphqlOperation = {
        query: gql`
          mutation UpdateCoreViewFilter(
            $id: String!
            $input: UpdateViewFilterInput!
          ) {
            updateCoreViewFilter(id: $id, input: $input) {
              id
              operand
              value
              displayValue
              updatedAt
            }
          }
        `,
        variables: {
          id: viewFilterId,
          input: {
            operand: 'DoesNotContain',
            value: 'updated',
            displayValue: 'does not contain updated',
          },
        },
      };

      const response = await makeGraphqlAPIRequest(updateGraphqlOperation);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateCoreViewFilter).toMatchObject({
        id: viewFilterId,
        operand: 'DoesNotContain',
        value: 'updated',
        displayValue: 'does not contain updated',
      });
    });
  });

  describe('deleteCoreViewFilter', () => {
    it('should delete an existing view filter', async () => {
      const createGraphqlOperation = {
        query: gql`
          mutation CreateCoreViewFilter($input: CreateViewFilterInput!) {
            createCoreViewFilter(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            viewId: testViewId,
            fieldMetadataId: TEST_FIELD_METADATA_1_ID,
            operand: 'Contains',
            value: 'to delete',
            displayValue: 'contains to delete',
          },
        },
      };

      const createResponse = await makeGraphqlAPIRequest(
        createGraphqlOperation,
      );

      const viewFilterId = createResponse.body.data.createCoreViewFilter.id;

      const deleteGraphqlOperation = {
        query: gql`
          mutation DeleteCoreViewFilter($id: String!) {
            deleteCoreViewFilter(id: $id)
          }
        `,
        variables: {
          id: viewFilterId,
        },
      };

      const response = await makeGraphqlAPIRequest(deleteGraphqlOperation);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteCoreViewFilter).toBe(true);
    });
  });

  describe('validation', () => {
    it('should require viewId for creation', async () => {
      const graphqlOperation = {
        query: gql`
          mutation CreateCoreViewFilter($input: CreateViewFilterInput!) {
            createCoreViewFilter(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            fieldMetadataId: TEST_FIELD_METADATA_1_ID,
            operand: 'Contains',
            value: 'test',
            displayValue: 'contains test',
          },
        },
      };

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('viewId');
    });

    it('should require fieldMetadataId for creation', async () => {
      const graphqlOperation = {
        query: gql`
          mutation CreateCoreViewFilter($input: CreateViewFilterInput!) {
            createCoreViewFilter(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            viewId: testViewId,
            operand: 'Contains',
            value: 'test',
            displayValue: 'contains test',
          },
        },
      };

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('fieldMetadataId');
    });

    it('should require operand for creation', async () => {
      const graphqlOperation = {
        query: gql`
          mutation CreateCoreViewFilter($input: CreateViewFilterInput!) {
            createCoreViewFilter(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            viewId: testViewId,
            fieldMetadataId: TEST_FIELD_METADATA_1_ID,
            value: 'test',
            displayValue: 'contains test',
          },
        },
      };

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('operand');
    });
  });
});
