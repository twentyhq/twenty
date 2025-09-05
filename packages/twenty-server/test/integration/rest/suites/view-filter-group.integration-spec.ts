import {
  TEST_NOT_EXISTING_VIEW_FILTER_GROUP_ID,
  TEST_VIEW_1_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertRestApiErrorNotFoundResponse,
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import {
  createTestViewFilterGroupWithRestApi,
  createTestViewWithRestApi,
  deleteTestViewFilterGroupWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  assertViewFilterGroupStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';

import { ViewFilterGroupLogicalOperator } from 'src/engine/core-modules/view/enums/view-filter-group-logical-operator';
import {
  generateViewFilterGroupExceptionMessage,
  ViewFilterGroupExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-filter-group.exception';

describe('View Filter Group REST API', () => {
  let testObjectMetadataId: string;

  beforeAll(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: testObjectMetadataId },
    });

    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'myTestObject',
        namePlural: 'myTestObjects',
        labelSingular: 'My Test Object',
        labelPlural: 'My Test Objects',
        icon: 'Icon123',
      },
    });

    testObjectMetadataId = objectMetadataId;
  });

  afterAll(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: testObjectMetadataId },
    });
  });

  beforeEach(async () => {
    await cleanupViewRecords();

    await createTestViewWithRestApi({
      name: generateRecordName('Test View for Filter Groups'),
      objectMetadataId: testObjectMetadataId,
    });
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  describe('GET /metadata/viewFilterGroups', () => {
    it('should return empty array when no view filter groups exist', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilterGroups?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toEqual([]);
    });

    it('should return all view filter groups for workspace when no viewId provided', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/viewFilterGroups',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return view filter groups for a specific view after creating one', async () => {
      const viewFilterGroup = await createTestViewFilterGroupWithRestApi({
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilterGroups?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);

      const returnedViewFilterGroup = response.body[0];

      assertViewFilterGroupStructure(returnedViewFilterGroup, {
        id: viewFilterGroup.id,
        viewId: TEST_VIEW_1_ID,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });

      await deleteTestViewFilterGroupWithRestApi(viewFilterGroup.id);
    });

    it('should return nested filter groups with parent relationships', async () => {
      const parentData = {
        viewId: TEST_VIEW_1_ID,
        logicalOperator: 'AND',
        objectMetadataId: testObjectMetadataId,
      };

      const parentResponse = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewFilterGroups',
        body: parentData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const parentId = parentResponse.body.id;

      const childData = {
        viewId: TEST_VIEW_1_ID,
        parentViewFilterGroupId: parentId,
        logicalOperator: 'OR',
        objectMetadataId: testObjectMetadataId,
      };

      const childResponse = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewFilterGroups',
        body: childData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const childId = childResponse.body.id;

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilterGroups?viewId=${TEST_VIEW_1_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);

      const parentGroup = response.body.find(
        (group: any) => group.parentViewFilterGroupId === null,
      );
      const childGroup = response.body.find(
        (group: any) => group.parentViewFilterGroupId !== null,
      );

      expect(parentGroup).toBeDefined();
      expect(parentGroup.logicalOperator).toBe('AND');
      expect(parentGroup.parentViewFilterGroupId).toBeNull();

      expect(childGroup).toBeDefined();
      expect(childGroup.parentViewFilterGroupId).toBe(parentId);
      expect(childGroup.logicalOperator).toBe('OR');

      const deleteChildResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFilterGroups/${childId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteChildResponse);

      const deleteParentResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFilterGroups/${parentId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteParentResponse);
    });
  });

  describe('POST /metadata/viewFilterGroups', () => {
    it('should create a new filter group with AND operator', async () => {
      const viewFilterGroup = await createTestViewFilterGroupWithRestApi({
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });

      assertViewFilterGroupStructure(viewFilterGroup, {
        viewId: TEST_VIEW_1_ID,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      });
      expect(viewFilterGroup.parentViewFilterGroupId).toBeNull();
    });

    it('should create a filter group with OR operator', async () => {
      const orGroup = await createTestViewFilterGroupWithRestApi({
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      });

      assertViewFilterGroupStructure(orGroup, {
        viewId: TEST_VIEW_1_ID,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      });
      expect(orGroup.parentViewFilterGroupId).toBeNull();

      await deleteTestViewFilterGroupWithRestApi(orGroup.id);
    });

    it('should create a filter group with NOT operator', async () => {
      const viewFilterGroupData = {
        viewId: TEST_VIEW_1_ID,
        logicalOperator: 'NOT',
      };

      const notGroupResponse = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewFilterGroups',
        body: viewFilterGroupData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(notGroupResponse, 201);

      const notGroupId = notGroupResponse.body.id;

      await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFilterGroups/${notGroupId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });
    });

    it('should create a nested filter group with parent relationship', async () => {
      const parentData = {
        viewId: TEST_VIEW_1_ID,
        logicalOperator: 'AND',
        objectMetadataId: testObjectMetadataId,
      };

      const parentResponse = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewFilterGroups',
        body: parentData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const parentId = parentResponse.body.id;

      const childData = {
        viewId: TEST_VIEW_1_ID,
        parentViewFilterGroupId: parentId,
        logicalOperator: 'OR',
        objectMetadataId: testObjectMetadataId,
      };

      const childGroupResponse = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewFilterGroups',
        body: childData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(childGroupResponse, 201);
    });
  });

  describe('GET /metadata/viewFilterGroups/:id', () => {
    it('should return a view filter group by id', async () => {
      const viewFilterGroupData = {
        viewId: TEST_VIEW_1_ID,
        logicalOperator: 'NOT',
        objectMetadataId: testObjectMetadataId,
      };

      const createResponse = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewFilterGroups',
        body: viewFilterGroupData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const viewFilterGroupId = createResponse.body.id;

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilterGroups/${viewFilterGroupId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(viewFilterGroupId);
      expect(response.body.viewId).toBe(TEST_VIEW_1_ID);
      expect(response.body.logicalOperator).toBe('NOT');
    });

    it('should return empty object for non-existent view filter group', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilterGroups/${TEST_NOT_EXISTING_VIEW_FILTER_GROUP_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('PATCH /metadata/viewFilterGroups/:id', () => {
    it('should update an existing filter group', async () => {
      const viewFilterGroupData = {
        viewId: TEST_VIEW_1_ID,
        logicalOperator: 'AND',
        objectMetadataId: testObjectMetadataId,
      };

      const createResponse = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewFilterGroups',
        body: viewFilterGroupData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const viewFilterGroupId = createResponse.body.id;

      const updateData = {
        logicalOperator: 'OR',
        objectMetadataId: testObjectMetadataId,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFilterGroups/${viewFilterGroupId}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(viewFilterGroupId);
      expect(response.body.logicalOperator).toBe('OR');
      expect(response.body.viewId).toBe(TEST_VIEW_1_ID);
    });

    it('should update parent relationship of filter group', async () => {
      const parentData = {
        viewId: TEST_VIEW_1_ID,
        logicalOperator: 'AND',
        objectMetadataId: testObjectMetadataId,
      };

      const parentResponse = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewFilterGroups',
        body: parentData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const parentId = parentResponse.body.id;

      const childData = {
        viewId: TEST_VIEW_1_ID,
        logicalOperator: 'OR',
        objectMetadataId: testObjectMetadataId,
      };

      const childResponse = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewFilterGroups',
        body: childData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const childId = childResponse.body.id;

      const updateData = {
        parentViewFilterGroupId: parentId,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFilterGroups/${childId}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(childId);
      expect(response.body.parentViewFilterGroupId).toBe(parentId);
      expect(response.body.logicalOperator).toBe(
        ViewFilterGroupLogicalOperator.OR,
      );
    });

    it('should return 404 error when updating non-existent filter group', async () => {
      const updateData = {
        logicalOperator: 'AND',
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFilterGroups/${TEST_NOT_EXISTING_VIEW_FILTER_GROUP_ID}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FILTER_GROUP_ID,
        ),
      );
    });
  });

  describe('DELETE /metadata/viewFilterGroups/:id', () => {
    it('should delete an existing filter group', async () => {
      const viewFilterGroupData = {
        viewId: TEST_VIEW_1_ID,
        logicalOperator: 'AND',
        objectMetadataId: testObjectMetadataId,
      };

      const createResponse = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewFilterGroups',
        body: viewFilterGroupData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const viewFilterGroupId = createResponse.body.id;

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFilterGroups/${viewFilterGroupId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      expect(deleteResponse.body).toBeDefined();
      expect(deleteResponse.body.success).toBe(true);

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFilterGroups/${viewFilterGroupId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });

    it('should return 404 error when deleting non-existent filter group', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFilterGroups/${TEST_NOT_EXISTING_VIEW_FILTER_GROUP_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });
});
