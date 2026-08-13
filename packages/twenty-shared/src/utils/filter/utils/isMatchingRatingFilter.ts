import { type RatingFilter } from '@/types';

import { compareSelectOptionValues } from './compareSelectOptionValues';

export const isMatchingRatingFilter = ({
  ratingFilter,
  value,
  orderedOptionValues,
}: {
  ratingFilter: RatingFilter;
  value: string | null;
  orderedOptionValues?: string[];
}) => {
  switch (true) {
    case ratingFilter.eq !== undefined: {
      return value === ratingFilter.eq;
    }
    case ratingFilter.in !== undefined: {
      return value !== null && ratingFilter.in.includes(value);
    }
    case ratingFilter.is !== undefined: {
      if (ratingFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case ratingFilter.gt !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: ratingFilter.gt,
        orderedOptionValues,
      });

      return comparison !== null && comparison > 0;
    }
    case ratingFilter.gte !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: ratingFilter.gte,
        orderedOptionValues,
      });

      return comparison !== null && comparison >= 0;
    }
    case ratingFilter.lt !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: ratingFilter.lt,
        orderedOptionValues,
      });

      return comparison !== null && comparison < 0;
    }
    case ratingFilter.lte !== undefined: {
      const comparison = compareSelectOptionValues({
        value,
        comparisonValue: ratingFilter.lte,
        orderedOptionValues,
      });

      return comparison !== null && comparison <= 0;
    }
    default: {
      throw new Error(
        `Unexpected value for rating filter : ${JSON.stringify(ratingFilter)}`,
      );
    }
  }
};
