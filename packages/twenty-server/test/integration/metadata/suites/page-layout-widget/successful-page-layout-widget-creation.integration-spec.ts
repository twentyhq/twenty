import {
  TEST_IFRAME_CONFIG,
  TEST_STANDALONE_RICH_TEXT_CONFIG,
  TEST_STANDALONE_RICH_TEXT_CONFIG_MINIMAL,
} from 'test/integration/constants/widget-configuration-test-data.constants';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { fetchTestFieldMetadataIds } from 'test/integration/metadata/suites/page-layout-widget/utils/fetch-test-field-metadata-ids.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

type StaticTestContext = {
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

type GraphTestContext = {
  widgetTitle: string;
  buildConfiguration: () => AllPageLayoutWidgetConfiguration;
};

const DEFAULT_GRID_POSITION = {
  row: 0,
  column: 0,
  rowSpan: 1,
  columnSpan: 1,
};

const STATIC_TEST_CASES: EachTestingContext<StaticTestContext>[] = [
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

describe('Page layout widget creation should succeed', () => {
  let testSetup: {
    pageLayoutId: string;
    pageLayoutTabId: string;
    objectMetadataId: string;
    fieldMetadataId1: string;
    fieldMetadataId2: string;
    fieldMetadataId3: string;
    fieldMetadataId3SubFieldName: string;
  };
  let createdPageLayoutWidgetId: string | undefined;

  const graphTestCases: EachTestingContext<GraphTestContext>[] = [
    {
      title:
        'create a page layout widget with AGGREGATE_CHART full configuration',
      context: {
        widgetTitle: 'Number Chart Widget',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.AGGREGATE_CHART,
          aggregateFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateOperation: AggregateOperations.COUNT,
          label: 'Total Records',
          description: 'Count of all records',
          format: '0,0',
          displayDataLabel: true,
        }),
      },
    },
    {
      title:
        'create a page layout widget with AGGREGATE_CHART minimal configuration',
      context: {
        widgetTitle: 'Number Chart Widget Minimal',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.AGGREGATE_CHART,
          aggregateFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateOperation: AggregateOperations.SUM,
          displayDataLabel: false,
        }),
      },
    },
    {
      title:
        'create a page layout widget with VERTICAL BAR_CHART full configuration',
      context: {
        widgetTitle: 'Vertical Bar Chart Widget',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.BAR_CHART,
          layout: BarChartLayout.VERTICAL,
          aggregateFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateOperation: AggregateOperations.SUM,
          primaryAxisGroupByFieldMetadataId: testSetup.fieldMetadataId2,
          primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
          displayDataLabel: true,
          axisNameDisplay: AxisNameDisplay.NONE,
          color: 'red',
          description: 'Monthly revenue breakdown',
          omitNullValues: true,
          rangeMin: 0,
          rangeMax: 100000,
        }),
      },
    },
    {
      title:
        'create a page layout widget with VERTICAL BAR_CHART minimal configuration',
      context: {
        widgetTitle: 'Vertical Bar Chart Widget Minimal',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.BAR_CHART,
          layout: BarChartLayout.VERTICAL,
          aggregateFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateOperation: AggregateOperations.COUNT,
          primaryAxisGroupByFieldMetadataId: testSetup.fieldMetadataId2,
          primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
          displayDataLabel: false,
          axisNameDisplay: AxisNameDisplay.NONE,
        }),
      },
    },
    {
      title:
        'create a page layout widget with HORIZONTAL BAR_CHART full configuration',
      context: {
        widgetTitle: 'Horizontal Bar Chart Widget',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.BAR_CHART,
          layout: BarChartLayout.HORIZONTAL,
          aggregateFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateOperation: AggregateOperations.SUM,
          primaryAxisGroupByFieldMetadataId: testSetup.fieldMetadataId2,
          primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
          displayDataLabel: true,
          axisNameDisplay: AxisNameDisplay.NONE,
          color: 'blue',
          description: 'Horizontal revenue breakdown',
          omitNullValues: true,
          rangeMin: 0,
          rangeMax: 100000,
        }),
      },
    },
    {
      title:
        'create a page layout widget with HORIZONTAL BAR_CHART minimal configuration',
      context: {
        widgetTitle: 'Horizontal Bar Chart Widget Minimal',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.BAR_CHART,
          layout: BarChartLayout.HORIZONTAL,
          aggregateFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateOperation: AggregateOperations.COUNT,
          primaryAxisGroupByFieldMetadataId: testSetup.fieldMetadataId2,
          primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
          displayDataLabel: false,
          axisNameDisplay: AxisNameDisplay.NONE,
        }),
      },
    },
    {
      title: 'create a page layout widget with PIE_CHART full configuration',
      context: {
        widgetTitle: 'Pie Chart Widget',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.PIE_CHART,
          groupByFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateFieldMetadataId: testSetup.fieldMetadataId2,
          aggregateOperation: AggregateOperations.SUM,
          orderBy: GraphOrderBy.VALUE_DESC,
          displayDataLabel: true,
          displayLegend: true,
          showCenterMetric: true,
          color: 'yellow',
          description: 'Distribution by category',
        }),
      },
    },
    {
      title: 'create a page layout widget with PIE_CHART minimal configuration',
      context: {
        widgetTitle: 'Pie Chart Widget Minimal',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.PIE_CHART,
          groupByFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateFieldMetadataId: testSetup.fieldMetadataId2,
          aggregateOperation: AggregateOperations.COUNT,
          orderBy: GraphOrderBy.FIELD_ASC,
          displayDataLabel: false,
        }),
      },
    },
    {
      title: 'create a page layout widget with LINE_CHART full configuration',
      context: {
        widgetTitle: 'Line Chart Widget',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.LINE_CHART,
          aggregateFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateOperation: AggregateOperations.AVG,
          primaryAxisGroupByFieldMetadataId: testSetup.fieldMetadataId2,
          primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
          secondaryAxisGroupByFieldMetadataId: testSetup.fieldMetadataId3,
          secondaryAxisGroupBySubFieldName:
            testSetup.fieldMetadataId3SubFieldName,
          secondaryAxisOrderBy: GraphOrderBy.FIELD_DESC,
          displayDataLabel: true,
          axisNameDisplay: AxisNameDisplay.NONE,
          color: 'cyan',
          description: 'Trend over time',
          omitNullValues: false,
          rangeMin: -100,
          rangeMax: 100,
        }),
      },
    },
    {
      title:
        'create a page layout widget with LINE_CHART minimal configuration',
      context: {
        widgetTitle: 'Line Chart Widget Minimal',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.LINE_CHART,
          aggregateFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateOperation: AggregateOperations.MAX,
          primaryAxisGroupByFieldMetadataId: testSetup.fieldMetadataId2,
          primaryAxisOrderBy: GraphOrderBy.VALUE_ASC,
          displayDataLabel: false,
          axisNameDisplay: AxisNameDisplay.NONE,
        }),
      },
    },
    {
      title: 'create a page layout widget with GAUGE_CHART full configuration',
      context: {
        widgetTitle: 'Gauge Chart Widget',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.GAUGE_CHART,
          aggregateFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateOperation: AggregateOperations.SUM,
          description: 'Completion percentage',
          displayDataLabel: true,
        }),
      },
    },
    {
      title:
        'create a page layout widget with GAUGE_CHART minimal configuration',
      context: {
        widgetTitle: 'Gauge Chart Widget Minimal',
        buildConfiguration: () => ({
          configurationType: WidgetConfigurationType.GAUGE_CHART,
          aggregateFieldMetadataId: testSetup.fieldMetadataId1,
          aggregateOperation: AggregateOperations.COUNT_TRUE,
          displayDataLabel: false,
        }),
      },
    },
  ];

  beforeAll(async () => {
    const testFieldMetadataIds = await fetchTestFieldMetadataIds();

    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Widgets' },
    });

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widgets',
        pageLayoutId: layoutData.createPageLayout.id,
      },
    });

    testSetup = {
      pageLayoutId: layoutData.createPageLayout.id,
      pageLayoutTabId: tabData.createPageLayoutTab.id,
      ...testFieldMetadataIds,
    };
  });

  afterAll(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: testSetup.pageLayoutTabId },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testSetup.pageLayoutId },
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

  it.each(eachTestingContextFilter(STATIC_TEST_CASES))(
    'should $title',
    async ({ context: { input } }) => {
      const { data } = await createOnePageLayoutWidget({
        expectToFail: false,
        input: {
          ...input,
          pageLayoutTabId: testSetup.pageLayoutTabId,
        },
      });

      createdPageLayoutWidgetId = data?.createPageLayoutWidget?.id;

      expect(data.createPageLayoutWidget).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.createPageLayoutWidget }),
      );
    },
  );

  it.each(eachTestingContextFilter(graphTestCases))(
    'should $title',
    async ({ context: { widgetTitle, buildConfiguration } }) => {
      const { data } = await createOnePageLayoutWidget({
        expectToFail: false,
        input: {
          title: widgetTitle,
          type: WidgetType.GRAPH,
          objectMetadataId: testSetup.objectMetadataId,
          configuration: buildConfiguration(),
          pageLayoutTabId: testSetup.pageLayoutTabId,
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      createdPageLayoutWidgetId = data?.createPageLayoutWidget?.id;

      expect(data.createPageLayoutWidget).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.createPageLayoutWidget }),
      );
    },
  );
});
