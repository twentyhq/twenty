import { fastDeepEqual, isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/chart-referencing-field-in-configuration.type';
import { getChartFieldReferences } from 'src/engine/metadata-modules/page-layout-widget/utils/get-chart-field-references.util';

// Clients send explicit nulls where the stored configuration omits the key
const removeNullishValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(removeNullishValues);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => isDefined(entryValue))
      .map(([key, entryValue]) => [key, removeNullishValues(entryValue)]),
  );
};

export const haveSameChartFieldReferences = ({
  configuration,
  otherConfiguration,
}: {
  configuration: ChartReferencingFieldInConfiguration;
  otherConfiguration: ChartReferencingFieldInConfiguration;
}): boolean =>
  fastDeepEqual(
    removeNullishValues(getChartFieldReferences(configuration)),
    removeNullishValues(getChartFieldReferences(otherConfiguration)),
  );
