import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { fetchTestFieldMetadataIds } from 'test/integration/metadata/suites/page-layout-widget/utils/fetch-test-field-metadata-ids.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { AggregateOperations } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

describe('Page layout widget restore via bulk update should succeed', () => {
  let testFieldMetadataIds: {
    objectMetadataId: string;
    fieldMetadataId1: string;
    fieldMetadataId2: string;
  };
  let testPageLayoutId: string;
  let testTabId: string;

  beforeAll(async () => {
    const allFieldMetadataIds = await fetchTestFieldMetadataIds();

    testFieldMetadataIds = {
      objectMetadataId: allFieldMetadataIds.objectMetadataId,
      fieldMetadataId1: allFieldMetadataIds.fieldMetadataId1,
      fieldMetadataId2: allFieldMetadataIds.fieldMetadataId2,
    };

    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Test Layout For Widget Restore',
        type: PageLayoutType.RECORD_PAGE,
      },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widget Restore',
        pageLayoutId: testPageLayoutId,
      },
    });

    testTabId = tabData.createPageLayoutTab.id;
  });

  afterAll(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: testTabId },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  it('should create, delete, and restore a widget via bulk update', async () => {
    const widgetId = v4();

    const { data: createData } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Test Layout For Widget Restore',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        tabs: [
          {
            id: testTabId,
            title: 'Test Tab For Widget Restore',
            position: 0,
            widgets: [
              {
                id: widgetId,
                pageLayoutTabId: testTabId,
                title: 'Graph Widget',
                type: WidgetType.GRAPH,
                objectMetadataId: testFieldMetadataIds.objectMetadataId,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: {
                  configurationType: WidgetConfigurationType.PIE_CHART,
                  aggregateFieldMetadataId:
                    testFieldMetadataIds.fieldMetadataId1,
                  aggregateOperation: AggregateOperations.COUNT,
                  groupByFieldMetadataId: testFieldMetadataIds.fieldMetadataId2,
                },
              },
            ],
          },
        ],
      },
    });

    const createdTab = createData.updatePageLayoutWithTabsAndWidgets.tabs![0];

    expect(createdTab.widgets).toHaveLength(1);
    expect(createdTab.widgets![0].id).toBe(widgetId);

    const { data: deleteData } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Test Layout For Widget Restore',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        tabs: [
          {
            id: testTabId,
            title: 'Test Tab For Widget Restore',
            position: 0,
            widgets: [],
          },
        ],
      },
    });

    const deletedTab = deleteData.updatePageLayoutWithTabsAndWidgets.tabs![0];

    expect(deletedTab.widgets).toHaveLength(0);

    const { data: restoreData } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Test Layout For Widget Restore',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        tabs: [
          {
            id: testTabId,
            title: 'Test Tab For Widget Restore',
            position: 0,
            widgets: [
              {
                id: widgetId,
                pageLayoutTabId: testTabId,
                title: 'Restored Graph Widget',
                type: WidgetType.GRAPH,
                objectMetadataId: testFieldMetadataIds.objectMetadataId,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: {
                  configurationType: WidgetConfigurationType.AGGREGATE_CHART,
                  aggregateFieldMetadataId:
                    testFieldMetadataIds.fieldMetadataId1,
                  aggregateOperation: AggregateOperations.SUM,
                  displayDataLabel: true,
                },
              },
            ],
          },
        ],
      },
    });

    const restoredTab = restoreData.updatePageLayoutWithTabsAndWidgets.tabs![0];

    expect(restoredTab.widgets).toHaveLength(1);
    expect(restoredTab.widgets![0]).toMatchObject({
      id: widgetId,
      title: 'Restored Graph Widget',
      deletedAt: null,
    });

    expect(restoreData.updatePageLayoutWithTabsAndWidgets).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({
        ...restoreData.updatePageLayoutWithTabsAndWidgets,
      }),
    );
  });

  it('should handle mixed create, update, and restore in a single call', async () => {
    const widgetToUpdateId = v4();
    const widgetToRestoreId = v4();

    await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Test Layout For Widget Restore',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        tabs: [
          {
            id: testTabId,
            title: 'Test Tab For Widget Restore',
            position: 0,
            widgets: [
              {
                id: widgetToUpdateId,
                pageLayoutTabId: testTabId,
                title: 'Widget To Update',
                type: WidgetType.IFRAME,
                objectMetadataId: null,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: {
                  configurationType: WidgetConfigurationType.IFRAME,
                  url: 'https://example.com',
                },
              },
              {
                id: widgetToRestoreId,
                pageLayoutTabId: testTabId,
                title: 'Widget To Restore',
                type: WidgetType.GRAPH,
                objectMetadataId: testFieldMetadataIds.objectMetadataId,
                gridPosition: {
                  row: 1,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: {
                  configurationType: WidgetConfigurationType.AGGREGATE_CHART,
                  aggregateFieldMetadataId:
                    testFieldMetadataIds.fieldMetadataId1,
                  aggregateOperation: AggregateOperations.COUNT,
                  displayDataLabel: false,
                },
              },
            ],
          },
        ],
      },
    });

    await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Test Layout For Widget Restore',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        tabs: [
          {
            id: testTabId,
            title: 'Test Tab For Widget Restore',
            position: 0,
            widgets: [
              {
                id: widgetToUpdateId,
                pageLayoutTabId: testTabId,
                title: 'Widget To Update',
                type: WidgetType.IFRAME,
                objectMetadataId: null,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: {
                  configurationType: WidgetConfigurationType.IFRAME,
                  url: 'https://example.com',
                },
              },
            ],
          },
        ],
      },
    });

    const newWidgetId = v4();

    const { data: mixedData } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Test Layout For Widget Restore',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        tabs: [
          {
            id: testTabId,
            title: 'Test Tab For Widget Restore',
            position: 0,
            widgets: [
              {
                id: widgetToUpdateId,
                pageLayoutTabId: testTabId,
                title: 'Updated Widget Title',
                type: WidgetType.IFRAME,
                objectMetadataId: null,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 2,
                  columnSpan: 2,
                },
                configuration: {
                  configurationType: WidgetConfigurationType.IFRAME,
                  url: 'https://updated.example.com',
                },
              },
              {
                id: widgetToRestoreId,
                pageLayoutTabId: testTabId,
                title: 'Restored Widget',
                type: WidgetType.GRAPH,
                objectMetadataId: testFieldMetadataIds.objectMetadataId,
                gridPosition: {
                  row: 1,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: {
                  configurationType: WidgetConfigurationType.AGGREGATE_CHART,
                  aggregateFieldMetadataId:
                    testFieldMetadataIds.fieldMetadataId1,
                  aggregateOperation: AggregateOperations.SUM,
                  displayDataLabel: true,
                },
              },
              {
                id: newWidgetId,
                pageLayoutTabId: testTabId,
                title: 'Brand New Widget',
                type: WidgetType.IFRAME,
                objectMetadataId: null,
                gridPosition: {
                  row: 2,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: {
                  configurationType: WidgetConfigurationType.IFRAME,
                  url: 'https://new.example.com',
                },
              },
            ],
          },
        ],
      },
    });

    const mixedTab = mixedData.updatePageLayoutWithTabsAndWidgets.tabs![0];

    expect(mixedTab.widgets).toHaveLength(3);

    const updatedWidget = mixedTab.widgets!.find(
      (w: { id: string }) => w.id === widgetToUpdateId,
    );
    const restoredWidget = mixedTab.widgets!.find(
      (w: { id: string }) => w.id === widgetToRestoreId,
    );
    const newWidget = mixedTab.widgets!.find(
      (w: { id: string }) => w.id === newWidgetId,
    );

    expect(updatedWidget).toMatchObject({
      title: 'Updated Widget Title',
      deletedAt: null,
    });

    expect(restoredWidget).toMatchObject({
      title: 'Restored Widget',
      deletedAt: null,
    });

    expect(newWidget).toMatchObject({
      title: 'Brand New Widget',
      deletedAt: null,
    });

    const sortedMixedResult = {
      ...mixedData.updatePageLayoutWithTabsAndWidgets,
      tabs: (mixedData.updatePageLayoutWithTabsAndWidgets.tabs ?? []).map(
        (tab) => ({
          ...tab,
          widgets: [...(tab.widgets ?? [])].sort(
            (a, b) =>
              (a.gridPosition?.row ?? 0) - (b.gridPosition?.row ?? 0) ||
              (a.gridPosition?.column ?? 0) - (b.gridPosition?.column ?? 0),
          ),
        }),
      ),
    };

    expect(sortedMixedResult).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(sortedMixedResult),
    );
  });
});
