import { type SelectFilter } from '@/types';
import { isDefined } from '@/utils/validation/isDefined';

import { compareSelectOptionValues } from './compareSelectOptionValues';

export const isMatchingSelectFilter = ({
  selectFilter,
  value,
  options,
}: {
  selectFilter: SelectFilter;
  value: string | null;
  options?: { value: string; position: number }[] | null;
}) => {
  if (!isDefined(selectFilter)) {
    return false;
  }

  if (Array.isArray(selectFilter)) {
    if (Array.isArray(value)) {
      return selectFilter.some((item) => value.includes(item));
    }
    return value !== null && selectFilter.includes(value);
  }

  if (typeof selectFilter === 'string') {
    if (Array.isArray(value)) {
      return value.includes(selectFilter);
    }
    return value === selectFilter;
  }

  if (Array.isArray(value)) {
    if (Array.isArray(selectFilter.in)) {
      return selectFilter.in.some((item) => value.includes(item));
    }
    if (isDefined(selectFilter.eq)) {
      return value.includes(selectFilter.eq);
    }
  }

  switch (true) {
    case selectFilter.in !== undefined: {
      if (Array.isArray(selectFilter.in)) {
        return value !== null && selectFilter.in.includes(value);
      }
      return value === selectFilter.in;
    }
    case (selectFilter as Record<string, unknown>).containsAny !== undefined: {
      const containsAny = (selectFilter as Record<string, unknown>).containsAny;
      if (Array.isArray(containsAny)) {
        if (Array.isArray(value)) {
          return containsAny.some((item) => value.includes(item));
        }
        return value !== null && containsAny.includes(value);
      }
      return false;
    }
    case (selectFilter as Record<string, unknown>).isEmptyArray !== undefined: {
      return false;
    }
    case selectFilter.is !== undefined: {
      if (selectFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case selectFilter.eq !== undefined: {
      return value === selectFilter.eq;
    }
    case selectFilter.neq !== undefined: {
      return value !== null && value !== selectFilter.neq;
    }
    case selectFilter.gt !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: selectFilter.gt,
        options,
      });

      return comparison !== null && comparison > 0;
    }
    case selectFilter.gte !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: selectFilter.gte,
        options,
      });

      return comparison !== null && comparison >= 0;
    }
    case selectFilter.lt !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: selectFilter.lt,
        options,
      });

      return comparison !== null && comparison < 0;
    }
    case selectFilter.lte !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: selectFilter.lte,
        options,
      });

      return comparison !== null && comparison <= 0;
    }
    default: {
      throw new Error(
        `Unexpected value for select filter : ${JSON.stringify(selectFilter)}`,
      );
    }
  }
};
