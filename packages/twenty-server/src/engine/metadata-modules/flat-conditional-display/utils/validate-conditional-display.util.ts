import { msg, t } from '@lingui/core/macro';
import { isArray, isString } from '@sniptt/guards';
import { CONDITIONAL_DISPLAY_CONTEXT_KEYS } from 'twenty-shared/constants';
import { type UniversalConditionalDisplay } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { CONDITIONAL_DISPLAY_SELECTED_RECORDS_MATCHES } from 'src/engine/metadata-modules/flat-conditional-display/constants/conditional-display-selected-records-matches.constant';
import { type ValidateConditionalDisplayContext } from 'src/engine/metadata-modules/flat-conditional-display/types/validate-conditional-display-context.type';
import { getConditionalDisplayPropertyOwner } from 'src/engine/metadata-modules/flat-conditional-display/utils/get-conditional-display-property-owner.util';
import { validateConditionalDisplayRecordFilter } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-conditional-display-record-filter.util';
import { validateConditionalDisplayRecordFilterGroups } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-conditional-display-record-filter-groups.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateConditionalDisplay = ({
  conditionalDisplay,
  ...context
}: {
  conditionalDisplay: unknown;
} & ValidateConditionalDisplayContext): FlatEntityValidationError[] => {
  if (!isDefined(conditionalDisplay)) {
    return [];
  }

  const { property, surface, invalidDataCode } = context;

  const formatError: FlatEntityValidationError = {
    code: invalidDataCode,
    message: t`Conditional display on ${surface} must be a rule with record filters`,
    userFriendlyMessage: msg`Conditional display format is not supported`,
    value: conditionalDisplay,
  };

  if (
    !isPlainObject(conditionalDisplay) ||
    !isArray(conditionalDisplay.recordFilters) ||
    !conditionalDisplay.recordFilters.every(isPlainObject)
  ) {
    return [formatError];
  }

  const rawRecordFilterGroups = conditionalDisplay.recordFilterGroups ?? [];

  if (
    !isArray(rawRecordFilterGroups) ||
    !rawRecordFilterGroups.every(
      (recordFilterGroup) =>
        isPlainObject(recordFilterGroup) && isString(recordFilterGroup.id),
    )
  ) {
    return [formatError];
  }

  const {
    recordFilters = [],
    recordFilterGroups = [],
    selectedRecordsMatch,
  } = conditionalDisplay as UniversalConditionalDisplay;

  const errors: FlatEntityValidationError[] = [];

  const isSelectedRecordsMatchAllowed =
    getConditionalDisplayPropertyOwner(property) === 'engine' &&
    CONDITIONAL_DISPLAY_CONTEXT_KEYS.selectedRecords.surfaces.includes(surface);

  if (isDefined(selectedRecordsMatch)) {
    if (!isSelectedRecordsMatchAllowed) {
      errors.push({
        code: invalidDataCode,
        message: t`Conditional display selected records match is not supported in ${property} on ${surface}`,
        userFriendlyMessage: msg`Conditional display selected records match is not available here`,
        value: selectedRecordsMatch,
      });
    } else if (
      !isString(selectedRecordsMatch) ||
      !Object.keys(CONDITIONAL_DISPLAY_SELECTED_RECORDS_MATCHES).includes(
        selectedRecordsMatch,
      )
    ) {
      errors.push({
        code: invalidDataCode,
        message: t`Conditional display selected records match "${selectedRecordsMatch}" is not supported`,
        userFriendlyMessage: msg`Conditional display selected records match is not valid`,
        value: selectedRecordsMatch,
      });
    }
  }

  errors.push(
    ...validateConditionalDisplayRecordFilterGroups({
      recordFilterGroups,
      invalidDataCode,
    }),
  );

  const recordFilterGroupIds = new Set(
    recordFilterGroups.map((recordFilterGroup) => recordFilterGroup.id),
  );

  errors.push(
    ...recordFilters.flatMap((recordFilter) =>
      validateConditionalDisplayRecordFilter({
        recordFilter,
        recordFilterGroupIds,
        context,
      }),
    ),
  );

  return errors;
};
