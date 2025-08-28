import {
  TEST_FIELD_METADATA_1_ID,
  TEST_NOT_EXISTING_VIEW_SORT_ID,
  TEST_VIEW_1_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import {
  createTestViewSortWithRestApi,
  createTestViewWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  assertViewSortStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';

import { ViewSortDirection } from 'src/engine/core-modules/view/enums/view-sort-direction';
import {
  generateViewSortExceptionMessage,
  ViewSortExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-sort.exception';

describe('View Sort REST API', () => {
  beforeEach(async () => {
    await cleanupViewRecords();

    await createTestViewWithRestApi({
      name: generateRecordName('Test View for Sorts'),
    });
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  describe('GET /metadata/viewSorts', () => {
    it('should return empty array when no view sorts exist', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewSorts?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toEqual([]);
    });

    it('should return all view sorts for workspace when no viewId provided', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/viewSorts',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return view sorts for a specific view after creating one', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        direction: ViewSortDirection.ASC,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewSorts?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);

      const returnedViewSort = response.body[0];

      assertViewSortStructure(returnedViewSort, {
        id: viewSort.id,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        direction: ViewSortDirection.ASC,
      });
    });
  });

  describe('POST /metadata/viewSorts', () => {
    it('should create a new view sort with ASC direction', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        direction: ViewSortDirection.ASC,
      });

      assertViewSortStructure(viewSort, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        direction: ViewSortDirection.ASC,
      });
    });

    it('should create a view sort with DESC direction', async () => {
      const descSort = await createTestViewSortWithRestApi({
        direction: ViewSortDirection.DESC,
      });

      assertViewSortStructure(descSort, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        direction: ViewSortDirection.DESC,
      });
    });
  });

  describe('GET /metadata/viewSorts/:id', () => {
    it('should return a view sort by id', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        direction: ViewSortDirection.ASC,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewSorts/${viewSort.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewSortStructure(response.body, {
        id: viewSort.id,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        direction: ViewSortDirection.ASC,
      });
    });

    it('should return empty object for non-existent view sort', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewSorts/${TEST_NOT_EXISTING_VIEW_SORT_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toEqual({});
    });
  });

  describe('PATCH /metadata/viewSorts/:id', () => {
    it('should update an existing view sort', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        direction: ViewSortDirection.ASC,
      });

      const updateData = {
        direction: ViewSortDirection.DESC,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewSorts/${viewSort.id}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewSortStructure(response.body, {
        id: viewSort.id,
        direction: ViewSortDirection.DESC,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
      });
    });

    it('should return 404 error when updating non-existent view sort', async () => {
      const updateData = {
        direction: ViewSortDirection.DESC,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewSorts/${TEST_NOT_EXISTING_VIEW_SORT_ID}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_SORT_ID,
        ),
      );
    });
  });

  describe('DELETE /metadata/viewSorts/:id', () => {
    it('should delete an existing view sort', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        direction: ViewSortDirection.ASC,
      });

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewSorts/${viewSort.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewSorts/${viewSort.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(getResponse);
      expect(getResponse.body).toEqual({});
    });

    it('should return 404 error when deleting non-existent view sort', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewSorts/${TEST_NOT_EXISTING_VIEW_SORT_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_SORT_ID,
        ),
      );
    });
  });
});
