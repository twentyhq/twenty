import { Temporal } from 'temporal-polyfill';

export const parseToInstantOrThrow = (
  stringDateTime: string,
): Temporal.Instant => {
  try {
    return Temporal.Instant.from(stringDateTime);
  } catch {
    return Temporal.PlainDateTime.from(stringDateTime)
      .toZonedDateTime('UTC')
      .toInstant();
  }
};
