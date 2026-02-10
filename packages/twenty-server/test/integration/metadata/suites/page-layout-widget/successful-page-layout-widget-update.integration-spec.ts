import {
  TEST_IFRAME_CONFIG,
  TEST_IFRAME_CONFIG_ALTERNATIVE,
  TEST_STANDALONE_RICH_TEXT_CONFIG,
} from 'test/integration/constants/widget-configuration-test-data.constants';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { fetchTestFieldMetadataIds } from 'test/integration/metadata/suites/page-layout-widget/utils/fetch-test-field-metadata-ids.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
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

type StaticUpdateTestContext = {
  input: {
    title?: string;
    configuration?: AllPageLayoutWidgetConfiguration;
    gridPosition?: {
      row: number;
      column: number;
      rowSpan: number;
      columnSpan: number;
    };
  };
};

type GraphUpdateTestContext = {
  buildConfiguration: () => AllPageLayoutWidgetConfiguration;
};

const DEFAULT_GRID_POSITION = {
  row: 0,
  column: 0,
  rowSpan: 1,
  columnSpan: 1,
};

const IFRAME_UPDATE_TEST_CASES: EachTestingContext<StaticUpdateTestContext>[] =
  [
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
  ];

describe('Page layout widget update should succeed', () => {
  let testSetup: {
    pageLayoutId: string;
    pageLayoutTabId: string;
    objectMetadataId: string;
    fieldMetadataId1: string;
    fieldMetadataId2: string;
    fieldMetadataId3: string;
    fieldMetadataId3SubFieldName: string;
  };

  beforeAll(async () => {
    const testFieldMetadataIds = await fetchTestFieldMetadataIds();

    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Widget Updates' },
    });

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widget Updates',
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

  describe('from an IFRAME widget', () => {
    let testPageLayoutWidgetId: string;

    beforeEach(async () => {
      const { data } = await createOnePageLayoutWidget({
        expectToFail: false,
        input: {
          title: 'Original Widget Title',
          pageLayoutTabId: testSetup.pageLayoutTabId,
          type: WidgetType.IFRAME,
          configuration: TEST_IFRAME_CONFIG,
          gridPosition: DEFAULT_GRID_POSITION,
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

    it.each(eachTestingContextFilter(IFRAME_UPDATE_TEST_CASES))(
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
          extractRecordIdsAndDatesAsExpectAny({
            ...data.updatePageLayoutWidget,
          }),
        );
      },
    );
  });

  describe('from a STANDALONE_RICH_TEXT widget', () => {
    let testPageLayoutWidgetId: string;

    beforeEach(async () => {
      const { data } = await createOnePageLayoutWidget({
        expectToFail: false,
        input: {
          title: 'Original Rich Text Widget',
          pageLayoutTabId: testSetup.pageLayoutTabId,
          type: WidgetType.STANDALONE_RICH_TEXT,
          configuration: {
            configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
            body: { markdown: 'Initial content' },
          },
          gridPosition: DEFAULT_GRID_POSITION,
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

    it('should update page layout widget to STANDALONE_RICH_TEXT configuration', async () => {
      const { data } = await updateOnePageLayoutWidget({
        expectToFail: false,
        input: {
          id: testPageLayoutWidgetId,
          configuration: TEST_STANDALONE_RICH_TEXT_CONFIG,
        },
      });

      expect(data.updatePageLayoutWidget).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({
          ...data.updatePageLayoutWidget,
        }),
      );
    });
  });

  describe('from a GRAPH widget', () => {
    let testPageLayoutWidgetId: string;

    const graphTestCases: EachTestingContext<GraphUpdateTestContext>[] = [
      {
        title: 'update page layout widget to AGGREGATE_CHART configuration',
        context: {
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
        title: 'update page layout widget to VERTICAL BAR_CHART configuration',
        context: {
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
          'update page layout widget to HORIZONTAL BAR_CHART configuration',
        context: {
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
        title: 'update page layout widget to PIE_CHART configuration',
        context: {
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
        title: 'update page layout widget to LINE_CHART configuration',
        context: {
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
        title: 'update page layout widget to GAUGE_CHART configuration',
        context: {
          buildConfiguration: () => ({
            configurationType: WidgetConfigurationType.GAUGE_CHART,
            aggregateFieldMetadataId: testSetup.fieldMetadataId1,
            aggregateOperation: AggregateOperations.SUM,
            description: 'Completion percentage',
            displayDataLabel: true,
          }),
        },
      },
    ];

    beforeEach(async () => {
      const { data } = await createOnePageLayoutWidget({
        expectToFail: false,
        input: {
          title: 'Original Graph Widget',
          pageLayoutTabId: testSetup.pageLayoutTabId,
          type: WidgetType.GRAPH,
          objectMetadataId: testSetup.objectMetadataId,
          configuration: {
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: testSetup.fieldMetadataId1,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: false,
          },
          gridPosition: DEFAULT_GRID_POSITION,
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

    it.each(eachTestingContextFilter(graphTestCases))(
      'should $title',
      async ({ context: { buildConfiguration } }) => {
        const { data } = await updateOnePageLayoutWidget({
          expectToFail: false,
          input: {
            id: testPageLayoutWidgetId,
            configuration: buildConfiguration(),
          },
        });

        expect(data.updatePageLayoutWidget).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny({
            ...data.updatePageLayoutWidget,
          }),
        );
      },
    );
  });
});
