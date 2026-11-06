import { isUndefined } from '@sniptt/guards';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type PageLayoutFilter, PageLayoutType } from 'twenty-shared/types';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { sanitizePageLayoutFilters } from 'src/engine/metadata-modules/flat-page-layout/utils/sanitize-page-layout-filters.util';
import { type UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';

const sortPageLayoutFiltersById = (
  filters: PageLayoutFilter[] | null,
): PageLayoutFilter[] | null =>
  isDefined(filters)
    ? [...filters].sort((filterA, filterB) =>
        filterA.id.localeCompare(filterB.id),
      )
    : null;

export const getPageLayoutFiltersToSaveOrThrow = ({
  existingPageLayout,
  filtersInput,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  existingPageLayout: Pick<
    FlatPageLayout,
    'id' | 'type' | 'filters' | 'applicationUniversalIdentifier'
  >;
  filtersInput: UpdatePageLayoutWithTabsInput['filters'];
  workspaceCustomApplicationUniversalIdentifier: string;
}): FlatPageLayout['filters'] => {
  if (isUndefined(filtersInput)) {
    return existingPageLayout.filters;
  }

  const filters = sanitizePageLayoutFilters(filtersInput);

  if (
    fastDeepEqual(
      sortPageLayoutFiltersById(filters),
      sortPageLayoutFiltersById(
        sanitizePageLayoutFilters(existingPageLayout.filters),
      ),
    )
  ) {
    return existingPageLayout.filters;
  }

  const isDashboardInstalledByApplication =
    existingPageLayout.type === PageLayoutType.DASHBOARD &&
    ![
      workspaceCustomApplicationUniversalIdentifier,
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    ].includes(existingPageLayout.applicationUniversalIdentifier);

  if (isDashboardInstalledByApplication) {
    throw new PageLayoutException(
      `Filters of dashboard page layout "${existingPageLayout.id}" are defined by the application that installed it and cannot be changed`,
      PageLayoutExceptionCode.PAGE_LAYOUT_FILTERS_NOT_EDITABLE,
    );
  }

  return filters;
};
