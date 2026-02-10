import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { type BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { type GaugeChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.dto';
import { type IframeConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/iframe-configuration.dto';
import { type LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { type PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { type StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

// Hardcoded UUIDs for unit tests only (no DB lookup needed)
const UNIT_TEST_FIELD_METADATA_ID_1 = '20202020-1111-4111-a111-111111111111';
const UNIT_TEST_FIELD_METADATA_ID_2 = '20202020-2222-4222-a222-222222222222';
const UNIT_TEST_FIELD_METADATA_ID_3 = '20202020-3333-4333-a333-333333333333';

// --- Static configs (no field metadata IDs) ---

export const TEST_IFRAME_CONFIG: IframeConfigurationDTO = {
  configurationType: WidgetConfigurationType.IFRAME,
  url: 'https://example.com/dashboard',
};

export const TEST_IFRAME_CONFIG_ALTERNATIVE: IframeConfigurationDTO = {
  configurationType: WidgetConfigurationType.IFRAME,
  url: 'https://app.twenty.com/analytics',
};

export const TEST_STANDALONE_RICH_TEXT_CONFIG: StandaloneRichTextConfigurationDTO =
  {
    configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
    body: {
      blocknote:
        '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello world"}]}]}',
      markdown: '# Hello world',
    },
  };

export const TEST_STANDALONE_RICH_TEXT_CONFIG_MINIMAL: StandaloneRichTextConfigurationDTO =
  {
    configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
    body: {
      blocknote:
        '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Simple text"}]}]}',
      markdown: null,
    },
  };

// --- Invalid configs (for failure test cases) ---

export const INVALID_STANDALONE_RICH_TEXT_CONFIG_MISSING_BODY = {};

export const INVALID_STANDALONE_RICH_TEXT_CONFIG_BODY_WRONG_TYPE = {
  body: 'not an object',
};

export const INVALID_STANDALONE_RICH_TEXT_CONFIG_INVALID_SUBFIELDS = {
  configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
  body: {
    blocknote: 'valid',
    markdown: 'valid',
    invalidField: 'should not be here',
  },
};

export const INVALID_IFRAME_CONFIG_BAD_URL = {
  url: 'not-a-valid-url',
};

export const INVALID_IFRAME_CONFIG_EMPTY_URL = {
  url: '',
};

export const INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS = {
  configurationType: WidgetConfigurationType.AGGREGATE_CHART,
};

export const INVALID_NUMBER_CHART_CONFIG_BAD_UUID = {
  configurationType: WidgetConfigurationType.AGGREGATE_CHART,
  aggregateFieldMetadataId: 'not-a-uuid',
  aggregateOperation: AggregateOperations.COUNT,
};

export const INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY = {
  configurationType: WidgetConfigurationType.BAR_CHART,
  aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
};

export const INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY = {
  configurationType: WidgetConfigurationType.BAR_CHART,
  aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
};

// --- Unit-test-only graph configs (with hardcoded UUIDs, for validation tests) ---

export const TEST_NUMBER_CHART_CONFIG: AggregateChartConfigurationDTO = {
  configurationType: WidgetConfigurationType.AGGREGATE_CHART,
  aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.COUNT,
  label: 'Total Records',
  description: 'Count of all records',
  format: '0,0',
  displayDataLabel: true,
};

export const TEST_NUMBER_CHART_CONFIG_MINIMAL: AggregateChartConfigurationDTO =
  {
    configurationType: WidgetConfigurationType.AGGREGATE_CHART,
    aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
    aggregateOperation: AggregateOperations.SUM,
    displayDataLabel: false,
  };

export const TEST_VERTICAL_BAR_CHART_CONFIG: BarChartConfigurationDTO = {
  configurationType: WidgetConfigurationType.BAR_CHART,
  layout: BarChartLayout.VERTICAL,
  aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  primaryAxisGroupByFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
  displayDataLabel: true,
  axisNameDisplay: AxisNameDisplay.NONE,
  color: 'red',
  description: 'Monthly revenue breakdown',
  omitNullValues: true,
  rangeMin: 0,
  rangeMax: 100000,
};

export const TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL: BarChartConfigurationDTO =
  {
    configurationType: WidgetConfigurationType.BAR_CHART,
    layout: BarChartLayout.VERTICAL,
    aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
    aggregateOperation: AggregateOperations.COUNT,
    primaryAxisGroupByFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_2,
    primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
    displayDataLabel: false,
    axisNameDisplay: AxisNameDisplay.NONE,
  };

export const TEST_HORIZONTAL_BAR_CHART_CONFIG: BarChartConfigurationDTO = {
  configurationType: WidgetConfigurationType.BAR_CHART,
  layout: BarChartLayout.HORIZONTAL,
  aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  primaryAxisGroupByFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
  displayDataLabel: true,
  axisNameDisplay: AxisNameDisplay.NONE,
  color: 'blue',
  description: 'Horizontal revenue breakdown',
  omitNullValues: true,
  rangeMin: 0,
  rangeMax: 100000,
};

export const TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL: BarChartConfigurationDTO =
  {
    configurationType: WidgetConfigurationType.BAR_CHART,
    layout: BarChartLayout.HORIZONTAL,
    aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
    aggregateOperation: AggregateOperations.COUNT,
    primaryAxisGroupByFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_2,
    primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
    displayDataLabel: false,
    axisNameDisplay: AxisNameDisplay.NONE,
  };

export const TEST_LINE_CHART_CONFIG: LineChartConfigurationDTO = {
  configurationType: WidgetConfigurationType.LINE_CHART,
  aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.AVG,
  primaryAxisGroupByFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
  secondaryAxisGroupByFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_3,
  secondaryAxisOrderBy: GraphOrderBy.FIELD_DESC,
  displayDataLabel: true,
  axisNameDisplay: AxisNameDisplay.NONE,
  color: 'cyan',
  description: 'Trend over time',
  omitNullValues: false,
  rangeMin: -100,
  rangeMax: 100,
};

export const TEST_LINE_CHART_CONFIG_MINIMAL: LineChartConfigurationDTO = {
  configurationType: WidgetConfigurationType.LINE_CHART,
  aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.MAX,
  primaryAxisGroupByFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.VALUE_ASC,
  displayDataLabel: false,
  axisNameDisplay: AxisNameDisplay.NONE,
};

export const TEST_PIE_CHART_CONFIG: PieChartConfigurationDTO = {
  configurationType: WidgetConfigurationType.PIE_CHART,
  groupByFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
  aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_2,
  aggregateOperation: AggregateOperations.SUM,
  orderBy: GraphOrderBy.VALUE_DESC,
  displayDataLabel: true,
  displayLegend: true,
  showCenterMetric: true,
  color: 'yellow',
  description: 'Distribution by category',
};

export const TEST_PIE_CHART_CONFIG_MINIMAL: PieChartConfigurationDTO = {
  configurationType: WidgetConfigurationType.PIE_CHART,
  groupByFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
  aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_2,
  aggregateOperation: AggregateOperations.COUNT,
  orderBy: GraphOrderBy.FIELD_ASC,
  displayDataLabel: false,
};

export const TEST_GAUGE_CHART_CONFIG: GaugeChartConfigurationDTO = {
  configurationType: WidgetConfigurationType.GAUGE_CHART,
  aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  description: 'Completion percentage',
  displayDataLabel: true,
};

export const TEST_GAUGE_CHART_CONFIG_MINIMAL: GaugeChartConfigurationDTO = {
  configurationType: WidgetConfigurationType.GAUGE_CHART,
  aggregateFieldMetadataId: UNIT_TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.COUNT_TRUE,
  displayDataLabel: false,
};
