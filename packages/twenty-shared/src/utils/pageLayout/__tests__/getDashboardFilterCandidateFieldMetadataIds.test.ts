import {
  type AggregateChartConfiguration,
  AggregateOperations,
  type BarChartConfiguration,
  type ChartFilter,
  type PieChartConfiguration,
  ViewFilterOperand,
} from '@/types';
import { getDashboardFilterCandidateFieldMetadataIds } from '@/utils/pageLayout/getDashboardFilterCandidateFieldMetadataIds';

const WIDGET_FILTER: ChartFilter = {
  recordFilters: [
    {
      fieldMetadataId: 'close-date-field-id',
      operand: ViewFilterOperand.IS_IN_PAST,
    },
    { fieldMetadataId: 'stage-field-id', operand: ViewFilterOperand.IS },
  ],
};

describe('getDashboardFilterCandidateFieldMetadataIds', () => {
  it('should read the primary axis group-by and the widget filter of a bar or line chart', () => {
    const barChartConfiguration: BarChartConfiguration = {
      configurationType: 'BAR_CHART',
      aggregateFieldMetadataId: 'amount-field-id',
      aggregateOperation: AggregateOperations.SUM,
      primaryAxisGroupByFieldMetadataId: 'created-at-field-id',
      secondaryAxisGroupByFieldMetadataId: 'renewal-date-field-id',
      filter: WIDGET_FILTER,
    };

    expect(
      getDashboardFilterCandidateFieldMetadataIds(barChartConfiguration),
    ).toEqual({
      groupByFieldMetadataIds: ['created-at-field-id'],
      widgetFilterFieldMetadataIds: ['close-date-field-id', 'stage-field-id'],
    });
  });

  it('should read the group-by of a pie chart', () => {
    const pieChartConfiguration: PieChartConfiguration = {
      configurationType: 'PIE_CHART',
      aggregateFieldMetadataId: 'amount-field-id',
      aggregateOperation: AggregateOperations.SUM,
      groupByFieldMetadataId: 'close-date-field-id',
    };

    expect(
      getDashboardFilterCandidateFieldMetadataIds(pieChartConfiguration),
    ).toEqual({
      groupByFieldMetadataIds: ['close-date-field-id'],
      widgetFilterFieldMetadataIds: [],
    });
  });

  it('should read only the widget filter of a chart that groups by nothing', () => {
    const aggregateChartConfiguration: AggregateChartConfiguration = {
      configurationType: 'AGGREGATE_CHART',
      aggregateFieldMetadataId: 'amount-field-id',
      aggregateOperation: AggregateOperations.SUM,
      filter: WIDGET_FILTER,
    };

    expect(
      getDashboardFilterCandidateFieldMetadataIds(aggregateChartConfiguration),
    ).toEqual({
      groupByFieldMetadataIds: [],
      widgetFilterFieldMetadataIds: ['close-date-field-id', 'stage-field-id'],
    });
  });

  it('should skip an "is empty" condition so it never chooses the field', () => {
    expect(
      getDashboardFilterCandidateFieldMetadataIds({
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'close-date-field-id',
              operand: ViewFilterOperand.IS_EMPTY,
            },
            {
              fieldMetadataId: 'renewal-date-field-id',
              operand: ViewFilterOperand.IS_NOT_EMPTY,
            },
          ],
        },
      }),
    ).toEqual({
      groupByFieldMetadataIds: [],
      widgetFilterFieldMetadataIds: ['renewal-date-field-id'],
    });
  });
});
