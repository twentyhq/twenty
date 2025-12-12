import { Temporal } from 'temporal-polyfill';

export const parseToPlainDateOrThrow = (stringDate: string) => {
  try {
    const parsedPlainDate = Temporal.Instant.from(stringDate)
      .toZonedDateTimeISO('UTC')
      .toPlainDate();

    return parsedPlainDate;
  } catch {
    //
  }

  try {
    const parsedPlainDate = Temporal.PlainDate.from(stringDate);

    return parsedPlainDate;
  } catch {
    //
  }

  throw new Error(`Cannot parse date string as PlainDate : "${stringDate}"`);
};
