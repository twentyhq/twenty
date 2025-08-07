import {
  TEST_FIELD_METADATA_1_ID,
  TEST_NOT_EXISTING_VIEW_GROUP_ID,
  TEST_VIEW_1_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import {
  createTestViewGroupWithRestApi,
  createTestViewWithRestApi,
  deleteTestViewGroupWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  assertViewGroupStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';

import { type ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';
import {
  generateViewGroupExceptionMessage,
  ViewGroupExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-group.exception';

describe('View Group REST API', () => {
  beforeEach(async () => {
    await cleanupViewRecords();

    await createTestViewWithRestApi({
      name: generateRecordName('Test View for Groups'),
    });
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  describe('GET /metadata/viewGroups', () => {
    it('should return empty array when no view groups exist', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewGroups?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toEqual([]);
    });

    it('should return all view groups for workspace when no viewId provided', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/viewGroups',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return view groups for a specific view after creating one', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        fieldValue: 'test-field-value',
        isVisible: true,
        position: 0,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewGroups?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);

      const returnedViewGroup = response.body[0];

      assertViewGroupStructure(returnedViewGroup, {
        id: viewGroup.id,
        viewId: TEST_VIEW_1_ID,
        fieldValue: 'test-field-value',
        isVisible: true,
        position: 0,
      });

      await deleteTestViewGroupWithRestApi(viewGroup.id);
    });

    it('should return multiple view groups for a view', async () => {
      const viewGroup1 = await createTestViewGroupWithRestApi({
        fieldValue: 'group-1',
        position: 0,
      });

      const viewGroup2 = await createTestViewGroupWithRestApi({
        fieldValue: 'group-2',
        position: 1,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewGroups?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);

      const group1 = response.body.find(
        (group: ViewGroup) => group.id === viewGroup1.id,
      );
      const group2 = response.body.find(
        (group: ViewGroup) => group.id === viewGroup2.id,
      );

      assertViewGroupStructure(group1, {
        fieldValue: 'group-1',
        position: 0,
      });

      assertViewGroupStructure(group2, {
        fieldValue: 'group-2',
        position: 1,
      });

      await deleteTestViewGroupWithRestApi(viewGroup1.id);
      await deleteTestViewGroupWithRestApi(viewGroup2.id);
    });
  });

  describe('GET /metadata/viewGroups/:id', () => {
    it('should return a specific view group by id', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        fieldValue: 'specific-group',
        isVisible: false,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewGroups/${viewGroup.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewGroupStructure(response.body, {
        id: viewGroup.id,
        viewId: TEST_VIEW_1_ID,
        fieldValue: 'specific-group',
        isVisible: false,
      });

      await deleteTestViewGroupWithRestApi(viewGroup.id);
    });
  });

  describe('POST /metadata/viewGroups', () => {
    it('should create a new view group', async () => {
      const viewGroupData = {
        viewId: TEST_VIEW_1_ID,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        fieldValue: 'new-group-value',
        isVisible: true,
        position: 5,
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewGroups',
        body: viewGroupData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response, 201);
      assertViewGroupStructure(response.body, {
        viewId: TEST_VIEW_1_ID,
        fieldValue: 'new-group-value',
        isVisible: true,
        position: 5,
      });

      await deleteTestViewGroupWithRestApi(response.body.id);
    });

    it('should create view group with minimal required fields', async () => {
      const viewGroupData = {
        viewId: TEST_VIEW_1_ID,
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        fieldValue: 'minimal-group',
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewGroups',
        body: viewGroupData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response, 201);
      assertViewGroupStructure(response.body, {
        viewId: TEST_VIEW_1_ID,
        fieldValue: 'minimal-group',
        isVisible: true,
        position: 0,
      });

      await deleteTestViewGroupWithRestApi(response.body.id);
    });

    it('should fail to create view group with missing required fields', async () => {
      const invalidData = {
        viewId: TEST_VIEW_1_ID,
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewGroups',
        body: invalidData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        400,
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.INVALID_VIEW_GROUP_DATA,
        ),
      );
    });
  });

  describe('PATCH /metadata/viewGroups/:id', () => {
    it('should update an existing view group', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        fieldValue: 'original-value',
        isVisible: true,
        position: 1,
      });

      const updateData = {
        fieldValue: 'updated-value',
        isVisible: false,
        position: 2,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewGroups/${viewGroup.id}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewGroupStructure(response.body, {
        id: viewGroup.id,
        viewId: TEST_VIEW_1_ID,
        fieldValue: 'updated-value',
        isVisible: false,
        position: 2,
      });

      await deleteTestViewGroupWithRestApi(viewGroup.id);
    });

    it('should update only specific fields', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        fieldValue: 'original-value',
        isVisible: true,
        position: 1,
      });

      const updateData = {
        fieldValue: 'partially-updated',
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewGroups/${viewGroup.id}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewGroupStructure(response.body, {
        id: viewGroup.id,
        fieldValue: 'partially-updated',
        isVisible: true,
        position: 1,
      });

      await deleteTestViewGroupWithRestApi(viewGroup.id);
    });

    it('should return 404 for non-existent view group', async () => {
      const updateData = {
        fieldValue: 'test-update',
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewGroups/${TEST_NOT_EXISTING_VIEW_GROUP_ID}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_GROUP_ID,
        ),
      );
    });
  });

  describe('DELETE /metadata/viewGroups/:id', () => {
    it('should delete an existing view group', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        fieldValue: 'to-be-deleted',
      });

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewGroups/${viewGroup.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      expect(deleteResponse.body).toEqual({ success: true });
    });

    it('should return 404 for non-existent view group', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewGroups/${TEST_NOT_EXISTING_VIEW_GROUP_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_GROUP_ID,
        ),
      );
    });

    it('should return success even when group is already deleted', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        fieldValue: 'double-delete-test',
      });

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewGroups/${viewGroup.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);

      const deleteResponse2 = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewGroups/${viewGroup.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        deleteResponse2,
        404,
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_GROUP_ID,
        ),
      );
    });
  });
});
