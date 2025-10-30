import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { AxisNameDisplay } from 'src/engine/core-modules/page-layout/enums/axis-name-display.enum';
import { GraphOrderBy } from 'src/engine/core-modules/page-layout/enums/graph-order-by.enum';
import { GraphType } from 'src/engine/core-modules/page-layout/enums/graph-type.enum';

export const TEST_FIELD_METADATA_ID_1 = '20202020-1111-4111-a111-111111111111';
export const TEST_FIELD_METADATA_ID_2 = '20202020-2222-4222-a222-222222222222';
export const TEST_FIELD_METADATA_ID_3 = '20202020-3333-4333-a333-333333333333';
export const TEST_FIELD_METADATA_ID_4 = '20202020-4444-4444-a444-444444444444';

export const TEST_IFRAME_CONFIG = {
  url: 'https://example.com/dashboard',
};

export const TEST_IFRAME_CONFIG_ALTERNATIVE = {
  url: 'https://app.twenty.com/analytics',
};

export const TEST_NUMBER_CHART_CONFIG = {
  graphType: GraphType.AGGREGATE,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.COUNT,
  label: 'Total Records',
  description: 'Count of all records',
  format: '0,0',
  displayDataLabel: true,
};

export const TEST_NUMBER_CHART_CONFIG_MINIMAL = {
  graphType: GraphType.AGGREGATE,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  displayDataLabel: false,
};

export const TEST_VERTICAL_BAR_CHART_CONFIG = {
  graphType: GraphType.VERTICAL_BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  primaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
  displayDataLabel: true,
  axisNameDisplay: AxisNameDisplay.NONE,
  color: 'red',
  description: 'Monthly revenue breakdown',
  omitNullValues: true,
  rangeMin: 0,
  rangeMax: 100000,
};

export const TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL = {
  graphType: GraphType.VERTICAL_BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.COUNT,
  primaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
  displayDataLabel: false,
  axisNameDisplay: AxisNameDisplay.NONE,
};

export const TEST_HORIZONTAL_BAR_CHART_CONFIG = {
  graphType: GraphType.HORIZONTAL_BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  primaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
  displayDataLabel: true,
  axisNameDisplay: AxisNameDisplay.NONE,
  color: 'blue',
  description: 'Horizontal revenue breakdown',
  omitNullValues: true,
  rangeMin: 0,
  rangeMax: 100000,
};

export const TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL = {
  graphType: GraphType.HORIZONTAL_BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.COUNT,
  primaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
  displayDataLabel: false,
  axisNameDisplay: AxisNameDisplay.NONE,
};

export const TEST_LINE_CHART_CONFIG = {
  graphType: GraphType.LINE,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.AVG,
  primaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
  secondaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_3,
  secondaryAxisOrderBy: GraphOrderBy.FIELD_DESC,
  displayDataLabel: true,
  axisNameDisplay: AxisNameDisplay.NONE,
  color: 'cyan',
  description: 'Trend over time',
  omitNullValues: false,
  rangeMin: -100,
  rangeMax: 100,
};

export const TEST_LINE_CHART_CONFIG_MINIMAL = {
  graphType: GraphType.LINE,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.MAX,
  primaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.VALUE_ASC,
  displayDataLabel: false,
  axisNameDisplay: AxisNameDisplay.NONE,
};

export const TEST_PIE_CHART_CONFIG = {
  graphType: GraphType.PIE,
  groupByFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  aggregateOperation: AggregateOperations.SUM,
  orderBy: GraphOrderBy.VALUE_DESC,
  displayDataLabel: true,
  color: 'yellow',
  description: 'Distribution by category',
  filter: {
    and: [
      {
        field: 'status',
        operator: 'eq',
        value: 'active',
      },
    ],
  },
};

export const TEST_PIE_CHART_CONFIG_MINIMAL = {
  graphType: GraphType.PIE,
  groupByFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  aggregateOperation: AggregateOperations.COUNT,
  orderBy: GraphOrderBy.FIELD_ASC,
  displayDataLabel: false,
};

export const TEST_GAUGE_CHART_CONFIG = {
  graphType: GraphType.GAUGE,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  description: 'Completion percentage',
  displayDataLabel: true,
  filter: {
    or: [
      {
        field: 'completed',
        operator: 'eq',
        value: true,
      },
    ],
  },
};

export const TEST_GAUGE_CHART_CONFIG_MINIMAL = {
  graphType: GraphType.GAUGE,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.COUNT_TRUE,
  displayDataLabel: false,
};

export const INVALID_IFRAME_CONFIG_BAD_URL = {
  url: 'not-a-valid-url',
};

export const INVALID_IFRAME_CONFIG_MISSING_URL = {};

export const INVALID_IFRAME_CONFIG_EMPTY_URL = {
  url: '',
};

export const INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS = {
  graphType: GraphType.AGGREGATE,
};

export const INVALID_NUMBER_CHART_CONFIG_BAD_UUID = {
  graphType: GraphType.AGGREGATE,
  aggregateFieldMetadataId: 'not-a-uuid',
  aggregateOperation: AggregateOperations.COUNT,
};

export const INVALID_NUMBER_CHART_CONFIG_INVALID_OPERATION = {
  graphType: GraphType.AGGREGATE,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: 'INVALID_OP' as any,
};

export const INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY = {
  graphType: GraphType.VERTICAL_BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
};

export const INVALID_VERTICAL_BAR_CHART_CONFIG_BAD_ORDER_BY = {
  graphType: GraphType.VERTICAL_BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  primaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: 'INVALID_ORDER' as any,
};

export const INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY = {
  graphType: GraphType.HORIZONTAL_BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
};

export const INVALID_HORIZONTAL_BAR_CHART_CONFIG_BAD_ORDER_BY = {
  graphType: GraphType.HORIZONTAL_BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  primaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: 'INVALID_ORDER' as any,
};

export const CONFIG_TYPE_MISMATCH_IFRAME_WITH_GRAPH = {
  graphType: GraphType.AGGREGATE,
  url: 'https://example.com',
};

export const CONFIG_TYPE_MISMATCH_GRAPH_WITH_IFRAME = {
  url: 'https://example.com',
};

export const ALL_VALID_GRAPH_CONFIGS = [
  TEST_NUMBER_CHART_CONFIG,
  TEST_VERTICAL_BAR_CHART_CONFIG,
  TEST_HORIZONTAL_BAR_CHART_CONFIG,
  TEST_LINE_CHART_CONFIG,
  TEST_PIE_CHART_CONFIG,
  TEST_GAUGE_CHART_CONFIG,
];

export const ALL_MINIMAL_GRAPH_CONFIGS = [
  TEST_NUMBER_CHART_CONFIG_MINIMAL,
  TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL,
  TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL,
  TEST_LINE_CHART_CONFIG_MINIMAL,
  TEST_PIE_CHART_CONFIG_MINIMAL,
  TEST_GAUGE_CHART_CONFIG_MINIMAL,
];

export const ALL_INVALID_CONFIGS = [
  INVALID_IFRAME_CONFIG_BAD_URL,
  INVALID_IFRAME_CONFIG_MISSING_URL,
  INVALID_IFRAME_CONFIG_EMPTY_URL,
  INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
  INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
  INVALID_NUMBER_CHART_CONFIG_INVALID_OPERATION,
  INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  INVALID_VERTICAL_BAR_CHART_CONFIG_BAD_ORDER_BY,
  INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  INVALID_HORIZONTAL_BAR_CHART_CONFIG_BAD_ORDER_BY,
];

export function getValidConfigForWidgetType(widgetType: string): any {
  switch (widgetType) {
    case 'IFRAME':
      return TEST_IFRAME_CONFIG;
    case 'GRAPH': {
      const configs = ALL_VALID_GRAPH_CONFIGS;

      return configs[Math.floor(Math.random() * configs.length)];
    }
    case 'VIEW':
    case 'FIELDS':
    case 'TIMELINE':
    case 'TASKS':
    case 'NOTES':
    case 'FILES':
    case 'EMAILS':
    case 'CALENDAR':
      return null;
    default:
      return null;
  }
}
