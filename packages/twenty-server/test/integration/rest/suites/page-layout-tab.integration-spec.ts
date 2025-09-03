import { TEST_NOT_EXISTING_PAGE_LAYOUT_ID } from 'test/integration/constants/test-page-layout-ids.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  createTestPageLayoutWithRestApi,
  deleteTestPageLayoutWithRestApi,
} from 'test/integration/rest/utils/page-layout-rest-api.util';
import {
  createTestPageLayoutTabWithRestApi,
  deleteTestPageLayoutTabWithRestApi,
} from 'test/integration/rest/utils/page-layout-tab-rest-api.util';
import {
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  assertPageLayoutTabStructure,
  cleanupPageLayoutTabRecords,
} from 'test/integration/utils/page-layout-tab-test.util';

import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import {
  PageLayoutTabExceptionMessageKey,
  generatePageLayoutTabExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';

const TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID =
  '20202020-df6b-4273-9aca-7170b998c176';

describe('Page Layout Tab REST API', () => {
  let testObjectMetadataId: string;
  let testPageLayoutId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'myTestPageLayoutTabObject',
        namePlural: 'myTestPageLayoutTabObjects',
        labelSingular: 'My Test Page Layout Tab Object',
        labelPlural: 'My Test Page Layout Tab Objects',
        icon: 'IconLayout',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const testPageLayout = await createTestPageLayoutWithRestApi({
      name: generateRecordName('Test Page Layout for Tabs'),
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: testObjectMetadataId,
    });

    testPageLayoutId = testPageLayout.id;
  });

  afterAll(async () => {
    await deleteTestPageLayoutWithRestApi(testPageLayoutId);
    await deleteOneObjectMetadata({
      input: { idToDelete: testObjectMetadataId },
    });
  });

  afterEach(async () => {
    await cleanupPageLayoutTabRecords();
  });

  describe('GET /rest/metadata/page-layout-tabs', () => {
    it('should return page layout tabs filtered by pageLayoutId', async () => {
      await createTestPageLayoutTabWithRestApi({
        title: 'Test Tab for Filter',
        pageLayoutId: testPageLayoutId,
        position: 0,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-tabs?pageLayoutId=${testPageLayoutId}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        assertPageLayoutTabStructure(response.body[0]);
        expect(response.body[0].pageLayoutId).toBe(testPageLayoutId);
      }
    });

    it('should return empty array when no page layout tabs match pageLayoutId', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-tabs?pageLayoutId=${TEST_NOT_EXISTING_PAGE_LAYOUT_ID}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return error when pageLayoutId is missing', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/page-layout-tabs',
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        400,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_ID_REQUIRED,
        ),
      );
    });
  });

  describe('POST /rest/metadata/page-layout-tabs', () => {
    it('should create a new page layout tab with all properties', async () => {
      const pageLayoutTabTitle = generateRecordName('Test Tab');
      const pageLayoutTab = await createTestPageLayoutTabWithRestApi({
        title: pageLayoutTabTitle,
        pageLayoutId: testPageLayoutId,
        position: 1,
      });

      assertPageLayoutTabStructure(pageLayoutTab, {
        title: pageLayoutTabTitle,
        pageLayoutId: testPageLayoutId,
        position: 1,
      });

      await deleteTestPageLayoutTabWithRestApi(pageLayoutTab.id);
    });

    it('should create a page layout tab with minimum required fields', async () => {
      const pageLayoutTabTitle = generateRecordName('Minimal Tab');
      const pageLayoutTab = await createTestPageLayoutTabWithRestApi({
        title: pageLayoutTabTitle,
        pageLayoutId: testPageLayoutId,
      });

      assertPageLayoutTabStructure(pageLayoutTab, {
        title: pageLayoutTabTitle,
        pageLayoutId: testPageLayoutId,
        position: 0,
      });

      await deleteTestPageLayoutTabWithRestApi(pageLayoutTab.id);
    });

    it('should return error when creating tab with invalid pageLayoutId', async () => {
      const pageLayoutTabData = {
        title: generateRecordName('Invalid Tab'),
        pageLayoutId: TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
        position: 0,
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/page-layout-tabs',
        body: pageLayoutTabData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        400,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
        ),
      );
    });

    it('should return error when creating tab without title', async () => {
      const pageLayoutTabData = {
        pageLayoutId: testPageLayoutId,
        position: 0,
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/page-layout-tabs',
        body: pageLayoutTabData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(response, 400);
    });
  });

  describe('GET /rest/metadata/page-layout-tabs/:id', () => {
    it('should return a page layout tab by id', async () => {
      const pageLayoutTabTitle = generateRecordName('Test Tab for Get');
      const pageLayoutTab = await createTestPageLayoutTabWithRestApi({
        title: pageLayoutTabTitle,
        pageLayoutId: testPageLayoutId,
        position: 2,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-tabs/${pageLayoutTab.id}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertPageLayoutTabStructure(response.body, {
        id: pageLayoutTab.id,
        title: pageLayoutTabTitle,
        pageLayoutId: testPageLayoutId,
        position: 2,
      });

      await deleteTestPageLayoutTabWithRestApi(pageLayoutTab.id);
    });

    it('should return error for non-existent page layout tab', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-tabs/${TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
        ),
      );
    });
  });

  describe('PATCH /rest/metadata/page-layout-tabs/:id', () => {
    it('should update an existing page layout tab', async () => {
      const pageLayoutTabTitle = generateRecordName('Test Tab for Update');
      const pageLayoutTab = await createTestPageLayoutTabWithRestApi({
        title: pageLayoutTabTitle,
        pageLayoutId: testPageLayoutId,
        position: 0,
      });

      const updatedTitle = generateRecordName('Updated Tab');
      const updateData = {
        title: updatedTitle,
        position: 3,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/page-layout-tabs/${pageLayoutTab.id}`,
        body: updateData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertPageLayoutTabStructure(response.body, {
        id: pageLayoutTab.id,
        title: updatedTitle,
        pageLayoutId: testPageLayoutId,
        position: 3,
      });

      await deleteTestPageLayoutTabWithRestApi(pageLayoutTab.id);
    });

    it('should update only provided fields', async () => {
      const originalTitle = generateRecordName('Original Tab');
      const pageLayoutTab = await createTestPageLayoutTabWithRestApi({
        title: originalTitle,
        pageLayoutId: testPageLayoutId,
        position: 1,
      });

      const updatedTitle = generateRecordName('Updated Title Only');
      const updateData = {
        title: updatedTitle,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/page-layout-tabs/${pageLayoutTab.id}`,
        body: updateData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertPageLayoutTabStructure(response.body, {
        id: pageLayoutTab.id,
        title: updatedTitle,
        pageLayoutId: testPageLayoutId,
        position: 1,
      });

      await deleteTestPageLayoutTabWithRestApi(pageLayoutTab.id);
    });

    it('should return error when updating non-existent page layout tab', async () => {
      const updateData = {
        title: 'Updated Tab',
        position: 5,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/page-layout-tabs/${TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID}`,
        body: updateData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
        ),
      );
    });
  });

  describe('DELETE /rest/metadata/page-layout-tabs/:id', () => {
    it('should delete an existing page layout tab', async () => {
      const pageLayoutTabTitle = generateRecordName('Test Tab for Delete');
      const pageLayoutTab = await createTestPageLayoutTabWithRestApi({
        title: pageLayoutTabTitle,
        pageLayoutId: testPageLayoutId,
        position: 0,
      });

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/page-layout-tabs/${pageLayoutTab.id}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      assertPageLayoutTabStructure(deleteResponse.body, pageLayoutTab);

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-tabs/${pageLayoutTab.id}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        getResponse,
        404,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          pageLayoutTab.id,
        ),
      );
    });

    it('should return error when deleting non-existent page layout tab', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/page-layout-tabs/${TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
        ),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple page layout tabs for same page layout', async () => {
      const pageLayoutTab1 = await createTestPageLayoutTabWithRestApi({
        title: generateRecordName('Tab 1'),
        pageLayoutId: testPageLayoutId,
        position: 0,
      });

      const pageLayoutTab2 = await createTestPageLayoutTabWithRestApi({
        title: generateRecordName('Tab 2'),
        pageLayoutId: testPageLayoutId,
        position: 1,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-tabs?pageLayoutId=${testPageLayoutId}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toHaveLength(2);

      const sortedTabs = response.body.sort(
        (a: { position: number }, b: { position: number }) =>
          a.position - b.position,
      );

      expect(sortedTabs[0].position).toBe(0);
      expect(sortedTabs[1].position).toBe(1);

      await Promise.all([
        deleteTestPageLayoutTabWithRestApi(pageLayoutTab1.id),
        deleteTestPageLayoutTabWithRestApi(pageLayoutTab2.id),
      ]);
    });

    it('should handle page layout tabs with same position', async () => {
      const pageLayoutTab1 = await createTestPageLayoutTabWithRestApi({
        title: generateRecordName('Tab Same Position 1'),
        pageLayoutId: testPageLayoutId,
        position: 5,
      });

      const pageLayoutTab2 = await createTestPageLayoutTabWithRestApi({
        title: generateRecordName('Tab Same Position 2'),
        pageLayoutId: testPageLayoutId,
        position: 5,
      });

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-tabs?pageLayoutId=${testPageLayoutId}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].position).toBe(5);
      expect(response.body[1].position).toBe(5);

      await Promise.all([
        deleteTestPageLayoutTabWithRestApi(pageLayoutTab1.id),
        deleteTestPageLayoutTabWithRestApi(pageLayoutTab2.id),
      ]);
    });
  });
});
