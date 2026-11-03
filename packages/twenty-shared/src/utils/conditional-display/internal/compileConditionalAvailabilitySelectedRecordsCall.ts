import { isNonEmptyString } from '@sniptt/guards';

import { type ConditionalDisplaySelectedRecordsMatch } from '@/types/conditional-display/ConditionalDisplaySelectedRecordsMatch';
import { type ConditionalAvailabilityCompiledItem } from '@/types/conditional-display/internal/ConditionalAvailabilityCompiledItem';
import { type ConditionalDisplayRecordFilterConditionNode } from '@/types/conditional-display/internal/ConditionalDisplayRecordFilterConditionNode';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { buildConditionalAvailabilityCompilationError } from '@/utils/conditional-display/internal/buildConditionalAvailabilityCompilationError';
import { buildConditionalDisplayContextConditionNode } from '@/utils/conditional-display/internal/buildConditionalDisplayContextConditionNode';
import { describeConditionalAvailabilityCompiledItem } from '@/utils/conditional-display/internal/describeConditionalAvailabilityCompiledItem';
import { isDefined } from '@/utils/validation/isDefined';

const LENGTH_PATH_SUFFIX = '.length';

export const compileConditionalAvailabilitySelectedRecordsCall = ({
  functionName,
  selectedRecordsMatch,
  operand,
  functionArguments,
  expression,
}: {
  functionName: string;
  selectedRecordsMatch: ConditionalDisplaySelectedRecordsMatch;
  operand: ViewFilterOperand;
  functionArguments: ConditionalAvailabilityCompiledItem[];
  expression: string;
}): ConditionalDisplayRecordFilterConditionNode | undefined => {
  const [records, path, value] = functionArguments;
  const hasValueArgument =
    operand !== ViewFilterOperand.IS_EMPTY &&
    operand !== ViewFilterOperand.IS_NOT_EMPTY;

  if (records?.kind !== 'reference' || records.name !== 'selectedRecords') {
    throw buildConditionalAvailabilityCompilationError({
      expression,
      reason: `${functionName} over ${isDefined(records) ? describeConditionalAvailabilityCompiledItem(records) : 'nothing'}: ${functionName} only accepts selectedRecords as its first argument`,
    });
  }

  if (path?.kind !== 'literal' || !isNonEmptyString(path.value)) {
    throw buildConditionalAvailabilityCompilationError({
      expression,
      reason: `${functionName} needs a record field path string as its second argument`,
    });
  }

  if (
    functionArguments.length !== (hasValueArgument ? 3 : 2) ||
    (hasValueArgument && value?.kind !== 'literal')
  ) {
    return undefined;
  }

  const subFieldName =
    ['every', 'some', 'none'].includes(functionName) &&
    path.value.endsWith(LENGTH_PATH_SUFFIX)
      ? path.value.slice(0, -LENGTH_PATH_SUFFIX.length)
      : path.value;

  return buildConditionalDisplayContextConditionNode(
    { contextKey: 'selectedRecords', subFieldName },
    operand,
    value?.kind === 'literal' ? JSON.stringify(value.value) : undefined,
    selectedRecordsMatch,
  );
};
