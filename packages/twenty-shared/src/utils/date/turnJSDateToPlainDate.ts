import { Temporal } from 'temporal-polyfill';

export const turnJSDateToPlainDate = (date: Date) => {
  const plainDate = Temporal.PlainDate.from({
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  });

  return plainDate;
};
