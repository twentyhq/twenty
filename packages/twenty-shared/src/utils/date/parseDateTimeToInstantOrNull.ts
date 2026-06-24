import { Temporal } from 'temporal-polyfill';

const tryParseInstant = (
  parse: () => Temporal.Instant,
): Temporal.Instant | null => {
  try {
    return parse();
  } catch {
    return null;
  }
};

export const parseDateTimeToInstantOrNull = (
  value: string,
): Temporal.Instant | null =>
  tryParseInstant(() => Temporal.Instant.from(value)) ??
  tryParseInstant(() =>
    Temporal.PlainDateTime.from(value).toZonedDateTime('UTC').toInstant(),
  );
