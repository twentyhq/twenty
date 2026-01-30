import {
  TEST_GAUGE_CHART_CONFIG,
  TEST_GAUGE_CHART_CONFIG_MINIMAL,
  TEST_HORIZONTAL_BAR_CHART_CONFIG,
  TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL,
  TEST_IFRAME_CONFIG,
  TEST_LINE_CHART_CONFIG,
  TEST_LINE_CHART_CONFIG_MINIMAL,
  TEST_NUMBER_CHART_CONFIG,
  TEST_NUMBER_CHART_CONFIG_MINIMAL,
  TEST_PIE_CHART_CONFIG,
  TEST_PIE_CHART_CONFIG_MINIMAL,
  TEST_STANDALONE_RICH_TEXT_CONFIG,
  TEST_STANDALONE_RICH_TEXT_CONFIG_MINIMAL,
  TEST_VERTICAL_BAR_CHART_CONFIG,
  TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL,
} from 'test/integration/constants/widget-configuration-test-data.constants';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
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

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
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
  // AGGREGATE_CHART (number chart) widget tests
  {
    title:
      'create a page layout widget with AGGREGATE_CHART full configuration',
    context: {
      input: {
        title: 'Number Chart Widget',
        type: WidgetType.GRAPH,
        configuration: TEST_NUMBER_CHART_CONFIG,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  {
    title:
      'create a page layout widget with AGGREGATE_CHART minimal configuration',
    context: {
      input: {
        title: 'Number Chart Widget Minimal',
        type: WidgetType.GRAPH,
        configuration: TEST_NUMBER_CHART_CONFIG_MINIMAL,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  // BAR_CHART vertical widget tests
  {
    title:
      'create a page layout widget with VERTICAL BAR_CHART full configuration',
    context: {
      input: {
        title: 'Vertical Bar Chart Widget',
        type: WidgetType.GRAPH,
        configuration: TEST_VERTICAL_BAR_CHART_CONFIG,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  {
    title:
      'create a page layout widget with VERTICAL BAR_CHART minimal configuration',
    context: {
      input: {
        title: 'Vertical Bar Chart Widget Minimal',
        type: WidgetType.GRAPH,
        configuration: TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  // BAR_CHART horizontal widget tests
  {
    title:
      'create a page layout widget with HORIZONTAL BAR_CHART full configuration',
    context: {
      input: {
        title: 'Horizontal Bar Chart Widget',
        type: WidgetType.GRAPH,
        configuration: TEST_HORIZONTAL_BAR_CHART_CONFIG,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  {
    title:
      'create a page layout widget with HORIZONTAL BAR_CHART minimal configuration',
    context: {
      input: {
        title: 'Horizontal Bar Chart Widget Minimal',
        type: WidgetType.GRAPH,
        configuration: TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  // PIE_CHART widget tests
  {
    title: 'create a page layout widget with PIE_CHART full configuration',
    context: {
      input: {
        title: 'Pie Chart Widget',
        type: WidgetType.GRAPH,
        configuration: TEST_PIE_CHART_CONFIG,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  {
    title: 'create a page layout widget with PIE_CHART minimal configuration',
    context: {
      input: {
        title: 'Pie Chart Widget Minimal',
        type: WidgetType.GRAPH,
        configuration: TEST_PIE_CHART_CONFIG_MINIMAL,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  // LINE_CHART widget tests
  {
    title: 'create a page layout widget with LINE_CHART full configuration',
    context: {
      input: {
        title: 'Line Chart Widget',
        type: WidgetType.GRAPH,
        configuration: TEST_LINE_CHART_CONFIG,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  {
    title: 'create a page layout widget with LINE_CHART minimal configuration',
    context: {
      input: {
        title: 'Line Chart Widget Minimal',
        type: WidgetType.GRAPH,
        configuration: TEST_LINE_CHART_CONFIG_MINIMAL,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  // GAUGE_CHART widget tests
  {
    title: 'create a page layout widget with GAUGE_CHART full configuration',
    context: {
      input: {
        title: 'Gauge Chart Widget',
        type: WidgetType.GRAPH,
        configuration: TEST_GAUGE_CHART_CONFIG,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
  {
    title: 'create a page layout widget with GAUGE_CHART minimal configuration',
    context: {
      input: {
        title: 'Gauge Chart Widget Minimal',
        type: WidgetType.GRAPH,
        configuration: TEST_GAUGE_CHART_CONFIG_MINIMAL,
        gridPosition: DEFAULT_GRID_POSITION,
      },
    },
  },
];

describe('Page layout widget creation should succeed', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;
  let createdPageLayoutWidgetId: string;

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
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
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
});
