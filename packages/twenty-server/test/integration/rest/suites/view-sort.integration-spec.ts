import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertRestApiErrorNotFoundResponse,
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import {
  createTestViewSortWithRestApi,
  createTestViewWithRestApi,
  deleteTestViewSortWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import { assertViewSortStructure } from 'test/integration/utils/view-test.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';

import { type ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import {
  generateViewSortExceptionMessage,
  ViewSortExceptionMessageKey,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';

describe('View Sort REST API', () => {
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;
  let testViewId: string;
  let testViewSortId: string | undefined;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'testViewSortObject',
        namePlural: 'testViewSortObjects',
        labelSingular: 'Test View Sort Object',
        labelPlural: 'Test View Sort Objects',
        icon: 'IconSort',
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

    const testView = await createTestViewWithRestApi({
      name: 'Test View for Sort Integration',
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
      input: { idToDelete: testObjectMetadataId },
    });
  });

  afterEach(async () => {
    if (!testViewSortId) return;

    await deleteTestViewSortWithRestApi(testViewSortId);
    testViewSortId = undefined;
  });

  describe('GET /metadata/viewSorts', () => {
    it('should return empty array when no view sorts exist', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewSorts?viewId=${testViewId}`,
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
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
      });

      testViewSortId = viewSort.id;

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewSorts?viewId=${testViewId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);

      const returnedViewSort = response.body.find(
        (el: ViewSortDTO) => el.id === viewSort.id,
      );

      jestExpectToBeDefined(returnedViewSort);

      assertViewSortStructure(returnedViewSort, {
        id: viewSort.id,
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        direction: ViewSortDirection.ASC,
      });
    });
  });

  describe('POST /metadata/viewSorts', () => {
    it('should create a new view sort with ASC direction', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
      });

      testViewSortId = viewSort.id;

      assertViewSortStructure(viewSort, {
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        direction: ViewSortDirection.ASC,
      });
    });

    it('should create a view sort with DESC direction', async () => {
      const descSort = await createTestViewSortWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.DESC,
      });

      testViewSortId = descSort.id;

      assertViewSortStructure(descSort, {
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        direction: ViewSortDirection.DESC,
      });
    });
  });

  describe('GET /metadata/viewSorts/:id', () => {
    it('should return a view sort by id', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
      });

      testViewSortId = viewSort.id;

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewSorts/${viewSort.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewSortStructure(response.body, {
        id: viewSort.id,
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        direction: ViewSortDirection.ASC,
      });
    });

    it('should return empty object for non-existent view sort', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewSorts/20202020-a1b2-4c3d-8e9f-123456789abc`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('PATCH /metadata/viewSorts/:id', () => {
    it('should update an existing view sort', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
      });

      testViewSortId = viewSort.id;

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
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
      });
    });

    it('should return 404 error when updating non-existent view sort', async () => {
      const updateData = {
        direction: ViewSortDirection.DESC,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewSorts/20202020-a1b2-4c3d-8e9f-123456789abc`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('DELETE /metadata/viewSorts/:id', () => {
    it('should delete an existing view sort', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
      });

      testViewSortId = viewSort.id;

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

      assertRestApiErrorNotFoundResponse(getResponse);
    });

    it('should return 404 error when deleting non-existent view sort', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewSorts/20202020-a1b2-4c3d-8e9f-123456789abc`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          '20202020-a1b2-4c3d-8e9f-123456789abc',
        ),
      );
    });
  });
});
