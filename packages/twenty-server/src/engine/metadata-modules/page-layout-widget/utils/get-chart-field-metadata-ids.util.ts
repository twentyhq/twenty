import { isDefined } from 'twenty-shared/utils';

import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { getChartFieldReferences } from 'src/engine/metadata-modules/page-layout-widget/utils/get-chart-field-references.util';
import { isChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-referencing-field-in-configuration.util';

export const getChartFieldMetadataIds = (
  configuration: AllPageLayoutWidgetConfiguration,
): string[] => {
  if (!isChartReferencingFieldInConfiguration(configuration)) {
    return [];
  }

  const { aggregateFieldMetadataId, groupBys, recordFilters } =
    getChartFieldReferences(configuration);

  return [
    aggregateFieldMetadataId,
    ...groupBys.map(({ fieldMetadataId }) => fieldMetadataId),
    ...recordFilters.map(({ fieldMetadataId }) => fieldMetadataId),
  ].filter(isDefined);
};
