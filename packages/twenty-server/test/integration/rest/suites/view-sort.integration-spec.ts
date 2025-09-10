import {
  TEST_NOT_EXISTING_VIEW_SORT_ID,
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
  createTestViewSortWithRestApi,
  createTestViewWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  assertViewSortStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { ViewSortDirection } from 'src/engine/core-modules/view/enums/view-sort-direction';
import {
  generateViewSortExceptionMessage,
  ViewSortExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-sort.exception';

describe('View Sort REST API', () => {
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;

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
      name: generateRecordName('Test View for Sorts'),
      objectMetadataId: testObjectMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
        viewId: TEST_VIEW_1_ID,
        direction: ViewSortDirection.ASC,
      });
    });
  });

  describe('POST /metadata/viewSorts', () => {
    it('should create a new view sort with ASC direction', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        direction: ViewSortDirection.ASC,
        fieldMetadataId: testFieldMetadataId,
      });

      assertViewSortStructure(viewSort, {
        fieldMetadataId: testFieldMetadataId,
        viewId: TEST_VIEW_1_ID,
        direction: ViewSortDirection.ASC,
      });
    });

    it('should create a view sort with DESC direction', async () => {
      const descSort = await createTestViewSortWithRestApi({
        direction: ViewSortDirection.DESC,
        fieldMetadataId: testFieldMetadataId,
      });

      assertViewSortStructure(descSort, {
        fieldMetadataId: testFieldMetadataId,
        viewId: TEST_VIEW_1_ID,
        direction: ViewSortDirection.DESC,
      });
    });
  });

  describe('GET /metadata/viewSorts/:id', () => {
    it('should return a view sort by id', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        direction: ViewSortDirection.ASC,
        fieldMetadataId: testFieldMetadataId,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewSorts/${viewSort.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewSortStructure(response.body, {
        id: viewSort.id,
        fieldMetadataId: testFieldMetadataId,
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

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('PATCH /metadata/viewSorts/:id', () => {
    it('should update an existing view sort', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        direction: ViewSortDirection.ASC,
        fieldMetadataId: testFieldMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
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

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('DELETE /metadata/viewSorts/:id', () => {
    it('should delete an existing view sort', async () => {
      const viewSort = await createTestViewSortWithRestApi({
        direction: ViewSortDirection.ASC,
        fieldMetadataId: testFieldMetadataId,
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

      assertRestApiErrorNotFoundResponse(getResponse);
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
