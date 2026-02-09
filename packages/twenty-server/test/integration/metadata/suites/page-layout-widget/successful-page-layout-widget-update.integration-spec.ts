import {
  type ChartTestConfigKey,
  type ChartTestConfigMap,
  TEST_IFRAME_CONFIG_ALTERNATIVE,
  TEST_STANDALONE_RICH_TEXT_CONFIG,
} from 'test/integration/constants/widget-configuration-test-data.constants';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { getRuntimeChartTestMetadata } from 'test/integration/metadata/suites/page-layout-widget/utils/get-runtime-chart-test-metadata.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
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
    title?: string;
    type?: WidgetType;
    objectMetadataId?: string;
    configuration?: AllPageLayoutWidgetConfiguration;
    gridPosition?: {
      row: number;
      column: number;
      rowSpan: number;
      columnSpan: number;
    };
  };
};

const NON_GRAPH_SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'update page layout widget title',
    context: {
      input: {
        title: 'Updated Widget Title',
      },
    },
  },
  {
    title: 'update page layout widget grid position',
    context: {
      input: {
        gridPosition: {
          row: 2,
          column: 3,
          rowSpan: 2,
          columnSpan: 4,
        },
      },
    },
  },
  {
    title: 'update page layout widget to IFRAME configuration',
    context: {
      input: {
        configuration: TEST_IFRAME_CONFIG_ALTERNATIVE,
      },
    },
  },
  {
    title: 'update page layout widget to STANDALONE_RICH_TEXT configuration',
    context: {
      input: {
        type: WidgetType.STANDALONE_RICH_TEXT,
        configuration: TEST_STANDALONE_RICH_TEXT_CONFIG,
      },
    },
  },
];

type GraphTestCase = {
  title: string;
  configKey: ChartTestConfigKey;
};

const GRAPH_SUCCESSFUL_TEST_CASES: GraphTestCase[] = [
  {
    title: 'update page layout widget type',
    configKey: 'aggregateChart',
  },
  {
    title: 'update page layout widget to AGGREGATE_CHART configuration',
    configKey: 'aggregateChart',
  },
  {
    title: 'update page layout widget to VERTICAL BAR_CHART configuration',
    configKey: 'verticalBarChart',
  },
  {
    title: 'update page layout widget to HORIZONTAL BAR_CHART configuration',
    configKey: 'horizontalBarChart',
  },
  {
    title: 'update page layout widget to PIE_CHART configuration',
    configKey: 'pieChart',
  },
  {
    title: 'update page layout widget to LINE_CHART configuration',
    configKey: 'lineChart',
  },
  {
    title: 'update page layout widget to GAUGE_CHART configuration',
    configKey: 'gaugeChart',
  },
];

describe('Page layout widget update should succeed', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;
  let testPageLayoutWidgetId: string;
  let testObjectMetadataId: string;
  let chartConfigs: ChartTestConfigMap;

  beforeAll(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Widget Updates' },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widget Updates',
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

  beforeEach(async () => {
    const { data } = await createOnePageLayoutWidget({
      expectToFail: false,
      input: {
        title: 'Original Widget Title',
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.IFRAME,
        configuration: {
          configurationType: WidgetConfigurationType.IFRAME,
        },
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      },
    });

    testPageLayoutWidgetId = data.createPageLayoutWidget.id;
  });

  afterEach(async () => {
    await destroyOnePageLayoutWidget({
      expectToFail: false,
      input: { id: testPageLayoutWidgetId },
    });
  });

  it.each(eachTestingContextFilter(NON_GRAPH_SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { input } }) => {
      const { data } = await updateOnePageLayoutWidget({
        expectToFail: false,
        input: {
          id: testPageLayoutWidgetId,
          ...input,
        },
      });

      expect(data.updatePageLayoutWidget).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.updatePageLayoutWidget }),
      );
    },
  );

  describe('GRAPH widget update tests', () => {
    for (const { title, configKey } of GRAPH_SUCCESSFUL_TEST_CASES) {
      it(`should ${title}`, async () => {
        const { data } = await updateOnePageLayoutWidget({
          expectToFail: false,
          input: {
            id: testPageLayoutWidgetId,
            type: WidgetType.GRAPH,
            objectMetadataId: testObjectMetadataId,
            configuration: chartConfigs[configKey],
          },
        });

        expect(data.updatePageLayoutWidget).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny({
            ...data.updatePageLayoutWidget,
          }),
        );
      });
    }
  });
});
