import { TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID } from 'test/integration/constants/test-page-layout-tab-ids.constants';
import { TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID } from 'test/integration/constants/test-page-layout-widget-ids.constants';
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
  createTestPageLayoutWidgetWithRestApi,
  deleteTestPageLayoutWidgetWithRestApi,
} from 'test/integration/rest/utils/page-layout-widget-rest-api.util';
import {
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  assertPageLayoutWidgetStructure,
  cleanupPageLayoutWidgetRecords,
} from 'test/integration/utils/page-layout-widget-test.util';

import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import {
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-widget.exception';

describe('Page Layout Widget REST API', () => {
  let testObjectMetadataId: string;
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'myTestPageLayoutWidgetObject',
        namePlural: 'myTestPageLayoutWidgetObjects',
        labelSingular: 'My Test Page Layout Widget Object',
        labelPlural: 'My Test Page Layout Widget Objects',
        icon: 'IconLayout',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const testPageLayout = await createTestPageLayoutWithRestApi({
      name: generateRecordName('Test Page Layout for Widgets'),
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: testObjectMetadataId,
    });

    testPageLayoutId = testPageLayout.id;

    const testPageLayoutTab = await createTestPageLayoutTabWithRestApi({
      title: generateRecordName('Test Page Layout Tab for Widgets'),
      pageLayoutId: testPageLayoutId,
      position: 0,
    });

    testPageLayoutTabId = testPageLayoutTab.id;
  });

  afterAll(async () => {
    await deleteTestPageLayoutTabWithRestApi(testPageLayoutTabId);
    await deleteTestPageLayoutWithRestApi(testPageLayoutId);
    await deleteOneObjectMetadata({
      input: { idToDelete: testObjectMetadataId },
    });
  });

  afterEach(async () => {
    await cleanupPageLayoutWidgetRecords();
  });

  describe('GET /rest/metadata/page-layout-widgets', () => {
    it('should return page layout widgets filtered by pageLayoutTabId', async () => {
      const input1 = {
        title: 'Widget 1',
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.VIEW,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      };
      const input2 = {
        title: 'Widget 2',
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.IFRAME,
        gridPosition: {
          row: 0,
          column: 1,
          rowSpan: 1,
          columnSpan: 1,
        },
      };

      await createTestPageLayoutWidgetWithRestApi(input1);
      await createTestPageLayoutWidgetWithRestApi(input2);

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-widgets?pageLayoutTabId=${testPageLayoutTabId}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      if (response.body.length > 0) {
        assertPageLayoutWidgetStructure(response.body[0]);
        expect(response.body[0].pageLayoutTabId).toBe(testPageLayoutTabId);
      }
    });

    it('should return empty array when no page layout widgets match pageLayoutTabId', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-widgets?pageLayoutTabId=${TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return error when pageLayoutTabId is missing', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/page-layout-widgets',
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        400,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_ID_REQUIRED,
        ),
      );
    });
  });

  describe('POST /rest/metadata/page-layout-widgets', () => {
    it('should create a new page layout widget with all properties', async () => {
      const input = {
        title: 'Test Widget',
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.GRAPH,
        objectMetadataId: testObjectMetadataId,
        gridPosition: {
          row: 1,
          column: 1,
          rowSpan: 2,
          columnSpan: 2,
        },
        configuration: { theme: 'dark', showLegend: true },
      };

      const pageLayoutWidget =
        await createTestPageLayoutWidgetWithRestApi(input);

      assertPageLayoutWidgetStructure(pageLayoutWidget, input);

      await deleteTestPageLayoutWidgetWithRestApi(pageLayoutWidget.id);
    });

    it('should create a page layout widget with minimum required fields', async () => {
      const input = {
        title: 'Minimal Widget',
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      };

      const pageLayoutWidget = await createTestPageLayoutWidgetWithRestApi({
        title: input.title,
        pageLayoutTabId: input.pageLayoutTabId,
        gridPosition: input.gridPosition,
      });

      assertPageLayoutWidgetStructure(pageLayoutWidget, {
        ...input,
        type: WidgetType.VIEW,
        objectMetadataId: null,
        configuration: null,
      });

      await deleteTestPageLayoutWidgetWithRestApi(pageLayoutWidget.id);
    });

    it('should return error when creating widget with invalid pageLayoutTabId', async () => {
      const pageLayoutWidgetData = {
        title: 'Invalid Widget',
        pageLayoutTabId: TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/page-layout-widgets',
        body: pageLayoutWidgetData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        400,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
        ),
      );
    });

    it('should return error when creating widget without title', async () => {
      const pageLayoutWidgetData = {
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/page-layout-widgets',
        body: pageLayoutWidgetData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(response, 400);
    });

    it('should return error when creating widget without gridPosition', async () => {
      const pageLayoutWidgetData = {
        title: 'Widget Without Grid Position',
        pageLayoutTabId: testPageLayoutTabId,
      };

      const response = await makeRestAPIRequest({
        method: 'post',
        path: '/metadata/page-layout-widgets',
        body: pageLayoutWidgetData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(response, 400);
    });
  });

  describe('GET /rest/metadata/page-layout-widgets/:id', () => {
    it('should return a page layout widget by id', async () => {
      const input = {
        title: 'Widget For Get',
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.FIELDS,
        gridPosition: {
          row: 2,
          column: 2,
          rowSpan: 1,
          columnSpan: 3,
        },
      };
      const pageLayoutWidget =
        await createTestPageLayoutWidgetWithRestApi(input);

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-widgets/${pageLayoutWidget.id}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertPageLayoutWidgetStructure(response.body, {
        id: pageLayoutWidget.id,
        ...input,
      });

      await deleteTestPageLayoutWidgetWithRestApi(pageLayoutWidget.id);
    });

    it('should return error for non-existent page layout widget', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-widgets/${TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
        ),
      );
    });
  });

  describe('PATCH /rest/metadata/page-layout-widgets/:id', () => {
    it('should update an existing page layout widget', async () => {
      const input = {
        title: 'Test Widget for Update',
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.VIEW,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      };
      const pageLayoutWidget =
        await createTestPageLayoutWidgetWithRestApi(input);

      const updateData = {
        title: 'Updated Widget',
        type: WidgetType.GRAPH,
        gridPosition: {
          row: 1,
          column: 1,
          rowSpan: 2,
          columnSpan: 3,
        },
        configuration: { updated: true },
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/page-layout-widgets/${pageLayoutWidget.id}`,
        body: updateData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertPageLayoutWidgetStructure(response.body, {
        id: pageLayoutWidget.id,
        pageLayoutTabId: testPageLayoutTabId,
        ...updateData,
      });

      await deleteTestPageLayoutWidgetWithRestApi(pageLayoutWidget.id);
    });

    it('should update only provided fields', async () => {
      const input = {
        title: 'Original Widget',
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.IFRAME,
        gridPosition: {
          row: 1,
          column: 1,
          rowSpan: 1,
          columnSpan: 1,
        },
      };
      const pageLayoutWidget =
        await createTestPageLayoutWidgetWithRestApi(input);

      const updatedTitle = 'Updated Title Only';
      const updateData = {
        title: updatedTitle,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/page-layout-widgets/${pageLayoutWidget.id}`,
        body: updateData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertPageLayoutWidgetStructure(response.body, {
        id: pageLayoutWidget.id,
        title: updatedTitle,
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.IFRAME,
        gridPosition: input.gridPosition,
      });

      await deleteTestPageLayoutWidgetWithRestApi(pageLayoutWidget.id);
    });

    it('should return error when updating non-existent page layout widget', async () => {
      const updateData = {
        title: 'Updated Widget',
        type: WidgetType.GRAPH,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/page-layout-widgets/${TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID}`,
        body: updateData,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
        ),
      );
    });
  });

  describe('DELETE /rest/metadata/page-layout-widgets/:id', () => {
    it('should delete an existing page layout widget', async () => {
      const pageLayoutWidgetTitle = generateRecordName(
        'Test Widget for Delete',
      );
      const pageLayoutWidget = await createTestPageLayoutWidgetWithRestApi({
        title: pageLayoutWidgetTitle,
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.FIELDS,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      });

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/page-layout-widgets/${pageLayoutWidget.id}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      assertPageLayoutWidgetStructure(deleteResponse.body, pageLayoutWidget);

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/page-layout-widgets/${pageLayoutWidget.id}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        getResponse,
        404,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          pageLayoutWidget.id,
        ),
      );
    });

    it('should return error when deleting non-existent page layout widget', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/page-layout-widgets/${TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID}`,
        bearer: API_KEY_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
        ),
      );
    });
  });
});
