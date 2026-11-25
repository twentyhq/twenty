import { EXPRESSION_DATE_UNITS } from '@/constants/ExpressionDateUnits';
import { type ExpressionDateUnit } from '@/types/ExpressionDateUnit';

export const isExpressionDateUnit = (
  value: unknown,
): value is ExpressionDateUnit =>
  EXPRESSION_DATE_UNITS.some((unit) => unit === value);
