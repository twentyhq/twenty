import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { fetchTestFieldMetadataIds } from 'test/integration/metadata/suites/page-layout-widget/utils/fetch-test-field-metadata-ids.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 } from 'uuid';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

const MOCK_IFRAME_CONFIGURATION = {
  configurationType: WidgetConfigurationType.IFRAME,
  url: 'https://example.com',
} as const satisfies AllPageLayoutWidgetConfiguration;

type TestContext = {
  layoutName: string;
  buildTabs: (params: {
    tabId1: string;
    tabId2: string;
    pieChartWidgetId: string;
    iframeWidgetId: string;
  }) => Array<{
    id: string;
    title: string;
    position: number;
    widgets: Array<{
      id: string;
      pageLayoutTabId: string;
      title: string;
      type: WidgetType;
      objectMetadataId: string | null;
      gridPosition: {
        row: number;
        column: number;
        rowSpan: number;
        columnSpan: number;
      };
      configuration: AllPageLayoutWidgetConfiguration;
    }>;
  }>;
};

describe('Page layout with tabs update should succeed', () => {
  let testFieldMetadataIds: {
    objectMetadataId: string;
    fieldMetadataId1: string;
    fieldMetadataId2: string;
    fieldMetadataId3: string;
    fieldMetadataId3SubFieldName: string;
  };
  let testPageLayoutId: string;
  let testTabId1: string;
  let testTabId2: string;

  const testCases: EachTestingContext<TestContext>[] = [
    {
      title: 'update page layout with single tab and widget',
      context: {
        layoutName: 'Updated Page Layout',
        buildTabs: ({ tabId1, pieChartWidgetId }) => [
          {
            id: tabId1,
            title: 'Updated Tab 1',
            position: 0,
            widgets: [
              {
                id: pieChartWidgetId,
                pageLayoutTabId: tabId1,
                title: 'Pie Chart Widget',
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
    },
    {
      title: 'update page layout with multiple tabs and different widget types',
      context: {
        layoutName: 'Multi-Tab Layout',
        buildTabs: ({ tabId1, tabId2, pieChartWidgetId, iframeWidgetId }) => [
          {
            id: tabId1,
            title: 'First Tab',
            position: 0,
            widgets: [
              {
                id: pieChartWidgetId,
                pageLayoutTabId: tabId1,
                title: 'Pie Chart Widget',
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
            id: tabId2,
            title: 'Second Tab',
            position: 1,
            widgets: [
              {
                id: iframeWidgetId,
                pageLayoutTabId: tabId2,
                title: 'Iframe Widget',
                type: WidgetType.IFRAME,
                objectMetadataId: null,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: MOCK_IFRAME_CONFIGURATION,
              },
            ],
          },
        ],
      },
    },
  ];

  beforeAll(async () => {
    testFieldMetadataIds = await fetchTestFieldMetadataIds();
  });

  beforeEach(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Original Page Layout',
        type: PageLayoutType.RECORD_PAGE,
      },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData1 } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Tab 1',
        pageLayoutId: testPageLayoutId,
      },
    });

    testTabId1 = tabData1.createPageLayoutTab.id;

    const { data: tabData2 } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Tab 2',
        pageLayoutId: testPageLayoutId,
      },
    });

    testTabId2 = tabData2.createPageLayoutTab.id;
  });

  afterEach(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: testTabId1 },
    });
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: testTabId2 },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  it.each(eachTestingContextFilter(testCases))(
    'should $title',
    async ({ context: { layoutName, buildTabs } }) => {
      const pieChartWidgetId = v4();
      const iframeWidgetId = v4();

      const tabParams = {
        tabId1: testTabId1,
        tabId2: testTabId2,
        pieChartWidgetId,
        iframeWidgetId,
      };

      const { data } = await updateOnePageLayoutWithTabsAndWidgets({
        expectToFail: false,
        input: {
          id: testPageLayoutId,
          name: layoutName,
          type: PageLayoutType.RECORD_PAGE,
          objectMetadataId: null,
          tabs: buildTabs(tabParams),
        },
      });

      expect(data.updatePageLayoutWithTabsAndWidgets).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({
          ...data.updatePageLayoutWithTabsAndWidgets,
        }),
      );
    },
  );
});
