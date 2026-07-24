import { isDefined } from 'twenty-shared/utils';

import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { type RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';

type AxisLookup = {
  formattedToRawLookup: Map<string, RawDimensionValue>;
  relationLabelResolution: RelationLabelResolution | undefined;
};

export const buildFormattedToRawLookupDto = ({
  axisLookups,
}: {
  axisLookups: AxisLookup[];
}): Record<string, RawDimensionValue> => {
  const mergedLookup = new Map<string, RawDimensionValue>();

  for (const { formattedToRawLookup, relationLabelResolution } of axisLookups) {
    const unresolvedRecordIds = relationLabelResolution?.unresolvedRecordIds;

    for (const [formattedValue, rawValue] of formattedToRawLookup) {
      const isUnresolvedRecordId =
        isDefined(unresolvedRecordIds) &&
        unresolvedRecordIds.has(String(rawValue));

      if (isUnresolvedRecordId) {
        continue;
      }

      mergedLookup.set(formattedValue, rawValue);
    }
  }

  return Object.fromEntries(mergedLookup);
};
