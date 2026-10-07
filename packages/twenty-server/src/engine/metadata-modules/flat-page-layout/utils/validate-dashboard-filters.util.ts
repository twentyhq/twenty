import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  type DashboardFilterSlot,
  type FieldMetadataType,
  FILTERABLE_FIELD_TYPES,
  type FilterableFieldType,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  getFilterOperandsForFilterableFieldType,
  getFilterValueValidationIssue,
  isDefined,
  isPlainObject,
} from 'twenty-shared/utils';

import { PageLayoutExceptionCode } from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type DashboardFiltersValidationError = FlatEntityValidationError<
  typeof PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA
>;

// Slot ids end up as URL query keys and bindings keys
const SLOT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const SLOT_LABEL_MAX_LENGTH = 100;
const MAX_SLOT_COUNT = 20;

const FILTERABLE_FIELD_TYPE_SET: ReadonlySet<string> = new Set(
  FILTERABLE_FIELD_TYPES,
);

const VIEW_FILTER_OPERAND_SET: ReadonlySet<string> = new Set(
  Object.values(ViewFilterOperand),
);

const isFilterableFieldType = (
  filterType: unknown,
): filterType is FilterableFieldType =>
  isString(filterType) && FILTERABLE_FIELD_TYPE_SET.has(filterType);

const validateDashboardFilterSlotDefault = ({
  slot,
  filterType,
  index,
}: {
  slot: Partial<DashboardFilterSlot>;
  filterType: FilterableFieldType;
  index: number;
}): DashboardFiltersValidationError[] => {
  const { defaultOperand, defaultValue } = slot;

  if (!isDefined(defaultOperand)) {
    if (isDefined(defaultValue)) {
      return [
        {
          code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
          message: t`Dashboard filter at position ${index} has a default value but no default operand`,
          userFriendlyMessage: msg`A dashboard filter default value needs a default operand`,
          value: defaultValue,
        },
      ];
    }

    return [];
  }

  if (!VIEW_FILTER_OPERAND_SET.has(String(defaultOperand))) {
    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`Dashboard filter default operand "${String(defaultOperand)}" at position ${index} is not a known operand`,
        userFriendlyMessage: msg`A dashboard filter has an unknown default operand`,
        value: defaultOperand,
      },
    ];
  }

  const allowedOperands = getFilterOperandsForFilterableFieldType({
    filterType,
  });

  if (!allowedOperands.includes(defaultOperand)) {
    const allowedOperandsText = allowedOperands.join(', ');

    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`Dashboard filter default operand "${defaultOperand}" at position ${index} is not supported on filter type "${filterType}". Supported operands: ${allowedOperandsText}.`,
        userFriendlyMessage: msg`A dashboard filter default operand is not supported for its type`,
        value: defaultOperand,
      },
    ];
  }

  if (!isDefined(defaultValue)) {
    return [];
  }

  // Filterable field types share their literals with FieldMetadataType
  const issue = getFilterValueValidationIssue({
    fieldType: filterType as FieldMetadataType,
    operand: defaultOperand,
    value: defaultValue,
  });

  if (!isDefined(issue)) {
    return [];
  }

  return [
    {
      code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      message: isNonEmptyString(issue.hint)
        ? t`Dashboard filter default value "${issue.stringifiedValue}" at position ${index} is not valid for operand "${defaultOperand}" on filter type "${filterType}". ${issue.hint}`
        : t`Dashboard filter default value "${issue.stringifiedValue}" at position ${index} is not valid for operand "${defaultOperand}" on filter type "${filterType}".`,
      userFriendlyMessage: msg`A dashboard filter default value is not valid for its operand`,
      value: defaultValue,
    },
  ];
};

const validateDashboardFilterSlot = (
  slot: unknown,
  index: number,
): DashboardFiltersValidationError[] => {
  if (!isPlainObject(slot)) {
    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`Dashboard filter at position ${index} is not an object`,
        userFriendlyMessage: msg`A dashboard filter is malformed`,
        value: slot,
      },
    ];
  }

  const { id, label, filterType } = slot as Partial<DashboardFilterSlot>;
  const errors: DashboardFiltersValidationError[] = [];

  if (!isString(id) || !SLOT_ID_PATTERN.test(id)) {
    errors.push({
      code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      message: t`Dashboard filter id at position ${index} must be 1 to 64 letters, digits, "_" or "-"`,
      userFriendlyMessage: msg`A dashboard filter id is missing or malformed`,
      value: id,
    });
  }

  if (!isNonEmptyString(label)) {
    errors.push({
      code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      message: t`Dashboard filter at position ${index} has no label`,
      userFriendlyMessage: msg`A dashboard filter has no label`,
      value: label,
    });
  } else if (label.length > SLOT_LABEL_MAX_LENGTH) {
    errors.push({
      code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      message: t`Dashboard filter label at position ${index} exceeds ${SLOT_LABEL_MAX_LENGTH} characters`,
      userFriendlyMessage: msg`A dashboard filter label is too long`,
      value: label,
    });
  }

  if (!isFilterableFieldType(filterType)) {
    const allowedFilterTypes = FILTERABLE_FIELD_TYPES.join(', ');

    errors.push({
      code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      message: t`Dashboard filter type "${String(filterType)}" at position ${index} is not filterable. Allowed types: ${allowedFilterTypes}.`,
      userFriendlyMessage: msg`A dashboard filter has an unsupported type`,
      value: filterType,
    });

    return errors;
  }

  errors.push(
    ...validateDashboardFilterSlotDefault({
      slot: slot as Partial<DashboardFilterSlot>,
      filterType,
      index,
    }),
  );

  return errors;
};

export const validateDashboardFilters = ({
  dashboardFilters,
  pageLayoutType,
}: {
  dashboardFilters: DashboardFilterSlot[] | null | undefined;
  pageLayoutType: PageLayoutType;
}): DashboardFiltersValidationError[] => {
  if (!isDefined(dashboardFilters)) {
    return [];
  }

  if (pageLayoutType !== PageLayoutType.DASHBOARD) {
    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`Dashboard filters can only be set on a DASHBOARD page layout, not on a ${pageLayoutType} one`,
        userFriendlyMessage: msg`Only dashboards can have dashboard filters`,
        value: pageLayoutType,
      },
    ];
  }

  if (!Array.isArray(dashboardFilters)) {
    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`Dashboard filters must be an array`,
        userFriendlyMessage: msg`Dashboard filters must be a list`,
        value: dashboardFilters,
      },
    ];
  }

  if (dashboardFilters.length > MAX_SLOT_COUNT) {
    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`A dashboard can have at most ${MAX_SLOT_COUNT} dashboard filters`,
        userFriendlyMessage: msg`Too many dashboard filters`,
        value: dashboardFilters.length,
      },
    ];
  }

  const errors = dashboardFilters.flatMap(validateDashboardFilterSlot);

  const seenSlotIds = new Set<string>();

  for (const slot of dashboardFilters) {
    if (!isPlainObject(slot) || !isNonEmptyString(slot.id)) {
      continue;
    }

    if (seenSlotIds.has(slot.id)) {
      errors.push({
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`Dashboard filter id "${slot.id}" is used more than once`,
        userFriendlyMessage: msg`Dashboard filter ids must be unique`,
        value: slot.id,
      });
    }

    seenSlotIds.add(slot.id);
  }

  return errors;
};
