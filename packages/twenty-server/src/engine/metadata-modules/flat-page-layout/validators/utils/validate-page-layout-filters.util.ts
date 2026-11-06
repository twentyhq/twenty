import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type PageLayoutFilter, PageLayoutType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray, isValidUuid } from 'twenty-shared/utils';

import { PAGE_LAYOUT_FILTERS_SCHEMA } from 'src/engine/metadata-modules/flat-page-layout/constants/page-layout-filters-schema.constant';
import { VALUE_FORMAT_FIELD_TYPE_BY_PAGE_LAYOUT_FILTER_TYPE } from 'src/engine/metadata-modules/flat-page-layout/constants/value-format-field-type-by-page-layout-filter-type.constant';
import { validatePageLayoutFilterDefaultValue } from 'src/engine/metadata-modules/flat-page-layout/validators/utils/validate-page-layout-filter-default-value.util';
import { PageLayoutExceptionCode } from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type PageLayoutFilterValidationError =
  FlatEntityValidationError<PageLayoutExceptionCode>;

const validatePageLayoutFilter = ({
  filter: { id, label, type, defaultValue },
  isIdAlreadyUsed,
}: {
  filter: Omit<PageLayoutFilter, 'position'>;
  isIdAlreadyUsed: boolean;
}): PageLayoutFilterValidationError[] => {
  const errors: PageLayoutFilterValidationError[] = [];

  if (!isValidUuid(id)) {
    errors.push({
      code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      message: t`Dashboard filter id "${id}" is not a valid UUID`,
      userFriendlyMessage: msg`Dashboard filter id is not valid`,
      value: id,
    });
  }

  if (isIdAlreadyUsed) {
    errors.push({
      code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      message: t`Dashboard filter id "${id}" is used by more than one filter`,
      userFriendlyMessage: msg`Each dashboard filter must have its own id`,
      value: id,
    });
  }

  if (!isNonEmptyString(label.trim())) {
    errors.push({
      code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      message: t`Dashboard filter "${id}" has an empty label`,
      userFriendlyMessage: msg`Dashboard filter label cannot be empty`,
    });
  }

  if (!isDefined(defaultValue)) {
    return errors;
  }

  return [
    ...errors,
    ...validatePageLayoutFilterDefaultValue({
      defaultValue,
      valueFormatFieldType:
        VALUE_FORMAT_FIELD_TYPE_BY_PAGE_LAYOUT_FILTER_TYPE[type],
      filterLabel: label,
    }),
  ];
};

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

  const filterIds = filters.map(({ id }) => id);

  return filters.flatMap((filter, index) =>
    validatePageLayoutFilter({
      filter,
      isIdAlreadyUsed: filterIds.indexOf(filter.id) !== index,
    }),
  );
};
