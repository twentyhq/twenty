import { type FORMULA_AGGREGATE_FUNCTIONS } from '@/constants/FormulaAggregateFunctions';

export type FormulaAggregateFunctionName =
  keyof typeof FORMULA_AGGREGATE_FUNCTIONS;
