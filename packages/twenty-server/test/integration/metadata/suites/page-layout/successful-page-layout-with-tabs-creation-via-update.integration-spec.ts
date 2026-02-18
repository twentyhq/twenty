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

describe('Page layout with tabs creation via update should succeed', () => {
  let testFieldMetadataIds: {
    objectMetadataId: string;
    fieldMetadataId1: string;
    fieldMetadataId2: string;
  };
  let testPageLayoutId: string;
  let existingTabId: string;
  let newTabId: string;

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
        name: 'Test Page Layout',
        type: PageLayoutType.RECORD_PAGE,
      },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Initial Tab',
        pageLayoutId: testPageLayoutId,
      },
    });

    existingTabId = tabData.createPageLayoutTab.id;
  });

  afterAll(async () => {
    if (newTabId) {
      await destroyOnePageLayoutTab({
        expectToFail: null,
        input: { id: newTabId },
      });
    }

    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: existingTabId },
    });

    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  it('should create a new tab with a widget via page layout update', async () => {
    const existingTabWidgetId = v4();

    newTabId = v4();
    const newTabWidgetId = v4();

    const { data } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Layout With New Tab',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        tabs: [
          {
            id: existingTabId,
            title: 'Existing Tab',
            position: 0,
            widgets: [
              {
                id: existingTabWidgetId,
                pageLayoutTabId: existingTabId,
                title: 'Existing Tab Widget',
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
          {
            id: newTabId,
            title: 'New Tab Created Via Update',
            position: 1,
            widgets: [
              {
                id: newTabWidgetId,
                pageLayoutTabId: newTabId,
                title: 'New Tab Iframe Widget',
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

    const result = data.updatePageLayoutWithTabsAndWidgets;

    expect(result.tabs).toHaveLength(2);

    for (const tab of result.tabs!) {
      expect(tab.widgets!.length).toBeGreaterThanOrEqual(1);
    }

    expect(result).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({
        ...result,
      }),
    );
  });
});
