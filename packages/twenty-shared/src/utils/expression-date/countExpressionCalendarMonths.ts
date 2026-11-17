import { type Temporal } from 'temporal-polyfill';

// Whole months from one calendar day to another, toward zero; SQL computes the same with EXTRACT
export const countExpressionCalendarMonths = ({
  from,
  to,
}: {
  from: Temporal.PlainDate;
  to: Temporal.PlainDate;
}): number => {
  const months = (to.year - from.year) * 12 + (to.month - from.month);

  if (months > 0 && to.day < from.day) {
    return months - 1;
  }

  if (months < 0 && to.day > from.day) {
    return months + 1;
  }

  return months;
};
