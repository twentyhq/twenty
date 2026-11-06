import { DASHBOARD_DATE_RANGE_FILTER } from '@/constants/DashboardDateRangeFilter';
import { type PageLayoutFilter } from '@/types';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';

export const getEffectiveDashboardPageLayoutFilters = (
  filters: PageLayoutFilter[] | null | undefined,
): PageLayoutFilter[] =>
  isNonEmptyArray(filters) ? filters : [DASHBOARD_DATE_RANGE_FILTER];
