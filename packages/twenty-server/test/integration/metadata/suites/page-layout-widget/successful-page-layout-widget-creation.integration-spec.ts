import {
  type ChartTestConfigKey,
  type ChartTestConfigMap,
  TEST_IFRAME_CONFIG,
  TEST_STANDALONE_RICH_TEXT_CONFIG,
  TEST_STANDALONE_RICH_TEXT_CONFIG_MINIMAL,
} from 'test/integration/constants/widget-configuration-test-data.constants';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { getRuntimeChartTestMetadata } from 'test/integration/metadata/suites/page-layout-widget/utils/get-runtime-chart-test-metadata.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

type TestContext = {
  input: {
    title: string;
    type: WidgetType;
    configuration: AllPageLayoutWidgetConfiguration;
    gridPosition: {
      row: number;
      column: number;
      rowSpan: number;
      columnSpan: number;
    };
  };
};

const DEFAULT_GRID_POSITION = {
  row: 0,
  column: 0,
  rowSpan: 1,
  columnSpan: 1,
};

const NON_GRAPH_SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  // IFRAME widget tests
  {
    title: 'create a page layout widget with IFRAME configuration',
    context: {
      input: {
        title: 'Iframe Widget',
        type: WidgetType.IFRAME,
        configuration: TEST_IFRAME_CONFIG,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  {
    title: 'create a page layout widget with IFRAME minimal configuration',
    context: {
      input: {
        title: 'Iframe Widget Minimal',
        type: WidgetType.IFRAME,
        configuration: {
          configurationType: WidgetConfigurationType.IFRAME,
        },
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  // STANDALONE_RICH_TEXT widget tests
  {
    title:
      'create a page layout widget with STANDALONE_RICH_TEXT configuration',
    context: {
      input: {
        title: 'Rich Text Widget',
        type: WidgetType.STANDALONE_RICH_TEXT,
        configuration: TEST_STANDALONE_RICH_TEXT_CONFIG,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  {
    title:
      'create a page layout widget with STANDALONE_RICH_TEXT minimal configuration',
    context: {
      input: {
        title: 'Rich Text Widget Minimal',
        type: WidgetType.STANDALONE_RICH_TEXT,
        configuration: TEST_STANDALONE_RICH_TEXT_CONFIG_MINIMAL,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
];

type GraphTestCase = {
  title: string;
  widgetTitle: string;
  configKey: ChartTestConfigKey;
};

const GRAPH_TEST_CASES: GraphTestCase[] = [
  {
    title: 'create a page layout widget with AGGREGATE_CHART full configuration',
    widgetTitle: 'Number Chart Widget',
    configKey: 'aggregateChart',
  },
  {
    title:
      'create a page layout widget with AGGREGATE_CHART minimal configuration',
    widgetTitle: 'Number Chart Widget Minimal',
    configKey: 'aggregateChartMinimal',
  },
  {
    title:
      'create a page layout widget with VERTICAL BAR_CHART full configuration',
    widgetTitle: 'Vertical Bar Chart Widget',
    configKey: 'verticalBarChart',
  },
  {
    title:
      'create a page layout widget with VERTICAL BAR_CHART minimal configuration',
    widgetTitle: 'Vertical Bar Chart Widget Minimal',
    configKey: 'verticalBarChartMinimal',
  },
  {
    title:
      'create a page layout widget with HORIZONTAL BAR_CHART full configuration',
    widgetTitle: 'Horizontal Bar Chart Widget',
    configKey: 'horizontalBarChart',
  },
  {
    title:
      'create a page layout widget with HORIZONTAL BAR_CHART minimal configuration',
    widgetTitle: 'Horizontal Bar Chart Widget Minimal',
    configKey: 'horizontalBarChartMinimal',
  },
  {
    title: 'create a page layout widget with PIE_CHART full configuration',
    widgetTitle: 'Pie Chart Widget',
    configKey: 'pieChart',
  },
  {
    title: 'create a page layout widget with PIE_CHART minimal configuration',
    widgetTitle: 'Pie Chart Widget Minimal',
    configKey: 'pieChartMinimal',
  },
  {
    title: 'create a page layout widget with LINE_CHART full configuration',
    widgetTitle: 'Line Chart Widget',
    configKey: 'lineChart',
  },
  {
    title: 'create a page layout widget with LINE_CHART minimal configuration',
    widgetTitle: 'Line Chart Widget Minimal',
    configKey: 'lineChartMinimal',
  },
  {
    title: 'create a page layout widget with GAUGE_CHART full configuration',
    widgetTitle: 'Gauge Chart Widget',
    configKey: 'gaugeChart',
  },
  {
    title: 'create a page layout widget with GAUGE_CHART minimal configuration',
    widgetTitle: 'Gauge Chart Widget Minimal',
    configKey: 'gaugeChartMinimal',
  },
];

describe('Page layout widget creation should succeed', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;
  let createdPageLayoutWidgetId: string | undefined;
  let testObjectMetadataId: string;
  let chartConfigs: ChartTestConfigMap;

  beforeAll(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Widgets' },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widgets',
        pageLayoutId: testPageLayoutId,
      },
    });

    testPageLayoutTabId = tabData.createPageLayoutTab.id;

    const runtimeChartTestMetadata = await getRuntimeChartTestMetadata();

    testObjectMetadataId = runtimeChartTestMetadata.objectMetadataId;
    chartConfigs = runtimeChartTestMetadata.chartConfigs;
  });

  afterAll(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: testPageLayoutTabId },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  afterEach(async () => {
    if (createdPageLayoutWidgetId) {
      await destroyOnePageLayoutWidget({
        expectToFail: false,
        input: { id: createdPageLayoutWidgetId },
      });
    }

    createdPageLayoutWidgetId = undefined;
  });

  it.each(eachTestingContextFilter(NON_GRAPH_SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { input } }) => {
      const { data } = await createOnePageLayoutWidget({
        expectToFail: false,
        input: {
          ...input,
          pageLayoutTabId: testPageLayoutTabId,
        },
      });

      createdPageLayoutWidgetId = data?.createPageLayoutWidget?.id;

      expect(data.createPageLayoutWidget).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.createPageLayoutWidget }),
      );
    },
  );

  describe('GRAPH widget tests', () => {
    for (const { title, widgetTitle, configKey } of GRAPH_TEST_CASES) {
      it(`should ${title}`, async () => {
        const { data } = await createOnePageLayoutWidget({
          expectToFail: false,
          input: {
            title: widgetTitle,
            type: WidgetType.GRAPH,
            objectMetadataId: testObjectMetadataId,
            configuration: chartConfigs[configKey],
            pageLayoutTabId: testPageLayoutTabId,
            gridPosition: DEFAULT_GRID_POSITION,
          },
        });

        createdPageLayoutWidgetId = data?.createPageLayoutWidget?.id;

        expect(data.createPageLayoutWidget).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny({ ...data.createPageLayoutWidget }),
        );
      });
    }
  });
});
