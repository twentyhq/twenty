import {
  TEST_NOT_EXISTING_VIEW_GROUP_ID,
  TEST_VIEW_1_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertRestApiErrorNotFoundResponse,
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
import { FieldMetadataType } from 'twenty-shared/types';

import { type ViewGroupEntity } from 'src/engine/core-modules/view/entities/view-group.entity';
import {
  generateViewGroupExceptionMessage,
  ViewGroupExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-group.exception';

describe('View Group REST API', () => {
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;

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

    const createFieldInput = {
      name: 'testField',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
      objectMetadataId: testObjectMetadataId,
      isLabelSyncedWithName: true,
    };

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      input: createFieldInput,
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    testFieldMetadataId = fieldMetadataId;
  });

  afterAll(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: testObjectMetadataId },
    });
  });

  beforeEach(async () => {
    await cleanupViewRecords();

    await createTestViewWithRestApi({
      name: generateRecordName('Test View for Groups'),
      objectMetadataId: testObjectMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
      });

      const viewGroup2 = await createTestViewGroupWithRestApi({
        fieldValue: 'group-2',
        position: 1,
        fieldMetadataId: testFieldMetadataId,
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
        (group: ViewGroupEntity) => group.id === viewGroup1.id,
      );
      const group2 = response.body.find(
        (group: ViewGroupEntity) => group.id === viewGroup2.id,
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
        fieldMetadataId: testFieldMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
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

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('DELETE /metadata/viewGroups/:id', () => {
    it('should delete an existing view group', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        fieldValue: 'to-be-deleted',
        fieldMetadataId: testFieldMetadataId,
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

      assertRestApiErrorNotFoundResponse(response);
    });

    it('should return success even when group is already deleted', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        fieldValue: 'double-delete-test',
        fieldMetadataId: testFieldMetadataId,
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

      assertRestApiErrorNotFoundResponse(deleteResponse2);
    });
  });
});
