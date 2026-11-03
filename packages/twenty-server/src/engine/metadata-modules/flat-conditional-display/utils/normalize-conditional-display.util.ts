import { isArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const normalizeConditionalDisplay = <
  TConditionalDisplay extends { recordFilters?: unknown[] },
>(
  conditionalDisplay: TConditionalDisplay | null | undefined,
): TConditionalDisplay | null => {
  if (!isDefined(conditionalDisplay)) {
    return null;
  }

  if (
    isArray(conditionalDisplay.recordFilters) &&
    conditionalDisplay.recordFilters.length === 0
  ) {
    return null;
  }

  return conditionalDisplay;
};
