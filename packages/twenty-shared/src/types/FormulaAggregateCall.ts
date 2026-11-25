import { type FormulaAggregateFunctionName } from '@/types/FormulaAggregateFunctionName';

export type FormulaAggregateCall =
  | {
      isValid: true;
      functionName: FormulaAggregateFunctionName;
      relationName: string;
    }
  | { isValid: false; functionName: FormulaAggregateFunctionName };
