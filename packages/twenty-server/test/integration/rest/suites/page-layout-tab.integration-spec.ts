import { TEST_NOT_EXISTING_PAGE_LAYOUT_ID } from 'test/integration/constants/test-page-layout-ids.constants';
import { TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID } from 'test/integration/constants/test-page-layout-tab-ids.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
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

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  PageLayoutTabExceptionMessageKey,
  generatePageLayoutTabExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout-tab.exception';

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
    await cleanupPageLayoutTabRecords();
  });

  describe('GET /rest/metadata/pageLayoutTabs', () => {
    it('should return page layout tabs filtered by pageLayoutId', async () => {
      const input1 = {
        title: 'Tab 1',
        pageLayoutId: testPageLayoutId,
        position: 0,
      };
      const input2 = {
        title: 'Tab 2',
        pageLayoutId: testPageLayoutId,
        position: 1,
      };

      await createTestPageLayoutTabWithRestApi(input1);
      await createTestPageLayoutTabWithRestApi(input2);

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/pageLayoutTabs?pageLayoutId=${testPageLayoutId}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        assertPageLayoutTabStructure(response.body[0], input1);
      }
    });

    it('should return empty array when no page layout tabs match pageLayoutId', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/pageLayoutTabs?pageLayoutId=${TEST_NOT_EXISTING_PAGE_LAYOUT_ID}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return error when pageLayoutId is missing', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/pageLayoutTabs',
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

  describe('POST /rest/metadata/pageLayoutTabs', () => {
    it('should create a new page layout tab with all properties', async () => {
      const input = {
        title: 'Test Tab',
        pageLayoutId: testPageLayoutId,
        position: 1,
      };

      const pageLayoutTab = await createTestPageLayoutTabWithRestApi(input);

      assertPageLayoutTabStructure(pageLayoutTab, input);

      await deleteTestPageLayoutTabWithRestApi(pageLayoutTab.id);
    });

    it('should create a page layout tab with minimum required fields', async () => {
      const input = {
        title: 'Minimal Tab',
        pageLayoutId: testPageLayoutId,
      };

      const pageLayoutTab = await createTestPageLayoutTabWithRestApi({
        title: input.title,
        pageLayoutId: input.pageLayoutId,
      });

      assertPageLayoutTabStructure(pageLayoutTab, {
        ...input,
        position: 0,
      });

      await deleteTestPageLayoutTabWithRestApi(pageLayoutTab.id);
    });

    it('should return error when creating tab with invalid pageLayoutId', async () => {
      const pageLayoutTabData = {
        title: 'Invalid Tab',
        pageLayoutId: TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
        position: 0,
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/pageLayoutTabs',
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
        path: '/metadata/pageLayoutTabs',
        body: pageLayoutTabData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(response, 400);
    });
  });

  describe('GET /rest/metadata/pageLayoutTabs/:id', () => {
    it('should return a page layout tab by id', async () => {
      const input = {
        title: 'Tab',
        pageLayoutId: testPageLayoutId,
        position: 2,
      };
      const pageLayoutTab = await createTestPageLayoutTabWithRestApi(input);

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/pageLayoutTabs/${pageLayoutTab.id}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertPageLayoutTabStructure(response.body, {
        id: pageLayoutTab.id,
        ...input,
      });

      await deleteTestPageLayoutTabWithRestApi(pageLayoutTab.id);
    });

    it('should return error for non-existent page layout tab', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/pageLayoutTabs/${TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID}`,
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

  describe('PATCH /rest/metadata/pageLayoutTabs/:id', () => {
    it('should update an existing page layout tab', async () => {
      const input = {
        title: 'Test Tab for Update',
        pageLayoutId: testPageLayoutId,
        position: 0,
      };
      const pageLayoutTab = await createTestPageLayoutTabWithRestApi(input);

      const updateData = {
        title: 'Updated Tab',
        position: 3,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/pageLayoutTabs/${pageLayoutTab.id}`,
        body: updateData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertPageLayoutTabStructure(response.body, {
        id: pageLayoutTab.id,
        ...input,
        ...updateData,
      });

      await deleteTestPageLayoutTabWithRestApi(pageLayoutTab.id);
    });

    it('should update only provided fields', async () => {
      const input = {
        title: 'Original Tab',
        pageLayoutId: testPageLayoutId,
        position: 1,
      };
      const pageLayoutTab = await createTestPageLayoutTabWithRestApi(input);

      const updatedTitle = 'Updated Title Only';
      const updateData = {
        title: updatedTitle,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/pageLayoutTabs/${pageLayoutTab.id}`,
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
        path: `/metadata/pageLayoutTabs/${TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID}`,
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

  describe('DELETE /rest/metadata/pageLayoutTabs/:id', () => {
    it('should delete an existing page layout tab', async () => {
      const pageLayoutTabTitle = generateRecordName('Test Tab for Delete');
      const pageLayoutTab = await createTestPageLayoutTabWithRestApi({
        title: pageLayoutTabTitle,
        pageLayoutId: testPageLayoutId,
        position: 0,
      });

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/pageLayoutTabs/${pageLayoutTab.id}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      assertPageLayoutTabStructure(deleteResponse.body, pageLayoutTab);

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/pageLayoutTabs/${pageLayoutTab.id}`,
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
        path: `/metadata/pageLayoutTabs/${TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID}`,
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
});
