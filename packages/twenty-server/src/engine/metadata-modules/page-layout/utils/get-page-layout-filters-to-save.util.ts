import { isUndefined } from '@sniptt/guards';
import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import { PageLayoutType } from 'twenty-shared/types';
import {
  fastDeepEqual,
  getEffectiveDashboardPageLayoutFilters,
} from 'twenty-shared/utils';

import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { sanitizePageLayoutFilters } from 'src/engine/metadata-modules/flat-page-layout/utils/sanitize-page-layout-filters.util';
import { type UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';

export const getPageLayoutFiltersToSave = ({
  existingFilters,
  pageLayoutType,
  filtersInput,
}: {
  existingFilters: FlatPageLayout['filters'];
  pageLayoutType: PageLayoutType;
  filtersInput: UpdatePageLayoutWithTabsInput['filters'];
}): FlatPageLayout['filters'] => {
  if (isUndefined(filtersInput)) {
    return existingFilters;
  }

  const filters = sanitizePageLayoutFilters(filtersInput);

  const isDashboard = pageLayoutType === PageLayoutType.DASHBOARD;

  const effectiveExistingFilters = isDashboard
    ? getEffectiveDashboardPageLayoutFilters(existingFilters)
    : existingFilters;

  if (
    fastDeepEqual(filters, sanitizePageLayoutFilters(effectiveExistingFilters))
  ) {
    return existingFilters;
  }

  // One representation for "no default": the database never holds the virtual built-in filter
  if (isDashboard && fastDeepEqual(filters, [DASHBOARD_DATE_RANGE_FILTER])) {
    return null;
  }

  return filters;
};
