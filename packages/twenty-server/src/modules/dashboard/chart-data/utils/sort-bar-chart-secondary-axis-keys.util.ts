import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { FieldMetadataOption } from 'src/modules/dashboard/chart-data/types/field-metadata-option.type';
import { RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { sortSecondaryAxisData } from 'src/modules/dashboard/chart-data/utils/sort-secondary-axis-data.util';

export const sortBarChartSecondaryAxisKeys = ({
  keys,
  data,
  configuration,
  secondaryFormattedToRawLookup,
  secondarySelectOptions,
  secondaryAxisGroupByField,
}: {
  keys: string[];
  data: Record<string, string | number>[];
  configuration: BarChartConfigurationDTO;
  secondaryFormattedToRawLookup: Map<string, RawDimensionValue>;
  secondarySelectOptions: FieldMetadataOption[] | null;
  secondaryAxisGroupByField: FlatFieldMetadata;
}): string[] => {
  const orderBy = configuration.secondaryAxisOrderBy;

  if (!isDefined(orderBy)) {
    return keys;
  }

  return sortSecondaryAxisData({
    items: keys,
    orderBy,
    manualSortOrder: configuration.secondaryAxisManualSortOrder,
    formattedToRawLookup: secondaryFormattedToRawLookup,
    getFormattedValue: (key) => key,
    getNumericValue: (key) => {
      let sum = 0;

      for (const datum of data) {
        const value = datum[key];

        if (isNumber(value)) {
          sum += value;
        }
      }

      return sum;
    },
    selectFieldOptions: secondarySelectOptions,
    fieldType: secondaryAxisGroupByField.type,
    subFieldName: configuration.secondaryAxisGroupBySubFieldName ?? undefined,
    dateGranularity: configuration.secondaryAxisGroupByDateGranularity,
  });
};
