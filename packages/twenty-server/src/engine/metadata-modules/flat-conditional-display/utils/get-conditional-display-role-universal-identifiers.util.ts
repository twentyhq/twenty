import { isArray, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { parseSelectFilterValues } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-invalid-select-filter-option-values.util';

export const getConditionalDisplayRoleUniversalIdentifiers = (
  conditionalDisplay: unknown,
): string[] => {
  if (
    !isPlainObject(conditionalDisplay) ||
    !isArray(conditionalDisplay.recordFilters)
  ) {
    return [];
  }

  return conditionalDisplay.recordFilters
    .filter(
      (recordFilter): recordFilter is Record<string, unknown> =>
        isPlainObject(recordFilter) &&
        recordFilter.contextKey === 'currentRoleId',
    )
    .flatMap((recordFilter) =>
      isString(recordFilter.value)
        ? (parseSelectFilterValues(recordFilter.value) ?? [])
        : [],
    );
};
