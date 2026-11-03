import { msg, t } from '@lingui/core/macro';
import {
  isBoolean,
  isNonEmptyString,
  isNumber,
  isString,
} from '@sniptt/guards';
import { type ConditionalDisplayContextKey } from 'twenty-shared/types';
import { isDefined, isEmptinessOperand, parseJson } from 'twenty-shared/utils';

import { CONDITIONAL_DISPLAY_SELECTED_RECORD_PATH_OPERANDS } from 'src/engine/metadata-modules/flat-conditional-display/constants/conditional-display-selected-record-path-operands.constant';
import { type ConditionalDisplayContextLeafRecordFilter } from 'src/engine/metadata-modules/flat-conditional-display/types/conditional-display-context-leaf-record-filter.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateConditionalDisplaySelectedRecordPathLeaf = ({
  recordFilter: { operand, value: rawValue },
  contextKey,
  invalidDataCode,
}: {
  recordFilter: ConditionalDisplayContextLeafRecordFilter;
  contextKey: ConditionalDisplayContextKey;
  invalidDataCode: string;
}): FlatEntityValidationError[] => {
  const allowedOperand = CONDITIONAL_DISPLAY_SELECTED_RECORD_PATH_OPERANDS.find(
    (selectedRecordPathOperand) => selectedRecordPathOperand === operand,
  );

  if (!isDefined(allowedOperand)) {
    return [
      {
        code: invalidDataCode,
        message: t`Operand "${operand}" is not supported on conditional display context key "${contextKey}"`,
        userFriendlyMessage: msg`Conditional display rule operand is not supported`,
        value: operand,
      },
    ];
  }

  if (isEmptinessOperand(operand)) {
    if (!isNonEmptyString(rawValue)) {
      return [];
    }

    return [
      {
        code: invalidDataCode,
        message: t`Value "${rawValue}" of conditional display context key "${contextKey}" must be empty for operand "${operand}"`,
        userFriendlyMessage: msg`Conditional display rule value must be empty for this operand`,
        value: rawValue,
      },
    ];
  }

  const value = rawValue ?? '';

  const literalValue = parseJson<unknown>(value);

  if (
    isString(literalValue) ||
    isNumber(literalValue) ||
    isBoolean(literalValue)
  ) {
    return [];
  }

  return [
    {
      code: invalidDataCode,
      message: t`Value "${value}" of conditional display context key "${contextKey}" must be a JSON string, number or boolean`,
      userFriendlyMessage: msg`Conditional display rule value is not valid`,
      value,
    },
  ];
};
