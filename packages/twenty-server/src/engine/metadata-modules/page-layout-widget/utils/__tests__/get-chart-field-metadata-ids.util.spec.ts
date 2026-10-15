import { AggregateOperations, ViewFilterOperand } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
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
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'close-date-id',
              operand: ViewFilterOperand.IS_NOT_EMPTY,
            },
          ],
        },
      } as AllPageLayoutWidgetConfiguration),
    ).toEqual(['amount-id', 'stage-id', 'company-id', 'close-date-id']);
  });

  it('should return aggregate and group by fields of a pie chart', () => {
    expect(
      getChartFieldMetadataIds({
        configurationType: WidgetConfigurationType.PIE_CHART,
        aggregateFieldMetadataId: 'amount-id',
        aggregateOperation: AggregateOperations.SUM,
        groupByFieldMetadataId: 'stage-id',
      } as AllPageLayoutWidgetConfiguration),
    ).toEqual(['amount-id', 'stage-id']);
  });

  it('should return no field for configurations that are not charts', () => {
    expect(
      getChartFieldMetadataIds({
        configurationType: WidgetConfigurationType.IFRAME,
        url: 'https://example.com',
      } as AllPageLayoutWidgetConfiguration),
    ).toEqual([]);
  });
});
