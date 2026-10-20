import { type IsFilter } from '@/types';
import { isDefined } from '@/utils/validation/isDefined';

export type CompositeSubFieldMatcher = ({
  subFieldFilter,
  subFieldValue,
}: {
  subFieldFilter: object;
  subFieldValue: unknown;
}) => boolean;

export const isMatchingCompositeFilter = ({
  compositeFilter,
  compositeValue,
  subFieldMatchers,
}: {
  compositeFilter: Record<string, { is?: IsFilter } | null | undefined>;
  compositeValue: Record<string, unknown> | null | undefined;
  subFieldMatchers: Record<string, CompositeSubFieldMatcher>;
}): boolean =>
  Object.entries(compositeFilter).every(([subFieldName, subFieldFilter]) => {
    if (
      !isDefined(subFieldFilter) ||
      Object.keys(subFieldFilter).length === 0
    ) {
      return true;
    }

    const isMatching = subFieldMatchers[subFieldName];

    if (!isDefined(isMatching)) {
      return false;
    }

    const subFieldValue = compositeValue?.[subFieldName];

    if (!isDefined(subFieldValue)) {
      return subFieldFilter.is === 'NULL';
    }

    return isMatching({ subFieldFilter, subFieldValue });
  });
