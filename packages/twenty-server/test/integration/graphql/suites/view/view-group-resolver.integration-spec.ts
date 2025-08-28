import {
  TEST_FIELD_METADATA_1_ID,
  TEST_NOT_EXISTING_VIEW_GROUP_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { createViewGroupOperationFactory } from 'test/integration/graphql/utils/create-view-group-operation-factory.util';
import { deleteViewGroupOperationFactory } from 'test/integration/graphql/utils/delete-view-group-operation-factory.util';
import { destroyViewGroupOperationFactory } from 'test/integration/graphql/utils/destroy-view-group-operation-factory.util';
import { findViewGroupsOperationFactory } from 'test/integration/graphql/utils/find-view-groups-operation-factory.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateViewGroupOperationFactory } from 'test/integration/graphql/utils/update-view-group-operation-factory.util';
import {
  createViewGroupData,
  updateViewGroupData,
} from 'test/integration/graphql/utils/view-data-factory.util';
import { createTestViewWithGraphQL } from 'test/integration/graphql/utils/view-graphql.util';
import {
  assertViewGroupStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  generateViewGroupExceptionMessage,
  ViewGroupExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-group.exception';

describe('View Group Resolver', () => {
  let testViewId: string;

  beforeEach(async () => {
    await cleanupViewRecords();

    const view = await createTestViewWithGraphQL({
      name: 'Test View for Groups',
    });

    testViewId = view.id;
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  describe('getCoreViewGroups', () => {
    it('should return empty array when no view groups exist', async () => {
      const operation = findViewGroupsOperationFactory({ viewId: testViewId });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getCoreViewGroups).toEqual([]);
    });

    it('should return view groups for a specific view', async () => {
      const groupData = createViewGroupData(testViewId, {
        isVisible: true,
        fieldValue: 'active',
        position: 0,
      });
      const createOperation = createViewGroupOperationFactory({
        data: groupData,
      });

      await makeGraphqlAPIRequest(createOperation);

      const getOperation = findViewGroupsOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getCoreViewGroups).toHaveLength(1);
      assertViewGroupStructure(response.body.data.getCoreViewGroups[0], {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        isVisible: true,
        fieldValue: 'active',
        position: 0,
        viewId: testViewId,
      });
    });
  });

  describe('createCoreViewGroup', () => {
    it('should create a new view group', async () => {
      const groupData = createViewGroupData(testViewId, {
        isVisible: false,
        fieldValue: 'inactive',
        position: 1,
      });

      const operation = createViewGroupOperationFactory({
        data: groupData,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertViewGroupStructure(response.body.data.createCoreViewGroup, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        isVisible: false,
        fieldValue: 'inactive',
        position: 1,
        viewId: testViewId,
      });
    });

    it('should create a view group with null fieldValue', async () => {
      const groupData = createViewGroupData(testViewId, {
        isVisible: true,
        fieldValue: '',
        position: 2,
      });

      const operation = createViewGroupOperationFactory({
        data: groupData,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertViewGroupStructure(response.body.data.createCoreViewGroup, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        isVisible: true,
        fieldValue: '',
        position: 2,
      });
    });
  });

  describe('updateCoreViewGroup', () => {
    it('should update an existing view group', async () => {
      const groupData = createViewGroupData(testViewId, {
        isVisible: true,
        fieldValue: 'original',
        position: 0,
      });
      const createOperation = createViewGroupOperationFactory({
        data: groupData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const viewGroup = createResponse.body.data.createCoreViewGroup;

      const updateInput = updateViewGroupData({
        isVisible: false,
        fieldValue: 'updated',
        position: 5,
      });
      const updateOperation = updateViewGroupOperationFactory({
        viewGroupId: viewGroup.id,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(updateOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.updateCoreViewGroup).toMatchObject({
        id: viewGroup.id,
        isVisible: false,
        fieldValue: 'updated',
        position: 5,
      });
    });

    it('should throw an error when updating non-existent view group', async () => {
      const operation = updateViewGroupOperationFactory({
        viewGroupId: TEST_NOT_EXISTING_VIEW_GROUP_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_GROUP_ID,
        ),
      );
    });
  });

  describe('deleteCoreViewGroup', () => {
    it('should delete an existing view group', async () => {
      const groupData = createViewGroupData(testViewId, {
        isVisible: true,
        fieldValue: 'to delete',
        position: 0,
      });
      const createOperation = createViewGroupOperationFactory({
        data: groupData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const viewGroup = createResponse.body.data.createCoreViewGroup;

      const deleteOperation = deleteViewGroupOperationFactory({
        viewGroupId: viewGroup.id,
      });
      const response = await makeGraphqlAPIRequest(deleteOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.deleteCoreViewGroup).toBe(true);
    });

    it('should throw an error when deleting non-existent view group', async () => {
      const operation = deleteViewGroupOperationFactory({
        viewGroupId: TEST_NOT_EXISTING_VIEW_GROUP_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_GROUP_ID,
        ),
      );
    });
  });

  describe('destroyCoreViewGroup', () => {
    it('should destroy an existing view group', async () => {
      const groupData = createViewGroupData(testViewId, {
        isVisible: true,
        fieldValue: 'to destroy',
        position: 0,
      });
      const createOperation = createViewGroupOperationFactory({
        data: groupData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const viewGroup = createResponse.body.data.createCoreViewGroup;

      const destroyOperation = destroyViewGroupOperationFactory({
        viewGroupId: viewGroup.id,
      });
      const response = await makeGraphqlAPIRequest(destroyOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.destroyCoreViewGroup).toBe(true);
    });

    it('should throw an error when destroying non-existent view group', async () => {
      const operation = destroyViewGroupOperationFactory({
        viewGroupId: TEST_NOT_EXISTING_VIEW_GROUP_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_GROUP_ID,
        ),
      );
    });
  });
});
