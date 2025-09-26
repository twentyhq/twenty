import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
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
  graphType: GraphType.NUMBER,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.COUNT,
  label: 'Total Records',
  description: 'Count of all records',
  color: 'blue',
  format: '0,0',
};

export const TEST_NUMBER_CHART_CONFIG_MINIMAL = {
  graphType: GraphType.NUMBER,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
};

export const TEST_BAR_CHART_CONFIG = {
  graphType: GraphType.BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  groupByFieldMetadataIdX: TEST_FIELD_METADATA_ID_2,
  orderByX: GraphOrderBy.FIELD_ASC,
  xAxisName: 'Month',
  yAxisName: 'Revenue',
  color: 'red',
  description: 'Monthly revenue breakdown',
  omitNullValues: true,
  rangeMin: 0,
  rangeMax: 100000,
};

export const TEST_BAR_CHART_CONFIG_MINIMAL = {
  graphType: GraphType.BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.COUNT,
  groupByFieldMetadataIdX: TEST_FIELD_METADATA_ID_2,
  orderByX: GraphOrderBy.VALUE_DESC,
};

export const TEST_LINE_CHART_CONFIG = {
  graphType: GraphType.LINE,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.AVG,
  groupByFieldMetadataIdX: TEST_FIELD_METADATA_ID_2,
  orderByX: GraphOrderBy.FIELD_ASC,
  groupByFieldMetadataIdY: TEST_FIELD_METADATA_ID_3,
  orderByY: GraphOrderBy.FIELD_DESC,
  xAxisName: 'Date',
  yAxisName: 'Average Value',
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
  groupByFieldMetadataIdX: TEST_FIELD_METADATA_ID_2,
  orderByX: GraphOrderBy.VALUE_ASC,
};

export const TEST_PIE_CHART_CONFIG = {
  graphType: GraphType.PIE,
  groupByFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  aggregateOperation: AggregateOperations.SUM,
  orderBy: GraphOrderBy.VALUE_DESC,
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
};

export const TEST_GAUGE_CHART_CONFIG = {
  graphType: GraphType.GAUGE,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  aggregateOperationTotal: AggregateOperations.COUNT,
  aggregateFieldMetadataIdTotal: TEST_FIELD_METADATA_ID_2,
  description: 'Completion percentage',
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
  aggregateOperationTotal: AggregateOperations.COUNT,
  aggregateFieldMetadataIdTotal: TEST_FIELD_METADATA_ID_2,
};

export const INVALID_IFRAME_CONFIG_BAD_URL = {
  url: 'not-a-valid-url',
};

export const INVALID_IFRAME_CONFIG_MISSING_URL = {};

export const INVALID_IFRAME_CONFIG_EMPTY_URL = {
  url: '',
};

export const INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS = {
  graphType: GraphType.NUMBER,
};

export const INVALID_NUMBER_CHART_CONFIG_BAD_UUID = {
  graphType: GraphType.NUMBER,
  aggregateFieldMetadataId: 'not-a-uuid',
  aggregateOperation: AggregateOperations.COUNT,
};

export const INVALID_NUMBER_CHART_CONFIG_INVALID_OPERATION = {
  graphType: GraphType.NUMBER,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: 'INVALID_OP' as any,
};

export const INVALID_BAR_CHART_CONFIG_MISSING_GROUP_BY = {
  graphType: GraphType.BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
};

export const INVALID_BAR_CHART_CONFIG_BAD_ORDER_BY = {
  graphType: GraphType.BAR,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  groupByFieldMetadataIdX: TEST_FIELD_METADATA_ID_2,
  orderByX: 'INVALID_ORDER' as any,
};

export const CONFIG_TYPE_MISMATCH_IFRAME_WITH_GRAPH = {
  graphType: GraphType.NUMBER,
  url: 'https://example.com',
};

export const CONFIG_TYPE_MISMATCH_GRAPH_WITH_IFRAME = {
  url: 'https://example.com',
};

export const ALL_VALID_GRAPH_CONFIGS = [
  TEST_NUMBER_CHART_CONFIG,
  TEST_BAR_CHART_CONFIG,
  TEST_LINE_CHART_CONFIG,
  TEST_PIE_CHART_CONFIG,
  TEST_GAUGE_CHART_CONFIG,
];

export const ALL_MINIMAL_GRAPH_CONFIGS = [
  TEST_NUMBER_CHART_CONFIG_MINIMAL,
  TEST_BAR_CHART_CONFIG_MINIMAL,
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
  INVALID_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  INVALID_BAR_CHART_CONFIG_BAD_ORDER_BY,
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
      return null;
    default:
      return null;
  }
}
