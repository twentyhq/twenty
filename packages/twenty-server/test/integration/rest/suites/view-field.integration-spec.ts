import {
  TEST_FIELD_METADATA_1_ID,
  TEST_NOT_EXISTING_VIEW_FIELD_ID,
  TEST_VIEW_1_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import {
  createTestViewFieldWithRestApi,
  createTestViewWithRestApi,
  deleteTestViewFieldWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import {
  assertViewFieldStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';

import {
  generateViewFieldExceptionMessage,
  ViewFieldExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-field.exception';

describe('View Field REST API', () => {
  beforeEach(async () => {
    await cleanupViewRecords();

    await createTestViewWithRestApi({
      name: 'Test View for Fields',
    });
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  describe('GET /metadata/viewFields', () => {
    it('should return empty array when no view fields exist', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFields?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toEqual([]);
    });

    it('should return all view fields for workspace when no viewId provided', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/viewFields',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return view fields for a specific view after creating one', async () => {
      const viewField = await createTestViewFieldWithRestApi({
        position: 0,
        isVisible: true,
        size: 150,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFields?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);

      const returnedViewField = response.body[0];

      assertViewFieldStructure(returnedViewField, {
        id: viewField.id,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        position: 0,
        isVisible: true,
        size: 150,
      });

      await deleteTestViewFieldWithRestApi(viewField.id);
    });
  });

  describe('POST /metadata/viewFields', () => {
    it('should create a new view field', async () => {
      const viewField = await createTestViewFieldWithRestApi({
        position: 1,
        isVisible: true,
        size: 200,
      });

      assertViewFieldStructure(viewField, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        position: 1,
        isVisible: true,
        size: 200,
      });

      await deleteTestViewFieldWithRestApi(viewField.id);
    });

    it('should create a hidden view field', async () => {
      const hiddenField = await createTestViewFieldWithRestApi({
        position: 2,
        isVisible: false,
        size: 100,
      });

      assertViewFieldStructure(hiddenField, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
        position: 2,
        isVisible: false,
        size: 100,
      });

      await deleteTestViewFieldWithRestApi(hiddenField.id);
    });
  });

  describe('GET /metadata/viewFields/:id', () => {
    it('should return a view field by id', async () => {
      const viewField = await createTestViewFieldWithRestApi({
        position: 0,
        isVisible: true,
        size: 150,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFields/${viewField.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewFieldStructure(response.body, {
        id: viewField.id,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
      });

      await deleteTestViewFieldWithRestApi(viewField.id);
    });

    it('should return empty object for non-existent view field', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFields/${TEST_NOT_EXISTING_VIEW_FIELD_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toEqual({});
    });
  });

  describe('PATCH /metadata/viewFields/:id', () => {
    it('should update an existing view field', async () => {
      const viewField = await createTestViewFieldWithRestApi({
        position: 0,
        isVisible: true,
        size: 150,
      });

      const updateData = {
        position: 5,
        isVisible: false,
        size: 300,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFields/${viewField.id}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewFieldStructure(response.body, {
        id: viewField.id,
        position: 5,
        isVisible: false,
        size: 300,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        viewId: TEST_VIEW_1_ID,
      });

      await deleteTestViewFieldWithRestApi(viewField.id);
    });

    it('should return 404 error when updating non-existent view field', async () => {
      const updateData = {
        position: 5,
        isVisible: false,
        size: 300,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFields/${TEST_NOT_EXISTING_VIEW_FIELD_ID}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FIELD_ID,
        ),
      );
    });
  });

  describe('DELETE /metadata/viewFields/:id', () => {
    it('should delete an existing view field', async () => {
      const viewField = await createTestViewFieldWithRestApi({
        position: 0,
        isVisible: true,
        size: 150,
      });

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFields/${viewField.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFields/${viewField.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(getResponse);
      expect(getResponse.body).toEqual({});
    });

    it('should return 404 error when deleting non-existent view field', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFields/${TEST_NOT_EXISTING_VIEW_FIELD_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FIELD_ID,
        ),
      );
    });
  });
});
