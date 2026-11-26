import { FORMULA_AGGREGATE_MAXIMUM_ARGUMENT_COUNT } from '@/constants/FormulaAggregateMaximumArgumentCount';
import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { type FormulaAggregateCall } from '@/types/FormulaAggregateCall';
import { isFormulaAggregateFunctionName } from '@/utils/formula/isFormulaAggregateFunctionName';
import { isDefined } from '@/utils/validation/isDefined';

export const getFormulaAggregateCall = ({
  callNode: { functionName, arguments: functionArguments },
  getToManyRelationName,
}: {
  callNode: Pick<
    Extract<ExpressionNode, { type: 'FUNCTION_CALL' }>,
    'functionName' | 'arguments'
  >;
  getToManyRelationName: (path: string) => string | undefined;
}): FormulaAggregateCall | undefined => {
  if (!isFormulaAggregateFunctionName(functionName)) {
    return undefined;
  }

  const [relationArgument] = functionArguments;
  const relationPath =
    relationArgument?.type === 'VARIABLE' ? relationArgument.path : undefined;
  const relationName = isDefined(relationPath)
    ? getToManyRelationName(relationPath)
    : undefined;

  if (
    !isDefined(relationName) &&
    (functionName === 'min' || functionName === 'max')
  ) {
    return undefined;
  }

  const isRelationArgumentValid =
    isDefined(relationName) &&
    (functionName === 'count'
      ? relationPath === relationName
      : relationPath !== relationName);

  if (
    !isDefined(relationName) ||
    !isRelationArgumentValid ||
    functionArguments.length > FORMULA_AGGREGATE_MAXIMUM_ARGUMENT_COUNT
  ) {
    return { isValid: false, functionName };
  }

  return { isValid: true, functionName, relationName };
};
