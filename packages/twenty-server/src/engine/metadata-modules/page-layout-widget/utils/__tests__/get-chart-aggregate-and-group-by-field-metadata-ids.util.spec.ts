import { AggregateOperations } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { getChartAggregateAndGroupByFieldMetadataIds } from 'src/engine/metadata-modules/page-layout-widget/utils/get-chart-aggregate-and-group-by-field-metadata-ids.util';

const AGGREGATE_FIELD_ID = '11111111-1111-4111-8111-000000000001';
const GROUP_BY_FIELD_ID = '11111111-1111-4111-8111-000000000002';
const SECONDARY_GROUP_BY_FIELD_ID = '11111111-1111-4111-8111-000000000003';
const RATIO_FIELD_ID = '11111111-1111-4111-8111-000000000004';
const FILTERED_FIELD_ID = '11111111-1111-4111-8111-000000000005';

const CONFIGURATION_CASES: [
  string,
  AllPageLayoutWidgetConfiguration,
  string[],
][] = [
  [
    'an aggregate chart',
    {
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
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
      configurationType: WidgetConfigurationType.PIE_CHART,
      aggregateFieldMetadataId: AGGREGATE_FIELD_ID,
      aggregateOperation: AggregateOperations.COUNT,
      groupByFieldMetadataId: GROUP_BY_FIELD_ID,
    },
    [AGGREGATE_FIELD_ID, GROUP_BY_FIELD_ID],
  ],
  [
    'a bar chart',
    {
      configurationType: WidgetConfigurationType.BAR_CHART,
      aggregateFieldMetadataId: AGGREGATE_FIELD_ID,
      aggregateOperation: AggregateOperations.COUNT,
      primaryAxisGroupByFieldMetadataId: GROUP_BY_FIELD_ID,
      secondaryAxisGroupByFieldMetadataId: SECONDARY_GROUP_BY_FIELD_ID,
      layout: BarChartLayout.VERTICAL,
    },
    [AGGREGATE_FIELD_ID, GROUP_BY_FIELD_ID, SECONDARY_GROUP_BY_FIELD_ID],
  ],
  [
    'a line chart without secondary axis',
    {
      configurationType: WidgetConfigurationType.LINE_CHART,
      aggregateFieldMetadataId: AGGREGATE_FIELD_ID,
      aggregateOperation: AggregateOperations.COUNT,
      primaryAxisGroupByFieldMetadataId: GROUP_BY_FIELD_ID,
    },
    [AGGREGATE_FIELD_ID, GROUP_BY_FIELD_ID],
  ],
  [
    'a record table',
    { configurationType: WidgetConfigurationType.RECORD_TABLE },
    [],
  ],
];

describe('getChartAggregateAndGroupByFieldMetadataIds', () => {
  it.each(CONFIGURATION_CASES)(
    'should return the aggregated and grouped by fields of %s',
    (_title, configuration, expectedFieldMetadataIds) => {
      expect(
        getChartAggregateAndGroupByFieldMetadataIds(configuration),
      ).toEqual(expectedFieldMetadataIds);
    },
  );
});
