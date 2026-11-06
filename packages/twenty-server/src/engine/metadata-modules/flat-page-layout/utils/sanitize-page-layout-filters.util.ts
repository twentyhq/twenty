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

  return filters.map(({ id, label, type, position, defaultValue }) => ({
    id,
    label,
    type,
    position,
    defaultValue: isDefined(defaultValue)
      ? {
          conditions: defaultValue.conditions.map(({ operand, value }) => ({
            operand,
            value,
          })),
        }
      : null,
  }));
};
