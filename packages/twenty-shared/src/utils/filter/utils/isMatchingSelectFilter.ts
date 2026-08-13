import { type SelectFilter } from '@/types';

import { compareSelectOptionValues } from './compareSelectOptionValues';

export const isMatchingSelectFilter = ({
  selectFilter,
  value,
  orderedOptionValues,
}: {
  selectFilter: SelectFilter;
  value: string;
  orderedOptionValues?: string[];
}) => {
  switch (true) {
    case selectFilter.in !== undefined: {
      return selectFilter.in.includes(value);
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
      return value !== selectFilter.neq;
    }
    case selectFilter.gt !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: selectFilter.gt,
        orderedOptionValues,
      });

      return comparison !== null && comparison > 0;
    }
    case selectFilter.gte !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: selectFilter.gte,
        orderedOptionValues,
      });

      return comparison !== null && comparison >= 0;
    }
    case selectFilter.lt !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: selectFilter.lt,
        orderedOptionValues,
      });

      return comparison !== null && comparison < 0;
    }
    case selectFilter.lte !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: selectFilter.lte,
        orderedOptionValues,
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
