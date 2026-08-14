import { type SelectFilter } from '@/types';

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
  switch (true) {
    case selectFilter.in !== undefined: {
      return value !== null && selectFilter.in.includes(value);
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
