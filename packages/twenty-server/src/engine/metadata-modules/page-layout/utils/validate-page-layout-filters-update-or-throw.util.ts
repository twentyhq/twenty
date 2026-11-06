import { type PageLayoutFilter } from 'twenty-shared/types';
import { fastDeepEqual } from 'twenty-shared/utils';

import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { sanitizePageLayoutFilters } from 'src/engine/metadata-modules/flat-page-layout/utils/sanitize-page-layout-filters.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';

export const validatePageLayoutFiltersUpdateOrThrow = ({
  existingPageLayout,
  filters,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  existingPageLayout: Pick<
    FlatPageLayout,
    'id' | 'filters' | 'applicationUniversalIdentifier' | 'isSystemSideEffect'
  >;
  filters: PageLayoutFilter[] | null;
  workspaceCustomApplicationUniversalIdentifier: string;
}): void => {
  const isCallerOverridingPageLayout = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier:
      workspaceCustomApplicationUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      existingPageLayout.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    isSystemSideEffect: existingPageLayout.isSystemSideEffect,
  });

  if (
    !isCallerOverridingPageLayout ||
    fastDeepEqual(
      sanitizePageLayoutFilters(existingPageLayout.filters),
      sanitizePageLayoutFilters(filters),
    )
  ) {
    return;
  }

  throw new PageLayoutException(
    `Filters of page layout "${existingPageLayout.id}" are defined by its application and cannot be changed`,
    PageLayoutExceptionCode.PAGE_LAYOUT_FILTERS_NOT_EDITABLE,
  );
};
