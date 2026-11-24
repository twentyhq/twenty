import { FORMULA_AGGREGATE_FUNCTIONS } from '@/constants/FormulaAggregateFunctions';
import { type FormulaAggregateFunctionName } from '@/types/FormulaAggregateFunctionName';

export const isFormulaAggregateFunctionName = (
  name: string,
): name is FormulaAggregateFunctionName =>
  Object.keys(FORMULA_AGGREGATE_FUNCTIONS).includes(name);
