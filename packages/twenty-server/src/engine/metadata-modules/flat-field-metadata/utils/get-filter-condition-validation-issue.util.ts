import {
  type FieldMetadataType,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import {
  type FilterValueValidationIssue,
  getFilterOperandsForFilterableFieldType,
  getFilterTypeFromFieldType,
  getFilterValueValidationIssue,
  isDefined,
} from 'twenty-shared/utils';

export type FilterConditionValidationIssue =
  | {
      kind: 'UNSUPPORTED_OPERAND';
      allowedOperands: readonly ViewFilterOperand[];
    }
  | ({ kind: 'INVALID_VALUE' } & FilterValueValidationIssue);

export const getFilterConditionValidationIssue = ({
  fieldType,
  operand: rawOperand,
  subFieldName,
  value,
}: {
  fieldType: FieldMetadataType;
  operand: string;
  subFieldName?: string | null;
  value: unknown;
}): FilterConditionValidationIssue | undefined => {
  const allowedOperands = getFilterOperandsForFilterableFieldType({
    filterType: getFilterTypeFromFieldType(fieldType),
    subFieldName,
  });

  const operand = allowedOperands.find(
    (allowedOperand) => allowedOperand === rawOperand,
  );

  if (!isDefined(operand)) {
    return { kind: 'UNSUPPORTED_OPERAND', allowedOperands };
  }

  const valueIssue = getFilterValueValidationIssue({
    fieldType,
    operand,
    subFieldName,
    value,
  });

  if (!isDefined(valueIssue)) {
    return undefined;
  }

  return { kind: 'INVALID_VALUE', ...valueIssue };
};
