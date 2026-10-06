import { msg, t } from '@lingui/core/macro';
import { isBoolean, isString } from '@sniptt/guards';
import {
  DASHBOARD_FILTER_SLOT_FILTER_TYPES,
  type DashboardFilterSlot,
  type DashboardFilterSlotFilterType,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import {
  getFilterOperandsForFilterableFieldType,
  isDashboardFilterValueValidForSlot,
  isDefined,
  isPlainObject,
} from 'twenty-shared/utils';

import { PageLayoutExceptionCode } from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const buildError = (
  message: string,
  value?: unknown,
): FlatEntityValidationError => ({
  code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
  message,
  userFriendlyMessage: msg`Invalid dashboard filters.`,
  value,
});

// A whitespace-only id or label would render an unlabelled chip and collide with trimmed ids.
const isNonBlankString = (value: unknown): value is string =>
  isString(value) && value.trim().length > 0;

const isDashboardFilterSlotFilterType = (
  filterType: unknown,
): filterType is DashboardFilterSlotFilterType =>
  isString(filterType) &&
  (DASHBOARD_FILTER_SLOT_FILTER_TYPES as readonly string[]).includes(
    filterType,
  );

const validateDashboardFilterSlotDefaultValue = ({
  slot,
  defaultValue,
}: {
  slot: DashboardFilterSlot;
  defaultValue: unknown;
}): FlatEntityValidationError[] => {
  if (
    !isPlainObject(defaultValue) ||
    !isString(defaultValue.operand) ||
    !isString(defaultValue.value)
  ) {
    return [
      buildError(
        t`Dashboard filter "${slot.id}" default value must have a string operand and a string value`,
        defaultValue,
      ),
    ];
  }

  const allowedOperands = getFilterOperandsForFilterableFieldType({
    filterType: slot.filterType,
  });

  if (!allowedOperands.includes(defaultValue.operand as ViewFilterOperand)) {
    return [
      buildError(
        t`Dashboard filter "${slot.id}" default value operand "${defaultValue.operand}" is not allowed for filter type "${slot.filterType}"`,
        defaultValue,
      ),
    ];
  }

  if (
    !isDashboardFilterValueValidForSlot({
      slot,
      value: {
        operand: defaultValue.operand as ViewFilterOperand,
        value: defaultValue.value,
      },
    })
  ) {
    return [
      buildError(
        t`Dashboard filter "${slot.id}" default value is invalid for filter type "${slot.filterType}"`,
        defaultValue,
      ),
    ];
  }

  return [];
};

const validateDashboardFilterSlot = (
  slot: unknown,
  index: number,
): FlatEntityValidationError[] => {
  if (!isPlainObject(slot)) {
    return [
      buildError(t`Dashboard filter at index ${index} must be an object`, slot),
    ];
  }

  const errors: FlatEntityValidationError[] = [];

  if (!isNonBlankString(slot.id)) {
    errors.push(
      buildError(
        t`Dashboard filter at index ${index} must have a non-empty id`,
        slot,
      ),
    );
  }

  const slotId = isNonBlankString(slot.id) ? slot.id : String(index);

  if (!isNonBlankString(slot.label)) {
    errors.push(
      buildError(
        t`Dashboard filter "${slotId}" must have a non-empty label`,
        slot,
      ),
    );
  }

  if (!isDashboardFilterSlotFilterType(slot.filterType)) {
    errors.push(
      buildError(
        t`Dashboard filter "${slotId}" filter type must be one of ${DASHBOARD_FILTER_SLOT_FILTER_TYPES.join(', ')}`,
        slot,
      ),
    );
  }

  if (isDefined(slot.isRequired) && !isBoolean(slot.isRequired)) {
    errors.push(
      buildError(
        t`Dashboard filter "${slotId}" isRequired must be a boolean`,
        slot,
      ),
    );
  }

  if (
    isDefined(slot.defaultValue) &&
    isNonBlankString(slot.id) &&
    isNonBlankString(slot.label) &&
    isDashboardFilterSlotFilterType(slot.filterType)
  ) {
    errors.push(
      ...validateDashboardFilterSlotDefaultValue({
        slot: {
          id: slot.id,
          label: slot.label,
          filterType: slot.filterType,
        },
        defaultValue: slot.defaultValue,
      }),
    );
  }

  return errors;
};

// The column is fed by a GraphQLJSON input, so its declared type says nothing about what actually arrives.
export const validateDashboardFilterSlots = (
  dashboardFilters: unknown,
): FlatEntityValidationError[] => {
  if (!isDefined(dashboardFilters)) {
    return [];
  }

  if (!Array.isArray(dashboardFilters)) {
    return [
      buildError(t`Dashboard filters must be an array`, dashboardFilters),
    ];
  }

  const errors = dashboardFilters.flatMap(validateDashboardFilterSlot);

  const slotIds = dashboardFilters
    .filter(isPlainObject)
    .map((slot) => slot.id)
    .filter(isNonBlankString);

  const duplicatedSlotIds = [
    ...new Set(
      slotIds.filter((slotId, index) => slotIds.indexOf(slotId) !== index),
    ),
  ];

  if (duplicatedSlotIds.length > 0) {
    errors.push(
      buildError(
        t`Dashboard filter ids must be unique, found duplicates: ${duplicatedSlotIds.join(', ')}`,
        dashboardFilters,
      ),
    );
  }

  return errors;
};
