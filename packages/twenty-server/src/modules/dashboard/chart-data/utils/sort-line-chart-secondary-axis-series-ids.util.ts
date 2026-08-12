import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { FieldMetadataOption } from 'src/modules/dashboard/chart-data/types/field-metadata-option.type';
import { RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { sortSecondaryAxisData } from 'src/modules/dashboard/chart-data/utils/sort-secondary-axis-data.util';

export const sortLineChartSecondaryAxisSeriesIds = ({
  seriesIds,
  seriesMap,
  configuration,
  secondaryFormattedToRawLookup,
  secondarySelectOptions,
  secondaryAxisGroupByField,
}: {
  seriesIds: string[];
  seriesMap: Map<string, Map<string, number>>;
  configuration: LineChartConfigurationDTO;
  secondaryFormattedToRawLookup: Map<string, RawDimensionValue>;
  secondarySelectOptions: FieldMetadataOption[] | null;
  secondaryAxisGroupByField: FlatFieldMetadata;
}): string[] => {
  const orderBy = configuration.secondaryAxisOrderBy;

  if (!isDefined(orderBy)) {
    return seriesIds;
  }

  return sortSecondaryAxisData({
    items: seriesIds,
    orderBy,
    manualSortOrder: configuration.secondaryAxisManualSortOrder,
    formattedToRawLookup: secondaryFormattedToRawLookup,
    getFormattedValue: (id) => id,
    getNumericValue: (id) => {
      const xToYMap = seriesMap.get(id);

      if (!xToYMap) {
        return 0;
      }

      let sum = 0;

      for (const value of xToYMap.values()) {
        sum += value;
      }

      return sum;
    },
    selectFieldOptions: secondarySelectOptions,
    fieldType: secondaryAxisGroupByField.type,
    subFieldName: configuration.secondaryAxisGroupBySubFieldName ?? undefined,
    dateGranularity: configuration.secondaryAxisGroupByDateGranularity,
  });
};
