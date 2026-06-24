import { isValid, parse } from 'date-fns';
import { Temporal } from 'temporal-polyfill';

import { NON_ISO_DATE_FORMATS } from '@/utils/date/dateInputFormats';
import { turnJSDateToPlainDate } from '@/utils/date/turnJSDateToPlainDate';
import { isDefined } from '@/utils/validation';

const getIsoInstant = (stringDateTime: string): Temporal.Instant | null => {
  try {
    return Temporal.Instant.from(stringDateTime);
  } catch {
    try {
      return Temporal.PlainDateTime.from(stringDateTime)
        .toZonedDateTime('UTC')
        .toInstant();
    } catch {
      return null;
    }
  }
};

export const parseToInstantOrThrow = (
  stringDateTime: string,
): Temporal.Instant => {
  const isoInstant = getIsoInstant(stringDateTime);

  if (isDefined(isoInstant)) {
    return isoInstant;
  }

  for (const format of NON_ISO_DATE_FORMATS) {
    const parsedDate = parse(stringDateTime, format, new Date());

    if (isValid(parsedDate)) {
      return turnJSDateToPlainDate(parsedDate)
        .toZonedDateTime('UTC')
        .toInstant();
    }
  }

  throw new Error(
    `Cannot parse date-time string as Instant: "${stringDateTime}"`,
  );
};
