import { isValid, parse } from 'date-fns';
import { Temporal } from 'temporal-polyfill';

import { turnJSDateToPlainDate } from '@/utils/date/turnJSDateToPlainDate';
import { isDefined } from '@/utils/validation';

const NON_ISO_DATE_FORMATS = [
  'yyyy.MM.dd',
  'yyyy/MM/dd',
  'MM-dd-yyyy',
  'MM/dd/yyyy',
  'MM.dd.yyyy',
  'MMMM d, yyyy',
  'MMM d, yyyy',
  'd MMMM yyyy',
  'd MMM yyyy',
  'dd-MMM-yyyy',
  'yyyy-MMM-dd',
];

const tryParseInstant = (
  parseInstant: () => Temporal.Instant,
): Temporal.Instant | null => {
  try {
    return parseInstant();
  } catch {
    return null;
  }
};

export const parseToInstantOrThrow = (
  stringDateTime: string,
): Temporal.Instant => {
  const isoInstant =
    tryParseInstant(() => Temporal.Instant.from(stringDateTime)) ??
    tryParseInstant(() =>
      Temporal.PlainDateTime.from(stringDateTime)
        .toZonedDateTime('UTC')
        .toInstant(),
    );

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
