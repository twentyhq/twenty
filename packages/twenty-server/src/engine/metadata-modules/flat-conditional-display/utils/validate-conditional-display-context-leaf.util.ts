import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalDisplayContextKey } from 'twenty-shared/types';
import {
  getConditionalDisplayContextVirtualField,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { type ConditionalDisplayContextLeafRecordFilter } from 'src/engine/metadata-modules/flat-conditional-display/types/conditional-display-context-leaf-record-filter.type';
import { validateConditionalDisplayContextLeafSelectOptions } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-conditional-display-context-leaf-select-options.util';
import { validateConditionalDisplayContextLeafSubFieldName } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-conditional-display-context-leaf-sub-field-name.util';
import { validateConditionalDisplaySelectedRecordPathLeaf } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-conditional-display-selected-record-path-leaf.util';
import { validateRecordFilterFieldLeaf } from 'src/engine/metadata-modules/flat-field-metadata/utils/validate-record-filter-field-leaf.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateConditionalDisplayContextLeaf = ({
  recordFilter,
  contextKey,
  invalidDataCode,
}: {
  recordFilter: ConditionalDisplayContextLeafRecordFilter;
  contextKey: ConditionalDisplayContextKey;
  invalidDataCode: string;
}): FlatEntityValidationError[] => {
  const subFieldNameErrors = validateConditionalDisplayContextLeafSubFieldName({
    subFieldName: recordFilter.subFieldName,
    contextKey,
    invalidDataCode,
  });

  if (isNonEmptyArray(subFieldNameErrors)) {
    return subFieldNameErrors;
  }

  if (contextKey === 'selectedRecords') {
    return validateConditionalDisplaySelectedRecordPathLeaf({
      recordFilter,
      contextKey,
      invalidDataCode,
    });
  }

  const virtualField = getConditionalDisplayContextVirtualField({
    contextKey,
    subFieldName: recordFilter.subFieldName,
  });

  if (!isDefined(virtualField)) {
    return [];
  }

  const fieldLeafErrors =
    validateRecordFilterFieldLeaf<FlatEntityValidationError>({
      recordFilter: {
        operand: recordFilter.operand,
        value: recordFilter.value,
      },
      filterField: virtualField,
      relationTargetField: undefined,
      buildUnsupportedOperandError: ({
        rawOperand,
        effectiveFieldType,
        allowedOperandsText,
      }) => ({
        code: invalidDataCode,
        message: t`Operand "${rawOperand}" is not supported on conditional display context key "${contextKey}" of type "${effectiveFieldType}". Supported operands: ${allowedOperandsText}.`,
        userFriendlyMessage: msg`Conditional display rule operand is not supported`,
        value: rawOperand,
      }),
      buildInvalidValueError: ({
        stringifiedValue,
        operand,
        filterType,
        hint,
      }) => ({
        code: invalidDataCode,
        message: isNonEmptyString(hint)
          ? t`Value "${stringifiedValue}" of conditional display context key "${contextKey}" is not valid for operand "${operand}" on type "${filterType}". ${hint}`
          : t`Value "${stringifiedValue}" of conditional display context key "${contextKey}" is not valid for operand "${operand}" on type "${filterType}".`,
        userFriendlyMessage: msg`Conditional display rule value is not valid for this operand`,
        value: recordFilter.value,
      }),
    });

  if (isNonEmptyArray(fieldLeafErrors)) {
    return fieldLeafErrors;
  }

  return validateConditionalDisplayContextLeafSelectOptions({
    recordFilter,
    virtualField,
    contextKey,
    invalidDataCode,
  });
};
