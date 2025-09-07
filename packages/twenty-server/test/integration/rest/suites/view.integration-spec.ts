import { TEST_NOT_EXISTING_VIEW_ID } from 'test/integration/constants/test-view-ids.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertRestApiErrorNotFoundResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import {
  createTestViewWithRestApi,
  deleteTestViewWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  assertViewStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';

import { ViewKey } from 'src/engine/core-modules/view/enums/view-key.enum';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';

describe('View REST API', () => {
  let testObjectMetadataId: string;

  beforeAll(async () => {
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
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  describe('GET /metadata/views', () => {
    it('should return all views for workspace', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/views',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return views filtered by objectMetadataId', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/views?objectMetadataId=${testObjectMetadataId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        assertViewStructure(response.body[0]);
      }
    });
  });

  describe('POST /metadata/views', () => {
    it('should create a new view', async () => {
      const viewName = generateRecordName('Test View');
      const view = await createTestViewWithRestApi({
        name: viewName,
        icon: 'IconTable',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        isCompact: false,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
        objectMetadataId: testObjectMetadataId,
      });

      assertViewStructure(view, {
        name: viewName,
        objectMetadataId: testObjectMetadataId,
        icon: 'IconTable',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        isCompact: false,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
      });
    });

    it('should create a kanban view', async () => {
      const viewName = generateRecordName('Test Kanban View');
      const kanbanView = await createTestViewWithRestApi({
        name: viewName,
        icon: 'IconKanban',
        type: ViewType.KANBAN,
        key: null,
        position: 1,
        isCompact: true,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
        objectMetadataId: testObjectMetadataId,
      });

      assertViewStructure(kanbanView, {
        name: viewName,
        type: ViewType.KANBAN,
        isCompact: true,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
        objectMetadataId: testObjectMetadataId,
      });

      await deleteTestViewWithRestApi(kanbanView.id);
    });
  });

  describe('GET /metadata/views/:id', () => {
    it('should return a view by id', async () => {
      const viewName = generateRecordName('Test View for Get');
      const view = await createTestViewWithRestApi({
        name: viewName,
        icon: 'IconTable',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        isCompact: false,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
        objectMetadataId: testObjectMetadataId,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/views/${view.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewStructure(response.body, {
        id: view.id,
        name: viewName,
        objectMetadataId: testObjectMetadataId,
      });
    });

    it('should return empty object for non-existent view', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/views/${TEST_NOT_EXISTING_VIEW_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('PATCH /metadata/views/:id', () => {
    it('should update an existing view', async () => {
      const viewName = generateRecordName('Test View for Update');
      const view = await createTestViewWithRestApi({
        name: viewName,
        icon: 'IconTable',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        isCompact: false,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
        objectMetadataId: testObjectMetadataId,
      });

      const updatedName = generateRecordName('Updated View');
      const updateData = {
        name: updatedName,
        type: ViewType.KANBAN,
        isCompact: true,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/views/${view.id}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewStructure(response.body, {
        id: view.id,
        name: updatedName,
        type: ViewType.KANBAN,
        isCompact: true,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
        objectMetadataId: testObjectMetadataId,
      });
    });

    it('should return 404 error when updating non-existent view', async () => {
      const updateData = {
        name: 'Updated View',
        type: ViewType.KANBAN,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/views/${TEST_NOT_EXISTING_VIEW_ID}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('DELETE /metadata/views/:id', () => {
    it('should delete an existing view', async () => {
      const viewName = generateRecordName('Test View for Delete');
      const view = await createTestViewWithRestApi({
        name: viewName,
        icon: 'IconTable',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        isCompact: false,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
        objectMetadataId: testObjectMetadataId,
      });

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/views/${view.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/views/${view.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(getResponse);
    });

    it('should return 404 error when deleting non-existent view', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/views/${TEST_NOT_EXISTING_VIEW_ID}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });
});
