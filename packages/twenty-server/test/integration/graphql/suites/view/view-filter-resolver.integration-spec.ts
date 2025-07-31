import {
  TEST_FIELD_METADATA_1_ID,
  TEST_NOT_EXISTING_VIEW_FILTER_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { createViewFilterOperationFactory } from 'test/integration/graphql/utils/create-view-filter-operation-factory.util';
import { deleteViewFilterOperationFactory } from 'test/integration/graphql/utils/delete-view-filter-operation-factory.util';
import { findViewFiltersOperationFactory } from 'test/integration/graphql/utils/find-view-filters-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateViewFilterOperationFactory } from 'test/integration/graphql/utils/update-view-filter-operation-factory.util';
import { createViewFilterData } from 'test/integration/graphql/utils/view-data-factory.util';
import {
  assertErrorResponse,
  assertSuccessfulResponse,
  assertViewFilterStructure,
  cleanupViewRecords,
  createTestView,
} from 'test/integration/graphql/utils/view-test.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ViewFilterExceptionMessage } from 'src/engine/core-modules/view/exceptions/view-filter.exception';

describe('View Filter Resolver', () => {
  let testViewId: string;

  beforeEach(async () => {
    await cleanupViewRecords();

    const view = await createTestView({
      name: 'Test View for Groups',
    });

    testViewId = view.id;
  });

  afterAll(async () => {
    await cleanupViewRecords();
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
        viewId: testViewId,
      });
    });
  });

  describe('createCoreViewFilter', () => {
    it('should create a new view filter with string value', async () => {
      const filterData = createViewFilterData(testViewId, {
        operand: 'Equals',
        value: 'test value',
      });

      const operation = createViewFilterOperationFactory({ data: filterData });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewFilterStructure(response.body.data.createCoreViewFilter, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        operand: 'Equals',
        value: 'test value',
        viewId: testViewId,
      });
    });

    it('should create a view filter with numeric value', async () => {
      const filterData = createViewFilterData(testViewId, {
        operand: 'GreaterThan',
        value: '100',
      });

      const operation = createViewFilterOperationFactory({ data: filterData });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewFilterStructure(response.body.data.createCoreViewFilter, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        operand: 'GreaterThan',
        value: '100',
        viewId: testViewId,
      });
    });

    it('should create a view filter with boolean value', async () => {
      const operation = createViewFilterOperationFactory({
        data: createViewFilterData(testViewId, {
          operand: 'Is',
          value: 'true',
        }),
      });

      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewFilterStructure(response.body.data.createCoreViewFilter, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        operand: 'Is',
        value: 'true',
        viewId: testViewId,
      });
    });
  });

  describe('updateCoreViewFilter', () => {
    it('should update an existing view filter', async () => {
      const createOperation = createViewFilterOperationFactory({
        data: createViewFilterData(testViewId, {
          operand: 'Contains',
          value: 'original',
        }),
      });

      const createResponse = await makeGraphqlAPIRequest(createOperation);

      const viewFilterId = createResponse.body.data.createCoreViewFilter.id;

      const updateOperation = updateViewFilterOperationFactory({
        viewFilterId: viewFilterId,
        data: {
          operand: 'DoesNotContain',
          value: 'updated',
        },
      });

      const response = await makeGraphqlAPIRequest(updateOperation);

      assertSuccessfulResponse(response);
      assertViewFilterStructure(response.body.data.updateCoreViewFilter, {
        id: viewFilterId,
        operand: 'DoesNotContain',
        value: 'updated',
      });
    });

    it('should throw an error when updating non-existent view filter', async () => {
      const operation = updateViewFilterOperationFactory({
        viewFilterId: TEST_NOT_EXISTING_VIEW_FILTER_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        ViewFilterExceptionMessage.VIEW_FILTER_NOT_FOUND,
      );
    });
  });

  describe('deleteCoreViewFilter', () => {
    it('should delete an existing view filter', async () => {
      const createOperation = createViewFilterOperationFactory({
        data: createViewFilterData(testViewId, {
          operand: 'Contains',
          value: 'to delete',
        }),
      });

      const createResponse = await makeGraphqlAPIRequest(createOperation);

      const viewFilterId = createResponse.body.data.createCoreViewFilter.id;

      const deleteOperation = deleteViewFilterOperationFactory({
        viewFilterId: viewFilterId,
      });

      const response = await makeGraphqlAPIRequest(deleteOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.deleteCoreViewFilter).toBe(true);
    });

    it('should throw an error when deleting non-existent view filter', async () => {
      const operation = deleteViewFilterOperationFactory({
        viewFilterId: TEST_NOT_EXISTING_VIEW_FILTER_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        ViewFilterExceptionMessage.VIEW_FILTER_NOT_FOUND,
      );
    });
  });
});
