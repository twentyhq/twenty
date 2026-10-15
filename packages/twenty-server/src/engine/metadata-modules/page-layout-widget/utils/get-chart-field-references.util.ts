import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type ChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/chart-referencing-field-in-configuration.type';

const getGroupByFieldReferences = (
  configuration: ChartReferencingFieldInConfiguration,
) => {
  switch (configuration.configurationType) {
    case WidgetConfigurationType.BAR_CHART:
    case WidgetConfigurationType.LINE_CHART:
      return [
        {
          fieldMetadataId: configuration.primaryAxisGroupByFieldMetadataId,
          subFieldName: configuration.primaryAxisGroupBySubFieldName,
        },
        {
          fieldMetadataId: configuration.secondaryAxisGroupByFieldMetadataId,
          subFieldName: configuration.secondaryAxisGroupBySubFieldName,
        },
      ];
    case WidgetConfigurationType.PIE_CHART:
      return [
        {
          fieldMetadataId: configuration.groupByFieldMetadataId,
          subFieldName: configuration.groupBySubFieldName,
        },
      ];
    default:
      return [];
  }
};

// Only the properties read by validateChartConfigurationFieldReferencesOrThrow
export const getChartFieldReferences = (
  configuration: ChartReferencingFieldInConfiguration,
) => ({
  configurationType: configuration.configurationType,
  aggregateFieldMetadataId: configuration.aggregateFieldMetadataId,
  groupBys: getGroupByFieldReferences(configuration),
  recordFilters: (configuration.filter?.recordFilters ?? []).map(
    ({ fieldMetadataId, operand, value, subFieldName }) => ({
      fieldMetadataId,
      operand,
      value,
      subFieldName,
    }),
  ),
});
