import { msg, t } from '@lingui/core/macro';
import { DASHBOARD_DATE_RANGE_FILTER_ID } from 'twenty-shared/constants';
import { PageLayoutFilterType, PageLayoutType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { PAGE_LAYOUT_FILTERS_SCHEMA } from 'src/engine/metadata-modules/flat-page-layout/constants/page-layout-filters-schema.constant';
import { VALUE_FORMAT_FIELD_TYPE_BY_PAGE_LAYOUT_FILTER_TYPE } from 'src/engine/metadata-modules/flat-page-layout/constants/value-format-field-type-by-page-layout-filter-type.constant';
import { validatePageLayoutFilterDefaultValue } from 'src/engine/metadata-modules/flat-page-layout/validators/utils/validate-page-layout-filter-default-value.util';
import { PageLayoutExceptionCode } from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type PageLayoutFilterValidationError =
  FlatEntityValidationError<PageLayoutExceptionCode>;

export const validatePageLayoutFilters = ({
  filters: rawFilters,
  type,
}: {
  filters: unknown;
  type: PageLayoutType;
}): PageLayoutFilterValidationError[] => {
  if (!isDefined(rawFilters)) {
    return [];
  }

  const parsedFilters = PAGE_LAYOUT_FILTERS_SCHEMA.safeParse(rawFilters);

  if (!parsedFilters.success) {
    return parsedFilters.error.issues.map(({ path, message: issue }) => {
      const issuePath = path.map(String).join('.');

      return {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: isNonEmptyArray(path)
          ? t`Dashboard filters are malformed at "${issuePath}": ${issue}`
          : t`Dashboard filters are malformed: ${issue}`,
        userFriendlyMessage: msg`Dashboard filters are malformed`,
      };
    });
  }

  const filters = parsedFilters.data;

  if (!isNonEmptyArray(filters)) {
    return [];
  }

  if (type !== PageLayoutType.DASHBOARD) {
    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`Filters are only supported on dashboard page layouts, not on "${type}"`,
        userFriendlyMessage: msg`Only dashboards can have filters`,
      },
    ];
  }

  const [filter] = filters;

  if (
    filters.length !== 1 ||
    filter.id !== DASHBOARD_DATE_RANGE_FILTER_ID ||
    filter.type !== PageLayoutFilterType.DATE
  ) {
    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`Dashboards only support the built-in Date range filter "${DASHBOARD_DATE_RANGE_FILTER_ID}"`,
        userFriendlyMessage: msg`Dashboards only support the Date range filter`,
      },
    ];
  }

  if (!isDefined(filter.defaultValue)) {
    return [];
  }

  return validatePageLayoutFilterDefaultValue({
    defaultValue: filter.defaultValue,
    valueFormatFieldType:
      VALUE_FORMAT_FIELD_TYPE_BY_PAGE_LAYOUT_FILTER_TYPE[filter.type],
    filterLabel: filter.label,
  });
};
