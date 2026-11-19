import { isString } from '@sniptt/guards';

import { COMPOSITE_FIELD_SUB_FIELD_NAMES } from '@/constants/CompositeFieldSubFieldNames';
import { CONDITIONAL_AVAILABILITY_SELECTED_RECORDS_VARIABLE_NAME } from '@/constants/ConditionalAvailabilitySelectedRecordsVariableName';
import { type ConditionalAvailabilityNode } from '@/types/ConditionalAvailabilityNode';
import { type ConditionalAvailabilityRecordQuantifier } from '@/types/ConditionalAvailabilityRecordQuantifier';
import { RecordFilterOperand } from '@/types/RecordFilterOperand';
import { isDefined } from '@/utils/validation/isDefined';

export const toConditionalAvailabilitySelectedRecordsNode = ({
  quantifier,
  callArguments,
}: {
  quantifier: ConditionalAvailabilityRecordQuantifier;
  callArguments: ConditionalAvailabilityNode[];
}): ConditionalAvailabilityNode | null => {
  const [recordsArgument, fieldArgument, operandArgument, valueArgument] =
    callArguments;

  if (
    callArguments.length < 3 ||
    callArguments.length > 4 ||
    recordsArgument?.type !== 'PATH' ||
    recordsArgument.path !==
      CONDITIONAL_AVAILABILITY_SELECTED_RECORDS_VARIABLE_NAME ||
    fieldArgument?.type !== 'LITERAL' ||
    !isString(fieldArgument.value) ||
    operandArgument?.type !== 'LITERAL'
  ) {
    return null;
  }

  const operand = Object.values(RecordFilterOperand).find(
    (recordFilterOperand) => recordFilterOperand === operandArgument.value,
  );

  if (!isDefined(operand)) {
    return null;
  }

  if (
    isDefined(valueArgument) &&
    (valueArgument.type !== 'LITERAL' || !isString(valueArgument.value))
  ) {
    return null;
  }

  const [fieldMetadataUniversalIdentifier = '', ...subFieldNameSegments] =
    fieldArgument.value.split('.');
  const subFieldNameText = subFieldNameSegments.join('.');
  const subFieldName = COMPOSITE_FIELD_SUB_FIELD_NAMES.find(
    (compositeFieldSubFieldName) =>
      compositeFieldSubFieldName === subFieldNameText,
  );

  if (subFieldNameSegments.length > 0 && !isDefined(subFieldName)) {
    return null;
  }

  return {
    type: 'SELECTED_RECORDS',
    quantifier,
    recordFilter: {
      fieldMetadataUniversalIdentifier,
      subFieldName: subFieldName ?? null,
      operand,
      value:
        valueArgument?.type === 'LITERAL' && isString(valueArgument.value)
          ? valueArgument.value
          : '',
    },
  };
};
