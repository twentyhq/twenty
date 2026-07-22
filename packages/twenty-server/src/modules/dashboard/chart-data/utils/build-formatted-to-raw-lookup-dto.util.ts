import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';

export const buildFormattedToRawLookupDto = (
  formattedToRawLookup: Map<string, RawDimensionValue>,
  unresolvedRecordIdSets: Array<Set<string> | undefined>,
): Record<string, RawDimensionValue> => {
  const definedUnresolvedRecordIdSets =
    unresolvedRecordIdSets.filter(isDefined);

  if (!isNonEmptyArray(definedUnresolvedRecordIdSets)) {
    return Object.fromEntries(formattedToRawLookup);
  }

  return Object.fromEntries(
    [...formattedToRawLookup].filter(([, rawValue]) =>
      definedUnresolvedRecordIdSets.every(
        (unresolvedRecordIds) => !unresolvedRecordIds.has(String(rawValue)),
      ),
    ),
  );
};
