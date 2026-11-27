import { type FORMULA_AGGREGATE_FUNCTION_NAMES } from '@/constants/FormulaAggregateFunctionNames';

export type FormulaAggregateFunctionName =
  (typeof FORMULA_AGGREGATE_FUNCTION_NAMES)[number];
