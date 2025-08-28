import {
  TEST_FIELD_METADATA_1_ID,
  TEST_NOT_EXISTING_VIEW_FILTER_ID,
  TEST_VIEW_1_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import {
  createTestViewFilterWithRestApi,
  createTestViewWithRestApi,
  deleteTestViewFilterWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import {
  assertViewFilterStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';

import { ViewFilterOperand } from 'src/engine/core-modules/view/enums/view-filter-operand';
import {
  generateViewFilterExceptionMessage,
  ViewFilterExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-filter.exception';

describe('View Filter REST API', () => {
  beforeEach(async () => {
    await cleanupViewRecords();

    await createTestViewWithRestApi({
      name: 'Test View for Filters',
    });
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  describe('GET /metadata/viewFilters', () => {
    it('should return empty array when no view filters exist', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toEqual([]);
    });

    it('should return all view filters for workspace when no viewId provided', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/viewFilters',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return view filters for a specific view after creating one', async () => {
      const viewFilter = await createTestViewFilterWithRestApi({
        operand: ViewFilterOperand.CONTAINS,
        value: 'test',
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);

      const returnedViewFilter = response.body[0];

      assertViewFilterStructure(returnedViewFilter, {
        id: viewFilter.id,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        operand: ViewFilterOperand.CONTAINS,
        value: 'test',
      });

      await deleteTestViewFilterWithRestApi(viewFilter.id);
    });
  });

  describe('POST /metadata/viewFilters', () => {
    it('should create a new view filter with string value', async () => {
      const viewFilter = await createTestViewFilterWithRestApi({
        operand: ViewFilterOperand.IS,
        value: 'test value',
      });

      assertViewFilterStructure(viewFilter, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        operand: ViewFilterOperand.IS,
        value: 'test value',
      });

      await deleteTestViewFilterWithRestApi(viewFilter.id);
    });

    it('should create a view filter with numeric value', async () => {
      const numericFilter = await createTestViewFilterWithRestApi({
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: '100',
      });

      assertViewFilterStructure(numericFilter, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: '100',
      });

      await deleteTestViewFilterWithRestApi(numericFilter.id);
    });

    it('should create a view filter with boolean value', async () => {
      const booleanFilter = await createTestViewFilterWithRestApi({
        operand: ViewFilterOperand.IS,
        value: 'true',
      });

      assertViewFilterStructure(booleanFilter, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        operand: ViewFilterOperand.IS,
        value: 'true',
      });

      await deleteTestViewFilterWithRestApi(booleanFilter.id);
    });
  });

  describe('GET /metadata/viewFilters/:id', () => {
    it('should return a view filter by id', async () => {
      const viewFilter = await createTestViewFilterWithRestApi({
        operand: ViewFilterOperand.IS,
        value: 'test',
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewFilterStructure(response.body, {
        id: viewFilter.id,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        operand: ViewFilterOperand.IS,
        value: 'test',
      });

      await deleteTestViewFilterWithRestApi(viewFilter.id);
    });

    it('should return empty object for non-existent view filter', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters/${TEST_NOT_EXISTING_VIEW_FILTER_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toEqual({});
    });
  });

  describe('PATCH /metadata/viewFilters/:id', () => {
    it('should update an existing view filter', async () => {
      const viewFilter = await createTestViewFilterWithRestApi({
        operand: ViewFilterOperand.IS,
        value: 'original',
      });

      const updateData = {
        operand: ViewFilterOperand.IS_NOT,
        value: 'updated',
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewFilterStructure(response.body, {
        id: viewFilter.id,
        operand: ViewFilterOperand.IS_NOT,
        value: 'updated',
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
      });

      await deleteTestViewFilterWithRestApi(viewFilter.id);
    });

    it('should return 404 error when updating non-existent view filter', async () => {
      const updateData = {
        operand: ViewFilterOperand.IS_NOT,
        value: 'updated',
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFilters/${TEST_NOT_EXISTING_VIEW_FILTER_ID}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FILTER_ID,
        ),
      );
    });
  });

  describe('DELETE /metadata/viewFilters/:id', () => {
    it('should delete an existing view filter', async () => {
      const viewFilter = await createTestViewFilterWithRestApi({
        operand: ViewFilterOperand.IS,
        value: 'to delete',
      });

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(getResponse);
      expect(getResponse.body).toEqual({});
    });

    it('should return 404 error when deleting non-existent view filter', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFilters/${TEST_NOT_EXISTING_VIEW_FILTER_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FILTER_ID,
        ),
      );
    });
  });
});
