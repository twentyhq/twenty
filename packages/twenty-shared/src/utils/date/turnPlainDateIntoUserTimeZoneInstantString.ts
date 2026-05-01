import { type Temporal } from 'temporal-polyfill';

export const turnPlainDateIntoUserTimeZoneInstantString = (
  plainDate: Temporal.PlainDate,
  userTimeZone: string,
) => {
  try {
    return plainDate.toZonedDateTime(userTimeZone).toInstant().toString();
  } catch (error) {
    return plainDate.toZonedDateTime('UTC').toInstant().toString();
  }
};
