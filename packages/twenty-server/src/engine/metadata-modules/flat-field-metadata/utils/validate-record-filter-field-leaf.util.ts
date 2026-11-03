import { type FieldMetadataType } from 'twenty-shared/types';
import {
  type FilterValueValidationIssue,
  getFilterOperandsForFilterableFieldType,
  getFilterTypeFromFieldType,
  getFilterValueValidationIssue,
  isDefined,
} from 'twenty-shared/utils';

import { getEffectiveFilterFieldType } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-effective-filter-field-type.util';

export const validateRecordFilterFieldLeaf = <TValidationError>({
  recordFilter: { operand: rawOperand, subFieldName, value },
  filterField,
  relationTargetField,
  buildUnsupportedOperandError,
  buildInvalidValueError,
}: {
  recordFilter: {
    operand: string;
    subFieldName?: string | null;
    value?: string | null;
  };
  filterField: { type: FieldMetadataType };
  relationTargetField: { type: FieldMetadataType } | undefined;
  buildUnsupportedOperandError: (unsupportedOperand: {
    rawOperand: string;
    effectiveFieldType: FieldMetadataType;
    allowedOperandsText: string;
  }) => TValidationError;
  buildInvalidValueError: (
    issue: FilterValueValidationIssue,
  ) => TValidationError;
}): TValidationError[] => {
  const effectiveFieldType = getEffectiveFilterFieldType({
    fieldType: filterField.type,
    relationTargetFieldType: relationTargetField?.type,
  });

  const allowedOperands = getFilterOperandsForFilterableFieldType({
    filterType: getFilterTypeFromFieldType(effectiveFieldType),
    subFieldName,
  });

  const operand = allowedOperands.find(
    (allowedOperand) => allowedOperand === rawOperand,
  );

  if (!isDefined(operand)) {
    return [
      buildUnsupportedOperandError({
        rawOperand,
        effectiveFieldType,
        allowedOperandsText: allowedOperands.join(', '),
      }),
    ];
  }

  const issue = getFilterValueValidationIssue({
    fieldType: effectiveFieldType,
    operand,
    subFieldName,
    value,
  });

  if (!isDefined(issue)) {
    return [];
  }

  return [buildInvalidValueError(issue)];
};
