import {
  TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL,
  TEST_IFRAME_CONFIG,
  TEST_IFRAME_CONFIG_ALTERNATIVE,
  TEST_NUMBER_CHART_CONFIG_MINIMAL,
} from 'test/integration/constants/widget-configuration-test-data.constants';
import { findPageLayoutOperationFactory } from 'test/integration/graphql/utils/find-page-layout-operation-factory.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createTestPageLayoutWithGraphQL } from 'test/integration/graphql/utils/page-layout-graphql.util';
import { updatePageLayoutWithTabsOperationFactory } from 'test/integration/graphql/utils/update-page-layout-with-tabs-operation-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { cleanupPageLayoutTabRecords } from 'test/integration/utils/page-layout-tab-test.util';
import {
  assertPageLayoutStructure,
  cleanupPageLayoutRecords,
} from 'test/integration/utils/page-layout-test.util';
import { cleanupPageLayoutWidgetRecords } from 'test/integration/utils/page-layout-widget-test.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';

const existingTabId = '20202020-e02c-4292-9994-42695c4e41e8';
const tabToUpdateId = '20202020-974a-4480-b814-1fca24937132';
const tabToDeleteId = '20202020-a510-49e6-a9d9-0ff3e5c6a1ae';
const newTabId = '20202020-1db1-4c18-8804-6c700a8106a6';

const existingWidgetId = '20202020-afbe-46a3-a759-9a10ea7f5888';
const widgetToUpdateId = '20202020-c312-4342-93c0-f02c92c4a609';
const widgetToDeleteId = '20202020-8a0b-4ec2-8784-af4adb27c18a';
const newWidgetId = '20202020-da21-4321-b313-699eeff00798';
const anotherNewWidgetId = '20202020-3937-4617-bc88-8a811f769c90';

describe('Page Layout Update With Tabs And Widgets Integration', () => {
  let testObjectMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'myTestUpdatePageLayoutObject',
        namePlural: 'myTestUpdatePageLayoutObjects',
        labelSingular: 'My Test Update Page Layout Object',
        labelPlural: 'My Test Update Page Layout Objects',
        icon: 'IconUpdate',
      },
    });

    testObjectMetadataId = objectMetadataId;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
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
    await cleanupPageLayoutTabRecords();
    await cleanupPageLayoutWidgetRecords();
  });

  describe('updatePageLayoutWithTabsAndWidgets', () => {
    it('should handle complex page layout update with tab and widget CRUD operations', async () => {
      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Initial Page Layout',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: testObjectMetadataId,
      });

      const initialUpdateInput = {
        name: 'Updated Page Layout',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: testObjectMetadataId,
        tabs: [
          {
            id: existingTabId,
            title: 'Existing Tab',
            position: 1,
            widgets: [
              {
                id: existingWidgetId,
                pageLayoutTabId: existingTabId,
                title: 'Existing Widget',
                type: WidgetType.VIEW,
                objectMetadataId: testObjectMetadataId,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 2,
                  columnSpan: 2,
                },
                configuration: null,
              },
              {
                id: widgetToUpdateId,
                pageLayoutTabId: existingTabId,
                title: 'Widget To Update',
                type: WidgetType.GRAPH,
                objectMetadataId: testObjectMetadataId,
                gridPosition: {
                  row: 0,
                  column: 2,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: TEST_NUMBER_CHART_CONFIG_MINIMAL,
              },
              {
                id: widgetToDeleteId,
                pageLayoutTabId: existingTabId,
                title: 'Widget To Delete',
                type: WidgetType.IFRAME,
                objectMetadataId: null,
                gridPosition: {
                  row: 1,
                  column: 2,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: TEST_IFRAME_CONFIG,
              },
            ],
          },
          {
            id: tabToUpdateId,
            title: 'Tab To Update',
            position: 2,
            widgets: [],
          },
          {
            id: tabToDeleteId,
            title: 'Tab To Delete',
            position: 3,
            widgets: [],
          },
        ],
      };

      const initialOperation = updatePageLayoutWithTabsOperationFactory({
        pageLayoutId: pageLayout.id,
        data: initialUpdateInput,
      });

      const initialResponse = await makeGraphqlAPIRequest(initialOperation);

      assertGraphQLSuccessfulResponse(initialResponse);

      const initialResult =
        initialResponse.body.data.updatePageLayoutWithTabsAndWidgets;

      assertPageLayoutStructure(initialResult, {
        id: pageLayout.id,
        name: 'Updated Page Layout',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: testObjectMetadataId,
      });

      expect(initialResult.tabs).toHaveLength(3);
      expect(initialResult.tabs[0].widgets).toHaveLength(3);

      const complexUpdateInput = {
        name: 'Final Page Layout',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: testObjectMetadataId,
        tabs: [
          {
            id: existingTabId,
            title: 'Updated Existing Tab',
            position: 1,
            widgets: [
              {
                id: existingWidgetId,
                pageLayoutTabId: existingTabId,
                title: 'Existing Widget',
                type: WidgetType.VIEW,
                objectMetadataId: testObjectMetadataId,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 2,
                  columnSpan: 2,
                },
                configuration: null,
              },
              {
                id: widgetToUpdateId,
                pageLayoutTabId: existingTabId,
                title: 'Updated Widget Title',
                type: WidgetType.GRAPH,
                objectMetadataId: testObjectMetadataId,
                gridPosition: {
                  row: 0,
                  column: 2,
                  rowSpan: 2,
                  columnSpan: 3,
                },
                configuration: TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL,
              },
              {
                id: newWidgetId,
                pageLayoutTabId: existingTabId,
                title: 'New Widget',
                type: WidgetType.FIELDS,
                objectMetadataId: testObjectMetadataId,
                gridPosition: {
                  row: 2,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 2,
                },
                configuration: null,
              },
            ],
          },
          {
            id: tabToUpdateId,
            title: 'Completely Updated Tab',
            position: 3,
            widgets: [
              {
                id: anotherNewWidgetId,
                pageLayoutTabId: tabToUpdateId,
                title: 'Another New Widget',
                type: WidgetType.IFRAME,
                objectMetadataId: null,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: TEST_IFRAME_CONFIG_ALTERNATIVE,
              },
            ],
          },
          {
            id: newTabId,
            title: 'Brand New Tab',
            position: 2,
            widgets: [],
          },
        ],
      };

      const complexOperation = updatePageLayoutWithTabsOperationFactory({
        pageLayoutId: pageLayout.id,
        data: complexUpdateInput,
      });

      const complexResponse = await makeGraphqlAPIRequest(complexOperation);

      assertGraphQLSuccessfulResponse(complexResponse);

      const finalResult: PageLayoutEntity =
        complexResponse.body.data.updatePageLayoutWithTabsAndWidgets;

      assertPageLayoutStructure(finalResult, {
        id: pageLayout.id,
        name: 'Final Page Layout',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: testObjectMetadataId,
      });

      expect(finalResult.tabs).toHaveLength(3);

      const updatedExistingTab = finalResult.tabs.find(
        (tab) => tab.id === existingTabId,
      );
      const updatedTab = finalResult.tabs.find(
        (tab) => tab.id === tabToUpdateId,
      );
      const newTab = finalResult.tabs.find((tab) => tab.id === newTabId);
      const deletedTab = finalResult.tabs.find(
        (tab) => tab.id === tabToDeleteId,
      );

      expect(updatedExistingTab).toBeDefined();
      expect(updatedExistingTab?.title).toBe('Updated Existing Tab');
      expect(updatedExistingTab?.position).toBe(1);

      expect(updatedTab).toBeDefined();
      expect(updatedTab?.title).toBe('Completely Updated Tab');
      expect(updatedTab?.position).toBe(3);

      expect(newTab).toBeDefined();
      expect(newTab?.title).toBe('Brand New Tab');
      expect(newTab?.position).toBe(2);

      expect(deletedTab).toBeUndefined();

      const firstTabWidgets = updatedExistingTab?.widgets;

      expect(firstTabWidgets).toHaveLength(3);

      const existingWidget = firstTabWidgets?.find(
        (widget) => widget.id === existingWidgetId,
      );
      const updatedWidget = firstTabWidgets?.find(
        (widget) => widget.id === widgetToUpdateId,
      );
      const newWidget = firstTabWidgets?.find(
        (widget) => widget.id === newWidgetId,
      );
      const deletedWidget = firstTabWidgets?.find(
        (widget) => widget.id === widgetToDeleteId,
      );

      expect(existingWidget).toBeDefined();
      expect(existingWidget?.title).toBe('Existing Widget');
      expect(existingWidget?.type).toBe(WidgetType.VIEW);

      expect(updatedWidget).toBeDefined();
      expect(updatedWidget?.title).toBe('Updated Widget Title');
      expect(updatedWidget?.type).toBe(WidgetType.GRAPH);
      expect(updatedWidget?.gridPosition.rowSpan).toBe(2);
      expect(updatedWidget?.gridPosition.columnSpan).toBe(3);

      expect(newWidget).toBeDefined();
      expect(newWidget?.title).toBe('New Widget');
      expect(newWidget?.type).toBe(WidgetType.FIELDS);

      expect(deletedWidget).toBeUndefined();

      const secondTabWidgets = updatedTab?.widgets;

      expect(secondTabWidgets).toHaveLength(1);

      const anotherNewWidget = secondTabWidgets?.find(
        (widget) => widget.id === anotherNewWidgetId,
      );

      expect(anotherNewWidget).toBeDefined();
      expect(anotherNewWidget?.title).toBe('Another New Widget');
      expect(anotherNewWidget?.type).toBe(WidgetType.IFRAME);

      expect(newTab?.widgets).toHaveLength(0);
    });

    it('should handle transaction rollback on error during complex update', async () => {
      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Test Transaction Rollback',
        type: PageLayoutType.RECORD_PAGE,
      });

      const invalidUpdateInput = {
        name: '',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: 'invalid-uuid',
        tabs: [
          {
            id: '20202020-9a4c-4f97-bd63-a5f5843ee610',
            title: 'Test Tab',
            position: 1,
            widgets: [],
          },
        ],
      };

      const operation = updatePageLayoutWithTabsOperationFactory({
        pageLayoutId: pageLayout.id,
        data: invalidUpdateInput,
      });

      const response = await makeGraphqlAPIRequest(operation);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);

      const finalPageLayout = findPageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
      });
      const finalResponse = await makeGraphqlAPIRequest(finalPageLayout);

      assertGraphQLSuccessfulResponse(finalResponse);
      const finalResult = finalResponse.body.data.getPageLayout;

      assertPageLayoutStructure(finalResult, {
        id: pageLayout.id,
        name: 'Test Transaction Rollback',
        type: PageLayoutType.RECORD_PAGE,
      });
    });

    it('should throw when empty tabs array is provided', async () => {
      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Test Empty Tabs',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: testObjectMetadataId,
      });

      const updateInput = {
        name: 'Updated Layout With No Tabs',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: testObjectMetadataId,
        tabs: [],
      };

      const operation = updatePageLayoutWithTabsOperationFactory({
        pageLayoutId: pageLayout.id,
        data: updateInput,
      });

      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(response, ErrorCode.BAD_USER_INPUT);
    });

    it('should reject invalid widget configurations', async () => {
      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Test Invalid Config',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: testObjectMetadataId,
      });

      const invalidConfigInput = {
        name: 'Layout with Invalid Widget Config',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: testObjectMetadataId,
        tabs: [
          {
            id: '20202020-1001-4001-a001-000000000001',
            title: 'Tab with Invalid Widget',
            position: 1,
            widgets: [
              {
                id: '20202020-1002-4002-a002-000000000002',
                pageLayoutTabId: '20202020-1001-4001-a001-000000000001',
                title: 'Invalid Iframe Widget',
                type: WidgetType.IFRAME,
                objectMetadataId: null,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: { url: 'not-a-valid-url' },
              },
            ],
          },
        ],
      };

      const operation = updatePageLayoutWithTabsOperationFactory({
        pageLayoutId: pageLayout.id,
        data: invalidConfigInput,
      });

      const response = await makeGraphqlAPIRequest(operation);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        'Invalid configuration for widget "Invalid Iframe Widget" of type IFRAME',
      );
      expect(response.body.errors[0].message).toContain('url must be');
    });

    it('should accept valid widget configurations for each type', async () => {
      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Test Valid Configs',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: testObjectMetadataId,
      });

      const validConfigInput = {
        name: 'Layout with Valid Widget Configs',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: testObjectMetadataId,
        tabs: [
          {
            id: '20202020-1010-4010-a010-101010101010',
            title: 'Tab with Valid Widgets',
            position: 1,
            widgets: [
              {
                id: '20202020-1011-4011-a011-111111111111',
                pageLayoutTabId: '20202020-1010-4010-a010-101010101010',
                title: 'Valid Iframe Widget',
                type: WidgetType.IFRAME,
                objectMetadataId: null,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: TEST_IFRAME_CONFIG,
              },
              {
                id: '20202020-1012-4012-a012-121212121212',
                pageLayoutTabId: '20202020-1010-4010-a010-101010101010',
                title: 'Valid Graph Widget',
                type: WidgetType.GRAPH,
                objectMetadataId: testObjectMetadataId,
                gridPosition: {
                  row: 1,
                  column: 0,
                  rowSpan: 2,
                  columnSpan: 2,
                },
                configuration: TEST_NUMBER_CHART_CONFIG_MINIMAL,
              },
              {
                id: '20202020-1013-4013-a013-131313131313',
                pageLayoutTabId: '20202020-1010-4010-a010-101010101010',
                title: 'Valid View Widget',
                type: WidgetType.VIEW,
                objectMetadataId: testObjectMetadataId,
                gridPosition: {
                  row: 0,
                  column: 1,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: null,
              },
            ],
          },
        ],
      };

      const operation = updatePageLayoutWithTabsOperationFactory({
        pageLayoutId: pageLayout.id,
        data: validConfigInput,
      });

      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);

      const result = response.body.data.updatePageLayoutWithTabsAndWidgets;
      const widgets = result.tabs[0].widgets;

      expect(widgets).toHaveLength(3);

      const iframeWidget = widgets.find(
        (w: any) => w.type === WidgetType.IFRAME,
      );

      expect(iframeWidget.configuration).toBeDefined();
      expect(iframeWidget.configuration.url).toBe(TEST_IFRAME_CONFIG.url);

      const graphWidget = widgets.find((w: any) => w.type === WidgetType.GRAPH);

      expect(graphWidget.configuration).toBeDefined();
      expect(graphWidget.configuration.graphType).toBe(
        TEST_NUMBER_CHART_CONFIG_MINIMAL.graphType,
      );

      const viewWidget = widgets.find((w: any) => w.type === WidgetType.VIEW);

      expect(viewWidget.configuration).toBeNull();
    });
  });
});
