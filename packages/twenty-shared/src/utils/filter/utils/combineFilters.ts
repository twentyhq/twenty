import { type RecordGqlOperationFilter } from '@/types';

export const combineFilters = (
  filters: RecordGqlOperationFilter[],
): RecordGqlOperationFilter => {
  const nonEmptyFilters = filters.filter(
    (filter) => Object.keys(filter).length > 0,
  );

  if (nonEmptyFilters.length === 0) {
    return {};
  }

  if (nonEmptyFilters.length === 1) {
    return nonEmptyFilters[0];
  }

  return {
    and: nonEmptyFilters,
  };
};
