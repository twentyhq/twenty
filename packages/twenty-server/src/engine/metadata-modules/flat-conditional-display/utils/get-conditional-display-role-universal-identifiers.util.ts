import { isArray, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { parseConditionalDisplayRoleIds } from 'src/engine/metadata-modules/flat-conditional-display/utils/parse-conditional-display-role-ids.util';

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
        ? (parseConditionalDisplayRoleIds(recordFilter.value) ?? [])
        : [],
    );
};
