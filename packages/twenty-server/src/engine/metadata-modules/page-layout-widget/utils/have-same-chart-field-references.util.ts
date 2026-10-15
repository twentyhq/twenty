import { fastDeepEqual, isDefined, isPlainObject } from 'twenty-shared/utils';

import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { getChartFieldReferences } from 'src/engine/metadata-modules/page-layout-widget/utils/get-chart-field-references.util';
import { isChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-referencing-field-in-configuration.util';

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

export const haveSameChartFieldReferences = (
  configuration: AllPageLayoutWidgetConfiguration,
  otherConfiguration: AllPageLayoutWidgetConfiguration,
): boolean => {
  if (
    !isChartReferencingFieldInConfiguration(configuration) ||
    !isChartReferencingFieldInConfiguration(otherConfiguration)
  ) {
    return false;
  }

  return fastDeepEqual(
    removeNullishValues(getChartFieldReferences(configuration)),
    removeNullishValues(getChartFieldReferences(otherConfiguration)),
  );
};
