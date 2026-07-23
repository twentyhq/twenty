import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { type RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';

export const buildFormattedToRawLookupDto = ({
  formattedToRawLookup,
  relationLabelResolutions,
}: {
  formattedToRawLookup: Map<string, RawDimensionValue>;
  relationLabelResolutions: Array<RelationLabelResolution | undefined>;
}): Record<string, RawDimensionValue> => {
  const definedUnresolvedRecordIdSets = relationLabelResolutions
    .filter(isDefined)
    .map(
      (relationLabelResolution) => relationLabelResolution.unresolvedRecordIds,
    );

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
