import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { destroyOneCoreViewGroup } from 'test/integration/metadata/suites/view-group/utils/destroy-one-core-view-group.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertRestApiErrorNotFoundResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import {
  createTestViewGroupWithRestApi,
  createTestViewWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import { assertViewGroupStructure } from 'test/integration/utils/view-test.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';

import { type ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';

describe('View Group REST API', () => {
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;
  let testViewId: string;
  let testViewGroupId: string | undefined;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testViewGroupObject',
        namePlural: 'testViewGroupObjects',
        labelSingular: 'Test View Group Object',
        labelPlural: 'Test View Group Objects',
        icon: 'IconGroup',
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
      expectToFail: false,
      input: createFieldInput,
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    testFieldMetadataId = fieldMetadataId;

    const testView = await createTestViewWithRestApi({
      name: 'Test View for Group Integration',
      objectMetadataId: testObjectMetadataId,
    });

    testViewId = testView.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
  });

  afterEach(async () => {
    if (!testViewGroupId) return;

    await destroyOneCoreViewGroup({
      input: {
        id: testViewGroupId,
      },
      expectToFail: false,
    });
    testViewGroupId = undefined;
  });

  describe('GET /metadata/viewGroups', () => {
    it('should return empty array when no view groups exist', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewGroups?viewId=${testViewId}`,
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
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        fieldValue: 'test-field-value',
        isVisible: true,
        position: 0,
      });

      testViewGroupId = viewGroup.id;

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewGroups?viewId=${testViewId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);

      const returnedViewGroup = response.body.find(
        (el: ViewGroupDTO) => el.id === viewGroup.id,
      );

      jestExpectToBeDefined(returnedViewGroup);

      assertViewGroupStructure(returnedViewGroup, {
        id: viewGroup.id,
        viewId: testViewId,
        fieldValue: 'test-field-value',
        isVisible: true,
        position: 0,
      });

      testViewGroupId = viewGroup.id;
    });

    it('should return multiple view groups for a view', async () => {
      const viewGroup1 = await createTestViewGroupWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        fieldValue: 'group-1',
        position: 0,
      });

      const viewGroup2 = await createTestViewGroupWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        fieldValue: 'group-2',
        position: 1,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewGroups?viewId=${testViewId}`,
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

      testViewGroupId = viewGroup2.id;
    });
  });

  describe('GET /metadata/viewGroups/:id', () => {
    it('should return a specific view group by id', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        fieldValue: 'specific-group',
        isVisible: false,
      });

      testViewGroupId = viewGroup.id;

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewGroups/${viewGroup.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewGroupStructure(response.body, {
        id: viewGroup.id,
        viewId: testViewId,
        fieldValue: 'specific-group',
        isVisible: false,
      });

      testViewGroupId = viewGroup.id;
    });
  });

  describe.only('POST /metadata/viewGroups', () => {
    it('should create a new view group', async () => {
      const viewGroupData = {
        viewId: testViewId,
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
        viewId: testViewId,
        fieldValue: 'new-group-value',
        isVisible: true,
        position: 5,
      });

      testViewGroupId = response.body.id;
    });

    it('should create view group with minimal required fields', async () => {
      const viewGroupData = {
        viewId: testViewId,
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
        viewId: testViewId,
        fieldValue: 'minimal-group',
        isVisible: true,
        position: 0,
      });

      testViewGroupId = response.body.id;
    });

    it('should fail to create view group with missing required fields', async () => {
      const invalidData = {
        viewId: testViewId,
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/viewGroups',
        body: invalidData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(response.status).toBe(400);

      const errorResponse = JSON.parse(response.text);

      expect(errorResponse).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errorResponse),
      );
    });
  });

  describe('PATCH /metadata/viewGroups/:id', () => {
    it('should update an existing view group', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        fieldValue: 'original-value',
        isVisible: true,
        position: 1,
      });

      testViewGroupId = viewGroup.id;

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
        viewId: testViewId,
        fieldValue: 'updated-value',
        isVisible: false,
        position: 2,
      });
    });

    it('should update only specific fields', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        fieldValue: 'original-value',
        isVisible: true,
        position: 1,
      });

      testViewGroupId = viewGroup.id;

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
    });

    it('should return 404 for non-existent view group', async () => {
      const updateData = {
        fieldValue: 'test-update',
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewGroups/20202020-9c8b-4a7e-9f2d-1a2b3c4d5e6f`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('DELETE /metadata/viewGroups/:id', () => {
    it('should delete an existing view group', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        fieldValue: 'to-be-deleted',
      });

      testViewGroupId = viewGroup.id;

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
        path: `/metadata/viewGroups/20202020-9c8b-4a7e-9f2d-1a2b3c4d5e6f`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });

    it('should return success even when group is already deleted', async () => {
      const viewGroup = await createTestViewGroupWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        fieldValue: 'double-delete-test',
      });

      testViewGroupId = viewGroup.id;

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
