import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type DashboardFilterSlot,
  FILTERABLE_FIELD_TYPES,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const INVALID_PAGE_LAYOUT_DATA = 'INVALID_PAGE_LAYOUT_DATA' as const;

type DashboardFiltersValidationError = FlatEntityValidationError<
  typeof INVALID_PAGE_LAYOUT_DATA
>;

const FILTERABLE_FIELD_TYPE_SET: ReadonlySet<string> = new Set(
  FILTERABLE_FIELD_TYPES,
);

const VIEW_FILTER_OPERAND_SET: ReadonlySet<string> = new Set(
  Object.values(ViewFilterOperand),
);

const validateDashboardFilterSlot = (
  slot: unknown,
  index: number,
): DashboardFiltersValidationError[] => {
  if (!isPlainObject(slot)) {
    return [
      {
        code: INVALID_PAGE_LAYOUT_DATA,
        message: t`Dashboard filter at position ${index} is not an object`,
        userFriendlyMessage: msg`A dashboard filter is malformed`,
        value: slot,
      },
    ];
  }

  const { id, label, filterType, defaultOperand } =
    slot as Partial<DashboardFilterSlot>;
  const errors: DashboardFiltersValidationError[] = [];

  if (!isNonEmptyString(id)) {
    errors.push({
      code: INVALID_PAGE_LAYOUT_DATA,
      message: t`Dashboard filter at position ${index} has no id`,
      userFriendlyMessage: msg`A dashboard filter has no id`,
      value: id,
    });
  }

  if (!isNonEmptyString(label)) {
    errors.push({
      code: INVALID_PAGE_LAYOUT_DATA,
      message: t`Dashboard filter at position ${index} has no label`,
      userFriendlyMessage: msg`A dashboard filter has no label`,
      value: label,
    });
  }

  if (
    !isNonEmptyString(filterType) ||
    !FILTERABLE_FIELD_TYPE_SET.has(filterType)
  ) {
    const allowedFilterTypes = FILTERABLE_FIELD_TYPES.join(', ');

    errors.push({
      code: INVALID_PAGE_LAYOUT_DATA,
      message: t`Dashboard filter type "${String(filterType)}" at position ${index} is not filterable. Allowed types: ${allowedFilterTypes}.`,
      userFriendlyMessage: msg`A dashboard filter has an unsupported type`,
      value: filterType,
    });
  }

  if (
    isDefined(defaultOperand) &&
    !VIEW_FILTER_OPERAND_SET.has(String(defaultOperand))
  ) {
    errors.push({
      code: INVALID_PAGE_LAYOUT_DATA,
      message: t`Dashboard filter default operand "${String(defaultOperand)}" at position ${index} is not a known operand`,
      userFriendlyMessage: msg`A dashboard filter has an unknown default operand`,
      value: defaultOperand,
    });
  }

  return errors;
};

export const validateDashboardFilters = (
  dashboardFilters: DashboardFilterSlot[] | null | undefined,
): DashboardFiltersValidationError[] => {
  if (!isDefined(dashboardFilters)) {
    return [];
  }

  if (!Array.isArray(dashboardFilters)) {
    return [
      {
        code: INVALID_PAGE_LAYOUT_DATA,
        message: t`Dashboard filters must be an array`,
        userFriendlyMessage: msg`Dashboard filters must be a list`,
        value: dashboardFilters,
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
        code: INVALID_PAGE_LAYOUT_DATA,
        message: t`Dashboard filter id "${slot.id}" is used more than once`,
        userFriendlyMessage: msg`Dashboard filter ids must be unique`,
        value: slot.id,
      });
    }

    seenSlotIds.add(slot.id);
  }

  return errors;
};
