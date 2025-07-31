import {
  TEST_NOT_EXISTING_VIEW_ID,
  TEST_OBJECT_METADATA_1_ID,
  TEST_OBJECT_METADATA_2_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { createViewOperationFactory } from 'test/integration/graphql/utils/create-view-operation-factory.util';
import { deleteViewOperationFactory } from 'test/integration/graphql/utils/delete-view-operation-factory.util';
import { findViewOperationFactory } from 'test/integration/graphql/utils/find-view-operation-factory.util';
import { findViewsOperationFactory } from 'test/integration/graphql/utils/find-views-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateViewOperationFactory } from 'test/integration/graphql/utils/update-view-operation-factory.util';
import {
  createViewData,
  updateViewData,
} from 'test/integration/graphql/utils/view-data-factory.util';
import {
  assertErrorResponse,
  assertSuccessfulResponse,
  assertViewStructure,
  cleanupViewRecords,
  createTestView,
} from 'test/integration/graphql/utils/view-test.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewExceptionMessage } from 'src/modules/view/views.exception';

describe('View Resolver', () => {
  beforeEach(async () => {
    await cleanupViewRecords();
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  describe('getCoreViews', () => {
    it('should return empty array when no views exist', async () => {
      const operation = findViewsOperationFactory();
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViews).toEqual([]);
    });

    it('should return all views for workspace when no objectMetadataId provided', async () => {
      const viewName = 'Test View';

      await createTestView({
        name: viewName,
      });

      const viewData = createViewData({
        name: viewName,
      });

      const operation = findViewsOperationFactory();
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViews).toHaveLength(1);
      expect(response.body.data.getCoreViews[0]).toMatchObject(viewData);
    });

    it('should filter views by objectMetadataId when provided', async () => {
      const object1ViewName = 'View for Object 1';
      const object2ViewName = 'View for Object 2';

      await Promise.all([
        createTestView({
          name: object1ViewName,
          objectMetadataId: TEST_OBJECT_METADATA_1_ID,
        }),
        createTestView({
          name: object2ViewName,
          objectMetadataId: TEST_OBJECT_METADATA_2_ID,
        }),
      ]);

      const operation = findViewsOperationFactory({
        objectMetadataId: TEST_OBJECT_METADATA_1_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViews).toHaveLength(1);
      expect(response.body.data.getCoreViews[0]).toMatchObject({
        name: object1ViewName,
      });
    });
  });

  describe('getCoreView', () => {
    it('should return null when view does not exist', async () => {
      const operation = findViewOperationFactory({
        viewId: TEST_NOT_EXISTING_VIEW_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreView).toBeNull();
    });

    it('should return view when it exists', async () => {
      const viewName = 'Test View for Get';

      const view = await createTestView({
        name: viewName,
      });

      const operation = findViewOperationFactory({ viewId: view.id });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewStructure(response.body.data.getCoreView, {
        id: view.id,
        name: viewName,
        objectMetadataId: TEST_OBJECT_METADATA_1_ID,
      });
    });
  });

  describe('createCoreView', () => {
    it('should create a new view with all properties', async () => {
      const input = {
        name: 'Kanban View',
        objectMetadataId: TEST_OBJECT_METADATA_1_ID,
        icon: 'IconDeal',
        type: 'kanban',
        key: 'OPPORTUNITIES',
        position: 1,
        isCompact: true,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
      };

      const operation = createViewOperationFactory({ data: input });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewStructure(response.body.data.createCoreView, {
        name: input.name,
        objectMetadataId: input.objectMetadataId,
        type: input.type,
        key: input.key,
        icon: input.icon,
        position: input.position,
        isCompact: input.isCompact,
        openRecordIn: input.openRecordIn,
      });
    });

    it('should create a view with minimum required fields', async () => {
      const input = {
        name: 'Minimal View',
        objectMetadataId: TEST_OBJECT_METADATA_1_ID,
        icon: 'IconList',
      };

      const operation = createViewOperationFactory({ data: input });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewStructure(response.body.data.createCoreView, {
        name: input.name,
        objectMetadataId: input.objectMetadataId,
        icon: input.icon,
        type: 'table',
        key: 'INDEX',
        position: 0,
        isCompact: false,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
      });
    });
  });

  describe('updateCoreView', () => {
    it('should update an existing view', async () => {
      const view = await createTestView({
        name: 'Original View',
        type: 'table',
        isCompact: false,
      });

      const updateInput = updateViewData({
        name: 'Updated View',
        type: 'kanban',
        isCompact: true,
      });

      const operation = updateViewOperationFactory({
        viewId: view.id,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      expect(response.body.data.updateCoreView).toMatchObject({
        id: view.id,
        ...updateInput,
      });
    });

    it('should throw error when updating non-existent view', async () => {
      const operation = updateViewOperationFactory({
        viewId: TEST_NOT_EXISTING_VIEW_ID,
        data: { name: 'Non-existent View' },
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        ViewExceptionMessage.VIEW_NOT_FOUND,
      );
    });
  });

  describe('deleteCoreView', () => {
    it('should delete an existing view', async () => {
      const view = await createTestView({
        name: 'View to Delete',
      });

      const deleteOperation = deleteViewOperationFactory({ viewId: view.id });
      const deleteResponse = await makeGraphqlAPIRequest(deleteOperation);

      assertSuccessfulResponse(deleteResponse);
      expect(deleteResponse.body.data.deleteCoreView).toBe(true);

      const getOperation = findViewOperationFactory({ viewId: view.id });
      const getResponse = await makeGraphqlAPIRequest(getOperation);

      expect(getResponse.body.data.getCoreView).toBeNull();
    });

    it('should throw an error when deleting non-existent view', async () => {
      const operation = deleteViewOperationFactory({
        viewId: TEST_NOT_EXISTING_VIEW_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        ViewExceptionMessage.VIEW_NOT_FOUND,
      );
    });
  });
});
