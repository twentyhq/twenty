import { isDefined } from 'twenty-shared/utils';

import { type ChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/chart-referencing-field-in-configuration.type';
import { getChartFieldReferences } from 'src/engine/metadata-modules/page-layout-widget/utils/get-chart-field-references.util';

export const getChartFieldMetadataIds = (
  configuration: ChartReferencingFieldInConfiguration,
): string[] => {
  const { aggregateFieldMetadataId, groupBys, recordFilters } =
    getChartFieldReferences(configuration);

  return [
    aggregateFieldMetadataId,
    ...groupBys.map(({ fieldMetadataId }) => fieldMetadataId),
    ...recordFilters.map(({ fieldMetadataId }) => fieldMetadataId),
  ].filter(isDefined);
};
