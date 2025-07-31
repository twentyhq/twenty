import {
  TEST_FIELD_METADATA_1_ID,
  TEST_NOT_EXISTING_VIEW_FILTER_ID,
  TEST_VIEW_1_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertErrorResponse,
  assertSuccessfulResponse,
  assertViewFilterStructure,
  cleanupViewRecords,
  createTestView,
  createTestViewFilter,
  deleteTestViewFilter,
} from 'test/integration/rest/utils/view-test.util';

import { ViewFilterExceptionMessage } from 'src/engine/core-modules/view/exceptions/view-filter.exception';

describe('View Filter REST API', () => {
  beforeEach(async () => {
    await cleanupViewRecords();

    await createTestView({
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

      assertSuccessfulResponse(response);
      expect(response.body).toEqual([]);
    });

    it('should return all view filters for workspace when no viewId provided', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/viewFilters',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return view filters for a specific view after creating one', async () => {
      const viewFilter = await createTestViewFilter({
        operand: 'Contains',
        value: 'test',
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);

      const returnedViewFilter = response.body[0];

      assertViewFilterStructure(returnedViewFilter, {
        id: viewFilter.id,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        operand: 'Contains',
        value: 'test',
      });

      await deleteTestViewFilter(viewFilter.id);
    });
  });

  describe('POST /metadata/viewFilters', () => {
    it('should create a new view filter with string value', async () => {
      const viewFilter = await createTestViewFilter({
        operand: 'Equals',
        value: 'test value',
      });

      assertViewFilterStructure(viewFilter, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        operand: 'Equals',
        value: 'test value',
      });

      await deleteTestViewFilter(viewFilter.id);
    });

    it('should create a view filter with numeric value', async () => {
      const numericFilter = await createTestViewFilter({
        operand: 'GreaterThan',
        value: '100',
      });

      assertViewFilterStructure(numericFilter, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        operand: 'GreaterThan',
        value: '100',
      });

      await deleteTestViewFilter(numericFilter.id);
    });

    it('should create a view filter with boolean value', async () => {
      const booleanFilter = await createTestViewFilter({
        operand: 'Is',
        value: 'true',
      });

      assertViewFilterStructure(booleanFilter, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        operand: 'Is',
        value: 'true',
      });

      await deleteTestViewFilter(booleanFilter.id);
    });
  });

  describe('GET /metadata/viewFilters/:id', () => {
    it('should return a view filter by id', async () => {
      const viewFilter = await createTestViewFilter({
        operand: 'Contains',
        value: 'test',
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertSuccessfulResponse(response);
      assertViewFilterStructure(response.body, {
        id: viewFilter.id,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        operand: 'Contains',
        value: 'test',
      });

      await deleteTestViewFilter(viewFilter.id);
    });

    it('should return empty object for non-existent view filter', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters/${TEST_NOT_EXISTING_VIEW_FILTER_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertSuccessfulResponse(response);
      expect(response.body).toEqual({});
    });
  });

  describe('PATCH /metadata/viewFilters/:id', () => {
    it('should update an existing view filter', async () => {
      const viewFilter = await createTestViewFilter({
        operand: 'Contains',
        value: 'original',
      });

      const updateData = {
        operand: 'DoesNotContain',
        value: 'updated',
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertSuccessfulResponse(response);
      assertViewFilterStructure(response.body, {
        id: viewFilter.id,
        operand: 'DoesNotContain',
        value: 'updated',
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
      });

      await deleteTestViewFilter(viewFilter.id);
    });

    it('should return 404 error when updating non-existent view filter', async () => {
      const updateData = {
        operand: 'DoesNotContain',
        value: 'updated',
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFilters/${TEST_NOT_EXISTING_VIEW_FILTER_ID}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertErrorResponse(
        response,
        404,
        ViewFilterExceptionMessage.VIEW_FILTER_NOT_FOUND,
      );
    });
  });

  describe('DELETE /metadata/viewFilters/:id', () => {
    it('should delete an existing view filter', async () => {
      const viewFilter = await createTestViewFilter({
        operand: 'Contains',
        value: 'to delete',
      });

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertSuccessfulResponse(deleteResponse);
      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilters/${viewFilter.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertSuccessfulResponse(getResponse);
      expect(getResponse.body).toEqual({});
    });

    it('should return 404 error when deleting non-existent view filter', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFilters/${TEST_NOT_EXISTING_VIEW_FILTER_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertErrorResponse(
        response,
        404,
        ViewFilterExceptionMessage.VIEW_FILTER_NOT_FOUND,
      );
    });
  });
});
