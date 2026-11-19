import { EXPRESSION_DATE_PARTS } from '@/constants/ExpressionDateParts';
import { type ExpressionDatePart } from '@/types/ExpressionDatePart';

export const isExpressionDatePart = (
  value: unknown,
): value is ExpressionDatePart =>
  EXPRESSION_DATE_PARTS.some((part) => part === value);
