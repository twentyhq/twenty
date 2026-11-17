import { type ExpressionDate } from '@/types/ExpressionDate';

// Three fraction digits, as record values are stored, so text comparisons stay correct
export const formatExpressionDate = (expressionDate: ExpressionDate): string =>
  expressionDate.isDateOnly
    ? expressionDate.date.toString()
    : expressionDate.dateTime
        .toInstant()
        .toString({ fractionalSecondDigits: 3 });
