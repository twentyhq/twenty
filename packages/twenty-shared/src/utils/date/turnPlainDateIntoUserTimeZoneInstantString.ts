import { type Temporal } from 'temporal-polyfill';

export const turnPlainDateIntoUserTimeZoneInstantString = (
  plainDate: Temporal.PlainDate,
  userTimeZone: string,
) => {
  return plainDate.toZonedDateTime(userTimeZone).toInstant().toString();
};
