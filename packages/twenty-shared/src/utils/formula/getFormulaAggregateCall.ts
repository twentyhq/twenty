import { FORMULA_AGGREGATE_MAXIMUM_ARGUMENT_COUNT } from '@/constants/FormulaAggregateMaximumArgumentCount';
import { type FormulaAggregateCall } from '@/types/FormulaAggregateCall';
import { isFormulaAggregateFunctionName } from '@/utils/formula/isFormulaAggregateFunctionName';
import { isDefined } from '@/utils/validation/isDefined';

export const getFormulaAggregateCall = ({
  functionName,
  argumentPaths,
  getToManyRelationName,
}: {
  functionName: string;
  argumentPaths: (string | undefined)[];
  getToManyRelationName: (path: string) => string | undefined;
}): FormulaAggregateCall | undefined => {
  if (!isFormulaAggregateFunctionName(functionName)) {
    return undefined;
  }

  const [relationPath] = argumentPaths;
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
    argumentPaths.length > FORMULA_AGGREGATE_MAXIMUM_ARGUMENT_COUNT
  ) {
    return { isValid: false, functionName };
  }

  return { isValid: true, functionName, relationName };
};
