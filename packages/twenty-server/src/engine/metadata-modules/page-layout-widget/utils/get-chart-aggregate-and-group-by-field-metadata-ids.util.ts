import { isDefined } from 'twenty-shared/utils';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { isChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-referencing-field-in-configuration.util';

export const getChartAggregateAndGroupByFieldMetadataIds = (
  configuration: AllPageLayoutWidgetConfiguration,
): string[] => {
  if (!isChartReferencingFieldInConfiguration(configuration)) {
    return [];
  }

  switch (configuration.configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART:
      return [
        configuration.aggregateFieldMetadataId,
        configuration.ratioAggregateConfig?.fieldMetadataId,
      ].filter(isDefined);
    case WidgetConfigurationType.PIE_CHART:
      return [
        configuration.aggregateFieldMetadataId,
        configuration.groupByFieldMetadataId,
      ];
    case WidgetConfigurationType.BAR_CHART:
    case WidgetConfigurationType.LINE_CHART:
      return [
        configuration.aggregateFieldMetadataId,
        configuration.primaryAxisGroupByFieldMetadataId,
        configuration.secondaryAxisGroupByFieldMetadataId,
      ].filter(isDefined);
  }
};
