import { type RecordGqlOperationFilter } from '@/types';
import { isDefined } from '@/utils/validation';

export const combineFilters = (
  filters: RecordGqlOperationFilter[],
): RecordGqlOperationFilter => {
  const nonEmptyFilters = filters.filter(
    (filter) => Object.keys(filter).length > 0,
  );

  const [firstFilter] = nonEmptyFilters;

  if (!isDefined(firstFilter)) {
    return {};
  }

  if (nonEmptyFilters.length === 1) {
    return firstFilter;
  }

  return {
    and: nonEmptyFilters,
  };
};
