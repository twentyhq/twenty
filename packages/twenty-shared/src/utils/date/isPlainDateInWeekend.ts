import { type Temporal } from 'temporal-polyfill';

export const isPlainDateInWeekend = (plainDate: Temporal.PlainDate) => {
  return plainDate.dayOfWeek > 5;
};
