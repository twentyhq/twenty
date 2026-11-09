import {
  type AggregateChartConfiguration,
  AggregateOperations,
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
  type RecordTableConfiguration,
} from '@/types';
import { getChartReferencedFieldMetadataIds } from '@/utils/pageLayout/getChartReferencedFieldMetadataIds';

const AGGREGATE_FIELD_ID = '11111111-1111-4111-8111-000000000001';
const GROUP_BY_FIELD_ID = '11111111-1111-4111-8111-000000000002';
const SECONDARY_GROUP_BY_FIELD_ID = '11111111-1111-4111-8111-000000000003';
const RATIO_FIELD_ID = '11111111-1111-4111-8111-000000000004';
const FILTERED_FIELD_ID = '11111111-1111-4111-8111-000000000005';

const CONFIGURATION_CASES: [
  string,
  (
    | AggregateChartConfiguration
    | PieChartConfiguration
    | BarChartConfiguration
    | LineChartConfiguration
    | RecordTableConfiguration
  ),
  string[],
][] = [
  [
    'an aggregate chart with a ratio',
    {
      configurationType: 'AGGREGATE_CHART',
      aggregateFieldMetadataId: AGGREGATE_FIELD_ID,
      aggregateOperation: AggregateOperations.COUNT,
      ratioAggregateConfig: {
        fieldMetadataId: RATIO_FIELD_ID,
        optionValue: 'WON',
      },
      filter: {
        recordFilters: [
          { fieldMetadataId: FILTERED_FIELD_ID, operand: 'IS_NOT_EMPTY' },
        ],
      },
      dashboardFilterBindings: [
        {
          pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01',
          fieldMetadataId: FILTERED_FIELD_ID,
        },
      ],
    },
    [AGGREGATE_FIELD_ID, RATIO_FIELD_ID],
  ],
  [
    'a pie chart',
    {
      configurationType: 'PIE_CHART',
      aggregateFieldMetadataId: AGGREGATE_FIELD_ID,
      aggregateOperation: AggregateOperations.COUNT,
      groupByFieldMetadataId: GROUP_BY_FIELD_ID,
    },
    [AGGREGATE_FIELD_ID, GROUP_BY_FIELD_ID],
  ],
  [
    'a bar chart',
    {
      configurationType: 'BAR_CHART',
      aggregateFieldMetadataId: AGGREGATE_FIELD_ID,
      aggregateOperation: AggregateOperations.COUNT,
      primaryAxisGroupByFieldMetadataId: GROUP_BY_FIELD_ID,
      secondaryAxisGroupByFieldMetadataId: SECONDARY_GROUP_BY_FIELD_ID,
    },
    [AGGREGATE_FIELD_ID, GROUP_BY_FIELD_ID, SECONDARY_GROUP_BY_FIELD_ID],
  ],
  [
    'a line chart without secondary axis',
    {
      configurationType: 'LINE_CHART',
      aggregateFieldMetadataId: AGGREGATE_FIELD_ID,
      aggregateOperation: AggregateOperations.COUNT,
      primaryAxisGroupByFieldMetadataId: GROUP_BY_FIELD_ID,
    },
    [AGGREGATE_FIELD_ID, GROUP_BY_FIELD_ID],
  ],
  ['a record table', { configurationType: 'RECORD_TABLE' }, []],
];

describe('getChartReferencedFieldMetadataIds', () => {
  it.each(CONFIGURATION_CASES)(
    'should return the fields %s aggregates and groups by',
    (_title, configuration, expectedFieldMetadataIds) => {
      expect(getChartReferencedFieldMetadataIds(configuration)).toEqual(
        expectedFieldMetadataIds,
      );
    },
  );
});
