import { AggregateOperations, ViewFilterOperand } from 'twenty-shared/types';

import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { getChartFieldMetadataIds } from 'src/engine/metadata-modules/page-layout-widget/utils/get-chart-field-metadata-ids.util';

describe('getChartFieldMetadataIds', () => {
  it('should return aggregate, group by and filter fields of a bar chart', () => {
    expect(
      getChartFieldMetadataIds({
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: 'amount-id',
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisGroupByFieldMetadataId: 'stage-id',
        secondaryAxisGroupByFieldMetadataId: 'company-id',
        layout: BarChartLayout.VERTICAL,
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'close-date-id',
              operand: ViewFilterOperand.IS_NOT_EMPTY,
            },
          ],
        },
      }),
    ).toEqual(['amount-id', 'stage-id', 'company-id', 'close-date-id']);
  });

  it('should return aggregate and group by fields of a pie chart', () => {
    expect(
      getChartFieldMetadataIds({
        configurationType: WidgetConfigurationType.PIE_CHART,
        aggregateFieldMetadataId: 'amount-id',
        aggregateOperation: AggregateOperations.SUM,
        groupByFieldMetadataId: 'stage-id',
      }),
    ).toEqual(['amount-id', 'stage-id']);
  });

  it('should return the aggregate field of an aggregate chart', () => {
    expect(
      getChartFieldMetadataIds({
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: 'amount-id',
        aggregateOperation: AggregateOperations.SUM,
      }),
    ).toEqual(['amount-id']);
  });
});
