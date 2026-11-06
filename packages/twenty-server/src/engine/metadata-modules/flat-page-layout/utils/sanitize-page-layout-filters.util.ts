import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import { type PageLayoutFilter } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const sanitizePageLayoutFilters = (
  filters:
    | (Omit<PageLayoutFilter, 'defaultValue'> &
        Partial<Pick<PageLayoutFilter, 'defaultValue'>>)[]
    | null,
): PageLayoutFilter[] | null => {
  if (!isNonEmptyArray(filters)) {
    return null;
  }

  return filters.map(({ id, label, type, position, defaultValue }) => {
    const isBuiltInFilter = id === DASHBOARD_DATE_RANGE_FILTER.id;

    return {
      id,
      label: isBuiltInFilter ? DASHBOARD_DATE_RANGE_FILTER.label : label,
      type,
      position: isBuiltInFilter
        ? DASHBOARD_DATE_RANGE_FILTER.position
        : position,
      defaultValue: isDefined(defaultValue)
        ? {
            conditions: defaultValue.conditions.map(({ operand, value }) => ({
              operand,
              value,
            })),
          }
        : null,
    };
  });
};
