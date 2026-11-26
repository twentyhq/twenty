import { FORMULA_AGGREGATE_FUNCTION_NAMES } from '@/constants/FormulaAggregateFunctionNames';
import { type FormulaAggregateFunctionName } from '@/types/FormulaAggregateFunctionName';

export const isFormulaAggregateFunctionName = (
  name: string,
): name is FormulaAggregateFunctionName =>
  FORMULA_AGGREGATE_FUNCTION_NAMES.some(
    (functionName) => functionName === name,
  );
