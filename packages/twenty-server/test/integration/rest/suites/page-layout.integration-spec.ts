import { TEST_NOT_EXISTING_PAGE_LAYOUT_ID } from 'test/integration/constants/test-page-layout-ids.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  createTestPageLayoutWithRestApi,
  deleteTestPageLayoutWithRestApi,
} from 'test/integration/rest/utils/page-layout-rest-api.util';
import {
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  assertPageLayoutStructure,
  cleanupPageLayoutRecords,
} from 'test/integration/utils/page-layout-test.util';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';

describe('Page Layout REST API', () => {
  let testObjectMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'myTestPageLayoutObject',
        namePlural: 'myTestPageLayoutObjects',
        labelSingular: 'My Test Page Layout Object',
        labelPlural: 'My Test Page Layout Objects',
        icon: 'IconLayout',
      },
    });

    testObjectMetadataId = objectMetadataId;
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
    await cleanupPageLayoutRecords();
  });

  describe('GET /rest/metadata/pageLayouts', () => {
    it('should return all page layouts for workspace', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/pageLayouts',
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return page layouts filtered by objectMetadataId', async () => {
      await createTestPageLayoutWithRestApi({
        name: 'Test Page Layout for Filter',
        objectMetadataId: testObjectMetadataId,
        type: PageLayoutType.RECORD_PAGE,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/pageLayouts?objectMetadataId=${testObjectMetadataId}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        assertPageLayoutStructure(response.body[0]);
        expect(response.body[0].objectMetadataId).toBe(testObjectMetadataId);
      }
    });

    it('should return empty array when no page layouts match objectMetadataId', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/pageLayouts?objectMetadataId=${TEST_NOT_EXISTING_PAGE_LAYOUT_ID}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /rest/metadata/pageLayouts', () => {
    it('should create a new page layout with all properties', async () => {
      const pageLayoutName = generateRecordName('Dashboard Page Layout');
      const pageLayout = await createTestPageLayoutWithRestApi({
        name: pageLayoutName,
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: testObjectMetadataId,
      });

      assertPageLayoutStructure(pageLayout, {
        name: pageLayoutName,
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: testObjectMetadataId,
      });

      await deleteTestPageLayoutWithRestApi(pageLayout.id);
    });

    it('should create a page layout with minimum required fields', async () => {
      const pageLayoutName = generateRecordName('Minimal Page Layout');
      const pageLayout = await createTestPageLayoutWithRestApi({
        name: pageLayoutName,
      });

      assertPageLayoutStructure(pageLayout, {
        name: pageLayoutName,
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
      });

      await deleteTestPageLayoutWithRestApi(pageLayout.id);
    });

    describe('GET /rest/metadata/pageLayouts/:id', () => {
      it('should return a page layout by id', async () => {
        const pageLayoutName = generateRecordName('Test Page Layout for Get');
        const pageLayout = await createTestPageLayoutWithRestApi({
          name: pageLayoutName,
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: testObjectMetadataId,
        });

        const response = await makeRestAPIRequest({
          method: 'get',
          path: `/metadata/pageLayouts/${pageLayout.id}`,
          bearer: API_KEY_ACCESS_TOKEN,
        });

        assertRestApiSuccessfulResponse(response);
        assertPageLayoutStructure(response.body, {
          id: pageLayout.id,
          name: pageLayoutName,
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: testObjectMetadataId,
        });

        await deleteTestPageLayoutWithRestApi(pageLayout.id);
      });

      it('should return {} for non-existent page layout', async () => {
        const response = await makeRestAPIRequest({
          method: 'get',
          path: `/metadata/pageLayouts/${TEST_NOT_EXISTING_PAGE_LAYOUT_ID}`,
          bearer: API_KEY_ACCESS_TOKEN,
        });

        assertRestApiErrorResponse(
          response,
          404,
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
            TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
          ),
        );
      });
    });

    describe('PATCH /rest/metadata/pageLayouts/:id', () => {
      it('should update an existing page layout', async () => {
        const pageLayoutName = generateRecordName(
          'Test Page Layout for Update',
        );
        const pageLayout = await createTestPageLayoutWithRestApi({
          name: pageLayoutName,
          type: PageLayoutType.RECORD_PAGE,
          objectMetadataId: testObjectMetadataId,
        });

        const updatedName = generateRecordName('Updated Page Layout');
        const updateData = {
          name: updatedName,
          type: PageLayoutType.DASHBOARD,
        };

        const response = await makeRestAPIRequest({
          method: 'patch',
          path: `/metadata/pageLayouts/${pageLayout.id}`,
          body: updateData,
          bearer: API_KEY_ACCESS_TOKEN,
        });

        assertRestApiSuccessfulResponse(response);
        assertPageLayoutStructure(response.body, {
          id: pageLayout.id,
          name: updatedName,
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: testObjectMetadataId,
        });

        await deleteTestPageLayoutWithRestApi(pageLayout.id);
      });

      it('should update only provided fields', async () => {
        const originalName = generateRecordName('Original Page Layout');
        const pageLayout = await createTestPageLayoutWithRestApi({
          name: originalName,
          type: PageLayoutType.RECORD_PAGE,
          objectMetadataId: testObjectMetadataId,
        });

        const updatedName = generateRecordName('Updated Name Only');
        const updateData = {
          name: updatedName,
        };

        const response = await makeRestAPIRequest({
          method: 'patch',
          path: `/metadata/pageLayouts/${pageLayout.id}`,
          body: updateData,
          bearer: API_KEY_ACCESS_TOKEN,
        });

        assertRestApiSuccessfulResponse(response);
        assertPageLayoutStructure(response.body, {
          id: pageLayout.id,
          name: updatedName,
          type: PageLayoutType.RECORD_PAGE,
          objectMetadataId: testObjectMetadataId,
        });

        await deleteTestPageLayoutWithRestApi(pageLayout.id);
      });

      it('should return 404 error when updating non-existent page layout', async () => {
        const updateData = {
          name: 'Updated Page Layout',
          type: PageLayoutType.DASHBOARD,
        };

        const response = await makeRestAPIRequest({
          method: 'patch',
          path: `/metadata/pageLayouts/${TEST_NOT_EXISTING_PAGE_LAYOUT_ID}`,
          body: updateData,
          bearer: API_KEY_ACCESS_TOKEN,
        });

        assertRestApiErrorResponse(
          response,
          404,
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
            TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
          ),
        );
      });
    });

    describe('DELETE /rest/metadata/pageLayouts/:id', () => {
      it('should delete an existing page layout', async () => {
        const pageLayoutName = generateRecordName(
          'Test Page Layout for Delete',
        );
        const pageLayout = await createTestPageLayoutWithRestApi({
          name: pageLayoutName,
          type: PageLayoutType.RECORD_INDEX,
          objectMetadataId: testObjectMetadataId,
        });

        const deleteResponse = await makeRestAPIRequest({
          method: 'delete',
          path: `/metadata/pageLayouts/${pageLayout.id}`,
          bearer: API_KEY_ACCESS_TOKEN,
        });

        assertRestApiSuccessfulResponse(deleteResponse);
        assertPageLayoutStructure(deleteResponse.body, pageLayout);

        const getResponse = await makeRestAPIRequest({
          method: 'get',
          path: `/metadata/pageLayouts/${pageLayout.id}`,
          bearer: API_KEY_ACCESS_TOKEN,
        });

        assertRestApiErrorResponse(
          getResponse,
          404,
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
            pageLayout.id,
          ),
        );
      });

      it('should return 404 error when deleting non-existent page layout', async () => {
        const response = await makeRestAPIRequest({
          method: 'delete',
          path: `/metadata/pageLayouts/${TEST_NOT_EXISTING_PAGE_LAYOUT_ID}`,
          bearer: API_KEY_ACCESS_TOKEN,
        });

        assertRestApiErrorResponse(
          response,
          404,
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
            TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
          ),
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle multiple page layouts for same object', async () => {
        const pageLayout1 = await createTestPageLayoutWithRestApi({
          name: generateRecordName('Page Layout 1'),
          type: PageLayoutType.RECORD_PAGE,
          objectMetadataId: testObjectMetadataId,
        });

        const pageLayout2 = await createTestPageLayoutWithRestApi({
          name: generateRecordName('Page Layout 2'),
          type: PageLayoutType.RECORD_INDEX,
          objectMetadataId: testObjectMetadataId,
        });

        const response = await makeRestAPIRequest({
          method: 'get',
          path: `/metadata/pageLayouts?objectMetadataId=${testObjectMetadataId}`,
          bearer: API_KEY_ACCESS_TOKEN,
        });

        assertRestApiSuccessfulResponse(response);
        expect(response.body).toHaveLength(2);

        await Promise.all([
          deleteTestPageLayoutWithRestApi(pageLayout1.id),
          deleteTestPageLayoutWithRestApi(pageLayout2.id),
        ]);
      });

      it('should handle page layouts with null objectMetadataId', async () => {
        const pageLayout = await createTestPageLayoutWithRestApi({
          name: generateRecordName('Global Page Layout'),
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
        });

        assertPageLayoutStructure(pageLayout, {
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
        });

        await deleteTestPageLayoutWithRestApi(pageLayout.id);
      });
    });
  });
});
