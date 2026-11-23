import { type FormulaValue } from './FormulaValue';

export type FormulaEvaluator = (params: {
  record: Record<string, unknown>;
  now: string;
}) => FormulaValue;
